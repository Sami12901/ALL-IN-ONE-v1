// Travel Quotation Generator Logic

const CURRENCY_FORMATS = {
  USD: { symbol: '$', decimals: 2 },
  EUR: { symbol: '€', decimals: 2 },
  GBP: { symbol: '£', decimals: 2 },
  BDT: { symbol: '৳', decimals: 0 },
  AUD: { symbol: 'A$', decimals: 2 },
  CAD: { symbol: 'C$', decimals: 2 },
  SAR: { symbol: '﷼', decimals: 2 },
  AED: { symbol: 'AED ', decimals: 2 }
};

let currentCurrency = 'USD';

function formatCurrency(amount, currCode = currentCurrency) {
  const conf = CURRENCY_FORMATS[currCode] || CURRENCY_FORMATS.USD;
  const num = Math.max(0, amount);
  if (conf.decimals === 0) {
    return `${conf.symbol}${Math.round(num).toLocaleString('en-US')}`;
  }
  return `${conf.symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateDisplay(d) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}, ${d.getFullYear()}`;
}

function formatDateIso(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d, days) {
  const res = new Date(d);
  res.setDate(res.getDate() + days);
  return res;
}

document.addEventListener('DOMContentLoaded', () => {
  // DOM Form Inputs
  const clientNameInput = document.getElementById('client-name');
  const clientContactInput = document.getElementById('client-contact');
  const travelPaxInput = document.getElementById('travel-pax');
  const travelKidsInput = document.getElementById('travel-kids');
  const quoteCurrencySelect = document.getElementById('quote-currency');
  const tripDestinationInput = document.getElementById('trip-destination');
  const tripTitleInput = document.getElementById('trip-title');
  const departDateInput = document.getElementById('depart-date');
  const returnDateInput = document.getElementById('return-date');
  
  const flightCostInput = document.getElementById('flight-cost');
  const flightDescInput = document.getElementById('flight-desc');
  const hotelCostInput = document.getElementById('hotel-cost');
  const hotelDescInput = document.getElementById('hotel-desc');
  const visaCostInput = document.getElementById('visa-cost');
  const transfersCostInput = document.getElementById('transfers-cost');
  const marginPctInput = document.getElementById('margin-pct');
  const discountPctInput = document.getElementById('discount-pct');
  const quoteTermsInput = document.getElementById('quote-terms-input');

  const activitiesContainer = document.getElementById('activities-container');
  const btnAddActivity = document.getElementById('btn-add-activity');
  const btnLoadSample = document.getElementById('btn-load-sample');
  const btnResetQuote = document.getElementById('btn-reset-quote');
  const btnPrintQuote = document.getElementById('btn-print-quote');
  const btnCopyQuote = document.getElementById('btn-copy-quote');

  // DOM Preview Elements
  const outQuoteId = document.getElementById('out-quote-id');
  const outQuoteDate = document.getElementById('out-quote-date');
  const outValidDate = document.getElementById('out-valid-date');
  const outClientName = document.getElementById('out-client-name');
  const outClientContact = document.getElementById('out-client-contact');
  const outPassengers = document.getElementById('out-passengers');
  const outTripTitle = document.getElementById('out-trip-title');
  const outTripDest = document.getElementById('out-trip-dest');
  const outTripDuration = document.getElementById('out-trip-duration');
  const outQuoteTableBody = document.getElementById('out-quote-table-body');
  const outSubtotal = document.getElementById('out-subtotal');
  const outMarginPct = document.getElementById('out-margin-pct');
  const outMarginVal = document.getElementById('out-margin-val');
  const outDiscountRow = document.getElementById('out-discount-row');
  const outDiscountPct = document.getElementById('out-discount-pct');
  const outDiscountVal = document.getElementById('out-discount-val');
  const outGrandTotal = document.getElementById('out-grand-total');
  const outPerPaxDisp = document.getElementById('out-per-pax-disp');
  const outTermsDisp = document.getElementById('out-terms-disp');

  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');

  function showToast(msg) {
    if (!toast) return;
    toastText.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  // Activities Data Store
  let activitiesList = [
    { title: 'Full Day Ubud Art Villages & Tegenungan Waterfall Tour', cost: 65, perPerson: true },
    { title: 'Nusa Penida West Island Speedboat & Snorkeling Adventure', cost: 85, perPerson: true },
    { title: 'Sunset Seafood Dinner at Jimbaran Bay', cost: 45, perPerson: true }
  ];

  // Initialize dates
  const today = new Date();
  const defaultDepart = addDays(today, 30);
  const defaultReturn = addDays(defaultDepart, 6); // 7 days / 6 nights
  const defaultValidUntil = addDays(today, 14);

  departDateInput.value = formatDateIso(defaultDepart);
  returnDateInput.value = formatDateIso(defaultReturn);
  outQuoteDate.textContent = formatDateDisplay(today);
  outValidDate.textContent = formatDateDisplay(defaultValidUntil);

  // Generate Unique Quote ID
  function generateQuoteId() {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `TRV-${today.getFullYear()}-${randomNum}`;
  }
  outQuoteId.textContent = generateQuoteId();

  // Render Activities Rows in Form
  function renderActivitiesInputs() {
    activitiesContainer.innerHTML = '';
    activitiesList.forEach((act, index) => {
      const row = document.createElement('div');
      row.className = 'activity-row';
      row.innerHTML = `
        <input type="text" class="form-input act-title" data-index="${index}" placeholder="Activity Name / Tour" value="${act.title}">
        <input type="number" class="form-input act-cost" data-index="${index}" min="0" step="any" placeholder="Cost" value="${act.cost}">
        <button type="button" class="btn-icon btn-remove-act" data-index="${index}" title="Remove Activity">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      `;
      activitiesContainer.appendChild(row);
    });

    // Attach listeners
    activitiesContainer.querySelectorAll('.act-title').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = e.target.dataset.index;
        activitiesList[idx].title = e.target.value;
        updateQuotation();
      });
    });

    activitiesContainer.querySelectorAll('.act-cost').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = e.target.dataset.index;
        activitiesList[idx].cost = parseFloat(e.target.value) || 0;
        updateQuotation();
      });
    });

    activitiesContainer.querySelectorAll('.btn-remove-act').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.target.closest('button').dataset.index;
        activitiesList.splice(idx, 1);
        renderActivitiesInputs();
        updateQuotation();
      });
    });
  }

  btnAddActivity.addEventListener('click', () => {
    activitiesList.push({
      title: 'New Guided Tour / Excursion',
      cost: 50,
      perPerson: true
    });
    renderActivitiesInputs();
    updateQuotation();
  });

  // Calculate & Update Quotation Preview
  function updateQuotation() {
    currentCurrency = quoteCurrencySelect.value;

    const adults = Math.max(1, parseInt(travelPaxInput.value, 10) || 1);
    const kids = Math.max(0, parseInt(travelKidsInput.value, 10) || 0);
    const totalPax = adults + kids;

    // Dates & Nights
    let durationString = '';
    if (departDateInput.value && returnDateInput.value) {
      const d1 = new Date(departDateInput.value + 'T00:00:00');
      const d2 = new Date(returnDateInput.value + 'T00:00:00');
      const msDiff = d2 - d1;
      const days = Math.round(msDiff / (1000 * 60 * 60 * 24)) + 1;
      const nights = Math.max(0, days - 1);
      if (days > 0) {
        durationString = `${days} Days / ${nights} Nights (${formatDateDisplay(d1)} – ${formatDateDisplay(d2)})`;
      } else {
        durationString = `Dates: ${formatDateDisplay(d1)} to ${formatDateDisplay(d2)}`;
      }
    } else {
      durationString = 'Flexible Travel Dates';
    }

    // Client Info
    outClientName.textContent = clientNameInput.value.trim() || 'Valued Client';
    outClientContact.textContent = clientContactInput.value.trim() || 'Direct Contact';
    outPassengers.textContent = `${adults} Adults${kids > 0 ? ` • ${kids} Children` : ''} (${totalPax} Total Pax)`;

    // Tour Info
    outTripTitle.textContent = tripTitleInput.value.trim() || 'Custom Tour Package';
    outTripDest.textContent = tripDestinationInput.value.trim() || 'Global Destination';
    outTripDuration.textContent = durationString;
    outTermsDisp.textContent = quoteTermsInput.value.trim() || 'Standard agency travel package terms apply.';

    // Base Costs Calculations
    const flightRate = Math.max(0, parseFloat(flightCostInput.value) || 0);
    const flightTotal = flightRate * totalPax;

    const hotelTotal = Math.max(0, parseFloat(hotelCostInput.value) || 0);
    const visaRate = Math.max(0, parseFloat(visaCostInput.value) || 0);
    const visaTotal = visaRate * totalPax;

    const transfersTotal = Math.max(0, parseFloat(transfersCostInput.value) || 0);

    let activitiesTotal = 0;
    const activitiesRowsHtml = activitiesList.map(act => {
      const actTotal = (act.perPerson ? act.cost * totalPax : act.cost);
      activitiesTotal += actTotal;
      return `
        <tr>
          <td>
            <strong>Activity:</strong> ${act.title || 'Tour Excursion'}
            <div style="font-size: 0.75rem; color: var(--text-secondary);">Included sightseeing experience</div>
          </td>
          <td style="text-align: center;">${act.perPerson ? `${totalPax} Pax` : '1 Group'}</td>
          <td class="money">${formatCurrency(act.cost)}</td>
          <td class="money">${formatCurrency(actTotal)}</td>
        </tr>
      `;
    }).join('');

    // Table rows rendering
    let tableRows = '';

    // Flights row
    if (flightTotal > 0 || flightDescInput.value) {
      tableRows += `
        <tr>
          <td>
            <strong>Flight Reservations:</strong> ${flightDescInput.value || 'Scheduled Airfare'}
            <div style="font-size: 0.75rem; color: var(--text-secondary);">Per passenger airfare booking</div>
          </td>
          <td style="text-align: center;">${totalPax} Pax</td>
          <td class="money">${formatCurrency(flightRate)}</td>
          <td class="money">${formatCurrency(flightTotal)}</td>
        </tr>
      `;
    }

    // Hotel row
    if (hotelTotal > 0 || hotelDescInput.value) {
      tableRows += `
        <tr>
          <td>
            <strong>Hotel Accommodation:</strong> ${hotelDescInput.value || 'Selected Resort / Hotel'}
            <div style="font-size: 0.75rem; color: var(--text-secondary);">Complete stay accommodation package</div>
          </td>
          <td style="text-align: center;">1 Package</td>
          <td class="money">${formatCurrency(hotelTotal)}</td>
          <td class="money">${formatCurrency(hotelTotal)}</td>
        </tr>
      `;
    }

    // Visa row
    if (visaTotal > 0) {
      tableRows += `
        <tr>
          <td>
            <strong>Visa & Consular Processing:</strong> Entry clearance assistance
            <div style="font-size: 0.75rem; color: var(--text-secondary);">Consular application & handling fees</div>
          </td>
          <td style="text-align: center;">${totalPax} Pax</td>
          <td class="money">${formatCurrency(visaRate)}</td>
          <td class="money">${formatCurrency(visaTotal)}</td>
        </tr>
      `;
    }

    // Transfers row
    if (transfersTotal > 0) {
      tableRows += `
        <tr>
          <td>
            <strong>Ground Transport:</strong> Airport Transfers & Chauffeur Rides
            <div style="font-size: 0.75rem; color: var(--text-secondary);">Private sanitized air-conditioned vehicle</div>
          </td>
          <td style="text-align: center;">1 Service</td>
          <td class="money">${formatCurrency(transfersTotal)}</td>
          <td class="money">${formatCurrency(transfersTotal)}</td>
        </tr>
      `;
    }

    // Add activities
    tableRows += activitiesRowsHtml;

    outQuoteTableBody.innerHTML = tableRows || `<tr><td colspan="4" style="text-align: center; color: var(--text-tertiary);">No items configured yet.</td></tr>`;

    // Totals & Markup Logic
    const directSubtotal = flightTotal + hotelTotal + visaTotal + transfersTotal + activitiesTotal;
    const marginPct = Math.max(0, parseFloat(marginPctInput.value) || 0);
    const discountPct = Math.max(0, parseFloat(discountPctInput.value) || 0);

    const marginAmount = (directSubtotal * marginPct) / 100;
    const priceWithMargin = directSubtotal + marginAmount;
    const discountAmount = (priceWithMargin * discountPct) / 100;
    const grandTotal = Math.max(0, priceWithMargin - discountAmount);
    const perPaxAmount = totalPax > 0 ? (grandTotal / totalPax) : grandTotal;

    outSubtotal.textContent = formatCurrency(directSubtotal);
    outMarginPct.textContent = marginPct;
    outMarginVal.textContent = formatCurrency(marginAmount);

    if (discountPct > 0) {
      outDiscountRow.style.display = 'flex';
      outDiscountPct.textContent = discountPct;
      outDiscountVal.textContent = `-${formatCurrency(discountAmount)}`;
    } else {
      outDiscountRow.style.display = 'none';
    }

    outGrandTotal.textContent = formatCurrency(grandTotal);
    outPerPaxDisp.textContent = `${formatCurrency(perPaxAmount)} per person (${totalPax} Total Pax)`;
  }

  // Load Sample Package
  btnLoadSample.addEventListener('click', () => {
    clientNameInput.value = 'Sarah Jenkins';
    clientContactInput.value = 'sarah.jenkins@example.com';
    travelPaxInput.value = 2;
    travelKidsInput.value = 0;
    quoteCurrencySelect.value = 'USD';
    tripDestinationInput.value = 'Bali & Nusa Penida, Indonesia';
    tripTitleInput.value = '7D6N Tropical Island & Culture Escape';
    
    const d1 = addDays(today, 30);
    const d2 = addDays(d1, 6);
    departDateInput.value = formatDateIso(d1);
    returnDateInput.value = formatDateIso(d2);

    flightCostInput.value = 650;
    flightDescInput.value = 'Roundtrip Economy Flights (Singapore Airlines)';
    hotelCostInput.value = 850;
    hotelDescInput.value = '6 Nights at Maya Ubud Resort & Spa (Deluxe Suite)';
    visaCostInput.value = 35;
    transfersCostInput.value = 120;
    marginPctInput.value = 15;
    discountPctInput.value = 5;

    activitiesList = [
      { title: 'Full Day Ubud Art Villages & Tegenungan Waterfall Tour', cost: 65, perPerson: true },
      { title: 'Nusa Penida West Island Speedboat & Snorkeling Adventure', cost: 85, perPerson: true },
      { title: 'Sunset Seafood Dinner at Jimbaran Bay', cost: 45, perPerson: true }
    ];

    quoteTermsInput.value = 'Includes daily gourmet buffet breakfast, private chauffeur, guided tours, and all attraction entry tickets. Excludes personal laundry, international visa processing, and tips.';

    renderActivitiesInputs();
    updateQuotation();
    showToast('Loaded sample Bali luxury itinerary.');
  });

  // Reset Quote
  btnResetQuote.addEventListener('click', () => {
    clientNameInput.value = '';
    clientContactInput.value = '';
    travelPaxInput.value = 1;
    travelKidsInput.value = 0;
    quoteCurrencySelect.value = 'USD';
    tripDestinationInput.value = '';
    tripTitleInput.value = '';
    flightCostInput.value = 0;
    flightDescInput.value = '';
    hotelCostInput.value = 0;
    hotelDescInput.value = '';
    visaCostInput.value = 0;
    transfersCostInput.value = 0;
    marginPctInput.value = 10;
    discountPctInput.value = 0;
    activitiesList = [];

    renderActivitiesInputs();
    updateQuotation();
    showToast('Quotation reset to blank form.');
  });

  // Print Quote Action
  btnPrintQuote.addEventListener('click', () => {
    window.print();
  });

  // Copy Quote Summary
  btnCopyQuote.addEventListener('click', () => {
    const client = outClientName.textContent;
    const dest = outTripDest.textContent;
    const tour = outTripTitle.textContent;
    const duration = outTripDuration.textContent;
    const pax = outPassengers.textContent;
    const grand = outGrandTotal.textContent;
    const perPax = outPerPaxDisp.textContent;
    const ref = outQuoteId.textContent;

    const summary = [
      `=== TRAVEL ITINERARY QUOTATION ===`,
      `Quote Reference: ${ref}`,
      `Client: ${client}`,
      `Tour: ${tour}`,
      `Destination: ${dest}`,
      `Duration: ${duration}`,
      `Party: ${pax}`,
      `Total Package Price: ${grand}`,
      `Rate Breakdown: ${perPax}`,
      `Valid Until: ${outValidDate.textContent}`,
      `ALL IN ONE Travel Services`
    ].join('\n');

    navigator.clipboard.writeText(summary).then(() => {
      showToast('Quotation summary copied to clipboard!');
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = summary;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Summary copied!');
    });
  });

  // Event Listeners for all inputs
  [
    clientNameInput, clientContactInput, travelPaxInput, travelKidsInput,
    quoteCurrencySelect, tripDestinationInput, tripTitleInput, departDateInput,
    returnDateInput, flightCostInput, flightDescInput, hotelCostInput,
    hotelDescInput, visaCostInput, transfersCostInput, marginPctInput,
    discountPctInput, quoteTermsInput
  ].forEach(inp => {
    inp.addEventListener('input', updateQuotation);
    inp.addEventListener('change', updateQuotation);
  });

  // Initial setup
  renderActivitiesInputs();
  updateQuotation();
});