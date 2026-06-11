document.addEventListener('DOMContentLoaded', () => {
  // Inputs
  const baseCostInput = document.getElementById('base-cost');
  const overheadCostInput = document.getElementById('overhead-cost');
  const marketingCostInput = document.getElementById('marketing-cost');
  const targetMarginInput = document.getElementById('target-margin');
  const brandMultiplierInput = document.getElementById('brand-multiplier');
  const psyPricingCheckbox = document.getElementById('psy-pricing');
  
  // Displays
  const marginVal = document.getElementById('margin-val');
  const multiplierVal = document.getElementById('multiplier-val');
  const totalCostDisplay = document.getElementById('total-cost-display');
  
  // Standard Tier
  const tierStandardPrice = document.getElementById('tier-standard-price');
  const tierStandardCost = document.getElementById('tier-standard-cost');
  const tierStandardProfit = document.getElementById('tier-standard-profit');
  
  // Luxury Tier
  const tierLuxuryPrice = document.getElementById('tier-luxury-price');
  const tierLuxuryCost = document.getElementById('tier-luxury-cost');
  const tierLuxuryProfit = document.getElementById('tier-luxury-profit');
  const tierLuxuryMarginPct = document.getElementById('tier-luxury-margin-pct');
  
  const insightText = document.getElementById('insight-text');

  // Format currency helper
  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  // Apply Psychological Pricing (.99)
  function applyPsychologicalPricing(price) {
    if (!psyPricingCheckbox.checked) return price;
    
    // If price is large (e.g. > 1000), maybe round to nearest 9 or 99
    // Simple approach: floor to integer, add 0.99
    if (price < 1) return 0.99;
    
    // Round to nearest whole number, then subtract 0.01
    let rounded = Math.round(price);
    if (rounded === price) {
        return price - 0.01;
    }
    return Math.floor(price) + 0.99;
  }

  function calculatePricing() {
    // 1. Get Values
    const base = parseFloat(baseCostInput.value) || 0;
    const overhead = parseFloat(overheadCostInput.value) || 0;
    const marketing = parseFloat(marketingCostInput.value) || 0;
    const marginPct = parseFloat(targetMarginInput.value) || 0;
    const multiplier = parseFloat(brandMultiplierInput.value) || 1;
    
    // Update range labels
    marginVal.textContent = marginPct + '%';
    multiplierVal.textContent = multiplier.toFixed(1) + 'x';
    
    // 2. Calculate Total Landed Cost
    const totalCost = base + overhead + marketing;
    totalCostDisplay.textContent = formatCurrency(totalCost);
    
    // Update labels showing base+overhead+marketing breakdown
    document.querySelector('#total-cost-display + div').textContent = 
      `Base ($${base.toFixed(0)}) + Overhead ($${overhead.toFixed(0)}) + Marketing ($${marketing.toFixed(0)})`;

    // 3. Standard Pricing (Cost-Plus with Margin)
    // Formula: Price = Cost / (1 - Margin/100)
    let standardPrice = totalCost / (1 - (marginPct / 100));
    standardPrice = applyPsychologicalPricing(standardPrice);
    
    const standardProfit = standardPrice - totalCost;
    
    tierStandardPrice.innerHTML = `${formatCurrency(standardPrice)} <span>USD</span>`;
    tierStandardCost.textContent = formatCurrency(totalCost);
    tierStandardProfit.textContent = '+' + formatCurrency(standardProfit);
    
    // 4. Luxury Value-Based Pricing
    let luxuryPrice = standardPrice * multiplier;
    luxuryPrice = applyPsychologicalPricing(luxuryPrice);
    
    const luxuryProfit = luxuryPrice - totalCost;
    const luxuryMarginActual = (luxuryProfit / luxuryPrice) * 100;
    
    tierLuxuryPrice.innerHTML = `${formatCurrency(luxuryPrice)} <span>USD</span>`;
    tierLuxuryCost.textContent = formatCurrency(totalCost);
    tierLuxuryProfit.textContent = '+' + formatCurrency(luxuryProfit);
    tierLuxuryMarginPct.textContent = luxuryMarginActual.toFixed(1) + '%';
    
    // 5. Update Insight Text
    insightText.innerHTML = `By shifting from a Standard Cost-Plus model to a Value-Based Luxury model, you can increase your profit margin per unit from <strong>${formatCurrency(standardProfit)}</strong> to <strong>${formatCurrency(luxuryProfit)}</strong>. This strategy requires maintaining strict brand exclusivity, high-end packaging, and exceptional customer experience to justify the ${multiplier.toFixed(1)}x brand multiplier.`;
  }

  // Event Listeners
  const inputs = [
    baseCostInput, overheadCostInput, marketingCostInput, 
    targetMarginInput, brandMultiplierInput, psyPricingCheckbox
  ];
  
  inputs.forEach(input => {
    input.addEventListener('input', calculatePricing);
    input.addEventListener('change', calculatePricing);
  });

  // Initial Calculation
  calculatePricing();
});
