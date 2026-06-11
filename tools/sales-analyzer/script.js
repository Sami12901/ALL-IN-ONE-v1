document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const inputs = {
    rev: document.getElementById('val-rev'),
    orders: document.getElementById('val-orders'),
    cogs: document.getElementById('val-cogs'),
    ad: document.getElementById('val-ad'),
    opex: document.getElementById('val-opex')
  };

  const results = {
    net: document.getElementById('res-net'),
    margin: document.getElementById('res-margin'),
    aov: document.getElementById('res-aov'),
    gross: document.getElementById('res-gross'),
    roas: document.getElementById('res-roas'),
    beRoas: document.getElementById('res-be-roas')
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
    const rev = parseFloat(inputs.rev.value) || 0;
    const orders = parseInt(inputs.orders.value) || 0;
    const cogs = parseFloat(inputs.cogs.value) || 0;
    const ad = parseFloat(inputs.ad.value) || 0;
    const opex = parseFloat(inputs.opex.value) || 0;

    // Gross Profit
    const gross = rev - cogs;
    
    // Net Profit
    const totalCosts = cogs + ad + opex;
    const net = rev - totalCosts;

    // Margin
    let margin = 0;
    if (rev > 0) margin = (net / rev) * 100;

    // AOV
    let aov = 0;
    if (orders > 0) aov = rev / orders;

    // ROAS (Return on Ad Spend)
    let roas = 0;
    if (ad > 0) roas = rev / ad;

    // Break-Even ROAS
    // BE ROAS = 1 / Gross Margin %
    let grossMarginPercent = 0;
    let beRoas = 0;
    if (rev > 0) {
      grossMarginPercent = gross / rev;
      if (grossMarginPercent > 0) {
        beRoas = 1 / grossMarginPercent;
      }
    }

    // Update UI
    results.net.textContent = fmt(net);
    results.margin.textContent = `Net Margin: ${margin.toFixed(2)}%`;
    results.aov.textContent = fmt(aov);
    results.gross.textContent = fmt(gross);
    results.roas.textContent = `${roas.toFixed(2)}x`;
    
    if (beRoas > 0) {
      results.beRoas.textContent = `${beRoas.toFixed(2)}x`;
    } else {
      results.beRoas.textContent = 'N/A';
    }

    // Styling based on net
    if (net < 0) {
      results.net.style.color = '#ef4444'; // Red
      results.margin.style.color = '#ef4444';
    } else {
      results.net.style.color = 'var(--ecom-primary)';
      results.margin.style.color = 'var(--ecom-primary)';
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
