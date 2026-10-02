/**
 * Product Sell Analyzer - Sales Velocity & Portfolio Pareto Intelligence
 * Complete client-side calculation engine, Pareto (80/20) analyzer, SVG visualizations, and inventory action center.
 */

const PRODUCT_PRESETS = {
  electronics: [
    { sku: 'DRN-4K-PRO', name: 'Smart 4K Video Drone Pro', category: 'Robotics & Video', channel: 'Shopify Direct', cost: 420.00, price: 1199.00, volume: 280 },
    { sku: 'HDP-NC-MAX', name: 'Noise-Cancelling Headphones Max', category: 'Audio', channel: 'Amazon Storefront', cost: 85.00, price: 349.00, volume: 1150 },
    { sku: 'TAB-OLED-12', name: 'Ultra-Slim OLED Tablet 12"', category: 'Computing', channel: 'Wholesale B2B', cost: 290.00, price: 699.00, volume: 410 },
    { sku: 'WCH-SR-V', name: 'Smartwatch Series V Active', category: 'Wearables', channel: 'Shopify Direct', cost: 65.00, price: 279.00, volume: 840 },
    { sku: 'EAR-WRL-DRV', name: 'Dual-Driver Wireless Earbuds', category: 'Audio', channel: 'Amazon Storefront', cost: 22.00, price: 89.00, volume: 1850 },
    { sku: 'CHG-GAN-65W', name: '65W Fast GaN Wall Charger', category: 'Accessories', channel: 'Amazon Storefront', cost: 7.50, price: 34.00, volume: 1600 },
    { sku: 'MNT-MAG-STN', name: 'Magnetic Phone Stand & USB Hub', category: 'Accessories', channel: 'Shopify Direct', cost: 12.00, price: 49.00, volume: 480 },
    { sku: 'VR-CTR-SPAT', name: 'VR Spatial Headset Controller', category: 'Gaming', channel: 'Wholesale B2B', cost: 140.00, price: 219.00, volume: 42 },
    { sku: 'PEN-PRC-STY', name: 'Stylus Precision Pen Gen 2', category: 'Accessories', channel: 'Shopify Direct', cost: 18.00, price: 39.00, volume: 68 }
  ],

  luxury: [
    { sku: 'DUF-LTH-WKND', name: 'Hand-Stitched Leather Weekend Duffle', category: 'Leather Goods', channel: 'Private Salon', cost: 380.00, price: 2450.00, volume: 145 },
    { sku: 'WCH-CHR-MECH', name: 'Chronograph Mechanical Watch', category: 'Horlogerie', channel: 'Flagship Store', cost: 1850.00, price: 7800.00, volume: 52 },
    { sku: 'SC-TWL-CARRE', name: 'Silk Twill Carré Scarf', category: 'Accessories', channel: 'Shopify Direct', cost: 45.00, price: 480.00, volume: 680 },
    { sku: 'COT-CSH-OVR', name: 'Pure Cashmere Tailored Overcoat', category: 'Apparel', channel: 'Private Salon', cost: 420.00, price: 2850.00, volume: 95 },
    { sku: 'SHO-ITL-OXF', name: 'Italian Calfskin Oxford Shoes', category: 'Footwear', channel: 'Flagship Store', cost: 180.00, price: 980.00, volume: 210 },
    { sku: 'PRF-ART-100', name: 'Artisanal Extrait de Parfum 100ml', category: 'Fragrance', channel: 'Shopify Direct', cost: 28.00, price: 320.00, volume: 820 },
    { sku: 'JWL-RSG-CUF', name: '18k Rose Gold Geometric Cufflinks', category: 'Jewelry', channel: 'Flagship Store', cost: 310.00, price: 650.00, volume: 22 },
    { sku: 'ACC-PKT-SQR', name: 'Embroidered Silk Pocket Square', category: 'Accessories', channel: 'Shopify Direct', cost: 15.00, price: 85.00, volume: 38 }
  ],

  skincare: [
    { sku: 'SRM-BIO-PEPT', name: 'Bio-Peptide Anti-Aging Serum 50ml', category: 'Serums', channel: 'Shopify Direct', cost: 14.00, price: 125.00, volume: 2450 },
    { sku: 'EYE-CL-RAD', name: 'Cellular Radiance Eye Cream', category: 'Eye Care', channel: 'Amazon Storefront', cost: 9.00, price: 85.00, volume: 1920 },
    { sku: 'BLM-OVN-HYD', name: 'Overnight Hydration Barrier Balm', category: 'Moisturizers', channel: 'Shopify Direct', cost: 12.00, price: 95.00, volume: 1480 },
    { sku: 'CLN-GEN-ENZ', name: 'Gentle Enzyme Cleansing Gel', category: 'Cleansers', channel: 'Amazon Storefront', cost: 5.50, price: 42.00, volume: 3100 },
    { sku: 'SUN-SHR-SPF', name: 'Sheer Mineral Sunscreen SPF 50', category: 'Sun Care', channel: 'Shopify Direct', cost: 6.00, price: 48.00, volume: 3400 },
    { sku: 'TRT-MSK-EXF', name: 'Intensive AHA/BHA Exfoliating Mask', category: 'Treatments', channel: 'Wholesale B2B', cost: 18.00, price: 54.00, volume: 72 },
    { sku: 'LIP-BOT-POT', name: 'Botanical Ceramide Lip Nourish Pot', category: 'Lip Care', channel: 'Shopify Direct', cost: 3.50, price: 19.00, volume: 115 }
  ]
};

