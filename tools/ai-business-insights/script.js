// AI Business Insights & SWOT Diagnostic Heuristics Engine

const PRESETS = {
  saas: {
    revenue: 120000,
    margin: 22,
    churn: 2.2,
    cac: 480,
    ltv: 2850,
    cash: 450000,
    burn: 38000
  },
  seed: {
    revenue: 25000,
    margin: -45,
    churn: 5.2,
    cac: 240,
    ltv: 950,
    cash: 180000,
    burn: 32000
  },
  ecommerce: {
    revenue: 85000,
    margin: 14,
    churn: 6.5,
    cac: 38,
    ltv: 155,
    cash: 120000,
    burn: 18000
  },
  agency: {
    revenue: 65000,
    margin: 38,
    churn: 1.2,
    cac: 950,
    ltv: 8400,
    cash: 260000,
    burn: 8000
  }
};

const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
const formatNumber = (val) => new Intl.NumberFormat('en-US').format(Math.round(val));

function calculateDiagnostics() {
  const revenue = Math.max(0, parseFloat(document.getElementById('inp-revenue').value) || 0);
  const margin = parseFloat(document.getElementById('inp-margin').value) || 0;
  const churn = Math.max(0.1, parseFloat(document.getElementById('inp-churn').value) || 0.1);
  const cac = Math.max(1, parseFloat(document.getElementById('inp-cac').value) || 1);
  const ltv = Math.max(1, parseFloat(document.getElementById('inp-ltv').value) || 1);
  const cash = Math.max(0, parseFloat(document.getElementById('inp-cash').value) || 0);
  const burn = Math.max(0, parseFloat(document.getElementById('inp-burn').value) || 0);

  // Derived Key Metrics
  const ltvCacRatio = ltv / cac;
  const netProfit = revenue * (margin / 100);
  const runwayMonths = burn > 0 ? (cash / burn) : (netProfit > 0 ? 99 : 0);

  // Payback period approximation:
  // Average customer lifespan = 1 / (churn/100) months
  // Implied monthly revenue per customer = ltv / lifespan = ltv * (churn/100)
  // Contribution per month = monthly revenue * max(0.2, (margin > 0 ? margin/100 : 0.35))
  const monthlyArpu = ltv * (churn / 100);
  const grossMarginEst = margin > 0 ? Math.max(0.4, margin / 100 + 0.2) : 0.45;
  const paybackMonths = Math.max(0.5, cac / Math.max(1, monthlyArpu * grossMarginEst));

  // Heuristic Health Score Components (Each out of 25)
  // 1. Unit Economics
  let scoreUnit = 0;
  if (ltvCacRatio >= 5.0) scoreUnit = 25;
  else if (ltvCacRatio >= 4.0) scoreUnit = 23;
  else if (ltvCacRatio >= 3.0) scoreUnit = 19;
  else if (ltvCacRatio >= 2.0) scoreUnit = 13;
  else if (ltvCacRatio >= 1.0) scoreUnit = 7;
  else scoreUnit = 2;

  // 2. Profitability
  let scoreProfit = 0;
  if (margin >= 30) scoreProfit = 25;
  else if (margin >= 20) scoreProfit = 22;
  else if (margin >= 10) scoreProfit = 18;
  else if (margin >= 0) scoreProfit = 14;
  else if (margin >= -20) scoreProfit = 8;
  else scoreProfit = 3;

  // 3. Runway / Solvency
  let scoreRunway = 0;
  if (netProfit > 0 && cash >= burn * 3) {
    scoreRunway = 25; // Cash flow positive with buffer
  } else if (runwayMonths >= 24) {
    scoreRunway = 24;
  } else if (runwayMonths >= 18) {
    scoreRunway = 21;
  } else if (runwayMonths >= 12) {
    scoreRunway = 17;
  } else if (runwayMonths >= 6) {
    scoreRunway = 10;
  } else if (runwayMonths >= 3) {
    scoreRunway = 4;
  } else {
    scoreRunway = 1;
  }

  // 4. Retention Engine
  let scoreChurn = 0;
  if (churn <= 1.0) scoreChurn = 25;
  else if (churn <= 2.0) scoreChurn = 22;
  else if (churn <= 3.5) scoreChurn = 18;
  else if (churn <= 5.0) scoreChurn = 12;
  else if (churn <= 8.0) scoreChurn = 6;
  else scoreChurn = 2;

  const totalScore = Math.min(100, Math.max(0, scoreUnit + scoreProfit + scoreRunway + scoreChurn));

  return {
    revenue,
    margin,
    churn,
    cac,
    ltv,
    cash,
    burn,
    ltvCacRatio,
    netProfit,
    runwayMonths,
    paybackMonths,
    scoreUnit,
    scoreProfit,
    scoreRunway,
    scoreChurn,
    totalScore
  };
}

