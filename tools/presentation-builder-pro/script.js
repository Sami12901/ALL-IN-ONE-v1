// Presentation Builder Pro - Core Logic

class SlideEngine {
  constructor() {
    this.slides = []; // Array of slide objects { id, elements: [] }
    this.activeSlideId = null;
    this.selectedElementId = null;
    
    // DOM Elements
    this.canvas = document.getElementById('slide-canvas');
    this.thumbnailContainer = document.getElementById('slide-thumbnails');
    this.propPanel = document.getElementById('prop-panel');
    
    // Bind buttons
    document.getElementById('add-slide-btn').addEventListener('click', () => this.addSlide());
    document.getElementById('add-text-btn').addEventListener('click', () => this.addTextElement());
    
    const imageUpload = document.getElementById('image-upload');
    document.getElementById('add-image-btn').addEventListener('click', () => imageUpload.click());
    imageUpload.addEventListener('change', (e) => this.addImageElement(e));
    
    document.getElementById('export-pptx-btn').addEventListener('click', () => this.exportPPTX());
    document.getElementById('export-pdf-btn').addEventListener('click', () => this.exportPDF());
    
    // Property Panel
    document.getElementById('prop-font-size').addEventListener('input', (e) => this.updateSelectedProp('fontSize', e.target.value + 'px'));
    document.getElementById('prop-color').addEventListener('input', (e) => this.updateSelectedProp('color', e.target.value));
    document.getElementById('prop-delete').addEventListener('click', () => this.deleteSelectedElement());
    
    // Canvas click to deselect
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.target === this.canvas) {
        this.selectElement(null);
      }
    });

    // Initial slide
    this.addSlide();
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  addSlide() {
    const slide = {
      id: this.generateId(),
      elements: []
    };
    this.slides.push(slide);
    this.activeSlideId = slide.id;
    this.renderThumbnails();
    this.renderCanvas();
  }
  
  deleteSlide(id) {
    if (this.slides.length === 1) return; // Must have at least 1 slide
    const index = this.slides.findIndex(s => s.id === id);
    this.slides = this.slides.filter(s => s.id !== id);
    if (this.activeSlideId === id) {
      this.activeSlideId = this.slides[Math.max(0, index - 1)].id;
    }
    this.renderThumbnails();
    this.renderCanvas();
  }

  renderThumbnails() {
    this.thumbnailContainer.innerHTML = '';
    this.slides.forEach((slide, index) => {
      const thumb = document.createElement('div');
      thumb.className = \`slide-thumbnail \${slide.id === this.activeSlideId ? 'active' : ''}\`;
      thumb.onclick = () => {
        this.activeSlideId = slide.id;
        this.selectElement(null);
        this.renderThumbnails();
        this.renderCanvas();
      };
      
      const num = document.createElement('div');
      num.className = 'slide-number';
      num.textContent = index + 1;
      
      const del = document.createElement('button');
      del.className = 'delete-slide';
      del.textContent = '✕';
      del.onclick = (e) => {
        e.stopPropagation();
        this.deleteSlide(slide.id);
      };
      
      thumb.innerHTML = \`<div style="transform: scale(0.2); width: 960px; height: 540px; transform-origin: top left; pointer-events:none;">\${this.renderSlidePreview(slide)}</div>\`;
      thumb.appendChild(num);
      if (this.slides.length > 1) thumb.appendChild(del);
      
      this.thumbnailContainer.appendChild(thumb);
    });
  }
  
  renderSlidePreview(slide) {
    // Generate static HTML for thumbnail
    let html = '';
    slide.elements.forEach(el => {
      if (el.type === 'text') {
        html += \`<div style="position:absolute; left:\${el.x}px; top:\${el.y}px; width:\${el.width}px; font-size:\${el.fontSize}; color:\${el.color};">\${el.content}</div>\`;
      } else if (el.type === 'image') {
        html += \`<img style="position:absolute; left:\${el.x}px; top:\${el.y}px; width:\${el.width}px; height:\${el.height}px;" src="\${el.src}">\`;
      }
    });
    return html;
  }

  getActiveSlide() {
    return this.slides.find(s => s.id === this.activeSlideId);
  }

  renderCanvas() {
    this.canvas.innerHTML = '';
    const slide = this.getActiveSlide();
    if (!slide) return;
    
    slide.elements.forEach(el => {
      const div = document.createElement('div');
      div.className = \`canvas-element \${el.id === this.selectedElementId ? 'selected' : ''}\`;
      div.id = el.id;
      div.style.left = el.x + 'px';
      div.style.top = el.y + 'px';
      div.style.width = el.width + 'px';
      if (el.height) div.style.height = el.height + 'px';
      
      if (el.type === 'text') {
        const text = document.createElement('div');
        text.className = 'canvas-text';
        text.contentEditable = true;
        text.innerHTML = el.content;
        text.style.fontSize = el.fontSize;
        text.style.color = el.color;
        
        text.oninput = () => { el.content = text.innerHTML; this.updateThumbnailsThrottled(); };
        div.appendChild(text);
      } else if (el.type === 'image') {
        const img = document.createElement('img');
        img.className = 'canvas-image';
        img.src = el.src;
        img.style.width = '100%';
        img.style.height = '100%';
        div.appendChild(img);
      }
      
      // Resize handle
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'resize-handle';
      div.appendChild(resizeHandle);
      
      // Drag Logic
      this.makeDraggable(div, el, resizeHandle);
      
      div.addEventListener('mousedown', (e) => {
        if (e.target !== resizeHandle) {
           this.selectElement(el.id);
        }
      });
      
      this.canvas.appendChild(div);
    });
  }

  updateThumbnailsThrottled() {
    if (this.thumbTimer) clearTimeout(this.thumbTimer);
    this.thumbTimer = setTimeout(() => this.renderThumbnails(), 500);
  }

  makeDraggable(node, dataObj, resizeHandle) {
    let isDragging = false;
    let isResizing = false;
    let startX, startY, startLeft, startTop, startWidth, startHeight;

    const mousedown = (e) => {
      if (e.target === resizeHandle) {
        isResizing = true;
      } else {
        isDragging = true;
      }
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseInt(node.style.left || 0, 10);
      startTop = parseInt(node.style.top || 0, 10);
      startWidth = parseInt(node.style.width || node.offsetWidth, 10);
      startHeight = parseInt(node.style.height || node.offsetHeight, 10);
      e.stopPropagation();
    };

    const mousemove = (e) => {
      if (!isDragging && !isResizing) return;
      
      // Get canvas scale (in case we scale it later)
      const rect = this.canvas.getBoundingClientRect();
      const scale = 960 / rect.width; // Base width is 960
      
      const dx = (e.clientX - startX) * scale;
      const dy = (e.clientY - startY) * scale;
      
      if (isDragging) {
        dataObj.x = startLeft + dx;
        dataObj.y = startTop + dy;
        node.style.left = dataObj.x + 'px';
        node.style.top = dataObj.y + 'px';
      } else if (isResizing) {
        dataObj.width = Math.max(50, startWidth + dx);
        if (dataObj.type === 'image') {
           // Maintain aspect ratio roughly or free transform
           dataObj.height = Math.max(50, startHeight + dy);
           node.style.height = dataObj.height + 'px';
        }
        node.style.width = dataObj.width + 'px';
      }
    };

    const mouseup = () => {
      if (isDragging || isResizing) {
        isDragging = false;
        isResizing = false;
        this.updateThumbnailsThrottled();
      }
    };

    node.addEventListener('mousedown', mousedown);
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
  }

  selectElement(id) {
    this.selectedElementId = id;
    this.renderCanvas(); // Re-render to show selection box
    
    if (id) {
      const slide = this.getActiveSlide();
      const el = slide.elements.find(e => e.id === id);
      this.propPanel.style.display = 'block';
      if (el.type === 'text') {
        document.getElementById('prop-font-size').value = parseInt(el.fontSize);
        document.getElementById('prop-color').value = this.rgbToHex(el.color);
        document.getElementById('prop-font-size').disabled = false;
        document.getElementById('prop-color').disabled = false;
      } else {
        document.getElementById('prop-font-size').disabled = true;
        document.getElementById('prop-color').disabled = true;
      }
    } else {
      this.propPanel.style.display = 'none';
    }
  }

  updateSelectedProp(key, value) {
    if (!this.selectedElementId) return;
    const slide = this.getActiveSlide();
    const el = slide.elements.find(e => e.id === this.selectedElementId);
    if (el) {
      el[key] = value;
      this.renderCanvas();
      this.updateThumbnailsThrottled();
    }
  }
  
  deleteSelectedElement() {
    if (!this.selectedElementId) return;
    const slide = this.getActiveSlide();
    slide.elements = slide.elements.filter(e => e.id !== this.selectedElementId);
    this.selectElement(null);
    this.renderThumbnails();
  }

  addTextElement() {
    const slide = this.getActiveSlide();
    slide.elements.push({
      id: this.generateId(),
      type: 'text',
      content: 'New Text',
      x: 100,
      y: 100,
      width: 300,
      fontSize: '32px',
      color: '#000000'
    });
    this.renderCanvas();
    this.updateThumbnailsThrottled();
  }

  addImageElement(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const slide = this.getActiveSlide();
      slide.elements.push({
        id: this.generateId(),
        type: 'image',
        src: ev.target.result,
        x: 100,
        y: 100,
        width: 300,
        height: 200
      });
      this.renderCanvas();
      this.updateThumbnailsThrottled();
      e.target.value = ''; // Reset
    };
    reader.readAsDataURL(file);
  }

  rgbToHex(rgb) {
    if(rgb.startsWith('#')) return rgb;
    let sep = rgb.indexOf(",") > -1 ? "," : " ";
    rgb = rgb.substr(4).split(")")[0].split(sep);
    let r = (+rgb[0]).toString(16), g = (+rgb[1]).toString(16), b = (+rgb[2]).toString(16);
    if (r.length == 1) r = "0" + r;
    if (g.length == 1) g = "0" + g;
    if (b.length == 1) b = "0" + b;
    return "#" + r + g + b;
  }

  // --- EXPORTS ---

  exportPPTX() {
    if (typeof pptxgen === 'undefined') {
      alert("PPTX Generator library is still loading.");
      return;
    }
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_16x9';
    
    // PPTX uses inches. 960x540 canvas -> 10 x 5.625 inches roughly
    const pxToInches = (px) => px / 96;

    this.slides.forEach(slideData => {
      const slide = pptx.addSlide();
      slideData.elements.forEach(el => {
        if (el.type === 'text') {
          // Clean HTML from contentedit
          const text = el.content.replace(/<[^>]*>?/gm, '');
          slide.addText(text, {
            x: pxToInches(el.x),
            y: pxToInches(el.y),
            w: pxToInches(el.width),
            fontSize: parseInt(el.fontSize) * 0.75, // approximate pt conversion
            color: el.color.replace('#', '')
          });
        } else if (el.type === 'image') {
          slide.addImage({
            data: el.src,
            x: pxToInches(el.x),
            y: pxToInches(el.y),
            w: pxToInches(el.width),
            h: pxToInches(el.height)
          });
        }
      });
    });

    pptx.writeFile({ fileName: 'Presentation.pptx' });
  }

  exportPDF() {
    if (typeof html2pdf === 'undefined') {
      alert("PDF Generator library is still loading.");
      return;
    }
    
    // Create a temporary hidden container to render all slides for PDF
    const tempContainer = document.createElement('div');
    tempContainer.style.width = '960px';
    
    this.slides.forEach(slideData => {
      const slideDiv = document.createElement('div');
      slideDiv.style.width = '960px';
      slideDiv.style.height = '540px';
      slideDiv.style.position = 'relative';
      slideDiv.style.background = '#ffffff';
      slideDiv.style.overflow = 'hidden';
      // Page break for html2pdf
      slideDiv.className = 'html2pdf__page-break';
      
      slideDiv.innerHTML = this.renderSlidePreview(slideData);
      tempContainer.appendChild(slideDiv);
    });
    
    const opt = {
      margin:       0,
      filename:     'Presentation.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'px', format: [960, 540], orientation: 'landscape' }
    };
    
    html2pdf().set(opt).from(tempContainer).save();
  }
}

// Init immediately since module is deferred
window.presentationApp = new SlideEngine();