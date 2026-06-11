document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const inputs = {
    stock: document.getElementById('val-stock'),
    dailySales: document.getElementById('val-daily-sales'),
    cost: document.getElementById('val-cost'),
    leadTime: document.getElementById('val-lead-time'),
    safety: document.getElementById('val-safety')
  };

  const results = {
    daysRemaining: document.getElementById('res-days-remaining'),
    status: document.getElementById('res-status'),
    rop: document.getElementById('res-rop'),
    safetyUnits: document.getElementById('res-safety-units'),
    invValue: document.getElementById('res-inv-value'),
    velocity: document.getElementById('res-velocity')
  };

  const currencyBtns = document.querySelectorAll('.currency-btn');
  const inputIcons = document.querySelectorAll('.input-icon');

  let currencySymbol = '৳';

  // Format Currency
  function fmt(val) {
    const hasDecimals = val % 1 !== 0;
    return `${currencySymbol} ${val.toLocaleString('en-US', { 
      minimumFractionDigits: hasDecimals ? 2 : 0, 
      maximumFractionDigits: hasDecimals ? 2 : 0 
    })}`;
  }

  // Calculate
  function calculate() {
    const stock = parseInt(inputs.stock.value) || 0;
    const dailySales = parseFloat(inputs.dailySales.value) || 0;
    const cost = parseFloat(inputs.cost.value) || 0;
    const leadTime = parseInt(inputs.leadTime.value) || 0;
    const safetyDays = parseInt(inputs.safety.value) || 0;

    // 1. Days of Stock Remaining
    let daysRemaining = 0;
    if (dailySales > 0) {
      daysRemaining = stock / dailySales;
    }

    // 2. Safety Stock (Units)
    const safetyUnits = safetyDays * dailySales;

    // 3. Reorder Point (Lead time demand + safety stock)
    const leadTimeDemand = leadTime * dailySales;
    const rop = leadTimeDemand + safetyUnits;

    // 4. Inventory Value
    const invValue = stock * cost;

    // 5. Monthly Velocity
    const velocity = dailySales * 30;

    // Update UI
    if (dailySales > 0) {
      results.daysRemaining.textContent = `${Math.floor(daysRemaining)} Days`;
    } else {
      results.daysRemaining.textContent = 'N/A';
    }

    results.rop.textContent = `${Math.ceil(rop)} Units`;
    results.safetyUnits.textContent = `${Math.ceil(safetyUnits)} Units`;
    results.invValue.textContent = fmt(invValue);
    results.velocity.textContent = `${Math.ceil(velocity)} Units`;

    // Status logic
    if (stock <= rop) {
      if (stock <= safetyUnits) {
        results.status.textContent = 'Status: Critical / Out of Stock Risk';
        results.status.className = 'stat-subtext text-danger';
      } else {
        results.status.textContent = 'Status: Reorder Point Reached';
        results.status.className = 'stat-subtext text-warning';
      }
    } else {
      results.status.textContent = 'Status: Healthy Stock Level';
      results.status.className = 'stat-subtext text-success';
    }
  }

  // Currency Selector
  currencyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      currencyBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currencySymbol = e.target.getAttribute('data-currency');
      
      inputIcons.forEach(icon => icon.textContent = currencySymbol);
      calculate();
    });
  });

  // Listeners
  Object.values(inputs).forEach(input => {
    input.addEventListener('input', calculate);
  });

  // Init
  calculate();
});
