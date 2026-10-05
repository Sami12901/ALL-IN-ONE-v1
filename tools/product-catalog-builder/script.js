// Product Catalog Builder Client-side Logic

// High-resolution SVG Presets
const PRESET_SVGS = {
  watch: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <defs>
      <radialGradient id="case-shine" cx="40%" cy="40%" r="60%">
        <stop offset="0%" stop-color="%23d4af37" />
        <stop offset="60%" stop-color="%23996515" />
        <stop offset="100%" stop-color="%234a3600" />
      </radialGradient>
      <radialGradient id="dial-bg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="%231a2130" />
        <stop offset="85%" stop-color="%230b0f17" />
        <stop offset="100%" stop-color="%2305070a" />
      </radialGradient>
      <linearGradient id="strap-grad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="%23151515" />
        <stop offset="50%" stop-color="%232b2622" />
        <stop offset="100%" stop-color="%23151515" />
      </linearGradient>
      <linearGradient id="glass-glare" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="rgba(255,255,255,0.22)" />
        <stop offset="40%" stop-color="rgba(255,255,255,0.03)" />
        <stop offset="60%" stop-color="rgba(255,255,255,0)" />
        <stop offset="100%" stop-color="rgba(255,255,255,0.12)" />
      </linearGradient>
    </defs>
    <!-- Background backdrop -->
    <rect width="400" height="400" fill="%230a0d12"/>
    <!-- Top Strap -->
    <rect x="145" y="10" width="110" height="120" rx="8" fill="url(%23strap-grad)" />
    <line x1="152" y1="15" x2="152" y2="120" stroke="%235a4d41" stroke-dasharray="4 3" stroke-width="2"/>
    <line x1="248" y1="15" x2="248" y2="120" stroke="%235a4d41" stroke-dasharray="4 3" stroke-width="2"/>
    <!-- Bottom Strap -->
    <rect x="145" y="270" width="110" height="120" rx="8" fill="url(%23strap-grad)" />
    <line x1="152" y1="270" x2="152" y2="385" stroke="%235a4d41" stroke-dasharray="4 3" stroke-width="2"/>
    <line x1="248" y1="270" x2="248" y2="385" stroke="%235a4d41" stroke-dasharray="4 3" stroke-width="2"/>
    <!-- Case & Bezel -->
    <circle cx="200" cy="200" r="128" fill="url(%23case-shine)" />
    <circle cx="200" cy="200" r="118" fill="%2311141a" stroke="%23e6ca65" stroke-width="1.5" />
    <circle cx="200" cy="200" r="110" fill="url(%23dial-bg)" />
    <!-- Markers -->
    <circle cx="200" cy="200" r="102" fill="none" stroke="%23996515" stroke-width="0.8" stroke-dasharray="2 7"/>
    <!-- Hour Indices -->
    <g stroke="%23d4af37" stroke-width="3" stroke-linecap="round">
      <line x1="200" y1="98" x2="200" y2="112" />
      <line x1="200" y1="288" x2="200" y2="302" />
      <line x1="98" y1="200" x2="112" y2="200" />
      <line x1="288" y1="200" x2="302" y2="200" />
      <line x1="128" y1="128" x2="138" y2="138" stroke-width="2"/>
      <line x1="272" y1="128" x2="262" y2="138" stroke-width="2"/>
      <line x1="128" y1="272" x2="138" y2="262" stroke-width="2"/>
      <line x1="272" y1="272" x2="262" y2="262" stroke-width="2"/>
    </g>
    <!-- Sub-dials -->
    <circle cx="200" cy="155" r="28" fill="%230b0e14" stroke="%23554425" stroke-width="1"/>
    <circle cx="160" cy="225" r="24" fill="%230b0e14" stroke="%23554425" stroke-width="1"/>
    <circle cx="240" cy="225" r="24" fill="%230b0e14" stroke="%23554425" stroke-width="1"/>
    <!-- Crown & Pushers -->
    <rect x="325" y="190" width="12" height="20" rx="3" fill="url(%23case-shine)"/>
    <rect x="318" y="150" width="9" height="15" rx="2" fill="url(%23case-shine)"/>
    <rect x="318" y="235" width="9" height="15" rx="2" fill="url(%23case-shine)"/>
    <!-- Hands -->
    <!-- Hour Hand -->
    <line x1="200" y1="200" x2="155" y2="170" stroke="%23d4af37" stroke-width="4.5" stroke-linecap="round"/>
    <!-- Minute Hand -->
    <line x1="200" y1="200" x2="245" y2="135" stroke="%23fff" stroke-width="3" stroke-linecap="round"/>
    <!-- Chrono Second Hand -->
    <line x1="200" y1="225" x2="200" y2="105" stroke="%23e11d48" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="200" cy="200" r="5" fill="%23e11d48"/>
    <!-- Sapphire Crystal Sheen -->
    <circle cx="200" cy="200" r="110" fill="url(%23glass-glare)"/>
  </svg>`,

  headphones: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <defs>
      <linearGradient id="headband-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="%233a414d"/>
        <stop offset="50%" stop-color="%231a1e24"/>
        <stop offset="100%" stop-color="%230f1217"/>
      </linearGradient>
      <radialGradient id="cup-grad" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stop-color="%23383f4a"/>
        <stop offset="70%" stop-color="%23181c22"/>
        <stop offset="100%" stop-color="%230c0e12"/>
      </radialGradient>
    </defs>
    <rect width="400" height="400" fill="%230b0e14"/>
    <!-- Headband Arc -->
    <path d="M 90 230 C 90 85, 310 85, 310 230" fill="none" stroke="url(%23headband-grad)" stroke-width="26" stroke-linecap="round"/>
    <path d="M 120 190 C 120 105, 280 105, 280 190" fill="none" stroke="%234f5968" stroke-width="6" stroke-linecap="round"/>
    <!-- Left Fork -->
    <path d="M 90 220 L 90 270" stroke="%238fa2b8" stroke-width="8" stroke-linecap="round"/>
    <!-- Right Fork -->
    <path d="M 310 220 L 310 270" stroke="%238fa2b8" stroke-width="8" stroke-linecap="round"/>
    <!-- Left Ear Cup -->
    <ellipse cx="90" cy="275" rx="42" ry="62" fill="url(%23cup-grad)" stroke="%234b5563" stroke-width="2"/>
    <ellipse cx="90" cy="275" rx="30" ry="48" fill="%2312151a" stroke="%232b323c" stroke-width="1.5"/>
    <circle cx="90" cy="275" r="14" fill="%231f242d" stroke="%234e85bf" stroke-width="1.5"/>
    <!-- Right Ear Cup -->
    <ellipse cx="310" cy="275" rx="42" ry="62" fill="url(%23cup-grad)" stroke="%234b5563" stroke-width="2"/>
    <ellipse cx="310" cy="275" rx="30" ry="48" fill="%2312151a" stroke="%232b323c" stroke-width="1.5"/>
    <circle cx="310" cy="275" r="14" fill="%231f242d" stroke="%234e85bf" stroke-width="1.5"/>
    <!-- Audio Wave Accent -->
    <path d="M 170 290 Q 185 275 200 290 T 230 290" fill="none" stroke="%234e85bf" stroke-width="2.5" stroke-linecap="round" opacity="0.8"/>
  </svg>`,

  backpack: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <defs>
      <linearGradient id="pack-body" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="%232b2e35"/>
        <stop offset="60%" stop-color="%23181a1f"/>
        <stop offset="100%" stop-color="%230f1013"/>
      </linearGradient>
      <linearGradient id="leather-trim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="%23a47148"/>
        <stop offset="100%" stop-color="%23684120"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="%230a0d13"/>
    <!-- Top Carry Handle -->
    <path d="M 160 100 Q 200 65 240 100" fill="none" stroke="url(%23leather-trim)" stroke-width="12" stroke-linecap="round"/>
    <!-- Backpack Main Shell -->
    <path d="M 120 140 C 120 90, 280 90, 280 140 L 295 340 C 295 365, 105 365, 105 340 Z" fill="url(%23pack-body)" stroke="%233a3e47" stroke-width="2"/>
    <!-- Top Flap Contour -->
    <path d="M 125 150 Q 200 170 275 150" fill="none" stroke="%23484f5c" stroke-width="2"/>
    <!-- Front Minimalist Diagonal Zip Pocket -->
    <line x1="130" y1="210" x2="270" y2="240" stroke="%230a0a0c" stroke-width="4" stroke-linecap="round"/>
    <line x1="130" y1="210" x2="270" y2="240" stroke="%235a6375" stroke-width="1.5" stroke-dasharray="3 3"/>
    <circle cx="160" cy="216" r="4" fill="url(%23leather-trim)"/>
    <!-- Bottom Leather Base Reinforcement -->
    <path d="M 107 325 C 107 355, 293 355, 293 325 L 295 340 C 295 365, 105 365, 105 340 Z" fill="url(%23leather-trim)"/>
    <!-- Subtle Stitches & Logo Stamp -->
    <rect x="185" y="290" width="30" height="12" rx="2" fill="%231f2229" stroke="%234e85bf" stroke-width="1"/>
  </svg>`,

  serum: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <defs>
      <linearGradient id="amber-glass" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="%238d4c1d"/>
        <stop offset="25%" stop-color="%23ca732a"/>
        <stop offset="70%" stop-color="%23542907"/>
        <stop offset="100%" stop-color="%238d4c1d"/>
      </linearGradient>
      <linearGradient id="gold-collar" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="%23e8ca74"/>
        <stop offset="50%" stop-color="%23fff1b8"/>
        <stop offset="100%" stop-color="%239c7a28"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="%230d1016"/>
    <!-- Glass Bottle Reflection Glow -->
    <ellipse cx="200" cy="355" rx="80" ry="14" fill="%23ca732a" opacity="0.2"/>
    <!-- Pipette Bulb -->
    <path d="M 180 85 C 180 60, 220 60, 220 85 L 220 100 L 180 100 Z" fill="%231a1a1e" stroke="%232e2e36" stroke-width="1.5"/>
    <!-- Dropper Collar Metallic -->
    <rect x="172" y="100" width="56" height="28" rx="3" fill="url(%23gold-collar)" stroke="%235e4612" stroke-width="1"/>
    <!-- Glass Shoulder & Cylindrical Body -->
    <path d="M 180 128 L 220 128 L 245 165 L 245 340 C 245 355, 155 355, 155 340 L 155 165 Z" fill="url(%23amber-glass)" stroke="%23401d03" stroke-width="1.5"/>
    <!-- Pipette Glass Tube Inside -->
    <line x1="200" y1="128" x2="200" y2="330" stroke="rgba(255,255,255,0.4)" stroke-width="3"/>
    <!-- Luxury Label -->
    <rect x="165" y="195" width="70" height="95" rx="3" fill="%23f9f7f2" stroke="%23d6ccb8" stroke-width="1"/>
    <line x1="175" y1="215" x2="225" y2="215" stroke="%239c7a28" stroke-width="1.5"/>
    <text x="200" y="238" font-size="8" font-family="serif" text-anchor="middle" fill="%231a1a1a" font-weight="bold">LUMIÈRE</text>
    <text x="200" y="250" font-size="6" font-family="sans-serif" text-anchor="middle" fill="%23666">RENEWAL SERUM</text>
    <text x="200" y="275" font-size="6" font-family="sans-serif" text-anchor="middle" fill="%23888">30 ML / 1.0 FL OZ</text>
    <!-- Specular Highlight Strip -->
    <line x1="162" y1="175" x2="162" y2="340" stroke="rgba(255,255,255,0.4)" stroke-width="3" stroke-linecap="round"/>
  </svg>`,

  keyboard: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <defs>
      <linearGradient id="kb-case" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="%232d3440"/>
        <stop offset="100%" stop-color="%23151820"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="%230b0e14"/>
    <!-- CNC Keyboard Case -->
    <rect x="50" y="110" width="300" height="180" rx="14" fill="url(%23kb-case)" stroke="%2348556b" stroke-width="2.5"/>
    <!-- Plate Recess -->
    <rect x="62" y="122" width="276" height="156" rx="8" fill="%230c0e12" stroke="%231a1d24" stroke-width="1"/>
    <!-- Keycap Row 1 -->
    <g fill="%231e2430" stroke="%23374254" stroke-width="1" rx="3">
      <rect x="68" y="128" width="18" height="18" rx="3" fill="%23d946ef"/> <!-- ESC -->
      <rect x="90" y="128" width="18" height="18" rx="3"/>
      <rect x="112" y="128" width="18" height="18" rx="3"/>
      <rect x="134" y="128" width="18" height="18" rx="3"/>
      <rect x="156" y="128" width="18" height="18" rx="3"/>
      <rect x="178" y="128" width="18" height="18" rx="3"/>
      <rect x="200" y="128" width="18" height="18" rx="3"/>
      <rect x="222" y="128" width="18" height="18" rx="3"/>
      <rect x="244" y="128" width="18" height="18" rx="3"/>
      <rect x="266" y="128" width="18" height="18" rx="3"/>
      <rect x="288" y="128" width="18" height="18" rx="3"/>
      <rect x="310" y="128" width="22" height="18" rx="3" fill="%234e85bf"/> <!-- DEL -->
    </g>
    <!-- Keycap Row 2 -->
    <g fill="%23242b38" stroke="%233a4659" stroke-width="1">
      <rect x="68" y="152" width="24" height="18" rx="3"/>
      <rect x="96" y="152" width="18" height="18" rx="3"/>
      <rect x="118" y="152" width="18" height="18" rx="3"/>
      <rect x="140" y="152" width="18" height="18" rx="3"/>
      <rect x="162" y="152" width="18" height="18" rx="3"/>
      <rect x="184" y="152" width="18" height="18" rx="3"/>
      <rect x="206" y="152" width="18" height="18" rx="3"/>
      <rect x="228" y="152" width="18" height="18" rx="3"/>
      <rect x="250" y="152" width="18" height="18" rx="3"/>
      <rect x="272" y="152" width="18" height="18" rx="3"/>
      <rect x="294" y="152" width="38" height="18" rx="3" fill="%234e85bf"/> <!-- BACKSPACE -->
    </g>
    <!-- Keycap Row 3 -->
    <g fill="%23242b38" stroke="%233a4659" stroke-width="1">
      <rect x="68" y="176" width="30" height="18" rx="3"/>
      <rect x="102" y="176" width="18" height="18" rx="3"/>
      <rect x="124" y="176" width="18" height="18" rx="3"/>
      <rect x="146" y="176" width="18" height="18" rx="3"/>
      <rect x="168" y="176" width="18" height="18" rx="3"/>
      <rect x="190" y="176" width="18" height="18" rx="3"/>
      <rect x="212" y="176" width="18" height="18" rx="3"/>
      <rect x="234" y="176" width="18" height="18" rx="3"/>
      <rect x="256" y="176" width="18" height="18" rx="3"/>
      <rect x="278" y="176" width="54" height="18" rx="3" fill="%23e11d48"/> <!-- ENTER -->
    </g>
    <!-- Keycap Row 4 (Spacebar row) -->
    <g fill="%231e2430" stroke="%23374254" stroke-width="1">
      <rect x="68" y="200" width="28" height="18" rx="3"/>
      <rect x="100" y="200" width="22" height="18" rx="3"/>
      <rect x="126" y="200" width="22" height="18" rx="3"/>
      <rect x="152" y="200" width="110" height="18" rx="3" fill="%234e85bf"/> <!-- SPACEBAR -->
      <rect x="266" y="200" width="20" height="18" rx="3"/>
      <rect x="290" y="200" width="18" height="18" rx="3"/>
      <rect x="312" y="200" width="20" height="18" rx="3"/>
    </g>
    <!-- Rotary Encoder Knob Top-Right -->
    <circle cx="320" cy="138" r="8" fill="%23d4af37" stroke="%23996515" stroke-width="1.5"/>
  </svg>`,

  mug: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
    <defs>
      <linearGradient id="mug-stoneware" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="%2338383a"/>
        <stop offset="40%" stop-color="%2356565a"/>
        <stop offset="85%" stop-color="%23252528"/>
        <stop offset="100%" stop-color="%231c1c1e"/>
      </linearGradient>
      <linearGradient id="coffee-fill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="%233d2314"/>
        <stop offset="100%" stop-color="%231a0e08"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="%230c0f14"/>
    <!-- Steam Swirls -->
    <path d="M 180 100 Q 170 70 190 50" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 210 110 Q 225 80 205 60" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Handle -->
    <path d="M 270 160 C 330 160, 330 270, 270 270" fill="none" stroke="url(%23mug-stoneware)" stroke-width="20" stroke-linecap="round"/>
    <path d="M 270 160 C 330 160, 330 270, 270 270" fill="none" stroke="%236e6e73" stroke-width="2" stroke-linecap="round"/>
    <!-- Mug Body -->
    <path d="M 130 140 L 270 140 L 255 315 C 255 335, 145 335, 145 315 Z" fill="url(%23mug-stoneware)" stroke="%2348484a" stroke-width="2"/>
    <!-- Rim & Liquid Top -->
    <ellipse cx="200" cy="140" rx="70" ry="18" fill="url(%23mug-stoneware)" stroke="%236b7280" stroke-width="1"/>
    <ellipse cx="200" cy="142" rx="63" ry="14" fill="url(%23coffee-fill)"/>
    <ellipse cx="200" cy="143" rx="55" ry="11" fill="none" stroke="%239c6b45" stroke-width="1.2" opacity="0.6"/>
    <!-- Texture Specks -->
    <circle cx="170" cy="220" r="1.5" fill="%238b7d6b"/>
    <circle cx="225" cy="250" r="1.2" fill="%238b7d6b"/>
    <circle cx="190" cy="280" r="1.5" fill="%238b7d6b"/>
    <circle cx="210" cy="195" r="1.2" fill="%238b7d6b"/>
  </svg>`
};

