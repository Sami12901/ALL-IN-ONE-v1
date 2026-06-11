document.addEventListener('DOMContentLoaded', () => {
  const inputText = document.getElementById('inputText');
  const reverseType = document.getElementById('reverseType');
  const reverseCharsInWords = document.getElementById('reverseCharsInWords');
  const clearBtn = document.getElementById('clearBtn');
  const reverseBtn = document.getElementById('reverseBtn');
  const resultText = document.getElementById('resultText');
  const copyBtn = document.getElementById('copyBtn');

  // Disable 'reverseCharsInWords' if 'chars' is selected, as it's redundant
  reverseType.addEventListener('change', () => {
    if (reverseType.value === 'chars') {
      reverseCharsInWords.disabled = true;
      reverseCharsInWords.checked = false;
    } else {
      reverseCharsInWords.disabled = false;
    }
  });

  // Initialize
  if (reverseType.value === 'chars') {
    reverseCharsInWords.disabled = true;
  }

  function processText() {
    const text = inputText.value;
    const type = reverseType.value;
    const inWords = reverseCharsInWords.checked;

    if (!text) {
      resultText.textContent = '';
      return;
    }

    let result = '';

    if (type === 'chars') {
      // Reverse everything
      result = text.split('').reverse().join('');
    } else if (type === 'words') {
      // Keep newlines intact by splitting lines first, then words?
      // Or just split by spaces and let newlines be part of the words?
      // Better to split by spaces and keep them.
      let lines = text.split('\n');
      result = lines.map(line => {
        let words = line.split(' ');
        if (inWords) {
          words = words.map(w => w.split('').reverse().join(''));
        }
        return words.reverse().join(' ');
      }).join('\n');
    } else if (type === 'lines') {
      let lines = text.split('\n');
      if (inWords) {
        lines = lines.map(line => {
          let words = line.split(' ');
          return words.map(w => w.split('').reverse().join('')).join(' ');
        });
      }
      result = lines.reverse().join('\n');
    }

    resultText.textContent = result;
  }

  reverseBtn.addEventListener('click', processText);
  
  // Real-time update optionally
  inputText.addEventListener('input', processText);
  reverseType.addEventListener('change', processText);
  reverseCharsInWords.addEventListener('change', processText);

  clearBtn.addEventListener('click', () => {
    inputText.value = '';
    resultText.textContent = '';
    inputText.focus();
  });

  copyBtn.addEventListener('click', () => {
    const textToCopy = resultText.textContent;
    if (!textToCopy) return;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.classList.remove('copied');
      }, 2000);
    });
  });
});