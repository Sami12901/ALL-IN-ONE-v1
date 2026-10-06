// Product Analytics & Return Rate Auditor Engine

const STORAGE_KEY = 'product_analytics_dataset';

const SAMPLE_DATASET = [
  { id: 'pa-1', sku: 'AUD-ANC-01', name: 'AeroSound Pro Noise-Cancelling Headphones', category: 'Audio', unitsSold: 580, revenue: 167620, margin: 52.0, returnRate: 3.4, rating: 4.8 },
  { id: 'pa-2', sku: 'KB-MECH-RGB', name: 'Vortex RGB Mechanical Gaming Keyboard', category: 'Peripherals', unitsSold: 940, revenue: 79900, margin: 44.5, returnRate: 6.8, rating: 4.5 },
  { id: 'pa-3', sku: 'MOU-WL-ULTRA', name: 'ErgoGlide Ultra Wireless Mouse', category: 'Peripherals', unitsSold: 1420, revenue: 56800, margin: 61.0, returnRate: 4.1, rating: 4.7 },
  { id: 'pa-4', sku: 'DRN-4K-PRO', name: 'SkyPulse 4K Aerial Gimbal Drone', category: 'Drones & Video', unitsSold: 185, revenue: 147815, margin: 38.0, returnRate: 14.5, rating: 3.8 },
  { id: 'pa-5', sku: 'CAM-4K-STREAM', name: 'ApexCam 4K UHD Streaming Webcam', category: 'Cameras', unitsSold: 610, revenue: 45750, margin: 48.0, returnRate: 5.2, rating: 4.6 },
  { id: 'pa-6', sku: 'VR-HEADSET-X', name: 'NeuroVision VR Immersive Headset', category: 'VR & Gaming', unitsSold: 210, revenue: 125790, margin: 29.5, returnRate: 16.2, rating: 3.6 },
  { id: 'pa-7', sku: 'CH-ERGON-PRO', name: 'AeroSpine Executive Mesh Chair', category: 'Furniture', unitsSold: 340, revenue: 135660, margin: 55.0, returnRate: 11.8, rating: 4.1 },
  { id: 'pa-8', sku: 'HUB-10IN1-ALU', name: '10-in-1 Aluminium USB-C Docking Station', category: 'Accessories', unitsSold: 1150, revenue: 69000, margin: 65.0, returnRate: 2.8, rating: 4.9 },
  { id: 'pa-9', sku: 'SPK-BT-RUGGED', name: 'TitanSound Rugged Waterproof Speaker', category: 'Audio', unitsSold: 780, revenue: 39000, margin: 42.0, returnRate: 7.5, rating: 4.3 },
  { id: 'pa-10', sku: 'MON-4K-27IN', name: 'Lumix 27-inch 4K Studio Monitor', category: 'Monitors', unitsSold: 320, revenue: 112000, margin: 32.0, returnRate: 5.9, rating: 4.4 }
];

let dataset = [];

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      dataset = JSON.parse(raw);
    } else {
      dataset = [...SAMPLE_DATASET];
      saveData();
    }
  } catch (err) {
    console.error('Failed to load dataset:', err);
    dataset = [...SAMPLE_DATASET];
  }
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataset));
  } catch (err) {
    console.error('Failed to save dataset:', err);
  }
}

function formatUSD(num) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
}

function getMatrixClassification(item, medianRevenue) {
  const isHighMargin = item.margin >= 45;
  const isHighRev = item.revenue >= medianRevenue;

  if (isHighMargin && isHighRev) return { label: 'Star Product', class: 'badge-star' };
  if (!isHighMargin && isHighRev) return { label: 'Volume Driver', class: 'badge-driver' };
  if (isHighMargin && !isHighRev) return { label: 'High Potential', class: 'badge-opportunity' };
  return { label: 'Underperformer', class: 'badge-underperformer' };
}

function getReturnRiskLevel(rate) {
  if (rate >= 10.0) return 'critical';
  if (rate >= 6.0) return 'warning';
  return 'healthy';
}

