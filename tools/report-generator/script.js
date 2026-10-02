/**
 * Report Generator - Multi-Section Executive Corporate Reporting Suite
 * Complete client-side authoring suite, live recalculation engine, SVG chart synthesis, and high-fidelity print-to-PDF formatting.
 */

const REPORT_TEMPLATES = {
  qbr: {
    meta: {
      title: 'Q3 2026 Executive Business Review',
      subtitle: 'Consolidated Financial Performance, Operational Velocity & Strategic Directives',
      company: 'Vance & Dupont Global Enterprises',
      author: 'Elena Vance, Chief Executive Officer',
      period: 'Quarter Ending September 30, 2026',
      classification: 'Strictly Confidential • Board Review Only',
      date: new Date().toISOString().split('T')[0]
    },
    summary: `During the third quarter of 2026, Vance & Dupont Global Enterprises demonstrated exceptional commercial resilience and margin expansion across core operating business units. Group consolidated net revenues expanded by +18.4% year-over-year, outpacing consensus baseline guidance.

The acceleration was underpinned by enterprise customer expansions, cloud unit optimization, and disciplined OpEx governance. Cash conversion hit multi-year highs, establishing self-funding growth reserves for strategic international penetration in the upcoming fiscal cycle.

Key operating headwinds remained localized to component lead times and currency fluctuations across European markets, which were effectively offset by dynamic pricing adjustments in North America and Asia-Pacific.`,
    kpis: [
      { name: 'Consolidated Gross Revenue', baseline: '$38.2M', target: '$42.0M', actual: '$45.2M', rawTarget: 42.0, rawActual: 45.2, isHigherBetter: true },
      { name: 'Adjusted EBITDA Margin', baseline: '24.1%', target: '26.0%', actual: '28.4%', rawTarget: 26.0, rawActual: 28.4, isHigherBetter: true },
      { name: 'Net Dollar Retention (NDR)', baseline: '112%', target: '115%', actual: '119.5%', rawTarget: 115, rawActual: 119.5, isHigherBetter: true },
      { name: 'Customer Acquisition Cost (CAC)', baseline: '$14,200', target: '$13,000', actual: '$11,800', rawTarget: 13000, rawActual: 11800, isHigherBetter: false },
      { name: 'Free Cash Flow (FCF) Conversion', baseline: '74%', target: '80%', actual: '84.2%', rawTarget: 80, rawActual: 84.2, isHigherBetter: true },
      { name: 'Operating Runway Reserve', baseline: '22 mos', target: '24 mos', actual: '28 mos', rawTarget: 24, rawActual: 28, isHigherBetter: true }
    ],
    charts: {
      quarterly: [
        { label: 'Q1', target: 36, actual: 37.5 },
        { label: 'Q2', target: 39, actual: 41.2 },
        { label: 'Q3', target: 42, actual: 45.2 },
        { label: 'Q4 (Est)', target: 46, actual: 49.0 }
      ],
      allocation: [
        { label: 'R&D & Engineering', share: 38, color: '#d4af37' },
        { label: 'Sales & Go-To-Market', share: 28, color: '#38bdf8' },
        { label: 'Operations & Infra', share: 20, color: '#10b981' },
        { label: 'General & Admin', share: 14, color: '#f59e0b' }
      ]
    },
    findings: [
      {
        title: 'Accelerated Enterprise Deal Size',
        category: 'Market Expansion',
        impact: 'positive',
        desc: 'Average annual contract value (ACV) for Tier-1 multinational clients increased by 22%, driven by multi-product bundling.'
      },
      {
        title: 'Cloud Infrastructure Unit Cost Reduction',
        category: 'Operational Efficiency',
        impact: 'positive',
        desc: 'Long-term capacity reservation agreements secured an annualized $2.4M run-rate cost reduction in compute expenditure.'
      },
      {
        title: 'European Currency Volatility & Regulatory Headwinds',
        category: 'Risk Factor',
        impact: 'risk',
        desc: 'Persistent FX swings and regional compliance audits lengthened mid-market sales cycles in EMEA from 42 to 58 days.'
      }
    ],
    recommendations: [
      {
        initiative: 'Deploy Localized Tiered Pricing Matrix across EMEA',
        owner: 'Chief Commercial Officer',
        timeline: 'Q4 2026',
        priority: 'High',
        roi: 'Neutralize FX slippage; recapture +3.2% net margin'
      },
      {
        initiative: 'Scale Autonomous AI Workflows into Customer Success',
        owner: 'VP Operations',
        timeline: 'Q1 2027',
        priority: 'Urgent',
        roi: 'Reduce tier-2 escalation volume by 35%'
      },
      {
        initiative: 'Launch Asia-Pacific Sovereign Cloud Region Hub',
        owner: 'Chief Technology Officer',
        timeline: 'H1 2027',
        priority: 'Medium',
        roi: 'Unlock $15M addressable financial services pipeline'
      }
    ]
  },

  annual: {
    meta: {
      title: 'Fiscal Year 2026 Annual Audit & Operating Report',
      subtitle: 'Comprehensive Financial Audit, Enterprise Risk Matrix & Multi-Year Strategic Outlook',
      company: 'Vance & Dupont Global Enterprises',
      author: 'Audit Committee & Office of the CFO',
      period: 'Fiscal Year Ended 2026',
      classification: 'Commercial In Confidence • Executive Suite',
      date: new Date().toISOString().split('T')[0]
    },
    summary: `The 2026 fiscal year represented a defining inflection point for the enterprise. Consolidated operating profit surpassed prior guidance by +16.2%, while total debt liabilities were reduced by $18.5M through positive operating cash flows.

The company concluded its planned multi-year portfolio consolidation, divesting non-core peripheral businesses and concentrating capital into high-margin enterprise recurring platforms.

Independent external audit reviews validated the integrity of revenue recognition and tax optimization strategies with zero material deficiencies identified.`,
    kpis: [
      { name: 'Total Annual Net Revenue', baseline: '$142M', target: '$160M', actual: '$168.4M', rawTarget: 160, rawActual: 168.4, isHigherBetter: true },
      { name: 'Operating Margin (EBIT)', baseline: '19.5%', target: '22.0%', actual: '24.1%', rawTarget: 22, rawActual: 24.1, isHigherBetter: true },
      { name: 'Return on Invested Capital (ROIC)', baseline: '16.4%', target: '18.0%', actual: '21.2%', rawTarget: 18, rawActual: 21.2, isHigherBetter: true },
      { name: 'Days Sales Outstanding (DSO)', baseline: '44 days', target: '40 days', actual: '36 days', rawTarget: 40, rawActual: 36, isHigherBetter: false },
      { name: 'Net Debt to EBITDA Leverage', baseline: '1.8x', target: '1.5x', actual: '1.1x', rawTarget: 1.5, rawActual: 1.1, isHigherBetter: false }
    ],
    charts: {
      quarterly: [
        { label: 'FY23', target: 110, actual: 114 },
        { label: 'FY24', target: 125, actual: 128 },
        { label: 'FY25', target: 140, actual: 142 },
        { label: 'FY26', target: 160, actual: 168.4 }
      ],
      allocation: [
        { label: 'Core Software Platform', share: 44, color: '#d4af37' },
        { label: 'Global Distribution & Sales', share: 24, color: '#38bdf8' },
        { label: 'Governance & Compliance', share: 18, color: '#10b981' },
        { label: 'Capital Reserves', share: 14, color: '#f59e0b' }
      ]
    },
    findings: [
      {
        title: 'Capital Structure De-leveraging Success',
        category: 'Financial Operations',
        impact: 'positive',
        desc: 'Net interest obligations declined by 42% following prepayment of senior term notes.'
      },
      {
        title: 'Divestment of Sub-Scale Ancillary Assets',
        category: 'Strategic Portfolio',
        impact: 'positive',
        desc: 'Completed sale of non-strategic consumer unit, providing $12M net liquidity.'
      }
    ],
    recommendations: [
      {
        initiative: 'Authorize $25M Share Repurchase Program',
        owner: 'Board Audit Committee',
        timeline: 'Q1 2027',
        priority: 'High',
        roi: 'Accretive EPS enhancement and capital return to shareholders'
      },
      {
        initiative: 'Execute Enterprise ERP & Automated Close Consolidation',
        owner: 'Corporate Controller',
        timeline: 'Q2 2027',
        priority: 'Medium',
        roi: 'Reduce financial cycle close from 8 days to 3 days'
      }
    ]
  },

  growth: {
    meta: {
      title: 'Global Market Expansion & Strategic Growth Dossier',
      subtitle: 'Market TAM Sizing, Competitive Differentiation & New Geo Go-To-Market Plan',
      company: 'Vance & Dupont Global Enterprises',
      author: 'Corporate Development & Strategy Taskforce',
      period: 'Horizon 2027-2029 Strategic Blueprint',
      classification: 'Strictly Confidential • Board Review Only',
      date: new Date().toISOString().split('T')[0]
    },
    summary: `This strategic growth dossier outlines the investment case and risk profile for entering the fast-growing premium enterprise sector across Singapore, Tokyo, and Seoul.

Our competitive evaluation demonstrates an unaddressed $2.8B market gap in automated compliance and analytics infrastructure for regional financial institutions.

With an initial capital commitment of $18.0M over 18 months, our modeled conservative return generates cash-flow breakeven by Month 14 and an expected 38% IRR by Year 3.`,
    kpis: [
      { name: 'Target Market Opportunity (TAM)', baseline: '$1.8B', target: '$2.5B', actual: '$2.8B', rawTarget: 2.5, rawActual: 2.8, isHigherBetter: true },
      { name: 'Projected Net IRR (3-Year)', baseline: '28%', target: '32%', actual: '38.4%', rawTarget: 32, rawActual: 38.4, isHigherBetter: true },
      { name: 'Expected Payback Timeline', baseline: '18 mos', target: '16 mos', actual: '14 mos', rawTarget: 16, rawActual: 14, isHigherBetter: false },
      { name: 'Anchor Partner Pipeline Commitments', baseline: '$4.0M', target: '$6.0M', actual: '$8.5M', rawTarget: 6.0, rawActual: 8.5, isHigherBetter: true }
    ],
    charts: {
      quarterly: [
        { label: 'Year 1', target: 4.5, actual: 5.2 },
        { label: 'Year 2', target: 12.0, actual: 14.8 },
        { label: 'Year 3', target: 24.0, actual: 29.5 },
        { label: 'Year 4', target: 40.0, actual: 48.0 }
      ],
      allocation: [
        { label: 'Regional Field GTM', share: 45, color: '#d4af37' },
        { label: 'Local Cloud Infrastructure', share: 30, color: '#38bdf8' },
        { label: 'Regulatory & Legal Licensure', share: 15, color: '#10b981' },
        { label: 'Working Capital', share: 10, color: '#f59e0b' }
      ]
    },
    findings: [
      {
        title: 'Strong Institutional Appetite for Modernized Compliance Tools',
        category: 'Market Demand',
        impact: 'positive',
        desc: 'Over 14 Tier-1 banking entities in Singapore expressed early letters of intent (LOI).'
      },
      {
        title: 'Localized Regulatory Data Sovereignty Mandates',
        category: 'Regulatory',
        impact: 'neutral',
        desc: 'Requires local in-country hosting partners to satisfy central banking compliance standards.'
      }
    ],
    recommendations: [
      {
        initiative: 'Establish Regional Headquarters Subsidiary in Singapore',
        owner: 'General Counsel & MD APAC',
        timeline: 'Q1 2027',
        priority: 'Urgent',
        roi: 'Formalizes operating license and corporate entity'
      },
      {
        initiative: 'Execute Strategic Hosting Alliance with Equinix APAC',
        owner: 'VP Infrastructure',
        timeline: 'Q2 2027',
        priority: 'High',
        roi: 'Guarantees sovereign low-latency cloud infrastructure'
      }
    ]
  }
};

