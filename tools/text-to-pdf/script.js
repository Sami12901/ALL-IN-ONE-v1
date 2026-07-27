// Text to PDF Logic

class TextToPdf {
  constructor() {
    this.inText = document.getElementById('pdf-text');
    this.inFont = document.getElementById('pdf-font');
    this.inSize = document.getElementById('pdf-size');
    this.inLineHeight = document.getElementById('pdf-line-height');
    this.inFormat = document.getElementById('pdf-format');
    this.btnExecute = document.getElementById('btn-execute');

    this.bindEvents();
  }

  bindEvents() {
    this.btnExecute.addEventListener('click', () => this.execute());
  }

  execute() {
    const text = this.inText.value.trim();
    if (!text) {
      alert('Please enter some text to generate a PDF.');
      return;
    }

    const { jsPDF } = window.jspdf;
    const format = this.inFormat.value;
    const doc = new jsPDF({ format: format });
    
    const font = this.inFont.value;
    const fontSize = parseInt(this.inSize.value, 10) || 12;
    const lineHeight = parseFloat(this.inLineHeight.value) || 1.5;

    doc.setFont(font);
    doc.setFontSize(fontSize);

    const margin = 20; // 20mm margin
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const maxTextWidth = pageWidth - (margin * 2);

    // Split text into lines that fit the width
    const lines = doc.splitTextToSize(text, maxTextWidth);

    let cursorY = margin;
    const verticalOffset = (fontSize * lineHeight) * 0.352777778; // px to mm approx

    for (let i = 0; i < lines.length; i++) {
      if (cursorY + verticalOffset > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(lines[i], margin, cursorY);
      cursorY += verticalOffset;
    }

    doc.save('document.pdf');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => window.textToPdf = new TextToPdf(), 300);
});