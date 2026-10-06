/**
 * Customer Analytics (Travel)
 * Travel agency client segmentation, lifetime value (LTV) dashboard, and customer retention auditor.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const currencySelect = document.getElementById('currency-select');
  const kpiTotalRevenue = document.getElementById('kpi-total-revenue');
  const kpiRevenueSub = document.getElementById('kpi-revenue-sub');
  const kpiTotalClients = document.getElementById('kpi-total-clients');
  const kpiClientsSub = document.getElementById('kpi-clients-sub');
  const kpiAvgBookings = document.getElementById('kpi-avg-bookings');
  const kpiRetentionRate = document.getElementById('kpi-retention-rate');
  const kpiRetentionSub = document.getElementById('kpi-retention-sub');
  const kpiAvgLtv = document.getElementById('kpi-avg-ltv');
  const kpiVipShare = document.getElementById('kpi-vip-share');

  // Cohort Cards
  const cohortCards = document.querySelectorAll('.cohort-card');
  const btnClearCohortFilter = document.getElementById('btn-clear-cohort-filter');

  const vipCount = document.getElementById('vip-count');
  const vipRevenue = document.getElementById('vip-revenue');
  const vipAvgBookings = document.getElementById('vip-avg-bookings');
  const vipAvgLtv = document.getElementById('vip-avg-ltv');

  const corporateCount = document.getElementById('corporate-count');
  const corporateRevenue = document.getElementById('corporate-revenue');
  const corporateAvgBookings = document.getElementById('corporate-avg-bookings');
  const corporateAvgLtv = document.getElementById('corporate-avg-ltv');

  const familyCount = document.getElementById('family-count');
  const familyRevenue = document.getElementById('family-revenue');
  const familyAvgBookings = document.getElementById('family-avg-bookings');
  const familyAvgLtv = document.getElementById('family-avg-ltv');

  const pilgrimCount = document.getElementById('pilgrim-count');
  const pilgrimRevenue = document.getElementById('pilgrim-revenue');
  const pilgrimAvgBookings = document.getElementById('pilgrim-avg-bookings');
  const pilgrimAvgLtv = document.getElementById('pilgrim-avg-ltv');

  // Table & Filter Controls
  const clientSearchInput = document.getElementById('client-search-input');
  const selectFilterCohort = document.getElementById('select-filter-cohort');
  const selectFilterRetention = document.getElementById('select-filter-retention');
  const selectSortBy = document.getElementById('select-sort-by');
  const clientTableBody = document.getElementById('client-table-body');
  const filteredClientsCount = document.getElementById('filtered-clients-count');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnResetDemo = document.getElementById('btn-reset-demo');

  // Top 10 & Chart Elements
  const topTravelersList = document.getElementById('top-travelers-list');
  const cohortDonutSvg = document.getElementById('cohort-donut-svg');
  const chartTotalLabel = document.getElementById('chart-total-label');
  const cohortLegendContainer = document.getElementById('cohort-legend-container');

  // Modal Elements
  const travelerModal = document.getElementById('traveler-modal');
  const btnAddTraveler = document.getElementById('btn-add-traveler');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCancelModal = document.getElementById('btn-cancel-modal');
  const travelerForm = document.getElementById('traveler-form');
  const modalTitle = document.getElementById('modal-title');
  const travelerIdInput = document.getElementById('traveler-id');
  const travelerNameInput = document.getElementById('traveler-name');
  const travelerEmailInput = document.getElementById('traveler-email');
  const travelerCountryInput = document.getElementById('traveler-country');
  const travelerCohortSelect = document.getElementById('traveler-cohort');
  const travelerBookingsInput = document.getElementById('traveler-bookings');
  const travelerRevenueInput = document.getElementById('traveler-revenue');
  const travelerDestinationInput = document.getElementById('traveler-destination');

  // Preset Buttons
  const presetFullAgency = document.getElementById('preset-full-agency');
  const presetLuxuryPilgrim = document.getElementById('preset-luxury-pilgrim');
  const presetCorporateHub = document.getElementById('preset-corporate-hub');

  // --- Constants & Color Map ---
  const COHORT_COLORS = {
    'VIP High-Net-Worth': '#fbbf24',
    'Frequent Corporate Travelers': '#60a5fa',
    'Family Vacationers': '#34d399',
    'Pilgrims': '#c084fc'
  };

  const COHORT_BADGE_CLASS = {
    'VIP High-Net-Worth': 'badge-vip',
    'Frequent Corporate Travelers': 'badge-corporate',
    'Family Vacationers': 'badge-family',
    'Pilgrims': 'badge-pilgrim'
  };

  const COHORT_ICONS = {
    'VIP High-Net-Worth': '👑',
    'Frequent Corporate Travelers': '💼',
    'Family Vacationers': '🌴',
    'Pilgrims': '🕋'
  };

  // --- Default Dataset ---
  const INITIAL_CUSTOMERS = [
    {
      id: 'cust-101',
      name: 'Prince Faisal Bin Salman',
      email: 'faisal.office@riyadh-holdings.sa',
      country: 'Saudi Arabia',
      cohort: 'VIP High-Net-Worth',
      bookings: 14,
      revenue: 84500,
      destination: 'Switzerland Chalets & Makkah Clock Tower Royal Suite'
    },
    {
      id: 'cust-102',
      name: 'Apex Global Logistics Ltd (C. Patel)',
      email: 'corporate.travel@apexlogistics.co.uk',
      country: 'United Kingdom',
      cohort: 'Frequent Corporate Travelers',
      bookings: 28,
      revenue: 46200,
      destination: 'London - Dubai - Singapore Business Routes'
    },
    {
      id: 'cust-103',
      name: 'Al-Madinah Islamic Foundation',
      email: 'hajj.delegates@madinah-foundation.org',
      country: 'Canada',
      cohort: 'Pilgrims',
      bookings: 9,
      revenue: 68500,
      destination: 'Group Umrah & Hajj Executive Delegations'
    },
    {
      id: 'cust-104',
      name: 'Dr. Raymond & Eleanor Vance',
      email: 'raymond.vance@vancemedical.com',
      country: 'United States',
      cohort: 'VIP High-Net-Worth',
      bookings: 8,
      revenue: 42000,
      destination: 'Maldives Private Overwater Villas & Safari'
    },
    {
      id: 'cust-105',
      name: 'TechFin Solutions Pte (Tan Wei Ming)',
      email: 'tan.w@techfin.sg',
      country: 'Singapore',
      cohort: 'Frequent Corporate Travelers',
      bookings: 19,
      revenue: 33800,
      destination: 'Monthly APAC Tech Conferences & Tokyo Flights'
    },
    {
      id: 'cust-106',
      name: 'Haji Mohammad Farooq & Family',
      email: 'farooq.family@orienttraders.com.bd',
      country: 'Bangladesh',
      cohort: 'Pilgrims',
      bookings: 6,
      revenue: 38400,
      destination: 'Ramadan VIP Umrah 21-Days Makkah'
    },
    {
      id: 'cust-107',
      name: 'The Harrison Family (5 Pax)',
      email: 'greg.harrison@gmail.com',
      country: 'Australia',
      cohort: 'Family Vacationers',
      bookings: 4,
      revenue: 21500,
      destination: 'Bali Villa Resorts & Gold Coast Theme Parks'
    },
    {
      id: 'cust-108',
      name: 'Countess Sofia Von Habsburg',
      email: 'sofia.habsburg@vienna-estate.at',
      country: 'Austria',
      cohort: 'VIP High-Net-Worth',
      bookings: 7,
      revenue: 39500,
      destination: 'Monaco Grand Prix & Amalfi Coast Yacht Charters'
    },
    {
      id: 'cust-109',
      name: 'Kearney Middle East Consulting',
      email: 'travel.desk@kearney-me.ae',
      country: 'United Arab Emirates',
      cohort: 'Frequent Corporate Travelers',
      bookings: 22,
      revenue: 29400,
      destination: 'Riyadh - Doha - Abu Dhabi Shuttle Flights'
    },
    {
      id: 'cust-110',
      name: 'The Al-Zahrani Family (7 Pax)',
      email: 'khalid.zahrani@zahrani-holding.sa',
      country: 'Saudi Arabia',
      cohort: 'Family Vacationers',
      bookings: 5,
      revenue: 26800,
      destination: 'Paris Disneyland & Swiss Alps Summer Escape'
    },
    {
      id: 'cust-111',
      name: 'Ustadh Bilal Tariq & Pilgrims Group',
      email: 'bilal.umrah@birmingham-dawah.uk',
      country: 'United Kingdom',
      cohort: 'Pilgrims',
      bookings: 5,
      revenue: 31200,
      destination: 'December Umrah 14-Days Madinah First'
    },
    {
      id: 'cust-112',
      name: 'Lucas & Mia Johansson',
      email: 'lucas.johansson@nordicdesigns.se',
      country: 'Sweden',
      cohort: 'Family Vacationers',
      bookings: 3,
      revenue: 14200,
      destination: 'Santorini & Crete Greek Islands Island-Hopping'
    },
    {
      id: 'cust-113',
      name: 'Marcus Brody (Solo Executive)',
      email: 'mbrody@brodycap.com',
      country: 'United States',
      cohort: 'Frequent Corporate Travelers',
      bookings: 11,
      revenue: 19800,
      destination: 'Transatlantic Business Class JFK-LHR'
    },
    {
      id: 'cust-114',
      name: 'Ahmed & Samira Khan (First-Time Umrah)',
      email: 'ahmed.khan92@yahoo.com',
      country: 'Canada',
      cohort: 'Pilgrims',
      bookings: 1,
      revenue: 3400,
      destination: 'Umrah Economy 10-Days'
    },
    {
      id: 'cust-115',
      name: 'The Dubois Family (4 Pax)',
      email: 'jean.dubois@lyon-agro.fr',
      country: 'France',
      cohort: 'Family Vacationers',
      bookings: 1,
      revenue: 4800,
      destination: 'Mauritius Beach Resort 7 Nights'
    }
  ];

  // --- State ---
  let customers = loadCustomers();
  let selectedCohortFilter = 'ALL';

  // --- Persistence ---
  function loadCustomers() {
    try {
      const stored = localStorage.getItem('travel_customer_analytics_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse stored customers, using default data.', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_CUSTOMERS));
  }

  function saveCustomers() {
    try {
      localStorage.setItem('travel_customer_analytics_v1', JSON.stringify(customers));
    } catch (e) {
      console.error('Could not save customers to localStorage', e);
    }
  }

  // --- Currency Formatting ---
  function getCurrencySymbol() {
    return currencySelect ? currencySelect.value : '$';
  }

  function formatMoney(amount) {
    const sym = getCurrencySymbol();
    const val = Number(amount) || 0;
    return `${sym}${val.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  }

  // --- Core Calculations ---
  function computeMetrics() {
    const totalClients = customers.length;
    const totalRevenue = customers.reduce((acc, c) => acc + (Number(c.revenue) || 0), 0);
    const totalBookings = customers.reduce((acc, c) => acc + (Number(c.bookings) || 0), 0);
    const avgBookingsPerClient = totalClients > 0 ? (totalBookings / totalClients) : 0;
    
    // Retention rate: % of clients with >= 2 bookings
    const retainedClients = customers.filter(c => (Number(c.bookings) || 0) >= 2);
    const retentionRate = totalClients > 0 ? (retainedClients.length / totalClients * 100) : 0;
    
    const avgLtv = totalClients > 0 ? (totalRevenue / totalClients) : 0;

    // Cohort breakdowns
    const cohortGroups = {
      'VIP High-Net-Worth': { count: 0, revenue: 0, bookings: 0 },
      'Frequent Corporate Travelers': { count: 0, revenue: 0, bookings: 0 },
      'Family Vacationers': { count: 0, revenue: 0, bookings: 0 },
      'Pilgrims': { count: 0, revenue: 0, bookings: 0 }
    };

    customers.forEach(c => {
      const g = cohortGroups[c.cohort] || cohortGroups['Family Vacationers'];
      g.count += 1;
      g.revenue += Number(c.revenue) || 0;
      g.bookings += Number(c.bookings) || 0;
    });

    const vipRevenueVal = cohortGroups['VIP High-Net-Worth'].revenue;
    const vipSharePercent = totalRevenue > 0 ? (vipRevenueVal / totalRevenue * 100) : 0;

    return {
      totalClients,
      totalRevenue,
      totalBookings,
      avgBookingsPerClient,
      retainedClientsCount: retainedClients.length,
      retentionRate,
      avgLtv,
      vipSharePercent,
      cohortGroups
    };
  }

  // --- UI Update: KPIs & Cohort Cards ---
  function renderMetrics(metrics) {
    kpiTotalRevenue.textContent = formatMoney(metrics.totalRevenue);
    kpiRevenueSub.textContent = `${metrics.totalBookings.toLocaleString()} total client bookings`;

    kpiTotalClients.textContent = metrics.totalClients.toLocaleString();
    kpiClientsSub.textContent = `${metrics.retainedClientsCount} repeat travelers`;

    kpiAvgBookings.textContent = metrics.avgBookingsPerClient.toFixed(1);

    kpiRetentionRate.textContent = `${metrics.retentionRate.toFixed(1)}%`;
    kpiRetentionSub.textContent = `${metrics.retainedClientsCount} / ${metrics.totalClients} repeat clients`;

    kpiAvgLtv.textContent = formatMoney(metrics.avgLtv);

    kpiVipShare.textContent = `${metrics.vipSharePercent.toFixed(1)}%`;

    // Cohort Breakdown Card details
    const vip = metrics.cohortGroups['VIP High-Net-Worth'];
    vipCount.textContent = `${vip.count} clients`;
    vipRevenue.textContent = formatMoney(vip.revenue);
    vipAvgBookings.textContent = vip.count > 0 ? (vip.bookings / vip.count).toFixed(1) : '0';
    vipAvgLtv.textContent = vip.count > 0 ? formatMoney(vip.revenue / vip.count) : formatMoney(0);

    const corp = metrics.cohortGroups['Frequent Corporate Travelers'];
    corporateCount.textContent = `${corp.count} clients`;
    corporateRevenue.textContent = formatMoney(corp.revenue);
    corporateAvgBookings.textContent = corp.count > 0 ? (corp.bookings / corp.count).toFixed(1) : '0';
    corporateAvgLtv.textContent = corp.count > 0 ? formatMoney(corp.revenue / corp.count) : formatMoney(0);

    const fam = metrics.cohortGroups['Family Vacationers'];
    familyCount.textContent = `${fam.count} clients`;
    familyRevenue.textContent = formatMoney(fam.revenue);
    familyAvgBookings.textContent = fam.count > 0 ? (fam.bookings / fam.count).toFixed(1) : '0';
    familyAvgLtv.textContent = fam.count > 0 ? formatMoney(fam.revenue / fam.count) : formatMoney(0);

    const pil = metrics.cohortGroups['Pilgrims'];
    pilgrimCount.textContent = `${pil.count} clients`;
    pilgrimRevenue.textContent = formatMoney(pil.revenue);
    pilgrimAvgBookings.textContent = pil.count > 0 ? (pil.bookings / pil.count).toFixed(1) : '0';
    pilgrimAvgLtv.textContent = pil.count > 0 ? formatMoney(pil.revenue / pil.count) : formatMoney(0);

    // Active state on cohort cards
    cohortCards.forEach(card => {
      const ch = card.getAttribute('data-cohort');
      if (selectedCohortFilter === ch) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    if (selectedCohortFilter !== 'ALL') {
      btnClearCohortFilter.style.display = 'inline-block';
      btnClearCohortFilter.textContent = `Clear Filter (${selectedCohortFilter})`;
    } else {
      btnClearCohortFilter.style.display = 'none';
    }
  }

  // --- UI Update: Top 10 High-Value Travelers ---
  function renderTop10() {
    const sorted = [...customers].sort((a, b) => (Number(b.revenue) || 0) - (Number(a.revenue) || 0));
    const top10 = sorted.slice(0, 10);

    topTravelersList.innerHTML = '';
    if (top10.length === 0) {
      topTravelersList.innerHTML = '<div style="color:var(--text-tertiary); font-size:0.85rem; padding:1rem; text-align:center;">No client records yet.</div>';
      return;
    }

    top10.forEach((cust, index) => {
      const rank = index + 1;
      let rankClass = 'rank-other';
      if (rank === 1) rankClass = 'rank-1';
      else if (rank === 2) rankClass = 'rank-2';
      else if (rank === 3) rankClass = 'rank-3';

      const avgTrip = cust.bookings > 0 ? (cust.revenue / cust.bookings) : cust.revenue;
      const item = document.createElement('div');
      item.style.cssText = 'display:flex; align-items:center; justify-content:space-between; padding:0.6rem 0.75rem; background:var(--bg-tertiary); border:1px solid var(--border); border-radius:var(--radius-sm); transition:var(--transition);';
      item.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.6rem; min-width:0;">
          <span class="rank-circle ${rankClass}">${rank}</span>
          <div style="min-width:0;">
            <div style="font-weight:700; font-size:0.83rem; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${escapeHtml(cust.name)}
            </div>
            <div style="font-size:0.72rem; color:var(--text-tertiary); display:flex; align-items:center; gap:0.35rem;">
              <span>${COHORT_ICONS[cust.cohort] || '✈️'} ${escapeHtml(cust.cohort)}</span>
              <span>•</span>
              <span>${cust.bookings} trips</span>
            </div>
          </div>
        </div>
        <div style="text-align:right; flex-shrink:0;">
          <div style="font-weight:800; font-size:0.9rem; color:var(--text-primary); font-family:monospace;">
            ${formatMoney(cust.revenue)}
          </div>
          <div style="font-size:0.7rem; color:var(--text-tertiary);">
            Avg: ${formatMoney(avgTrip)}
          </div>
        </div>
      `;
      topTravelersList.appendChild(item);
    });
  }

  // --- UI Update: SVG Donut Chart ---
  function renderCohortChart(metrics) {
    chartTotalLabel.textContent = formatMoney(metrics.totalRevenue);
    cohortLegendContainer.innerHTML = '';

    const cohorts = [
      { key: 'VIP High-Net-Worth', name: 'VIP High-Net-Worth', color: COHORT_COLORS['VIP High-Net-Worth'], icon: '👑' },
      { key: 'Frequent Corporate Travelers', name: 'Frequent Corporate', color: COHORT_COLORS['Frequent Corporate Travelers'], icon: '💼' },
      { key: 'Family Vacationers', name: 'Family Vacationers', color: COHORT_COLORS['Family Vacationers'], icon: '🌴' },
      { key: 'Pilgrims', name: 'Pilgrims (Umrah/Hajj)', color: COHORT_COLORS['Pilgrims'], icon: '🕋' }
    ];

    const totalRev = metrics.totalRevenue;
    const slices = cohorts.map(c => {
      const group = metrics.cohortGroups[c.key] || { revenue: 0, count: 0 };
      const rev = group.revenue;
      const pct = totalRev > 0 ? (rev / totalRev) : 0;
      return { ...c, revenue: rev, count: group.count, percent: pct };
    });

    // Populate legend
    slices.forEach(s => {
      const pctDisplay = (s.percent * 100).toFixed(1);
      const row = document.createElement('div');
      row.style.cssText = 'display:flex; align-items:center; justify-content:space-between; padding:0.25rem 0.5rem; border-radius:var(--radius-sm); background:var(--bg-tertiary); border-left:3px solid ' + s.color + ';';
      row.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.4rem;">
          <span>${s.icon}</span>
          <span style="font-weight:600; color:var(--text-secondary); font-size:0.75rem;">${s.name}</span>
          <span style="color:var(--text-tertiary); font-size:0.7rem;">(${s.count})</span>
        </div>
        <div style="font-weight:700; color:var(--text-primary); font-size:0.75rem;">
          ${formatMoney(s.revenue)} <span style="color:var(--text-tertiary); font-weight:normal;">(${pctDisplay}%)</span>
        </div>
      `;
      cohortLegendContainer.appendChild(row);
    });

    // Render SVG Donut
    const cx = 160;
    const cy = 120;
    const radius = 70;
    const strokeWidth = 26;

    if (totalRev === 0) {
      cohortDonutSvg.innerHTML = `
        <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="var(--border)" stroke-width="${strokeWidth}" />
        <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" fill="var(--text-tertiary)" font-size="12">No Data</text>
      `;
      return;
    }

    const circumference = 2 * Math.PI * radius;
    let accumulatedAngle = 0;
    let svgPaths = '';

    slices.forEach(slice => {
      if (slice.percent <= 0) return;
      const dashLength = slice.percent * circumference;
      const dashGap = circumference - dashLength;
      const offset = -accumulatedAngle;
      accumulatedAngle += dashLength;

      svgPaths += `
        <circle 
          cx="${cx}" 
          cy="${cy}" 
          r="${radius}" 
          fill="none" 
          stroke="${slice.color}" 
          stroke-width="${strokeWidth}" 
          stroke-dasharray="${dashLength.toFixed(2)} ${dashGap.toFixed(2)}"
          stroke-dashoffset="${offset.toFixed(2)}"
          transform="rotate(-90 ${cx} ${cy})"
          style="transition: all 0.4s ease; cursor: pointer;"
        >
          <title>${slice.name}: ${formatMoney(slice.revenue)} (${(slice.percent * 100).toFixed(1)}%)</title>
        </circle>
      `;
    });

    cohortDonutSvg.innerHTML = `
      <g>
        <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="${strokeWidth}" />
        ${svgPaths}
        <!-- Center Text -->
        <text x="${cx}" y="${cy - 7}" text-anchor="middle" fill="var(--text-secondary)" font-size="10" font-weight="600" letter-spacing="1">TOTAL LTV</text>
        <text x="${cx}" y="${cy + 13}" text-anchor="middle" fill="var(--text-primary)" font-size="14" font-weight="800">${formatMoney(totalRev)}</text>
      </g>
    `;
  }

  // --- Filtered Client Table Render ---
  function renderClientTable() {
    const searchTerm = (clientSearchInput.value || '').trim().toLowerCase();
    const cohortFilter = selectedCohortFilter;
    const retentionFilter = selectFilterRetention.value;
    const sortBy = selectSortBy.value;

    let filtered = customers.filter(c => {
      // Cohort filter
      if (cohortFilter !== 'ALL' && c.cohort !== cohortFilter) return false;

      // Retention filter
      const bCount = Number(c.bookings) || 0;
      if (retentionFilter === 'RETAINED' && bCount < 2) return false;
      if (retentionFilter === 'SINGLE' && bCount >= 2) return false;

      // Search filter
      if (searchTerm) {
        const str = `${c.name} ${c.email || ''} ${c.country || ''} ${c.destination || ''}`.toLowerCase();
        if (!str.includes(searchTerm)) return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'revenue-desc') return (Number(b.revenue) || 0) - (Number(a.revenue) || 0);
      if (sortBy === 'revenue-asc') return (Number(a.revenue) || 0) - (Number(b.revenue) || 0);
      if (sortBy === 'bookings-desc') return (Number(b.bookings) || 0) - (Number(a.bookings) || 0);
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return 0;
    });

    filteredClientsCount.textContent = `Showing ${filtered.length} of ${customers.length} clients`;

    clientTableBody.innerHTML = '';
    if (filtered.length === 0) {
      clientTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding:2rem; color:var(--text-tertiary);">
            No clients found matching the current search & filters.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(c => {
      const tr = document.createElement('tr');
      const bCount = Number(c.bookings) || 0;
      const rev = Number(c.revenue) || 0;
      const avgTrip = bCount > 0 ? (rev / bCount) : rev;
      const badgeCls = COHORT_BADGE_CLASS[c.cohort] || 'badge-family';
      const icon = COHORT_ICONS[c.cohort] || '✈️';
      const isRetained = bCount >= 2;

      tr.innerHTML = `
        <td>
          <div style="font-weight:700; color:var(--text-primary);">${escapeHtml(c.name)}</div>
          <div style="font-size:0.73rem; color:var(--text-tertiary);">
            ${c.country ? escapeHtml(c.country) + ' • ' : ''}${c.email ? escapeHtml(c.email) : 'No email'}
          </div>
          ${c.destination ? `<div style="font-size:0.7rem; color:var(--accent); margin-top:2px;">📍 ${escapeHtml(c.destination)}</div>` : ''}
        </td>
        <td>
          <span class="cohort-badge ${badgeCls}">${icon} ${escapeHtml(c.cohort)}</span>
        </td>
        <td style="font-weight:700;">
          ${bCount}
          <button type="button" class="btn-quick-trip" data-id="${c.id}" title="Quick add 1 trip" style="background:none; border:1px solid var(--border); border-radius:4px; color:var(--accent); font-size:0.65rem; padding:1px 4px; margin-left:4px; cursor:pointer;">+1</button>
        </td>
        <td style="font-weight:800; font-family:monospace; color:var(--text-primary);">
          ${formatMoney(rev)}
        </td>
        <td style="color:var(--text-secondary); font-family:monospace;">
          ${formatMoney(avgTrip)}
        </td>
        <td>
          <span class="${isRetained ? 'badge-retention-loyal' : 'badge-retention-new'}">
            ${isRetained ? `Repeat (${bCount}x)` : 'First-Time'}
          </span>
        </td>
        <td style="text-align:right;">
          <div style="display:inline-flex; gap:0.25rem;">
            <button type="button" class="btn-edit-client" data-id="${c.id}" title="Edit Traveler" style="background:transparent; border:1px solid var(--border); color:var(--text-secondary); padding:0.25rem 0.5rem; border-radius:var(--radius-sm); cursor:pointer; font-size:0.75rem;">
              ✏️
            </button>
            <button type="button" class="btn-delete-client" data-id="${c.id}" title="Delete Traveler" style="background:transparent; border:1px solid var(--border); color:#ef4444; padding:0.25rem 0.5rem; border-radius:var(--radius-sm); cursor:pointer; font-size:0.75rem;">
              🗑️
            </button>
          </div>
        </td>
      `;
      clientTableBody.appendChild(tr);
    });
  }

  // --- Full Refresh ---
  function updateAll() {
    const metrics = computeMetrics();
    renderMetrics(metrics);
    renderTop10();
    renderCohortChart(metrics);
    renderClientTable();
    saveCustomers();
  }

  // --- Event Listeners: Filtering & Cohort Cards ---
  cohortCards.forEach(card => {
    card.addEventListener('click', () => {
      const clickedCohort = card.getAttribute('data-cohort');
      if (selectedCohortFilter === clickedCohort) {
        selectedCohortFilter = 'ALL';
        selectFilterCohort.value = 'ALL';
      } else {
        selectedCohortFilter = clickedCohort;
        selectFilterCohort.value = clickedCohort;
      }
      updateAll();
    });
  });

  if (btnClearCohortFilter) {
    btnClearCohortFilter.addEventListener('click', () => {
      selectedCohortFilter = 'ALL';
      selectFilterCohort.value = 'ALL';
      updateAll();
    });
  }

  selectFilterCohort.addEventListener('change', (e) => {
    selectedCohortFilter = e.target.value;
    updateAll();
  });

  selectFilterRetention.addEventListener('change', () => renderClientTable());
  selectSortBy.addEventListener('change', () => renderClientTable());
  clientSearchInput.addEventListener('input', () => renderClientTable());

  if (currencySelect) {
    currencySelect.addEventListener('change', () => updateAll());
  }

  // Table Delegated Actions (Edit, Delete, Quick increment)
  clientTableBody.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.btn-edit-client');
    const deleteBtn = e.target.closest('.btn-delete-client');
    const quickTripBtn = e.target.closest('.btn-quick-trip');

    if (editBtn) {
      const id = editBtn.getAttribute('data-id');
      const client = customers.find(c => c.id === id);
      if (client) openEditModal(client);
    } else if (deleteBtn) {
      const id = deleteBtn.getAttribute('data-id');
      const client = customers.find(c => c.id === id);
      if (client && confirm(`Delete client "${client.name}"?`)) {
        customers = customers.filter(c => c.id !== id);
        updateAll();
      }
    } else if (quickTripBtn) {
      const id = quickTripBtn.getAttribute('data-id');
      const client = customers.find(c => c.id === id);
      if (client) {
        const curBookings = Number(client.bookings) || 0;
        const curRev = Number(client.revenue) || 0;
        const avgRev = curBookings > 0 ? (curRev / curBookings) : 1000;
        client.bookings = curBookings + 1;
        client.revenue = Math.round(curRev + avgRev);
        updateAll();
      }
    }
  });

  // --- Modal Operations ---
  function openAddModal() {
    modalTitle.textContent = 'Add Traveler Profile';
    travelerIdInput.value = '';
    travelerForm.reset();
    travelerBookingsInput.value = '1';
    travelerRevenueInput.value = '1500';
    travelerModal.classList.add('active');
  }

  function openEditModal(client) {
    modalTitle.textContent = 'Edit Traveler Profile';
    travelerIdInput.value = client.id;
    travelerNameInput.value = client.name;
    travelerEmailInput.value = client.email || '';
    travelerCountryInput.value = client.country || '';
    travelerCohortSelect.value = client.cohort;
    travelerBookingsInput.value = client.bookings;
    travelerRevenueInput.value = client.revenue;
    travelerDestinationInput.value = client.destination || '';
    travelerModal.classList.add('active');
  }

  function closeModal() {
    travelerModal.classList.remove('active');
  }

  if (btnAddTraveler) btnAddTraveler.addEventListener('click', openAddModal);
  if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
  if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

  travelerModal.addEventListener('click', (e) => {
    if (e.target === travelerModal) closeModal();
  });

  travelerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = travelerIdInput.value;
    const name = travelerNameInput.value.trim();
    const email = travelerEmailInput.value.trim();
    const country = travelerCountryInput.value.trim();
    const cohort = travelerCohortSelect.value;
    const bookings = Math.max(1, parseInt(travelerBookingsInput.value, 10) || 1);
    const revenue = Math.max(0, parseFloat(travelerRevenueInput.value) || 0);
    const destination = travelerDestinationInput.value.trim();

    if (id) {
      // Edit
      const client = customers.find(c => c.id === id);
      if (client) {
        client.name = name;
        client.email = email;
        client.country = country;
        client.cohort = cohort;
        client.bookings = bookings;
        client.revenue = revenue;
        client.destination = destination;
      }
    } else {
      // Add
      const newClient = {
        id: 'cust-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        name,
        email,
        country,
        cohort,
        bookings,
        revenue,
        destination
      };
      customers.unshift(newClient);
    }

    closeModal();
    updateAll();
  });

  // --- CSV Export ---
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', () => {
      const headers = ['Client ID', 'Client Name', 'Email', 'Country', 'Cohort', 'Total Bookings', 'Lifetime Revenue', 'Avg Spend Per Trip', 'Retention Status', 'Preferred Destination'];
      const rows = customers.map(c => {
        const b = Number(c.bookings) || 0;
        const r = Number(c.revenue) || 0;
        const avg = b > 0 ? (r / b).toFixed(2) : r.toFixed(2);
        const status = b >= 2 ? 'Retained Repeat' : 'First-Time Single';
        return [
          csvClean(c.id),
          csvClean(c.name),
          csvClean(c.email || ''),
          csvClean(c.country || ''),
          csvClean(c.cohort),
          b,
          r,
          avg,
          status,
          csvClean(c.destination || '')
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `travel_customer_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }

  // --- Reset Demo Data ---
  if (btnResetDemo) {
    btnResetDemo.addEventListener('click', () => {
      if (confirm('Reset client analytics database back to default demonstration records?')) {
        customers = JSON.parse(JSON.stringify(INITIAL_CUSTOMERS));
        selectedCohortFilter = 'ALL';
        selectFilterCohort.value = 'ALL';
        updateAll();
      }
    });
  }

  // --- Preset Agency Buttons ---
  if (presetFullAgency) {
    presetFullAgency.addEventListener('click', () => {
      customers = JSON.parse(JSON.stringify(INITIAL_CUSTOMERS));
      selectedCohortFilter = 'ALL';
      selectFilterCohort.value = 'ALL';
      updateAll();
    });
  }

  if (presetLuxuryPilgrim) {
    presetLuxuryPilgrim.addEventListener('click', () => {
      customers = [
        { id: 'p1', name: 'Al-Mansoor Royal Travel Delegation', email: 'vip@almansoor.sa', country: 'Saudi Arabia', cohort: 'VIP High-Net-Worth', bookings: 12, revenue: 112000, destination: 'Makkah Clock Tower Royal Suite' },
        { id: 'p2', name: 'Canadian Muslim Pilgrims Union', email: 'info@canadapilgrims.ca', country: 'Canada', cohort: 'Pilgrims', bookings: 15, revenue: 94000, destination: 'Annual Group Umrah 18-Days' },
        { id: 'p3', name: 'Sultanate Aviation Private Charter', email: 'ops@sultanate-air.om', country: 'Oman', cohort: 'VIP High-Net-Worth', bookings: 9, revenue: 76000, destination: 'Medina & Jeddah Executive Ground Ops' },
        { id: 'p4', name: 'London Islamic Academy Group', email: 'hajj@london-academy.org.uk', country: 'United Kingdom', cohort: 'Pilgrims', bookings: 8, revenue: 52000, destination: 'Ramadan 10-Nights Madinah' },
        { id: 'p5', name: 'Doha Business Group (Al-Thani reps)', email: 'travel@doha-holding.qa', country: 'Qatar', cohort: 'Frequent Corporate Travelers', bookings: 14, revenue: 39000, destination: 'Gulf Shuttle & London' },
        { id: 'p6', name: 'Al-Hashemi Family Pilgrims', email: 'hashemi@gmail.com', country: 'Jordan', cohort: 'Pilgrims', bookings: 4, revenue: 22000, destination: 'Umrah 12-Days 5-Star' }
      ];
      selectedCohortFilter = 'ALL';
      selectFilterCohort.value = 'ALL';
      updateAll();
    });
  }

  if (presetCorporateHub) {
    presetCorporateHub.addEventListener('click', () => {
      customers = [
        { id: 'c1', name: 'McKinsey & Co Middle East', email: 'travel@mckinsey.com', country: 'UAE', cohort: 'Frequent Corporate Travelers', bookings: 45, revenue: 88500, destination: 'Weekly GCC Business Flights' },
        { id: 'c2', name: 'Deloitte Consulting APAC', email: 'apac-travel@deloitte.com', country: 'Singapore', cohort: 'Frequent Corporate Travelers', bookings: 38, revenue: 74200, destination: 'Singapore - Hong Kong - Sydney' },
        { id: 'c3', name: 'Siemens Energy Regional Desk', email: 'mobility@siemens-energy.de', country: 'Germany', cohort: 'Frequent Corporate Travelers', bookings: 29, revenue: 56000, destination: 'Frankfurt - Doha - Dammam' },
        { id: 'c4', name: 'Barclays Private Wealth (London)', email: 'privateclient@barclays.co.uk', country: 'United Kingdom', cohort: 'VIP High-Net-Worth', bookings: 11, revenue: 64000, destination: 'Geneva - Dubai First Class' },
        { id: 'c5', name: 'The Thompson Family Vacation', email: 'thompson@gmail.com', country: 'United Kingdom', cohort: 'Family Vacationers', bookings: 3, revenue: 16500, destination: 'Caribbean Cruise & Miami' }
      ];
      selectedCohortFilter = 'ALL';
      selectFilterCohort.value = 'ALL';
      updateAll();
    });
  }

  // --- Utility Helpers ---
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

  // --- Initialize ---
  updateAll();
});