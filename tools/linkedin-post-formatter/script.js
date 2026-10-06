// LinkedIn Post Formatter & Hook Enhancer Logic

// Unicode Mappings
const UNICODE_MAPS = {
  // Sans-serif Bold
  bold: {
    A: 0x1D5D4, a: 0x1D5EE, '0': 0x1D7EC
  },
  // Sans-serif Italic
  italic: {
    A: 0x1D608, a: 0x1D622
  },
  // Sans-serif Bold Italic
  boldItalic: {
    A: 0x1D63C, a: 0x1D656
  },
  // Sans-serif Normal
  sans: {
    A: 0x1D5A0, a: 0x1D5BA, '0': 0x1D7E2
  },
  // Monospace
  mono: {
    A: 0x1D670, a: 0x1D68A, '0': 0x1D7F6
  }
};

const VIRAL_HOOK_TEMPLATES = [
  { label: "10 Years in 5 Minutes", text: "I spent 10 years learning [topic] so you can master it in 5 minutes:\n\n" },
  { label: "Unpopular Truth", text: "A harsh truth most people in [industry] aren't ready to hear:\n\n" },
  { label: "Stop Doing X", text: "Stop doing [common mistake] if you want [desired goal]:\n\n" },
  { label: "Most People Are Wrong", text: "99% of people think [common belief]. They are completely wrong. Here's why:\n\n" },
  { label: "Career Pivot / Milestone", text: "3 years ago, I had $0 and zero experience in [field]. Today:\n\n" },
  { label: "The Biggest Mistake", text: "The biggest career mistake I ever made (and how you can avoid it):\n\n" },
  { label: "Cheat Sheet / Roadmap", text: "Here is the exact step-by-step roadmap to go from beginner to pro in [skill]:\n\n" },
  { label: "Simple vs Complex", text: "Simple advice that will save you 100+ hours of wasted work in [industry]:\n\n" },
  { label: "Unfair Advantage", text: "If I had to start over in [field] tomorrow, this is the first thing I would do:\n\n" },
  { label: "Quiet Habit", text: "The 1 habit that separated the top 1% from everyone else I worked with:\n\n" }
];