// 6 Built-in Luxury Presets Data
const LUXURY_PRESETS = [
  {
    id: 'prod-watch-01',
    title: 'Chronograph Heritage 1968',
    sku: 'WTC-CHR-68',
    category: 'Horology',
    regularPrice: 2450.00,
    discountPrice: 1980.00,
    stock: 'in',
    description: 'Hand-finished Swiss automatic chronograph featuring a sapphire crystal dome, 42-hour power reserve, and surgical-grade 316L stainless steel casing with genuine calfskin strap.',
    specs: [
      '42mm Case Diameter & Double AR Sapphire Crystal',
      'Automatic Calibre 8800 Movement with 42h Reserve',
      '100m Water Resistance (10 ATM)',
      'Hand-Stitched Full Grain Calfskin Leather Band'
    ],
    image: PRESET_SVGS.watch
  },
  {
    id: 'prod-audio-02',
    title: 'Acoustic Master ANC Headphones',
    sku: 'AUD-ANC-90',
    category: 'Audio',
    regularPrice: 499.00,
    discountPrice: 399.00,
    stock: 'in',
    description: 'Reference-grade active noise-cancelling wireless headphones with 45mm beryllium drivers, memory foam lambskin earcups, and custom audiophile EQ profile.',
    specs: [
      '45mm Custom Beryllium Acoustic Drivers',
      'Hybrid Adaptive Active Noise Cancellation',
      '40-Hour Battery Life with USB-C Quick Charge',
      'Lossless Bluetooth 5.3 with LDAC & aptX HD'
    ],
    image: PRESET_SVGS.headphones
  },
  {
    id: 'prod-bag-03',
    title: 'Executive Matte Leather Daypack',
    sku: 'BAG-EXE-04',
    category: 'Leather Goods',
    regularPrice: 340.00,
    discountPrice: 295.00,
    stock: 'low',
    description: 'Minimalist ergonomic backpack crafted from full-grain vegetable-tanned Italian leather with weatherproof zippers and dedicated padded 16-inch laptop compartment.',
    specs: [
      'Full-Grain Tuscan Vegetable-Tanned Leather',
      'Dedicated Padded 16-Inch MacBook Pro Sleeve',
      'Water-Resistant YKK Excella Matte Metal Zippers',
      'Luggage Trolley Pass-Through Sleeve'
    ],
    image: PRESET_SVGS.backpack
  },
  {
    id: 'prod-skincare-04',
    title: 'Botanical Luminescence Renewal Serum',
    sku: 'SKN-LUM-22',
    category: 'Skincare',
    regularPrice: 125.00,
    discountPrice: 95.00,
    stock: 'in',
    description: 'Cellular restorative treatment infused with cold-pressed rosehip oil, 10% niacinamide complex, and bioactive botanicals to restore dermal barrier elasticity.',
    specs: [
      '30ml Frosted Amber Glass Dropper Bottle',
      '10% Triple Niacinamide & Bio-Peptide Complex',
      'Cold-Pressed Organic Rosehip & Squalane Base',
      '100% Vegan, Cruelty-Free & Dermatologist Tested'
    ],
    image: PRESET_SVGS.serum
  },
  {
    id: 'prod-kb-05',
    title: 'Custom CNC Anodized Mechanical Keyboard',
    sku: 'KB-CNC-75',
    category: 'Peripherals',
    regularPrice: 380.00,
    discountPrice: 320.00,
    stock: 'pre',
    description: 'Precision-milled 75% aluminum mechanical keyboard with gasket-mounted brass switch plate, factory-lubed linear switches, and dye-sublimated PBT keycaps.',
    specs: [
      '6063 Anodized CNC Aluminum Chassis',
      'Gasket Mount with Multi-Layer Poron Acoustic Foam',
      'Hot-Swappable 5-Pin RGB PCB & Brass Rotary Knob',
      'Double-Shot Dye-Sub PBT Cherry Profile Keycaps'
    ],
    image: PRESET_SVGS.keyboard
  },
  {
    id: 'prod-mug-06',
    title: 'Artisanal Matte Ceramic Pour-Over Mug',
    sku: 'HOM-MUG-12',
    category: 'Homeware',
    regularPrice: 48.00,
    discountPrice: 38.00,
    stock: 'in',
    description: 'Individually wheel-thrown stoneware mug coated in a velvety matte charcoal glaze with ergonomic geometric handle and heat-retaining thermal density.',
    specs: [
      '380ml / 13oz Fluid Capacity',
      'High-Fire Durable Ceramic Stoneware',
      'Ergonomic Geometric Balance Handle',
      'Microwave & Dishwasher Safe Velvety Matte Finish'
    ],
    image: PRESET_SVGS.mug
  }
];

