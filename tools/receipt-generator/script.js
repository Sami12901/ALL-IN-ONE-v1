// Receipt Generator Interactive Client-side Logic
document.addEventListener('DOMContentLoaded', () => {
  // Initial Sample Items
  let items = [
    { id: 1, name: 'Cold Brew Reserve (Lrg)', qty: 1, price: 5.75 },
    { id: 2, name: 'Almond Croissant', qty: 2, price: 4.50 },
    { id: 3, name: 'Vanilla Bean Latte', qty: 1, price: 6.25 }
  ];

  let nextItemId = 4;

  // Form Elements
  const els = {
    storeName: document.getElementById('rcpt-store-name'),
    tagline: document.getElementById('rcpt-tagline'),
    address: document.getElementById('rcpt-address'),
    phone: document.getElementById('rcpt-phone'),
    rcptNum: document.getElementById('rcpt-number'),
    btnGenNum: document.getElementById('btn-gen-num'),
    datetime: document.getElementById('rcpt-datetime'),
    cashier: document.getElementById('rcpt-cashier'),
    currency: document.getElementById('rcpt-currency'),
    payMethod: document.getElementById('rcpt-payment-method'),
    itemsTbody: document.getElementById('rcpt-items-tbody'),
    btnAddItem: document.getElementById('btn-rcpt-add-item'),
    taxPct: document.getElementById('rcpt-tax-pct'),
    discount: document.getElementById('rcpt-discount'),
    tendered: document.getElementById('rcpt-tendered'),
    footerInput: document.getElementById('rcpt-footer-input'),
    btnPrint: document.getElementById('btn-print-rcpt'),
    btnCopyTxt: document.getElementById('btn-copy-txt'),
    btnSample: document.getElementById('btn-sample-rcpt'),
    btnReset: document.getElementById('btn-reset-rcpt'),

    // Thermal Preview Elements
    prevStoreName: document.getElementById('prev-store-name'),
    prevTagline: document.getElementById('prev-store-tagline'),
    prevAddress: document.getElementById('prev-store-address'),
    prevPhone: document.getElementById('prev-store-phone'),
    prevRcptNum: document.getElementById('prev-rcpt-num'),
    prevRcptDate: document.getElementById('prev-rcpt-date'),
    prevCashier: document.getElementById('prev-cashier'),
    prevPayMethod: document.getElementById('prev-pay-method'),
    prevItems: document.getElementById('prev-rcpt-items'),
    prevSubtotal: document.getElementById('prev-rcpt-subtotal'),
    prevDiscRow: document.getElementById('prev-rcpt-disc-row'),
    prevDiscount: document.getElementById('prev-rcpt-discount'),
    prevTaxPct: document.getElementById('prev-rcpt-tax-pct'),
    prevTax: document.getElementById('prev-rcpt-tax'),
    prevTotal: document.getElementById('prev-rcpt-total'),
    prevTendered: document.getElementById('prev-rcpt-tendered'),
    prevChange: document.getElementById('prev-rcpt-change'),
    prevBarcodeLabel: document.getElementById('prev-barcode-label'),
    prevFooterNote: document.getElementById('prev-footer-note')
  };

  function fmtMoney(amount, curr) {
    const val = Number(amount) || 0;
    return `${curr}${val.toFixed(2)}`;
  }

  // Set current datetime to datetime-local input
  function initDateTime() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now.getTime() - offset)).toISOString().slice(0, 16);
    if (els.datetime && !els.datetime.value) {
      els.datetime.value = localISOTime;
    }
  }

  function formatDisplayDate(val) {
    if (!val) return '';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return val;
      return d.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      }) + ' ' + d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return val;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m]);
  }

  // Render Table in Editor
  function renderEditorItems() {
    els.itemsTbody.innerHTML = '';
    const curr = els.currency.value;

    items.forEach((item, index) => {
      const tr = document.createElement('tr');
      const rowTotal = (Number(item.qty) || 0) * (Number(item.price) || 0);

      tr.innerHTML = `
        <td>
          <input type="text" class="form-input item-name" data-index="${index}" value="${escapeHtml(item.name)}" placeholder="Item name">
        </td>
        <td>
          <input type="number" class="form-input item-qty" data-index="${index}" min="0" step="any" value="${item.qty}">
        </td>
        <td>
          <input type="number" class="form-input item-price" data-index="${index}" min="0" step="0.01" value="${item.price}">
        </td>
        <td style="text-align: right; font-weight: 600; font-size: 0.85rem; color: var(--text-primary); white-space: nowrap;">
          ${fmtMoney(rowTotal, curr)}
        </td>
        <td style="text-align: center;">
          <button type="button" class="btn-icon-del" data-index="${index}" title="Remove item" ${items.length <= 1 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ''}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      `;
      els.itemsTbody.appendChild(tr);
    });

    // Row input events
    els.itemsTbody.querySelectorAll('.item-name').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = Number(e.target.dataset.index);
        items[idx].name = e.target.value;
        updatePreview();
      });
    });

    els.itemsTbody.querySelectorAll('.item-qty').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = Number(e.target.dataset.index);
        items[idx].qty = parseFloat(e.target.value) || 0;
        updateCalculationsAndPreview();
      });
    });

    els.itemsTbody.querySelectorAll('.item-price').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = Number(e.target.dataset.index);
        items[idx].price = parseFloat(e.target.value) || 0;
        updateCalculationsAndPreview();
      });
    });

    els.itemsTbody.querySelectorAll('.btn-icon-del').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const btnEl = e.target.closest('.btn-icon-del');
        if (!btnEl || items.length <= 1) return;
        const idx = Number(btnEl.dataset.index);
        items.splice(idx, 1);
        renderEditorItems();
        updateCalculationsAndPreview();
      });
    });
  }

  // Calculate & Refresh Preview
  function updateCalculationsAndPreview() {
    const curr = els.currency.value;
    let subtotal = 0;

    items.forEach(item => {
      const lineTotal = (Number(item.qty) || 0) * (Number(item.price) || 0);
      subtotal += lineTotal;
    });

    const taxPct = Math.max(0, parseFloat(els.taxPct.value) || 0);
    const discount = Math.max(0, parseFloat(els.discount.value) || 0);
    const taxableSubtotal = Math.max(0, subtotal - discount);
    const taxAmount = taxableSubtotal * (taxPct / 100);
    const grandTotal = taxableSubtotal + taxAmount;

    let tendered = parseFloat(els.tendered.value);
    if (isNaN(tendered)) tendered = grandTotal;

    const changeDue = Math.max(0, tendered - grandTotal);

    // Render Preview Line Items
    els.prevItems.innerHTML = '';
    items.forEach(item => {
      const lineTotal = (Number(item.qty) || 0) * (Number(item.price) || 0);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 600;">${item.qty}x</td>
        <td>
          <div style="font-weight: 600;">${escapeHtml(item.name) || 'Item'}</div>
          ${item.qty > 1 ? `<div style="font-size: 0.72rem; color: #6b7280;">@ ${fmtMoney(item.price, curr)} each</div>` : ''}
        </td>
        <td class="col-r" style="font-weight: 700;">${fmtMoney(lineTotal, curr)}</td>
      `;
      els.prevItems.appendChild(tr);
    });

    // Totals
    els.prevSubtotal.textContent = fmtMoney(subtotal, curr);
    if (discount > 0) {
      els.prevDiscRow.style.display = 'flex';
      els.prevDiscount.textContent = `-${fmtMoney(discount, curr)}`;
    } else {
      els.prevDiscRow.style.display = 'none';
    }

    els.prevTaxPct.textContent = taxPct.toString();
    els.prevTax.textContent = fmtMoney(taxAmount, curr);
    els.prevTotal.textContent = fmtMoney(grandTotal, curr);

    els.prevTendered.textContent = fmtMoney(tendered, curr);
    els.prevChange.textContent = fmtMoney(changeDue, curr);

    // Sync editor row totals
    const rows = els.itemsTbody.children;
    for (let i = 0; i < rows.length; i++) {
      if (items[i]) {
        const lineVal = (Number(items[i].qty) || 0) * (Number(items[i].price) || 0);
        const cell = rows[i].children[3];
        if (cell) cell.textContent = fmtMoney(lineVal, curr);
      }
    }
  }

  function updatePreview() {
    els.prevStoreName.textContent = els.storeName.value || 'STORE NAME';
    els.prevTagline.textContent = els.tagline.value || '';
    els.prevAddress.textContent = els.address.value || '';
    els.prevPhone.textContent = els.phone.value || '';

    const rcptNumVal = els.rcptNum.value || 'REC-00000';
    els.prevRcptNum.textContent = rcptNumVal;
    els.prevBarcodeLabel.textContent = rcptNumVal;

    els.prevRcptDate.textContent = formatDisplayDate(els.datetime.value);
    els.prevCashier.textContent = els.cashier.value || 'Staff';
    els.prevPayMethod.textContent = els.payMethod.value;

    els.prevFooterNote.textContent = els.footerInput.value || '';

    updateCalculationsAndPreview();
  }

  // Build Plain Text / ASCII Receipt for Copy
  function generatePlainTextReceipt() {
    const curr = els.currency.value;
    const line = '----------------------------------------';
    const dblLine = '========================================';
    let txt = '';

    const center = (str, len = 40) => {
      const pad = Math.max(0, Math.floor((len - str.length) / 2));
      return ' '.repeat(pad) + str;
    };

    const row2 = (left, right, len = 40) => {
      const space = Math.max(1, len - left.length - right.length);
      return left + ' '.repeat(space) + right;
    };

    txt += center(els.storeName.value || 'STORE NAME') + '\n';
    if (els.tagline.value) txt += center(els.tagline.value) + '\n';
    if (els.address.value) txt += center(els.address.value) + '\n';
    if (els.phone.value) txt += center(els.phone.value) + '\n';
    txt += line + '\n';

    txt += row2('RC#: ' + (els.rcptNum.value || ''), formatDisplayDate(els.datetime.value)) + '\n';
    txt += row2('CLERK: ' + (els.cashier.value || ''), 'PAY: ' + els.payMethod.value) + '\n';
    txt += line + '\n';

    txt += row2('QTY  ITEM', 'AMOUNT') + '\n';
    txt += line + '\n';

    let subtotal = 0;
    items.forEach(item => {
      const lineTotal = (Number(item.qty) || 0) * (Number(item.price) || 0);
      subtotal += lineTotal;
      txt += row2(`${item.qty}x ${item.name}`, fmtMoney(lineTotal, curr)) + '\n';
    });

    const taxPct = Math.max(0, parseFloat(els.taxPct.value) || 0);
    const discount = Math.max(0, parseFloat(els.discount.value) || 0);
    const taxableSubtotal = Math.max(0, subtotal - discount);
    const taxAmount = taxableSubtotal * (taxPct / 100);
    const grandTotal = taxableSubtotal + taxAmount;
    let tendered = parseFloat(els.tendered.value);
    if (isNaN(tendered)) tendered = grandTotal;
    const changeDue = Math.max(0, tendered - grandTotal);

    txt += line + '\n';
    txt += row2('SUBTOTAL:', fmtMoney(subtotal, curr)) + '\n';
    if (discount > 0) {
      txt += row2('DISCOUNT:', `-${fmtMoney(discount, curr)}`) + '\n';
    }
    txt += row2(`SALES TAX (${taxPct}%):`, fmtMoney(taxAmount, curr)) + '\n';
    txt += dblLine + '\n';
    txt += row2('TOTAL DUE:', fmtMoney(grandTotal, curr)) + '\n';
    txt += dblLine + '\n';
    txt += row2('AMOUNT TENDERED:', fmtMoney(tendered, curr)) + '\n';
    txt += row2('CHANGE DUE:', fmtMoney(changeDue, curr)) + '\n';
    txt += line + '\n';

    if (els.footerInput.value) {
      txt += els.footerInput.value + '\n';
    }

    return txt;
  }

  // Copy Plain Text button
  els.btnCopyTxt.addEventListener('click', () => {
    const receiptText = generatePlainTextReceipt();
    navigator.clipboard.writeText(receiptText).then(() => {
      const origHtml = els.btnCopyTxt.innerHTML;
      els.btnCopyTxt.textContent = 'Copied to Clipboard!';
      els.btnCopyTxt.style.background = 'var(--success)';
      els.btnCopyTxt.style.color = '#ffffff';
      els.btnCopyTxt.style.borderColor = 'transparent';

      setTimeout(() => {
        els.btnCopyTxt.innerHTML = origHtml;
        els.btnCopyTxt.style.background = '';
        els.btnCopyTxt.style.color = '';
        els.btnCopyTxt.style.borderColor = '';
      }, 2000);
    }).catch(err => {
      console.error('Clipboard copy failed:', err);
    });
  });

  // Random receipt number generator
  els.btnGenNum.addEventListener('click', () => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    els.rcptNum.value = `REC-${randomNum}`;
    updatePreview();
  });

  // Add Item
  els.btnAddItem.addEventListener('click', () => {
    items.push({
      id: nextItemId++,
      name: 'New Item',
      qty: 1,
      price: 3.50
    });
    renderEditorItems();
    updateCalculationsAndPreview();
  });

  // Print button
  els.btnPrint.addEventListener('click', () => {
    window.print();
  });

  // Sample Load (Retail Boutique)
  els.btnSample.addEventListener('click', () => {
    els.storeName.value = 'LUMEN BOUTIQUE & APPAREL';
    els.tagline.value = 'Flagship Store #04';
    els.address.value = '182 Broadway St, New York, NY 10007';
    els.phone.value = 'Tel: (212) 555-7821 | Tax ID: NY-192847';
    els.rcptNum.value = 'REC-99412';
    els.cashier.value = 'Elena R. (Pos 02)';
    els.payMethod.value = 'Credit Card';
    els.currency.value = '$';
    els.taxPct.value = '8.875';
    els.discount.value = '10.00';
    els.tendered.value = '120.00';
    els.footerInput.value = '*** THANK YOU FOR SHOPPING AT LUMEN ***\nItems in original condition exchangeable in 30 days.\nJoin our club: loyalty.lumenboutique.example.com';

    items = [
      { id: 1, name: 'Merino Wool Knit Beanie', qty: 1, price: 34.00 },
      { id: 2, name: 'Canvas Tote Bag (Natural)', qty: 1, price: 22.00 },
      { id: 3, name: 'Organic Cotton Crew Socks', qty: 3, price: 12.00 },
      { id: 4, name: 'Scented Candle - Cedar & Sage', qty: 1, price: 28.00 }
    ];

    initDateTime();
    renderEditorItems();
    updatePreview();
  });

  // Reset Button
  els.btnReset.addEventListener('click', () => {
    if (!confirm('Reset receipt to blank form?')) return;
    els.storeName.value = '';
    els.tagline.value = '';
    els.address.value = '';
    els.phone.value = '';
    els.rcptNum.value = 'REC-10001';
    els.cashier.value = '';
    els.payMethod.value = 'Cash';
    els.taxPct.value = '0';
    els.discount.value = '0';
    els.tendered.value = '0';
    els.footerInput.value = 'Thank you for your business!';

    items = [
      { id: 1, name: 'Item Name', qty: 1, price: 0.00 }
    ];

    initDateTime();
    renderEditorItems();
    updatePreview();
  });

  // Listeners for static inputs
  const staticInputs = [
    els.storeName, els.tagline, els.address, els.phone,
    els.rcptNum, els.datetime, els.cashier, els.currency,
    els.payMethod, els.taxPct, els.discount, els.tendered,
    els.footerInput
  ];

  staticInputs.forEach(inp => {
    if (inp) {
      inp.addEventListener('input', updatePreview);
      inp.addEventListener('change', updatePreview);
    }
  });

  // Initial Run
  initDateTime();
  renderEditorItems();
  updatePreview();
});