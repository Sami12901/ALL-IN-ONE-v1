// Fancy Text Generator - 24 Aesthetic Unicode Font Transformers

const SCRIPT_EXCEPTIONS = {
  'B': 0x212C, 'E': 0x2130, 'F': 0x2131, 'H': 0x210B, 'I': 0x2110,
  'L': 0x2112, 'M': 0x2133, 'R': 0x211B, 'e': 0x212F, 'g': 0x210A, 'o': 0x2134
};

const FRAKTUR_EXCEPTIONS = {
  'C': 0x212D, 'H': 0x210C, 'I': 0x2111, 'R': 0x211C, 'Z': 0x2128
};

const DOUBLE_STRUCK_EXCEPTIONS = {
  'C': 0x2102, 'H': 0x210D, 'N': 0x2115, 'P': 0x2119, 'Q': 0x211A, 'R': 0x211D, 'Z': 0x2124
};

const SMALL_CAPS_MAP = {
  'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ',
  'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ',
  'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ',
  'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
};

const UPSIDE_DOWN_MAP = {
  'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ',
  'h': 'ɥ', 'i': 'ı', 'j': 'ɾ', 'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u',
  'o': 'o', 'p': 'd', 'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ', 'u': 'n',
  'v': 'ʌ', 'w': 'ʍ', 'x': 'x', 'y': 'ʎ', 'z': 'z',
  'A': '∀', 'B': '𐐒', 'C': 'Ɔ', 'D': '◖', 'E': 'Ǝ', 'F': 'Ⅎ', 'G': '⅁',
  'H': 'H', 'I': 'I', 'J': 'ſ', 'K': '⋊', 'L': '˥', 'M': 'W', 'N': 'N',
  'O': 'O', 'P': 'Ԁ', 'Q': 'Ò', 'R': 'ᴚ', 'S': 'S', 'T': '⊥', 'U': '∩',
  'V': 'Λ', 'W': 'M', 'X': 'X', 'Y': '⅄', 'Z': 'Z',
  '0': '0', '1': '⇂', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9',
  '7': 'L', '8': '8', '9': '6',
  '?': '¿', '!': '¡', '.': '˙', ',': '\'', '\'': ',', '"': '„',
  '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{',
  '<': '>', '>': '<', '&': '⅋', '_': '‾'
};

// Map alphanumeric offset
function offsetAlpha(char, upperBase, lowerBase, digitBase = null) {
  const code = char.charCodeAt(0);
  if (code >= 65 && code <= 90) {
    return String.fromCodePoint(upperBase + (code - 65));
  }
  if (code >= 97 && code <= 122) {
    return String.fromCodePoint(lowerBase + (code - 97));
  }
  if (digitBase !== null && code >= 48 && code <= 57) {
    return String.fromCodePoint(digitBase + (code - 48));
  }
  return char;
}

