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
        console.warn('Service Worker registration failed:', err);
      });
  }
}
// Portfolio Loading & GSAP Logic
document.addEventListener('DOMContentLoaded', () => {
  const isHomepage = !!document.getElementById('loading-screen');
  if (!isHomepage) return;

  // 1. Loading Screen Animation (0-100)
  let count = 0;
  const countEl = document.getElementById('loader-count');
  const barEl = document.getElementById('loader-bar');
  const screen = document.getElementById('loading-screen');
  
  // Rotating Words
  const words = document.querySelectorAll('.loader-word');
  let currentWord = 0;
  
  const wordInterval = setInterval(() => {
    words[currentWord].classList.remove('active');
    words[currentWord].classList.add('exit');
    
    currentWord = (currentWord + 1) % words.length;
    
    words[currentWord].classList.remove('exit');
    words[currentWord].classList.remove('enter');
    words[currentWord].classList.add('active');
  }, 900);

  const duration = 2700;
  const start = performance.now();
  
  function updateLoader(time) {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    
    count = Math.floor(progress * 100);
    countEl.textContent = String(count).padStart(3, '0');
    barEl.style.transform = `scaleX(${progress})`;
    
    if (progress < 1) {
      requestAnimationFrame(updateLoader);
    } else {
      clearInterval(wordInterval);
      setTimeout(() => {
        gsap.to(screen, {
          yPercent: -100,
          duration: 1,
          ease: 'power3.inOut',
          onComplete: initHeroAnimations
        });
      }, 400);
    }
  }
  requestAnimationFrame(updateLoader);

  // 2. HLS Video Background
  const video = document.getElementById('hero-video');
  const videoSrc = 'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8';
  
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(videoSrc);
    hls.attachMedia(video);
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = videoSrc;
  }

  // 3. Hero Animations
  function initHeroAnimations() {
    gsap.fromTo('.name-reveal', 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 1.2, delay: 0.1, ease: 'power3.out' }
    );
    
    gsap.fromTo('.blur-in', 
      { opacity: 0, filter: 'blur(10px)', y: 20 }, 
      { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1, stagger: 0.1, delay: 0.3, ease: 'power3.out' }
    );

    // Roles Cycle
    const roles = ['Creative', 'Fullstack', 'Founder', 'Scholar'];
    let roleIdx = 0;
    const roleText = document.getElementById('role-text');
    setInterval(() => {
      roleIdx = (roleIdx + 1) % roles.length;
      roleText.style.animation = 'none';
      roleText.offsetHeight; /* trigger reflow */
      roleText.textContent = roles[roleIdx];
      roleText.style.animation = 'role-fade-in 0.4s ease-out forwards';
    }, 2000);
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
