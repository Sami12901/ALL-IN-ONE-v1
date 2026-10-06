// Visa Profit Calculator & Batch Margin Manager
document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const clientNameInput = document.getElementById('client-name-input');
  const visaPresetSelect = document.getElementById('visa-preset-select');
  const presetChips = document.querySelectorAll('.preset-chip');
  const embassyFeeInput = document.getElementById('embassy-fee-input');
  const agencyChargeInput = document.getElementById('agency-charge-input');
  const docCostInput = document.getElementById('doc-cost-input');
  const applicantsCountInput = document.getElementById('applicants-count-input');
  const currencySelect = document.getElementById('currency-select');
  const btnResetOrder = document.getElementById('btn-reset-order');
  const btnAddBatch = document.getElementById('btn-add-batch');

  // KPI Output Elements
  const marginStatusBadge = document.getElementById('margin-status-badge');
  const valTotalRev = document.getElementById('val-total-rev');
  const subRevPax = document.getElementById('sub-rev-pax');
  const valTotalCost = document.getElementById('val-total-cost');
  const subCostPax = document.getElementById('sub-cost-pax');
  const valNetProfit = document.getElementById('val-net-profit');
  const subProfitPax = document.getElementById('sub-profit-pax');
  const valProfitMargin = document.getElementById('val-profit-margin');
  const subMarkupPax = document.getElementById('sub-markup-pax');

  // Unit Breakdown Table Elements
  const unitClientPrice = document.getElementById('unit-client-price');
  const unitEmbassyFee = document.getElementById('unit-embassy-fee');
  const unitDocCost = document.getElementById('unit-doc-cost');
  const unitNetProfit = document.getElementById('unit-net-profit');

  // Batch Queue Elements
  const batchTotalApplicants = document.getElementById('batch-total-applicants');
  const batchCountOrders = document.getElementById('batch-count-orders');
  const batchTotalRevenue = document.getElementById('batch-total-revenue');
  const batchTotalCosts = document.getElementById('batch-total-costs');
  const batchTotalProfit = document.getElementById('batch-total-profit');
  const batchAvgMargin = document.getElementById('batch-avg-margin');
  const batchTableBody = document.getElementById('batch-table-body');
  const btnLoadDemoBatch = document.getElementById('btn-load-demo-batch');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnClearBatch = document.getElementById('btn-clear-batch');

  // --- Internal State ---
  let currencyCode = 'USD';
  let currencySymbol = '$';
  let exchangeRate = 1.0;

  let batchRecords = [];

  // Currency helper
  function formatMoney(amountUSD) {
    const converted = amountUSD * exchangeRate;
    return `${currencySymbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  // --- Calculate Current Order ---
  function calculateCurrentOrder() {
    const embassyFee = Math.max(0, parseFloat(embassyFeeInput.value) || 0);
    const agencyCharge = Math.max(0, parseFloat(agencyChargeInput.value) || 0);
    const docCost = Math.max(0, parseFloat(docCostInput.value) || 0);
    const applicants = Math.max(1, parseInt(applicantsCountInput.value, 10) || 1);

    // Unit economics per applicant
    const pricePerPax = embassyFee + agencyCharge;
    const costPerPax = embassyFee + docCost;
    const netProfitPerPax = agencyCharge - docCost;
    const unitMargin = pricePerPax > 0 ? (netProfitPerPax / pricePerPax) * 100 : 0;
    const markupOnCost = costPerPax > 0 ? (netProfitPerPax / costPerPax) * 100 : 0;

    // Totals
    const totalRev = pricePerPax * applicants;
    const totalCost = costPerPax * applicants;
    const totalNetProfit = netProfitPerPax * applicants;
    const totalMargin = totalRev > 0 ? (totalNetProfit / totalRev) * 100 : 0;

    // Update KPI Card Displays
    if (valTotalRev) valTotalRev.textContent = formatMoney(totalRev);
    if (subRevPax) subRevPax.textContent = `${formatMoney(pricePerPax)} / applicant`;

    if (valTotalCost) valTotalCost.textContent = formatMoney(totalCost);
    if (subCostPax) subCostPax.textContent = `${formatMoney(costPerPax)} / applicant`;

    if (valNetProfit) {
      valNetProfit.textContent = (totalNetProfit >= 0 ? '+' : '') + formatMoney(totalNetProfit);
      if (totalNetProfit >= 0) {
        valNetProfit.className = 'kpi-val profit-positive';
      } else {
        valNetProfit.className = 'kpi-val profit-negative';
      }
    }
    if (subProfitPax) {
      subProfitPax.textContent = (netProfitPerPax >= 0 ? '+' : '') + `${formatMoney(netProfitPerPax)} / applicant`;
    }

    if (valProfitMargin) {
      valProfitMargin.textContent = `${totalMargin.toFixed(2)}%`;
    }
    if (subMarkupPax) {
      subMarkupPax.textContent = `Markup: ${markupOnCost >= 0 ? '+' : ''}${markupOnCost.toFixed(1)}% on cost`;
    }

    // Update Margin Badge
    if (marginStatusBadge) {
      marginStatusBadge.textContent = `${totalMargin.toFixed(1)}% MARGIN`;
      marginStatusBadge.className = 'margin-badge ' + (
        totalMargin >= 30 ? 'excellent' :
        totalMargin >= 10 ? 'moderate' : 'low'
      );
    }

    // Update Unit Breakdown
    if (unitClientPrice) unitClientPrice.textContent = formatMoney(pricePerPax);
    if (unitEmbassyFee) unitEmbassyFee.textContent = `-${formatMoney(embassyFee)}`;
    if (unitDocCost) unitDocCost.textContent = `-${formatMoney(docCost)}`;
    if (unitNetProfit) {
      unitNetProfit.textContent = (netProfitPerPax >= 0 ? '+' : '') + formatMoney(netProfitPerPax);
      unitNetProfit.style.color = netProfitPerPax >= 0 ? 'var(--success)' : 'var(--danger)';
    }

    return {
      clientRef: (clientNameInput.value || 'Client Order').trim(),
      visaCategory: visaPresetSelect.selectedOptions[0]?.text || 'Visa Application',
      applicants,
      embassyFee,
      agencyCharge,
      docCost,
      pricePerPax,
      costPerPax,
      totalRev,
      totalCost,
      totalNetProfit,
      totalMargin
    };
  }

  // Preset Selection Handler
  function applyPreset(presetKey) {
    if (visaPresetSelect) {
      visaPresetSelect.value = presetKey;
      const selected = visaPresetSelect.selectedOptions[0];
      if (selected && selected.dataset.embassy) {
        embassyFeeInput.value = selected.dataset.embassy;
        agencyChargeInput.value = selected.dataset.agency;
        docCostInput.value = selected.dataset.doc;
      }
      calculateCurrentOrder();
    }
  }

  if (visaPresetSelect) {
    visaPresetSelect.addEventListener('change', () => {
      const selected = visaPresetSelect.selectedOptions[0];
      if (selected && selected.dataset.embassy) {
        embassyFeeInput.value = selected.dataset.embassy;
        agencyChargeInput.value = selected.dataset.agency;
        docCostInput.value = selected.dataset.doc;
      }
      calculateCurrentOrder();
    });
  }

  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      if (chip.dataset.preset) {
        applyPreset(chip.dataset.preset);
      }
    });
  });

  // Currency select
  if (currencySelect) {
    currencySelect.addEventListener('change', () => {
      const selected = currencySelect.selectedOptions[0];
      currencyCode = currencySelect.value;
      currencySymbol = selected.dataset.symbol || '$';
      exchangeRate = parseFloat(selected.dataset.rate || '1.0');
      calculateCurrentOrder();
      renderBatchTable();
    });
  }

  // Live input events
  [clientNameInput, embassyFeeInput, agencyChargeInput, docCostInput, applicantsCountInput].forEach(elem => {
    if (elem) {
      elem.addEventListener('input', calculateCurrentOrder);
      elem.addEventListener('change', calculateCurrentOrder);
    }
  });

  // Reset order button
  if (btnResetOrder) {
    btnResetOrder.addEventListener('click', () => {
      clientNameInput.value = 'Client Reference';
      applyPreset('schengen');
      applicantsCountInput.value = '1';
      calculateCurrentOrder();
    });
  }

  // --- Batch Group Management ---
  function renderBatchTable() {
    if (!batchTableBody) return;

    if (batchRecords.length === 0) {
      batchTableBody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; color: var(--text-tertiary); padding: 2rem;">
            No batch orders recorded yet. Configure parameters above and click <strong>"Add Order to Batch Queue"</strong>, or click <strong>"Load Demo Records"</strong>.
          </td>
        </tr>
      `;
      if (batchTotalApplicants) batchTotalApplicants.textContent = '0';
      if (batchCountOrders) batchCountOrders.textContent = '0 orders';
      if (batchTotalRevenue) batchTotalRevenue.textContent = formatMoney(0);
      if (batchTotalCosts) batchTotalCosts.textContent = formatMoney(0);
      if (batchTotalProfit) batchTotalProfit.textContent = formatMoney(0);
      if (batchAvgMargin) batchAvgMargin.textContent = 'Margin: 0.0%';
      return;
    }

    let sumApplicants = 0;
    let sumRev = 0;
    let sumCost = 0;
    let sumProfit = 0;

    let rowsHtml = '';
    batchRecords.forEach((item, index) => {
      sumApplicants += item.applicants;
      sumRev += item.totalRev;
      sumCost += item.totalCost;
      sumProfit += item.totalNetProfit;

      const badgeClass = item.totalMargin >= 30 ? 'excellent' : item.totalMargin >= 10 ? 'moderate' : 'low';

      rowsHtml += `
        <tr>
          <td style="color: var(--text-tertiary); font-family: monospace;">${index + 1}</td>
          <td style="font-weight: 600;">${item.clientRef}</td>
          <td style="font-size: 0.825rem; color: var(--text-secondary);">${item.visaCategory}</td>
          <td style="text-align: center; font-weight: 700;">${item.applicants}</td>
          <td style="text-align: right; font-family: monospace;">${formatMoney(item.totalRev)}</td>
          <td style="text-align: right; font-family: monospace; color: var(--text-secondary);">${formatMoney(item.totalCost)}</td>
          <td style="text-align: right; font-family: monospace; font-weight: 700; color: ${item.totalNetProfit >= 0 ? 'var(--success)' : 'var(--danger)'};">
            ${(item.totalNetProfit >= 0 ? '+' : '') + formatMoney(item.totalNetProfit)}
          </td>
          <td style="text-align: center;">
            <span class="margin-badge ${badgeClass}" style="font-size: 0.7rem; padding: 0.15rem 0.45rem;">
              ${item.totalMargin.toFixed(1)}%
            </span>
          </td>
          <td style="text-align: center;">
            <button type="button" class="remove-batch-btn" data-index="${index}" title="Remove Order" aria-label="Remove Order">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </td>
        </tr>
      `;
    });

    batchTableBody.innerHTML = rowsHtml;

    // Attach row delete listeners
    const deleteButtons = batchTableBody.querySelectorAll('.remove-batch-btn');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.dataset.index, 10);
        batchRecords.splice(idx, 1);
        renderBatchTable();
      });
    });

    // Update Batch Aggregates
    const overallMargin = sumRev > 0 ? (sumProfit / sumRev) * 100 : 0;
    if (batchTotalApplicants) batchTotalApplicants.textContent = sumApplicants;
    if (batchCountOrders) batchCountOrders.textContent = `${batchRecords.length} order${batchRecords.length > 1 ? 's' : ''}`;
    if (batchTotalRevenue) batchTotalRevenue.textContent = formatMoney(sumRev);
    if (batchTotalCosts) batchTotalCosts.textContent = formatMoney(sumCost);
    if (batchTotalProfit) {
      batchTotalProfit.textContent = (sumProfit >= 0 ? '+' : '') + formatMoney(sumProfit);
      batchTotalProfit.className = 'kpi-val ' + (sumProfit >= 0 ? 'profit-positive' : 'profit-negative');
    }
    if (batchAvgMargin) batchAvgMargin.textContent = `Avg Margin: ${overallMargin.toFixed(2)}%`;
  }

  // Add to batch button
  if (btnAddBatch) {
    btnAddBatch.addEventListener('click', () => {
      const order = calculateCurrentOrder();
      batchRecords.push({
        id: Date.now(),
        ...order
      });
      renderBatchTable();

      // Show brief feedback on button
      const originalText = btnAddBatch.innerHTML;
      btnAddBatch.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #ffffff;">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Added to Batch!
      `;
      setTimeout(() => {
        btnAddBatch.innerHTML = originalText;
      }, 1500);
    });
  }

  // Clear batch button
  if (btnClearBatch) {
    btnClearBatch.addEventListener('click', () => {
      if (batchRecords.length === 0) return;
      if (confirm('Are you sure you want to clear all batch orders?')) {
        batchRecords = [];
        renderBatchTable();
      }
    });
  }

  // Load demo records
  if (btnLoadDemoBatch) {
    btnLoadDemoBatch.addEventListener('click', () => {
      batchRecords = [
        {
          id: 1,
          clientRef: 'Al-Mansoor Umrah Pilgrimage Group',
          visaCategory: 'Saudi Arabia Umrah E-Visa',
          applicants: 12,
          embassyFee: 120,
          agencyCharge: 80,
          docCost: 15,
          pricePerPax: 200,
          costPerPax: 135,
          totalRev: 2400,
          totalCost: 1620,
          totalNetProfit: 780,
          totalMargin: 32.50
        },
        {
          id: 2,
          clientRef: 'GlobalTech Exec Delegate (5 pax)',
          visaCategory: 'USA Tourist B1/B2 (MRV Consular)',
          applicants: 5,
          embassyFee: 185,
          agencyCharge: 150,
          docCost: 30,
          pricePerPax: 335,
          costPerPax: 215,
          totalRev: 1675,
          totalCost: 1075,
          totalNetProfit: 600,
          totalMargin: 35.82
        },
        {
          id: 3,
          clientRef: 'Elena & Marco Wedding Tour',
          visaCategory: 'Schengen Tourist (France/Germany/Italy)',
          applicants: 2,
          embassyFee: 88,
          agencyCharge: 120,
          docCost: 45,
          pricePerPax: 208,
          costPerPax: 133,
          totalRev: 416,
          totalCost: 266,
          totalNetProfit: 150,
          totalMargin: 36.06
        },
        {
          id: 4,
          clientRef: 'Kuala Lumpur Tech Summit',
          visaCategory: 'Malaysia Tourist E-Visa',
          applicants: 4,
          embassyFee: 30,
          agencyCharge: 40,
          docCost: 8,
          pricePerPax: 70,
          costPerPax: 38,
          totalRev: 280,
          totalCost: 152,
          totalNetProfit: 128,
          totalMargin: 45.71
        }
      ];
      renderBatchTable();
    });
  }

  // Export Batch as CSV
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', () => {
      if (batchRecords.length === 0) {
        alert('Batch queue is empty. Please add or load records before exporting.');
        return;
      }

      const headers = [
        'Batch_ID',
        'Client_Reference',
        'Visa_Category',
        'Applicants',
        'Embassy_Fee_USD',
        'Agency_Charge_USD',
        'Doc_Cost_USD',
        'Total_Revenue_USD',
        'Total_Cost_USD',
        'Net_Profit_USD',
        'Profit_Margin_Percent'
      ];

      const csvRows = [headers.join(',')];

      let totalApplicants = 0;
      let totalRevenue = 0;
      let totalCost = 0;
      let totalProfit = 0;

      batchRecords.forEach((item, index) => {
        totalApplicants += item.applicants;
        totalRevenue += item.totalRev;
        totalCost += item.totalCost;
        totalProfit += item.totalNetProfit;

        const safeRef = `"${item.clientRef.replace(/"/g, '""')}"`;
        const safeCat = `"${item.visaCategory.replace(/"/g, '""')}"`;

        const row = [
          index + 1,
          safeRef,
          safeCat,
          item.applicants,
          item.embassyFee.toFixed(2),
          item.agencyCharge.toFixed(2),
          item.docCost.toFixed(2),
          item.totalRev.toFixed(2),
          item.totalCost.toFixed(2),
          item.totalNetProfit.toFixed(2),
          item.totalMargin.toFixed(2)
        ];
        csvRows.push(row.join(','));
      });

      // Add summary row
      const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
      csvRows.push('');
      csvRows.push([
        'TOTALS',
        '"PORTFOLIO SUMMARY"',
        '""',
        totalApplicants,
        '',
        '',
        '',
        totalRevenue.toFixed(2),
        totalCost.toFixed(2),
        totalProfit.toFixed(2),
        avgMargin.toFixed(2)
      ].join(','));

      const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
      const downloadAnchor = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute('href', csvContent);
      downloadAnchor.setAttribute('download', `visa_profitability_report_${dateStr}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
    });
  }

  // Initial Calculation
  calculateCurrentOrder();
});