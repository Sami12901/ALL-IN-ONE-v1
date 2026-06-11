document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const inputs = {
    sell: document.getElementById('val-sell'),
    cost: document.getElementById('val-cost'),
    ship: document.getElementById('val-ship'),
    ad: document.getElementById('val-ad'),
    fees: document.getElementById('val-fees')
  };

  const results = {
    net: document.getElementById('res-net'),
    margin: document.getElementById('res-margin'),
    roi: document.getElementById('res-roi'),
    summRev: document.getElementById('summ-rev'),
    summCosts: document.getElementById('summ-costs'),
    summNet: document.getElementById('summ-net')
  };

  const netCard = document.getElementById('net-card');
  const currencyBtns = document.querySelectorAll('.currency-btn');
  const inputIcons = document.querySelectorAll('.input-icon');

  let currencySymbol = '৳';

  // Format Currency
  function fmt(val) {
    return `${currencySymbol} ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // Calculate
  function calculate() {
    const sell = parseFloat(inputs.sell.value) || 0;
    const cost = parseFloat(inputs.cost.value) || 0;
    const ship = parseFloat(inputs.ship.value) || 0;
    const ad = parseFloat(inputs.ad.value) || 0;
    const fees = parseFloat(inputs.fees.value) || 0;

    const totalCosts = cost + ship + ad + fees;
    const netProfit = sell - totalCosts;

    // Margin = Net / Revenue
    let margin = 0;
    if (sell > 0) {
      margin = (netProfit / sell) * 100;
    }

    // ROI = Net / Cost of Goods Sold + Marketing etc
    let roi = 0;
    if (totalCosts > 0) {
      roi = (netProfit / totalCosts) * 100;
    }

    // Update UI
    results.net.textContent = fmt(netProfit);
    results.margin.textContent = `${margin.toFixed(2)}%`;
    results.roi.textContent = `${roi.toFixed(2)}%`;

    results.summRev.textContent = fmt(sell);
    results.summCosts.textContent = `- ${fmt(totalCosts)}`;
    results.summNet.textContent = fmt(netProfit);

    // Styling based on profit/loss
    if (netProfit < 0) {
      netCard.classList.remove('highlight');
      netCard.classList.add('loss');
      results.summNet.style.color = '#ef4444';
    } else {
      netCard.classList.remove('loss');
      netCard.classList.add('highlight');
      results.summNet.style.color = 'var(--ecom-primary)';
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
