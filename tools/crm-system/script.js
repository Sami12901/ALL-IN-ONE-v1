// Micro CRM Pipeline System Logic
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'crm_deals_store_v1';

  // Default sample deals for first-time visitors
  const DEFAULT_DEALS = [
    {
      id: 'deal-1',
      client: 'Apex Global Logistics',
      value: 38000,
      email: 'marcus@apexlogistics.com',
      stage: 'proposal',
      closeDate: '2026-10-25',
      notes: 'Custom ERP integration and fleet telemetry tracking.'
    },
    {
      id: 'deal-2',
      client: 'Nova BioTech Labs',
      value: 54000,
      email: 'dr.elena@novabiotech.org',
      stage: 'won',
      closeDate: '2026-09-30',
      notes: 'Annual enterprise multi-seat research subscription.'
    },
    {
      id: 'deal-3',
      client: 'Kromer & Associates',
      value: 12500,
      email: 'deals@kromerlaw.com',
      stage: 'contacted',
      closeDate: '2026-11-10',
      notes: 'Initial discovery call completed; requested compliance demo.'
    },
    {
      id: 'deal-4',
      client: 'Solaris Cloud Systems',
      value: 82000,
      email: 'alex@solariscloud.io',
      stage: 'lead',
      closeDate: '2026-12-01',
      notes: 'Inbound referral from regional tech summit.'
    },
    {
      id: 'deal-5',
      client: 'Horizon Retail Partners',
      value: 29000,
      email: 'sourcing@horizonretail.com',
      stage: 'proposal',
      closeDate: '2026-10-31',
      notes: 'Contract review currently in legal department.'
    },
    {
      id: 'deal-6',
      client: 'Vanguard Media Group',
      value: 18500,
      email: 'marketing@vanguardmedia.net',
      stage: 'won',
      closeDate: '2026-09-15',
      notes: 'Digital marketing analytics automation package.'
    },
    {
      id: 'deal-7',
      client: 'Bluefin Maritime Services',
      value: 15000,
      email: 'procurement@bluefinship.com',
      stage: 'lost',
      closeDate: '2026-08-20',
      notes: 'Selected internal legacy tooling due to budgetary freeze.'
    }
  ];

  // Stage configuration & probabilities
  const STAGES = {
    lead: { name: 'Lead', probability: 0.10 },
    contacted: { name: 'Contacted', probability: 0.30 },
    proposal: { name: 'Proposal', probability: 0.60 },
    won: { name: 'Won', probability: 1.00 },
    lost: { name: 'Lost', probability: 0.00 }
  };

  // State
  let deals = [];
  let searchQuery = '';

  // DOM Elements
  const dealSearch = document.getElementById('deal-search');
  const addDealBtn = document.getElementById('add-deal-btn');
  const exportCsvBtn = document.getElementById('export-csv-btn');
  const resetDealsBtn = document.getElementById('reset-deals-btn');

  // KPI Elements
  const kpiTotalVal = document.getElementById('kpi-total-val');
  const kpiDealCount = document.getElementById('kpi-deal-count');
  const kpiWeightedVal = document.getElementById('kpi-weighted-val');
  const kpiWonVal = document.getElementById('kpi-won-val');
  const kpiWonCount = document.getElementById('kpi-won-count');
  const kpiWinRate = document.getElementById('kpi-win-rate');
  const kpiClosedRatio = document.getElementById('kpi-closed-ratio');

  // Modal Elements
  const dealModal = document.getElementById('deal-modal');
  const dealForm = document.getElementById('deal-form');
  const modalTitle = document.getElementById('modal-title');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const dealIdInput = document.getElementById('deal-id');
  const dealClientInput = document.getElementById('deal-client');
  const dealValueInput = document.getElementById('deal-value');
  const dealEmailInput = document.getElementById('deal-email');
  const dealStageSelect = document.getElementById('deal-stage');
  const dealDateInput = document.getElementById('deal-date');
  const dealNotesInput = document.getElementById('deal-notes');

  // Load from LocalStorage
  function loadDeals() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        deals = JSON.parse(stored);
      } else {
        deals = [...DEFAULT_DEALS];
        saveDeals();
      }
    } catch (e) {
      console.warn('Failed to parse stored CRM deals:', e);
      deals = [...DEFAULT_DEALS];
    }
  }

  // Save to LocalStorage
  function saveDeals() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
    } catch (e) {
      console.error('Failed to save deals to LocalStorage:', e);
    }
  }

  // Currency Formatter
  function formatMoney(amount) {
    if (isNaN(amount) || amount === null) return '$0';
    return `$${Number(amount).toLocaleString('en-US', {
      maximumFractionDigits: 0
    })}`;
  }

  // Date Formatter
  function formatDate(dateStr) {
    if (!dateStr) return 'No close date';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  // Update KPIs
  function updateKPIs() {
    let totalPipelineValue = 0;
    let weightedValue = 0;
    let wonValue = 0;
    let wonCount = 0;
    let lostCount = 0;
    let activeDealsCount = 0;

    deals.forEach(deal => {
      const val = parseFloat(deal.value) || 0;
      const stage = deal.stage || 'lead';
      const prob = STAGES[stage] ? STAGES[stage].probability : 0;

      // Pipeline value includes open deals and won deals
      if (stage !== 'lost') {
        totalPipelineValue += val;
      }
      if (stage === 'lead' || stage === 'contacted' || stage === 'proposal') {
        activeDealsCount++;
      }
      if (stage === 'won') {
        wonValue += val;
        wonCount++;
      }
      if (stage === 'lost') {
        lostCount++;
      }

      weightedValue += (val * prob);
    });

    const totalClosed = wonCount + lostCount;
    const winRate = totalClosed > 0 ? Math.round((wonCount / totalClosed) * 100) : 0;

    if (kpiTotalVal) kpiTotalVal.textContent = formatMoney(totalPipelineValue);
    if (kpiDealCount) kpiDealCount.textContent = `${activeDealsCount} active / ${deals.length} total`;
    if (kpiWeightedVal) kpiWeightedVal.textContent = formatMoney(weightedValue);
    if (kpiWonVal) kpiWonVal.textContent = formatMoney(wonValue);
    if (kpiWonCount) kpiWonCount.textContent = `${wonCount} closed won deals`;
    if (kpiWinRate) kpiWinRate.textContent = `${winRate}%`;
    if (kpiClosedRatio) kpiClosedRatio.textContent = `${wonCount} won / ${totalClosed} closed`;
  }

  // Render Kanban Columns
  function renderKanban() {
    const stageColumns = {
      lead: document.getElementById('cards-lead'),
      contacted: document.getElementById('cards-contacted'),
      proposal: document.getElementById('cards-proposal'),
      won: document.getElementById('cards-won'),
      lost: document.getElementById('cards-lost')
    };

    const stageSums = { lead: 0, contacted: 0, proposal: 0, won: 0, lost: 0 };
    const stageCounts = { lead: 0, contacted: 0, proposal: 0, won: 0, lost: 0 };

    // Clear column contents
    Object.values(stageColumns).forEach(col => {
      if (col) col.innerHTML = '';
    });

    // Filter deals
    const term = searchQuery.toLowerCase().trim();
    const filteredDeals = deals.filter(deal => {
      if (!term) return true;
      const clientMatch = (deal.client || '').toLowerCase().includes(term);
      const emailMatch = (deal.email || '').toLowerCase().includes(term);
      const notesMatch = (deal.notes || '').toLowerCase().includes(term);
      return clientMatch || emailMatch || notesMatch;
    });

    filteredDeals.forEach(deal => {
      const stage = deal.stage && stageColumns[deal.stage] ? deal.stage : 'lead';
      const col = stageColumns[stage];
      if (!col) return;

      const val = parseFloat(deal.value) || 0;
      stageSums[stage] += val;
      stageCounts[stage]++;

      const card = createDealCardElement(deal);
      col.appendChild(card);
    });

    // Check empty columns
    Object.keys(stageColumns).forEach(stg => {
      const col = stageColumns[stg];
      if (col && col.children.length === 0) {
        col.innerHTML = '<div class="empty-state">No deals in this stage</div>';
      }
    });

    // Update column headers
    Object.keys(STAGES).forEach(stg => {
      const countEl = document.getElementById(`count-${stg}`);
      const valEl = document.getElementById(`val-${stg}`);
      if (countEl) countEl.textContent = stageCounts[stg];
      if (valEl) valEl.textContent = formatMoney(stageSums[stg]);
    });

    updateKPIs();
  }

  // Create Deal Card Element with HTML5 Drag & Drop
  function createDealCardElement(deal) {
    const card = document.createElement('div');
    card.className = 'deal-card';
    card.setAttribute('draggable', 'true');
    card.setAttribute('data-id', deal.id);

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem;">
        <div class="deal-title">${escapeHtml(deal.client)}</div>
        <div class="deal-value">${formatMoney(deal.value)}</div>
      </div>
      <div class="deal-meta">
        <div class="deal-meta-item">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          <a href="mailto:${escapeHtml(deal.email)}" style="color:var(--text-secondary); text-decoration:none;" onclick="event.stopPropagation();">${escapeHtml(deal.email)}</a>
        </div>
        <div class="deal-meta-item">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <span>Close: ${formatDate(deal.closeDate)}</span>
        </div>
        ${deal.notes ? `<div style="font-size:0.75rem; color:var(--text-tertiary); margin-top:0.2rem; line-height:1.3; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">${escapeHtml(deal.notes)}</div>` : ''}
      </div>
      <div class="deal-footer">
        <select class="deal-stage-select" title="Move deal stage">
          <option value="lead" ${deal.stage === 'lead' ? 'selected' : ''}>Lead</option>
          <option value="contacted" ${deal.stage === 'contacted' ? 'selected' : ''}>Contacted</option>
          <option value="proposal" ${deal.stage === 'proposal' ? 'selected' : ''}>Proposal</option>
          <option value="won" ${deal.stage === 'won' ? 'selected' : ''}>Won</option>
          <option value="lost" ${deal.stage === 'lost' ? 'selected' : ''}>Lost</option>
        </select>
        <div class="deal-btn-group">
          <button class="deal-icon-btn btn-edit" title="Edit deal" type="button">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="deal-icon-btn btn-delete" title="Delete deal" type="button">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    `;

    // Drag events
    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', deal.id);
      e.dataTransfer.effectAllowed = 'move';
      card.classList.add('dragging');
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      document.querySelectorAll('.kanban-col').forEach(c => c.classList.remove('drag-hover'));
    });

    // Stage dropdown change
    const stageSelect = card.querySelector('.deal-stage-select');
    stageSelect.addEventListener('change', (e) => {
      const newStage = e.target.value;
      updateDealStage(deal.id, newStage);
    });

    // Edit button
    const editBtn = card.querySelector('.btn-edit');
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(deal);
    });

    // Delete button
    const deleteBtn = card.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`Are you sure you want to delete "${deal.client}"?`)) {
        deleteDeal(deal.id);
      }
    });

    return card;
  }

  // Setup Column Drag & Drop Listeners
  function setupColumnDropZones() {
    document.querySelectorAll('.kanban-col').forEach(col => {
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        col.classList.add('drag-hover');
      });

      col.addEventListener('dragleave', (e) => {
        if (!col.contains(e.relatedTarget)) {
          col.classList.remove('drag-hover');
        }
      });

      col.addEventListener('drop', (e) => {
        e.preventDefault();
        col.classList.remove('drag-hover');
        const dealId = e.dataTransfer.getData('text/plain');
        const targetStage = col.getAttribute('data-stage');
        if (dealId && targetStage) {
          updateDealStage(dealId, targetStage);
        }
      });
    });
  }

  // Update Deal Stage
  function updateDealStage(dealId, newStage) {
    const targetDeal = deals.find(d => d.id === dealId);
    if (targetDeal && targetDeal.stage !== newStage) {
      targetDeal.stage = newStage;
      saveDeals();
      renderKanban();
    }
  }

  // Delete Deal
  function deleteDeal(dealId) {
    deals = deals.filter(d => d.id !== dealId);
    saveDeals();
    renderKanban();
  }

  // Open Modal (for add or edit)
  function openModal(dealToEdit = null) {
    if (dealToEdit) {
      modalTitle.textContent = 'Edit Deal';
      dealIdInput.value = dealToEdit.id;
      dealClientInput.value = dealToEdit.client || '';
      dealValueInput.value = dealToEdit.value || '';
      dealEmailInput.value = dealToEdit.email || '';
      dealStageSelect.value = dealToEdit.stage || 'lead';
      dealDateInput.value = dealToEdit.closeDate || '';
      dealNotesInput.value = dealToEdit.notes || '';
    } else {
      modalTitle.textContent = 'Add New Deal';
      dealForm.reset();
      dealIdInput.value = '';
      dealStageSelect.value = 'lead';
      const today = new Date().toISOString().split('T')[0];
      dealDateInput.value = today;
    }
    dealModal.classList.add('active');
    dealClientInput.focus();
  }

  // Close Modal
  function closeModal() {
    dealModal.classList.remove('active');
    dealForm.reset();
  }

  // Handle Form Submission
  dealForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = dealIdInput.value.trim();
    const client = dealClientInput.value.trim();
    const value = parseFloat(dealValueInput.value) || 0;
    const email = dealEmailInput.value.trim();
    const stage = dealStageSelect.value;
    const closeDate = dealDateInput.value;
    const notes = dealNotesInput.value.trim();

    if (!client || !email) {
      alert('Please fill in Client Name and Contact Email.');
      return;
    }

    if (id) {
      // Update existing
      const existing = deals.find(d => d.id === id);
      if (existing) {
        existing.client = client;
        existing.value = value;
        existing.email = email;
        existing.stage = stage;
        existing.closeDate = closeDate;
        existing.notes = notes;
      }
    } else {
      // Create new
      const newDeal = {
        id: 'deal_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        client,
        value,
        email,
        stage,
        closeDate,
        notes
      };
      deals.push(newDeal);
    }

    saveDeals();
    renderKanban();
    closeModal();
  });

  // Modal close buttons
  modalCloseBtn.addEventListener('click', closeModal);
  modalCancelBtn.addEventListener('click', closeModal);
  dealModal.addEventListener('click', (e) => {
    if (e.target === dealModal) closeModal();
  });

  // Add Deal button
  addDealBtn.addEventListener('click', () => openModal(null));

  // Search input
  dealSearch.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderKanban();
  });

  // Reset / Load Sample Deals button
  resetDealsBtn.addEventListener('click', () => {
    if (confirm('Reset deals to the initial sample pipeline dataset? Any unsaved custom deals will be replaced.')) {
      deals = JSON.parse(JSON.stringify(DEFAULT_DEALS));
      saveDeals();
      renderKanban();
    }
  });

  // CSV Export
  exportCsvBtn.addEventListener('click', () => {
    if (deals.length === 0) {
      alert('No deals to export.');
      return;
    }

    const headers = ['Deal ID', 'Client Name', 'Deal Value ($)', 'Contact Email', 'Stage', 'Expected Close Date', 'Notes'];
    const rows = deals.map(d => [
      d.id,
      `"${(d.client || '').replace(/"/g, '""')}"`,
      d.value || 0,
      `"${(d.email || '').replace(/"/g, '""')}"`,
      `"${d.stage || 'lead'}"`,
      `"${d.closeDate || ''}"`,
      `"${(d.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `crm_pipeline_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });

  // Escape HTML helper
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Keyboard shortcut: Escape closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dealModal.classList.contains('active')) {
      closeModal();
    }
  });

  // Initialize
  loadDeals();
  setupColumnDropZones();
  renderKanban();
});