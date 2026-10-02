// Visa Fee Calculator Logic

// Standard baseline embassy fees in USD
const BASELINE_EMBASSY_FEES = {
  USA: {
    Tourist: 185,
    Business: 185,
    Student: 185,
    Transit: 185,
    Work: 205
  },
  UK: {
    Tourist: 145,
    Business: 145,
    Student: 620,
    Transit: 45,
    Work: 790
  },
  Schengen: {
    Tourist: 98,
    Business: 98,
    Student: 98,
    Transit: 98,
    Work: 110
  },
  'Saudi Arabia': {
    Tourist: 140,
    Business: 160,
    Student: 120,
    Transit: 35,
    Work: 250
  },
  UAE: {
    Tourist: 110,
    Business: 150,
    Student: 200,
    Transit: 40,
    Work: 280
  },
  Canada: {
    Tourist: 135,
    Business: 135,
    Student: 180,
    Transit: 0,
    Work: 220
  },
  Australia: {
    Tourist: 125,
    Business: 125,
    Student: 470,
    Transit: 0,
    Work: 310
  },
  Singapore: {
    Tourist: 25,
    Business: 25,
    Student: 65,
    Transit: 0,
    Work: 120
  },
  Malaysia: {
    Tourist: 35,
    Business: 55,
    Student: 90,
    Transit: 0,
    Work: 150
  },
  India: {
    Tourist: 40,
    Business: 80,
    Student: 80,
    Transit: 25,
    Work: 120
  }
};

// Processing speed fee in USD & turnaround labels
const SPEED_CONFIG = {
  standard: { fee: 0, time: '10–15 Business Days', label: 'Standard Speed' },
  express: { fee: 40, time: '5–7 Business Days', label: 'Express Priority' },
  urgent: { fee: 95, time: '2–3 Business Days', label: 'VIP Urgent' }
};

// Currency configurations relative to USD base
const CURRENCIES = {
  USD: { symbol: '$', rate: 1.0, decimals: 2, name: 'USD' },
  EUR: { symbol: '€', rate: 0.92, decimals: 2, name: 'EUR' },
  GBP: { symbol: '£', rate: 0.79, decimals: 2, name: 'GBP' },
  BDT: { symbol: '৳', rate: 121.5, decimals: 0, name: 'BDT' },
  SAR: { symbol: '﷼', rate: 3.75, decimals: 2, name: 'SAR' }
};

const BASE_SERVICE_CHARGE_USD = 30;
const BASE_INSURANCE_USD = 25;
const BASE_COURIER_USD = 15;

// State
let currentCurrency = 'USD';
let currentSpeed = 'standard';

