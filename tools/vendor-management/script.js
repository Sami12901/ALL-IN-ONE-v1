// Supplier & Vendor Relationship Directory Logic
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY_VENDORS = 'vendor_mgmt_data_v1';
  const STORAGE_KEY_POS = 'vendor_mgmt_pos_v1';

  const SAMPLE_VENDORS = [
    {
      id: 'ven-1',
      name: 'OmniSilicon Semi & Raw Materials',
      category: 'Raw Materials',
      contactPerson: 'David Vance',
      email: 'procurement@example.com',
      phone: '+1 (408) 555-0149',
      paymentTerms: 'Net 30',
      rating: 5,
      notes: 'Primary silicon wafer and substrate supplier. 99.8% on-time delivery.',
      totalSpend: 184500.00
    },
    {
      id: 'ven-2',
      name: 'Apex Global Freight & 3PL',
      category: 'Logistics',
      contactPerson: 'Elena Rostova',
      email: 'dispatch@example.com',
      phone: '+1 (312) 555-0812',
      paymentTerms: 'Net 15',
      rating: 4,
      notes: 'Handles regional air and ocean freight containers with bonded warehousing.',
      totalSpend: 92400.00
    },
    {
      id: 'ven-3',
      name: 'CloudScale Infrastructure Networks',
      category: 'IT',
      contactPerson: 'Marcus Brody',
      email: 'billing@example.com',
      phone: '+1 (206) 555-0371',
      paymentTerms: 'Net 30',
      rating: 5,
      notes: 'Enterprise dedicated compute cluster and cloud redundancy tier 4.',
      totalSpend: 67200.00
    },
    {
      id: 'ven-4',
      name: 'WorkSpace Modern Furnishings',
      category: 'Office',
      contactPerson: 'Sarah Jenkins',
      email: 'corporate@example.com',
      phone: '+1 (617) 555-0294',
      paymentTerms: 'Net 60',
      rating: 3,
      notes: 'Office ergonomics and modular desk supplier.',
      totalSpend: 14800.00
    },
    {
      id: 'ven-5',
      name: 'Pacific Resin & Polymers Corp',
      category: 'Raw Materials',
      contactPerson: 'Kenji Sato',
      email: 'sales@example.com',
      phone: '+1 (415) 555-0983',
      paymentTerms: 'Net 30',
      rating: 4,
      notes: 'ISO-9001 certified polymer pellets for manufacturing injection molds.',
      totalSpend: 46900.00
    }
  ];

  const SAMPLE_POS = [
    {
      id: 'po-rec-1',
      poNumber: 'PO-9001',
      date: '2026-09-15',
      vendorId: 'ven-1',
      vendorName: 'OmniSilicon Semi & Raw Materials',
      amount: 45000.00,
      status: 'Completed',
      description: 'Quarterly silicon ingot batch Q3 release'
    },
    {
      id: 'po-rec-2',
      poNumber: 'PO-9002',
      date: '2026-09-28',
      vendorId: 'ven-2',
      vendorName: 'Apex Global Freight & 3PL',
      amount: 18200.00,
      status: 'Completed',
      description: 'Cross-docking and European expedited air cargo'
    },
    {
      id: 'po-rec-3',
      poNumber: 'PO-9003',
      date: '2026-10-02',
      vendorId: 'ven-3',
      vendorName: 'CloudScale Infrastructure Networks',
      amount: 12500.00,
      status: 'Approved',
      description: 'Annual HPC instance reservation and bandwidth burst'
    },
    {
      id: 'po-rec-4',
      poNumber: 'PO-9004',
      date: '2026-10-05',
      vendorId: 'ven-4',
      vendorName: 'WorkSpace Modern Furnishings',
      amount: 4200.00,
      status: 'Pending',
      description: 'Conference room soundproofing panels & chairs'
    }
  ];

  // State
  let vendors = loadVendors();
  let purchaseOrders = loadPOs();
  let currentTab = 'directory';
  let vendorSearchQuery = '';
  let selectedCategory = 'all';
  let selectedTerms = 'all';
  let poSearchQuery = '';
  let selectedPoStatus = 'all';

  // Scorecard DOM Elements
  const kpiTotalSpend = document.getElementById('kpi-total-spend');
  const kpiCompletedPosSub = document.getElementById('kpi-completed-pos-sub');
  const kpiVendorCount = document.getElementById('kpi-vendor-count');
  const kpiCategorySub = document.getElementById('kpi-category-sub');
  const kpiAvgRating = document.getElementById('kpi-avg-rating');
  const kpiRatingStars = document.getElementById('kpi-rating-stars');
  const kpiTopVendor = document.getElementById('kpi-top-vendor');

  // Tab Buttons & Views
  const tabBtnDirectory = document.getElementById('tab-btn-directory');
  const tabBtnPos = document.getElementById('tab-btn-pos');
  const viewDirectory = document.getElementById('view-directory');
  const viewPos = document.getElementById('view-pos');
  const tabVendorBadge = document.getElementById('tab-vendor-badge');
  const tabPoBadge = document.getElementById('tab-po-badge');

  // Vendor Toolbar Elements
  const btnAddVendor = document.getElementById('btn-add-vendor');
  const btnCreatePo = document.getElementById('btn-create-po');
  const btnExportVendorsCsv = document.getElementById('btn-export-vendors-csv');
  const btnResetData = document.getElementById('btn-reset-data');
  const filterCategory = document.getElementById('filter-category');
  const filterTerms = document.getElementById('filter-terms');
  const vendorSearchInput = document.getElementById('vendor-search-input');
  const vendorTableBody = document.getElementById('vendor-table-body');

  // PO Toolbar Elements
  const btnAddPoView = document.getElementById('btn-add-po-view');
  const btnExportPosCsv = document.getElementById('btn-export-pos-csv');
  const filterPoStatus = document.getElementById('filter-po-status');
  const poSearchInput = document.getElementById('po-search-input');
  const poTableBody = document.getElementById('po-table-body');

  // Vendor Modal Elements
  const vendorModal = document.getElementById('vendor-modal-backdrop');
  const vendorModalTitle = document.getElementById('vendor-modal-title');
  const vendorModalClose = document.getElementById('vendor-modal-close');
  const vendorModalCancel = document.getElementById('vendor-modal-cancel');
  const vendorForm = document.getElementById('vendor-form');
  const formVendorId = document.getElementById('form-vendor-id');
  const formVendorName = document.getElementById('form-vendor-name');
  const formVendorCategory = document.getElementById('form-vendor-category');
  const formVendorTerms = document.getElementById('form-vendor-terms');
  const formContactPerson = document.getElementById('form-contact-person');
  const formVendorEmail = document.getElementById('form-vendor-email');
  const formVendorPhone = document.getElementById('form-vendor-phone');
  const formVendorRating = document.getElementById('form-vendor-rating');
  const formVendorNotes = document.getElementById('form-vendor-notes');

  // PO Modal Elements
  const poModal = document.getElementById('po-modal-backdrop');
  const poModalClose = document.getElementById('po-modal-close');
  const poModalCancel = document.getElementById('po-modal-cancel');
  const poForm = document.getElementById('po-form');
  const poNumberInput = document.getElementById('po-number-input');
  const poDateInput = document.getElementById('po-date-input');
  const poVendorSelect = document.getElementById('po-vendor-select');
  const poAmountInput = document.getElementById('po-amount-input');
  const poStatusSelect = document.getElementById('po-status-select');
  const poDescInput = document.getElementById('po-desc-input');

  // Storage Functions
  function loadVendors() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_VENDORS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading vendors from storage:', e);
    }
    return JSON.parse(JSON.stringify(SAMPLE_VENDORS));
  }

  function saveVendors() {
    try {
      localStorage.setItem(STORAGE_KEY_VENDORS, JSON.stringify(vendors));
    } catch (e) {
      console.warn('Error saving vendors to storage:', e);
    }
  }

  function loadPOs() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_POS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading POs from storage:', e);
    }
    return JSON.parse(JSON.stringify(SAMPLE_POS));
  }

  function savePOs() {
    try {
      localStorage.setItem(STORAGE_KEY_POS, JSON.stringify(purchaseOrders));
    } catch (e) {
      console.warn('Error saving POs to storage:', e);
    }
  }

  // Formatting helpers
  function formatMoney(amount) {
    const num = Number(amount) || 0;
    return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

  function getCategoryClass(cat) {
    switch (cat) {
      case 'Raw Materials': return 'cat-raw-materials';
      case 'Logistics': return 'cat-logistics';
      case 'IT': return 'cat-it';
      case 'Office': return 'cat-office';
      default: return 'cat-office';
    }
  }

  function getStarIcons(rating) {
    const r = Math.min(5, Math.max(1, Math.round(Number(rating) || 1)));
    return '★'.repeat(r) + '☆'.repeat(5 - r);
  }

  // Calculate live total spend for each vendor (base spend + completed POs)
  function recalculateSpend() {
    // Reset/update total spend for vendors
    const vendorSpendMap = {};
    vendors.forEach(v => {
      vendorSpendMap[v.id] = Number(v.totalSpend) || 0;
    });

    // Also account for completed POs created
    purchaseOrders.forEach(po => {
      if (po.status === 'Completed' && po.vendorId && vendorSpendMap[po.vendorId] !== undefined) {
        // If PO is linked and completed, we reflect it
      }
    });
  }

  // Render Scorecard
  function renderScorecard() {
    let totalSpend = 0;
    let totalRating = 0;
    let topVendor = null;
    let maxScore = -1;

    const categories = new Set();

    vendors.forEach(v => {
      const spend = Number(v.totalSpend) || 0;
      const rating = Number(v.rating) || 0;
      totalSpend += spend;
      totalRating += rating;
      if (v.category) categories.add(v.category);

      const compositeScore = rating * 1000000 + spend;
      if (compositeScore > maxScore) {
        maxScore = compositeScore;
        topVendor = v;
      }
    });

    const completedPOCount = purchaseOrders.filter(p => p.status === 'Completed').length;

    kpiTotalSpend.textContent = formatMoney(totalSpend);
    kpiCompletedPosSub.textContent = `${completedPOCount} completed purchase orders`;

    kpiVendorCount.textContent = vendors.length;
    kpiCategorySub.textContent = `Across ${categories.size} supplier categories`;

    const avgRating = vendors.length > 0 ? (totalRating / vendors.length).toFixed(1) : '0.0';
    kpiAvgRating.textContent = `${avgRating} / 5.0`;
    kpiRatingStars.textContent = getStarIcons(Math.round(Number(avgRating) || 0));

    if (topVendor) {
      kpiTopVendor.textContent = topVendor.name;
    } else {
      kpiTopVendor.textContent = 'None';
    }

    tabVendorBadge.textContent = vendors.length;
    tabPoBadge.textContent = purchaseOrders.length;
  }

  // Render Vendor Table
  function renderVendors() {
    renderScorecard();

    const filtered = vendors.filter(v => {
      if (selectedCategory !== 'all' && v.category !== selectedCategory) return false;
      if (selectedTerms !== 'all' && v.paymentTerms !== selectedTerms) return false;

      if (vendorSearchQuery.trim() !== '') {
        const q = vendorSearchQuery.toLowerCase();
        const nameMatch = (v.name || '').toLowerCase().includes(q);
        const contactMatch = (v.contactPerson || '').toLowerCase().includes(q);
        const emailMatch = (v.email || '').toLowerCase().includes(q);
        const phoneMatch = (v.phone || '').toLowerCase().includes(q);
        if (!nameMatch && !contactMatch && !emailMatch && !phoneMatch) return false;
      }
      return true;
    });

    vendorTableBody.innerHTML = '';

    if (filtered.length === 0) {
      vendorTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-tertiary);">
            No suppliers found matching your filter criteria.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(v => {
      const row = document.createElement('tr');
      const catClass = getCategoryClass(v.category);
      const stars = getStarIcons(v.rating);

      row.innerHTML = `
        <td>
          <div style="font-weight:700; color:var(--text-primary); font-size:0.95rem;">${escapeHtml(v.name)}</div>
          ${v.notes ? `<div style="font-size:0.75rem; color:var(--text-tertiary); max-width:260px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHtml(v.notes)}">${escapeHtml(v.notes)}</div>` : ''}
        </td>
        <td>
          <span class="cat-badge ${catClass}">${escapeHtml(v.category)}</span>
        </td>
        <td>
          <div style="font-weight:600; color:var(--text-primary); font-size:0.88rem;">${escapeHtml(v.contactPerson || 'N/A')}</div>
        </td>
        <td>
          <div style="font-size:0.82rem;"><a href="mailto:${escapeHtml(v.email)}" style="color:var(--accent);">${escapeHtml(v.email)}</a></div>
          ${v.phone ? `<div style="font-size:0.75rem; color:var(--text-tertiary);">${escapeHtml(v.phone)}</div>` : ''}
        </td>
        <td>
          <span class="terms-tag">${escapeHtml(v.paymentTerms)}</span>
        </td>
        <td>
          <div class="star-rating" title="${v.rating} of 5 Stars">${stars}</div>
        </td>
        <td>
          <span style="font-family:monospace; font-weight:700; color:var(--text-primary); font-size:0.92rem;">
            ${formatMoney(v.totalSpend)}
          </span>
        </td>
        <td>
          <div style="display:flex; gap:0.25rem;">
            <button type="button" class="inv-icon-btn btn-new-po" title="Create PO for this vendor" aria-label="Create PO">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            </button>
            <button type="button" class="inv-icon-btn btn-edit-vendor" title="Edit Vendor" aria-label="Edit vendor">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button type="button" class="inv-icon-btn btn-del-vendor" title="Delete Vendor" aria-label="Delete vendor">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      `;

      // Quick PO
      row.querySelector('.btn-new-po').addEventListener('click', () => {
        openPoModal(v.id);
      });

      // Edit
      row.querySelector('.btn-edit-vendor').addEventListener('click', () => {
        openVendorModal(v);
      });

      // Delete
      row.querySelector('.btn-del-vendor').addEventListener('click', () => {
        if (confirm(`Are you sure you want to delete vendor "${v.name}"?`)) {
          vendors = vendors.filter(item => item.id !== v.id);
          saveVendors();
          renderVendors();
        }
      });

      vendorTableBody.appendChild(row);
    });
  }

  // Render Purchase Orders Table
  function renderPOs() {
    renderScorecard();

    const filtered = purchaseOrders.filter(p => {
      if (selectedPoStatus !== 'all' && p.status !== selectedPoStatus) return false;

      if (poSearchQuery.trim() !== '') {
        const q = poSearchQuery.toLowerCase();
        const numMatch = (p.poNumber || '').toLowerCase().includes(q);
        const venMatch = (p.vendorName || '').toLowerCase().includes(q);
        const descMatch = (p.description || '').toLowerCase().includes(q);
        if (!numMatch && !venMatch && !descMatch) return false;
      }
      return true;
    });

    poTableBody.innerHTML = '';

    if (filtered.length === 0) {
      poTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--text-tertiary);">
            No purchase orders found matching your search.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(po => {
      const row = document.createElement('tr');
      const statusClass = 'po-' + (po.status || 'pending').toLowerCase();

      row.innerHTML = `
        <td>
          <strong style="font-family:monospace; color:var(--accent); font-size:0.92rem;">${escapeHtml(po.poNumber)}</strong>
        </td>
        <td>
          <span style="font-size:0.85rem; color:var(--text-secondary);">${escapeHtml(po.date)}</span>
        </td>
        <td>
          <span style="font-weight:600; color:var(--text-primary); font-size:0.9rem;">${escapeHtml(po.vendorName)}</span>
        </td>
        <td>
          <span style="font-size:0.82rem; color:var(--text-secondary);">${escapeHtml(po.description)}</span>
        </td>
        <td>
          <span style="font-family:monospace; font-weight:700; color:var(--text-primary);">${formatMoney(po.amount)}</span>
        </td>
        <td>
          <span class="po-status ${statusClass}">${escapeHtml(po.status)}</span>
        </td>
        <td>
          <div style="display:flex; gap:0.25rem; align-items:center;">
            <select class="po-row-status-select" style="font-size:0.75rem; padding:0.2rem 0.4rem; border-radius:var(--radius-sm); background:var(--bg-tertiary); border:1px solid var(--border); color:var(--text-primary); cursor:pointer;">
              <option value="Completed" ${po.status === 'Completed' ? 'selected' : ''}>Completed</option>
              <option value="Approved" ${po.status === 'Approved' ? 'selected' : ''}>Approved</option>
              <option value="Pending" ${po.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Cancelled" ${po.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
            <button type="button" class="inv-icon-btn btn-del-po" title="Delete PO" aria-label="Delete PO">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      `;

      // Status change
      const statusSelect = row.querySelector('.po-row-status-select');
      statusSelect.addEventListener('change', (e) => {
        const oldStatus = po.status;
        const newStatus = e.target.value;
        po.status = newStatus;

        // If newly marked completed, add to vendor spend
        if (oldStatus !== 'Completed' && newStatus === 'Completed') {
          const v = vendors.find(item => item.id === po.vendorId);
          if (v) {
            v.totalSpend = (Number(v.totalSpend) || 0) + (Number(po.amount) || 0);
            saveVendors();
          }
        } else if (oldStatus === 'Completed' && newStatus !== 'Completed') {
          // Subtract from vendor spend
          const v = vendors.find(item => item.id === po.vendorId);
          if (v) {
            v.totalSpend = Math.max(0, (Number(v.totalSpend) || 0) - (Number(po.amount) || 0));
            saveVendors();
          }
        }

        savePOs();
        renderPOs();
        renderVendors();
      });

      // Delete PO
      row.querySelector('.btn-del-po').addEventListener('click', () => {
        if (confirm(`Delete Purchase Order "${po.poNumber}"?`)) {
          if (po.status === 'Completed') {
            const v = vendors.find(item => item.id === po.vendorId);
            if (v) {
              v.totalSpend = Math.max(0, (Number(v.totalSpend) || 0) - (Number(po.amount) || 0));
              saveVendors();
            }
          }
          purchaseOrders = purchaseOrders.filter(p => p.id !== po.id);
          savePOs();
          renderPOs();
          renderVendors();
        }
      });

      poTableBody.appendChild(row);
    });
  }

  // Tab switching
  function switchTab(tab) {
    currentTab = tab;
    if (tab === 'directory') {
      tabBtnDirectory.classList.add('active');
      tabBtnPos.classList.remove('active');
      viewDirectory.style.display = 'block';
      viewPos.style.display = 'none';
      renderVendors();
    } else {
      tabBtnDirectory.classList.remove('active');
      tabBtnPos.classList.add('active');
      viewDirectory.style.display = 'none';
      viewPos.style.display = 'block';
      renderPOs();
    }
  }

  tabBtnDirectory.addEventListener('click', () => switchTab('directory'));
  tabBtnPos.addEventListener('click', () => switchTab('pos'));

  // Vendor Modal Open/Close
  function openVendorModal(vToEdit = null) {
    if (vToEdit) {
      vendorModalTitle.textContent = 'Edit Supplier';
      formVendorId.value = vToEdit.id;
      formVendorName.value = vToEdit.name || '';
      formVendorCategory.value = vToEdit.category || 'Raw Materials';
      formVendorTerms.value = vToEdit.paymentTerms || 'Net 30';
      formContactPerson.value = vToEdit.contactPerson || '';
      formVendorEmail.value = vToEdit.email || '';
      formVendorPhone.value = vToEdit.phone || '';
      formVendorRating.value = vToEdit.rating || 4;
      formVendorNotes.value = vToEdit.notes || '';
    } else {
      vendorModalTitle.textContent = 'Add Supplier / Vendor';
      vendorForm.reset();
      formVendorId.value = '';
      formVendorCategory.value = 'Raw Materials';
      formVendorTerms.value = 'Net 30';
      formVendorRating.value = '4';
    }
    vendorModal.classList.add('show');
    formVendorName.focus();
  }

  function closeVendorModal() {
    vendorModal.classList.remove('show');
    vendorForm.reset();
  }

  // Save Vendor Form
  vendorForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = formVendorName.value.trim();
    const category = formVendorCategory.value;
    const terms = formVendorTerms.value;
    const contact = formContactPerson.value.trim();
    const email = formVendorEmail.value.trim();
    const phone = formVendorPhone.value.trim();
    const rating = parseInt(formVendorRating.value, 10) || 4;
    const notes = formVendorNotes.value.trim();

    if (!name || !email) return;

    const id = formVendorId.value;
    if (id) {
      const v = vendors.find(item => item.id === id);
      if (v) {
        v.name = name;
        v.category = category;
        v.paymentTerms = terms;
        v.contactPerson = contact;
        v.email = email;
        v.phone = phone;
        v.rating = rating;
        v.notes = notes;
      }
    } else {
      const newV = {
        id: 'ven-' + Date.now(),
        name,
        category,
        paymentTerms: terms,
        contactPerson: contact,
        email,
        phone,
        rating,
        notes,
        totalSpend: 0.00
      };
      vendors.unshift(newV);
    }

    saveVendors();
    renderVendors();
    closeVendorModal();
  });

  // PO Modal Open/Close
  function populatePoVendorSelect(preselectedVendorId = null) {
    poVendorSelect.innerHTML = '';
    vendors.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.id;
      opt.textContent = `${v.name} (${v.category})`;
      if (v.id === preselectedVendorId) opt.selected = true;
      poVendorSelect.appendChild(opt);
    });
  }

  function openPoModal(preselectedVendorId = null) {
    if (vendors.length === 0) {
      alert('Please add at least one vendor first before creating a purchase order.');
      return;
    }

    poForm.reset();
    populatePoVendorSelect(preselectedVendorId);
    poNumberInput.value = 'PO-' + Math.floor(1000 + Math.random() * 9000);
    poDateInput.value = new Date().toISOString().slice(0, 10);
    poStatusSelect.value = 'Completed';
    poModal.classList.add('show');
    poAmountInput.focus();
  }

  function closePoModal() {
    poModal.classList.remove('show');
    poForm.reset();
  }

  // Save PO Form
  poForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const poNumber = poNumberInput.value.trim().toUpperCase();
    const date = poDateInput.value;
    const vendorId = poVendorSelect.value;
    const amount = parseFloat(poAmountInput.value) || 0;
    const status = poStatusSelect.value;
    const desc = poDescInput.value.trim();

    if (!poNumber || !vendorId || amount <= 0) return;

    const v = vendors.find(item => item.id === vendorId);
    const vendorName = v ? v.name : 'Unknown';

    const newPO = {
      id: 'po-' + Date.now(),
      poNumber,
      date,
      vendorId,
      vendorName,
      amount,
      status,
      description: desc
    };

    purchaseOrders.unshift(newPO);

    if (status === 'Completed' && v) {
      v.totalSpend = (Number(v.totalSpend) || 0) + amount;
      saveVendors();
    }

    savePOs();
    renderPOs();
    renderVendors();
    closePoModal();
    switchTab('pos');
  });

  // Export Vendors CSV
  btnExportVendorsCsv.addEventListener('click', () => {
    if (vendors.length === 0) {
      alert('No vendors to export.');
      return;
    }

    const headers = ['Vendor Name', 'Category', 'Contact Person', 'Email', 'Phone', 'Payment Terms', 'Rating (1-5)', 'Total Spend (USD)', 'Notes'];
    const rows = vendors.map(v => [
      `"${(v.name || '').replace(/"/g, '""')}"`,
      `"${(v.category || '').replace(/"/g, '""')}"`,
      `"${(v.contactPerson || '').replace(/"/g, '""')}"`,
      `"${(v.email || '').replace(/"/g, '""')}"`,
      `"${(v.phone || '').replace(/"/g, '""')}"`,
      `"${(v.paymentTerms || '').replace(/"/g, '""')}"`,
      v.rating || 0,
      (Number(v.totalSpend) || 0).toFixed(2),
      `"${(v.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vendors-directory-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Export Purchase Orders CSV
  btnExportPosCsv.addEventListener('click', () => {
    if (purchaseOrders.length === 0) {
      alert('No purchase orders to export.');
      return;
    }

    const headers = ['PO Number', 'Order Date', 'Vendor Name', 'Amount (USD)', 'Status', 'Description'];
    const rows = purchaseOrders.map(p => [
      `"${(p.poNumber || '').replace(/"/g, '""')}"`,
      `"${(p.date || '').replace(/"/g, '""')}"`,
      `"${(p.vendorName || '').replace(/"/g, '""')}"`,
      (Number(p.amount) || 0).toFixed(2),
      `"${p.status || ''}"`,
      `"${(p.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `purchase-orders-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Reset to sample data
  btnResetData.addEventListener('click', () => {
    if (confirm('Reset vendors directory and purchase orders back to default samples?')) {
      vendors = JSON.parse(JSON.stringify(SAMPLE_VENDORS));
      purchaseOrders = JSON.parse(JSON.stringify(SAMPLE_POS));
      saveVendors();
      savePOs();
      renderVendors();
      renderPOs();
    }
  });

  // Filter Listeners
  filterCategory.addEventListener('change', (e) => {
    selectedCategory = e.target.value;
    renderVendors();
  });

  filterTerms.addEventListener('change', (e) => {
    selectedTerms = e.target.value;
    renderVendors();
  });

  vendorSearchInput.addEventListener('input', (e) => {
    vendorSearchQuery = e.target.value;
    renderVendors();
  });

  filterPoStatus.addEventListener('change', (e) => {
    selectedPoStatus = e.target.value;
    renderPOs();
  });

  poSearchInput.addEventListener('input', (e) => {
    poSearchQuery = e.target.value;
    renderPOs();
  });

  // Modal Triggers
  btnAddVendor.addEventListener('click', () => openVendorModal());
  vendorModalClose.addEventListener('click', closeVendorModal);
  vendorModalCancel.addEventListener('click', closeVendorModal);
  vendorModal.addEventListener('click', (e) => {
    if (e.target === vendorModal) closeVendorModal();
  });

  btnCreatePo.addEventListener('click', () => openPoModal());
  btnAddPoView.addEventListener('click', () => openPoModal());
  poModalClose.addEventListener('click', closePoModal);
  poModalCancel.addEventListener('click', closePoModal);
  poModal.addEventListener('click', (e) => {
    if (e.target === poModal) closePoModal();
  });

  // Initial render
  renderVendors();
});