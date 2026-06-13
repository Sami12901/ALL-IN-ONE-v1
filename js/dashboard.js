// ALL IN ONE Dashboard Engine

const CATEGORY_ICONS = {
  text: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`,
  typing: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect><line x1="6" y1="8" x2="6.01" y2="8"></line><line x1="10" y1="8" x2="10.01" y2="8"></line><line x1="14" y1="8" x2="14.01" y2="8"></line><line x1="18" y1="8" x2="18.01" y2="8"></line><line x1="6" y1="12" x2="6.01" y2="12"></line><line x1="10" y1="12" x2="10.01" y2="12"></line><line x1="14" y1="12" x2="14.01" y2="12"></line><line x1="18" y1="12" x2="18.01" y2="12"></line><line x1="7" y1="16" x2="17" y2="16"></line></svg>`,
  seo: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></svg>`,
  "digital-marketing": `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h4l3-9 5 18 3-9h5"></path></svg>`,
  pdf: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M16 13H8"></path><path d="M16 17H8"></path><path d="M10 9H8"></path></svg>`,
  developer: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
  color: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.35857 19.5 5.5 20.5 5 21C4.5 21.5 3.5 21 3 20.5C1.5 19 1 17 1 15C1 8.92487 5.92487 4 12 4C18.0751 4 23 8.92487 23 15C23 18 20 21 16 21C14.5 21 13.5 20.5 13 20C12.5 19.5 12 19.5 11.5 20C11 20.5 10.5 22 12 22Z"></path></svg>`,
  image: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`,
  math: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line><line x1="5" y1="18" x2="19" y2="18"></line><line x1="5" y1="6" x2="19" y2="6"></line></svg>`,
  security: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
  social: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
  business: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
  student: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg>`,
  utility: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
  converter: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`,
  travel: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path></svg>`,
  ecommerce: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`,
  luxury: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  pdf: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
  excel: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><line x1="10" y1="9" x2="14" y2="9"></line></svg>`
};

const STAR_FILLED = `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--warning); display: block;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
const STAR_EMPTY = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;

