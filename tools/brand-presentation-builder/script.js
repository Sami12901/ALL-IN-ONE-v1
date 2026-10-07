// Brand Presentation Builder - Client-side Interactive Logic

const BRAND_PRESETS = {
  aetherion: [
    {
      id: "slide-1",
      type: "mission",
      title: "Brand Purpose, Essence & Values",
      subtitle: "The foundational North Star guiding product, narrative, and culture",
      kicker: "Brand Identity v2.4",
      bgImage: "",
      notes: "Walk through the foundational thesis: clarity, intelligence, and radical human alignment.",
      data: {
        brandName: "Aetherion Labs",
        essence: "Autonomous Intelligence with Radical Clarity",
        purpose: "To equip humanity with transparent, self-healing cognitive infrastructure that eliminates friction and unlocks exponential creativity.",
        pillars: [
          {
            title: "Radical Rigor",
            desc: "Zero tolerance for ambiguity or opaque systems. Every model decision is explainable and verifiable."
          },
          {
            title: "Quiet Velocity",
            desc: "Complex computing rendered seamless and whisper-quiet. Power through sublime architectural restraint."
          },
          {
            title: "Human Sovereign",
            desc: "AI engineered strictly as a cognitive amplifier, keeping human agency at the center of every feedback loop."
          }
        ]
      }
    },
    {
      id: "slide-2",
      type: "logo",
      title: "Logo Architecture & Clear Space",
      subtitle: "Protecting the geometric purity and visual integrity of the primary mark",
      kicker: "Visual Assets & Usage",
      notes: "Explain the 'X' clear-space rule: equal to the height of the capital letter 'A'.",
      data: {
        logoText: "AETHERION",
        logoSub: "LABS",
        clearSpaceDesc: "Maintain a minimum margin of clear space around the logomark equal to the height of the primary glyph 'X'. Never crowd with typography or iconography.",
        dos: [
          "Use the white or electric violet wordmark on solid obsidian backgrounds",
          "Maintain uniform horizontal alignment across all digital navigation bars",
          "Ensure at least 4.5:1 contrast ratio against underlying backdrops"
        ],
        donts: [
          "Do not distort, stretch, or alter the glyph geometry or tracking",
          "Do not render the logo in unapproved gradient blends or drop shadows",
          "Do not place the mark over complex, high-contrast photographic patterns"
        ]
      }
    },
    {
      id: "slide-3",
      type: "colors",
      title: "Official Color Palette & HEX Swatches",
      subtitle: "A high-contrast cinematic spectrum inspired by deep space and digital photons",
      kicker: "Color System",
      notes: "All digital components adhere to WCAG AAA contrast accessibility on primary surfaces.",
      data: {
        swatches: [
          { name: "Obsidian Void", hex: "#090A0F", rgb: "RGB(9, 10, 15)", role: "Primary Background" },
          { name: "Electric Violet", hex: "#8B5CF6", rgb: "RGB(139, 92, 246)", role: "Interactive Accent" },
          { name: "Photon Cyan", hex: "#06B6D4", rgb: "RGB(6, 182, 212)", role: "Secondary Telemetry" },
          { name: "Platinum Light", hex: "#F8FAFC", rgb: "RGB(248, 250, 252)", role: "Primary Typography" }
        ],
        guidance: "Use Obsidian Void for 80% of canvas areas. Electric Violet and Photon Cyan should be reserved for high-intent focal actions."
      }
    },
    {
      id: "slide-4",
      type: "typography",
      title: "Typography Scale & Hierarchies",
      subtitle: "Disciplined geometric sans-serif typefaces engineered for hyper-legibility",
      kicker: "Typography System",
      notes: "Space Grotesk provides technical personality, while Inter guarantees extreme legibility in micro-data tables.",
      data: {
        primaryFont: "Space Grotesk",
        primaryRole: "Display Headings & Key Metric Data (Weight: 700 Bold / 500 Medium)",
        secondaryFont: "Inter UI",
        secondaryRole: "Body Narrative, Code Blocks & Microcopy (Weight: 400 Regular / 600 Semi-Bold)",
        samples: [
          { label: "Display Hero (H1)", sample: "Autonomous Reasoning Mesh", spec: "48px / Line-height 1.1 / -0.02em Tracking" },
          { label: "Section Subtitle (H2)", sample: "Deterministic State Orchestration", spec: "28px / Line-height 1.25 / -0.01em Tracking" },
          { label: "Body Text (P)", sample: "Synthesizing distributed API telemetry across 300+ cloud zones in sub-millisecond cycles.", spec: "15px / Line-height 1.55 / 0em Tracking" }
        ]
      }
    },
    {
      id: "slide-5",
      type: "imagery",
      title: "Imagery Direction & Art Direction",
      subtitle: "Cinematic, moody lighting with geometric precision and authentic human focus",
      kicker: "Photography Principles",
      notes: "Never use cliché stock photography of blue circuit boards, robot handshakes, or glowing floating orbs.",
      data: {
        principles: [
          {
            title: "1. Authentic Architecture",
            desc: "Clean brutalist architecture, glass partitions, and raw materials reflecting structural honesty."
          },
          {
            title: "2. Chiaroscuro Lighting",
            desc: "Deep, controlled shadows with directional specular rim lighting. High contrast with zero visual clutter."
          },
          {
            title: "3. Candid Intention",
            desc: "Focus on engineers, researchers, and creators in moments of deep thought, never posed stock handshakes."
          }
        ],
        moodUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
      }
    },
    {
      id: "slide-6",
      type: "voice",
      title: "Brand Voice & Communication Matrix",
      subtitle: "How Aetherion speaks across technical documentation, press, and products",
      kicker: "Editorial Voice",
      notes: "Our tone is that of a senior principal scientist: authoritative, precise, and understated.",
      data: {
        matrix: [
          { trait: "Confident, Not Arrogant", desc: "We let architecture and verifiable performance metrics speak. No hyperbolic marketing adjectives." },
          { trait: "Concise, Not Cryptic", desc: "We write short, punchy declarative sentences. We explain complex mechanics simply without talking down." },
          { trait: "Empathetic, Not Sentimental", desc: "We care deeply about developer workflow friction and express solidarity through thoughtful design solutions." }
        ],
        goldenRule: '"If a word can be removed without losing precision, cut it immediately."'
      }
    }
  ],

  verve: [
    {
      id: "slide-1",
      type: "mission",
      title: "Brand Essence & Regenerative Philosophy",
      subtitle: "Elevating everyday rituals through biological craftsmanship and stillness",
      kicker: "Verve & Co Editorial",
      bgImage: "",
      notes: "Introduce Verve's holistic philosophy: luxury that revitalizes rather than depletes.",
      data: {
        brandName: "Verve & Co Botanical",
        essence: "Regenerative Elegance & Quiet Rituals",
        purpose: "To restore intentional presence to modern living through biodiverse plant science and artisanal patience.",
        pillars: [
          {
            title: "Botanical Integrity",
            desc: "Single-origin cold-pressed botanical extractions cultivated in living soil with zero synthetic chemicals."
          },
          {
            title: "Circular Permanence",
            desc: "Every vessel is designed to be cherished, refilled, or composted back into the earth."
          },
          {
            title: "Quiet Stillness",
            desc: "Inviting pauses of deep mindfulness and sensory appreciation within bustling daily environments."
          }
        ]
      }
    },
    {
      id: "slide-2",
      type: "logo",
      title: "Serif Wordmark & Clear Space Rules",
      subtitle: "Classic typographical proportion rooted in Venetian manuscript heritage",
      kicker: "Mark Guidelines",
      notes: "The bespoke serif logotype requires generous breathing room on paper stocks and packaging.",
      data: {
        logoText: "VERVE & CO.",
        logoSub: "ATELIER BOTANIQUE",
        clearSpaceDesc: "Provide breathing room around the mark equal to the width of the ampersand '&' on all four sides.",
        dos: [
          "Foil stamp in warm gold or blind deboss on uncoated organic linen paper",
          "Center-align with generous top and bottom margins on packaging panels",
          "Pair exclusively with muted earthen monochromatic backdrops"
        ],
        donts: [
          "Do not set the logo in neon or saturated synthetic colors",
          "Do not condense letter spacing or alter character kerning",
          "Do not combine with decorative drop shadows or digital bevels"
        ]
      }
    },
    {
      id: "slide-3",
      type: "colors",
      title: "Organic Earth Palette & Swatches",
      subtitle: "Tones sampled from coastal clay, eucalyptus bark, and sun-baked terracotta",
      kicker: "Color System",
      notes: "All inks specified for print are vegetable-based soy pigments.",
      data: {
        swatches: [
          { name: "Deep Forest", hex: "#0F1F18", rgb: "RGB(15, 31, 24)", role: "Primary Deep Charcoal" },
          { name: "Sage Mist", hex: "#84A98C", rgb: "RGB(132, 169, 140)", role: "Secondary Botanical" },
          { name: "Warm Linen", hex: "#E9D8A6", rgb: "RGB(233, 216, 166)", role: "Packaging Cream" },
          { name: "Terracotta Earth", hex: "#CA6702", rgb: "RGB(202, 103, 2)", role: "Accent Warmth" }
        ],
        guidance: "Warm Linen provides the primary background tone for packaging. Deep Forest serves as the grounding typography shade."
      }
    },
    {
      id: "slide-4",
      type: "typography",
      title: "Editorial Serif & Modern Sans Hierarchy",
      subtitle: "A harmonious dialogue between historical literary grace and modern clean layout",
      kicker: "Typography",
      notes: "Playfair Display brings poetic romance, while Plus Jakarta Sans maintains clean retail readability.",
      data: {
        primaryFont: "Playfair Display / Editorial Serif",
        primaryRole: "Packaging Titles, Chapter Openers, Product Names (Weight: 400 Italic / 600 Semi-Bold)",
        secondaryFont: "Plus Jakarta Sans",
        secondaryRole: "Ingredient Declarations, Digital Interface & Instructions (Weight: 400 Regular / 500 Medium)",
        samples: [
          { label: "Display Title (H1)", sample: "The Cellular Renewal Ritual", spec: "42px / Line-height 1.15 / Editorial Italic" },
          { label: "Subheading (H2)", sample: "Cold-Pressed Atlantic Sea Botanicals", spec: "24px / Line-height 1.3 / Regular" },
          { label: "Formula Notes (P)", sample: "Harvested at peak equinox tides to maximize bio-fermented peptide density.", spec: "14px / Line-height 1.65 / Clean Sans" }
        ]
      }
    },
    {
      id: "slide-5",
      type: "imagery",
      title: "Warm Tactile Photography Guidelines",
      subtitle: "Soft daylight, natural botanical macro textures, and tactile paper grains",
      kicker: "Visual Direction",
      notes: "Use natural diffused morning or golden hour light with organic shadows.",
      data: {
        principles: [
          {
            title: "1. Diffused Daylight",
            desc: "Natural window light casting soft, organic shadows. Strictly avoid artificial studio flash glare."
          },
          {
            title: "2. Tactile Textures",
            desc: "Extreme close-up macro shots of unrefined botanical emulsions, raw linen, and stone ceramics."
          },
          {
            title: "3. Unrushed Still Life",
            desc: "Compositions that evoke calm, slow living, and private bathroom ritual sanctuaries."
          }
        ],
        moodUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
      }
    },
    {
      id: "slide-6",
      type: "voice",
      title: "Brand Voice: Poetic, Grounded & Honest",
      subtitle: "Inviting conversation with the measured warmth of an old friend",
      kicker: "Tone of Voice",
      notes: "Avoid fear-based beauty messaging (no 'anti-aging', celebrate natural skin health).",
      data: {
        matrix: [
          { trait: "Warmly Grounded", desc: "Rooted in biological truth and centuries-old herbalism without trendy pseudo-science." },
          { trait: "Sensory & Evocative", desc: "Describe botanical aromas and tactile sensations with literary nuance and restraint." },
          { trait: "Celebratory of Time", desc: "We celebrate natural maturation. Never speak of fighting age, but honoring vitality." }
        ],
        goldenRule: '"Invite the reader into stillness; never shout across a crowded room."'
      }
    }
  ],

  nexus: [
    {
      id: "slide-1",
      type: "mission",
      title: "Spatial Manifesto & Architecture Principles",
      subtitle: "Synthesizing computational engineering with monumental tectonic beauty",
      kicker: "Nexus Studio Brand Book",
      bgImage: "",
      notes: "Frame Nexus as an architectural pioneer bridging physical structures and digital fabrication.",
      data: {
        brandName: "Nexus Spatial Studio",
        essence: "Computational Tectonics & Monumental Design",
        purpose: "To build durable physical sanctuaries that harmoniously integrate environmental physics and algorithmic fabrication.",
        pillars: [
          {
            title: "Material Honesty",
            desc: "Concrete, weathered steel, and raw timber celebrated in their untreated structural truth."
          },
          {
            title: "Algorithmic Precision",
            desc: "Optimizing solar orientation, acoustic resonance, and thermal mass through generative computing."
          },
          {
            title: "Generational Scale",
            desc: "Constructing spaces intended to age with dignity across centuries of climatic shifting."
          }
        ]
      }
    },
    {
      id: "slide-2",
      type: "logo",
      title: "Monolithic Wordmark & Structural Space",
      subtitle: "Industrial proportion built upon a strict 8-point geometric grid",
      kicker: "Identity Standards",
      notes: "The logo must always sit firmly grounded on baseline grids or anchored to bottom left corners.",
      data: {
        logoText: "NEXUS",
        logoSub: "SPATIAL STUDIO",
        clearSpaceDesc: "Clear space is defined by the square dimension of the letter 'N'. Ensure no graphical noise intrudes.",
        dos: [
          "Cast in relief on architectural concrete panels or waterjet-cut in steel",
          "Set flush left against structural grid margins on blueprints and monographs",
          "Use high-contrast industrial monochrome for technical documentation"
        ],
        donts: [
          "Do not round the sharp geometric corners of the logomark",
          "Do not colorize the logo outside the defined carbon and amber palette",
          "Do not center-align the mark when positioned on structural drawings"
        ]
      }
    },
    {
      id: "slide-3",
      type: "colors",
      title: "Industrial Materials Palette",
      subtitle: "Colors derived from architectural concrete, forged iron, and safety amber",
      kicker: "Palette Specifications",
      notes: "Signal Amber is our iconic accent color, referencing architectural construction markers.",
      data: {
        swatches: [
          { name: "Carbon Monolith", hex: "#111317", rgb: "RGB(17, 19, 23)", role: "Deep Architectural Dark" },
          { name: "Concrete Grey", hex: "#94A3B8", rgb: "RGB(148, 163, 184)", role: "Structural Midtone" },
          { name: "Signal Amber", hex: "#F59E0B", rgb: "RGB(245, 158, 11)", role: "High-Visibility Accent" },
          { name: "Limestone White", hex: "#F8FAFC", rgb: "RGB(248, 250, 252)", role: "Canvas Background" }
        ],
        guidance: "Carbon Monolith and Concrete Grey dominate 90% of spatial identity surfaces. Signal Amber acts as a precise focal trigger."
      }
    },
    {
      id: "slide-4",
      type: "typography",
      title: "Constructivist & Monospace Type Hierarchy",
      subtitle: "Technical clarity drawn from Swiss modernism and engineering drafting",
      kicker: "Type System",
      notes: "Syne conveys monumental boldness, while Archivo Monospace delivers structural drafting clarity.",
      data: {
        primaryFont: "Syne / Monumental Grotesk",
        primaryRole: "Architectural Project Titles & Cover Displays (Weight: 800 ExtraBold)",
        secondaryFont: "Archivo & JetBrains Mono",
        secondaryRole: "Technical Schematics, Dimensional Specs & Reports (Weight: 500 Medium / 400 Mono)",
        samples: [
          { label: "Monograph Title (H1)", sample: "Cantilevered Terraces 04", spec: "52px / Line-height 1.05 / Uppercase" },
          { label: "Drawing Label (H2)", sample: "STRUCTURAL CORE SECT-B", spec: "18px / Line-height 1.2 / Monospaced" },
          { label: "Engineering Spec (P)", sample: "Pre-stressed ultra-high-performance concrete ribs spanning 48 meters without column supports.", spec: "14px / Line-height 1.5 / Regular" }
        ]
      }
    },
    {
      id: "slide-5",
      type: "imagery",
      title: "Architectural Photography Principles",
      subtitle: "Monumental scale, razor-sharp geometric perspectives, and honest material weathering",
      kicker: "Visual Direction",
      notes: "Shoot buildings during dramatic overcast skies or crisp low-angle winter sunlight.",
      data: {
        principles: [
          {
            title: "1. Precise Perspective Control",
            desc: "Zero converging vertical lines. Use tilt-shift lenses and true two-point architectural perspective."
          },
          {
            title: "2. Heavy Atmospheric Contrast",
            desc: "Capture the interplay of raw concrete textures with shifting clouds, mist, and deep cast shadows."
          },
          {
            title: "3. Scale & Solitude",
            desc: "Incorporate solitary human silhouettes to ground monumental architectural dimensions."
          }
        ],
        moodUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"
      }
    },
    {
      id: "slide-6",
      type: "voice",
      title: "Brand Voice: Rigorous, Direct & Monumental",
      subtitle: "Uncompromising clarity without decorative filler or trend chasing",
      kicker: "Tone of Voice",
      notes: "Speak as master structural engineers and spatial philosophers.",
      data: {
        matrix: [
          { trait: "Structurally Honest", desc: "Never mask structural flaws with ornamental words. State facts directly and unambiguously." },
          { trait: "Disciplined Economy", desc: "Every drawing, specification, and paragraph is stripped to its load-bearing essentials." },
          { trait: "Enduring Ambition", desc: "We discuss projects in the context of decades and centuries, not seasonal fashion cycles." }
        ],
        goldenRule: '"Form strictly follows tectonic purpose. If an element does not carry weight, remove it."'
      }
    }
  ]
};

