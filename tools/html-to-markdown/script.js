// HTML to Markdown Converter Logic
document.addEventListener('DOMContentLoaded', () => {
  const inputHtml = document.getElementById('input-html');
  const outputMarkdown = document.getElementById('output-markdown');
  const clearBtn = document.getElementById('clear-btn');
  const copyBtn = document.getElementById('copy-btn');
  const headingStyle = document.getElementById('heading-style');

  // Ensure Turndown is loaded
  if (typeof TurndownService === 'undefined') {
    outputMarkdown.value = 'Error: Conversion library (turndown.js) failed to load.';
    return;
  }

  // Initialize Turndown service
  let turndownService = new TurndownService({
    headingStyle: headingStyle.value,
    codeBlockStyle: 'fenced'
  });

  // Optional: add tables plugin if available, but default turndown doesn't do tables out of the box without plugin.
  // We'll stick to standard html elements for now.

  function convertHtml() {
    const htmlStr = inputHtml.value;
    if (!htmlStr.trim()) {
      outputMarkdown.value = '';
      return;
    }

    try {
      const markdown = turndownService.turndown(htmlStr);
      outputMarkdown.value = markdown;
    } catch (err) {
      console.error(err);
      outputMarkdown.value = 'Error parsing HTML: ' + err.message;
    }
  }

  // Event Listeners for instant conversion
  inputHtml.addEventListener('input', convertHtml);
  
  headingStyle.addEventListener('change', () => {
    turndownService.options.headingStyle = headingStyle.value;
    convertHtml();
  });

  clearBtn.addEventListener('click', () => {
    inputHtml.value = '';
    outputMarkdown.value = '';
    inputHtml.focus();
  });

  // Copy to clipboard
  copyBtn.addEventListener('click', async () => {
    try {
      const textToCopy = outputMarkdown.value;
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

  // Attempt an initial conversion if there's pre-filled text (like from a browser back button)
  if (inputHtml.value) {
    convertHtml();
  }
});