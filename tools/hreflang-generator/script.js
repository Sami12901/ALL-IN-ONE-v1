/**
 * Multilingual & Multi-Regional Hreflang Tags Generator
 * Client-side ISO validator and multi-format exporter
 */

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'fr', name: 'French (Français)' },
  { code: 'de', name: 'German (Deutsch)' },
  { code: 'it', name: 'Italian (Italiano)' },
  { code: 'pt', name: 'Portuguese (Português)' },
  { code: 'ru', name: 'Russian (Русский)' },
  { code: 'zh', name: 'Chinese (中文)' },
  { code: 'ja', name: 'Japanese (日本語)' },
  { code: 'ko', name: 'Korean (한국어)' },
  { code: 'ar', name: 'Arabic (العربية)' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'nl', name: 'Dutch (Nederlands)' },
  { code: 'tr', name: 'Turkish (Türkçe)' },
  { code: 'pl', name: 'Polish (Polski)' },
  { code: 'sv', name: 'Swedish (Svenska)' },
  { code: 'vi', name: 'Vietnamese (Tiếng Việt)' },
  { code: 'id', name: 'Indonesian (Bahasa Indonesia)' },
  { code: 'th', name: 'Thai (ไทย)' },
  { code: 'el', name: 'Greek (Ελληνικά)' },
  { code: 'cs', name: 'Czech (Čeština)' },
  { code: 'da', name: 'Danish (Dansk)' },
  { code: 'fi', name: 'Finnish (Suomi)' },
  { code: 'he', name: 'Hebrew (עברית)' },
  { code: 'hu', name: 'Hungarian (Magyar)' },
  { code: 'no', name: 'Norwegian (Norsk)' },
  { code: 'ro', name: 'Romanian (Română)' },
  { code: 'uk', name: 'Ukrainian (Українська)' },
  { code: 'ms', name: 'Malay (Bahasa Melayu)' }
];

const REGIONS = [
  { code: '', name: 'Global / Any Region' },
  { code: 'US', name: 'United States (US)' },
  { code: 'GB', name: 'United Kingdom (GB)' },
  { code: 'CA', name: 'Canada (CA)' },
  { code: 'AU', name: 'Australia (AU)' },
  { code: 'ES', name: 'Spain (ES)' },
  { code: 'MX', name: 'Mexico (MX)' },
  { code: 'FR', name: 'France (FR)' },
  { code: 'DE', name: 'Germany (DE)' },
  { code: 'SA', name: 'Saudi Arabia (SA)' },
  { code: 'AE', name: 'United Arab Emirates (AE)' },
  { code: 'JP', name: 'Japan (JP)' },
  { code: 'IN', name: 'India (IN)' },
  { code: 'BR', name: 'Brazil (BR)' },
  { code: 'IT', name: 'Italy (IT)' },
  { code: 'NL', name: 'Netherlands (NL)' },
  { code: 'RU', name: 'Russia (RU)' },
  { code: 'CN', name: 'China (CN)' },
  { code: 'KR', name: 'South Korea (KR)' },
  { code: 'CH', name: 'Switzerland (CH)' },
  { code: 'SG', name: 'Singapore (SG)' },
  { code: 'NZ', name: 'New Zealand (NZ)' },
  { code: 'IE', name: 'Ireland (IE)' },
  { code: 'AR', name: 'Argentina (AR)' },
  { code: 'CO', name: 'Colombia (CO)' },
  { code: 'CL', name: 'Chile (CL)' },
  { code: 'ZA', name: 'South Africa (ZA)' },
  { code: 'SE', name: 'Sweden (SE)' },
  { code: 'PL', name: 'Poland (PL)' },
  { code: 'TR', name: 'Turkey (TR)' }
];

class HreflangGenerator {
  constructor() {
    this.rows = [];
    this.nextId = 1;
    this.activeFormatTab = 'html'; // 'html' | 'xml' | 'header'

    this.initElements();
    this.bindEvents();
    this.loadPreset('global-es');
  }

