document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const form = document.getElementById('client-form');
  const editIdInput = document.getElementById('edit-id');
  const nameInput = document.getElementById('client-name');
  const emailInput = document.getElementById('client-email');
  const spendInput = document.getElementById('client-spend');
  const purchasesInput = document.getElementById('client-purchases');
  const lastActiveInput = document.getElementById('client-last-active');
  const categorySelect = document.getElementById('client-category');
  
  const submitBtn = document.getElementById('submit-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const loadDemoBtn = document.getElementById('load-demo-btn');
  const exportCsvBtn = document.getElementById('export-csv');
  const sortSelect = document.getElementById('sort-select');
  
  const clientsContainer = document.getElementById('clients-container');
  const emptyState = document.getElementById('empty-state');
  
  const statTotalClients = document.getElementById('stat-total-clients');
  const statTotalRevenue = document.getElementById('stat-total-revenue');
  const statAvgSpend = document.getElementById('stat-avg-spend');
  
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  // State
  let clients = JSON.parse(localStorage.getItem('vip_clients')) || [];

  // Initialize
  setTodayDate();
  renderDashboard();

  // Event Listeners
  form.addEventListener('submit', handleFormSubmit);
  cancelEditBtn.addEventListener('click', resetForm);
  loadDemoBtn.addEventListener('click', loadDemoData);
  exportCsvBtn.addEventListener('click', exportToCsv);
  sortSelect.addEventListener('change', renderDashboard);

  // Functions
  function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    lastActiveInput.value = today;
    lastActiveInput.max = today;
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    
    const clientData = {
      id: editIdInput.value || Date.now().toString(),
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      spend: parseFloat(spendInput.value),
      purchases: parseInt(purchasesInput.value, 10),
      lastActive: lastActiveInput.value,
      category: categorySelect.value,
      tier: calculateTier(parseFloat(spendInput.value))
    };

    if (editIdInput.value) {
      // Update existing
      const index = clients.findIndex(c => c.id === editIdInput.value);
      if (index !== -1) {
        clients[index] = clientData;
        showToast('Client updated successfully');
      }
    } else {
      // Add new
      clients.push(clientData);
      showToast('Client added successfully');
    }

    saveData();
    resetForm();
    renderDashboard();
  }

  function editClient(id) {
    const client = clients.find(c => c.id === id);
    if (!client) return;

    editIdInput.value = client.id;
    nameInput.value = client.name;
    emailInput.value = client.email;
    spendInput.value = client.spend;
    purchasesInput.value = client.purchases;
    lastActiveInput.value = client.lastActive;
    categorySelect.value = client.category;

    submitBtn.textContent = 'Update Client';
    cancelEditBtn.style.display = 'block';
    
    // Scroll to form
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function deleteClient(id) {
    if (confirm('Are you sure you want to delete this VIP client?')) {
      clients = clients.filter(c => c.id !== id);
      saveData();
      renderDashboard();
      showToast('Client deleted');
    }
  }

  function resetForm() {
    form.reset();
    editIdInput.value = '';
    submitBtn.textContent = 'Add Client';
    cancelEditBtn.style.display = 'none';
    setTodayDate();
  }

  function calculateTier(spend) {
    if (spend >= 100000) return 'Platinum';
    if (spend >= 50000) return 'Gold';
    if (spend >= 10000) return 'Silver';
    return 'Bronze';
  }

  function getTierClass(tier) {
    return 'tier-' + tier.toLowerCase();
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  }

  function saveData() {
    localStorage.setItem('vip_clients', JSON.stringify(clients));
  }

  function renderDashboard() {
    // 1. Update Stats
    const totalClients = clients.length;
    const totalRevenue = clients.reduce((sum, c) => sum + c.spend, 0);
    const avgSpend = totalClients > 0 ? totalRevenue / totalClients : 0;

    statTotalClients.textContent = totalClients;
    statTotalRevenue.textContent = formatCurrency(totalRevenue);
    statAvgSpend.textContent = formatCurrency(avgSpend);

    // 2. Sort Data
    const sortMethod = sortSelect.value;
    let sortedClients = [...clients];
    
    if (sortMethod === 'spend-desc') {
      sortedClients.sort((a, b) => b.spend - a.spend);
    } else if (sortMethod === 'spend-asc') {
      sortedClients.sort((a, b) => a.spend - b.spend);
    } else if (sortMethod === 'recent') {
      sortedClients.sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));
    } else if (sortMethod === 'name') {
      sortedClients.sort((a, b) => a.name.localeCompare(b.name));
    }

    // 3. Render Grid
    if (sortedClients.length === 0) {
      clientsContainer.innerHTML = '';
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
      clientsContainer.innerHTML = sortedClients.map(client => `
        <div class="client-card">
          <div class="tier-badge ${getTierClass(client.tier)}">${client.tier}</div>
          <div class="client-header">
            <div class="client-name">${client.name}</div>
            <div style="font-size: 0.85rem; color: var(--text-tertiary);">${client.email}</div>
          </div>
          <div class="client-detail">
            <span>Total Spend</span>
            <span class="gold-text">${formatCurrency(client.spend)}</span>
          </div>
          <div class="client-detail">
            <span>Purchases</span>
            <span>${client.purchases} orders</span>
          </div>
          <div class="client-detail">
            <span>Last Active</span>
            <span>${new Date(client.lastActive).toLocaleDateString()}</span>
          </div>
          <div class="client-detail">
            <span>Category</span>
            <span>${client.category}</span>
          </div>
          <div class="action-btns">
            <button class="action-btn edit" data-id="${client.id}">Edit</button>
            <button class="action-btn delete" data-id="${client.id}">Delete</button>
          </div>
        </div>
      `).join('');

      // Bind dynamic buttons
      document.querySelectorAll('.action-btn.edit').forEach(btn => {
        btn.addEventListener('click', (e) => editClient(e.target.dataset.id));
      });
      document.querySelectorAll('.action-btn.delete').forEach(btn => {
        btn.addEventListener('click', (e) => deleteClient(e.target.dataset.id));
      });
    }
  }

  function loadDemoData() {
    clients = [
      { id: 'demo1', name: 'Alexander Sterling', email: 'alex@sterling.co', spend: 125000, purchases: 14, lastActive: '2026-06-01', category: 'Watches', tier: 'Platinum' },
      { id: 'demo2', name: 'Victoria Roth', email: 'v.roth@luxury.net', spend: 85000, purchases: 8, lastActive: '2026-05-15', category: 'Jewelry', tier: 'Gold' },
      { id: 'demo3', name: 'James Winston', email: 'jwinston@capital.com', spend: 42000, purchases: 5, lastActive: '2026-06-10', category: 'Automotive', tier: 'Silver' },
      { id: 'demo4', name: 'Sophia Chen', email: 'schen@global.org', spend: 15000, purchases: 3, lastActive: '2026-04-20', category: 'Fashion', tier: 'Silver' },
      { id: 'demo5', name: 'Marcus Bell', email: 'marcus.b@mail.com', spend: 8500, purchases: 2, lastActive: '2026-05-28', category: 'Leather Goods', tier: 'Bronze' }
    ];
    saveData();
    renderDashboard();
    showToast('Demo data loaded');
  }

  function exportToCsv() {
    if (clients.length === 0) {
      showToast('No data to export');
      return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Name,Email,Total Spend,Purchases,Last Active,Category,Tier\n";
    
    clients.forEach(c => {
      let row = [
        `"${c.name}"`, 
        `"${c.email}"`, 
        c.spend, 
        c.purchases, 
        `"${c.lastActive}"`, 
        `"${c.category}"`, 
        `"${c.tier}"`
      ].join(",");
      csvContent += row + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "vip_clients_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported to CSV');
  }

  function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
});
