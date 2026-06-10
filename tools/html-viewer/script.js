document.addEventListener('DOMContentLoaded', () => {
  const htmlInput = document.getElementById('html-input');
  const previewFrame = document.getElementById('preview-frame');
  const clearBtn = document.getElementById('clear-btn');
  const pasteBtn = document.getElementById('paste-btn');
  const renderBtn = document.getElementById('render-btn');
  const optAuto = document.getElementById('opt-auto');

  let renderTimeout;

  const renderPreview = () => {
    const htmlContent = htmlInput.value;
    previewFrame.srcdoc = htmlContent;
  };

  const debouncedRender = () => {
    if (!optAuto.checked) return;
    clearTimeout(renderTimeout);
    renderTimeout = setTimeout(() => {
      renderPreview();
    }, 300);
  };

  // Event Listeners
  htmlInput.addEventListener('input', debouncedRender);
  
  renderBtn.addEventListener('click', renderPreview);

  clearBtn.addEventListener('click', () => {
    htmlInput.value = '';
    renderPreview();
    htmlInput.focus();
  });

  pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      htmlInput.value = text;
      renderPreview();
    } catch (err) {
      alert('Failed to read clipboard contents.');
    }
  });

  optAuto.addEventListener('change', () => {
    if (optAuto.checked) {
      renderPreview();
    }
  });

  // Initial render if there is placeholder text or cached text
  if (htmlInput.value) {
    renderPreview();
  }
});
