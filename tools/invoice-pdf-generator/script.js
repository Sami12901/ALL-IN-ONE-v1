// Invoice Generator Logic

class InvoiceGenerator {
  constructor() {
    this.tbody = document.getElementById('items-body');
    this.btnAddItem = document.getElementById('btn-add-item');
    this.btnGenerate = document.getElementById('btn-generate');
    
    this.uiSubtotal = document.getElementById('ui-subtotal');
    this.uiTax = document.getElementById('ui-tax');
    this.uiTotal = document.getElementById('ui-total');
    
    this.inTax = document.getElementById('inv-tax');
    this.inCurrency = document.getElementById('inv-currency');

    this.items = [];
    
    this.bindEvents();
    this.setDefaultDates();
    this.addItem(); // add one empty item row by default
  }

  setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('inv-date').value = today;
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    document.getElementById('inv-due').value = nextWeek.toISOString().split('T')[0];
  }

  bindEvents() {
    this.btnAddItem.addEventListener('click', () => this.addItem());
    this.inTax.addEventListener('input', () => this.calculateTotals());
    this.inCurrency.addEventListener('input', () => this.calculateTotals());
    this.btnGenerate.addEventListener('click', () => this.generatePDF());
  }

  addItem() {
    const id = Date.now().toString();
    this.items.push({ id, desc: '', qty: 1, price: 0 });
    this.renderItems();
  }

  removeItem(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.renderItems();
  }

  updateItem(id, field, value) {
    const item = this.items.find(i => i.id === id);
    if (item) {
      item[field] = value;
      this.calculateTotals();
    }
  }

  renderItems() {
    this.tbody.innerHTML = '';
    this.items.forEach(item => {
      const tr = document.createElement('tr');
      
      const tdDesc = document.createElement('td');
      const inDesc = document.createElement('input');
      inDesc.type = 'text';
      inDesc.className = 'form-input';
      inDesc.placeholder = 'Item description';
      inDesc.value = item.desc;
      inDesc.oninput = (e) => this.updateItem(item.id, 'desc', e.target.value);
      tdDesc.appendChild(inDesc);
      
      const tdQty = document.createElement('td');
      const inQty = document.createElement('input');
      inQty.type = 'number';
      inQty.className = 'form-input';
      inQty.value = item.qty;
      inQty.min = 1;
      inQty.oninput = (e) => this.updateItem(item.id, 'qty', parseFloat(e.target.value) || 0);
      tdQty.appendChild(inQty);
      
      const tdPrice = document.createElement('td');
      const inPrice = document.createElement('input');
      inPrice.type = 'number';
      inPrice.className = 'form-input';
      inPrice.value = item.price;
      inPrice.min = 0;
      inPrice.oninput = (e) => this.updateItem(item.id, 'price', parseFloat(e.target.value) || 0);
      tdPrice.appendChild(inPrice);
      
      const tdAction = document.createElement('td');
      const btnDel = document.createElement('button');
      btnDel.className = 'btn-remove-item';
      btnDel.textContent = 'X';
      btnDel.onclick = () => this.removeItem(item.id);
      tdAction.appendChild(btnDel);
      
      tr.appendChild(tdDesc);
      tr.appendChild(tdQty);
      tr.appendChild(tdPrice);
      tr.appendChild(tdAction);
      
      this.tbody.appendChild(tr);
    });
    this.calculateTotals();
  }

  calculateTotals() {
    let subtotal = 0;
    this.items.forEach(item => {
      subtotal += (item.qty * item.price);
    });
    
    const taxRate = parseFloat(this.inTax.value) || 0;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;
    
    const c = this.inCurrency.value || '$';
    
    this.uiSubtotal.textContent = `${c}${subtotal.toFixed(2)}`;
    this.uiTax.textContent = `${c}${tax.toFixed(2)}`;
    this.uiTotal.textContent = `${c}${total.toFixed(2)}`;
    
    return { subtotal, tax, total, currency: c };
  }

  generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const fromName = document.getElementById('inv-from-name').value || 'Company Name';
    const fromAddress = document.getElementById('inv-from-address').value;
    const fromContact = document.getElementById('inv-from-contact').value;
    
    const toName = document.getElementById('inv-to-name').value || 'Client Name';
    const toAddress = document.getElementById('inv-to-address').value;
    
    const invNum = document.getElementById('inv-num').value || 'INV-001';
    const invDate = document.getElementById('inv-date').value;
    const invDue = document.getElementById('inv-due').value;
    
    const { subtotal, tax, total, currency } = this.calculateTotals();

    // Fonts and colors
    doc.setFont('helvetica');
    
    // Header
    doc.setFontSize(24);
    doc.setTextColor(40, 40, 40);
    doc.text('INVOICE', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Invoice #: ${invNum}`, 14, 30);
    doc.text(`Date: ${invDate}`, 14, 35);
    doc.text(`Due Date: ${invDue}`, 14, 40);

    // Company Info (Right aligned)
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(fromName, 196, 22, { align: 'right' });
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    if (fromAddress) {
      const splitAddress = doc.splitTextToSize(fromAddress, 60);
      doc.text(splitAddress, 196, 28, { align: 'right' });
    }
    if (fromContact) {
      doc.text(fromContact, 196, 45, { align: 'right' });
    }

    // Bill To
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('Bill To:', 14, 55);
    doc.setFontSize(11);
    doc.text(toName, 14, 62);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    if (toAddress) {
      const splitToAddress = doc.splitTextToSize(toAddress, 80);
      doc.text(splitToAddress, 14, 67);
    }

    // Table
    const tableBody = this.items.map(item => [
      item.desc || 'Item',
      item.qty.toString(),
      `${currency}${item.price.toFixed(2)}`,
      `${currency}${(item.qty * item.price).toFixed(2)}`
    ]);

    doc.autoTable({
      startY: 85,
      head: [['Description', 'Qty', 'Unit Price', 'Amount']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      styles: { font: 'helvetica', fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 35, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' }
      }
    });

    // Totals
    const finalY = doc.lastAutoTable.finalY || 85;
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Subtotal:', 140, finalY + 10);
    doc.text(`${currency}${subtotal.toFixed(2)}`, 196, finalY + 10, { align: 'right' });
    
    doc.text(`Tax (${this.inTax.value}%):`, 140, finalY + 16);
    doc.text(`${currency}${tax.toFixed(2)}`, 196, finalY + 16, { align: 'right' });
    
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', 140, finalY + 24);
    doc.text(`${currency}${total.toFixed(2)}`, 196, finalY + 24, { align: 'right' });

    doc.save(`Invoice_${invNum}.pdf`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => window.invoiceGenerator = new InvoiceGenerator(), 300);
});