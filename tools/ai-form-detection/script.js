// AI Form Detection & Schema Extractor - Client-side Logic

if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = '../../assets/lib/pdf.worker.min.js';
}

let activePdfDoc = null;
let rawPdfBuffer = null;
let currentPageNum = 1;
let totalPages = 1;
let detectedFields = [];
let selectedFieldId = null;
let canvasScale = 1.5;

const FILTER_STATE = {
  text: true,
  checkbox: true,
  radio: true,
  signature: true,
  table: true
};

// Form Field Detection Heuristics
function detectFormFieldsOnPage(pageTextItems, annotations = [], viewport, pageNum) {
  const fields = [];
  let fieldCounter = 1;

  // 1. First check native PDF AcroForm annotations if present
  if (annotations && annotations.length > 0) {
    annotations.forEach(annot => {
      const rect = viewport.convertToViewportRectangle(annot.rect);
      const x = Math.min(rect[0], rect[2]);
      const y = Math.min(rect[1], rect[3]);
      const width = Math.abs(rect[2] - rect[0]);
      const height = Math.abs(rect[3] - rect[1]);

      let type = 'text';
      if (annot.subtype === 'Widget') {
        if (annot.fieldType === 'Tx') type = 'text';
        else if (annot.fieldType === 'Btn') {
          type = (annot.fieldFlags & 32768) ? 'radio' : 'checkbox';
        } else if (annot.fieldType === 'Sig') type = 'signature';
      }

      fields.push({
        id: `field_acro_${fieldCounter++}`,
        label: annot.fieldName || annot.alternativeText || `Form Input ${fieldCounter}`,
        type: type,
        page: pageNum,
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(width),
        height: Math.round(height),
        required: annot.required || false
      });
    });
  }

  // 2. Optical & Linguistic Pattern Analysis on Text Content
  const sortedItems = [...pageTextItems].sort((a, b) => {
    // Sort top to bottom, left to right
    if (Math.abs(a.y - b.y) > 10) return a.y - b.y;
    return a.x - b.x;
  });

  for (let i = 0; i < sortedItems.length; i++) {
    const item = sortedItems[i];
    const str = item.text.trim();
    if (!str) continue;

    // Checkbox heuristic: [ ], [x], ☐, ☑, ☒
    if (/^(\[[\s_xX]?\]|[☐☑☒])$/.test(str)) {
      // Find label to the right
      let label = 'Option Choice';
      if (i + 1 < sortedItems.length && Math.abs(sortedItems[i + 1].y - item.y) < 12) {
        label = sortedItems[i + 1].text.trim();
      }
      fields.push({
        id: `chk_${fieldCounter++}`,
        label: label || 'Checkbox Option',
        type: 'checkbox',
        page: pageNum,
        x: Math.round(item.x),
        y: Math.round(item.y),
        width: Math.max(18, Math.round(item.width)),
        height: Math.max(18, Math.round(item.height)),
        required: false
      });
      continue;
    }

    // Radio button heuristic: ( ), (*), ○, ◉, ⦿
    if (/^(\([\s*]?\)|[○◉⦿])$/.test(str)) {
      let label = 'Radio Option';
      if (i + 1 < sortedItems.length && Math.abs(sortedItems[i + 1].y - item.y) < 12) {
        label = sortedItems[i + 1].text.trim();
      }
      fields.push({
        id: `rad_${fieldCounter++}`,
        label: label || 'Radio Choice',
        type: 'radio',
        page: pageNum,
        x: Math.round(item.x),
        y: Math.round(item.y),
        width: Math.max(18, Math.round(item.width)),
        height: Math.max(18, Math.round(item.height)),
        required: false
      });
      continue;
    }

    // Underline pattern: ____________
    if (/^_{3,}$/.test(str)) {
      // Find label to the left
      let label = 'Text Input Field';
      if (i > 0 && Math.abs(sortedItems[i - 1].y - item.y) < 12) {
        label = sortedItems[i - 1].text.replace(/[:_]/g, '').trim();
      }
      fields.push({
        id: `txt_${fieldCounter++}`,
        label: label || 'Text Line Field',
        type: 'text',
        page: pageNum,
        x: Math.round(item.x),
        y: Math.round(item.y - 12),
        width: Math.round(item.width),
        height: 22,
        required: true
      });
      continue;
    }

    // Signature box / Signature line
    if (/(?:sign here|authorized signature|applicant signature|signature of|sign below)/i.test(str)) {
      fields.push({
        id: `sig_${fieldCounter++}`,
        label: str.replace(/[:_]/g, '').trim() || 'Authorized Signature',
        type: 'signature',
        page: pageNum,
        x: Math.round(item.x),
        y: Math.round(item.y + item.height + 4),
        width: 240,
        height: 50,
        required: true
      });
      continue;
    }

    // Standard Label prompt detection: "First Name:", "Address:", etc.
    const promptMatch = str.match(/^(Full Legal Name|First Name|Last Name|Email Address|Phone Number|Date of Birth|Mailing Address|City|State|Zip Code|Country|Company Name|Job Title|Tax ID|SSN|Date):?$/i);
    if (promptMatch) {
      const label = promptMatch[1];
      // Check if there is already an underline or bracket next to it
      const nextItem = sortedItems[i + 1];
      const hasAdjacentInput = nextItem && Math.abs(nextItem.y - item.y) < 12 && (/^_{3,}$/.test(nextItem.text.trim()) || /^\[\s*\]$/.test(nextItem.text.trim()));

      if (!hasAdjacentInput) {
        // Synthesize bounding box adjacent to prompt
        fields.push({
          id: `inp_${fieldCounter++}`,
          label: label,
          type: /date/i.test(label) ? 'text' : 'text',
          page: pageNum,
          x: Math.round(item.x + item.width + 12),
          y: Math.round(item.y - 4),
          width: Math.min(320, Math.max(180, viewport.width - (item.x + item.width + 40))),
          height: 22,
          required: true
        });
      }
    }

    // Table detection: "EMPLOYMENT HISTORY", "EDUCATION RECORDS", etc.
    if (/(?:employment history|work experience|table of|itemized breakdown)/i.test(str) && item.height > 14) {
      fields.push({
        id: `tbl_${fieldCounter++}`,
        label: str.trim(),
        type: 'table',
        page: pageNum,
        x: Math.round(item.x),
        y: Math.round(item.y + item.height + 10),
        width: Math.round(viewport.width - item.x * 2),
        height: 140,
        required: false
      });
    }
  }

  return fields;
}

