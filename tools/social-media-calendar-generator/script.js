// Social Media Calendar Generator Logic

const PLATFORMS_CONFIG = {
  instagram: {
    name: "Instagram",
    icon: "📸",
    badgeClass: "plat-instagram",
    formats: ["Reel (Short Video)", "Carousel (10 Slides)", "Single Photo Post", "Story Q&A"],
    bestTimes: ["11:30 AM", "01:00 PM", "06:45 PM", "08:15 PM"]
  },
  linkedin: {
    name: "LinkedIn",
    icon: "💼",
    badgeClass: "plat-linkedin",
    formats: ["Text + PDF Document Carousel", "Insight Story + Image", "Opinion Poll", "Short Text Breakdown"],
    bestTimes: ["08:15 AM", "10:30 AM", "12:45 PM", "04:30 PM"]
  },
  youtube: {
    name: "YouTube",
    icon: "▶️",
    badgeClass: "plat-youtube",
    formats: ["YouTube Short (Vertical)", "Long-form Video (10-15m)", "Community Post / Poll"],
    bestTimes: ["02:00 PM", "04:30 PM", "06:00 PM"]
  },
  twitter: {
    name: "Twitter / X",
    icon: "🐦",
    badgeClass: "plat-twitter",
    formats: ["Multi-Tweet Thread", "Single Punchy Thought", "Quote Tweet + Commentary", "Visual Infographic"],
    bestTimes: ["09:00 AM", "12:00 PM", "03:30 PM", "07:00 PM"]
  },
  tiktok: {
    name: "TikTok",
    icon: "🎵",
    badgeClass: "plat-tiktok",
    formats: ["Hook + Fast Tutorial (30s)", "Day in the Life / BTS", "Stitch / Duet Reaction", "Storytime Video"],
    bestTimes: ["01:00 PM", "05:30 PM", "08:00 PM", "10:00 PM"]
  }
};

