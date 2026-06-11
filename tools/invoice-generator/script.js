document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const inputs = {
    theme: document.getElementById('doc-theme'),
    currency: document.getElementById('i-currency'),
    no: document.getElementById('i-no'),
    date: document.getElementById('i-date'),
    due: document.getElementById('i-due'),
    logo: document.getElementById('i-logo'),
    company: document.getElementById('i-company'),
    companyAddr: document.getElementById('i-company-addr'),
    client: document.getElementById('i-client'),
    clientAddr: document.getElementById('i-client-addr'),
    tax: document.getElementById('i-tax'),
    discount: document.getElementById('i-discount'),
    notes: document.getElementById('i-notes')
  };

  const preview = {
    container: document.getElementById('doc-preview'),
    logo: document.getElementById('p-logo'),
    company: document.getElementById('p-company'),
    companyAddr: document.getElementById('p-company-addr'),
    no: document.getElementById('p-no'),
    date: document.getElementById('p-date'),
    due: document.getElementById('p-due'),
    client: document.getElementById('p-client'),
    clientAddr: document.getElementById('p-client-addr'),
    items: document.getElementById('p-items'),
    subtotal: document.getElementById('p-subtotal'),
    taxRate: document.getElementById('p-tax-rate'),
    taxAmt: document.getElementById('p-tax-amt'),
    discountAmt: document.getElementById('p-discount-amt'),
    grand: document.getElementById('p-grand'),
    notes: document.getElementById('p-notes')
  };

  const itemsWrapper = document.getElementById('items-wrapper');
  const addItemBtn = document.getElementById('add-item-btn');
  const printBtn = document.getElementById('print-btn');

  // Theming system (26 Themes)
  const themes = [
    { name: "Default Blue", primary: "#3b82f6", headerBg: "#f8fafc", headerText: "#0f172a", font: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
    { name: "Midnight Elegance", primary: "#6366f1", headerBg: "#0f172a", headerText: "#f8fafc", font: "'Inter', sans-serif" },
    { name: "Emerald Green", primary: "#10b981", headerBg: "#f0fdf4", headerText: "#064e3b", font: "'Roboto', sans-serif" },
    { name: "Royal Purple", primary: "#8b5cf6", headerBg: "#f3e8ff", headerText: "#3b0764", font: "'Outfit', sans-serif" },
    { name: "Sunset Orange", primary: "#f97316", headerBg: "#fff7ed", headerText: "#7c2d12", font: "Georgia, serif" },
    { name: "Dark Mode Tech", primary: "#06b6d4", headerBg: "#18181b", headerText: "#fafafa", font: "'Space Grotesk', monospace" },
    { name: "Minimal White", primary: "#000000", headerBg: "#ffffff", headerText: "#000000", font: "'Helvetica Neue', sans-serif" },
    { name: "Rose Gold", primary: "#fda4af", headerBg: "#fff1f2", headerText: "#881337", font: "'Playfair Display', serif" },
    { name: "Ocean Breeze", primary: "#0ea5e9", headerBg: "#f0f9ff", headerText: "#082f49", font: "'Nunito', sans-serif" },
    { name: "Forest Wood", primary: "#65a30d", headerBg: "#f7fee7", headerText: "#14532d", font: "Palatino, serif" },
    { name: "Ruby Red", primary: "#ef4444", headerBg: "#fef2f2", headerText: "#450a0a", font: "'Poppins', sans-serif" },
    { name: "Mustard Yellow", primary: "#eab308", headerBg: "#fefce8", headerText: "#422006", font: "'Montserrat', sans-serif" },
    { name: "Slate Grey", primary: "#64748b", headerBg: "#f8fafc", headerText: "#0f172a", font: "'Lato', sans-serif" },
    { name: "Neon Green", primary: "#22c55e", headerBg: "#000000", headerText: "#f0fdf4", font: "'Courier New', monospace" },
    { name: "Lavender", primary: "#d946ef", headerBg: "#fdf4ff", headerText: "#4a044e", font: "'Quicksand', sans-serif" },
    { name: "Teal Matrix", primary: "#14b8a6", headerBg: "#f0fdfa", headerText: "#042f2e", font: "Consolas, monospace" },
    { name: "Cherry Blossom", primary: "#f43f5e", headerBg: "#fff1f2", headerText: "#881337", font: "Arial, sans-serif" },
    { name: "Chocolate", primary: "#d97706", headerBg: "#fffbeb", headerText: "#451a03", font: "Garamond, serif" },
    { name: "Sky Blue", primary: "#0284c7", headerBg: "#f0f9ff", headerText: "#082f49", font: "'Open Sans', sans-serif" },
    { name: "Coral", primary: "#fb7185", headerBg: "#fff1f2", headerText: "#4c0519", font: "'Merriweather', serif" },
    { name: "Mint", primary: "#34d399", headerBg: "#ecfdf5", headerText: "#022c22", font: "'Work Sans', sans-serif" },
    { name: "Bronze", primary: "#b45309", headerBg: "#fef3c7", headerText: "#451a03", font: "'PT Serif', serif" },
    { name: "Silver", primary: "#94a3b8", headerBg: "#f1f5f9", headerText: "#0f172a", font: "'Raleway', sans-serif" },
    { name: "Gold", primary: "#f59e0b", headerBg: "#fffbeb", headerText: "#451a03", font: "'Cinzel', serif" },
    { name: "Navy Blue", primary: "#1d4ed8", headerBg: "#eff6ff", headerText: "#1e3a8a", font: "'Oswald', sans-serif" },
    { name: "Pastel Pink", primary: "#fbcfe8", headerBg: "#fdf2f8", headerText: "#831843", font: "'Dancing Script', cursive" }
  ];

  // Populate themes
  themes.forEach((theme, index) => {
    const opt = document.createElement('option');
    opt.value = index;
    opt.textContent = theme.name;
    inputs.theme.appendChild(opt);
  });

  inputs.theme.addEventListener('change', (e) => {
    const t = themes[e.target.value];
    preview.container.style.setProperty('--theme-primary', t.primary);
    preview.container.style.setProperty('--theme-header-bg', t.headerBg);
    preview.container.style.setProperty('--theme-header-text', t.headerText);
    preview.container.style.setProperty('--theme-font', t.font);
    
    if(t.name === "Minimal White") {
      preview.container.querySelector('.inv-header').style.borderBottom = `2px solid #e2e8f0`;
    } else {
      preview.container.querySelector('.inv-header').style.borderBottom = `2px solid ${t.primary}`;
    }
  });

  let items = [
    { id: Date.now(), name: "Web Development Services", desc: "Frontend and backend development", qty: 1, rate: 1500 },
    { id: Date.now() + 1, name: "Hosting Setup", desc: "Cloud server configuration", qty: 1, rate: 250 }
  ];

  function renderFormItems() {
    itemsWrapper.innerHTML = '';
    items.forEach((item, index) => {
      const pDiv = document.createElement('div');
      pDiv.className = 'product-container';
      pDiv.innerHTML = `
        <button type="button" class="remove-btn" onclick="removeItem(${item.id})">&times;</button>
        <div style="display: grid; grid-template-columns: 1fr 60px 100px; gap: 0.5rem; margin-bottom: 0.5rem;">
          <div class="form-group" style="margin-bottom:0;">
            <label style="font-size: 0.75rem;">Item Name</label>
            <input type="text" value="${item.name}" oninput="updateItem(${item.id}, 'name', this.value)">
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label style="font-size: 0.75rem;">Qty</label>
            <input type="number" value="${item.qty}" oninput="updateItem(${item.id}, 'qty', this.value)">
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label style="font-size: 0.75rem;">Rate</label>
            <input type="number" value="${item.rate}" oninput="updateItem(${item.id}, 'rate', this.value)">
          </div>
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label style="font-size: 0.75rem;">Description</label>
          <input type="text" value="${item.desc}" oninput="updateItem(${item.id}, 'desc', this.value)">
        </div>
      `;
      itemsWrapper.appendChild(pDiv);
    });
    updatePreview();
  }

  window.removeItem = (id) => {
    items = items.filter(i => i.id !== id);
    renderFormItems();
  };

  window.updateItem = (id, field, value) => {
    const i = items.find(i => i.id === id);
    if (i) {
      if(field === 'name' || field === 'desc') i[field] = value;
      else i[field] = parseFloat(value) || 0;
    }
    updatePreview();
  };

  addItemBtn.addEventListener('click', () => {
    items.push({ id: Date.now(), name: "New Item", desc: "", qty: 1, rate: 0 });
    renderFormItems();
  });

  inputs.logo.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        preview.logo.src = evt.target.result;
        preview.logo.style.display = 'block';
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  });

  function updatePreview() {
    const curr = inputs.currency.value || '';

    // Header & Details
    preview.company.textContent = inputs.company.value;
    preview.companyAddr.textContent = inputs.companyAddr.value;
    preview.client.textContent = inputs.client.value;
    preview.clientAddr.textContent = inputs.clientAddr.value;
    
    preview.no.textContent = inputs.no.value;
    preview.date.textContent = inputs.date.value;
    preview.due.textContent = inputs.due.value;
    preview.notes.textContent = inputs.notes.value;

    // Items
    preview.items.innerHTML = '';
    let subtotal = 0;
    
    items.forEach(item => {
      const amt = item.qty * item.rate;
      subtotal += amt;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="inv-item-name">${item.name}</div>
          <div class="inv-item-desc">${item.desc}</div>
        </td>
        <td class="text-center">${item.qty}</td>
        <td class="text-right">${curr} ${item.rate.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        <td class="text-right">${curr} ${amt.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
      `;
      preview.items.appendChild(tr);
    });

    // Totals
    const taxRate = parseFloat(inputs.tax.value) || 0;
    const discount = parseFloat(inputs.discount.value) || 0;
    
    const taxAmt = subtotal * (taxRate / 100);
    const grand = subtotal + taxAmt - discount;

    preview.subtotal.textContent = `${curr} ${subtotal.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    preview.taxRate.textContent = taxRate;
    preview.taxAmt.textContent = `${curr} ${taxAmt.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    preview.discountAmt.textContent = `- ${curr} ${discount.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    preview.grand.textContent = `${curr} ${Math.max(0, grand).toLocaleString('en-US', {minimumFractionDigits: 2})}`;
  }

  // Listeners
  ['currency', 'no', 'date', 'due', 'company', 'companyAddr', 'client', 'clientAddr', 'tax', 'discount', 'notes'].forEach(key => {
    inputs[key].addEventListener('input', updatePreview);
  });

  printBtn.addEventListener('click', () => {
    window.print();
  });

  // Init
  renderFormItems();
  inputs.theme.dispatchEvent(new Event('change'));
});