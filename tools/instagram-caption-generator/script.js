// Instagram Caption Generator Logic

class CaptionGenerator {
  constructor() {
    this.topicInput = document.getElementById('topic');
    this.toneSelect = document.getElementById('tone');
    this.emojiCheck = document.getElementById('include-emojis');
    this.hashtagCheck = document.getElementById('include-hashtags');
    this.generateBtn = document.getElementById('generate-btn');
    this.resultsContainer = document.getElementById('results-container');
    this.loader = document.getElementById('loader');
    this.aiStatus = document.getElementById('ai-status');

    this.hasAI = false;
    this.checkAIStatus();

    this.generateBtn.addEventListener('click', () => this.handleGenerate());
  }

  async checkAIStatus() {
    if (window.ai && window.ai.canCreateTextSession) {
      try {
        const state = await window.ai.canCreateTextSession();
        if (state === 'readily' || state === 'after-download') {
          this.hasAI = true;
          this.aiStatus.innerHTML = '<span style="color: #4ade80;">●</span> Powered by Chrome Built-in AI';
        } else {
          this.aiStatus.innerHTML = 'Running locally via Algorithmic Engine';
        }
      } catch (e) {
        this.aiStatus.innerHTML = 'Running locally via Algorithmic Engine';
      }
    } else {
      this.aiStatus.innerHTML = 'Running locally via Algorithmic Engine';
    }
  }

  async handleGenerate() {
    const topic = this.topicInput.value.trim();
    if (!topic) {
      alert("Please enter a topic for your post.");
      return;
    }

    // UI Loading state
    this.generateBtn.disabled = true;
    this.generateBtn.style.opacity = '0.5';
    this.resultsContainer.style.display = 'none';
    this.loader.style.display = 'flex';

    const tone = this.toneSelect.value;
    const useEmojis = this.emojiCheck.checked;
    const useHashtags = this.hashtagCheck.checked;

    try {
      let captions = [];
      if (this.hasAI) {
        captions = await this.generateWithAI(topic, tone, useEmojis, useHashtags);
      } else {
        captions = this.generateWithHeuristics(topic, tone, useEmojis, useHashtags);
      }
      this.renderCaptions(captions);
    } catch (error) {
      console.error(error);
      alert("An error occurred during generation.");
    } finally {
      this.generateBtn.disabled = false;
      this.generateBtn.style.opacity = '1';
      this.loader.style.display = 'none';
      this.resultsContainer.style.display = 'flex';
    }
  }

  async generateWithAI(topic, tone, emojis, hashtags) {
    const session = await window.ai.createTextSession();
    const prompt = `Write 3 different Instagram captions for the following topic: "${topic}". 
The tone should be ${tone}. 
${emojis ? 'Include relevant emojis.' : 'Do NOT use emojis.'} 
${hashtags ? 'Include 5 relevant hashtags at the end of each caption.' : 'Do NOT include hashtags.'}
Format the output by separating each caption with three dashes "---". Do not include numbering or intro text.`;
    
    const result = await session.prompt(prompt);
    session.destroy();
    
    // Parse result
    return result.split('---').map(c => c.trim()).filter(c => c.length > 0).slice(0, 3);
  }

