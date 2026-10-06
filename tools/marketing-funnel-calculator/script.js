/**
 * Marketing Funnel Calculator
 * High-precision customer acquisition funnel analytics, leakage auditor, and interactive SVG pipeline visualization.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Element References ---
  const currencySelect = document.getElementById('currency-select');
  const totalBudgetInput = document.getElementById('total-budget');
  const customerLtvInput = document.getElementById('customer-ltv');

  const stageInputs = [
    document.getElementById('input-stage-1'),
    document.getElementById('input-stage-2'),
    document.getElementById('input-stage-3'),
    document.getElementById('input-stage-4'),
    document.getElementById('input-stage-5')
  ];

  const rateLabels = [
    document.getElementById('rate-stage-1'),
    document.getElementById('rate-stage-2'),
    document.getElementById('rate-stage-3'),
    document.getElementById('rate-stage-4'),
    document.getElementById('rate-stage-5')
  ];

  const costLabels = [
    document.getElementById('cost-stage-1'),
    document.getElementById('cost-stage-2'),
    document.getElementById('cost-stage-3'),
    document.getElementById('cost-stage-4'),
    document.getElementById('cost-stage-5')
  ];

  const dropLabels = [
    document.getElementById('drop-stage-1'),
    document.getElementById('drop-stage-2'),
    document.getElementById('drop-stage-3'),
    document.getElementById('drop-stage-4'),
    document.getElementById('drop-stage-5')
  ];

  const kpiOverallRate = document.getElementById('kpi-overall-rate');
  const kpiVisitorToCust = document.getElementById('kpi-visitor-to-cust');
  const kpiCac = document.getElementById('kpi-cac');
  const kpiCplSub = document.getElementById('kpi-cpl-sub');
  const kpiRevenue = document.getElementById('kpi-revenue');
  const kpiRoas = document.getElementById('kpi-roas');
  const kpiNetProfit = document.getElementById('kpi-net-profit');
  const kpiRoi = document.getElementById('kpi-roi');

  const bottleneckTitle = document.getElementById('bottleneck-title');
  const bottleneckDesc = document.getElementById('bottleneck-desc');

  const funnelSvg = document.getElementById('funnel-svg');
  const funnelTooltip = document.getElementById('funnel-tooltip');
  const funnelTableBody = document.getElementById('funnel-table-body');

  const btnRecalculate = document.getElementById('btn-recalculate');
  const btnReset = document.getElementById('btn-reset');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnCopySummary = document.getElementById('btn-copy-summary');

  const targetCustomersInput = document.getElementById('target-customers-input');
  const btnCalcTarget = document.getElementById('btn-calc-target');
  const targetSolverResults = document.getElementById('target-solver-results');

  const presetButtons = document.querySelectorAll('.preset-btn');

  // --- Stage Definitions ---
  const STAGE_NAMES = [
    'Impressions / Reach',
    'Site Visitors / Clicks',
    'Leads / Signups',
    'Marketing Qualified (MQL)',
    'Paying Customers'
  ];

  const STAGE_SHORT = ['Impressions', 'Visitors', 'Leads', 'MQL', 'Customers'];

  // Presets definition
  const PRESETS = {
    'b2b-saas': {
      budget: 6000,
      ltv: 1200,
      stages: [65000, 2200, 220, 75, 18]
    },
    'ecommerce': {
      budget: 4500,
      ltv: 78,
      stages: [280000, 9500, 950, 420, 210]
    },
    'agency-leadgen': {
      budget: 3500,
      ltv: 1800,
      stages: [45000, 1600, 180, 55, 14]
    },
    'high-ticket': {
      budget: 5000,
      ltv: 4500,
      stages: [30000, 900, 110, 32, 7]
    },
    'mobile-app': {
      budget: 3000,
      ltv: 35,
      stages: [150000, 7500, 1850, 620, 180]
    }
  };

  // Default state snapshot
  const DEFAULT_VALUES = {
    currency: '$',
    budget: 5000,
    ltv: 350,
    stages: [100000, 3500, 350, 105, 25]
  };

  // --- Formatting Helpers ---
  function getCurrency() {
    return currencySelect ? currencySelect.value : '$';
  }

  function formatMoney(amount) {
    const sym = getCurrency();
    if (isNaN(amount) || !isFinite(amount)) return `${sym}0.00`;
    return `${sym}${Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  function formatInt(num) {
    if (isNaN(num) || !isFinite(num)) return '0';
    return Math.round(num).toLocaleString('en-US');
  }

  function formatPercent(val) {
    if (isNaN(val) || !isFinite(val)) return '0.00%';
    return `${val.toFixed(2)}%`;
  }

  // --- Calculation Logic ---
  function computeFunnelData() {
    const budget = Math.max(0, parseFloat(totalBudgetInput.value) || 0);
    const ltv = Math.max(0, parseFloat(customerLtvInput.value) || 0);

    const values = stageInputs.map((input, idx) => {
      let val = Math.max(0, parseFloat(input.value) || 0);
      return val;
    });

    // Auto-sanitization: prevent each lower stage from exceeding upper stage
    for (let i = 1; i < values.length; i++) {
      if (values[i] > values[i - 1] && values[i - 1] > 0) {
        // Allow user input but clamp for calculation if needed, or notify
      }
    }

    const stage1 = values[0];
    const stage2 = values[1];
    const stage3 = values[2];
    const stage4 = values[3];
    const stage5 = values[4];

    // Conversion rates between consecutive stages
    const ctr = stage1 > 0 ? (stage2 / stage1) * 100 : 0;
    const v2l = stage2 > 0 ? (stage3 / stage2) * 100 : 0;
    const l2m = stage3 > 0 ? (stage4 / stage3) * 100 : 0;
    const m2c = stage4 > 0 ? (stage5 / stage4) * 100 : 0;

    // Overall conversion rates
    const overallRate = stage1 > 0 ? (stage5 / stage1) * 100 : 0;
    const visitorToCust = stage2 > 0 ? (stage5 / stage2) * 100 : 0;

    // Unit costs
    const cpm = stage1 > 0 ? (budget / stage1) * 1000 : 0;
    const cpc = stage2 > 0 ? budget / stage2 : 0;
    const cpl = stage3 > 0 ? budget / stage3 : 0;
    const cpmql = stage4 > 0 ? budget / stage4 : 0;
    const cac = stage5 > 0 ? budget / stage5 : 0;

    // Financial returns
    const grossRevenue = stage5 * ltv;
    const netProfit = grossRevenue - budget;
    const roas = budget > 0 ? (grossRevenue / budget) * 100 : 0;
    const roi = budget > 0 ? ((grossRevenue - budget) / budget) * 100 : 0;

    // Drop-offs & Leakages
    const dropOffs = [
      { dropCount: 0, dropRate: 0, from: 'Origin', to: STAGE_NAMES[0] },
      {
        dropCount: Math.max(0, stage1 - stage2),
        dropRate: stage1 > 0 ? Math.max(0, (stage1 - stage2) / stage1) * 100 : 0,
        from: STAGE_NAMES[0],
        to: STAGE_NAMES[1]
      },
      {
        dropCount: Math.max(0, stage2 - stage3),
        dropRate: stage2 > 0 ? Math.max(0, (stage2 - stage3) / stage2) * 100 : 0,
        from: STAGE_NAMES[1],
        to: STAGE_NAMES[2]
      },
      {
        dropCount: Math.max(0, stage3 - stage4),
        dropRate: stage3 > 0 ? Math.max(0, (stage3 - stage4) / stage3) * 100 : 0,
        from: STAGE_NAMES[2],
        to: STAGE_NAMES[3]
      },
      {
        dropCount: Math.max(0, stage4 - stage5),
        dropRate: stage4 > 0 ? Math.max(0, (stage4 - stage5) / stage4) * 100 : 0,
        from: STAGE_NAMES[3],
        to: STAGE_NAMES[4]
      }
    ];

    // Identify biggest bottleneck (excluding impressions-to-clicks since impressions drop is always naturally high >90%)
    // Compare transitions: Visitors->Leads, Leads->MQL, MQL->Customers
    const transitions = [
      {
        name: 'Traffic Conversion (Visitors → Leads)',
        from: STAGE_SHORT[1],
        to: STAGE_SHORT[2],
        dropRate: dropOffs[2].dropRate,
        dropCount: dropOffs[2].dropCount,
        convRate: v2l,
        advice: 'Landing Page & Offer Leakage: Over 80% of landing page visitors leave without opting in. Test clearer headline value props, simplify lead forms, speed up page load time, and add social proof.',
        severity: dropOffs[2].dropRate > 90 ? 'critical' : 'moderate'
      },
      {
        name: 'Lead Qualification (Leads → MQL)',
        from: STAGE_SHORT[2],
        to: STAGE_SHORT[3],
        dropRate: dropOffs[3].dropRate,
        dropCount: dropOffs[3].dropCount,
        convRate: l2m,
        advice: 'Targeting & Nurturing Disconnect: A high drop here indicates unqualified ad audience or lack of automated email sequences. Refine ICP ad demographics and implement instant lead nurturing workflows.',
        severity: dropOffs[3].dropRate > 75 ? 'critical' : 'moderate'
      },
      {
        name: 'Sales Conversion (MQL → Paying Customers)',
        from: STAGE_SHORT[3],
        to: STAGE_SHORT[4],
        dropRate: dropOffs[4].dropRate,
        dropCount: dropOffs[4].dropCount,
        convRate: m2c,
        advice: 'Bottom of Funnel Friction: Qualified prospects are stalling before checkout/contract. Review pricing barriers, offer risk-free guarantees or trials, reduce sales friction, and train closing reps.',
        severity: dropOffs[4].dropRate > 85 ? 'critical' : 'moderate'
      }
    ];

    // Find the transition with highest drop-off rate or lowest relative efficiency
    let worstTransition = transitions[0];
    for (const t of transitions) {
      if (t.dropRate > worstTransition.dropRate) {
        worstTransition = t;
      }
    }

    return {
      budget,
      ltv,
      values,
      rates: [100, ctr, v2l, l2m, m2c],
      overallRate,
      visitorToCust,
      costs: [cpm, cpc, cpl, cpmql, cac],
      grossRevenue,
      netProfit,
      roas,
      roi,
      dropOffs,
      worstTransition,
      transitions
    };
  }

  // --- Render UI Updates ---
  function updateUI() {
    const data = computeFunnelData();

    // 1. Update Input Card Badges & Metrics
    if (rateLabels[0]) rateLabels[0].textContent = 'Top of Funnel';
    if (rateLabels[1]) rateLabels[1].textContent = `CTR: ${formatPercent(data.rates[1])}`;
    if (rateLabels[2]) rateLabels[2].textContent = `Conv: ${formatPercent(data.rates[2])}`;
    if (rateLabels[3]) rateLabels[3].textContent = `Qual: ${formatPercent(data.rates[3])}`;
    if (rateLabels[4]) rateLabels[4].textContent = `Close: ${formatPercent(data.rates[4])}`;

    if (costLabels[0]) costLabels[0].textContent = `CPM: ${formatMoney(data.costs[0])}`;
    if (costLabels[1]) costLabels[1].textContent = `CPC: ${formatMoney(data.costs[1])}`;
    if (costLabels[2]) costLabels[2].textContent = `CPL: ${formatMoney(data.costs[2])}`;
    if (costLabels[3]) costLabels[3].textContent = `CP-MQL: ${formatMoney(data.costs[3])}`;
    if (costLabels[4]) costLabels[4].textContent = `CAC: ${formatMoney(data.costs[4])}`;

    if (dropLabels[0]) dropLabels[0].textContent = 'Baseline 100%';
    for (let i = 1; i <= 4; i++) {
      if (dropLabels[i]) {
        dropLabels[i].textContent = `Drop: ${formatPercent(data.dropOffs[i].dropRate)}`;
      }
    }

    // 2. Update KPI Hero Cards
    if (kpiOverallRate) kpiOverallRate.textContent = formatPercent(data.overallRate);
    if (kpiVisitorToCust) kpiVisitorToCust.textContent = `${formatPercent(data.visitorToCust)} of visitors turn paying`;
    if (kpiCac) kpiCac.textContent = formatMoney(data.costs[4]);
    if (kpiCplSub) kpiCplSub.textContent = `CPL: ${formatMoney(data.costs[2])} | CPC: ${formatMoney(data.costs[1])}`;
    if (kpiRevenue) kpiRevenue.textContent = formatMoney(data.grossRevenue);
    if (kpiRoas) kpiRoas.textContent = `ROAS: ${(data.roas / 100).toFixed(2)}x (${data.roas.toFixed(1)}%)`;

    if (kpiNetProfit) {
      kpiNetProfit.textContent = `${data.netProfit >= 0 ? '+' : ''}${formatMoney(data.netProfit)}`;
      kpiNetProfit.style.color = data.netProfit >= 0 ? '#34d399' : '#f87171';
    }
    if (kpiRoi) {
      kpiRoi.textContent = `ROI: ${data.roi >= 0 ? '+' : ''}${data.roi.toFixed(1)}% on ad spend`;
    }

    // 3. Bottleneck Banner
    if (bottleneckTitle && bottleneckDesc) {
      const b = data.worstTransition;
      bottleneckTitle.textContent = `Bottleneck Alert: ${b.name} (${formatPercent(b.dropRate)} drop)`;
      bottleneckDesc.textContent = `${b.advice} Lost volume at this stage: ${formatInt(b.dropCount)} leads/prospects.`;
    }

    // 4. Update Funnel Table
    renderTable(data);

    // 5. Render SVG Funnel
    renderSvgFunnel(data);
  }

  // --- Render Table ---
  function renderTable(data) {
    if (!funnelTableBody) return;
    funnelTableBody.innerHTML = '';

    const costHeaders = ['CPM (per 1k)', 'Cost per Click', 'Cost per Lead', 'Cost per MQL', 'Cost per Customer (CAC)'];

    STAGE_NAMES.forEach((name, idx) => {
      const tr = document.createElement('tr');

      const count = data.values[idx];
      const rate = idx === 0 ? '100.00% (Base)' : formatPercent(data.rates[idx]);
      const drop = idx === 0 ? 'None' : `${formatInt(data.dropOffs[idx].dropCount)} (${formatPercent(data.dropOffs[idx].dropRate)})`;
      const cost = formatMoney(data.costs[idx]);

      let severityBadge = '';
      if (idx === 0) {
        severityBadge = `<span class="leakage-badge low">Top of Pipeline</span>`;
      } else {
        const dropRate = data.dropOffs[idx].dropRate;
        if (dropRate > 85) {
          severityBadge = `<span class="leakage-badge">High Leakage (${formatPercent(dropRate)})</span>`;
        } else if (dropRate > 50) {
          severityBadge = `<span class="leakage-badge medium">Moderate (${formatPercent(dropRate)})</span>`;
        } else {
          severityBadge = `<span class="leakage-badge low">Healthy Retention</span>`;
        }
      }

      tr.innerHTML = `
        <td>
          <div style="font-weight: 600; color: var(--text-primary);">${name}</div>
          <div style="font-size: 0.75rem; color: var(--text-tertiary);">Stage ${idx + 1}</div>
        </td>
        <td style="font-weight: 700; font-family: monospace; font-size: 0.95rem; color: var(--accent);">${formatInt(count)}</td>
        <td style="font-weight: 600;">${rate}</td>
        <td style="color: ${idx === 0 ? 'var(--text-tertiary)' : '#f87171'};">${drop}</td>
        <td style="font-weight: 600; color: var(--text-primary);">${cost} <span style="font-size:0.7rem; color:var(--text-tertiary);">(${costHeaders[idx]})</span></td>
        <td>${severityBadge}</td>
      `;

      funnelTableBody.appendChild(tr);
    });
  }

  // --- Render Interactive SVG Funnel ---
  function renderSvgFunnel(data) {
    if (!funnelSvg) return;

    const width = 680;
    const height = 380;
    const paddingX = 40;
    const paddingY = 20;

    const availableHeight = height - paddingY * 2;
    const stageCount = 5;
    const gap = 8;
    const stageHeight = (availableHeight - (stageCount - 1) * gap) / stageCount;

    // Palette gradients for stages
    const STAGE_COLORS = [
      { top: '#4e85bf', bot: '#3a6699', stroke: '#89aacc' },
      { top: '#3b82f6', bot: '#2563eb', stroke: '#60a5fa' },
      { top: '#06b6d4', bot: '#0891b2', stroke: '#22d3ee' },
      { top: '#10b981', bot: '#059669', stroke: '#34d399' },
      { top: '#f59e0b', bot: '#d97706', stroke: '#fbbf24' }
    ];

    // Width percentages for the funnel trapezoids:
    // Stage 1: 100% -> 82%
    // Stage 2: 82% -> 66%
    // Stage 3: 66% -> 50%
    // Stage 4: 50% -> 36%
    // Stage 5: 36% -> 24%
    const widthsRatio = [
      { top: 1.0, bot: 0.82 },
      { top: 0.82, bot: 0.66 },
      { top: 0.66, bot: 0.50 },
      { top: 0.50, bot: 0.36 },
      { top: 0.36, bot: 0.24 }
    ];

    const maxFunnelWidth = width - paddingX * 2;
    const centerX = width / 2;

    let svgInner = `
      <defs>
        ${STAGE_COLORS.map((c, i) => `
          <linearGradient id="funnelGrad${i}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${c.top}" stop-opacity="0.85" />
            <stop offset="100%" stop-color="${c.bot}" stop-opacity="0.95" />
          </linearGradient>
        `).join('')}
        <filter id="funnelShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.4" />
        </filter>
      </defs>
    `;

    for (let i = 0; i < stageCount; i++) {
      const yTop = paddingY + i * (stageHeight + gap);
      const yBot = yTop + stageHeight;

      const wTop = maxFunnelWidth * widthsRatio[i].top;
      const wBot = maxFunnelWidth * widthsRatio[i].bot;

      const xTopLeft = centerX - wTop / 2;
      const xTopRight = centerX + wTop / 2;
      const xBotLeft = centerX - wBot / 2;
      const xBotRight = centerX + wBot / 2;

      // Polygon points
      const points = `${xTopLeft},${yTop} ${xTopRight},${yTop} ${xBotRight},${yBot} ${xBotLeft},${yBot}`;

      const stageVal = data.values[i];
      const stageRate = i === 0 ? '100%' : `${formatPercent(data.rates[i])}`;
      const dropRate = i === 0 ? 'Base' : `-${formatPercent(data.dropOffs[i].dropRate)}`;

      svgInner += `
        <g class="funnel-stage-group" data-stage-index="${i}">
          <polygon
            class="funnel-trapezoid"
            points="${points}"
            fill="url(#funnelGrad${i})"
            stroke="${STAGE_COLORS[i].stroke}"
            stroke-width="1.5"
            filter="url(#funnelShadow)"
          />
          <!-- Center stage text -->
          <text class="funnel-stage-text" x="${centerX}" y="${yTop + stageHeight / 2 - 4}" text-anchor="middle" fill="#ffffff" font-size="13.5" font-weight="700">
            ${STAGE_NAMES[i]}
          </text>
          <text class="funnel-stage-text" x="${centerX}" y="${yTop + stageHeight / 2 + 15}" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-size="12" font-weight="600" font-family="monospace">
            ${formatInt(stageVal)} | Step: ${stageRate}
          </text>
          
          <!-- Drop off pill indicator to the right side if not stage 1 -->
          ${i > 0 ? `
            <g class="funnel-drop-tag" transform="translate(${xTopRight + 12}, ${yTop + stageHeight / 2})">
              <rect x="0" y="-11" width="85" height="22" rx="11" fill="rgba(239, 68, 68, 0.2)" stroke="rgba(239, 68, 68, 0.5)" stroke-width="1" />
              <text x="42" y="4" text-anchor="middle" fill="#fca5a5" font-size="10.5" font-weight="700">${dropRate}</text>
            </g>
          ` : `
            <g class="funnel-drop-tag" transform="translate(${xTopRight + 12}, ${yTop + stageHeight / 2})">
              <rect x="0" y="-11" width="75" height="22" rx="11" fill="rgba(137, 170, 204, 0.2)" stroke="rgba(137, 170, 204, 0.4)" stroke-width="1" />
              <text x="37" y="4" text-anchor="middle" fill="#89aacc" font-size="10.5" font-weight="700">Top 100%</text>
            </g>
          `}
        </g>
      `;
    }

    funnelSvg.innerHTML = svgInner;

    // Attach hover tooltips
    attachSvgTooltips(data);
  }

  // --- Attach SVG Interactive Tooltips ---
  function attachSvgTooltips(data) {
    const stageGroups = funnelSvg.querySelectorAll('.funnel-stage-group');

    stageGroups.forEach((group) => {
      const stageIdx = parseInt(group.getAttribute('data-stage-index'), 10);
      const poly = group.querySelector('polygon');

      poly.addEventListener('mouseenter', (e) => {
        const val = data.values[stageIdx];
        const cost = data.costs[stageIdx];
        const rate = stageIdx === 0 ? 'Top of Funnel' : `Conversion from previous: ${formatPercent(data.rates[stageIdx])}`;
        const drop = stageIdx === 0 ? 'Origin point' : `Dropped: ${formatInt(data.dropOffs[stageIdx].dropCount)} (${formatPercent(data.dropOffs[stageIdx].dropRate)})`;

        funnelTooltip.innerHTML = `
          <div style="font-weight:700; color:var(--accent); font-size:0.9rem; margin-bottom:0.25rem;">${STAGE_NAMES[stageIdx]}</div>
          <div><strong>Volume:</strong> ${formatInt(val)}</div>
          <div><strong>Step Rate:</strong> ${rate}</div>
          <div><strong>Loss:</strong> ${drop}</div>
          <div><strong>Unit Cost:</strong> ${formatMoney(cost)}</div>
        `;
        funnelTooltip.style.display = 'block';
      });

      poly.addEventListener('mousemove', (e) => {
        const rect = funnelSvg.getBoundingClientRect();
        const offsetX = e.clientX - rect.left + 15;
        const offsetY = e.clientY - rect.top + 15;
        funnelTooltip.style.left = `${offsetX}px`;
        funnelTooltip.style.top = `${offsetY}px`;
      });

      poly.addEventListener('mouseleave', () => {
        funnelTooltip.style.display = 'none';
      });

      // Quick scroll to input on click
      poly.addEventListener('click', () => {
        stageInputs[stageIdx].scrollIntoView({ behavior: 'smooth', block: 'center' });
        stageInputs[stageIdx].focus();
      });
    });
  }

  // --- Reverse Goal Solver ---
  function handleTargetSolver() {
    if (!targetCustomersInput || !targetSolverResults) return;

    const targetCustomers = Math.max(1, parseFloat(targetCustomersInput.value) || 0);
    const data = computeFunnelData();

    // Check if conversion rates are valid
    if (data.rates[1] <= 0 || data.rates[2] <= 0 || data.rates[3] <= 0 || data.rates[4] <= 0) {
      targetSolverResults.style.display = 'block';
      targetSolverResults.innerHTML = `
        <div class="alert-error">
          Cannot back-calculate required traffic because one or more stage conversion rates are 0%. Please set non-zero volumes across all stages.
        </div>
      `;
      return;
    }

    // Step rates as decimals
    const rM2C = data.rates[4] / 100;
    const rL2M = data.rates[3] / 100;
    const rV2L = data.rates[2] / 100;
    const rI2V = data.rates[1] / 100;

    const reqMql = Math.ceil(targetCustomers / rM2C);
    const reqLeads = Math.ceil(reqMql / rL2M);
    const reqVisitors = Math.ceil(reqLeads / rV2L);
    const reqImpressions = Math.ceil(reqVisitors / rI2V);

    const estBudget = targetCustomers * data.costs[4];
    const estRevenue = targetCustomers * data.ltv;
    const estProfit = estRevenue - estBudget;

    targetSolverResults.style.display = 'block';
    targetSolverResults.innerHTML = `
      <div style="background: var(--bg-tertiary); border: 1px solid var(--accent); border-radius: var(--radius-md); padding: 1.25rem;">
        <div style="font-weight: 700; color: var(--accent); font-size: 0.95rem; margin-bottom: 0.75rem;">
          🎯 Pipeline Target Roadmap for ${formatInt(targetCustomers)} Paying Customers:
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem; margin-bottom: 1rem;">
          <div style="background: var(--surface); padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border);">
            <div style="font-size:0.75rem; color:var(--text-tertiary);">Req. Impressions</div>
            <div style="font-size:1.1rem; font-weight:700; color:var(--text-primary);">${formatInt(reqImpressions)}</div>
          </div>
          <div style="background: var(--surface); padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border);">
            <div style="font-size:0.75rem; color:var(--text-tertiary);">Req. Visitors</div>
            <div style="font-size:1.1rem; font-weight:700; color:var(--text-primary);">${formatInt(reqVisitors)}</div>
          </div>
          <div style="background: var(--surface); padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border);">
            <div style="font-size:0.75rem; color:var(--text-tertiary);">Req. Leads</div>
            <div style="font-size:1.1rem; font-weight:700; color:var(--text-primary);">${formatInt(reqLeads)}</div>
          </div>
          <div style="background: var(--surface); padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border);">
            <div style="font-size:0.75rem; color:var(--text-tertiary);">Req. MQLs</div>
            <div style="font-size:1.1rem; font-weight:700; color:var(--text-primary);">${formatInt(reqMql)}</div>
          </div>
        </div>
        <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
          • <strong>Required Ad Spend:</strong> ~${formatMoney(estBudget)} (at current CAC of ${formatMoney(data.costs[4])})<br>
          • <strong>Projected Revenue:</strong> ~${formatMoney(estRevenue)} (at ${formatMoney(data.ltv)} LTV)<br>
          • <strong>Projected Net Margin:</strong> <span style="color: ${estProfit >= 0 ? '#34d399' : '#f87171'}; font-weight:600;">${formatMoney(estProfit)}</span>
        </div>
      </div>
    `;
  }

  // --- CSV Export ---
  function exportCsv() {
    const data = computeFunnelData();
    const curr = getCurrency();

    let csv = `Marketing Funnel Performance Audit\n`;
    csv += `Total Budget,${curr}${data.budget}\n`;
    csv += `Average Customer LTV,${curr}${data.ltv}\n`;
    csv += `Overall Funnel Conversion Rate,${data.overallRate.toFixed(4)}%\n`;
    csv += `Visitor-to-Customer Rate,${data.visitorToCust.toFixed(4)}%\n`;
    csv += `Customer Acquisition Cost (CAC),${curr}${data.costs[4].toFixed(2)}\n`;
    csv += `Estimated Total Revenue,${curr}${data.grossRevenue.toFixed(2)}\n`;
    csv += `Estimated Net Profit,${curr}${data.netProfit.toFixed(2)}\n`;
    csv += `ROAS,${data.roas.toFixed(2)}%\n\n`;

    csv += `Stage Number,Stage Name,Volume,Step Conversion Rate,Drop-off Volume,Drop-off Rate,Unit Cost\n`;
    STAGE_NAMES.forEach((name, i) => {
      const stepRate = i === 0 ? '100%' : `${data.rates[i].toFixed(2)}%`;
      const dropCount = data.dropOffs[i].dropCount;
      const dropRate = `${data.dropOffs[i].dropRate.toFixed(2)}%`;
      const cost = `${curr}${data.costs[i].toFixed(2)}`;
      csv += `${i + 1},"${name}",${data.values[i]},${stepRate},${dropCount},${dropRate},${cost}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marketing_funnel_audit_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // --- Copy Summary Report ---
  function copySummaryReport() {
    const data = computeFunnelData();
    const curr = getCurrency();

    const summary = [
      `📊 MARKETING FUNNEL PERFORMANCE SUMMARY`,
      `-----------------------------------------`,
      `Total Budget: ${curr}${data.budget.toLocaleString()}`,
      `Total Revenue: ${curr}${data.grossRevenue.toLocaleString()}`,
      `Net Profit: ${curr}${data.netProfit.toLocaleString()} (ROI: ${data.roi.toFixed(1)}%)`,
      `ROAS: ${(data.roas / 100).toFixed(2)}x`,
      ``,
      `🎯 PIPELINE VOLUME & CONVERSIONS:`,
      `1. Impressions: ${formatInt(data.values[0])}`,
      `2. Site Visitors: ${formatInt(data.values[1])} (CTR: ${formatPercent(data.rates[1])} | CPC: ${formatMoney(data.costs[1])})`,
      `3. Leads: ${formatInt(data.values[2])} (Conv: ${formatPercent(data.rates[2])} | CPL: ${formatMoney(data.costs[2])})`,
      `4. MQLs: ${formatInt(data.values[3])} (Qual: ${formatPercent(data.rates[3])} | CP-MQL: ${formatMoney(data.costs[3])})`,
      `5. Customers: ${formatInt(data.values[4])} (Close: ${formatPercent(data.rates[4])} | CAC: ${formatMoney(data.costs[4])})`,
      ``,
      `⚠️ PRIMARY BOTTLENECK: ${data.worstTransition.name}`,
      `Loss: ${formatPercent(data.worstTransition.dropRate)} drop-off (${formatInt(data.worstTransition.dropCount)} lost prospects)`,
      `Recommendation: ${data.worstTransition.advice}`
    ].join('\n');

    navigator.clipboard.writeText(summary).then(() => {
      const origText = btnCopySummary.innerHTML;
      btnCopySummary.innerHTML = `✓ Copied!`;
      setTimeout(() => {
        btnCopySummary.innerHTML = origText;
      }, 2000);
    }).catch(() => {
      alert('Report copied to clipboard!');
    });
  }

  // --- Apply Preset ---
  function applyPreset(presetKey) {
    const p = PRESETS[presetKey];
    if (!p) return;

    totalBudgetInput.value = p.budget;
    customerLtvInput.value = p.ltv;
    p.stages.forEach((val, idx) => {
      if (stageInputs[idx]) {
        stageInputs[idx].value = val;
      }
    });

    presetButtons.forEach(btn => {
      if (btn.getAttribute('data-preset') === presetKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    updateUI();
  }

  // --- Reset to Defaults ---
  function resetDefaults() {
    currencySelect.value = DEFAULT_VALUES.currency;
    totalBudgetInput.value = DEFAULT_VALUES.budget;
    customerLtvInput.value = DEFAULT_VALUES.ltv;
    DEFAULT_VALUES.stages.forEach((val, idx) => {
      if (stageInputs[idx]) stageInputs[idx].value = val;
    });
    presetButtons.forEach(b => b.classList.remove('active'));
    if (targetSolverResults) targetSolverResults.style.display = 'none';
    updateUI();
  }

  // --- Event Listeners ---
  [currencySelect, totalBudgetInput, customerLtvInput, ...stageInputs].forEach(el => {
    if (el) {
      el.addEventListener('input', updateUI);
      el.addEventListener('change', updateUI);
    }
  });

  if (btnRecalculate) btnRecalculate.addEventListener('click', updateUI);
  if (btnReset) btnReset.addEventListener('click', resetDefaults);
  if (btnExportCsv) btnExportCsv.addEventListener('click', exportCsv);
  if (btnCopySummary) btnCopySummary.addEventListener('click', copySummaryReport);
  if (btnCalcTarget) btnCalcTarget.addEventListener('click', handleTargetSolver);

  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.getAttribute('data-preset');
      applyPreset(presetKey);
    });
  });

  // Initial Calculation Run
  updateUI();
});