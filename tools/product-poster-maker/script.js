document.addEventListener('DOMContentLoaded', () => {
  // --- UI Elements ---
  const formatBtns = document.querySelectorAll('.ppm-format-btn');
  const colorBg = document.getElementById('color-bg');
  const colorPrimary = document.getElementById('color-primary');
  const colorText = document.getElementById('color-text');
  
  const uploadProductBox = document.getElementById('upload-product');
  const fileProduct = document.getElementById('file-product');
  const uploadLogoBox = document.getElementById('upload-logo');
  const fileLogo = document.getElementById('file-logo');
  
  const textHeadline = document.getElementById('text-headline');
  const textProduct = document.getElementById('text-product');
  const textDesc = document.getElementById('text-desc');
  const textPrice = document.getElementById('text-price');
  const textDiscount = document.getElementById('text-discount');
  const textContact = document.getElementById('text-contact');
  
  const toggleQr = document.getElementById('toggle-qr');
  const textQrUrl = document.getElementById('text-qr-url');
  
  const btnGenerate = document.getElementById('btn-generate');
  const btnReset = document.getElementById('btn-reset');
  const btnDownloadPng = document.getElementById('btn-download-png');
  const btnDownloadJpg = document.getElementById('btn-download-jpg');
  
  const canvas = document.getElementById('poster-canvas');
  const ctx = canvas.getContext('2d');
  const qrContainer = document.getElementById('qr-container');
  
  // --- State ---
  let currentFormat = { w: 1080, h: 1080, type: 'social' };
  let productImage = null;
  let logoImage = null;
  let qrImage = null;

  // --- Initialize ---
  init();

  function init() {
    setupUploadBox(uploadProductBox, fileProduct, img => {
      productImage = img;
      uploadProductBox.classList.add('has-image');
      uploadProductBox.querySelector('span').textContent = 'Product Added';
      drawPoster();
    });

    setupUploadBox(uploadLogoBox, fileLogo, img => {
      logoImage = img;
      uploadLogoBox.classList.add('has-image');
      uploadLogoBox.querySelector('span').textContent = 'Logo Added';
      drawPoster();
    });

    formatBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        formatBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFormat.w = parseInt(btn.dataset.w);
        currentFormat.h = parseInt(btn.dataset.h);
        currentFormat.type = btn.dataset.type;
        drawPoster();
      });
    });

    const inputs = [colorBg, colorPrimary, colorText, textHeadline, textProduct, textDesc, textPrice, textDiscount, textContact, toggleQr, textQrUrl];
    inputs.forEach(input => {
      input.addEventListener('input', drawPoster);
      input.addEventListener('change', drawPoster);
    });

    btnGenerate.addEventListener('click', drawPoster);
    btnReset.addEventListener('click', resetAll);
    
    btnDownloadPng.addEventListener('click', () => downloadPoster('png'));
    btnDownloadJpg.addEventListener('click', () => downloadPoster('jpeg'));

    // Initial draw
    drawPoster();
  }

  // --- Upload Handlers ---
  function setupUploadBox(box, input, callback) {
    box.addEventListener('click', () => input.click());
    box.addEventListener('dragover', e => { e.preventDefault(); box.classList.add('dragover'); });
    box.addEventListener('dragleave', () => box.classList.remove('dragover'));
    box.addEventListener('drop', e => {
      e.preventDefault();
      box.classList.remove('dragover');
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0], callback);
    });
    input.addEventListener('change', () => {
      if (input.files[0]) handleFile(input.files[0], callback);
    });
  }

  function handleFile(file, callback) {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => callback(img);
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // --- QR Code Generation ---
  function generateQRCode(url) {
    return new Promise((resolve) => {
      if (!window.QRCode) {
        // Fallback if QRCode lib fails to load
        resolve(null);
        return;
      }
      qrContainer.innerHTML = '';
      new QRCode(qrContainer, {
        text: url,
        width: 256,
        height: 256,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
      
      setTimeout(() => {
        const imgEl = qrContainer.querySelector('img');
        const canvasEl = qrContainer.querySelector('canvas');
        if (imgEl && imgEl.src) {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = imgEl.src;
        } else if (canvasEl) {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = canvasEl.toDataURL();
        } else {
          resolve(null);
        }
      }, 50);
    });
  }

  // --- Drawing Logic ---
  async function drawPoster() {
    canvas.width = currentFormat.w;
    canvas.height = currentFormat.h;
    
    const w = canvas.width;
    const h = canvas.height;
    
    // Background
    ctx.fillStyle = colorBg.value;
    ctx.fillRect(0, 0, w, h);

    // Decorative Primary Shape
    ctx.fillStyle = colorPrimary.value;
    ctx.beginPath();
    if (currentFormat.type === 'banner') {
      ctx.moveTo(w * 0.6, 0);
      ctx.lineTo(w, 0);
      ctx.lineTo(w, h);
      ctx.lineTo(w * 0.4, h);
    } else {
      ctx.moveTo(0, h * 0.7);
      ctx.lineTo(w, h * 0.5);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
    }
    ctx.fill();

    // Scale factors
    const minDim = Math.min(w, h);
    const scale = minDim / 1080;

    // Logo
    if (logoImage) {
      const logoMaxH = 100 * scale;
      const logoW = logoImage.width * (logoMaxH / logoImage.height);
      ctx.drawImage(logoImage, 50 * scale, 50 * scale, logoW, logoMaxH);
    }

    // Headline
    const headline = textHeadline.value;
    if (headline) {
      ctx.fillStyle = currentFormat.type === 'banner' ? colorText.value : colorPrimary.value;
      ctx.font = `900 ${100 * scale}px Arial, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(headline.toUpperCase(), 50 * scale, 180 * scale);
    }

    // Product Name
    const pName = textProduct.value;
    if (pName) {
      ctx.fillStyle = colorText.value;
      ctx.font = `bold ${60 * scale}px Arial, sans-serif`;
      
      const words = pName.split(' ');
      let line = '';
      let y = 320 * scale;
      
      for(let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > (w * 0.5) && n > 0) {
          ctx.fillText(line, 50 * scale, y);
          line = words[n] + ' ';
          y += 70 * scale;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 50 * scale, y);
    }

    // Description
    const pDesc = textDesc.value;
    let descYEnd = 450 * scale;
    if (pDesc) {
      ctx.fillStyle = colorText.value;
      ctx.globalAlpha = 0.8;
      ctx.font = `normal ${35 * scale}px Arial, sans-serif`;
      
      const words = pDesc.split(' ');
      let line = '';
      let y = 320 * scale + (150 * scale); // approx below title
      
      for(let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > (w * 0.45) && n > 0) {
          ctx.fillText(line, 50 * scale, y);
          line = words[n] + ' ';
          y += 45 * scale;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 50 * scale, y);
      ctx.globalAlpha = 1.0;
      descYEnd = y + 50 * scale;
    }

    // Price
    const price = textPrice.value;
    if (price) {
      ctx.fillStyle = colorText.value;
      ctx.font = `900 ${80 * scale}px Arial, sans-serif`;
      ctx.fillText(price, 50 * scale, descYEnd + 40 * scale);
    }

    // Discount Badge
    const discount = textDiscount.value;
    if (discount) {
      ctx.fillStyle = '#ef4444'; // Red badge
      const dFont = `bold ${40 * scale}px Arial, sans-serif`;
      ctx.font = dFont;
      const dWidth = ctx.measureText(discount).width;
      
      const bx = 50 * scale;
      const by = descYEnd + 150 * scale;
      const bp = 20 * scale;
      
      ctx.beginPath();
      ctx.roundRect(bx, by, dWidth + bp*2, 40*scale + bp*2, 10*scale);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.textBaseline = 'middle';
      ctx.fillText(discount, bx + bp, by + (40*scale + bp*2)/2);
      ctx.textBaseline = 'top'; // reset
    }

    // Product Image
    if (productImage) {
      let imgMaxW, imgMaxH, imgX, imgY;
      
      if (currentFormat.type === 'banner') {
        imgMaxW = w * 0.4;
        imgMaxH = h * 0.8;
        imgX = w * 0.55;
        imgY = h * 0.1;
      } else {
        imgMaxW = w * 0.6;
        imgMaxH = h * 0.5;
        imgX = w * 0.35;
        imgY = h * 0.25;
      }

      const imgAspect = productImage.width / productImage.height;
      const boxAspect = imgMaxW / imgMaxH;
      
      let drawW, drawH;
      if (imgAspect > boxAspect) {
        drawW = imgMaxW;
        drawH = imgMaxW / imgAspect;
      } else {
        drawH = imgMaxH;
        drawW = imgMaxH * imgAspect;
      }
      
      // Center in allocated area
      const finalX = imgX + (imgMaxW - drawW)/2;
      const finalY = imgY + (imgMaxH - drawH)/2;

      // Add shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 40 * scale;
      ctx.shadowOffsetX = 10 * scale;
      ctx.shadowOffsetY = 20 * scale;
      
      ctx.drawImage(productImage, finalX, finalY, drawW, drawH);
      ctx.restore();
    }

    // Contact Footer
    const contact = textContact.value;
    if (contact) {
      ctx.fillStyle = (currentFormat.type === 'banner' || currentFormat.type === 'a4') ? '#ffffff' : '#ffffff';
      // In non-banner types, the bottom is primary color, so white text is good.
      ctx.font = `bold ${35 * scale}px Arial, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(contact, w / 2, h - 80 * scale);
    }

    // QR Code
    if (toggleQr.checked && textQrUrl.value) {
      qrImage = await generateQRCode(textQrUrl.value);
      if (qrImage) {
        const qrSize = 150 * scale;
        const qrX = w - qrSize - 50 * scale;
        const qrY = h - qrSize - 120 * scale;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(qrX - 10*scale, qrY - 10*scale, qrSize + 20*scale, qrSize + 20*scale);
        ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
      }
    }
  }

  // --- Reset ---
  function resetAll() {
    textHeadline.value = 'SUPER SALE!';
    textProduct.value = 'Premium Wireless Headphones';
    textDesc.value = 'Experience crystal clear sound with active noise cancellation and 30-hour battery life.';
    textPrice.value = '$199.99';
    textDiscount.value = '50% OFF';
    textContact.value = 'www.yourstore.com | +1 234 567 8900';
    textQrUrl.value = 'https://example.com/product';
    toggleQr.checked = true;
    
    colorBg.value = '#ffffff';
    colorPrimary.value = '#4f46e5';
    colorText.value = '#111827';
    
    productImage = null;
    logoImage = null;
    
    uploadProductBox.classList.remove('has-image');
    uploadProductBox.querySelector('span').textContent = 'Upload Product Image';
    uploadLogoBox.classList.remove('has-image');
    uploadLogoBox.querySelector('span').textContent = 'Upload Brand Logo (Opt)';
    
    drawPoster();
  }

  // --- Download ---
  function downloadPoster(format) {
    const link = document.createElement('a');
    const ext = format === 'jpeg' ? 'jpg' : 'png';
    link.download = `product-poster.${ext}`;
    link.href = canvas.toDataURL(`image/${format}`, 1.0);
    link.click();
  }
});