  initElements() {
    // Config
    this.baseUrlInput = document.getElementById('base-url');
    this.toggleXDefault = document.getElementById('toggle-x-default');
    this.xDefaultUrlInput = document.getElementById('x-default-url');

    // Preset buttons
    this.presetGlobalEs = document.getElementById('preset-global-es');
    this.presetEurope = document.getElementById('preset-europe');
    this.presetAmericas = document.getElementById('preset-americas');
    this.presetAsia = document.getElementById('preset-asia');
    this.presetClear = document.getElementById('preset-clear');

    // Table
    this.tableBody = document.getElementById('hreflang-table-body');
    this.btnAddRow = document.getElementById('btn-add-row');

    // Validation
    this.validationSummaryBadge = document.getElementById('validation-summary-badge');
    this.validationItemsContainer = document.getElementById('validation-items-container');

    // Output
    this.outputCountBadge = document.getElementById('output-count-badge');
    this.tabHtml = document.getElementById('tab-html');
    this.tabXml = document.getElementById('tab-xml');
    this.tabHeader = document.getElementById('tab-header');
    this.codeOutputDisplay = document.getElementById('code-output-display');
    this.btnCopyOutput = document.getElementById('btn-copy-output');
    this.btnDownloadOutput = document.getElementById('btn-download-output');
  }

  bindEvents() {
    this.baseUrlInput.addEventListener('input', () => this.render());
    this.toggleXDefault.addEventListener('change', () => {
      this.xDefaultUrlInput.disabled = !this.toggleXDefault.checked;
      this.render();
    });
    this.xDefaultUrlInput.addEventListener('input', () => this.render());

    // Presets
    this.presetGlobalEs.addEventListener('click', () => this.loadPreset('global-es'));
    this.presetEurope.addEventListener('click', () => this.loadPreset('europe'));
    this.presetAmericas.addEventListener('click', () => this.loadPreset('americas'));
    this.presetAsia.addEventListener('click', () => this.loadPreset('asia'));
    this.presetClear.addEventListener('click', () => this.clearRows());

    // Add row
    this.btnAddRow.addEventListener('click', () => this.addRow('en', '', this.baseUrlInput.value.trim() || 'https://example.com/'));

    // Output tabs
    this.tabHtml.addEventListener('click', () => this.switchFormatTab('html'));
    this.tabXml.addEventListener('click', () => this.switchFormatTab('xml'));
    this.tabHeader.addEventListener('click', () => this.switchFormatTab('header'));

    // Copy & Download
    this.btnCopyOutput.addEventListener('click', () => this.copyOutput());
    this.btnDownloadOutput.addEventListener('click', () => this.downloadSnippet());
  }

  addRow(lang = 'en', region = '', url = '') {
    const row = {
      id: this.nextId++,
      lang,
      region,
      url: url || this.baseUrlInput.value.trim() || 'https://example.com/'
    };
    this.rows.push(row);
    this.render();
  }

  deleteRow(id) {
    if (this.rows.length <= 1) {
      alert('You must keep at least one language mapping row.');
      return;
    }
    this.rows = this.rows.filter(r => r.id !== id);
    this.render();
  }

  duplicateRow(id) {
    const target = this.rows.find(r => r.id === id);
    if (!target) return;
    this.addRow(target.lang, target.region, target.url);
  }

  clearRows() {
    this.rows = [];
    this.addRow('en', '', this.baseUrlInput.value.trim() || 'https://example.com/');
  }

