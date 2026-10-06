// E-Commerce Invoice Generator - Interactive Billing Engine

const STORAGE_KEY = 'ecommerce_invoice_data';

const DEFAULT_INVOICE = {
  storeName: 'Lumina Luxury Goods',
  storeInfo: '742 Evergreen Avenue, Suite 400\nSan Francisco, CA 94107\nsupport@luminaluxury.com | +1 (555) 234-5678',
  customerName: 'Eleanor Vance',
  customerEmail: 'eleanor.vance@example.com',
  customerAddress: '1024 Kensington Road, Apt 5B\nBrooklyn, NY 11218\nUnited States',
  invoiceNumber: 'INV-2026-8942',
  invoiceDate: '',
  dueDate: '',
  paymentMethod: 'Credit Card (Visa/Mastercard)',
  paymentStatus: 'PAID',
  currency: 'USD',
  lineItems: [
    { id: 'item-1', description: 'AeroSound Pro Wireless ANC Headphones', quantity: 1, unitPrice: 289.00 },
    { id: 'item-2', description: 'Custom Braided Oxygen-Free Audio Cable 2M', quantity: 2, unitPrice: 24.50 },
    { id: 'item-3', description: 'Impact-Resistant Hard Protective Travel Case', quantity: 1, unitPrice: 38.00 }
  ],
  discountCode: 'SPRING10',
  discountType: 'percent', // 'percent' | 'fixed'
  discountVal: 10,
  taxRate: 8.5,
  shippingFee: 15.00,
  notes: 'Thank you for your order! All products are covered by a 1-year comprehensive replacement warranty. For service questions, contact support@luminaluxury.com.'
};

let invoiceData = null;

function loadInvoiceData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      invoiceData = JSON.parse(raw);
    } else {
      invoiceData = JSON.parse(JSON.stringify(DEFAULT_INVOICE));
    }
  } catch (err) {
    console.error('Failed to load invoice data:', err);
    invoiceData = JSON.parse(JSON.stringify(DEFAULT_INVOICE));
  }

  // Ensure dates are set if empty
  const today = new Date();
  if (!invoiceData.invoiceDate) {
    invoiceData.invoiceDate = today.toISOString().split('T')[0];
  }
  if (!invoiceData.dueDate) {
    const due = new Date(today);
    due.setDate(due.getDate() + 14);
    invoiceData.dueDate = due.toISOString().split('T')[0];
  }
}

function saveInvoiceData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoiceData));
  } catch (err) {
    console.error('Failed to save invoice data:', err);
  }
}

function formatCurrency(amount, currencyCode = invoiceData.currency || 'USD') {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: currencyCode === 'JPY' ? 0 : 2
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function calculateTotals() {
  let subtotal = 0;
  (invoiceData.lineItems || []).forEach(item => {
    subtotal += (item.quantity || 0) * (item.unitPrice || 0);
  });

  let discountAmount = 0;
  const discVal = Number(invoiceData.discountVal) || 0;
  if (invoiceData.discountType === 'percent') {
    discountAmount = (subtotal * discVal) / 100;
  } else {
    discountAmount = Math.min(subtotal, discVal);
  }

  const taxableBase = Math.max(0, subtotal - discountAmount);
  const taxRate = Number(invoiceData.taxRate) || 0;
  const taxAmount = (taxableBase * taxRate) / 100;
  const shipping = Number(invoiceData.shippingFee) || 0;
  const grandTotal = taxableBase + taxAmount + shipping;

  return {
    subtotal,
    discountAmount,
    taxAmount,
    shipping,
    grandTotal
  };
}

function syncInputsFromData() {
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val != null ? val : '';
  };

  setVal('store-name', invoiceData.storeName);
  setVal('store-info', invoiceData.storeInfo);
  setVal('cust-name', invoiceData.customerName);
  setVal('cust-email', invoiceData.customerEmail);
  setVal('cust-address', invoiceData.customerAddress);
  setVal('inv-number', invoiceData.invoiceNumber);
  setVal('inv-currency', invoiceData.currency);
  setVal('inv-date', invoiceData.invoiceDate);
  setVal('inv-due-date', invoiceData.dueDate);
  setVal('inv-payment-method', invoiceData.paymentMethod);
  setVal('inv-status', invoiceData.paymentStatus);
  setVal('inv-discount-code', invoiceData.discountCode);
  setVal('inv-discount-type', invoiceData.discountType);
  setVal('inv-discount-val', invoiceData.discountVal);
  setVal('inv-tax-rate', invoiceData.taxRate);
  setVal('inv-shipping-fee', invoiceData.shippingFee);
  setVal('inv-notes-input', invoiceData.notes);

  renderLineItemInputs();
  updateLivePreview();
}

