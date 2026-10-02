// Scientific Calculator Logic

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const expressionDisplay = document.getElementById('expression-display');
  const resultDisplay = document.getElementById('result-display');
  const degRadBtn = document.getElementById('deg-rad-btn');
  const memIndicator = document.getElementById('mem-indicator');
  const calcStatus = document.getElementById('calc-status');
  const historyList = document.getElementById('history-list');
  const clearHistoryBtn = document.getElementById('clear-history-btn');

  // State
  let currentExpression = '';
  let isDegMode = true; // true = Degrees, false = Radians
  let memoryValue = 0;
  let history = [];
  let evaluated = false;

  /**
   * Safe Mathematical Parser and Evaluator (Shunting-Yard Algorithm)
   */
  function evaluateMath(expr, isDeg = true) {
    if (!expr || !expr.trim()) return 0;
    let s = expr.trim();

    // Standardize glyphs and symbols
    s = s.replace(/×/g, '*').replace(/÷/g, '/').replace(/π/g, 'pi');
    s = s.replace(/log10\s*\(/gi, 'log(');

    // Implicit multiplication
    s = s.replace(/(\d+)\s*\(/g, '$1 * (');
    s = s.replace(/\)\s*\(/g, ') * (');
    s = s.replace(/(\d+)\s*([a-zA-Z]+)/g, '$1 * $2');
    s = s.replace(/\)\s*(\d+|[a-zA-Z]+)/g, ') * $1');
    s = s.replace(/\b(pi|e)\s*(?=[a-zA-Z\d(])/gi, '$1 * ');

    const tokens = [];
    const regex = /\s*([0-9]*\.?[0-9]+(?:e[+-]?[0-9]+)?|[a-zA-Z]+|\S)\s*/g;
    let m;
    while ((m = regex.exec(s)) !== null) {
      tokens.push(m[1]);
    }

    const ops = {
      '+': { prec: 1, assoc: 'L', binary: true },
      '-': { prec: 1, assoc: 'L', binary: true },
      '*': { prec: 2, assoc: 'L', binary: true },
      '/': { prec: 2, assoc: 'L', binary: true },
      '%': { prec: 2, assoc: 'L', binary: true },
      '^': { prec: 3, assoc: 'R', binary: true },
      'u-': { prec: 4, assoc: 'R', binary: false },
      'u+': { prec: 4, assoc: 'R', binary: false }
    };

    const fns = ['sin', 'cos', 'tan', 'sqrt', 'log', 'ln', 'abs'];

    const outputQueue = [];
    const opStack = [];

    let prevToken = null;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (!isNaN(parseFloat(token)) && isFinite(token)) {
        outputQueue.push({ type: 'num', value: parseFloat(token) });
      } else if (token.toLowerCase() === 'pi') {
        outputQueue.push({ type: 'num', value: Math.PI });
      } else if (token.toLowerCase() === 'e') {
        outputQueue.push({ type: 'num', value: Math.E });
      } else if (fns.includes(token.toLowerCase())) {
        opStack.push({ type: 'fn', name: token.toLowerCase() });
      } else if (token === '(') {
        opStack.push({ type: 'paren', value: '(' });
      } else if (token === ')') {
        while (opStack.length > 0 && opStack[opStack.length - 1].value !== '(') {
          outputQueue.push(opStack.pop());
        }
        if (opStack.length === 0) throw new Error('Mismatched parentheses');
        opStack.pop(); // discard '('
        if (opStack.length > 0 && opStack[opStack.length - 1].type === 'fn') {
          outputQueue.push(opStack.pop());
        }
      } else if (token === '+' || token === '-') {
        const isUnary = prevToken === null || prevToken === '(' || (prevToken in ops) || fns.includes(prevToken ? prevToken.toLowerCase() : '');
        const opKey = isUnary ? (token === '-' ? 'u-' : 'u+') : token;
        const op = ops[opKey];

        while (opStack.length > 0) {
          const top = opStack[opStack.length - 1];
          if (top.type === 'op') {
            const topOp = ops[top.value];
            if ((op.assoc === 'L' && op.prec <= topOp.prec) || (op.assoc === 'R' && op.prec < topOp.prec)) {
              outputQueue.push(opStack.pop());
              continue;
            }
          }
          break;
        }
        opStack.push({ type: 'op', value: opKey });
      } else if (token in ops) {
        const op = ops[token];
        while (opStack.length > 0) {
          const top = opStack[opStack.length - 1];
          if (top.type === 'op') {
            const topOp = ops[top.value];
            if ((op.assoc === 'L' && op.prec <= topOp.prec) || (op.assoc === 'R' && op.prec < topOp.prec)) {
              outputQueue.push(opStack.pop());
              continue;
            }
          }
          break;
        }
        opStack.push({ type: 'op', value: token });
      } else {
        throw new Error(`Unknown symbol: ${token}`);
      }
      prevToken = token;
    }

    while (opStack.length > 0) {
      const top = opStack.pop();
      if (top.value === '(' || top.value === ')') throw new Error('Mismatched parentheses');
      outputQueue.push(top);
    }

    const stack = [];
    for (const item of outputQueue) {
      if (item.type === 'num') {
        stack.push(item.value);
      } else if (item.type === 'op') {
        if (item.value === 'u-') {
          if (stack.length < 1) throw new Error('Invalid syntax');
          stack.push(-stack.pop());
        } else if (item.value === 'u+') {
          if (stack.length < 1) throw new Error('Invalid syntax');
        } else {
          if (stack.length < 2) throw new Error('Invalid syntax');
          const b = stack.pop();
          const a = stack.pop();
          let res;
          switch (item.value) {
            case '+': res = a + b; break;
            case '-': res = a - b; break;
            case '*': res = a * b; break;
            case '/':
              if (b === 0) throw new Error('Division by zero');
              res = a / b;
              break;
            case '%': res = a % b; break;
            case '^': res = Math.pow(a, b); break;
          }
          stack.push(res);
        }
      } else if (item.type === 'fn') {
        if (stack.length < 1) throw new Error('Function argument missing');
        const val = stack.pop();
        let res;
        switch (item.name) {
          case 'sin':
            res = isDeg ? Math.sin((val * Math.PI) / 180) : Math.sin(val);
            break;
          case 'cos':
            res = isDeg ? Math.cos((val * Math.PI) / 180) : Math.cos(val);
            break;
          case 'tan':
            if (isDeg && Math.abs(val % 180) === 90) throw new Error('Undefined (tan 90°)');
            res = isDeg ? Math.tan((val * Math.PI) / 180) : Math.tan(val);
            break;
          case 'sqrt':
            if (val < 0) throw new Error('Square root of negative number');
            res = Math.sqrt(val);
            break;
          case 'log':
            if (val <= 0) throw new Error('Log undefined for non-positive');
            res = Math.log10(val);
            break;
          case 'ln':
            if (val <= 0) throw new Error('Natural log undefined for non-positive');
            res = Math.log(val);
            break;
          case 'abs':
            res = Math.abs(val);
            break;
        }
        stack.push(res);
      }
    }

    if (stack.length !== 1) throw new Error('Invalid expression');
    let ans = stack[0];
    if (Math.abs(ans) < 1e-12 && ans !== 0) ans = 0;
    return Math.round(ans * 1e12) / 1e12;
  }

  /**
   * Update screen displays with live preview
   */
  function updateDisplay() {
    expressionDisplay.textContent = currentExpression || '';

    if (!currentExpression.trim()) {
      resultDisplay.textContent = '0';
      resultDisplay.classList.remove('preview');
      calcStatus.textContent = 'Standard';
      return;
    }

    // Try live preview calculation
    try {
      // Auto-close missing parentheses for live preview
      let testExpr = currentExpression;
      const openCount = (testExpr.match(/\(/g) || []).length;
      const closeCount = (testExpr.match(/\)/g) || []).length;
      if (openCount > closeCount) {
        testExpr += ')'.repeat(openCount - closeCount);
      }

      const previewRes = evaluateMath(testExpr, isDegMode);
      if (!evaluated) {
        resultDisplay.textContent = previewRes.toString();
        resultDisplay.classList.add('preview');
        calcStatus.textContent = isDegMode ? 'DEG (Preview)' : 'RAD (Preview)';
      }
    } catch (e) {
      if (!evaluated) {
        resultDisplay.classList.remove('preview');
        calcStatus.textContent = 'Editing...';
      }
    }
  }

  /**
   * Append value to expression
   */
  function appendValue(val) {
    if (evaluated) {
      // If user presses an operator right after evaluation, chain the result
      if (['+', '-', '*', '/', '%', '^'].includes(val)) {
        currentExpression = resultDisplay.textContent + val;
      } else {
        currentExpression = val;
      }
      evaluated = false;
      resultDisplay.classList.remove('preview');
    } else {
      currentExpression += val;
    }
    updateDisplay();
  }

  /**
   * Backspace last character
   */
  function backspace() {
    if (evaluated) {
      currentExpression = '';
      resultDisplay.textContent = '0';
      evaluated = false;
      updateDisplay();
      return;
    }

    // Check if ends with a function like 'sin(', 'cos(', 'tan(', 'sqrt(', 'log10(', 'ln('
    const funcMatch = currentExpression.match(/(sin\(|cos\(|tan\(|sqrt\(|log10\(|ln\()$/);
    if (funcMatch) {
      currentExpression = currentExpression.slice(0, -funcMatch[0].length);
    } else {
      currentExpression = currentExpression.slice(0, -1);
    }
    updateDisplay();
  }

  /**
   * Clear operations
   */
  function clearAll() {
    currentExpression = '';
    resultDisplay.textContent = '0';
    resultDisplay.classList.remove('preview');
    calcStatus.textContent = isDegMode ? 'DEG' : 'RAD';
    evaluated = false;
    updateDisplay();
  }

  function clearEntry() {
    currentExpression = '';
    resultDisplay.textContent = '0';
    resultDisplay.classList.remove('preview');
    evaluated = false;
    updateDisplay();
  }

  /**
   * Toggle Deg / Rad mode
   */
  function toggleDegRad() {
    isDegMode = !isDegMode;
    degRadBtn.textContent = isDegMode ? 'DEG' : 'RAD';
    calcStatus.textContent = isDegMode ? 'DEG Mode' : 'RAD Mode';
    updateDisplay();
  }

  /**
   * Update memory indicator UI
   */
  function updateMemoryIndicator() {
    if (memoryValue !== 0) {
      memIndicator.style.display = 'inline-block';
      memIndicator.textContent = `M: ${memoryValue}`;
      memIndicator.title = `Current Memory Value: ${memoryValue}`;
    } else {
      memIndicator.style.display = 'none';
      memIndicator.title = '';
    }
  }

  /**
   * Execute evaluation
   */
  function calculate() {
    if (!currentExpression.trim()) return;

    // Auto-close missing parentheses
    let expr = currentExpression;
    const openCount = (expr.match(/\(/g) || []).length;
    const closeCount = (expr.match(/\)/g) || []).length;
    if (openCount > closeCount) {
      expr += ')'.repeat(openCount - closeCount);
      currentExpression = expr;
      expressionDisplay.textContent = expr;
    }

    try {
      const result = evaluateMath(expr, isDegMode);
      resultDisplay.textContent = result.toString();
      resultDisplay.classList.remove('preview');
      calcStatus.textContent = 'Evaluated';
      evaluated = true;

      // Add to history
      addHistory(expr, result);
    } catch (err) {
      resultDisplay.textContent = 'Error';
      resultDisplay.classList.remove('preview');
      calcStatus.textContent = err.message || 'Syntax Error';
      evaluated = true;
    }
  }

  /**
   * Add entry to Calculation History
   */
  function addHistory(expr, result) {
    const item = {
      id: Date.now(),
      expr: expr,
      result: result,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    history.unshift(item);
    if (history.length > 25) history.pop();
    renderHistory();
  }

  /**
   * Render History Panel
   */
  function renderHistory() {
    if (history.length === 0) {
      historyList.innerHTML = `
        <div style="color: var(--text-tertiary); font-style: italic; text-align: center; padding: 2.5rem 1rem;">
          No calculations yet. Enter an expression and press '=' to save history.
        </div>
      `;
      return;
    }

    historyList.innerHTML = history.map(item => `
      <div class="history-item" data-res="${item.result}" data-expr="${item.expr}">
        <div class="history-time">${item.time}</div>
        <div class="history-expr">${item.expr}</div>
        <div class="history-res">= ${item.result}</div>
      </div>
    `).join('');

    // Clicking a history item restores its result
    document.querySelectorAll('.history-item').forEach(el => {
      el.addEventListener('click', () => {
        const res = el.getAttribute('data-res');
        currentExpression = res;
        evaluated = false;
        updateDisplay();
      });
    });
  }

  // Memory Operations
  function memoryClear() {
    memoryValue = 0;
    updateMemoryIndicator();
    calcStatus.textContent = 'Memory Cleared';
  }

  function memoryRecall() {
    appendValue(memoryValue.toString());
  }

  function memoryAdd() {
    try {
      const val = evaluateMath(currentExpression || resultDisplay.textContent, isDegMode);
      memoryValue += val;
      updateMemoryIndicator();
      calcStatus.textContent = `Memory +${val}`;
    } catch (e) {
      calcStatus.textContent = 'Memory Error';
    }
  }

  function memorySubtract() {
    try {
      const val = evaluateMath(currentExpression || resultDisplay.textContent, isDegMode);
      memoryValue -= val;
      updateMemoryIndicator();
      calcStatus.textContent = `Memory -${val}`;
    } catch (e) {
      calcStatus.textContent = 'Memory Error';
    }
  }

  // Keypad Button Clicks
  document.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-val');
      const action = btn.getAttribute('data-action');

      if (val !== null) {
        appendValue(val);
      } else if (action) {
        switch (action) {
          case 'calculate':
            calculate();
            break;
          case 'backspace':
            backspace();
            break;
          case 'all-clear':
            clearAll();
            break;
          case 'clear-entry':
            clearEntry();
            break;
          case 'deg-rad':
            toggleDegRad();
            break;
          case 'mc':
            memoryClear();
            break;
          case 'mr':
            memoryRecall();
            break;
          case 'm-plus':
            memoryAdd();
            break;
          case 'm-minus':
            memorySubtract();
            break;
          case 'square':
            appendValue('^2');
            break;
          case 'invert':
            appendValue('^(-1)');
            break;
          case 'negate':
            if (currentExpression.startsWith('-(') && currentExpression.endsWith(')')) {
              currentExpression = currentExpression.slice(2, -1);
            } else if (currentExpression.startsWith('-')) {
              currentExpression = currentExpression.slice(1);
            } else if (currentExpression) {
              currentExpression = `-(${currentExpression})`;
            }
            updateDisplay();
            break;
        }
      }
    });
  });

  // Toggle Deg/Rad button top badge
  degRadBtn.addEventListener('click', toggleDegRad);

  // Clear History button
  clearHistoryBtn.addEventListener('click', () => {
    history = [];
    renderHistory();
  });

  // Global Keyboard Navigation
  window.addEventListener('keydown', (e) => {
    // Skip if user is focusing a normal input or textarea elsewhere
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

    const key = e.key;

    if (key >= '0' && key <= '9') {
      appendValue(key);
    } else if (key === '.') {
      appendValue('.');
    } else if (key === '+' || key === '-' || key === '*' || key === '/' || key === '%' || key === '^') {
      appendValue(key);
    } else if (key === '(' || key === ')') {
      appendValue(key);
    } else if (key === 'Enter' || key === '=') {
      e.preventDefault();
      calculate();
    } else if (key === 'Backspace') {
      e.preventDefault();
      backspace();
    } else if (key === 'Escape' || key === 'Delete') {
      clearAll();
    } else if (key === 'p' || key === 'P') {
      appendValue('pi');
    } else if (key === 'e' || key === 'E') {
      appendValue('e');
    } else if (key === 's' || key === 'S') {
      appendValue('sin(');
    } else if (key === 'c') {
      appendValue('cos(');
    } else if (key === 't' || key === 'T') {
      appendValue('tan(');
    } else if (key === 'l' || key === 'L') {
      appendValue('log10(');
    } else if (key === 'q' || key === 'Q') {
      appendValue('sqrt(');
    }
  });

  // Initial display setup
  updateDisplay();
  updateMemoryIndicator();
  renderHistory();
});