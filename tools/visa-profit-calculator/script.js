document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    applicants: document.getElementById('applicants'),
    officialFee: document.getElementById('official-fee'),
    vfsFee: document.getElementById('vfs-fee'),
    agentCost: document.getElementById('agent-cost'),
    miscCost: document.getElementById('misc-cost'),
    customerCharge: document.getElementById('customer-charge'),
    
    calculateBtn: document.getElementById('calculate-btn'),
    
    resCost: document.getElementById('res-cost'),
    resRevenue: document.getElementById('res-revenue'),
    resProfit: document.getElementById('res-profit'),
    resMargin: document.getElementById('res-margin'),
    breakdownList: document.getElementById('breakdown-list')
  };

  function calculateProfit() {
    const apps = parseInt(elements.applicants.value) || 1;
    
    const offFee = parseFloat(elements.officialFee.value) || 0;
    const vfsFee = parseFloat(elements.vfsFee.value) || 0;
    const agCost = parseFloat(elements.agentCost.value) || 0;
    const mCost = parseFloat(elements.miscCost.value) || 0; // Total, not per person
    
    const custChg = parseFloat(elements.customerCharge.value) || 0;

    // Calculations
    const perPersonCost = offFee + vfsFee + agCost;
    const totalPerPersonCost = perPersonCost * apps;
    const totalCost = totalPerPersonCost + mCost;
    
    const totalRevenue = custChg * apps;
    const netProfit = totalRevenue - totalCost;
    
    let margin = 0;
    if (totalRevenue > 0) {
      margin = (netProfit / totalRevenue) * 100;
    }

    // Format Currency
    const fmt = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(num).replace('BDT', '৳');

    // Update UI
    elements.resCost.innerText = fmt(totalCost);
    elements.resRevenue.innerText = fmt(totalRevenue);
    
    elements.resProfit.innerText = fmt(netProfit);
    elements.resMargin.innerText = `Margin: ${margin.toFixed(2)}%`;
    
    if (netProfit < 0) {
      elements.resProfit.style.color = '#ef4444';
      elements.resProfit.parentElement.style.borderColor = 'rgba(239, 68, 68, 0.3)';
      elements.resProfit.parentElement.style.background = 'rgba(239, 68, 68, 0.1)';
      elements.resProfit.previousElementSibling.style.color = '#ef4444';
      elements.resProfit.previousElementSibling.innerText = 'Net Loss';
    } else {
      elements.resProfit.style.color = '#10b981';
      elements.resProfit.parentElement.style.borderColor = 'rgba(16, 185, 129, 0.3)';
      elements.resProfit.parentElement.style.background = 'rgba(16, 185, 129, 0.1)';
      elements.resProfit.previousElementSibling.style.color = '#10b981';
      elements.resProfit.previousElementSibling.innerText = 'Net Profit';
    }

    // Breakdown List
    elements.breakdownList.innerHTML = `
      <li style="display: flex; justify-content: space-between;">
        <span>Applicants:</span> <strong>${apps}</strong>
      </li>
      <li style="display: flex; justify-content: space-between;">
        <span>Total Official Fees (${apps} x ${fmt(offFee)}):</span> <strong>${fmt(offFee * apps)}</strong>
      </li>
      <li style="display: flex; justify-content: space-between;">
        <span>Total VFS/Processing Fees (${apps} x ${fmt(vfsFee)}):</span> <strong>${fmt(vfsFee * apps)}</strong>
      </li>
      <li style="display: flex; justify-content: space-between;">
        <span>Total Agent Costs (${apps} x ${fmt(agCost)}):</span> <strong>${fmt(agCost * apps)}</strong>
      </li>
      <li style="display: flex; justify-content: space-between;">
        <span>Misc Costs (Total):</span> <strong>${fmt(mCost)}</strong>
      </li>
      <li style="display: flex; justify-content: space-between; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--border);">
        <span><strong>Total Processing Cost:</strong></span> <strong style="color: #ef4444;">${fmt(totalCost)}</strong>
      </li>
      <li style="display: flex; justify-content: space-between;">
        <span><strong>Total Billed to Customer:</strong></span> <strong style="color: #10b981;">${fmt(totalRevenue)}</strong>
      </li>
    `;
  }

  elements.calculateBtn.addEventListener('click', calculateProfit);
  
  // Calculate on input change
  const inputs = document.querySelectorAll('.input-element');
  inputs.forEach(inp => {
    inp.addEventListener('input', calculateProfit);
  });

  // Initial Calculation
  calculateProfit();
});
