// Slug Generator Logic

class SlugGenerator {
  constructor() {
    this.inputBox = document.getElementById('input-title');
    this.outputBox = document.getElementById('output-slug');
    this.copyBtn = document.getElementById('btn-copy');

    this.bindEvents();
    
    // Initial parse in case there's placeholder/cached text
    if(this.inputBox.value) {
      this.generateSlug();
    } else {
      this.outputBox.textContent = '';
    }
  }

  bindEvents() {
    this.inputBox.addEventListener('input', () => this.generateSlug());
    
    this.copyBtn.addEventListener('click', () => {
      if (!this.outputBox.textContent) return;
      navigator.clipboard.writeText(this.outputBox.textContent);
      const originalText = this.copyBtn.textContent;
      this.copyBtn.textContent = 'Copied!';
      this.copyBtn.style.background = 'var(--accent)';
      this.copyBtn.style.color = 'var(--bg)';
      setTimeout(() => {
        this.copyBtn.textContent = originalText;
        this.copyBtn.style.background = 'var(--surface)';
        this.copyBtn.style.color = 'var(--text)';
      }, 1500);
    });
  }

  generateSlug() {
    const text = this.inputBox.value;
    
    if (!text) {
      this.outputBox.textContent = '';
      return;
    }

    const slug = text
      .toString()
      .normalize('NFD')                   // split an accented letter in the base letter and the accent
      .replace(/[\u0300-\u036f]/g, '')   // remove all previously split accents
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')              // replace spaces with hyphens
      .replace(/[^\w\-]+/g, '')          // remove all non-word characters
      .replace(/\-\-+/g, '-');           // replace multiple hyphens with single hyphen

    this.outputBox.textContent = slug;
  }
}

window.slugGenerator = new SlugGenerator();