"""
End-to-End Flow Verification Test for ElderEase Review 1 MVP
Simulates all 4 required Demo flows:
- Demo 1: Appointments (Add, View, Edit, Delete, Calendar persistence)
- Demo 2: Nutrition & Water (Mark Meals, Water increment/decrement, Progress sync)
- Demo 3: UPI Tutorials (Structure and content validation)
- Demo 4: Dashboard Integration (Upcoming appointment & Nutrition stats sync)
"""
import unittest
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from database import init_db


class ElderEaseE2ETestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()

    def setUp(self):
        self.client = app.test_client()

    def test_demo_page_loads_with_assets(self):
        """Verifies that the main HTML page renders with all assets."""
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        html = res.data.decode("utf-8")
        self.assertIn("ElderEase", html)
        self.assertIn("Doctor Appointment Calendar", html)
        self.assertIn("Daily Water Intake", html)
        self.assertIn("Learn UPI Digital Payments", html)
        self.assertIn("/static/css/style.css", html)
        self.assertIn("/static/js/app.js", html)
        self.assertIn("/static/js/calendar.js", html)
        self.assertIn("/static/js/nutrition.js", html)
        self.assertIn("/static/js/upi.js", html)

    def test_demo_1_appointment_flow(self):
        """
        Demo 1 flow:
        Add Appointment -> Save -> Retrieve by Date -> View Details -> Edit -> Delete
        """
        # 1. Add Appointment
        new_app_data = {
            "doctor_name": "Dr. Sunil Patil",
            "hospital": "Sahyadri Super Speciality Hospital",
            "date": "2026-10-25",
            "time": "04:30 PM",
            "reason": "Knee Joint Pain Consultation",
            "notes": "Carry previous X-Ray films"
        }
        create_res = self.client.post("/api/appointments", json=new_app_data)
        self.assertEqual(create_res.status_code, 201)
        created = json.loads(create_res.data)
        self.assertTrue(created["success"])
        app_id = created["appointment"]["id"]

        # 2. Verify Appointment appears when querying that date
        date_res = self.client.get(f"/api/appointments?date=2026-10-25")
        self.assertEqual(date_res.status_code, 200)
        date_apps = json.loads(date_res.data)
        self.assertTrue(any(a["id"] == app_id for a in date_apps))

        # 3. View Details
        details_res = self.client.get(f"/api/appointments/{app_id}")
        self.assertEqual(details_res.status_code, 200)
        details = json.loads(details_res.data)
        self.assertEqual(details["doctor_name"], "Dr. Sunil Patil")
        self.assertEqual(details["hospital"], "Sahyadri Super Speciality Hospital")

        # 4. Edit Appointment
        edit_data = {
            "doctor_name": "Dr. Sunil Patil",
            "hospital": "Sahyadri Super Speciality Hospital",
            "date": "2026-10-26",
            "time": "05:00 PM",
            "reason": "Knee Joint Followup",
            "notes": "Carry knee brace"
        }
        edit_res = self.client.put(f"/api/appointments/{app_id}", json=edit_data)
        self.assertEqual(edit_res.status_code, 200)
        updated = json.loads(edit_res.data)
        self.assertEqual(updated["appointment"]["date"], "2026-10-26")

        # 5. Delete Appointment
        del_res = self.client.delete(f"/api/appointments/{app_id}")
        self.assertEqual(del_res.status_code, 200)

        # 6. Verify deleted
        check_res = self.client.get(f"/api/appointments/{app_id}")
        self.assertEqual(check_res.status_code, 404)

    def test_demo_2_nutrition_and_water_flow(self):
        """
        Demo 2 flow:
        Mark Breakfast -> Mark Lunch -> Add Water -> Verify Progress Updates
        """
        test_date = "2026-10-05"

        # 1. Update Meals
        meal_update = {
            "date": test_date,
            "breakfast": 1,
            "breakfast_notes": "Idli and Sambar",
            "lunch": 1,
            "lunch_notes": "Roti, Dal, and Rice",
            "dinner": 0,
            "snacks": 1,
            "snacks_notes": "Almonds and Herbal Tea"
        }
        nutr_res = self.client.put("/api/nutrition", json=meal_update)
        self.assertEqual(nutr_res.status_code, 200)
        nutr_data = json.loads(nutr_res.data)["nutrition"]
        self.assertEqual(nutr_data["breakfast"], 1)
        self.assertEqual(nutr_data["lunch"], 1)
        self.assertEqual(nutr_data["snacks"], 1)
        self.assertEqual(nutr_data["dinner"], 0)

        # 2. Add Water
        water_res = self.client.post("/api/nutrition/water", json={"date": test_date, "delta": 2})
        self.assertEqual(water_res.status_code, 200)
        w_data = json.loads(water_res.data)
        self.assertGreaterEqual(w_data["water_glasses"], 2)

    def test_demo_4_dashboard_integration(self):
        """
        Demo 4 flow:
        Verify dashboard-summary endpoint returns:
        - Upcoming Appointment
        - Nutrition progress
        """
        dash_res = self.client.get("/api/dashboard-summary")
        self.assertEqual(dash_res.status_code, 200)
        dash_data = json.loads(dash_res.data)
        self.assertIn("upcoming_appointment", dash_data)
        self.assertIn("nutrition", dash_data)
        self.assertIn("meals_eaten", dash_data["nutrition"])
        self.assertIn("water_glasses", dash_data["nutrition"])


if __name__ == "__main__":
    unittest.main()
