/**
 * Interactive Deep Water & Liquid Waves Animation
 * ALL-IN-ONE-v1 • 100% Client-Side Offline Engine
 * Features:
 * - Multi-layered organic fluid wave harmonics
 * - Shimmering ambient caustics & floating light particles
 * - Interactive mouse/touch ripple propagation with physics damping
 * - Performance-optimized: pauses when offscreen via IntersectionObserver
 */

(function () {
  'use strict';

  function initWaterAnimation() {
    const heroSection = document.querySelector('.hero-section');
    const videoWrapper = document.querySelector('.hero-video-wrapper');
    if (!heroSection || !videoWrapper) return;

    // Check if canvas already exists
    let canvas = document.getElementById('hero-water-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'hero-water-canvas';
      canvas.className = 'hero-water-canvas';
      // Insert canvas at beginning of videoWrapper so overlay and fade stay on top
      videoWrapper.insertBefore(canvas, videoWrapper.firstChild);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animId = null;
    let isVisible = true;
    let time = 0;

    // Mouse / Touch tracking
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      isMoving: false,
      lastMoved: 0
    };

    // Active ripples
    const ripples = [];
    const MAX_RIPPLES = 12;

    // Floating water particles
    const particles = [];
    const PARTICLE_COUNT = 35;

    function resize() {
      const rect = videoWrapper.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(rect.width, window.innerWidth);
      height = Math.max(rect.height, window.innerHeight);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // Re-init particles within new bounds
      if (particles.length === 0) {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2.5 + 1,
            speedY: -(Math.random() * 0.4 + 0.15),
            speedX: (Math.random() - 0.5) * 0.3,
            opacity: Math.random() * 0.5 + 0.2,
            pulseOffset: Math.random() * Math.PI * 2
          });
        }
      }
    }

    // Add interactive ripple
    function addRipple(x, y, intensity = 1.0) {
      if (ripples.length >= MAX_RIPPLES) {
        ripples.shift();
      }
      ripples.push({
        x,
        y,
        radius: 5,
        maxRadius: Math.min(width, height) * 0.45 * intensity,
        speed: 3.5 * (0.8 + Math.random() * 0.4),
        alpha: 0.65 * intensity,
        decay: 0.009
      });
    }

    // Event listeners for interactivity
    heroSection.addEventListener('pointermove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      mouse.targetX = x;
      mouse.targetY = y;
      mouse.isMoving = true;
      mouse.lastMoved = performance.now();

      // Trigger subtle ripple while dragging/moving smoothly
      if (Math.random() < 0.18) {
        addRipple(x, y, 0.6);
      }
    }, { passive: true });

    heroSection.addEventListener('pointerdown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      addRipple(x, y, 1.2);
    }, { passive: true });

    // Multi-layered wave rendering configuration
    const waveLayers = [
      {
        baseY: 0.62,
        wavelength: 0.0035,
        speed: 0.012,
        amplitude: 28,
        color1: 'rgba(8, 14, 28, 0.95)',
        color2: 'rgba(12, 28, 56, 0.85)',
        highlight: 'rgba(56, 189, 248, 0.12)'
      },
      {
        baseY: 0.68,
        wavelength: 0.0048,
        speed: -0.016,
        amplitude: 22,
        color1: 'rgba(5, 10, 20, 0.96)',
        color2: 'rgba(10, 22, 44, 0.90)',
        highlight: 'rgba(99, 102, 241, 0.14)'
      },
      {
        baseY: 0.76,
        wavelength: 0.0062,
        speed: 0.022,
        amplitude: 18,
        color1: 'rgba(3, 7, 18, 0.98)',
        color2: 'rgba(8, 18, 36, 0.95)',
        highlight: 'rgba(14, 165, 233, 0.18)'
      },
      {
        baseY: 0.86,
        wavelength: 0.0075,
        speed: -0.026,
        amplitude: 14,
        color1: 'rgba(2, 6, 15, 1)',
        color2: 'rgba(5, 12, 26, 1)',
        highlight: 'rgba(56, 189, 248, 0.22)'
      }
    ];

    function drawWave(layer, t) {
      const baseY = height * layer.baseY;
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, baseY);

      const step = 8;
      for (let x = 0; x <= width + step; x += step) {
        // Base sine harmonic
        let yOffset = Math.sin(x * layer.wavelength + t * layer.speed) * layer.amplitude;
        // Secondary harmonic for fluid organic motion
        yOffset += Math.cos(x * layer.wavelength * 1.7 - t * layer.speed * 0.8) * (layer.amplitude * 0.4);

        // Ripple displacement influence
        for (let r = 0; r < ripples.length; r++) {
          const rip = ripples[r];
          const dist = Math.abs(x - rip.x);
          if (dist < rip.radius && dist > rip.radius - 80) {
            const rippleFactor = Math.sin((dist - rip.radius) * 0.1) * (rip.alpha * 18);
            yOffset += rippleFactor;
          }
        }

        ctx.lineTo(x, baseY + yOffset);
      }

      ctx.lineTo(width, height);
      ctx.closePath();

      // Deep fluid gradient fill
      const grad = ctx.createLinearGradient(0, baseY - layer.amplitude, 0, height);
      grad.addColorStop(0, layer.color2);
      grad.addColorStop(1, layer.color1);
      ctx.fillStyle = grad;
      ctx.fill();

      // Specular highlight line along the wave crest
      ctx.strokeStyle = layer.highlight;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    function render() {
      if (!isVisible) {
        animId = requestAnimationFrame(render);
        return;
      }

      time += 1;
      const t = time;

      // Clear with dark deep navy background
      ctx.fillStyle = '#05070d';
      ctx.fillRect(0, 0, width, height);

      // 1. Ambient Caustics / Radial Glow
      const ambientGrad = ctx.createRadialGradient(
        width * 0.5 + Math.sin(t * 0.008) * 120,
        height * 0.35 + Math.cos(t * 0.006) * 80,
        10,
        width * 0.5,
        height * 0.5,
        width * 0.7
      );
      ambientGrad.addColorStop(0, 'rgba(14, 165, 233, 0.12)');
      ambientGrad.addColorStop(0.4, 'rgba(56, 189, 248, 0.05)');
      ambientGrad.addColorStop(0.8, 'rgba(99, 102, 241, 0.02)');
      ambientGrad.addColorStop(1, 'rgba(5, 7, 13, 0)');

      ctx.fillStyle = ambientGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Render Layered Waves
      for (let i = 0; i < waveLayers.length; i++) {
        drawWave(waveLayers[i], t);
      }

      // 3. Render Interactive Concentric Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.radius += rip.speed;
        rip.alpha -= rip.decay;

        if (rip.alpha <= 0 || rip.radius >= rip.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0, rip.alpha * 0.6)})`;
        ctx.lineWidth = 2.2;
        ctx.shadowColor = 'rgba(56, 189, 248, 0.8)';
        ctx.shadowBlur = 10;
        ctx.stroke();

        // Secondary inner echo ring
        if (rip.radius > 25) {
          ctx.beginPath();
          ctx.arc(rip.x, rip.y, rip.radius - 20, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(99, 102, 241, ${Math.max(0, rip.alpha * 0.35)})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
        ctx.restore();
      }

      // 4. Floating Bioluminescent Plankton / Water Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(t * 0.02 + p.pulseOffset) * 0.25;

        // Wrap around
        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        const pulse = Math.sin(t * 0.04 + p.pulseOffset) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${p.opacity * pulse})`;
        ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
        ctx.shadowBlur = 6;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    }

    // Responsive window resize
    window.addEventListener('resize', resize, { passive: true });
    resize();

    // IntersectionObserver to pause when hero is scrolled out of view
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting;
        });
      }, { threshold: 0.05 });
      observer.observe(heroSection);
    }

    // Start render loop
    if (animId) cancelAnimationFrame(animId);
    animId = requestAnimationFrame(render);
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWaterAnimation);
  } else {
    initWaterAnimation();
  }
})();
