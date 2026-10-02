// AI Customer Segmentation Logic
// Client-side behavioral clustering engine classifying luxury shoppers into distinct psychology personas

const PERSONA_DATA = {
  connoisseur: {
    id: 'connoisseur',
    name: 'The Connoisseur / Collector',
    badgeClass: 'badge-connoisseur',
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.25)',
    motto: '"Treasures rare historical provenance, grand complications, and confidential master artisan access over fleeting fashion trends."',
    conversationStarter: (name) => `"${name ? name + ', ' : ''}I recently had the privilege of previewing the archival schematics of our latest split-seconds chronograph, and your horological collection immediately came to mind. Our master watchmaker is visiting our salon next Tuesday for an intimate atelier tasting—would you care to inspect the prototype?"`,
    salonInvitation: 'Private Vault Complication Showcase: Confidential after-hours salon with white-glove loupe examination of archival historic timepieces, paired with vintage Krug Rosé or rare single-cask cognac in our secluded library suite.',
    gifting: 'Hand-stitched goat suede watch roll with numbered certificate, or a privately bound leather monograph on vintage horological calibers with personalized calligraphy.',
    cadence: 'Every 4–6 Weeks: Highly selective. Solely communicate when exceptional archival acquisitions or private master artisan viewings occur. Preferred channel: Encrypted WhatsApp/Signal or Private Client Director phone call.',
    doRule: 'DO: Speak fluent technical terminology (movement finishing, complication architecture, provenance history) and treat the client as an esteemed fellow scholar.',
    dontRule: 'DON\'T: Use generic marketing buzzwords, superficial hype phrases, or apply high-pressure scarcity tactics.'
  },
  trendsetter: {
    id: 'trendsetter',
    name: 'The Status Trendsetter',
    badgeClass: 'badge-trendsetter',
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.25)',
    motto: '"Commands social visibility, runway priority, and cultural prominence through limited-edition collaborations and iconic fashion moments."',
    conversationStarter: (name) => `"${name ? name + ', ' : ''}our Creative Director\'s runway capsule arrives in limited quantities next Friday—I have reserved a 36-hour private presale hold on Look 14 exclusively in your sizing before public release."`,
    salonInvitation: 'VIP Runway Champagne Preview & Styling Suite: High-energy private cocktail salon with personal runway models, bespoke photo-ready backdrop, and first-access fitting racks ahead of global launch.',
    gifting: 'Personalized limited-edition bag charm, custom-monogrammed silk twilly scarf, or VIP invitation to an international Fashion Week after-party.',
    cadence: 'Bi-Weekly: Fast-paced & timely. Instant alerts upon runway capsule announcements. Preferred channel: WhatsApp with high-resolution runway video previews and direct reservation links.',
    doRule: 'DO: Highlight scarcity, exclusivity, and social currency ("only 3 allocated to our territory; seen on the Milan runway").',
    dontRule: 'DON\'T: Present past-season archive items, overly conservative styles, or slow traditional communication cadences.'
  },
  quiet: {
    id: 'quiet',
    name: 'The Quiet Luxury Loyalist',
    badgeClass: 'badge-quiet',
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    motto: '"Embraces stealth wealth, tactile sensory perfection, unbranded vicuña and cashmere, and timeless understated tailoring."',
    conversationStarter: (name) => `"${name ? name + ', ' : ''}we have just received an exquisite shipment of double-faced pure vicuña outerwear tailored with horn buttons; the tactile hand-feel is simply unmatched. Would you like our master tailor to prepare a private fitting suite at your convenience?"`,
    salonInvitation: 'Bespoke In-Suite Trunk Fitting & Fabric Masterclass: Serene, private salon appointment with zero distractions, bespoke artisanal tea service, and personal master tailor fitting without sales pressure.',
    gifting: 'Travel blanket in raw un-dyed 14-micron cashmere, hand-poured cedar & amber beeswax candle, or handwritten note on bespoke heavy cotton deckle-edged stationery.',
    cadence: 'Seasonal / Quarterly: Calm & respectful. Aligned strictly with personal travel calendars and wardrobe transitions. Preferred channel: Thoughtful handwritten note or personal email from dedicated senior advisor.',
    doRule: 'DO: Focus entirely on fiber provenance (Grade-1 vicuña, baby cashmere), hand-stitching integrity, and understated elegance.',
    dontRule: 'DON\'T: Display loud monograms, overt branding, or push fast-fashion trends and flash sales.'
  },
  gifter: {
    id: 'gifter',
    name: 'The Aspirational Gifter',
    badgeClass: 'badge-gifter',
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.25)',
    motto: '"Celebrates life milestones, holiday seasons, and personal relationships through prestigious brand affirmation and white-glove packaging."',
    conversationStarter: (name) => `"${name ? name + ', ' : ''}with your anniversary approaching next month, I have curated a complimentary gifting selection of our most iconic pieces, complete with personalized hot-stamped initials and wax-sealed packaging."`,
    salonInvitation: 'Holiday Champagne Gifting Salon: White-glove personal gifting concierge session with bespoke calligraphy gift cards, ribbon selection, complimentary hot-stamping on-site, and festive canapés.',
    gifting: 'Mini luxury fragrance flacon discovery set, leather luggage tag with complimentary gold-leaf embossing, or a box of artisanal Parisian macarons in brand presentation box.',
    cadence: 'Calendar-Driven (3–4x yearly): Proactively synchronized 4 weeks prior to major holidays, anniversaries, and recorded milestones. Preferred channel: Curated digital gift catalog via WhatsApp or email.',
    doRule: 'DO: Emphasize flawless white-glove presentation, complimentary monogramming, gift wrapping, and guaranteed courier delivery.',
    dontRule: 'DON\'T: Overwhelm with complex technical watchmaker jargon or push ultra-expensive multi-million dollar museum rarities.'
  }
};

