// Email Subject Line Tester & Grader
// Client-side subject performance, spam detection, and inbox truncation simulator

document.addEventListener('DOMContentLoaded', () => {
  // Inputs
  const inputSubject = document.getElementById('input-subject');
  const inputSender = document.getElementById('input-sender');
  const inputPreheader = document.getElementById('input-preheader');
  const charWordIndicator = document.getElementById('char-word-indicator');

  // Device previews
  const prevIosSender = document.getElementById('prev-ios-sender');
  const prevIosSubject = document.getElementById('prev-ios-subject');
  const prevIosPreheader = document.getElementById('prev-ios-preheader');

  const prevAndroidSender = document.getElementById('prev-android-sender');
  const prevAndroidSubject = document.getElementById('prev-android-subject');
  const prevAndroidPreheader = document.getElementById('prev-android-preheader');

  const prevDesktopSender = document.getElementById('prev-desktop-sender');
  const prevDesktopSubject = document.getElementById('prev-desktop-subject');
  const prevDesktopPreheader = document.getElementById('prev-desktop-preheader');

  // Hero Score
  const gradeScore = document.getElementById('grade-score');
  const gradeLetter = document.getElementById('grade-letter');
  const gradeSummary = document.getElementById('grade-summary');
  const gradeAdvice = document.getElementById('grade-advice');

  // Trigger words boxes
  const boxSpamWords = document.getElementById('box-spam-words');
  const boxUrgencyWords = document.getElementById('box-urgency-words');
  const boxPowerWords = document.getElementById('box-power-words');

  // Stats
  const valSentiment = document.getElementById('val-sentiment');
  const valEmojis = document.getElementById('val-emojis');
  const valNumbers = document.getElementById('val-numbers');

  // Checklist
  const descCharLen = document.getElementById('desc-char-len');
  const pillCharLen = document.getElementById('pill-char-len');

  const descWordCnt = document.getElementById('desc-word-cnt');
  const pillWordCnt = document.getElementById('pill-word-cnt');

  const descSpamFilter = document.getElementById('desc-spam-filter');
  const pillSpamFilter = document.getElementById('pill-spam-filter');

  const descCapsFilter = document.getElementById('desc-caps-filter');
  const pillCapsFilter = document.getElementById('pill-caps-filter');

  const descUrgencyFilter = document.getElementById('desc-urgency-filter');
  const pillUrgencyFilter = document.getElementById('pill-urgency-filter');

  const descPunctFilter = document.getElementById('desc-punct-filter');
  const pillPunctFilter = document.getElementById('pill-punct-filter');

  // Presets
  const presetButtons = document.querySelectorAll('.preset-chip[data-preset]');

  const PRESETS = {
    ecommerce: {
      subject: 'Flash Sale: 40% off your favorites ends tonight ⏳',
      sender: 'Luxe Apparel',
      preheader: 'Use code FLASH40 at checkout before midnight.'
    },
    b2b: {
      subject: 'Introducing Workspace 2.0: Speed up team velocity 🚀',
      sender: 'Acme SaaS',
      preheader: 'See the live benchmark tests and product tour.'
    },
    newsletter: {
      subject: 'The 5 habits of top 1% software creators',
      sender: 'Tech Insights Weekly',
      preheader: 'Plus: The biggest AI announcements you missed this week.'
    },
    reengage: {
      subject: 'We miss you! Here is a special welcome-back gift 🎁',
      sender: 'CloudPlatform',
      preheader: 'Claim your complimentary cloud storage credits today.'
    },
    spammy: {
      subject: 'URGENT: YOU HAVE WON $1,000 CASH PRIZE! CLICK HERE FREE 100%',
      sender: 'Prize Notification Dept',
      preheader: 'Guaranteed payout! No credit check required! Act now!'
    }
  };

  // 100+ SPAM TRIGGER PHRASES & WORDS
  const SPAM_TRIGGERS = [
    'free', '100% free', '100% satisfied', 'act now', 'apply now', 'as seen on',
    'bargain', 'best price', 'big bucks', 'billion', 'bonus', 'buy direct',
    'call now', 'cancel at any time', 'cash', 'cash bonus', 'cash prize',
    'certified', 'cheap', 'claims', 'clearance', 'click here', 'click below',
    'compare rates', 'congratulations', 'credit card offers', 'cures', 'dear friend',
    'direct email', 'direct marketing', 'discount', 'double your income', 'earn cash',
    'earn money', 'eliminate debt', 'exclusive deal', 'expect to earn', 'extra income',
    'fantastic deal', 'financial freedom', 'for free', 'free access', 'free consultation',
    'free gift', 'free info', 'free membership', 'free sample', 'free trial',
    'full refund', 'get out of debt', 'get paid', 'give it away', 'great offer',
    'guarantee', 'guaranteed', 'hidden assets', 'increase sales', 'incredible deal',
    'instant', 'investment', 'join millions', 'lifetime', 'limited time offer',
    'loans', 'lowest price', 'make money', 'million dollars', 'miracle',
    'money back', 'mortgage', 'multi-level marketing', 'name brand', 'no catch',
    'no cost', 'no credit check', 'no experience', 'no fees', 'no gimmick',
    'no hidden costs', 'no interest', 'no investment', 'no obligation',
    'no purchase necessary', 'no risk', 'no strings attached', 'not spam',
    'once in a lifetime', 'one hundred percent', 'one time', 'online pharmacy',
    'open immediately', 'order now', 'passwords', 'pennies a day', 'potential earnings',
    'prize', 'promise', 'pure profit', 'refinance', 'refund', 'reverse aging',
    'risk free', 'save big', 'save up to', 'security', 'see for yourself',
    'serious cash', 'special promotion', 'stop snoring', 'success', 'take action',
    'terms and conditions', 'the best rates', 'this isn\'t spam', 'unbelievable',
    'unlimited', 'unsecured credit', 'urgent', 'urgent response', 'vacation',
    'valued customer', 'warranty', 'weight loss', 'while supplies last', 'win',
    'winner', 'winning', 'wire transfer', 'you have been selected', 'you\'ve been chosen'
  ];

  // URGENCY TRIGGERS
  const URGENCY_TRIGGERS = [
    'limited', 'today only', 'last chance', 'expiring', 'hurry', 'deadline',
    'now', 'don\'t miss', 'ending soon', 'hours left', 'final hours', 'quick',
    'rapid', 'instant', 'flash sale', 'clock is ticking', 'almost gone',
    'final call', 'tonight', 'urgent', 'closing soon', 'last day'
  ];

  // POWER & EMOTION WORDS
  const POWER_WORDS = [
    'exclusive', 'insider', 'secret', 'proven', 'boost', 'unlock', 'transform',
    'essential', 'discover', 'guide', 'blueprint', 'ultimate', 'masterclass',
    'breakthrough', 'new', 'simple', 'genius', 'astonishing', 'mind-blowing',
    'rare', 'unveiled', 'steal', 'strategies', 'hacks', 'supercharge', 'effortless',
    'revenue', 'growth', 'mastery', 'revealed', 'insights', 'step-by-step'
  ];

  // SENTIMENT DICTIONARIES
  const POSITIVE_WORDS = ['love', 'great', 'fantastic', 'best', 'amazing', 'happy', 'favorite', 'brilliant', 'wonderful', 'good', 'super', 'delight', 'win', 'unlock', 'boost', 'celebrate'];
  const NEGATIVE_WORDS = ['bad', 'worst', 'fail', 'warning', 'error', 'stop', 'miss', 'avoid', 'never', 'problem', 'danger', 'mistake', 'alert', 'crisis', 'risk'];

  /**
   * Main evaluation logic
   */
  function evaluateSubjectLine() {
    const rawSubject = inputSubject.value.trim();
    const sender = inputSender.value.trim() || 'Sender Name';
    const preheader = inputPreheader.value.trim() || 'Email preview snippet...';

    // Update previews
    prevIosSender.textContent = sender;
    prevIosSubject.textContent = rawSubject || 'Your Subject Line...';
    prevIosPreheader.textContent = preheader;

    prevAndroidSender.textContent = sender;
    prevAndroidSubject.textContent = rawSubject || 'Your Subject Line...';
    prevAndroidPreheader.textContent = preheader;

    prevDesktopSender.textContent = sender;
    prevDesktopSubject.textContent = rawSubject || 'Subject Line';
    prevDesktopPreheader.textContent = preheader;

    const charCount = rawSubject.length;
    const words = rawSubject ? rawSubject.split(/\s+/).filter(w => w.length > 0) : [];
    const wordCount = words.length;

    charWordIndicator.textContent = `${charCount} chars | ${wordCount} words`;

    if (!rawSubject) {
      gradeScore.textContent = '0';
      gradeLetter.textContent = 'F';
      gradeSummary.textContent = 'Awaiting input...';
      gradeAdvice.textContent = 'Type a subject line to compute performance scores.';
      boxSpamWords.innerHTML = '<span style="font-size: 0.8rem; color: var(--text-tertiary);">None detected</span>';
      boxUrgencyWords.innerHTML = '<span style="font-size: 0.8rem; color: var(--text-tertiary);">None detected</span>';
      boxPowerWords.innerHTML = '<span style="font-size: 0.8rem; color: var(--text-tertiary);">None detected</span>';
      valSentiment.textContent = 'Neutral';
      valEmojis.textContent = '0';
      valNumbers.textContent = 'None';

      descCharLen.textContent = 'Current: 0 chars';
      pillCharLen.textContent = 'Too Short';
      pillCharLen.className = 'status-pill status-warn';

      descWordCnt.textContent = 'Current: 0 words';
      pillWordCnt.textContent = 'Too Short';
      pillWordCnt.className = 'status-pill status-warn';
      return;
    }

    const lowerSubject = rawSubject.toLowerCase();

    // 1. Detect Spam Triggers
    const foundSpam = [];
    SPAM_TRIGGERS.forEach(trigger => {
      const reg = new RegExp(`\\b${trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (reg.test(lowerSubject)) {
        foundSpam.push(trigger);
      }
    });

    // 2. Detect Urgency Triggers
    const foundUrgency = [];
    URGENCY_TRIGGERS.forEach(trigger => {
      const reg = new RegExp(`\\b${trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (reg.test(lowerSubject)) {
        foundUrgency.push(trigger);
      }
    });

    // 3. Detect Power Words
    const foundPower = [];
    POWER_WORDS.forEach(word => {
      const reg = new RegExp(`\\b${word}\\b`, 'i');
      if (reg.test(lowerSubject)) {
        foundPower.push(word);
      }
    });

    // 4. Emojis
    const emojiRegex = /[\p{Extended_Pictographic}]/u;
    const allEmojis = Array.from(rawSubject).filter(char => emojiRegex.test(char));
    const emojiCount = allEmojis.length;
    valEmojis.textContent = emojiCount;

    // 5. Numbers
    const hasNumbers = /\d+/.test(rawSubject);
    valNumbers.textContent = hasNumbers ? 'Present (Good)' : 'None';

    // 6. ALL CAPS Check
    const upperWords = words.filter(w => w.length > 2 && w === w.toUpperCase() && /[A-Z]/.test(w));
    const isShouting = upperWords.length >= 2 || (words.length > 0 && upperWords.length / words.length > 0.4);

    // 7. Punctuation
    const exclamationCount = (rawSubject.match(/!/g) || []).length;
    const hasQuestion = rawSubject.includes('?');

    // 8. Sentiment
    let positiveCount = 0;
    let negativeCount = 0;
    words.forEach(w => {
      const clean = w.toLowerCase().replace(/[^a-z]/g, '');
      if (POSITIVE_WORDS.includes(clean)) positiveCount++;
      if (NEGATIVE_WORDS.includes(clean)) negativeCount++;
    });

    let sentimentLabel = 'Neutral';
    if (positiveCount > negativeCount) sentimentLabel = 'Positive 😊';
    else if (negativeCount > positiveCount) sentimentLabel = 'Urgent / Negative ⚠️';
    valSentiment.textContent = sentimentLabel;

    // SCORING ALGORITHM
    let score = 50; // Base score

    // Character length scoring (30 - 50 ideal)
    if (charCount >= 30 && charCount <= 50) {
      score += 20;
      descCharLen.textContent = `${charCount} chars — Sweet spot (30–50 chars)`;
      pillCharLen.textContent = 'Optimal';
      pillCharLen.className = 'status-pill status-pass';
    } else if ((charCount >= 20 && charCount < 30) || (charCount > 50 && charCount <= 60)) {
      score += 10;
      descCharLen.textContent = `${charCount} chars — Acceptable length`;
      pillCharLen.textContent = 'Acceptable';
      pillCharLen.className = 'status-pill status-warn';
    } else if (charCount < 20) {
      score -= 5;
      descCharLen.textContent = `${charCount} chars — Too short, lacks context`;
      pillCharLen.textContent = 'Too Short';
      pillCharLen.className = 'status-pill status-fail';
    } else {
      score -= 10;
      descCharLen.textContent = `${charCount} chars — Truncates on mobile devices`;
      pillCharLen.textContent = 'Too Long';
      pillCharLen.className = 'status-pill status-fail';
    }

    // Word count scoring (4 - 7 ideal)
    if (wordCount >= 4 && wordCount <= 7) {
      score += 15;
      descWordCnt.textContent = `${wordCount} words — Ideal scanning length`;
      pillWordCnt.textContent = 'Optimal';
      pillWordCnt.className = 'status-pill status-pass';
    } else if (wordCount === 3 || (wordCount >= 8 && wordCount <= 9)) {
      score += 8;
      descWordCnt.textContent = `${wordCount} words — Adequate`;
      pillWordCnt.textContent = 'Acceptable';
      pillWordCnt.className = 'status-pill status-warn';
    } else {
      score -= 5;
      descWordCnt.textContent = `${wordCount} words — Sub-optimal length`;
      pillWordCnt.textContent = 'Review';
      pillWordCnt.className = 'status-pill status-fail';
    }

    // Spam Penalties
    if (foundSpam.length === 0) {
      score += 10;
      descSpamFilter.textContent = 'Zero spam triggers identified';
      pillSpamFilter.textContent = 'Pass';
      pillSpamFilter.className = 'status-pill status-pass';
    } else {
      score -= (foundSpam.length * 15);
      descSpamFilter.textContent = `Flagged: ${foundSpam.slice(0, 3).join(', ')}`;
      pillSpamFilter.textContent = `${foundSpam.length} Spam Words`;
      pillSpamFilter.className = 'status-pill status-fail';
    }

    // All Caps Check
    if (isShouting) {
      score -= 20;
      descCapsFilter.textContent = 'Excessive ALL CAPS detected (triggers spam filters)';
      pillCapsFilter.textContent = 'Spam Risk';
      pillCapsFilter.className = 'status-pill status-fail';
    } else {
      score += 5;
      descCapsFilter.textContent = 'Proper casing';
      pillCapsFilter.textContent = 'Pass';
      pillCapsFilter.className = 'status-pill status-pass';
    }

    // Urgency & Power words bonus
    if (foundUrgency.length > 0 || foundPower.length > 0) {
      score += 10;
      descUrgencyFilter.textContent = 'Contains motivating action triggers';
      pillUrgencyFilter.textContent = 'High Impact';
      pillUrgencyFilter.className = 'status-pill status-pass';
    } else {
      descUrgencyFilter.textContent = 'Neutral tone, lacks emotional hook';
      pillUrgencyFilter.textContent = 'Neutral';
      pillUrgencyFilter.className = 'status-pill status-warn';
    }

    // Emojis bonus/penalty
    if (emojiCount === 1 || emojiCount === 2) {
      score += 5; // proven to boost open rates
    } else if (emojiCount > 3) {
      score -= 10; // spam risk
    }

    // Number presence bonus
    if (hasNumbers) {
      score += 5;
    }

    // Question mark curiosity
    if (hasQuestion) {
      score += 5;
    }

    // Multiple exclamation marks penalty
    if (exclamationCount > 1) {
      score -= 12;
      descPunctFilter.textContent = 'Multiple exclamation marks trigger spam filters';
      pillPunctFilter.textContent = 'Avoid !!';
      pillPunctFilter.className = 'status-pill status-fail';
    } else {
      descPunctFilter.textContent = 'Balanced punctuation';
      pillPunctFilter.textContent = 'Pass';
      pillPunctFilter.className = 'status-pill status-pass';
    }

    // Final score clamp 0 - 100
    const finalScore = Math.max(5, Math.min(100, Math.round(score)));
    gradeScore.textContent = finalScore;

    // Grade Letter assignment
    let letter = 'F';
    let summaryText = 'Poor Performance';
    let adviceText = 'Significant revisions needed. Shorten length, remove spam triggers, and add clear value.';

    if (finalScore >= 93) {
      letter = 'A+';
      summaryText = 'Outstanding Subject Line!';
      adviceText = 'Exceptional length, high psychological appeal, and zero spam risk. Ready to send.';
    } else if (finalScore >= 85) {
      letter = 'A';
      summaryText = 'High Performing';
      adviceText = 'Strong open rate potential. Well-balanced character count and engaging wording.';
    } else if (finalScore >= 75) {
      letter = 'B';
      summaryText = 'Good / Above Average';
      adviceText = 'Solid subject line. Consider adding a power word or testing an emoji.';
    } else if (finalScore >= 60) {
      letter = 'C';
      summaryText = 'Average Potential';
      adviceText = 'Fair, but room for improvement. Optimize length to 35-45 characters.';
    } else if (finalScore >= 45) {
      letter = 'D';
      summaryText = 'Below Average';
      adviceText = 'High risk of mobile truncation or low subscriber engagement.';
    }

    gradeLetter.textContent = letter;
    gradeSummary.textContent = `${letter} — ${summaryText}`;
    gradeAdvice.textContent = adviceText;

    // Render Tag Bubbles
    renderTags(boxSpamWords, foundSpam, 'tag-spam', '&#10004; Zero spam triggers detected', 'var(--success)');
    renderTags(boxUrgencyWords, foundUrgency, 'tag-urgency', 'No urgency triggers found', 'var(--text-tertiary)');
    renderTags(boxPowerWords, foundPower, 'tag-power', 'No power words found', 'var(--text-tertiary)');
  }

  function renderTags(container, list, tagClass, emptyMsg, emptyColor) {
    if (list.length === 0) {
      container.innerHTML = `<span style="font-size: 0.8rem; color: ${emptyColor};">${emptyMsg}</span>`;
      return;
    }
    container.innerHTML = list.map(item => `<span class="tag-bubble ${tagClass}">${escapeHtml(item)}</span>`).join('');
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Event Listeners
  inputSubject.addEventListener('input', evaluateSubjectLine);
  inputSender.addEventListener('input', evaluateSubjectLine);
  inputPreheader.addEventListener('input', evaluateSubjectLine);

  // Preset Handlers
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.preset;
      const data = PRESETS[key];
      if (data) {
        inputSubject.value = data.subject;
        inputSender.value = data.sender;
        inputPreheader.value = data.preheader;
        evaluateSubjectLine();
      }
    });
  });

  // Default Init
  const defaultPreset = PRESETS.ecommerce;
  inputSubject.value = defaultPreset.subject;
  inputSender.value = defaultPreset.sender;
  inputPreheader.value = defaultPreset.preheader;
  evaluateSubjectLine();
});