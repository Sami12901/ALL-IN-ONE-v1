document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    name: document.getElementById('cand-name'),
    wpm: document.getElementById('cand-wpm'),
    acc: document.getElementById('cand-acc'),
    date: document.getElementById('cand-date'),
    id: document.getElementById('cand-id'),
    printBtn: document.getElementById('print-btn'),
    
    prevName: document.getElementById('preview-name'),
    prevWpm: document.getElementById('preview-wpm'),
    prevAcc: document.getElementById('preview-acc'),
    prevDate: document.getElementById('preview-date'),
    prevId: document.getElementById('preview-id'),
    
    scaleWrapper: document.getElementById('scale-wrapper')
  };

  // Generate a random ID on load
  function generateId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'AIO-TYP-';
    for (let i = 0; i < 8; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }

  // Set today's date as default
  const today = new Date();
  elements.date.value = today.toISOString().split('T')[0];
  elements.id.value = generateId();

  function formatDate(dateString) {
    if (!dateString) return '';
    const d = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return d.toLocaleDateString('en-US', options);
  }

  function updatePreview() {
    elements.prevName.textContent = elements.name.value || 'John Doe';
    elements.prevWpm.textContent = elements.wpm.value || '0';
    elements.prevAcc.textContent = (elements.acc.value || '0') + '%';
    elements.prevDate.textContent = formatDate(elements.date.value);
    elements.prevId.textContent = elements.id.value;
  }

  function resizeScale() {
    // A4 Landscape is ~1123px wide
    const targetWidth = 1123;
    const containerWidth = elements.scaleWrapper.parentElement.clientWidth - 40; // 40px padding
    
    if (containerWidth < targetWidth) {
      const scale = containerWidth / targetWidth;
      elements.scaleWrapper.style.transform = `scale(${scale})`;
      // elements.scaleWrapper.parentElement.style.height = `${794 * scale + 40}px`;
    } else {
      elements.scaleWrapper.style.transform = 'scale(1)';
    }
  }

  // Event Listeners
  elements.name.addEventListener('input', updatePreview);
  elements.wpm.addEventListener('input', updatePreview);
  elements.acc.addEventListener('input', updatePreview);
  elements.date.addEventListener('input', updatePreview);
  
  elements.printBtn.addEventListener('click', () => {
    window.print();
  });

  window.addEventListener('resize', resizeScale);

  // Init
  updatePreview();
  // Small delay to let fonts load and container measure properly
  setTimeout(resizeScale, 100);
});