// Render Overlays onto Overlay Canvas
function renderOverlay() {
  const overlayCanvas = document.getElementById('form-overlay-canvas');
  const pdfCanvas = document.getElementById('form-pdf-canvas');
  if (!overlayCanvas || !pdfCanvas) return;

  overlayCanvas.width = pdfCanvas.width;
  overlayCanvas.height = pdfCanvas.height;

  const ctx = overlayCanvas.getContext('2d');
  ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

  const pageFields = detectedFields.filter(f => f.page === currentPageNum && FILTER_STATE[f.type] !== false);

  pageFields.forEach(f => {
    const isSelected = f.id === selectedFieldId;

    let strokeColor = '#3b82f6'; // Text: Blue
    let fillColor = 'rgba(59, 130, 246, 0.12)';
    let tagText = 'TXT';

    if (f.type === 'checkbox') {
      strokeColor = '#10b981'; // Green
      fillColor = 'rgba(16, 185, 129, 0.15)';
      tagText = 'CHK';
    } else if (f.type === 'radio') {
      strokeColor = '#a855f7'; // Purple
      fillColor = 'rgba(168, 85, 247, 0.15)';
      tagText = 'RAD';
    } else if (f.type === 'signature') {
      strokeColor = '#f59e0b'; // Amber
      fillColor = 'rgba(245, 158, 11, 0.15)';
      tagText = 'SIG';
    } else if (f.type === 'table') {
      strokeColor = '#06b6d4'; // Cyan
      fillColor = 'rgba(6, 182, 212, 0.12)';
      tagText = 'TBL';
    }

    if (isSelected) {
      strokeColor = '#ffffff';
      fillColor = 'rgba(255, 255, 255, 0.25)';
    }

    ctx.save();
    // Bounding Box
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    ctx.fillStyle = fillColor;

    if (f.type === 'radio') {
      const radius = Math.min(f.width, f.height) / 2;
      ctx.beginPath();
      ctx.arc(f.x + radius, f.y + radius, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.strokeRect(f.x, f.y, f.width, f.height);
      ctx.fillRect(f.x, f.y, f.width, f.height);
    }

    // Badge Tag
    ctx.fillStyle = strokeColor;
    ctx.fillRect(f.x, Math.max(0, f.y - 14), Math.min(f.width, 36), 14);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(tagText, f.x + 3, Math.max(10, f.y - 3));

    ctx.restore();
  });
}

// Render Sidebar Fields List & Counters
function updateSidebarUI() {
  const listEl = document.getElementById('fields-list');
  listEl.innerHTML = '';

  let countText = 0;
  let countCheck = 0;
  let countRadio = 0;
  let countSign = 0;
  let countTable = 0;

  detectedFields.forEach(f => {
    if (f.type === 'text') countText++;
    else if (f.type === 'checkbox') countCheck++;
    else if (f.type === 'radio') countRadio++;
    else if (f.type === 'signature') countSign++;
    else if (f.type === 'table') countTable++;
  });

  document.getElementById('count-text').textContent = countText;
  document.getElementById('count-check').textContent = countCheck;
  document.getElementById('count-radio').textContent = countRadio;
  document.getElementById('count-sign').textContent = countSign;
  document.getElementById('count-table').textContent = countTable;

  document.getElementById('stat-text-count').textContent = countText;
  document.getElementById('stat-check-count').textContent = countCheck;
  document.getElementById('stat-sign-count').textContent = countSign;
  document.getElementById('stat-total-count').textContent = detectedFields.length;
  document.getElementById('total-badge').textContent = `${detectedFields.length} Elements`;

  // Render cards for current page or all
  const filtered = detectedFields.filter(f => FILTER_STATE[f.type] !== false);

  if (filtered.length === 0) {
    listEl.innerHTML = `
      <div style="text-align: center; padding: 2rem 1rem; color: var(--muted); font-size: 0.85rem;">
        No form fields match active filters.
      </div>
    `;
    return;
  }

  filtered.forEach(f => {
    const card = document.createElement('div');
    card.className = `field-card ${f.id === selectedFieldId ? 'selected' : ''}`;
    card.setAttribute('data-id', f.id);

    let tagClass = 'tag-text';
    if (f.type === 'checkbox') tagClass = 'tag-check';
    else if (f.type === 'radio') tagClass = 'tag-radio';
    else if (f.type === 'signature') tagClass = 'tag-sign';
    else if (f.type === 'table') tagClass = 'tag-table';

    card.innerHTML = `
      <div class="field-card-top">
        <div class="field-label-text" title="${f.label}">${f.label}</div>
        <span class="field-tag-type ${tagClass}">${f.type}</span>
      </div>
      <div class="field-meta-row">
        <span>Page ${f.page} &bull; ${f.width}\u00D7${f.height}px</span>
        <button class="btn-delete-field" style="background:transparent; border:none; color:var(--muted); cursor:pointer; font-size:0.8rem;" title="Delete field">&times;</button>
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-delete-field')) {
        detectedFields = detectedFields.filter(item => item.id !== f.id);
        if (selectedFieldId === f.id) selectedFieldId = null;
        updateSidebarUI();
        renderOverlay();
        return;
      }

      selectedFieldId = f.id;
      if (f.page !== currentPageNum) {
        renderPdfPage(f.page);
      } else {
        renderOverlay();
        updateSelectedCardStyles();
      }
    });

    listEl.appendChild(card);
  });
}

function updateSelectedCardStyles() {
  document.querySelectorAll('.field-card').forEach(card => {
    const id = card.getAttribute('data-id');
    if (id === selectedFieldId) {
      card.classList.add('selected');
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      card.classList.remove('selected');
    }
  });
}

// Render PDF Page to Canvas with PDF.js
async function renderPdfPage(pageNum) {
  if (!activePdfDoc) return;
  currentPageNum = pageNum;
  document.getElementById('page-num-display').textContent = pageNum;
  document.getElementById('canvas-page-info').textContent = `Page ${pageNum} of ${totalPages}`;

  const page = await activePdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale: canvasScale });

  const pdfCanvas = document.getElementById('form-pdf-canvas');
  pdfCanvas.width = viewport.width;
  pdfCanvas.height = viewport.height;
  const ctx = pdfCanvas.getContext('2d');

  await page.render({ canvasContext: ctx, viewport }).promise;

  // Extract text and annotations for detection if not already analyzed
  const pageFieldsExist = detectedFields.some(f => f.page === pageNum);
  if (!pageFieldsExist) {
    const textContent = await page.getTextContent();
    const annotations = await page.getAnnotations();

    const items = [];
    textContent.items.forEach(item => {
      const tx = item.transform;
      const x = tx[4] * canvasScale;
      const y = (viewport.height - tx[5] * canvasScale) - (item.height * canvasScale);
      const w = item.width * canvasScale;
      const h = (item.height || 12) * canvasScale;

      if (item.str && item.str.trim().length > 0) {
        items.push({
          x: Math.round(x),
          y: Math.round(y),
          width: Math.round(w),
          height: Math.round(h),
          text: item.str
        });
      }
    });

    const newFields = detectFormFieldsOnPage(items, annotations, viewport, pageNum);
    detectedFields.push(...newFields);
  }

  updateSidebarUI();
  renderOverlay();
}

// Handle Canvas Click to Select Field
function handleCanvasClick(e) {
  const overlayCanvas = document.getElementById('form-overlay-canvas');
  const rect = overlayCanvas.getBoundingClientRect();
  const scaleX = overlayCanvas.width / rect.width;
  const scaleY = overlayCanvas.height / rect.height;

  const clickX = (e.clientX - rect.left) * scaleX;
  const clickY = (e.clientY - rect.top) * scaleY;

  // Check if click hits any bounding box on current page
  const pageFields = detectedFields.filter(f => f.page === currentPageNum && FILTER_STATE[f.type] !== false);
  const clicked = pageFields.find(f =>
    clickX >= f.x && clickX <= f.x + f.width &&
    clickY >= f.y && clickY <= f.y + f.height
  );

  if (clicked) {
    selectedFieldId = clicked.id;
  } else {
    selectedFieldId = null;
  }

  renderOverlay();
  updateSelectedCardStyles();
}

// Generate Realistic Sample Application Form
async function generateSampleFormDocument() {
  document.getElementById('page-nav-controls').style.display = 'none';
  totalPages = 1;
  currentPageNum = 1;
  selectedFieldId = null;
  detectedFields = [];

  const pdfCanvas = document.getElementById('form-pdf-canvas');
  pdfCanvas.width = 1100;
  pdfCanvas.height = 1500;
  const ctx = pdfCanvas.getContext('2d');

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 1100, 1500);

  // Border & Header Banner
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(60, 50, 980, 70);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('GLOBAL AI FELLOWSHIP & NDA APPLICATION FORM', 90, 94);

  ctx.font = '12px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('CONFIDENTIAL &bull; FORM VER-2026.04', 800, 94);

  // Section 1: Candidate Personal Information
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('SECTION 1: APPLICANT IDENTIFICATION', 60, 160);

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 170);
  ctx.lineTo(1040, 170);
  ctx.stroke();

  // Field Prompts & Underlines
  const drawInputField = (label, x, y, width) => {
    ctx.fillStyle = '#374151';
    ctx.font = '13px sans-serif';
    ctx.fillText(label, x, y);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y + 24);
    ctx.lineTo(x + width, y + 24);
    ctx.stroke();
  };

  drawInputField('Full Legal Name:', 60, 210, 440);
  drawInputField('Email Address:', 540, 210, 500);

  drawInputField('Phone Number:', 60, 280, 440);
  drawInputField('Date of Birth (MM/DD/YYYY):', 540, 280, 500);

  drawInputField('Mailing Address:', 60, 350, 980);

  // Section 2: Work Eligibility Checkboxes
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('SECTION 2: WORK ELIGIBILITY & DESIRED ROLE', 60, 430);

  ctx.beginPath();
  ctx.moveTo(60, 440);
  ctx.lineTo(1040, 440);
  ctx.stroke();

  const drawCheckbox = (label, x, y) => {
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y - 14, 18, 18);
    ctx.fillStyle = '#374151';
    ctx.font = '13px sans-serif';
    ctx.fillText(label, x + 28, y);
  };

  drawCheckbox('Full-Time Staff Fellow', 60, 480);
  drawCheckbox('Part-Time Contractor', 320, 480);
  drawCheckbox('Remote (Worldwide)', 580, 480);
  drawCheckbox('On-Site (San Francisco)', 840, 480);

  // Radio choices
  const drawRadioButton = (label, x, y) => {
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x + 9, y - 5, 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#374151';
    ctx.font = '13px sans-serif';
    ctx.fillText(label, x + 28, y);
  };

  ctx.fillStyle = '#475569';
  ctx.font = 'italic 12px sans-serif';
  ctx.fillText('Citizenship / Immigration Status:', 60, 530);

  drawRadioButton('United States Citizen', 60, 560);
  drawRadioButton('Permanent Resident (Green Card)', 320, 560);
  drawRadioButton('H1-B / O-1 Work Visa Holder', 640, 560);

  // Section 3: Technical Experience Grid (Table)
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('SECTION 3: PRIOR EMPLOYMENT HISTORY', 60, 630);

  ctx.beginPath();
  ctx.moveTo(60, 640);
  ctx.lineTo(1040, 640);
  ctx.stroke();

  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(60, 660, 980, 36);
  ctx.strokeStyle = '#94a3b8';
  ctx.strokeRect(60, 660, 980, 160);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('Organization / Employer', 80, 684);
  ctx.fillText('Role / Position', 380, 684);
  ctx.fillText('Years Active', 680, 684);
  ctx.fillText('Reference Contact', 850, 684);

  // Table rows
  for (let r = 1; r <= 3; r++) {
    ctx.beginPath();
    ctx.moveTo(60, 660 + r * 40);
    ctx.lineTo(1040, 660 + r * 40);
    ctx.stroke();
  }

  // Section 4: Declaration & Signature
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('SECTION 4: ACKNOWLEDGMENT & SIGNATURE', 60, 880);

  ctx.beginPath();
  ctx.moveTo(60, 890);
  ctx.lineTo(1040, 890);
  ctx.stroke();

  drawCheckbox('I certify that all statements made in this application are true, complete, and accurate.', 60, 930);

  // Signature box
  ctx.strokeStyle = '#64748b';
  ctx.strokeRect(60, 980, 480, 80);
  ctx.fillStyle = '#64748b';
  ctx.font = 'italic 12px sans-serif';
  ctx.fillText('Authorized Signature of Applicant (Sign Inside Box)', 70, 1000);

  drawInputField('Date (MM/DD/YYYY):', 600, 1020, 440);

  // Synthesize sample detected form fields
  detectedFields = [
    { id: 'fld_name', label: 'Full Legal Name', type: 'text', page: 1, x: 60, y: 195, width: 440, height: 35, required: true },
    { id: 'fld_email', label: 'Email Address', type: 'text', page: 1, x: 540, y: 195, width: 500, height: 35, required: true },
    { id: 'fld_phone', label: 'Phone Number', type: 'text', page: 1, x: 60, y: 265, width: 440, height: 35, required: true },
    { id: 'fld_dob', label: 'Date of Birth', type: 'text', page: 1, x: 540, y: 265, width: 500, height: 35, required: true },
    { id: 'fld_address', label: 'Mailing Address', type: 'text', page: 1, x: 60, y: 335, width: 980, height: 35, required: true },

    { id: 'chk_fulltime', label: 'Full-Time Staff Fellow', type: 'checkbox', page: 1, x: 60, y: 466, width: 18, height: 18, required: false },
    { id: 'chk_contract', label: 'Part-Time Contractor', type: 'checkbox', page: 1, x: 320, y: 466, width: 18, height: 18, required: false },
    { id: 'chk_remote', label: 'Remote (Worldwide)', type: 'checkbox', page: 1, x: 580, y: 466, width: 18, height: 18, required: false },
    { id: 'chk_onsite', label: 'On-Site (San Francisco)', type: 'checkbox', page: 1, x: 840, y: 466, width: 18, height: 18, required: false },

    { id: 'rad_us_cit', label: 'United States Citizen', type: 'radio', page: 1, x: 60, y: 546, width: 18, height: 18, required: false },
    { id: 'rad_perm_res', label: 'Permanent Resident', type: 'radio', page: 1, x: 320, y: 546, width: 18, height: 18, required: false },
    { id: 'rad_work_visa', label: 'Work Visa Holder', type: 'radio', page: 1, x: 640, y: 546, width: 18, height: 18, required: false },

    { id: 'tbl_employment', label: 'Prior Employment History', type: 'table', page: 1, x: 60, y: 660, width: 980, height: 160, required: false },

    { id: 'chk_certify', label: 'Certification Statement', type: 'checkbox', page: 1, x: 60, y: 916, width: 18, height: 18, required: true },
    { id: 'sig_applicant', label: 'Authorized Applicant Signature', type: 'signature', page: 1, x: 60, y: 980, width: 480, height: 80, required: true },
    { id: 'fld_sig_date', label: 'Signature Date', type: 'text', page: 1, x: 600, y: 1005, width: 440, height: 35, required: true }
  ];

  updateSidebarUI();
  renderOverlay();
}

// Export Schema as JSON
function exportJsonSchema() {
  const schema = {
    schemaVersion: '1.0',
    title: 'Detected PDF Form Schema',
    generatedAt: new Date().toISOString(),
    totalElements: detectedFields.length,
    fields: detectedFields.map(f => ({
      id: f.id,
      label: f.label,
      type: f.type,
      page: f.page,
      bounds: { x: f.x, y: f.y, width: f.width, height: f.height },
      required: f.required
    }))
  };

  const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'form_schema.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Export Schema as CSV
function exportCsvSchema() {
  const lines = ['Field ID,Label,Type,Page,X,Y,Width,Height,Required'];
  detectedFields.forEach(f => {
    const cleanLabel = `"${f.label.replace(/"/g, '""')}"`;
    lines.push(`${f.id},${cleanLabel},${f.type},${f.page},${f.x},${f.y},${f.width},${f.height},${f.required}`);
  });

  const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'form_schema.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// Export Fillable PDF via PDF-Lib
