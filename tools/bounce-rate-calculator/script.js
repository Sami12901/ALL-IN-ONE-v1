// Bounce Rate Calculator & Engagement Auditor Logic
// Comprehensive analytics engine computing bounce rate %, engagement score (0-100), industry benchmarking, and actionable CRO recommendations.

(function () {
  'use strict';

  // Industry Benchmarks definitions
  const BENCHMARKS = {
    ecommerce: {
      name: 'E-Commerce Store',
      min: 20,
      max: 45,
      avg: 32.5,
      label: 'Expected: 20% – 45%'
    },
    b2b: {
      name: 'B2B Lead Generation',
      min: 25,
      max: 55,
      avg: 40.0,
      label: 'Expected: 25% – 55%'
    },
    blog: {
      name: 'Content Publication / Blog',
      min: 65,
      max: 90,
      avg: 77.5,
      label: 'Expected: 65% – 90%'
    },
    saas: {
      name: 'SaaS & Web App',
      min: 20,
      max: 40,
      avg: 30.0,
      label: 'Expected: 20% – 40%'
    },
    landing: {
      name: 'PPC / Lead Landing Page',
      min: 60,
      max: 90,
      avg: 75.0,
      label: 'Expected: 60% – 90%'
    }
  };

  // Presets
  const PRESETS = {
    ecommerce: {
      industry: 'ecommerce',
      sessions: 25000,
      bounces: 8750,
      min: 2,
      sec: 45,
      pageviews: 3.4
    },
    b2b: {
      industry: 'b2b',
      sessions: 14000,
      bounces: 5600,
      min: 3,
      sec: 15,
      pageviews: 2.8
    },
    blog: {
      industry: 'blog',
      sessions: 42000,
      bounces: 31500,
      min: 1,
      sec: 50,
      pageviews: 1.6
    },
    saas: {
      industry: 'saas',
      sessions: 18000,
      bounces: 5040,
      min: 4,
      sec: 20,
      pageviews: 4.2
    },
    landing: {
      industry: 'landing',
      sessions: 10000,
      bounces: 7200,
      min: 0,
      sec: 55,
      pageviews: 1.2
    }
  };

  const numberFormatter = new Intl.NumberFormat('en-US');

  function formatNumber(val) {
    return numberFormatter.format(Math.round(val || 0));
  }

  // Toast Notifier
  function showToast(message) {
    const toast = document.getElementById('app-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  function copyText(text, successMsg = 'Copied to clipboard!') {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg);
      }).catch(() => {
        fallbackCopy(text, successMsg);
      });
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast(successMsg);
    } catch (e) {
      showToast('Copy failed');
    }
    document.body.removeChild(ta);
  }

  // Compute Multivariable Engagement Score (0 - 100)
  function computeEngagementScore(bounceRate, totalSeconds, pageviews, benchmark) {
    // 1. Bounce Rate factor (0 to 50 pts)
    let bouncePts = 0;
    if (bounceRate <= benchmark.min) {
      bouncePts = 50;
    } else if (bounceRate <= benchmark.max) {
      const ratio = (benchmark.max - bounceRate) / (benchmark.max - benchmark.min);
      bouncePts = 30 + ratio * 20; // 30 to 50
    } else {
      const over = bounceRate - benchmark.max;
      bouncePts = Math.max(0, 30 - over * 1.5);
    }

    // 2. Session Duration factor (0 to 25 pts)
    let durationPts = 0;
    if (totalSeconds >= 240) {
      durationPts = 25;
    } else if (totalSeconds >= 120) {
      durationPts = 15 + ((totalSeconds - 120) / 120) * 10;
    } else if (totalSeconds >= 45) {
      durationPts = 8 + ((totalSeconds - 45) / 75) * 7;
    } else {
      durationPts = Math.max(0, (totalSeconds / 45) * 8);
    }

    // 3. Pageviews factor (0 to 25 pts)
    let pvPts = 0;
    if (pageviews >= 4.0) {
      pvPts = 25;
    } else if (pageviews >= 2.5) {
      pvPts = 16 + ((pageviews - 2.5) / 1.5) * 9;
    } else if (pageviews >= 1.5) {
      pvPts = 8 + ((pageviews - 1.5) / 1.0) * 8;
    } else {
      pvPts = Math.max(0, (pageviews / 1.5) * 8);
    }

    const total = Math.round(bouncePts + durationPts + pvPts);
    return Math.max(0, Math.min(100, total));
  }

  // Generate Personalized Optimization Tips
  function generateTips(bounceRate, totalSeconds, pageviews, indKey, benchmark) {
    const tips = [];

    // Bottleneck 1: Elevated Bounce Rate
    if (bounceRate > benchmark.max) {
      tips.push({
        priority: 'high',
        badge: 'High Priority',
        title: 'Align Above-the-Fold Messaging with Search & Ad Intent',
        desc: `Your bounce rate (${bounceRate.toFixed(1)}%) exceeds the ${benchmark.name} typical upper bound (${benchmark.max}%). Ensure your main H1 headline and value proposition match visitor expectations within 3 seconds.`
      });
      tips.push({
        priority: 'high',
        badge: 'High Priority',
        title: 'Audit Core Web Vitals & Mobile Page Speed',
        desc: 'Over 53% of mobile visits are abandoned if pages take over 3 seconds to load. Compress large hero images, defer render-blocking scripts, and leverage browser caching.'
      });
    } else if (bounceRate > benchmark.avg) {
      tips.push({
        priority: 'medium',
        badge: 'Medium Priority',
        title: 'Optimize First Impression & Scannability',
        desc: `Bounce rate is slightly elevated compared to industry median (${benchmark.avg}%). Break dense paragraphs into bullet points, bold key insights, and reduce visual clutter.`
      });
    } else {
      tips.push({
        priority: 'good',
        badge: 'Strength',
        title: 'Outstanding Low Bounce Rate',
        desc: `At ${bounceRate.toFixed(1)}%, your site retains visitors significantly better than industry average (${benchmark.avg}%). Continue testing your winning layout elements.`
      });
    }

    // Bottleneck 2: Session Duration
    if (totalSeconds < 60) {
      tips.push({
        priority: 'high',
        badge: 'High Priority',
        title: 'Increase Interactive Engagement & Hook Depth',
        desc: 'Visitors spend under 60 seconds on site. Add interactive elements like product finders, video snippets, calculators, or FAQ accordions to anchor visitor attention.'
      });
    } else if (totalSeconds < 120) {
      tips.push({
        priority: 'medium',
        badge: 'Medium Priority',
        title: 'Introduce Compelling Mid-Page Hooks',
        desc: 'Average time on site is modest. Use engaging subheaders, customer testimonial carousels, and visual diagrams to encourage scrolling deeper.'
      });
    }

    // Bottleneck 3: Pageviews per session
    if (pageviews < 2.0 && indKey !== 'landing') {
      tips.push({
        priority: 'medium',
        badge: 'Recommended',
        title: 'Implement Contextual Internal Linking & Related Items',
        desc: 'Visitors rarely explore secondary pages. Add prominent contextual links, a "You May Also Like" grid, or a sticky breadcrumb trail to encourage discovery.'
      });
    }

    // Industry-specific smart advice
    if (indKey === 'ecommerce') {
      tips.push({
        priority: 'medium',
        badge: 'E-Comm Tactic',
        title: 'Transparent Shipping & Exit-Intent Vouchers',
        desc: 'Unexpected shipping costs cause immediate drop-offs. Display shipping thresholds in the top banner and trigger an exit-intent discount popup on cart abandonment.'
      });
    } else if (indKey === 'b2b') {
      tips.push({
        priority: 'medium',
        badge: 'B2B Tactic',
        title: 'Offer Ungated Micro-Conversions',
        desc: 'Not every visitor is ready for a sales demo. Offer a low-friction ungated ROI calculator or downloadable PDF guide to capture mid-funnel prospects.'
      });
    } else if (indKey === 'blog') {
      tips.push({
        priority: 'medium',
        badge: 'Content Tactic',
        title: 'In-Article Inline Newsletter Opt-In',
        desc: 'Blogs naturally have high single-page bounce. Monetize immediate exits by placing a 1-click email newsletter signup box right after your first key takeaway.'
      });
    } else if (indKey === 'landing') {
      tips.push({
        priority: 'medium',
        badge: 'PPC Tactic',
        title: 'Remove External Leakage Navigation',
        desc: 'For dedicated PPC campaigns, strip out header navigation menus and external footer links so visitors have only one focused pathway: converting.'
      });
    } else if (indKey === 'saas') {
      tips.push({
        priority: 'medium',
        badge: 'SaaS Tactic',
        title: 'Frictionless Interactive Sandbox or GIF Previews',
        desc: 'Allow visitors to see the software in action before signup. Embed interactive product demos or high-frame-rate workflow animations in the hero section.'
      });
    }

    return tips;
  }

  // Main UI Initialization
  document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const indSelect = document.getElementById('industry-select');
    const totalInput = document.getElementById('total-sessions');
    const bounceInput = document.getElementById('bounced-sessions');
    const minInput = document.getElementById('duration-min');
    const secInput = document.getElementById('duration-sec');
    const pvInput = document.getElementById('pageviews-per-session');

    // Outputs
    const badgeScore = document.getElementById('badge-score');
    const lblScoreVerdict = document.getElementById('lbl-score-verdict');
    const lblScoreDesc = document.getElementById('lbl-score-desc');
    const heroBounceVal = document.getElementById('hero-bounce-val');

    const cardBounceRate = document.getElementById('card-bounce-rate');
    const cardBounceCount = document.getElementById('card-bounce-count');
    const cardEngagedRate = document.getElementById('card-engaged-rate');
    const cardEngagedCount = document.getElementById('card-engaged-count');
    const cardDurationVal = document.getElementById('card-duration-val');
    const cardDurationSub = document.getElementById('card-duration-sub');
    const cardPageviewsVal = document.getElementById('card-pageviews-val');
    const cardPageviewsSub = document.getElementById('card-pageviews-sub');

    const lblBenchmarkRange = document.getElementById('lbl-benchmark-range');
    const lblBenchmarkVerdict = document.getElementById('lbl-benchmark-verdict');
    const gaugeZone = document.getElementById('gauge-zone');
    const gaugeMarker = document.getElementById('gauge-marker');
    const gaugeMidLbl = document.getElementById('gauge-mid-lbl');

    const tipsContainer = document.getElementById('tips-container');

    // Buttons
    const btnExport = document.getElementById('btn-export-audit');
    const btnReset = document.getElementById('btn-reset-bounce');
    const presetChips = document.querySelectorAll('.preset-chip');

    let currentAuditState = null;

    function runAudit() {
      const indKey = indSelect?.value || 'ecommerce';
      const benchmark = BENCHMARKS[indKey] || BENCHMARKS.ecommerce;

      const sessions = Math.max(1, parseFloat(totalInput?.value) || 0);
      const bounces = Math.max(0, Math.min(sessions, parseFloat(bounceInput?.value) || 0));
      const mins = Math.max(0, parseFloat(minInput?.value) || 0);
      const secs = Math.max(0, Math.min(59, parseFloat(secInput?.value) || 0));
      const totalSeconds = mins * 60 + secs;
      const pageviews = Math.max(1.0, parseFloat(pvInput?.value) || 1.0);

      // Calculations
      const bounceRate = (bounces / sessions) * 100;
      const engagedRate = 100 - bounceRate;
      const engagedCount = sessions - bounces;

      const score = computeEngagementScore(bounceRate, totalSeconds, pageviews, benchmark);

      // Score Verdicts
      let scoreTitle = 'Strong Engagement';
      let scoreColor = '#10b981';
      let scoreClass = '';
      let scoreDescription = 'Your visitors explore multiple pages with healthy session durations exceeding industry benchmarks.';

      if (score >= 80) {
        scoreTitle = 'Elite Engagement (Exceptional)';
        scoreColor = '#10b981';
        scoreClass = '';
        scoreDescription = 'Your site effectively captivates audiences, achieving deep visit depth and low exit rates well above average.';
      } else if (score >= 65) {
        scoreTitle = 'Good Engagement (Healthy)';
        scoreColor = '#10b981';
        scoreClass = '';
        scoreDescription = 'User interaction is healthy and aligned with commercial standards, with targeted opportunities to improve retention.';
      } else if (score >= 45) {
        scoreTitle = 'Moderate Engagement (Friction Present)';
        scoreColor = '#f59e0b';
        scoreClass = 'warning';
        scoreDescription = 'Elevated bounce rates and brief dwell times suggest potential friction in mobile usability, value proposition, or loading speed.';
      } else {
        scoreTitle = 'Critical Drop-off (Urgent Attention)';
        scoreColor = '#ef4444';
        scoreClass = 'danger';
        scoreDescription = 'High proportion of visitors exit immediately upon landing. Immediate audit of page speed, search relevance, and CTAs is recommended.';
      }

      // Benchmark Status
      let bmVerdict = '';
      let bmColor = '#10b981';

      if (bounceRate < benchmark.min) {
        bmVerdict = '🌟 Exceptional (Outperforming Benchmark)';
        bmColor = '#10b981';
      } else if (bounceRate <= benchmark.max) {
        bmVerdict = '✅ Within Optimal Industry Benchmark';
        bmColor = '#10b981';
      } else if (bounceRate <= benchmark.max + 12) {
        bmVerdict = '⚠️ Elevated (Higher Than Industry Average)';
        bmColor = '#f59e0b';
      } else {
        bmVerdict = '❌ Critical Drop-off (Significantly Above Benchmark)';
        bmColor = '#ef4444';
      }

      // Update DOM
      if (badgeScore) {
        badgeScore.textContent = score;
        badgeScore.className = `score-number-badge ${scoreClass}`;
      }
      if (lblScoreVerdict) {
        lblScoreVerdict.innerHTML = `<span>${scoreTitle}</span>`;
        lblScoreVerdict.style.color = scoreColor;
      }
      if (lblScoreDesc) {
        lblScoreDesc.textContent = scoreDescription;
      }
      if (heroBounceVal) {
        heroBounceVal.textContent = `${bounceRate.toFixed(1)}%`;
      }

      // Key Metrics Cards
      if (cardBounceRate) {
        cardBounceRate.textContent = `${bounceRate.toFixed(1)}%`;
        cardBounceRate.style.color = bounceRate <= benchmark.max ? '#34d399' : '#f87171';
      }
      if (cardBounceCount) {
        cardBounceCount.textContent = `${formatNumber(bounces)} dropped`;
      }
      if (cardEngagedRate) {
        cardEngagedRate.textContent = `${engagedRate.toFixed(1)}%`;
      }
      if (cardEngagedCount) {
        cardEngagedCount.textContent = `${formatNumber(engagedCount)} multi-page`;
      }
      if (cardDurationVal) {
        cardDurationVal.textContent = `${mins}m ${secs.toString().padStart(2, '0')}s`;
      }
      if (cardDurationSub) {
        cardDurationSub.textContent = `${totalSeconds}s total time`;
      }
      if (cardPageviewsVal) {
        cardPageviewsVal.textContent = pageviews.toFixed(1);
      }
      if (cardPageviewsSub) {
        cardPageviewsSub.textContent = pageviews >= 3.0 ? 'High exploration' : pageviews >= 2.0 ? 'Standard depth' : 'Shallow browsing';
      }

      // Benchmark Card & Gauge
      if (lblBenchmarkRange) {
        lblBenchmarkRange.textContent = benchmark.label;
      }
      if (lblBenchmarkVerdict) {
        lblBenchmarkVerdict.textContent = bmVerdict;
        lblBenchmarkVerdict.style.color = bmColor;
      }
      if (gaugeZone) {
        gaugeZone.style.left = `${benchmark.min}%`;
        gaugeZone.style.width = `${benchmark.max - benchmark.min}%`;
      }
      if (gaugeMarker) {
        gaugeMarker.style.left = `${Math.min(100, Math.max(0, bounceRate))}%`;
      }
      if (gaugeMidLbl) {
        gaugeMidLbl.textContent = `Industry Avg: ${benchmark.avg.toFixed(1)}%`;
      }

      // Generate Tips
      const tips = generateTips(bounceRate, totalSeconds, pageviews, indKey, benchmark);
      if (tipsContainer) {
        tipsContainer.innerHTML = tips.map(t => `
          <div class="tip-card priority-${t.priority}">
            <span class="tip-badge ${t.priority}">${t.badge}</span>
            <div>
              <strong style="display:block; color:var(--text-primary); margin-bottom:0.15rem;">${t.title}</strong>
              <span style="color:var(--text-secondary);">${t.desc}</span>
            </div>
          </div>
        `).join('');
      }

      currentAuditState = {
        indKey,
        benchmark,
        sessions,
        bounces,
        bounceRate,
        engagedRate,
        engagedCount,
        totalSeconds,
        mins,
        secs,
        pageviews,
        score,
        scoreTitle,
        bmVerdict,
        tips
      };
    }

    // Input listeners
    [indSelect, totalInput, bounceInput, minInput, secInput, pvInput].forEach(el => {
      el?.addEventListener('input', runAudit);
      el?.addEventListener('change', runAudit);
    });

    // Presets
    presetChips.forEach(chip => {
      chip.addEventListener('click', () => {
        presetChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const key = chip.getAttribute('data-preset');
        const p = PRESETS[key];
        if (!p) return;

        if (indSelect) indSelect.value = p.industry;
        if (totalInput) totalInput.value = p.sessions;
        if (bounceInput) bounceInput.value = p.bounces;
        if (minInput) minInput.value = p.min;
        if (secInput) secInput.value = p.sec;
        if (pvInput) pvInput.value = p.pageviews;

        runAudit();
        showToast(`Loaded scenario: ${chip.textContent.trim()}`);
      });
    });

    // Reset button
    btnReset?.addEventListener('click', () => {
      const def = PRESETS.ecommerce;
      presetChips.forEach(c => c.classList.remove('active'));
      document.querySelector('[data-preset="ecommerce"]')?.classList.add('active');

      if (indSelect) indSelect.value = def.industry;
      if (totalInput) totalInput.value = def.sessions;
      if (bounceInput) bounceInput.value = def.bounces;
      if (minInput) minInput.value = def.min;
      if (secInput) secInput.value = def.sec;
      if (pvInput) pvInput.value = def.pageviews;

      runAudit();
      showToast('Reset inputs to defaults');
    });

    // Export button
    btnExport?.addEventListener('click', () => {
      if (!currentAuditState) return;
      const s = currentAuditState;
      const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

      let report = `=================================================\n`;
      report += `WEBSITE BOUNCE RATE & ENGAGEMENT AUDIT REPORT\n`;
      report += `Generated: ${dateStr}\n`;
      report += `=================================================\n\n`;
      report += `Industry Category: ${s.benchmark.name}\n`;
      report += `Overall Engagement Score: ${s.score}/100 (${s.scoreTitle})\n\n`;

      report += `--- CORE TRAFFIC METRICS ---\n`;
      report += `• Total Visitors / Sessions: ${formatNumber(s.sessions)}\n`;
      report += `• Single-Page Bounces: ${formatNumber(s.bounces)}\n`;
      report += `• Calculated Bounce Rate: ${s.bounceRate.toFixed(2)}%\n`;
      report += `• Engaged Sessions: ${formatNumber(s.engagedCount)} (${s.engagedRate.toFixed(2)}%)\n`;
      report += `• Average Session Duration: ${s.mins}m ${s.secs}s (${s.totalSeconds} seconds)\n`;
      report += `• Depth of Visit: ${s.pageviews.toFixed(1)} pageviews/session\n\n`;

      report += `--- BENCHMARK COMPARISON ---\n`;
      report += `• Expected Industry Range: ${s.benchmark.min}% – ${s.benchmark.max}%\n`;
      report += `• Evaluation: ${s.bmVerdict}\n\n`;

      report += `--- KEY ACTIONABLE RECOMMENDATIONS ---\n`;
      s.tips.forEach((t, i) => {
        report += `${i + 1}. [${t.badge}] ${t.title}\n   ${t.desc}\n`;
      });

      report += `\n=================================================\n`;
      report += `Report generated by ALL IN ONE Analytics Engine\n`;
      report += `=================================================\n`;

      copyText(report, 'Full Bounce Rate audit report copied!');
    });

    // Initial audit run
    runAudit();
  });
})();