// 24 Font Definitions
const FONT_STYLES = [
  {
    id: 'cursive',
    name: 'Cursive / Script',
    category: 'script',
    transform: (text) => text.split('').map(c => {
      if (SCRIPT_EXCEPTIONS[c]) return String.fromCodePoint(SCRIPT_EXCEPTIONS[c]);
      return offsetAlpha(c, 0x1D49C, 0x1D4B6);
    }).join('')
  },
  {
    id: 'bold-script',
    name: 'Bold Script',
    category: 'script',
    transform: (text) => text.split('').map(c => offsetAlpha(c, 0x1D4D0, 0x1D4EA)).join('')
  },
  {
    id: 'fraktur',
    name: 'Fraktur / Gothic',
    category: 'gothic',
    transform: (text) => text.split('').map(c => {
      if (FRAKTUR_EXCEPTIONS[c]) return String.fromCodePoint(FRAKTUR_EXCEPTIONS[c]);
      return offsetAlpha(c, 0x1D504, 0x1D51E);
    }).join('')
  },
  {
    id: 'bold-fraktur',
    name: 'Bold Fraktur',
    category: 'gothic',
    transform: (text) => text.split('').map(c => offsetAlpha(c, 0x1D56C, 0x1D586)).join('')
  },
  {
    id: 'double-struck',
    name: 'Double-Struck / Blackboard',
    category: 'gothic',
    transform: (text) => text.split('').map(c => {
      if (DOUBLE_STRUCK_EXCEPTIONS[c]) return String.fromCodePoint(DOUBLE_STRUCK_EXCEPTIONS[c]);
      return offsetAlpha(c, 0x1D538, 0x1D552, 0x1D7D8);
    }).join('')
  },
  {
    id: 'bold-serif',
    name: 'Bold Serif',
    category: 'serif',
    transform: (text) => text.split('').map(c => offsetAlpha(c, 0x1D400, 0x1D41A, 0x1D7CE)).join('')
  },
  {
    id: 'italic-serif',
    name: 'Italic Serif',
    category: 'serif',
    transform: (text) => text.split('').map(c => {
      if (c === 'h') return 'ℎ';
      return offsetAlpha(c, 0x1D434, 0x1D44E);
    }).join('')
  },
  {
    id: 'bold-italic-serif',
    name: 'Bold Italic Serif',
    category: 'serif',
    transform: (text) => text.split('').map(c => offsetAlpha(c, 0x1D468, 0x1D482)).join('')
  },
  {
    id: 'bold-sans',
    name: 'Bold Sans-Serif',
    category: 'serif',
    transform: (text) => text.split('').map(c => offsetAlpha(c, 0x1D5D4, 0x1D5EE, 0x1D7EC)).join('')
  },
  {
    id: 'italic-sans',
    name: 'Italic Sans-Serif',
    category: 'serif',
    transform: (text) => text.split('').map(c => offsetAlpha(c, 0x1D608, 0x1D622)).join('')
  },
  {
    id: 'bold-italic-sans',
    name: 'Bold Italic Sans-Serif',
    category: 'serif',
    transform: (text) => text.split('').map(c => offsetAlpha(c, 0x1D63C, 0x1D656)).join('')
  },
  {
    id: 'monospace',
    name: 'Monospace / Typewriter',
    category: 'serif',
    transform: (text) => text.split('').map(c => offsetAlpha(c, 0x1D670, 0x1D68A, 0x1D7F6)).join('')
  },
  {
    id: 'bubble',
    name: 'Bubble / Circled',
    category: 'frames',
    transform: (text) => text.split('').map(c => {
      const code = c.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(0x24B6 + (code - 65));
      if (code >= 97 && code <= 122) return String.fromCodePoint(0x24D0 + (code - 97));
      if (code >= 49 && code <= 57) return String.fromCodePoint(0x2460 + (code - 49));
      if (code === 48) return '⓪';
      return c;
    }).join('')
  },
  {
    id: 'dark-bubble',
    name: 'Dark Bubble / Inverted Circled',
    category: 'frames',
    transform: (text) => text.split('').map(c => {
      const upper = c.toUpperCase();
      const code = upper.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(0x1F150 + (code - 65));
      if (code >= 49 && code <= 57) return String.fromCodePoint(0x2776 + (code - 49));
      if (code === 48) return '⓿';
      return c;
    }).join('')
  },
  {
    id: 'square',
    name: 'Square / Boxed',
    category: 'frames',
    transform: (text) => text.split('').map(c => {
      const upper = c.toUpperCase();
      const code = upper.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(0x1F130 + (code - 65));
      return c;
    }).join('')
  },
  {
    id: 'dark-square',
    name: 'Dark Square / Inverted Boxed',
    category: 'frames',
    transform: (text) => text.split('').map(c => {
      const upper = c.toUpperCase();
      const code = upper.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(0x1F170 + (code - 65));
      return c;
    }).join('')
  },
  {
    id: 'small-caps',
    name: 'Small Caps',
    category: 'effects',
    transform: (text) => text.split('').map(c => {
      const lower = c.toLowerCase();
      return SMALL_CAPS_MAP[lower] || c;
    }).join('')
  },
  {
    id: 'upside-down',
    name: 'Inverted / Upside Down',
    category: 'effects',
    transform: (text) => text.split('').reverse().map(c => UPSIDE_DOWN_MAP[c] || c).join('')
  },
  {
    id: 'strikethrough',
    name: 'Strikethrough',
    category: 'effects',
    transform: (text) => text.split('').map(c => (c === ' ' ? ' ' : c + '\u0336')).join('')
  },
  {
    id: 'underline',
    name: 'Underline',
    category: 'effects',
    transform: (text) => text.split('').map(c => (c === ' ' ? ' ' : c + '\u0332')).join('')
  },
  {
    id: 'double-underline',
    name: 'Double Underline',
    category: 'effects',
    transform: (text) => text.split('').map(c => (c === ' ' ? ' ' : c + '\u0333')).join('')
  },
  {
    id: 'slash-through',
    name: 'Slash / Slash-Through',
    category: 'effects',
    transform: (text) => text.split('').map(c => (c === ' ' ? ' ' : c + '\u0337')).join('')
  },
  {
    id: 'fullwidth',
    name: 'Fullwidth / Vaporwave',
    category: 'effects',
    transform: (text) => text.split('').map(c => {
      const code = c.charCodeAt(0);
      if (code >= 33 && code <= 126) return String.fromCodePoint(0xFEE0 + code);
      if (code === 32) return '　';
      return c;
    }).join('')
  },
  {
    id: 'wavy',
    name: 'Wavy / Tilde Accent',
    category: 'effects',
    transform: (text) => text.split('').map(c => (c === ' ' ? ' ' : c + '\u0303')).join('')
  }
];

