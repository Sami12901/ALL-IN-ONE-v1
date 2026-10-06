// Scientific Physics Unit Converter Logic

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const categoryTabBtns = document.querySelectorAll('.category-tab-btn');
  const categoryTitle = document.getElementById('category-title');
  const categorySiBadge = document.getElementById('category-si-badge');
  const inputFromVal = document.getElementById('input-from-val');
  const selectFromUnit = document.getElementById('select-from-unit');
  const inputToVal = document.getElementById('input-to-val');
  const selectToUnit = document.getElementById('select-to-unit');
  const btnSwapUnits = document.getElementById('btn-swap-units');
  const precisionOption = document.getElementById('precision-option');
  const notationStyle = document.getElementById('notation-style');
  const presetsContainer = document.getElementById('presets-container');
  const matrixTableBody = document.getElementById('matrix-table-body');
  const btnCopyResult = document.getElementById('btn-copy-result');
  const btnReset = document.getElementById('btn-reset-converter');

  // Scientific Units Database
  const unitDatabase = {
    energy: {
      name: 'Energy Converter',
      base: 'Joules (J)',
      defaultFrom: 'kwh',
      defaultTo: 'j',
      units: [
        { id: 'j', name: 'Joule', symbol: 'J', factor: 1 },
        { id: 'kj', name: 'Kilojoule', symbol: 'kJ', factor: 1e3 },
        { id: 'cal', name: 'Calorie (Thermochemical)', symbol: 'cal', factor: 4.184 },
        { id: 'kcal', name: 'Kilocalorie (Food)', symbol: 'kcal', factor: 4184 },
        { id: 'wh', name: 'Watt-hour', symbol: 'Wh', factor: 3600 },
        { id: 'kwh', name: 'Kilowatt-hour', symbol: 'kWh', factor: 3.6e6 },
        { id: 'ev', name: 'Electronvolt', symbol: 'eV', factor: 1.602176634e-19 },
        { id: 'btu', name: 'British Thermal Unit (IT)', symbol: 'BTU', factor: 1055.05585262 },
        { id: 'ftlbf', name: 'Foot-pound force', symbol: 'ft·lbf', factor: 1.3558179483314004 }
      ],
      presets: [
        { label: '1 kWh → Joules', val: 1, from: 'kwh', to: 'j' },
        { label: '1 eV → Joules', val: 1, from: 'ev', to: 'j' },
        { label: '100 Food kcal → kJ', val: 100, from: 'kcal', to: 'kj' },
        { label: '1 BTU → Joules', val: 1, from: 'btu', to: 'j' }
      ]
    },
    pressure: {
      name: 'Pressure Converter',
      base: 'Pascal (Pa)',
      defaultFrom: 'atm',
      defaultTo: 'psi',
      units: [
        { id: 'pa', name: 'Pascal', symbol: 'Pa', factor: 1 },
        { id: 'kpa', name: 'Kilopascal', symbol: 'kPa', factor: 1e3 },
        { id: 'mpa', name: 'Megapascal', symbol: 'MPa', factor: 1e6 },
        { id: 'bar', name: 'Bar', symbol: 'bar', factor: 1e5 },
        { id: 'mbar', name: 'Millibar / hPa', symbol: 'mbar', factor: 100 },
        { id: 'psi', name: 'Pounds per Sq Inch', symbol: 'psi', factor: 6894.757293168 },
        { id: 'atm', name: 'Standard Atmosphere', symbol: 'atm', factor: 101325 },
        { id: 'torr', name: 'Torr / mmHg', symbol: 'Torr', factor: 101325 / 760 }
      ],
      presets: [
        { label: '1 Standard Atm → PSI', val: 1, from: 'atm', to: 'psi' },
        { label: '1 Bar → kPa', val: 1, from: 'bar', to: 'kpa' },
        { label: '32 PSI (Tire) → Bar', val: 32, from: 'psi', to: 'bar' },
        { label: '760 Torr → Atm', val: 760, from: 'torr', to: 'atm' }
      ]
    },
    power: {
      name: 'Power Converter',
      base: 'Watts (W)',
      defaultFrom: 'kw',
      defaultTo: 'hp_mech',
      units: [
        { id: 'w', name: 'Watt', symbol: 'W', factor: 1 },
        { id: 'kw', name: 'Kilowatt', symbol: 'kW', factor: 1e3 },
        { id: 'mw', name: 'Megawatt', symbol: 'MW', factor: 1e6 },
        { id: 'hp_mech', name: 'Mechanical Horsepower', symbol: 'hp (mech)', factor: 745.69987158227 },
        { id: 'hp_metric', name: 'Metric Horsepower', symbol: 'hp (metric)', factor: 735.49875 },
        { id: 'ftlbfs', name: 'Foot-pounds / second', symbol: 'ft·lbf/s', factor: 1.3558179483314004 },
        { id: 'btu_h', name: 'BTU per hour', symbol: 'BTU/hr', factor: 1055.05585262 / 3600 }
      ],
      presets: [
        { label: '1 Mechanical HP → Watts', val: 1, from: 'hp_mech', to: 'w' },
        { label: '100 kW → HP', val: 100, from: 'kw', to: 'hp_mech' },
        { label: '12,000 BTU/hr (1 Ton AC) → kW', val: 12000, from: 'btu_h', to: 'kw' }
      ]
    },
    force: {
      name: 'Force Converter',
      base: 'Newtons (N)',
      defaultFrom: 'lbf',
      defaultTo: 'n',
      units: [
        { id: 'n', name: 'Newton', symbol: 'N', factor: 1 },
        { id: 'kn', name: 'Kilonewton', symbol: 'kN', factor: 1e3 },
        { id: 'dyn', name: 'Dyne', symbol: 'dyn', factor: 1e-5 },
        { id: 'lbf', name: 'Pound-force', symbol: 'lbf', factor: 4.4482216152605 },
        { id: 'kgf', name: 'Kilogram-force', symbol: 'kgf', factor: 9.80665 }
      ],
      presets: [
        { label: '100 lbf → Newtons', val: 100, from: 'lbf', to: 'n' },
        { label: '1 Newton → Dynes', val: 1, from: 'n', to: 'dyn' },
        { label: '10 kgf → Newtons', val: 10, from: 'kgf', to: 'n' }
      ]
    },
    density: {
      name: 'Density Converter',
      base: 'kg/m³',
      defaultFrom: 'g_cm3',
      defaultTo: 'kg_m3',
      units: [
        { id: 'kg_m3', name: 'Kilogram per cubic meter', symbol: 'kg/m³', factor: 1 },
        { id: 'g_cm3', name: 'Gram per cubic centimeter', symbol: 'g/cm³', factor: 1000 },
        { id: 'g_ml', name: 'Gram per milliliter', symbol: 'g/mL', factor: 1000 },
        { id: 'kg_l', name: 'Kilogram per liter', symbol: 'kg/L', factor: 1000 },
        { id: 'lb_ft3', name: 'Pound per cubic foot', symbol: 'lb/ft³', factor: 16.01846337396014 },
        { id: 'lb_in3', name: 'Pound per cubic inch', symbol: 'lb/in³', factor: 27679.904710188 }
      ],
      presets: [
        { label: 'Water (1 g/cm³) → kg/m³', val: 1, from: 'g_cm3', to: 'kg_m3' },
        { label: 'Air (1.225 kg/m³) → lb/ft³', val: 1.225, from: 'kg_m3', to: 'lb_ft3' },
        { label: 'Gold (19.3 g/cm³) → lb/in³', val: 19.3, from: 'g_cm3', to: 'lb_in3' }
      ]
    },
    frequency: {
      name: 'Frequency Converter',
      base: 'Hertz (Hz)',
      defaultFrom: 'ghz',
      defaultTo: 'mhz',
      units: [
        { id: 'hz', name: 'Hertz', symbol: 'Hz', factor: 1 },
        { id: 'khz', name: 'Kilohertz', symbol: 'kHz', factor: 1e3 },
        { id: 'mhz', name: 'Megahertz', symbol: 'MHz', factor: 1e6 },
        { id: 'ghz', name: 'Gigahertz', symbol: 'GHz', factor: 1e9 },
        { id: 'rpm', name: 'Revolutions per minute', symbol: 'RPM', factor: 1 / 60 },
        { id: 'rad_s', name: 'Radians per second', symbol: 'rad/s', factor: 1 / (2 * Math.PI) }
      ],
      presets: [
        { label: '2.4 GHz Wi-Fi → MHz', val: 2.4, from: 'ghz', to: 'mhz' },
        { label: 'Concert A4 (440 Hz) → rad/s', val: 440, from: 'hz', to: 'rad_s' },
        { label: '3,000 RPM Engine → Hz', val: 3000, from: 'rpm', to: 'hz' },
        { label: '60 Hz AC → RPM', val: 60, from: 'hz', to: 'rpm' }
      ]
    }
  };

  let activeCategory = 'energy';

  // Format number
  function formatScientific(num, precision, style) {
    if (isNaN(num)) return 'Invalid';
    if (!isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';
    if (num === 0) return '0';

    let outStr = '';
    const abs = Math.abs(num);

    if (precision === 'sci') {
      outStr = num.toExponential(4);
    } else if (precision === 'auto') {
      if (abs < 0.0001 || abs >= 1e7) {
        outStr = num.toExponential(4);
      } else {
        outStr = Number(num.toPrecision(8)).toString();
      }
    } else {
      const dec = parseInt(precision, 10);
      if (abs < Math.pow(10, -dec) && abs > 0) {
        outStr = num.toExponential(dec);
      } else {
        outStr = num.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: dec
        });
      }
    }

    if (style === 'engineering' && outStr.includes('e')) {
      const parts = outStr.split('e');
      return `${parts[0]} × 10^${parseInt(parts[1], 10)}`;
    }

    return outStr;
  }

  // Populate UI for active category
  function setCategory(catKey) {
    if (!unitDatabase[catKey]) return;
    activeCategory = catKey;
    const cat = unitDatabase[catKey];

    categoryTitle.textContent = cat.name;
    categorySiBadge.textContent = `Base: ${cat.base}`;

    // Populate dropdowns
    selectFromUnit.innerHTML = '';
    selectToUnit.innerHTML = '';

    cat.units.forEach(u => {
      const optFrom = document.createElement('option');
      optFrom.value = u.id;
      optFrom.textContent = `${u.name} (${u.symbol})`;
      selectFromUnit.appendChild(optFrom);

      const optTo = document.createElement('option');
      optTo.value = u.id;
      optTo.textContent = `${u.name} (${u.symbol})`;
      selectToUnit.appendChild(optTo);
    });

    selectFromUnit.value = cat.defaultFrom;
    selectToUnit.value = cat.defaultTo;

    // Populate Presets
    presetsContainer.innerHTML = '';
    cat.presets.forEach(p => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'preset-chip';
      btn.textContent = p.label;
      btn.addEventListener('click', () => {
        inputFromVal.value = p.val;
        selectFromUnit.value = p.from;
        selectToUnit.value = p.to;
        convertUnits();
      });
      presetsContainer.appendChild(btn);
    });

    convertUnits();
  }

  function convertUnits() {
    const cat = unitDatabase[activeCategory];
    const rawVal = inputFromVal.value.trim().replace(/,/g, '');
    const num = parseFloat(rawVal);
    const precision = precisionOption.value;
    const style = notationStyle.value;

    if (isNaN(num)) {
      inputToVal.value = '';
      matrixTableBody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--error);">Please enter a valid numerical quantity.</td></tr>';
      return;
    }

    const fromUnit = cat.units.find(u => u.id === selectFromUnit.value) || cat.units[0];
    const toUnit = cat.units.find(u => u.id === selectToUnit.value) || cat.units[1];

    // Convert via SI base
    const baseVal = num * fromUnit.factor;
    const convertedVal = baseVal / toUnit.factor;

    inputToVal.value = formatScientific(convertedVal, precision, style);

    // Update Matrix Table
    matrixTableBody.innerHTML = '';
    cat.units.forEach(unit => {
      const eqVal = baseVal / unit.factor;
      const formattedEq = formatScientific(eqVal, precision, style);
      const isSelected = unit.id === toUnit.id;

      const tr = document.createElement('tr');
      if (isSelected) tr.style.background = 'rgba(78, 133, 191, 0.12)';

      tr.innerHTML = `
        <td style="font-weight: 600;">${unit.name}</td>
        <td style="color: var(--text-secondary);">${unit.symbol}</td>
        <td>
          <span class="unit-copy-cell" title="Click to copy ${unit.symbol} value">
            <span>${formattedEq}</span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.6;">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </span>
        </td>
      `;

      // Click row to copy
      tr.querySelector('.unit-copy-cell').addEventListener('click', () => {
        navigator.clipboard.writeText(formattedEq).then(() => {
          const originalText = tr.querySelector('.unit-copy-cell span').textContent;
          tr.querySelector('.unit-copy-cell span').textContent = 'Copied!';
          setTimeout(() => {
            tr.querySelector('.unit-copy-cell span').textContent = originalText;
          }, 1500);
        });
      });

      matrixTableBody.appendChild(tr);
    });
  }

  // Category Tab clicks
  categoryTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const catKey = btn.getAttribute('data-category');
      setCategory(catKey);
    });
  });

  // Swap units button
  btnSwapUnits.addEventListener('click', () => {
    const curFrom = selectFromUnit.value;
    const curTo = selectToUnit.value;
    selectFromUnit.value = curTo;
    selectToUnit.value = curFrom;
    convertUnits();
  });

  // Event listeners
  inputFromVal.addEventListener('input', convertUnits);
  selectFromUnit.addEventListener('change', convertUnits);
  selectToUnit.addEventListener('change', convertUnits);
  precisionOption.addEventListener('change', convertUnits);
  notationStyle.addEventListener('change', convertUnits);

  btnReset.addEventListener('click', () => {
    inputFromVal.value = '1';
    convertUnits();
    inputFromVal.focus();
  });

  // Copy result
  btnCopyResult.addEventListener('click', () => {
    const val = inputToVal.value;
    if (!val) return;
    const toUnitObj = unitDatabase[activeCategory].units.find(u => u.id === selectToUnit.value);
    const textToCopy = `${val} ${toUnitObj ? toUnitObj.symbol : ''}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      const orig = btnCopyResult.textContent;
      btnCopyResult.textContent = 'Copied!';
      setTimeout(() => {
        btnCopyResult.textContent = orig;
      }, 2000);
    });
  });

  // Initialize with energy
  setCategory('energy');
});