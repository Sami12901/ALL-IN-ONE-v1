document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    brandName: document.getElementById('brand-name'),
    collectionTitle: document.getElementById('collection-title'),
    themesGrid: document.getElementById('themes-grid'),
    productsList: document.getElementById('products-list'),
    addBtn: document.getElementById('add-product-btn'),
    printBtn: document.getElementById('print-btn'),
    preview: document.getElementById('catalog-preview-wrapper')
  };

  let currentTheme = 'minimalist';
  let products = [
    {
      id: Date.now(),
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
      name: 'Leather Oxford Shoes',
      price: '$450',
      description: 'Handcrafted Italian leather with minimal stitching.'
    },
    {
      id: Date.now() + 1,
      image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&w=800&q=80',
      name: 'Classic Chronograph',
      price: '$1,200',
      description: 'Swiss movement, sapphire crystal, vintage finish.'
    }
  ];

  const THEMES = {
    minimalist: { name: 'Minimalist', bg: '#ffffff', color: '#111111', font: 'Helvetica Neue, Helvetica, Arial, sans-serif', accent: '#dddddd', coverAlign: 'center', textTransform: 'uppercase' },
    noir: { name: 'Noir Elegance', bg: '#111111', color: '#ffffff', font: 'Playfair Display, Georgia, serif', accent: '#333333', coverAlign: 'center', textTransform: 'none' },
    heritage: { name: 'Heritage', bg: '#fdfbf7', color: '#3b3a36', font: 'Garamond, Baskerville, serif', accent: '#d4cbb8', coverAlign: 'left', textTransform: 'uppercase' },
    avant: { name: 'Avant-Garde', bg: '#e9ecef', color: '#212529', font: 'Courier New, monospace', accent: '#212529', coverAlign: 'right', textTransform: 'lowercase' },
    monaco: { name: 'Monaco', bg: '#0b1d3a', color: '#f3e5ab', font: 'Georgia, serif', accent: '#c5a059', coverAlign: 'center', textTransform: 'uppercase' },
    blush: { name: 'Rose Blush', bg: '#fff0f5', color: '#4a3b32', font: 'Optima, sans-serif', accent: '#e2b4bd', coverAlign: 'center', textTransform: 'none' },
    slate: { name: 'Slate Modern', bg: '#2f3542', color: '#f1f2f6', font: 'Roboto, sans-serif', accent: '#57606f', coverAlign: 'left', textTransform: 'uppercase' },
    obsidian: { name: 'Obsidian', bg: '#000000', color: '#d4af37', font: 'Palatino Linotype, serif', accent: '#8a795d', coverAlign: 'right', textTransform: 'uppercase' },
    botanica: { name: 'Botanica', bg: '#f1f8f4', color: '#2d4a22', font: 'Baskerville, serif', accent: '#81b29a', coverAlign: 'center', textTransform: 'capitalize' },
    sahara: { name: 'Sahara Dune', bg: '#f4ecd8', color: '#5c4d3c', font: 'Futura, sans-serif', accent: '#d4a373', coverAlign: 'left', textTransform: 'uppercase' },
    arctic: { name: 'Arctic Ice', bg: '#f8f9fa', color: '#343a40', font: 'Lato, sans-serif', accent: '#ced4da', coverAlign: 'center', textTransform: 'uppercase' },
    velvet: { name: 'Crimson Velvet', bg: '#4a0e17', color: '#ffe6e6', font: 'Playfair Display, serif', accent: '#800000', coverAlign: 'center', textTransform: 'none' },
    industrial: { name: 'Industrial', bg: '#dcdde1', color: '#2f3640', font: 'Impact, sans-serif', accent: '#7f8fa6', coverAlign: 'left', textTransform: 'uppercase' },
    azure: { name: 'Azure Ocean', bg: '#e0f7fa', color: '#006064', font: 'Trebuchet MS, sans-serif', accent: '#80deea', coverAlign: 'right', textTransform: 'none' },
    gold: { name: 'Pure Gold', bg: '#ffeb3b', color: '#212121', font: 'Arial Black, sans-serif', accent: '#fbc02d', coverAlign: 'center', textTransform: 'uppercase' },
    lumiere: { name: 'Lumière', bg: '#fafafa', color: '#222222', font: 'Didot, serif', accent: '#eeeeee', coverAlign: 'center', textTransform: 'uppercase' },
    emerald: { name: 'Emerald Isle', bg: '#004d40', color: '#e0f2f1', font: 'Georgia, serif', accent: '#00796b', coverAlign: 'left', textTransform: 'none' },
    midnight: { name: 'Midnight Spark', bg: '#1a1a2e', color: '#e94560', font: 'Courier New, monospace', accent: '#16213e', coverAlign: 'center', textTransform: 'lowercase' },
    mocha: { name: 'Mocha', bg: '#efebe9', color: '#3e2723', font: 'Verdana, sans-serif', accent: '#8d6e63', coverAlign: 'left', textTransform: 'capitalize' },
    neon: { name: 'Neon Cyber', bg: '#000000', color: '#39ff14', font: 'Monaco, monospace', accent: '#ff00ff', coverAlign: 'center', textTransform: 'uppercase' },
    lavender: { name: 'Lavender Mist', bg: '#f3e5f5', color: '#4a148c', font: 'Tahoma, sans-serif', accent: '#ce93d8', coverAlign: 'right', textTransform: 'none' }
  };

  function renderThemes() {
    elements.themesGrid.innerHTML = '';
    for (const [key, t] of Object.entries(THEMES)) {
      const card = document.createElement('div');
      card.className = `theme-card ${currentTheme === key ? 'active' : ''}`;
      card.setAttribute('data-theme', key);
      
      card.innerHTML = `
        <div class="theme-preview" style="background: ${t.bg}; color: ${t.color}; border: 1px solid ${t.accent}; font-family: ${t.font}; text-transform: ${t.textTransform};">
          ${t.name}
        </div>
      `;
      
      card.addEventListener('click', () => {
        document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        currentTheme = key;
        updatePreview();
      });
      
      elements.themesGrid.appendChild(card);
    }
  }

  function renderProductInputs() {
    elements.productsList.innerHTML = '';
    products.forEach((p, index) => {
      const entry = document.createElement('div');
      entry.className = 'product-entry';
      entry.innerHTML = `
        <button class="remove-product" data-id="${p.id}" title="Remove">✕</button>
        <div style="font-weight: 600; font-size: 0.8rem; margin-bottom: 0.5rem; color: var(--text-tertiary);">Product ${index + 1}</div>
        
        <input type="text" class="form-input p-img" data-id="${p.id}" value="${p.image}" placeholder="Image URL" style="margin-bottom: 0.5rem;">
        
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem;">
          <input type="text" class="form-input p-name" data-id="${p.id}" value="${p.name}" placeholder="Product Name">
          <input type="text" class="form-input p-price" data-id="${p.id}" value="${p.price}" placeholder="Price">
        </div>
        
        <textarea class="form-input p-desc" data-id="${p.id}" rows="2" placeholder="Short description...">${p.description}</textarea>
      `;
      elements.productsList.appendChild(entry);
    });

    // Bind listeners
    document.querySelectorAll('.remove-product').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'));
        products = products.filter(item => item.id !== id);
        renderProductInputs();
        updatePreview();
      });
    });

    document.querySelectorAll('.p-img, .p-name, .p-price, .p-desc').forEach(input => {
      input.addEventListener('input', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        const p = products.find(item => item.id === id);
        if (p) {
          if (e.target.classList.contains('p-img')) p.image = e.target.value;
          if (e.target.classList.contains('p-name')) p.name = e.target.value;
          if (e.target.classList.contains('p-price')) p.price = e.target.value;
          if (e.target.classList.contains('p-desc')) p.description = e.target.value;
          updatePreview();
        }
      });
    });
  }

  function updatePreview() {
    const brand = elements.brandName.value || 'BRAND';
    const collection = elements.collectionTitle.value || 'Collection';
    const theme = THEMES[currentTheme];

    // Build Cover Page
    let html = `
      <div class="lux-page" style="width: 100%; height: 297mm; display: flex; flex-direction: column; justify-content: center; align-items: ${theme.coverAlign}; padding: 40mm; background: ${theme.bg}; color: ${theme.color}; font-family: ${theme.font}; box-sizing: border-box;">
        <h1 style="font-size: 4rem; letter-spacing: 10px; margin: 0 0 1rem 0; text-transform: ${theme.textTransform}; font-weight: 400;">${brand}</h1>
        <div style="width: 50px; height: 1px; background: ${theme.accent}; margin: 0 0 2rem 0;"></div>
        <h2 style="font-size: 1.5rem; font-weight: 300; letter-spacing: 2px; color: ${theme.color}; opacity: 0.8;">${collection}</h2>
      </div>
    `;

    // Build Product Pages (2 per page)
    for (let i = 0; i < products.length; i += 2) {
      const p1 = products[i];
      const p2 = products[i + 1];

      html += `
        <div class="lux-page" style="width: 100%; height: 297mm; padding: 20mm; background: ${theme.bg}; color: ${theme.color}; font-family: ${theme.font}; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between;">
          <div style="font-size: 0.7rem; letter-spacing: 3px; text-transform: uppercase; opacity: 0.5; text-align: center;">${brand} &mdash; ${collection}</div>
          
          <div style="flex: 1; display: flex; flex-direction: column; margin-top: 10mm; gap: 20mm;">
            <!-- Product 1 -->
            <div style="flex: 1; display: flex; gap: 10mm; align-items: center;">
              <div style="flex: 1; height: 100%; background-image: url('${p1.image}'); background-size: cover; background-position: center; border: 1px solid ${theme.accent};"></div>
              <div style="flex: 1; padding: 20px;">
                <h3 style="font-size: 1.5rem; margin: 0 0 0.5rem 0; font-weight: 400; text-transform: ${theme.textTransform};">${p1.name}</h3>
                <div style="font-size: 1.2rem; margin-bottom: 1rem; opacity: 0.8;">${p1.price}</div>
                <p style="font-size: 0.9rem; line-height: 1.6; opacity: 0.7; max-width: 80%;">${p1.description}</p>
              </div>
            </div>
            
            <!-- Product 2 -->
            ${p2 ? `
            <div style="flex: 1; display: flex; gap: 10mm; align-items: center; flex-direction: row-reverse;">
              <div style="flex: 1; height: 100%; background-image: url('${p2.image}'); background-size: cover; background-position: center; border: 1px solid ${theme.accent};"></div>
              <div style="flex: 1; padding: 20px; text-align: right;">
                <h3 style="font-size: 1.5rem; margin: 0 0 0.5rem 0; font-weight: 400; text-transform: ${theme.textTransform};">${p2.name}</h3>
                <div style="font-size: 1.2rem; margin-bottom: 1rem; opacity: 0.8;">${p2.price}</div>
                <p style="font-size: 0.9rem; line-height: 1.6; opacity: 0.7; max-width: 80%; margin-left: auto;">${p2.description}</p>
              </div>
            </div>
            ` : '<div style="flex: 1;"></div>'}
          </div>
          
          <div style="font-size: 0.7rem; opacity: 0.5; text-align: center;">${(i/2) + 1}</div>
        </div>
      `;
    }

    elements.preview.innerHTML = html;
  }

  // Event Listeners
  elements.brandName.addEventListener('input', updatePreview);
  elements.collectionTitle.addEventListener('input', updatePreview);

  elements.addBtn.addEventListener('click', () => {
    products.push({
      id: Date.now(),
      image: 'https://images.unsplash.com/photo-1618365908648-e71bd5716cba?auto=format&fit=crop&w=800&q=80',
      name: 'New Product',
      price: '$0.00',
      description: 'Product description goes here.'
    });
    renderProductInputs();
    updatePreview();
  });

  elements.printBtn.addEventListener('click', () => {
    window.print();
  });

  // Init
  renderThemes();
  renderProductInputs();
  updatePreview();
});
