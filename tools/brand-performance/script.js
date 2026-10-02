/**
 * Brand Performance Diagnostic - Executive Suite
 * Client-side calculation engine, dynamic grade synthesis, and strategic directive generator.
 */

// Archetype Benchmarks
const ARCHETYPES = {
  horlogerie: {
    name: 'Haute Horlogerie & High Jewelry',
    bdi: 94,
    promoters: 84,
    detractors: 6,
    priceRatio: 4.8,
    secondary: 128,
    retention: 82
  },
  leather: {
    name: 'Heritage Leather Goods & Trunkmaker',
    bdi: 92,
    promoters: 86,
    detractors: 4,
    priceRatio: 4.2,
    secondary: 115,
    retention: 88
  },
  couture: {
    name: 'Contemporary Haute Couture & RTW',
    bdi: 76,
    promoters: 62,
    detractors: 10,
    priceRatio: 2.8,
    secondary: 74,
    retention: 64
  },
  perfume: {
    name: 'Artisanal Haute Parfumerie',
    bdi: 84,
    promoters: 78,
    detractors: 6,
    priceRatio: 3.4,
    secondary: 88,
    retention: 78
  },
  turnaround: {
    name: 'Vulnerable / Over-Distributed Turnaround',
    bdi: 52,
    promoters: 44,
    detractors: 22,
    priceRatio: 1.6,
    secondary: 58,
    retention: 46
  }
};

class BrandPerformanceDiagnostic {
  constructor() {
    this.currentPreset = 'horlogerie';
    
    // Core state
    this.bdi = 94;
    this.promoters = 84;
    this.detractors = 6;
    this.priceRatio = 4.8;
    this.secondary = 128;
    this.retention = 82;

    this.init();
  }

  init() {
    this.cacheDom();
    this.bindEvents();
    this.calculateAndRender();
  }

  cacheDom() {
    // Top actions
    this.btnCopyBrief = document.getElementById('btn-copy-brief');
    this.btnPrintDossier = document.getElementById('btn-print-dossier');
    this.archetypeButtons = document.querySelectorAll('#archetype-buttons .btn-archetype');

    // Hero Grade Card
    this.meterCircleBar = document.getElementById('meter-circle-bar');
    this.compositeGradeLetter = document.getElementById('composite-grade-letter');
    this.compositeScoreText = document.getElementById('composite-score-text');
    this.healthStatusBadge = document.getElementById('health-status-badge');
    this.healthStatusDesc = document.getElementById('health-status-desc');

    // Mini-Pillar Summaries
    this.valSummaryBdi = document.getElementById('val-summary-bdi');
    this.badgeDesirability = document.getElementById('badge-desirability');
    this.subBdiDesc = document.getElementById('sub-bdi-desc');
    this.trackBdi = document.getElementById('track-bdi');

    this.valSummaryNps = document.getElementById('val-summary-nps');
    this.badgeNps = document.getElementById('badge-nps');
    this.subNpsDesc = document.getElementById('sub-nps-desc');
    this.barPromoters = document.getElementById('bar-promoters');
    this.barPassives = document.getElementById('bar-passives');
    this.barDetractors = document.getElementById('bar-detractors');

    this.valSummaryPrice = document.getElementById('val-summary-price');
    this.badgePriceTier = document.getElementById('badge-price-tier');
    this.subPriceDesc = document.getElementById('sub-price-desc');
    this.trackPrice = document.getElementById('track-price');

    this.valSummarySecondary = document.getElementById('val-summary-secondary');
    this.badgeResaleTier = document.getElementById('badge-resale-tier');
    this.subSecondaryDesc = document.getElementById('sub-secondary-desc');
    this.trackSecondary = document.getElementById('track-secondary');

    this.valSummaryRetention = document.getElementById('val-summary-retention');
    this.badgeRetentionTier = document.getElementById('badge-retention-tier');
    this.subRetentionDesc = document.getElementById('sub-retention-desc');
    this.trackRetention = document.getElementById('track-retention');

    // Calibration Inputs & Readouts
    this.inputBdi = document.getElementById('input-bdi');
    this.valBdiSlider = document.getElementById('val-bdi-slider');
    this.readoutBdi = document.getElementById('readout-bdi');
    this.subBdiResonance = document.getElementById('sub-bdi-resonance');
    this.subBdiWaitlist = document.getElementById('sub-bdi-waitlist');

    this.inputPromoters = document.getElementById('input-promoters');
    this.inputDetractors = document.getElementById('input-detractors');
    this.valPromoterText = document.getElementById('val-promoter-text');
    this.valDetractorText = document.getElementById('val-detractor-text');
    this.valPassiveText = document.getElementById('val-passive-text');
    this.readoutNps = document.getElementById('readout-nps');

    this.inputPriceRatio = document.getElementById('input-price-ratio');
    this.valPriceSlider = document.getElementById('val-price-slider');
    this.readoutPrice = document.getElementById('readout-price');
    this.subPriceTicket = document.getElementById('sub-price-ticket');

    this.inputSecondary = document.getElementById('input-secondary');
    this.valSecondarySlider = document.getElementById('val-secondary-slider');
    this.readoutSecondary = document.getElementById('readout-secondary');
    this.subSecondaryRisk = document.getElementById('sub-secondary-risk');

    this.inputRetention = document.getElementById('input-retention');
    this.valRetentionSlider = document.getElementById('val-retention-slider');
    this.readoutRetention = document.getElementById('readout-retention');
    this.subRetentionChurn = document.getElementById('sub-retention-churn');
    this.subRetentionLtv = document.getElementById('sub-retention-ltv');
    this.subRetentionHealth = document.getElementById('sub-retention-health');

    // Strategy Lists
    this.stratListScarcity = document.getElementById('strat-list-scarcity');
    this.stratListDistribution = document.getElementById('strat-list-distribution');
    this.stratListPricing = document.getElementById('strat-list-pricing');

    // Toast
    this.perfToast = document.getElementById('perf-toast');
    this.toastMessage = document.getElementById('toast-message');
  }

