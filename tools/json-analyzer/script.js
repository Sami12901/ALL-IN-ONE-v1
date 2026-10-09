// JSON Analyzer - Tree Inspector, Array Flattener, Key Frequency & JSONPath Query Engine
// Vanilla JavaScript implementation

(() => {
  'use strict';

  // --- State ---
  let parsedJSON = null;
  let rawText = '';
  let discoveredArrays = []; // Array of { path: string, arrayRef: Array }
  let activeArrayPath = '';
  let flattenedRecords = [];
  let flattenedHeaders = [];
  let flatFilterQuery = '';

  // --- UI Elements ---
  const jsonInput = document.getElementById('json-input');
  const jsonErrorBanner = document.getElementById('json-error-banner');
  const jsonStatusBadge = document.getElementById('json-status-badge');
  const jsonFileInput = document.getElementById('json-file-input');

  const btnSampleCatalog = document.getElementById('btn-sample-catalog');
  const btnSampleUsers = document.getElementById('btn-sample-users');
  const btnBeautify = document.getElementById('btn-beautify');
  const btnMinify = document.getElementById('btn-minify');
  const btnCopyJson = document.getElementById('btn-copy-json');
  const btnExportCsv = document.getElementById('btn-export-csv');

  // KPIs
  const kpiTotalKeys = document.getElementById('kpi-total-keys');
  const kpiKeysSub = document.getElementById('kpi-keys-sub');
  const kpiArrayRecords = document.getElementById('kpi-array-records');
  const kpiRecordsSub = document.getElementById('kpi-records-sub');
  const kpiMaxDepth = document.getElementById('kpi-max-depth');
  const kpiDepthSub = document.getElementById('kpi-depth-sub');
  const kpiPayloadSize = document.getElementById('kpi-payload-size');
  const kpiSizeSub = document.getElementById('kpi-size-sub');

  // Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  // Tree View
  const treeContainer = document.getElementById('tree-container');
  const btnExpandAll = document.getElementById('btn-expand-all');
  const btnCollapseAll = document.getElementById('btn-collapse-all');

  // Flattener
  const arraySelector = document.getElementById('array-selector');
  const flatTableSearch = document.getElementById('flat-table-search');
  const flatRecordsCount = document.getElementById('flat-records-count');
  const flatThead = document.getElementById('flat-thead');
  const flatTbody = document.getElementById('flat-tbody');

  // Key Frequency
  const keyFreqContainer = document.getElementById('key-freq-container');

  // Search
  const jsonpathInput = document.getElementById('jsonpath-input');
  const btnRunSearch = document.getElementById('btn-run-search');
  const searchMatchesLabel = document.getElementById('search-matches-label');
  const searchResultsBox = document.getElementById('search-results-box');

  // --- Tab Navigation ---
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const panel = document.getElementById(targetId);
      if (panel) panel.classList.add('active');
    });
  });

  // --- Parse and Validate JSON ---
  function parseAndAnalyze(text) {
    rawText = text;
    if (!text.trim()) {
      parsedJSON = null;
      jsonErrorBanner.style.display = 'none';
      jsonStatusBadge.textContent = 'JSON: Empty';
      jsonStatusBadge.style.color = 'var(--text-secondary)';
      clearViews();
      return;
    }

    try {
      parsedJSON = JSON.parse(text);
      jsonErrorBanner.style.display = 'none';
      jsonStatusBadge.textContent = 'JSON: Valid';
      jsonStatusBadge.style.color = 'var(--success)';
      jsonStatusBadge.style.borderColor = 'var(--success)';

      runAnalytics();
    } catch (err) {
      parsedJSON = null;
      jsonErrorBanner.textContent = `Syntax Error: ${err.message}`;
      jsonErrorBanner.style.display = 'block';
      jsonStatusBadge.textContent = 'JSON: Invalid';
      jsonStatusBadge.style.color = 'var(--error)';
      jsonStatusBadge.style.borderColor = 'var(--error)';
      clearViews();
    }
  }

  function clearViews() {
    treeContainer.innerHTML = '<div style="color: var(--text-tertiary); text-align: center; padding: 2rem;">No valid JSON to display</div>';
    flatThead.innerHTML = '';
    flatTbody.innerHTML = '<tr><td style="color: var(--text-tertiary); text-align: center; padding: 2rem;">No data</td></tr>';
    keyFreqContainer.innerHTML = '<div style="color: var(--text-tertiary);">No data</div>';
    searchResultsBox.innerHTML = '';
    kpiTotalKeys.textContent = '0';
    kpiArrayRecords.textContent = '0';
    kpiMaxDepth.textContent = '0';
    kpiPayloadSize.textContent = '0 KB';
  }

  // --- Run Analytics on Parsed Data ---
  function runAnalytics() {
    if (parsedJSON === null) return;

    // Payload stats
    const bytes = new Blob([rawText]).size;
    kpiPayloadSize.textContent = bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
    kpiSizeSub.textContent = `${rawText.length.toLocaleString()} characters`;

    // Calculate Max Depth & Count Keys
    let totalKeys = 0;
    let maxDepth = 0;
    const keySet = new Set();

    function traverse(obj, depth) {
      if (depth > maxDepth) maxDepth = depth;
      if (obj && typeof obj === 'object') {
        if (Array.isArray(obj)) {
          obj.forEach(item => traverse(item, depth + 1));
        } else {
          Object.keys(obj).forEach(k => {
            totalKeys++;
            keySet.add(k);
            traverse(obj[k], depth + 1);
          });
        }
      }
    }

    traverse(parsedJSON, 1);
    kpiTotalKeys.textContent = totalKeys.toLocaleString();
    kpiKeysSub.textContent = `${keySet.size} distinct schema keys`;
    kpiMaxDepth.textContent = maxDepth;
    kpiDepthSub.textContent = `Nesting hierarchy level`;

    // Discover all Array nodes
    discoveredArrays = [];
    function findArrays(node, path) {
      if (Array.isArray(node)) {
        discoveredArrays.push({ path: path || 'root []', arrayRef: node });
        node.forEach((item, idx) => {
          if (typeof item === 'object' && item !== null) {
            findArrays(item, `${path ? path + '.' : ''}[${idx}]`);
          }
        });
      } else if (node && typeof node === 'object') {
        Object.keys(node).forEach(k => {
          findArrays(node[k], path ? `${path}.${k}` : k);
        });
      }
    }
    findArrays(parsedJSON, '');

    // Populate Array selector
    if (discoveredArrays.length > 0) {
      arraySelector.innerHTML = discoveredArrays.map((arr, i) => {
        return `<option value="${i}">${arr.path} (${arr.arrayRef.length} items)</option>`;
      }).join('');
      activeArrayPath = discoveredArrays[0].path;
      kpiArrayRecords.textContent = discoveredArrays[0].arrayRef.length;
      kpiRecordsSub.textContent = `Primary: ${discoveredArrays[0].path}`;
    } else {
      arraySelector.innerHTML = `<option value="-1">No Arrays Detected</option>`;
      kpiArrayRecords.textContent = '0';
      kpiRecordsSub.textContent = 'Single object root';
    }

    // Render Sub-Views
    renderTree(parsedJSON, treeContainer);
    flattenActiveArray();
    renderKeyFrequency();
    executeSearch();
  }

  // --- Interactive Tree View Renderer ---
  function renderTree(data, container) {
    container.innerHTML = '';
    const rootEl = createTreeNode('root', data, '$', true);
    container.appendChild(rootEl);
  }

  function createTreeNode(key, value, path, isRoot = false) {
    const nodeDiv = document.createElement('div');
    nodeDiv.className = 'tree-node';

    const header = document.createElement('div');
    header.className = 'tree-node-header';

    const isObject = value !== null && typeof value === 'object';
    const isArray = Array.isArray(value);

    // Toggle Arrow
    if (isObject) {
      const arrow = document.createElement('span');
      arrow.className = 'tree-toggle-arrow';
      arrow.textContent = '▼';
      header.appendChild(arrow);
    } else {
      const spacer = document.createElement('span');
      spacer.style.display = 'inline-block';
      spacer.style.width = '14px';
      header.appendChild(spacer);
    }

    // Key label
    if (!isRoot) {
      const keySpan = document.createElement('span');
      keySpan.className = 'tree-key';
      keySpan.textContent = isNaN(Number(key)) ? `${key}: ` : `[${key}]: `;
      header.appendChild(keySpan);
    }

    // Value or Type Tag
    if (isObject) {
      const typeTag = document.createElement('span');
      typeTag.className = 'tree-type-tag';
      typeTag.textContent = isArray ? `Array(${value.length})` : `Object{${Object.keys(value).length}}`;
      header.appendChild(typeTag);
    } else {
      const valSpan = document.createElement('span');
      if (typeof value === 'string') {
        valSpan.className = 'tree-val-string';
        valSpan.textContent = `"${value}"`;
      } else if (typeof value === 'number') {
        valSpan.className = 'tree-val-number';
        valSpan.textContent = String(value);
      } else if (typeof value === 'boolean') {
        valSpan.className = 'tree-val-boolean';
        valSpan.textContent = String(value);
      } else if (value === null) {
        valSpan.className = 'tree-val-null';
        valSpan.textContent = 'null';
      }
      header.appendChild(valSpan);
    }

    // Copy Path Button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'tree-copy-path-btn';
    copyBtn.textContent = 'Copy Path';
    copyBtn.title = `Copy "${path}"`;
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(path).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy Path'; }, 1200);
      });
    });
    header.appendChild(copyBtn);

    nodeDiv.appendChild(header);

    // Children Container for Objects/Arrays
    if (isObject) {
      const childrenDiv = document.createElement('div');
      childrenDiv.className = 'tree-children';

      const keys = isArray ? Array.from({ length: value.length }, (_, i) => i) : Object.keys(value);
      keys.forEach(k => {
        const childPath = isArray ? `${path}[${k}]` : (path === '$' ? k : `${path}.${k}`);
        const childNode = createTreeNode(k, value[k], childPath);
        childrenDiv.appendChild(childNode);
      });

      nodeDiv.appendChild(childrenDiv);

      // Toggle collapse on header click
      header.addEventListener('click', () => {
        const isHidden = childrenDiv.classList.toggle('hidden');
        const arrow = header.querySelector('.tree-toggle-arrow');
        if (arrow) arrow.classList.toggle('collapsed', isHidden);
      });
    }

    return nodeDiv;
  }

  // --- Array Flattener & Tabular View ---
  function flattenObject(obj, prefix = '', res = {}) {
    if (obj === null || typeof obj !== 'object') {
      res[prefix] = obj;
      return res;
    }

    if (Array.isArray(obj)) {
      // If array of primitives, join as comma-separated string
      const allPrimitives = obj.every(item => item === null || typeof item !== 'object');
      if (allPrimitives) {
        res[prefix] = obj.join(', ');
      } else {
        // Nested array of objects: index each
        obj.forEach((item, idx) => {
          flattenObject(item, `${prefix}[${idx}]`, res);
        });
      }
      return res;
    }

    for (const key of Object.keys(obj)) {
      const propKey = prefix ? `${prefix}.${key}` : key;
      const val = obj[key];

      if (val !== null && typeof val === 'object') {
        flattenObject(val, propKey, res);
      } else {
        res[propKey] = val;
      }
    }
    return res;
  }

  function flattenActiveArray() {
    if (!discoveredArrays.length) {
      // If no array, flatten root object if object
      if (parsedJSON && typeof parsedJSON === 'object') {
        flattenedRecords = [flattenObject(parsedJSON)];
      } else {
        flattenedRecords = [];
      }
    } else {
      const arrIdx = parseInt(arraySelector.value, 10);
      const targetArr = (arrIdx >= 0 && discoveredArrays[arrIdx]) ? discoveredArrays[arrIdx].arrayRef : [];
      flattenedRecords = targetArr.map(item => (typeof item === 'object' && item !== null ? flattenObject(item) : { value: item }));
    }

    // Collect all unique dot-notated headers
    const headerSet = new Set();
    flattenedRecords.forEach(rec => {
      Object.keys(rec).forEach(k => headerSet.add(k));
    });
    flattenedHeaders = Array.from(headerSet);

    renderFlatTable();
  }

  function renderFlatTable() {
    if (!flattenedHeaders.length || !flattenedRecords.length) {
      flatThead.innerHTML = '';
      flatTbody.innerHTML = '<tr><td style="text-align: center; padding: 2rem; color: var(--text-tertiary);">No array records available to flatten.</td></tr>';
      flatRecordsCount.textContent = '0 records';
      return;
    }

    // Render Headers
    let theadHtml = '<tr><th style="width: 48px; text-align: center;">#</th>';
    flattenedHeaders.forEach(h => {
      theadHtml += `<th title="${h}">${h}</th>`;
    });
    theadHtml += '</tr>';
    flatThead.innerHTML = theadHtml;

    // Filter
    let filtered = flattenedRecords;
    if (flatFilterQuery.trim()) {
      const q = flatFilterQuery.toLowerCase();
      filtered = flattenedRecords.filter(r => {
        return Object.values(r).some(val => String(val).toLowerCase().includes(q));
      });
    }

    flatRecordsCount.textContent = `Showing ${filtered.length} of ${flattenedRecords.length} records`;

    // Render Body (top 100 records for performance)
    let tbodyHtml = '';
    const slice = filtered.slice(0, 100);
    slice.forEach((rec, idx) => {
      tbodyHtml += `<tr><td style="text-align: center; color: var(--text-tertiary); font-weight: 600;">${idx + 1}</td>`;
      flattenedHeaders.forEach(h => {
        const val = rec[h] !== undefined && rec[h] !== null ? String(rec[h]) : '';
        tbodyHtml += `<td title="${val.replace(/"/g, '&quot;')}">${val}</td>`;
      });
      tbodyHtml += '</tr>';
    });

    if (filtered.length === 0) {
      tbodyHtml = `<tr><td colspan="${flattenedHeaders.length + 1}" style="text-align: center; padding: 2rem; color: var(--text-tertiary);">No records matched search filter.</td></tr>`;
    }

    flatTbody.innerHTML = tbodyHtml;
  }

  // --- Key Frequency & Schema Drift Analysis ---
  function renderKeyFrequency() {
    if (!flattenedRecords.length || !flattenedHeaders.length) {
      keyFreqContainer.innerHTML = '<div style="color: var(--text-tertiary);">No schema records available.</div>';
      return;
    }

    const totalRecords = flattenedRecords.length;
    const keyStats = [];

    flattenedHeaders.forEach(header => {
      let count = 0;
      const typeSet = new Set();

      flattenedRecords.forEach(rec => {
        if (rec[header] !== undefined && rec[header] !== null && String(rec[header]).trim() !== '') {
          count++;
          typeSet.add(typeof rec[header]);
        }
      });

      const coveragePct = Math.round((count / totalRecords) * 100);
      const isDrift = coveragePct < 100;

      keyStats.push({
        key: header,
        count,
        total: totalRecords,
        coveragePct,
        types: Array.from(typeSet).join(', ') || 'null',
        isDrift
      });
    });

    // Sort by coverage ascending so drifted/optional keys are prominent
    keyStats.sort((a, b) => a.coveragePct - b.coveragePct);

    let html = '';
    keyStats.forEach(stat => {
      const badgeStyle = stat.isDrift
        ? 'background: rgba(245, 158, 11, 0.15); color: var(--warning); border-color: var(--warning);'
        : 'background: rgba(16, 185, 129, 0.15); color: var(--success); border-color: var(--success);';

      html += `<div class="key-card">
        <div class="key-card-header">
          <span style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary); font-family: monospace;" title="${stat.key}">${stat.key}</span>
          <span class="badge" style="${badgeStyle}">${stat.coveragePct}%</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-secondary);">
          <span>Present in: <strong>${stat.count} / ${stat.total} records</strong></span>
          <span>Types: <strong style="color: var(--accent);">${stat.types}</strong></span>
        </div>
        <div class="freq-pct-bar">
          <div class="freq-pct-fill" style="width: ${stat.coveragePct}%;"></div>
        </div>
        ${stat.isDrift ? `<div style="font-size: 0.75rem; color: var(--warning); margin-top: 0.25rem;">Optional field / schema drift detected (${100 - stat.coveragePct}% missing)</div>` : ''}
      </div>`;
    });

    keyFreqContainer.innerHTML = html;
  }

  // --- JSONPath-like Query & Key Search ---
  function executeSearch() {
    const query = jsonpathInput.value.trim();
    if (!query || parsedJSON === null) {
      searchMatchesLabel.textContent = 'Enter a key or path pattern above to search';
      searchResultsBox.innerHTML = '';
      return;
    }

    const matches = [];

    function searchTraverse(node, path) {
      if (node && typeof node === 'object') {
        const isArr = Array.isArray(node);
        const keys = isArr ? Array.from({ length: node.length }, (_, i) => i) : Object.keys(node);

        keys.forEach(k => {
          const currentPath = isArr ? `${path}[${k}]` : (path === '$' ? k : `${path}.${k}`);
          const val = node[k];

          // Check if path or key matches query
          const keyMatches = String(k).toLowerCase().includes(query.toLowerCase());
          const pathMatches = currentPath.toLowerCase().includes(query.toLowerCase());
          const valMatches = (val !== null && typeof val !== 'object') && String(val).toLowerCase().includes(query.toLowerCase());

          if (keyMatches || pathMatches || valMatches) {
            matches.push({
              path: currentPath,
              value: val !== null && typeof val === 'object' ? (Array.isArray(val) ? `[Array(${val.length})]` : `{Object}`) : String(val)
            });
          }

          if (val && typeof val === 'object') {
            searchTraverse(val, currentPath);
          }
        });
      }
    }

    searchTraverse(parsedJSON, '$');

    searchMatchesLabel.textContent = `Found ${matches.length} matching nodes for "${query}"`;

    if (!matches.length) {
      searchResultsBox.innerHTML = '<div style="padding: 1rem; color: var(--text-tertiary); text-align: center;">No matching keys or values found.</div>';
      return;
    }

    let html = '';
    matches.slice(0, 50).forEach(m => {
      html += `<div class="search-match-item">
        <span class="search-match-path" title="${m.path}">${m.path}</span>
        <span class="search-match-val" title="${m.value}">${m.value}</span>
        <button class="btn btn-secondary btn-sm" onclick="navigator.clipboard.writeText('${m.path}')" style="font-size: 0.75rem; padding: 0.2rem 0.5rem;">Copy</button>
      </div>`;
    });

    if (matches.length > 50) {
      html += `<div style="text-align: center; color: var(--text-tertiary); font-size: 0.8rem; padding: 0.5rem;">Showing first 50 of ${matches.length} matches</div>`;
    }

    searchResultsBox.innerHTML = html;
  }

  // --- Export Flattened CSV ---
  function exportCSV() {
    if (!flattenedRecords.length || !flattenedHeaders.length) return;

    const escapeVal = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const lines = [];
    lines.push(flattenedHeaders.map(escapeVal).join(','));
    flattenedRecords.forEach(rec => {
      const row = flattenedHeaders.map(h => escapeVal(rec[h]));
      lines.push(row.join(','));
    });

    const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `json_flattened_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- Sample Payloads ---
  const SAMPLE_CATALOG = {
    store: "OmniTech Global Retail",
    version: "2.4.0",
    catalog_date: "2026-10-01",
    products: [
      {
        id: "PROD-101",
        title: "Pro Gaming Laptop X15",
        brand: "AeroTech",
        category: "Computers & Laptops",
        in_stock: true,
        pricing: {
          retail: 1899.99,
          sale: 1749.99,
          currency: "USD",
          tax_rate: 0.08
        },
        specs: {
          cpu: "Octa-Core 5.2GHz",
          ram_gb: 32,
          storage: "1TB NVMe SSD",
          gpu: "RTX 5080 Mobile"
        },
        tags: ["gaming", "performance", "rtx", "high-end"],
        variants: [
          { sku: "X15-BLK-32", color: "Stealth Black", inventory: 45 },
          { sku: "X15-SLV-32", color: "Lunar Silver", inventory: 22 }
        ],
        ratings: {
          average: 4.8,
          review_count: 342
        }
      },
      {
        id: "PROD-102",
        title: "Ergonomic Mechanical Keyboard",
        brand: "KeyWorks",
        category: "Peripherals",
        in_stock: true,
        pricing: {
          retail: 159.00,
          sale: 139.00,
          currency: "USD",
          tax_rate: 0.08
        },
        specs: {
          switch_type: "Tactile Silent",
          connectivity: "Tri-Mode Wireless",
          battery_mah: 4000
        },
        tags: ["keyboard", "wireless", "ergonomic"],
        variants: [
          { sku: "KW-M87-TTC", color: "Carbon Gray", inventory: 110 }
        ],
        ratings: {
          average: 4.6,
          review_count: 188
        }
      },
      {
        id: "PROD-103",
        title: "UltraClear 34\" Curved Monitor",
        brand: "AeroTech",
        category: "Displays",
        in_stock: false,
        pricing: {
          retail: 699.00,
          sale: null,
          currency: "USD",
          tax_rate: 0.08
        },
        specs: {
          resolution: "3440x1440 WQHD",
          refresh_rate_hz: 165,
          panel: "Fast IPS"
        },
        tags: ["ultrawide", "display", "hdr"],
        variants: [
          { sku: "UC34-BLK", color: "Midnight Black", inventory: 0 }
        ],
        ratings: {
          average: 4.7,
          review_count: 95
        }
      },
      {
        id: "PROD-104",
        title: "ANC Studio Wireless Headphones",
        brand: "SonicAura",
        category: "Audio",
        in_stock: true,
        pricing: {
          retail: 299.00,
          sale: 249.00,
          currency: "USD",
          tax_rate: 0.08
        },
        specs: {
          driver_size_mm: 40,
          anc_modes: 3,
          battery_hours: 45
        },
        tags: ["audio", "anc", "bluetooth", "studio"],
        variants: [
          { sku: "SA-ANC-WHT", color: "Arctic White", inventory: 38 },
          { sku: "SA-ANC-BLK", color: "Jet Black", inventory: 54 }
        ],
        ratings: {
          average: 4.9,
          review_count: 512
        }
      }
    ]
  };

  const SAMPLE_USERS = {
    api_endpoint: "https://api.cloudmesh.io/v2/users",
    generated_at: "2026-10-02T12:00:00Z",
    total_users: 3,
    users: [
      {
        uid: "usr_9901",
        username: "sarah_c",
        email: "sarah.connor@example.com",
        role: "DevOps Engineer",
        verified: true,
        profile: {
          full_name: "Sarah Connor",
          timezone: "America/Los_Angeles",
          phone: "+1-555-0144"
        },
        address: {
          street: "742 Evergreen Terrace",
          city: "Springfield",
          state: "OR",
          country: "USA",
          geo: { lat: 44.0462, lng: -123.0220 }
        },
        permissions: ["read", "write", "deploy", "admin"],
        audit_log: {
          last_login: "2026-10-02T08:15:30Z",
          failed_attempts: 0
        }
      },
      {
        uid: "usr_9902",
        username: "john_w",
        email: "john.wick@example.com",
        role: "Security Director",
        verified: true,
        profile: {
          full_name: "John Wick",
          timezone: "America/New_York",
          phone: "+1-555-0199"
        },
        address: {
          street: "1 Wall Street",
          city: "New York",
          state: "NY",
          country: "USA",
          geo: { lat: 40.7074, lng: -74.0113 }
        },
        permissions: ["read", "write", "audit_read"],
        audit_log: {
          last_login: "2026-10-01T22:45:10Z",
          failed_attempts: 1
        }
      },
      {
        uid: "usr_9903",
        username: "ellen_r",
        email: "ellen.ripley@example.org",
        role: "Flight Officer",
        verified: false,
        profile: {
          full_name: "Ellen Ripley",
          timezone: "Europe/London",
          phone: null
        },
        address: {
          street: "Nostromo Deck A",
          city: "London",
          state: null,
          country: "UK",
          geo: { lat: 51.5074, lng: -0.1278 }
        },
        permissions: ["read"],
        audit_log: {
          last_login: "2026-09-28T14:10:00Z",
          failed_attempts: 0
        }
      }
    ]
  };

  // --- Setup Event Listeners ---
  function setupEventListeners() {
    // Textarea input
    jsonInput.addEventListener('input', () => {
      parseAndAnalyze(jsonInput.value);
    });

    // Sample loaders
    btnSampleCatalog.addEventListener('click', () => {
      const formatted = JSON.stringify(SAMPLE_CATALOG, null, 2);
      jsonInput.value = formatted;
      parseAndAnalyze(formatted);
    });

    btnSampleUsers.addEventListener('click', () => {
      const formatted = JSON.stringify(SAMPLE_USERS, null, 2);
      jsonInput.value = formatted;
      parseAndAnalyze(formatted);
    });

    // Beautify & Minify
    btnBeautify.addEventListener('click', () => {
      if (parsedJSON !== null) {
        jsonInput.value = JSON.stringify(parsedJSON, null, 2);
        parseAndAnalyze(jsonInput.value);
      }
    });

    btnMinify.addEventListener('click', () => {
      if (parsedJSON !== null) {
        jsonInput.value = JSON.stringify(parsedJSON);
        parseAndAnalyze(jsonInput.value);
      }
    });

    // Copy JSON
    btnCopyJson.addEventListener('click', () => {
      if (jsonInput.value) {
        navigator.clipboard.writeText(jsonInput.value).then(() => {
          btnCopyJson.textContent = 'Copied!';
          setTimeout(() => { btnCopyJson.textContent = 'Copy JSON'; }, 1500);
        });
      }
    });

    // File upload
    jsonFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        jsonInput.value = evt.target.result;
        parseAndAnalyze(evt.target.result);
      };
      reader.readAsText(file);
      jsonFileInput.value = '';
    });

    // Tree Expand / Collapse All
    btnExpandAll.addEventListener('click', () => {
      treeContainer.querySelectorAll('.tree-children').forEach(c => c.classList.remove('hidden'));
      treeContainer.querySelectorAll('.tree-toggle-arrow').forEach(a => a.classList.remove('collapsed'));
    });

    btnCollapseAll.addEventListener('click', () => {
      treeContainer.querySelectorAll('.tree-children').forEach(c => c.classList.add('hidden'));
      treeContainer.querySelectorAll('.tree-toggle-arrow').forEach(a => a.classList.add('collapsed'));
    });

    // Array selector change
    arraySelector.addEventListener('change', () => {
      flattenActiveArray();
      renderKeyFrequency();
    });

    // Flat table search
    flatTableSearch.addEventListener('input', (e) => {
      flatFilterQuery = e.target.value;
      renderFlatTable();
    });

    // Export CSV
    btnExportCsv.addEventListener('click', exportCSV);

    // JSONPath Search
    btnRunSearch.addEventListener('click', executeSearch);
    jsonpathInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') executeSearch();
    });
    jsonpathInput.addEventListener('input', () => {
      if (jsonpathInput.value.length >= 2 || jsonpathInput.value.length === 0) {
        executeSearch();
      }
    });
  }

  // --- Initializer ---
  document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    // Pre-load default e-commerce catalog sample
    const initialText = JSON.stringify(SAMPLE_CATALOG, null, 2);
    jsonInput.value = initialText;
    parseAndAnalyze(initialText);
  });

})();