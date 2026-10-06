// Newsletter Builder & Markdown Publisher
// Client-side structured newsletter drafting, live preview & dual export (HTML/Markdown)

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const nlTitle = document.getElementById('nl-title');
  const nlIssue = document.getElementById('nl-issue');
  const nlDate = document.getElementById('nl-date');
  const nlTagline = document.getElementById('nl-tagline');

  const nlEditorialAuthor = document.getElementById('nl-editorial-author');
  const nlEditorialBody = document.getElementById('nl-editorial-body');

  const storiesContainer = document.getElementById('stories-container');
  const btnAddStory = document.getElementById('btn-add-story');

  const nlEnableSponsor = document.getElementById('nl-enable-sponsor');
  const nlSponsorName = document.getElementById('nl-sponsor-name');
  const nlSponsorTagline = document.getElementById('nl-sponsor-tagline');
  const nlSponsorCopy = document.getElementById('nl-sponsor-copy');
  const nlSponsorBtn = document.getElementById('nl-sponsor-btn');
  const nlSponsorUrl = document.getElementById('nl-sponsor-url');

  const nlEnableQuote = document.getElementById('nl-enable-quote');
  const nlQuoteText = document.getElementById('nl-quote-text');
  const nlQuoteAuthor = document.getElementById('nl-quote-author');

  const nlOutroText = document.getElementById('nl-outro-text');
  const nlAuthorSig = document.getElementById('nl-author-sig');

  // Preview elements
  const previewSheet = document.getElementById('preview-sheet');
  const btnThemeDark = document.getElementById('btn-theme-dark');
  const btnThemePaper = document.getElementById('btn-theme-paper');

  // Stats
  const nlStatWords = document.getElementById('nl-stat-words');
  const nlStatReadTime = document.getElementById('nl-stat-read-time');
  const nlStatChars = document.getElementById('nl-stat-chars');

  // Buttons
  const btnCopyMd = document.getElementById('btn-copy-md');
  const btnCopyHtml = document.getElementById('btn-copy-html');
  const btnExportFile = document.getElementById('btn-export-file');
  const btnNlClear = document.getElementById('btn-nl-clear');
  const presetButtons = document.querySelectorAll('.preset-chip[data-sample]');

  // Accordions
  const accordions = document.querySelectorAll('.accordion-item-nl');

  let stories = [];

  const SAMPLES = {
    tech: {
      title: 'THE WEEKLY SYNC',
      issue: 'Issue #42',
      date: 'October 6, 2026',
      tagline: 'Curated signals on technology, system architecture, and modern developer workflows.',
      editorialAuthor: 'From the Editor',
      editorialBody: 'Welcome back to another edition of The Weekly Sync! This week we are diving deep into the rapid rise of local-first software and how decentralized caching is simplifying edge systems. Grab a warm cup of coffee and let’s jump in.',
      enableSponsor: true,
      sponsorName: 'HyperScale Cloud',
      sponsorTagline: 'Deploy global edge functions in under 50ms.',
      sponsorCopy: 'Tired of complex Kubernetes setups? HyperScale gives you instantaneous global serverless compute with zero configuration. Get $200 in free credits today.',
      sponsorBtn: 'Claim $200 Credits \u2192',
      sponsorUrl: 'https://example.com/sponsor',
      enableQuote: true,
      quoteText: 'Simplicity is prerequisite for reliability.',
      quoteAuthor: 'Edsger W. Dijkstra',
      outro: 'Thanks for reading! If you enjoyed this issue, please share it with a friend or colleague. Until next Tuesday!',
      authorSig: '— The Editorial Team',
      stories: [
        {
          tag: 'ARCHITECTURE',
          title: 'The Local-First Paradigm Shift',
          url: 'https://example.com/local-first',
          desc: 'Why syncing CRDTs to local SQLite databases in the browser is replacing traditional client-server REST paradigms.'
        },
        {
          tag: 'PERFORMANCE',
          title: 'Zero-Allocation JSON Parsing in Rust',
          url: 'https://example.com/rust-json',
          desc: 'A comprehensive benchmark comparing memory reuse strategies when parsing multi-gigabyte telemetry payloads.'
        },
        {
          tag: 'SECURITY',
          title: 'Hardware-Enforced Enclaves in Production',
          url: 'https://example.com/enclaves',
          desc: 'How confidential computing environments protect tenant keys across untrusted public clouds.'
        }
      ]
    },
    creator: {
      title: 'THE CREATIVE SPARK',
      issue: 'Volume #18',
      date: 'October 2026',
      tagline: 'Actionable tactics for independent digital product creators and solo founders.',
      editorialAuthor: 'Notes from Alex',
      editorialBody: 'Hey creators! The biggest mistake I see early builders make is perfecting a product before testing audience appetite. In this issue, we explore low-friction validation tests and copywriting fundamentals that convert casual visitors into lifetime fans.',
      enableSponsor: false,
      sponsorName: '',
      sponsorTagline: '',
      sponsorCopy: '',
      sponsorBtn: '',
      sponsorUrl: '',
      enableQuote: true,
      quoteText: 'Do not seek to follow in the footsteps of the wise; seek what they sought.',
      quoteAuthor: 'Matsuo Bashō',
      outro: 'Keep shipping, stay curious, and see you next Friday!',
      authorSig: '— Alex Rivera, Creator',
      stories: [
        {
          tag: 'GROWTH',
          title: 'How to Validate a SaaS in 48 Hours',
          url: 'https://example.com/validate',
          desc: 'The exact step-by-step landing page template used to pre-sell $12k in subscriptions before writing code.'
        },
        {
          tag: 'DESIGN',
          title: 'Micro-Interactions That Delight',
          url: 'https://example.com/interactions',
          desc: '5 subtle animation principles that make modern web applications feel responsive and human.'
        }
      ]
    }
  };

  // Accordion toggle
  accordions.forEach(acc => {
    const header = acc.querySelector('.accordion-header-nl');
    header.addEventListener('click', () => {
      acc.classList.toggle('collapsed');
      const chevron = acc.querySelector('.chevron');
      if (chevron) {
        chevron.innerHTML = acc.classList.contains('collapsed') ? '&#9656;' : '&#9662;';
      }
    });
  });

  // Theme switchers
  btnThemeDark.addEventListener('click', () => {
    btnThemeDark.classList.add('active');
    btnThemePaper.classList.remove('active');
    previewSheet.className = 'nl-rendered-sheet theme-dark';
  });

  btnThemePaper.addEventListener('click', () => {
    btnThemePaper.classList.add('active');
    btnThemeDark.classList.remove('active');
    previewSheet.className = 'nl-rendered-sheet theme-paper';
  });

  /**
   * Render stories in left sidebar editor
   */
  function renderStoriesEditor() {
    storiesContainer.innerHTML = '';
    stories.forEach((story, idx) => {
      const card = document.createElement('div');
      card.className = 'story-entry-card';
      card.innerHTML = `
        <button class="remove-btn" data-index="${idx}" title="Remove Story">&times;</button>
        <div style="display: grid; grid-template-columns: 120px 1fr; gap: 0.5rem;">
          <div class="form-group">
            <label style="font-size: 0.725rem;">Tag / Category</label>
            <input type="text" class="form-input story-tag" value="${escapeHtml(story.tag)}" placeholder="TECH" style="font-size: 0.8rem; padding: 0.35rem 0.5rem;">
          </div>
          <div class="form-group">
            <label style="font-size: 0.725rem;">Headline Title</label>
            <input type="text" class="form-input story-title" value="${escapeHtml(story.title)}" placeholder="Article Headline" style="font-size: 0.8rem; padding: 0.35rem 0.5rem;">
          </div>
        </div>
        <div class="form-group">
          <label style="font-size: 0.725rem;">Link URL</label>
          <input type="text" class="form-input story-url" value="${escapeHtml(story.url)}" placeholder="https://example.com" style="font-size: 0.8rem; padding: 0.35rem 0.5rem;">
        </div>
        <div class="form-group">
          <label style="font-size: 0.725rem;">Brief Summary / Description</label>
          <textarea class="form-textarea story-desc" style="min-height: 55px; font-size: 0.8rem; padding: 0.4rem 0.5rem;">${escapeHtml(story.desc)}</textarea>
        </div>
      `;

      // Input events on story fields
      card.querySelector('.story-tag').addEventListener('input', (e) => {
        stories[idx].tag = e.target.value;
        updatePreview();
      });
      card.querySelector('.story-title').addEventListener('input', (e) => {
        stories[idx].title = e.target.value;
        updatePreview();
      });
      card.querySelector('.story-url').addEventListener('input', (e) => {
        stories[idx].url = e.target.value;
        updatePreview();
      });
      card.querySelector('.story-desc').addEventListener('input', (e) => {
        stories[idx].desc = e.target.value;
        updatePreview();
      });

      // Remove button
      card.querySelector('.remove-btn').addEventListener('click', () => {
        stories.splice(idx, 1);
        renderStoriesEditor();
        updatePreview();
      });

      storiesContainer.appendChild(card);
    });
  }

  btnAddStory.addEventListener('click', () => {
    stories.push({
      tag: 'FEATURED',
      title: 'New Headline Title',
      url: 'https://example.com',
      desc: 'Brief summary highlighting the key takeaway or insight.'
    });
    renderStoriesEditor();
    updatePreview();
  });

  /**
   * Generate Clean HTML Newsletter Content
   */
  function generateHtmlNewsletter() {
    const title = nlTitle.value.trim();
    const issue = nlIssue.value.trim();
    const date = nlDate.value.trim();
    const tagline = nlTagline.value.trim();

    const editorialAuthor = nlEditorialAuthor.value.trim();
    const editorialBody = nlEditorialBody.value.trim().replace(/\n/g, '<br><br>');

    const enableSponsor = nlEnableSponsor.checked;
    const sponsorName = nlSponsorName.value.trim();
    const sponsorTagline = nlSponsorTagline.value.trim();
    const sponsorCopy = nlSponsorCopy.value.trim();
    const sponsorBtn = nlSponsorBtn.value.trim();
    const sponsorUrl = nlSponsorUrl.value.trim();

    const enableQuote = nlEnableQuote.checked;
    const quoteText = nlQuoteText.value.trim();
    const quoteAuthor = nlQuoteAuthor.value.trim();

    const outro = nlOutroText.value.trim().replace(/\n/g, '<br><br>');
    const authorSig = nlAuthorSig.value.trim();

    let storiesHtml = '';
    stories.forEach(s => {
      storiesHtml += `
      <div style="margin-bottom: 24px;">
        ${s.tag ? `<span class="nl-tag">${escapeHtml(s.tag)}</span>` : ''}
        <h3 style="margin: 4px 0 6px 0; font-size: 1.2rem; font-weight: 700;">
          <a href="${escapeHtml(s.url || '#')}" target="_blank" style="text-decoration: none;">${escapeHtml(s.title || 'Untitled Story')} &rarr;</a>
        </h3>
        <p style="margin: 0; font-size: 0.95rem; opacity: 0.85; line-height: 1.6;">${escapeHtml(s.desc || '')}</p>
      </div>
      `;
    });

    let sponsorHtml = '';
    if (enableSponsor && sponsorName) {
      sponsorHtml = `
      <div class="nl-box">
        <span style="font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.7;">SPONSORED</span>
        <h3 style="margin: 6px 0 4px 0; font-size: 1.15rem; font-weight: 700;">${escapeHtml(sponsorName)}</h3>
        ${sponsorTagline ? `<div style="font-size: 0.9rem; font-weight: 600; margin-bottom: 8px;">${escapeHtml(sponsorTagline)}</div>` : ''}
        <p style="font-size: 0.9rem; line-height: 1.5; margin-bottom: 12px; opacity: 0.9;">${escapeHtml(sponsorCopy)}</p>
        ${sponsorBtn ? `<a href="${escapeHtml(sponsorUrl || '#')}" target="_blank" style="display: inline-block; font-size: 0.85rem; font-weight: 700; text-decoration: underline;">${escapeHtml(sponsorBtn)}</a>` : ''}
      </div>
      `;
    }

    let quoteHtml = '';
    if (enableQuote && quoteText) {
      quoteHtml = `
      <blockquote class="nl-quote">
        <p style="margin: 0 0 6px 0; font-size: 1.05rem;">"${escapeHtml(quoteText)}"</p>
        <cite style="display: block; font-size: 0.85rem; font-style: normal; opacity: 0.75;">— ${escapeHtml(quoteAuthor || 'Unknown')}</cite>
      </blockquote>
      `;
    }

    return `
    <header style="border-bottom: 1px solid currentColor; opacity: 0.9; padding-bottom: 1.5rem; margin-bottom: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: baseline; font-size: 0.8rem; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">
        <span>${escapeHtml(issue)}</span>
        <span>${escapeHtml(date)}</span>
      </div>
      <h1 style="font-size: 2.4rem; font-weight: 800; margin: 0.5rem 0 0.25rem 0; letter-spacing: -0.02em;">${escapeHtml(title)}</h1>
      ${tagline ? `<p style="font-size: 1.05rem; opacity: 0.75; margin: 0; line-height: 1.5;">${escapeHtml(tagline)}</p>` : ''}
    </header>

    ${editorialBody ? `
    <section style="margin-bottom: 2.25rem;">
      <h2 style="font-size: 1.1rem; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.7; margin-bottom: 0.75rem; font-weight: 700;">${escapeHtml(editorialAuthor)}</h2>
      <div style="font-size: 1.05rem; line-height: 1.75; opacity: 0.9;">
        ${editorialBody}
      </div>
    </section>
    <hr style="opacity: 0.15; margin: 2rem 0;">
    ` : ''}

    ${stories.length > 0 ? `
    <section style="margin-bottom: 2.25rem;">
      <h2 style="font-size: 1.1rem; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.7; margin-bottom: 1.25rem; font-weight: 700;">Top Stories &amp; Links</h2>
      ${storiesHtml}
    </section>
    ` : ''}

    ${sponsorHtml}

    ${quoteHtml}

    <footer style="margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid currentColor; opacity: 0.9;">
      <p style="font-size: 1rem; line-height: 1.6; opacity: 0.85; margin-bottom: 1rem;">${outro}</p>
      <div style="font-weight: 700; font-size: 0.95rem;">${escapeHtml(authorSig)}</div>
    </footer>
    `;
  }

  /**
   * Generate Clean Markdown representation
   */
  function generateMarkdown() {
    const title = nlTitle.value.trim();
    const issue = nlIssue.value.trim();
    const date = nlDate.value.trim();
    const tagline = nlTagline.value.trim();

    const editorialAuthor = nlEditorialAuthor.value.trim();
    const editorialBody = nlEditorialBody.value.trim();

    const enableSponsor = nlEnableSponsor.checked;
    const sponsorName = nlSponsorName.value.trim();
    const sponsorTagline = nlSponsorTagline.value.trim();
    const sponsorCopy = nlSponsorCopy.value.trim();
    const sponsorBtn = nlSponsorBtn.value.trim();
    const sponsorUrl = nlSponsorUrl.value.trim();

    const enableQuote = nlEnableQuote.checked;
    const quoteText = nlQuoteText.value.trim();
    const quoteAuthor = nlQuoteAuthor.value.trim();

    const outro = nlOutroText.value.trim();
    const authorSig = nlAuthorSig.value.trim();

    let md = `# ${title}\n\n`;
    md += `**${issue}** | *${date}*\n\n`;
    if (tagline) md += `> ${tagline}\n\n`;
    md += `---\n\n`;

    if (editorialBody) {
      md += `### ${editorialAuthor}\n\n${editorialBody}\n\n---\n\n`;
    }

    if (stories.length > 0) {
      md += `### Top Stories & Links\n\n`;
      stories.forEach(s => {
        md += `#### [${s.title}](${s.url || '#'})\n`;
        if (s.tag) md += `*Category: ${s.tag}*\n\n`;
        if (s.desc) md += `${s.desc}\n\n`;
      });
      md += `---\n\n`;
    }

    if (enableSponsor && sponsorName) {
      md += `### Sponsored: ${sponsorName}\n`;
      if (sponsorTagline) md += `*${sponsorTagline}*\n\n`;
      if (sponsorCopy) md += `${sponsorCopy}\n\n`;
      if (sponsorBtn) md += `[${sponsorBtn}](${sponsorUrl || '#'})\n\n---\n\n`;
    }

    if (enableQuote && quoteText) {
      md += `> "${quoteText}"\n> \n> — *${quoteAuthor}*\n\n---\n\n`;
    }

    if (outro) {
      md += `${outro}\n\n**${authorSig}**\n`;
    }

    return md;
  }

  function escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Update rendered preview and stats counters
   */
  function updatePreview() {
    const html = generateHtmlNewsletter();
    previewSheet.innerHTML = html;

    // Calculate word and read time statistics
    const plainText = previewSheet.innerText || '';
    const words = plainText.match(/\b\w+\b/g) || [];
    const wordCount = words.length;
    const charCount = plainText.length;
    const readMinutes = Math.max(1, Math.ceil(wordCount / 200));

    nlStatWords.textContent = wordCount.toLocaleString();
    nlStatReadTime.textContent = `${readMinutes} min`;
    nlStatChars.textContent = charCount.toLocaleString();
  }

  /**
   * Apply sample preset data
   */
  function applyPreset(data) {
    nlTitle.value = data.title;
    nlIssue.value = data.issue;
    nlDate.value = data.date;
    nlTagline.value = data.tagline;

    nlEditorialAuthor.value = data.editorialAuthor;
    nlEditorialBody.value = data.editorialBody;

    nlEnableSponsor.checked = data.enableSponsor;
    nlSponsorName.value = data.sponsorName;
    nlSponsorTagline.value = data.sponsorTagline;
    nlSponsorCopy.value = data.sponsorCopy;
    nlSponsorBtn.value = data.sponsorBtn;
    nlSponsorUrl.value = data.sponsorUrl;

    nlEnableQuote.checked = data.enableQuote;
    nlQuoteText.value = data.quoteText;
    nlQuoteAuthor.value = data.quoteAuthor;

    nlOutroText.value = data.outro;
    nlAuthorSig.value = data.authorSig;

    stories = JSON.parse(JSON.stringify(data.stories));
    renderStoriesEditor();
    updatePreview();
  }

  // Bind change and input listeners
  const staticInputs = [
    nlTitle, nlIssue, nlDate, nlTagline,
    nlEditorialAuthor, nlEditorialBody,
    nlEnableSponsor, nlSponsorName, nlSponsorTagline, nlSponsorCopy, nlSponsorBtn, nlSponsorUrl,
    nlEnableQuote, nlQuoteText, nlQuoteAuthor,
    nlOutroText, nlAuthorSig
  ];

  staticInputs.forEach(elem => {
    if (elem) {
      elem.addEventListener('input', updatePreview);
      elem.addEventListener('change', updatePreview);
    }
  });

  // Preset button handling
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const sampleKey = btn.dataset.sample;
      if (SAMPLES[sampleKey]) {
        applyPreset(SAMPLES[sampleKey]);
      }
    });
  });

  // Clear button
  btnNlClear.addEventListener('click', () => {
    nlTitle.value = '';
    nlIssue.value = '';
    nlDate.value = '';
    nlTagline.value = '';
    nlEditorialAuthor.value = '';
    nlEditorialBody.value = '';
    nlEnableSponsor.checked = false;
    nlSponsorName.value = '';
    nlSponsorTagline.value = '';
    nlSponsorCopy.value = '';
    nlSponsorBtn.value = '';
    nlSponsorUrl.value = '';
    nlEnableQuote.checked = false;
    nlQuoteText.value = '';
    nlQuoteAuthor.value = '';
    nlOutroText.value = '';
    nlAuthorSig.value = '';
    stories = [];
    renderStoriesEditor();
    updatePreview();
  });

  // Copy Markdown
  btnCopyMd.addEventListener('click', async () => {
    const md = generateMarkdown();
    try {
      await navigator.clipboard.writeText(md);
      const orig = btnCopyMd.innerHTML;
      btnCopyMd.innerHTML = `<span style="color: var(--success);">&#10003; Copied!</span>`;
      setTimeout(() => { btnCopyMd.innerHTML = orig; }, 2000);
    } catch {
      alert('Unable to copy to clipboard.');
    }
  });

  // Copy HTML
  btnCopyHtml.addEventListener('click', async () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(nlTitle.value)} - ${escapeHtml(nlIssue.value)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.7; max-width: 680px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; }
    a { color: #2563eb; }
    .nl-tag { font-size: 11px; font-weight: 700; background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 9999px; text-transform: uppercase; }
    .nl-box { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .nl-quote { border-left: 4px solid #2563eb; background: #f8fafc; padding: 16px 20px; margin: 24px 0; font-style: italic; }
  </style>
</head>
<body>
${generateHtmlNewsletter()}
</body>
</html>`;

    try {
      await navigator.clipboard.writeText(fullHtml);
      const orig = btnCopyHtml.innerHTML;
      btnCopyHtml.innerHTML = `<span style="color: var(--success);">&#10003; Copied!</span>`;
      setTimeout(() => { btnCopyHtml.innerHTML = orig; }, 2000);
    } catch {
      alert('Unable to copy to clipboard.');
    }
  });

  // Export File (Markdown default)
  btnExportFile.addEventListener('click', () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-${(nlIssue.value || 'draft').toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Initialize with Tech sample
  applyPreset(SAMPLES.tech);
});