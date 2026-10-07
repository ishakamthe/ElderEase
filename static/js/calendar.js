/**
 * ElderEase - Appointment Calendar Module
 * Provides monthly calendar navigation, date selection, appointment CRUD,
 * detailed appointment viewing modal, and delete confirmation.
 */

window.AppointmentModule = {
  viewYear: new Date().getFullYear(),
  viewMonth: new Date().getMonth(), // 0-indexed
  selectedDateStr: null, // "YYYY-MM-DD"
  allAppointments: [],
  editingAppId: null,

  init() {
    const today = new Date();
    this.selectedDateStr = this.formatDateIso(today);
    this.setupEventListeners();
    this.refreshCalendar();
  },

  setupEventListeners() {
    // Month navigation
    document.getElementById('calPrevMonthBtn')?.addEventListener('click', () => {
      this.viewMonth--;
      if (this.viewMonth < 0) {
        this.viewMonth = 11;
        this.viewYear--;
      }
      this.renderMonth();
    });

    document.getElementById('calNextMonthBtn')?.addEventListener('click', () => {
      this.viewMonth++;
      if (this.viewMonth > 11) {
        this.viewMonth = 0;
        this.viewYear++;
      }
      this.renderMonth();
    });

    document.getElementById('calTodayBtn')?.addEventListener('click', () => {
      const now = new Date();
      this.viewYear = now.getFullYear();
      this.viewMonth = now.getMonth();
      this.selectedDateStr = this.formatDateIso(now);
      this.renderMonth();
      this.renderSelectedDayAppointments();
    });

    // Add Appointment Button
    document.getElementById('openAddAppBtn')?.addEventListener('click', () => {
      this.openAddModal();
    });

    // Modal Form Submit
    document.getElementById('appointmentForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveAppointment();
    });

    // Modal cancel buttons
    document.getElementById('cancelAppModalBtn')?.addEventListener('click', () => {
      this.closeModal('appointmentModal');
    });
    document.getElementById('closeAppModalHeaderBtn')?.addEventListener('click', () => {
      this.closeModal('appointmentModal');
    });

    // Details Modal Close
    document.getElementById('closeDetailsModalBtn')?.addEventListener('click', () => {
      this.closeModal('appointmentDetailsModal');
    });
    document.getElementById('closeDetailsHeaderBtn')?.addEventListener('click', () => {
      this.closeModal('appointmentDetailsModal');
    });

    // Delete Confirmation Modal
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => {
      this.closeModal('deleteConfirmModal');
    });
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', () => {
      this.executeDelete();
    });
  },

  async refreshCalendar() {
    await this.fetchAllAppointments();
    this.renderMonth();
    this.renderSelectedDayAppointments();
    this.renderUpcomingList();
  },

  async fetchAllAppointments() {
    try {
      const res = await fetch('/api/appointments');
      if (res.ok) {
        this.allAppointments = await res.json();
      }
    } catch (e) {
      console.error('Failed to load appointments:', e);
      ElderEase.showToast('Could not load appointments. Please check connection.', true);
    }
  },

  renderMonth() {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthLabelEl = document.getElementById('calMonthYearLabel');
    if (monthLabelEl) {
      monthLabelEl.innerText = `${monthNames[this.viewMonth]} ${this.viewYear}`;
    }

    const tbody = document.getElementById('calendarBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const firstDayIndex = new Date(this.viewYear, this.viewMonth, 1).getDay();
    const daysInCurrentMonth = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(this.viewYear, this.viewMonth, 0).getDate();

    const todayStr = this.formatDateIso(new Date());

    let dayCounter = 1;
    let nextMonthDay = 1;

    // Create 6 rows (weeks)
    for (let r = 0; r < 6; r++) {
      const tr = document.createElement('tr');
      let rowHasDays = false;

      for (let d = 0; d < 7; d++) {
        const td = document.createElement('td');
        td.className = 'calendar-td';

        const cellIndex = r * 7 + d;
        let cellDateStr = '';
        let cellText = '';
        let isCurrentMonth = false;

        if (cellIndex < firstDayIndex) {
          // Previous month days
          const pDay = daysInPrevMonth - firstDayIndex + cellIndex + 1;
          cellText = pDay;
          const pMonth = this.viewMonth === 0 ? 11 : this.viewMonth - 1;
          const pYear = this.viewMonth === 0 ? this.viewYear - 1 : this.viewYear;
          cellDateStr = `${pYear}-${String(pMonth + 1).padStart(2, '0')}-${String(pDay).padStart(2, '0')}`;
        } else if (dayCounter <= daysInCurrentMonth) {
          // Current month days
          cellText = dayCounter;
          cellDateStr = `${this.viewYear}-${String(this.viewMonth + 1).padStart(2, '0')}-${String(dayCounter).padStart(2, '0')}`;
          isCurrentMonth = true;
          dayCounter++;
          rowHasDays = true;
        } else {
          // Next month days
          cellText = nextMonthDay;
          const nMonth = this.viewMonth === 11 ? 0 : this.viewMonth + 1;
          const nYear = this.viewMonth === 11 ? this.viewYear + 1 : this.viewYear;
          cellDateStr = `${nYear}-${String(nMonth + 1).padStart(2, '0')}-${String(nextMonthDay).padStart(2, '0')}`;
          nextMonthDay++;
        }

        const cellBtn = document.createElement('button');
        cellBtn.className = 'calendar-day-cell';
        cellBtn.type = 'button';
        cellBtn.setAttribute('data-date', cellDateStr);
        cellBtn.setAttribute('aria-label', `Date ${cellDateStr}`);

        if (!isCurrentMonth) {
          cellBtn.classList.add('other-month');
        }
        if (cellDateStr === todayStr) {
          cellBtn.classList.add('today');
        }
        if (cellDateStr === this.selectedDateStr) {
          cellBtn.classList.add('selected');
        }

        // Check if day has appointments
        const dayApps = this.allAppointments.filter(a => a.date === cellDateStr);
        let indicatorHtml = '';
        if (dayApps.length > 0) {
          indicatorHtml = `<span class="app-indicator" title="${dayApps.length} appointment(s)"></span>`;
        }

        cellBtn.innerHTML = `<span>${cellText}</span>${indicatorHtml}`;

        cellBtn.addEventListener('click', () => {
          this.selectedDateStr = cellDateStr;
          // If clicked date is in adjacent month, update view month
          const clickedDate = new Date(cellDateStr);
          if (clickedDate.getMonth() !== this.viewMonth) {
            this.viewYear = clickedDate.getFullYear();
            this.viewMonth = clickedDate.getMonth();
            this.renderMonth();
          } else {
            // Update selected class without full re-render
            document.querySelectorAll('.calendar-day-cell').forEach(c => c.classList.remove('selected'));
            cellBtn.classList.add('selected');
          }
          this.renderSelectedDayAppointments();
        });

        td.appendChild(cellBtn);
        tr.appendChild(td);
      }

      // Avoid rendering extra empty 6th row if not needed
      if (r === 5 && !rowHasDays) {
        break;
      }
      tbody.appendChild(tr);
    }
  },

  renderSelectedDayAppointments() {
    const titleEl = document.getElementById('selectedDayTitle');
    const container = document.getElementById('dayAppointmentsList');
    if (!container) return;

    if (!this.selectedDateStr) return;

    const parts = this.selectedDateStr.split('-');
    const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const formattedTitle = dateObj.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    if (titleEl) {
      titleEl.innerText = formattedTitle;
    }

    const appsOnDay = this.allAppointments.filter(a => a.date === this.selectedDateStr);

    if (appsOnDay.length === 0) {
      container.innerHTML = `
        <div class="empty-summary-box">
          <p>No appointments on this date.</p>
          <button class="btn btn-primary" style="margin-top: 12px;" onclick="AppointmentModule.openAddModal('${this.selectedDateStr}')">
            ➕ Schedule Appointment for This Day
          </button>
        </div>
      `;
      return;
    }

    let html = '';
    appsOnDay.forEach(app => {
      html += `
        <div class="appointment-card">
          <div class="app-card-title">🩺 ${ElderEase.escapeHtml(app.doctor_name)}</div>
          <div class="app-meta-row">🏥 ${ElderEase.escapeHtml(app.hospital)}</div>
          <div class="app-meta-row">⏰ Time: <strong>${ElderEase.escapeHtml(app.time)}</strong></div>
          <div class="app-reason-badge">📋 Reason: ${ElderEase.escapeHtml(app.reason)}</div>
          ${app.notes ? `<div class="app-notes-box">💡 Note: ${ElderEase.escapeHtml(app.notes)}</div>` : ''}

          <div class="app-card-actions">
            <button class="btn btn-primary" onclick="AppointmentModule.openDetailsModal(${app.id})">
              🔍 View Details
            </button>
            <button class="btn btn-secondary" onclick="AppointmentModule.openEditModal(${app.id})">
              ✏️ Edit
            </button>
            <button class="btn btn-danger" onclick="AppointmentModule.openDeleteModal(${app.id})">
              🗑 Delete
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  renderUpcomingList() {
    const container = document.getElementById('upcomingAppointmentsList');
    if (!container) return;

    const todayStr = this.formatDateIso(new Date());
    const upcoming = this.allAppointments
      .filter(a => a.date >= todayStr)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

    if (upcoming.length === 0) {
      container.innerHTML = `<p style="color: var(--color-text-muted);">No upcoming appointments scheduled.</p>`;
      return;
    }

    let html = '';
    upcoming.slice(0, 5).forEach(app => {
      const parts = app.date.split('-');
      const dObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const dateText = dObj.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      html += `
        <div style="background-color: var(--color-surface-soft); border-left: 5px solid var(--color-primary); padding: 14px; border-radius: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div>
            <div style="font-size: 1.15rem; font-weight: 800;">🩺 ${ElderEase.escapeHtml(app.doctor_name)}</div>
            <div style="font-size: 1rem; color: var(--color-text-muted);">🏥 ${ElderEase.escapeHtml(app.hospital)} • 📅 ${dateText} • ⏰ ${ElderEase.escapeHtml(app.time)}</div>
          </div>
          <div>
            <button class="btn btn-secondary" style="min-height: 44px; padding: 6px 14px; font-size: 0.95rem;" onclick="AppointmentModule.selectSpecificDate('${app.date}')">
              📅 Go to Date
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  selectSpecificDate(dateStr) {
    this.selectedDateStr = dateStr;
    const parts = dateStr.split('-');
    this.viewYear = parseInt(parts[0]);
    this.viewMonth = parseInt(parts[1]) - 1;
    this.renderMonth();
    this.renderSelectedDayAppointments();
  },

  // -------------------------------------------------------------
  // Add / Edit Modal
  // -------------------------------------------------------------
  openAddModal(presetDate = null) {
    this.editingAppId = null;
    document.getElementById('modalTitle').innerText = '➕ Add Doctor Appointment';
    document.getElementById('appointmentForm').reset();

    const dateToUse = presetDate || this.selectedDateStr || this.formatDateIso(new Date());
    document.getElementById('appDateInput').value = dateToUse;
    document.getElementById('appTimeInput').value = '10:30 AM';

    this.openModal('appointmentModal');
  },

  openEditModal(appId) {
    const app = this.allAppointments.find(a => a.id === appId);
    if (!app) return;

    this.editingAppId = appId;
    document.getElementById('modalTitle').innerText = '✏️ Edit Doctor Appointment';

    document.getElementById('doctorNameInput').value = app.doctor_name;
    document.getElementById('hospitalInput').value = app.hospital;
    document.getElementById('appDateInput').value = app.date;
    document.getElementById('appTimeInput').value = app.time;
    document.getElementById('appReasonInput').value = app.reason;
    document.getElementById('appNotesInput').value = app.notes || '';

    this.closeModal('appointmentDetailsModal');
    this.openModal('appointmentModal');
  },

  async saveAppointment() {
    const doctor_name = document.getElementById('doctorNameInput').value.trim();
    const hospital = document.getElementById('hospitalInput').value.trim();
    const date = document.getElementById('appDateInput').value.trim();
    const time = document.getElementById('appTimeInput').value.trim();
    const reason = document.getElementById('appReasonInput').value.trim();
    const notes = document.getElementById('appNotesInput').value.trim();

    if (!doctor_name || !hospital || !date || !time || !reason) {
      ElderEase.showToast('Please fill in all required fields marked with *', true);
      return;
    }

    const payload = { doctor_name, hospital, date, time, reason, notes };

    try {
      let url = '/api/appointments';
      let method = 'POST';

      if (this.editingAppId) {
        url = `/api/appointments/${this.editingAppId}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save appointment');
      }

      this.closeModal('appointmentModal');
      ElderEase.showToast(this.editingAppId ? 'Appointment updated successfully!' : 'Appointment scheduled successfully!');

      this.selectedDateStr = date;
      const parts = date.split('-');
      this.viewYear = parseInt(parts[0]);
      this.viewMonth = parseInt(parts[1]) - 1;

      await this.refreshCalendar();
      ElderEase.refreshDashboard();
    } catch (err) {
      console.error(err);
      ElderEase.showToast(err.message, true);
    }
  },

  // -------------------------------------------------------------
  // Details Modal
  // -------------------------------------------------------------
  openDetailsModal(appId) {
    const app = this.allAppointments.find(a => a.id === appId);
    if (!app) return;

    const parts = app.date.split('-');
    const dObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const formattedDate = dObj.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const body = document.getElementById('detailsModalContent');
    body.innerHTML = `
      <div style="margin-bottom: 20px;">
        <div style="font-size: 1.6rem; font-weight: 800; color: var(--color-text-main);">
          🩺 ${ElderEase.escapeHtml(app.doctor_name)}
        </div>
        <div style="font-size: 1.2rem; color: var(--color-text-muted); margin-top: 6px;">
          🏥 <strong>Hospital/Clinic:</strong> ${ElderEase.escapeHtml(app.hospital)}
        </div>
      </div>

      <div style="background-color: var(--color-surface-soft); padding: 18px; border-radius: var(--radius-md); margin-bottom: 20px; display: flex; flex-direction: column; gap: 10px;">
        <div style="font-size: 1.2rem;">
          📅 <strong>Date:</strong> ${formattedDate}
        </div>
        <div style="font-size: 1.2rem;">
          ⏰ <strong>Time:</strong> ${ElderEase.escapeHtml(app.time)}
        </div>
        <div style="font-size: 1.2rem;">
          📋 <strong>Reason for Visit:</strong> ${ElderEase.escapeHtml(app.reason)}
        </div>
      </div>

      ${app.notes ? `
        <div style="background-color: #fefce8; border-left: 5px solid #ca8a04; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
          <div style="font-weight: 800; font-size: 1.15rem; color: #713f12; margin-bottom: 4px;">💡 Doctor Notes / Reminders:</div>
          <div style="font-size: 1.15rem; color: #713f12;">${ElderEase.escapeHtml(app.notes)}</div>
        </div>
      ` : ''}

      <div class="form-actions" style="margin-top: 24px;">
        <button class="btn btn-primary" onclick="AppointmentModule.openEditModal(${app.id})">
          ✏️ Edit Appointment
        </button>
        <button class="btn btn-danger" onclick="AppointmentModule.openDeleteModal(${app.id})">
          🗑 Delete Appointment
        </button>
        <button class="btn btn-secondary" onclick="AppointmentModule.closeModal('appointmentDetailsModal')">
          ✕ Close
        </button>
      </div>
    `;

    this.openModal('appointmentDetailsModal');
  },

  // -------------------------------------------------------------
  // Delete Flow
  // -------------------------------------------------------------
  targetDeleteId: null,

  openDeleteModal(appId) {
    const app = this.allAppointments.find(a => a.id === appId);
    if (!app) return;

    this.targetDeleteId = appId;
    const descEl = document.getElementById('deleteAppDescription');
    if (descEl) {
      descEl.innerText = `Appointment with ${app.doctor_name} on ${app.date} at ${app.time}`;
    }

    this.closeModal('appointmentDetailsModal');
    this.openModal('deleteConfirmModal');
  },

  async executeDelete() {
    if (!this.targetDeleteId) return;

    try {
      const res = await fetch(`/api/appointments/${this.targetDeleteId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete appointment');

      this.closeModal('deleteConfirmModal');
      ElderEase.showToast('Appointment cancelled successfully.');
      this.targetDeleteId = null;

      await this.refreshCalendar();
      ElderEase.refreshDashboard();
    } catch (err) {
      console.error(err);
      ElderEase.showToast('Could not delete appointment.', true);
    }
  },

  // -------------------------------------------------------------
  // Modal Helpers
  // -------------------------------------------------------------
  openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('active');
  },

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('active');
  },

  formatDateIso(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AppointmentModule.init();
});
