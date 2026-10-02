// Luxury Catalog Builder Logic
// Handles lookbook creation, image management, luxury item curation, and export/print functionality

const INITIAL_CATALOG = [
  {
    id: 'item-101',
    brand: 'Maison Aurum',
    collection: 'Sovereign Winter 2026',
    title: 'Celestial Tourbillon Chronograph',
    sku: 'MA-WAT-2026-01',
    currency: '$',
    price: 84500,
    category: 'Timepieces',
    edition: 'Limited Edition (1 of 25)',
    craftsmanship: 'Hand-finished flying tourbillon carriage. 18K solid rose gold case with hand-guilloché obsidian dial and alligator leather strap hand-stitched in Geneva.',
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'item-102',
    brand: 'Maison Aurum',
    collection: 'Sovereign Winter 2026',
    title: 'L\'Étoile Emerald & Diamond Solitaire',
    sku: 'MA-JWL-2026-04',
    currency: '$',
    price: 62000,
    category: 'Haute Joaillerie',
    edition: 'Bespoke Made-to-Order',
    craftsmanship: '5.2-carat untreated Colombian emerald centerpiece framed by 36 micro-pavé round brilliant diamonds (D-color, VVS1 clarity) set in 950 platinum.',
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'item-103',
    brand: 'Maison Aurum',
    collection: 'Heritage Voyage',
    title: 'Grand Atelier Weekend Holdall',
    sku: 'MA-LEA-2026-09',
    currency: '$',
    price: 6800,
    category: 'Leather Goods',
    edition: 'Permanent Collection',
    craftsmanship: 'Full-grain Tuscan bridle calfskin, saddle-stitched by hand with beeswaxed linen thread. Solid hand-burnished brass hardware with velvet suede lining.',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'item-104',
    brand: 'Maison Aurum',
    collection: 'Haute Parfumerie',
    title: 'Oud Royale Extrait de Parfum',
    sku: 'MA-FRG-2026-12',
    currency: '$',
    price: 1200,
    category: 'Fragrance',
    edition: 'Atelier Reserve',
    craftsmanship: 'Wild Cambodian aged agarwood distillation aged for 12 years, combined with Bulgarian Damask rose absolute, encased in hand-blown crystal with 24K gold foil stopper.',
    imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80'
  }
];

const PRESET_IMAGES = {
  watch: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
  bag: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
  jewelry: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80',
  perfume: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80',
  fashion: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80'
};

