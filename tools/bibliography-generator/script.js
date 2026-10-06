/**
 * Academic Bibliography & Citation Generator
 * APA 7th, MLA 9th, Chicago 17th, Harvard, IEEE
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  let currentStyle = 'apa'; // 'apa', 'mla', 'chicago', 'harvard', 'ieee'
  let currentSource = 'book'; // 'book', 'journal', 'website', 'conference'
  let authors = [
    { first: 'Stuart', last: 'Russell' },
    { first: 'Peter', last: 'Norvig' }
  ];
  let bibliographyList = [];

  // DOM Elements - Selectors
  const styleButtons = document.querySelectorAll('.style-pill');
  const sourceTabButtons = document.querySelectorAll('.source-tab-btn');
  const styleNameBadge = document.getElementById('style-name-badge');

  // Author List Elements
  const authorsContainer = document.getElementById('authors-container');
  const btnAddAuthor = document.getElementById('btn-add-author');

  // Form Fields
  const inpTitle = document.getElementById('inp-title');
  const inpYear = document.getElementById('inp-year');
  const inpEdition = document.getElementById('inp-edition');
  const inpPublisher = document.getElementById('inp-publisher');
  const inpCity = document.getElementById('inp-city');
  const inpJournalName = document.getElementById('inp-journal-name');
  const inpVol = document.getElementById('inp-vol');
  const inpIssue = document.getElementById('inp-issue');
  const inpPages = document.getElementById('inp-pages');
  const inpSiteName = document.getElementById('inp-site-name');
  const inpPubDate = document.getElementById('inp-pub-date');
  const inpAccessDate = document.getElementById('inp-access-date');
  const inpConfName = document.getElementById('inp-conf-name');
  const inpConfLoc = document.getElementById('inp-conf-loc');
  const inpConfPages = document.getElementById('inp-conf-pages');
  const inpDoiUrl = document.getElementById('inp-doi-url');

  // Groups
  const groupBook = document.getElementById('group-book-fields');
  const groupJournal = document.getElementById('group-journal-fields');
  const groupWebsite = document.getElementById('group-website-fields');
  const groupConference = document.getElementById('group-conference-fields');
  const fieldEdition = document.getElementById('field-edition-container');

  // Output Displays
  const dispCitationOutput = document.getElementById('disp-citation-output');
  const dispIntextOutput = document.getElementById('disp-intext-output');
  const btnCopyRich = document.getElementById('btn-copy-rich');
  const btnCopyPlain = document.getElementById('btn-copy-plain');
  const btnCopyIntext = document.getElementById('btn-copy-intext');

  // Bibliography List Elements
  const btnAddToBib = document.getElementById('btn-add-to-bib');
  const btnClearFields = document.getElementById('btn-clear-fields');
  const bibItemsList = document.getElementById('bibliography-items-list');
  const bibCountBadge = document.getElementById('bib-count-badge');
  const btnSortBib = document.getElementById('btn-sort-bib');
  const btnClearBib = document.getElementById('btn-clear-bib');
  const btnCopyAllBib = document.getElementById('btn-copy-all-bib');
  const btnExportBibtex = document.getElementById('btn-export-bibtex');
  const btnExportTxt = document.getElementById('btn-export-txt');

  // Presets
  const presetBook = document.getElementById('preset-book-sample');
  const presetJournal = document.getElementById('preset-journal-sample');
  const presetWeb = document.getElementById('preset-web-sample');

  // --- Author DOM Management ---
  function renderAuthorInputs() {
    authorsContainer.innerHTML = '';
    authors.forEach((auth, idx) => {
      const row = document.createElement('div');
      row.className = 'author-entry-row';
      row.innerHTML = `
        <input type="text" class="form-input auth-first" placeholder="First Name / Initials" value="${auth.first || ''}" style="padding: 0.45rem 0.65rem;">
        <input type="text" class="form-input auth-last" placeholder="Last Name / Org" value="${auth.last || ''}" style="padding: 0.45rem 0.65rem;">
        <button class="btn-icon-del" title="Remove Author" style="padding: 0.35rem;" ${authors.length === 1 ? 'disabled style="opacity:0.4;cursor:default;"' : ''}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      `;

      const firstInput = row.querySelector('.auth-first');
      const lastInput = row.querySelector('.auth-last');
      const delBtn = row.querySelector('.btn-icon-del');

      firstInput.addEventListener('input', () => {
        auth.first = firstInput.value;
        updateCitations();
      });

      lastInput.addEventListener('input', () => {
        auth.last = lastInput.value;
        updateCitations();
      });

      delBtn.addEventListener('click', () => {
        if (authors.length > 1) {
          authors.splice(idx, 1);
          renderAuthorInputs();
          updateCitations();
        }
      });

      authorsContainer.appendChild(row);
    });
  }

  btnAddAuthor.addEventListener('click', () => {
    authors.push({ first: '', last: '' });
    renderAuthorInputs();
    updateCitations();
  });

  // --- Source Tabs Switching ---
  sourceTabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      sourceTabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSource = btn.dataset.source;

      groupBook.style.display = currentSource === 'book' ? 'block' : 'none';
      groupJournal.style.display = currentSource === 'journal' ? 'block' : 'none';
      groupWebsite.style.display = currentSource === 'website' ? 'block' : 'none';
      groupConference.style.display = currentSource === 'conference' ? 'block' : 'none';
      fieldEdition.style.display = (currentSource === 'book' || currentSource === 'conference') ? 'block' : 'none';

      updateCitations();
    });
  });

  // --- Style Selector ---
  styleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      styleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentStyle = btn.dataset.style;
      const names = {
        apa: 'APA 7th',
        mla: 'MLA 9th',
        chicago: 'Chicago 17th',
        harvard: 'Harvard Style',
        ieee: 'IEEE Style'
      };
      styleNameBadge.textContent = names[currentStyle] || 'Citation';
      updateCitations();
      renderBibliographyList();
    });
  });

  // --- Citation Formatters ---
  function getInitials(name) {
    if (!name) return '';
    return name.trim().split(/\s+/).map(p => p[0] ? `${p[0].toUpperCase()}.` : '').join(' ');
  }

  function formatAuthors(style, authList) {
    const valid = authList.filter(a => a.last || a.first);
    if (valid.length === 0) return 'Anonymous';

    if (style === 'apa') {
      if (valid.length === 1) {
        return `${valid[0].last}, ${getInitials(valid[0].first)}`;
      } else if (valid.length === 2) {
        return `${valid[0].last}, ${getInitials(valid[0].first)}, & ${valid[1].last}, ${getInitials(valid[1].first)}`;
      } else if (valid.length <= 20) {
        const formatted = valid.map(a => `${a.last}, ${getInitials(a.first)}`);
        const last = formatted.pop();
        return `${formatted.join(', ')}, & ${last}`;
      } else {
        const first19 = valid.slice(0, 19).map(a => `${a.last}, ${getInitials(a.first)}`).join(', ');
        const last = valid[valid.length - 1];
        return `${first19}, ... ${last.last}, ${getInitials(last.first)}`;
      }
    }

    if (style === 'mla') {
      if (valid.length === 1) {
        return `${valid[0].last}, ${valid[0].first}`;
      } else if (valid.length === 2) {
        return `${valid[0].last}, ${valid[0].first}, and ${valid[1].first} ${valid[1].last}`;
      } else {
        return `${valid[0].last}, ${valid[0].first}, et al.`;
      }
    }

    if (style === 'chicago') {
      if (valid.length === 1) {
        return `${valid[0].last}, ${valid[0].first}`;
      } else if (valid.length === 2) {
        return `${valid[0].last}, ${valid[0].first}, and ${valid[1].first} ${valid[1].last}`;
      } else if (valid.length === 3) {
        return `${valid[0].last}, ${valid[0].first}, ${valid[1].first} ${valid[1].last}, and ${valid[2].first} ${valid[2].last}`;
      } else {
        return `${valid[0].last}, ${valid[0].first}, et al.`;
      }
    }

    if (style === 'harvard') {
      if (valid.length === 1) {
        return `${valid[0].last}, ${getInitials(valid[0].first)}`;
      } else if (valid.length === 2) {
        return `${valid[0].last}, ${getInitials(valid[0].first)} and ${valid[1].last}, ${getInitials(valid[1].first)}`;
      } else {
        return `${valid[0].last}, ${getInitials(valid[0].first)} et al.`;
      }
    }

    if (style === 'ieee') {
      if (valid.length === 1) {
        return `${getInitials(valid[0].first)} ${valid[0].last}`;
      } else if (valid.length === 2) {
        return `${getInitials(valid[0].first)} ${valid[0].last} and ${getInitials(valid[1].first)} ${valid[1].last}`;
      } else if (valid.length <= 6) {
        const formatted = valid.map(a => `${getInitials(a.first)} ${a.last}`);
        const last = formatted.pop();
        return `${formatted.join(', ')}, and ${last}`;
      } else {
        return `${getInitials(valid[0].first)} ${valid[0].last} <em>et al.</em>`;
      }
    }

    return valid.map(a => `${a.first} ${a.last}`).join(', ');
  }

  function formatInText(style, authList, year) {
    const valid = authList.filter(a => a.last || a.first);
    const yr = year || 'n.d.';
    if (valid.length === 0) return `("Title", ${yr})`;

    if (style === 'apa' || style === 'harvard') {
      if (valid.length === 1) return `(${valid[0].last}, ${yr})`;
      if (valid.length === 2) return `(${valid[0].last} & ${valid[1].last}, ${yr})`;
      return `(${valid[0].last} et al., ${yr})`;
    }

    if (style === 'mla') {
      if (valid.length === 1) return `(${valid[0].last})`;
      if (valid.length === 2) return `(${valid[0].last} and ${valid[1].last})`;
      return `(${valid[0].last} et al.)`;
    }

    if (style === 'chicago') {
      if (valid.length === 1) return `(${valid[0].last} ${yr})`;
      if (valid.length === 2) return `(${valid[0].last} and ${valid[1].last} ${yr})`;
      return `(${valid[0].last} et al. ${yr})`;
    }

    if (style === 'ieee') {
      return '[1]';
    }

    return `(${valid[0].last}, ${yr})`;
  }

  function buildCitationHtml(data, style) {
    const authorsStr = formatAuthors(style, data.authors);
    const title = data.title || 'Untitled';
    const year = data.year || 'n.d.';
    const edition = data.edition ? ` (${data.edition})` : '';
    const publisher = data.publisher || '';
    const city = data.city || '';
    const journal = data.journalName || 'Journal';
    const vol = data.volume || '';
    const issue = data.issue || '';
    const pages = data.pages || '';
    const siteName = data.siteName || '';
    const pubDate = data.pubDate || year;
    const accessDate = data.accessDate || '';
    const confName = data.confName || '';
    const confLoc = data.confLoc || '';
    const confPages = data.confPages || '';
    const doiUrl = data.doiUrl ? (data.doiUrl.startsWith('http') ? data.doiUrl : `https://${data.doiUrl}`) : '';

    let res = '';

    // --- APA 7th ---
    if (style === 'apa') {
      if (data.source === 'book') {
        res = `${authorsStr} (${year}). <em>${title}</em>${edition}. ${publisher}.`;
      } else if (data.source === 'journal') {
        const volIssue = vol ? `<em>${vol}</em>${issue ? `(${issue})` : ''}` : '';
        const pg = pages ? `, ${pages}` : '';
        res = `${authorsStr} (${year}). ${title}. <em>${journal}</em>${volIssue ? `, ${volIssue}` : ''}${pg}.`;
      } else if (data.source === 'website') {
        res = `${authorsStr} (${pubDate}). <em>${title}</em>. ${siteName}.`;
      } else if (data.source === 'conference') {
        const pg = confPages ? ` (pp. ${confPages})` : '';
        res = `${authorsStr} (${year}). ${title}. In <em>${confName}</em>${pg}. ${publisher || ''}.`;
      }
      if (doiUrl) res += ` ${doiUrl}`;
    }

    // --- MLA 9th ---
    else if (style === 'mla') {
      if (data.source === 'book') {
        const edStr = data.edition ? `${data.edition}, ` : '';
        res = `${authorsStr}. <em>${title}</em>. ${edStr}${publisher ? `${publisher}, ` : ''}${year}.`;
      } else if (data.source === 'journal') {
        const volStr = vol ? `vol. ${vol}, ` : '';
        const issStr = issue ? `no. ${issue}, ` : '';
        const pgStr = pages ? `pp. ${pages}.` : '';
        res = `${authorsStr}. "${title}." <em>${journal}</em>, ${volStr}${issStr}${year}, ${pgStr}`;
      } else if (data.source === 'website') {
        const accStr = accessDate ? ` Accessed ${accessDate}.` : '';
        res = `${authorsStr}. "${title}." <em>${siteName}</em>, ${pubDate}${doiUrl ? `, ${doiUrl}` : ''}.${accStr}`;
      } else if (data.source === 'conference') {
        const locStr = confLoc ? `${confLoc}, ` : '';
        const pgStr = confPages ? `pp. ${confPages}.` : '';
        res = `${authorsStr}. "${title}." <em>${confName}</em>, ${locStr}${year}, ${pgStr}`;
      }
    }

    // --- Chicago 17th ---
    else if (style === 'chicago') {
      if (data.source === 'book') {
        const cityPub = city && publisher ? `${city}: ${publisher}` : (publisher || city);
        res = `${authorsStr}. ${year}. <em>${title}</em>${edition}.${cityPub ? ` ${cityPub}.` : ''}`;
      } else if (data.source === 'journal') {
        const volIss = vol ? `${vol}${issue ? `, no. ${issue}` : ''}` : '';
        const pg = pages ? `: ${pages}.` : '.';
        res = `${authorsStr}. ${year}. "${title}." <em>${journal}</em> ${volIss}${pg}`;
      } else if (data.source === 'website') {
        const acc = accessDate ? ` Accessed ${accessDate}.` : '';
        res = `${authorsStr}. ${year}. "${title}." ${siteName}.${acc}${doiUrl ? ` ${doiUrl}` : ''}`;
      } else if (data.source === 'conference') {
        const pg = confPages ? `, ${confPages}` : '';
        res = `${authorsStr}. ${year}. "${title}." In <em>${confName}</em>${pg}.${confLoc ? ` ${confLoc}.` : ''}`;
      }
    }

    // --- Harvard ---
    else if (style === 'harvard') {
      if (data.source === 'book') {
        const cityPub = city && publisher ? `${city}: ${publisher}` : (publisher || city);
        res = `${authorsStr}, ${year}. <em>${title}</em>${edition}.${cityPub ? ` ${cityPub}.` : ''}`;
      } else if (data.source === 'journal') {
        const volIss = vol ? `${vol}${issue ? `(${issue})` : ''}` : '';
        const pg = pages ? `, pp. ${pages}.` : '.';
        res = `${authorsStr}, ${year}. '${title}', <em>${journal}</em>, ${volIss}${pg}`;
      } else if (data.source === 'website') {
        const acc = accessDate ? ` [Accessed ${accessDate}]` : '';
        res = `${authorsStr}, ${year}. <em>${title}</em>. Available at: &lt;${doiUrl || 'URL'}&gt;${acc}.`;
      } else if (data.source === 'conference') {
        const pg = confPages ? `, pp. ${confPages}` : '';
        res = `${authorsStr}, ${year}. '${title}', in <em>${confName}</em>.${confLoc ? ` ${confLoc}` : ''}${pg}.`;
      }
    }

    // --- IEEE ---
    else if (style === 'ieee') {
      if (data.source === 'book') {
        const cityPub = city && publisher ? `${city}: ${publisher}` : (publisher || city);
        res = `${authorsStr}, <em>${title}</em>${edition}.${cityPub ? ` ${cityPub},` : ''} ${year}.`;
      } else if (data.source === 'journal') {
        const volStr = vol ? `vol. ${vol}, ` : '';
        const issStr = issue ? `no. ${issue}, ` : '';
        const pgStr = pages ? `pp. ${pages}, ` : '';
        res = `${authorsStr}, "${title}," <em>${journal}</em>, ${volStr}${issStr}${pgStr}${year}.`;
      } else if (data.source === 'website') {
        const acc = accessDate ? ` [Accessed: ${accessDate}].` : '';
        res = `${authorsStr}, "${title}," <em>${siteName}</em>, ${year}. [Online]. Available: ${doiUrl || 'URL'}.${acc}`;
      } else if (data.source === 'conference') {
        const pgStr = confPages ? `, pp. ${confPages}` : '';
        res = `${authorsStr}, "${title}," in <em>${confName}</em>, ${confLoc ? `${confLoc}, ` : ''}${year}${pgStr}.`;
      }
    }

    return res;
  }

  function getFormData() {
    return {
      source: currentSource,
      authors: JSON.parse(JSON.stringify(authors)),
      title: inpTitle.value.trim(),
      year: inpYear.value.trim(),
      edition: inpEdition.value.trim(),
      publisher: inpPublisher.value.trim(),
      city: inpCity.value.trim(),
      journalName: inpJournalName.value.trim(),
      volume: inpVol.value.trim(),
      issue: inpIssue.value.trim(),
      pages: inpPages.value.trim(),
      siteName: inpSiteName.value.trim(),
      pubDate: inpPubDate.value.trim(),
      accessDate: inpAccessDate.value.trim(),
      confName: inpConfName.value.trim(),
      confLoc: inpConfLoc.value.trim(),
      confPages: inpConfPages.value.trim(),
      doiUrl: inpDoiUrl.value.trim()
    };
  }

  function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  function updateCitations() {
    const data = getFormData();
    const citationHtml = buildCitationHtml(data, currentStyle);
    dispCitationOutput.innerHTML = citationHtml;

    const inText = formatInText(currentStyle, data.authors, data.year);
    dispIntextOutput.textContent = inText;
  }

  // --- Copy Actions ---
  function copyFormattedHtml(html, btn) {
    const plainText = stripHtml(html);
    if (navigator.clipboard && window.ClipboardItem) {
      const blobHtml = new Blob([html], { type: 'text/html' });
      const blobText = new Blob([plainText], { type: 'text/plain' });
      const item = new ClipboardItem({
        'text/html': blobHtml,
        'text/plain': blobText
      });
      navigator.clipboard.write([item]).then(() => triggerCopied(btn));
    } else {
      navigator.clipboard.writeText(plainText).then(() => triggerCopied(btn));
    }
  }

  function triggerCopied(btn) {
    const orig = btn.textContent;
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = orig;
      btn.classList.remove('copied');
    }, 1500);
  }

  btnCopyRich.addEventListener('click', () => {
    copyFormattedHtml(dispCitationOutput.innerHTML, btnCopyRich);
  });

  btnCopyPlain.addEventListener('click', () => {
    const plain = stripHtml(dispCitationOutput.innerHTML);
    navigator.clipboard.writeText(plain).then(() => triggerCopied(btnCopyPlain));
  });

  btnCopyIntext.addEventListener('click', () => {
    navigator.clipboard.writeText(dispIntextOutput.textContent).then(() => triggerCopied(btnCopyIntext));
  });

  // --- Bibliography List Management ---
  function renderBibliographyList() {
    bibItemsList.innerHTML = '';
    bibCountBadge.textContent = `${bibliographyList.length} reference${bibliographyList.length === 1 ? '' : 's'}`;

    if (bibliographyList.length === 0) {
      bibItemsList.innerHTML = '<div style="color:var(--text-tertiary); font-size:0.85rem; padding: 1rem 0;">No saved citations yet. Click "+ Add to Bibliography List" above.</div>';
      return;
    }

    bibliographyList.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'bib-item-card';

      const formattedHtml = buildCitationHtml(item, currentStyle);

      card.innerHTML = `
        <div class="citation-hanging-indent" style="font-size: 0.9rem;">
          ${formattedHtml}
        </div>
        <div class="bib-item-actions">
          <button class="btn btn-outline btn-bib-copy" style="font-size:0.75rem; padding: 0.2rem 0.5rem;">Copy</button>
          <button class="btn btn-outline btn-bib-del" style="font-size:0.75rem; padding: 0.2rem 0.5rem; color: var(--error);">Delete</button>
        </div>
      `;

      card.querySelector('.btn-bib-copy').addEventListener('click', (e) => {
        copyFormattedHtml(formattedHtml, e.target);
      });

      card.querySelector('.btn-bib-del').addEventListener('click', () => {
        bibliographyList.splice(idx, 1);
        renderBibliographyList();
      });

      bibItemsList.appendChild(card);
    });
  }

  btnAddToBib.addEventListener('click', () => {
    const data = getFormData();
    bibliographyList.push(data);
    renderBibliographyList();
  });

  btnSortBib.addEventListener('click', () => {
    bibliographyList.sort((a, b) => {
      const authA = (a.authors[0] && (a.authors[0].last || a.authors[0].first)) || a.title;
      const authB = (b.authors[0] && (b.authors[0].last || b.authors[0].first)) || b.title;
      return authA.localeCompare(authB);
    });
    renderBibliographyList();
  });

  btnClearBib.addEventListener('click', () => {
    if (bibliographyList.length > 0 && confirm('Clear all saved citations?')) {
      bibliographyList = [];
      renderBibliographyList();
    }
  });

  btnCopyAllBib.addEventListener('click', () => {
    if (bibliographyList.length === 0) {
      alert('Bibliography is empty.');
      return;
    }
    const htmlList = bibliographyList.map(item => `<p style="padding-left: 2rem; text-indent: -2rem;">${buildCitationHtml(item, currentStyle)}</p>`).join('\n');
    copyFormattedHtml(htmlList, btnCopyAllBib);
  });

  // --- BibTeX Export ---
  btnExportBibtex.addEventListener('click', () => {
    if (bibliographyList.length === 0) {
      alert('No references to export.');
      return;
    }
    let bibtex = '';
    bibliographyList.forEach((item, idx) => {
      const firstAuth = (item.authors[0] && item.authors[0].last) ? item.authors[0].last.toLowerCase().replace(/\s+/g, '') : 'ref';
      const key = `${firstAuth}${item.year || idx + 1}`;
      const authStr = item.authors.map(a => `${a.last}, ${a.first}`).join(' and ');

      if (item.source === 'book') {
        bibtex += `@book{${key},\n  author = {${authStr}},\n  title = {${item.title}},\n  publisher = {${item.publisher}},\n  year = {${item.year}}\n}\n\n`;
      } else if (item.source === 'journal') {
        bibtex += `@article{${key},\n  author = {${authStr}},\n  title = {${item.title}},\n  journal = {${item.journalName}},\n  volume = {${item.volume}},\n  number = {${item.issue}},\n  pages = {${item.pages}},\n  year = {${item.year}}\n}\n\n`;
      } else if (item.source === 'conference') {
        bibtex += `@inproceedings{${key},\n  author = {${authStr}},\n  title = {${item.title}},\n  booktitle = {${item.confName}},\n  pages = {${item.confPages}},\n  year = {${item.year}}\n}\n\n`;
      } else {
        bibtex += `@misc{${key},\n  author = {${authStr}},\n  title = {${item.title}},\n  howpublished = {\\url{${item.doiUrl}}},\n  year = {${item.year}}\n}\n\n`;
      }
    });

    const blob = new Blob([bibtex], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'references.bib';
    a.click();
    URL.revokeObjectURL(url);
  });

  btnExportTxt.addEventListener('click', () => {
    if (bibliographyList.length === 0) {
      alert('No references to export.');
      return;
    }
    const text = bibliographyList.map(item => stripHtml(buildCitationHtml(item, currentStyle))).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bibliography.txt';
    a.click();
    URL.revokeObjectURL(url);
  });

  // --- Presets ---
  presetBook.addEventListener('click', () => {
    sourceTabButtons[0].click();
    authors = [
      { first: 'Stuart', last: 'Russell' },
      { first: 'Peter', last: 'Norvig' }
    ];
    renderAuthorInputs();
    inpTitle.value = 'Artificial Intelligence: A Modern Approach';
    inpYear.value = '2021';
    inpEdition.value = '4th ed.';
    inpPublisher.value = 'Pearson';
    inpCity.value = 'Hoboken, NJ';
    inpDoiUrl.value = 'https://doi.org/10.1007/978-1-4613-8997-2';
    updateCitations();
  });

  presetJournal.addEventListener('click', () => {
    sourceTabButtons[1].click();
    authors = [
      { first: 'Yann', last: 'LeCun' },
      { first: 'Yoshua', last: 'Bengio' },
      { first: 'Geoffrey', last: 'Hinton' }
    ];
    renderAuthorInputs();
    inpTitle.value = 'Deep learning';
    inpYear.value = '2015';
    inpJournalName.value = 'Nature';
    inpVol.value = '521';
    inpIssue.value = '7553';
    inpPages.value = '436-444';
    inpDoiUrl.value = 'https://doi.org/10.1038/nature14539';
    updateCitations();
  });

  presetWeb.addEventListener('click', () => {
    sourceTabButtons[2].click();
    authors = [
      { first: 'Tim', last: 'Berners-Lee' }
    ];
    renderAuthorInputs();
    inpTitle.value = 'Information Management: A Proposal';
    inpYear.value = '1989';
    inpSiteName.value = 'World Wide Web Consortium (W3C)';
    inpPubDate.value = 'March 1989';
    inpAccessDate.value = '6 October 2026';
    inpDoiUrl.value = 'https://www.w3.org/History/1989/proposal.html';
    updateCitations();
  });

  btnClearFields.addEventListener('click', () => {
    authors = [{ first: '', last: '' }];
    renderAuthorInputs();
    document.querySelectorAll('.form-input').forEach(i => i.value = '');
    updateCitations();
  });

  // Input listeners on all text inputs
  document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('input', updateCitations);
  });

  // Initialize
  renderAuthorInputs();
  // Add initial sample to bibliography list
  bibliographyList.push(getFormData());
  renderBibliographyList();
  updateCitations();
});