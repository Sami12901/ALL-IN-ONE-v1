// Lorem Ipsum Generator Logic
document.addEventListener('DOMContentLoaded', () => {
  const typeSelect = document.getElementById('generate-type');
  const countInput = document.getElementById('generate-count');
  const startWithLorem = document.getElementById('start-with-lorem');
  const generateBtn = document.getElementById('generate-btn');
  const outputBox = document.getElementById('output-text');
  const copyBtn = document.getElementById('copy-btn');

  // Corpus for generation
  const loremFirst = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
  const words = [
    "a", "ac", "accumsan", "ad", "adipiscing", "aenean", "aliquam", "aliquet", "amet", "ante", "aptent", "arcu", "at", "auctor", "augue",
    "bibendum", "blandit", "class", "commodo", "condimentum", "congue", "consectetur", "consequat", "conubia", "convallis", "cras",
    "cubilia", "curabitur", "curae", "cursus", "dapibus", "diam", "dictum", "dictumst", "dignissim", "dis", "dolor", "donec", "dui",
    "duis", "egestas", "eget", "eleifend", "elementum", "elit", "enim", "erat", "eros", "est", "et", "etiam", "eu", "euismod", "ex",
    "facilisi", "facilisis", "fames", "faucibus", "felis", "fermentum", "feugiat", "fringilla", "fusce", "gravida", "habitant",
    "habitasse", "hac", "hendrerit", "himenaeos", "iaculis", "id", "imperdiet", "in", "inceptos", "integer", "interdum", "ipsum",
    "justo", "lacinia", "lacus", "laoreet", "lectus", "leo", "libero", "ligula", "litora", "lobortis", "lorem", "luctus", "maecenas",
    "magna", "magnis", "malesuada", "massa", "mattis", "mauris", "maximus", "metus", "mi", "molestie", "mollis", "montes", "morbi",
    "mus", "nam", "nascetur", "natoque", "nec", "neque", "netus", "nibh", "nisi", "nisl", "non", "nostra", "nulla", "nullam", "nunc",
    "odio", "orci", "ornare", "parturient", "pellentesque", "penatibus", "per", "pharetra", "phasellus", "placerat", "platea", "porta",
    "porttitor", "posuere", "potenti", "praesent", "pretium", "primis", "proin", "pulvinar", "purus", "quam", "quis", "quisque", "rhoncus",
    "ridiculus", "risus", "rutrum", "sagittis", "sapien", "scelerisque", "sed", "sem", "semper", "senectus", "sociosqu", "sodales",
    "sollicitudin", "suscipit", "suspendisse", "taciti", "tellus", "tempor", "tempus", "tincidunt", "torquent", "tortor", "tristique",
    "turpis", "ullamcorper", "ultrices", "ultricies", "urna", "ut", "varius", "vehicula", "vel", "velit", "venenatis", "vestibulum",
    "vitae", "vivamus", "viverra", "volutpat", "vulputate"
  ];

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generateWords(count) {
    let res = [];
    for (let i = 0; i < count; i++) {
      res.push(words[randomInt(0, words.length - 1)]);
    }
    return res;
  }

  function generateSentence() {
    let wordCount = randomInt(5, 15);
    let genWords = generateWords(wordCount);
    genWords[0] = genWords[0].charAt(0).toUpperCase() + genWords[0].slice(1);
    return genWords.join(' ') + '.';
  }

  function generateParagraph() {
    let sentenceCount = randomInt(3, 7);
    let sentences = [];
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence());
    }
    return sentences.join(' ');
  }

  function generateLorem(type, count, useLoremStart) {
    count = parseInt(count);
    if (isNaN(count) || count < 1) count = 1;
    if (count > 1000) count = 1000; // soft limit
    
    let result = '';

    if (type === 'paragraphs') {
      let paragraphs = [];
      for (let i = 0; i < count; i++) {
        let p = generateParagraph();
        if (i === 0 && useLoremStart) {
          // Replace first sentence with standard lorem if it's long enough, or just prepend
          let wordsArr = p.split(' ');
          let loremArr = loremFirst.split(' ');
          if (wordsArr.length > loremArr.length) {
            wordsArr.splice(0, loremArr.length, ...loremArr);
            p = wordsArr.join(' ');
          } else {
            p = loremFirst + ' ' + p;
          }
        }
        paragraphs.push('<p>' + p + '</p>');
      }
      result = paragraphs.join('');
    } 
    else if (type === 'sentences') {
      let sentences = [];
      for (let i = 0; i < count; i++) {
        sentences.push(generateSentence());
      }
      if (useLoremStart) {
        sentences[0] = loremFirst;
      }
      result = sentences.join(' ');
    } 
    else if (type === 'words') {
      let w = generateWords(count);
      if (useLoremStart) {
        let loremArr = "Lorem ipsum dolor sit amet".split(' ');
        for(let i=0; i<Math.min(count, loremArr.length); i++){
          w[i] = loremArr[i];
        }
      }
      w[0] = w[0].charAt(0).toUpperCase() + w[0].slice(1);
      result = w.join(' ') + '.';
    }
    
    return result;
  }

  function doGenerate() {
    const type = typeSelect.value;
    const count = countInput.value;
    const useStart = startWithLorem.checked;
    
    const text = generateLorem(type, count, useStart);
    outputBox.innerHTML = text;
  }

  // Event Listeners
  generateBtn.addEventListener('click', doGenerate);
  
  // Initial generation on load
  doGenerate();

  // Copy to clipboard
  copyBtn.addEventListener('click', async () => {
    try {
      // get text representation, stripping tags
      const textToCopy = outputBox.innerText;
      await navigator.clipboard.writeText(textToCopy);
      
      const originalHTML = copyBtn.innerHTML;
      copyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
      copyBtn.classList.add('copied');
      
      setTimeout(() => {
        copyBtn.innerHTML = originalHTML;
        copyBtn.classList.remove('copied');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy text to clipboard.');
    }
  });
});