class ReportGeneratorSuite {
  constructor() {
    this.currentTemplateKey = 'qbr';
    this.report = JSON.parse(JSON.stringify(REPORT_TEMPLATES.qbr));
    this.viewMode = 'editor'; // 'editor' | 'preview'

    this.init();
  }

  init() {
    this.cacheDom();
    this.bindEvents();
    this.loadTemplate('qbr');
  }

  cacheDom() {
    // Top Controls
    this.templateSelect = document.getElementById('report-template-select');
    this.btnLoadTemplate = document.getElementById('btn-load-report-template');
    this.viewModeEditorBtn = document.getElementById('view-mode-editor');
    this.viewModePreviewBtn = document.getElementById('view-mode-preview');
    this.btnCopySummary = document.getElementById('btn-copy-summary');
    this.btnExportJson = document.getElementById('btn-export-report-json');
    this.btnPrintReport = document.getElementById('btn-print-report');

    // Containers
    this.editorContainer = document.getElementById('editor-container');
    this.previewContainer = document.getElementById('preview-container');
    this.documentPaper = document.getElementById('document-paper');

    // Metadata inputs
    this.metaTitle = document.getElementById('meta-title');
    this.metaSubtitle = document.getElementById('meta-subtitle');
    this.metaCompany = document.getElementById('meta-company');
    this.metaAuthor = document.getElementById('meta-author');
    this.metaPeriod = document.getElementById('meta-period');
    this.metaClassification = document.getElementById('meta-classification');
    this.metaDate = document.getElementById('meta-date');

    // Section 1
    this.editorSummary = document.getElementById('editor-summary');

    // Section 2: KPI Table
    this.editorKpiTbody = document.getElementById('editor-kpi-tbody');
    this.editorKpiTfoot = document.getElementById('editor-kpi-tfoot');
    this.btnAddKpiRow = document.getElementById('btn-add-kpi-row');

    // Section 3: Charts
    this.editorChartBar = document.getElementById('editor-chart-bar');
    this.editorChartDonut = document.getElementById('editor-chart-donut');

    // Section 4: Findings
    this.editorFindingsList = document.getElementById('editor-findings-list');
    this.btnAddFinding = document.getElementById('btn-add-finding');

    // Section 5: Recommendations
    this.editorRecTbody = document.getElementById('editor-rec-tbody');
    this.btnAddRecRow = document.getElementById('btn-add-rec-row');
  }

