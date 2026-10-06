// FAQ Generator - Client-Side Interactive Engine

const FAQ_TEMPLATES = {
  ecommerce: [
    {
      q: "What is your return and exchange policy?",
      a: "We offer a 30-day hassle-free return window for all unworn and undamaged items. Return shipping is free on domestic orders, and refunds are processed within 3-5 business days of receiving the return."
    },
    {
      q: "How long will my order take to arrive?",
      a: "Standard shipping typically takes 3 to 5 business days within the continental US. Express 2-day delivery and priority overnight options are also available at checkout."
    },
    {
      q: "Do you ship internationally?",
      a: "Yes, we ship to over 85 countries worldwide. International delivery typically takes 7-14 business days. Applicable import duties and VAT are calculated upfront at checkout."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept Visa, MasterCard, American Express, PayPal, Apple Pay, Google Pay, and interest-free installment plans via Klarna and Afterpay."
    },
    {
      q: "How can I track the status of my order?",
      a: "As soon as your order ships, you will receive an email confirmation containing your courier tracking link and real-time shipment updates."
    }
  ],
  saas: [
    {
      q: "Do I need a credit card to start the free trial?",
      a: "No! You can explore all premium features completely free for 14 days without entering credit card details. You can upgrade anytime when you're ready."
    },
    {
      q: "Can I cancel or change my plan anytime?",
      a: "Yes, you can upgrade, downgrade, or cancel your subscription at any time directly from your billing dashboard with no lock-in contracts or penalty fees."
    },
    {
      q: "How secure is my data and is it GDPR-compliant?",
      a: "We use end-to-end 256-bit AES encryption at rest and in transit. Our infrastructure is hosted in SOC-2 Type II certified data centers and is fully compliant with GDPR and CCPA."
    },
    {
      q: "Does your software integrate with our existing stack?",
      a: "Yes, we provide native two-way integrations with Slack, Zapier, HubSpot, Salesforce, Google Workspace, and offer a comprehensive REST API and webhooks."
    },
    {
      q: "What level of customer support is included?",
      a: "All accounts include 24/7 email and chat support. Enterprise tiers also receive a dedicated customer success manager and guaranteed 1-hour SLA response times."
    }
  ],
  agency: [
    {
      q: "What is your typical project kickoff timeline?",
      a: "Once the proposal and initial deposit are approved, we schedule our initial deep-dive discovery workshop within 3 to 5 business days."
    },
    {
      q: "How do you handle scope changes and revisions?",
      a: "Every deliverable milestone includes up to two rounds of comprehensive revisions. Any major out-of-scope requests are quoted transparently before work commences."
    },
    {
      q: "Who owns the intellectual property (IP) created?",
      a: "Upon final project invoice settlement, full intellectual property rights, source assets, and production files are 100% transferred to you."
    },
    {
      q: "How does your pricing and billing schedule work?",
      a: "We typically work on either a milestone-based fixed contract (50% deposit, 50% on completion) or a monthly dedicated retainer with defined deliverables."
    }
  ],
  course: [
    {
      q: "Are there any prerequisites before enrolling in this course?",
      a: "No prior experience is necessary. We start from absolute fundamentals and systematically advance to intermediate and master-level frameworks."
    },
    {
      q: "Do I get lifetime access to course materials and updates?",
      a: "Yes! Your enrollment grants permanent, unlimited access to all course video modules, downloadable worksheets, community channels, and future curriculum updates."
    },
    {
      q: "Is there a money-back guarantee?",
      a: "Yes, we provide a 100% money-back guarantee for 14 days. If you go through the first two modules and feel it's not the right fit, simply email support for a full refund."
    },
    {
      q: "Will I receive a certificate of completion?",
      a: "Yes, upon submitting your capstone project and completing 100% of the lessons, you will receive a verified digital certificate you can display on LinkedIn."
    }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const qInput = document.getElementById('q-input');
  const aInput = document.getElementById('a-input');
  const addFaqBtn = document.getElementById('add-faq-btn');
  const addBtnLabel = document.getElementById('add-btn-label');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const clearAllBtn = document.getElementById('clear-all-btn');
  const faqCountBadge = document.getElementById('faq-count-badge');
  const templateButtons = document.querySelectorAll('.template-btn');
  const faqSearch = document.getElementById('faq-search');
  const toggleAllAccordionBtn = document.getElementById('toggle-all-accordion-btn');
  const copyActiveBtn = document.getElementById('copy-active-btn');
  const copyBtnText = document.getElementById('copy-btn-text');
  const appToast = document.getElementById('app-toast');

  // Views & Tabs
  const tabButtons = document.querySelectorAll('.faq-tab-btn');
  const viewPanes = document.querySelectorAll('.faq-view-pane');
  const accordionContainer = document.getElementById('accordion-container');
  const schemaDisplay = document.getElementById('schema-code-display');
  const htmlDisplay = document.getElementById('html-code-display');
  const markdownDisplay = document.getElementById('markdown-code-display');

  // State
  let faqs = JSON.parse(localStorage.getItem('custom_faq_items') || 'null');
  if (!faqs || faqs.length === 0) {
    faqs = [...FAQ_TEMPLATES.ecommerce];
  }

  let editingIndex = -1;
  let activeTab = 'tab-accordion';
  let allExpanded = false;

  // Toast Helper
  let toastTimer = null;
  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    appToast.textContent = message;
    appToast.classList.add('show');
    toastTimer = setTimeout(() => {
      appToast.classList.remove('show');
    }, 2400);
  }

  // Save to LocalStorage
  function saveFaqs() {
    localStorage.setItem('custom_faq_items', JSON.stringify(faqs));
  }

  // Update All Views
  function updateAll() {
    saveFaqs();
    faqCountBadge.textContent = faqs.length;
    renderAccordion();
    renderSchema();
    renderHtmlCode();
    renderMarkdownCode();
  }

  // Escape HTML Helper
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Render Accordion
  function renderAccordion() {
    const query = faqSearch.value.trim().toLowerCase();
    const filtered = faqs.map((item, index) => ({ ...item, originalIndex: index }))
      .filter(item => !query || item.q.toLowerCase().includes(query) || item.a.toLowerCase().includes(query));

    if (filtered.length === 0) {
      accordionContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-secondary); background: var(--bg-tertiary); border: 1px dashed var(--border); border-radius: var(--radius-md);">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 0.5rem; opacity: 0.7;"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-primary);">No FAQ questions found</div>
          <div style="font-size: 0.8rem; margin-top: 0.25rem;">Add a new question using the form or choose a template preset.</div>
        </div>
      `;
      return;
    }

    accordionContainer.innerHTML = filtered.map((item) => {
      const idx = item.originalIndex;
      const isOpen = allExpanded || false;

      return `
        <div class="faq-accordion-item ${isOpen ? 'open' : ''}" data-index="${idx}">
          <div class="faq-item-header" data-toggle="${idx}">
            <div class="faq-item-title">
              <span class="faq-order-index">Q${idx + 1}</span>
              <span>${escapeHtml(item.q)}</span>
            </div>
            
            <div class="faq-item-controls" onclick="event.stopPropagation();">
              <button class="faq-ctrl-btn btn-up" data-idx="${idx}" title="Move Up" ${idx === 0 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ''}>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>
              </button>
              <button class="faq-ctrl-btn btn-down" data-idx="${idx}" title="Move Down" ${idx === faqs.length - 1 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ''}>
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              <button class="faq-ctrl-btn btn-edit" data-idx="${idx}" title="Edit Question">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="faq-ctrl-btn btn-del" data-idx="${idx}" title="Delete Question">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
              <span class="faq-chevron">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </div>
          </div>

          <div class="faq-item-body">
            ${escapeHtml(item.a).replace(/\n/g, '<br>')}
          </div>
        </div>
      `;
    }).join('');

    attachAccordionEvents();
  }

  // Attach Accordion Event Listeners
  function attachAccordionEvents() {
    // Header click to toggle
    accordionContainer.querySelectorAll('.faq-item-header').forEach(header => {
      header.addEventListener('click', () => {
        const item = header.closest('.faq-accordion-item');
        item.classList.toggle('open');
      });
    });

    // Move Up
    accordionContainer.querySelectorAll('.btn-up').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx, 10);
        if (idx > 0) {
          const temp = faqs[idx];
          faqs[idx] = faqs[idx - 1];
          faqs[idx - 1] = temp;
          updateAll();
        }
      });
    });

    // Move Down
    accordionContainer.querySelectorAll('.btn-down').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx, 10);
        if (idx < faqs.length - 1) {
          const temp = faqs[idx];
          faqs[idx] = faqs[idx + 1];
          faqs[idx + 1] = temp;
          updateAll();
        }
      });
    });

    // Edit
    accordionContainer.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx, 10);
        const item = faqs[idx];
        qInput.value = item.q;
        aInput.value = item.a;
        editingIndex = idx;
        addBtnLabel.textContent = 'Update Question';
        cancelEditBtn.style.display = 'inline-block';
        qInput.focus();
        showToast(`Editing Question #${idx + 1}`);
      });
    });

    // Delete
    accordionContainer.querySelectorAll('.btn-del').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx, 10);
        faqs.splice(idx, 1);
        if (editingIndex === idx) {
          resetEditState();
        }
        updateAll();
        showToast('Question deleted');
      });
    });
  }

  // Render Schema.org JSON-LD
  function renderSchema() {
    const schemaObj = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(item => ({
        "@type": "Question",
        "name": item.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.a
        }
      }))
    };

    const formattedJson = JSON.stringify(schemaObj, null, 2);
    const code = `<script type="application/ld+json">\n${formattedJson}\n<\/script>`;
    schemaDisplay.textContent = code;
  }

  // Render Clean HTML Markup
  function renderHtmlCode() {
    let html = `<div class="faq-section" itemscope itemtype="https://schema.org/FAQPage">\n`;
    html += `  <h2 class="faq-heading">Frequently Asked Questions</h2>\n`;
    html += `  <div class="faq-list">\n`;

    faqs.forEach((item) => {
      html += `    <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">\n`;
      html += `      <h3 class="faq-question" itemprop="name">${item.q}</h3>\n`;
      html += `      <div class="faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">\n`;
      html += `        <p itemprop="text">${item.a}</p>\n`;
      html += `      </div>\n`;
      html += `    </div>\n`;
    });

    html += `  </div>\n`;
    html += `</div>`;

    htmlDisplay.textContent = html;
  }

  // Render Markdown Code
  function renderMarkdownCode() {
    let md = `## Frequently Asked Questions\n\n`;
    faqs.forEach((item, idx) => {
      md += `### ${idx + 1}. ${item.q}\n\n`;
      md += `${item.a}\n\n`;
    });
    markdownDisplay.textContent = md;
  }

  // Reset Edit State
  function resetEditState() {
    editingIndex = -1;
    qInput.value = '';
    aInput.value = '';
    addBtnLabel.textContent = 'Add Question';
    cancelEditBtn.style.display = 'none';
  }

  // Add / Update Question
  addFaqBtn.addEventListener('click', () => {
    const qVal = qInput.value.trim();
    const aVal = aInput.value.trim();

    if (!qVal) {
      showToast('Please enter a question');
      qInput.focus();
      return;
    }
    if (!aVal) {
      showToast('Please enter an answer');
      aInput.focus();
      return;
    }

    if (editingIndex >= 0) {
      faqs[editingIndex] = { q: qVal, a: aVal };
      resetEditState();
      showToast('Updated question successfully!');
    } else {
      faqs.push({ q: qVal, a: aVal });
      qInput.value = '';
      aInput.value = '';
      qInput.focus();
      showToast('Added question to FAQ!');
    }

    updateAll();
  });

  // Cancel Edit
  cancelEditBtn.addEventListener('click', () => {
    resetEditState();
    showToast('Cancelled question editing');
  });

  // Search filter
  faqSearch.addEventListener('input', () => {
    renderAccordion();
  });

  // Toggle All Accordion
  toggleAllAccordionBtn.addEventListener('click', () => {
    allExpanded = !allExpanded;
    toggleAllAccordionBtn.textContent = allExpanded ? 'Collapse All' : 'Expand All';
    accordionContainer.querySelectorAll('.faq-accordion-item').forEach(item => {
      if (allExpanded) {
        item.classList.add('open');
      } else {
        item.classList.remove('open');
      }
    });
  });

  // Template Buttons
  templateButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const templateKey = btn.dataset.template;
      if (FAQ_TEMPLATES[templateKey]) {
        faqs = [...FAQ_TEMPLATES[templateKey]];
        resetEditState();
        updateAll();
        showToast(`Loaded ${faqs.length} ${templateKey.toUpperCase()} questions!`);
      }
    });
  });

  // Clear All FAQs
  clearAllBtn.addEventListener('click', () => {
    if (faqs.length === 0) return;
    if (confirm('Are you sure you want to clear all FAQ questions?')) {
      faqs = [];
      resetEditState();
      updateAll();
      showToast('All FAQ questions cleared');
    }
  });

  // View Tabs
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      activeTab = targetTab;

      tabButtons.forEach(b => b.classList.remove('active'));
      viewPanes.forEach(p => p.style.display = 'none');

      btn.classList.add('active');
      const targetPane = document.getElementById(targetTab);
      if (targetPane) targetPane.style.display = 'block';

      // Update Copy button label
      if (targetTab === 'tab-schema') copyBtnText.textContent = 'Copy JSON-LD';
      else if (targetTab === 'tab-html') copyBtnText.textContent = 'Copy HTML';
      else if (targetTab === 'tab-markdown') copyBtnText.textContent = 'Copy Markdown';
      else copyBtnText.textContent = 'Copy JSON-LD';
    });
  });

  // Copy Active View Button
  copyActiveBtn.addEventListener('click', () => {
    let contentToCopy = '';
    let label = 'JSON-LD';

    if (activeTab === 'tab-schema' || activeTab === 'tab-accordion') {
      contentToCopy = schemaDisplay.textContent;
      label = 'Schema JSON-LD';
    } else if (activeTab === 'tab-html') {
      contentToCopy = htmlDisplay.textContent;
      label = 'HTML Markup';
    } else if (activeTab === 'tab-markdown') {
      contentToCopy = markdownDisplay.textContent;
      label = 'Markdown';
    }

    if (!contentToCopy) {
      showToast('Nothing to copy');
      return;
    }

    navigator.clipboard.writeText(contentToCopy).then(() => {
      showToast(`Copied ${label} to clipboard!`);
    });
  });

  // Initial Run
  updateAll();
});