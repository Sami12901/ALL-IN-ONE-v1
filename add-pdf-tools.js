const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'tools-db.json');
let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const newTools = [
  { name: 'PDF Editor Pro', desc: 'Edit PDF, Add Text, Images, Shapes, Links, Annotate, Fill Forms, Sign PDF.' },
  { name: 'PDF Merge', desc: 'Combine Multiple PDFs, PDF + Images, Drag & Drop Reorder.', active: true },
  { name: 'PDF Split', desc: 'Split by Pages, Split by Range, Extract Pages, Split Every Page.' },
  { name: 'PDF Compress', desc: 'Reduce PDF Size (Low, Medium, High Compression).' },
  { name: 'PDF Organize', desc: 'Reorder, Delete, Rotate, and Duplicate PDF Pages.' },
  { name: 'Protect PDF', desc: 'Add Password, Restrict Printing and Editing.' },
  { name: 'Unlock PDF', desc: 'Remove Password and Restrictions from PDF files.' },
  { name: 'Watermark PDF', desc: 'Add Text, Image, or Logo Watermarks to your PDFs.' },
  { name: 'Flatten PDF', desc: 'Make PDF Read Only, Flatten Forms and Annotations.' },
  { name: 'PDF to Word', desc: 'Convert PDF to DOCX format easily.' },
  { name: 'PDF to Excel', desc: 'Convert PDF to XLSX or CSV formats.' },
  { name: 'PDF to PowerPoint', desc: 'Convert PDF to PPTX format.' },
  { name: 'PDF to Text', desc: 'Extract all text content from PDF files.' },
  { name: 'PDF to JPG', desc: 'Convert PDF pages to JPG, PNG, or WEBP images.' },
  { name: 'Word to PDF', desc: 'Convert DOCX files to PDF.' },
  { name: 'Excel to PDF', desc: 'Convert XLSX files to PDF.' },
  { name: 'HTML to PDF', desc: 'Convert websites or HTML code to PDF.' },
  { name: 'JPG to PDF', desc: 'Convert Images (JPG/PNG) into a single PDF.' },
  { name: 'PNG to PDF', desc: 'Convert PNG images to PDF.' },
  { name: 'Text to PDF', desc: 'Convert TXT files to PDF.' },
  { name: 'Delete Pages', desc: 'Remove selected pages from a PDF.' },
  { name: 'Extract Pages', desc: 'Create a new PDF from specific pages.' },
  { name: 'Page Numbers', desc: 'Add page numbers to your PDF document.' },
  { name: 'Header & Footer', desc: 'Add headers and footers to PDF pages.' },
  { name: 'Crop PDF', desc: 'Trim margins and resize PDF pages.' },
  { name: 'Resize PDF', desc: 'Resize PDF to A4, A5, Letter, Legal, or Custom Size.' },
  { name: 'Edit Metadata', desc: 'Edit PDF Author, Title, Subject, and Keywords.' },
  { name: 'Metadata Viewer', desc: 'View complete PDF information and metadata.' },
  { name: 'Remove Metadata', desc: 'Privacy cleanup: Remove all metadata from PDF.' },
  { name: 'Extract Images', desc: 'Extract all embedded images from a PDF.' },
  { name: 'Extract Fonts', desc: 'Extract embedded fonts from a PDF file.' },
  { name: 'Grayscale PDF', desc: 'Convert Color PDF to Grayscale/Black & White.' },
  { name: 'Invoice PDF Generator', desc: 'Generate Business and Travel Agency Invoices.' },
  { name: 'Quotation PDF Generator', desc: 'Generate Travel Quotations and Business Proposals.' },
  { name: 'Receipt PDF Generator', desc: 'Generate Payment and Booking Receipts.' },
  { name: 'Visa Application PDF Builder', desc: 'Build and fill Visa Forms automatically.' },
  { name: 'Travel Voucher Generator', desc: 'Generate Hotel and Tour Vouchers as PDF.' },
  { name: 'Ticket PDF Generator', desc: 'Create custom Travel Ticket layouts in PDF.' },
  { name: 'Hajj & Umrah Document Builder', desc: 'Generate Pilgrim Forms and Package Documents.' },
  { name: 'AI PDF Analyzer', desc: 'Analyze PDF content using AI.' },
  { name: 'AI OCR Engine', desc: 'AI-powered Optical Character Recognition for PDFs.' },
  { name: 'AI Form Detection', desc: 'Automatically detect and fill forms using AI.' },
  { name: 'AI Document Summary', desc: 'Get AI generated summaries of long PDF documents.' },
  { name: 'AI PDF Translator', desc: 'Translate PDF documents to multiple languages using AI.' },
  { name: 'AI Contract Analyzer', desc: 'Analyze legal contracts and highlight key terms using AI.' },
  { name: 'AI Invoice Reader', desc: 'Extract data from invoices automatically using AI.' },
  { name: 'AI Receipt Scanner', desc: 'Scan and extract data from receipts using AI.' },
  { name: 'AI Document Intelligence', desc: 'Advanced AI intelligence for all your documents.' }
];

// Add if not exist
newTools.forEach(nt => {
  const id = nt.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (!db.find(t => t.id === id)) {
    db.push({
      id: id,
      name: nt.name,
      description: nt.desc,
      category: 'pdf',
      active: nt.active === true,
      tags: ['pdf', 'document', id.replace(/-/g, ' ')]
    });
  } else if (nt.active) {
    const existing = db.find(t => t.id === id);
    existing.active = true;
  }
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('Added PDF tools to database.');
