// Product Catalog Generator - Interactive Catalog Builder & Print Engine

const STORAGE_KEY = 'product_catalog_items';

const SAMPLE_CATALOG = [
  {
    id: 'cat-1',
    title: 'AeroCraft Precision Mechanical Chronograph',
    sku: 'WATCH-AC-401',
    price: 349.00,
    salePrice: 289.00,
    category: 'Timepieces',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    description: 'Swiss-inspired mechanical movement with sapphire crystal glass and hand-stitched Italian leather strap.',
    stockStatus: 'in_stock',
    addedAt: Date.now() - 500000
  },
  {
    id: 'cat-2',
    title: 'Nordic Artisan Matte Ceramic Coffee Dripper',
    sku: 'HOME-CER-02',
    price: 52.00,
    salePrice: null,
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    description: 'Double-fired stoneware pour-over dripper calibrated for optimal thermal retention and slow brew extraction.',
    stockStatus: 'in_stock',
    addedAt: Date.now() - 400000
  },
  {
    id: 'cat-3',
    title: 'Solstice Noise-Isolating Studio Headphones',
    sku: 'AUDIO-SOL-99',
    price: 199.00,
    salePrice: 159.00,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    description: 'Precision beryllium dynamic drivers with plush memory foam ear cushions and detachable oxygen-free copper cable.',
    stockStatus: 'pre_order',
    addedAt: Date.now() - 300000
  },
  {
    id: 'cat-4',
    title: 'Vanguard Full-Grain Leather Weekender Duffel',
    sku: 'BAG-LDR-77',
    price: 420.00,
    salePrice: null,
    category: 'Travel & Bags',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    description: 'Handcrafted vegetable-tanned leather bag featuring solid brass hardware and reinforced weatherproof base.',
    stockStatus: 'out_of_stock',
    addedAt: Date.now() - 200000
  },
  {
    id: 'cat-5',
    title: 'Zenith Minimalist Titanium Fountain Pen',
    sku: 'PEN-ZEN-01',
    price: 115.00,
    salePrice: 95.00,
    category: 'Stationery',
    image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80',
    description: 'CNC machined grade-5 titanium writing instrument with custom ruthenium nib and balanced ergonomic weight.',
    stockStatus: 'in_stock',
    addedAt: Date.now() - 100000
  },
  {
    id: 'cat-6',
    title: 'Aura Ambient Smart LED Desk Lamp',
    sku: 'LMP-AUR-55',
    price: 145.00,
    salePrice: null,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
    description: 'Circadian rhythm smart illumination with wireless phone charging pedestal and anodized brushed finish.',
    stockStatus: 'in_stock',
    addedAt: Date.now()
  }
];

let catalog = [];
let currentViewMode = 'grid'; // 'grid' | 'list'

function loadCatalog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      catalog = JSON.parse(raw);
    } else {
      catalog = [...SAMPLE_CATALOG];
      saveCatalog();
    }
  } catch (err) {
    console.error('Failed to parse catalog from storage:', err);
    catalog = [...SAMPLE_CATALOG];
  }
}

function saveCatalog() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(catalog));
  } catch (err) {
    console.error('Failed to save catalog:', err);
  }
}

function getCurrencySymbol() {
  const code = document.getElementById('catalog-currency')?.value || 'USD';
  switch (code) {
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'JPY': return '¥';
    default: return '$';
  }
}

function formatPrice(amount) {
  const code = document.getElementById('catalog-currency')?.value || 'USD';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code,
    minimumFractionDigits: code === 'JPY' ? 0 : 2
  }).format(amount);
}

function populateCategories() {
  const select = document.getElementById('catalog-category-filter');
  if (!select) return;

  const currentSelection = select.value;
  const categories = Array.from(new Set(catalog.map(c => (c.category || '').trim()).filter(Boolean))).sort();

  select.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    if (cat === currentSelection) opt.selected = true;
    select.appendChild(opt);
  });
}

