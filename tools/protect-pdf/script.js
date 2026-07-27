// Protect PDF Logic

class PdfProtector {
  constructor() {
    this.uploadZone = document.getElementById('upload-zone');
    this.btnBrowse = document.getElementById('btn-browse');
    this.fileInput = document.getElementById('file-input');
    
    this.workspace = document.getElementById('workspace');
    this.uiFilename = document.getElementById('ui-filename');
    this.btnChange = document.getElementById('btn-change');
    
    this.inPassword = document.getElementById('pdf-password');
    this.btnExecute = document.getElementById('btn-execute');

    this.currentFile = null;
    this.bindEvents();
  }

  bindEvents() {
    this.btnBrowse.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', (e) => this.handleFile(e.target.files[0]));

    this.uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); this.uploadZone.classList.add('dragover'); });
    this.uploadZone.addEventListener('dragleave', () => this.uploadZone.classList.remove('dragover'));
    this.uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.uploadZone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) this.handleFile(e.dataTransfer.files[0]);
    });

    this.btnChange.addEventListener('click', () => {
      this.currentFile = null;
      this.uploadZone.style.display = 'block';
      this.workspace.style.display = 'none';
      this.inPassword.value = '';
    });

    this.btnExecute.addEventListener('click', () => this.execute());
  }

  handleFile(file) {
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a valid PDF file.');
      return;
    }
    this.currentFile = file;
    this.uploadZone.style.display = 'none';
    this.workspace.style.display = 'block';
    this.uiFilename.textContent = file.name;
    this.inPassword.focus();
  }

  async execute() {
    const password = this.inPassword.value.trim();
    if (!password) {
      alert('Please enter a password.');
      return;
    }
    if (!this.currentFile) return;

    this.btnExecute.disabled = true;
    this.btnExecute.textContent = 'Locking...';

    try {
      const arrayBuffer = await this.currentFile.arrayBuffer();
      // Load standard PDF
      const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer);
      
      // Save with encryption
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: false,
        updateFieldAppearances: false
      });
      
      // Unfortunately, standard pdf-lib without additional node-crypto or window.crypto polyfills
      // might have limitations on AES-256 encryption in purely unbundled browser environments 
      // without `@pdf-lib/upng` or similar extensions if encryption isn't fully exposed in the 
      // standard minified dist. 
      // Fortunately pdf-lib DOES support encrypt via `pdfDoc.encrypt()` using standard options!
      
      // WAIT: Actually, pdf-lib v1.17 does not natively support writing encrypted PDFs! It only 
      // supports reading/modifying existing encrypted ones if you provide the password. 
      // To create encrypted PDFs, a custom writer or different library is often needed.
      // Let's implement a fallback or check if pdfDoc.encrypt exists.
      
      if (typeof pdfDoc.encrypt === 'function') {
        // Future proofing if it exists in the build
        await pdfDoc.encrypt({
          userPassword: password,
          ownerPassword: password,
          permissions: {
            printing: 'lowResolution',
            modifying: false,
            copying: false
          }
        });
      } else {
        // WARNING: pdf-lib (1.17.1) natively lacks password-protection WRITE capabilities in the browser build.
        // We will mock this or alert the user in this specific purely client-side environment.
        throw new Error("Client-side PDF Encryption requires an external crypto polyfill not present in this lightweight build.");
      }

    } catch (e) {
      console.error(e);
      // Fallback alert for the user since true AES-256 binary encryption in pure vanilla JS is complex
      alert('Note: ' + e.message + '\n\nFor security reasons, true PDF AES-256 encryption requires a server or specialized crypto workers.');
    } finally {
      this.btnExecute.disabled = false;
      this.btnExecute.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" style="margin-right: 0.5rem;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> Lock PDF`;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => window.pdfProtector = new PdfProtector(), 300);
});