  bindEvents() {
    this.btnLoadTemplate.addEventListener('click', () => {
      this.loadTemplate(this.templateSelect.value);
    });

    this.templateSelect.addEventListener('change', () => {
      this.loadTemplate(this.templateSelect.value);
    });

    this.viewModeEditorBtn.addEventListener('click', () => {
      this.switchMode('editor');
    });

    this.viewModePreviewBtn.addEventListener('click', () => {
      this.switchMode('preview');
    });

    this.btnPrintReport.addEventListener('click', () => {
      this.syncEditorToData();
      this.renderDocumentPreview();
      window.print();
    });

    this.btnCopySummary.addEventListener('click', () => {
      this.copyExecutiveSummary();
    });

    this.btnExportJson.addEventListener('click', () => {
      this.exportJson();
    });

    // Metadata live updates
    [this.metaTitle, this.metaSubtitle, this.metaCompany, this.metaAuthor, this.metaPeriod, this.metaClassification, this.metaDate].forEach(input => {
      input.addEventListener('input', () => {
        this.syncEditorToData();
      });
    });

    this.editorSummary.addEventListener('input', () => {
      this.report.summary = this.editorSummary.value;
    });

    // Row adders
    this.btnAddKpiRow.addEventListener('click', () => {
      this.report.kpis.push({
        name: 'New Business Indicator',
        baseline: '$10.0M',
        target: '$12.0M',
        actual: '$12.8M',
        rawTarget: 12.0,
        rawActual: 12.8,
        isHigherBetter: true
      });
      this.renderKpiEditorTable();
    });

    this.btnAddFinding.addEventListener('click', () => {
      this.report.findings.push({
        title: 'New Key Observation',
        category: 'Operations',
        impact: 'positive',
        desc: 'Detailed narrative description of the strategic observation.'
      });
      this.renderFindingsEditor();
    });

    this.btnAddRecRow.addEventListener('click', () => {
      this.report.recommendations.push({
        initiative: 'New Strategic Initiative',
        owner: 'Executive Sponsor',
        timeline: 'Q4 2026',
        priority: 'High',
        roi: 'Expected quantified business outcome'
      });
      this.renderRecommendationsEditor();
    });
  }

