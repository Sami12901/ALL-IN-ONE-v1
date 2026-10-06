/**
 * Hajj & Umrah Analytics
 * Islamic pilgrimage package financials, logistics manager, and quota capacity auditor.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const currencySelect = document.getElementById('currency-select');
  const kpiTotalPilgrims = document.getElementById('kpi-total-pilgrims');
  const kpiPilgrimsSub = document.getElementById('kpi-pilgrims-sub');
  const kpiTotalRevenue = document.getElementById('kpi-total-revenue');
  const kpiRevenueSub = document.getElementById('kpi-revenue-sub');
  const kpiTotalCosts = document.getElementById('kpi-total-costs');
  const kpiCostsSub = document.getElementById('kpi-costs-sub');
  const kpiGrossProfit = document.getElementById('kpi-gross-profit');
  const kpiGrossMargin = document.getElementById('kpi-gross-margin');
  const kpiMarginPerPilgrim = document.getElementById('kpi-margin-per-pilgrim');
  const kpiCapacityBooked = document.getElementById('kpi-capacity-booked');
  const kpiSeatsRemaining = document.getElementById('kpi-seats-remaining');

  const capacitySummaryText = document.getElementById('capacity-summary-text');
  const capacityCardsContainer = document.getElementById('capacity-cards-container');

  const pkgSearchInput = document.getElementById('pkg-search-input');
  const selectFilterPkgType = document.getElementById('select-filter-pkg-type');
  const packageTableBody = document.getElementById('package-table-body');
  const filteredPackagesCount = document.getElementById('filtered-packages-count');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnResetDemo = document.getElementById('btn-reset-demo');

  // Logistics Spend Breakdown Elements
  const logMakkahCost = document.getElementById('log-makkah-cost');
  const logMadinahCost = document.getElementById('log-madinah-cost');
  const logTransportCost = document.getElementById('log-transport-cost');
  const logVisaCost = document.getElementById('log-visa-cost');
  const logFlightCost = document.getElementById('log-flight-cost');
  const logisticsTotalLabel = document.getElementById('logistics-total-label');

  // SVG Chart
  const hajjChartSvg = document.getElementById('hajj-chart-svg');

  // Modal Elements
  const hajjModal = document.getElementById('hajj-modal');
  const btnAddPackage = document.getElementById('btn-add-package');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCancelModal = document.getElementById('btn-cancel-modal');
  const hajjForm = document.getElementById('hajj-form');
  const modalTitle = document.getElementById('modal-title');
  const pkgIdInput = document.getElementById('pkg-id');
  const pkgNameInput = document.getElementById('pkg-name');
  const pkgTypeSelect = document.getElementById('pkg-type');
  const pkgSeasonInput = document.getElementById('pkg-season');
  const pkgCapacityInput = document.getElementById('pkg-capacity');
  const pkgBookedInput = document.getElementById('pkg-booked');
  const pkgPriceInput = document.getElementById('pkg-price');
  const costMakkahInput = document.getElementById('cost-makkah');
  const costMadinahInput = document.getElementById('cost-madinah');
  const costTransportInput = document.getElementById('cost-transport');
  const costVisaInput = document.getElementById('cost-visa');
  const costFlightInput = document.getElementById('cost-flight');

  // Preset Buttons
  const presetStandardSeason = document.getElementById('preset-standard-season');
  const presetRamadanRush = document.getElementById('preset-ramadan-rush');
  const presetHajjExecutive = document.getElementById('preset-hajj-executive');

  // --- Constants & Color Mappings ---
  const TYPE_BADGE_MAP = {
    'Umrah Economy': 'pkg-type-economy',
    'Umrah VIP 5-Star': 'pkg-type-vip',
    'Hajj Executive': 'pkg-type-hajj'
  };

  const TYPE_ICONS = {
    'Umrah Economy': '🌙',
    'Umrah VIP 5-Star': '⭐',
    'Hajj Executive': '🕋'
  };

  // --- Initial Mock Pilgrimage Packages ---
  const INITIAL_PACKAGES = [
    {
      id: 'pkg-u1',
      name: 'Umrah Economy 10-Days Express (Aziziyah & Markazia)',
      type: 'Umrah Economy',
      season: 'Autumn 1447H Season',
      capacity: 160,
      booked: 142,
      price: 5200,
      costMakkah: 1400,
      costMadinah: 1000,
      costTransport: 450,
      costVisa: 520,
      costFlight: 1100
    },
    {
      id: 'pkg-u2',
      name: 'Umrah VIP 5-Star Clock Tower & Dar Al-Taqwa 14-Days',
      type: 'Umrah VIP 5-Star',
      season: 'Rajab / Sha\'ban 1447H',
      capacity: 65,
      booked: 58,
      price: 13500,
      costMakkah: 4600,
      costMadinah: 3100,
      costTransport: 950,
      costVisa: 580,
      costFlight: 1750
    },
    {
      id: 'pkg-h1',
      name: 'Hajj Executive VIP Majlis & Luxury Mina Camp 21-Days',
      type: 'Hajj Executive',
      season: 'Dhul Hijjah 1447H Quota',
      capacity: 45,
      booked: 42,
      price: 36000,
      costMakkah: 9500,
      costMadinah: 6200,
      costTransport: 2800,
      costVisa: 1800,
      costFlight: 4200
    },
    {
      id: 'pkg-u3',
      name: 'Umrah Deluxe 12-Days Swissôtel & Oberoi Suite',
      type: 'Umrah VIP 5-Star',
      season: 'Winter Umrah 1447H',
      capacity: 50,
      booked: 39,
      price: 11200,
      costMakkah: 3800,
      costMadinah: 2600,
      costTransport: 800,
      costVisa: 550,
      costFlight: 1600
    },
    {
      id: 'pkg-u4',
      name: 'Umrah Economy Budget 14-Days Group Shuttles',
      type: 'Umrah Economy',
      season: 'Standard Low Season',
      capacity: 120,
      booked: 88,
      price: 4600,
      costMakkah: 1250,
      costMadinah: 900,
      costTransport: 400,
      costVisa: 500,
      costFlight: 1050
    }
  ];

  // --- State ---
  let packages = loadPackages();

  // --- Persistence ---
  function loadPackages() {
    try {
      const stored = localStorage.getItem('travel_hajj_umrah_analytics_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved hajj packages, using demo data.', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_PACKAGES));
  }

  function savePackages() {
    try {
      localStorage.setItem('travel_hajj_umrah_analytics_v1', JSON.stringify(packages));
    } catch (e) {
      console.error('Could not save hajj packages', e);
    }
  }

  // --- Currency Helpers ---
  function getCurrencySymbol() {
    return currencySelect ? currencySelect.value : 'SAR ';
  }

  function formatMoney(amount) {
    const sym = getCurrencySymbol();
    const val = Number(amount) || 0;
    return `${sym}${val.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  }

  // --- Core Computations ---
  function computeHajjMetrics() {
    let totalPilgrims = 0;
    let totalCapacity = 0;
    let totalRevenue = 0;
    let totalLogisticsCosts = 0;

    let totalMakkahSpend = 0;
    let totalMadinahSpend = 0;
    let totalTransportSpend = 0;
    let totalVisaSpend = 0;
    let totalFlightSpend = 0;

    packages.forEach(pkg => {
      const booked = Number(pkg.booked) || 0;
      const cap = Number(pkg.capacity) || 0;
      const price = Number(pkg.price) || 0;

      const unitCostMakkah = Number(pkg.costMakkah) || 0;
      const unitCostMadinah = Number(pkg.costMadinah) || 0;
      const unitCostTransport = Number(pkg.costTransport) || 0;
      const unitCostVisa = Number(pkg.costVisa) || 0;
      const unitCostFlight = Number(pkg.costFlight) || 0;

      const unitTotalCost = unitCostMakkah + unitCostMadinah + unitCostTransport + unitCostVisa + unitCostFlight;
      const pkgRevenue = booked * price;
      const pkgCost = booked * unitTotalCost;

      totalPilgrims += booked;
      totalCapacity += cap;
      totalRevenue += pkgRevenue;
      totalLogisticsCosts += pkgCost;

      totalMakkahSpend += booked * unitCostMakkah;
      totalMadinahSpend += booked * unitCostMadinah;
      totalTransportSpend += booked * unitCostTransport;
      totalVisaSpend += booked * unitCostVisa;
      totalFlightSpend += booked * unitCostFlight;
    });

    const totalGrossProfit = totalRevenue - totalLogisticsCosts;
    const overallGrossMarginPct = totalRevenue > 0 ? (totalGrossProfit / totalRevenue * 100) : 0;
    const marginPerPilgrim = totalPilgrims > 0 ? (totalGrossProfit / totalPilgrims) : 0;
    const capacityBookedPct = totalCapacity > 0 ? (totalPilgrims / totalCapacity * 100) : 0;
    const seatsRemaining = Math.max(0, totalCapacity - totalPilgrims);

    return {
      totalPilgrims,
      totalCapacity,
      totalRevenue,
      totalLogisticsCosts,
      totalGrossProfit,
      overallGrossMarginPct,
      marginPerPilgrim,
      capacityBookedPct,
      seatsRemaining,
      totalMakkahSpend,
      totalMadinahSpend,
      totalTransportSpend,
      totalVisaSpend,
      totalFlightSpend
    };
  }

  // --- UI Update: KPIs ---
  function renderKPIs(metrics) {
    kpiTotalPilgrims.textContent = metrics.totalPilgrims.toLocaleString();
    kpiPilgrimsSub.textContent = `${metrics.totalCapacity.toLocaleString()} total quota allocated`;

    kpiTotalRevenue.textContent = formatMoney(metrics.totalRevenue);
    kpiRevenueSub.textContent = `From ${packages.length} active packages`;

    kpiTotalCosts.textContent = formatMoney(metrics.totalLogisticsCosts);
    kpiCostsSub.textContent = `Hotels, transport & visas`;

    kpiGrossProfit.textContent = formatMoney(metrics.totalGrossProfit);
    kpiGrossMargin.textContent = `Overall Margin: ${metrics.overallGrossMarginPct.toFixed(1)}%`;

    kpiMarginPerPilgrim.textContent = formatMoney(metrics.marginPerPilgrim);

    kpiCapacityBooked.textContent = `${metrics.capacityBookedPct.toFixed(1)}%`;
    kpiSeatsRemaining.textContent = `${metrics.seatsRemaining.toLocaleString()} seats remaining`;

    capacitySummaryText.textContent = `${metrics.totalPilgrims} / ${metrics.totalCapacity} Booked (${metrics.seatsRemaining} Left)`;
  }

  // --- UI Update: Visual Capacity Tracker Cards ---
  function renderCapacityCards() {
    capacityCardsContainer.innerHTML = '';

    packages.forEach(pkg => {
      const cap = Number(pkg.capacity) || 1;
      const booked = Number(pkg.booked) || 0;
      const left = Math.max(0, cap - booked);
      const pct = Math.min(100, (booked / cap * 100));

      let badgeClass = 'badge-open';
      let badgeLabel = `${left} Seats Left`;
      let barFillColor = '#3b82f6';

      if (left === 0) {
        badgeClass = 'badge-soldout';
        badgeLabel = 'SOLD OUT';
        barFillColor = '#ef4444';
      } else if (pct >= 85) {
        badgeClass = 'badge-limited';
        badgeLabel = `Only ${left} Left`;
        barFillColor = '#fbbf24';
      }

      const typeIcon = TYPE_ICONS[pkg.type] || '🕋';
      const typeBadgeCls = TYPE_BADGE_MAP[pkg.type] || 'pkg-type-economy';

      const card = document.createElement('div');
      card.className = 'capacity-card';
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem;">
          <div>
            <span class="pkg-type-badge ${typeBadgeCls}">${typeIcon} ${escapeHtml(pkg.type)}</span>
            <div style="font-weight:700; font-size:0.875rem; color:var(--text-primary); margin-top:0.35rem; line-height:1.3;">
              ${escapeHtml(pkg.name)}
            </div>
            ${pkg.season ? `<div style="font-size:0.72rem; color:var(--text-tertiary); margin-top:2px;">🗓️ ${escapeHtml(pkg.season)}</div>` : ''}
          </div>
          <span class="capacity-badge ${badgeClass}">${badgeLabel}</span>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:flex-end; font-size:0.78rem; margin-top:0.25rem;">
          <span style="color:var(--text-secondary);">
            Mu’tamir: <strong style="color:var(--text-primary); font-family:monospace;">${booked}</strong> / ${cap}
          </span>
          <span style="font-weight:800; color:var(--accent); font-family:monospace;">
            ${pct.toFixed(0)}% Filled
          </span>
        </div>

        <div class="capacity-progress-track">
          <div class="capacity-progress-fill" style="width:${pct}%; background:${barFillColor};"></div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:0.5rem; margin-top:0.2rem; font-size:0.75rem;">
          <span style="color:var(--text-secondary);">
            Price: <strong style="color:var(--text-primary); font-family:monospace;">${formatMoney(pkg.price)}</strong> / pax
          </span>
          <button type="button" class="btn btn-secondary btn-quick-book" data-id="${pkg.id}" ${left === 0 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''} style="font-size:0.7rem; padding:0.2rem 0.6rem;">
            +1 Book Pilgrim
          </button>
        </div>
      `;

      capacityCardsContainer.appendChild(card);
    });
  }

  // --- UI Update: Consolidated Logistics Breakdown ---
  function renderLogisticsBreakdown(metrics) {
    logMakkahCost.textContent = formatMoney(metrics.totalMakkahSpend);
    logMadinahCost.textContent = formatMoney(metrics.totalMadinahSpend);
    logTransportCost.textContent = formatMoney(metrics.totalTransportSpend);
    logVisaCost.textContent = formatMoney(metrics.totalVisaSpend);
    logFlightCost.textContent = formatMoney(metrics.totalFlightSpend);
    logisticsTotalLabel.textContent = formatMoney(metrics.totalLogisticsCosts);
  }

  // --- UI Update: SVG Financial Chart (Revenue vs Cost vs Profit) ---
  function renderHajjChart() {
    hajjChartSvg.innerHTML = '';
    if (packages.length === 0) {
      hajjChartSvg.innerHTML = `
        <text x="180" y="120" text-anchor="middle" dominant-baseline="middle" fill="var(--text-tertiary)" font-size="12">No packages recorded</text>
      `;
      return;
    }

    const maxItems = Math.min(packages.length, 5);
    const chartPkgs = packages.slice(0, maxItems);

    const svgWidth = 360;
    const svgHeight = 240;
    const paddingLeft = 35;
    const paddingRight = 15;
    const paddingTop = 20;
    const paddingBottom = 45;

    const chartW = svgWidth - paddingLeft - paddingRight;
    const chartH = svgHeight - paddingTop - paddingBottom;

    // Calculate max value across packages
    let maxVal = 1;
    chartPkgs.forEach(p => {
      const booked = Number(p.booked) || 0;
      const rev = booked * (Number(p.price) || 0);
      if (rev > maxVal) maxVal = rev;
    });

    const groupW = chartW / chartPkgs.length;
    const barW = Math.max(6, (groupW - 20) / 3);

    let svgContent = '';

    // Axis line
    svgContent += `<line x1="${paddingLeft}" y1="${paddingTop + chartH}" x2="${svgWidth - paddingRight}" y2="${paddingTop + chartH}" stroke="var(--border)" stroke-width="1" />`;

    chartPkgs.forEach((p, idx) => {
      const booked = Number(p.booked) || 0;
      const price = Number(p.price) || 0;
      const unitCost = (Number(p.costMakkah) || 0) + (Number(p.costMadinah) || 0) + (Number(p.costTransport) || 0) + (Number(p.costVisa) || 0) + (Number(p.costFlight) || 0);
      
      const rev = booked * price;
      const cost = booked * unitCost;
      const profit = Math.max(0, rev - cost);

      const revH = Math.max(2, (rev / maxVal) * chartH);
      const costH = Math.max(2, (cost / maxVal) * chartH);
      const profitH = Math.max(2, (profit / maxVal) * chartH);

      const groupX = paddingLeft + (idx * groupW) + 8;

      const xRev = groupX;
      const yRev = paddingTop + chartH - revH;

      const xCost = groupX + barW + 2;
      const yCost = paddingTop + chartH - costH;

      const xProf = groupX + (barW * 2) + 4;
      const yProf = paddingTop + chartH - profitH;

      const shortName = p.name.length > 12 ? p.name.substring(0, 11) + '..' : p.name;

      svgContent += `
        <g>
          <!-- Revenue Bar -->
          <rect x="${xRev}" y="${yRev}" width="${barW}" height="${revH}" rx="2" fill="#3b82f6">
            <title>${p.name} Revenue: ${formatMoney(rev)}</title>
          </rect>
          <!-- Cost Bar -->
          <rect x="${xCost}" y="${yCost}" width="${barW}" height="${costH}" rx="2" fill="#f87171">
            <title>${p.name} Cost: ${formatMoney(cost)}</title>
          </rect>
          <!-- Profit Bar -->
          <rect x="${xProf}" y="${yProf}" width="${barW}" height="${profitH}" rx="2" fill="#34d399">
            <title>${p.name} Profit: ${formatMoney(profit)}</title>
          </rect>
          <!-- Label -->
          <text x="${groupX + barW * 1.5}" y="${paddingTop + chartH + 15}" text-anchor="middle" fill="var(--text-tertiary)" font-size="9">
            ${escapeHtml(shortName)}
          </text>
        </g>
      `;
    });

    hajjChartSvg.innerHTML = svgContent;
  }

  // --- UI Update: Pilgrimage Packages Table ---
  function renderPackageTable() {
    const searchTerm = (pkgSearchInput.value || '').trim().toLowerCase();
    const typeFilter = selectFilterPkgType.value;

    const filtered = packages.filter(p => {
      if (typeFilter !== 'ALL' && p.type !== typeFilter) return false;
      if (searchTerm) {
        const fullStr = `${p.name} ${p.type} ${p.season || ''}`.toLowerCase();
        if (!fullStr.includes(searchTerm)) return false;
      }
      return true;
    });

    filteredPackagesCount.textContent = `Showing ${filtered.length} of ${packages.length} packages`;

    packageTableBody.innerHTML = '';
    if (filtered.length === 0) {
      packageTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center; padding:2rem; color:var(--text-tertiary);">
            No pilgrimage packages match the selected criteria.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(p => {
      const booked = Number(p.booked) || 0;
      const cap = Number(p.capacity) || 0;
      const price = Number(p.price) || 0;
      const unitCost = (Number(p.costMakkah) || 0) + (Number(p.costMadinah) || 0) + (Number(p.costTransport) || 0) + (Number(p.costVisa) || 0) + (Number(p.costFlight) || 0);
      const unitMargin = price - unitCost;
      const totalRev = booked * price;
      const totalProfit = booked * unitMargin;

      const typeBadgeCls = TYPE_BADGE_MAP[p.type] || 'pkg-type-economy';
      const typeIcon = TYPE_ICONS[p.type] || '🕋';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="font-weight:700; color:var(--text-primary);">${escapeHtml(p.name)}</div>
          <div style="font-size:0.72rem; color:var(--text-tertiary);">
            ${p.season ? escapeHtml(p.season) + ' • ' : ''}Makkah: ${formatMoney(p.costMakkah)} | Madinah: ${formatMoney(p.costMadinah)}
          </div>
        </td>
        <td>
          <span class="pkg-type-badge ${typeBadgeCls}">${typeIcon} ${escapeHtml(p.type)}</span>
        </td>
        <td style="font-family:monospace; font-weight:700;">
          ${booked} / ${cap}
          <div style="font-size:0.7rem; color:${booked >= cap ? '#f87171' : 'var(--text-tertiary)'};">
            ${booked >= cap ? 'Quota Full' : `${cap - booked} left`}
          </div>
        </td>
        <td style="font-family:monospace; font-weight:700;">
          ${formatMoney(price)}
        </td>
        <td style="font-family:monospace; color:#f87171;">
          ${formatMoney(unitCost)}
        </td>
        <td>
          <div style="font-family:monospace; font-weight:800; color:#34d399;">${formatMoney(unitMargin)}</div>
          <div style="font-size:0.7rem; color:var(--text-tertiary);">${price > 0 ? (unitMargin / price * 100).toFixed(0) : 0}% margin</div>
        </td>
        <td style="font-family:monospace; font-weight:800; color:var(--text-primary);">
          ${formatMoney(totalProfit)}
        </td>
        <td style="text-align:right;">
          <div style="display:inline-flex; gap:0.25rem;">
            <button type="button" class="btn-quick-book" data-id="${p.id}" title="Quick Book +1 Pilgrim" style="background:transparent; border:1px solid var(--border); color:var(--accent); padding:0.25rem 0.5rem; border-radius:var(--radius-sm); cursor:pointer; font-size:0.75rem;">
              +1
            </button>
            <button type="button" class="btn-edit-pkg" data-id="${p.id}" title="Edit Package" style="background:transparent; border:1px solid var(--border); color:var(--text-secondary); padding:0.25rem 0.5rem; border-radius:var(--radius-sm); cursor:pointer; font-size:0.75rem;">
              ✏️
            </button>
            <button type="button" class="btn-delete-pkg" data-id="${p.id}" title="Delete Package" style="background:transparent; border:1px solid var(--border); color:#ef4444; padding:0.25rem 0.5rem; border-radius:var(--radius-sm); cursor:pointer; font-size:0.75rem;">
              🗑️
            </button>
          </div>
        </td>
      `;

      packageTableBody.appendChild(tr);
    });
  }

  // --- Master Refresh Function ---
  function updateAll() {
    const metrics = computeHajjMetrics();
    renderKPIs(metrics);
    renderCapacityCards();
    renderLogisticsBreakdown(metrics);
    renderHajjChart();
    renderPackageTable();
    savePackages();
  }

  // --- Filtering & Interaction Listeners ---
  selectFilterPkgType.addEventListener('change', () => renderPackageTable());
  pkgSearchInput.addEventListener('input', () => renderPackageTable());

  if (currencySelect) {
    currencySelect.addEventListener('change', () => updateAll());
  }

  // Delegated Quick Book from Cards & Table
  document.addEventListener('click', (e) => {
    const bookBtn = e.target.closest('.btn-quick-book');
    const editBtn = e.target.closest('.btn-edit-pkg');
    const delBtn = e.target.closest('.btn-delete-pkg');

    if (bookBtn) {
      const id = bookBtn.getAttribute('data-id');
      const pkg = packages.find(p => p.id === id);
      if (pkg) {
        if (pkg.booked < pkg.capacity) {
          pkg.booked += 1;
          updateAll();
        } else {
          alert(`Package "${pkg.name}" is already at full capacity (${pkg.capacity} pilgrims)!`);
        }
      }
    } else if (editBtn) {
      const id = editBtn.getAttribute('data-id');
      const pkg = packages.find(p => p.id === id);
      if (pkg) openEditModal(pkg);
    } else if (delBtn) {
      const id = delBtn.getAttribute('data-id');
      const pkg = packages.find(p => p.id === id);
      if (pkg && confirm(`Delete pilgrimage package "${pkg.name}"?`)) {
        packages = packages.filter(p => p.id !== id);
        updateAll();
      }
    }
  });

  // --- Modal Operations ---
  function openAddModal() {
    modalTitle.textContent = 'Create Pilgrimage Package';
    pkgIdInput.value = '';
    hajjForm.reset();
    pkgTypeSelect.value = 'Umrah VIP 5-Star';
    pkgCapacityInput.value = '50';
    pkgBookedInput.value = '20';
    pkgPriceInput.value = '8500';
    costMakkahInput.value = '2600';
    costMadinahInput.value = '1800';
    costTransportInput.value = '600';
    costVisaInput.value = '550';
    costFlightInput.value = '1300';
    hajjModal.classList.add('active');
  }

  function openEditModal(pkg) {
    modalTitle.textContent = 'Edit Pilgrimage Package';
    pkgIdInput.value = pkg.id;
    pkgNameInput.value = pkg.name;
    pkgTypeSelect.value = pkg.type;
    pkgSeasonInput.value = pkg.season || '';
    pkgCapacityInput.value = pkg.capacity;
    pkgBookedInput.value = pkg.booked;
    pkgPriceInput.value = pkg.price;
    costMakkahInput.value = pkg.costMakkah;
    costMadinahInput.value = pkg.costMadinah;
    costTransportInput.value = pkg.costTransport;
    costVisaInput.value = pkg.costVisa;
    costFlightInput.value = pkg.costFlight;
    hajjModal.classList.add('active');
  }

  function closeModal() {
    hajjModal.classList.remove('active');
  }

  if (btnAddPackage) btnAddPackage.addEventListener('click', openAddModal);
  if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
  if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

  hajjModal.addEventListener('click', (e) => {
    if (e.target === hajjModal) closeModal();
  });

  hajjForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = pkgIdInput.value;
    const name = pkgNameInput.value.trim();
    const type = pkgTypeSelect.value;
    const season = pkgSeasonInput.value.trim();
    const capacity = Math.max(1, parseInt(pkgCapacityInput.value, 10) || 1);
    const booked = Math.max(0, Math.min(capacity, parseInt(pkgBookedInput.value, 10) || 0));
    const price = Math.max(0, parseFloat(pkgPriceInput.value) || 0);
    const costMakkah = Math.max(0, parseFloat(costMakkahInput.value) || 0);
    const costMadinah = Math.max(0, parseFloat(costMadinahInput.value) || 0);
    const costTransport = Math.max(0, parseFloat(costTransportInput.value) || 0);
    const costVisa = Math.max(0, parseFloat(costVisaInput.value) || 0);
    const costFlight = Math.max(0, parseFloat(costFlightInput.value) || 0);

    if (id) {
      const pkg = packages.find(p => p.id === id);
      if (pkg) {
        pkg.name = name;
        pkg.type = type;
        pkg.season = season;
        pkg.capacity = capacity;
        pkg.booked = booked;
        pkg.price = price;
        pkg.costMakkah = costMakkah;
        pkg.costMadinah = costMadinah;
        pkg.costTransport = costTransport;
        pkg.costVisa = costVisa;
        pkg.costFlight = costFlight;
      }
    } else {
      const newPkg = {
        id: 'pkg-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        name,
        type,
        season,
        capacity,
        booked,
        price,
        costMakkah,
        costMadinah,
        costTransport,
        costVisa,
        costFlight
      };
      packages.unshift(newPkg);
    }

    closeModal();
    updateAll();
  });

  // --- CSV Export ---
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', () => {
      const headers = ['Package ID', 'Package Name', 'Type', 'Season', 'Capacity', 'Booked Pax', 'Seats Remaining', 'Selling Price', 'Makkah Cost', 'Madinah Cost', 'Transport Cost', 'Visa Fee', 'Flight Cost', 'Total Unit Cost', 'Gross Margin Pax', 'Total Revenue', 'Total Profit'];
      const rows = packages.map(p => {
        const booked = Number(p.booked) || 0;
        const cap = Number(p.capacity) || 0;
        const left = Math.max(0, cap - booked);
        const price = Number(p.price) || 0;
        const unitCost = (Number(p.costMakkah) || 0) + (Number(p.costMadinah) || 0) + (Number(p.costTransport) || 0) + (Number(p.costVisa) || 0) + (Number(p.costFlight) || 0);
        const margin = price - unitCost;
        const rev = booked * price;
        const profit = booked * margin;

        return [
          csvClean(p.id),
          csvClean(p.name),
          csvClean(p.type),
          csvClean(p.season || ''),
          cap,
          booked,
          left,
          price,
          p.costMakkah,
          p.costMadinah,
          p.costTransport,
          p.costVisa,
          p.costFlight,
          unitCost,
          margin,
          rev,
          profit
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `hajj_umrah_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }

  // --- Preset Scenarios ---
  if (btnResetDemo) {
    btnResetDemo.addEventListener('click', () => {
      if (confirm('Reset pilgrimage package manager to demonstration defaults?')) {
        packages = JSON.parse(JSON.stringify(INITIAL_PACKAGES));
        updateAll();
      }
    });
  }

  if (presetStandardSeason) {
    presetStandardSeason.addEventListener('click', () => {
      packages = JSON.parse(JSON.stringify(INITIAL_PACKAGES));
      updateAll();
    });
  }

  if (presetRamadanRush) {
    presetRamadanRush.addEventListener('click', () => {
      packages = [
        { id: 'r1', name: 'Ramadan Last 10-Nights Tahajjud 5-Star (Makkah Clock Tower)', type: 'Umrah VIP 5-Star', season: 'Ramadan 1447H Peak', capacity: 80, booked: 78, price: 24000, costMakkah: 11000, costMadinah: 4200, costTransport: 1400, costVisa: 650, costFlight: 2800 },
        { id: 'r2', name: 'Ramadan Full Month Spiritual Stay (Makkah & Madinah Suites)', type: 'Umrah VIP 5-Star', season: 'Full Ramadan 1447H', capacity: 40, booked: 38, price: 38000, costMakkah: 16500, costMadinah: 8200, costTransport: 2200, costVisa: 650, costFlight: 3100 },
        { id: 'r3', name: 'Ramadan Economy 14-Days (Aziziyah Shuttle)', type: 'Umrah Economy', season: 'First 14-Days Ramadan', capacity: 150, booked: 146, price: 7800, costMakkah: 2800, costMadinah: 1600, costTransport: 600, costVisa: 600, costFlight: 1400 }
      ];
      updateAll();
    });
  }

  if (presetHajjExecutive) {
    presetHajjExecutive.addEventListener('click', () => {
      packages = [
        { id: 'h1', name: 'Hajj VIP Al-Majlis Royal Mina & Arafat Camp (Zone A)', type: 'Hajj Executive', season: 'Hajj 1447H Executive', capacity: 50, booked: 49, price: 42000, costMakkah: 12000, costMadinah: 7500, costTransport: 3200, costVisa: 2000, costFlight: 4800 },
        { id: 'h2', name: 'Hajj Standard Luxury Towers Package (Shifting)', type: 'Hajj Executive', season: 'Hajj 1447H Standard', capacity: 90, booked: 82, price: 28500, costMakkah: 8200, costMadinah: 5400, costTransport: 2400, costVisa: 1800, costFlight: 3800 },
        { id: 'h3', name: 'Post-Hajj Madinah Extended Spiritual Retreat', type: 'Umrah VIP 5-Star', season: 'Muharram 1448H', capacity: 60, booked: 45, price: 9800, costMakkah: 3200, costMadinah: 2500, costTransport: 700, costVisa: 550, costFlight: 1500 }
      ];
      updateAll();
    });
  }

  // --- Helper Functions ---
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function csvClean(str) {
    const clean = String(str).replace(/"/g, '""');
    return `"${clean}"`;
  }

  // --- Initial Launch ---
  updateAll();
});