// Inventory Turnover & Reorder Analyzer Logic
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'inventory_analyzer_store_v1';

  // Sample Inventory Dataset covering Critical, Low, Healthy, and Overstocked
  const DEFAULT_PRODUCTS = [
    {
      id: 'prod-1',
      sku: 'EP-401',
      name: 'Wireless Bluetooth Earbuds Pro',
      stock: 18,
      cost: 45.00,
      velocity: 6.0,
      leadTime: 7 // ROP = 42, Days Rem = 3.0 (< 7) -> CRITICAL
    },
    {
      id: 'prod-2',
      sku: 'MEC-102',
      name: 'RGB Mechanical Gaming Keyboard',
      stock: 35,
      cost: 65.00,
      velocity: 3.5,
      leadTime: 12 // ROP = 42, Stock 35 <= 42 -> LOW / REORDER NOW
    },
    {
      id: 'prod-3',
      sku: 'CAM-4K',
      name: 'Ultra HD 4K Streaming Webcam',
      stock: 140,
      cost: 52.00,
      velocity: 4.0,
      leadTime: 10 // ROP = 40, Days Rem = 35 -> HEALTHY
    },
    {
      id: 'prod-4',
      sku: 'STN-ALU',
      name: 'Anodized Aluminum Laptop Stand',
      stock: 95,
      cost: 18.50,
      velocity: 2.5,
      leadTime: 14 // ROP = 35, Days Rem = 38 -> HEALTHY
    },
    {
      id: 'prod-5',
      sku: 'PAD-XXL',
      name: 'Desk Mat Extended Mousepad',
      stock: 450,
      cost: 8.00,
      velocity: 1.5,
      leadTime: 10 // ROP = 15, Days Rem = 300 (> 90) -> OVERSTOCKED
    },
    {
      id: 'prod-6',
      sku: 'MIC-USB',
      name: 'Cardioid Studio Condenser Mic',
      stock: 8,
      cost: 72.00,
      velocity: 2.0,
      leadTime: 10 // ROP = 20, Days Rem = 4 (< 10) -> CRITICAL
    },
    {
      id: 'prod-7',
      sku: 'HUB-7IN1',
      name: 'USB-C Multiport Hub Dock 100W',
      stock: 60,
      cost: 28.00,
      velocity: 5.0,
      leadTime: 14 // ROP = 70, Stock 60 <= 70 -> LOW / REORDER NOW
    },
    {
      id: 'prod-8',
      sku: 'CBL-TB4',
      name: 'Thunderbolt 4 Certified Cable 1m',
      stock: 380,
      cost: 12.00,
      velocity: 2.0,
      leadTime: 14 // ROP = 28, Days Rem = 190 (> 90) -> OVERSTOCKED
    }
  ];

  // State
  let products = [];
  let searchQuery = '';
  let riskFilter = 'all';
  let sortBy = 'risk-urgency';

  // DOM Elements - KPIs
  const kpiTotalCapital = document.getElementById('kpi-total-capital');
  const kpiCapitalSub = document.getElementById('kpi-capital-sub');
  const kpiCriticalItems = document.getElementById('kpi-critical-items');
  const kpiCriticalSub = document.getElementById('kpi-critical-sub');
  const kpiTotalUnits = document.getElementById('kpi-total-units');
  const kpiUnitsSub = document.getElementById('kpi-units-sub');
  const kpiAvgDays = document.getElementById('kpi-avg-days');

  // DOM Elements - Toolbar
  const invSearch = document.getElementById('inv-search');
  const invRiskFilter = document.getElementById('inv-risk-filter');
  const invSort = document.getElementById('inv-sort');
  const addItemBtn = document.getElementById('add-item-btn');
  const exportInvBtn = document.getElementById('export-inv-btn');
  const resetInvBtn = document.getElementById('reset-inv-btn');
  const inventoryTableBody = document.getElementById('inventory-table-body');

  // DOM Elements - Modal
  const invModal = document.getElementById('inv-modal');
  const invForm = document.getElementById('inv-form');
  const modalTitle = document.getElementById('modal-title');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const prodIdInput = document.getElementById('prod-id');
  const prodSkuInput = document.getElementById('prod-sku');
  const prodNameInput = document.getElementById('prod-name');
  const prodStockInput = document.getElementById('prod-stock');
  const prodCostInput = document.getElementById('prod-cost');
  const prodVelocityInput = document.getElementById('prod-velocity');
  const prodLeadInput = document.getElementById('prod-lead');

  // Load from LocalStorage
  function loadProducts() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        products = JSON.parse(stored);
      } else {
        products = [...DEFAULT_PRODUCTS];
        saveProducts();
      }
    } catch (e) {
      console.warn('Failed to parse inventory storage:', e);
      products = [...DEFAULT_PRODUCTS];
    }
  }

  // Save to LocalStorage
  function saveProducts() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products:', e);
    }
  }

  // Formatting helpers
  function formatMoney(amount) {
    if (isNaN(amount) || amount === null) return '$0.00';
    return `$${Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  // Calculate Product Analytics
  function computeItemAnalytics(item) {
    const stock = Math.max(0, parseInt(item.stock, 10) || 0);
    const cost = Math.max(0, parseFloat(item.cost) || 0);
    const velocity = Math.max(0, parseFloat(item.velocity) || 0);
    const leadTime = Math.max(1, parseInt(item.leadTime, 10) || 1);

    const capital = stock * cost;
    const rop = Math.ceil(velocity * leadTime);
    const daysRemaining = velocity > 0 ? (stock / velocity) : (stock > 0 ? 999 : 0);

    let status = 'healthy';
    let statusLabel = 'Healthy';

    if (daysRemaining < leadTime || (rop > 0 && stock <= Math.ceil(rop * 0.5))) {
      status = 'critical';
      statusLabel = 'Critical Risk';
    } else if (stock <= rop) {
      status = 'low';
      statusLabel = 'Reorder Now';
    } else if (daysRemaining > 90 || (rop > 0 && stock > rop * 4)) {
      status = 'overstocked';
      statusLabel = 'Overstocked';
    }

    return {
      ...item,
      stock,
      cost,
      velocity,
      leadTime,
      capital,
      rop,
      daysRemaining,
      status,
      statusLabel
    };
  }

  // Update Overall Dashboard KPIs
  function updateKPIs(computedList) {
    let totalCapital = 0;
    let totalUnits = 0;
    let criticalCount = 0;
    let totalDaysSum = 0;
    let validVelocityCount = 0;

    computedList.forEach(item => {
      totalCapital += item.capital;
      totalUnits += item.stock;
      if (item.status === 'critical' || item.status === 'low') {
        criticalCount++;
      }
      if (item.velocity > 0 && item.daysRemaining < 999) {
        totalDaysSum += item.daysRemaining;
        validVelocityCount++;
      }
    });

    const avgDays = validVelocityCount > 0 ? Math.round(totalDaysSum / validVelocityCount) : 0;

    kpiTotalCapital.textContent = formatMoney(totalCapital);
    kpiCapitalSub.textContent = `Avg ${formatMoney(products.length > 0 ? totalCapital / products.length : 0)} / SKU`;
    kpiCriticalItems.textContent = criticalCount.toLocaleString();
    kpiCriticalSub.textContent = `${criticalCount} item${criticalCount === 1 ? '' : 's'} at or below ROP`;
    kpiTotalUnits.textContent = totalUnits.toLocaleString();
    kpiUnitsSub.textContent = `Across ${products.length} distinct SKUs`;
    kpiAvgDays.textContent = `${avgDays} days`;
  }

  // Render Table
  function renderTable() {
    const computedList = products.map(computeItemAnalytics);
    updateKPIs(computedList);

    // Filter
    const term = searchQuery.toLowerCase().trim();
    let filtered = computedList.filter(item => {
      if (term) {
        const skuMatch = (item.sku || '').toLowerCase().includes(term);
        const nameMatch = (item.name || '').toLowerCase().includes(term);
        if (!skuMatch && !nameMatch) return false;
      }
      if (riskFilter !== 'all' && item.status !== riskFilter) {
        return false;
      }
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'risk-urgency': {
          const rank = { critical: 1, low: 2, healthy: 3, overstocked: 4 };
          return (rank[a.status] || 99) - (rank[b.status] || 99);
        }
        case 'capital-desc':
          return b.capital - a.capital;
        case 'days-asc':
          return a.daysRemaining - b.daysRemaining;
        case 'stock-asc':
          return a.stock - b.stock;
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        default:
          return 0;
      }
    });

    inventoryTableBody.innerHTML = '';
    if (filtered.length === 0) {
      inventoryTableBody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align:center; padding:3rem; color:var(--text-tertiary);">
            No inventory items match the current search or risk filter.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(item => {
      const tr = document.createElement('tr');
      const daysText = item.velocity === 0 ? 'No Sales' : (item.daysRemaining > 365 ? '>1 year' : `${item.daysRemaining.toFixed(1)} days`);

      let statusBadgeClass = 'risk-healthy';
      if (item.status === 'critical') statusBadgeClass = 'risk-critical';
      else if (item.status === 'low') statusBadgeClass = 'risk-low';
      else if (item.status === 'overstocked') statusBadgeClass = 'risk-overstocked';

      tr.innerHTML = `
        <td>
          <div style="display:flex; flex-direction:column;">
            <strong style="color:var(--text-primary); font-size:0.95rem;">${escapeHtml(item.name)}</strong>
            <span style="font-family:monospace; font-size:0.8rem; color:var(--accent);">${escapeHtml(item.sku)}</span>
          </div>
        </td>
        <td>
          <strong style="font-size:0.95rem;">${item.stock.toLocaleString()}</strong>
          <span style="font-size:0.75rem; color:var(--text-tertiary); display:block;">units</span>
        </td>
        <td style="font-family:monospace;">${formatMoney(item.cost)}</td>
        <td style="font-family:monospace; font-weight:700; color:var(--success); font-size:0.95rem;">${formatMoney(item.capital)}</td>
        <td>
          <span style="font-family:monospace; font-weight:600;">${item.velocity}</span>
          <span style="font-size:0.75rem; color:var(--text-secondary);">/day</span>
        </td>
        <td style="color:var(--text-secondary);">${item.leadTime} days</td>
        <td>
          <span style="font-family:monospace; font-weight:700; color:var(--text-primary);">${item.rop}</span>
          <span style="font-size:0.75rem; color:var(--text-tertiary); display:block;">units threshold</span>
        </td>
        <td>
          <strong style="font-family:monospace; color:${item.daysRemaining < item.leadTime ? 'var(--error)' : 'var(--text-primary)'};">${daysText}</strong>
        </td>
        <td>
          <span class="risk-badge ${statusBadgeClass}">${item.statusLabel}</span>
        </td>
        <td>
          <div style="display:flex; gap:0.35rem;">
            <button class="deal-icon-btn btn-edit-prod" title="Edit Product" type="button">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="deal-icon-btn btn-delete-prod" title="Delete Product" type="button">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      `;

      tr.querySelector('.btn-edit-prod').addEventListener('click', () => openModal(item));
      tr.querySelector('.btn-delete-prod').addEventListener('click', () => {
        if (confirm(`Are you sure you want to delete SKU "${item.sku}" (${item.name})?`)) {
          deleteProduct(item.id);
        }
      });

      inventoryTableBody.appendChild(tr);
    });
  }

  // Open Modal
  function openModal(itemToEdit = null) {
    if (itemToEdit) {
      modalTitle.textContent = 'Edit Inventory Product';
      prodIdInput.value = itemToEdit.id;
      prodSkuInput.value = itemToEdit.sku || '';
      prodNameInput.value = itemToEdit.name || '';
      prodStockInput.value = itemToEdit.stock || 0;
      prodCostInput.value = itemToEdit.cost || 0;
      prodVelocityInput.value = itemToEdit.velocity || 0;
      prodLeadInput.value = itemToEdit.leadTime || 7;
    } else {
      modalTitle.textContent = 'Add Inventory Product';
      invForm.reset();
      prodIdInput.value = '';
      prodStockInput.value = '50';
      prodCostInput.value = '25.00';
      prodVelocityInput.value = '3.0';
      prodLeadInput.value = '10';
    }
    invModal.classList.add('active');
    prodSkuInput.focus();
  }

  // Close Modal
  function closeModal() {
    invModal.classList.remove('active');
    invForm.reset();
  }

  // Delete Product
  function deleteProduct(id) {
    products = products.filter(p => p.id !== id);
    saveProducts();
    renderTable();
  }

  // Handle Form Submit
  invForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = prodIdInput.value.trim();
    const sku = prodSkuInput.value.trim().toUpperCase();
    const name = prodNameInput.value.trim();
    const stock = parseInt(prodStockInput.value, 10) || 0;
    const cost = parseFloat(prodCostInput.value) || 0;
    const velocity = parseFloat(prodVelocityInput.value) || 0;
    const leadTime = parseInt(prodLeadInput.value, 10) || 1;

    if (!sku || !name) {
      alert('Please fill in SKU and Product Name.');
      return;
    }

    if (id) {
      const existing = products.find(p => p.id === id);
      if (existing) {
        existing.sku = sku;
        existing.name = name;
        existing.stock = stock;
        existing.cost = cost;
        existing.velocity = velocity;
        existing.leadTime = leadTime;
      }
    } else {
      const newProduct = {
        id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        sku,
        name,
        stock,
        cost,
        velocity,
        leadTime
      };
      products.push(newProduct);
    }

    saveProducts();
    renderTable();
    closeModal();
  });

  // Modal event listeners
  modalCloseBtn.addEventListener('click', closeModal);
  modalCancelBtn.addEventListener('click', closeModal);
  invModal.addEventListener('click', (e) => {
    if (e.target === invModal) closeModal();
  });

  addItemBtn.addEventListener('click', () => openModal(null));

  // Search & Filter listeners
  invSearch.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderTable();
  });

  invRiskFilter.addEventListener('change', (e) => {
    riskFilter = e.target.value;
    renderTable();
  });

  invSort.addEventListener('change', (e) => {
    sortBy = e.target.value;
    renderTable();
  });

  // Reset to Sample Data
  resetInvBtn.addEventListener('click', () => {
    if (confirm('Reset to initial sample inventory dataset? Any unsaved custom items will be replaced.')) {
      products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
      saveProducts();
      renderTable();
    }
  });

  // Export CSV Report
  exportInvBtn.addEventListener('click', () => {
    if (products.length === 0) {
      alert('No inventory items to export.');
      return;
    }

    const computed = products.map(computeItemAnalytics);
    const headers = [
      'SKU',
      'Product Name',
      'Current Stock (Units)',
      'Unit Cost ($)',
      'Capital Tied Up ($)',
      'Daily Sales Velocity',
      'Supplier Lead Time (Days)',
      'Reorder Point (ROP)',
      'Days of Stock Remaining',
      'Stockout Risk Status'
    ];

    const rows = computed.map(item => [
      `"${(item.sku || '').replace(/"/g, '""')}"`,
      `"${(item.name || '').replace(/"/g, '""')}"`,
      item.stock,
      item.cost.toFixed(2),
      item.capital.toFixed(2),
      item.velocity,
      item.leadTime,
      item.rop,
      item.daysRemaining < 999 ? item.daysRemaining.toFixed(1) : 'No Sales',
      `"${item.statusLabel}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory_turnover_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });

  // HTML escaping helper
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Keyboard shortcut
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && invModal.classList.contains('active')) {
      closeModal();
    }
  });

  // Initialize
  loadProducts();
  renderTable();
});