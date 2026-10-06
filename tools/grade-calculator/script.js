// Weighted Grade Calculator Logic

document.addEventListener('DOMContentLoaded', () => {
  const gradesContainer = document.getElementById('grades-container');
  const btnAddRow = document.getElementById('btn-add-row');
  const totalWeightText = document.getElementById('total-weight-text');
  const weightProgressFill = document.getElementById('weight-progress-fill');
  const weightWarning = document.getElementById('weight-warning');
  const currentGradeVal = document.getElementById('current-grade-val');
  const currentGpaVal = document.getElementById('current-gpa-val');
  const letterGradeBadge = document.getElementById('letter-grade-badge');
  const finalWeightInput = document.getElementById('final-weight-input');
  const customTargetInput = document.getElementById('custom-target-input');
  const customTargetResult = document.getElementById('custom-target-result');
  const btnReset = document.getElementById('btn-reset-grades');
  const btnCopy = document.getElementById('btn-copy-grades');

  const targetDisplays = {
    a: { chip: document.getElementById('chip-target-a'), val: document.getElementById('target-score-a'), target: 90 },
    b: { chip: document.getElementById('chip-target-b'), val: document.getElementById('target-score-b'), target: 80 },
    c: { chip: document.getElementById('chip-target-c'), val: document.getElementById('target-score-c'), target: 70 },
    d: { chip: document.getElementById('chip-target-d'), val: document.getElementById('target-score-d'), target: 60 }
  };

  const presets = {
    college: [
      { name: 'Homework & Assignments', weight: 20, score: 92 },
      { name: 'Midterm Exam', weight: 25, score: 84 },
      { name: 'Semester Project', weight: 25, score: 90 },
      { name: 'Final Exam', weight: 30, score: '' }
    ],
    highschool: [
      { name: 'Homework', weight: 20, score: 95 },
      { name: 'Quizzes', weight: 20, score: 88 },
      { name: 'Unit Tests', weight: 40, score: 81 },
      { name: 'Participation', weight: 10, score: 100 },
      { name: 'Final Exam', weight: 10, score: '' }
    ],
    stem: [
      { name: 'Lab Reports', weight: 30, score: 89 },
      { name: 'Problem Sets', weight: 20, score: 95 },
      { name: 'Midterm Exam', weight: 25, score: 78 },
      { name: 'Final Exam', weight: 25, score: '' }
    ]
  };

  // Grading scale lookup
  function getLetterGrade(pct) {
    if (isNaN(pct) || pct === null) return { letter: '-', gpa: '-' };
    if (pct >= 97) return { letter: 'A+', gpa: '4.0' };
    if (pct >= 93) return { letter: 'A', gpa: '4.0' };
    if (pct >= 90) return { letter: 'A-', gpa: '3.7' };
    if (pct >= 87) return { letter: 'B+', gpa: '3.3' };
    if (pct >= 83) return { letter: 'B', gpa: '3.0' };
    if (pct >= 80) return { letter: 'B-', gpa: '2.7' };
    if (pct >= 77) return { letter: 'C+', gpa: '2.3' };
    if (pct >= 73) return { letter: 'C', gpa: '2.0' };
    if (pct >= 70) return { letter: 'C-', gpa: '1.7' };
    if (pct >= 60) return { letter: 'D', gpa: '1.0' };
    return { letter: 'F', gpa: '0.0' };
  }

  // Create an assessment row element
  function createRow(name = '', weight = '', score = '') {
    const row = document.createElement('div');
    row.className = 'grade-row';
    row.innerHTML = `
      <div class="col-name">
        <input type="text" class="form-input item-name" placeholder="e.g. Midterm Exam" value="${name}">
      </div>
      <div>
        <input type="number" class="form-input item-weight" placeholder="Weight %" value="${weight}" min="0" max="100" step="any">
      </div>
      <div>
        <input type="number" class="form-input item-score" placeholder="Score %" value="${score}" min="0" max="200" step="any">
      </div>
      <div class="col-del">
        <button type="button" class="btn-icon-del" title="Remove Item">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `;

    // Row event listeners
    const inputs = row.querySelectorAll('input');
    inputs.forEach(inp => {
      inp.addEventListener('input', calculateGrades);
    });

    const delBtn = row.querySelector('.btn-icon-del');
    delBtn.addEventListener('click', () => {
      row.remove();
      calculateGrades();
    });

    return row;
  }

  function calculateGrades() {
    const rows = gradesContainer.querySelectorAll('.grade-row');
    let totalWeight = 0;
    let completedWeight = 0;
    let weightedPoints = 0;
    let finalExamRowWeight = null;

    rows.forEach(row => {
      const name = row.querySelector('.item-name').value.trim().toLowerCase();
      const weightRaw = row.querySelector('.item-weight').value;
      const scoreRaw = row.querySelector('.item-score').value;

      const weight = parseFloat(weightRaw);
      const score = parseFloat(scoreRaw);

      if (!isNaN(weight) && weight > 0) {
        totalWeight += weight;

        if (!isNaN(score)) {
          completedWeight += weight;
          weightedPoints += (weight * score);
        } else if (name.includes('final')) {
          finalExamRowWeight = weight;
        }
      }
    });

    // Sync final weight input if a Final row with empty score is present
    if (finalExamRowWeight !== null && document.activeElement !== finalWeightInput) {
      finalWeightInput.value = finalExamRowWeight;
    }

    // Update Weight Progress Bar
    totalWeightText.textContent = `${totalWeight.toFixed(1)}% / 100%`;
    const clampedProgress = Math.min(totalWeight, 100);
    weightProgressFill.style.width = `${clampedProgress}%`;

    if (totalWeight > 100) {
      weightProgressFill.classList.add('exceeded');
      weightWarning.style.display = 'block';
      weightWarning.textContent = `Warning: Total weight exceeds 100% (currently ${totalWeight.toFixed(1)}%). Check your category weights.`;
    } else if (totalWeight < 100 && totalWeight > 0) {
      weightProgressFill.classList.remove('exceeded');
      weightWarning.style.display = 'block';
      weightWarning.textContent = `Current weights sum to ${totalWeight.toFixed(1)}%. Remaining ${ (100 - totalWeight).toFixed(1) }% unallocated.`;
    } else {
      weightProgressFill.classList.remove('exceeded');
      weightWarning.style.display = 'none';
    }

    // Calculate current grade on completed work
    if (completedWeight > 0) {
      const currentGrade = weightedPoints / completedWeight;
      currentGradeVal.textContent = `${currentGrade.toFixed(2)}%`;

      const { letter, gpa } = getLetterGrade(currentGrade);
      letterGradeBadge.textContent = letter;
      currentGpaVal.textContent = `GPA Points: ${gpa} (4.0 Scale) • Based on ${completedWeight.toFixed(1)}% completed`;
    } else {
      currentGradeVal.textContent = '-';
      letterGradeBadge.textContent = '-';
      currentGpaVal.textContent = 'Enter scores to view standing';
    }

    // Solve for Final Exam Targets
    solveFinalTargets(completedWeight, weightedPoints);
  }

  function solveFinalTargets(completedWeight, weightedPoints) {
    const finalWeight = parseFloat(finalWeightInput.value);

    if (isNaN(finalWeight) || finalWeight <= 0) {
      Object.keys(targetDisplays).forEach(key => {
        targetDisplays[key].val.textContent = 'N/A';
        targetDisplays[key].chip.className = 'target-chip';
      });
      customTargetResult.textContent = 'Invalid Final Weight';
      return;
    }

    const totalCourseWeight = completedWeight + finalWeight;

    // Helper to solve for target score
    function solveForTarget(targetPct) {
      if (completedWeight === 0) {
        return targetPct;
      }
      // target = (weightedPoints + finalWeight * score) / totalCourseWeight
      return (targetPct * totalCourseWeight - weightedPoints) / finalWeight;
    }

    // Compute standard targets (A, B, C, D)
    Object.keys(targetDisplays).forEach(key => {
      const item = targetDisplays[key];
      const requiredScore = solveForTarget(item.target);

      item.chip.className = 'target-chip';
      if (requiredScore <= 0) {
        item.val.textContent = 'Secured (0%)';
        item.chip.classList.add('achieved');
      } else if (requiredScore > 100) {
        item.val.textContent = `${requiredScore.toFixed(1)}% (EC)`;
        item.chip.classList.add('unreachable');
      } else {
        item.val.textContent = `${requiredScore.toFixed(1)}%`;
      }
    });

    // Compute custom target
    const customTarget = parseFloat(customTargetInput.value);
    if (!isNaN(customTarget)) {
      const custRequired = solveForTarget(customTarget);
      if (custRequired <= 0) {
        customTargetResult.textContent = 'Already Secured! (0% needed)';
        customTargetResult.style.color = 'var(--success)';
      } else if (custRequired > 100) {
        customTargetResult.textContent = `${custRequired.toFixed(1)}% (Extra credit needed)`;
        customTargetResult.style.color = 'var(--error)';
      } else {
        customTargetResult.textContent = `${custRequired.toFixed(2)}% on final`;
        customTargetResult.style.color = 'var(--accent)';
      }
    } else {
      customTargetResult.textContent = '-';
    }
  }

  // Load preset rows
  function loadPreset(presetKey) {
    gradesContainer.innerHTML = '';
    const items = presets[presetKey] || presets.college;
    items.forEach(item => {
      gradesContainer.appendChild(createRow(item.name, item.weight, item.score));
    });
    calculateGrades();
  }

  // Presets listeners
  document.querySelectorAll('.grade-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-preset');
      loadPreset(key);
    });
  });

  // Add row button
  btnAddRow.addEventListener('click', () => {
    gradesContainer.appendChild(createRow('', '', ''));
    const rows = gradesContainer.querySelectorAll('.grade-row');
    const lastRow = rows[rows.length - 1];
    lastRow.querySelector('.item-name').focus();
    calculateGrades();
  });

  // Final weight and custom target inputs
  finalWeightInput.addEventListener('input', calculateGrades);
  customTargetInput.addEventListener('input', calculateGrades);

  // Reset button
  btnReset.addEventListener('click', () => {
    gradesContainer.innerHTML = '';
    gradesContainer.appendChild(createRow('Homework', 20, ''));
    gradesContainer.appendChild(createRow('Midterm', 30, ''));
    gradesContainer.appendChild(createRow('Final Exam', 50, ''));
    calculateGrades();
  });

  // Copy Summary Report
  btnCopy.addEventListener('click', () => {
    const rows = gradesContainer.querySelectorAll('.grade-row');
    if (rows.length === 0) return;

    const reportLines = [
      '========================================',
      '   ALL IN ONE - SEMESTER GRADE REPORT',
      '========================================'
    ];

    rows.forEach(r => {
      const name = r.querySelector('.item-name').value.trim() || 'Untitled Category';
      const weight = r.querySelector('.item-weight').value || '0';
      const score = r.querySelector('.item-score').value || 'Pending';
      reportLines.push(`• ${name.padEnd(24)} Weight: ${weight}% | Score: ${score}%`);
    });

    reportLines.push('----------------------------------------');
    reportLines.push(`Overall Current Grade:   ${currentGradeVal.textContent} (${letterGradeBadge.textContent})`);
    reportLines.push(`Total Weight Entered:    ${totalWeightText.textContent}`);
    reportLines.push('----------------------------------------');
    reportLines.push('FINAL EXAM TARGET REQUIREMENTS:');
    reportLines.push(`• Target A (90%):         ${targetDisplays.a.val.textContent}`);
    reportLines.push(`• Target B (80%):         ${targetDisplays.b.val.textContent}`);
    reportLines.push(`• Target C (70%):         ${targetDisplays.c.val.textContent}`);
    reportLines.push(`• Target D (60%):         ${targetDisplays.d.val.textContent}`);
    reportLines.push('========================================');

    navigator.clipboard.writeText(reportLines.join('\n')).then(() => {
      const orig = btnCopy.textContent;
      btnCopy.textContent = 'Copied!';
      setTimeout(() => {
        btnCopy.textContent = orig;
      }, 2000);
    });
  });

  // Initialize with college preset
  loadPreset('college');
});