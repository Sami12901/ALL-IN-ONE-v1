// Student GPA Tracker & Planner Logic

const GRADE_SCALES = {
  'standard-4': {
    max: 4.0,
    grades: {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0
    }
  },
  'plus-433': {
    max: 4.33,
    grades: {
      'A+': 4.33, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0
    }
  },
  'weighted-5': {
    max: 5.0,
    grades: {
      'A+': 5.0, 'A': 4.7, 'A-': 4.3,
      'B+': 4.0, 'B': 3.7, 'B-': 3.3,
      'C+': 3.0, 'C': 2.7, 'C-': 2.3,
      'D+': 2.0, 'D': 1.5, 'F': 0.0
    }
  }
};

const STORAGE_KEY = 'student_gpa_tracker_data_v1';

const SAMPLE_DATA = {
  scale: 'standard-4',
  semesters: [
    {
      id: 'sem-1',
      name: 'Fall 2024',
      courses: [
        { id: 'c-101', name: 'CS 101: Introduction to Programming', credits: 4, grade: 'A' },
        { id: 'c-102', name: 'MATH 151: Calculus I', credits: 4, grade: 'A-' },
        { id: 'c-103', name: 'PHYS 201: University Physics I', credits: 4, grade: 'B+' },
        { id: 'c-104', name: 'ENGL 101: Academic Exposition', credits: 3, grade: 'A' }
      ]
    },
    {
      id: 'sem-2',
      name: 'Spring 2025',
      courses: [
        { id: 'c-201', name: 'CS 201: Data Structures & Algorithms', credits: 4, grade: 'A' },
        { id: 'c-202', name: 'MATH 152: Calculus II', credits: 4, grade: 'A' },
        { id: 'c-203', name: 'ENG 115: Digital Logic Design', credits: 3, grade: 'B+' },
        { id: 'c-204', name: 'HIST 110: Modern World History', credits: 3, grade: 'A-' }
      ]
    }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const scaleSelector = document.getElementById('scale-selector');
  const addSemesterBtn = document.getElementById('add-semester-btn');
  const loadSampleBtn = document.getElementById('load-sample-btn');
  const printReportBtn = document.getElementById('print-report-btn');
  const clearAllBtn = document.getElementById('clear-all-btn');
  const semesterContainer = document.getElementById('semester-container');

  const cgpaValEl = document.getElementById('cgpa-val');
  const standingBadge = document.getElementById('standing-badge');
  const standingText = document.getElementById('standing-text');
  const totalCreditsVal = document.getElementById('total-credits-val');
  const totalPointsVal = document.getElementById('total-points-val');
  const totalTermsVal = document.getElementById('total-terms-val');

  const targetDesiredGpa = document.getElementById('target-desired-gpa');
  const targetFutureCredits = document.getElementById('target-future-credits');
  const targetResultBox = document.getElementById('target-result-box');

  // App State
  let state = loadFromStorage() || JSON.parse(JSON.stringify(SAMPLE_DATA));

  // Sync scale dropdown
  scaleSelector.value = state.scale || 'standard-4';

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable or quota exceeded
    }
  }

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      return null;
    }
    return null;
  }

  function getGradePoints(gradeLetter) {
    const scaleConfig = GRADE_SCALES[state.scale] || GRADE_SCALES['standard-4'];
    return scaleConfig.grades[gradeLetter] !== undefined ? scaleConfig.grades[gradeLetter] : 0.0;
  }

  function renderAll() {
    renderSemesters();
    updateCalculations();
  }

  function renderSemesters() {
    semesterContainer.innerHTML = '';

    if (state.semesters.length === 0) {
      semesterContainer.innerHTML = `
        <div class="tool-panel glass-panel" style="text-align: center; padding: 3rem 1.5rem; color: var(--text-tertiary);">
          <p style="margin-bottom: 1rem; font-size: 1.1rem;">No semesters added yet.</p>
          <button type="button" class="btn btn-primary" id="empty-add-sem-btn">+ Add Your First Semester</button>
        </div>
      `;
      document.getElementById('empty-add-sem-btn')?.addEventListener('click', addNewSemester);
      return;
    }

    state.semesters.forEach((sem, semIdx) => {
      const card = document.createElement('div');
      card.className = 'semester-card';
      card.dataset.semId = sem.id;

      // Calculate semester totals
      let semCredits = 0;
      let semPoints = 0;
      sem.courses.forEach(c => {
        const cr = parseFloat(c.credits) || 0;
        const gp = getGradePoints(c.grade);
        semCredits += cr;
        semPoints += cr * gp;
      });
      const semGpa = semCredits > 0 ? (semPoints / semCredits).toFixed(2) : '0.00';

      card.innerHTML = `
        <div class="semester-card-header">
          <input type="text" class="semester-title-input" value="${escapeHtml(sem.name)}" placeholder="Semester Title (e.g. Fall 2025)" data-sem-id="${sem.id}">
          <div class="semester-meta">
            <span>Credits: <strong>${semCredits.toFixed(1)}</strong></span>
            <span>Semester GPA: <strong style="color: var(--accent); font-size: 1.1rem;">${semGpa}</strong></span>
            <button type="button" class="course-del-btn del-sem-btn" title="Delete Semester" data-sem-id="${sem.id}">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>

        <div class="courses-table-wrap">
          <table class="courses-table">
            <thead>
              <tr>
                <th style="min-width: 220px;">Course Name / Code</th>
                <th style="width: 100px; text-align: center;">Credits</th>
                <th style="width: 120px; text-align: center;">Grade</th>
                <th style="width: 100px; text-align: center;">Points</th>
                <th style="width: 50px;"></th>
              </tr>
            </thead>
            <tbody id="course-rows-${sem.id}">
              ${sem.courses
                .map(course => {
                  const cr = parseFloat(course.credits) || 0;
                  const gp = getGradePoints(course.grade);
                  const qp = (cr * gp).toFixed(2);
                  return `
                  <tr data-course-id="${course.id}" data-sem-id="${sem.id}">
                    <td>
                      <input type="text" class="course-name-input" value="${escapeHtml(course.name)}" placeholder="e.g. CS 101" data-field="name">
                    </td>
                    <td style="text-align: center;">
                      <input type="number" class="course-credit-input" value="${course.credits}" min="0.5" max="20" step="0.5" data-field="credits">
                    </td>
                    <td style="text-align: center;">
                      <select class="course-grade-select" data-field="grade">
                        ${renderGradeOptions(course.grade)}
                      </select>
                    </td>
                    <td style="text-align: center;">
                      <span class="course-points-val">${qp}</span>
                    </td>
                    <td style="text-align: center;">
                      <button type="button" class="course-del-btn del-course-btn" title="Remove Course">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </td>
                  </tr>
                `;
                })
                .join('')}
            </tbody>
          </table>
        </div>

        <div class="semester-footer">
          <button type="button" class="btn btn-secondary add-course-btn" data-sem-id="${sem.id}" style="padding: 0.35rem 0.8rem; font-size: 0.825rem;">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Course
          </button>
        </div>
      `;

      semesterContainer.appendChild(card);
    });

    bindSemesterEvents();
  }

  function renderGradeOptions(selectedGrade) {
    const scaleConfig = GRADE_SCALES[state.scale] || GRADE_SCALES['standard-4'];
    const gradeKeys = Object.keys(scaleConfig.grades);
    return gradeKeys
      .map(
        g => `
      <option value="${g}" ${g === selectedGrade ? 'selected' : ''}>
        ${g} (${scaleConfig.grades[g].toFixed(1)})
      </option>
    `
      )
      .join('');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function bindSemesterEvents() {
    // Semester Title editing
    document.querySelectorAll('.semester-title-input').forEach(input => {
      input.addEventListener('change', e => {
        const semId = e.target.dataset.semId;
        const sem = state.semesters.find(s => s.id === semId);
        if (sem) {
          sem.name = e.target.value.trim() || 'Untitled Semester';
          saveToStorage();
        }
      });
    });

    // Delete Semester
    document.querySelectorAll('.del-sem-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const semId = btn.dataset.semId;
        if (confirm('Delete this semester and all its courses?')) {
          state.semesters = state.semesters.filter(s => s.id !== semId);
          saveToStorage();
          renderAll();
        }
      });
    });

    // Add Course
    document.querySelectorAll('.add-course-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const semId = btn.dataset.semId;
        const sem = state.semesters.find(s => s.id === semId);
        if (sem) {
          sem.courses.push({
            id: 'c-' + Date.now() + Math.random().toString(36).substr(2, 4),
            name: 'New Course',
            credits: 3,
            grade: 'A'
          });
          saveToStorage();
          renderAll();
        }
      });
    });

    // Course field edits
    document.querySelectorAll('.courses-table tbody tr').forEach(row => {
      const courseId = row.dataset.courseId;
      const semId = row.dataset.semId;
      const sem = state.semesters.find(s => s.id === semId);
      const course = sem?.courses.find(c => c.id === courseId);

      if (!course) return;

      const nameInput = row.querySelector('[data-field="name"]');
      const creditInput = row.querySelector('[data-field="credits"]');
      const gradeSelect = row.querySelector('[data-field="grade"]');
      const delBtn = row.querySelector('.del-course-btn');

      nameInput.addEventListener('input', e => {
        course.name = e.target.value;
        saveToStorage();
      });

      creditInput.addEventListener('input', e => {
        course.credits = parseFloat(e.target.value) || 0;
        saveToStorage();
        updateCalculations();
        updateRowPoints(row, course);
      });

      gradeSelect.addEventListener('change', e => {
        course.grade = e.target.value;
        saveToStorage();
        updateCalculations();
        updateRowPoints(row, course);
      });

      delBtn.addEventListener('click', () => {
        sem.courses = sem.courses.filter(c => c.id !== courseId);
        saveToStorage();
        renderAll();
      });
    });
  }

  function updateRowPoints(row, course) {
    const cr = parseFloat(course.credits) || 0;
    const gp = getGradePoints(course.grade);
    const qpEl = row.querySelector('.course-points-val');
    if (qpEl) qpEl.textContent = (cr * gp).toFixed(2);
  }

  function addNewSemester() {
    const num = state.semesters.length + 1;
    state.semesters.push({
      id: 'sem-' + Date.now(),
      name: `Semester ${num}`,
      courses: [
        { id: 'c-' + Date.now() + '1', name: 'Course 1', credits: 3, grade: 'A' },
        { id: 'c-' + Date.now() + '2', name: 'Course 2', credits: 3, grade: 'A' }
      ]
    });
    saveToStorage();
    renderAll();
  }

  function updateCalculations() {
    let totalCredits = 0;
    let totalPoints = 0;

    state.semesters.forEach(sem => {
      let semCredits = 0;
      let semPoints = 0;
      sem.courses.forEach(c => {
        const cr = parseFloat(c.credits) || 0;
        const gp = getGradePoints(c.grade);
        semCredits += cr;
        semPoints += cr * gp;
      });
      totalCredits += semCredits;
      totalPoints += semPoints;

      // Update semester card header if it exists in DOM
      const semCard = document.querySelector(`.semester-card[data-sem-id="${sem.id}"]`);
      if (semCard) {
        const metaEl = semCard.querySelector('.semester-meta');
        if (metaEl) {
          const semGpa = semCredits > 0 ? (semPoints / semCredits).toFixed(2) : '0.00';
          metaEl.innerHTML = `
            <span>Credits: <strong>${semCredits.toFixed(1)}</strong></span>
            <span>Semester GPA: <strong style="color: var(--accent); font-size: 1.1rem;">${semGpa}</strong></span>
            <button type="button" class="course-del-btn del-sem-btn" title="Delete Semester" data-sem-id="${sem.id}">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          `;
          // Re-bind delete on this button
          metaEl.querySelector('.del-sem-btn').addEventListener('click', () => {
            if (confirm('Delete this semester and all its courses?')) {
              state.semesters = state.semesters.filter(s => s.id !== sem.id);
              saveToStorage();
              renderAll();
            }
          });
        }
      }
    });

    const cgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    cgpaValEl.textContent = cgpa.toFixed(2);
    totalCreditsVal.textContent = totalCredits.toFixed(1);
    totalPointsVal.textContent = totalPoints.toFixed(2);
    totalTermsVal.textContent = state.semesters.length.toString();

    // Determine Honors / Standing Badge
    updateStandingBadge(cgpa, totalCredits);

    // Update Target Planner
    updateTargetPlanner(cgpa, totalCredits, totalPoints);
  }

  function updateStandingBadge(cgpa, totalCredits) {
    standingBadge.className = 'standing-badge';

    if (totalCredits === 0) {
      standingBadge.classList.add('good');
      standingText.textContent = 'No Data';
      return;
    }

    if (cgpa >= 3.9) {
      standingBadge.classList.add('summa');
      standingText.textContent = 'Summa Cum Laude (Top Honors)';
    } else if (cgpa >= 3.7) {
      standingBadge.classList.add('dean');
      standingText.textContent = 'Magna Cum Laude (High Honors)';
    } else if (cgpa >= 3.5) {
      standingBadge.classList.add('dean');
      standingText.textContent = "Dean's List / Cum Laude";
    } else if (cgpa >= 2.0) {
      standingBadge.classList.add('good');
      standingText.textContent = 'Good Academic Standing';
    } else {
      standingBadge.classList.add('warning');
      standingText.textContent = 'Academic Warning / Probation';
    }
  }

  function updateTargetPlanner(currentCgpa, currentCredits, currentPoints) {
    const desired = parseFloat(targetDesiredGpa.value);
    const futureCredits = parseFloat(targetFutureCredits.value);

    if (isNaN(desired) || isNaN(futureCredits) || futureCredits <= 0) {
      targetResultBox.innerHTML = '<span style="color:var(--text-tertiary);">Enter desired target GPA and future credit hours above to plan your goal.</span>';
      return;
    }

    const scaleMax = GRADE_SCALES[state.scale]?.max || 4.0;
    const totalTargetCredits = currentCredits + futureCredits;
    const requiredTotalPoints = desired * totalTargetCredits;
    const neededPoints = requiredTotalPoints - currentPoints;
    const neededGpa = neededPoints / futureCredits;

    if (neededGpa > scaleMax) {
      targetResultBox.innerHTML = `
        <span style="color: #ef4444; font-weight: 700;">Mathematically Unreachable:</span>
        To reach a cumulative GPA of <strong>${desired.toFixed(2)}</strong>, you would need an average GPA of <strong>${neededGpa.toFixed(2)}</strong> over the next ${futureCredits} credits (maximum possible on your current scale is ${scaleMax.toFixed(2)}).
      `;
    } else if (neededGpa <= 0) {
      targetResultBox.innerHTML = `
        <span style="color: #10b981; font-weight: 700;">Goal Already Secured!</span>
        Your current cumulative GPA (${currentCgpa.toFixed(2)}) is already so strong that you need a minimum GPA of <strong>0.00</strong> to maintain your goal of ${desired.toFixed(2)}.
      `;
    } else {
      const isDean = neededGpa >= 3.5;
      targetResultBox.innerHTML = `
        Target Goal: <strong>${desired.toFixed(2)} CGPA</strong><br>
        You must maintain an average GPA of <strong style="color: ${isDean ? 'var(--accent)' : '#10b981'}; font-size: 1.15rem;">${neededGpa.toFixed(2)}</strong> across your upcoming ${futureCredits} credits to achieve your target graduation GPA.
      `;
    }
  }

  // Scale Change
  scaleSelector.addEventListener('change', () => {
    state.scale = scaleSelector.value;
    saveToStorage();
    renderAll();
  });

  // Target Planner inputs
  targetDesiredGpa.addEventListener('input', () => {
    const cr = parseFloat(totalCreditsVal.textContent) || 0;
    const pt = parseFloat(totalPointsVal.textContent) || 0;
    const cgpa = cr > 0 ? pt / cr : 0;
    updateTargetPlanner(cgpa, cr, pt);
  });

  targetFutureCredits.addEventListener('input', () => {
    const cr = parseFloat(totalCreditsVal.textContent) || 0;
    const pt = parseFloat(totalPointsVal.textContent) || 0;
    const cgpa = cr > 0 ? pt / cr : 0;
    updateTargetPlanner(cgpa, cr, pt);
  });

  // Header Actions
  addSemesterBtn.addEventListener('click', addNewSemester);

  loadSampleBtn.addEventListener('click', () => {
    if (confirm('Load sample academic data? This will replace your current courses.')) {
      state = JSON.parse(JSON.stringify(SAMPLE_DATA));
      scaleSelector.value = state.scale;
      saveToStorage();
      renderAll();
    }
  });

  clearAllBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all semesters and courses? This cannot be undone.')) {
      state = { scale: 'standard-4', semesters: [] };
      scaleSelector.value = 'standard-4';
      saveToStorage();
      renderAll();
    }
  });

  printReportBtn.addEventListener('click', () => {
    window.print();
  });

  // Initial Render
  renderAll();
});