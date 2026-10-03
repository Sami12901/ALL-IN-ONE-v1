// XML Formatter, Validator & Minifier Script

document.addEventListener('DOMContentLoaded', () => {
  const xmlInput = document.getElementById('xml-input');
  const xmlOutput = document.getElementById('xml-output');
  const inputGutter = document.getElementById('input-gutter');
  const outputGutter = document.getElementById('output-gutter');
  const xmlIndent = document.getElementById('xml-indent');
  const xmlSample = document.getElementById('xml-sample');

  const formatBtn = document.getElementById('format-btn');
  const validateBtn = document.getElementById('validate-btn');
  const minifyBtn = document.getElementById('minify-btn');
  const clearBtn = document.getElementById('clear-btn');
  const copyBtn = document.getElementById('copy-btn');
  const copyActionBtn = document.getElementById('copy-action-btn');
  const downloadBtn = document.getElementById('download-btn');

  const errorBanner = document.getElementById('xml-error-banner');
  const successBanner = document.getElementById('xml-success-banner');
  const inputStats = document.getElementById('input-stats');
  const outputStats = document.getElementById('output-stats');

  const statElements = document.getElementById('stat-elements');
  const statAttributes = document.getElementById('stat-attributes');
  const statDepth = document.getElementById('stat-depth');
  const statRoot = document.getElementById('stat-root');

  // Sample XML Documents
  const SAMPLES = {
    catalog: `<?xml version="1.0" encoding="UTF-8"?>
<catalog department="Technology" status="active">
  <category id="cat-101" name="Software Engineering">
    <description>Core books on software design and architecture</description>
    <book id="bk-001" inStock="true">
      <title>Clean Architecture: A Craftsman's Guide</title>
      <author>Robert C. Martin</author>
      <price currency="USD">34.99</price>
      <publishDate>2017-09-20</publishDate>
      <tags>
        <tag>architecture</tag>
        <tag>design patterns</tag>
        <tag>clean code</tag>
      </tags>
    </book>
    <book id="bk-002" inStock="false">
      <title>Designing Data-Intensive Applications</title>
      <author>Martin Kleppmann</author>
      <price currency="USD">42.50</price>
      <publishDate>2017-03-16</publishDate>
      <tags>
        <tag>databases</tag>
        <tag>distributed systems</tag>
      </tags>
    </book>
  </category>
</catalog>`,

    soap: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:m="https://api.example.com/orders">
  <soap:Header>
    <m:AuthToken client="EnterpriseGateway">abc-12345-token-xyz</m:AuthToken>
  </soap:Header>
  <soap:Body>
    <m:GetOrderDetails>
      <m:OrderId>ORD-998822</m:OrderId>
      <m:IncludeShippingStatus>true</m:IncludeShippingStatus>
    </m:GetOrderDetails>
  </soap:Body>
</soap:Envelope>`,

    rss: `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Tech Horizons News</title>
    <link>https://techhorizons.example.com</link>
    <description>Daily developer and software engineering updates</description>
    <language>en-us</language>
    <item>
      <title>The Evolution of Modern Web Standards</title>
      <link>https://techhorizons.example.com/modern-web</link>
      <description><![CDATA[Exploring the rapid advancement of modern browsers and native APIs.]]></description>
      <pubDate>Mon, 03 Oct 2026 09:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`
  };

  // Synchronize Line Numbers
  function updateLineNumbers(textarea, gutter) {
    const lines = (textarea.value || '').split('\n').length || 1;
    let numbers = '';
    for (let i = 1; i <= lines; i++) {
      numbers += i + '\n';
    }
    gutter.textContent = numbers.trimEnd();
    gutter.scrollTop = textarea.scrollTop;
  }

  function syncScroll(textarea, gutter) {
    gutter.scrollTop = textarea.scrollTop;
  }

  xmlInput.addEventListener('input', () => {
    updateLineNumbers(xmlInput, inputGutter);
    updateStats();
  });

  xmlInput.addEventListener('scroll', () => {
    syncScroll(xmlInput, inputGutter);
  });

  xmlOutput.addEventListener('scroll', () => {
    syncScroll(xmlOutput, outputGutter);
  });

  function updateStats() {
    const inVal = xmlInput.value;
    const inLines = inVal ? inVal.split('\n').length : 1;
    inputStats.textContent = `Lines: ${inLines} | Chars: ${inVal.length}`;

    const outVal = xmlOutput.value;
    const outLines = outVal ? outVal.split('\n').length : 1;
    outputStats.textContent = `Lines: ${outLines} | Chars: ${outVal.length}`;
  }

  function hideBanners() {
    errorBanner.style.display = 'none';
    errorBanner.innerHTML = '';
    successBanner.style.display = 'none';
  }

  function resetStats() {
    statElements.textContent = '0';
    statAttributes.textContent = '0';
    statDepth.textContent = '0';
    statRoot.textContent = 'None';
  }

  // Sample loader
  xmlSample.addEventListener('change', () => {
    const val = xmlSample.value;
    if (val && SAMPLES[val]) {
      xmlInput.value = SAMPLES[val];
      updateLineNumbers(xmlInput, inputGutter);
      updateStats();
      formatXML();
    }
  });

  // DOMParser syntax validation
  function parseAndValidate(xmlString) {
    hideBanners();
    if (!xmlString.trim()) {
      resetStats();
      return { valid: false, empty: true };
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'application/xml');
    const parserError = doc.querySelector('parsererror');

    if (parserError) {
      resetStats();
      const rawError = parserError.textContent || '';
      
      // Extract line number
      const lineMatch = rawError.match(/line\s*(?:number)?\s*[:#]?\s*(\d+)/i) || rawError.match(/on\s+line\s+(\d+)/i);
      const colMatch = rawError.match(/col(?:umn)?\s*[:#]?\s*(\d+)/i) || rawError.match(/at\s+column\s+(\d+)/i);
      
      const lineNum = lineMatch ? parseInt(lineMatch[1], 10) : null;
      const colNum = colMatch ? parseInt(colMatch[1], 10) : null;

      // Clean message
      let cleanMsg = rawError
        .replace(/Below is a rendering of the page up to the first error\./gi, '')
        .replace(/This page contains the following errors:\s*/gi, '')
        .trim();

      const lines = xmlString.split('\n');
      let snippetHtml = '';
      if (lineNum !== null && lines[lineNum - 1] !== undefined) {
        snippetHtml = `<div style="margin-top: 0.5rem; padding: 0.5rem; background: rgba(0,0,0,0.3); border-radius: var(--radius-sm); font-family: monospace; font-size: 0.8rem;">
          <strong>Line ${lineNum}:</strong> ${escapeXmlText(lines[lineNum - 1])}
        </div>`;
      }

      const locationText = lineNum ? `Line ${lineNum}${colNum ? `, Column ${colNum}` : ''}` : 'Location unspecified';

      errorBanner.innerHTML = `
        <strong>XML Parsing Error (${locationText})</strong>
        <div>${escapeXmlText(cleanMsg.slice(0, 300))}</div>
        ${snippetHtml}
      `;
      errorBanner.style.display = 'block';

      return { valid: false, error: cleanMsg, line: lineNum, col: colNum, doc: null };
    }

    // Compute Tree Statistics
    let elementCount = 0;
    let attributeCount = 0;
    let maxDepth = 0;

    function walk(node, depth) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        elementCount++;
        attributeCount += node.attributes ? node.attributes.length : 0;
        if (depth > maxDepth) maxDepth = depth;
        for (let i = 0; i < node.childNodes.length; i++) {
          walk(node.childNodes[i], depth + 1);
        }
      }
    }

    if (doc.documentElement) {
      walk(doc.documentElement, 1);
      statElements.textContent = elementCount.toLocaleString();
      statAttributes.textContent = attributeCount.toLocaleString();
      statDepth.textContent = maxDepth.toString();
      statRoot.textContent = `<${doc.documentElement.nodeName}>`;
    }

    return { valid: true, doc, elementCount, attributeCount, maxDepth };
  }

  function escapeXmlText(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escapeXmlAttr(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // XML Node Formatter
  function serializeNode(node, indentUnit, level) {
    if (node.nodeType === Node.COMMENT_NODE) {
      return `${indentUnit.repeat(level)}<!--${node.nodeValue}-->`;
    }

    if (node.nodeType === Node.CDATA_SECTION_NODE) {
      return `${indentUnit.repeat(level)}<![CDATA[${node.nodeValue}]]>`;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const val = node.nodeValue.trim();
      return val ? escapeXmlText(val) : '';
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const indent = indentUnit.repeat(level);
      const tagName = node.nodeName;
      let attrs = '';

      if (node.attributes) {
        for (let i = 0; i < node.attributes.length; i++) {
          const attr = node.attributes[i];
          attrs += ` ${attr.name}="${escapeXmlAttr(attr.value)}"`;
        }
      }

      // Filter meaningful child nodes
      const children = Array.from(node.childNodes).filter(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          return child.nodeValue.trim().length > 0;
        }
        return true;
      });

      // Self-closing empty element
      if (children.length === 0) {
        return `${indent}<${tagName}${attrs} />`;
      }

      // Single text child (compact inline tag)
      if (children.length === 1 && children[0].nodeType === Node.TEXT_NODE) {
        return `${indent}<${tagName}${attrs}>${escapeXmlText(children[0].nodeValue.trim())}</${tagName}>`;
      }

      // Single CDATA child
      if (children.length === 1 && children[0].nodeType === Node.CDATA_SECTION_NODE) {
        return `${indent}<${tagName}${attrs}><![CDATA[${children[0].nodeValue}]]></${tagName}>`;
      }

      // Nested children
      let innerContent = '';
      for (const child of children) {
        const serializedChild = serializeNode(child, indentUnit, level + 1);
        if (serializedChild) {
          innerContent += '\n' + serializedChild;
        }
      }

      return `${indent}<${tagName}${attrs}>${innerContent}\n${indent}</${tagName}>`;
    }

    return '';
  }

  // Beautify / Format XML
  function formatXML() {
    const raw = xmlInput.value;
    const validation = parseAndValidate(raw);

    if (!validation.valid) {
      if (!validation.empty) {
        xmlOutput.value = '';
        updateLineNumbers(xmlOutput, outputGutter);
        updateStats();
      }
      return;
    }

    let indentUnit = '  ';
    if (xmlIndent.value === '4') indentUnit = '    ';
    else if (xmlIndent.value === 'tab') indentUnit = '\t';

    // Check for declaration or DOCTYPE in original input
    let header = '';
    const declMatch = raw.match(/^\s*(<\?xml[^>]*\?>)/i);
    if (declMatch) header += declMatch[1] + '\n';

    const doctypeMatch = raw.match(/(<!DOCTYPE[^>]*>)/i);
    if (doctypeMatch) header += doctypeMatch[1] + '\n';

    const formattedRoot = serializeNode(validation.doc.documentElement, indentUnit, 0);
    xmlOutput.value = (header + formattedRoot).trim();

    updateLineNumbers(xmlOutput, outputGutter);
    updateStats();

    successBanner.textContent = 'XML is valid and beautifully formatted!';
    successBanner.style.display = 'block';
  }

  // Validate XML action
  function validateXML() {
    const raw = xmlInput.value;
    const validation = parseAndValidate(raw);
    if (validation.valid) {
      successBanner.textContent = `Valid XML! Document contains ${validation.elementCount} elements, ${validation.attributeCount} attributes, and max nesting depth of ${validation.depth || validation.maxDepth}.`;
      successBanner.style.display = 'block';
    }
  }

  // Minify XML
  function minifyXML() {
    const raw = xmlInput.value;
    const validation = parseAndValidate(raw);
    if (!validation.valid) {
      xmlOutput.value = '';
      updateLineNumbers(xmlOutput, outputGutter);
      updateStats();
      return;
    }

    function minifyNode(node) {
      if (node.nodeType === Node.COMMENT_NODE) return '';
      if (node.nodeType === Node.CDATA_SECTION_NODE) return `<![CDATA[${node.nodeValue}]]>`;
      if (node.nodeType === Node.TEXT_NODE) return escapeXmlText(node.nodeValue.trim());

      if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.nodeName;
        let attrs = '';
        if (node.attributes) {
          for (let i = 0; i < node.attributes.length; i++) {
            const attr = node.attributes[i];
            attrs += ` ${attr.name}="${escapeXmlAttr(attr.value)}"`;
          }
        }

        const children = Array.from(node.childNodes).filter(child => {
          if (child.nodeType === Node.TEXT_NODE) return child.nodeValue.trim().length > 0;
          return child.nodeType !== Node.COMMENT_NODE;
        });

        if (children.length === 0) return `<${tagName}${attrs}/>`;

        let inner = '';
        for (const child of children) {
          inner += minifyNode(child);
        }
        return `<${tagName}${attrs}>${inner}</${tagName}>`;
      }
      return '';
    }

    let header = '';
    const declMatch = raw.match(/^\s*(<\?xml[^>]*\?>)/i);
    if (declMatch) header += declMatch[1];

    const minified = header + minifyNode(validation.doc.documentElement);
    xmlOutput.value = minified;

    updateLineNumbers(xmlOutput, outputGutter);
    updateStats();

    successBanner.textContent = 'XML minified successfully.';
    successBanner.style.display = 'block';
  }

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
  function downloadXML() {
    const text = xmlOutput.value || xmlInput.value;
    if (!text) return;
    const blob = new Blob([text], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-${Date.now()}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Clear all
  clearBtn.addEventListener('click', () => {
    xmlInput.value = '';
    xmlOutput.value = '';
    xmlSample.value = '';
    hideBanners();
    resetStats();
    updateLineNumbers(xmlInput, inputGutter);
    updateLineNumbers(xmlOutput, outputGutter);
    updateStats();
    xmlInput.focus();
  });

  // Attach buttons
  formatBtn.addEventListener('click', formatXML);
  validateBtn.addEventListener('click', validateXML);
  minifyBtn.addEventListener('click', minifyXML);
  copyBtn.addEventListener('click', copyOutput);
  copyActionBtn.addEventListener('click', copyOutput);
  downloadBtn.addEventListener('click', downloadXML);

  xmlIndent.addEventListener('change', () => {
    if (xmlInput.value.trim()) formatXML();
  });

  // Initial update
  updateLineNumbers(xmlInput, inputGutter);
  updateLineNumbers(xmlOutput, outputGutter);
  updateStats();
});