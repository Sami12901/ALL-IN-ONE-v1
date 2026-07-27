// ALL IN ONE Web Components System

const SUN_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
const MOON_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
const DOWNLOAD_SVG = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
const HAMBURGER_SVG = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
const CLOSE_SVG = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

// Helper to determine root path prefix depending on directory depth
function getRootPrefix() {
  const path = window.location.pathname;
  if (path.includes('/tools/')) {
    return '../../';
  }
  if (path.includes('/pages/')) {
    return '../';
  }
  return './';
}

// Global theme manager utility
function getSavedTheme() {
  return localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

// Shared CSS styles for components (shadow DOM or inline styling fallback)
// We will use standard Custom Elements without Shadow DOM so they naturally inherit the global main.css variables and rules.

// 1. Header Component
class AppHeader extends HTMLElement {
  connectedCallback() {
    const prefix = getRootPrefix();
    applyTheme('dark'); // Force dark mode

    this.innerHTML = `
      <header style="position: fixed; top: 0; left: 0; right: 0; z-index: 50; display: flex; justify-content: center; padding-top: 1.5rem; pointer-events: none; transition: transform 0.3s ease;" id="global-navbar">
        <div style="pointer-events: auto; display: inline-flex; align-items: center; border-radius: 9999px; backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); background: var(--surface); padding: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Logo -->
          <a href="${prefix}index.html" class="gradient-border-hover" style="display:flex; align-items:center; justify-content:center; width: 36px; height: 36px; border-radius: 50%; background: var(--bg); transition: transform 0.2s; text-decoration: none;">
            <span class="font-display italic-display" style="font-size: 16px; color: var(--text);">A</span>
          </a>

          <div style="width: 1px; height: 20px; background: var(--stroke); margin: 0 8px;" class="hide-mobile"></div>
          
          <!-- Nav Links -->
          <a href="${prefix}index.html" style="font-size: 0.875rem; border-radius: 9999px; padding: 0.375rem 1rem; color: var(--text); background: rgba(255,255,255,0.1); text-decoration: none;" class="hide-mobile">Home</a>
          <a href="${prefix}pages/about.html" style="font-size: 0.875rem; border-radius: 9999px; padding: 0.375rem 1rem; color: var(--muted); text-decoration: none;" class="hide-mobile">About</a>
          <a href="${prefix}pages/contact.html" style="font-size: 0.875rem; border-radius: 9999px; padding: 0.375rem 1rem; color: var(--muted); text-decoration: none;" class="hide-mobile">Support</a>
          
          <button id="mobile-menu-toggle" aria-label="Menu" style="background:transparent; border:none; color:var(--text); cursor:pointer; padding: 0.375rem; display:none;" class="show-mobile-flex">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
      </header>

      <!-- Minimal Mobile Drawer (kept functional but simplified) -->
      <div id="mobile-drawer" class="mobile-drawer glass-panel" style="display:none;"></div>
      <div id="mobile-drawer-backdrop" class="mobile-drawer-backdrop" style="display:none;"></div>
    `;


    // Initialize Header Interactions
    this.setupMobileDrawer();
    this.setupQuickSearch(prefix);
  }

  setupMobileDrawer() {
    const toggleBtn = this.querySelector('#mobile-menu-toggle');
    const drawer = this.querySelector('#mobile-drawer');
    const backdrop = this.querySelector('#mobile-drawer-backdrop');
    const closeBtn = this.querySelector('#mobile-drawer-close');

    if (!toggleBtn || !drawer || !closeBtn || !backdrop) return;

    const openDrawer = () => {
      drawer.style.right = '0';
      backdrop.style.display = 'block';
    };

    const closeDrawer = () => {
      drawer.style.right = '-280px';
      backdrop.style.display = 'none';
    };

    toggleBtn.addEventListener('click', openDrawer);
    closeBtn.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);
  }

  setupQuickSearch(prefix) {
    const searchContainer = this.querySelector('.nav-search-container');
    const searchInput = this.querySelector('#nav-search-input');
    const searchResults = this.querySelector('#nav-search-results');

    if (!searchContainer) return;

    // Show quick search on all pages, including the dashboard
    searchContainer.style.display = 'block';

    let toolsData = [];
    fetch(`${prefix}data/tools-db.json?v=` + new Date().getTime())
      .then(res => res.json())
      .then(data => { toolsData = data; })
      .catch(err => console.warn('Could not load tools database for quick-nav search', err));

    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();
      if (!query) {
        searchResults.style.display = 'none';
        return;
      }

      const matches = toolsData.filter(t => 
        t.name.toLowerCase().includes(query) || 
        t.description.toLowerCase().includes(query) || 
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(query)))
      ).slice(0, 5);

      if (matches.length === 0) {
        searchResults.innerHTML = '<div style="padding: 0.75rem; font-size: 0.8rem; color: var(--text-tertiary); text-align: center;">No tools found</div>';
      } else {
        searchResults.innerHTML = matches.map(t => `
          <a href="${prefix}tools/${t.id}/index.html" style="display: flex; flex-direction: column; padding: 0.5rem 0.75rem; text-decoration: none; color: var(--text-primary); border-radius: var(--radius-sm); transition: var(--transition);">
            <span style="font-weight: 600; font-size: 0.85rem;">${t.name}</span>
            <span style="font-size: 0.75rem; color: var(--text-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${t.description}</span>
          </a>
        `).join('');
        
        // Style suggestions list items on hover
        searchResults.querySelectorAll('a').forEach(link => {
          link.addEventListener('mouseenter', () => { link.style.background = 'var(--bg-tertiary)'; });
          link.addEventListener('mouseleave', () => { link.style.background = 'transparent'; });
        });
      }
      searchResults.style.display = 'flex';
    });

    // Close results dropdown on clicking outside
    document.addEventListener('click', (e) => {
      if (!searchContainer.contains(e.target)) {
        searchResults.style.display = 'none';
      }
    });
  }
}

