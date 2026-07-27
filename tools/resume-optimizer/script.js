// Resume Optimizer Engine
document.addEventListener('DOMContentLoaded', () => {

  const btnAnalyze = document.getElementById('analyze-btn');
  const btnSample = document.getElementById('load-sample-btn');
  
  const inputResume = document.getElementById('opt-resume-text');
  const inputJd = document.getElementById('opt-jd-text');
  
  const dashboard = document.getElementById('dashboard-panel');
  
  // UI Elements
  const scoreCircle = document.getElementById('score-circle-path');
  const scoreText = document.getElementById('score-text');
  const scoreTitle = document.getElementById('score-title');
  
  const issuesList = document.getElementById('issues-list');
  const passedList = document.getElementById('passed-list');
  const keywordsList = document.getElementById('keywords-list');
  
  const badgeIssues = document.getElementById('badge-issues');
  const badgePassed = document.getElementById('badge-passed');
  const badgeKeywords = document.getElementById('badge-keywords');
  const btnTabKeywords = document.getElementById('btn-tab-keywords');

  // --- Tabs Logic ---
  const tabs = document.querySelectorAll('.dash-tab');
  const panes = document.querySelectorAll('.dash-pane');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.target).classList.add('active');
    });
  });

  // --- Dictionaries ---
  const actionVerbs = ['achieved', 'improved', 'trained', 'managed', 'developed', 'led', 'created', 'designed', 'resolved', 'increased', 'decreased', 'negotiated', 'launched', 'optimized', 'spearheaded', 'implemented', 'directed', 'coordinated', 'engineered', 'formulated', 'orchestrated'];
  const cliches = ['hard worker', 'team player', 'synergy', 'think outside the box', 'go-getter', 'detail-oriented', 'results-driven', 'self-starter', 'dynamic', 'motivated', 'proactive'];
  const stopWords = new Set(["a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "if", "in", "into", "is", "it", "no", "not", "of", "on", "or", "such", "that", "the", "their", "then", "there", "these", "they", "this", "to", "was", "will", "with", "we", "you", "your"]);

  // --- Analysis Engine ---
  function analyze() {
    const resume = inputResume.value.trim();
    const jd = inputJd.value.trim();

    if (!resume) {
      alert("Please paste your resume text first.");
      return;
    }

    // Results Arrays
    let issues = [];
    let passed = [];
    let score = 100;

    const resumeLower = resume.toLowerCase();

    // 1. Word Count Check
    const wordCount = resume.split(/\s+/).length;
    if (wordCount < 150) {
      issues.push({ type: 'error', title: 'Too Short', desc: `Your resume is only ${wordCount} words. A standard resume should be 300-600 words to provide enough detail.`});
      score -= 15;
    } else if (wordCount > 800) {
      issues.push({ type: 'warning', title: 'Too Long', desc: `Your resume is ${wordCount} words. Consider trimming it down to below 800 words to keep recruiters engaged.`});
      score -= 5;
    } else {
      passed.push({ title: 'Optimal Length', desc: `Your resume length (${wordCount} words) is within the optimal range (150-800 words).`});
    }

    // 2. Metrics / Numbers Check
    // Matches digits followed by %, or $ followed by digits, or numbers like "10x", "500+"
    const metricsPattern = /\b\d+%|\$\d+|\b\d{1,3}(?:,\d{3})*(?:\.\d+)?\b/g;
    const metricsMatches = resume.match(metricsPattern) || [];
    if (metricsMatches.length < 3) {
      issues.push({ type: 'error', title: 'Missing Quantifiable Metrics', desc: 'Recruiters want to see impact. Add numbers, percentages, or dollar amounts to your achievements (e.g., "Increased sales by 20%").'});
      score -= 20;
    } else {
      passed.push({ title: 'Strong Use of Metrics', desc: `Found ${metricsMatches.length} instances of numbers/metrics. This proves your impact.`});
    }

    // 3. Action Verbs Check
    let foundVerbs = [];
    actionVerbs.forEach(verb => {
      const regex = new RegExp(`\\b${verb}\\b`, 'i');
      if (regex.test(resume)) foundVerbs.push(verb);
    });
    if (foundVerbs.length < 3) {
      issues.push({ type: 'warning', title: 'Weak Action Verbs', desc: 'Start your bullet points with strong action verbs (e.g., managed, developed, improved) instead of "responsible for".'});
      score -= 10;
    } else {
      passed.push({ title: 'Good Action Verbs', desc: `Found strong verbs like: ${foundVerbs.slice(0,3).join(', ')}.`});
    }

    // 4. Cliches Check
    let foundCliches = [];
    cliches.forEach(cliche => {
      if (resumeLower.includes(cliche)) foundCliches.push(cliche);
    });
    if (foundCliches.length > 0) {
      issues.push({ type: 'warning', title: 'Avoid Clichés', desc: `Found overused buzzwords: "${foundCliches.join(', ')}". Show, don't tell. Prove you are a "team player" by describing a collaborative project.`});
      score -= Math.min(foundCliches.length * 5, 15);
    } else {
      passed.push({ title: 'No Clichés Detected', desc: 'Your resume is free of overused buzzwords.'});
    }

    // 5. Contact Info Check (Basic)
    const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(resume);
    if (!hasEmail) {
      issues.push({ type: 'error', title: 'Missing Email', desc: 'Could not detect an email address. Make sure your contact info is clear.'});
      score -= 15;
    } else {
      passed.push({ title: 'Contact Info Found', desc: 'Email address detected.'});
    }

    // 6. Keyword Matching (If JD provided)
    let keywordsHtml = '';
    let keywordMatchCount = 0;
    let totalKeywordsExtracted = 0;
    
    if (jd) {
      // Extract words from JD, filter stop words and short words
      const jdWords = jd.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
      const wordFreq = {};
      jdWords.forEach(w => {
        if (!stopWords.has(w)) wordFreq[w] = (wordFreq[w] || 0) + 1;
      });

      // Sort by frequency, take top 15
      const topKeywords = Object.keys(wordFreq).sort((a,b) => wordFreq[b] - wordFreq[a]).slice(0, 15);
      totalKeywordsExtracted = topKeywords.length;

      if (totalKeywordsExtracted > 0) {
        topKeywords.forEach(kw => {
          if (resumeLower.includes(kw)) {
            keywordMatchCount++;
            keywordsHtml += `<span class="kw-tag kw-found">${kw} ✓</span>`;
          } else {
            keywordsHtml += `<span class="kw-tag kw-missing">${kw} ✗</span>`;
          }
        });

        const matchPercent = keywordMatchCount / totalKeywordsExtracted;
        if (matchPercent < 0.4) {
          issues.push({ type: 'error', title: 'Poor Keyword Match', desc: `You only matched ${keywordMatchCount}/${totalKeywordsExtracted} top keywords from the Job Description. Customize your resume to include missing terms.`});
          score -= 20;
        } else if (matchPercent < 0.7) {
          issues.push({ type: 'warning', title: 'Average Keyword Match', desc: `You matched ${keywordMatchCount}/${totalKeywordsExtracted} keywords. Add a few more missing terms to beat the ATS.`});
          score -= 5;
        } else {
          passed.push({ title: 'Excellent ATS Keyword Match', desc: `You matched ${keywordMatchCount}/${totalKeywordsExtracted} keywords from the Job Description.`});
          // Reward bonus points
          score = Math.min(100, score + 10);
        }
      }
    }

    // Final Score Check bounds
    score = Math.max(0, Math.min(100, score));

    // --- Render Dashboard ---
    
    // Update Score Circle
    scoreText.textContent = score;
    scoreCircle.setAttribute('stroke-dasharray', `${score}, 100`);
    
    // Update colors based on score
    let strokeColor = '#ef4444'; // red
    if (score >= 80) {
      strokeColor = '#10b981'; // green
      scoreTitle.textContent = 'Excellent!';
    } else if (score >= 60) {
      strokeColor = '#f59e0b'; // yellow
      scoreTitle.textContent = 'Good, but needs work';
    } else {
      scoreTitle.textContent = 'Needs Major Optimization';
    }
    scoreCircle.style.stroke = strokeColor;

    // Badges
    badgeIssues.textContent = issues.length;
    badgePassed.textContent = passed.length;
    
    // Render Issues
    if (issues.length === 0) {
      issuesList.innerHTML = `<p style="color:var(--text-secondary);">No issues found! Great job.</p>`;
    } else {
      issuesList.innerHTML = issues.map(i => `
        <div class="check-card ${i.type}">
          <div class="check-header">
            ${i.type === 'error' ? 
              '<svg class="icon-error" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>' : 
              '<svg class="icon-warning" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'}
            <span class="check-title">${i.title}</span>
          </div>
          <p class="check-desc">${i.desc}</p>
        </div>
      `).join('');
    }

    // Render Passed
    if (passed.length === 0) {
      passedList.innerHTML = `<p style="color:var(--text-secondary);">No checks passed.</p>`;
    } else {
      passedList.innerHTML = passed.map(p => `
        <div class="check-card success">
          <div class="check-header">
            <svg class="icon-success" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <span class="check-title">${p.title}</span>
          </div>
          <p class="check-desc">${p.desc}</p>
        </div>
      `).join('');
    }

    // Render Keywords
    if (jd && totalKeywordsExtracted > 0) {
      btnTabKeywords.style.display = 'inline-flex';
      badgeKeywords.textContent = totalKeywordsExtracted;
      keywordsList.innerHTML = keywordsHtml;
    } else {
      btnTabKeywords.style.display = 'none';
      if(jd) keywordsList.innerHTML = `<p style="color:var(--text-secondary);">Not enough keywords extracted from Job Description.</p>`;
    }

    // Show Dashboard
    dashboard.style.display = 'flex';
    
    // Switch to issues tab automatically
    tabs[0].click();
  }

  btnAnalyze.addEventListener('click', analyze);

  btnSample.addEventListener('click', () => {
    inputResume.value = `John Doe
johndoe@example.com

Summary:
Hard worker and team player looking for a dynamic role. I have synergy and am a go-getter.

Experience:
Responsible for managing the sales department. Did a lot of work on new projects.`;
    
    inputJd.value = `We are looking for a Senior Sales Executive. 
The ideal candidate will have experience in B2B sales, negotiating enterprise contracts, and increasing revenue.
Skills required: Sales strategy, CRM software, leadership, pipeline management, communication.`;
    
    dashboard.style.display = 'none';
  });

});