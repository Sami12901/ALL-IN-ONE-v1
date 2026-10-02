/* Crop PDF – Client-side visual PDF page margin cropper using pdf-lib & PDF.js */
if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = '../../assets/lib/pdf.worker.min.js';
}

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

let pdfBytes = null;
let pdfDoc = null;      // PDF.js doc for preview
let currentPage = 1;
let totalPages = 0;
let pageWidthPt = 0;
let pageHeightPt = 0;
let canvasScale = 1.5;
let croppedBlobUrl = null;

/* Unit conversion helpers */
const toPt = (val, unit) => {
  if (unit === 'mm') return val * 2.83465;
  if (unit === 'in') return val * 72;
  return val;
};
const fromPt = (val, unit) => {
  if (unit === 'mm') return +(val / 2.83465).toFixed(1);
  if (unit === 'in') return +(val / 72).toFixed(2);
  return +val.toFixed(1);
};

/* DOM refs */
const uploadZone = $('#upload-zone');
const workspace = $('#workspace');
const fileInput = $('#file-input');
const canvas = $('#pdf-canvas');
const ctx = canvas.getContext('2d');
const overlay = $('#crop-overlay');

const cropTop = $('#crop-top');
const cropRight = $('#crop-right');
const cropBottom = $('#crop-bottom');
const cropLeft = $('#crop-left');
const unitSelect = $('#unit-select');
const applyTo = $('#apply-to');
const rangeGroup = $('#range-group');
const pageRange = $('#page-range');

const btnBrowse = $('#btn-browse');
const btnPrev = $('#btn-prev');
const btnNext = $('#btn-next');
const btnCrop = $('#btn-crop');
const btnDownload = $('#btn-download');
const btnReset = $('#btn-reset');
const pageIndicator = $('#page-indicator');

/* KPI refs */
const kpiPages = $('#kpi-pages');
const kpiOrig = $('#kpi-orig');
const kpiCrop = $('#kpi-crop');
const kpiUnit = $('#kpi-unit');

/* Upload handlers */
btnBrowse.addEventListener('click', () => fileInput.click());
uploadZone.addEventListener('click', (e) => { if (e.target === uploadZone || e.target.closest('.upload-zone')) fileInput.click(); });
uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('dragover'); });
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('dragover');
  const f = e.dataTransfer.files[0];
  if (f && f.type === 'application/pdf') loadFile(f);
});
fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) loadFile(fileInput.files[0]);
});

async function loadFile(file) {
  pdfBytes = new Uint8Array(await file.arrayBuffer());
  pdfDoc = await window.pdfjsLib.getDocument({ data: pdfBytes.slice() }).promise;
  totalPages = pdfDoc.numPages;
  currentPage = 1;
  uploadZone.style.display = 'none';
  workspace.style.display = 'block';
  kpiPages.textContent = totalPages;
  await renderPage(currentPage);
  updateOverlay();
}

/* Render page preview */
async function renderPage(num) {
  const page = await pdfDoc.getPage(num);
  const vp = page.getViewport({ scale: canvasScale });
  canvas.width = vp.width;
  canvas.height = vp.height;
  pageWidthPt = vp.width / canvasScale;
  pageHeightPt = vp.height / canvasScale;
  await page.render({ canvasContext: ctx, viewport: vp }).promise;
  pageIndicator.textContent = `Page ${num} / ${totalPages}`;
  btnPrev.disabled = num <= 1;
  btnNext.disabled = num >= totalPages;
  const unit = unitSelect.value;
  kpiOrig.textContent = `${fromPt(pageWidthPt, unit)} × ${fromPt(pageHeightPt, unit)}`;
  kpiUnit.textContent = unit;
  updateOverlay();
}

/* Page navigation */
btnPrev.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderPage(currentPage); } });
btnNext.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; renderPage(currentPage); } });

/* Overlay visualization */
function updateOverlay() {
  const unit = unitSelect.value;
  const t = toPt(parseFloat(cropTop.value) || 0, unit);
  const r = toPt(parseFloat(cropRight.value) || 0, unit);
  const b = toPt(parseFloat(cropBottom.value) || 0, unit);
  const l = toPt(parseFloat(cropLeft.value) || 0, unit);

  const cw = canvas.width;
  const ch = canvas.height;
  const sx = cw / pageWidthPt;
  const sy = ch / pageHeightPt;

  overlay.style.top = (t * sy) + 'px';
  overlay.style.left = (l * sx) + 'px';
  overlay.style.width = Math.max(0, cw - (l + r) * sx) + 'px';
  overlay.style.height = Math.max(0, ch - (t + b) * sy) + 'px';

  const croppedW = Math.max(0, pageWidthPt - l - r);
  const croppedH = Math.max(0, pageHeightPt - t - b);
  kpiCrop.textContent = `${fromPt(croppedW, unit)} × ${fromPt(croppedH, unit)}`;
}

