// Product Price Tag Generator Logic
document.addEventListener('DOMContentLoaded', () => {

  // Inputs
  const inputs = {
    name: document.getElementById('inp-name'),
    brand: document.getElementById('inp-brand'),
    variant: document.getElementById('inp-variant'),
    currency: document.getElementById('inp-currency'),
    tax: document.getElementById('inp-tax'),
    mrp: document.getElementById('inp-mrp'),
    sale: document.getElementById('inp-sale'),
    sku: document.getElementById('inp-sku'),
    link: document.getElementById('inp-link'),
    color: document.getElementById('inp-color'),
    style: document.getElementById('inp-style'),
    tagsPerPage: document.getElementById('sel-tags-page')
  };

  // Outputs (DOM elements in the master tag)
  const tagEl = document.getElementById('master-tag');
  const outs = {
    name: document.getElementById('out-name'),
    brand: document.getElementById('out-brand'),
    variant: document.getElementById('out-variant'),
    tax: document.getElementById('out-tax'),
    mrp: document.getElementById('out-mrp'),
    sale: document.getElementById('out-sale'),
    badge: document.getElementById('out-badge')
  };
  const currEls = tagEl.querySelectorAll('.curr');

  // Instances
  let qrInstance = null;

  function updateTag() {
    // Texts
    outs.name.textContent = inputs.name.value || 'Product Name';
    outs.brand.textContent = inputs.brand.value || 'Brand';
    outs.variant.textContent = inputs.variant.value || '';
    outs.tax.textContent = inputs.tax.value || '';
    
    // Currency symbol
    currEls.forEach(el => el.textContent = inputs.currency.value);

    // Pricing & Discount
    const mrp = parseFloat(inputs.mrp.value) || 0;
    const sale = parseFloat(inputs.sale.value) || 0;
    outs.mrp.textContent = mrp.toFixed(2);
    outs.sale.textContent = sale.toFixed(2);

    if (mrp > sale && sale > 0) {
      const discount = Math.round(((mrp - sale) / mrp) * 100);
      outs.badge.style.display = 'block';
      outs.badge.textContent = `Save ${discount}%`;
    } else {
      outs.badge.style.display = 'none';
    }

    // Styling
    tagEl.style.setProperty('--tag-accent', inputs.color.value);
    tagEl.className = `price-tag ${inputs.style.value}`;

    // Barcode (JsBarcode)
    try {
      JsBarcode("#barcode", inputs.sku.value || '000000', {
        format: "CODE128",
        lineColor: "#1f2937",
        width: 2,
        height: 50,
        displayValue: true,
        fontSize: 14,
        margin: 0
      });
    } catch (e) {
      console.warn("Invalid Barcode data");
    }

    // QR Code (QRious)
    const qrCanvas = document.getElementById('qrcode');
    if (!qrInstance) {
      qrInstance = new QRious({
        element: qrCanvas,
        size: 200, // render large, scale down via css for crispness
        value: inputs.link.value || 'https://example.com'
      });
    } else {
      qrInstance.value = inputs.link.value || 'https://example.com';
    }
  }

  // Bind inputs
  Object.values(inputs).forEach(input => {
    input.addEventListener('input', updateTag);
    input.addEventListener('change', updateTag);
  });

  // Initial render
  updateTag();

  // --- Export PNG ---
  document.getElementById('btn-export-png').addEventListener('click', () => {
    const btn = document.getElementById('btn-export-png');
    const originalText = btn.innerText;
    btn.innerText = "Exporting...";
    
    // Use html2canvas
    html2canvas(tagEl, {
      scale: 3, // High-res
      backgroundColor: null // transparent
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = `price_tag_${inputs.sku.value || Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      btn.innerText = originalText;
    });
  });

  // --- Print A4 Sheet ---
  document.getElementById('btn-print').addEventListener('click', () => {
    const printSheet = document.getElementById('print-sheet');
    printSheet.innerHTML = ''; // clear
    
    const count = parseInt(inputs.tagsPerPage.value);
    printSheet.className = `tags-${count}`;

    // We must clone the master tag to generate a full grid.
    // However, canvas (QR code) doesn't clone its drawn content via deep cloneNode.
    // We must re-draw or extract image data. 
    
    const qrDataURL = document.getElementById('qrcode').toDataURL();

    for (let i = 0; i < count; i++) {
      const clone = tagEl.cloneNode(true);
      clone.removeAttribute('id'); // prevent duplicate IDs
      
      // Fix QR code in clone
      const qrBox = clone.querySelector('.pt-qrcode-box');
      qrBox.innerHTML = `<img src="${qrDataURL}" style="width:100%; height:100%; border-radius:4px;">`;
      
      // Ensure SVG barcode clones correctly (usually SVG clones fine)
      printSheet.appendChild(clone);
    }

    // Trigger browser print
    window.print();
  });

});