// Global App State
let currentPreset = "aetherion";
let deck = JSON.parse(JSON.stringify(BRAND_PRESETS[currentPreset]));
let activeSlideIndex = 0;
let presenterTimerInterval = null;
let presenterSeconds = 0;

document.addEventListener("DOMContentLoaded", () => {
  initDOM();
  renderThumbnails();
  renderActiveSlide();
  renderInspector();
});

function initDOM() {
  // Preset selector
  const select = document.getElementById("brand-preset-select");
  if (select) {
    select.addEventListener("change", (e) => {
      currentPreset = e.target.value;
      if (BRAND_PRESETS[currentPreset]) {
        deck = JSON.parse(JSON.stringify(BRAND_PRESETS[currentPreset]));
        activeSlideIndex = 0;
        renderThumbnails();
        renderActiveSlide();
        renderInspector();
        showToast("Loaded Brand Guidelines Preset!");
      }
    });
  }

  // Slide actions
  document.getElementById("btn-add-slide")?.addEventListener("click", handleAddSlide);
  document.getElementById("btn-move-up")?.addEventListener("click", handleMoveUp);
  document.getElementById("btn-move-down")?.addEventListener("click", handleMoveDown);
  document.getElementById("btn-delete-slide")?.addEventListener("click", handleDeleteSlide);

  // Presenter & Print
  document.getElementById("btn-launch-presenter")?.addEventListener("click", startPresenterMode);
  document.getElementById("btn-print-deck")?.addEventListener("click", triggerPrintBrochure);

  // JSON
  document.getElementById("btn-export-json")?.addEventListener("click", exportDeckJSON);
  document.getElementById("input-import-json")?.addEventListener("change", importDeckJSON);

  // Presenter HUD
  document.getElementById("hud-prev")?.addEventListener("click", () => navigatePresenter(-1));
  document.getElementById("hud-next")?.addEventListener("click", () => navigatePresenter(1));
  document.getElementById("hud-exit")?.addEventListener("click", exitPresenterMode);
  document.getElementById("hud-notes-toggle")?.addEventListener("click", togglePresenterNotes);

  // Keyboard navigation
  document.addEventListener("keydown", handleKeyNavigation);

  // Notes listener
  const notesInput = document.getElementById("slide-notes-input");
  if (notesInput) {
    notesInput.addEventListener("input", (e) => {
      if (deck[activeSlideIndex]) {
        deck[activeSlideIndex].notes = e.target.value;
      }
    });
  }
}