  loadTemplate(key) {
    const tpl = REPORT_TEMPLATES[key] || REPORT_TEMPLATES.qbr;
    this.currentTemplateKey = key;
    this.report = JSON.parse(JSON.stringify(tpl));

    this.populateEditorForm();
    this.renderVisuals();
  }

  populateEditorForm() {
    this.metaTitle.value = this.report.meta.title;
    this.metaSubtitle.value = this.report.meta.subtitle;
    this.metaCompany.value = this.report.meta.company;
    this.metaAuthor.value = this.report.meta.author;
    this.metaPeriod.value = this.report.meta.period;
    this.metaClassification.value = this.report.meta.classification;
    this.metaDate.value = this.report.meta.date;

    this.editorSummary.value = this.report.summary;

    this.renderKpiEditorTable();
    this.renderFindingsEditor();
    this.renderRecommendationsEditor();
  }

  syncEditorToData() {
    this.report.meta.title = this.metaTitle.value;
    this.report.meta.subtitle = this.metaSubtitle.value;
    this.report.meta.company = this.metaCompany.value;
    this.report.meta.author = this.metaAuthor.value;
    this.report.meta.period = this.metaPeriod.value;
    this.report.meta.classification = this.metaClassification.value;
    this.report.meta.date = this.metaDate.value;
    this.report.summary = this.editorSummary.value;
  }

  switchMode(mode) {
    this.viewMode = mode;
    if (mode === 'editor') {
      this.viewModeEditorBtn.classList.add('active');
      this.viewModePreviewBtn.classList.remove('active');
      this.editorContainer.style.display = 'flex';
      this.previewContainer.style.display = 'none';
    } else {
      this.syncEditorToData();
      this.viewModeEditorBtn.classList.remove('active');
      this.viewModePreviewBtn.classList.add('active');
      this.editorContainer.style.display = 'none';
      this.previewContainer.style.display = 'block';
      this.renderDocumentPreview();
    }
  }

