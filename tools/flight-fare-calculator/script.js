document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    adultCount: document.getElementById('adult-count'),
    childCount: document.getElementById('child-count'),
    infantCount: document.getElementById('infant-count'),
    
    baseFare: document.getElementById('base-fare'),
    airlineTaxes: document.getElementById('airline-taxes'),
    
    agencyComm: document.getElementById('agency-comm'),
    customerDiscount: document.getElementById('customer-discount'),
    
    calculateBtn: document.getElementById('calculate-btn'),
    
    resTotal: document.getElementById('res-total'),
    breakdownList: document.getElementById('breakdown-list')
  };

  function calculateFare() {
    const adults = parseInt(elements.adultCount.value) || 0;
    const children = parseInt(elements.childCount.value) || 0;
    const infants = parseInt(elements.infantCount.value) || 0;
    
    const adultBase = parseFloat(elements.baseFare.value) || 0;
    const taxes = parseFloat(elements.airlineTaxes.value) || 0; // Assuming taxes are same per passenger for simplicity
    
    const commPct = parseFloat(elements.agencyComm.value) || 0;
    const discount = parseFloat(elements.customerDiscount.value) || 0;

    // Standard IATA rules approximation: Child = 75% base, Infant = 10% base
    const childBase = adultBase * 0.75;
    const infantBase = adultBase * 0.10;

    const totalAdultBase = adults * adultBase;
    const totalChildBase = children * childBase;
    const totalInfantBase = infants * infantBase;
    
    const totalBase = totalAdultBase + totalChildBase + totalInfantBase;
    const totalPassengers = adults + children + infants;
    const totalTaxes = totalPassengers * taxes;

    const totalAirlineCost = totalBase + totalTaxes;
    
    // Agency Commission is usually calculated on Base Fare
    const agencyFee = totalBase * (commPct / 100);
    
    const subTotal = totalAirlineCost + agencyFee;
    const finalAmount = subTotal - discount;

    // Format Currency
    const fmt = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(num).replace('BDT', '৳');

    // Update UI
    elements.resTotal.innerText = fmt(finalAmount);

    // Breakdown List
    elements.breakdownList.innerHTML = `
      <li style="display: flex; justify-content: space-between;">
        <span>Adults (${adults}):</span> <strong>${fmt(totalAdultBase)}</strong>
      </li>
      ${children > 0 ? `
      <li style="display: flex; justify-content: space-between;">
        <span>Children (${children}):</span> <strong>${fmt(totalChildBase)}</strong>
      </li>` : ''}
      ${infants > 0 ? `
      <li style="display: flex; justify-content: space-between;">
        <span>Infants (${infants}):</span> <strong>${fmt(totalInfantBase)}</strong>
      </li>` : ''}
      <li style="display: flex; justify-content: space-between; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px dashed var(--border);">
        <span>Total Base Fare:</span> <strong>${fmt(totalBase)}</strong>
      </li>
      <li style="display: flex; justify-content: space-between;">
        <span>Taxes & Surcharges (${totalPassengers} pax):</span> <strong>${fmt(totalTaxes)}</strong>
      </li>
      <li style="display: flex; justify-content: space-between;">
        <span>Agency Commission (${commPct}% of Base):</span> <strong style="color: #10b981;">+ ${fmt(agencyFee)}</strong>
      </li>
      ${discount > 0 ? `
      <li style="display: flex; justify-content: space-between;">
        <span>Customer Discount:</span> <strong style="color: #ef4444;">- ${fmt(discount)}</strong>
      </li>` : ''}
    `;
  }

  elements.calculateBtn.addEventListener('click', calculateFare);
  
  // Calculate on input change
  const inputs = document.querySelectorAll('.input-element');
  inputs.forEach(inp => {
    inp.addEventListener('input', calculateFare);
  });

  // Initial Calculation
  calculateFare();
});
