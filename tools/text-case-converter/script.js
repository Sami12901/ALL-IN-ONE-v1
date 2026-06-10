// Case Converter Logic
document.addEventListener('DOMContentLoaded', () => {
  const caseInput = document.getElementById('case-input');
  const copyBtn = document.getElementById('copy-btn');
  const clearBtn = document.getElementById('clear-btn');

  // Small prepositions and articles ignored in Title Case
  const stopWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 'of', 'in', 'with'];

  document.querySelectorAll('.case-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-case');
      const text = caseInput.value;
      if (!text) return;

      let result = '';

      switch (type) {
        case 'upper':
          result = text.toUpperCase();
          break;
        case 'lower':
          result = text.toLowerCase();
          break;
        case 'title':
          result = text.toLowerCase().split(' ').map((word, idx) => {
            if (idx > 0 && stopWords.includes(word)) return word;
            return word.charAt(0).toUpperCase() + word.slice(1);
          }).join(' ');
          break;
        case 'sentence':
          result = text.toLowerCase().replace(/(^|[.!?]\s+)([a-z])/g, (match, separator, char) => {
            return separator + char.toUpperCase();
          });
          break;
        case 'camel':
          result = text.toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
            .replace(/[^a-zA-Z0-9]/g, '');
          result = result.charAt(0).toLowerCase() + result.slice(1);
          break;
        case 'snake':
          result = text.toLowerCase()
            .trim()
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_]/g, '');
          break;
      }

      caseInput.value = result;
    });
  });

  copyBtn.addEventListener('click', () => {
    if (!caseInput.value) return;
    navigator.clipboard.writeText(caseInput.value).then(() => {
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = 'Copy Output';
        copyBtn.classList.remove('copied');
      }, 2000);
    });
  });

  clearBtn.addEventListener('click', () => {
    caseInput.value = '';
    caseInput.focus();
  });
});