// Travel Proposal Builder - Client-side Interactive Logic

const DESTINATION_PRESETS = {
  dubai: [
    {
      id: "slide-1",
      type: "cover",
      title: "Dubai & Arabian Dunes Luxury Expedition",
      subtitle: "6 Days / 5 Nights of Opulence, Architecture & Desert Grandeur",
      kicker: "Curated Private Journey",
      bgImage: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80",
      notes: "Welcome the clients. Highlight private chauffeur throughout, Burj Al Arab suite, and private vintage Land Rover desert camp.",
      data: {
        destination: "Dubai, United Arab Emirates",
        duration: "6 Days / 5 Nights",
        clientName: "Prepared for Mr. & Mrs. Montgomery",
        travelDates: "November 14 – 19, 2026",
        agencyName: "Odyssey Luxury Travel &bull; Private Client Division"
      }
    },
    {
      id: "slide-2",
      type: "itinerary",
      title: "Bespoke Day-by-Day Journey",
      subtitle: "A seamless balance of private leisure, culture, and high-altitude dining",
      kicker: "Day-by-Day Timeline",
      notes: "Remind clients that all transfer timing is flexible and coordinated with their private butler.",
      data: {
        days: [
          { day: "Day 1", title: "VIP Arrival & Marina Cruise", desc: "Private tarmac meet & greet, chauffeured Rolls-Royce transfer, sunset yacht cruise around Palm Jumeirah." },
          { day: "Day 2", title: "Skyline & Michelin Dining", desc: "Private access to At the Top Burj Khalifa Sky Lounge, followed by lunch at At.mosphere and afternoon leisure." },
          { day: "Day 3", title: "Vintage Desert Safari", desc: "Heritage 1950s Land Rover safari across Dubai Desert Conservation Reserve, falconry display, and private Bedouin gala under the stars." },
          { day: "Day 4", title: "Helicopter Tour & Old Dubai", desc: "Aerial helicopter tour above The World Islands, private abras boat tour along Dubai Creek, gold and spice souks." },
          { day: "Day 5", title: "Louvre Abu Dhabi Excursion", desc: "Day trip to Abu Dhabi with private art docent at Louvre Abu Dhabi and Sheikh Zayed Grand Mosque VIP sunset tour." },
          { day: "Day 6", title: "Farewell Champagne & Departure", desc: "Breakfast on private terrace overlooking the Arabian Gulf, luxury spa ritual, and private airport escort." }
        ]
      }
    },
    {
      id: "slide-3",
      type: "logistics",
      title: "Luxury Accommodations & Aviation",
      subtitle: "World-renowned hospitality paired with seamless first-class transit",
      kicker: "Hotels & Flights",
      notes: "Both hotels feature guaranteed ocean-view upgrades and complimentary daily afternoon high tea.",
      data: {
        flights: [
          { airline: "Emirates (First Class)", route: "JFK &rarr; DXB (EK 202)", schedule: "Depart 23:00 &bull; Arrive 19:45 (+1)", class: "Private Suite with Onboard Shower Spa" },
          { airline: "Emirates (First Class)", route: "DXB &rarr; JFK (EK 201)", schedule: "Depart 08:30 &bull; Arrive 14:15", class: "Chauffeured Airport Connection" }
        ],
        hotels: [
          {
            name: "Burj Al Arab Jumeirah",
            location: "Jumeirah Beach, Dubai",
            rating: "★★★★★ Deluxe Suite",
            room: "Deluxe One-Bedroom Ocean Suite",
            amenities: "Dedicated 24/7 personal butler, Hermès luxury toiletries, private beach access, Talise Spa infinity pool."
          },
          {
            name: "Bab Al Shams Desert Resort",
            location: "Al Qudra Dunes, Dubai",
            rating: "★★★★★ Desert Sanctuary",
            room: "Royal Oasis Pool Villa",
            amenities: "Private temperature-controlled plunge pool, stargazing telescope, equestrian arena, and desert dining."
          }
        ]
      }
    },
    {
      id: "slide-4",
      type: "inclusions",
      title: "Proposal Inclusions & Exclusions",
      subtitle: "White-glove transparency with zero hidden costs or surprises",
      kicker: "Package Inclusions",
      notes: "Highlight our 24/7 dedicated concierge team who will manage table reservations and last-minute requests.",
      data: {
        inclusions: [
          "5 Nights in ultra-luxury 5-star suites with daily champagne breakfast",
          "Private airport meet & assist through diplomat fast-track immigration",
          "Dedicated chauffeur with Mercedes-Maybach / Rolls-Royce at disposal",
          "Private chartered luxury catamaran around Palm Jumeirah (4 hours)",
          "VIP private helicopter tour across Dubai skyline & Palm islands",
          "Exclusive desert safari with private camp and Michelin-curated chef dinner",
          "24/7 Dedicated Senior Odyssey Concierge manager on-call"
        ],
        exclusions: [
          "International First Class transatlantic flights (quoted separately)",
          "Discretionary personal expenses, spa treatments outside package, and gratuities",
          "Travel and comprehensive medical insurance (advisable)"
        ]
      }
    },
    {
      id: "slide-5",
      type: "pricing",
      title: "Investment Tiers & Reservation",
      subtitle: "Select your desired travel tier to initiate your custom reservation",
      kicker: "Investment & Booking",
      notes: "Close with reassurance on flexible rescheduling and full deposit protection.",
      data: {
        tiers: [
          { name: "Classic Luxury", price: "$6,850", unit: "per person", desc: "Deluxe suite at Burj Al Arab, chauffeured Mercedes S-Class, desert safari." },
          { name: "Signature VIP", price: "$9,950", unit: "per person", featured: true, badge: "Most Popular", desc: "Private Pool Villa, Rolls-Royce chauffeur, chartered yacht cruise & helicopter tour." },
          { name: "Royal Sovereign", price: "$16,500", unit: "per person", desc: "Presidential two-story suite, 24/7 private security, unlimited private yacht days." }
        ],
        terms: "30% deposit upon itinerary confirmation &bull; Balance due 21 days prior to departure &bull; 100% flexible rescheduling.",
        ctaContact: "Ready to confirm? Email reservations@example.com or call +1 (800) 845-VOYAGE."
      }
    }
  ],

  maldives: [
    {
      id: "slide-1",
      type: "cover",
      title: "Maldives Overwater Paradise & Coral Sanctuary",
      subtitle: "7 Days / 6 Nights in Pristine Turquoise Atolls & Private Water Villas",
      kicker: "Private Island Retreat",
      bgImage: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1600&q=80",
      notes: "Frame this proposal around pure serenity, bespoke dining over the water, and private coral preservation dives.",
      data: {
        destination: "Baa Atoll & Noonu Atoll, Maldives",
        duration: "7 Days / 6 Nights",
        clientName: "Prepared for Ambassador & Lady Harrington",
        travelDates: "January 10 – 17, 2027",
        agencyName: "Odyssey Luxury Travel &bull; Island Collection"
      }
    },
    {
      id: "slide-2",
      type: "itinerary",
      title: "Island Rhythm Day-by-Day",
      subtitle: "An unhurried journey through coral reefs, wellness, and starlit dining",
      kicker: "Bespoke Itinerary",
      notes: "Point out that seaplane transfer times are coordinated directly with their international arrival flight.",
      data: {
        days: [
          { day: "Day 1", title: "Velana VIP Seaplane Arrival", desc: "VIP lounge upon landing in Malé, scenic seaplane transfer directly to resort private jetty, sunset champagne." },
          { day: "Day 2", title: "Coral Snorkeling & Lagoon Spa", desc: "Private marine biologist guided tour of UNESCO Biosphere Reserve, followed by overwater Ayurvedic treatment." },
          { day: "Day 3", title: "Private Sandbank Picnic", desc: "Whisked away by speedboat to an uninhabited private sandbank with personal sommelier and private chef." },
          { day: "Day 4", title: "Subsea Dining Experience", desc: "Morning dolphin safari aboard traditional Maldivian Dhoni, evening 6-course pairing at subterranean wine cellar." },
          { day: "Day 5", title: "Catamaran Sailing & Sunset Cruise", desc: "Sailing across crystal clear lagoons, snorkeling with manta rays, evening stargazing with resort astronomer." },
          { day: "Day 6-7", title: "Farewell Lagoon Leisure", desc: "Private overwater breakfast delivered via floating tray, relaxing lagoon paddleboard, seaplane transfer to Malé." }
        ]
      }
    },
    {
      id: "slide-3",
      type: "logistics",
      title: "Resort Accommodations & Seaplane Transit",
      subtitle: "Unmatched barefoot luxury in the world's most breathtaking waters",
      kicker: "Resort & Aviation",
      notes: "All villas include private plunge pools, water slides directly into the sea, and retractable roofs.",
      data: {
        flights: [
          { airline: "Qatar Airways (Qsuite)", route: "LHR / DOH &rarr; MLE (QR 674)", schedule: "Depart 14:00 &bull; Arrive 07:30 (+1)", class: "Double Qsuite with Sliding Privacy Doors" },
          { airline: "Trans Maldivian Seaplane", route: "Velana International &rarr; Soneva Jani", schedule: "VIP Seaplane Lounge Departure", class: "Private Charter Twin Otter Aircraft" }
        ],
        hotels: [
          {
            name: "Soneva Jani Resort",
            location: "Medhufaru Island, Noonu Atoll",
            rating: "★★★★★ Eco-Luxury Sanctuary",
            room: "Chapter Two Overwater Pool Villa with Slide",
            amenities: "Retractable master bedroom roof for stargazing, curved water slide into lagoon, private freshwater pool, bare-foot butler."
          },
          {
            name: "The Ritz-Carlton Maldives, Fari Islands",
            location: "North Malé Atoll",
            rating: "★★★★★ Architectural Icon",
            room: "Ocean Pool Villa",
            amenities: "Minimalist circular architecture, panoramic lagoon sunrise views, Bamford wellness spa, private yacht transfer."
          }
        ]
      }
    },
    {
      id: "slide-4",
      type: "inclusions",
      title: "Proposal Inclusions & Clear Terms",
      subtitle: "All-inclusive ultra-luxury with seamless peace of mind",
      kicker: "Inclusions & Terms",
      notes: "All meals and premium cellar wines are included under the Soneva Unlimited privilege.",
      data: {
        inclusions: [
          "6 Nights in luxury overwater villa with private pool and lagoon slide",
          "Round-trip private charter seaplane transfers from Malé International Airport",
          "Daily gourmet breakfast, lunch, and Michelin-starred multi-course dinners",
          "Complimentary access to resort wine cellar with international sommelier tastings",
          "Private sandbank Robinson Crusoe castaway lunch experience",
          "Unlimited non-motorized water sports, paddleboards, and private snorkeling gear",
          "Daily signature overwater couple's spa treatments"
        ],
        exclusions: [
          "International flights to Malé (can be added upon request)",
          "Motorized water sports (seabob, jet ski) outside private session",
          "Optional scuba diving certification courses"
        ]
      }
    },
    {
      id: "slide-5",
      type: "pricing",
      title: "Investment Tiers & Confirmation",
      subtitle: "Lock in your preferred villa category and departure date",
      kicker: "Package Investment",
      notes: "Reassure clients regarding full deposit refundability up to 45 days prior to arrival.",
      data: {
        tiers: [
          { name: "Island Retreat", price: "$8,900", unit: "per guest", desc: "Overwater 1-Bedroom Villa, half-board gourmet dining, shared luxury seaplane." },
          { name: "Soneva Unlimited", price: "$13,400", unit: "per guest", featured: true, badge: "Most Popular", desc: "Private Pool Slide Villa, unlimited Michelin dining & spa, private seaplane charter." },
          { name: "Royal Reserve Estate", price: "$24,500", unit: "per guest", desc: "4-Bedroom Overwater Palace, dedicated private yacht, 24/7 personal chef & crew." }
        ],
        terms: "25% deposit at time of booking &bull; Final settlement 30 days before arrival &bull; Fully flexible date rescheduling.",
        ctaContact: "Inquire or confirm: maldives@example.com &bull; +1 (800) 845-8692"
      }
    }
  ],

  turkey: [
    {
      id: "slide-1",
      type: "cover",
      title: "Turkey: Ottoman Splendor & Cappadocia Skies",
      subtitle: "8 Days / 7 Nights across Istanbul Bosphorus & Fairy Chimney Valleys",
      kicker: "Historic Grand Tour",
      bgImage: "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1600&q=80",
      notes: "Highlight our private palace hotel right on the Bosphorus strait and private sunrise hot air balloon flight.",
      data: {
        destination: "Istanbul & Cappadocia, Turkey",
        duration: "8 Days / 7 Nights",
        clientName: "Prepared for Dr. & Mrs. Sterling",
        travelDates: "September 18 – 25, 2026",
        agencyName: "Odyssey Luxury Travel &bull; Mediterranean & Levant"
      }
    },
    {
      id: "slide-2",
      type: "itinerary",
      title: "Istanbul & Cappadocia Day-by-Day",
      subtitle: "Where Byzantine grandeur meets lunar geological wonder and epic gastronomy",
      kicker: "Detailed Timeline",
      notes: "Remind clients that private historian guides accompany all historical site visits.",
      data: {
        days: [
          { day: "Day 1", title: "Arrival at Çırağan Palace", desc: "VIP airport reception, chauffeured Maybach transfer to Ottoman Imperial Palace hotel on the Bosphorus." },
          { day: "Day 2", title: "Old City Privileged Access", desc: "Private skip-the-line docent tour of Hagia Sophia, Topkapi Palace Treasury, and underground Basilica Cistern." },
          { day: "Day 3", title: "Private Bosphorus Yacht Cruise", desc: "Chartered sunset cruise along the strait dividing Europe and Asia, private cocktail tasting and seafood dinner." },
          { day: "Day 4", title: "Flight to Cappadocia & Cave Suite", desc: "Domestic business class flight to Cappadocia, check-in to luxury cliffside cave suite in Uchisar." },
          { day: "Day 5", title: "Royal Sunrise Hot Air Balloon", desc: "Exclusive private basket sunrise balloon flight over Love Valley, followed by champagne celebration." },
          { day: "Day 6-8", title: "Underground Cities & Farewell", desc: "Exploration of Kaymakli underground city, organic Anatolian vineyard lunch, flight to Istanbul for departure." }
        ]
      }
    },
    {
      id: "slide-3",
      type: "logistics",
      title: "Historic Palaces & Cave Accommodations",
      subtitle: "Living history with contemporary 5-star comforts",
      kicker: "Hotels & Transport",
      notes: "Both properties are listed amongst Condé Nast Traveler's Gold List.",
      data: {
        flights: [
          { airline: "Turkish Airlines (Business Class)", route: "JFK &rarr; IST (TK 002)", schedule: "Depart 18:55 &bull; Arrive 11:45 (+1)", class: "Flying Chef Service & Lie-Flat Suites" },
          { airline: "Turkish Airlines (Domestic Business)", route: "IST &rarr; NAV / ASR", schedule: "Private connection to Cappadocia", class: "VIP Lounge & Dedicated Chauffeur" }
        ],
        hotels: [
          {
            name: "Çırağan Palace Kempinski Istanbul",
            location: "Bosphorus Shoreline, Istanbul",
            rating: "★★★★★ Imperial Palace",
            room: "Palace Bosphorus View Suite",
            amenities: "Former residence of Ottoman sultans, infinity pool overlooking Asia, Tuğra fine dining restaurant."
          },
          {
            name: "Museum Hotel Cappadocia",
            location: "Uchisar, Cappadocia",
            rating: "★★★★★ Relais & Châteaux",
            room: "Imperial Cave Suite",
            amenities: "Authentic restored cave chambers filled with registered antique artifacts, heated roman pool, panoramic valley vistas."
          }
        ]
      }
    },
    {
      id: "slide-4",
      type: "inclusions",
      title: "Package Inclusions & Exclusions",
      subtitle: "Curated experiences with world-class historians and private transit",
      kicker: "Inclusions & Logistics",
      notes: "All domestic flight sectors within Turkey are included in the package rate.",
      data: {
        inclusions: [
          "7 Nights luxury 5-star accommodations (Çırağan Palace & Museum Hotel)",
          "Private chartered sunrise hot air balloon flight in Cappadocia with champagne",
          "Full-day private Bosphorus luxury yacht cruise with captain and open bar",
          "Domestic Turkish Airlines business class flights Istanbul &harr; Cappadocia",
          "Private licensed art & architectural historian for all guided visits",
          "All museum entrance fees, VIP priority lanes, and private chauffeur transfers",
          "Daily gourmet breakfast and 4 handpicked fine dining dinners"
        ],
        exclusions: [
          "International transatlantic airfare",
          "Visa fees where applicable",
          "Personal shopping expenses in Grand Bazaar and discretionary tips"
        ]
      }
    },
    {
      id: "slide-5",
      type: "pricing",
      title: "Investment Options & Booking Terms",
      subtitle: "Select the ideal tier for your Turkish journey",
      kicker: "Investment Tiers",
      notes: "Early booking grants complimentary room upgrades at Çırağan Palace.",
      data: {
        tiers: [
          { name: "Ottoman Classic", price: "$5,200", unit: "per person", desc: "Bosphorus View Room, shared balloon flight (small basket), private city guide." },
          { name: "Sultan's VIP", price: "$7,900", unit: "per person", featured: true, badge: "Recommended", desc: "Palace Suite, private 2-person hot air balloon, private Bosphorus yacht charter." },
          { name: "Grand Vizier", price: "$12,800", unit: "per person", desc: "Imperial Sultan Suite, private helicopter transfers, 24/7 private security detail." }
        ],
        terms: "30% initial deposit required &bull; 70% balance due 3 weeks prior &bull; Comprehensive cancellation insurance available.",
        ctaContact: "Reserve your journey: turkey@example.com &bull; +1 (800) 845-8692"
      }
    }
  ],

  switzerland: [
    {
      id: "slide-1",
      type: "cover",
      title: "Swiss Alpine Grandeur: Zermatt & Andermatt",
      subtitle: "7 Days / 6 Nights of Glacier Panoramas, Chalet Elegance & Glacier Express",
      kicker: "Alpine Luxury Tour",
      bgImage: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1600&q=80",
      notes: "Present the Glacier Express Excellence Class and the Matterhorn helicopter flight as the central highlights.",
      data: {
        destination: "Zurich, Andermatt & Zermatt, Switzerland",
        duration: "7 Days / 6 Nights",
        clientName: "Prepared for The Vanderbilt Family",
        travelDates: "February 20 – 27, 2027",
        agencyName: "Odyssey Luxury Travel &bull; Alpine Collection"
      }
    },
    {
      id: "slide-2",
      type: "itinerary",
      title: "Swiss Alpine Itinerary",
      subtitle: "Immaculate mountain railways, fondue galas, and private ski instructors",
      kicker: "Day-by-Day Journey",
      notes: "Reiterate that all ski passes and gear fitting are arranged directly inside the hotel ski room.",
      data: {
        days: [
          { day: "Day 1", title: "Zurich Arrival & The Chedi Andermatt", desc: "VIP airport reception, private Mercedes V-Class transfer through Uri valleys to The Chedi Andermatt." },
          { day: "Day 2", title: "Alpine Skiing & Hydrotherapy", desc: "Private mountain guide on Gemsstock slopes, afternoon thermal spa and Asian-inspired wellness ritual." },
          { day: "Day 3", title: "Glacier Express Excellence Class", desc: "Board the legendary Glacier Express in exclusive Excellence Class with 5-course wine pairing journey to Zermatt." },
          { day: "Day 4", title: "Matterhorn Glacier Paradise", desc: "Private cable car to Europe's highest mountain station at 3,883m, crystal palace tour and snow sports." },
          { day: "Day 5", title: "Helicopter Matterhorn Flight", desc: "Breathtaking private Air Zermatt helicopter flight skimming the north face of the Matterhorn, glacier landing." },
          { day: "Day 6-7", title: "Gourmet Chalet Dinner & Departure", desc: "Private horse-drawn sleigh to candlelit chalet fondue dinner, panoramic train return to Zurich Airport." }
        ]
      }
    },
    {
      id: "slide-3",
      type: "logistics",
      title: "Alpine Resorts & Panoramic Rail",
      subtitle: "The highest standard of Swiss luxury and precision transit",
      kicker: "Hotels & Transport",
      notes: "Excellence Class guarantees private window seating and dedicated carriage concierges.",
      data: {
        flights: [
          { airline: "SWISS International (First Class)", route: "JFK &rarr; ZRH (LX 015)", schedule: "Depart 21:30 &bull; Arrive 11:15 (+1)", class: "Swiss First Lounge VIP Transfer" },
          { airline: "Glacier Express Rail", route: "Andermatt &rarr; Zermatt", schedule: "Excellence Class Luxury Rail", class: "Guaranteed Window Seating & Concierge" }
        ],
        hotels: [
          {
            name: "The Chedi Andermatt",
            location: "Andermatt, Swiss Alps",
            rating: "★★★★★ Superior Luxury",
            room: "Gemsstock Suite with Open Fireplace",
            amenities: "2,400 sqm spa, indoor and outdoor heated pools, two-Michelin-star The Japanese Restaurant, ski butler."
          },
          {
            name: "The Omnia, Zermatt",
            location: "Zermatt, Matterhorn Region",
            rating: "★★★★★ Mountain Lodge",
            room: "Matterhorn View Suite",
            amenities: "Perched 45m above Zermatt on a high rock, glass lift carved through stone, open-air whirlpool facing the Matterhorn."
          }
        ]
      }
    },
    {
      id: "slide-4",
      type: "inclusions",
      title: "Package Inclusions & Logistics",
      subtitle: "Uncompromising Swiss quality with every detail anticipated",
      kicker: "Inclusions & Terms",
      notes: "Swiss First Class travel passes allow unlimited mountain rail and boat transit.",
      data: {
        inclusions: [
          "6 Nights in luxury 5-star suites in Andermatt and Zermatt",
          "Glacier Express Excellence Class tickets with 5-course gourmet dining",
          "Air Zermatt private helicopter flight around the Matterhorn with glacier landing",
          "Private certified Swiss ski guide / mountain docent for 3 full days",
          "Swiss 1st Class Rail Pass for seamless luggage transfer and regional trains",
          "Private horse-drawn sleigh ride and candlelit chalet fondue dinner",
          "Full access to 5-star spa hydrotherapy zones and daily gourmet breakfast"
        ],
        exclusions: [
          "International long-haul flights to Zurich",
          "Ski and equipment rental fees (can be pre-reserved at hotel)",
          "Personal spa beauty treatments and discretionary gratuities"
        ]
      }
    },
    {
      id: "slide-5",
      type: "pricing",
      title: "Investment Tiers & Reservation",
      subtitle: "Choose your preferred tier for this unforgettable winter journey",
      kicker: "Pricing & Booking",
      notes: "Alpine peak season dates require early confirmation to secure Excellence Class seats.",
      data: {
        tiers: [
          { name: "Alpine Classic", price: "$7,400", unit: "per person", desc: "Deluxe Room at The Chedi, 1st Class Glacier Express, mountain rail pass." },
          { name: "Matterhorn VIP", price: "$10,950", unit: "per person", featured: true, badge: "Most Popular", desc: "Matterhorn Suite at Omnia, Excellence Class, private helicopter flight." },
          { name: "Chalet Sovereign", price: "$18,200", unit: "per person", desc: "Private catered Alpine Chalet, private helicopter transfers, unlimited private ski guide." }
        ],
        terms: "25% deposit upon itinerary confirmation &bull; 75% due 30 days prior &bull; Flexible winter cancellation protection.",
        ctaContact: "Secure your reservation: switzerland@example.com &bull; +1 (800) 845-8692"
      }
    }
  ]
};

