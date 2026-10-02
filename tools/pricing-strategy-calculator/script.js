// Pricing Strategy Calculator Logic
// Compares Cost-Plus, Value-Based, Competitor-Based, and Luxury Prestige Markup models

const PRESETS = {
  'haute-horlogerie': {
    unitCost: 650,
    perceivedValue: 4800,
    comp1: 3200,
    comp2: 4100,
    comp3: 5200,
    fixedCosts: 120000,
    costPlusMarkup: 60,
    valueCapture: 75,
    compPositioning: 15,
    luxuryMultiplier: 8.5
  },
  'artisan-leather': {
    unitCost: 180,
    perceivedValue: 1250,
    comp1: 750,
    comp2: 920,
    comp3: 1100,
    fixedCosts: 45000,
    costPlusMarkup: 70,
    valueCapture: 80,
    compPositioning: 10,
    luxuryMultiplier: 6.0
  },
  'niche-fragrance': {
    unitCost: 32,
    perceivedValue: 340,
    comp1: 220,
    comp2: 275,
    comp3: 360,
    fixedCosts: 35000,
    costPlusMarkup: 150,
    valueCapture: 85,
    compPositioning: 20,
    luxuryMultiplier: 9.5
  },
  'fine-jewelry': {
    unitCost: 1400,
    perceivedValue: 9500,
    comp1: 6500,
    comp2: 8200,
    comp3: 10500,
    fixedCosts: 180000,
    costPlusMarkup: 80,
    valueCapture: 85,
    compPositioning: 15,
    luxuryMultiplier: 7.0
  },
  'designer-fashion': {
    unitCost: 120,
    perceivedValue: 680,
    comp1: 450,
    comp2: 520,
    comp3: 650,
    fixedCosts: 60000,
    costPlusMarkup: 100,
    valueCapture: 70,
    compPositioning: 5,
    luxuryMultiplier: 5.0
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const currencySelector = document.getElementById('currency-selector');
  const unitCostInput = document.getElementById('unit-cost');
  const perceivedValueInput = document.getElementById('perceived-value');
  const comp1Input = document.getElementById('comp-1');
  const comp2Input = document.getElementById('comp-2');
  const comp3Input = document.getElementById('comp-3');
  const compAvgDisplay = document.getElementById('comp-avg-display');
  const fixedCostsInput = document.getElementById('fixed-costs');

  // Sliders & value displays
  const costPlusMarkupSlider = document.getElementById('cost-plus-markup');
  const costPlusMarkupVal = document.getElementById('cost-plus-markup-val');
  const valueCaptureSlider = document.getElementById('value-capture-ratio');
  const valueCaptureVal = document.getElementById('value-capture-ratio-val');
  const compPositioningSlider = document.getElementById('competitor-positioning');
  const compPositioningVal = document.getElementById('competitor-positioning-val');
  const luxuryMultiplierSlider = document.getElementById('luxury-multiplier');
  const luxuryMultiplierVal = document.getElementById('luxury-multiplier-val');

  // Recommendation Elements
  const recommendedStrategyName = document.getElementById('recommended-strategy-name');
  const recommendedStrategyReason = document.getElementById('recommended-strategy-reason');

  // Cards
  const cardCostPlus = document.getElementById('card-cost-plus');
  const cardValueBased = document.getElementById('card-value-based');
  const cardCompetitor = document.getElementById('card-competitor');
  const cardLuxuryPrestige = document.getElementById('card-luxury-prestige');

  // Card Outputs: Cost Plus
  const costPlusPriceEl = document.getElementById('cost-plus-price');
  const costPlusMarginEl = document.getElementById('cost-plus-margin');
  const costPlusProfitEl = document.getElementById('cost-plus-profit');
  const costPlusMarkupStatEl = document.getElementById('cost-plus-markup-stat');
  const costPlusBreakevenEl = document.getElementById('cost-plus-breakeven');

  // Card Outputs: Value Based
  const valueBasedPriceEl = document.getElementById('value-based-price');
  const valueBasedMarginEl = document.getElementById('value-based-margin');
  const valueBasedProfitEl = document.getElementById('value-based-profit');
  const valueSurplusEl = document.getElementById('value-surplus');
  const valueBasedBreakevenEl = document.getElementById('value-based-breakeven');

  // Card Outputs: Competitor Based
  const competitorPriceEl = document.getElementById('competitor-price');
  const competitorMarginEl = document.getElementById('competitor-margin');
  const competitorProfitEl = document.getElementById('competitor-profit');
  const competitorDiffEl = document.getElementById('competitor-diff');
  const competitorBreakevenEl = document.getElementById('competitor-breakeven');

  // Card Outputs: Luxury Prestige
  const luxuryPriceEl = document.getElementById('luxury-price');
  const luxuryMarginEl = document.getElementById('luxury-margin');
  const luxuryProfitEl = document.getElementById('luxury-profit');
  const luxuryMultStatEl = document.getElementById('luxury-mult-stat');
  const luxuryBreakevenEl = document.getElementById('luxury-breakeven');

  // Matrix tbody
  const matrixTbody = document.getElementById('matrix-tbody');

  // Buttons
  const resetBtn = document.getElementById('reset-inputs-btn');
  const copyBtn = document.getElementById('copy-summary-btn');
  const exportCsvBtn = document.getElementById('export-csv-btn');
  const presetChips = document.querySelectorAll('.preset-chip');

  // State
  let currentCurrency = '$';

  // Currency Formatter
  function formatMoney(amount) {
    if (isNaN(amount) || !isFinite(amount)) return `${currentCurrency}0`;
    const formatted = Math.round(amount).toLocaleString('en-US');
    return `${currentCurrency}${formatted}`;
  }

  function updateCurrencyLabels() {
    currentCurrency = currencySelector.value;
    document.querySelectorAll('.curr-sign').forEach(el => {
      el.textContent = currentCurrency.trim();
    });
  }

  // Calculation Engine
  function calculate() {
    const unitCost = Math.max(0, parseFloat(unitCostInput.value) || 0);
    const perceivedValue = Math.max(0, parseFloat(perceivedValueInput.value) || 0);
    const fixedCosts = Math.max(0, parseFloat(fixedCostsInput.value) || 0);

    const comp1 = parseFloat(comp1Input.value) || 0;
    const comp2 = parseFloat(comp2Input.value) || 0;
    const comp3 = parseFloat(comp3Input.value) || 0;
    const validComps = [comp1, comp2, comp3].filter(c => c > 0);
    const compAvg = validComps.length > 0 ? (validComps.reduce((a, b) => a + b, 0) / validComps.length) : unitCost * 3;

    compAvgDisplay.textContent = formatMoney(compAvg);

    // Sliders
    const costPlusMarkup = parseFloat(costPlusMarkupSlider.value) || 0;
    const valueCapture = parseFloat(valueCaptureSlider.value) || 0;
    const compPositioning = parseFloat(compPositioningSlider.value) || 0;
    const luxuryMultiplier = parseFloat(luxuryMultiplierSlider.value) || 1;

    // Sliders Label Updates
    costPlusMarkupVal.textContent = `${costPlusMarkup}%`;
    valueCaptureVal.textContent = `${valueCapture}%`;
    compPositioningVal.textContent = `${compPositioning >= 0 ? '+' : ''}${compPositioning}% (${compPositioning > 0 ? 'Premium' : compPositioning === 0 ? 'Parity' : 'Discount'})`;
    luxuryMultiplierVal.textContent = `${luxuryMultiplier.toFixed(1)}x`;

    // 1. Cost-Plus Model
    const costPlusPrice = unitCost * (1 + costPlusMarkup / 100);
    const costPlusProfit = costPlusPrice - unitCost;
    const costPlusMargin = costPlusPrice > 0 ? (costPlusProfit / costPlusPrice) * 100 : 0;
    const costPlusBreakeven = costPlusProfit > 0 ? Math.ceil(fixedCosts / costPlusProfit) : 'N/A';

    // 2. Value-Based Model
    const valueBasedPrice = perceivedValue * (valueCapture / 100);
    const valueBasedProfit = valueBasedPrice - unitCost;
    const valueBasedMargin = valueBasedPrice > 0 ? (valueBasedProfit / valueBasedPrice) * 100 : 0;
    const valueSurplus = Math.max(0, perceivedValue - valueBasedPrice);
    const valueBasedBreakeven = valueBasedProfit > 0 ? Math.ceil(fixedCosts / valueBasedProfit) : 'N/A';

    // 3. Competitor-Based Model
    const competitorPrice = compAvg * (1 + compPositioning / 100);
    const competitorProfit = competitorPrice - unitCost;
    const competitorMargin = competitorPrice > 0 ? (competitorProfit / competitorPrice) * 100 : 0;
    const competitorDiff = competitorPrice - compAvg;
    const competitorBreakeven = competitorProfit > 0 ? Math.ceil(fixedCosts / competitorProfit) : 'N/A';

    // 4. Luxury Prestige Markup Model
    const luxuryPrice = unitCost * luxuryMultiplier;
    const luxuryProfit = luxuryPrice - unitCost;
    const luxuryMargin = luxuryPrice > 0 ? (luxuryProfit / luxuryPrice) * 100 : 0;
    const luxuryBreakeven = luxuryProfit > 0 ? Math.ceil(fixedCosts / luxuryProfit) : 'N/A';

    // Render Cards
    costPlusPriceEl.textContent = formatMoney(costPlusPrice);
    costPlusMarginEl.textContent = `${costPlusMargin.toFixed(1)}%`;
    costPlusProfitEl.textContent = formatMoney(costPlusProfit);
    costPlusMarkupStatEl.textContent = `${costPlusMarkup.toFixed(1)}%`;
    costPlusBreakevenEl.textContent = typeof costPlusBreakeven === 'number' ? `${costPlusBreakeven.toLocaleString()} units` : 'N/A';

    valueBasedPriceEl.textContent = formatMoney(valueBasedPrice);
    valueBasedMarginEl.textContent = `${valueBasedMargin.toFixed(1)}%`;
    valueBasedProfitEl.textContent = formatMoney(valueBasedProfit);
    valueSurplusEl.textContent = formatMoney(valueSurplus);
    valueBasedBreakevenEl.textContent = typeof valueBasedBreakeven === 'number' ? `${valueBasedBreakeven.toLocaleString()} units` : 'N/A';

    competitorPriceEl.textContent = formatMoney(competitorPrice);
    competitorMarginEl.textContent = `${competitorMargin.toFixed(1)}%`;
    competitorProfitEl.textContent = formatMoney(competitorProfit);
    competitorDiffEl.textContent = `${competitorDiff >= 0 ? '+' : ''}${formatMoney(competitorDiff)}`;
    competitorBreakevenEl.textContent = typeof competitorBreakeven === 'number' ? `${competitorBreakeven.toLocaleString()} units` : 'N/A';

    luxuryPriceEl.textContent = formatMoney(luxuryPrice);
    luxuryMarginEl.textContent = `${luxuryMargin.toFixed(1)}%`;
    luxuryProfitEl.textContent = formatMoney(luxuryProfit);
    luxuryMultStatEl.textContent = `${luxuryMultiplier.toFixed(1)}x`;
    luxuryBreakevenEl.textContent = typeof luxuryBreakeven === 'number' ? `${luxuryBreakeven.toLocaleString()} units` : 'N/A';

    // Determine Best Recommendation
    let bestStrategyKey = 'luxury';
    let recommendationTitle = 'Luxury Prestige Markup';
    let recommendationReason = 'High perceived value unlocks superior Veblen status pricing.';

    const valueRatio = unitCost > 0 ? perceivedValue / unitCost : 1;

    if (valueRatio >= 4.5 && luxuryMultiplier >= 5.0) {
      bestStrategyKey = 'luxury';
      recommendationTitle = 'Luxury Prestige Markup';
      recommendationReason = `With perceived value at ${valueRatio.toFixed(1)}x cost and a ${luxuryMultiplier.toFixed(1)}x brand multiplier, prestige pricing maximizes brand equity and luxury margins.`;
    } else if (perceivedValue > unitCost * 2.2) {
      bestStrategyKey = 'value';
      recommendationTitle = 'Value-Based Pricing';
      recommendationReason = `High willingness-to-pay enables capturing ${valueCapture}% of customer utility, yielding optimal profits without excessive volume dependency.`;
    } else if (compAvg > unitCost * 1.5) {
      bestStrategyKey = 'competitor';
      recommendationTitle = 'Competitor-Based (Premium Positioning)';
      recommendationReason = 'Competitive landscape is established; benchmark positioning ensures market relevance while signaling premium craftsmanship.';
    } else {
      bestStrategyKey = 'costplus';
      recommendationTitle = 'Cost-Plus Pricing';
      recommendationReason = 'Conservative safety baseline ensuring positive operational margin over wholesale manufacturing costs.';
    }

    recommendedStrategyName.textContent = recommendationTitle;
    recommendedStrategyReason.textContent = recommendationReason;

    // Update Card Active Highlights
    [cardCostPlus, cardValueBased, cardCompetitor, cardLuxuryPrestige].forEach(card => card.classList.remove('recommended-card'));
    if (bestStrategyKey === 'costplus') cardCostPlus.classList.add('recommended-card');
    if (bestStrategyKey === 'value') cardValueBased.classList.add('recommended-card');
    if (bestStrategyKey === 'competitor') cardCompetitor.classList.add('recommended-card');
    if (bestStrategyKey === 'luxury') cardLuxuryPrestige.classList.add('recommended-card');

    // Render Decision Matrix Table
    const strategiesData = [
      {
        key: 'costplus',
        name: 'Cost-Plus',
        price: costPlusPrice,
        margin: costPlusMargin,
        breakeven: costPlusBreakeven,
        volume: 'High Volume',
        risk: 'Leaves money on table; ignores customer willingness to pay',
        pillClass: bestStrategyKey === 'costplus' ? 'pill-green' : 'pill-blue',
        suitability: bestStrategyKey === 'costplus' ? 'Recommended Match' : 'Wholesale / Baseline'
      },
      {
        key: 'value',
        name: 'Value-Based',
        price: valueBasedPrice,
        margin: valueBasedMargin,
        breakeven: valueBasedBreakeven,
        volume: 'Medium Volume',
        risk: 'Misjudging perceived value may cause friction or churn',
        pillClass: bestStrategyKey === 'value' ? 'pill-green' : 'pill-blue',
        suitability: bestStrategyKey === 'value' ? 'Recommended Match' : 'High Differentiation'
      },
      {
        key: 'competitor',
        name: 'Competitor-Based',
        price: competitorPrice,
        margin: competitorMargin,
        breakeven: competitorBreakeven,
        volume: 'Medium Volume',
        risk: 'Vulnerable to peer price cuts and commoditization traps',
        pillClass: bestStrategyKey === 'competitor' ? 'pill-green' : 'pill-amber',
        suitability: bestStrategyKey === 'competitor' ? 'Recommended Match' : 'Crowded Market'
      },
      {
        key: 'luxury',
        name: 'Luxury Prestige Markup',
        price: luxuryPrice,
        margin: luxuryMargin,
        breakeven: luxuryBreakeven,
        volume: 'Ultra-Exclusive (Low)',
        risk: 'Requires flawless branding, bespoke service & heritage credibility',
        pillClass: bestStrategyKey === 'luxury' ? 'pill-green' : 'pill-purple',
        suitability: bestStrategyKey === 'luxury' ? 'Recommended Match' : 'Luxury Atelier'
      }
    ];

    matrixTbody.innerHTML = strategiesData.map(s => `
      <tr style="${s.key === bestStrategyKey ? 'background: rgba(78, 133, 191, 0.08); font-weight: 500;' : ''}">
        <td><strong>${s.name}</strong> ${s.key === bestStrategyKey ? '⭐' : ''}</td>
        <td style="font-family: monospace; font-weight: 700; color: var(--accent);">${formatMoney(s.price)}</td>
        <td style="font-family: monospace;">${s.margin.toFixed(1)}%</td>
        <td style="font-family: monospace;">${typeof s.breakeven === 'number' ? s.breakeven.toLocaleString() : 'N/A'}</td>
        <td><span style="color: var(--text-secondary); font-size: 0.8rem;">${s.volume}</span></td>
        <td><span style="color: var(--text-tertiary); font-size: 0.8rem;">${s.risk}</span></td>
        <td><span class="status-pill ${s.pillClass}">${s.suitability}</span></td>
      </tr>
    `).join('');

    return {
      unitCost,
      perceivedValue,
      fixedCosts,
      compAvg,
      costPlusPrice,
      costPlusMargin,
      costPlusBreakeven,
      valueBasedPrice,
      valueBasedMargin,
      valueBasedBreakeven,
      competitorPrice,
      competitorMargin,
      competitorBreakeven,
      luxuryPrice,
      luxuryMargin,
      luxuryBreakeven,
      bestStrategyKey,
      recommendationTitle
    };
  }

  // Apply Presets
  function applyPreset(presetKey) {
    const data = PRESETS[presetKey];
    if (!data) return;

    unitCostInput.value = data.unitCost;
    perceivedValueInput.value = data.perceivedValue;
    comp1Input.value = data.comp1;
    comp2Input.value = data.comp2;
    comp3Input.value = data.comp3;
    fixedCostsInput.value = data.fixedCosts;
    costPlusMarkupSlider.value = data.costPlusMarkup;
    valueCaptureSlider.value = data.valueCapture;
    compPositioningSlider.value = data.compPositioning;
    luxuryMultiplierSlider.value = data.luxuryMultiplier;

    presetChips.forEach(chip => {
      chip.classList.toggle('active', chip.dataset.preset === presetKey);
    });

    calculate();
  }

  // Event Listeners
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      applyPreset(chip.dataset.preset);
    });
  });

  const inputs = [
    unitCostInput, perceivedValueInput, comp1Input, comp2Input, comp3Input, fixedCostsInput,
    costPlusMarkupSlider, valueCaptureSlider, compPositioningSlider, luxuryMultiplierSlider
  ];

  inputs.forEach(input => {
    input.addEventListener('input', calculate);
  });

  currencySelector.addEventListener('change', () => {
    updateCurrencyLabels();
    calculate();
  });

  resetBtn.addEventListener('click', () => {
    applyPreset('haute-horlogerie');
  });

  // Copy Summary
  copyBtn.addEventListener('click', () => {
    const res = calculate();
    const text = `=== PRICING STRATEGY EXECUTIVE SUMMARY ===
Base Parameters:
- Currency: ${currentCurrency.trim()}
- Unit Cost: ${formatMoney(res.unitCost)}
- Perceived Value: ${formatMoney(res.perceivedValue)}
- Competitor Benchmark Avg: ${formatMoney(res.compAvg)}
- Annual Fixed Costs: ${formatMoney(res.fixedCosts)}

Model Comparison:
1. Cost-Plus Pricing:
   - Recommended Price: ${formatMoney(res.costPlusPrice)}
   - Gross Margin: ${res.costPlusMargin.toFixed(1)}%
   - Breakeven Volume: ${typeof res.costPlusBreakeven === 'number' ? res.costPlusBreakeven.toLocaleString() + ' units' : 'N/A'}

2. Value-Based Pricing:
   - Recommended Price: ${formatMoney(res.valueBasedPrice)}
   - Gross Margin: ${res.valueBasedMargin.toFixed(1)}%
   - Breakeven Volume: ${typeof res.valueBasedBreakeven === 'number' ? res.valueBasedBreakeven.toLocaleString() + ' units' : 'N/A'}

3. Competitor-Based Pricing:
   - Recommended Price: ${formatMoney(res.competitorPrice)}
   - Gross Margin: ${res.competitorMargin.toFixed(1)}%
   - Breakeven Volume: ${typeof res.competitorBreakeven === 'number' ? res.competitorBreakeven.toLocaleString() + ' units' : 'N/A'}

4. Luxury Prestige Markup:
   - Recommended Price: ${formatMoney(res.luxuryPrice)}
   - Gross Margin: ${res.luxuryMargin.toFixed(1)}%
   - Breakeven Volume: ${typeof res.luxuryBreakeven === 'number' ? res.luxuryBreakeven.toLocaleString() + ' units' : 'N/A'}

Recommended Strategy: ${res.recommendationTitle}
==========================================`;

    navigator.clipboard.writeText(text).then(() => {
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = `✓ Copied!`;
      copyBtn.style.borderColor = 'var(--success)';
      copyBtn.style.color = 'var(--success)';
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.style.borderColor = '';
        copyBtn.style.color = '';
      }, 2000);
    });
  });

  // Export CSV
  exportCsvBtn.addEventListener('click', () => {
    const res = calculate();
    const csvRows = [
      ['Strategy Model', 'Price', 'Gross Margin (%)', 'Breakeven Volume (Units)', 'Unit Cost', 'Fixed Costs'],
      ['Cost-Plus', Math.round(res.costPlusPrice), res.costPlusMargin.toFixed(2), res.costPlusBreakeven, res.unitCost, res.fixedCosts],
      ['Value-Based', Math.round(res.valueBasedPrice), res.valueBasedMargin.toFixed(2), res.valueBasedBreakeven, res.unitCost, res.fixedCosts],
      ['Competitor-Based', Math.round(res.competitorPrice), res.competitorMargin.toFixed(2), res.competitorBreakeven, res.unitCost, res.fixedCosts],
      ['Luxury Prestige', Math.round(res.luxuryPrice), res.luxuryMargin.toFixed(2), res.luxuryBreakeven, res.unitCost, res.fixedCosts]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'pricing_strategy_comparison.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Initial Run
  updateCurrencyLabels();
  calculate();
});