  loadPreset(presetKey) {
    const base = 'https://example.com/';
    this.baseUrlInput.value = 'https://example.com/en/';
    this.toggleXDefault.checked = true;
    this.xDefaultUrlInput.disabled = false;
    this.xDefaultUrlInput.value = base;

    this.rows = [];

    if (presetKey === 'global-es') {
      this.rows = [
        { id: this.nextId++, lang: 'en', region: '', url: 'https://example.com/en/' },
        { id: this.nextId++, lang: 'en', region: 'US', url: 'https://example.com/en-us/' },
        { id: this.nextId++, lang: 'en', region: 'GB', url: 'https://example.com/en-gb/' },
        { id: this.nextId++, lang: 'es', region: '', url: 'https://example.com/es/' },
        { id: this.nextId++, lang: 'es', region: 'ES', url: 'https://example.com/es-es/' },
        { id: this.nextId++, lang: 'es', region: 'MX', url: 'https://example.com/es-mx/' }
      ];
    } else if (presetKey === 'europe') {
      this.baseUrlInput.value = 'https://example.com/en-gb/';
      this.rows = [
        { id: this.nextId++, lang: 'en', region: 'GB', url: 'https://example.com/en-gb/' },
        { id: this.nextId++, lang: 'fr', region: 'FR', url: 'https://example.com/fr-fr/' },
        { id: this.nextId++, lang: 'de', region: 'DE', url: 'https://example.com/de-de/' },
        { id: this.nextId++, lang: 'es', region: 'ES', url: 'https://example.com/es-es/' },
        { id: this.nextId++, lang: 'it', region: 'IT', url: 'https://example.com/it-it/' },
        { id: this.nextId++, lang: 'nl', region: 'NL', url: 'https://example.com/nl-nl/' }
      ];
    } else if (presetKey === 'americas') {
      this.baseUrlInput.value = 'https://example.com/en-us/';
      this.rows = [
        { id: this.nextId++, lang: 'en', region: 'US', url: 'https://example.com/en-us/' },
        { id: this.nextId++, lang: 'en', region: 'CA', url: 'https://example.com/en-ca/' },
        { id: this.nextId++, lang: 'fr', region: 'CA', url: 'https://example.com/fr-ca/' },
        { id: this.nextId++, lang: 'es', region: 'MX', url: 'https://example.com/es-mx/' },
        { id: this.nextId++, lang: 'pt', region: 'BR', url: 'https://example.com/pt-br/' }
      ];
    } else if (presetKey === 'asia') {
      this.baseUrlInput.value = 'https://example.com/ja-jp/';
      this.rows = [
        { id: this.nextId++, lang: 'ja', region: 'JP', url: 'https://example.com/ja-jp/' },
        { id: this.nextId++, lang: 'zh', region: 'CN', url: 'https://example.com/zh-cn/' },
        { id: this.nextId++, lang: 'ko', region: 'KR', url: 'https://example.com/ko-kr/' },
        { id: this.nextId++, lang: 'hi', region: 'IN', url: 'https://example.com/hi-in/' },
        { id: this.nextId++, lang: 'en', region: 'AU', url: 'https://example.com/en-au/' }
      ];
    }

    this.render();
  }

  computeHreflangCode(lang, region) {
    if (!lang) return '';
    if (!region) return lang.toLowerCase();
    return `${lang.toLowerCase()}-${region.toUpperCase()}`;
  }

