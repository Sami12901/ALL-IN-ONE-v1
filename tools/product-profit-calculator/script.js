// Product Profit Calculator Interactive Client-side Logic
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const currencySel = document.getElementById('calc-currency');
  const sellPriceInp = document.getElementById('inp-sell-price');
  const costPriceInp = document.getElementById('inp-cost-price');
  const shippingInp = document.getElementById('inp-shipping-cost');
  const packagingInp = document.getElementById('inp-packaging-cost');
  const adSpendInp = document.getElementById('inp-ad-spend');
  const marketFeePctInp = document.getElementById('inp-market-fee-pct');
  const marketFeeFixedInp = document.getElementById('inp-market-fee-fixed');
  const gatewayFeePctInp = document.getElementById('inp-gateway-fee-pct');
  const gatewayFeeFixedInp = document.getElementById('inp-gateway-fee-fixed');
  const taxPctInp = document.getElementById('inp-tax-pct');
  const monthlyUnitsInp = document.getElementById('inp-monthly-units');
  const btnReset = document.getElementById('btn-reset-calc');
  const presetChips = document.querySelectorAll('.preset-chip');

  // Outputs
  const outNetProfit = document.getElementById('out-net-profit');
  const outProfitStatus = document.getElementById('out-profit-status');
  const outProfitMargin = document.getElementById('out-profit-margin');
  const outMarkup = document.getElementById('out-markup');
  const outBreakeven = document.getElementById('out-breakeven');
  const outRoi = document.getElementById('out-roi');
  const healthBadge = document.getElementById('margin-health-badge');

  // Breakdown Bar Segments
  const barCogs = document.getElementById('bar-cogs');
  const barShipping = document.getElementById('bar-shipping');
  const barFees = document.getElementById('bar-fees');
  const barAds = document.getElementById('bar-ads');
  const barTax = document.getElementById('bar-tax');
  const barProfit = document.getElementById('bar-profit');

  // Legend Pcts
  const legCogs = document.getElementById('leg-cogs-pct');
  const legShip = document.getElementById('leg-ship-pct');
  const legFees = document.getElementById('leg-fees-pct');
  const legAds = document.getElementById('leg-ads-pct');
  const legTax = document.getElementById('leg-tax-pct');
  const legProfit = document.getElementById('leg-profit-pct');

  // Detail Table Rows
  const rowSellPrice = document.getElementById('row-sell-price');
  const rowCogs = document.getElementById('row-cogs');
  const rowShipping = document.getElementById('row-shipping');
  const rowFees = document.getElementById('row-fees');
  const rowAds = document.getElementById('row-ads');
  const rowTax = document.getElementById('row-tax');
  const rowTotalCost = document.getElementById('row-total-cost');
  const rowNetProfit = document.getElementById('row-net-profit');

  // Monthly Projections
  const projUnitCount = document.getElementById('proj-unit-count');
  const projRevenue = document.getElementById('proj-revenue');
  const projCosts = document.getElementById('proj-costs');
  const projProfit = document.getElementById('proj-profit');

  // Preset Configurations
  const presets = {
    amazon: {
      marketPct: 15.0,
      marketFixed: 0.0,
      gatewayPct: 0.0,
      gatewayFixed: 0.0
    },
    shopify: {
      marketPct: 0.0,
      marketFixed: 0.0,
      gatewayPct: 2.9,
      gatewayFixed: 0.30
    },
    ebay: {
      marketPct: 13.25,
      marketFixed: 0.30,
      gatewayPct: 0.0,
      gatewayFixed: 0.0
    },
    etsy: {
      marketPct: 6.5,
      marketFixed: 0.20,
      gatewayPct: 3.0,
      gatewayFixed: 0.25
    }
  };

  function fmtMoney(amount, curr) {
    const num = Number(amount) || 0;
    const sign = num < 0 ? '-' : '';
    return `${sign}${curr}${Math.abs(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function fmtPct(val) {
    const num = Number(val) || 0;
    return `${num.toFixed(1)}%`;
  }

  function calculate() {
    const curr = currencySel.value;
    const sellPrice = Math.max(0, parseFloat(sellPriceInp.value) || 0);
    const costPrice = Math.max(0, parseFloat(costPriceInp.value) || 0);
    const shipping = Math.max(0, parseFloat(shippingInp.value) || 0);
    const packaging = Math.max(0, parseFloat(packagingInp.value) || 0);
    const adSpend = Math.max(0, parseFloat(adSpendInp.value) || 0);

    const marketFeePct = Math.max(0, parseFloat(marketFeePctInp.value) || 0);
    const marketFeeFixed = Math.max(0, parseFloat(marketFeeFixedInp.value) || 0);
    const gatewayFeePct = Math.max(0, parseFloat(gatewayFeePctInp.value) || 0);
    const gatewayFeeFixed = Math.max(0, parseFloat(gatewayFeeFixedInp.value) || 0);
    const taxPct = Math.max(0, parseFloat(taxPctInp.value) || 0);
    const monthlyUnits = Math.max(1, parseInt(monthlyUnitsInp.value, 10) || 1);

    // Dynamic fee calculations based on sell price
    const marketFeeAmount = (sellPrice * (marketFeePct / 100)) + marketFeeFixed;
    const gatewayFeeAmount = (sellPrice * (gatewayFeePct / 100)) + gatewayFeeFixed;
    const totalFees = marketFeeAmount + gatewayFeeAmount;
    const taxAmount = sellPrice * (taxPct / 100);
    const shipPackAmount = shipping + packaging;

    const totalUnitCost = costPrice + shipPackAmount + totalFees + adSpend + taxAmount;
    const netProfit = sellPrice - totalUnitCost;

    // Metrics
    const marginPct = sellPrice > 0 ? (netProfit / sellPrice) * 100 : 0;
    const markupPct = costPrice > 0 ? ((sellPrice - costPrice) / costPrice) * 100 : 0;
    const roiPct = totalUnitCost > 0 ? (netProfit / totalUnitCost) * 100 : 0;

    // Breakeven price calculation
    const fixedCostsPerUnit = costPrice + shipPackAmount + adSpend + marketFeeFixed + gatewayFeeFixed;
    const variableFeeRate = (marketFeePct + gatewayFeePct + taxPct) / 100;
    let breakevenPrice = 0;
    if (variableFeeRate < 1) {
      breakevenPrice = Math.max(0, fixedCostsPerUnit / (1 - variableFeeRate));
    } else {
      breakevenPrice = NaN;
    }

    // Update KPI Displays
    outNetProfit.textContent = fmtMoney(netProfit, curr);
    outProfitMargin.textContent = fmtPct(marginPct);
    outMarkup.textContent = fmtPct(markupPct);
    outBreakeven.textContent = isNaN(breakevenPrice) ? 'N/A (>100% fees)' : fmtMoney(breakevenPrice, curr);
    outRoi.textContent = fmtPct(roiPct);

    // Style Net Profit text & status
    if (netProfit > 0) {
      outNetProfit.style.color = 'var(--success)';
      outProfitStatus.textContent = 'Positive Profit per Sale';
      outProfitStatus.style.color = 'var(--success)';
    } else if (netProfit === 0) {
      outNetProfit.style.color = 'var(--text-secondary)';
      outProfitStatus.textContent = 'Exact Breakeven ($0)';
      outProfitStatus.style.color = 'var(--text-secondary)';
    } else {
      outNetProfit.style.color = 'var(--error)';
      outProfitStatus.textContent = 'Warning: Selling at a Loss';
      outProfitStatus.style.color = 'var(--error)';
    }

    // Health Badge
    healthBadge.className = 'health-pill';
    if (netProfit <= 0) {
      healthBadge.classList.add('health-danger');
      healthBadge.textContent = 'Net Loss';
    } else if (marginPct < 15) {
      healthBadge.classList.add('health-warning');
      healthBadge.textContent = 'Low Margin (<15%)';
    } else if (marginPct < 30) {
      healthBadge.classList.add('health-good');
      healthBadge.textContent = 'Good Margin (15-30%)';
    } else {
      healthBadge.classList.add('health-great');
      healthBadge.textContent = 'High Margin (>30%)';
    }

    // Segmented Bar Calculation (normalize relative to sellPrice or totalUnitCost if in loss)
    const baseTotal = Math.max(sellPrice, totalUnitCost, 1);
    const cogsPctOfBase = (costPrice / baseTotal) * 100;
    const shipPctOfBase = (shipPackAmount / baseTotal) * 100;
    const feesPctOfBase = (totalFees / baseTotal) * 100;
    const adsPctOfBase = (adSpend / baseTotal) * 100;
    const taxPctOfBase = (taxAmount / baseTotal) * 100;
    const profitPctOfBase = netProfit > 0 ? (netProfit / baseTotal) * 100 : 0;
    const lossPctOfBase = netProfit < 0 ? (Math.abs(netProfit) / baseTotal) * 100 : 0;

    barCogs.style.width = `${Math.min(100, cogsPctOfBase)}%`;
    barShipping.style.width = `${Math.min(100, shipPctOfBase)}%`;
    barFees.style.width = `${Math.min(100, feesPctOfBase)}%`;
    barAds.style.width = `${Math.min(100, adsPctOfBase)}%`;
    barTax.style.width = `${Math.min(100, taxPctOfBase)}%`;

    if (netProfit >= 0) {
      barProfit.className = 'bar-segment bar-seg-profit';
      barProfit.style.width = `${Math.min(100, profitPctOfBase)}%`;
      legProfit.textContent = fmtPct(marginPct);
    } else {
      barProfit.className = 'bar-segment bar-seg-loss';
      barProfit.style.width = `${Math.min(100, lossPctOfBase)}%`;
      legProfit.textContent = `-${fmtPct(Math.abs(marginPct))} (Loss)`;
    }

    legCogs.textContent = fmtPct(sellPrice > 0 ? (costPrice / sellPrice) * 100 : 0);
    legShip.textContent = fmtPct(sellPrice > 0 ? (shipPackAmount / sellPrice) * 100 : 0);
    legFees.textContent = fmtPct(sellPrice > 0 ? (totalFees / sellPrice) * 100 : 0);
    legAds.textContent = fmtPct(sellPrice > 0 ? (adSpend / sellPrice) * 100 : 0);
    legTax.textContent = fmtPct(sellPrice > 0 ? (taxAmount / sellPrice) * 100 : 0);

    // Detail Table
    rowSellPrice.textContent = fmtMoney(sellPrice, curr);
    rowCogs.textContent = fmtMoney(costPrice, curr);
    rowShipping.textContent = fmtMoney(shipPackAmount, curr);
    rowFees.textContent = fmtMoney(totalFees, curr);
    rowAds.textContent = fmtMoney(adSpend, curr);
    rowTax.textContent = fmtMoney(taxAmount, curr);
    rowTotalCost.textContent = fmtMoney(totalUnitCost, curr);
    rowNetProfit.textContent = `${netProfit >= 0 ? '+' : ''}${fmtMoney(netProfit, curr)}`;
    rowNetProfit.style.color = netProfit >= 0 ? 'var(--success)' : 'var(--error)';

    // Monthly Projections
    projUnitCount.textContent = monthlyUnits.toLocaleString();
    const monthlyRev = sellPrice * monthlyUnits;
    const monthlyCost = totalUnitCost * monthlyUnits;
    const monthlyProf = netProfit * monthlyUnits;

    projRevenue.textContent = fmtMoney(monthlyRev, curr);
    projCosts.textContent = fmtMoney(monthlyCost, curr);
    projProfit.textContent = `${monthlyProf >= 0 ? '+' : ''}${fmtMoney(monthlyProf, curr)}`;
    projProfit.style.color = monthlyProf >= 0 ? 'var(--success)' : 'var(--error)';
  }

  // Presets handling
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      presetChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const presetKey = chip.dataset.preset;
      if (presetKey && presets[presetKey]) {
        const p = presets[presetKey];
        marketFeePctInp.value = p.marketPct;
        marketFeeFixedInp.value = p.marketFixed.toFixed(2);
        gatewayFeePctInp.value = p.gatewayPct;
        gatewayFeeFixedInp.value = p.gatewayFixed.toFixed(2);
      }
      calculate();
    });
  });

  // Highlight 'Custom' if user modifies fee inputs directly
  [marketFeePctInp, marketFeeFixedInp, gatewayFeePctInp, gatewayFeeFixedInp].forEach(inp => {
    inp.addEventListener('input', () => {
      presetChips.forEach(c => {
        if (c.dataset.preset === 'custom') c.classList.add('active');
        else c.classList.remove('active');
      });
    });
  });

  // All inputs trigger live recalculation
  const allInputs = [
    currencySel, sellPriceInp, costPriceInp, shippingInp,
    packagingInp, adSpendInp, marketFeePctInp, marketFeeFixedInp,
    gatewayFeePctInp, gatewayFeeFixedInp, taxPctInp, monthlyUnitsInp
  ];

  allInputs.forEach(inp => {
    inp.addEventListener('input', calculate);
    inp.addEventListener('change', calculate);
  });

  // Reset Button
  btnReset.addEventListener('click', () => {
    sellPriceInp.value = '49.99';
    costPriceInp.value = '14.50';
    shippingInp.value = '4.80';
    packagingInp.value = '1.20';
    adSpendInp.value = '6.50';
    taxPctInp.value = '0.0';
    monthlyUnitsInp.value = '100';

    // Reset to Amazon preset
    presetChips.forEach(c => {
      if (c.dataset.preset === 'amazon') c.classList.add('active');
      else c.classList.remove('active');
    });

    marketFeePctInp.value = '15.0';
    marketFeeFixedInp.value = '0.00';
    gatewayFeePctInp.value = '0.0';
    gatewayFeeFixedInp.value = '0.00';

    calculate();
  });

  // Initial calculation
  calculate();
});