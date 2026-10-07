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
    // Skip SW in automated crawler / bot inspection environments
    const isBot = /bot|google|baidu|bing|msn|teoma|slurp|yandex|crawler|spider|inspection/i.test(navigator.userAgent);
    if (isBot) return;

    let swPath = './sw.js';
    const path = window.location.pathname;
    if (path.includes('/tools/')) {
      swPath = '../../sw.js';
    } else if (path.includes('/pages/')) {
      swPath = '../sw.js';
    }
    
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
        console.debug('Service Worker registration skipped:', err);
      });
  }
}

// Homepage Hero & Media Logic - Instant zero-delay rendering for SEO and Core Web Vitals
document.addEventListener('DOMContentLoaded', () => {
  const isHomepage = !!document.querySelector('.hero-section');
  if (!isHomepage) return;

  // 1. Clean up any leftover loading-screen element if present
  const screen = document.getElementById('loading-screen');
  if (screen) screen.remove();

  // 2. HLS Video Background
  const video = document.getElementById('hero-video');
  const videoSrc = 'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8';
  
  if (video) {
    if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSrc;
    }
  }

  // 3. Dynamic Roles Cycle
  const roles = ['Creative', 'Fullstack', 'Founder', 'Scholar'];
  let roleIdx = 0;
  const roleText = document.getElementById('role-text');
  if (roleText) {
    setInterval(() => {
      roleIdx = (roleIdx + 1) % roles.length;
      roleText.style.animation = 'none';
      roleText.offsetHeight; /* trigger reflow */
      roleText.textContent = roles[roleIdx];
      roleText.style.animation = 'role-fade-in 0.4s ease-out forwards';
    }, 2000);
  }

  // 4. Subtle entrance animation if GSAP is available
  if (typeof gsap !== 'undefined') {
    gsap.fromTo('.name-reveal', 
      { opacity: 0.9, y: 15 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    );
    gsap.fromTo('.blur-in', 
      { opacity: 0.9, y: 10 }, 
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.05, ease: 'power2.out' }
    );
  }
});

// Add ScrollTrigger for Sections
document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Animate section titles and cards on scroll
    gsap.utils.toArray('.section-title').forEach(title => {
      gsap.from(title, {
        scrollTrigger: {
          trigger: title,
          start: 'top 85%',
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });
    });

    gsap.utils.toArray('.glass-panel, .benefit-card').forEach(card => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
        },
        y: 30,
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
        ease: 'back.out(1.2)'
      });
    });
  }
});