function renderUI() {
  const diag = calculateDiagnostics();

  // Render KPIs
  const kpiLtvCac = document.getElementById('kpi-ltv-cac');
  const kpiLtvCacSub = document.getElementById('kpi-ltv-cac-sub');
  const kpiRunway = document.getElementById('kpi-runway');
  const kpiRunwaySub = document.getElementById('kpi-runway-sub');
  const kpiNetProfit = document.getElementById('kpi-net-profit');
  const kpiNetProfitSub = document.getElementById('kpi-net-profit-sub');
  const kpiPayback = document.getElementById('kpi-payback');

  if (kpiLtvCac) {
    kpiLtvCac.textContent = `${diag.ltvCacRatio.toFixed(1)}x`;
    if (diag.ltvCacRatio >= 3.0) {
      kpiLtvCac.style.color = 'var(--success)';
      if (kpiLtvCacSub) kpiLtvCacSub.textContent = 'Excellent leverage (>= 3.0x)';
    } else if (diag.ltvCacRatio >= 1.5) {
      kpiLtvCac.style.color = 'var(--warning)';
      if (kpiLtvCacSub) kpiLtvCacSub.textContent = 'Moderate margin cushion';
    } else {
      kpiLtvCac.style.color = 'var(--danger)';
      if (kpiLtvCacSub) kpiLtvCacSub.textContent = 'Sub-economic (< 1.5x)';
    }
  }

  if (kpiRunway) {
    if (diag.netProfit > 0 && diag.burn <= 0) {
      kpiRunway.textContent = 'Infinite';
      if (kpiRunwaySub) kpiRunwaySub.textContent = 'Self-sustaining & profitable';
    } else {
      kpiRunway.textContent = `${diag.runwayMonths.toFixed(1)} Mo`;
      if (kpiRunwaySub) {
        kpiRunwaySub.textContent = diag.runwayMonths < 6 ? 'Critical cash urgency (< 6mo)' : (diag.runwayMonths < 12 ? 'Moderate cash window' : 'Healthy runway buffer');
      }
    }
  }

  if (kpiNetProfit) {
    kpiNetProfit.textContent = formatCurrency(diag.netProfit);
    kpiNetProfit.style.color = diag.netProfit >= 0 ? 'var(--text-primary)' : 'var(--danger)';
    if (kpiNetProfitSub) kpiNetProfitSub.textContent = `${diag.margin >= 0 ? '+' : ''}${diag.margin.toFixed(1)}% Net Margin`;
  }

  if (kpiPayback) {
    kpiPayback.textContent = `~${diag.paybackMonths.toFixed(1)} Mo`;
  }

  // Health Score Gauge
  const healthScoreVal = document.getElementById('health-score-val');
  const scoreGaugeArc = document.getElementById('score-gauge-arc');
  const healthGradeBadge = document.getElementById('health-grade-badge');

  if (healthScoreVal) healthScoreVal.textContent = diag.totalScore;

  if (scoreGaugeArc) {
    const circumference = 440; // 2 * PI * 70
    const offset = circumference - (circumference * (diag.totalScore / 100));
    scoreGaugeArc.style.strokeDashoffset = offset;

    if (diag.totalScore >= 80) {
      scoreGaugeArc.style.stroke = '#10b981';
    } else if (diag.totalScore >= 60) {
      scoreGaugeArc.style.stroke = '#89aacc';
    } else if (diag.totalScore >= 45) {
      scoreGaugeArc.style.stroke = '#f59e0b';
    } else {
      scoreGaugeArc.style.stroke = '#ef4444';
    }
  }

  if (healthGradeBadge) {
    if (diag.totalScore >= 82) {
      healthGradeBadge.textContent = 'Pinnacle Health';
      healthGradeBadge.className = 'score-grade-badge priority-growth';
    } else if (diag.totalScore >= 68) {
      healthGradeBadge.textContent = 'Resilient Health';
      healthGradeBadge.className = 'score-grade-badge priority-medium';
    } else if (diag.totalScore >= 48) {
      healthGradeBadge.textContent = 'Moderate Exposure';
      healthGradeBadge.className = 'score-grade-badge priority-high';
    } else {
      healthGradeBadge.textContent = 'Critical Burn Alert';
      healthGradeBadge.className = 'score-grade-badge priority-critical';
    }
  }

  // Breakdown items
  const partUnit = document.getElementById('score-part-unit');
  const partProfit = document.getElementById('score-part-profit');
  const partRunway = document.getElementById('score-part-runway');
  const partChurn = document.getElementById('score-part-churn');

  if (partUnit) partUnit.textContent = `${diag.scoreUnit}/25`;
  if (partProfit) partProfit.textContent = `${diag.scoreProfit}/25`;
  if (partRunway) partRunway.textContent = `${diag.scoreRunway}/25`;
  if (partChurn) partChurn.textContent = `${diag.scoreChurn}/25`;

  renderSWOT(diag);
  renderRecommendations(diag);
}

