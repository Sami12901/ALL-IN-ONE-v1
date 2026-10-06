/**
 * Booking Management
 * Comprehensive reservation and travel booking lifecycle manager.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const currencySelect = document.getElementById('currency-select');
  const kpiTotalBookings = document.getElementById('kpi-total-bookings');
  const kpiBookingsSub = document.getElementById('kpi-bookings-sub');
  const kpiTotalValue = document.getElementById('kpi-total-value');
  const kpiCollectedAmount = document.getElementById('kpi-collected-amount');
  const kpiCollectionRatio = document.getElementById('kpi-collection-ratio');
  const kpiOutstandingBalance = document.getElementById('kpi-outstanding-balance');
  const kpiUnpaidCount = document.getElementById('kpi-unpaid-count');
  const kpiConfirmedCount = document.getElementById('kpi-confirmed-count');
  const kpiConfirmedSub = document.getElementById('kpi-confirmed-sub');
  const kpiPendingCount = document.getElementById('kpi-pending-count');

  // Filter & Search Controls
  const bookingSearchInput = document.getElementById('booking-search-input');
  const selectFilterService = document.getElementById('select-filter-service');
  const selectFilterPayment = document.getElementById('select-filter-payment');
  const selectFilterStatus = document.getElementById('select-filter-status');
  const selectSortBookings = document.getElementById('select-sort-bookings');
  const bookingTableBody = document.getElementById('booking-table-body');
  const filteredBookingsCount = document.getElementById('filtered-bookings-count');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnResetDemo = document.getElementById('btn-reset-demo');

  // Presets
  const presetAllReservations = document.getElementById('preset-all-reservations');
  const presetPendingUnpaid = document.getElementById('preset-pending-unpaid');
  const presetUmrahTours = document.getElementById('preset-umrah-tours');

  // Modal Elements
  const bookingModal = document.getElementById('booking-modal');
  const btnAddBooking = document.getElementById('btn-add-booking');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCancelModal = document.getElementById('btn-cancel-modal');
  const bookingForm = document.getElementById('booking-form');
  const modalTitle = document.getElementById('modal-title');
  const entryIdInput = document.getElementById('entry-id');
  const bookingIdInput = document.getElementById('booking-id-input');
  const clientNameInput = document.getElementById('client-name-input');
  const serviceTypeSelect = document.getElementById('service-type-select');
  const destinationInput = document.getElementById('destination-input');
  const travelDateInput = document.getElementById('travel-date-input');
  const returnDateInput = document.getElementById('return-date-input');
  const totalAmountInput = document.getElementById('total-amount-input');
  const paidAmountInput = document.getElementById('paid-amount-input');
  const paymentStatusSelect = document.getElementById('payment-status-select');
  const bookingStatusSelect = document.getElementById('booking-status-select');
  const notesInput = document.getElementById('notes-input');

  // Voucher Modal Elements
  const voucherModal = document.getElementById('voucher-modal');
  const btnCloseVoucher = document.getElementById('btn-close-voucher');
  const voucherContent = document.getElementById('voucher-content');
  const btnPrintVoucher = document.getElementById('btn-print-voucher');

  // --- Constants & Color Mappings ---
  const SERVICE_ICONS = {
    'Flight': '✈️',
    'Hotel': '🏨',
    'Visa': '📑',
    'Tour': '🌍'
  };

  const SERVICE_CLASS = {
    'Flight': 'service-flight',
    'Hotel': 'service-hotel',
    'Visa': 'service-visa',
    'Tour': 'service-tour'
  };

  // --- Initial Mock Reservations ---
  const INITIAL_BOOKINGS = [
    {
      id: 'bk-101',
      bookingId: 'BK-8401',
      clientName: 'Lord Alistair Sterling',
      serviceType: 'Flight',
      destination: 'London (LHR) → Dubai (DXB)',
      travelDate: '2026-10-18',
      returnDate: '2026-10-28',
      totalAmount: 5400,
      paidAmount: 5400,
      paymentStatus: 'Paid',
      bookingStatus: 'Confirmed',
      notes: 'First Class Emirates Suite, chauffeur pickup booked.'
    },
    {
      id: 'bk-102',
      bookingId: 'BK-8402',
      clientName: 'Dr. Tariqul Islam & Family',
      serviceType: 'Tour',
      destination: 'Makkah & Madinah Umrah 14-Days',
      travelDate: '2026-10-22',
      returnDate: '2026-11-05',
      totalAmount: 12800,
      paidAmount: 8000,
      paymentStatus: 'Partial',
      bookingStatus: 'Confirmed',
      notes: 'Clock Tower Swissôtel Quad room + Haramain train seats.'
    },
    {
      id: 'bk-103',
      bookingId: 'BK-8403',
      clientName: 'Apex Logistics Corporate Group',
      serviceType: 'Hotel',
      destination: 'Riyadh Marriott Diplomatic Quarter',
      travelDate: '2026-10-25',
      returnDate: '2026-10-29',
      totalAmount: 4200,
      paidAmount: 4200,
      paymentStatus: 'Paid',
      bookingStatus: 'Confirmed',
      notes: '6 Deluxe rooms with executive lounge access.'
    },
    {
      id: 'bk-104',
      bookingId: 'BK-8404',
      clientName: 'Elena Rostova',
      serviceType: 'Visa',
      destination: 'Saudi Multiple-Entry Tourist Visa',
      travelDate: '2026-11-02',
      returnDate: '2026-11-15',
      totalAmount: 380,
      paidAmount: 380,
      paymentStatus: 'Paid',
      bookingStatus: 'Confirmed',
      notes: 'Urgent medical insurance expedited.'
    },
    {
      id: 'bk-105',
      bookingId: 'BK-8405',
      clientName: 'The Harrison Family (4 Pax)',
      serviceType: 'Tour',
      destination: 'Maldives Overwater Resort All-Inclusive',
      travelDate: '2026-11-10',
      returnDate: '2026-11-17',
      totalAmount: 9600,
      paidAmount: 3000,
      paymentStatus: 'Partial',
      bookingStatus: 'Pending',
      notes: 'Awaiting balance payment before seaplane transfer confirmation.'
    },
    {
      id: 'bk-106',
      bookingId: 'BK-8406',
      clientName: 'Fahad Al-Mansoori',
      serviceType: 'Flight',
      destination: 'Jeddah (JED) → Paris (CDG)',
      travelDate: '2026-11-12',
      returnDate: '2026-11-20',
      totalAmount: 3200,
      paidAmount: 0,
      paymentStatus: 'Unpaid',
      bookingStatus: 'Pending',
      notes: 'Seats held under GDS PNR AF-9921 until tomorrow 18:00.'
    },
    {
      id: 'bk-107',
      bookingId: 'BK-8407',
      clientName: 'Marcus & Chloe Vance',
      serviceType: 'Hotel',
      destination: 'Madinah The Oberoi Haram View Suite',
      travelDate: '2026-11-15',
      returnDate: '2026-11-22',
      totalAmount: 6400,
      paidAmount: 6400,
      paymentStatus: 'Paid',
      bookingStatus: 'Confirmed',
      notes: 'High floor, late check-out guaranteed.'
    },
    {
      id: 'bk-108',
      bookingId: 'BK-8408',
      clientName: 'Nasser Al-Ghamdi',
      serviceType: 'Tour',
      destination: 'Switzerland Alps & Glacier Express 7D',
      travelDate: '2026-11-20',
      returnDate: '2026-11-27',
      totalAmount: 7800,
      paidAmount: 0,
      paymentStatus: 'Unpaid',
      bookingStatus: 'Cancelled',
      notes: 'Client cancelled due to schedule conflict. Fully voided.'
    },
    {
      id: 'bk-109',
      bookingId: 'BK-8409',
      clientName: 'Canadian Pilgrims Union (10 Pax)',
      serviceType: 'Visa',
      destination: 'Saudi Nusuk Umrah Visa & Biometrics',
      travelDate: '2026-12-01',
      returnDate: '2026-12-15',
      totalAmount: 2200,
      paidAmount: 2200,
      paymentStatus: 'Paid',
      bookingStatus: 'Confirmed',
      notes: 'All 10 passports and eVisa waivers approved.'
    }
  ];

  // --- State ---
  let bookings = loadBookings();

  // --- Persistence ---
  function loadBookings() {
    try {
      const stored = localStorage.getItem('travel_booking_management_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved reservations, using default demo data.', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_BOOKINGS));
  }

  function saveBookings() {
    try {
      localStorage.setItem('travel_booking_management_v1', JSON.stringify(bookings));
    } catch (e) {
      console.error('Could not save bookings to localStorage', e);
    }
  }

  // --- Currency Helpers ---
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

  // --- Auto Calculate Payment Status ---
  function computePaymentStatus(total, paid) {
    const t = Number(total) || 0;
    const p = Number(paid) || 0;
    if (p >= t && t > 0) return 'Paid';
    if (p > 0 && p < t) return 'Partial';
    return 'Unpaid';
  }

  // --- Core Calculations ---
  function computeReservationMetrics() {
    // Only non-cancelled bookings count towards active financial totals
    const activeBookings = bookings.filter(b => b.bookingStatus !== 'Cancelled');
    const totalBookingsCount = bookings.length;

    let totalValue = 0;
    let totalCollected = 0;
    let unpaidBalancesCount = 0;

    activeBookings.forEach(b => {
      const tot = Number(b.totalAmount) || 0;
      const pd = Number(b.paidAmount) || 0;
      totalValue += tot;
      totalCollected += Math.min(tot, pd);
      if (pd < tot) unpaidBalancesCount += 1;
    });

    const outstandingBalance = Math.max(0, totalValue - totalCollected);
    const collectionRatio = totalValue > 0 ? (totalCollected / totalValue * 100) : 0;

    const confirmedCount = bookings.filter(b => b.bookingStatus === 'Confirmed').length;
    const pendingCount = bookings.filter(b => b.bookingStatus === 'Pending').length;
    const confirmationRate = totalBookingsCount > 0 ? (confirmedCount / totalBookingsCount * 100) : 0;

    return {
      totalBookingsCount,
      totalValue,
      totalCollected,
      outstandingBalance,
      collectionRatio,
      unpaidBalancesCount,
      confirmedCount,
      pendingCount,
      confirmationRate
    };
  }

  // --- UI Update: KPIs ---
  function renderKPIs(metrics) {
    kpiTotalBookings.textContent = metrics.totalBookingsCount.toLocaleString();
    kpiBookingsSub.textContent = `${metrics.confirmedCount} confirmed • ${metrics.pendingCount} pending`;

    kpiTotalValue.textContent = formatMoney(metrics.totalValue);

    kpiCollectedAmount.textContent = formatMoney(metrics.totalCollected);
    kpiCollectionRatio.textContent = `${metrics.collectionRatio.toFixed(1)}% collected`;

    kpiOutstandingBalance.textContent = formatMoney(metrics.outstandingBalance);
    kpiUnpaidCount.textContent = `${metrics.unpaidBalancesCount} pending collections`;

    kpiConfirmedCount.textContent = metrics.confirmedCount.toLocaleString();
    kpiConfirmedSub.textContent = `${metrics.confirmationRate.toFixed(1)}% confirmation rate`;

    kpiPendingCount.textContent = metrics.pendingCount.toLocaleString();
  }

  // --- UI Update: Bookings Table ---
  function renderBookingsTable() {
    const searchTerm = (bookingSearchInput.value || '').trim().toLowerCase();
    const serviceFilter = selectFilterService.value;
    const paymentFilter = selectFilterPayment.value;
    const statusFilter = selectFilterStatus.value;
    const sortBy = selectSortBookings.value;

    const filtered = bookings.filter(b => {
      if (serviceFilter !== 'ALL' && b.serviceType !== serviceFilter) return false;
      if (paymentFilter !== 'ALL' && b.paymentStatus !== paymentFilter) return false;
      if (statusFilter !== 'ALL' && b.bookingStatus !== statusFilter) return false;

      if (searchTerm) {
        const fullStr = `${b.bookingId} ${b.clientName} ${b.destination} ${b.serviceType} ${b.notes || ''}`.toLowerCase();
        if (!fullStr.includes(searchTerm)) return false;
      }
      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.travelDate || 0) - new Date(a.travelDate || 0);
      }
      if (sortBy === 'amount-desc') {
        return (Number(b.totalAmount) || 0) - (Number(a.totalAmount) || 0);
      }
      if (sortBy === 'name-asc') {
        return a.clientName.localeCompare(b.clientName);
      }
      return 0;
    });

    filteredBookingsCount.textContent = `Showing ${filtered.length} of ${bookings.length} reservations`;

    bookingTableBody.innerHTML = '';
    if (filtered.length === 0) {
      bookingTableBody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align:center; padding:2rem; color:var(--text-tertiary);">
            No reservations found matching your filter criteria.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(b => {
      const tot = Number(b.totalAmount) || 0;
      const pd = Number(b.paidAmount) || 0;
      const bal = Math.max(0, tot - pd);

      const sIcon = SERVICE_ICONS[b.serviceType] || '✈️';
      const sCls = SERVICE_CLASS[b.serviceType] || 'service-flight';

      let payCls = 'payment-paid';
      if (b.paymentStatus === 'Partial') payCls = 'payment-partial';
      else if (b.paymentStatus === 'Unpaid') payCls = 'payment-unpaid';

      let statCls = 'status-confirmed';
      if (b.bookingStatus === 'Pending') statCls = 'status-pending';
      else if (b.bookingStatus === 'Cancelled') statCls = 'status-cancelled';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="font-weight:800; font-family:monospace; color:var(--accent); cursor:pointer;" class="btn-view-voucher" data-id="${b.id}" title="Click to view voucher">
            ${escapeHtml(b.bookingId)}
          </div>
          <div style="font-size:0.7rem; color:var(--text-tertiary);">Ref: #${escapeHtml(b.id.slice(-4))}</div>
        </td>
        <td>
          <div style="font-weight:700; color:var(--text-primary);">${escapeHtml(b.clientName)}</div>
          ${b.notes ? `<div style="font-size:0.72rem; color:var(--text-tertiary); max-width:220px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">📝 ${escapeHtml(b.notes)}</div>` : ''}
        </td>
        <td>
          <span class="service-badge ${sCls}">${sIcon} ${escapeHtml(b.serviceType)}</span>
        </td>
        <td>
          <div style="font-weight:600; color:var(--text-primary);">${escapeHtml(b.destination)}</div>
        </td>
        <td>
          <div style="font-family:monospace; font-size:0.8rem; color:var(--text-secondary);">${b.travelDate || '-'}</div>
          ${b.returnDate ? `<div style="font-size:0.7rem; color:var(--text-tertiary);">Return: ${b.returnDate}</div>` : ''}
        </td>
        <td>
          <div style="font-family:monospace; font-weight:800; color:var(--text-primary);">${formatMoney(tot)}</div>
          ${bal > 0 ? `<div style="font-size:0.7rem; color:#f87171;">Due: ${formatMoney(bal)}</div>` : '<div style="font-size:0.7rem; color:#34d399;">Fully Settled</div>'}
        </td>
        <td>
          <span class="payment-badge ${payCls}">${escapeHtml(b.paymentStatus)}</span>
        </td>
        <td>
          <span class="status-badge ${statCls}">${escapeHtml(b.bookingStatus)}</span>
        </td>
        <td style="text-align:right;">
          <div style="display:inline-flex; gap:0.25rem;">
            <button type="button" class="btn-view-voucher" data-id="${b.id}" title="View Voucher" style="background:transparent; border:1px solid var(--border); color:var(--text-secondary); padding:0.25rem 0.5rem; border-radius:var(--radius-sm); cursor:pointer; font-size:0.75rem;">
              🎟️
            </button>
            <button type="button" class="btn-edit-booking" data-id="${b.id}" title="Edit Reservation" style="background:transparent; border:1px solid var(--border); color:var(--text-secondary); padding:0.25rem 0.5rem; border-radius:var(--radius-sm); cursor:pointer; font-size:0.75rem;">
              ✏️
            </button>
            <button type="button" class="btn-toggle-paid" data-id="${b.id}" title="Mark Paid in Full" style="background:transparent; border:1px solid var(--border); color:var(--text-secondary); padding:0.25rem 0.5rem; border-radius:var(--radius-sm); cursor:pointer; font-size:0.75rem;">
              💵
            </button>
            <button type="button" class="btn-delete-booking" data-id="${b.id}" title="Delete Reservation" style="background:transparent; border:1px solid var(--border); color:#ef4444; padding:0.25rem 0.5rem; border-radius:var(--radius-sm); cursor:pointer; font-size:0.75rem;">
              🗑️
            </button>
          </div>
        </td>
      `;

      bookingTableBody.appendChild(tr);
    });
  }

  // --- Master Update ---
  function updateAll() {
    const metrics = computeReservationMetrics();
    renderKPIs(metrics);
    renderBookingsTable();
    saveBookings();
  }

  // --- Event Listeners: Filtering ---
  selectFilterService.addEventListener('change', () => renderBookingsTable());
  selectFilterPayment.addEventListener('change', () => renderBookingsTable());
  selectFilterStatus.addEventListener('change', () => renderBookingsTable());
  selectSortBookings.addEventListener('change', () => renderBookingsTable());
  bookingSearchInput.addEventListener('input', () => renderBookingsTable());

  if (currencySelect) {
    currencySelect.addEventListener('change', () => updateAll());
  }

  // Auto-sync payment status when editing total and paid amounts in form
  totalAmountInput.addEventListener('input', () => {
    paymentStatusSelect.value = computePaymentStatus(totalAmountInput.value, paidAmountInput.value);
  });
  paidAmountInput.addEventListener('input', () => {
    paymentStatusSelect.value = computePaymentStatus(totalAmountInput.value, paidAmountInput.value);
  });

  // Table Delegated Actions (Voucher, Edit, Mark Paid, Delete)
  bookingTableBody.addEventListener('click', (e) => {
    const viewBtn = e.target.closest('.btn-view-voucher');
    const editBtn = e.target.closest('.btn-edit-booking');
    const paidBtn = e.target.closest('.btn-toggle-paid');
    const delBtn = e.target.closest('.btn-delete-booking');

    if (viewBtn) {
      const id = viewBtn.getAttribute('data-id');
      const b = bookings.find(item => item.id === id);
      if (b) openVoucherModal(b);
    } else if (editBtn) {
      const id = editBtn.getAttribute('data-id');
      const b = bookings.find(item => item.id === id);
      if (b) openEditModal(b);
    } else if (paidBtn) {
      const id = paidBtn.getAttribute('data-id');
      const b = bookings.find(item => item.id === id);
      if (b) {
        b.paidAmount = b.totalAmount;
        b.paymentStatus = 'Paid';
        updateAll();
      }
    } else if (delBtn) {
      const id = delBtn.getAttribute('data-id');
      const b = bookings.find(item => item.id === id);
      if (b && confirm(`Delete reservation ${b.bookingId} for ${b.clientName}?`)) {
        bookings = bookings.filter(item => item.id !== id);
        updateAll();
      }
    }
  });

  // --- Modal Operations ---
  function openAddModal() {
    modalTitle.textContent = 'Create New Reservation';
    entryIdInput.value = '';
    bookingForm.reset();
    bookingIdInput.value = 'BK-' + Math.floor(1000 + Math.random() * 9000);
    serviceTypeSelect.value = 'Flight';
    travelDateInput.value = new Date().toISOString().slice(0, 10);
    totalAmountInput.value = '1500';
    paidAmountInput.value = '1500';
    paymentStatusSelect.value = 'Paid';
    bookingStatusSelect.value = 'Confirmed';
    bookingModal.classList.add('active');
  }

  function openEditModal(b) {
    modalTitle.textContent = 'Edit Reservation';
    entryIdInput.value = b.id;
    bookingIdInput.value = b.bookingId;
    clientNameInput.value = b.clientName;
    serviceTypeSelect.value = b.serviceType;
    destinationInput.value = b.destination;
    travelDateInput.value = b.travelDate || '';
    returnDateInput.value = b.returnDate || '';
    totalAmountInput.value = b.totalAmount;
    paidAmountInput.value = b.paidAmount !== undefined ? b.paidAmount : b.totalAmount;
    paymentStatusSelect.value = b.paymentStatus;
    bookingStatusSelect.value = b.bookingStatus;
    notesInput.value = b.notes || '';
    bookingModal.classList.add('active');
  }

  function closeModal() {
    bookingModal.classList.remove('active');
  }

  if (btnAddBooking) btnAddBooking.addEventListener('click', openAddModal);
  if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
  if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);

  bookingModal.addEventListener('click', (e) => {
    if (e.target === bookingModal) closeModal();
  });

  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = entryIdInput.value;
    const bookingId = bookingIdInput.value.trim().toUpperCase();
    const clientName = clientNameInput.value.trim();
    const serviceType = serviceTypeSelect.value;
    const destination = destinationInput.value.trim();
    const travelDate = travelDateInput.value;
    const returnDate = returnDateInput.value;
    const totalAmount = Math.max(0, parseFloat(totalAmountInput.value) || 0);
    const paidAmount = Math.max(0, parseFloat(paidAmountInput.value) || 0);
    const paymentStatus = paymentStatusSelect.value;
    const bookingStatus = bookingStatusSelect.value;
    const notes = notesInput.value.trim();

    if (id) {
      const b = bookings.find(item => item.id === id);
      if (b) {
        b.bookingId = bookingId;
        b.clientName = clientName;
        b.serviceType = serviceType;
        b.destination = destination;
        b.travelDate = travelDate;
        b.returnDate = returnDate;
        b.totalAmount = totalAmount;
        b.paidAmount = paidAmount;
        b.paymentStatus = paymentStatus;
        b.bookingStatus = bookingStatus;
        b.notes = notes;
      }
    } else {
      const newBooking = {
        id: 'bk-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        bookingId,
        clientName,
        serviceType,
        destination,
        travelDate,
        returnDate,
        totalAmount,
        paidAmount,
        paymentStatus,
        bookingStatus,
        notes
      };
      bookings.unshift(newBooking);
    }

    closeModal();
    updateAll();
  });

  // --- Voucher Modal ---
  function openVoucherModal(b) {
    const tot = Number(b.totalAmount) || 0;
    const pd = Number(b.paidAmount) || 0;
    const bal = Math.max(0, tot - pd);
    const sIcon = SERVICE_ICONS[b.serviceType] || '✈️';

    voucherContent.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:0.5rem;">
        <div>
          <span style="font-size:0.7rem; text-transform:uppercase; color:var(--text-tertiary); letter-spacing:1px;">Booking Reference</span>
          <div style="font-size:1.3rem; font-weight:800; font-family:monospace; color:var(--accent);">${escapeHtml(b.bookingId)}</div>
        </div>
        <div style="text-align:right;">
          <span style="font-size:0.75rem; font-weight:700; color:#34d399; background:rgba(16,185,129,0.15); padding:0.2rem 0.5rem; border-radius:4px;">
            ${escapeHtml(b.bookingStatus)}
          </span>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; font-size:0.8rem;">
        <div>
          <span style="color:var(--text-tertiary); font-size:0.7rem;">Client Name:</span>
          <div style="font-weight:700; color:var(--text-primary);">${escapeHtml(b.clientName)}</div>
        </div>
        <div>
          <span style="color:var(--text-tertiary); font-size:0.7rem;">Service Type:</span>
          <div style="font-weight:700; color:var(--text-primary);">${sIcon} ${escapeHtml(b.serviceType)}</div>
        </div>
      </div>

      <div style="font-size:0.8rem;">
        <span style="color:var(--text-tertiary); font-size:0.7rem;">Destination / Route:</span>
        <div style="font-weight:700; color:var(--text-primary);">${escapeHtml(b.destination)}</div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; font-size:0.8rem;">
        <div>
          <span style="color:var(--text-tertiary); font-size:0.7rem;">Travel Date:</span>
          <div style="font-family:monospace; font-weight:700;">${b.travelDate || '-'}</div>
        </div>
        <div>
          <span style="color:var(--text-tertiary); font-size:0.7rem;">Return Date:</span>
          <div style="font-family:monospace; font-weight:700;">${b.returnDate || '-'}</div>
        </div>
      </div>

      <div style="border-top:1px dashed var(--border); padding-top:0.5rem; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <span style="color:var(--text-tertiary); font-size:0.7rem;">Total Amount:</span>
          <div style="font-size:1.1rem; font-weight:800; font-family:monospace; color:var(--text-primary);">${formatMoney(tot)}</div>
        </div>
        <div style="text-align:right;">
          <span style="color:var(--text-tertiary); font-size:0.7rem;">Payment Status:</span>
          <div style="font-size:0.85rem; font-weight:700; color:${b.paymentStatus === 'Paid' ? '#34d399' : '#fbbf24'};">${escapeHtml(b.paymentStatus)} (${formatMoney(pd)} Paid)</div>
        </div>
      </div>

      ${bal > 0 ? `
        <div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); border-radius:4px; padding:0.4rem 0.6rem; color:#f87171; font-size:0.75rem; text-align:center;">
          Remaining Balance Due: <strong>${formatMoney(bal)}</strong>
        </div>
      ` : ''}

      ${b.notes ? `
        <div style="background:rgba(255,255,255,0.03); border-radius:4px; padding:0.4rem 0.6rem; font-size:0.75rem; color:var(--text-secondary);">
          <strong>Notes:</strong> ${escapeHtml(b.notes)}
        </div>
      ` : ''}

      <div style="text-align:center; padding-top:0.25rem;">
        <span style="font-size:0.65rem; color:var(--text-tertiary); font-family:monospace;">* ALL IN ONE TRAVEL RESERVATION SYSTEM - OFFICIAL VOUCHER *</span>
      </div>
    `;

    voucherModal.classList.add('active');
  }

  if (btnCloseVoucher) {
    btnCloseVoucher.addEventListener('click', () => voucherModal.classList.remove('active'));
  }

  voucherModal.addEventListener('click', (e) => {
    if (e.target === voucherModal) voucherModal.classList.remove('active');
  });

  if (btnPrintVoucher) {
    btnPrintVoucher.addEventListener('click', () => {
      window.print();
    });
  }

  // --- CSV Export ---
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', () => {
      const headers = ['Booking ID', 'Client Name', 'Service Type', 'Destination', 'Travel Date', 'Return Date', 'Total Amount', 'Paid Amount', 'Balance Due', 'Payment Status', 'Booking Status', 'Notes'];
      const rows = bookings.map(b => {
        const tot = Number(b.totalAmount) || 0;
        const pd = Number(b.paidAmount) || 0;
        const bal = Math.max(0, tot - pd);

        return [
          csvClean(b.bookingId),
          csvClean(b.clientName),
          csvClean(b.serviceType),
          csvClean(b.destination),
          csvClean(b.travelDate || ''),
          csvClean(b.returnDate || ''),
          tot,
          pd,
          bal,
          csvClean(b.paymentStatus),
          csvClean(b.bookingStatus),
          csvClean(b.notes || '')
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `travel_reservations_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }

  // --- Presets & Reset ---
  if (btnResetDemo) {
    btnResetDemo.addEventListener('click', () => {
      if (confirm('Reset reservations ledger back to default demonstration records?')) {
        bookings = JSON.parse(JSON.stringify(INITIAL_BOOKINGS));
        selectFilterService.value = 'ALL';
        selectFilterPayment.value = 'ALL';
        selectFilterStatus.value = 'ALL';
        updateAll();
      }
    });
  }

  if (presetAllReservations) {
    presetAllReservations.addEventListener('click', () => {
      selectFilterService.value = 'ALL';
      selectFilterPayment.value = 'ALL';
      selectFilterStatus.value = 'ALL';
      bookingSearchInput.value = '';
      updateAll();
    });
  }

  if (presetPendingUnpaid) {
    presetPendingUnpaid.addEventListener('click', () => {
      selectFilterService.value = 'ALL';
      selectFilterPayment.value = 'Unpaid';
      selectFilterStatus.value = 'ALL';
      bookingSearchInput.value = '';
      renderBookingsTable();
    });
  }

  if (presetUmrahTours) {
    presetUmrahTours.addEventListener('click', () => {
      selectFilterService.value = 'Tour';
      selectFilterPayment.value = 'ALL';
      selectFilterStatus.value = 'ALL';
      bookingSearchInput.value = '';
      renderBookingsTable();
    });
  }

  // --- Helpers ---
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