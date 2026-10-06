// Ad Budget Calculator & Multi-Channel Optimizer

const CHANNELS = [
  { id: 'google', name: 'Google Search Ads', color: '#4285F4' },
  { id: 'meta', name: 'Meta Ads (FB / IG)', color: '#0668E1' },
  { id: 'tiktok', name: 'TikTok Ads', color: '#FE2C55' },
  { id: 'youtube', name: 'YouTube Ads', color: '#FF0000' },
  { id: 'linkedin', name: 'LinkedIn Ads', color: '#0A66C2' }
];

const PRESETS = {
  ecom: { google: 40, meta: 35, tiktok: 15, youtube: 10, linkedin: 0 },
  b2b: { google: 35, meta: 10, tiktok: 0, youtube: 10, linkedin: 45 },
  brand: { google: 10, meta: 30, tiktok: 25, youtube: 35, linkedin: 0 },
  balanced: { google: 20, meta: 20, tiktok: 20, youtube: 20, linkedin: 20 }
};

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  AUD: 'A$',
  CAD: 'C$',
  AED: 'AED '
};

class AdBudgetCalculatorApp {
  constructor() {
    this.currency = 'USD';
    this.totalBudget = 10000;
    this.hoveredChannel = null;

    this.initElements();
    this.attachEventListeners();
    this.update();
  }

  initElements() {
    this.budgetInput = document.getElementById('campaign-budget');
    this.currencySelect = document.getElementById('currency-select');
    this.currencySymbolLabel = document.getElementById('currency-symbol-label');

    // Preset buttons
    this.presetPills = {
      ecom: document.getElementById('preset-ecom'),
      b2b: document.getElementById('preset-b2b'),
      brand: document.getElementById('preset-brand'),
      balanced: document.getElementById('preset-balanced')
    };

    // Allocation meter
    this.meterTotalPct = document.getElementById('meter-total-pct');
    this.meterTrack = document.getElementById('meter-progress-track');
    this.meterAlert = document.getElementById('meter-alert');
    this.btnAutoBalance = document.getElementById('btn-auto-balance');

    // Channel inputs map
    this.channelElements = {};
    CHANNELS.forEach(ch => {
      const card = document.querySelector(`.channel-card[data-channel="${ch.id}"]`);
      if (card) {
        this.channelElements[ch.id] = {
          pctInput: card.querySelector('.channel-pct-input'),
          rangeInput: card.querySelector('.channel-range'),
          cpcInput: card.querySelector('.benchmark-cpc'),
          ctrInput: card.querySelector('.benchmark-ctr'),
          cvrInput: card.querySelector('.benchmark-cvr')
        };
      }
    });

    // KPIs
    this.kpiTotalBudget = document.getElementById('kpi-total-budget');
    this.kpiTotalImpressions = document.getElementById('kpi-total-impressions');
    this.kpiBlendedCtr = document.getElementById('kpi-blended-ctr');
    this.kpiTotalClicks = document.getElementById('kpi-total-clicks');
    this.kpiBlendedCpc = document.getElementById('kpi-blended-cpc');
    this.kpiTotalConversions = document.getElementById('kpi-total-conversions');
    this.kpiBlendedCpa = document.getElementById('kpi-blended-cpa');

    // Donut chart
    this.donutSvg = document.getElementById('donut-svg');
    this.donutCenterBudget = document.getElementById('donut-center-budget');
    this.donutCenterLabel = document.getElementById('donut-center-label');
    this.donutLegend = document.getElementById('donut-legend');

    // Table
    this.performanceTbody = document.getElementById('performance-tbody');
    this.btnExportCsv = document.getElementById('btn-export-budget-csv');
    this.btnCopyPlan = document.getElementById('btn-copy-budget-plan');
  }

