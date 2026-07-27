// Product Poster Maker Logic
document.addEventListener('DOMContentLoaded', () => {

  const inputs = {
    name: document.getElementById('p-name'),
    tagline: document.getElementById('p-tagline'),
    price: document.getElementById('p-price'),
    oldPrice: document.getElementById('p-old-price'),
    features: document.getElementById('p-features')
  };

  const outputs = {
    name: document.getElementById('out-name'),
    tagline: document.getElementById('out-tagline'),
    price: document.getElementById('out-price'),
    oldPrice: document.getElementById('out-old-price'),
    features: document.getElementById('out-features')
  };

  const colors = {
    bg: document.getElementById('color-bg'),
    bgText: document.getElementById('color-bg-text'),
    text: document.getElementById('color-text'),
    textText: document.getElementById('color-text-text'),
    accent: document.getElementById('color-accent'),
    accentText: document.getElementById('color-accent-text')
  };

  const themeSelect = document.getElementById('p-theme-select');

  const canvas = document.getElementById('poster-canvas');
  const wrapper = document.getElementById('poster-preview-wrapper');
  const imageUpload = document.getElementById('p-image-upload');
  const logoUpload = document.getElementById('p-logo-upload');
  const outImage = document.getElementById('out-image');
  const outLogo = document.getElementById('out-logo');
  const outPlaceholder = document.getElementById('out-placeholder');
  
  let currentSize = 'size-square';
  let uploadedImage = null;
  let uploadedLogo = null;

  // --- Dynamic Scaling for Preview ---
  // The canvas is strictly 1080px or 1240px wide for high-res export.
  // We use CSS transform scale() so it fits visually in the editor.
  function scaleCanvas() {
    const wrapperWidth = wrapper.clientWidth;
    const wrapperHeight = wrapper.clientHeight;
    
    // Canvas actual pixel dimensions based on class
    let canvasW = 1080;
    let canvasH = 1080;
    if (currentSize === 'size-story') { canvasW = 1080; canvasH = 1920; }
    if (currentSize === 'size-a4') { canvasW = 1240; canvasH = 1754; }

    const scaleX = (wrapperWidth * 0.9) / canvasW; // 90% of wrapper width
    const scaleY = (wrapperHeight * 0.9) / canvasH;
    const scale = Math.min(scaleX, scaleY); // fit within container

    canvas.style.transform = `scale(${scale})`;
  }

  window.addEventListener('resize', scaleCanvas);

  // --- Size Switching ---
  const sizeBtns = document.querySelectorAll('.size-btn');
  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSize = btn.dataset.size;
      canvas.className = 'poster-canvas ' + currentSize;
      scaleCanvas();
      saveData();
    });
  });

  // --- Live Binding ---
  function updatePreview() {
    outputs.name.textContent = inputs.name.value || 'Product Name';
    outputs.tagline.textContent = inputs.tagline.value || 'Catchy Tagline Here';
    outputs.price.textContent = inputs.price.value || '$99';
    
    if (inputs.oldPrice.value.trim()) {
      outputs.oldPrice.textContent = inputs.oldPrice.value;
      outputs.oldPrice.style.display = 'block';
    } else {
      outputs.oldPrice.style.display = 'none';
    }

    const featureArray = inputs.features.value.split(',').map(s => s.trim()).filter(s => s);
    if (featureArray.length > 0) {
      outputs.features.innerHTML = featureArray.map(f => `<div class="p-feature-item">${escapeHTML(f)}</div>`).join('');
    } else {
      outputs.features.innerHTML = `
        <div class="p-feature-item">Key Feature 1</div>
        <div class="p-feature-item">Key Feature 2</div>
      `;
    }

    saveData();
  }

  Object.values(inputs).forEach(input => input.addEventListener('input', updatePreview));

  // --- Color Binding ---
  function updateColors(source, type) {
    let val = source.value;
    
    // sync visual picker and text input
    if (source.type === 'color') {
      colors[type + 'Text'].value = val;
    } else {
      colors[type].value = val;
    }

    // apply to canvas CSS variables
    canvas.style.setProperty(`--p-${type}`, val);
    saveData();
  }

  ['bg', 'text', 'accent'].forEach(type => {
    colors[type].addEventListener('input', (e) => {
      themeSelect.value = 'custom';
      updateColors(e.target, type);
    });
    colors[type + 'Text'].addEventListener('input', (e) => {
      themeSelect.value = 'custom';
      updateColors(e.target, type);
    });
  });

  // --- Theme Definitions ---
  const presetThemes = {
    'theme-modern-dark': { bg: '#0f172a', text: '#ffffff', accent: '#10b981' },
    'theme-clean-light': { bg: '#f8fafc', text: '#0f172a', accent: '#2563eb' },
    'theme-vibrant-sunset': { bg: '#4c1d95', text: '#fef3c7', accent: '#f59e0b' },
    'theme-ocean-blue': { bg: '#083344', text: '#ecfeff', accent: '#06b6d4' },
    'theme-nature-green': { bg: '#064e3b', text: '#f0fdf4', accent: '#84cc16' },
    'theme-luxury-gold': { bg: '#171717', text: '#fafafa', accent: '#eab308' },
    'theme-cyberpunk': { bg: '#09090b', text: '#e879f9', accent: '#22d3ee' },
    'theme-pastel-pink': { bg: '#fdf2f8', text: '#831843', accent: '#f43f5e' },
    'theme-coffee-brown': { bg: '#451a03', text: '#ffedd5', accent: '#d97706' },
    'theme-minimal-mono': { bg: '#ffffff', text: '#000000', accent: '#52525b' },
    'theme-royal-purple': { bg: '#2e1065', text: '#f5f3ff', accent: '#a855f7' },
    'theme-cherry-red': { bg: '#7f1d1d', text: '#fef2f2', accent: '#ef4444' },
    'theme-midnight-blue': { bg: '#172554', text: '#eff6ff', accent: '#3b82f6' },
    'theme-sunny-yellow': { bg: '#fef9c3', text: '#422006', accent: '#d97706' },
    'theme-slate-grey': { bg: '#334155', text: '#f8fafc', accent: '#94a3b8' },
    'theme-mint-fresh': { bg: '#ccfbf1', text: '#134e4a', accent: '#14b8a6' },
    'theme-coral-reef': { bg: '#ffe4e6', text: '#881337', accent: '#fb7185' },
    'theme-deep-forest': { bg: '#14532d', text: '#dcfce7', accent: '#22c55e' },
    'theme-rose-gold': { bg: '#fff1f2', text: '#4c0519', accent: '#fda4af' },
    'theme-electric-cyan': { bg: '#164e63', text: '#cffafe', accent: '#06b6d4' },
    'theme-warm-autumn': { bg: '#78350f', text: '#fef3c7', accent: '#f59e0b' },
    'theme-stark-contrast': { bg: '#000000', text: '#ffffff', accent: '#ff0000' }
  };

  themeSelect.addEventListener('change', (e) => {
    const themeKey = e.target.value;
    if (themeKey !== 'custom' && presetThemes[themeKey]) {
      const t = presetThemes[themeKey];
      colors.bg.value = colors.bgText.value = t.bg;
      colors.text.value = colors.textText.value = t.text;
      colors.accent.value = colors.accentText.value = t.accent;
      
      canvas.style.setProperty('--p-bg', t.bg);
      canvas.style.setProperty('--p-text', t.text);
      canvas.style.setProperty('--p-accent', t.accent);
      
      saveData();
    }
  });

  // --- Image Upload ---
  imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        uploadedImage = event.target.result;
        outImage.src = uploadedImage;
        outImage.style.display = 'block';
        outPlaceholder.style.display = 'none';
        saveData();
      };
      reader.readAsDataURL(file);
    }
  });

  // --- Logo Upload ---
  logoUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        uploadedLogo = event.target.result;
        outLogo.src = uploadedLogo;
        outLogo.style.display = 'block';
        saveData();
      };
      reader.readAsDataURL(file);
    }
  });

  // --- Data Persistence ---
  function saveData() {
    const data = {
      size: currentSize,
      image: uploadedImage,
      logo: uploadedLogo,
      themeValue: themeSelect.value,
      colors: { bg: colors.bg.value, text: colors.text.value, accent: colors.accent.value }
    };
    Object.keys(inputs).forEach(key => data[key] = inputs[key].value);
    localStorage.setItem('poster_maker_data', JSON.stringify(data));
  }

  function loadData() {
    const saved = localStorage.getItem('poster_maker_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.size) {
          currentSize = data.size;
          canvas.className = 'poster-canvas ' + currentSize;
          sizeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.size === currentSize));
        }
        if (data.themeValue) {
          themeSelect.value = data.themeValue;
        }
        if (data.image) {
          uploadedImage = data.image;
          outImage.src = uploadedImage;
          outImage.style.display = 'block';
          outPlaceholder.style.display = 'none';
        }
        if (data.logo) {
          uploadedLogo = data.logo;
          outLogo.src = uploadedLogo;
          outLogo.style.display = 'block';
        }
        if (data.colors) {
          colors.bg.value = colors.bgText.value = data.colors.bg;
          colors.text.value = colors.textText.value = data.colors.text;
          colors.accent.value = colors.accentText.value = data.colors.accent;
          canvas.style.setProperty('--p-bg', data.colors.bg);
          canvas.style.setProperty('--p-text', data.colors.text);
          canvas.style.setProperty('--p-accent', data.colors.accent);
        }
        Object.keys(inputs).forEach(key => {
          if (data[key] !== undefined) inputs[key].value = data[key];
        });
      } catch(e) {}
    }
    updatePreview();
    // setTimeout to ensure layout is computed before scaling
    setTimeout(scaleCanvas, 50);
  }

  // --- Actions ---
  document.getElementById('load-sample-btn').addEventListener('click', () => {
    inputs.name.value = 'SonicPro Max';
    inputs.tagline.value = 'Pure Silence. Pure Sound.';
    inputs.price.value = '$249';
    inputs.oldPrice.value = '$349';
    inputs.features.value = 'Active Noise Cancelling, 40-Hour Battery Life, Bluetooth 5.3, Spatial Audio Support';
    
    colors.bg.value = colors.bgText.value = '#111827';
    colors.text.value = colors.textText.value = '#ffffff';
    colors.accent.value = colors.accentText.value = '#8b5cf6';
    canvas.style.setProperty('--p-bg', '#111827');
    canvas.style.setProperty('--p-text', '#ffffff');
    canvas.style.setProperty('--p-accent', '#8b5cf6');
    
    updatePreview();
  });

  // Export to PNG using html2canvas
  document.getElementById('download-img-btn').addEventListener('click', () => {
    if (typeof html2canvas === 'undefined') {
      alert("Image rendering library is still loading. Please try again in a moment.");
      return;
    }

    const btn = document.getElementById('download-img-btn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = 'Generating...';
    btn.disabled = true;

    // html2canvas requires the element to be at scale(1) to capture correctly in some cases.
    // So we temporarily remove the transform, render, and restore it.
    const originalTransform = canvas.style.transform;
    canvas.style.transform = 'none';
    
    // We also need to ensure the container isn't cutting it off during render
    const originalOverflow = wrapper.style.overflow;
    wrapper.style.overflow = 'visible';

    html2canvas(canvas, {
      scale: 1, // we already designed it at high-res (1080px+)
      useCORS: true,
      backgroundColor: colors.bg.value
    }).then(renderedCanvas => {
      // Restore view
      canvas.style.transform = originalTransform;
      wrapper.style.overflow = originalOverflow;

      // Create download link
      const link = document.createElement('a');
      link.download = `Poster_${inputs.name.value.replace(/\s+/g, '_') || 'Design'}.png`;
      link.href = renderedCanvas.toDataURL('image/png');
      link.click();

      btn.innerHTML = originalHTML;
      btn.disabled = false;
    }).catch(err => {
      console.error(err);
      canvas.style.transform = originalTransform;
      wrapper.style.overflow = originalOverflow;
      btn.innerHTML = originalHTML;
      btn.disabled = false;
      alert("An error occurred while generating the image.");
    });
  });

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // Boot
  loadData();
});