// Product Catalog Presentation - Client-side Interactive Logic

const CATALOG_PRESETS = {
  "minimalist-tech": [
    {
      id: "slide-1",
      type: "cover",
      title: "Aura Studio: Precision Audio & Workspaces",
      subtitle: "Autumn / Winter 2026 Commercial Lookbook & Wholesale Catalog",
      kicker: "Commercial Collection",
      bgImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80",
      notes: "Introduce the brand ethos: acoustic excellence paired with architectural Scandinavian minimalism.",
      data: {
        brand: "Aura Studio Design Labs",
        collection: "Aura Horizon Collection 2026",
        tagline: "Designed for focused creation & uncompromising acoustic clarity",
        contact: "wholesale@example.org &bull; B2B Portal"
      }
    },
    {
      id: "slide-2",
      type: "grid",
      title: "Core Hardware Product Showcase",
      subtitle: "High-velocity SKU lineup driving top-decile retail sell-through",
      kicker: "Product Lineup",
      notes: "Mention that all three products share synchronized wireless frequency channels and uniform space gray / silver anodization.",
      data: {
        products: [
          {
            title: "Aura One Wireless ANC Headphones",
            sku: "AUR-ANC-01",
            msrp: "$349",
            wholesale: "$175",
            img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
            features: "40mm Beryllium drivers, active noise cancellation, 45h battery life, magnetic lambskin earcups."
          },
          {
            title: "Desk Beam Lightbar Pro",
            sku: "AUR-LGT-02",
            msrp: "$149",
            wholesale: "$75",
            img: "https://images.unsplash.com/photo-1585336261026-c276bc537e28?auto=format&fit=crop&w=600&q=80",
            features: "Asymmetric optical reflection, 95+ CRI natural sunlight spectrum, wireless rotary dial control."
          },
          {
            title: "Walnut Qi2 MagSafe Dock",
            sku: "AUR-DCK-03",
            msrp: "$99",
            wholesale: "$49",
            img: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80",
            features: "Solid American walnut base, 15W Qi2 rapid magnetic induction, braided nylon cable."
          }
        ]
      }
    },
    {
      id: "slide-3",
      type: "spotlight",
      title: "Hero Product Spotlight: Aura One ANC",
      subtitle: "Flagship wireless studio headphones with 82% buyer repurchase intent",
      kicker: "Hero Feature",
      notes: "Highlight our 50% wholesale margin structure and guaranteed retail packaging co-marketing funds.",
      data: {
        product: {
          title: "Aura One ANC Studio Headphones",
          sku: "AUR-ANC-01",
          msrp: "$349",
          wholesale: "$175 (50% Retail Margin)",
          img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
          tag: "⭐️ CES Innovation Honoree",
          specs: [
            "Proprietary 40mm Beryllium acoustic drivers with sub-10ms latency",
            "Hybrid 4-microphone Active Noise Cancellation with ambient transparency",
            "45-hour continuous playback with 10-minute quick charge USB-C",
            "CNC machined aluminum frame with breathable memory foam cushions"
          ]
        }
      }
    },
    {
      id: "slide-4",
      type: "lookbook",
      title: "Materials, Sustainability & Craftsmanship",
      subtitle: "Circular engineering philosophy engineered to endure a lifetime",
      kicker: "Brand Values & Ethics",
      notes: "B-Corp certified manufacturing process. Retail buyers love highlighting this in POS displays.",
      data: {
        pillars: [
          {
            title: "100% Recycled Aluminum",
            desc: "Precision-milled unibody chassis utilizing aerospace-grade recycled aluminum alloys with zero virgin plastic waste."
          },
          {
            title: "FSC-Certified Hardwoods",
            desc: "Sustainably harvested North American walnut and European white oak finished with non-toxic botanical oils."
          },
          {
            title: "Modular Repairability",
            desc: "Designed with magnetic user-replaceable cushions, modular headband clips, and repairable internal batteries."
          }
        ]
      }
    },
    {
      id: "slide-5",
      type: "wholesale",
      title: "Wholesale Tiers & Volume Ordering",
      subtitle: "Predictable delivery pipelines and structured margin brackets for retailers",
      kicker: "Wholesale Packages",
      notes: "All opening orders include complimentary point-of-sale acrylic counter displays.",
      data: {
        tiers: [
          {
            name: "Tier 1: Boutique Retailer",
            price: "45% Margin",
            unit: "MOQ: 25 Units Mix & Match",
            desc: "Net 30 terms upon credit approval, free branded acrylic POP counter display, 2-day domestic dispatch."
          },
          {
            name: "Tier 2: Premium Department",
            price: "52% Margin",
            unit: "MOQ: 100 Units",
            featured: true,
            badge: "Most Common",
            desc: "Free floor display unit, $1,500 co-op marketing fund, Net 60 terms, dedicated B2B account director."
          },
          {
            name: "Tier 3: Global Enterprise",
            price: "60% Margin",
            unit: "MOQ: 500+ Units",
            desc: "Custom retail packaging, localized documentation, direct factory FOB pricing, EDI integration."
          }
        ],
        terms: "Minimum Opening Order: $4,500 &bull; Net 30/60 Days &bull; EDI & CSV Invoicing Supported.",
        contact: "Buyer Inquiries: b2b@example.org &bull; Phone +1 (800) 412-AURA"
      }
    }
  ],

  "sustainable-luxury": [
    {
      id: "slide-1",
      type: "cover",
      title: "Botanica Luxe: High-Performance Botanical Care",
      subtitle: "Spring / Summer 2026 Clean Beauty Wholesale Lookbook",
      kicker: "Luxury Skincare",
      bgImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80",
      notes: "Present our clinically validated organic botanical formulations and retail shelf appeal.",
      data: {
        brand: "Botanica Luxe Laboratory",
        collection: "Cellular Longevity Collection",
        tagline: "Clinically proven bio-fermented actives with zero compromise",
        contact: "wholesale@example.com"
      }
    },
    {
      id: "slide-2",
      type: "grid",
      title: "Clean Beauty Core Lineup",
      subtitle: "Top-rated hero formulations with 84% 60-day customer retention",
      kicker: "Product Showcase",
      notes: "All formulations are dermatologist tested, vegan, and packaged in refillable violet Miron glass.",
      data: {
        products: [
          {
            title: "Cellular Renewal Squalane Elixir",
            sku: "BOT-ELX-01",
            msrp: "$125",
            wholesale: "$60",
            img: "https://images.unsplash.com/photo-1608248597359-269666cf4032?auto=format&fit=crop&w=600&q=80",
            features: "10% Bio-retinol, plant-derived squalane, cold-pressed sea buckthorn berry oil."
          },
          {
            title: "Marine Algae Velvet Clay Mask",
            sku: "BOT-MSK-02",
            msrp: "$88",
            wholesale: "$42",
            img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80",
            features: "French green clay, spirulina micro-nutrients, hyaluronic acid moisture barrier."
          },
          {
            title: "Ceramide Night Treatment Balm",
            sku: "BOT-BLM-03",
            msrp: "$110",
            wholesale: "$52",
            img: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80",
            features: "Lipid complex 3, blue tansy floral soothing oil, organic shea butter."
          }
        ]
      }
    },
    {
      id: "slide-3",
      type: "spotlight",
      title: "Hero Product: Cellular Renewal Elixir",
      subtitle: "Award-winning clean skincare hero driving 62% of brand revenue",
      kicker: "Hero Spotlight",
      notes: "Winner of Vogue Beauty 2026 Best Facial Oil Award.",
      data: {
        product: {
          title: "Cellular Renewal Squalane Elixir",
          sku: "BOT-ELX-01",
          msrp: "$125",
          wholesale: "$60 (52% Gross Retail Margin)",
          img: "https://images.unsplash.com/photo-1608248597359-269666cf4032?auto=format&fit=crop&w=800&q=80",
          tag: "⭐️ Best Clean Beauty 2026",
          specs: [
            "Clinically demonstrated 38% reduction in fine line depth after 28 days",
            "100% Sugarcane-derived Squalane carrier with bio-fermented peptides",
            "Violet Miron biophotonic glass shields actives from harmful UV light",
            "Certified Leaping Bunny cruelty-free, vegan & carbon-neutral verified"
          ]
        }
      }
    },
    {
      id: "slide-4",
      type: "lookbook",
      title: "Sustainable Packaging & Refill Architecture",
      subtitle: "Zero virgin plastics, recyclable aluminum caps, and closed-loop refill pods",
      kicker: "Sustainability",
      notes: "Highlight our closed-loop refill system which increases customer lifetime value by 3.2x.",
      data: {
        pillars: [
          {
            title: "Biophotonic Violet Glass",
            desc: "Blocks harmful visible light spectrum while permitting energizing UVA and infrared rays to prolong active potency."
          },
          {
            title: "Refill Cartridge Ecosystem",
            desc: "Consumers retain heavy glass vessels and swap lightweight 100% compostable refill pods every 60 days."
          },
          {
            title: "Carbon-Negative Supply Chain",
            desc: "Direct farm sourcing in Southern France and Costa Rica with fair-trade living wage compensation."
          }
        ]
      }
    },
    {
      id: "slide-5",
      type: "wholesale",
      title: "Retail Partner Margin Structure",
      subtitle: "High average order values and lucrative repeat purchase cadences",
      kicker: "Wholesale Tiers",
      notes: "Free tester bottles and branded linen shelf talkers provided on all orders.",
      data: {
        tiers: [
          {
            name: "Clean Beauty Boutique",
            price: "50% Margin",
            unit: "MOQ: $1,200",
            desc: "Full tester set included, branded glass risers, staff training webinar with founder."
          },
          {
            name: "Department Store Prestige",
            price: "55% Margin",
            unit: "MOQ: $5,000",
            featured: true,
            badge: "Bestseller",
            desc: "Dedicated counter display, GWP (Gift with Purchase) deluxe mini bundles, Net 60."
          },
          {
            name: "Luxury Spa & Resort",
            price: "60% Margin",
            unit: "MOQ: $12,000",
            desc: "Professional back-bar gallon sizes, protocol menu design, seasonal promotional support."
          }
        ],
        terms: "Orders ship within 48h from Paris / New Jersey &bull; Free shipping on orders over $2,500.",
        contact: "Partner Inquiries: stockist@example.com &bull; +1 (888) 920-LUXE"
      }
    }
  ],

  "designer-apparel": [
    {
      id: "slide-1",
      type: "cover",
      title: "Kinetics Atelier: Architectural Outerwear",
      subtitle: "Spring / Summer 2027 International Buyer Presentation",
      kicker: "Designer Lookbook",
      bgImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
      notes: "Guide luxury buyers through our technical tailoring, Japanese waterproof gabardine, and unisex silhouettes.",
      data: {
        brand: "Kinetics Atelier Tokyo &bull; Paris",
        collection: "System 04: Kinetic Geometries",
        tagline: "Technical performance meets timeless architectural tailoring",
        contact: "showroom@example.com"
      }
    },
    {
      id: "slide-2",
      type: "grid",
      title: "Seasonal Collection Lookbook",
      subtitle: "Sculptural forms crafted from technical Japanese textiles",
      kicker: "Collection Lineup",
      notes: "Each garment features magnetic Fidlock closures and internal waterproof seam taping.",
      data: {
        products: [
          {
            title: "Modular Trench Coat MK-IV",
            sku: "KIN-TRN-04",
            msrp: "$780",
            wholesale: "$380",
            img: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80",
            features: "3-Layer waterproof membrane, detachable storm collar, internal carry harness."
          },
          {
            title: "Seamless 3D Merino Crewneck",
            sku: "KIN-KNT-02",
            msrp: "$340",
            wholesale: "$165",
            img: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=600&q=80",
            features: "17.5 Micron ZQ-certified merino wool, zero-waste 3D knit construction."
          },
          {
            title: "Aeroflex Chelsea Hybrid Boot",
            sku: "KIN-BOT-01",
            msrp: "$490",
            wholesale: "$240",
            img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80",
            features: "Vibram Arctic Grip outsole, waterproof Italian calfskin, orthotic EVA midsole."
          }
        ]
      }
    },
    {
      id: "slide-3",
      type: "spotlight",
      title: "Hero Piece: Modular Trench Coat MK-IV",
      subtitle: "The definitive synthesis of luxury craftsmanship and inclement weather shielding",
      kicker: "Hero Garment",
      notes: "Featured in Hypebeast, GQ, and Highsnobiety. Strong sell-through in NYC, London, and Tokyo.",
      data: {
        product: {
          title: "Modular Trench Coat MK-IV",
          sku: "KIN-TRN-04",
          msrp: "$780",
          wholesale: "$380 (51.3% Wholesale Margin)",
          img: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80",
          tag: "★ Editorial Must-Have",
          specs: [
            "Japanese 3-layer breathable micro-twill membrane (20,000mm waterproof rating)",
            "Fidlock magnetic snap fasteners and bonded YKK Aquaguard zippers",
            "Removable interior insulated vest for multi-season thermal versatility",
            "Internal shoulder harness straps for hands-free indoor carrying"
          ]
        }
      }
    },
    {
      id: "slide-4",
      type: "lookbook",
      title: "Textile Engineering & Zero Waste",
      subtitle: "Precision laser cutting and circular wool harvesting",
      kicker: "Material Science",
      notes: "Every style is numbered in limited runs of 500 units per colorway.",
      data: {
        pillars: [
          {
            title: "Hydro-Shield Japanese Twill",
            desc: "Engineered in Fukui, Japan using microscopic biomimicry lotus-leaf surface tension."
          },
          {
            title: "WholeGarment 3D Knits",
            desc: "Zero fabric scrap waste produced through precision computerized circular knitting machinery."
          },
          {
            title: "Lifetime Guarantee",
            desc: "Free hardware and seam repair service provided directly through our atelier network."
          }
        ]
      }
    },
    {
      id: "slide-5",
      type: "wholesale",
      title: "Wholesale Terms & Order Windows",
      subtitle: "Pre-order production windows and distribution agreements",
      kicker: "Commercial Terms",
      notes: "Fall delivery window closes on March 30. 30% deposit secures factory allocation.",
      data: {
        tiers: [
          {
            name: "Concept Stockist",
            price: "50% Margin",
            unit: "MOQ: 15 Units Total",
            desc: "Curated size runs, lookbook press assets, branded wooden garment hangers."
          },
          {
            name: "Department Store",
            price: "55% Margin",
            unit: "MOQ: 75 Units",
            featured: true,
            badge: "Preferred",
            desc: "Full collection access, priority showroom booking in Paris, Net 60 payment terms."
          },
          {
            name: "Flagship Exclusive",
            price: "60% Margin",
            unit: "MOQ: 250 Units",
            desc: "Territory exclusivity within metro area, co-branded pop-up installation."
          }
        ],
        terms: "Production Window: Delivery August 15 &bull; 30% Deposit upon Order &bull; Balance on Delivery.",
        contact: "Showroom Contact: showroom@example.com &bull; Paris Office +33 1 42 68 00 11"
      }
    }
  ]
};