function formatMoney(amount, currencyCode = currentCurrency) {
  const curr = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const num = Math.max(0, amount);
  if (curr.decimals === 0) {
    return `${curr.symbol}${Math.round(num).toLocaleString('en-US')}`;
  }
  return `${curr.symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function usdToCurrent(amountUsd) {
  const rate = CURRENCIES[currentCurrency].rate;
  return amountUsd * rate;
}

function currentToUsd(amountInCurrent) {
  const rate = CURRENCIES[currentCurrency].rate;
  return amountInCurrent / (rate || 1);
}

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const destCountrySelect = document.getElementById('dest-country');
  const visaTypeSelect = document.getElementById('visa-type');
  const applicantsInput = document.getElementById('applicants-count');
  const embassyFeeInput = document.getElementById('embassy-fee');
  const serviceChargeInput = document.getElementById('service-charge');
  const includeInsurance = document.getElementById('include-insurance');
  const includeCourier = document.getElementById('include-courier');
  const taxRateInput = document.getElementById('tax-rate');
  const btnReset = document.getElementById('btn-reset');
  const btnCopy = document.getElementById('btn-copy');
  const btnPrint = document.getElementById('btn-print');
  const speedSelector = document.getElementById('speed-selector');
  const currencyPills = document.getElementById('currency-pills');
  
  const grandTotalDisp = document.getElementById('grand-total-disp');
  const perPersonDisp = document.getElementById('per-person-disp');
  const timelineDisp = document.getElementById('timeline-disp');
  const countryTag = document.getElementById('country-tag');
  const breakdownBody = document.getElementById('breakdown-body');
  const insuranceRateDisp = document.getElementById('insurance-rate-disp');
  const courierRateDisp = document.getElementById('courier-rate-disp');
  const currCodeLabels = document.querySelectorAll('.curr-code');
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');

  function showToast(message) {
    if (!toast) return;
    toastText.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  function updateCurrencyLabels() {
    currCodeLabels.forEach(el => {
      el.textContent = currentCurrency;
    });
    if (insuranceRateDisp) {
      insuranceRateDisp.textContent = formatMoney(usdToCurrent(BASE_INSURANCE_USD));
    }
    if (courierRateDisp) {
      courierRateDisp.textContent = formatMoney(usdToCurrent(BASE_COURIER_USD));
    }
  }

  function syncDefaultFees() {
    const country = destCountrySelect.value;
    const type = visaTypeSelect.value;
    const baseFeeUsd = (BASELINE_EMBASSY_FEES[country] && BASELINE_EMBASSY_FEES[country][type] !== undefined)
      ? BASELINE_EMBASSY_FEES[country][type]
      : 100;
    
    const convertedEmbassy = usdToCurrent(baseFeeUsd);
    const convertedService = usdToCurrent(BASE_SERVICE_CHARGE_USD);
    
    const curr = CURRENCIES[currentCurrency];
    embassyFeeInput.value = curr.decimals === 0 ? Math.round(convertedEmbassy) : convertedEmbassy.toFixed(2);
    serviceChargeInput.value = curr.decimals === 0 ? Math.round(convertedService) : convertedService.toFixed(2);
  }

  function calculateAndRender() {
    const country = destCountrySelect.value;
    const visaType = visaTypeSelect.value;
    const applicants = Math.max(1, parseInt(applicantsInput.value, 10) || 1);
    
    const embassyFeePerPerson = Math.max(0, parseFloat(embassyFeeInput.value) || 0);
    const serviceChargePerPerson = Math.max(0, parseFloat(serviceChargeInput.value) || 0);
    
    const speedInfo = SPEED_CONFIG[currentSpeed] || SPEED_CONFIG.standard;
    const speedFeePerPerson = usdToCurrent(speedInfo.fee);
    
    const insurancePerPerson = includeInsurance.checked ? usdToCurrent(BASE_INSURANCE_USD) : 0;
    const courierPerPerson = includeCourier.checked ? usdToCurrent(BASE_COURIER_USD) : 0;
    
    const taxPercent = Math.max(0, parseFloat(taxRateInput.value) || 0);

    // Per-person subtotal
    const subtotalPerPerson = embassyFeePerPerson + serviceChargePerPerson + speedFeePerPerson + insurancePerPerson + courierPerPerson;
    
    // Subtotal before tax for all applicants
    const totalEmbassy = embassyFeePerPerson * applicants;
    const totalService = serviceChargePerPerson * applicants;
    const totalSpeed = speedFeePerPerson * applicants;
    const totalInsurance = insurancePerPerson * applicants;
    const totalCourier = courierPerPerson * applicants;
    
    const subtotalBeforeTax = totalEmbassy + totalService + totalSpeed + totalInsurance + totalCourier;
    const taxAmount = (subtotalBeforeTax * taxPercent) / 100;
    const grandTotal = subtotalBeforeTax + taxAmount;
    const grandTotalPerPerson = grandTotal / applicants;

    // Update Header Badges & Highlights
    countryTag.textContent = `${country} • ${visaType}`;
    grandTotalDisp.textContent = formatMoney(grandTotal);
    perPersonDisp.textContent = `${formatMoney(grandTotalPerPerson)} per applicant • ${applicants} ${applicants === 1 ? 'Applicant' : 'Applicants'}`;
    timelineDisp.textContent = speedInfo.time;

    // Render Table Rows
    let rowsHtml = '';

    // Embassy fee row
    rowsHtml += `
      <tr>
        <td><strong>Government Embassy Fee</strong></td>
        <td style="text-align: right;">${formatMoney(embassyFeePerPerson)}</td>
        <td style="text-align: center;">${applicants}</td>
        <td style="text-align: right; font-weight: 600;">${formatMoney(totalEmbassy)}</td>
      </tr>
    `;

    // Speed surcharge row
    if (speedInfo.fee > 0) {
      rowsHtml += `
        <tr>
          <td>Processing Speed (${speedInfo.label})</td>
          <td style="text-align: right;">${formatMoney(speedFeePerPerson)}</td>
          <td style="text-align: center;">${applicants}</td>
          <td style="text-align: right;">${formatMoney(totalSpeed)}</td>
        </tr>
      `;
    }

    // Service Charge
    rowsHtml += `
      <tr>
        <td>Agency Application & Documentation Fee</td>
        <td style="text-align: right;">${formatMoney(serviceChargePerPerson)}</td>
        <td style="text-align: center;">${applicants}</td>
        <td style="text-align: right;">${formatMoney(totalService)}</td>
      </tr>
    `;

    // Optional Insurance
    if (includeInsurance.checked) {
      rowsHtml += `
        <tr>
          <td>Mandatory Travel / Medical Insurance Policy</td>
          <td style="text-align: right;">${formatMoney(insurancePerPerson)}</td>
          <td style="text-align: center;">${applicants}</td>
          <td style="text-align: right;">${formatMoney(totalInsurance)}</td>
        </tr>
      `;
    }

    // Optional Courier
    if (includeCourier.checked) {
      rowsHtml += `
        <tr>
          <td>Secure Courier Return & SMS Alerts</td>
          <td style="text-align: right;">${formatMoney(courierPerPerson)}</td>
          <td style="text-align: center;">${applicants}</td>
          <td style="text-align: right;">${formatMoney(totalCourier)}</td>
        </tr>
      `;
    }

    // Subtotal Row
    rowsHtml += `
      <tr class="subtotal-row">
        <td colspan="3">Subtotal (Net of Taxes)</td>
        <td style="text-align: right;">${formatMoney(subtotalBeforeTax)}</td>
      </tr>
    `;

    // Tax Row
    if (taxPercent > 0) {
      rowsHtml += `
        <tr>
          <td colspan="3">VAT / Regulatory Surcharge (${taxPercent}%)</td>
          <td style="text-align: right;">${formatMoney(taxAmount)}</td>
        </tr>
      `;
    }

    // Grand Total Row
    rowsHtml += `
      <tr class="total-row">
        <td colspan="3">Grand Total Payable</td>
        <td style="text-align: right; color: var(--accent);">${formatMoney(grandTotal)}</td>
      </tr>
    `;

    breakdownBody.innerHTML = rowsHtml;
  }

  // Event Listeners for Currency Switching
  if (currencyPills) {
    currencyPills.addEventListener('click', (e) => {
      const btn = e.target.closest('.curr-pill');
      if (!btn) return;
      
      const newCurr = btn.dataset.currency;
      if (newCurr === currentCurrency) return;
      
      // Convert existing custom amounts to new currency
      const oldRate = CURRENCIES[currentCurrency].rate;
      const newRate = CURRENCIES[newCurr].rate;
      const factor = newRate / oldRate;
      
      currentCurrency = newCurr;
      
      currencyPills.querySelectorAll('.curr-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Adjust inputs by factor
      const oldEmbassy = parseFloat(embassyFeeInput.value) || 0;
      const oldService = parseFloat(serviceChargeInput.value) || 0;
      
      const curr = CURRENCIES[currentCurrency];
      embassyFeeInput.value = curr.decimals === 0 ? Math.round(oldEmbassy * factor) : (oldEmbassy * factor).toFixed(2);
      serviceChargeInput.value = curr.decimals === 0 ? Math.round(oldService * factor) : (oldService * factor).toFixed(2);
      
      updateCurrencyLabels();
      calculateAndRender();
    });
  }

  // Event Listeners for Speed Selection
  if (speedSelector) {
    speedSelector.addEventListener('click', (e) => {
      const card = e.target.closest('.speed-card');
      if (!card) return;
      
      speedSelector.querySelectorAll('.speed-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      currentSpeed = card.dataset.speed;
      calculateAndRender();
    });
  }

  // Country & Visa Type Changes
  destCountrySelect.addEventListener('change', () => {
    syncDefaultFees();
    calculateAndRender();
  });

  visaTypeSelect.addEventListener('change', () => {
    syncDefaultFees();
    calculateAndRender();
  });

  // Numeric and Checkbox Inputs
  [applicantsInput, embassyFeeInput, serviceChargeInput, taxRateInput].forEach(inp => {
    inp.addEventListener('input', calculateAndRender);
  });

  [includeInsurance, includeCourier].forEach(chk => {
    chk.addEventListener('change', calculateAndRender);
  });

  // Reset Button
  btnReset.addEventListener('click', () => {
    destCountrySelect.value = 'USA';
    visaTypeSelect.value = 'Tourist';
    applicantsInput.value = 1;
    includeInsurance.checked = true;
    includeCourier.checked = false;
    taxRateInput.value = 5;
    
    currentSpeed = 'standard';
    if (speedSelector) {
      speedSelector.querySelectorAll('.speed-card').forEach(c => {
        c.classList.toggle('active', c.dataset.speed === 'standard');
      });
    }

    syncDefaultFees();
    calculateAndRender();
    showToast('Reset to default standard rates.');
  });

  // Copy Summary Action
  btnCopy.addEventListener('click', () => {
    const country = destCountrySelect.value;
    const type = visaTypeSelect.value;
    const applicants = applicantsInput.value;
    const speed = SPEED_CONFIG[currentSpeed].label;
    const turnaround = SPEED_CONFIG[currentSpeed].time;
    const total = grandTotalDisp.textContent;
    const perPerson = perPersonDisp.textContent;

    const summaryText = [
      `=== VISA APPLICATION QUOTATION ===`,
      `Destination: ${country}`,
      `Visa Category: ${type}`,
      `Number of Applicants: ${applicants}`,
      `Processing Speed: ${speed} (${turnaround})`,
      `Currency: ${currentCurrency}`,
      `Total Cost: ${total}`,
      `Breakdown: ${perPerson}`,
      `Quotation Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      `ALL IN ONE Travel Services`
    ].join('\n');

    navigator.clipboard.writeText(summaryText).then(() => {
      showToast('Quotation summary copied to clipboard!');
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = summaryText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Quotation summary copied!');
    });
  });

  // Print Action
  btnPrint.addEventListener('click', () => {
    window.print();
  });

  // Initial Sync and Calc
  updateCurrencyLabels();
  syncDefaultFees();
  calculateAndRender();
});