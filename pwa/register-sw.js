// PWA Service Worker Registration Module

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Determine path depth relative to root
    const path = window.location.pathname;
    const isSubFolder = path.includes('/tools/') || path.includes('/pages/');
    const swPath = isSubFolder ? '../../sw.js' : './sw.js';

    navigator.serviceWorker.register(swPath)
      .then(registration => {
        console.log('PWA Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.warn('PWA Service Worker registration failed:', error);
      });
  });
}
