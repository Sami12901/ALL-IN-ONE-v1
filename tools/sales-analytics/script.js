// Sales Analytics Dashboard Engine - E-Commerce Revenue Metrics

const STORAGE_KEY = 'sales_analytics_transactions';

// Generate dynamic dates around current date for realistic charts
function getRecentDateStr(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

const SAMPLE_TRANSACTIONS = [
  { id: 'ORD-9841', customer: 'Sophia Reynolds', email: 'sophia.r@example.com', date: getRecentDateStr(0), total: 320.00, items: 3, payment: 'Credit Card', status: 'Completed', isRepeat: true },
  { id: 'ORD-9840', customer: 'Marcus Vance', email: 'marcus.v@example.com', date: getRecentDateStr(0), total: 145.50, items: 1, payment: 'Apple Pay', status: 'Completed', isRepeat: false },
  { id: 'ORD-9839', customer: 'Elena Rostova', email: 'elena.rostova@example.com', date: getRecentDateStr(1), total: 580.00, items: 4, payment: 'PayPal', status: 'Completed', isRepeat: true },
  { id: 'ORD-9838', customer: 'David Chen', email: 'dchen88@example.com', date: getRecentDateStr(1), total: 89.00, items: 1, payment: 'Credit Card', status: 'Completed', isRepeat: false },
  { id: 'ORD-9837', customer: 'Isabella Monet', email: 'isabella.m@example.com', date: getRecentDateStr(2), total: 410.25, items: 2, payment: 'Apple Pay', status: 'Completed', isRepeat: true },
  { id: 'ORD-9836', customer: 'Lucas Wright', email: 'lwright@example.com', date: getRecentDateStr(2), total: 235.00, items: 2, payment: 'Credit Card', status: 'Processing', isRepeat: false },
  { id: 'ORD-9835', customer: 'Chloe Bennett', email: 'chloe.b@example.com', date: getRecentDateStr(3), total: 670.00, items: 5, payment: 'Credit Card', status: 'Completed', isRepeat: true },
  { id: 'ORD-9834', customer: 'Oliver Kim', email: 'oliver.k@example.com', date: getRecentDateStr(3), total: 115.00, items: 1, payment: 'PayPal', status: 'Refunded', isRepeat: false },
  { id: 'ORD-9833', customer: 'Amara Okafor', email: 'amara.o@example.com', date: getRecentDateStr(4), total: 340.00, items: 2, payment: 'Apple Pay', status: 'Completed', isRepeat: false },
  { id: 'ORD-9832', customer: 'Julian Hayes', email: 'jhayes@example.com', date: getRecentDateStr(4), total: 520.00, items: 3, payment: 'Credit Card', status: 'Completed', isRepeat: true },
  { id: 'ORD-9831', customer: 'Zara Larsson', email: 'zara.l@example.com', date: getRecentDateStr(5), total: 290.00, items: 2, payment: 'PayPal', status: 'Completed', isRepeat: false },
  { id: 'ORD-9830', customer: 'Gabriel Santos', email: 'gabriel.s@example.com', date: getRecentDateStr(5), total: 180.00, items: 1, payment: 'Credit Card', status: 'Completed', isRepeat: false },
  { id: 'ORD-9829', customer: 'Freja Lind', email: 'freja.lind@example.com', date: getRecentDateStr(6), total: 780.00, items: 6, payment: 'Credit Card', status: 'Completed', isRepeat: true },
  { id: 'ORD-9828', customer: 'Nathan Drake', email: 'nathan.d@example.com', date: getRecentDateStr(6), total: 210.00, items: 2, payment: 'Apple Pay', status: 'Completed', isRepeat: false }
];

let transactions = [];

function loadTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      transactions = JSON.parse(raw);
    } else {
      transactions = [...SAMPLE_TRANSACTIONS];
      saveTransactions();
    }
  } catch (err) {
    console.error('Failed to load transactions:', err);
    transactions = [...SAMPLE_TRANSACTIONS];
  }
}

function saveTransactions() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (err) {
    console.error('Failed to save transactions:', err);
  }
}

