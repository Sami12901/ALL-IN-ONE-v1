// AI Travel Proposal Generator Engine
// Zero server dependencies. 100% interactive client-side execution.

let travelSlides = [];
let activeSlideIndex = 0;
let isPresenting = false;

// Presets Dictionary
const TRAVEL_PRESETS = {
  'amalfi-coast': {
    title: 'Amalfi Coast & Capri: 7-Day Superyacht & Clifftop Villa Retreat',
    destination: 'Amalfi Coast, Italy',
    guests: '12 Guests (Corporate / Group)',
    slides: [
      {
        kicker: 'BESPOKE EXPEDITION PROPOSAL',
        title: 'Amalfi Coast & Capri Private Retreat',
        subtitle: '7 Days of Superyacht Cruising, Michelin Gastronomy, and Clifftop Luxury',
        footerLeft: 'Luxury Travel Proposal',
        cards: [
          { title: 'Curated Duration', desc: '7 Nights / 8 Days during optimal Mediterranean sea conditions.' },
          { title: 'Party Scale', desc: 'Bespoke corporate retreat tailored for 12 executive guests.' },
          { title: 'Signature Access', desc: 'Private 140ft Benetti yacht charter, clifftop villa buyout, and VIP club access.' }
        ]
      },
      {
        kicker: 'THE EXPEDITION VISION',
        title: 'Curated Vision & Atmosphere',
        subtitle: 'Effortless Italian coastal sophistication with personalized concierge hospitality.',
        footerLeft: 'Trip Vision',
        cards: [
          { title: 'Private Sea Navigation', desc: 'Daily private cruising across the Faraglioni rocks, Positano cove, and secluded grottoes.' },
          { title: 'Authentic Heritage', desc: 'Exclusive access to private lemon groves, historic Ravello palaces, and artisan ceramic ateliers.' },
          { title: 'Total Privacy', desc: 'Private estate buyout guaranteeing complete confidentiality and peaceful reflection.' }
        ]
      },
      {
        kicker: 'DAYS 1 - 3 ITINERARY',
        title: 'Arrival & Coastal Immersion',
        subtitle: 'Seamless private helicopter transfers followed by coastal exploration.',
        footerLeft: 'Itinerary Part I',
        cards: [
          { title: 'Day 1: Naples to Positano', desc: 'Helicopter transfer from Naples tarmac directly to Villa Treville. Sunset champagne welcome reception.' },
          { title: 'Day 2: Capri Yacht Expedition', desc: 'Full-day charter aboard M/Y Serenissima to Capri. Private swimming in the Green Grotto and lunch at La Fontelina.' },
          { title: 'Day 3: Ravello & Classical Music', desc: 'Chauffeured vintage Alfa Romeo convoy to Ravello. Private garden tour at Villa Cimbrone followed by cliffside concert.' }
        ]
      },
      {
        kicker: 'DAYS 4 - 6 ITINERARY',
        title: 'Culinary Masterclasses & Leisure',
        subtitle: 'Immersion into Campania’s finest gastronomic and wine traditions.',
        footerLeft: 'Itinerary Part II',
        cards: [
          { title: 'Day 4: Mount Vesuvius Vineyards', desc: 'Private visit to centuries-old volcanic vineyards; barrel tasting hosted by lead winemaker.' },
          { title: 'Day 5: Private Chef Villa Gala', desc: 'Cooking masterclass with 3-Michelin-star chef followed by an 8-course al fresco terrace gala.' },
          { title: 'Day 6: Li Galli Archipelago', desc: 'Snorkeling and water toys in the private sirens islands; afternoon wellness and spa treatments.' }
        ]
      },
      {
        kicker: 'ACCOMMODATIONS',
        title: 'Villa Treville Private Clifftop Buyout',
        subtitle: 'Exclusive luxury estate overlooking the sapphire waters of Positano.',
        footerLeft: 'Accommodations',
        cards: [
          { title: '12 Luxury Suites', desc: 'Each room individually designed with hand-painted Vietri tiles, private balconies, and plunge pools.' },
          { title: 'Dedicated Villa Staff', desc: 'Full team of private chefs, 24/7 personal concierges, housekeepers, and mixologists.' },
          { title: 'Private Sea Access', desc: 'Direct elevator shaft through cliff down to private seaside sun-deck and speedboat tender.' }
        ]
      },
      {
        kicker: 'FINE DINING & WINE',
        title: 'Curated Gastronomy & Sommelier Selection',
        subtitle: 'World-renowned Mediterranean culinary masters and rare vintage pairings.',
        footerLeft: 'Culinary Highlights',
        cards: [
          { title: 'Quattro Passi (Nerano)', desc: '3-Michelin-star modern Mediterranean feast accessed exclusively by private boat tender.' },
          { title: 'Private Villa Sommelier', desc: 'Nightly curated pairings featuring vintage Super Tuscans, Barolos, and regional Greco di Tufo.' },
          { title: 'Fresh Catch Al Fresco', desc: 'Daily Mediterranean sea bass and red prawns prepared fresh on the yacht aft deck.' }
        ]
      },
      {
        kicker: 'LOGISTICS & TRANSFERS',
        title: 'Flawless Private Transit Logistics',
        subtitle: 'Door-to-door VIP assistance ensuring zero travel fatigue.',
        footerLeft: 'Logistics',
        cards: [
          { title: 'Naples Airport VIP Meet', desc: 'Direct tarmac immigration escort and luggage handling with zero terminal waiting.' },
          { title: 'Twin-Engine Helicopter Transfers', desc: 'Two twin-engine Airbus H135 helicopters providing 15-minute coastal hops.' },
          { title: 'Chauffeured Mercedes Maybach', desc: 'Luxury fleet on standby 24/7 for shore-side excursions along the coast.' }
        ]
      },
      {
        kicker: 'COMMERCIAL TERMS',
        title: 'Investment Breakdown & Package Pricing',
        subtitle: 'Transparent, all-inclusive pricing with complete fiduciary management.',
        footerLeft: 'Pricing & Inclusions',
        cards: [
          { title: 'Total All-Inclusive: €148,000', desc: 'Complete 7-day buyout for up to 12 guests (€12,330 per guest all-inclusive).' },
          { title: 'Included Services', desc: 'Villa buyout, 140ft yacht charter, aviation, all Michelin meals, premium open bar, and gratuities.' },
          { title: 'Booking Schedule', desc: '30% deposit upon proposal confirmation; 70% balance due 45 days prior to arrival.' }
        ]
      }
    ]
  },
  'kyoto-japan': {
    title: 'Kyoto & Tokyo: 10-Day Private Ryokan & Culinary Heritage Journey',
    destination: 'Kyoto & Tokyo, Japan',
    guests: '6 Guests (Family / VIP)',
    slides: [
      {
        kicker: 'JAPAN CULTURAL EXPEDITION',
        title: 'Kyoto & Tokyo Heritage Odyssey',
        subtitle: '10 Days of Ancient Temples, Private Tea Masters, and 3-Star Michelin Kaiseki',
        footerLeft: 'Luxury Travel Proposal',
        cards: [
          { title: 'Duration & Season', desc: '10 Nights / 11 Days timed for peak autumn foliage or cherry blossoms.' },
          { title: 'Private Intimacy', desc: 'Exclusively curated for 6 guests with English-speaking cultural historians.' },
          { title: 'Signature Access', desc: 'Closed-door temple viewings, geiko banquets, and master swordsmith ateliers.' }
        ]
      },
      {
        kicker: 'PHILOSOPHY & CONCEPT',
        title: 'The Essence of Omotenashi',
        subtitle: 'Uncompromising Japanese hospitality elevated to an art form.',
        footerLeft: 'Trip Vision',
        cards: [
          { title: 'Ancient Traditions', desc: 'Private Zen meditation with head monks at UNESCO Daitoku-ji temples.' },
          { title: 'Culinary Precision', desc: 'Kaiseki meals prepared by living national treasure culinary masters.' },
          { title: 'Shinkansen Gran Class', desc: 'Private luxury first-class bullet train carriage between Tokyo and Kyoto.' }
        ]
      },
      {
        kicker: 'DAYS 1 - 4: TOKYO',
        title: 'Futuristic Metropolis & Private Art',
        subtitle: 'Discovering Tokyo’s hidden high-art ateliers and modern design.',
        footerLeft: 'Tokyo Itinerary',
        cards: [
          { title: 'Day 1: Aman Tokyo Arrival', desc: 'Private airport greeting; recovery massage at Aman Spa overlooking the Imperial Palace gardens.' },
          { title: 'Day 2: Tsukiji & Ginza Access', desc: 'Pre-dawn private fish market access with master sushi chef; 20-course omakase dinner.' },
          { title: 'Day 3: Digital Art & Architecture', desc: 'After-hours private tour of teamLab Planets and Roppongi Hills modern architecture.' }
        ]
      },
      {
        kicker: 'DAYS 5 - 8: KYOTO',
        title: 'Imperial Temples & Bamboo Groves',
        subtitle: 'Stepping back into classical Japan with sovereign access.',
        footerLeft: 'Kyoto Itinerary',
        cards: [
          { title: 'Day 5: Shinkansen to Aman Kyoto', desc: 'Private Gran Class transit; check-in to Aman Kyoto nestled in a secret moss garden.' },
          { title: 'Day 6: Gion Geiko Evening', desc: 'Exclusive private teahouse dinner in Gion featuring classical dances and shamisen music.' },
          { title: 'Day 7: Bamboo Groves & Arashiyama', desc: 'Sunrise private boat cruise on Oi River; matcha ceremony with a 15th-generation tea master.' }
        ]
      },
      {
        kicker: 'ACCOMMODATIONS',
        title: 'Aman Tokyo & Aman Kyoto Suites',
        subtitle: 'The pinnacle of Japanese architectural minimalism and sanctuary luxury.',
        footerLeft: 'Accommodations',
        cards: [
          { title: 'Aman Tokyo Suite', desc: 'Soaring 157sqm suites with cedar wood furo soaking tubs and panoramic skyline vistas.' },
          { title: 'Aman Kyoto Pavilions', desc: 'Hidden within a 72-acre forested heritage garden with natural onsen hot springs.' },
          { title: 'Bespoke Butler Service', desc: 'Dedicated bilingual attendants anticipating every preference.' }
        ]
      },
      {
        kicker: 'MICHELIN DINING',
        title: 'Sacred Culinary Journeys',
        subtitle: 'Hardest-to-book counter reservations secured through concierge standing.',
        footerLeft: 'Gastronomy',
        cards: [
          { title: 'Sushi Yoshitake (Tokyo)', desc: 'Legendary 3-star Edomae counter reserved exclusively for your party of six.' },
          { title: 'Kitcho Arashiyama (Kyoto)', desc: 'Seasonal kaiseki dining overlooking the river with rare ceramic tableware.' },
          { title: 'Kobe Beef Teppanyaki', desc: 'Private chef searing A5 Miyazaki Wagyu over binchotan white charcoal.' }
        ]
      },
      {
        kicker: 'LOGISTICS & RAIL',
        title: 'White-Glove Transfers & Bullet Rail',
        subtitle: 'Zero friction from Tokyo Haneda arrival to Kyoto departure.',
        footerLeft: 'Logistics',
        cards: [
          { title: 'Airport Fast-Track VIP', desc: 'Personal airport protocol team assisting customs and baggage retrieval.' },
          { title: 'Gran Class Rail Carriage', desc: 'Reserved private section on Hayabusa Shinkansen with attendant dining.' },
          { title: 'Toyota Alphard Executive Fleet', desc: 'Captain seat executive minivans for all city transit.' }
        ]
      },
      {
        kicker: 'INVESTMENT & TERMS',
        title: 'Bespoke Proposal Package Pricing',
        subtitle: 'Complete luxury itinerary with all reservations pre-funded.',
        footerLeft: 'Pricing & Inclusions',
        cards: [
          { title: 'Total Investment: $118,500', desc: 'Total for 6 guests ($19,750 per person all-inclusive package).' },
          { title: 'All-Inclusive Inclusions', desc: 'Luxury suites, private guides, all meals, Shinkansen rail, and domestic flights.' },
          { title: 'Confirmation Terms', desc: 'Deposit of 35% upon booking; full balance due 60 days before travel.' }
        ]
      }
    ]
  },
  'swiss-alps': {
    title: 'Swiss Alps & Zermatt: 6-Day Private Heli-Skiing & Chalet Escape',
    destination: 'Zermatt & Verbier, Switzerland',
    guests: '8 Guests (Ski Expedition)',
    slides: [
      {
        kicker: 'ALPINE WINTER EXPEDITION',
        title: 'Swiss Alps Private Heli-Skiing Odyssey',
        subtitle: '6 Days of Untouched Glacier Powder, 5-Star Chalet Luxury, and Michelin Fondue',
        footerLeft: 'Luxury Travel Proposal',
        cards: [
          { title: 'Mountain Setting', desc: 'Private chalet with direct views of the iconic Matterhorn peak.' },
          { title: 'Helicopter Guiding', desc: 'Certified IFMGA mountain guides and private helicopter drops each morning.' },
          { title: 'Chalet Peak Buyout', desc: 'Full buyout of award-winning multi-level luxury wellness chalet.' }
        ]
      },
      {
        kicker: 'EXPEDITION CONCEPT',
        title: 'Pure Alpine Exhilaration & Rest',
        subtitle: 'World-class deep powder descents coupled with fireside restorative luxury.',
        footerLeft: 'Trip Vision',
        cards: [
          { title: 'Glacier Descents', desc: 'Heli-drops on Monte Rosa and the Alphubel glaciers totaling 10,000 vertical meters.' },
          { title: 'Thermal Wellness', desc: 'Private indoor/outdoor whirlpools, Finnish sauna, and daily sports massage.' },
          { title: 'Swiss Wine Cellars', desc: 'Tasting rare Valais region vintages and bespoke artisanal Alpine cheeses.' }
        ]
      },
      {
        kicker: 'DAYS 1 - 3 ITINERARY',
        title: 'Arrival & First Glacier Drops',
        subtitle: 'Acclimatization, equipment custom-fitting, and maiden powder runs.',
        footerLeft: 'Alpine Itinerary I',
        cards: [
          { title: 'Day 1: Zurich to Zermatt', desc: 'Helicopter transfer over the Bernese Oberland directly to Zermatt heliport. Welcome fondue.' },
          { title: 'Day 2: Monte Rosa Glacier Drop', desc: 'Two heli-drops onto the high Monte Rosa glacier. 3,000m descent followed by mountain lunch at Chez Vrony.' },
          { title: 'Day 3: Powder Couloirs', desc: 'Guided tree runs in Schwarztor canyon; afternoon massage and sauna therapy.' }
        ]
      },
      {
        kicker: 'DAYS 4 - 6 ITINERARY',
        title: 'Cross-Border Italy Runs & Finale',
        subtitle: 'Skiing into Cervinia Italy for lunch before the final celebratory gala.',
        footerLeft: 'Alpine Itinerary II',
        cards: [
          { title: 'Day 4: Italian Border Skiing', desc: 'Cross-border run down to Cervinia for authentic truffle pasta; ski back through the glacier pass.' },
          { title: 'Day 5: Sunset Night Skiing', desc: 'Exclusive after-hours torchlit descent accompanied by fireworks over the Matterhorn.' },
          { title: 'Day 6: Farewell & Zurich Flight', desc: 'Champagne brunch on the chalet terrace; helicopter transfer to Zurich International.' }
        ]
      },
      {
        kicker: 'CHALET SHOWCASE',
        title: 'Chalet Zermatt Peak Private Buyout',
        subtitle: 'Consistently awarded the World’s Best Luxury Ski Chalet.',
        footerLeft: 'Accommodations',
        cards: [
          { title: 'Panoramic Architecture', desc: 'Floor-to-ceiling glass capturing unobstructed views of the Matterhorn from every suite.' },
          { title: 'Wellness Sanctuary', desc: 'Private steam room, bio-sauna, indoor/outdoor heated Jacuzzi, and fitness suite.' },
          { title: 'Full Culinary Brigade', desc: 'Executive private chef, chalet manager, concierges, and ski technician.' }
        ]
      },
      {
        kicker: 'ALPINE GASTRONOMY',
        title: 'Fireside Dining & Mountain Cabins',
        subtitle: 'A blend of hearty Alpine traditions and Michelin-starred refinement.',
        footerLeft: 'Gastronomy',
        cards: [
          { title: 'Chez Vrony (Sunnegga)', desc: 'Historic mountain lodge serving 100-year-old family recipes and local dry-aged beef.' },
          { title: 'Chalet Michelin Dinner', desc: 'Private 7-course tasting menu paired with rare Grand Cru Swiss and Bordeaux wines.' },
          { title: 'Gourmet Snow Picnic', desc: 'Thermal champagne yurt with heated seating set up directly on the glacier.' }
        ]
      },
      {
        kicker: 'AVIATION & LOGISTICS',
        title: 'Airbus H125 Alpine Helicopters',
        subtitle: 'Maximum performance and safety in high-altitude mountain terrain.',
        footerLeft: 'Logistics',
        cards: [
          { title: 'Dedicated Pilot on Standby', desc: 'Private helicopter stationed at Zermatt Air Zermatt base dedicated solely to your party.' },
          { title: 'Top-Tier Gear Fitting', desc: 'Custom Stöckli and DPS powder skis delivered and fitted directly in the chalet ski room.' },
          { title: 'Emergency Protocols', desc: 'All guides equipped with satellite phones, avalanche airbags, and instant beacon links.' }
        ]
      },
      {
        kicker: 'INVESTMENT & TERMS',
        title: 'Expedition Package Breakdown',
        subtitle: 'All-inclusive private alpine charter package.',
        footerLeft: 'Pricing & Terms',
        cards: [
          { title: 'Total Investment: CHF 125,000', desc: 'Comprehensive package for up to 8 guests (CHF 15,625 per skier).' },
          { title: 'Inclusions', desc: 'Chalet buyout, helicopter flight hours, IFMGA guides, lift passes, dining, and open bar.' },
          { title: 'Deposit & Insurance', desc: '50% deposit upon booking; comprehensive winter mountain rescue insurance included.' }
        ]
      }
    ]
  },
  'serengeti-safari': {
    title: 'Serengeti & Ngorongoro: 8-Day Luxury Tented Safari & Wildlife Conservation',
    destination: 'Serengeti, Tanzania',
    guests: '6 Guests (Family / Safari)',
    slides: [
      {
        kicker: 'AFRICAN EXPEDITION PROPOSAL',
        title: 'Serengeti & Ngorongoro Private Safari',
        subtitle: '8 Days of Great Migration Tracking, Private Bush Aviation, and Conservation Access',
        footerLeft: 'Luxury Travel Proposal',
        cards: [
          { title: 'Expedition Scope', desc: '8 Days exploring the endless plains of the Serengeti and Ngorongoro Crater.' },
          { title: 'Camp Exclusivity', desc: 'Private luxury tented camp buyouts with zero other tourists.' },
          { title: 'Master Trackers', desc: 'Led by certified senior Maasai and Tanzanian wildlife biologists.' }
        ]
      },
      {
        kicker: 'EXPEDITION CONCEPT',
        title: 'Untamed Wilderness & Refined Comfort',
        subtitle: 'Witnessing nature’s greatest wildlife spectacle from luxurious private camps.',
        footerLeft: 'Trip Vision',
        cards: [
          { title: 'The Great Migration', desc: 'Front-row seats to millions of wildebeest crossing the Mara River.' },
          { title: 'Hot Air Balloon Safari', desc: 'Sunrise flights over the acacia canopy followed by champagne bush breakfast.' },
          { title: 'Rhino Conservation', desc: 'Behind-the-scenes tracking with park anti-poaching ranger units.' }
        ]
      },
      {
        kicker: 'DAYS 1 - 4: SERENGETI',
        title: 'Endless Plains & River Crossings',
        subtitle: 'Daily game drives tracking prides of lions, leopards, and cheetahs.',
        footerLeft: 'Safari Itinerary I',
        cards: [
          { title: 'Day 1: Kilimanjaro to Singita', desc: 'Private Cessna Caravan flight directly into Sasakwa airstrip. Afternoon sundowner.' },
          { title: 'Day 2: Mara River Watch', desc: 'Tracking massive herd movements and dramatic crocodile river crossings.' },
          { title: 'Day 3: Stargazing & Night Drive', desc: 'Infrared night game drive spotting nocturnal servals and leopard hunts.' }
        ]
      },
      {
        kicker: 'DAYS 5 - 8: CRATER',
        title: 'The Lost World of Ngorongoro',
        subtitle: 'Descending into the UNESCO volcanic caldera harboring the Big Five.',
        footerLeft: 'Safari Itinerary II',
        cards: [
          { title: 'Day 5: Fly to Crater Rim', desc: 'Check-in to Ngorongoro Crater Lodge clinging to the rim 2,300m above sea level.' },
          { title: 'Day 6: Crater Floor Safari', desc: 'Encountering black rhinos, flamingos, and massive bull elephants on the crater floor.' },
          { title: 'Day 7: Maasai Cultural Exchange', desc: 'Private visit to a Maasai boma learning herbal botany and traditional archery.' }
        ]
      },
      {
        kicker: 'ACCOMMODATIONS',
        title: 'Singita Sasakwa & Crater Lodge',
        subtitle: 'World-renowned conservation lodges marrying colonial elegance with modern luxury.',
        footerLeft: 'Accommodations',
        cards: [
          { title: 'Singita Sasakwa Lodge', desc: 'Edwardian manor villas with private heated infinity pools overlooking 350,000 acres.' },
          { title: 'Ngorongoro Crater Lodge', desc: 'Versailles-meets-Maasai stilted suites with roaring fireplaces and chandelier baths.' },
          { title: 'Private Camp Staff', desc: 'Personal safari butlers, laundry service, and private bush chefs.' }
        ]
      },
      {
        kicker: 'BUSH DINING',
        title: 'Lantern-Lit Dining Under The Stars',
        subtitle: 'Sensational African fusion dining in breathtaking wilderness settings.',
        footerLeft: 'Gastronomy',
        cards: [
          { title: 'Acacia Tree Sundowners', desc: 'Artisan craft gin & tonics served with gourmet canapés as the sun sinks beneath the horizon.' },
          { title: 'Boma Fire Banquets', desc: 'Charcoal-grilled meats and African curries accompanied by traditional singing.' },
          { title: 'Champagne Bush Breakfast', desc: 'Eggs benedict and fresh tropical fruits set up directly on the savanna following balloon flights.' }
        ]
      },
      {
        kicker: 'BUSH AVIATION',
        title: 'Private Charter Flights & Land Cruisers',
        subtitle: 'Bypassing bumpy commercial roads with twin-engine bush aviation.',
        footerLeft: 'Logistics',
        cards: [
          { title: 'Cessna Grand Caravan', desc: 'Dedicated executive charter aircraft linking bush airstrips directly.' },
          { title: 'Custom 4x4 Safari Vehicles', desc: 'Open-sided safari cruisers with charging ports, refrigerators, and beanbag camera mounts.' },
          { title: 'Flying Doctor Evac Cover', desc: 'Comprehensive medical evacuation coverage included for all travelers.' }
        ]
      },
      {
        kicker: 'INVESTMENT & TERMS',
        title: 'Conservation Safari Package Pricing',
        subtitle: 'A portion of all proceeds directly supports local anti-poaching initiatives.',
        footerLeft: 'Pricing & Inclusions',
        cards: [
          { title: 'Total Investment: $98,400', desc: 'Complete 8-day package for 6 guests ($16,400 per guest all-inclusive).' },
          { title: 'Inclusions', desc: 'All lodge buyouts, private flights, park fees, conservation levies, and balloon safari.' },
          { title: 'Booking Schedule', desc: '30% deposit upon confirmation; balance due 90 days before departure.' }
        ]
      }
    ]
  },
  'iceland-aurora': {
    title: 'Iceland: 5-Day Northern Lights, Glaciers & Geothermal Expedition',
    destination: 'Reykjavik & South Coast, Iceland',
    guests: '8 Guests (Adventure Luxe)',
    slides: [
      {
        kicker: 'NORDIC EXPEDITION PROPOSAL',
        title: 'Iceland Northern Lights & Glaciers',
        subtitle: '5 Days of Private Geothermal Lagoons, Super Jeep Glaciers, and Aurora Hunting',
        footerLeft: 'Luxury Travel Proposal',
        cards: [
          { title: 'Nordic Setting', desc: 'Volcanic landscapes, crystalline ice caves, and dancing Aurora Borealis.' },
          { title: 'Luxury Retreat', desc: 'Private suite buyout at The Retreat at Blue Lagoon with private geothermal lagoon.' },
          { title: 'Expedition Super Jeeps', desc: 'Custom 46-inch tire Arctic trucks traversing inaccessible glacier trails.' }
        ]
      },
      {
        kicker: 'EXPEDITION CONCEPT',
        title: 'Fire & Ice in Absolute Seclusion',
        subtitle: 'A thrilling sensory adventure balanced with restorative geothermal wellness.',
        footerLeft: 'Trip Vision',
        cards: [
          { title: 'Private Blue Lagoon', desc: 'Unrestricted access to the private mineral-rich waters away from public crowds.' },
          { title: 'Ice Cave Exploration', desc: 'Helicopter flight into the heart of Vatnajökull glacier to explore sapphire ice caverns.' },
          { title: 'Nightly Aurora Hunts', desc: 'Astronomer guides tracking solar wind forecasts for guaranteed Northern Lights sightings.' }
        ]
      },
      {
        kicker: 'DAYS 1 - 3 ITINERARY',
        title: 'Geothermal Blue Lagoon & Golden Circle',
        subtitle: 'Volcanic hot springs and cascading waterfalls.',
        footerLeft: 'Itinerary Part I',
        cards: [
          { title: 'Day 1: Keflavik to Retreat', desc: 'VIP airport transfer; private lagoon soak and in-water silica massage.' },
          { title: 'Day 2: Golden Circle Heli-Tour', desc: 'Private helicopter flight landing between continental tectonic plates and erupting geysers.' },
          { title: 'Day 3: South Coast Waterfalls', desc: 'Walking behind Seljalandsfoss waterfall; black sand beaches of Reynisfjara.' }
        ]
      },
      {
        kicker: 'DAYS 4 - 5 ITINERARY',
        title: 'Sapphire Ice Caves & Farewell Gala',
        subtitle: 'Deep exploration of glacier ice tunnels followed by Michelin Nordic cuisine.',
        footerLeft: 'Itinerary Part II',
        cards: [
          { title: 'Day 4: Crystal Ice Cave Expedition', desc: 'Super Jeep trek up the glacier; private exploration of naturally sculpted blue ice tunnels.' },
          { title: 'Day 5: Reykjavik Gastronomy & Departure', desc: 'Tasting menu at Michelin-starred DILL; evening helicopter transfer to airport.' }
        ]
      },
      {
        kicker: 'ACCOMMODATIONS',
        title: 'The Retreat at Blue Lagoon Buyout',
        subtitle: 'Architectural masterpiece carved directly into an 800-year-old lava flow.',
        footerLeft: 'Accommodations',
        cards: [
          { title: 'Lagoon Suites', desc: 'Private suites featuring direct steps into geothermal lagoon waters.' },
          { title: 'Subterranean Spa', desc: 'Lava steam caves, fire lounge, and mineral scrub chambers.' },
          { title: 'Dedicated Host', desc: 'Private 24-hour host curating all daily excursions.' }
        ]
      },
      {
        kicker: 'NORDIC GASTRONOMY',
        title: 'New Nordic Cuisine & Glacier Picnics',
        subtitle: 'Foraged ingredients, smoked Arctic char, and geothermal bread.',
        footerLeft: 'Gastronomy',
        cards: [
          { title: 'Moss Restaurant', desc: 'Michelin-starred culinary journey focusing on pure Icelandic terroir.' },
          { title: 'Glacier Caviar & Vodka Bar', desc: 'Ice bar carved directly onto the glacier serving chilled Icelandic aquavit.' },
          { title: 'Private Chef in Lava Cave', desc: 'Candlelit dinner inside a natural underground volcanic magma tube.' }
        ]
      },
      {
        kicker: 'EXPEDITION GEAR & FLEET',
        title: 'Modified Arctic Super Jeeps & Helicopters',
        subtitle: 'Navigating sub-zero ice caps with absolute comfort and heated seating.',
        footerLeft: 'Logistics',
        cards: [
          { title: '46-Inch Arctic Super Jeeps', desc: 'Tire inflation systems allowing smooth travel over deep snow and crevasses.' },
          { title: 'Helicopter Aerial Transit', desc: 'Bell 407 helicopter for panoramic sightseeing and rapid transit.' },
          { title: 'Canada Goose Parkas Provided', desc: 'Full expedition thermal gear and crampons provided for every guest.' }
        ]
      },
      {
        kicker: 'INVESTMENT & TERMS',
        title: 'Nordic Proposal Package Pricing',
        subtitle: 'Comprehensive luxury Arctic expedition package.',
        footerLeft: 'Pricing & Terms',
        cards: [
          { title: 'Total Investment: €78,000', desc: 'Total for 8 guests (€9,750 per person all-inclusive package).' },
          { title: 'Inclusions', desc: 'Retreat suites, helicopter flights, Super Jeeps, all Michelin meals, and thermal gear.' },
          { title: 'Confirmation Terms', desc: '40% deposit upon booking; full balance due 45 days prior to arrival.' }
        ]
      }
    ]
  }
};

