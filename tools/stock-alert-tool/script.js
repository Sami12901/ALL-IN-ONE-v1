// Stock Alert Tool - Inventory Monitor & Automated PO Alert System

const STORAGE_KEY = 'stock_alert_inventory';

const SAMPLE_PRODUCTS = [
  { id: 'prod-1', sku: 'AUDIO-ANC-01', name: 'AeroSound Pro Noise-Cancelling Headphones', stock: 3, threshold: 15, cost: 74.50, supplier: 'orders@example.com' },
  { id: 'prod-2', sku: 'KB-MECH-RGB', name: 'Vortex RGB Mechanical Gaming Keyboard', stock: 0, threshold: 10, cost: 42.00, supplier: 'sales@example.com' },
  { id: 'prod-3', sku: 'MOU-WL-ULTRA', name: 'ErgoGlide Ultra Wireless Mouse', stock: 12, threshold: 25, cost: 18.20, supplier: 'supply@example.com' },
  { id: 'prod-4', sku: 'MON-4K-27IN', name: 'Lumix 27-inch 4K Studio Monitor', stock: 18, threshold: 8, cost: 195.00, supplier: 'b2b@example.com' },
  { id: 'prod-5', sku: 'CAB-USB4-2M', name: 'Braided Thunderbolt 4 Cable 2M', stock: 0, threshold: 30, cost: 6.80, supplier: 'procure@example.com' },
  { id: 'prod-6', sku: 'HUB-10IN1-ALU', name: '10-in-1 Aluminium USB-C Docking Station', stock: 5, threshold: 20, cost: 38.50, supplier: 'sales@example.com' },
  { id: 'prod-7', sku: 'CAM-4K-STREAM', name: 'ApexCam 4K UHD Streaming Webcam', stock: 24, threshold: 10, cost: 55.00, supplier: 'orders@example.com' },
  { id: 'prod-8', sku: 'PAD-DESK-LEATH', name: 'Full-Grain Vegan Leather Desk Mat', stock: 7, threshold: 15, cost: 12.40, supplier: 'supply@example.com' }
];

let inventory = [];

function loadInventory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      inventory = JSON.parse(raw);
    } else {
      inventory = [...SAMPLE_PRODUCTS];
      saveInventory();
    }
  } catch (err) {
    console.error('Failed to parse inventory from localStorage:', err);
    inventory = [...SAMPLE_PRODUCTS];
  }
}

function saveInventory() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
  } catch (err) {
    console.error('Failed to save inventory:', err);
  }
}

function getRiskLevel(stock, threshold) {
  if (stock <= 0) return 'critical';
  if (stock <= threshold) return 'warning';
  return 'healthy';
}

function formatCurrency(val) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
}

function updateMetrics() {
  let totalUnits = 0;
  let totalValuation = 0;
  let criticalCount = 0;
  let warningCount = 0;
  let healthyCount = 0;
  let restockCost = 0;

  inventory.forEach(item => {
    const stock = Number(item.stock) || 0;
    const threshold = Number(item.threshold) || 0;
    const cost = Number(item.cost) || 0;
    const risk = getRiskLevel(stock, threshold);

    totalUnits += stock;
    totalValuation += stock * cost;

    if (risk === 'critical') {
      criticalCount++;
      const needed = Math.max(0, (threshold * 2) - stock);
      restockCost += needed * cost;
    } else if (risk === 'warning') {
      warningCount++;
      const needed = Math.max(0, (threshold * 2) - stock);
      restockCost += needed * cost;
    } else {
      healthyCount++;
    }
  });

  const elSkus = document.getElementById('metric-total-skus');
  const elUnits = document.getElementById('metric-total-units');
  const elCrit = document.getElementById('metric-critical-count');
  const elWarn = document.getElementById('metric-warning-count');
  const elHealth = document.getElementById('metric-healthy-count');
  const elRestock = document.getElementById('metric-restock-cost');
  const elVal = document.getElementById('metric-inventory-val');

  if (elSkus) elSkus.textContent = inventory.length;
  if (elUnits) elUnits.textContent = `${totalUnits.toLocaleString()} total units in warehouse`;
  if (elCrit) elCrit.textContent = criticalCount;
  if (elWarn) elWarn.textContent = warningCount;
  if (elHealth) elHealth.textContent = healthyCount;
  if (elRestock) elRestock.textContent = formatCurrency(restockCost);
  if (elVal) elVal.textContent = `Valuation: ${formatCurrency(totalValuation)}`;
}

