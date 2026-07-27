// Robots.txt Generator Logic

class RobotsTxtGenerator {
  constructor() {
    this.inRule = document.getElementById('default-rule');
    this.inDelay = document.getElementById('crawl-delay');
    this.inSitemap = document.getElementById('sitemap-url');
    this.inDirs = document.getElementById('disallowed-dirs');
    
    this.outputBox = document.getElementById('output-code');
    this.btnCopy = document.getElementById('btn-copy');

    this.bindEvents();
    this.generate();
  }

  bindEvents() {
    const inputs = [this.inRule, this.inDelay, this.inSitemap, this.inDirs];
    inputs.forEach(el => el.addEventListener('input', () => this.generate()));

    this.btnCopy.addEventListener('click', () => {
      if (!this.outputBox.textContent) return;
      navigator.clipboard.writeText(this.outputBox.textContent);
      const originalText = this.btnCopy.textContent;
      this.btnCopy.textContent = 'Copied!';
      setTimeout(() => this.btnCopy.textContent = originalText, 1500);
    });
  }

  generate() {
    const rule = this.inRule.value;
    const delay = this.inDelay.value.trim();
    const sitemap = this.inSitemap.value.trim();
    const dirs = this.inDirs.value.split('\n').map(d => d.trim()).filter(d => d !== '');

    let txt = `User-agent: *\n`;
    
    if (rule === 'disallow') {
      txt += `Disallow: /\n`;
    } else {
      if (dirs.length > 0) {
        dirs.forEach(d => {
          // Ensure it starts with /
          if (!d.startsWith('/')) d = '/' + d;
          txt += `Disallow: ${d}\n`;
        });
      } else {
        txt += `Disallow:\n`;
      }
    }

    if (delay) {
      txt += `Crawl-delay: ${delay}\n`;
    }

    if (sitemap) {
      txt += `\nSitemap: ${sitemap}\n`;
    }

    this.outputBox.textContent = txt;
  }
}

window.robotsGenerator = new RobotsTxtGenerator();