const PRESET_SAMPLES = {
  quote: "Creativity is intelligence having fun ✨",
  gamer: "Viper Shadow 99",
  headline: "Exclusive Product Launch 🚀"
};

document.addEventListener('DOMContentLoaded', () => {
  const fancyInput = document.getElementById('fancy-input');
  const fontGrid = document.getElementById('font-grid');
  const catPills = document.querySelectorAll('.cat-pill');
  const fontSearch = document.getElementById('font-search');
  const toastNotice = document.getElementById('toast-notice');
  const toastMsg = document.getElementById('toast-msg');

  // Preset buttons
  const sampleQuoteBtn = document.getElementById('sample-quote-btn');
  const sampleGamerBtn = document.getElementById('sample-gamer-btn');
  const clearFancyBtn = document.getElementById('clear-fancy-btn');

  let activeCategory = 'all';
  let searchQuery = '';

  function showToast(message) {
    if (!toastNotice) return;
    toastMsg.textContent = message || 'Copied to clipboard!';
    toastNotice.classList.add('show');
    setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 2000);
  }

  function renderFontCards() {
    const rawText = fancyInput.value || '';
    const safeText = rawText.trim() ? rawText : 'Type something...';

    fontGrid.innerHTML = '';

    const filtered = FONT_STYLES.filter(font => {
      const matchCat = activeCategory === 'all' || font.category === activeCategory;
      const matchSearch = !searchQuery || font.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      fontGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-secondary);">
          No fonts match your search term "${searchQuery}".
        </div>
      `;
      return;
    }

    filtered.forEach(font => {
      const transformed = font.transform(safeText);

      const card = document.createElement('div');
      card.className = 'font-card';
      card.innerHTML = `
        <div class="font-card-top">
          <span class="font-name">${font.name}</span>
          <span class="font-cat-badge">${font.category}</span>
        </div>
        <div class="font-preview-text" data-transformed="${escapeAttr(transformed)}">
          ${escapeHtml(transformed)}
        </div>
        <div class="font-card-bottom">
          <button class="font-copy-btn" title="Copy to clipboard">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>Copy</span>
          </button>
        </div>
      `;

      // Copy Handler
      const copyBtn = card.querySelector('.font-copy-btn');
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(transformed).then(() => {
          copyBtn.classList.add('copied');
          copyBtn.querySelector('span').textContent = 'Copied!';
          showToast(`Copied "${font.name}" style!`);
          setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.querySelector('span').textContent = 'Copy';
          }, 1800);
        }).catch(err => console.error('Copy failed', err));
      });

      fontGrid.appendChild(card);
    });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function escapeAttr(str) {
    return str.replace(/"/g, '&quot;');
  }

  // Event Listeners
  fancyInput.addEventListener('input', renderFontCards);

  catPills.forEach(pill => {
    pill.addEventListener('click', () => {
      catPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.dataset.cat;
      renderFontCards();
    });
  });

  if (fontSearch) {
    fontSearch.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderFontCards();
    });
  }

  // Presets
  sampleQuoteBtn.addEventListener('click', () => {
    fancyInput.value = PRESET_SAMPLES.quote;
    renderFontCards();
  });

  sampleGamerBtn.addEventListener('click', () => {
    fancyInput.value = PRESET_SAMPLES.gamer;
    renderFontCards();
  });

  clearFancyBtn.addEventListener('click', () => {
    fancyInput.value = '';
    renderFontCards();
    fancyInput.focus();
  });

  // Initial render
  renderFontCards();
});