// HEX to RGBA Two-Way Color & Alpha Converter

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const hexInput = document.getElementById('hex-code-input');
  const nativePicker = document.getElementById('native-picker');
  const presetStrip = document.getElementById('preset-strip');

  const rangeRed = document.getElementById('range-red');
  const numRed = document.getElementById('num-red');
  const labelRedHex = document.getElementById('label-red-hex');

  const rangeGreen = document.getElementById('range-green');
  const numGreen = document.getElementById('num-green');
  const labelGreenHex = document.getElementById('label-green-hex');

  const rangeBlue = document.getElementById('range-blue');
  const numBlue = document.getElementById('num-blue');
  const labelBlueHex = document.getElementById('label-blue-hex');

  const rangeAlpha = document.getElementById('range-alpha');
  const numAlpha = document.getElementById('num-alpha');
  const labelAlphaMeta = document.getElementById('label-alpha-meta');
  const alphaPills = document.querySelectorAll('.alpha-pill');

  // Preview elements
  const previewFill = document.getElementById('preview-color-fill');
  const previewSolidPip = document.getElementById('preview-solid-pip');
  const previewAlphaPip = document.getElementById('preview-alpha-pip');
  const previewSolidHex = document.getElementById('preview-solid-hex');
  const previewAlphaPct = document.getElementById('preview-alpha-pct');

  // Outputs
  const valCssRgba = document.getElementById('val-css-rgba');
  const valCssRgbModern = document.getElementById('val-css-rgb-modern');
  const valHex8 = document.getElementById('val-hex-8');
  const valHex6 = document.getElementById('val-hex-6');
  const valCssVar = document.getElementById('val-css-var');
  const valCssHsla = document.getElementById('val-css-hsla');
  const valHexAndroid = document.getElementById('val-hex-android');

  const copyButtons = document.querySelectorAll('.copy-action-btn');
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');

  // Curated presets
  const presets = [
    { hex: '3B82F6', alpha: 0.5, name: 'Royal Blue' },
    { hex: '10B981', alpha: 0.8, name: 'Emerald' },
    { hex: 'F59E0B', alpha: 0.65, name: 'Amber Gold' },
    { hex: 'EF4444', alpha: 0.7, name: 'Ruby Crimson' },
    { hex: '8B5CF6', alpha: 0.6, name: 'Vibrant Purple' },
    { hex: 'EC4899', alpha: 0.5, name: 'Pink Rose' },
    { hex: '06B6D4', alpha: 0.85, name: 'Cyan Aqua' },
    { hex: '6366F1', alpha: 0.75, name: 'Indigo' },
    { hex: '14B8A6', alpha: 0.45, name: 'Teal' },
    { hex: 'F97316', alpha: 0.8, name: 'Sunset Orange' },
    { hex: '64748B', alpha: 0.5, name: 'Slate Gray' },
    { hex: 'FFFFFF', alpha: 0.2, name: 'Frosted Glass' }
  ];

  // Populate preset chips
  if (presetStrip) {
    presetStrip.innerHTML = '';
    presets.forEach(p => {
      const chip = document.createElement('div');
      chip.className = 'preset-chip';
      chip.style.backgroundColor = `#${p.hex}`;
      chip.title = `${p.name} (#${p.hex})`;
      chip.addEventListener('click', () => {
        applyState(
          parseInt(p.hex.substring(0, 2), 16),
          parseInt(p.hex.substring(2, 4), 16),
          parseInt(p.hex.substring(4, 6), 16),
          p.alpha
        );
      });
      presetStrip.appendChild(chip);
    });
  }

  // State
  let r = 59;
  let g = 130;
  let b = 246;
  let a = 0.5;

  function toHex(val) {
    const clamped = Math.max(0, Math.min(255, Math.round(val)));
    return clamped.toString(16).padStart(2, '0').toUpperCase();
  }

  function rgbToHsl(red, green, blue) {
    const rNorm = red / 255;
    const gNorm = green / 255;
    const bNorm = blue / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
        case gNorm: h = (bNorm - rNorm) / d + 2; break;
        case bNorm: h = (rNorm - gNorm) / d + 4; break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  function updateUI() {
    const rHex = toHex(r);
    const gHex = toHex(g);
    const bHex = toHex(b);
    const alpha255 = Math.round(a * 255);
    const aHex = toHex(alpha255);
    const roundA = Math.round(a * 100) / 100;
    const pctA = Math.round(a * 100);

    // Inputs update
    rangeRed.value = r;
    numRed.value = r;
    labelRedHex.textContent = `HEX: ${rHex}`;

    rangeGreen.value = g;
    numGreen.value = g;
    labelGreenHex.textContent = `HEX: ${gHex}`;

    rangeBlue.value = b;
    numBlue.value = b;
    labelBlueHex.textContent = `HEX: ${bHex}`;

    rangeAlpha.value = pctA;
    numAlpha.value = roundA.toFixed(2);
    labelAlphaMeta.textContent = `${pctA}% | Hex: ${aHex}`;

    // Picker & Hex input
    const hex6 = `${rHex}${gHex}${bHex}`;
    const hex8 = `${rHex}${gHex}${bHex}${aHex}`;
    nativePicker.value = `#${hex6}`;
    hexInput.value = hex8;

    // Alpha pills active state
    alphaPills.forEach(pill => {
      const pillVal = parseFloat(pill.getAttribute('data-alpha'));
      if (Math.abs(pillVal - a) < 0.03) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    // Preview
    const rgbaCss = `rgba(${r}, ${g}, ${b}, ${roundA})`;
    const rgbModern = `rgb(${r} ${g} ${b} / ${roundA})`;
    previewFill.style.backgroundColor = rgbaCss;

    if (previewSolidPip) previewSolidPip.style.backgroundColor = `#${hex6}`;
    if (previewAlphaPip) previewAlphaPip.style.backgroundColor = rgbaCss;
    if (previewSolidHex) previewSolidHex.textContent = `#${hex6}`;
    if (previewAlphaPct) previewAlphaPct.textContent = `${pctA}%`;

    // Calculated values
    const hsl = rgbToHsl(r, g, b);
    const hslaCss = `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${roundA})`;
    const androidHex = `#${aHex}${hex6}`;

    valCssRgba.textContent = rgbaCss;
    valCssRgbModern.textContent = rgbModern;
    valHex8.textContent = `#${hex8}`;
    valHex6.textContent = `#${hex6}`;
    valCssVar.textContent = `--color-alpha: ${rgbaCss};`;
    valCssHsla.textContent = hslaCss;
    valHexAndroid.textContent = androidHex;
  }

  function applyState(newR, newG, newB, newA) {
    r = Math.max(0, Math.min(255, Math.round(newR)));
    g = Math.max(0, Math.min(255, Math.round(newG)));
    b = Math.max(0, Math.min(255, Math.round(newB)));
    a = Math.max(0, Math.min(1, typeof newA === 'number' ? newA : 1));
    updateUI();
  }

  // Listeners for Red
  rangeRed.addEventListener('input', (e) => {
    r = parseInt(e.target.value, 10) || 0;
    updateUI();
  });
  numRed.addEventListener('input', (e) => {
    r = Math.max(0, Math.min(255, parseInt(e.target.value, 10) || 0));
    updateUI();
  });

  // Listeners for Green
  rangeGreen.addEventListener('input', (e) => {
    g = parseInt(e.target.value, 10) || 0;
    updateUI();
  });
  numGreen.addEventListener('input', (e) => {
    g = Math.max(0, Math.min(255, parseInt(e.target.value, 10) || 0));
    updateUI();
  });

  // Listeners for Blue
  rangeBlue.addEventListener('input', (e) => {
    b = parseInt(e.target.value, 10) || 0;
    updateUI();
  });
  numBlue.addEventListener('input', (e) => {
    b = Math.max(0, Math.min(255, parseInt(e.target.value, 10) || 0));
    updateUI();
  });

  // Listeners for Alpha
  rangeAlpha.addEventListener('input', (e) => {
    a = (parseInt(e.target.value, 10) || 0) / 100;
    updateUI();
  });
  numAlpha.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      a = Math.max(0, Math.min(1, val));
      updateUI();
    }
  });

  // Native Picker
  nativePicker.addEventListener('input', (e) => {
    const hex = e.target.value.replace('#', '');
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
    updateUI();
  });

  // Hex Text Input
  hexInput.addEventListener('input', (e) => {
    let raw = e.target.value.trim().replace(/^#/, '');
    if (!raw) return;

    // Handle 3-digit (#RGB)
    if (raw.length === 3 && /^[0-9A-Fa-f]{3}$/.test(raw)) {
      const parsedR = parseInt(raw[0] + raw[0], 16);
      const parsedG = parseInt(raw[1] + raw[1], 16);
      const parsedB = parseInt(raw[2] + raw[2], 16);
      applyState(parsedR, parsedG, parsedB, a);
      return;
    }

    // Handle 4-digit (#RGBA)
    if (raw.length === 4 && /^[0-9A-Fa-f]{4}$/.test(raw)) {
      const parsedR = parseInt(raw[0] + raw[0], 16);
      const parsedG = parseInt(raw[1] + raw[1], 16);
      const parsedB = parseInt(raw[2] + raw[2], 16);
      const parsedA = parseInt(raw[3] + raw[3], 16) / 255;
      applyState(parsedR, parsedG, parsedB, parsedA);
      return;
    }

    // Handle 6-digit (#RRGGBB)
    if (raw.length === 6 && /^[0-9A-Fa-f]{6}$/.test(raw)) {
      const parsedR = parseInt(raw.substring(0, 2), 16);
      const parsedG = parseInt(raw.substring(2, 4), 16);
      const parsedB = parseInt(raw.substring(4, 6), 16);
      applyState(parsedR, parsedG, parsedB, a);
      return;
    }

    // Handle 8-digit (#RRGGBBAA)
    if (raw.length === 8 && /^[0-9A-Fa-f]{8}$/.test(raw)) {
      const parsedR = parseInt(raw.substring(0, 2), 16);
      const parsedG = parseInt(raw.substring(2, 4), 16);
      const parsedB = parseInt(raw.substring(4, 6), 16);
      const parsedA = parseInt(raw.substring(6, 8), 16) / 255;
      applyState(parsedR, parsedG, parsedB, parsedA);
      return;
    }
  });

  // Alpha presets buttons
  alphaPills.forEach(pill => {
    pill.addEventListener('click', () => {
      a = parseFloat(pill.getAttribute('data-alpha')) || 0;
      updateUI();
    });
  });

  // Copy Action
  function showToast(msg) {
    if (!toast) return;
    toastText.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }

  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        navigator.clipboard.writeText(targetEl.textContent.trim()).then(() => {
          showToast(`Copied ${targetEl.textContent.trim()}`);
        }).catch(() => {
          const area = document.createElement('textarea');
          area.value = targetEl.textContent.trim();
          document.body.appendChild(area);
          area.select();
          document.execCommand('copy');
          document.body.removeChild(area);
          showToast(`Copied!`);
        });
      }
    });
  });

  // Initial render
  updateUI();
});