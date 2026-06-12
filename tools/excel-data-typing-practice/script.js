document.addEventListener('DOMContentLoaded', () => {
  const datasets = {
    sales: {
      headers: ["Order ID", "Date", "Region", "Rep", "Item", "Units", "Unit Cost", "Total"],
      data: [
        ["1001", "1/6/2026", "East", "Jones", "Pencil", "95", "1.99", "189.05"],
        ["1002", "1/23/2026", "Central", "Kivell", "Binder", "50", "19.99", "999.50"],
        ["1003", "2/9/2026", "Central", "Jardine", "Pencil", "36", "4.99", "179.64"],
        ["1004", "2/26/2026", "Central", "Gill", "Pen", "27", "19.99", "539.73"],
        ["1005", "3/15/2026", "West", "Sorvino", "Desk", "2", "275.00", "550.00"],
        ["1006", "4/1/2026", "East", "Jones", "Binder", "60", "4.99", "299.40"],
        ["1007", "4/18/2026", "Central", "Andrews", "Pencil", "75", "1.99", "149.25"],
        ["1008", "5/5/2026", "Central", "Jardine", "Pencil", "90", "4.99", "449.10"],
        ["1009", "5/22/2026", "West", "Thompson", "Pencil", "32", "1.99", "63.68"],
        ["1010", "6/8/2026", "East", "Jones", "Binder", "60", "8.99", "539.40"]
      ]
    },
    inventory: {
      headers: ["SKU", "Product Name", "Category", "In Stock", "Location", "Last Restock"],
      data: [
        ["SKU-001", "Wireless Mouse", "Electronics", "142", "Aisle 4", "05/12/26"],
        ["SKU-002", "Mechanical Keyboard", "Electronics", "38", "Aisle 4", "05/10/26"],
        ["SKU-003", "Ergonomic Chair", "Furniture", "12", "Aisle 9", "04/28/26"],
        ["SKU-004", "Desk Lamp", "Office", "85", "Aisle 2", "06/01/26"],
        ["SKU-005", "Notebook Pack", "Stationery", "340", "Aisle 1", "06/05/26"],
        ["SKU-006", "Gel Pens (12pk)", "Stationery", "210", "Aisle 1", "06/02/26"],
        ["SKU-007", "Standing Desk", "Furniture", "5", "Aisle 9", "03/15/26"],
        ["SKU-008", "USB-C Hub", "Electronics", "94", "Aisle 4", "05/20/26"],
        ["SKU-009", "Webcam 1080p", "Electronics", "47", "Aisle 5", "05/22/26"],
        ["SKU-010", "Mouse Pad Large", "Accessories", "156", "Aisle 3", "06/10/26"]
      ]
    },
    contacts: {
      headers: ["Customer ID", "First Name", "Last Name", "Company", "City", "Phone"],
      data: [
        ["CUST-501", "James", "Butt", "Benton, John B Jr", "New Orleans", "504-621-8927"],
        ["CUST-502", "Josephine", "Darakjy", "Chanay, Jeffrey A", "Brighton", "810-292-9388"],
        ["CUST-503", "Art", "Venere", "Chemel, James L", "Bridgeport", "856-636-8749"],
        ["CUST-504", "Lenna", "Paprocki", "Feltz Printing", "Anchorage", "907-385-4412"],
        ["CUST-505", "Donette", "Foller", "Printing Dimensions", "Hamilton", "513-570-1893"],
        ["CUST-506", "Simona", "Morasca", "Chapman, Ross E", "Ashland", "419-503-2484"],
        ["CUST-507", "Mitsue", "Tollner", "Morlong Associates", "Chicago", "773-573-6914"],
        ["CUST-508", "Leota", "Dilliard", "Commercial Press", "San Jose", "408-752-3500"],
        ["CUST-509", "Sage", "Wieser", "Truhlar And Truhlar", "Sioux Falls", "605-414-2147"],
        ["CUST-510", "Kris", "Marrier", "King, Christopher", "Baltimore", "410-655-8723"]
      ]
    }
  };

  const elements = {
    datasetSelect: document.getElementById('dataset-select'),
    startBtn: document.getElementById('start-btn'),
    refTable: document.getElementById('reference-table'),
    inputTable: document.getElementById('input-table'),
    
    statCells: document.getElementById('stat-cells'),
    statTime: document.getElementById('stat-time'),
    statAcc: document.getElementById('stat-acc'),
    
    modal: document.getElementById('results-modal'),
    finalTime: document.getElementById('final-time'),
    finalAcc: document.getElementById('final-acc'),
    tryAgainBtn: document.getElementById('try-again-btn')
  };

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let activeDataset = null;
  let totalCells = 0;
  let completedCells = 0;
  let correctCells = 0;
  
  let timerInterval = null;
  let timeElapsed = 0;
  let isPlaying = false;

  function renderTables() {
    const dsKey = elements.datasetSelect.value;
    activeDataset = datasets[dsKey];
    const { headers, data } = activeDataset;

    totalCells = data.length * headers.length;
    completedCells = 0;
    correctCells = 0;
    elements.statCells.innerText = `0/${totalCells}`;
    elements.statAcc.innerText = '100%';

    // Build Reference Table
    let refHtml = '<tr><th></th>';
    headers.forEach((h, i) => {
      refHtml += `<th>${alphabet[i] || i}</th>`;
    });
    refHtml += '</tr><tr><th>1</th>';
    headers.forEach(h => {
      refHtml += `<th style="background:#e2e8f0;">${h}</th>`;
    });
    refHtml += '</tr>';

    data.forEach((row, rowIndex) => {
      refHtml += `<tr><th>${rowIndex + 2}</th>`;
      row.forEach(cell => {
        refHtml += `<td>${cell}</td>`;
      });
      refHtml += '</tr>';
    });
    elements.refTable.innerHTML = refHtml;

    // Build Input Table
    let inHtml = '<tr><th></th>';
    headers.forEach((h, i) => {
      inHtml += `<th>${alphabet[i] || i}</th>`;
    });
    inHtml += '</tr><tr><th>1</th>';
    headers.forEach(h => {
      inHtml += `<th style="background:#e2e8f0;">${h}</th>`;
    });
    inHtml += '</tr>';

    data.forEach((row, rowIndex) => {
      inHtml += `<tr><th>${rowIndex + 2}</th>`;
      row.forEach((cell, colIndex) => {
        inHtml += `
          <td id="td-${rowIndex}-${colIndex}">
            <input type="text" data-row="${rowIndex}" data-col="${colIndex}" disabled>
          </td>`;
      });
      inHtml += '</tr>';
    });
    elements.inputTable.innerHTML = inHtml;
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function startPractice() {
    isPlaying = true;
    timeElapsed = 0;
    elements.statTime.innerText = "00:00";
    elements.modal.style.display = "none";
    elements.startBtn.disabled = true;
    elements.datasetSelect.disabled = true;

    // Enable all inputs
    const inputs = elements.inputTable.querySelectorAll('input');
    inputs.forEach(inp => {
      inp.disabled = false;
      inp.value = "";
      inp.parentElement.className = "";
      
      // Event listeners for logic
      inp.addEventListener('input', checkProgress);
      inp.addEventListener('focus', (e) => {
        e.target.parentElement.classList.add('cell-selected');
      });
      inp.addEventListener('blur', (e) => {
        e.target.parentElement.classList.remove('cell-selected');
        validateCell(e.target);
      });
      inp.addEventListener('keydown', handleNav);
    });

    if (inputs.length > 0) {
      inputs[0].focus();
    }

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeElapsed++;
      elements.statTime.innerText = formatTime(timeElapsed);
    }, 1000);
  }

  function handleNav(e) {
    const input = e.target;
    const row = parseInt(input.getAttribute('data-row'));
    const col = parseInt(input.getAttribute('data-col'));
    const rows = activeDataset.data.length;
    const cols = activeDataset.headers.length;

    let targetRow = row;
    let targetCol = col;

    if (e.key === 'ArrowRight' || e.key === 'Tab') {
      if(e.key === 'Tab') e.preventDefault();
      targetCol++;
      if (targetCol >= cols) { targetCol = 0; targetRow++; }
    } else if (e.key === 'ArrowLeft') {
      targetCol--;
      if (targetCol < 0) { targetCol = cols - 1; targetRow--; }
    } else if (e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault();
      targetRow++;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      targetRow--;
    }

    if (targetRow >= 0 && targetRow < rows && targetCol >= 0 && targetCol < cols) {
      const targetInput = document.querySelector(`input[data-row="${targetRow}"][data-col="${targetCol}"]`);
      if (targetInput) targetInput.focus();
    }
  }

  function validateCell(input) {
    if(!isPlaying) return;
    const row = parseInt(input.getAttribute('data-row'));
    const col = parseInt(input.getAttribute('data-col'));
    const expected = activeDataset.data[row][col];
    const actual = input.value.trim();
    const td = input.parentElement;

    if (actual === "") {
      td.className = "";
      return;
    }

    if (actual === expected) {
      td.className = "correct";
    } else {
      td.className = "incorrect";
    }
    updateStats();
  }

  function checkProgress() {
    updateStats();
    
    // Check if finished
    if (completedCells === totalCells) {
      endPractice();
    }
  }

  function updateStats() {
    const inputs = elements.inputTable.querySelectorAll('input');
    let comp = 0;
    let corr = 0;

    inputs.forEach(inp => {
      const row = parseInt(inp.getAttribute('data-row'));
      const col = parseInt(inp.getAttribute('data-col'));
      const expected = activeDataset.data[row][col];
      const actual = inp.value.trim();
      
      if (actual !== "") {
        comp++;
        if (actual === expected) corr++;
      }
    });

    completedCells = comp;
    correctCells = corr;

    elements.statCells.innerText = `${completedCells}/${totalCells}`;
    
    let acc = 100;
    if (completedCells > 0) {
      acc = Math.round((correctCells / completedCells) * 100);
    }
    elements.statAcc.innerText = `${acc}%`;
  }

  function endPractice() {
    clearInterval(timerInterval);
    isPlaying = false;
    
    const inputs = elements.inputTable.querySelectorAll('input');
    inputs.forEach(inp => inp.disabled = true);

    elements.startBtn.disabled = false;
    elements.datasetSelect.disabled = false;
    
    elements.finalTime.innerText = formatTime(timeElapsed);
    elements.finalAcc.innerText = elements.statAcc.innerText;
    elements.modal.style.display = "block";
  }

  // Event Listeners
  elements.datasetSelect.addEventListener('change', renderTables);
  elements.startBtn.addEventListener('click', startPractice);
  elements.tryAgainBtn.addEventListener('click', () => {
    elements.modal.style.display = "none";
    renderTables();
    startPractice();
  });

  // Init
  renderTables();
});
