// Social Media Engagement Rate Calculator Logic
// Multi-platform analytics engine for Instagram, TikTok, LinkedIn, YouTube, and X (Twitter).

(function () {
  'use strict';

  // Platform Benchmarks and Recommendations
  const PLATFORMS = {
    instagram: {
      name: 'Instagram',
      icon: '📸',
      median: 2.20,
      good: 3.50,
      viral: 6.00,
      followerLabel: 'Followers',
      saveLabel: 'Saves / Bookmarks',
      recs: [
        {
          title: 'Optimize for Carousel Saves & Direct Shares',
          desc: 'The Instagram ranking algorithm heavily prioritizes Saves and DMs over passive double-tap Likes. Design multi-slide educational carousels with an actionable summary on the final slide.'
        },
        {
          title: 'Hook Viewers Within the First 1.5 Seconds of Reels',
          desc: 'For short-form video, retain mobile viewer attention by delivering immediate visual motion, contrasting captions, and trending background audio before second two.'
        },
        {
          title: 'Engage in Comments Within the First 60 Minutes',
          desc: 'Reply to early comments with open-ended questions. Multi-comment discussion threads signal high conversational value to push your post onto the Explore page.'
        }
      ]
    },
    tiktok: {
      name: 'TikTok',
      icon: '🎵',
      median: 5.20,
      good: 7.50,
      viral: 12.00,
      followerLabel: 'Followers',
      saveLabel: 'Favorites / Saves',
      recs: [
        {
          title: 'Focus on Watch Time & Loop Completion Rate',
          desc: 'TikTok distributes content based on video completion rate and rewatches. Keep clips concise (15–30s) or engineer seamless visual loops that prompt repeated plays.'
        },
        {
          title: 'Trigger Direct Shares to Messaging Apps',
          desc: 'The algorithm rewards videos sent directly to friends on iMessage or WhatsApp. Use highly relatable humor, surprising stats, or controversial debates.'
        },
        {
          title: 'Ride Breakout Trending Audio Early',
          desc: 'Jump on trending sounds within their first 48–72 hours of momentum to ride algorithmic audio hub recommendation waves.'
        }
      ]
    },
    linkedin: {
      name: 'LinkedIn',
      icon: '💼',
      median: 2.50,
      good: 4.00,
      viral: 6.50,
      followerLabel: 'Connections & Followers',
      saveLabel: 'Saved Posts',
      recs: [
        {
          title: 'Maximize Dwell Time with PDF Document Carousels',
          desc: 'Multi-slide PDF decks dramatically increase user dwell time on LinkedIn feeds, the primary signal the algorithm uses to recommend content outside your first-degree network.'
        },
        {
          title: 'Spark Professional Debate in the Comments',
          desc: 'Meaningful comments with over 15 words trigger LinkedIn’s "conversation multiplier", broadcasting your post into the personal feeds of everyone who comments.'
        },
        {
          title: 'Format with Clean Breathing Room Above the Fold',
          desc: 'Write punchy 1–2 sentence paragraphs and construct an irresistible opening hook line before the "...see more" truncation fold.'
        }
      ]
    },
    youtube: {
      name: 'YouTube',
      icon: '▶️',
      median: 2.80,
      good: 5.00,
      viral: 8.50,
      followerLabel: 'Subscribers',
      saveLabel: 'Playlists / Watch Later',
      recs: [
        {
          title: 'Optimize Thumbnail & Title Click-Through Rate (CTR)',
          desc: 'Pair uncluttered, high-contrast thumbnail imagery with curiosity-gap titles to lift your impressions-to-view conversion above 6–8%.'
        },
        {
          title: 'Pin an Engaging Question in Top Comment',
          desc: 'A pinned poll or conversational prompt directs viewers straight to the comment section, increasing watch-session dwell time.'
        },
        {
          title: 'Pacing & Pattern Interrupts Every 30 Seconds',
          desc: 'Prevent mid-video abandonment with b-roll cutaways, sound effects, on-screen kinetic typography, and audio pace shifts to preserve high Average Percentage Viewed (APV).'
        }
      ]
    },
    twitter: {
      name: 'X (Twitter)',
      icon: '✖️',
      median: 1.40,
      good: 2.80,
      viral: 4.80,
      followerLabel: 'Followers',
      saveLabel: 'Bookmarks',
      recs: [
        {
          title: 'Build High-Utility "Bookmark Magnets"',
          desc: 'X algorithms weight Bookmarks as an elite indicator of evergreen value. Share cheat sheets, curated resource directories, and detailed frameworks built to be referenced later.'
        },
        {
          title: 'Structure Engaging Multi-Tweet Threads',
          desc: 'Lead with a bold thesis hook tweet, follow with numbered, concrete takeaways, and conclude with a quote-repost call-to-action.'
        },
        {
          title: 'Leave Value-Packed Replies on Niche Authorities',
          desc: 'Post thoughtful, well-articulated comments under top accounts in your field within 10 minutes of their posting to capture second-order algorithmic impressions.'
        }
      ]
    }
  };

  // Presets Data
  const PRESETS = {
    instagram: {
      platform: 'instagram',
      followers: 24000,
      posts: 10,
      likes: 9500,
      comments: 420,
      shares: 280,
      saves: 650,
      reach: 160000
    },
    tiktok: {
      platform: 'tiktok',
      followers: 50000,
      posts: 1,
      likes: 4800,
      comments: 380,
      shares: 1200,
      saves: 950,
      reach: 65000
    },
    linkedin: {
      platform: 'linkedin',
      followers: 15000,
      posts: 5,
      likes: 1450,
      comments: 320,
      shares: 95,
      saves: 210,
      reach: 48000
    },
    youtube: {
      platform: 'youtube',
      followers: 85000,
      posts: 4,
      likes: 14000,
      comments: 1800,
      shares: 900,
      saves: 750,
      reach: 220000
    },
    twitter: {
      platform: 'twitter',
      followers: 35000,
      posts: 1,
      likes: 850,
      comments: 120,
      shares: 260,
      saves: 310,
      reach: 28000
    }
  };

  const numberFormatter = new Intl.NumberFormat('en-US');

  function formatNumber(val) {
    return numberFormatter.format(Math.round(val || 0));
  }

  // Toast Notification
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

  // Follower Size Tier Classification
  function getFollowerTier(count) {
    if (count < 10000) return 'Nano-Creator (<10k)';
    if (count < 50000) return 'Micro-Creator (10k–50k)';
    if (count < 500000) return 'Mid-Tier Creator (50k–500k)';
    return 'Macro / Mega-Creator (500k+)';
  }

  // Main UI Initialization
  document.addEventListener('DOMContentLoaded', () => {
    // Platform state
    let activePlatform = 'instagram';

    // Inputs
    const inputFollowers = document.getElementById('input-followers');
    const inputPosts = document.getElementById('input-posts');
    const inputLikes = document.getElementById('input-likes');
    const inputComments = document.getElementById('input-comments');
    const inputShares = document.getElementById('input-shares');
    const inputSaves = document.getElementById('input-saves');
    const inputReach = document.getElementById('input-reach');

    const lblFollowers = document.getElementById('lbl-followers');
    const lblSaves = document.getElementById('lbl-saves');

    // Outputs
    const badgeTier = document.getElementById('badge-tier');
    const lblFollowerTier = document.getElementById('lbl-follower-tier');
    const heroErVal = document.getElementById('hero-er-val');
    const lblTierDesc = document.getElementById('lbl-tier-desc');

    const cardErFollowers = document.getElementById('card-er-followers');
    const cardErFollowersSub = document.getElementById('card-er-followers-sub');
    const cardErrReach = document.getElementById('card-err-reach');
    const cardErrReachSub = document.getElementById('card-err-reach-sub');
    const cardTotalEng = document.getElementById('card-total-eng');
    const cardTotalEngSub = document.getElementById('card-total-eng-sub');
    const cardAvgPost = document.getElementById('card-avg-post');
    const cardAvgPostSub = document.getElementById('card-avg-post-sub');

    // Chart elements
    const lblChartTitle = document.getElementById('lbl-chart-title');
    const lblChartStatus = document.getElementById('lbl-chart-status');
    const chartYourVal = document.getElementById('chart-your-val');
    const chartYourFill = document.getElementById('chart-your-fill');
    const chartMedianLbl = document.getElementById('chart-median-lbl');
    const chartMedianVal = document.getElementById('chart-median-val');
    const chartMedianFill = document.getElementById('chart-median-fill');
    const chartViralLbl = document.getElementById('chart-viral-lbl');
    const chartViralVal = document.getElementById('chart-viral-val');
    const chartViralFill = document.getElementById('chart-viral-fill');

    // Breakdown elements
    const lblHighValueRatio = document.getElementById('lbl-high-value-ratio');
    const stripLikes = document.getElementById('strip-likes');
    const stripComments = document.getElementById('strip-comments');
    const stripShares = document.getElementById('strip-shares');
    const stripSaves = document.getElementById('strip-saves');
    const lblPctLikes = document.getElementById('lbl-pct-likes');
    const lblPctComments = document.getElementById('lbl-pct-comments');
    const lblPctShares = document.getElementById('lbl-pct-shares');
    const lblPctSaves = document.getElementById('lbl-pct-saves');

    // Recommendations container
    const recsContainer = document.getElementById('recs-container');

    // Buttons
    const btnExport = document.getElementById('btn-export-er');
    const btnReset = document.getElementById('btn-reset-er');
    const platformPills = document.querySelectorAll('.platform-pill-btn');
    const presetChips = document.querySelectorAll('.preset-chip');

    let currentAnalysis = null;

    function runCalculation() {
      const pConfig = PLATFORMS[activePlatform] || PLATFORMS.instagram;

      const followers = Math.max(1, parseFloat(inputFollowers?.value) || 1);
      const posts = Math.max(1, parseFloat(inputPosts?.value) || 1);
      const likes = Math.max(0, parseFloat(inputLikes?.value) || 0);
      const comments = Math.max(0, parseFloat(inputComments?.value) || 0);
      const shares = Math.max(0, parseFloat(inputShares?.value) || 0);
      const saves = Math.max(0, parseFloat(inputSaves?.value) || 0);
      const reach = Math.max(0, parseFloat(inputReach?.value) || 0);

      const totalInteractions = likes + comments + shares + saves;
      const avgInteractionsPerPost = totalInteractions / posts;

      // 1. Engagement Rate per post (by Followers) %
      // Standard Formula: (Total Interactions / (Followers * Posts)) * 100
      const erFollowers = (totalInteractions / (followers * posts)) * 100;

      // 2. Engagement Rate by Reach / Impressions %
      // Formula: (Total Interactions / Total Reach) * 100
      const erReach = reach > 0 ? (totalInteractions / reach) * 100 : null;

      // 3. Tiers & Verifying Quality
      let tierKey = 'average';
      let tierLabel = 'Average Engagement';
      let tierClass = 'tier-average';
      let tierSummary = '';

      if (erFollowers >= pConfig.viral) {
        tierKey = 'viral';
        tierLabel = '🚀 Viral / Elite Tier';
        tierClass = 'tier-viral';
        tierSummary = `Crushing top 5% of ${pConfig.name} creators. Content has viral distribution velocity and strong algorithm favor.`;
      } else if (erFollowers >= pConfig.good) {
        tierKey = 'good';
        tierLabel = '🔥 Good Engagement';
        tierClass = 'tier-good';
        tierSummary = `Outperforming median ${pConfig.name} benchmarks. Strong community responsiveness and above-average retention.`;
      } else if (erFollowers >= pConfig.median) {
        tierKey = 'average';
        tierLabel = '⚖️ Moderate Engagement';
        tierClass = 'tier-average';
        tierSummary = `Aligned with platform baseline averages. Opportunity to lift high-value signals (shares and saves).`;
      } else {
        tierKey = 'poor';
        tierLabel = '⚠️ Needs Optimization';
        tierClass = 'tier-poor';
        tierSummary = `Below median ${pConfig.name} engagement standards. Re-evaluate hook strength, post frequency, and community prompts.`;
      }

      // Follower tier
      const followerTierStr = getFollowerTier(followers);

      // DOM Updates - Hero
      if (badgeTier) {
        badgeTier.textContent = tierLabel;
        badgeTier.className = `tier-badge-pill ${tierClass}`;
      }
      if (lblFollowerTier) {
        lblFollowerTier.textContent = followerTierStr;
      }
      if (heroErVal) {
        heroErVal.textContent = `${erFollowers.toFixed(2)}%`;
      }
      if (lblTierDesc) {
        lblTierDesc.textContent = tierSummary;
      }

      // Key Metric Cards
      if (cardErFollowers) {
        cardErFollowers.textContent = `${erFollowers.toFixed(2)}%`;
        cardErFollowers.style.color = erFollowers >= pConfig.good ? '#34d399' : erFollowers >= pConfig.median ? 'var(--accent)' : '#f87171';
      }
      if (cardErFollowersSub) {
        cardErFollowersSub.textContent = `Median: ${pConfig.median.toFixed(1)}% – ${pConfig.good.toFixed(1)}%`;
      }
      if (cardErrReach) {
        cardErrReach.textContent = erReach !== null ? `${erReach.toFixed(2)}%` : '—';
      }
      if (cardErrReachSub) {
        cardErrReachSub.textContent = reach > 0 ? `${formatNumber(reach)} reach` : 'Add reach input';
      }
      if (cardTotalEng) {
        cardTotalEng.textContent = formatNumber(totalInteractions);
      }
      if (cardTotalEngSub) {
        cardTotalEngSub.textContent = `${formatNumber(likes)} likes • ${formatNumber(comments)} comments`;
      }
      if (cardAvgPost) {
        cardAvgPost.textContent = formatNumber(avgInteractionsPerPost);
      }
      if (cardAvgPostSub) {
        cardAvgPostSub.textContent = `${posts} ${posts === 1 ? 'post' : 'posts'} evaluated`;
      }

      // Chart Visuals
      if (lblChartTitle) {
        lblChartTitle.textContent = `${pConfig.name} Industry Benchmark Comparison`;
      }
      if (lblChartStatus) {
        const diffFromMedian = ((erFollowers - pConfig.median) / pConfig.median) * 100;
        const sign = diffFromMedian > 0 ? '+' : '';
        lblChartStatus.textContent = `${sign}${diffFromMedian.toFixed(1)}% vs. Platform Median`;
        lblChartStatus.style.color = diffFromMedian >= 0 ? '#34d399' : '#f87171';
      }

      const chartMax = Math.max(erFollowers, pConfig.viral * 1.25, 7.5);
      const yourWidth = Math.min(100, Math.max(4, (erFollowers / chartMax) * 100));
      const medianWidth = Math.min(100, Math.max(4, (pConfig.median / chartMax) * 100));
      const viralWidth = Math.min(100, Math.max(4, (pConfig.viral / chartMax) * 100));

      if (chartYourVal) chartYourVal.textContent = `${erFollowers.toFixed(2)}%`;
      if (chartYourFill) chartYourFill.style.width = `${yourWidth}%`;

      if (chartMedianLbl) chartMedianLbl.textContent = `${pConfig.name} Median Benchmark`;
      if (chartMedianVal) chartMedianVal.textContent = `${pConfig.median.toFixed(2)}%`;
      if (chartMedianFill) chartMedianFill.style.width = `${medianWidth}%`;

      if (chartViralLbl) chartViralLbl.textContent = `${pConfig.name} Viral / Top 10% Tier`;
      if (chartViralVal) chartViralVal.textContent = `${pConfig.viral.toFixed(2)}%`;
      if (chartViralFill) chartViralFill.style.width = `${viralWidth}%`;

      // Breakdown Ratios
      const pctLikes = totalInteractions > 0 ? (likes / totalInteractions) * 100 : 0;
      const pctComments = totalInteractions > 0 ? (comments / totalInteractions) * 100 : 0;
      const pctShares = totalInteractions > 0 ? (shares / totalInteractions) * 100 : 0;
      const pctSaves = totalInteractions > 0 ? (saves / totalInteractions) * 100 : 0;
      const highValueRatio = pctShares + pctSaves;

      if (lblHighValueRatio) {
        lblHighValueRatio.textContent = `${highValueRatio.toFixed(1)}% High-Value Actions (Saves & Shares)`;
      }
      if (stripLikes) stripLikes.style.width = `${pctLikes}%`;
      if (stripComments) stripComments.style.width = `${pctComments}%`;
      if (stripShares) stripShares.style.width = `${pctShares}%`;
      if (stripSaves) stripSaves.style.width = `${pctSaves}%`;

      if (lblPctLikes) lblPctLikes.textContent = `${pctLikes.toFixed(1)}%`;
      if (lblPctComments) lblPctComments.textContent = `${pctComments.toFixed(1)}%`;
      if (lblPctShares) lblPctShares.textContent = `${pctShares.toFixed(1)}%`;
      if (lblPctSaves) lblPctSaves.textContent = `${pctSaves.toFixed(1)}%`;

      // Recommendations list
      if (recsContainer) {
        recsContainer.innerHTML = pConfig.recs.map(r => `
          <div class="rec-item accent-border">
            <div>
              <strong style="display:block; color:var(--text-primary); margin-bottom:0.2rem;">${r.title}</strong>
              <span style="color:var(--text-secondary);">${r.desc}</span>
            </div>
          </div>
        `).join('');
      }

      currentAnalysis = {
        platform: pConfig,
        followers,
        posts,
        likes,
        comments,
        shares,
        saves,
        reach,
        totalInteractions,
        avgInteractionsPerPost,
        erFollowers,
        erReach,
        tierLabel,
        followerTierStr,
        highValueRatio,
        pctLikes,
        pctComments,
        pctShares,
        pctSaves
      };
    }

    // Platform switcher
    function setPlatform(platformKey) {
      if (!PLATFORMS[platformKey]) return;
      activePlatform = platformKey;

      platformPills.forEach(pill => {
        if (pill.getAttribute('data-platform') === platformKey) {
          pill.classList.add('active');
        } else {
          pill.classList.remove('active');
        }
      });

      const pConfig = PLATFORMS[platformKey];
      if (lblFollowers) lblFollowers.textContent = `${pConfig.followerLabel} Count`;
      if (lblSaves) lblSaves.textContent = pConfig.saveLabel;

      runCalculation();
    }

    platformPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const plat = pill.getAttribute('data-platform');
        setPlatform(plat);
      });
    });

    // Inputs event listeners
    [inputFollowers, inputPosts, inputLikes, inputComments, inputShares, inputSaves, inputReach].forEach(el => {
      el?.addEventListener('input', runCalculation);
      el?.addEventListener('change', runCalculation);
    });

    // Presets
    presetChips.forEach(chip => {
      chip.addEventListener('click', () => {
        presetChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const key = chip.getAttribute('data-preset');
        const p = PRESETS[key];
        if (!p) return;

        setPlatform(p.platform);

        if (inputFollowers) inputFollowers.value = p.followers;
        if (inputPosts) inputPosts.value = p.posts;
        if (inputLikes) inputLikes.value = p.likes;
        if (inputComments) inputComments.value = p.comments;
        if (inputShares) inputShares.value = p.shares;
        if (inputSaves) inputSaves.value = p.saves;
        if (inputReach) inputReach.value = p.reach;

        runCalculation();
        showToast(`Loaded preset: ${chip.textContent.trim()}`);
      });
    });

    // Reset button
    btnReset?.addEventListener('click', () => {
      const def = PRESETS.instagram;
      presetChips.forEach(c => c.classList.remove('active'));
      document.querySelector('[data-preset="instagram"]')?.classList.add('active');

      setPlatform(def.platform);

      if (inputFollowers) inputFollowers.value = def.followers;
      if (inputPosts) inputPosts.value = def.posts;
      if (inputLikes) inputLikes.value = def.likes;
      if (inputComments) inputComments.value = def.comments;
      if (inputShares) inputShares.value = def.shares;
      if (inputSaves) inputSaves.value = def.saves;
      if (inputReach) inputReach.value = def.reach;

      runCalculation();
      showToast('Reset inputs to defaults');
    });

    // Export report button
    btnExport?.addEventListener('click', () => {
      if (!currentAnalysis) return;
      const c = currentAnalysis;
      const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

      let report = `=================================================\n`;
      report += `SOCIAL MEDIA ENGAGEMENT AUDIT REPORT\n`;
      report += `Platform: ${c.platform.name}\n`;
      report += `Generated: ${dateStr}\n`;
      report += `=================================================\n\n`;
      report += `Follower Tier: ${c.followerTierStr}\n`;
      report += `Quality Tier Verdict: ${c.tierLabel}\n\n`;

      report += `--- ENGAGEMENT METRICS ---\n`;
      report += `• ER per Post (by Followers): ${c.erFollowers.toFixed(2)}%\n`;
      if (c.erReach !== null) {
        report += `• ERR (by Reach/Impressions): ${c.erReach.toFixed(2)}%\n`;
      }
      report += `• Total Followers: ${formatNumber(c.followers)}\n`;
      report += `• Analyzed Posts: ${c.posts}\n`;
      report += `• Total Engagements: ${formatNumber(c.totalInteractions)}\n`;
      report += `• Average Interactions / Post: ${formatNumber(c.avgInteractionsPerPost)}\n\n`;

      report += `--- INTERACTION SIGNAL BREAKDOWN ---\n`;
      report += `• Likes: ${formatNumber(c.likes)} (${c.pctLikes.toFixed(1)}%)\n`;
      report += `• Comments: ${formatNumber(c.comments)} (${c.pctComments.toFixed(1)}%)\n`;
      report += `• Shares: ${formatNumber(c.shares)} (${c.pctShares.toFixed(1)}%)\n`;
      report += `• Saves / Bookmarks: ${formatNumber(c.saves)} (${c.pctSaves.toFixed(1)}%)\n`;
      report += `• High-Value Ratio (Saves & Shares): ${c.highValueRatio.toFixed(1)}%\n\n`;

      report += `--- BENCHMARK COMPARISON ---\n`;
      report += `• Platform Median: ${c.platform.median.toFixed(2)}%\n`;
      report += `• Viral / Top 10% Tier: ${c.platform.viral.toFixed(2)}%\n\n`;

      report += `--- STRATEGIC GROWTH RECOMMENDATIONS ---\n`;
      c.platform.recs.forEach((r, i) => {
        report += `${i + 1}. ${r.title}\n   ${r.desc}\n`;
      });

      report += `\n=================================================\n`;
      report += `Audit conducted with ALL IN ONE Engagement Engine\n`;
      report += `=================================================\n`;

      copyText(report, 'Social engagement audit report copied!');
    });

    // Initial calculation
    runCalculation();
  });
})();