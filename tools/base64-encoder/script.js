// Base64 Encoder Logic
document.addEventListener('DOMContentLoaded', () => {
  const textInput = document.getElementById('text-input');
  const fileInput = document.getElementById('file-input');
  const dropArea = document.getElementById('drop-area');
  const base64Output = document.getElementById('base64-output');
  const copyBtn = document.getElementById('copy-btn');
  const downloadTxt = document.getElementById('download-txt');

  function encodeText() {
    const text = textInput.value;
    if (!text) {
      base64Output.value = '';
      return;
    }
    try {
      // UTF-8 safe encoding
      const utf8Bytes = new TextEncoder().encode(text);
      let binary = '';
      utf8Bytes.forEach(b => binary += String.fromCharCode(b));
      base64Output.value = btoa(binary);
    } catch (e) {
      base64Output.value = 'Error encoding text to Base64.';
    }
  }

  textInput.addEventListener('input', encodeText);

  // File Drag & Drop Handlers
  dropArea.addEventListener('click', () => fileInput.click());
  
  dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('dragover');
  });

  dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('dragover');
  });

  dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      processFile(fileInput.files[0]);
    }
  });

  function processFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target.result;
      // Extract pure base64 metadata payload
      const pureBase64 = dataUri.split(',')[1];
      base64Output.value = pureBase64;
      textInput.value = ''; // clear text input
    };
    reader.readAsDataURL(file);
  }

  copyBtn.addEventListener('click', () => {
    if (!base64Output.value) return;
    navigator.clipboard.writeText(base64Output.value).then(() => {
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
        copyBtn.classList.remove('copied');
      }, 2000);
    });
  });

  downloadTxt.addEventListener('click', () => {
    const code = base64Output.value;
    if (!code) return;
    const blob = new Blob([code], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = 'base64_encoded.txt';
    link.href = URL.createObjectURL(blob);
    link.click();
  });
});