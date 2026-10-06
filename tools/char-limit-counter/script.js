// Character Limit Counter & Multi-Platform Social Media Length Monitor

const PLATFORMS = [
  {
    id: 'twitter',
    name: 'Twitter / X Post',
    limit: 280,
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    note: 'Optimal tweet length: 70–120 chars'
  },
  {
    id: 'insta-bio',
    name: 'Instagram Bio',
    limit: 150,
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
    note: 'Strict bio cutoff at 150 chars'
  },
  {
    id: 'insta-caption',
    name: 'Instagram Caption',
    limit: 2200,
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
    note: 'Truncates at 125 chars before "...more"'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Post',
    limit: 3000,
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`,
    note: 'Feed preview shows initial 140 chars'
  },
  {
    id: 'tiktok',
    name: 'TikTok Caption',
    limit: 2200,
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.16 1.18 2.09 2.35 2.33.89.21 1.84.09 2.64-.37.77-.42 1.34-1.16 1.54-2.01.12-.49.14-.99.14-1.49V.02z"/></svg>`,
    note: 'Max caption expanded to 2,200 chars'
  },
  {
    id: 'sms',
    name: 'SMS Text Message',
    limit: 160,
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
    note: 'Standard single GSM segment (160 chars)'
  },
  {
    id: 'yt-title',
    name: 'YouTube Video Title',
    limit: 100,
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>`,
    note: 'Under 70 chars avoids search truncation'
  },
  {
    id: 'yt-desc',
    name: 'YouTube Description',
    limit: 5000,
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>`,
    note: 'First 3 lines visible above fold'
  },
  {
    id: 'threads',
    name: 'Threads Post',
    limit: 500,
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 12a4 4 0 0 1 8 0v1a3 3 0 0 1-6 0v-2a2 2 0 0 1 4 0"></path></svg>`,
    note: 'Direct text limit per thread'
  },
  {
    id: 'seo-title',
    name: 'Google SEO Title',
    limit: 60,
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
    note: 'Displays properly in Google SERPs'
  }
];

const SAMPLES = {
  tweet: "Exploring next-generation generative AI workflows and modern browser capabilities today. Excited to share open-source tools with developer communities! 🚀 #WebDev #OpenSource #JavaScript",
  insta: "Reflecting on the week of focused deep work and creative problem solving. ✨\n\nSometimes taking a step back is what allows you to leap ten steps forward. What project are you dedicating your energy to this month?\n\nDrop your thoughts in the comments below! 👇\n\n#DeveloperLife #Productivity #CodingCommunity #Minimalism #TechCreatives",
  linkedin: "Excited to announce the rollout of our new utility suite designed for speed, privacy, and frictionless client-side developer experience.\n\nKey principles we committed to during this engineering cycle:\n1. 100% Client-Side Computation: No unnecessary server trips or data leakage.\n2. Accessibility & Mobile Responsiveness: Seamless workflow from phone to widescreen.\n3. Modern Web Standards: Leveraging Web Components and native browser APIs without bloat.\n\nThank you to everyone who provided feedback during beta testing. Feel free to explore and share your thoughts!\n\n#SoftwareEngineering #WebDevelopment #ProductDesign #TechInnovation",
  overlimit: "This is an intentionally long excerpt designed to test what happens when your text exceeds the strict character limits of concise platforms like Twitter/X (280 characters), Instagram Bio (150 characters), SMS messages (160 characters), and YouTube titles (100 characters). When crafting social copy, knowing exactly when and where your message will be truncated prevents critical call-to-actions, URLs, or hashtags from being cut off in your audience's news feeds. Always monitor your character limits before scheduling publishing campaigns!"
};

