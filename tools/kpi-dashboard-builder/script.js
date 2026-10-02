/**
 * KPI Dashboard Builder - Executive Metrics & Targets
 * Complete client-side KPI tile designer, target evaluation engine, and JSON export/import.
 */

const KPI_TEMPLATES = {
  csuite: [
    {
      id: 'kpi-1',
      name: 'Annual Recurring Revenue (ARR)',
      category: 'financial',
      period: 'FY 2026',
      actual: 24800000,
      target: 24000000,
      prefix: '$',
      suffix: '',
      change: '+14.2% YoY',
      trend: 'up',
      direction: 'higher',
      note: 'Surpassed annual budget targets led by enterprise expansions'
    },
    {
      id: 'kpi-2',
      name: 'Net Dollar Retention (NDR)',
      category: 'growth',
      period: 'Q3 2026',
      actual: 118.4,
      target: 110.0,
      prefix: '',
      suffix: '%',
      change: '+3.5% QoQ',
      trend: 'up',
      direction: 'higher',
      note: 'Robust account expansion and negligible enterprise logo churn'
    },
    {
      id: 'kpi-3',
      name: 'Gross Margin Percentage',
      category: 'financial',
      period: 'Q3 2026',
      actual: 78.6,
      target: 75.0,
      prefix: '',
      suffix: '%',
      change: '+2.4% YoY',
      trend: 'up',
      direction: 'higher',
      note: 'COGS efficiency gains from long-term cloud infrastructure commitments'
    },
    {
      id: 'kpi-4',
      name: 'CAC Payback Period',
      category: 'growth',
      period: 'LTM 2026',
      actual: 11.2,
      target: 14.0,
      prefix: '',
      suffix: ' mos',
      change: '-2.8 mos YoY',
      trend: 'up',
      direction: 'lower',
      note: 'High capital efficiency driven by strong referral velocity'
    },
    {
      id: 'kpi-5',
      name: 'Operating Cash Runway',
      category: 'financial',
      period: 'Current',
      actual: 28,
      target: 24,
      prefix: '',
      suffix: ' mos',
      change: '+4 mos YoY',
      trend: 'up',
      direction: 'higher',
      note: 'Self-sustaining operational cash flow; zero near-term dilution risk'
    },
    {
      id: 'kpi-6',
      name: 'Executive Net Promoter Score',
      category: 'customer',
      period: 'Q3 2026',
      actual: 72,
      target: 65,
      prefix: '+',
      suffix: ' pts',
      change: '+7 pts YoY',
      trend: 'up',
      direction: 'higher',
      note: 'Ranked in top 5th percentile across global enterprise benchmarks'
    }
  ],

  ecommerce: [
    {
      id: 'kpi-ec-1',
      name: 'Average Order Value (AOV)',
      category: 'financial',
      period: 'Monthly',
      actual: 345,
      target: 320,
      prefix: '$',
      suffix: '',
      change: '+7.8% MoM',
      trend: 'up',
      direction: 'higher',
      note: 'Elevated by cross-category luxury bundling campaigns'
    },
    {
      id: 'kpi-ec-2',
      name: 'Digital Conversion Rate',
      category: 'growth',
      period: 'Monthly',
      actual: 3.82,
      target: 3.50,
      prefix: '',
      suffix: '%',
      change: '+0.45% MoM',
      trend: 'up',
      direction: 'higher',
      note: 'Checkout page redesign lowered dropoff by 14%'
    },
    {
      id: 'kpi-ec-3',
      name: 'Shopping Cart Abandonment',
      category: 'customer',
      period: 'Monthly',
      actual: 61.8,
      target: 65.0,
      prefix: '',
      suffix: '%',
      change: '-3.2% MoM',
      trend: 'up',
      direction: 'lower',
      note: 'One-click accelerated payment integrations reduced friction'
    },
    {
      id: 'kpi-ec-4',
      name: 'Blended ROAS',
      category: 'growth',
      period: 'Trailing 30d',
      actual: 4.6,
      target: 4.0,
      prefix: '',
      suffix: 'x',
      change: '+0.6x MoM',
      trend: 'up',
      direction: 'higher',
      note: 'High-intent search targeting outperformed programmatic channels'
    },
    {
      id: 'kpi-ec-5',
      name: 'Customer Return Rate',
      category: 'operations',
      period: 'Trailing 60d',
      actual: 3.9,
      target: 4.5,
      prefix: '',
      suffix: '%',
      change: '-0.6% MoM',
      trend: 'up',
      direction: 'lower',
      note: 'Enhanced sizing guides and real-time live salon consultations'
    },
    {
      id: 'kpi-ec-6',
      name: 'Repeat Purchase Frequency',
      category: 'customer',
      period: 'Annualized',
      actual: 39.4,
      target: 35.0,
      prefix: '',
      suffix: '%',
      change: '+4.4% YoY',
      trend: 'up',
      direction: 'higher',
      note: 'VIP private client invitations accelerating secondary transactions'
    }
  ],

  saas: [
    {
      id: 'kpi-saas-1',
      name: 'Monthly Recurring Revenue (MRR)',
      category: 'financial',
      period: 'Current Mo',
      actual: 2150000,
      target: 2000000,
      prefix: '$',
      suffix: '',
      change: '+11.5% MoM',
      trend: 'up',
      direction: 'higher',
      note: 'Accelerated by expansion tiers across mid-market cohorts'
    },
    {
      id: 'kpi-saas-2',
      name: 'Monthly Active Users (MAU)',
      category: 'growth',
      period: 'Current',
      actual: 142500,
      target: 135000,
      prefix: '',
      suffix: '',
      change: '+18.2% QoQ',
      trend: 'up',
      direction: 'higher',
      note: 'Viral team collaboration features driving organic user seat growth'
    },
    {
      id: 'kpi-saas-3',
      name: 'Gross Revenue Churn',
      category: 'growth',
      period: 'Monthly',
      actual: 0.62,
      target: 0.85,
      prefix: '',
      suffix: '%',
      change: '-0.23% MoM',
      trend: 'up',
      direction: 'lower',
      note: 'Proactive customer success onboarding for tier-1 teams'
    },
    {
      id: 'kpi-saas-4',
      name: 'LTV to CAC Ratio',
      category: 'financial',
      period: 'Trailing 12M',
      actual: 5.6,
      target: 4.2,
      prefix: '',
      suffix: 'x',
      change: '+1.4x YoY',
      trend: 'up',
      direction: 'higher',
      note: 'World-class unit economics with sustainable organic acquisition'
    },
    {
      id: 'kpi-saas-5',
      name: 'Feature Adoption Rate',
      category: 'operations',
      period: 'Q3 2026',
      actual: 76.2,
      target: 70.0,
      prefix: '',
      suffix: '%',
      change: '+6.2% QoQ',
      trend: 'up',
      direction: 'higher',
      note: 'In-app interactive walk-throughs increased product adoption'
    },
    {
      id: 'kpi-saas-6',
      name: 'Customer Health Index',
      category: 'customer',
      period: 'Live',
      actual: 91,
      target: 85,
      prefix: '',
      suffix: ' pts',
      change: '+6 pts',
      trend: 'up',
      direction: 'higher',
      note: 'Telemetry telemetry shows 92% of enterprise logos are highly active'
    }
  ],

  financial: [
    {
      id: 'kpi-fin-1',
      name: 'Adjusted EBITDA Margin',
      category: 'financial',
      period: 'Q3 2026',
      actual: 28.5,
      target: 25.0,
      prefix: '',
      suffix: '%',
      change: '+3.5% YoY',
      trend: 'up',
      direction: 'higher',
      note: 'Operating leverage expanding ahead of revenue scale'
    },
    {
      id: 'kpi-fin-2',
      name: 'Days Sales Outstanding (DSO)',
      category: 'operations',
      period: 'Monthly',
      actual: 37,
      target: 45,
      prefix: '',
      suffix: ' days',
      change: '-8 days',
      trend: 'up',
      direction: 'lower',
      note: 'Automated invoice settlement collections reduced aging balances'
    },
    {
      id: 'kpi-fin-3',
      name: 'Free Cash Flow Conversion',
      category: 'financial',
      period: 'LTM 2026',
      actual: 84.0,
      target: 80.0,
      prefix: '',
      suffix: '%',
      change: '+4.0% YoY',
      trend: 'up',
      direction: 'higher',
      note: 'Asset-light operating profile delivering exceptional cash flow'
    },
    {
      id: 'kpi-fin-4',
      name: 'Working Capital Ratio',
      category: 'financial',
      period: 'Current',
      actual: 2.35,
      target: 2.00,
      prefix: '',
      suffix: 'x',
      change: '+0.35x',
      trend: 'up',
      direction: 'higher',
      note: 'Strong short-term solvency covering liquidity obligations'
    },
    {
      id: 'kpi-fin-5',
      name: 'Inventory Turnover Rate',
      category: 'operations',
      period: 'Annualized',
      actual: 6.8,
      target: 6.0,
      prefix: '',
      suffix: 'x',
      change: '+0.8x YoY',
      trend: 'up',
      direction: 'higher',
      note: 'Just-in-time regional warehouse fulfillment improving velocity'
    },
    {
      id: 'kpi-fin-6',
      name: 'OpEx as % of Revenue',
      category: 'operations',
      period: 'Q3 2026',
      actual: 41.8,
      target: 45.0,
      prefix: '',
      suffix: '%',
      change: '-3.2% YoY',
      trend: 'up',
      direction: 'lower',
      note: 'Discipline in administrative and non-core overhead spend'
    }
  ]
};

