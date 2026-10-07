/**
 * ElderEase - Main Application Controller
 * Handles navigation tabs, accessibility font-scaling, contrast mode,
 * toast alerts, and dashboard live summary sync.
 */

const ElderEase = {
  activeTab: 'home',
  currentDate: new Date(),
  userName: 'Dadaji',

  init() {
    this.setupNavigation();
    this.setupAccessibilityControls();
    this.setupEmergencyModal();
    this.setupWelcomeBanner();
    this.refreshDashboard();

    // Check URL hash for direct tab linking
    const hash = window.location.hash.replace('#', '');
    if (['home', 'appointments', 'nutrition', 'learn-upi'].includes(hash)) {
      this.switchTab(hash);
    }
  },

  // -------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------
  setupNavigation() {
    const tabs = document.querySelectorAll('.nav-tab-btn');
    tabs.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });

    // Quick action cards on dashboard
    document.querySelectorAll('[data-nav-target]').forEach(el => {
      el.addEventListener('click', (e) => {
        const target = el.getAttribute('data-nav-target');
        if (target) {
          this.switchTab(target);
        }
      });
    });
  },

  switchTab(tabId) {
    this.activeTab = tabId;
    window.location.hash = tabId;

    // Update buttons
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      const isTarget = btn.getAttribute('data-tab') === tabId;
      btn.classList.toggle('active', isTarget);
      btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });

    // Update panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
      const isTarget = panel.id === `tab-${tabId}`;
      panel.classList.toggle('active', isTarget);
    });

    // Trigger tab specific refresh
    if (tabId === 'home') {
      this.refreshDashboard();
    } else if (tabId === 'appointments' && window.AppointmentModule) {
      window.AppointmentModule.refreshCalendar();
    } else if (tabId === 'nutrition' && window.NutritionModule) {
      window.NutritionModule.loadToday();
    } else if (tabId === 'learn-upi' && window.UPIModule) {
      // Keep state or reset if needed
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // -------------------------------------------------------------
  // Accessibility Font Size & Contrast
  // -------------------------------------------------------------
  setupAccessibilityControls() {
    const savedFontSize = localStorage.getItem('elderease_fontsize') || 'font-normal';
    document.body.className = savedFontSize;
    this.updateFontButtonActive(savedFontSize);

    document.querySelectorAll('.font-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sizeClass = btn.getAttribute('data-size');
        document.body.classList.remove('font-normal', 'font-large', 'font-xlarge');
        document.body.classList.add(sizeClass);
        localStorage.setItem('elderease_fontsize', sizeClass);
        this.updateFontButtonActive(sizeClass);
        this.showToast(`Text size changed to ${btn.innerText.trim()}`);
      });
    });

    // Contrast Toggle
    const contrastBtn = document.getElementById('toggleContrastBtn');
    if (contrastBtn) {
      const isContrast = localStorage.getItem('elderease_contrast') === 'true';
      if (isContrast) document.body.classList.add('high-contrast-mode');

      contrastBtn.addEventListener('click', () => {
        document.body.classList.toggle('high-contrast-mode');
        const active = document.body.classList.contains('high-contrast-mode');
        localStorage.setItem('elderease_contrast', active);
        this.showToast(active ? "High Contrast Mode Turned On" : "Standard Mode Restored");
      });
    }
  },

  updateFontButtonActive(sizeClass) {
    document.querySelectorAll('.font-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-size') === sizeClass);
    });
  },

  // -------------------------------------------------------------
  // Dashboard Live Summary Sync
  // -------------------------------------------------------------
  async refreshDashboard() {
    this.updateGreeting();

    try {
      const res = await fetch('/api/dashboard-summary');
      if (!res.ok) return;
      const data = await res.json();

      // 1. Update Upcoming Appointment Box
      const upcomingContainer = document.getElementById('dashUpcomingAppContainer');
      if (upcomingContainer) {
        if (data.upcoming_appointment) {
          const app = data.upcoming_appointment;
          // Format date nicely
          const dateObj = new Date(app.date);
          const formattedDate = dateObj.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });

          upcomingContainer.innerHTML = `
            <div class="upcoming-doctor-name">🩺 ${this.escapeHtml(app.doctor_name)}</div>
            <div class="upcoming-detail-row">🏥 ${this.escapeHtml(app.hospital)}</div>
            <div class="upcoming-detail-row">📅 ${formattedDate} • ⏰ ${this.escapeHtml(app.time)}</div>
            <div class="app-reason-badge">📋 ${this.escapeHtml(app.reason)}</div>
            ${app.notes ? `<div class="app-notes-box">💡 Note: ${this.escapeHtml(app.notes)}</div>` : ''}
            <div style="margin-top: 16px;">
              <button class="btn btn-primary" onclick="ElderEase.switchTab('appointments')">
                📅 View in Calendar
              </button>
            </div>
          `;
        } else {
          upcomingContainer.innerHTML = `
            <div class="empty-summary-box">
              <p>No upcoming appointments found.</p>
              <p style="margin-top: 8px;">Stay healthy and keep smiling!</p>
              <button class="btn btn-primary" style="margin-top: 14px;" onclick="ElderEase.openNewAppointment()">
                ➕ Schedule New Appointment
              </button>
            </div>
          `;
        }
      }

      // 2. Update Nutrition & Water Summary Box
      const nutrSummary = document.getElementById('dashNutritionContainer');
      if (nutrSummary && data.nutrition) {
        const n = data.nutrition;
        const waterCount = n.water_glasses;
        const waterTarget = n.target_water || 8;

        // Render water drop icons (up to 8)
        let dropsHtml = '';
        for (let i = 1; i <= waterTarget; i++) {
          if (i <= waterCount) {
            dropsHtml += `<span title="Glass ${i}">💧</span>`;
          } else {
            dropsHtml += `<span title="Pending" style="opacity: 0.35;">○</span>`;
          }
        }

        nutrSummary.innerHTML = `
          <div style="font-size: 1.25rem; font-weight: 800; margin-bottom: 8px;">
            Meals Logged: <span style="color: var(--color-primary);">${n.meals_eaten} of ${n.meals_total}</span>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px;">
            <span class="meal-status-tag ${n.breakfast ? 'done' : 'pending'}">${n.breakfast ? '✓ Breakfast Done' : '○ Breakfast'}</span>
            <span class="meal-status-tag ${n.lunch ? 'done' : 'pending'}">${n.lunch ? '✓ Lunch Done' : '○ Lunch'}</span>
            <span class="meal-status-tag ${n.dinner ? 'done' : 'pending'}">${n.dinner ? '✓ Dinner Done' : '○ Dinner'}</span>
          </div>

          <div style="font-size: 1.25rem; font-weight: 800; margin-top: 16px;">
            Water Intake: <span class="water-badge">${waterCount} / ${waterTarget} Glasses</span>
          </div>
          <div class="mini-water-bar">
            ${dropsHtml}
          </div>

          <div style="display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap;">
            <button class="btn btn-success" onclick="ElderEase.quickAddWater()">
              💧 + Add 1 Glass
            </button>
            <button class="btn btn-secondary" onclick="ElderEase.switchTab('nutrition')">
              🍎 Open Nutrition Tracker
            </button>
          </div>
        `;
      }
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    }
  },

  updateGreeting() {
    const greetingEl = document.getElementById('dashboardGreeting');
    if (!greetingEl) return;

    const hour = new Date().getHours();
    let timeGreeting = 'GOOD MORNING 👋';
    if (hour >= 12 && hour < 17) {
      timeGreeting = 'GOOD AFTERNOON 👋';
    } else if (hour >= 17) {
      timeGreeting = 'GOOD EVENING 👋';
    }

    greetingEl.innerText = `${timeGreeting}, ${this.userName}`;
  },

  async quickAddWater() {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await fetch('/api/nutrition/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: todayStr, delta: 1 })
      });
      const data = await res.json();
      if (data.success) {
        this.showToast(`💧 Great job! You have drank ${data.water_glasses} glasses today.`);
        this.refreshDashboard();
        if (window.NutritionModule) {
          window.NutritionModule.loadToday();
        }
      }
    } catch (e) {
      this.showToast('Could not record water intake. Please try again.', true);
    }
  },

  openNewAppointment() {
    this.switchTab('appointments');
    if (window.AppointmentModule) {
      window.AppointmentModule.openAddModal();
    }
  },

  // -------------------------------------------------------------
  // Welcome & Profile Switcher
  // -------------------------------------------------------------
  setupWelcomeBanner() {
    const editNameBtn = document.getElementById('editSeniorNameBtn');
    if (editNameBtn) {
      editNameBtn.addEventListener('click', () => {
        const newName = prompt('Please enter your name:', this.userName);
        if (newName && newName.trim()) {
          this.userName = newName.trim();
          localStorage.setItem('elderease_username', this.userName);
          this.updateGreeting();
          this.showToast(`Welcome, ${this.userName}!`);
        }
      });
    }

    const savedName = localStorage.getItem('elderease_username');
    if (savedName) {
      this.userName = savedName;
    }
  },

  // -------------------------------------------------------------
  // Emergency Helpline Modal
  // -------------------------------------------------------------
  setupEmergencyModal() {
    const modal = document.getElementById('emergencyModal');
    const openBtn = document.getElementById('openEmergencyBtn');
    const closeBtn = document.getElementById('closeEmergencyModalBtn');

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => modal.classList.add('active'));
    }
    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    }
  },

  // -------------------------------------------------------------
  // Feedback Toast Helper
  // -------------------------------------------------------------
  showToast(message, isError = false) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'toast-error' : ''}`;
    toast.innerHTML = `
      <span>${isError ? '⚠️' : '✅'} ${this.escapeHtml(message)}</span>
      <button style="background:transparent; border:none; color:#fff; font-size:1.2rem; cursor:pointer;" onclick="this.parentElement.remove()">✕</button>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 4500);
  },

  escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  ElderEase.init();
});
