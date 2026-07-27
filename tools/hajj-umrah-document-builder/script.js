// Hajj & Umrah Document Builder Logic

class HajjUmrahBuilder {
  constructor() {
    this.btnGenerate = document.getElementById('btn-generate');
    this.bindEvents();
    this.setDefaultDates();
  }

  setDefaultDates() {
    const today = new Date();
    document.getElementById('h-arr').value = today.toISOString().split('T')[0];
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 10);
    document.getElementById('h-dep').value = nextWeek.toISOString().split('T')[0];
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
    const agency = this.getVal('h-agency') || 'Travel Agency';
    const lic = this.getVal('h-lic');
    
    const name = this.getVal('h-name') || 'Pilgrim Name';
    const pass = this.getVal('h-pass');
    const type = this.getVal('h-type');
    const pax = this.getVal('h-pax');
    const ref = this.getVal('h-ref') || 'HU-001';
    
    const arr = this.getVal('h-arr');
    const dep = this.getVal('h-dep');
    const mak = this.getVal('h-mak') || 'Not Specified';
    const makN = this.getVal('h-mak-n');
    const mad = this.getVal('h-mad') || 'Not Specified';
    const madN = this.getVal('h-mad-n');
    const trans = this.getVal('h-trans') || 'Not Specified';

    // Header (Islamic Green Theme)
    doc.setFillColor(39, 174, 96); // #27ae60
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text('BOOKING CONFIRMATION', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(type.toUpperCase(), 105, 23, { align: 'center' });

    // Agency Info
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(14);
    doc.text(agency, 14, 45);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (lic) doc.text(`License No: ${lic}`, 14, 52);
    doc.text(`Booking Ref: ${ref}`, 196, 45, { align: 'right' });
    doc.text(`Issue Date: ${new Date().toISOString().split('T')[0]}`, 196, 52, { align: 'right' });

    doc.setDrawColor(200, 200, 200);
    doc.line(14, 58, 196, 58);

    // Pilgrim Details
    let startY = 70;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(39, 174, 96);
    doc.text('1. Pilgrim Information', 14, startY);
    
    startY += 8;
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Lead Pilgrim Name:`, 14, startY); doc.setFont('helvetica', 'bold'); doc.text(name, 55, startY); doc.setFont('helvetica', 'normal');
    
    startY += 7;
    doc.text(`Passport No:`, 14, startY); doc.text(pass, 55, startY);
    doc.text(`Total Passengers:`, 120, startY); doc.text(pax, 155, startY);

    // Itinerary
    startY += 20;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(39, 174, 96);
    doc.text('2. Travel Schedule', 14, startY);
    
    startY += 8;
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Arrival Date:`, 14, startY); doc.text(arr, 55, startY);
    doc.text(`Departure Date:`, 120, startY); doc.text(dep, 155, startY);

    // Accommodation
    startY += 20;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(39, 174, 96);
    doc.text('3. Accommodation details', 14, startY);
    
    // Makkah Box
    startY += 8;
    doc.setDrawColor(39, 174, 96);
    doc.setFillColor(245, 250, 245);
    doc.rect(14, startY, 182, 20, 'FD');
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('MAKKAH AL-MUKARRAMAH', 18, startY + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(`Hotel: ${mak}`, 18, startY + 15);
    doc.text(`Duration: ${makN} Nights`, 140, startY + 15);

    // Madinah Box
    startY += 25;
    doc.rect(14, startY, 182, 20, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.text('MADINAH AL-MUNAWWARAH', 18, startY + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(`Hotel: ${mad}`, 18, startY + 15);
    doc.text(`Duration: ${madN} Nights`, 140, startY + 15);

    // Transport
    startY += 30;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(39, 174, 96);
    doc.text('4. Ground Transportation', 14, startY);
    
    startY += 8;
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(trans, 14, startY);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('May Allah accept your pilgrimage.', 105, 280, { align: 'center' });

    doc.save(`${ref}_Confirmation.pdf`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => window.hajjUmrahBuilder = new HajjUmrahBuilder(), 300);
});