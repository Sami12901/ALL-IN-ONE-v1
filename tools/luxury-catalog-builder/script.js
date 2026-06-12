document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    brandName: document.getElementById('brand-name'),
    collectionTitle: document.getElementById('collection-title'),
    themeCards: document.querySelectorAll('.theme-card'),
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
    minimalist: {
      bg: '#ffffff',
      color: '#111111',
      font: 'Helvetica Neue, Helvetica, Arial, sans-serif',
      accent: '#dddddd',
      coverAlign: 'center',
      textTransform: 'uppercase'
    },
    noir: {
      bg: '#111111',
      color: '#ffffff',
      font: 'Playfair Display, Georgia, serif',
      accent: '#333333',
      coverAlign: 'center',
      textTransform: 'none'
    },
    heritage: {
      bg: '#fdfbf7',
      color: '#3b3a36',
      font: 'Garamond, Baskerville, serif',
      accent: '#d4cbb8',
      coverAlign: 'left',
      textTransform: 'uppercase'
    },
    avant: {
      bg: '#e9ecef',
      color: '#212529',
      font: 'Courier New, monospace',
      accent: '#212529',
      coverAlign: 'right',
      textTransform: 'lowercase'
    }
  };

  function renderProductInputs() {
    elements.productsList.innerHTML = '';
    products.forEach((p, index) => {
      const entry = document.createElement('div');
      entry.className = 'product-entry';
      entry.innerHTML = `
        <button class="remove-product" data-id="${p.id}" title="Remove">✕</button>
        <div style="font-weight: 600; font-size: 0.8rem; margin-bottom: 0.5rem; color: var(--text-tertiary);">Product ${index + 1}</div>
        
        <input type="text" class="input-element p-img" data-id="${p.id}" value="${p.image}" placeholder="Image URL" style="margin-bottom: 0.5rem;">
        
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem;">
          <input type="text" class="input-element p-name" data-id="${p.id}" value="${p.name}" placeholder="Product Name">
          <input type="text" class="input-element p-price" data-id="${p.id}" value="${p.price}" placeholder="Price">
        </div>
        
        <textarea class="input-element p-desc" data-id="${p.id}" rows="2" placeholder="Short description...">${p.description}</textarea>
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

  elements.themeCards.forEach(card => {
    card.addEventListener('click', () => {
      elements.themeCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      currentTheme = card.getAttribute('data-theme');
      updatePreview();
    });
  });

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
  renderProductInputs();
  updatePreview();
});
