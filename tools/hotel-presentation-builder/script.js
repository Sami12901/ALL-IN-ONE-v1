// Hotel Presentation Builder - Client-side Interactive Logic

const HOTEL_PRESETS = {
  "azure-resort": [
    {
      id: "slide-1",
      type: "overview",
      title: "Grand Azure Seaside Resort & Villas",
      subtitle: "Where Mediterranean Glamour Meets World-Class Hospitality on the French Riviera",
      kicker: "Property Overview",
      bgImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
      notes: "Welcome event planners and corporate executives. Reiterate our private beach, superyacht marina access, and 5-star hospitality credentials.",
      data: {
        stars: "★★★★★ Palace Distinction",
        location: "Côte d'Azur &bull; French Riviera, France",
        summary: "Perched gracefully above the sparkling Mediterranean, the Grand Azure provides an unforgettable sanctuary for high-profile executive summits, luxury galas, and discerning travelers.",
        stats: [
          { val: "180", label: "Suites & Villas" },
          { val: "1.2 km", label: "Private Shoreline" },
          { val: "3", label: "Michelin Stars" },
          { val: "700", label: "Gala Capacity" }
        ]
      }
    },
    {
      id: "slide-2",
      type: "suites",
      title: "Ultra-Luxury Suites, Villas & Amenities",
      subtitle: "Uncompromising residential comfort with panoramic azure views",
      kicker: "Accommodations & Amenities",
      notes: "Every suite includes a private heated terrace jacuzzi and dedicated 24/7 butler service.",
      data: {
        suites: [
          {
            name: "The Presidential Sea Penthouse",
            area: "340 sqm / 3,660 sqft",
            view: "Panoramic 270° Mediterranean Sea View",
            features: "Private rooftop heated infinity pool, wrap-around marble terrace, private gym, and separate security entourage quarters."
          },
          {
            name: "Royal Azure Beachfront Villa",
            area: "520 sqm / 5,600 sqft",
            view: "Direct Private Beach Access",
            features: "4 en-suite king bedrooms, private freshwater pool, private chef kitchen, and private golf buggy for estate transit."
          }
        ],
        amenities: [
          "24/7 Dedicated White-Glove Butler Service",
          "3,000 sqm Guerlain Spa & Thalassotherapy Center",
          "Olympic-sized heated saltwater cliffside infinity pool",
          "Private heliport with direct airport helicopter shuttle"
        ]
      }
    },
    {
      id: "slide-3",
      type: "dining",
      title: "Signature Fine Dining & Grand Ballrooms",
      subtitle: "Culinary excellence paired with expansive, flexible event venues",
      kicker: "Gastronomy & Venues",
      notes: "Our culinary master chef can design bespoke banquet menus customized to international dietary standards.",
      data: {
        venues: [
          {
            name: "Le Mirador Restaurant",
            style: "3-Michelin-Star Haute Cuisine",
            capacity: "120 Guests",
            desc: "Locally sourced wild Mediterranean catch, vintage French cellar pairings, and outdoor cliffside terrace dining."
          },
          {
            name: "Horizon Rooftop Lounge",
            style: "Sunset Champagne & Raw Bar",
            capacity: "200 Cocktail Reception",
            desc: "Panoramic sunset DJ sets, caviar tastings, and craft botanical mixology overlooking the bay."
          },
          {
            name: "The Grand Monaco Ballroom",
            style: "Pillarless Gala & Event Hall",
            capacity: "450 Banquet / 700 Reception",
            desc: "State-of-the-art 4K LED video walls, motorized rigging, and private red-carpet arrival vestibule."
          }
        ]
      }
    },
    {
      id: "slide-4",
      type: "location",
      title: "Prime Location & Strategic Connectivity",
      subtitle: "Effortless global accessibility nestled in an exclusive private peninsula",
      kicker: "Location Highlights",
      notes: "Highlight our private yacht tenders connecting directly to Monaco harbor in 15 minutes.",
      data: {
        highlights: [
          {
            title: "Nice International Airport (NCE)",
            distance: "25 Minutes / 7 Min Helicopter",
            desc: "Direct daily flights to 120 global hubs. Private executive jet terminal handling with customs clearance."
          },
          {
            title: "Private Deep-Water Marina",
            distance: "On-Site Harbor Facility",
            desc: "Berthing for superyachts up to 80 meters with full tender fueling, security, and provisioning support."
          },
          {
            title: "Monte-Carlo & Historic Old Town",
            distance: "15 Minutes Chauffeured Drive",
            desc: "Immediate proximity to world-famous casinos, luxury fashion boutiques, and cultural landmarks."
          }
        ]
      }
    },
    {
      id: "slide-5",
      type: "events",
      title: "Corporate Event Packages & Buyouts",
      subtitle: "Tailored structures for global leadership summits, product debuts, and weddings",
      kicker: "Event Packages & Pricing",
      notes: "Full resort buyout grants total exclusivity and privacy for sensitive executive meetings or weddings.",
      data: {
        packages: [
          {
            name: "Executive Day Delegate",
            price: "$220",
            unit: "per delegate / day",
            desc: "Ballroom access, high-speed fiber internet, gourmet morning tea, 3-course chef buffet lunch, and AV staging."
          },
          {
            name: "3-Day Residential Summit",
            price: "$1,450",
            unit: "per guest (3 nights)",
            featured: true,
            badge: "Most Popular",
            desc: "Oceanview Suite accommodation, all banquet dining, gala celebration dinner, and networking yacht cruise."
          },
          {
            name: "Exclusive Resort Buyout",
            price: "$125,000",
            unit: "per night (min 2 nights)",
            desc: "Complete privatization of all 180 suites, private beach, marina, heliport, and all 3 dining venues."
          }
        ],
        terms: "25% deposit upon contract signature &bull; Tailored cancellation terms &bull; Dedicated Master Event Planner assigned.",
        contact: "Direct Inquiries: events@grandazureresort.com &bull; Phone +33 4 93 00 11 22"
      }
    }
  ],

  "alpine-crest": [
    {
      id: "slide-1",
      type: "overview",
      title: "Alpine Crest Luxury Chalet & Thermal Spa",
      subtitle: "Private Mountain Grandeur and Michelin Gastronomy in the Swiss Engadine Valley",
      kicker: "Alpine Sanctuary",
      bgImage: "https://images.unsplash.com/photo-1542314831-c6a4d275765c?auto=format&fit=crop&w=1600&q=80",
      notes: "Introduce the resort's ski-in/ski-out convenience and its heritage alpine architecture.",
      data: {
        stars: "★★★★★ Superior Alpine Lodge",
        location: "St. Moritz &bull; Graubünden, Switzerland",
        summary: "Surrounded by snow-capped peaks and larch pine forests, Alpine Crest offers an ultra-exclusive sanctuary for corporate boards and luxury retreats.",
        stats: [
          { val: "92", label: "Chalet Suites" },
          { val: "3,200 m²", label: "Thermal Spa" },
          { val: "Direct", label: "Ski-in / Ski-out" },
          { val: "450", label: "Summit Capacity" }
        ]
      }
    },
    {
      id: "slide-2",
      type: "suites",
      title: "Chalet Residences, Fireplaces & Wellness",
      subtitle: "Natural Swiss pine, hand-hewn granite, and crackling log fireplaces",
      kicker: "Suites & Amenities",
      notes: "All chalets feature private cedar wood saunas and personal ski butlers.",
      data: {
        suites: [
          {
            name: "Matterhorn Panorama Penthouse",
            area: "280 sqm / 3,010 sqft",
            view: "Unobstructed Alpine Glacier Panoramas",
            features: "Double-height cathedral wood ceilings, private outdoor heated whirlpool, stone fireplace, and ski butler."
          },
          {
            name: "Alpine Crest Private Residence",
            area: "460 sqm / 4,950 sqft",
            view: "Private Mountain Forest Ridge",
            features: "5 bedrooms, private Finnish sauna, private cinema room, heated underground garage, and dedicated chef."
          }
        ],
        amenities: [
          "Private heated ski lockers with boot warmers and personal fitting",
          "3,200 sqm Thermal Spa with indoor/outdoor mineral pools",
          "Private heli-skiing pad with certified Swiss mountain guides",
          "Horse-drawn carriage transfers around St. Moritz village"
        ]
      }
    },
    {
      id: "slide-3",
      type: "dining",
      title: "Alpine Gastronomy & The Great Hall",
      subtitle: "Refined mountain culinary arts and atmospheric wood-timbered venues",
      kicker: "Dining & Venues",
      notes: "The Engadine Great Hall features acoustic engineering suited for keynotes and classical musical performances.",
      data: {
        venues: [
          {
            name: "Stüva Alpine Fine Dining",
            style: "2-Michelin-Star Contemporary Swiss",
            capacity: "90 Guests",
            desc: "Foraged alpine herbs, heritage Swiss beef, and an underground cellar boasting 15,000 vintage bottles."
          },
          {
            name: "Glacier Cigar & Single Malt Lounge",
            style: "Intimate Fireside Library",
            capacity: "60 Guests",
            desc: "Rare single malt whiskies, premium cigars, and handcrafted artisan chocolates beside open log fireplaces."
          },
          {
            name: "The Engadine Great Hall",
            style: "Timber-Beamed Alpine Ballroom",
            capacity: "280 Banquet / 450 Reception",
            desc: "High ceilings, panoramic glass wall facing the slopes, and high-definition laser projection systems."
          }
        ]
      }
    },
    {
      id: "slide-4",
      type: "location",
      title: "Alpine Access & Airport Proximity",
      subtitle: "Effortlessly connected to European financial capitals via private jet aviation",
      kicker: "Location & Transit",
      notes: "Samedan Airport accommodates private jets up to Boeing 737 VIP / Global 7500.",
      data: {
        highlights: [
          {
            title: "Engadin Airport Samedan (SMV)",
            distance: "10 Minutes Chauffeured Drive",
            desc: "Europe's highest private jet airport with dedicated VIP customs handling and de-icing facilities."
          },
          {
            title: "Corviglia & Corvatsch Cable Cars",
            distance: "Direct Ski-in / Ski-out",
            desc: "Immediate slope access connecting to over 350 km of pristine groomed ski trails."
          },
          {
            title: "Zurich International Airport (ZRH)",
            distance: "2.5 Hours Drive / 35 Min Helicopter",
            desc: "Scenic chauffeured Mercedes-Maybach transfer or quick direct helicopter flight to hotel helipad."
          }
        ]
      }
    },
    {
      id: "slide-5",
      type: "events",
      title: "Summit Packages & Chalet Buyout",
      subtitle: "World-class infrastructure for leadership symposiums and high-net-worth gatherings",
      kicker: "Pricing & Packages",
      notes: "Winter peak dates require early booking to guarantee exclusive chalet buyout dates.",
      data: {
        packages: [
          {
            name: "Alpine Leadership Pass",
            price: "$280",
            unit: "per delegate / day",
            desc: "Full Great Hall session access, high-speed fiber, thermal coffee breaks, and 3-course fondue lunch."
          },
          {
            name: "4-Day Winter Summit",
            price: "$1,850",
            unit: "per delegate (4 nights)",
            featured: true,
            badge: "Best Value",
            desc: "Chalet suite accommodation, daily ski pass, thermal spa access, and gala dinner in Stüva."
          },
          {
            name: "Complete Chalet Estate Buyout",
            price: "$85,000",
            unit: "per night (min 3 nights)",
            desc: "Total exclusivity of all 92 suites, private ski slopes access, heliport, and private chef brigades."
          }
        ],
        terms: "30% deposit upon confirmation &bull; 100% refund up to 60 days before event &bull; Dedicated concierge.",
        contact: "Inquiries: summits@alpinecrestresort.ch &bull; Phone +41 81 830 00 00"
      }
    }
  ],

  "oasis-palace": [
    {
      id: "slide-1",
      type: "overview",
      title: "The Royal Oasis Palace Resort",
      subtitle: "Palatial Arabian Architecture, Private White-Sand Beach & Regal Elegance on Palm Jumeirah",
      kicker: "Palatial Resort Overview",
      bgImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80",
      notes: "Set the stage with Arabian architectural grandeur, private beachfront, and state-of-the-art convention facilities.",
      data: {
        stars: "★★★★★ Ultra-Luxury Palace",
        location: "Palm Jumeirah &bull; Dubai, United Arab Emirates",
        summary: "Echoing the golden age of Arabian architecture with modern digital opulence, The Royal Oasis Palace offers grand event spaces, private lagoons, and palatial suites.",
        stats: [
          { val: "240", label: "Palace Suites" },
          { val: "1.5 km", label: "White Sand Beach" },
          { val: "1,200", label: "Convention Capacity" },
          { val: "8", label: "Signature Mansions" }
        ]
      }
    },
    {
      id: "slide-2",
      type: "suites",
      title: "Palace Suites, Mansions & Butler Service",
      subtitle: "Hand-carved marble, 24k gold leaf details, and private infinity lagoons",
      kicker: "Suites & Mansions",
      notes: "Private Mansions include dedicated chauffeurs, private beach stretches, and private security guards.",
      data: {
        suites: [
          {
            name: "The Royal Imperial Penthouse",
            area: "420 sqm / 4,520 sqft",
            view: "Dubai Marina Skyline & Arabian Gulf",
            features: "360-degree glass walls, private rooftop pool, dedicated elevator, cinema room, and private boardroom."
          },
          {
            name: "Lagoon Overwater Royal Mansion",
            area: "650 sqm / 7,000 sqft",
            view: "Private Beach & Lagoon",
            features: "Private infinity pool, direct yacht mooring berth, 24/7 Rolls-Royce chauffeur, and personal master chef."
          }
        ],
        amenities: [
          "Private yacht mooring with tender service to Dubai Marina",
          "Talise Imperial Moroccan Hammam & Hydrotherapy Sanctuary",
          "Dedicated 24/7 personal butler and concierge fleet",
          "Private helicopter pad with VIP fast-track to DXB airport"
        ]
      }
    },
    {
      id: "slide-3",
      type: "dining",
      title: "Award-Winning Dining & The Al-Andalus Hall",
      subtitle: "World-class dining institutions paired with the region's most versatile ballroom",
      kicker: "Cuisine & Venues",
      notes: "Al-Andalus Ballroom can be partitioned into 4 independent acoustic soundproof breakout salons.",
      data: {
        venues: [
          {
            name: "Sultan's Table",
            style: "Michelin-Starred Royal Levantine",
            capacity: "160 Guests",
            desc: "Traditional wood-fired ovens, gold leaf saffron dishes, and private dining majlis rooms."
          },
          {
            name: "Azure Beachfront Club",
            style: "Mediterranean Seafood & Cabanas",
            capacity: "350 Guests Cocktail",
            desc: "Day-to-night beachfront lounge, infinity pool cabanas, and international guest DJs."
          },
          {
            name: "The Al-Andalus Grand Ballroom",
            style: "Column-Free Palatial Ballroom",
            capacity: "800 Banquet / 1,200 Reception",
            desc: "Custom Swarovski chandeliers, 8K ultra-wide video displays, and private car-entry elevator for product launches."
          }
        ]
      }
    },
    {
      id: "slide-4",
      type: "location",
      title: "Palm Jumeirah Location & Global Transit",
      subtitle: "Centrally positioned on Dubai's iconic archipelago with effortless highway and marina access",
      kicker: "Location & Transit",
      notes: "Conveniently situated with dedicated VIP expressway access straight to Sheikh Zayed Road.",
      data: {
        highlights: [
          {
            title: "Dubai International Airport (DXB)",
            distance: "30 Minutes Chauffeured Drive",
            desc: "Round-the-clock VIP terminal transfers in hotel Rolls-Royce Phantom or Mercedes-Maybach."
          },
          {
            title: "Dubai Marina & Bluewaters",
            distance: "10 Minutes via Private Boat",
            desc: "Immediate boat tender access to premier luxury shopping, nightlife, and world-class dining."
          },
          {
            title: "Downtown Dubai & Burj Khalifa",
            distance: "20 Minutes Drive",
            desc: "Quick highway access to DIFC financial center, Dubai Opera, and Dubai World Trade Centre."
          }
        ]
      }
    },
    {
      id: "slide-5",
      type: "events",
      title: "Global Convention Tiers & Buyout",
      subtitle: "Unrivaled scale and sophistication for Fortune 500 summits and global conferences",
      kicker: "Conferences & Pricing",
      notes: "Resort buyout includes branding takeovers on digital screens, water projection shows, and private marina.",
      data: {
        packages: [
          {
            name: "Delegate Day Symposium",
            price: "$250",
            unit: "per delegate / day",
            desc: "Al-Andalus Hall access, interactive tech staging, networking lunch buffet, and evening cocktail reception."
          },
          {
            name: "Global Executive Retreat",
            price: "$1,650",
            unit: "per delegate (3 nights)",
            featured: true,
            badge: "Best Value",
            desc: "Palace Suite stay, all gala dinners, private yacht excursion, and dedicated event manager."
          },
          {
            name: "Full Island Palace Buyout",
            price: "$190,000",
            unit: "per night (min 2 nights)",
            desc: "Complete privatization of all 240 suites, 8 mansions, private beach, marina, and helicopter landing pads."
          }
        ],
        terms: "25% initial booking deposit &bull; Dedicated Master Production Director &bull; Flexible multi-currency invoicing.",
        contact: "Conventions & Weddings: events@royaloasispalace.ae &bull; VIP Desk +971 4 888 9900"
      }
    }
  ]
};