[cropTop, cropRight, cropBottom, cropLeft].forEach(el => el.addEventListener('input', updateOverlay));
unitSelect.addEventListener('change', () => {
  kpiUnit.textContent = unitSelect.value;
  updateOverlay();
  if (pageWidthPt > 0) {
    const unit = unitSelect.value;
    kpiOrig.textContent = `${fromPt(pageWidthPt, unit)} × ${fromPt(pageHeightPt, unit)}`;
  }
});

/* Apply-to range toggle */
applyTo.addEventListener('change', () => {
  rangeGroup.style.display = applyTo.value === 'range' ? 'flex' : 'none';
});

/* Presets */
$$('.preset-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    $$('.preset-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const p = chip.dataset.preset;
    const unit = unitSelect.value;
    let t = 0, r = 0, b = 0, l = 0;
    if (p === 'trim') { t = r = b = l = toPt(10, 'mm'); }
    else if (p === 'header') { t = toPt(25, 'mm'); }
    else if (p === 'footer') { b = toPt(25, 'mm'); }
    else if (p === 'half') { b = pageHeightPt / 2; }
    cropTop.value = fromPt(t, unit);
    cropRight.value = fromPt(r, unit);
    cropBottom.value = fromPt(b, unit);
    cropLeft.value = fromPt(l, unit);
    updateOverlay();
  });
});

/* Parse page range string */
function parsePageRange(rangeStr, total) {
  const pages = new Set();
  rangeStr.split(',').forEach(part => {
    part = part.trim();
    if (part.includes('-')) {
      const [s, e] = part.split('-').map(Number);
      for (let i = Math.max(1, s); i <= Math.min(total, e); i++) pages.add(i);
    } else {
      const n = parseInt(part);
      if (n >= 1 && n <= total) pages.add(n);
    }
  });
  return [...pages].sort((a, b) => a - b);
}

function getTargetPages() {
  const mode = applyTo.value;
  if (mode === 'all') return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (mode === 'current') return [currentPage];
  if (mode === 'odd') return Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p % 2 === 1);
  if (mode === 'even') return Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p % 2 === 0);
  if (mode === 'range') return parsePageRange(pageRange.value, totalPages);
  return [];
}

/* Crop action */
btnCrop.addEventListener('click', async () => {
  if (!pdfBytes) return;
  btnCrop.disabled = true;
  btnCrop.textContent = '⏳ Cropping...';

  try {
    const PDFLib = window.PDFLib;
    const libDoc = await PDFLib.PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const pages = libDoc.getPages();
    const unit = unitSelect.value;
    const t = toPt(parseFloat(cropTop.value) || 0, unit);
    const r = toPt(parseFloat(cropRight.value) || 0, unit);
    const b = toPt(parseFloat(cropBottom.value) || 0, unit);
    const l = toPt(parseFloat(cropLeft.value) || 0, unit);

    const targetPages = getTargetPages();

    for (const pn of targetPages) {
      const page = pages[pn - 1];
      if (!page) continue;
      const mb = page.getMediaBox();
      const newX = mb.x + l;
      const newY = mb.y + b;
      const newW = Math.max(1, mb.width - l - r);
      const newH = Math.max(1, mb.height - t - b);
      page.setCropBox(newX, newY, newW, newH);
      page.setMediaBox(newX, newY, newW, newH);
    }

    const outBytes = await libDoc.save();
    if (croppedBlobUrl) URL.revokeObjectURL(croppedBlobUrl);
    const blob = new Blob([outBytes], { type: 'application/pdf' });
    croppedBlobUrl = URL.createObjectURL(blob);

    btnDownload.style.display = 'block';
    btnCrop.textContent = '✅ Cropped!';
    setTimeout(() => { btnCrop.textContent = '✂️ Crop PDF'; btnCrop.disabled = false; }, 1500);

    /* Refresh preview with cropped doc */
    pdfBytes = new Uint8Array(outBytes);
    pdfDoc = await window.pdfjsLib.getDocument({ data: pdfBytes.slice() }).promise;
    await renderPage(currentPage);
  } catch (err) {
    console.error(err);
    btnCrop.textContent = '❌ Error';
    setTimeout(() => { btnCrop.textContent = '✂️ Crop PDF'; btnCrop.disabled = false; }, 2000);
  }
});

/* Download */
btnDownload.addEventListener('click', () => {
  if (!croppedBlobUrl) return;
  const a = document.createElement('a');
  a.href = croppedBlobUrl;
  a.download = 'cropped.pdf';
  a.click();
});

/* Reset */
btnReset.addEventListener('click', () => {
  pdfBytes = null;
  pdfDoc = null;
  croppedBlobUrl = null;
  workspace.style.display = 'none';
  uploadZone.style.display = 'block';
  btnDownload.style.display = 'none';
  fileInput.value = '';
  cropTop.value = 0;
  cropRight.value = 0;
  cropBottom.value = 0;
  cropLeft.value = 0;
});