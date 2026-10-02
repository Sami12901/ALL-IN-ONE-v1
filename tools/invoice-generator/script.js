// Invoice Generator Interactive Client-side Engine
document.addEventListener('DOMContentLoaded', () => {
  // State
  let items = [
    { id: 1, description: 'Brand Identity & Design System', qty: 1, price: 1200.00, taxRate: 10 },
    { id: 2, description: 'Responsive Web Application Frontend', qty: 40, price: 65.00, taxRate: 10 },
    { id: 3, description: 'Cloud Infrastructure & API Setup', qty: 1, price: 450.00, taxRate: 10 }
  ];

  let nextItemId = 4;

  // Form Elements
  const els = {
    invNumber: document.getElementById('inv-number'),
    invDate: document.getElementById('inv-date'),
    invDueDate: document.getElementById('inv-due-date'),
    invCurrency: document.getElementById('inv-currency'),
    invStatus: document.getElementById('inv-status'),
    compName: document.getElementById('comp-name'),
    compEmail: document.getElementById('comp-email'),
    compAddress: document.getElementById('comp-address'),
    compLogoUrl: document.getElementById('comp-logo-url'),
    clientName: document.getElementById('client-name'),
    clientEmail: document.getElementById('client-email'),
    clientAddress: document.getElementById('client-address'),
    itemsTbody: document.getElementById('items-tbody'),
    btnAddItem: document.getElementById('btn-add-item'),
    discountPct: document.getElementById('inv-discount-pct'),
    shippingFee: document.getElementById('inv-shipping'),
    invNotes: document.getElementById('inv-notes'),
    invTerms: document.getElementById('inv-terms'),
    btnPrint: document.getElementById('btn-print'),
    btnSample: document.getElementById('btn-sample'),
    btnReset: document.getElementById('btn-reset'),

    // Preview Elements
    prevLogo: document.getElementById('prev-comp-logo'),
    prevCompName: document.getElementById('prev-comp-name'),
    prevCompContact: document.getElementById('prev-comp-contact'),
    prevCompAddress: document.getElementById('prev-comp-address'),
    prevInvNum: document.getElementById('prev-inv-num'),
    prevStatusBadge: document.getElementById('prev-status-badge'),
    prevClientName: document.getElementById('prev-client-name'),
    prevClientContact: document.getElementById('prev-client-contact'),
    prevClientAddress: document.getElementById('prev-client-address'),
    prevIssueDate: document.getElementById('prev-issue-date'),
    prevDueDate: document.getElementById('prev-due-date'),
    prevItemsBody: document.getElementById('prev-items-body'),
    prevSubtotal: document.getElementById('prev-subtotal'),
    prevDiscountRow: document.getElementById('prev-discount-row'),
    prevDiscountPct: document.getElementById('prev-discount-pct'),
    prevDiscountVal: document.getElementById('prev-discount-val'),
    prevTaxVal: document.getElementById('prev-tax-val'),
    prevShippingRow: document.getElementById('prev-shipping-row'),
    prevShippingVal: document.getElementById('prev-shipping-val'),
    prevTotalVal: document.getElementById('prev-total-val'),
    prevNotes: document.getElementById('prev-notes'),
    prevTermsContainer: document.getElementById('prev-terms-container'),
    prevTerms: document.getElementById('prev-terms')
  };

  // Helper: Format Currency
  function formatMoney(amount, currency) {
    const val = Number(amount) || 0;
    return `${currency}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // Initialize Dates
  function initDates() {
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 14);

    const toIso = (d) => d.toISOString().split('T')[0];
    if (els.invDate && !els.invDate.value) els.invDate.value = toIso(today);
    if (els.invDueDate && !els.invDueDate.value) els.invDueDate.value = toIso(dueDate);
  }

  // Render Items Editor Table
  function renderEditorTable() {
    els.itemsTbody.innerHTML = '';
    items.forEach((item, index) => {
      const tr = document.createElement('tr');
      const rowTotal = (Number(item.qty) || 0) * (Number(item.price) || 0);
      const curr = els.invCurrency.value;

      tr.innerHTML = `
        <td>
          <input type="text" class="form-input item-desc" data-index="${index}" value="${escapeHtml(item.description)}" placeholder="Description">
        </td>
        <td>
          <input type="number" class="form-input item-qty" data-index="${index}" min="0" step="any" value="${item.qty}">
        </td>
        <td>
          <input type="number" class="form-input item-price" data-index="${index}" min="0" step="0.01" value="${item.price}">
        </td>
        <td>
          <input type="number" class="form-input item-tax" data-index="${index}" min="0" max="100" step="0.5" value="${item.taxRate}">
        </td>
        <td style="text-align: right; font-weight: 600; font-size: 0.85rem; color: var(--text-primary); white-space: nowrap;">
          ${formatMoney(rowTotal, curr)}
        </td>
        <td style="text-align: center;">
          <button type="button" class="btn-icon-del" data-index="${index}" title="Remove item" ${items.length <= 1 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ''}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      `;

      els.itemsTbody.appendChild(tr);
    });

    // Attach listeners to row inputs
    els.itemsTbody.querySelectorAll('.item-desc').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = Number(e.target.dataset.index);
        items[idx].description = e.target.value;
        updatePreview();
      });
    });

    els.itemsTbody.querySelectorAll('.item-qty').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = Number(e.target.dataset.index);
        items[idx].qty = parseFloat(e.target.value) || 0;
        updateCalculationsAndPreview();
      });
    });

    els.itemsTbody.querySelectorAll('.item-price').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = Number(e.target.dataset.index);
        items[idx].price = parseFloat(e.target.value) || 0;
        updateCalculationsAndPreview();
      });
    });

    els.itemsTbody.querySelectorAll('.item-tax').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = Number(e.target.dataset.index);
        items[idx].taxRate = parseFloat(e.target.value) || 0;
        updateCalculationsAndPreview();
      });
    });

    els.itemsTbody.querySelectorAll('.btn-icon-del').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const btnEl = e.target.closest('.btn-icon-del');
        if (!btnEl || items.length <= 1) return;
        const idx = Number(btnEl.dataset.index);
        items.splice(idx, 1);
        renderEditorTable();
        updateCalculationsAndPreview();
      });
    });
  }

  // Update Calculations & Live Preview
  function updateCalculationsAndPreview() {
    const currency = els.invCurrency.value;
    let subtotal = 0;
    let totalTax = 0;

    items.forEach(item => {
      const lineTotal = (Number(item.qty) || 0) * (Number(item.price) || 0);
      const lineTax = lineTotal * ((Number(item.taxRate) || 0) / 100);
      subtotal += lineTotal;
      totalTax += lineTax;
    });

    const discountPercent = Math.max(0, Math.min(100, parseFloat(els.discountPct.value) || 0));
    const discountAmount = subtotal * (discountPercent / 100);
    const shipping = Math.max(0, parseFloat(els.shippingFee.value) || 0);

    // If discount is applied before tax, tax would scale proportionally:
    const discountFactor = subtotal > 0 ? (1 - discountAmount / subtotal) : 1;
    const effectiveTax = totalTax * discountFactor;
    const grandTotal = Math.max(0, subtotal - discountAmount + effectiveTax + shipping);

    // Update Preview Items
    els.prevItemsBody.innerHTML = '';
    items.forEach(item => {
      const lineTotal = (Number(item.qty) || 0) * (Number(item.price) || 0);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 500;">
          ${escapeHtml(item.description) || '<em style="color:#9ca3af">Untitled Item</em>'}
          ${item.taxRate > 0 ? `<span style="font-size: 0.72rem; color: #6b7280; display: block;">Tax: ${item.taxRate}%</span>` : ''}
        </td>
        <td class="col-num">${item.qty}</td>
        <td class="col-num">${formatMoney(item.price, currency)}</td>
        <td class="col-num" style="font-weight: 700; color: #111827;">${formatMoney(lineTotal, currency)}</td>
      `;
      els.prevItemsBody.appendChild(tr);
    });

    // Update Totals
    els.prevSubtotal.textContent = formatMoney(subtotal, currency);

    if (discountPercent > 0) {
      els.prevDiscountRow.style.display = 'flex';
      els.prevDiscountPct.textContent = discountPercent.toString();
      els.prevDiscountVal.textContent = `-${formatMoney(discountAmount, currency)}`;
    } else {
      els.prevDiscountRow.style.display = 'none';
    }

    els.prevTaxVal.textContent = formatMoney(effectiveTax, currency);

    if (shipping > 0) {
      els.prevShippingRow.style.display = 'flex';
      els.prevShippingVal.textContent = formatMoney(shipping, currency);
    } else {
      els.prevShippingRow.style.display = 'none';
    }

    els.prevTotalVal.textContent = formatMoney(grandTotal, currency);

    // Re-render line totals in editor table as well
    const rows = els.itemsTbody.children;
    for (let i = 0; i < rows.length; i++) {
      if (items[i]) {
        const lineVal = (Number(items[i].qty) || 0) * (Number(items[i].price) || 0);
        const cell = rows[i].children[4];
        if (cell) cell.textContent = formatMoney(lineVal, currency);
      }
    }
  }

  // Update Non-Numeric Preview Text
  function updatePreview() {
    els.prevCompName.textContent = els.compName.value || 'Your Company Name';
    els.prevCompContact.textContent = els.compEmail.value || '';
    els.prevCompAddress.textContent = els.compAddress.value || '';

    const logoUrl = els.compLogoUrl.value.trim();
    if (logoUrl) {
      els.prevLogo.src = logoUrl;
      els.prevLogo.style.display = 'block';
    } else {
      els.prevLogo.style.display = 'none';
      els.prevLogo.src = '';
    }

    els.prevInvNum.textContent = els.invNumber.value || 'INV-000';
    els.prevClientName.textContent = els.clientName.value || 'Client Name';
    els.prevClientContact.textContent = els.clientEmail.value || '';
    els.prevClientAddress.textContent = els.clientAddress.value || '';

    els.prevIssueDate.textContent = els.invDate.value || '—';
    els.prevDueDate.textContent = els.invDueDate.value || '—';

    // Status Badge
    const status = els.invStatus.value;
    els.prevStatusBadge.className = `preview-meta-pill status-${status}`;
    els.prevStatusBadge.textContent = status.toUpperCase();

    // Notes & Terms
    els.prevNotes.textContent = els.invNotes.value || 'No additional payment instructions.';
    if (els.invTerms.value.trim()) {
      els.prevTermsContainer.style.display = 'block';
      els.prevTerms.textContent = els.invTerms.value.trim();
    } else {
      els.prevTermsContainer.style.display = 'none';
    }

    updateCalculationsAndPreview();
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

  // Event Listeners for Input Changes
  const textInputs = [
    els.invNumber, els.invDate, els.invDueDate, els.invCurrency, els.invStatus,
    els.compName, els.compEmail, els.compAddress, els.compLogoUrl,
    els.clientName, els.clientEmail, els.clientAddress,
    els.discountPct, els.shippingFee, els.invNotes, els.invTerms
  ];

  textInputs.forEach(input => {
    if (input) {
      input.addEventListener('input', updatePreview);
      input.addEventListener('change', updatePreview);
    }
  });

  // Add Item Button
  els.btnAddItem.addEventListener('click', () => {
    items.push({
      id: nextItemId++,
      description: 'New Service or Product',
      qty: 1,
      price: 100.00,
      taxRate: 10
    });
    renderEditorTable();
    updateCalculationsAndPreview();
  });

  // Print Action
  els.btnPrint.addEventListener('click', () => {
    window.print();
  });

  // Sample Invoice
  els.btnSample.addEventListener('click', () => {
    els.invNumber.value = 'INV-2026-089';
    els.compName.value = 'Quantum Pixel Studios Inc.';
    els.compEmail.value = 'finance@quantumpixel.design | +1 (415) 890-1234';
    els.compAddress.value = '550 Howard Street, Suite 300\nSan Francisco, CA 94105\nTax ID: US-481920394';
    els.compLogoUrl.value = '';
    els.clientName.value = 'NextGen Logistics LLC';
    els.clientEmail.value = 'invoicing@nextgenlogistics.io';
    els.clientAddress.value = '800 Corporate Parkway, Suite 120\nAustin, TX 78701\nAttn: Procurement Dept';
    els.invStatus.value = 'pending';
    els.discountPct.value = '5';
    els.shippingFee.value = '0';
    els.invNotes.value = 'Wire Transfer Details:\nBank: Silicon Valley Bank\nIBAN: US94SVBK123456789012\nSWIFT: SVBKUS6S';
    els.invTerms.value = 'Payment due within 14 days. 1.5% late fee applies monthly after due date.';

    items = [
      { id: 1, description: 'UX Research & Competitive Audit', qty: 1, price: 1500.00, taxRate: 8.5 },
      { id: 2, description: 'Component Library & Design Tokens', qty: 1, price: 2800.00, taxRate: 8.5 },
      { id: 3, description: 'Web Application Frontend Engineering', qty: 60, price: 85.00, taxRate: 8.5 },
      { id: 4, description: 'Production Deployment & Cloud Hosting SLA', qty: 1, price: 650.00, taxRate: 0 }
    ];

    initDates();
    renderEditorTable();
    updatePreview();
  });

  // Reset Button
  els.btnReset.addEventListener('click', () => {
    if (!confirm('Are you sure you want to reset the invoice to blank defaults?')) return;
    els.invNumber.value = 'INV-001';
    els.compName.value = '';
    els.compEmail.value = '';
    els.compAddress.value = '';
    els.compLogoUrl.value = '';
    els.clientName.value = '';
    els.clientEmail.value = '';
    els.clientAddress.value = '';
    els.discountPct.value = '0';
    els.shippingFee.value = '0';
    els.invNotes.value = '';
    els.invTerms.value = '';
    els.invStatus.value = 'draft';

    items = [
      { id: 1, description: 'Service or Product Description', qty: 1, price: 0, taxRate: 0 }
    ];

    initDates();
    renderEditorTable();
    updatePreview();
  });

  // Initial Run
  initDates();
  renderEditorTable();
  updatePreview();
});