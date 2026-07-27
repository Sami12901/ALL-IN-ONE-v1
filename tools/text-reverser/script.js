// Text Reverser Logic
document.addEventListener('DOMContentLoaded', () => {
  const inputText = document.getElementById('input-text');
  const outputText = document.getElementById('output-text');
  const modeSelect = document.getElementById('reverse-mode');
  const clearBtn = document.getElementById('clear-btn');
  const copyBtn = document.getElementById('copy-btn');

  function reverseText() {
    const text = inputText.value;
    if (!text) {
      outputText.value = '';
      return;
    }

    const mode = modeSelect.value;
    let reversed = '';

    if (mode === 'chars') {
      // Reverse all characters (hello -> olleh)
      reversed = text.split('').reverse().join('');
    } else if (mode === 'words') {
      // Reverse word order per line (hello world -> world hello)
      const lines = text.split('\n');
      reversed = lines.map(line => line.split(' ').reverse().join(' ')).join('\n');
    } else if (mode === 'both') {
      // Reverse words and chars (hello world -> dlrow olleh)
      const lines = text.split('\n');
      reversed = lines.map(line => line.split('').reverse().join('')).join('\n');
    } else if (mode === 'lines') {
      // Reverse line order (line1 \n line2 -> line2 \n line1)
      reversed = text.split('\n').reverse().join('\n');
    }

    outputText.value = reversed;
  }

  // Event Listeners
  inputText.addEventListener('input', reverseText);
  modeSelect.addEventListener('change', reverseText);

  clearBtn.addEventListener('click', () => {
    inputText.value = '';
    outputText.value = '';
    inputText.focus();
  });

  // Copy to clipboard
  copyBtn.addEventListener('click', async () => {
    try {
      const textToCopy = outputText.value;
      if (!textToCopy) return;
      
      await navigator.clipboard.writeText(textToCopy);
      
      const originalHTML = copyBtn.innerHTML;
      copyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
      copyBtn.classList.add('copied');
      
      setTimeout(() => {
        copyBtn.innerHTML = originalHTML;
        copyBtn.classList.remove('copied');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy text to clipboard.');
    }
  });
});