/**
 * Safe Mathematical Expression Parser, Syntax Tree (AST) Analyzer & Evaluator
 * Handcrafted Recursive-Descent Lexer & Parser (No unsafe eval or Function calls)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Constants
  const CONSTANTS = {
    'pi': Math.PI,
    'e': Math.E,
    'phi': (1 + Math.sqrt(5)) / 2,
    'tau': Math.PI * 2
  };

  const FUNCTIONS = [
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
    'sinh', 'cosh', 'tanh',
    'sqrt', 'cbrt', 'exp', 'abs',
    'ln', 'log', 'log10', 'log2',
    'round', 'floor', 'ceil', 'sign',
    'min', 'max'
  ];

  // State
  let angleMode = 'rad'; // 'rad' or 'deg'
  let parsedAst = null;
  let parsedTokens = [];
  let variableValues = { 'x': 5 };

  // DOM Elements
  const mathInput = document.getElementById('math-input');
  const btnEval = document.getElementById('btn-eval');
  const btnClear = document.getElementById('btn-clear-formula');
  const parseErrorBox = document.getElementById('parse-error-box');

  const btnModeRad = document.getElementById('btn-mode-rad');
  const btnModeDeg = document.getElementById('btn-mode-deg');

  const resultVal = document.getElementById('math-result-val');
  const resultFormula = document.getElementById('math-result-formula');
  const btnCopySolution = document.getElementById('btn-copy-solution');
  const astNodeCount = document.getElementById('ast-node-count');

  const astTreeView = document.getElementById('ast-tree-view');
  const tokensTableBody = document.getElementById('tokens-table-body');
  const tabBtnAst = document.getElementById('tab-btn-ast');
  const tabBtnTokens = document.getElementById('tab-btn-tokens');
  const astContainer = document.getElementById('ast-container');
  const tokensContainer = document.getElementById('tokens-container');

  const varCard = document.getElementById('variable-card');
  const varCountTag = document.getElementById('var-count-tag');
  const varControlsList = document.getElementById('variable-controls-list');

  // Keypad & Presets
  const keyBtns = document.querySelectorAll('.key-btn');
  const presetChips = document.querySelectorAll('.preset-chip');

  // --- Lexer ---
  function tokenize(input) {
    const tokens = [];
    let i = 0;
    const len = input.length;

    while (i < len) {
      const char = input[i];

      // Whitespace
      if (/\s/.test(char)) {
        i++;
        continue;
      }

      // Numbers (e.g. 123, 3.14, 1e5)
      if (/[0-9]/.test(char) || (char === '.' && i + 1 < len && /[0-9]/.test(input[i + 1]))) {
        const start = i;
        let numStr = '';
        while (i < len && /[0-9.]/.test(input[i])) {
          numStr += input[i];
          i++;
        }
        // Scientific notation: 1e5, 2.5e-3
        if (i < len && (input[i] === 'e' || input[i] === 'E') && i + 1 < len && /[0-9+-]/.test(input[i + 1])) {
          numStr += input[i];
          i++;
          if (input[i] === '+' || input[i] === '-') {
            numStr += input[i];
            i++;
          }
          while (i < len && /[0-9]/.test(input[i])) {
            numStr += input[i];
            i++;
          }
        }
        tokens.push({
          type: 'NUMBER',
          value: parseFloat(numStr),
          raw: numStr,
          pos: start
        });
        continue;
      }

      // Identifiers (functions, constants, variables)
      if (/[a-zA-Z_]/.test(char)) {
        const start = i;
        let idStr = '';
        while (i < len && /[a-zA-Z0-9_]/.test(input[i])) {
          idStr += input[i];
          i++;
        }
        const lower = idStr.toLowerCase();

        if (FUNCTIONS.includes(lower)) {
          tokens.push({ type: 'FUNCTION', value: lower, pos: start });
        } else if (CONSTANTS.hasOwnProperty(lower)) {
          tokens.push({ type: 'CONSTANT', value: lower, constVal: CONSTANTS[lower], pos: start });
        } else {
          tokens.push({ type: 'VARIABLE', value: idStr, pos: start });
        }
        continue;
      }

      // Operators and Delimiters
      if ('+-*/^%!,()'.includes(char)) {
        let type;
        if (char === '(') type = 'LPAREN';
        else if (char === ')') type = 'RPAREN';
        else if (char === ',') type = 'COMMA';
        else if (char === '!') type = 'FACTORIAL';
        else type = 'OPERATOR';

        tokens.push({ type, value: char, pos: i });
        i++;
        continue;
      }

      throw new Error(`Unexpected character '${char}' at index ${i}`);
    }

    // Insert implicit multiplication tokens (e.g. 2x -> 2 * x, 2(3) -> 2 * (3))
    const processedTokens = [];
    for (let j = 0; j < tokens.length; j++) {
      const curr = tokens[j];
      processedTokens.push(curr);

      if (j + 1 < tokens.length) {
        const next = tokens[j + 1];
        const canImplicitLeft = (curr.type === 'NUMBER' || curr.type === 'CONSTANT' || curr.type === 'VARIABLE' || curr.type === 'RPAREN' || curr.type === 'FACTORIAL');
        const canImplicitRight = (next.type === 'NUMBER' || next.type === 'CONSTANT' || next.type === 'VARIABLE' || next.type === 'FUNCTION' || next.type === 'LPAREN');

        if (canImplicitLeft && canImplicitRight) {
          processedTokens.push({ type: 'OPERATOR', value: '*', pos: next.pos, implicit: true });
        }
      }
    }

    return processedTokens;
  }

  // --- Recursive-Descent Parser ---
  class Parser {
    constructor(tokens) {
      this.tokens = tokens;
      this.cursor = 0;
    }

    peek() {
      return this.tokens[this.cursor] || null;
    }

    consume() {
      return this.tokens[this.cursor++] || null;
    }

    expect(type, value) {
      const tok = this.peek();
      if (!tok) {
        throw new Error(`Unexpected end of formula. Expected ${value || type}.`);
      }
      if (tok.type !== type || (value !== undefined && tok.value !== value)) {
        throw new Error(`Expected '${value || type}' but found '${tok.value}' at character ${tok.pos}.`);
      }
      return this.consume();
    }

    parse() {
      if (this.tokens.length === 0) {
        throw new Error('Empty expression.');
      }
      const ast = this.parseExpression();
      if (this.cursor < this.tokens.length) {
        const extra = this.peek();
        throw new Error(`Unexpected token '${extra.value}' at character ${extra.pos}.`);
      }
      return ast;
    }

    // Additive: '+' | '-'
    parseExpression() {
      let node = this.parseMultiplicative();
      while (this.peek() && this.peek().type === 'OPERATOR' && (this.peek().value === '+' || this.peek().value === '-')) {
        const opTok = this.consume();
        const right = this.parseMultiplicative();
        node = {
          type: 'BinaryOp',
          op: opTok.value,
          left: node,
          right: right
        };
      }
      return node;
    }

    // Multiplicative: '*' | '/' | '%'
    parseMultiplicative() {
      let node = this.parsePower();
      while (this.peek() && this.peek().type === 'OPERATOR' && (this.peek().value === '*' || this.peek().value === '/' || this.peek().value === '%')) {
        const opTok = this.consume();
        const right = this.parsePower();
        node = {
          type: 'BinaryOp',
          op: opTok.value,
          left: node,
          right: right
        };
      }
      return node;
    }

    // Power: '^' (Right-associative: 2^3^2 = 2^(3^2))
    parsePower() {
      let node = this.parseUnary();
      if (this.peek() && this.peek().type === 'OPERATOR' && this.peek().value === '^') {
        const opTok = this.consume();
        const right = this.parsePower(); // Recursive call for right-associativity
        node = {
          type: 'BinaryOp',
          op: opTok.value,
          left: node,
          right: right
        };
      }
      return node;
    }

    // Unary: '+' | '-'
    parseUnary() {
      if (this.peek() && this.peek().type === 'OPERATOR' && (this.peek().value === '+' || this.peek().value === '-')) {
        const opTok = this.consume();
        const arg = this.parseUnary();
        return {
          type: 'UnaryOp',
          op: opTok.value,
          argument: arg
        };
      }
      return this.parsePostfix();
    }

    // Postfix: '!' (factorial)
    parsePostfix() {
      let node = this.parsePrimary();
      while (this.peek() && this.peek().type === 'FACTORIAL') {
        this.consume();
        node = {
          type: 'Factorial',
          argument: node
        };
      }
      return node;
    }

    // Primary terms: Numbers, Variables, Constants, Functions, Parentheses
    parsePrimary() {
      const tok = this.peek();
      if (!tok) {
        throw new Error('Unexpected end of formula.');
      }

      if (tok.type === 'NUMBER') {
        this.consume();
        return { type: 'Number', value: tok.value };
      }

      if (tok.type === 'CONSTANT') {
        this.consume();
        return { type: 'Constant', name: tok.value, value: tok.constVal };
      }

      if (tok.type === 'VARIABLE') {
        this.consume();
        return { type: 'Variable', name: tok.value };
      }

      if (tok.type === 'FUNCTION') {
        const fnTok = this.consume();
        this.expect('LPAREN', '(');
        const args = [];
        if (this.peek() && this.peek().type !== 'RPAREN') {
          args.push(this.parseExpression());
          while (this.peek() && this.peek().type === 'COMMA') {
            this.consume();
            args.push(this.parseExpression());
          }
        }
        this.expect('RPAREN', ')');
        return {
          type: 'FunctionCall',
          name: fnTok.value,
          args: args
        };
      }

      if (tok.type === 'LPAREN') {
        this.consume();
        const node = this.parseExpression();
        this.expect('RPAREN', ')');
        return node;
      }

      throw new Error(`Unexpected token '${tok.value}' at character position ${tok.pos}.`);
    }
  }

  // --- Safe AST Evaluator ---
  function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    if (n > 170) return Infinity; // Overflow limit
    let res = 1;
    for (let i = 2; i <= Math.floor(n); i++) {
      res *= i;
    }
    return res;
  }

  function evaluateAst(node, vars, mode) {
    if (!node) return 0;

    switch (node.type) {
      case 'Number':
        return node.value;

      case 'Constant':
        return node.value;

      case 'Variable':
        if (vars[node.name] !== undefined) {
          return vars[node.name];
        }
        return 0; // Default undefined variable to 0

      case 'UnaryOp': {
        const val = evaluateAst(node.argument, vars, mode);
        return node.op === '-' ? -val : +val;
      }

      case 'Factorial': {
        const val = evaluateAst(node.argument, vars, mode);
        return factorial(val);
      }

      case 'BinaryOp': {
        const left = evaluateAst(node.left, vars, mode);
        const right = evaluateAst(node.right, vars, mode);
        switch (node.op) {
          case '+': return left + right;
          case '-': return left - right;
          case '*': return left * right;
          case '/':
            if (right === 0) return left >= 0 ? Infinity : -Infinity;
            return left / right;
          case '%': return left % right;
          case '^': return Math.pow(left, right);
          default:
            throw new Error(`Unknown operator ${node.op}`);
        }
      }

      case 'FunctionCall': {
        const evalArgs = node.args.map(arg => evaluateAst(arg, vars, mode));
        const fn = node.name;

        // Trig conversions
        const toRad = x => (mode === 'deg' ? (x * Math.PI) / 180 : x);
        const fromRad = y => (mode === 'deg' ? (y * 180) / Math.PI : y);

        switch (fn) {
          case 'sin': return Math.sin(toRad(evalArgs[0]));
          case 'cos': return Math.cos(toRad(evalArgs[0]));
          case 'tan': return Math.tan(toRad(evalArgs[0]));
          case 'asin': return fromRad(Math.asin(evalArgs[0]));
          case 'acos': return fromRad(Math.acos(evalArgs[0]));
          case 'atan': return fromRad(Math.atan(evalArgs[0]));
          case 'sinh': return Math.sinh(evalArgs[0]);
          case 'cosh': return Math.cosh(evalArgs[0]);
          case 'tanh': return Math.tanh(evalArgs[0]);

          case 'sqrt': return Math.sqrt(evalArgs[0]);
          case 'cbrt': return Math.cbrt(evalArgs[0]);
          case 'exp': return Math.exp(evalArgs[0]);
          case 'abs': return Math.abs(evalArgs[0]);

          case 'ln':
          case 'log': return Math.log(evalArgs[0]);
          case 'log10': return Math.log10(evalArgs[0]);
          case 'log2': return Math.log2(evalArgs[0]);

          case 'round': return Math.round(evalArgs[0]);
          case 'floor': return Math.floor(evalArgs[0]);
          case 'ceil': return Math.ceil(evalArgs[0]);
          case 'sign': return Math.sign(evalArgs[0]);

          case 'min': return Math.min(...evalArgs);
          case 'max': return Math.max(...evalArgs);

          default:
            throw new Error(`Unknown function: ${fn}`);
        }
      }

      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  // Find all variables in AST
  function extractVariables(node, set = new Set()) {
    if (!node) return set;
    if (node.type === 'Variable') {
      set.add(node.name);
    }
    if (node.left) extractVariables(node.left, set);
    if (node.right) extractVariables(node.right, set);
    if (node.argument) extractVariables(node.argument, set);
    if (node.args) {
      node.args.forEach(a => extractVariables(a, set));
    }
    return set;
  }

  // Count total nodes in AST
  function countNodes(node) {
    if (!node) return 0;
    let count = 1;
    if (node.left) count += countNodes(node.left);
    if (node.right) count += countNodes(node.right);
    if (node.argument) count += countNodes(node.argument);
    if (node.args) {
      node.args.forEach(a => { count += countNodes(a); });
    }
    return count;
  }

  // --- Render AST Visual Tree ---
  function renderAstTreeHtml(node) {
    if (!node) return '';

    let badgeClass = 'num-node';
    let label = '';

    switch (node.type) {
      case 'Number':
        badgeClass = 'num-node';
        label = `Number: <strong>${node.value}</strong>`;
        return `<div class="tree-node"><span class="tree-node-badge ${badgeClass}">${label}</span></div>`;

      case 'Constant':
        badgeClass = 'num-node';
        label = `Constant: <strong>${node.name}</strong> (${node.value.toFixed(4)}...)`;
        return `<div class="tree-node"><span class="tree-node-badge ${badgeClass}">${label}</span></div>`;

      case 'Variable':
        badgeClass = 'var-node';
        label = `Variable: <strong>${node.name}</strong> ( = ${variableValues[node.name] || 0} )`;
        return `<div class="tree-node"><span class="tree-node-badge ${badgeClass}">${label}</span></div>`;

      case 'UnaryOp':
        badgeClass = 'op-node';
        label = `UnaryOp: <strong>${node.op}</strong>`;
        return `
          <div class="tree-node">
            <span class="tree-node-badge ${badgeClass}">${label}</span>
            <div style="margin-left: 1rem; border-left: 1px dashed var(--border); padding-left: 0.5rem;">
              ${renderAstTreeHtml(node.argument)}
            </div>
          </div>
        `;

      case 'Factorial':
        badgeClass = 'op-node';
        label = `Postfix: <strong>! (Factorial)</strong>`;
        return `
          <div class="tree-node">
            <span class="tree-node-badge ${badgeClass}">${label}</span>
            <div style="margin-left: 1rem; border-left: 1px dashed var(--border); padding-left: 0.5rem;">
              ${renderAstTreeHtml(node.argument)}
            </div>
          </div>
        `;

      case 'BinaryOp':
        badgeClass = 'op-node';
        label = `BinaryOp: <strong>${node.op}</strong>`;
        return `
          <div class="tree-node">
            <span class="tree-node-badge ${badgeClass}">${label}</span>
            <div style="margin-left: 1rem; border-left: 1px dashed var(--border); padding-left: 0.5rem;">
              ${renderAstTreeHtml(node.left)}
              ${renderAstTreeHtml(node.right)}
            </div>
          </div>
        `;

      case 'FunctionCall':
        badgeClass = 'fn-node';
        label = `Function: <strong>${node.name}()</strong>`;
        return `
          <div class="tree-node">
            <span class="tree-node-badge ${badgeClass}">${label}</span>
            <div style="margin-left: 1rem; border-left: 1px dashed var(--border); padding-left: 0.5rem;">
              ${node.args.map(arg => renderAstTreeHtml(arg)).join('')}
            </div>
          </div>
        `;

      default:
        return `<div class="tree-node">Unknown Node</div>`;
    }
  }

  // --- Render Tokens Table ---
  function renderTokensTable(tokens) {
    tokensTableBody.innerHTML = '';
    tokens.forEach((tok, idx) => {
      let tagClass = 'tag-number';
      if (tok.type === 'OPERATOR' || tok.type === 'FACTORIAL') tagClass = 'tag-op';
      else if (tok.type === 'FUNCTION') tagClass = 'tag-func';
      else if (tok.type === 'VARIABLE') tagClass = 'tag-var';
      else if (tok.type === 'LPAREN' || tok.type === 'RPAREN' || tok.type === 'COMMA') tagClass = 'tag-paren';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="color: var(--text-tertiary);">${idx + 1}</td>
        <td><span class="token-tag ${tagClass}">${tok.type}${tok.implicit ? ' (implicit)' : ''}</span></td>
        <td><strong>${tok.value !== undefined ? tok.value : tok.raw}</strong></td>
        <td style="color: var(--text-tertiary);">col ${tok.pos}</td>
      `;
      tokensTableBody.appendChild(tr);
    });
  }

  // --- Render Variable Sliders ---
  function updateVariableControls(variablesSet) {
    const varList = Array.from(variablesSet);
    if (varList.length === 0) {
      varCard.style.display = 'none';
      return;
    }

    varCard.style.display = 'block';
    varCountTag.textContent = `${varList.length} Variable${varList.length > 1 ? 's' : ''} Active`;
    varControlsList.innerHTML = '';

    varList.forEach(vName => {
      if (variableValues[vName] === undefined) {
        variableValues[vName] = 5;
      }
      const val = variableValues[vName];

      const row = document.createElement('div');
      row.className = 'var-row';
      row.innerHTML = `
        <span class="var-badge">${vName}</span>
        <input type="range" class="range-slider" min="-50" max="50" step="1" value="${val}" id="var-slider-${vName}">
        <input type="number" class="form-input" style="width: 80px; padding: 0.35rem 0.5rem; text-align: right;" value="${val}" id="var-input-${vName}">
      `;

      const slider = row.querySelector(`#var-slider-${vName}`);
      const numInput = row.querySelector(`#var-input-${vName}`);

      slider.addEventListener('input', () => {
        const num = parseFloat(slider.value) || 0;
        numInput.value = num;
        variableValues[vName] = num;
        recalculateSolution();
      });

      numInput.addEventListener('input', () => {
        const num = parseFloat(numInput.value) || 0;
        slider.value = num;
        variableValues[vName] = num;
        recalculateSolution();
      });

      varControlsList.appendChild(row);
    });
  }

  // --- Main Parse & Evaluation Flow ---
  function parseAndEvaluate() {
    const rawFormula = mathInput.value.trim();
    parseErrorBox.style.display = 'none';
    parseErrorBox.textContent = '';

    if (!rawFormula) {
      resultVal.textContent = '-';
      resultFormula.textContent = 'Please enter a formula.';
      astTreeView.innerHTML = '<span style="color:var(--text-tertiary)">Empty formula.</span>';
      tokensTableBody.innerHTML = '';
      return;
    }

    try {
      // 1. Tokenize
      parsedTokens = tokenize(rawFormula);
      renderTokensTable(parsedTokens);

      // 2. Parse to AST
      const parser = new Parser(parsedTokens);
      parsedAst = parser.parse();

      // 3. Count nodes & render AST
      const count = countNodes(parsedAst);
      astNodeCount.textContent = `${count} AST Nodes`;
      astTreeView.innerHTML = renderAstTreeHtml(parsedAst);

      // 4. Update Variables
      const vars = extractVariables(parsedAst);
      updateVariableControls(vars);

      // 5. Evaluate
      recalculateSolution();

    } catch (err) {
      console.warn('Parser Error:', err);
      parseErrorBox.style.display = 'block';
      parseErrorBox.textContent = `Error: ${err.message}`;
      resultVal.textContent = 'Syntax Error';
      resultFormula.textContent = rawFormula;
      parsedAst = null;
    }
  }

  function recalculateSolution() {
    if (!parsedAst) return;
    try {
      const solution = evaluateAst(parsedAst, variableValues, angleMode);
      resultFormula.textContent = mathInput.value.trim();

      if (Number.isNaN(solution)) {
        resultVal.textContent = 'NaN';
      } else if (!Number.isFinite(solution)) {
        resultVal.textContent = solution > 0 ? '+Infinity' : '-Infinity';
      } else {
        // Format decimal precision cleanly
        const clean = Number.isInteger(solution) ? solution.toString() : parseFloat(solution.toFixed(8)).toString();
        resultVal.textContent = clean;
      }

      // Refresh AST view values
      astTreeView.innerHTML = renderAstTreeHtml(parsedAst);

    } catch (err) {
      resultVal.textContent = 'Eval Error';
      parseErrorBox.style.display = 'block';
      parseErrorBox.textContent = `Evaluation error: ${err.message}`;
    }
  }

  // --- Tab switching AST / Tokens ---
  tabBtnAst.addEventListener('click', () => {
    tabBtnAst.classList.add('active');
    tabBtnTokens.classList.remove('active');
    astContainer.style.display = 'block';
    tokensContainer.style.display = 'none';
  });

  tabBtnTokens.addEventListener('click', () => {
    tabBtnTokens.classList.add('active');
    tabBtnAst.classList.remove('active');
    astContainer.style.display = 'none';
    tokensContainer.style.display = 'block';
  });

  // --- Angle Mode Toggle ---
  btnModeRad.addEventListener('click', () => {
    angleMode = 'rad';
    btnModeRad.classList.add('active');
    btnModeDeg.classList.remove('active');
    recalculateSolution();
  });

  btnModeDeg.addEventListener('click', () => {
    angleMode = 'deg';
    btnModeDeg.classList.add('active');
    btnModeRad.classList.remove('active');
    recalculateSolution();
  });

  // --- Keypad Buttons Insertion ---
  keyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const textToInsert = btn.dataset.insert;
      const start = mathInput.selectionStart;
      const end = mathInput.selectionEnd;
      const val = mathInput.value;
      mathInput.value = val.substring(0, start) + textToInsert + val.substring(end);
      mathInput.focus();
      const newPos = start + textToInsert.length;
      mathInput.setSelectionRange(newPos, newPos);
      parseAndEvaluate();
    });
  });

  // --- Presets ---
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      mathInput.value = chip.dataset.formula;
      parseAndEvaluate();
    });
  });

  // --- Copy Solution ---
  btnCopySolution.addEventListener('click', () => {
    const text = resultVal.textContent;
    navigator.clipboard.writeText(text).then(() => {
      const orig = btnCopySolution.textContent;
      btnCopySolution.textContent = 'Copied!';
      btnCopySolution.classList.add('copied');
      setTimeout(() => {
        btnCopySolution.textContent = orig;
        btnCopySolution.classList.remove('copied');
      }, 1500);
    });
  });

  // --- Clear ---
  btnClear.addEventListener('click', () => {
    mathInput.value = '';
    parseErrorBox.style.display = 'none';
    resultVal.textContent = '-';
    resultFormula.textContent = 'Formula cleared.';
    astTreeView.innerHTML = '<span style="color:var(--text-tertiary)">No AST generated.</span>';
    tokensTableBody.innerHTML = '';
    varCard.style.display = 'none';
    astNodeCount.textContent = '0 AST Nodes';
  });

  // --- Live Input Listener ---
  let debounceTimer;
  mathInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(parseAndEvaluate, 250);
  });

  btnEval.addEventListener('click', parseAndEvaluate);

  // Initial Run
  parseAndEvaluate();
});