function renderSWOT(diag) {
  const strengths = [];
  const weaknesses = [];
  const opportunities = [];
  const threats = [];

  // Strengths
  if (diag.ltvCacRatio >= 3.5) {
    strengths.push(`Outstanding unit economics: LTV:CAC ratio of <strong>${diag.ltvCacRatio.toFixed(1)}x</strong> provides aggressive acquisition headroom.`);
  } else if (diag.ltvCacRatio >= 2.5) {
    strengths.push(`Viable customer economics with LTV ($${formatNumber(diag.ltv)}) safely offsetting CAC ($${formatNumber(diag.cac)}).`);
  }
  if (diag.margin >= 18) {
    strengths.push(`Strong operating leverage with net margin of <strong>${diag.margin.toFixed(1)}%</strong> generating organic capital accumulation.`);
  } else if (diag.margin >= 0) {
    strengths.push(`Self-sustaining breakeven profitability without dependency on external bridge financing.`);
  }
  if (diag.churn <= 2.0) {
    strengths.push(`Exceptional retention profile: monthly churn of <strong>${diag.churn.toFixed(1)}%</strong> reflects strong product-market stickiness.`);
  }
  if (diag.runwayMonths >= 18 || (diag.netProfit > 0 && diag.burn <= 0)) {
    strengths.push(`Extensive solvency runway (<strong>${diag.netProfit > 0 ? 'Cashflow Positive' : diag.runwayMonths.toFixed(1) + ' months'}</strong>) shielding from macroeconomic shocks.`);
  }
  if (strengths.length === 0) {
    strengths.push(`Active revenue generation base ($${formatNumber(diag.revenue)}/mo) providing an operational foundation for turnaround.`);
  }

  // Weaknesses
  if (diag.ltvCacRatio < 2.5) {
    weaknesses.push(`Compressed LTV:CAC ratio (<strong>${diag.ltvCacRatio.toFixed(1)}x</strong>) limits paid acquisition scalability.`);
  }
  if (diag.margin < 0) {
    weaknesses.push(`Negative operating margin (<strong>${diag.margin.toFixed(1)}%</strong>) driving monthly net cash depletion of ${formatCurrency(Math.abs(diag.netProfit))}.`);
  }
  if (diag.runwayMonths < 9 && diag.netProfit <= 0) {
    weaknesses.push(`Constrained capital runway: only <strong>${diag.runwayMonths.toFixed(1)} months</strong> remaining before cash depletion.`);
  }
  if (diag.churn >= 4.0) {
    weaknesses.push(`Elevated monthly customer attrition (<strong>${diag.churn.toFixed(1)}%</strong>) creates an acute leaky-bucket friction.`);
  }
  if (diag.paybackMonths > 12) {
    weaknesses.push(`Protracted customer acquisition payback period (~${diag.paybackMonths.toFixed(1)} months) ties up working capital.`);
  }
  if (weaknesses.length === 0) {
    weaknesses.push(`No critical structural vulnerabilities detected in current baseline metrics.`);
  }

  // Opportunities
  opportunities.push(`Expand customer expansion revenue via tiered pricing, add-ons, or usage-based upselling to push LTV past $${formatNumber(diag.ltv * 1.3)}.`);
  opportunities.push(`Audit and rebalance customer acquisition mix towards organic, SEO, and referral channels to reduce blended CAC.`);
  if (diag.margin < 25) {
    opportunities.push(`Conduct selective price optimization: a 5–10% contract uplift flows directly to the bottom line with minimal attrition.`);
  }
  if (diag.ltvCacRatio >= 4.0) {
    opportunities.push(`Greenlight scaled budget allocation into top-performing customer acquisition channels while returns remain compounding.`);
  }

  // Threats
  if (diag.runwayMonths < 12 && diag.netProfit <= 0) {
    threats.push(`Capital market tightening: constrained financing windows could necessitate dilutive down-rounds if runway is not extended.`);
  }
  threats.push(`Ad network auction cost inflation: rising CPMs and CPCs risk compressing customer acquisition margins.`);
  if (diag.churn >= 3.0) {
    threats.push(`Compounding revenue attrition: unchecked customer cancellations eroding net recurring revenue trajectory.`);
  }
  threats.push(`Competitive pricing pressure from well-capitalized incumbents or low-cost market entrants.`);

  const listS = document.getElementById('swot-strengths-list');
  const listW = document.getElementById('swot-weaknesses-list');
  const listO = document.getElementById('swot-opportunities-list');
  const listT = document.getElementById('swot-threats-list');

  if (listS) listS.innerHTML = strengths.map(s => `<li>${s}</li>`).join('');
  if (listW) listW.innerHTML = weaknesses.map(w => `<li>${w}</li>`).join('');
  if (listO) listO.innerHTML = opportunities.map(o => `<li>${o}</li>`).join('');
  if (listT) listT.innerHTML = threats.map(t => `<li>${t}</li>`).join('');
}