// Global App State
let currentDestination = "dubai";
let deck = JSON.parse(JSON.stringify(DESTINATION_PRESETS[currentDestination]));
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
  // Destination Preset Switcher
  const presetSelect = document.getElementById("destination-preset-select");
  if (presetSelect) {
    presetSelect.addEventListener("change", (e) => {
      currentDestination = e.target.value;
      if (DESTINATION_PRESETS[currentDestination]) {
        deck = JSON.parse(JSON.stringify(DESTINATION_PRESETS[currentDestination]));
        activeSlideIndex = 0;
        renderThumbnails();
        renderActiveSlide();
        renderInspector();
        showToast(`Loaded ${currentDestination.toUpperCase()} Proposal Preset!`);
      }
    });
  }

  // Slide Action Buttons
  document.getElementById("btn-add-slide")?.addEventListener("click", handleAddSlide);
  document.getElementById("btn-move-up")?.addEventListener("click", handleMoveUp);
  document.getElementById("btn-move-down")?.addEventListener("click", handleMoveDown);
  document.getElementById("btn-delete-slide")?.addEventListener("click", handleDeleteSlide);

  // Presenter & Print Buttons
  document.getElementById("btn-launch-presenter")?.addEventListener("click", startPresenterMode);
  document.getElementById("btn-print-deck")?.addEventListener("click", triggerPrintBrochure);

  // JSON Import & Export
  document.getElementById("btn-export-json")?.addEventListener("click", exportDeckJSON);
  document.getElementById("input-import-json")?.addEventListener("change", importDeckJSON);

  // Presenter Controls
  document.getElementById("hud-prev")?.addEventListener("click", () => navigatePresenter(-1));
  document.getElementById("hud-next")?.addEventListener("click", () => navigatePresenter(1));
  document.getElementById("hud-exit")?.addEventListener("click", exitPresenterMode);
  document.getElementById("hud-notes-toggle")?.addEventListener("click", togglePresenterNotes);

  // Global Keyboard Listener for Presenter
  document.addEventListener("keydown", handleKeyNavigation);

  // Notes Input Live Listener
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
// Render Active Slide on Canvas Stage
// -------------------------------------------------------------
function renderActiveSlide() {
  const canvas = document.getElementById("slide-canvas-stage");
  const content = document.getElementById("slide-canvas-content");
  const slide = deck[activeSlideIndex];
  if (!canvas || !content || !slide) return;

  // Set Background Image if present
  if (slide.bgImage) {
    canvas.style.backgroundImage = `url('${slide.bgImage}')`;
  } else {
    canvas.style.backgroundImage = "none";
  }

  content.innerHTML = generateSlideHTML(slide);

  // Also update presenter if open
  const presContainer = document.getElementById("presenter-fullscreen-container");
  if (presContainer && presContainer.classList.contains("active")) {
    renderPresenterSlide();
  }
}

