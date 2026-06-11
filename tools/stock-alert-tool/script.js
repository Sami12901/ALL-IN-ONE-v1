document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const inputs = {
    name: document.getElementById('val-name'),
    current: document.getElementById('val-current'),
    min: document.getElementById('val-min'),
    critical: document.getElementById('val-critical'),
    sales: document.getElementById('val-sales')
  };

  const results = {
    banner: document.getElementById('res-banner'),
    icon: document.getElementById('res-icon'),
    title: document.getElementById('res-title'),
    msg: document.getElementById('res-msg'),
    statusText: document.getElementById('res-status-text'),
    days: document.getElementById('res-days'),
    action: document.getElementById('res-action')
  };

  // Icons
  const icons = {
    safe: `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
    warning: `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    critical: `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`
  };

  // Calculate
  function calculate() {
    const current = parseInt(inputs.current.value) || 0;
    const min = parseInt(inputs.min.value) || 0;
    const critical = parseInt(inputs.critical.value) || 0;
    const sales = parseFloat(inputs.sales.value) || 0;
    const name = inputs.name.value || 'The product';

    let daysRemaining = 0;
    if (sales > 0) {
      daysRemaining = current / sales;
    }

    // Determine status
    let status = 'safe';
    if (current <= critical) {
      status = 'critical';
    } else if (current <= min) {
      status = 'warning';
    }

    // Update UI based on status
    results.banner.className = `alert-banner ${status}`;
    results.icon.innerHTML = icons[status];

    if (status === 'safe') {
      results.title.textContent = 'Stock is Safe';
      results.msg.textContent = `${current} units available. Above minimum threshold.`;
      results.statusText.textContent = 'Healthy';
      results.statusText.style.color = '#10b981';
      results.action.textContent = 'No immediate action required. Continue monitoring.';
      results.action.style.color = '#10b981';
    } else if (status === 'warning') {
      results.title.textContent = 'Reorder Soon';
      results.msg.textContent = `Stock is below the minimum threshold of ${min} units.`;
      results.statusText.textContent = 'Low Stock';
      results.statusText.style.color = '#f59e0b';
      results.action.textContent = `Place a new order for ${name} soon to prevent stockouts.`;
      results.action.style.color = '#f59e0b';
    } else {
      results.title.textContent = 'Critical Stock';
      results.msg.textContent = `Stock is at or below the critical threshold of ${critical} units.`;
      results.statusText.textContent = 'Danger / Out of Stock';
      results.statusText.style.color = '#ef4444';
      results.action.textContent = `URGENT: Reorder ${name} immediately!`;
      results.action.style.color = '#ef4444';
    }

    // Days remaining
    if (sales > 0) {
      if (current === 0) {
        results.days.textContent = '0 Days (Out of Stock)';
        results.days.style.color = '#ef4444';
      } else {
        results.days.textContent = `${Math.floor(daysRemaining)} Days`;
        if (daysRemaining <= 7) results.days.style.color = '#ef4444';
        else results.days.style.color = 'var(--text-primary)';
      }
    } else {
      results.days.textContent = 'N/A';
      results.days.style.color = 'var(--text-primary)';
    }
  }

  // Listeners
  Object.values(inputs).forEach(input => {
    input.addEventListener('input', calculate);
  });

  // Init
  calculate();
});
