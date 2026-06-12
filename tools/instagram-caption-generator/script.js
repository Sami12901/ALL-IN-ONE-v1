document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    topic: document.getElementById('topic'),
    tone: document.getElementById('tone'),
    emojis: document.getElementById('emojis'),
    hashtags: document.getElementById('hashtags'),
    btn: document.getElementById('generate-btn'),
    results: document.getElementById('results-container')
  };

  const genericEmojis = ['✨', '🔥', '💯', '📸', '🙌', '🌟', '🤍', '📍'];

  function getRandom(arr, count = 1) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return count === 1 ? shuffled[0] : shuffled.slice(0, count);
  }

  function getKeywords(topicStr) {
    const words = topicStr.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3);
    return getRandom(words, Math.min(3, words.length));
  }

  const templates = {
    casual: [
      "Just another day focusing on {topic}.",
      "Vibing with {topic} right now.",
      "Can't get enough of {topic}.",
      "Life update: currently obsessing over {topic}.",
      "Here's a little {topic} for your feed."
    ],
    funny: [
      "I’m just here for the {topic} (and the snacks).",
      "They say don't try this at home, so I went to {topic}.",
      "My relationship status with {topic}: It's complicated.",
      "Reality called, so I hung up and went back to {topic}.",
      "I'm 99% {topic} and 1% coffee."
    ],
    inspirational: [
      "Every journey starts with a single step towards {topic}.",
      "Finding the beauty in {topic}.",
      "Never let anyone dull your {topic}.",
      "Dream big, work hard, and focus on {topic}.",
      "Growth happens outside your comfort zone, especially with {topic}."
    ],
    professional: [
      "Excited to share our latest update regarding {topic}.",
      "Reflecting on the impact of {topic} in our industry.",
      "Behind the scenes of our {topic} process.",
      "We're thrilled to announce a new milestone in {topic}.",
      "Innovation starts with a solid foundation in {topic}."
    ],
    short: [
      "{topic} vibes.",
      "All about {topic}.",
      "Simply {topic}.",
      "Less talking, more {topic}.",
      "{topic} mode: ON."
    ],
    questions: [
      "What are your thoughts on {topic}?",
      "Have you ever experienced {topic} like this?",
      "Drop a comment if you agree with this {topic}!",
      "If you could describe {topic} in one word, what would it be?",
      "Who else is obsessed with {topic}?"
    ]
  };

  function generateCaption(topic, tone, emojiPref, tagPref) {
    // Basic topic extraction
    let displayTopic = topic.trim();
    if(displayTopic.length > 30) {
      displayTopic = "this vibe";
    } else {
      displayTopic = displayTopic.toLowerCase();
    }

    // Select templates
    const pool = templates[tone] || templates.casual;
    let caption = getRandom(pool).replace('{topic}', displayTopic);
    
    // Add emojis
    if (emojiPref === 'yes') {
      caption += ' ' + getRandom(genericEmojis, 3).join('');
    } else if (emojiPref === 'few') {
      caption += ' ' + getRandom(genericEmojis, 1);
    }

    // Add hashtags
    if (tagPref === 'yes') {
      const keywords = getKeywords(topic);
      const defaultTags = ['#instagood', '#photooftheday', '#lifestyle', '#explore'];
      const combined = [...keywords.map(k => '#' + k), ...getRandom(defaultTags, 2)];
      caption += '\n\n' + combined.join(' ');
    }

    // Capitalize first letter
    caption = caption.charAt(0).toUpperCase() + caption.slice(1);
    return caption;
  }

  function handleGenerate() {
    const topic = elements.topic.value;
    if (!topic) {
      alert("Please tell us what your post is about.");
      elements.topic.focus();
      return;
    }

    elements.btn.innerHTML = `<span class="loading-spinner"></span> Generating...`;
    elements.btn.disabled = true;

    // Simulate small delay for UX
    setTimeout(() => {
      const tone = elements.tone.value;
      const emojiPref = elements.emojis.value;
      const tagPref = elements.hashtags.value;

      elements.results.innerHTML = '';

      for (let i = 0; i < 3; i++) {
        const caption = generateCaption(topic, tone, emojiPref, tagPref);
        
        const card = document.createElement('div');
        card.className = 'glass-panel';
        card.style.padding = '1.25rem';
        card.style.position = 'relative';
        
        const textEl = document.createElement('div');
        textEl.style.whiteSpace = 'pre-wrap';
        textEl.style.lineHeight = '1.5';
        textEl.textContent = caption;

        const copyBtn = document.createElement('button');
        copyBtn.className = 'action-btn secondary-btn';
        copyBtn.style.position = 'absolute';
        copyBtn.style.top = '1rem';
        copyBtn.style.right = '1rem';
        copyBtn.style.padding = '0.4rem 0.8rem';
        copyBtn.style.fontSize = '0.8rem';
        copyBtn.textContent = 'Copy';
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(caption);
          copyBtn.textContent = 'Copied!';
          copyBtn.style.background = 'rgba(16, 185, 129, 0.2)';
          copyBtn.style.color = '#10b981';
          setTimeout(() => {
            copyBtn.textContent = 'Copy';
            copyBtn.style.background = '';
            copyBtn.style.color = '';
          }, 2000);
        };

        card.appendChild(copyBtn);
        card.appendChild(textEl);
        elements.results.appendChild(card);
      }

      elements.btn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg> Generate More`;
      elements.btn.disabled = false;
    }, 600);
  }

  elements.btn.addEventListener('click', handleGenerate);
});
