// Password Strength Analyzer & Generator - Complete Client-Side Implementation
document.addEventListener('DOMContentLoaded', () => {
  // Elements - Auditor
  const passwordInput = document.getElementById('password-input');
  const toggleVisibilityBtn = document.getElementById('toggle-visibility-btn');
  const clearPasswordBtn = document.getElementById('clear-password-btn');
  const eyeIcon = document.getElementById('eye-icon');
  
  const scoreText = document.getElementById('score-text');
  const strengthBadge = document.getElementById('strength-badge');
  const meterSegments = document.querySelectorAll('.meter-segment');
  
  const metricEntropy = document.getElementById('metric-entropy');
  const metricCrackTime = document.getElementById('metric-crack-time');
  const metricLength = document.getElementById('metric-length');
  const metricPool = document.getElementById('metric-pool');

  const checkLength = document.getElementById('check-length');
  const checkUpper = document.getElementById('check-upper');
  const checkLower = document.getElementById('check-lower');
  const checkNumbers = document.getElementById('check-numbers');
  const checkSymbols = document.getElementById('check-symbols');
  const checkPatterns = document.getElementById('check-patterns');
  const patternsLabel = document.getElementById('patterns-label');

  // Elements - Generator
  const genPasswordText = document.getElementById('gen-password-text');
  const copyGenBtn = document.getElementById('copy-gen-btn');
  const genLengthSlider = document.getElementById('gen-length-slider');
  const genLengthVal = document.getElementById('gen-length-val');
  const optUpper = document.getElementById('opt-upper');
  const optLower = document.getElementById('opt-lower');
  const optNumbers = document.getElementById('opt-numbers');
  const optSymbols = document.getElementById('opt-symbols');
  const optAvoidAmbiguous = document.getElementById('opt-avoid-ambiguous');
  const generateBtn = document.getElementById('generate-btn');
  const useInAuditorBtn = document.getElementById('use-in-auditor-btn');

  // Elements - Toast
  const appToast = document.getElementById('app-toast');
  const toastMessage = document.getElementById('toast-message');
  let toastTimer = null;

  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastMessage.textContent = msg;
    appToast.classList.add('show');
    toastTimer = setTimeout(() => {
      appToast.classList.remove('show');
    }, 2500);
  }

  // Icons
  const SVG_PASS = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  const SVG_FAIL = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>`;
  const SVG_WARN = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

  // Common dictionary & keyboard patterns
  const COMMON_WEAK_WORDS = [
    'password', 'pass123', 'admin', 'administrator', 'root', 'qwerty', 'azerty',
    'welcome', 'monkey', 'dragon', 'master', 'football', 'baseball', 'princess',
    'shadow', 'sunshine', 'letmein', 'trustno1', 'superman', 'iloveyou', 'starwars',
    '123456', '12345678', '123456789', '111111', '000000', 'login', 'testing'
  ];

  const KEYBOARD_WALKS = [
    'qwerty', 'asdfgh', 'zxcvbn', 'qwertz', 'azerty', '12345', '67890',
    'qazwsx', 'edcrfv', 'tgbyhn', 'yhnujm', 'ikm'
  ];

  // Helper to format crack time
  function formatCrackTime(seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0.001) return 'Instant (< 1 ms)';
    if (seconds < 1) return 'Instant (< 1 sec)';
    if (seconds < 60) return `${Math.max(1, Math.round(seconds))} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 3.1536e9) return `${Math.round(seconds / 31536000)} years`;
    if (seconds < 3.1536e11) return `${(seconds / 31536000).toLocaleString('en-US', { maximumFractionDigits: 0 })} years`;
    if (seconds < 3.1536e13) return `${(seconds / 3.1536e9).toLocaleString('en-US', { maximumFractionDigits: 0 })} centuries`;
    return 'Centuries (Near unbreakable)';
  }

  // Check common patterns
  function analyzePatterns(pwd) {
    if (!pwd) return { found: false, detail: 'No input' };
    const lower = pwd.toLowerCase();

    // Check common list
    for (const w of COMMON_WEAK_WORDS) {
      if (lower.includes(w)) {
        return { found: true, detail: `Common password word found: "${w}"` };
      }
    }

    // Check keyboard walks
    for (const walk of KEYBOARD_WALKS) {
      if (lower.includes(walk)) {
        return { found: true, detail: `Keyboard walk pattern found: "${walk}"` };
      }
    }

    // Check repetitive runs (e.g. "aaa", "111")
    if (/(.)\1{2,}/.test(pwd)) {
      return { found: true, detail: 'Repetitive consecutive characters detected' };
    }

    // Check sequential ASCII sequences (e.g., abcde, 12345)
    for (let i = 0; i < pwd.length - 2; i++) {
      const code1 = pwd.charCodeAt(i);
      const code2 = pwd.charCodeAt(i + 1);
      const code3 = pwd.charCodeAt(i + 2);
      if ((code2 === code1 + 1 && code3 === code2 + 1) || (code2 === code1 - 1 && code3 === code2 - 1)) {
        return { found: true, detail: 'Sequential alphabet or number progression' };
      }
    }

    return { found: false, detail: 'No common patterns or repetitions' };
  }

  // Audit Password
  function auditPassword() {
    const pwd = passwordInput.value;
    const len = pwd.length;

    metricLength.textContent = `${len} chars`;

    if (!pwd) {
      scoreText.textContent = '0%';
      strengthBadge.textContent = 'Very Weak';
      strengthBadge.className = 'strength-badge strength-very-weak';
      meterSegments.forEach(s => {
        s.style.background = 'rgba(255, 255, 255, 0.06)';
      });
      metricEntropy.textContent = '0.0 bits';
      metricCrackTime.textContent = 'Instant';
      metricPool.textContent = '0 chars';

      // Reset checklist
      [checkLength, checkUpper, checkLower, checkNumbers, checkSymbols, checkPatterns].forEach(el => {
        el.className = 'checklist-item';
        el.querySelector('.check-icon').innerHTML = SVG_FAIL;
      });
      patternsLabel.textContent = 'Pattern Analysis: No repetitive or common dictionary sequences';
      return;
    }

    // Character Sets Detection
    let poolSize = 0;
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumbers = /[0-9]/.test(pwd);
    const hasSymbols = /[^a-zA-Z0-9]/.test(pwd);

    if (hasLower) poolSize += 26;
    if (hasUpper) poolSize += 26;
    if (hasNumbers) poolSize += 10;
    if (hasSymbols) poolSize += 33;

    metricPool.textContent = `${poolSize} chars`;

    // Entropy calculation: E = L * log2(R)
    let rawEntropy = poolSize > 0 ? len * Math.log2(poolSize) : 0;
    
    // Pattern inspection
    const patternInfo = analyzePatterns(pwd);
    let entropyPenalty = 0;
    if (patternInfo.found) {
      entropyPenalty += 20; // 20 bits penalty for dictionary / walk patterns
    }

    // Unique characters penalty if low diversity
    const uniqueChars = new Set(pwd).size;
    if (uniqueChars < len / 2) {
      entropyPenalty += (len - uniqueChars) * 1.5;
    }

    const effectiveEntropy = Math.max(0, rawEntropy - entropyPenalty);
    metricEntropy.textContent = `${effectiveEntropy.toFixed(1)} bits`;

    // Crack time (based on 10 billion guesses/sec GPU cluster)
    // Combinations ~ 2^effectiveEntropy
    const combinations = Math.pow(2, Math.min(effectiveEntropy, 128));
    const GPU_GUESSES_PER_SEC = 10_000_000_000;
    const crackSeconds = combinations / GPU_GUESSES_PER_SEC;
    metricCrackTime.textContent = formatCrackTime(crackSeconds);

    // Update Checklist items
    const updateChecklist = (elem, passed, isWarning = false) => {
      elem.className = `checklist-item ${passed ? 'passed' : (isWarning ? 'warning' : '')}`;
      elem.querySelector('.check-icon').innerHTML = passed ? SVG_PASS : (isWarning ? SVG_WARN : SVG_FAIL);
    };

    updateChecklist(checkLength, len >= 12);
    updateChecklist(checkUpper, hasUpper);
    updateChecklist(checkLower, hasLower);
    updateChecklist(checkNumbers, hasNumbers);
    updateChecklist(checkSymbols, hasSymbols);

    if (patternInfo.found) {
      updateChecklist(checkPatterns, false, true);
      patternsLabel.textContent = `Warning: ${patternInfo.detail}`;
    } else {
      updateChecklist(checkPatterns, true);
      patternsLabel.textContent = `Pattern Analysis: Passed (${patternInfo.detail})`;
    }

    // Compute Strength Score (0 to 100)
    let score = 0;
    // Length contribution (up to 40)
    score += Math.min(len * 2.5, 40);
    // Variety contribution (up to 30)
    let varietyCount = (hasLower ? 1 : 0) + (hasUpper ? 1 : 0) + (hasNumbers ? 1 : 0) + (hasSymbols ? 1 : 0);
    score += varietyCount * 7.5;
    // Entropy contribution (up to 30)
    score += Math.min((effectiveEntropy / 80) * 30, 30);
    // Deduct penalty if pattern found
    if (patternInfo.found) {
      score = Math.max(10, score - 30);
    }
    // Hard clamp
    if (len < 6) score = Math.min(score, 18);
    score = Math.round(Math.min(100, Math.max(0, score)));
    scoreText.textContent = `${score}%`;

    // Segments and color classes
    // Tier definitions
    let tierClass = 'strength-very-weak';
    let tierLabel = 'Very Weak';
    let activeSegments = 1;
    let segColor = '#ef4444';

    if (score >= 80) {
      tierClass = 'strength-very-strong';
      tierLabel = 'Very Strong';
      activeSegments = 5;
      segColor = '#10b981';
    } else if (score >= 60) {
      tierClass = 'strength-strong';
      tierLabel = 'Strong';
      activeSegments = 4;
      segColor = '#3b82f6';
    } else if (score >= 40) {
      tierClass = 'strength-fair';
      tierLabel = 'Fair';
      activeSegments = 3;
      segColor = '#eab308';
    } else if (score >= 20) {
      tierClass = 'strength-weak';
      tierLabel = 'Weak';
      activeSegments = 2;
      segColor = '#f97316';
    } else {
      tierClass = 'strength-very-weak';
      tierLabel = 'Very Weak';
      activeSegments = 1;
      segColor = '#ef4444';
    }

    strengthBadge.textContent = tierLabel;
    strengthBadge.className = `strength-badge ${tierClass}`;

    meterSegments.forEach((seg, idx) => {
      if (idx < activeSegments) {
        seg.style.background = segColor;
      } else {
        seg.style.background = 'rgba(255, 255, 255, 0.06)';
      }
    });
  }

  // Toggle Visibility
  let isPasswordVisible = false;
  toggleVisibilityBtn.addEventListener('click', () => {
    isPasswordVisible = !isPasswordVisible;
    passwordInput.type = isPasswordVisible ? 'text' : 'password';
    eyeIcon.innerHTML = isPasswordVisible
      ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`
      : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
  });

  // Clear Input
  clearPasswordBtn.addEventListener('click', () => {
    passwordInput.value = '';
    passwordInput.focus();
    auditPassword();
  });

  passwordInput.addEventListener('input', auditPassword);

  // --- Secure Password Generator ---
  const CHARSETS = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?/'
  };

  const AMBIGUOUS = /[l1IO0|`]/g;

  function generateSecurePassword() {
    const len = parseInt(genLengthSlider.value, 10);
    let charset = '';
    const guaranteedPools = [];

    if (optUpper.checked) {
      let pool = CHARSETS.upper;
      if (optAvoidAmbiguous.checked) pool = pool.replace(AMBIGUOUS, '');
      charset += pool;
      guaranteedPools.push(pool);
    }
    if (optLower.checked) {
      let pool = CHARSETS.lower;
      if (optAvoidAmbiguous.checked) pool = pool.replace(AMBIGUOUS, '');
      charset += pool;
      guaranteedPools.push(pool);
    }
    if (optNumbers.checked) {
      let pool = CHARSETS.numbers;
      if (optAvoidAmbiguous.checked) pool = pool.replace(AMBIGUOUS, '');
      charset += pool;
      guaranteedPools.push(pool);
    }
    if (optSymbols.checked) {
      let pool = CHARSETS.symbols;
      if (optAvoidAmbiguous.checked) pool = pool.replace(AMBIGUOUS, '');
      charset += pool;
      guaranteedPools.push(pool);
    }

    if (!charset) {
      showToast('Please select at least one character type!');
      return '';
    }

    const randomBuffer = new Uint32Array(len);
    window.crypto.getRandomValues(randomBuffer);

    const chars = [];

    // Ensure at least one char from each enabled pool
    guaranteedPools.forEach((pool, idx) => {
      if (chars.length < len) {
        const poolBuffer = new Uint32Array(1);
        window.crypto.getRandomValues(poolBuffer);
        chars.push(pool[poolBuffer[0] % pool.length]);
      }
    });

    // Fill remaining slots
    while (chars.length < len) {
      const rnd = randomBuffer[chars.length];
      chars.push(charset[rnd % charset.length]);
    }

    // Cryptographic Fisher-Yates shuffle
    for (let i = chars.length - 1; i > 0; i--) {
      const rndBuf = new Uint32Array(1);
      window.crypto.getRandomValues(rndBuf);
      const j = rndBuf[0] % (i + 1);
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    const generated = chars.join('');
    genPasswordText.textContent = generated;
    genPasswordText.style.color = 'var(--text-primary)';
    return generated;
  }

  genLengthSlider.addEventListener('input', () => {
    genLengthVal.textContent = genLengthSlider.value;
    generateSecurePassword();
  });

  [optUpper, optLower, optNumbers, optSymbols, optAvoidAmbiguous].forEach(opt => {
    opt.addEventListener('change', generateSecurePassword);
  });

  generateBtn.addEventListener('click', () => {
    generateSecurePassword();
    showToast('New secure password generated!');
  });

  copyGenBtn.addEventListener('click', () => {
    const pwd = genPasswordText.textContent;
    if (!pwd || pwd.includes('Click Generate')) return;
    navigator.clipboard.writeText(pwd).then(() => {
      showToast('Generated password copied to clipboard!');
    });
  });

  useInAuditorBtn.addEventListener('click', () => {
    const pwd = genPasswordText.textContent;
    if (!pwd || pwd.includes('Click Generate')) {
      const newPwd = generateSecurePassword();
      passwordInput.value = newPwd;
    } else {
      passwordInput.value = pwd;
    }
    auditPassword();
    showToast('Password loaded into Security Auditor!');
    passwordInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // Initial setup: generate a default password
  generateSecurePassword();
  auditPassword();
});