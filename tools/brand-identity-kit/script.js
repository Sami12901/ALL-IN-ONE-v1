document.addEventListener('DOMContentLoaded', () => {
  // Inputs
  const brandNameInput = document.getElementById('brand-name');
  const brandTaglineInput = document.getElementById('brand-tagline');
  const fontPairingSelect = document.getElementById('font-pairing');
  
  const colorPrimary = document.getElementById('color-primary');
  const colorSecondary = document.getElementById('color-secondary');
  const colorTertiary = document.getElementById('color-tertiary');
  
  const hexPrimary = document.getElementById('hex-primary');
  const hexSecondary = document.getElementById('hex-secondary');
  const hexTertiary = document.getElementById('hex-tertiary');
  
  // Preview Elements
  const previewName = document.getElementById('preview-name');
  const previewTagline = document.getElementById('preview-tagline');
  
  const swatchPrimary = document.getElementById('swatch-primary');
  const swatchSecondary = document.getElementById('swatch-secondary');
  const swatchTertiary = document.getElementById('swatch-tertiary');
  
  const detailsPrimary = document.getElementById('details-primary');
  const detailsSecondary = document.getElementById('details-secondary');
  const detailsTertiary = document.getElementById('details-tertiary');
  
  // Font Previews
  const previewFontHeadingName = document.getElementById('preview-font-heading-name');
  const previewFontHeadingSample = document.getElementById('preview-font-heading-sample');
  const previewFontHeadingChars = document.getElementById('preview-font-heading-chars');
  
  const previewFontBodyName = document.getElementById('preview-font-body-name');
  const previewFontBodySample = document.getElementById('preview-font-body-sample');
  
  const previewLogoSpace = document.getElementById('preview-logo-space');
  const bgDarkPreview = document.getElementById('bg-dark-preview');
  const textLightPreview = document.getElementById('text-light-preview');
  const bgLightPreview = document.getElementById('bg-light-preview');
  const textDarkPreview = document.getElementById('text-dark-preview');

  // Form & Buttons
  const form = document.getElementById('brand-form');
  const printBtn = document.getElementById('print-btn');

  const FONT_PAIRS = {
    classic: {
      heading: "'Playfair Display', serif",
      headingName: "Playfair Display",
      body: "'Montserrat', sans-serif",
      bodyName: "Montserrat"
    },
    modern: {
      heading: "'Montserrat', sans-serif",
      headingName: "Montserrat",
      body: "'Lato', sans-serif",
      bodyName: "Lato"
    },
    heritage: {
      heading: "'Cinzel', serif",
      headingName: "Cinzel",
      body: "'Lato', sans-serif",
      bodyName: "Lato"
    }
  };

  // Convert Hex to RGB
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Calculate contrast for text color
  function getContrastYIQ(hexcolor){
    hexcolor = hexcolor.replace("#", "");
    var r = parseInt(hexcolor.substr(0,2),16);
    var g = parseInt(hexcolor.substr(2,2),16);
    var b = parseInt(hexcolor.substr(4,2),16);
    var yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? '#1a1a1a' : '#ffffff';
  }

  function updatePreview() {
    // Text Updates
    const name = brandNameInput.value.trim() || 'BRAND NAME';
    const tagline = brandTaglineInput.value.trim() || 'TAGLINE HERE';
    
    previewName.textContent = name;
    previewTagline.textContent = tagline;
    previewLogoSpace.textContent = name;
    textLightPreview.textContent = name;
    textDarkPreview.textContent = name;

    // Typography Updates
    const pairing = FONT_PAIRS[fontPairingSelect.value];
    
    previewFontHeadingName.textContent = pairing.headingName;
    previewFontHeadingSample.style.fontFamily = pairing.heading;
    previewFontHeadingChars.style.fontFamily = pairing.heading;
    previewName.style.fontFamily = pairing.heading;
    previewLogoSpace.style.fontFamily = pairing.heading;
    textLightPreview.style.fontFamily = pairing.heading;
    textDarkPreview.style.fontFamily = pairing.heading;

    previewFontBodyName.textContent = pairing.bodyName;
    previewFontBodySample.style.fontFamily = pairing.body;
    previewTagline.style.fontFamily = pairing.body;

    // Color Updates
    const pColor = colorPrimary.value.toUpperCase();
    const sColor = colorSecondary.value.toUpperCase();
    const tColor = colorTertiary.value.toUpperCase();

    hexPrimary.textContent = pColor;
    hexSecondary.textContent = sColor;
    hexTertiary.textContent = tColor;

    swatchPrimary.style.backgroundColor = pColor;
    swatchSecondary.style.backgroundColor = sColor;
    swatchTertiary.style.backgroundColor = tColor;

    const rgbP = hexToRgb(pColor);
    const rgbS = hexToRgb(sColor);
    const rgbT = hexToRgb(tColor);

    detailsPrimary.innerHTML = `HEX: ${pColor}<br>RGB: ${rgbP.r}, ${rgbP.g}, ${rgbP.b}`;
    detailsSecondary.innerHTML = `HEX: ${sColor}<br>RGB: ${rgbS.r}, ${rgbS.g}, ${rgbS.b}`;
    detailsTertiary.innerHTML = `HEX: ${tColor}<br>RGB: ${rgbT.r}, ${rgbT.g}, ${rgbT.b}`;

    // Contrast Preview Updates
    bgDarkPreview.style.backgroundColor = pColor;
    textLightPreview.style.color = getContrastYIQ(pColor);
    
    bgLightPreview.style.backgroundColor = tColor;
    textDarkPreview.style.color = getContrastYIQ(tColor);
    
    // Preview Header Theme update
    const headerEl = document.getElementById('preview-header');
    headerEl.style.backgroundColor = tColor;
    previewName.style.color = pColor;
    previewTagline.style.color = sColor;
  }

  // Event Listeners for real-time update
  brandNameInput.addEventListener('input', updatePreview);
  brandTaglineInput.addEventListener('input', updatePreview);
  fontPairingSelect.addEventListener('change', updatePreview);
  
  colorPrimary.addEventListener('input', updatePreview);
  colorSecondary.addEventListener('input', updatePreview);
  colorTertiary.addEventListener('input', updatePreview);

  // Form Submit handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    updatePreview();
    // Scroll to preview on mobile
    if (window.innerWidth < 992) {
      document.getElementById('kit-preview').scrollIntoView({ behavior: 'smooth' });
    }
  });

  // Print function
  printBtn.addEventListener('click', () => {
    updatePreview();
    window.print();
  });

  // Initial render
  updatePreview();
});
