/**
 * GPA Calculator - Semester & Cumulative Grade Engine
 * Supports 4.0, 4.33, 5.0 Weighted, and Percentage Scales
 */

document.addEventListener('DOMContentLoaded', () => {
  // Scale definitions
  const SCALES = {
    '4.0': [
      { letter: 'A+', points: 4.0, label: 'A+ (4.0)' },
      { letter: 'A', points: 4.0, label: 'A (4.0)' },
      { letter: 'A-', points: 3.7, label: 'A- (3.7)' },
      { letter: 'B+', points: 3.3, label: 'B+ (3.3)' },
      { letter: 'B', points: 3.0, label: 'B (3.0)' },
      { letter: 'B-', points: 2.7, label: 'B- (2.7)' },
      { letter: 'C+', points: 2.3, label: 'C+ (2.3)' },
      { letter: 'C', points: 2.0, label: 'C (2.0)' },
      { letter: 'C-', points: 1.7, label: 'C- (1.7)' },
      { letter: 'D+', points: 1.3, label: 'D+ (1.3)' },
      { letter: 'D', points: 1.0, label: 'D (1.0)' },
      { letter: 'F', points: 0.0, label: 'F (0.0)' }
    ],
    '4.33': [
      { letter: 'A+', points: 4.33, label: 'A+ (4.33)' },
      { letter: 'A', points: 4.0, label: 'A (4.0)' },
      { letter: 'A-', points: 3.67, label: 'A- (3.67)' },
      { letter: 'B+', points: 3.33, label: 'B+ (3.33)' },
      { letter: 'B', points: 3.0, label: 'B (3.0)' },
      { letter: 'B-', points: 2.67, label: 'B- (2.67)' },
      { letter: 'C+', points: 2.33, label: 'C+ (2.33)' },
      { letter: 'C', points: 2.0, label: 'C (2.0)' },
      { letter: 'C-', points: 1.67, label: 'C- (1.67)' },
      { letter: 'D+', points: 1.33, label: 'D+ (1.33)' },
      { letter: 'D', points: 1.0, label: 'D (1.0)' },
      { letter: 'F', points: 0.0, label: 'F (0.0)' }
    ],
    '5.0': [
      { letter: 'A+', points: 5.0, label: 'A+ (5.0)' },
      { letter: 'A', points: 5.0, label: 'A (5.0)' },
      { letter: 'A-', points: 4.7, label: 'A- (4.7)' },
      { letter: 'B+', points: 4.3, label: 'B+ (4.3)' },
      { letter: 'B', points: 4.0, label: 'B (4.0)' },
      { letter: 'B-', points: 3.7, label: 'B- (3.7)' },
      { letter: 'C+', points: 3.3, label: 'C+ (3.3)' },
      { letter: 'C', points: 3.0, label: 'C (3.0)' },
      { letter: 'C-', points: 2.7, label: 'C- (2.7)' },
      { letter: 'D+', points: 2.3, label: 'D+ (2.3)' },
      { letter: 'D', points: 2.0, label: 'D (2.0)' },
      { letter: 'F', points: 0.0, label: 'F (0.0)' }
    ],
    'percentage': [
      { letter: '97-100%', points: 4.0, label: '97-100% (A+ / 4.0)' },
      { letter: '93-96%', points: 4.0, label: '93-96% (A / 4.0)' },
      { letter: '90-92%', points: 3.7, label: '90-92% (A- / 3.7)' },
      { letter: '87-89%', points: 3.3, label: '87-89% (B+ / 3.3)' },
      { letter: '83-86%', points: 3.0, label: '83-86% (B / 3.0)' },
      { letter: '80-82%', points: 2.7, label: '80-82% (B- / 2.7)' },
      { letter: '77-79%', points: 2.3, label: '77-79% (C+ / 2.3)' },
      { letter: '73-76%', points: 2.0, label: '73-76% (C / 2.0)' },
      { letter: '70-72%', points: 1.7, label: '70-72% (C- / 1.7)' },
      { letter: '67-69%', points: 1.3, label: '67-69% (D+ / 1.3)' },
      { letter: '65-66%', points: 1.0, label: '65-66% (D / 1.0)' },
      { letter: 'Below 65%', points: 0.0, label: 'Below 65% (F / 0.0)' }
    ]
  };

  // State
  let currentScale = '4.0';
  let courses = [];
  let rowIdCounter = 1;

  // DOM Elements
  const scaleSelect = document.getElementById('gpa-scale-select');
  const courseContainer = document.getElementById('course-rows-container');
  const btnAddCourse = document.getElementById('btn-add-course');
  const btnClearCourses = document.getElementById('btn-clear-courses');
  const btnLoadSample = document.getElementById('btn-load-sample');
  const btnExportCsv = document.getElementById('btn-export-csv');
  const btnPrintReport = document.getElementById('btn-print-report');
  const btnReset = document.getElementById('btn-reset-gpa');

  // Stats displays
  const dispSemGpa = document.getElementById('disp-sem-gpa');
  const dispSemPts = document.getElementById('disp-sem-pts');
  const dispCumulGpa = document.getElementById('disp-cumul-gpa');
  const dispCumulSub = document.getElementById('disp-cumul-sub');
  const dispTotalCredits = document.getElementById('disp-total-credits');
  const dispCoursesCount = document.getElementById('disp-courses-count');
  const honorBadgeSlot = document.getElementById('honor-badge-slot');
  const dispStandingSub = document.getElementById('disp-standing-sub');

  // Cumulative Prior inputs
  const priorGpaInput = document.getElementById('prior-gpa');
  const priorCreditsInput = document.getElementById('prior-credits');
  const priorQualityPtsDisplay = document.getElementById('prior-quality-pts');
  const autosaveIndicator = document.getElementById('autosave-indicator');

  const STORAGE_KEY = 'all_in_one_gpa_state';

  // --- Helpers ---
  function getScaleList() {
    return SCALES[currentScale] || SCALES['4.0'];
  }

  function getGradePoint(gradeLetter) {
    const list = getScaleList();
    const found = list.find(g => g.letter === gradeLetter);
    return found ? found.points : (list[0] ? list[0].points : 4.0);
  }

  // Build grade select dropdown options HTML
  function buildGradeOptionsHtml(selectedGrade) {
    const list = getScaleList();
    return list.map(item => `
      <option value="${item.letter}" ${item.letter === selectedGrade ? 'selected' : ''}>
        ${item.label}
      </option>
    `).join('');
  }

  // Create course row DOM
  function createCourseRow(course) {
    const tr = document.createElement('tr');
    tr.className = 'course-row';
    tr.dataset.id = course.id;

    const points = getGradePoint(course.grade);
    const qualityPts = ((course.credits || 0) * points).toFixed(2);

    tr.innerHTML = `
      <td>
        <input type="text" class="form-input course-name-input" value="${course.name || ''}" placeholder="e.g. Calculus I, ENG 101" style="padding: 0.5rem 0.75rem;">
      </td>
      <td>
        <input type="number" class="form-input course-credits-input" value="${course.credits !== undefined ? course.credits : 3}" min="0" max="20" step="0.5" style="padding: 0.5rem 0.75rem;">
      </td>
      <td>
        <select class="form-select course-grade-select" style="padding: 0.5rem 0.75rem;">
          ${buildGradeOptionsHtml(course.grade)}
        </select>
      </td>
      <td>
        <span class="course-points-text" style="font-family: monospace; font-weight: 600; color: var(--text-primary);">${qualityPts}</span>
      </td>
      <td style="text-align: center;">
        <button class="btn-icon-del" title="Remove Course" aria-label="Remove Course">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </td>
    `;

    // Event listeners on row inputs
    const nameInput = tr.querySelector('.course-name-input');
    const creditsInput = tr.querySelector('.course-credits-input');
    const gradeSelect = tr.querySelector('.course-grade-select');
    const btnDel = tr.querySelector('.btn-icon-del');

    nameInput.addEventListener('input', () => {
      course.name = nameInput.value;
      saveState();
    });

    creditsInput.addEventListener('input', () => {
      course.credits = parseFloat(creditsInput.value) || 0;
      updateRowQualityPoints(tr, course);
      calculateAll();
      saveState();
    });

    gradeSelect.addEventListener('change', () => {
      course.grade = gradeSelect.value;
      updateRowQualityPoints(tr, course);
      calculateAll();
      saveState();
    });

    btnDel.addEventListener('click', () => {
      courses = courses.filter(c => c.id !== course.id);
      tr.remove();
      calculateAll();
      saveState();
    });

    return tr;
  }

  function updateRowQualityPoints(rowEl, course) {
    const pts = getGradePoint(course.grade);
    const qPts = ((course.credits || 0) * pts).toFixed(2);
    const ptText = rowEl.querySelector('.course-points-text');
    if (ptText) ptText.textContent = qPts;
  }

  function addCourse(name = '', credits = 3, grade = 'A') {
    const newCourse = {
      id: rowIdCounter++,
      name: name,
      credits: credits,
      grade: grade
    };
    courses.push(newCourse);
    const rowEl = createCourseRow(newCourse);
    courseContainer.appendChild(rowEl);
    calculateAll();
    saveState();
  }

  function rebuildTableRows() {
    courseContainer.innerHTML = '';
    courses.forEach(c => {
      const rowEl = createCourseRow(c);
      courseContainer.appendChild(rowEl);
    });
  }

  // --- Calculations ---
  function calculateAll() {
    let semCredits = 0;
    let semQualityPts = 0;

    courses.forEach(c => {
      const cr = parseFloat(c.credits) || 0;
      const pts = getGradePoint(c.grade);
      semCredits += cr;
      semQualityPts += cr * pts;
    });

    const semGpa = semCredits > 0 ? (semQualityPts / semCredits) : 0;
    dispSemGpa.textContent = semGpa.toFixed(2);
    dispSemPts.textContent = `${semQualityPts.toFixed(1)} quality points / ${semCredits.toFixed(1)} credits`;

    // Cumulative GPA calculation
    const priorGpa = parseFloat(priorGpaInput.value) || 0;
    const priorCredits = parseFloat(priorCreditsInput.value) || 0;
    const priorQualityPts = priorGpa * priorCredits;
    priorQualityPtsDisplay.textContent = priorQualityPts.toFixed(2);

    const totalCredits = priorCredits + semCredits;
    const totalQualityPts = priorQualityPts + semQualityPts;
    let cumulGpa = totalCredits > 0 ? (totalQualityPts / totalCredits) : semGpa;

    if (priorCredits > 0) {
      dispCumulGpa.textContent = cumulGpa.toFixed(2);
      dispCumulSub.textContent = `${totalQualityPts.toFixed(1)} total pts / ${totalCredits.toFixed(1)} total cr`;
    } else {
      dispCumulGpa.textContent = semGpa.toFixed(2);
      dispCumulSub.textContent = 'Equal to semester GPA (no prior credits)';
    }

    dispTotalCredits.textContent = totalCredits.toFixed(1);
    dispCoursesCount.textContent = `${courses.length} enrolled course${courses.length === 1 ? '' : 's'}`;

    // Academic Honor Status
    updateHonors(priorCredits > 0 ? cumulGpa : semGpa, semCredits + priorCredits);
  }

  function updateHonors(effectiveGpa, totalCredits) {
    honorBadgeSlot.innerHTML = '';
    let badgeClass = 'honor-good';
    let title = 'Good Academic Standing';
    let subtitle = "Maintain &ge; 2.00 for satisfactory progress.";

    if (totalCredits === 0) {
      badgeClass = 'honor-good';
      title = 'Enrolled';
      subtitle = 'Add course grades to determine honors status.';
    } else if (effectiveGpa >= 3.90) {
      badgeClass = 'honor-summa';
      title = 'Summa Cum Laude / Dean\'s Honors';
      subtitle = 'Highest distinction honors (&ge; 3.90)';
    } else if (effectiveGpa >= 3.70) {
      badgeClass = 'honor-magna';
      title = 'Magna Cum Laude / Dean\'s List';
      subtitle = 'Great distinction honors (3.70 - 3.89)';
    } else if (effectiveGpa >= 3.50) {
      badgeClass = 'honor-cum';
      title = 'Cum Laude / Dean\'s List';
      subtitle = 'Dean\'s Honor Roll achieved (&ge; 3.50)';
    } else if (effectiveGpa >= 2.00) {
      badgeClass = 'honor-good';
      title = 'Good Standing';
      subtitle = 'Satisfactory academic progress (&ge; 2.00)';
    } else {
      badgeClass = 'honor-warning';
      title = 'Academic Probation Warning';
      subtitle = 'GPA is below 2.00 minimum threshold.';
    }

    const badge = document.createElement('span');
    badge.className = `honor-badge ${badgeClass}`;
    badge.textContent = title;
    honorBadgeSlot.appendChild(badge);
    dispStandingSub.innerHTML = subtitle;
  }

  // --- Local Storage Persistence ---
  function saveState() {
    const data = {
      scale: currentScale,
      courses: courses,
      priorGpa: priorGpaInput.value,
      priorCredits: priorCreditsInput.value
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      autosaveIndicator.textContent = 'Auto-saved to browser';
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.scale && SCALES[data.scale]) {
          currentScale = data.scale;
          scaleSelect.value = data.scale;
        }
        if (Array.isArray(data.courses) && data.courses.length > 0) {
          courses = data.courses;
          rowIdCounter = Math.max(...courses.map(c => c.id || 0), 0) + 1;
        }
        if (data.priorGpa !== undefined) priorGpaInput.value = data.priorGpa;
        if (data.priorCredits !== undefined) priorCreditsInput.value = data.priorCredits;
      }
    } catch (e) {
      console.warn('LocalStorage load failed:', e);
    }

    if (courses.length === 0) {
      // Default initial courses
      loadSampleCourses();
    } else {
      rebuildTableRows();
      calculateAll();
    }
  }

  function loadSampleCourses() {
    courses = [
      { id: 1, name: 'Calculus II', credits: 4, grade: 'A' },
      { id: 2, name: 'Physics Mechanics & Lab', credits: 4, grade: 'A-' },
      { id: 3, name: 'Data Structures & Algorithms', credits: 3, grade: 'A' },
      { id: 4, name: 'Technical Communications', credits: 3, grade: 'B+' },
      { id: 5, name: 'Linear Algebra', credits: 3, grade: 'A' }
    ];
    rowIdCounter = 6;
    priorGpaInput.value = '3.65';
    priorCreditsInput.value = '30';
    rebuildTableRows();
    calculateAll();
    saveState();
  }

  // --- Export CSV ---
  btnExportCsv.addEventListener('click', () => {
    if (courses.length === 0) {
      alert('No courses to export.');
      return;
    }
    let csv = 'Course Name,Credit Hours,Grade,Grade Points,Quality Points\n';
    courses.forEach(c => {
      const pts = getGradePoint(c.grade);
      const qPts = ((c.credits || 0) * pts).toFixed(2);
      const cleanName = `"${(c.name || 'Untitled').replace(/"/g, '""')}"`;
      csv += `${cleanName},${c.credits},${c.grade},${pts},${qPts}\n`;
    });
    csv += `\nSemester Summary,,,\n`;
    csv += `Semester Credits,${dispTotalCredits.textContent},,\n`;
    csv += `Semester GPA,${dispSemGpa.textContent},,\n`;
    csv += `Cumulative GPA,${dispCumulGpa.textContent},,\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GPA_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // --- Print Report ---
  btnPrintReport.addEventListener('click', () => {
    window.print();
  });

  // --- Scale Change ---
  scaleSelect.addEventListener('change', () => {
    currentScale = scaleSelect.value;
    // Map current course grades to the closest equivalent in new scale
    const newScaleList = getScaleList();
    const defaultGrade = newScaleList[0].letter;

    courses.forEach(c => {
      const match = newScaleList.find(g => g.letter === c.grade);
      if (!match) {
        c.grade = defaultGrade;
      }
    });

    rebuildTableRows();
    calculateAll();
    saveState();
  });

  // --- Reset All ---
  btnReset.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all courses and prior GPA inputs?')) {
      courses = [];
      priorGpaInput.value = '';
      priorCreditsInput.value = '';
      courseContainer.innerHTML = '';
      calculateAll();
      saveState();
    }
  });

  btnClearCourses.addEventListener('click', () => {
    courses = [];
    courseContainer.innerHTML = '';
    calculateAll();
    saveState();
  });

  btnLoadSample.addEventListener('click', () => {
    loadSampleCourses();
  });

  btnAddCourse.addEventListener('click', () => {
    const list = getScaleList();
    addCourse('', 3, list[0] ? list[0].letter : 'A');
  });

  priorGpaInput.addEventListener('input', () => {
    calculateAll();
    saveState();
  });

  priorCreditsInput.addEventListener('input', () => {
    calculateAll();
    saveState();
  });

  // Init
  loadState();
});