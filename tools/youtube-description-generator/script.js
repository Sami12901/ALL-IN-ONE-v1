// YouTube Description Generator Logic

const PRESETS = {
  tutorial: {
    title: "Mastering Full-Stack Web Development in 2026",
    summary: "In this complete guide, you'll learn modern full-stack development from scratch. We cover frontend design, robust backend APIs, database architecture, and live cloud deployment.",
    cta: "🔔 Subscribe for weekly engineering guides and turn on notifications!",
    chapters: [
      { time: "00:00", title: "Introduction & Project Architecture" },
      { time: "02:15", title: "Setting Up Development Environment" },
      { time: "06:40", title: "Building the Frontend Interface" },
      { time: "14:20", title: "Developing Backend REST APIs" },
      { time: "22:50", title: "Connecting Database & Authentication" },
      { time: "31:10", title: "Production Deployment & Cloud Setup" },
      { time: "36:45", title: "Final Summary & Next Steps" }
    ],
    links: [
      { name: "Source Code on GitHub", url: "https://github.com/example/fullstack-project" },
      { name: "Course Slides & Cheatsheet", url: "https://example.com/resources" },
      { name: "Recommended Hosting (Save 20%)", url: "https://example.com/hosting-discount" }
    ],
    hashtags: ["#WebDevelopment", "#Coding", "#Programming", "#FullStack", "#JavaScript", "#LearnToCode"]
  },
  review: {
    title: "M4 MacBook Pro Review: The Truth After 30 Days",
    summary: "Is the new M4 MacBook Pro really worth upgrading? In this in-depth review, I break down battery life, real-world editing performance, thermals, and who should actually buy it.",
    cta: "👍 If this review helped you decide, hit the like button and subscribe for more tech reviews!",
    chapters: [
      { time: "00:00", title: "Unboxing & First Impressions" },
      { time: "01:30", title: "Design & Display Quality" },
      { time: "04:15", title: "M4 Performance Benchmarks" },
      { time: "08:50", title: "Real-World Video Editing Test" },
      { time: "12:10", title: "Battery Life & Thermals" },
      { time: "15:40", title: "The Competition & Alternatives" },
      { time: "18:25", title: "Final Verdict: Should You Buy It?" }
    ],
    links: [
      { name: "Check Current Pricing on Amazon", url: "https://amzn.to/example-laptop" },
      { name: "Best USB-C Hub I Use", url: "https://amzn.to/example-hub" },
      { name: "My Favorite Laptop Sleeve", url: "https://amzn.to/example-sleeve" }
    ],
    hashtags: ["#TechReview", "#Apple", "#MacBookPro", "#M4MacBook", "#LaptopReview", "#Productivity"]
  },
  vlog: {
    title: "48 Hours in Tokyo: Hidden Spots You Must Visit",
    summary: "Join me on an unforgettable solo travel journey through Tokyo! From secret ramen alleys in Shinjuku to quiet shrines in Yanaka, here is how to experience Japan like a local.",
    cta: "✈️ Comment below your dream travel destination! Don't forget to like and subscribe.",
    chapters: [
      { time: "00:00", title: "Arriving at Haneda Airport" },
      { time: "02:20", title: "Exploring Shinjuku at Midnight" },
      { time: "05:45", title: "The Best $8 Ramen in Town" },
      { time: "09:30", title: "Old Tokyo Walking Tour in Yanaka" },
      { time: "14:15", title: "Sunset at Shibuya Sky" },
      { time: "18:00", title: "Wrapping Up Day 2 & Farewell" }
    ],
    links: [
      { name: "My Full Tokyo Itinerary & Map", url: "https://example.com/tokyo-guide" },
      { name: "Travel Camera Gear I Used", url: "https://example.com/camera-gear" },
      { name: "Get $10 Off eSIM Mobile Data", url: "https://example.com/esim-promo" }
    ],
    hashtags: ["#Tokyo", "#JapanTravel", "#TravelVlog", "#SoloTravel", "#StreetFood", "#Wanderlust"]
  },
  podcast: {
    title: "Building an $8M Bootstrapped Business | Episode #42",
    summary: "In this episode, I sit down with founder Jane Doe to uncover the exact framework she used to scale a bootstrapped SaaS company to $8M ARR without taking any venture capital.",
    cta: "🎙️ Listen on Spotify and Apple Podcasts! Leave a 5-star review if you enjoyed the conversation.",
    chapters: [
      { time: "00:00", title: "Meet Jane Doe & Early Struggles" },
      { time: "03:40", title: "Finding First 100 Paying Customers" },
      { time: "11:20", title: "Pricing Mistakes to Avoid" },
      { time: "19:15", title: "Hiring Top Talent Remotely" },
      { time: "27:50", title: "How to Build a Moat in 2026" },
      { time: "38:10", title: "Rapid-fire Closing Questions" }
    ],
    links: [
      { name: "Follow Our Guest on X", url: "https://x.com/guestfounder" },
      { name: "Episode Transcript & Notes", url: "https://example.com/podcast/ep42" },
      { name: "Join the Founder Newsletter", url: "https://example.com/newsletter" }
    ],
    hashtags: ["#Podcast", "#Entrepreneurship", "#Startups", "#SaaS", "#BusinessGrowth", "#Bootstrapping"]
  },
  fitness: {
    title: "15-Minute HIIT Workout for Fat Loss (No Equipment)",
    summary: "Burn calories and boost your metabolism with this intense 15-minute home HIIT workout! No gym equipment needed. Follow along with built-in rest timers.",
    cta: "💪 Smash the like button once you finish the workout! Let me know in the comments how you felt.",
    chapters: [
      { time: "00:00", title: "Warm-Up & Mobility" },
      { time: "02:30", title: "Circuit 1: High Knees & Squat Jumps" },
      { time: "06:15", title: "Circuit 2: Mountain Climbers & Burpees" },
      { time: "10:00", title: "Circuit 3: Core & Plank Finishers" },
      { time: "13:45", title: "Cool-Down & Full Body Stretch" }
    ],
    links: [
      { name: "Download Free 30-Day Workout Plan", url: "https://example.com/workout-plan" },
      { name: "My Favorite Workout Mat", url: "https://amzn.to/example-mat" },
      { name: "Electrolytes & Nutrition I Take", url: "https://example.com/supplements" }
    ],
    hashtags: ["#HIITWorkout", "#HomeWorkout", "#FitnessMotivation", "#FatLoss", "#Cardio", "#NoEquipment"]
  },
  gaming: {
    title: "100 Days Surviving Hardcore Minecraft in 2026",
    summary: "I survived 100 days in Hardcore Minecraft where dying means losing everything forever. Watch as I build a mega base, fight the Ender Dragon, and survive impossible odds.",
    cta: "🎮 Leave a like if you enjoyed this 100 days journey! What game should I survive next?",
    chapters: [
      { time: "00:00", title: "Days 1-10: Surviving the First Night" },
      { time: "04:30", title: "Days 11-30: Mining Diamonds & First Base" },
      { time: "11:00", title: "Days 31-60: The Nether Fortress Mission" },
      { time: "19:40", title: "Days 61-90: Preparing for the Dragon" },
      { time: "28:15", title: "Days 91-100: The Final Epic Showdown" }
    ],
    links: [
      { name: "Download World Save & Seed", url: "https://example.com/minecraft-seed" },
      { name: "My Custom Shaders & Texture Pack", url: "https://example.com/shaders" },
      { name: "Join the Discord Server", url: "https://discord.gg/gamingcommunity" }
    ],
    hashtags: ["#Minecraft", "#MinecraftHardcore", "#100Days", "#Gaming", "#MinecraftSurvival"]
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const videoTitleInput = document.getElementById('video-title-input');
  const summaryInput = document.getElementById('summary-input');
  const ctaInput = document.getElementById('cta-input');
  const chaptersList = document.getElementById('chapters-list');
  const addChapterBtn = document.getElementById('add-chapter-btn');
  const linksList = document.getElementById('links-list');
  const addLinkBtn = document.getElementById('add-link-btn');
  const includeAffiliateDisc = document.getElementById('include-affiliate-disc');
  const socialX = document.getElementById('social-x');
  const socialInstagram = document.getElementById('social-instagram');
  const socialDiscord = document.getElementById('social-discord');
  const socialWeb = document.getElementById('social-web');
  const discFairUse = document.getElementById('disc-fair-use');
  const discMusic = document.getElementById('disc-music');
  const discCopyright = document.getElementById('disc-copyright');
  const hashtagCloud = document.getElementById('hashtag-cloud');
  const outputDescArea = document.getElementById('output-desc-area');
  const charBadge = document.getElementById('char-badge');
  const charProgressBar = document.getElementById('char-progress-bar');
  const copyDescBtn = document.getElementById('copy-desc-btn');
  const downloadTxtBtn = document.getElementById('download-txt-btn');
  const resetDescBtn = document.getElementById('reset-desc-btn');
  const appToast = document.getElementById('app-toast');

  let currentChapters = [];
  let currentLinks = [];
  let selectedHashtags = [];
  let currentPresetKey = 'tutorial';

  // Toast Helper
  let toastTimer = null;
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    appToast.textContent = msg;
    appToast.classList.add('show');
    toastTimer = setTimeout(() => {
      appToast.classList.remove('show');
    }, 2200);
  }

  // Load Preset
  function loadPreset(key) {
    const data = PRESETS[key] || PRESETS.tutorial;
    currentPresetKey = key;
    videoTitleInput.value = data.title;
    summaryInput.value = data.summary;
    ctaInput.value = data.cta;
    currentChapters = JSON.parse(JSON.stringify(data.chapters));
    currentLinks = JSON.parse(JSON.stringify(data.links));
    selectedHashtags = JSON.parse(JSON.stringify(data.hashtags));

    renderChapterRows();
    renderLinkRows();
    renderHashtags(data.hashtags);
    compileDescription();
  }

  // Render Chapter Rows
  function renderChapterRows() {
    chaptersList.innerHTML = '';
    currentChapters.forEach((ch, idx) => {
      const row = document.createElement('div');
      row.className = 'row-item';
      row.innerHTML = `
        <input type="text" class="form-input chapter-time" style="width: 85px; font-family: monospace; text-align: center;" value="${ch.time}" placeholder="00:00">
        <input type="text" class="form-input chapter-title" style="flex: 1;" value="${ch.title}" placeholder="Chapter Title">
        <button class="del-btn remove-chapter-btn" title="Delete chapter">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      `;

      row.querySelector('.chapter-time').addEventListener('input', (e) => {
        currentChapters[idx].time = e.target.value;
        compileDescription();
      });
      row.querySelector('.chapter-title').addEventListener('input', (e) => {
        currentChapters[idx].title = e.target.value;
        compileDescription();
      });
      row.querySelector('.remove-chapter-btn').addEventListener('click', () => {
        currentChapters.splice(idx, 1);
        renderChapterRows();
        compileDescription();
      });

      chaptersList.appendChild(row);
    });
  }

  // Add Chapter Button
  addChapterBtn.addEventListener('click', () => {
    currentChapters.push({ time: "00:00", title: "New Chapter Topic" });
    renderChapterRows();
    compileDescription();
  });

  // Render Link Rows
  function renderLinkRows() {
    linksList.innerHTML = '';
    currentLinks.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'row-item';
      row.innerHTML = `
        <input type="text" class="form-input link-name" style="width: 40%;" value="${item.name}" placeholder="Resource Label">
        <input type="text" class="form-input link-url" style="flex: 1;" value="${item.url}" placeholder="https://...">
        <button class="del-btn remove-link-btn" title="Delete resource">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      `;

      row.querySelector('.link-name').addEventListener('input', (e) => {
        currentLinks[idx].name = e.target.value;
        compileDescription();
      });
      row.querySelector('.link-url').addEventListener('input', (e) => {
        currentLinks[idx].url = e.target.value;
        compileDescription();
      });
      row.querySelector('.remove-link-btn').addEventListener('click', () => {
        currentLinks.splice(idx, 1);
        renderLinkRows();
        compileDescription();
      });

      linksList.appendChild(row);
    });
  }

  // Add Link Button
  addLinkBtn.addEventListener('click', () => {
    currentLinks.push({ name: "Useful Resource", url: "https://example.com" });
    renderLinkRows();
    compileDescription();
  });

  // Render Hashtags Cloud
  function renderHashtags(suggestedList) {
    hashtagCloud.innerHTML = '';
    suggestedList.forEach(tag => {
      const isSelected = selectedHashtags.includes(tag);
      const chip = document.createElement('span');
      chip.className = `tag-chip ${isSelected ? 'selected' : ''}`;
      chip.textContent = tag;
      chip.addEventListener('click', () => {
        if (selectedHashtags.includes(tag)) {
          selectedHashtags = selectedHashtags.filter(t => t !== tag);
        } else {
          selectedHashtags.push(tag);
        }
        renderHashtags(suggestedList);
        compileDescription();
      });
      hashtagCloud.appendChild(chip);
    });
  }

  // Compile Description Output
  function compileDescription() {
    const parts = [];

    // Title / Hook
    const summary = summaryInput.value.trim();
    if (summary) {
      parts.push(summary);
      parts.push("");
    }

    // Call to Action
    const cta = ctaInput.value.trim();
    if (cta) {
      parts.push(cta);
      parts.push("");
    }

    // Chapters
    if (currentChapters.length > 0) {
      parts.push("⏱️ TIMESTAMPS & CHAPTERS:");
      currentChapters.forEach(c => {
        parts.push(`${c.time} - ${c.title}`);
      });
      parts.push("");
    }

    // Links & Resources
    if (currentLinks.length > 0) {
      parts.push("🔗 RESOURCES & LINKS MENTIONED:");
      currentLinks.forEach(l => {
        parts.push(`👉 ${l.name}: ${l.url}`);
      });
      parts.push("");
    }

    // Social Media
    const socials = [];
    if (socialX.value.trim()) socials.push(`🐦 Twitter / X: ${socialX.value.trim()}`);
    if (socialInstagram.value.trim()) socials.push(`📸 Instagram: ${socialInstagram.value.trim()}`);
    if (socialDiscord.value.trim()) socials.push(`💬 Discord: ${socialDiscord.value.trim()}`);
    if (socialWeb.value.trim()) socials.push(`🌐 Website: ${socialWeb.value.trim()}`);
    if (socials.length > 0) {
      parts.push("📲 CONNECT WITH ME:");
      socials.forEach(s => parts.push(s));
      parts.push("");
    }

    // Affiliate Disclosure
    if (includeAffiliateDisc.checked) {
      parts.push("⚖️ AFFILIATE DISCLOSURE:");
      parts.push("Some of the links in this description may be affiliate links. If you make a purchase through them, I may earn a small commission at no additional cost to you. Thank you for supporting the channel!");
      parts.push("");
    }

    // Disclaimers & Copyright
    const disclaimers = [];
    if (discFairUse.checked) {
      disclaimers.push("Fair Use Notice: This video may contain copyrighted material used under Section 107 of the Copyright Act 1976 for commentary, criticism, and educational purposes.");
    }
    if (discMusic.checked) {
      disclaimers.push("Music & Sound Effects licensed via Epidemic Sound / Artlist / YouTube Audio Library.");
    }
    if (discCopyright.checked) {
      disclaimers.push(`© ${new Date().getFullYear()} All Rights Reserved.`);
    }
    if (disclaimers.length > 0) {
      parts.push("🛡️ LEGAL & CREDITS:");
      disclaimers.forEach(d => parts.push(d));
      parts.push("");
    }

    // Hashtags
    if (selectedHashtags.length > 0) {
      parts.push(selectedHashtags.join(" "));
    }

    const fullText = parts.join("\n");
    outputDescArea.value = fullText;
    updateCharCount(fullText.length);
  }

  // Update Character Count
  function updateCharCount(len) {
    charBadge.textContent = `${len.toLocaleString()} / 5,000 Chars`;
    const pct = Math.min((len / 5000) * 100, 100);
    charProgressBar.style.width = `${pct}%`;

    if (len > 5000) {
      charBadge.style.color = '#ef4444';
      charProgressBar.style.background = '#ef4444';
    } else if (len > 4500) {
      charBadge.style.color = '#fbbf24';
      charProgressBar.style.background = '#fbbf24';
    } else {
      charBadge.style.color = '#34d399';
      charProgressBar.style.background = '#34d399';
    }
  }

  // Output Direct Input
  outputDescArea.addEventListener('input', (e) => {
    updateCharCount(e.target.value.length);
  });

  // Preset Pills click
  document.querySelectorAll('#preset-selector .preset-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#preset-selector .preset-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      loadPreset(pill.dataset.preset);
      showToast(`Loaded ${pill.textContent.trim()} template`);
    });
  });

  // Inputs live change
  [videoTitleInput, summaryInput, ctaInput, includeAffiliateDisc, socialX, socialInstagram, socialDiscord, socialWeb, discFairUse, discMusic, discCopyright].forEach(el => {
    el.addEventListener('input', compileDescription);
    el.addEventListener('change', compileDescription);
  });

  // Copy Description Button
  copyDescBtn.addEventListener('click', () => {
    const text = outputDescArea.value;
    if (!text.trim()) {
      showToast('Description is empty');
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied formatted description!');
    });
  });

  // Download .txt Button
  downloadTxtBtn.addEventListener('click', () => {
    const text = outputDescArea.value;
    if (!text.trim()) {
      showToast('Description is empty');
      return;
    }
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `youtube-description-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Downloaded description .txt');
  });

  // Reset Button
  resetDescBtn.addEventListener('click', () => {
    loadPreset(currentPresetKey);
    showToast('Reverted to template preset');
  });

  // Initialize
  loadPreset('tutorial');
});