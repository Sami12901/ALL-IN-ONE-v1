// Character Counter Logic
document.addEventListener('DOMContentLoaded', () => {
  const charInput = document.getElementById('char-input');
  const countSpaces = document.getElementById('count-spaces');
  const countPunct = document.getElementById('count-punct');
  const statGlyphs = document.getElementById('stat-glyphs');
  const statSpaces = document.getElementById('stat-spaces');
  const statPuncts = document.getElementById('stat-puncts');
  const statBytes = document.getElementById('stat-bytes');
  const clearBtn = document.getElementById('clear-btn');

  function calculateMetrics() {
    const text = charInput.value;
    
    // 1. Spaces count
    const spaces = (text.match(/\s/g) || []).length;
    statSpaces.textContent = spaces;

    // 2. Punctuation count
    const puncts = (text.match(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g) || []).length;
    statPuncts.textContent = puncts;

    // 3. UTF-8 Byte Size
    const bytes = new Blob([text]).size;
    statBytes.textContent = formatBytes(bytes);

    // 4. Glyphs (Visuals) counting emojis correctly
    let glyphArray = Array.from(text);
    
    if (!countSpaces.checked) {
      glyphArray = glyphArray.filter(c => !/\s/.test(c));
    }
    if (!countPunct.checked) {
      glyphArray = glyphArray.filter(c => !/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/.test(c));
    }

    statGlyphs.textContent = glyphArray.length;
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  charInput.addEventListener('input', calculateMetrics);
  countSpaces.addEventListener('change', calculateMetrics);
  countPunct.addEventListener('change', calculateMetrics);
  
  clearBtn.addEventListener('click', () => {
    charInput.value = '';
    calculateMetrics();
    charInput.focus();
  });
});