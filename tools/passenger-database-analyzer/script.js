// Passenger Database Analyzer Logic

const STORAGE_KEY = 'aio_flight_manifest';

const SAMPLE_PASSENGERS = [
  {
    id: 'pax-1',
    name: 'Alexander Wright',
    passport: 'N8492014',
    pnr: 'DXB82A',
    route: 'DXB → JFK (EK201)',
    seat: '02A',
    cabinClass: 'First',
    meal: 'Halal',
    baggage: 42.0,
    fare: 4850,
    status: 'Boarded'
  },
  {
    id: 'pax-2',
    name: 'Sophia Laurent',
    passport: 'FR772910',
    pnr: 'DXB82A',
    route: 'DXB → JFK (EK201)',
    seat: '02B',
    cabinClass: 'First',
    meal: 'Vegan',
    baggage: 38.5,
    fare: 4850,
    status: 'Boarded'
  },
  {
    id: 'pax-3',
    name: 'Marcus Chen',
    passport: 'E5582918',
    pnr: 'CH993M',
    route: 'DXB → JFK (EK201)',
    seat: '11K',
    cabinClass: 'Business',
    meal: 'Standard',
    baggage: 32.0,
    fare: 2750,
    status: 'Boarded'
  },
  {
    id: 'pax-4',
    name: 'Elena Rostova',
    passport: 'RU449102',
    pnr: 'RU182P',
    route: 'DXB → JFK (EK201)',
    seat: '14E',
    cabinClass: 'Business',
    meal: 'Vegetarian',
    baggage: 28.0,
    fare: 2600,
    status: 'Checked-In'
  },
  {
    id: 'pax-5',
    name: 'David O\'Connor',
    passport: 'IE992011',
    pnr: 'IE442Q',
    route: 'DXB → JFK (EK201)',
    seat: '21A',
    cabinClass: 'Economy',
    meal: 'Gluten-Free',
    baggage: 23.0,
    fare: 890,
    status: 'Checked-In'
  },
  {
    id: 'pax-6',
    name: 'Amina Al-Mansoor',
    passport: 'AE302918',
    pnr: 'AM881L',
    route: 'DXB → JFK (EK201)',
    seat: '22C',
    cabinClass: 'Economy',
    meal: 'Halal',
    baggage: 25.5,
    fare: 920,
    status: 'Confirmed'
  },
  {
    id: 'pax-7',
    name: 'Hiroshi Tanaka',
    passport: 'TK891230',
    pnr: 'TK302Z',
    route: 'HND → LHR (JL043)',
    seat: '08F',
    cabinClass: 'Business',
    meal: 'Standard',
    baggage: 30.0,
    fare: 3100,
    status: 'Boarded'
  },
  {
    id: 'pax-8',
    name: 'Isabella Rossi',
    passport: 'IT661902',
    pnr: 'IT551K',
    route: 'HND → LHR (JL043)',
    seat: '28D',
    cabinClass: 'Economy',
    meal: 'Vegetarian',
    baggage: 19.5,
    fare: 780,
    status: 'Confirmed'
  },
  {
    id: 'pax-9',
    name: 'Carlos Mendez',
    passport: 'MX201944',
    pnr: 'MX773B',
    route: 'MAD → MIA (IB6123)',
    seat: '16C',
    cabinClass: 'Economy',
    meal: 'Standard',
    baggage: 22.0,
    fare: 690,
    status: 'Confirmed'
  },
  {
    id: 'pax-10',
    name: 'Zara Larsson',
    passport: 'SE194820',
    pnr: 'SE991X',
    route: 'MAD → MIA (IB6123)',
    seat: '16D',
    cabinClass: 'Economy',
    meal: 'Diabetic',
    baggage: 21.0,
    fare: 690,
    status: 'Cancelled'
  }
];

class PassengerManifestApp {
  constructor() {
    this.passengers = [];
    this.currentStatusFilter = 'ALL';
    this.currentRouteFilter = 'ALL';
    this.searchQuery = '';

    this.initElements();
    this.loadState();
    this.attachEventListeners();
    this.updateRouteDropdown();
    this.render();
  }

