// SQL Formatter & Beautifier Script

document.addEventListener('DOMContentLoaded', () => {
  const sqlInput = document.getElementById('sql-input');
  const sqlOutput = document.getElementById('sql-output');
  const sqlDialect = document.getElementById('sql-dialect');
  const sqlCase = document.getElementById('sql-case');
  const sqlIndent = document.getElementById('sql-indent');
  const sqlSample = document.getElementById('sql-sample');
  const breakClauses = document.getElementById('break-clauses');
  const breakOperators = document.getElementById('break-operators');

  const formatBtn = document.getElementById('format-btn');
  const minifyBtn = document.getElementById('minify-btn');
  const clearBtn = document.getElementById('clear-btn');
  const copyBtn = document.getElementById('copy-btn');
  const copyActionBtn = document.getElementById('copy-action-btn');
  const downloadBtn = document.getElementById('download-btn');

  const inputStats = document.getElementById('input-stats');
  const outputStats = document.getElementById('output-stats');
  const sqlMsg = document.getElementById('sql-msg');

  // Sample Queries
  const SAMPLES = {
    joins: `SELECT u.id, u.username, u.email, p.full_name, COUNT(o.id) AS total_orders, SUM(o.total_amount) AS lifetime_value, MAX(o.created_at) AS last_order_date
FROM users u
INNER JOIN profiles p ON u.id = p.user_id
LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'completed'
WHERE u.status = 'active' AND (u.country_code = 'US' OR u.country_code = 'CA') AND u.created_at >= '2024-01-01'
GROUP BY u.id, u.username, u.email, p.full_name
HAVING COUNT(o.id) > 2 AND SUM(o.total_amount) >= 150.00
ORDER BY lifetime_value DESC, total_orders DESC
LIMIT 50 OFFSET 0;`,

    insert: `INSERT INTO customers (id, first_name, last_name, email, phone, status, loyalty_points, created_at)
VALUES
  (1, 'Jane', 'Doe', 'jane.doe@example.com', '+1-555-0101', 'active', 450, CURRENT_TIMESTAMP),
  (2, 'John', 'Smith', 'john.smith@example.com', '+1-555-0102', 'pending', 120, CURRENT_TIMESTAMP),
  (3, 'Emily', 'Clark', 'emily.c@example.com', NULL, 'active', 890, CURRENT_TIMESTAMP);`,

    create: `CREATE TABLE organization_memberships (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  org_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  role_title VARCHAR(100) NOT NULL DEFAULT 'Member',
  access_level INT NOT NULL DEFAULT 1,
  is_billing_admin BOOLEAN NOT NULL DEFAULT FALSE,
  invited_by BIGINT,
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_org FOREIGN KEY (org_id) REFERENCES organizations (id) ON DELETE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT uq_org_user UNIQUE (org_id, user_id),
  INDEX idx_org_role (org_id, role_title)
);`
  };

  // Keyword dictionary
  const SQL_KEYWORDS = new Set([
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL', 'LIKE', 'ILIKE',
    'BETWEEN', 'EXISTS', 'AS', 'ON', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER',
    'CROSS', 'NATURAL', 'ORDER', 'BY', 'GROUP', 'HAVING', 'ASC', 'DESC', 'LIMIT', 'OFFSET',
    'TOP', 'DISTINCT', 'ALL', 'UNION', 'INTERSECT', 'EXCEPT', 'MINUS', 'INSERT', 'INTO',
    'VALUES', 'UPDATE', 'SET', 'DELETE', 'TRUNCATE', 'CREATE', 'ALTER', 'DROP', 'TABLE',
    'VIEW', 'INDEX', 'DATABASE', 'SCHEMA', 'COLUMN', 'CONSTRAINT', 'PRIMARY', 'KEY', 'FOREIGN',
    'REFERENCES', 'DEFAULT', 'CHECK', 'UNIQUE', 'CASCADE', 'RESTRICT', 'AUTO_INCREMENT',
    'AUTOINCREMENT', 'IDENTITY', 'WITH', 'RECURSIVE', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
    'CAST', 'COALESCE', 'NULLIF', 'CONCAT', 'SUBSTRING', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
    'VARCHAR', 'CHAR', 'INT', 'INTEGER', 'BIGINT', 'SMALLINT', 'TINYINT', 'DECIMAL', 'NUMERIC',
    'FLOAT', 'DOUBLE', 'REAL', 'BOOLEAN', 'DATE', 'TIME', 'TIMESTAMP', 'TEXT', 'BLOB', 'JSON',
    'JSONB', 'SERIAL', 'BIGSERIAL', 'UUID', 'BEGIN', 'COMMIT', 'ROLLBACK', 'TRANSACTION',
    'SAVEPOINT', 'TRUE', 'FALSE', 'RETURNING', 'MERGE', 'USING', 'MATCHED', 'OVER',
    'PARTITION', 'WINDOW', 'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'LEAD', 'LAG', 'QUALIFY',
    'FETCH', 'FIRST', 'NEXT', 'ROWS', 'ONLY', 'COLLATE', 'ADD', 'MODIFY', 'PRAGMA', 'EXEC'
  ]);

  // Major top-level clauses (always start new line at root or outer scope)
  const MAJOR_CLAUSES = [
    'INSERT INTO', 'INSERT', 'VALUES',
    'DELETE FROM', 'DELETE',
    'TRUNCATE TABLE',
    'CREATE TABLE', 'CREATE OR REPLACE TABLE', 'CREATE TEMPORARY TABLE',
    'ALTER TABLE', 'DROP TABLE',
    'CREATE UNIQUE INDEX', 'CREATE INDEX', 'DROP INDEX',
    'CREATE VIEW', 'DROP VIEW',
    'SELECT DISTINCT', 'SELECT',
    'FROM', 'WHERE',
    'GROUP BY', 'HAVING',
    'ORDER BY', 'LIMIT', 'OFFSET', 'FETCH FIRST', 'FETCH NEXT',
    'UNION ALL', 'UNION', 'INTERSECT', 'EXCEPT', 'MINUS',
    'UPDATE', 'SET',
    'WITH RECURSIVE', 'WITH',
    'RETURNING', 'MERGE INTO', 'USING',
    'WHEN MATCHED', 'WHEN NOT MATCHED',
    'QUALIFY', 'WINDOW'
  ];

  // Secondary clauses that can break to new line
  const SECONDARY_CLAUSES = [
    'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN',
    'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN', 'NATURAL JOIN', 'JOIN',
    'ON',
    'AND', 'OR'
  ];

  function showMessage(type, text) {
    sqlMsg.className = `toast-msg toast-${type}`;
    sqlMsg.textContent = text;
    sqlMsg.style.display = 'block';
  }

  function hideMessage() {
    sqlMsg.style.display = 'none';
    sqlMsg.textContent = '';
  }

  function updateStats() {
    const inVal = sqlInput.value;
    const inLines = inVal ? inVal.split('\n').length : 0;
    inputStats.textContent = `Lines: ${inLines} | Chars: ${inVal.length}`;

    const outVal = sqlOutput.value;
    const outLines = outVal ? outVal.split('\n').length : 0;
    outputStats.textContent = `Lines: ${outLines} | Chars: ${outVal.length}`;
  }

  sqlInput.addEventListener('input', updateStats);

  // Load sample query
  sqlSample.addEventListener('change', () => {
    const val = sqlSample.value;
    if (val && SAMPLES[val]) {
      sqlInput.value = SAMPLES[val];
      updateStats();
      formatSQL();
    }
  });

  // Tokenizer
  function tokenize(sql, dialect) {
    const tokens = [];
    let i = 0;
    const len = sql.length;

    while (i < len) {
      const char = sql[i];

      // Whitespace
      if (/\s/.test(char)) {
        i++;
        continue;
      }

      // Line comments -- or # (MySQL)
      if ((char === '-' && sql[i + 1] === '-') || (char === '#' && dialect === 'mysql')) {
        let start = i;
        while (i < len && sql[i] !== '\n') i++;
        tokens.push({ type: 'comment', value: sql.substring(start, i) });
        continue;
      }

      // Block comment /* ... */
      if (char === '/' && sql[i + 1] === '*') {
        let start = i;
        i += 2;
        while (i < len && !(sql[i] === '*' && sql[i + 1] === '/')) i++;
        i += 2;
        tokens.push({ type: 'comment', value: sql.substring(start, i) });
        continue;
      }

      // Dollar-quoted strings in PostgreSQL: $$...$$ or $tag$...$tag$
      if (dialect === 'postgresql' && char === '$') {
        const match = sql.substring(i).match(/^\$([a-zA-Z0-9_]*)\$/);
        if (match) {
          const tag = match[0];
          const start = i;
          i += tag.length;
          const endIdx = sql.indexOf(tag, i);
          if (endIdx !== -1) {
            i = endIdx + tag.length;
            tokens.push({ type: 'string', value: sql.substring(start, i) });
            continue;
          }
        }
      }

      // Single-quoted String literal
      if (char === "'" || (char === 'N' && sql[i + 1] === "'" && dialect === 'tsql')) {
        let start = i;
        if (char === 'N') i++;
        i++; // skip opening '
        while (i < len) {
          if (sql[i] === "'") {
            if (sql[i + 1] === "'") {
              i += 2; // escaped quote
            } else {
              i++;
              break;
            }
          } else if (sql[i] === '\\' && sql[i + 1] !== undefined) {
            i += 2;
          } else {
            i++;
          }
        }
        tokens.push({ type: 'string', value: sql.substring(start, i) });
        continue;
      }

      // Double-quoted identifier
      if (char === '"') {
        let start = i;
        i++;
        while (i < len && sql[i] !== '"') {
          if (sql[i] === '\\' && sql[i + 1] !== undefined) i += 2;
          else i++;
        }
        if (i < len) i++;
        tokens.push({ type: 'identifier', value: sql.substring(start, i) });
        continue;
      }

      // MySQL backtick identifier `...`
      if (char === '`') {
        let start = i;
        i++;
        while (i < len && sql[i] !== '`') i++;
        if (i < len) i++;
        tokens.push({ type: 'identifier', value: sql.substring(start, i) });
        continue;
      }

      // T-SQL bracket identifier [...]
      if (char === '[' && dialect === 'tsql') {
        let start = i;
        i++;
        while (i < len && sql[i] !== ']') i++;
        if (i < len) i++;
        tokens.push({ type: 'identifier', value: sql.substring(start, i) });
        continue;
      }

      // Parentheses & delimiters
      if (char === '(' || char === ')' || char === ',' || char === ';') {
        tokens.push({ type: 'punct', value: char });
        i++;
        continue;
      }

      // Operators
      const op2 = sql.substring(i, i + 2);
      const op3 = sql.substring(i, i + 3);
      if (op3 === '->>') {
        tokens.push({ type: 'operator', value: op3 });
        i += 3;
        continue;
      }
      if (['<>', '!=', '<=', '>=', '::', ':=', '||', '->'].includes(op2)) {
        tokens.push({ type: 'operator', value: op2 });
        i += 2;
        continue;
      }
      if (['=', '<', '>', '+', '-', '*', '/', '%', '&', '|', '^', '~'].includes(char)) {
        tokens.push({ type: 'operator', value: char });
        i++;
        continue;
      }

      // Number literal
      if (/\d/.test(char) || (char === '.' && /\d/.test(sql[i + 1] || ''))) {
        let start = i;
        while (i < len && /[\d.eE_xXa-fA-F+-]/.test(sql[i])) {
          if ((sql[i] === '+' || sql[i] === '-') && !/[eE]/.test(sql[i - 1])) break;
          i++;
        }
        tokens.push({ type: 'number', value: sql.substring(start, i) });
        continue;
      }

      // Word / Identifier / Keyword (including @variable in T-SQL or $1 in PG)
      if (/[a-zA-Z0-9_@$#]/.test(char)) {
        let start = i;
        while (i < len && /[a-zA-Z0-9_@$#]/.test(sql[i])) {
          i++;
        }
        const val = sql.substring(start, i);
        tokens.push({ type: 'word', value: val });
        continue;
      }

      // Other single punctuation (e.g. dot)
      tokens.push({ type: 'punct', value: char });
      i++;
    }

    return tokens;
  }

  // Pre-combine compound clauses (e.g. "GROUP" + "BY" => "GROUP BY")
  function combineTokens(tokens) {
    const combined = [];
    let i = 0;
    while (i < tokens.length) {
      const cur = tokens[i];
      const next1 = tokens[i + 1];
      const next2 = tokens[i + 2];

      // 3-word clauses
      if (cur.type === 'word' && next1?.type === 'word' && next2?.type === 'word') {
        const three = `${cur.value} ${next1.value} ${next2.value}`.toUpperCase();
        if (['LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN', 'CREATE OR REPLACE TABLE', 'CREATE TEMPORARY TABLE', 'FETCH FIRST ROW', 'FETCH NEXT ROW'].includes(three)) {
          combined.push({ type: 'clause', value: `${cur.value} ${next1.value} ${next2.value}`, upper: three });
          i += 3;
          continue;
        }
      }

      // 2-word clauses
      if (cur.type === 'word' && next1?.type === 'word') {
        const two = `${cur.value} ${next1.value}`.toUpperCase();
        if ([
          'GROUP BY', 'ORDER BY', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN',
          'CROSS JOIN', 'NATURAL JOIN', 'UNION ALL', 'INSERT INTO', 'DELETE FROM',
          'TRUNCATE TABLE', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE',
          'CREATE INDEX', 'DROP INDEX', 'CREATE VIEW', 'DROP VIEW', 'WITH RECURSIVE',
          'MERGE INTO', 'WHEN MATCHED', 'WHEN NOT MATCHED', 'SELECT DISTINCT',
          'PARTITION BY', 'FETCH FIRST', 'FETCH NEXT', 'PRIMARY KEY', 'FOREIGN KEY'
        ].includes(two)) {
          combined.push({ type: 'clause', value: `${cur.value} ${next1.value}`, upper: two });
          i += 2;
          continue;
        }
      }

      combined.push(cur);
      i++;
    }
    return combined;
  }

  // Formatting Engine
  function formatSQL() {
    hideMessage();
    const raw = sqlInput.value.trim();
    if (!raw) {
      sqlOutput.value = '';
      updateStats();
      return;
    }

    // Quick syntax checks
    const openParens = (raw.match(/\(/g) || []).length;
    const closeParens = (raw.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      showMessage('error', `Warning: Unbalanced parentheses detected (${openParens} opening vs ${closeParens} closing).`);
    }

    const dialect = sqlDialect.value;
    const casePref = sqlCase.value;
    const indentPref = sqlIndent.value;
    const doBreakClauses = breakClauses.checked;
    const doBreakOps = breakOperators.checked;

    let indentUnit = '  ';
    if (indentPref === '4') indentUnit = '    ';
    else if (indentPref === 'tab') indentUnit = '\t';

    const rawTokens = tokenize(raw, dialect);
    const tokens = combineTokens(rawTokens);

    let output = '';
    let indentLevel = 0;
    let parenStack = []; // stores { type: 'subquery' | 'create' | 'list', indent: number }
    let lastToken = null;
    let atLineStart = true;
    let isInsideCreateTable = false;

    function applyCase(word) {
      if (casePref === 'upper') return word.toUpperCase();
      if (casePref === 'lower') return word.toLowerCase();
      return word;
    }

    function getIndent() {
      return indentUnit.repeat(Math.max(0, indentLevel));
    }

    function newline() {
      output = output.trimEnd() + '\n' + getIndent();
      atLineStart = true;
    }

    function append(text, spacing = ' ') {
      if (atLineStart) {
        output += text;
        atLineStart = false;
      } else {
        output += (spacing ? spacing : '') + text;
      }
    }

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      const upperVal = tok.value.toUpperCase();

      // Check if keyword / clause
      const isMajor = MAJOR_CLAUSES.some(c => c === upperVal || (tok.upper && tok.upper === c));
      const isSecondary = SECONDARY_CLAUSES.some(c => c === upperVal || (tok.upper && tok.upper === c));

      // Semicolon statement end
      if (tok.value === ';') {
        output = output.trimEnd() + ';';
        if (i + 1 < tokens.length) {
          output += '\n\n';
          indentLevel = 0;
          isInsideCreateTable = false;
          atLineStart = true;
        }
        lastToken = tok;
        continue;
      }

      // Opening Parenthesis
      if (tok.value === '(') {
        // Detect if subquery or create table
        const nextTok = tokens[i + 1];
        const nextUpper = nextTok ? nextTok.value.toUpperCase() : '';
        const isSubquery = nextUpper === 'SELECT' || nextUpper === 'WITH';
        const isTableDef = lastToken && (lastToken.upper === 'CREATE TABLE' || lastToken.upper === 'ALTER TABLE' || isInsideCreateTable);

        if (isSubquery || isTableDef) {
          append('(');
          indentLevel++;
          newline();
          parenStack.push({ isMulti: true });
        } else {
          // Compact inline list or function call argument: count(*), IN (1, 2)
          append('(', (lastToken && lastToken.type === 'word' && SQL_KEYWORDS.has(lastToken.value.toUpperCase())) || lastToken?.type === 'identifier' ? '' : ' ');
          parenStack.push({ isMulti: false });
        }
        lastToken = tok;
        continue;
      }

      // Closing Parenthesis
      if (tok.value === ')') {
        const top = parenStack.pop();
        if (top && top.isMulti) {
          indentLevel = Math.max(0, indentLevel - 1);
          newline();
          append(')');
        } else {
          append(')', '');
        }
        lastToken = tok;
        continue;
      }

      // Comma
      if (tok.value === ',') {
        append(',', '');
        const currentParen = parenStack[parenStack.length - 1];
        if (isInsideCreateTable || (currentParen && currentParen.isMulti)) {
          newline();
        } else if (doBreakClauses && parenStack.length === 0) {
          // Break lines after commas in top-level SELECT projection or VALUES
          newline();
        } else {
          append('', ' ');
        }
        lastToken = tok;
        continue;
      }

      // Major Clause
      if (isMajor) {
        if (upperVal.includes('CREATE TABLE')) {
          isInsideCreateTable = true;
        }
        if (doBreakClauses && output.trim().length > 0) {
          if (!atLineStart) {
            output = output.trimEnd() + '\n';
            atLineStart = true;
          }
          output += getIndent();
        }
        const formattedClause = tok.value.split(/\s+/).map(w => applyCase(w)).join(' ');
        append(formattedClause, atLineStart ? '' : ' ');
        lastToken = tok;
        continue;
      }

      // Secondary Clause (JOINs, ON, AND, OR)
      if (isSecondary) {
        const isLogical = upperVal === 'AND' || upperVal === 'OR';
        if (isLogical) {
          if (doBreakOps) {
            output = output.trimEnd() + '\n';
            atLineStart = true;
            // Indent logical operators one step inside WHERE/ON
            output += indentUnit.repeat(indentLevel + 1);
            append(applyCase(tok.value), '');
          } else {
            append(applyCase(tok.value), ' ');
          }
        } else if (upperVal.includes('JOIN')) {
          if (doBreakClauses) {
            output = output.trimEnd() + '\n';
            atLineStart = true;
            output += getIndent();
            append(tok.value.split(/\s+/).map(w => applyCase(w)).join(' '), '');
          } else {
            append(tok.value.split(/\s+/).map(w => applyCase(w)).join(' '), ' ');
          }
        } else if (upperVal === 'ON') {
          append(applyCase(tok.value), ' ');
        } else {
          append(applyCase(tok.value), ' ');
        }
        lastToken = tok;
        continue;
      }

      // Regular Keyword or Function
      if (tok.type === 'word' && SQL_KEYWORDS.has(upperVal)) {
        append(applyCase(tok.value), atLineStart ? '' : ' ');
        lastToken = tok;
        continue;
      }

      // Dot operator (.) - no spaces around it e.g. u.id
      if (tok.value === '.') {
        append('.', '');
        lastToken = tok;
        continue;
      }

      // If last token was dot, attach identifier with no leading space
      if (lastToken && lastToken.value === '.') {
        append(tok.value, '');
        lastToken = tok;
        continue;
      }

      // Comments
      if (tok.type === 'comment') {
        if (!atLineStart) newline();
        append(tok.value, '');
        newline();
        lastToken = tok;
        continue;
      }

      // Standard tokens (identifiers, strings, numbers, operators)
      let spaceBefore = atLineStart ? '' : ' ';
      if (tok.type === 'operator' && tok.value === '::') {
        spaceBefore = '';
      }
      append(tok.value, spaceBefore);
      lastToken = tok;
    }

    sqlOutput.value = output.trim();
    updateStats();
    if (sqlMsg.style.display !== 'block') {
      showMessage('success', 'SQL formatted successfully.');
    }
  }

  // Minify SQL
  function minifySQL() {
    hideMessage();
    const raw = sqlInput.value.trim();
    if (!raw) {
      sqlOutput.value = '';
      updateStats();
      return;
    }

    const dialect = sqlDialect.value;
    const tokens = tokenize(raw, dialect);

    // Strip comments and collapse whitespace
    let minified = '';
    let lastTok = null;

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      if (tok.type === 'comment') continue;

      let val = tok.value;
      if (tok.type === 'word' && SQL_KEYWORDS.has(val.toUpperCase()) && sqlCase.value === 'upper') {
        val = val.toUpperCase();
      } else if (tok.type === 'word' && SQL_KEYWORDS.has(val.toUpperCase()) && sqlCase.value === 'lower') {
        val = val.toLowerCase();
      }

      if (tok.value === '.') {
        minified += '.';
      } else if (lastTok && lastTok.value === '.') {
        minified += val;
      } else if (tok.value === ',' || tok.value === ';' || tok.value === ')') {
        minified = minified.trimEnd() + val;
      } else if (tok.value === '(') {
        if (lastTok && (lastTok.type === 'word' || lastTok.type === 'identifier')) {
          minified = minified.trimEnd() + '(';
        } else {
          minified += ' (';
        }
      } else {
        if (minified.length > 0 && !minified.endsWith(' ') && !minified.endsWith('(')) {
          minified += ' ';
        }
        minified += val;
      }
      lastTok = tok;
    }

    sqlOutput.value = minified.trim();
    updateStats();
    showMessage('success', 'SQL minified successfully.');
  }

  // Copy to clipboard
  function copyOutput() {
    const text = sqlOutput.value;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      copyActionBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
        copyBtn.classList.remove('copied');
        copyActionBtn.textContent = 'Copy Query';
      }, 2000);
    });
  }

  // Download .sql file
  function downloadSQL() {
    const text = sqlOutput.value || sqlInput.value;
    if (!text) return;
    const blob = new Blob([text], { type: 'text/sql;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query-${Date.now()}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Event Listeners
  formatBtn.addEventListener('click', formatSQL);
  minifyBtn.addEventListener('click', minifySQL);
  copyBtn.addEventListener('click', copyOutput);
  copyActionBtn.addEventListener('click', copyOutput);
  downloadBtn.addEventListener('click', downloadSQL);

  clearBtn.addEventListener('click', () => {
    sqlInput.value = '';
    sqlOutput.value = '';
    sqlSample.value = '';
    hideMessage();
    updateStats();
    sqlInput.focus();
  });

  // Re-format on dialect or casing change if input exists
  sqlDialect.addEventListener('change', () => { if (sqlInput.value.trim()) formatSQL(); });
  sqlCase.addEventListener('change', () => { if (sqlInput.value.trim()) formatSQL(); });
  sqlIndent.addEventListener('change', () => { if (sqlInput.value.trim()) formatSQL(); });
  breakClauses.addEventListener('change', () => { if (sqlInput.value.trim()) formatSQL(); });
  breakOperators.addEventListener('change', () => { if (sqlInput.value.trim()) formatSQL(); });

  // Initial load
  updateStats();
});