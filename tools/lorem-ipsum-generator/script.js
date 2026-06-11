const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed",
  "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua",
  "ut", "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris",
  "nisi", "ut", "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "dolor",
  "in", "reprehenderit", "in", "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat",
  "nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt",
  "in", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"
];

function getRandomWord() {
  return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
}

function generateSentence(wordCount) {
  let sentence = [];
  for (let i = 0; i < wordCount; i++) {
    sentence.push(getRandomWord());
  }
  let text = sentence.join(" ");
  return text.charAt(0).toUpperCase() + text.slice(1) + ".";
}

function generateParagraph(sentenceCount) {
  let paragraph = [];
  for (let i = 0; i < sentenceCount; i++) {
    // each sentence between 5 and 15 words
    let wordCount = Math.floor(Math.random() * 11) + 5;
    paragraph.push(generateSentence(wordCount));
  }
  return paragraph.join(" ");
}

document.addEventListener("DOMContentLoaded", () => {
  const countInput = document.getElementById("countInput");
  const typeSelect = document.getElementById("typeSelect");
  const startWithLorem = document.getElementById("startWithLorem");
  const generateBtn = document.getElementById("generateBtn");
  const resultText = document.getElementById("resultText");
  const copyBtn = document.getElementById("copyBtn");

  function generateText() {
    const count = parseInt(countInput.value) || 1;
    const type = typeSelect.value;
    const startLorem = startWithLorem.checked;
    
    let result = "";
    
    if (type === "words") {
      let words = [];
      if (startLorem) {
        words.push("Lorem", "ipsum", "dolor", "sit", "amet");
      }
      while (words.length < count) {
        words.push(getRandomWord());
      }
      // If count was smaller than startLorem words
      words = words.slice(0, count);
      let txt = words.join(" ");
      result = txt.charAt(0).toUpperCase() + txt.slice(1);
      if (count > 0 && !result.endsWith(".")) result += ".";
      
    } else if (type === "sentences") {
      let sentences = [];
      if (startLorem) {
        sentences.push("Lorem ipsum dolor sit amet, consectetur adipiscing elit.");
      }
      while (sentences.length < count) {
        sentences.push(generateSentence(Math.floor(Math.random() * 11) + 5));
      }
      sentences = sentences.slice(0, count);
      result = sentences.join(" ");
      
    } else if (type === "paragraphs") {
      let paragraphs = [];
      for (let i = 0; i < count; i++) {
        let p = generateParagraph(Math.floor(Math.random() * 4) + 4); // 4 to 7 sentences
        if (i === 0 && startLorem) {
          p = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " + p;
        }
        paragraphs.push(p);
      }
      result = paragraphs.join("\n\n");
      
    } else if (type === "list") {
      let items = [];
      for (let i = 0; i < count; i++) {
        let item = generateSentence(Math.floor(Math.random() * 6) + 3);
        if (i === 0 && startLorem) {
          item = "Lorem ipsum dolor sit amet.";
        }
        items.push("- " + item);
      }
      result = items.join("\n");
    }

    resultText.textContent = result;
  }

  generateBtn.addEventListener("click", generateText);

  copyBtn.addEventListener("click", () => {
    const textToCopy = resultText.textContent;
    if (!textToCopy) return;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = "Copied!";
      copyBtn.classList.add("copied");
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.classList.remove("copied");
      }, 2000);
    });
  });

  // Generate initial text
  generateText();
});