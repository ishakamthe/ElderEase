"""
ElderEase - Flask Application Backend
Provides RESTful APIs for Appointments, Nutrition Tracking, and ElderEase Dashboard.
Serves the accessible elder-friendly single-page web interface.
"""
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from datetime import datetime, date
import os
import sqlite3

from database import get_db_connection, init_db

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

# Ensure database is initialized on startup
init_db()


# -------------------------------------------------------------
# Frontend Routes
# -------------------------------------------------------------
@app.route("/")
def index():
    """Renders the main elder-friendly ElderEase interface."""
    return render_template("index.html")


@app.route("/api/health")
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "healthy", "app": "ElderEase Review 1 MVP"})


# -------------------------------------------------------------
# Appointments CRUD API
# -------------------------------------------------------------
@app.route("/api/appointments", methods=["GET"])
def get_appointments():
    """
    Get all appointments for the senior user.
    Supports optional query filters:
      - ?month=YYYY-MM (e.g., 2026-10)
      - ?date=YYYY-MM-DD
    """
    month_filter = request.args.get("month")
    date_filter = request.args.get("date")

    conn = get_db_connection()
    cursor = conn.cursor()

    if date_filter:
        cursor.execute(
            "SELECT * FROM appointments WHERE user_id = 'senior_1' AND date = ? ORDER BY time ASC",
            (date_filter,)
        )
    elif month_filter:
        cursor.execute(
            "SELECT * FROM appointments WHERE user_id = 'senior_1' AND date LIKE ? ORDER BY date ASC, time ASC",
            (f"{month_filter}%",)
        )
    else:
        cursor.execute(
            "SELECT * FROM appointments WHERE user_id = 'senior_1' ORDER BY date ASC, time ASC"
        )

    rows = cursor.fetchall()
    conn.close()

    appointments = [dict(row) for row in rows]
    return jsonify(appointments)


@app.route("/api/appointments/<int:app_id>", methods=["GET"])
def get_appointment(app_id):
    """Retrieve a single appointment by ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM appointments WHERE id = ? AND user_id = 'senior_1'", (app_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return jsonify({"error": "Appointment not found"}), 404

    return jsonify(dict(row))


@app.route("/api/appointments", methods=["POST"])
def create_appointment():
    """Create a new appointment with validation."""
    data = request.get_json() or {}

    doctor_name = (data.get("doctor_name") or "").strip()
    hospital = (data.get("hospital") or "").strip()
    app_date = (data.get("date") or "").strip()
    app_time = (data.get("time") or "").strip()
    reason = (data.get("reason") or "").strip()
    notes = (data.get("notes") or "").strip()

    # Validation
    errors = []
    if not doctor_name:
        errors.append("Doctor's name is required.")
    if not hospital:
        errors.append("Hospital or clinic name is required.")
    if not app_date:
        errors.append("Appointment date is required.")
    if not app_time:
        errors.append("Appointment time is required.")
    if not reason:
        errors.append("Reason for appointment is required.")

    if errors:
        return jsonify({"error": "Validation failed", "details": errors}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO appointments (user_id, doctor_name, hospital, date, time, reason, notes)
        VALUES ('senior_1', ?, ?, ?, ?, ?, ?)
    """, (doctor_name, hospital, app_date, app_time, reason, notes))
    new_id = cursor.lastrowid
    conn.commit()

    cursor.execute("SELECT * FROM appointments WHERE id = ?", (new_id,))
    new_app = dict(cursor.fetchone())
    conn.close()

    return jsonify({
        "success": True,
        "message": "Appointment scheduled successfully!",
        "appointment": new_app
    }), 201


@app.route("/api/appointments/<int:app_id>", methods=["PUT"])
def update_appointment(app_id):
    """Update an existing appointment."""
    data = request.get_json() or {}

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM appointments WHERE id = ? AND user_id = 'senior_1'", (app_id,))
    existing = cursor.fetchone()

    if not existing:
        conn.close()
        return jsonify({"error": "Appointment not found"}), 404

    doctor_name = (data.get("doctor_name") or existing["doctor_name"]).strip()
    hospital = (data.get("hospital") or existing["hospital"]).strip()
    app_date = (data.get("date") or existing["date"]).strip()
    app_time = (data.get("time") or existing["time"]).strip()
    reason = (data.get("reason") or existing["reason"]).strip()
    notes = data.get("notes") if "notes" in data else existing["notes"]

    if not doctor_name or not hospital or not app_date or not app_time or not reason:
        conn.close()
        return jsonify({"error": "All fields except notes are required."}), 400

    cursor.execute("""
        UPDATE appointments
        SET doctor_name = ?, hospital = ?, date = ?, time = ?, reason = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = 'senior_1'
    """, (doctor_name, hospital, app_date, app_time, reason, notes, app_id))
    conn.commit()

    cursor.execute("SELECT * FROM appointments WHERE id = ?", (app_id,))
    updated_app = dict(cursor.fetchone())
    conn.close()

    return jsonify({
        "success": True,
        "message": "Appointment updated successfully!",
        "appointment": updated_app
    })


