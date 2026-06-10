// QR Code Generator Logic
document.addEventListener('DOMContentLoaded', () => {
  const qrInput = document.getElementById('qr-input');
  const qrSize = document.getElementById('qr-size');
  const qrFg = document.getElementById('qr-fg');
  const qrBg = document.getElementById('qr-bg');
  const canvas = document.getElementById('qr-canvas');
  const downloadPng = document.getElementById('download-png');

  let qr = null;

  function generateQR() {
    const value = qrInput.value.trim() || 'https://sami12901.github.io/ALL-IN-ONE-v1/';
    const size = parseInt(qrSize.value);
    const foreground = qrFg.value;
    const background = qrBg.value;

    if (window.QRious) {
      qr = new QRious({
        element: canvas,
        value: value,
        size: size,
        foreground: foreground,
        background: background,
        level: 'H'
      });
    }
  }

  qrInput.addEventListener('input', generateQR);
  qrSize.addEventListener('change', generateQR);
  qrFg.addEventListener('change', generateQR);
  qrBg.addEventListener('change', generateQR);

  downloadPng.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  // Initial generation on load
  setTimeout(generateQR, 200);
});