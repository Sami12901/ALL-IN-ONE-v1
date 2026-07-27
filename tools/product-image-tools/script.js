// Product Image Tools Logic
import imglyRemoveBackground from '../../assets/lib/imgly/index.mjs';

document.addEventListener('DOMContentLoaded', () => {

  const uploadState = document.getElementById('upload-state');
  const editorState = document.getElementById('editor-state');
  const fileInput = document.getElementById('initial-upload');
  
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  
  let sourceImage = null;

  // State object holding all user settings
  const state = {
    width: 1080,
    height: 1080,
    fit: 'contain',
    bgColor: '#ffffff',
    watermark: {
      text: '',
      opacity: 0.5,
      size: 60,
      pos: 'center',
      color: '#ffffff'
    },
    adjust: {
      bright: 100,
      cont: 100,
      sat: 100
    }
  };

  // --- UI Binding ---
  const inputs = {
    width: document.getElementById('img-width'),
    height: document.getElementById('img-height'),
    fit: document.getElementById('img-fit'),
    bgColor: document.getElementById('img-bg-color'),
    wmText: document.getElementById('wm-text'),
    wmOpacity: document.getElementById('wm-opacity'),
    wmSize: document.getElementById('wm-size'),
    wmPos: document.getElementById('wm-pos'),
    wmColor: document.getElementById('wm-color'),
    adjBright: document.getElementById('adj-bright'),
    adjCont: document.getElementById('adj-cont'),
    adjSat: document.getElementById('adj-sat')
  };

  // Tabs
  const tabs = document.querySelectorAll('.tool-tab');
  const panes = document.querySelectorAll('.pane');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`pane-${tab.dataset.mode}`).classList.add('active');
    });
  });

  // Toggle Background color picker based on fit mode
  inputs.fit.addEventListener('change', (e) => {
    document.getElementById('bg-color-group').style.display = (e.target.value === 'contain') ? 'block' : 'none';
  });

  // Event Listeners for Live Render
  const updateStateAndRender = () => {
    state.width = parseInt(inputs.width.value) || 1080;
    state.height = parseInt(inputs.height.value) || 1080;
    state.fit = inputs.fit.value;
    state.bgColor = inputs.bgColor.value;
    
    state.watermark.text = inputs.wmText.value;
    state.watermark.opacity = parseFloat(inputs.wmOpacity.value);
    state.watermark.size = parseInt(inputs.wmSize.value);
    state.watermark.pos = inputs.wmPos.value;
    state.watermark.color = inputs.wmColor.value;

    state.adjust.bright = parseInt(inputs.adjBright.value);
    state.adjust.cont = parseInt(inputs.adjCont.value);
    state.adjust.sat = parseInt(inputs.adjSat.value);

    // Update labels
    document.getElementById('val-bright').textContent = state.adjust.bright;
    document.getElementById('val-cont').textContent = state.adjust.cont;
    document.getElementById('val-sat').textContent = state.adjust.sat;
    document.getElementById('out-res-text').textContent = `${state.width}x${state.height}`;

    render();
  };

  Object.values(inputs).forEach(input => {
    input.addEventListener('input', updateStateAndRender);
    input.addEventListener('change', updateStateAndRender);
  });

  document.getElementById('btn-reset-adj').addEventListener('click', () => {
    inputs.adjBright.value = 100;
    inputs.adjCont.value = 100;
    inputs.adjSat.value = 100;
    updateStateAndRender();
  });

  // --- Image Upload ---
  uploadState.addEventListener('click', () => fileInput.click());
  
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          sourceImage = img;
          
          // Auto-set canvas size to match original image if it's the first upload, 
          // or leave it at 1080x1080 for ecommerce standard. Let's just do 1080x1080 for now.
          
          uploadState.style.display = 'none';
          editorState.style.display = 'grid';
          updateStateAndRender();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  document.getElementById('btn-new').addEventListener('click', () => {
    sourceImage = null;
    editorState.style.display = 'none';
    uploadState.style.display = 'block';
    fileInput.value = '';
    // Reset background color since it might have been made transparent
    state.bgColor = '#ffffff';
    inputs.bgColor.value = '#ffffff';
  });

  // --- AI Background Removal ---
  const btnRemoveBg = document.getElementById('btn-remove-bg');
  const txtRemoveBg = document.getElementById('txt-remove-bg');
  
  btnRemoveBg.addEventListener('click', async () => {
    if (!sourceImage) return;
    
    const originalText = txtRemoveBg.innerText;
    txtRemoveBg.innerText = "Processing AI Model (Please wait...)";
    btnRemoveBg.disabled = true;

    try {
      // The library accepts an image URL, Blob, File, etc.
      // We will pass the image's src (DataURL).
      const blob = await imglyRemoveBackground(sourceImage.src);
      
      // Load the result blob back into our sourceImage
      const url = URL.createObjectURL(blob);
      const newImg = new Image();
      newImg.onload = () => {
        sourceImage = newImg;
        // Turn off padding background color so transparency is visible
        state.bgColor = 'transparent'; 
        inputs.bgColor.value = '#000000'; // reset color picker visually
        render();
        txtRemoveBg.innerText = originalText;
        btnRemoveBg.disabled = false;
      };
      newImg.src = url;
    } catch (error) {
      console.error(error);
      alert("Error removing background. Ensure you have an internet connection for the initial model download.");
      txtRemoveBg.innerText = originalText;
      btnRemoveBg.disabled = false;
    }
  });

  // --- Core Rendering Engine ---
  function render() {
    if (!sourceImage) return;

    // 1. Setup Canvas Dimensions
    canvas.width = state.width;
    canvas.height = state.height;

    // 2. Clear & Fill Background (for 'contain' mode)
    if (state.fit === 'contain' && state.bgColor !== 'transparent') {
      ctx.fillStyle = state.bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // 3. Apply CSS Filters (Brightness, Contrast, Saturation) via Context API
    ctx.filter = `brightness(${state.adjust.bright}%) contrast(${state.adjust.cont}%) saturate(${state.adjust.sat}%)`;

    // 4. Draw Source Image with Math
    const srcW = sourceImage.width;
    const srcH = sourceImage.height;
    const destW = canvas.width;
    const destH = canvas.height;

    let drawX = 0, drawY = 0, drawW = destW, drawH = destH;

    if (state.fit === 'stretch') {
      // Just draw it mapped exactly
      ctx.drawImage(sourceImage, 0, 0, drawW, drawH);
    } else {
      const scaleX = destW / srcW;
      const scaleY = destH / srcH;
      const scale = (state.fit === 'contain') ? Math.min(scaleX, scaleY) : Math.max(scaleX, scaleY);
      
      drawW = srcW * scale;
      drawH = srcH * scale;
      drawX = (destW - drawW) / 2;
      drawY = (destH - drawH) / 2;
      
      ctx.drawImage(sourceImage, drawX, drawY, drawW, drawH);
    }

    // Reset filter so it doesn't apply to the watermark
    ctx.filter = 'none';

    // 5. Draw Watermark
    if (state.watermark.text) {
      ctx.globalAlpha = state.watermark.opacity;
      ctx.fillStyle = state.watermark.color;
      ctx.font = `bold ${state.watermark.size}px Arial, sans-serif`;
      
      const txt = state.watermark.text;
      const metrics = ctx.measureText(txt);
      const textW = metrics.width;
      const textH = state.watermark.size; // approximation
      
      if (state.watermark.pos === 'center') {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(txt, canvas.width / 2, canvas.height / 2);
      } 
      else if (state.watermark.pos === 'bottom-right') {
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(txt, canvas.width - 20, canvas.height - 20);
      }
      else if (state.watermark.pos === 'top-left') {
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(txt, 20, 20);
      }
      else if (state.watermark.pos === 'tile') {
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        // Rotate context slightly for professional watermark look
        ctx.translate(canvas.width/2, canvas.height/2);
        ctx.rotate(-Math.PI / 6);
        ctx.translate(-canvas.width/2, -canvas.height/2);
        
        const stepX = textW + 150;
        const stepY = textH + 100;
        
        // Draw way outside bounds to cover rotation
        for (let y = -canvas.height; y < canvas.height * 2; y += stepY) {
          for (let x = -canvas.width; x < canvas.width * 2; x += stepX) {
            ctx.fillText(txt, x, y);
          }
        }
        
        // Reset transform
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
      
      ctx.globalAlpha = 1.0;
    }
  }

  // --- Download ---
  document.getElementById('btn-download').addEventListener('click', () => {
    if (!sourceImage) return;
    
    // If background is transparent, we MUST export as PNG. Otherwise JPEG for smaller file size.
    let mimeType = (state.bgColor === 'transparent') ? 'image/png' : 'image/jpeg';
    let ext = (state.bgColor === 'transparent') ? 'png' : 'jpg';

    const dataURL = canvas.toDataURL(mimeType, 0.95);
    const link = document.createElement('a');
    link.download = `product_image_${Date.now()}.${ext}`;
    link.href = dataURL;
    link.click();
  });

});