document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const form = document.getElementById('passport-form');
  const nameInput = document.getElementById('p-name');
  const numberInput = document.getElementById('p-number');
  const expiryInput = document.getElementById('p-expiry');
  const departureInput = document.getElementById('p-departure');
  
  const tbody = document.getElementById('passport-tbody');
  const emptyState = document.getElementById('empty-state');
  const clearBtn = document.getElementById('clear-btn');
  
  const statTotal = document.getElementById('stat-total');
  const statValid = document.getElementById('stat-valid');
  const statWarning = document.getElementById('stat-warning');
  const statExpired = document.getElementById('stat-expired');

  // State
  let passports = JSON.parse(localStorage.getItem('passport_list')) || [];

  // Init
  renderTable();

  // Events
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newPassport = {
      id: Date.now().toString(),
      name: nameInput.value.trim(),
      number: numberInput.value.trim().toUpperCase(),
      expiry: expiryInput.value,
      departure: departureInput.value || null
    };
    
    passports.push(newPassport);
    saveData();
    renderTable();
    form.reset();
    nameInput.focus();
  });

  clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all passport records?')) {
      passports = [];
      saveData();
      renderTable();
    }
  });

  // Calculate Status
  function getStatus(expiryStr, departureStr) {
    const expiryDate = new Date(expiryStr);
    
    // Use departure date if provided, otherwise use today's date
    const referenceDate = departureStr ? new Date(departureStr) : new Date();
    
    // Normalize times
    expiryDate.setHours(0, 0, 0, 0);
    referenceDate.setHours(0, 0, 0, 0);
    
    const diffTime = expiryDate - referenceDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = diffDays / 30.44; // average days in month
    
    if (diffTime < 0) {
      return { class: 'badge-expired', text: 'Expired' };
    } else if (diffMonths < 6) {
      return { class: 'badge-warning', text: '< 6 Months' };
    } else {
      return { class: 'badge-valid', text: 'Valid' };
    }
  }

  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function deleteRecord(id) {
    passports = passports.filter(p => p.id !== id);
    saveData();
    renderTable();
  }

  function saveData() {
    localStorage.setItem('passport_list', JSON.stringify(passports));
  }

  function renderTable() {
    let validCount = 0;
    let warningCount = 0;
    let expiredCount = 0;
    
    tbody.innerHTML = '';
    
    // Sort by Expiry Date (nearest first)
    passports.sort((a, b) => new Date(a.expiry) - new Date(b.expiry));

    if (passports.length === 0) {
      emptyState.style.display = 'block';
      tbody.parentElement.style.display = 'none';
    } else {
      emptyState.style.display = 'none';
      tbody.parentElement.style.display = 'table';
      
      passports.forEach(p => {
        const status = getStatus(p.expiry, p.departure);
        
        if (status.text === 'Valid') validCount++;
        else if (status.text === '< 6 Months') warningCount++;
        else expiredCount++;
        
        let departureHtml = '';
        if (p.departure) {
          departureHtml = `<div style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 0.2rem;">Ref: ${formatDate(p.departure)}</div>`;
        }
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="font-weight: 600;">${p.name}</td>
          <td style="font-family: monospace; font-size: 0.95rem;">${p.number}</td>
          <td>
            ${formatDate(p.expiry)}
            ${departureHtml}
          </td>
          <td><span class="status-badge ${status.class}">${status.text}</span></td>
          <td>
            <button class="action-btn" onclick="document.dispatchEvent(new CustomEvent('deletePassport', {detail: '${p.id}'}))">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    // Update Stats
    statTotal.textContent = passports.length;
    statValid.textContent = validCount;
    statWarning.textContent = warningCount;
    statExpired.textContent = expiredCount;
  }

  // Global listener for dynamic delete buttons
  document.addEventListener('deletePassport', (e) => {
    deleteRecord(e.detail);
  });
});
