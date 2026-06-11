document.addEventListener('DOMContentLoaded', () => {
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
  const pTitle = document.getElementById('p-title');
  const pSubtitle = document.getElementById('p-subtitle');
  const pImage = document.getElementById('p-image');
  const pDuration = document.getElementById('p-duration');
  const pPrice = document.getElementById('p-price');
  const pInc = document.getElementById('p-inc');
  const pExc = document.getElementById('p-exc');
  
  const daysWrapper = document.getElementById('days-wrapper');
  const addDayBtn = document.getElementById('add-day-btn');
  const printBtn = document.getElementById('print-btn');

  // Outputs (Doc)
  const docHeroImg = document.getElementById('doc-hero-img');
  const docTitle = document.getElementById('doc-title');
  const docSubtitle = document.getElementById('doc-subtitle');
  const docDuration = document.getElementById('doc-duration');
  const docPrice = document.getElementById('doc-price');
  const docTimeline = document.getElementById('doc-timeline');
  const docInc = document.getElementById('doc-inc');
  const docExc = document.getElementById('doc-exc');

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
          <input type="text" class="day-img-input" placeholder="Image URL (Optional)" value="${day.img || ''}">
        </div>
      `;

      // Event Listeners for day inputs
      dayEl.querySelector('.remove-btn').addEventListener('click', () => {
        days.splice(index, 1);
        renderDaysForm();
        updateDocument();
      });

      const inputs = dayEl.querySelectorAll('input, textarea');
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
    // Header Info
    docTitle.textContent = pTitle.value || 'Tour Package';
    docSubtitle.textContent = pSubtitle.value || 'Amazing Trip';
    docDuration.textContent = pDuration.value || '-';
    docPrice.textContent = pPrice.value || '-';
    docHeroImg.src = pImage.value || 'https://via.placeholder.com/1920x600?text=Hero+Image';

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
  [pTitle, pSubtitle, pImage, pDuration, pPrice, pInc, pExc].forEach(el => {
    el.addEventListener('input', updateDocument);
  });

  printBtn.addEventListener('click', () => {
    window.print();
  });

  // Init
  renderDaysForm();
  updateDocument();
});
