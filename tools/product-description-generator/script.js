// Product Description Generator Engine
// E-commerce copywriter generating hooks, benefit stories, bullet points, spec tables, and SEO meta descriptions.

(function () {
  'use strict';

  // Sample Products Catalog
  const SAMPLE_PRODUCTS = [
    {
      name: 'LuminaPro Wireless Noise-Cancelling Headphones',
      category: 'Consumer Electronics',
      tone: 'Luxury',
      audience: 'Remote professionals, frequent travelers, and discerning audiophiles',
      features: '45-hour battery life, active hybrid noise cancellation, memory foam acoustic earcups, Bluetooth 5.4 multi-point, rapid USB-C fast charging, custom titanium drivers'
    },
    {
      name: 'AeroPulse Trail Running Shoes',
      category: 'Fitness & Outdoors',
      tone: 'Bold',
      audience: 'Ultra-marathoners, weekend trail adventurers, and outdoor athletes',
      features: 'Vibram Megagrip traction lugs, responsive nitrogen-infused midsole, breathable ripstop upper, 210g ultra-lightweight build, reinforced TPU toe cap'
    },
    {
      name: 'Lumière Botanical Youth Serum',
      category: 'Beauty & Skincare',
      tone: 'Luxury',
      audience: 'Conscious skincare enthusiasts and anti-aging skincare devotees',
      features: 'Pure plant-based squalane, cold-pressed rosehip seed oil, 5% niacinamide, 100% organic vegan formulation, non-comedogenic silk finish'
    },
    {
      name: 'BaristaTouch Artisanal Espresso Grinder',
      category: 'Home & Kitchen',
      tone: 'Conversational',
      audience: 'Home baristas, specialty coffee lovers, and culinary craft enthusiasts',
      features: '64mm flat burrs, stepless micrometric grind adjustment, zero-retention bellow chute, ultra-quiet brushless motor, brushed stainless steel chassis'
    },
    {
      name: 'FlowStack Agile Analytics Suite',
      category: 'Software & Digital',
      tone: 'Technical',
      audience: 'Data engineers, product managers, and enterprise growth teams',
      features: 'Sub-second SQL query engine, automated data pipeline orchestration, SOC2 Type II compliance, real-time webhooks, multi-tenant RBAC'
    },
    {
      name: 'Nomad Merino Wool Travel Overshirt',
      category: 'Fashion & Apparel',
      tone: 'Conversational',
      audience: 'Digital nomads, minimalist travelers, and urban commuters',
      features: '100% extrafine Australian merino wool, natural odor resistance, temperature regulating weave, concealed zippered passport pocket, machine washable'
    }
  ];

  // Copywriting Tone Profiles & Lexicon
  const TONE_STYLES = {
    Luxury: {
      adjectives: ['impeccable', 'peerless', 'bespoke', 'masterfully crafted', 'exquisite', 'uncompromising', 'refined'],
      verbs: ['elevate', 'indulge in', 'immerse yourself in', 'experience', 'transcend', 'redefine'],
      hooks: [
        'Immerse Yourself in Pure Acoustic Luxury and Unbroken Focus.',
        'Crafted for the Few Who Refuse to Settle for the Ordinary.',
        'Where Timeless Elegance Meets Groundbreaking Engineering.',
        'Elevate Your Daily Ritual to an Art Form.'
      ],
      storyIntro: (name, aud) =>
        `Designed for ${aud}, the ${name} represents the pinnacle of intentional design and modern craftsmanship. Every contour, acoustic chamber, and material has been chosen without compromise to deliver an extraordinary sensory experience.`,
      storyOutro: (name) =>
        `Invest in perfection. The ${name} is more than a product—it is an enduring statement of refinement, distinction, and superior capability.`
    },
    Conversational: {
      adjectives: ['effortless', 'delightful', 'reliable', 'game-changing', 'ultra-comfy', 'smart', 'super intuitive'],
      verbs: ['simplify', 'upgrade', 'enjoy', 'kick back with', 'power through', 'breeze through'],
      hooks: [
        'Say Goodbye to Compromises and Hello to Pure Daily Bliss.',
        'Finally, the Effortless Upgrade Your Daily Routine Has Been Waiting For.',
        'Meet Your New Everyday Favorite—Built to Keep Up With You.',
        'Designed to Solve the Little Annoyances So You Can Focus on What Matters.'
      ],
      storyIntro: (name, aud) =>
        `Whether you're juggling a busy workday or unwinding on the weekend, the ${name} is engineered to make your life smoother, more comfortable, and infinitely more enjoyable. Tailored specifically for ${aud}, it blends everyday reliability with effortless charm.`,
      storyOutro: (name) =>
        `Life moves quickly—equip yourself with gear that never holds you back. Experience the effortless difference of ${name} today.`
    },
    Technical: {
      adjectives: ['calibrated', 'high-efficiency', 'precision-engineered', 'industrial-grade', 'optimized', 'robust'],
      verbs: ['maximize', 'execute', 'streamline', 'benchmark', 'accelerate', 'integrate'],
      hooks: [
        'Engineered for Peak Performance, Zero Latency, and Absolute Precision.',
        'Deterministic Reliability and Rigorous Engineering in One Unified System.',
        'Next-Generation Specifications Built for High-Demand Environments.',
        'High-Throughput Architecture with Zero Compromise on Build Quality.'
      ],
      storyIntro: (name, aud) =>
        `Engineered to meet the exact tolerances required by ${aud}, the ${name} establishes an uncompromising performance benchmark. Combining state-of-the-art component topology with rigorous stress-tested materials, it ensures optimal throughput across demanding use cases.`,
      storyOutro: (name) =>
        `Field-proven reliability meets high-efficiency operation. Deploy the ${name} to eliminate operational bottlenecks and secure long-term durability.`
    },
    Bold: {
      adjectives: ['unstoppable', 'explosive', 'domineering', 'relentless', 'unrivaled', 'fearless', 'raw'],
      verbs: ['shatter', 'crush', 'dominate', 'ignite', 'unleash', 'conquer'],
      hooks: [
        'Break All the Rules. Dominate Every Challenge.',
        'Unapologetically Powerful. Engineered to Leave the Competition Behind.',
        'Unleash Maximum Power and Push Past Your Limits.',
        'Built for Those Who Play to Win—No Excuses, Just Pure Results.'
      ],
      storyIntro: (name, aud) =>
        `Built exclusively for ${aud} who demand nothing short of absolute dominance, the ${name} refuses to play small. Packed with raw power and battle-tested resilience, it turns obstacles into dust and sets an aggressive new standard.`,
      storyOutro: (name) =>
        `Don't settle for mediocre. Grab the ${name}, unleash your competitive edge, and take full control of your arena.`
    }
  };

  // Helper: Slugify string
  function slugify(text) {
    return (text || '')
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Feature to Bullet Point & Spec Extractor
  function parseFeatures(rawText) {
    if (!rawText) return [];
    return rawText
      .split(/[\n,;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  // Generate Benefit Bullet Points
  function generateBullets(featuresList, tone) {
    const toneData = TONE_STYLES[tone] || TONE_STYLES.Luxury;

    return featuresList.map(feature => {
      // Determine leading label / keyword
      let label = feature;
      let benefit = '';

      if (feature.toLowerCase().includes('battery') || feature.toLowerCase().includes('hour') || feature.toLowerCase().includes('charge')) {
        label = 'All-Day Endurance';
        benefit = `Engineered with ${feature}, ensuring non-stop uptime whether commuting, traveling, or powering through intensive sessions without hunting for an outlet.`;
      } else if (feature.toLowerCase().includes('noise') || feature.toLowerCase().includes('anc') || feature.toLowerCase().includes('acoustic')) {
        label = 'Acoustic Sanctuary';
        benefit = `Featuring ${feature} to silence intrusive background ambient noise and create an immediate zone of serene, uninterrupted focus.`;
      } else if (feature.toLowerCase().includes('bluetooth') || feature.toLowerCase().includes('wireless') || feature.toLowerCase().includes('connectivity')) {
        label = 'Seamless Connectivity';
        benefit = `Powered by ${feature} for instantaneous pairing, ultra-low latency, and fluid handoffs across all your devices.`;
      } else if (feature.toLowerCase().includes('memory foam') || feature.toLowerCase().includes('comfort') || feature.toLowerCase().includes('cushion') || feature.toLowerCase().includes('ergonomic')) {
        label = 'Ergonomic Luxury';
        benefit = `Equipped with ${feature} that gracefully contours to your anatomy for cloud-like comfort across hours of continuous wear.`;
      } else if (feature.toLowerCase().includes('lightweight') || feature.toLowerCase().includes('gram') || feature.toLowerCase().includes('weight')) {
        label = 'Featherweight Agile Design';
        benefit = `Boasting ${feature} to minimize fatigue and maximize freedom of movement during heavy day-to-day use.`;
      } else if (feature.toLowerCase().includes('grip') || feature.toLowerCase().includes('traction') || feature.toLowerCase().includes('sole')) {
        label = 'All-Terrain Traction';
        benefit = `Utilizes ${feature} to deliver unwavering stability and grip over slippery, rocky, or challenging terrain.`;
      } else if (feature.toLowerCase().includes('organic') || feature.toLowerCase().includes('vegan') || feature.toLowerCase().includes('natural') || feature.toLowerCase().includes('oil')) {
        label = 'Clean Bio-Active Formula';
        benefit = `Formulated with ${feature} to nourish and fortify deeply without harsh synthetic chemicals, silicones, or fillers.`;
      } else if (feature.toLowerCase().includes('query') || feature.toLowerCase().includes('pipeline') || feature.toLowerCase().includes('api') || feature.toLowerCase().includes('sql') || feature.toLowerCase().includes('engine')) {
        label = 'Enterprise Throughput';
        benefit = `Built around ${feature} to process massive data volumes with sub-millisecond precision and scalable execution.`;
      } else {
        // Fallback dynamic generator
        const leadWord = feature.charAt(0).toUpperCase() + feature.slice(1);
        label = leadWord.split(' ').slice(0, 3).join(' ');
        benefit = `Integrates ${feature} to ${toneData.verbs[0]} everyday efficiency and guarantee consistent, high-impact results.`;
      }

      return { label, benefit, raw: feature };
    });
  }

  // Generate Technical Specs Matrix
  function generateSpecs(featuresList, category, productName) {
    const specs = [];

    // Extract numerical or key metrics from features
    featuresList.forEach(feat => {
      const lower = feat.toLowerCase();
      if (lower.includes('battery') || lower.includes('hour') || lower.includes('mah')) {
        specs.push({ key: 'Battery & Power', val: feat });
      } else if (lower.includes('anc') || lower.includes('noise') || lower.includes('driver') || lower.includes('burr') || lower.includes('sensor')) {
        specs.push({ key: 'Hardware Architecture', val: feat });
      } else if (lower.includes('bluetooth') || lower.includes('wifi') || lower.includes('usb') || lower.includes('api') || lower.includes('webhook')) {
        specs.push({ key: 'Interface & Connectivity', val: feat });
      } else if (lower.includes('weight') || lower.includes('gram') || lower.includes('kg') || lower.includes('oz')) {
        specs.push({ key: 'Weight & Form Factor', val: feat });
      } else if (lower.includes('wool') || lower.includes('steel') || lower.includes('titanium') || lower.includes('material') || lower.includes('leather') || lower.includes('tpu') || lower.includes('foam')) {
        specs.push({ key: 'Materials & Finish', val: feat });
      }
    });

    // Add category essentials if list has fewer than 4 specs
    if (specs.length < 4) {
      if (category === 'Consumer Electronics') {
        specs.push({ key: 'Compatibility', val: 'iOS, Android, macOS, Windows, Linux' });
        specs.push({ key: 'Warranty Coverage', val: '2-Year Manufacturer Limited Warranty' });
        specs.push({ key: 'In the Box', val: `${productName}, braided USB-C cable, quick-start manual` });
      } else if (category === 'Fitness & Outdoors') {
        specs.push({ key: 'Activity Type', val: 'Trail Running, Mountain Training, Multi-Sport' });
        specs.push({ key: 'Weather Resistance', val: 'Hydrophobic coating, mud-shedding tread' });
        specs.push({ key: 'Warranty Coverage', val: '1-Year Trail Guarantee' });
      } else if (category === 'Beauty & Skincare') {
        specs.push({ key: 'Skin Type Suitability', val: 'All skin types, sensitive skin tested' });
        specs.push({ key: 'Volume / Net Content', val: '30 ml / 1.0 fl. oz. dropper bottle' });
        specs.push({ key: 'Ethical Standards', val: 'Cruelty-Free, 100% Vegan, Leaping Bunny Certified' });
      } else if (category === 'Software & Digital') {
        specs.push({ key: 'Deployment Model', val: 'Cloud Multi-Region / On-Premise Docker' });
        specs.push({ key: 'Compliance & Security', val: 'SOC2 Type II, GDPR, HIPAA Ready' });
        specs.push({ key: 'SLA Guarantee', val: '99.99% Uptime High-Availability SLA' });
      } else {
        specs.push({ key: 'Origin & Craft', val: 'Responsibly sourced, artisan assembled' });
        specs.push({ key: 'Care & Maintenance', val: 'Inspect care label, gentle wash or wipe' });
        specs.push({ key: 'Guarantee', val: '30-Day Risk-Free Satisfaction Guarantee' });
      }
    }

    // Limit to 5-6 crisp specs
    return specs.slice(0, 6);
  }

  // Generate SEO Meta Description (150 - 160 chars)
  function generateSeoMeta(productName, featuresList, category, tone) {
    const topFeature = featuresList[0] || 'premium design';
    const secondFeature = featuresList[1] || 'unmatched quality';

    let base = `Discover ${productName}. Featuring ${topFeature} & ${secondFeature}. Engineered for effortless performance. Order now with free shipping!`;

    if (base.length > 160) {
      base = `Shop ${productName}. Built with ${topFeature}. Experience top-tier ${category.toLowerCase()} quality with fast shipping today!`;
    }
    if (base.length > 160) {
      base = `Discover ${productName}—featuring ${topFeature} and proven reliability. Free shipping & 30-day money-back guarantee!`;
    }
    if (base.length < 145) {
      base = `Discover the all-new ${productName}. Packed with ${topFeature} and ${secondFeature}. Enjoy fast, free express shipping and a 30-day guarantee!`;
    }

    // Ensure it strictly stays under 162
    if (base.length > 160) {
      base = base.substring(0, 157) + '...';
    }

    return base;
  }

  // Generate Full Markdown String
  function generateFullMarkdown(data, hook, story, bullets, specs, seoMeta) {
    const specRows = specs.map(s => `| **${s.key}** | ${s.val} |`).join('\n');
    const bulletList = bullets.map(b => `- **${b.label}:** ${b.benefit}`).join('\n');

    return `# ${data.name}
*Category: ${data.category} | Brand Voice: ${data.tone}*

> **"${hook}"**

---

### Overview & Value Story
${story}

---

### Key Features & Benefits
${bulletList}

---

### Technical Specifications
| Specification | Details |
| :--- | :--- |
${specRows}

---

### SEO Meta Description (${seoMeta.length} chars)
\`\`\`text
${seoMeta}
\`\`\`
`;
  }

  // Toast notifier
  function showToast(message) {
    const toast = document.getElementById('app-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  // Copy to clipboard helper
  function copyTextToClipboard(text, successMsg = 'Copied to clipboard!') {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg);
      }).catch(() => {
        fallbackCopy(text, successMsg);
      });
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast(successMsg);
    } catch (e) {
      showToast('Failed to copy');
    }
    document.body.removeChild(ta);
  }

  // Main UI Controller
  document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const nameInput = document.getElementById('prod-name-input');
    const catSelect = document.getElementById('prod-cat-select');
    const toneSelect = document.getElementById('prod-tone-select');
    const customerInput = document.getElementById('prod-customer-input');
    const featuresInput = document.getElementById('prod-features-input');

    // Buttons
    const generateBtn = document.getElementById('generate-btn');
    const randomBtn = document.getElementById('random-btn');
    const copyFullBtn = document.getElementById('copy-full-btn');

    // Display elements
    const cardCatBadge = document.getElementById('card-cat-badge');
    const cardToneBadge = document.getElementById('card-tone-badge');
    const cardProdTitle = document.getElementById('card-prod-title');
    const cardHookHeadline = document.getElementById('card-hook-headline');
    const cardBenefitStory = document.getElementById('card-benefit-story');
    const cardBulletsList = document.getElementById('card-bullets-list');
    const cardSpecsTable = document.getElementById('card-specs-table');
    const metaCharCount = document.getElementById('meta-char-count');
    const serpSlug = document.getElementById('serp-slug');
    const serpTitle = document.getElementById('serp-title');
    const serpDesc = document.getElementById('serp-desc');
    const markdownDisplay = document.getElementById('markdown-code-display');

    // Views
    const tabBtns = document.querySelectorAll('.view-tab-btn');
    const viewCard = document.getElementById('view-card');
    const viewMarkdown = document.getElementById('view-markdown');

    let currentGenerated = {};
    let sampleIndex = 0;

    // Tab Navigation
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const targetView = btn.getAttribute('data-view');
        if (targetView === 'view-card') {
          if (viewCard) viewCard.style.display = 'block';
          if (viewMarkdown) viewMarkdown.style.display = 'none';
        } else {
          if (viewCard) viewCard.style.display = 'none';
          if (viewMarkdown) viewMarkdown.style.display = 'block';
        }
      });
    });

    // Core Generation Routine
    function runGeneration() {
      const name = (nameInput?.value || '').trim() || 'Premium Product';
      const category = catSelect?.value || 'Consumer Electronics';
      const tone = toneSelect?.value || 'Luxury';
      const audience = (customerInput?.value || '').trim() || 'Modern consumers seeking uncompromised quality';
      const rawFeatures = (featuresInput?.value || '').trim() || 'High quality materials, ergonomic design, premium performance';

      const featuresList = parseFeatures(rawFeatures);
      const toneData = TONE_STYLES[tone] || TONE_STYLES.Luxury;

      // 1. Hook Headline
      // Select appropriate hook from pool or synthesize based on tone
      const hookTemplate = toneData.hooks[Math.floor(Math.random() * toneData.hooks.length)];
      const hook = `"${hookTemplate}"`;

      // 2. Benefit Story
      const intro = toneData.storyIntro(name, audience);
      const topFeature = featuresList[0] || 'unmatched engineering';
      const middleStory = `At its core lies ${topFeature}, creating an intuitive and seamless synergy between modern form and purposeful function. No detail has been left to chance, ensuring that every touchpoint meets and exceeds rigorous expectations.`;
      const outro = toneData.storyOutro(name);
      const fullStoryHtml = `<p>${intro}</p><p style="margin-top: 0.65rem;">${middleStory}</p><p style="margin-top: 0.65rem;">${outro}</p>`;
      const fullStoryText = `${intro}\n\n${middleStory}\n\n${outro}`;

      // 3. Bullets
      const bullets = generateBullets(featuresList, tone);

      // 4. Specs
      const specs = generateSpecs(featuresList, category, name);

      // 5. SEO Meta & SERP
      const seoMeta = generateSeoMeta(name, featuresList, category, tone);
      const slug = slugify(name);
      const titleTag = `${name} | Official Store`;

      // 6. Markdown
      const markdown = generateFullMarkdown(
        { name, category, tone, audience },
        hookTemplate,
        fullStoryText,
        bullets,
        specs,
        seoMeta
      );

      // Cache state
      currentGenerated = {
        name,
        category,
        tone,
        hook: hookTemplate,
        story: fullStoryText,
        bullets,
        specs,
        seoMeta,
        markdown
      };

      // Update Card DOM
      if (cardCatBadge) cardCatBadge.textContent = category;
      if (cardToneBadge) cardToneBadge.textContent = `${tone} Voice`;
      if (cardProdTitle) cardProdTitle.textContent = name;
      if (cardHookHeadline) cardHookHeadline.textContent = hook;
      if (cardBenefitStory) cardBenefitStory.innerHTML = fullStoryHtml;

      if (cardBulletsList) {
        cardBulletsList.innerHTML = bullets
          .map(b => `<li><strong>${b.label}:</strong> ${b.benefit}</li>`)
          .join('');
      }

      if (cardSpecsTable) {
        cardSpecsTable.innerHTML = specs
          .map(s => `<tr><td class="spec-key">${s.key}</td><td class="spec-val">${s.val}</td></tr>`)
          .join('');
      }

      if (metaCharCount) metaCharCount.textContent = seoMeta.length;
      if (serpSlug) serpSlug.textContent = slug;
      if (serpTitle) serpTitle.textContent = titleTag;
      if (serpDesc) serpDesc.textContent = seoMeta;

      if (markdownDisplay) markdownDisplay.textContent = markdown;
    }

    // Part Copy Buttons Handler
    document.querySelectorAll('.copy-part-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const part = btn.getAttribute('data-part');
        let textToCopy = '';
        switch (part) {
          case 'hook':
            textToCopy = currentGenerated.hook || '';
            break;
          case 'story':
            textToCopy = currentGenerated.story || '';
            break;
          case 'bullets':
            textToCopy = (currentGenerated.bullets || [])
              .map(b => `• ${b.label}: ${b.benefit}`)
              .join('\n');
            break;
          case 'specs':
            textToCopy = (currentGenerated.specs || [])
              .map(s => `${s.key}: ${s.val}`)
              .join('\n');
            break;
          case 'seo':
            textToCopy = currentGenerated.seoMeta || '';
            break;
        }
        if (textToCopy) {
          copyTextToClipboard(textToCopy, `Copied ${part} to clipboard!`);
        }
      });
    });

    // Full Copy Handler
    if (copyFullBtn) {
      copyFullBtn.addEventListener('click', () => {
        if (currentGenerated.markdown) {
          copyTextToClipboard(currentGenerated.markdown, 'Full product description copied!');
        }
      });
    }

    // Random Sample Button
    if (randomBtn) {
      randomBtn.addEventListener('click', () => {
        sampleIndex = (sampleIndex + 1) % SAMPLE_PRODUCTS.length;
        const sample = SAMPLE_PRODUCTS[sampleIndex];

        if (nameInput) nameInput.value = sample.name;
        if (catSelect) catSelect.value = sample.category;
        if (toneSelect) toneSelect.value = sample.tone;
        if (customerInput) customerInput.value = sample.audience;
        if (featuresInput) featuresInput.value = sample.features;

        runGeneration();
        showToast(`Loaded sample: ${sample.name}`);
      });
    }

    // Generate Button
    if (generateBtn) {
      generateBtn.addEventListener('click', () => {
        runGeneration();
        showToast('Description regenerated!');
      });
    }

    // Initial load
    runGeneration();
  });
})();