const CHANNEL_COLORS = {
  'Shopify Direct': '#d4af37',
  'Amazon Storefront': '#f59e0b',
  'Wholesale B2B': '#38bdf8',
  'Flagship Store': '#10b981',
  'Private Salon': '#a855f7'
};

class ProductSellAnalyzer {
  constructor() {
    this.currentPreset = 'electronics';
    this.products = JSON.parse(JSON.stringify(PRODUCT_PRESETS.electronics));
    this.searchQuery = '';
    this.sortCol = 'revenue';
    this.sortAsc = false;

    this.init();
  }

  init() {
    this.cacheDom();
    this.bindEvents();
    this.calculateAndRender();
  }

  cacheDom() {
    // Top Controls
    this.presetSelect = document.getElementById('catalog-preset-select');
    this.btnLoadPreset = document.getElementById('btn-load-preset');
    this.btnAddSku = document.getElementById('btn-add-sku');
    this.btnOpenBulk = document.getElementById('btn-open-bulk');
    this.btnExportCsv = document.getElementById('btn-export-csv');
    this.btnExportJson = document.getElementById('btn-export-json');
    this.btnPrintAnalysis = document.getElementById('btn-print-analysis');

    // KPI Cards
    this.kpiCardsContainer = document.getElementById('analyzer-kpi-cards');

    // Charts
    this.paretoChartContainer = document.getElementById('pareto-chart-container');
    this.paretoSummaryBadge = document.getElementById('pareto-summary-badge');
    this.channelChartContainer = document.getElementById('channel-chart-container');
    this.channelLegend = document.getElementById('channel-legend');
    this.channelCountBadge = document.getElementById('channel-count-badge');

    // Alerts
    this.slowMovingList = document.getElementById('slow-moving-list');
    this.slowMovingCountBadge = document.getElementById('slow-moving-count-badge');

    // Table
    this.skuSearch = document.getElementById('sku-search');
    this.catalogRowCount = document.getElementById('catalog-row-count');
    this.catalogTbody = document.getElementById('catalog-tbody');

    // SKU Modal
    this.skuModal = document.getElementById('sku-modal');
    this.skuModalTitle = document.getElementById('sku-modal-title');
    this.skuModalClose = document.getElementById('sku-modal-close');
    this.skuModalCancel = document.getElementById('sku-modal-cancel');
    this.skuForm = document.getElementById('sku-form');
    this.formSkuId = document.getElementById('form-sku-id');
    this.formSkuCode = document.getElementById('form-sku-code');
    this.formSkuChannel = document.getElementById('form-sku-channel');
    this.formSkuName = document.getElementById('form-sku-name');
    this.formSkuCategory = document.getElementById('form-sku-category');
    this.formSkuVolume = document.getElementById('form-sku-volume');
    this.formSkuCost = document.getElementById('form-sku-cost');
    this.formSkuPrice = document.getElementById('form-sku-price');

    // Bulk Modal
    this.bulkModal = document.getElementById('bulk-modal');
    this.bulkModalClose = document.getElementById('bulk-modal-close');
    this.bulkModalCancel = document.getElementById('bulk-modal-cancel');
    this.bulkDataInput = document.getElementById('bulk-data-input');
    this.bulkFileInput = document.getElementById('bulk-file-input');
    this.btnApplyBulk = document.getElementById('btn-apply-bulk');
  }

