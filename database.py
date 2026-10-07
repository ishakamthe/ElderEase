"""
ElderEase - Database Layer
SQLite database setup, schema migration, and initial seed data for Review 1 MVP.
"""
import sqlite3
import os
from datetime import datetime, date, timedelta

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "elderease.db")


def get_db_connection():
    """Returns a SQLite connection with row factory configured."""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initializes database tables and seeds demo data if empty."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create appointments table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL DEFAULT 'senior_1',
            doctor_name TEXT NOT NULL,
            hospital TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            reason TEXT NOT NULL,
            notes TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Create nutrition table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS nutrition (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL DEFAULT 'senior_1',
            date TEXT NOT NULL,
            breakfast INTEGER NOT NULL DEFAULT 0,
            breakfast_notes TEXT DEFAULT '',
            lunch INTEGER NOT NULL DEFAULT 0,
            lunch_notes TEXT DEFAULT '',
            dinner INTEGER NOT NULL DEFAULT 0,
            dinner_notes TEXT DEFAULT '',
            snacks INTEGER NOT NULL DEFAULT 0,
            snacks_notes TEXT DEFAULT '',
            water_glasses INTEGER NOT NULL DEFAULT 0,
            target_water INTEGER NOT NULL DEFAULT 8,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, date)
        )
    """)

    conn.commit()

    # Check if appointments table is empty; if so, populate demo appointments
    cursor.execute("SELECT COUNT(*) as count FROM appointments")
    app_count = cursor.fetchone()["count"]

    today = date.today()
    today_str = today.strftime("%Y-%m-%d")
    next_week = (today + timedelta(days=7)).strftime("%Y-%m-%d")
    two_weeks = (today + timedelta(days=14)).strftime("%Y-%m-%d")

    if app_count == 0:
        demo_appointments = [
            (
                "senior_1",
                "Dr. Ramesh Sharma",
                "Ruby Hall Hospital, Pune",
                next_week,
                "11:30 AM",
                "Regular Health & Heart Checkup",
                "Bring previous ECG and blood reports. Fasting not required.",
            ),
            (
                "senior_1",
                "Dr. Anjali Deshmukh",
                "Sanjeevan Eye Clinic",
                two_weeks,
                "10:00 AM",
                "Cataract & Vision Follow-up",
                "Carry current reading glasses.",
            ),
        ]
        cursor.executemany("""
            INSERT INTO appointments (user_id, doctor_name, hospital, date, time, reason, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, demo_appointments)
        conn.commit()

    # Check today's nutrition entry
    cursor.execute("SELECT COUNT(*) as count FROM nutrition WHERE user_id = 'senior_1' AND date = ?", (today_str,))
    nutr_count = cursor.fetchone()["count"]
    if nutr_count == 0:
        cursor.execute("""
            INSERT INTO nutrition (
                user_id, date, breakfast, breakfast_notes,
                lunch, lunch_notes, dinner, dinner_notes,
                snacks, snacks_notes, water_glasses, target_water
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "senior_1",
            today_str,
            1, "Oatmeal with almonds & warm milk",
            1, "Roti, dal, spinach sabzi & curd",
            0, "",
            0, "",
            4, 8
        ))
        conn.commit()

    conn.close()


if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at:", DB_FILE)
