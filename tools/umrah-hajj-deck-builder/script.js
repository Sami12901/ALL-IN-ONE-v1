// Umrah & Hajj Deck Builder - Client-side Interactive Logic

const UMRAH_PRESETS = {
  "ramadan-vip": [
    {
      id: "slide-1",
      type: "overview",
      title: "Sacred Ramadan Umrah VIP Journey",
      subtitle: "14 Days / 13 Nights of Spiritual Devotion in Makkah & Madinah Al-Munawwarah",
      kicker: "Blessed Pilgrimage Proposal",
      bgImage: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1600&q=80",
      notes: "Welcome the prospective pilgrim family. Reassure them regarding our front-row Kaaba view rooms and dedicated Mutawwif assistance.",
      data: {
        packageType: "Ramadan Last 10 Nights Spiritual Retreat",
        duration: "14 Days (8 Nights Makkah &bull; 6 Nights Madinah)",
        dates: "Ramadan 20 – Shawwal 4, 1448 AH (Spring 2027)",
        pilgrims: "Tailored for Family of 4 Guests",
        highlights: [
          "Direct Kaaba View Front-Row Suites",
          "Haramain Bullet Train Business Class",
          "Exclusive Guided Ziyarat Tours",
          "24/7 Scholar & Ritual Guidance"
        ]
      }
    },
    {
      id: "slide-2",
      type: "hotels",
      title: "Makkah & Madinah 5-Star Accommodations",
      subtitle: "Unrivaled proximity to the Holy Mosques for effortless prayer access",
      kicker: "Luxury Hotel Showcase",
      notes: "Emphasize zero walking fatigue for elderly pilgrims due to direct indoor elevator access to the Haram courtyard.",
      data: {
        makkahHotel: {
          name: "Makkah Clock Royal Tower, A Fairmont Hotel",
          distance: "0m &bull; Direct Haram Courtyard Access",
          room: "Signature Kaaba View Executive Suite",
          board: "Full Board (Iftar & Suhoor Buffet)",
          amenities: "Dedicated private elevator access to Haram prayer levels, audio feed connected to live Haram Imam prayers, 24/7 room service."
        },
        madinahHotel: {
          name: "The Oberoi, Madinah",
          distance: "50m &bull; Steps from Ladies & Men Gates",
          room: "Junior Suite Facing Masjid an-Nabawi",
          board: "Full Board (Gourmet Iftar & Suhoor)",
          amenities: "Prime northern courtyard location, peaceful atmosphere, personal butler service, complimentary laundry."
        }
      }
    },
    {
      id: "slide-3",
      type: "ziyarat",
      title: "Historical Ziyarat & Sacred Landmarks",
      subtitle: "Walking in the footsteps of the Prophet ﷺ and his companions",
      kicker: "Holy Sites Tours",
      notes: "All tours are led by certified Islamic history scholars with private climate-controlled transport.",
      data: {
        sites: [
          { name: "Jabal al-Nour & Cave of Hira", city: "Makkah", desc: "The mountain where the first revelation of the Holy Qur'an descended upon the Prophet ﷺ." },
          { name: "Mount Arafat & Jabal al-Rahmah", city: "Makkah", desc: "The pinnacle of Hajj, Plains of Nimra, and the site of the Prophet's Farewell Sermon." },
          { name: "Cave of Thawr", city: "Makkah", desc: "The sacred cave where the Prophet ﷺ and Abu Bakr (RA) sought refuge during the Hijrah." },
          { name: "Masjid Quba", city: "Madinah", desc: "The first mosque built in Islam; offering two rak'ahs here is equivalent in reward to an Umrah." },
          { name: "Mount Uhud & Martyrs' Cemetery", city: "Madinah", desc: "Site of the historic Battle of Uhud and resting place of Sayyidna Hamza (RA) and the noble martyrs." },
          { name: "Masjid al-Qiblatayn", city: "Madinah", desc: "The historic mosque where the direction of prayer was revealed to turn toward the Kaaba in Makkah." }
        ]
      }
    },
    {
      id: "slide-4",
      type: "logistics",
      title: "VIP Visa, High-Speed Rail & Transport",
      subtitle: "Smooth logistical transitions from airport arrival to sacred rites",
      kicker: "Transport & Visas",
      notes: "The Haramain bullet train covers the 450 km journey between Makkah and Madinah in just 2 hours and 15 minutes.",
      data: {
        items: [
          {
            title: "Ministry of Hajj E-Visa",
            tag: "Official Visa",
            desc: "Full electronic Umrah visa processing with comprehensive medical insurance and multi-entry validity across Saudi Arabia."
          },
          {
            title: "Haramain High-Speed Train",
            tag: "VIP Business Class",
            desc: "Scenic 300 km/h rail journey connecting Makkah and Madinah in utmost comfort with business lounge access and refreshments."
          },
          {
            title: "Private Chauffeur Fleet",
            tag: "Luxury GMC Yukon XL",
            desc: "Private chauffeured airport pickups from Jeddah King Abdulaziz International Terminal to Makkah and Madinah."
          }
        ],
        extraNotice: "VIP meet-and-assist escorts pilgrims through customs and luggage collection upon arrival in Jeddah."
      }
    },
    {
      id: "slide-5",
      type: "pricing",
      title: "Package Pricing Tiers & Booking Terms",
      subtitle: "Transparent pricing with white-glove spiritual coordination",
      kicker: "Investment & Reservation",
      notes: "Confirm that package pricing includes all taxes, municipality fees, and local transfers.",
      data: {
        tiers: [
          { name: "Executive 5-Star", price: "$4,850", unit: "per pilgrim", desc: "Fairmont partial Kaaba view room, Oberoi Madinah, shared VIP GMC transfers." },
          { name: "Ramadan Royal VIP", price: "$7,650", unit: "per pilgrim", featured: true, badge: "Most Requested", desc: "Direct panoramic Kaaba Suite, Oberoi Haram View, private GMC, Haramain Business." },
          { name: "Imperial Presidential", price: "$12,900", unit: "per pilgrim", desc: "Two-Bedroom Royal Clock Tower Penthouse, 24/7 dedicated private chauffeur & personal scholar." }
        ],
        terms: "30% deposit upon booking &bull; Balance due 30 days prior to departure &bull; Full visa processing included.",
        ctaContact: "Direct Inquiries: pilgrims@nooralharamain.com &bull; WhatsApp +966 50 123 4567"
      }
    }
  ],

  "deluxe-umrah": [
    {
      id: "slide-1",
      type: "overview",
      title: "Deluxe 5-Star Umrah Pilgrimage",
      subtitle: "10 Days / 9 Nights of Comfort, Devotion & Proximity to the Haramain",
      kicker: "Deluxe Umrah Package",
      bgImage: "https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?auto=format&fit=crop&w=1600&q=80",
      notes: "Ideal proposal for working professionals and families seeking a shorter, high-luxury pilgrimage.",
      data: {
        packageType: "Deluxe 10-Day Year-Round Umrah",
        duration: "10 Days (5 Nights Makkah &bull; 5 Nights Madinah)",
        dates: "Flexible Departure Dates Available Year-Round",
        pilgrims: "Standard Double / Quad Sharing Available",
        highlights: [
          "5-Star Hotels within 100m of Haram",
          "Haramain Bullet Train Fast Transit",
          "Comprehensive Guided Ziyarat Tours",
          "Dedicated 24/7 Pilgrimage Coordinator"
        ]
      }
    },
    {
      id: "slide-2",
      type: "hotels",
      title: "Makkah & Madinah Luxury Stays",
      subtitle: "World-class hospitality just moments away from the sacred courtyards",
      kicker: "Hotel Accommodations",
      notes: "Swissôtel and Pullman both offer direct covered access to the mosque prayer carpets.",
      data: {
        makkahHotel: {
          name: "Swissôtel Al Maqam Makkah",
          distance: "20m &bull; Direct Abraj Al-Bait Complex Access",
          room: "Classic Haram View Room",
          board: "Half Board (Daily Breakfast & Dinner Buffet)",
          amenities: "Direct escalator into King Abdulaziz Gate courtyard, sound connection to Haram prayers, tea lounge."
        },
        madinahHotel: {
          name: "Pullman Zamzam Madinah",
          distance: "150m &bull; Facing Southern Haram Courtyard",
          room: "Executive Room with Courtyard View",
          board: "Half Board (Daily Breakfast & Dinner)",
          amenities: "Spacious contemporary suites, easy walking access to the Prophet's Mosque, international buffet restaurant."
        }
      }
    },
    {
      id: "slide-3",
      type: "ziyarat",
      title: "Sacred Ziyarat in Makkah & Madinah",
      subtitle: "Enrich your spiritual journey through landmark historical sites",
      kicker: "Guided Ziyarat",
      notes: "Inform clients that bottled Zamzam water and prayer mats are provided on all tour vehicles.",
      data: {
        sites: [
          { name: "Jabal al-Nour & Cave of Hira", city: "Makkah", desc: "View the Mountain of Light from the dedicated cultural center and learn about the first revelation." },
          { name: "Mina, Muzdalifah & Arafat", city: "Makkah", desc: "A guided educational visit through the historic tent city of Mina, Jamarat bridge, and Plains of Arafat." },
          { name: "Jannat al-Mu'alla Cemetery", city: "Makkah", desc: "Resting place of Sayyidah Khadijah (RA) and esteemed members of the Prophet's blessed family." },
          { name: "Masjid Quba", city: "Madinah", desc: "First sanctuary established in Madinah; recommended to pray two units of Tahiyyat al-Masjid." },
          { name: "Mount Uhud Battlefield", city: "Madinah", desc: "Pay respects to the martyrs of Uhud and explore the Archers' Mound (Jabal al-Rumat)." },
          { name: "Masjid al-Ghamama & Abu Bakr", city: "Madinah", desc: "Historic open prayer grounds where the Prophet ﷺ led Eid and rain-seeking (Istisqa) prayers." }
        ]
      }
    },
    {
      id: "slide-4",
      type: "logistics",
      title: "Seamless Visa & Ground Transit",
      subtitle: "Eliminating travel friction so you can focus on worship",
      kicker: "Transit & Logistics",
      notes: "Our ground handling crew in Jeddah will manage all luggage transfers directly to the hotel rooms.",
      data: {
        items: [
          {
            title: "Saudi Tourist / Umrah E-Visa",
            tag: "Guaranteed Issue",
            desc: "Fast-track digital processing within 48 hours, fully compliant with Ministry of Hajj Nusuk system guidelines."
          },
          {
            title: "Haramain High-Speed Train",
            tag: "Business Comfort",
            desc: "Smooth transfer between Makkah and Madinah stations in under 2.5 hours with assigned comfortable seating."
          },
          {
            title: "Private Chauffeur Vehicles",
            tag: "Luxury Van / SUV",
            desc: "Air-conditioned private Mercedes Sprinter or Toyota Innova for airport and Ziyarat journeys."
          }
        ],
        extraNotice: "Complimentary SIM card assistance and local 24/7 Arabic-speaking customer care hotline."
      }
    },
    {
      id: "slide-5",
      type: "pricing",
      title: "Investment Tiers & Booking Terms",
      subtitle: "Flexible options tailored to your family's budget",
      kicker: "Pricing Packages",
      notes: "Flexible cancellation allowed up to 21 days prior to flight departure.",
      data: {
        tiers: [
          { name: "Quad Sharing", price: "$2,650", unit: "per person", desc: "4 pilgrims sharing 5-Star Room, Swissôtel & Pullman, shared luxury coach." },
          { name: "Double / Couple", price: "$3,450", unit: "per person", featured: true, badge: "Best Value", desc: "Private Deluxe Room for two, high floor Haram partial view, private car transfers." },
          { name: "VIP Family Suite", price: "$5,200", unit: "per person", desc: "Two-Bedroom Family Connecting Suite, Full Board meals, private GMC Yukon throughout." }
        ],
        terms: "25% deposit required upon confirmation &bull; Balance 3 weeks before travel &bull; Full visa support.",
        ctaContact: "Book Now: booking@nooralharamain.com &bull; Office +966 12 555 8899"
      }
    }
  ],

  "economy-umrah": [
    {
      id: "slide-1",
      type: "overview",
      title: "Classic Comfort Economy Umrah",
      subtitle: "14 Days / 13 Nights of Affordable Devotion & Clean Accommodations",
      kicker: "Economy Pilgrimage",
      bgImage: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1600&q=80",
      notes: "Perfect for budget-conscious families and community groups seeking maximum time in the Holy Sanctuaries.",
      data: {
        packageType: "Classic Economy 14-Day Package",
        duration: "14 Days (8 Nights Makkah &bull; 6 Nights Madinah)",
        dates: "Monthly Scheduled Group Departures",
        pilgrims: "Triple and Quad Sharing Available",
        highlights: [
          "Clean 3-Star / 4-Star Hotels with Shuttle",
          "Dedicated Group Tour Leader",
          "Guided Ziyarat in Makkah & Madinah",
          "Full Visa & Transportation Handled"
        ]
      }
    },
    {
      id: "slide-2",
      type: "hotels",
      title: "Comfortable Accommodations & Shuttles",
      subtitle: "Clean, reliable hotels with frequent shuttle services to the Haram",
      kicker: "Hotels & Proximity",
      notes: "24/7 free AC shuttle buses run continuously every 5 to 10 minutes from hotel doorsteps to the Haram bus terminal.",
      data: {
        makkahHotel: {
          name: "Voco Makkah / Millennium Palestine",
          distance: "850m &bull; 24/7 Continuous Free Air-Conditioned Shuttle",
          room: "Comfort Triple / Quad Guest Room",
          board: "Bed & Breakfast Included",
          amenities: "Spacious clean rooms, 24-hour reception, free shuttle stopping directly at Ajyad / Kudai terminals."
        },
        madinahHotel: {
          name: "Al Aqeeq Madinah Hotel / Madinah Hilton",
          distance: "250m &bull; Short 4-Minute Walk to Markaziah",
          room: "Standard City View Room",
          board: "Bed & Breakfast Included",
          amenities: "Convenient walking distance to Prophet's Mosque courtyard, close to dates market and restaurants."
        }
      }
    },
    {
      id: "slide-3",
      type: "ziyarat",
      title: "Comprehensive Group Ziyarat Tours",
      subtitle: "Historical site visits accompanied by experienced group guides",
      kicker: "Ziyarat Sites",
      notes: "Guided lectures in English and Urdu on the historical significance of each blessed location.",
      data: {
        sites: [
          { name: "Jabal al-Nour & Hira Cultural District", city: "Makkah", desc: "Visit the cultural center at the base of the Mountain of Light." },
          { name: "Mina, Muzdalifah & Arafat", city: "Makkah", desc: "Drive-through tour of Hajj holy grounds with historical commentary." },
          { name: "Thawr Mountain", city: "Makkah", desc: "Historical overview of the Hijrah migration departure." },
          { name: "Masjid Quba", city: "Madinah", desc: "Morning visit to offer two rak'ahs for the reward of Umrah." },
          { name: "Mount Uhud & Martyrs", city: "Madinah", desc: "Visit the battlefield and honor the noble companions." },
          { name: "The Seven Mosques", city: "Madinah", desc: "Historic battlefield of Khandaq (The Trench) with panoramic viewpoint." }
        ]
      }
    },
    {
      id: "slide-4",
      type: "logistics",
      title: "Group Transport & Visa Management",
      subtitle: "Organized logistics ensuring worry-free travel throughout",
      kicker: "Logistics & Group Transit",
      notes: "Luggage handling handled by dedicated staff from airport bus to hotel rooms.",
      data: {
        items: [
          {
            title: "Saudi Umrah Group Visa",
            tag: "Processed Promptly",
            desc: "Full visa facilitation, insurance coverage, and verification via the Nusuk portal."
          },
          {
            title: "Air-Conditioned Luxury Coach",
            tag: "Private Group Coach",
            desc: "Comfortable modern buses for inter-city travel between Jeddah, Makkah, and Madinah."
          },
          {
            title: "Experienced Group Mutawwif",
            tag: "Spiritual Leader",
            desc: "Full guidance through the rites of Umrah (Ihram, Tawaf, Sa'i, and Halq/Taqsir)."
          }
        ],
        extraNotice: "5 Liters Zamzam water container arranged for each pilgrim upon airport departure."
      }
    },
    {
      id: "slide-5",
      type: "pricing",
      title: "Affordable Package Pricing & Terms",
      subtitle: "Maximum spiritual reward with clear, budget-friendly rates",
      kicker: "Pricing Tiers",
      notes: "Special discounts available for groups of 10 or more pilgrims.",
      data: {
        tiers: [
          { name: "Quad Sharing", price: "$1,650", unit: "per pilgrim", desc: "4 pilgrims sharing room, breakfast included, AC coach transfers." },
          { name: "Triple Sharing", price: "$1,890", unit: "per pilgrim", featured: true, badge: "Most Popular", desc: "3 pilgrims sharing room, breakfast included, group Ziyarat included." },
          { name: "Double / Twin", price: "$2,250", unit: "per pilgrim", desc: "Private room for two, breakfast included, full visa & transport package." }
        ],
        terms: "$500 deposit to hold seat &bull; Balance 15 days before departure &bull; 100% transparent terms.",
        ctaContact: "Join Group: groups@nooralharamain.com &bull; Call +966 12 555 7711"
      }
    }
  ],

  "premium-hajj": [
    {
      id: "slide-1",
      type: "overview",
      title: "Platinum Hajj VIP Pilgrimage Proposal",
      subtitle: "21 Days / 20 Nights of Impeccable Service & Spiritual Ease During the Days of Hajj",
      kicker: "Sacred Hajj Journey",
      bgImage: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1600&q=80",
      notes: "Present our Ministry-licensed VIP Hajj package with air-conditioned luxury camps in Mina and Arafat.",
      data: {
        packageType: "Licensed Platinum VIP Hajj Journey",
        duration: "21 Days (Makkah &bull; Mina VIP Camp &bull; Madinah)",
        dates: "Dhul Hijjah 1 – 21, 1448 AH (Hajj Season)",
        pilgrims: "Exclusive Limited Capacity Cohort",
        highlights: [
          "Majestic VIP Air-Conditioned Mina Tents",
          "5-Star Clock Tower Suite Before & After Hajj",
          "Dedicated Private Golf Cart Access at Jamarat",
          "Esteemed Resident Scholars Accompanying"
        ]
      }
    },
    {
      id: "slide-2",
      type: "hotels",
      title: "Makkah Suites & VIP Mina Tents",
      subtitle: "Sanctuary comforts for both the days of Hajj and holy city stays",
      kicker: "Accommodations Showcase",
      notes: "Our Mina VIP camp features elevated sofa-beds, private en-suite bathrooms, and 24/7 gourmet catering.",
      data: {
        makkahHotel: {
          name: "Raffles Makkah Palace & VIP Mina Camp",
          distance: "0m &bull; Steps to Kaaba & Zone 1 Front-Row Mina Tents",
          room: "Signature Suite with Direct Kaaba View",
          board: "Gourmet Full Board Catering Throughout Hajj Days",
          amenities: "Private butler service in Makkah, luxury air-conditioned German-built tents in Mina with private buffet lounge."
        },
        madinahHotel: {
          name: "Dar Al Taqwa Hotel Madinah",
          distance: "10m &bull; Directly Opposite King Fahd Courtyard",
          room: "Executive Prophet's Mosque View Suite",
          board: "Full Board Gourmet Dining",
          amenities: "Immediate proximity to the Rawdah ash-Sharifah, peaceful library, white-glove concierge."
        }
      }
    },
    {
      id: "slide-3",
      type: "ziyarat",
      title: "Sacred Sites of Hajj & Ziyarat",
      subtitle: "Complete guidance through the arduous and blessed stations of Hajj",
      kicker: "Hajj Stations & Ziyarat",
      notes: "Our private golf cart permits minimize walking strain during the Rami al-Jamarat rites.",
      data: {
        sites: [
          { name: "Mina (The Tent City)", city: "Makkah", desc: "Private VIP camp in Zone 1 closest to the Jamarat bridge." },
          { name: "Plains of Arafat", city: "Makkah", desc: "Air-conditioned marquee tents with private sound systems for heartfelt Du'a on the Day of Arafah." },
          { name: "Muzdalifah Overnight", city: "Makkah", desc: "Dedicated reserved carpeted enclosure with sleeping mattresses and refreshments." },
          { name: "Al-Rawdah ash-Sharifah", city: "Madinah", desc: "Confirmed Nusuk permit booking to pray in the Garden of Paradise." },
          { name: "Mount Uhud & Archers' Hill", city: "Madinah", desc: "Deep contemplation of the sacrifices of the early believers." },
          { name: "Quba Mosque Visit", city: "Madinah", desc: "Private early morning pilgrimage for Tahiyyat al-Masjid." }
        ]
      }
    },
    {
      id: "slide-4",
      type: "logistics",
      title: "Mashair VIP Transit & Complete Compliance",
      subtitle: "Uncompromised security, dedicated trains, and private golf carts",
      kicker: "Hajj Logistics",
      notes: "All permits are verified and synchronized through the official Nusuk Hajj platform.",
      data: {
        items: [
          {
            title: "Official Hajj Visa & Nusuk Permit",
            tag: "Guaranteed Quota",
            desc: "Full official Ministry of Hajj & Umrah authorized quota licensing with digital credentials."
          },
          {
            title: "Mashair Sacred Metro Train",
            tag: "Fast Track Transit",
            desc: "Reserved carriage passes connecting Mina, Arafat, and Muzdalifah avoiding all vehicular gridlock."
          },
          {
            title: "Qurbani (Hady) Sacrificial Service",
            tag: "Fully Executed",
            desc: "Official Islamic Development Bank verified slaughter on your behalf with notification receipt."
          }
        ],
        extraNotice: "Medical doctor and emergency clinic present within the private camp 24 hours a day."
      }
    },
    {
      id: "slide-5",
      type: "pricing",
      title: "Hajj Investment Tiers & Reservation",
      subtitle: "Secure your once-in-a-lifetime pilgrimage with guaranteed allocation",
      kicker: "Investment & Terms",
      notes: "Hajj slots are subject to official regulatory allocation and fill rapidly.",
      data: {
        tiers: [
          { name: "Gold Hajj Package", price: "$11,500", unit: "per pilgrim", desc: "Swissôtel Makkah, standard VIP Mina tent, Mashair train passes." },
          { name: "Platinum VIP Hajj", price: "$16,800", unit: "per pilgrim", featured: true, badge: "Exclusive Allocation", desc: "Raffles Kaaba Suite, Zone 1 VIP tent, Dar Al Taqwa, private car transit." },
          { name: "Royal Sovereign Hajj", price: "$28,500", unit: "per pilgrim", desc: "Fairmont Penthouse, private tent partition with private en-suite bathroom, 24/7 personal guide." }
        ],
        terms: "50% deposit upon Nusuk quota confirmation &bull; 100% money-back guarantee if visa rejected.",
        ctaContact: "Confidential Consultation: hajj@nooralharamain.com &bull; VIP Desk +966 12 555 9900"
      }
    }
  ]
};

