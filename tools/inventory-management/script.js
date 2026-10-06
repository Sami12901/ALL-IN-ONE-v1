// Multi-Warehouse Inventory Management Logic
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY_PRODUCTS = 'multi_warehouse_inventory_v1';
  const STORAGE_KEY_LOGS = 'multi_warehouse_inv_logs_v1';

  const SAMPLE_PRODUCTS = [
    {
      id: 'prod-1',
      sku: 'FURN-CHAIR-01',
      barcode: '890123450001',
      name: 'Ergonomic Executive Mesh Chair',
      category: 'Furniture',
      warehouse: 'Warehouse A',
      quantity: 38,
      reorder: 15,
      price: 189.50
    },
    {
      id: 'prod-2',
      sku: 'ELEC-DOCK-4K',
      barcode: '890123450002',
      name: 'Thunderbolt 4 Dual-Display Dock',
      category: 'Electronics',
      warehouse: 'Warehouse B',
      quantity: 8,
      reorder: 12,
      price: 249.99
    },
    {
      id: 'prod-3',
      sku: 'OFFC-LAMPS-LED',
      barcode: '890123450003',
      name: 'Architect Dimmable LED Desk Lamp',
      category: 'Office Supplies',
      warehouse: 'Storefront',
      quantity: 5,
      reorder: 10,
      price: 45.00
    },
    {
      id: 'prod-4',
      sku: 'ELEC-KEYB-MECH',
      barcode: '890123450004',
      name: 'Wireless Mechanical Studio Keyboard',
      category: 'Electronics',
      warehouse: 'Warehouse A',
      quantity: 64,
      reorder: 20,
      price: 119.00
    },
    {
      id: 'prod-5',
      sku: 'HARD-CABLE-USB4',
      barcode: '890123450005',
      name: 'Braided USB-C 240W 2M Cable',
      category: 'Hardware',
      warehouse: 'Storefront',
      quantity: 0,
      reorder: 25,
      price: 18.50
    },
    {
      id: 'prod-6',
      sku: 'FURN-DESK-MOTR',
      barcode: '890123450006',
      name: 'Motorized Dual-Motor Standing Desk Frame',
      category: 'Furniture',
      warehouse: 'Warehouse B',
      quantity: 14,
      reorder: 8,
      price: 385.00
    },
    {
      id: 'prod-7',
      sku: 'PACK-BOX-MED',
      barcode: '890123450007',
      name: 'Heavy Duty Shipping Cartons (Bundle of 25)',
      category: 'Packaging',
      warehouse: 'Warehouse A',
      quantity: 110,
      reorder: 30,
      price: 32.00
    },
    {
      id: 'prod-8',
      sku: 'OFFC-NOTE-LXR',
      barcode: '890123450008',
      name: 'Hardcover Executive Grid Journal',
      category: 'Office Supplies',
      warehouse: 'Storefront',
      quantity: 2,
      reorder: 15,
      price: 14.95
    }
  ];

  const SAMPLE_LOGS = [
    {
      id: 'tx-1',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      productId: 'prod-1',
      sku: 'FURN-CHAIR-01',
      productName: 'Ergonomic Executive Mesh Chair',
      type: 'IN',
      quantity: 20,
      warehouse: 'Warehouse A',
      reason: 'PO-702 Supplier Pallet Delivery'
    },
    {
      id: 'tx-2',
      timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
      productId: 'prod-5',
      sku: 'HARD-CABLE-USB4',
      productName: 'Braided USB-C 240W 2M Cable',
      type: 'OUT',
      quantity: 15,
      warehouse: 'Storefront',
      reason: 'Retail Storefront Customer Batch Order'
    }
  ];

  // State
  let products = loadProducts();
  let logs = loadLogs();
  let searchQuery = '';
  let selectedWarehouse = 'all';
  let selectedCategory = 'all';
  let selectedStockStatus = 'all';

  // DOM Elements
  const kpiTotalVal = document.getElementById('kpi-total-val');
  const kpiTotalUnits = document.getElementById('kpi-total-units');
  const kpiSkuCount = document.getElementById('kpi-sku-count');
  const kpiLowStockCount = document.getElementById('kpi-low-stock-count');
  const kpiOutStockCount = document.getElementById('kpi-out-stock-count');

  const filterWarehouse = document.getElementById('filter-warehouse');
  const filterCategory = document.getElementById('filter-category');
  const filterStockStatus = document.getElementById('filter-stock-status');
  const searchInput = document.getElementById('inv-search-input');

  const btnAddProduct = document.getElementById('btn-add-product');
  const btnQuickLog = document.getElementById('btn-quick-log');
  const btnViewLogs = document.getElementById('btn-view-logs');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnResetData = document.getElementById('btn-reset-data');

  const tableBody = document.getElementById('inv-table-body');

  // Product Modal Elements
  const productModal = document.getElementById('product-modal-backdrop');
  const productModalTitle = document.getElementById('product-modal-title');
  const productModalClose = document.getElementById('product-modal-close');
  const productModalCancel = document.getElementById('product-modal-cancel');
  const productForm = document.getElementById('product-form');
  const formProductId = document.getElementById('form-product-id');
  const formSku = document.getElementById('form-sku');
  const formBarcode = document.getElementById('form-barcode');
  const formName = document.getElementById('form-name');
  const formCategory = document.getElementById('form-category');
  const formWarehouse = document.getElementById('form-warehouse');
  const formQuantity = document.getElementById('form-quantity');
  const formReorder = document.getElementById('form-reorder');
  const formPrice = document.getElementById('form-price');

  // Movement Modal Elements
  const movementModal = document.getElementById('movement-modal-backdrop');
  const movementModalClose = document.getElementById('movement-modal-close');
  const movementModalCancel = document.getElementById('movement-modal-cancel');
  const movementForm = document.getElementById('movement-form');
  const movProductSelect = document.getElementById('mov-product-select');
  const movType = document.getElementById('mov-type');
  const movQuantity = document.getElementById('mov-quantity');
  const movReason = document.getElementById('mov-reason');

  // Logs Modal Elements
  const logsModal = document.getElementById('logs-modal-backdrop');
  const logsModalClose = document.getElementById('logs-modal-close');
  const logsModalOk = document.getElementById('logs-modal-ok');
  const txLogsContainer = document.getElementById('tx-logs-container');
  const btnExportLogsCsv = document.getElementById('btn-export-logs-csv');

  // Local Storage Helpers
  function loadProducts() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading products from storage:', e);
    }
    return JSON.parse(JSON.stringify(SAMPLE_PRODUCTS));
  }

  function saveProducts() {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.warn('Error saving products:', e);
    }
  }

  function loadLogs() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_LOGS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading logs from storage:', e);
    }
    return JSON.parse(JSON.stringify(SAMPLE_LOGS));
  }

  function saveLogs() {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.warn('Error saving logs:', e);
    }
  }

  function formatMoney(amount) {
    const num = Number(amount) || 0;
    return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatDate(isoStr) {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoStr;
    }
  }

  // Stock status evaluation
  function getStockStatus(qty, reorder) {
    if (qty === 0) return { key: 'out_of_stock', label: 'Out of Stock', cssClass: 'status-out-of-stock' };
    if (qty <= reorder) return { key: 'low_stock', label: 'Low Stock', cssClass: 'status-low-stock' };
    return { key: 'in_stock', label: 'In Stock', cssClass: 'status-in-stock' };
  }

  // Record a transaction
  function logMovement(product, type, quantity, reason = '') {
    const tx = {
      id: 'tx-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      productId: product.id,
      sku: product.sku,
      productName: product.name,
      type: type,
      quantity: Number(quantity),
      warehouse: product.warehouse,
      reason: reason.trim() || (type === 'IN' ? 'Stock Restock' : 'Stock Depletion')
    };
    logs.unshift(tx);
    if (logs.length > 200) logs.pop(); // keep last 200 entries
    saveLogs();
  }

  // Update Category Filter dropdown
  function updateCategoryFilterOptions() {
    const categories = new Set();
    products.forEach(p => {
      if (p.category && p.category.trim()) {
        categories.add(p.category.trim());
      }
    });

    const currentVal = filterCategory.value;
    filterCategory.innerHTML = '<option value="all">All Categories</option>';
    Array.from(categories).sort().forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      if (cat === currentVal) opt.selected = true;
      filterCategory.appendChild(opt);
    });
  }

  // Render KPI Metrics
  function renderKPIs() {
    let totalValuation = 0;
    let totalUnits = 0;
    let lowStockCount = 0;
    let outStockCount = 0;

    products.forEach(p => {
      const qty = Number(p.quantity) || 0;
      const price = Number(p.price) || 0;
      const reorder = Number(p.reorder) || 0;

      totalUnits += qty;
      totalValuation += qty * price;

      if (qty === 0) {
        outStockCount++;
      } else if (qty <= reorder) {
        lowStockCount++;
      }
    });

    kpiTotalVal.textContent = formatMoney(totalValuation);
    kpiTotalUnits.textContent = totalUnits.toLocaleString();
    kpiSkuCount.textContent = `${products.length} active product SKU${products.length === 1 ? '' : 's'}`;
    kpiLowStockCount.textContent = lowStockCount;
    kpiOutStockCount.textContent = outStockCount;
  }

  // Render Table
  function renderTable() {
    renderKPIs();
    updateCategoryFilterOptions();

    // Filter products
    const filtered = products.filter(p => {
      if (selectedWarehouse !== 'all' && p.warehouse !== selectedWarehouse) return false;
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;

      const status = getStockStatus(Number(p.quantity) || 0, Number(p.reorder) || 0);
      if (selectedStockStatus !== 'all' && status.key !== selectedStockStatus) return false;

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const skuMatch = (p.sku || '').toLowerCase().includes(q);
        const barcodeMatch = (p.barcode || '').toLowerCase().includes(q);
        const nameMatch = (p.name || '').toLowerCase().includes(q);
        const catMatch = (p.category || '').toLowerCase().includes(q);
        if (!skuMatch && !barcodeMatch && !nameMatch && !catMatch) return false;
      }

      return true;
    });

    tableBody.innerHTML = '';

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-tertiary);">
            No matching inventory items found for current filter criteria.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(p => {
      const qty = Number(p.quantity) || 0;
      const reorder = Number(p.reorder) || 0;
      const price = Number(p.price) || 0;
      const status = getStockStatus(qty, reorder);

      const safeSku = escapeHtml(p.sku);
      const safeBarcode = escapeHtml(p.barcode || '—');
      const safeName = escapeHtml(p.name);
      const safeCategory = escapeHtml(p.category);
      const safeWarehouse = escapeHtml(p.warehouse);

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>
          <span class="sku-tag">${safeSku}</span>
          <span class="barcode-sub">${safeBarcode}</span>
        </td>
        <td>
          <strong style="color:var(--text-primary); font-size:0.92rem;">${safeName}</strong>
          <div style="font-size:0.78rem; color:var(--text-tertiary);">${safeCategory}</div>
        </td>
        <td>
          <span class="warehouse-badge">${safeWarehouse}</span>
        </td>
        <td>
          <span style="font-family:monospace; font-weight:600;">${formatMoney(price)}</span>
        </td>
        <td>
          <div>
            <span style="font-family:monospace; font-weight:700; font-size:0.95rem;">${qty}</span>
            <span style="font-size:0.75rem; color:var(--text-tertiary);"> / Min ${reorder}</span>
          </div>
        </td>
        <td>
          <span class="status-badge ${status.cssClass}">${status.label}</span>
        </td>
        <td>
          <div class="qty-controls">
            <button type="button" class="qty-btn btn-stock-dec" title="Stock Out (-1)" aria-label="Decrease stock" ${qty <= 0 ? 'disabled' : ''}>-</button>
            <span class="qty-display">${qty}</span>
            <button type="button" class="qty-btn btn-stock-inc" title="Stock In (+1)" aria-label="Increase stock">+</button>
          </div>
        </td>
        <td>
          <div class="table-actions">
            <button type="button" class="inv-icon-btn btn-edit" title="Edit Product" aria-label="Edit product">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button type="button" class="inv-icon-btn btn-del" title="Delete Product" aria-label="Delete product">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      `;

      // Event: Quick Stock Increment
      const incBtn = row.querySelector('.btn-stock-inc');
      incBtn.addEventListener('click', () => {
        p.quantity = (Number(p.quantity) || 0) + 1;
        logMovement(p, 'IN', 1, 'Quick +1 Restock');
        saveProducts();
        renderTable();
      });

      // Event: Quick Stock Decrement
      const decBtn = row.querySelector('.btn-stock-dec');
      decBtn.addEventListener('click', () => {
        if (p.quantity > 0) {
          p.quantity = (Number(p.quantity) || 0) - 1;
          logMovement(p, 'OUT', 1, 'Quick -1 Reduction');
          saveProducts();
          renderTable();
        }
      });

      // Event: Edit Product
      const editBtn = row.querySelector('.btn-edit');
      editBtn.addEventListener('click', () => {
        openProductModal(p);
      });

      // Event: Delete Product
      const delBtn = row.querySelector('.btn-del');
      delBtn.addEventListener('click', () => {
        if (confirm(`Are you sure you want to delete product "${p.name}" (${p.sku})?`)) {
          products = products.filter(item => item.id !== p.id);
          saveProducts();
          renderTable();
        }
      });

      tableBody.appendChild(row);
    });
  }

  // Populate Movement Product Selector
  function populateMovementProductSelect(selectedId = null) {
    movProductSelect.innerHTML = '';
    products.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.sku} - ${p.name} (${p.warehouse}) [On Hand: ${p.quantity}]`;
      if (p.id === selectedId) opt.selected = true;
      movProductSelect.appendChild(opt);
    });
  }

  // Open / Close Product Modal
  function openProductModal(productToEdit = null) {
    if (productToEdit) {
      productModalTitle.textContent = 'Edit Product';
      formProductId.value = productToEdit.id;
      formSku.value = productToEdit.sku || '';
      formBarcode.value = productToEdit.barcode || '';
      formName.value = productToEdit.name || '';
      formCategory.value = productToEdit.category || '';
      formWarehouse.value = productToEdit.warehouse || 'Warehouse A';
      formQuantity.value = productToEdit.quantity || 0;
      formReorder.value = productToEdit.reorder || 10;
      formPrice.value = productToEdit.price || 0.00;
    } else {
      productModalTitle.textContent = 'Add Inventory Product';
      productForm.reset();
      formProductId.value = '';
      formWarehouse.value = 'Warehouse A';
      formQuantity.value = '10';
      formReorder.value = '5';
      formPrice.value = '0.00';
    }
    productModal.classList.add('show');
    formSku.focus();
  }

  function closeProductModal() {
    productModal.classList.remove('show');
    productForm.reset();
  }

  // Save Product Form
  productForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const sku = formSku.value.trim().toUpperCase();
    const barcode = formBarcode.value.trim();
    const name = formName.value.trim();
    const category = formCategory.value.trim();
    const warehouse = formWarehouse.value;
    const quantity = parseInt(formQuantity.value, 10) || 0;
    const reorder = parseInt(formReorder.value, 10) || 0;
    const price = parseFloat(formPrice.value) || 0.00;

    if (!sku || !name) return;

    const id = formProductId.value;
    if (id) {
      const existing = products.find(p => p.id === id);
      if (existing) {
        existing.sku = sku;
        existing.barcode = barcode;
        existing.name = name;
        existing.category = category;
        existing.warehouse = warehouse;
        existing.quantity = quantity;
        existing.reorder = reorder;
        existing.price = price;
      }
    } else {
      // Check for duplicate SKU
      if (products.some(p => p.sku === sku && p.warehouse === warehouse)) {
        if (!confirm(`SKU "${sku}" already exists in ${warehouse}. Do you want to add another entry?`)) {
          return;
        }
      }

      const newProduct = {
        id: 'prod-' + Date.now(),
        sku,
        barcode,
        name,
        category,
        warehouse,
        quantity,
        reorder,
        price
      };
      products.unshift(newProduct);
      logMovement(newProduct, 'IN', quantity, 'Initial stock entry');
    }

    saveProducts();
    renderTable();
    closeProductModal();
  });

  // Open / Close Movement Modal
  function openMovementModal() {
    if (products.length === 0) {
      alert('Please add a product first before logging stock movements.');
      return;
    }
    populateMovementProductSelect();
    movementForm.reset();
    movQuantity.value = '1';
    movementModal.classList.add('show');
  }

  function closeMovementModal() {
    movementModal.classList.remove('show');
  }

  // Save Movement Form
  movementForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const prodId = movProductSelect.value;
    const type = movType.value;
    const qtyChange = parseInt(movQuantity.value, 10) || 0;
    const reason = movReason.value.trim();

    if (qtyChange <= 0) {
      alert('Movement quantity must be greater than zero.');
      return;
    }

    const prod = products.find(p => p.id === prodId);
    if (!prod) return;

    if (type === 'OUT' && (prod.quantity - qtyChange < 0)) {
      if (!confirm(`Warning: Stock Out of ${qtyChange} exceeds current on-hand stock (${prod.quantity}). Allow stock to reach 0?`)) {
        return;
      }
      prod.quantity = 0;
    } else {
      if (type === 'IN') {
        prod.quantity = (Number(prod.quantity) || 0) + qtyChange;
      } else {
        prod.quantity = Math.max(0, (Number(prod.quantity) || 0) - qtyChange);
      }
    }

    logMovement(prod, type, qtyChange, reason);
    saveProducts();
    renderTable();
    closeMovementModal();
  });

  // Render Transaction Logs
  function renderLogsModal() {
    txLogsContainer.innerHTML = '';
    if (logs.length === 0) {
      txLogsContainer.innerHTML = '<div style="text-align:center; padding:2rem; color:var(--text-tertiary);">No transactions logged yet.</div>';
    } else {
      logs.slice(0, 50).forEach(tx => {
        const item = document.createElement('div');
        item.className = 'tx-log-item';
        const typeBadge = tx.type === 'IN' 
          ? `<span class="tx-badge-in">+${tx.quantity} (IN)</span>` 
          : `<span class="tx-badge-out">-${tx.quantity} (OUT)</span>`;

        item.innerHTML = `
          <div>
            <div style="font-weight:600; color:var(--text-primary); font-size:0.9rem;">
              ${escapeHtml(tx.productName)} <span style="font-family:monospace; color:var(--accent);">(${escapeHtml(tx.sku)})</span>
            </div>
            <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:0.2rem;">
              <span>Location: ${escapeHtml(tx.warehouse)}</span> &bull; 
              <span>${formatDate(tx.timestamp)}</span> &bull; 
              <em>${escapeHtml(tx.reason || '')}</em>
            </div>
          </div>
          <div style="text-align:right;">
            ${typeBadge}
          </div>
        `;
        txLogsContainer.appendChild(item);
      });
    }
    logsModal.classList.add('show');
  }

  function closeLogsModal() {
    logsModal.classList.remove('show');
  }

  // Export Inventory CSV
  btnExportCsv.addEventListener('click', () => {
    if (products.length === 0) {
      alert('No inventory products to export.');
      return;
    }

    const headers = ['SKU', 'Barcode', 'Product Name', 'Category', 'Warehouse', 'Quantity On Hand', 'Reorder Point', 'Unit Price (USD)', 'Total Valuation (USD)', 'Status'];
    const rows = products.map(p => {
      const qty = Number(p.quantity) || 0;
      const price = Number(p.price) || 0;
      const reorder = Number(p.reorder) || 0;
      const status = getStockStatus(qty, reorder).label;
      const totalVal = (qty * price).toFixed(2);

      return [
        `"${(p.sku || '').replace(/"/g, '""')}"`,
        `"${(p.barcode || '').replace(/"/g, '""')}"`,
        `"${(p.name || '').replace(/"/g, '""')}"`,
        `"${(p.category || '').replace(/"/g, '""')}"`,
        `"${(p.warehouse || '').replace(/"/g, '""')}"`,
        qty,
        reorder,
        price.toFixed(2),
        totalVal,
        `"${status}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Export Transaction Logs CSV
  btnExportLogsCsv.addEventListener('click', () => {
    if (logs.length === 0) {
      alert('No logs to export.');
      return;
    }

    const headers = ['Timestamp', 'SKU', 'Product Name', 'Movement Type', 'Quantity', 'Warehouse', 'Reason Note'];
    const rows = logs.map(l => [
      `"${l.timestamp}"`,
      `"${(l.sku || '').replace(/"/g, '""')}"`,
      `"${(l.productName || '').replace(/"/g, '""')}"`,
      `"${l.type}"`,
      l.quantity,
      `"${(l.warehouse || '').replace(/"/g, '""')}"`,
      `"${(l.reason || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory-transactions-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Reset to sample data
  btnResetData.addEventListener('click', () => {
    if (confirm('Reset inventory data to default sample stock? Custom products will be overwritten.')) {
      products = JSON.parse(JSON.stringify(SAMPLE_PRODUCTS));
      logs = JSON.parse(JSON.stringify(SAMPLE_LOGS));
      saveProducts();
      saveLogs();
      renderTable();
    }
  });

  // Filter Listeners
  filterWarehouse.addEventListener('change', (e) => {
    selectedWarehouse = e.target.value;
    renderTable();
  });

  filterCategory.addEventListener('change', (e) => {
    selectedCategory = e.target.value;
    renderTable();
  });

  filterStockStatus.addEventListener('change', (e) => {
    selectedStockStatus = e.target.value;
    renderTable();
  });

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderTable();
  });

  // Modal Triggers
  btnAddProduct.addEventListener('click', () => openProductModal());
  productModalClose.addEventListener('click', closeProductModal);
  productModalCancel.addEventListener('click', closeProductModal);
  productModal.addEventListener('click', (e) => {
    if (e.target === productModal) closeProductModal();
  });

  btnQuickLog.addEventListener('click', openMovementModal);
  movementModalClose.addEventListener('click', closeMovementModal);
  movementModalCancel.addEventListener('click', closeMovementModal);
  movementModal.addEventListener('click', (e) => {
    if (e.target === movementModal) closeMovementModal();
  });

  btnViewLogs.addEventListener('click', renderLogsModal);
  logsModalClose.addEventListener('click', closeLogsModal);
  logsModalOk.addEventListener('click', closeLogsModal);
  logsModal.addEventListener('click', (e) => {
    if (e.target === logsModal) closeLogsModal();
  });

  // Initial render
  renderTable();
});