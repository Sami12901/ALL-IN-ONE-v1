// Form Filling Practice - Keyboard Navigation & Workflow Trainer

const SCENARIOS = {
  onboarding: {
    title: "Employee Onboarding Dossier",
    fields: [
      { id: "firstName", label: "First Name", type: "text", target: "Julian", placeholder: "Enter first name" },
      { id: "lastName", label: "Last Name", type: "text", target: "Mercer", placeholder: "Enter last name" },
      { id: "employeeId", label: "Employee ID", type: "number", target: "4829", placeholder: "4-digit numeric ID" },
      { id: "department", label: "Department", type: "select", target: "Engineering", options: ["Select Department...", "Marketing", "Engineering", "Operations", "Finance"] },
      { id: "startDate", label: "Start Date", type: "date", target: "2026-11-01" },
      { id: "employmentType", label: "Employment Type", type: "radio", target: "Full-Time", options: ["Full-Time", "Contractor", "Part-Time"] },
      { id: "equipmentLaptop", label: "Issue Workstation Laptop", type: "checkbox", target: true },
      { id: "ndaSigned", label: "Confirm NDA Compliance Agreement", type: "checkbox", target: true }
    ]
  },
  shipping: {
    title: "Logistics & Express Freight Order",
    fields: [
      { id: "recipient", label: "Recipient Name", type: "text", target: "Sarah Jenkins", placeholder: "Full recipient name" },
      { id: "street", label: "Delivery Address", type: "text", target: "842 Market St, Suite 400", placeholder: "Street address" },
      { id: "shippingMethod", label: "Shipping Method", type: "select", target: "Overnight Express", options: ["Select Method...", "Standard Ground", "Priority 2-Day", "Overnight Express"] },
      { id: "itemQuantity", label: "Package Units", type: "number", target: "12", placeholder: "Total unit count" },
      { id: "deliveryDeadline", label: "Target Delivery Date", type: "date", target: "2026-10-15" },
      { id: "packagingType", label: "Packaging Grade", type: "radio", target: "Reinforced Wooden Crate", options: ["Standard Box", "Reinforced Wooden Crate", "Padded Mailer"] },
      { id: "signatureRequired", label: "Require Adult Signature on Delivery", type: "checkbox", target: true },
      { id: "fragileHandling", label: "Special Fragile Glass Handling", type: "checkbox", target: true }
    ]
  },
  infra: {
    title: "Cloud Infrastructure Spec",
    fields: [
      { id: "clusterName", label: "Cluster Namespace", type: "text", target: "prod-us-east-cluster", placeholder: "DNS cluster identifier" },
      { id: "cloudProvider", label: "Cloud Provider", type: "select", target: "Google Cloud Platform", options: ["Select Provider...", "Amazon Web Services", "Google Cloud Platform", "Microsoft Azure"] },
      { id: "nodeCount", label: "Provisioned Nodes", type: "number", target: "16", placeholder: "Worker node pool count" },
      { id: "instanceTier", label: "Instance Compute Tier", type: "radio", target: "High-Memory (32GB)", options: ["Standard (8GB)", "Compute-Optimized (16GB)", "High-Memory (32GB)"] },
      { id: "deploymentDate", label: "Target Go-Live Date", type: "date", target: "2026-12-01" },
      { id: "enableAutoScaling", label: "Enable Horizontal Pod Autoscaler", type: "checkbox", target: true },
      { id: "enableBackupVault", label: "Enable Automated Multi-Region Backups", type: "checkbox", target: true },
      { id: "enforceMtls", label: "Enforce Strict Mutual TLS Authentication", type: "checkbox", target: true }
    ]
  }
};

// Web Audio synthesizer
class FormSynth {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }
  init() {
    if (!this.ctx && typeof AudioContext !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
  playTab() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(700, t + 0.05);
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.05);
    } catch {}
  }
  playKey() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(500, t);
      osc.frequency.exponentialRampToValueAtTime(160, t + 0.03);
      gain.gain.setValueAtTime(0.03, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.03);
    } catch {}
  }
  playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, t); // C5
      osc.frequency.setValueAtTime(659.25, t + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, t + 0.16); // G5
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.35);
    } catch {}
  }
}

