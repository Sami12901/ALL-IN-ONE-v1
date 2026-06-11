document.addEventListener('DOMContentLoaded', () => {
  const inputText = document.getElementById('inputText');
  const findInput = document.getElementById('findInput');
  const replaceInput = document.getElementById('replaceInput');
  
  const useRegex = document.getElementById('useRegex');
  const matchCase = document.getElementById('matchCase');
  const matchWholeWord = document.getElementById('matchWholeWord');
  
  const clearBtn = document.getElementById('clearBtn');
  const replaceBtn = document.getElementById('replaceBtn');
  const resultText = document.getElementById('resultText');
  const copyBtn = document.getElementById('copyBtn');
  const statusMessage = document.getElementById('statusMessage');

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function doReplace() {
    const text = inputText.value;
    const find = findInput.value;
    const replace = replaceInput.value;
    
    if (!text) {
      resultText.textContent = '';
      statusMessage.textContent = '';
      return;
    }
    
    if (!find) {
      resultText.textContent = text;
      statusMessage.textContent = '0 replacements made (empty find string).';
      statusMessage.style.color = 'var(--text-secondary)';
      return;
    }
    
    let regexStr = useRegex.checked ? find : escapeRegExp(find);
    
    if (matchWholeWord.checked) {
      regexStr = `\\b(?:${regexStr})\\b`;
    }
    
    let flags = 'g';
    if (!matchCase.checked) {
      flags += 'i';
    }
    
    let regex;
    try {
      regex = new RegExp(regexStr, flags);
    } catch (e) {
      statusMessage.textContent = 'Invalid Regular Expression';
      statusMessage.style.color = 'var(--error)';
      return;
    }
    
    const matches = text.match(regex);
    const totalMatches = matches ? matches.length : 0;
    
    let finalResult;
    if (useRegex.checked) {
      // Allow regex replacement patterns like $1, $2
      finalResult = text.replace(regex, replace);
    } else {
      // Treat replacement text literally
      finalResult = text.replace(regex, () => replace);
    }
    
    resultText.textContent = finalResult;
    
    statusMessage.style.color = 'var(--text-secondary)';
    statusMessage.textContent = `${totalMatches} replacement(s) made.`;
  }

  replaceBtn.addEventListener('click', doReplace);
  
  clearBtn.addEventListener('click', () => {
    inputText.value = '';
    findInput.value = '';
    replaceInput.value = '';
    resultText.textContent = '';
    statusMessage.textContent = '';
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