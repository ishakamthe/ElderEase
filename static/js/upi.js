/**
 * ElderEase - UPI Tutorials Module
 * Simple, accessible step-by-step digital payment guides for elderly users.
 * Features:
 * - 4 core tutorials (Send Money, Scan QR Code, Receive Money, Safety Rules)
 * - Step-by-step viewer with Previous / Next / Finish navigation
 * - Simulated mobile phone screen mockups & visual illustrations
 * - Audio Read-Aloud feature using SpeechSynthesis API
 * - Interactive safety comprehension check
 */

window.UPIModule = {
  currentTutorialId: null,
  currentStepIndex: 0,
  isSpeaking: false,

  tutorials: {
    send_money: {
      id: 'send_money',
      title: 'How to Send Money using UPI',
      subtitle: 'Send money to family or friends in 4 simple steps',
      icon: '💸',
      steps: [
        {
          number: 1,
          title: 'Open Your UPI App',
          instruction: 'Open your UPI app on your phone (such as Google Pay, PhonePe, Paytm, or BHIM). You can tap the app icon on your home screen.',
          tip: 'Tip: Always make sure you are in a quiet, comfortable place before making any payments.',
          mockup: {
            icon: '📱',
            header: 'Phone Home Screen',
            text: 'Tap on Google Pay or PhonePe',
            color: '#1e3a8a'
          }
        },
        {
          number: 2,
          title: 'Select the Person to Pay',
          instruction: 'Tap on "Pay Contacts" or "Send to Mobile Number". Select the family member or friend from your contact list or type their phone number.',
          tip: 'Tip: Check the name displayed on the screen to confirm you are paying the right person.',
          mockup: {
            icon: '👥',
            header: 'Select Contact',
            text: 'Rajesh (Son)\n+91 98765 43210',
            color: '#0f766e'
          }
        },
        {
          number: 3,
          title: 'Enter the Amount',
          instruction: 'Type the amount in rupees you wish to send (for example: ₹500). You can also add a brief note like "Medicine" or "Groceries".',
          tip: 'Tip: Double check the number of zeros so you do not type ₹5000 instead of ₹500!',
          mockup: {
            icon: '₹',
            header: 'Enter Amount',
            text: '₹ 500.00\nFor: Medicines',
            color: '#15803d'
          }
        },
        {
          number: 4,
          title: 'Enter Secret UPI PIN to Pay',
          instruction: 'Enter your secret 4-digit or 6-digit UPI PIN on the secure screen. Once verified, the money will be sent instantly and you will hear a confirmation chime.',
          tip: '⚠️ CRITICAL: Never let anyone see your secret UPI PIN while typing.',
          mockup: {
            icon: '🔒',
            header: 'Enter UPI PIN',
            text: '●  ●  ●  ●\nSecret & Secure',
            color: '#b45309'
          }
        }
      ]
    },

    scan_qr: {
      id: 'scan_qr',
      title: 'How to Scan a QR Code at a Shop',
      subtitle: 'Pay at grocery stores, pharmacies, or vegetable stalls',
      icon: '📷',
      steps: [
        {
          number: 1,
          title: 'Tap "Scan QR Code" in your App',
          instruction: 'Open your UPI app and tap on the camera icon or "Scan Any QR" button usually located right in the center or top corner.',
          tip: 'Tip: The app will ask for camera permission if opening for the first time.',
          mockup: {
            icon: '📷',
            header: 'Scan Any QR Code',
            text: 'Point camera at shopkeeper QR',
            color: '#1e3a8a'
          }
        },
        {
          number: 2,
          title: 'Point Camera at Shopkeeper\'s QR Code',
          instruction: 'Hold your mobile phone steady about 1 foot in front of the shopkeeper\'s printed QR stand until the phone beeps.',
          tip: 'Tip: Keep the QR code squarely inside the rectangular box on your screen.',
          mockup: {
            icon: '🏁',
            header: 'Camera Scanning',
            text: '[ [ ⬛  ⬛ ] ]\nCode Detected!',
            color: '#0284c7'
          }
        },
        {
          number: 3,
          title: 'Verify Shop Name & Enter Bill Amount',
          instruction: 'Look at the top of your screen to see the shop name (e.g. "Apollo Pharmacy" or "Sharma General Store"). Then type the exact bill amount.',
          tip: 'Tip: Always verify the shop name with the shopkeeper before entering the amount.',
          mockup: {
            icon: '🏪',
            header: 'Sharma Medical Store',
            text: 'Bill Amount: ₹ 280\nVerified Merchant',
            color: '#15803d'
          }
        },
        {
          number: 4,
          title: 'Enter UPI PIN & Show Payment Confirmation',
          instruction: 'Enter your 4 or 6-digit UPI PIN. A green checkmark screen will appear confirming the payment. Show this screen to the shopkeeper.',
          tip: 'Tip: You and the shopkeeper will both receive an instant SMS from the bank.',
          mockup: {
            icon: '✅',
            header: 'Payment Successful',
            text: '₹ 280 Paid to Sharma Medical\nTransaction Complete',
            color: '#166534'
          }
        }
      ]
    },

    receive_money: {
      id: 'receive_money',
      title: 'How to Receive Money Safely',
      subtitle: 'The golden rule: You NEVER need a PIN to receive money',
      icon: '📥',
      steps: [
        {
          number: 1,
          title: 'Share Only Your Phone Number or QR Code',
          instruction: 'To receive money, simply give the sender your registered mobile number or show them your personal QR code from your UPI app.',
          tip: 'Tip: That is all they need! You do not need to do anything else.',
          mockup: {
            icon: '📲',
            header: 'My UPI Details',
            text: 'Mobile: 98765 43210\nSafe to share',
            color: '#0f766e'
          }
        },
        {
          number: 2,
          title: '🚨 GOLDEN RULE: Never Enter PIN to Receive',
          instruction: 'If someone tells you: "Enter your UPI PIN to claim ₹2,000" or asks you to scan a QR code to receive money, STOP IMMEDIATELY! It is a scam.',
          tip: '⚠️ Entering your PIN always DEDUCTS money from your bank account. Receiving money never requires a PIN.',
          mockup: {
            icon: '⛔',
            header: 'CRITICAL SAFETY RULE',
            text: 'NO PIN NEEDED\nTO RECEIVE MONEY',
            color: '#b91c1c'
          }
        },
        {
          number: 3,
          title: 'Check Your SMS & Bank Balance',
          instruction: 'When the sender transfers money, you will receive an SMS directly from your bank stating "Account credited with ₹...". You can check your account balance inside your app.',
          tip: 'Tip: Do not rely solely on screenshots sent on WhatsApp. Always check your actual bank SMS.',
          mockup: {
            icon: '📩',
            header: 'Bank SMS Received',
            text: '"A/c credited with INR 2,000"\nBalance updated',
            color: '#15803d'
          }
        }
      ]
    },

    safety_rules: {
      id: 'safety_rules',
      title: 'UPI Safety Rules & Scam Protection',
      subtitle: 'Essential rules every senior must know to stay safe',
      icon: '🛡️',
      steps: [
        {
          number: 1,
          title: 'Never Share Your UPI PIN with Anyone',
          instruction: 'Your UPI PIN is like your ATM password or home keys. Never share it with anyone—not shopkeepers, not callers, and not even bank staff.',
          tip: 'Remember: Real bank staff will NEVER ask for your UPI PIN or ATM PIN.',
          mockup: {
            icon: '🔐',
            header: 'Secret UPI PIN',
            text: 'Keep it 100% Private\nNever speak it aloud',
            color: '#b91c1c'
          }
        },
        {
          number: 2,
          title: 'Never Share OTP (One Time Password)',
          instruction: 'If you receive a 6-digit OTP code on your SMS, never read it out to anyone over a phone call, even if they claim your electricity will be disconnected.',
          tip: 'Tip: Legitimate organizations will never ask for your SMS OTP.',
          mockup: {
            icon: '📵',
            header: 'SMS OTP Alert',
            text: '"Do not share with anyone"\nNever read to callers',
            color: '#c2410c'
          }
        },
        {
          number: 3,
          title: 'Do Not Click Unknown Prize or Refund Links',
          instruction: 'Be wary of messages claiming: "Congratulations! You won ₹25,000 pension bonus" or "Click to update electricity bill". Do not click these links or install unknown apps like AnyDesk or TeamViewer.',
          tip: 'Tip: If unsure, always show the message to your son, daughter, or trusted family member first.',
          mockup: {
            icon: '🚫',
            header: 'Suspicious Link Warning',
            text: 'Delete unknown SMS\nDo not install remote apps',
            color: '#7f1d1d'
          }
        },
        {
          number: 4,
          title: 'What to Do If in Doubt',
          instruction: 'If you ever feel pressured or confused during a transaction, cancel it immediately. Take a deep breath, close the app, and call your family member or the National Cyber Helpline at 1930.',
          tip: 'Helpline Number: Dial 1930 for cyber fraud reporting, or 14567 for Senior Helpline.',
          mockup: {
            icon: '📞',
            header: 'Help is Always Available',
            text: 'National Cyber Helpline: 1930\nSenior Helpline: 14567',
            color: '#1e3a8a'
          }
        }
      ]
    }
  },

  init() {
    this.setupEventListeners();
  },

  setupEventListeners() {
    // Topic card clicks
    document.querySelectorAll('[data-tutorial-key]').forEach(el => {
      el.addEventListener('click', () => {
        const key = el.getAttribute('data-tutorial-key');
        this.startTutorial(key);
      });
    });

    // Player navigation
    document.getElementById('upiPrevStepBtn')?.addEventListener('click', () => {
      this.prevStep();
    });

    document.getElementById('upiNextStepBtn')?.addEventListener('click', () => {
      this.nextStep();
    });

    document.getElementById('upiClosePlayerBtn')?.addEventListener('click', () => {
      this.closePlayer();
    });

    // Voice Read-Aloud Button
    document.getElementById('upiSpeakBtn')?.addEventListener('click', () => {
      this.toggleSpeech();
    });

    // Interactive Safety Check buttons
    document.querySelectorAll('[data-safety-answer]').forEach(btn => {
      btn.addEventListener('click', () => {
        const isCorrect = btn.getAttribute('data-safety-answer') === 'correct';
        const feedbackEl = document.getElementById('safetyQuizFeedback');
        if (!feedbackEl) return;

        if (isCorrect) {
          feedbackEl.innerHTML = `
            <div style="background-color: #dcfce7; border: 2px solid #22c55e; color: #14532d; padding: 16px; border-radius: 8px; font-size: 1.2rem; font-weight: 800; margin-top: 14px;">
              ✅ Correct! You NEVER need to enter your UPI PIN to receive money! You only enter PIN when sending money.
            </div>
          `;
          ElderEase.showToast('✅ Correct answer! You are UPI smart!');
        } else {
          feedbackEl.innerHTML = `
            <div style="background-color: #fee2e2; border: 2px solid #ef4444; color: #7f1d1d; padding: 16px; border-radius: 8px; font-size: 1.2rem; font-weight: 800; margin-top: 14px;">
              ❌ That is incorrect. Remember: You NEVER enter your PIN to receive money. Entering PIN always sends money OUT of your account.
            </div>
          `;
          ElderEase.showToast('⚠️ Remember: Never enter PIN to receive money!', true);
        }
      });
    });
  },

  startTutorial(tutorialId) {
    const tut = this.tutorials[tutorialId];
    if (!tut) return;

    this.currentTutorialId = tutorialId;
    this.currentStepIndex = 0;

    const playerContainer = document.getElementById('upiPlayerContainer');
    if (playerContainer) {
      playerContainer.classList.add('active');
      playerContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    this.renderCurrentStep();
  },

  renderCurrentStep() {
    const tut = this.tutorials[this.currentTutorialId];
    if (!tut) return;

    const step = tut.steps[this.currentStepIndex];
    const totalSteps = tut.steps.length;

    // Header info
    document.getElementById('upiPlayerTitle').innerText = `${tut.icon} ${tut.title}`;
    document.getElementById('upiStepBadge').innerText = `Step ${this.currentStepIndex + 1} of ${totalSteps}`;

    // Step content
    document.getElementById('stepHeadline').innerText = `Step ${step.number}: ${step.title}`;
    document.getElementById('stepInstruction').innerText = step.instruction;
    document.getElementById('stepTipText').innerText = step.tip;

    // Smartphone Mockup Graphic
    const mockupScreen = document.getElementById('stepMockupGraphic');
    if (mockupScreen) {
      mockupScreen.style.backgroundColor = step.mockup.color || '#0f172a';
      mockupScreen.innerHTML = `
        <div class="mockup-inner-badge">${ElderEase.escapeHtml(step.mockup.header)}</div>
        <div class="mockup-icon">${step.mockup.icon}</div>
        <div class="mockup-title" style="white-space: pre-line;">${ElderEase.escapeHtml(step.mockup.text)}</div>
        <div class="mockup-subtext">ElderEase Step-by-Step Interactive Guide</div>
      `;
    }

    // Navigation buttons state
    const prevBtn = document.getElementById('upiPrevStepBtn');
    const nextBtn = document.getElementById('upiNextStepBtn');

    if (prevBtn) {
      prevBtn.disabled = this.currentStepIndex === 0;
      prevBtn.style.opacity = this.currentStepIndex === 0 ? '0.5' : '1';
    }

    if (nextBtn) {
      if (this.currentStepIndex === totalSteps - 1) {
        nextBtn.innerHTML = `✅ Complete Tutorial`;
        nextBtn.className = 'btn btn-success btn-lg';
      } else {
        nextBtn.innerHTML = `Next Step ▶`;
        nextBtn.className = 'btn btn-primary btn-lg';
      }
    }

    // Stop previous voice speech if playing
    this.stopSpeech();
  },

  nextStep() {
    const tut = this.tutorials[this.currentTutorialId];
    if (!tut) return;

    if (this.currentStepIndex < tut.steps.length - 1) {
      this.currentStepIndex++;
      this.renderCurrentStep();
    } else {
      // Completed tutorial
      this.stopSpeech();
      ElderEase.showToast(`🎉 Great job! You completed "${tut.title}" tutorial!`);
      this.closePlayer();
    }
  },

  prevStep() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.renderCurrentStep();
    }
  },

  closePlayer() {
    this.stopSpeech();
    const playerContainer = document.getElementById('upiPlayerContainer');
    if (playerContainer) {
      playerContainer.classList.remove('active');
    }
    this.currentTutorialId = null;
    this.currentStepIndex = 0;
  },

  // -------------------------------------------------------------
  // Text to Speech Read-Aloud Feature
  // -------------------------------------------------------------
  toggleSpeech() {
    if (this.isSpeaking) {
      this.stopSpeech();
      return;
    }

    if (!('speechSynthesis' in window)) {
      ElderEase.showToast('Voice read-aloud is not supported on this browser.', true);
      return;
    }

    const tut = this.tutorials[this.currentTutorialId];
    if (!tut) return;
    const step = tut.steps[this.currentStepIndex];

    const textToSpeak = `Step ${step.number}. ${step.title}. ${step.instruction}. Note: ${step.tip}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.88; // Slightly slower, comfortable cadence for elderly listeners
    utterance.pitch = 1.0;
    utterance.lang = 'en-IN';

    utterance.onstart = () => {
      this.isSpeaking = true;
      const btn = document.getElementById('upiSpeakBtn');
      if (btn) btn.innerHTML = `⏹ Stop Voice`;
    };

    utterance.onend = () => {
      this.stopSpeech();
    };

    utterance.onerror = () => {
      this.stopSpeech();
    };

    window.speechSynthesis.speak(utterance);
  },

  stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    const btn = document.getElementById('upiSpeakBtn');
    if (btn) btn.innerHTML = `🔊 Read Step Aloud`;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  UPIModule.init();
});