function calculateKPIs() {
  if (dataset.length === 0) {
    return {
      grossRev: 0,
      totalUnits: 0,
      returnLoss: 0,
      netRev: 0,
      avgReturn: 0,
      avgMargin: 0,
      highRiskCount: 0,
      medianRevenue: 0,
      topCategory: 'N/A'
    };
  }

  let grossRev = 0;
  let totalUnits = 0;
  let returnLoss = 0;
  let sumReturn = 0;
  let sumMargin = 0;
  let highRiskCount = 0;
  const catRevMap = {};

  const sortedRevs = [...dataset].map(d => d.revenue).sort((a, b) => a - b);
  const medianRevenue = sortedRevs[Math.floor(sortedRevs.length / 2)] || 0;

  dataset.forEach(d => {
    grossRev += d.revenue;
    totalUnits += d.unitsSold;
    const loss = (d.revenue * (d.returnRate / 100));
    returnLoss += loss;
    sumReturn += d.returnRate;
    sumMargin += d.margin;

    if (d.returnRate >= 10.0) {
      highRiskCount++;
    }

    const cat = d.category || 'General';
    catRevMap[cat] = (catRevMap[cat] || 0) + d.revenue;
  });

  let topCategory = 'N/A';
  let maxCatRev = -1;
  for (const [cat, rev] of Object.entries(catRevMap)) {
    if (rev > maxCatRev) {
      maxCatRev = rev;
      topCategory = cat;
    }
  }

  return {
    grossRev,
    totalUnits,
    returnLoss,
    netRev: Math.max(0, grossRev - returnLoss),
    avgReturn: sumReturn / dataset.length,
    avgMargin: sumMargin / dataset.length,
    highRiskCount,
    medianRevenue,
    topCategory
  };
}

function updateKPIs() {
  const kpis = calculateKPIs();

  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setText('kpi-gross-rev', formatUSD(kpis.grossRev));
  setText('kpi-total-units', `${kpis.totalUnits.toLocaleString()} units sold`);
  setText('kpi-net-rev', formatUSD(kpis.netRev));
  setText('kpi-return-loss', `-${formatUSD(kpis.returnLoss)} estimated return loss`);
  setText('kpi-avg-return', `${kpis.avgReturn.toFixed(1)}%`);
  setText('kpi-high-risk-count', `${kpis.highRiskCount} products > 10% risk threshold`);
  setText('kpi-avg-margin', `${kpis.avgMargin.toFixed(1)}%`);
  setText('kpi-top-category', `Top Category: ${kpis.topCategory}`);

  const riskBadge = document.getElementById('risk-alert-count-badge');
  if (riskBadge) {
    riskBadge.textContent = `${kpis.highRiskCount} High Risk`;
  }
}

function renderLeaderboards() {
  const bestSellersContainer = document.getElementById('best-sellers-list');
  const returnRiskContainer = document.getElementById('return-risk-list');

  if (bestSellersContainer) {
    const topSellers = [...dataset].sort((a, b) => b.revenue - a.revenue).slice(0, 4);
    bestSellersContainer.innerHTML = '';
    if (topSellers.length === 0) {
      bestSellersContainer.innerHTML = '<div style="font-size:0.8rem; color:var(--text-secondary);">No products loaded.</div>';
    } else {
      topSellers.forEach((item, idx) => {
        const row = document.createElement('div');
        row.className = 'mini-item';
        row.innerHTML = `
          <div class="mini-item-info">
            <span class="mini-item-name">#${idx + 1} ${escapeHtml(item.name)}</span>
            <span class="mini-item-sub">${item.unitsSold.toLocaleString()} units &bull; ${item.margin}% margin &bull; ★ ${item.rating}</span>
          </div>
          <div class="mini-item-stat">
            <div class="mini-stat-val">${formatUSD(item.revenue)}</div>
            <span class="mini-stat-badge badge-star">Top Seller</span>
          </div>
        `;
        bestSellersContainer.appendChild(row);
      });
    }
  }

  if (returnRiskContainer) {
    const highReturnItems = [...dataset].sort((a, b) => b.returnRate - a.returnRate).filter(i => i.returnRate >= 6.0).slice(0, 4);
    returnRiskContainer.innerHTML = '';
    if (highReturnItems.length === 0) {
      returnRiskContainer.innerHTML = '<div style="font-size:0.8rem; color:var(--text-secondary);">All products have healthy return rates (&lt; 6%).</div>';
    } else {
      highReturnItems.forEach(item => {
        const returnLoss = (item.revenue * (item.returnRate / 100));
        const isCritical = item.returnRate >= 10.0;
        const row = document.createElement('div');
        row.className = 'mini-item';
        row.innerHTML = `
          <div class="mini-item-info">
            <span class="mini-item-name">${escapeHtml(item.name)}</span>
            <span class="mini-item-sub">Return Rate: <strong style="color: ${isCritical ? '#ef4444' : '#f59e0b'};">${item.returnRate}%</strong> &bull; Rating: ★ ${item.rating}</span>
          </div>
          <div class="mini-item-stat">
            <div class="mini-stat-val" style="color: #ef4444;">-${formatUSD(returnLoss)}</div>
            <span class="mini-stat-badge ${isCritical ? 'status-critical' : 'status-warning'}">${isCritical ? 'High Risk' : 'Warning'}</span>
          </div>
        `;
        returnRiskContainer.appendChild(row);
      });
    }
  }
}

