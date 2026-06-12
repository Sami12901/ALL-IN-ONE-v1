document.addEventListener('DOMContentLoaded', () => {
  // Check if Univer is loaded correctly via CDN
  if (!window.UniverPresets || !window.UniverPresetSheetsCore) {
    console.error("Univer libraries not loaded correctly.");
    document.getElementById('univer-container').innerHTML = '<div style="padding: 2rem; color: red;">Failed to load spreadsheet engine. Please check internet connection or cache.</div>';
    return;
  }

  const { createUniver, LocaleType } = window.UniverPresets;
  const { UniverSheetsCorePreset } = window.UniverPresetSheetsCore;

  // Auto-load from local storage or create blank
  let initialData = {};
  const savedData = localStorage.getItem('all-in-one-sheets-autosave');
  if (savedData) {
    try {
      initialData = JSON.parse(savedData);
    } catch (e) {
      console.error('Error parsing saved spreadsheet data', e);
    }
  }

  if (!initialData || Object.keys(initialData).length === 0) {
    initialData = {
      id: 'workbook-' + Date.now(),
      name: 'ALL IN ONE Sheet',
      sheetOrder: ['sheet1'],
      sheets: {
        'sheet1': {
          id: 'sheet1',
          name: 'Sheet1',
          cellData: {
            0: {
              0: { v: 'Welcome to ALL IN ONE Sheets!' }
            }
          }
        }
      }
    };
  }

  // Initialize Univer using Presets
  const { univerAPI } = createUniver({
    locale: LocaleType.EN_US,
    presets: [
      UniverSheetsCorePreset({
        container: 'univer-container',
      }),
    ],
  });

  // Create Workbook with initial data
  univerAPI.createWorkbook(initialData);

  // Setup Auto-save
  setInterval(() => {
    try {
      const activeWorkbook = univerAPI.getActiveWorkbook();
      if (activeWorkbook) {
        const snapshot = activeWorkbook.save();
        localStorage.setItem('all-in-one-sheets-autosave', JSON.stringify(snapshot));
      }
    } catch (err) {
      console.error('Autosave failed:', err);
    }
  }, 5000);

  // Template Logic
  const templateSelect = document.getElementById('template-select');
  templateSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    if (!val) return;

    if (window.confirm("Loading a template will replace your current spreadsheet. Do you want to continue?")) {
      let newData = {};

      if (val === 'blank') {
        newData = {
          id: 'blank-' + Date.now(),
          name: 'Blank Spreadsheet',
          sheetOrder: ['sheet1'],
          sheets: { 'sheet1': { id: 'sheet1', name: 'Sheet1', cellData: {} } }
        };
      } else if (val === 'travel') {
        newData = {
          id: 'travel-' + Date.now(),
          name: 'Travel Agency Ledger',
          sheetOrder: ['sheet1'],
          sheets: {
            'sheet1': {
              id: 'sheet1',
              name: 'Ledger',
              cellData: {
                0: {
                  0: { v: 'Customer Name', s: { bl: 1 } },
                  1: { v: 'Passport No', s: { bl: 1 } },
                  2: { v: 'Visa Fee', s: { bl: 1 } },
                  3: { v: 'Ticket Fee', s: { bl: 1 } },
                  4: { v: 'Hotel Fee', s: { bl: 1 } },
                  5: { v: 'Profit', s: { bl: 1 } }
                },
                1: {
                  0: { v: 'John Doe' },
                  1: { v: 'A1234567' },
                  2: { v: 100, t: 2 },
                  3: { v: 500, t: 2 },
                  4: { v: 300, t: 2 },
                  5: { f: '=SUM(C2:E2)' }
                },
                3: {
                  0: { v: 'Total Customers', s: { bl: 1 } },
                  1: { f: '=COUNTA(A2:A3)' },
                  4: { v: 'Total Profit', s: { bl: 1 } },
                  5: { f: '=SUM(F2:F3)' }
                }
              }
            }
          }
        };
      } else if (val === 'ecommerce') {
        newData = {
          id: 'ecommerce-' + Date.now(),
          name: 'E-commerce Dashboard',
          sheetOrder: ['sheet1'],
          sheets: {
            'sheet1': {
              id: 'sheet1',
              name: 'Inventory & Sales',
              cellData: {
                0: {
                  0: { v: 'Product', s: { bl: 1 } },
                  1: { v: 'Stock', s: { bl: 1 } },
                  2: { v: 'Price', s: { bl: 1 } },
                  3: { v: 'Sales', s: { bl: 1 } },
                  4: { v: 'Revenue', s: { bl: 1 } },
                  5: { v: 'Profit', s: { bl: 1 } }
                },
                1: {
                  0: { v: 'Smartphone X' },
                  1: { v: 50, t: 2 },
                  2: { v: 800, t: 2 },
                  3: { v: 10, t: 2 },
                  4: { f: '=C2*D2' },
                  5: { f: '=E2*0.2' } // Assuming 20% margin
                },
                2: {
                  0: { v: 'Laptop Pro' },
                  1: { v: 20, t: 2 },
                  2: { v: 1500, t: 2 },
                  3: { v: 5, t: 2 },
                  4: { f: '=C3*D3' },
                  5: { f: '=E3*0.25' }
                },
                4: {
                  0: { v: 'Total Revenue', s: { bl: 1 } },
                  1: { f: '=SUM(E2:E3)' },
                  3: { v: 'Total Profit', s: { bl: 1 } },
                  4: { f: '=SUM(F2:F3)' }
                }
              }
            }
          }
        };
      }

      localStorage.setItem('all-in-one-sheets-autosave', JSON.stringify(newData));
      window.location.reload();
    }
    
    // Reset select
    e.target.value = '';
  });

  // Import / Export Logic
  const btnImport = document.getElementById('btn-import');
  const fileImport = document.getElementById('file-import');
  const btnExport = document.getElementById('btn-export');

  btnImport.addEventListener('click', () => fileImport.click());

  fileImport.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
      const data = evt.target.result;
      const workbook = XLSX.read(data, {type: 'binary'});
      
      const newSheets = {};
      const sheetOrder = [];
      
      workbook.SheetNames.forEach((sheetName, index) => {
        const sheetId = 'sheet-' + index;
        sheetOrder.push(sheetId);
        const roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {header: 1});
        
        const cellData = {};
        roa.forEach((row, rIdx) => {
          if (row && row.length > 0) {
            cellData[rIdx] = {};
            row.forEach((cell, cIdx) => {
              if (cell !== undefined && cell !== null) {
                if (typeof cell === 'number') {
                  cellData[rIdx][cIdx] = { v: cell, t: 2 };
                } else {
                  cellData[rIdx][cIdx] = { v: String(cell) };
                }
              }
            });
          }
        });

        newSheets[sheetId] = {
          id: sheetId,
          name: sheetName,
          cellData: cellData
        };
      });

      const newWorkbookData = {
        id: 'imported-' + Date.now(),
        name: file.name.replace('.xlsx', ''),
        sheetOrder: sheetOrder,
        sheets: newSheets
      };

      localStorage.setItem('all-in-one-sheets-autosave', JSON.stringify(newWorkbookData));
      window.location.reload();
    };
    reader.readAsBinaryString(file);
  });

  btnExport.addEventListener('click', async () => {
    try {
      const activeWorkbook = univerAPI.getActiveWorkbook();
      if (!activeWorkbook) return;

      const snapshot = activeWorkbook.save();
      
      // Use ExcelJS to create the workbook
      const workbook = new ExcelJS.Workbook();
      
      snapshot.sheetOrder.forEach(sheetId => {
        const sheetData = snapshot.sheets[sheetId];
        const worksheet = workbook.addWorksheet(sheetData.name);
        
        if (sheetData.cellData) {
          Object.keys(sheetData.cellData).forEach(r => {
            const rowIdx = parseInt(r) + 1; // ExcelJS is 1-indexed
            const rowData = sheetData.cellData[r];
            Object.keys(rowData).forEach(c => {
              const colIdx = parseInt(c) + 1;
              const cell = rowData[c];
              
              const excelCell = worksheet.getCell(rowIdx, colIdx);
              
              if (cell.f) {
                // If it's a formula, ExcelJS requires formula property
                excelCell.value = { formula: cell.f.startsWith('=') ? cell.f.substring(1) : cell.f };
              } else {
                excelCell.value = cell.v;
              }
              
              // Basic styling transfer
              if (cell.s && typeof cell.s === 'object') {
                if (cell.s.bl) {
                  excelCell.font = { bold: true };
                }
              }
            });
          });
        }
      });
      
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${snapshot.name || 'spreadsheet'}.xlsx`;
      link.click();
      
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export. Check console for details.');
    }
  });

});
