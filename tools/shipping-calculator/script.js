// Shipping & Dimensional Weight Calculator Logic
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const btnUnitImperial = document.getElementById('btn-unit-imperial');
  const btnUnitMetric = document.getElementById('btn-unit-metric');
  const unitLenLabels = document.querySelectorAll('.unit-len-label');
  const unitWtLabels = document.querySelectorAll('.unit-wt-label');

  const dimLength = document.getElementById('dim-length');
  const dimWidth = document.getElementById('dim-width');
  const dimHeight = document.getElementById('dim-height');
  const actualWeightInput = document.getElementById('actual-weight-input');
  const actualWeightBadge = document.getElementById('actual-weight-badge');

  const divisorSelect = document.getElementById('dim-divisor-select');
  const customDivisorWrap = document.getElementById('custom-divisor-wrap');
  const customDivisorInput = document.getElementById('custom-divisor-input');
  const shippingZoneSelect = document.getElementById('shipping-zone-select');
  const btnReset = document.getElementById('btn-reset-shipping');
  const btnCopyEstimate = document.getElementById('btn-copy-shipping-estimate');
  const copyEstimateText = document.getElementById('copy-estimate-text');

  // Outputs
  const complianceBadge = document.getElementById('package-compliance-badge');
  const surchargeBanner = document.getElementById('surcharge-alert-banner');
  const surchargeText = document.getElementById('surcharge-alert-text');

  const kpiBillableWeight = document.getElementById('kpi-billable-weight');
  const kpiBillableRule = document.getElementById('kpi-billable-rule');
  const kpiDimWeight = document.getElementById('kpi-dim-weight');
  const kpiActualWeight = document.getElementById('kpi-actual-weight');
  const kpiVolume = document.getElementById('kpi-volume');
  const kpiVolumeSub = document.getElementById('kpi-volume-sub');

  const girthCalcLabel = document.getElementById('girth-calc-label');
  const boxLabelLength = document.getElementById('box-label-length');
  const boxLabelWidth = document.getElementById('box-label-width');
  const boxLabelHeight = document.getElementById('box-label-height');

  const tierGroundPrice = document.getElementById('tier-ground-price');
  const tierPriorityPrice = document.getElementById('tier-priority-price');
  const tierExpressPrice = document.getElementById('tier-express-price');
  const shippingBreakdownTbody = document.getElementById('shipping-breakdown-tbody');

  // State
  let currentUnit = 'imperial'; // 'imperial' | 'metric'

  function getDivisor() {
    const selVal = divisorSelect.value;
    if (selVal === 'custom') {
      const customVal = parseFloat(customDivisorInput.value);
      return !isNaN(customVal) && customVal > 0 ? customVal : 139;
    }
    return parseFloat(selVal);
  }

  function formatMoney(amount) {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function calculate() {
    const isImperial = currentUnit === 'imperial';
    const len = parseFloat(dimLength.value) || 0;
    const wid = parseFloat(dimWidth.value) || 0;
    const hgt = parseFloat(dimHeight.value) || 0;
    const actualWt = parseFloat(actualWeightInput.value) || 0;

    const lenUnit = isImperial ? 'in' : 'cm';
    const wtUnit = isImperial ? 'lbs' : 'kg';

    actualWeightBadge.textContent = `${actualWt.toFixed(2)} ${wtUnit}`;

    // Dimensions sorting: longest side is length
    const dims = [len, wid, hgt].sort((a, b) => b - a);
    const longest = dims[0];
    const mid = dims[1];
    const shortest = dims[2];

    const volume = len * wid * hgt;
    const divisor = getDivisor();
    const dimWeight = divisor > 0 ? volume / divisor : 0;
    const billableWeight = Math.max(actualWt, dimWeight);

    // Girth calculations: Girth = 2 * (Width + Height)
    const girth = 2 * (mid + shortest);
    const combinedLengthGirth = longest + girth;

    // Thresholds:
    // Imperial: Max length 108 in, Max L+G 165 in, Large Package > 130 in, Max Wt 150 lbs, Heavy > 50 lbs
    // Metric: Max length 274 cm, Max L+G 419 cm, Large Package > 330 cm, Max Wt 68 kg, Heavy > 23 kg
    const maxLenLimit = isImperial ? 108 : 274;
    const maxCombinedLimit = isImperial ? 165 : 419;
    const largePackageLimit = isImperial ? 130 : 330;
    const maxWeightLimit = isImperial ? 150 : 68;
    const heavyWeightLimit = isImperial ? 50 : 23;

    let isOversizeFreight = false;
    let isLargePackageSurcharge = false;
    let isHeavyPackageSurcharge = false;
    let surchargeAmount = 0;

    if (longest > maxLenLimit || combinedLengthGirth > maxCombinedLimit || actualWt > maxWeightLimit) {
      isOversizeFreight = true;
      complianceBadge.textContent = 'Freight Required';
      complianceBadge.style.background = 'rgba(239, 68, 68, 0.2)';
      complianceBadge.style.color = '#ef4444';

      surchargeBanner.className = 'alert-banner error';
      surchargeText.textContent = `CRITICAL: Package exceeds standard parcel network limits (Max ${maxLenLimit} ${lenUnit} length, ${maxCombinedLimit} ${lenUnit} L+G, or ${maxWeightLimit} ${wtUnit}). Must ship via LTL Freight service.`;
      surchargeAmount = 180.00;
    } else if (combinedLengthGirth > largePackageLimit) {
      isLargePackageSurcharge = true;
      complianceBadge.textContent = 'Large Package Surcharge';
      complianceBadge.style.background = 'rgba(245, 158, 11, 0.2)';
      complianceBadge.style.color = '#f59e0b';

      surchargeBanner.className = 'alert-banner warning';
      surchargeText.textContent = `ATTENTION: Length + Girth (${combinedLengthGirth.toFixed(1)} ${lenUnit}) exceeds ${largePackageLimit} ${lenUnit}. Standard carriers apply a Large Package / Oversize surcharge (~$95-$140).`;
      surchargeAmount = 95.00;
    } else if (actualWt > heavyWeightLimit) {
      isHeavyPackageSurcharge = true;
      complianceBadge.textContent = 'Heavy Package';
      complianceBadge.style.background = 'rgba(245, 158, 11, 0.2)';
      complianceBadge.style.color = '#f59e0b';

      surchargeBanner.className = 'alert-banner warning';
      surchargeText.textContent = `NOTICE: Actual weight (${actualWt.toFixed(1)} ${wtUnit}) exceeds ${heavyWeightLimit} ${wtUnit}. Special handling / heavy package tag required.`;
      surchargeAmount = 28.00;
    } else {
      complianceBadge.textContent = 'Standard Parcel';
      complianceBadge.style.background = 'rgba(16, 185, 129, 0.15)';
      complianceBadge.style.color = '#10b981';

      surchargeBanner.className = 'alert-banner info';
      surchargeText.textContent = `Package qualifies for standard commercial ground parcel delivery without dimensional penalties.`;
      surchargeAmount = 0;
    }

    // Update KPIs
    kpiBillableWeight.textContent = `${billableWeight.toFixed(1)} ${wtUnit}`;
    if (dimWeight > actualWt) {
      kpiBillableRule.textContent = 'DIM weight governs pricing (Box is light for its size)';
      kpiBillableWeight.style.color = '#f59e0b';
    } else {
      kpiBillableRule.textContent = 'Actual scale weight governs pricing';
      kpiBillableWeight.style.color = 'var(--accent)';
    }

    kpiDimWeight.textContent = `${dimWeight.toFixed(1)} ${wtUnit}`;
    kpiActualWeight.textContent = `${actualWt.toFixed(1)} ${wtUnit}`;

    if (isImperial) {
      kpiVolume.textContent = `${volume.toLocaleString(undefined, { maximumFractionDigits: 0 })} in³`;
      const cubicFt = volume / 1728;
      kpiVolumeSub.textContent = `${cubicFt.toFixed(2)} cubic feet`;
    } else {
      kpiVolume.textContent = `${volume.toLocaleString(undefined, { maximumFractionDigits: 0 })} cm³`;
      const liters = volume / 1000;
      kpiVolumeSub.textContent = `${liters.toFixed(1)} Liters`;
    }

    // Girth label & box preview labels
    girthCalcLabel.textContent = `Girth: ${girth.toFixed(1)} ${lenUnit} • Length+Girth: ${combinedLengthGirth.toFixed(1)} ${lenUnit}`;
    boxLabelLength.textContent = `L: ${len}${lenUnit}`;
    boxLabelWidth.textContent = `W: ${wid}${lenUnit}`;
    boxLabelHeight.textContent = `H: ${hgt}${lenUnit}`;

    // Rate simulator
    calculateRates(billableWeight, isImperial, surchargeAmount, isLargePackageSurcharge, isHeavyPackageSurcharge, isOversizeFreight);
  }

  function calculateRates(billableWt, isImperial, surcharge, isLarge, isHeavy, isFreight) {
    // Normalize billable weight to lbs for rate equation
    const wtInLbs = isImperial ? billableWt : billableWt * 2.20462;

    const zone = shippingZoneSelect.value;
    let zoneMultiplier = 1.0;
    let zoneName = 'Zone 1-2 (Local)';
    if (zone === 'regional') {
      zoneMultiplier = 1.28;
      zoneName = 'Zone 3-5 (Regional)';
    } else if (zone === 'national') {
      zoneMultiplier = 1.58;
      zoneName = 'Zone 6-8 (National)';
    }

    // Base rates
    const baseGround = 9.50;
    const basePriority = 16.00;
    const baseExpress = 36.00;

    const weightRateGround = wtInLbs * 0.75 * zoneMultiplier;
    const weightRatePriority = wtInLbs * 1.45 * zoneMultiplier;
    const weightRateExpress = wtInLbs * 2.85 * zoneMultiplier;

    // Fuel surcharge (approx 12.5%)
    const fuelGround = (baseGround + weightRateGround) * 0.125;
    const fuelPriority = (basePriority + weightRatePriority) * 0.125;
    const fuelExpress = (baseExpress + weightRateExpress) * 0.125;

    const totalGround = baseGround + weightRateGround + fuelGround + surcharge;
    const totalPriority = basePriority + weightRatePriority + fuelPriority + surcharge;
    const totalExpress = baseExpress + weightRateExpress + fuelExpress + surcharge;

    tierGroundPrice.textContent = formatMoney(totalGround);
    tierPriorityPrice.textContent = formatMoney(totalPriority);
    tierExpressPrice.textContent = formatMoney(totalExpress);

    // Populate Table
    if (shippingBreakdownTbody) {
      let surchargeDesc = 'None ($0.00)';
      if (isFreight) surchargeDesc = 'Freight Oversize Penalty (+$180.00)';
      else if (isLarge) surchargeDesc = 'Large Package Surcharge (+$95.00)';
      else if (isHeavy) surchargeDesc = 'Heavy Package Handling (+$28.00)';

      shippingBreakdownTbody.innerHTML = `
        <tr>
          <td><strong>Destination Zone</strong></td>
          <td>${zoneName} (Multiplier ${zoneMultiplier}x)</td>
          <td>Standard distance scaling</td>
        </tr>
        <tr>
          <td><strong>Billable Weight Charge</strong></td>
          <td>${billableWt.toFixed(1)} ${currentUnit === 'imperial' ? 'lbs' : 'kg'} billable</td>
          <td>${formatMoney(weightRateGround)} (Ground) / ${formatMoney(weightRatePriority)} (Priority)</td>
        </tr>
        <tr>
          <td><strong>Estimated Fuel Surcharge</strong></td>
          <td>Index rate ~12.5%</td>
          <td>${formatMoney(fuelGround)}</td>
        </tr>
        <tr>
          <td><strong>Special Handling / Surcharges</strong></td>
          <td>${surchargeDesc}</td>
          <td style="color: ${surcharge > 0 ? '#f59e0b' : 'inherit'}; font-weight: ${surcharge > 0 ? '700' : 'normal'};">${formatMoney(surcharge)}</td>
        </tr>
      `;
    }
  }

  // Unit switching
  btnUnitImperial.addEventListener('click', () => {
    if (currentUnit === 'imperial') return;
    currentUnit = 'imperial';
    btnUnitImperial.classList.add('active');
    btnUnitMetric.classList.remove('active');

    unitLenLabels.forEach(el => el.textContent = 'in');
    unitWtLabels.forEach(el => el.textContent = 'lbs');

    // Convert values cm -> in, kg -> lbs
    dimLength.value = Math.max(1, Math.round((parseFloat(dimLength.value) / 2.54) * 2) / 2);
    dimWidth.value = Math.max(1, Math.round((parseFloat(dimWidth.value) / 2.54) * 2) / 2);
    dimHeight.value = Math.max(1, Math.round((parseFloat(dimHeight.value) / 2.54) * 2) / 2);
    actualWeightInput.value = (parseFloat(actualWeightInput.value) * 2.20462).toFixed(1);

    divisorSelect.value = '139';
    customDivisorWrap.style.display = 'none';
    calculate();
  });

  btnUnitMetric.addEventListener('click', () => {
    if (currentUnit === 'metric') return;
    currentUnit = 'metric';
    btnUnitMetric.classList.add('active');
    btnUnitImperial.classList.remove('active');

    unitLenLabels.forEach(el => el.textContent = 'cm');
    unitWtLabels.forEach(el => el.textContent = 'kg');

    // Convert values in -> cm, lbs -> kg
    dimLength.value = Math.round(parseFloat(dimLength.value) * 2.54);
    dimWidth.value = Math.round(parseFloat(dimWidth.value) * 2.54);
    dimHeight.value = Math.round(parseFloat(dimHeight.value) * 2.54);
    actualWeightInput.value = (parseFloat(actualWeightInput.value) * 0.453592).toFixed(1);

    divisorSelect.value = '5000';
    customDivisorWrap.style.display = 'none';
    calculate();
  });

  // Divisor changes
  divisorSelect.addEventListener('change', () => {
    if (divisorSelect.value === 'custom') {
      customDivisorWrap.style.display = 'block';
    } else {
      customDivisorWrap.style.display = 'none';
    }
    calculate();
  });

  customDivisorInput.addEventListener('input', calculate);

  // Input listeners
  dimLength.addEventListener('input', calculate);
  dimWidth.addEventListener('input', calculate);
  dimHeight.addEventListener('input', calculate);
  actualWeightInput.addEventListener('input', calculate);
  shippingZoneSelect.addEventListener('change', calculate);

  // Reset
  btnReset.addEventListener('click', () => {
    currentUnit = 'imperial';
    btnUnitImperial.classList.add('active');
    btnUnitMetric.classList.remove('active');
    unitLenLabels.forEach(el => el.textContent = 'in');
    unitWtLabels.forEach(el => el.textContent = 'lbs');

    dimLength.value = '16';
    dimWidth.value = '12';
    dimHeight.value = '10';
    actualWeightInput.value = '8';

    divisorSelect.value = '139';
    customDivisorWrap.style.display = 'none';
    shippingZoneSelect.value = 'regional';
    calculate();
  });

  // Copy Estimate
  btnCopyEstimate.addEventListener('click', async () => {
    const isImperial = currentUnit === 'imperial';
    const wtUnit = isImperial ? 'lbs' : 'kg';
    const lenUnit = isImperial ? 'in' : 'cm';

    const summary = [
      `=== PARCEL SHIPPING & DIM WEIGHT ESTIMATE ===`,
      `Dimensions: ${dimLength.value} × ${dimWidth.value} × ${dimHeight.value} ${lenUnit}`,
      `Actual Scale Weight: ${actualWeightInput.value} ${wtUnit}`,
      `Dimensional (DIM) Weight: ${kpiDimWeight.textContent}`,
      `Billable Weight: ${kpiBillableWeight.textContent} (${kpiBillableRule.textContent})`,
      `Classification: ${complianceBadge.textContent}`,
      `---------------------------------------------`,
      `Ground Economy: ${tierGroundPrice.textContent}`,
      `Priority Expedited: ${tierPriorityPrice.textContent}`,
      `Overnight Express: ${tierExpressPrice.textContent}`,
      `---------------------------------------------`,
      `Generated by ALL IN ONE Shipping Calculator`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      const orig = copyEstimateText.textContent;
      copyEstimateText.textContent = 'Copied!';
      btnCopyEstimate.style.borderColor = 'var(--success)';
      setTimeout(() => {
        copyEstimateText.textContent = orig;
        btnCopyEstimate.style.borderColor = '';
      }, 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = summary;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      copyEstimateText.textContent = 'Copied!';
      setTimeout(() => {
        copyEstimateText.textContent = 'Copy Estimate';
      }, 2000);
    }
  });

  // Initial calculation
  calculate();
});