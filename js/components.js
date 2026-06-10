// ALL IN ONE Web Components System

const SUN_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
const MOON_SVG = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
const DOWNLOAD_SVG = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
const HAMBURGER_SVG = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
const CLOSE_SVG = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

// Helper to determine root path prefix depending on directory depth
function getRootPrefix() {
  const path = window.location.pathname;
  if (path.includes('/tools/') || path.includes('/pages/')) {
    return '../../';
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
    const activeTheme = getSavedTheme();
    applyTheme(activeTheme); // Ensure theme is loaded

    this.innerHTML = `
      <div class="dev-banner" style="background: linear-gradient(90deg, var(--accent), #e11d48); color: white; text-align: center; padding: 0.65rem 1rem; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.05em; display: flex; align-items: center; justify-content: center; gap: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); font-family: var(--font-display);">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <span>THIS WEBSITE IS CURRENTLY UNDER ACTIVE DEVELOPMENT</span>
      </div>
      <header class="app-header glass-panel">
        <div class="container nav-container" style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 1.5rem; height: 70px;">
          <!-- Brand -->
          <a href="${prefix}index.html" class="nav-brand" style="display: flex; align-items: center; gap: 0.75rem; text-decoration: none; color: var(--text-primary); font-family: var(--font-display); font-weight: 800; font-size: 1.25rem;">
            <div style="width: 34px; height: 34px; background: var(--accent-gradient); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900;">A</div>
            <span>ALL IN ONE</span>
          </a>

          <!-- Header Search -->
          <div class="nav-search-container" style="position: relative; flex: 1; max-width: 350px; margin: 0 1.5rem; display: none;">
            <input type="text" id="nav-search-input" placeholder="Search tools..." style="width: 100%; padding: 0.5rem 1rem; padding-left: 2rem; border-radius: var(--radius-full); background: var(--bg-tertiary); border: 1px solid var(--border); color: var(--text-primary); outline: none; font-size: 0.875rem;" aria-label="Search tools">
            <svg style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; fill: var(--text-tertiary);" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            <div id="nav-search-results" class="glass-panel" style="position: absolute; top: 110%; left: 0; width: 100%; max-height: 250px; overflow-y: auto; z-index: 200; display: none; flex-direction: column; padding: 0.25rem;"></div>
          </div>

          <!-- Desktop Navigation -->
          <nav class="desktop-navigation" style="display: flex; align-items: center; gap: 1.5rem;">
            <a href="${prefix}index.html" class="nav-link" style="color: var(--text-secondary); font-weight: 500; font-size: 0.95rem; transition: var(--transition);">Dashboard</a>
            <a href="${prefix}pages/about.html" class="nav-link" style="color: var(--text-secondary); font-weight: 500; font-size: 0.95rem; transition: var(--transition);">About</a>
            <a href="${prefix}pages/contact.html" class="nav-link" style="color: var(--text-secondary); font-weight: 500; font-size: 0.95rem; transition: var(--transition);">Support</a>
            
            <!-- Dark Mode Toggle -->
            <button id="header-theme-toggle" class="btn-secondary" style="border: 1px solid var(--border); background: var(--bg-tertiary); color: var(--text-primary); width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: var(--transition);" aria-label="Toggle theme">
              <span class="theme-icon" style="display: flex; align-items: center; justify-content: center;">\${activeTheme === 'dark' ? SUN_SVG : MOON_SVG}</span>
            </button>

            <!-- Mobile Menu Toggle Button -->
            <button id="mobile-menu-toggle" style="background: transparent; border: none; padding: 0.5rem; color: var(--text-primary); cursor: pointer; display: none;" aria-label="Toggle menu">\${HAMBURGER_SVG}</button>
          </nav>
        </div>
      </header>

      <!-- Mobile Menu Drawer Overlay -->
      <div id="mobile-drawer" class="glass-panel" style="position: fixed; top: 0; right: -280px; width: 280px; height: 100%; z-index: 1000; box-shadow: -5px 0 25px rgba(0,0,0,0.15); display: flex; flex-direction: column; padding: 1.5rem; transition: right 0.3s ease-in-out;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 1.5rem;">
          <span style="font-family: var(--font-display); font-weight: 700; font-size: 1.15rem;">Navigation</span>
          <button id="mobile-drawer-close" style="background: transparent; border: none; padding: 0.5rem; color: var(--text-secondary); cursor: pointer;" aria-label="Close menu">\${CLOSE_SVG}</button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          <a href="${prefix}index.html" style="color: var(--text-primary); text-decoration: none; font-weight: 600;">Dashboard</a>
          <a href="${prefix}pages/about.html" style="color: var(--text-primary); text-decoration: none; font-weight: 600;">About Us</a>
          <a href="${prefix}pages/contact.html" style="color: var(--text-primary); text-decoration: none; font-weight: 600;">Support Form</a>
          <a href="${prefix}pages/privacy.html" style="color: var(--text-primary); text-decoration: none; font-weight: 600;">Privacy Policy</a>
          <a href="${prefix}pages/terms.html" style="color: var(--text-primary); text-decoration: none; font-weight: 600;">Terms of Service</a>
        </div>
      </div>
      <div id="mobile-drawer-backdrop" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); z-index: 999; display: none;"></div>
    `;

    // Initialize Header Interactions
    this.setupThemeToggle();
    this.setupMobileDrawer();
    this.setupQuickSearch(prefix);
    this.checkResponsive();

    window.addEventListener('resize', () => this.checkResponsive());
  }

  setupThemeToggle() {
    const toggleBtn = this.querySelector('#header-theme-toggle');
    const icon = this.querySelector('.theme-icon');
    
    toggleBtn.addEventListener('click', () => {
      const currentTheme = getSavedTheme();
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      icon.innerHTML = newTheme === 'dark' ? SUN_SVG : MOON_SVG;
    });
  }

  setupMobileDrawer() {
    const toggleBtn = this.querySelector('#mobile-menu-toggle');
    const drawer = this.querySelector('#mobile-drawer');
    const backdrop = this.querySelector('#mobile-drawer-backdrop');
    const closeBtn = this.querySelector('#mobile-drawer-close');

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

    // Only show quick search when NOT on the dashboard homepage (dashboard already has main search)
    const isDashboard = !window.location.pathname.includes('/tools/') && !window.location.pathname.includes('/pages/');
    if (!isDashboard) {
      searchContainer.style.display = 'block';
    }

    let toolsData = [];
    fetch(`${prefix}data/tools-db.json`)
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
        t.tags.some(tag => tag.toLowerCase().includes(query))
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

  checkResponsive() {
    const desktopLinks = this.querySelectorAll('.desktop-navigation > a');
    const menuToggle = this.querySelector('#mobile-menu-toggle');

    if (window.innerWidth < 768) {
      desktopLinks.forEach(link => link.style.display = 'none');
      menuToggle.style.display = 'block';
    } else {
      desktopLinks.forEach(link => link.style.display = 'block');
      menuToggle.style.display = 'none';
    }
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
      <div class="container" style="margin-top: 1.5rem;">
        <nav class="breadcrumb-container" aria-label="Breadcrumb">
          <ol class="breadcrumbs" style="display: flex; align-items: center; gap: 0.5rem; list-style: none; padding: 0; font-size: 0.85rem;">
            <li class="breadcrumb-item"><a href="${prefix}index.html" style="color: var(--text-tertiary); text-decoration: none;">Home</a></li>
            <li class="breadcrumb-item"><a href="${prefix}index.html?cat=${categoryId}" style="color: var(--text-tertiary); text-decoration: none;">${categoryName}</a></li>
            <li class="breadcrumb-item active" aria-current="page" style="color: var(--text-secondary); font-weight: 500;">${toolName}</li>
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
      <footer class="app-footer glass-panel" style="margin-top: auto; border-top: 1px solid var(--border); padding: 3rem 0; background: var(--glass-bg);">
        <div class="container">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2.5rem; margin-bottom: 2rem;">
            <!-- Brand Info -->
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <span style="font-family: var(--font-display); font-weight: 800; font-size: 1.2rem; color: var(--text-primary);">ALL IN ONE</span>
              <p style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5;">150+ free web utilities in one tab. Fast, secure, client-side tools processed locally inside your browser.</p>
              
              <!-- PWA Install Button -->
              <button id="pwa-install-btn" class="btn btn-primary" style="display: none; width: fit-content; padding: 0.4rem 0.8rem; font-size: 0.8rem; border-radius: var(--radius-sm); margin-top: 0.5rem; align-items: center; gap: 0.35rem;">
                \${DOWNLOAD_SVG} Install Offline App
              </button>
            </div>
            
            <!-- Quick Links -->
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <span style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary); border-bottom: 1px solid var(--border); padding-bottom: 0.35rem;">Navigation</span>
              <a href="${prefix}index.html" style="font-size: 0.9rem; color: var(--text-secondary); text-decoration: none; transition: var(--transition);">Dashboard Portal</a>
              <a href="${prefix}pages/about.html" style="font-size: 0.9rem; color: var(--text-secondary); text-decoration: none; transition: var(--transition);">About the Project</a>
              <a href="${prefix}pages/contact.html" style="font-size: 0.9rem; color: var(--text-secondary); text-decoration: none; transition: var(--transition);">Support Form</a>
            </div>

            <!-- Categories -->
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <span style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary); border-bottom: 1px solid var(--border); padding-bottom: 0.35rem;">Popular Categories</span>
              <a href="${prefix}index.html?cat=developer" style="font-size: 0.9rem; color: var(--text-secondary); text-decoration: none; transition: var(--transition);">Developer Tools</a>
              <a href="${prefix}index.html?cat=text" style="font-size: 0.9rem; color: var(--text-secondary); text-decoration: none; transition: var(--transition);">Text Tools</a>
              <a href="${prefix}index.html?cat=color" style="font-size: 0.9rem; color: var(--text-secondary); text-decoration: none; transition: var(--transition);">Color Tools</a>
            </div>

            <!-- Legal Documents -->
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <span style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary); border-bottom: 1px solid var(--border); padding-bottom: 0.35rem;">Legal</span>
              <a href="${prefix}pages/privacy.html" style="font-size: 0.9rem; color: var(--text-secondary); text-decoration: none; transition: var(--transition);">Privacy Policy</a>
              <a href="${prefix}pages/terms.html" style="font-size: 0.9rem; color: var(--text-secondary); text-decoration: none; transition: var(--transition);">Terms of Service</a>
              <div style="font-size: 0.8rem; color: var(--text-tertiary); display: flex; align-items: center; gap: 0.4rem; margin-top: 0.25rem;">
                <span style="width: 8px; height: 8px; background: var(--success); border-radius: 50%;"></span>
                <span>All operations client-side</span>
              </div>
            </div>
          </div>

          <div style="border-top: 1px solid var(--border); padding-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem; align-items: center; justify-content: space-between; font-size: 0.85rem; color: var(--text-tertiary);">
            <span>&copy; ${currentYear} ALL IN ONE Tools. Released under the MIT License.</span>
            <span>Created for developers, designers, students, and freelancers.</span>
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
