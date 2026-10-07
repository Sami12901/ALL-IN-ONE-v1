// Voice to Typing Trainer - Speech Synthesis Dictation & Comprehension Engine

const DICTATION_PASSAGES = {
  business: [
    "Revenue growth for the fourth quarter exceeded consensus forecasts by twelve percent.",
    "Cross functional stakeholder alignment remains our paramount strategic objective.",
    "Operational expenditures decreased following the enterprise migration to automated workflows.",
    "The board approved the proposed quarterly dividends during the morning session."
  ],
  medical: [
    "The patient presents with mild hypertension and bilateral lower extremity edema.",
    "Vital signs are stable with blood pressure reading one twenty over eighty.",
    "Recommend continuing regular cardiovascular monitoring and prescribing oral electrolytes.",
    "Follow up laboratory results indicate substantial recovery within normal reference intervals."
  ],
  legal: [
    "The party of the first part hereby indemnifies and holds harmless the contractor.",
    "All disputes arising under this agreement shall be submitted to binding arbitration.",
    "Neither party shall disclose confidential proprietary information without prior written consent.",
    "The jurisdiction for all governing covenants shall remain strictly within Delaware."
  ],
  tech: [
    "The distributed cluster handles horizontal scaling across multi region availability zones.",
    "Database replicas synchronize asynchronously using distributed consensus protocols.",
    "Low latency caching layers mitigate network bottlenecks during peak concurrent traffic.",
    "Container orchestrators automate continuous integration and zero downtime canary deployments."
  ],
  literature: [
    "It was a bright cold day in April and the clocks were striking thirteen.",
    "The sea was calm and dark reflecting the celestial constellation of the night sky.",
    "There are more things in heaven and earth than are dreamt of in your philosophy.",
    "All that is gold does not glitter and not all those who wander are lost."
  ]
};

class VoiceToTypingTrainer {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.currentCategory = 'business';
    this.currentRate = 1.0;
    this.currentSentenceIndex = 0;
    this.sentences = DICTATION_PASSAGES.business;

    // Telemetry & Metrics
    this.replaysCount = 0;
    this.hasPeeked = false;
    this.sentenceStartTime = null;
    this.totalTypedChars = 0;
    this.totalCorrectChars = 0;
    this.totalWordsTyped = 0;
    this.totalSeconds = 0;

