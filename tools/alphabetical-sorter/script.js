// Alphabetical Sorter Logic
document.addEventListener('DOMContentLoaded', () => {
  const inputText = document.getElementById('input-text');
  const outputText = document.getElementById('output-text');
  const sortOrder = document.getElementById('sort-order');
  const removeDuplicates = document.getElementById('remove-duplicates');
  const removeEmpty = document.getElementById('remove-empty');
  const clearBtn = document.getElementById('clear-btn');
  const copyBtn = document.getElementById('copy-btn');
  const lineCount = document.getElementById('line-count');

  function doSort() {
    const text = inputText.value;
    
    if (!text) {
      outputText.value = '';
      lineCount.textContent = '0';
      return;
    }

    let lines = text.split('\n');

    // Remove empty lines
    if (removeEmpty.checked) {
      lines = lines.filter(line => line.trim().length > 0);
    }

    // Remove duplicates
    if (removeDuplicates.checked) {
      // Use Set to remove exact duplicates
      lines = [...new Set(lines)];
    }

    // Sort using localeCompare to properly handle numbers and mixed case
    lines.sort((a, b) => {
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });

    // Reverse if needed
    if (sortOrder.value === 'desc') {
      lines.reverse();
    }

    outputText.value = lines.join('\n');
    lineCount.textContent = lines.length;
  }

  // Event Listeners for instant update
  inputText.addEventListener('input', doSort);
  sortOrder.addEventListener('change', doSort);
  removeDuplicates.addEventListener('change', doSort);
  removeEmpty.addEventListener('change', doSort);

  clearBtn.addEventListener('click', () => {
    inputText.value = '';
    outputText.value = '';
    lineCount.textContent = '0';
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