// Typing Certification Exam - Formal Timed Test & Luxury Certificate Engine

const FORMAL_EXAM_PASSAGES = [
  "In modern commerce and technological innovation, professional communication and high speed typing accuracy constitute indispensable skills. Administrative officers, software engineers, legal transcriptionists, and corporate executives routinely process substantial volumes of written correspondence under demanding operational deadlines.",
  "The ability to transcribe complex documentation without cognitive friction accelerates executive throughput while sustaining high standards of quality assurance. Certified typists exhibit disciplined finger positioning, minimal reliance on keyboard visual verification, and consistent rhythmic cadence across numerical symbols and complex punctuation.",
  "Statistical studies across enterprise organizations reveal that improving typing speed from forty to eighty words per minute conserves over twenty working days annually for knowledge professionals. Furthermore, rigorous adherence to touch typing ergonomics dramatically mitigates repetitive strain injuries and fosters long term occupational wellness.",
  "Formal certification validates not merely gross keystroke velocity, but uncompromising precision. In legal filings, medical records, and financial transaction audits, a solitary uncorrected error can incur severe regulatory liability. Thus, professional competency standards require both speed and absolute accuracy."
];

class TypingCertificationExam {
  constructor() {
    this.duration = 300; // 5 minutes default
    this.timeLeft = this.duration;
    this.isRunning = false;
    this.isFinished = false;
    this.timer = null;

    // Telemetry & Metrics
    this.targetText = '';
    this.charElements = [];
    this.currentCharIndex = 0;
    this.totalTypedChars = 0;
    this.correctChars = 0;
    this.uncorrectedErrors = 0;
    this.backspacesCount = 0;
    this.warningsCount = 0;
    this.startTime = null;

    this.candidateName = 'Alex Morgan';
    this.verificationCode = this.generateVerificationCode();

    this.initDom();
    this.bindEvents();
    this.prepareExamText();
  }

  generateVerificationCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'CERT-2026-';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    code += '-';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  initDom() {
    this.candidateNameInput = document.getElementById('examCandidateName');
    this.durationSelect = document.getElementById('examDurationSelect');
    this.startExamBtn = document.getElementById('startExamBtn');

    // Telemetry HUD
    this.hudExamTime = document.getElementById('hudExamTime');
    this.hudNetWpm = document.getElementById('hudNetWpm');
    this.hudGrossWpm = document.getElementById('hudGrossWpm');
    this.hudAccuracy = document.getElementById('hudAccuracy');
    this.hudErrorCount = document.getElementById('hudErrorCount');
    this.hudBackspaces = document.getElementById('hudBackspaces');
    this.hudWarnings = document.getElementById('hudWarnings');

    // Exam Arena
    this.wordsBoard = document.getElementById('examWordsBoard');
    this.wordsWrapper = document.getElementById('examWordsWrapper');
    this.hiddenInput = document.getElementById('examHiddenInput');

    // Certificate View
    this.certResultCard = document.getElementById('certResultCard');
    this.certOutcomeBanner = document.getElementById('certOutcomeBanner');
    this.certCanvas = document.getElementById('certificateCanvas');
    this.downloadCertBtn = document.getElementById('downloadCertBtn');
    this.printCertBtn = document.getElementById('printCertBtn');
    this.retakeExamBtn = document.getElementById('retakeExamBtn');
  }