    this.initDom();
    this.initVoices();
    this.bindEvents();
    this.loadCurrentSentence();
  }

  initDom() {
    this.categorySelect = document.getElementById('vtCategorySelect');
    this.voiceSelect = document.getElementById('vtVoiceSelect');
    this.waveformVisualizer = document.getElementById('waveformVisualizer');
    this.rateButtons = document.querySelectorAll('.rate-btn');
    this.playAudioBtn = document.getElementById('vtPlayAudioBtn');
    this.replayBtn = document.getElementById('vtReplayBtn');
    this.peekBtn = document.getElementById('vtPeekBtn');

    // Telemetry
    this.hudSentenceProgress = document.getElementById('hudSentenceProgress');
    this.hudAccuracy = document.getElementById('hudAccuracy');
    this.hudWpm = document.getElementById('hudWpm');
    this.hudReplays = document.getElementById('hudReplays');
    this.hudComprehension = document.getElementById('hudComprehension');

    // Typing Workspace
    this.typingInput = document.getElementById('vtTypingInput');
    this.clearBtn = document.getElementById('vtClearBtn');
    this.submitBtn = document.getElementById('vtSubmitSentenceBtn');
    this.nextBtn = document.getElementById('vtNextSentenceBtn');
    this.peekBox = document.getElementById('peekTranscriptBox');
    this.diffContainer = document.getElementById('diffContainer');
    this.diffDisplay = document.getElementById('diffDisplay');
  }

  initVoices() {
    const updateVoices = () => {
      if (!this.synth) return;
      this.voices = this.synth.getVoices();
      this.voiceSelect.innerHTML = '<option value="">Default Speech Voice</option>';

      this.voices.forEach((v, i) => {
        if (v.lang.startsWith('en')) {
          const opt = document.createElement('option');
          opt.value = i;
          opt.textContent = `${v.name} (${v.lang})`;
          this.voiceSelect.appendChild(opt);
        }
      });
    };

    updateVoices();
    if (this.synth && typeof this.synth.onvoiceschanged !== 'undefined') {
      this.synth.onvoiceschanged = updateVoices;
    }
  }

  bindEvents() {
    this.categorySelect.addEventListener('change', (e) => {
      this.currentCategory = e.target.value;
      this.sentences = DICTATION_PASSAGES[this.currentCategory] || DICTATION_PASSAGES.business;
      this.currentSentenceIndex = 0;
      this.replaysCount = 0;
      this.loadCurrentSentence();
    });

    this.rateButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.rateButtons.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentRate = parseFloat(e.currentTarget.dataset.rate);
      });
    });

    this.playAudioBtn.addEventListener('click', () => this.speakCurrentSentence());
    this.replayBtn.addEventListener('click', () => {
      this.replaysCount++;
      this.hudReplays.textContent = this.replaysCount;
      this.speakCurrentSentence();
      this.updateComprehensionScore();
    });

    this.peekBtn.addEventListener('click', () => {
      this.hasPeeked = true;
      this.peekBox.classList.toggle('revealed');
      this.updateComprehensionScore();
    });

    this.clearBtn.addEventListener('click', () => {
      this.typingInput.value = '';
      this.typingInput.focus();
    });

    this.submitBtn.addEventListener('click', () => this.submitSentence());
    this.nextBtn.addEventListener('click', () => this.nextSentence());

    this.typingInput.addEventListener('keydown', (e) => {
      if (!this.sentenceStartTime) {
        this.sentenceStartTime = performance.now();
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.submitSentence();
      }
    });
  }

  getCurrentSentence() {
    return this.sentences[this.currentSentenceIndex] || '';
  }

  loadCurrentSentence() {
    this.typingInput.value = '';
    this.sentenceStartTime = null;
    this.hasPeeked = false;
    this.peekBox.classList.remove('revealed');
    this.peekBox.textContent = this.getCurrentSentence();
    this.diffContainer.style.display = 'none';

    this.hudSentenceProgress.textContent = `${this.currentSentenceIndex + 1} / ${this.sentences.length}`;
    this.hudReplays.textContent = this.replaysCount;
  }

  speakCurrentSentence() {
    if (!this.synth) {
      alert('Web Speech Synthesis is not supported in this browser.');
      return;
    }

    this.synth.cancel(); // stop any ongoing speech

    const text = this.getCurrentSentence();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.currentRate;
    utterance.pitch = 1.0;

    const selectedVoiceIdx = this.voiceSelect.value;
    if (selectedVoiceIdx !== '' && this.voices[selectedVoiceIdx]) {
      utterance.voice = this.voices[selectedVoiceIdx];
    }

    utterance.onstart = () => {
      this.waveformVisualizer.classList.add('is-speaking');
      this.playAudioBtn.textContent = '🔊 Speaking...';
    };

    utterance.onend = () => {
      this.waveformVisualizer.classList.remove('is-speaking');
      this.playAudioBtn.textContent = '🔊 Play Audio';
      if (!this.sentenceStartTime) {
        this.sentenceStartTime = performance.now();
      }
      this.typingInput.focus();
    };

    utterance.onerror = () => {
      this.waveformVisualizer.classList.remove('is-speaking');
      this.playAudioBtn.textContent = '🔊 Play Audio';
    };

    this.synth.speak(utterance);
  }

  cleanText(str) {
    return str.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "").trim();
  }

  submitSentence() {
    const target = this.getCurrentSentence();
    const userText = this.typingInput.value.trim();

    if (!userText) {
      alert('Please type what you heard before submitting.');
      return;
    }

    const elapsedSeconds = this.sentenceStartTime ? Math.max(1, (performance.now() - this.sentenceStartTime) / 1000) : 5;
    this.totalSeconds += elapsedSeconds;

    // Calculate word-level similarity
    const targetWords = target.split(/\s+/);
    const userWords = userText.split(/\s+/);

    let matchCount = 0;
    const diffHtmlParts = [];

    const maxLen = Math.max(targetWords.length, userWords.length);
    for (let i = 0; i < maxLen; i++) {
      const tw = targetWords[i];
      const uw = userWords[i];

      if (tw && uw) {
        if (this.cleanText(tw) === this.cleanText(uw)) {
          matchCount++;
          diffHtmlParts.push(`<span class="word-match">${uw}</span>`);
        } else {
          diffHtmlParts.push(`<span class="word-mismatch">${uw}</span> <span class="word-correction">(${tw})</span>`);
        }
      } else if (tw && !uw) {
        diffHtmlParts.push(`<span class="word-correction">[missing: ${tw}]</span>`);
      } else if (!tw && uw) {
        diffHtmlParts.push(`<span class="word-mismatch">[extra: ${uw}]</span>`);
      }
    }

    const accPct = Math.round((matchCount / targetWords.length) * 100);
    this.hudAccuracy.textContent = `${accPct}%`;

    // Speed WPM
    const wpm = Math.round((userWords.length / elapsedSeconds) * 60);
    this.hudWpm.textContent = `${wpm} WPM`;

    this.updateComprehensionScore(accPct, wpm);

    // Show diff
    this.diffDisplay.innerHTML = diffHtmlParts.join(' ');
    this.diffContainer.style.display = 'block';
  }

  updateComprehensionScore(accPct = 100, wpm = 45) {
    let score = (accPct * 0.65) + (Math.min(100, wpm) * 0.35);

    // Deduct penalties for replays and peeking
    if (this.replaysCount > 0) {
      score -= (this.replaysCount * 4);
    }
    if (this.hasPeeked) {
      score -= 15;
    }

    const finalScore = Math.max(10, Math.min(100, Math.round(score)));
    this.hudComprehension.textContent = `${finalScore} / 100`;

    if (finalScore >= 90) {
      this.hudComprehension.style.color = '#10b981';
    } else if (finalScore >= 75) {
      this.hudComprehension.style.color = '#38bdf8';
    } else {
      this.hudComprehension.style.color = '#f59e0b';
    }
  }

  nextSentence() {
    if (this.currentSentenceIndex < this.sentences.length - 1) {
      this.currentSentenceIndex++;
      this.loadCurrentSentence();
      this.speakCurrentSentence();
    } else {
      alert(`Dictation passage complete!\nFinal Comprehension Index: ${this.hudComprehension.textContent}\nGreat listening and transcription exercise.`);
      this.currentSentenceIndex = 0;
      this.loadCurrentSentence();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.voiceToTypingTrainer = new VoiceToTypingTrainer();
});