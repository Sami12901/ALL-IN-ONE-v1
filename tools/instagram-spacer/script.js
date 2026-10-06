// Instagram Caption Spacer & Line Breaker - Complete Client-Side Implementation

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const captionInput = document.getElementById('caption-input');
  const previewBody = document.getElementById('preview-caption-body');
  const spacerCharSelect = document.getElementById('spacer-char-select');
  const optTrimTrailing = document.getElementById('opt-trim-trailing');
  const optConvertDoubleBreaks = document.getElementById('opt-convert-double-breaks');

  const statWords = document.getElementById('stat-words');
  const statChars = document.getElementById('stat-chars');

  const meterIgText = document.getElementById('meter-ig-text');
  const meterIgFill = document.getElementById('meter-ig-fill');
  const meterHtText = document.getElementById('meter-ht-text');
  const meterHtFill = document.getElementById('meter-ht-fill');
  const meterTtText = document.getElementById('meter-tt-text');
  const meterTtFill = document.getElementById('meter-tt-fill');
  const meterXText = document.getElementById('meter-x-text');
  const meterXFill = document.getElementById('meter-x-fill');

  const btnCopyCaption = document.getElementById('btn-copy-caption');
  const btnLoadSample = document.getElementById('btn-load-sample');
  const btnClear = document.getElementById('btn-clear');
  const emojiPills = document.querySelectorAll('.emoji-pill');

  // Toast
  const appToast = document.getElementById('app-toast');
  let toastTimer = null;

  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    appToast.textContent = message;
    appToast.classList.add('show');
    toastTimer = setTimeout(() => {
      appToast.classList.remove('show');
    }, 2200);
  }

  // Map spacer technique to unicode character
  function getSpacerChar() {
    switch (spacerCharSelect.value) {
      case 'braille': return '\u2800'; // Braille Pattern Blank
      case 'zws': return '\u200B'; // Zero Width Space
      case 'zwnj': return '\u200C'; // Zero Width Non-Joiner
      case 'hangul': return '\u3164'; // Hangul Filler
      default: return '\u2800';
    }
  }

  // Format the raw input into caption with invisible spacing
  function formatCaption(rawText) {
    if (!rawText) return '';
    const spacer = getSpacerChar();
    const lines = rawText.split(/\r?\n/);

    const formattedLines = lines.map((line) => {
      let l = line;
      if (optTrimTrailing.checked) {
        l = l.replace(/[ \t]+$/, '');
      }

      // If line is empty or whitespace only
      if (l.trim() === '') {
        return optConvertDoubleBreaks.checked ? spacer : '';
      }
      return l;
    });

    return formattedLines.join('\n');
  }

  // Update preview rendering and character limit meters
  function updateState() {
    const raw = captionInput.value;
    const formatted = formatCaption(raw);

    // Basic stats
    const words = raw.trim() ? (raw.trim().match(/\S+/g) || []).length : 0;
    const chars = formatted.length;
    statWords.textContent = `${words.toLocaleString()} Words`;
    statChars.textContent = `${chars.toLocaleString()} Chars`;

    // Hashtags
    const hashtags = raw.match(/#[a-zA-Z0-9_\p{L}]+/gu) || [];
    const hashtagCount = hashtags.length;

    // 1. Instagram limit (2200)
    updateMeter(chars, 2200, meterIgText, meterIgFill);

    // 2. Hashtags limit (30)
    updateMeter(hashtagCount, 30, meterHtText, meterHtFill);

    // 3. TikTok limit (4000)
    updateMeter(chars, 4000, meterTtText, meterTtFill);

    // 4. Twitter / X limit (280)
    updateMeter(chars, 280, meterXText, meterXFill);

    // Update Live Preview
    if (!formatted.trim()) {
      previewBody.innerHTML = '<span style="color: var(--text-tertiary);">Your formatted caption with spaced paragraphs will render here exactly as it will look on Instagram and TikTok feeds.</span>';
    } else {
      // Escape HTML and highlight hashtags
      const escaped = escapeHtml(formatted);
      const highlighted = escaped.replace(/(#[a-zA-Z0-9_\p{L}]+)/gu, '<span class="hashtag">$1</span>');
      previewBody.innerHTML = highlighted;
    }
  }

  function updateMeter(current, max, textEl, fillEl) {
    const percent = Math.min(100, Math.round((current / max) * 100));
    textEl.textContent = `${current.toLocaleString()}/${max.toLocaleString()}`;
    fillEl.style.width = `${percent}%`;

    fillEl.classList.remove('warning', 'danger');
    if (current > max) {
      fillEl.classList.add('danger');
      textEl.style.color = 'var(--error)';
    } else if (current >= max * 0.85) {
      fillEl.classList.add('warning');
      textEl.style.color = 'var(--warning)';
    } else {
      textEl.style.color = 'var(--text-tertiary)';
    }
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Insert emoji at cursor position
  emojiPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const emoji = pill.getAttribute('data-emoji');
      const start = captionInput.selectionStart;
      const end = captionInput.selectionEnd;
      const text = captionInput.value;

      captionInput.value = text.substring(0, start) + emoji + text.substring(end);
      captionInput.selectionStart = captionInput.selectionEnd = start + emoji.length;
      captionInput.focus();
      updateState();
    });
  });

  // Copy button
  btnCopyCaption.addEventListener('click', async () => {
    const formatted = formatCaption(captionInput.value);
    if (!formatted.trim()) {
      showToast('Caption is empty');
      return;
    }

    try {
      await navigator.clipboard.writeText(formatted);
      const originalText = btnCopyCaption.innerHTML;
      btnCopyCaption.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied to Clipboard!`;
      showToast('Caption copied with invisible line breaks!');
      setTimeout(() => {
        btnCopyCaption.innerHTML = originalText;
      }, 2000);
    } catch {
      // Fallback
      captionInput.select();
      document.execCommand('copy');
      showToast('Copied to clipboard!');
    }
  });

  // Load sample caption
  btnLoadSample.addEventListener('click', () => {
    captionInput.value = `The secret to consistency isn't massive effort all at once. ✨

It's the small, daily non-negotiables that compound quietly behind the scenes. 🚀

Here is what helped me stay focused this month:

1. Waking up 30 minutes earlier for uninterrupted reading ☕️
2. Zero social media before 10 AM 🎯
3. Moving every single day, even if it's just a 20-min walk 🌿

Save this post for when you need a gentle reminder to slow down and stay steady. 👇

#mindsetmatters #creativegrowth #productivitytips #dailyhabits`;
    updateState();
    showToast('Loaded sample creator caption');
  });

  // Clear button
  btnClear.addEventListener('click', () => {
    captionInput.value = '';
    updateState();
    showToast('Cleared caption');
  });

  // Input listeners
  captionInput.addEventListener('input', updateState);
  spacerCharSelect.addEventListener('change', updateState);
  optTrimTrailing.addEventListener('change', updateState);
  optConvertDoubleBreaks.addEventListener('change', updateState);

  // Initialize
  updateState();
});