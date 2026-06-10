document.addEventListener('DOMContentLoaded', () => {
  const imageUpload = document.getElementById('image-upload');
  const fileInfo = document.getElementById('file-info');
  const resizeWidth = document.getElementById('resize-width');
  const resizeHeight = document.getElementById('resize-height');
  const maintainAspectRatio = document.getElementById('maintain-aspect-ratio');
  const outputFormat = document.getElementById('output-format');
  const qualitySlider = document.getElementById('quality-slider');
  const qualityValue = document.getElementById('quality-value');
  const processBtn = document.getElementById('process-btn');
  const downloadBtn = document.getElementById('download-btn');
  const imagePreview = document.getElementById('image-preview');
  const previewPlaceholder = document.getElementById('preview-placeholder');
  const outputInfo = document.getElementById('output-info');
  const outDim = document.getElementById('out-dim');
  const outSize = document.getElementById('out-size');
  const outSavings = document.getElementById('out-savings');

  let currentImage = null;
  let originalFile = null;
  let processedBlob = null;
  let processedDataUrl = null;

  // Format bytes helper
  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // Handle file upload
  imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    originalFile = file;
    fileInfo.style.display = 'block';
    fileInfo.innerHTML = `<strong>File:</strong> ${file.name} (${formatBytes(file.size)})`;
    
    // Default format selection based on input
    if (file.type === 'image/jpeg') outputFormat.value = 'image/jpeg';
    else if (file.type === 'image/png') outputFormat.value = 'image/png';
    else outputFormat.value = 'image/webp';

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        currentImage = img;
        
        // Show original dimensions in inputs
        resizeWidth.value = img.width;
        resizeHeight.value = img.height;
        
        // Show preview
        imagePreview.src = event.target.result;
        imagePreview.style.display = 'block';
        previewPlaceholder.style.display = 'none';
        
        // Enable buttons
        processBtn.disabled = false;
        
        // Reset output info
        outputInfo.style.display = 'none';
        downloadBtn.disabled = true;
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  // Handle Aspect Ratio Lock
  let isUpdating = false;

  resizeWidth.addEventListener('input', () => {
    if (!currentImage || !maintainAspectRatio.checked || isUpdating) return;
    isUpdating = true;
    const ratio = currentImage.height / currentImage.width;
    resizeHeight.value = Math.round(resizeWidth.value * ratio);
    isUpdating = false;
  });

  resizeHeight.addEventListener('input', () => {
    if (!currentImage || !maintainAspectRatio.checked || isUpdating) return;
    isUpdating = true;
    const ratio = currentImage.width / currentImage.height;
    resizeWidth.value = Math.round(resizeHeight.value * ratio);
    isUpdating = false;
  });

  // Handle Quality Slider
  qualitySlider.addEventListener('input', () => {
    qualityValue.textContent = qualitySlider.value + '%';
  });

  // Handle Process Image
  processBtn.addEventListener('click', () => {
    if (!currentImage) return;

    const width = parseInt(resizeWidth.value) || currentImage.width;
    const height = parseInt(resizeHeight.value) || currentImage.height;
    const format = outputFormat.value;
    const quality = parseInt(qualitySlider.value) / 100;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    
    // Fill transparent backgrounds with white if converting to JPEG
    if (format === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
    }

    ctx.drawImage(currentImage, 0, 0, width, height);

    processedDataUrl = canvas.toDataURL(format, quality);
    
    // Convert base64 to blob to calculate file size
    const byteString = atob(processedDataUrl.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    processedBlob = new Blob([ab], { type: format });

    // Update preview
    imagePreview.src = processedDataUrl;
    
    // Show stats
    outDim.textContent = `${width} × ${height}`;
    outSize.textContent = formatBytes(processedBlob.size);
    
    const savings = originalFile.size - processedBlob.size;
    if (savings > 0) {
      const percentage = Math.round((savings / originalFile.size) * 100);
      outSavings.textContent = `Saved ${percentage}%`;
      outSavings.style.color = 'var(--success)';
    } else {
      outSavings.textContent = `File size increased`;
      outSavings.style.color = 'var(--error, #ef4444)';
    }
    
    outputInfo.style.display = 'block';
    downloadBtn.disabled = false;
  });

  // Handle Download
  downloadBtn.addEventListener('click', () => {
    if (!processedDataUrl) return;

    const format = outputFormat.value;
    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/png' ? 'png' : 'webp';
    const originalName = originalFile.name.split('.')[0];
    const newFileName = `${originalName}-resized.${ext}`;

    const link = document.createElement('a');
    link.href = processedDataUrl;
    link.download = newFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
});