// Generate Proposal Deck
function generateTravelProposal(promptText, guests, count) {
  const destName = promptText.split(':')[0].trim() || 'Luxury Expedition';
  const desc = promptText.includes(':') ? promptText.split(':')[1].trim() : promptText;

  const slides = [
    {
      kicker: 'EXPEDITION PROPOSAL',
      title: destName,
      subtitle: desc || 'Bespoke Curated Travel Itinerary & Concierge Experience',
      footerLeft: 'Luxury Travel Proposal',
      cards: [
        { title: `Guest Party Scale: ${guests}`, desc: 'Private reservation configured exclusively for your party.' },
        { title: 'Curated Access', desc: 'Private aviation, 5-star accommodations, and closed-door cultural access.' },
        { title: 'Concierge Stewardship', desc: '24/7 dedicated travel manager handling every reservation seamlessly.' }
      ]
    },
    {
      kicker: 'TRIP VISION & ATMOSPHERE',
      title: 'Curated Concept & Ambience',
      subtitle: 'A thoughtful balance of adrenaline, cultural depth, and private relaxation.',
      footerLeft: 'Experience Philosophy',
      cards: [
        { title: 'Private Navigation', desc: 'Skip public queues and crowded hubs with dedicated private charters.' },
        { title: 'Living Heritage', desc: 'Private appointments with renowned chefs, historians, and local custodians.' },
        { title: 'Sanctuary Comfort', desc: 'Estate and villa buyouts ensuring absolute discretion and rest.' }
      ]
    },
    {
      kicker: 'DAYS 1 - 3 ITINERARY',
      title: 'Arrival & Signature Immersion',
      subtitle: 'From airport runway to private champagne welcome reception.',
      footerLeft: 'Itinerary Part I',
      cards: [
        { title: 'Day 1: VIP Arrival & Check-In', desc: 'Chauffeured tarmac greet; scenic helicopter hop to private estate; welcome dinner.' },
        { title: 'Day 2: Maiden Expedition', desc: 'Private yacht charter or guided 4x4 excursion exploring secret coves and historical vistas.' },
        { title: 'Day 3: Cultural Access', desc: 'Behind-the-scenes private tour of regional heritage sites followed by winery luncheon.' }
      ]
    },
    {
      kicker: 'DAYS 4 - 6 ITINERARY',
      title: 'Peak Adventures & Wellness',
      subtitle: 'The highlight experiences of your bespoke journey.',
      footerLeft: 'Itinerary Part II',
      cards: [
        { title: 'Day 4: Signature Highlight', desc: 'Helicopter tour, glacier trek, or deep-sea marine expedition with private guides.' },
        { title: 'Day 5: Private Chef Villa Banquet', desc: 'Multi-course culinary masterclass and al fresco sunset terrace feast.' },
        { title: 'Day 6: Restorative Wellness', desc: 'Full day of spa treatments, yoga sessions, and uninterrupted relaxation.' }
      ]
    },
    {
      kicker: 'LUXURY ACCOMMODATIONS',
      title: 'Handpicked 5-Star Sanctuary Estate',
      subtitle: 'Uncompromising luxury, architectural character, and scenic isolation.',
      footerLeft: 'Accommodations',
      cards: [
        { title: 'Estate Buyout', desc: 'Dedicated suites for all guests with private balconies and plunge pools.' },
        { title: 'Private Staffing', desc: 'Full-time private chef, mixologist, housekeeping, and personal concierge.' },
        { title: 'Wellness Amenities', desc: 'Private spa, sauna, heated pool, and bespoke fitness equipment.' }
      ]
    },
    {
      kicker: 'PRIVATE GASTRONOMY',
      title: 'Michelin Dining & Sommelier Cellar',
      subtitle: 'World-renowned culinary masters creating unforgettable meals.',
      footerLeft: 'Gastronomy',
      cards: [
        { title: 'Michelin-Starred Bookings', desc: 'Hardest-to-get private dining rooms reserved exclusively for your party.' },
        { title: 'Sommelier Wine Tastings', desc: 'Nightly tastings of rare vintage local wines and bespoke pairings.' },
        { title: 'Gourmet Field Picnics', desc: 'Luxury champagne picnics set up in secluded scenic landscapes.' }
      ]
    },
    {
      kicker: 'LOGISTICS & TRANSIT',
      title: 'Private Aviation & Chauffeur Fleet',
      subtitle: 'Effortless door-to-door transit ensuring zero travel fatigue.',
      footerLeft: 'Logistics',
      cards: [
        { title: 'Tarmac Fast-Track', desc: 'Bypass commercial lines with private VIP tarmac clearance.' },
        { title: 'Executive Vehicles', desc: 'Dedicated fleet of Mercedes Maybach or custom 4x4 vehicles on standby 24/7.' },
        { title: 'Luggage Protocol', desc: 'Direct baggage transfer from airport to suite wardrobe.' }
      ]
    },
    {
      kicker: 'PACKAGE INVESTMENT',
      title: 'Investment Breakdown & Package Pricing',
      subtitle: 'Transparent, all-inclusive pricing with complete fiduciary management.',
      footerLeft: 'Pricing & Inclusions',
      cards: [
        { title: 'Total All-Inclusive Investment', desc: 'Fully pre-funded package with all taxes, gratuities, and charters covered.' },
        { title: '100% Inclusions', desc: 'Accommodations, aviation, dining, premium bar, private guides, and gear.' },
        { title: 'Booking Schedule', desc: '30% deposit upon proposal confirmation; balance due 60 days prior to departure.' }
      ]
    }
  ];

  if (count >= 10) {
    slides.push({
      kicker: 'CURATED VIP ADD-ONS',
      title: 'Optional Bespoke Enhancements',
      subtitle: 'Elevate your journey with these high-touch extensions.',
      footerLeft: 'VIP Add-Ons',
      cards: [
        { title: 'Private Film & Photo Crew', desc: 'Professional videographer and drone operator delivering a cinematic trip documentary.' },
        { title: 'Extended Yacht Charter Days', desc: 'Option to extend maritime cruising by an additional 48 hours.' },
        { title: 'Private Security Detail', desc: 'Discreet close-protection specialists on standby throughout the itinerary.' }
      ]
    });

    slides.push({
      kicker: 'NEXT STEPS & RESERVATION',
      title: 'Reserving Your Expedition Dates',
      subtitle: 'How to lock in calendar availability and initiate personalized onboarding.',
      footerLeft: 'Concierge Next Steps',
      cards: [
        { title: 'Step 1: Confirmation', desc: 'Sign proposal confirmation agreement and submit initial 30% calendar deposit.' },
        { title: 'Step 2: Preference Consultation', desc: 'Concierge call with lead traveler to document dietary, wellness, and activity preferences.' },
        { title: 'Step 3: Departure Packet', desc: 'Receive custom leather-bound itinerary books and mobile concierge access.' }
      ]
    });
  }

  return slides;
}