function handleKeyNavigation(e) {
  const presenter = document.getElementById("presenter-fullscreen-container");
  if (presenter && presenter.classList.contains("active")) {
    if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
      e.preventDefault();
      navigatePresenter(1);
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault();
      navigatePresenter(-1);
    } else if (e.key === "Escape") {
      e.preventDefault();
      exitPresenterMode();
    }
  }
}

function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.style.opacity = "1";
  setTimeout(() => {
    toast.style.opacity = "0";
  }, 2200);
}

// -------------------------------------------------------------
// Render Thumbnails
// -------------------------------------------------------------
function renderThumbnails() {
  const thumbList = document.getElementById("slide-thumb-list");
  const slideCountBadge = document.getElementById("slide-count-badge");
  if (!thumbList) return;

  thumbList.innerHTML = "";
  if (slideCountBadge) slideCountBadge.textContent = deck.length;

  deck.forEach((slide, idx) => {
    const card = document.createElement("div");
    card.className = `slide-thumb-card ${idx === activeSlideIndex ? "active" : ""}`;
    card.onclick = () => {
      activeSlideIndex = idx;
      renderThumbnails();
      renderActiveSlide();
      renderInspector();
    };

    const num = document.createElement("div");
    num.className = "slide-thumb-number";
    num.textContent = idx + 1;

    const info = document.createElement("div");
    info.className = "slide-thumb-info";

    const title = document.createElement("div");
    title.className = "slide-thumb-title";
    title.textContent = slide.title || `Slide ${idx + 1}`;

    const type = document.createElement("div");
    type.className = "slide-thumb-type";
    type.textContent = slide.type.toUpperCase();

    info.appendChild(title);
    info.appendChild(type);
    card.appendChild(num);
    card.appendChild(info);
    thumbList.appendChild(card);
  });

  const activeTag = document.getElementById("active-slide-type-tag");
  if (activeTag && deck[activeSlideIndex]) {
    activeTag.textContent = deck[activeSlideIndex].type.toUpperCase();
  }
}

