document.addEventListener('DOMContentLoaded', () => {
  // --- UI Elements ---
  const templateBtns = document.querySelectorAll('.ptg-template-btn');
  const colorBg = document.getElementById('color-bg');
  const colorPrimary = document.getElementById('color-primary');
  
  const uploadLogoBox = document.getElementById('upload-logo');
  const fileLogo = document.getElementById('file-logo');
  
  const inputStore = document.getElementById('input-store');
  const inputProduct = document.getElementById('input-product');
  const inputSku = document.getElementById('input-sku');
  
  const inputCurrency = document.getElementById('input-currency');
  const inputPriceRegular = document.getElementById('input-price-regular');
  const inputPriceSale = document.getElementById('input-price-sale');
  
  const selectCodeType = document.getElementById('select-code-type');
  const inputCodeValue = document.getElementById('input-code-value');
  
  const btnGenerate = document.getElementById('btn-generate');
  const btnReset = document.getElementById('btn-reset');
  const btnDownloadSingle = document.getElementById('btn-download-single');
  const btnDownloadSheet = document.getElementById('btn-download-sheet');
  
  const canvas = document.getElementById('tag-canvas');
  const ctx = canvas.getContext('2d');
  
  const qrContainer = document.getElementById('qr-container');
  const barcodeCanvas = document.getElementById('barcode-canvas');

  // --- State ---
  let currentTemplate = 'classic';
  let logoImage = null;
  let codeImage = null; // Holds the generated Barcode/QR image element

  // Tag Dimensions (High Res for printing)
  const TAG_W = 600;
  const TAG_H = 1000;

  // --- Initialize ---
  init();

  function init() {
    setupUploadBox(uploadLogoBox, fileLogo, img => {
      logoImage = img;
      uploadLogoBox.classList.add('has-image');
      uploadLogoBox.querySelector('span').textContent = 'Logo Added';
      drawTag();
    });

    templateBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        templateBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTemplate = btn.dataset.type;
        drawTag();
      });
    });

    const inputs = [colorBg, colorPrimary, inputStore, inputProduct, inputSku, inputCurrency, inputPriceRegular, inputPriceSale, selectCodeType, inputCodeValue];
    inputs.forEach(input => {
      input.addEventListener('input', drawTag);
      input.addEventListener('change', drawTag);
    });

    btnGenerate.addEventListener('click', drawTag);
    btnReset.addEventListener('click', resetAll);
    
    btnDownloadSingle.addEventListener('click', () => downloadCanvas(canvas, 'price-tag.png'));
    btnDownloadSheet.addEventListener('click', generateA4Sheet);

    drawTag();
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

  // --- Code Generation ---
  function generateCode() {
    return new Promise((resolve) => {
      const type = selectCodeType.value;
      const value = inputCodeValue.value.trim();
      
      if (type === 'none' || !value) {
        resolve(null);
        return;
      }

      if (type === 'qrcode') {
        if (!window.QRCode) { resolve(null); return; }
        qrContainer.innerHTML = '';
        new QRCode(qrContainer, {
          text: value,
          width: 200,
          height: 200,
          colorDark: colorPrimary.value, // Match accent color
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.M
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
      } 
      else if (type === 'barcode') {
        if (!window.JsBarcode) { resolve(null); return; }
        try {
          JsBarcode(barcodeCanvas, value, {
            format: "CODE128",
            lineColor: colorPrimary.value,
            width: 3,
            height: 100,
            displayValue: false,
            margin: 0,
            background: "transparent"
          });
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = barcodeCanvas.toDataURL();
        } catch (e) {
          console.error("Barcode generation failed", e);
          resolve(null);
        }
      }
    });
  }

  // --- Drawing Logic ---
  async function drawTag() {
    // Generate code first
    codeImage = await generateCode();

    canvas.width = TAG_W;
    canvas.height = TAG_H;
    
    // Clear & draw background
    ctx.fillStyle = colorBg.value;
    ctx.fillRect(0, 0, TAG_W, TAG_H);

    // Apply template styling
    switch(currentTemplate) {
      case 'classic': drawClassicTemplate(); break;
      case 'modern': drawModernTemplate(); break;
      case 'sale': drawSaleTemplate(); break;
      case 'minimal': drawMinimalTemplate(); break;
    }

    // Draw Tag Hole (Punch Hole)
    drawPunchHole();
  }

  function drawPunchHole() {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(TAG_W / 2, 70, 20, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  function getTextColor() {
    // Helper to determine if we need dark or light text based on bg
    const hex = colorBg.value.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#111827' : '#ffffff';
  }

  function drawClassicTemplate() {
    const textColor = getTextColor();
    
    // Header line
    ctx.strokeStyle = colorPrimary.value;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(50, 120);
    ctx.lineTo(TAG_W - 50, 120);
    ctx.stroke();

    // Store Name
    let currentY = 180;
    if (inputStore.value) {
      ctx.fillStyle = colorPrimary.value;
      ctx.font = 'bold 40px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(inputStore.value.toUpperCase(), TAG_W/2, currentY);
      currentY += 60;
    }

    // Logo
    if (logoImage) {
      const logoW = 150;
      const logoH = logoImage.height * (logoW / logoImage.width);
      ctx.drawImage(logoImage, (TAG_W - logoW)/2, currentY, logoW, logoH);
      currentY += logoH + 60;
    }

    // Product Name
    if (inputProduct.value) {
      ctx.fillStyle = textColor;
      ctx.font = 'bold 45px Arial, sans-serif';
      ctx.textAlign = 'center';
      wrapText(ctx, inputProduct.value, TAG_W/2, currentY, TAG_W - 80, 55);
      currentY += 120; // estimate space taken
    }

    // SKU
    if (inputSku.value) {
      ctx.fillStyle = textColor;
      ctx.globalAlpha = 0.6;
      ctx.font = '28px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ITEM: ' + inputSku.value, TAG_W/2, currentY);
      ctx.globalAlpha = 1.0;
      currentY += 80;
    }

    // Price
    const curr = inputCurrency.value;
    const reg = inputPriceRegular.value;
    const sale = inputPriceSale.value;

    if (sale && sale !== "") {
      // Draw strike-through regular price
      ctx.fillStyle = textColor;
      ctx.globalAlpha = 0.5;
      ctx.font = 'bold 40px Arial, sans-serif';
      const regText = curr + reg;
      const regW = ctx.measureText(regText).width;
      ctx.fillText(regText, TAG_W/2, currentY);
      ctx.beginPath();
      ctx.moveTo((TAG_W/2) - (regW/2) - 10, currentY - 12);
      ctx.lineTo((TAG_W/2) + (regW/2) + 10, currentY - 12);
      ctx.lineWidth = 3;
      ctx.strokeStyle = textColor;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
      
      currentY += 80;
      
      // Sale Price
      ctx.fillStyle = colorPrimary.value;
      ctx.font = '900 90px Arial, sans-serif';
      ctx.fillText(curr + sale, TAG_W/2, currentY);
    } else {
      // Regular Price only
      ctx.fillStyle = textColor;
      ctx.font = '900 90px Arial, sans-serif';
      ctx.fillText(curr + reg, TAG_W/2, currentY + 30);
    }

    // Draw Code
    if (codeImage) {
      const isQR = selectCodeType.value === 'qrcode';
      const maxW = TAG_W - 160;
      const aspect = codeImage.height / codeImage.width;
      
      let w = isQR ? 200 : maxW;
      let h = isQR ? 200 : w * aspect;
      
      const cy = TAG_H - h - 100;
      ctx.drawImage(codeImage, (TAG_W - w)/2, cy, w, h);
      
      // Print value below code
      ctx.fillStyle = textColor;
      ctx.font = '24px monospace';
      ctx.fillText(inputCodeValue.value, TAG_W/2, cy + h + 30);
    }
  }

  function drawModernTemplate() {
    const textColor = getTextColor();
    
    // Bottom Accent block
    ctx.fillStyle = colorPrimary.value;
    ctx.fillRect(0, TAG_H - 300, TAG_W, 300);

    let currentY = 160;

    // Logo
    if (logoImage) {
      const logoW = 120;
      const logoH = logoImage.height * (logoW / logoImage.width);
      ctx.drawImage(logoImage, (TAG_W - logoW)/2, currentY, logoW, logoH);
      currentY += logoH + 50;
    } else if (inputStore.value) {
      ctx.fillStyle = colorPrimary.value;
      ctx.font = 'bold 36px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(inputStore.value.toUpperCase(), TAG_W/2, currentY);
      currentY += 70;
    }

    // Product Name
    ctx.fillStyle = textColor;
    ctx.font = 'bold 50px Arial, sans-serif';
    ctx.textAlign = 'center';
    wrapText(ctx, inputProduct.value, TAG_W/2, currentY, TAG_W - 100, 60);
    currentY += 130;

    // SKU
    if (inputSku.value) {
      ctx.fillStyle = textColor;
      ctx.globalAlpha = 0.5;
      ctx.font = '30px Arial, sans-serif';
      ctx.fillText(inputSku.value, TAG_W/2, currentY);
      ctx.globalAlpha = 1.0;
      currentY += 80;
    }

    // Price
    const curr = inputCurrency.value;
    const reg = inputPriceRegular.value;
    const sale = inputPriceSale.value;

    if (sale && sale !== "") {
      ctx.fillStyle = textColor;
      ctx.globalAlpha = 0.4;
      ctx.font = '40px Arial, sans-serif';
      ctx.fillText('WAS ' + curr + reg, TAG_W/2, currentY);
      ctx.globalAlpha = 1.0;
      currentY += 70;
      
      ctx.fillStyle = colorPrimary.value;
      ctx.font = '900 100px Arial, sans-serif';
      ctx.fillText(curr + sale, TAG_W/2, currentY);
    } else {
      ctx.fillStyle = textColor;
      ctx.font = '900 100px Arial, sans-serif';
      ctx.fillText(curr + reg, TAG_W/2, currentY + 30);
    }

    // Code area (In the accent block)
    if (codeImage) {
      const isQR = selectCodeType.value === 'qrcode';
      let w = isQR ? 160 : 350;
      let h = isQR ? 160 : w * (codeImage.height / codeImage.width);
      
      const cy = TAG_H - h - 80;
      
      // Draw white background block for code
      ctx.fillStyle = '#ffffff';
      ctx.fillRect((TAG_W - w)/2 - 20, cy - 20, w + 40, h + 70);
      
      // Determine if code is black or primary color. Since code is primary color, we need to draw it.
      ctx.drawImage(codeImage, (TAG_W - w)/2, cy, w, h);
      
      ctx.fillStyle = '#000000';
      ctx.font = '22px monospace';
      ctx.fillText(inputCodeValue.value, TAG_W/2, cy + h + 30);
    }
  }

  function drawSaleTemplate() {
    const textColor = getTextColor();
    
    // Top Sale Header
    ctx.fillStyle = '#ef4444'; // Red
    ctx.fillRect(0, 0, TAG_W, 200);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 80px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SALE', TAG_W/2, 160);

    let currentY = 280;

    // Product Name
    ctx.fillStyle = textColor;
    ctx.font = 'bold 45px Arial, sans-serif';
    wrapText(ctx, inputProduct.value, TAG_W/2, currentY, TAG_W - 60, 55);
    currentY += 120;

    // Price Block
    const curr = inputCurrency.value;
    const reg = inputPriceRegular.value;
    const sale = inputPriceSale.value;

    if (sale && sale !== "") {
      ctx.fillStyle = textColor;
      ctx.globalAlpha = 0.5;
      ctx.font = 'bold 50px Arial, sans-serif';
      const regText = curr + reg;
      const regW = ctx.measureText(regText).width;
      ctx.fillText(regText, TAG_W/2, currentY);
      
      ctx.beginPath();
      ctx.moveTo((TAG_W/2) - (regW/2) - 10, currentY - 15);
      ctx.lineTo((TAG_W/2) + (regW/2) + 10, currentY - 15);
      ctx.lineWidth = 4;
      ctx.strokeStyle = textColor;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
      
      currentY += 100;
      
      ctx.fillStyle = '#ef4444';
      ctx.font = '900 120px Arial, sans-serif';
      ctx.fillText(curr + sale, TAG_W/2, currentY);
      
      // Calculate % off
      const pReg = parseFloat(reg);
      const pSale = parseFloat(sale);
      if(pReg > pSale) {
        const pct = Math.round((1 - (pSale/pReg)) * 100);
        ctx.fillStyle = colorPrimary.value;
        ctx.font = 'bold 36px Arial, sans-serif';
        ctx.fillText(`SAVE ${pct}%`, TAG_W/2, currentY + 60);
      }
      
    } else {
      ctx.fillStyle = textColor;
      ctx.font = '900 120px Arial, sans-serif';
      ctx.fillText(curr + reg, TAG_W/2, currentY + 40);
    }

    // Code
    if (codeImage) {
      const isQR = selectCodeType.value === 'qrcode';
      let w = isQR ? 180 : 380;
      let h = isQR ? 180 : w * (codeImage.height / codeImage.width);
      const cy = TAG_H - h - 100;
      ctx.drawImage(codeImage, (TAG_W - w)/2, cy, w, h);
      
      ctx.fillStyle = textColor;
      ctx.font = '24px monospace';
      ctx.fillText(inputCodeValue.value, TAG_W/2, cy + h + 30);
    }
  }

  function drawMinimalTemplate() {
    const textColor = getTextColor();
    
    // Border
    ctx.strokeStyle = colorPrimary.value;
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, TAG_W - 40, TAG_H - 40);

    let currentY = 200;

    ctx.fillStyle = textColor;
    ctx.font = '300 40px Arial, sans-serif';
    ctx.textAlign = 'center';
    
    if (inputStore.value) {
      ctx.fillText(inputStore.value, TAG_W/2, currentY);
      currentY += 80;
    }

    ctx.font = 'bold 50px Arial, sans-serif';
    wrapText(ctx, inputProduct.value, TAG_W/2, currentY, TAG_W - 100, 60);
    currentY += 120;

    const curr = inputCurrency.value;
    const sale = inputPriceSale.value;
    const reg = inputPriceRegular.value;
    const price = (sale && sale !== "") ? sale : reg;

    ctx.fillStyle = colorPrimary.value;
    ctx.font = '300 100px Arial, sans-serif';
    ctx.fillText(curr + price, TAG_W/2, currentY + 50);

    // Code
    if (codeImage) {
      const isQR = selectCodeType.value === 'qrcode';
      let w = isQR ? 160 : 300;
      let h = isQR ? 160 : w * (codeImage.height / codeImage.width);
      const cy = TAG_H - h - 120;
      ctx.drawImage(codeImage, (TAG_W - w)/2, cy, w, h);
    }
  }

  function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for(let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      }
      else {
        line = testLine;
      }
    }
    context.fillText(line, x, currentY);
  }

  // --- Actions ---
  function resetAll() {
    inputStore.value = 'MY STORE';
    inputProduct.value = 'Premium Cotton T-Shirt';
    inputSku.value = 'SKU-89234';
    inputCurrency.value = '$';
    inputPriceRegular.value = '49.99';
    inputPriceSale.value = '29.99';
    selectCodeType.value = 'barcode';
    inputCodeValue.value = '123456789012';
    
    colorBg.value = '#ffffff';
    colorPrimary.value = '#111827';
    
    logoImage = null;
    uploadLogoBox.classList.remove('has-image');
    uploadLogoBox.querySelector('span').textContent = 'Click or Drop Logo Image';
    
    currentTemplate = 'classic';
    templateBtns.forEach(b => b.classList.remove('active'));
    templateBtns[0].classList.add('active');

    drawTag();
  }

  function downloadCanvas(cvs, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = cvs.toDataURL('image/png', 1.0);
    link.click();
  }

  function generateA4Sheet() {
    // A4 at 300 DPI roughly 2480 x 3508 pixels
    const sheetCanvas = document.createElement('canvas');
    sheetCanvas.width = 2480;
    sheetCanvas.height = 3508;
    const sCtx = sheetCanvas.getContext('2d');
    
    // Fill white background
    sCtx.fillStyle = '#ffffff';
    sCtx.fillRect(0, 0, sheetCanvas.width, sheetCanvas.height);

    // Grid layout calculations
    // We have tags 600x1000. Let's fit 3 columns, 3 rows = 9 tags per sheet
    const cols = 3;
    const rows = 3;
    const marginX = (2480 - (cols * TAG_W)) / (cols + 1);
    const marginY = (3508 - (rows * TAG_H)) / (rows + 1);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = marginX + c * (TAG_W + marginX);
        const y = marginY + r * (TAG_H + marginY);
        
        // Draw tag
        sCtx.drawImage(canvas, x, y);
        
        // Draw cut lines (dashed)
        sCtx.strokeStyle = '#cccccc';
        sCtx.lineWidth = 2;
        sCtx.setLineDash([10, 10]);
        sCtx.strokeRect(x, y, TAG_W, TAG_H);
        sCtx.setLineDash([]);
      }
    }

    downloadCanvas(sheetCanvas, 'price-tags-a4-sheet.png');
  }

});
