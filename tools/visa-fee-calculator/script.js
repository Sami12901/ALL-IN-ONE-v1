document.addEventListener('DOMContentLoaded', () => {
  // Inputs
  const form = document.getElementById('visa-form');
  const currencySelect = document.getElementById('currency-select');
  const numPaxInput = document.getElementById('num-pax');
  const countryNameInput = document.getElementById('country-name');
  const embassyFeeInput = document.getElementById('embassy-fee');
  const vfsFeeInput = document.getElementById('vfs-fee');
  const agencyFeeInput = document.getElementById('agency-fee');
  
  // Addons
  const addonInsurance = document.getElementById('addon-insurance');
  const valInsurance = document.getElementById('val-insurance');
  const addonLounge = document.getElementById('addon-lounge');
  const valLounge = document.getElementById('val-lounge');
  const addonCourier = document.getElementById('addon-courier');
  const valCourier = document.getElementById('val-courier');
  
  // Outputs
  const outEmbassy = document.getElementById('out-embassy');
  const outVfs = document.getElementById('out-vfs');
  const outAgency = document.getElementById('out-agency');
  const outAddonsContainer = document.getElementById('out-addons-container');
  const outPerPax = document.getElementById('out-per-pax');
  const outGrandTotal = document.getElementById('out-grand-total');
  const outPaxCount = document.getElementById('out-pax-count');
  
  const receiptDestination = document.getElementById('receipt-destination');
  const receiptDate = document.getElementById('receipt-date');
  const resetBtn = document.getElementById('reset-btn');
  const printBtn = document.getElementById('print-btn');

  const currSymbols = document.querySelectorAll('.curr-sym');

  const currencyMap = {
    'BDT': '৳',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'INR': '₹'
  };

  function formatCurrency(amount, curr) {
    const sym = currencyMap[curr] || curr;
    return `${sym} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function setDate() {
    const d = new Date();
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    receiptDate.textContent = `Date: ${d.toLocaleDateString('en-GB', options)}`;
  }

  function calculate() {
    const curr = currencySelect.value;
    const sym = currencyMap[curr];
    currSymbols.forEach(el => el.textContent = sym);

    const pax = parseInt(numPaxInput.value) || 1;
    const dest = countryNameInput.value.trim() || 'General Visa';
    
    receiptDestination.textContent = dest;
    outPaxCount.textContent = `Based on ${pax} Applicant(s)`;

    const embassy = parseFloat(embassyFeeInput.value) || 0;
    const vfs = parseFloat(vfsFeeInput.value) || 0;
    const agency = parseFloat(agencyFeeInput.value) || 0;

    outEmbassy.textContent = formatCurrency(embassy, curr);
    outVfs.textContent = formatCurrency(vfs, curr);
    outAgency.textContent = formatCurrency(agency, curr);

    let perPaxTotal = embassy + vfs + agency;
    outAddonsContainer.innerHTML = '';

    const addOnData = [
      { id: 'addon-insurance', el: addonInsurance, val: valInsurance, label: 'Travel Insurance' },
      { id: 'addon-lounge', el: addonLounge, val: valLounge, label: 'Premium Lounge' },
      { id: 'addon-courier', el: addonCourier, val: valCourier, label: 'Courier Service' }
    ];

    addOnData.forEach(addon => {
      // Toggle selected class on parent label
      const parent = addon.el.closest('.addon-item');
      if (addon.el.checked) {
        parent.classList.add('selected');
        const cost = parseFloat(addon.val.value) || 0;
        perPaxTotal += cost;
        
        const row = document.createElement('div');
        row.className = 'receipt-row';
        row.innerHTML = `<span class="receipt-label">${addon.label}</span><span class="receipt-value">${formatCurrency(cost, curr)}</span>`;
        outAddonsContainer.appendChild(row);
      } else {
        parent.classList.remove('selected');
      }
    });

    outPerPax.textContent = formatCurrency(perPaxTotal, curr);
    
    const grandTotal = perPaxTotal * pax;
    outGrandTotal.textContent = formatCurrency(grandTotal, curr);
  }

  // Event Listeners
  const allInputs = form.querySelectorAll('input, select');
  allInputs.forEach(input => {
    input.addEventListener('input', calculate);
    input.addEventListener('change', calculate);
  });

  resetBtn.addEventListener('click', () => {
    form.reset();
    calculate();
  });

  printBtn.addEventListener('click', () => {
    window.print();
  });

  // Init
  setDate();
  calculate();
});