@app.route("/api/appointments/<int:app_id>", methods=["DELETE"])
def delete_appointment(app_id):
    """Delete an appointment by ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM appointments WHERE id = ? AND user_id = 'senior_1'", (app_id,))
    existing = cursor.fetchone()

    if not existing:
        conn.close()
        return jsonify({"error": "Appointment not found"}), 404

    cursor.execute("DELETE FROM appointments WHERE id = ? AND user_id = 'senior_1'", (app_id,))
    conn.commit()
    conn.close()

    return jsonify({"success": True, "message": "Appointment cancelled successfully."})


# -------------------------------------------------------------
# Nutrition & Water Tracker API
# -------------------------------------------------------------
@app.route("/api/nutrition", methods=["GET"])
def get_nutrition():
    """
    Get nutrition for a given date (defaults to today: YYYY-MM-DD).
    If no entry exists for that date, creates a default entry.
    """
    req_date = request.args.get("date") or date.today().strftime("%Y-%m-%d")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM nutrition WHERE user_id = 'senior_1' AND date = ?", (req_date,))
    row = cursor.fetchone()

    if not row:
        # Create default empty row for this day
        cursor.execute("""
            INSERT INTO nutrition (
                user_id, date, breakfast, breakfast_notes,
                lunch, lunch_notes, dinner, dinner_notes,
                snacks, snacks_notes, water_glasses, target_water
            ) VALUES ('senior_1', ?, 0, '', 0, '', 0, '', 0, '', 0, 8)
        """, (req_date,))
        conn.commit()
        cursor.execute("SELECT * FROM nutrition WHERE user_id = 'senior_1' AND date = ?", (req_date,))
        row = cursor.fetchone()

    data = dict(row)
    conn.close()
    return jsonify(data)


@app.route("/api/nutrition", methods=["PUT", "POST"])
def update_nutrition():
    """Update meal statuses and water glasses for a specific date."""
    data = request.get_json() or {}
    req_date = data.get("date") or date.today().strftime("%Y-%m-%d")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM nutrition WHERE user_id = 'senior_1' AND date = ?", (req_date,))
    existing = cursor.fetchone()

    if not existing:
        cursor.execute("""
            INSERT INTO nutrition (
                user_id, date, breakfast, breakfast_notes,
                lunch, lunch_notes, dinner, dinner_notes,
                snacks, snacks_notes, water_glasses, target_water
            ) VALUES ('senior_1', ?, 0, '', 0, '', 0, '', 0, '', 0, 8)
        """, (req_date,))
        conn.commit()
        cursor.execute("SELECT * FROM nutrition WHERE user_id = 'senior_1' AND date = ?", (req_date,))
        existing = cursor.fetchone()

    # Extract update fields or keep existing
    breakfast = int(data.get("breakfast", existing["breakfast"]))
    breakfast_notes = data.get("breakfast_notes", existing["breakfast_notes"])
    lunch = int(data.get("lunch", existing["lunch"]))
    lunch_notes = data.get("lunch_notes", existing["lunch_notes"])
    dinner = int(data.get("dinner", existing["dinner"]))
    dinner_notes = data.get("dinner_notes", existing["dinner_notes"])
    snacks = int(data.get("snacks", existing["snacks"]))
    snacks_notes = data.get("snacks_notes", existing["snacks_notes"])
    water_glasses = max(0, min(20, int(data.get("water_glasses", existing["water_glasses"]))))
    target_water = int(data.get("target_water", existing["target_water"]))

    cursor.execute("""
        UPDATE nutrition
        SET breakfast = ?, breakfast_notes = ?,
            lunch = ?, lunch_notes = ?,
            dinner = ?, dinner_notes = ?,
            snacks = ?, snacks_notes = ?,
            water_glasses = ?, target_water = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = 'senior_1' AND date = ?
    """, (
        breakfast, breakfast_notes,
        lunch, lunch_notes,
        dinner, dinner_notes,
        snacks, snacks_notes,
        water_glasses, target_water,
        req_date
    ))
    conn.commit()

    cursor.execute("SELECT * FROM nutrition WHERE user_id = 'senior_1' AND date = ?", (req_date,))
    updated_data = dict(cursor.fetchone())
    conn.close()

    return jsonify({
        "success": True,
        "message": "Nutrition log updated!",
        "nutrition": updated_data
    })


@app.route("/api/nutrition/water", methods=["POST"])
def adjust_water():
    """
    Quick adjustment of water intake: delta can be +1 or -1.
    """
    data = request.get_json() or {}
    req_date = data.get("date") or date.today().strftime("%Y-%m-%d")
    delta = int(data.get("delta", 1))

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM nutrition WHERE user_id = 'senior_1' AND date = ?", (req_date,))
    existing = cursor.fetchone()

    if not existing:
        current_water = 0
        cursor.execute("""
            INSERT INTO nutrition (
                user_id, date, breakfast, breakfast_notes,
                lunch, lunch_notes, dinner, dinner_notes,
                snacks, snacks_notes, water_glasses, target_water
            ) VALUES ('senior_1', ?, 0, '', 0, '', 0, '', 0, '', 0, 8)
        """, (req_date,))
        conn.commit()
    else:
        current_water = existing["water_glasses"]

    new_water = max(0, min(20, current_water + delta))

    cursor.execute("""
        UPDATE nutrition
        SET water_glasses = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = 'senior_1' AND date = ?
    """, (new_water, req_date))
    conn.commit()

    cursor.execute("SELECT * FROM nutrition WHERE user_id = 'senior_1' AND date = ?", (req_date,))
    updated_data = dict(cursor.fetchone())
    conn.close()

    return jsonify({
        "success": True,
        "water_glasses": new_water,
        "nutrition": updated_data
    })


# -------------------------------------------------------------
# Home Dashboard Summary API
# -------------------------------------------------------------
@app.route("/api/dashboard-summary", methods=["GET"])
def get_dashboard_summary():
    """
    Returns aggregated summary data for the home dashboard:
      - Nearest upcoming appointment
      - Today's nutrition & hydration numbers
      - Quick stats
    """
    today_str = date.today().strftime("%Y-%m-%d")

    conn = get_db_connection()
    cursor = conn.cursor()

    # Find the nearest upcoming appointment from today onwards
    cursor.execute("""
        SELECT * FROM appointments
        WHERE user_id = 'senior_1' AND date >= ?
        ORDER BY date ASC, time ASC
        LIMIT 1
    """, (today_str,))
    upcoming_row = cursor.fetchone()
    upcoming_app = dict(upcoming_row) if upcoming_row else None

    # Total appointments this month
    curr_month = date.today().strftime("%Y-%m")
    cursor.execute("""
        SELECT COUNT(*) as count FROM appointments
        WHERE user_id = 'senior_1' AND date LIKE ?
    """, (f"{curr_month}%",))
    month_app_count = cursor.fetchone()["count"]

    # Today's nutrition
    cursor.execute("SELECT * FROM nutrition WHERE user_id = 'senior_1' AND date = ?", (today_str,))
    nutr_row = cursor.fetchone()
    if not nutr_row:
        # create default row
        cursor.execute("""
            INSERT INTO nutrition (
                user_id, date, breakfast, breakfast_notes,
                lunch, lunch_notes, dinner, dinner_notes,
                snacks, snacks_notes, water_glasses, target_water
            ) VALUES ('senior_1', ?, 0, '', 0, '', 0, '', 0, '', 0, 8)
        """, (today_str,))
        conn.commit()
        cursor.execute("SELECT * FROM nutrition WHERE user_id = 'senior_1' AND date = ?", (today_str,))
        nutr_row = cursor.fetchone()

    nutr_data = dict(nutr_row)
    conn.close()

    # Calculate meal summary
    meals_eaten = (
        (1 if nutr_data.get("breakfast") else 0) +
        (1 if nutr_data.get("lunch") else 0) +
        (1 if nutr_data.get("dinner") else 0) +
        (1 if nutr_data.get("snacks") else 0)
    )

    return jsonify({
        "today_date": today_str,
        "upcoming_appointment": upcoming_app,
        "monthly_appointments_count": month_app_count,
        "nutrition": {
            "meals_eaten": meals_eaten,
            "meals_total": 4,
            "water_glasses": nutr_data.get("water_glasses", 0),
            "target_water": nutr_data.get("target_water", 8),
            "breakfast": bool(nutr_data.get("breakfast")),
            "lunch": bool(nutr_data.get("lunch")),
            "dinner": bool(nutr_data.get("dinner")),
            "snacks": bool(nutr_data.get("snacks")),
        }
    })


if __name__ == "__main__":
    print("Starting ElderEase Server on http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=True)
