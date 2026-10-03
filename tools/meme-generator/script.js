// Meme Generator Studio - Client-side Interactive Logic

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const canvas = document.getElementById('meme-canvas');
  const ctx = canvas.getContext('2d');
  const stageWrapper = document.getElementById('stage-wrapper');

  const templateCards = document.querySelectorAll('.template-card');
  const customFileInput = document.getElementById('custom-file-input');
  const uploadCustomBtn = document.getElementById('upload-custom-btn');
  const resetPositionsBtn = document.getElementById('reset-positions-btn');

  const topTextInput = document.getElementById('top-text-input');
  const bottomTextInput = document.getElementById('bottom-text-input');
  const fontFamilySelect = document.getElementById('font-family-select');
  const fontSizeSlider = document.getElementById('font-size-slider');
  const fontSizeVal = document.getElementById('font-size-val');
  const strokeWidthSlider = document.getElementById('stroke-width-slider');
  const strokeWidthVal = document.getElementById('stroke-width-val');
  const textFillColor = document.getElementById('text-fill-color');
  const textStrokeColor = document.getElementById('text-stroke-color');
  const btnUppercase = document.getElementById('btn-uppercase');
  const btnAlignCenter = document.getElementById('btn-align-center');

  const downloadBtn = document.getElementById('download-btn');
  const clipboardBtn = document.getElementById('clipboard-btn');
  const toast = document.getElementById('toast');

  // Application State
  let currentImage = null; // Image or Canvas
  let currentImageWidth = 800;
  let currentImageHeight = 800;
  let isUppercase = true;
  let isCustomUpload = false;
  let activeTemplateId = 'distracted-boyfriend';

  // Draggable Text State
  const textState = {
    top: {
      x: 400,
      y: 70,
      width: 0,
      height: 0,
      isHovered: false,
    },
    bottom: {
      x: 400,
      y: 730,
      width: 0,
      height: 0,
      isHovered: false,
    },
  };

  let dragTarget = null; // 'top' | 'bottom' | null
  let dragOffset = { x: 0, y: 0 };

  // Toast Helper
  function showToast(message, isSuccess = true) {
    if (!toast) return;
    toast.textContent = message;
    toast.className = `meme-toast show ${isSuccess ? 'success' : ''}`;
    setTimeout(() => {
      toast.className = 'meme-toast';
    }, 2800);
  }

  // --- TEMPLATE GENERATORS (Vector SVGs rendered to Canvas) ---
  const templateCache = {};

  const TEMPLATE_DEFAULTS = {
    'distracted-boyfriend': {
      top: 'NEW JAVASCRIPT FRAMEWORK',
      bottom: 'MY EXISTING SOLID CODEBASE',
    },
    drake: {
      top: 'WRITING BUGS IN PRODUCTION',
      bottom: 'CALLING THEM UNANNOUNCED FEATURES',
    },
    'two-buttons': {
      top: 'FIX SIMPLE BUG IN 5 MINS',
      bottom: 'REWRITE THE ENTIRE BACKEND',
    },
    'woman-cat': {
      top: 'YOU PROMISED TO TEST BEFORE MERGING!',
      bottom: 'GIT PUSH --FORCE ORIGIN MAIN',
    },
    'expanding-brain': {
      top: 'GALAXY BRAIN ARCHITECTURE',
      bottom: 'RUNNING EVERYTHING IN ONE SCRIPT',
    },
    'success-kid': {
      top: 'COMPILED WITHOUT WARNINGS',
      bottom: 'ON THE VERY FIRST TRY',
    },
    doge: {
      top: 'MUCH CODE. VERY FRONTEND.',
      bottom: 'SUCH PERFORMANCE. WOW.',
    },
    'roll-safe': {
      top: "CAN'T HAVE RUNTIME ERRORS",
      bottom: "IF THE CODE DOESN'T COMPILE",
    },
  };

  // Generate SVGs for the 8 classic templates
  function getTemplateSvg(id) {
    switch (id) {
      case 'distracted-boyfriend':
        return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
          <defs>
            <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#475569"/>
              <stop offset="100%" stop-color="#1e293b"/>
            </linearGradient>
            <linearGradient id="redDress" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#ef4444"/>
              <stop offset="100%" stop-color="#991b1b"/>
            </linearGradient>
          </defs>
          <rect width="800" height="600" fill="url(#bg)"/>
          <!-- Street background -->
          <rect y="420" width="800" height="180" fill="#334155"/>
          <line x1="0" y1="420" x2="800" y2="420" stroke="#64748b" stroke-width="4"/>
          <!-- Girl in Red (Left) -->
          <g transform="translate(160, 220)">
            <ellipse cx="40" cy="190" rx="35" ry="110" fill="url(#redDress)"/>
            <circle cx="40" cy="50" r="32" fill="#fed7aa"/>
            <path d="M15,45 Q40,10 65,45 Q70,90 20,85 Z" fill="#78350f"/>
            <path d="M40,290 L25,380 M40,290 L55,380" stroke="#fed7aa" stroke-width="12" stroke-linecap="round"/>
          </g>
          <!-- Distracted Guy (Center) -->
          <g transform="translate(390, 190)">
            <!-- Head turned left -->
            <rect x="0" y="90" width="80" height="140" rx="15" fill="#3b82f6"/>
            <!-- Plaid shirt lines -->
            <path d="M0,130 L80,130 M0,170 L80,170 M40,90 L40,230" stroke="#1d4ed8" stroke-width="4"/>
            <circle cx="20" cy="45" r="34" fill="#fed7aa"/>
            <path d="M-10,40 Q20,10 50,30 Q45,10 0,15 Z" fill="#451a03"/>
            <!-- Gazing eye -->
            <circle cx="5" cy="42" r="5" fill="#000"/>
            <circle cx="3" cy="40" r="1.5" fill="#fff"/>
            <!-- Legs -->
            <path d="M20,230 L10,390 M60,230 L70,390" stroke="#1e293b" stroke-width="16" stroke-linecap="round"/>
          </g>
          <!-- Girlfriend (Right) looking angry -->
          <g transform="translate(580, 210)">
            <rect x="20" y="80" width="70" height="130" rx="15" fill="#06b6d4"/>
            <circle cx="55" cy="40" r="32" fill="#fed7aa"/>
            <!-- Long hair -->
            <path d="M25,35 Q55,0 85,35 Q95,120 75,130 Q45,70 25,120 Z" fill="#78350f"/>
            <!-- Angry eyebrow and eyes looking left -->
            <path d="M38,36 L50,42" stroke="#451a03" stroke-width="3"/>
            <circle cx="44" cy="44" r="4" fill="#000"/>
            <!-- Arm reaching out -->
            <path d="M20,110 L-40,100" stroke="#06b6d4" stroke-width="14" stroke-linecap="round"/>
            <circle cx="-45" cy="100" r="9" fill="#fed7aa"/>
            <path d="M40,210 L35,380 M70,210 L75,380" stroke="#1e293b" stroke-width="14" stroke-linecap="round"/>
          </g>
        </svg>`;

      case 'drake':
        return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
          <rect width="800" height="800" fill="#f8fafc"/>
          <line x1="0" y1="400" x2="800" y2="400" stroke="#cbd5e1" stroke-width="6"/>
          <line x1="400" y1="0" x2="400" y2="800" stroke="#cbd5e1" stroke-width="6"/>
          <!-- Top Left Panel: Disgusted / Hand Up -->
          <rect x="0" y="0" width="400" height="400" fill="#fed7aa"/>
          <g transform="translate(180, 160)">
            <circle cx="0" cy="0" r="70" fill="#d97706"/>
            <!-- Beard -->
            <path d="M-60,-10 Q0,85 60,-10 Q30,75 -30,75 Z" fill="#451a03"/>
            <!-- Closed eyes / turning away -->
            <path d="M-40,-15 Q-25,-25 -10,-15" stroke="#451a03" stroke-width="5" fill="none"/>
            <path d="M10,-15 Q25,-25 40,-15" stroke="#451a03" stroke-width="5" fill="none"/>
            <!-- Orange Puffy Jacket -->
            <path d="M-130,80 Q0,40 130,80 L140,240 L-140,240 Z" fill="#ea580c"/>
            <!-- Hand Up (Disapproval) -->
            <rect x="-170" y="40" width="45" height="70" rx="15" transform="rotate(-25)" fill="#d97706"/>
          </g>
          <!-- Bottom Left Panel: Approving / Pointing -->
          <rect x="0" y="400" width="400" height="400" fill="#fed7aa"/>
          <g transform="translate(180, 560)">
            <circle cx="0" cy="0" r="70" fill="#d97706"/>
            <path d="M-60,-10 Q0,85 60,-10 Q30,75 -30,75 Z" fill="#451a03"/>
            <!-- Smiling Eyes -->
            <path d="M-40,-15 Q-25,-30 -10,-15" stroke="#451a03" stroke-width="5" fill="none"/>
            <path d="M10,-15 Q25,-30 40,-15" stroke="#451a03" stroke-width="5" fill="none"/>
            <path d="M-20,15 Q0,30 20,15" stroke="#451a03" stroke-width="4" fill="none"/>
            <!-- Orange Jacket -->
            <path d="M-130,80 Q0,40 130,80 L140,240 L-140,240 Z" fill="#ea580c"/>
            <!-- Pointing Finger Right -->
            <path d="M90,70 L180,50 L180,75 L90,95 Z" fill="#d97706"/>
          </g>
        </svg>`;

      case 'two-buttons':
        return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="700" viewBox="0 0 800 700">
          <rect width="800" height="700" fill="#e2e8f0"/>
          <!-- Control Panel Box -->
          <rect x="100" y="50" width="600" height="260" rx="16" fill="#475569"/>
          <!-- Red Button 1 -->
          <ellipse cx="260" cy="180" rx="90" ry="60" fill="#dc2626"/>
          <ellipse cx="260" cy="170" rx="80" ry="50" fill="#ef4444"/>
          <!-- Red Button 2 -->
          <ellipse cx="540" cy="180" rx="90" ry="60" fill="#dc2626"/>
          <ellipse cx="540" cy="170" rx="80" ry="50" fill="#ef4444"/>
          <!-- Character Sweating -->
          <g transform="translate(400, 520)">
            <!-- Torso in Blue Shirt -->
            <ellipse cx="0" cy="140" rx="180" ry="120" fill="#2563eb"/>
            <!-- Sweating Guy Head -->
            <ellipse cx="0" cy="0" rx="100" ry="110" fill="#fed7aa"/>
            <!-- Anxious Eyes -->
            <circle cx="-35" cy="-15" r="16" fill="#fff"/>
            <circle cx="-35" cy="-15" r="7" fill="#000"/>
            <circle cx="35" cy="-15" r="16" fill="#fff"/>
            <circle cx="35" cy="-15" r="7" fill="#000"/>
            <!-- Stressed Brows -->
            <path d="M-60,-45 L-15,-30 M60,-45 L15,-30" stroke="#78350f" stroke-width="6"/>
            <!-- Sweat Drops -->
            <path d="M70,-50 Q90,-20 70,0 Q50,-20 70,-50 Z" fill="#38bdf8"/>
            <path d="M-80,-20 Q-60,0 -80,20 Q-100,0 -80,-20 Z" fill="#38bdf8"/>
            <!-- Towel in Hand -->
            <circle cx="110" cy="30" r="35" fill="#f8fafc"/>
          </g>
        </svg>`;

      case 'woman-cat':
        return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
          <rect width="800" height="500" fill="#0f172a"/>
          <line x1="400" y1="0" x2="400" y2="500" stroke="#334155" stroke-width="4"/>
          <!-- Left: Yelling Woman -->
          <rect x="0" y="0" width="400" height="500" fill="#1e293b"/>
          <g transform="translate(180, 240)">
            <circle cx="0" cy="0" r="75" fill="#fde047"/>
            <circle cx="0" cy="10" r="60" fill="#fed7aa"/>
            <!-- Screaming Open Mouth -->
            <ellipse cx="-15" cy="35" rx="25" ry="18" fill="#7f1d1d"/>
            <!-- Pointing Arm and Finger -->
            <path d="M30,70 L210,0 L205,-15 L25,45 Z" fill="#fed7aa"/>
          </g>
          <!-- Right: Confused Smug White Cat at Table -->
          <rect x="400" y="0" width="400" height="500" fill="#334155"/>
          <!-- Table & Salad Plate -->
          <rect x="400" y="360" width="400" height="140" fill="#64748b"/>
          <ellipse cx="600" cy="380" rx="90" ry="25" fill="#f8fafc"/>
          <ellipse cx="600" cy="378" rx="65" ry="18" fill="#22c55e"/>
          <!-- White Cat Head -->
          <g transform="translate(600, 240)">
            <!-- Cat Ears -->
            <polygon points="-70,-40 -50,-120 0,-50" fill="#f8fafc"/>
            <polygon points="-60,-45 -45,-105 -5,-55" fill="#fda4af"/>
            <polygon points="70,-40 50,-120 0,-50" fill="#f8fafc"/>
            <polygon points="60,-45 45,-105 5,-55" fill="#fda4af"/>
            <!-- Head -->
            <circle cx="0" cy="0" r="75" fill="#ffffff"/>
            <!-- Confused Slanted Eyes -->
            <ellipse cx="-30" cy="-10" rx="15" ry="8" fill="#facc15"/>
            <circle cx="-30" cy="-10" r="4" fill="#000"/>
            <ellipse cx="30" cy="-10" rx="15" ry="8" fill="#facc15"/>
            <circle cx="30" cy="-10" r="4" fill="#000"/>
            <!-- Nose & Whiskers -->
            <polygon points="0,10 -8,18 8,18" fill="#fda4af"/>
            <line x1="-30" y1="20" x2="-80" y2="15" stroke="#cbd5e1" stroke-width="2"/>
            <line x1="-30" y1="25" x2="-80" y2="30" stroke="#cbd5e1" stroke-width="2"/>
            <line x1="30" y1="20" x2="80" y2="15" stroke="#cbd5e1" stroke-width="2"/>
            <line x1="30" y1="25" x2="80" y2="30" stroke="#cbd5e1" stroke-width="2"/>
          </g>
        </svg>`;

      case 'expanding-brain':
        return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
          <rect width="800" height="800" fill="#090d16"/>
          <!-- 4 Tiers -->
          <line x1="0" y1="200" x2="800" y2="200" stroke="#1e293b" stroke-width="3"/>
          <line x1="0" y1="400" x2="800" y2="400" stroke="#1e293b" stroke-width="3"/>
          <line x1="0" y1="600" x2="800" y2="600" stroke="#1e293b" stroke-width="3"/>
          <line x1="450" y1="0" x2="450" y2="800" stroke="#1e293b" stroke-width="3"/>
          <!-- Level 1: Small regular brain -->
          <g transform="translate(620, 100)">
            <ellipse cx="0" cy="0" rx="60" ry="45" fill="#fda4af"/>
            <path d="M-40,0 Q0,-30 40,0 Q0,30 -40,0" stroke="#e11d48" stroke-width="3" fill="none"/>
          </g>
          <!-- Level 2: Glowing synapses -->
          <g transform="translate(620, 300)">
            <ellipse cx="0" cy="0" rx="65" ry="50" fill="#f43f5e"/>
            <circle cx="0" cy="0" r="75" fill="none" stroke="#fb7185" stroke-width="3" stroke-dasharray="6,4"/>
            <path d="M-50,0 Q0,-40 50,0 Q0,40 -50,0" stroke="#ffe4e6" stroke-width="4" fill="none"/>
          </g>
          <!-- Level 3: Radiant energy brain -->
          <g transform="translate(620, 500)">
            <circle cx="0" cy="0" r="85" fill="#0284c7" fill-opacity="0.3"/>
            <ellipse cx="0" cy="0" rx="70" ry="55" fill="#38bdf8"/>
            <path d="M-80,-60 L80,60 M-80,60 L80,-60 M0,-90 L0,90" stroke="#e0f2fe" stroke-width="3"/>
          </g>
          <!-- Level 4: Cosmic Omniscient Galaxy Brain -->
          <g transform="translate(620, 700)">
            <circle cx="0" cy="0" r="95" fill="#7c3aed" fill-opacity="0.5"/>
            <circle cx="0" cy="0" r="65" fill="#c084fc"/>
            <circle cx="0" cy="0" r="30" fill="#ffffff"/>
            <!-- Starlight burst -->
            <path d="M-100,0 L100,0 M0,-100 L0,100 M-70,-70 L70,70 M-70,70 L70,-70" stroke="#fdf4ff" stroke-width="4"/>
          </g>
        </svg>`;

      case 'success-kid':
        return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
          <defs>
            <linearGradient id="beach" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#38bdf8"/>
              <stop offset="50%" stop-color="#bae6fd"/>
              <stop offset="51%" stop-color="#fef08a"/>
              <stop offset="100%" stop-color="#ca8a04"/>
            </linearGradient>
          </defs>
          <rect width="800" height="800" fill="url(#beach)"/>
          <!-- Baby Head & Torso -->
          <g transform="translate(400, 480)">
            <!-- Green & White Shirt -->
            <ellipse cx="0" cy="200" rx="220" ry="140" fill="#15803d"/>
            <ellipse cx="0" cy="180" rx="140" ry="80" fill="#f8fafc"/>
            <!-- Face -->
            <circle cx="0" cy="0" r="160" fill="#fed7aa"/>
            <!-- Cheeks -->
            <circle cx="-90" cy="30" r="40" fill="#fca5a5" fill-opacity="0.5"/>
            <circle cx="90" cy="30" r="40" fill="#fca5a5" fill-opacity="0.5"/>
            <!-- Determined Eyes -->
            <ellipse cx="-45" cy="-20" rx="20" ry="12" fill="#451a03"/>
            <circle cx="-42" cy="-22" r="5" fill="#fff"/>
            <ellipse cx="45" cy="-20" rx="20" ry="12" fill="#451a03"/>
            <circle cx="48" cy="-22" r="5" fill="#fff"/>
            <!-- Determined pursed mouth -->
            <path d="M-40,65 Q0,45 40,65" stroke="#78350f" stroke-width="8" stroke-linecap="round" fill="none"/>
            <!-- Clenched Fist in Front -->
            <g transform="translate(-140, 100)">
              <circle cx="0" cy="0" r="60" fill="#fed7aa"/>
              <circle cx="0" cy="0" r="60" stroke="#f59e0b" stroke-width="4" fill="none"/>
              <!-- Sand on fist -->
              <circle cx="-15" cy="-10" r="6" fill="#b45309"/>
              <circle cx="10" cy="15" r="5" fill="#b45309"/>
              <circle cx="15" cy="-15" r="7" fill="#b45309"/>
            </g>
          </g>
        </svg>`;

      case 'doge':
        return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
          <defs>
            <radialGradient id="dogeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#fef08a"/>
              <stop offset="70%" stop-color="#f59e0b"/>
              <stop offset="100%" stop-color="#b45309"/>
            </radialGradient>
          </defs>
          <rect width="800" height="800" fill="url(#dogeGlow)"/>
          <!-- Doge Head -->
          <g transform="translate(400, 440)">
            <!-- Ears -->
            <polygon points="-160,-120 -110,-280 -40,-150" fill="#d97706"/>
            <polygon points="-140,-130 -105,-240 -60,-150" fill="#fed7aa"/>
            <polygon points="160,-120 110,-280 40,-150" fill="#d97706"/>
            <polygon points="140,-130 105,-240 60,-150" fill="#fed7aa"/>
            <!-- Head Fur -->
            <ellipse cx="0" cy="0" rx="190" ry="180" fill="#fde68a"/>
            <!-- White Muzzle -->
            <ellipse cx="0" cy="70" rx="100" ry="85" fill="#fffbeb"/>
            <!-- Black Nose -->
            <polygon points="0,25 -25,50 25,50" fill="#1c1917"/>
            <!-- Sideways Glance Eyes -->
            <ellipse cx="-65" cy="-30" rx="28" ry="24" fill="#ffffff"/>
            <circle cx="-55" cy="-32" r="14" fill="#451a03"/>
            <circle cx="-50" cy="-36" r="4" fill="#ffffff"/>
            <ellipse cx="65" cy="-30" rx="28" ry="24" fill="#ffffff"/>
            <circle cx="75" cy="-32" r="14" fill="#451a03"/>
            <circle cx="80" cy="-36" r="4" fill="#ffffff"/>
            <!-- Raised Brow Lines -->
            <path d="M-95,-70 Q-65,-90 -35,-70" stroke="#b45309" stroke-width="5" fill="none"/>
            <path d="M35,-70 Q65,-90 95,-70" stroke="#b45309" stroke-width="5" fill="none"/>
          </g>
          <!-- Comic Doge phrases embedded as ambient text -->
          <text x="120" y="200" font-family="'Comic Sans MS', cursive" font-weight="bold" font-size="34" fill="#ec4899">much wow</text>
          <text x="600" y="260" font-family="'Comic Sans MS', cursive" font-weight="bold" font-size="36" fill="#3b82f6">so meme</text>
          <text x="140" y="700" font-family="'Comic Sans MS', cursive" font-weight="bold" font-size="32" fill="#10b981">very generator</text>
        </svg>`;

      case 'roll-safe':
      default:
        return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
          <defs>
            <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#334155"/>
              <stop offset="100%" stop-color="#0f172a"/>
            </linearGradient>
          </defs>
          <rect width="800" height="800" fill="url(#wall)"/>
          <!-- Man Tapping Head -->
          <g transform="translate(400, 430)">
            <!-- Leather Jacket -->
            <path d="M-220,240 L-140,80 Q0,40 140,80 L220,240 Z" fill="#18181b"/>
            <!-- Gold Chain -->
            <path d="M-60,90 Q0,160 60,90" stroke="#eab308" stroke-width="8" fill="none"/>
            <!-- Head -->
            <circle cx="0" cy="-20" r="140" fill="#78350f"/>
            <!-- Hairline / Short Afro -->
            <path d="M-135,-30 Q0,-180 135,-30 Z" fill="#1c1917"/>
            <!-- Smug Smile -->
            <path d="M-40,45 Q0,75 50,35" stroke="#451a03" stroke-width="6" stroke-linecap="round" fill="none"/>
            <!-- Knowing Eyes -->
            <ellipse cx="-45" cy="-25" rx="16" ry="10" fill="#451a03"/>
            <circle cx="-42" cy="-27" r="4" fill="#fff"/>
            <ellipse cx="45" cy="-25" rx="16" ry="10" fill="#451a03"/>
            <circle cx="48" cy="-27" r="4" fill="#fff"/>
            <!-- Arm & Finger Tapping Temple -->
            <g transform="translate(130, -50)">
              <!-- Forearm -->
              <path d="M80,180 L30,40 L-20,0" stroke="#78350f" stroke-width="36" stroke-linecap="round" fill="none"/>
              <!-- Finger tapping head -->
              <circle cx="-35" cy="-10" r="18" fill="#78350f"/>
              <!-- Motion lines / "Think" tap -->
              <path d="M-60,-35 L-75,-50 M-45,-45 L-55,-65 M-30,-45 L-30,-70" stroke="#facc15" stroke-width="4" stroke-linecap="round"/>
            </g>
          </g>
        </svg>`;
    }
  }

  // Pre-render Template Thumbnails & Images
  function initTemplates() {
    templateCards.forEach((card) => {
      const id = card.getAttribute('data-id');
      const thumbCanvas = document.getElementById(`thumb-${id}`);
      const svgStr = getTemplateSvg(id);
      const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const img = new Image();
      img.onload = () => {
        templateCache[id] = img;
        if (thumbCanvas) {
          const tCtx = thumbCanvas.getContext('2d');
          tCtx.drawImage(img, 0, 0, thumbCanvas.width, thumbCanvas.height);
        }
        // If this is the active initial template, render stage!
        if (id === activeTemplateId && !currentImage) {
          selectTemplate(id);
        }
      };
      img.src = url;

      card.addEventListener('click', () => {
        selectTemplate(id);
      });
    });
  }

  // Select Template
  function selectTemplate(id) {
    activeTemplateId = id;
    isCustomUpload = false;

    templateCards.forEach((c) => {
      c.classList.toggle('active', c.getAttribute('data-id') === id);
    });

    const img = templateCache[id];
    if (img) {
      currentImage = img;
      currentImageWidth = img.naturalWidth || 800;
      currentImageHeight = img.naturalHeight || 600;

      // Populate default captions if empty or switching presets
      const defaults = TEMPLATE_DEFAULTS[id] || { top: 'TOP TEXT', bottom: 'BOTTOM TEXT' };
      topTextInput.value = defaults.top;
      bottomTextInput.value = defaults.bottom;

      resetTextPositions();
      render();
    }
  }

  // Reset Text Positions
  function resetTextPositions() {
    textState.top.x = currentImageWidth / 2;
    textState.top.y = Math.round(currentImageHeight * 0.12);

    textState.bottom.x = currentImageWidth / 2;
    textState.bottom.y = Math.round(currentImageHeight * 0.88);
  }

  resetPositionsBtn.addEventListener('click', () => {
    resetTextPositions();
    render();
    showToast('Text positions reset.');
  });

  // Load Custom User Image
  function loadCustomImage(file) {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        currentImage = img;
        currentImageWidth = img.naturalWidth;
        currentImageHeight = img.naturalHeight;
        isCustomUpload = true;

        templateCards.forEach((c) => c.classList.remove('active'));
        resetTextPositions();
        render();
        showToast('Custom photo loaded.');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  uploadCustomBtn.addEventListener('click', () => customFileInput.click());
  customFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      loadCustomImage(e.target.files[0]);
    }
  });

  // Stage Drag & Drop
  ['dragenter', 'dragover'].forEach((eventName) => {
    stageWrapper.addEventListener(eventName, (e) => {
      e.preventDefault();
      stageWrapper.style.borderColor = 'var(--accent)';
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    stageWrapper.addEventListener(eventName, (e) => {
      e.preventDefault();
      stageWrapper.style.borderColor = 'var(--border)';
    });
  });

  stageWrapper.addEventListener('drop', (e) => {
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      loadCustomImage(e.dataTransfer.files[0]);
    }
  });

  // Multi-line Text Splitting & Auto-wrapping
  function getWrappedLines(text, maxLineWidth, fontSetting) {
    if (!text) return [];

    ctx.save();
    ctx.font = fontSetting;

    const rawLines = text.split('\n');
    const resultLines = [];

    for (const rawLine of rawLines) {
      if (!rawLine.trim()) {
        resultLines.push('');
        continue;
      }

      const words = rawLine.split(' ');
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const testLine = `${currentLine} ${word}`;
        if (ctx.measureText(testLine).width <= maxLineWidth) {
          currentLine = testLine;
        } else {
          resultLines.push(currentLine);
          currentLine = word;
        }
      }
      resultLines.push(currentLine);
    }

    ctx.restore();
    return resultLines;
  }

  // Draw Text Block and calculate its bounding box
  function drawTextBlock(text, posState, fontSize, strokeWidth, fillColor, strokeColor, fontSetting) {
    if (!text) {
      posState.width = 0;
      posState.height = 0;
      return;
    }

    const processedText = isUppercase ? text.toUpperCase() : text;
    const maxWrapWidth = Math.max(200, currentImageWidth - 60);
    const lines = getWrappedLines(processedText, maxWrapWidth, fontSetting);

    if (lines.length === 0) return;

    ctx.save();
    ctx.font = fontSetting;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;

    const lineHeight = fontSize * 1.15;
    const totalBlockHeight = lines.length * lineHeight;
    let maxLineW = 0;

    lines.forEach((line) => {
      const w = ctx.measureText(line).width;
      if (w > maxLineW) maxLineW = w;
    });

    posState.width = maxLineW + strokeWidth * 2 + 20;
    posState.height = totalBlockHeight + strokeWidth * 2 + 10;

    // Draw lines centered around posState.y
    const startY = posState.y - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, idx) => {
      const lineY = startY + idx * lineHeight;

      if (strokeWidth > 0) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth * 2;
        ctx.strokeText(line, posState.x, lineY);
      }

      ctx.fillStyle = fillColor;
      ctx.fillText(line, posState.x, lineY);
    });

    // If hovered or dragged, draw subtle bounding box
    if (posState.isHovered || dragTarget) {
      const boxX = posState.x - posState.width / 2;
      const boxY = posState.y - posState.height / 2;

      ctx.strokeStyle = dragTarget ? '#4e85bf' : 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(boxX, boxY, posState.width, posState.height);
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  // Render Whole Canvas
  function render() {
    if (!currentImage) return;

    canvas.width = currentImageWidth;
    canvas.height = currentImageHeight;

    // 1. Draw Image
    ctx.drawImage(currentImage, 0, 0, currentImageWidth, currentImageHeight);

    // 2. Compute font styles
    const baseFontSize = parseInt(fontSizeSlider.value, 10) || 44;
    // Scale font size proportionally to image resolution (standard width: 800)
    const scaleFactor = Math.max(0.6, currentImageWidth / 800);
    const effectiveFontSize = Math.round(baseFontSize * scaleFactor);

    const baseStroke = parseInt(strokeWidthSlider.value, 10) || 6;
    const effectiveStroke = Math.round(baseStroke * scaleFactor);

    const fontFamily = fontFamilySelect.value;
    const fontSetting = `900 ${effectiveFontSize}px ${fontFamily}`;

    const fill = textFillColor.value;
    const stroke = textStrokeColor.value;

    // 3. Draw Top Text
    drawTextBlock(
      topTextInput.value,
      textState.top,
      effectiveFontSize,
      effectiveStroke,
      fill,
      stroke,
      fontSetting
    );

    // 4. Draw Bottom Text
    drawTextBlock(
      bottomTextInput.value,
      textState.bottom,
      effectiveFontSize,
      effectiveStroke,
      fill,
      stroke,
      fontSetting
    );
  }

  // Canvas Mouse Coordinates Helper
  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
  }

  // Hit Test Text Blocks
  function hitTestText(x, y) {
    // Check Top Text
    if (textState.top.width > 0 && textState.top.height > 0) {
      const topLeftX = textState.top.x - textState.top.width / 2;
      const topLeftY = textState.top.y - textState.top.height / 2;
      if (
        x >= topLeftX &&
        x <= topLeftX + textState.top.width &&
        y >= topLeftY &&
        y <= topLeftY + textState.top.height
      ) {
        return 'top';
      }
    }

    // Check Bottom Text
    if (textState.bottom.width > 0 && textState.bottom.height > 0) {
      const btmLeftX = textState.bottom.x - textState.bottom.width / 2;
      const btmLeftY = textState.bottom.y - textState.bottom.height / 2;
      if (
        x >= btmLeftX &&
        x <= btmLeftX + textState.bottom.width &&
        y >= btmLeftY &&
        y <= btmLeftY + textState.bottom.height
      ) {
        return 'bottom';
      }
    }

    return null;
  }

  // Interactive Dragging on Canvas
  canvas.addEventListener('pointerdown', (e) => {
    const pos = getCanvasCoords(e);
    const hit = hitTestText(pos.x, pos.y);

    if (hit) {
      dragTarget = hit;
      dragOffset = {
        x: pos.x - textState[hit].x,
        y: pos.y - textState[hit].y,
      };
      canvas.setPointerCapture(e.pointerId);
      render();
    }
  });

  canvas.addEventListener('pointermove', (e) => {
    const pos = getCanvasCoords(e);

    if (dragTarget) {
      textState[dragTarget].x = Math.round(pos.x - dragOffset.x);
      textState[dragTarget].y = Math.round(pos.y - dragOffset.y);
      render();
      return;
    }

    // Hover state feedback
    const hit = hitTestText(pos.x, pos.y);
    const wasTopHover = textState.top.isHovered;
    const wasBtmHover = textState.bottom.isHovered;

    textState.top.isHovered = hit === 'top';
    textState.bottom.isHovered = hit === 'bottom';

    if (hit) {
      canvas.style.cursor = 'grab';
    } else {
      canvas.style.cursor = 'default';
    }

    if (wasTopHover !== textState.top.isHovered || wasBtmHover !== textState.bottom.isHovered) {
      render();
    }
  });

  function endDrag(e) {
    if (dragTarget) {
      dragTarget = null;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch (_) {}
      render();
    }
  }

  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  // Form Controls Listeners
  topTextInput.addEventListener('input', render);
  bottomTextInput.addEventListener('input', render);
  fontFamilySelect.addEventListener('change', render);

  fontSizeSlider.addEventListener('input', () => {
    fontSizeVal.textContent = `${fontSizeSlider.value}px`;
    render();
  });

  strokeWidthSlider.addEventListener('input', () => {
    strokeWidthVal.textContent = `${strokeWidthSlider.value}px`;
    render();
  });

  textFillColor.addEventListener('input', render);
  textStrokeColor.addEventListener('input', render);

  btnUppercase.addEventListener('click', () => {
    isUppercase = !isUppercase;
    btnUppercase.classList.toggle('active', isUppercase);
    render();
  });

  btnAlignCenter.addEventListener('click', () => {
    textState.top.x = currentImageWidth / 2;
    textState.bottom.x = currentImageWidth / 2;
    render();
    showToast('Text centered horizontally.');
  });

  // Export to PNG Blob
  function getMemeBlob(callback) {
    // Clear hover/drag state before export
    textState.top.isHovered = false;
    textState.bottom.isHovered = false;
    dragTarget = null;
    render();

    canvas.toBlob((blob) => {
      callback(blob);
    }, 'image/png');
  }

  // Download Meme Button
  downloadBtn.addEventListener('click', () => {
    getMemeBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meme-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Meme PNG downloaded!');
    });
  });

  // Copy to Clipboard
  clipboardBtn.addEventListener('click', () => {
    getMemeBlob(async (blob) => {
      if (!blob) return;
      try {
        if (navigator.clipboard && navigator.clipboard.write) {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          showToast('Meme copied to clipboard!');
        } else {
          showToast('Clipboard API not supported in this browser.', false);
        }
      } catch (err) {
        console.error('Copy failed:', err);
        showToast('Clipboard copy failed.', false);
      }
    });
  });

  // Initialize templates on start
  initTemplates();
});