  bindEvents() {
    // Archetype Presets
    this.archetypeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.archetypeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const key = btn.dataset.preset;
        if (ARCHETYPES[key]) {
          this.loadPreset(key);
        }
      });
    });

    // Sliders
    this.inputBdi.addEventListener('input', (e) => {
      this.bdi = parseInt(e.target.value, 10);
      this.clearPresetActiveState();
      this.calculateAndRender();
    });

    this.inputPromoters.addEventListener('input', (e) => {
      this.promoters = parseInt(e.target.value, 10);
      // Ensure detractors + promoters <= 98
      if (this.promoters + this.detractors > 98) {
        this.detractors = 98 - this.promoters;
        this.inputDetractors.value = this.detractors;
      }
      this.clearPresetActiveState();
      this.calculateAndRender();
    });

    this.inputDetractors.addEventListener('input', (e) => {
      this.detractors = parseInt(e.target.value, 10);
      if (this.promoters + this.detractors > 98) {
        this.promoters = 98 - this.detractors;
        this.inputPromoters.value = this.promoters;
      }
      this.clearPresetActiveState();
      this.calculateAndRender();
    });

    this.inputPriceRatio.addEventListener('input', (e) => {
      this.priceRatio = parseFloat(e.target.value);
      this.clearPresetActiveState();
      this.calculateAndRender();
    });

    this.inputSecondary.addEventListener('input', (e) => {
      this.secondary = parseInt(e.target.value, 10);
      this.clearPresetActiveState();
      this.calculateAndRender();
    });

    this.inputRetention.addEventListener('input', (e) => {
      this.retention = parseInt(e.target.value, 10);
      this.clearPresetActiveState();
      this.calculateAndRender();
    });

    // Action buttons
    this.btnPrintDossier.addEventListener('click', () => window.print());
    this.btnCopyBrief.addEventListener('click', () => this.copyPerformanceBrief());
  }

  loadPreset(key) {
    const data = ARCHETYPES[key];
    this.currentPreset = key;
    this.bdi = data.bdi;
    this.promoters = data.promoters;
    this.detractors = data.detractors;
    this.priceRatio = data.priceRatio;
    this.secondary = data.secondary;
    this.retention = data.retention;

    // Sync input controls
    this.inputBdi.value = this.bdi;
    this.inputPromoters.value = this.promoters;
    this.inputDetractors.value = this.detractors;
    this.inputPriceRatio.value = this.priceRatio;
    this.inputSecondary.value = this.secondary;
    this.inputRetention.value = this.retention;

    this.calculateAndRender();
    this.showToast(`Calibrated to "${data.name}".`);
  }

  clearPresetActiveState() {
    this.archetypeButtons.forEach(b => b.classList.remove('active'));
  }

  calculateAndRender() {
    // 1. Calculate NPS
    const passives = Math.max(0, 100 - this.promoters - this.detractors);
    const netNps = this.promoters - this.detractors;

    // 2. Calculate Weighted Composite Brand Score (0 - 100)
    // Pillar Weights:
    // - Brand Desirability Index (25%)
    // - NPS Score normalized (20%): -100..+100 -> 0..100
    // - Price Premium (20%): 1x..5x scaled to 0..100
    // - Secondary Value Retention (20%): 60%..140% scaled
    // - Client Retention Rate (15%): 0..100%
    const npsNormalized = ((netNps + 100) / 200) * 100;
    const priceScore = Math.min(100, Math.max(0, ((this.priceRatio - 1.0) / 4.0) * 100));
    const secondaryScore = Math.min(100, Math.max(0, ((this.secondary - 50) / 90) * 100));
    const retentionScore = Math.min(100, Math.max(0, this.retention));

    const compositeScore = Math.round(
      (this.bdi * 0.25) +
      (npsNormalized * 0.20) +
      (priceScore * 0.20) +
      (secondaryScore * 0.20) +
      (retentionScore * 0.15)
    );

    // 3. Determine Grade & Health Status
    let grade = 'C';
    let statusClass = 'status-vulnerable';
    let statusTitle = 'Vulnerable / Diluted Equity';
    let statusDesc = 'Maison equity at risk of over-distribution, discounting pressure, and declining VIP client loyalty.';

    if (compositeScore >= 90) {
      grade = 'A+';
      statusClass = 'status-sovereign';
      statusTitle = 'Sovereign Market Power';
      statusDesc = 'Unprecedented pricing inelasticity, acute demand backlog, robust secondary market appreciation, and extreme client devotion.';
    } else if (compositeScore >= 78) {
      grade = 'A';
      statusClass = 'status-bluechip';
      statusTitle = 'Dominant Blue-Chip Prestige';
      statusDesc = 'Formidable brand moat, healthy secondary price parity, consistent price escalation power, and robust VIC cohort retention.';
    } else if (compositeScore >= 62) {
      grade = 'B';
      statusClass = 'status-aspirational';
      statusTitle = 'Aspirational Premium Maison';
      statusDesc = 'High volume appeal and commercial velocity, but susceptible to market cycles; requires stricter scarcity and wholesale pruning.';
    }

    // 4. Update Grade Meter & Hero
    this.compositeGradeLetter.textContent = grade;
    this.compositeScoreText.textContent = `${compositeScore} / 100`;

    // SVG Circular Meter (Circumference of r=80 is 2 * Math.PI * 80 ~= 502.65)
    const circumference = 502.65;
    const progressOffset = circumference - (circumference * (compositeScore / 100));
    this.meterCircleBar.style.strokeDashoffset = progressOffset;

    this.healthStatusBadge.className = `health-status-badge ${statusClass}`;
    this.healthStatusBadge.textContent = statusTitle;
    this.healthStatusDesc.textContent = statusDesc;

    // 5. Update Mini-Pillar Summaries
    // BDI
    this.valSummaryBdi.innerHTML = `${this.bdi} <span style="font-size: 1rem; color: var(--text-secondary); font-weight: normal;">/ 100</span>`;
    this.trackBdi.style.width = `${this.bdi}%`;
    this.badgeDesirability.textContent = `Heat: ${this.bdi}/100`;
    this.subBdiDesc.textContent = this.bdi >= 90 ? 'Acute allocation tension' : (this.bdi >= 75 ? 'Healthy brand momentum' : 'Moderate consumer demand');

    // NPS
    const npsSign = netNps > 0 ? '+' : '';
    this.valSummaryNps.innerHTML = `${npsSign}${netNps} <span style="font-size: 1rem; color: var(--text-secondary); font-weight: normal;">NPS</span>`;
    this.subNpsDesc.textContent = `${this.promoters}% Promoters / ${this.detractors}% Detractors`;
    this.barPromoters.style.width = `${this.promoters}%`;
    this.barPassives.style.width = `${passives}%`;
    this.barDetractors.style.width = `${this.detractors}%`;
    this.badgeNps.textContent = netNps >= 70 ? 'Benchmark: Top Decile' : (netNps >= 45 ? 'Benchmark: Healthy' : 'Action Required');

    // Price Ratio
    this.valSummaryPrice.innerHTML = `${this.priceRatio.toFixed(1)}× <span style="font-size: 1rem; color: var(--text-secondary); font-weight: normal;">vs Base</span>`;
    this.trackPrice.style.width = `${Math.min(100, (this.priceRatio / 6.0) * 100)}%`;
    this.badgePriceTier.textContent = this.priceRatio >= 4.0 ? 'Sovereign Tier' : (this.priceRatio >= 2.5 ? 'Haute Luxury' : 'Accessible Premium');
    this.subPriceDesc.textContent = this.priceRatio >= 4.0 ? 'Extreme pricing power' : (this.priceRatio >= 2.5 ? 'Resilient margin defense' : 'Volume pricing dynamic');

    // Secondary Retention
    this.valSummarySecondary.innerHTML = `${this.secondary}% <span style="font-size: 1rem; color: ${this.secondary >= 100 ? 'var(--emerald-luxury)' : 'var(--text-secondary)'}; font-weight: normal;">resale</span>`;
    this.trackSecondary.style.width = `${Math.min(100, (this.secondary / 150) * 100)}%`;
    this.badgeResaleTier.textContent = this.secondary >= 105 ? 'Appreciating' : (this.secondary >= 90 ? 'Parity Retained' : 'Depreciating');
    const diffMSRP = this.secondary - 100;
    this.subSecondaryDesc.textContent = diffMSRP >= 0 ? `+${diffMSRP}% above original MSRP` : `${Math.abs(diffMSRP)}% secondary discount`;

    // Client Retention
    this.valSummaryRetention.innerHTML = `${this.retention}% <span style="font-size: 1rem; color: var(--text-secondary); font-weight: normal;">annual</span>`;
    this.trackRetention.style.width = `${this.retention}%`;
    this.badgeRetentionTier.textContent = this.retention >= 80 ? 'Haute Fidélité' : (this.retention >= 60 ? 'Stable VIP' : 'High Turnover');
    this.subRetentionDesc.textContent = `${100 - this.retention}% annualized churn`;

    // 6. Update Calibration Console Details
    this.readoutBdi.textContent = `${this.bdi} / 100`;
    this.valBdiSlider.textContent = this.bdi;
    this.subBdiResonance.textContent = `${Math.min(100, Math.round(this.bdi * 1.02))}%`;
    this.subBdiWaitlist.textContent = `${(1.0 + (this.bdi / 18)).toFixed(1)}×`;

    this.readoutNps.textContent = `${npsSign}${netNps} NPS`;
    this.valPromoterText.textContent = `${this.promoters}%`;
    this.valDetractorText.textContent = `${this.detractors}%`;
    this.valPassiveText.textContent = `${passives}%`;

    this.readoutPrice.textContent = `${this.priceRatio.toFixed(2)}×`;
    this.valPriceSlider.textContent = `${this.priceRatio.toFixed(1)}×`;
    const avgTicket = Math.round(3830 * this.priceRatio);
    this.subPriceTicket.textContent = `$${avgTicket.toLocaleString()}`;

    this.readoutSecondary.textContent = `${this.secondary}%`;
    this.valSecondarySlider.textContent = `${this.secondary}%`;
    this.subSecondaryRisk.textContent = this.secondary >= 105 ? 'Zero Discounting Risk' : (this.secondary >= 85 ? 'Controlled Secondary Flow' : 'Heavy Grey-Market Discounting');

    this.readoutRetention.textContent = `${this.retention}%`;
    this.valRetentionSlider.textContent = `${this.retention}%`;
    this.subRetentionChurn.textContent = `${100 - this.retention}%`;
    this.subRetentionLtv.textContent = `${(1.0 + (this.retention / 22)).toFixed(1)}× First-Year`;
    this.subRetentionHealth.textContent = this.retention >= 80 ? 'Ultra-VIP Elite' : (this.retention >= 65 ? 'Satisfactory' : 'Churn Fragility');

    // 7. Generate Dynamic Strategic Recommendations
    this.updateStrategicRecommendations(grade, compositeScore, netNps);
  }

  // Dynamic Strategic Maison Directives Generator
  updateStrategicRecommendations(grade, score, netNps) {
    // I. Scarcity & Allocation
    let scarcityDirectives = [];
    if (this.bdi >= 90) {
      scarcityDirectives = [
        'Maintain strict annual production volume caps on core icons to sustain 18-to-24 month waitlists.',
        'Implement individual client allocation quotas (maximum 1 hero complication/handbag per VIC bi-annually).',
        'Hold an intentional 15-20% supply deficit against global unprompted demand to defend exclusivity aura.'
      ];
    } else if (this.bdi >= 75) {
      scarcityDirectives = [
        'Throttle production volumes on heritage SKUs by 8% to eliminate over-the-counter boutique immediate availability.',
        'Establish tiered waitlist mechanics for limited-run artistic craft collaborations.',
        'Transition top 3 revenue silhouettes from push-distribution to client-ordered allocation.'
      ];
    } else {
      scarcityDirectives = [
        'Immediate production freeze: reduce seasonal production runs by 25% to flush existing channel inventory.',
        'Eliminate factory outlet and off-price channel supply lines immediately.',
        'Re-introduce scarcity perception by retiring over-distributed entry designs and launching numbered limited editions.'
      ];
    }

    // II. Distribution Channel Hygiene
    let distributionDirectives = [];
    if (this.secondary >= 110) {
      distributionDirectives = [
        'Enforce 92%+ direct-to-consumer (DTC) mono-brand boutique and private salon revenue mix.',
        'Deploy embedded NFC/RFID micro-threading in all finished goods for irreversible provenance tracking and anti-grey-market tracing.',
        'Restrict online boutique transactions to invitation-only VIC clienteling capsules.'
      ];
    } else if (this.secondary >= 85) {
      distributionDirectives = [
        'Prune 30% of multi-brand department store and third-party wholesale doors over the next 18 months.',
        'Terminate wholesale stockists found discounting or redirecting units into secondary grey-market channels.',
        'Harmonize worldwide retail pricing within a ±4% currency band to eliminate cross-border arbitrage.'
      ];
    } else {
      scarcityDirectives.push('Conduct full global retail inventory audit.');
      distributionDirectives = [
        'Aggressive channel cleanup: terminate all non-flagship wholesale relationships and buy back excess stock.',
        'Take full legal and contractual measures against parallel grey-market liquidation platforms.',
        'Consolidate brand presence into mono-brand flagship boutiques in primary tier-1 cultural capitals only.'
      ];
    }

    // III. Pricing Elasticity & Margin Defense
    let pricingDirectives = [];
    if (this.priceRatio >= 3.5 && netNps >= 65) {
      pricingDirectives = [
        'Execute compounding bi-annual +7.5% price indexations across iconic heritage SKUs without volume erosion.',
        'Prune entry-level gateway products under $1,200 to lift and protect the luxury pricing floor.',
        'Enforce absolute, unbending global zero-discounting policy across all boutiques and concessions.'
      ];
    } else if (this.priceRatio >= 2.2) {
      pricingDirectives = [
        'Align annual price adjustments strictly with high-net-worth inflation index (+5% to +8%).',
        'Shift gross margin targets to 82%+ by elevating handcrafted high-jewelry and bespoke atelier mix.',
        'Replace promotional sales events with exclusive private client gifting and experiential atelier pilgrimages.'
      ];
    } else {
      pricingDirectives = [
        'Halt all promotional discounting and markdown activity immediately; reclaim pricing integrity.',
        'Reposition core hero product pricing upward by 18% over two seasons paired with superior craftsmanship storytelling.',
        'Prune low-margin entry lifestyle licensing and focus marketing investments exclusively on crown jewels.'
      ];
    }

    this.renderList(this.stratListScarcity, scarcityDirectives);
    this.renderList(this.stratListDistribution, distributionDirectives);
    this.renderList(this.stratListPricing, pricingDirectives);
  }

  renderList(container, items) {
    container.innerHTML = items.map(text => `<li>${text}</li>`).join('');
  }

  // Copy Executive Briefing to Clipboard
  copyPerformanceBrief() {
    const netNps = this.promoters - this.detractors;
    const npsSign = netNps > 0 ? '+' : '';
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const grade = this.compositeGradeLetter.textContent;
    const score = this.compositeScoreText.textContent;
    const status = this.healthStatusBadge.textContent.trim();

    const brief = `========================================================================
MAISON BRAND EQUITY & PERFORMANCE EXECUTIVE DOSSIER
========================================================================
Date: ${dateStr}
Classification: STRICTLY CONFIDENTIAL // EXECUTIVE BOARDROOM USE ONLY

EXECUTIVE COMPOSITE BRAND HEALTH:
- Composite Grade: ${grade} (${score})
- Strategic Posture: ${status}

CORE DIAGNOSTIC PILLARS:
1. Brand Desirability Index (BDI) : ${this.bdi} / 100 (${this.subBdiDesc.textContent})
2. Net Promoter Score (NPS)       : ${npsSign}${netNps} NPS (${this.promoters}% Promoters, ${this.detractors}% Detractors)
3. Luxury Price Premium Ratio     : ${this.priceRatio.toFixed(2)}x vs category benchmark
4. Secondary Value Retention Rate : ${this.secondary}% of original retail MSRP
5. VIP Client Retention Rate      : ${this.retention}% annual repeat patronage

BOARDROOM STRATEGIC DIRECTIVES:
------------------------------------------------------------------------
I. SCARCITY & ALLOCATION MANAGEMENT:
${Array.from(this.stratListScarcity.querySelectorAll('li')).map((li, i) => `  ${i + 1}. ${li.textContent}`).join('\n')}

II. DISTRIBUTION CHANNEL HYGIENE:
${Array.from(this.stratListDistribution.querySelectorAll('li')).map((li, i) => `  ${i + 1}. ${li.textContent}`).join('\n')}

III. PRICING ELASTICITY & MARGIN DEFENSE:
${Array.from(this.stratListPricing.querySelectorAll('li')).map((li, i) => `  ${i + 1}. ${li.textContent}`).join('\n')}

CONFIDENTIAL & PROPRIETARY © ${new Date().getFullYear()} ALL IN ONE MAISON.
`;

    navigator.clipboard.writeText(brief).then(() => {
      this.showToast('Executive Performance Brief copied to clipboard.');
    }).catch(err => {
      console.error(err);
      this.showToast('Failed copying brief.', true);
    });
  }

  showToast(message, isError = false) {
    if (!this.perfToast) return;
    this.toastMessage.textContent = message;
    this.perfToast.style.borderColor = isError ? 'var(--ruby-luxury)' : 'var(--gold-primary)';
    this.perfToast.classList.add('show');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.perfToast.classList.remove('show');
    }, 3500);
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.brandPerformance = new BrandPerformanceDiagnostic();
});