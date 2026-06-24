document.addEventListener('DOMContentLoaded', () => {
  // --- UI Elements ---
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  
  const controlsSection = document.getElementById('controls-section');
  const tracePreset = document.getElementById('trace-preset');
  
  const btnProcess = document.getElementById('btn-process');
  const btnReset = document.getElementById('btn-reset');
  
  const previewPlaceholder = document.getElementById('preview-placeholder');
  const rasterPreview = document.getElementById('raster-preview');
  const svgResultContainer = document.getElementById('svg-result-container');
  const loadingIndicator = document.getElementById('loading-indicator');
  
  const resultSection = document.getElementById('result-section');
  const resStatus = document.getElementById('res-status');
  const resPaths = document.getElementById('res-paths');
  const btnDownload = document.getElementById('btn-download');

  // --- State ---
  let originalFileUrl = null;
  let originalFilename = null;
  let currentSvgString = null;

  // --- Initialize ---
  init();

  function init() {
    setupDropZone();

    btnProcess.addEventListener('click', processImage);
    btnReset.addEventListener('click', resetTool);
    btnDownload.addEventListener('click', downloadSvg);
  }

  // --- File Upload ---
  function setupDropZone() {
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', e => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files[0]) handleFile(fileInput.files[0]);
    });
  }

  function handleFile(file) {
    if (file.type && !file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }

    originalFilename = file.name.split('.')[0] || 'traced-image';
    
    // Revoke previous object URL to avoid memory leaks
    if (originalFileUrl) {
      URL.revokeObjectURL(originalFileUrl);
    }
    
    originalFileUrl = URL.createObjectURL(file);
    
    // Update UI
    dropZone.style.display = 'none';
    controlsSection.style.display = 'block';
    
    // Show initial preview
    previewPlaceholder.style.display = 'none';
    svgResultContainer.style.display = 'none';
    rasterPreview.src = originalFileUrl;
    rasterPreview.style.display = 'block';
    
    resultSection.style.display = 'none';
  }

  // --- Processing ---
  function processImage() {
    if (!originalFileUrl || typeof ImageTracer === 'undefined') {
      alert('ImageTracer library is still loading or no image is selected.');
      return;
    }

    // Show loading
    loadingIndicator.style.display = 'flex';
    rasterPreview.style.display = 'none';
    svgResultContainer.style.display = 'none';
    resultSection.style.display = 'none';
    btnProcess.disabled = true;

    // Get preset
    const preset = tracePreset.value;

    // ImageTracer needs an image URL, a callback, and options string
    // We use setTimeout to allow the browser to render the loading indicator
    setTimeout(() => {
      ImageTracer.imageToSVG(
        originalFileUrl,
        function(svgStr) {
          // Success Callback
          currentSvgString = svgStr;
          
          // Count paths for fun metrics
          const pathCount = (svgStr.match(/<path/g) || []).length;
          
          // Display
          loadingIndicator.style.display = 'none';
          svgResultContainer.innerHTML = svgStr;
          svgResultContainer.style.display = 'flex';
          
          // Show results section
          resPaths.textContent = `${pathCount} Paths Generated`;
          resultSection.style.display = 'block';
          btnProcess.disabled = false;
        },
        preset // Using named presets directly supported by ImageTracer
      );
    }, 100);
  }

  // --- Download ---
  function downloadSvg() {
    if (!currentSvgString) return;
    
    const blob = new Blob([currentSvgString], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = `${originalFilename}-vector.svg`;
    link.href = url;
    link.click();
    
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  }

  // --- Utils ---
  function resetTool() {
    if (originalFileUrl) {
      URL.revokeObjectURL(originalFileUrl);
    }
    originalFileUrl = null;
    currentSvgString = null;
    
    dropZone.style.display = 'flex';
    controlsSection.style.display = 'none';
    resultSection.style.display = 'none';
    
    rasterPreview.style.display = 'none';
    rasterPreview.src = '';
    svgResultContainer.style.display = 'none';
    svgResultContainer.innerHTML = '';
    
    previewPlaceholder.style.display = 'flex';
    
    fileInput.value = '';
    btnProcess.disabled = false;
  }
});