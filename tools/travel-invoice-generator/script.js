// Travel Invoice Generator Logic

const STORAGE_KEY = 'aio_travel_invoice_data';

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'AED ',
  AUD: 'A$',
  CAD: 'C$',
  JPY: '¥'
};

const CATEGORY_OPTIONS = [
  'Flights',
  'Hotels',
  'Visa Processing',
  'Airport Transfers',
  'Travel Insurance',
  'Guided Tours',
  'Concierge & Service Fee'
];

const PRESETS = {
  dubai: {
    agencyName: 'Aura Luxe Travel Concierge',
    agencyTagline: 'IATA #92-81920 • Bespoke Journeys',
    agencyEmail: 'concierge@auraluxetravel.com',
    agencyPhone: '+1 (800) 492-8820',
    agencyAddress: 'Suite 4800, 350 5th Avenue, New York, NY 10118',
    clientName: 'Lord Julian Sterling',
    clientPassport: 'GB-982144 • PNR: EK902X',
    clientEmail: 'julian.sterling@sterlingholdings.co.uk',
    clientPhone: '+44 20 7946 0912',
    clientAddress: '14 Kensington Palace Gardens, London W8 4QX',
    invoiceNumber: 'INV-2026-DXB01',
    currency: 'USD',
    status: 'Pending',
    discount: 500,
    paid: 2000,
    bankDetails: 'JPMorgan Chase NY | SWIFT: CHASUS33 | Account: 8812-4401-9921 | Aura Luxe Travel LLC',
    terms: 'Flight tickets are issued under Emirates First Fare rules. Hotel cancellation valid up to 72 hours before arrival.',
    items: [
      { id: 'item-1', category: 'Flights', desc: 'Emirates First Class (LHR ⇄ DXB) A380 Private Suites', qty: 2, price: 6200, tax: 5 },
      { id: 'item-2', category: 'Hotels', desc: 'Burj Al Arab Jumeirah - 1-Bedroom Deluxe Ocean Suite (5 Nights)', qty: 5, price: 1850, tax: 10 },
      { id: 'item-3', category: 'Airport Transfers', desc: 'VIP Airport Meet & Assist + Rolls-Royce Phantom Transfers', qty: 2, price: 450, tax: 5 },
      { id: 'item-4', category: 'Visa Processing', desc: 'UAE 30-Day Express Tourist Visa Clearance', qty: 2, price: 180, tax: 0 },
      { id: 'item-5', category: 'Travel Insurance', desc: 'Allianz Global Platinum Medical & Flight Disruption Policy', qty: 2, price: 240, tax: 0 }
    ]
  },
  europe: {
    agencyName: 'Grand Continental Voyages',
    agencyTagline: 'ABTA #Y4012 • European Specialist',
    agencyEmail: 'bookings@continentalvoyages.eu',
    agencyPhone: '+33 1 42 68 55 00',
    agencyAddress: '24 Place Vendôme, 75001 Paris, France',
    clientName: 'Dr. Evelyn Montgomery',
    clientPassport: 'US-7740192 • PNR: AF1401',
    clientEmail: 'evelyn.montgomery@biofoundry.org',
    clientPhone: '+1 (415) 883-9120',
    clientAddress: '2200 Pacific Avenue, San Francisco, CA 94115',
    invoiceNumber: 'INV-2026-EUR44',
    currency: 'EUR',
    status: 'Deposit',
    discount: 300,
    paid: 4500,
    bankDetails: 'BNP Paribas Paris | IBAN: FR76 3000 4012 8820 1928 334 | Grand Continental Voyages SAS',
    terms: 'Private museum curators and historical guides confirmed upon deposit. Train reservations non-exchangeable.',
    items: [
      { id: 'item-1', category: 'Hotels', desc: 'Le Meurice, Dorchester Collection Paris - Executive Tuileries Room', qty: 4, price: 1400, tax: 10 },
      { id: 'item-2', category: 'Flights', desc: 'Air France Business Class (CDG ⇄ FCO)', qty: 1, price: 850, tax: 10 },
      { id: 'item-3', category: 'Hotels', desc: 'Hotel de Russie Rome - Classic Suite overlooking Piazza del Popolo', qty: 3, price: 1250, tax: 10 },
      { id: 'item-4', category: 'Guided Tours', desc: 'Private After-Hours Vatican Museum & Sistine Chapel Tour', qty: 1, price: 1100, tax: 5 },
      { id: 'item-5', category: 'Visa Processing', desc: 'Schengen Multi-Entry Priority Diplomatic Fast-Track', qty: 1, price: 220, tax: 0 }
    ]
  },
  bali: {
    agencyName: 'Serene Tropic Concierge',
    agencyTagline: 'Luxury Southeast Asian Itineraries',
    agencyEmail: 'hello@serenetropic.com',
    agencyPhone: '+65 6789 2211',
    agencyAddress: 'Marina Bay Financial Centre, Tower 2, Singapore',
    clientName: 'Liam & Olivia Vance',
    clientPassport: 'AU-992140 / AU-992141 • PNR: SQ948',
    clientEmail: 'olivia.vance@vancemedia.com.au',
    clientPhone: '+61 2 9231 4400',
    clientAddress: '88 Point Piper Rd, Sydney NSW 2027, Australia',
    invoiceNumber: 'INV-2026-DPS88',
    currency: 'USD',
    status: 'Paid',
    discount: 250,
    paid: 9850,
    bankDetails: 'DBS Bank Singapore | SWIFT: DBSSSGSG | Account: 014-99210-4 | Serene Tropic Pte Ltd',
    terms: 'Full payment received. Private pool villa guarantees early check-in and complimentary breakfast & spa ritual.',
    items: [
      { id: 'item-1', category: 'Hotels', desc: 'Four Seasons Resort Bali at Sayan - Riverfront Pool Villa (7 Nights)', qty: 7, price: 980, tax: 10 },
      { id: 'item-2', category: 'Airport Transfers', desc: 'Ngurah Rai VIP Tarmac Fast Track + Luxury Mercedes Chauffeur', qty: 2, price: 210, tax: 0 },
      { id: 'item-3', category: 'Guided Tours', desc: 'Private Sacred Temple Sunrise & Helicopter Volcano Expedition', qty: 1, price: 1450, tax: 5 },
      { id: 'item-4', category: 'Travel Insurance', desc: 'Chubb World Medical & Scuba Excursion Endorsement', qty: 2, price: 195, tax: 0 }
    ]
  }
};

