// Unlock PDF Logic - 100% Client-side
/* global PDFLib */

class PdfUnlocker {
  constructor() {
    this.uploadZone = document.getElementById('upload-zone');
    this.btnBrowse = document.getElementById('btn-browse');
    this.fileInput = document.getElementById('file-input');
    
    this.workspace = document.getElementById('workspace');
    this.uiFilename = document.getElementById('ui-filename');
    this.uiFilesize = document.getElementById('ui-filesize');
    this.uiPages = document.getElementById('ui-pages');
    this.btnChangeFile = document.getElementById('btn-change-file');
    
    this.passwordSection = document.getElementById('password-section');
    this.passwordInput = document.getElementById('pdf-password');
    this.btnTogglePw = document.getElementById('btn-toggle-pw');
    this.pwIconEye = document.getElementById('pw-icon-eye');
    this.pwIconEyeOff = document.getElementById('pw-icon-eye-off');
    
    this.statusAlert = document.getElementById('status-alert');
    this.btnUnlock = document.getElementById('btn-unlock');
    this.btnUnlockText = document.getElementById('btn-unlock-text');
    
    this.successCard = document.getElementById('success-card');
    this.resOrigSize = document.getElementById('res-orig-size');
    this.resNewSize = document.getElementById('res-new-size');
    this.resSavingsBadge = document.getElementById('res-savings-badge');
    this.resPages = document.getElementById('res-pages');
    this.btnDownload = document.getElementById('btn-download');
    this.btnReset = document.getElementById('btn-reset');

    this.currentFile = null;
    this.fileBuffer = null;
    this.unlockedBlobUrl = null;
    this.unlockedFileName = '';
    this.isEncrypted = false;

    this.bindEvents();
  }

