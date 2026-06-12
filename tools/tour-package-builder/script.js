document.addEventListener('DOMContentLoaded', () => {
  // Themes Definition (26 Themes)
  const themes = [
    { name: 'Sky Blue (Default)', primary: '#0ea5e9', headerBg: '#0f172a', headerText: '#ffffff', font: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
    { name: 'Midnight Elegance', primary: '#fbbf24', headerBg: '#1e1e2f', headerText: '#fcd34d', font: "Georgia, serif" },
    { name: 'Desert Sand', primary: '#d97706', headerBg: '#451a03', headerText: '#fef3c7', font: "'Trebuchet MS', sans-serif" },
    { name: 'Forest Green', primary: '#10b981', headerBg: '#064e3b', headerText: '#d1fae5', font: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
    { name: 'Ocean Breeze', primary: '#14b8a6', headerBg: '#164e63', headerText: '#cffafe', font: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
    { name: 'Royal Purple', primary: '#8b5cf6', headerBg: '#2e1065', headerText: '#ede9fe', font: "Palatino, 'Palatino Linotype', serif" },
    { name: 'Sunset Coral', primary: '#f43f5e', headerBg: '#4c0519', headerText: '#ffe4e6', font: "Arial, sans-serif" },
    { name: 'Ruby Red', primary: '#ef4444', headerBg: '#7f1d1d', headerText: '#fee2e2', font: "'Times New Roman', Times, serif" },
    { name: 'Minimalist Mono', primary: '#171717', headerBg: '#000000', headerText: '#ffffff', font: "'Courier New', Courier, monospace" },
    { name: 'Tropical Paradise', primary: '#84cc16', headerBg: '#14532d', headerText: '#ecfccb', font: "'Comic Sans MS', cursive, sans-serif" },
    { name: 'Sakura Pink', primary: '#ec4899', headerBg: '#831843', headerText: '#fce7f3', font: "Georgia, serif" },
    { name: 'Golden Horizon', primary: '#eab308', headerBg: '#713f12', headerText: '#fef9c3', font: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
    { name: 'Corporate Grey', primary: '#64748b', headerBg: '#1e293b', headerText: '#f8fafc', font: "Arial, sans-serif" },
    { name: 'Tuscan Earth', primary: '#c2410c', headerBg: '#431407', headerText: '#ffedd5', font: "Palatino, 'Palatino Linotype', serif" },
    { name: 'Alpine Snow', primary: '#38bdf8', headerBg: '#082f49', headerText: '#e0f2fe', font: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
    { name: 'Lavender Dreams', primary: '#a855f7', headerBg: '#3b0764', headerText: '#f3e8ff', font: "'Trebuchet MS', sans-serif" },
    { name: 'Deep Navy', primary: '#3b82f6', headerBg: '#1e3a8a', headerText: '#dbeafe', font: "Arial, sans-serif" },
    { name: 'Emerald Isle', primary: '#059669', headerBg: '#022c22', headerText: '#d1fae5', font: "Georgia, serif" },
    { name: 'Autumn Leaves', primary: '#ea580c', headerBg: '#3f1d38', headerText: '#ffedd5', font: "'Times New Roman', Times, serif" },
    { name: 'Berry Smoothie', primary: '#d946ef', headerBg: '#4a044e', headerText: '#fae8ff', font: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
    { name: 'Slate & Copper', primary: '#b45309', headerBg: '#334155', headerText: '#fef3c7', font: "Palatino, 'Palatino Linotype', serif" },
    { name: 'Aqua Marine', primary: '#06b6d4', headerBg: '#083344', headerText: '#cffafe', font: "Arial, sans-serif" },
    { name: 'Rose Gold', primary: '#f43f5e', headerBg: '#fff1f2', headerText: '#881337', font: "Georgia, serif" },
    { name: 'Olive Grove', primary: '#65a30d', headerBg: '#3f6212', headerText: '#ecfccb', font: "'Trebuchet MS', sans-serif" },
    { name: 'Neon Cyber', primary: '#06b6d4', headerBg: '#000000', headerText: '#22d3ee', font: "'Courier New', Courier, monospace" },
    { name: 'Safari Khaki', primary: '#854d0e', headerBg: '#fef3c7', headerText: '#451a03', font: "Arial, sans-serif" }
  ];

  // Initial Data
  let days = [
    {
      id: 1,
      title: 'Arrival in Dubai & Marina Cruise',
      desc: 'Meet and greet at Dubai International Airport. Transfer to your hotel. In the evening, enjoy a Dhow Cruise Dinner at Dubai Marina with live entertainment.',
      img: 'https://images.unsplash.com/photo-1546412414-8035e1776c9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 2,
      title: 'Dubai City Tour & Burj Khalifa',
      desc: 'Half day city tour covering Dubai Museum, Jumeirah Mosque, and Kite Beach. Afternoon visit to the Dubai Mall and Burj Khalifa 124th floor observation deck.',
      img: 'https://images.unsplash.com/photo-1526495124232-a04e1849168c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
  ];

  // Inputs
  const themeSelect = document.getElementById('doc-theme');
  const aName = document.getElementById('a-name');
  const aLogoUpload = document.getElementById('a-logo-upload');
  const aLogoUrl = document.getElementById('a-logo-url');

  const pTitle = document.getElementById('p-title');
  const pSubtitle = document.getElementById('p-subtitle');
  const pImageUpload = document.getElementById('p-image-upload');
  const pImageUrl = document.getElementById('p-image-url');
  const pDuration = document.getElementById('p-duration');
  const pPrice = document.getElementById('p-price');
  const pInc = document.getElementById('p-inc');
  const pExc = document.getElementById('p-exc');
  
  const daysWrapper = document.getElementById('days-wrapper');
  const addDayBtn = document.getElementById('add-day-btn');
  const downloadImgBtn = document.getElementById('download-img-btn');
  const printBtn = document.getElementById('print-btn');

  // Outputs (Doc)
  const docPreview = document.getElementById('doc-preview');
  const docAgencyLogo = document.getElementById('doc-agency-logo');
  const docAgencyName = document.getElementById('doc-agency-name');
  const docHeroImg = document.getElementById('doc-hero-img');
  const docTitle = document.getElementById('doc-title');
  const docSubtitle = document.getElementById('doc-subtitle');
  const docDuration = document.getElementById('doc-duration');
  const docPrice = document.getElementById('doc-price');
  const docTimeline = document.getElementById('doc-timeline');
  const docInc = document.getElementById('doc-inc');
  const docExc = document.getElementById('doc-exc');

  function initThemes() {
    themes.forEach((t, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = t.name;
      themeSelect.appendChild(opt);
    });
    applyTheme(0);
  }

  function applyTheme(index) {
    const t = themes[index];
    docPreview.style.setProperty('--theme-primary', t.primary);
    docPreview.style.setProperty('--theme-header-bg', t.headerBg);
    docPreview.style.setProperty('--theme-header-text', t.headerText);
    docPreview.style.setProperty('--theme-font', t.font);
  }

  themeSelect.addEventListener('change', (e) => {
    applyTheme(e.target.value);
  });

  // Handle Image Upload Helper
  function handleImageUpload(file, callback) {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        callback(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  // Agency Logo Upload
  aLogoUpload.addEventListener('change', (e) => {
    handleImageUpload(e.target.files[0], (dataUrl) => {
      aLogoUrl.value = dataUrl;
      updateDocument();
    });
  });

  // Hero Image Upload
  pImageUpload.addEventListener('change', (e) => {
    handleImageUpload(e.target.files[0], (dataUrl) => {
      pImageUrl.value = dataUrl;
      updateDocument();
    });
  });

  function renderDaysForm() {
    daysWrapper.innerHTML = '';
    days.forEach((day, index) => {
      const dayEl = document.createElement('div');
      dayEl.className = 'day-container';
      dayEl.innerHTML = `
        <button type="button" class="remove-btn" data-index="${index}">×</button>
        <div style="font-weight: 700; color: var(--travel-primary); margin-bottom: 0.5rem; font-size: 0.85rem;">DAY ${index + 1}</div>
        <div class="form-group" style="margin-bottom: 0.75rem;">
          <input type="text" class="day-title-input" placeholder="e.g. Arrival in Dubai" value="${day.title}">
        </div>
        <div class="form-group" style="margin-bottom: 0.75rem;">
          <textarea class="day-desc-input" rows="3" placeholder="Describe the day's activities...">${day.desc}</textarea>
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
            <input type="file" class="day-img-upload" accept="image/*" style="flex: 1; padding: 0.5rem; font-size: 0.85rem; background: var(--bg-secondary); cursor: pointer;">
          </div>
          <input type="text" class="day-img-input" placeholder="Or paste Image URL here..." value="${day.img || ''}">
        </div>
      `;

      // Event Listeners for day inputs
      dayEl.querySelector('.remove-btn').addEventListener('click', () => {
        days.splice(index, 1);
        renderDaysForm();
        updateDocument();
      });

      // Handle Day image upload
      const uploadInput = dayEl.querySelector('.day-img-upload');
      const urlInput = dayEl.querySelector('.day-img-input');
      
      uploadInput.addEventListener('change', (e) => {
        handleImageUpload(e.target.files[0], (dataUrl) => {
          urlInput.value = dataUrl;
          day.img = dataUrl;
          updateDocument();
        });
      });

      const inputs = dayEl.querySelectorAll('input[type="text"], textarea');
      inputs.forEach(input => {
        input.addEventListener('input', (e) => {
          if (e.target.classList.contains('day-title-input')) day.title = e.target.value;
          if (e.target.classList.contains('day-desc-input')) day.desc = e.target.value;
          if (e.target.classList.contains('day-img-input')) day.img = e.target.value;
          updateDocument();
        });
      });

      daysWrapper.appendChild(dayEl);
    });
  }

  function renderLists(textStr, container) {
    container.innerHTML = '';
    const lines = textStr.split('\n').filter(line => line.trim() !== '');
    lines.forEach(line => {
      const li = document.createElement('li');
      li.textContent = line.trim();
      container.appendChild(li);
    });
  }

  function updateDocument() {
    // Agency Info
    if (aLogoUrl.value) {
      docAgencyLogo.src = aLogoUrl.value;
      docAgencyLogo.style.display = 'block';
    } else {
      docAgencyLogo.style.display = 'none';
    }
    docAgencyName.textContent = aName.value || 'Dream Travels';

    // Header Info
    docTitle.textContent = pTitle.value || 'Tour Package';
    docSubtitle.textContent = pSubtitle.value || 'Amazing Trip';
    docDuration.textContent = pDuration.value || '-';
    docPrice.textContent = pPrice.value || '-';
    docHeroImg.src = pImageUrl.value || 'https://via.placeholder.com/1920x600?text=Hero+Image';

    // Lists
    renderLists(pInc.value, docInc);
    renderLists(pExc.value, docExc);

    // Timeline
    docTimeline.innerHTML = '';
    days.forEach((day, i) => {
      let imgHtml = '';
      if (day.img && day.img.trim() !== '') {
        imgHtml = `<img src="${day.img}" class="day-image" alt="Day ${i + 1}">`;
      }

      const dEl = document.createElement('div');
      dEl.className = 'day-item';
      dEl.innerHTML = `
        <div class="day-marker"></div>
        <div class="day-title">Day ${i + 1}: ${day.title || 'Untitled'}</div>
        <div class="day-desc">${day.desc ? day.desc.replace(/\n/g, '<br>') : ''}</div>
        ${imgHtml}
      `;
      docTimeline.appendChild(dEl);
    });
  }

  addDayBtn.addEventListener('click', () => {
    days.push({ id: Date.now(), title: '', desc: '', img: '' });
    renderDaysForm();
    updateDocument();
  });

  // Global Change Listeners
  [aName, aLogoUrl, pTitle, pSubtitle, pImageUrl, pDuration, pPrice, pInc, pExc].forEach(el => {
    el.addEventListener('input', updateDocument);
  });

  if (downloadImgBtn) {
    downloadImgBtn.addEventListener('click', () => {
      const originalText = downloadImgBtn.innerHTML;
      downloadImgBtn.innerHTML = 'Generating...';
      downloadImgBtn.disabled = true;

      html2canvas(docPreview, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      }).then(canvas => {
        const link = document.createElement('a');
        link.download = `${pTitle.value || 'tour_package'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        downloadImgBtn.innerHTML = originalText;
        downloadImgBtn.disabled = false;
      }).catch(err => {
        console.error('Error generating image', err);
        downloadImgBtn.innerHTML = originalText;
        downloadImgBtn.disabled = false;
        alert('Could not generate image. Check if images have CORS issues.');
      });
    });
  }

  printBtn.addEventListener('click', () => {
    window.print();
  });

  // Init
  initThemes();
  renderDaysForm();
  updateDocument();
});