  attachEventListeners() {
    this.budgetInput.addEventListener('input', () => {
      this.totalBudget = Math.max(0, parseFloat(this.budgetInput.value) || 0);
      this.update();
    });

    this.currencySelect.addEventListener('change', (e) => {
      this.currency = e.target.value;
      const sym = CURRENCY_SYMBOLS[this.currency] || '$';
      this.currencySymbolLabel.textContent = sym.trim();
      this.update();
    });

    // Presets
    Object.keys(this.presetPills).forEach(key => {
      this.presetPills[key].addEventListener('click', () => {
        Object.values(this.presetPills).forEach(p => p.classList.remove('active'));
        this.presetPills[key].classList.add('active');
        this.applyPreset(key);
      });
    });

    // Channel inputs sync
    CHANNELS.forEach(ch => {
      const el = this.channelElements[ch.id];
      if (!el) return;

      el.pctInput.addEventListener('input', () => {
        let val = Math.min(100, Math.max(0, parseFloat(el.pctInput.value) || 0));
        el.rangeInput.value = val;
        this.update();
      });

      el.rangeInput.addEventListener('input', () => {
        el.pctInput.value = el.rangeInput.value;
        this.update();
      });

      [el.cpcInput, el.ctrInput, el.cvrInput].forEach(inp => {
        inp.addEventListener('input', () => this.update());
      });
    });

    // Auto balance button
    this.btnAutoBalance.addEventListener('click', () => this.autoBalance());

    // Export & copy
    this.btnExportCsv.addEventListener('click', () => this.exportCsv());
    this.btnCopyPlan.addEventListener('click', () => this.copyPlan());
  }

  applyPreset(key) {
    const preset = PRESETS[key];
    if (!preset) return;

    CHANNELS.forEach(ch => {
      const val = preset[ch.id] ?? 0;
      const el = this.channelElements[ch.id];
      if (el) {
        el.pctInput.value = val;
        el.rangeInput.value = val;
      }
    });

    this.update();
  }

  autoBalance() {
    let currentPercentages = CHANNELS.map(ch => {
      const el = this.channelElements[ch.id];
      return parseFloat(el ? el.pctInput.value : 0) || 0;
    });

    const sum = currentPercentages.reduce((a, b) => a + b, 0);

    if (sum === 0) {
      // Default to equal 20%
      CHANNELS.forEach(ch => {
        const el = this.channelElements[ch.id];
        if (el) {
          el.pctInput.value = 20;
          el.rangeInput.value = 20;
        }
      });
    } else {
      // Normalize to 100
      let normalized = currentPercentages.map(v => Math.round((v / sum) * 100));
      let normSum = normalized.reduce((a, b) => a + b, 0);

      // Fix rounding error on highest item
      if (normSum !== 100) {
        const diff = 100 - normSum;
        let maxIdx = 0;
        let maxVal = -1;
        normalized.forEach((val, idx) => {
          if (val > maxVal) {
            maxVal = val;
            maxIdx = idx;
          }
        });
        normalized[maxIdx] += diff;
      }

      CHANNELS.forEach((ch, idx) => {
        const el = this.channelElements[ch.id];
        if (el) {
          el.pctInput.value = normalized[idx];
          el.rangeInput.value = normalized[idx];
        }
      });
    }

    this.update();
  }