  bindEvents() {
    this.btnLoadPreset.addEventListener('click', () => {
      this.loadPreset(this.presetSelect.value);
    });

    this.presetSelect.addEventListener('change', () => {
      this.loadPreset(this.presetSelect.value);
    });

    this.btnAddSku.addEventListener('click', () => {
      this.openSkuModal();
    });

    this.btnOpenBulk.addEventListener('click', () => {
      this.openBulkModal();
    });

    this.skuModalClose.addEventListener('click', () => this.closeSkuModal());
    this.skuModalCancel.addEventListener('click', () => this.closeSkuModal());
    this.skuModal.addEventListener('click', (e) => {
      if (e.target === this.skuModal) this.closeSkuModal();
    });

    this.bulkModalClose.addEventListener('click', () => this.closeBulkModal());
    this.bulkModalCancel.addEventListener('click', () => this.closeBulkModal());
    this.bulkModal.addEventListener('click', (e) => {
      if (e.target === this.bulkModal) this.closeBulkModal();
    });

    this.skuForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveSku();
    });

    this.btnApplyBulk.addEventListener('click', () => {
      this.applyBulkData();
    });

    this.bulkFileInput.addEventListener('change', (e) => {
      this.handleBulkFile(e);
    });

    this.btnExportCsv.addEventListener('click', () => {
      this.exportCsv();
    });

    this.btnExportJson.addEventListener('click', () => {
      this.exportJson();
    });

    this.btnPrintAnalysis.addEventListener('click', () => {
      window.print();
    });

    this.skuSearch.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase();
      this.renderTableOnly();
    });
  }

  loadPreset(key) {
    const preset = PRODUCT_PRESETS[key] || PRODUCT_PRESETS.electronics;
    this.currentPreset = key;
    this.products = JSON.parse(JSON.stringify(preset));
    this.calculateAndRender();
  }

  // --- CORE FINANCIAL & PARETO CALCULATIONS ---
  calculateMetrics() {
    // 1. Calculate per-item economics
    const enriched = this.products.map(p => {
      const cost = Number(p.cost) || 0;
      const price = Number(p.price) || 0;
      const volume = Number(p.volume) || 0;

      const grossSales = price * volume;
      const totalCost = cost * volume;
      const netMargin = grossSales - totalCost;
      const marginPct = grossSales > 0 ? (netMargin / grossSales) * 100 : 0;
      const markupPct = cost > 0 ? ((price - cost) / cost) * 100 : 0;
      const velocity = volume / 30; // units/day in standard monthly cycle

      return {
        ...p,
        cost,
        price,
        volume,
        grossSales,
        totalCost,
        netMargin,
        marginPct,
        markupPct,
        velocity
      };
    });

    // 2. Sort descending by revenue for Pareto
    enriched.sort((a, b) => b.grossSales - a.grossSales);

    // 3. Aggregate totals
    const totalRevenue = enriched.reduce((sum, p) => sum + p.grossSales, 0);
    const totalProfit = enriched.reduce((sum, p) => sum + p.netMargin, 0);
    const totalUnits = enriched.reduce((sum, p) => sum + p.volume, 0);
    const blendedMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // 4. Compute Cumulative % and Pareto Tier (A, B, C)
    let cumulativeSum = 0;
    const classified = enriched.map(p => {
      const priorShare = totalRevenue > 0 ? (cumulativeSum / totalRevenue) * 100 : 0;
      cumulativeSum += p.grossSales;
      const currentShare = totalRevenue > 0 ? (cumulativeSum / totalRevenue) * 100 : 0;

      let paretoTier = 'A';
      if (priorShare < 80) {
        paretoTier = 'A';
      } else if (priorShare < 95) {
        paretoTier = 'B';
      } else {
        paretoTier = 'C';
      }

      // Slow moving detection: velocity < 1.0 unit/day or low volume with low margin
      const isSlowMoving = p.velocity < 1.0 || (p.volume < 100 && p.marginPct < 35);

      return {
        ...p,
        cumulativeRevenue: cumulativeSum,
        cumulativeSharePct: currentShare,
        revenueSharePct: totalRevenue > 0 ? (p.grossSales / totalRevenue) * 100 : 0,
        paretoTier,
        isSlowMoving
      };
    });

    return {
      items: classified,
      totalRevenue,
      totalProfit,
      totalUnits,
      blendedMargin
    };
  }

  calculateAndRender() {
    this.analytics = this.calculateMetrics();
    this.renderKpiCards();
    this.renderParetoChart();
    this.renderChannelDonut();
    this.renderSlowMovingAlerts();
    this.renderTableOnly();
  }

  formatCurrency(num) {
    if (isNaN(num)) return '$0';
    if (Math.abs(num) >= 1_000_000) {
      return '$' + (num / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + 'M';
    }
    if (Math.abs(num) >= 1_000) {
      return '$' + (num / 1_000).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + 'k';
    }
    return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  // --- RENDER KPI CARDS ---
  renderKpiCards() {
    const { items, totalRevenue, totalProfit, totalUnits, blendedMargin } = this.analytics;
    const topPerformer = items[0] || { name: 'N/A', sku: 'N/A', grossSales: 0, revenueSharePct: 0 };
    const slowCount = items.filter(p => p.isSlowMoving).length;
    const tierACount = items.filter(p => p.paretoTier === 'A').length;

    this.kpiCardsContainer.innerHTML = `
      <div class="kpi-card gold">
        <div class="kpi-header">
          <span>Gross Portfolio Revenue</span>
          <span style="color: var(--gold-secondary);">&bull; Revenue</span>
        </div>
        <div class="kpi-val">${this.formatCurrency(totalRevenue)}</div>
        <div class="kpi-sub">
          <span>Total catalog transactions</span>
          <strong style="color: var(--gold-primary);">100%</strong>
        </div>
      </div>

      <div class="kpi-card emerald">
        <div class="kpi-header">
          <span>Total Net Profit Margin</span>
          <span style="color: var(--emerald-accent);">&bull; Net</span>
        </div>
        <div class="kpi-val">${this.formatCurrency(totalProfit)}</div>
        <div class="kpi-sub">
          <span>Blended gross margin rate</span>
          <strong style="color: var(--emerald-accent);">${blendedMargin.toFixed(1)}%</strong>
        </div>
      </div>

      <div class="kpi-card sapphire">
        <div class="kpi-header">
          <span>Top Performer (#1)</span>
          <span style="color: var(--sapphire-accent);">${topPerformer.sku}</span>
        </div>
        <div class="kpi-val">${this.formatCurrency(topPerformer.grossSales)}</div>
        <div class="kpi-sub">
          <span style="max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${topPerformer.name}</span>
          <strong style="color: var(--sapphire-accent);">${topPerformer.revenueSharePct.toFixed(1)}% Share</strong>
        </div>
      </div>

      <div class="kpi-card purple">
        <div class="kpi-header">
          <span>Pareto Concentration</span>
          <span style="color: var(--purple-accent);">Tier A</span>
        </div>
        <div class="kpi-val">${tierACount} <span style="font-size: 1.1rem; color: var(--text-secondary); font-family: var(--font-sans);">SKUs</span></div>
        <div class="kpi-sub">
          <span>Produce ~80% of total revenue</span>
          <strong style="color: var(--purple-accent);">${((tierACount / items.length) * 100).toFixed(0)}% of SKUs</strong>
        </div>
      </div>

      <div class="kpi-card rose">
        <div class="kpi-header">
          <span>Inventory Alerts</span>
          <span style="color: var(--rose-accent);">Risk</span>
        </div>
        <div class="kpi-val">${slowCount} <span style="font-size: 1.1rem; color: var(--text-secondary); font-family: var(--font-sans);">Items</span></div>
        <div class="kpi-sub">
          <span>Slow-moving or low-margin</span>
          <strong style="color: var(--rose-accent);">&lt; 1.0 unit/day</strong>
        </div>
      </div>
    `;

    this.paretoSummaryBadge.textContent = `${tierACount} SKUs generate 80% revenue`;
    this.slowMovingCountBadge.textContent = `${slowCount} Items Flagged`;
  }

  // --- SVG PARETO (80/20) CHART ---
  renderParetoChart() {
    const items = this.analytics.items;
    if (!items.length) {
      this.paretoChartContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-secondary);">No product data</div>';
      return;
    }

    const width = 640;
    const height = 290;
    const padding = { top: 25, right: 50, bottom: 50, left: 65 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxRevenue = items[0].grossSales * 1.1;
    const step = chartW / items.length;
    const barW = Math.max(12, Math.min(38, step * 0.55));

    let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="barGradA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#d4af37" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#8a6e1d" stop-opacity="0.4" />
        </linearGradient>
        <linearGradient id="barGradB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#1e40af" stop-opacity="0.4" />
        </linearGradient>
        <linearGradient id="barGradC" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#881337" stop-opacity="0.4" />
        </linearGradient>
      </defs>`;

    // Left Y-Axis (Revenue) & Horizontal lines
    [0, 0.5, 1].forEach(ratio => {
      const y = padding.top + chartH * (1 - ratio);
      const val = maxRevenue * ratio;
      svg += `
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3,3" />
        <text x="${padding.left - 8}" y="${y + 4}" fill="var(--text-secondary)" font-size="10" text-anchor="end" font-family="monospace">${this.formatCurrency(val)}</text>
      `;
    });

    // Right Y-Axis (Cumulative %)
    [0, 50, 80, 100].forEach(pct => {
      const y = padding.top + chartH * (1 - (pct / 100));
      svg += `
        <text x="${width - padding.right + 8}" y="${y + 4}" fill="${pct === 80 ? 'var(--gold-secondary)' : 'var(--text-secondary)'}" font-size="10" text-anchor="start" font-family="monospace">${pct}%</text>
      `;
    });

    // 80% Threshold Reference Line
    const y80 = padding.top + chartH * (1 - 0.80);
    svg += `
      <line x1="${padding.left}" y1="${y80}" x2="${width - padding.right}" y2="${y80}" stroke="#d4af37" stroke-dasharray="4,4" stroke-width="1.5" />
      <text x="${padding.left + 8}" y="${y80 - 6}" fill="var(--gold-secondary)" font-size="10" font-weight="700">80% Pareto Cutoff</text>
    `;

    // Render Bars
    const linePoints = [];

    items.forEach((p, idx) => {
      const x = padding.left + idx * step + (step - barW) / 2;
      const barH = (p.grossSales / maxRevenue) * chartH;
      const y = padding.top + chartH - barH;

      let grad = 'url(#barGradA)';
      if (p.paretoTier === 'B') grad = 'url(#barGradB)';
      if (p.paretoTier === 'C') grad = 'url(#barGradC)';

      svg += `
        <rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="3" fill="${grad}">
          <title>${p.sku}: ${this.formatCurrency(p.grossSales)} (${p.paretoTier})</title>
        </rect>
        <text x="${x + barW / 2}" y="${height - padding.bottom + 18}" fill="var(--text-secondary)" font-size="9" text-anchor="middle">${p.sku.split('-')[0]}</text>
      `;

      // Point on cumulative line
      const cumY = padding.top + chartH * (1 - (p.cumulativeSharePct / 100));
      linePoints.push({ x: x + barW / 2, y: cumY, pct: p.cumulativeSharePct });
    });

    // Cumulative Line Path
    if (linePoints.length > 0) {
      const pathD = linePoints.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');
      svg += `<path d="${pathD}" fill="none" stroke="#f3e5ab" stroke-width="2.5" stroke-linecap="round" />`;

      linePoints.forEach(pt => {
        svg += `
          <circle cx="${pt.x}" cy="${pt.y}" r="4" fill="#d4af37" stroke="var(--bg-secondary)" stroke-width="2">
            <title>Cumulative: ${pt.pct.toFixed(1)}%</title>
          </circle>
        `;
      });
    }

    svg += '</svg>';
    this.paretoChartContainer.innerHTML = svg;
  }

  // --- CHANNEL DISTRIBUTION DONUT ---
  renderChannelDonut() {
    const items = this.analytics.items;
    const channelMap = new Map();

    items.forEach(p => {
      const ch = p.channel || 'Direct';
      channelMap.set(ch, (channelMap.get(ch) || 0) + p.grossSales);
    });

    const channelData = Array.from(channelMap.entries()).map(([channel, sales]) => ({
      channel,
      sales,
      share: this.analytics.totalRevenue > 0 ? (sales / this.analytics.totalRevenue) * 100 : 0
    })).sort((a, b) => b.sales - a.sales);

    this.channelCountBadge.textContent = `${channelData.length} Channels`;

    const width = 240;
    const height = 230;
    const cx = width / 2;
    const cy = height / 2;
    const rOuter = 82;
    const rInner = 50;

    let cumulative = -Math.PI / 2;
    let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

    const legendHtml = [];

    channelData.forEach(item => {
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
      const color = CHANNEL_COLORS[item.channel] || '#38bdf8';

      svg += `
        <path d="${d}" fill="${color}" stroke="var(--bg-secondary)" stroke-width="2">
          <title>${item.channel}: ${this.formatCurrency(item.sales)} (${item.share.toFixed(1)}%)</title>
        </path>
      `;

      legendHtml.push(`
        <div style="display: flex; align-items: center; gap: 0.4rem;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: ${color};"></span>
          <span>${item.channel} (${item.share.toFixed(0)}%)</span>
        </div>
      `);
    });

    // Center hole text
    svg += `
      <circle cx="${cx}" cy="${cy}" r="${rInner - 2}" fill="var(--bg-secondary)" />
      <text x="${cx}" y="${cy}" fill="var(--gold-secondary)" font-size="11" font-weight="700" text-anchor="middle">CHANNELS</text>
      <text x="${cx}" y="${cy + 14}" fill="var(--text-secondary)" font-size="10" text-anchor="middle">${channelData.length} ACTIVE</text>
    `;

    svg += '</svg>';
    this.channelChartContainer.innerHTML = svg;
    this.channelLegend.innerHTML = legendHtml.join('');
  }

  // --- SLOW-MOVING / ATTENTION ALERTS ---
  renderSlowMovingAlerts() {
    const slowItems = this.analytics.items.filter(p => p.isSlowMoving);

    if (!slowItems.length) {
      this.slowMovingList.innerHTML = `
        <div style="padding: 1.5rem; text-align: center; color: var(--emerald-accent); background: var(--bg-tertiary); border-radius: var(--radius-md);">
          &check; All product SKUs are actively meeting minimum sales velocity standards (&ge; 1.0 unit/day).
        </div>
      `;
      return;
    }

    this.slowMovingList.innerHTML = slowItems.map(p => {
      let actionRec = 'Clearance Promo (20% Off)';
      if (p.marginPct > 65) actionRec = 'Bundle with Star Performer';
      else if (p.velocity < 0.5 && p.marginPct < 30) actionRec = 'Discontinue & Liquidate Stock';
      else if (p.volume < 50) actionRec = 'Re-target Channel Audience';

      return `
        <div class="alert-table-row">
          <div>
            <strong style="color: var(--text-primary); font-size: 0.9rem;">${p.name}</strong>
            <div style="font-size: 0.75rem; color: var(--text-secondary); font-family: monospace;">${p.sku} &bull; ${p.channel}</div>
          </div>
          <div>
            <span style="font-size: 0.75rem; color: var(--text-secondary);">Velocity:</span><br>
            <strong style="color: var(--rose-accent);">${p.velocity.toFixed(2)} units/day</strong>
          </div>
          <div>
            <span style="font-size: 0.75rem; color: var(--text-secondary);">Gross Margin:</span><br>
            <strong style="color: ${p.marginPct > 40 ? 'var(--emerald-accent)' : 'var(--amber-accent)'};">${p.marginPct.toFixed(1)}% (${this.formatCurrency(p.netMargin)})</strong>
          </div>
          <div>
            <span class="pareto-badge ${p.paretoTier === 'A' ? 'tier-a' : (p.paretoTier === 'B' ? 'tier-b' : 'tier-c')}">
              ${p.paretoTier}-Class (${p.revenueSharePct.toFixed(1)}% Rev)
            </span>
          </div>
          <div>
            <span style="font-size: 0.72rem; color: var(--gold-secondary); font-weight: 700; text-transform: uppercase;">Prescription:</span><br>
            <span style="font-size: 0.8rem; color: var(--text-primary); font-weight: 600;">${actionRec}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- CATALOG TABLE ---
  renderTableOnly() {
    let rows = [...this.analytics.items];

    if (this.searchQuery) {
      rows = rows.filter(p => {
        return p.sku.toLowerCase().includes(this.searchQuery) ||
               p.name.toLowerCase().includes(this.searchQuery) ||
               p.category.toLowerCase().includes(this.searchQuery) ||
               p.channel.toLowerCase().includes(this.searchQuery);
      });
    }

    this.catalogRowCount.textContent = `${rows.length} of ${this.products.length} SKUs`;

    this.catalogTbody.innerHTML = rows.map(p => `
      <tr>
        <td style="font-family: monospace; font-weight: 700; color: var(--gold-secondary);">${p.sku}</td>
        <td>
          <div style="font-weight: 600;">${p.name}</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary);">${p.category}</div>
        </td>
        <td><span style="font-size: 0.8rem; color: var(--text-secondary);">${p.channel}</span></td>
        <td style="font-family: monospace;">$${p.cost.toFixed(2)}</td>
        <td style="font-family: monospace; font-weight: 600;">$${p.price.toFixed(2)}</td>
        <td style="font-family: monospace;">${p.volume.toLocaleString()}</td>
        <td style="font-family: monospace; font-weight: 700; color: var(--text-primary);">${this.formatCurrency(p.grossSales)}</td>
        <td style="font-family: monospace; color: var(--emerald-accent);">${this.formatCurrency(p.netMargin)}</td>
        <td style="font-family: monospace; font-weight: 600; color: ${p.marginPct > 50 ? 'var(--emerald-accent)' : 'var(--amber-accent)'};">${p.marginPct.toFixed(1)}%</td>
        <td style="font-family: monospace;">${p.velocity.toFixed(1)}/d</td>
        <td>
          <span class="pareto-badge ${p.paretoTier === 'A' ? 'tier-a' : (p.paretoTier === 'B' ? 'tier-b' : 'tier-c')}">
            Class ${p.paretoTier}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 0.25rem;">
            <button class="tile-btn-icon btn-edit-sku" data-sku="${p.sku}" title="Edit SKU">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </button>
            <button class="tile-btn-icon delete btn-delete-sku" data-sku="${p.sku}" title="Delete SKU">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    this.bindTableButtons();
  }

  bindTableButtons() {
    this.catalogTbody.querySelectorAll('.btn-edit-sku').forEach(btn => {
      btn.addEventListener('click', () => {
        const sku = btn.getAttribute('data-sku');
        this.openSkuModal(sku);
      });
    });

    this.catalogTbody.querySelectorAll('.btn-delete-sku').forEach(btn => {
      btn.addEventListener('click', () => {
        const sku = btn.getAttribute('data-sku');
        this.deleteSku(sku);
      });
    });
  }

  // --- SKU MODAL ---
  openSkuModal(skuToEdit = null) {
    if (skuToEdit) {
      const p = this.products.find(item => item.sku === skuToEdit);
      if (!p) return;
      this.skuModalTitle.textContent = `Edit Product SKU: ${p.sku}`;
      this.formSkuId.value = p.sku;
      this.formSkuCode.value = p.sku;
      this.formSkuCode.readOnly = true;
      this.formSkuChannel.value = p.channel;
      this.formSkuName.value = p.name;
      this.formSkuCategory.value = p.category;
      this.formSkuVolume.value = p.volume;
      this.formSkuCost.value = p.cost;
      this.formSkuPrice.value = p.price;
    } else {
      this.skuModalTitle.textContent = 'Add Product SKU';
      this.formSkuId.value = '';
      this.formSkuCode.value = 'SKU-' + Math.floor(1000 + Math.random() * 9000);
      this.formSkuCode.readOnly = false;
      this.formSkuChannel.value = 'Shopify Direct';
      this.formSkuName.value = '';
      this.formSkuCategory.value = 'Consumer Tech';
      this.formSkuVolume.value = 100;
      this.formSkuCost.value = 25.00;
      this.formSkuPrice.value = 75.00;
    }

    this.skuModal.classList.add('open');
  }

  closeSkuModal() {
    this.skuModal.classList.remove('open');
  }

  saveSku() {
    const editingSku = this.formSkuId.value;
    const sku = this.formSkuCode.value.trim();
    const name = this.formSkuName.value.trim();
    const category = this.formSkuCategory.value.trim();
    const channel = this.formSkuChannel.value;
    const volume = parseInt(this.formSkuVolume.value, 10) || 0;
    const cost = parseFloat(this.formSkuCost.value) || 0;
    const price = parseFloat(this.formSkuPrice.value) || 0;

    if (editingSku) {
      const p = this.products.find(item => item.sku === editingSku);
      if (p) {
        p.name = name;
        p.category = category;
        p.channel = channel;
        p.volume = volume;
        p.cost = cost;
        p.price = price;
      }
    } else {
      this.products.push({
        sku,
        name,
        category,
        channel,
        volume,
        cost,
        price
      });
    }

    this.closeSkuModal();
    this.calculateAndRender();
  }

  deleteSku(sku) {
    if (!confirm(`Are you sure you want to remove SKU "${sku}" from the portfolio?`)) return;
    this.products = this.products.filter(p => p.sku !== sku);
    this.calculateAndRender();
  }

  // --- BULK MODAL ---
  openBulkModal() {
    const csvLines = ['SKU,Name,Category,Channel,Cost,Price,Volume'];
    this.products.forEach(p => {
      csvLines.push(`${p.sku},"${p.name}",${p.category},${p.channel},${p.cost},${p.price},${p.volume}`);
    });
    this.bulkDataInput.value = csvLines.join('\n');
    this.bulkModal.classList.add('open');
  }

  closeBulkModal() {
    this.bulkModal.classList.remove('open');
  }

  handleBulkFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      this.bulkDataInput.value = evt.target.result;
    };
    reader.readAsText(file);
  }

  applyBulkData() {
    const text = this.bulkDataInput.value.trim();
    if (!text) return;

    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) {
      alert('Please provide headers and at least one data row.');
      return;
    }

    const parseLine = (line) => {
      const res = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') inQuotes = !inQuotes;
        else if ((c === ',' || c === '\t') && !inQuotes) {
          res.push(cur.trim().replace(/^"|"$/g, ''));
          cur = '';
        } else cur += c;
      }
      res.push(cur.trim().replace(/^"|"$/g, ''));
      return res;
    };

    const newProducts = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = parseLine(lines[i]);
      if (parts.length >= 7) {
        newProducts.push({
          sku: parts[0] || `SKU-${i}`,
          name: parts[1] || 'Product ' + i,
          category: parts[2] || 'General',
          channel: parts[3] || 'Shopify Direct',
          cost: parseFloat(parts[4].replace(/[$,]/g, '')) || 0,
          price: parseFloat(parts[5].replace(/[$,]/g, '')) || 0,
          volume: parseInt(parts[6].replace(/[,]/g, ''), 10) || 0
        });
      }
    }

    if (newProducts.length > 0) {
      this.products = newProducts;
      this.closeBulkModal();
      this.calculateAndRender();
      alert(`Imported ${newProducts.length} product SKUs successfully.`);
    } else {
      alert('Could not parse rows. Check format: SKU,Name,Category,Channel,Cost,Price,Volume');
    }
  }

  // --- EXPORTS ---
  exportCsv() {
    const headers = ['SKU', 'Product Name', 'Category', 'Channel', 'Unit Cost', 'Selling Price', 'Volume', 'Gross Sales', 'Net Margin', 'Margin Pct', 'Velocity Units/Day', 'Pareto Tier'];
    const lines = this.analytics.items.map(p => {
      return [
        p.sku,
        `"${p.name}"`,
        p.category,
        p.channel,
        p.cost,
        p.price,
        p.volume,
        p.grossSales,
        p.netMargin,
        p.marginPct.toFixed(2),
        p.velocity.toFixed(2),
        p.paretoTier
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers.join(','), ...lines].join('\n'));
    const link = document.createElement('a');
    link.href = csvContent;
    link.download = `product_sell_analysis_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportJson() {
    const jsonStr = JSON.stringify({
      analyzedAt: new Date().toISOString(),
      summary: {
        totalRevenue: this.analytics.totalRevenue,
        totalProfit: this.analytics.totalProfit,
        totalUnits: this.analytics.totalUnits,
        blendedMargin: this.analytics.blendedMargin
      },
      products: this.analytics.items
    }, null, 2);

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `product_sell_analysis_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Instantiate on DOM load
document.addEventListener('DOMContentLoaded', () => {
  new ProductSellAnalyzer();
});