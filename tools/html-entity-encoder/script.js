// HTML Entity Encoder & Decoder
// Supports Named, Decimal, and Hexadecimal entities with two-way live conversion

const NAMED_MAP = {
  '&': 'amp',
  '<': 'lt',
  '>': 'gt',
  '"': 'quot',
  "'": 'apos',
  ' ': 'nbsp',
  '¡': 'iexcl',
  '¢': 'cent',
  '£': 'pound',
  '¤': 'curren',
  '¥': 'yen',
  '¦': 'brvbar',
  '§': 'sect',
  '¨': 'uml',
  '©': 'copy',
  'ª': 'ordf',
  '«': 'laquo',
  '¬': 'not',
  '®': 'reg',
  '¯': 'macr',
  '°': 'deg',
  '±': 'plusmn',
  '²': 'sup2',
  '³': 'sup3',
  '´': 'acute',
  'µ': 'micro',
  '¶': 'para',
  '·': 'middot',
  '¸': 'cedil',
  '¹': 'sup1',
  'º': 'ordm',
  '»': 'raquo',
  '¼': 'frac14',
  '½': 'frac12',
  '¾': 'frac34',
  '¿': 'iquest',
  'À': 'Agrave',
  'Á': 'Aacute',
  'Â': 'Acirc',
  'Ã': 'Atilde',
  'Ä': 'Auml',
  'Å': 'Aring',
  'Æ': 'AElig',
  'Ç': 'Ccedil',
  'È': 'Egrave',
  'É': 'Eacute',
  'Ê': 'Ecirc',
  'Ë': 'Euml',
  'Ì': 'Igrave',
  'Í': 'Iacute',
  'Î': 'Icirc',
  'Ï': 'Iuml',
  'Ð': 'ETH',
  'Ñ': 'Ntilde',
  'Ò': 'Ograve',
  'Ó': 'Oacute',
  'Ô': 'Ocirc',
  'Õ': 'Otilde',
  'Ö': 'Ouml',
  '×': 'times',
  'Ø': 'Oslash',
  'Ù': 'Ugrave',
  'Ú': 'Uacute',
  'Û': 'Ucirc',
  'Ü': 'Uuml',
  'Ý': 'Yacute',
  'Þ': 'THORN',
  'ß': 'szlig',
  'à': 'agrave',
  'á': 'aacute',
  'â': 'acirc',
  'ã': 'atilde',
  'ä': 'auml',
  'å': 'aring',
  'æ': 'aelig',
  'ç': 'ccedil',
  'è': 'egrave',
  'é': 'eacute',
  'ê': 'ecirc',
  'ë': 'euml',
  'ì': 'igrave',
  'í': 'iacute',
  'î': 'icirc',
  'ï': 'iuml',
  'ð': 'eth',
  'ñ': 'ntilde',
  'ò': 'ograve',
  'ó': 'oacute',
  'ô': 'ocirc',
  'õ': 'otilde',
  'ö': 'ouml',
  '÷': 'divide',
  'ø': 'oslash',
  'ù': 'ugrave',
  'ú': 'uacute',
  'û': 'ucirc',
  'ü': 'uuml',
  'ý': 'yacute',
  'þ': 'thorn',
  'ÿ': 'yuml',
  'Œ': 'OElig',
  'œ': 'oelig',
  'Š': 'Scaron',
  'š': 'scaron',
  'Ÿ': 'Yuml',
  'ƒ': 'fnof',
  'ˆ': 'circ',
  '˜': 'tilde',
  '–': 'ndash',
  '—': 'mdash',
  '‘': 'lsquo',
  '’': 'rsquo',
  '‚': 'sbquo',
  '“': 'ldquo',
  '”': 'rdquo',
  '„': 'bdquo',
  '†': 'dagger',
  '‡': 'Dagger',
  '•': 'bull',
  '…': 'hellip',
  '‰': 'permil',
  '′': 'prime',
  '″': 'Prime',
  '‹': 'lsaquo',
  '›': 'rsaquo',
  '€': 'euro',
  '™': 'trade',
  '←': 'larr',
  '↑': 'uarr',
  '→': 'rarr',
  '↓': 'darr',
  '↔': 'harr',
  '↵': 'crarr',
  '⇐': 'lArr',
  '⇑': 'uArr',
  '⇒': 'rArr',
  '⇓': 'dArr',
  '⇔': 'hArr',
  '∀': 'forall',
  '∂': 'part',
  '∃': 'exist',
  '∅': 'empty',
  '∇': 'nabla',
  '∈': 'isin',
  '∉': 'notin',
  '∋': 'ni',
  '∏': 'prod',
  '∑': 'sum',
  '−': 'minus',
  '∗': 'lowast',
  '√': 'radic',
  '∝': 'prop',
  '∞': 'infin',
  '∠': 'ang',
  '∧': 'and',
  '∨': 'or',
  '∩': 'cap',
  '∪': 'cup',
  '∫': 'int',
  '∴': 'there4',
  '∼': 'sim',
  '≅': 'cong',
  '≈': 'asymp',
  '≠': 'ne',
  '≡': 'equiv',
  '≤': 'le',
  '≥': 'ge',
  '⊂': 'sub',
  '⊃': 'sup',
  '⊄': 'nsub',
  '⊆': 'sube',
  '⊇': 'supe',
  '⊕': 'oplus',
  '⊗': 'otimes',
  '⊥': 'perp',
  '⋅': 'sdot',
  '⌈': 'lceil',
  '⌉': 'rceil',
  '⌊': 'lfloor',
  '⌋': 'rfloor',
  '◊': 'loz',
  '♠': 'spades',
  '♣': 'clubs',
  '♥': 'hearts',
  '♦': 'diams',
  'α': 'alpha',
  'β': 'beta',
  'γ': 'gamma',
  'δ': 'delta',
  'ε': 'epsilon',
  'ζ': 'zeta',
  'η': 'eta',
  'θ': 'theta',
  'ι': 'iota',
  'κ': 'kappa',
  'λ': 'lambda',
  'μ': 'mu',
  'ν': 'nu',
  'ξ': 'xi',
  'ο': 'omicron',
  'π': 'pi',
  'ρ': 'rho',
  'σ': 'sigma',
  'τ': 'tau',
  'υ': 'upsilon',
  'φ': 'phi',
  'χ': 'chi',
  'ψ': 'psi',
  'ω': 'omega'
};

