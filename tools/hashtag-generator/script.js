// Content Hashtag Discovery Engine

const TOPIC_DATABASE = {
  fitness: {
    popular: ['fitness', 'gym', 'workout', 'fit', 'fitnessmotivation', 'bodybuilding', 'training', 'fitfam', 'health', 'lifestyle', 'healthy', 'exercise', 'muscle', 'gymlife', 'fitnesslife'],
    niche: ['fitspo', 'personaltrainer', 'fitnessjourney', 'gymmotivation', 'workoutmotivation', 'homeworkout', 'strengthtraining', 'powerlifting', 'calisthenics', 'nutritiontips', 'shredded', 'gains', 'cardioday'],
    variations: ['dailyworkout', 'fitnessgoal', 'fitlifevibes', 'legdaychallenge', 'gymaddict', 'workoutroutine', 'trainhardorgohome', 'sweatlife', 'corestrength', 'activewear']
  },
  travel: {
    popular: ['travel', 'travelphotography', 'wanderlust', 'photography', 'nature', 'travelgram', 'adventure', 'explore', 'vacation', 'travelblogger', 'landscape', 'trip', 'summer', 'instatravel', 'traveling'],
    niche: ['backpacking', 'hiddenplaces', 'solotraveler', 'roadtripvibes', 'wanderer', 'roamtheplanet', 'discoverearth', 'passionpassport', 'travelcommunity', 'bucketlistadventures', 'traveladdict', 'beautifuldestinations'],
    variations: ['travelinspo', 'travelmoments', 'dailytravel', 'passportready', 'exploretheglobe', 'worldnomads', 'travelescapes', 'adventureawaits', 'postcardsfromtheworld', 'scenicviews']
  },
  technology: {
    popular: ['technology', 'tech', 'coding', 'programming', 'developer', 'software', 'computerscience', 'artificialintelligence', 'webdevelopment', 'innovation', 'engineering', 'science', 'future', 'gadgets'],
    niche: ['webdev', 'frontend', 'backend', 'fullstack', 'pythonprogramming', 'javascriptdev', 'machinelearning', 'datascience', 'cybersecurity', 'cloudcomputing', 'devlife', 'codechallenge', '100daysofcode'],
    variations: ['techtips', 'coderscommunity', 'techtrends', 'developerjourney', 'techworld', 'softwareengineering', 'devhumor', 'moderntech', 'buildinpublic', 'codegoals']
  },
  business: {
    popular: ['business', 'marketing', 'entrepreneur', 'digitalmarketing', 'success', 'money', 'motivation', 'smallbusiness', 'startup', 'branding', 'sales', 'businessowner', 'finance', 'leadership'],
    niche: ['growthmarketing', 'socialmediamarketing', 'contentcreator', 'contentmarketing', 'ecommercebusiness', 'businessstrategy', 'scaleup', 'b2bmarketing', 'solopreneur', 'marketingagency', 'hustlemode'],
    variations: ['businessgrowth', 'entrepreneurjourney', 'marketingtips', 'startupvibes', 'smartbusiness', 'businessmindset', 'dailyhustle', 'modernentrepreneur', 'growthmindset', 'ceolife']
  },
  food: {
    popular: ['food', 'foodie', 'foodporn', 'instafood', 'yummy', 'delicious', 'foodphotography', 'dinner', 'cooking', 'chef', 'homemade', 'recipe', 'foodblogger', 'healthyfood'],
    niche: ['culinaryart', 'foodstyling', 'homechef', 'bakinglove', 'plantbasedfood', 'gourmetcooking', 'streetfoodlover', 'comfortfood', 'tasteofhome', 'quickrecipes', 'freshingredients'],
    variations: ['foodietribe', 'dailybites', 'cookwithme', 'recipeoftheday', 'foodlovercommunity', 'homemademeals', 'culinaryjourney', 'eatgoodfeelgood', 'flavorboost', 'kitchencreations']
  },
  photography: {
    popular: ['photography', 'photooftheday', 'picoftheday', 'photographer', 'portrait', 'naturephotography', 'streetphotography', 'canon', 'sony', 'art', 'capture', 'photoshoot', 'visuals'],
    niche: ['visualsoflife', 'goldenhourshots', 'portraitmode', 'compositionkiller', 'lensculture', 'moodygrams', 'cinematicshots', 'cameragear', 'framingtheworld', 'lightandshadow', 'depthoffield'],
    variations: ['photoinspo', 'visualcreators', 'dailycapture', 'shootandshare', 'lensaddict', 'artofvisuals', 'creativeframing', 'streetshotdaily', 'shutterbug', 'throughmyeyes']
  },
  fashion: {
    popular: ['fashion', 'style', 'ootd', 'fashionblogger', 'streetwear', 'outfit', 'beauty', 'instafashion', 'model', 'lookbook', 'lifestyle', 'shopping', 'trend', 'clothing'],
    niche: ['outfitinspiration', 'streetstyleinspo', 'minimalstyle', 'sustainablefashion', 'vintageclothing', 'fashionforward', 'wardrobestaples', 'capsulewardrobe', 'curatedcloset', 'chicstyle'],
    variations: ['stylevibes', 'dailyoutfitcheck', 'lookoftheday', 'fashioninspo', 'stylediary', 'fashiontrends', 'modernwardrobe', 'elegancestyle', 'dresstoimpress', 'streetweardaily']
  },
  crypto: {
    popular: ['crypto', 'cryptocurrency', 'bitcoin', 'ethereum', 'blockchain', 'web3', 'trading', 'investing', 'finance', 'nft', 'money', 'decentralized', 'altcoins'],
    niche: ['defiprotocol', 'cryptotrading', 'onchaindata', 'hodl', 'smartcontracts', 'cryptonews', 'cryptocommunity', 'yieldfarming', 'layer2', 'blockchaintechnology', 'cryptoinvestor'],
    variations: ['cryptolife', 'web3revolution', 'cryptotrends', 'dailycrypto', 'blockchainfuture', 'tokeneconomy', 'cryptoalpha', 'digitalassets', 'tradingstrategy', 'futureoffinance']
  }
};

