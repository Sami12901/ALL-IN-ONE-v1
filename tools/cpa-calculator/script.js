// CPA Calculator & Profitability Engine

const PRESETS = {
  ecommerce: {
    spend: 5000,
    conversions: 125,
    targetCpa: 40,
    clicks: 3500,
    impressions: 120000,
    aov: 120,
    margin: 65,
    ltv: 350
  },
  saas: {
    spend: 15000,
    conversions: 60,
    targetCpa: 250,
    clicks: 2400,
    impressions: 80000,
    aov: 450,
    margin: 85,
    ltv: 3800
  },
  highticket: {
    spend: 8000,
    conversions: 16,
    targetCpa: 500,
    clicks: 800,
    impressions: 35000,
    aov: 2500,
    margin: 80,
    ltv: 5000
  },
  local: {
    spend: 3000,
    conversions: 30,
    targetCpa: 100,
    clicks: 600,
    impressions: 15000,
    aov: 1200,
    margin: 45,
    ltv: 1800
  }
};

class CpaCalculatorApp {
  constructor() {
    this.mode = 'solve-cpa';
    this.initElements();
    this.attachEventListeners();
    this.calculate();
  }

  initElements() {
    // Mode buttons
    this.modeButtons = document.querySelectorAll('.mode-tab-btn');
    this.groupSpend = document.getElementById('group-spend');
    this.groupConversions = document.getElementById('group-conversions');
    this.groupTargetCpa = document.getElementById('group-target-cpa');

    // Inputs
    this.inputSpend = document.getElementById('input-ad-spend');
    this.inputConversions = document.getElementById('input-conversions');
    this.inputTargetCpa = document.getElementById('input-target-cpa');

    this.inputClicks = document.getElementById('input-clicks');
    this.inputImpressions = document.getElementById('input-impressions');

    this.inputAov = document.getElementById('input-aov');
    this.inputMargin = document.getElementById('input-gross-margin');
    this.inputLtv = document.getElementById('input-ltv');

    // Presets
    this.presetEcommerce = document.getElementById('preset-ecommerce');
    this.presetSaas = document.getElementById('preset-saas');
    this.presetHighticket = document.getElementById('preset-highticket');
    this.presetLocal = document.getElementById('preset-local');

    // KPIs
    this.kpiTargetLabel = document.getElementById('kpi-target-label');
    this.kpiPrimaryVal = document.getElementById('kpi-primary-val');
    this.kpiPrimarySub = document.getElementById('kpi-primary-sub');

    this.kpiCvrVal = document.getElementById('kpi-cvr-val');
    this.kpiCpcVal = document.getElementById('kpi-cpc-val');

    this.kpiOrderProfitVal = document.getElementById('kpi-order-profit-val');
    this.kpiOrderProfitSub = document.getElementById('kpi-order-profit-sub');

    this.kpiLtvCacVal = document.getElementById('kpi-ltv-cac-val');
    this.kpiBreakevenCpa = document.getElementById('kpi-breakeven-cpa');

    // Health Card
    this.healthBadge = document.getElementById('health-badge');
    this.healthDescription = document.getElementById('health-description-text');

    this.barAovText = document.getElementById('bar-aov-text');
    this.barSummaryText = document.getElementById('bar-summary-text');
    this.barCpa = document.getElementById('bar-cpa');
    this.barProfit = document.getElementById('bar-profit');

    this.legendCpa = document.getElementById('legend-cpa-val');
    this.legendProfit = document.getElementById('legend-profit-val');
    this.legendCogs = document.getElementById('legend-cogs-val');

    // Sensitivity
    this.sensitivityTbody = document.getElementById('sensitivity-tbody');
    this.btnCopyReport = document.getElementById('btn-copy-cpa-report');
  }