document.addEventListener('DOMContentLoaded', () => {
  // State
  let catalog = [];
  try {
    const saved = localStorage.getItem('luxury_catalog_items');
    catalog = saved ? JSON.parse(saved) : [...INITIAL_CATALOG];
  } catch (e) {
    catalog = [...INITIAL_CATALOG];
  }

  // Elements
  const form = document.getElementById('item-form');
  const editItemIdInput = document.getElementById('edit-item-id');
  const formActionTitle = document.getElementById('form-action-title');
  const btnSaveLabel = document.getElementById('btn-save-label');
  const btnCancelEdit = document.getElementById('btn-cancel-edit');

  const brandInput = document.getElementById('item-brand');
  const collectionInput = document.getElementById('item-collection');
  const titleInput = document.getElementById('item-title');
  const skuInput = document.getElementById('item-sku');
  const btnGenSku = document.getElementById('btn-gen-sku');
  const currencyInput = document.getElementById('item-currency');
  const priceInput = document.getElementById('item-price');
  const categoryInput = document.getElementById('item-category');
  const editionInput = document.getElementById('item-edition');
  const craftsmanshipInput = document.getElementById('item-craftsmanship');
  const imageUrlInput = document.getElementById('item-image-url');

  const imgDropzone = document.getElementById('img-dropzone');
  const fileInput = document.getElementById('item-file-input');
  const imgPreview = document.getElementById('img-preview');
  const imgPromptText = document.getElementById('img-prompt-text');

  // Stats Elements
  const statsTotalItems = document.getElementById('stats-total-items');
  const statsTotalVal = document.getElementById('stats-total-val');
  const statsAvgVal = document.getElementById('stats-avg-val');
  const statsBrandName = document.getElementById('stats-brand-name');

  // Lookbook Elements
  const cardsContainer = document.getElementById('lookbook-cards-container');
  const searchInput = document.getElementById('catalog-search');
  const filterCategory = document.getElementById('catalog-filter-category');

  // Actions
  const btnPrint = document.getElementById('btn-print-catalog');
  const btnExportJson = document.getElementById('btn-export-json');
  const importJsonInput = document.getElementById('import-json-input');

  // Modal Elements
  const modal = document.getElementById('item-modal');
  const modalContentBody = document.getElementById('modal-content-body');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  // Material Chips
  const materialChips = document.querySelectorAll('.material-chip');
  const imgPresetBtns = document.querySelectorAll('.img-preset-btn');

  let currentImageData = '';

  // Helper: Format Money
  function formatMoney(amount, currency = '$') {
    return `${currency}${Number(amount || 0).toLocaleString('en-US')}`;
  }

  // Helper: Save Catalog
  function saveCatalog() {
    try {
      localStorage.setItem('luxury_catalog_items', JSON.stringify(catalog));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
    updateStats();
    renderCards();
  }

  // Update Stats Bar
  function updateStats() {
    statsTotalItems.textContent = catalog.length;
    if (catalog.length === 0) {
      statsTotalVal.textContent = '$0';
      statsAvgVal.textContent = '$0';
      statsBrandName.textContent = 'Maison Aurum';
      return;
    }

    const firstBrand = catalog[0]?.brand || 'Maison Aurum';
    statsBrandName.textContent = firstBrand;

    const total = catalog.reduce((acc, item) => acc + (parseFloat(item.price) || 0), 0);
    const avg = total / catalog.length;

    const curr = catalog[0]?.currency || '$';
    statsTotalVal.textContent = formatMoney(total, curr);
    statsAvgVal.textContent = formatMoney(avg, curr);
  }

  // Update Image Preview
  function setImagePreview(url) {
    currentImageData = url || '';
    if (url) {
      imgPreview.src = url;
      imgPreview.style.display = 'block';
      imgPromptText.style.display = 'none';
      imageUrlInput.value = url.startsWith('data:') ? '' : url;
    } else {
      imgPreview.src = '';
      imgPreview.style.display = 'none';
      imgPromptText.style.display = 'flex';
    }
  }

  // File Upload Handlers
  imgDropzone.addEventListener('click', () => fileInput.click());

  imgDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    imgDropzone.classList.add('drag-over');
  });

  imgDropzone.addEventListener('dragleave', () => {
    imgDropzone.classList.remove('drag-over');
  });

  imgDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    imgDropzone.classList.remove('drag-over');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });

  function handleFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  imageUrlInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    if (val) {
      setImagePreview(val);
    }
  });

  // Preset Image Buttons
  imgPresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.img;
      const url = PRESET_IMAGES[type];
      if (url) {
        setImagePreview(url);
        imageUrlInput.value = url;
      }
    });
  });

  // Material Chips Click
  materialChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const textToInsert = chip.dataset.insert;
      if (!textToInsert) return;
      const cur = craftsmanshipInput.value.trim();
      craftsmanshipInput.value = cur ? `${cur}, ${textToInsert}` : textToInsert;
      craftsmanshipInput.focus();
    });
  });

  // SKU Auto-generator
  function generateSKU() {
    const brandCode = (brandInput.value || 'MA').substring(0, 2).toUpperCase();
    const catCode = (categoryInput.value || 'ITM').substring(0, 3).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${brandCode}-${catCode}-2026-${randomNum}`;
  }

  btnGenSku.addEventListener('click', () => {
    skuInput.value = generateSKU();
  });

  // Edit Item Form Loader
  function loadItemForEdit(itemId) {
    const item = catalog.find(i => i.id === itemId);
    if (!item) return;

    editItemIdInput.value = item.id;
    brandInput.value = item.brand || '';
    collectionInput.value = item.collection || '';
    titleInput.value = item.title || '';
    skuInput.value = item.sku || '';
    currencyInput.value = item.currency || '$';
    priceInput.value = item.price || '';
    categoryInput.value = item.category || 'Timepieces';
    editionInput.value = item.edition || 'Limited Edition (1 of 25)';
    craftsmanshipInput.value = item.craftsmanship || '';
    setImagePreview(item.imageUrl || '');

    formActionTitle.textContent = 'Edit Luxury Piece';
    btnSaveLabel.textContent = 'Update Piece Details';
    btnCancelEdit.style.display = 'inline-flex';

    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function resetForm() {
    form.reset();
    editItemIdInput.value = '';
    formActionTitle.textContent = 'Add Luxury Piece';
    btnSaveLabel.textContent = 'Add Piece to Catalog';
    btnCancelEdit.style.display = 'none';
    setImagePreview('');
    brandInput.value = 'Maison Aurum';
    collectionInput.value = 'Sovereign Winter 2026';
    skuInput.value = generateSKU();
  }

  btnCancelEdit.addEventListener('click', resetForm);

  // Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const brand = brandInput.value.trim() || 'Maison Aurum';
    const collection = collectionInput.value.trim() || 'Signature Collection';
    const sku = skuInput.value.trim() || generateSKU();
    const price = parseFloat(priceInput.value) || 0;
    const currency = currencyInput.value || '$';
    const category = categoryInput.value;
    const edition = editionInput.value;
    const craftsmanship = craftsmanshipInput.value.trim();
    const imageUrl = currentImageData || PRESET_IMAGES.watch;

    const editId = editItemIdInput.value;

    if (editId) {
      // Update
      const index = catalog.findIndex(i => i.id === editId);
      if (index !== -1) {
        catalog[index] = {
          ...catalog[index],
          title, brand, collection, sku, price, currency, category, edition, craftsmanship, imageUrl
        };
      }
    } else {
      // Create new
      const newItem = {
        id: 'item-' + Date.now(),
        brand, collection, title, sku, price, currency, category, edition, craftsmanship, imageUrl
      };
      catalog.unshift(newItem);
    }

    saveCatalog();
    resetForm();
  });

  // Delete Item
  function deleteItem(itemId) {
    if (confirm('Are you sure you want to remove this piece from the catalog?')) {
      catalog = catalog.filter(i => i.id !== itemId);
      saveCatalog();
      if (editItemIdInput.value === itemId) {
        resetForm();
      }
    }
  }

  // Duplicate Item
  function duplicateItem(itemId) {
    const item = catalog.find(i => i.id === itemId);
    if (!item) return;

    const duplicated = {
      ...item,
      id: 'item-' + Date.now(),
      title: `${item.title} (Copy)`,
      sku: `${item.sku}-DUP`
    };

    catalog.unshift(duplicated);
    saveCatalog();
  }

  // Open Modal Details
  function openModal(item) {
    modalContentBody.innerHTML = `
      <div style="width: 100%; aspect-ratio: 16/9; background: #000; overflow: hidden; border-radius: var(--radius-lg) var(--radius-lg) 0 0;">
        <img src="${item.imageUrl}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;">
      </div>
      <div style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.15em; color: var(--gold-accent); font-weight: 700;">
              ${item.brand} &bull; ${item.collection}
            </div>
            <h2 style="font-family: var(--font-display); font-size: 2rem; font-weight: 700; color: var(--text-primary); margin-top: 0.25rem;">
              ${item.title}
            </h2>
          </div>
          <div style="font-family: var(--font-display); font-size: 2rem; font-weight: 800; color: var(--gold-accent);">
            ${formatMoney(item.price, item.currency)}
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <span class="badge" style="background: rgba(212, 175, 55, 0.15); color: var(--gold-accent); border-color: rgba(212, 175, 55, 0.3);">
            ${item.edition}
          </span>
          <span class="badge" style="background: var(--bg-tertiary); color: var(--text-secondary);">
            SKU: ${item.sku}
          </span>
          <span class="badge" style="background: var(--bg-tertiary); color: var(--text-secondary);">
            Category: ${item.category}
          </span>
        </div>

        <div style="border-top: 1px solid var(--border); padding-top: 1rem;">
          <h4 style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-tertiary); margin-bottom: 0.5rem;">
            Craftsmanship &amp; Provenance
          </h4>
          <p style="font-size: 0.95rem; line-height: 1.7; color: var(--text-secondary); white-space: pre-wrap;">
            ${item.craftsmanship || 'Master atelier provenance with certified luxury quality guarantee.'}
          </p>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; border-top: 1px solid var(--border); padding-top: 1rem;">
          <button type="button" class="btn btn-secondary modal-edit-btn" data-id="${item.id}">Edit Piece</button>
          <button type="button" class="btn btn-primary modal-close-action">Close</button>
        </div>
      </div>
    `;

    modal.classList.add('active');

    modalContentBody.querySelector('.modal-edit-btn').addEventListener('click', () => {
      modal.classList.remove('active');
      loadItemForEdit(item.id);
    });

    modalContentBody.querySelector('.modal-close-action').addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  modalCloseBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      modal.classList.remove('active');
    }
  });

  // Render Lookbook Cards
  function renderCards() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const catFilter = filterCategory.value;

    const filtered = catalog.filter(item => {
      const matchCat = catFilter === 'ALL' || item.category === catFilter;
      const matchSearch = !searchTerm ||
        item.title.toLowerCase().includes(searchTerm) ||
        item.brand.toLowerCase().includes(searchTerm) ||
        item.collection.toLowerCase().includes(searchTerm) ||
        item.sku.toLowerCase().includes(searchTerm) ||
        (item.craftsmanship && item.craftsmanship.toLowerCase().includes(searchTerm));
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      cardsContainer.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 3rem; text-align: center; background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px dashed var(--border);">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">✨</div>
          <h3 style="font-family: var(--font-display); font-size: 1.5rem; margin-bottom: 0.5rem;">No Pieces Found</h3>
          <p style="color: var(--text-secondary); font-size: 0.9rem;">Try adjusting your search criteria or add new luxury pieces to your lookbook.</p>
        </div>
      `;
      return;
    }

    cardsContainer.innerHTML = filtered.map(item => `
      <div class="luxury-card" data-id="${item.id}">
        <div class="luxury-card-media">
          <span class="luxury-card-badge">${item.edition}</span>
          <span class="luxury-card-sku">${item.sku}</span>
          <img src="${item.imageUrl}" alt="${item.title}" loading="lazy" onerror="this.src='${PRESET_IMAGES.watch}'">
        </div>
        <div class="luxury-card-body">
          <div class="luxury-collection-name">${item.brand} &bull; ${item.collection}</div>
          <h3 class="luxury-item-title">${item.title}</h3>
          <div class="luxury-item-price">${formatMoney(item.price, item.currency)}</div>
          <p class="luxury-item-details">${item.craftsmanship || 'Handcrafted bespoke piece with master atelier provenance.'}</p>
          <div class="luxury-card-actions">
            <button type="button" class="card-action-btn view-btn" data-id="${item.id}" title="Inspect Details">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              Inspect
            </button>
            <button type="button" class="card-action-btn edit-btn" data-id="${item.id}" title="Edit Piece">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              Edit
            </button>
            <button type="button" class="card-action-btn dup-btn" data-id="${item.id}" title="Duplicate Piece">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              Duplicate
            </button>
            <button type="button" class="card-action-btn delete-btn" data-id="${item.id}" title="Remove Piece">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Attach Event Handlers
    cardsContainer.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = catalog.find(i => i.id === btn.dataset.id);
        if (item) openModal(item);
      });
    });

    cardsContainer.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => loadItemForEdit(btn.dataset.id));
    });

    cardsContainer.querySelectorAll('.dup-btn').forEach(btn => {
      btn.addEventListener('click', () => duplicateItem(btn.dataset.id));
    });

    cardsContainer.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteItem(btn.dataset.id));
    });
  }

  // Filter & Search Listeners
  searchInput.addEventListener('input', renderCards);
  filterCategory.addEventListener('change', renderCards);

  // Print Lookbook
  btnPrint.addEventListener('click', () => {
    window.print();
  });

  // Export JSON
  btnExportJson.addEventListener('click', () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(catalog, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'luxury_lookbook_catalog.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  // Import JSON
  importJsonInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed) && parsed.length > 0) {
          catalog = parsed;
          saveCatalog();
          alert(`Successfully imported ${parsed.length} luxury items!`);
        } else {
          alert('Invalid catalog format. Expected an array of catalog items.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    importJsonInput.value = '';
  });

  // Initial Load
  skuInput.value = generateSKU();
  updateStats();
  renderCards();
});