// Smart Business Analyzer & Unit Economics Calculator Logic
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'smart_biz_analyzer_v1';

  const PRESETS = {
    saas: {
      name: 'B2B SaaS / Subscription',
      revenue: 125000,
      cogs: 25000,
      opex: 68000,
      cash: 480000,
      cac: 1600,
      ltv: 7800,
      churn: 2.8,
      customers: 180
    },
    ecommerce: {
      name: 'D2C & E-Commerce',
      revenue: 95000,
      cogs: 48000,
      opex: 28000,
      cash: 160000,
      cac: 55,
      ltv: 190,
      churn: 6.5,
      customers: 950
    },
    agency: {
      name: 'Agency / Consulting',
      revenue: 70000,
      cogs: 22000,
      opex: 26000,
      cash: 190000,
      cac: 1400,
      ltv: 11500,
      churn: 3.5,
      customers: 45
    },
    startup: {
      name: 'High-Burn Early Startup',
      revenue: 18000,
      cogs: 6000,
      opex: 42000,
      cash: 160000,
      cac: 750,
      ltv: 1600,
      churn: 8.0,
      customers: 60
    }
  };

  // State
  let model = loadState();
  let simModifiers = {
    revDelta: 0,
    cacDelta: 0,
    churnDelta: 0
  };

  // Input DOM elements
  const inpRevenue = document.getElementById('inp-revenue');
  const inpCogs = document.getElementById('inp-cogs');
  const inpOpex = document.getElementById('inp-opex');
  const inpCash = document.getElementById('inp-cash');
  const inpCac = document.getElementById('inp-cac');
  const inpLtv = document.getElementById('inp-ltv');
  const inpChurn = document.getElementById('inp-churn');
  const inpCustomers = document.getElementById('inp-customers');

  // Output DOM elements
  const scoreNumber = document.getElementById('score-number');
  const scoreBadge = document.getElementById('score-badge');
  const scoreSummaryText = document.getElementById('score-summary-text');
  const gaugeProgress = document.getElementById('gauge-progress');

  const outGrossMargin = document.getElementById('out-gross-margin');
  const outGrossProfit = document.getElementById('out-gross-profit');
  const outNetMargin = document.getElementById('out-net-margin');
  const outNetProfit = document.getElementById('out-net-profit');
  const outLtvCac = document.getElementById('out-ltv-cac');
  const outLtvSub = document.getElementById('out-ltv-sub');
  const outRunway = document.getElementById('out-runway');
  const outBurnSub = document.getElementById('out-burn-sub');

  const recsContainer = document.getElementById('recs-container');

  // Simulation DOM elements
  const simRevSlider = document.getElementById('sim-rev-slider');
  const simRevDisplay = document.getElementById('sim-rev-display');
  const simCacSlider = document.getElementById('sim-cac-slider');
  const simCacDisplay = document.getElementById('sim-cac-display');
  const simChurnSlider = document.getElementById('sim-churn-slider');
  const simChurnDisplay = document.getElementById('sim-churn-display');
  const simProjProfit = document.getElementById('sim-proj-profit');
  const simProjScore = document.getElementById('sim-proj-score');
  const btnResetSim = document.getElementById('btn-reset-sim');

  const btnCopyReport = document.getElementById('btn-copy-report');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const presetButtons = document.querySelectorAll('.preset-btn');

  // Helpers
  function loadState() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed.revenue === 'number') return parsed;
      }
    } catch (e) {
      console.warn('Error reading from storage:', e);
    }
    return JSON.parse(JSON.stringify(PRESETS.saas));
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(model));
    } catch (e) {
      console.warn('Error saving to storage:', e);
    }
  }

  function formatMoney(amount, decimals = 0) {
    const num = Number(amount) || 0;
    return '$' + num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  // Populate inputs from state
  function syncInputs() {
    inpRevenue.value = model.revenue;
    inpCogs.value = model.cogs;
    inpOpex.value = model.opex;
    inpCash.value = model.cash;
    inpCac.value = model.cac;
    inpLtv.value = model.ltv;
    inpChurn.value = model.churn;
    inpCustomers.value = model.customers;
  }

  // Pull inputs to state
  function readInputs() {
    model.revenue = Math.max(0, parseFloat(inpRevenue.value) || 0);
    model.cogs = Math.max(0, parseFloat(inpCogs.value) || 0);
    model.opex = Math.max(0, parseFloat(inpOpex.value) || 0);
    model.cash = Math.max(0, parseFloat(inpCash.value) || 0);
    model.cac = Math.max(0.01, parseFloat(inpCac.value) || 0.01);
    model.ltv = Math.max(0.01, parseFloat(inpLtv.value) || 0.01);
    model.churn = Math.max(0, parseFloat(inpChurn.value) || 0);
    model.customers = Math.max(1, parseInt(inpCustomers.value, 10) || 1);
    saveState();
  }

  // Comprehensive Financial Engine
  function calculateMetrics(data) {
    const rev = data.revenue;
    const cogs = data.cogs;
    const opex = data.opex;
    const cash = data.cash;
    const cac = data.cac;
    const ltv = data.ltv;
    const churn = data.churn;

    const grossProfit = rev - cogs;
    const grossMarginPct = rev > 0 ? (grossProfit / rev) * 100 : 0;

    const netProfit = rev - cogs - opex;
    const netMarginPct = rev > 0 ? (netProfit / rev) * 100 : 0;

    const isProfitable = netProfit >= 0;
    const monthlyBurn = isProfitable ? 0 : Math.abs(netProfit);

    let runwayMonths = 999; // infinite/profitable
    let runwayText = 'Profitable / Unlimited';
    if (!isProfitable) {
      if (monthlyBurn > 0) {
        runwayMonths = cash / monthlyBurn;
        runwayText = runwayMonths >= 36 ? '36+ Months' : `${runwayMonths.toFixed(1)} Months`;
      } else {
        runwayText = 'Cash Neutral';
      }
    }

    const ltvCacRatio = cac > 0 ? ltv / cac : 0;

    // Multi-Pillar 0-100 Health Score
    // Pillar 1: Gross Margin (25 pts max)
    let pGross = 0;
    if (grossMarginPct >= 75) pGross = 25;
    else if (grossMarginPct >= 60) pGross = 20;
    else if (grossMarginPct >= 45) pGross = 15;
    else if (grossMarginPct >= 30) pGross = 8;
    else pGross = 3;

    // Pillar 2: Net Margin / Profitability (25 pts max)
    let pNet = 0;
    if (netMarginPct >= 25) pNet = 25;
    else if (netMarginPct >= 15) pNet = 22;
    else if (netMarginPct >= 5) pNet = 18;
    else if (netMarginPct >= 0) pNet = 15;
    else if (netMarginPct >= -15) pNet = 10;
    else if (netMarginPct >= -35) pNet = 5;
    else pNet = 1;

    // Pillar 3: Unit Economics LTV:CAC (25 pts max)
    let pLtv = 0;
    if (ltvCacRatio >= 4.5) pLtv = 25;
    else if (ltvCacRatio >= 3.0) pLtv = 20;
    else if (ltvCacRatio >= 2.0) pLtv = 12;
    else if (ltvCacRatio >= 1.0) pLtv = 5;
    else pLtv = 0; // Losing money per customer

    // Pillar 4: Retention & Runway (25 pts max)
    // Churn (13 pts)
    let pChurn = 0;
    if (churn <= 2.0) pChurn = 13;
    else if (churn <= 3.5) pChurn = 10;
    else if (churn <= 5.0) pChurn = 7;
    else if (churn <= 8.0) pChurn = 4;
    else pChurn = 1;

    // Runway (12 pts)
    let pRunway = 0;
    if (isProfitable || runwayMonths >= 24) pRunway = 12;
    else if (runwayMonths >= 12) pRunway = 9;
    else if (runwayMonths >= 6) pRunway = 5;
    else pRunway = 1;

    const totalScore = Math.min(100, Math.max(0, Math.round(pGross + pNet + pLtv + pChurn + pRunway)));

    let tierClass = 'score-tier-healthy';
    let tierTitle = 'Healthy & Sustainable';
    let summaryText = 'Balanced unit economics and positive operational cash flow indicate a stable growth trajectory.';

    if (totalScore >= 85) {
      tierClass = 'score-tier-exceptional';
      tierTitle = 'Exceptional / High Efficiency';
      summaryText = 'Outstanding unit economics, high gross margins, and positive cash flow support aggressive scaling.';
    } else if (totalScore >= 70) {
      tierClass = 'score-tier-healthy';
      tierTitle = 'Healthy & Sustainable';
      summaryText = 'Solid operating fundamentals with positive contribution margins and adequate capital reserves.';
    } else if (totalScore >= 50) {
      tierClass = 'score-tier-moderate';
      tierTitle = 'Moderate Risk / Needs Optimization';
      summaryText = 'Unit economics or operational overhead require attention to avoid cash drain as growth accelerates.';
    } else {
      tierClass = 'score-tier-critical';
      tierTitle = 'Critical / Capital Warning';
      summaryText = 'High burn rate and compressed margins threaten liquidity. Implement immediate OPEX or pricing interventions.';
    }

    return {
      grossProfit,
      grossMarginPct,
      netProfit,
      netMarginPct,
      isProfitable,
      monthlyBurn,
      runwayMonths,
      runwayText,
      ltvCacRatio,
      totalScore,
      tierClass,
      tierTitle,
      summaryText
    };
  }

  // Generate Strategic Diagnostic Recommendations
  function generateRecommendations(m, res) {
    const recs = [];

    // 1. Unit Economics Diagnostics
    if (res.ltvCacRatio < 1.5) {
      recs.push({
        type: 'danger',
        title: 'Critical Unit Economics Deficit (LTV:CAC < 1.5x)',
        body: `You are currently spending ${formatMoney(m.cac)} to acquire a customer with lifetime value of only ${formatMoney(m.ltv)}. Pause unprofitable acquisition channels immediately and implement price increases or contract commitments.`
      });
    } else if (res.ltvCacRatio < 3.0) {
      recs.push({
        type: 'warning',
        title: 'Sub-Optimal Acquisition Efficiency (LTV:CAC Below 3.0x Benchmark)',
        body: `Industry best practice targets at least 3.0x to 5.0x. Refine ad targeting, introduce automated referral incentives, or cross-sell existing accounts to expand LTV before scaling sales headcount.`
      });
    } else if (res.ltvCacRatio >= 4.5) {
      recs.push({
        type: 'success',
        title: 'Highly Scalable Unit Economics (LTV:CAC &ge; 4.5x)',
        body: `Customer acquisition is highly profitable at ${res.ltvCacRatio.toFixed(1)}x return. You have significant financial headroom to bid higher for customer acquisition and accelerate expansion.`
      });
    }

    // 2. Gross Margin Diagnostics
    if (res.grossMarginPct < 50) {
      recs.push({
        type: 'warning',
        title: 'Compressed Gross Margin (< 50%)',
        body: `Cost of Goods Sold consumes ${(100 - res.grossMarginPct).toFixed(1)}% of every dollar earned. Renegotiate cloud infrastructure, wholesale supplier pricing, or direct fulfillment agreements.`
      });
    } else if (res.grossMarginPct >= 80) {
      recs.push({
        type: 'success',
        title: 'Superior Software-Grade Gross Margins (&ge; 80%)',
        body: `Gross margin of ${res.grossMarginPct.toFixed(1)}% leaves massive gross profit (${formatMoney(res.grossProfit)}) to self-fund R&D and operational growth.`
      });
    }

    // 3. Burn Rate and Runway Diagnostics
    if (!res.isProfitable) {
      if (res.runwayMonths < 6) {
        recs.push({
          type: 'danger',
          title: `Imminent Capital Exhaustion (${res.runwayText} Runway)`,
          body: `At the current burn rate of ${formatMoney(res.monthlyBurn)} / month, cash reserves of ${formatMoney(m.cash)} will be depleted in ${res.runwayMonths.toFixed(1)} months. Initiate bridge financing or execute emergency OPEX reductions.`
        });
      } else if (res.runwayMonths < 12) {
        recs.push({
          type: 'warning',
          title: `Moderate Runway Window (${res.runwayMonths.toFixed(1)} Months Remaining)`,
          body: `Plan fundraising or path-to-profitability initiatives at least 6 months before runway falls below 6 months to maintain negotiating leverage.`
        });
      }
    } else {
      recs.push({
        type: 'success',
        title: `Self-Sustaining Positive Cash Flow (+${formatMoney(res.netProfit)} / mo)`,
        body: `The business generates positive net margin of ${res.netMarginPct.toFixed(1)}%. Reinvest profits into high-ROI expansion levers or build defensive treasury reserves.`
      });
    }

    // 4. Churn Diagnostics
    if (m.churn > 5.0) {
      recs.push({
        type: 'warning',
        title: `Elevated Monthly Churn (${m.churn.toFixed(1)}%)`,
        body: `High customer attrition erodes enterprise valuation. Audit customer onboarding drop-offs, incentivize annual prepaid contracts, and establish proactive customer success triggers.`
      });
    }

    return recs;
  }

  // Render Core UI & Outputs
  function renderAll() {
    const res = calculateMetrics(model);

    // Score Number & Badge
    scoreNumber.textContent = res.totalScore;
    scoreBadge.className = `score-badge ${res.tierClass}`;
    scoreBadge.textContent = res.tierTitle;
    scoreSummaryText.textContent = res.summaryText;

    // SVG Circular Gauge
    // Circumference = 2 * PI * 70 = 439.82
    const circumference = 439.82;
    const offset = circumference - (res.totalScore / 100) * circumference;
    gaugeProgress.setAttribute('stroke-dashoffset', offset);

    let gaugeColor = '#34d399'; // exceptional
    if (res.totalScore < 50) gaugeColor = '#f87171'; // critical
    else if (res.totalScore < 70) gaugeColor = '#fbbf24'; // moderate
    else if (res.totalScore < 85) gaugeColor = '#60a5fa'; // healthy
    gaugeProgress.setAttribute('stroke', gaugeColor);

    // Mini cards
    outGrossMargin.textContent = `${res.grossMarginPct.toFixed(1)}%`;
    outGrossProfit.textContent = `${formatMoney(res.grossProfit)} profit`;

    outNetMargin.textContent = `${res.netMarginPct.toFixed(1)}%`;
    outNetProfit.textContent = res.isProfitable 
      ? `+${formatMoney(res.netProfit)} / mo` 
      : `-${formatMoney(res.monthlyBurn)} / mo`;

    outLtvCac.textContent = `${res.ltvCacRatio.toFixed(1)}x`;
    outLtvSub.textContent = res.ltvCacRatio >= 3.0 ? 'Strong unit economics' : 'Under 3.0x benchmark';

    outRunway.textContent = res.runwayText;
    outBurnSub.textContent = res.isProfitable ? '$0 net burn' : `${formatMoney(res.monthlyBurn)} monthly burn`;

    // Recommendations
    const recs = generateRecommendations(model, res);
    recsContainer.innerHTML = '';
    recs.forEach(r => {
      const card = document.createElement('div');
      card.className = `rec-card rec-${r.type}`;

      let iconSvg = '';
      if (r.type === 'danger') {
        iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
      } else if (r.type === 'warning') {
        iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
      } else {
        iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      }

      card.innerHTML = `
        <div class="rec-icon">${iconSvg}</div>
        <div class="rec-content">
          <h4>${r.title}</h4>
          <p>${r.body}</p>
        </div>
      `;
      recsContainer.appendChild(card);
    });

    // Run sensitivity simulation
    renderSimulation();
  }

  // Simulation calculation
  function renderSimulation() {
    const revMod = 1 + (simModifiers.revDelta / 100);
    const cacMod = 1 + (simModifiers.cacDelta / 100);
    const churnMod = Math.max(0.1, model.churn + simModifiers.churnDelta);

    const simModel = {
      revenue: model.revenue * revMod,
      cogs: model.cogs * revMod, // assumes variable COGS scales with rev
      opex: model.opex,
      cash: model.cash,
      cac: model.cac * cacMod,
      ltv: model.ltv,
      churn: churnMod,
      customers: model.customers
    };

    const simRes = calculateMetrics(simModel);

    simRevDisplay.textContent = (simModifiers.revDelta >= 0 ? '+' : '') + simModifiers.revDelta + '%';
    simCacDisplay.textContent = (simModifiers.cacDelta >= 0 ? '+' : '') + simModifiers.cacDelta + '%';
    simChurnDisplay.textContent = (simModifiers.churnDelta >= 0 ? '+' : '') + simModifiers.churnDelta.toFixed(1) + '%';

    simProjProfit.textContent = (simRes.netProfit >= 0 ? '+' : '') + formatMoney(simRes.netProfit);
    simProjProfit.style.color = simRes.netProfit >= 0 ? 'var(--accent)' : 'var(--error)';

    simProjScore.textContent = `${simRes.totalScore} / 100`;
    simProjScore.style.color = simRes.totalScore >= 70 ? '#10b981' : (simRes.totalScore >= 50 ? '#f59e0b' : '#ef4444');
  }

  // Input event listeners
  [inpRevenue, inpCogs, inpOpex, inpCash, inpCac, inpLtv, inpChurn, inpCustomers].forEach(inp => {
    inp.addEventListener('input', () => {
      readInputs();
      renderAll();
    });
  });

  // Slider event listeners
  simRevSlider.addEventListener('input', (e) => {
    simModifiers.revDelta = parseFloat(e.target.value) || 0;
    renderSimulation();
  });

  simCacSlider.addEventListener('input', (e) => {
    simModifiers.cacDelta = parseFloat(e.target.value) || 0;
    renderSimulation();
  });

  simChurnSlider.addEventListener('input', (e) => {
    simModifiers.churnDelta = parseFloat(e.target.value) || 0;
    renderSimulation();
  });

  btnResetSim.addEventListener('click', () => {
    simModifiers = { revDelta: 0, cacDelta: 0, churnDelta: 0 };
    simRevSlider.value = 0;
    simCacSlider.value = 0;
    simChurnSlider.value = 0;
    renderSimulation();
  });

  // Preset Buttons
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.getAttribute('data-preset');
      if (PRESETS[presetKey]) {
        presetButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        model = JSON.parse(JSON.stringify(PRESETS[presetKey]));
        saveState();
        syncInputs();
        btnResetSim.click();
        renderAll();
      }
    });
  });

  // Copy Summary to Clipboard
  btnCopyReport.addEventListener('click', () => {
    const res = calculateMetrics(model);
    const summaryMarkdown = `
# Executive Business Health & Unit Economics Report
**Date:** ${new Date().toISOString().slice(0, 10)}
**Composite Business Health Score:** ${res.totalScore} / 100 (${res.tierTitle})

### Financial Fundamentals:
- Monthly Revenue: ${formatMoney(model.revenue)}
- Cost of Goods Sold (COGS): ${formatMoney(model.cogs)}
- Gross Profit: ${formatMoney(res.grossProfit)} (${res.grossMarginPct.toFixed(1)}% Gross Margin)
- Operating Expenses (OPEX): ${formatMoney(model.opex)}
- Net Profit / (Loss): ${formatMoney(res.netProfit)} (${res.netMarginPct.toFixed(1)}% Net Margin)
- Monthly Cash Burn: ${formatMoney(res.monthlyBurn)}
- Cash on Hand: ${formatMoney(model.cash)}
- Cash Runway: ${res.runwayText}

### Unit Economics:
- Customer Acquisition Cost (CAC): ${formatMoney(model.cac)}
- Customer Lifetime Value (LTV): ${formatMoney(model.ltv)}
- LTV : CAC Ratio: ${res.ltvCacRatio.toFixed(1)}x (Target: >= 3.0x)
- Monthly Churn Rate: ${model.churn.toFixed(1)}%
- Active Customer Count: ${model.customers}
    `.trim();

    navigator.clipboard.writeText(summaryMarkdown).then(() => {
      alert('Executive summary report copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy to clipboard. Please copy manually.');
    });
  });

  // Export CSV
  btnExportCsv.addEventListener('click', () => {
    const res = calculateMetrics(model);
    const headers = ['Metric', 'Value', 'Unit / Benchmark'];
    const rows = [
      ['Monthly Revenue', model.revenue, 'USD'],
      ['COGS', model.cogs, 'USD'],
      ['Gross Profit', res.grossProfit, 'USD'],
      ['Gross Margin %', res.grossMarginPct.toFixed(2), '%'],
      ['Operating Expenses (OPEX)', model.opex, 'USD'],
      ['Net Profit / Loss', res.netProfit, 'USD'],
      ['Net Profit Margin %', res.netMarginPct.toFixed(2), '%'],
      ['Monthly Burn Rate', res.monthlyBurn, 'USD'],
      ['Cash Reserves', model.cash, 'USD'],
      ['Runway', res.runwayText, 'Months'],
      ['Customer Acquisition Cost (CAC)', model.cac, 'USD'],
      ['Customer Lifetime Value (LTV)', model.ltv, 'USD'],
      ['LTV:CAC Ratio', res.ltvCacRatio.toFixed(2), 'Ratio'],
      ['Monthly Churn Rate', model.churn, '%'],
      ['Composite Business Health Score', res.totalScore, 'Score (0-100)'],
      ['Health Tier', `"${res.tierTitle}"`, 'Classification']
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smart-business-analysis-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Initialize
  syncInputs();
  renderAll();
});