function renderLineItemInputs() {
  const container = document.getElementById('line-items-inputs-container');
  if (!container) return;

  container.innerHTML = '';

  (invoiceData.lineItems || []).forEach((item, index) => {
    const row = document.createElement('div');
    row.style.display = 'grid';
    row.style.gridTemplateColumns = '1fr 65px 85px 32px';
    row.style.gap = '0.4rem';
    row.style.alignItems = 'center';
    row.dataset.id = item.id;

    row.innerHTML = `
      <input type="text" class="form-input item-desc-input" placeholder="Item name / SKU" value="${escapeHtml(item.description)}" style="padding: 0.45rem 0.65rem; font-size: 0.85rem;">
      <input type="number" class="form-input item-qty-input" placeholder="Qty" min="1" step="1" value="${item.quantity}" style="padding: 0.45rem 0.4rem; font-size: 0.85rem; text-align: center;">
      <input type="number" class="form-input item-price-input" placeholder="Price" min="0" step="0.01" value="${item.unitPrice}" style="padding: 0.45rem 0.4rem; font-size: 0.85rem; text-align: right;">
      <button type="button" class="btn btn-secondary btn-del-item" title="Remove Item" style="padding: 0.35rem; min-width: 30px; height: 32px; border-color: transparent; color: var(--error);">
        &times;
      </button>
    `;
    container.appendChild(row);
  });
}