// Global App State
let currentPreset = "azure-resort";
let deck = JSON.parse(JSON.stringify(HOTEL_PRESETS[currentPreset]));
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
  const select = document.getElementById("hotel-preset-select");
  if (select) {
    select.addEventListener("change", (e) => {
      currentPreset = e.target.value;
      if (HOTEL_PRESETS[currentPreset]) {
        deck = JSON.parse(JSON.stringify(HOTEL_PRESETS[currentPreset]));
        activeSlideIndex = 0;
        renderThumbnails();
        renderActiveSlide();
        renderInspector();
        showToast("Loaded Resort Showcase Preset!");
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

  // Update presenter if open
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
    case "overview": {
      const d = slide.data || {};
      const stats = (d.stats || []).map(s => `
        <div class="stat-box">
          <div class="stat-number">${escapeHtml(s.val || "")}</div>
          <div class="stat-label">${escapeHtml(s.label || "")}</div>
        </div>
      `).join("");

      bodyHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 1rem;">
          <div class="canvas-card" style="max-width: 650px; border-left: 4px solid #f59e0b;">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <span style="font-size: 0.85rem; color: #f59e0b; font-weight: 700;">${escapeHtml(d.stars || "")}</span>
              <span style="font-size: 0.8rem; color: #94a3b8;">${escapeHtml(d.location || "")}</span>
            </div>
            <p style="font-size: 0.825rem; color: rgba(255,255,255,0.85); line-height: 1.45; margin: 0.5rem 0 0;">${escapeHtml(d.summary || "")}</p>
          </div>
          <div class="stats-row" style="max-width: 650px;">
            ${stats}
          </div>
        </div>
      `;
      break;
    }

    case "suites": {
      const suites = slide.data?.suites || [];
      const amenities = slide.data?.amenities || [];

      const suiteCards = suites.map(s => `
        <div class="suite-card">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <h3 style="font-size: 0.95rem; color: #ffffff; margin: 0;">${escapeHtml(s.name || "")}</h3>
              <span style="font-size: 0.7rem; color: #f59e0b; font-weight: 600;">${escapeHtml(s.area || "")}</span>
            </div>
            <div style="font-size: 0.75rem; color: #38bdf8; margin: 0.2rem 0 0.4rem;">${escapeHtml(s.view || "")}</div>
          </div>
          <div style="font-size: 0.72rem; color: rgba(255,255,255,0.7); line-height: 1.35; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.4rem;">
            ${escapeHtml(s.features || "")}
          </div>
        </div>
      `).join("");

      const amenList = amenities.map(a => `
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 4px; padding: 0.45rem 0.75rem; font-size: 0.75rem; color: #cbd5e1;">
          ✦ ${escapeHtml(a)}
        </div>
      `).join("");

      bodyHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <div class="suites-grid">${suiteCards}</div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin-top: 0.75rem;">
            ${amenList}
          </div>
        </div>
      `;
      break;
    }

    case "dining": {
      const venues = slide.data?.venues || [];
      const venueCards = venues.map(v => `
        <div class="dining-card">
          <div>
            <div style="font-size: 0.68rem; font-weight: 700; color: #38bdf8; text-transform: uppercase;">${escapeHtml(v.style || "")}</div>
            <h3 style="font-size: 0.95rem; color: #ffffff; margin: 0.2rem 0 0.15rem;">${escapeHtml(v.name || "")}</h3>
            <div style="font-size: 0.72rem; color: #f59e0b; font-weight: 600; margin-bottom: 0.35rem;">Capacity: ${escapeHtml(v.capacity || "")}</div>
          </div>
          <p style="font-size: 0.72rem; color: rgba(255,255,255,0.7); line-height: 1.35; margin: 0;">${escapeHtml(v.desc || "")}</p>
        </div>
      `).join("");

      bodyHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
          <div class="dining-grid">${venueCards}</div>
        </div>
      `;
      break;
    }

    case "location": {
      const highlights = slide.data?.highlights || [];
      const cards = highlights.map(h => `
        <div class="canvas-card" style="border-top: 3px solid #f59e0b; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <span style="font-size: 0.68rem; font-weight: 700; color: #f59e0b; text-transform: uppercase;">${escapeHtml(h.distance || "")}</span>
            <h4 style="font-size: 0.9rem; color: #ffffff; margin: 0.25rem 0 0.35rem;">${escapeHtml(h.title || "")}</h4>
            <p style="font-size: 0.74rem; color: rgba(255,255,255,0.75); line-height: 1.35; margin: 0;">${escapeHtml(h.desc || "")}</p>
          </div>
        </div>
      `).join("");

      bodyHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
          <div class="location-grid">${cards}</div>
        </div>
      `;
      break;
    }

    case "events": {
      const packages = slide.data?.packages || [];
      const terms = slide.data?.terms || "";
      const contact = slide.data?.contact || "";

      const cards = packages.map(p => `
        <div class="pricing-card ${p.featured ? "featured" : ""}">
          ${p.badge ? `<div class="pricing-badge">${escapeHtml(p.badge)}</div>` : ""}
          <div>
            <div style="font-size: 0.85rem; font-weight: 700; color: #ffffff;">${escapeHtml(p.name || "")}</div>
            <div style="font-size: 1.35rem; font-weight: 800; color: #f59e0b; margin: 0.35rem 0 0.1rem;">${escapeHtml(p.price || "")}</div>
            <div style="font-size: 0.7rem; color: rgba(255,255,255,0.6); text-transform: uppercase;">${escapeHtml(p.unit || "")}</div>
          </div>
          <div style="font-size: 0.75rem; color: rgba(255,255,255,0.8); margin-top: 0.6rem; line-height: 1.35;">${escapeHtml(p.desc || "")}</div>
        </div>
      `).join("");

      bodyHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <div class="event-tiers-grid">${cards}</div>
          <div class="canvas-card" style="margin-top: 0.85rem; padding: 0.6rem 0.9rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
            <div style="font-size: 0.75rem; color: rgba(255,255,255,0.7);">${escapeHtml(terms)}</div>
            <div style="font-size: 0.8rem; font-weight: 700; color: #f59e0b;">${escapeHtml(contact)}</div>
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

  // Common fields
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
  box.innerHTML = `<label style="font-size: 0.78rem; font-weight: 700; color: #f59e0b; display: block; margin-bottom: 0.5rem;">Slide Data Content (JSON Editable):</label>`;
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
    type: "suites",
    title: "Signature Villas & Wellness Wing",
    subtitle: "Private accommodations and bespoke guest experiences",
    kicker: "Accommodations Spotlight",
    notes: "Present the details of these private villas.",
    data: {
      suites: [
        {
          name: "The Executive Garden Suite",
          area: "190 sqm / 2,045 sqft",
          view: "Private Botanical Courtyard",
          features: "Private plunge pool, outdoor rain shower, walk-in dressing room, and personal sommelier service."
        },
        {
          name: "Marina Panorama Pavilion",
          area: "240 sqm / 2,580 sqft",
          view: "Direct Yacht Marina Front",
          features: "Private pontoon mooring, dual-side fireplace, floor-to-ceiling glass salon, and private butler."
        }
      ],
      amenities: [
        "Private VIP yacht transfer on demand",
        "Executive business lounge access",
        "Complimentary evening champagne tasting",
        "24/7 personal security escort service"
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
    <div style="text-align: center; margin-bottom: 2.5rem; border-bottom: 2px solid #d97706; padding-bottom: 1.5rem;">
      <h1 style="color: #d97706; font-size: 2.2rem; margin: 0;">Grand Azure Hospitality Collection</h1>
      <p style="color: #475569; font-size: 1rem; margin-top: 0.5rem;">Resort &amp; Conference Showcase Deck &bull; Preset: ${escapeHtml(currentPreset.toUpperCase())}</p>
    </div>
  `;

  deck.forEach((slide, idx) => {
    pagesHTML += `
      <div class="print-slide-page">
        <div style="font-size: 0.75rem; text-transform: uppercase; color: #d97706; font-weight: 700; margin-bottom: 0.35rem;">Slide ${idx + 1} &bull; ${escapeHtml(slide.type.toUpperCase())}</div>
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
  downloadAnchor.setAttribute("download", `hotel-presentation-${currentPreset}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("Presentation JSON exported!");
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
        showToast("Presentation JSON loaded successfully!");
      } else {
        alert("Invalid presentation JSON format.");
      }
    } catch (err) {
      alert("Failed to parse JSON file.");
    }
  };
  reader.readAsText(file);
}

// Helper escape HTML
function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}