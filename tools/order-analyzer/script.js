// E-Commerce Order Basket Analyzer Implementation
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Metadata & Config
  const orderIdInput = document.getElementById('order-id-input');
  const customerNameInput = document.getElementById('customer-name-input');
  const orderCurrencySelect = document.getElementById('order-currency-select');

  const shippingFeeInput = document.getElementById('shipping-fee-input');
  const freeShippingThresh = document.getElementById('free-shipping-thresh');
  const cartCouponDiscount = document.getElementById('cart-coupon-discount');

  // DOM Elements - Buttons
  const btnAddItem = document.getElementById('btn-add-item');
  const btnLoadSample = document.getElementById('btn-load-sample');
  const btnClearCart = document.getElementById('btn-clear-cart');
  const btnExportJson = document.getElementById('btn-export-json');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnPrintInvoice = document.getElementById('btn-print-invoice');

  // DOM Elements - Table & Badges
  const cartItemsTbody = document.getElementById('cart-items-tbody');
  const cartItemCountBadge = document.getElementById('cart-item-count-badge');

  // DOM Elements - KPIs
  const kpiGrandTotal = document.getElementById('kpi-grand-total');
  const kpiAov = document.getElementById('kpi-aov');
  const kpiAovSub = document.getElementById('kpi-aov-sub');
  const kpiTotalTax = document.getElementById('kpi-total-tax');
  const kpiTotalDiscount = document.getElementById('kpi-total-discount');

  // DOM Elements - Receipt Card
  const receiptOrderId = document.getElementById('receipt-order-id');
  const receiptOrderDate = document.getElementById('receipt-order-date');
  const receiptCustomerName = document.getElementById('receipt-customer-name');
  const receiptItemsTbody = document.getElementById('receipt-items-tbody');
  const receiptSubtotal = document.getElementById('receipt-subtotal');
  const receiptDiscounts = document.getElementById('receipt-discounts');
  const receiptTax = document.getElementById('receipt-tax');
  const receiptShipping = document.getElementById('receipt-shipping');
  const receiptGrandTotal = document.getElementById('receipt-grand-total');

  // State
  let items = [];

  // Set today's date on receipt
  const today = new Date();
  receiptOrderDate.textContent = today.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Currency helper
  const getCurrencySymbol = () => orderCurrencySelect.value || '$';

  const formatPrice = (amount) => {
    const sym = getCurrencySymbol();
    return `${sym}${Number(amount).toFixed(2)}`;
  };

  // Sample Items Dataset
  const sampleItems = [
    { id: 1, name: 'Wireless ANC Headphones', sku: 'AUDIO-901', price: 149.99, qty: 1, discount: 15, tax: 8.5 },
    { id: 2, name: 'Mechanical Ergonomic Keyboard', sku: 'TECH-440', price: 89.50, qty: 1, discount: 0, tax: 8.5 },
    { id: 3, name: 'Braided USB-C Cable (2m)', sku: 'CAB-102', price: 14.00, qty: 3, discount: 10, tax: 8.5 },
    { id: 4, name: 'Velvet Protective Tech Pouch', sku: 'ACC-019', price: 19.99, qty: 2, discount: 0, tax: 8.5 }
  ];

  // Initialize
  function initCart() {
    items = JSON.parse(JSON.stringify(sampleItems));
    renderItems();
    calculateOrder();
  }

  // Render Line Items in Editor Table
  function renderItems() {
    cartItemsTbody.innerHTML = '';
    const sym = getCurrencySymbol();

    if (items.length === 0) {
      cartItemsTbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-tertiary);">Your order basket is currently empty. Click "Add Line Item" or "Load Sample".</td></tr>`;
      return;
    }

    const fragment = document.createDocumentFragment();

    items.forEach((item, index) => {
      const lineSubtotal = item.price * item.qty;
      const lineDiscount = lineSubtotal * (item.discount / 100);
      const lineTaxable = lineSubtotal - lineDiscount;
      const lineTax = lineTaxable * (item.tax / 100);
      const lineTotal = lineTaxable + lineTax;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <input type="text" class="form-input item-field" data-index="${index}" data-prop="name" value="${escapeHtml(item.name)}" placeholder="Item title">
        </td>
        <td>
          <input type="text" class="form-input item-field" data-index="${index}" data-prop="sku" value="${escapeHtml(item.sku)}" placeholder="SKU">
        </td>
        <td>
          <input type="number" class="form-input item-field" data-index="${index}" data-prop="price" min="0" step="0.5" value="${item.price.toFixed(2)}">
        </td>
        <td>
          <input type="number" class="form-input item-field" data-index="${index}" data-prop="qty" min="1" step="1" value="${item.qty}">
        </td>
        <td>
          <input type="number" class="form-input item-field" data-index="${index}" data-prop="discount" min="0" max="100" step="1" value="${item.discount}">
        </td>
        <td>
          <input type="number" class="form-input item-field" data-index="${index}" data-prop="tax" min="0" max="100" step="0.25" value="${item.tax}">
        </td>
        <td style="text-align: right; font-weight: 700; color: var(--accent);">
          ${formatPrice(lineTotal)}
        </td>
        <td style="text-align: center;">
          <button type="button" class="btn-remove-item" data-remove-index="${index}" title="Remove Item">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      `;
      fragment.appendChild(tr);
    });

    cartItemsTbody.appendChild(fragment);

    // Attach row input listeners
    cartItemsTbody.querySelectorAll('.item-field').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        const prop = e.target.dataset.prop;
        if (prop === 'name' || prop === 'sku') {
          items[idx][prop] = e.target.value;
        } else if (prop === 'price' || prop === 'discount' || prop === 'tax') {
          items[idx][prop] = Math.max(0, parseFloat(e.target.value) || 0);
        } else if (prop === 'qty') {
          items[idx][prop] = Math.max(1, parseInt(e.target.value, 10) || 1);
        }
        calculateOrder();
      });
    });

    // Attach row remove button listeners
    cartItemsTbody.querySelectorAll('[data-remove-index]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.dataset.removeIndex, 10);
        items.splice(idx, 1);
        renderItems();
        calculateOrder();
      });
    });
  }

  // Calculate Order Economics & Update Receipt Preview
  function calculateOrder() {
    let grossSubtotal = 0;
    let totalLineDiscount = 0;
    let totalTax = 0;
    let totalUnits = 0;

    receiptItemsTbody.innerHTML = '';
    const receiptFrag = document.createDocumentFragment();

    items.forEach(item => {
      const lineSubtotal = item.price * item.qty;
      const lineDiscount = lineSubtotal * (item.discount / 100);
      const lineTaxable = lineSubtotal - lineDiscount;
      const lineTax = lineTaxable * (item.tax / 100);
      const lineTotal = lineTaxable + lineTax;

      grossSubtotal += lineSubtotal;
      totalLineDiscount += lineDiscount;
      totalTax += lineTax;
      totalUnits += item.qty;

      // Add to receipt preview table
      const rTr = document.createElement('tr');
      const discountTag = item.discount > 0 ? ` <span style="font-size: 0.72rem; color: var(--success);">(-${item.discount}%)</span>` : '';
      rTr.innerHTML = `
        <td>
          <div style="font-weight: 600;">${escapeHtml(item.name || 'Untitled Item')}</div>
          <div style="font-size: 0.75rem; color: var(--text-tertiary);">${escapeHtml(item.sku || 'SKU-N/A')}${discountTag}</div>
        </td>
        <td style="text-align: center;">${item.qty}</td>
        <td style="text-align: right;">${formatPrice(item.price)}</td>
        <td style="text-align: right; font-weight: 600;">${formatPrice(lineTotal)}</td>
      `;
      receiptFrag.appendChild(rTr);
    });

    receiptItemsTbody.appendChild(receiptFrag);

    // Global Coupon Discount
    const couponDiscount = Math.max(0, parseFloat(cartCouponDiscount.value) || 0);
    const totalDiscounts = totalLineDiscount + couponDiscount;

    // Shipping Calculation
    const baseShipping = Math.max(0, parseFloat(shippingFeeInput.value) || 0);
    const freeThresh = Math.max(0, parseFloat(freeShippingThresh.value) || 0);

    let finalShipping = baseShipping;
    const netOrderValue = Math.max(0, grossSubtotal - totalDiscounts);
    if (freeThresh > 0 && netOrderValue >= freeThresh && grossSubtotal > 0) {
      finalShipping = 0;
    }

    const grandTotal = Math.max(0, netOrderValue + totalTax + finalShipping);
    const aov = grandTotal;
    const avgPricePerUnit = totalUnits > 0 ? grossSubtotal / totalUnits : 0;

    // Update KPIs
    kpiGrandTotal.textContent = formatPrice(grandTotal);
    kpiAov.textContent = formatPrice(aov);
    kpiAovSub.textContent = totalUnits > 0 ? `${formatPrice(grandTotal / totalUnits)} / unit (${totalUnits} units)` : '$0.00 / unit';
    kpiTotalTax.textContent = formatPrice(totalTax);
    kpiTotalDiscount.textContent = formatPrice(totalDiscounts);

    cartItemCountBadge.textContent = `${items.length} Line Item${items.length === 1 ? '' : 's'} (${totalUnits} Units)`;

    // Update Receipt Card Details
    receiptOrderId.textContent = orderIdInput.value || 'ORD-UNKNOWN';
    receiptCustomerName.textContent = customerNameInput.value || 'Customer';
    receiptSubtotal.textContent = formatPrice(grossSubtotal);
    receiptDiscounts.textContent = totalDiscounts > 0 ? `-${formatPrice(totalDiscounts)}` : `${getCurrencySymbol()}0.00`;
    receiptTax.textContent = `+${formatPrice(totalTax)}`;
    receiptShipping.textContent = finalShipping === 0 ? 'FREE' : `+${formatPrice(finalShipping)}`;
    receiptGrandTotal.textContent = formatPrice(grandTotal);
  }

  function escapeHtml(text) {
    if (!text) return '';
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Export Order JSON
  function exportOrderJSON() {
    const grossSubtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const totalLineDiscount = items.reduce((sum, item) => sum + (item.price * item.qty * (item.discount / 100)), 0);
    const couponDiscount = parseFloat(cartCouponDiscount.value) || 0;
    const totalTax = items.reduce((sum, item) => sum + ((item.price * item.qty * (1 - item.discount / 100)) * (item.tax / 100)), 0);
    const shipping = parseFloat(shippingFeeInput.value) || 0;
    const grandTotal = grossSubtotal - totalLineDiscount - couponDiscount + totalTax + shipping;

    const orderData = {
      orderId: orderIdInput.value,
      customerName: customerNameInput.value,
      currency: getCurrencySymbol(),
      createdAt: new Date().toISOString(),
      items: items.map(item => ({
        name: item.name,
        sku: item.sku,
        unitPrice: item.price,
        quantity: item.qty,
        discountPercentage: item.discount,
        taxPercentage: item.tax,
        lineTotal: (item.price * item.qty * (1 - item.discount / 100)) * (1 + item.tax / 100)
      })),
      financialSummary: {
        subtotal: grossSubtotal,
        totalDiscounts: totalLineDiscount + couponDiscount,
        totalTax: totalTax,
        shippingFee: shipping,
        grandTotal: Math.max(0, grandTotal),
        totalUnits: items.reduce((sum, item) => sum + item.qty, 0)
      }
    };

    const jsonStr = JSON.stringify(orderData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${orderIdInput.value || 'order'}-details.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Export Order CSV
  function exportOrderCSV() {
    if (items.length === 0) {
      alert('Cart is empty.');
      return;
    }

    const headers = ['Item Name', 'SKU', 'Unit Price', 'Quantity', 'Discount (%)', 'Tax (%)', 'Line Subtotal', 'Line Total'];
    const rows = [headers.join(',')];

    items.forEach(item => {
      const lineSubtotal = item.price * item.qty;
      const lineDiscount = lineSubtotal * (item.discount / 100);
      const lineTaxable = lineSubtotal - lineDiscount;
      const lineTax = lineTaxable * (item.tax / 100);
      const lineTotal = lineTaxable + lineTax;

      rows.push([
        `"${item.name.replace(/"/g, '""')}"`,
        `"${item.sku.replace(/"/g, '""')}"`,
        item.price.toFixed(2),
        item.qty,
        item.discount.toFixed(2),
        item.tax.toFixed(2),
        lineSubtotal.toFixed(2),
        lineTotal.toFixed(2)
      ].join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.join('\n'));
    const link = document.createElement('a');
    link.href = csvContent;
    link.download = `${orderIdInput.value || 'order'}-items.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Event Listeners
  btnAddItem.addEventListener('click', () => {
    items.push({
      id: Date.now(),
      name: 'New Product',
      sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
      price: 25.00,
      qty: 1,
      discount: 0,
      tax: 8.5
    });
    renderItems();
    calculateOrder();
  });

  btnLoadSample.addEventListener('click', () => {
    items = JSON.parse(JSON.stringify(sampleItems));
    renderItems();
    calculateOrder();
  });

  btnClearCart.addEventListener('click', () => {
    if (items.length > 0 && confirm('Are you sure you want to clear all items in the basket?')) {
      items = [];
      renderItems();
      calculateOrder();
    }
  });

  orderIdInput.addEventListener('input', calculateOrder);
  customerNameInput.addEventListener('input', calculateOrder);
  orderCurrencySelect.addEventListener('change', () => {
    renderItems();
    calculateOrder();
  });

  shippingFeeInput.addEventListener('input', calculateOrder);
  freeShippingThresh.addEventListener('input', calculateOrder);
  cartCouponDiscount.addEventListener('input', calculateOrder);

  btnExportJson.addEventListener('click', exportOrderJSON);
  btnExportCsv.addEventListener('click', exportOrderCSV);
  btnPrintInvoice.addEventListener('click', () => window.print());

  // Initialize
  initCart();
});