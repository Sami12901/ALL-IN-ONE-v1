document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const inputs = {
    currency: document.getElementById('r-currency'),
    date: document.getElementById('r-date'),
    store: document.getElementById('r-store'),
    address: document.getElementById('r-address'),
    no: document.getElementById('r-no'),
    staff: document.getElementById('r-staff'),
    tax: document.getElementById('r-tax'),
    discount: document.getElementById('r-discount'),
    payment: document.getElementById('r-payment'),
    footer: document.getElementById('r-footer')
  };

  const preview = {
    store: document.getElementById('p-store'),
    address: document.getElementById('p-address'),
    no: document.getElementById('p-no'),
    date: document.getElementById('p-date'),
    staff: document.getElementById('p-staff'),
    items: document.getElementById('p-items'),
    subtotal: document.getElementById('p-subtotal'),
    taxRate: document.getElementById('p-tax-rate'),
    taxAmt: document.getElementById('p-tax-amt'),
    discountAmt: document.getElementById('p-discount-amt'),
    grand: document.getElementById('p-grand'),
    payment: document.getElementById('p-payment'),
    footer: document.getElementById('p-footer'),
    barcode: document.getElementById('p-barcode')
  };

  const itemsWrapper = document.getElementById('items-wrapper');
  const addItemBtn = document.getElementById('add-item-btn');
  const printBtn = document.getElementById('print-btn');

  let items = [
    { id: Date.now(), qty: 1, name: "Classic White Sneakers", price: 4500 },
    { id: Date.now() + 1, qty: 2, name: "Cotton Socks", price: 250 }
  ];

  function renderFormItems() {
    itemsWrapper.innerHTML = '';
    items.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'product-container';
      div.innerHTML = `
        <button type="button" class="remove-btn" onclick="removeItem(${item.id})">&times;</button>
        <div style="display: grid; grid-template-columns: 60px 1fr 100px; gap: 0.5rem;">
          <div class="form-group" style="margin-bottom:0;">
            <label style="font-size: 0.75rem;">Qty</label>
            <input type="number" value="${item.qty}" oninput="updateItem(${item.id}, 'qty', this.value)" min="1">
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label style="font-size: 0.75rem;">Item Name</label>
            <input type="text" value="${item.name}" oninput="updateItem(${item.id}, 'name', this.value)">
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label style="font-size: 0.75rem;">Price</label>
            <input type="number" value="${item.price}" oninput="updateItem(${item.id}, 'price', this.value)">
          </div>
        </div>
      `;
      itemsWrapper.appendChild(div);
    });
    updatePreview();
  }

  window.removeItem = (id) => {
    items = items.filter(i => i.id !== id);
    renderFormItems();
  };

  window.updateItem = (id, field, value) => {
    const item = items.find(i => i.id === id);
    if (item) {
      if (field === 'name') item[field] = value;
      else item[field] = parseFloat(value) || 0;
    }
    updatePreview();
  };

  addItemBtn.addEventListener('click', () => {
    items.push({ id: Date.now(), qty: 1, name: "New Item", price: 0 });
    renderFormItems();
  });

  function updatePreview() {
    const curr = inputs.currency.value || '';

    // Header
    preview.store.textContent = inputs.store.value;
    preview.address.textContent = inputs.address.value;
    preview.no.textContent = inputs.no.value;
    preview.date.textContent = inputs.date.value;
    preview.staff.textContent = inputs.staff.value;

    // Items & Subtotal
    let subtotal = 0;
    preview.items.innerHTML = '';
    items.forEach(item => {
      const lineTotal = item.qty * item.price;
      subtotal += lineTotal;
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="r-col-qty">${item.qty}</td>
        <td class="r-col-desc">${item.name}</td>
        <td class="r-col-amt">${lineTotal.toFixed(2)}</td>
      `;
      preview.items.appendChild(tr);
    });

    // Totals
    const taxRate = parseFloat(inputs.tax.value) || 0;
    const discount = parseFloat(inputs.discount.value) || 0;
    const taxAmt = subtotal * (taxRate / 100);
    const grand = subtotal + taxAmt - discount;

    preview.subtotal.textContent = `${curr} ${subtotal.toFixed(2)}`;
    preview.taxRate.textContent = taxRate;
    preview.taxAmt.textContent = `${curr} ${taxAmt.toFixed(2)}`;
    preview.discountAmt.textContent = `- ${curr} ${discount.toFixed(2)}`;
    preview.grand.textContent = `${curr} ${Math.max(0, grand).toFixed(2)}`;

    // Footer
    preview.payment.textContent = inputs.payment.value;
    preview.footer.textContent = inputs.footer.value;

    // Barcode (extract numbers from receipt no or use a dummy)
    const rawNo = inputs.no.value.replace(/[^a-zA-Z0-9]/g, '');
    preview.barcode.textContent = `*${rawNo || '123456789'}*`;
  }

  // Listeners
  Object.values(inputs).forEach(input => {
    input.addEventListener('input', updatePreview);
  });

  printBtn.addEventListener('click', () => {
    window.print();
  });

  // Init
  renderFormItems();
});