  bindEvents() {
    // File Selection
    this.btnBrowse.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.handleFile(e.target.files[0]);
      }
    });

    // Drag and Drop
    this.uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.uploadZone.classList.add('dragover');
    });
    this.uploadZone.addEventListener('dragleave', () => {
      this.uploadZone.classList.remove('dragover');
    });
    this.uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.uploadZone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        this.handleFile(e.dataTransfer.files[0]);
      }
    });

    // Change File / Reset
    this.btnChangeFile.addEventListener('click', () => this.reset());
    this.btnReset.addEventListener('click', () => this.reset());

    // Password Toggle
    this.btnTogglePw.addEventListener('click', () => this.togglePasswordVisibility());

    // Keydown Enter on password field
    this.passwordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.unlockPdf();
      }
    });

    // Unlock Action
    this.btnUnlock.addEventListener('click', () => this.unlockPdf());

    // Download Action
    this.btnDownload.addEventListener('click', () => this.downloadUnlockedPdf());
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  togglePasswordVisibility() {
    const isPassword = this.passwordInput.type === 'password';
    this.passwordInput.type = isPassword ? 'text' : 'password';
    this.pwIconEye.style.display = isPassword ? 'none' : 'block';
    this.pwIconEyeOff.style.display = isPassword ? 'block' : 'none';
  }

  showAlert(message, type = 'error') {
    this.statusAlert.className = `status-alert ${type}`;
    this.statusAlert.innerHTML = `
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" style="flex-shrink: 0;">
        ${type === 'error'
          ? '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'
          : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>'}
      </svg>
      <div>${message}</div>
    `;
    this.statusAlert.style.display = 'flex';
  }

  clearAlert() {
    this.statusAlert.style.display = 'none';
    this.statusAlert.innerHTML = '';
  }

  async handleFile(file) {
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a valid PDF file.');
      return;
    }

    this.currentFile = file;
    this.uiFilename.textContent = file.name;
    this.uiFilesize.textContent = this.formatBytes(file.size);
    this.uiPages.textContent = 'Analyzing security...';
    
    this.uploadZone.style.display = 'none';
    this.workspace.style.display = 'flex';
    this.successCard.style.display = 'none';
    this.passwordSection.style.display = 'flex';
    this.passwordInput.value = '';
    this.clearAlert();

    try {
      this.fileBuffer = await file.arrayBuffer();

      // Check if file is encrypted by attempting to load without password
      try {
        const doc = await PDFLib.PDFDocument.load(this.fileBuffer, { ignoreEncryption: false });
        const pageCount = doc.getPageCount();
        this.isEncrypted = false;
        this.uiPages.textContent = `${pageCount} Page${pageCount !== 1 ? 's' : ''} (Restrictions Only / No Open Password)`;
        this.showAlert('Document loaded. No open password required! Click Unlock below to sanitize and remove all permission/security restrictions.', 'info');
      } catch (err) {
        // Encrypted PDF
        this.isEncrypted = true;
        this.uiPages.textContent = 'Password Protected (Encrypted)';
        this.showAlert('This document is encrypted. Please enter the password to unlock it.', 'error');
        this.passwordInput.focus();
      }
    } catch (e) {
      console.error(e);
      alert('Failed to read the PDF file: ' + e.message);
      this.reset();
    }
  }

  async unlockPdf() {
    if (!this.fileBuffer) return;

    const password = this.passwordInput.value.trim();
    if (this.isEncrypted && !password) {
      this.showAlert('Please enter the password to decrypt this document.', 'error');
      this.passwordInput.focus();
      return;
    }

    this.clearAlert();
    this.setProcessing(true);

    try {
      // Load PDF with password and ignoreEncryption: true to bypass restriction flags
      const loadOptions = {
        ignoreEncryption: true
      };
      if (password) {
        loadOptions.password = password;
      }

      let pdfDoc;
      try {
        pdfDoc = await PDFLib.PDFDocument.load(this.fileBuffer, loadOptions);
      } catch (loadErr) {
        // If loading failed, it might be an invalid password
        if (loadErr.name === 'EncryptedPDFError' || (loadErr.message && loadErr.message.toLowerCase().includes('password'))) {
          throw new Error('Incorrect password. Please verify the password and try again.');
        }
        throw loadErr;
      }

      const pageCount = pdfDoc.getPageCount();

      // Remove encryption dictionary from trailer to completely strip encryption upon save
      if (pdfDoc.context && pdfDoc.context.trailerInfo) {
        if (pdfDoc.context.trailerInfo.Encrypt) {
          try {
            pdfDoc.context.delete(pdfDoc.context.trailerInfo.Encrypt);
          } catch (e) {
            console.warn('Could not delete Encrypt object:', e);
          }
          delete pdfDoc.context.trailerInfo.Encrypt;
        }
      }

      // Save as completely decrypted and unencrypted PDF
      const unlockedBytes = await pdfDoc.save({
        useObjectStreams: false,
        updateFieldAppearances: false
      });

      // Calculate size comparisons
      const origSize = this.currentFile.size;
      const newSize = unlockedBytes.byteLength;
      const sizeDiff = newSize - origSize;
      const diffPercent = origSize > 0 ? ((sizeDiff / origSize) * 100).toFixed(1) : 0;

      this.resOrigSize.textContent = this.formatBytes(origSize);
      this.resNewSize.textContent = this.formatBytes(newSize);
      this.resPages.textContent = `${pageCount} Page${pageCount !== 1 ? 's' : ''}`;

      if (sizeDiff < 0) {
        const savedBytes = Math.abs(sizeDiff);
        this.resSavingsBadge.textContent = `${this.formatBytes(savedBytes)} smaller (${Math.abs(diffPercent)}%)`;
        this.resSavingsBadge.style.color = '#34d399';
        this.resSavingsBadge.style.background = 'rgba(16, 185, 129, 0.2)';
      } else if (sizeDiff > 0) {
        this.resSavingsBadge.textContent = `+${this.formatBytes(sizeDiff)} (${diffPercent}%)`;
        this.resSavingsBadge.style.color = 'var(--text-secondary)';
        this.resSavingsBadge.style.background = 'rgba(255, 255, 255, 0.1)';
      } else {
        this.resSavingsBadge.textContent = 'Same Size';
      }

      // Prepare Download Blob
      if (this.unlockedBlobUrl) {
        URL.revokeObjectURL(this.unlockedBlobUrl);
      }
      const blob = new Blob([unlockedBytes], { type: 'application/pdf' });
      this.unlockedBlobUrl = URL.createObjectURL(blob);
      
      const baseName = this.currentFile.name.replace(/\.pdf$/i, '');
      this.unlockedFileName = `${baseName}_unlocked.pdf`;

      // Show Success State
      this.passwordSection.style.display = 'none';
      this.successCard.style.display = 'flex';
      this.uiPages.textContent = `${pageCount} Page${pageCount !== 1 ? 's' : ''} (Fully Unlocked)`;

    } catch (err) {
      console.error(err);
      this.showAlert(err.message || 'Failed to unlock PDF. Please check your password and file.', 'error');
    } finally {
      this.setProcessing(false);
    }
  }

  setProcessing(isProcessing) {
    this.btnUnlock.disabled = isProcessing;
    if (isProcessing) {
      this.btnUnlockText.textContent = 'Decrypting & Removing Restrictions...';
    } else {
      this.btnUnlockText.textContent = 'Unlock & Decrypt PDF';
    }
  }

  downloadUnlockedPdf() {
    if (!this.unlockedBlobUrl) return;
    const a = document.createElement('a');
    a.href = this.unlockedBlobUrl;
    a.download = this.unlockedFileName || 'unlocked_document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  reset() {
    if (this.unlockedBlobUrl) {
      URL.revokeObjectURL(this.unlockedBlobUrl);
      this.unlockedBlobUrl = null;
    }
    this.currentFile = null;
    this.fileBuffer = null;
    this.fileInput.value = '';
    this.passwordInput.value = '';
    this.clearAlert();

    this.workspace.style.display = 'none';
    this.uploadZone.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.pdfUnlocker = new PdfUnlocker();
});