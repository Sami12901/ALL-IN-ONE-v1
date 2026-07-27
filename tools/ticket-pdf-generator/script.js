// Ticket PDF Generator Logic

class TicketGenerator {
  constructor() {
    this.btnGenerate = document.getElementById('btn-generate');
    this.barcodeCanvas = document.getElementById('barcode-canvas');

    this.bindEvents();
    this.setDefaultDate();
  }

  setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('t-date').value = today;
  }

  bindEvents() {
    this.btnGenerate.addEventListener('click', () => this.generatePDF());
  }

  generatePDF() {
    const eventName = document.getElementById('t-event').value || 'Event Name';
    const venue = document.getElementById('t-venue').value || 'Venue TBA';
    const date = document.getElementById('t-date').value;
    const time = document.getElementById('t-time').value;
    const type = document.getElementById('t-type').value;
    const price = document.getElementById('t-price').value || '0.00';
    const seat = document.getElementById('t-seat').value || 'General';
    const name = document.getElementById('t-name').value;
    const ticketId = document.getElementById('t-id').value || 'TKT-000';

    // Generate Barcode
    try {
      JsBarcode(this.barcodeCanvas, ticketId, {
        format: "CODE128",
        displayValue: false,
        margin: 0,
        width: 2,
        height: 40
      });
    } catch(e) {
      console.warn("Barcode generation failed, drawing placeholder.");
    }

    const { jsPDF } = window.jspdf;
    // Standard ticket size: 150mm x 50mm, landscape
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [150, 50]
    });

    // Draw background color for left stub
    doc.setFillColor(30, 30, 30);
    doc.rect(0, 0, 40, 50, 'F');
    
    // Draw dashed tear line
    doc.setDrawColor(200, 200, 200);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(40, 0, 40, 50);
    doc.setLineDashPattern([], 0); // reset

    // --- LEFT STUB (Tear off) ---
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(type, 20, 10, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`ID: ${ticketId}`, 20, 20, { align: 'center' });
    doc.text(date, 20, 25, { align: 'center' });
    doc.text(time, 20, 30, { align: 'center' });
    doc.text(`$${price}`, 20, 40, { align: 'center' });

    // --- MAIN TICKET ---
    doc.setTextColor(40, 40, 40);
    
    // Event Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(eventName, 45, 12);
    
    // Venue & DateTime
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Venue: ${venue}`, 45, 20);
    doc.text(`Date & Time: ${date} @ ${time}`, 45, 26);
    
    if (name) {
      doc.text(`Admit: ${name}`, 45, 32);
    }
    
    // Seat and Type at bottom
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Seat: ${seat}`, 45, 45);
    doc.setTextColor(231, 76, 60); // Red accent
    doc.text(type, 100, 45);

    // Draw Barcode on the right edge
    try {
      const barcodeDataUrl = this.barcodeCanvas.toDataURL("image/png");
      doc.addImage(barcodeDataUrl, 'PNG', 115, 10, 30, 12);
      // add ID below barcode
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text(ticketId, 130, 25, { align: 'center' });
    } catch(e) {}

    doc.save(`Ticket_${ticketId}.pdf`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => window.ticketGenerator = new TicketGenerator(), 300);
});