class TravelInvoiceApp {
  constructor() {
    this.data = null;
    this.initElements();
    this.loadState();
    this.attachEventListeners();
    this.render();
  }

  initElements() {
    // Agency inputs
    this.inputAgencyName = document.getElementById('agency-name');
    this.inputAgencyTagline = document.getElementById('agency-tagline');
    this.inputAgencyEmail = document.getElementById('agency-email');
    this.inputAgencyPhone = document.getElementById('agency-phone');
    this.inputAgencyAddress = document.getElementById('agency-address');

    // Client inputs
    this.inputClientName = document.getElementById('client-name');
    this.inputClientPassport = document.getElementById('client-passport');
    this.inputClientEmail = document.getElementById('client-email');
    this.inputClientPhone = document.getElementById('client-phone');
    this.inputClientAddress = document.getElementById('client-address');

    // Invoice meta
    this.inputInvoiceNumber = document.getElementById('invoice-number');
    this.inputInvoiceCurrency = document.getElementById('invoice-currency');
    this.inputInvoiceDate = document.getElementById('invoice-date');
    this.inputInvoiceDueDate = document.getElementById('invoice-due-date');
    this.inputInvoiceStatus = document.getElementById('invoice-status');

    // Settlement
    this.inputDiscount = document.getElementById('inv-discount');
    this.inputPaid = document.getElementById('inv-paid');
    this.inputBankDetails = document.getElementById('inv-bank-details');
    this.inputTerms = document.getElementById('inv-terms');

    // Items container
    this.lineItemsContainer = document.getElementById('line-items-container');
    this.btnAddLine = document.getElementById('btn-add-line');

    // Action buttons
    this.btnPrint = document.getElementById('btn-print-invoice');
    this.btnCopySummary = document.getElementById('btn-copy-summary');
    this.btnReset = document.getElementById('btn-reset-invoice');
    this.btnPresetDubai = document.getElementById('btn-preset-dubai');
    this.btnPresetEurope = document.getElementById('btn-preset-europe');
    this.btnPresetBali = document.getElementById('btn-preset-bali');

    // Preview Elements
    this.viewAgencyName = document.getElementById('view-agency-name');
    this.viewAgencyTagline = document.getElementById('view-agency-tagline');
    this.viewAgencyAddress = document.getElementById('view-agency-address');
    this.viewAgencyContact = document.getElementById('view-agency-contact');

    this.viewInvoiceNumber = document.getElementById('view-invoice-number');
    this.viewInvoiceStatus = document.getElementById('view-invoice-status');
    this.viewClientName = document.getElementById('view-client-name');
    this.viewClientRef = document.getElementById('view-client-ref');
    this.viewClientAddress = document.getElementById('view-client-address');
    this.viewClientContact = document.getElementById('view-client-contact');

    this.viewIssueDate = document.getElementById('view-issue-date');
    this.viewDueDate = document.getElementById('view-due-date');
    this.viewCurrency = document.getElementById('view-currency');

    this.viewItemsTbody = document.getElementById('view-items-tbody');

    this.viewSubtotal = document.getElementById('view-subtotal');
    this.viewDiscountRow = document.getElementById('view-discount-row');
    this.viewDiscount = document.getElementById('view-discount');
    this.viewTaxTotal = document.getElementById('view-tax-total');
    this.viewGrandTotal = document.getElementById('view-grand-total');
    this.viewPaidRow = document.getElementById('view-paid-row');
    this.viewPaidAmount = document.getElementById('view-paid-amount');
    this.viewBalanceDue = document.getElementById('view-balance-due');

    this.viewBankDetails = document.getElementById('view-bank-details');
    this.viewTerms = document.getElementById('view-terms');
  }

  loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.data = JSON.parse(stored);
      } else {
        this.loadPreset('dubai');
        return;
      }
    } catch {
      this.loadPreset('dubai');
      return;
    }

    this.syncFormFromData();
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Failed to save travel invoice data', e);
    }
  }

  loadPreset(key) {
    const preset = PRESETS[key] || PRESETS.dubai;
    this.data = JSON.parse(JSON.stringify(preset));

    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 14);

    this.data.issueDate = today.toISOString().split('T')[0];
    this.data.dueDate = dueDate.toISOString().split('T')[0];

    this.syncFormFromData();
    this.saveState();
    this.render();
  }

  syncFormFromData() {
    if (!this.data) return;

    this.inputAgencyName.value = this.data.agencyName || '';
    this.inputAgencyTagline.value = this.data.agencyTagline || '';
    this.inputAgencyEmail.value = this.data.agencyEmail || '';
    this.inputAgencyPhone.value = this.data.agencyPhone || '';
    this.inputAgencyAddress.value = this.data.agencyAddress || '';

    this.inputClientName.value = this.data.clientName || '';
    this.inputClientPassport.value = this.data.clientPassport || '';
    this.inputClientEmail.value = this.data.clientEmail || '';
    this.inputClientPhone.value = this.data.clientPhone || '';
    this.inputClientAddress.value = this.data.clientAddress || '';

    this.inputInvoiceNumber.value = this.data.invoiceNumber || 'INV-001';
    this.inputInvoiceCurrency.value = this.data.currency || 'USD';
    this.inputInvoiceDate.value = this.data.issueDate || new Date().toISOString().split('T')[0];
    this.inputInvoiceDueDate.value = this.data.dueDate || new Date().toISOString().split('T')[0];
    this.inputInvoiceStatus.value = this.data.status || 'Pending';

    this.inputDiscount.value = this.data.discount ?? 0;
    this.inputPaid.value = this.data.paid ?? 0;
    this.inputBankDetails.value = this.data.bankDetails || '';
    this.inputTerms.value = this.data.terms || '';

    this.renderEditorItems();
  }

  syncDataFromForm() {
    this.data.agencyName = this.inputAgencyName.value;
    this.data.agencyTagline = this.inputAgencyTagline.value;
    this.data.agencyEmail = this.inputAgencyEmail.value;
    this.data.agencyPhone = this.inputAgencyPhone.value;
    this.data.agencyAddress = this.inputAgencyAddress.value;

    this.data.clientName = this.inputClientName.value;
    this.data.clientPassport = this.inputClientPassport.value;
    this.data.clientEmail = this.inputClientEmail.value;
    this.data.clientPhone = this.inputClientPhone.value;
    this.data.clientAddress = this.inputClientAddress.value;

    this.data.invoiceNumber = this.inputInvoiceNumber.value;
    this.data.currency = this.inputInvoiceCurrency.value;
    this.data.issueDate = this.inputInvoiceDate.value;
    this.data.dueDate = this.inputInvoiceDueDate.value;
    this.data.status = this.inputInvoiceStatus.value;

    this.data.discount = parseFloat(this.inputDiscount.value) || 0;
    this.data.paid = parseFloat(this.inputPaid.value) || 0;
    this.data.bankDetails = this.inputBankDetails.value;
    this.data.terms = this.inputTerms.value;

    this.saveState();
  }

  attachEventListeners() {
    // Form inputs change
    const inputs = [
      this.inputAgencyName, this.inputAgencyTagline, this.inputAgencyEmail, this.inputAgencyPhone, this.inputAgencyAddress,
      this.inputClientName, this.inputClientPassport, this.inputClientEmail, this.inputClientPhone, this.inputClientAddress,
      this.inputInvoiceNumber, this.inputInvoiceCurrency, this.inputInvoiceDate, this.inputInvoiceDueDate, this.inputInvoiceStatus,
      this.inputDiscount, this.inputPaid, this.inputBankDetails, this.inputTerms
    ];

    inputs.forEach(el => {
      el.addEventListener('input', () => {
        this.syncDataFromForm();
        this.renderPreview();
      });
      el.addEventListener('change', () => {
        this.syncDataFromForm();
        this.renderPreview();
      });
    });

    // Add item button
    this.btnAddLine.addEventListener('click', () => {
      const newItem = {
        id: 'item-' + Date.now(),
        category: 'Flights',
        desc: 'New Flight or Hotel Itinerary',
        qty: 1,
        price: 500,
        tax: 0
      };
      this.data.items.push(newItem);
      this.saveState();
      this.renderEditorItems();
      this.renderPreview();
    });

    // Action buttons
    this.btnPrint.addEventListener('click', () => {
      window.print();
    });

    this.btnCopySummary.addEventListener('click', () => {
      this.copyTextSummary();
    });

    this.btnReset.addEventListener('click', () => {
      if (confirm('Reset invoice to default sample?')) {
        this.loadPreset('dubai');
      }
    });

    this.btnPresetDubai.addEventListener('click', () => this.loadPreset('dubai'));
    this.btnPresetEurope.addEventListener('click', () => this.loadPreset('europe'));
    this.btnPresetBali.addEventListener('click', () => this.loadPreset('bali'));
  }

  renderEditorItems() {
    this.lineItemsContainer.innerHTML = '';
    const currency = this.data.currency || 'USD';
    const sym = CURRENCY_SYMBOLS[currency] || '$';

    this.data.items.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'line-item-row';
      row.innerHTML = `
        <div class="line-item-header">
          <span style="font-weight: 700; font-size: 0.8rem; color: var(--accent);">Item #${index + 1}</span>
          <button type="button" class="btn-remove-item" data-id="${item.id}" title="Remove Item">&times;</button>
        </div>
        <div class="form-grid-2" style="margin-bottom: 0.5rem;">
          <div class="form-group">
            <label style="font-size: 0.75rem;">Category</label>
            <select class="form-select item-cat-input" data-id="${item.id}" style="padding: 0.4rem 0.6rem; font-size: 0.85rem;">
              ${CATEGORY_OPTIONS.map(cat => `<option value="${cat}" ${cat === item.category ? 'selected' : ''}>${cat}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label style="font-size: 0.75rem;">Qty / Days</label>
            <input type="number" class="form-input item-qty-input" data-id="${item.id}" value="${item.qty}" min="1" step="1" style="padding: 0.4rem 0.6rem; font-size: 0.85rem;">
          </div>
        </div>
        <div class="form-group" style="margin-bottom: 0.5rem;">
          <label style="font-size: 0.75rem;">Description / Itinerary Detail</label>
          <input type="text" class="form-input item-desc-input" data-id="${item.id}" value="${escapeAttr(item.desc)}" placeholder="Item description" style="padding: 0.4rem 0.6rem; font-size: 0.85rem;">
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label style="font-size: 0.75rem;">Unit Rate (${sym})</label>
            <input type="number" class="form-input item-price-input" data-id="${item.id}" value="${item.price}" min="0" step="1" style="padding: 0.4rem 0.6rem; font-size: 0.85rem;">
          </div>
          <div class="form-group">
            <label style="font-size: 0.75rem;">Tax / VAT (%)</label>
            <select class="form-select item-tax-input" data-id="${item.id}" style="padding: 0.4rem 0.6rem; font-size: 0.85rem;">
              <option value="0" ${item.tax === 0 ? 'selected' : ''}>0% (Tax Exempt)</option>
              <option value="5" ${item.tax === 5 ? 'selected' : ''}>5% VAT</option>
              <option value="10" ${item.tax === 10 ? 'selected' : ''}>10% VAT / GST</option>
              <option value="15" ${item.tax === 15 ? 'selected' : ''}>15% Tax</option>
              <option value="20" ${item.tax === 20 ? 'selected' : ''}>20% Standard VAT</option>
            </select>
          </div>
        </div>
      `;
      this.lineItemsContainer.appendChild(row);
    });

    // Attach item events
    this.lineItemsContainer.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.data.items = this.data.items.filter(it => it.id !== id);
        this.saveState();
        this.renderEditorItems();
        this.renderPreview();
      });
    });

    this.lineItemsContainer.querySelectorAll('.item-cat-input').forEach(sel => {
      sel.addEventListener('change', () => {
        const it = this.data.items.find(x => x.id === sel.getAttribute('data-id'));
        if (it) {
          it.category = sel.value;
          this.saveState();
          this.renderPreview();
        }
      });
    });

    this.lineItemsContainer.querySelectorAll('.item-desc-input').forEach(inp => {
      inp.addEventListener('input', () => {
        const it = this.data.items.find(x => x.id === inp.getAttribute('data-id'));
        if (it) {
          it.desc = inp.value;
          this.saveState();
          this.renderPreview();
        }
      });
    });

    this.lineItemsContainer.querySelectorAll('.item-qty-input').forEach(inp => {
      inp.addEventListener('input', () => {
        const it = this.data.items.find(x => x.id === inp.getAttribute('data-id'));
        if (it) {
          it.qty = parseFloat(inp.value) || 1;
          this.saveState();
          this.renderPreview();
        }
      });
    });

    this.lineItemsContainer.querySelectorAll('.item-price-input').forEach(inp => {
      inp.addEventListener('input', () => {
        const it = this.data.items.find(x => x.id === inp.getAttribute('data-id'));
        if (it) {
          it.price = parseFloat(inp.value) || 0;
          this.saveState();
          this.renderPreview();
        }
      });
    });

    this.lineItemsContainer.querySelectorAll('.item-tax-input').forEach(sel => {
      sel.addEventListener('change', () => {
        const it = this.data.items.find(x => x.id === sel.getAttribute('data-id'));
        if (it) {
          it.tax = parseFloat(sel.value) || 0;
          this.saveState();
          this.renderPreview();
        }
      });
    });
  }

  formatMoney(num) {
    const cur = this.data.currency || 'USD';
    const sym = CURRENCY_SYMBOLS[cur] || '$';
    return `${sym}${Number(num || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
    } catch {
      return dateStr;
    }
  }

  renderPreview() {
    if (!this.data) return;

    // Agency
    this.viewAgencyName.textContent = this.data.agencyName || 'Travel Agency';
    this.viewAgencyTagline.textContent = this.data.agencyTagline || '';
    this.viewAgencyAddress.textContent = this.data.agencyAddress || '';
    this.viewAgencyContact.textContent = `${this.data.agencyEmail || ''} ${this.data.agencyPhone ? '• ' + this.data.agencyPhone : ''}`;

    // Invoice Meta
    this.viewInvoiceNumber.textContent = this.data.invoiceNumber || 'INV-0001';
    this.viewInvoiceStatus.textContent = this.data.status || 'Pending';
    this.viewInvoiceStatus.className = 'invoice-status-pill';
    const statusMap = {
      'Pending': 'inv-status-pending',
      'Paid': 'inv-status-paid',
      'Deposit': 'inv-status-deposit',
      'Overdue': 'inv-status-overdue'
    };
    this.viewInvoiceStatus.classList.add(statusMap[this.data.status] || 'inv-status-pending');

    // Client
    this.viewClientName.textContent = this.data.clientName || 'Valued Client';
    this.viewClientRef.textContent = this.data.clientPassport || '';
    this.viewClientAddress.textContent = this.data.clientAddress || '';
    this.viewClientContact.textContent = `${this.data.clientEmail || ''} ${this.data.clientPhone ? '• ' + this.data.clientPhone : ''}`;

    // Dates & Currency
    this.viewIssueDate.textContent = this.formatDate(this.data.issueDate);
    this.viewDueDate.textContent = this.formatDate(this.data.dueDate);
    this.viewCurrency.textContent = `${this.data.currency} (${CURRENCY_SYMBOLS[this.data.currency] || '$'})`;

    // Render Items & calculate finances
    let subtotal = 0;
    let totalTax = 0;

    if (!this.data.items || this.data.items.length === 0) {
      this.viewItemsTbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--muted); padding: 1.5rem;">No items listed on this invoice.</td></tr>';
    } else {
      this.viewItemsTbody.innerHTML = this.data.items.map(it => {
        const linePrice = (it.qty || 1) * (it.price || 0);
        const lineTax = linePrice * ((it.tax || 0) / 100);
        subtotal += linePrice;
        totalTax += lineTax;

        return `
          <tr>
            <td>
              <div style="font-weight: 600; color: var(--text);">${escapeHtml(it.desc)}</div>
              <span class="item-cat-tag">${escapeHtml(it.category || 'Travel')}</span>
            </td>
            <td style="text-align: center;">${it.qty || 1}</td>
            <td style="text-align: right;">${this.formatMoney(it.price || 0)}</td>
            <td style="text-align: right; color: var(--muted); font-size: 0.8rem;">${it.tax ? it.tax + '%' : '0%'}</td>
            <td style="text-align: right; font-weight: 600; color: var(--text);">${this.formatMoney(linePrice)}</td>
          </tr>
        `;
      }).join('');
    }

    const discount = Math.max(0, parseFloat(this.data.discount) || 0);
    const grandTotal = Math.max(0, subtotal - discount + totalTax);
    const paid = Math.max(0, parseFloat(this.data.paid) || 0);
    const balanceDue = Math.max(0, grandTotal - paid);

    this.viewSubtotal.textContent = this.formatMoney(subtotal);

    if (discount > 0) {
      this.viewDiscountRow.style.display = 'table-row';
      this.viewDiscount.textContent = `-${this.formatMoney(discount)}`;
    } else {
      this.viewDiscountRow.style.display = 'none';
    }

    this.viewTaxTotal.textContent = this.formatMoney(totalTax);
    this.viewGrandTotal.textContent = this.formatMoney(grandTotal);

    if (paid > 0) {
      this.viewPaidRow.style.display = 'table-row';
      this.viewPaidAmount.textContent = this.formatMoney(paid);
    } else {
      this.viewPaidRow.style.display = 'none';
    }

    this.viewBalanceDue.textContent = this.formatMoney(balanceDue);

    // Notes
    this.viewBankDetails.textContent = this.data.bankDetails || 'Available upon request.';
    this.viewTerms.textContent = this.data.terms || 'Standard travel agency terms apply.';
  }

  render() {
    this.renderEditorItems();
    this.renderPreview();
  }

  copyTextSummary() {
    const cur = this.data.currency || 'USD';
    const sym = CURRENCY_SYMBOLS[cur] || '$';

    let subtotal = 0;
    let totalTax = 0;
    this.data.items.forEach(it => {
      const linePrice = (it.qty || 1) * (it.price || 0);
      subtotal += linePrice;
      totalTax += linePrice * ((it.tax || 0) / 100);
    });
    const discount = parseFloat(this.data.discount) || 0;
    const grandTotal = Math.max(0, subtotal - discount + totalTax);
    const paid = parseFloat(this.data.paid) || 0;
    const balance = Math.max(0, grandTotal - paid);

    const summaryText = `
══════════════════════════════════════════════════
TRAVEL BOOKING STATEMENT - ${this.data.invoiceNumber}
Agency: ${this.data.agencyName} (${this.data.agencyPhone})
Billed To: ${this.data.clientName} [${this.data.clientPassport}]
Status: ${this.data.status} | Due: ${this.data.dueDate}
══════════════════════════════════════════════════
ITINERARY ITEMS:
${this.data.items.map((it, idx) => `${idx + 1}. [${it.category}] ${it.desc}
   Qty: ${it.qty} × ${sym}${it.price} = ${sym}${(it.qty * it.price).toFixed(2)}`).join('\n')}

Subtotal: ${sym}${subtotal.toFixed(2)}
Discount: -${sym}${discount.toFixed(2)}
Taxes & Surcharges: ${sym}${totalTax.toFixed(2)}
TOTAL AMOUNT: ${sym}${grandTotal.toFixed(2)}
Amount Paid: ${sym}${paid.toFixed(2)}
BALANCE DUE: ${sym}${balance.toFixed(2)}
══════════════════════════════════════════════════
Remittance: ${this.data.bankDetails}
══════════════════════════════════════════════════
`.trim();

    navigator.clipboard.writeText(summaryText).then(() => {
      const originalText = this.btnCopySummary.innerHTML;
      this.btnCopySummary.innerHTML = `✓ Copied Summary!`;
      setTimeout(() => {
        this.btnCopySummary.innerHTML = originalText;
      }, 2500);
    }).catch(err => {
      alert('Copied summary to clipboard failed: ' + err);
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(str) {
  if (!str) return '';
  return String(str)
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
  new TravelInvoiceApp();
});