const POWER_WORDS = [
  'SECRET', 'MISTAKE', 'PROVEN', 'TRUTH', 'HARSH', 'LESSON', 'FRAMEWORK', 'STOP', 
  'NEVER', 'HOW TO', 'ROADMAP', 'HOURS', 'YEARS', 'VIRAL', 'UNPOPULAR', 'SIMPLE', 
  'HABIT', 'MASTER', 'AVOID', 'ZERO', 'STEPS', 'CHEAT SHEET', 'ACCELERATE'
];

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const liEditor = document.getElementById('li-editor');
  const mockupBody = document.getElementById('mockup-li-body');
  const statChars = document.getElementById('stat-chars');
  const statWords = document.getElementById('stat-words');
  const statLines = document.getElementById('stat-lines');
  const statHookChars = document.getElementById('stat-hook-chars');
  const hookRatingBadge = document.getElementById('hook-rating-badge');
  const hookPreviewText = document.getElementById('hook-preview-text');
  const hookFeedback = document.getElementById('hook-feedback');
  const hookTemplatesList = document.getElementById('hook-templates-list');
  const copyLiBtn = document.getElementById('copy-li-btn');
  const addSpacingBtn = document.getElementById('add-spacing-btn');
  const appToast = document.getElementById('app-toast');

  let isMockupExpanded = false;

  // Toast Helper
  let toastTimer = null;
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    appToast.textContent = msg;
    appToast.classList.add('show');
    toastTimer = setTimeout(() => {
      appToast.classList.remove('show');
    }, 2200);
  }

  // Convert character to unicode style
  function convertChar(char, style) {
    const code = char.charCodeAt(0);
    const map = UNICODE_MAPS[style];
    if (!map) return char;

    // Uppercase A-Z
    if (code >= 65 && code <= 90 && map.A) {
      return String.fromCodePoint(map.A + (code - 65));
    }
    // Lowercase a-z
    if (code >= 97 && code <= 122 && map.a) {
      return String.fromCodePoint(map.a + (code - 97));
    }
    // Digits 0-9
    if (code >= 48 && code <= 57 && map['0']) {
      return String.fromCodePoint(map['0'] + (code - 48));
    }
    return char;
  }

  // Convert full string with combining diacritics
  function transformString(str, style) {
    if (style === 'underline') {
      return str.split('').map(c => (c === '\n' || c === ' ') ? c : c + '\u0332').join('');
    }
    if (style === 'strike') {
      return str.split('').map(c => (c === '\n' || c === ' ') ? c : c + '\u0336').join('');
    }
    return str.split('').map(c => convertChar(c, style)).join('');
  }

  // Reverse / Clean Unicode back to ASCII
  function cleanUnicode(str) {
    // Remove combining characters
    let cleaned = str.replace(/[\u0332\u0336]/g, '');
    let result = '';
    for (const char of cleaned) {
      const cp = char.codePointAt(0);
      let matched = false;

      for (const style in UNICODE_MAPS) {
        const map = UNICODE_MAPS[style];
        if (map.A && cp >= map.A && cp <= map.A + 25) {
          result += String.fromCharCode(65 + (cp - map.A));
          matched = true;
          break;
        }
        if (map.a && cp >= map.a && cp <= map.a + 25) {
          result += String.fromCharCode(97 + (cp - map.a));
          matched = true;
          break;
        }
        if (map['0'] && cp >= map['0'] && cp <= map['0'] + 9) {
          result += String.fromCharCode(48 + (cp - map['0']));
          matched = true;
          break;
        }
      }

      if (!matched) {
        result += char;
      }
    }
    return result;
  }

  // Apply style to selection or entire text
  function applyFormatting(style) {
    const start = liEditor.selectionStart;
    const end = liEditor.selectionEnd;
    const val = liEditor.value;

    if (start !== end) {
      const selected = val.substring(start, end);
      const transformed = style === 'clean' ? cleanUnicode(selected) : transformString(selected, style);
      liEditor.value = val.substring(0, start) + transformed + val.substring(end);
      liEditor.selectionStart = start;
      liEditor.selectionEnd = start + transformed.length;
    } else {
      // If nothing selected, format entire editor if user confirms
      const transformed = style === 'clean' ? cleanUnicode(val) : transformString(val, style);
      liEditor.value = transformed;
    }
    liEditor.focus();
    updateAnalysis();
    showToast(`Applied ${style} formatting!`);
  }

  // Setup toolbar buttons
  document.getElementById('btn-bold').addEventListener('click', () => applyFormatting('bold'));
  document.getElementById('btn-italic').addEventListener('click', () => applyFormatting('italic'));
  document.getElementById('btn-bold-italic').addEventListener('click', () => applyFormatting('boldItalic'));
  document.getElementById('btn-sans').addEventListener('click', () => applyFormatting('sans'));
  document.getElementById('btn-mono').addEventListener('click', () => applyFormatting('mono'));
  document.getElementById('btn-underline').addEventListener('click', () => applyFormatting('underline'));
  document.getElementById('btn-strike').addEventListener('click', () => applyFormatting('strike'));
  document.getElementById('btn-clean').addEventListener('click', () => applyFormatting('clean'));

  // Bullet pills
  document.querySelectorAll('.bullet-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const symbol = pill.dataset.char;
      const start = liEditor.selectionStart;
      const end = liEditor.selectionEnd;
      const val = liEditor.value;

      liEditor.value = val.substring(0, start) + symbol + ' ' + val.substring(end);
      liEditor.selectionStart = liEditor.selectionEnd = start + symbol.length + 1;
      liEditor.focus();
      updateAnalysis();
    });
  });

  // Populate Hook Templates
  VIRAL_HOOK_TEMPLATES.forEach(tpl => {
    const div = document.createElement('div');
    div.className = 'hook-template-item';
    div.innerHTML = `
      <span>${tpl.label}: <em>"${tpl.text.trim().substring(0, 40)}..."</em></span>
      <span style="color: var(--accent); font-weight: 600;">+ Use</span>
    `;
    div.addEventListener('click', () => {
      const start = liEditor.selectionStart;
      const val = liEditor.value;
      liEditor.value = tpl.text + val;
      liEditor.selectionStart = liEditor.selectionEnd = tpl.text.length;
      liEditor.focus();
      updateAnalysis();
      showToast(`Inserted hook: "${tpl.label}"`);
    });
    hookTemplatesList.appendChild(div);
  });

  // Auto-Space Paragraphs
  addSpacingBtn.addEventListener('click', () => {
    const text = liEditor.value;
    // Split into non-empty lines and join with clean double breaks
    const cleaned = text.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .join('\n\n');
    liEditor.value = cleaned;
    updateAnalysis();
    showToast('Clean double spacing applied!');
  });

  // Hook & Post Analysis Engine
  function updateAnalysis() {
    const rawText = liEditor.value;
    const plainText = cleanUnicode(rawText);
    const chars = rawText.length;
    const words = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;
    const lines = rawText.split('\n');

    // Stats
    statChars.textContent = chars.toLocaleString();
    statWords.textContent = words.toLocaleString();
    statLines.textContent = lines.length;

    // Truncation fold check:
    // On mobile LinkedIn feed, posts truncate after the first 3 lines or ~140-180 chars.
    const hookLines = lines.slice(0, 3);
    const hookText = hookLines.join('\n');
    const hookChars = hookText.length;
    statHookChars.textContent = hookChars;

    hookPreviewText.textContent = hookText.trim() || "(Empty post)";

    // Hook Scoring
    let score = 50;
    const feedbackTips = [];
    const plainUpper = plainText.toUpperCase();

    // 1. Length of hook
    if (hookChars > 0 && hookChars <= 180) {
      score += 25;
      feedbackTips.push("✅ Hook fits cleanly under 180 characters, ensuring high mobile click-through.");
    } else if (hookChars > 220) {
      score -= 15;
      feedbackTips.push("⚠️ Hook exceeds 210 characters and will be cut off awkwardly by the '...see more' fold.");
    }

    // 2. Line spacing check
    if (lines.length >= 3 && lines[1].trim() === '') {
      score += 15;
      feedbackTips.push("✅ Excellent 1-line whitespace after hook opening sentence.");
    } else if (lines.length >= 2 && lines[1].trim() !== '') {
      score -= 10;
      feedbackTips.push("💡 Tip: Add a blank line between Line 1 and Line 2 for better readability.");
    }

    // 3. Power words in hook
    const detectedPower = POWER_WORDS.filter(w => plainUpper.includes(w));
    if (detectedPower.length > 0) {
      score += Math.min(detectedPower.length * 8, 20);
      feedbackTips.push(`✨ Power words detected: <strong>${detectedPower.slice(0, 3).join(', ')}</strong>.`);
    } else {
      feedbackTips.push("💡 Tip: Use curiosity triggers like <em>'Harsh Truth', 'I spent 10 years', 'Stop doing', or 'Framework'</em>.");
    }

    // 4. Numbers check
    if (/\d+/.test(hookText)) {
      score += 10;
      feedbackTips.push("✅ Specific numbers detected (e.g. 5 minutes, 10 years, $0). High conversion signal!");
    }

    // Score badge
    if (score >= 80) {
      hookRatingBadge.className = 'hook-badge viral';
      hookRatingBadge.textContent = 'Viral Hook Potential 🔥 (' + score + '/100)';
    } else if (score >= 60) {
      hookRatingBadge.className = 'hook-badge good';
      hookRatingBadge.textContent = 'Good Hook 👍 (' + score + '/100)';
    } else {
      hookRatingBadge.className = 'hook-badge weak';
      hookRatingBadge.textContent = 'Weak Hook ⚠️ (' + score + '/100)';
    }

    hookFeedback.innerHTML = `<ul style="padding-left: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;">${feedbackTips.map(t => `<li>${t}</li>`).join('')}</ul>`;

    // Render Mockup
    renderMockup(rawText, lines);
  }

  // Render LinkedIn Mockup
  function renderMockup(rawText, lines) {
    mockupBody.innerHTML = '';
    const FOLD_LINES = 3;

    if (lines.length <= FOLD_LINES || isMockupExpanded) {
      mockupBody.textContent = rawText;
      if (lines.length > FOLD_LINES && isMockupExpanded) {
        const lessSpan = document.createElement('span');
        lessSpan.className = 'li-see-more-link';
        lessSpan.textContent = '...see less';
        lessSpan.addEventListener('click', () => {
          isMockupExpanded = false;
          updateAnalysis();
        });
        mockupBody.appendChild(lessSpan);
      }
    } else {
      // Truncated preview
      const preview = lines.slice(0, FOLD_LINES).join('\n');
      mockupBody.textContent = preview;
      const seeMore = document.createElement('span');
      seeMore.className = 'li-see-more-link';
      seeMore.textContent = '...see more';
      seeMore.addEventListener('click', () => {
        isMockupExpanded = true;
        updateAnalysis();
      });
      mockupBody.appendChild(seeMore);
    }
  }

  // Editor Input Listener
  liEditor.addEventListener('input', updateAnalysis);

  // Copy Post
  copyLiBtn.addEventListener('click', () => {
    const text = liEditor.value;
    if (!text.trim()) {
      showToast('No content to copy');
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied formatted post to clipboard!');
    });
  });

  // Initial Run
  updateAnalysis();
});