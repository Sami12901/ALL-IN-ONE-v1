// Customer Directory Management Logic
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'customer_directory_store_v1';

  // Sample initial customers
  const DEFAULT_CUSTOMERS = [
    {
      id: 'cust-1',
      name: 'Eleanor Vance',
      company: 'Apex Dynamics',
      email: 'eleanor@example.com',
      phone: '+1 (555) 234-5678',
      tag: 'VIP',
      spend: 64200,
      notes: 'Strategic enterprise client; quarterly platform license renews in December.'
    },
    {
      id: 'cust-2',
      name: 'Julian Hayes',
      company: 'Cobalt Media Studio',
      email: 'j.hayes@example.com',
      phone: '+1 (555) 876-1204',
      tag: 'VIP',
      spend: 42800,
      notes: 'High-volume creative agency using batch API services.'
    },
    {
      id: 'cust-3',
      name: 'Dr. Sophia Lin',
      company: 'BioGen Insights',
      email: 'sophia.lin@example.org',
      phone: '+1 (555) 432-8891',
      tag: 'Lead',
      spend: 0,
      notes: 'Requested pilot access for genomic pipeline integration.'
    },
    {
      id: 'cust-4',
      name: 'Marcus Sterling',
      company: 'Sterling Capital Group',
      email: 'm.sterling@example.com',
      phone: '+1 (555) 901-4432',
      tag: 'VIP',
      spend: 91500,
      notes: 'Multi-year tier 1 financial compliance contract.'
    },
    {
      id: 'cust-5',
      name: 'Chloe Dubois',
      company: 'Lumière Design Studio',
      email: 'chloe@example.com',
      phone: '+33 1 42 68 55 00',
      tag: 'Lead',
      spend: 1850,
      notes: 'Interested in bespoke international typography licensing.'
    },
    {
      id: 'cust-6',
      name: 'Tariq Al-Mansoor',
      company: 'Oasis Logistics MENA',
      email: 'tariq@example.com',
      phone: '+971 4 312 9000',
      tag: 'VIP',
      spend: 53000,
      notes: 'Enterprise supply chain inventory analytics integration.'
    },
    {
      id: 'cust-7',
      name: 'Rachel Gallagher',
      company: 'Pinnacle Health Tech',
      email: 'rachel@example.com',
      phone: '+1 (555) 678-3412',
      tag: 'Inactive',
      spend: 8400,
      notes: 'Account on hold due to internal corporate restructuring.'
    },
    {
      id: 'cust-8',
      name: 'Kenji Sato',
      company: 'Kurogane Robotics',
      email: 'kenji.s@example.com',
      phone: '+81 3 5555 0142',
      tag: 'Lead',
      spend: 0,
      notes: 'Attended product showcase webinar; evaluation pending.'
    }
  ];

  // State
  let customers = [];
  let currentView = 'grid'; // 'grid' or 'table'
  let searchQuery = '';
  let tagFilter = 'all';
  let sortBy = 'spend-desc';

  // DOM Elements - KPIs
  const kpiTotalCust = document.getElementById('kpi-total-cust');
  const kpiCustSubtitle = document.getElementById('kpi-cust-subtitle');
  const kpiTotalSpend = document.getElementById('kpi-total-spend');
  const kpiAvgSpend = document.getElementById('kpi-avg-spend');
  const kpiVipCount = document.getElementById('kpi-vip-count');
  const kpiVipPct = document.getElementById('kpi-vip-pct');

  // DOM Elements - Filters & Controls
  const custSearch = document.getElementById('cust-search');
  const custTagFilter = document.getElementById('cust-tag-filter');
  const custSort = document.getElementById('cust-sort');
  const viewGridBtn = document.getElementById('view-grid-btn');
  const viewTableBtn = document.getElementById('view-table-btn');
  const cardViewContainer = document.getElementById('card-view-container');
  const tableViewContainer = document.getElementById('table-view-container');
  const customerTableBody = document.getElementById('customer-table-body');

  const addCustBtn = document.getElementById('add-cust-btn');
  const exportCsvBtn = document.getElementById('export-csv-btn');
  const exportJsonBtn = document.getElementById('export-json-btn');
  const resetCustBtn = document.getElementById('reset-cust-btn');

  // DOM Elements - Modal
  const custModal = document.getElementById('cust-modal');
  const custForm = document.getElementById('cust-form');
  const modalTitle = document.getElementById('modal-title');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const custIdInput = document.getElementById('cust-id');
  const custNameInput = document.getElementById('cust-name');
  const custCompanyInput = document.getElementById('cust-company');
  const custEmailInput = document.getElementById('cust-email');
  const custPhoneInput = document.getElementById('cust-phone');
  const custTagSelect = document.getElementById('cust-tag');
  const custSpendInput = document.getElementById('cust-spend');
  const custNotesInput = document.getElementById('cust-notes');

  // Load from LocalStorage
  function loadCustomers() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        customers = JSON.parse(stored);
      } else {
        customers = [...DEFAULT_CUSTOMERS];
        saveCustomers();
      }
    } catch (e) {
      console.warn('Failed to load customers from storage:', e);
      customers = [...DEFAULT_CUSTOMERS];
    }
  }

  // Save to LocalStorage
  function saveCustomers() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    } catch (e) {
      console.error('Failed to save customers to storage:', e);
    }
  }

  // Currency helper
  function formatMoney(amount) {
    if (isNaN(amount) || amount === null) return '$0.00';
    return `$${Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  // Get Initials for Avatar
  function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  // Update KPIs
  function updateKPIs() {
    const totalCount = customers.length;
    let totalSpend = 0;
    let vipCount = 0;

    customers.forEach(c => {
      const sp = parseFloat(c.spend) || 0;
      totalSpend += sp;
      if (c.tag === 'VIP') vipCount++;
    });

    const avgSpend = totalCount > 0 ? totalSpend / totalCount : 0;
    const vipPct = totalCount > 0 ? Math.round((vipCount / totalCount) * 100) : 0;

    if (kpiTotalCust) kpiTotalCust.textContent = totalCount.toLocaleString();
    if (kpiCustSubtitle) kpiCustSubtitle.textContent = `${customers.filter(c => c.tag !== 'Inactive').length} active accounts`;
    if (kpiTotalSpend) kpiTotalSpend.textContent = formatMoney(totalSpend);
    if (kpiAvgSpend) kpiAvgSpend.textContent = formatMoney(avgSpend);
    if (kpiVipCount) kpiVipCount.textContent = vipCount.toLocaleString();
    if (kpiVipPct) kpiVipPct.textContent = `${vipPct}% of accounts`;
  }

  // Render Directory
  function renderDirectory() {
    // Filter
    const term = searchQuery.toLowerCase().trim();
    let filtered = customers.filter(c => {
      // Search filter
      if (term) {
        const nameMatch = (c.name || '').toLowerCase().includes(term);
        const compMatch = (c.company || '').toLowerCase().includes(term);
        const emailMatch = (c.email || '').toLowerCase().includes(term);
        const phoneMatch = (c.phone || '').toLowerCase().includes(term);
        if (!nameMatch && !compMatch && !emailMatch && !phoneMatch) return false;
      }
      // Tag filter
      if (tagFilter !== 'all' && c.tag !== tagFilter) {
        return false;
      }
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      const spendA = parseFloat(a.spend) || 0;
      const spendB = parseFloat(b.spend) || 0;
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      const compA = (a.company || '').toLowerCase();
      const compB = (b.company || '').toLowerCase();

      switch (sortBy) {
        case 'spend-desc':
          return spendB - spendA;
        case 'spend-asc':
          return spendA - spendB;
        case 'name-asc':
          return nameA.localeCompare(nameB);
        case 'name-desc':
          return nameB.localeCompare(nameA);
        case 'company-asc':
          return compA.localeCompare(compB);
        default:
          return 0;
      }
    });

    if (currentView === 'grid') {
      cardViewContainer.style.display = 'grid';
      tableViewContainer.style.display = 'none';
      renderCards(filtered);
    } else {
      cardViewContainer.style.display = 'none';
      tableViewContainer.style.display = 'block';
      renderTable(filtered);
    }

    updateKPIs();
  }

  // Tag Badge Class & HTML
  function getTagBadgeHtml(tag) {
    const cleanTag = tag || 'Lead';
    let cls = 'tag-lead';
    let icon = '';
    if (cleanTag === 'VIP') {
      cls = 'tag-vip';
      icon = '★ ';
    } else if (cleanTag === 'Inactive') {
      cls = 'tag-inactive';
      icon = '○ ';
    } else {
      cls = 'tag-lead';
      icon = '● ';
    }
    return `<span class="tag-badge ${cls}">${icon}${escapeHtml(cleanTag)}</span>`;
  }

  // Render Grid Cards
  function renderCards(list) {
    cardViewContainer.innerHTML = '';
    if (list.length === 0) {
      cardViewContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--text-tertiary); margin-bottom:0.75rem;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <div style="font-size:1.1rem; font-weight:600; color:var(--text-primary); margin-bottom:0.25rem;">No customers found</div>
          <p style="font-size:0.875rem;">Try modifying your search query or tag filters.</p>
        </div>
      `;
      return;
    }

    list.forEach(c => {
      const card = document.createElement('div');
      card.className = 'customer-card';

      card.innerHTML = `
        <div class="card-top">
          <div class="avatar-circle">${getInitials(c.name)}</div>
          <div class="card-info">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
              <div class="cust-name" title="${escapeHtml(c.name)}">${escapeHtml(c.name)}</div>
              ${getTagBadgeHtml(c.tag)}
            </div>
            <div class="cust-company">${escapeHtml(c.company || 'Individual Account')}</div>
          </div>
        </div>

        <div class="contact-details">
          <div class="contact-item">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            <a href="mailto:${escapeHtml(c.email)}">${escapeHtml(c.email)}</a>
          </div>
          ${c.phone ? `
            <div class="contact-item">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              <a href="tel:${escapeHtml(c.phone)}">${escapeHtml(c.phone)}</a>
            </div>
          ` : ''}
          ${c.notes ? `
            <div style="font-size:0.75rem; color:var(--text-tertiary); margin-top:0.25rem; line-height:1.3; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
              ${escapeHtml(c.notes)}
            </div>
          ` : ''}
        </div>

        <div class="card-footer">
          <div class="spend-box">
            <span class="spend-label">Total Spend</span>
            <span class="spend-amount">${formatMoney(c.spend)}</span>
          </div>
          <div style="display:flex; gap:0.4rem;">
            <button class="deal-icon-btn btn-edit" title="Edit Customer" type="button" style="border:1px solid var(--border);">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="deal-icon-btn btn-delete" title="Delete Customer" type="button" style="border:1px solid var(--border);">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      `;

      card.querySelector('.btn-edit').addEventListener('click', () => openModal(c));
      card.querySelector('.btn-delete').addEventListener('click', () => {
        if (confirm(`Are you sure you want to delete customer "${c.name}"?`)) {
          deleteCustomer(c.id);
        }
      });

      cardViewContainer.appendChild(card);
    });
  }

  // Render Table View
  function renderTable(list) {
    customerTableBody.innerHTML = '';
    if (list.length === 0) {
      customerTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">No customers match your criteria.</td>
        </tr>
      `;
      return;
    }

    list.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <div class="avatar-circle" style="width:32px; height:32px; font-size:0.8rem;">${getInitials(c.name)}</div>
            <strong style="color:var(--text-primary);">${escapeHtml(c.name)}</strong>
          </div>
        </td>
        <td>${escapeHtml(c.company || '—')}</td>
        <td>${getTagBadgeHtml(c.tag)}</td>
        <td><a href="mailto:${escapeHtml(c.email)}" style="color:var(--text-secondary); text-decoration:none;">${escapeHtml(c.email)}</a></td>
        <td>${escapeHtml(c.phone || '—')}</td>
        <td style="font-family:monospace; font-weight:700; color:var(--success); font-size:1rem;">${formatMoney(c.spend)}</td>
        <td>
          <div style="display:flex; gap:0.35rem;">
            <button class="deal-icon-btn btn-edit-row" title="Edit" type="button">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="deal-icon-btn btn-delete-row" title="Delete" type="button">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      `;

      tr.querySelector('.btn-edit-row').addEventListener('click', () => openModal(c));
      tr.querySelector('.btn-delete-row').addEventListener('click', () => {
        if (confirm(`Are you sure you want to delete customer "${c.name}"?`)) {
          deleteCustomer(c.id);
        }
      });

      customerTableBody.appendChild(tr);
    });
  }

  // Open Modal
  function openModal(customerToEdit = null) {
    if (customerToEdit) {
      modalTitle.textContent = 'Edit Customer Record';
      custIdInput.value = customerToEdit.id;
      custNameInput.value = customerToEdit.name || '';
      custCompanyInput.value = customerToEdit.company || '';
      custEmailInput.value = customerToEdit.email || '';
      custPhoneInput.value = customerToEdit.phone || '';
      custTagSelect.value = customerToEdit.tag || 'Lead';
      custSpendInput.value = customerToEdit.spend || 0;
      custNotesInput.value = customerToEdit.notes || '';
    } else {
      modalTitle.textContent = 'Add New Customer';
      custForm.reset();
      custIdInput.value = '';
      custTagSelect.value = 'Lead';
      custSpendInput.value = '0';
    }
    custModal.classList.add('active');
    custNameInput.focus();
  }

  // Close Modal
  function closeModal() {
    custModal.classList.remove('active');
    custForm.reset();
  }

  // Delete Customer
  function deleteCustomer(id) {
    customers = customers.filter(c => c.id !== id);
    saveCustomers();
    renderDirectory();
  }

  // Save Customer (Form Submit)
  custForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = custIdInput.value.trim();
    const name = custNameInput.value.trim();
    const company = custCompanyInput.value.trim();
    const email = custEmailInput.value.trim();
    const phone = custPhoneInput.value.trim();
    const tag = custTagSelect.value;
    const spend = parseFloat(custSpendInput.value) || 0;
    const notes = custNotesInput.value.trim();

    if (!name || !email) {
      alert('Please fill in Customer Name and Email.');
      return;
    }

    if (id) {
      // Edit
      const existing = customers.find(c => c.id === id);
      if (existing) {
        existing.name = name;
        existing.company = company;
        existing.email = email;
        existing.phone = phone;
        existing.tag = tag;
        existing.spend = spend;
        existing.notes = notes;
      }
    } else {
      // Create
      const newCust = {
        id: 'cust_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        name,
        company,
        email,
        phone,
        tag,
        spend,
        notes
      };
      customers.unshift(newCust);
    }

    saveCustomers();
    renderDirectory();
    closeModal();
  });

  // Modal controls
  modalCloseBtn.addEventListener('click', closeModal);
  modalCancelBtn.addEventListener('click', closeModal);
  custModal.addEventListener('click', (e) => {
    if (e.target === custModal) closeModal();
  });

  addCustBtn.addEventListener('click', () => openModal(null));

  // Filters & Search
  custSearch.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderDirectory();
  });

  custTagFilter.addEventListener('change', (e) => {
    tagFilter = e.target.value;
    renderDirectory();
  });

  custSort.addEventListener('change', (e) => {
    sortBy = e.target.value;
    renderDirectory();
  });

  // View switchers
  viewGridBtn.addEventListener('click', () => {
    currentView = 'grid';
    viewGridBtn.classList.add('active');
    viewTableBtn.classList.remove('active');
    renderDirectory();
  });

  viewTableBtn.addEventListener('click', () => {
    currentView = 'table';
    viewTableBtn.classList.add('active');
    viewGridBtn.classList.remove('active');
    renderDirectory();
  });

  // Reset / Sample Data
  resetCustBtn.addEventListener('click', () => {
    if (confirm('Reset to initial sample customer dataset? Any custom additions will be replaced.')) {
      customers = JSON.parse(JSON.stringify(DEFAULT_CUSTOMERS));
      saveCustomers();
      renderDirectory();
    }
  });

  // Export CSV
  exportCsvBtn.addEventListener('click', () => {
    if (customers.length === 0) {
      alert('Directory is empty.');
      return;
    }

    const headers = ['ID', 'Name', 'Company', 'Email', 'Phone', 'Tag', 'Total Spend ($)', 'Notes'];
    const rows = customers.map(c => [
      c.id,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.company || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${c.tag || 'Lead'}"`,
      c.spend || 0,
      `"${(c.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    downloadFile(csvContent, `customer_directory_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  });

  // Export JSON
  exportJsonBtn.addEventListener('click', () => {
    if (customers.length === 0) {
      alert('Directory is empty.');
      return;
    }
    const jsonStr = JSON.stringify(customers, null, 2);
    downloadFile(jsonStr, `customer_directory_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  });

  // Download helper
  function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // HTML escaping helper
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Keyboard shortcut
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && custModal.classList.contains('active')) {
      closeModal();
    }
  });

  // Initialize
  loadCustomers();
  renderDirectory();
});