// Generic modifiers for synthesis when custom words are entered
const VIRAL_SUFFIXES = ['daily', 'life', 'world', 'love', 'hub', 'gram', 'vibes', 'goals', 'addict', 'trend', 'zone', 'style', 'mode'];
const NICHE_SUFFIXES = ['community', 'tips', 'inspo', 'guide', 'strategy', 'creator', 'society', 'network', 'mastery', 'club', 'enthusiast', 'pro'];
const COMPOUND_PREFIXES = ['daily', 'best', 'the', 'my', 'modern', 'smart', 'creative', 'top', 'explore', 'pure'];

function cleanWord(str) {
  return str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function formatCasing(tag, casing) {
  // tag without #
  if (casing === 'lowercase') {
    return tag.toLowerCase();
  }
  if (casing === 'uppercase') {
    return tag.toUpperCase();
  }
  if (casing === 'camelcase') {
    // If tag contains camel markers or multiple words
    return tag.replace(/(^|[_\s-])([a-z0-9])/g, (_, p1, p2) => p2.toUpperCase())
      .replace(/^([a-z])/, (m) => m.toUpperCase());
  }
  return tag;
}

function generateHashtagsForInput(rawInput, countPerGroup) {
  const words = rawInput
    .split(/[,\s]+/)
    .map(cleanWord)
    .filter(w => w.length > 1);

  if (words.length === 0) {
    return { popular: [], niche: [], variations: [] };
  }

  // Check if matches a known category
  let matchedCat = null;
  for (const catKey of Object.keys(TOPIC_DATABASE)) {
    if (words.some(w => catKey.includes(w) || w.includes(catKey))) {
      matchedCat = TOPIC_DATABASE[catKey];
      break;
    }
  }

  const popularSet = new Set();
  const nicheSet = new Set();
  const varSet = new Set();

  if (matchedCat) {
    matchedCat.popular.forEach(t => popularSet.add(cleanWord(t)));
    matchedCat.niche.forEach(t => nicheSet.add(cleanWord(t)));
    matchedCat.variations.forEach(t => varSet.add(cleanWord(t)));
  }

  // Synthesize custom tags for each user word
  words.forEach(w => {
    // Core & High Reach
    popularSet.add(w);
    popularSet.add(`${w}love`);
    popularSet.add(`${w}life`);
    popularSet.add(`${w}oftheday`);
    popularSet.add(`insta${w}`);
    popularSet.add(`${w}gram`);
    popularSet.add(`best${w}`);
    popularSet.add(`${w}daily`);
    popularSet.add(`explore${w}`);
    popularSet.add(`viral${w}`);

    // Niche & Community
    nicheSet.add(`${w}community`);
    nicheSet.add(`${w}tips`);
    nicheSet.add(`${w}inspo`);
    nicheSet.add(`${w}guide`);
    nicheSet.add(`${w}creator`);
    nicheSet.add(`${w}hub`);
    nicheSet.add(`${w}society`);
    nicheSet.add(`${w}network`);
    nicheSet.add(`${w}strategy`);
    nicheSet.add(`${w}enthusiast`);
    nicheSet.add(`learn${w}`);

    // Variations
    varSet.add(`daily${w}`);
    varSet.add(`${w}vibes`);
    varSet.add(`${w}goals`);
    varSet.add(`my${w}journey`);
    varSet.add(`${w}challenge`);
    varSet.add(`${w}trends`);
    varSet.add(`modern${w}`);
    varSet.add(`creative${w}`);
    varSet.add(`${w}addict`);
    varSet.add(`${w}world`);
  });

  // Cross-pair words if user entered more than 1
  if (words.length >= 2) {
    for (let i = 0; i < words.length - 1; i++) {
      const combo = `${words[i]}${words[i + 1]}`;
      popularSet.add(combo);
      nicheSet.add(`${combo}community`);
      varSet.add(`${combo}daily`);
    }
  }

  return {
    popular: Array.from(popularSet).slice(0, countPerGroup),
    niche: Array.from(nicheSet).slice(0, countPerGroup),
    variations: Array.from(varSet).slice(0, countPerGroup)
  };
}

document.addEventListener('DOMContentLoaded', () => {
  const topicInput = document.getElementById('topic-input');
  const tagsPerGroupSlider = document.getElementById('tags-per-group');
  const tagsCountLabel = document.getElementById('tags-count-label');
  const casingSelect = document.getElementById('casing-select');
  const separatorSelect = document.getElementById('separator-select');
  const togglePrefix = document.getElementById('toggle-prefix');

  const generateBtn = document.getElementById('generate-btn');
  const clearInputBtn = document.getElementById('clear-input-btn');
  const starterTopicBtns = document.querySelectorAll('.topic-pill');

  // Containers
  const tagsPopularCont = document.getElementById('tags-popular');
  const tagsNicheCont = document.getElementById('tags-niche');
  const tagsVariationsCont = document.getElementById('tags-variations');

  // Badges & Counts
  const countPopularBadge = document.getElementById('count-group-popular');
  const countNicheBadge = document.getElementById('count-group-niche');
  const countVarBadge = document.getElementById('count-group-variations');
  const totalTagsBadge = document.getElementById('total-tags-badge');

  // Copy Buttons
  const copyTop30Btn = document.getElementById('copy-top30-btn');
  const copyTop10Btn = document.getElementById('copy-top10-btn');
  const copyAllBtn = document.getElementById('copy-all-btn');
  const copyPopularBtn = document.getElementById('copy-popular-btn');
  const copyNicheBtn = document.getElementById('copy-niche-btn');
  const copyVariationsBtn = document.getElementById('copy-variations-btn');

  let currentResults = { popular: [], niche: [], variations: [] };

  function renderTags() {
    const casing = casingSelect.value;
    const includePrefix = togglePrefix.checked;
    const prefix = includePrefix ? '#' : '';

    function makeTagHtml(rawTag) {
      const formatted = formatCasing(rawTag, casing);
      return `
        <span class="tag-item" data-tag="${rawTag}">
          <span>${prefix}${formatted}</span>
        </span>
      `;
    }

    tagsPopularCont.innerHTML = currentResults.popular.map(makeTagHtml).join('') || '<span style="color:var(--text-tertiary);">No hashtags generated</span>';
    tagsNicheCont.innerHTML = currentResults.niche.map(makeTagHtml).join('') || '<span style="color:var(--text-tertiary);">No hashtags generated</span>';
    tagsVariationsCont.innerHTML = currentResults.variations.map(makeTagHtml).join('') || '<span style="color:var(--text-tertiary);">No hashtags generated</span>';

    // Counts
    countPopularBadge.textContent = currentResults.popular.length;
    countNicheBadge.textContent = currentResults.niche.length;
    countVarBadge.textContent = currentResults.variations.length;

    const total = currentResults.popular.length + currentResults.niche.length + currentResults.variations.length;
    totalTagsBadge.textContent = `${total} Hashtags Available`;

    // Click on individual tag to copy
    document.querySelectorAll('.tag-item').forEach(tagEl => {
      tagEl.addEventListener('click', () => {
        const text = tagEl.textContent.trim();
        navigator.clipboard.writeText(text).then(() => {
          tagEl.classList.add('active');
          setTimeout(() => tagEl.classList.remove('active'), 800);
        });
      });
    });
  }

  function runGeneration() {
    const rawVal = topicInput.value.trim();
    const count = parseInt(tagsPerGroupSlider.value, 10);
    currentResults = generateHashtagsForInput(rawVal, count);
    renderTags();
  }

  function getFormattedList(tagArray) {
    const casing = casingSelect.value;
    const includePrefix = togglePrefix.checked;
    const prefix = includePrefix ? '#' : '';
    const formatted = tagArray.map(t => `${prefix}${formatCasing(t, casing)}`);

    const sep = separatorSelect.value;
    if (sep === 'comma') {
      return formatted.join(', ');
    }
    if (sep === 'newline') {
      return formatted.join('\n');
    }
    return formatted.join(' ');
  }

  function copyToClipboard(text, btn, successLabel) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      const orig = btn.textContent;
      btn.textContent = successLabel || 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = orig;
        btn.classList.remove('copied');
      }, 1800);
    }).catch(err => console.error('Copy failed', err));
  }

  // Event Listeners
  generateBtn.addEventListener('click', runGeneration);
  topicInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') runGeneration();
  });

  tagsPerGroupSlider.addEventListener('input', (e) => {
    tagsCountLabel.textContent = e.target.value;
    runGeneration();
  });

  casingSelect.addEventListener('change', renderTags);
  separatorSelect.addEventListener('change', renderTags);
  togglePrefix.addEventListener('change', renderTags);

  clearInputBtn.addEventListener('click', () => {
    topicInput.value = '';
    currentResults = { popular: [], niche: [], variations: [] };
    renderTags();
    topicInput.focus();
  });

  starterTopicBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      topicInput.value = btn.dataset.topic;
      runGeneration();
    });
  });

  // Copy Handlers
  copyTop30Btn.addEventListener('click', () => {
    // Interleave popular, niche, and variations to give the best mixed set of 30 tags
    const mixed = [];
    const maxLen = Math.max(currentResults.popular.length, currentResults.niche.length, currentResults.variations.length);
    for (let i = 0; i < maxLen; i++) {
      if (currentResults.popular[i] && mixed.length < 30) mixed.push(currentResults.popular[i]);
      if (currentResults.niche[i] && mixed.length < 30) mixed.push(currentResults.niche[i]);
      if (currentResults.variations[i] && mixed.length < 30) mixed.push(currentResults.variations[i]);
    }
    const text = getFormattedList(mixed.slice(0, 30));
    copyToClipboard(text, copyTop30Btn, `Copied ${Math.min(mixed.length, 30)} Tags!`);
  });

  copyTop10Btn.addEventListener('click', () => {
    const top10 = currentResults.popular.slice(0, 10);
    const text = getFormattedList(top10);
    copyToClipboard(text, copyTop10Btn, 'Copied Top 10!');
  });

  copyAllBtn.addEventListener('click', () => {
    const all = [...currentResults.popular, ...currentResults.niche, ...currentResults.variations];
    const text = getFormattedList(all);
    copyToClipboard(text, copyAllBtn, `Copied All ${all.length}!`);
  });

  copyPopularBtn.addEventListener('click', () => {
    const text = getFormattedList(currentResults.popular);
    copyToClipboard(text, copyPopularBtn, 'Copied Popular!');
  });

  copyNicheBtn.addEventListener('click', () => {
    const text = getFormattedList(currentResults.niche);
    copyToClipboard(text, copyNicheBtn, 'Copied Niche!');
  });

  copyVariationsBtn.addEventListener('click', () => {
    const text = getFormattedList(currentResults.variations);
    copyToClipboard(text, copyVariationsBtn, 'Copied Variations!');
  });

  // Initial Run
  runGeneration();
});