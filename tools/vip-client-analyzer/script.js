// VIP Client Analyzer Logic
// Handles RFM scoring, VIP tier classification, CLV estimation, and tailored action plans

const INITIAL_ROSTER = [
  {
    id: 'VIP-LON-8801',
    name: 'Lord Harrison Sterling',
    advisor: 'Camilla Laurent',
    recency: 14,
    frequency: 9,
    monetary: 145000,
    horizon: 5,
    margin: 70,
    notes: 'Avid horology collector, prefers Dom Pérignon Rosé, bespoke cufflinks collector. Frequent visitor to Mayfair salon.'
  },
  {
    id: 'VIP-PAR-9042',
    name: 'Contessa Elena Rostova',
    advisor: 'Jean-Luc Moreau',
    recency: 22,
    frequency: 12,
    monetary: 220000,
    horizon: 6,
    margin: 72,
    notes: 'Haute couture patron, attends Paris Fashion Week private ateliers. Prefers rare Colombian emeralds.'
  },
  {
    id: 'VIP-NYC-4418',
    name: 'Marcus Vance',
    advisor: 'Camilla Laurent',
    recency: 48,
    frequency: 6,
    monetary: 62000,
    horizon: 5,
    margin: 68,
    notes: 'Architectural leather goods enthusiast, frequently orders bespoke travel luggage for private aviation.'
  },
  {
    id: 'VIP-HKG-3129',
    name: 'Sophia Chen',
    advisor: 'Diana Wong',
    recency: 35,
    frequency: 4,
    monetary: 26500,
    horizon: 4,
    margin: 65,
    notes: 'Fine jewelry collector, enjoys private champagne trunk shows and custom engraving services.'
  },
  {
    id: 'VIP-DXB-7751',
    name: 'Julian Devereux',
    advisor: 'Tariq Al-Mansoor',
    recency: 185,
    frequency: 2,
    monetary: 9200,
    horizon: 3,
    margin: 65,
    notes: 'Purchased anniversary timepiece 6 months ago. Has not engaged with recent seasonal lookbook dispatch.'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  // State
  let roster = [];
  try {
    const saved = localStorage.getItem('vip_client_roster');
    roster = saved ? JSON.parse(saved) : [...INITIAL_ROSTER];
  } catch (e) {
    roster = [...INITIAL_ROSTER];
  }

  let selectedClientId = roster[0]?.id || 'VIP-LON-8801';

  // Form Elements
  const form = document.getElementById('vip-form');
  const clientNameInput = document.getElementById('client-name');
  const clientIdInput = document.getElementById('client-id');
  const clientAdvisorInput = document.getElementById('client-advisor');
  const clientRecencyInput = document.getElementById('client-recency');
  const clientFrequencyInput = document.getElementById('client-frequency');
  const clientMonetaryInput = document.getElementById('client-monetary');
  const clvHorizonSlider = document.getElementById('clv-horizon');
  const clvHorizonVal = document.getElementById('clv-horizon-val');
  const clvMarginSlider = document.getElementById('clv-margin');
  const clvMarginVal = document.getElementById('clv-margin-val');
  const clientNotesInput = document.getElementById('client-notes');

  const recencyDisplayVal = document.getElementById('recency-display-val');
  const frequencyDisplayVal = document.getElementById('frequency-display-val');
  const monetaryDisplayVal = document.getElementById('monetary-display-val');

  // Hero Display Elements
  const tierBadge = document.getElementById('tier-badge');
  const churnRiskBadge = document.getElementById('churn-risk-badge');
  const clientHeroName = document.getElementById('client-hero-name');
  const clientHeroId = document.getElementById('client-hero-id');
  const clientHeroAdvisor = document.getElementById('client-hero-advisor');

  // Score Output Elements
  const scoreREl = document.getElementById('score-r');
  const scoreFEl = document.getElementById('score-f');
  const scoreMEl = document.getElementById('score-m');
  const fillREl = document.getElementById('fill-r');
  const fillFEl = document.getElementById('fill-f');
  const fillMEl = document.getElementById('fill-m');
  const descREl = document.getElementById('desc-r');
  const descFEl = document.getElementById('desc-f');
  const descMEl = document.getElementById('desc-m');

  const compositeRfmEl = document.getElementById('composite-rfm');
  const statAovEl = document.getElementById('stat-aov');
  const statClvEl = document.getElementById('stat-clv');
  const statClvProfitEl = document.getElementById('stat-clv-profit');

  // Action Plan Elements
  const planTouchpointEl = document.getElementById('plan-touchpoint');
  const planGiftingEl = document.getElementById('plan-gifting');
  const planPrivilegesEl = document.getElementById('plan-privileges');
  const planChurnEl = document.getElementById('plan-churn');

  // Roster Elements
  const rosterTbody = document.getElementById('roster-tbody');
  const rosterSearch = document.getElementById('roster-search');
  const rosterFilterTier = document.getElementById('roster-filter-tier');

  // Buttons
  const btnReset = document.getElementById('btn-reset-client');
  const btnCopyDossier = document.getElementById('btn-copy-dossier');
  const btnPrintVip = document.getElementById('btn-print-vip');

  // Format Money
  function formatMoney(amount) {
    return `$${Math.round(amount || 0).toLocaleString('en-US')}`;
  }

  // Save Roster
  function saveRoster() {
    try {
      localStorage.setItem('vip_client_roster', JSON.stringify(roster));
    } catch (e) {
      console.warn('Could not save roster to localStorage', e);
    }
  }

  // RFM Analysis Math Engine
  function calculateRFM(recency, frequency, monetary) {
    // 1. Recency Score (1-5)
    let rScore = 1;
    let rDesc = `Inactive (${recency}d ago)`;
    if (recency <= 30) {
      rScore = 5;
      rDesc = `Highly Active (${recency}d ago)`;
    } else if (recency <= 60) {
      rScore = 4;
      rDesc = `Active (${recency}d ago)`;
    } else if (recency <= 120) {
      rScore = 3;
      rDesc = `Moderate (${recency}d ago)`;
    } else if (recency <= 240) {
      rScore = 2;
      rDesc = `Lagging (${recency}d ago)`;
    }

    // 2. Frequency Score (1-5)
    let fScore = 1;
    let fDesc = `${frequency} order/yr`;
    if (frequency >= 8) {
      fScore = 5;
      fDesc = `High Frequency (${frequency}/yr)`;
    } else if (frequency >= 5) {
      fScore = 4;
      fDesc = `Frequent Patron (${frequency}/yr)`;
    } else if (frequency >= 3) {
      fScore = 3;
      fDesc = `Regular Patron (${frequency}/yr)`;
    } else if (frequency >= 2) {
      fScore = 2;
      fDesc = `Occasional (${frequency}/yr)`;
    }

    // 3. Monetary Score (1-5)
    let mScore = 1;
    let mDesc = `< $7.5k/yr`;
    if (monetary >= 100000) {
      mScore = 5;
      mDesc = `Elite ($100k+)`;
    } else if (monetary >= 50000) {
      mScore = 4;
      mDesc = `Ultra VIP ($50k+)`;
    } else if (monetary >= 20000) {
      mScore = 3;
      mDesc = `Core VIP ($20k+)`;
    } else if (monetary >= 7500) {
      mScore = 2;
      mDesc = `Emerging ($7.5k+)`;
    }

    const compositeScore = `${rScore}-${fScore}-${mScore}`;
    const totalPoints = rScore + fScore + mScore; // out of 15
    const normalizedPercent = Math.round((totalPoints / 15) * 100);

    // Tier Classification
    let tier = 'Silver';
    let tierClass = 'tier-badge-silver';

    if (monetary >= 80000 || (normalizedPercent >= 80 && monetary >= 50000) || (rScore >= 4 && fScore >= 4 && mScore === 5)) {
      tier = 'Diamond';
      tierClass = 'tier-badge-diamond';
    } else if (monetary >= 35000 || (normalizedPercent >= 70 && monetary >= 25000)) {
      tier = 'Platinum';
      tierClass = 'tier-badge-platinum';
    } else if (monetary >= 15000 || (normalizedPercent >= 50 && monetary >= 10000)) {
      tier = 'Gold';
      tierClass = 'tier-badge-gold';
    }

    // Churn Risk
    const expectedInterval = Math.round(365 / Math.max(1, frequency));
    let churnRisk = 'Low';
    let churnRiskClass = 'risk-low';
    let churnRiskText = '● Active Engagement';

    if (recency > expectedInterval * 2.2 || recency > 150) {
      churnRisk = 'High';
      churnRiskClass = 'risk-high';
      churnRiskText = '⚠️ High Churn Risk';
    } else if (recency > expectedInterval * 1.3 || recency > 75) {
      churnRisk = 'Moderate';
      churnRiskClass = 'risk-med';
      churnRiskText = '⚡ Attention Needed';
    }

    return {
      rScore, rDesc,
      fScore, fDesc,
      mScore, mDesc,
      compositeScore,
      totalPoints,
      normalizedPercent,
      tier,
      tierClass,
      churnRisk,
      churnRiskClass,
      churnRiskText,
      expectedInterval
    };
  }

  // Update UI Analytics based on Current Form Values
  function updateAnalytics() {
    const name = clientNameInput.value.trim() || 'Anonymous Client';
    const id = clientIdInput.value.trim() || 'VIP-UNK-0000';
    const advisor = clientAdvisorInput.value.trim() || 'Private Client Concierge';
    const recency = Math.max(0, parseInt(clientRecencyInput.value, 10) || 0);
    const frequency = Math.max(1, parseInt(clientFrequencyInput.value, 10) || 1);
    const monetary = Math.max(0, parseFloat(clientMonetaryInput.value) || 0);
    const horizon = parseInt(clvHorizonSlider.value, 10) || 5;
    const margin = parseInt(clvMarginSlider.value, 10) || 70;

    // Sliders Label Updates
    clvHorizonVal.textContent = `${horizon} Year${horizon > 1 ? 's' : ''}`;
    clvMarginVal.textContent = `${margin}%`;
    recencyDisplayVal.textContent = `${recency} days`;
    frequencyDisplayVal.textContent = `${frequency} order${frequency > 1 ? 's' : ''}`;
    monetaryDisplayVal.textContent = formatMoney(monetary);

    // Compute RFM
    const rfm = calculateRFM(recency, frequency, monetary);

    // Update Hero
    clientHeroName.textContent = name;
    clientHeroId.textContent = id;
    clientHeroAdvisor.textContent = advisor;

    tierBadge.textContent = `${rfm.tier.toUpperCase()} VIP`;
    tierBadge.className = `badge ${rfm.tierClass}`;

    churnRiskBadge.textContent = rfm.churnRiskText;
    churnRiskBadge.className = `churn-risk-badge ${rfm.churnRiskClass}`;

    // Update RFM Meters
    scoreREl.textContent = `${rfm.rScore} / 5`;
    fillREl.style.width = `${(rfm.rScore / 5) * 100}%`;
    descREl.textContent = rfm.rDesc;

    scoreFEl.textContent = `${rfm.fScore} / 5`;
    fillFEl.style.width = `${(rfm.fScore / 5) * 100}%`;
    descFEl.textContent = rfm.fDesc;

    scoreMEl.textContent = `${rfm.mScore} / 5`;
    fillMEl.style.width = `${(rfm.mScore / 5) * 100}%`;
    descMEl.textContent = rfm.mDesc;

    compositeRfmEl.textContent = `${rfm.compositeScore} (${rfm.normalizedPercent}%)`;

    // Compute CLV
    const aov = monetary / frequency;
    statAovEl.textContent = formatMoney(aov);

    // Retention factor based on RFM score
    const retentionRate = Math.min(0.96, 0.65 + (rfm.normalizedPercent / 100) * 0.3);
    const cumulativeClv = monetary * horizon * retentionRate;
    const clvProfit = cumulativeClv * (margin / 100);

    statClvEl.textContent = formatMoney(cumulativeClv);
    statClvProfitEl.textContent = formatMoney(clvProfit);

    // Action Plan Tailoring
    generateActionPlan(name, advisor, rfm, monetary, recency);

    return {
      name, id, advisor, recency, frequency, monetary, horizon, margin, rfm, aov, cumulativeClv, clvProfit
    };
  }

  // Generate Tailored VIP Retention Action Plan
  function generateActionPlan(name, advisor, rfm, monetary, recency) {
    if (rfm.tier === 'Diamond') {
      planTouchpointEl.textContent = `Direct private call from ${advisor} within 48 hours. Offer private in-suite appointment for the upcoming Haute Horlogerie or Joaillerie private reveal.`;
      planGiftingEl.textContent = `Grand Cru vintage Dom Pérignon or personalized hand-engraved crystal decanter accompanied by a private salon flower installation.`;
      planPrivilegesEl.textContent = `Top-priority allocation right (Piece #01-05) for all high-complication limited editions. Complimentary white-glove security delivery worldwide.`;
      if (rfm.churnRisk === 'High') {
        planChurnEl.textContent = `⚠️ Urgent Churn Alert: ${recency} days elapsed since last transaction. Dispatch senior executive personal invitation to Geneva / Paris atelier retreat.`;
      } else {
        planChurnEl.textContent = `Exceptional client loyalty. Host quarterly private dinner and reserve bespoke atelier commissions before public launch.`;
      }
    } else if (rfm.tier === 'Platinum') {
      planTouchpointEl.textContent = `Dedicated contact from ${advisor}. Present bespoke styling lookbook tailored to past category preferences.`;
      planGiftingEl.textContent = `Artisan hand-stitched leather cardholder or niche fragrance extrait encased with custom monogrammed sleeve.`;
      planPrivilegesEl.textContent = `48-hour advance early-access window for seasonal capsule collections. Invitation to annual regional collector cocktail.`;
      if (rfm.churnRisk === 'High') {
        planChurnEl.textContent = `⚠️ Cooling Engagement: ${recency} days inactive. Extend complimentary styling consultation and private chauffeur to nearest flagship.`;
      } else {
        planChurnEl.textContent = `Solid loyalty foundation. Nurture frequency by previewing complementary accessories to match prior purchases.`;
      }
    } else if (rfm.tier === 'Gold') {
      planTouchpointEl.textContent = `Personalized outreach via private client messaging. Inquire regarding past purchase satisfaction and share digital private lookbook.`;
      planGiftingEl.textContent = `Signature Maison scented candle or commemorative collector lookbook with handwritten note from atelier staff.`;
      planPrivilegesEl.textContent = `Priority salon booking during trunk show weekends. Complimentary bespoke gift-wrapping and seasonal lookbook dispatches.`;
      if (rfm.churnRisk === 'High') {
        planChurnEl.textContent = `⚠️ Re-engagement Opportunity: Send exclusive private preview invitation to rekindle interest before anniversary of last purchase.`;
      } else {
        planChurnEl.textContent = `Strong potential for promotion to Platinum. Encourage higher basket value with curated collection pairings.`;
      }
    } else {
      // Silver
      planTouchpointEl.textContent = `Welcome outreach welcoming client into the Maison circle. Send digital welcome portfolio and introduction to client advisor.`;
      planGiftingEl.textContent = `Artisan leather bookmark or seasonal scent discovery vial set with handwritten welcome card.`;
      planPrivilegesEl.textContent = `Standard invitation to digital lookbook unveilings and online private salon consultations.`;
      if (rfm.churnRisk === 'High') {
        planChurnEl.textContent = `⚠️ Dormant First-Time Buyer: ${recency} days lapsed. Offer complimentary personalized consultation or bespoke sizing service.`;
      } else {
        planChurnEl.textContent = `Rising potential. Cultivate second purchase through targeted recommendations in their category of interest.`;
      }
    }
  }

  // Load a client from roster into the form
  function loadClient(client) {
    selectedClientId = client.id;
    clientNameInput.value = client.name;
    clientIdInput.value = client.id;
    clientAdvisorInput.value = client.advisor;
    clientRecencyInput.value = client.recency;
    clientFrequencyInput.value = client.frequency;
    clientMonetaryInput.value = client.monetary;
    clvHorizonSlider.value = client.horizon || 5;
    clvMarginSlider.value = client.margin || 70;
    clientNotesInput.value = client.notes || '';

    updateAnalytics();
    renderRoster();
  }

  // Render Roster Table
  function renderRoster() {
    const searchTerm = rosterSearch.value.toLowerCase().trim();
    const tierFilter = rosterFilterTier.value;

    const filtered = roster.filter(c => {
      const rfm = calculateRFM(c.recency, c.frequency, c.monetary);
      const matchTier = tierFilter === 'ALL' || rfm.tier === tierFilter;
      const matchSearch = !searchTerm ||
        c.name.toLowerCase().includes(searchTerm) ||
        c.id.toLowerCase().includes(searchTerm) ||
        c.advisor.toLowerCase().includes(searchTerm);
      return matchTier && matchSearch;
    });

    rosterTbody.innerHTML = filtered.map(c => {
      const rfm = calculateRFM(c.recency, c.frequency, c.monetary);
      const isSelected = c.id === selectedClientId;
      const retentionRate = Math.min(0.96, 0.65 + (rfm.normalizedPercent / 100) * 0.3);
      const fiveYrClv = c.monetary * (c.horizon || 5) * retentionRate;

      return `
        <tr class="${isSelected ? 'selected' : ''}" data-id="${c.id}">
          <td>
            <strong>${c.name}</strong>
            <div style="font-size: 0.72rem; color: var(--text-tertiary); font-family: monospace;">${c.id}</div>
          </td>
          <td>
            <span class="badge ${rfm.tierClass}" style="font-size: 0.7rem; padding: 0.2rem 0.5rem;">
              ${rfm.tier}
            </span>
          </td>
          <td style="font-family: monospace; font-weight: 700;">${rfm.compositeScore}</td>
          <td>${c.recency}d</td>
          <td>${c.frequency} / yr</td>
          <td style="font-weight: 600; color: var(--accent); font-family: monospace;">${formatMoney(c.monetary)}</td>
          <td style="font-weight: 600; color: #10b981; font-family: monospace;">${formatMoney(fiveYrClv)}</td>
          <td>
            <button type="button" class="btn btn-secondary select-client-btn" data-id="${c.id}" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;">
              Analyze
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Table click listener
    rosterTbody.querySelectorAll('tr').forEach(row => {
      row.addEventListener('click', (e) => {
        const id = row.dataset.id;
        const client = roster.find(c => c.id === id);
        if (client) loadClient(client);
      });
    });
  }

  // Form submission (Save / Update Client)
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = clientNameInput.value.trim();
    const id = clientIdInput.value.trim() || 'VIP-' + Math.floor(1000 + Math.random() * 9000);
    const advisor = clientAdvisorInput.value.trim() || 'Private Client Concierge';
    const recency = parseInt(clientRecencyInput.value, 10) || 0;
    const frequency = parseInt(clientFrequencyInput.value, 10) || 1;
    const monetary = parseFloat(clientMonetaryInput.value) || 0;
    const horizon = parseInt(clvHorizonSlider.value, 10) || 5;
    const margin = parseInt(clvMarginSlider.value, 10) || 70;
    const notes = clientNotesInput.value.trim();

    const existingIndex = roster.findIndex(c => c.id === id);
    const clientData = { id, name, advisor, recency, frequency, monetary, horizon, margin, notes };

    if (existingIndex !== -1) {
      roster[existingIndex] = clientData;
    } else {
      roster.unshift(clientData);
    }

    selectedClientId = id;
    saveRoster();
    updateAnalytics();
    renderRoster();

    alert(`Client profile for "${name}" successfully saved to VIP Roster!`);
  });

  // Inputs real-time recalculation
  [clientRecencyInput, clientFrequencyInput, clientMonetaryInput, clvHorizonSlider, clvMarginSlider].forEach(input => {
    input.addEventListener('input', updateAnalytics);
  });

  [clientNameInput, clientIdInput, clientAdvisorInput].forEach(input => {
    input.addEventListener('input', () => {
      clientHeroName.textContent = clientNameInput.value || 'Anonymous Client';
      clientHeroId.textContent = clientIdInput.value || 'VIP-UNK-0000';
      clientHeroAdvisor.textContent = clientAdvisorInput.value || 'Private Client Concierge';
    });
  });

  // Roster Filter & Search
  rosterSearch.addEventListener('input', renderRoster);
  rosterFilterTier.addEventListener('change', renderRoster);

  // Reset Button
  btnReset.addEventListener('click', () => {
    if (roster.length > 0) {
      loadClient(roster[0]);
    }
  });

  // Copy VIP Dossier
  btnCopyDossier.addEventListener('click', () => {
    const data = updateAnalytics();
    const dossierText = `=== VIP CLIENT DOSSIER ===
Client: ${data.name} (ID: ${data.id})
Private Advisor: ${data.advisor}
Classification: ${data.rfm.tier.toUpperCase()} VIP
Status: ${data.rfm.churnRiskText.replace(/[^a-zA-Z ]/g, '').trim()}

RFM Performance Metrics:
- Recency Score: ${data.rfm.rScore}/5 (${data.recency} days since last order)
- Frequency Score: ${data.rfm.fScore}/5 (${data.frequency} orders / year)
- Monetary Score: ${data.rfm.mScore}/5 (${formatMoney(data.monetary)} annual spend)
- Composite RFM: ${data.rfm.compositeScore} (${data.rfm.normalizedPercent}% Tier Index)

Lifetime Value Valuation:
- Average Order Value: ${formatMoney(data.aov)}
- ${data.horizon}-Year Projected CLV: ${formatMoney(data.cumulativeClv)}
- Projected Lifetime Profit (${data.margin}% Margin): ${formatMoney(data.clvProfit)}

Prescribed Retention Roadmaps:
- Touchpoint: ${planTouchpointEl.textContent.trim()}
- Gifting: ${planGiftingEl.textContent.trim()}
- Atelier Access: ${planPrivilegesEl.textContent.trim()}
- Loyalty Strategy: ${planChurnEl.textContent.trim()}
==========================`;

    navigator.clipboard.writeText(dossierText).then(() => {
      const orig = btnCopyDossier.innerHTML;
      btnCopyDossier.innerHTML = '✓ Copied!';
      btnCopyDossier.style.borderColor = 'var(--success)';
      btnCopyDossier.style.color = 'var(--success)';
      setTimeout(() => {
        btnCopyDossier.innerHTML = orig;
        btnCopyDossier.style.borderColor = '';
        btnCopyDossier.style.color = '';
      }, 2000);
    });
  });

  // Print VIP Brief
  btnPrintVip.addEventListener('click', () => {
    window.print();
  });

  // Initial Load
  const firstClient = roster.find(c => c.id === selectedClientId) || roster[0];
  if (firstClient) {
    loadClient(firstClient);
  } else {
    updateAnalytics();
    renderRoster();
  }
});