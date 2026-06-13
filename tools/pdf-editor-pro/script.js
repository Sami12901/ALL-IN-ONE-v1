// PDF Editor Pro Logic
// Uses pdf.js for rendering and pdf-lib for applying edits and saving.

document.addEventListener('DOMContentLoaded', () => {
  // UI Elements
  const fileInput = document.getElementById('file-input');
  const uploadScreen = document.getElementById('upload-screen');
  const editorToolbar = document.getElementById('editor-toolbar');
  
  const canvas = document.getElementById('pdf-canvas');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('pdf-overlay');
  const pageWrapper = document.getElementById('page-wrapper');
  const workspace = document.getElementById('workspace');

  // Toolbar
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  const pageNumSpan = document.getElementById('page-num');
  const pageCountSpan = document.getElementById('page-count');
  
  const zoomInBtn = document.getElementById('zoom-in');
  const zoomOutBtn = document.getElementById('zoom-out');
  const zoomValSpan = document.getElementById('zoom-val');

  const btnWhiteout = document.getElementById('tool-whiteout');
  const btnText = document.getElementById('tool-text');
  const textColorInput = document.getElementById('text-color');
  const textSizeSelect = document.getElementById('text-size');
  const fontFamilySelect = document.getElementById('font-family');
  const exportBtn = document.getElementById('export-pdf');

  // Populate Fonts
  const popularFonts = [
    "Roboto", "Open Sans", "Lato", "Montserrat", "Oswald", "Source Sans Pro", "Raleway", "PT Sans", 
    "Merriweather", "Noto Sans", "Nunito", "Playfair Display", "Ubuntu", "Rubik", "Lora", "Work Sans", 
    "Fira Sans", "Inter", "Quicksand", "Karla", "Barlow", "Mulish", "Inconsolata", "Titillium Web", 
    "Josefin Sans", "Libre Baskerville", "Anton", "Dancing Script", "Bebas Neue", "Pacifico", "Caveat", 
    "Cinzel", "Righteous", "Lobster", "Abril Fatface", "Permanent Marker", "Satisfy", "Courgette", 
    "Great Vibes", "Amaranth", "Teko", "Cinzel Decorative", "Orbitron", "Press Start 2P", "Cormorant Garamond"
  ];
  popularFonts.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f;
    opt.textContent = f;
    fontFamilySelect.appendChild(opt);
  });

  // Dynamically load font for preview
  fontFamilySelect.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val !== 'Helvetica') {
      const linkId = 'font-link-' + val.replace(/\s+/g, '-');
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=' + val.replace(/\s+/g, '+') + '&display=swap';
        document.head.appendChild(link);
      }
    }
  });

  // State
  let pdfBytes = null;
  let pdfDoc = null; // pdf.js document
  let pageNum = 1;
  let pageRendering = false;
  let pageNumPending = null;
  let scale = 1.5; // Base scale, adjusted on load
  let activeTool = null; // 'text' or 'whiteout'

  // Annotations stored per page: { type: 'text'|'whiteout', x, y, width, height, text, color, size, font }
  const annotations = {}; 

  // PDF.js Setup
  pdfjsLib.GlobalWorkerOptions.workerSrc = '../../assets/lib/pdf.worker.min.js';

  // --- 1. File Loading ---
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      pdfBytes = new Uint8Array(arrayBuffer); // Keep original bytes for pdf-lib

      uploadScreen.style.display = 'none';
      editorToolbar.style.display = 'flex';
      
      loadPDFJS(pdfBytes);
    }
  });

  function loadPDFJS(data) {
    const loadingTask = pdfjsLib.getDocument({ data });
    loadingTask.promise.then(function(pdf) {
      pdfDoc = pdf;
      pageCountSpan.textContent = pdfDoc.numPages;
      
      // Auto-fit scale
      workspace.style.display = 'block'; // Ensure it has dimensions
      renderPage(pageNum);
    }, function (reason) {
      console.error(reason);
      alert('Error loading PDF: ' + reason.message);
    });
  }

  function renderPage(num) {
    pageRendering = true;
    
    pdfDoc.getPage(num).then(function(page) {
      const viewport = page.getViewport({ scale });
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      pageWrapper.style.width = viewport.width + 'px';
      pageWrapper.style.height = viewport.height + 'px';

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      
      const renderTask = page.render(renderContext);
      
      renderTask.promise.then(function() {
        pageRendering = false;
        if (pageNumPending !== null) {
          renderPage(pageNumPending);
          pageNumPending = null;
        }
        restoreAnnotations();
      });
    });

    pageNumSpan.textContent = num;
    prevPageBtn.disabled = num <= 1;
    nextPageBtn.disabled = num >= pdfDoc.numPages;
  }

  function queueRenderPage(num) {
    if (pageRendering) {
      pageNumPending = num;
    } else {
      renderPage(num);
    }
  }

  // Navigation
  prevPageBtn.addEventListener('click', () => {
    if (pageNum <= 1) return;
    saveCurrentAnnotations();
    pageNum--;
    queueRenderPage(pageNum);
  });

  nextPageBtn.addEventListener('click', () => {
    if (pageNum >= pdfDoc.numPages) return;
    saveCurrentAnnotations();
    pageNum++;
    queueRenderPage(pageNum);
  });

  // Zoom
  zoomInBtn.addEventListener('click', () => {
    saveCurrentAnnotations();
    scale += 0.25;
    zoomValSpan.textContent = Math.round(scale * 100 / 1.5) + '%';
    queueRenderPage(pageNum);
  });

  zoomOutBtn.addEventListener('click', () => {
    if (scale <= 0.5) return;
    saveCurrentAnnotations();
    scale -= 0.25;
    zoomValSpan.textContent = Math.round(scale * 100 / 1.5) + '%';
    queueRenderPage(pageNum);
  });


  // --- 2. Interactive Tools ---

  function setActiveTool(tool) {
    btnWhiteout.classList.remove('active');
    btnText.classList.remove('active');
    workspace.classList.remove('drawing-mode');
    
    if (activeTool === tool) {
      activeTool = null; // Toggle off
    } else {
      activeTool = tool;
      if (tool === 'whiteout') btnWhiteout.classList.add('active');
      if (tool === 'text') btnText.classList.add('active');
      workspace.classList.add('drawing-mode');
    }
  }

  btnWhiteout.addEventListener('click', () => setActiveTool('whiteout'));
  btnText.addEventListener('click', () => setActiveTool('text'));

  // Deselect annotations when clicking empty space
  overlay.addEventListener('mousedown', (e) => {
    if (e.target === overlay) {
      document.querySelectorAll('.annotation').forEach(el => el.classList.remove('selected'));
    }
  });

  // Handle Tool Actions on Overlay
  let isDrawing = false;
  let startX, startY;
  let currentBox = null;

  overlay.addEventListener('mousedown', (e) => {
    if (!activeTool) return;
    if (e.target !== overlay) return; // Ignore if clicking an existing annotation
    
    const rect = overlay.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;

    if (activeTool === 'whiteout') {
      isDrawing = true;
      currentBox = document.createElement('div');
      currentBox.className = 'annotation whiteout-box selected';
      currentBox.style.left = startX + 'px';
      currentBox.style.top = startY + 'px';
      currentBox.style.width = '0px';
      currentBox.style.height = '0px';
      
      const delBtn = createDeleteBtn();
      currentBox.appendChild(delBtn);
      
      makeDraggable(currentBox);
      overlay.appendChild(currentBox);
    }
    
    if (activeTool === 'text') {
      // Just create text input at click
      createTextAnnotation(startX, startY);
      setActiveTool(null); // Turn off tool after placing
    }
  });

  overlay.addEventListener('mousemove', (e) => {
    if (!isDrawing || !currentBox || activeTool !== 'whiteout') return;
    const rect = overlay.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);

    currentBox.style.width = width + 'px';
    currentBox.style.height = height + 'px';
    currentBox.style.left = left + 'px';
    currentBox.style.top = top + 'px';
  });

  overlay.addEventListener('mouseup', () => {
    if (isDrawing && currentBox) {
      isDrawing = false;
      // If too small, discard
      if (parseInt(currentBox.style.width) < 10 || parseInt(currentBox.style.height) < 10) {
        currentBox.remove();
      }
      currentBox = null;
      setActiveTool(null);
    }
  });

  function createTextAnnotation(x, y, textVal = '', colorVal = null, sizeVal = null, fontVal = null) {
    const box = document.createElement('div');
    box.className = 'annotation';
    box.style.left = x + 'px';
    box.style.top = y + 'px';
    box.classList.add('selected');

    const input = document.createElement('textarea');
    input.className = 'text-box';
    input.value = textVal;
    input.placeholder = 'Type here...';
    input.style.color = colorVal || textColorInput.value;
    input.style.fontSize = (sizeVal || textSizeSelect.value) + 'px';
    input.style.fontFamily = fontVal || fontFamilySelect.value;
    input.style.minWidth = '100px';
    input.style.minHeight = '30px';

    // Auto resize textarea
    input.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
      this.style.width = 'auto';
      this.style.width = (this.scrollWidth + 10) + 'px';
    });

    const delBtn = createDeleteBtn();
    
    box.appendChild(input);
    box.appendChild(delBtn);
    makeDraggable(box);
    
    overlay.appendChild(box);
    input.focus();
  }

  function createDeleteBtn() {
    const btn = document.createElement('button');
    btn.className = 'delete-btn';
    btn.innerHTML = '✕';
    btn.onclick = function(e) {
      e.stopPropagation();
      this.parentElement.remove();
    };
    return btn;
  }

  function makeDraggable(el) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    el.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      if (e.target.tagName === 'TEXTAREA' && e.target === document.activeElement) {
        // Let user type
        return;
      }
      e.stopPropagation();
      
      // Select
      document.querySelectorAll('.annotation').forEach(a => a.classList.remove('selected'));
      el.classList.add('selected');

      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      el.style.top = (el.offsetTop - pos2) + "px";
      el.style.left = (el.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  // --- 3. Save / Restore State ---

  function saveCurrentAnnotations() {
    const pageNodes = overlay.querySelectorAll('.annotation');
    const annots = [];
    
    pageNodes.forEach(node => {
      const rect = node.getBoundingClientRect();
      const parentRect = overlay.getBoundingClientRect();
      
      const x = rect.left - parentRect.left;
      const y = rect.top - parentRect.top;
      
      // Convert visual CSS coordinates back to unscaled PDF coordinates
      const unscaledX = x / scale;
      const unscaledY = y / scale;

      if (node.classList.contains('whiteout-box')) {
        annots.push({
          type: 'whiteout',
          x: unscaledX,
          y: unscaledY,
          width: rect.width / scale,
          height: rect.height / scale
        });
      } else {
        const textarea = node.querySelector('textarea');
        if (textarea && textarea.value.trim() !== '') {
          annots.push({
            type: 'text',
            x: unscaledX,
            y: unscaledY,
            text: textarea.value,
            color: textarea.style.color,
            size: parseInt(textarea.style.fontSize) / scale, // Unscale font size
            font: textarea.style.fontFamily.replace(/['"]/g, '')
          });
        }
      }
    });

    annotations[pageNum] = annots;
    overlay.innerHTML = ''; // Clear DOM
  }

  function restoreAnnotations() {
    overlay.innerHTML = '';
    const annots = annotations[pageNum] || [];
    
    annots.forEach(a => {
      if (a.type === 'whiteout') {
        const box = document.createElement('div');
        box.className = 'annotation whiteout-box';
        box.style.left = (a.x * scale) + 'px';
        box.style.top = (a.y * scale) + 'px';
        box.style.width = (a.width * scale) + 'px';
        box.style.height = (a.height * scale) + 'px';
        box.appendChild(createDeleteBtn());
        makeDraggable(box);
        overlay.appendChild(box);
      } else if (a.type === 'text') {
        createTextAnnotation(a.x * scale, a.y * scale, a.text, a.color, a.size * scale, a.font);
      }
    });
  }


  // --- 4. Export logic using pdf-lib ---

  exportBtn.addEventListener('click', async () => {
    try {
      exportBtn.disabled = true;
      exportBtn.textContent = 'Saving...';
      
      // Save current page
      saveCurrentAnnotations();

      if (!window.PDFLib) {
        alert('PDF-lib not found.');
        return;
      }

      const { PDFDocument, rgb, StandardFonts } = PDFLib;
      
      // Load original bytes
      const pdfDocLib = await PDFDocument.load(pdfBytes);
      
      // Register fontkit
      if (window.fontkit) {
        pdfDocLib.registerFontkit(window.fontkit);
      }

      const pages = pdfDocLib.getPages();

      // Cache for downloaded fonts to avoid re-fetching
      const customFontsCache = {};

      // Apply annotations to each page
      for (let i = 0; i < pages.length; i++) {
        const pageNumIndex = i + 1;
        const pageAnnots = annotations[pageNumIndex];
        if (!pageAnnots || pageAnnots.length === 0) continue;

        const page = pages[i];
        
        const pdfJsPage = await pdfDoc.getPage(pageNumIndex);
        const baseViewport = pdfJsPage.getViewport({ scale: 1.0 });

        for (const a of pageAnnots) {
          if (a.type === 'whiteout') {
            const y_bottom = baseViewport.height - a.y - a.height;
            page.drawRectangle({
              x: a.x,
              y: y_bottom,
              width: a.width,
              height: a.height,
              color: rgb(1, 1, 1),
            });
          } else if (a.type === 'text') {
            let r=0, g=0, b=0;
            const rgbMatch = a.color.match(/\d+/g);
            if (rgbMatch && rgbMatch.length >= 3) {
              r = parseInt(rgbMatch[0]) / 255;
              g = parseInt(rgbMatch[1]) / 255;
              b = parseInt(rgbMatch[2]) / 255;
            }

            const y_bottom = baseViewport.height - a.y - a.size;

            let fontToUse;
            if (a.font === 'Helvetica' || !a.font) {
              fontToUse = await pdfDocLib.embedFont(StandardFonts.Helvetica);
            } else {
              // Fetch custom Google Font
              if (!customFontsCache[a.font]) {
                try {
                  const fontUrl = 'https://fonts.googleapis.com/css2?family=' + a.font.replace(/\s+/g, '+');
                  const css = await fetch(fontUrl).then(res => res.text());
                  const woffUrlMatch = css.match(/url\((https:\/\/[^\)]+)\)/);
                  if (woffUrlMatch && woffUrlMatch[1]) {
                    const fontBytes = await fetch(woffUrlMatch[1]).then(res => res.arrayBuffer());
                    customFontsCache[a.font] = await pdfDocLib.embedFont(fontBytes);
                  } else {
                    fontToUse = await pdfDocLib.embedFont(StandardFonts.Helvetica);
                  }
                } catch (e) {
                  console.error('Failed to load custom font', a.font, e);
                  fontToUse = await pdfDocLib.embedFont(StandardFonts.Helvetica);
                }
              }
              if (customFontsCache[a.font]) {
                fontToUse = customFontsCache[a.font];
              }
            }
            
            page.drawText(a.text, {
              x: a.x,
              y: y_bottom,
              size: a.size,
              color: rgb(r, g, b),
              font: fontToUse
            });
          }
        }
      }

      const pdfBytesModified = await pdfDocLib.save();
      
      // Download
      const blob = new Blob([pdfBytesModified], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Edited_ALL_IN_ONE_${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Restore view
      restoreAnnotations();

    } catch (err) {
      console.error(err);
      alert('Error saving PDF.');
    } finally {
      exportBtn.disabled = false;
      exportBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
        Save PDF
      `;
    }
  });

});
