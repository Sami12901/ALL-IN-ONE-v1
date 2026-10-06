// E-Commerce Sales Revenue & Trend Analyzer Logic
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Source & Controls
  const dropZone = document.getElementById('drop-zone');
  const csvFileInput = document.getElementById('csv-file-input');
  const loadSampleBtn = document.getElementById('load-sample-btn');
  const downloadTemplateBtn = document.getElementById('download-template-btn');
  const exportSummaryBtn = document.getElementById('export-summary-btn');
  const clearDataBtn = document.getElementById('clear-data-btn');
  
  const datasetBanner = document.getElementById('dataset-banner');
  const datasetInfoText = document.getElementById('dataset-info-text');
  const dateRangeBadge = document.getElementById('date-range-badge');

  // KPI Elements
  const kpiGrossRev = document.getElementById('kpi-gross-rev');
  const kpiRevSub = document.getElementById('kpi-rev-sub');
  const kpiTotalOrders = document.getElementById('kpi-total-orders');
  const kpiAov = document.getElementById('kpi-aov');
  const kpiUnitsSold = document.getElementById('kpi-units-sold');
  const kpiUnitsSub = document.getElementById('kpi-units-sub');

  // Chart Elements
  const btnChartDaily = document.getElementById('btn-chart-daily');
  const btnChartWeekly = document.getElementById('btn-chart-weekly');
  const salesSvg = document.getElementById('sales-svg');
  const chartTooltip = document.getElementById('chart-tooltip');
  const chartContainer = document.getElementById('chart-container');

  // Top Products & Table Elements
  const topProductsContainer = document.getElementById('top-products-container');
  const btnTableDaily = document.getElementById('btn-table-daily');
  const btnTableWeekly = document.getElementById('btn-table-weekly');
  const breakdownTableBody = document.getElementById('breakdown-table-body');

  // State
  let transactions = [];
  let chartGranularity = 'daily'; // 'daily' or 'weekly'
  let tableGranularity = 'daily'; // 'daily' or 'weekly'

  // Sample Dataset Generator
  function generateSampleTransactions() {
    const products = [
      { name: 'Ultra-Quiet Mechanical Keyboard', price: 129.99, category: 'Electronics' },
      { name: 'Ergonomic Memory Foam Mousepad', price: 29.50, category: 'Accessories' },
      { name: 'Studio Monitoring Headphones', price: 199.00, category: 'Audio' },
      { name: '4K USB-C Video Capture Card', price: 149.99, category: 'Electronics' },
      { name: 'Aluminum Laptop Riser Stand', price: 45.00, category: 'Office' },
      { name: 'Braided Thunderbolt 4 Cable 2m', price: 34.00, category: 'Cables' },
      { name: 'Magnetic Desk Cable Organizer', price: 18.50, category: 'Office' },
      { name: 'High-Fidelity USB Microphone', price: 119.00, category: 'Audio' }
    ];

    const sampleOrders = [];
    const now = new Date();
    // Generate transactions for the last 21 days
    for (let i = 21; i >= 0; i--) {
      const orderDate = new Date(now);
      orderDate.setDate(now.getDate() - i);
      const dateStr = orderDate.toISOString().split('T')[0];

      // Random 2 to 6 orders per day
      const ordersToday = Math.floor(Math.random() * 5) + 2;
      for (let o = 0; o < ordersToday; o++) {
        const prod = products[Math.floor(Math.random() * products.length)];
        const qty = Math.random() > 0.8 ? (Math.random() > 0.5 ? 3 : 2) : 1;
        const total = parseFloat((prod.price * qty).toFixed(2));
        const orderId = `ORD-${dateStr.replace(/-/g, '')}-${1000 + sampleOrders.length + 1}`;

        sampleOrders.push({
          orderId,
          date: dateStr,
          product: prod.name,
          category: prod.category,
          quantity: qty,
          unitPrice: prod.price,
          total
        });
      }
    }
    return sampleOrders;
  }

  // Currency Formatter
  function formatMoney(amount) {
    if (isNaN(amount) || amount === null) return '$0.00';
    return `$${Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  // Parse CSV Content
  function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    // Parse header row
    const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
    
    // Find column indexes
    let idxId = headers.findIndex(h => h.includes('order') || h.includes('id'));
    let idxDate = headers.findIndex(h => h.includes('date') || h.includes('time'));
    let idxProd = headers.findIndex(h => h.includes('product') || h.includes('item') || h.includes('name'));
    let idxQty = headers.findIndex(h => h.includes('qty') || h.includes('quantity') || h.includes('count'));
    let idxPrice = headers.findIndex(h => h.includes('price') || h.includes('unit'));
    let idxTotal = headers.findIndex(h => h.includes('total') || h.includes('revenue') || h.includes('amount') || h.includes('gross'));

    if (idxDate === -1) idxDate = 1;
    if (idxProd === -1) idxProd = 2;
    if (idxQty === -1) idxQty = 3;
    if (idxTotal === -1 && idxPrice === -1) idxTotal = 4;

    const parsed = [];
    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);
      if (row.length <= 1) continue;

      const orderId = idxId !== -1 && row[idxId] ? row[idxId].trim() : `ORD-${i}`;
      let date = idxDate !== -1 && row[idxDate] ? row[idxDate].trim() : new Date().toISOString().split('T')[0];
      // Normalize date to YYYY-MM-DD if possible
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate.toISOString().split('T')[0];
      }

      const product = idxProd !== -1 && row[idxProd] ? row[idxProd].trim() : 'General Item';
      const quantity = idxQty !== -1 ? Math.max(1, parseInt(row[idxQty], 10) || 1) : 1;
      let unitPrice = idxPrice !== -1 ? parseFloat(row[idxPrice].replace(/[^0-9.-]/g, '')) || 0 : 0;
      let total = idxTotal !== -1 ? parseFloat(row[idxTotal].replace(/[^0-9.-]/g, '')) || 0 : (unitPrice * quantity);

      if (total === 0 && unitPrice > 0) total = unitPrice * quantity;
      if (unitPrice === 0 && quantity > 0 && total > 0) unitPrice = total / quantity;

      parsed.push({
        orderId,
        date,
        product,
        quantity,
        unitPrice,
        total: parseFloat(total.toFixed(2))
      });
    }

    return parsed;
  }

  // Parse Single CSV Line with quotes support
  function parseCSVLine(line) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        if (inQuotes && line[i + 1] === char) {
          cur += char;
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(cur);
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur);
    return result;
  }

  // Process and Analyze Dataset
  function analyzeData() {
    if (transactions.length === 0) {
      clearUI();
      return;
    }

    // Sort by date ascending
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate Overall KPIs
    let grossRev = 0;
    let unitsSold = 0;
    const uniqueOrders = new Set();
    const productStats = {};
    const dailyMap = {};
    const weeklyMap = {};

    transactions.forEach(t => {
      grossRev += t.total;
      unitsSold += t.quantity;
      uniqueOrders.add(t.orderId);

      // Product stats
      if (!productStats[t.product]) {
        productStats[t.product] = { name: t.product, revenue: 0, units: 0 };
      }
      productStats[t.product].revenue += t.total;
      productStats[t.product].units += t.quantity;

      // Daily breakdown
      if (!dailyMap[t.date]) {
        dailyMap[t.date] = { period: t.date, orders: new Set(), units: 0, revenue: 0 };
      }
      dailyMap[t.date].orders.add(t.orderId);
      dailyMap[t.date].units += t.quantity;
      dailyMap[t.date].revenue += t.total;

      // Weekly breakdown (ISO Week key: YYYY-Www)
      const weekKey = getWeekKey(new Date(t.date));
      if (!weeklyMap[weekKey]) {
        weeklyMap[weekKey] = { period: weekKey, orders: new Set(), units: 0, revenue: 0 };
      }
      weeklyMap[weekKey].orders.add(t.orderId);
      weeklyMap[weekKey].units += t.quantity;
      weeklyMap[weekKey].revenue += t.total;
    });

    const totalOrdersCount = uniqueOrders.size;
    const aov = totalOrdersCount > 0 ? (grossRev / totalOrdersCount) : 0;

    // Update KPI Displays
    kpiGrossRev.textContent = formatMoney(grossRev);
    kpiRevSub.textContent = `Across ${transactions.length} line items`;
    kpiTotalOrders.textContent = totalOrdersCount.toLocaleString();
    kpiAov.textContent = formatMoney(aov);
    kpiUnitsSold.textContent = unitsSold.toLocaleString();
    kpiUnitsSub.textContent = `Avg ${(unitsSold / Math.max(1, totalOrdersCount)).toFixed(1)} units/order`;

    // Dataset Banner
    datasetBanner.style.display = 'flex';
    clearDataBtn.style.display = 'inline-flex';
    datasetInfoText.textContent = `Active dataset: ${transactions.length} line items from ${totalOrdersCount} orders`;
    if (transactions.length > 0) {
      dateRangeBadge.textContent = `${transactions[0].date} → ${transactions[transactions.length - 1].date}`;
    }

    // Render Top 5 Products
    renderTopProducts(productStats, grossRev);

    // Render SVG Trend Chart
    renderChart(chartGranularity === 'daily' ? dailyMap : weeklyMap);

    // Render Breakdown Table
    renderTable(tableGranularity === 'daily' ? dailyMap : weeklyMap, grossRev);
  }

  // Helper for ISO Week key
  function getWeekKey(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }

  // Render Top 5 Products
  function renderTopProducts(productStats, totalGross) {
    const sorted = Object.values(productStats).sort((a, b) => b.revenue - a.revenue);
    const top5 = sorted.slice(0, 5);

    if (top5.length === 0) {
      topProductsContainer.innerHTML = '<div style="text-align:center; padding:2rem; color:var(--text-tertiary);">No product data found</div>';
      return;
    }

    const maxRev = top5[0].revenue || 1;
    topProductsContainer.innerHTML = '';

    top5.forEach((p, idx) => {
      const pctOfMax = Math.round((p.revenue / maxRev) * 100);
      const pctOfTotal = totalGross > 0 ? ((p.revenue / totalGross) * 100).toFixed(1) : 0;
      const rank = idx + 1;
      let rankClass = 'rank-badge';
      if (rank === 1) rankClass += ' rank-1';
      else if (rank === 2) rankClass += ' rank-2';
      else if (rank === 3) rankClass += ' rank-3';

      const row = document.createElement('div');
      row.className = 'product-row';
      row.innerHTML = `
        <div class="product-row-info">
          <div style="display:flex; align-items:center; gap:0.6rem; overflow:hidden;">
            <span class="${rankClass}">#${rank}</span>
            <strong style="color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHtml(p.name)}">
              ${escapeHtml(p.name)}
            </strong>
          </div>
          <div style="text-align:right; flex-shrink:0;">
            <div style="font-family:monospace; font-weight:700; color:var(--accent); font-size:0.95rem;">${formatMoney(p.revenue)}</div>
            <div style="font-size:0.75rem; color:var(--text-tertiary);">${p.units} units (${pctOfTotal}%)</div>
          </div>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" style="width: ${pctOfMax}%;"></div>
        </div>
      `;
      topProductsContainer.appendChild(row);
    });
  }

  // Render SVG Revenue Line / Area Chart
  function renderChart(periodMap) {
    const entries = Object.values(periodMap).sort((a, b) => a.period.localeCompare(b.period));
    if (entries.length === 0) {
      salesSvg.innerHTML = '<text x="400" y="140" text-anchor="middle" fill="#6b7280" font-size="14">No data available for chart</text>';
      return;
    }

    const svgWidth = 800;
    const svgHeight = 280;
    const padTop = 30;
    const padBottom = 40;
    const padLeft = 70;
    const padRight = 30;

    const plotWidth = svgWidth - padLeft - padRight;
    const plotHeight = svgHeight - padTop - padBottom;

    const maxRev = Math.max(...entries.map(e => e.revenue), 100);
    // Nice upper bound
    const upperLimit = Math.ceil(maxRev * 1.15 / 100) * 100;

    // Y scale helper
    const getY = (val) => padTop + plotHeight - ((val / upperLimit) * plotHeight);
    // X scale helper
    const getX = (idx) => padLeft + (entries.length === 1 ? plotWidth / 2 : (idx / (entries.length - 1)) * plotWidth);

    // Build SVG Elements
    let svgContent = `
      <defs>
        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#4e85bf" stop-opacity="0.38"/>
          <stop offset="100%" stop-color="#4e85bf" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
    `;

    // 4 Horizontal Gridlines & Y-Axis Labels
    const gridSteps = 4;
    for (let i = 0; i <= gridSteps; i++) {
      const stepVal = (upperLimit / gridSteps) * i;
      const yPos = getY(stepVal);
      svgContent += `
        <line x1="${padLeft}" y1="${yPos}" x2="${svgWidth - padRight}" y2="${yPos}" stroke="currentColor" stroke-opacity="0.1" stroke-dasharray="4,4" />
        <text x="${padLeft - 10}" y="${yPos + 4}" fill="#6b7280" font-size="11" text-anchor="end" font-family="monospace">${formatMoney(stepVal)}</text>
      `;
    }

    // Path points
    const points = entries.map((e, idx) => ({
      x: getX(idx),
      y: getY(e.revenue),
      entry: e
    }));

    if (points.length === 1) {
      // Single data point
      const p = points[0];
      svgContent += `
        <circle cx="${p.x}" cy="${p.y}" r="6" fill="#4e85bf" stroke="#ffffff" stroke-width="2"/>
        <text x="${p.x}" y="${svgHeight - 15}" fill="#9ca3af" font-size="11" text-anchor="middle">${p.entry.period}</text>
      `;
      salesSvg.innerHTML = svgContent;
      return;
    }

    // Area Path
    const linePathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const areaPathD = `${linePathD} L ${points[points.length - 1].x.toFixed(1)} ${padTop + plotHeight} L ${points[0].x.toFixed(1)} ${padTop + plotHeight} Z`;

    svgContent += `
      <path d="${areaPathD}" fill="url(#areaGradient)" />
      <path d="${linePathD}" fill="none" stroke="#4e85bf" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    `;

    // X-Axis tick labels (spaced intelligently)
    const labelInterval = Math.max(1, Math.floor(entries.length / 7));
    entries.forEach((e, idx) => {
      if (idx % labelInterval === 0 || idx === entries.length - 1) {
        const xPos = getX(idx);
        let labelText = e.period;
        if (labelText.length === 10) {
          // Format MM/DD
          labelText = labelText.substring(5);
        }
        svgContent += `
          <text x="${xPos}" y="${svgHeight - 12}" fill="#6b7280" font-size="10.5" text-anchor="middle" font-family="sans-serif">${labelText}</text>
        `;
      }
    });

    // Render interactive data points
    points.forEach((p, idx) => {
      svgContent += `
        <circle class="chart-point" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="#4e85bf" stroke="#ffffff" stroke-width="2" style="cursor:pointer; transition:all 0.2s;" data-idx="${idx}"></circle>
      `;
    });

    salesSvg.innerHTML = svgContent;

    // Attach Tooltip Events to SVG Points
    const svgPoints = salesSvg.querySelectorAll('.chart-point');
    svgPoints.forEach(pt => {
      pt.addEventListener('mouseenter', (e) => {
        const idx = parseInt(pt.getAttribute('data-idx'), 10);
        const data = points[idx].entry;
        pt.setAttribute('r', '7');
        pt.setAttribute('fill', '#89aacc');

        chartTooltip.innerHTML = `
          <strong>${data.period}</strong><br/>
          Revenue: <span style="color:#10b981; font-weight:700;">${formatMoney(data.revenue)}</span><br/>
          Orders: ${data.orders.size} (${data.units} units)
        `;
        chartTooltip.style.opacity = '1';

        const ptRect = pt.getBoundingClientRect();
        const containerRect = chartContainer.getBoundingClientRect();
        const left = ptRect.left - containerRect.left + 10;
        const top = ptRect.top - containerRect.top - 50;

        chartTooltip.style.left = `${Math.min(containerRect.width - 150, Math.max(10, left))}px`;
        chartTooltip.style.top = `${Math.max(10, top)}px`;
      });

      pt.addEventListener('mouseleave', () => {
        pt.setAttribute('r', '4');
        pt.setAttribute('fill', '#4e85bf');
        chartTooltip.style.opacity = '0';
      });
    });
  }

  // Render Granular Breakdown Table
  function renderTable(periodMap, totalGross) {
    const entries = Object.values(periodMap).sort((a, b) => b.period.localeCompare(a.period));
    breakdownTableBody.innerHTML = '';

    if (entries.length === 0) {
      breakdownTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-tertiary);">No sales records available.</td></tr>';
      return;
    }

    entries.forEach(item => {
      const ordersCount = item.orders.size;
      const aov = ordersCount > 0 ? (item.revenue / ordersCount) : 0;
      const share = totalGross > 0 ? ((item.revenue / totalGross) * 100).toFixed(1) : '0.0';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong style="color:var(--text-primary); font-family:monospace;">${item.period}</strong></td>
        <td>${ordersCount}</td>
        <td>${item.units}</td>
        <td style="font-family:monospace; font-weight:700; color:var(--success); font-size:0.95rem;">${formatMoney(item.revenue)}</td>
        <td style="font-family:monospace; color:var(--text-secondary);">${formatMoney(aov)}</td>
        <td>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span>${share}%</span>
            <div style="flex:1; max-width:80px; height:4px; background:var(--bg-tertiary); border-radius:var(--radius-full); overflow:hidden;">
              <div style="width:${share}%; height:100%; background:var(--accent);"></div>
            </div>
          </div>
        </td>
      `;
      breakdownTableBody.appendChild(tr);
    });
  }

  // Clear UI
  function clearUI() {
    transactions = [];
    kpiGrossRev.textContent = '$0.00';
    kpiRevSub.textContent = 'Total transaction volume';
    kpiTotalOrders.textContent = '0';
    kpiAov.textContent = '$0.00';
    kpiUnitsSold.textContent = '0';
    kpiUnitsSub.textContent = 'Cumulative items sold';

    datasetBanner.style.display = 'none';
    clearDataBtn.style.display = 'none';
    topProductsContainer.innerHTML = '<div style="text-align:center; padding:2rem; color:var(--text-tertiary); font-size:0.85rem;">Load a dataset to view product rankings</div>';
    salesSvg.innerHTML = '';
    breakdownTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-tertiary);">No sales data available.</td></tr>';
  }

  // Drag and Drop Listeners
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  dropZone.addEventListener('click', () => {
    csvFileInput.click();
  });

  csvFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  });

  // Handle Uploaded File
  function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        alert('Could not find valid transactions in the uploaded CSV. Please check formatting.');
        return;
      }
      transactions = parsed;
      analyzeData();
    };
    reader.readAsText(file);
  }

  // Load Sample Dataset
  loadSampleBtn.addEventListener('click', () => {
    transactions = generateSampleTransactions();
    analyzeData();
  });

  // Clear Dataset
  clearDataBtn.addEventListener('click', () => {
    clearUI();
  });

  // Download Sample CSV Template
  downloadTemplateBtn.addEventListener('click', () => {
    const templateContent = [
      'Order ID,Date,Product Name,Quantity,Unit Price,Total',
      'ORD-20261001-1001,2026-10-01,Ultra-Quiet Mechanical Keyboard,1,129.99,129.99',
      'ORD-20261001-1002,2026-10-01,Ergonomic Memory Foam Mousepad,2,29.50,59.00',
      'ORD-20261002-1003,2026-10-02,Studio Monitoring Headphones,1,199.00,199.00',
      'ORD-20261003-1004,2026-10-03,Aluminum Laptop Riser Stand,1,45.00,45.00'
    ].join('\r\n');

    downloadFile(templateContent, 'ecommerce_sales_template.csv', 'text/csv');
  });

  // Export Analysis Report
  exportSummaryBtn.addEventListener('click', () => {
    if (transactions.length === 0) {
      alert('Please load or upload sales data before exporting analysis.');
      return;
    }

    const dailyMap = {};
    let totalGross = 0;
    transactions.forEach(t => {
      totalGross += t.total;
      if (!dailyMap[t.date]) {
        dailyMap[t.date] = { date: t.date, orders: new Set(), units: 0, revenue: 0 };
      }
      dailyMap[t.date].orders.add(t.orderId);
      dailyMap[t.date].units += t.quantity;
      dailyMap[t.date].revenue += t.total;
    });

    const headers = ['Date', 'Orders', 'Units Sold', 'Gross Revenue ($)', 'Average Order Value ($)'];
    const rows = Object.values(dailyMap)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(d => [
        d.date,
        d.orders.size,
        d.units,
        d.revenue.toFixed(2),
        (d.orders.size > 0 ? (d.revenue / d.orders.size).toFixed(2) : '0.00')
      ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    downloadFile(csvContent, `sales_analysis_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  });

  // Chart Granularity Buttons
  btnChartDaily.addEventListener('click', () => {
    chartGranularity = 'daily';
    btnChartDaily.classList.add('active');
    btnChartWeekly.classList.remove('active');
    analyzeData();
  });

  btnChartWeekly.addEventListener('click', () => {
    chartGranularity = 'weekly';
    btnChartWeekly.classList.add('active');
    btnChartDaily.classList.remove('active');
    analyzeData();
  });

  // Table Granularity Buttons
  btnTableDaily.addEventListener('click', () => {
    tableGranularity = 'daily';
    btnTableDaily.classList.add('active');
    btnTableWeekly.classList.remove('active');
    analyzeData();
  });

  btnTableWeekly.addEventListener('click', () => {
    tableGranularity = 'weekly';
    btnTableWeekly.classList.add('active');
    btnTableDaily.classList.remove('active');
    analyzeData();
  });

  // Helper file download
  function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

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

  // Automatically preload sample data on first view so visitors see the rich analytics immediately!
  transactions = generateSampleTransactions();
  analyzeData();
});