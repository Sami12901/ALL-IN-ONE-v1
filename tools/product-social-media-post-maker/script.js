// Social Media Post Maker Logic
document.addEventListener('DOMContentLoaded', () => {

  const inputs = {
    size: document.getElementById('inp-size'),
    theme: document.getElementById('inp-theme'),
    head: document.getElementById('inp-head'),
    sub: document.getElementById('inp-sub'),
    cta: document.getElementById('inp-cta'),
    color1: document.getElementById('inp-color1'),
    color2: document.getElementById('inp-color2'),
    img: document.getElementById('inp-img'),
    logo: document.getElementById('inp-logo')
  };

  const canvasEl = document.getElementById('post-canvas');
  const scaleWrapper = document.querySelector('.scale-wrapper');
  
  const outs = {
    head: document.getElementById('out-head'),
    sub: document.getElementById('out-sub'),
    cta: document.getElementById('out-cta'),
    img: document.getElementById('out-img'),
    logo: document.getElementById('out-logo')
  };

  const resLabel = document.getElementById('res-label');

  // --- Dynamic Layout Engine ---
  function updateCanvas() {
    // Content
    outs.head.textContent = inputs.head.value;
    outs.sub.textContent = inputs.sub.value;
    outs.cta.textContent = inputs.cta.value;

    // Theme & Size Classes
    canvasEl.className = `social-post ${inputs.theme.value} ${inputs.size.value}`;

    // Colors
    canvasEl.style.setProperty('--sp-accent', inputs.color1.value);
    canvasEl.style.setProperty('--sp-bg', inputs.color2.value);
    
    // Determine luminance of background to set text color properly if needed
    // We'll keep it simple for now, but usually black text on light bg, white on dark.
    // The CSS defaults to dark text, but in giveaway theme it's white.

    // Update Resolution Label
    let w = 1080, h = 1080;
    if (inputs.size.value === 'insta-pt') h = 1350;
    if (inputs.size.value === 'story') h = 1920;
    if (inputs.size.value === 'linkedin') { w = 1200; h = 628; }
    resLabel.textContent = `${w} x ${h} px`;

    autoScaleCanvas(w, h);
  }

  // Bind text and select inputs
  ['size', 'theme', 'head', 'sub', 'cta', 'color1', 'color2'].forEach(key => {
    inputs[key].addEventListener('input', updateCanvas);
    inputs[key].addEventListener('change', updateCanvas);
  });

  // --- Image Upload Handlers ---
  inputs.img.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      outs.img.src = url;
    }
  });

  inputs.logo.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      outs.logo.src = url;
      outs.logo.style.display = 'block';
    }
  });

  // --- Viewport Scaling ---
  // The canvas is physically 1080x1080 (or larger). We use CSS transform scale to fit it in the preview panel.
  function autoScaleCanvas(baseW, baseH) {
    const wrapper = document.querySelector('.canvas-wrapper');
    const ww = wrapper.clientWidth - 40; // padding
    const wh = wrapper.clientHeight - 40;

    const scaleX = ww / baseW;
    const scaleY = wh / baseH;
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up past 1

    scaleWrapper.style.transform = `scale(${scale})`;
    scaleWrapper.style.width = `${baseW}px`;
    scaleWrapper.style.height = `${baseH}px`;
  }

  window.addEventListener('resize', updateCanvas);
  
  // Initial render
  setTimeout(updateCanvas, 100);

  // --- HD Export (html2canvas) ---
  document.getElementById('btn-export').addEventListener('click', () => {
    const btn = document.getElementById('btn-export');
    const originalText = btn.innerText;
    btn.innerText = "Rendering HD Graphic...";
    btn.disabled = true;

    // We must temporarily remove the CSS scale transform so html2canvas captures full HD
    const currentTransform = scaleWrapper.style.transform;
    scaleWrapper.style.transform = 'scale(1)';

    html2canvas(canvasEl, {
      scale: 1, // The DOM element is already 1080px+, so scale:1 is enough
      useCORS: true,
      backgroundColor: null // inherit from css
    }).then(canvas => {
      scaleWrapper.style.transform = currentTransform; // restore scale
      
      const link = document.createElement('a');
      link.download = `social_post_${inputs.size.value}_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
      btn.innerText = originalText;
      btn.disabled = false;
    }).catch(err => {
      console.error(err);
      scaleWrapper.style.transform = currentTransform;
      btn.innerText = originalText;
      btn.disabled = false;
      alert("Error generating image.");
    });
  });

});