class KpiDashboardBuilder {
  constructor() {
    this.currentTemplateKey = 'csuite';
    this.kpis = JSON.parse(JSON.stringify(KPI_TEMPLATES.csuite));
    this.filterCategory = 'all';
    this.filterStatus = 'all';

    this.init();
  }

  init() {
    this.cacheDom();
    this.bindEvents();
    this.render();
  }

  cacheDom() {
    // Toolbar & Controls
    this.templateSelect = document.getElementById('template-select');
    this.btnLoadTemplate = document.getElementById('btn-load-template');
    this.btnAddKpi = document.getElementById('btn-add-kpi');
    this.btnExportJson = document.getElementById('btn-export-kpi-json');
    this.jsonImporter = document.getElementById('json-importer');
    this.btnPrintKpi = document.getElementById('btn-print-kpi');

    // Health Summary
    this.healthScorePercent = document.getElementById('health-score-percent');
    this.healthStatusTitle = document.getElementById('health-status-title');
    this.healthStatusSub = document.getElementById('health-status-sub');
    this.countExceeded = document.getElementById('count-exceeded');
    this.countOntrack = document.getElementById('count-ontrack');
    this.countWarning = document.getElementById('count-warning');
    this.countCritical = document.getElementById('count-critical');

    // Filters
    this.catChips = document.querySelectorAll('.filter-chip[data-cat]');
    this.statusChips = document.querySelectorAll('.filter-chip[data-status]');

    // Grid
    this.kpiGrid = document.getElementById('kpi-grid');

    // Modal
    this.modal = document.getElementById('kpi-modal');
    this.modalHeading = document.getElementById('modal-heading');
    this.modalCloseX = document.getElementById('modal-close-x');
    this.modalCancelBtn = document.getElementById('modal-cancel-btn');
    this.kpiForm = document.getElementById('kpi-form');

    // Form inputs
    this.formId = document.getElementById('form-kpi-id');
    this.formName = document.getElementById('form-name');
    this.formCategory = document.getElementById('form-category');
    this.formPeriod = document.getElementById('form-period');
    this.formActual = document.getElementById('form-actual');
    this.formTarget = document.getElementById('form-target');
    this.formPrefix = document.getElementById('form-prefix');
    this.formSuffix = document.getElementById('form-suffix');
    this.formChange = document.getElementById('form-change');
    this.formTrend = document.getElementById('form-trend');
    this.formDirection = document.getElementById('form-direction');
    this.formNote = document.getElementById('form-note');
  }

