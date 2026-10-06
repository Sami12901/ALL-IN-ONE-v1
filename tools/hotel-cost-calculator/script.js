// Hotel Cost Calculator Client Logic

document.addEventListener('DOMContentLoaded', () => {
  // Currency state
  let currentCurrency = 'USD';
  let currencySymbol = '$';

  // DOM Elements
  const roomRateInput = document.getElementById('room-rate');
  const numNightsInput = document.getElementById('num-nights');
  const numRoomsInput = document.getElementById('num-rooms');
  const numGuestsInput = document.getElementById('num-guests');
  const taxRateInput = document.getElementById('tax-rate');
  const resortFeeInput = document.getElementById('resort-fee');
  const parkingFeeInput = document.getElementById('parking-fee');
  const serviceFeeInput = document.getElementById('service-fee');
  const discountValInput = document.getElementById('discount-val');
  const mealRateHidden = document.getElementById('meal-rate');

  // Prefix elements for currency symbols
  const rateSymbolPrefix = document.getElementById('rate-symbol-prefix');
  const resortSymbolPrefix = document.getElementById('resort-symbol-prefix');
  const parkingSymbolPrefix = document.getElementById('parking-symbol-prefix');
  const serviceSymbolPrefix = document.getElementById('service-symbol-prefix');

  // Display outputs
  const grandTotalDisplay = document.getElementById('grand-total-display');
  const heroAvgNight = document.getElementById('hero-avg-night');
  const heroCostGuest = document.getElementById('hero-cost-guest');

  const kpiBaseRoom = document.getElementById('kpi-base-room');
  const kpiTaxes = document.getElementById('kpi-taxes');
  const kpiResortFees = document.getElementById('kpi-resort-fees');

  const barRoom = document.getElementById('bar-room');
  const barTax = document.getElementById('bar-tax');
  const barResort = document.getElementById('bar-resort');
  const barMeals = document.getElementById('bar-meals');
  const barExtras = document.getElementById('bar-extras');
  const breakdownSummaryText = document.getElementById('breakdown-summary-text');

  // Table outputs
  const tblRoomBasis = document.getElementById('tbl-room-basis');
  const tblRoomVal = document.getElementById('tbl-room-val');
  const tblTaxBasis = document.getElementById('tbl-tax-basis');
  const tblTaxVal = document.getElementById('tbl-tax-val');
  const tblResortBasis = document.getElementById('tbl-resort-basis');
  const tblResortVal = document.getElementById('tbl-resort-val');
  const tblMealBasis = document.getElementById('tbl-meal-basis');
  const tblMealVal = document.getElementById('tbl-meal-val');
  const tblExtrasRow = document.getElementById('tbl-extras-row');
  const tblExtrasBasis = document.getElementById('tbl-extras-basis');
  const tblExtrasVal = document.getElementById('tbl-extras-val');
  const tblDiscountRow = document.getElementById('tbl-discount-row');
  const tblDiscountBasis = document.getElementById('tbl-discount-basis');
  const tblDiscountVal = document.getElementById('tbl-discount-val');
  const tblTotalBasis = document.getElementById('tbl-total-basis');
  const tblGrandVal = document.getElementById('tbl-grand-val');

  // Meal Plan Cards
  const mealCards = document.querySelectorAll('#meal-plans .meal-card');
  let currentMealName = 'Breakfast Buffet';

  // Currency Pills
  const currPills = document.querySelectorAll('#currency-pills .curr-pill');

  // Preset Buttons
  const presetButtons = document.querySelectorAll('.preset-pill');

  // Modal elements
  const quotationModal = document.getElementById('quotation-modal');
  const openQuotationBtn = document.getElementById('open-quotation-btn');
  const closeQuoteBtn = document.getElementById('close-quote-btn');
  const printQuoteBtn = document.getElementById('print-quote-btn');
  const quoteTableBody = document.getElementById('quote-table-body');
  const quoteNights = document.getElementById('quote-nights');
  const quoteRooms = document.getElementById('quote-rooms');
  const quoteGuests = document.getElementById('quote-guests');
  const quoteMeals = document.getElementById('quote-meals');
  const quoteDate = document.getElementById('quote-date');
  const quoteRefNumber = document.getElementById('quote-ref-number');

  // Toast
  const toastMsg = document.getElementById('toast-msg');
  const toastText = document.getElementById('toast-text');
  const copySummaryBtn = document.getElementById('copy-summary-btn');
  const resetBtn = document.getElementById('reset-btn');

  // Format money helper
  function formatMoney(amount) {
    if (isNaN(amount) || !isFinite(amount)) amount = 0;
    return `${currencySymbol}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  // Toast notification
  let toastTimer = null;
  function showToast(text) {
    if (toastTimer) clearTimeout(toastTimer);
    toastText.textContent = text;
    toastMsg.classList.add('show');
    toastTimer = setTimeout(() => {
      toastMsg.classList.remove('show');
    }, 2800);
  }

  // Calculate & Update UI
  function calculate() {
    const rate = Math.max(0, parseFloat(roomRateInput.value) || 0);
    const nights = Math.max(1, parseInt(numNightsInput.value, 10) || 1);
    const rooms = Math.max(1, parseInt(numRoomsInput.value, 10) || 1);
    const guests = Math.max(1, parseInt(numGuestsInput.value, 10) || 1);
    const taxRate = Math.max(0, parseFloat(taxRateInput.value) || 0);
    const resortFee = Math.max(0, parseFloat(resortFeeInput.value) || 0);
    const mealRate = Math.max(0, parseFloat(mealRateHidden.value) || 0);
    const parkingFee = Math.max(0, parseFloat(parkingFeeInput.value) || 0);
    const serviceFee = Math.max(0, parseFloat(serviceFeeInput.value) || 0);
    const discountVal = Math.min(100, Math.max(0, parseFloat(discountValInput.value) || 0));

    // Core computations
    const baseRoomCost = rate * nights * rooms;
    const totalTaxes = baseRoomCost * (taxRate / 100);
    const totalResortFees = resortFee * nights * rooms;
    const totalMealCost = mealRate * nights * guests;
    const totalParking = parkingFee * nights * rooms;
    const totalExtras = totalParking + serviceFee;

    const subtotal = baseRoomCost + totalTaxes + totalResortFees + totalMealCost + totalExtras;
    const discountAmount = subtotal * (discountVal / 100);
    const grandTotal = Math.max(0, subtotal - discountAmount);

    const avgPerNight = grandTotal / nights;
    const costPerGuest = grandTotal / guests;

    // Update displays
    grandTotalDisplay.textContent = formatMoney(grandTotal);
    heroAvgNight.textContent = formatMoney(avgPerNight);
    heroCostGuest.textContent = formatMoney(costPerGuest);

    kpiBaseRoom.textContent = formatMoney(baseRoomCost);
    kpiTaxes.textContent = formatMoney(totalTaxes);
    kpiResortFees.textContent = formatMoney(totalResortFees);

    // Distribution bar
    const totalForBar = subtotal > 0 ? subtotal : 1;
    const pctRoom = Math.round((baseRoomCost / totalForBar) * 100);
    const pctTax = Math.round((totalTaxes / totalForBar) * 100);
    const pctResort = Math.round((totalResortFees / totalForBar) * 100);
    const pctMeals = Math.round((totalMealCost / totalForBar) * 100);
    const pctExtras = Math.max(0, 100 - (pctRoom + pctTax + pctResort + pctMeals));

    barRoom.style.width = `${pctRoom}%`;
    barTax.style.width = `${pctTax}%`;
    barResort.style.width = `${pctResort}%`;
    barMeals.style.width = `${pctMeals}%`;
    barExtras.style.width = `${pctExtras}%`;

    breakdownSummaryText.textContent = `Room: ${pctRoom}% | Tax: ${pctTax}% | Resort: ${pctResort}% | Meals: ${pctMeals}%`;

    // Itemized table
    tblRoomBasis.textContent = `${rooms} Rm${rooms > 1 ? 's' : ''} × ${nights} Nt${nights > 1 ? 's' : ''}`;
    tblRoomVal.textContent = formatMoney(baseRoomCost);

    tblTaxBasis.textContent = `${taxRate}% on Base`;
    tblTaxVal.textContent = formatMoney(totalTaxes);

    tblResortBasis.textContent = `${formatMoney(resortFee)}/nt × ${rooms * nights} units`;
    tblResortVal.textContent = formatMoney(totalResortFees);

    tblMealBasis.textContent = `${currentMealName} (${guests} Gst × ${nights} Nts)`;
    tblMealVal.textContent = formatMoney(totalMealCost);

    if (totalExtras > 0) {
      tblExtrasRow.style.display = '';
      tblExtrasBasis.textContent = parkingFee > 0 ? `Parking & Fees` : `Incidentals`;
      tblExtrasVal.textContent = formatMoney(totalExtras);
    } else {
      tblExtrasRow.style.display = 'none';
    }

    if (discountAmount > 0) {
      tblDiscountRow.style.display = '';
      tblDiscountBasis.textContent = `${discountVal}% off`;
      tblDiscountVal.textContent = `-${formatMoney(discountAmount)}`;
    } else {
      tblDiscountRow.style.display = 'none';
    }

    tblTotalBasis.textContent = `${nights} Nights / ${guests} Guest${guests > 1 ? 's' : ''}`;
    tblGrandVal.textContent = formatMoney(grandTotal);

    return {
      rate,
      nights,
      rooms,
      guests,
      taxRate,
      resortFee,
      mealRate,
      parkingFee,
      serviceFee,
      discountVal,
      baseRoomCost,
      totalTaxes,
      totalResortFees,
      totalMealCost,
      totalExtras,
      discountAmount,
      grandTotal,
      avgPerNight,
      costPerGuest
    };
  }

  // Update currency
  function setCurrency(currency, symbol) {
    currentCurrency = currency;
    currencySymbol = symbol;

    rateSymbolPrefix.textContent = symbol;
    resortSymbolPrefix.textContent = symbol;
    parkingSymbolPrefix.textContent = symbol;
    serviceSymbolPrefix.textContent = symbol;

    currPills.forEach(pill => {
      pill.classList.toggle('active', pill.dataset.currency === currency);
    });

    calculate();
  }

  currPills.forEach(pill => {
    pill.addEventListener('click', () => {
      setCurrency(pill.dataset.currency, pill.dataset.symbol);
    });
  });

  // Meal Plan selection
  mealCards.forEach(card => {
    card.addEventListener('click', () => {
      mealCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const rate = parseFloat(card.dataset.rate) || 0;
      mealRateHidden.value = rate;
      currentMealName = card.querySelector('.meal-title').textContent.trim();
      calculate();
    });
  });

  // Presets
  const presets = {
    weekend: { rate: 140, nights: 2, rooms: 1, guests: 2, tax: 10, resort: 15, meal: 'breakfast', parking: 0, service: 0 },
    business: { rate: 220, nights: 3, rooms: 1, guests: 1, tax: 14, resort: 25, meal: 'breakfast', parking: 20, service: 0 },
    family: { rate: 280, nights: 6, rooms: 2, guests: 4, tax: 12, resort: 35, meal: 'half-board', parking: 15, service: 50 },
    luxury: { rate: 450, nights: 5, rooms: 2, guests: 4, tax: 15, resort: 50, meal: 'all-inclusive', parking: 0, service: 0 }
  };

  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const p = presets[btn.dataset.preset];
      if (!p) return;
      roomRateInput.value = p.rate;
      numNightsInput.value = p.nights;
      numRoomsInput.value = p.rooms;
      numGuestsInput.value = p.guests;
      taxRateInput.value = p.tax;
      resortFeeInput.value = p.resort;
      parkingFeeInput.value = p.parking;
      serviceFeeInput.value = p.service;
      discountValInput.value = 0;

      // Select matching meal card
      mealCards.forEach(card => {
        if (card.dataset.plan === p.meal) {
          card.click();
        }
      });
      calculate();
    });
  });

  // Input listeners
  const allInputs = [
    roomRateInput,
    numNightsInput,
    numRoomsInput,
    numGuestsInput,
    taxRateInput,
    resortFeeInput,
    parkingFeeInput,
    serviceFeeInput,
    discountValInput
  ];

  allInputs.forEach(input => {
    input.addEventListener('input', calculate);
  });

  // Reset functionality
  resetBtn.addEventListener('click', () => {
    roomRateInput.value = 180;
    numNightsInput.value = 4;
    numRoomsInput.value = 1;
    numGuestsInput.value = 2;
    taxRateInput.value = 12;
    resortFeeInput.value = 25;
    parkingFeeInput.value = 0;
    serviceFeeInput.value = 0;
    discountValInput.value = 0;

    mealCards.forEach(c => {
      if (c.dataset.plan === 'breakfast') c.click();
    });

    setCurrency('USD', '$');
    showToast('Reset to default values.');
  });

  // Copy Summary
  copySummaryBtn.addEventListener('click', () => {
    const data = calculate();
    const summaryText = `--- HOTEL ACCOMMODATION ESTIMATE ---
Length of Stay: ${data.nights} Nights (${data.rooms} Room${data.rooms > 1 ? 's' : ''}, ${data.guests} Guest${data.guests > 1 ? 's' : ''})
Base Room Rate: ${formatMoney(data.rate)}/night
Base Accommodation: ${formatMoney(data.baseRoomCost)}
Occupancy Tax (${data.taxRate}%): ${formatMoney(data.totalTaxes)}
Resort Fees: ${formatMoney(data.totalResortFees)}
Meal Plan (${currentMealName}): ${formatMoney(data.totalMealCost)}
${data.totalExtras > 0 ? `Extras & Parking: ${formatMoney(data.totalExtras)}\n` : ''}${data.discountAmount > 0 ? `Discount (${data.discountVal}%): -${formatMoney(data.discountAmount)}\n` : ''}-----------------------------------
GRAND TOTAL: ${formatMoney(data.grandTotal)}
Average / Night: ${formatMoney(data.avgPerNight)}
Cost / Guest: ${formatMoney(data.costPerGuest)}
Currency: ${currentCurrency}`;

    navigator.clipboard.writeText(summaryText).then(() => {
      showToast('Quotation summary copied to clipboard!');
    }).catch(() => {
      showToast('Copied to clipboard.');
    });
  });

  // Printable Quotation Modal
  openQuotationBtn.addEventListener('click', () => {
    const data = calculate();

    // Populate modal values
    const today = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    const refCode = `REF-${new Date().getFullYear()}-HTL-${Math.floor(1000 + Math.random() * 9000)}`;

    quoteDate.textContent = `Date: ${today}`;
    quoteRefNumber.textContent = refCode;
    quoteNights.textContent = `${data.nights} Nights`;
    quoteRooms.textContent = `${data.rooms} Room(s)`;
    quoteGuests.textContent = `${data.guests} Guest(s)`;
    quoteMeals.textContent = currentMealName;

    let rowsHtml = `
      <tr>
        <td>Room Rate (${formatMoney(data.rate)}/nt)</td>
        <td style="text-align: center;">${data.rooms} Rm × ${data.nights} Nts</td>
        <td style="text-align: right;">${formatMoney(data.baseRoomCost)}</td>
      </tr>
      <tr>
        <td>Occupancy &amp; Tourism Tax</td>
        <td style="text-align: center;">${data.taxRate}% on Rooms</td>
        <td style="text-align: right;">${formatMoney(data.totalTaxes)}</td>
      </tr>
      <tr>
        <td>Mandatory Resort / Amenity Fee</td>
        <td style="text-align: center;">${formatMoney(data.resortFee)}/nt × ${data.rooms * data.nights} units</td>
        <td style="text-align: right;">${formatMoney(data.totalResortFees)}</td>
      </tr>
      <tr>
        <td>Meal Catering Plan (${currentMealName})</td>
        <td style="text-align: center;">${data.guests} Guests × ${data.nights} Nts</td>
        <td style="text-align: right;">${formatMoney(data.totalMealCost)}</td>
      </tr>
    `;

    if (data.totalExtras > 0) {
      rowsHtml += `
        <tr>
          <td>Parking &amp; Incidental Services</td>
          <td style="text-align: center;">Additional Services</td>
          <td style="text-align: right;">${formatMoney(data.totalExtras)}</td>
        </tr>
      `;
    }

    if (data.discountAmount > 0) {
      rowsHtml += `
        <tr style="color: #10b981;">
          <td>Promotional Discount</td>
          <td style="text-align: center;">${data.discountVal}% off</td>
          <td style="text-align: right;">-${formatMoney(data.discountAmount)}</td>
        </tr>
      `;
    }

    rowsHtml += `
      <tr style="border-top: 2px solid var(--accent); font-weight: 800; font-size: 1.1rem;">
        <td>Total Estimated Amount</td>
        <td style="text-align: center;">${data.nights} Nights / ${data.guests} Guests</td>
        <td style="text-align: right; color: var(--accent);">${formatMoney(data.grandTotal)}</td>
      </tr>
    `;

    quoteTableBody.innerHTML = rowsHtml;
    quotationModal.classList.add('active');
  });

  closeQuoteBtn.addEventListener('click', () => {
    quotationModal.classList.remove('active');
  });

  quotationModal.addEventListener('click', (e) => {
    if (e.target === quotationModal) {
      quotationModal.classList.remove('active');
    }
  });

  printQuoteBtn.addEventListener('click', () => {
    window.print();
  });

  // Initial calculation
  calculate();
});