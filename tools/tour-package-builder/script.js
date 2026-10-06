// Tour Package Builder Client Logic

document.addEventListener('DOMContentLoaded', () => {
  // Currency state
  let currentCurrency = 'USD';
  let currencySymbol = '$';

  // DOM Elements - Inputs
  const tourNameInput = document.getElementById('tour-name');
  const tourDestInput = document.getElementById('tour-destination');

  const groupSizeSlider = document.getElementById('group-size-slider');
  const groupSizeVal = document.getElementById('group-size-val');

  const markupSlider = document.getElementById('markup-slider');
  const markupVal = document.getElementById('markup-val');

  const costAccInput = document.getElementById('cost-accommodation');
  const costTraInput = document.getElementById('cost-transportation');
  const costActInput = document.getElementById('cost-sightseeing');
  const costMeaInput = document.getElementById('cost-meals');
  const costGuiInput = document.getElementById('cost-guide');
  const costOveInput = document.getElementById('cost-overhead');

  const currPrefixes = document.querySelectorAll('.curr-prefix');
  const currPills = document.querySelectorAll('#currency-pills .curr-pill');
  const groupChips = document.querySelectorAll('.chip-btn[data-group]');
  const markupChips = document.querySelectorAll('.chip-btn[data-markup]');
  const presetPills = document.querySelectorAll('.preset-pill');

  // DOM Elements - Outputs
  const dispPerPersonPrice = document.getElementById('disp-per-person-price');
  const dispTotalPrice = document.getElementById('disp-total-price');
  const dispMarginPct = document.getElementById('disp-margin-pct');
  const dispTotalCost = document.getElementById('disp-total-cost');
  const dispGrossProfit = document.getElementById('disp-gross-profit');
  const dispPerPersonCost = document.getElementById('disp-per-person-cost');
  const dispPerPersonProfit = document.getElementById('disp-per-person-profit');

  // Breakdown Bars
  const segAcc = document.getElementById('seg-acc');
  const segTra = document.getElementById('seg-tra');
  const segAct = document.getElementById('seg-act');
  const segMea = document.getElementById('seg-mea');
  const segGui = document.getElementById('seg-gui');
  const segOve = document.getElementById('seg-ove');
  const segMar = document.getElementById('seg-mar');
  const breakdownShareLabel = document.getElementById('breakdown-share-label');

  // Table Body
  const pricingTableBody = document.getElementById('pricing-table-body');

  // Proposal Modal Elements
  const proposalModal = document.getElementById('proposal-modal');
  const openProposalBtn = document.getElementById('open-proposal-btn');
  const closePropBtn = document.getElementById('close-prop-btn');
  const printPropBtn = document.getElementById('print-prop-btn');

  const propTourName = document.getElementById('prop-tour-name');
  const propDestination = document.getElementById('prop-destination');
  const propRefNum = document.getElementById('prop-ref-num');
  const propDate = document.getElementById('prop-date');
  const propPerPerson = document.getElementById('prop-per-person');
  const propGroupSize = document.getElementById('prop-group-size');
  const propTotalPackage = document.getElementById('prop-total-package');
  const propInclusionsBody = document.getElementById('prop-inclusions-body');

  // Toast & Utilities
  const toastMsg = document.getElementById('toast-msg');
  const toastText = document.getElementById('toast-text');
  const copyProposalBtn = document.getElementById('copy-proposal-btn');
  const resetTourBtn = document.getElementById('reset-tour-btn');

  // Helper: Format Money
  function formatMoney(amount) {
    if (isNaN(amount) || !isFinite(amount)) amount = 0;
    return `${currencySymbol}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  // Toast
  let toastTimer = null;
  function showToast(text) {
    if (toastTimer) clearTimeout(toastTimer);
    toastText.textContent = text;
    toastMsg.classList.add('show');
    toastTimer = setTimeout(() => {
      toastMsg.classList.remove('show');
    }, 2800);
  }

  // Core Calculation Function
  function calculate() {
    const groupSize = Math.max(1, parseInt(groupSizeSlider.value, 10) || 1);
    const markupPct = Math.max(0, parseFloat(markupSlider.value) || 0);

    // Read 6 line items
    const accCost = Math.max(0, parseFloat(costAccInput.value) || 0);
    const traCost = Math.max(0, parseFloat(costTraInput.value) || 0);
    const actCost = Math.max(0, parseFloat(costActInput.value) || 0);
    const meaCost = Math.max(0, parseFloat(costMeaInput.value) || 0);
    const guiCost = Math.max(0, parseFloat(costGuiInput.value) || 0);
    const oveCost = Math.max(0, parseFloat(costOveInput.value) || 0);

    const totalCost = accCost + traCost + actCost + meaCost + guiCost + oveCost;
    const grossProfit = totalCost * (markupPct / 100);
    const totalPrice = totalCost + grossProfit;

    const perPersonPrice = totalPrice / groupSize;
    const perPersonCost = totalCost / groupSize;
    const perPersonProfit = grossProfit / groupSize;
    const marginPct = totalPrice > 0 ? (grossProfit / totalPrice) * 100 : 0;

    // Update Slider Badges
    groupSizeVal.textContent = groupSize;
    markupVal.textContent = `${markupPct}%`;

    // Update Hero and KPI boxes
    dispPerPersonPrice.textContent = formatMoney(perPersonPrice);
    dispTotalPrice.textContent = formatMoney(totalPrice);
    dispMarginPct.textContent = `${marginPct.toFixed(1)}%`;

    dispTotalCost.textContent = formatMoney(totalCost);
    dispGrossProfit.textContent = formatMoney(grossProfit);
    dispPerPersonCost.textContent = formatMoney(perPersonCost);
    dispPerPersonProfit.textContent = formatMoney(perPersonProfit);

    // Update Visual Breakdown Segments
    const baseTotal = totalPrice > 0 ? totalPrice : 1;
    const pctAcc = (accCost / baseTotal) * 100;
    const pctTra = (traCost / baseTotal) * 100;
    const pctAct = (actCost / baseTotal) * 100;
    const pctMea = (meaCost / baseTotal) * 100;
    const pctGui = (guiCost / baseTotal) * 100;
    const pctOve = (oveCost / baseTotal) * 100;
    const pctMar = (grossProfit / baseTotal) * 100;

    segAcc.style.width = `${pctAcc.toFixed(1)}%`;
    segTra.style.width = `${pctTra.toFixed(1)}%`;
    segAct.style.width = `${pctAct.toFixed(1)}%`;
    segMea.style.width = `${pctMea.toFixed(1)}%`;
    segGui.style.width = `${pctGui.toFixed(1)}%`;
    segOve.style.width = `${pctOve.toFixed(1)}%`;
    segMar.style.width = `${pctMar.toFixed(1)}%`;

    const costSharePct = 100 - pctMar;
    breakdownShareLabel.textContent = `Cost: ${costSharePct.toFixed(0)}% | Agency Markup: ${pctMar.toFixed(0)}%`;

    // Render Table
    const lineItems = [
      { name: '1. Accommodation & Hotels', cost: accCost },
      { name: '2. Transportation & Transfers', cost: traCost },
      { name: '3. Sightseeing & Tickets', cost: actCost },
      { name: '4. Meals & Dining', cost: meaCost },
      { name: '5. Tour Guide & Escorts', cost: guiCost },
      { name: '6. Operations & Overhead', cost: oveCost }
    ];

    let rowsHtml = '';
    lineItems.forEach(item => {
      const pp = item.cost / groupSize;
      const share = totalPrice > 0 ? (item.cost / totalPrice) * 100 : 0;
      rowsHtml += `
        <tr>
          <td>${item.name}</td>
          <td style="text-align: right;">${formatMoney(item.cost)}</td>
          <td style="text-align: right;">${formatMoney(pp)}</td>
          <td style="text-align: right; color: var(--text-secondary);">${share.toFixed(1)}%</td>
        </tr>
      `;
    });

    // Subtotal Row
    const costShare = totalPrice > 0 ? (totalCost / totalPrice) * 100 : 0;
    rowsHtml += `
      <tr style="border-top: 1px dashed var(--border); font-weight: 600; color: var(--text-secondary);">
        <td>Direct Cost Subtotal</td>
        <td style="text-align: right;">${formatMoney(totalCost)}</td>
        <td style="text-align: right;">${formatMoney(perPersonCost)}</td>
        <td style="text-align: right;">${costShare.toFixed(1)}%</td>
      </tr>
      <tr style="color: var(--success); font-weight: 600;">
        <td>Agency Profit Markup (${markupPct}%)</td>
        <td style="text-align: right;">+${formatMoney(grossProfit)}</td>
        <td style="text-align: right;">+${formatMoney(perPersonProfit)}</td>
        <td style="text-align: right;">${marginPct.toFixed(1)}%</td>
      </tr>
      <tr class="total-row">
        <td>Total Client Package Price</td>
        <td style="text-align: right; color: var(--accent);">${formatMoney(totalPrice)}</td>
        <td style="text-align: right; color: var(--accent);">${formatMoney(perPersonPrice)}</td>
        <td style="text-align: right; color: var(--accent);">100%</td>
      </tr>
    `;

    pricingTableBody.innerHTML = rowsHtml;

    return {
      groupSize,
      markupPct,
      accCost,
      traCost,
      actCost,
      meaCost,
      guiCost,
      oveCost,
      totalCost,
      grossProfit,
      totalPrice,
      perPersonPrice,
      perPersonCost,
      perPersonProfit,
      marginPct,
      tourName: tourNameInput.value.trim() || 'Custom Tour Package',
      tourDest: tourDestInput.value.trim() || 'Featured Destination'
    };
  }

  // Update Currency
  function setCurrency(currency, symbol) {
    currentCurrency = currency;
    currencySymbol = symbol;

    currPrefixes.forEach(prefix => {
      prefix.textContent = symbol;
    });

    currPills.forEach(pill => {
      pill.classList.toggle('active', pill.dataset.currency === currency);
    });

    calculate();
  }

  currPills.forEach(pill => {
    pill.addEventListener('click', () => {
      setCurrency(pill.dataset.currency, pill.dataset.symbol);
    });
  });

  // Slider events
  groupSizeSlider.addEventListener('input', calculate);
  markupSlider.addEventListener('input', calculate);

  // Group size chips
  groupChips.forEach(chip => {
    chip.addEventListener('click', () => {
      groupSizeSlider.value = chip.dataset.group;
      calculate();
    });
  });

  // Markup chips
  markupChips.forEach(chip => {
    chip.addEventListener('click', () => {
      markupSlider.value = chip.dataset.markup;
      calculate();
    });
  });

  // Cost input listeners
  const costInputs = [
    costAccInput,
    costTraInput,
    costActInput,
    costMeaInput,
    costGuiInput,
    costOveInput,
    tourNameInput,
    tourDestInput
  ];

  costInputs.forEach(input => {
    input.addEventListener('input', calculate);
  });

  // Presets
  const tourPresets = {
    europe: {
      name: '7-Day Mediterranean Grand Tour',
      dest: 'Italy & Greece (7D/6N)',
      pax: 12,
      markup: 25,
      acc: 5400,
      tra: 2800,
      act: 1900,
      mea: 2200,
      gui: 1200,
      ove: 800
    },
    tropical: {
      name: 'Bali Luxury Villa Retreat',
      dest: 'Bali, Indonesia (5D/4N)',
      pax: 4,
      markup: 35,
      acc: 3200,
      tra: 650,
      act: 900,
      mea: 1100,
      gui: 600,
      ove: 400
    },
    safari: {
      name: 'Serengeti & Masai Mara Wildlife Expedition',
      dest: 'Kenya & Tanzania (10D/9N)',
      pax: 8,
      markup: 30,
      acc: 9600,
      tra: 4500,
      act: 2800,
      mea: 3200,
      gui: 2200,
      ove: 1200
    },
    city: {
      name: 'Tokyo & Kyoto Cultural Odyssey',
      dest: 'Japan (8D/7N)',
      pax: 20,
      markup: 20,
      acc: 11000,
      tra: 6400,
      act: 3600,
      mea: 5800,
      gui: 2500,
      ove: 1500
    }
  };

  presetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const p = tourPresets[pill.dataset.preset];
      if (!p) return;
      tourNameInput.value = p.name;
      tourDestInput.value = p.dest;
      groupSizeSlider.value = p.pax;
      markupSlider.value = p.markup;
      costAccInput.value = p.acc;
      costTraInput.value = p.tra;
      costActInput.value = p.act;
      costMeaInput.value = p.mea;
      costGuiInput.value = p.gui;
      costOveInput.value = p.ove;
      calculate();
    });
  });

  // Reset
  resetTourBtn.addEventListener('click', () => {
    tourNameInput.value = '7-Day Mediterranean Grand Tour';
    tourDestInput.value = 'Italy & Greece (7D/6N)';
    groupSizeSlider.value = 12;
    markupSlider.value = 25;
    costAccInput.value = 5400;
    costTraInput.value = 2800;
    costActInput.value = 1900;
    costMeaInput.value = 2200;
    costGuiInput.value = 1200;
    costOveInput.value = 800;
    setCurrency('USD', '$');
    showToast('Reset to default tour package.');
  });

  // Copy Proposal Summary
  copyProposalBtn.addEventListener('click', () => {
    const data = calculate();
    const summary = `=== TOUR PACKAGE PROPOSAL ===
Tour Name: ${data.tourName}
Destination & Duration: ${data.tourDest}
Group Size: ${data.groupSize} Travelers
Agency Markup: ${data.markupPct}% (Margin: ${data.marginPct.toFixed(1)}%)
---------------------------------------------
1. Accommodation: ${formatMoney(data.accCost)}
2. Transportation: ${formatMoney(data.traCost)}
3. Sightseeing & Tickets: ${formatMoney(data.actCost)}
4. Meals & Dining: ${formatMoney(data.meaCost)}
5. Guide & Escort: ${formatMoney(data.guiCost)}
6. Operational Overhead: ${formatMoney(data.oveCost)}
---------------------------------------------
Direct Group Cost: ${formatMoney(data.totalCost)} (Per Person: ${formatMoney(data.perPersonCost)})
Agency Gross Profit: ${formatMoney(data.grossProfit)} (Per Person: ${formatMoney(data.perPersonProfit)})
TOTAL PACKAGE PRICE: ${formatMoney(data.totalPrice)}
PRICE PER TRAVELER: ${formatMoney(data.perPersonPrice)}
Currency: ${currentCurrency}`;

    navigator.clipboard.writeText(summary).then(() => {
      showToast('Tour quotation copied to clipboard!');
    }).catch(() => {
      showToast('Copied to clipboard.');
    });
  });

  // Printable Client Proposal Modal
  openProposalBtn.addEventListener('click', () => {
    const data = calculate();

    const today = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    const refCode = `PROP-${new Date().getFullYear()}-TR-${Math.floor(1000 + Math.random() * 9000)}`;

    propTourName.textContent = data.tourName;
    propDestination.textContent = `Destination: ${data.tourDest}`;
    propRefNum.textContent = refCode;
    propDate.textContent = `Date: ${today}`;
    propPerPerson.textContent = formatMoney(data.perPersonPrice);
    propGroupSize.textContent = `${data.groupSize} Travelers`;
    propTotalPackage.textContent = formatMoney(data.totalPrice);

    // Build Inclusions Table Rows for Client
    // In a client proposal, the price includes the markup prorated across inclusions
    const markupFactor = 1 + (data.markupPct / 100);
    const inclusions = [
      { name: 'Hotel & Resort Accommodations', basis: `${data.groupSize} Pax shared & private bookings`, total: data.accCost * markupFactor },
      { name: 'Private Ground Transportation & Airport Transfers', basis: 'Air-conditioned private vehicles', total: data.traCost * markupFactor },
      { name: 'Guided Sightseeing, Excursions & Entry Tickets', basis: 'Scheduled itinerary entries', total: data.actCost * markupFactor },
      { name: 'Curated Meals, Dinners & Refreshments', basis: 'Included meal plan as scheduled', total: data.meaCost * markupFactor },
      { name: 'Licensed Multilingual Tour Leader & Escort', basis: 'Full itinerary coverage', total: data.guiCost * markupFactor },
      { name: 'Agency Planning, Safety Coordination & Permits', basis: '24/7 dedicated support', total: data.oveCost * markupFactor }
    ];

    let rowsHtml = '';
    inclusions.forEach(item => {
      rowsHtml += `
        <tr>
          <td><strong>${item.name}</strong></td>
          <td style="text-align: center; color: var(--text-secondary); font-size: 0.8rem;">${item.basis}</td>
          <td style="text-align: right;">${formatMoney(item.total)}</td>
        </tr>
      `;
    });

    rowsHtml += `
      <tr style="border-top: 2px solid var(--accent); font-weight: 800; font-size: 1.1rem;">
        <td>Total Client Tour Package</td>
        <td style="text-align: center;">${data.groupSize} Confirmed Travelers</td>
        <td style="text-align: right; color: var(--accent);">${formatMoney(data.totalPrice)}</td>
      </tr>
      <tr style="font-weight: 700; color: var(--text-secondary); font-size: 0.95rem;">
        <td colspan="2">Net Investment Per Traveler</td>
        <td style="text-align: right; color: var(--accent); font-size: 1.15rem;">${formatMoney(data.perPersonPrice)}</td>
      </tr>
    `;

    propInclusionsBody.innerHTML = rowsHtml;
    proposalModal.classList.add('active');
  });

  closePropBtn.addEventListener('click', () => {
    proposalModal.classList.remove('active');
  });

  proposalModal.addEventListener('click', (e) => {
    if (e.target === proposalModal) {
      proposalModal.classList.remove('active');
    }
  });

  printPropBtn.addEventListener('click', () => {
    window.print();
  });

  // Initial calculation
  calculate();
});