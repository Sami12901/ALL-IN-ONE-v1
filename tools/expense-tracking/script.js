// Corporate Business Expense Tracker Logic
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'corp_expense_tracker_v1';

  const CATEGORY_COLORS = {
    'Payroll': '#3b82f6',
    'Marketing': '#ec4899',
    'Software': '#8b5cf6',
    'Travel': '#f59e0b',
    'Office': '#10b981',
    'Utilities': '#06b6d4'
  };

  const today = new Date();
  const currentMonthStr = today.toISOString().slice(0, 7); // YYYY-MM

  const SAMPLE_EXPENSES = [
    {
      id: 'exp-1',
      date: `${currentMonthStr}-01`,
      category: 'Payroll',
      description: 'Core Engineering & Design Bi-Weekly Payroll',
      amount: 42500.00,
      paymentMethod: 'Bank Wire',
      receiptAttached: true,
      receiptRef: 'PR-PAYROLL-0926.pdf',
      taxDeductible: true
    },
    {
      id: 'exp-2',
      date: `${currentMonthStr}-03`,
      category: 'Software',
      description: 'AWS Enterprise Cloud Compute & Databases',
      amount: 3840.50,
      paymentMethod: 'Corporate Card',
      receiptAttached: true,
      receiptRef: 'INV-AWS-84091.pdf',
      taxDeductible: true
    },
    {
      id: 'exp-3',
      date: `${currentMonthStr}-04`,
      category: 'Marketing',
      description: 'Google Ads Paid Search & LinkedIn B2B Campaigns',
      amount: 5200.00,
      paymentMethod: 'Corporate Card',
      receiptAttached: true,
      receiptRef: 'AD-GOOG-202610.pdf',
      taxDeductible: true
    },
    {
      id: 'exp-4',
      date: `${currentMonthStr}-05`,
      category: 'Travel',
      description: 'Executive Client Summit Flight & Lodging (Chicago)',
      amount: 1480.00,
      paymentMethod: 'Corporate Card',
      receiptAttached: true,
      receiptRef: 'UNITED-REC-7821.pdf',
      taxDeductible: true
    },
    {
      id: 'exp-5',
      date: `${currentMonthStr}-06`,
      category: 'Office',
      description: 'Ergonomic Standing Desks & Meeting Room Supplies',
      amount: 950.00,
      paymentMethod: 'ACH Direct',
      receiptAttached: false,
      receiptRef: '',
      taxDeductible: true
    },
    {
      id: 'exp-6',
      date: `${currentMonthStr}-07`,
      category: 'Utilities',
      description: 'Headquarters High-Speed Fiber Internet & Electricity',
      amount: 620.00,
      paymentMethod: 'ACH Direct',
      receiptAttached: true,
      receiptRef: 'UTIL-FIBER-4902.pdf',
      taxDeductible: true
    },
    {
      id: 'exp-7',
      date: `${currentMonthStr}-08`,
      category: 'Software',
      description: 'GitHub Enterprise, Figma, & Slack Subscriptions',
      amount: 1250.00,
      paymentMethod: 'Corporate Card',
      receiptAttached: true,
      receiptRef: 'INV-SAAS-SUB-10.pdf',
      taxDeductible: true
    },
    {
      id: 'exp-8',
      date: `${currentMonthStr}-09`,
      category: 'Travel',
      description: 'Client Dinner & Entertainment (Non-deductible portion)',
      amount: 420.00,
      paymentMethod: 'Corporate Card',
      receiptAttached: true,
      receiptRef: 'REST-BILL-9301.pdf',
      taxDeductible: false
    }
  ];

  // State
  let expenses = loadExpenses();
  let selectedMonth = 'all';
  let selectedCategory = 'all';
  let selectedTax = 'all';
  let searchQuery = '';

  // DOM Elements
  const kpiMonthSpend = document.getElementById('kpi-month-spend');
  const kpiMonthLabel = document.getElementById('kpi-month-label');
  const kpiAlltimeSpend = document.getElementById('kpi-alltime-spend');
  const kpiCountSub = document.getElementById('kpi-count-sub');
  const kpiTaxDeductible = document.getElementById('kpi-tax-deductible');
  const kpiTaxSavings = document.getElementById('kpi-tax-savings');
  const kpiAvgSpend = document.getElementById('kpi-avg-spend');

  const donutSvg = document.getElementById('donut-svg');
  const donutCenterTotal = document.getElementById('donut-center-total');
  const donutLegend = document.getElementById('donut-legend');

  const reportDeductibleTotal = document.getElementById('report-deductible-total');
  const reportDeductiblePct = document.getElementById('report-deductible-pct');
  const reportTaxSavings = document.getElementById('report-tax-savings');
  const taxTableBody = document.getElementById('tax-table-body');

  const filterMonth = document.getElementById('filter-month');
  const filterCategory = document.getElementById('filter-category');
  const filterTax = document.getElementById('filter-tax');
  const searchInput = document.getElementById('exp-search-input');

  const btnAddExpense = document.getElementById('btn-add-expense');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnResetData = document.getElementById('btn-reset-data');
  const tableBody = document.getElementById('expense-table-body');

  // Modal Elements
  const modalBackdrop = document.getElementById('expense-modal-backdrop');
  const modalTitle = document.getElementById('modal-title');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const expenseForm = document.getElementById('expense-form');
  const formExpenseId = document.getElementById('form-expense-id');
  const formDate = document.getElementById('form-date');
  const formCategory = document.getElementById('form-category');
  const formDescription = document.getElementById('form-description');
  const formAmount = document.getElementById('form-amount');
  const formPayment = document.getElementById('form-payment');
  const formReceiptAttached = document.getElementById('form-receipt-attached');
  const formReceiptRef = document.getElementById('form-receipt-ref');
  const formTaxDeductible = document.getElementById('form-tax-deductible');

  // Helpers
  function loadExpenses() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading expenses from storage:', e);
    }
    return JSON.parse(JSON.stringify(SAMPLE_EXPENSES));
  }

  function saveExpenses() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch (e) {
      console.warn('Error saving expenses to storage:', e);
    }
  }

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
      case 'Payroll': return 'cat-payroll';
      case 'Marketing': return 'cat-marketing';
      case 'Software': return 'cat-software';
      case 'Travel': return 'cat-travel';
      case 'Office': return 'cat-office';
      case 'Utilities': return 'cat-utilities';
      default: return 'cat-office';
    }
  }

  // Populate Month Filter
  function populateMonthFilter() {
    const months = new Set();
    expenses.forEach(e => {
      if (e.date && e.date.length >= 7) {
        months.add(e.date.slice(0, 7));
      }
    });

    const sortedMonths = Array.from(months).sort().reverse();
    const currentVal = filterMonth.value;
    filterMonth.innerHTML = '<option value="all">All Months</option>';

    sortedMonths.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m;
      if (m === currentVal) opt.selected = true;
      filterMonth.appendChild(opt);
    });
  }

  // Render KPI cards
  function renderKPIs() {
    const activeCurrentMonth = currentMonthStr;
    let currentMonthTotal = 0;
    let alltimeTotal = 0;
    let taxDeductibleTotal = 0;

    expenses.forEach(e => {
      const amt = Number(e.amount) || 0;
      alltimeTotal += amt;
      if (e.date && e.date.startsWith(activeCurrentMonth)) {
        currentMonthTotal += amt;
      }
      if (e.taxDeductible) {
        taxDeductibleTotal += amt;
      }
    });

    const count = expenses.length;
    const avg = count > 0 ? alltimeTotal / count : 0;
    const estimatedTaxSavings = taxDeductibleTotal * 0.21; // 21% standard corporate tax rate

    kpiMonthSpend.textContent = formatMoney(currentMonthTotal);
    kpiMonthLabel.textContent = `Active period: ${activeCurrentMonth}`;

    kpiAlltimeSpend.textContent = formatMoney(alltimeTotal);
    kpiCountSub.textContent = `${count} total expense transaction${count === 1 ? '' : 's'}`;

    kpiTaxDeductible.textContent = formatMoney(taxDeductibleTotal);
    kpiTaxSavings.textContent = `Est. Savings: ${formatMoney(estimatedTaxSavings)} (at 21%)`;

    kpiAvgSpend.textContent = formatMoney(avg);
  }

  // Render SVG Donut Chart
  function renderDonutChart(filteredExpenses) {
    const categoryTotals = {};
    Object.keys(CATEGORY_COLORS).forEach(c => categoryTotals[c] = 0);

    let totalSpend = 0;
    filteredExpenses.forEach(e => {
      const amt = Number(e.amount) || 0;
      totalSpend += amt;
      const cat = e.category in categoryTotals ? e.category : 'Office';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
    });

    donutCenterTotal.textContent = totalSpend >= 1000000 
      ? '$' + (totalSpend / 1000000).toFixed(1) + 'M' 
      : totalSpend >= 1000 
        ? '$' + (totalSpend / 1000).toFixed(1) + 'k' 
        : formatMoney(totalSpend);

    // Donut geometry: circle radius 70, circumference = 2 * PI * 70 = 439.82
    const radius = 68;
    const cx = 95;
    const cy = 95;
    const strokeWidth = 26;
    const circumference = 2 * Math.PI * radius;

    donutSvg.innerHTML = '';
    donutLegend.innerHTML = '';

    if (totalSpend === 0) {
      donutSvg.innerHTML = `
        <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="var(--border)" stroke-width="${strokeWidth}" />
      `;
      donutLegend.innerHTML = '<div style="color:var(--text-tertiary); font-size:0.8rem; text-align:center; padding:1rem;">No expenditures to chart</div>';
      return;
    }

    let accumulatedOffset = 0;

    Object.keys(CATEGORY_COLORS).forEach(cat => {
      const catVal = categoryTotals[cat];
      const color = CATEGORY_COLORS[cat];
      const pct = totalSpend > 0 ? (catVal / totalSpend) * 100 : 0;

      if (catVal > 0) {
        const sliceLength = (catVal / totalSpend) * circumference;
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', radius);
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', color);
        circle.setAttribute('stroke-width', strokeWidth);
        circle.setAttribute('stroke-dasharray', `${sliceLength} ${circumference}`);
        circle.setAttribute('stroke-dashoffset', -accumulatedOffset);
        circle.setAttribute('transform', `rotate(-90 ${cx} ${cy})`);
        circle.style.transition = 'stroke-width 0.2s ease, opacity 0.2s ease';
        circle.style.cursor = 'pointer';

        // Hover effect
        circle.addEventListener('mouseenter', () => {
          circle.setAttribute('stroke-width', strokeWidth + 4);
        });
        circle.addEventListener('mouseleave', () => {
          circle.setAttribute('stroke-width', strokeWidth);
        });

        donutSvg.appendChild(circle);
        accumulatedOffset += sliceLength;
      }

      // Legend Item
      if (catVal > 0 || totalSpend === 0) {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
          <div class="legend-bullet-text">
            <span class="legend-bullet" style="background-color: ${color};"></span>
            <span>${cat}</span>
          </div>
          <div style="font-family:monospace; font-weight:600; font-size:0.82rem;">
            ${formatMoney(catVal)} <span style="color:var(--text-tertiary); font-size:0.75rem;">(${pct.toFixed(1)}%)</span>
          </div>
        `;
        donutLegend.appendChild(legendItem);
      }
    });
  }

  // Render Tax Deduction Report
  function renderTaxReport(filteredExpenses) {
    let deductibleTotal = 0;
    let nonDeductibleTotal = 0;

    const catTax = {};
    Object.keys(CATEGORY_COLORS).forEach(c => {
      catTax[c] = { deductible: 0, nonDeductible: 0 };
    });

    filteredExpenses.forEach(e => {
      const amt = Number(e.amount) || 0;
      const cat = e.category in catTax ? e.category : 'Office';

      if (e.taxDeductible) {
        deductibleTotal += amt;
        catTax[cat].deductible += amt;
      } else {
        nonDeductibleTotal += amt;
        catTax[cat].nonDeductible += amt;
      }
    });

    const total = deductibleTotal + nonDeductibleTotal;
    const pct = total > 0 ? (deductibleTotal / total) * 100 : 0;
    const estSavings = deductibleTotal * 0.21;

    reportDeductibleTotal.textContent = formatMoney(deductibleTotal);
    reportDeductiblePct.textContent = `${pct.toFixed(1)}% of filtered expenditures`;
    reportTaxSavings.textContent = formatMoney(estSavings);

    taxTableBody.innerHTML = '';
    Object.keys(CATEGORY_COLORS).forEach(cat => {
      const row = document.createElement('tr');
      const d = catTax[cat].deductible;
      const nd = catTax[cat].nonDeductible;
      const catSum = d + nd;
      const rate = catSum > 0 ? ((d / catSum) * 100).toFixed(0) + '%' : '100%';

      row.innerHTML = `
        <td><strong style="color:var(--text-primary); font-size:0.82rem;">${cat}</strong></td>
        <td style="color:#10b981; font-family:monospace; font-weight:600;">${formatMoney(d)}</td>
        <td style="color:var(--text-tertiary); font-family:monospace;">${formatMoney(nd)}</td>
        <td style="font-family:monospace; font-size:0.78rem;">${rate}</td>
      `;
      taxTableBody.appendChild(row);
    });
  }

  // Render Table
  function renderTable() {
    renderKPIs();
    populateMonthFilter();

    // Filter expenses
    const filtered = expenses.filter(e => {
      if (selectedMonth !== 'all' && (!e.date || !e.date.startsWith(selectedMonth))) return false;
      if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
      if (selectedTax === 'deductible' && !e.taxDeductible) return false;
      if (selectedTax === 'non-deductible' && e.taxDeductible) return false;

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const descMatch = (e.description || '').toLowerCase().includes(q);
        const refMatch = (e.receiptRef || '').toLowerCase().includes(q);
        const payMatch = (e.paymentMethod || '').toLowerCase().includes(q);
        const catMatch = (e.category || '').toLowerCase().includes(q);
        if (!descMatch && !refMatch && !payMatch && !catMatch) return false;
      }
      return true;
    });

    renderDonutChart(filtered);
    renderTaxReport(filtered);

    tableBody.innerHTML = '';

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-tertiary);">
            No expense records found matching current criteria.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(e => {
      const row = document.createElement('tr');
      const catClass = getCategoryClass(e.category);
      const isDeductible = !!e.taxDeductible;

      const receiptHtml = e.receiptAttached 
        ? `<span class="receipt-badge-yes" title="${escapeHtml(e.receiptRef || 'Attached')}">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
             ${escapeHtml(e.receiptRef ? e.receiptRef : 'Yes')}
           </span>`
        : `<span class="receipt-badge-no">Missing</span>`;

      const taxBadge = isDeductible 
        ? `<span style="font-size:0.75rem; color:#10b981; font-weight:700;">Deductible</span>`
        : `<span style="font-size:0.75rem; color:var(--text-tertiary);">Non-Deductible</span>`;

      row.innerHTML = `
        <td style="font-family:monospace; font-size:0.85rem; color:var(--text-secondary); white-space:nowrap;">
          ${escapeHtml(e.date)}
        </td>
        <td>
          <span class="exp-cat-badge ${catClass}">${escapeHtml(e.category)}</span>
        </td>
        <td>
          <strong style="color:var(--text-primary); font-size:0.92rem;">${escapeHtml(e.description)}</strong>
        </td>
        <td>
          <span style="font-family:monospace; font-weight:800; color:var(--text-primary); font-size:0.95rem;">
            ${formatMoney(e.amount)}
          </span>
        </td>
        <td>
          <span style="font-size:0.82rem; color:var(--text-secondary);">${escapeHtml(e.paymentMethod)}</span>
        </td>
        <td>
          ${receiptHtml}
        </td>
        <td>
          ${taxBadge}
        </td>
        <td>
          <div style="display:flex; gap:0.25rem;">
            <button type="button" class="inv-icon-btn btn-edit-exp" title="Edit Expense" aria-label="Edit expense">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button type="button" class="inv-icon-btn btn-del-exp" title="Delete Expense" aria-label="Delete expense">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      `;

      row.querySelector('.btn-edit-exp').addEventListener('click', () => {
        openModal(e);
      });

      row.querySelector('.btn-del-exp').addEventListener('click', () => {
        if (confirm(`Are you sure you want to delete expense "${e.description}"?`)) {
          expenses = expenses.filter(item => item.id !== e.id);
          saveExpenses();
          renderTable();
        }
      });

      tableBody.appendChild(row);
    });
  }

  // Modal Open/Close
  function openModal(expToEdit = null) {
    if (expToEdit) {
      modalTitle.textContent = 'Edit Expense Record';
      formExpenseId.value = expToEdit.id;
      formDate.value = expToEdit.date || '';
      formCategory.value = expToEdit.category || 'Software';
      formDescription.value = expToEdit.description || '';
      formAmount.value = expToEdit.amount || '';
      formPayment.value = expToEdit.paymentMethod || 'Corporate Card';
      formReceiptAttached.value = expToEdit.receiptAttached ? 'yes' : 'no';
      formReceiptRef.value = expToEdit.receiptRef || '';
      formTaxDeductible.checked = expToEdit.taxDeductible !== false;
    } else {
      modalTitle.textContent = 'Add Business Expense';
      expenseForm.reset();
      formExpenseId.value = '';
      formDate.value = new Date().toISOString().slice(0, 10);
      formCategory.value = 'Software';
      formPayment.value = 'Corporate Card';
      formReceiptAttached.value = 'yes';
      formTaxDeductible.checked = true;
    }
    modalBackdrop.classList.add('show');
    formDescription.focus();
  }

  function closeModal() {
    modalBackdrop.classList.remove('show');
    expenseForm.reset();
  }

  // Form submit
  expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const date = formDate.value;
    const category = formCategory.value;
    const description = formDescription.value.trim();
    const amount = parseFloat(formAmount.value) || 0;
    const payment = formPayment.value;
    const receiptAttached = formReceiptAttached.value === 'yes';
    const receiptRef = formReceiptRef.value.trim();
    const taxDeductible = formTaxDeductible.checked;

    if (!date || !description || amount <= 0) return;

    const id = formExpenseId.value;
    if (id) {
      const existing = expenses.find(item => item.id === id);
      if (existing) {
        existing.date = date;
        existing.category = category;
        existing.description = description;
        existing.amount = amount;
        existing.paymentMethod = payment;
        existing.receiptAttached = receiptAttached;
        existing.receiptRef = receiptRef;
        existing.taxDeductible = taxDeductible;
      }
    } else {
      const newExp = {
        id: 'exp-' + Date.now(),
        date,
        category,
        description,
        amount,
        paymentMethod: payment,
        receiptAttached,
        receiptRef,
        taxDeductible
      };
      expenses.unshift(newExp);
    }

    saveExpenses();
    renderTable();
    closeModal();
  });

  // Modal triggers
  btnAddExpense.addEventListener('click', () => openModal());
  modalCloseBtn.addEventListener('click', closeModal);
  modalCancelBtn.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  // Filter triggers
  filterMonth.addEventListener('change', (e) => {
    selectedMonth = e.target.value;
    renderTable();
  });

  filterCategory.addEventListener('change', (e) => {
    selectedCategory = e.target.value;
    renderTable();
  });

  filterTax.addEventListener('change', (e) => {
    selectedTax = e.target.value;
    renderTable();
  });

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderTable();
  });

  // Export CSV
  btnExportCsv.addEventListener('click', () => {
    if (expenses.length === 0) {
      alert('No expenses to export.');
      return;
    }

    const headers = ['Expense ID', 'Date', 'Category', 'Description', 'Amount (USD)', 'Payment Method', 'Receipt Attached', 'Receipt Reference', 'Tax Deductible'];
    const rows = expenses.map(e => [
      `"${e.id}"`,
      `"${e.date || ''}"`,
      `"${(e.category || '').replace(/"/g, '""')}"`,
      `"${(e.description || '').replace(/"/g, '""')}"`,
      (Number(e.amount) || 0).toFixed(2),
      `"${(e.paymentMethod || '').replace(/"/g, '""')}"`,
      e.receiptAttached ? 'Yes' : 'No',
      `"${(e.receiptRef || '').replace(/"/g, '""')}"`,
      e.taxDeductible ? 'Yes' : 'No'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `corporate-expenses-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Reset sample data
  btnResetData.addEventListener('click', () => {
    if (confirm('Reset corporate expenses back to default samples?')) {
      expenses = JSON.parse(JSON.stringify(SAMPLE_EXPENSES));
      saveExpenses();
      renderTable();
    }
  });

  // Initial render
  renderTable();
});