/* Resize PDF – Client-side page dimension scaler using pdf-lib & PDF.js */
if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = '../../assets/lib/pdf.worker.min.js';
}

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

let pdfBytes = null;
let pdfDoc = null;
let currentPage = 1;
let totalPages = 0;
let canvasScale = 1.5;
let resizedBlobUrl = null;

/* Target size state */
let targetW = 595;
let targetH = 842;
let targetName = 'A4';
let orientation = 'portrait';

/* DOM */
const uploadZone = $('#upload-zone');
const workspace = $('#workspace');
const fileInput = $('#file-input');
const canvas = $('#pdf-canvas');
const ctx = canvas.getContext('2d');

const btnBrowse = $('#btn-browse');
const btnPrev = $('#btn-prev');
const btnNext = $('#btn-next');
const btnResize = $('#btn-resize');
const btnDownload = $('#btn-download');
const btnReset = $('#btn-reset');
const pageIndicator = $('#page-indicator');
const scaleMode = $('#scale-mode');
const progressBar = $('#progress-bar');
const progressFill = $('#progress-fill');

const kpiPages = $('#kpi-pages');
const kpiOrig = $('#kpi-orig');
const kpiTarget = $('#kpi-target');
const kpiScale = $('#kpi-scale');

/* Upload handlers */
btnBrowse.addEventListener('click', () => fileInput.click());
uploadZone.addEventListener('click', () => fileInput.click());
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
  btnDownload.style.display = 'none';
  await renderPage(currentPage);
  updateKPIs();
}

async function renderPage(num) {
  const page = await pdfDoc.getPage(num);
  const vp = page.getViewport({ scale: canvasScale });
  canvas.width = vp.width;
  canvas.height = vp.height;
  await page.render({ canvasContext: ctx, viewport: vp }).promise;
  pageIndicator.textContent = `Page ${num} / ${totalPages}`;
  btnPrev.disabled = num <= 1;
  btnNext.disabled = num >= totalPages;

  const origW = (vp.width / canvasScale).toFixed(0);
  const origH = (vp.height / canvasScale).toFixed(0);
  kpiOrig.textContent = `${origW} × ${origH} pt`;
}

function updateKPIs() {
  let w = targetW, h = targetH;
  if (orientation === 'landscape') { w = targetH; h = targetW; }
  kpiTarget.textContent = `${w} × ${h} pt`;
  kpiScale.textContent = targetName;
}

/* Page nav */
btnPrev.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderPage(currentPage); } });
btnNext.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; renderPage(currentPage); } });

/* Size selection */
$$('.size-card').forEach(card => {
  card.addEventListener('click', () => {
    $$('.size-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    targetW = parseInt(card.dataset.w);
    targetH = parseInt(card.dataset.h);
    targetName = card.dataset.name;
    updateKPIs();
  });
});

/* Orientation */
$$('.orient-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.orient-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    orientation = btn.dataset.orient;
    updateKPIs();
  });
});

/* Resize action */
btnResize.addEventListener('click', async () => {
  if (!pdfBytes) return;
  btnResize.disabled = true;
  btnResize.textContent = '⏳ Resizing...';
  progressBar.style.display = 'block';
  progressFill.style.width = '0%';

  try {
    const PDFLib = window.PDFLib;
    const srcDoc = await PDFLib.PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const newDoc = await PDFLib.PDFDocument.create();

    let tW = targetW, tH = targetH;
    if (orientation === 'landscape') { tW = targetH; tH = targetW; }

    const srcPages = srcDoc.getPages();
    const mode = scaleMode.value;

    for (let i = 0; i < srcPages.length; i++) {
      const srcPage = srcPages[i];
      const { width: origW, height: origH } = srcPage.getSize();
      const [embedded] = await newDoc.embedPdf(srcDoc, [i]);

      const newPage = newDoc.addPage([tW, tH]);

      let drawX = 0, drawY = 0, drawW = tW, drawH = tH;

      if (mode === 'fit') {
        const scaleX = tW / origW;
        const scaleY = tH / origH;
        const s = Math.min(scaleX, scaleY);
        drawW = origW * s;
        drawH = origH * s;
        drawX = (tW - drawW) / 2;
        drawY = (tH - drawH) / 2;
      } else if (mode === 'center') {
        drawW = origW;
        drawH = origH;
        drawX = (tW - origW) / 2;
        drawY = (tH - origH) / 2;
      }
      /* 'stretch' keeps drawX=0, drawY=0, drawW=tW, drawH=tH */

      newPage.drawPage(embedded, { x: drawX, y: drawY, width: drawW, height: drawH });
      progressFill.style.width = ((i + 1) / srcPages.length * 100) + '%';
    }

    const outBytes = await newDoc.save();
    if (resizedBlobUrl) URL.revokeObjectURL(resizedBlobUrl);
    const blob = new Blob([outBytes], { type: 'application/pdf' });
    resizedBlobUrl = URL.createObjectURL(blob);

    /* Refresh preview */
    pdfBytes = new Uint8Array(outBytes);
    pdfDoc = await window.pdfjsLib.getDocument({ data: pdfBytes.slice() }).promise;
    totalPages = pdfDoc.numPages;
    currentPage = 1;
    await renderPage(1);

    btnDownload.style.display = 'block';
    btnResize.textContent = '✅ Resized!';
    setTimeout(() => { btnResize.textContent = '📐 Resize PDF'; btnResize.disabled = false; }, 1500);
  } catch (err) {
    console.error(err);
    btnResize.textContent = '❌ Error';
    setTimeout(() => { btnResize.textContent = '📐 Resize PDF'; btnResize.disabled = false; }, 2000);
  }
  progressBar.style.display = 'none';
});

/* Download */
btnDownload.addEventListener('click', () => {
  if (!resizedBlobUrl) return;
  const a = document.createElement('a');
  a.href = resizedBlobUrl;
  a.download = 'resized.pdf';
  a.click();
});

/* Reset */
btnReset.addEventListener('click', () => {
  pdfBytes = null;
  pdfDoc = null;
  resizedBlobUrl = null;
  workspace.style.display = 'none';
  uploadZone.style.display = 'block';
  btnDownload.style.display = 'none';
  fileInput.value = '';
});