function renderTable() {
  const tbody = document.getElementById('analytics-tbody');
  if (!tbody) return;

  const kpis = calculateKPIs();
  const searchQuery = (document.getElementById('table-search')?.value || '').toLowerCase().trim();
  const catFilter = document.getElementById('table-filter-category')?.value || 'all';
  const sortMode = document.getElementById('table-sort-by')?.value || 'revenue-desc';

  let filtered = dataset.filter(item => {
    if (catFilter !== 'all' && item.category !== catFilter) return false;
    if (searchQuery) {
      const matchName = (item.name || '').toLowerCase().includes(searchQuery);
      const matchSku = (item.sku || '').toLowerCase().includes(searchQuery);
      const matchCat = (item.category || '').toLowerCase().includes(searchQuery);
      if (!matchName && !matchSku && !matchCat) return false;
    }
    return true;
  });

  // Sorting
  filtered.sort((a, b) => {
    if (sortMode === 'revenue-desc') return b.revenue - a.revenue;
    if (sortMode === 'units-desc') return b.unitsSold - a.unitsSold;
    if (sortMode === 'return-desc') return b.returnRate - a.returnRate;
    if (sortMode === 'margin-desc') return b.margin - a.margin;
    if (sortMode === 'rating-desc') return b.rating - a.rating;
    return 0;
  });

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 2.5rem; color: var(--text-secondary);">No products match filter criteria.</td></tr>`;
    return;
  }

  filtered.forEach(item => {
    const returnLoss = item.revenue * (item.returnRate / 100);
    const matrix = getMatrixClassification(item, kpis.medianRevenue);
    const risk = getReturnRiskLevel(item.returnRate);

    let returnBadgeColor = '#10b981';
    if (risk === 'critical') returnBadgeColor = '#ef4444';
    else if (risk === 'warning') returnBadgeColor = '#f59e0b';

    const tr = document.createElement('tr');
    tr.dataset.id = item.id;
    tr.innerHTML = `
      <td><strong style="font-family: monospace; color: var(--accent);">${escapeHtml(item.sku)}</strong></td>
      <td>
        <div style="font-weight: 600; color: var(--text-primary);">${escapeHtml(item.name)}</div>
        <div style="font-size: 0.75rem; color: var(--text-secondary);">${escapeHtml(item.category)}</div>
      </td>
      <td><strong>${item.unitsSold.toLocaleString()}</strong></td>
      <td><strong style="color: var(--text-primary);">${formatUSD(item.revenue)}</strong></td>
      <td>${item.margin.toFixed(1)}%</td>
      <td><strong style="color: ${returnBadgeColor};">${item.returnRate.toFixed(1)}%</strong></td>
      <td style="color: #ef4444;">-${formatUSD(returnLoss)}</td>
      <td><span style="color: #f59e0b; font-weight: 700;">★ ${item.rating.toFixed(1)}</span></td>
      <td><span class="mini-stat-badge ${matrix.class}">${matrix.label}</span></td>
      <td style="text-align: right;">
        <div style="display: inline-flex; gap: 0.35rem; justify-content: flex-end;">
          <button type="button" class="btn btn-secondary btn-edit-item" data-id="${item.id}" style="padding: 0.3rem 0.5rem; font-size: 0.75rem;" title="Edit">
            Edit
          </button>
          <button type="button" class="btn btn-secondary btn-delete-item" data-id="${item.id}" style="padding: 0.3rem 0.5rem; font-size: 0.75rem; color: var(--error);" title="Delete">
            &times;
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function populateCategories() {
  const select = document.getElementById('table-filter-category');
  if (!select) return;

  const current = select.value;
  const categories = Array.from(new Set(dataset.map(d => (d.category || '').trim()).filter(Boolean))).sort();

  select.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    if (c === current) opt.selected = true;
    select.appendChild(opt);
  });
}

// Interactive SVG Chart Renderer
function renderSVGChart() {
  const svg = document.getElementById('analytics-svg');
  const tooltip = document.getElementById('chart-tooltip');
  const container = document.getElementById('chart-container');
  const metricSelect = document.getElementById('chart-metric-select');
  if (!svg || !tooltip || !container || dataset.length === 0) return;

  const mode = metricSelect ? metricSelect.value : 'rev-return';
  const width = 680;
  const height = 320;
  const padding = { top: 30, right: 30, bottom: 45, left: 65 };

  // Determine X and Y bounds
  let getX, getY, xLabel, yLabel, formatX, formatY;

  if (mode === 'rev-return') {
    getX = d => d.returnRate;
    getY = d => d.revenue;
    xLabel = 'Return Rate (%)';
    yLabel = 'Gross Revenue ($)';
    formatX = v => `${v.toFixed(1)}%`;
    formatY = v => formatUSD(v);
  } else if (mode === 'margin-return') {
    getX = d => d.returnRate;
    getY = d => d.margin;
    xLabel = 'Return Rate (%)';
    yLabel = 'Profit Margin (%)';
    formatX = v => `${v.toFixed(1)}%`;
    formatY = v => `${v.toFixed(0)}%`;
  } else {
    getX = d => d.rating;
    getY = d => d.unitsSold;
    xLabel = 'Customer Rating (1 - 5)';
    yLabel = 'Units Sold';
    formatX = v => `★ ${v.toFixed(1)}`;
    formatY = v => v.toLocaleString();
  }

  const xVals = dataset.map(getX);
  const yVals = dataset.map(getY);

  const minX = Math.min(0, Math.min(...xVals));
  const maxX = Math.max(1, Math.max(...xVals) * 1.15);
  const minY = 0;
  const maxY = Math.max(1, Math.max(...yVals) * 1.15);

  const scaleX = v => padding.left + ((v - minX) / (maxX - minX)) * (width - padding.left - padding.right);
  const scaleY = v => height - padding.bottom - ((v - minY) / (maxY - minY)) * (height - padding.top - padding.bottom);

  // Build SVG content
  let svgContent = '';

  // Background Grid Lines
  const gridTicks = 5;
  for (let i = 0; i <= gridTicks; i++) {
    const yVal = minY + (maxY - minY) * (i / gridTicks);
    const yPos = scaleY(yVal);
    svgContent += `<line x1="${padding.left}" y1="${yPos}" x2="${width - padding.right}" y2="${yPos}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3,3" />`;
    svgContent += `<text x="${padding.left - 8}" y="${yPos + 4}" fill="#9ca3af" font-size="10" text-anchor="end">${formatY(yVal)}</text>`;
  }

  // X Axis Ticks
  for (let i = 0; i <= gridTicks; i++) {
    const xVal = minX + (maxX - minX) * (i / gridTicks);
    const xPos = scaleX(xVal);
    svgContent += `<line x1="${xPos}" y1="${height - padding.bottom}" x2="${xPos}" y2="${padding.top}" stroke="rgba(255,255,255,0.05)" />`;
    svgContent += `<text x="${xPos}" y="${height - padding.bottom + 16}" fill="#9ca3af" font-size="10" text-anchor="middle">${formatX(xVal)}</text>`;
  }

  // Axes lines
  svgContent += `<line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />`;
  svgContent += `<line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />`;

  // Axis Labels
  svgContent += `<text x="${(width + padding.left) / 2}" y="${height - 8}" fill="#9ca3af" font-size="11" font-weight="600" text-anchor="middle">${xLabel}</text>`;
  svgContent += `<text x="14" y="${padding.top - 12}" fill="#9ca3af" font-size="11" font-weight="600" text-anchor="start">${yLabel}</text>`;

  // Data Points / Bubbles
  dataset.forEach((item, index) => {
    const cx = scaleX(getX(item));
    const cy = scaleY(getY(item));
    const risk = getReturnRiskLevel(item.returnRate);

    let fillColor = '#10b981';
    if (risk === 'critical') fillColor = '#ef4444';
    else if (risk === 'warning') fillColor = '#f59e0b';

    const r = Math.max(7, Math.min(14, 6 + (item.unitsSold / 200)));

    svgContent += `
      <circle 
        cx="${cx}" 
        cy="${cy}" 
        r="${r}" 
        fill="${fillColor}" 
        fill-opacity="0.8" 
        stroke="#ffffff" 
        stroke-width="1.5" 
        class="chart-bubble" 
        data-index="${index}" 
        style="cursor: pointer; transition: transform 0.2s, r 0.2s;"
      />
    `;
  });

  svg.innerHTML = svgContent;

  // Add interactivity
  const bubbles = svg.querySelectorAll('.chart-bubble');
  bubbles.forEach(b => {
    b.addEventListener('mouseenter', (e) => {
      const idx = parseInt(e.target.dataset.index, 10);
      const item = dataset[idx];
      if (!item) return;

      e.target.setAttribute('r', '16');
      e.target.setAttribute('stroke', '#38bdf8');
      e.target.setAttribute('stroke-width', '3');

      tooltip.innerHTML = `
        <div style="font-weight: 700; color: #ffffff; margin-bottom: 0.2rem;">${escapeHtml(item.name)}</div>
        <div style="color: #93c5fd; font-family: monospace;">SKU: ${escapeHtml(item.sku)} | ${escapeHtml(item.category)}</div>
        <div style="display: flex; gap: 0.8rem; margin-top: 0.35rem;">
          <span>Rev: <strong>${formatUSD(item.revenue)}</strong></span>
          <span>Units: <strong>${item.unitsSold}</strong></span>
          <span>Return: <strong style="color: ${item.returnRate >= 10 ? '#ef4444' : '#10b981'};">${item.returnRate}%</strong></span>
          <span>Margin: <strong>${item.margin}%</strong></span>
        </div>
      `;
      tooltip.classList.add('active');

      // Position tooltip relative to container
      const rect = container.getBoundingClientRect();
      const circleRect = e.target.getBoundingClientRect();
      const left = circleRect.left - rect.left + (circleRect.width / 2);
      const top = circleRect.top - rect.top;

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
    });

    b.addEventListener('mouseleave', (e) => {
      const idx = parseInt(e.target.dataset.index, 10);
      const item = dataset[idx];
      const r = item ? Math.max(7, Math.min(14, 6 + (item.unitsSold / 200))) : 8;
      e.target.setAttribute('r', r.toString());
      e.target.setAttribute('stroke', '#ffffff');
      e.target.setAttribute('stroke-width', '1.5');
      tooltip.classList.remove('active');
    });
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

// Modal logic
function openModal(prodId = null) {
  const modal = document.getElementById('analytics-modal');
  const heading = document.getElementById('modal-heading');
  const form = document.getElementById('analytics-form');
  const editId = document.getElementById('edit-prod-id');
  if (!modal || !form) return;

  if (prodId) {
    const item = dataset.find(d => d.id === prodId);
    if (!item) return;
    heading.textContent = 'Edit Product Performance Record';
    editId.value = item.id;
    document.getElementById('input-sku').value = item.sku;
    document.getElementById('input-name').value = item.name;
    document.getElementById('input-category').value = item.category;
    document.getElementById('input-units').value = item.unitsSold;
    document.getElementById('input-revenue').value = item.revenue;
    document.getElementById('input-margin').value = item.margin;
    document.getElementById('input-return').value = item.returnRate;
    document.getElementById('input-rating').value = item.rating;
  } else {
    heading.textContent = 'Add Product Performance Record';
    form.reset();
    editId.value = '';
    document.getElementById('input-units').value = '100';
    document.getElementById('input-revenue').value = '25000';
    document.getElementById('input-margin').value = '45';
    document.getElementById('input-return').value = '4.5';
    document.getElementById('input-rating').value = '4.7';
  }

  modal.classList.add('active');
}

function closeModal() {
  const modal = document.getElementById('analytics-modal');
  if (modal) modal.classList.remove('active');
}

function handleSaveProduct(e) {
  e.preventDefault();
  const editId = document.getElementById('edit-prod-id').value;
  const sku = document.getElementById('input-sku').value.trim();
  const name = document.getElementById('input-name').value.trim();
  const category = document.getElementById('input-category').value.trim() || 'General';
  const unitsSold = parseInt(document.getElementById('input-units').value, 10) || 0;
  const revenue = parseFloat(document.getElementById('input-revenue').value) || 0;
  const margin = parseFloat(document.getElementById('input-margin').value) || 0;
  const returnRate = parseFloat(document.getElementById('input-return').value) || 0;
  const rating = parseFloat(document.getElementById('input-rating').value) || 5;

  if (!sku || !name) {
    alert('Please enter SKU and Product Name.');
    return;
  }

  if (editId) {
    const idx = dataset.findIndex(d => d.id === editId);
    if (idx !== -1) {
      dataset[idx] = { ...dataset[idx], sku, name, category, unitsSold, revenue, margin, returnRate, rating };
    }
  } else {
    dataset.unshift({
      id: 'pa-' + Date.now(),
      sku,
      name,
      category,
      unitsSold,
      revenue,
      margin,
      returnRate,
      rating
    });
  }

  saveData();
  populateCategories();
  updateKPIs();
  renderLeaderboards();
  renderTable();
  renderSVGChart();
  closeModal();
}

function exportCSV() {
  if (dataset.length === 0) {
    alert('No data to export.');
    return;
  }

  const kpis = calculateKPIs();
  const headers = ['SKU', 'Product Name', 'Category', 'Units Sold', 'Gross Revenue', 'Profit Margin (%)', 'Return Rate (%)', 'Return Loss ($)', 'Customer Rating', 'Portfolio Classification'];
  const rows = dataset.map(item => {
    const loss = (item.revenue * (item.returnRate / 100)).toFixed(2);
    const matrix = getMatrixClassification(item, kpis.medianRevenue).label;
    return [
      `"${item.sku.replace(/"/g, '""')}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.category.replace(/"/g, '""')}"`,
      item.unitsSold,
      item.revenue.toFixed(2),
      item.margin.toFixed(1),
      item.returnRate.toFixed(1),
      loss,
      item.rating.toFixed(1),
      `"${matrix}"`
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `product_analytics_audit_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Lifecycle Init
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  populateCategories();
  updateKPIs();
  renderLeaderboards();
  renderTable();
  renderSVGChart();

  // Search, Filters, and Chart mode switch
  document.getElementById('table-search')?.addEventListener('input', renderTable);
  document.getElementById('table-filter-category')?.addEventListener('change', renderTable);
  document.getElementById('table-sort-by')?.addEventListener('change', renderTable);
  document.getElementById('chart-metric-select')?.addEventListener('change', renderSVGChart);

  // Modal controls
  document.getElementById('btn-add-product')?.addEventListener('click', () => openModal());
  document.getElementById('close-modal-btn')?.addEventListener('click', closeModal);
  document.getElementById('cancel-modal-btn')?.addEventListener('click', closeModal);
  document.getElementById('analytics-form')?.addEventListener('submit', handleSaveProduct);

  // Sample data button
  document.getElementById('btn-sample-data')?.addEventListener('click', () => {
    if (confirm('Reset to standard product analytics sample dataset?')) {
      dataset = JSON.parse(JSON.stringify(SAMPLE_DATASET));
      saveData();
      populateCategories();
      updateKPIs();
      renderLeaderboards();
      renderTable();
      renderSVGChart();
    }
  });

  // Export CSV
  document.getElementById('btn-export-csv')?.addEventListener('click', exportCSV);

  // Table edit / delete actions
  const tbody = document.getElementById('analytics-tbody');
  if (tbody) {
    tbody.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.btn-edit-item');
      if (editBtn) {
        openModal(editBtn.dataset.id);
        return;
      }

      const delBtn = e.target.closest('.btn-delete-item');
      if (delBtn) {
        const id = delBtn.dataset.id;
        const item = dataset.find(d => d.id === id);
        if (item && confirm(`Delete "${item.name}" (${item.sku})?`)) {
          dataset = dataset.filter(d => d.id !== id);
          saveData();
          populateCategories();
          updateKPIs();
          renderLeaderboards();
          renderTable();
          renderSVGChart();
        }
      }
    });
  }

  // Backdrop click close
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      e.target.classList.remove('active');
    }
  });

  // Responsive re-render for SVG chart
  window.addEventListener('resize', () => {
    renderSVGChart();
  });
});