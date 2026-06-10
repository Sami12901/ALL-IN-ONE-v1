document.addEventListener('DOMContentLoaded', () => {
  const textInput = document.getElementById('text-input');
  const metricSentences = document.getElementById('metric-sentences');
  const metricWords = document.getElementById('metric-words');
  const metricParagraphs = document.getElementById('metric-paragraphs');
  const metricChars = document.getElementById('metric-chars');
  
  const clearBtn = document.getElementById('clear-btn');
  const pasteBtn = document.getElementById('paste-btn');

  const analyzeText = () => {
    const text = textInput.value || '';
    
    // Characters
    const chars = text.length;
    metricChars.innerText = chars;

    if (chars === 0) {
      metricSentences.innerText = '0';
      metricWords.innerText = '0';
      metricParagraphs.innerText = '0';
      return;
    }

    // Paragraphs: Split by double newline or single newline, filter out empties
    const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0).length;
    metricParagraphs.innerText = paragraphs;

    // Words: Split by whitespace
    const words = text.split(/\s+/).filter(w => w.length > 0).length;
    metricWords.innerText = words;

    // Sentences: Match punctuation . ! ? followed by space or end of string
    // A robust regex for sentence boundaries
    const sentenceMatch = text.match(/[^.!?\s][^.!?]*(?:[.!?](?!\s*[a-z]|[^.!?]*\s)[^.!?]*)*[.!?]?[\s\n]*/g);
    
    // Fallback simple regex if complex one fails or for basic English
    // We split by . ! or ? and filter out empties
    const simpleSentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    
    metricSentences.innerText = simpleSentences;
  };

  textInput.addEventListener('input', analyzeText);

  clearBtn.addEventListener('click', () => {
    textInput.value = '';
    analyzeText();
    textInput.focus();
  });

  pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      textInput.value = text;
      analyzeText();
    } catch (err) {
      alert('Failed to read clipboard contents.');
    }
  });

  // Initial Run
  analyzeText();
});