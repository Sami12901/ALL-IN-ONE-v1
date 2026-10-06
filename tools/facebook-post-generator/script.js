// Facebook Post Generator Logic

const RANDOM_FB_TOPICS = [
  {
    topic: "Why I stopped multitasking and focus on 1 big goal a day",
    details: "1. Distraction kills deep focus\n2. Context switching burns mental energy\n3. Single-tasking tripled my output\n4. Better work-life boundaries",
    tone: "inspirational",
    cta: "comment"
  },
  {
    topic: "Announcing our brand new AI workflow automation suite",
    details: "1. Saves 10+ hours of repetitive admin work every week\n2. Seamless integration with your favorite apps\n3. Early bird 50% discount for first 100 signups\n4. Zero coding required",
    tone: "promotional",
    cta: "link"
  },
  {
    topic: "The worst career mistake I ever made in my 20s",
    details: "1. Saying yes to every request\n2. Believing hard work alone gets you noticed\n3. Ignoring professional networking\n4. What I would do differently today",
    tone: "storytelling",
    cta: "share"
  },
  {
    topic: "Why coffee is 90% of my company's operating budget",
    details: "1. No code before espresso\n2. Debugging without caffeine is an Olympic sport\n3. Team meetings are really just coffee appreciation summits",
    tone: "humorous",
    cta: "tag"
  },
  {
    topic: "3 simple books that will change how you think about money",
    details: "1. The Psychology of Money\n2. Atomic Habits\n3. Rich Dad Poor Dad\nKey takeaway: Wealth is what you don't spend",
    tone: "casual",
    cta: "comment"
  }
];

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const topicInput = document.getElementById('fb-topic-input');
  const detailsInput = document.getElementById('fb-details-input');
  const ctaSelect = document.getElementById('fb-cta-select');
  const profileNameInput = document.getElementById('fb-profile-name');
  const toggleImage = document.getElementById('toggle-image');
  const toggleHashtags = document.getElementById('toggle-hashtags');
  const generateBtn = document.getElementById('fb-generate-btn');
  const randomBtn = document.getElementById('fb-random-btn');
  const varTabs = document.getElementById('var-tabs');
  const mockupAvatar = document.getElementById('mockup-avatar');
  const mockupName = document.getElementById('mockup-name');
  const mockupBody = document.getElementById('mockup-body');
  const mockupImage = document.getElementById('mockup-image');
  const mockupReactionCount = document.getElementById('mockup-reaction-count');
  const fbLikeBtn = document.getElementById('fb-like-btn');
  const rawTextArea = document.getElementById('fb-raw-text');
  const charCount = document.getElementById('char-count');
  const wordCount = document.getElementById('word-count');
  const copyFbBtn = document.getElementById('copy-fb-btn');
  const copyAllVarsBtn = document.getElementById('copy-all-vars-btn');
  const appToast = document.getElementById('app-toast');

  let activeTone = 'inspirational';
  let activeVarIndex = 0;
  let variations = [];
  let isTruncatedExpanded = false;
  let isLiked = false;

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

  // Tone Chips
  document.querySelectorAll('#tone-selector .tone-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#tone-selector .tone-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeTone = chip.dataset.tone;
    });
  });

  // CTA Text Generator
  function getCTAText(type, topic) {
    switch (type) {
      case 'comment':
        return `👇 What’s your take on this? Have you experienced this yourself? Drop your thoughts in the comments!`;
      case 'link':
        return `🔗 Want to dive deeper? Check out the full breakdown and link in the first comment below! 👇`;
      case 'share':
        return `🔄 If this struck a chord, share this post with someone who needs a gentle reminder today! ❤️`;
      case 'dm':
        return `📩 Curious how this applies to your situation? Send us a quick DM with the word "START" and let's chat!`;
      case 'tag':
        return `🏷️ Tag a friend or colleague who does this on a daily basis! 😂`;
      default:
        return ``;
    }
  }

  // Generate Hashtags
  function getHashtags(topic) {
    const clean = topic.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter(w => w.length > 3);
    const tags = clean.slice(0, 3).map(w => '#' + w.charAt(0).toUpperCase() + w.slice(1));
    if (tags.length === 0) tags.push('#Inspiration', '#Growth', '#DailyThoughts');
    return tags.join(' ');
  }

  // Clean Details into clean bullets
  function parseDetails(raw) {
    if (!raw.trim()) return [];
    return raw.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^[0-9]+[\.\)]\s*/, '').replace(/^[-*•]\s*/, ''));
  }

  // Post Generation Engine
  function generateVariations() {
    const topic = topicInput.value.trim() || 'Achieving your biggest goals';
    const rawDetails = detailsInput.value.trim();
    const details = parseDetails(rawDetails);
    const cta = getCTAText(ctaSelect.value, topic);
    const hashtags = toggleHashtags.checked ? getHashtags(topic) : '';

    variations = [];

    // --- Variation 1: High Engagement & Conversation Hook ---
    let v1 = "";
    if (activeTone === 'inspirational') {
      v1 += `✨ Most people won't tell you this about ${topic.toLowerCase()}...\n\n`;
      v1 += `We're often conditioned to believe that overnight success is normal. But the real game is played in the quiet, unglamorous consistency.\n\n`;
    } else if (activeTone === 'promotional') {
      v1 += `🚀 Huge milestone today! We're finally opening up access to ${topic}.\n\n`;
      v1 += `If you've been struggling to get real results, this was engineered specifically for you.\n\n`;
    } else if (activeTone === 'humorous') {
      v1 += `😂 Unpopular opinion: ${topic} is 10% skill and 90% panic and caffeine.\n\n`;
      v1 += `Tell me I'm not the only one who learned this the hard way.\n\n`;
    } else if (activeTone === 'storytelling') {
      v1 += `📖 Exactly 12 months ago, I was completely overwhelmed by ${topic.toLowerCase()}.\n\n`;
      v1 += `I tried every traditional trick in the book, and almost walked away entirely.\n\n`;
    } else {
      v1 += `👋 Quick question for you all about ${topic.toLowerCase()}...\n\n`;
      v1 += `I've been reflecting on this a lot lately, and I'd love to get your perspective.\n\n`;
    }

    if (details.length > 0) {
      v1 += `Here are the key lessons that made all the difference:\n\n`;
      details.forEach((d, idx) => {
        v1 += `👉 ${d}\n`;
      });
      v1 += `\n`;
    }

    v1 += `Small shifts in daily habits compound faster than you think.\n\n`;
    if (cta) v1 += `${cta}\n\n`;
    if (hashtags) v1 += `${hashtags}`;
    variations.push(v1.trim());

    // --- Variation 2: Storytelling / Personal Narrative ---
    let v2 = `🔥 A quick story about ${topic.toLowerCase()}:\n\n`;
    v2 += `A few years back, I thought doing everything by myself was a badge of honor. I worked around the clock, exhausted myself, and barely saw progress.\n\n`;
    v2 += `Then something clicked. Real growth isn't about working harder—it's about doing the right things with total clarity.\n\n`;
    if (details.length > 0) {
      v2 += `The framework that changed everything for me:\n\n`;
      details.forEach(d => {
        v2 += `✦ ${d}\n`;
      });
      v2 += `\n`;
    }
    v2 += `When you stop doing what doesn't serve you, you finally make room for what matters.\n\n`;
    if (cta) v2 += `${cta}\n\n`;
    if (hashtags) v2 += `${hashtags}`;
    variations.push(v2.trim());

    // --- Variation 3: Actionable Value / Bulleted Blueprint ---
    let v3 = `💡 Save this post: The No-BS Guide to ${topic}.\n\n`;
    v3 += `If you want to cut through the noise and save hours of frustration, here is the exact breakdown:\n\n`;
    if (details.length > 0) {
      details.forEach((d, idx) => {
        v3 += `📌 Step ${idx + 1}: ${d}\n`;
      });
      v3 += `\n`;
    } else {
      v3 += `📌 Step 1: Identify your single most important priority.\n`;
      v3 += `📌 Step 2: Remove distractions and time-wasting traps.\n`;
      v3 += `📌 Step 3: Track your progress weekly, not hourly.\n\n`;
    }
    v3 += `Mastering the basics beats chasing shiny new trends every single time.\n\n`;
    if (cta) v3 += `${cta}\n\n`;
    if (hashtags) v3 += `${hashtags}`;
    variations.push(v3.trim());

    // --- Variation 4: Short, Punchy & Viral Hook ---
    let v4 = `⚡ Stop overcomplicating ${topic.toLowerCase()}.\n\n`;
    v4 += `You don't need 10 different tools.\n`;
    v4 += `You don't need endless permission.\n`;
    v4 += `You just need to execute consistently.\n\n`;
    if (details.length > 0) {
      v4 += `Focus exclusively on these:\n`;
      details.slice(0, 3).forEach(d => {
        v4 += `• ${d}\n`;
      });
      v4 += `\n`;
    }
    v4 += `Simplicity scales. Complexity breaks.\n\n`;
    if (cta) v4 += `${cta}\n\n`;
    if (hashtags) v4 += `${hashtags}`;
    variations.push(v4.trim());

    displayActiveVariation();
    showToast('Generated 4 Facebook post variations!');
  }

  // Display Active Variation
  function displayActiveVariation() {
    const text = variations[activeVarIndex] || "";
    rawTextArea.value = text;
    updateCounts(text);
    renderMockupBody(text);

    // Update avatar & name
    const author = profileNameInput.value.trim() || "Your Brand Name";
    mockupName.textContent = author;
    mockupAvatar.textContent = author.charAt(0).toUpperCase() || "Y";

    // Toggle image
    mockupImage.style.display = toggleImage.checked ? 'flex' : 'none';
  }

  // Render Mockup with "See more" fold logic
  function renderMockupBody(text) {
    mockupBody.innerHTML = '';
    const lines = text.split('\n');
    const FOLD_LIMIT = 3;

    if (lines.length <= FOLD_LIMIT || isTruncatedExpanded) {
      // Full text
      mockupBody.textContent = text;
      if (lines.length > FOLD_LIMIT && isTruncatedExpanded) {
        const collapseSpan = document.createElement('span');
        collapseSpan.className = 'fb-see-more-btn';
        collapseSpan.style.display = 'block';
        collapseSpan.style.marginTop = '0.5rem';
        collapseSpan.textContent = ' Show less';
        collapseSpan.addEventListener('click', () => {
          isTruncatedExpanded = false;
          renderMockupBody(text);
        });
        mockupBody.appendChild(collapseSpan);
      }
    } else {
      // Truncated preview
      const previewText = lines.slice(0, FOLD_LIMIT).join('\n');
      mockupBody.textContent = previewText + '... ';
      const seeMoreSpan = document.createElement('span');
      seeMoreSpan.className = 'fb-see-more-btn';
      seeMoreSpan.textContent = 'See more';
      seeMoreSpan.addEventListener('click', () => {
        isTruncatedExpanded = true;
        renderMockupBody(text);
      });
      mockupBody.appendChild(seeMoreSpan);
    }
  }

  // Character and Word Counter
  function updateCounts(text) {
    charCount.textContent = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    wordCount.textContent = words;
  }

  // Variation Tabs Click
  document.querySelectorAll('#var-tabs .var-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#var-tabs .var-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeVarIndex = parseInt(tab.dataset.index, 10);
      isTruncatedExpanded = false;
      displayActiveVariation();
    });
  });

  // Direct Edit Textarea
  rawTextArea.addEventListener('input', (e) => {
    variations[activeVarIndex] = e.target.value;
    updateCounts(e.target.value);
    renderMockupBody(e.target.value);
  });

  // Profile Name Input
  profileNameInput.addEventListener('input', () => {
    const author = profileNameInput.value.trim() || "Your Brand Name";
    mockupName.textContent = author;
    mockupAvatar.textContent = author.charAt(0).toUpperCase() || "Y";
  });

  // Toggle Image
  toggleImage.addEventListener('change', () => {
    mockupImage.style.display = toggleImage.checked ? 'flex' : 'none';
  });

  // Toggle Hashtags
  toggleHashtags.addEventListener('change', () => {
    generateVariations();
  });

  // Interactive Like Button
  fbLikeBtn.addEventListener('click', () => {
    isLiked = !isLiked;
    let count = parseInt(mockupReactionCount.textContent, 10);
    if (isLiked) {
      fbLikeBtn.classList.add('liked');
      mockupReactionCount.textContent = count + 1;
    } else {
      fbLikeBtn.classList.remove('liked');
      mockupReactionCount.textContent = Math.max(0, count - 1);
    }
  });

  // Copy Active Post
  copyFbBtn.addEventListener('click', () => {
    const text = rawTextArea.value;
    if (!text.trim()) {
      showToast('No post content to copy');
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      showToast(`Copied Variation #${activeVarIndex + 1} to clipboard!`);
    });
  });

  // Copy All 4 Variations
  copyAllVarsBtn.addEventListener('click', () => {
    if (variations.length === 0) {
      showToast('No variations generated');
      return;
    }
    const combined = variations.map((v, i) => `=== VARIATION ${i + 1} ===\n\n${v}\n`).join('\n\n');
    navigator.clipboard.writeText(combined).then(() => {
      showToast('Copied all 4 variations to clipboard!');
    });
  });

  // Random Button
  randomBtn.addEventListener('click', () => {
    const pick = RANDOM_FB_TOPICS[Math.floor(Math.random() * RANDOM_FB_TOPICS.length)];
    topicInput.value = pick.topic;
    detailsInput.value = pick.details;
    ctaSelect.value = pick.cta;
    activeTone = pick.tone;
    document.querySelectorAll('#tone-selector .tone-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.tone === pick.tone);
    });
    generateVariations();
  });

  // Generate Button Click
  generateBtn.addEventListener('click', () => {
    generateVariations();
  });

  // Initial Run
  generateVariations();
});