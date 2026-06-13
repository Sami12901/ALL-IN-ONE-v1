document.addEventListener('DOMContentLoaded', () => {
  const uploadArea = document.getElementById('upload-area');
  const fileInput = document.getElementById('file-input');
  const loadingState = document.getElementById('loading-state');
  const dashboard = document.getElementById('dashboard');
  const uploadSection = document.getElementById('upload-section');
  const btnNewAnalysis = document.getElementById('btn-new-analysis');

  // Chart instances
  let revenueChartInstance = null;
  let profitChartInstance = null;

  // File Upload Handlers
  uploadArea.addEventListener('click', () => fileInput.click());

  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  });

  btnNewAnalysis.addEventListener('click', () => {
    dashboard.style.display = 'none';
    uploadSection.style.display = 'block';
    fileInput.value = '';
    
    if (revenueChartInstance) revenueChartInstance.destroy();
    if (profitChartInstance) profitChartInstance.destroy();
  });

  function processFile(file) {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      alert('Please upload an Excel or CSV file.');
      return;
    }

    uploadSection.style.display = 'none';
    loadingState.style.display = 'block';

    const reader = new FileReader();
    reader.onload = function(e) {
      // Use setTimeout to allow the UI to update the loading spinner before heavy parsing
      setTimeout(() => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Parse to JSON. defval ensures empty cells are handled.
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });
          
          if (jsonData.length === 0) {
            throw new Error("The uploaded sheet appears to be empty.");
          }

          analyzeData(jsonData);
        } catch (err) {
          console.error(err);
          alert('Error processing file: ' + err.message);
          loadingState.style.display = 'none';
          uploadSection.style.display = 'block';
        }
      }, 100);
    };
    reader.onerror = function() {
      alert('Failed to read file.');
      loadingState.style.display = 'none';
      uploadSection.style.display = 'block';
    };
    reader.readAsArrayBuffer(file);
  }

  function detectColumns(firstRow) {
    const keys = Object.keys(firstRow);
    const cols = {
      product: null,
      sales: null,
      profit: null,
      quantity: null
    };

    keys.forEach(key => {
      const lower = key.toLowerCase().trim();
      if (!cols.product && (lower.includes('product') || lower.includes('item') || lower === 'name')) {
        cols.product = key;
      }
      if (!cols.sales && (lower.includes('sales') || lower.includes('revenue') || lower.includes('total amount'))) {
        cols.sales = key;
      }
      if (!cols.profit && lower.includes('profit')) {
        cols.profit = key;
      }
      if (!cols.quantity && (lower.includes('quantity') || lower.includes('qty'))) {
        cols.quantity = key;
      }
    });

    return cols;
  }

  function analyzeData(data) {
    if (data.length === 0) return;
    
    const cols = detectColumns(data[0]);
    if (!cols.product || !cols.sales) {
      alert("Could not detect 'Product Name' or 'Sales/Revenue' columns in the dataset.");
      loadingState.style.display = 'none';
      uploadSection.style.display = 'block';
      return;
    }

    const productMap = new Map();
    let totalRevenue = 0;
    let totalProfit = 0;
    let totalQty = 0;

    // Efficient loop for 100k+ rows
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      let productName = row[cols.product];
      
      if (!productName) continue;
      productName = String(productName).trim();

      const sales = parseFloat(row[cols.sales]) || 0;
      const profit = cols.profit ? (parseFloat(row[cols.profit]) || 0) : 0;
      const qty = cols.quantity ? (parseFloat(row[cols.quantity]) || 1) : 1;

      totalRevenue += sales;
      totalProfit += profit;
      totalQty += qty;

      if (productMap.has(productName)) {
        const p = productMap.get(productName);
        p.sales += sales;
        p.profit += profit;
        p.qty += qty;
      } else {
        productMap.set(productName, {
          name: productName,
          sales: sales,
          profit: profit,
          qty: qty
        });
      }
    }

    const productsArray = Array.from(productMap.values());
    
    // Best Sellers by Revenue
    const bestSellers = [...productsArray].sort((a, b) => b.sales - a.sales).slice(0, 10);
    
    // Worst Sellers by Profit (if profit exists), else by Sales ascending
    let worstSellers = [];
    if (cols.profit) {
      worstSellers = [...productsArray].sort((a, b) => a.profit - b.profit).slice(0, 10);
    } else {
      worstSellers = [...productsArray].sort((a, b) => a.sales - b.sales).slice(0, 10);
    }

    renderDashboard({
      totalRevenue,
      totalProfit,
      totalQty,
      uniqueProducts: productsArray.length,
      bestSellers,
      worstSellers,
      hasProfit: !!cols.profit
    });
  }

  function formatMoney(amount) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }
  function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
  }

  function renderDashboard(metrics) {
    loadingState.style.display = 'none';
    dashboard.style.display = 'block';

    // Top Metrics
    document.getElementById('val-revenue').innerText = formatMoney(metrics.totalRevenue);
    document.getElementById('val-profit').innerText = formatMoney(metrics.totalProfit);
    document.getElementById('val-qty').innerText = formatNumber(metrics.totalQty);
    document.getElementById('val-products').innerText = formatNumber(metrics.uniqueProducts);

    // Render Tables
    const bestTbody = document.querySelector('#table-best-sellers tbody');
    bestTbody.innerHTML = metrics.bestSellers.map((p, i) => `
      <tr>
        <td><span class="rank-badge">${i + 1}</span></td>
        <td style="font-weight: 500;">${p.name}</td>
        <td style="color: var(--theme-primary); font-weight: 600;">${formatMoney(p.sales)}</td>
        <td style="${p.profit < 0 ? 'color: var(--danger);' : 'color: var(--success);'}">${formatMoney(p.profit)}</td>
        <td>${formatNumber(p.qty)}</td>
      </tr>
    `).join('');

    const worstTbody = document.querySelector('#table-worst-sellers tbody');
    worstTbody.innerHTML = metrics.worstSellers.map((p, i) => `
      <tr>
        <td><span class="rank-badge" style="background: rgba(239, 68, 68, 0.2); color: var(--danger);">${i + 1}</span></td>
        <td style="font-weight: 500;">${p.name}</td>
        <td>${formatMoney(p.sales)}</td>
        <td style="${p.profit < 0 ? 'color: var(--danger); font-weight: 600;' : ''}">${formatMoney(p.profit)}</td>
        <td>${formatNumber(p.qty)}</td>
      </tr>
    `).join('');

    // Charts
    renderCharts(metrics.bestSellers, metrics.worstSellers, metrics.hasProfit);
  }

  function renderCharts(bestSellers, worstSellers, hasProfit) {
    const ctxRevenue = document.getElementById('revenueChart').getContext('2d');
    const ctxProfit = document.getElementById('profitChart').getContext('2d');

    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Inter', sans-serif";

    revenueChartInstance = new Chart(ctxRevenue, {
      type: 'bar',
      data: {
        labels: bestSellers.map(p => p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name),
        datasets: [{
          label: 'Revenue (Top 10)',
          data: bestSellers.map(p => p.sales),
          backgroundColor: 'rgba(79, 70, 229, 0.7)',
          borderColor: 'rgba(79, 70, 229, 1)',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Top 10 Products by Revenue', color: '#f8fafc', font: { size: 16 } }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } },
          x: { grid: { display: false } }
        }
      }
    });

    const profitData = hasProfit ? worstSellers : bestSellers;
    const profitLabel = hasProfit ? 'Profit (Worst 10)' : 'Quantity (Top 10)';
    const profitKey = hasProfit ? 'profit' : 'qty';
    const profitColors = profitData.map(p => p[profitKey] < 0 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(16, 185, 129, 0.7)');
    const profitBorders = profitData.map(p => p[profitKey] < 0 ? 'rgba(239, 68, 68, 1)' : 'rgba(16, 185, 129, 1)');

    profitChartInstance = new Chart(ctxProfit, {
      type: 'bar',
      data: {
        labels: profitData.map(p => p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name),
        datasets: [{
          label: profitLabel,
          data: profitData.map(p => p[profitKey]),
          backgroundColor: profitColors,
          borderColor: profitBorders,
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: true, text: hasProfit ? 'Bottom 10 Products by Profit' : 'Top 10 Products by Quantity', color: '#f8fafc', font: { size: 16 } }
        },
        scales: {
          y: { grid: { color: 'rgba(255,255,255,0.05)' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

});
