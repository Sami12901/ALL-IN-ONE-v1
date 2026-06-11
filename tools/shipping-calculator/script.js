document.addEventListener('DOMContentLoaded', () => {
  const inputs = {
    region: document.getElementById('s-region'),
    weight: document.getElementById('s-weight'),
    length: document.getElementById('s-length'),
    width: document.getElementById('s-width'),
    height: document.getElementById('s-height'),
    cod: document.getElementById('s-cod')
  };

  const results = {
    total: document.getElementById('r-total'),
    chargeWeight: document.getElementById('r-charge-weight'),
    base: document.getElementById('r-base'),
    extra: document.getElementById('r-extra'),
    codCharge: document.getElementById('r-cod-charge'),
    final: document.getElementById('r-final')
  };

  function calculate() {
    // 1. Get Values
    const actualWeight = parseFloat(inputs.weight.value) || 0;
    const l = parseFloat(inputs.length.value) || 0;
    const w = parseFloat(inputs.width.value) || 0;
    const h = parseFloat(inputs.height.value) || 0;
    const codAmt = parseFloat(inputs.cod.value) || 0;

    // 2. Volumetric Weight (L * W * H) / 5000 is standard
    const volWeight = (l * w * h) / 5000;

    // 3. Chargeable Weight is max of actual and volumetric, rounded up to nearest 0.5kg
    let rawChargeWeight = Math.max(actualWeight, volWeight);
    if (rawChargeWeight < 0.5) rawChargeWeight = 0.5;
    const chargeWeight = Math.ceil(rawChargeWeight * 2) / 2; // round up to nearest 0.5

    // 4. Region Pricing
    const selectedOption = inputs.region.options[inputs.region.selectedIndex];
    const basePrice = parseFloat(selectedOption.getAttribute('data-base'));
    const perKgExtra = parseFloat(selectedOption.getAttribute('data-kg'));

    // 5. Weight Cost
    let extraCost = 0;
    if (chargeWeight > 1) {
      extraCost = Math.ceil(chargeWeight - 1) * perKgExtra;
    }

    // 6. COD Cost (1%)
    const codCharge = codAmt * 0.01;

    // 7. Total
    const grandTotal = basePrice + extraCost + codCharge;

    // 8. Update UI
    results.chargeWeight.textContent = `${chargeWeight} KG`;
    results.base.textContent = `৳ ${basePrice}`;
    results.extra.textContent = `৳ ${extraCost}`;
    results.codCharge.textContent = `৳ ${codCharge.toFixed(2)}`;
    
    results.total.textContent = `৳ ${grandTotal.toFixed(2)}`;
    results.final.textContent = `৳ ${grandTotal.toFixed(2)}`;
  }

  // Listeners
  Object.values(inputs).forEach(input => {
    input.addEventListener('input', calculate);
  });
  inputs.region.addEventListener('change', calculate);

  // Init
  calculate();
});