// 2. Breadcrumbs Component
class AppBreadcrumbs extends HTMLElement {
  connectedCallback() {
    const prefix = getRootPrefix();
    const pathname = window.location.pathname;
    
    // Parse path to find tool id
    const parts = pathname.split('/').filter(Boolean);
    const toolsIndex = parts.indexOf('tools');
    
    if (toolsIndex === -1 || toolsIndex === parts.length - 1) {
      return; // Not on a subtool page
    }
    
    const toolId = parts[toolsIndex + 1];
    
    // Fetch tool name and category from tools-db
    fetch(`${prefix}data/tools-db.json`)
      .then(res => res.json())
      .then(tools => {
        const tool = tools.find(t => t.id === toolId);
        if (tool) {
          this.render(prefix, tool.category, tool.name);
        }
      })
      .catch(err => {
        // Fallback rendering using path names if fetch fails
        const nameFormatted = toolId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        this.render(prefix, 'Tools', nameFormatted);
      });
  }

  render(prefix, categoryId, toolName) {
    const categoryName = categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
    this.innerHTML = `
      <div class="container">
        <nav class="breadcrumb-container" aria-label="Breadcrumb">
          <ol class="breadcrumbs">
            <li class="breadcrumb-item"><a href="${prefix}index.html">Home</a></li>
            <li class="breadcrumb-item"><a href="${prefix}index.html?cat=${categoryId}">${categoryName}</a></li>
            <li class="breadcrumb-item active" aria-current="page">${toolName}</li>
          </ol>
        </nav>
      </div>
    `;
  }
}

// 3. Footer Component
class AppFooter extends HTMLElement {
  connectedCallback() {
    const prefix = getRootPrefix();
    const currentYear = new Date().getFullYear();

    this.innerHTML = `
      <footer class="app-footer">
        <div class="container">
          <div class="footer-grid">
            <!-- Brand Info -->
            <div class="footer-brand-section">
              <span class="footer-brand-title">ALL IN ONE</span>
              <p class="footer-brand-desc">150+ free web utilities in one tab. Fast, secure, client-side tools processed locally inside your browser.</p>
              
              <!-- PWA Install Button -->
              <button id="pwa-install-btn" class="btn btn-primary" style="display: none; width: fit-content; padding: 0.4rem 0.8rem; font-size: 0.8rem; border-radius: var(--radius-sm); margin-top: 0.5rem; align-items: center; gap: 0.35rem;">
                ${DOWNLOAD_SVG} Install Offline App
              </button>
            </div>
            
            <!-- Quick Links -->
            <div class="footer-links-section">
              <span class="footer-links-title">Navigation</span>
              <a href="${prefix}index.html">Dashboard Portal</a>
              <a href="${prefix}pages/about.html">About the Project</a>
              <a href="${prefix}pages/contact.html">Support Form</a>
            </div>

            <!-- Categories -->
            <div class="footer-links-section">
              <span class="footer-links-title">Popular Categories</span>
              <a href="${prefix}index.html?cat=developer">Developer Tools</a>
              <a href="${prefix}index.html?cat=text">Text Tools</a>
              <a href="${prefix}index.html?cat=color">Color Tools</a>
            </div>

            <!-- Legal Documents -->
            <div class="footer-links-section">
              <span class="footer-links-title">Legal</span>
              <a href="${prefix}pages/privacy.html">Privacy Policy</a>
              <a href="${prefix}pages/terms.html">Terms of Service</a>
              <div class="footer-status-indicator">
                <span class="footer-status-dot"></span>
                <span>All operations client-side</span>
              </div>
            </div>
          </div>

          <div class="footer-bottom">
            <span>&copy; ${currentYear} ALL IN ONE Tools. Released under the MIT License.</span>
            <span>Created for ALL TYPE USER.</span>
          </div>
        </div>
      </footer>
    `;

    // Hook PWA prompt button
    this.setupPwaInstall();
  }

  setupPwaInstall() {
    const installBtn = this.querySelector('#pwa-install-btn');
    if (!installBtn) return;

    // Listen to registered event on window
    window.addEventListener('beforeinstallprompt', (e) => {
      // Show PWA install button in footer
      installBtn.style.display = 'flex';
      
      installBtn.addEventListener('click', async () => {
        if (window.deferredPrompt) {
          window.deferredPrompt.prompt();
          const { outcome } = await window.deferredPrompt.userChoice;
          console.log(`PWA Installation outcome: ${outcome}`);
          installBtn.style.display = 'none';
          window.deferredPrompt = null;
        }
      });
    });
  }
}

// Register Web Components
customElements.define('app-header', AppHeader);
customElements.define('app-breadcrumbs', AppBreadcrumbs);
customElements.define('app-footer', AppFooter);
