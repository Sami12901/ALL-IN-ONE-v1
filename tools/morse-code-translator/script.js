// Morse Code Translator Logic

const morseDict = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
  '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..',
  '\'': '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
  '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.',
  '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
  ' ': '/'
};

const reverseDict = Object.fromEntries(Object.entries(morseDict).map(([k, v]) => [v, k]));

class MorseTranslator {
  constructor() {
    this.inputBox = document.getElementById('input-text');
    this.outputBox = document.getElementById('output-text');
    this.inputLabel = document.getElementById('input-label');
    this.outputLabel = document.getElementById('output-label');
    this.swapBtn = document.getElementById('swap-btn');
    this.copyBtn = document.getElementById('btn-copy');
    this.pasteBtn = document.getElementById('btn-paste');
    this.playBtn = document.getElementById('btn-play');

    this.mode = 'textToMorse'; // or 'morseToText'
    
    // Audio Context
    this.audioCtx = null;
    this.isPlaying = false;
    this.dotDuration = 100; // ms

    this.bindEvents();
  }

  bindEvents() {
    this.inputBox.addEventListener('input', () => this.process());
    
    this.swapBtn.addEventListener('click', () => {
      this.mode = this.mode === 'textToMorse' ? 'morseToText' : 'textToMorse';
      this.updateLabels();
      this.inputBox.value = this.outputBox.value;
      this.process();
    });

    this.copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(this.outputBox.value);
      const originalText = this.copyBtn.textContent;
      this.copyBtn.textContent = 'Copied!';
      setTimeout(() => this.copyBtn.textContent = originalText, 1500);
    });

    this.pasteBtn.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        this.inputBox.value = text;
        this.process();
      } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
      }
    });

    this.playBtn.addEventListener('click', () => this.playAudio());
  }

  updateLabels() {
    if (this.mode === 'textToMorse') {
      this.inputLabel.textContent = 'English Text';
      this.outputLabel.textContent = 'Morse Code';
      this.outputBox.setAttribute('readonly', 'true');
    } else {
      this.inputLabel.textContent = 'Morse Code';
      this.outputLabel.textContent = 'English Text';
    }
  }

  process() {
    const input = this.inputBox.value.toUpperCase();
    
    if (!input) {
      this.outputBox.value = '';
      this.playBtn.disabled = true;
      return;
    }

    if (this.mode === 'textToMorse') {
      let result = [];
      for (let i = 0; i < input.length; i++) {
        let char = input[i];
        if (morseDict[char]) {
          result.push(morseDict[char]);
        }
      }
      this.outputBox.value = result.join(' ');
      this.playBtn.disabled = false;
    } else {
      let result = [];
      let words = input.split('/');
      words.forEach(word => {
        let letters = word.trim().split(' ');
        let translatedWord = '';
        letters.forEach(l => {
          if (reverseDict[l]) {
            translatedWord += reverseDict[l];
          }
        });
        if (translatedWord) result.push(translatedWord);
      });
      this.outputBox.value = result.join(' ');
      this.playBtn.disabled = true; // Can only play morse output when text->morse
    }
  }

  async playAudio() {
    if (this.isPlaying) return;
    const morseCode = this.mode === 'textToMorse' ? this.outputBox.value : this.inputBox.value;
    if (!morseCode) return;

    this.isPlaying = true;
    this.playBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg> Playing...';
    
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      for (let i = 0; i < morseCode.length; i++) {
        const char = morseCode[i];
        if (char === '.') {
          await this.beep(this.dotDuration);
          await this.sleep(this.dotDuration); // Intrasymbol gap
        } else if (char === '-') {
          await this.beep(this.dotDuration * 3);
          await this.sleep(this.dotDuration); // Intrasymbol gap
        } else if (char === ' ') {
          await this.sleep(this.dotDuration * 2); // Gap between letters (3 units total, -1 from prev gap)
        } else if (char === '/') {
          await this.sleep(this.dotDuration * 6); // Gap between words (7 units total, -1 from prev gap)
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.isPlaying = false;
      this.playBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Play Audio';
      if (this.audioCtx) {
        this.audioCtx.close();
        this.audioCtx = null;
      }
    }
  }

  beep(duration) {
    return new Promise(resolve => {
      const oscillator = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, this.audioCtx.currentTime); // 600Hz classic tone
      
      // Envelope to prevent clicking
      gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(1, this.audioCtx.currentTime + 0.01);
      gainNode.gain.setValueAtTime(1, this.audioCtx.currentTime + (duration/1000) - 0.01);
      gainNode.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + (duration/1000));
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(this.audioCtx.currentTime + (duration / 1000));
      
      oscillator.onended = resolve;
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

window.morseTranslator = new MorseTranslator();