  formatCurrency(val, decimals = 0) {
    const sym = CURRENCY_SYMBOLS[this.currency] || '$';
    return `${sym}${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  }

  getChannelMetrics() {
    return CHANNELS.map(ch => {
      const el = this.channelElements[ch.id];
      const pct = parseFloat(el ? el.pctInput.value : 0) || 0;
      const cpc = Math.max(0.01, parseFloat(el ? el.cpcInput.value : 1) || 1);
      const ctr = Math.max(0.01, parseFloat(el ? el.ctrInput.value : 1) || 1);
      const cvr = Math.max(0.01, parseFloat(el ? el.cvrInput.value : 1) || 1);

      const budget = (this.totalBudget * pct) / 100;
      const clicks = cpc > 0 ? Math.round(budget / cpc) : 0;
      const impressions = ctr > 0 ? Math.round(clicks / (ctr / 100)) : 0;
      const conversions = Math.round(clicks * (cvr / 100));
      const cpa = conversions > 0 ? budget / conversions : 0;

      return {
        ...ch,
        pct,
        cpc,
        ctr,
        cvr,
        budget,
        clicks,
        impressions,
        conversions,
        cpa
      };
    });
  }

  update() {
    const metrics = this.getChannelMetrics();
    const totalAllocatedPct = metrics.reduce((acc, m) => acc + m.pct, 0);

    // Update meter bar
    this.meterTotalPct.textContent = `${totalAllocatedPct}%`;
    if (totalAllocatedPct === 100) {
      this.meterTotalPct.style.color = 'var(--success)';
      this.meterAlert.style.display = 'none';
    } else {
      this.meterTotalPct.style.color = 'var(--error)';
      this.meterAlert.style.display = 'block';
      this.meterAlert.textContent = `Allocated total is ${totalAllocatedPct}%. It must be exactly 100% for accurate forecasting.`;
    }

    this.meterTrack.innerHTML = metrics.map(m => {
      if (m.pct <= 0) return '';
      return `<div class="meter-slice" style="width: ${m.pct}%; background: ${m.color};" title="${m.name}: ${m.pct}%"></div>`;
    }).join('');

    // Totals
    const totalBudget = metrics.reduce((acc, m) => acc + m.budget, 0);
    const totalClicks = metrics.reduce((acc, m) => acc + m.clicks, 0);
    const totalImpressions = metrics.reduce((acc, m) => acc + m.impressions, 0);
    const totalConversions = metrics.reduce((acc, m) => acc + m.conversions, 0);

    const blendedCpc = totalClicks > 0 ? totalBudget / totalClicks : 0;
    const blendedCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const blendedCpa = totalConversions > 0 ? totalBudget / totalConversions : 0;

    // Update KPIs
    this.kpiTotalBudget.textContent = this.formatCurrency(totalBudget);
    this.kpiTotalImpressions.textContent = totalImpressions.toLocaleString();
    this.kpiBlendedCtr.textContent = `Blended CTR: ${blendedCtr.toFixed(2)}%`;
    this.kpiTotalClicks.textContent = totalClicks.toLocaleString();
    this.kpiBlendedCpc.textContent = `Blended CPC: ${this.formatCurrency(blendedCpc, 2)}`;
    this.kpiTotalConversions.textContent = totalConversions.toLocaleString();
    this.kpiBlendedCpa.textContent = `Blended CPA: ${this.formatCurrency(blendedCpa, 2)}`;

    // Donut chart
    this.renderDonutChart(metrics, totalAllocatedPct);

    // Performance table
    this.renderTable(metrics);
  }

  renderDonutChart(metrics, totalAllocatedPct) {
    if (this.hoveredChannel) {
      const activeCh = metrics.find(m => m.id === this.hoveredChannel);
      if (activeCh) {
        this.donutCenterBudget.textContent = this.formatCurrency(activeCh.budget);
        this.donutCenterLabel.textContent = `${activeCh.pct}% of Total`;
      }
    } else {
      this.donutCenterBudget.textContent = this.formatCurrency(this.totalBudget);
      this.donutCenterLabel.textContent = 'Total Budget';
    }

    // Render SVG arcs using circle stroke dasharray
    // Radius = 75, Circumference = 2 * Math.PI * 75 ≈ 471.24
    const r = 70;
    const circumference = 2 * Math.PI * r;
    let accumulatedPct = 0;

    let svgHtml = '';

    if (totalAllocatedPct === 0) {
      svgHtml = `<circle cx="100" cy="100" r="${r}" fill="none" stroke="var(--bg-tertiary)" stroke-width="26" />`;
    } else {
      metrics.forEach(m => {
        if (m.pct <= 0) return;
        const sliceLength = (m.pct / 100) * circumference;
        const offset = -((accumulatedPct / 100) * circumference);

        svgHtml += `
          <circle 
            cx="100" cy="100" r="${r}" 
            fill="none" 
            stroke="${m.color}" 
            stroke-width="26" 
            stroke-dasharray="${sliceLength} ${circumference}" 
            stroke-dashoffset="${offset}"
            transform="rotate(-90 100 100)"
            style="transition: stroke-width 0.2s ease, opacity 0.2s ease; cursor: pointer;"
            data-id="${m.id}"
            class="donut-segment"
          />
        `;
        accumulatedPct += m.pct;
      });
    }

    this.donutSvg.innerHTML = svgHtml;

    // Attach hover to SVG segments
    this.donutSvg.querySelectorAll('.donut-segment').forEach(seg => {
      seg.addEventListener('mouseenter', () => {
        seg.setAttribute('stroke-width', '32');
        this.hoveredChannel = seg.getAttribute('data-id');
        this.update();
      });
      seg.addEventListener('mouseleave', () => {
        seg.setAttribute('stroke-width', '26');
        this.hoveredChannel = null;
        this.update();
      });
    });

    // Render legend
    this.donutLegend.innerHTML = metrics.map(m => `
      <div class="legend-item" style="cursor: pointer; opacity: ${this.hoveredChannel && this.hoveredChannel !== m.id ? '0.4' : '1'};" data-id="${m.id}">
        <span style="width: 10px; height: 10px; border-radius: 50%; background: ${m.color}; display: inline-block;"></span>
        <span><strong>${m.name}:</strong> ${this.formatCurrency(m.budget)} (${m.pct}%)</span>
      </div>
    `).join('');

    this.donutLegend.querySelectorAll('.legend-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        this.hoveredChannel = item.getAttribute('data-id');
        this.update();
      });
      item.addEventListener('mouseleave', () => {
        this.hoveredChannel = null;
        this.update();
      });
    });
  }

  renderTable(metrics) {
    this.performanceTbody.innerHTML = metrics.map(m => `
      <tr style="${this.hoveredChannel === m.id ? 'background: rgba(255,255,255,0.05);' : ''}">
        <td>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${m.color};"></span>
            <strong>${m.name}</strong>
          </div>
        </td>
        <td>${this.formatCurrency(m.budget)}</td>
        <td><span style="font-weight: 600; color: var(--accent);">${m.pct}%</span></td>
        <td>${this.formatCurrency(m.cpc, 2)}</td>
        <td>${m.clicks.toLocaleString()}</td>
        <td>${m.impressions.toLocaleString()}</td>
        <td>${m.cvr.toFixed(1)}%</td>
        <td style="font-weight: 700; color: var(--success);">${m.conversions.toLocaleString()}</td>
        <td style="font-weight: 700;">${this.formatCurrency(m.cpa, 2)}</td>
      </tr>
    `).join('');
  }

  exportCsv() {
    const metrics = this.getChannelMetrics();
    const headers = ['Channel', 'Allocation %', 'Budget', 'Benchmark CPC', 'Est. Clicks', 'Est. Impressions', 'Benchmark CVR %', 'Est. Conversions', 'Est. CPA'];
    const rows = metrics.map(m => [
      `"${m.name}"`,
      m.pct,
      m.budget.toFixed(2),
      m.cpc.toFixed(2),
      m.clicks,
      m.impressions,
      m.cvr.toFixed(2),
      m.conversions,
      m.cpa.toFixed(2)
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ad_budget_optimizer_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  copyPlan() {
    const metrics = this.getChannelMetrics();
    const totalBudget = metrics.reduce((a, m) => a + m.budget, 0);
    const totalConversions = metrics.reduce((a, m) => a + m.conversions, 0);
    const totalClicks = metrics.reduce((a, m) => a + m.clicks, 0);
    const blendedCpa = totalConversions > 0 ? totalBudget / totalConversions : 0;

    const report = `
══════════════════════════════════════════════════
MULTI-CHANNEL ADVERTISING BUDGET PLAN
Total Monthly Budget: ${this.formatCurrency(totalBudget)} (${this.currency})
Projected Total Clicks: ${totalClicks.toLocaleString()}
Projected Conversions: ${totalConversions.toLocaleString()}
Forecast Blended CPA: ${this.formatCurrency(blendedCpa, 2)}
══════════════════════════════════════════════════
CHANNEL BREAKDOWN:
${metrics.map(m => `• ${m.name} [${m.pct}% | ${this.formatCurrency(m.budget)}]
   Clicks: ${m.clicks.toLocaleString()} @ ${this.formatCurrency(m.cpc, 2)} CPC
   Conversions: ${m.conversions.toLocaleString()} @ ${this.formatCurrency(m.cpa, 2)} CPA`).join('\n')}
══════════════════════════════════════════════════
`.trim();

    navigator.clipboard.writeText(report).then(() => {
      const orig = this.btnCopyPlan.innerHTML;
      this.btnCopyPlan.innerHTML = '✓ Copied!';
      setTimeout(() => {
        this.btnCopyPlan.innerHTML = orig;
      }, 2000);
    }).catch(err => {
      alert('Copy error: ' + err);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AdBudgetCalculatorApp();
});