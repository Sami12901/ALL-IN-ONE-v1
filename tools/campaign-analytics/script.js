// Multi-Channel Campaign & ROAS Analytics Logic
// Client-side attribution modeling, performance metrics, SVG comparative charts, and CSV export.

(function () {
  'use strict';

  // Presets
  const PRESETS = {
    omni: [
      { name: 'Google Search Ads', spend: 12500, impressions: 220000, clicks: 8800, conv: 520, rev: 54600 },
      { name: 'Meta Ads (FB/IG)', spend: 15000, impressions: 580000, clicks: 14500, conv: 460, rev: 41400 },
      { name: 'LinkedIn Sponsored', spend: 8500, impressions: 95000, clicks: 2100, conv: 145, rev: 33350 },
      { name: 'Email Marketing', spend: 1200, impressions: 110000, clicks: 12000, conv: 680, rev: 44200 },
      { name: 'Organic SEO & Content', spend: 4000, impressions: 340000, clicks: 19500, conv: 610, rev: 48800 },
      { name: 'Influencer Partners', spend: 6500, impressions: 280000, clicks: 7500, conv: 210, rev: 18900 }
    ],
    saas: [
      { name: 'LinkedIn B2B Sponsored', spend: 14000, impressions: 160000, clicks: 3500, conv: 240, rev: 67200 },
      { name: 'Google High-Intent Search', spend: 11000, impressions: 140000, clicks: 5800, conv: 390, rev: 58500 },
      { name: 'Nurture Email Sequences', spend: 900, impressions: 60000, clicks: 7200, conv: 310, rev: 37200 },
      { name: 'SEO Technical Resource Hub', spend: 3500, impressions: 210000, clicks: 11200, conv: 290, rev: 34800 }
    ],
    d2c: [
      { name: 'Meta Stories & Reels', spend: 18000, impressions: 720000, clicks: 22000, conv: 920, rev: 73600 },
      { name: 'TikTok & Creator UGC', spend: 9500, impressions: 650000, clicks: 16500, conv: 540, rev: 43200 },
      { name: 'Google Shopping Feed', spend: 8000, impressions: 190000, clicks: 9200, conv: 490, rev: 39200 },
      { name: 'VIP Retention Email/SMS', spend: 1100, impressions: 85000, clicks: 9800, conv: 610, rev: 36600 }
    ]
  };

  // State
  let channels = JSON.parse(JSON.stringify(PRESETS.omni));
  let currentPreset = 'omni';
  let activeMetricView = 'roas'; // 'roas', 'spend-rev', 'cpa'

  // Formatters
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });

  const decimalCurrencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  });

  const compactFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1
  });

  function formatCurrency(val) {
    return currencyFormatter.format(val || 0);
  }

  function formatDecimalCurrency(val) {
    return decimalCurrencyFormatter.format(val || 0);
  }

  function formatCompact(val) {
    return compactFormatter.format(val || 0);
  }

  function updateDashboard() {
    if (!channels || channels.length === 0) {
      renderEmptyState();
      return;
    }

    let totalSpend = 0;
    let totalRevenue = 0;
    let totalClicks = 0;
    let totalConv = 0;
    let totalImpressions = 0;

    const evaluated = channels.map(ch => {
      const spend = Math.max(0, Number(ch.spend) || 0);
      const rev = Math.max(0, Number(ch.rev) || 0);
      const clicks = Math.max(0, Number(ch.clicks) || 0);
      const conv = Math.max(0, Number(ch.conv) || 0);
      const impr = Math.max(0, Number(ch.impressions) || 0);

      totalSpend += spend;
      totalRevenue += rev;
      totalClicks += clicks;
      totalConv += conv;
      totalImpressions += impr;

      const roas = spend > 0 ? (rev / spend) : 0;
      const cpa = conv > 0 ? (spend / conv) : 0;
      const cvr = clicks > 0 ? (conv / clicks) * 100 : 0;
      const ctr = impr > 0 ? (clicks / impr) * 100 : 0;
      const cpc = clicks > 0 ? (spend / clicks) : 0;

      return {
        ...ch,
        spend,
        rev,
        clicks,
        conv,
        impressions: impr,
        roas,
        cpa,
        cvr,
        ctr,
        cpc
      };
    });

    // Blended Portfolio Totals
    const blendedRoas = totalSpend > 0 ? (totalRevenue / totalSpend) : 0;
    const blendedCpa = totalConv > 0 ? (totalSpend / totalConv) : 0;
    const blendedCvr = totalClicks > 0 ? (totalConv / totalClicks) * 100 : 0;
    const blendedCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    // Identify Best Performing Channels
    let bestRoasCh = null;
    let lowestCpaCh = null;

    evaluated.forEach(ch => {
      if (ch.spend > 0) {
        if (!bestRoasCh || ch.roas > bestRoasCh.roas) {
          bestRoasCh = ch;
        }
      }
      if (ch.conv > 0 && ch.spend > 0) {
        if (!lowestCpaCh || ch.cpa < lowestCpaCh.cpa) {
          lowestCpaCh = ch;
        }
      }
    });

    // Update Top Performer Banner
    if (bestRoasCh) {
      document.getElementById('banner-best-channel').textContent = `${bestRoasCh.name}`;
      document.getElementById('banner-best-roas').textContent = `${bestRoasCh.roas.toFixed(2)}x ROAS`;
    }
    if (lowestCpaCh) {
      document.getElementById('banner-lowest-cpa').textContent = `${formatDecimalCurrency(lowestCpaCh.cpa)} (${lowestCpaCh.name})`;
    }

    // Update Hero Stat Cards
    document.getElementById('stat-total-rev').textContent = formatCurrency(totalRevenue);
    document.getElementById('stat-total-spend-sub').textContent = `Total Ad Spend: ${formatCurrency(totalSpend)} (Net Profit: ${formatCurrency(totalRevenue - totalSpend)})`;

    document.getElementById('stat-blended-roas').textContent = `${blendedRoas.toFixed(2)}x`;
    const badgeHealth = document.getElementById('badge-roas-health');
    if (blendedRoas >= 3.5) {
      badgeHealth.className = 'channel-badge best';
      badgeHealth.textContent = 'High Profitability (>3.5x)';
    } else if (blendedRoas >= 2.0) {
      badgeHealth.className = 'channel-badge efficient';
      badgeHealth.textContent = 'Solid Performance (2.0x+)';
    } else {
      badgeHealth.className = 'channel-badge';
      badgeHealth.style.background = 'rgba(239, 68, 68, 0.15)';
      badgeHealth.style.color = '#ef4444';
      badgeHealth.textContent = 'Sub-Optimal Margin (<2.0x)';
    }

    document.getElementById('stat-blended-cpa').textContent = formatDecimalCurrency(blendedCpa);
    document.getElementById('stat-total-conversions-sub').textContent = `${totalConv.toLocaleString()} Total Attributed Conversions`;

    document.getElementById('stat-blended-cvr').textContent = `${blendedCvr.toFixed(1)}%`;
    document.getElementById('stat-blended-ctr-sub').textContent = `Blended CTR: ${blendedCtr.toFixed(2)}% (${totalClicks.toLocaleString()} clicks)`;

    // Render Table
    renderTable(evaluated);

    // Render Chart
    renderChart(evaluated);

    // Render Insights
    renderInsights({
      blendedRoas,
      blendedCpa,
      totalSpend,
      totalRevenue,
      bestRoasCh,
      lowestCpaCh,
      evaluated
    });

    document.getElementById('channel-count-label').textContent = `${evaluated.length} Active Channels`;
  }

  // Render Table
  function renderTable(items) {
    const tbody = document.getElementById('campaign-table-body');
    tbody.innerHTML = '';

    items.forEach((item, index) => {
      const tr = document.createElement('tr');
      const roasColor = item.roas >= 4.0 ? '#10b981' : item.roas >= 2.0 ? '#89aacc' : '#ef4444';

      tr.innerHTML = `
        <td>
          <input type="text" class="table-input-cell" style="text-align: left; font-family: var(--font-sans);" data-idx="${index}" data-field="name" value="${escapeHtml(item.name)}">
        </td>
        <td>
          <input type="number" class="table-input-cell" data-idx="${index}" data-field="spend" value="${item.spend}" min="0" step="50">
        </td>
        <td>
          <input type="number" class="table-input-cell" data-idx="${index}" data-field="clicks" value="${item.clicks}" min="0" step="10">
        </td>
        <td>
          <input type="number" class="table-input-cell" data-idx="${index}" data-field="conv" value="${item.conv}" min="0" step="1">
        </td>
        <td>
          <input type="number" class="table-input-cell" data-idx="${index}" data-field="rev" value="${item.rev}" min="0" step="50">
        </td>
        <td style="font-family: monospace; font-weight: 700; color: ${roasColor};">
          ${item.roas.toFixed(2)}x
        </td>
        <td style="font-family: monospace; font-size: 0.8rem; color: var(--text-primary);">
          ${formatDecimalCurrency(item.cpa)}
        </td>
        <td style="text-align: center;">
          <button type="button" class="action-btn-icon" data-del="${index}" title="Remove Channel" aria-label="Remove Channel">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.table-input-cell').forEach(inp => {
      inp.addEventListener('change', onCellEdit);
    });

    tbody.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', () => {
        const delIdx = parseInt(btn.getAttribute('data-del'), 10);
        if (channels.length <= 1) {
          alert('At least one channel is required for analysis.');
          return;
        }
        channels.splice(delIdx, 1);
        updateDashboard();
      });
    });
  }

  function onCellEdit(e) {
    const idx = parseInt(e.target.getAttribute('data-idx'), 10);
    const field = e.target.getAttribute('data-field');
    const val = field === 'name' ? e.target.value.trim() : (parseFloat(e.target.value) || 0);

    if (channels[idx]) {
      channels[idx][field] = val;
      updateDashboard();
    }
  }

  // Interactive SVG Comparative Chart
  function renderChart(items) {
    const container = document.getElementById('svg-campaign-chart-wrapper');
    if (!container || items.length === 0) return;

    const width = 640;
    const height = 260;
    const padding = { top: 25, right: 30, bottom: 45, left: 60 };

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const n = items.length;
    const colWidth = chartW / n;

    let svg = `<svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; overflow: visible; font-family: var(--font-sans);" role="img" aria-label="Comparative Channel Chart">`;

    if (activeMetricView === 'roas') {
      document.getElementById('chart-metric-title').textContent = 'Return on Ad Spend (ROAS by Channel)';
      document.getElementById('chart-benchmark-sub').textContent = 'Target Benchmark: 3.0x';

      const maxRoas = Math.max(...items.map(d => d.roas), 4.5);
      const yMax = Math.ceil(maxRoas * 1.15);

      // Y-axis grid
      for (let t = 0; t <= 4; t++) {
        const val = (yMax / 4) * t;
        const yPos = padding.top + chartH - (val / yMax) * chartH;
        svg += `
          <line x1="${padding.left}" y1="${yPos}" x2="${width - padding.right}" y2="${yPos}" stroke="var(--border)" stroke-width="1" stroke-dasharray="${t === 0 ? '0' : '4,4'}" opacity="0.6" />
          <text x="${padding.left - 8}" y="${yPos + 4}" font-size="10" fill="var(--text-tertiary)" text-anchor="end">${val.toFixed(1)}x</text>
        `;
      }

      // Benchmark dashed line at 3.0x
      if (3.0 <= yMax) {
        const benchY = padding.top + chartH - (3.0 / yMax) * chartH;
        svg += `
          <line x1="${padding.left}" y1="${benchY}" x2="${width - padding.right}" y2="${benchY}" stroke="#10b981" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.7" />
          <text x="${width - padding.right}" y="${benchY - 4}" font-size="9" fill="#10b981" text-anchor="end">3.0x Benchmark</text>
        `;
      }

      const barWidth = Math.max(12, Math.min(colWidth * 0.55, 36));

      items.forEach((d, i) => {
        const cx = padding.left + i * colWidth + colWidth / 2;
        const bx = cx - barWidth / 2;
        const barH = Math.max(2, (d.roas / yMax) * chartH);
        const by = padding.top + chartH - barH;
        const color = d.roas >= 4.0 ? '#10b981' : d.roas >= 2.5 ? '#4e85bf' : '#ef4444';

        svg += `
          <g style="cursor: pointer;">
            <rect x="${bx}" y="${by}" width="${barWidth}" height="${barH}" fill="${color}" rx="3">
              <title>${d.name}: ${d.roas.toFixed(2)}x ROAS ($${d.rev.toLocaleString()} Rev / $${d.spend.toLocaleString()} Spend)</title>
            </rect>
            <text x="${cx}" y="${by - 6}" font-size="10" font-weight="700" fill="var(--text-primary)" text-anchor="middle" font-family="monospace">${d.roas.toFixed(2)}x</text>
            <text x="${cx}" y="${height - 14}" font-size="10" fill="var(--text-secondary)" text-anchor="middle" font-weight="500">${escapeHtml(d.name.length > 12 ? d.name.slice(0, 10) + '..' : d.name)}</text>
          </g>
        `;
      });

    } else if (activeMetricView === 'spend-rev') {
      document.getElementById('chart-metric-title').textContent = 'Ad Spend vs. Attributed Revenue ($)';
      document.getElementById('chart-benchmark-sub').textContent = 'Red: Spend | Green: Revenue';

      const maxVal = Math.max(...items.map(d => Math.max(d.spend, d.rev)), 1000);
      const yMax = Math.ceil((maxVal * 1.15) / 5000) * 5000;

      for (let t = 0; t <= 4; t++) {
        const val = (yMax / 4) * t;
        const yPos = padding.top + chartH - (val / yMax) * chartH;
        svg += `
          <line x1="${padding.left}" y1="${yPos}" x2="${width - padding.right}" y2="${yPos}" stroke="var(--border)" stroke-width="1" stroke-dasharray="${t === 0 ? '0' : '4,4'}" opacity="0.6" />
          <text x="${padding.left - 8}" y="${yPos + 4}" font-size="10" fill="var(--text-tertiary)" text-anchor="end">${compactFormatter.format(val)}</text>
        `;
      }

      const barWidth = Math.max(8, Math.min(colWidth * 0.32, 22));

      items.forEach((d, i) => {
        const cx = padding.left + i * colWidth + colWidth / 2;
        const spendX = cx - barWidth - 1;
        const revX = cx + 1;

        const spendH = Math.max(2, (d.spend / yMax) * chartH);
        const spendY = padding.top + chartH - spendH;

        const revH = Math.max(2, (d.rev / yMax) * chartH);
        const revY = padding.top + chartH - revH;

        svg += `
          <g style="cursor: pointer;">
            <!-- Spend bar -->
            <rect x="${spendX}" y="${spendY}" width="${barWidth}" height="${spendH}" fill="#ef4444" rx="2" opacity="0.85">
              <title>${d.name} Spend: ${formatCurrency(d.spend)}</title>
            </rect>
            <!-- Revenue bar -->
            <rect x="${revX}" y="${revY}" width="${barWidth}" height="${revH}" fill="#10b981" rx="2">
              <title>${d.name} Revenue: ${formatCurrency(d.rev)}</title>
            </rect>
            <text x="${cx}" y="${height - 14}" font-size="10" fill="var(--text-secondary)" text-anchor="middle" font-weight="500">${escapeHtml(d.name.length > 12 ? d.name.slice(0, 10) + '..' : d.name)}</text>
          </g>
        `;
      });

    } else if (activeMetricView === 'cpa') {
      document.getElementById('chart-metric-title').textContent = 'Cost per Acquisition (CPA by Channel)';
      document.getElementById('chart-benchmark-sub').textContent = 'Lower is more efficient ($/conv)';

      const maxCpa = Math.max(...items.map(d => d.cpa), 10);
      const yMax = Math.ceil(maxCpa * 1.2);

      for (let t = 0; t <= 4; t++) {
        const val = (yMax / 4) * t;
        const yPos = padding.top + chartH - (val / yMax) * chartH;
        svg += `
          <line x1="${padding.left}" y1="${yPos}" x2="${width - padding.right}" y2="${yPos}" stroke="var(--border)" stroke-width="1" stroke-dasharray="${t === 0 ? '0' : '4,4'}" opacity="0.6" />
          <text x="${padding.left - 8}" y="${yPos + 4}" font-size="10" fill="var(--text-tertiary)" text-anchor="end">${formatDecimalCurrency(val)}</text>
        `;
      }

      const barWidth = Math.max(12, Math.min(colWidth * 0.55, 36));

      items.forEach((d, i) => {
        const cx = padding.left + i * colWidth + colWidth / 2;
        const bx = cx - barWidth / 2;
        const barH = Math.max(2, (d.cpa / yMax) * chartH);
        const by = padding.top + chartH - barH;

        svg += `
          <g style="cursor: pointer;">
            <rect x="${bx}" y="${by}" width="${barWidth}" height="${barH}" fill="#89aacc" rx="3">
              <title>${d.name} CPA: ${formatDecimalCurrency(d.cpa)}</title>
            </rect>
            <text x="${cx}" y="${by - 6}" font-size="10" font-weight="700" fill="var(--text-primary)" text-anchor="middle" font-family="monospace">${formatDecimalCurrency(d.cpa)}</text>
            <text x="${cx}" y="${height - 14}" font-size="10" fill="var(--text-secondary)" text-anchor="middle" font-weight="500">${escapeHtml(d.name.length > 12 ? d.name.slice(0, 10) + '..' : d.name)}</text>
          </g>
        `;
      });
    }

    svg += `</svg>`;
    container.innerHTML = svg;
  }

  // Render Attribution Insights
  function renderInsights(stats) {
    const list = document.getElementById('campaign-insights-list');
    list.innerHTML = '';

    const tips = [];

    if (stats.bestRoasCh) {
      tips.push(`<strong>Top Scaling Priority:</strong> <strong>${escapeHtml(stats.bestRoasCh.name)}</strong> delivers exceptional efficiency at <strong>${stats.bestRoasCh.roas.toFixed(2)}x ROAS</strong> with a CPA of ${formatDecimalCurrency(stats.bestRoasCh.cpa)}. Consider increasing budget allocation by 20-30% until marginal ROAS begins to diminish.`);
    }

    // Identify low ROAS channels
    const underperforming = stats.evaluated.filter(c => c.spend > 0 && c.roas < 1.8);
    if (underperforming.length > 0) {
      const names = underperforming.map(c => `<strong>${escapeHtml(c.name)}</strong> (${c.roas.toFixed(2)}x)`).join(', ');
      tips.push(`<strong>Margin Squeeze:</strong> ${names} fall below the 1.8x ROAS break-even safety zone. Refine targeting demographics, pause low-performing creative variants, or test higher-converting landing pages.`);
    }

    // Email / Organic efficiency
    const organicOrEmail = stats.evaluated.filter(c => c.name.toLowerCase().includes('email') || c.name.toLowerCase().includes('seo') || c.name.toLowerCase().includes('organic'));
    if (organicOrEmail.length > 0) {
      tips.push(`<strong>Organic / Retention Power:</strong> Owned channels (Email &amp; SEO) provide asymmetric profit leverage. Maximizing lead capture from paid campaigns into automated email flows improves blended portfolio ROAS.`);
    }

    tips.forEach(html => {
      const li = document.createElement('li');
      li.style.position = 'relative';
      li.style.paddingLeft = '1.2rem';
      li.innerHTML = `<span style="position: absolute; left: 0; color: var(--accent);">•</span>${html}`;
      list.appendChild(li);
    });
  }

  // Export CSV
  function exportCSV() {
    if (!channels || channels.length === 0) return;

    let csv = 'Channel Name,Spend ($),Impressions,Clicks,Conversions,Revenue ($),ROAS,CPA ($),CVR %,CTR %,CPC ($)\r\n';

    channels.forEach(ch => {
      const spend = Number(ch.spend) || 0;
      const rev = Number(ch.rev) || 0;
      const clicks = Number(ch.clicks) || 0;
      const conv = Number(ch.conv) || 0;
      const impr = Number(ch.impressions) || 0;

      const roas = spend > 0 ? (rev / spend).toFixed(2) : '0.00';
      const cpa = conv > 0 ? (spend / conv).toFixed(2) : '0.00';
      const cvr = clicks > 0 ? ((conv / clicks) * 100).toFixed(2) + '%' : '0.0%';
      const ctr = impr > 0 ? ((clicks / impr) * 100).toFixed(2) + '%' : '0.0%';
      const cpc = clicks > 0 ? (spend / clicks).toFixed(2) : '0.00';

      const cleanName = `"${ch.name.replace(/"/g, '""')}"`;
      csv += `${cleanName},${spend},${impr},${clicks},${conv},${rev},${roas},${cpa},${cvr},${ctr},${cpc}\r\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `campaign_attribution_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function renderEmptyState() {
    document.getElementById('campaign-table-body').innerHTML = `
      <tr><td colspan="8" style="text-align:center; padding: 2rem; color: var(--text-tertiary);">No marketing channels recorded.</td></tr>
    `;
    document.getElementById('svg-campaign-chart-wrapper').innerHTML = '';
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Initialization
  document.addEventListener('DOMContentLoaded', () => {
    // Presets
    const presetOmni = document.getElementById('preset-omni');
    const presetSaas = document.getElementById('preset-saas');
    const presetD2c = document.getElementById('preset-d2c');

    function applyPreset(key, btn) {
      document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      channels = JSON.parse(JSON.stringify(PRESETS[key]));
      currentPreset = key;
      updateDashboard();
    }

    if (presetOmni) presetOmni.addEventListener('click', () => applyPreset('omni', presetOmni));
    if (presetSaas) presetSaas.addEventListener('click', () => applyPreset('saas', presetSaas));
    if (presetD2c) presetD2c.addEventListener('click', () => applyPreset('d2c', presetD2c));

    // View metric switcher
    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.view-toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeMetricView = btn.getAttribute('data-metric');
        updateDashboard();
      });
    });

    // Add Channel Form
    const addForm = document.getElementById('add-channel-form');
    if (addForm) {
      addForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('new-channel-name').value.trim();
        const spend = parseFloat(document.getElementById('new-channel-spend').value) || 0;
        const clicks = parseInt(document.getElementById('new-channel-clicks').value, 10) || 0;
        const conv = parseInt(document.getElementById('new-channel-conv').value, 10) || 0;
        const rev = parseFloat(document.getElementById('new-channel-rev').value) || 0;
        const impressions = clicks * 25; // estimated default impressions

        if (!name) return;

        channels.push({ name, spend, impressions, clicks, conv, rev });
        addForm.reset();
        updateDashboard();
      });
    }

    // Export CSV
    const btnExport = document.getElementById('btn-export-csv');
    if (btnExport) btnExport.addEventListener('click', exportCSV);

    // Reset Data
    const btnReset = document.getElementById('btn-reset-data');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        channels = JSON.parse(JSON.stringify(PRESETS[currentPreset] || PRESETS.omni));
        updateDashboard();
      });
    }

    // Initial render
    updateDashboard();
  });
})();