document.addEventListener('DOMContentLoaded', () => {
  const mainToolsGrid = document.getElementById('main-tools-grid');
  const popularToolsGrid = document.getElementById('popular-tools-grid');
  const searchInput = document.getElementById('tool-search');
  const clearSearchBtn = document.getElementById('clear-search');
  const categoryTabs = document.querySelectorAll('.category-tab');
  
  let toolsDatabase = [];
  let activeCategory = 'all';
  let activeStatusFilter = 'all';

  // 1. Initial Data Fetch
  fetch('data/tools-db.json?v=' + new Date().getTime())
    .then(res => res.json())
    .then(data => {
      toolsDatabase = data;
      initDashboard();
    })
    .catch(err => {
      console.error('Could not load tools database for homepage rendering', err);
      if (mainToolsGrid) {
        mainToolsGrid.innerHTML = '<div class="alert-error">Failed to load tools database. Please refresh the page.</div>';
      }
    });

  // 2. Initialize Dashboard Components
  function initDashboard() {
    updateStats();
    renderMainGrid();
    renderPopularGrid();
    setupFilters();
    setupSearch();
    setupFAQ();
    checkUrlParams();
  }

  function updateStats() {
    const travelTools = toolsDatabase.filter(t => t.category === 'travel').length;
    const ecomTools = toolsDatabase.filter(t => t.category === 'ecommerce').length;
    const luxuryTools = toolsDatabase.filter(t => t.category === 'luxury').length;
    const excelTools = toolsDatabase.filter(t => t.category === 'excel').length;
    
    const activeTools = toolsDatabase.filter(t => t.active).length;
    const comingSoonTools = toolsDatabase.filter(t => !t.active).length;

    if(document.getElementById('stat-travel')) document.getElementById('stat-travel').textContent = travelTools;
    if(document.getElementById('stat-ecom')) document.getElementById('stat-ecom').textContent = ecomTools;
    if(document.getElementById('stat-luxury')) document.getElementById('stat-luxury').textContent = luxuryTools;
    if(document.getElementById('stat-biz')) document.getElementById('stat-biz').textContent = excelTools;
    if(document.getElementById('stat-active')) document.getElementById('stat-active').textContent = 'Active: ' + activeTools;
    if(document.getElementById('stat-coming')) document.getElementById('stat-coming').textContent = 'Coming Soon: ' + comingSoonTools;
  }

  // 3. Render Tool Cards to Grid
  function renderMainGrid() {
    if (!mainToolsGrid) return;

    const query = searchInput.value.toLowerCase().trim();
    const filteredTools = filterToolsList(query, activeCategory);

    // Fetch favorites and recents from localStorage
    const favorites = getFavorites();
    const recents = getRecents();

    let html = '';

    const businessSuiteSection = document.getElementById('business-suite-section');
    const popularSection = document.getElementById('popular-section');
    const categoriesTitle = document.getElementById('categories-title');
    const categoriesTabs = document.getElementById('categories-tabs-container');

    // If search is active, just show search results directly
    if (query) {
      if (businessSuiteSection) businessSuiteSection.style.display = 'none';
      if (popularSection) popularSection.style.display = 'none';
      if (categoriesTitle) categoriesTitle.style.display = 'none';
      if (categoriesTabs) categoriesTabs.style.display = 'none';

      if (filteredTools.length === 0) {
        mainToolsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem 1.5rem; color: var(--text-tertiary);">No tools matched your search query.</div>';
        return;
      }
      
      html = filteredTools.map(t => createToolCardHtml(t, favorites.includes(t.id))).join('');
      mainToolsGrid.innerHTML = html;
      bindCardInteractions();
      return;
    }

    // Else if no active search, compile sections (Favorites, Recents, Category items)
    if (businessSuiteSection) businessSuiteSection.style.display = 'block';
    if (popularSection) popularSection.style.display = 'block';
    if (categoriesTitle) categoriesTitle.style.display = 'block';
    if (categoriesTabs) categoriesTabs.style.display = 'flex';

    let sectionsHtml = '';

    // Favorites Section
    if (favorites.length > 0 && activeCategory === 'all') {
      const favTools = toolsDatabase.filter(t => favorites.includes(t.id));
      if (favTools.length > 0) {
        sectionsHtml += `
          <div style="grid-column: 1/-1; margin-top: 1rem;">
            <h3 style="font-family: var(--font-display); font-weight: 700; font-size: 1.5rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" style="color: var(--warning);"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              Favorites
            </h3>
            <div class="tools-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
              ${favTools.map(t => createToolCardHtml(t, true)).join('')}
            </div>
          </div>
        `;
      }
    }

    // Recents Section (last 4 used tools)
    if (recents.length > 0 && activeCategory === 'all') {
      const recentTools = recents
        .map(id => toolsDatabase.find(t => t.id === id))
        .filter(Boolean)
        .slice(0, 4);

      if (recentTools.length > 0) {
        sectionsHtml += `
          <div style="grid-column: 1/-1; margin-top: 1.5rem; margin-bottom: 1rem;">
            <h3 style="font-family: var(--font-display); font-weight: 700; font-size: 1.5rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent);"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              Recently Used
            </h3>
            <div class="tools-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
              ${recentTools.map(t => createToolCardHtml(t, favorites.includes(t.id))).join('')}
            </div>
          </div>
        `;
      }
    }

    // Main Category Title
    const catTitle = activeCategory === 'all' ? 'All Utilities' : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1) + ' Utilities';
    
    sectionsHtml += `
      <div style="grid-column: 1/-1; margin-top: 1.5rem; border-top: 1px solid var(--border); padding-top: 2rem;">
        <h3 style="font-family: var(--font-display); font-weight: 700; font-size: 1.5rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent);"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
          ${catTitle}
        </h3>
      </div>
    `;

    if (filteredTools.length === 0) {
      sectionsHtml += `<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-tertiary);">No tools in this category yet.</div>`;
    } else {
      sectionsHtml += filteredTools.map(t => createToolCardHtml(t, favorites.includes(t.id))).join('');
    }

    mainToolsGrid.innerHTML = sectionsHtml;
    bindCardInteractions();
  }

  // 4. Render Popular Grid Section
  function renderPopularGrid() {
    if (!popularToolsGrid) return;
    const popularTools = toolsDatabase.filter(t => t.popular).slice(0, 4);
    const favorites = getFavorites();

    popularToolsGrid.innerHTML = popularTools.map(t => createToolCardHtml(t, favorites.includes(t.id))).join('');
    bindCardInteractions();
  }

  // 5. Generate Tool Card HTML template
  function createToolCardHtml(tool, isFav) {
    const categoryName = tool.category.toUpperCase().replace(/-/g, ' ');
    const svgIcon = CATEGORY_ICONS[tool.category] || CATEGORY_ICONS.utility;
    const activeBadge = tool.active ? `<span style="background: rgba(16, 185, 129, 0.15); color: var(--success); font-size: 0.65rem; padding: 0.15rem 0.4rem; border-radius: var(--radius-sm); font-weight: 700; letter-spacing: 0.05em; border: 1px solid rgba(16, 185, 129, 0.3);">ACTIVE</span>` : `<span style="background: var(--bg-tertiary); color: var(--text-tertiary); font-size: 0.65rem; padding: 0.15rem 0.4rem; border-radius: var(--radius-sm); font-weight: 600; letter-spacing: 0.05em; border: 1px solid var(--border);">COMING SOON</span>`;

    const cardStatusClass = tool.active ? '' : 'tool-coming-soon';
    return `
      <div class="tool-card glass-panel ${cardStatusClass}" data-id="${tool.id}" style="position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
          <div class="tool-icon-wrapper">${svgIcon}</div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            ${activeBadge}
            <button class="favorite-star" aria-label="Toggle favorite" style="background: transparent; border: none; cursor: pointer; padding: 0.25rem;">
              ${isFav ? STAR_FILLED : STAR_EMPTY}
            </button>
          </div>
        </div>
        <a href="tools/${tool.id}/index.html" class="tool-link-overlay" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; gap: 0.5rem; height: 100%;" onclick="trackRecent('${tool.id}')">
          <h3 style="font-family: var(--font-display); font-weight: 700; font-size: 1.15rem; margin-top: 0.5rem;">${tool.name}</h3>
          <p style="font-size: 0.875rem; color: var(--text-secondary); line-height: 1.4; flex: 1;">${tool.description}</p>
          <div class="tool-card-footer" style="display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; color: var(--text-tertiary); margin-top: 0.5rem;">
            <span style="font-weight: 700; letter-spacing: 0.05em; color: var(--accent);">${categoryName}</span>
          </div>
        </a>
      </div>
    `;
  }

  // 6. Bind click handlers to cards (for dynamic action stops)
  function bindCardInteractions() {
    document.querySelectorAll('.favorite-star').forEach(star => {
      star.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const card = star.closest('.tool-card');
        const toolId = card.getAttribute('data-id');
        
        const favs = getFavorites();
        const isFav = favs.includes(toolId);
        toggleFavorite(toolId);
        
        star.innerHTML = !isFav ? STAR_FILLED : STAR_EMPTY;
        
        // Re-render main grid to update sections
        renderMainGrid();
      });
    });
  }

  // 7. Filter Tools matching rules
  function filterToolsList(query, category) {
    return toolsDatabase.filter(tool => {
      if (query) {
        // Global search: ignore category and status filters
        const nameMatch = tool.name.toLowerCase().includes(query);
        const descMatch = tool.description.toLowerCase().includes(query);
        const tagMatch = tool.tags && tool.tags.some(tag => tag.toLowerCase().includes(query));
        return nameMatch || descMatch || tagMatch;
      }

      // Tab Filtering
      const categoryMatch = category === 'all' || tool.category === category;
      if (!categoryMatch) return false;

      // Status Match
      if (activeStatusFilter === 'active' && !tool.active) return false;
      if (activeStatusFilter === 'coming' && tool.active) return false;

      return true;
    });
  }

  // 8. Filters Tab setup
  function setupFilters() {
    categoryTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        activeCategory = tab.getAttribute('data-category');
        renderMainGrid();
      });
    });

    const statusBtns = document.querySelectorAll('.filter-btn');
    statusBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        statusBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeStatusFilter = btn.getAttribute('data-filter');
        renderMainGrid();
      });
    });
  }

  // 9. Search box interactions
  function setupSearch() {
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
      const val = searchInput.value;
      if (val) {
        clearSearchBtn.style.display = 'block';
      } else {
        clearSearchBtn.style.display = 'none';
      }
      renderMainGrid();
    });

    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearSearchBtn.style.display = 'none';
      renderMainGrid();
      searchInput.focus();
    });
  }

  // 10. FAQ Accordions animation
  function setupFAQ() {
    document.querySelectorAll('.accordion-header').forEach(header => {
      header.addEventListener('click', () => {
        const isExpanded = header.getAttribute('aria-expanded') === 'true';
        header.setAttribute('aria-expanded', !isExpanded);
      });
    });
  }

  // 11. Read URL query params (e.g. ?cat=developer)
  function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const cat = urlParams.get('cat');
    if (cat) {
      const matchedTab = document.querySelector(`.category-tab[data-category="${cat}"]`);
      if (matchedTab) {
        matchedTab.click();
        matchedTab.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  // --- LocalStorage helpers for Favorites and Recents ---

  function getFavorites() {
    return JSON.parse(localStorage.getItem('fav-tools')) || [];
  }

  function toggleFavorite(id) {
    let favs = getFavorites();
    if (favs.includes(id)) {
      favs = favs.filter(fid => fid !== id);
    } else {
      favs.push(id);
    }
    localStorage.setItem('fav-tools', JSON.stringify(favs));
  }

  function getRecents() {
    return JSON.parse(localStorage.getItem('recent-tools')) || [];
  }

  // Global tracker called when clicking overlay links
  window.trackRecent = function(id) {
    let recents = getRecents();
    // Move to front, prevent duplicates
    recents = recents.filter(rid => rid !== id);
    recents.unshift(id);
    recents = recents.slice(0, 10); // keep last 10
    localStorage.setItem('recent-tools', JSON.stringify(recents));
  };
});
