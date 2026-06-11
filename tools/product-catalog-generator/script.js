document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const inputs = {
    title: document.getElementById('c-title'),
    subtitle: document.getElementById('c-subtitle'),
    company: document.getElementById('c-company'),
    currency: document.getElementById('c-currency'),
    theme: document.getElementById('doc-theme')
  };

  const preview = {
    title: document.getElementById('doc-title'),
    subtitle: document.getElementById('doc-subtitle'),
    company: document.getElementById('doc-company'),
    grid: document.getElementById('doc-grid'),
    container: document.getElementById('doc-preview')
  };

  const productsWrapper = document.getElementById('products-wrapper');
  const addProductBtn = document.getElementById('add-product-btn');
  const printBtn = document.getElementById('print-btn');

  // Theming system (26 Themes)
  const themes = [
    { name: "Default Pink", primary: "#ec4899", headerBg: "#111827", headerText: "#ffffff", font: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
    { name: "Midnight Blue", primary: "#3b82f6", headerBg: "#0f172a", headerText: "#ffffff", font: "'Inter', sans-serif" },
    { name: "Emerald Green", primary: "#10b981", headerBg: "#064e3b", headerText: "#ffffff", font: "'Roboto', sans-serif" },
    { name: "Royal Purple", primary: "#8b5cf6", headerBg: "#2e1065", headerText: "#f3e8ff", font: "'Outfit', sans-serif" },
    { name: "Sunset Orange", primary: "#f97316", headerBg: "#7c2d12", headerText: "#fff7ed", font: "Georgia, serif" },
    { name: "Dark Mode Tech", primary: "#06b6d4", headerBg: "#09090b", headerText: "#fafafa", font: "'Space Grotesk', monospace" },
    { name: "Minimal White", primary: "#000000", headerBg: "#ffffff", headerText: "#000000", font: "'Helvetica Neue', sans-serif" },
    { name: "Rose Gold", primary: "#fda4af", headerBg: "#4c0519", headerText: "#ffe4e6", font: "'Playfair Display', serif" },
    { name: "Ocean Breeze", primary: "#0ea5e9", headerBg: "#ecfeff", headerText: "#083344", font: "'Nunito', sans-serif" },
    { name: "Forest Wood", primary: "#65a30d", headerBg: "#14532d", headerText: "#f0fdf4", font: "Palatino, serif" },
    { name: "Ruby Red", primary: "#ef4444", headerBg: "#450a0a", headerText: "#fef2f2", font: "'Poppins', sans-serif" },
    { name: "Mustard Yellow", primary: "#eab308", headerBg: "#422006", headerText: "#fefce8", font: "'Montserrat', sans-serif" },
    { name: "Slate Grey", primary: "#64748b", headerBg: "#0f172a", headerText: "#f8fafc", font: "'Lato', sans-serif" },
    { name: "Neon Green", primary: "#22c55e", headerBg: "#000000", headerText: "#ffffff", font: "'Courier New', monospace" },
    { name: "Lavender", primary: "#d946ef", headerBg: "#fae8ff", headerText: "#4a044e", font: "'Quicksand', sans-serif" },
    { name: "Teal Matrix", primary: "#14b8a6", headerBg: "#042f2e", headerText: "#ccfbf1", font: "Consolas, monospace" },
    { name: "Cherry Blossom", primary: "#f43f5e", headerBg: "#fff1f2", headerText: "#881337", font: "Arial, sans-serif" },
    { name: "Chocolate", primary: "#d97706", headerBg: "#451a03", headerText: "#fffbeb", font: "Garamond, serif" },
    { name: "Sky Blue", primary: "#0284c7", headerBg: "#e0f2fe", headerText: "#082f49", font: "'Open Sans', sans-serif" },
    { name: "Coral", primary: "#fb7185", headerBg: "#4c0519", headerText: "#fff1f2", font: "'Merriweather', serif" },
    { name: "Mint", primary: "#34d399", headerBg: "#ecfdf5", headerText: "#022c22", font: "'Work Sans', sans-serif" },
    { name: "Bronze", primary: "#b45309", headerBg: "#1c1917", headerText: "#f5f5f4", font: "'PT Serif', serif" },
    { name: "Silver", primary: "#94a3b8", headerBg: "#f8fafc", headerText: "#0f172a", font: "'Raleway', sans-serif" },
    { name: "Gold", primary: "#f59e0b", headerBg: "#000000", headerText: "#fffbeb", font: "'Cinzel', serif" },
    { name: "Navy Blue", primary: "#3b82f6", headerBg: "#172554", headerText: "#eff6ff", font: "'Oswald', sans-serif" },
    { name: "Pastel Pink", primary: "#fbcfe8", headerBg: "#831843", headerText: "#fdf2f8", font: "'Dancing Script', cursive" }
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
    
    // For Minimal White fix header border
    if(t.name === "Minimal White") {
      preview.container.querySelector('.doc-header').style.borderBottom = `8px solid #e2e8f0`;
    } else {
      preview.container.querySelector('.doc-header').style.borderBottom = `8px solid ${t.primary}`;
    }
  });

  let products = [
    {
      id: Date.now(),
      name: "Classic White Sneakers",
      price: "4500",
      desc: "Premium leather sneakers with comfortable sole and minimalist design.",
      img: ""
    },
    {
      id: Date.now() + 1,
      name: "Denim Jacket",
      price: "3200",
      desc: "Vintage style blue denim jacket. Perfect for all seasons.",
      img: ""
    }
  ];

  function renderFormProducts() {
    productsWrapper.innerHTML = '';
    products.forEach((p, index) => {
      const pDiv = document.createElement('div');
      pDiv.className = 'product-container';
      pDiv.innerHTML = `
        <button type="button" class="remove-btn" onclick="removeProduct(${p.id})">&times;</button>
        <h4 style="margin-top:0; margin-bottom:1rem; font-size:0.9rem; color:var(--ecom-primary);">Product ${index + 1}</h4>
        
        <div class="form-group">
          <label>Product Name</label>
          <input type="text" value="${p.name}" oninput="updateProduct(${p.id}, 'name', this.value)">
        </div>
        
        <div class="item-grid">
          <div class="form-group">
            <label>Price</label>
            <input type="number" value="${p.price}" oninput="updateProduct(${p.id}, 'price', this.value)">
          </div>
          <div class="form-group">
            <label>Image Upload</label>
            <input type="file" accept="image/*" onchange="uploadImage(${p.id}, this)">
          </div>
        </div>
        
        <div class="form-group" style="margin-bottom:0;">
          <label>Description</label>
          <textarea rows="2" oninput="updateProduct(${p.id}, 'desc', this.value)">${p.desc}</textarea>
        </div>
      `;
      productsWrapper.appendChild(pDiv);
    });
    updatePreview();
  }

  window.removeProduct = (id) => {
    products = products.filter(p => p.id !== id);
    renderFormProducts();
  };

  window.updateProduct = (id, field, value) => {
    const p = products.find(p => p.id === id);
    if (p) p[field] = value;
    updatePreview();
  };

  window.uploadImage = (id, input) => {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const p = products.find(p => p.id === id);
        if (p) p.img = e.target.result;
        updatePreview();
      };
      reader.readAsDataURL(input.files[0]);
    }
  };

  addProductBtn.addEventListener('click', () => {
    products.push({
      id: Date.now(),
      name: "New Product",
      price: "0",
      desc: "Product description...",
      img: ""
    });
    renderFormProducts();
  });

  function updatePreview() {
    preview.title.textContent = inputs.title.value || 'Catalog Title';
    preview.subtitle.textContent = inputs.subtitle.value || 'Subtitle';
    preview.company.textContent = inputs.company.value || 'Company Name';
    
    const curr = inputs.currency.value || '$';

    preview.grid.innerHTML = '';
    products.forEach(p => {
      const imgHtml = p.img 
        ? `<img src="${p.img}" class="product-img" alt="${p.name}">`
        : `<div style="color:#94a3b8; font-size:0.9rem;">No Image</div>`;

      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <div class="product-img-wrapper">
          ${imgHtml}
        </div>
        <div class="product-info">
          <div class="product-name">${p.name}</div>
          <div class="product-price">${curr} ${parseFloat(p.price || 0).toLocaleString('en-US')}</div>
          <div class="product-desc">${p.desc}</div>
        </div>
      `;
      preview.grid.appendChild(card);
    });
  }

  // General listeners
  ['title', 'subtitle', 'company', 'currency'].forEach(key => {
    inputs[key].addEventListener('input', updatePreview);
  });

  printBtn.addEventListener('click', () => {
    window.print();
  });

  // Init
  renderFormProducts();
  inputs.theme.dispatchEvent(new Event('change'));
});
