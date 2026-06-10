document.addEventListener('DOMContentLoaded', () => {
  const htmlInput = document.getElementById('html-input');
  const mdOutput = document.getElementById('md-output');
  const clearBtn = document.getElementById('clear-btn');
  const pasteBtn = document.getElementById('paste-btn');
  const copyBtn = document.getElementById('copy-btn');

  // Options
  const optHeading = document.getElementById('opt-heading');
  const optHr = document.getElementById('opt-hr');
  const optCode = document.getElementById('opt-code');

  // Initialize Turndown
  let turndownService = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    codeBlockStyle: 'indented'
  });

  const updateTurndownOptions = () => {
    turndownService = new TurndownService({
      headingStyle: optHeading.checked ? 'atx' : 'setext',
      hr: optHr.checked ? '---' : '***',
      codeBlockStyle: optCode.checked ? 'fenced' : 'indented'
    });
    convertHtmlToMarkdown();
  };

  const convertHtmlToMarkdown = () => {
    const html = htmlInput.value.trim();
    if (!html) {
      mdOutput.value = '';
      return;
    }
    try {
      const markdown = turndownService.turndown(html);
      mdOutput.value = markdown;
    } catch (err) {
      mdOutput.value = 'Error parsing HTML: ' + err.message;
    }
  };

  // Event Listeners
  htmlInput.addEventListener('input', convertHtmlToMarkdown);
  optHeading.addEventListener('change', updateTurndownOptions);
  optHr.addEventListener('change', updateTurndownOptions);
  optCode.addEventListener('change', updateTurndownOptions);

  clearBtn.addEventListener('click', () => {
    htmlInput.value = '';
    mdOutput.value = '';
    htmlInput.focus();
  });

  pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      htmlInput.value = text;
      convertHtmlToMarkdown();
    } catch (err) {
      alert('Failed to read clipboard contents.');
    }
  });

  copyBtn.addEventListener('click', () => {
    const text = mdOutput.value;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      const originalText = copyBtn.innerText;
      copyBtn.innerText = 'Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.innerText = originalText;
        copyBtn.classList.remove('copied');
      }, 2000);
    }).catch(err => {
      alert('Failed to copy to clipboard.');
    });
  });
});