function updateLivePreview() {
  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setText('view-store-name', invoiceData.storeName || 'Store Name');
  setText('view-store-info', invoiceData.storeInfo || '');
  setText('view-inv-number', invoiceData.invoiceNumber || 'INV-001');
  setText('view-inv-date', formatDate(invoiceData.invoiceDate));
  setText('view-inv-due-date', formatDate(invoiceData.dueDate));
  setText('view-cust-name', invoiceData.customerName || 'Customer Name');

  // Customer contact & address block
  const custLines = [];
  if (invoiceData.customerEmail) custLines.push(invoiceData.customerEmail);
  if (invoiceData.customerAddress) custLines.push(invoiceData.customerAddress);
  setText('view-cust-info', custLines.join('\n'));

  setText('view-payment-method', invoiceData.paymentMethod || 'Credit Card');
  setText('view-currency-code', `${invoiceData.currency} (${formatCurrency(0).slice(0, 1)})`);
  setText('view-notes', invoiceData.notes || '');

  // Payment Status Stamp
  const stampEl = document.getElementById('view-status-stamp');
  if (stampEl) {
    const status = (invoiceData.paymentStatus || 'PAID').toUpperCase();
    stampEl.textContent = status;
    stampEl.className = 'status-stamp';
    if (status === 'PAID') {
      stampEl.classList.add('stamp-paid');
    } else if (status === 'OVERDUE') {
      stampEl.classList.add('stamp-overdue');
    } else {
      stampEl.classList.add('stamp-pending');
    }
  }

  // Line items preview table
  const tbody = document.getElementById('view-line-items-tbody');
  if (tbody) {
    tbody.innerHTML = '';
    (invoiceData.lineItems || []).forEach(item => {
      const tr = document.createElement('tr');
      const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
      tr.innerHTML = `
        <td><strong style="color: #111827;">${escapeHtml(item.description)}</strong></td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right;">${formatCurrency(item.unitPrice)}</td>
        <td style="text-align: right;">${formatCurrency(itemTotal)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Summary calculations
  const totals = calculateTotals();
  setText('view-subtotal', formatCurrency(totals.subtotal));

  // Discount
  const discRow = document.getElementById('view-discount-row');
  const discLabel = document.getElementById('view-discount-label');
  const discAmt = document.getElementById('view-discount-amt');
  if (totals.discountAmount > 0) {
    if (discRow) discRow.style.display = 'flex';
    const codeStr = invoiceData.discountCode ? ` (${invoiceData.discountCode})` : '';
    if (discLabel) discLabel.textContent = `Discount${codeStr}`;
    if (discAmt) discAmt.textContent = `-${formatCurrency(totals.discountAmount)}`;
  } else {
    if (discRow) discRow.style.display = 'none';
  }

  // Tax
  const taxLabel = document.getElementById('view-tax-label');
  if (taxLabel) taxLabel.textContent = `Sales Tax (${invoiceData.taxRate}%)`;
  setText('view-tax-amt', formatCurrency(totals.taxAmount));

  // Shipping
  setText('view-shipping-amt', formatCurrency(totals.shipping));

  // Grand Total
  setText('view-grand-total', formatCurrency(totals.grandTotal));
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function handleInputChange(e) {
  const id = e.target.id;
  const val = e.target.value;

  switch (id) {
    case 'store-name': invoiceData.storeName = val; break;
    case 'store-info': invoiceData.storeInfo = val; break;
    case 'cust-name': invoiceData.customerName = val; break;
    case 'cust-email': invoiceData.customerEmail = val; break;
    case 'cust-address': invoiceData.customerAddress = val; break;
    case 'inv-number': invoiceData.invoiceNumber = val; break;
    case 'inv-currency': invoiceData.currency = val; break;
    case 'inv-date': invoiceData.invoiceDate = val; break;
    case 'inv-due-date': invoiceData.dueDate = val; break;
    case 'inv-payment-method': invoiceData.paymentMethod = val; break;
    case 'inv-status': invoiceData.paymentStatus = val; break;
    case 'inv-discount-code': invoiceData.discountCode = val; break;
    case 'inv-discount-type': invoiceData.discountType = val; break;
    case 'inv-discount-val': invoiceData.discountVal = parseFloat(val) || 0; break;
    case 'inv-tax-rate': invoiceData.taxRate = parseFloat(val) || 0; break;
    case 'inv-shipping-fee': invoiceData.shippingFee = parseFloat(val) || 0; break;
    case 'inv-notes-input': invoiceData.notes = val; break;
  }

  saveInvoiceData();
  updateLivePreview();
}

function setupListeners() {
  // Input listeners
  const inputs = [
    'store-name', 'store-info', 'cust-name', 'cust-email', 'cust-address',
    'inv-number', 'inv-currency', 'inv-date', 'inv-due-date', 'inv-payment-method',
    'inv-status', 'inv-discount-code', 'inv-discount-type', 'inv-discount-val',
    'inv-tax-rate', 'inv-shipping-fee', 'inv-notes-input'
  ];

  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', handleInputChange);
      el.addEventListener('change', handleInputChange);
    }
  });

  // Line item container delegated events
  const container = document.getElementById('line-items-inputs-container');
  if (container) {
    container.addEventListener('input', (e) => {
      const row = e.target.closest('[data-id]');
      if (!row) return;
      const itemId = row.dataset.id;
      const item = invoiceData.lineItems.find(i => i.id === itemId);
      if (!item) return;

      if (e.target.classList.contains('item-desc-input')) {
        item.description = e.target.value;
      } else if (e.target.classList.contains('item-qty-input')) {
        item.quantity = Math.max(1, parseInt(e.target.value, 10) || 1);
      } else if (e.target.classList.contains('item-price-input')) {
        item.unitPrice = Math.max(0, parseFloat(e.target.value) || 0);
      }

      saveInvoiceData();
      updateLivePreview();
    });

    container.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-del-item')) {
        const row = e.target.closest('[data-id]');
        if (!row) return;
        const itemId = row.dataset.id;
        invoiceData.lineItems = invoiceData.lineItems.filter(i => i.id !== itemId);
        saveInvoiceData();
        renderLineItemInputs();
        updateLivePreview();
      }
    });
  }

  // Add line item button
  document.getElementById('btn-add-line-item')?.addEventListener('click', () => {
    const newItem = {
      id: 'item-' + Date.now(),
      description: 'New Product / Service Line',
      quantity: 1,
      unitPrice: 50.00
    };
    invoiceData.lineItems.push(newItem);
    saveInvoiceData();
    renderLineItemInputs();
    updateLivePreview();
  });

  // Action buttons
  document.getElementById('btn-print-invoice')?.addEventListener('click', () => {
    window.print();
  });

  document.getElementById('btn-load-sample')?.addEventListener('click', () => {
    if (confirm('Load sample invoice? Current unsaved edits will be replaced.')) {
      invoiceData = JSON.parse(JSON.stringify(DEFAULT_INVOICE));
      const today = new Date();
      invoiceData.invoiceDate = today.toISOString().split('T')[0];
      const due = new Date(today);
      due.setDate(due.getDate() + 14);
      invoiceData.dueDate = due.toISOString().split('T')[0];
      saveInvoiceData();
      syncInputsFromData();
    }
  });

  document.getElementById('btn-export-json')?.addEventListener('click', () => {
    const totals = calculateTotals();
    const exportObj = {
      ...invoiceData,
      calculatedTotals: totals,
      exportedAt: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(exportObj, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${invoiceData.invoiceNumber || 'receipt'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  document.getElementById('btn-reset-invoice')?.addEventListener('click', () => {
    if (confirm('Create a clean, blank invoice template?')) {
      invoiceData = {
        storeName: 'Your Store Name',
        storeInfo: 'Store Address & Contact',
        customerName: 'Client / Buyer Name',
        customerEmail: 'buyer@example.com',
        customerAddress: 'Billing / Shipping Address',
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14*86400000).toISOString().split('T')[0],
        paymentMethod: 'Credit Card',
        paymentStatus: 'PENDING',
        currency: 'USD',
        lineItems: [
          { id: 'item-' + Date.now(), description: 'Item 1', quantity: 1, unitPrice: 100.00 }
        ],
        discountCode: '',
        discountType: 'percent',
        discountVal: 0,
        taxRate: 0,
        shippingFee: 0,
        notes: 'Payment terms: Due within 14 days.'
      };
      saveInvoiceData();
      syncInputsFromData();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadInvoiceData();
  syncInputsFromData();
  setupListeners();
});