// Global App State
let currentPreset = "minimalist-tech";
let deck = JSON.parse(JSON.stringify(CATALOG_PRESETS[currentPreset]));
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
  const select = document.getElementById("catalog-preset-select");
  if (select) {
    select.addEventListener("change", (e) => {
      currentPreset = e.target.value;
      if (CATALOG_PRESETS[currentPreset]) {
        deck = JSON.parse(JSON.stringify(CATALOG_PRESETS[currentPreset]));
        activeSlideIndex = 0;
        renderThumbnails();
        renderActiveSlide();
        renderInspector();
        showToast("Loaded Catalog Preset!");
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

  // Quick Product Adder Button
  document.getElementById("btn-add-product-item")?.addEventListener("click", handleQuickAddProduct);

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
// Quick Add Product to Active Slide
// -------------------------------------------------------------
function handleQuickAddProduct() {
  const title = document.getElementById("add-prod-title")?.value.trim();
  const sku = document.getElementById("add-prod-sku")?.value.trim();
  const msrp = document.getElementById("add-prod-msrp")?.value.trim();
  const wholesale = document.getElementById("add-prod-wholesale")?.value.trim();
  const img = document.getElementById("add-prod-img")?.value.trim();

  if (!title) {
    alert("Please enter at least a Product Title.");
    return;
  }

  const newProd = {
    title: title,
    sku: sku || "SKU-PROD-01",
    msrp: msrp || "$199",
    wholesale: wholesale || "$99",
    img: img || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
    features: "High-grade finish, retail packaging ready."
  };

  const slide = deck[activeSlideIndex];
  if (!slide.data) slide.data = {};

  if (slide.type === "grid") {
    if (!Array.isArray(slide.data.products)) slide.data.products = [];
    slide.data.products.push(newProd);
  } else if (slide.type === "spotlight") {
    slide.data.product = {
      title: newProd.title,
      sku: newProd.sku,
      msrp: newProd.msrp,
      wholesale: newProd.wholesale,
      img: newProd.img,
      tag: "★ New Product Spotlight",
      specs: ["Engineered to perfection", "High-velocity retail margin", "Packaging ready"]
    };
  } else {
    // If on another slide type, create a new grid slide
    const gridSlide = {
      id: `slide-${Date.now()}`,
      type: "grid",
      title: "Additional Product Lineup",
      subtitle: "New products added to catalog",
      kicker: "Product Lineup",
      notes: "Product showcase notes.",
      data: {
        products: [newProd]
      }
    };
    deck.splice(activeSlideIndex + 1, 0, gridSlide);
    activeSlideIndex += 1;
  }

  // Clear inputs
  document.getElementById("add-prod-title").value = "";
  document.getElementById("add-prod-sku").value = "";
  document.getElementById("add-prod-msrp").value = "";
  document.getElementById("add-prod-wholesale").value = "";
  document.getElementById("add-prod-img").value = "";

  renderThumbnails();
  renderActiveSlide();
  renderInspector();
  showToast("Product added to catalog!");
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
    case "cover": {
      const d = slide.data || {};
      bodyHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 1rem;">
          <div class="canvas-card" style="max-width: 600px; border-left: 4px solid #8b5cf6;">
            <div style="font-size: 0.8rem; color: #8b5cf6; font-weight: 700; text-transform: uppercase;">${escapeHtml(d.brand || "")}</div>
            <div style="font-size: 1.2rem; color: #ffffff; font-weight: 700; margin: 0.25rem 0;">${escapeHtml(d.collection || "")}</div>
            <p style="font-size: 0.85rem; color: rgba(255,255,255,0.8); line-height: 1.4; margin: 0.4rem 0 0;">${escapeHtml(d.tagline || "")}</p>
            <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 0.65rem;">${escapeHtml(d.contact || "")}</div>
          </div>
        </div>
      `;
      break;
    }

    case "grid": {
      const prods = slide.data?.products || [];
      const prodCards = prods.map(p => `
        <div class="product-card">
          <div class="product-img-box">
            <img src="${escapeHtml(p.img || "")}" alt="${escapeHtml(p.title || "")}" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'">
          </div>
          <div class="product-info-box">
            <div>
              <div class="product-title">${escapeHtml(p.title || "")}</div>
              <div class="product-sku">SKU: ${escapeHtml(p.sku || "")}</div>
              <div style="font-size: 0.7rem; color: rgba(255,255,255,0.65); line-height: 1.3; margin-top: 0.25rem;">${escapeHtml(p.features || "")}</div>
            </div>
            <div class="product-prices">
              <div>
                <span style="font-size: 0.65rem; color: #94a3b8; display: block;">MSRP</span>
                <span class="price-msrp">${escapeHtml(p.msrp || "")}</span>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 0.65rem; color: #94a3b8; display: block;">Wholesale</span>
                <span class="price-wholesale">${escapeHtml(p.wholesale || "")}</span>
              </div>
            </div>
          </div>
        </div>
      `).join("");

      bodyHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
          <div class="product-grid">${prodCards}</div>
        </div>
      `;
      break;
    }

    case "spotlight": {
      const p = slide.data?.product || {};
      const specs = (p.specs || []).map(s => `
        <li style="font-size: 0.78rem; color: rgba(255,255,255,0.85); margin-bottom: 0.35rem; display: flex; align-items: flex-start; gap: 0.5rem;">
          <span style="color: #8b5cf6; font-weight: bold;">✦</span> <span>${escapeHtml(s)}</span>
        </li>
      `).join("");

      bodyHTML = `
        <div class="spotlight-wrapper">
          <div class="spotlight-media">
            <img src="${escapeHtml(p.img || "")}" alt="${escapeHtml(p.title || "")}" onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'">
          </div>
          <div class="canvas-card" style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
            <div>
              <span style="display: inline-block; font-size: 0.7rem; font-weight: 700; background: rgba(139,92,246,0.2); color: #c4b5fd; padding: 0.2rem 0.5rem; border-radius: 9999px; margin-bottom: 0.4rem;">
                ${escapeHtml(p.tag || "Feature Product")}
              </span>
              <h3 style="font-size: 1.15rem; color: #ffffff; margin: 0 0 0.25rem;">${escapeHtml(p.title || "")}</h3>
              <div style="font-size: 0.75rem; color: #94a3b8; font-family: monospace; margin-bottom: 0.65rem;">SKU: ${escapeHtml(p.sku || "")}</div>
              <ul style="list-style: none; padding: 0; margin: 0 0 0.75rem;">${specs}</ul>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.5rem;">
              <div>
                <span style="font-size: 0.68rem; color: #94a3b8; display: block;">MSRP Retail</span>
                <span style="font-size: 1.1rem; font-weight: 800; color: #8b5cf6;">${escapeHtml(p.msrp || "")}</span>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 0.68rem; color: #94a3b8; display: block;">Wholesale B2B</span>
                <span style="font-size: 0.95rem; font-weight: 700; color: #38bdf8;">${escapeHtml(p.wholesale || "")}</span>
              </div>
            </div>
          </div>
        </div>
      `;
      break;
    }

    case "lookbook": {
      const pillars = slide.data?.pillars || [];
      const cards = pillars.map(pil => `
        <div class="canvas-card" style="border-top: 3px solid #ec4899; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h4 style="font-size: 0.9rem; color: #ffffff; margin: 0 0 0.35rem;">${escapeHtml(pil.title || "")}</h4>
            <p style="font-size: 0.74rem; color: rgba(255,255,255,0.75); line-height: 1.35; margin: 0;">${escapeHtml(pil.desc || "")}</p>
          </div>
        </div>
      `).join("");

      bodyHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.85rem;">${cards}</div>
        </div>
      `;
      break;
    }

    case "wholesale": {
      const tiers = slide.data?.tiers || [];
      const terms = slide.data?.terms || "";
      const contact = slide.data?.contact || "";

      const cards = tiers.map(t => `
        <div class="pricing-card ${t.featured ? "featured" : ""}">
          ${t.badge ? `<div class="pricing-badge">${escapeHtml(t.badge)}</div>` : ""}
          <div>
            <div style="font-size: 0.85rem; font-weight: 700; color: #ffffff;">${escapeHtml(t.name || "")}</div>
            <div style="font-size: 1.35rem; font-weight: 800; color: #8b5cf6; margin: 0.35rem 0 0.1rem;">${escapeHtml(t.price || "")}</div>
            <div style="font-size: 0.7rem; color: rgba(255,255,255,0.6); text-transform: uppercase;">${escapeHtml(t.unit || "")}</div>
          </div>
          <div style="font-size: 0.75rem; color: rgba(255,255,255,0.8); margin-top: 0.6rem; line-height: 1.35;">${escapeHtml(t.desc || "")}</div>
        </div>
      `).join("");

      bodyHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.85rem; margin-top: 0.5rem;">${cards}</div>
          <div class="canvas-card" style="margin-top: 0.85rem; padding: 0.6rem 0.9rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
            <div style="font-size: 0.75rem; color: rgba(255,255,255,0.7);">${escapeHtml(terms)}</div>
            <div style="font-size: 0.8rem; font-weight: 700; color: #8b5cf6;">${escapeHtml(contact)}</div>
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
  const adderBox = document.getElementById("product-adder-container");
  const slide = deck[activeSlideIndex];
  if (!container || !slide) return;

  if (slideLabel) {
    slideLabel.textContent = `Slide ${activeSlideIndex + 1}: ${slide.type.toUpperCase()}`;
  }
  if (notesInput) {
    notesInput.value = slide.notes || "";
  }

  // Show/Hide Quick Adder
  if (adderBox) {
    adderBox.style.display = (slide.type === "grid" || slide.type === "spotlight") ? "block" : "none";
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
  box.innerHTML = `<label style="font-size: 0.78rem; font-weight: 700; color: #8b5cf6; display: block; margin-bottom: 0.5rem;">Catalog Data (JSON Editable):</label>`;
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
    type: "grid",
    title: "Seasonal New Releases",
    subtitle: "Curated additional collection line",
    kicker: "New SKUs",
    notes: "Present key points on this new lineup.",
    data: {
      products: [
        {
          title: "Aura Artisan Stand",
          sku: "AUR-STD-05",
          msrp: "$79",
          wholesale: "$39",
          img: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80",
          features: "Ergonomic elevation, cable management groove."
        }
      ]
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
    <div style="text-align: center; margin-bottom: 2.5rem; border-bottom: 2px solid #7c3aed; padding-bottom: 1.5rem;">
      <h1 style="color: #7c3aed; font-size: 2.2rem; margin: 0;">Aura Studio &bull; Commercial Lookbook &amp; Catalog</h1>
      <p style="color: #475569; font-size: 1rem; margin-top: 0.5rem;">Collection: ${escapeHtml(currentPreset.toUpperCase())}</p>
    </div>
  `;

  deck.forEach((slide, idx) => {
    pagesHTML += `
      <div class="print-slide-page">
        <div style="font-size: 0.75rem; text-transform: uppercase; color: #7c3aed; font-weight: 700; margin-bottom: 0.35rem;">Slide ${idx + 1} &bull; ${escapeHtml(slide.type.toUpperCase())}</div>
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
  downloadAnchor.setAttribute("download", `catalog-presentation-${currentPreset}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("Catalog JSON exported!");
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
        showToast("Catalog JSON loaded successfully!");
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