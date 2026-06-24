document.addEventListener('DOMContentLoaded', () => {
  // --- UI Elements ---
  const uploadView = document.getElementById('upload-view');
  const dashboardView = document.getElementById('dashboard-view');
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const btnDemo = document.getElementById('btn-demo');
  const btnReset = document.getElementById('btn-reset');
  const datasetTitle = document.getElementById('dataset-title');

  const kpiRevenue = document.getElementById('kpi-revenue');
  const kpiUnits = document.getElementById('kpi-units');
  const kpiTopProduct = document.getElementById('kpi-top-product');
  const kpiLowProduct = document.getElementById('kpi-low-product');

  const dataTableBody = document.querySelector('#data-table tbody');

  let revenueChartInstance = null;
  let unitsChartInstance = null;

  // Chart.js global defaults for dark theme
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
  Chart.defaults.font.family = "'Inter', sans-serif";

  // --- Initialize ---
  init();

  function init() {
    setupDropZone();
    
    btnDemo.addEventListener('click', loadDemoData);
    btnReset.addEventListener('click', resetView);
  }

  // --- File Upload ---
  function setupDropZone() {
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', e => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files[0]) handleFile(fileInput.files[0]);
    });
  }

  function handleFile(file) {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a valid CSV file.');
      return;
    }

    datasetTitle.textContent = file.name;
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function(results) {
        processData(results.data);
      },
      error: function(error) {
        alert('Error parsing CSV: ' + error.message);
      }
    });
  }

  function loadDemoData() {
    datasetTitle.textContent = "Demo Dataset (Q3 Sales)";
    
    const demoCsv = `Product Name,Price,Quantity Sold
Premium Wireless Headphones,299.99,145
Mechanical Keyboard,149.50,312
Ergonomic Mouse,79.99,428
4K Monitor 27",399.00,89
Laptop Stand,45.00,560
USB-C Hub,65.99,340
Webcam 1080p,89.99,215
Desk Mat,25.50,610
Studio Microphone,129.99,105
Ring Light,49.99,180`;

    Papa.parse(demoCsv, {
      header: true,
      skipEmptyLines: true,
      complete: function(results) {
        processData(results.data);
      }
    });
  }

  // --- Data Processing ---
  function processData(data) {
    // Expected columns: Product Name, Price, Quantity Sold
    // We need to map actual columns to expected conceptually
    
    if (!data || data.length === 0) {
      alert('The CSV file is empty.');
      return;
    }

    // Try to auto-detect columns
    const cols = Object.keys(data[0]);
    let nameCol = cols.find(c => c.toLowerCase().includes('name') || c.toLowerCase().includes('product')) || cols[0];
    let priceCol = cols.find(c => c.toLowerCase().includes('price') || c.toLowerCase().includes('cost')) || cols[1];
    let qtyCol = cols.find(c => c.toLowerCase().includes('qty') || c.toLowerCase().includes('quant') || c.toLowerCase().includes('sold')) || cols[2];

    if (!nameCol || !priceCol || !qtyCol) {
      alert('Could not identify required columns. Ensure you have Product Name, Price, and Quantity Sold columns.');
      return;
    }

    let products = [];
    let totalRevenue = 0;
    let totalUnits = 0;

    data.forEach(row => {
      const name = row[nameCol];
      const price = parseFloat(row[priceCol]?.replace(/[^0-9.-]+/g,"")) || 0;
      const qty = parseInt(row[qtyCol]) || 0;
      const revenue = price * qty;

      if (name) {
        products.push({ name, price, qty, revenue });
        totalRevenue += revenue;
        totalUnits += qty;
      }
    });

    if (products.length === 0) {
      alert('No valid product rows found.');
      return;
    }

    // Sort by revenue descending
    products.sort((a, b) => b.revenue - a.revenue);

    // Calculate metrics
    const topProduct = products[0];
    const lowProduct = products[products.length - 1];

    // Update UI
    kpiRevenue.textContent = formatCurrency(totalRevenue);
    kpiUnits.textContent = totalUnits.toLocaleString();
    kpiTopProduct.textContent = topProduct.name;
    kpiTopProduct.title = `${formatCurrency(topProduct.revenue)} revenue`;
    kpiLowProduct.textContent = lowProduct.name;
    kpiLowProduct.title = `${formatCurrency(lowProduct.revenue)} revenue`;

    renderTable(products, totalRevenue);
    renderCharts(products);

    uploadView.style.display = 'none';
    dashboardView.style.display = 'block';
  }

  function renderTable(products, totalRevenue) {
    dataTableBody.innerHTML = '';
    
    products.forEach(p => {
      const pct = totalRevenue > 0 ? ((p.revenue / totalRevenue) * 100).toFixed(1) : 0;
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${p.name}</strong></td>
        <td style="text-align: right;">${formatCurrency(p.price)}</td>
        <td style="text-align: right;">${p.qty.toLocaleString()}</td>
        <td style="text-align: right; color: var(--accent); font-weight: 600;">${formatCurrency(p.revenue)}</td>
        <td style="text-align: right;">${pct}%</td>
      `;
      dataTableBody.appendChild(tr);
    });
  }

  function renderCharts(products) {
    // Limit to top 10 for charts to keep it clean
    const chartData = products.slice(0, 10);
    
    const labels = chartData.map(p => p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name);
    const revenueData = chartData.map(p => p.revenue);
    const unitsData = chartData.map(p => p.qty);

    // Brand Colors
    const primaryColor = '#6366f1';
    const primaryColorAlpha = 'rgba(99, 102, 241, 0.6)';
    const secondaryColor = '#ec4899';
    const secondaryColorAlpha = 'rgba(236, 72, 153, 0.6)';

    // 1. Revenue Chart (Bar)
    if (revenueChartInstance) revenueChartInstance.destroy();
    const revCtx = document.getElementById('revenue-chart').getContext('2d');
    
    // Create gradient
    const gradient = revCtx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, primaryColorAlpha);
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.1)');

    revenueChartInstance = new Chart(revCtx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Revenue ($)',
          data: revenueData,
          backgroundColor: gradient,
          borderColor: primaryColor,
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return formatCurrency(context.raw);
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + (value > 1000 ? value/1000 + 'k' : value);
              }
            }
          }
        }
      }
    });

    // 2. Units Chart (Doughnut)
    if (unitsChartInstance) unitsChartInstance.destroy();
    const unitsCtx = document.getElementById('units-chart').getContext('2d');
    
    // Generate some harmonious colors
    const colors = [
      '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', 
      '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#0ea5e9'
    ];

    unitsChartInstance = new Chart(unitsCtx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: unitsData,
          backgroundColor: colors.slice(0, unitsData.length),
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  // --- Utils ---
  function resetView() {
    fileInput.value = '';
    dashboardView.style.display = 'none';
    uploadView.style.display = 'block';
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }
});
