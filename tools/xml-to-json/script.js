// XML DOM to Structured JSON Converter Script

document.addEventListener('DOMContentLoaded', () => {
  const xmlInput = document.getElementById('xml-input');
  const jsonOutput = document.getElementById('json-output');
  const attrModeSelect = document.getElementById('attr-mode');
  const textKeySelect = document.getElementById('text-key');
  const jsonIndentSelect = document.getElementById('json-indent');
  const xmlSampleSelect = document.getElementById('xml-sample');
  const realtimeToggle = document.getElementById('realtime-toggle');
  const simplifyLeavesCheckbox = document.getElementById('simplify-leaves');
  const autoCoerceCheckbox = document.getElementById('auto-coerce');

  const convertBtn = document.getElementById('convert-btn');
  const clearBtn = document.getElementById('clear-btn');
  const copyBtn = document.getElementById('copy-btn');
  const copyActionBtn = document.getElementById('copy-action-btn');
  const downloadBtn = document.getElementById('download-btn');

  const xmlErrorBanner = document.getElementById('xml-error-banner');
  const jsonSuccessBanner = document.getElementById('json-success-banner');
  const inputStats = document.getElementById('input-stats');
  const outputStats = document.getElementById('output-stats');

  // Sample XML Data
  const SAMPLES = {
    catalog: `<?xml version="1.0" encoding="UTF-8"?>
<catalog store="Downtown Books" version="2.0">
  <book id="bk101" genre="Computer" inStock="true">
    <author>Gambardella, Matthew</author>
    <title>XML Developer's Guide</title>
    <price currency="USD">44.95</price>
    <publishDate>2020-10-01</publishDate>
    <description>An in-depth look at creating applications with XML.</description>
  </book>
  <book id="bk102" genre="Fantasy" inStock="false">
    <author>Ralls, Kim</author>
    <title>Midnight Rain</title>
    <price currency="USD">5.95</price>
    <publishDate>2021-12-16</publishDate>
    <description>A fantasy adventure novel.</description>
  </book>
</catalog>`,

    company: `<?xml version="1.0" encoding="UTF-8"?>
<organization name="Acme Global" founded="2012" active="true">
  <headquarters city="San Francisco" country="USA" />
  <departments>
    <department id="dept-eng">
      <name>Engineering</name>
      <budget currency="USD">1500000</budget>
      <employees count="2">
        <employee id="emp-1" role="Lead">Alice Chen</employee>
        <employee id="emp-2" role="Developer">Bob Smith</employee>
      </employees>
    </department>
    <department id="dept-ops">
      <name>Operations</name>
      <budget currency="USD">600000</budget>
      <employees count="1">
        <employee id="emp-3" role="Manager">Charlie Brown</employee>
      </employees>
    </department>
  </departments>
</organization>`,

    transactions: `<?xml version="1.0" encoding="UTF-8"?>
<transactions batchId="batch-2026-10" totalRecords="2">
  <transaction id="tx-881" status="completed">
    <timestamp>2026-10-03T10:15:30Z</timestamp>
    <amount currency="EUR">2450.75</amount>
    <sender account="DE89370400440532013000">FinTech Systems AG</sender>
    <recipient account="FR7630006000011234567890189">Logistics Europe SARL</recipient>
    <fee>12.50</fee>
  </transaction>
  <transaction id="tx-882" status="pending">
    <timestamp>2026-10-03T10:18:45Z</timestamp>
    <amount currency="EUR">120.00</amount>
    <sender account="DE89370400440532013000">FinTech Systems AG</sender>
    <recipient account="IT60X0542811101000000123456">Digital Services SpA</recipient>
    <fee>1.50</fee>
  </transaction>
</transactions>`
  };

  function updateStats() {
    const inVal = xmlInput.value;
    const inLines = inVal ? inVal.split('\n').length : 0;
    inputStats.textContent = `Lines: ${inLines} | Chars: ${inVal.length}`;

    const outVal = jsonOutput.value;
    const outLines = outVal ? outVal.split('\n').length : 0;
    outputStats.textContent = `Lines: ${outLines} | Chars: ${outVal.length}`;
  }

  function hideBanners() {
    xmlErrorBanner.style.display = 'none';
    xmlErrorBanner.innerHTML = '';
    jsonSuccessBanner.style.display = 'none';
  }

  function escapeXmlText(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function coerceValue(str) {
    if (str === 'true') return true;
    if (str === 'false') return false;
    if (str === 'null') return null;
    if (str.trim() !== '' && !isNaN(str) && !isNaN(parseFloat(str)) && isFinite(str) && !/^\s*0\d+/.test(str)) {
      return Number(str);
    }
    return str;
  }

  // Parse XML using DOMParser
  function parseXml(raw) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(raw, 'application/xml');
    const parserError = doc.querySelector('parsererror');

    if (parserError) {
      const rawError = parserError.textContent || '';
      const lineMatch = rawError.match(/line\s*(?:number)?\s*[:#]?\s*(\d+)/i) || rawError.match(/on\s+line\s+(\d+)/i);
      const colMatch = rawError.match(/col(?:umn)?\s*[:#]?\s*(\d+)/i) || rawError.match(/at\s+column\s+(\d+)/i);

      const lineNum = lineMatch ? parseInt(lineMatch[1], 10) : null;
      const colNum = colMatch ? parseInt(colMatch[1], 10) : null;

      let cleanMsg = rawError
        .replace(/Below is a rendering of the page up to the first error\./gi, '')
        .replace(/This page contains the following errors:\s*/gi, '')
        .trim();

      return {
        ok: false,
        error: cleanMsg,
        line: lineNum,
        col: colNum
      };
    }

    return { ok: true, doc };
  }

  // Recursive XML Node to JSON
  function convertNode(node, options) {
    if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.CDATA_SECTION_NODE) {
      const text = node.nodeValue.trim();
      if (!text) return null;
      return options.autoCoerce ? coerceValue(text) : text;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const obj = {};
      const attrs = {};
      let hasAttrs = false;

      // Extract attributes
      if (options.attrMode !== 'strip' && node.attributes && node.attributes.length > 0) {
        for (let i = 0; i < node.attributes.length; i++) {
          const attr = node.attributes[i];
          const val = options.autoCoerce ? coerceValue(attr.value) : attr.value;
          attrs[attr.name] = val;
          hasAttrs = true;
        }
      }

      // Assign attributes based on mode
      if (hasAttrs) {
        if (options.attrMode === 'prefix') {
          for (const [k, v] of Object.entries(attrs)) {
            obj['@' + k] = v;
          }
        } else if (options.attrMode === 'nested') {
          obj['@attributes'] = attrs;
        } else if (options.attrMode === 'flat') {
          for (const [k, v] of Object.entries(attrs)) {
            obj[k] = v;
          }
        }
      }

      // Process children
      const textParts = [];
      const childrenByTag = {};
      let childElementCount = 0;

      for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];
        if (child.nodeType === Node.ELEMENT_NODE) {
          childElementCount++;
          const tagName = child.nodeName;
          const convertedChild = convertNode(child, options);
          if (!childrenByTag[tagName]) {
            childrenByTag[tagName] = [];
          }
          childrenByTag[tagName].push(convertedChild);
        } else if (child.nodeType === Node.TEXT_NODE || child.nodeType === Node.CDATA_SECTION_NODE) {
          const t = child.nodeValue.trim();
          if (t) textParts.push(t);
        }
      }

      const fullText = textParts.join(' ').trim();

      // Leaf element with no child elements
      if (childElementCount === 0) {
        if (!hasAttrs && options.simplifyLeaves) {
          return fullText ? (options.autoCoerce ? coerceValue(fullText) : fullText) : (hasAttrs ? obj : null);
        }
        if (fullText) {
          obj[options.textKey] = options.autoCoerce ? coerceValue(fullText) : fullText;
        }
        return obj;
      }

      // Mixed element with text and child elements
      if (fullText) {
        obj[options.textKey] = options.autoCoerce ? coerceValue(fullText) : fullText;
      }

      // Sibling elements grouping into arrays
      for (const [tagName, arr] of Object.entries(childrenByTag)) {
        if (arr.length === 1) {
          obj[tagName] = arr[0];
        } else {
          obj[tagName] = arr;
        }
      }

      return obj;
    }

    return null;
  }

  // XML to JSON Converter
  function convertXmlToJson() {
    hideBanners();
    const raw = xmlInput.value.trim();
    if (!raw) {
      jsonOutput.value = '';
      updateStats();
      return;
    }

    const parseResult = parseXml(raw);
    if (!parseResult.ok) {
      const lines = raw.split('\n');
      let snippetHtml = '';
      if (parseResult.line !== null && lines[parseResult.line - 1] !== undefined) {
        snippetHtml = `<div style="margin-top: 0.5rem; padding: 0.5rem; background: rgba(0,0,0,0.3); border-radius: var(--radius-sm); font-family: monospace; font-size: 0.8rem;">
          <strong>Line ${parseResult.line}:</strong> ${escapeXmlText(lines[parseResult.line - 1])}
        </div>`;
      }

      const locationStr = parseResult.line ? `Line ${parseResult.line}${parseResult.col ? `, Column ${parseResult.col}` : ''}` : 'Position unspecified';

      xmlErrorBanner.innerHTML = `
        <strong>Malformed XML (${locationStr})</strong>
        <div>${escapeXmlText(parseResult.error.slice(0, 300))}</div>
        ${snippetHtml}
      `;
      xmlErrorBanner.style.display = 'block';
      jsonOutput.value = '';
      updateStats();
      return;
    }

    const options = {
      attrMode: attrModeSelect.value,
      textKey: textKeySelect.value,
      simplifyLeaves: simplifyLeavesCheckbox.checked,
      autoCoerce: autoCoerceCheckbox.checked
    };

    const rootElement = parseResult.doc.documentElement;
    const rootTagName = rootElement.nodeName;
    const convertedContent = convertNode(rootElement, options);

    const result = {
      [rootTagName]: convertedContent
    };

    const indentMode = jsonIndentSelect.value;
    let space = 2;
    if (indentMode === '4') space = 4;
    else if (indentMode === 'compact') space = 0;

    jsonOutput.value = space === 0 ? JSON.stringify(result) : JSON.stringify(result, null, space);
    updateStats();
    jsonSuccessBanner.style.display = 'block';
  }

  // Real-time debounced converter
  let debounceTimer = null;
  function triggerRealtime() {
    updateStats();
    if (realtimeToggle.checked) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        convertXmlToJson();
      }, 250);
    }
  }

  xmlInput.addEventListener('input', triggerRealtime);

  // Load sample XML
  xmlSampleSelect.addEventListener('change', () => {
    const val = xmlSampleSelect.value;
    if (val && SAMPLES[val]) {
      xmlInput.value = SAMPLES[val];
      updateStats();
      convertXmlToJson();
    }
  });

  // Action buttons
  convertBtn.addEventListener('click', convertXmlToJson);

  clearBtn.addEventListener('click', () => {
    xmlInput.value = '';
    jsonOutput.value = '';
    xmlSampleSelect.value = '';
    hideBanners();
    updateStats();
    xmlInput.focus();
  });

  // Copy to clipboard
  function copyOutput() {
    const text = jsonOutput.value;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      copyActionBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
        copyBtn.classList.remove('copied');
        copyActionBtn.textContent = 'Copy JSON';
      }, 2000);
    });
  }

  // Download .json
  function downloadJson() {
    const text = jsonOutput.value;
    if (!text) return;
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  copyBtn.addEventListener('click', copyOutput);
  copyActionBtn.addEventListener('click', copyOutput);
  downloadBtn.addEventListener('click', downloadJson);

  // Option listeners
  attrModeSelect.addEventListener('change', () => { if (xmlInput.value.trim()) convertXmlToJson(); });
  textKeySelect.addEventListener('change', () => { if (xmlInput.value.trim()) convertXmlToJson(); });
  jsonIndentSelect.addEventListener('change', () => { if (xmlInput.value.trim()) convertXmlToJson(); });
  simplifyLeavesCheckbox.addEventListener('change', () => { if (xmlInput.value.trim()) convertXmlToJson(); });
  autoCoerceCheckbox.addEventListener('change', () => { if (xmlInput.value.trim()) convertXmlToJson(); });

  // Initial stats
  updateStats();
});