// Currency Symbol Map
const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$',
  AUD: 'AU$',
  JPY: '¥',
  BDT: '৳',
  INR: '₹',
  CNY: '¥',
  CHF: 'CHF '
};

// Application State
class CatalogManager {
  constructor() {
    this.store = {
      name: 'LUMIÈRE ATELIER',
      tagline: 'Autumn / Winter Haute Collection & Lookbook',
      currency: 'USD',
      contact: 'atelier@lumiere.com • www.lumiere-atelier.com',
      notes: 'Net 30 wholesale terms available on select orders. Worldwide courier delivery.'
    };
    this.display = {
      layout: 'layout-3col',
      priceMode: 'both',
      showSpecs: true,
      showSku: true
    };
    this.products = JSON.parse(JSON.stringify(LUXURY_PRESETS));
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.manageSearchQuery = '';
    this.tempImageData = '';
  }

  getCurrencySymbol() {
    return CURRENCY_SYMBOLS[this.store.currency] || '$';
  }

  formatPrice(amount) {
    const sym = this.getCurrencySymbol();
    if (isNaN(amount) || amount === null || amount === '') return `${sym}0.00`;
    const num = parseFloat(amount);
    if (this.store.currency === 'JPY' || this.store.currency === 'BDT') {
      return `${sym}${Math.round(num).toLocaleString()}`;
    }
    return `${sym}${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  getCategories() {
    const cats = new Set();
    this.products.forEach(p => {
      if (p.category && p.category.trim()) cats.add(p.category.trim());
    });
    return Array.from(cats).sort();
  }

  addProduct(prod) {
    prod.id = 'prod-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    this.products.unshift(prod);
  }

  updateProduct(id, updated) {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.products[idx] = { ...this.products[idx], ...updated };
    }
  }

  deleteProduct(id) {
    this.products = this.products.filter(p => p.id !== id);
  }

  duplicateProduct(id) {
    const target = this.products.find(p => p.id === id);
    if (!target) return;
    const copy = JSON.parse(JSON.stringify(target));
    copy.id = 'prod-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    copy.title = `${copy.title} (Copy)`;
    if (copy.sku) copy.sku = `${copy.sku}-CP`;
    this.products.splice(this.products.indexOf(target) + 1, 0, copy);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const catalog = new CatalogManager();

  // DOM Elements - Top Bar & Stats
  const statProducts = document.getElementById('stat-total-products');
  const statCategories = document.getElementById('stat-total-categories');
  const statCurrency = document.getElementById('stat-currency-code');
  const btnLoadPresets = document.getElementById('btn-load-presets');
  const btnExportJson = document.getElementById('btn-export-json');
  const btnImportJson = document.getElementById('btn-import-json');
  const importJsonFile = document.getElementById('import-json-file');
  const btnExportHtml = document.getElementById('btn-export-html');
  const btnPrintPdf = document.getElementById('btn-print-pdf');

  // DOM Elements - Sidebar Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // DOM Elements - Store Settings
  const storeNameInput = document.getElementById('store-name');
  const storeTaglineInput = document.getElementById('store-tagline');
  const storeCurrencySelect = document.getElementById('store-currency');
  const storeContactInput = document.getElementById('store-contact');
  const storeNotesInput = document.getElementById('store-notes');
  const priceDisplayModeSelect = document.getElementById('price-display-mode');
  const showSpecsToggle = document.getElementById('show-specs-toggle');
  const showSkuToggle = document.getElementById('show-sku-toggle');

  // DOM Elements - Product Management List
  const productManageList = document.getElementById('product-manage-list');
  const manageSearchInput = document.getElementById('manage-search');
  const btnOpenAddModal = document.getElementById('btn-open-add-modal');

  // DOM Elements - Lookbook Preview
  const previewBrandName = document.getElementById('preview-brand-name');
  const previewBrandTagline = document.getElementById('preview-brand-tagline');
  const previewBrandContact = document.getElementById('preview-brand-contact');
  const previewFooterTerms = document.getElementById('preview-footer-terms');
  const previewDateStr = document.getElementById('preview-date-str');
  const catalogGridContainer = document.getElementById('catalog-grid-container');
  const categoryFilterBar = document.getElementById('category-filter-bar');
  const liveFilterSearch = document.getElementById('live-filter-search');
  const layoutBtns = document.querySelectorAll('.layout-btn');

  // DOM Elements - Modal Form
  const productModal = document.getElementById('product-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCancelModal = document.getElementById('btn-cancel-modal');
  const productForm = document.getElementById('product-form');
  const modalTitleText = document.getElementById('modal-title-text');
  const editProductIdInput = document.getElementById('edit-product-id');
  const formTitle = document.getElementById('form-title');
  const formSku = document.getElementById('form-sku');
  const formCategory = document.getElementById('form-category');
  const formStock = document.getElementById('form-stock');
  const formRegularPrice = document.getElementById('form-regular-price');
  const formDiscountPrice = document.getElementById('form-discount-price');
  const formDesc = document.getElementById('form-desc');
  const formSpecs = document.getElementById('form-specs');
  const formImageFile = document.getElementById('form-image-file');
  const formImageUrl = document.getElementById('form-image-url');
  const imagePreviewThumb = document.getElementById('image-preview-thumb');

  // Set Year
  if (previewDateStr) {
    previewDateStr.textContent = `${new Date().getFullYear()} Edition`;
  }

  // Toast notification helper
  function showToast(message, type = 'info') {
    const existing = document.getElementById('catalog-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'catalog-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: ${type === 'error' ? 'var(--danger, #ef4444)' : 'var(--accent, #4e85bf)'};
      color: #ffffff;
      padding: 0.75rem 1.25rem;
      border-radius: var(--radius-md, 8px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.4);
      z-index: 10000;
      font-size: 0.875rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      animation: fadeIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // Tab Navigation Handling
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  // Layout switcher sync
  function updateLayout(newLayout) {
    catalog.display.layout = newLayout;
    layoutBtns.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-layout') === newLayout);
    });
    catalogGridContainer.className = `catalog-grid ${newLayout}`;
  }

  layoutBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const lay = btn.getAttribute('data-layout');
      if (lay) updateLayout(lay);
    });
  });

  // Store Inputs Event Listeners
  storeNameInput.addEventListener('input', e => {
    catalog.store.name = e.target.value;
    previewBrandName.textContent = e.target.value || 'BRAND CATALOG';
  });

  storeTaglineInput.addEventListener('input', e => {
    catalog.store.tagline = e.target.value;
    previewBrandTagline.textContent = e.target.value;
  });

  storeContactInput.addEventListener('input', e => {
    catalog.store.contact = e.target.value;
    previewBrandContact.textContent = e.target.value;
  });

  storeNotesInput.addEventListener('input', e => {
    catalog.store.notes = e.target.value;
    previewFooterTerms.textContent = e.target.value;
  });

  storeCurrencySelect.addEventListener('change', e => {
    catalog.store.currency = e.target.value;
    statCurrency.textContent = `${e.target.value} (${catalog.getCurrencySymbol()})`;
    renderLookbook();
    renderManageList();
  });

  priceDisplayModeSelect.addEventListener('change', e => {
    catalog.display.priceMode = e.target.value;
    renderLookbook();
  });

  showSpecsToggle.addEventListener('change', e => {
    catalog.display.showSpecs = e.target.checked;
    renderLookbook();
  });

  showSkuToggle.addEventListener('change', e => {
    catalog.display.showSku = e.target.checked;
    renderLookbook();
  });

  // Modal open/close handlers
  function openProductModal(prod = null) {
    if (prod) {
      modalTitleText.textContent = 'Edit Product';
      editProductIdInput.value = prod.id;
      formTitle.value = prod.title || '';
      formSku.value = prod.sku || '';
      formCategory.value = prod.category || '';
      formStock.value = prod.stock || 'in';
      formRegularPrice.value = prod.regularPrice || '';
      formDiscountPrice.value = prod.discountPrice || '';
      formDesc.value = prod.description || '';
      formSpecs.value = Array.isArray(prod.specs) ? prod.specs.join('\n') : (prod.specs || '');
      formImageUrl.value = prod.image && !prod.image.startsWith('data:') ? prod.image : '';
      catalog.tempImageData = prod.image || '';
    } else {
      modalTitleText.textContent = 'Add New Product';
      editProductIdInput.value = '';
      productForm.reset();
      catalog.tempImageData = PRESET_SVGS.watch;
    }
    updateModalImageThumb();
    productModal.classList.add('open');
  }

  function closeProductModal() {
    productModal.classList.remove('open');
    catalog.tempImageData = '';
    formImageFile.value = '';
  }

  function updateModalImageThumb() {
    const src = catalog.tempImageData || formImageUrl.value;
    if (src) {
      imagePreviewThumb.innerHTML = `<img src="${src}" alt="Thumb" style="width:100%; height:100%; object-fit:cover;">`;
    } else {
      imagePreviewThumb.innerHTML = `<span style="font-size:0.7rem; color:var(--text-secondary);">No Img</span>`;
    }
  }

  btnOpenAddModal.addEventListener('click', () => openProductModal());
  btnCloseModal.addEventListener('click', closeProductModal);
  btnCancelModal.addEventListener('click', closeProductModal);
  productModal.addEventListener('click', e => {
    if (e.target === productModal) closeProductModal();
  });

  // Image Upload Reader
  formImageFile.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        catalog.tempImageData = ev.target.result;
        formImageUrl.value = '';
        updateModalImageThumb();
      };
      reader.readAsDataURL(file);
    }
  });

  formImageUrl.addEventListener('input', () => {
    if (formImageUrl.value.trim()) {
      catalog.tempImageData = formImageUrl.value.trim();
    }
    updateModalImageThumb();
  });

  // Product Form Save
  productForm.addEventListener('submit', e => {
    e.preventDefault();
    const id = editProductIdInput.value;
    const title = formTitle.value.trim();
    const sku = formSku.value.trim();
    const category = formCategory.value.trim() || 'General';
    const stock = formStock.value;
    const regularPrice = parseFloat(formRegularPrice.value) || 0;
    const discountPrice = formDiscountPrice.value ? parseFloat(formDiscountPrice.value) : null;
    const description = formDesc.value.trim();
    const specs = formSpecs.value
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    const image = catalog.tempImageData || formImageUrl.value.trim() || PRESET_SVGS.watch;

    const prodData = {
      title,
      sku,
      category,
      stock,
      regularPrice,
      discountPrice,
      description,
      specs,
      image
    };

    if (id) {
      catalog.updateProduct(id, prodData);
      showToast('Product updated successfully!');
    } else {
      catalog.addProduct(prodData);
      showToast('Product added to catalog!');
    }

    closeProductModal();
    updateAll();
  });

  // Render Category Filter Tabs in Preview
  function renderCategoryFilters() {
    const cats = catalog.getCategories();
    categoryFilterBar.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = `cat-filter-btn ${catalog.activeCategory === 'all' ? 'active' : ''}`;
    allBtn.textContent = `All (${catalog.products.length})`;
    allBtn.addEventListener('click', () => {
      catalog.activeCategory = 'all';
      renderCategoryFilters();
      renderLookbook();
    });
    categoryFilterBar.appendChild(allBtn);

    cats.forEach(cat => {
      const count = catalog.products.filter(p => (p.category || '').toLowerCase() === cat.toLowerCase()).length;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `cat-filter-btn ${catalog.activeCategory.toLowerCase() === cat.toLowerCase() ? 'active' : ''}`;
      btn.textContent = `${cat} (${count})`;
      btn.addEventListener('click', () => {
        catalog.activeCategory = cat;
        renderCategoryFilters();
        renderLookbook();
      });
      categoryFilterBar.appendChild(btn);
    });
  }

  // Stock Badge helper
  function getStockBadgeHtml(stockStatus) {
    switch (stockStatus) {
      case 'in':
        return '<span class="badge-stock stock-in">In Stock</span>';
      case 'low':
        return '<span class="badge-stock stock-low">Low Stock</span>';
      case 'pre':
        return '<span class="badge-stock stock-pre">Pre-Order</span>';
      case 'out':
        return '<span class="badge-stock stock-out">Out of Stock</span>';
      default:
        return '<span class="badge-stock stock-in">In Stock</span>';
    }
  }

  // Render Product Manage List (Sidebar)
  function renderManageList() {
    productManageList.innerHTML = '';
    const q = catalog.manageSearchQuery.toLowerCase();
    const filtered = catalog.products.filter(p => {
      if (!q) return true;
      return (
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    });

    if (filtered.length === 0) {
      productManageList.innerHTML = `<div style="text-align: center; padding: 2rem 1rem; color: var(--text-secondary); font-size: 0.85rem;">No products match query.</div>`;
      return;
    }

    filtered.forEach(p => {
      const item = document.createElement('div');
      item.className = 'product-manage-card';

      const thumbImg = document.createElement('img');
      thumbImg.className = 'product-thumb-mini';
      thumbImg.src = p.image || PRESET_SVGS.watch;
      thumbImg.alt = p.title;

      const infoWrap = document.createElement('div');
      infoWrap.className = 'product-manage-info';

      const titleEl = document.createElement('div');
      titleEl.className = 'product-manage-title';
      titleEl.textContent = p.title;

      const subEl = document.createElement('div');
      subEl.className = 'product-manage-sub';
      subEl.innerHTML = `<span>${p.sku || 'No SKU'}</span> • <span>${p.category || 'General'}</span> • <strong>${catalog.formatPrice(p.discountPrice || p.regularPrice)}</strong>`;

      infoWrap.appendChild(titleEl);
      infoWrap.appendChild(subEl);

      const actionsWrap = document.createElement('div');
      actionsWrap.className = 'product-manage-actions';

      // Edit Button
      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'icon-btn';
      editBtn.title = 'Edit Product';
      editBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`;
      editBtn.addEventListener('click', () => openProductModal(p));

      // Duplicate Button
      const dupBtn = document.createElement('button');
      dupBtn.type = 'button';
      dupBtn.className = 'icon-btn';
      dupBtn.title = 'Duplicate Product';
      dupBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
      dupBtn.addEventListener('click', () => {
        catalog.duplicateProduct(p.id);
        updateAll();
        showToast('Product duplicated!');
      });

      // Delete Button
      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'icon-btn delete-btn';
      delBtn.title = 'Delete Product';
      delBtn.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
      delBtn.addEventListener('click', () => {
        if (confirm(`Remove "${p.title}" from catalog?`)) {
          catalog.deleteProduct(p.id);
          updateAll();
          showToast('Product removed.');
        }
      });

      actionsWrap.appendChild(editBtn);
      actionsWrap.appendChild(dupBtn);
      actionsWrap.appendChild(delBtn);

      item.appendChild(thumbImg);
      item.appendChild(infoWrap);
      item.appendChild(actionsWrap);

      productManageList.appendChild(item);
    });
  }

  // Render Live Lookbook (Preview)
  function renderLookbook() {
    catalogGridContainer.innerHTML = '';
    const q = catalog.searchQuery.toLowerCase();
    const cat = catalog.activeCategory.toLowerCase();

    const filtered = catalog.products.filter(p => {
      const matchCat = cat === 'all' || (p.category || '').toLowerCase() === cat;
      const matchQ =
        !q ||
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q));
      return matchCat && matchQ;
    });

    if (filtered.length === 0) {
      catalogGridContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-secondary);">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 1rem; opacity: 0.5;"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
          <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.25rem;">No products found in this view</div>
          <div style="font-size: 0.85rem; opacity: 0.8;">Try adjusting your search filter or category selection.</div>
        </div>
      `;
      return;
    }

    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = 'catalog-card';

      // Discount % calculation
      let discountBadgeHtml = '';
      const hasDiscount = p.discountPrice && p.discountPrice < p.regularPrice;
      if (hasDiscount) {
        const pct = Math.round(((p.regularPrice - p.discountPrice) / p.regularPrice) * 100);
        discountBadgeHtml = `<span class="badge-discount">-${pct}% OFF</span>`;
      }

      // Specs Bullets
      let specsHtml = '';
      if (catalog.display.showSpecs && p.specs && p.specs.length > 0) {
        const listItems = p.specs
          .slice(0, 4)
          .map(sp => `<li>${sp}</li>`)
          .join('');
        specsHtml = `<ul class="card-specs-list">${listItems}</ul>`;
      }

      // Price block according to mode
      let priceHtml = '';
      if (catalog.display.priceMode === 'hide') {
        priceHtml = `<span style="font-size:0.85rem; font-weight:600; opacity:0.6; text-transform:uppercase; letter-spacing:0.05em;">Price on Request</span>`;
      } else if (catalog.display.priceMode === 'regular-only') {
        priceHtml = `<span class="price-regular">${catalog.formatPrice(p.regularPrice)}</span>`;
      } else {
        // Both
        if (hasDiscount) {
          priceHtml = `
            <span class="price-discounted">${catalog.formatPrice(p.discountPrice)}</span>
            <span class="price-original">${catalog.formatPrice(p.regularPrice)}</span>
          `;
        } else {
          priceHtml = `<span class="price-regular">${catalog.formatPrice(p.regularPrice)}</span>`;
        }
      }

      const skuHtml = catalog.display.showSku && p.sku ? `<span class="card-sku">${p.sku}</span>` : '';

      card.innerHTML = `
        <div class="card-image-wrap">
          <img class="card-img" src="${p.image || PRESET_SVGS.watch}" alt="${p.title}" loading="lazy">
          ${getStockBadgeHtml(p.stock)}
          ${discountBadgeHtml}
        </div>
        <div class="card-body">
          <div class="card-meta-line">
            <span class="card-cat-tag">${p.category || 'General'}</span>
            ${skuHtml}
          </div>
          <h3 class="card-title">${p.title}</h3>
          <p class="card-desc">${p.description || ''}</p>
          ${specsHtml}
          <div class="card-price-row">
            ${priceHtml}
          </div>
        </div>
        <div class="card-hover-actions">
          <button type="button" class="icon-btn edit-card-btn" title="Edit Product">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          </button>
        </div>
      `;

      const editBtn = card.querySelector('.edit-card-btn');
      if (editBtn) {
        editBtn.addEventListener('click', e => {
          e.stopPropagation();
          openProductModal(p);
        });
      }

      catalogGridContainer.appendChild(card);
    });
  }

  // Update Stats and UI
  function updateAll() {
    statProducts.textContent = catalog.products.length;
    statCategories.textContent = catalog.getCategories().length;
    statCurrency.textContent = `${catalog.store.currency} (${catalog.getCurrencySymbol()})`;
    renderManageList();
    renderCategoryFilters();
    renderLookbook();
  }

  // Search input listeners
  manageSearchInput.addEventListener('input', e => {
    catalog.manageSearchQuery = e.target.value.trim();
    renderManageList();
  });

  liveFilterSearch.addEventListener('input', e => {
    catalog.searchQuery = e.target.value.trim();
    renderLookbook();
  });

  // Load Presets Button
  btnLoadPresets.addEventListener('click', () => {
    if (confirm('Load sample luxury product presets? This will reset your current products to the default showcase.')) {
      catalog.products = JSON.parse(JSON.stringify(LUXURY_PRESETS));
      catalog.activeCategory = 'all';
      updateAll();
      showToast('Loaded 6 luxury catalog presets!');
    }
  });

  // Export JSON
  btnExportJson.addEventListener('click', () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      store: catalog.store,
      display: catalog.display,
      products: catalog.products
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeBrand = (catalog.store.name || 'catalog').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    a.href = url;
    a.download = `${safeBrand}-catalog.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Catalog exported as JSON.');
  });

  // Import JSON
  btnImportJson.addEventListener('click', () => {
    importJsonFile.click();
  });

  importJsonFile.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (parsed.products && Array.isArray(parsed.products)) {
          catalog.products = parsed.products;
          if (parsed.store) catalog.store = { ...catalog.store, ...parsed.store };
          if (parsed.display) catalog.display = { ...catalog.display, ...parsed.display };

          // Sync sidebar inputs
          storeNameInput.value = catalog.store.name || '';
          storeTaglineInput.value = catalog.store.tagline || '';
          storeCurrencySelect.value = catalog.store.currency || 'USD';
          storeContactInput.value = catalog.store.contact || '';
          storeNotesInput.value = catalog.store.notes || '';
          priceDisplayModeSelect.value = catalog.display.priceMode || 'both';
          showSpecsToggle.checked = catalog.display.showSpecs !== false;
          showSkuToggle.checked = catalog.display.showSku !== false;

          previewBrandName.textContent = catalog.store.name || 'BRAND CATALOG';
          previewBrandTagline.textContent = catalog.store.tagline || '';
          previewBrandContact.textContent = catalog.store.contact || '';
          previewFooterTerms.textContent = catalog.store.notes || '';

          updateLayout(catalog.display.layout || 'layout-3col');
          updateAll();
          showToast(`Successfully imported ${catalog.products.length} products!`);
        } else {
          alert('Invalid catalog JSON format: "products" array missing.');
        }
      } catch (err) {
        alert('Failed to parse catalog JSON file: ' + err.message);
      }
      importJsonFile.value = '';
    };
    reader.readAsText(file);
  });

  // Print to PDF
  btnPrintPdf.addEventListener('click', () => {
    window.print();
  });

  // Export Standalone HTML Catalog
  btnExportHtml.addEventListener('click', () => {
    const sym = catalog.getCurrencySymbol();
    const brand = catalog.store.name || 'Catalog';
    const safeBrand = brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const productCardsHtml = catalog.products.map(p => {
      const hasDiscount = p.discountPrice && p.discountPrice < p.regularPrice;
      const discountBadge = hasDiscount
        ? `<span style="position:absolute; top:8px; right:8px; background:#ef4444; color:#fff; font-size:10px; font-weight:700; padding:3px 6px; border-radius:4px;">-${Math.round(((p.regularPrice - p.discountPrice)/p.regularPrice)*100)}%</span>`
        : '';
      const stockBadge = `<span style="position:absolute; top:8px; left:8px; background:${p.stock==='out'?'#ef4444':p.stock==='low'?'#f59e0b':p.stock==='pre'?'#6366f1':'#10b981'}; color:#fff; font-size:10px; font-weight:700; padding:3px 6px; border-radius:4px; text-transform:uppercase;">${p.stock||'in'}</span>`;
      
      const specsList = (p.specs && p.specs.length)
        ? `<ul style="list-style:none; padding:0; margin:0 0 10px 0; font-size:12px; color:#6b7280;">${p.specs.map(s => `<li style="margin-bottom:2px;">• ${s}</li>`).join('')}</ul>`
        : '';

      const priceHtml = hasDiscount
        ? `<span style="color:#10b981; font-weight:700; font-size:18px;">${catalog.formatPrice(p.discountPrice)}</span> <span style="text-decoration:line-through; font-size:13px; color:#9ca3af; margin-left:6px;">${catalog.formatPrice(p.regularPrice)}</span>`
        : `<span style="color:#111827; font-weight:700; font-size:18px;">${catalog.formatPrice(p.regularPrice)}</span>`;

      return `
        <div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; display:flex; flex-direction:column; break-inside:avoid; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
          <div style="width:100%; height:240px; position:relative; background:#f9fafb; display:flex; align-items:center; justify-content:center; overflow:hidden;">
            <img src="${p.image || PRESET_SVGS.watch}" alt="${p.title}" style="width:100%; height:100%; object-fit:cover;">
            ${stockBadge}
            ${discountBadge}
          </div>
          <div style="padding:16px; display:flex; flex-direction:column; flex:1;">
            <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:6px;">
              <span style="color:#4e85bf; font-weight:700; text-transform:uppercase;">${p.category || 'General'}</span>
              <span style="font-family:monospace; color:#9ca3af;">${p.sku || ''}</span>
            </div>
            <h3 style="font-size:16px; font-weight:700; color:#111827; margin:0 0 6px 0;">${p.title}</h3>
            <p style="font-size:13px; color:#4b5563; line-height:1.4; margin:0 0 10px 0;">${p.description || ''}</p>
            ${specsList}
            <div style="margin-top:auto; padding-top:10px; border-top:1px dashed #e5e7eb; display:flex; align-items:baseline;">
              ${priceHtml}
            </div>
          </div>
        </div>
      `;
    }).join('');

    const htmlDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brand} - Product Catalog</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #f9fafb; color: #111827; padding: 40px 20px; line-height: 1.5; }
    .container { max-width: 1200px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
    .header { border-bottom: 2px solid #111827; padding-bottom: 24px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px; }
    .brand-title { font-family: 'Instrument Serif', serif; font-size: 42px; font-weight: 700; line-height: 1.1; }
    .brand-tagline { font-size: 14px; color: #4b5563; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px; }
    .header-meta { font-size: 13px; color: #6b7280; text-align: right; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
    .footer { border-top: 2px solid #111827; margin-top: 40px; padding-top: 16px; display: flex; justify-content: space-between; font-size: 13px; color: #6b7280; }
    @media print {
      body { padding: 0; background: #fff; }
      .container { border: none; box-shadow: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h1 class="brand-title">${brand}</h1>
        <div class="brand-tagline">${catalog.store.tagline || ''}</div>
      </div>
      <div class="header-meta">
        <div>${catalog.store.contact || ''}</div>
        <div>Curated Line Sheet • ${new Date().getFullYear()}</div>
      </div>
    </div>
    <div class="grid">
      ${productCardsHtml}
    </div>
    <div class="footer">
      <div>${catalog.store.notes || ''}</div>
      <div>Official Product Catalog</div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeBrand}-catalog.html`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported standalone HTML catalog!');
  });

  // Initialize
  updateLayout('layout-3col');
  updateAll();
});