function renderTable() {
  const tbody = document.getElementById('inventory-tbody');
  const emptyState = document.getElementById('empty-state-view');
  if (!tbody) return;

  const searchQuery = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
  const filterStatus = document.getElementById('status-filter')?.value || 'all';
  const sortMode = document.getElementById('sort-select')?.value || 'urgency';

  let filtered = inventory.filter(item => {
    const risk = getRiskLevel(item.stock, item.threshold);
    if (filterStatus !== 'all' && risk !== filterStatus) {
      return false;
    }
    if (searchQuery) {
      const matchSku = (item.sku || '').toLowerCase().includes(searchQuery);
      const matchName = (item.name || '').toLowerCase().includes(searchQuery);
      const matchSup = (item.supplier || '').toLowerCase().includes(searchQuery);
      if (!matchSku && !matchName && !matchSup) return false;
    }
    return true;
  });

  // Sorting
  filtered.sort((a, b) => {
    const riskScore = (item) => {
      const r = getRiskLevel(item.stock, item.threshold);
      if (r === 'critical') return 3;
      if (r === 'warning') return 2;
      return 1;
    };

    if (sortMode === 'urgency') {
      const diff = riskScore(b) - riskScore(a);
      if (diff !== 0) return diff;
      return (a.stock - a.threshold) - (b.stock - b.threshold);
    }
    if (sortMode === 'stock-asc') return a.stock - b.stock;
    if (sortMode === 'stock-desc') return b.stock - a.stock;
    if (sortMode === 'name-asc') return (a.name || '').localeCompare(b.name || '');
    if (sortMode === 'val-desc') return (b.stock * b.cost) - (a.stock * a.cost);
    return 0;
  });

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }
  if (emptyState) emptyState.classList.add('hidden');

  filtered.forEach(item => {
    const risk = getRiskLevel(item.stock, item.threshold);
    let badgeHtml = '';
    if (risk === 'critical') {
      badgeHtml = `<span class="status-badge status-critical"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> Critical (0 Stock)</span>`;
    } else if (risk === 'warning') {
      badgeHtml = `<span class="status-badge status-warning"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> Low Stock Warning</span>`;
    } else {
      badgeHtml = `<span class="status-badge status-healthy"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Healthy Stock</span>`;
    }

    const tr = document.createElement('tr');
    tr.dataset.id = item.id;
    tr.innerHTML = `
      <td><strong style="font-family: monospace; color: var(--accent);">${escapeHtml(item.sku)}</strong></td>
      <td>
        <div style="font-weight: 600;">${escapeHtml(item.name)}</div>
      </td>
      <td>
        <div class="qty-controls">
          <button type="button" class="qty-btn btn-stock-dec" title="Decrease Stock" data-id="${item.id}">-</button>
          <input type="number" class="qty-input input-stock-direct" data-id="${item.id}" value="${item.stock}" min="0">
          <button type="button" class="qty-btn btn-stock-inc" title="Increase Stock" data-id="${item.id}">+</button>
        </div>
      </td>
      <td><span style="font-family: monospace; font-weight: 600;">${item.threshold}</span> units</td>
      <td>${formatCurrency(item.cost)}</td>
      <td><strong>${formatCurrency(item.stock * item.cost)}</strong></td>
      <td>${badgeHtml}</td>
      <td><a href="mailto:${encodeURIComponent(item.supplier)}" style="font-size: 0.85rem; word-break: break-all;">${escapeHtml(item.supplier)}</a></td>
      <td style="text-align: right;">
        <div style="display: inline-flex; gap: 0.35rem; justify-content: flex-end;">
          <button type="button" class="action-icon-btn btn-edit-prod" data-id="${item.id}" title="Edit SKU">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          </button>
          <button type="button" class="action-icon-btn delete-btn btn-delete-prod" data-id="${item.id}" title="Delete SKU">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  updateMetrics();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Modal handling
function openProductModal(productId = null) {
  const modal = document.getElementById('product-modal');
  const title = document.getElementById('modal-title');
  const form = document.getElementById('product-form');
  const editIdInput = document.getElementById('edit-product-id');

  if (!modal || !form) return;

  if (productId) {
    const prod = inventory.find(p => p.id === productId);
    if (!prod) return;
    title.textContent = 'Edit Inventory SKU';
    editIdInput.value = prod.id;
    document.getElementById('prod-sku').value = prod.sku;
    document.getElementById('prod-name').value = prod.name;
    document.getElementById('prod-stock').value = prod.stock;
    document.getElementById('prod-threshold').value = prod.threshold;
    document.getElementById('prod-cost').value = prod.cost;
    document.getElementById('prod-supplier').value = prod.supplier;
  } else {
    title.textContent = 'Add Inventory SKU';
    form.reset();
    editIdInput.value = '';
    document.getElementById('prod-stock').value = '10';
    document.getElementById('prod-threshold').value = '15';
    document.getElementById('prod-cost').value = '25.00';
  }

  modal.classList.add('active');
}

function closeProductModal() {
  const modal = document.getElementById('product-modal');
  if (modal) modal.classList.remove('active');
}

function handleSaveProduct(e) {
  e.preventDefault();
  const editId = document.getElementById('edit-product-id').value;
  const sku = document.getElementById('prod-sku').value.trim();
  const name = document.getElementById('prod-name').value.trim();
  const stock = Math.max(0, parseInt(document.getElementById('prod-stock').value, 10) || 0);
  const threshold = Math.max(1, parseInt(document.getElementById('prod-threshold').value, 10) || 1);
  const cost = Math.max(0.01, parseFloat(document.getElementById('prod-cost').value) || 0.01);
  const supplier = document.getElementById('prod-supplier').value.trim();

  if (!sku || !name || !supplier) {
    alert('Please fill out all required fields.');
    return;
  }

  if (editId) {
    const idx = inventory.findIndex(p => p.id === editId);
    if (idx !== -1) {
      inventory[idx] = { ...inventory[idx], sku, name, stock, threshold, cost, supplier };
    }
  } else {
    const newId = 'prod-' + Date.now();
    inventory.unshift({ id: newId, sku, name, stock, threshold, cost, supplier });
  }

  saveInventory();
  renderTable();
  closeProductModal();
}

// PO Draft Modal logic
function openPOModal() {
  const modal = document.getElementById('po-modal');
  const supplierSelect = document.getElementById('po-supplier-select');
  if (!modal || !supplierSelect) return;

  // Populate suppliers
  const suppliers = Array.from(new Set(inventory.map(p => p.supplier.trim()).filter(Boolean)));
  supplierSelect.innerHTML = '<option value="all">All Low-Stock Suppliers (Consolidated)</option>';
  suppliers.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s;
    supplierSelect.appendChild(opt);
  });

  updatePODraft();
  modal.classList.add('active');
}

function closePOModal() {
  const modal = document.getElementById('po-modal');
  if (modal) modal.classList.remove('active');
}

function updatePODraft() {
  const supplierSelect = document.getElementById('po-supplier-select');
  const bufferSelect = document.getElementById('po-buffer-select');
  const subjectInput = document.getElementById('po-email-subject');
  const bodyTextarea = document.getElementById('po-email-body');

  if (!supplierSelect || !bufferSelect || !subjectInput || !bodyTextarea) return;

  const targetSupplier = supplierSelect.value;
  const multiplier = parseInt(bufferSelect.value, 10) || 2;

  // Filter items needing reorder (stock <= threshold)
  let lowStockItems = inventory.filter(item => {
    const isLow = item.stock <= item.threshold;
    if (!isLow) return false;
    if (targetSupplier !== 'all' && item.supplier.trim() !== targetSupplier) return false;
    return true;
  });

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const poNumber = `PO-${Date.now().toString().slice(-6)}`;

  if (lowStockItems.length === 0) {
    subjectInput.value = `Purchase Order Inquiry - ${today}`;
    bodyTextarea.value = `Hello,\n\nAll current stock levels for the selected supplier are currently healthy.\nNo urgent replenishments are required at this time.\n\nBest regards,\nProcurement & Inventory Operations`;
    return;
  }

  subjectInput.value = `PURCHASE ORDER ${poNumber} - Expedited Restock Order [${today}]`;

  let totalPOAmount = 0;
  let itemsTableLines = [];

  lowStockItems.forEach((item, index) => {
    const targetStock = item.threshold * multiplier;
    const qtyToOrder = Math.max(1, targetStock - item.stock);
    const lineTotal = qtyToOrder * item.cost;
    totalPOAmount += lineTotal;

    itemsTableLines.push(
      `${index + 1}. SKU: ${item.sku}\n` +
      `   Item: ${item.name}\n` +
      `   Current Stock: ${item.stock} | Alert Threshold: ${item.threshold}\n` +
      `   Quantity Requested: ${qtyToOrder} units @ ${formatCurrency(item.cost)}/unit\n` +
      `   Estimated Subtotal: ${formatCurrency(lineTotal)}\n`
    );
  });

  const supplierDisplay = targetSupplier === 'all' ? 'Partner Fulfillment & Supply Team' : targetSupplier;

  const draftBody =
`TO: ${supplierDisplay}
DATE: ${today}
PURCHASE ORDER REF: ${poNumber}
URGENCY: Low Inventory Reorder Notification

Dear Fulfillment & Supply Partner,

Please review and confirm our replenishment purchase order for the following line items currently below safety stock levels:

============================================================
REORDER LINE ITEMS:
============================================================
${itemsTableLines.join('\n')}
============================================================
TOTAL ESTIMATED ORDER VALUE: ${formatCurrency(totalPOAmount)}
============================================================

SHIPPING & BILLING TERMS:
- Standard Delivery: Net 30 or standard supplier terms
- Delivery Address: Central E-Commerce Fulfillment Center, Dock 4
- Please confirm receipt, estimated ship date, and final pro-forma invoice.

Thank you for your prompt assistance!

Sincerely,
Inventory & Logistics Department
E-Commerce Operations Portal
`;

  bodyTextarea.value = draftBody;
}

function handleCopyPO() {
  const bodyTextarea = document.getElementById('po-email-body');
  if (!bodyTextarea) return;

  navigator.clipboard.writeText(bodyTextarea.value).then(() => {
    const btn = document.getElementById('copy-po-btn');
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = 'Copied to Clipboard!';
      setTimeout(() => { btn.innerHTML = orig; }, 2000);
    }
  }).catch(() => {
    bodyTextarea.select();
    document.execCommand('copy');
    alert('Copied to clipboard.');
  });
}

function handleMailtoPO() {
  const supplierSelect = document.getElementById('po-supplier-select');
  const subjectInput = document.getElementById('po-email-subject');
  const bodyTextarea = document.getElementById('po-email-body');

  const to = (supplierSelect && supplierSelect.value !== 'all') ? supplierSelect.value : '';
  const subject = encodeURIComponent(subjectInput ? subjectInput.value : 'Purchase Order Restock');
  const body = encodeURIComponent(bodyTextarea ? bodyTextarea.value : '');

  window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
}

// CSV Export and Import
function exportCSV() {
  if (inventory.length === 0) {
    alert('Inventory is empty. Nothing to export.');
    return;
  }

  const headers = ['SKU', 'Product Name', 'Current Stock', 'Min Threshold', 'Unit Cost', 'Supplier Email', 'Risk Level', 'Total Value'];
  const rows = inventory.map(item => {
    const risk = getRiskLevel(item.stock, item.threshold);
    const val = (item.stock * item.cost).toFixed(2);
    return [
      `"${item.sku.replace(/"/g, '""')}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      item.stock,
      item.threshold,
      item.cost.toFixed(2),
      `"${item.supplier.replace(/"/g, '""')}"`,
      risk,
      val
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inventory_stock_alert_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function handleCSVImport(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const text = event.target?.result;
    if (typeof text !== 'string') return;

    try {
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        alert('CSV file has no data rows.');
        return;
      }

      const newItems = [];
      for (let i = 1; i < lines.length; i++) {
        // Basic CSV split accounting for quoted strings
        const cols = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
        if (cols && cols.length >= 4) {
          const clean = cols.map(c => c.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
          const sku = clean[0] || `SKU-${Date.now()}-${i}`;
          const name = clean[1] || 'Imported Product';
          const stock = parseInt(clean[2], 10) || 0;
          const threshold = parseInt(clean[3], 10) || 10;
          const cost = clean[4] ? parseFloat(clean[4]) || 10.0 : 10.0;
          const supplier = clean[5] || 'supplier@example.com';

          newItems.push({
            id: 'prod-' + Date.now() + '-' + i,
            sku,
            name,
            stock,
            threshold,
            cost,
            supplier
          });
        }
      }

      if (newItems.length > 0) {
        if (confirm(`Imported ${newItems.length} products. Do you want to replace current inventory? Click OK to replace, Cancel to append.`)) {
          inventory = newItems;
        } else {
          inventory = [...newItems, ...inventory];
        }
        saveInventory();
        renderTable();
        alert(`Successfully imported ${newItems.length} products.`);
      }
    } catch (err) {
      console.error('Error importing CSV:', err);
      alert('Failed to parse CSV file. Please ensure correct format.');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

// Event bindings
document.addEventListener('DOMContentLoaded', () => {
  loadInventory();
  renderTable();

  // Search & Filter listeners
  document.getElementById('search-input')?.addEventListener('input', renderTable);
  document.getElementById('status-filter')?.addEventListener('change', renderTable);
  document.getElementById('sort-select')?.addEventListener('change', renderTable);

  // Add Product button
  document.getElementById('add-product-btn')?.addEventListener('click', () => openProductModal());
  document.getElementById('close-product-modal')?.addEventListener('click', closeProductModal);
  document.getElementById('cancel-product-modal')?.addEventListener('click', closeProductModal);
  document.getElementById('product-form')?.addEventListener('submit', handleSaveProduct);

  // PO Modal listeners
  document.getElementById('generate-po-btn')?.addEventListener('click', openPOModal);
  document.getElementById('close-po-modal')?.addEventListener('click', closePOModal);
  document.getElementById('po-supplier-select')?.addEventListener('change', updatePODraft);
  document.getElementById('po-buffer-select')?.addEventListener('change', updatePODraft);
  document.getElementById('copy-po-btn')?.addEventListener('click', handleCopyPO);
  document.getElementById('mailto-po-btn')?.addEventListener('click', handleMailtoPO);

  // Sample data button
  document.getElementById('load-sample-btn')?.addEventListener('click', () => {
    if (confirm('Load sample inventory dataset? This will reset custom edits.')) {
      inventory = JSON.parse(JSON.stringify(SAMPLE_PRODUCTS));
      saveInventory();
      renderTable();
    }
  });

  // Export / Import CSV
  document.getElementById('export-csv-btn')?.addEventListener('click', exportCSV);
  const csvFileInput = document.getElementById('csv-file-input');
  document.getElementById('import-csv-btn')?.addEventListener('click', () => csvFileInput?.click());
  csvFileInput?.addEventListener('change', handleCSVImport);

  // Table row delegations (stock +/-, edit, delete)
  const tbody = document.getElementById('inventory-tbody');
  if (tbody) {
    tbody.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target) return;

      const id = target.dataset.id;
      if (!id) return;

      if (target.classList.contains('btn-stock-inc')) {
        const item = inventory.find(p => p.id === id);
        if (item) {
          item.stock++;
          saveInventory();
          renderTable();
        }
      } else if (target.classList.contains('btn-stock-dec')) {
        const item = inventory.find(p => p.id === id);
        if (item && item.stock > 0) {
          item.stock--;
          saveInventory();
          renderTable();
        }
      } else if (target.classList.contains('btn-edit-prod')) {
        openProductModal(id);
      } else if (target.classList.contains('btn-delete-prod')) {
        const item = inventory.find(p => p.id === id);
        if (item && confirm(`Delete product "${item.name}" (${item.sku})?`)) {
          inventory = inventory.filter(p => p.id !== id);
          saveInventory();
          renderTable();
        }
      }
    });

    tbody.addEventListener('change', (e) => {
      const input = e.target;
      if (input.classList.contains('input-stock-direct')) {
        const id = input.dataset.id;
        const val = Math.max(0, parseInt(input.value, 10) || 0);
        const item = inventory.find(p => p.id === id);
        if (item) {
          item.stock = val;
          saveInventory();
          renderTable();
        }
      }
    });
  }

  // Close modals on clicking outside
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      e.target.classList.remove('active');
    }
  });
});