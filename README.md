# ElderEase — Community Engagement Project (CEP)
## Review 1 MVP: Accessible Health & Digital Assistance Platform for Seniors

**ElderEase** is an assistance platform designed specifically for **elderly individuals**. It prioritizes **accessibility, simplicity, and low cognitive load** over visual complexity.

---

## 🌟 Review 1 Core Modules

1. **Elder-Friendly UI & Accessibility**
   - High-contrast, WCAG-compliant design with readable charcoal/black typography.
   - Text size switcher: **A (Normal)**, **A+ (Large)**, **A++ (Extra Large)** for varying eyesight levels.
   - **High Contrast Mode** toggle for low-vision seniors.
   - Large touch targets (52px–60px height) with descriptive text + icons (`[ ➕ Add Appointment ]`, `[ 🗑 Delete Appointment ]`).
   - Simple persistent 4-tab navigation: **Home**, **Appointments**, **Nutrition & Water**, **Learn UPI**.
   - Emergency Helpline quick-dial modal (Ambulance 108, Senior Helpline 14567, Cyber Fraud 1930, Family contact).

2. **Doctor Appointment Calendar**
   - Monthly calendar with previous/next month navigation, "Today" jumper, and red appointment indicators (`●`).
   - Date selection displaying all appointments scheduled for that day.
   - Full CRUD:
     - **Add Appointment** (Doctor Name, Hospital/Clinic, Date, Time, Reason, Notes).
     - **View Details** modal with clear large print.
     - **Edit Appointment** with pre-filled inputs.
     - **Delete Appointment** with elderly-friendly confirmation dialog.
   - "All Upcoming Visits at a Glance" preview section.
   - Backed by SQLite database (`elderease.db`).

3. **Nutrition & Water Tracker**
   - **Meal Tracker**: Record daily food intake for **Breakfast**, **Lunch**, **Dinner**, and **Evening Snacks**.
     - One-tap status toggle (`✓ Completed` / `○ Mark as Eaten`).
     - Notes field for recording what was eaten (e.g., "Oats, 2 Chapatis, Dal").
   - **Water Intake Tracker**:
     - Visual 8 glasses representation with interactive droplet slots: `💧 💧 💧 💧 ○ ○ ○ ○`.
     - Large touch buttons: `[ 💧 + Add 1 Glass ]` and `[ ➖ Remove Glass ]`.
     - Encouraging hydration guidance tailored to daily progress.
   - Day-by-day navigation (`◀ Previous Day`, `Today`, `Next Day ▶`).

4. **Learn UPI Digital Payments**
   - 4 Structured, elder-friendly lessons:
     1. **How to Send Money** using mobile numbers.
     2. **How to Scan QR Code** at local grocery or medical shops.
     3. **How to Receive Money Safely** (emphasizing you never enter a PIN to receive).
     4. **UPI Safety Rules & Scam Prevention** (Golden rules against OTP/PIN fraud).
   - Step-by-step interactive player (`Step X of Y`) with simulated smartphone screen mockups.
   - **🔊 Read Step Aloud**: Built-in voice playback using browser SpeechSynthesis for elderly users who prefer listening.
   - Interactive safety comprehension quiz.

5. **Integrated Home Dashboard**
   - Time-sensitive greeting: `GOOD MORNING 👋, Dadaji` (with customizable senior name).
   - 4 Big Quick Action cards connecting directly to all modules.
   - **Upcoming Appointment Card**: Displays the nearest upcoming doctor visit with doctor name, clinic, date, time, and reason.
   - **Today's Nutrition Summary Card**: Displays real-time meal completion and water intake count with a quick `[ 💧 + Add 1 Glass ]` button.
   - **UPI Safety Banner**: Prominent daily fraud prevention tip.

---

## 🛠 Tech Stack

