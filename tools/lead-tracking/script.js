// B2B Sales Lead Pipeline Tracker Logic
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'b2b_lead_tracking_data_v1';

  const STAGES = {
    new: { id: 'new', name: 'New Lead' },
    qualified: { id: 'qualified', name: 'Qualified' },
    demo: { id: 'demo', name: 'Demo Scheduled' },
    proposal: { id: 'proposal', name: 'Proposal Sent' },
    won: { id: 'won', name: 'Closed Won' },
    lost: { id: 'lost', name: 'Closed Lost' }
  };

  const SAMPLE_LEADS = [
    {
      id: 'lead-1',
      leadName: 'Sarah Jenkins',
      company: 'OmniCloud Systems',
      value: 45000,
      source: 'Website',
      stage: 'new',
      email: 'sjenkins@omnicloud.io',
      phone: '+1 (415) 555-0192',
      notes: 'Inbound demo request for 150 enterprise seats.'
    },
    {
      id: 'lead-2',
      leadName: 'Michael Chang',
      company: 'Zenith Logistics Global',
      value: 82000,
      source: 'Referral',
      stage: 'qualified',
      email: 'mchang@zenithlg.com',
      phone: '+1 (312) 555-0143',
      notes: 'Referred by regional VP; budget approved for Q4 deployment.'
    },
    {
      id: 'lead-3',
      leadName: 'Elena Rostova',
      company: 'BioVance Pharma',
      value: 120000,
      source: 'Cold Outreach',
      stage: 'demo',
      email: 'erostova@biovance.com',
      phone: '+1 (617) 555-0819',
      notes: 'Product architecture demo with CTO and compliance team.'
    },
    {
      id: 'lead-4',
      leadName: 'Marcus Vance',
      company: 'Aether Financial',
      value: 65000,
      source: 'Ads',
      stage: 'proposal',
      email: 'mvance@aetherfin.net',
      phone: '+1 (212) 555-0722',
      notes: 'Contract review underway with procurement.'
    },
    {
      id: 'lead-5',
      leadName: 'Diana Prince',
      company: 'Apex Robotics',
      value: 95000,
      source: 'Website',
      stage: 'won',
      email: 'diana@apexrobotics.tech',
      phone: '+1 (206) 555-0388',
      notes: 'Signed 2-year enterprise software contract.'
    },
    {
      id: 'lead-6',
      leadName: 'David Miller',
      company: 'Summit Retail Group',
      value: 28000,
      source: 'Cold Outreach',
      stage: 'lost',
      email: 'dmiller@summitretail.com',
      phone: '+1 (404) 555-0914',
      notes: 'Chose competitor due to existing legacy system commitments.'
    },
    {
      id: 'lead-7',
      leadName: 'Claire Beauchamp',
      company: 'Nexus Media Partners',
      value: 36000,
      source: 'Referral',
      stage: 'qualified',
      email: 'claire@nexusmedia.org',
      phone: '+1 (512) 555-0631',
      notes: 'Need CRM workflow integration by month end.'
    }
  ];

  // State
  let leads = loadLeads();
  let searchQuery = '';
  let selectedSource = 'all';

  // DOM references
  const kpiPipelineVal = document.getElementById('kpi-pipeline-val');
  const kpiPipelineSub = document.getElementById('kpi-pipeline-sub');
  const kpiWonVal = document.getElementById('kpi-won-val');
  const kpiWonSub = document.getElementById('kpi-won-sub');
  const kpiConversionRate = document.getElementById('kpi-conversion-rate');
  const kpiConversionSub = document.getElementById('kpi-conversion-sub');
  const kpiAvgDeal = document.getElementById('kpi-avg-deal');
  const kpiAvgSub = document.getElementById('kpi-avg-sub');

  const searchInput = document.getElementById('lead-search-input');
  const filterSource = document.getElementById('filter-source');
  const btnAddLead = document.getElementById('btn-add-lead');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnResetData = document.getElementById('btn-reset-data');

  // Modal elements
  const modalBackdrop = document.getElementById('lead-modal-backdrop');
  const modalTitle = document.getElementById('modal-title');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const leadForm = document.getElementById('lead-form');
  const formLeadId = document.getElementById('form-lead-id');
  const formLeadName = document.getElementById('form-lead-name');
  const formCompany = document.getElementById('form-company');
  const formValue = document.getElementById('form-value');
  const formStage = document.getElementById('form-stage');
  const formSource = document.getElementById('form-source');
  const formEmail = document.getElementById('form-email');
  const formPhone = document.getElementById('form-phone');
  const formNotes = document.getElementById('form-notes');

  // Persistence helpers
  function loadLeads() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading from localStorage:', e);
    }
    return JSON.parse(JSON.stringify(SAMPLE_LEADS));
  }

  function saveLeads() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    } catch (e) {
      console.warn('Error saving to localStorage:', e);
    }
  }

  // Currency Formatter
  function formatMoney(amount) {
    const num = Number(amount) || 0;
    return '$' + num.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  // HTML sanitizer
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Render KPIs
  function renderKPIs() {
    let activeVal = 0;
    let activeCount = 0;
    let wonVal = 0;
    let wonCount = 0;
    let lostCount = 0;
    let totalVal = 0;

    leads.forEach(lead => {
      const val = Number(lead.value) || 0;
      totalVal += val;
      if (['new', 'qualified', 'demo', 'proposal'].includes(lead.stage)) {
        activeVal += val;
        activeCount++;
      } else if (lead.stage === 'won') {
        wonVal += val;
        wonCount++;
      } else if (lead.stage === 'lost') {
        lostCount++;
      }
    });

    // Active Pipeline
    kpiPipelineVal.textContent = formatMoney(activeVal);
    kpiPipelineSub.textContent = `${activeCount} open opportunit${activeCount === 1 ? 'y' : 'ies'}`;

    // Closed Won
    kpiWonVal.textContent = formatMoney(wonVal);
    kpiWonSub.textContent = `${wonCount} won deal${wonCount === 1 ? '' : 's'}`;

    // Conversion Rate: Won / (Won + Lost) or Won / Total
    const decidedCount = wonCount + lostCount;
    let conversionRate = 0;
    if (decidedCount > 0) {
      conversionRate = (wonCount / decidedCount) * 100;
      kpiConversionSub.textContent = `${wonCount} won / ${decidedCount} closed deals`;
    } else if (leads.length > 0) {
      conversionRate = (wonCount / leads.length) * 100;
      kpiConversionSub.textContent = `${wonCount} won / ${leads.length} total leads`;
    } else {
      kpiConversionSub.textContent = 'No deals in pipeline';
    }
    kpiConversionRate.textContent = `${conversionRate.toFixed(1)}%`;

    // Average Deal
    const avgDeal = leads.length > 0 ? totalVal / leads.length : 0;
    kpiAvgDeal.textContent = formatMoney(avgDeal);
    kpiAvgSub.textContent = `Across ${leads.length} total lead${leads.length === 1 ? '' : 's'}`;
  }

  // Source badge class helper
  function getSourceClass(src) {
    switch (src) {
      case 'Website': return 'src-website';
      case 'Referral': return 'src-referral';
      case 'Ads': return 'src-ads';
      case 'Cold Outreach': return 'src-cold-outreach';
      default: return 'src-website';
    }
  }

  // Render Kanban Board
  function renderBoard() {
    renderKPIs();

    // Stage sub-totals & counts
    const stageStats = {
      new: { count: 0, val: 0 },
      qualified: { count: 0, val: 0 },
      demo: { count: 0, val: 0 },
      proposal: { count: 0, val: 0 },
      won: { count: 0, val: 0 },
      lost: { count: 0, val: 0 }
    };

    // Filter leads
    const filteredLeads = leads.filter(lead => {
      // Source filter
      if (selectedSource !== 'all' && lead.source !== selectedSource) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchName = (lead.leadName || '').toLowerCase().includes(query);
        const matchComp = (lead.company || '').toLowerCase().includes(query);
        const matchNotes = (lead.notes || '').toLowerCase().includes(query);
        const matchEmail = (lead.email || '').toLowerCase().includes(query);
        if (!matchName && !matchComp && !matchNotes && !matchEmail) return false;
      }
      return true;
    });

    // Clear column cards
    Object.keys(STAGES).forEach(stageId => {
      const container = document.getElementById(`cards-${stageId}`);
      if (container) container.innerHTML = '';
    });

    // Populate filtered leads
    filteredLeads.forEach(lead => {
      const stageId = lead.stage || 'new';
      if (!stageStats[stageId]) {
        stageStats[stageId] = { count: 0, val: 0 };
      }
      stageStats[stageId].count++;
      stageStats[stageId].val += Number(lead.value) || 0;

      const container = document.getElementById(`cards-${stageId}`);
      if (!container) return;

      const card = createLeadCard(lead);
      container.appendChild(card);
    });

    // Update Stage Headers
    Object.keys(STAGES).forEach(stageId => {
      const countBadge = document.getElementById(`badge-count-${stageId}`);
      const valTotal = document.getElementById(`col-val-${stageId}`);
      const container = document.getElementById(`cards-${stageId}`);

      if (countBadge) countBadge.textContent = stageStats[stageId].count;
      if (valTotal) valTotal.textContent = formatMoney(stageStats[stageId].val);

      if (container && container.children.length === 0) {
        container.innerHTML = `<div class="empty-state">No leads in stage</div>`;
      }
    });
  }

  // Create card element with drag & controls
  function createLeadCard(lead) {
    const card = document.createElement('div');
    card.className = 'lead-card';
    card.setAttribute('draggable', 'true');
    card.setAttribute('data-id', lead.id);

    // Drag handlers
    card.addEventListener('dragstart', (e) => {
      card.classList.add('dragging');
      e.dataTransfer.setData('text/plain', lead.id);
      e.dataTransfer.effectAllowed = 'move';
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
    });

    const safeName = escapeHtml(lead.leadName);
    const safeCompany = escapeHtml(lead.company);
    const safeSource = escapeHtml(lead.source);
    const safeEmail = escapeHtml(lead.email);
    const safePhone = escapeHtml(lead.phone);
    const safeNotes = escapeHtml(lead.notes);
    const valFormatted = formatMoney(lead.value);
    const sourceClass = getSourceClass(lead.source);

    let metaHtml = '';
    if (safeEmail) {
      metaHtml += `<div class="lead-meta-row" title="${safeEmail}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> ${safeEmail}</div>`;
    }
    if (safePhone) {
      metaHtml += `<div class="lead-meta-row" title="${safePhone}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> ${safePhone}</div>`;
    }

    // Stage options
    const stageOptions = Object.keys(STAGES).map(st => {
      const isSelected = lead.stage === st ? 'selected' : '';
      return `<option value="${st}" ${isSelected}>${STAGES[st].name}</option>`;
    }).join('');

    card.innerHTML = `
      <div class="lead-card-header">
        <div>
          <div class="lead-name">${safeName}</div>
          <div class="lead-company">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            ${safeCompany}
          </div>
        </div>
        <div class="lead-val">${valFormatted}</div>
      </div>
      <div class="lead-badges">
        <span class="source-tag ${sourceClass}">${safeSource}</span>
      </div>
      ${metaHtml ? `<div class="lead-meta">${metaHtml}</div>` : ''}
      ${safeNotes ? `<div class="lead-notes">${safeNotes}</div>` : ''}
      <div class="lead-card-footer">
        <select class="lead-stage-select" aria-label="Change pipeline stage">
          ${stageOptions}
        </select>
        <div class="lead-card-btns">
          <button type="button" class="lead-icon-btn btn-edit" title="Edit Lead" aria-label="Edit Lead">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button type="button" class="lead-icon-btn btn-del" title="Delete Lead" aria-label="Delete Lead">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    `;

    // Dropdown stage change
    const stageSelect = card.querySelector('.lead-stage-select');
    stageSelect.addEventListener('change', (e) => {
      lead.stage = e.target.value;
      saveLeads();
      renderBoard();
    });

    // Edit button
    const editBtn = card.querySelector('.btn-edit');
    editBtn.addEventListener('click', () => {
      openModal(lead);
    });

    // Delete button
    const delBtn = card.querySelector('.btn-del');
    delBtn.addEventListener('click', () => {
      if (confirm(`Are you sure you want to delete lead "${lead.leadName}" at ${lead.company}?`)) {
        leads = leads.filter(l => l.id !== lead.id);
        saveLeads();
        renderBoard();
      }
    });

    return card;
  }

  // Setup Column Drag & Drop Listeners
  function setupDragAndDrop() {
    const columns = document.querySelectorAll('.kanban-col');

    columns.forEach(col => {
      const targetStage = col.getAttribute('data-stage');

      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        col.classList.add('drag-hover');
      });

      col.addEventListener('dragleave', () => {
        col.classList.remove('drag-hover');
      });

      col.addEventListener('drop', (e) => {
        e.preventDefault();
        col.classList.remove('drag-hover');
        const leadId = e.dataTransfer.getData('text/plain');
        if (!leadId) return;

        const lead = leads.find(l => l.id === leadId);
        if (lead && lead.stage !== targetStage) {
          lead.stage = targetStage;
          saveLeads();
          renderBoard();
        }
      });
    });
  }

  // Modal Open/Close
  function openModal(leadToEdit = null) {
    if (leadToEdit) {
      modalTitle.textContent = 'Edit Sales Lead';
      formLeadId.value = leadToEdit.id;
      formLeadName.value = leadToEdit.leadName || '';
      formCompany.value = leadToEdit.company || '';
      formValue.value = leadToEdit.value || 0;
      formStage.value = leadToEdit.stage || 'new';
      formSource.value = leadToEdit.source || 'Website';
      formEmail.value = leadToEdit.email || '';
      formPhone.value = leadToEdit.phone || '';
      formNotes.value = leadToEdit.notes || '';
    } else {
      modalTitle.textContent = 'Add New Sales Lead';
      leadForm.reset();
      formLeadId.value = '';
      formStage.value = 'new';
      formSource.value = 'Website';
    }
    modalBackdrop.classList.add('show');
    formLeadName.focus();
  }

  function closeModal() {
    modalBackdrop.classList.remove('show');
    leadForm.reset();
  }

  // Form Submit Handler
  leadForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = formLeadName.value.trim();
    const company = formCompany.value.trim();
    const value = parseFloat(formValue.value) || 0;
    const stage = formStage.value;
    const source = formSource.value;
    const email = formEmail.value.trim();
    const phone = formPhone.value.trim();
    const notes = formNotes.value.trim();

    if (!name || !company) return;

    const id = formLeadId.value;
    if (id) {
      // Edit existing
      const existing = leads.find(l => l.id === id);
      if (existing) {
        existing.leadName = name;
        existing.company = company;
        existing.value = value;
        existing.stage = stage;
        existing.source = source;
        existing.email = email;
        existing.phone = phone;
        existing.notes = notes;
      }
    } else {
      // Add new
      const newLead = {
        id: 'lead-' + Date.now(),
        leadName: name,
        company: company,
        value: value,
        stage: stage,
        source: source,
        email: email,
        phone: phone,
        notes: notes
      };
      leads.unshift(newLead);
    }

    saveLeads();
    renderBoard();
    closeModal();
  });

  // Modal event listeners
  btnAddLead.addEventListener('click', () => openModal());
  modalCloseBtn.addEventListener('click', closeModal);
  modalCancelBtn.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  // Search & Filter listeners
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderBoard();
  });

  filterSource.addEventListener('change', (e) => {
    selectedSource = e.target.value;
    renderBoard();
  });

  // Reset Sample Data
  btnResetData.addEventListener('click', () => {
    if (confirm('Reset pipeline back to default sample leads? Any custom leads will be replaced.')) {
      leads = JSON.parse(JSON.stringify(SAMPLE_LEADS));
      saveLeads();
      renderBoard();
    }
  });

  // Export CSV
  btnExportCsv.addEventListener('click', () => {
    if (leads.length === 0) {
      alert('No leads to export.');
      return;
    }

    const headers = ['Lead ID', 'Lead Name', 'Company', 'Potential Value (USD)', 'Stage', 'Source', 'Email', 'Phone', 'Notes'];
    const rows = leads.map(l => [
      `"${l.id}"`,
      `"${(l.leadName || '').replace(/"/g, '""')}"`,
      `"${(l.company || '').replace(/"/g, '""')}"`,
      l.value || 0,
      `"${STAGES[l.stage] ? STAGES[l.stage].name : l.stage}"`,
      `"${l.source || ''}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales-leads-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Initialize
  setupDragAndDrop();
  renderBoard();
});