function formatUSD(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function calculateMetrics() {
  const completed = transactions.filter(t => t.status === 'Completed');
  const totalSales = completed.reduce((sum, t) => sum + Number(t.total), 0);
  const totalOrders = transactions.length;
  const completedOrdersCount = completed.length;
  const aov = completedOrdersCount > 0 ? (totalSales / completedOrdersCount) : 0;

  // Repeat Customer Calculation
  const repeatCount = transactions.filter(t => t.isRepeat).length;
  const repeatRate = totalOrders > 0 ? ((repeatCount / totalOrders) * 100) : 0;

  // Estimated conversion rate: realistic ecommerce benchmark
  // Simulated traffic: roughly 30 visitors per order
  const simulatedVisitors = Math.max(100, totalOrders * 28);
  const conversionRate = totalOrders > 0 ? ((completedOrdersCount / simulatedVisitors) * 100) : 0;

  return {
    totalSales,
    totalOrders,
    completedOrdersCount,
    aov,
    repeatCount,
    repeatRate,
    conversionRate,
    simulatedVisitors
  };
}

function updateKPIView() {
  const metrics = calculateMetrics();

  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setText('stat-total-sales', formatUSD(metrics.totalSales));
  setText('stat-total-orders', metrics.totalOrders.toLocaleString());
  setText('stat-orders-sub', `${metrics.completedOrdersCount} completed / ${metrics.totalOrders - metrics.completedOrdersCount} other`);
  setText('stat-aov', formatUSD(metrics.aov));
  setText('stat-conversion', `${metrics.conversionRate.toFixed(2)}%`);
  setText('stat-visitors-sub', `Est. ${metrics.simulatedVisitors.toLocaleString()} sessions`);
  setText('stat-repeat-rate', `${metrics.repeatRate.toFixed(1)}%`);
  setText('stat-repeat-sub', `${metrics.repeatCount} returning buyers`);
}

function renderTable() {
  const tbody = document.getElementById('trans-tbody');
  if (!tbody) return;

  const searchQuery = (document.getElementById('trans-search')?.value || '').toLowerCase().trim();
  const filterStatus = document.getElementById('trans-filter-status')?.value || 'all';
  const filterCust = document.getElementById('trans-filter-customer')?.value || 'all';

  let filtered = transactions.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterCust === 'repeat' && !t.isRepeat) return false;
    if (filterCust === 'new' && t.isRepeat) return false;

    if (searchQuery) {
      const matchId = (t.id || '').toLowerCase().includes(searchQuery);
      const matchCust = (t.customer || '').toLowerCase().includes(searchQuery);
      const matchEmail = (t.email || '').toLowerCase().includes(searchQuery);
      if (!matchId && !matchCust && !matchEmail) return false;
    }
    return true;
  });

  // Sort by date descending
  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 2.5rem; color: var(--text-secondary);">No sales transactions found.</td></tr>`;
    return;
  }

  filtered.forEach(t => {
    const tr = document.createElement('tr');
    tr.dataset.id = t.id;

    let statusBadge = '<span class="status-badge status-healthy">Completed</span>';
    if (t.status === 'Processing') {
      statusBadge = '<span class="status-badge status-warning">Processing</span>';
    } else if (t.status === 'Refunded') {
      statusBadge = '<span class="status-badge status-critical">Refunded</span>';
    }

    const custBadge = t.isRepeat
      ? '<span class="badge-repeat">Repeat</span>'
      : '<span class="badge-new">New</span>';

    tr.innerHTML = `
      <td><strong style="font-family: monospace; color: var(--accent);">${escapeHtml(t.id)}</strong></td>
      <td>
        <div style="font-weight: 600;">${escapeHtml(t.customer)}</div>
        <div style="font-size: 0.75rem; color: var(--text-secondary);">${escapeHtml(t.email || '')}</div>
      </td>
      <td>${escapeHtml(t.date)}</td>
      <td>${escapeHtml(t.payment || 'Credit Card')}</td>
      <td style="text-align: center;">${t.items || 1}</td>
      <td>${statusBadge}</td>
      <td><strong>${formatUSD(t.total)}</strong></td>
      <td>${custBadge}</td>
      <td style="text-align: right;">
        <button type="button" class="btn btn-secondary btn-del-trans" data-id="${t.id}" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; color: var(--error);" title="Delete Record">
          &times;
        </button>
      </td>
    `;
    tbody.appendChild(tr);
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

// Day of week & Peak Day aggregations
function renderDayInsights() {
  const dowContainer = document.getElementById('dow-bars-container');
  const topDaysContainer = document.getElementById('top-days-list');
  if (!dowContainer) return;

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayTotals = [0, 0, 0, 0, 0, 0, 0];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  const dateRevMap = {};

  transactions.forEach(t => {
    if (t.status === 'Completed') {
      const d = new Date(t.date + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        const dow = d.getDay();
        dayTotals[dow] += Number(t.total);
        dayCounts[dow]++;
      }
      dateRevMap[t.date] = (dateRevMap[t.date] || 0) + Number(t.total);
    }
  });

  const maxDowSales = Math.max(1, Math.max(...dayTotals));

  dowContainer.innerHTML = '';
  // Reorder Mon to Sun
  const displayOrder = [1, 2, 3, 4, 5, 6, 0];
  displayOrder.forEach(idx => {
    const total = dayTotals[idx];
    const pct = Math.min(100, (total / maxDowSales) * 100);
    const row = document.createElement('div');
    row.className = 'dow-bar-row';
    row.innerHTML = `
      <span class="dow-label">${daysOfWeek[idx].slice(0, 3)}</span>
      <div class="dow-track">
        <div class="dow-fill" style="width: ${pct}%;"></div>
      </div>
      <span class="dow-val">${formatUSD(total)}</span>
    `;
    dowContainer.appendChild(row);
  });

  if (topDaysContainer) {
    topDaysContainer.innerHTML = '';
    const sortedDates = Object.entries(dateRevMap).sort((a, b) => b[1] - a[1]).slice(0, 3);
    if (sortedDates.length === 0) {
      topDaysContainer.innerHTML = '<div style="color:var(--text-secondary);">No completed sales recorded.</div>';
    } else {
      sortedDates.forEach(([date, rev], rank) => {
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.justifyContent = 'space-between';
        item.style.padding = '0.3rem 0';
        item.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
        item.innerHTML = `
          <span>#${rank + 1} <strong>${date}</strong></span>
          <strong style="color: var(--accent);">${formatUSD(rev)}</strong>
        `;
        topDaysContainer.appendChild(item);
      });
    }
  }
}

// Interactive SVG Weekly Breakdown Chart
function renderWeeklySVGChart() {
  const svg = document.getElementById('sales-svg');
  const tooltip = document.getElementById('sales-tooltip');
  const container = document.getElementById('sales-chart-container');
  if (!svg || !tooltip || !container) return;

  // Aggregate sales for the last 7 distinct days
  const dateMap = {};
  for (let i = 6; i >= 0; i--) {
    const dStr = getRecentDateStr(i);
    dateMap[dStr] = { date: dStr, sales: 0, orders: 0, completedOrders: 0 };
  }

  transactions.forEach(t => {
    if (dateMap[t.date]) {
      dateMap[t.date].orders++;
      if (t.status === 'Completed') {
        dateMap[t.date].sales += Number(t.total);
        dateMap[t.date].completedOrders++;
      }
    }
  });

  const dailyData = Object.values(dateMap);
  const total7DaySales = dailyData.reduce((acc, d) => acc + d.sales, 0);
  const avgDaySales = total7DaySales / dailyData.length;
  const peakDay = [...dailyData].sort((a, b) => b.sales - a.sales)[0];

  const avgLabel = document.getElementById('chart-avg-day-sales');
  if (avgLabel) avgLabel.textContent = `7-Day Average: ${formatUSD(avgDaySales)} / day`;
  const peakLabel = document.getElementById('chart-peak-day-sales');
  if (peakLabel && peakDay) peakLabel.textContent = `Peak Day: ${peakDay.date} (${formatUSD(peakDay.sales)})`;

  const width = 680;
  const height = 320;
  const padding = { top: 30, right: 30, bottom: 45, left: 65 };

  const maxSales = Math.max(100, Math.max(...dailyData.map(d => d.sales)) * 1.2);
  const scaleY = v => height - padding.bottom - (v / maxSales) * (height - padding.top - padding.bottom);

  let svgContent = '';

  // Background Grid
  const gridTicks = 5;
  for (let i = 0; i <= gridTicks; i++) {
    const val = (maxSales / gridTicks) * i;
    const yPos = scaleY(val);
    svgContent += `<line x1="${padding.left}" y1="${yPos}" x2="${width - padding.right}" y2="${yPos}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3,3" />`;
    svgContent += `<text x="${padding.left - 8}" y="${yPos + 4}" fill="#9ca3af" font-size="10" text-anchor="end">${formatUSD(val)}</text>`;
  }

  // Average Line
  const avgY = scaleY(avgDaySales);
  svgContent += `<line x1="${padding.left}" y1="${avgY}" x2="${width - padding.right}" y2="${avgY}" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.7" />`;
  svgContent += `<text x="${width - padding.right}" y="${avgY - 6}" fill="#38bdf8" font-size="9" text-anchor="end">Avg: ${formatUSD(avgDaySales)}</text>`;

  // Axes lines
  svgContent += `<line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />`;
  svgContent += `<line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />`;

  // Bars and points
  const usableWidth = width - padding.left - padding.right;
  const barSlotWidth = usableWidth / dailyData.length;
  const barWidth = Math.min(42, barSlotWidth * 0.6);

  let linePoints = [];

  dailyData.forEach((day, index) => {
    const xCenter = padding.left + (index * barSlotWidth) + (barSlotWidth / 2);
    const barX = xCenter - (barWidth / 2);
    const barY = scaleY(day.sales);
    const barH = (height - padding.bottom) - barY;

    linePoints.push(`${xCenter},${barY}`);

    // Bar rectangle
    svgContent += `
      <rect 
        x="${barX}" 
        y="${barY}" 
        width="${barWidth}" 
        height="${Math.max(2, barH)}" 
        rx="6" 
        fill="url(#accentGrad)" 
        opacity="0.85" 
        class="sales-bar" 
        data-index="${index}"
        style="cursor: pointer; transition: opacity 0.2s;"
      />
    `;

    // Data Point Dot
    svgContent += `
      <circle 
        cx="${xCenter}" 
        cy="${barY}" 
        r="4.5" 
        fill="#ffffff" 
        stroke="var(--accent)" 
        stroke-width="2" 
        class="sales-dot"
        data-index="${index}"
        style="cursor: pointer;"
      />
    `;

    // Day Label
    const dateObj = new Date(day.date + 'T00:00:00');
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const dateSub = day.date.slice(5); // MM-DD
    svgContent += `<text x="${xCenter}" y="${height - padding.bottom + 16}" fill="#9ca3af" font-size="10" font-weight="600" text-anchor="middle">${dayName}</text>`;
    svgContent += `<text x="${xCenter}" y="${height - padding.bottom + 28}" fill="#6b7280" font-size="8.5" text-anchor="middle">${dateSub}</text>`;
  });

  // Line connector
  svgContent += `
    <defs>
      <linearGradient id="accentGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4e85bf" />
        <stop offset="100%" stop-color="#89aacc" stop-opacity="0.2" />
      </linearGradient>
    </defs>
    <polyline fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" points="${linePoints.join(' ')}" />
  `;

  svg.innerHTML = svgContent;

  // Interactivity for bars and dots
  const targets = svg.querySelectorAll('.sales-bar, .sales-dot');
  targets.forEach(el => {
    el.addEventListener('mouseenter', (e) => {
      const idx = parseInt(e.target.dataset.index, 10);
      const day = dailyData[idx];
      if (!day) return;

      tooltip.innerHTML = `
        <div style="font-weight: 700; color: #ffffff;">${day.date}</div>
        <div style="color: #38bdf8; font-size: 0.95rem; font-weight: 800; margin: 0.2rem 0;">${formatUSD(day.sales)}</div>
        <div style="color: #cbd5e1; font-size: 0.725rem;">
          Completed Orders: <strong>${day.completedOrders}</strong><br>
          AOV: <strong>${day.completedOrders > 0 ? formatUSD(day.sales / day.completedOrders) : '$0.00'}</strong>
        </div>
      `;
      tooltip.classList.add('active');

      const rect = container.getBoundingClientRect();
      const elRect = e.target.getBoundingClientRect();
      const left = elRect.left - rect.left + (elRect.width / 2);
      const top = elRect.top - rect.top;

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
    });

    el.addEventListener('mouseleave', () => {
      tooltip.classList.remove('active');
    });
  });
}

// Summary Report Generation
function openSummaryReport() {
  const modal = document.getElementById('summary-modal');
  const textarea = document.getElementById('summary-report-text');
  if (!modal || !textarea) return;

  const metrics = calculateMetrics();
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Top products or dates
  const text =
`# E-COMMERCE EXECUTIVE SALES & REVENUE REPORT
Generated: ${today}
System: ALL IN ONE E-Commerce Operations Analytics

============================================================
1. CORE PERFORMANCE SUMMARY
============================================================
- Gross Net Revenue:          ${formatUSD(metrics.totalSales)}
- Total Transactions:         ${metrics.totalOrders} orders
- Completed Transactions:     ${metrics.completedOrdersCount} orders
- Average Order Value (AOV):  ${formatUSD(metrics.aov)}
- Estimated Conversion Rate:  ${metrics.conversionRate.toFixed(2)}%
- Returning Customer Rate:    ${metrics.repeatRate.toFixed(1)}% (${metrics.repeatCount} repeat buyers)

============================================================
2. TRANSACTION STATUS BREAKDOWN
============================================================
- Completed:   ${transactions.filter(t => t.status === 'Completed').length} orders
- Processing:  ${transactions.filter(t => t.status === 'Processing').length} orders
- Refunded:    ${transactions.filter(t => t.status === 'Refunded').length} orders

============================================================
3. STRATEGIC GROWTH RECOMMENDATIONS
============================================================
* RETENTION: Returning customers represent ${metrics.repeatRate.toFixed(1)}% of sales.
  Recommended: Implement a VIP loyalty reward program to drive repeat AOV.
* BASKET SIZE: Current AOV is ${formatUSD(metrics.aov)}.
  Recommended: Introduce threshold-based free shipping (e.g. $150+) to lift cart sizes.
* CONVERSION: Estimated session conversion stands at ${metrics.conversionRate.toFixed(2)}%.
  Recommended: Streamline checkout steps and offer express payment options like Apple Pay.

------------------------------------------------------------
Report End. Confidential Business Analytics.
`;

  textarea.value = text;
  modal.classList.add('active');
}

function closeSummaryReport() {
  const modal = document.getElementById('summary-modal');
  if (modal) modal.classList.remove('active');
}

function handleCopySummary() {
  const textarea = document.getElementById('summary-report-text');
  if (!textarea) return;

  navigator.clipboard.writeText(textarea.value).then(() => {
    const btn = document.getElementById('copy-summary-btn');
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = 'Copied to Clipboard!';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    }
  }).catch(() => {
    textarea.select();
    document.execCommand('copy');
    alert('Copied report to clipboard.');
  });
}

function handleDownloadSummary() {
  const textarea = document.getElementById('summary-report-text');
  if (!textarea) return;

  const blob = new Blob([textarea.value], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `executive_sales_summary_${new Date().toISOString().slice(0, 10)}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// CSV Export & Import
function exportCSV() {
  if (transactions.length === 0) {
    alert('No transactions to export.');
    return;
  }

  const headers = ['Order ID', 'Customer Name', 'Customer Email', 'Date', 'Payment Method', 'Items Qty', 'Status', 'Order Total', 'Is Repeat Customer'];
  const rows = transactions.map(t => {
    return [
      `"${t.id.replace(/"/g, '""')}"`,
      `"${t.customer.replace(/"/g, '""')}"`,
      `"${(t.email || '').replace(/"/g, '""')}"`,
      t.date,
      `"${(t.payment || 'Credit Card').replace(/"/g, '""')}"`,
      t.items || 1,
      t.status,
      Number(t.total).toFixed(2),
      t.isRepeat ? 'YES' : 'NO'
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ecommerce_sales_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function handleCSVUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    const text = ev.target?.result;
    if (typeof text !== 'string') return;

    try {
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length < 2) {
        alert('CSV file does not contain enough records.');
        return;
      }

      const imported = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
        if (cols && cols.length >= 4) {
          const clean = cols.map(c => c.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
          const id = clean[0] || `ORD-IMP-${i}`;
          const customer = clean[1] || 'Guest Buyer';
          const email = clean[2] || '';
          const date = clean[3] || getRecentDateStr(0);
          const payment = clean[4] || 'Credit Card';
          const items = parseInt(clean[5], 10) || 1;
          const status = clean[6] || 'Completed';
          const total = parseFloat(clean[7]) || 50.00;
          const isRepeat = (clean[8] || '').toUpperCase() === 'YES';

          imported.push({ id, customer, email, date, payment, items, status, total, isRepeat });
        }
      }

      if (imported.length > 0) {
        if (confirm(`Imported ${imported.length} transactions. Replace current transactions? Click OK to replace, Cancel to append.`)) {
          transactions = imported;
        } else {
          transactions = [...imported, ...transactions];
        }
        saveTransactions();
        updateKPIView();
        renderTable();
        renderDayInsights();
        renderWeeklySVGChart();
        alert(`Successfully imported ${imported.length} sales transactions.`);
      }
    } catch (err) {
      console.error('Error importing transactions CSV:', err);
      alert('Failed to parse CSV transactions file.');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

// Add Order Modal
function openAddOrderModal() {
  const modal = document.getElementById('order-modal');
  const form = document.getElementById('order-form');
  if (!modal || !form) return;

  form.reset();
  document.getElementById('ord-id').value = `ORD-${Date.now().toString().slice(-4)}`;
  document.getElementById('ord-date').value = getRecentDateStr(0);
  document.getElementById('ord-total').value = '149.00';
  document.getElementById('ord-items').value = '2';
  document.getElementById('ord-status').value = 'Completed';

  modal.classList.add('active');
}

function closeAddOrderModal() {
  const modal = document.getElementById('order-modal');
  if (modal) modal.classList.remove('active');
}

function handleSaveOrder(e) {
  e.preventDefault();
  const id = document.getElementById('ord-id').value.trim();
  const date = document.getElementById('ord-date').value;
  const customer = document.getElementById('ord-customer').value.trim();
  const email = document.getElementById('ord-email').value.trim();
  const total = parseFloat(document.getElementById('ord-total').value) || 0;
  const items = parseInt(document.getElementById('ord-items').value, 10) || 1;
  const payment = document.getElementById('ord-payment').value;
  const status = document.getElementById('ord-status').value;
  const isRepeat = document.getElementById('ord-repeat').checked;

  if (!id || !customer || !date) {
    alert('Please enter Order ID, Customer Name, and Date.');
    return;
  }

  transactions.unshift({
    id,
    customer,
    email,
    date,
    total,
    items,
    payment,
    status,
    isRepeat
  });

  saveTransactions();
  updateKPIView();
  renderTable();
  renderDayInsights();
  renderWeeklySVGChart();
  closeAddOrderModal();
}

// Lifecycle Init
document.addEventListener('DOMContentLoaded', () => {
  loadTransactions();
  updateKPIView();
  renderTable();
  renderDayInsights();
  renderWeeklySVGChart();

  // Search & Filter listeners
  document.getElementById('trans-search')?.addEventListener('input', renderTable);
  document.getElementById('trans-filter-status')?.addEventListener('change', renderTable);
  document.getElementById('trans-filter-customer')?.addEventListener('change', renderTable);

  // Add order modal
  document.getElementById('btn-add-order')?.addEventListener('click', openAddOrderModal);
  document.getElementById('close-order-modal')?.addEventListener('click', closeAddOrderModal);
  document.getElementById('cancel-order-modal')?.addEventListener('click', closeAddOrderModal);
  document.getElementById('order-form')?.addEventListener('submit', handleSaveOrder);

  // Summary Report modal
  document.getElementById('btn-summary-report')?.addEventListener('click', openSummaryReport);
  document.getElementById('close-summary-modal')?.addEventListener('click', closeSummaryReport);
  document.getElementById('copy-summary-btn')?.addEventListener('click', handleCopySummary);
  document.getElementById('download-summary-btn')?.addEventListener('click', handleDownloadSummary);

  // CSV Export & Upload
  document.getElementById('btn-export-csv')?.addEventListener('click', exportCSV);
  const csvInput = document.getElementById('csv-upload-input');
  document.getElementById('btn-upload-csv')?.addEventListener('click', () => csvInput?.click());
  csvInput?.addEventListener('change', handleCSVUpload);

  // Sample data button
  document.getElementById('btn-load-sample')?.addEventListener('click', () => {
    if (confirm('Load fresh sample transaction data? Custom edits will be overwritten.')) {
      transactions = JSON.parse(JSON.stringify(SAMPLE_TRANSACTIONS));
      saveTransactions();
      updateKPIView();
      renderTable();
      renderDayInsights();
      renderWeeklySVGChart();
    }
  });

  // Table row deletion delegation
  const tbody = document.getElementById('trans-tbody');
  if (tbody) {
    tbody.addEventListener('click', (e) => {
      const delBtn = e.target.closest('.btn-del-trans');
      if (delBtn) {
        const id = delBtn.dataset.id;
        if (confirm(`Delete transaction record ${id}?`)) {
          transactions = transactions.filter(t => t.id !== id);
          saveTransactions();
          updateKPIView();
          renderTable();
          renderDayInsights();
          renderWeeklySVGChart();
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

  // Re-render chart on resize
  window.addEventListener('resize', () => {
    renderWeeklySVGChart();
  });
});