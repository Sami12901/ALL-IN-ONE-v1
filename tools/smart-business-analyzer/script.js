let parsedData = [];
let chartInstances = {};

document.addEventListener('DOMContentLoaded', () => {
  const analyzeBtn = document.getElementById('analyze-btn');
  const clearBtn = document.getElementById('clear-btn');
  const dataInput = document.getElementById('data-input');
  const profileSelector = document.getElementById('profile-selector');
  const dashboardSection = document.getElementById('dashboard-section');

  // Metrics
  const mRecords = document.getElementById('m-records');
  const mRevenue = document.getElementById('m-revenue');
  const mExpenses = document.getElementById('m-expenses');
  const mProfit = document.getElementById('m-profit');
  const mMissing = document.getElementById('m-missing');
  const mQuality = document.getElementById('m-quality');

  analyzeBtn.addEventListener('click', () => {
    const rawText = dataInput.value.trim();
    if (!rawText) return;
    
    const profile = profileSelector.value;
    parseAndAnalyze(rawText, profile);
    dashboardSection.style.display = 'block';
  });

  clearBtn.addEventListener('click', () => {
    dataInput.value = '';
    dashboardSection.style.display = 'none';
    parsedData = [];
  });

  // Export Handlers
  document.getElementById('export-excel').addEventListener('click', () => exportData('xlsx'));
  document.getElementById('export-csv').addEventListener('click', () => exportData('csv'));
  document.getElementById('export-json').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(parsedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smart_analysis_export.json';
    a.click();
  });
  document.getElementById('export-pdf').addEventListener('click', exportPDF);

  function parseAndAnalyze(text, profile) {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    parsedData = [];
    
    let totalRevenue = 0;
    let totalExpenses = 0;
    let missingCount = 0;

    // Detect delimiter
    let delimiter = ',';
    if (lines[0].includes('=')) delimiter = '=';
    else if (lines[0].includes('-')) delimiter = '-';
    else if (lines[0].includes('\t')) delimiter = '\t';

    lines.forEach(line => {
      const parts = line.split(delimiter).map(p => p.trim());
      if (parts.length < 2) {
        missingCount++;
        return;
      }
      
      const key = parts[0];
      let val = parseFloat(parts[1].replace(/[^0-9.-]+/g,""));
      if (isNaN(val)) {
        val = 0;
        missingCount++;
      }

      let type = 'revenue'; // default

      if (profile === 'ecommerce') {
        // Assume key is product, val is orders/revenue
        totalRevenue += val;
      } else if (profile === 'travel') {
        // Look for keywords
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('fee') || lowerKey.includes('cost') || lowerKey.includes('expense')) {
          totalExpenses += val;
          type = 'expense';
        } else {
          totalRevenue += val;
        }
      } else {
        // General or Luxury
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('expense') || lowerKey.includes('cost') || lowerKey.includes('loss')) {
          totalExpenses += val;
          type = 'expense';
        } else {
          totalRevenue += val;
        }
      }

      parsedData.push({
        Label: key,
        Value: val,
        Type: type
      });
    });

    const records = parsedData.length;
    const profit = totalRevenue - totalExpenses;
    const quality = records === 0 ? 0 : Math.round(((records - missingCount) / records) * 100);

    // Update UI
    mRecords.innerText = records;
    mRevenue.innerText = '$' + totalRevenue.toLocaleString();
    mExpenses.innerText = '$' + totalExpenses.toLocaleString();
    mProfit.innerText = '$' + profit.toLocaleString();
    mMissing.innerText = missingCount;
    mQuality.innerText = quality + '%';

    renderCharts(totalRevenue, totalExpenses);
  }

  function renderCharts(rev, exp) {
    // Destroy old charts
    if (chartInstances.pie) chartInstances.pie.destroy();
    if (chartInstances.bar) chartInstances.bar.destroy();
    if (chartInstances.line) chartInstances.line.destroy();

    const pieCtx = document.getElementById('pieChart').getContext('2d');
    const barCtx = document.getElementById('barChart').getContext('2d');
    const lineCtx = document.getElementById('lineChart').getContext('2d');

    // Pie Chart: Top 5 Items
    const topItems = [...parsedData].sort((a,b) => b.Value - a.Value).slice(0, 5);
    const pieLabels = topItems.map(i => i.Label);
    const pieData = topItems.map(i => i.Value);

    chartInstances.pie = new Chart(pieCtx, {
      type: 'doughnut',
      data: {
        labels: pieLabels.length ? pieLabels : ['No Data'],
        datasets: [{
          data: pieData.length ? pieData : [1],
          backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
          borderWidth: 0
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: {color: '#9ca3af'} } } }
    });

    // Bar Chart: Revenue vs Expense
    chartInstances.bar = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: ['Financial Overview'],
        datasets: [
          { label: 'Revenue', data: [rev], backgroundColor: '#10b981' },
          { label: 'Expenses', data: [exp], backgroundColor: '#ef4444' }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { ticks: { color: '#9ca3af' } }, x: { ticks: { color: '#9ca3af' } } }, plugins: { legend: { labels: {color: '#9ca3af'} } } }
    });

    // Line Chart: Trend (Simulated chronologically from top to bottom of data)
    chartInstances.line = new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: parsedData.map((_, i) => `Entry ${i+1}`),
        datasets: [{
          label: 'Value Trend',
          data: parsedData.map(d => d.Value),
          borderColor: '#6366f1',
          tension: 0.4,
          fill: true,
          backgroundColor: 'rgba(99, 102, 241, 0.1)'
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { ticks: { color: '#9ca3af' } }, x: { ticks: { color: '#9ca3af' }, display: false } }, plugins: { legend: { labels: {color: '#9ca3af'} } } }
    });
  }

  function exportData(format) {
    if (!parsedData.length) return alert("No data to export!");
    const ws = XLSX.utils.json_to_sheet(parsedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Analysis");
    XLSX.writeFile(wb, `smart_business_report.${format}`);
  }

  function exportPDF() {
    if (!parsedData.length) return alert("No data to export!");
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Smart Business Analyzer Report", 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Total Records: ${parsedData.length}`, 14, 32);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);

    const tableData = parsedData.map(row => [row.Label, row.Value, row.Type]);
    
    doc.autoTable({
      startY: 50,
      head: [['Label / Name', 'Value / Amount', 'Category Type']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] }
    });

    doc.save('business_report.pdf');
  }
});