class FormFillingTrainer {
  constructor() {
    this.sound = new FormSynth();
    this.currentScenarioKey = 'onboarding';
    this.mouseDiscipline = true;
    this.isRunning = false;
    this.isFinished = false;
    
    // Stopwatch
    this.timer = null;
    this.startTime = 0;
    this.elapsedMs = 0;
    this.keystrokes = 0;
    this.mouseClicks = 0;
    this.mouseWarningTimeout = null;

    this.dom = {
      scenarioSelect: document.getElementById('scenarioSelect'),
      mouseDisciplineCheck: document.getElementById('mouseDisciplineCheck'),
      soundToggleBtn: document.getElementById('soundToggleBtn'),
      resetFormBtn: document.getElementById('resetFormBtn'),

      stopwatchVal: document.getElementById('stopwatchVal'),
      fieldsCompletedVal: document.getElementById('fieldsCompletedVal'),
      keystrokeVal: document.getElementById('keystrokeVal'),
      mouseClicksVal: document.getElementById('mouseClicksVal'),
      penaltySub: document.getElementById('penaltySub'),
      accuracyVal: document.getElementById('accuracyVal'),
      activeFieldHint: document.getElementById('activeFieldHint'),

      targetCardCount: document.getElementById('targetCardCount'),
      targetListContainer: document.getElementById('targetListContainer'),
      practiceForm: document.getElementById('practiceForm'),
      mouseWarning: document.getElementById('mouseWarning'),

      // Modal
      completionModal: document.getElementById('completionModal'),
      modalRawTime: document.getElementById('modalRawTime'),
      modalFinalTime: document.getElementById('modalFinalTime'),
      modalPenaltiesApplied: document.getElementById('modalPenaltiesApplied'),
      modalKeystrokes: document.getElementById('modalKeystrokes'),
      modalGrade: document.getElementById('modalGrade'),
      modalCloseBtn: document.getElementById('modalCloseBtn'),
      modalRestartBtn: document.getElementById('modalRestartBtn')
    };

    this.initEvents();
    this.loadScenario(this.currentScenarioKey);
  }