function renderCatalog() {
  const container = document.getElementById('catalog-container');
  const emptyState = document.getElementById('catalog-empty-state');
  const countLabel = document.getElementById('catalog-count-label');
  const totalValueLabel = document.getElementById('catalog-total-value');
  if (!container) return;

  const searchQuery = (document.getElementById('catalog-search')?.value || '').toLowerCase().trim();
  const selectedCategory = document.getElementById('catalog-category-filter')?.value || 'all';
  const sortMode = document.getElementById('catalog-sort')?.value || 'price-asc';

  let filtered = catalog.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }
    if (searchQuery) {
      const matchTitle = (item.title || '').toLowerCase().includes(searchQuery);
      const matchSku = (item.sku || '').toLowerCase().includes(searchQuery);
      const matchDesc = (item.description || '').toLowerCase().includes(searchQuery);
      const matchCat = (item.category || '').toLowerCase().includes(searchQuery);
      if (!matchTitle && !matchSku && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  // Sorting
  filtered.sort((a, b) => {
    const effectivePriceA = a.salePrice != null && a.salePrice > 0 ? a.salePrice : a.price;
    const effectivePriceB = b.salePrice != null && b.salePrice > 0 ? b.salePrice : b.price;

    if (sortMode === 'price-asc') return effectivePriceA - effectivePriceB;
    if (sortMode === 'price-desc') return effectivePriceB - effectivePriceA;
    if (sortMode === 'title-asc') return (a.title || '').localeCompare(b.title || '');
    if (sortMode === 'newest') return (b.addedAt || 0) - (a.addedAt || 0);
    return 0;
  });

  // Update Stats
  if (countLabel) countLabel.textContent = `Showing ${filtered.length} of ${catalog.length} products`;
  let catalogVal = filtered.reduce((acc, curr) => acc + (curr.salePrice != null && curr.salePrice > 0 ? curr.salePrice : curr.price), 0);
  if (totalValueLabel) totalValueLabel.textContent = `Filtered Collection Value: ${formatPrice(catalogVal)}`;

  container.className = currentViewMode === 'list' ? 'catalog-list' : 'catalog-grid';
  container.innerHTML = '';

  if (filtered.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }
  if (emptyState) emptyState.classList.add('hidden');

  filtered.forEach(item => {
    const hasSale = item.salePrice != null && item.salePrice > 0 && item.salePrice < item.price;
    const effectivePrice = hasSale ? item.salePrice : item.price;

    // Badges
    let stockBadgeHtml = '';
    if (item.stockStatus === 'in_stock') {
      stockBadgeHtml = `<span class="badge-stock badge-instock">In Stock</span>`;
    } else if (item.stockStatus === 'pre_order') {
      stockBadgeHtml = `<span class="badge-stock badge-preorder">Pre-order</span>`;
    } else {
      stockBadgeHtml = `<span class="badge-stock badge-outofstock">Out of Stock</span>`;
    }

    const saleBadgeHtml = hasSale ? `<span class="badge-sale">SALE</span>` : '';

    const defaultImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%231f242d'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%2389aacc'%3EProduct Image%3C/text%3E%3C/svg%3E";
    const imgSrc = item.image && item.image.trim() ? item.image : defaultImg;

    const card = document.createElement('div');
    card.className = 'catalog-card';
    card.dataset.id = item.id;

    card.innerHTML = `
      <div class="card-img-wrap">
        <div class="card-badge-wrap">
          ${saleBadgeHtml}
          ${stockBadgeHtml}
        </div>
        <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(item.title)}" loading="lazy" onerror="this.src='${defaultImg}'">
      </div>
      <div class="card-content">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="card-category">${escapeHtml(item.category || 'General')}</span>
          <span class="card-sku">${escapeHtml(item.sku || '')}</span>
        </div>
        <h3 class="card-title">${escapeHtml(item.title)}</h3>
        <p class="card-description">${escapeHtml(item.description || 'No description provided.')}</p>
        <div class="card-pricing">
          <span class="current-price">${formatPrice(effectivePrice)}</span>
          ${hasSale ? `<span class="original-price">${formatPrice(item.price)}</span>` : ''}
        </div>
        <div class="card-actions">
          <button type="button" class="btn btn-secondary btn-edit-catalog" data-id="${item.id}" style="padding: 0.35rem 0.65rem; font-size: 0.8rem;" title="Edit Product">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            Edit
          </button>
          <button type="button" class="btn btn-secondary btn-delete-catalog" data-id="${item.id}" style="padding: 0.35rem 0.65rem; font-size: 0.8rem; color: var(--error);" title="Delete Product">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Modal open/close
function openCatalogModal(productId = null) {
  const modal = document.getElementById('catalog-modal');
  const title = document.getElementById('catalog-modal-title');
  const form = document.getElementById('catalog-form');
  const editId = document.getElementById('edit-catalog-id');

  if (!modal || !form) return;

  if (productId) {
    const item = catalog.find(p => p.id === productId);
    if (!item) return;
    title.textContent = 'Edit Catalog Product';
    editId.value = item.id;
    document.getElementById('cat-title').value = item.title;
    document.getElementById('cat-sku').value = item.sku;
    document.getElementById('cat-category').value = item.category;
    document.getElementById('cat-status').value = item.stockStatus;
    document.getElementById('cat-price').value = item.price;
    document.getElementById('cat-sale-price').value = item.salePrice != null ? item.salePrice : '';
    document.getElementById('cat-image').value = item.image || '';
    document.getElementById('cat-description').value = item.description || '';
  } else {
    title.textContent = 'Add Catalog Product';
    form.reset();
    editId.value = '';
    document.getElementById('cat-status').value = 'in_stock';
  }

  modal.classList.add('active');
}

function closeCatalogModal() {
  const modal = document.getElementById('catalog-modal');
  if (modal) modal.classList.remove('active');
}

function handleSaveCatalog(e) {
  e.preventDefault();
  const editId = document.getElementById('edit-catalog-id').value;
  const title = document.getElementById('cat-title').value.trim();
  const sku = document.getElementById('cat-sku').value.trim();
  const category = document.getElementById('cat-category').value.trim() || 'General';
  const stockStatus = document.getElementById('cat-status').value;
  const price = parseFloat(document.getElementById('cat-price').value) || 0;
  const salePriceRaw = document.getElementById('cat-sale-price').value.trim();
  const salePrice = salePriceRaw ? parseFloat(salePriceRaw) : null;
  const image = document.getElementById('cat-image').value.trim();
  const description = document.getElementById('cat-description').value.trim();

  if (!title || !sku || !price) {
    alert('Please enter title, SKU, and regular price.');
    return;
  }

  if (editId) {
    const idx = catalog.findIndex(p => p.id === editId);
    if (idx !== -1) {
      catalog[idx] = {
        ...catalog[idx],
        title,
        sku,
        category,
        stockStatus,
        price,
        salePrice,
        image,
        description
      };
    }
  } else {
    const newProduct = {
      id: 'cat-' + Date.now(),
      title,
      sku,
      category,
      stockStatus,
      price,
      salePrice,
      image,
      description,
      addedAt: Date.now()
    };
    catalog.unshift(newProduct);
  }

  saveCatalog();
  populateCategories();
  renderCatalog();
  closeCatalogModal();
}

// JSON Export & Import
function exportJSON() {
  if (catalog.length === 0) {
    alert('Catalog is empty. Nothing to export.');
    return;
  }

  const exportData = {
    generatedAt: new Date().toISOString(),
    currency: document.getElementById('catalog-currency')?.value || 'USD',
    itemCount: catalog.length,
    products: catalog
  };

  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `product_catalog_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function handleJSONImport(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      const items = Array.isArray(data) ? data : (data.products || []);
      if (!Array.isArray(items) || items.length === 0) {
        alert('No valid product array found in JSON file.');
        return;
      }

      if (confirm(`Import ${items.length} items from JSON? Click OK to replace current catalog, Cancel to append.`)) {
        catalog = items;
      } else {
        catalog = [...items, ...catalog];
      }

      saveCatalog();
      populateCategories();
      renderCatalog();
      alert(`Imported ${items.length} items successfully.`);
    } catch (err) {
      console.error('Error importing JSON:', err);
      alert('Invalid JSON file format.');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

// Setup Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  loadCatalog();
  populateCategories();
  renderCatalog();

  // Search, Category, Sort, Currency changes
  document.getElementById('catalog-search')?.addEventListener('input', renderCatalog);
  document.getElementById('catalog-category-filter')?.addEventListener('change', renderCatalog);
  document.getElementById('catalog-sort')?.addEventListener('change', renderCatalog);
  document.getElementById('catalog-currency')?.addEventListener('change', renderCatalog);

  // View toggle buttons
  const btnGrid = document.getElementById('btn-view-grid');
  const btnList = document.getElementById('btn-view-list');

  btnGrid?.addEventListener('click', () => {
    currentViewMode = 'grid';
    btnGrid.classList.add('active');
    btnList?.classList.remove('active');
    renderCatalog();
  });

  btnList?.addEventListener('click', () => {
    currentViewMode = 'list';
    btnList.classList.add('active');
    btnGrid?.classList.remove('active');
    renderCatalog();
  });

  // Add Product modal
  document.getElementById('btn-add-product')?.addEventListener('click', () => openCatalogModal());
  document.getElementById('close-catalog-modal')?.addEventListener('click', closeCatalogModal);
  document.getElementById('cancel-catalog-modal')?.addEventListener('click', closeCatalogModal);
  document.getElementById('catalog-form')?.addEventListener('submit', handleSaveCatalog);

  // Image file upload
  const fileImgInput = document.getElementById('cat-file-img');
  document.getElementById('btn-upload-img')?.addEventListener('click', () => fileImgInput?.click());
  fileImgInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Image file is larger than 2MB. Please select a smaller image or use an image URL.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const urlInput = document.getElementById('cat-image');
      if (urlInput && ev.target?.result) {
        urlInput.value = ev.target.result;
      }
    };
    reader.readAsDataURL(file);
  });

  // Print button
  document.getElementById('btn-print-catalog')?.addEventListener('click', () => {
    window.print();
  });

  // Export & Import JSON
  document.getElementById('btn-export-json')?.addEventListener('click', exportJSON);
  const jsonFileInput = document.getElementById('json-file-input');
  document.getElementById('btn-import-json')?.addEventListener('click', () => jsonFileInput?.click());
  jsonFileInput?.addEventListener('change', handleJSONImport);

  // Sample data button
  document.getElementById('btn-sample-catalog')?.addEventListener('click', () => {
    if (confirm('Reset to sample luxury product catalog? Custom edits will be overwritten.')) {
      catalog = JSON.parse(JSON.stringify(SAMPLE_CATALOG));
      saveCatalog();
      populateCategories();
      renderCatalog();
    }
  });

  // Delegated card actions (Edit & Delete)
  const container = document.getElementById('catalog-container');
  if (container) {
    container.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.btn-edit-catalog');
      if (editBtn) {
        const id = editBtn.dataset.id;
        openCatalogModal(id);
        return;
      }

      const delBtn = e.target.closest('.btn-delete-catalog');
      if (delBtn) {
        const id = delBtn.dataset.id;
        const item = catalog.find(p => p.id === id);
        if (item && confirm(`Delete "${item.title}" from catalog?`)) {
          catalog = catalog.filter(p => p.id !== id);
          saveCatalog();
          populateCategories();
          renderCatalog();
        }
      }
    });
  }

  // Close modal when clicking backdrop
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      e.target.classList.remove('active');
    }
  });
});