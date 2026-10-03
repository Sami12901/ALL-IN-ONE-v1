// Deep JSON to XML Converter Script

document.addEventListener('DOMContentLoaded', () => {
  const jsonInput = document.getElementById('json-input');
  const xmlOutput = document.getElementById('xml-output');
  const rootElementInput = document.getElementById('root-element');
  const itemElementInput = document.getElementById('item-element');
  const attrPrefixInput = document.getElementById('attr-prefix');
  const xmlIndentSelect = document.getElementById('xml-indent');
  const sampleJsonSelect = document.getElementById('sample-json');
  const realtimeToggle = document.getElementById('realtime-toggle');
  const xmlDeclarationCheckbox = document.getElementById('xml-declaration');

  const convertBtn = document.getElementById('convert-btn');
  const clearBtn = document.getElementById('clear-btn');
  const copyBtn = document.getElementById('copy-btn');
  const copyActionBtn = document.getElementById('copy-action-btn');
  const downloadBtn = document.getElementById('download-btn');

  const jsonErrorBanner = document.getElementById('json-error-banner');
  const xmlSuccessBanner = document.getElementById('xml-success-banner');
  const inputStats = document.getElementById('input-stats');
  const outputStats = document.getElementById('output-stats');

  // Sample Datasets
  const SAMPLES = {
    ecommerce: JSON.stringify({
      "@version": "1.0",
      "@encoding": "UTF-8",
      "store": {
        "@id": "store-us-east",
        "name": "Global Tech Emporium",
        "currency": "USD",
        "products": [
          {
            "@sku": "TECH-001",
            "@category": "hardware",
            "name": "Mechanical Keyboard RGB",
            "price": {
              "@currency": "USD",
              "#text": 129.99
            },
            "inStock": true,
            "tags": ["gaming", "peripherals", "rgb"]
          },
          {
            "@sku": "TECH-002",
            "@category": "monitors",
            "name": "4K Ultra-Wide Monitor 34-inch",
            "price": {
              "@currency": "USD",
              "#text": 599.00
            },
            "inStock": false,
            "tags": ["displays", "ultrawide", "hdr"]
          }
        ]
      }
    }, null, 2),

    userlist: JSON.stringify({
      "@service": "AuthService",
      "@timestamp": "2026-10-03T11:00:00Z",
      "accounts": [
        {
          "@userId": "1001",
          "@status": "active",
          "username": "alex.chen",
          "email": "alex.chen@example.com",
          "roles": ["Administrator", "Developer"],
          "profile": {
            "fullName": "Alex Chen",
            "department": "Infrastructure",
            "accessLevel": 10
          }
        },
        {
          "@userId": "1002",
          "@status": "invited",
          "username": "sarah.m",
          "email": "sarah.m@example.com",
          "roles": ["Designer"],
          "profile": {
            "fullName": "Sarah Miller",
            "department": "Creative",
            "accessLevel": 4
          }
        }
      ]
    }, null, 2),

    nestedarray: JSON.stringify({
      "company": {
        "name": "Nexus Dynamics",
        "departments": [
          {
            "name": "Engineering",
            "teams": [
              { "name": "Frontend", "leads": ["Diana", "Eric"] },
              { "name": "Backend", "leads": ["Frank", "Grace"] }
            ]
          },
          {
            "name": "Marketing",
            "teams": [
              { "name": "Growth", "leads": ["Helen"] },
              { "name": "Brand", "leads": ["Ian", "Julia"] }
            ]
          }
        ]
      }
    }, null, 2)
  };

  function updateStats() {
    const inVal = jsonInput.value;
    const inLines = inVal ? inVal.split('\n').length : 0;
    inputStats.textContent = `Lines: ${inLines} | Chars: ${inVal.length}`;

    const outVal = xmlOutput.value;
    const outLines = outVal ? outVal.split('\n').length : 0;
    outputStats.textContent = `Lines: ${outLines} | Chars: ${outVal.length}`;
  }

  function hideBanners() {
    jsonErrorBanner.style.display = 'none';
    jsonErrorBanner.innerHTML = '';
    xmlSuccessBanner.style.display = 'none';
  }

  function escapeXmlText(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function escapeXmlAttr(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function sanitizeTagName(name) {
    let tag = String(name).trim().replace(/[^a-zA-Z0-9_\-.:]/g, '_');
    if (!tag || /^[^a-zA-Z_]/.test(tag)) {
      tag = '_' + tag;
    }
    return tag;
  }

  // Parse JSON with exact line and column feedback
  function parseJSON(raw) {
    try {
      const data = JSON.parse(raw);
      return { ok: true, data };
    } catch (err) {
      let lineNum = null;
      let colNum = null;

      // Extract line/column from modern V8 error message e.g. "... (line 3 column 5)"
      const lineColMatch = err.message.match(/line\s+(\d+)\s+column\s+(\d+)/i);
      if (lineColMatch) {
        lineNum = parseInt(lineColMatch[1], 10);
        colNum = parseInt(lineColMatch[2], 10);
      } else {
        // Fallback: extract position
        const posMatch = err.message.match(/at position (\d+)/i);
        if (posMatch) {
          const pos = parseInt(posMatch[1], 10);
          const lines = raw.substring(0, pos).split('\n');
          lineNum = lines.length;
          colNum = lines[lines.length - 1].length + 1;
        }
      }

      return {
        ok: false,
        message: err.message,
        line: lineNum,
        col: colNum
      };
    }
  }

  // Deep JSON to XML converter
  function convertJsonToXml() {
    hideBanners();
    const raw = jsonInput.value.trim();
    if (!raw) {
      xmlOutput.value = '';
      updateStats();
      return;
    }

    const parseResult = parseJSON(raw);
    if (!parseResult.ok) {
      const lines = raw.split('\n');
      let snippetHtml = '';
      if (parseResult.line !== null && lines[parseResult.line - 1] !== undefined) {
        snippetHtml = `<div style="margin-top: 0.5rem; padding: 0.5rem; background: rgba(0,0,0,0.3); border-radius: var(--radius-sm); font-family: monospace; font-size: 0.8rem;">
          <strong>Line ${parseResult.line}:</strong> ${escapeXmlText(lines[parseResult.line - 1])}
        </div>`;
      }

      const locationStr = parseResult.line ? `Line ${parseResult.line}${parseResult.col ? `, Column ${parseResult.col}` : ''}` : 'Position unspecified';

      jsonErrorBanner.innerHTML = `
        <strong>Invalid JSON (${locationStr})</strong>
        <div>${escapeXmlText(parseResult.message)}</div>
        ${snippetHtml}
      `;
      jsonErrorBanner.style.display = 'block';
      xmlOutput.value = '';
      updateStats();
      return;
    }

    const data = parseResult.data;
    const rootName = sanitizeTagName(rootElementInput.value || 'root');
    const itemName = sanitizeTagName(itemElementInput.value || 'item');
    const attrPrefix = attrPrefixInput.value || '@';
    const indentMode = xmlIndentSelect.value;
    const withDeclaration = xmlDeclarationCheckbox.checked;

    let indentStr = '  ';
    let isCompact = false;
    if (indentMode === '4') indentStr = '    ';
    else if (indentMode === 'tab') indentStr = '\t';
    else if (indentMode === 'compact') {
      indentStr = '';
      isCompact = true;
    }

    function serialize(tagName, val, level) {
      const tag = sanitizeTagName(tagName);
      const indent = isCompact ? '' : indentStr.repeat(level);

      // Primitive types
      if (val === null || val === undefined) {
        return `${indent}<${tag} />`;
      }
      if (typeof val !== 'object') {
        return `${indent}<${tag}>${escapeXmlText(val)}</${tag}>`;
      }

      // Array values
      if (Array.isArray(val)) {
        if (val.length === 0) {
          return `${indent}<${tag} />`;
        }
        return val.map(item => serialize(tag, item, level)).join(isCompact ? '' : '\n');
      }

      // Object values
      let attrs = '';
      let textContent = null;
      const childElements = [];

      for (const [key, propVal] of Object.entries(val)) {
        if (attrPrefix && key.startsWith(attrPrefix)) {
          const attrName = sanitizeTagName(key.substring(attrPrefix.length));
          if (attrName) {
            attrs += ` ${attrName}="${escapeXmlAttr(propVal)}"`;
          }
        } else if (['#text', '_text', '$t'].includes(key)) {
          textContent = propVal;
        } else {
          childElements.push({ key, value: propVal });
        }
      }

      // Empty object
      if (childElements.length === 0 && textContent === null) {
        return `${indent}<${tag}${attrs} />`;
      }

      // Text content with no child elements
      if (childElements.length === 0 && textContent !== null) {
        return `${indent}<${tag}${attrs}>${escapeXmlText(textContent)}</${tag}>`;
      }

      // Child elements
      const serializedChildren = [];
      if (textContent !== null) {
        const textIndent = isCompact ? '' : indentStr.repeat(level + 1);
        serializedChildren.push(`${textIndent}${escapeXmlText(textContent)}`);
      }

      for (const child of childElements) {
        if (Array.isArray(child.value)) {
          for (const arrItem of child.value) {
            serializedChildren.push(serialize(child.key, arrItem, level + 1));
          }
        } else {
          serializedChildren.push(serialize(child.key, child.value, level + 1));
        }
      }

      if (isCompact) {
        return `<${tag}${attrs}>${serializedChildren.join('')}</${tag}>`;
      }
      return `${indent}<${tag}${attrs}>\n${serializedChildren.join('\n')}\n${indent}</${tag}>`;
    }

    // Top-level structure wrapping
    let xmlBody = '';
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      // Check if root attributes exist on the top level object
      let rootAttrs = '';
      const topChildren = [];
      let topText = null;

      for (const [k, v] of Object.entries(data)) {
        if (attrPrefix && k.startsWith(attrPrefix)) {
          const attrName = sanitizeTagName(k.substring(attrPrefix.length));
          if (attrName) {
            rootAttrs += ` ${attrName}="${escapeXmlAttr(v)}"`;
          }
        } else if (['#text', '_text', '$t'].includes(k)) {
          topText = v;
        } else {
          topChildren.push({ key: k, value: v });
        }
      }

      // If object has exactly one non-attribute key and no root attributes, can directly render it
      if (topChildren.length === 1 && !rootAttrs && topText === null && !rootElementInput.value.trim()) {
        const only = topChildren[0];
        xmlBody = serialize(only.key, only.value, 0);
      } else {
        // Enclose in specified root element
        const serializedChildren = [];
        if (topText !== null) {
          const textIndent = isCompact ? '' : indentStr;
          serializedChildren.push(`${textIndent}${escapeXmlText(topText)}`);
        }
        for (const child of topChildren) {
          if (Array.isArray(child.value)) {
            for (const item of child.value) {
              serializedChildren.push(serialize(child.key, item, 1));
            }
          } else {
            serializedChildren.push(serialize(child.key, child.value, 1));
          }
        }

        if (serializedChildren.length === 0) {
          xmlBody = `<${rootName}${rootAttrs} />`;
        } else if (isCompact) {
          xmlBody = `<${rootName}${rootAttrs}>${serializedChildren.join('')}</${rootName}>`;
        } else {
          xmlBody = `<${rootName}${rootAttrs}>\n${serializedChildren.join('\n')}\n</${rootName}>`;
        }
      }
    } else if (Array.isArray(data)) {
      const serializedItems = data.map(item => serialize(itemName, item, 1));
      if (isCompact) {
        xmlBody = `<${rootName}>${serializedItems.join('')}</${rootName}>`;
      } else {
        xmlBody = `<${rootName}>\n${serializedItems.join('\n')}\n</${rootName}>`;
      }
    } else {
      xmlBody = `<${rootName}>${escapeXmlText(data)}</${rootName}>`;
    }

    let header = '';
    if (withDeclaration) {
      header = '<?xml version="1.0" encoding="UTF-8"?>' + (isCompact ? '' : '\n');
    }

    xmlOutput.value = header + xmlBody;
    updateStats();
    xmlSuccessBanner.style.display = 'block';
  }

  // Real-time debounced converter
  let debounceTimer = null;
  function triggerRealtime() {
    updateStats();
    if (realtimeToggle.checked) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        convertJsonToXml();
      }, 250);
    }
  }

  jsonInput.addEventListener('input', triggerRealtime);

  // Load sample JSON
  sampleJsonSelect.addEventListener('change', () => {
    const val = sampleJsonSelect.value;
    if (val && SAMPLES[val]) {
      jsonInput.value = SAMPLES[val];
      updateStats();
      convertJsonToXml();
    }
  });

  // Action Buttons
  convertBtn.addEventListener('click', convertJsonToXml);

  clearBtn.addEventListener('click', () => {
    jsonInput.value = '';
    xmlOutput.value = '';
    sampleJsonSelect.value = '';
    hideBanners();
    updateStats();
    jsonInput.focus();
  });

  // Copy to clipboard
  function copyOutput() {
    const text = xmlOutput.value;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      copyActionBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
        copyBtn.classList.remove('copied');
        copyActionBtn.textContent = 'Copy XML';
      }, 2000);
    });
  }

  // Download .xml
  function downloadXml() {
    const text = xmlOutput.value;
    if (!text) return;
    const blob = new Blob([text], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted-${Date.now()}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  copyBtn.addEventListener('click', copyOutput);
  copyActionBtn.addEventListener('click', copyOutput);
  downloadBtn.addEventListener('click', downloadXml);

  // Option listeners
  rootElementInput.addEventListener('input', () => { if (realtimeToggle.checked && jsonInput.value.trim()) convertJsonToXml(); });
  itemElementInput.addEventListener('input', () => { if (realtimeToggle.checked && jsonInput.value.trim()) convertJsonToXml(); });
  attrPrefixInput.addEventListener('input', () => { if (realtimeToggle.checked && jsonInput.value.trim()) convertJsonToXml(); });
  xmlIndentSelect.addEventListener('change', () => { if (jsonInput.value.trim()) convertJsonToXml(); });
  xmlDeclarationCheckbox.addEventListener('change', () => { if (jsonInput.value.trim()) convertJsonToXml(); });

  // Initial stats
  updateStats();
});