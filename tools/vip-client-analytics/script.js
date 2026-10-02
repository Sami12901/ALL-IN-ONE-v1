// VIP Client Analytics Logic
// Portfolio-level client relationship management (CRM), cohort analytics, and concentration risk modeling

const INITIAL_VIP_ROSTER = [
  {
    id: 'VIP-DXB-9101',
    name: 'Sheikh Tariq Al-Fassi',
    location: 'Dubai, DIFC',
    advisor: 'Tariq Al-Mansoor',
    spend: 410000,
    orders: 16,
    recency: 5,
    category: 'Haute Horology & Exotic Leathers',
    notes: 'VVIP Sovereign Client. Major collector of tourbillons and minute repeaters. Prefers Dom Pérignon P2 and private salon suite viewings in Dubai and London.'
  },
  {
    id: 'VIP-PAR-8820',
    name: 'Contessa Elena Rostova',
    location: 'Paris / Monaco',
    advisor: 'Jean-Luc Moreau',
    spend: 340000,
    orders: 14,
    recency: 8,
    category: 'High Jewelry & Haute Couture',
    notes: 'Haute couture patron attending Paris atelier presentations. Special interest in untreated Colombian emeralds, private tiara commissions, and rare sapphire parures.'
  },
  {
    id: 'VIP-LON-7703',
    name: 'Lord Harrison Sterling',
    location: 'London, Mayfair',
    advisor: 'Camilla Laurent',
    spend: 285000,
    orders: 11,
    recency: 12,
    category: 'Vintage Complications & Savile Row Tailoring',
    notes: 'Mayfair salon regular. Collector of historical grand complications. Prefers private boardroom deliveries accompanied by vintage Krug Rosé.'
  },
  {
    id: 'VIP-EDI-6512',
    name: 'Lady Vivienne Sinclair',
    location: 'Edinburgh / London',
    advisor: 'Jean-Luc Moreau',
    spend: 94500,
    orders: 8,
    recency: 19,
    category: 'Bespoke Eveningwear & Fine Gems',
    notes: 'Patron of heritage British craftsmanship. Requires advance trunk show previews ahead of seasonal galas and private opera opening nights.'
  },
  {
    id: 'VIP-NYC-5419',
    name: 'Marcus Vance',
    location: 'New York, Manhattan',
    advisor: 'Camilla Laurent',
    spend: 88000,
    orders: 7,
    recency: 24,
    category: 'Architectural Leather Goods & Aviation Luggage',
    notes: 'Bespoke travel trunk commissions for private aviation. Values sleek minimalist aesthetic with discreet personalized blind embossing.'
  },
  {
    id: 'VIP-TYO-4302',
    name: 'Kenji Takahashi',
    location: 'Tokyo, Ginza',
    advisor: 'Diana Wong',
    spend: 72000,
    orders: 6,
    recency: 31,
    category: 'Contemporary Art & Stealth Cashmere',
    notes: 'Strictly zero visible logos. Commands finest Grade-1 vicuña and hand-finished Japanese tailoring. Prefers bilingual concierge correspondence.'
  },
  {
    id: 'VIP-HKG-3211',
    name: 'Sophia Chen',
    location: 'Hong Kong, The Peak',
    advisor: 'Diana Wong',
    spend: 46000,
    orders: 5,
    recency: 42,
    category: 'Diamond Solitaires & Artisanal Leather',
    notes: 'Attends annual private high jewelry dinners in Hong Kong. Enjoys custom engraving services and VIP festive gift curation for family members.'
  },
  {
    id: 'VIP-ZUR-2190',
    name: 'Maximillian von Berg',
    location: 'Zurich / St. Moritz',
    advisor: 'Camilla Laurent',
    spend: 38500,
    orders: 4,
    recency: 55,
    category: 'Alpine Complications & Shearling Outerwear',
    notes: 'Frequent orders ahead of the winter season in Engadin. Collector of lightweight ceramic and titanium sporting chronographs.'
  },
  {
    id: 'VIP-MIL-1084',
    name: 'Isabella Rossi',
    location: 'Milan, Quadrilatero',
    advisor: 'Jean-Luc Moreau',
    spend: 24000,
    orders: 3,
    recency: 64,
    category: 'Italian Bespoke Leather & Fine Silk',
    notes: 'Milanese luxury enthusiast. Attends cocktail vernissages and private salon styling previews for seasonal wardrobe updates.'
  },
  {
    id: 'VIP-GEN-0955',
    name: 'Julian Devereux',
    location: 'London / Geneva',
    advisor: 'Tariq Al-Mansoor',
    spend: 14500,
    orders: 2,
    recency: 110,
    category: 'Entry Fine Horology & Niche Fragrances',
    notes: 'Acquired first milestone complication last winter. Strong candidate for curated salon invitation and seasonal lookbook dispatch to nurture tier upgrade.'
  }
];