  initElements() {
    // KPI elements
    this.kpiTotalPax = document.getElementById('kpi-total-pax');
    this.kpiConfirmedCount = document.getElementById('kpi-confirmed-count');
    this.kpiCheckedinCount = document.getElementById('kpi-checkedin-count');
    this.kpiTotalBaggage = document.getElementById('kpi-total-baggage');
    this.kpiAvgBaggage = document.getElementById('kpi-avg-baggage');
    this.kpiBoardedPct = document.getElementById('kpi-boarded-pct');
    this.kpiBoardedBar = document.getElementById('kpi-boarded-bar');
    this.kpiBoardedSub = document.getElementById('kpi-boarded-sub');
    this.kpiTotalRevenue = document.getElementById('kpi-total-revenue');
    this.kpiRevenueSub = document.getElementById('kpi-revenue-sub');

    // Controls
    this.searchInput = document.getElementById('manifest-search-input');
    this.routeSelect = document.getElementById('route-filter-select');
    this.statusPillsContainer = document.getElementById('status-filter-pills');
    this.showingRecordsText = document.getElementById('showing-records-text');

    // Counts in pills
    this.countAll = document.getElementById('count-all');
    this.countConfirmed = document.getElementById('count-confirmed');
    this.countCheckedin = document.getElementById('count-checkedin');
    this.countBoarded = document.getElementById('count-boarded');
    this.countCancelled = document.getElementById('count-cancelled');

    // Table elements
    this.manifestTbody = document.getElementById('manifest-tbody');
    this.manifestEmptyState = document.getElementById('manifest-empty-state');

    // Summary sections
    this.mealBreakdown = document.getElementById('meal-breakdown-container');
    this.routeBreakdown = document.getElementById('route-breakdown-container');

    // Buttons
    this.btnAddPax = document.getElementById('btn-add-pax');
    this.btnLoadSample = document.getElementById('btn-load-sample');
    this.btnExportCsv = document.getElementById('btn-export-csv');
    this.btnClearManifest = document.getElementById('btn-clear-manifest');

    // Modal
    this.modal = document.getElementById('passenger-modal');
    this.modalTitle = document.getElementById('modal-title');
    this.modalCloseBtn = document.getElementById('modal-close-btn');
    this.modalCancelBtn = document.getElementById('modal-cancel-btn');
    this.passengerForm = document.getElementById('passenger-form');

    // Form inputs
    this.inputPaxId = document.getElementById('pax-id');
    this.inputName = document.getElementById('pax-name');
    this.inputPassport = document.getElementById('pax-passport');
    this.inputPnr = document.getElementById('pax-pnr');
    this.inputRoute = document.getElementById('pax-route');
    this.inputSeat = document.getElementById('pax-seat');
    this.inputClass = document.getElementById('pax-class');
    this.inputMeal = document.getElementById('pax-meal');
    this.inputBaggage = document.getElementById('pax-baggage');
    this.inputFare = document.getElementById('pax-fare');
    this.inputStatus = document.getElementById('pax-status');
  }

  loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.passengers = JSON.parse(stored);
      } else {
        this.passengers = [...SAMPLE_PASSENGERS];
        this.saveState();
      }
    } catch {
      this.passengers = [...SAMPLE_PASSENGERS];
    }
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.passengers));
    } catch (e) {
      console.warn('Failed to save manifest to local storage', e);
    }
  }

  attachEventListeners() {
    // Search input
    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this.render();
    });

    // Route filter
    this.routeSelect.addEventListener('change', (e) => {
      this.currentRouteFilter = e.target.value;
      this.render();
    });

    // Status filter pills
    this.statusPillsContainer.addEventListener('click', (e) => {
      const pill = e.target.closest('.filter-pill');
      if (!pill) return;
      this.statusPillsContainer.querySelectorAll('.filter-pill').forEach(btn => btn.classList.remove('active'));
      pill.classList.add('active');
      this.currentStatusFilter = pill.getAttribute('data-status');
      this.render();
    });

    // Actions
    this.btnAddPax.addEventListener('click', () => this.openAddModal());
    this.btnLoadSample.addEventListener('click', () => {
      this.passengers = JSON.parse(JSON.stringify(SAMPLE_PASSENGERS));
      this.saveState();
      this.updateRouteDropdown();
      this.render();
    });

    this.btnClearManifest.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all passengers from this manifest?')) {
        this.passengers = [];
        this.saveState();
        this.updateRouteDropdown();
        this.render();
      }
    });

    this.btnExportCsv.addEventListener('click', () => this.exportToCsv());

    // Modal close
    this.modalCloseBtn.addEventListener('click', () => this.closeModal());
    this.modalCancelBtn.addEventListener('click', () => this.closeModal());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });

    // Form submit
    this.passengerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.savePassengerFromForm();
    });
  }

  openAddModal() {
    this.modalTitle.textContent = 'Add Passenger Record';
    this.passengerForm.reset();
    this.inputPaxId.value = '';
    this.inputClass.value = 'Economy';
    this.inputMeal.value = 'Standard';
    this.inputBaggage.value = '23';
    this.inputFare.value = '750';
    this.inputStatus.value = 'Confirmed';
    this.modal.classList.add('active');
  }

  openEditModal(pax) {
    this.modalTitle.textContent = 'Edit Passenger Record';
    this.inputPaxId.value = pax.id;
    this.inputName.value = pax.name;
    this.inputPassport.value = pax.passport;
    this.inputPnr.value = pax.pnr;
    this.inputRoute.value = pax.route;
    this.inputSeat.value = pax.seat;
    this.inputClass.value = pax.cabinClass;
    this.inputMeal.value = pax.meal;
    this.inputBaggage.value = pax.baggage;
    this.inputFare.value = pax.fare;
    this.inputStatus.value = pax.status;
    this.modal.classList.add('active');
  }

  closeModal() {
    this.modal.classList.remove('active');
  }

  savePassengerFromForm() {
    const id = this.inputPaxId.value || 'pax-' + Date.now();
    const newRecord = {
      id,
      name: this.inputName.value.trim(),
      passport: this.inputPassport.value.trim().toUpperCase(),
      pnr: this.inputPnr.value.trim().toUpperCase(),
      route: this.inputRoute.value.trim(),
      seat: this.inputSeat.value.trim().toUpperCase(),
      cabinClass: this.inputClass.value,
      meal: this.inputMeal.value,
      baggage: parseFloat(this.inputBaggage.value) || 0,
      fare: parseFloat(this.inputFare.value) || 0,
      status: this.inputStatus.value
    };

    const existingIdx = this.passengers.findIndex(p => p.id === id);
    if (existingIdx >= 0) {
      this.passengers[existingIdx] = newRecord;
    } else {
      this.passengers.unshift(newRecord);
    }

    this.saveState();
    this.closeModal();
    this.updateRouteDropdown();
    this.render();
  }

  deletePassenger(id) {
    const pax = this.passengers.find(p => p.id === id);
    const name = pax ? pax.name : 'this passenger';
    if (confirm(`Remove ${name} from flight manifest?`)) {
      this.passengers = this.passengers.filter(p => p.id !== id);
      this.saveState();
      this.updateRouteDropdown();
      this.render();
    }
  }

  advanceStatus(id) {
    const pax = this.passengers.find(p => p.id === id);
    if (!pax) return;
    const cycle = {
      'Confirmed': 'Checked-In',
      'Checked-In': 'Boarded',
      'Boarded': 'Confirmed',
      'Cancelled': 'Confirmed'
    };
    pax.status = cycle[pax.status] || 'Confirmed';
    this.saveState();
    this.render();
  }

  updateRouteDropdown() {
    const currentVal = this.routeSelect.value;
    const routes = Array.from(new Set(this.passengers.map(p => p.route).filter(Boolean))).sort();
    
    this.routeSelect.innerHTML = '<option value="ALL">All Flight Routes</option>';
    routes.forEach(route => {
      const opt = document.createElement('option');
      opt.value = route;
      opt.textContent = route;
      if (route === currentVal) opt.selected = true;
      this.routeSelect.appendChild(opt);
    });
  }

  filterPassengers() {
    return this.passengers.filter(p => {
      // Status filter
      if (this.currentStatusFilter !== 'ALL' && p.status !== this.currentStatusFilter) {
        return false;
      }
      // Route filter
      if (this.currentRouteFilter !== 'ALL' && p.route !== this.currentRouteFilter) {
        return false;
      }
      // Search query
      if (this.searchQuery) {
        const query = this.searchQuery;
        const match = 
          (p.name && p.name.toLowerCase().includes(query)) ||
          (p.passport && p.passport.toLowerCase().includes(query)) ||
          (p.pnr && p.pnr.toLowerCase().includes(query)) ||
          (p.seat && p.seat.toLowerCase().includes(query)) ||
          (p.route && p.route.toLowerCase().includes(query)) ||
          (p.meal && p.meal.toLowerCase().includes(query));
        if (!match) return false;
      }
      return true;
    });
  }

  updateMetrics() {
    const total = this.passengers.length;
    let confirmed = 0;
    let checkedin = 0;
    let boarded = 0;
    let cancelled = 0;
    let totalBaggage = 0;
    let totalRevenue = 0;

    const mealsMap = {};
    const routesMap = {};

    this.passengers.forEach(p => {
      if (p.status === 'Confirmed') confirmed++;
      else if (p.status === 'Checked-In') checkedin++;
      else if (p.status === 'Boarded') boarded++;
      else if (p.status === 'Cancelled') cancelled++;

      if (p.status !== 'Cancelled') {
        totalBaggage += Number(p.baggage) || 0;
        totalRevenue += Number(p.fare) || 0;
      }

      // Meal count
      const meal = p.meal || 'Standard';
      mealsMap[meal] = (mealsMap[meal] || 0) + 1;

      // Route count
      const route = p.route || 'Unassigned';
      routesMap[route] = (routesMap[route] || 0) + 1;
    });

    const activeCount = total - cancelled;
    const avgBaggage = activeCount > 0 ? (totalBaggage / activeCount).toFixed(1) : '0.0';
    const boardedPct = activeCount > 0 ? Math.round((boarded / activeCount) * 100) : 0;
    const avgFare = activeCount > 0 ? Math.round(totalRevenue / activeCount) : 0;

    // Update KPIs
    this.kpiTotalPax.textContent = total.toLocaleString();
    this.kpiConfirmedCount.textContent = `${confirmed} Confirmed`;
    this.kpiCheckedinCount.textContent = `${checkedin} Checked In`;

    this.kpiTotalBaggage.textContent = `${totalBaggage.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`;
    this.kpiAvgBaggage.textContent = `Avg: ${avgBaggage} kg / active pax`;

    this.kpiBoardedPct.textContent = `${boardedPct}%`;
    this.kpiBoardedBar.style.width = `${boardedPct}%`;
    this.kpiBoardedSub.textContent = `${boarded} of ${activeCount} active boarded`;

    this.kpiTotalRevenue.textContent = `$${totalRevenue.toLocaleString()}`;
    this.kpiRevenueSub.textContent = `Avg ticket: $${avgFare.toLocaleString()}`;

    // Update Counts on pills
    this.countAll.textContent = total;
    this.countConfirmed.textContent = confirmed;
    this.countCheckedin.textContent = checkedin;
    this.countBoarded.textContent = boarded;
    this.countCancelled.textContent = cancelled;

    // Render Meal Breakdown
    this.mealBreakdown.innerHTML = '';
    const mealKeys = Object.keys(mealsMap).sort();
    if (mealKeys.length === 0) {
      this.mealBreakdown.innerHTML = '<span style="color: var(--text-tertiary); font-size: 0.85rem;">No meal preferences recorded</span>';
    } else {
      mealKeys.forEach(m => {
        const badge = document.createElement('span');
        badge.className = 'badge-meal';
        badge.innerHTML = `<strong>${m}:</strong> ${mealsMap[m]}`;
        this.mealBreakdown.appendChild(badge);
      });
    }

    // Render Route Breakdown
    this.routeBreakdown.innerHTML = '';
    const routeKeys = Object.keys(routesMap).sort();
    if (routeKeys.length === 0) {
      this.routeBreakdown.innerHTML = '<span style="color: var(--text-tertiary); font-size: 0.85rem;">No routes recorded</span>';
    } else {
      routeKeys.forEach(r => {
        const pct = Math.round((routesMap[r] / total) * 100);
        const item = document.createElement('div');
        item.style.cssText = 'display: flex; align-items: center; justify-content: space-between; font-size: 0.825rem; padding: 0.35rem 0.5rem; background: var(--bg-tertiary); border-radius: var(--radius-sm); border: 1px solid var(--border);';
        item.innerHTML = `
          <span style="font-weight: 600; color: var(--text-primary);">${r}</span>
          <span style="color: var(--text-secondary);">${routesMap[r]} pax (${pct}%)</span>
        `;
        this.routeBreakdown.appendChild(item);
      });
    }
  }

  render() {
    this.updateMetrics();
    const filtered = this.filterPassengers();

    this.showingRecordsText.textContent = `Showing ${filtered.length} of ${this.passengers.length} passengers`;

    if (filtered.length === 0) {
      this.manifestTbody.innerHTML = '';
      this.manifestEmptyState.style.display = 'block';
      return;
    }

    this.manifestEmptyState.style.display = 'none';

    const statusBadgeClass = {
      'Confirmed': 'badge-confirmed',
      'Checked-In': 'badge-checkedin',
      'Boarded': 'badge-boarded',
      'Cancelled': 'badge-cancelled'
    };

    const classBadgeClass = {
      'First': 'class-first',
      'Business': 'class-business',
      'Economy': 'class-economy'
    };

    this.manifestTbody.innerHTML = filtered.map(p => {
      const sClass = statusBadgeClass[p.status] || 'badge-confirmed';
      const cClass = classBadgeClass[p.cabinClass] || 'class-economy';

      return `
        <tr data-id="${p.id}">
          <td>
            <div class="passenger-meta">
              <span class="passenger-name">${escapeHtml(p.name)}</span>
              <span class="passenger-passport">🛂 ${escapeHtml(p.passport)}</span>
            </div>
          </td>
          <td>
            <div style="display: flex; flex-direction: column; gap: 0.15rem;">
              <span style="font-family: monospace; font-weight: 700; color: var(--accent);">${escapeHtml(p.pnr)}</span>
              <span style="font-size: 0.775rem; color: var(--text-secondary);">${escapeHtml(p.route)}</span>
            </div>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <span style="font-weight: 700; font-size: 0.95rem;">${escapeHtml(p.seat)}</span>
              <span class="badge-class ${cClass}">${escapeHtml(p.cabinClass || 'Economy')}</span>
            </div>
          </td>
          <td>
            <span class="badge-meal">${escapeHtml(p.meal || 'Standard')}</span>
          </td>
          <td>
            <span style="font-weight: 600;">${Number(p.baggage || 0).toFixed(1)} kg</span>
          </td>
          <td>
            <span style="font-weight: 600; color: var(--success);">$${Number(p.fare || 0).toLocaleString()}</span>
          </td>
          <td>
            <button class="badge-status ${sClass} btn-advance-status" data-id="${p.id}" title="Click to advance status" style="cursor: pointer; border: 1px solid currentColor;">
              ${escapeHtml(p.status)}
            </button>
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <button class="action-icon-btn btn-edit-pax" data-id="${p.id}" title="Edit Passenger">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="action-icon-btn delete-btn btn-delete-pax" data-id="${p.id}" title="Delete Passenger">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach row events
    this.manifestTbody.querySelectorAll('.btn-advance-status').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.advanceStatus(btn.getAttribute('data-id'));
      });
    });

    this.manifestTbody.querySelectorAll('.btn-edit-pax').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const pax = this.passengers.find(p => p.id === id);
        if (pax) this.openEditModal(pax);
      });
    });

    this.manifestTbody.querySelectorAll('.btn-delete-pax').forEach(btn => {
      btn.addEventListener('click', () => {
        this.deletePassenger(btn.getAttribute('data-id'));
      });
    });
  }

  exportToCsv() {
    if (this.passengers.length === 0) {
      alert('The flight manifest is currently empty.');
      return;
    }

    const headers = ['Full Name', 'Passport #', 'PNR', 'Flight Route', 'Seat', 'Class', 'Meal Preference', 'Baggage (kg)', 'Fare ($)', 'Status'];
    const rows = this.passengers.map(p => [
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.passport || '').replace(/"/g, '""')}"`,
      `"${(p.pnr || '').replace(/"/g, '""')}"`,
      `"${(p.route || '').replace(/"/g, '""')}"`,
      `"${(p.seat || '').replace(/"/g, '""')}"`,
      `"${(p.cabinClass || '').replace(/"/g, '""')}"`,
      `"${(p.meal || '').replace(/"/g, '""')}"`,
      p.baggage || 0,
      p.fare || 0,
      `"${(p.status || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `passenger_manifest_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
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

document.addEventListener('DOMContentLoaded', () => {
  new PassengerManifestApp();
});