// -------------------------------------------------------------
// Generate Slide HTML based on Slide Type
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
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 1.25rem;">
          <div class="canvas-card" style="display: inline-flex; flex-direction: column; gap: 0.5rem; max-width: 580px; border-left: 4px solid #06b6d4;">
            <div style="font-size: 0.85rem; color: #06b6d4; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">${escapeHtml(d.destination || "")}</div>
            <div style="font-size: 1.1rem; color: #ffffff; font-weight: 600;">${escapeHtml(d.duration || "")}</div>
            <div style="font-size: 0.875rem; color: rgba(255, 255, 255, 0.8);">${escapeHtml(d.clientName || "")}</div>
            <div style="font-size: 0.8rem; color: rgba(255, 255, 255, 0.6);">${escapeHtml(d.travelDates || "")}</div>
          </div>
        </div>
      `;
      break;
    }

    case "itinerary": {
      const days = slide.data?.days || [];
      const dayCards = days.map(d => `
        <div class="timeline-card">
          <div class="timeline-day">${escapeHtml(d.day || "")}</div>
          <div class="timeline-title">${escapeHtml(d.title || "")}</div>
          <div class="timeline-desc">${escapeHtml(d.desc || "")}</div>
        </div>
      `).join("");

      bodyHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
          <div class="timeline-grid">${dayCards}</div>
        </div>
      `;
      break;
    }

    case "logistics": {
      const flights = slide.data?.flights || [];
      const hotels = slide.data?.hotels || [];

      const flightList = flights.map(f => `
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 0.6rem 0.8rem; margin-bottom: 0.5rem;">
          <div style="font-size: 0.85rem; font-weight: 700; color: #38bdf8;">✈ ${escapeHtml(f.airline || "")}</div>
          <div style="font-size: 0.8rem; color: #ffffff; font-weight: 600;">${escapeHtml(f.route || "")}</div>
          <div style="font-size: 0.72rem; color: rgba(255,255,255,0.7);">${escapeHtml(f.schedule || "")} &bull; ${escapeHtml(f.class || "")}</div>
        </div>
      `).join("");

      const hotelList = hotels.map(h => `
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 6px; padding: 0.6rem 0.8rem; margin-bottom: 0.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <div style="font-size: 0.85rem; font-weight: 700; color: #34d399;">🏨 ${escapeHtml(h.name || "")}</div>
            <div style="font-size: 0.7rem; color: #fbbf24;">${escapeHtml(h.rating || "")}</div>
          </div>
          <div style="font-size: 0.78rem; color: #e2e8f0; font-weight: 600;">${escapeHtml(h.room || "")} (${escapeHtml(h.location || "")})</div>
          <div style="font-size: 0.72rem; color: rgba(255,255,255,0.7); margin-top: 0.2rem;">${escapeHtml(h.amenities || "")}</div>
        </div>
      `).join("");

      bodyHTML = `
        <div class="split-details-grid" style="flex: 1; align-items: stretch;">
          <div class="canvas-card">
            <div style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: #38bdf8; margin-bottom: 0.5rem; letter-spacing: 0.05em;">Aviation & Transfers</div>
            ${flightList}
          </div>
          <div class="canvas-card">
            <div style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: #34d399; margin-bottom: 0.5rem; letter-spacing: 0.05em;">5-Star Accommodations</div>
            ${hotelList}
          </div>
        </div>
      `;
      break;
    }

    case "inclusions": {
      const inc = slide.data?.inclusions || [];
      const exc = slide.data?.exclusions || [];

      const incList = inc.map(i => `
        <li><span class="check-icon">✓</span> <span>${escapeHtml(i)}</span></li>
      `).join("");

      const excList = exc.map(e => `
        <li><span class="cross-icon">✕</span> <span>${escapeHtml(e)}</span></li>
      `).join("");

      bodyHTML = `
        <div class="split-details-grid" style="flex: 1; align-items: stretch;">
          <div class="canvas-card" style="border-top: 3px solid #10b981;">
            <div style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; color: #10b981; margin-bottom: 0.4rem; letter-spacing: 0.05em;">What Is Included</div>
            <ul class="check-list">${incList}</ul>
          </div>
          <div class="canvas-card" style="border-top: 3px solid #ef4444;">
            <div style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; color: #ef4444; margin-bottom: 0.4rem; letter-spacing: 0.05em;">Exclusions & Discretionary</div>
            <ul class="check-list">${excList}</ul>
          </div>
        </div>
      `;
      break;
    }

    case "pricing": {
      const tiers = slide.data?.tiers || [];
      const terms = slide.data?.terms || "";
      const contact = slide.data?.ctaContact || "";

      const tierCards = tiers.map(t => `
        <div class="pricing-card ${t.featured ? "featured" : ""}">
          ${t.badge ? `<div class="pricing-badge">${escapeHtml(t.badge)}</div>` : ""}
          <div>
            <div style="font-size: 0.85rem; font-weight: 700; color: #ffffff;">${escapeHtml(t.name || "")}</div>
            <div style="font-size: 1.35rem; font-weight: 800; color: #06b6d4; margin: 0.35rem 0 0.1rem;">${escapeHtml(t.price || "")}</div>
            <div style="font-size: 0.7rem; color: rgba(255,255,255,0.6); text-transform: uppercase;">${escapeHtml(t.unit || "")}</div>
          </div>
          <div style="font-size: 0.75rem; color: rgba(255,255,255,0.8); margin-top: 0.6rem; line-height: 1.35;">${escapeHtml(t.desc || "")}</div>
        </div>
      `).join("");

      bodyHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <div class="pricing-cards-grid">${tierCards}</div>
          <div class="canvas-card" style="margin-top: 0.85rem; padding: 0.6rem 0.9rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
            <div style="font-size: 0.75rem; color: rgba(255,255,255,0.7);">${escapeHtml(terms)}</div>
            <div style="font-size: 0.8rem; font-weight: 700; color: #06b6d4;">${escapeHtml(contact)}</div>
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
// Render Inspector Form Fields
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
      <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary);">Subtitle / Tagline</label>
      <input type="text" class="form-control" id="inp-subtitle" value="${escapeHtml(slide.subtitle || "")}">
    </div>
    <div>
      <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary);">Top Kicker Badge</label>
      <input type="text" class="form-control" id="inp-kicker" value="${escapeHtml(slide.kicker || "")}">
    </div>
    <div>
      <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary);">Background Image URL (Cover)</label>
      <input type="text" class="form-control" id="inp-bg" value="${escapeHtml(slide.bgImage || "")}" placeholder="https://...">
    </div>
  `;
  container.appendChild(commonRow);

  // Bind Common Header inputs
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

  // Type-specific form fields
  if (slide.type === "cover") {
    const d = slide.data || {};
    const coverBox = document.createElement("div");
    coverBox.className = "inspector-grid two-col";
    coverBox.style.marginTop = "0.75rem";
    coverBox.innerHTML = `
      <div>
        <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary);">Destination Location</label>
        <input type="text" class="form-control" id="inp-dest" value="${escapeHtml(d.destination || "")}">
      </div>
      <div>
        <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary);">Duration Label</label>
        <input type="text" class="form-control" id="inp-duration" value="${escapeHtml(d.duration || "")}">
      </div>
      <div>
        <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary);">Client Name</label>
        <input type="text" class="form-control" id="inp-client" value="${escapeHtml(d.clientName || "")}">
      </div>
      <div>
        <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary);">Travel Dates</label>
        <input type="text" class="form-control" id="inp-dates" value="${escapeHtml(d.travelDates || "")}">
      </div>
    `;
    container.appendChild(coverBox);

    coverBox.querySelector("#inp-dest").addEventListener("input", (e) => {
      d.destination = e.target.value;
      renderActiveSlide();
    });
    coverBox.querySelector("#inp-duration").addEventListener("input", (e) => {
      d.duration = e.target.value;
      renderActiveSlide();
    });
    coverBox.querySelector("#inp-client").addEventListener("input", (e) => {
      d.clientName = e.target.value;
      renderActiveSlide();
    });
    coverBox.querySelector("#inp-dates").addEventListener("input", (e) => {
      d.travelDates = e.target.value;
      renderActiveSlide();
    });
  } else if (slide.type === "itinerary") {
    const days = slide.data?.days || [];
    const itinBox = document.createElement("div");
    itinBox.style.marginTop = "0.75rem";
    itinBox.innerHTML = `<label style="font-size: 0.78rem; font-weight: 700; color: #06b6d4; display: block; margin-bottom: 0.5rem;">Itinerary Timeline Steps (JSON Editable):</label>`;
    const ta = document.createElement("textarea");
    ta.className = "form-control";
    ta.rows = 6;
    ta.style.fontFamily = "monospace";
    ta.style.fontSize = "0.75rem";
    ta.value = JSON.stringify(days, null, 2);
    ta.addEventListener("input", (e) => {
      try {
        slide.data.days = JSON.parse(e.target.value);
        renderActiveSlide();
      } catch (err) {
        // syntax error while typing
      }
    });
    itinBox.appendChild(ta);
    container.appendChild(itinBox);
  } else if (slide.type === "logistics") {
    const logBox = document.createElement("div");
    logBox.style.marginTop = "0.75rem";
    logBox.innerHTML = `<label style="font-size: 0.78rem; font-weight: 700; color: #38bdf8; display: block; margin-bottom: 0.5rem;">Flights & Hotels Structure (JSON Editable):</label>`;
    const ta = document.createElement("textarea");
    ta.className = "form-control";
    ta.rows = 6;
    ta.style.fontFamily = "monospace";
    ta.style.fontSize = "0.75rem";
    ta.value = JSON.stringify(slide.data || {}, null, 2);
    ta.addEventListener("input", (e) => {
      try {
        slide.data = JSON.parse(e.target.value);
        renderActiveSlide();
      } catch (err) {
        // typing json
      }
    });
    logBox.appendChild(ta);
    container.appendChild(logBox);
  } else if (slide.type === "inclusions") {
    const incBox = document.createElement("div");
    incBox.className = "inspector-grid two-col";
    incBox.style.marginTop = "0.75rem";
    incBox.innerHTML = `
      <div>
        <label style="font-size: 0.78rem; font-weight: 700; color: #10b981; display: block; margin-bottom: 0.35rem;">Inclusions (One per line):</label>
        <textarea id="inp-inc" class="form-control" rows="5" style="font-size: 0.75rem;">${(slide.data?.inclusions || []).join("\n")}</textarea>
      </div>
      <div>
        <label style="font-size: 0.78rem; font-weight: 700; color: #ef4444; display: block; margin-bottom: 0.35rem;">Exclusions (One per line):</label>
        <textarea id="inp-exc" class="form-control" rows="5" style="font-size: 0.75rem;">${(slide.data?.exclusions || []).join("\n")}</textarea>
      </div>
    `;
    container.appendChild(incBox);

    incBox.querySelector("#inp-inc").addEventListener("input", (e) => {
      slide.data.inclusions = e.target.value.split("\n").filter(line => line.trim().length > 0);
      renderActiveSlide();
    });
    incBox.querySelector("#inp-exc").addEventListener("input", (e) => {
      slide.data.exclusions = e.target.value.split("\n").filter(line => line.trim().length > 0);
      renderActiveSlide();
    });
  } else if (slide.type === "pricing") {
    const prBox = document.createElement("div");
    prBox.style.marginTop = "0.75rem";
    prBox.innerHTML = `<label style="font-size: 0.78rem; font-weight: 700; color: #06b6d4; display: block; margin-bottom: 0.5rem;">Pricing Packages & Terms (JSON Editable):</label>`;
    const ta = document.createElement("textarea");
    ta.className = "form-control";
    ta.rows = 6;
    ta.style.fontFamily = "monospace";
    ta.style.fontSize = "0.75rem";
    ta.value = JSON.stringify(slide.data || {}, null, 2);
    ta.addEventListener("input", (e) => {
      try {
        slide.data = JSON.parse(e.target.value);
        renderActiveSlide();
      } catch (err) {
        // typing json
      }
    });
    prBox.appendChild(ta);
    container.appendChild(prBox);
  }
}

// -------------------------------------------------------------
// Slide Manipulations
// -------------------------------------------------------------
function handleAddSlide() {
  const newSlide = {
    id: `slide-${Date.now()}`,
    type: "itinerary",
    title: "Additional Excursion & Highlights",
    subtitle: "Custom itinerary segment designed for your trip",
    kicker: "Bespoke Activities",
    notes: "Present the unique features of this optional tour.",
    data: {
      days: [
        { day: "Excursion 1", title: "Private Cultural Encounter", desc: "Private access guided by senior historian docent." },
        { day: "Excursion 2", title: "Gourmet Tasting Session", desc: "Michelin-starred tasting with regional wine pairings." },
        { day: "Excursion 3", title: "Sunset Catamaran Cruise", desc: "Private chartered navigation with champagne open bar." }
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
  if (confirm("Are you sure you want to delete this slide?")) {
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
// Fullscreen Presenter Mode
// -------------------------------------------------------------
function startPresenterMode() {
  const container = document.getElementById("presenter-fullscreen-container");
  if (!container) return;
  container.classList.add("active");
  renderPresenterSlide();

  // Reset & Start Timer
  presenterSeconds = 0;
  updateTimerDisplay();
  if (presenterTimerInterval) clearInterval(presenterTimerInterval);
  presenterTimerInterval = setInterval(() => {
    presenterSeconds += 1;
    updateTimerDisplay();
  }, 1000);

  // Request browser fullscreen if available
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
    notesText.textContent = slide.notes || "No speaker notes for this slide.";
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
    <div style="text-align: center; margin-bottom: 2.5rem; border-bottom: 2px solid #0284c7; padding-bottom: 1.5rem;">
      <h1 style="color: #0284c7; font-size: 2.2rem; margin: 0;">Odyssey Luxury Travel &bull; Proposal Brochure</h1>
      <p style="color: #475569; font-size: 1rem; margin-top: 0.5rem;">Bespoke Client Itinerary &bull; Destination: ${escapeHtml(currentDestination.toUpperCase())}</p>
    </div>
  `;

  deck.forEach((slide, idx) => {
    pagesHTML += `
      <div class="print-slide-page">
        <div style="font-size: 0.75rem; text-transform: uppercase; color: #0284c7; font-weight: 700; margin-bottom: 0.35rem;">Slide ${idx + 1} &bull; ${escapeHtml(slide.type.toUpperCase())}</div>
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
  downloadAnchor.setAttribute("download", `travel-proposal-${currentDestination}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("Proposal JSON downloaded!");
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
        showToast("Proposal JSON imported successfully!");
      } else {
        alert("Invalid presentation JSON format.");
      }
    } catch (err) {
      alert("Failed to parse JSON file.");
    }
  };
  reader.readAsText(file);
}

// Helper function to escape HTML
function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}