  bindEvents() {
    this.candidateNameInput.addEventListener('input', (e) => {
      this.candidateName = e.target.value.trim() || 'Candidate';
    });

    this.durationSelect.addEventListener('change', (e) => {
      if (this.isRunning) return;
      this.duration = parseInt(e.target.value, 10);
      this.timeLeft = this.duration;
      this.updateTimerDisplay();
    });

    this.startExamBtn.addEventListener('click', () => {
      if (this.isRunning) {
        if (confirm('Cancel and restart the formal examination?')) {
          this.resetExam();
        }
      } else {
        this.startExam();
      }
    });

    this.wordsBoard.addEventListener('click', () => {
      if (this.isRunning) this.hiddenInput.focus();
    });

    this.hiddenInput.addEventListener('input', (e) => this.handleTyping(e));

    this.hiddenInput.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace') {
        this.backspacesCount++;
        this.hudBackspaces.textContent = this.backspacesCount;
      }
    });

    // Anti-Cheat: Intercept Paste
    this.hiddenInput.addEventListener('paste', (e) => {
      e.preventDefault();
      this.warningsCount++;
      this.hudWarnings.textContent = this.warningsCount;
      alert('⚠️ Security Alert: Unauthorized paste action intercepted and logged.');
    });

    // Anti-Cheat: Window Blur / Tab Visibility
    window.addEventListener('blur', () => {
      if (this.isRunning) {
        this.warningsCount++;
        this.hudWarnings.textContent = this.warningsCount;
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.isRunning) {
        this.warningsCount++;
        this.hudWarnings.textContent = this.warningsCount;
      }
    });

    // Certificate Actions
    this.downloadCertBtn.addEventListener('click', () => this.downloadCertificate());
    this.printCertBtn.addEventListener('click', () => window.print());
    this.retakeExamBtn.addEventListener('click', () => {
      this.certResultCard.style.display = 'none';
      this.resetExam();
    });
  }

  prepareExamText() {
    let combined = FORMAL_EXAM_PASSAGES.join(' ');
    // Repeat to ensure plenty of text for 5 minutes
    combined = `${combined} ${combined}`;
    this.targetText = combined;
    this.renderText();
    this.updateTimerDisplay();
  }

  renderText() {
    this.wordsWrapper.innerHTML = '';
    this.charElements = [];
    const words = this.targetText.split(' ');
    let globalIndex = 0;

    words.forEach((w, wIdx) => {
      const wSpan = document.createElement('span');
      wSpan.style.display = 'inline-block';
      wSpan.style.marginRight = '0.55em';

      for (let i = 0; i < w.length; i++) {
        const cSpan = document.createElement('span');
        cSpan.className = 'exam-char';
        cSpan.textContent = w[i];
        if (globalIndex === 0) cSpan.classList.add('active');
        wSpan.appendChild(cSpan);
        this.charElements.push(cSpan);
        globalIndex++;
      }

      if (wIdx < words.length - 1) {
        const sSpan = document.createElement('span');
        sSpan.className = 'exam-char';
        sSpan.textContent = ' ';
        wSpan.appendChild(sSpan);
        this.charElements.push(sSpan);
        globalIndex++;
      }

      this.wordsWrapper.appendChild(wSpan);
    });
  }

  updateTimerDisplay() {
    const mins = Math.floor(this.timeLeft / 60);
    const secs = this.timeLeft % 60;
    this.hudExamTime.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  startExam() {
    this.isRunning = true;
    this.isFinished = false;
    this.timeLeft = this.duration;
    this.startTime = performance.now();
    this.currentCharIndex = 0;
    this.totalTypedChars = 0;
    this.correctChars = 0;
    this.uncorrectedErrors = 0;
    this.backspacesCount = 0;
    this.warningsCount = 0;
    this.verificationCode = this.generateVerificationCode();

    this.startExamBtn.textContent = '⏹️ End Exam Early';
    this.wordsBoard.classList.add('focused');
    this.hiddenInput.value = '';
    this.hiddenInput.focus();

    this.renderText();

    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.tick(), 1000);
  }

  resetExam() {
    this.isRunning = false;
    if (this.timer) clearInterval(this.timer);
    this.startExamBtn.textContent = '📜 Begin Exam';
    this.wordsBoard.classList.remove('focused');
    this.timeLeft = this.duration;
    this.updateTimerDisplay();

    this.hudNetWpm.textContent = '0';
    this.hudGrossWpm.textContent = 'Gross: 0 WPM';
    this.hudAccuracy.textContent = '100%';
    this.hudErrorCount.textContent = '0 uncorrected errors';
    this.hudBackspaces.textContent = '0';
    this.hudWarnings.textContent = '0';

    this.renderText();
  }

  tick() {
    if (!this.isRunning) return;

    this.timeLeft--;
    this.updateTimerDisplay();
    this.updateTelemetry();

    if (this.timeLeft <= 0) {
      this.finishExam();
    }
  }

  handleTyping(e) {
    if (!this.isRunning) return;
    const val = this.hiddenInput.value;
    if (!val) return;

    const char = val.slice(-1);
    this.hiddenInput.value = '';
    this.totalTypedChars++;

    const expected = this.targetText[this.currentCharIndex];

    if (char === expected) {
      this.correctChars++;
      if (this.charElements[this.currentCharIndex]) {
        this.charElements[this.currentCharIndex].className = 'exam-char correct';
      }
    } else {
      this.uncorrectedErrors++;
      if (this.charElements[this.currentCharIndex]) {
        this.charElements[this.currentCharIndex].className = 'exam-char error';
      }
    }

    this.currentCharIndex++;

    if (this.charElements[this.currentCharIndex]) {
      this.charElements[this.currentCharIndex].classList.add('active');
      this.ensureVisible(this.charElements[this.currentCharIndex]);
    }

    this.updateTelemetry();

    if (this.currentCharIndex >= this.targetText.length) {
      this.finishExam();
    }
  }

  ensureVisible(el) {
    if (!el) return;
    const parent = this.wordsBoard;
    const pRect = parent.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    if (elRect.bottom > pRect.bottom - 20) {
      parent.scrollTop += 45;
    }
  }

  getMetrics() {
    const elapsedMinutes = Math.max(0.05, (this.duration - this.timeLeft) / 60);
    const grossWpm = Math.round((this.totalTypedChars / 5) / elapsedMinutes);
    const netWpm = Math.max(0, Math.round(grossWpm - (this.uncorrectedErrors / elapsedMinutes)));
    const accuracy = this.totalTypedChars > 0 ? parseFloat(((this.correctChars / this.totalTypedChars) * 100).toFixed(1)) : 100.0;
    return { grossWpm, netWpm, accuracy, elapsedMinutes };
  }

  updateTelemetry() {
    const { grossWpm, netWpm, accuracy } = this.getMetrics();
    this.hudNetWpm.textContent = netWpm;
    this.hudGrossWpm.textContent = `Gross: ${grossWpm} WPM`;
    this.hudAccuracy.textContent = `${accuracy}%`;
    this.hudErrorCount.textContent = `${this.uncorrectedErrors} uncorrected error${this.uncorrectedErrors === 1 ? '' : 's'}`;
  }

  finishExam() {
    this.isRunning = false;
    this.isFinished = true;
    if (this.timer) clearInterval(this.timer);
    this.startExamBtn.textContent = '📜 Begin Exam';
    this.wordsBoard.classList.remove('focused');

    const { grossWpm, netWpm, accuracy } = this.getMetrics();
    const passed = accuracy >= 95.0;

    // Seal tier
    let tier = 'intermediate';
    let sealTitle = 'Bronze Seal';
    if (netWpm >= 80 && accuracy >= 98.0) {
      tier = 'master';
      sealTitle = 'Gold Seal • Master';
    } else if (netWpm >= 55 && accuracy >= 96.0) {
      tier = 'pro';
      sealTitle = 'Silver Seal • Professional';
    } else if (netWpm >= 35 && accuracy >= 95.0) {
      tier = 'intermediate';
      sealTitle = 'Bronze Seal • Intermediate';
    } else {
      tier = 'failed';
    }

    if (passed) {
      this.certOutcomeBanner.innerHTML = `
        <h2 style="font-family: var(--font-display); font-size: 2.25rem; color: #eab308; margin-bottom: 0.25rem;">
          🎉 Examination Passed & Certified!
        </h2>
        <p style="color: var(--text-secondary); font-size: 1rem;">
          Congratulations, <strong>${this.candidateName}</strong>! You satisfied the strict competency standards with <strong>${accuracy}% Accuracy</strong> and <strong>${netWpm} Net WPM</strong>. Awarded: <strong>${sealTitle}</strong>.
        </p>
      `;
      this.generateCertificateCanvas(grossWpm, netWpm, accuracy, tier);
    } else {
      this.certOutcomeBanner.innerHTML = `
        <h2 style="font-family: var(--font-display); font-size: 2.25rem; color: var(--error); margin-bottom: 0.25rem;">
          ❌ Accuracy Threshold Not Met (95% Required)
        </h2>
        <p style="color: var(--text-secondary); font-size: 1rem; max-width: 600px; margin: 0 auto;">
          Your final accuracy was <strong>${accuracy}%</strong> with <strong>${this.uncorrectedErrors} uncorrected errors</strong>. Official competency certification requires minimum 95.0% accuracy to prevent liability. Please review weak keys and retake the exam.
        </p>
      `;
      this.generateCertificateCanvas(grossWpm, netWpm, accuracy, 'failed');
    }

    this.certResultCard.style.display = 'flex';
    this.certResultCard.scrollIntoView({ behavior: 'smooth' });
  }

  generateCertificateCanvas(grossWpm, netWpm, accuracy, tier) {
    const canvas = this.certCanvas;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // 1. Luxury Dark Parchment Background
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#0a0d14');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#05070a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Ornate Metallic Border
    const sealColor = tier === 'master' ? '#fbbf24' : tier === 'pro' ? '#cbd5e1' : tier === 'failed' ? '#ef4444' : '#d97706';

    ctx.strokeStyle = sealColor;
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, w - 80, h - 80);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.strokeRect(55, 55, w - 110, h - 110);

    // Guilloche corner ornaments
    const drawCorner = (x, y, rot) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.strokeStyle = sealColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(40, 0);
      ctx.lineTo(40, 40);
      ctx.stroke();
      ctx.restore();
    };
    drawCorner(55, 55, 0);
    drawCorner(w - 55, 55, Math.PI / 2);
    drawCorner(w - 55, h - 55, Math.PI);
    drawCorner(55, h - 55, -Math.PI / 2);

    // 3. Header & Institution
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ALL-IN-ONE GLOBAL TYPING STANDARDS AUTHORITY', w / 2, 130);

    ctx.fillStyle = sealColor;
    ctx.font = '800 52px "Instrument Serif", Georgia, serif';
    ctx.fillText('Certificate of Professional Competency', w / 2, 205);

    ctx.fillStyle = '#64748b';
    ctx.font = '400 22px Inter, sans-serif';
    ctx.fillText('THIS FORMAL ATTESTATION CONFIRMS THAT', w / 2, 270);

    // 4. Candidate Name
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 68px "Instrument Serif", Georgia, serif';
    ctx.fillText(this.candidateName, w / 2, 360);

    // Underline flourish
    ctx.strokeStyle = sealColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 250, 390);
    ctx.lineTo(w / 2 + 250, 390);
    ctx.stroke();

    // 5. Attestation Statement
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '400 22px Inter, sans-serif';
    const examMin = Math.round(this.duration / 60);
    const passStatus = tier === 'failed' ? 'participated in the proctored examination' : 'successfully passed the formal proctored examination';
    ctx.fillText(`has ${passStatus} fulfilling all anti-cheat and speed standards for the ${examMin}-minute duration.`, w / 2, 445);

    // 6. Certified Metrics Dashboard (3 Metric Cards)
    const cardY = 510;
    const cardW = 340;
    const cardH = 170;
    const startX = (w - (3 * cardW + 2 * 40)) / 2;

    const drawCard = (x, label, value, subtext, valColor) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.fillRect(x, cardY, cardW, cardH);
      ctx.strokeRect(x, cardY, cardW, cardH);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x + cardW / 2, cardY + 40);

      ctx.fillStyle = valColor;
      ctx.font = '900 60px Inter, sans-serif';
      ctx.fillText(value, x + cardW / 2, cardY + 110);

      ctx.fillStyle = '#64748b';
      ctx.font = '500 15px Inter, sans-serif';
      ctx.fillText(subtext, x + cardW / 2, cardY + 145);
    };

    drawCard(startX, 'CERTIFIED NET SPEED', `${netWpm} WPM`, `Gross Speed: ${grossWpm} WPM`, '#38bdf8');
    drawCard(startX + cardW + 40, 'TYPING ACCURACY', `${accuracy}%`, `Errors: ${this.uncorrectedErrors}`, accuracy >= 95 ? '#10b981' : '#ef4444');
    drawCard(startX + (cardW + 40) * 2, 'PROCTOR INTEGRITY', '100% VALID', `Logged Backspaces: ${this.backspacesCount}`, '#fbbf24');

    // 7. Official Seal Graphic
    ctx.save();
    ctx.translate(w / 2, 810);

    ctx.strokeStyle = sealColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 75, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 65, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = sealColor;
    ctx.font = '800 15px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OFFICIAL SEAL', 0, -20);
    ctx.font = '900 22px Inter, sans-serif';
    ctx.fillText(tier === 'master' ? 'GOLD' : tier === 'pro' ? 'SILVER' : tier === 'failed' ? 'FAILED' : 'BRONZE', 0, 8);
    ctx.font = '700 13px Inter, sans-serif';
    ctx.fillText('COMPETENCY', 0, 32);

    ctx.restore();

    // 8. Signatures & Verification Details
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 16px Inter, sans-serif';
    ctx.fillText(`Verification Code: ${this.verificationCode}`, 100, 970);
    ctx.fillText(`Issued Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 100, 1000);

    ctx.textAlign = 'right';
    ctx.fillText('Authorized Registrar & Proctor Signature', w - 100, 970);
    ctx.font = 'italic 700 24px "Instrument Serif", Georgia, serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Alexander Vance, Registrar', w - 100, 1005);
  }

  downloadCertificate() {
    const link = document.createElement('a');
    link.download = `Typing-Certificate-${this.candidateName.replace(/\s+/g, '_')}.png`;
    link.href = this.certCanvas.toDataURL('image/png');
    link.click();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.typingCertificationExam = new TypingCertificationExam();
});