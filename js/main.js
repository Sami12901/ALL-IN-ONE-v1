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

// Homepage Hero & Media Logic - With Luxury Brand Intro Animation
document.addEventListener('DOMContentLoaded', () => {
  const isHomepage = !!document.querySelector('.hero-section');
  if (!isHomepage) return;

  const screen = document.getElementById('loading-screen');
  const isBot = /bot|google|baidu|bing|msn|teoma|slurp|yandex|crawler|spider|inspection/i.test(navigator.userAgent);
  const alreadySeen = sessionStorage.getItem('all_in_one_intro_seen');

  // Helper to initialize hero features
  function initHeroAnimations() {
    // 1. HLS Video Background
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

    // 2. Dynamic Roles Cycle
    const roles = ['Developer', 'Designer', 'Student', 'Marketer', 'Executive'];
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

    // 3. Smooth Hero Entrance via GSAP
    if (typeof gsap !== 'undefined') {
      gsap.fromTo('.name-reveal', 
        { opacity: 0.85, y: 20 }, 
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      );
      gsap.fromTo('.blur-in', 
        { opacity: 0.85, y: 15 }, 
        { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: 'power3.out' }
      );
    }
  }

  // If Crawler / Bot or user already saw intro in this session:
  if (isBot || alreadySeen || !screen) {
    if (screen) screen.remove();
    initHeroAnimations();
    return;
  }

  // --- Run Luxury Brand Intro Animation ---
  const countEl = document.getElementById('loader-count');
  const barEl = document.getElementById('loader-bar');
  const words = document.querySelectorAll('.loader-word');
  let currentWord = 0;
  let isDismissed = false;

  // Rotate Words (Convert, Calculate, Format, Analyze, Generate)
  const wordInterval = setInterval(() => {
    if (isDismissed || words.length === 0) return;
    words[currentWord].classList.remove('active');
    words[currentWord].classList.add('exit');
    
    currentWord = (currentWord + 1) % words.length;
    
    words[currentWord].classList.remove('exit');
    words[currentWord].classList.add('active');
  }, 320);

  // Dismiss function
  function dismissIntro() {
    if (isDismissed) return;
    isDismissed = true;
    clearInterval(wordInterval);
    sessionStorage.setItem('all_in_one_intro_seen', 'true');

    if (typeof gsap !== 'undefined') {
      gsap.to(screen, {
        yPercent: -100,
        duration: 0.8,
        ease: 'power3.inOut',
        onComplete: () => {
          screen.remove();
          initHeroAnimations();
        }
      });
    } else {
      screen.style.transition = 'transform 0.6s ease';
      screen.style.transform = 'translateY(-100%)';
      setTimeout(() => {
        screen.remove();
        initHeroAnimations();
      }, 600);
    }
  }

  // Allow clicking anywhere to skip immediately
  screen.addEventListener('click', dismissIntro);

  // Counter & Progress Bar Animation (1.5 seconds)
  const duration = 1500;
  const start = performance.now();

  function updateLoader(time) {
    if (isDismissed) return;
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    
    const count = Math.floor(progress * 100);
    if (countEl) countEl.textContent = String(count).padStart(3, '0');
    if (barEl) barEl.style.transform = `scaleX(${progress})`;
    
    if (progress < 1) {
      requestAnimationFrame(updateLoader);
    } else {
      setTimeout(dismissIntro, 250);
    }
  }
  requestAnimationFrame(updateLoader);
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