  bindEvents() {
    this.btnLoadTemplate.addEventListener('click', () => {
      this.loadTemplate(this.templateSelect.value);
    });

    this.templateSelect.addEventListener('change', () => {
      this.loadTemplate(this.templateSelect.value);
    });

    this.btnAddKpi.addEventListener('click', () => {
      this.openModalForAdd();
    });

    this.modalCloseX.addEventListener('click', () => this.closeModal());
    this.modalCancelBtn.addEventListener('click', () => this.closeModal());

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });

    this.kpiForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveKpiFromForm();
    });

    this.btnPrintKpi.addEventListener('click', () => {
      window.print();
    });

    this.btnExportJson.addEventListener('click', () => {
      this.exportJson();
    });

    this.jsonImporter.addEventListener('change', (e) => {
      this.importJson(e);
    });

    // Category Filter Chips
    this.catChips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.catChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.filterCategory = chip.getAttribute('data-cat');
        this.renderGridOnly();
      });
    });

    // Status Filter Chips
    this.statusChips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.statusChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.filterStatus = chip.getAttribute('data-status');
        this.renderGridOnly();
      });
    });
  }

  loadTemplate(key) {
    const tpl = KPI_TEMPLATES[key] || KPI_TEMPLATES.csuite;
    this.currentTemplateKey = key;
    this.kpis = JSON.parse(JSON.stringify(tpl));
    this.render();
  }

  // Evaluate status and progress for a KPI tile
  evaluateKpi(kpi) {
    const actual = Number(kpi.actual) || 0;
    const target = Number(kpi.target) || 1;
    const direction = kpi.direction || 'higher';

    let attainment = 0;
    let status = 'ontrack'; // 'exceeded' | 'ontrack' | 'warning' | 'critical'

    if (direction === 'higher') {
      attainment = target > 0 ? (actual / target) * 100 : 100;
      if (attainment >= 105) status = 'exceeded';
      else if (attainment >= 95) status = 'ontrack';
      else if (attainment >= 80) status = 'warning';
      else status = 'critical';
    } else {
      // lower is better (e.g. churn, cost, days)
      attainment = actual > 0 ? (target / actual) * 100 : 100;
      if (actual <= target * 0.95) status = 'exceeded';
      else if (actual <= target * 1.05) status = 'ontrack';
      else if (actual <= target * 1.25) status = 'warning';
      else status = 'critical';
    }

    // Progress bar width clamped between 0 and 100%
    const progressWidth = Math.min(100, Math.max(0, attainment));

    return {
      attainment,
      status,
      progressWidth
    };
  }

  formatValue(num, prefix = '', suffix = '') {
    if (isNaN(num)) return '-';
    let formatted = '';
    if (Math.abs(num) >= 1_000_000) {
      formatted = (num / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + (suffix || 'M');
    } else if (Math.abs(num) >= 1_000 && !suffix.includes('%')) {
      formatted = (num / 1_000).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + (suffix || 'k');
    } else {
      formatted = num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + (suffix || '');
    }
    return `${prefix}${formatted}`;
  }

  render() {
    this.renderHealthSummary();
    this.renderGridOnly();
  }

  renderHealthSummary() {
    let countExceeded = 0;
    let countOntrack = 0;
    let countWarning = 0;
    let countCritical = 0;

    this.kpis.forEach(kpi => {
      const { status } = this.evaluateKpi(kpi);
      if (status === 'exceeded') countExceeded++;
      else if (status === 'ontrack') countOntrack++;
      else if (status === 'warning') countWarning++;
      else if (status === 'critical') countCritical++;
    });

    const total = this.kpis.length;
    const healthyCount = countExceeded + countOntrack;
    const healthScore = total > 0 ? Math.round((healthyCount / total) * 100) : 100;

    this.healthScorePercent.textContent = `${healthScore}%`;
    this.countExceeded.textContent = countExceeded;
    this.countOntrack.textContent = countOntrack;
    this.countWarning.textContent = countWarning;
    this.countCritical.textContent = countCritical;

    if (healthScore >= 90) {
      this.healthStatusTitle.textContent = 'Strategic Portfolio in Exceptional Standing';
      this.healthStatusSub.textContent = `${healthyCount} of ${total} core business indicators exceeding baseline milestone expectations.`;
      this.healthScorePercent.style.color = 'var(--gold-secondary)';
    } else if (healthScore >= 70) {
      this.healthStatusTitle.textContent = 'Portfolio Moderately Performing with Minor Variances';
      this.healthStatusSub.textContent = `${countWarning} KPI requires operational attention to avoid target drift.`;
      this.healthScorePercent.style.color = 'var(--emerald-accent)';
    } else {
      this.healthStatusTitle.textContent = 'Executive Warning: Multiple Metrics Underperforming';
      this.healthStatusSub.textContent = `${countCritical} critical indicators below operating tolerance thresholds.`;
      this.healthScorePercent.style.color = 'var(--rose-accent)';
    }
  }

  renderGridOnly() {
    const filtered = this.kpis.filter(kpi => {
      // Category filter
      if (this.filterCategory !== 'all' && kpi.category !== this.filterCategory) {
        return false;
      }
      // Status filter
      if (this.filterStatus !== 'all') {
        const { status } = this.evaluateKpi(kpi);
        if (this.filterStatus === 'ontrack' && status !== 'ontrack' && status !== 'exceeded') return false;
        if (this.filterStatus === 'warning' && status !== 'warning') return false;
        if (this.filterStatus === 'critical' && status !== 'critical') return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      this.kpiGrid.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 3rem; text-align: center; color: var(--text-secondary); background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px dashed var(--border);">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 0.75rem; opacity: 0.6;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <div style="font-size: 1.1rem; font-weight: 600; color: var(--text-primary);">No KPI Tiles Match Filter</div>
          <p style="font-size: 0.85rem; margin-top: 0.35rem;">Try selecting a different status/category filter or add a new KPI tile.</p>
        </div>
      `;
      return;
    }

    this.kpiGrid.innerHTML = filtered.map((kpi, index) => {
      const { attainment, status, progressWidth } = this.evaluateKpi(kpi);
      const actualFmt = this.formatValue(kpi.actual, kpi.prefix, kpi.suffix);
      const targetFmt = this.formatValue(kpi.target, kpi.prefix, kpi.suffix);
      
      let statusLabel = 'On Track';
      if (status === 'exceeded') statusLabel = 'Exceeded';
      else if (status === 'warning') statusLabel = 'Warning';
      else if (status === 'critical') statusLabel = 'Critical';

      let trendIcon = '&uarr;';
      if (kpi.trend === 'down') trendIcon = '&darr;';
      else if (kpi.trend === 'neutral') trendIcon = '&rarr;';

      const originalIndex = this.kpis.findIndex(k => k.id === kpi.id);

      return `
        <div class="kpi-tile ${status}" data-id="${kpi.id}">
          <div>
            <div class="tile-header">
              <div>
                <span class="tile-category-tag">${kpi.category} &bull; ${kpi.period || 'Q3'}</span>
                <div class="tile-title">${kpi.name}</div>
              </div>
              <span class="tile-status-badge ${status}">
                <span style="font-size: 0.8rem;">&bull;</span> ${statusLabel}
              </span>
            </div>

            <div class="tile-value-block">
              <div class="tile-actual-value">${actualFmt}</div>
              <div class="tile-target-value">
                Target: <strong style="color: var(--text-primary);">${targetFmt}</strong>
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">
                  ${attainment.toFixed(1)}% attained
                </div>
              </div>
            </div>

            <!-- Progress Gauge Meter -->
            <div class="gauge-wrapper">
              <div class="gauge-header">
                <span>Progress to Target</span>
                <span style="font-family: monospace;">${attainment.toFixed(1)}%</span>
              </div>
              <div class="gauge-track">
                <div class="gauge-fill" style="width: ${progressWidth}%;"></div>
              </div>
            </div>

            ${kpi.note ? `<div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.75rem; line-height: 1.4; font-style: italic;">"${kpi.note}"</div>` : ''}
          </div>

          <div class="tile-footer">
            <div class="tile-trend ${kpi.trend}">
              <span style="font-size: 1rem;">${trendIcon}</span>
              <span>${kpi.change || '0%'}</span>
            </div>

            <div class="tile-actions">
              <button class="tile-btn-icon btn-move-left" data-id="${kpi.id}" title="Move earlier" ${originalIndex === 0 ? 'disabled style="opacity:0.3;cursor:default;"' : ''}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <button class="tile-btn-icon btn-move-right" data-id="${kpi.id}" title="Move later" ${originalIndex === this.kpis.length - 1 ? 'disabled style="opacity:0.3;cursor:default;"' : ''}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
              <button class="tile-btn-icon btn-edit-kpi" data-id="${kpi.id}" title="Edit KPI tile">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </button>
              <button class="tile-btn-icon btn-duplicate-kpi" data-id="${kpi.id}" title="Duplicate KPI tile">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
              <button class="tile-btn-icon delete btn-delete-kpi" data-id="${kpi.id}" title="Delete KPI tile">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.bindTileActions();
  }

  bindTileActions() {
    // Edit
    this.kpiGrid.querySelectorAll('.btn-edit-kpi').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.openModalForEdit(id);
      });
    });

    // Duplicate
    this.kpiGrid.querySelectorAll('.btn-duplicate-kpi').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.duplicateKpi(id);
      });
    });

    // Delete
    this.kpiGrid.querySelectorAll('.btn-delete-kpi').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.deleteKpi(id);
      });
    });

    // Move left
    this.kpiGrid.querySelectorAll('.btn-move-left').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.moveKpi(id, -1);
      });
    });

    // Move right
    this.kpiGrid.querySelectorAll('.btn-move-right').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.moveKpi(id, 1);
      });
    });
  }

  moveKpi(id, delta) {
    const idx = this.kpis.findIndex(k => k.id === id);
    if (idx === -1) return;
    const targetIdx = idx + delta;
    if (targetIdx < 0 || targetIdx >= this.kpis.length) return;

    const temp = this.kpis[idx];
    this.kpis[idx] = this.kpis[targetIdx];
    this.kpis[targetIdx] = temp;

    this.render();
  }

  duplicateKpi(id) {
    const item = this.kpis.find(k => k.id === id);
    if (!item) return;

    const copy = JSON.parse(JSON.stringify(item));
    copy.id = 'kpi-' + Date.now();
    copy.name = `${copy.name} (Copy)`;
    
    const idx = this.kpis.findIndex(k => k.id === id);
    this.kpis.splice(idx + 1, 0, copy);
    this.render();
  }

  deleteKpi(id) {
    if (!confirm('Are you sure you want to remove this KPI tile?')) return;
    this.kpis = this.kpis.filter(k => k.id !== id);
    this.render();
  }

  openModalForAdd() {
    this.modalHeading.innerHTML = `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--gold-primary);"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      Add New KPI Tile
    `;
    this.formId.value = '';
    this.formName.value = '';
    this.formCategory.value = 'financial';
    this.formPeriod.value = 'Q3 2026';
    this.formActual.value = '';
    this.formTarget.value = '';
    this.formPrefix.value = '$';
    this.formSuffix.value = '';
    this.formChange.value = '+10.0% MoM';
    this.formTrend.value = 'up';
    this.formDirection.value = 'higher';
    this.formNote.value = '';

    this.modal.classList.add('open');
  }

  openModalForEdit(id) {
    const kpi = this.kpis.find(k => k.id === id);
    if (!kpi) return;

    this.modalHeading.innerHTML = `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--gold-primary);"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      Configure KPI: ${kpi.name}
    `;
    this.formId.value = kpi.id;
    this.formName.value = kpi.name;
    this.formCategory.value = kpi.category;
    this.formPeriod.value = kpi.period || '';
    this.formActual.value = kpi.actual;
    this.formTarget.value = kpi.target;
    this.formPrefix.value = kpi.prefix || '';
    this.formSuffix.value = kpi.suffix || '';
    this.formChange.value = kpi.change || '';
    this.formTrend.value = kpi.trend || 'up';
    this.formDirection.value = kpi.direction || 'higher';
    this.formNote.value = kpi.note || '';

    this.modal.classList.add('open');
  }

  closeModal() {
    this.modal.classList.remove('open');
  }

  saveKpiFromForm() {
    const id = this.formId.value;
    const name = this.formName.value.trim();
    const category = this.formCategory.value;
    const period = this.formPeriod.value.trim();
    const actual = parseFloat(this.formActual.value) || 0;
    const target = parseFloat(this.formTarget.value) || 1;
    const prefix = this.formPrefix.value;
    const suffix = this.formSuffix.value;
    const change = this.formChange.value.trim();
    const trend = this.formTrend.value;
    const direction = this.formDirection.value;
    const note = this.formNote.value.trim();

    if (id) {
      // Edit existing
      const kpi = this.kpis.find(k => k.id === id);
      if (kpi) {
        kpi.name = name;
        kpi.category = category;
        kpi.period = period;
        kpi.actual = actual;
        kpi.target = target;
        kpi.prefix = prefix;
        kpi.suffix = suffix;
        kpi.change = change;
        kpi.trend = trend;
        kpi.direction = direction;
        kpi.note = note;
      }
    } else {
      // Add new
      this.kpis.push({
        id: 'kpi-' + Date.now(),
        name,
        category,
        period,
        actual,
        target,
        prefix,
        suffix,
        change,
        trend,
        direction,
        note
      });
    }

    this.closeModal();
    this.render();
  }

  exportJson() {
    const jsonStr = JSON.stringify({
      title: 'Executive KPI Dashboard Configuration',
      exportedAt: new Date().toISOString(),
      kpis: this.kpis
    }, null, 2);

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kpi_dashboard_config_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  importJson(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        const importedKpis = parsed.kpis || (Array.isArray(parsed) ? parsed : null);
        if (Array.isArray(importedKpis) && importedKpis.length > 0) {
          this.kpis = importedKpis;
          this.render();
          alert(`Successfully imported ${this.kpis.length} KPI tiles.`);
        } else {
          alert('Invalid KPI configuration JSON format.');
        }
      } catch (err) {
        alert('Failed to parse JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }
}

// Instantiate on load
document.addEventListener('DOMContentLoaded', () => {
  new KpiDashboardBuilder();
});