  generateWithHeuristics(topic, tone, emojis, hashtags) {
    // Algorithmic Fallback Engine
    const data = {
      aesthetic: {
        hooks: ["romanticizing my life.", "less bitter, more glitter.", "sunday state of mind.", "in my own lane."],
        bodies: [
          `Just thinking about ${topic}.`, 
          `Finding peace in the little things, especially ${topic}.`, 
          `${topic} hits different today.`, 
          `Currently obsessing over ${topic}.`
        ],
        ctas: ["what's your vibe today?", "save this for later.", "let me know your thoughts.", ""],
        emojis: ["✨", "☁️", "🤍", "☕", "🕊️"],
        tags: ["#aesthetic", "#minimal", "#vibes", "#romanticizeyourlife"]
      },
      inspirational: {
        hooks: ["Growth is a journey, not a destination.", "Believe in the process.", "Your only limit is you.", "Step into your power."],
        bodies: [
          `Today I was reflecting on ${topic} and realized how far I've come.`,
          `Don't let anyone tell you that you can't achieve your dreams. Especially when it comes to ${topic}.`,
          `Embracing every challenge today. ${topic} taught me exactly that.`,
          `Keep pushing forward. ${topic} is proof that hard work pays off.`
        ],
        ctas: ["Double tap if you agree!", "Tag someone who needs to hear this.", "What's your biggest goal right now?", "Drop a ❤️ if you are on the same path."],
        emojis: ["🚀", "🌱", "💪", "🌟", "🔥"],
        tags: ["#inspiration", "#growthmindset", "#motivation", "#keepgoing"]
      },
      funny: {
        hooks: ["I have no idea what I'm doing.", "Reality check: failed.", "My life is a comedy show.", "Send help (and coffee)."],
        bodies: [
          `So ${topic} happened, and honestly, I'm just trying to survive.`,
          `If you ever feel bad about yourself, just remember my experience with ${topic}.`,
          `Me: I'm going to be so productive today. Also me: Spends 3 hours on ${topic}.`,
          `They say do what you love. I love ${topic}, but it doesn't love me back.`
        ],
        ctas: ["Can anyone relate?", "Tag a friend who is exactly like this.", "Tell me I'm not alone.", "Leave a 😂 if this is you."],
        emojis: ["😂", "💀", "🥴", "🤦‍♀️", "🤪"],
        tags: ["#relatable", "#funny", "#lol", "#truestory"]
      },
      sales: {
        hooks: ["🚨 BIG NEWS!", "You asked, we listened.", "Ready to level up?", "Stop scrolling!"],
        bodies: [
          `We are so excited to announce ${topic}. This has been in the works for months!`,
          `If you've been struggling with your goals, ${topic} is exactly what you need.`,
          `Don't miss out on ${topic}. Our community is absolutely loving it.`,
          `The secret is finally out. ${topic} is here to change the game.`
        ],
        ctas: ["Link in bio to shop now!", "DM us 'READY' to get started.", "Click the link in our story to grab yours before they sell out.", "Comment 'YES' below for an exclusive discount code."],
        emojis: ["🛍️", "🔥", "👇", "💥", "🛒"],
        tags: ["#sale", "#newarrival", "#musthave", "#shopnow"]
      },
      casual: {
        hooks: ["Just a little life update.", "Photo dump 📸", "Hey friends!", "Weekend recap."],
        bodies: [
          `Spent some time on ${topic} today and it was honestly just what I needed.`,
          `Nothing crazy, just enjoying ${topic} and taking it easy.`,
          `Here is a little sneak peek into my life lately: lots of ${topic}.`,
          `Just popping in to share my thoughts on ${topic}. Hope everyone is having a great day!`
        ],
        ctas: ["How was your day?", "What are you up to this weekend?", "Say hi in the comments!", "Let's catch up!"],
        emojis: ["👋", "🥰", "☀️", "✌️", "💛"],
        tags: ["#casual", "#lifeupdate", "#photodump", "#dailyvlog"]
      }
    };

    const dict = data[tone] || data.casual;
    
    // Helper to get random item
    const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const rndSubset = (arr, n) => arr.sort(() => 0.5 - Math.random()).slice(0, n);

    let results = [];
    for (let i = 0; i < 3; i++) {
      let caption = `\${rnd(dict.hooks)} \${rnd(dict.bodies)}`;
      
      const cta = rnd(dict.ctas);
      if (cta) caption += `\\n\\n\${cta}`;

      if (emojis) {
        // Sprinkle 1-2 emojis randomly or at end
        caption += ` \${rndSubset(dict.emojis, 2).join('')}`;
      }

      if (hashtags) {
        // Append hash tags
        const topicHash = "#" + topic.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
        const selectedTags = rndSubset(dict.tags, 3);
        caption += `\\n\\n\${topicHash} \${selectedTags.join(' ')}`;
      }
      
      results.push(caption);
    }
    
    return results;
  }

  renderCaptions(captions) {
    this.resultsContainer.innerHTML = '';
    
    if (!captions || captions.length === 0) {
      this.resultsContainer.innerHTML = '<div style="text-align: center; color: var(--muted);">Failed to generate captions.</div>';
      return;
    }

    captions.forEach((cap) => {
      const card = document.createElement('div');
      card.className = 'caption-card';
      card.textContent = cap;
      
      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-btn';
      copyBtn.textContent = 'Copy';
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(cap);
        copyBtn.textContent = 'Copied!';
        copyBtn.style.background = 'var(--accent)';
        copyBtn.style.color = 'var(--bg)';
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.style.background = 'var(--surface)';
          copyBtn.style.color = 'var(--text)';
        }, 2000);
      };
      
      card.appendChild(copyBtn);
      this.resultsContainer.appendChild(card);
    });
  }
}

// Init immediately (module is deferred)
window.captionGenerator = new CaptionGenerator();