// Global State
let currentPackage = "ramadan-vip";
let deck = JSON.parse(JSON.stringify(UMRAH_PRESETS[currentPackage]));
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
  // Preset Select
  const select = document.getElementById("package-preset-select");
  if (select) {
    select.addEventListener("change", (e) => {
      currentPackage = e.target.value;
      if (UMRAH_PRESETS[currentPackage]) {
        deck = JSON.parse(JSON.stringify(UMRAH_PRESETS[currentPackage]));
        activeSlideIndex = 0;
        renderThumbnails();
        renderActiveSlide();
        renderInspector();
        showToast("Loaded Pilgrimage Package Preset!");
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

  // Keyboard navigation
  document.addEventListener("keydown", handleKeyNavigation);

  // Notes Input
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
    case "overview": {
      const d = slide.data || {};
      const highlights = (d.highlights || []).map(h => `
        <div style="background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.3); border-radius: 6px; padding: 0.5rem 0.8rem; font-size: 0.8rem; color: #6ee7b7; font-weight: 600;">
          ✦ ${escapeHtml(h)}
        </div>
      `).join("");

      bodyHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 1rem;">
          <div class="canvas-card" style="max-width: 650px; border-left: 4px solid #10b981;">
            <div style="font-size: 0.85rem; color: #f59e0b; font-weight: 700; text-transform: uppercase;">${escapeHtml(d.packageType || "")}</div>
            <div style="font-size: 1.15rem; color: #ffffff; font-weight: 700; margin: 0.25rem 0;">${escapeHtml(d.duration || "")}</div>
            <div style="font-size: 0.825rem; color: rgba(255,255,255,0.85);">${escapeHtml(d.dates || "")} &bull; ${escapeHtml(d.pilgrims || "")}</div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.65rem; max-width: 650px;">
            ${highlights}
          </div>
        </div>
      `;
      break;
    }

    case "hotels": {
      const mak = slide.data?.makkahHotel || {};
      const mad = slide.data?.madinahHotel || {};

      bodyHTML = `
        <div class="hotel-grid" style="flex: 1; align-items: stretch;">
          <div class="hotel-card">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span style="font-size: 0.75rem; font-weight: 700; color: #10b981; text-transform: uppercase;">Makkah Al-Mukarramah</span>
                <span class="haram-distance-badge">${escapeHtml(mak.distance || "")}</span>
              </div>
              <h3 style="font-size: 1rem; color: #ffffff; margin: 0 0 0.35rem;">${escapeHtml(mak.name || "")}</h3>
              <div style="font-size: 0.8rem; color: #f59e0b; font-weight: 600;">${escapeHtml(mak.room || "")}</div>
              <div style="font-size: 0.72rem; color: #cbd5e1; margin-top: 0.15rem;">Meal Plan: ${escapeHtml(mak.board || "")}</div>
            </div>
            <div style="font-size: 0.73rem; color: rgba(255,255,255,0.7); margin-top: 0.65rem; line-height: 1.35; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.5rem;">
              ${escapeHtml(mak.amenities || "")}
            </div>
          </div>

          <div class="hotel-card" style="border-top-color: #059669;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span style="font-size: 0.75rem; font-weight: 700; color: #34d399; text-transform: uppercase;">Madinah Al-Munawwarah</span>
                <span class="haram-distance-badge">${escapeHtml(mad.distance || "")}</span>
              </div>
              <h3 style="font-size: 1rem; color: #ffffff; margin: 0 0 0.35rem;">${escapeHtml(mad.name || "")}</h3>
              <div style="font-size: 0.8rem; color: #f59e0b; font-weight: 600;">${escapeHtml(mad.room || "")}</div>
              <div style="font-size: 0.72rem; color: #cbd5e1; margin-top: 0.15rem;">Meal Plan: ${escapeHtml(mad.board || "")}</div>
            </div>
            <div style="font-size: 0.73rem; color: rgba(255,255,255,0.7); margin-top: 0.65rem; line-height: 1.35; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 0.5rem;">
              ${escapeHtml(mad.amenities || "")}
            </div>
          </div>
        </div>
      `;
      break;
    }

    case "ziyarat": {
      const sites = slide.data?.sites || [];
      const cards = sites.map(s => `
        <div class="ziyarat-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.68rem; font-weight: 700; color: #f59e0b; text-transform: uppercase;">${escapeHtml(s.city || "")}</span>
            <span style="font-size: 0.68rem; color: #6ee7b7;">🕌 Sacred Site</span>
          </div>
          <div style="font-size: 0.825rem; font-weight: 700; color: #ffffff; margin: 0.2rem 0;">${escapeHtml(s.name || "")}</div>
          <div style="font-size: 0.72rem; color: rgba(255,255,255,0.7); line-height: 1.35;">${escapeHtml(s.desc || "")}</div>
        </div>
      `).join("");

      bodyHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
          <div class="ziyarat-grid">${cards}</div>
        </div>
      `;
      break;
    }

    case "logistics": {
      const items = slide.data?.items || [];
      const notice = slide.data?.extraNotice || "";

      const cards = items.map(it => `
        <div class="canvas-card" style="border-top: 3px solid #10b981; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <span style="font-size: 0.68rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em;">${escapeHtml(it.tag || "")}</span>
            <h4 style="font-size: 0.9rem; color: #ffffff; margin: 0.25rem 0 0.4rem;">${escapeHtml(it.title || "")}</h4>
            <p style="font-size: 0.74rem; color: rgba(255,255,255,0.75); line-height: 1.35; margin: 0;">${escapeHtml(it.desc || "")}</p>
          </div>
        </div>
      `).join("");

      bodyHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <div class="transport-grid">${cards}</div>
          <div class="canvas-card" style="margin-top: 0.75rem; padding: 0.6rem 0.9rem; font-size: 0.75rem; color: #cbd5e1; border-left: 3px solid #f59e0b;">
            💡 ${escapeHtml(notice)}
          </div>
        </div>
      `;
      break;
    }

    case "pricing": {
      const tiers = slide.data?.tiers || [];
      const terms = slide.data?.terms || "";
      const contact = slide.data?.ctaContact || "";

      const cards = tiers.map(t => `
        <div class="pricing-card ${t.featured ? "vip" : ""}">
          ${t.badge ? `<div class="pricing-badge">${escapeHtml(t.badge)}</div>` : ""}
          <div>
            <div style="font-size: 0.85rem; font-weight: 700; color: #ffffff;">${escapeHtml(t.name || "")}</div>
            <div style="font-size: 1.35rem; font-weight: 800; color: #10b981; margin: 0.35rem 0 0.1rem;">${escapeHtml(t.price || "")}</div>
            <div style="font-size: 0.7rem; color: rgba(255,255,255,0.6); text-transform: uppercase;">${escapeHtml(t.unit || "")}</div>
          </div>
          <div style="font-size: 0.75rem; color: rgba(255,255,255,0.8); margin-top: 0.6rem; line-height: 1.35;">${escapeHtml(t.desc || "")}</div>
        </div>
      `).join("");

      bodyHTML = `
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <div class="pricing-tiers-grid">${cards}</div>
          <div class="canvas-card" style="margin-top: 0.85rem; padding: 0.6rem 0.9rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
            <div style="font-size: 0.75rem; color: rgba(255,255,255,0.7);">${escapeHtml(terms)}</div>
            <div style="font-size: 0.8rem; font-weight: 700; color: #10b981;">${escapeHtml(contact)}</div>
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

  // Common Header inputs
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

  // Type-specific fields
  if (slide.type === "overview") {
    const d = slide.data || {};
    const box = document.createElement("div");
    box.className = "inspector-grid two-col";
    box.style.marginTop = "0.75rem";
    box.innerHTML = `
      <div>
        <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary);">Package Type Label</label>
        <input type="text" class="form-control" id="inp-pkg" value="${escapeHtml(d.packageType || "")}">
      </div>
      <div>
        <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary);">Duration Label</label>
        <input type="text" class="form-control" id="inp-duration" value="${escapeHtml(d.duration || "")}">
      </div>
      <div>
        <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary);">Dates</label>
        <input type="text" class="form-control" id="inp-dates" value="${escapeHtml(d.dates || "")}">
      </div>
      <div>
        <label style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary);">Pilgrims Cohort</label>
        <input type="text" class="form-control" id="inp-pilgrims" value="${escapeHtml(d.pilgrims || "")}">
      </div>
    `;
    container.appendChild(box);

    box.querySelector("#inp-pkg").addEventListener("input", (e) => {
      d.packageType = e.target.value;
      renderActiveSlide();
    });
    box.querySelector("#inp-duration").addEventListener("input", (e) => {
      d.duration = e.target.value;
      renderActiveSlide();
    });
    box.querySelector("#inp-dates").addEventListener("input", (e) => {
      d.dates = e.target.value;
      renderActiveSlide();
    });
    box.querySelector("#inp-pilgrims").addEventListener("input", (e) => {
      d.pilgrims = e.target.value;
      renderActiveSlide();
    });
  } else if (slide.type === "hotels") {
    const mak = slide.data?.makkahHotel || {};
    const mad = slide.data?.madinahHotel || {};
    const hotelBox = document.createElement("div");
    hotelBox.className = "inspector-grid two-col";
    hotelBox.style.marginTop = "0.75rem";
    hotelBox.innerHTML = `
      <div style="background: rgba(255,255,255,0.02); padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
        <h4 style="font-size: 0.8rem; color: #10b981; margin: 0 0 0.5rem;">Makkah Hotel Details</h4>
        <input type="text" class="form-control" id="inp-mak-name" value="${escapeHtml(mak.name || "")}" placeholder="Hotel Name" style="margin-bottom: 0.4rem; font-size: 0.8rem;">
        <input type="text" class="form-control" id="inp-mak-dist" value="${escapeHtml(mak.distance || "")}" placeholder="Distance to Haram" style="margin-bottom: 0.4rem; font-size: 0.8rem;">
        <input type="text" class="form-control" id="inp-mak-room" value="${escapeHtml(mak.room || "")}" placeholder="Room Type" style="margin-bottom: 0.4rem; font-size: 0.8rem;">
        <textarea class="form-control" id="inp-mak-amen" rows="2" placeholder="Amenities" style="font-size: 0.75rem;">${escapeHtml(mak.amenities || "")}</textarea>
      </div>
      <div style="background: rgba(255,255,255,0.02); padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
        <h4 style="font-size: 0.8rem; color: #34d399; margin: 0 0 0.5rem;">Madinah Hotel Details</h4>
        <input type="text" class="form-control" id="inp-mad-name" value="${escapeHtml(mad.name || "")}" placeholder="Hotel Name" style="margin-bottom: 0.4rem; font-size: 0.8rem;">
        <input type="text" class="form-control" id="inp-mad-dist" value="${escapeHtml(mad.distance || "")}" placeholder="Distance to Mosque" style="margin-bottom: 0.4rem; font-size: 0.8rem;">
        <input type="text" class="form-control" id="inp-mad-room" value="${escapeHtml(mad.room || "")}" placeholder="Room Type" style="margin-bottom: 0.4rem; font-size: 0.8rem;">
        <textarea class="form-control" id="inp-mad-amen" rows="2" placeholder="Amenities" style="font-size: 0.75rem;">${escapeHtml(mad.amenities || "")}</textarea>
      </div>
    `;
    container.appendChild(hotelBox);

    hotelBox.querySelector("#inp-mak-name").addEventListener("input", (e) => { mak.name = e.target.value; renderActiveSlide(); });
    hotelBox.querySelector("#inp-mak-dist").addEventListener("input", (e) => { mak.distance = e.target.value; renderActiveSlide(); });
    hotelBox.querySelector("#inp-mak-room").addEventListener("input", (e) => { mak.room = e.target.value; renderActiveSlide(); });
    hotelBox.querySelector("#inp-mak-amen").addEventListener("input", (e) => { mak.amenities = e.target.value; renderActiveSlide(); });

    hotelBox.querySelector("#inp-mad-name").addEventListener("input", (e) => { mad.name = e.target.value; renderActiveSlide(); });
    hotelBox.querySelector("#inp-mad-dist").addEventListener("input", (e) => { mad.distance = e.target.value; renderActiveSlide(); });
    hotelBox.querySelector("#inp-mad-room").addEventListener("input", (e) => { mad.room = e.target.value; renderActiveSlide(); });
    hotelBox.querySelector("#inp-mad-amen").addEventListener("input", (e) => { mad.amenities = e.target.value; renderActiveSlide(); });
  } else if (slide.type === "ziyarat" || slide.type === "logistics" || slide.type === "pricing") {
    const box = document.createElement("div");
    box.style.marginTop = "0.75rem";
    box.innerHTML = `<label style="font-size: 0.78rem; font-weight: 700; color: #10b981; display: block; margin-bottom: 0.5rem;">Data Structure (JSON Editable):</label>`;
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
        // typing syntax
      }
    });
    box.appendChild(ta);
    container.appendChild(box);
  }
}

// -------------------------------------------------------------
// Slide Manipulations
// -------------------------------------------------------------
function handleAddSlide() {
  const newSlide = {
    id: `slide-${Date.now()}`,
    type: "ziyarat",
    title: "Additional Sacred Tour Itinerary",
    subtitle: "Custom spiritual stops and historical briefings",
    kicker: "Optional Ziyarat",
    notes: "Explain the sacred history of these additional locations.",
    data: {
      sites: [
        { name: "Bir Ali (Dhu al-Hulayfah)", city: "Madinah", desc: "The designated Miqat station for pilgrims traveling from Madinah to Makkah." },
        { name: "Historic Date Palm Groves", city: "Madinah", desc: "A guided walk through authentic date orchards and Ajwa date tasting." },
        { name: "Al-Mu'alla Historical Cemetery", city: "Makkah", desc: "Honoring early believers and resting place of Sayyidah Khadijah (RA)." }
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
  if (confirm("Delete this slide from proposal?")) {
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
    <div style="text-align: center; margin-bottom: 2.5rem; border-bottom: 2px solid #059669; padding-bottom: 1.5rem;">
      <h1 style="color: #059669; font-size: 2.2rem; margin: 0;">Noor Al-Haramain Pilgrimage Services</h1>
      <p style="color: #475569; font-size: 1rem; margin-top: 0.5rem;">Sacred Journey Proposal &bull; Package: ${escapeHtml(currentPackage.toUpperCase())}</p>
    </div>
  `;

  deck.forEach((slide, idx) => {
    pagesHTML += `
      <div class="print-slide-page">
        <div style="font-size: 0.75rem; text-transform: uppercase; color: #059669; font-weight: 700; margin-bottom: 0.35rem;">Slide ${idx + 1} &bull; ${escapeHtml(slide.type.toUpperCase())}</div>
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
  downloadAnchor.setAttribute("download", `pilgrimage-proposal-${currentPackage}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("Proposal JSON exported!");
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
        showToast("Proposal JSON loaded successfully!");
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