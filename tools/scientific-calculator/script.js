/**
 * Scientific Calculator Logic
 */
document.addEventListener('DOMContentLoaded', () => {
  // --- State Variables ---
  let expressionStr = ''; // What user sees in the expression display
  let currentInput = '0'; // Current number being typed
  let lastResult = null; // Last evaluated answer
  let ans = 0; // The ANS memory
  
  let memory = 0; // M+, M-, MR, MC

  let isDeg = true; // Angle mode
  let is2nd = false; // Alternate functions

  let shouldResetInput = false; // If true, next number starts fresh

  // History state
  let history = JSON.parse(localStorage.getItem('calc-history')) || [];
  
  // --- DOM Elements ---
  const elExpression = document.getElementById('expression');
  const elResult = document.getElementById('result');
  const elMemIndicator = document.getElementById('mem-indicator');
  
  const btnDeg = document.getElementById('mode-deg');
  const btnRad = document.getElementById('mode-rad');
  const btn2nd = document.getElementById('mode-2nd');
  
  const historyPanel = document.getElementById('history-panel');
  const historyList = document.getElementById('history-list');
  const btnClearHistory = document.getElementById('clear-history');
  
  const buttons = document.querySelectorAll('.calc-btn');

  // --- Initialization ---
  updateDisplay();
  updateMemoryIndicator();
  renderHistory();

  // --- Mode Toggles ---
  btnDeg.addEventListener('click', () => {
    isDeg = true;
    btnDeg.classList.add('active');
    btnRad.classList.remove('active');
  });

  btnRad.addEventListener('click', () => {
    isDeg = false;
    btnRad.classList.add('active');
    btnDeg.classList.remove('active');
  });

  btn2nd.addEventListener('click', () => {
    is2nd = !is2nd;
    if (is2nd) {
      btn2nd.classList.add('active');
      toggle2ndFunctions(true);
    } else {
      btn2nd.classList.remove('active');
      toggle2ndFunctions(false);
    }
  });

  function toggle2ndFunctions(active) {
    const fnMap = {
      'sin': 'asin',
      'cos': 'acos',
      'tan': 'atan',
      'e': 'e^x',
      'ln': '10^x'
    };
    
    const displayMap = {
      'sin': 'sin⁻¹',
      'cos': 'cos⁻¹',
      'tan': 'tan⁻¹',
      'e': 'eˣ',
      'ln': '10ˣ'
    };

    buttons.forEach(btn => {
      const act = btn.dataset.action;
      if (fnMap[act] || (active && Object.values(fnMap).includes(act))) {
        // Toggle action and inner text
        if (active) {
          if (fnMap[act]) {
            btn.dataset.action = fnMap[act];
            btn.innerHTML = displayMap[act];
          }
        } else {
          // Revert back
          const original = Object.keys(fnMap).find(key => fnMap[key] === act);
          if (original) {
            btn.dataset.action = original;
            // Hacky but works for the text
            if(original === 'e') btn.innerHTML = 'e';
            else if(original === 'ln') btn.innerHTML = 'ln';
            else btn.innerHTML = original;
          }
        }
      }
    });
  }

  // --- Button Listeners ---
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = btn.dataset.action;
      handleAction(action);
      // Give focus back to document so spacebar doesn't click btn again
      btn.blur();
    });
  });

  // --- Core Action Handler ---
  function handleAction(action) {
    // Numbers
    if (/[0-9]/.test(action)) {
      inputNumber(action);
      return;
    }

    // Decimal
    if (action === '.') {
      if (shouldResetInput) {
        currentInput = '0.';
        shouldResetInput = false;
      } else if (!currentInput.includes('.')) {
        currentInput += '.';
      }
      updateDisplay();
      return;
    }

    // Clear
    if (action === 'ac') {
      currentInput = '0';
      expressionStr = '';
      lastResult = null;
      shouldResetInput = false;
      updateDisplay();
      return;
    }

    if (action === 'del') {
      if (shouldResetInput) {
        currentInput = '0';
        shouldResetInput = false;
      } else {
        currentInput = currentInput.slice(0, -1) || '0';
      }
      updateDisplay();
      return;
    }

    // Memory
    if (action === 'mc') {
      memory = 0;
      updateMemoryIndicator();
      shouldResetInput = true;
      return;
    }
    if (action === 'mr') {
      currentInput = memory.toString();
      shouldResetInput = true;
      updateDisplay();
      return;
    }
    if (action === 'm+') {
      memory += parseFloat(currentInput || 0);
      updateMemoryIndicator();
      shouldResetInput = true;
      return;
    }
    if (action === 'm-') {
      memory -= parseFloat(currentInput || 0);
      updateMemoryIndicator();
      shouldResetInput = true;
      return;
    }
    if (action === 'ms') {
      memory = parseFloat(currentInput || 0);
      updateMemoryIndicator();
      shouldResetInput = true;
      return;
    }

    // Answer
    if (action === 'ans') {
      currentInput = ans.toString();
      shouldResetInput = true;
      updateDisplay();
      return;
    }

    // Constants
    if (action === 'pi') {
      currentInput = Math.PI.toString();
      shouldResetInput = true;
      updateDisplay();
      return;
    }
    if (action === 'e') {
      currentInput = Math.E.toString();
      shouldResetInput = true;
      updateDisplay();
      return;
    }

    // Unary Operators (Immediate execution on current input)
    const unaryFns = {
      'negate': (x) => -x,
      '%': (x) => x / 100,
      'inv': (x) => 1 / x,
      'sq': (x) => x * x,
      'sqrt': (x) => Math.sqrt(x),
      'fact': (x) => factorial(x),
      'sin': (x) => Math.sin(toRad(x)),
      'cos': (x) => Math.cos(toRad(x)),
      'tan': (x) => Math.tan(toRad(x)),
      'asin': (x) => toDeg(Math.asin(x)),
      'acos': (x) => toDeg(Math.acos(x)),
      'atan': (x) => toDeg(Math.atan(x)),
      'log': (x) => Math.log10(x),
      'ln': (x) => Math.log(x),
      '10^x': (x) => Math.pow(10, x),
      'e^x': (x) => Math.exp(x)
    };

    if (unaryFns[action]) {
      let x = parseFloat(currentInput || 0);
      try {
        let res = unaryFns[action](x);
        if (!isFinite(res) || isNaN(res)) throw 'Error';
        res = formatNumber(res);
        currentInput = res.toString();
        shouldResetInput = true;
        updateDisplay();
      } catch (err) {
        currentInput = 'Error';
        shouldResetInput = true;
        updateDisplay();
      }
      return;
    }

    // Binary Operators (+, -, *, /, pow)
    const binOps = {
      '+': '+',
      '-': '-',
      '*': '×',
      '/': '÷',
      'pow': '^'
    };

    if (binOps[action]) {
      if (!shouldResetInput && expressionStr && !expressionStr.endsWith(') ')) {
        // Evaluate what we have so far
        calculate();
      }
      
      let opSym = binOps[action];
      if (lastResult !== null && shouldResetInput) {
        expressionStr = `${lastResult} ${opSym} `;
      } else {
        expressionStr += `${currentInput} ${opSym} `;
      }
      
      shouldResetInput = true;
      updateDisplay();
      return;
    }

    // Parentheses
    if (action === '(') {
      if (currentInput !== '0' && !shouldResetInput) {
        expressionStr += `${currentInput} × ( `;
      } else {
        expressionStr += `( `;
      }
      currentInput = '0';
      updateDisplay();
      return;
    }
    if (action === ')') {
      expressionStr += `${currentInput} ) `;
      shouldResetInput = true;
      updateDisplay();
      return;
    }

    // Equals
    if (action === '=') {
      calculate();
      return;
    }
  }

  function inputNumber(numStr) {
    if (currentInput === '0' || shouldResetInput) {
      currentInput = numStr;
      shouldResetInput = false;
    } else {
      currentInput += numStr;
    }
    updateDisplay();
  }

  function calculate() {
    if (!expressionStr && currentInput === '0') return;
    
    let expr = expressionStr + currentInput;
    
    // Clean up expr for eval
    let evalExpr = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/\^/g, '**');

    try {
      // Very basic tokenizer / evaluator using new Function for math
      // Note: In a prod tool, we'd use a proper math parser (e.g. math.js)
      // but for client side isolation, we eval safely.
      let result = Function('"use strict";return (' + evalExpr + ')')();
      
      if (!isFinite(result) || isNaN(result)) throw 'Error';
      
      result = formatNumber(result);
      
      // Save history
      addHistory(expr, result);
      
      ans = result;
      lastResult = result;
      currentInput = result.toString();
      expressionStr = '';
      shouldResetInput = true;
      
    } catch (e) {
      currentInput = 'Error';
      shouldResetInput = true;
    }
    updateDisplay();
  }

  // --- Helpers ---
  function updateDisplay() {
    elExpression.textContent = expressionStr;
    elResult.textContent = currentInput;
    
    // Resize text if too long
    if (currentInput.length > 12) {
      elResult.classList.add('small');
    } else {
      elResult.classList.remove('small');
    }
  }

  function updateMemoryIndicator() {
    if (memory !== 0) {
      elMemIndicator.textContent = `M = ${formatNumber(memory)}`;
    } else {
      elMemIndicator.textContent = '';
    }
  }

  function factorial(n) {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }

  function toRad(deg) {
    return isDeg ? deg * (Math.PI / 180) : deg;
  }

  function toDeg(rad) {
    return isDeg ? rad * (180 / Math.PI) : rad;
  }

  function formatNumber(num) {
    // Avoid floating point precision issues (e.g. 0.1 + 0.2)
    return parseFloat(num.toFixed(10));
  }

  // --- Keyboard Support ---
  document.addEventListener('keydown', (e) => {
    // Prevent default on quick calc keys if not typing in an input
    if (['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) return;

    const keyMap = {
      'Enter': '=',
      '=': '=',
      'Escape': 'ac',
      'Backspace': 'del',
      '+': '+',
      '-': '-',
      '*': '*',
      '/': '/',
      '(': '(',
      ')': ')',
      '.': '.',
      '^': 'pow',
      '%': '%'
    };

    if (/[0-9]/.test(e.key)) {
      handleAction(e.key);
    } else if (keyMap[e.key]) {
      e.preventDefault();
      handleAction(keyMap[e.key]);
    }
  });

  // --- History System ---
  function addHistory(expr, res) {
    history.unshift({ expr, res });
    if (history.length > 20) history.pop(); // Keep last 20
    localStorage.setItem('calc-history', JSON.stringify(history));
    renderHistory();
  }

  function renderHistory() {
    if (history.length === 0) {
      historyPanel.style.display = 'none';
      return;
    }
    historyPanel.style.display = 'block';
    historyList.innerHTML = history.map(h => `
      <div class="history-item" data-res="${h.res}">
        <span class="history-expr">${h.expr} =</span>
        <span class="history-val">${h.res}</span>
      </div>
    `).join('');

    // Click history to reuse result
    document.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        currentInput = item.dataset.res;
        shouldResetInput = true;
        updateDisplay();
      });
    });
  }

  btnClearHistory.addEventListener('click', () => {
    history = [];
    localStorage.removeItem('calc-history');
    renderHistory();
  });

});