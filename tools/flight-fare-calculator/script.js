// Flight Fare Calculator - Client-side Interactive Engine
document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const tripTypeContainer = document.getElementById('trip-type-container');
  const btnRoundtrip = document.getElementById('btn-roundtrip');
  const btnOneway = document.getElementById('btn-oneway');
  const originInput = document.getElementById('origin-input');
  const destInput = document.getElementById('dest-input');
  const swapRouteBtn = document.getElementById('swap-route-btn');
  const cabinSelect = document.getElementById('cabin-select');
  const flightDateInput = document.getElementById('flight-date');
  const presetChips = document.querySelectorAll('.preset-chip');

  // Passenger Stepper Elements
  const btnAdultsMinus = document.getElementById('btn-adults-minus');
  const btnAdultsPlus = document.getElementById('btn-adults-plus');
  const valAdults = document.getElementById('val-adults');

  const btnChildrenMinus = document.getElementById('btn-children-minus');
  const btnChildrenPlus = document.getElementById('btn-children-plus');
  const valChildren = document.getElementById('val-children');

  const btnInfantsMinus = document.getElementById('btn-infants-minus');
  const btnInfantsPlus = document.getElementById('btn-infants-plus');
  const valInfants = document.getElementById('val-infants');

  // Ancillaries & Base Inputs
  const baseFareInput = document.getElementById('base-fare-input');
  const fuelSurchargeInput = document.getElementById('fuel-surcharge-input');
  const taxInput = document.getElementById('tax-input');
  const baggageSelect = document.getElementById('baggage-select');
  const seatSelect = document.getElementById('seat-select');
  const currencySelect = document.getElementById('currency-select');

  // Ticket Preview Elements
  const ticketClassBadge = document.getElementById('ticket-class-badge');
  const ticketTripBadge = document.getElementById('ticket-trip-badge');
  const routeOriginCode = document.getElementById('route-origin-code');
  const routeOriginCity = document.getElementById('route-origin-city');
  const routeDestCode = document.getElementById('route-dest-code');
  const routeDestCity = document.getElementById('route-dest-city');
  const routePaxBadge = document.getElementById('route-pax-badge');
  const quotePnr = document.getElementById('quote-pnr');
  const quoteTimestamp = document.getElementById('quote-timestamp');

  // Table rows and value displays
  const rowAdultFare = document.getElementById('row-adult-fare');
  const countAdultTxt = document.getElementById('count-adult-txt');
  const rateAdultTxt = document.getElementById('rate-adult-txt');
  const valAdultTotal = document.getElementById('val-adult-total');

  const rowChildFare = document.getElementById('row-child-fare');
  const countChildTxt = document.getElementById('count-child-txt');
  const rateChildTxt = document.getElementById('rate-child-txt');
  const valChildTotal = document.getElementById('val-child-total');

  const rowInfantFare = document.getElementById('row-infant-fare');
  const countInfantTxt = document.getElementById('count-infant-txt');
  const rateInfantTxt = document.getElementById('rate-infant-txt');
  const valInfantTotal = document.getElementById('val-infant-total');

  const valFuelTotal = document.getElementById('val-fuel-total');
  const valTaxesTotal = document.getElementById('val-taxes-total');
  const rowBaggageFare = document.getElementById('row-baggage-fare');
  const valBaggageTotal = document.getElementById('val-baggage-total');
  const rowSeatFare = document.getElementById('row-seat-fare');
  const valSeatTotal = document.getElementById('val-seat-total');
  const valTripAdjustment = document.getElementById('val-trip-adjustment');

  const grandTotalDisplay = document.getElementById('grand-total-display');
  const avgPaxDisplay = document.getElementById('avg-pax-display');

  // Action Buttons
  const btnPrintItinerary = document.getElementById('btn-print-itinerary');
  const btnCopyQuote = document.getElementById('btn-copy-quote');
  const btnResetForm = document.getElementById('btn-reset-form');
  const printArea = document.getElementById('print-area');

  // --- Initial State ---
  let state = {
    tripType: 'roundtrip', // 'roundtrip' | 'oneway'
    adults: 1,
    children: 0,
    infants: 0,
    currency: 'USD',
    currencySymbol: '$',
    exchangeRate: 1.0
  };

  // Set default departure date to 14 days from now
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 14);
  if (flightDateInput) {
    flightDateInput.value = defaultDate.toISOString().split('T')[0];
  }

  // Generate a random booking reference simulation code
  function generatePNR() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'AIO-';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
  if (quotePnr) {
    quotePnr.textContent = generatePNR();
  }

  // Helper to extract Airport code and city name from string "JFK - New York, USA"
  function parseAirportString(str) {
    if (!str) return { code: 'DEP', city: 'Departure' };
    const parts = str.split('-');
    if (parts.length >= 2) {
      const code = parts[0].trim().toUpperCase().slice(0, 4);
      const city = parts[1].trim().split(',')[0];
      return { code, city };
    }
    const trimmed = str.trim().toUpperCase();
    return { code: trimmed.slice(0, 3) || 'LOC', city: str.trim() };
  }

  // Helper to format currency
  function formatMoney(amountUSD) {
    const converted = amountUSD * state.exchangeRate;
    const decimals = state.currency === 'JPY' ? 0 : 2;
    return `${state.currencySymbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}`;
  }

  // --- Core Calculation Function ---
  function calculateFare() {
    const baseAdultUSD = Math.max(0, parseFloat(baseFareInput.value) || 0);
    const fuelUSD = Math.max(0, parseFloat(fuelSurchargeInput.value) || 0);
    const taxUSD = Math.max(0, parseFloat(taxInput.value) || 0);
    const baggageUSD = Math.max(0, parseFloat(baggageSelect.value) || 0);
    const seatUSD = Math.max(0, parseFloat(seatSelect.value) || 0);

    const cabinOption = cabinSelect.selectedOptions[0];
    const cabinMult = parseFloat(cabinOption?.dataset.mult || '1.0');
    const cabinLabel = cabinOption ? cabinOption.text.split('(')[0].trim().toUpperCase() : 'ECONOMY';

    const tripMultiplier = state.tripType === 'roundtrip' ? 1.9 : 1.0;
    const legFactor = state.tripType === 'roundtrip' ? 2 : 1;

    // Per-passenger base fares (one-way base adjusted by cabin class)
    const adultBasePerLeg = baseAdultUSD * cabinMult;
    const childBasePerLeg = adultBasePerLeg * 0.75;
    const infantBasePerLeg = adultBasePerLeg * 0.10;

    // Total base fares with trip multiplier
    const totalAdultBase = state.adults * adultBasePerLeg * tripMultiplier;
    const totalChildBase = state.children * childBasePerLeg * tripMultiplier;
    const totalInfantBase = state.infants * infantBasePerLeg * tripMultiplier;

    // Fuel and Taxes
    // Infants pay 25% fuel and 10% taxes
    const totalFuel = fuelUSD * (state.adults + state.children + state.infants * 0.25) * tripMultiplier;
    const totalTaxes = taxUSD * (state.adults + state.children + state.infants * 0.10) * tripMultiplier;

    // Baggage & Seats (charged per seated passenger per flight leg)
    const seatedPax = state.adults + state.children;
    const totalBaggage = baggageUSD * seatedPax * legFactor;
    const totalSeats = seatUSD * seatedPax * legFactor;

    // Grand Total
    const grandTotalUSD = totalAdultBase + totalChildBase + totalInfantBase + totalFuel + totalTaxes + totalBaggage + totalSeats;
    const totalPax = state.adults + state.children + state.infants;
    const avgPerPaxUSD = totalPax > 0 ? grandTotalUSD / totalPax : 0;

    // --- Update UI Displays ---
    if (ticketClassBadge) ticketClassBadge.textContent = cabinLabel;
    if (ticketTripBadge) {
      ticketTripBadge.textContent = state.tripType === 'roundtrip' ? 'ROUND-TRIP' : 'ONE-WAY';
    }

    const orig = parseAirportString(originInput.value);
    const dest = parseAirportString(destInput.value);
    if (routeOriginCode) routeOriginCode.textContent = orig.code;
    if (routeOriginCity) routeOriginCity.textContent = orig.city;
    if (routeDestCode) routeDestCode.textContent = dest.code;
    if (routeDestCity) routeDestCity.textContent = dest.city;

    if (routePaxBadge) {
      const paxDesc = [];
      if (state.adults) paxDesc.push(`${state.adults} Adult${state.adults > 1 ? 's' : ''}`);
      if (state.children) paxDesc.push(`${state.children} Child${state.children > 1 ? 'ren' : ''}`);
      if (state.infants) paxDesc.push(`${state.infants} Infant${state.infants > 1 ? 's' : ''}`);
      routePaxBadge.textContent = paxDesc.join(', ') || '0 Passengers';
    }

    // Adult row
    if (countAdultTxt) countAdultTxt.textContent = state.adults;
    if (rateAdultTxt) rateAdultTxt.textContent = formatMoney(adultBasePerLeg);
    if (valAdultTotal) valAdultTotal.textContent = formatMoney(totalAdultBase);

    // Child row
    if (rowChildFare) {
      if (state.children > 0) {
        rowChildFare.style.display = 'table-row';
        if (countChildTxt) countChildTxt.textContent = state.children;
        if (rateChildTxt) rateChildTxt.textContent = formatMoney(childBasePerLeg);
        if (valChildTotal) valChildTotal.textContent = formatMoney(totalChildBase);
      } else {
        rowChildFare.style.display = 'none';
      }
    }

    // Infant row
    if (rowInfantFare) {
      if (state.infants > 0) {
        rowInfantFare.style.display = 'table-row';
        if (countInfantTxt) countInfantTxt.textContent = state.infants;
        if (rateInfantTxt) rateInfantTxt.textContent = formatMoney(infantBasePerLeg);
        if (valInfantTotal) valInfantTotal.textContent = formatMoney(totalInfantBase);
      } else {
        rowInfantFare.style.display = 'none';
      }
    }

    // Surcharges & Taxes
    if (valFuelTotal) valFuelTotal.textContent = formatMoney(totalFuel);
    if (valTaxesTotal) valTaxesTotal.textContent = formatMoney(totalTaxes);

    // Baggage row
    if (rowBaggageFare) {
      if (totalBaggage > 0) {
        rowBaggageFare.style.display = 'table-row';
        if (valBaggageTotal) valBaggageTotal.textContent = formatMoney(totalBaggage);
      } else {
        rowBaggageFare.style.display = 'none';
      }
    }

    // Seat row
    if (rowSeatFare) {
      if (totalSeats > 0) {
        rowSeatFare.style.display = 'table-row';
        if (valSeatTotal) valSeatTotal.textContent = formatMoney(totalSeats);
      } else {
        rowSeatFare.style.display = 'none';
      }
    }

    // Trip multiplier text
    if (valTripAdjustment) {
      valTripAdjustment.textContent = state.tripType === 'roundtrip' ? '× 1.9 (Round-Trip Disc.)' : '× 1.0 (One-Way)';
    }

    // Grand total
    if (grandTotalDisplay) grandTotalDisplay.textContent = formatMoney(grandTotalUSD);
    if (avgPaxDisplay) {
      avgPaxDisplay.textContent = `Avg ${formatMoney(avgPerPaxUSD)} / person`;
    }

    return {
      orig,
      dest,
      cabinLabel,
      grandTotalUSD,
      totalPax,
      avgPerPaxUSD,
      totalAdultBase,
      totalChildBase,
      totalInfantBase,
      totalFuel,
      totalTaxes,
      totalBaggage,
      totalSeats
    };
  }

  // --- Event Listeners ---

  // Trip Type segmented toggle
  if (btnRoundtrip && btnOneway) {
    btnRoundtrip.addEventListener('click', () => {
      state.tripType = 'roundtrip';
      btnRoundtrip.classList.add('active');
      btnOneway.classList.remove('active');
      calculateFare();
    });

    btnOneway.addEventListener('click', () => {
      state.tripType = 'oneway';
      btnOneway.classList.add('active');
      btnRoundtrip.classList.remove('active');
      calculateFare();
    });
  }

  // Route swap button
  if (swapRouteBtn) {
    swapRouteBtn.addEventListener('click', () => {
      const temp = originInput.value;
      originInput.value = destInput.value;
      destInput.value = temp;
      calculateFare();
    });
  }

  // Route presets
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      if (chip.dataset.origin) originInput.value = chip.dataset.origin;
      if (chip.dataset.dest) destInput.value = chip.dataset.dest;
      if (chip.dataset.base) baseFareInput.value = chip.dataset.base;
      calculateFare();
    });
  });

  // Currency Selector
  if (currencySelect) {
    currencySelect.addEventListener('change', () => {
      const selected = currencySelect.selectedOptions[0];
      state.currency = currencySelect.value;
      state.currencySymbol = selected.dataset.symbol || '$';
      state.exchangeRate = parseFloat(selected.dataset.rate || '1.0');
      calculateFare();
    });
  }

  // Adult Steppers
  btnAdultsMinus.addEventListener('click', () => {
    if (state.adults > 1) {
      state.adults--;
      valAdults.textContent = state.adults;
      // Infants cannot exceed adults
      if (state.infants > state.adults) {
        state.infants = state.adults;
        valInfants.textContent = state.infants;
      }
      btnAdultsMinus.disabled = state.adults <= 1;
      calculateFare();
    }
  });

  btnAdultsPlus.addEventListener('click', () => {
    if (state.adults < 9) {
      state.adults++;
      valAdults.textContent = state.adults;
      btnAdultsMinus.disabled = false;
      calculateFare();
    }
  });

  // Children Steppers
  btnChildrenMinus.addEventListener('click', () => {
    if (state.children > 0) {
      state.children--;
      valChildren.textContent = state.children;
      btnChildrenMinus.disabled = state.children <= 0;
      calculateFare();
    }
  });

  btnChildrenPlus.addEventListener('click', () => {
    if (state.children < 8) {
      state.children++;
      valChildren.textContent = state.children;
      btnChildrenMinus.disabled = false;
      calculateFare();
    }
  });

  // Infants Steppers
  btnInfantsMinus.addEventListener('click', () => {
    if (state.infants > 0) {
      state.infants--;
      valInfants.textContent = state.infants;
      btnInfantsMinus.disabled = state.infants <= 0;
      calculateFare();
    }
  });

  btnInfantsPlus.addEventListener('click', () => {
    if (state.infants < state.adults) {
      state.infants++;
      valInfants.textContent = state.infants;
      btnInfantsMinus.disabled = false;
      calculateFare();
    } else {
      alert('Airlines restrict lap infants to at most 1 infant per accompanying adult.');
    }
  });

  // Live Input Listeners
  [originInput, destInput, cabinSelect, baseFareInput, fuelSurchargeInput, taxInput, baggageSelect, seatSelect, flightDateInput].forEach(elem => {
    if (elem) {
      elem.addEventListener('input', calculateFare);
      elem.addEventListener('change', calculateFare);
    }
  });

  // Copy Quote Summary
  if (btnCopyQuote) {
    btnCopyQuote.addEventListener('click', () => {
      const data = calculateFare();
      const quoteText = [
        `===========================================`,
        `FLIGHT ITINERARY QUOTE - ${quotePnr.textContent}`,
        `===========================================`,
        `Route: ${originInput.value} ➔ ${destInput.value}`,
        `Type: ${state.tripType === 'roundtrip' ? 'Round-Trip' : 'One-Way'} | Class: ${data.cabinLabel}`,
        `Date: ${flightDateInput.value || 'Open'}`,
        `Passengers: ${state.adults} Adult(s), ${state.children} Child(ren), ${state.infants} Infant(s)`,
        `-------------------------------------------`,
        `Base Airfare: ${formatMoney(data.totalAdultBase + data.totalChildBase + data.totalInfantBase)}`,
        `Fuel Surcharges (YQ): ${formatMoney(data.totalFuel)}`,
        `Airport Taxes: ${formatMoney(data.totalTaxes)}`,
        `Baggage Fees: ${formatMoney(data.totalBaggage)}`,
        `Seat Selection: ${formatMoney(data.totalSeats)}`,
        `-------------------------------------------`,
        `TOTAL GROUP QUOTE: ${formatMoney(data.grandTotalUSD)} (${state.currency})`,
        `Average per Passenger: ${formatMoney(data.avgPerPaxUSD)}`,
        `Generated on: ${new Date().toLocaleString()}`,
        `===========================================`
      ].join('\n');

      navigator.clipboard.writeText(quoteText).then(() => {
        const originalText = btnCopyQuote.innerHTML;
        btnCopyQuote.innerHTML = `
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--success);"><polyline points="20 6 9 17 4 12"/></svg>
          Copied!
        `;
        setTimeout(() => {
          btnCopyQuote.innerHTML = originalText;
        }, 2000);
      }).catch(() => {
        alert('Quote summary copied to clipboard!');
      });
    });
  }

  // Print Itinerary
  if (btnPrintItinerary) {
    btnPrintItinerary.addEventListener('click', () => {
      const data = calculateFare();
      if (!printArea) return;

      printArea.innerHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #111827; line-height: 1.5;">
          <div style="border-bottom: 3px solid #1e3a8a; padding-bottom: 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
              <h1 style="margin: 0; font-size: 24px; color: #1e3a8a; text-transform: uppercase;">Flight Itinerary & Cost Estimate</h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #4b5563;">Official Travel Agency Quotation</p>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 16px; font-weight: bold; color: #1e3a8a;">PNR: ${quotePnr.textContent}</div>
              <div style="font-size: 12px; color: #6b7280;">Date: ${new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div style="background: #f3f4f6; border-radius: 8px; padding: 1.25rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between;">
            <div>
              <div style="font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: bold;">Origin</div>
              <div style="font-size: 20px; font-weight: bold; color: #111827;">${data.orig.code}</div>
              <div style="font-size: 13px; color: #4b5563;">${originInput.value}</div>
            </div>
            <div style="text-align: center; display: flex; flex-direction: column; justify-content: center;">
              <div style="font-size: 13px; font-weight: bold; color: #1e3a8a;">${state.tripType === 'roundtrip' ? '⇄ ROUND-TRIP' : '➔ ONE-WAY'}</div>
              <div style="font-size: 12px; color: #6b7280;">Class: ${data.cabinLabel}</div>
              <div style="font-size: 12px; color: #6b7280;">Dept: ${flightDateInput.value || 'Open'}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: bold;">Destination</div>
              <div style="font-size: 20px; font-weight: bold; color: #111827;">${data.dest.code}</div>
              <div style="font-size: 13px; color: #4b5563;">${destInput.value}</div>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.5rem;">
            <thead>
              <tr style="background: #e5e7eb; border-bottom: 2px solid #cbd5e1;">
                <th style="text-align: left; padding: 8px 12px; font-size: 13px;">Item / Service Description</th>
                <th style="text-align: center; padding: 8px 12px; font-size: 13px;">Quantity</th>
                <th style="text-align: right; padding: 8px 12px; font-size: 13px;">Subtotal (${state.currency})</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px 12px; font-size: 13px;">Adult Passenger Airfare (${data.cabinLabel})</td>
                <td style="text-align: center; padding: 8px 12px; font-size: 13px;">${state.adults}</td>
                <td style="text-align: right; padding: 8px 12px; font-size: 13px; font-weight: bold;">${formatMoney(data.totalAdultBase)}</td>
              </tr>
              ${state.children > 0 ? `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px 12px; font-size: 13px;">Child Airfare (Ages 2-11, 75% rate)</td>
                <td style="text-align: center; padding: 8px 12px; font-size: 13px;">${state.children}</td>
                <td style="text-align: right; padding: 8px 12px; font-size: 13px; font-weight: bold;">${formatMoney(data.totalChildBase)}</td>
              </tr>` : ''}
              ${state.infants > 0 ? `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px 12px; font-size: 13px;">Infant Lap Airfare (Under 2, 10% rate)</td>
                <td style="text-align: center; padding: 8px 12px; font-size: 13px;">${state.infants}</td>
                <td style="text-align: right; padding: 8px 12px; font-size: 13px; font-weight: bold;">${formatMoney(data.totalInfantBase)}</td>
              </tr>` : ''}
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px 12px; font-size: 13px;">Airline Fuel Surcharges (YQ/YR)</td>
                <td style="text-align: center; padding: 8px 12px; font-size: 13px;">Group</td>
                <td style="text-align: right; padding: 8px 12px; font-size: 13px; font-weight: bold;">${formatMoney(data.totalFuel)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px 12px; font-size: 13px;">Airport Departure, Security & Passenger Taxes</td>
                <td style="text-align: center; padding: 8px 12px; font-size: 13px;">Group</td>
                <td style="text-align: right; padding: 8px 12px; font-size: 13px; font-weight: bold;">${formatMoney(data.totalTaxes)}</td>
              </tr>
              ${data.totalBaggage > 0 ? `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px 12px; font-size: 13px;">Checked Baggage Allowances</td>
                <td style="text-align: center; padding: 8px 12px; font-size: 13px;">All Legs</td>
                <td style="text-align: right; padding: 8px 12px; font-size: 13px; font-weight: bold;">${formatMoney(data.totalBaggage)}</td>
              </tr>` : ''}
              ${data.totalSeats > 0 ? `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 8px 12px; font-size: 13px;">Advanced Seat Assignments</td>
                <td style="text-align: center; padding: 8px 12px; font-size: 13px;">All Legs</td>
                <td style="text-align: right; padding: 8px 12px; font-size: 13px; font-weight: bold;">${formatMoney(data.totalSeats)}</td>
              </tr>` : ''}
            </tbody>
          </table>

          <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <div>
              <div style="font-size: 14px; color: #4338ca; font-weight: bold;">GRAND TOTAL PAYABLE</div>
              <div style="font-size: 12px; color: #6366f1;">Total Passengers: ${data.totalPax} (${formatMoney(data.avgPerPaxUSD)}/pax)</div>
            </div>
            <div style="font-size: 26px; font-weight: 800; color: #312e81;">
              ${formatMoney(data.grandTotalUSD)}
            </div>
          </div>

          <div style="border-top: 1px dashed #cbd5e1; padding-top: 1rem; font-size: 11px; color: #6b7280; text-align: center;">
            <p>Fares and airport taxes are subject to airline availability and government regulatory changes prior to ticket issuance. Quote valid for 24 hours.</p>
            <p>Generated via ALL IN ONE Flight Fare Suite &bull; https://sami12901.github.io/ALL-IN-ONE-v1/</p>
          </div>
        </div>
      `;

      window.print();
    });
  }

  // Reset Form
  if (btnResetForm) {
    btnResetForm.addEventListener('click', () => {
      originInput.value = 'JFK - New York, USA';
      destInput.value = 'LHR - London, UK';
      cabinSelect.value = 'economy';
      baseFareInput.value = '420';
      fuelSurchargeInput.value = '95';
      taxInput.value = '65';
      baggageSelect.value = '0';
      seatSelect.value = '0';
      state.adults = 1;
      state.children = 0;
      state.infants = 0;
      valAdults.textContent = '1';
      valChildren.textContent = '0';
      valInfants.textContent = '0';
      btnAdultsMinus.disabled = true;
      btnChildrenMinus.disabled = true;
      btnInfantsMinus.disabled = true;
      state.tripType = 'roundtrip';
      btnRoundtrip.classList.add('active');
      btnOneway.classList.remove('active');
      quotePnr.textContent = generatePNR();
      calculateFare();
    });
  }

  // Initial Calculation
  calculateFare();
});