document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('content-textarea');
  const platformList = document.getElementById('platform-list');
  const platformWarningsCount = document.getElementById('platform-warnings-count');
  const charBadge = document.getElementById('char-badge');

  // Metrics
  const mChars = document.getElementById('m-chars');
  const mNoSpace = document.getElementById('m-nospace');
  const mWords = document.getElementById('m-words');
  const mSentences = document.getElementById('m-sentences');
  const mParagraphs = document.getElementById('m-paragraphs');
  const mReadTime = document.getElementById('m-readtime');

  // Controls
  const clearBtn = document.getElementById('clear-text-btn');
  const cleanSpacesBtn = document.getElementById('clean-spaces-btn');
  const caseUpperBtn = document.getElementById('case-upper-btn');
  const caseLowerBtn = document.getElementById('case-lower-btn');
  const copyBtn = document.getElementById('copy-text-btn');

  // Samples
  const sampleTweetBtn = document.getElementById('sample-tweet-btn');
  const sampleInstaBtn = document.getElementById('sample-insta-btn');
  const sampleLinkedinBtn = document.getElementById('sample-linkedin-btn');
  const sampleOverlimitBtn = document.getElementById('sample-overlimit-btn');

  function calculateMetrics(text) {
    const totalChars = text.length;
    const noSpaces = text.replace(/\s/g, '').length;
    
    // Words
    const wordList = text.trim() ? text.trim().split(/\s+/).filter(Boolean) : [];
    const words = wordList.length;

    // Sentences
    const sentences = text.trim() 
      ? text.split(/[.!?]+/).filter(s => s.trim().length > 0).length 
      : 0;

    // Paragraphs
    const paragraphs = text.trim()
      ? text.split(/\n+/).filter(p => p.trim().length > 0).length
      : 0;

    // Reading time (225 words/min)
    const readingSeconds = Math.ceil((words / 225) * 60);
    let readTimeStr = '0s';
    if (readingSeconds > 60) {
      const mins = Math.floor(readingSeconds / 60);
      const secs = readingSeconds % 60;
      readTimeStr = `${mins}m ${secs}s`;
    } else if (readingSeconds > 0) {
      readTimeStr = `${readingSeconds}s`;
    }

    return {
      totalChars,
      noSpaces,
      words,
      sentences,
      paragraphs,
      readTimeStr
    };
  }

  function renderPlatformCards() {
    const text = textarea.value;
    const currentLen = text.length;
    let warningCount = 0;
    let dangerCount = 0;

    platformList.innerHTML = '';

    PLATFORMS.forEach(plat => {
      const remaining = plat.limit - currentLen;
      const pct = Math.min(Math.round((currentLen / plat.limit) * 100), 100);

      let status = 'safe';
      let badgeText = `${remaining} left`;
      let badgeClass = 'safe';
      let fillClass = 'fill-safe';

      if (remaining < 0) {
        status = 'danger';
        dangerCount++;
        badgeText = `${Math.abs(remaining)} OVER LIMIT`;
        badgeClass = 'danger';
        fillClass = 'fill-danger';
      } else if (pct >= 85) {
        status = 'warning';
        warningCount++;
        badgeText = `⚠️ ${remaining} left`;
        badgeClass = 'warning';
        fillClass = 'fill-warning';
      }

      // SMS segment annotation
      let smsExtra = '';
      if (plat.id === 'sms' && currentLen > 0) {
        const hasUnicode = /[^\u0000-\u00ff]/.test(text);
        const segmentSize = hasUnicode ? 70 : 160;
        const segments = Math.ceil(currentLen / segmentSize);
        smsExtra = ` (${segments} ${segments === 1 ? 'segment' : 'segments'})`;
      }

      const card = document.createElement('div');
      card.className = `platform-card status-${status}`;
      card.innerHTML = `
        <div class="platform-card-header">
          <div class="platform-meta">
            <div class="platform-icon">${plat.icon}</div>
            <div>
              <div class="platform-title">${plat.name}</div>
              <div class="platform-limit-tag">Limit: ${plat.limit} chars${smsExtra}</div>
            </div>
          </div>
          <span class="limit-badge ${badgeClass}">${badgeText}</span>
        </div>

        <div class="gauge-track">
          <div class="gauge-fill ${fillClass}" style="width: ${pct}%;"></div>
        </div>

        <div class="platform-footer">
          <span>${currentLen} / ${plat.limit} (${pct}%)</span>
          ${remaining < 0 ? `<button class="trim-btn" data-limit="${plat.limit}">Trim to ${plat.limit}</button>` : `<span>${plat.note}</span>`}
        </div>
      `;

      platformList.appendChild(card);
    });

    // Attach trim buttons
    platformList.querySelectorAll('.trim-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetLimit = parseInt(e.target.dataset.limit, 10);
        textarea.value = textarea.value.substring(0, targetLimit);
        updateAll();
      });
    });

    // Update Warnings status text
    if (dangerCount > 0) {
      platformWarningsCount.style.color = 'var(--error)';
      platformWarningsCount.textContent = `⛔ ${dangerCount} platform${dangerCount > 1 ? 's' : ''} exceeded!`;
    } else if (warningCount > 0) {
      platformWarningsCount.style.color = 'var(--warning)';
      platformWarningsCount.textContent = `⚠️ ${warningCount} platform${warningCount > 1 ? 's' : ''} close to limit`;
    } else {
      platformWarningsCount.style.color = 'var(--success)';
      platformWarningsCount.textContent = `✓ All platforms within limit`;
    }
  }

  function updateAll() {
    const text = textarea.value;
    const metrics = calculateMetrics(text);

    charBadge.textContent = `${metrics.totalChars} CHARS`;
    mChars.textContent = metrics.totalChars.toLocaleString();
    mNoSpace.textContent = metrics.noSpaces.toLocaleString();
    mWords.textContent = metrics.words.toLocaleString();
    mSentences.textContent = metrics.sentences.toLocaleString();
    mParagraphs.textContent = metrics.paragraphs.toLocaleString();
    mReadTime.textContent = metrics.readTimeStr;

    renderPlatformCards();
  }

  // Event handlers
  textarea.addEventListener('input', updateAll);

  clearBtn.addEventListener('click', () => {
    textarea.value = '';
    updateAll();
    textarea.focus();
  });

  cleanSpacesBtn.addEventListener('click', () => {
    textarea.value = textarea.value.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
    updateAll();
  });

  caseUpperBtn.addEventListener('click', () => {
    textarea.value = textarea.value.toUpperCase();
    updateAll();
  });

  caseLowerBtn.addEventListener('click', () => {
    textarea.value = textarea.value.toLowerCase();
    updateAll();
  });

  copyBtn.addEventListener('click', () => {
    if (!textarea.value) return;
    navigator.clipboard.writeText(textarea.value).then(() => {
      const orig = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = orig;
        copyBtn.classList.remove('copied');
      }, 1800);
    }).catch(err => console.error('Copy failed', err));
  });

  // Presets
  sampleTweetBtn.addEventListener('click', () => {
    textarea.value = SAMPLES.tweet;
    updateAll();
  });

  sampleInstaBtn.addEventListener('click', () => {
    textarea.value = SAMPLES.insta;
    updateAll();
  });

  sampleLinkedinBtn.addEventListener('click', () => {
    textarea.value = SAMPLES.linkedin;
    updateAll();
  });

  sampleOverlimitBtn.addEventListener('click', () => {
    textarea.value = SAMPLES.overlimit;
    updateAll();
  });

  // Initial populate with tweet sample
  textarea.value = SAMPLES.tweet;
  updateAll();
});