// Preset configurations
const PRESETS = {
  connoisseur: {
    name: 'Lord Harrison Sterling',
    spend: 'ultra',
    motivation: 'provenance',
    product: 'horology',
    trigger: 'atelier',
    logo: 'subtle-archive',
    channel: 'private-vault'
  },
  trendsetter: {
    name: 'Zara Chen',
    spend: 'high',
    motivation: 'prestige',
    product: 'runway',
    trigger: 'fashion-week',
    logo: 'bold-monogram',
    channel: 'vip-trunk'
  },
  quiet: {
    name: 'Henri de Montmirail',
    spend: 'high',
    motivation: 'understated',
    product: 'cashmere',
    trigger: 'wardrobe',
    logo: 'zero-logo',
    channel: 'in-suite-tailor'
  },
  gifter: {
    name: 'Victoria Sterling',
    spend: 'entry',
    motivation: 'gifting',
    product: 'leather-fragrance',
    trigger: 'holiday',
    logo: 'gift-packaging',
    channel: 'gifting-concierge'
  }
};

// 8 Sample Clients for the Batch Directory Tab
const BATCH_CLIENTS = [
  {
    name: 'Lord Harrison Sterling',
    location: 'London, Mayfair',
    spend: '$285,000 / yr',
    motivation: 'Provenance & Grand Complications',
    personaKey: 'connoisseur',
    preset: {
      name: 'Lord Harrison Sterling',
      spend: 'ultra',
      motivation: 'provenance',
      product: 'horology',
      trigger: 'atelier',
      logo: 'subtle-archive',
      channel: 'private-vault'
    }
  },
  {
    name: 'Zara Chen',
    location: 'Shanghai / Paris',
    spend: '$110,000 / yr',
    motivation: 'Runway Priority & Social Visibility',
    personaKey: 'trendsetter',
    preset: {
      name: 'Zara Chen',
      spend: 'high',
      motivation: 'prestige',
      product: 'runway',
      trigger: 'fashion-week',
      logo: 'bold-monogram',
      channel: 'vip-trunk'
    }
  },
  {
    name: 'Henri de Montmirail',
    location: 'Paris, 8th Arrondissement',
    spend: '$95,000 / yr',
    motivation: 'Tactile Vicuña & Zero Visible Logos',
    personaKey: 'quiet',
    preset: {
      name: 'Henri de Montmirail',
      spend: 'high',
      motivation: 'understated',
      product: 'cashmere',
      trigger: 'wardrobe',
      logo: 'zero-logo',
      channel: 'in-suite-tailor'
    }
  },
  {
    name: 'Victoria Sterling',
    location: 'New York, Upper East Side',
    spend: '$18,500 / yr',
    motivation: 'Anniversary Gifting & White-Glove Delight',
    personaKey: 'gifter',
    preset: {
      name: 'Victoria Sterling',
      spend: 'entry',
      motivation: 'gifting',
      product: 'leather-fragrance',
      trigger: 'holiday',
      logo: 'gift-packaging',
      channel: 'gifting-concierge'
    }
  },
  {
    name: 'Contessa Elena Rostova',
    location: 'Monaco / Milan',
    spend: '$340,000 / yr',
    motivation: 'Untreated Colombian Emeralds & Bespoke Atelier',
    personaKey: 'connoisseur',
    preset: {
      name: 'Contessa Elena Rostova',
      spend: 'ultra',
      motivation: 'provenance',
      product: 'horology',
      trigger: 'atelier',
      logo: 'subtle-archive',
      channel: 'private-vault'
    }
  },
  {
    name: 'Alessandro Moretti',
    location: 'Milan, Quadrilatero',
    spend: '$75,000 / yr',
    motivation: 'Milan Fashion Week Debuts & Statement It-Bags',
    personaKey: 'trendsetter',
    preset: {
      name: 'Alessandro Moretti',
      spend: 'high',
      motivation: 'prestige',
      product: 'runway',
      trigger: 'fashion-week',
      logo: 'bold-monogram',
      channel: 'vip-trunk'
    }
  },
  {
    name: 'Kenji Takahashi',
    location: 'Tokyo, Ginza',
    spend: '$72,000 / yr',
    motivation: 'Grade-1 Cashmere & Discreet Archival Tailoring',
    personaKey: 'quiet',
    preset: {
      name: 'Kenji Takahashi',
      spend: 'high',
      motivation: 'understated',
      product: 'cashmere',
      trigger: 'wardrobe',
      logo: 'zero-logo',
      channel: 'in-suite-tailor'
    }
  },
  {
    name: 'Jonathan Vance',
    location: 'London, Canary Wharf',
    spend: '$14,000 / yr',
    motivation: 'Corporate Milestone Tokens & Silk Accessories',
    personaKey: 'gifter',
    preset: {
      name: 'Jonathan Vance',
      spend: 'entry',
      motivation: 'gifting',
      product: 'leather-fragrance',
      trigger: 'holiday',
      logo: 'gift-packaging',
      channel: 'gifting-concierge'
    }
  }
];