  renderTable() {
    this.tableBody.innerHTML = this.rows.map(row => {
      const tag = this.computeHreflangCode(row.lang, row.region);
      const isBase = row.url.trim() === this.baseUrlInput.value.trim() && row.url.trim().length > 0;

      const langOptions = LANGUAGES.map(l => 
        `<option value="${l.code}" ${l.code === row.lang ? 'selected' : ''}>${l.name} (${l.code})</option>`
      ).join('');

      const regionOptions = REGIONS.map(r => 
        `<option value="${r.code}" ${r.code === row.region ? 'selected' : ''}>${r.name}</option>`
      ).join('');

      return `
        <tr data-row-id="${row.id}">
          <td>
            <select class="form-select row-lang" data-id="${row.id}" style="padding: 0.45rem 0.65rem; font-size: 0.825rem;">
              ${langOptions}
            </select>
          </td>
          <td>
            <select class="form-select row-region" data-id="${row.id}" style="padding: 0.45rem 0.65rem; font-size: 0.825rem;">
              ${regionOptions}
            </select>
          </td>
          <td>
            <span class="tag-badge">${tag}</span>
            ${isBase ? '<span style="display:block; font-size: 0.7rem; color: var(--success); font-weight: 600; margin-top: 2px;">Self-Ref</span>' : ''}
          </td>
          <td>
            <input 
              type="url" 
              class="form-input row-url" 
              data-id="${row.id}" 
              value="${this.escapeHtml(row.url)}" 
              placeholder="https://example.com/page/" 
              style="padding: 0.45rem 0.65rem; font-size: 0.825rem; font-family: var(--font-mono);"
            >
          </td>
          <td style="text-align: center;">
            <div style="display: inline-flex; gap: 0.25rem;">
              <button class="icon-action-btn duplicate" data-id="${row.id}" title="Duplicate this row">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
              <button class="icon-action-btn delete" data-id="${row.id}" title="Delete this row">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach listeners on newly rendered rows
    this.tableBody.querySelectorAll('.row-lang').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const id = parseInt(e.target.dataset.id, 10);
        const row = this.rows.find(r => r.id === id);
        if (row) {
          row.lang = e.target.value;
          this.render();
        }
      });
    });

    this.tableBody.querySelectorAll('.row-region').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const id = parseInt(e.target.dataset.id, 10);
        const row = this.rows.find(r => r.id === id);
        if (row) {
          row.region = e.target.value;
          this.render();
        }
      });
    });

    this.tableBody.querySelectorAll('.row-url').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const id = parseInt(e.target.dataset.id, 10);
        const row = this.rows.find(r => r.id === id);
        if (row) {
          row.url = e.target.value;
          this.renderOutputsAndValidation();
        }
      });
    });

    this.tableBody.querySelectorAll('.icon-action-btn.duplicate').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.dataset.id, 10);
        this.duplicateRow(id);
      });
    });

    this.tableBody.querySelectorAll('.icon-action-btn.delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.dataset.id, 10);
        this.deleteRow(id);
      });
    });
  }

  validate() {
    const checks = [];
    const baseUrl = this.baseUrlInput.value.trim();
    const hasXDefault = this.toggleXDefault.checked;
    const xDefaultUrl = this.xDefaultUrlInput.value.trim();

    // 1. Base URL Absolute Protocol Check
    const isBaseUrlValid = /^https?:\/\/.+/i.test(baseUrl);
    checks.push({
      status: isBaseUrlValid ? 'passed' : 'error',
      text: isBaseUrlValid 
        ? `Canonical base URL is fully qualified (${baseUrl})`
        : 'Canonical base URL must be an absolute URL starting with http:// or https://'
    });

    // 2. Self-referencing tag check (Google requirement)
    const hasSelfRef = this.rows.some(r => r.url.trim() === baseUrl && baseUrl.length > 0);
    checks.push({
      status: hasSelfRef ? 'passed' : 'warning',
      text: hasSelfRef 
        ? 'Self-referencing hreflang tag confirmed (current page references itself)'
        : 'Missing self-referencing hreflang tag. Google requires each alternate page to link back to itself.'
    });

    // 3. Absolute Target URLs check
    const invalidUrls = this.rows.filter(r => !/^https?:\/\/.+/i.test(r.url.trim()));
    checks.push({
      status: invalidUrls.length === 0 ? 'passed' : 'error',
      text: invalidUrls.length === 0 
        ? 'All target URLs are valid absolute URLs'
        : `${invalidUrls.length} row(s) contain invalid or relative URLs (must start with https:// or http://)`
    });

    // 4. Duplicate hreflang tags check
    const tagCounts = {};
    this.rows.forEach(r => {
      const code = this.computeHreflangCode(r.lang, r.region);
      tagCounts[code] = (tagCounts[code] || 0) + 1;
    });

    const duplicates = Object.keys(tagCounts).filter(k => tagCounts[k] > 1);
    checks.push({
      status: duplicates.length === 0 ? 'passed' : 'error',
      text: duplicates.length === 0 
        ? 'No duplicate language/region targeting detected'
        : `Duplicate hreflang tag(s) detected: ${duplicates.join(', ')}. Each language-region combo must be unique.`
    });

    // 5. x-default fallback check
    if (hasXDefault) {
      const isXDefaultValid = /^https?:\/\/.+/i.test(xDefaultUrl);
      checks.push({
        status: isXDefaultValid ? 'passed' : 'warning',
        text: isXDefaultValid 
          ? `x-default fallback tag configured for unmatched visitors (${xDefaultUrl})`
          : 'x-default is enabled but URL is invalid or empty'
      });
    }

    // Render validation
    const hasErrors = checks.some(c => c.status === 'error');
    const hasWarnings = checks.some(c => c.status === 'warning');

    if (hasErrors) {
      this.validationSummaryBadge.textContent = 'Errors Detected';
      this.validationSummaryBadge.style.background = 'rgba(239, 68, 68, 0.15)';
      this.validationSummaryBadge.style.color = 'var(--error)';
      this.validationSummaryBadge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    } else if (hasWarnings) {
      this.validationSummaryBadge.textContent = 'Optimization Advice';
      this.validationSummaryBadge.style.background = 'rgba(245, 158, 11, 0.15)';
      this.validationSummaryBadge.style.color = 'var(--warning)';
      this.validationSummaryBadge.style.borderColor = 'rgba(245, 158, 11, 0.3)';
    } else {
      this.validationSummaryBadge.textContent = 'Valid & SEO-Ready';
      this.validationSummaryBadge.style.background = 'rgba(16, 185, 129, 0.15)';
      this.validationSummaryBadge.style.color = 'var(--success)';
      this.validationSummaryBadge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
    }

    this.validationItemsContainer.innerHTML = checks.map(c => {
      let icon = '';
      if (c.status === 'passed') {
        icon = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      } else if (c.status === 'warning') {
        icon = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
      } else {
        icon = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
      }

      return `
        <div class="validation-item ${c.status}">
          ${icon}
          <span>${this.escapeHtml(c.text)}</span>
        </div>
      `;
    }).join('');
  }

  generateOutputCode() {
    const list = this.rows.map(r => ({
      code: this.computeHreflangCode(r.lang, r.region),
      url: r.url.trim()
    })).filter(item => item.code && item.url);

    if (this.toggleXDefault.checked && this.xDefaultUrlInput.value.trim()) {
      list.push({
        code: 'x-default',
        url: this.xDefaultUrlInput.value.trim()
      });
    }

    this.outputCountBadge.textContent = `${list.length} Tags Generated`;

    if (this.activeFormatTab === 'html') {
      const lines = [
        '<!-- Hreflang SEO Annotations (Place in <head>) -->',
        ...list.map(i => `<link rel="alternate" hreflang="${i.code}" href="${i.url}" />`)
      ];
      return lines.join('\n');
    } else if (this.activeFormatTab === 'xml') {
      const canonical = this.baseUrlInput.value.trim() || 'https://example.com/';
      const lines = [
        '<!-- XML Sitemap Entry (<url> Node) -->',
        '<url>',
        `  <loc>${canonical}</loc>`,
        ...list.map(i => `  <xhtml:link rel="alternate" hreflang="${i.code}" href="${i.url}"/>`),
        '</url>'
      ];
      return lines.join('\n');
    } else if (this.activeFormatTab === 'header') {
      const headerValues = list.map(i => `<${i.url}>; rel="alternate"; hreflang="${i.code}"`);
      const lines = [
        '# HTTP Response Header (e.g. for PDF files or server config)',
        `Link: ${headerValues.join(',\n      ')}`
      ];
      return lines.join('\n');
    }

    return '';
  }

  switchFormatTab(tabKey) {
    this.activeFormatTab = tabKey;
    [this.tabHtml, this.tabXml, this.tabHeader].forEach(btn => btn.classList.remove('active'));

    if (tabKey === 'html') {
      this.tabHtml.classList.add('active');
    } else if (tabKey === 'xml') {
      this.tabXml.classList.add('active');
    } else if (tabKey === 'header') {
      this.tabHeader.classList.add('active');
    }

    this.renderOutputsAndValidation();
  }

  renderOutputsAndValidation() {
    this.validate();
    this.codeOutputDisplay.textContent = this.generateOutputCode();
  }

  render() {
    this.renderTable();
    this.renderOutputsAndValidation();
  }

  copyOutput() {
    const text = this.codeOutputDisplay.textContent;
    if (!text || !text.trim()) return;

    navigator.clipboard.writeText(text).then(() => {
      const origHTML = this.btnCopyOutput.innerHTML;
      this.btnCopyOutput.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        Copied Tags!
      `;
      this.btnCopyOutput.style.background = 'var(--success)';
      this.btnCopyOutput.style.borderColor = 'transparent';
      this.btnCopyOutput.style.color = '#ffffff';

      setTimeout(() => {
        this.btnCopyOutput.innerHTML = origHTML;
        this.btnCopyOutput.style.background = '';
        this.btnCopyOutput.style.borderColor = '';
        this.btnCopyOutput.style.color = '';
      }, 1600);
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
    });
  }

  downloadSnippet() {
    const content = this.codeOutputDisplay.textContent;
    if (!content.trim()) return;

    let filename = 'hreflang-tags.html';
    let mimeType = 'text/html';

    if (this.activeFormatTab === 'xml') {
      filename = 'sitemap-hreflang.xml';
      mimeType = 'application/xml';
    } else if (this.activeFormatTab === 'header') {
      filename = 'hreflang-headers.txt';
      mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  }
}

// Instantiate upon script load
document.addEventListener('DOMContentLoaded', () => {
  window.hreflangGenerator = new HreflangGenerator();
});