const NICHE_CONCEPTS = {
  tech: {
    educational: [
      "5 GitHub repositories every engineer must bookmark in 2026",
      "How Docker and containers work explained to a 10-year-old",
      "The architectural difference between REST, GraphQL, and gRPC",
      "How to speed up your frontend load time by 60% with zero budget",
      "System design 101: How rate limiting prevents DDoS disasters"
    ],
    community: [
      "What programming language do you think is completely overrated?",
      "Behind the scenes: The worst production outage I ever caused and how we fixed it",
      "Show me your desk setup! Drop a picture in the replies",
      "Which developer tool or IDE plugin can you not live without?"
    ],
    entertaining: [
      "POV: You push a bug directly to main on Friday at 4:55 PM",
      "CSS is awesome (until you try to center a div horizontally and vertically)",
      "When the senior dev says 'this task will only take 10 minutes'",
      "Clients explaining what they want vs what the budget allows"
    ],
    promotional: [
      "We just released Version 2.0 with instant cloud sync! Link in bio",
      "Limited early access seats open for our developer workshop",
      "Case study: How Company X scaled to 1M users using our framework",
      "Claim your 30% discount on annual developer plans this week only"
    ]
  },
  creator: {
    educational: [
      "My exact 3-step script framework for retaining 80% of video viewers",
      "How to monetize a small audience of 1,000 true fans",
      "The microphone and lighting setup I use that cost under $150",
      "How to repurpose 1 long YouTube video into 12 pieces of content"
    ],
    community: [
      "What is the single biggest roadblock stopping you from creating daily?",
      "Celebrating a milestone: We just passed 50k members! AMA in the comments",
      "Unpopular opinion: You don't need expensive gear to start posting",
      "Tag your favorite micro-creator who deserves more spotlight!"
    ],
    entertaining: [
      "Me re-reading my first script from 3 years ago (cringing uncontrollably)",
      "When you spend 6 hours editing a video and the algorithm gives you 12 views",
      "The stages of creative burnout and recovery in 15 seconds"
    ],
    promotional: [
      "Enrolling now: The Content Creator Accelerator. Only 15 spots left!",
      "Download our free Creator Resource Kit and hook cheat sheet",
      "Join our weekly private community coaching call this Thursday"
    ]
  },
  ecommerce: {
    educational: [
      "How our products are sustainably crafted from recycled materials",
      "3 mistakes customers make when choosing the right size/fit",
      "How to care for and extend the life of your purchase for years"
    ],
    community: [
      "Customer Spotlight: How Sarah styled her order for weekend travel",
      "Which colorway should we launch for our autumn collection? Vote below!",
      "Unboxing reactions from our VIP community members"
    ],
    entertaining: [
      "Pack an order with me while listening to soothing ASMR sounds",
      "When the courier knocks on your door with the package you ordered 2 days ago",
      "Things that just make sense in our warehouse dispatch room"
    ],
    promotional: [
      "Flash Sale Weekend: Buy 1 Get 1 at 50% Off! Code: FLASH50",
      "Restock Alert: Our most requested item is back in stock for 48 hours",
      "Free express shipping on all orders placed before midnight tonight"
    ]
  },
  fitness: {
    educational: [
      "Why calorie quality matters just as much as calorie counting",
      "The proper deadlift form to protect your lower back from injury",
      "How to get adequate protein intake on a busy 9-to-5 schedule"
    ],
    community: [
      "Drop your workout routine for today in the comments! Let's stay accountable",
      "Client Transformation: 6-month body recomposition and energy gain",
      "What is your biggest struggle when eating out with friends?"
    ],
    entertaining: [
      "Walking down stairs the day after heavy leg day",
      "Thinking you're in great shape until you try taking the stairs to the 4th floor",
      "When your gym playlist accidentally skips from metal to Disney soundtracks"
    ],
    promotional: [
      "Join our upcoming 30-Day Summer Transformation Challenge! Link in bio",
      "Get $50 off personal coaching when you register before Sunday",
      "Download our free High-Protein Meal Prep Guide for Beginners"
    ]
  },
  finance: {
    educational: [
      "The compound interest math that turns $200/month into $500k",
      "High Yield Savings Accounts vs Standard Checking: Don't lose to inflation",
      "How to legally reduce your tax burden using tax-advantaged accounts"
    ],
    community: [
      "What was the best financial decision you made in your 20s?",
      "The money myth you believed as a teenager that turned out to be false",
      "Share your emergency fund savings goal for this year"
    ],
    entertaining: [
      "Checking my bank account balance after buying a $7 iced caramel latte",
      "Financial gurus telling you to stop drinking coffee to buy a house",
      "When payday arrives at 9:00 AM and rent takes it all at 9:05 AM"
    ],
    promotional: [
      "Download our automated Budget & Wealth Tracking Spreadsheet",
      "Book a 1-on-1 financial clarity strategy session with our certified advisors",
      "Join our free weekend webinar on index fund investing"
    ]
  },
  agency: {
    educational: [
      "How we helped a B2B SaaS client increase organic pipeline by 210%",
      "3 marketing metrics vanity dashboards track that actually don't matter",
      "The exact landing page wireframe that converts at 14.8%"
    ],
    community: [
      "What is your agency's biggest challenge right now: Client retention or lead gen?",
      "Meet the team: Behind the scenes at our remote creative sprint",
      "What's one marketing trend you're bullish on for 2026?"
    ],
    entertaining: [
      "When the client says 'make the logo bigger and add some pop'",
      "Sending invoice #47 to a client with 90-day payment terms",
      "Revising the final version of the final_final_v3 draft"
    ],
    promotional: [
      "We have 2 client onboarding slots available for next month. Apply today!",
      "Read our latest Fortune 500 performance case study on our blog",
      "Schedule a complimentary 30-minute growth audit with our directors"
    ]
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const durationSelect = document.getElementById('cal-duration');
  const freqSelect = document.getElementById('cal-freq');
  const nicheSelect = document.getElementById('cal-niche');
  const goalSelect = document.getElementById('cal-goal');
  const startDateInput = document.getElementById('cal-start-date');
  const generateBtn = document.getElementById('cal-generate-btn');
  const totalPostsBadge = document.getElementById('total-posts-badge');
  const calTableBody = document.getElementById('cal-table-body');
  const tableViewContainer = document.getElementById('table-view-container');
  const gridViewContainer = document.getElementById('grid-view-container');
  const viewTableBtn = document.getElementById('view-table-btn');
  const viewGridBtn = document.getElementById('view-grid-btn');
  const addPostRowBtn = document.getElementById('add-post-row-btn');
  const exportCsvBtn = document.getElementById('export-csv-btn');
  const exportIcsBtn = document.getElementById('export-ics-btn');
  const copySummaryBtn = document.getElementById('copy-summary-btn');
  const appToast = document.getElementById('app-toast');

  let selectedPlatforms = ['instagram', 'linkedin', 'youtube', 'twitter'];
  let calendarEvents = [];
  let filterPlat = 'all';
  let filterPillar = 'all';

  // Set default start date to today
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  startDateInput.value = `${yyyy}-${mm}-${dd}`;

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

  // Platform Toggle Buttons
  document.querySelectorAll('#platform-selectors .platform-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.dataset.platform;
      if (selectedPlatforms.includes(p)) {
        if (selectedPlatforms.length === 1) {
          showToast('Keep at least 1 platform selected!');
          return;
        }
        selectedPlatforms = selectedPlatforms.filter(item => item !== p);
        btn.classList.remove('active');
      } else {
        selectedPlatforms.push(p);
        btn.classList.add('active');
      }
    });
  });

  // Filter Buttons
  document.querySelectorAll('.plat-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.plat-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterPlat = btn.dataset.plat;
      renderCalendar();
    });
  });

  document.querySelectorAll('.pillar-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pillar-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterPillar = btn.dataset.pillar;
      renderCalendar();
    });
  });

  // View Mode Toggles
  viewTableBtn.addEventListener('click', () => {
    viewTableBtn.classList.add('active');
    viewGridBtn.classList.remove('active');
    tableViewContainer.style.display = 'block';
    gridViewContainer.style.display = 'none';
  });

  viewGridBtn.addEventListener('click', () => {
    viewGridBtn.classList.add('active');
    viewTableBtn.classList.remove('active');
    tableViewContainer.style.display = 'none';
    gridViewContainer.style.display = 'grid';
  });

  // Calendar Generation Logic
  function generateCalendar() {
    if (selectedPlatforms.length === 0) {
      showToast('Select at least 1 social platform');
      return;
    }

    const durationDays = parseInt(durationSelect.value, 10);
    const weeklyFreq = parseInt(freqSelect.value, 10);
    const nicheKey = nicheSelect.value;
    const nicheData = NICHE_CONCEPTS[nicheKey] || NICHE_CONCEPTS.tech;
    const startDate = new Date(startDateInput.value || Date.now());

    const pillars = [
      { key: 'educational', name: 'Educational', weight: 40 },
      { key: 'community', name: 'Community', weight: 30 },
      { key: 'entertaining', name: 'Entertaining', weight: 20 },
      { key: 'promotional', name: 'Promotional', weight: 10 }
    ];

    calendarEvents = [];

    // Calculate total posts
    const totalWeeks = Math.ceil(durationDays / 7);
    const totalPostsToCreate = Math.min(Math.round((weeklyFreq / 7) * durationDays), durationDays * 2);

    // Days interval
    const stepDays = durationDays / totalPostsToCreate;

    for (let i = 0; i < totalPostsToCreate; i++) {
      const postDate = new Date(startDate);
      const dayOffset = Math.floor(i * stepDays);
      postDate.setDate(startDate.getDate() + dayOffset);

      // Rotate through selected platforms
      const platKey = selectedPlatforms[i % selectedPlatforms.length];
      const platConfig = PLATFORMS_CONFIG[platKey] || PLATFORMS_CONFIG.instagram;

      // Pick pillar based on distribution
      let chosenPillar = 'educational';
      const mod = i % 10;
      if (mod < 4) chosenPillar = 'educational';
      else if (mod < 7) chosenPillar = 'community';
      else if (mod < 9) chosenPillar = 'entertaining';
      else chosenPillar = 'promotional';

      // Pick concept from niche
      const conceptsList = nicheData[chosenPillar] || nicheData.educational;
      const conceptText = conceptsList[i % conceptsList.length] || "Key insights & updates for our audience";

      // Best time
      const timeStr = platConfig.bestTimes[i % platConfig.bestTimes.length];
      const formatStr = platConfig.formats[i % platConfig.formats.length];

      calendarEvents.push({
        id: 'post_' + Math.random().toString(36).substr(2, 9),
        dateObj: postDate,
        dateFormatted: postDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
        dateIso: postDate.toISOString().split('T')[0],
        time: timeStr,
        platformKey: platKey,
        platformName: platConfig.name,
        platformIcon: platConfig.icon,
        badgeClass: platConfig.badgeClass,
        pillarKey: chosenPillar,
        pillarName: chosenPillar.charAt(0).toUpperCase() + chosenPillar.slice(1),
        format: formatStr,
        concept: conceptText
      });
    }

    renderCalendar();
    showToast(`Generated ${calendarEvents.length} scheduled posts!`);
  }

  // Render Calendar Table & Grid
  function renderCalendar() {
    calTableBody.innerHTML = '';
    gridViewContainer.innerHTML = '';

    // Filter
    let list = calendarEvents;
    if (filterPlat !== 'all') {
      list = list.filter(e => e.platformKey === filterPlat);
    }
    if (filterPillar !== 'all') {
      list = list.filter(e => e.pillarKey === filterPillar);
    }

    totalPostsBadge.textContent = list.length;

    if (list.length === 0) {
      calTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-secondary);">No posts match the current filters.</td></tr>`;
      gridViewContainer.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--text-secondary); grid-column: 1/-1;">No posts match the current filters.</div>`;
      return;
    }

    list.forEach((item, index) => {
      // 1. Table Row
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 600;">${item.dateFormatted}</td>
        <td style="font-family: monospace; color: var(--accent);">${item.time}</td>
        <td>
          <span class="plat-badge ${item.badgeClass}">${item.platformIcon} ${item.platformName}</span>
        </td>
        <td>
          <span class="pillar-badge pillar-${item.pillarKey}">${item.pillarName}</span>
        </td>
        <td style="font-size: 0.78rem; color: var(--text-secondary);">${item.format}</td>
        <td style="font-weight: 500;">
          <input type="text" class="form-input row-concept-input" style="padding: 0.4rem 0.6rem; font-size: 0.85rem;" value="${item.concept.replace(/"/g, '&quot;')}">
        </td>
        <td style="text-align: center;">
          <div style="display: flex; gap: 0.3rem; justify-content: center;">
            <button class="del-btn remove-row-btn" data-id="${item.id}" style="width: 28px; height: 28px;" title="Delete post">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </td>
      `;

      tr.querySelector('.row-concept-input').addEventListener('input', (e) => {
        item.concept = e.target.value;
      });

      tr.querySelector('.remove-row-btn').addEventListener('click', (e) => {
        calendarEvents = calendarEvents.filter(ev => ev.id !== item.id);
        renderCalendar();
        showToast('Removed post from calendar');
      });

      calTableBody.appendChild(tr);

      // 2. Grid Card
      const card = document.createElement('div');
      card.className = 'cal-card-item';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <span class="plat-badge ${item.badgeClass}">${item.platformIcon} ${item.platformName}</span>
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin-top: 0.4rem;">${item.dateFormatted}</div>
            <div style="font-size: 0.75rem; color: var(--accent); font-family: monospace;">⏰ ${item.time}</div>
          </div>
          <span class="pillar-badge pillar-${item.pillarKey}">${item.pillarName}</span>
        </div>
        <div style="font-size: 0.75rem; color: var(--text-secondary);">Format: ${item.format}</div>
        <div style="font-size: 0.85rem; font-weight: 500; color: var(--text-primary); line-height: 1.4;">${item.concept}</div>
        <div style="margin-top: auto; display: flex; justify-content: flex-end;">
          <button class="mini-btn remove-card-btn" data-id="${item.id}" style="color: #ef4444;">Remove</button>
        </div>
      `;

      card.querySelector('.remove-card-btn').addEventListener('click', () => {
        calendarEvents = calendarEvents.filter(ev => ev.id !== item.id);
        renderCalendar();
        showToast('Removed post from calendar');
      });

      gridViewContainer.appendChild(card);
    });
  }

  // Add Custom Post Row
  addPostRowBtn.addEventListener('click', () => {
    const todayDate = new Date();
    calendarEvents.push({
      id: 'post_' + Math.random().toString(36).substr(2, 9),
      dateObj: todayDate,
      dateFormatted: todayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      dateIso: todayDate.toISOString().split('T')[0],
      time: "10:00 AM",
      platformKey: "linkedin",
      platformName: "LinkedIn",
      platformIcon: "💼",
      badgeClass: "plat-linkedin",
      pillarKey: "educational",
      pillarName: "Educational",
      format: "Insight Breakdown",
      concept: "New custom post idea topic..."
    });
    renderCalendar();
    showToast('Added custom post slot to schedule');
  });

  // Export to CSV
  exportCsvBtn.addEventListener('click', () => {
    if (calendarEvents.length === 0) {
      showToast('No calendar events to export');
      return;
    }

    let csv = 'Day & Date,Time,Platform,Pillar,Format,Post Concept\n';
    calendarEvents.forEach(e => {
      const esc = (txt) => `"${(txt || '').toString().replace(/"/g, '""')}"`;
      csv += `${esc(e.dateFormatted)},${esc(e.time)},${esc(e.platformName)},${esc(e.pillarName)},${esc(e.format)},${esc(e.concept)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `social-media-calendar-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Exported CSV schedule file!');
  });

  // Export to iCalendar (.ics)
  exportIcsBtn.addEventListener('click', () => {
    if (calendarEvents.length === 0) {
      showToast('No calendar events to export');
      return;
    }

    // Helper for ICS Date formatting: YYYYMMDDTHHMMSSZ
    function formatIcsDate(d, timeStr) {
      const date = new Date(d);
      // Parse timeStr like "08:15 AM" or "02:00 PM"
      let hours = 9;
      let minutes = 0;
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        hours = parseInt(match[1], 10);
        minutes = parseInt(match[2], 10);
        const ampm = (match[3] || '').toUpperCase();
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
      }
      date.setHours(hours, minutes, 0, 0);

      const pad = (n) => String(n).padStart(2, '0');
      return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
    }

    let ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ALL IN ONE//Social Media Calendar Generator//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH"
    ];

    calendarEvents.forEach(e => {
      const dtStart = formatIcsDate(e.dateObj, e.time);
      const dtEnd = formatIcsDate(e.dateObj, e.time); // or +30 min
      const summary = `[${e.platformName}] ${e.concept.replace(/,/g, '\\,')}`;
      const description = `Pillar: ${e.pillarName}\\nFormat: ${e.format}\\nConcept: ${e.concept.replace(/,/g, '\\,')}`;

      ics.push("BEGIN:VEVENT");
      ics.push(`UID:${e.id}@allinone.tools`);
      ics.push(`DTSTAMP:${dtStart}Z`);
      ics.push(`DTSTART:${dtStart}`);
      ics.push(`DTEND:${dtEnd}`);
      ics.push(`SUMMARY:${summary}`);
      ics.push(`DESCRIPTION:${description}`);
      ics.push("STATUS:CONFIRMED");
      ics.push("END:VEVENT");
    });

    ics.push("END:VCALENDAR");

    const blob = new Blob([ics.join("\r\n")], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `social-media-content-schedule-${Date.now()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Exported iCal (.ics) file! Ready for Google/Apple Calendar.');
  });

  // Copy Summary / Markdown
  copySummaryBtn.addEventListener('click', () => {
    if (calendarEvents.length === 0) {
      showToast('No events to copy');
      return;
    }

    let md = `## 📅 Social Media Content Calendar\n\n`;
    md += `| Date | Time | Platform | Pillar | Format | Concept |\n`;
    md += `| --- | --- | --- | --- | --- | --- |\n`;
    calendarEvents.forEach(e => {
      md += `| ${e.dateFormatted} | ${e.time} | ${e.platformName} | ${e.pillarName} | ${e.format} | ${e.concept} |\n`;
    });

    navigator.clipboard.writeText(md).then(() => {
      showToast('Copied content schedule to clipboard!');
    });
  });

  // Generate Button Click
  generateBtn.addEventListener('click', () => {
    generateCalendar();
  });

  // Initial Run
  generateCalendar();
});