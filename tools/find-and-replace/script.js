// Find and Replace Logic
document.addEventListener('DOMContentLoaded', () => {
  const inputText = document.getElementById('input-text');
  const findInput = document.getElementById('find-input');
  const replaceInput = document.getElementById('replace-input');
  const matchCaseCb = document.getElementById('match-case');
  const useRegexCb = document.getElementById('use-regex');
  
  const outputText = document.getElementById('output-text');
  const matchCountLabel = document.getElementById('match-count');
  const regexError = document.getElementById('regex-error');
  const copyBtn = document.getElementById('copy-btn');

  function doReplace() {
    const text = inputText.value;
    const findStr = findInput.value;
    const replaceStr = replaceInput.value;
    const matchCase = matchCaseCb.checked;
    const useRegex = useRegexCb.checked;

    regexError.style.display = 'none';

    if (!text || !findStr) {
      outputText.value = text;
      matchCountLabel.style.display = 'none';
      return;
    }

    let result = text;
    let matchCount = 0;

    try {
      if (useRegex) {
        // Regex replacement
        const flags = 'g' + (matchCase ? '' : 'i');
        const re = new RegExp(findStr, flags);
        
        // Count matches
        const matches = text.match(re);
        matchCount = matches ? matches.length : 0;
        
        result = text.replace(re, replaceStr);
      } else {
        // String replacement
        if (matchCase) {
          matchCount = text.split(findStr).length - 1;
          result = text.split(findStr).join(replaceStr);
        } else {
          // Case insensitive string replacement requires regex under the hood
          // escape regex chars first
          const escapedFindStr = findStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const re = new RegExp(escapedFindStr, 'gi');
          
          const matches = text.match(re);
          matchCount = matches ? matches.length : 0;
          
          // using replacement function to handle special patterns like $& that shouldn't be interpreted in literal mode
          result = text.replace(re, () => replaceStr);
        }
      }

      outputText.value = result;
      
      if (matchCount > 0) {
        matchCountLabel.textContent = `${matchCount} replacement${matchCount === 1 ? '' : 's'}`;
        matchCountLabel.style.display = 'inline-block';
      } else {
        matchCountLabel.style.display = 'none';
      }

    } catch (err) {
      // Handle invalid regex
      outputText.value = text;
      matchCountLabel.style.display = 'none';
      regexError.style.display = 'block';
      regexError.textContent = 'Error: Invalid Regular Expression - ' + err.message;
    }
  }

  // Event Listeners for instant update
  inputText.addEventListener('input', doReplace);
  findInput.addEventListener('input', doReplace);
  replaceInput.addEventListener('input', doReplace);
  matchCaseCb.addEventListener('change', doReplace);
  useRegexCb.addEventListener('change', doReplace);

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