// Multi-Attribute Scoring Weights
const ATTRIBUTE_WEIGHTS = {
  spend: {
    ultra: { connoisseur: 40, quiet: 25, trendsetter: 25, gifter: 5 },
    high: { quiet: 35, trendsetter: 35, connoisseur: 20, gifter: 10 },
    mid: { trendsetter: 30, quiet: 25, gifter: 30, connoisseur: 10 },
    entry: { gifter: 45, trendsetter: 20, quiet: 10, connoisseur: 5 }
  },
  motivation: {
    provenance: { connoisseur: 50, quiet: 20, trendsetter: 5, gifter: 5 },
    prestige: { trendsetter: 50, gifter: 20, connoisseur: 5, quiet: 5 },
    understated: { quiet: 50, connoisseur: 20, trendsetter: 5, gifter: 5 },
    gifting: { gifter: 50, trendsetter: 15, quiet: 10, connoisseur: 5 }
  },
  product: {
    horology: { connoisseur: 45, quiet: 15, trendsetter: 15, gifter: 5 },
    runway: { trendsetter: 45, gifter: 15, quiet: 5, connoisseur: 5 },
    cashmere: { quiet: 45, connoisseur: 15, trendsetter: 5, gifter: 5 },
    'leather-fragrance': { gifter: 45, trendsetter: 20, quiet: 15, connoisseur: 5 }
  },
  trigger: {
    atelier: { connoisseur: 40, quiet: 20, trendsetter: 10, gifter: 5 },
    'fashion-week': { trendsetter: 40, connoisseur: 10, gifter: 15, quiet: 5 },
    wardrobe: { quiet: 40, connoisseur: 15, trendsetter: 15, gifter: 5 },
    holiday: { gifter: 40, trendsetter: 15, quiet: 10, connoisseur: 5 }
  },
  logo: {
    'subtle-archive': { connoisseur: 30, quiet: 20, trendsetter: 5, gifter: 5 },
    'bold-monogram': { trendsetter: 35, gifter: 20, connoisseur: 5, quiet: 2 },
    'zero-logo': { quiet: 40, connoisseur: 15, trendsetter: 2, gifter: 5 },
    'gift-packaging': { gifter: 35, trendsetter: 15, quiet: 10, connoisseur: 5 }
  },
  channel: {
    'private-vault': { connoisseur: 30, quiet: 15, trendsetter: 10, gifter: 5 },
    'vip-trunk': { trendsetter: 35, gifter: 10, quiet: 5, connoisseur: 10 },
    'in-suite-tailor': { quiet: 35, connoisseur: 20, trendsetter: 5, gifter: 5 },
    'gifting-concierge': { gifter: 35, trendsetter: 10, quiet: 10, connoisseur: 5 }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Inputs
  const selectPreset = document.getElementById('select-preset');
  const inputClientName = document.getElementById('input-client-name');
  const selectSpend = document.getElementById('select-spend');
  const selectMotivation = document.getElementById('select-motivation');
  const selectProduct = document.getElementById('select-product');
  const selectTrigger = document.getElementById('select-trigger');
  const selectLogo = document.getElementById('select-logo');
  const selectChannel = document.getElementById('select-channel');

  // DOM Elements - Hero Outputs
  const heroGlow = document.getElementById('hero-glow');
  const heroPersonaBadge = document.getElementById('hero-persona-badge');
  const heroConfidenceBadge = document.getElementById('hero-confidence-badge');
  const heroPersonaTitle = document.getElementById('hero-persona-title');
  const heroPersonaMotto = document.getElementById('hero-persona-motto');

  // Breakdown Bars
  const scoreValConnoisseur = document.getElementById('score-val-connoisseur');
  const barConnoisseur = document.getElementById('bar-connoisseur');
  const scoreValTrendsetter = document.getElementById('score-val-trendsetter');
  const barTrendsetter = document.getElementById('bar-trendsetter');
  const scoreValQuiet = document.getElementById('score-val-quiet');
  const barQuiet = document.getElementById('bar-quiet');
  const scoreValGifter = document.getElementById('score-val-gifter');
  const barGifter = document.getElementById('bar-gifter');

  // Playbook Outputs
  const playbookConversationStarter = document.getElementById('playbook-conversation-starter');
  const playbookSalonInvitation = document.getElementById('playbook-salon-invitation');
  const playbookGifting = document.getElementById('playbook-gifting');
  const playbookCadence = document.getElementById('playbook-cadence');
  const playbookDos = document.getElementById('playbook-dos');
  const playbookDonts = document.getElementById('playbook-donts');

  // Action Buttons
  const btnPrintPlaybook = document.getElementById('btn-print-playbook');
  const btnCopyPlaybook = document.getElementById('btn-copy-playbook');

  // Navigation Tabs
  const tabButtons = document.querySelectorAll('.view-tab-btn');
  const tabPanes = {
    profiler: document.getElementById('tab-profiler-content'),
    matrix: document.getElementById('tab-matrix-content'),
    batch: document.getElementById('tab-batch-content')
  };

  // Batch Table
  const batchTableBody = document.getElementById('batch-table-body');
  const filterBatchPersona = document.getElementById('filter-batch-persona');

  // Function: Calculate persona distribution and assign
  function computeClustering(attributes) {
    const rawScores = {
      connoisseur: 0,
      trendsetter: 0,
      quiet: 0,
      gifter: 0
    };

    // Attribute 1: Spend
    const wSpend = ATTRIBUTE_WEIGHTS.spend[attributes.spend] || ATTRIBUTE_WEIGHTS.spend.high;
    rawScores.connoisseur += wSpend.connoisseur;
    rawScores.trendsetter += wSpend.trendsetter;
    rawScores.quiet += wSpend.quiet;
    rawScores.gifter += wSpend.gifter;

    // Attribute 2: Motivation
    const wMot = ATTRIBUTE_WEIGHTS.motivation[attributes.motivation] || ATTRIBUTE_WEIGHTS.motivation.provenance;
    rawScores.connoisseur += wMot.connoisseur;
    rawScores.trendsetter += wMot.trendsetter;
    rawScores.quiet += wMot.quiet;
    rawScores.gifter += wMot.gifter;

    // Attribute 3: Product
    const wProd = ATTRIBUTE_WEIGHTS.product[attributes.product] || ATTRIBUTE_WEIGHTS.product.horology;
    rawScores.connoisseur += wProd.connoisseur;
    rawScores.trendsetter += wProd.trendsetter;
    rawScores.quiet += wProd.quiet;
    rawScores.gifter += wProd.gifter;

    // Attribute 4: Trigger
    const wTrig = ATTRIBUTE_WEIGHTS.trigger[attributes.trigger] || ATTRIBUTE_WEIGHTS.trigger.atelier;
    rawScores.connoisseur += wTrig.connoisseur;
    rawScores.trendsetter += wTrig.trendsetter;
    rawScores.quiet += wTrig.quiet;
    rawScores.gifter += wTrig.gifter;

    // Attribute 5: Logo
    const wLogo = ATTRIBUTE_WEIGHTS.logo[attributes.logo] || ATTRIBUTE_WEIGHTS.logo['subtle-archive'];
    rawScores.connoisseur += wLogo.connoisseur;
    rawScores.trendsetter += wLogo.trendsetter;
    rawScores.quiet += wLogo.quiet;
    rawScores.gifter += wLogo.gifter;

    // Attribute 6: Channel
    const wChan = ATTRIBUTE_WEIGHTS.channel[attributes.channel] || ATTRIBUTE_WEIGHTS.channel['private-vault'];
    rawScores.connoisseur += wChan.connoisseur;
    rawScores.trendsetter += wChan.trendsetter;
    rawScores.quiet += wChan.quiet;
    rawScores.gifter += wChan.gifter;

    // Normalize to percentages
    const totalRaw = rawScores.connoisseur + rawScores.trendsetter + rawScores.quiet + rawScores.gifter;
    const percentages = {
      connoisseur: Math.round((rawScores.connoisseur / totalRaw) * 100),
      trendsetter: Math.round((rawScores.trendsetter / totalRaw) * 100),
      quiet: Math.round((rawScores.quiet / totalRaw) * 100),
      gifter: Math.round((rawScores.gifter / totalRaw) * 100)
    };

    // Ensure sum equals 100%
    const currentSum = percentages.connoisseur + percentages.trendsetter + percentages.quiet + percentages.gifter;
    if (currentSum !== 100) {
      percentages.connoisseur += (100 - currentSum);
    }

    // Identify dominant persona
    let maxKey = 'connoisseur';
    let maxVal = -1;
    for (const key of ['connoisseur', 'trendsetter', 'quiet', 'gifter']) {
      if (percentages[key] > maxVal) {
        maxVal = percentages[key];
        maxKey = key;
      }
    }

    return {
      dominantPersonaKey: maxKey,
      confidence: maxVal,
      percentages
    };
  }

  // Update UI with clustering results
  function updateClusteringUI() {
    const attributes = {
      spend: selectSpend.value,
      motivation: selectMotivation.value,
      product: selectProduct.value,
      trigger: selectTrigger.value,
      logo: selectLogo.value,
      channel: selectChannel.value
    };

    const clientName = inputClientName.value.trim();
    const result = computeClustering(attributes);
    const persona = PERSONA_DATA[result.dominantPersonaKey];

    // Update Hero Panel
    heroPersonaBadge.className = `persona-badge ${persona.badgeClass}`;
    heroPersonaBadge.textContent = persona.name;
    heroConfidenceBadge.textContent = `${result.confidence}% Match`;
    heroPersonaTitle.textContent = persona.name;
    heroPersonaMotto.textContent = persona.motto;
    heroGlow.style.background = persona.glowColor;

    // Update Breakdown Bars
    scoreValConnoisseur.textContent = `${result.percentages.connoisseur}%`;
    barConnoisseur.style.width = `${result.percentages.connoisseur}%`;

    scoreValTrendsetter.textContent = `${result.percentages.trendsetter}%`;
    barTrendsetter.style.width = `${result.percentages.trendsetter}%`;

    scoreValQuiet.textContent = `${result.percentages.quiet}%`;
    barQuiet.style.width = `${result.percentages.quiet}%`;

    scoreValGifter.textContent = `${result.percentages.gifter}%`;
    barGifter.style.width = `${result.percentages.gifter}%`;

    // Update Playbook
    playbookConversationStarter.textContent = persona.conversationStarter(clientName);
    playbookSalonInvitation.innerHTML = `<strong>${persona.salonInvitation.split(':')[0]}:</strong> ${persona.salonInvitation.split(':').slice(1).join(':')}`;
    playbookGifting.textContent = persona.gifting;
    playbookCadence.innerHTML = `<strong>${persona.cadence.split(':')[0]}:</strong> ${persona.cadence.split(':').slice(1).join(':')}`;
    playbookDos.innerHTML = `<strong>DO:</strong> ${persona.doRule.replace(/^DO:\s*/, '')}`;
    playbookDonts.innerHTML = `<strong>DON'T:</strong> ${persona.dontRule.replace(/^DON'T:\s*/, '')}`;
  }

  // Apply a preset
  function applyPreset(presetKey) {
    const p = PRESETS[presetKey];
    if (!p) return;

    inputClientName.value = p.name;
    selectSpend.value = p.spend;
    selectMotivation.value = p.motivation;
    selectProduct.value = p.product;
    selectTrigger.value = p.trigger;
    selectLogo.value = p.logo;
    selectChannel.value = p.channel;

    selectPreset.value = presetKey;
    updateClusteringUI();
  }

  // Event Listeners for form inputs
  [selectSpend, selectMotivation, selectProduct, selectTrigger, selectLogo, selectChannel].forEach(el => {
    el.addEventListener('change', () => {
      selectPreset.value = 'custom';
      updateClusteringUI();
    });
  });

  inputClientName.addEventListener('input', () => {
    updateClusteringUI();
  });

  selectPreset.addEventListener('change', () => {
    const val = selectPreset.value;
    if (val !== 'custom') {
      applyPreset(val);
    }
  });

  // Tab switching
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      Object.keys(tabPanes).forEach(tabKey => {
        if (tabKey === targetTab) {
          tabPanes[tabKey].style.display = 'block';
        } else {
          tabPanes[tabKey].style.display = 'none';
        }
      });
    });
  });

  // Buttons in Tab 2 (Matrix) to load preset into profiler
  document.querySelectorAll('[data-load-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.getAttribute('data-load-preset');
      applyPreset(preset);

      // Switch to Profiler tab
      tabButtons[0].click();
    });
  });

  // Populate Tab 3 (Batch Table)
  function renderBatchTable() {
    const filter = filterBatchPersona.value;
    batchTableBody.innerHTML = '';

    const filtered = BATCH_CLIENTS.filter(item => {
      const persona = PERSONA_DATA[item.personaKey];
      if (filter === 'All') return true;
      return persona.name === filter;
    });

    filtered.forEach(client => {
      const persona = PERSONA_DATA[client.personaKey];
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="font-weight: 700; color: var(--text-primary);">${escapeHtml(client.name)}</div>
          <div style="font-size: 0.75rem; color: var(--text-tertiary);">${escapeHtml(client.location)}</div>
        </td>
        <td>
          <span class="persona-badge ${persona.badgeClass}">${persona.name}</span>
        </td>
        <td>
          <div style="font-family: monospace; font-weight: 700; color: ${persona.color};">
            ${Math.floor(88 + Math.random() * 8)}% Affinity
          </div>
        </td>
        <td>
          <div style="font-family: monospace; font-weight: 600;">${client.spend}</div>
        </td>
        <td>
          <div style="font-size: 0.82rem; color: var(--text-secondary);">${escapeHtml(client.motivation)}</div>
        </td>
        <td>
          <button class="btn btn-outline" style="font-size: 0.78rem; padding: 0.3rem 0.65rem;" data-batch-client="${client.name}">
            Load Profiler &rarr;
          </button>
        </td>
      `;
      batchTableBody.appendChild(tr);
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Delegation on batch table
  batchTableBody.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-batch-client]');
    if (!btn) return;

    const clientName = btn.getAttribute('data-batch-client');
    const client = BATCH_CLIENTS.find(c => c.name === clientName);
    if (!client) return;

    const p = client.preset;
    inputClientName.value = p.name;
    selectSpend.value = p.spend;
    selectMotivation.value = p.motivation;
    selectProduct.value = p.product;
    selectTrigger.value = p.trigger;
    selectLogo.value = p.logo;
    selectChannel.value = p.channel;
    selectPreset.value = 'custom';

    updateClusteringUI();
    tabButtons[0].click(); // Switch to profiler tab
  });

  filterBatchPersona.addEventListener('change', renderBatchTable);

  // Copy Advisor Talking Points to Clipboard
  btnCopyPlaybook.addEventListener('click', async () => {
    const clientName = inputClientName.value.trim() || 'Valued Client';
    const personaTitle = heroPersonaTitle.textContent;
    const starter = playbookConversationStarter.textContent;
    const salon = playbookSalonInvitation.textContent;
    const gifting = playbookGifting.textContent;
    const cadence = playbookCadence.textContent;
    const doRule = playbookDos.textContent;
    const dontRule = playbookDonts.textContent;

    const textToCopy = `=== PRIVATE CLIENT ADVISOR STRATEGY PLAYBOOK ===\n\n` +
      `Client: ${clientName}\n` +
      `Classified Luxury Persona: ${personaTitle}\n\n` +
      `[ CONVERSATION STARTER ]\n${starter}\n\n` +
      `[ PRIVATE SALON INVITATION ]\n${salon}\n\n` +
      `[ CURATED GIFTING RECOMMENDATION ]\n${gifting}\n\n` +
      `[ COMMUNICATION CADENCE & CHANNEL ]\n${cadence}\n\n` +
      `[ ADVISOR GOLDEN PROTOCOL ]\n${doRule}\n${dontRule}\n\n` +
      `Generated by ALL IN ONE AI Customer Segmentation Engine.`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      const originalText = btnCopyPlaybook.innerHTML;
      btnCopyPlaybook.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        Copied to Clipboard!
      `;
      btnCopyPlaybook.style.background = 'var(--success)';
      btnCopyPlaybook.style.borderColor = 'var(--success)';
      setTimeout(() => {
        btnCopyPlaybook.innerHTML = originalText;
        btnCopyPlaybook.style.background = '';
        btnCopyPlaybook.style.borderColor = '';
      }, 2500);
    } catch (err) {
      alert('Unable to automatically copy to clipboard. Please copy manually.');
    }
  });

  // Print Strategy Playbook
  btnPrintPlaybook.addEventListener('click', () => {
    // Make sure Profiler tab is active for printing
    tabButtons[0].click();
    setTimeout(() => {
      window.print();
    }, 150);
  });

  // Initial Run
  updateClusteringUI();
  renderBatchTable();
});