  initEvents() {
    this.dom.scenarioSelect.addEventListener('change', (e) => {
      this.currentScenarioKey = e.target.value;
      this.loadScenario(this.currentScenarioKey);
    });

    this.dom.mouseDisciplineCheck.addEventListener('change', (e) => {
      this.mouseDiscipline = e.target.checked;
    });

    this.dom.soundToggleBtn.addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled;
      this.dom.soundToggleBtn.textContent = `Sound: ${this.sound.enabled ? 'ON' : 'MUTED'}`;
    });

    this.dom.resetFormBtn.addEventListener('click', () => {
      this.loadScenario(this.currentScenarioKey);
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.dom.completionModal.classList.contains('active')) {
          this.dom.completionModal.classList.remove('active');
        } else {
          this.loadScenario(this.currentScenarioKey);
        }
        return;
      }

      // Track keypresses
      if (!this.isFinished) {
        if (!this.isRunning && (e.key === 'Tab' || e.key.length === 1)) {
          this.startStopwatch();
        }
        this.keystrokes++;
        this.dom.keystrokeVal.textContent = this.keystrokes;
        if (e.key === 'Tab') {
          this.sound.playTab();
        } else if (e.key.length === 1) {
          this.sound.playKey();
        }
      }
    });

    // Detect mouse clicks inside form
    this.dom.practiceForm.addEventListener('click', (e) => {
      if (!this.mouseDiscipline || this.isFinished) return;
      if (e.target.tagName === 'BUTTON' && e.target.type === 'submit') return;

      this.mouseClicks++;
      this.dom.mouseClicksVal.textContent = this.mouseClicks;
      this.dom.penaltySub.textContent = `+${this.mouseClicks * 3}s penalty`;
      this.showMouseWarning();
    });

    // Form submit
    this.dom.practiceForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.validateAllAndSubmit();
    });

    // Modal buttons
    this.dom.modalCloseBtn.addEventListener('click', () => {
      this.dom.completionModal.classList.remove('active');
    });
    this.dom.modalRestartBtn.addEventListener('click', () => {
      this.dom.completionModal.classList.remove('active');
      this.loadScenario(this.currentScenarioKey);
    });
  }

  showMouseWarning() {
    clearTimeout(this.mouseWarningTimeout);
    this.dom.mouseWarning.style.display = 'flex';
    this.mouseWarningTimeout = setTimeout(() => {
      this.dom.mouseWarning.style.display = 'none';
    }, 2500);
  }

  startStopwatch() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startTime = performance.now() - this.elapsedMs;
    this.timer = setInterval(() => {
      this.elapsedMs = performance.now() - this.startTime;
      this.dom.stopwatchVal.textContent = this.formatDuration(this.elapsedMs);
    }, 100);
  }

  stopStopwatch() {
    clearInterval(this.timer);
    this.isRunning = false;
  }

  loadScenario(key) {
    this.stopStopwatch();
    this.isFinished = false;
    this.elapsedMs = 0;
    this.keystrokes = 0;
    this.mouseClicks = 0;
    this.dom.stopwatchVal.textContent = '00:00.0';
    this.dom.keystrokeVal.textContent = '0';
    this.dom.mouseClicksVal.textContent = '0';
    this.dom.penaltySub.textContent = '+0s penalty';
    this.dom.accuracyVal.textContent = '100%';
    this.dom.activeFieldHint.textContent = 'Focus first input to start timer';

    const scenario = SCENARIOS[key];
    this.dom.targetCardCount.textContent = `${scenario.fields.length} Inputs`;

    // Render Target Guide Card
    this.renderTargetGuide(scenario.fields);

    // Render Interactive Form
    this.renderFormFields(scenario.fields);

    this.dom.fieldsCompletedVal.textContent = `0 / ${scenario.fields.length}`;
  }

  renderTargetGuide(fields) {
    const container = this.dom.targetListContainer;
    container.innerHTML = '';

    fields.forEach((field, idx) => {
      const item = document.createElement('div');
      item.className = 'ffp-target-item';
      item.id = `targetGuide_${field.id}`;

      let displayTarget = field.target;
      if (typeof field.target === 'boolean') {
        displayTarget = field.target ? '☑ Checked' : '☐ Unchecked';
      }

      item.innerHTML = `
        <div style="display: flex; flex-direction: column;">
          <span style="font-size: 0.72rem; color: var(--text-secondary);">${idx + 1}. ${field.label}</span>
          <strong style="color: var(--text-primary); font-family: monospace;">${displayTarget}</strong>
        </div>
        <span class="guide-status" style="font-size: 0.8rem; font-weight: 700; color: var(--text-tertiary);">&bull;</span>
      `;
      container.appendChild(item);
    });
  }

  renderFormFields(fields) {
    const form = this.dom.practiceForm;
    form.innerHTML = '';

    fields.forEach((field, idx) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'ffp-field-wrapper';
      wrapper.dataset.fieldId = field.id;

      if (field.type === 'text' || field.type === 'number' || field.type === 'date') {
        wrapper.innerHTML = `
          <label for="field_${field.id}">${idx + 1}. ${field.label}</label>
          <input type="${field.type}" id="field_${field.id}" name="${field.id}" class="form-input" placeholder="${field.placeholder || ''}" autocomplete="off">
        `;
      } else if (field.type === 'select') {
        let opts = '';
        field.options.forEach(opt => {
          opts += `<option value="${opt}">${opt}</option>`;
        });
        wrapper.innerHTML = `
          <label for="field_${field.id}">${idx + 1}. ${field.label}</label>
          <select id="field_${field.id}" name="${field.id}" class="form-select">${opts}</select>
        `;
      } else if (field.type === 'radio') {
        let radios = '';
        field.options.forEach((opt, oIdx) => {
          radios += `
            <label class="ffp-option-label">
              <input type="radio" name="${field.id}" value="${opt}" id="field_${field.id}_${oIdx}">
              <span>${opt}</span>
            </label>
          `;
        });
        wrapper.innerHTML = `
          <label>${idx + 1}. ${field.label}</label>
          <div class="ffp-options-group" role="radiogroup" aria-label="${field.label}">${radios}</div>
        `;
      } else if (field.type === 'checkbox') {
        wrapper.innerHTML = `
          <label class="ffp-option-label" style="width: 100%; padding: 0.6rem 0.85rem;">
            <input type="checkbox" id="field_${field.id}" name="${field.id}">
            <span>${idx + 1}. ${field.label}</span>
          </label>
        `;
      }

      form.appendChild(wrapper);
    });

    // Submit button at bottom
    const submitBtnWrap = document.createElement('div');
    submitBtnWrap.style.marginTop = '1.5rem';
    submitBtnWrap.innerHTML = `
      <button type="submit" id="formSubmitBtn" class="btn btn-primary" style="width: 100%; padding: 0.85rem; font-weight: 700; font-size: 1rem;">
        Submit Form (Press Enter on Button) &rarr;
      </button>
    `;
    form.appendChild(submitBtnWrap);

    // Bind event listeners to all newly rendered inputs
    this.bindFieldListeners();
  }

  bindFieldListeners() {
    const fields = SCENARIOS[this.currentScenarioKey].fields;
    
    fields.forEach((field) => {
      const guideEl = document.getElementById(`targetGuide_${field.id}`);

      if (field.type === 'radio') {
        const radios = this.dom.practiceForm.querySelectorAll(`input[name="${field.id}"]`);
        radios.forEach(radio => {
          radio.addEventListener('focus', () => this.handleFieldFocus(field, guideEl));
          radio.addEventListener('change', () => this.evaluateField(field, guideEl));
        });
      } else {
        const input = document.getElementById(`field_${field.id}`);
        if (!input) return;
        input.addEventListener('focus', () => this.handleFieldFocus(field, guideEl));
        input.addEventListener('input', () => this.evaluateField(field, guideEl));
        input.addEventListener('change', () => this.evaluateField(field, guideEl));
      }
    });
  }

  handleFieldFocus(field, guideEl) {
    if (!this.isRunning && !this.isFinished) {
      this.startStopwatch();
    }

    // Highlight target guide item
    document.querySelectorAll('.ffp-target-item').forEach(el => el.classList.remove('active'));
    if (guideEl) guideEl.classList.add('active');

    // Update guidance hint banner
    let hint = `Active: ${field.label}`;
    if (field.type === 'checkbox') hint += ' &bull; Press Spacebar to toggle checkbox';
    else if (field.type === 'radio') hint += ' &bull; Press Arrow keys to switch radio options';
    else if (field.type === 'select') hint += ' &bull; Press Alt+Down or Arrow keys to choose option';
    else hint += ' &bull; Type value, then press Tab for next field';
    this.dom.activeFieldHint.innerHTML = hint;
  }

  evaluateField(field, guideEl) {
    let currentVal = null;

    if (field.type === 'radio') {
      const checked = this.dom.practiceForm.querySelector(`input[name="${field.id}"]:checked`);
      currentVal = checked ? checked.value : '';
    } else if (field.type === 'checkbox') {
      const cb = document.getElementById(`field_${field.id}`);
      currentVal = cb ? cb.checked : false;
    } else {
      const input = document.getElementById(`field_${field.id}`);
      currentVal = input ? input.value.trim() : '';
    }

    let isMatch = false;
    if (typeof field.target === 'boolean') {
      isMatch = currentVal === field.target;
    } else {
      isMatch = currentVal.toLowerCase() === field.target.toString().toLowerCase();
    }

    if (guideEl) {
      const status = guideEl.querySelector('.guide-status');
      if (isMatch) {
        guideEl.classList.add('completed');
        if (status) {
          status.textContent = '✓ Done';
          status.style.color = 'var(--success)';
        }
      } else {
        guideEl.classList.remove('completed');
        if (status) {
          status.textContent = '•';
          status.style.color = 'var(--text-tertiary)';
        }
      }
    }

    this.updateCompletionCount();
  }

  updateCompletionCount() {
    const fields = SCENARIOS[this.currentScenarioKey].fields;
    let completedCount = 0;

    fields.forEach(field => {
      let isMatch = false;
      if (field.type === 'radio') {
        const checked = this.dom.practiceForm.querySelector(`input[name="${field.id}"]:checked`);
        isMatch = checked && checked.value.toLowerCase() === field.target.toLowerCase();
      } else if (field.type === 'checkbox') {
        const cb = document.getElementById(`field_${field.id}`);
        isMatch = cb && cb.checked === field.target;
      } else {
        const inp = document.getElementById(`field_${field.id}`);
        isMatch = inp && inp.value.trim().toLowerCase() === field.target.toLowerCase();
      }
      if (isMatch) completedCount++;
    });

    this.dom.fieldsCompletedVal.textContent = `${completedCount} / ${fields.length}`;
    const acc = Math.round((completedCount / fields.length) * 100);
    this.dom.accuracyVal.textContent = `${acc}%`;

    return { completedCount, total: fields.length };
  }

  validateAllAndSubmit() {
    const { completedCount, total } = this.updateCompletionCount();

    if (completedCount < total) {
      alert(`Form is incomplete! You have satisfied ${completedCount} out of ${total} required fields. Check the guide panel on the left.`);
      return;
    }

    this.stopStopwatch();
    this.isFinished = true;
    this.sound.playSuccess();

    const rawMs = this.elapsedMs;
    const penaltyMs = this.mouseClicks * 3000;
    const finalMs = rawMs + penaltyMs;

    let grade = 'Keyboard Virtuoso';
    if (this.mouseClicks > 0) grade = 'Mouse Relier (Practice Keyboard Only)';
    else if (finalMs > 45000) grade = 'Methodical Operator';
    else if (finalMs < 20000) grade = 'Grandmaster Tab Navigator';

    this.dom.modalRawTime.textContent = this.formatDuration(rawMs);
    this.dom.modalFinalTime.textContent = this.formatDuration(finalMs);
    this.dom.modalPenaltiesApplied.textContent = `+${this.mouseClicks * 3}s (${this.mouseClicks} clicks)`;
    this.dom.modalKeystrokes.textContent = `${this.keystrokes} keys`;
    this.dom.modalGrade.textContent = grade;

    this.dom.completionModal.classList.add('active');
  }

  formatDuration(ms) {
    const totalSec = Math.floor(ms / 1000);
    const tenths = Math.floor((ms % 1000) / 100);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${tenths}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new FormFillingTrainer();
});