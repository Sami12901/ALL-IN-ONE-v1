// Redirect Generator Logic

class RedirectGenerator {
  constructor() {
    this.inServer = document.getElementById('server-type');
    this.inType = document.getElementById('redirect-type');
    this.inOld = document.getElementById('old-url');
    this.inNew = document.getElementById('new-url');
    
    this.outputBox = document.getElementById('output-code');
    this.btnCopy = document.getElementById('btn-copy');

    this.bindEvents();
    this.generate();
  }

  bindEvents() {
    const inputs = [this.inServer, this.inType, this.inOld, this.inNew];
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
    const server = this.inServer.value;
    const type = this.inType.value;
    let oldUrl = this.inOld.value.trim() || '/old-page';
    const newUrl = this.inNew.value.trim() || 'https://example.com/new-page';

    let code = '';

    if (server === 'apache') {
      // Ensure oldUrl starts with / if it's a path
      if (!oldUrl.startsWith('^') && !oldUrl.startsWith('/')) oldUrl = '/' + oldUrl;
      code = `RewriteEngine On\nRewriteRule ^${oldUrl.replace(/^\//, '')}$ ${newUrl} [R=${type},L]`;
    } 
    else if (server === 'nginx') {
      if (!oldUrl.startsWith('/')) oldUrl = '/' + oldUrl;
      const typeStr = type === '301' ? 'permanent' : 'redirect';
      code = `rewrite ^${oldUrl}$ ${newUrl} ${typeStr};`;
    }
    else if (server === 'php') {
      code = `<?php\n`;
      if (type === '301') {
        code += `header("HTTP/1.1 301 Moved Permanently");\n`;
      }
      code += `header("Location: ${newUrl}");\n`;
      code += `exit();\n?>`;
    }
    else if (server === 'js') {
      code = `// JavaScript doesn't have true 301/302 HTTP status headers\n`;
      code += `// This simply performs a client-side redirect\n`;
      if (type === '301') {
        code += `window.location.replace("${newUrl}");`;
      } else {
        code += `window.location.href = "${newUrl}";`;
      }
    }

    this.outputBox.textContent = code;
  }
}

window.redirectGenerator = new RedirectGenerator();