// Common entities for quick reference
const CHEAT_SHEET_ITEMS = [
  { char: '&', entity: '&amp;', name: 'Ampersand' },
  { char: '<', entity: '&lt;', name: 'Less than' },
  { char: '>', entity: '&gt;', name: 'Greater than' },
  { char: '"', entity: '&quot;', name: 'Double quote' },
  { char: "'", entity: '&apos;', name: 'Single quote' },
  { char: '©', entity: '&copy;', name: 'Copyright' },
  { char: '®', entity: '&reg;', name: 'Registered' },
  { char: '™', entity: '&trade;', name: 'Trademark' },
  { char: '€', entity: '&euro;', name: 'Euro' },
  { char: '£', entity: '&pound;', name: 'Pound' },
  { char: '¥', entity: '&yen;', name: 'Yen' },
  { char: '¢', entity: '&cent;', name: 'Cent' },
  { char: '°', entity: '&deg;', name: 'Degree' },
  { char: '±', entity: '&plusmn;', name: 'Plus-minus' },
  { char: '≠', entity: '&ne;', name: 'Not equal' },
  { char: '≤', entity: '&le;', name: 'Less or equal' },
  { char: '≥', entity: '&ge;', name: 'Greater or equal' },
  { char: '×', entity: '&times;', name: 'Multiply' },
  { char: '÷', entity: '&divide;', name: 'Divide' },
  { char: '∞', entity: '&infin;', name: 'Infinity' },
  { char: '♥', entity: '&hearts;', name: 'Heart suit' },
  { char: '…', entity: '&hellip;', name: 'Ellipsis' },
  { char: '—', entity: '&mdash;', name: 'Em dash' },
  { char: ' ', entity: '&nbsp;', name: 'Non-breaking space' }
];

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const modeEncodeBtn = document.getElementById('mode-encode');
  const modeDecodeBtn = document.getElementById('mode-decode');
  const entityFormatSelect = document.getElementById('entity-format');
  const encodeScopeSelect = document.getElementById('encode-scope');
  const formatSelectWrapper = document.getElementById('format-select-wrapper');
  const scopeSelectWrapper = document.getElementById('scope-select-wrapper');

  const inputText = document.getElementById('input-text');
  const outputText = document.getElementById('output-text');
  const inputTitle = document.getElementById('input-title');
  const outputTitle = document.getElementById('output-title');

  const statInputChars = document.getElementById('stat-input-chars');
  const statInputBytes = document.getElementById('stat-input-bytes');
  const statInputLines = document.getElementById('stat-input-lines');

  const statOutputChars = document.getElementById('stat-output-chars');
  const statOutputBytes = document.getElementById('stat-output-bytes');
  const statOutputRatio = document.getElementById('stat-output-ratio');

  const btnSampleHtml = document.getElementById('btn-sample-html');
  const btnSampleSymbols = document.getElementById('btn-sample-symbols');
  const btnClear = document.getElementById('btn-clear');
  const btnPaste = document.getElementById('btn-paste');
  const btnSwap = document.getElementById('btn-swap');
  const btnCopy = document.getElementById('btn-copy');
  const btnDownload = document.getElementById('btn-download');
  const cheatGrid = document.getElementById('cheat-sheet-grid');

  let currentMode = 'encode'; // 'encode' or 'decode'

  // Render cheat sheet
  if (cheatGrid) {
    cheatGrid.innerHTML = CHEAT_SHEET_ITEMS.map(item => `
      <div class="cheat-card" data-entity="${item.entity}" data-char="${item.char}" title="Click to copy ${item.entity}">
        <span class="cheat-char">${item.char === ' ' ? '␣' : item.char}</span>
        <span class="cheat-code">${item.entity}</span>
        <span class="cheat-desc">${item.name}</span>
      </div>
    `).join('');

    cheatGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.cheat-card');
      if (!card) return;
      const entity = card.dataset.entity;
      navigator.clipboard.writeText(entity).then(() => {
        const codeEl = card.querySelector('.cheat-code');
        const orig = codeEl.textContent;
        codeEl.textContent = 'Copied!';
        codeEl.style.color = 'var(--success)';
        setTimeout(() => {
          codeEl.textContent = orig;
          codeEl.style.color = '';
        }, 1200);
      });
    });
  }

  // Calculate byte count safe for UTF-8
  function getByteCount(str) {
    if (!str) return 0;
    return new TextEncoder().encode(str).length;
  }

  // Check if character should be encoded based on scope
  function shouldEncode(char, codePoint, scope) {
    const isUnsafe = char === '<' || char === '>' || char === '&' || char === '"' || char === "'";
    if (scope === 'unsafe') {
      return isUnsafe;
    }
    if (scope === 'nonascii') {
      return codePoint > 127;
    }
    if (scope === 'unsafe_nonascii') {
      return isUnsafe || codePoint > 127;
    }
    if (scope === 'all') {
      // Encode everything except carriage returns and newlines for readability
      return char !== '\r' && char !== '\n';
    }
    return false;
  }

  // Format single character to entity
  function formatEntity(char, codePoint, format) {
    if (format === 'named' && NAMED_MAP[char]) {
      return `&${NAMED_MAP[char]};`;
    }
    if (format === 'decimal') {
      return `&#${codePoint};`;
    }
    if (format === 'hex') {
      const hex = codePoint.toString(16).toUpperCase();
      return `&#x${hex};`;
    }
    // Fallback if named entity is not defined for this codePoint
    return `&#${codePoint};`;
  }

  // Encode text
  function encodeString(str, format, scope) {
    if (!str) return '';
    let result = '';
    // Iterate over code points (handling surrogate pairs correctly)
    for (const char of str) {
      const codePoint = char.codePointAt(0);
      if (shouldEncode(char, codePoint, scope)) {
        result += formatEntity(char, codePoint, format);
      } else {
        result += char;
      }
    }
    return result;
  }

  // Decode text (named, decimal, hex)
  function decodeString(str) {
    if (!str) return '';
    // Regex for numeric or named entities
    return str.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z0-9]+);/g, (match, entity) => {
      // Hex entity
      if (entity.startsWith('#x') || entity.startsWith('#X')) {
        const hex = entity.slice(2);
        const code = parseInt(hex, 16);
        if (!isNaN(code)) {
          try {
            return String.fromCodePoint(code);
          } catch (e) {
            return match;
          }
        }
      }
      // Decimal entity
      if (entity.startsWith('#')) {
        const dec = entity.slice(1);
        const code = parseInt(dec, 10);
        if (!isNaN(code)) {
          try {
            return String.fromCodePoint(code);
          } catch (e) {
            return match;
          }
        }
      }
      // Named entity
      // Check browser DOM parser for all standard HTML5 entities
      const txt = document.createElement('textarea');
      txt.innerHTML = match;
      const decoded = txt.value;
      // In case textarea doesn't decode, check reverse named map
      if (decoded === match) {
        for (const [char, name] of Object.entries(NAMED_MAP)) {
          if (name.toLowerCase() === entity.toLowerCase()) {
            return char;
          }
        }
      }
      return decoded;
    });
  }

  // Perform conversion and update UI
  function processConversion() {
    const inputVal = inputText.value;
    const format = entityFormatSelect.value;
    const scope = encodeScopeSelect.value;

    let outputVal = '';
    if (currentMode === 'encode') {
      outputVal = encodeString(inputVal, format, scope);
    } else {
      outputVal = decodeString(inputVal);
    }

    outputText.value = outputVal;
    updateStatistics(inputVal, outputVal);
  }

  // Update stats counters
  function updateStatistics(inputVal, outputVal) {
    const inChars = inputVal ? Array.from(inputVal).length : 0;
    const inBytes = getByteCount(inputVal);
    const inLines = inputVal ? inputVal.split('\n').length : 0;

    const outChars = outputVal ? Array.from(outputVal).length : 0;
    const outBytes = getByteCount(outputVal);

    statInputChars.textContent = inChars.toLocaleString();
    statInputBytes.textContent = inBytes.toLocaleString();
    statInputLines.textContent = inLines.toLocaleString();

    statOutputChars.textContent = outChars.toLocaleString();
    statOutputBytes.textContent = outBytes.toLocaleString();

    if (inChars > 0) {
      const diff = outChars - inChars;
      const percent = Math.round((diff / inChars) * 100);
      const sign = percent > 0 ? '+' : '';
      statOutputRatio.textContent = `${sign}${percent}%`;
      statOutputRatio.style.color = percent > 0 ? 'var(--accent)' : (percent < 0 ? 'var(--success)' : 'inherit');
    } else {
      statOutputRatio.textContent = '0%';
      statOutputRatio.style.color = 'inherit';
    }
  }

  // Set mode: 'encode' or 'decode'
  function setMode(mode) {
    currentMode = mode;
    if (mode === 'encode') {
      modeEncodeBtn.classList.add('active');
      modeDecodeBtn.classList.remove('active');
      inputTitle.textContent = 'Plain Text / HTML Input';
      outputTitle.textContent = 'HTML Entity Output';
      inputText.placeholder = 'Type or paste plain text or HTML code here...';
      outputText.placeholder = 'Encoded HTML entities will appear here...';
      scopeSelectWrapper.style.opacity = '1';
      scopeSelectWrapper.style.pointerEvents = 'auto';
      formatSelectWrapper.style.opacity = '1';
      formatSelectWrapper.style.pointerEvents = 'auto';
    } else {
      modeDecodeBtn.classList.add('active');
      modeEncodeBtn.classList.remove('active');
      inputTitle.textContent = 'HTML Entity Input';
      outputTitle.textContent = 'Decoded Plain Text Output';
      inputText.placeholder = 'Paste HTML entities here (e.g. &lt;div&gt; &copy; &#169; &#x3C;)...';
      outputText.placeholder = 'Decoded characters will appear here...';
      scopeSelectWrapper.style.opacity = '0.4';
      scopeSelectWrapper.style.pointerEvents = 'none';
      formatSelectWrapper.style.opacity = '0.4';
      formatSelectWrapper.style.pointerEvents = 'none';
    }
    processConversion();
  }

  // Event Listeners
  modeEncodeBtn.addEventListener('click', () => setMode('encode'));
  modeDecodeBtn.addEventListener('click', () => setMode('decode'));
  entityFormatSelect.addEventListener('change', processConversion);
  encodeScopeSelect.addEventListener('change', processConversion);
  inputText.addEventListener('input', processConversion);

  // Clear button
  btnClear.addEventListener('click', () => {
    inputText.value = '';
    outputText.value = '';
    updateStatistics('', '');
    inputText.focus();
  });

  // Paste button
  btnPaste.addEventListener('click', async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      inputText.value = clipText;
      processConversion();
    } catch (e) {
      inputText.focus();
    }
  });

  // Swap button
  btnSwap.addEventListener('click', () => {
    const currentOutput = outputText.value;
    inputText.value = currentOutput;
    setMode(currentMode === 'encode' ? 'decode' : 'encode');
  });

  // Copy button
  btnCopy.addEventListener('click', () => {
    const textToCopy = outputText.value;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      const originalHtml = btnCopy.innerHTML;
      btnCopy.innerHTML = `<span style="color: var(--success); font-weight: 700;">Copied!</span>`;
      setTimeout(() => {
        btnCopy.innerHTML = originalHtml;
      }, 1800);
    });
  });

  // Download button
  btnDownload.addEventListener('click', () => {
    const text = outputText.value;
    if (!text) return;
    const filename = currentMode === 'encode' ? 'encoded_entities.txt' : 'decoded_text.txt';
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Sample buttons
  btnSampleHtml.addEventListener('click', () => {
    setMode('encode');
    inputText.value = `<article id="post-42" class="entry-card">
  <header>
    <h1>Tom & Jerry's "Grand Adventure"</h1>
    <span class="badge">Price: 19.99€ / £17.50</span>
  </header>
  <p>Enjoy 100% genuine content! All rights reserved &copy; 2026 &trade;.</p>
  <footer>
    <a href="https://example.com/test?a=1&b=2">Read & Explore &rarr;</a>
  </footer>
</article>`;
    processConversion();
  });

  btnSampleSymbols.addEventListener('click', () => {
    setMode('encode');
    inputText.value = `Special Symbols & Math:
© Copyright  ® Registered  ™ Trademark  € Euro  £ Pound  ¥ Yen  ¢ Cent
° Degree  ± Plus-Minus  ≠ Not-Equal  ≤ Less-Equal  ≥ Greater-Equal
× Multiply  ÷ Divide  ∞ Infinity  √ Square Root  ∑ Sum  ∏ Product
α Alpha  β Beta  γ Gamma  π Pi  Ω Omega  ♥ Heart  ★ Star  … Ellipsis`;
    processConversion();
  });

  // Initial stats
  updateStatistics('', '');
});