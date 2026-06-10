// Word Counter Logic
document.addEventListener('DOMContentLoaded', () => {
  const wordInput = document.getElementById('word-input');
  const wordCount = document.getElementById('word-count');
  const charCount = document.getElementById('char-count');
  const sentenceCount = document.getElementById('sentence-count');
  const readTime = document.getElementById('read-time');
  const clearBtn = document.getElementById('clear-btn');

  wordInput.addEventListener('input', () => {
    const text = wordInput.value;
    
    // Characters
    charCount.textContent = text.length;

    // Words
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    wordCount.textContent = words.length;

    // Sentences
    const sentences = text.split(/[.!?]+(\s+|$)/).filter(s => s && s.trim().length > 0);
    sentenceCount.textContent = sentences.length;

    // Reading time (average 200 words per minute)
    const totalSeconds = Math.round((words.length / 200) * 60);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    readTime.textContent = `${minutes}m ${seconds}s`;
  });

  clearBtn.addEventListener('click', () => {
    wordInput.value = '';
    wordInput.dispatchEvent(new Event('input'));
    wordInput.focus();
  });
});