/**
 * Ticket Analytics
 * Airline ticketing revenue, route volume auditor, and gross commission tracker.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const currencySelect = document.getElementById('currency-select');
  const kpiTicketVolume = document.getElementById('kpi-ticket-volume');
  const kpiTicketVolumeSub = document.getElementById('kpi-ticket-volume-sub');
  const kpiGrossSales = document.getElementById('kpi-gross-sales');
  const kpiGrossSalesSub = document.getElementById('kpi-gross-sales-sub');
  const kpiCommissionRevenue = document.getElementById('kpi-commission-revenue');
  const kpiCommissionMargin = document.getElementById('kpi-commission-margin');
  const kpiAvgFare = document.getElementById('kpi-avg-fare');
  const kpiTopRoute = document.getElementById('kpi-top-route');
  const kpiTopRouteSub = document.getElementById('kpi-top-route-sub');
  const kpiTopAirline = document.getElementById('kpi-top-airline');
  const kpiTopAirlineSub = document.getElementById('kpi-top-airline-sub');

  const airlineStripContainer = document.getElementById('airline-strip-container');
  const btnClearAirlineFilter = document.getElementById('btn-clear-airline-filter');

  const ticketSearchInput = document.getElementById('ticket-search-input');
  const selectFilterAirline = document.getElementById('select-filter-airline');
  const selectFilterClass = document.getElementById('select-filter-class');
  const selectFilterStatus = document.getElementById('select-filter-status');
  const ticketTableBody = document.getElementById('ticket-table-body');
  const filteredTicketsCount = document.getElementById('filtered-tickets-count');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnResetDemo = document.getElementById('btn-reset-demo');

  const btnChartVolume = document.getElementById('btn-chart-volume');
  const btnChartComm = document.getElementById('btn-chart-comm');
  const routeChartSvg = document.getElementById('route-chart-svg');
  const chartTooltip = document.getElementById('chart-tooltip');
  const topRoutesList = document.getElementById('top-routes-list');

  // Modal Elements
  const ticketModal = document.getElementById('ticket-modal');
  const btnAddTicket = document.getElementById('btn-add-ticket');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCancelModal = document.getElementById('btn-cancel-modal');
  const ticketForm = document.getElementById('ticket-form');
  const modalTitle = document.getElementById('modal-title');
  const ticketIdInput = document.getElementById('ticket-id');
  const ticketPassengerInput = document.getElementById('ticket-passenger');
  const ticketPnrInput = document.getElementById('ticket-pnr');
  const ticketAirlineSelect = document.getElementById('ticket-airline');
  const ticketClassSelect = document.getElementById('ticket-class');
  const ticketOriginInput = document.getElementById('ticket-origin');
  const ticketDestinationInput = document.getElementById('ticket-destination');
  const ticketBaseFareInput = document.getElementById('ticket-base-fare');
  const ticketCommissionInput = document.getElementById('ticket-commission');
  const ticketDateInput = document.getElementById('ticket-date');
  const ticketStatusSelect = document.getElementById('ticket-status');

  // Preset Buttons
  const presetGulfRoutes = document.getElementById('preset-gulf-routes');
  const presetTransatlantic = document.getElementById('preset-transatlantic');
  const presetAsiaPilgrim = document.getElementById('preset-asia-pilgrim');

  // --- Constants & Color Mappings ---
  const AIRLINE_INFO = {
    'Emirates': { code: 'EK', color: '#ef4444', name: 'Emirates' },
    'Qatar Airways': { code: 'QR', color: '#9d174d', name: 'Qatar Airways' },
    'Saudia': { code: 'SV', color: '#15803d', name: 'Saudia' },
    'Biman Bangladesh': { code: 'BG', color: '#16a34a', name: 'Biman Bangladesh' },
    'Singapore Airlines': { code: 'SQ', color: '#3b82f6', name: 'Singapore Airlines' },
    'Turkish Airlines': { code: 'TK', color: '#e11d48', name: 'Turkish Airlines' },
    'British Airways': { code: 'BA', color: '#1e40af', name: 'British Airways' },
    'Other Airline': { code: 'OA', color: '#64748b', name: 'Other Airline' }
  };

  // --- Initial Mock Data ---
  const INITIAL_TICKETS = [
    { id: 't-101', passenger: 'Sheikh Sultan Al-Qasimi', pnr: 'EK-82910', airline: 'Emirates', origin: 'DXB', destination: 'LHR', flightClass: 'First', baseFare: 5400, commission: 480, date: '2026-10-12', status: 'Issued' },
    { id: 't-102', passenger: 'Kazi Mahbubul Alam', pnr: 'BG-30419', airline: 'Biman Bangladesh', origin: 'DAC', destination: 'JED', flightClass: 'Economy', baseFare: 780, commission: 95, date: '2026-10-14', status: 'Issued' },
    { id: 't-103', passenger: 'Sophia Kensington', pnr: 'QR-49102', airline: 'Qatar Airways', origin: 'DOH', destination: 'JFK', flightClass: 'Business', baseFare: 3850, commission: 340, date: '2026-10-15', status: 'Issued' },
    { id: 't-104', passenger: 'Mohammed Al-Ghamdi', pnr: 'SV-77120', airline: 'Saudia', origin: 'JED', destination: 'LHR', flightClass: 'Business', baseFare: 2900, commission: 260, date: '2026-10-16', status: 'Issued' },
    { id: 't-105', passenger: 'Tan Wei Kiat', pnr: 'SQ-11980', airline: 'Singapore Airlines', origin: 'SIN', destination: 'LHR', flightClass: 'Business', baseFare: 3600, commission: 310, date: '2026-10-18', status: 'Issued' },
    { id: 't-106', passenger: 'Ayesha Siddiqua', pnr: 'SV-90214', airline: 'Saudia', origin: 'RUH', destination: 'DXB', flightClass: 'Economy', baseFare: 420, commission: 55, date: '2026-10-19', status: 'Issued' },
    { id: 't-107', passenger: 'Oliver Vance', pnr: 'BA-20911', airline: 'British Airways', origin: 'LHR', destination: 'JFK', flightClass: 'Premium Economy', baseFare: 1650, commission: 140, date: '2026-10-20', status: 'Confirmed' },
    { id: 't-108', passenger: 'Emre Yilmaz', pnr: 'TK-55410', airline: 'Turkish Airlines', origin: 'IST', destination: 'DXB', flightClass: 'Economy', baseFare: 580, commission: 70, date: '2026-10-21', status: 'Issued' },
    { id: 't-109', passenger: 'Farzana Chowdhury', pnr: 'BG-67123', airline: 'Biman Bangladesh', origin: 'DAC', destination: 'LHR', flightClass: 'Economy', baseFare: 920, commission: 110, date: '2026-10-22', status: 'Issued' },
    { id: 't-110', passenger: 'Nasser Al-Hajri', pnr: 'QR-88129', airline: 'Qatar Airways', origin: 'DOH', destination: 'LHR', flightClass: 'First', baseFare: 6200, commission: 560, date: '2026-10-23', status: 'Issued' },
    { id: 't-111', passenger: 'Lucas Moreau', pnr: 'EK-91023', airline: 'Emirates', origin: 'DXB', destination: 'SIN', flightClass: 'Economy', baseFare: 750, commission: 85, date: '2026-10-24', status: 'Issued' },
    { id: 't-112', passenger: 'Dr. Tariqul Islam', pnr: 'SV-33091', airline: 'Saudia', origin: 'DAC', destination: 'MED', flightClass: 'Economy', baseFare: 840, commission: 105, date: '2026-10-25', status: 'Issued' },
    { id: 't-113', passenger: 'Hannah Schmidt', pnr: 'TK-44102', airline: 'Turkish Airlines', origin: 'IST', destination: 'JED', flightClass: 'Business', baseFare: 1850, commission: 190, date: '2026-10-26', status: 'Issued' },
    { id: 't-114', passenger: 'Chen Li & Partner', pnr: 'SQ-77290', airline: 'Singapore Airlines', origin: 'SIN', destination: 'SYD', flightClass: 'Economy', baseFare: 820, commission: 90, date: '2026-10-27', status: 'Issued' },
    { id: 't-115', passenger: 'James Sterling', pnr: 'EK-10294', airline: 'Emirates', origin: 'DXB', destination: 'LHR', flightClass: 'Business', baseFare: 3100, commission: 280, date: '2026-10-28', status: 'Issued' },
    { id: 't-116', passenger: 'Mona Al-Sabah', pnr: 'QR-50192', airline: 'Qatar Airways', origin: 'DOH', destination: 'CDG', flightClass: 'Business', baseFare: 3400, commission: 300, date: '2026-10-29', status: 'Issued' },
    { id: 't-117', passenger: 'Anisur Rahman', pnr: 'BG-88410', airline: 'Biman Bangladesh', origin: 'DAC', destination: 'DXB', flightClass: 'Economy', baseFare: 610, commission: 75, date: '2026-10-30', status: 'Refunded' },
    { id: 't-118', passenger: 'Robert Sterling', pnr: 'BA-66120', airline: 'British Airways', origin: 'LHR', destination: 'DXB', flightClass: 'Economy', baseFare: 720, commission: 65, date: '2026-10-31', status: 'Issued' }
  ];

  // --- State ---
  let tickets = loadTickets();
  let selectedAirlineFilter = 'ALL';
  let chartMetric = 'volume'; // 'volume' | 'commission'

  // --- Persistence ---
  function loadTickets() {
    try {
      const stored = localStorage.getItem('travel_ticket_analytics_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved tickets, using initial demo data.', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_TICKETS));
  }

  function saveTickets() {
    try {
      localStorage.setItem('travel_ticket_analytics_v1', JSON.stringify(tickets));
    } catch (e) {
      console.error('Could not save tickets', e);
    }
  }

  // --- Helpers ---
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
  function computeTicketingMetrics() {
    // Only non-void and non-refunded tickets count towards active sales & volume
    const validTickets = tickets.filter(t => t.status !== 'Void');
    const activeTickets = validTickets.filter(t => t.status !== 'Refunded');
    
    const totalVolume = activeTickets.length;
    const totalBaseFare = activeTickets.reduce((acc, t) => acc + (Number(t.baseFare) || 0), 0);
    const totalCommission = activeTickets.reduce((acc, t) => acc + (Number(t.commission) || 0), 0);
    const grossSales = totalBaseFare + totalCommission;

    const avgFare = totalVolume > 0 ? (totalBaseFare / totalVolume) : 0;
    const commissionMarginPct = grossSales > 0 ? (totalCommission / grossSales * 100) : 0;

    // Route Analysis
    const routeMap = {};
    activeTickets.forEach(t => {
      const origin = (t.origin || 'UNK').trim().toUpperCase();
      const dest = (t.destination || 'UNK').trim().toUpperCase();
      const routeKey = `${origin} → ${dest}`;

      if (!routeMap[routeKey]) {
        routeMap[routeKey] = { route: routeKey, volume: 0, commission: 0, baseFare: 0, totalSales: 0 };
      }
      routeMap[routeKey].volume += 1;
      routeMap[routeKey].commission += Number(t.commission) || 0;
      routeMap[routeKey].baseFare += Number(t.baseFare) || 0;
      routeMap[routeKey].totalSales += (Number(t.baseFare) || 0) + (Number(t.commission) || 0);
    });

    const routeList = Object.values(routeMap);
    routeList.sort((a, b) => b.volume - a.volume);
    const topRoute = routeList.length > 0 ? routeList[0] : null;

    // Airline Performance Map
    const airlineStats = {};
    const defaultCarriers = ['Emirates', 'Qatar Airways', 'Saudia', 'Biman Bangladesh', 'Singapore Airlines', 'Turkish Airlines', 'British Airways'];
    
    defaultCarriers.forEach(carrier => {
      airlineStats[carrier] = { name: carrier, count: 0, totalBase: 0, totalComm: 0, avgFare: 0 };
    });

    activeTickets.forEach(t => {
      const c = t.airline || 'Other Airline';
      if (!airlineStats[c]) {
        airlineStats[c] = { name: c, count: 0, totalBase: 0, totalComm: 0, avgFare: 0 };
      }
      airlineStats[c].count += 1;
      airlineStats[c].totalBase += Number(t.baseFare) || 0;
      airlineStats[c].totalComm += Number(t.commission) || 0;
    });

    Object.values(airlineStats).forEach(stat => {
      stat.avgFare = stat.count > 0 ? (stat.totalBase / stat.count) : 0;
    });

    // Top Airline by volume
    const sortedCarriers = Object.values(airlineStats).filter(c => c.count > 0).sort((a, b) => b.count - a.count);
    const topAirline = sortedCarriers.length > 0 ? sortedCarriers[0] : null;

    return {
      totalVolume,
      grossSales,
      totalCommission,
      commissionMarginPct,
      avgFare,
      topRoute,
      topAirline,
      routeList,
      airlineStats
    };
  }

  // --- UI Update: KPIs ---
  function renderKPIs(metrics) {
    kpiTicketVolume.textContent = metrics.totalVolume.toLocaleString();
    kpiTicketVolumeSub.textContent = `${tickets.length} total tickets in ledger`;

    kpiGrossSales.textContent = formatMoney(metrics.grossSales);
    kpiGrossSalesSub = document.getElementById('kpi-gross-sales-sub');
    if (kpiGrossSalesSub) {
      kpiGrossSalesSub.textContent = `Includes base + agent markup`;
    }

    kpiCommissionRevenue.textContent = formatMoney(metrics.totalCommission);
    kpiCommissionMargin.textContent = `Avg Margin: ${metrics.commissionMarginPct.toFixed(1)}%`;

    kpiAvgFare.textContent = formatMoney(metrics.avgFare);

    if (metrics.topRoute) {
      kpiTopRoute.textContent = metrics.topRoute.route;
      kpiTopRouteSub.textContent = `${metrics.topRoute.volume} bookings • ${formatMoney(metrics.topRoute.commission)} comm`;
    } else {
      kpiTopRoute.textContent = '-';
      kpiTopRouteSub.textContent = 'No bookings recorded';
    }

    if (metrics.topAirline) {
      kpiTopAirline.textContent = metrics.topAirline.name;
      kpiTopAirlineSub.textContent = `${metrics.topAirline.count} tickets • Avg ${formatMoney(metrics.topAirline.avgFare)}`;
    } else {
      kpiTopAirline.textContent = '-';
      kpiTopAirlineSub.textContent = '0 tickets';
    }
  }

  // --- UI Update: Airline Cards Strip ---
  function renderAirlineStrip(metrics) {
    airlineStripContainer.innerHTML = '';
    const carriers = ['Emirates', 'Qatar Airways', 'Saudia', 'Biman Bangladesh', 'Singapore Airlines', 'Turkish Airlines', 'British Airways'];

    carriers.forEach(carrier => {
      const info = AIRLINE_INFO[carrier] || { code: 'AIR', color: '#60a5fa' };
      const stat = metrics.airlineStats[carrier] || { count: 0, avgFare: 0, totalComm: 0 };

      const card = document.createElement('div');
      card.className = `airline-card ${selectedAirlineFilter === carrier ? 'active' : ''}`;
      card.setAttribute('data-airline', carrier);
      card.style.borderLeft = `3px solid ${info.color}`;

      card.innerHTML = `
        <div class="airline-tag" style="color:${info.color};">
          <span style="background:${info.color}; color:#ffffff; padding:0.1rem 0.35rem; border-radius:3px; font-size:0.65rem;">${info.code}</span>
          <span>${carrier}</span>
        </div>
        <div style="font-size:1.15rem; font-weight:800; color:var(--text-primary); font-family:monospace; margin-top:2px;">
          ${stat.count} <span style="font-size:0.7rem; font-weight:normal; color:var(--text-tertiary);">tickets</span>
        </div>
        <div class="airline-stat-row">
          <span>Avg Fare:</span>
          <strong>${formatMoney(stat.avgFare)}</strong>
        </div>
        <div class="airline-stat-row">
          <span>Comm Earned:</span>
          <strong style="color:#34d399;">${formatMoney(stat.totalComm)}</strong>
        </div>
      `;

      card.addEventListener('click', () => {
        if (selectedAirlineFilter === carrier) {
          selectedAirlineFilter = 'ALL';
          selectFilterAirline.value = 'ALL';
        } else {
          selectedAirlineFilter = carrier;
          selectFilterAirline.value = carrier;
        }
        updateAll();
      });

      airlineStripContainer.appendChild(card);
    });

    if (selectedAirlineFilter !== 'ALL') {
      btnClearAirlineFilter.style.display = 'inline-block';
      btnClearAirlineFilter.textContent = `Clear Filter (${selectedAirlineFilter})`;
    } else {
      btnClearAirlineFilter.style.display = 'none';
    }
  }

  // --- UI Update: Interactive SVG Route Chart ---
  function renderRouteChart(metrics) {
    const routes = metrics.routeList.slice(0, 7); // Top 7 routes
    routeChartSvg.innerHTML = '';

    if (routes.length === 0) {
      routeChartSvg.innerHTML = `
        <text x="180" y="130" text-anchor="middle" dominant-baseline="middle" fill="var(--text-tertiary)" font-size="12">No route data available</text>
      `;
      return;
    }

    const svgWidth = 360;
    const svgHeight = 260;
    const paddingLeft = 90;
    const paddingRight = 45;
    const paddingTop = 25;
    const barHeight = 20;
    const barSpacing = 32;

    const maxVal = Math.max(...routes.map(r => chartMetric === 'volume' ? r.volume : r.commission), 1);
    const availableWidth = svgWidth - paddingLeft - paddingRight;

    let svgElements = '';

    routes.forEach((r, idx) => {
      const y = paddingTop + (idx * barSpacing);
      const val = chartMetric === 'volume' ? r.volume : r.commission;
      const barW = Math.max(4, (val / maxVal) * availableWidth);
      const valDisplay = chartMetric === 'volume' ? `${r.volume} pax` : formatMoney(r.commission);
      const barColor = chartMetric === 'volume' ? '#3b82f6' : '#10b981';

      svgElements += `
        <g class="chart-bar-group" data-route="${r.route}" data-volume="${r.volume}" data-comm="${r.commission}" data-sales="${r.totalSales}">
          <!-- Route Label -->
          <text x="${paddingLeft - 10}" y="${y + barHeight / 2 + 4}" text-anchor="end" fill="var(--text-secondary)" font-size="10.5" font-family="monospace" font-weight="600">
            ${r.route}
          </text>
          
          <!-- Bar Background -->
          <rect x="${paddingLeft}" y="${y}" width="${availableWidth}" height="${barHeight}" rx="4" fill="rgba(255,255,255,0.03)" />
          
          <!-- Animated Bar Fill -->
          <rect x="${paddingLeft}" y="${y}" width="${barW}" height="${barHeight}" rx="4" fill="${barColor}" style="transition: width 0.4s ease; cursor: pointer;">
            <title>${r.route}: ${r.volume} tickets, ${formatMoney(r.commission)} commission</title>
          </rect>
          
          <!-- Value Label -->
          <text x="${paddingLeft + barW + 6}" y="${y + barHeight / 2 + 4}" fill="var(--text-primary)" font-size="10" font-weight="700">
            ${valDisplay}
          </text>
        </g>
      `;
    });

    routeChartSvg.innerHTML = svgElements;

    // Attach hover tooltip behavior
    const barGroups = routeChartSvg.querySelectorAll('.chart-bar-group');
    barGroups.forEach(bg => {
      bg.addEventListener('mouseenter', (e) => {
        const rt = bg.getAttribute('data-route');
        const vol = bg.getAttribute('data-volume');
        const comm = bg.getAttribute('data-comm');
        const sales = bg.getAttribute('data-sales');

        chartTooltip.style.display = 'block';
        chartTooltip.innerHTML = `
          <strong style="color:var(--accent);">${rt}</strong><br>
          Tickets: <strong>${vol} pax</strong><br>
          Commission: <strong style="color:#34d399;">${formatMoney(comm)}</strong><br>
          Total Sales: <strong>${formatMoney(sales)}</strong>
        `;
      });

      bg.addEventListener('mousemove', (e) => {
        const rect = routeChartSvg.getBoundingClientRect();
        const offsetX = e.clientX - rect.left + 10;
        const offsetY = e.clientY - rect.top - 10;
        chartTooltip.style.left = `${offsetX}px`;
        chartTooltip.style.top = `${offsetY}px`;
      });

      bg.addEventListener('mouseleave', () => {
        chartTooltip.style.display = 'none';
      });
    });
  }

  // --- UI Update: Top Routes Leaderboard ---
  function renderTopRoutesList(metrics) {
    topRoutesList.innerHTML = '';
    const routes = metrics.routeList.slice(0, 6);

    if (routes.length === 0) {
      topRoutesList.innerHTML = '<div style="color:var(--text-tertiary); font-size:0.8rem; text-align:center; padding:1rem;">No routes tracked yet.</div>';
      return;
    }

    routes.forEach((r, idx) => {
      const avgT = r.volume > 0 ? (r.baseFare / r.volume) : 0;
      const item = document.createElement('div');
      item.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:0.5rem 0.75rem; background:var(--bg-tertiary); border:1px solid var(--border); border-radius:var(--radius-sm);';

      item.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span style="font-size:0.75rem; font-weight:800; color:var(--text-tertiary); width:16px;">#${idx + 1}</span>
          <div>
            <div class="route-pill">${r.route}</div>
            <div style="font-size:0.7rem; color:var(--text-tertiary); margin-top:2px;">
              ${r.volume} tickets • Avg Fare ${formatMoney(avgT)}
            </div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:0.85rem; font-weight:800; color:#34d399; font-family:monospace;">
            ${formatMoney(r.commission)}
          </div>
          <div style="font-size:0.68rem; color:var(--text-tertiary);">Gross Markup</div>
        </div>
      `;
      topRoutesList.appendChild(item);
    });
  }

  // --- UI Update: Filtered Tickets Table ---
  function renderTicketTable() {
    const searchTerm = (ticketSearchInput.value || '').trim().toLowerCase();
    const airlineFilter = selectedAirlineFilter;
    const classFilter = selectFilterClass.value;
    const statusFilter = selectFilterStatus.value;

    const filtered = tickets.filter(t => {
      if (airlineFilter !== 'ALL' && t.airline !== airlineFilter) return false;
      if (classFilter !== 'ALL' && t.flightClass !== classFilter) return false;
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;

      if (searchTerm) {
        const fullStr = `${t.passenger} ${t.pnr} ${t.origin} ${t.destination} ${t.airline}`.toLowerCase();
        if (!fullStr.includes(searchTerm)) return false;
      }
      return true;
    });

    filteredTicketsCount.textContent = `Showing ${filtered.length} of ${tickets.length} tickets`;

    ticketTableBody.innerHTML = '';
    if (filtered.length === 0) {
      ticketTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center; padding:2rem; color:var(--text-tertiary);">
            No flight tickets match your selected filters.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(t => {
      const tr = document.createElement('tr');
      const info = AIRLINE_INFO[t.airline] || { code: 'AIR', color: '#64748b' };
      const base = Number(t.baseFare) || 0;
      const comm = Number(t.commission) || 0;
      const total = base + comm;
      const marginPct = total > 0 ? (comm / total * 100).toFixed(0) : 0;

      let classBadge = 'class-economy';
      if (t.flightClass === 'First') classBadge = 'class-first';
      else if (t.flightClass === 'Business') classBadge = 'class-business';
      else if (t.flightClass === 'Premium Economy') classBadge = 'class-premium';

      let statusBadge = 'status-issued';
      if (t.status === 'Confirmed') statusBadge = 'status-confirmed';
      else if (t.status === 'Refunded') statusBadge = 'status-refunded';
      else if (t.status === 'Void') statusBadge = 'status-void';

      tr.innerHTML = `
        <td>
          <div style="font-weight:700; color:var(--text-primary);">${escapeHtml(t.passenger)}</div>
          <div style="font-size:0.72rem; color:var(--text-tertiary); font-family:monospace;">
            PNR: ${escapeHtml(t.pnr)} ${t.date ? '• ' + escapeHtml(t.date) : ''}
          </div>
        </td>
        <td>
          <span style="display:inline-flex; align-items:center; gap:0.35rem; font-size:0.75rem; font-weight:700;">
            <span style="background:${info.color}; color:#fff; padding:0.1rem 0.35rem; border-radius:3px; font-size:0.65rem;">${info.code}</span>
            <span>${escapeHtml(t.airline)}</span>
          </span>
        </td>
        <td>
          <span class="route-pill">${escapeHtml(t.origin)} → ${escapeHtml(t.destination)}</span>
        </td>
        <td>
          <span class="class-badge ${classBadge}">${escapeHtml(t.flightClass)}</span>
        </td>
        <td style="font-family:monospace; font-weight:700;">
          ${formatMoney(base)}
        </td>
        <td>
          <div style="font-family:monospace; font-weight:800; color:#34d399;">${formatMoney(comm)}</div>
          <div style="font-size:0.68rem; color:var(--text-tertiary);">${marginPct}% markup</div>
        </td>
        <td>
          <span class="status-badge ${statusBadge}">${escapeHtml(t.status)}</span>
        </td>
        <td style="text-align:right;">
          <div style="display:inline-flex; gap:0.25rem;">
            <button type="button" class="btn-edit-ticket" data-id="${t.id}" title="Edit Ticket" style="background:transparent; border:1px solid var(--border); color:var(--text-secondary); padding:0.25rem 0.5rem; border-radius:var(--radius-sm); cursor:pointer; font-size:0.75rem;">
              ✏️
            </button>
            <button type="button" class="btn-toggle-status" data-id="${t.id}" title="Toggle Void/Refund" style="background:transparent; border:1px solid var(--border); color:var(--text-secondary); padding:0.25rem 0.5rem; border-radius:var(--radius-sm); cursor:pointer; font-size:0.75rem;">
              🔄
            </button>
            <button type="button" class="btn-delete-ticket" data-id="${t.id}" title="Delete Ticket" style="background:transparent; border:1px solid var(--border); color:#ef4444; padding:0.25rem 0.5rem; border-radius:var(--radius-sm); cursor:pointer; font-size:0.75rem;">
              🗑️
            </button>
          </div>
        </td>
      `;
      ticketTableBody.appendChild(tr);
    });
  }

  // --- Full Update Orchestrator ---
  function updateAll() {
    const metrics = computeTicketingMetrics();
    renderKPIs(metrics);
    renderAirlineStrip(metrics);
    renderRouteChart(metrics);
    renderTopRoutesList(metrics);
    renderTicketTable();
    saveTickets();
  }

  // --- Filtering Event Listeners ---
  selectFilterAirline.addEventListener('change', (e) => {
    selectedAirlineFilter = e.target.value;
    updateAll();
  });

  if (btnClearAirlineFilter) {
    btnClearAirlineFilter.addEventListener('click', () => {
      selectedAirlineFilter = 'ALL';
      selectFilterAirline.value = 'ALL';
      updateAll();
    });
  }

  selectFilterClass.addEventListener('change', () => renderTicketTable());
  selectFilterStatus.addEventListener('change', () => renderTicketTable());
  ticketSearchInput.addEventListener('input', () => renderTicketTable());

  if (currencySelect) {
    currencySelect.addEventListener('change', () => updateAll());
  }

  btnChartVolume.addEventListener('click', () => {
    chartMetric = 'volume';
    btnChartVolume.classList.add('active');
    btnChartComm.classList.remove('active');
    const metrics = computeTicketingMetrics();
    renderRouteChart(metrics);
  });

  btnChartComm.addEventListener('click', () => {
    chartMetric = 'commission';
    btnChartComm.classList.add('active');
    btnChartVolume.classList.remove('active');
    const metrics = computeTicketingMetrics();
    renderRouteChart(metrics);
  });

  // --- Table Actions (Edit, Status Toggle, Delete) ---
  ticketTableBody.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.btn-edit-ticket');
    const toggleBtn = e.target.closest('.btn-toggle-status');
    const delBtn = e.target.closest('.btn-delete-ticket');

    if (editBtn) {
      const id = editBtn.getAttribute('data-id');
      const ticket = tickets.find(t => t.id === id);
      if (ticket) openEditModal(ticket);
    } else if (toggleBtn) {
      const id = toggleBtn.getAttribute('data-id');
      const ticket = tickets.find(t => t.id === id);
      if (ticket) {
        // Rotate status: Issued -> Confirmed -> Refunded -> Void -> Issued
        const cycle = ['Issued', 'Confirmed', 'Refunded', 'Void'];
        const nextIdx = (cycle.indexOf(ticket.status) + 1) % cycle.length;
        ticket.status = cycle[nextIdx];
        updateAll();
      }
    } else if (delBtn) {
      const id = delBtn.getAttribute('data-id');
      const ticket = tickets.find(t => t.id === id);
      if (ticket && confirm(`Delete ticket ${ticket.pnr} for ${ticket.passenger}?`)) {
        tickets = tickets.filter(t => t.id !== id);
        updateAll();
      }
    }
  });

  // --- Modal Operations ---
  function openAddModal() {
    modalTitle.textContent = 'Issue New Flight Ticket';
    ticketIdInput.value = '';
    ticketForm.reset();
    ticketOriginInput.value = 'DXB';
    ticketDestinationInput.value = 'LHR';
    ticketBaseFareInput.value = '750';
    ticketCommissionInput.value = '85';
    ticketDateInput.value = new Date().toISOString().slice(0, 10);
    ticketStatusSelect.value = 'Issued';
    ticketModal.classList.add('active');
  }

  function openEditModal(ticket) {
    modalTitle.textContent = 'Edit Flight Ticket';
    ticketIdInput.value = ticket.id;
    ticketPassengerInput.value = ticket.passenger;
    ticketPnrInput.value = ticket.pnr;
    ticketAirlineSelect.value = ticket.airline;
    ticketClassSelect.value = ticket.flightClass;
    ticketOriginInput.value = ticket.origin;
    ticketDestinationInput.value = ticket.destination;
    ticketBaseFareInput.value = ticket.baseFare;
    ticketCommissionInput.value = ticket.commission;
    ticketDateInput.value = ticket.date || '';
    ticketStatusSelect.value = ticket.status;
    ticketModal.classList.add('active');
  }

  function closeModal() {
    ticketModal.classList.remove('active');
  }

  if (btnAddTicket) btnAddTicket.addEventListener('click', openAddModal);
  if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
  if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

  ticketModal.addEventListener('click', (e) => {
    if (e.target === ticketModal) closeModal();
  });

  ticketForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = ticketIdInput.value;
    const passenger = ticketPassengerInput.value.trim();
    const pnr = ticketPnrInput.value.trim().toUpperCase();
    const airline = ticketAirlineSelect.value;
    const flightClass = ticketClassSelect.value;
    const origin = ticketOriginInput.value.trim().toUpperCase();
    const destination = ticketDestinationInput.value.trim().toUpperCase();
    const baseFare = Math.max(0, parseFloat(ticketBaseFareInput.value) || 0);
    const commission = Math.max(0, parseFloat(ticketCommissionInput.value) || 0);
    const date = ticketDateInput.value;
    const status = ticketStatusSelect.value;

    if (id) {
      const ticket = tickets.find(t => t.id === id);
      if (ticket) {
        ticket.passenger = passenger;
        ticket.pnr = pnr;
        ticket.airline = airline;
        ticket.flightClass = flightClass;
        ticket.origin = origin;
        ticket.destination = destination;
        ticket.baseFare = baseFare;
        ticket.commission = commission;
        ticket.date = date;
        ticket.status = status;
      }
    } else {
      const newTicket = {
        id: 't-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        passenger,
        pnr,
        airline,
        flightClass,
        origin,
        destination,
        baseFare,
        commission,
        date,
        status
      };
      tickets.unshift(newTicket);
    }

    closeModal();
    updateAll();
  });

  // --- CSV Export ---
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', () => {
      const headers = ['Ticket ID', 'PNR', 'Passenger', 'Airline', 'Origin', 'Destination', 'Class', 'Base Fare', 'Commission', 'Total Selling Price', 'Date', 'Status'];
      const rows = tickets.map(t => {
        const base = Number(t.baseFare) || 0;
        const comm = Number(t.commission) || 0;
        const total = base + comm;
        return [
          csvClean(t.id),
          csvClean(t.pnr),
          csvClean(t.passenger),
          csvClean(t.airline),
          csvClean(t.origin),
          csvClean(t.destination),
          csvClean(t.flightClass),
          base,
          comm,
          total,
          csvClean(t.date || ''),
          csvClean(t.status)
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `ticket_analytics_audit_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }

  // --- Demo Reset & Presets ---
  if (btnResetDemo) {
    btnResetDemo.addEventListener('click', () => {
      if (confirm('Reset ticket audit ledger to default demonstration data?')) {
        tickets = JSON.parse(JSON.stringify(INITIAL_TICKETS));
        selectedAirlineFilter = 'ALL';
        selectFilterAirline.value = 'ALL';
        updateAll();
      }
    });
  }

  if (presetGulfRoutes) {
    presetGulfRoutes.addEventListener('click', () => {
      tickets = [
        { id: 'g1', passenger: 'Sheikh Hamdan Al-Nuaimi', pnr: 'EK-7011', airline: 'Emirates', origin: 'DXB', destination: 'LHR', flightClass: 'First', baseFare: 5900, commission: 520, date: '2026-10-12', status: 'Issued' },
        { id: 'g2', passenger: 'Fahad Al-Hathloul', pnr: 'SV-3091', airline: 'Saudia', origin: 'RUH', destination: 'DXB', flightClass: 'Business', baseFare: 980, commission: 110, date: '2026-10-13', status: 'Issued' },
        { id: 'g3', passenger: 'Noura Al-Kuwari', pnr: 'QR-4412', airline: 'Qatar Airways', origin: 'DOH', destination: 'DXB', flightClass: 'Business', baseFare: 650, commission: 85, date: '2026-10-14', status: 'Issued' },
        { id: 'g4', passenger: 'Majid Al-Otaibi', pnr: 'SV-8820', airline: 'Saudia', origin: 'JED', destination: 'CAI', flightClass: 'Economy', baseFare: 380, commission: 45, date: '2026-10-15', status: 'Issued' },
        { id: 'g5', passenger: 'Rashid Al-Maktoum Rep', pnr: 'EK-9912', airline: 'Emirates', origin: 'DXB', destination: 'DOH', flightClass: 'Business', baseFare: 720, commission: 90, date: '2026-10-16', status: 'Issued' }
      ];
      selectedAirlineFilter = 'ALL';
      selectFilterAirline.value = 'ALL';
      updateAll();
    });
  }

  if (presetTransatlantic) {
    presetTransatlantic.addEventListener('click', () => {
      tickets = [
        { id: 'ta1', passenger: 'Sir Arthur Wellesley', pnr: 'BA-1011', airline: 'British Airways', origin: 'LHR', destination: 'JFK', flightClass: 'First', baseFare: 6400, commission: 590, date: '2026-10-12', status: 'Issued' },
        { id: 'ta2', passenger: 'Eleanor Roosevelt Rep', pnr: 'QR-2291', airline: 'Qatar Airways', origin: 'DOH', destination: 'ORD', flightClass: 'Business', baseFare: 4200, commission: 380, date: '2026-10-13', status: 'Issued' },
        { id: 'ta3', passenger: 'George Sterling', pnr: 'BA-5012', airline: 'British Airways', origin: 'LHR', destination: 'BOS', flightClass: 'Premium Economy', baseFare: 1850, commission: 160, date: '2026-10-14', status: 'Issued' },
        { id: 'ta4', passenger: 'Celine Dion Group', pnr: 'EK-7714', airline: 'Emirates', origin: 'DXB', destination: 'JFK', flightClass: 'Business', baseFare: 4600, commission: 410, date: '2026-10-15', status: 'Issued' },
        { id: 'ta5', passenger: 'Marcus Brody', pnr: 'TK-8819', airline: 'Turkish Airlines', origin: 'IST', destination: 'JFK', flightClass: 'Economy', baseFare: 980, commission: 95, date: '2026-10-16', status: 'Issued' }
      ];
      selectedAirlineFilter = 'ALL';
      selectFilterAirline.value = 'ALL';
      updateAll();
    });
  }

  if (presetAsiaPilgrim) {
    presetAsiaPilgrim.addEventListener('click', () => {
      tickets = [
        { id: 'ap1', passenger: 'Haji Nurul Islam', pnr: 'BG-1102', airline: 'Biman Bangladesh', origin: 'DAC', destination: 'JED', flightClass: 'Economy', baseFare: 820, commission: 105, date: '2026-10-12', status: 'Issued' },
        { id: 'ap2', passenger: 'Tan Sri Dato Azman', pnr: 'SV-4401', airline: 'Saudia', origin: 'KUL', destination: 'MED', flightClass: 'Business', baseFare: 2600, commission: 240, date: '2026-10-13', status: 'Issued' },
        { id: 'ap3', passenger: 'Ustadh Kamaluddin', pnr: 'SV-7721', airline: 'Saudia', origin: 'DAC', destination: 'JED', flightClass: 'Economy', baseFare: 840, commission: 110, date: '2026-10-14', status: 'Issued' },
        { id: 'ap4', passenger: 'Muhammad Rizwan', pnr: 'QR-9903', airline: 'Qatar Airways', origin: 'LHE', destination: 'JED', flightClass: 'Economy', baseFare: 680, commission: 80, date: '2026-10-15', status: 'Issued' },
        { id: 'ap5', passenger: 'Ahmad bin Salleh', pnr: 'SQ-3321', airline: 'Singapore Airlines', origin: 'SIN', destination: 'JED', flightClass: 'Economy', baseFare: 1050, commission: 120, date: '2026-10-16', status: 'Issued' }
      ];
      selectedAirlineFilter = 'ALL';
      selectFilterAirline.value = 'ALL';
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

  // --- Initial Render ---
  updateAll();
});