async function exportFillablePdf() {
  try {
    const PDFLib = window.PDFLib;
    if (!PDFLib) {
      alert('PDF-Lib is not loaded. Please verify library files.');
      return;
    }

    let pdfDoc;
    if (rawPdfBuffer) {
      pdfDoc = await PDFLib.PDFDocument.load(rawPdfBuffer);
    } else {
      // Create new document containing the sample form
      pdfDoc = await PDFLib.PDFDocument.create();
      const page = pdfDoc.addPage([1100, 1500]);

      // Embed canvas raster
      const pdfCanvas = document.getElementById('form-pdf-canvas');
      const pngUrl = pdfCanvas.toDataURL('image/png');
      const pngImage = await pdfDoc.embedPng(pngUrl);
      page.drawImage(pngImage, { x: 0, y: 0, width: 1100, height: 1500 });
    }

    const form = pdfDoc.getForm();
    const pages = pdfDoc.getPages();

    detectedFields.forEach(f => {
      const pageIdx = Math.max(0, Math.min(pages.length - 1, f.page - 1));
      const page = pages[pageIdx];
      const pageHeight = page.getHeight();

      // Convert coordinates: PDF space origin is bottom-left
      const pdfX = f.x;
      const pdfY = pageHeight - f.y - f.height;

      try {
        if (f.type === 'text' || f.type === 'signature') {
          const textField = form.createTextField(`${f.id}_input`);
          textField.addToPage(page, {
            x: pdfX,
            y: pdfY,
            width: f.width,
            height: f.height
          });
        } else if (f.type === 'checkbox') {
          const checkBox = form.createCheckBox(`${f.id}_chk`);
          checkBox.addToPage(page, {
            x: pdfX,
            y: pdfY,
            width: f.width,
            height: f.height
          });
        }
      } catch (err) {
        console.warn(`Could not stamp field ${f.id}:`, err);
      }
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interactive_fillable_form.pdf';
    a.click();
    URL.revokeObjectURL(url);

  } catch (err) {
    console.error('Fillable PDF export error:', err);
    alert('Error generating fillable PDF: ' + err.message);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const btnBrowse = document.getElementById('btn-browse');
  const btnSample = document.getElementById('btn-sample-form');
  const canvasStack = document.getElementById('canvas-stack');
  const overlayCanvas = document.getElementById('form-overlay-canvas');
  const zoomSlider = document.getElementById('zoom-slider');
  const zoomVal = document.getElementById('zoom-val');
  const btnPrev = document.getElementById('btn-prev-page');
  const btnNext = document.getElementById('btn-next-page');

  const btnExportJson = document.getElementById('btn-export-json');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnExportPdf = document.getElementById('btn-export-fillable-pdf');

  // Zoom
  const applyZoom = (val) => {
    zoomVal.textContent = `${val}%`;
    canvasStack.style.transform = `scale(${val / 100})`;
  };
  applyZoom(zoomSlider.value);
  zoomSlider.addEventListener('input', (e) => applyZoom(e.target.value));

  // Canvas interaction
  overlayCanvas.addEventListener('click', handleCanvasClick);

  // Filter toggles
  ['text', 'checkbox', 'radio', 'signature', 'table'].forEach(type => {
    const el = document.getElementById(`filter-${type}`);
    if (el) {
      el.addEventListener('change', (e) => {
        FILTER_STATE[type] = e.target.checked;
        updateSidebarUI();
        renderOverlay();
      });
    }
  });

  // Browse file
  btnBrowse.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });

  // Drag & drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  function handleFile(file) {
    if (file.type !== 'application/pdf') {
      alert('Please upload a valid PDF document.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      rawPdfBuffer = e.target.result;
      const loadingTask = window.pdfjsLib.getDocument({ data: rawPdfBuffer });
      activePdfDoc = await loadingTask.promise;
      totalPages = activePdfDoc.numPages;
      currentPageNum = 1;
      detectedFields = [];
      selectedFieldId = null;

      const pageNav = document.getElementById('page-nav-controls');
      if (totalPages > 1) {
        pageNav.style.display = 'flex';
      } else {
        pageNav.style.display = 'none';
      }

      await renderPdfPage(1);
    };
    reader.readAsArrayBuffer(file);
  }

  // Sample form button
  btnSample.addEventListener('click', generateSampleFormDocument);

  // Pagination
  btnPrev.addEventListener('click', () => {
    if (currentPageNum > 1) renderPdfPage(currentPageNum - 1);
  });
  btnNext.addEventListener('click', () => {
    if (currentPageNum < totalPages) renderPdfPage(currentPageNum + 1);
  });

  // Exports
  btnExportJson.addEventListener('click', exportJsonSchema);
  btnExportCsv.addEventListener('click', exportCsvSchema);
  btnExportPdf.addEventListener('click', exportFillablePdf);

  // Initialize with sample form
  generateSampleFormDocument();
});