- **Backend**: Python 3.13, Flask 3.1, Flask-CORS
- **Database**: SQLite3 (persistent file `elderease.db`, zero-config)
- **Frontend**: Accessible semantic HTML5, Elder-friendly CSS3, Vanilla JavaScript (zero heavy build tools or npm dependencies required)
- **Tests**: Python `unittest` suite testing all REST endpoints and Review 1 flows

---

## 🚀 How to Run ElderEase

### 1. Requirements
- Python 3.10+ (Python 3.13 tested and verified)
- Dependencies installed via pip:
  ```bash
  pip install -r requirements.txt
  ```

### 2. Start the Server
Run:
```bash
python app.py
```
Or:
```bash
python -m flask --app app run --port 5000
```

### 3. Open in Browser
Open your browser and visit:
```
http://127.0.0.1:5000
```

---

## 🧪 Running the Tests

To run the complete automated test suite:
```bash
python -m unittest discover tests
```

All 9 tests verify:
- Health check endpoint
- Appointments CRUD (Create, Read, Update, Delete)
- Appointments validation
- Nutrition date logs and meal updates
- Water adjustment (+1 / -1 glasses)
- Dashboard summary aggregation
- End-to-end integration flows for Review 1

---

## 📋 Review 1 Demonstration Flow

### Demo 1 — Appointments
1. Navigate to **Appointments**.
2. Click on a date on the monthly calendar.
3. Tap **[ ➕ Add New Appointment ]**.
4. Fill in: Doctor Name (`Dr. Ramesh Sharma`), Hospital (`Ruby Hall Hospital`), Time (`11:30 AM`), Reason (`Regular Checkup`).
5. Tap **[ 💾 Save Appointment ]**.
6. See the appointment appear on the calendar with a red badge and in the selected date card.
7. Click **[ 🔍 View Details ]** to view full information.
8. Click **[ ✏️ Edit ]** to modify or **[ 🗑 Delete ]** to cancel.

### Demo 2 — Nutrition & Hydration
1. Navigate to **Nutrition & Water**.
2. Tap **[ ○ Mark as Eaten ]** under Breakfast and Lunch to mark them completed (`✓ Completed`).
3. Add food notes (e.g., "Oats & Fruits").
4. Under Water Intake, tap **[ 💧 + Add 1 Glass ]** multiple times.
5. Watch the 8-glass visual droplets fill up and the counter update live (`4 / 8 Glasses`).

### Demo 3 — Learn UPI
1. Navigate to **Learn UPI**.
2. Select **"How to Send Money"** or **"How to Scan QR Code"**.
3. Follow Step 1 ➔ Step 2 ➔ Step 3 ➔ Step 4.
4. Tap **[ 🔊 Read Step Aloud ]** to hear the instructions spoken.
5. Review the **Golden Safety Rules** and take the interactive safety quiz at the bottom.

### Demo 4 — Dashboard Integration
1. Navigate to **Home**.
2. Observe that the **Upcoming Appointment** card immediately reflects the scheduled doctor visit.
3. Observe that the **Today's Nutrition** card reflects the meals logged and water glasses.
4. Tap **[ 💧 + Add 1 Glass ]** directly on the dashboard and observe instant updates.

---

## 📁 Project Structure

```
cep/
├── app.py                # Flask application & RESTful API endpoints
├── database.py           # SQLite connection, schema migration, seed data
├── requirements.txt      # Python dependencies
├── elderease.db          # SQLite persistent database
├── README.md             # Project documentation & demo guide
├── static/
│   ├── css/
│   │   └── style.css     # Elder-friendly accessible design system
│   └── js/
│       ├── app.js        # Controller: tabs, accessibility, dashboard summary, toasts
│       ├── calendar.js   # Monthly calendar, appointment CRUD & modals
│       ├── nutrition.js  # Daily meals & interactive water droplet tracker
│       └── upi.js        # Step-by-step UPI tutorials & voice read-aloud
├── templates/
│   └── index.html        # Main accessible single-page interface
└── tests/
    ├── test_api.py       # REST API unit tests
    └── test_e2e_flow.py  # End-to-end Review 1 demonstration flow tests
```
