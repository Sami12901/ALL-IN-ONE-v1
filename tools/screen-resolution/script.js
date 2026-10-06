// Screen Resolution Detector - Complete Client-Side Implementation

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const viewportHeroVal = document.getElementById('viewportHeroVal');
  const viewportPhysicalVal = document.getElementById('viewportPhysicalVal');
  const aspectRatioHeroVal = document.getElementById('aspectRatioHeroVal');
  const orientationHeroVal = document.getElementById('orientationHeroVal');

  const screenOuterMock = document.getElementById('screenOuterMock');
  const viewportInnerMock = document.getElementById('viewportInnerMock');

  const viewportPxVal = document.getElementById('viewportPxVal');
  const screenResVal = document.getElementById('screenResVal');
  const availResVal = document.getElementById('availResVal');
  const dprVal = document.getElementById('dprVal');
  const dprSubVal = document.getElementById('dprSubVal');
  const orientationVal = document.getElementById('orientationVal');
  const orientationAngleVal = document.getElementById('orientationAngleVal');
  const colorDepthBitsVal = document.getElementById('colorDepthBitsVal');
  const pixelDepthBitsVal = document.getElementById('pixelDepthBitsVal');
  const aspectRatioVal = document.getElementById('aspectRatioVal');
  const aspectDecimalVal = document.getElementById('aspectDecimalVal');
  const touchVal = document.getElementById('touchVal');
  const touchSubVal = document.getElementById('touchSubVal');

  const toggleFullscreenBtn = document.getElementById('toggleFullscreenBtn');
  const copySpecsBtn = document.getElementById('copySpecsBtn');
  const devicesGrid = document.getElementById('devicesGrid');

  // Breakpoints
  const bpChips = {
    xs: document.getElementById('bp-xs'),
    sm: document.getElementById('bp-sm'),
    md: document.getElementById('bp-md'),
    lg: document.getElementById('bp-lg'),
    xl: document.getElementById('bp-xl'),
    '2xl': document.getElementById('bp-2xl')
  };

  // Device Database for Comparison
  const benchmarkDevices = [
    { name: 'iPhone 15 Pro', w: 393, h: 852, dpr: 3, category: 'Mobile' },
    { name: 'Samsung Galaxy S24', w: 412, h: 915, dpr: 3, category: 'Mobile' },
    { name: 'iPad Pro 11"', w: 834, h: 1194, dpr: 2, category: 'Tablet' },
    { name: 'MacBook Air 13"', w: 1440, h: 900, dpr: 2, category: 'Laptop' },
    { name: 'MacBook Pro 14"', w: 1512, h: 982, dpr: 2, category: 'Laptop' },
    { name: 'Full HD Monitor', w: 1920, h: 1080, dpr: 1, category: 'Desktop' },
    { name: '2K QHD Display', w: 2560, h: 1440, dpr: 1, category: 'Desktop' },
    { name: '4K Ultra HD Monitor', w: 3840, h: 2160, dpr: 1, category: 'Desktop' }
  ];

  // Aspect Ratio Calculator with GCD & Common Ratios
  function calculateAspectRatio(w, h) {
    if (!w || !h) return { label: 'N/A', decimal: '1.00' };

    function gcd(a, b) {
      return b === 0 ? a : gcd(b, a % b);
    }

    const rw = Math.round(w);
    const rh = Math.round(h);
    const divisor = gcd(rw, rh);
    const rW = rw / divisor;
    const rH = rh / divisor;
    const decimal = (rw / rh);

    const standardRatios = [
      { name: '16:9', val: 16 / 9 },
      { name: '16:10', val: 16 / 10 },
      { name: '4:3', val: 4 / 3 },
      { name: '3:2', val: 3 / 2 },
      { name: '21:9', val: 21 / 9 },
      { name: '32:9', val: 32 / 9 },
      { name: '1:1', val: 1 },
      { name: '9:16', val: 9 / 16 },
      { name: '10:16', val: 10 / 16 },
      { name: '9:19.5', val: 9 / 19.5 }
    ];

    let matched = null;
    for (const ratio of standardRatios) {
      if (Math.abs(decimal - ratio.val) < 0.035) {
        matched = ratio.name;
        break;
      }
    }

    const label = matched ? `${matched}` : `${rW}:${rH}`;
    return { label, decimal: `${decimal.toFixed(2)} : 1` };
  }

  // Update All Metrics
  function updateScreenMetrics() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const sw = window.screen.width;
    const sh = window.screen.height;
    const aw = window.screen.availWidth;
    const ah = window.screen.availHeight;
    const dpr = window.devicePixelRatio || 1;

    const pw = Math.round(vw * dpr);
    const ph = Math.round(vh * dpr);

    // Hero Header
    viewportHeroVal.textContent = `${vw} × ${vh} px`;
    viewportPhysicalVal.textContent = `Physical: ${pw} × ${ph} px (@${dpr.toFixed(1).replace(/\.0$/, '')}x scaling)`;

    const aspect = calculateAspectRatio(vw, vh);
    aspectRatioHeroVal.textContent = `${aspect.label} Ratio`;

    const isLandscape = vw >= vh;
    const orientationType = screen.orientation?.type || (isLandscape ? 'landscape-primary' : 'portrait-primary');
    const orientationAngle = screen.orientation?.angle !== undefined ? screen.orientation.angle : 0;
    orientationHeroVal.textContent = orientationType.replace('-', ' ').toUpperCase();

    // Metric Cards
    viewportPxVal.textContent = `${vw} × ${vh}`;
    screenResVal.textContent = `${sw} × ${sh}`;
    availResVal.textContent = `${aw} × ${ah}`;
    
    dprVal.textContent = `${dpr.toFixed(2).replace(/\.?0+$/, '')}×`;
    if (dpr > 2) {
      dprSubVal.textContent = 'Ultra Retina / High-Density Scale';
    } else if (dpr > 1) {
      dprSubVal.textContent = 'HiDPI / Retina Display Scale';
    } else {
      dprSubVal.textContent = 'Standard Density (1 CSS px = 1 device px)';
    }

    orientationVal.textContent = isLandscape ? 'Landscape' : 'Portrait';
    orientationAngleVal.textContent = `Type: ${orientationType} (${orientationAngle}°)`;

    const cDepth = screen.colorDepth || 24;
    const pDepth = screen.pixelDepth || 24;
    colorDepthBitsVal.textContent = `${cDepth}-bit`;
    pixelDepthBitsVal.textContent = `${Math.pow(2, Math.min(cDepth, 24)).toLocaleString()} colors (${pDepth}-bit Pixel Depth)`;

    aspectRatioVal.textContent = aspect.label;
    aspectDecimalVal.textContent = aspect.decimal;

    const maxTouchPoints = navigator.maxTouchPoints || 0;
    if (maxTouchPoints > 0) {
      touchVal.textContent = `${maxTouchPoints} Points`;
      touchSubVal.textContent = 'Touchscreen enabled';
    } else {
      touchVal.textContent = 'None';
      touchSubVal.textContent = 'Mouse / Keyboard input';
    }

    // Update Visualizer Box
    updateVisualMock(vw, vh, sw, sh);

    // Update Breakpoints
    updateBreakpoints(vw);

    // Update Device Comparison
    renderDeviceCards(vw, vh);
  }

  // Update Scale Visual Mock
  function updateVisualMock(vw, vh, sw, sh) {
    const boxWidth = 240;
    const boxHeight = 120;

    const screenRatio = sw / sh;
    let outerW, outerH;

    if (screenRatio >= (boxWidth / boxHeight)) {
      outerW = boxWidth;
      outerH = Math.max(20, Math.round(boxWidth / screenRatio));
    } else {
      outerH = boxHeight;
      outerW = Math.max(20, Math.round(boxHeight * screenRatio));
    }

    screenOuterMock.style.width = `${outerW}px`;
    screenOuterMock.style.height = `${outerH}px`;

    // Viewport inside screen
    const innerW = Math.min(outerW, Math.max(10, Math.round((vw / sw) * outerW)));
    const innerH = Math.min(outerH, Math.max(10, Math.round((vh / sh) * outerH)));

    viewportInnerMock.style.width = `${innerW}px`;
    viewportInnerMock.style.height = `${innerH}px`;
  }

  // Update Breakpoints Active State
  function updateBreakpoints(vw) {
    Object.values(bpChips).forEach(chip => {
      if (chip) chip.classList.remove('active');
    });

    if (vw < 640 && bpChips.xs) bpChips.xs.classList.add('active');
    else if (vw < 768 && bpChips.sm) bpChips.sm.classList.add('active');
    else if (vw < 1024 && bpChips.md) bpChips.md.classList.add('active');
    else if (vw < 1280 && bpChips.lg) bpChips.lg.classList.add('active');
    else if (vw < 1536 && bpChips.xl) bpChips.xl.classList.add('active');
    else if (bpChips['2xl']) bpChips['2xl'].classList.add('active');
  }

  // Render Device Comparison Cards
  function renderDeviceCards(vw, vh) {
    devicesGrid.innerHTML = '';

    benchmarkDevices.forEach(device => {
      let tagClass = 'tag-smaller';
      let tagText = 'Smaller than viewport';

      if (vw === device.w && vh === device.h) {
        tagClass = 'tag-match';
        tagText = 'Exact Match!';
      } else if (vw >= device.w && vh >= device.h) {
        tagClass = 'tag-smaller';
        tagText = 'Fits in Viewport';
      } else if (vw < device.w && vh < device.h) {
        tagClass = 'tag-larger';
        tagText = 'Larger than Viewport';
      } else {
        tagClass = 'tag-smaller';
        tagText = 'Different Proportions';
      }

      const card = document.createElement('div');
      card.className = 'device-card';
      card.innerHTML = `
        <div class="device-card-header">
          <span class="device-title">${device.name}</span>
          <span class="device-comparison-tag ${tagClass}">${tagText}</span>
        </div>
        <div class="device-spec-line">
          <span>Viewport (CSS px):</span>
          <strong>${device.w} × ${device.h}</strong>
        </div>
        <div class="device-spec-line">
          <span>Physical Resolution:</span>
          <strong>${device.w * device.dpr} × ${device.h * device.dpr} (@${device.dpr}x)</strong>
        </div>
        <div class="device-spec-line">
          <span>Category:</span>
          <span>${device.category}</span>
        </div>
      `;
      devicesGrid.appendChild(card);
    });
  }

  // Fullscreen Toggle
  toggleFullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        alert('Fullscreen request was blocked or not allowed: ' + err.message);
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  // Copy Specs
  copySpecsBtn.addEventListener('click', () => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const sw = window.screen.width;
    const sh = window.screen.height;
    const dpr = window.devicePixelRatio || 1;
    const aspect = calculateAspectRatio(vw, vh);

    const report = [
      `--- Display & Viewport Diagnostics ---`,
      `Viewport Size: ${vw} x ${vh} CSS px`,
      `Physical Resolution: ${Math.round(vw * dpr)} x ${Math.round(vh * dpr)} px`,
      `Screen Resolution: ${sw} x ${sh} px`,
      `Available Area: ${window.screen.availWidth} x ${window.screen.availHeight} px`,
      `Device Pixel Ratio: ${dpr}`,
      `Aspect Ratio: ${aspect.label} (${aspect.decimal})`,
      `Color Depth: ${screen.colorDepth}-bit`,
      `Touch Points: ${navigator.maxTouchPoints || 0}`,
      `Orientation: ${screen.orientation?.type || (vw >= vh ? 'landscape' : 'portrait')}`
    ].join('\n');

    navigator.clipboard.writeText(report).then(() => {
      copySpecsBtn.textContent = 'Copied!';
      setTimeout(() => { copySpecsBtn.textContent = 'Copy Specs'; }, 1500);
    });
  });

  // Real-time Event Listeners
  window.addEventListener('resize', updateScreenMetrics);
  window.addEventListener('orientationchange', updateScreenMetrics);
  if (screen.orientation) {
    screen.orientation.addEventListener('change', updateScreenMetrics);
  }

  // DPR change listener (e.g. moving window across monitors with different DPI)
  let dprMediaQuery = null;
  function bindDprListener() {
    if (dprMediaQuery) {
      dprMediaQuery.removeEventListener('change', onDprChange);
    }
    dprMediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
    dprMediaQuery.addEventListener('change', onDprChange);
  }

  function onDprChange() {
    updateScreenMetrics();
    bindDprListener();
  }
  bindDprListener();

  // Initial calculation
  updateScreenMetrics();
});