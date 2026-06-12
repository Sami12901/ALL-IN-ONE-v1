document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    topic: document.getElementById('topic'),
    type: document.getElementById('type'),
    tone: document.getElementById('tone'),
    emojis: document.getElementById('emojis'),
    cta: document.getElementById('cta'),
    btn: document.getElementById('generate-btn'),
    results: document.getElementById('results-container')
  };

  const genericEmojis = ['✨', '🚀', '💡', '🔥', '🙌', '🌟', '👇', '🎯', '📢', '💬'];

  function getRandom(arr, count = 1) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return count === 1 ? shuffled[0] : shuffled.slice(0, count);
  }

  const templates = {
    general: {
      casual: [
        "Hey everyone! Just wanted to share some thoughts on {topic}.",
        "Spending some time today thinking about {topic}.",
        "Can we just talk about {topic} for a second?",
        "Life update: currently completely focused on {topic}.",
        "Anyone else dealing with {topic} lately?"
      ],
      funny: [
        "If you see me talking to myself, I'm just figuring out {topic}.",
        "My brain: 90% {topic}, 10% trying to remember why I walked into this room.",
        "They say money can't buy happiness, but it can buy {topic}, which is pretty close.",
        "I'm not saying I'm an expert on {topic}, but I did stay at a Holiday Inn Express last night.",
        "Me trying to understand {topic}: 🤯"
      ],
      professional: [
        "I've been reflecting on the importance of {topic} recently.",
        "A key element of success in today's world is understanding {topic}.",
        "Sharing some insights today regarding {topic}.",
        "When we focus on {topic}, the results speak for themselves.",
        "Continuous learning is essential. Currently exploring {topic}."
      ],
      emotional: [
        "Feeling incredibly grateful for {topic} today.",
        "Sometimes {topic} hits you right in the feels.",
        "Looking back, {topic} has completely changed my perspective.",
        "There's something deeply moving about {topic}.",
        "Just a reminder that {topic} matters more than we realize."
      ],
      engaging: [
        "I need your opinions! What are your thoughts on {topic}?",
        "Let's settle a debate regarding {topic}...",
        "If you could change one thing about {topic}, what would it be?",
        "Fill in the blank: {topic} is absolutely _______.",
        "Who else agrees that {topic} is incredibly important?"
      ]
    },
    business: {
      casual: [
        "We're so excited to bring you the latest on {topic}!",
        "Our team has been working hard on {topic}.",
        "You asked, we delivered! Let's talk about {topic}.",
        "Behind the scenes look at {topic} today.",
        "Here's why we absolutely love {topic}."
      ],
      professional: [
        "We are pleased to announce our latest developments regarding {topic}.",
        "Delivering excellence through our focus on {topic}.",
        "Our commitment to {topic} remains stronger than ever.",
        "Discover how {topic} can transform your workflow today.",
        "Industry insights: The future of {topic}."
      ],
      engaging: [
        "How has {topic} impacted your business?",
        "We want to hear from our customers! Tell us about your experience with {topic}.",
        "What's your biggest challenge when it comes to {topic}?",
        "Rate our new {topic} from 1 to 10!",
        "Tag someone who would love {topic}!"
      ]
    },
    event: {
      casual: [
        "Mark your calendars! We're doing something huge with {topic}!",
        "You won't want to miss our upcoming {topic} event.",
        "Get ready for an amazing time focused on {topic}.",
        "Who's joining us for {topic} next week?",
        "Countdown to {topic} starts now!"
      ],
      professional: [
        "Join us for an exclusive event centered around {topic}.",
        "We cordially invite you to our upcoming showcase on {topic}.",
        "Save the date: Our annual {topic} conference is approaching.",
        "Don't miss the opportunity to learn about {topic} from industry leaders.",
        "Register now for our upcoming webinar on {topic}."
      ]
    },
    question: {
      casual: [
        "Quick question: how do you feel about {topic}?",
        "Help me out here – what's the best way to handle {topic}?",
        "Does anyone else struggle with {topic}?",
        "What's your favorite thing about {topic}?"
      ],
      engaging: [
        "Poll time! Are you Team A or Team B when it comes to {topic}?",
        "I need recommendations for {topic}. Go!",
        "What's the best advice you've ever received regarding {topic}?",
        "If you had to choose only one aspect of {topic}, what would it be?"
      ]
    }
  };

  const ctas = [
    "Drop a comment below and let me know!",
    "Click the link in our bio to learn more.",
    "Send us a message if you want the details.",
    "Share this post with someone who needs to see it.",
    "Don't forget to like and follow for more updates like this."
  ];

  function generatePost(topic, type, tone, emojiPref, ctaPref) {
    let displayTopic = topic.trim();
    if(displayTopic.length > 50) {
      displayTopic = "this exciting update";
    }

    // Select templates (fallback to general/casual if specific combo doesn't exist)
    const typePool = templates[type] || templates.general;
    const tonePool = typePool[tone] || templates.general.casual;
    
    let post = getRandom(tonePool).replace('{topic}', displayTopic);
    
    // Add extra meat to the post
    if(type === 'business' || type === 'event') {
      post += "\n\nWe've put a lot of thought and effort into making sure this provides the best possible value. Stay tuned for more details!";
    } else if (tone === 'emotional' || tone === 'professional') {
      post += "\n\nIt's moments like these that remind us to pause and reflect on what truly matters in our journey.";
    }

    // Add CTA
    if (ctaPref === 'yes') {
      post += '\n\n' + getRandom(ctas);
    }

    // Add emojis
    if (emojiPref === 'yes') {
      post = getRandom(genericEmojis, 1) + ' ' + post + ' ' + getRandom(genericEmojis, 2).join('');
    } else if (emojiPref === 'few') {
      post += ' ' + getRandom(genericEmojis, 1);
    }

    // Capitalize first letter
    post = post.charAt(0).toUpperCase() + post.slice(1);
    return post;
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

    setTimeout(() => {
      const type = elements.type.value;
      const tone = elements.tone.value;
      const emojiPref = elements.emojis.value;
      const ctaPref = elements.cta.value;

      elements.results.innerHTML = '';

      for (let i = 0; i < 3; i++) {
        const post = generatePost(topic, type, tone, emojiPref, ctaPref);
        
        const card = document.createElement('div');
        card.className = 'glass-panel';
        card.style.padding = '1.25rem';
        card.style.position = 'relative';
        
        const textEl = document.createElement('div');
        textEl.style.whiteSpace = 'pre-wrap';
        textEl.style.lineHeight = '1.5';
        textEl.textContent = post;

        const copyBtn = document.createElement('button');
        copyBtn.className = 'action-btn secondary-btn';
        copyBtn.style.position = 'absolute';
        copyBtn.style.top = '1rem';
        copyBtn.style.right = '1rem';
        copyBtn.style.padding = '0.4rem 0.8rem';
        copyBtn.style.fontSize = '0.8rem';
        copyBtn.textContent = 'Copy';
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(post);
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