// Render Thumbnails
function renderThumbnails() {
  const container = document.getElementById('travel-thumbs-container');
  if (!container) return;

  container.innerHTML = '';
  travelSlides.forEach((slide, idx) => {
    const card = document.createElement('div');
    card.className = `travel-thumb-card ${idx === activeSlideIndex ? 'active' : ''}`;
    card.onclick = () => selectSlide(idx);

    card.innerHTML = `
      <span style="font-weight: 800; font-size: 0.75rem; color: var(--accent);">#${idx + 1}</span>
      <div style="flex: 1; overflow: hidden;">
        <div style="font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase;">${escapeHtml(slide.kicker || 'ITINERARY')}</div>
        <div style="font-size: 0.82rem; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(slide.title || 'Untitled')}</div>
      </div>
    `;
    container.appendChild(card);
  });

  const counter = document.getElementById('counter-active-slide');
  if (counter) counter.textContent = `${activeSlideIndex + 1} / ${travelSlides.length}`;

  const badgeTotal = document.getElementById('badge-total-slides');
  if (badgeTotal) badgeTotal.textContent = `${travelSlides.length} Slides`;
}

// Render Slide Content
function renderTravelSlide(slide, targetEl, isFullscreen = false) {
  if (!slide || !targetEl) return;

  let bodyHtml = '';
  if (slide.cards) {
    bodyHtml = `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1.25rem;">
        ${slide.cards.map(c => `
          <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between;">
            <h4 style="font-size: 1.05rem; font-weight: 700; color: #fff; margin-bottom: 0.4rem;">${escapeHtml(c.title)}</h4>
            <p style="font-size: 0.85rem; color: #94a3b8; line-height: 1.45; margin: 0;">${escapeHtml(c.desc)}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  targetEl.innerHTML = `
    <div>
      <div style="display: inline-block; padding: 0.25rem 0.65rem; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 9999px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: #38bdf8; margin-bottom: 0.6rem;">
        ${escapeHtml(slide.kicker || 'EXPEDITION')}
      </div>
      <h2 style="font-size: ${isFullscreen ? '2.4rem' : '1.9rem'}; font-weight: 800; line-height: 1.15; margin-bottom: 0.4rem; color: #fff;">
        ${escapeHtml(slide.title || '')}
      </h2>
      <p style="font-size: ${isFullscreen ? '1.15rem' : '0.95rem'}; color: #94a3b8; margin-bottom: 1rem;">
        ${escapeHtml(slide.subtitle || '')}
      </p>
      ${bodyHtml}
    </div>
    <div style="display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.75rem; font-size: 0.72rem; color: #64748b; margin-top: 1rem;">
      <span>${escapeHtml(slide.footerLeft || 'Luxury Travel Proposal')}</span>
      <span>Slide ${activeSlideIndex + 1} of ${travelSlides.length}</span>
    </div>
  `;
}

// Select Slide
function selectSlide(idx) {
  if (idx < 0 || idx >= travelSlides.length) return;
  activeSlideIndex = idx;
  renderThumbnails();

  const stage = document.getElementById('travel-slide-stage');
  if (stage) renderTravelSlide(travelSlides[activeSlideIndex], stage, false);

  const cur = travelSlides[activeSlideIndex];
  if (cur) {
    const inTitle = document.getElementById('inp-edit-title');
    const inKicker = document.getElementById('inp-edit-kicker');
    const inSub = document.getElementById('inp-edit-sub');
    const inContent = document.getElementById('inp-edit-content');

    if (inTitle) inTitle.value = cur.title || '';
    if (inKicker) inKicker.value = cur.kicker || '';
    if (inSub) inSub.value = cur.subtitle || '';

    if (inContent && cur.cards) {
      inContent.value = cur.cards.map(c => `${c.title}: ${c.desc}`).join('\n');
    }
  }

  if (isPresenting) {
    updateFullscreen();
  }
}

// Sync Editor into Slide
function syncEditorToSlide() {
  const cur = travelSlides[activeSlideIndex];
  if (!cur) return;

  const inTitle = document.getElementById('inp-edit-title');
  const inKicker = document.getElementById('inp-edit-kicker');
  const inSub = document.getElementById('inp-edit-sub');
  const inContent = document.getElementById('inp-edit-content');

  if (inTitle) cur.title = inTitle.value;
  if (inKicker) cur.kicker = inKicker.value;
  if (inSub) cur.subtitle = inSub.value;

  if (inContent) {
    const lines = inContent.value.split('\n').map(l => l.trim()).filter(Boolean);
    cur.cards = lines.map(line => {
      if (line.includes(':')) {
        const parts = line.split(':');
        return { title: parts[0].trim(), desc: parts.slice(1).join(':').trim() };
      }
      return { title: line, desc: '' };
    });
  }

  renderThumbnails();
  const stage = document.getElementById('travel-slide-stage');
  if (stage) renderTravelSlide(cur, stage, false);
}

// Fullscreen Presenter Mode
function openFullscreen() {
  const modal = document.getElementById('fs-travel-modal');
  if (!modal) return;
  isPresenting = true;
  modal.classList.add('active');
  updateFullscreen();

  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
}

function closeFullscreen() {
  const modal = document.getElementById('fs-travel-modal');
  if (!modal) return;
  isPresenting = false;
  modal.classList.remove('active');

  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
}

function updateFullscreen() {
  const target = document.getElementById('fs-slide-content');
  const counter = document.getElementById('fs-slide-num');
  if (!target) return;

  renderTravelSlide(travelSlides[activeSlideIndex], target, true);
  if (counter) counter.textContent = `${activeSlideIndex + 1} / ${travelSlides.length}`;
}

// Slide Management
function addSlide() {
  const newSlide = {
    kicker: 'SPECIAL EXCURSION',
    title: 'Custom Destination Experience',
    subtitle: 'Detailed description of this unique travel experience.',
    cards: [
      { title: 'Morning Highlight', desc: 'Bespoke morning excursion with private guide.' },
      { title: 'Afternoon Immersion', desc: 'Gastronomy or wellness activity.' },
      { title: 'Evening Ambience', desc: 'Private dinner setting with scenic views.' }
    ]
  };
  travelSlides.splice(activeSlideIndex + 1, 0, newSlide);
  selectSlide(activeSlideIndex + 1);
}

function duplicateSlide() {
  if (!travelSlides[activeSlideIndex]) return;
  const clone = JSON.parse(JSON.stringify(travelSlides[activeSlideIndex]));
  clone.title += ' (Copy)';
  travelSlides.splice(activeSlideIndex + 1, 0, clone);
  selectSlide(activeSlideIndex + 1);
}

function deleteSlide() {
  if (travelSlides.length <= 1) {
    alert('Proposal deck must contain at least 1 slide.');
    return;
  }
  travelSlides.splice(activeSlideIndex, 1);
  if (activeSlideIndex >= travelSlides.length) {
    activeSlideIndex = travelSlides.length - 1;
  }
  selectSlide(activeSlideIndex);
}

function moveSlideUp() {
  if (activeSlideIndex <= 0) return;
  const temp = travelSlides[activeSlideIndex];
  travelSlides[activeSlideIndex] = travelSlides[activeSlideIndex - 1];
  travelSlides[activeSlideIndex - 1] = temp;
  selectSlide(activeSlideIndex - 1);
}

function moveSlideDown() {
  if (activeSlideIndex >= travelSlides.length - 1) return;
  const temp = travelSlides[activeSlideIndex];
  travelSlides[activeSlideIndex] = travelSlides[activeSlideIndex + 1];
  travelSlides[activeSlideIndex + 1] = temp;
  selectSlide(activeSlideIndex + 1);
}

// Exports
function exportStandaloneHtml() {
  const proposalTitle = travelSlides[0]?.title || 'Luxury Travel Proposal';
  const slidesJson = JSON.stringify(travelSlides);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(proposalTitle)} - Travel Proposal</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #060911; color: #f8fafc; font-family: -apple-system, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; }
    .viewport { width: 95vw; max-width: 1300px; aspect-ratio: 16/9; background: radial-gradient(circle at 85% 15%, rgba(14,165,233,0.18), transparent 50%), radial-gradient(circle at 15% 85%, rgba(99,102,241,0.12), transparent 50%), #07111e; border-radius: 16px; border: 1px solid rgba(255,255,255,0.12); padding: 3.5rem; display: flex; flex-direction: column; justify-content: space-between; }
    .badge { font-size: 0.75rem; text-transform: uppercase; color: #38bdf8; font-weight: 700; margin-bottom: 0.5rem; }
    h1 { font-size: 2.3rem; margin-bottom: 0.4rem; }
    .sub { font-size: 1.1rem; color: #94a3b8; margin-bottom: 1.5rem; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem; }
    .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1.25rem; }
    .card h3 { font-size: 1.05rem; margin-bottom: 0.4rem; color: #fff; }
    .card p { font-size: 0.85rem; color: #94a3b8; line-height: 1.45; }
    .nav { position: fixed; bottom: 1.5rem; display: flex; gap: 1rem; align-items: center; background: rgba(15,23,42,0.9); padding: 0.5rem 1.25rem; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.15); }
    button { background: transparent; border: none; color: #fff; font-weight: 700; cursor: pointer; padding: 0.3rem 0.6rem; }
  </style>
</head>
<body>
  <div class="viewport" id="root"></div>
  <div class="nav">
    <button id="p">&larr; Prev</button>
    <span id="c" style="color: #38bdf8; font-weight: 700;"></span>
    <button id="n">Next &rarr;</button>
  </div>
  <script>
    const slides = ${slidesJson};
    let cur = 0;
    function render() {
      const s = slides[cur];
      let b = '<div class="grid">' + (s.cards||[]).map(c => '<div class="card"><h3>' + c.title + '</h3><p>' + c.desc + '</p></div>').join('') + '</div>';
      document.getElementById('root').innerHTML = '<div><div class="badge">' + (s.kicker||'') + '</div><h1>' + (s.title||'') + '</h1><p class="sub">' + (s.subtitle||'') + '</p>' + b + '</div><div style="display:flex;justify-content:space-between;border-top:1px solid rgba(255,255,255,0.1);padding-top:0.75rem;font-size:0.8rem;color:#64748b;"><span>Luxury Travel Proposal</span><span>Slide ' + (cur+1) + ' of ' + slides.length + '</span></div>';
      document.getElementById('c').textContent = (cur+1) + ' / ' + slides.length;
    }
    document.getElementById('p').onclick = () => { if (cur > 0) { cur--; render(); } };
    document.getElementById('n').onclick = () => { if (cur < slides.length - 1) { cur++; render(); } };
    window.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === ' ') { if (cur < slides.length - 1) { cur++; render(); } }
      if (e.key === 'ArrowLeft') { if (cur > 0) { cur--; render(); } }
    });
    render();
  </script>
</body>
</html>`;

  downloadBlob(html, `${proposalTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_proposal.html`, 'text/html');
}

function exportDeckJson() {
  const jsonStr = JSON.stringify(travelSlides, null, 2);
  downloadBlob(jsonStr, `travel_proposal_deck.json`, 'application/json');
}

function importDeckJson(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data) && data.length > 0) {
        travelSlides = data;
        activeSlideIndex = 0;
        renderThumbnails();
        selectSlide(0);
      } else {
        alert('Invalid JSON: Must be an array of slide objects.');
      }
    } catch (err) {
      alert('Failed to parse JSON.');
    }
  };
  reader.readAsText(file);
}

function printTravelPdf() {
  const printTarget = document.getElementById('travel-print-target');
  if (!printTarget) return;

  printTarget.innerHTML = '';
  travelSlides.forEach((slide, idx) => {
    const page = document.createElement('div');
    page.className = 'print-travel-slide';
    renderTravelSlide(slide, page, false);
    printTarget.appendChild(page);
  });

  window.print();
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Initialization & Event Binding
document.addEventListener('DOMContentLoaded', () => {
  const promptInput = document.getElementById('inp-travel-prompt');
  const guestSelect = document.getElementById('select-guest-count');
  const countSelect = document.getElementById('select-slide-count');

  // Load Initial Preset
  const initPreset = TRAVEL_PRESETS['amalfi-coast'];
  travelSlides = JSON.parse(JSON.stringify(initPreset.slides));

  renderThumbnails();
  selectSlide(0);

  // Generate Button
  document.getElementById('btn-generate-travel-deck')?.addEventListener('click', () => {
    const p = promptInput ? promptInput.value.trim() : 'Luxury Travel Proposal';
    const g = guestSelect ? guestSelect.value : '12 Guests';
    const c = countSelect ? parseInt(countSelect.value, 10) : 8;
    travelSlides = generateTravelProposal(p, g, c);
    activeSlideIndex = 0;
    renderThumbnails();
    selectSlide(0);
  });

  // Presets
  const presetPills = document.querySelectorAll('.dest-pill');
  presetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const key = pill.getAttribute('data-preset');
      const preset = TRAVEL_PRESETS[key];
      if (preset) {
        if (promptInput) promptInput.value = preset.title;
        if (guestSelect) guestSelect.value = preset.guests;
        const guestTag = document.getElementById('badge-guest-tag');
        if (guestTag) guestTag.textContent = preset.guests;

        travelSlides = JSON.parse(JSON.stringify(preset.slides));
        activeSlideIndex = 0;
        renderThumbnails();
        selectSlide(0);
      }
    });
  });

  // Guest select badge sync
  if (guestSelect) {
    guestSelect.addEventListener('change', () => {
      const guestTag = document.getElementById('badge-guest-tag');
      if (guestTag) guestTag.textContent = guestSelect.value.split(' ')[0] + ' Guests';
    });
  }

  // Editor Inputs
  ['inp-edit-title', 'inp-edit-kicker', 'inp-edit-sub', 'inp-edit-content'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', syncEditorToSlide);
  });

  // Reordering & Management
  document.getElementById('btn-add-slide')?.addEventListener('click', addSlide);
  document.getElementById('btn-slide-up')?.addEventListener('click', moveSlideUp);
  document.getElementById('btn-slide-down')?.addEventListener('click', moveSlideDown);
  document.getElementById('btn-slide-duplicate')?.addEventListener('click', duplicateSlide);
  document.getElementById('btn-slide-delete')?.addEventListener('click', deleteSlide);

  // Fullscreen Presenter
  document.getElementById('btn-present-fullscreen')?.addEventListener('click', openFullscreen);
  document.getElementById('fs-btn-exit')?.addEventListener('click', closeFullscreen);
  document.getElementById('fs-btn-next')?.addEventListener('click', () => {
    if (activeSlideIndex < travelSlides.length - 1) selectSlide(activeSlideIndex + 1);
  });
  document.getElementById('fs-btn-prev')?.addEventListener('click', () => {
    if (activeSlideIndex > 0) selectSlide(activeSlideIndex - 1);
  });

  // Keybindings
  window.addEventListener('keydown', e => {
    if (e.key === 'F5') {
      e.preventDefault();
      openFullscreen();
    } else if (e.key === 'Escape' && isPresenting) {
      closeFullscreen();
    } else if (e.key === 'ArrowRight' || e.key === ' ') {
      if (isPresenting && activeSlideIndex < travelSlides.length - 1) {
        e.preventDefault();
        selectSlide(activeSlideIndex + 1);
      }
    } else if (e.key === 'ArrowLeft') {
      if (isPresenting && activeSlideIndex > 0) {
        e.preventDefault();
        selectSlide(activeSlideIndex - 1);
      }
    }
  });

  // Exports
  document.getElementById('btn-export-html')?.addEventListener('click', exportStandaloneHtml);
  document.getElementById('btn-export-json')?.addEventListener('click', exportDeckJson);
  document.getElementById('btn-export-pdf')?.addEventListener('click', printTravelPdf);

  const importInput = document.getElementById('input-import-json');
  if (importInput) {
    importInput.addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) {
        importDeckJson(e.target.files[0]);
      }
    });
  }
});