const STORAGE_KEY = 'vip_client_portfolio_roster';

// Helper: Calculate Cohort Tier
function getCohortTier(spend) {
  if (spend >= 100000) return 'Diamond';
  if (spend >= 50000) return 'Platinum';
  if (spend >= 20000) return 'Gold';
  return 'Silver';
}

function getTierBadgeClass(tier) {
  switch (tier) {
    case 'Diamond': return 'tier-diamond';
    case 'Platinum': return 'tier-platinum';
    case 'Gold': return 'tier-gold';
    case 'Silver': return 'tier-silver';
    default: return 'tier-silver';
  }
}

function getRecencyStatus(days) {
  if (days <= 30) return { label: 'Active', class: 'status-active', desc: 'Engaged within 30 days' };
  if (days <= 90) return { label: 'Warm', class: 'status-warm', desc: 'Last purchased 31-90 days ago' };
  return { label: 'Dormant', class: 'status-dormant', desc: 'Over 90 days inactive' };
}

function formatUSD(num) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(num);
}

function getInitials(name) {
  const parts = name.replace(/^(Lord|Lady|Contessa|Sheikh|Duke|Baron|Dr\.)\s+/i, '').trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

document.addEventListener('DOMContentLoaded', () => {
  // State
  let roster = [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    roster = saved ? JSON.parse(saved) : [...INITIAL_VIP_ROSTER];
  } catch (err) {
    console.warn('LocalStorage access error, fallback to initial roster', err);
    roster = [...INITIAL_VIP_ROSTER];
  }

  let activeTierFilter = 'All';
  let activeAdvisorFilter = 'All';
  let searchQuery = '';
  let activeSort = 'spend-desc';

  // DOM Elements
  const kpiTotalValuation = document.getElementById('kpi-total-valuation');
  const kpiClientCountBadge = document.getElementById('kpi-client-count-badge');
  const kpiAov = document.getElementById('kpi-aov');
  const kpiTotalOrders = document.getElementById('kpi-total-orders');
  const kpiFrequency = document.getElementById('kpi-frequency');
  const kpiConcentrationRisk = document.getElementById('kpi-concentration-risk');
  const kpiRiskBadge = document.getElementById('kpi-risk-badge');

  const segDiamond = document.getElementById('seg-diamond');
  const segPlatinum = document.getElementById('seg-platinum');
  const segGold = document.getElementById('seg-gold');
  const segSilver = document.getElementById('seg-silver');

  const legendCountsDiamond = document.getElementById('legend-counts-diamond');
  const legendCountsPlatinum = document.getElementById('legend-counts-platinum');
  const legendCountsGold = document.getElementById('legend-counts-gold');
  const legendCountsSilver = document.getElementById('legend-counts-silver');

  const legendValDiamond = document.getElementById('legend-val-diamond');
  const legendValPlatinum = document.getElementById('legend-val-platinum');
  const legendValGold = document.getElementById('legend-val-gold');
  const legendValSilver = document.getElementById('legend-val-silver');

  const tableBody = document.getElementById('vip-table-body');
  const filteredCountText = document.getElementById('filtered-count-text');

  const inputSearch = document.getElementById('input-search');
  const tierFilterPills = document.getElementById('tier-filter-pills');
  const selectAdvisor = document.getElementById('select-advisor');
  const selectSort = document.getElementById('select-sort');
  const btnResetRoster = document.getElementById('btn-reset-roster');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnPrintDossier = document.getElementById('btn-print-dossier');
  const btnAddClient = document.getElementById('btn-add-client');

  // Modals
  const modalDossierBackdrop = document.getElementById('modal-dossier-backdrop');
  const btnCloseDossier = document.getElementById('btn-close-dossier');
  const dossierClientName = document.getElementById('dossier-client-name');
  const dossierModalContent = document.getElementById('dossier-modal-content');
  const btnPrintSingleDossier = document.getElementById('btn-print-single-dossier');
  const btnEditFromDossier = document.getElementById('btn-edit-from-dossier');
  let currentInspectedClient = null;

  const modalClientBackdrop = document.getElementById('modal-client-backdrop');
  const btnCloseForm = document.getElementById('btn-close-form');
  const btnCancelForm = document.getElementById('btn-cancel-form');
  const formClient = document.getElementById('form-client');
  const modalFormTitle = document.getElementById('modal-form-title');
  const formClientEditId = document.getElementById('form-client-edit-id');

  const inputName = document.getElementById('input-name');
  const inputId = document.getElementById('input-id');
  const inputAdvisor = document.getElementById('input-advisor');
  const inputLocation = document.getElementById('input-location');
  const inputSpend = document.getElementById('input-spend');
  const inputOrders = document.getElementById('input-orders');
  const inputRecency = document.getElementById('input-recency');
  const inputCategory = document.getElementById('input-category');
  const inputNotes = document.getElementById('input-notes');
  const formTierPreview = document.getElementById('form-tier-preview');

  // Save to localStorage
  function persistRoster() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(roster));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }

  // Populate Advisors Dropdown
  function updateAdvisorDropdown() {
    const advisors = Array.from(new Set(roster.map(c => c.advisor).filter(Boolean))).sort();
    const currentVal = selectAdvisor.value;
    
    // Clear and rebuild options
    selectAdvisor.innerHTML = '<option value="All">All Advisors</option>';
    advisors.forEach(adv => {
      const opt = document.createElement('option');
      opt.value = adv;
      opt.textContent = adv;
      selectAdvisor.appendChild(opt);
    });

    if (advisors.includes(currentVal)) {
      selectAdvisor.value = currentVal;
    } else {
      selectAdvisor.value = 'All';
      activeAdvisorFilter = 'All';
    }
  }

  // Update KPIs and Tier Breakdown
  function updatePortfolioAnalytics() {
    const totalValuation = roster.reduce((sum, c) => sum + (Number(c.spend) || 0), 0);
    const totalOrders = roster.reduce((sum, c) => sum + (Number(c.orders) || 0), 0);
    const clientCount = roster.length;

    // Valuation KPI
    kpiTotalValuation.textContent = formatUSD(totalValuation);
    kpiClientCountBadge.textContent = `${clientCount} HNW Client${clientCount === 1 ? '' : 's'}`;

    // AOV KPI
    const aov = totalOrders > 0 ? Math.round(totalValuation / totalOrders) : 0;
    kpiAov.textContent = formatUSD(aov);
    kpiTotalOrders.textContent = `${totalOrders} Total Orders`;

    // Frequency KPI
    const avgFreq = clientCount > 0 ? (totalOrders / clientCount).toFixed(1) : '0.0';
    kpiFrequency.textContent = `${avgFreq} / yr`;

    // Concentration Risk KPI: % of revenue from top 5% VIPs (at least 1 VIP)
    const sortedBySpend = [...roster].sort((a, b) => b.spend - a.spend);
    const topCount = Math.max(1, Math.ceil(clientCount * 0.05));
    const topSpend = sortedBySpend.slice(0, topCount).reduce((sum, c) => sum + c.spend, 0);
    const concentrationPct = totalValuation > 0 ? ((topSpend / totalValuation) * 100).toFixed(1) : '0.0';

    kpiConcentrationRisk.textContent = `${concentrationPct}%`;
    if (Number(concentrationPct) >= 50) {
      kpiRiskBadge.textContent = `High Risk: Top ${topCount} VIP drives ${concentrationPct}%`;
      kpiRiskBadge.style.background = 'rgba(239, 68, 68, 0.2)';
      kpiRiskBadge.style.color = 'var(--error)';
      kpiRiskBadge.style.borderColor = 'rgba(239, 68, 68, 0.4)';
    } else if (Number(concentrationPct) >= 30) {
      kpiRiskBadge.textContent = `Moderate Risk: Top ${topCount} VIP drives ${concentrationPct}%`;
      kpiRiskBadge.style.background = 'rgba(245, 158, 11, 0.2)';
      kpiRiskBadge.style.color = 'var(--warning)';
      kpiRiskBadge.style.borderColor = 'rgba(245, 158, 11, 0.4)';
    } else {
      kpiRiskBadge.textContent = `Diversified: Top ${topCount} VIP drives ${concentrationPct}%`;
      kpiRiskBadge.style.background = 'rgba(16, 185, 129, 0.2)';
      kpiRiskBadge.style.color = 'var(--success)';
      kpiRiskBadge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    }

    // Cohort Tiers aggregation
    const tierStats = {
      Diamond: { count: 0, spend: 0 },
      Platinum: { count: 0, spend: 0 },
      Gold: { count: 0, spend: 0 },
      Silver: { count: 0, spend: 0 }
    };

    roster.forEach(c => {
      const tier = getCohortTier(c.spend);
      if (tierStats[tier]) {
        tierStats[tier].count += 1;
        tierStats[tier].spend += c.spend;
      }
    });

    const diamondPct = totalValuation > 0 ? ((tierStats.Diamond.spend / totalValuation) * 100).toFixed(1) : '0.0';
    const platinumPct = totalValuation > 0 ? ((tierStats.Platinum.spend / totalValuation) * 100).toFixed(1) : '0.0';
    const goldPct = totalValuation > 0 ? ((tierStats.Gold.spend / totalValuation) * 100).toFixed(1) : '0.0';
    const silverPct = totalValuation > 0 ? ((tierStats.Silver.spend / totalValuation) * 100).toFixed(1) : '0.0';

    // Update Progress Segments
    segDiamond.style.width = `${diamondPct}%`;
    segDiamond.title = `Diamond: ${formatUSD(tierStats.Diamond.spend)} (${diamondPct}%)`;

    segPlatinum.style.width = `${platinumPct}%`;
    segPlatinum.title = `Platinum: ${formatUSD(tierStats.Platinum.spend)} (${platinumPct}%)`;

    segGold.style.width = `${goldPct}%`;
    segGold.title = `Gold: ${formatUSD(tierStats.Gold.spend)} (${goldPct}%)`;

    segSilver.style.width = `${silverPct}%`;
    segSilver.title = `Silver: ${formatUSD(tierStats.Silver.spend)} (${silverPct}%)`;

    // Update Legend Counts & Values
    const getClientPct = (count) => clientCount > 0 ? Math.round((count / clientCount) * 100) : 0;

    legendCountsDiamond.textContent = `${tierStats.Diamond.count} Client${tierStats.Diamond.count === 1 ? '' : 's'} (${getClientPct(tierStats.Diamond.count)}%)`;
    legendValDiamond.textContent = formatUSD(tierStats.Diamond.spend);

    legendCountsPlatinum.textContent = `${tierStats.Platinum.count} Client${tierStats.Platinum.count === 1 ? '' : 's'} (${getClientPct(tierStats.Platinum.count)}%)`;
    legendValPlatinum.textContent = formatUSD(tierStats.Platinum.spend);

    legendCountsGold.textContent = `${tierStats.Gold.count} Client${tierStats.Gold.count === 1 ? '' : 's'} (${getClientPct(tierStats.Gold.count)}%)`;
    legendValGold.textContent = formatUSD(tierStats.Gold.spend);

    legendCountsSilver.textContent = `${tierStats.Silver.count} Client${tierStats.Silver.count === 1 ? '' : 's'} (${getClientPct(tierStats.Silver.count)}%)`;
    legendValSilver.textContent = formatUSD(tierStats.Silver.spend);
  }

  // Filter and Sort Clients
  function getFilteredAndSortedClients() {
    let list = [...roster];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(c => 
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.id && c.id.toLowerCase().includes(q)) ||
        (c.advisor && c.advisor.toLowerCase().includes(q)) ||
        (c.location && c.location.toLowerCase().includes(q)) ||
        (c.category && c.category.toLowerCase().includes(q)) ||
        (c.notes && c.notes.toLowerCase().includes(q))
      );
    }

    // Tier filter
    if (activeTierFilter !== 'All') {
      list = list.filter(c => getCohortTier(c.spend) === activeTierFilter);
    }

    // Advisor filter
    if (activeAdvisorFilter !== 'All') {
      list = list.filter(c => c.advisor === activeAdvisorFilter);
    }

    // Sort
    list.sort((a, b) => {
      switch (activeSort) {
        case 'spend-desc': return b.spend - a.spend;
        case 'spend-asc': return a.spend - b.spend;
        case 'frequency-desc': return b.orders - a.orders;
        case 'recency-asc': return a.recency - b.recency;
        case 'aov-desc': {
          const aovA = a.orders > 0 ? a.spend / a.orders : 0;
          const aovB = b.orders > 0 ? b.spend / b.orders : 0;
          return aovB - aovA;
        }
        case 'name-asc': return a.name.localeCompare(b.name);
        default: return b.spend - a.spend;
      }
    });

    return list;
  }

  // Render Table
  function renderTable() {
    const clients = getFilteredAndSortedClients();
    const maxSpend = roster.reduce((max, c) => Math.max(max, c.spend), 1);
    tableBody.innerHTML = '';

    filteredCountText.textContent = `Showing ${clients.length} of ${roster.length} clients`;

    if (clients.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `
        <td colspan="8" style="text-align: center; padding: 3rem 1rem; color: var(--text-tertiary);">
          <div style="margin-bottom: 0.5rem;">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <div style="font-weight: 600; font-size: 1rem; color: var(--text-secondary); margin-bottom: 0.25rem;">No VIP Clients Match Filter Criteria</div>
          <div style="font-size: 0.8rem;">Try clearing your search query or switching tier filters.</div>
        </td>
      `;
      tableBody.appendChild(emptyRow);
      return;
    }

    clients.forEach(client => {
      const tr = document.createElement('tr');
      const tier = getCohortTier(client.spend);
      const tierClass = getTierBadgeClass(tier);
      const recencyInfo = getRecencyStatus(client.recency);
      const initials = getInitials(client.name);
      const clientAov = client.orders > 0 ? Math.round(client.spend / client.orders) : 0;
      const spendBarWidth = Math.min(100, Math.round((client.spend / maxSpend) * 100));

      tr.innerHTML = `
        <td>
          <div class="client-cell">
            <div class="client-avatar">${initials}</div>
            <div class="client-info-text">
              <span class="client-name-text" data-action="view" data-id="${client.id}">${escapeHtml(client.name)}</span>
              <div class="client-subtext">
                <span>${escapeHtml(client.id)}</span>
                <span>•</span>
                <span>${escapeHtml(client.location || 'Global Salon')}</span>
              </div>
            </div>
          </div>
        </td>
        <td>
          <span class="tier-badge ${tierClass}">
            ${tier}
          </span>
        </td>
        <td>
          <div style="font-size: 0.85rem; color: var(--text-primary); font-weight: 500;">
            ${escapeHtml(client.advisor || 'Unassigned')}
          </div>
        </td>
        <td>
          <div class="spend-cell">${formatUSD(client.spend)}</div>
          <div class="spend-bar-mini" title="${spendBarWidth}% of top portfolio client">
            <div class="spend-bar-fill" style="width: ${spendBarWidth}%;"></div>
          </div>
        </td>
        <td>
          <div style="font-weight: 600; font-family: monospace;">${client.orders} <span style="font-size: 0.72rem; color: var(--text-tertiary); font-weight: normal;">orders</span></div>
        </td>
        <td>
          <div style="font-family: monospace; font-size: 0.85rem; color: var(--text-secondary);">${formatUSD(clientAov)}</div>
        </td>
        <td>
          <div class="recency-status ${recencyInfo.class}" title="${recencyInfo.desc}">
            <span class="status-dot"></span>
            <span style="font-weight: 600;">${client.recency}d</span>
            <span style="color: var(--text-tertiary); font-size: 0.72rem;">ago</span>
          </div>
        </td>
        <td style="text-align: right;">
          <div class="table-actions" style="justify-content: flex-end;">
            <button class="icon-action-btn" data-action="view" data-id="${client.id}" title="Inspect VIP Dossier">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
            <button class="icon-action-btn" data-action="edit" data-id="${client.id}" title="Edit Client Information">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="icon-action-btn delete-btn" data-action="delete" data-id="${client.id}" title="Remove Client">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      `;

      tableBody.appendChild(tr);
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Open Dossier Modal
  function openDossier(client) {
    currentInspectedClient = client;
    const tier = getCohortTier(client.spend);
    const tierClass = getTierBadgeClass(tier);
    const recencyInfo = getRecencyStatus(client.recency);
    const clientAov = client.orders > 0 ? Math.round(client.spend / client.orders) : 0;
    const totalValuation = roster.reduce((sum, c) => sum + (c.spend || 0), 0);
    const shareOfPortfolio = totalValuation > 0 ? ((client.spend / totalValuation) * 100).toFixed(1) : 0;

    dossierClientName.innerHTML = `
      ${escapeHtml(client.name)}
      <span class="tier-badge ${tierClass}" style="margin-left: 0.5rem; font-size: 0.7rem;">${tier} Tier</span>
    `;

    dossierModalContent.innerHTML = `
      <!-- Quick Info Bar -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; background: var(--bg-tertiary); padding: 0.85rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border);">
        <div style="font-size: 0.85rem;">
          <span style="color: var(--text-tertiary);">Reference:</span>
          <strong style="color: var(--text-primary); margin-left: 0.25rem;">${escapeHtml(client.id)}</strong>
        </div>
        <div style="font-size: 0.85rem;">
          <span style="color: var(--text-tertiary);">Advisor:</span>
          <strong style="color: var(--text-primary); margin-left: 0.25rem;">${escapeHtml(client.advisor)}</strong>
        </div>
        <div style="font-size: 0.85rem;">
          <span style="color: var(--text-tertiary);">Location:</span>
          <strong style="color: var(--text-primary); margin-left: 0.25rem;">${escapeHtml(client.location)}</strong>
        </div>
      </div>

      <!-- Financial Metrics Grid -->
      <div class="dossier-stats-grid">
        <div class="dossier-stat-box">
          <div class="dossier-stat-label">Total Spend (12Mo)</div>
          <div class="dossier-stat-num">${formatUSD(client.spend)}</div>
        </div>
        <div class="dossier-stat-box">
          <div class="dossier-stat-label">Orders Placed</div>
          <div class="dossier-stat-num">${client.orders}</div>
        </div>
        <div class="dossier-stat-box">
          <div class="dossier-stat-label">Average Order Value</div>
          <div class="dossier-stat-num">${formatUSD(clientAov)}</div>
        </div>
        <div class="dossier-stat-box">
          <div class="dossier-stat-label">Portfolio Share</div>
          <div class="dossier-stat-num">${shareOfPortfolio}%</div>
        </div>
        <div class="dossier-stat-box">
          <div class="dossier-stat-label">Recency Cadence</div>
          <div class="dossier-stat-num" style="font-size: 1.05rem; display: flex; align-items: center; justify-content: center; gap: 0.3rem;">
            <span class="status-dot" style="width: 8px; height: 8px; background: ${recencyInfo.class === 'status-active' ? 'var(--success)' : recencyInfo.class === 'status-warm' ? 'var(--warning)' : 'var(--error)'};"></span>
            ${client.recency}d (${recencyInfo.label})
          </div>
        </div>
      </div>

      <!-- Preferred Category & Affinity -->
      <div class="dossier-section">
        <div class="dossier-section-title">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          Preferred Luxury Category &amp; Styling Affinity
        </div>
        <div style="font-size: 0.9rem; color: var(--text-primary); font-weight: 600;">
          ${escapeHtml(client.category || 'High Complications, Bespoke Commissions & Fine Jewels')}
        </div>
      </div>

      <!-- Private Advisor Dossier Notes -->
      <div class="dossier-section">
        <div class="dossier-section-title">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Private Advisor Confidential Notes &amp; Intelligence
        </div>
        <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6; white-space: pre-wrap;">
          ${escapeHtml(client.notes || 'No confidential advisor notes on record.')}
        </div>
      </div>

      <!-- Recommended VIP Engagement Playbook -->
      <div class="dossier-section">
        <div class="dossier-section-title">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
          Next Bespoke Advisory Action
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          ${tier === 'Diamond' 
            ? '<span class="badge" style="background: rgba(56, 189, 248, 0.15); color: var(--diamond-cyan); border: 1px solid rgba(56, 189, 248, 0.3);">Invite to Private Geneva/Paris Atelier Salon</span><span class="badge" style="background: rgba(56, 189, 248, 0.15); color: var(--diamond-cyan); border: 1px solid rgba(56, 189, 248, 0.3);">Vault Complication Allocation</span>' 
            : tier === 'Platinum'
            ? '<span class="badge" style="background: rgba(241, 245, 249, 0.15); color: #f1f5f9; border: 1px solid rgba(241, 245, 249, 0.3);">Private In-Suite Trunk Preview</span><span class="badge" style="background: rgba(241, 245, 249, 0.15); color: #f1f5f9; border: 1px solid rgba(241, 245, 249, 0.3);">Seasonal Lookbook VIP Dispatch</span>'
            : tier === 'Gold'
            ? '<span class="badge" style="background: rgba(250, 204, 21, 0.15); color: #facc15; border: 1px solid rgba(250, 204, 21, 0.3);">Champagne Cocktail Reception Invite</span><span class="badge" style="background: rgba(250, 204, 21, 0.15); color: #facc15; border: 1px solid rgba(250, 204, 21, 0.3);">Curated Anniversary Gifting</span>'
            : '<span class="badge" style="background: rgba(148, 163, 184, 0.15); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.3);">Personal Advisor Check-in Call</span><span class="badge" style="background: rgba(148, 163, 184, 0.15); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.3);">Re-engagement Gift Box</span>'
          }
        </div>
      </div>
    `;

    modalDossierBackdrop.classList.add('open');
  }

  function closeDossier() {
    modalDossierBackdrop.classList.remove('open');
    currentInspectedClient = null;
  }

  // Open Client Form (Add or Edit)
  function openClientForm(clientToEdit = null) {
    if (clientToEdit) {
      modalFormTitle.textContent = 'Edit VIP Client Profile';
      formClientEditId.value = clientToEdit.id;
      inputName.value = clientToEdit.name || '';
      inputId.value = clientToEdit.id || '';
      inputAdvisor.value = clientToEdit.advisor || '';
      inputLocation.value = clientToEdit.location || '';
      inputSpend.value = clientToEdit.spend || '';
      inputOrders.value = clientToEdit.orders || '';
      inputRecency.value = clientToEdit.recency ?? 14;
      inputCategory.value = clientToEdit.category || '';
      inputNotes.value = clientToEdit.notes || '';
    } else {
      modalFormTitle.textContent = 'Add High-Net-Worth VIP Client';
      formClientEditId.value = '';
      formClient.reset();
      inputId.value = `VIP-NEW-${Math.floor(1000 + Math.random() * 9000)}`;
      inputSpend.value = '120000';
      inputOrders.value = '6';
      inputRecency.value = '10';
      inputAdvisor.value = 'Camilla Laurent';
      inputLocation.value = 'London, Mayfair';
    }

    updateFormTierPreview();
    modalClientBackdrop.classList.add('open');
  }

  function closeClientForm() {
    modalClientBackdrop.classList.remove('open');
  }

  function updateFormTierPreview() {
    const val = Number(inputSpend.value) || 0;
    const tier = getCohortTier(val);
    const tierClass = getTierBadgeClass(tier);
    formTierPreview.className = `tier-badge ${tierClass}`;
    formTierPreview.textContent = `${tier} (${tier === 'Diamond' ? '$100k+' : tier === 'Platinum' ? '$50k-$100k' : tier === 'Gold' ? '$20k-$50k' : '$5k-$20k'})`;
  }

  // Handle Form Submission
  formClient.addEventListener('submit', (e) => {
    e.preventDefault();

    const editId = formClientEditId.value;
    const name = inputName.value.trim();
    const id = inputId.value.trim();
    const advisor = inputAdvisor.value.trim();
    const location = inputLocation.value.trim();
    const spend = Math.max(0, Number(inputSpend.value) || 0);
    const orders = Math.max(1, Number(inputOrders.value) || 1);
    const recency = Math.max(0, Number(inputRecency.value) || 0);
    const category = inputCategory.value.trim();
    const notes = inputNotes.value.trim();

    if (!name || !id || !advisor) {
      alert('Please fill out all required fields.');
      return;
    }

    if (editId) {
      // Update existing
      const idx = roster.findIndex(c => c.id === editId);
      if (idx !== -1) {
        roster[idx] = {
          ...roster[idx],
          name,
          id,
          advisor,
          location,
          spend,
          orders,
          recency,
          category,
          notes
        };
      }
    } else {
      // Check ID conflict
      if (roster.some(c => c.id.toLowerCase() === id.toLowerCase())) {
        alert(`A client with Reference ID "${id}" already exists. Please choose a unique ID.`);
        return;
      }
      // Add new
      roster.unshift({
        id,
        name,
        advisor,
        location,
        spend,
        orders,
        recency,
        category,
        notes
      });
    }

    persistRoster();
    updateAdvisorDropdown();
    updatePortfolioAnalytics();
    renderTable();
    closeClientForm();
  });

  // Table Action Delegation
  tableBody.addEventListener('click', (e) => {
    const actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;

    const action = actionEl.getAttribute('data-action');
    const clientId = actionEl.getAttribute('data-id');
    const client = roster.find(c => c.id === clientId);

    if (!client) return;

    if (action === 'view') {
      openDossier(client);
    } else if (action === 'edit') {
      openClientForm(client);
    } else if (action === 'delete') {
      if (confirm(`Are you sure you want to remove "${client.name}" (${client.id}) from the VIP portfolio?`)) {
        roster = roster.filter(c => c.id !== clientId);
        persistRoster();
        updateAdvisorDropdown();
        updatePortfolioAnalytics();
        renderTable();
      }
    }
  });

  // Tier Filter Pills
  tierFilterPills.addEventListener('click', (e) => {
    const pill = e.target.closest('.filter-pill');
    if (!pill) return;

    document.querySelectorAll('#tier-filter-pills .filter-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');

    activeTierFilter = pill.getAttribute('data-filter');
    renderTable();
  });

  // Stacked Progress Segments Click Filtering
  document.getElementById('stacked-tier-bar').addEventListener('click', (e) => {
    const seg = e.target.closest('.tier-segment');
    if (!seg) return;
    const tierMap = {
      'seg-diamond': 'Diamond',
      'seg-platinum': 'Platinum',
      'seg-gold': 'Gold',
      'seg-silver': 'Silver'
    };
    const tier = tierMap[seg.id];
    if (tier) {
      applyTierFilter(tier);
    }
  });

  // Legend Items Click Filtering
  document.querySelectorAll('.legend-item').forEach(item => {
    item.addEventListener('click', () => {
      const tier = item.getAttribute('data-tier');
      if (activeTierFilter === tier) {
        applyTierFilter('All');
      } else {
        applyTierFilter(tier);
      }
    });
  });

  function applyTierFilter(tier) {
    activeTierFilter = tier;
    document.querySelectorAll('#tier-filter-pills .filter-pill').forEach(p => {
      if (p.getAttribute('data-filter') === tier) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });

    document.querySelectorAll('.legend-item').forEach(item => {
      if (item.getAttribute('data-tier') === tier) {
        item.classList.add('active-filter');
      } else {
        item.classList.remove('active-filter');
      }
    });

    renderTable();
  }

  // Advisor Filter Dropdown
  selectAdvisor.addEventListener('change', () => {
    activeAdvisorFilter = selectAdvisor.value;
    renderTable();
  });

  // Sort Dropdown
  selectSort.addEventListener('change', () => {
    activeSort = selectSort.value;
    renderTable();
  });

  // Search Input
  inputSearch.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderTable();
  });

  // Dynamic Tier Preview in Form
  inputSpend.addEventListener('input', updateFormTierPreview);

  // Buttons & Modals
  btnAddClient.addEventListener('click', () => openClientForm());
  btnCloseForm.addEventListener('click', closeClientForm);
  btnCancelForm.addEventListener('click', closeClientForm);

  btnCloseDossier.addEventListener('click', closeDossier);
  btnPrintSingleDossier.addEventListener('click', () => window.print());
  btnEditFromDossier.addEventListener('click', () => {
    if (currentInspectedClient) {
      const c = currentInspectedClient;
      closeDossier();
      openClientForm(c);
    }
  });

  // Close modals on clicking outside backdrop
  [modalDossierBackdrop, modalClientBackdrop].forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('open');
      }
    });
  });

  // Reset to default 10 clients
  btnResetRoster.addEventListener('click', () => {
    if (confirm('Reset entire VIP portfolio to the default 10 High-Net-Worth clients?')) {
      roster = JSON.parse(JSON.stringify(INITIAL_VIP_ROSTER));
      persistRoster();
      updateAdvisorDropdown();
      updatePortfolioAnalytics();
      applyTierFilter('All');
      inputSearch.value = '';
      searchQuery = '';
      renderTable();
    }
  });

  // CSV Export
  btnExportCsv.addEventListener('click', () => {
    const clients = getFilteredAndSortedClients();
    if (!clients.length) {
      alert('No client records available to export.');
      return;
    }

    const headers = [
      'Client Reference ID',
      'Full Name',
      'Cohort Tier',
      'Private Advisor',
      'Location / Salon',
      'Annual Spend (USD)',
      'Orders Count',
      'Average Order Value (USD)',
      'Recency (Days)',
      'Engagement Status',
      'Preferred Category',
      'Advisor Notes'
    ];

    const rows = clients.map(c => {
      const tier = getCohortTier(c.spend);
      const aov = c.orders > 0 ? Math.round(c.spend / c.orders) : 0;
      const rec = getRecencyStatus(c.recency).label;
      return [
        c.id,
        c.name,
        tier,
        c.advisor,
        c.location,
        c.spend,
        c.orders,
        aov,
        c.recency,
        rec,
        c.category || '',
        (c.notes || '').replace(/\r?\n|\r/g, ' ')
      ].map(field => `"${String(field || '').replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `VIP_Client_Portfolio_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });

  // Print Dossier
  btnPrintDossier.addEventListener('click', () => {
    window.print();
  });

  // Keyboard shortcut: Esc to close modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDossier();
      closeClientForm();
    }
  });

  // Initial Initialization
  updateAdvisorDropdown();
  updatePortfolioAnalytics();
  renderTable();
});