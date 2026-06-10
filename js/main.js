// ALL IN ONE Global Entrypoint & Theme/PWA Synchronizer

document.addEventListener('DOMContentLoaded', () => {
  // 1. Service Worker Registration
  registerServiceWorker();

  // 2. Global Keyboard Shortcut Handler
  document.addEventListener('keydown', (e) => {
    // Focus search bar if "/" is pressed and user is not focused on an input element
    if (e.key === '/' && !['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) {
      e.preventDefault();
      const mainSearch = document.getElementById('tool-search');
      const navSearch = document.getElementById('nav-search-input');
      
      if (mainSearch) {
        mainSearch.focus();
        mainSearch.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (navSearch) {
        navSearch.focus();
      }
    }
  });

  console.log('ALL IN ONE application initialized successfully.');
});

// Registers service worker correctly relative to page depth
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    const isSubFolder = window.location.pathname.includes('/tools/') || window.location.pathname.includes('/pages/');
    // Caching service worker registers from root domain
    const swPath = isSubFolder ? '../../sw.js' : './sw.js';
    
    // Track installation prompts globally
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
    });

    navigator.serviceWorker.register(swPath)
      .then(reg => {
        console.log('Service Worker registered successfully with scope:', reg.scope);
      })
      .catch(err => {
        console.warn('Service Worker registration failed:', err);
      });
  }
}
