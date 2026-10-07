"""
Unit tests for ElderEase REST APIs:
- Appointments CRUD
- Nutrition Tracking & Water Intake
- Dashboard Summary
"""
import unittest
import json
import os
import sys

# Add project root to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from database import init_db, get_db_connection


class ElderEaseAPITestCase(unittest.TestCase):
    def setUp(self):
        self.app = app
        self.app.config["TESTING"] = True
        self.client = self.app.test_client()
        init_db()

    def test_health_check(self):
        """Test health check route."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data["status"], "healthy")

    def test_appointments_crud(self):
        """Test creating, reading, updating, and deleting appointments."""
        # 1. Create appointment
        payload = {
            "doctor_name": "Dr. Test Verma",
            "hospital": "Apex City Hospital",
            "date": "2026-11-20",
            "time": "09:30 AM",
            "reason": "Blood Sugar Check",
            "notes": "Fasting sample required at 8:30 AM"
        }
        res_post = self.client.post("/api/appointments", json=payload)
        self.assertEqual(res_post.status_code, 201)
        created = json.loads(res_post.data)
        self.assertTrue(created["success"])
        app_id = created["appointment"]["id"]

        # 2. Get specific appointment
        res_get = self.client.get(f"/api/appointments/{app_id}")
        self.assertEqual(res_get.status_code, 200)
        retrieved = json.loads(res_get.data)
        self.assertEqual(retrieved["doctor_name"], "Dr. Test Verma")

        # 3. Update appointment
        update_payload = {
            "doctor_name": "Dr. Test Verma (Updated)",
            "hospital": "Apex City Hospital",
            "date": "2026-11-21",
            "time": "10:00 AM",
            "reason": "Blood Sugar & HbA1c Check",
            "notes": "Updated note"
        }
        res_put = self.client.put(f"/api/appointments/{app_id}", json=update_payload)
        self.assertEqual(res_put.status_code, 200)
        updated = json.loads(res_put.data)
        self.assertEqual(updated["appointment"]["doctor_name"], "Dr. Test Verma (Updated)")
        self.assertEqual(updated["appointment"]["date"], "2026-11-21")

        # 4. Delete appointment
        res_del = self.client.delete(f"/api/appointments/{app_id}")
        self.assertEqual(res_del.status_code, 200)

        # 5. Verify deleted
        res_check = self.client.get(f"/api/appointments/{app_id}")
        self.assertEqual(res_check.status_code, 404)

    def test_appointments_validation(self):
        """Test validation error when required fields are missing."""
        invalid_payload = {
            "doctor_name": "",
            "hospital": "City Hospital"
            # missing date, time, reason
        }
        res = self.client.post("/api/appointments", json=invalid_payload)
        self.assertEqual(res.status_code, 400)
        data = json.loads(res.data)
        self.assertIn("details", data)

    def test_nutrition_endpoints(self):
        """Test nutrition get, update, and water adjustment."""
        test_date = "2026-11-15"

        # 1. Get nutrition for test date (auto-creates)
        res_get = self.client.get(f"/api/nutrition?date={test_date}")
        self.assertEqual(res_get.status_code, 200)
        data = json.loads(res_get.data)
        self.assertEqual(data["date"], test_date)

        # 2. Update meals
        update_payload = {
            "date": test_date,
            "breakfast": 1,
            "breakfast_notes": "Poha and Warm Tea",
            "lunch": 1,
            "lunch_notes": "Khichdi",
            "water_glasses": 3
        }
        res_update = self.client.put("/api/nutrition", json=update_payload)
        self.assertEqual(res_update.status_code, 200)
        updated = json.loads(res_update.data)["nutrition"]
        self.assertEqual(updated["breakfast"], 1)
        self.assertEqual(updated["lunch"], 1)
        self.assertEqual(updated["dinner"], 0)
        self.assertEqual(updated["water_glasses"], 3)

        # 3. Water adjustment +1
        res_water_plus = self.client.post("/api/nutrition/water", json={"date": test_date, "delta": 1})
        self.assertEqual(res_water_plus.status_code, 200)
        w_data = json.loads(res_water_plus.data)
        self.assertEqual(w_data["water_glasses"], 4)

        # 4. Water adjustment -1
        res_water_minus = self.client.post("/api/nutrition/water", json={"date": test_date, "delta": -1})
        self.assertEqual(res_water_minus.status_code, 200)
        w_data2 = json.loads(res_water_minus.data)
        self.assertEqual(w_data2["water_glasses"], 3)

    def test_dashboard_summary(self):
        """Test dashboard summary endpoint."""
        res = self.client.get("/api/dashboard-summary")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn("today_date", data)
        self.assertIn("nutrition", data)


if __name__ == "__main__":
    unittest.main()