// -------------------------------------------------------------
// Render Active Slide
// -------------------------------------------------------------
function renderActiveSlide() {
  const canvas = document.getElementById("slide-canvas-stage");
  const content = document.getElementById("slide-canvas-content");
  const slide = deck[activeSlideIndex];
  if (!canvas || !content || !slide) return;

  if (slide.bgImage) {
    canvas.style.backgroundImage = `url('${slide.bgImage}')`;
  } else {
    canvas.style.backgroundImage = "none";
  }

  content.innerHTML = generateSlideHTML(slide);

  // Sync presenter if open
  const presContainer = document.getElementById("presenter-fullscreen-container");
  if (presContainer && presContainer.classList.contains("active")) {
    renderPresenterSlide();
  }
}

// -------------------------------------------------------------
// Generate Slide HTML
// -------------------------------------------------------------
function generateSlideHTML(slide) {
  const kicker = slide.kicker ? `<div class="slide-kicker">${escapeHtml(slide.kicker)}</div>` : "";
  const title = `<h2>${escapeHtml(slide.title || "")}</h2>`;
  const subtitle = slide.subtitle ? `<p>${escapeHtml(slide.subtitle)}</p>` : "";

  let bodyHTML = "";

  switch (slide.type) {
    case "mission": {
      const d = slide.data || {};
      const pillars = (d.pillars || []).map(pil => `
        <div class="canvas-card" style="border-top: 3px solid #ec4899;">
          <h4 style="font-size: 0.95rem; color: #ffffff; margin: 0 0 0.35rem;">✦ ${escapeHtml(pil.title || "")}</h4>
          <p style="font-size: 0.74rem; color: rgba(255,255,255,0.75); line-height: 1.4; margin: 0;">${escapeHtml(pil.desc || "")}</p>
        </div>
      `).join("");

      bodyHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <div class="canvas-card" style="border-left: 4px solid #ec4899; max-width: 680px; margin-bottom: 0.75rem;">
            <div style="font-size: 0.8rem; font-weight: 700; color: #ec4899; text-transform: uppercase;">${escapeHtml(d.brandName || "")} &bull; Essence</div>
            <div style="font-size: 1.15rem; font-weight: 700; color: #ffffff; margin: 0.25rem 0 0.4rem;">${escapeHtml(d.essence || "")}</div>
            <p style="font-size: 0.8rem; color: rgba(255,255,255,0.8); line-height: 1.45; margin: 0;">${escapeHtml(d.purpose || "")}</p>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.85rem;">
            ${pillars}
          </div>
        </div>
      `;
      break;
    }

    case "logo": {
      const d = slide.data || {};
      const dos = (d.dos || []).map(item => `
        <li style="font-size: 0.74rem; color: #d1fae5; margin-bottom: 0.3rem; display: flex; gap: 0.4rem;">
          <span style="color: #10b981; font-weight: bold;">✓</span> <span>${escapeHtml(item)}</span>
        </li>
      `).join("");

      const donts = (d.donts || []).map(item => `
        <li style="font-size: 0.74rem; color: #fee2e2; margin-bottom: 0.3rem; display: flex; gap: 0.4rem;">
          <span style="color: #ef4444; font-weight: bold;">✕</span> <span>${escapeHtml(item)}</span>
        </li>
      `).join("");

      bodyHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <div style="display: grid; grid-template-columns: 1fr 1.4fr; gap: 1rem; align-items: center; margin-bottom: 0.65rem;">
            <!-- Logo Specimen Box -->
            <div class="canvas-card" style="text-align: center; padding: 1.5rem; border: 2px dashed rgba(236,72,153,0.3); background: rgba(0,0,0,0.4);">
              <div style="font-size: 1.6rem; font-weight: 900; letter-spacing: 0.2em; color: #ffffff;">${escapeHtml(d.logoText || "BRAND")}</div>
              <div style="font-size: 0.7rem; font-weight: 600; letter-spacing: 0.3em; color: #ec4899; margin-top: 0.2rem;">${escapeHtml(d.logoSub || "")}</div>
              <div style="font-size: 0.65rem; color: rgba(255,255,255,0.4); margin-top: 0.5rem; text-transform: uppercase;">[ Minimum Clear Space Margin: 'X' ]</div>
            </div>
            <!-- Clear space narrative -->
            <div class="canvas-card">
              <div style="font-size: 0.8rem; font-weight: 700; color: #ec4899; text-transform: uppercase; margin-bottom: 0.35rem;">Clear Space Rule</div>
              <p style="font-size: 0.76rem; color: rgba(255,255,255,0.8); line-height: 1.45; margin: 0;">${escapeHtml(d.clearSpaceDesc || "")}</p>
            </div>
          </div>

          <!-- Dos and Donts Grid -->
          <div class="logo-rules-grid">
            <div class="rule-card do-card">
              <div style="font-size: 0.8rem; font-weight: 700; color: #10b981; margin-bottom: 0.4rem; text-transform: uppercase;">Recommended Logo Usage</div>
              <ul style="list-style: none; padding: 0; margin: 0;">${dos}</ul>
            </div>
            <div class="rule-card dont-card">
              <div style="font-size: 0.8rem; font-weight: 700; color: #ef4444; margin-bottom: 0.4rem; text-transform: uppercase;">Strict Logo Prohibitions</div>
              <ul style="list-style: none; padding: 0; margin: 0;">${donts}</ul>
            </div>
          </div>
        </div>
      `;
      break;
    }

    case "colors": {
      const swatches = slide.data?.swatches || [];
      const guidance = slide.data?.guidance || "";

      const cards = swatches.map(s => `
        <div class="color-swatch-card">
          <div class="swatch-color-box" style="background-color: ${escapeHtml(s.hex)};"></div>
          <div class="swatch-info-box">
            <div class="swatch-name">${escapeHtml(s.name || "")}</div>
            <div class="swatch-hex">${escapeHtml(s.hex || "")}</div>
            <div style="font-size: 0.65rem; color: #94a3b8; margin-top: 0.15rem;">${escapeHtml(s.role || "")}</div>
          </div>
        </div>
      `).join("");

      bodyHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <div class="swatches-grid">${cards}</div>
          <div class="canvas-card" style="margin-top: 0.85rem; padding: 0.65rem 0.95rem; font-size: 0.75rem; color: rgba(255,255,255,0.8); border-left: 3px solid #ec4899;">
            💡 <strong>Hierarchy Rule:</strong> ${escapeHtml(guidance)}
          </div>
        </div>
      `;
      break;
    }

    case "typography": {
      const d = slide.data || {};
      const samples = (d.samples || []).map(sm => `
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 6px; padding: 0.65rem 0.85rem;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.25rem;">
            <span style="font-size: 0.72rem; color: #ec4899; font-weight: 700; text-transform: uppercase;">${escapeHtml(sm.label || "")}</span>
            <span style="font-size: 0.68rem; color: #94a3b8; font-family: monospace;">${escapeHtml(sm.spec || "")}</span>
          </div>
          <div style="font-size: 1.05rem; font-weight: 700; color: #ffffff;">${escapeHtml(sm.sample || "")}</div>
        </div>
      `).join("");

      bodyHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <div class="type-specimen-grid">
            <div class="canvas-card" style="border-top: 3px solid #ec4899;">
              <div style="font-size: 0.72rem; font-weight: 700; color: #ec4899; text-transform: uppercase;">Primary Display Typeface</div>
              <div style="font-size: 1.25rem; font-weight: 800; color: #ffffff; margin: 0.25rem 0 0.15rem;">${escapeHtml(d.primaryFont || "")}</div>
              <div style="font-size: 0.74rem; color: rgba(255,255,255,0.7);">${escapeHtml(d.primaryRole || "")}</div>
            </div>
            <div class="canvas-card" style="border-top: 3px solid #8b5cf6;">
              <div style="font-size: 0.72rem; font-weight: 700; color: #8b5cf6; text-transform: uppercase;">Secondary Body Typeface</div>
              <div style="font-size: 1.25rem; font-weight: 800; color: #ffffff; margin: 0.25rem 0 0.15rem;">${escapeHtml(d.secondaryFont || "")}</div>
              <div style="font-size: 0.74rem; color: rgba(255,255,255,0.7);">${escapeHtml(d.secondaryRole || "")}</div>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.45rem; margin-top: 0.65rem;">
            ${samples}
          </div>
        </div>
      `;
      break;
    }

    case "imagery": {
      const d = slide.data || {};
      const principles = (d.principles || []).map(pr => `
        <div class="canvas-card" style="border-top: 3px solid #ec4899;">
          <h4 style="font-size: 0.9rem; color: #ffffff; margin: 0 0 0.35rem;">${escapeHtml(pr.title || "")}</h4>
          <p style="font-size: 0.73rem; color: rgba(255,255,255,0.75); line-height: 1.35; margin: 0;">${escapeHtml(pr.desc || "")}</p>
        </div>
      `).join("");

      bodyHTML = `
        <div style="flex: 1; display: grid; grid-template-columns: 1.2fr 1fr; gap: 1rem; align-items: stretch; margin-top: 0.5rem;">
          <div style="display: flex; flex-direction: column; gap: 0.65rem; justify-content: space-between;">
            ${principles}
          </div>
          <div class="canvas-card" style="padding: 0; overflow: hidden; border: 1px solid rgba(236,72,153,0.3); border-radius: 8px;">
            <img src="${escapeHtml(d.moodUrl || "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80")}" alt="Moodboard" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'">
          </div>
        </div>
      `;
      break;
    }

    case "voice": {
      const d = slide.data || {};
      const matrix = (d.matrix || []).map(m => `
        <div class="canvas-card" style="border-top: 3px solid #8b5cf6;">
          <h4 style="font-size: 0.9rem; color: #ffffff; margin: 0 0 0.35rem;">✦ ${escapeHtml(m.trait || "")}</h4>
          <p style="font-size: 0.74rem; color: rgba(255,255,255,0.75); line-height: 1.35; margin: 0;">${escapeHtml(m.desc || "")}</p>
        </div>
      `).join("");

      bodyHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.85rem; margin-top: 0.5rem;">
            ${matrix}
          </div>
          <div class="canvas-card" style="margin-top: 0.85rem; text-align: center; background: rgba(236,72,153,0.08); border-color: rgba(236,72,153,0.3); padding: 0.85rem;">
            <div style="font-size: 0.95rem; font-weight: 700; color: #fbcfe8;">⚖️ Editorial Golden Rule: ${escapeHtml(d.goldenRule || "")}</div>
          </div>
        </div>
      `;
      break;
    }

    default: {
      bodyHTML = `<div class="canvas-card"><p>${escapeHtml(JSON.stringify(slide.data || {}))}</p></div>`;
      break;
    }
  }

  return `
    <div class="slide-header-box">
      ${kicker}
      ${title}
      ${subtitle}
    </div>
    ${bodyHTML}
  `;
}

// -------------------------------------------------------------
// Render Inspector Form
// -------------------------------------------------------------
function renderInspector() {
  const container = document.getElementById("inspector-form-fields");
  const slideLabel = document.getElementById("inspector-slide-label");
  const notesInput = document.getElementById("slide-notes-input");
  const slide = deck[activeSlideIndex];
  if (!container || !slide) return;

  if (slideLabel) {
    slideLabel.textContent = `Slide ${activeSlideIndex + 1}: ${slide.type.toUpperCase()}`;
  }
  if (notesInput) {
    notesInput.value = slide.notes || "";
  }

  container.innerHTML = "";

  // Common Header fields
  const commonRow = document.createElement("div");
  commonRow.className = "inspector-grid two-col";
  commonRow.innerHTML = `
    <div>
      <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary);">Slide Title</label>
      <input type="text" class="form-control" id="inp-title" value="${escapeHtml(slide.title || "")}">
    </div>
    <div>
      <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary);">Subtitle</label>
      <input type="text" class="form-control" id="inp-subtitle" value="${escapeHtml(slide.subtitle || "")}">
    </div>
    <div>
      <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary);">Top Kicker Badge</label>
      <input type="text" class="form-control" id="inp-kicker" value="${escapeHtml(slide.kicker || "")}">
    </div>
    <div>
      <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary);">Background Image URL</label>
      <input type="text" class="form-control" id="inp-bg" value="${escapeHtml(slide.bgImage || "")}">
    </div>
  `;
  container.appendChild(commonRow);

  commonRow.querySelector("#inp-title").addEventListener("input", (e) => {
    slide.title = e.target.value;
    renderActiveSlide();
    renderThumbnails();
  });
  commonRow.querySelector("#inp-subtitle").addEventListener("input", (e) => {
    slide.subtitle = e.target.value;
    renderActiveSlide();
  });
  commonRow.querySelector("#inp-kicker").addEventListener("input", (e) => {
    slide.kicker = e.target.value;
    renderActiveSlide();
  });
  commonRow.querySelector("#inp-bg").addEventListener("input", (e) => {
    slide.bgImage = e.target.value;
    renderActiveSlide();
  });

  // Type specific JSON editor
  const box = document.createElement("div");
  box.style.marginTop = "0.75rem";
  box.innerHTML = `<label style="font-size: 0.78rem; font-weight: 700; color: #ec4899; display: block; margin-bottom: 0.5rem;">Brand Identity Data Structure (JSON Editable):</label>`;
  const ta = document.createElement("textarea");
  ta.className = "form-control";
  ta.rows = 7;
  ta.style.fontFamily = "monospace";
  ta.style.fontSize = "0.75rem";
  ta.value = JSON.stringify(slide.data || {}, null, 2);
  ta.addEventListener("input", (e) => {
    try {
      slide.data = JSON.parse(e.target.value);
      renderActiveSlide();
    } catch (err) {
      // typing
    }
  });
  box.appendChild(ta);
  container.appendChild(box);
}

// -------------------------------------------------------------
// Slide Manipulations
// -------------------------------------------------------------
function handleAddSlide() {
  const newSlide = {
    id: `slide-${Date.now()}`,
    type: "voice",
    title: "Brand Applications & Touchpoints",
    subtitle: "Guidelines across digital interfaces, physical stationery, and social media",
    kicker: "Applications",
    notes: "Present the brand application touchpoints.",
    data: {
      matrix: [
        { trait: "Digital UI", desc: "Dark mode primary, micro-interactions with 200ms easing curves." },
        { trait: "Print & Packaging", desc: "Soy inks, FSC recycled heavy cardstock, blind debossing." },
        { trait: "Social Editorial", desc: "Monochromatic editorial carousels with sharp typographic focus." }
      ],
      goldenRule: '"Consistency across touchpoints builds enduring brand trust."'
    }
  };
  deck.splice(activeSlideIndex + 1, 0, newSlide);
  activeSlideIndex += 1;
  renderThumbnails();
  renderActiveSlide();
  renderInspector();
  showToast("Slide added!");
}

function handleMoveUp() {
  if (activeSlideIndex > 0) {
    const temp = deck[activeSlideIndex];
    deck[activeSlideIndex] = deck[activeSlideIndex - 1];
    deck[activeSlideIndex - 1] = temp;
    activeSlideIndex -= 1;
    renderThumbnails();
    renderActiveSlide();
    renderInspector();
  }
}

function handleMoveDown() {
  if (activeSlideIndex < deck.length - 1) {
    const temp = deck[activeSlideIndex];
    deck[activeSlideIndex] = deck[activeSlideIndex + 1];
    deck[activeSlideIndex + 1] = temp;
    activeSlideIndex += 1;
    renderThumbnails();
    renderActiveSlide();
    renderInspector();
  }
}

function handleDeleteSlide() {
  if (deck.length <= 1) {
    alert("You must keep at least one slide in your presentation.");
    return;
  }
  if (confirm("Delete active slide?")) {
    deck.splice(activeSlideIndex, 1);
    if (activeSlideIndex >= deck.length) {
      activeSlideIndex = deck.length - 1;
    }
    renderThumbnails();
    renderActiveSlide();
    renderInspector();
    showToast("Slide deleted.");
  }
}

// -------------------------------------------------------------
// Presenter Mode
// -------------------------------------------------------------
function startPresenterMode() {
  const container = document.getElementById("presenter-fullscreen-container");
  if (!container) return;
  container.classList.add("active");
  renderPresenterSlide();

  presenterSeconds = 0;
  updateTimerDisplay();
  if (presenterTimerInterval) clearInterval(presenterTimerInterval);
  presenterTimerInterval = setInterval(() => {
    presenterSeconds += 1;
    updateTimerDisplay();
  }, 1000);

  if (container.requestFullscreen) {
    container.requestFullscreen().catch(() => {});
  }
}

function exitPresenterMode() {
  const container = document.getElementById("presenter-fullscreen-container");
  if (!container) return;
  container.classList.remove("active");
  if (presenterTimerInterval) clearInterval(presenterTimerInterval);
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
}

function renderPresenterSlide() {
  const content = document.getElementById("presenter-content");
  const stage = document.getElementById("presenter-stage");
  const counter = document.getElementById("hud-counter");
  const notesText = document.getElementById("presenter-notes-text");
  const slide = deck[activeSlideIndex];
  if (!content || !stage || !slide) return;

  if (slide.bgImage) {
    stage.style.backgroundImage = `url('${slide.bgImage}')`;
  } else {
    stage.style.backgroundImage = "none";
  }

  content.innerHTML = generateSlideHTML(slide);

  if (counter) {
    counter.textContent = `${activeSlideIndex + 1} / ${deck.length}`;
  }
  if (notesText) {
    notesText.textContent = slide.notes || "No speaker notes recorded.";
  }
}

function navigatePresenter(dir) {
  const newIndex = activeSlideIndex + dir;
  if (newIndex >= 0 && newIndex < deck.length) {
    activeSlideIndex = newIndex;
    renderPresenterSlide();
    renderThumbnails();
    renderActiveSlide();
    renderInspector();
  }
}

function togglePresenterNotes() {
  const notes = document.getElementById("presenter-speaker-notes");
  if (notes) {
    notes.classList.toggle("active");
  }
}

function updateTimerDisplay() {
  const timer = document.getElementById("hud-timer");
  if (!timer) return;
  const mins = String(Math.floor(presenterSeconds / 60)).padStart(2, "0");
  const secs = String(presenterSeconds % 60).padStart(2, "0");
  timer.textContent = `${mins}:${secs}`;
}

// -------------------------------------------------------------
// Print / PDF Export
// -------------------------------------------------------------
function triggerPrintBrochure() {
  const printContainer = document.getElementById("print-proposal-container");
  if (!printContainer) return;

  let pagesHTML = `
    <div style="text-align: center; margin-bottom: 2.5rem; border-bottom: 2px solid #db2777; padding-bottom: 1.5rem;">
      <h1 style="color: #db2777; font-size: 2.2rem; margin: 0;">Brand Identity Guidelines Deck</h1>
      <p style="color: #475569; font-size: 1rem; margin-top: 0.5rem;">Preset: ${escapeHtml(currentPreset.toUpperCase())}</p>
    </div>
  `;

  deck.forEach((slide, idx) => {
    pagesHTML += `
      <div class="print-slide-page">
        <div style="font-size: 0.75rem; text-transform: uppercase; color: #db2777; font-weight: 700; margin-bottom: 0.35rem;">Slide ${idx + 1} &bull; ${escapeHtml(slide.type.toUpperCase())}</div>
        <h2 style="font-size: 1.6rem; margin: 0 0 0.4rem; color: #0f172a;">${escapeHtml(slide.title || "")}</h2>
        <p style="font-size: 0.95rem; color: #475569; margin: 0 0 1.25rem;">${escapeHtml(slide.subtitle || "")}</p>
        <div style="padding: 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
          ${generateSlideHTML(slide)}
        </div>
      </div>
    `;
  });

  printContainer.innerHTML = pagesHTML;
  window.print();
}

// -------------------------------------------------------------
// JSON Export & Import
// -------------------------------------------------------------
function exportDeckJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(deck, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `brand-presentation-${currentPreset}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("Brand Deck JSON exported!");
}

function importDeckJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      if (Array.isArray(imported) && imported.length > 0) {
        deck = imported;
        activeSlideIndex = 0;
        renderThumbnails();
        renderActiveSlide();
        renderInspector();
        showToast("Brand Deck JSON loaded successfully!");
      } else {
        alert("Invalid presentation JSON format.");
      }
    } catch (err) {
      alert("Failed to parse JSON file.");
    }
  };
  reader.readAsText(file);
}

// Escape HTML helper
function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}