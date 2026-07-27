// Visa Application Builder Logic

class VisaBuilder {
  constructor() {
    this.btnGenerate = document.getElementById('btn-generate');
    this.bindEvents();
  }

  bindEvents() {
    this.btnGenerate.addEventListener('click', () => this.generatePDF());
  }

  getVal(id) {
    return document.getElementById(id).value || '';
  }

  generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF(); // Default A4 portrait
    
    // --- Data ---
    const data = {
      surname: this.getVal('v-surname'),
      given: this.getVal('v-given'),
      dob: this.getVal('v-dob'),
      pob: this.getVal('v-pob'),
      nat: this.getVal('v-nat'),
      sex: this.getVal('v-sex'),
      marital: this.getVal('v-marital'),
      passNum: this.getVal('v-pass-num'),
      passIssue: this.getVal('v-pass-issue'),
      passDate: this.getVal('v-pass-date'),
      passExp: this.getVal('v-pass-exp'),
      dest: this.getVal('v-dest'),
      purpose: this.getVal('v-purpose'),
      arr: this.getVal('v-arr'),
      dep: this.getVal('v-dep'),
      entries: this.getVal('v-entries')
    };

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('APPLICATION FOR VISA', 105, 20, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('This form is provided free of charge. Please ensure all details are accurate.', 105, 26, { align: 'center' });

    // Helper to draw a standard field box
    const drawField = (label, value, x, y, w, h) => {
      doc.setDrawColor(150, 150, 150);
      doc.rect(x, y, w, h);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(label, x + 2, y + 4);
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);
      doc.text(value, x + 2, y + 11);
    };

    let startY = 35;
    
    // Section 1
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Personal Information', 14, startY);
    startY += 5;
    
    drawField('1. Surname (Family Name)', data.surname, 14, startY, 90, 15);
    drawField('2. Given Names', data.given, 106, startY, 90, 15);
    startY += 17;
    
    drawField('3. Date of Birth (YYYY-MM-DD)', data.dob, 14, startY, 60, 15);
    drawField('4. Place of Birth', data.pob, 76, startY, 60, 15);
    drawField('5. Current Nationality', data.nat, 138, startY, 58, 15);
    startY += 17;
    
    drawField('6. Sex', data.sex, 14, startY, 90, 15);
    drawField('7. Marital Status', data.marital, 106, startY, 90, 15);
    startY += 25;

    // Section 2
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Passport Details', 14, startY);
    startY += 5;
    
    drawField('8. Passport Number', data.passNum, 14, startY, 90, 15);
    drawField('9. Issued By (Authority)', data.passIssue, 106, startY, 90, 15);
    startY += 17;
    
    drawField('10. Date of Issue', data.passDate, 14, startY, 90, 15);
    drawField('11. Valid Until', data.passExp, 106, startY, 90, 15);
    startY += 25;

    // Section 3
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Travel Information', 14, startY);
    startY += 5;
    
    drawField('12. Destination', data.dest, 14, startY, 90, 15);
    drawField('13. Purpose of Journey', data.purpose, 106, startY, 90, 15);
    startY += 17;
    
    drawField('14. Intended Date of Arrival', data.arr, 14, startY, 60, 15);
    drawField('15. Intended Date of Departure', data.dep, 76, startY, 60, 15);
    drawField('16. Number of Entries', data.entries, 138, startY, 58, 15);
    startY += 25;

    // Section 4 (Declaration)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('4. Declaration', 14, startY);
    startY += 6;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const declText = "I declare that the information provided in this application is true and complete to the best of my knowledge and belief. I understand that any false statements may result in the refusal of my visa or the annulment of any visa already granted.";
    const splitDecl = doc.splitTextToSize(declText, 180);
    doc.text(splitDecl, 14, startY);
    startY += 25;
    
    // Signatures
    doc.setDrawColor(0,0,0);
    doc.line(14, startY, 80, startY);
    doc.text('Place and Date', 14, startY + 5);
    
    doc.line(100, startY, 196, startY);
    doc.text('Signature (For minors, signature of parental authority)', 100, startY + 5);

    // Save
    doc.save(`Visa_Application_${data.surname || 'Form'}.pdf`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => window.visaBuilder = new VisaBuilder(), 300);
});