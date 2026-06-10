// JSON Formatter Logic
document.addEventListener('DOMContentLoaded', () => {
  const jsonInput = document.getElementById('json-input');
  const formatBtn = document.getElementById('format-btn');
  const minifyBtn = document.getElementById('minify-btn');
  const clearBtn = document.getElementById('clear-btn');
  const copyBtn = document.getElementById('copy-btn');
  const jsonOutput = document.getElementById('json-output');
  const jsonError = document.getElementById('json-error');
  const jsonSuccess = document.getElementById('json-success');

  function showMsg(type, msg = '') {
    jsonError.style.display = 'none';
    jsonSuccess.style.display = 'none';
    if (type === 'error') {
      jsonError.textContent = msg;
      jsonError.style.display = 'block';
    } else if (type === 'success') {
      jsonSuccess.style.display = 'block';
    }
  }

  function highlightJson(json) {
    // Escape standard tags
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      let cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
          return `<span style="color: var(--accent); font-weight: 600;">${match}</span>`;
        } else {
          cls = 'string';
          return `<span style="color: var(--success);">${match}</span>`;
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
        return `<span style="color: var(--warning); font-weight: 600;">${match}</span>`;
      } else if (/null/.test(match)) {
        cls = 'null';
        return `<span style="color: var(--text-tertiary);">${match}</span>`;
      }
      return `<span style="color: #0ea5e9;">${match}</span>`;
    });
  }

  formatBtn.addEventListener('click', () => {
    const raw = jsonInput.value.trim();
    if (!raw) return;

    try {
      const obj = JSON.parse(raw);
      const formatted = JSON.stringify(obj, null, 2);
      jsonOutput.innerHTML = highlightJson(formatted);
      showMsg('success');
    } catch (e) {
      jsonOutput.textContent = '';
      showMsg('error', `Syntax Error: ${e.message}`);
    }
  });

  minifyBtn.addEventListener('click', () => {
    const raw = jsonInput.value.trim();
    if (!raw) return;

    try {
      const obj = JSON.parse(raw);
      const minified = JSON.stringify(obj);
      jsonOutput.textContent = minified;
      showMsg('success');
    } catch (e) {
      jsonOutput.textContent = '';
      showMsg('error', `Syntax Error: ${e.message}`);
    }
  });

  copyBtn.addEventListener('click', () => {
    const code = jsonOutput.textContent;
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
        copyBtn.classList.remove('copied');
      }, 2000);
    });
  });

  clearBtn.addEventListener('click', () => {
    jsonInput.value = '';
    jsonOutput.textContent = '';
    showMsg('clear');
    jsonInput.focus();
  });
});