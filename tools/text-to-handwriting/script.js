// Text to Handwriting Logic

class HandwritingGenerator {
  constructor() {
    this.canvas = document.getElementById('handwriting-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.inputBox = document.getElementById('input-text');
    this.fontSelect = document.getElementById('font-select');
    this.colorSelect = document.getElementById('color-select');
    this.btnDownload = document.getElementById('btn-download');

    // Wait for fonts to load before drawing
    document.fonts.ready.then(() => {
      this.draw();
    });

    this.bindEvents();
  }

  bindEvents() {
    this.inputBox.addEventListener('input', () => this.draw());
    this.fontSelect.addEventListener('change', () => this.draw());
    this.colorSelect.addEventListener('change', () => this.draw());

    this.btnDownload.addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = 'handwritten-note.png';
      link.href = this.canvas.toDataURL('image/png');
      link.click();
    });
  }

  draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Fill background with paper color
    this.ctx.fillStyle = '#f4f4f5';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw ruled lines
    this.ctx.strokeStyle = '#93c5fd'; // Light blue lines
    this.ctx.lineWidth = 1;
    const lineSpacing = 32; // 2rem = 32px roughly
    
    // Start drawing lines below a top margin
    const topMargin = 64; 
    
    // Draw vertical margin line (red)
    this.ctx.beginPath();
    this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    this.ctx.moveTo(80, 0);
    this.ctx.lineTo(80, this.canvas.height);
    this.ctx.stroke();

    // Draw horizontal blue lines
    this.ctx.strokeStyle = 'rgba(147, 197, 253, 0.6)';
    for (let y = topMargin; y < this.canvas.height; y += lineSpacing) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }

    // Set font styles
    const font = this.fontSelect.value;
    const fontSize = 28;
    this.ctx.font = `${fontSize}px ${font}`;
    this.ctx.fillStyle = this.colorSelect.value;
    this.ctx.textBaseline = 'bottom';

    // Draw text
    const text = this.inputBox.value;
    const paragraphs = text.split('\n');
    
    let currentY = topMargin; // Start writing on the first line
    const leftMargin = 95; // Just past the red line
    const maxRight = this.canvas.width - 20;

    paragraphs.forEach(p => {
      if (p.trim() === '') {
        currentY += lineSpacing; // Empty line
        return;
      }

      const words = p.split(' ');
      let currentLine = '';

      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine + words[i] + ' ';
        const metrics = this.ctx.measureText(testLine);

        if (leftMargin + metrics.width > maxRight && i > 0) {
          // Draw current line
          this.drawTextWithJitter(currentLine, leftMargin, currentY);
          currentLine = words[i] + ' ';
          currentY += lineSpacing;
        } else {
          currentLine = testLine;
        }
      }
      // Draw remainder
      this.drawTextWithJitter(currentLine, leftMargin, currentY);
      currentY += lineSpacing;
    });
  }

  drawTextWithJitter(text, x, y) {
    // Add slight random offset to simulate handwriting
    const jitterY = (Math.random() - 0.5) * 2; // +/- 1px
    
    // We can also adjust opacity slightly to simulate ink
    this.ctx.globalAlpha = 0.85 + Math.random() * 0.15;
    
    this.ctx.fillText(text, x, y - 2 + jitterY);
    
    this.ctx.globalAlpha = 1.0;
  }
}

window.handwritingGenerator = new HandwritingGenerator();