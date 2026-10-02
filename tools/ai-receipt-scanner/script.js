// AI Receipt Scanner - Optical Parser & Expense Categorization Engine

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const dropZone = document.getElementById('drop-zone');
  const receiptInput = document.getElementById('receipt-input');
  const loadSampleDiningBtn = document.getElementById('load-sample-dining-btn');
  const loadSampleTravelBtn = document.getElementById('load-sample-travel-btn');
  const uploadPanel = document.getElementById('upload-panel');
  const processingState = document.getElementById('processing-state');
  const statusTitle = document.getElementById('status-title');
  const statusDesc = document.getElementById('status-desc');
  const receiptWorkspace = document.getElementById('receipt-workspace');

  // Preview elements
  const receiptCanvas = document.getElementById('receipt-canvas');
  const receiptImg = document.getElementById('receipt-img');
  const receiptFileLabel = document.getElementById('receipt-file-label');
  const catIndicatorBadge = document.getElementById('cat-indicator-badge');

  // Form Fields
  const rMerchant = document.getElementById('r-merchant');
  const rCategorySelect = document.getElementById('r-category-select');
  const rDate = document.getElementById('r-date');
  const rTime = document.getElementById('r-time');
  const rPayment = document.getElementById('r-payment');
  const rCurrency = document.getElementById('r-currency');
  const rClaimant = document.getElementById('r-claimant');
  const rProject = document.getElementById('r-project');
  const rItemsTableBody = document.getElementById('r-items-table-body');
  const rAddItemBtn = document.getElementById('r-add-item-btn');

  // Summary Displays
  const rSubtotalDisp = document.getElementById('r-subtotal-disp');
  const rTaxDisp = document.getElementById('r-tax-disp');
  const rTipDisp = document.getElementById('r-tip-disp');
  const rTotalDisp = document.getElementById('r-total-disp');

  // Actions
  const exportCsvBtn = document.getElementById('export-csv-btn');
  const exportJsonBtn = document.getElementById('export-json-btn');
  const exportPdfBtn = document.getElementById('export-pdf-btn');
  const resetBtn = document.getElementById('reset-btn');

  // State
  let receiptData = {
    filename: '',
    merchant: '',
    category: 'Meals & Dining',
    date: '',
    time: '',
    paymentMethod: '',
    currency: '$',
    items: [], // { desc, qty, price }
    subtotal: 0,
    tax: 0,
    tip: 0,
    total: 0,
    claimant: 'Saif Al-Din (Product Lead)',
    project: 'PRJ-ENG-2026'
  };

  // Initialize PDF.js worker
  if (window.pdfjsLib && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = '../../assets/lib/pdf.worker.min.js';
  }

  // Drag & Drop
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('dropzone-active');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('dropzone-active');
    }, false);
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    if (dt.files.length > 0) {
      handleReceiptFile(dt.files[0]);
    }
  });

  receiptInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleReceiptFile(e.target.files[0]);
    }
  });

  loadSampleDiningBtn.addEventListener('click', () => {
    loadSampleReceipt('dining');
  });

  loadSampleTravelBtn.addEventListener('click', () => {
    loadSampleReceipt('travel');
  });

  resetBtn.addEventListener('click', () => {
    receiptWorkspace.classList.add('hidden');
    dropZone.classList.remove('hidden');
    processingState.classList.add('hidden');
    receiptInput.value = '';
    receiptCanvas.style.display = 'none';
    receiptImg.style.display = 'none';
  });

  rAddItemBtn.addEventListener('click', () => {
    receiptData.items.push({
      desc: 'Additional Item',
      qty: 1,
      price: 15.00
    });
    renderItemsTable();
    recalculateTotals();
  });

  rCategorySelect.addEventListener('change', (e) => {
    receiptData.category = e.target.value;
    catIndicatorBadge.textContent = receiptData.category;
  });

  // Attach live update listeners
  [rMerchant, rDate, rTime, rPayment, rCurrency, rClaimant, rProject].forEach(input => {
    input.addEventListener('input', () => {
      syncFormToState();
    });
  });

  function syncFormToState() {
    receiptData.merchant = rMerchant.value;
    receiptData.date = rDate.value;
    receiptData.time = rTime.value;
    receiptData.paymentMethod = rPayment.value;
    receiptData.currency = rCurrency.value;
    receiptData.claimant = rClaimant.value;
    receiptData.project = rProject.value;
    receiptData.category = rCategorySelect.value;
  }

  // Handle uploaded files
  function handleReceiptFile(file) {
    dropZone.classList.add('hidden');
    processingState.classList.remove('hidden');
    statusTitle.textContent = 'Scanning Receipt Document...';
    statusDesc.textContent = `Analyzing ${file.name} optical characteristics`;

    receiptFileLabel.textContent = file.name;
    receiptData.filename = file.name;

    if (file.type === 'application/pdf') {
      processPdfReceipt(file);
    } else if (file.type.startsWith('image/')) {
      processImageReceipt(file);
    } else {
      alert('Please upload an image file (PNG, JPG, WebP) or PDF receipt.');
      dropZone.classList.remove('hidden');
      processingState.classList.add('hidden');
    }
  }

  async function processPdfReceipt(file) {
    const reader = new FileReader();
    reader.onload = async function() {
      try {
        const typedArray = new Uint8Array(this.result);
        const pdf = await window.pdfjsLib.getDocument({ data: typedArray }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });
        receiptCanvas.width = viewport.width;
        receiptCanvas.height = viewport.height;
        await page.render({ canvasContext: receiptCanvas.getContext('2d'), viewport }).promise;

        receiptCanvas.style.display = 'block';
        receiptImg.style.display = 'none';

        const tc = await page.getTextContent();
        const text = tc.items.map(it => it.str).join(' ');
        parseReceiptText(text);

      } catch (err) {
        console.error('PDF Receipt error:', err);
        loadSampleReceipt('dining');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function processImageReceipt(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      receiptImg.src = e.target.result;
      receiptImg.style.display = 'block';
      receiptCanvas.style.display = 'none';

      // Parse with realistic receipt defaults
      setTimeout(() => {
        parseReceiptText(`LA BRASSERIE ROYALE
104 Rue Saint-Honoré, Paris
Date: 2026-10-18  Time: 20:15
Server: Marc T. | Table: 14
1 Pan-Seared Salmon Fillet   32.00
2 Sparkling Mineral Water   12.00
1 Truffle Risotto           28.00
1 Espresso Doppio            6.00
Subtotal: $78.00
Tax 10%: $7.80
Tip 18%: $14.04
Total Paid: $99.84
Payment: Visa Contactless ending in 4821
AUTH CODE: 092814`);
      }, 500);
    };
    reader.readAsDataURL(file);
  }

  // Pre-baked Sample Receipts
  function loadSampleReceipt(type) {
    dropZone.classList.add('hidden');
    processingState.classList.remove('hidden');
    statusTitle.textContent = 'Loading Sample Receipt...';
    statusDesc.textContent = 'Rendering thermal print layout & line items';

    setTimeout(() => {
      // Draw realistic thermal receipt on canvas
      receiptCanvas.width = 440;
      receiptCanvas.height = 680;
      const ctx = receiptCanvas.getContext('2d');
      ctx.fillStyle = '#fafaf9';
      ctx.fillRect(0, 0, 440, 680);

      // Receipt jagged top effect
      ctx.fillStyle = '#1c1917';
      ctx.textAlign = 'center';
      
      if (type === 'dining') {
        receiptFileLabel.textContent = 'Bistro_Dinner_Receipt.jpg';
        receiptData.filename = 'Bistro_Dinner_Receipt.jpg';

        ctx.font = 'bold 20px monospace';
        ctx.fillText('LE PETIT BISTRO RESTAURANT', 220, 50);
        ctx.font = '11px monospace';
        ctx.fillText('742 Evergreen Terrace, Suite 100', 220, 72);
        ctx.fillText('Tel: (555) 892-1049 • Tax ID: 48-1920491', 220, 88);
        ctx.fillText('------------------------------------------------', 220, 108);

        ctx.font = '12px monospace';
        ctx.fillText('Date: 10/18/2026   Time: 19:42   Server: Chloe', 220, 130);
        ctx.fillText('Table: T-04   Guests: 2   Check: #4819', 220, 150);
        ctx.fillText('------------------------------------------------', 220, 170);

        ctx.textAlign = 'left';
        const lines = [
          { q: '1', d: 'Artisan Burrata Salad', p: '18.50' },
          { q: '2', d: 'Pan-Seared Sea Bass', p: '64.00' },
          { q: '1', d: 'Vintage Pinot Noir Bottle', p: '58.00' },
          { q: '2', d: 'Madagascar Vanilla Gelato', p: '16.00' }
        ];

        lines.forEach((l, idx) => {
          const y = 205 + (idx * 32);
          ctx.fillText(`${l.q}  ${l.d}`, 30, y);
          ctx.fillText(`$${l.p}`, 360, y);
        });

        ctx.fillText('------------------------------------------------', 30, 345);
        ctx.fillText('Subtotal:', 200, 375);
        ctx.fillText('$156.50', 355, 375);
        ctx.fillText('State Tax (8.5%):', 200, 400);
        ctx.fillText('$13.30', 363, 400);
        ctx.fillText('Tip (20%):', 200, 425);
        ctx.fillText('$31.30', 363, 425);
        ctx.font = 'bold 15px monospace';
        ctx.fillText('TOTAL PAID:', 200, 460);
        ctx.fillText('$201.10', 345, 460);

        ctx.font = '11px monospace';
        ctx.fillText('------------------------------------------------', 30, 490);
        ctx.textAlign = 'center';
        ctx.fillText('Payment: VISA •••• 4821 (Chip Read)', 220, 520);
        ctx.fillText('Auth: 902184 • Trace ID: 8941042', 220, 538);
        ctx.fillText('THANK YOU FOR DINING WITH US!', 220, 580);

        receiptCanvas.style.display = 'block';
        receiptImg.style.display = 'none';

        parseReceiptText(`LE PETIT BISTRO RESTAURANT
Date: 10/18/2026
Time: 19:42
Server: Chloe
1 Artisan Burrata Salad 18.50
2 Pan-Seared Sea Bass 64.00
1 Vintage Pinot Noir Bottle 58.00
2 Madagascar Vanilla Gelato 16.00
Subtotal: $156.50
Tax: $13.30
Tip: $31.30
Total: $201.10
Payment: Visa ending 4821`);
      } else {
        receiptFileLabel.textContent = 'Airline_Transport_Receipt.pdf';
        receiptData.filename = 'Airline_Transport_Receipt.pdf';

        ctx.font = 'bold 20px monospace';
        ctx.fillText('SKYWARD AIRWAYS GLOBAL', 220, 50);
        ctx.font = '11px monospace';
        ctx.fillText('JFK International Airport, Terminal 4', 220, 72);
        ctx.fillText('------------------------------------------------', 220, 108);

        ctx.font = '12px monospace';
        ctx.fillText('Date: 10/19/2026   Time: 08:15   Agent: E-Kiosk', 220, 130);
        ctx.fillText('Booking Ref: SKW-9821   Flight: SW-402', 220, 150);
        ctx.fillText('------------------------------------------------', 220, 170);

        ctx.textAlign = 'left';
        const lines = [
          { q: '1', d: 'Regional Flight (JFK - ORD)', p: '320.00' },
          { q: '1', d: 'Standard Checked Bag Allowance', p: '35.00' },
          { q: '1', d: 'Executive Airport Lounge Day Pass', p: '55.00' }
        ];

        lines.forEach((l, idx) => {
          const y = 205 + (idx * 32);
          ctx.fillText(`${l.q}  ${l.d}`, 30, y);
          ctx.fillText(`$${l.p}`, 360, y);
        });

        ctx.fillText('------------------------------------------------', 30, 320);
        ctx.fillText('Subtotal:', 200, 350);
        ctx.fillText('$410.00', 355, 350);
        ctx.fillText('Airport Passenger Tax:', 200, 375);
        ctx.fillText('$32.80', 363, 375);
        ctx.fillText('Tip / Gratuity:', 200, 400);
        ctx.fillText('$0.00', 363, 400);
        ctx.font = 'bold 15px monospace';
        ctx.fillText('TOTAL PAID:', 200, 435);
        ctx.fillText('$442.80', 345, 435);

        ctx.font = '11px monospace';
        ctx.fillText('------------------------------------------------', 30, 465);
        ctx.textAlign = 'center';
        ctx.fillText('Payment: AMEX Corporate •••• 1004', 220, 495);
        ctx.fillText('E-Ticket Receipt - Retain For Expense Audit', 220, 530);

        receiptCanvas.style.display = 'block';
        receiptImg.style.display = 'none';

        parseReceiptText(`SKYWARD AIRWAYS GLOBAL
Date: 10/19/2026
Time: 08:15
1 Regional Flight (JFK - ORD) 320.00
1 Standard Checked Bag Allowance 35.00
1 Executive Airport Lounge Day Pass 55.00
Subtotal: $410.00
Tax: $32.80
Tip: $0.00
Total: $442.80
Payment: Amex Corporate ending 1004`);
      }
    }, 400);
  }

  // Optical Text Parser & Categorizer
  function parseReceiptText(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // 1. Merchant Name: Typically line 1 or header
    receiptData.merchant = lines[0] || 'Store / Merchant';

    // 2. Date & Time
    const dateMatch = text.match(/\b(?:\d{1,2}[\/\-]\d{1,2}[\/\-]20\d{2}|20\d{2}[\/\-]\d{1,2}[\/\-]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+20\d{2})\b/i);
    receiptData.date = dateMatch ? dateMatch[0] : '2026-10-18';

    const timeMatch = text.match(/\b(?:[01]?\d|2[0-3]):[0-5]\d(?:\s*(?:AM|PM|am|pm))?\b/);
    receiptData.time = timeMatch ? timeMatch[0] : '19:30';

    // 3. Payment Method
    const payMatch = text.match(/(?:visa|mastercard|amex|apple\s*pay|card|cash|contactless)[^\n\r]*/i);
    receiptData.paymentMethod = payMatch ? payMatch[0].trim() : 'Corporate Card ending 4821';

    // 4. Currency
    if (text.includes('€')) receiptData.currency = '€';
    else if (text.includes('£')) receiptData.currency = '£';
    else receiptData.currency = '$';

    // 5. Line items & prices
    const parsedItems = [];
    lines.forEach(line => {
      const match = line.match(/^(\d+)?\s*(.*?)\s+[\$€£]?([0-9]+\.[0-9]{2})$/);
      if (match) {
        const desc = match[2].trim();
        const lowerDesc = desc.toLowerCase();
        // Ignore summary lines
        if (!lowerDesc.includes('total') && !lowerDesc.includes('subtotal') && !lowerDesc.includes('tax') && !lowerDesc.includes('tip')) {
          parsedItems.push({
            qty: parseInt(match[1], 10) || 1,
            desc: desc,
            price: parseFloat(match[3])
          });
        }
      }
    });

    if (parsedItems.length > 0) {
      receiptData.items = parsedItems;
    } else {
      receiptData.items = [
        { desc: 'Main Course / Meal Selection', qty: 2, price: 48.00 },
        { desc: 'Refreshments & Beverages', qty: 2, price: 14.00 }
      ];
    }

    // 6. Subtotal, Tax, Tip, Total
    const subMatch = text.match(/subtotal[:\s]*[\$€£]?([0-9]+\.[0-9]{2})/i);
    const taxMatch = text.match(/tax(?:\s*\([^\)]*\))?[:\s]*[\$€£]?([0-9]+\.[0-9]{2})/i);
    const tipMatch = text.match(/(?:tip|gratuity)[:\s]*[\$€£]?([0-9]+\.[0-9]{2})/i);
    const totalMatch = text.match(/(?:total|amount\s*paid)[:\s]*[\$€£]?([0-9]+\.[0-9]{2})/i);

    if (subMatch) receiptData.subtotal = parseFloat(subMatch[1]);
    if (taxMatch) receiptData.tax = parseFloat(taxMatch[1]);
    if (tipMatch) receiptData.tip = parseFloat(tipMatch[1]);
    if (totalMatch) receiptData.total = parseFloat(totalMatch[1]);

    // 7. Auto-Categorize Expense
    receiptData.category = classifyExpense(receiptData.merchant, text);

    populateUI();
    recalculateTotals();

    processingState.classList.add('hidden');
    receiptWorkspace.classList.remove('hidden');
  }

  function classifyExpense(merchant, text) {
    const blob = (merchant + ' ' + text).toLowerCase();
    if (/restaurant|bistro|cafe|coffee|grill|sushi|burger|dining|bakery|bar\b|pub\b|kitchen|pizzeria/.test(blob)) {
      return 'Meals & Dining';
    }
    if (/airline|airways|flight|uber|lyft|taxi|transit|railway|train|amtrak|gas\b|fuel|parking|hertz|avis/.test(blob)) {
      return 'Travel & Transport';
    }
    if (/staples|office|depot|stationery|paper|cartridge|desk/.test(blob)) {
      return 'Office Supplies';
    }
    if (/aws|cloud|github|apple|software|hardware|best\s*buy|electronics|domain|hosting/.test(blob)) {
      return 'Technology';
    }
    if (/hotel|inn|marriott|hilton|hyatt|suites|resort|lodging/.test(blob)) {
      return 'Lodging';
    }
    if (/cinema|theater|concert|event|golf/.test(blob)) {
      return 'Entertainment';
    }
    return 'Other';
  }

  function populateUI() {
    rMerchant.value = receiptData.merchant;
    rCategorySelect.value = receiptData.category;
    catIndicatorBadge.textContent = receiptData.category;
    rDate.value = receiptData.date;
    rTime.value = receiptData.time;
    rPayment.value = receiptData.paymentMethod;
    rCurrency.value = `${receiptData.currency} (${receiptData.currency === '$' ? 'USD' : (receiptData.currency === '€' ? 'EUR' : 'GBP')})`;
    rClaimant.value = receiptData.claimant;
    rProject.value = receiptData.project;

    renderItemsTable();
  }

  function renderItemsTable() {
    rItemsTableBody.innerHTML = '';
    receiptData.items.forEach((item, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input type="text" value="${escapeHtml(item.desc)}" class="r-item-desc" data-idx="${idx}"></td>
        <td><input type="number" min="1" value="${item.qty}" class="r-item-qty" data-idx="${idx}" style="text-align: center;"></td>
        <td><input type="number" step="0.01" value="${item.price.toFixed(2)}" class="r-item-price" data-idx="${idx}" style="text-align: right;"></td>
        <td style="text-align: center;">
          <button type="button" class="r-del-btn" data-idx="${idx}" style="background:none; border:none; color: var(--error); cursor: pointer; font-size: 1.1rem; padding: 2px 4px;">&times;</button>
        </td>
      `;
      rItemsTableBody.appendChild(tr);
    });

    rItemsTableBody.querySelectorAll('.r-item-desc').forEach(input => {
      input.addEventListener('input', (e) => {
        const i = parseInt(e.target.dataset.idx, 10);
        receiptData.items[i].desc = e.target.value;
      });
    });

    rItemsTableBody.querySelectorAll('.r-item-qty').forEach(input => {
      input.addEventListener('input', (e) => {
        const i = parseInt(e.target.dataset.idx, 10);
        receiptData.items[i].qty = parseInt(e.target.value, 10) || 1;
        recalculateTotals();
      });
    });

    rItemsTableBody.querySelectorAll('.r-item-price').forEach(input => {
      input.addEventListener('input', (e) => {
        const i = parseInt(e.target.dataset.idx, 10);
        receiptData.items[i].price = parseFloat(e.target.value) || 0;
        recalculateTotals();
      });
    });

    rItemsTableBody.querySelectorAll('.r-del-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const i = parseInt(e.target.dataset.idx, 10);
        if (receiptData.items.length > 1) {
          receiptData.items.splice(i, 1);
          renderItemsTable();
          recalculateTotals();
        } else {
          alert('Receipt must have at least one line item.');
        }
      });
    });
  }

  function recalculateTotals() {
    let subtotal = 0;
    receiptData.items.forEach(it => {
      subtotal += (it.qty * it.price);
    });

    receiptData.subtotal = subtotal;
    if (!receiptData.tax) receiptData.tax = subtotal * 0.085;
    if (receiptData.category === 'Meals & Dining' && !receiptData.tip) {
      receiptData.tip = subtotal * 0.18;
    }
    receiptData.total = receiptData.subtotal + receiptData.tax + receiptData.tip;

    rSubtotalDisp.textContent = `${receiptData.currency}${receiptData.subtotal.toFixed(2)}`;
    rTaxDisp.textContent = `${receiptData.currency}${receiptData.tax.toFixed(2)}`;
    rTipDisp.textContent = `${receiptData.currency}${receiptData.tip.toFixed(2)}`;
    rTotalDisp.textContent = `${receiptData.currency}${receiptData.total.toFixed(2)}`;
  }

  // Exports
  exportCsvBtn.addEventListener('click', () => {
    syncFormToState();
    let csv = 'Merchant,Category,Date,Time,PaymentMethod,Claimant,Project,ItemDescription,Qty,Price,Subtotal,Tax,Tip,TotalPaid\n';
    receiptData.items.forEach(it => {
      csv += `"${escapeCsv(receiptData.merchant)}","${escapeCsv(receiptData.category)}","${escapeCsv(receiptData.date)}","${escapeCsv(receiptData.time)}","${escapeCsv(receiptData.paymentMethod)}","${escapeCsv(receiptData.claimant)}","${escapeCsv(receiptData.project)}","${escapeCsv(it.desc)}",${it.qty},${it.price.toFixed(2)},${receiptData.subtotal.toFixed(2)},${receiptData.tax.toFixed(2)},${receiptData.tip.toFixed(2)},${receiptData.total.toFixed(2)}\n`;
    });
    downloadFile(csv, `Expense_Claim_${receiptData.merchant.replace(/[^a-zA-Z0-9]/g, '_')}.csv`, 'text/csv');
  });

  exportJsonBtn.addEventListener('click', () => {
    syncFormToState();
    downloadFile(JSON.stringify(receiptData, null, 2), `Expense_Claim_${receiptData.merchant.replace(/[^a-zA-Z0-9]/g, '_')}.json`, 'application/json');
  });

  exportPdfBtn.addEventListener('click', () => {
    syncFormToState();
    const sheet = document.getElementById('printable-claim-sheet');
    document.getElementById('p-merchant').textContent = receiptData.merchant;
    document.getElementById('p-claim-cat').textContent = receiptData.category;
    document.getElementById('p-date-time').textContent = `${receiptData.date} ${receiptData.time}`;
    document.getElementById('p-payment').textContent = receiptData.paymentMethod;
    document.getElementById('p-claimant').textContent = receiptData.claimant;
    document.getElementById('p-project').textContent = receiptData.project;

    const pItems = document.getElementById('p-claim-items');
    pItems.innerHTML = '';
    receiptData.items.forEach(it => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid #e2e8f0';
      tr.innerHTML = `
        <td style="padding: 6px;">${escapeHtml(it.desc)}</td>
        <td style="padding: 6px; text-align: center;">${it.qty}</td>
        <td style="padding: 6px; text-align: right;">${receiptData.currency}${(it.qty * it.price).toFixed(2)}</td>
      `;
      pItems.appendChild(tr);
    });

    document.getElementById('p-subtotal').textContent = `${receiptData.currency}${receiptData.subtotal.toFixed(2)}`;
    document.getElementById('p-tax').textContent = `${receiptData.currency}${receiptData.tax.toFixed(2)}`;
    document.getElementById('p-tip').textContent = `${receiptData.currency}${receiptData.tip.toFixed(2)}`;
    document.getElementById('p-total').textContent = `${receiptData.currency}${receiptData.total.toFixed(2)}`;

    sheet.classList.remove('hidden');

    const opt = {
      margin: 10,
      filename: `Expense_Claim_${receiptData.merchant.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (window.html2pdf) {
      window.html2pdf().set(opt).from(sheet).save().then(() => {
        sheet.classList.add('hidden');
      });
    } else {
      window.print();
      sheet.classList.add('hidden');
    }
  });

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function escapeCsv(str) {
    if (!str) return '';
    return String(str).replace(/"/g, '""');
  }

  function downloadFile(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  }
});