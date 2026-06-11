document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const inputs = {
    total: document.getElementById('val-total'),
    success: document.getElementById('val-success'),
    returned: document.getElementById('val-return'),
    cancelled: document.getElementById('val-cancel'),
    aov: document.getElementById('val-aov')
  };

  const results = {
    successRate: document.getElementById('res-success-rate'),
    returnRate: document.getElementById('res-return-rate'),
    cancelRate: document.getElementById('res-cancel-rate'),
    revenue: document.getElementById('res-revenue'),
    lostRevenue: document.getElementById('res-lost-revenue')
  };

  const currencyBtns = document.querySelectorAll('.currency-btn');
  const inputIcons = document.querySelectorAll('.input-icon');

  let currencySymbol = '৳';

  // Format Currency
  function fmt(val) {
    // Determine if we need decimals
    const hasDecimals = val % 1 !== 0;
    return `${currencySymbol} ${val.toLocaleString('en-US', { 
      minimumFractionDigits: hasDecimals ? 2 : 0, 
      maximumFractionDigits: hasDecimals ? 2 : 0 
    })}`;
  }

  // Calculate
  function calculate() {
    const total = parseInt(inputs.total.value) || 0;
    const success = parseInt(inputs.success.value) || 0;
    const returned = parseInt(inputs.returned.value) || 0;
    const cancelled = parseInt(inputs.cancelled.value) || 0;
    const aov = parseFloat(inputs.aov.value) || 0;

    let successRate = 0;
    let returnRate = 0;
    let cancelRate = 0;

    if (total > 0) {
      successRate = (success / total) * 100;
      returnRate = (returned / total) * 100;
      cancelRate = (cancelled / total) * 100;
    }

    const estimatedRevenue = success * aov;
    const lostRevenue = returned * aov;

    // Update UI
    results.successRate.textContent = `${successRate.toFixed(1)}%`;
    results.returnRate.textContent = `${returnRate.toFixed(1)}%`;
    results.cancelRate.textContent = `${cancelRate.toFixed(1)}%`;

    results.revenue.textContent = fmt(estimatedRevenue);
    results.lostRevenue.textContent = `Lost to Returns: ${fmt(lostRevenue)}`;
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