  // --- KPI TABLE EDITOR ---
  renderKpiEditorTable() {
    let totalTarget = 0;
    let totalActual = 0;
    let validCount = 0;

    this.editorKpiTbody.innerHTML = this.report.kpis.map((kpi, index) => {
      const targetNum = Number(kpi.rawTarget) || 1;
      const actualNum = Number(kpi.rawActual) || 0;
      const isHigher = kpi.isHigherBetter !== false;

      let variance = 0;
      let attainment = 0;
      let statusClass = 'positive';
      let statusLabel = 'Achieved';

      if (isHigher) {
        variance = ((actualNum - targetNum) / targetNum) * 100;
        attainment = (actualNum / targetNum) * 100;
        if (variance >= 5) {
          statusClass = 'positive';
          statusLabel = 'Exceeded';
        } else if (variance >= -5) {
          statusClass = 'neutral';
          statusLabel = 'Achieved';
        } else {
          statusClass = 'risk';
          statusLabel = 'At Risk';
        }
      } else {
        variance = ((targetNum - actualNum) / targetNum) * 100;
        attainment = (targetNum / actualNum) * 100;
        if (actualNum <= targetNum * 0.95) {
          statusClass = 'positive';
          statusLabel = 'Exceeded';
        } else if (actualNum <= targetNum * 1.05) {
          statusClass = 'neutral';
          statusLabel = 'Achieved';
        } else {
          statusClass = 'risk';
          statusLabel = 'At Risk';
        }
      }

      totalTarget += targetNum;
      totalActual += actualNum;
      validCount++;

      return `
        <tr>
          <td>
            <input type="text" class="form-input kpi-edit-name" data-idx="${index}" value="${kpi.name}" style="padding: 0.35rem 0.5rem; font-size: 0.85rem;">
          </td>
          <td>
            <input type="text" class="form-input kpi-edit-base" data-idx="${index}" value="${kpi.baseline}" style="padding: 0.35rem 0.5rem; font-size: 0.85rem; width: 100px;">
          </td>
          <td>
            <input type="number" step="any" class="form-input kpi-edit-target" data-idx="${index}" value="${kpi.rawTarget}" style="padding: 0.35rem 0.5rem; font-size: 0.85rem; width: 110px;">
          </td>
          <td>
            <input type="number" step="any" class="form-input kpi-edit-actual" data-idx="${index}" value="${kpi.rawActual}" style="padding: 0.35rem 0.5rem; font-size: 0.85rem; width: 110px;">
          </td>
          <td style="font-family: monospace; font-weight: 600; color: ${variance >= 0 ? 'var(--emerald-accent)' : 'var(--rose-accent)'};">
            ${variance >= 0 ? '+' : ''}${variance.toFixed(1)}%
          </td>
          <td>
            <span class="finding-badge ${statusClass}">
              &bull; ${statusLabel}
            </span>
          </td>
          <td style="text-align: center;">
            <button class="tile-btn-icon delete btn-remove-kpi" data-idx="${index}" title="Remove KPI">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    const avgAttainment = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 100;
    this.editorKpiTfoot.innerHTML = `
      <tr>
        <td colspan="4" style="padding: 0.75rem 1rem;">Composite Performance Portfolio (${validCount} Key Metrics)</td>
        <td style="font-family: monospace; color: var(--gold-secondary);">${avgAttainment.toFixed(1)}% Attainment</td>
        <td colspan="2"><span style="color: var(--emerald-accent);">&bull; Target Aligned</span></td>
      </tr>
    `;

    this.bindKpiRowInputs();
  }

  bindKpiRowInputs() {
    this.editorKpiTbody.querySelectorAll('.kpi-edit-name').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = e.target.getAttribute('data-idx');
        this.report.kpis[idx].name = e.target.value;
      });
    });

    this.editorKpiTbody.querySelectorAll('.kpi-edit-base').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = e.target.getAttribute('data-idx');
        this.report.kpis[idx].baseline = e.target.value;
      });
    });

    this.editorKpiTbody.querySelectorAll('.kpi-edit-target').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = e.target.getAttribute('data-idx');
        const num = parseFloat(e.target.value) || 0;
        this.report.kpis[idx].rawTarget = num;
        this.report.kpis[idx].target = String(num);
        this.renderKpiEditorTable();
      });
    });

    this.editorKpiTbody.querySelectorAll('.kpi-edit-actual').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = e.target.getAttribute('data-idx');
        const num = parseFloat(e.target.value) || 0;
        this.report.kpis[idx].rawActual = num;
        this.report.kpis[idx].actual = String(num);
        this.renderKpiEditorTable();
      });
    });

    this.editorKpiTbody.querySelectorAll('.btn-remove-kpi').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        this.report.kpis.splice(idx, 1);
        this.renderKpiEditorTable();
      });
    });
  }

  // --- FINDINGS EDITOR ---
  renderFindingsEditor() {
    this.editorFindingsList.innerHTML = this.report.findings.map((f, index) => `
      <div class="finding-item" data-idx="${index}">
        <div class="finding-header">
          <div style="display: flex; gap: 0.75rem; align-items: center; flex: 1;">
            <input type="text" class="form-input finding-edit-title" data-idx="${index}" value="${f.title}" style="padding: 0.35rem 0.6rem; font-weight: 700; max-width: 320px;" placeholder="Finding Title">
            <input type="text" class="form-input finding-edit-cat" data-idx="${index}" value="${f.category}" style="padding: 0.35rem 0.6rem; font-size: 0.8rem; width: 140px;" placeholder="Category">
            <select class="form-select finding-edit-impact" data-idx="${index}" style="padding: 0.35rem 0.6rem; width: 130px; font-size: 0.8rem;">
              <option value="positive" ${f.impact === 'positive' ? 'selected' : ''}>Positive</option>
              <option value="risk" ${f.impact === 'risk' ? 'selected' : ''}>Risk / Watch</option>
              <option value="neutral" ${f.impact === 'neutral' ? 'selected' : ''}>Neutral</option>
            </select>
          </div>
          <button class="tile-btn-icon delete btn-remove-finding" data-idx="${index}" title="Remove Finding">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
        <textarea class="form-textarea finding-edit-desc" data-idx="${index}" style="min-height: 60px; font-size: 0.85rem; padding: 0.5rem;">${f.desc}</textarea>
      </div>
    `).join('');

    this.bindFindingsInputs();
  }

  bindFindingsInputs() {
    this.editorFindingsList.querySelectorAll('.finding-edit-title').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = e.target.getAttribute('data-idx');
        this.report.findings[idx].title = e.target.value;
      });
    });

    this.editorFindingsList.querySelectorAll('.finding-edit-cat').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = e.target.getAttribute('data-idx');
        this.report.findings[idx].category = e.target.value;
      });
    });

    this.editorFindingsList.querySelectorAll('.finding-edit-impact').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const idx = e.target.getAttribute('data-idx');
        this.report.findings[idx].impact = e.target.value;
      });
    });

    this.editorFindingsList.querySelectorAll('.finding-edit-desc').forEach(txt => {
      txt.addEventListener('input', (e) => {
        const idx = e.target.getAttribute('data-idx');
        this.report.findings[idx].desc = e.target.value;
      });
    });

    this.editorFindingsList.querySelectorAll('.btn-remove-finding').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        this.report.findings.splice(idx, 1);
        this.renderFindingsEditor();
      });
    });
  }

  // --- RECOMMENDATIONS EDITOR ---
  renderRecommendationsEditor() {
    this.editorRecTbody.innerHTML = this.report.recommendations.map((r, index) => `
      <tr>
        <td>
          <input type="text" class="form-input rec-edit-init" data-idx="${index}" value="${r.initiative}" style="padding: 0.35rem 0.5rem; font-size: 0.85rem;">
        </td>
        <td>
          <input type="text" class="form-input rec-edit-owner" data-idx="${index}" value="${r.owner}" style="padding: 0.35rem 0.5rem; font-size: 0.85rem; width: 140px;">
        </td>
        <td>
          <input type="text" class="form-input rec-edit-timeline" data-idx="${index}" value="${r.timeline}" style="padding: 0.35rem 0.5rem; font-size: 0.85rem; width: 90px;">
        </td>
        <td>
          <select class="form-select rec-edit-pri" data-idx="${index}" style="padding: 0.35rem 0.5rem; font-size: 0.85rem; width: 95px;">
            <option value="Urgent" ${r.priority === 'Urgent' ? 'selected' : ''}>Urgent</option>
            <option value="High" ${r.priority === 'High' ? 'selected' : ''}>High</option>
            <option value="Medium" ${r.priority === 'Medium' ? 'selected' : ''}>Medium</option>
            <option value="Planned" ${r.priority === 'Planned' ? 'selected' : ''}>Planned</option>
          </select>
        </td>
        <td>
          <input type="text" class="form-input rec-edit-roi" data-idx="${index}" value="${r.roi}" style="padding: 0.35rem 0.5rem; font-size: 0.85rem;">
        </td>
        <td style="text-align: center;">
          <button class="tile-btn-icon delete btn-remove-rec" data-idx="${index}" title="Remove Item">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      </tr>
    `).join('');

    this.bindRecommendationsInputs();
  }

  bindRecommendationsInputs() {
    this.editorRecTbody.querySelectorAll('.rec-edit-init').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = e.target.getAttribute('data-idx');
        this.report.recommendations[idx].initiative = e.target.value;
      });
    });

    this.editorRecTbody.querySelectorAll('.rec-edit-owner').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = e.target.getAttribute('data-idx');
        this.report.recommendations[idx].owner = e.target.value;
      });
    });

    this.editorRecTbody.querySelectorAll('.rec-edit-timeline').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = e.target.getAttribute('data-idx');
        this.report.recommendations[idx].timeline = e.target.value;
      });
    });

    this.editorRecTbody.querySelectorAll('.rec-edit-pri').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const idx = e.target.getAttribute('data-idx');
        this.report.recommendations[idx].priority = e.target.value;
      });
    });

    this.editorRecTbody.querySelectorAll('.rec-edit-roi').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = e.target.getAttribute('data-idx');
        this.report.recommendations[idx].roi = e.target.value;
      });
    });

    this.editorRecTbody.querySelectorAll('.btn-remove-rec').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        this.report.recommendations.splice(idx, 1);
        this.renderRecommendationsEditor();
      });
    });
  }

  // --- SVG CHARTS SYNTHESIS ---
  renderVisuals() {
    this.renderComboBarChart(this.editorChartBar);
    this.renderAllocationDonutChart(this.editorChartDonut);
  }

  renderComboBarChart(container) {
    const qData = this.report.charts.quarterly;
    const width = 460;
    const height = 220;
    const padding = { top: 20, right: 25, bottom: 40, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxVal = Math.max(...qData.map(d => Math.max(d.target, d.actual)), 1) * 1.15;
    const step = chartW / qData.length;
    const barW = step * 0.4;

    let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="qBarGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#d4af37" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#8a6e1d" stop-opacity="0.3" />
        </linearGradient>
      </defs>`;

    // Horizontal grid lines
    [0, 0.5, 1].forEach(ratio => {
      const y = padding.top + chartH * (1 - ratio);
      const val = (maxVal * ratio).toFixed(0);
      svg += `
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="rgba(255,255,255,0.08)" stroke-dasharray="3,3" />
        <text x="${padding.left - 8}" y="${y + 4}" fill="var(--text-secondary)" font-size="10" text-anchor="end" font-family="monospace">$${val}M</text>
      `;
    });

    // Bars (Actual) and Line Points (Target)
    const targetPoints = [];

    qData.forEach((d, i) => {
      const x = padding.left + i * step + (step - barW) / 2;
      const barH = (d.actual / maxVal) * chartH;
      const y = padding.top + chartH - barH;

      svg += `
        <rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="3" fill="url(#qBarGrad)" />
        <text x="${x + barW / 2}" y="${y - 6}" fill="var(--gold-secondary)" font-size="10" text-anchor="middle" font-weight="700">$${d.actual}M</text>
        <text x="${x + barW / 2}" y="${height - padding.bottom + 18}" fill="var(--text-secondary)" font-size="11" text-anchor="middle">${d.label}</text>
      `;

      const targetY = padding.top + chartH - (d.target / maxVal) * chartH;
      targetPoints.push({ x: x + barW / 2, y: targetY });
    });

    // Target Line
    const targetPath = targetPoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');
    svg += `<path d="${targetPath}" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="4,4" />`;
    targetPoints.forEach(pt => {
      svg += `<circle cx="${pt.x}" cy="${pt.y}" r="4" fill="#38bdf8" stroke="var(--bg-secondary)" stroke-width="2" />`;
    });

    svg += '</svg>';
    container.innerHTML = svg;
  }

  renderAllocationDonutChart(container) {
    const alloc = this.report.charts.allocation;
    const width = 240;
    const height = 220;
    const cx = 110;
    const cy = 110;
    const rOuter = 78;
    const rInner = 48;

    let cumulative = -Math.PI / 2;
    let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

    alloc.forEach(item => {
      const angle = (item.share / 100) * 2 * Math.PI;
      const start = cumulative;
      const end = cumulative + angle;
      cumulative = end;

      const x1 = cx + rOuter * Math.cos(start);
      const y1 = cy + rOuter * Math.sin(start);
      const x2 = cx + rOuter * Math.cos(end);
      const y2 = cy + rOuter * Math.sin(end);

      const x1In = cx + rInner * Math.cos(end);
      const y1In = cy + rInner * Math.sin(end);
      const x2In = cx + rInner * Math.cos(start);
      const y2In = cy + rInner * Math.sin(start);

      const large = angle > Math.PI ? 1 : 0;
      const d = `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${large} 1 ${x2} ${y2} L ${x1In} ${y1In} A ${rInner} ${rInner} 0 ${large} 0 ${x2In} ${y2In} Z`;

      svg += `<path d="${d}" fill="${item.color}" stroke="var(--bg-secondary)" stroke-width="2" />`;
    });

    // Center label
    svg += `
      <circle cx="${cx}" cy="${cy}" r="${rInner - 2}" fill="var(--bg-secondary)" />
      <text x="${cx}" y="${cy}" fill="var(--gold-secondary)" font-size="12" font-weight="700" text-anchor="middle">OPEX</text>
      <text x="${cx}" y="${cy + 14}" fill="var(--text-secondary)" font-size="9" text-anchor="middle">100%</text>
    `;

    svg += '</svg>';
    container.innerHTML = svg;
  }

  // --- DOCUMENT PREVIEW SYNTHESIS (PRINT / PDF READY) ---
  renderDocumentPreview() {
    const meta = this.report.meta;
    const summaryParagraphs = this.report.summary.split(/\n\n+/).map(p => `<p class="doc-paragraph">${p.trim()}</p>`).join('');

    let kpiRowsHtml = '';
    let totalTarget = 0;
    let totalActual = 0;

    this.report.kpis.forEach(kpi => {
      const targetNum = Number(kpi.rawTarget) || 1;
      const actualNum = Number(kpi.rawActual) || 0;
      const isHigher = kpi.isHigherBetter !== false;

      let variance = 0;
      let statusLabel = 'Achieved';

      if (isHigher) {
        variance = ((actualNum - targetNum) / targetNum) * 100;
        statusLabel = variance >= 5 ? 'Exceeded' : (variance >= -5 ? 'Achieved' : 'At Risk');
      } else {
        variance = ((targetNum - actualNum) / targetNum) * 100;
        statusLabel = actualNum <= targetNum * 0.95 ? 'Exceeded' : (actualNum <= targetNum * 1.05 ? 'Achieved' : 'At Risk');
      }

      totalTarget += targetNum;
      totalActual += actualNum;

      kpiRowsHtml += `
        <tr>
          <td style="font-weight: 600;">${kpi.name}</td>
          <td style="color: var(--text-secondary);">${kpi.baseline}</td>
          <td>${kpi.target}</td>
          <td style="font-weight: 700;">${kpi.actual}</td>
          <td style="font-family: monospace; font-weight: 700; color: ${variance >= 0 ? 'var(--emerald-accent)' : 'var(--rose-accent)'};">
            ${variance >= 0 ? '+' : ''}${variance.toFixed(1)}%
          </td>
          <td>
            <span class="finding-badge ${statusLabel === 'Exceeded' ? 'positive' : (statusLabel === 'Achieved' ? 'neutral' : 'risk')}">
              &bull; ${statusLabel}
            </span>
          </td>
        </tr>
      `;
    });

    const findingsHtml = this.report.findings.map(f => `
      <div class="finding-item" style="border-left: 3px solid ${f.impact === 'positive' ? 'var(--emerald-accent)' : (f.impact === 'risk' ? 'var(--rose-accent)' : 'var(--sapphire-accent)')};">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="font-size: 1.05rem; color: var(--text-primary);">${f.title}</strong>
          <span class="finding-badge ${f.impact}">&bull; ${f.category}</span>
        </div>
        <div style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; margin-top: 0.25rem;">
          ${f.desc}
        </div>
      </div>
    `).join('');

    const recsHtml = this.report.recommendations.map(r => `
      <tr>
        <td style="font-weight: 600;">${r.initiative}</td>
        <td>${r.owner}</td>
        <td>${r.timeline}</td>
        <td>
          <span style="font-size: 0.78rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 4px; background: rgba(255,255,255,0.06);">
            ${r.priority}
          </span>
        </td>
        <td style="color: var(--text-secondary); font-size: 0.85rem;">${r.roi}</td>
      </tr>
    `).join('');

    this.documentPaper.innerHTML = `
      <!-- Corporate Header -->
      <div class="doc-header-block">
        <div>
          <div class="doc-org-name">${meta.company}</div>
          <h1 class="doc-title">${meta.title}</h1>
          <div class="doc-subtitle">${meta.subtitle}</div>
        </div>
        <div class="doc-meta-table">
          <div class="doc-classification-tag">${meta.classification}</div>
          <div>Prepared By: <strong>${meta.author}</strong></div>
          <div>Period: <strong>${meta.period}</strong></div>
          <div>Publication Date: <strong>${meta.date}</strong></div>
        </div>
      </div>

      <!-- Section 1: Executive Summary -->
      <div>
        <h2 class="doc-section-heading">1. Executive Summary & Context</h2>
        ${summaryParagraphs}
      </div>

      <!-- Section 2: KPI & Targets Table -->
      <div>
        <h2 class="doc-section-heading">2. Performance Metrics & Milestone Attainment</h2>
        <div class="table-responsive">
          <table class="data-table" style="background: transparent;">
            <thead>
              <tr>
                <th>Strategic Metric</th>
                <th>Baseline</th>
                <th>Target</th>
                <th>Actual</th>
                <th>Variance (%)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${kpiRowsHtml}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section 3: Visual Analytics -->
      <div class="page-break">
        <h2 class="doc-section-heading">3. Visual Analytics & Capital Trajectory</h2>
        <div class="doc-charts-grid">
          <div class="chart-card" style="padding: 1.5rem;">
            <div style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; color: var(--gold-secondary); margin-bottom: 0.5rem;">
              Revenue vs Operating Target ($M)
            </div>
            <div id="preview-chart-bar" style="height: 220px;"></div>
          </div>
          <div class="chart-card" style="padding: 1.5rem;">
            <div style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; color: var(--gold-secondary); margin-bottom: 0.5rem;">
              Operating Capital Allocation
            </div>
            <div id="preview-chart-donut" style="height: 220px;"></div>
          </div>
        </div>
      </div>

      <!-- Section 4: Key Findings -->
      <div>
        <h2 class="doc-section-heading">4. Key Findings & Strategic Insights</h2>
        <div class="findings-container">
          ${findingsHtml}
        </div>
      </div>

      <!-- Section 5: Recommendations -->
      <div>
        <h2 class="doc-section-heading">5. Strategic Recommendations & Action Matrix</h2>
        <div class="table-responsive">
          <table class="data-table" style="background: transparent;">
            <thead>
              <tr>
                <th>Initiative</th>
                <th>Executive Owner</th>
                <th>Timeline</th>
                <th>Priority</th>
                <th>Projected Impact / ROI</th>
              </tr>
            </thead>
            <tbody>
              ${recsHtml}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section 6: Governance & Sign-Off -->
      <div class="doc-signature-block">
        <div>
          <div style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--gold-secondary);">Executive Sponsor</div>
          <div class="sig-line">
            <strong>${meta.author}</strong><br>
            <span>Authorized Signature &bull; Vance & Dupont Global</span>
          </div>
        </div>
        <div>
          <div style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--gold-secondary);">Audit & Board Governance</div>
          <div class="sig-line">
            <strong>Board of Directors / Audit Committee</strong><br>
            <span>Ratified & Recorded: ${meta.date}</span>
          </div>
        </div>
      </div>
    `;

    // Render charts inside preview
    const previewBar = document.getElementById('preview-chart-bar');
    const previewDonut = document.getElementById('preview-chart-donut');
    if (previewBar && previewDonut) {
      this.renderComboBarChart(previewBar);
      this.renderAllocationDonutChart(previewDonut);
    }
  }

  // --- EXPORT & COPY ---
  copyExecutiveSummary() {
    this.syncEditorToData();
    const meta = this.report.meta;
    const text = `# ${meta.title}
## ${meta.company} - ${meta.period}
**Classification:** ${meta.classification} | **Prepared By:** ${meta.author}

### Executive Summary
${this.report.summary}

### Key Performance Indicators
${this.report.kpis.map(k => `- **${k.name}**: Actual ${k.actual} (Target: ${k.target})`).join('\n')}

### Strategic Recommendations
${this.report.recommendations.map(r => `1. **${r.initiative}** (Owner: ${r.owner} | Priority: ${r.priority}) - ${r.roi}`).join('\n')}
`;

    navigator.clipboard.writeText(text).then(() => {
      alert('Executive report brief copied to clipboard in formatted Markdown.');
    }).catch(err => {
      console.warn('Clipboard failed:', err);
    });
  }

  exportJson() {
    this.syncEditorToData();
    const jsonStr = JSON.stringify(this.report, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `executive_report_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Instantiate on DOM load
document.addEventListener('DOMContentLoaded', () => {
  new ReportGeneratorSuite();
});