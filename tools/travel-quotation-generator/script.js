document.addEventListener('DOMContentLoaded', () => {
  // Lock Screen Logic
  const lockScreen = document.getElementById('lock-screen');
  const lockForm = document.getElementById('lock-form');
  const passwordInput = document.getElementById('password-input');
  const passwordError = document.getElementById('password-error');

  if (sessionStorage.getItem('tqg_unlocked') === 'true') {
    lockScreen.style.display = 'none';
  }

  lockForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (passwordInput.value === '7127730627654909953t') {
      sessionStorage.setItem('tqg_unlocked', 'true');
      lockScreen.style.display = 'none';
    } else {
      passwordError.style.display = 'block';
      passwordInput.value = '';
    }
  });

  // Config
  const currencyMap = {
    'BDT': '৳',
    'USD': '$',
    'EUR': '€',
    'AED': 'د.إ'
  };

  // State
  let items = [
    { id: 1, desc: 'Return Airfare', cost: 45000, margin: 5000, qtyMode: 'per_pax' },
    { id: 2, desc: '4-Star Hotel (3 Nights)', cost: 30000, margin: 5000, qtyMode: 'total' },
    { id: 3, desc: 'Visa Processing', cost: 12000, margin: 3000, qtyMode: 'per_pax' }
  ];

  // Elements (Inputs)
  const currencySelect = document.getElementById('q-currency');
  const cName = document.getElementById('c-name');
  const cDest = document.getElementById('c-dest');
  const cPax = document.getElementById('c-pax');
  const cDate = document.getElementById('c-date');
  const cNotes = document.getElementById('c-notes');
  const itemsWrapper = document.getElementById('items-wrapper');
  const addItemBtn = document.getElementById('add-item-btn');
  const printBtn = document.getElementById('print-btn');

  // Elements (Document)
  const docDate = document.getElementById('doc-date');
  const docRef = document.getElementById('doc-ref');
  const docClient = document.getElementById('doc-client');
  const docDest = document.getElementById('doc-dest');
  const docPax = document.getElementById('doc-pax');
  const docTravelDate = document.getElementById('doc-travel-date');
  const docTbody = document.getElementById('doc-tbody');
  const docSubtotal = document.getElementById('doc-subtotal');
  const docGrand = document.getElementById('doc-grand');
  const docFooterNotes = document.getElementById('doc-footer-notes');

  // Elements (Admin Profit)
  const adminNet = document.getElementById('admin-net');
  const adminProfit = document.getElementById('admin-profit');

  // Utilities
  function formatCurrency(amount) {
    const sym = currencyMap[currencySelect.value] || currencySelect.value;
    return `${sym} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function formatDateForDoc(dateString) {
    if (!dateString) return 'TBD';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function setInitialDocMeta() {
    const d = new Date();
    docDate.textContent = `Date: ${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    docRef.textContent = `Ref: QT-${d.getTime().toString().slice(-6)}`;
  }

  // Render Form Items
  function renderFormItems() {
    itemsWrapper.innerHTML = '';
    items.forEach((item, index) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'line-item';
      itemEl.innerHTML = `
        <button type="button" class="remove-item-btn" data-index="${index}">×</button>
        <div class="form-group" style="margin-bottom: 0.75rem;">
          <input type="text" class="item-desc" placeholder="Item Description (e.g. Hotel 3 Nights)" value="${item.desc}">
        </div>
        <div class="item-grid">
          <div class="form-group" style="margin-bottom: 0.75rem;">
            <label style="font-size: 0.8rem;">Net Cost</label>
            <input type="number" class="item-cost" value="${item.cost}" min="0">
          </div>
          <div class="form-group" style="margin-bottom: 0.75rem;">
            <label style="font-size: 0.8rem;">Our Margin/Markup</label>
            <input type="number" class="item-margin" value="${item.margin}" min="0">
          </div>
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label style="font-size: 0.8rem;">Quantity Applies To</label>
          <select class="item-qtyMode">
            <option value="per_pax" ${item.qtyMode === 'per_pax' ? 'selected' : ''}>Multiply by Pax (Per Person)</option>
            <option value="total" ${item.qtyMode === 'total' ? 'selected' : ''}>Flat Rate (Total amount)</option>
          </select>
        </div>
      `;

      // Event Listeners for inputs
      itemEl.querySelector('.remove-item-btn').addEventListener('click', () => {
        items.splice(index, 1);
        renderFormItems();
        updateDocument();
      });
      
      const inputs = itemEl.querySelectorAll('input, select');
      inputs.forEach(input => {
        input.addEventListener('input', (e) => {
          // Update state
          const target = e.target;
          if (target.classList.contains('item-desc')) item.desc = target.value;
          if (target.classList.contains('item-cost')) item.cost = parseFloat(target.value) || 0;
          if (target.classList.contains('item-margin')) item.margin = parseFloat(target.value) || 0;
          if (target.classList.contains('item-qtyMode')) item.qtyMode = target.value;
          updateDocument();
        });
      });

      itemsWrapper.appendChild(itemEl);
    });
  }

  // Update Document
  function updateDocument() {
    // Basic Info
    docClient.textContent = cName.value.trim() || 'Valued Client';
    docDest.textContent = cDest.value.trim() || 'N/A';
    docPax.textContent = `${cPax.value || 1} Pax`;
    docTravelDate.textContent = formatDateForDoc(cDate.value);
    docFooterNotes.innerHTML = cNotes.value.replace(/\n/g, '<br>');

    // Build Table & Totals
    const paxCount = parseInt(cPax.value) || 1;
    docTbody.innerHTML = '';
    
    let totalClientPrice = 0;
    let totalNetCost = 0;
    let totalAdminProfit = 0;

    items.forEach(item => {
      const isPerPax = item.qtyMode === 'per_pax';
      const qty = isPerPax ? paxCount : 1;
      
      // Calculations
      const unitNetCost = item.cost;
      const unitMargin = item.margin;
      const unitSellingPrice = unitNetCost + unitMargin;
      
      const rowTotalSellingPrice = unitSellingPrice * qty;
      const rowTotalNetCost = unitNetCost * qty;
      const rowTotalProfit = unitMargin * qty;

      totalClientPrice += rowTotalSellingPrice;
      totalNetCost += rowTotalNetCost;
      totalAdminProfit += rowTotalProfit;

      // Create row
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong style="color: #0f172a;">${item.desc || 'Untitled Item'}</strong></td>
        <td style="text-align: center;">${qty}</td>
        <td style="text-align: right;">${formatCurrency(unitSellingPrice)}</td>
        <td style="text-align: right; font-weight: 600;">${formatCurrency(rowTotalSellingPrice)}</td>
      `;
      docTbody.appendChild(tr);
    });

    // Update Totals
    docSubtotal.textContent = formatCurrency(totalClientPrice);
    docGrand.textContent = formatCurrency(totalClientPrice);

    // Update Admin Panel
    adminNet.textContent = formatCurrency(totalNetCost);
    adminProfit.textContent = formatCurrency(totalAdminProfit);
  }

  // Add Item logic
  addItemBtn.addEventListener('click', () => {
    items.push({ id: Date.now(), desc: '', cost: 0, margin: 0, qtyMode: 'per_pax' });
    renderFormItems();
    updateDocument();
  });

  // Global Change Listeners
  [currencySelect, cName, cDest, cPax, cDate, cNotes].forEach(el => {
    el.addEventListener('input', updateDocument);
    if (el.tagName === 'SELECT') el.addEventListener('change', updateDocument);
  });

  printBtn.addEventListener('click', () => window.print());

  // Initialization
  setInitialDocMeta();
  renderFormItems();
  updateDocument();
});