function renderRecommendations(diag) {
  const container = document.getElementById('recommendations-container');
  if (!container) return;

  const recPool = [];

  // Runway urgency
  if (diag.runwayMonths < 9 && diag.netProfit <= 0) {
    recPool.push({
      priority: 'Critical',
      pClass: 'priority-critical',
      score: 100,
      title: 'Extend Cash Runway to Minimum 18 Months',
      impact: `Immediate preservation of $${formatNumber(diag.burn * 0.25)}/mo in burn`,
      desc: `Your current runway of ${diag.runwayMonths.toFixed(1)} months is below the safe operating threshold. Institute immediate capital discipline across vendor contracts, redundant tooling, and pause non-essential hiring.`,
      checklist: [
        'Audit SaaS subscriptions and eliminate underutilized tool seats.',
        'Renegotiate payment terms with core suppliers from Net-30 to Net-60.',
        'Explore non-dilutive venture debt or revenue-based financing facilities.'
      ]
    });
  }

  // CAC / LTV urgency
  if (diag.ltvCacRatio < 3.0) {
    recPool.push({
      priority: 'High Priority',
      pClass: 'priority-high',
      score: 90,
      title: 'Optimize Paid CAC & Channel Attribution',
      impact: 'Target +35% improvement in acquisition leverage',
      desc: `LTV:CAC of ${diag.ltvCacRatio.toFixed(1)}x indicates acquisition spend is nearing marginal profitability. Reallocate ad budget away from low-intent channels to focused high-intent search and customer referral loops.`,
      checklist: [
        'Prune ad campaigns delivering lower than 2.0x ROAS.',
        'Implement automated referral incentives rewarding existing customers for intros.',
        'Optimize landing page conversion rates with social proof and tailored copy.'
      ]
    });
  }

  // Churn urgency
  if (diag.churn >= 3.0) {
    recPool.push({
      priority: 'High Priority',
      pClass: 'priority-high',
      score: 85,
      title: 'Mitigate Customer Churn via Proactive Success Interventions',
      impact: `Recover ~$${formatNumber(diag.revenue * (diag.churn / 100) * 12)} in annualized revenue leakage`,
      desc: `A monthly churn rate of ${diag.churn.toFixed(1)}% severely erodes compounding growth. Establish an automated customer health score alerting customer success to inactivity prior to renewal dates.`,
      checklist: [
        'Deploy automated in-app engagement prompts for accounts inactive for > 10 days.',
        'Conduct root-cause exit interviews with canceled accounts to patch feature gaps.',
        'Incentivize annual prepay plans with a 15% discount to lock in 12-month retention.'
      ]
    });
  }

  // Margin expansion
  if (diag.margin < 15) {
    recPool.push({
      priority: 'Moderate',
      pClass: 'priority-medium',
      score: 75,
      title: 'Re-architect Pricing Tiers & Unit Margins',
      impact: 'Direct 5–10% expansion of net operating margin',
      desc: `With net margin sitting at ${diag.margin.toFixed(1)}%, there is insufficient cushion for macroeconomic volatility. Evaluate value metrics and packaging to capture fair value from power users.`,
      checklist: [
        'Introduce premium tier with enterprise SLA and dedicated support.',
        'Add usage-based overage fees or add-on modules for high-frequency users.',
        'Benchmark competitors and grandfather existing users while raising prices on new cohorts.'
      ]
    });
  }

  // Growth / Expansion (if unit economics are strong)
  if (diag.ltvCacRatio >= 3.5) {
    recPool.push({
      priority: 'Growth Driver',
      pClass: 'priority-growth',
      score: 70,
      title: 'Aggressively Scale Profitable Acquisition Channels',
      impact: 'Accelerate top-line MRR expansion by 25–40%',
      desc: `Strong unit economics (${diag.ltvCacRatio.toFixed(1)}x LTV:CAC) indicate you are currently under-investing in acquisition. You have substantial room to increase acquisition spend while preserving healthy margins.`,
      checklist: [
        'Double budget allocation on the single highest-converting social or search channel.',
        'Explore partner co-marketing and affiliate programs.',
        'Spin up automated email reactivation funnels for dormant leads.'
      ]
    });
  }

  // Cashflow reinvestment
  if (diag.netProfit > 0 && diag.runwayMonths >= 12) {
    recPool.push({
      priority: 'Growth Driver',
      pClass: 'priority-growth',
      score: 65,
      title: 'Strategic Capital Reinvestment into Core Moats',
      impact: 'Compound long-term enterprise value and defensibility',
      desc: `With steady positive cash generation ($${formatNumber(diag.netProfit)}/mo), establish a dedicated reinvestment budget for automated workflow tooling and product differentiation.`,
      checklist: [
        'Invest in customer self-service onboarding to permanently depress support costs.',
        'Enhance proprietary data assets and AI automation features.',
        'Build automated customer feedback and feature voting loops.'
      ]
    });
  }

  // Fallback items to ensure at least 5 recommendations
  if (recPool.length < 5) {
    recPool.push({
      priority: 'Operational',
      pClass: 'priority-medium',
      score: 60,
      title: 'Optimize Cash Conversion Cycle & Billing Terms',
      impact: 'Unlock 30–45 days of operational working capital',
      desc: 'Shortening accounts receivable collection periods and transitioning customers from monthly invoicing to upfront annual subscriptions immediately boosts cash balances.',
      checklist: [
        'Offer a 10–15% incentive for annual upfront billings.',
        'Enforce automated credit card rebilling with dunning sequences.',
        'Automate overdue invoice reminders at 7, 14, and 30 days.'
      ]
    });
  }

  if (recPool.length < 5) {
    recPool.push({
      priority: 'Operational',
      pClass: 'priority-growth',
      score: 55,
      title: 'Systematize Cross-Selling & Account Expansion',
      impact: 'Boost customer LTV by 20% without incurring new CAC',
      desc: 'Existing customers represent the lowest-cost revenue source. Develop systematic expansion triggers based on product utilization benchmarks.',
      checklist: [
        'Identify accounts utilizing > 80% of current tier capacity.',
        'Deploy automated in-app notifications recommending tier upgrades.',
        'Host quarterly strategic business reviews (QBRs) for top 20% VIP clients.'
      ]
    });
  }

  // Sort by score and pick top 5
  recPool.sort((a, b) => b.score - a.score);
  const top5 = recPool.slice(0, 5);

  container.innerHTML = top5.map((rec, i) => `
    <div class="rec-card">
      <div class="rec-top">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-weight: 800; color: var(--accent); font-size: 0.85rem;">#${i + 1}</span>
          <span class="rec-title">${rec.title}</span>
        </div>
        <span class="rec-priority ${rec.pClass}">${rec.priority}</span>
      </div>
      <span class="rec-impact">${rec.impact}</span>
      <p class="rec-desc">${rec.desc}</p>
      <ul class="rec-checklist">
        ${rec.checklist.map(item => `<li><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> ${item}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}

function exportDiagnosticReport() {
  const diag = calculateDiagnostics();
  const dateStr = new Date().toISOString().slice(0, 10);

  const report = `# AI BUSINESS INSIGHTS: EXECUTIVE DIAGNOSTIC BRIEF
Date: ${dateStr}

## 1. EXECUTIVE SUMMARY & HEALTH SCORE
- Overall Business Health Score: ${diag.totalScore} / 100
- Unit Economics Score: ${diag.scoreUnit} / 25
- Profitability Score: ${diag.scoreProfit} / 25
- Runway & Solvency Score: ${diag.scoreRunway} / 25
- Customer Retention Score: ${diag.scoreChurn} / 25

## 2. CORE FINANCIAL & UNIT METRICS
- Monthly Revenue (MRR): ${formatCurrency(diag.revenue)}
- Net Profit Margin: ${diag.margin.toFixed(1)}% (${formatCurrency(diag.netProfit)} / mo)
- Customer Acquisition Cost (CAC): ${formatCurrency(diag.cac)}
- Customer Lifetime Value (LTV): ${formatCurrency(diag.ltv)}
- LTV : CAC Ratio: ${diag.ltvCacRatio.toFixed(2)}x (Benchmark: >= 3.0x)
- CAC Payback Period: ~${diag.paybackMonths.toFixed(1)} months
- Monthly Churn Rate: ${diag.churn.toFixed(2)}%
- Cash Reserves: ${formatCurrency(diag.cash)}
- Monthly Operational Burn: ${formatCurrency(diag.burn)}
- Runway Available: ${diag.netProfit > 0 && diag.burn <= 0 ? 'Infinite / Self-Sustaining' : diag.runwayMonths.toFixed(1) + ' Months'}

## 3. STRATEGIC RECOMMENDATIONS
1. Focus on LTV:CAC optimization: Maintain strict attribution on paid marketing channels.
2. Extend runway buffer: Maintain 18+ months of net runway.
3. Optimize retention: Keep monthly gross churn below 2.5%.
4. Protect net margins: Ensure contribution margin exceeds CAC payback within 12 months.

Generated via ALL IN ONE Tools - AI Business Insights.
`;

  const blob = new Blob([report], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `business-diagnostic-report-${dateStr}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function initEventHandlers() {
  const inputs = ['inp-revenue', 'inp-margin', 'inp-churn', 'inp-cac', 'inp-ltv', 'inp-cash', 'inp-burn'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', renderUI);
    }
  });

  // Presets
  const btnSaas = document.getElementById('preset-saas');
  const btnSeed = document.getElementById('preset-seed');
  const btnEcom = document.getElementById('preset-ecommerce');
  const btnAgency = document.getElementById('preset-agency');

  const applyPreset = (key, clickedBtn) => {
    document.querySelectorAll('.preset-bar .chip-btn').forEach(b => b.classList.remove('active'));
    if (clickedBtn) clickedBtn.classList.add('active');

    const p = PRESETS[key];
    if (p) {
      document.getElementById('inp-revenue').value = p.revenue;
      document.getElementById('inp-margin').value = p.margin;
      document.getElementById('inp-churn').value = p.churn;
      document.getElementById('inp-cac').value = p.cac;
      document.getElementById('inp-ltv').value = p.ltv;
      document.getElementById('inp-cash').value = p.cash;
      document.getElementById('inp-burn').value = p.burn;
      renderUI();
    }
  };

  if (btnSaas) btnSaas.addEventListener('click', () => applyPreset('saas', btnSaas));
  if (btnSeed) btnSeed.addEventListener('click', () => applyPreset('seed', btnSeed));
  if (btnEcom) btnEcom.addEventListener('click', () => applyPreset('ecommerce', btnEcom));
  if (btnAgency) btnAgency.addEventListener('click', () => applyPreset('agency', btnAgency));

  const btnExport = document.getElementById('btn-export-report');
  if (btnExport) btnExport.addEventListener('click', exportDiagnosticReport);
}

document.addEventListener('DOMContentLoaded', () => {
  initEventHandlers();
  renderUI();
});