// Base64 Decoder Logic
document.addEventListener('DOMContentLoaded', () => {
  const base64Input = document.getElementById('base64-input');
  const decodedOutput = document.getElementById('decoded-output');
  const copyBtn = document.getElementById('copy-btn');
  const decodeBtn = document.getElementById('decode-btn');
  const clearBtn = document.getElementById('clear-btn');
  const decodeError = document.getElementById('decode-error');
  const downloadArea = document.getElementById('download-area');
  const downloadFileBtn = document.getElementById('download-file');

  let activeBlob = null;
  let detectedFileName = 'decoded_file.bin';

  decodeBtn.addEventListener('click', () => {
    const base64Str = base64Input.value.replace(/\s/g, '');
    decodeError.style.display = 'none';
    downloadArea.style.display = 'none';
    decodedOutput.value = '';
    activeBlob = null;

    if (!base64Str) return;

    try {
      const binaryString = atob(base64Str);
      
      // Attempt UTF-8 decode
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      try {
        const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
        decodedOutput.value = text;
      } catch (err) {
        // Fallback if not standard text: Display as raw binary representation and offer download file
        decodedOutput.value = `[Binary File Detected - Size: ${len} bytes]\nCannot represent as plain text. Use 'Download Decoded File' below to retrieve.`;
        
        // Detect typical mime files from byte markers
        let mimeType = 'application/octet-stream';
        if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
          mimeType = 'image/png';
          detectedFileName = 'decoded_image.png';
        } else if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
          mimeType = 'image/jpeg';
          detectedFileName = 'decoded_image.jpg';
        } else if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
          mimeType = 'application/pdf';
          detectedFileName = 'decoded_document.pdf';
        } else if (bytes[0] === 0x50 && bytes[1] === 0x4B) {
          mimeType = 'application/zip';
          detectedFileName = 'decoded_archive.zip';
        }

        activeBlob = new Blob([bytes], { type: mimeType });
        downloadArea.style.display = 'flex';
      }
    } catch (e) {
      decodeError.textContent = 'Invalid Base64 format. Parse failed.';
      decodeError.style.display = 'block';
    }
  });

  downloadFileBtn.addEventListener('click', () => {
    if (!activeBlob) return;
    const link = document.createElement('a');
    link.download = detectedFileName;
    link.href = URL.createObjectURL(activeBlob);
    link.click();
  });

  copyBtn.addEventListener('click', () => {
    if (!decodedOutput.value) return;
    navigator.clipboard.writeText(decodedOutput.value).then(() => {
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
        copyBtn.classList.remove('copied');
      }, 2000);
    });
  });

  clearBtn.addEventListener('click', () => {
    base64Input.value = '';
    decodedOutput.value = '';
    decodeError.style.display = 'none';
    downloadArea.style.display = 'none';
    activeBlob = null;
    base64Input.focus();
  });
});