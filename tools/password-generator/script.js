// Password Generator Logic
document.addEventListener('DOMContentLoaded', () => {
  const lengthSlider = document.getElementById('length');
  const lengthVal = document.getElementById('length-val');
  const upperCb = document.getElementById('upper');
  const lowerCb = document.getElementById('lower');
  const numbersCb = document.getElementById('numbers');
  const symbolsCb = document.getElementById('symbols');
  const generateBtn = document.getElementById('generate');
  const outputBox = document.getElementById('password-output');
  const copyBtn = document.getElementById('copy-btn');
  const strengthBar = document.getElementById('strength-bar');
  const strengthText = document.getElementById('strength-text');

  const UPPER_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const LOWER_CHARS = 'abcdefghijklmnopqrstuvwxyz';
  const NUMBER_CHARS = '0123456789';
  const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  lengthSlider.addEventListener('input', () => {
    lengthVal.textContent = lengthSlider.value;
    generatePassword();
  });

  function generatePassword() {
    const length = parseInt(lengthSlider.value);
    let charPool = '';
    let typesCount = 0;
    
    if (upperCb.checked) { charPool += UPPER_CHARS; typesCount++; }
    if (lowerCb.checked) { charPool += LOWER_CHARS; typesCount++; }
    if (numbersCb.checked) { charPool += NUMBER_CHARS; typesCount++; }
    if (symbolsCb.checked) { charPool += SYMBOL_CHARS; typesCount++; }

    if (!charPool) {
      outputBox.textContent = 'Please select at least one character type.';
      outputBox.style.color = 'var(--text-tertiary)';
      updateStrength(0, 0);
      return;
    }

    let password = '';
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
      password += charPool[randomValues[i] % charPool.length];
    }

    outputBox.textContent = password;
    outputBox.style.color = 'var(--text-primary)';
    
    const poolSize = charPool.length;
    const entropy = length * Math.log2(poolSize);
    updateStrength(entropy, typesCount);
  }

  function updateStrength(entropy, typesCount) {
    let pct = 0;
    let color = 'var(--error)';
    let label = 'Very Weak';

    if (entropy > 0) {
      pct = Math.min(100, (entropy / 120) * 100);
      if (entropy < 40 || typesCount < 2) {
        color = 'var(--error)';
        label = 'Weak';
      } else if (entropy < 65 || typesCount < 3) {
        color = 'var(--warning)';
        label = 'Medium';
      } else {
        color = 'var(--success)';
        label = 'Strong';
      }
    }

    strengthBar.style.width = `${pct}%`;
    strengthBar.style.backgroundColor = color;
    strengthText.textContent = entropy > 0 ? `${label} (${Math.round(entropy)} bits entropy)` : 'Select options';
  }

  generateBtn.addEventListener('click', generatePassword);

  copyBtn.addEventListener('click', () => {
    const pwd = outputBox.textContent;
    if (!pwd || pwd.startsWith('Please')) return;
    navigator.clipboard.writeText(pwd).then(() => {
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
        copyBtn.classList.remove('copied');
      }, 2000);
    });
  });

  // Event listeners for checkboxes to auto-regenerate
  [upperCb, lowerCb, numbersCb, symbolsCb].forEach(cb => {
    cb.addEventListener('change', generatePassword);
  });

  generatePassword();
});