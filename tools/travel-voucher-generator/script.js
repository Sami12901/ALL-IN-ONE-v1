// Travel Voucher Generator Logic

class TravelVoucher {
  constructor() {
    this.btnGenerate = document.getElementById('btn-generate');
    this.bindEvents();
    this.setDefaultDates();
  }

  setDefaultDates() {
    const today = new Date();
    document.getElementById('tv-start').value = today.toISOString().split('T')[0];
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 3);
    document.getElementById('tv-end').value = tomorrow.toISOString().split('T')[0];
  }

  bindEvents() {
    this.btnGenerate.addEventListener('click', () => this.generatePDF());
  }

  getVal(id) {
    return document.getElementById(id).value || '';
  }

  generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Data
    const agency = this.getVal('tv-agency') || 'Travel Agency';
    const email = this.getVal('tv-email');
    const phone = this.getVal('tv-phone');
    
    const name = this.getVal('tv-name') || 'Guest Name';
    const adults = this.getVal('tv-adults');
    const children = this.getVal('tv-children');
    const pnr = this.getVal('tv-pnr') || 'TBA';
    
    const type = this.getVal('tv-type');
    const start = this.getVal('tv-start');
    const end = this.getVal('tv-end');
    const provider = this.getVal('tv-provider') || 'Service Provider';
    const desc = this.getVal('tv-desc');
    const notes = this.getVal('tv-notes');

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(41, 128, 185); // Blue
    doc.text('TRAVEL VOUCHER', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Please present this voucher to the service provider upon arrival.', 105, 26, { align: 'center' });

    // Helper
    const drawBox = (title, lines, x, y, w, h) => {
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(250, 250, 250);
      doc.rect(x, y, w, h, 'FD');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.text(title, x + 5, y + 7);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      let currY = y + 14;
      lines.forEach(line => {
        doc.text(line, x + 5, currY);
        currY += 6;
      });
    };

    // Agency & Ref Box
    drawBox('Agency Information', [
      agency,
      `Email: ${email}`,
      `Phone: ${phone}`
    ], 14, 35, 85, 30);
    
    drawBox('Booking Reference', [
      `Confirmation No / PNR:`,
      pnr,
      `Issued Date: ${new Date().toISOString().split('T')[0]}`
    ], 110, 35, 85, 30);

    // Passenger Box
    drawBox('Passenger Details', [
      `Lead Passenger: ${name}`,
      `Adults: ${adults}`,
      `Children: ${children}`
    ], 14, 70, 181, 25);

    // Service Box
    let descLines = [];
    if (desc) {
      descLines = doc.splitTextToSize(`Description: ${desc}`, 170);
    }
    
    drawBox('Service Details', [
      `Service Type: ${type}`,
      `Provider: ${provider}`,
      `Start Date / Check-in: ${start}`,
      `End Date / Check-out: ${end}`,
      '',
      ...descLines
    ], 14, 100, 181, 60);

    // Notes Box
    if (notes) {
      const noteLines = doc.splitTextToSize(notes, 170);
      drawBox('Special Requests / Notes', noteLines, 14, 165, 181, 35);
    }

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('This voucher is valid only for the services stated above.', 105, 280, { align: 'center' });

    doc.save(`Voucher_${pnr}.pdf`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => window.travelVoucher = new TravelVoucher(), 300);
});