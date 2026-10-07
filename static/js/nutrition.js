/**
 * ElderEase - Nutrition & Water Tracker Module
 * Handles daily meal tracking (Breakfast, Lunch, Dinner, Snacks),
 * water glass intake (+ / - with visual droplet indicators), and date navigation.
 */

window.NutritionModule = {
  currentDateStr: new Date().toISOString().split('T')[0],
  data: null,

  init() {
    this.setupEventListeners();
    this.loadDateData(this.currentDateStr);
  },

  setupEventListeners() {
    // Date navigation
    document.getElementById('nutrPrevDayBtn')?.addEventListener('click', () => {
      this.shiftDate(-1);
    });

    document.getElementById('nutrNextDayBtn')?.addEventListener('click', () => {
      this.shiftDate(1);
    });

    document.getElementById('nutrTodayBtn')?.addEventListener('click', () => {
      this.currentDateStr = new Date().toISOString().split('T')[0];
      this.loadDateData(this.currentDateStr);
    });

    // Water tracker buttons
    document.getElementById('addWaterGlassBtn')?.addEventListener('click', () => {
      this.adjustWater(1);
    });

    document.getElementById('removeWaterGlassBtn')?.addEventListener('click', () => {
      this.adjustWater(-1);
    });
  },

  loadToday() {
    this.currentDateStr = new Date().toISOString().split('T')[0];
    this.loadDateData(this.currentDateStr);
  },

  shiftDate(days) {
    const parts = this.currentDateStr.split('-');
    const cur = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    cur.setDate(cur.getDate() + days);
    this.currentDateStr = cur.toISOString().split('T')[0];
    this.loadDateData(this.currentDateStr);
  },

  async loadDateData(dateStr) {
    try {
      const res = await fetch(`/api/nutrition?date=${dateStr}`);
      if (!res.ok) throw new Error('Could not load nutrition data');
      this.data = await res.json();
      this.render();
    } catch (err) {
      console.error(err);
      ElderEase.showToast('Could not load nutrition information.', true);
    }
  },

  render() {
    if (!this.data) return;

    // Render Date Label
    const dateLabelEl = document.getElementById('nutrDateDisplay');
    if (dateLabelEl) {
      const parts = this.currentDateStr.split('-');
      const dObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const todayStr = new Date().toISOString().split('T')[0];
      const isToday = this.currentDateStr === todayStr;

      const formatted = dObj.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      dateLabelEl.innerText = isToday ? `Today — ${formatted}` : formatted;
    }

    // Render Meals
    this.renderMealCard('breakfast', 'Breakfast 🍳', this.data.breakfast, this.data.breakfast_notes);
    this.renderMealCard('lunch', 'Lunch 🍲', this.data.lunch, this.data.lunch_notes);
    this.renderMealCard('dinner', 'Dinner 🥣', this.data.dinner, this.data.dinner_notes);
    this.renderMealCard('snacks', 'Evening Snacks 🍵', this.data.snacks, this.data.snacks_notes);

    // Render Water Tracker
    this.renderWaterTracker();
  },

  renderMealCard(mealKey, title, isCompleted, notes) {
    const container = document.getElementById(`mealCard_${mealKey}`);
    if (!container) return;

    const completed = Boolean(isCompleted);

    container.className = `meal-card ${completed ? 'completed' : ''}`;
    container.innerHTML = `
      <div>
        <div class="meal-card-header">
          <div class="meal-name">${title}</div>
          <span class="meal-status-tag ${completed ? 'done' : 'pending'}">
            ${completed ? '✓ Completed' : '○ Not Recorded'}
          </span>
        </div>

        <div style="margin-top: 14px;">
          <label style="display:block; font-size:1rem; font-weight:700; margin-bottom:6px; color:var(--color-text-muted);">
            What did you eat?
          </label>
          <input
            type="text"
            id="input_${mealKey}"
            class="meal-input"
            value="${ElderEase.escapeHtml(notes || '')}"
            placeholder="e.g. Oatmeal with fruits, 2 Chapatis, Dal..."
          />
        </div>
      </div>

      <div style="display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap;">
        <button
          type="button"
          class="btn ${completed ? 'btn-success' : 'btn-secondary'}"
          style="flex: 1;"
          onclick="NutritionModule.toggleMealStatus('${mealKey}', ${completed ? 0 : 1})"
        >
          ${completed ? '✓ Marked as Eaten' : '○ Mark as Eaten'}
        </button>
        <button
          type="button"
          class="btn btn-secondary"
          title="Save notes for this meal"
          onclick="NutritionModule.saveMealNotes('${mealKey}')"
        >
          💾 Save Note
        </button>
      </div>
    `;
  },

  renderWaterTracker() {
    const glasses = this.data.water_glasses || 0;
    const target = this.data.target_water || 8;

    const counterEl = document.getElementById('waterCounterNum');
    if (counterEl) {
      counterEl.innerText = `${glasses} / ${target} Glasses`;
    }

    // Render 8 visual glasses slots
    const dropletsContainer = document.getElementById('waterDropletsBox');
    if (dropletsContainer) {
      let html = '';
      const displayTotal = Math.max(target, glasses);
      for (let i = 1; i <= displayTotal; i++) {
        const isFilled = i <= glasses;
        html += `
          <div class="water-drop-item ${isFilled ? 'filled' : ''}" title="Glass ${i}">
            <span>${isFilled ? '💧' : '○'}</span>
            <span style="font-size: 0.85rem; font-weight: 800; margin-top: 2px;">#${i}</span>
          </div>
        `;
      }
      dropletsContainer.innerHTML = html;
    }

    // Encouragement message
    const feedbackEl = document.getElementById('waterFeedbackText');
    if (feedbackEl) {
      if (glasses === 0) {
        feedbackEl.innerText = '💧 Start your morning with a glass of fresh water to awaken your body!';
      } else if (glasses < 4) {
        feedbackEl.innerText = '💧 Good start! Remember to take sips of water regularly throughout the day.';
      } else if (glasses < target) {
        feedbackEl.innerText = `💧 You are doing great! Just ${target - glasses} more glasses to reach your goal.`;
      } else if (glasses === target) {
        feedbackEl.innerText = '🌟 Fantastic! You completed your daily goal of 8 glasses of water today!';
      } else {
        feedbackEl.innerText = '🌟 Wonderful hydration! Keep up the healthy habits!';
      }
    }
  },

  async toggleMealStatus(mealKey, newStatus) {
    const inputEl = document.getElementById(`input_${mealKey}`);
    const notes = inputEl ? inputEl.value.trim() : (this.data[`${mealKey}_notes`] || '');

    const payload = {
      date: this.currentDateStr,
      [mealKey]: newStatus,
      [`${mealKey}_notes`]: notes
    };

    try {
      const res = await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to update meal');

      this.data = resData.nutrition;
      this.render();

      const mealLabel = mealKey.charAt(0).toUpperCase() + mealKey.slice(1);
      ElderEase.showToast(newStatus ? `✓ ${mealLabel} marked as completed!` : `○ ${mealLabel} marked as pending.`);
      ElderEase.refreshDashboard();
    } catch (err) {
      console.error(err);
      ElderEase.showToast('Could not update meal status.', true);
    }
  },

  async saveMealNotes(mealKey) {
    const inputEl = document.getElementById(`input_${mealKey}`);
    const notes = inputEl ? inputEl.value.trim() : '';

    const payload = {
      date: this.currentDateStr,
      [`${mealKey}_notes`]: notes
    };

    try {
      const res = await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();
      if (!res.ok) throw new Error('Failed to save notes');

      this.data = resData.nutrition;
      this.render();
      ElderEase.showToast('Meal notes saved successfully!');
    } catch (err) {
      console.error(err);
      ElderEase.showToast('Could not save notes.', true);
    }
  },

  async adjustWater(delta) {
    try {
      const res = await fetch('/api/nutrition/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: this.currentDateStr, delta })
      });
      const resData = await res.json();
      if (!res.ok) throw new Error('Failed to update water');

      this.data = resData.nutrition;
      this.render();

      if (delta > 0) {
        ElderEase.showToast(`💧 Added 1 glass! Total: ${this.data.water_glasses} glasses.`);
      } else {
        ElderEase.showToast(`Removed 1 glass. Total: ${this.data.water_glasses} glasses.`);
      }

      ElderEase.refreshDashboard();
    } catch (err) {
      console.error(err);
      ElderEase.showToast('Could not update water intake.', true);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  NutritionModule.init();
});