  attachEventListeners() {
    // Mode switching
    this.modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.mode = btn.getAttribute('data-mode');
        this.updateModeUI();
        this.calculate();
      });
    });

    // Inputs
    const allInputs = [
      this.inputSpend, this.inputConversions, this.inputTargetCpa,
      this.inputClicks, this.inputImpressions,
      this.inputAov, this.inputMargin, this.inputLtv
    ];

    allInputs.forEach(inp => {
      inp.addEventListener('input', () => this.calculate());
    });

    // Preset clicks
    this.presetEcommerce.addEventListener('click', () => this.loadPreset('ecommerce'));
    this.presetSaas.addEventListener('click', () => this.loadPreset('saas'));
    this.presetHighticket.addEventListener('click', () => this.loadPreset('highticket'));
    this.presetLocal.addEventListener('click', () => this.loadPreset('local'));

    // Copy report
    this.btnCopyReport.addEventListener('click', () => this.copyReport());
  }

  loadPreset(key) {
    const p = PRESETS[key];
    if (!p) return;

    this.inputSpend.value = p.spend;
    this.inputConversions.value = p.conversions;
    this.inputTargetCpa.value = p.targetCpa;
    this.inputClicks.value = p.clicks;
    this.inputImpressions.value = p.impressions;
    this.inputAov.value = p.aov;
    this.inputMargin.value = p.margin;
    this.inputLtv.value = p.ltv;

    this.calculate();
  }

  updateModeUI() {
    if (this.mode === 'solve-cpa') {
      this.groupSpend.style.display = 'block';
      this.groupConversions.style.display = 'block';
      this.groupTargetCpa.style.display = 'none';
      this.kpiTargetLabel.textContent = 'Cost Per Acquisition (CPA)';
      this.kpiPrimarySub.textContent = 'Ad spend per acquired conversion';
    } else if (this.mode === 'solve-conversions') {
      this.groupSpend.style.display = 'block';
      this.groupConversions.style.display = 'none';
      this.groupTargetCpa.style.display = 'block';
      this.kpiTargetLabel.textContent = 'Estimated Conversions';
      this.kpiPrimarySub.textContent = 'Projected volume for target CPA';
    } else if (this.mode === 'solve-spend') {
      this.groupSpend.style.display = 'none';
      this.groupConversions.style.display = 'block';
      this.groupTargetCpa.style.display = 'block';
      this.kpiTargetLabel.textContent = 'Required Ad Spend';
      this.kpiPrimarySub.textContent = 'Total budget required to hit target';
    }
  }

  calculate() {
    let spend = Math.max(0, parseFloat(this.inputSpend.value) || 0);
    let conversions = Math.max(0, parseFloat(this.inputConversions.value) || 0);
    let targetCpa = Math.max(0.01, parseFloat(this.inputTargetCpa.value) || 0.01);

    const clicks = Math.max(0, parseFloat(this.inputClicks.value) || 0);
    const impressions = Math.max(0, parseFloat(this.inputImpressions.value) || 0);

    const aov = Math.max(0, parseFloat(this.inputAov.value) || 0);
    const marginPct = Math.min(100, Math.max(0, parseFloat(this.inputMargin.value) || 0));
    const ltv = Math.max(0, parseFloat(this.inputLtv.value) || 0);

    let effectiveCpa = 0;

    if (this.mode === 'solve-cpa') {
      effectiveCpa = conversions > 0 ? spend / conversions : 0;
      this.kpiPrimaryVal.textContent = `$${effectiveCpa.toFixed(2)}`;
    } else if (this.mode === 'solve-conversions') {
      conversions = targetCpa > 0 ? Math.floor(spend / targetCpa) : 0;
      effectiveCpa = targetCpa;
      this.kpiPrimaryVal.textContent = conversions.toLocaleString();
    } else if (this.mode === 'solve-spend') {
      spend = conversions * targetCpa;
      effectiveCpa = targetCpa;
      this.kpiPrimaryVal.textContent = `$${spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    // Traffic conversions
    const cvr = clicks > 0 ? (conversions / clicks) * 100 : 0;
    const cpc = clicks > 0 ? spend / clicks : 0;
    this.kpiCvrVal.textContent = `${cvr.toFixed(2)}%`;
    this.kpiCpcVal.textContent = `Cost Per Click: $${cpc.toFixed(2)}`;

    // Profitability unit metrics
    const grossProfitPerOrder = aov * (marginPct / 100);
    const cogs = aov - grossProfitPerOrder;
    const netProfitPerOrder = grossProfitPerOrder - effectiveCpa;
    const ltvCacRatio = effectiveCpa > 0 ? (ltv / effectiveCpa) : 0;

    // First Order Profit KPI
    if (netProfitPerOrder >= 0) {
      this.kpiOrderProfitVal.textContent = `+$${netProfitPerOrder.toFixed(2)}`;
      this.kpiOrderProfitVal.style.color = 'var(--success)';
      this.kpiOrderProfitSub.textContent = `Profitable on first transaction`;
    } else {
      this.kpiOrderProfitVal.textContent = `-$${Math.abs(netProfitPerOrder).toFixed(2)}`;
      this.kpiOrderProfitVal.style.color = 'var(--error)';
      this.kpiOrderProfitSub.textContent = `Loss on initial order (relies on LTV)`;
    }

    // LTV : CAC KPI
    this.kpiLtvCacVal.textContent = `${ltvCacRatio.toFixed(2)}x`;
    this.kpiBreakevenCpa.textContent = `Max Allowable CPA: $${grossProfitPerOrder.toFixed(2)}`;

    // Health Badge & Description
    this.updateHealthAssessment(netProfitPerOrder, ltvCacRatio, effectiveCpa, grossProfitPerOrder);

    // Visual bar
    this.updateWaterfallBar(aov, effectiveCpa, grossProfitPerOrder, netProfitPerOrder, cogs);

    // Sensitivity scenarios
    this.renderSensitivityTable(effectiveCpa, spend, aov, marginPct, ltv);
  }

  updateHealthAssessment(netProfit, ltvCac, cpa, breakevenCpa) {
    this.healthBadge.className = 'health-status-badge';

    if (cpa <= 0) {
      this.healthBadge.classList.add('health-healthy');
      this.healthBadge.textContent = 'Awaiting Data';
      this.healthDescription.textContent = 'Please enter valid campaign spend and conversion metrics.';
      return;
    }

    if (netProfit < 0 && ltvCac < 1.0) {
      this.healthBadge.classList.add('health-critical');
      this.healthBadge.textContent = 'Critical: Capital Loss';
      this.healthDescription.textContent = `CPA ($${cpa.toFixed(2)}) exceeds both first-order profit ($${breakevenCpa.toFixed(2)}) and total lifetime value. Each acquisition burns working capital.`;
    } else if (netProfit < 0 && ltvCac < 2.5) {
      this.healthBadge.classList.add('health-warning');
      this.healthBadge.textContent = 'Vulnerable / High Churn Risk';
      this.healthDescription.textContent = `Negative on first order (-$${Math.abs(netProfit).toFixed(2)}). LTV:CAC is below healthy benchmarks (2.5x). Any repeat customer drop-off will cause net losses.`;
    } else if (netProfit < 0 && ltvCac >= 3.0) {
      this.healthBadge.classList.add('health-healthy');
      this.healthBadge.textContent = 'Sustainable SaaS Model';
      this.healthDescription.textContent = `Front-end acquisition is subsidised by strong lifetime value (${ltvCac.toFixed(1)}x LTV:CAC). Monitor customer payback period closely.`;
    } else if (ltvCac >= 5.0) {
      this.healthBadge.classList.add('health-exceptional');
      this.healthBadge.textContent = 'Hyper-Profitable / Scale Ready';
      this.healthDescription.textContent = `Exceptional LTV:CAC of ${ltvCac.toFixed(1)}x and immediate first-order net gain ($${netProfit.toFixed(2)}). You are likely under-investing; increase ad budgets aggressively.`;
    } else {
      this.healthBadge.classList.add('health-healthy');
      this.healthBadge.textContent = 'Healthy & Scalable';
      this.healthDescription.textContent = `CPA is below breakeven threshold ($${breakevenCpa.toFixed(2)}), returning positive cash flow instantly with a sustainable ${ltvCac.toFixed(1)}x LTV:CAC ratio.`;
    }
  }

  updateWaterfallBar(aov, cpa, grossProfit, netProfit, cogs) {
    this.barAovText.textContent = `$${aov.toFixed(2)}`;
    this.legendCpa.textContent = `$${cpa.toFixed(2)}`;
    this.legendProfit.textContent = netProfit >= 0 ? `+$${netProfit.toFixed(2)}` : `-$${Math.abs(netProfit).toFixed(2)}`;
    this.legendCogs.textContent = `$${cogs.toFixed(2)}`;

    if (aov <= 0) {
      this.barCpa.style.width = '0%';
      this.barProfit.style.width = '0%';
      this.barSummaryText.textContent = 'AOV: $0';
      return;
    }

    const cpaPct = Math.min(100, Math.max(0, (cpa / aov) * 100));
    const profitPct = Math.min(100, Math.max(0, (netProfit / aov) * 100));

    this.barCpa.style.width = `${cpaPct}%`;
    this.barProfit.style.width = `${profitPct}%`;

    this.barSummaryText.textContent = `CPA: $${cpa.toFixed(2)} (${cpaPct.toFixed(1)}% of AOV)`;
  }

  renderSensitivityTable(currentCpa, spend, aov, marginPct, ltv) {
    if (currentCpa <= 0) {
      this.sensitivityTbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-tertiary);">Enter metrics to generate sensitivity matrix.</td></tr>';
      return;
    }

    const deltas = [
      { name: 'Optimized (-30%)', mult: 0.7 },
      { name: 'Moderate (-15%)', mult: 0.85 },
      { name: 'Current Baseline', mult: 1.0, isCurrent: true },
      { name: 'Cost Creep (+15%)', mult: 1.15 },
      { name: 'Ad Fatigue (+30%)', mult: 1.3 }
    ];

    const grossProfit = aov * (marginPct / 100);

    this.sensitivityTbody.innerHTML = deltas.map(d => {
      const scenarioCpa = currentCpa * d.mult;
      const conversions = scenarioCpa > 0 ? Math.round(spend / scenarioCpa) : 0;
      const netPerPax = grossProfit - scenarioCpa;
      const ltvCac = scenarioCpa > 0 ? (ltv / scenarioCpa) : 0;

      let statusBadge = '';
      if (scenarioCpa > grossProfit && ltvCac < 1.0) {
        statusBadge = '<span style="color: var(--error); font-weight: 700;">Critical Loss</span>';
      } else if (scenarioCpa > grossProfit) {
        statusBadge = '<span style="color: var(--warning); font-weight: 600;">LTV-Dependent</span>';
      } else if (ltvCac >= 4.0) {
        statusBadge = '<span style="color: var(--success); font-weight: 700;">High Margin</span>';
      } else {
        statusBadge = '<span style="color: var(--accent); font-weight: 600;">Profitable</span>';
      }

      const rowClass = d.isCurrent ? 'class="current-row"' : '';

      return `
        <tr ${rowClass}>
          <td><strong>${d.name}</strong></td>
          <td>$${scenarioCpa.toFixed(2)}</td>
          <td>${conversions.toLocaleString()}</td>
          <td style="color: ${netPerPax >= 0 ? 'var(--success)' : 'var(--error)'};">
            ${netPerPax >= 0 ? '+' : ''}$${netPerPax.toFixed(2)}
          </td>
          <td>${ltvCac.toFixed(2)}x</td>
          <td>${statusBadge}</td>
        </tr>
      `;
    }).join('');
  }

  copyReport() {
    const reportText = `
══════════════════════════════════════════════════
CPA & UNIT ECONOMICS REPORT
Generated: ${new Date().toLocaleDateString()}
══════════════════════════════════════════════════
Core Advertising Metrics:
• Total Ad Spend: $${parseFloat(this.inputSpend.value || 0).toLocaleString()}
• Conversions: ${this.inputConversions.value}
• Cost Per Acquisition (CPA): ${this.kpiPrimaryVal.textContent}
• Conversion Rate (CVR): ${this.kpiCvrVal.textContent}
• Cost Per Click (CPC): ${this.kpiCpcVal.textContent}

Profitability & Unit Economics:
• Average Order Value (AOV): $${this.inputAov.value}
• Gross Margin: ${this.inputMargin.value}%
• Customer Lifetime Value (LTV): $${this.inputLtv.value}
• First-Order Net Profit: ${this.kpiOrderProfitVal.textContent}
• LTV to CAC Ratio: ${this.kpiLtvCacVal.textContent}
• Breakeven Max CPA: ${this.kpiBreakevenCpa.textContent}
• Margin Assessment: ${this.healthBadge.textContent}
══════════════════════════════════════════════════
`.trim();

    navigator.clipboard.writeText(reportText).then(() => {
      const orig = this.btnCopyReport.innerHTML;
      this.btnCopyReport.innerHTML = '✓ Copied!';
      setTimeout(() => {
        this.btnCopyReport.innerHTML = orig;
      }, 2000);
    }).catch(err => {
      alert('Failed to copy: ' + err);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new CpaCalculatorApp();
});