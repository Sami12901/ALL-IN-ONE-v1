/**
 * GPA Cumulative Projector Engine
 * Solves for required future grades, feasibility analysis, and course roadmap
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Inputs
  const inpCurrGpa = document.getElementById('inp-curr-gpa');
  const inpEarnedCr = document.getElementById('inp-earned-cr');
  const inpTargetGpa = document.getElementById('inp-target-gpa');
  const inpRemainCr = document.getElementById('inp-remain-cr');
  const selMaxScale = document.getElementById('sel-max-scale');
  const inpSemCount = document.getElementById('inp-sem-count');

  const btnRecalc = document.getElementById('btn-recalculate');
  const btnReset = document.getElementById('btn-reset-projector');

  // Hero displays
  const dispReqGpa = document.getElementById('disp-req-gpa');
  const dispFeasBadgeSlot = document.getElementById('disp-feas-badge-slot');
  const dispMaxPossible = document.getElementById('disp-max-possible');
  const dispMaxSub = document.getElementById('disp-max-sub');
  const meterPointer = document.getElementById('meter-pointer');

  // Strategy & Recommendation displays
  const recHeadline = document.getElementById('rec-headline');
  const recBody = document.getElementById('rec-body');
  const recCoursePills = document.getElementById('rec-course-pills');
  const roadmapRows = document.getElementById('roadmap-rows');
  const whatifRows = document.getElementById('whatif-rows');

  // Presets
  const presetFreshman = document.getElementById('preset-freshman');
  const presetJunior = document.getElementById('preset-junior');
  const presetSenior = document.getElementById('preset-senior');

  // --- Calculation Logic ---
  function calculateProjection() {
    const currGpa = parseFloat(inpCurrGpa.value) || 0;
    const earnedCr = parseFloat(inpEarnedCr.value) || 0;
    const targetGpa = parseFloat(inpTargetGpa.value) || 0;
    const remainCr = parseFloat(inpRemainCr.value) || 0;
    const maxScale = parseFloat(selMaxScale.value) || 4.0;
    const semCount = Math.min(10, Math.max(1, parseInt(inpSemCount.value, 10) || 4));

    if (earnedCr <= 0 || remainCr <= 0) {
      dispReqGpa.textContent = '-';
      return;
    }

    const totalCr = earnedCr + remainCr;
    const currentQualityPts = currGpa * earnedCr;
    const targetQualityPts = targetGpa * totalCr;
    const neededFuturePts = targetQualityPts - currentQualityPts;
    const reqFutureGpa = neededFuturePts / remainCr;

    // Max possible GPA with straight maxScale
    const maxPossiblePts = currentQualityPts + (maxScale * remainCr);
    const maxPossibleGpa = maxPossiblePts / totalCr;

    // Update Hero UI
    dispReqGpa.textContent = reqFutureGpa <= 0 ? '0.00' : reqFutureGpa.toFixed(2);
    dispMaxPossible.textContent = maxPossibleGpa.toFixed(2);
    dispMaxSub.textContent = `If you achieve straight ${maxScale.toFixed(2)}s in all ${remainCr} remaining credits.`;

    // Meter Position (0.0 -> 0%, 4.0 -> 80%, 5.0 -> 100%)
    let meterPercent = (reqFutureGpa / (maxScale * 1.25)) * 100;
    if (meterPercent < 0) meterPercent = 0;
    if (meterPercent > 98) meterPercent = 98;
    meterPointer.style.left = `${meterPercent}%`;

    // Feasibility Assessment
    updateFeasibility(reqFutureGpa, maxScale, targetGpa, maxPossibleGpa);

    // Course Recommendations
    updateCourseRecommendations(reqFutureGpa, remainCr, maxScale);

    // Semester Roadmap
    updateRoadmap(currGpa, earnedCr, reqFutureGpa, remainCr, semCount, maxScale);

    // What-If Scenarios
    updateWhatIfMatrix(currGpa, earnedCr, remainCr, totalCr, targetGpa, maxScale);
  }

  function updateFeasibility(reqGpa, maxScale, targetGpa, maxPossibleGpa) {
    dispFeasBadgeSlot.innerHTML = '';
    let badgeClass = 'feas-easy';
    let text = 'Easily Achievable';

    if (reqGpa <= 0) {
      badgeClass = 'feas-easy';
      text = 'Target Already Guaranteed';
    } else if (reqGpa <= 2.80) {
      badgeClass = 'feas-easy';
      text = 'Achievable (C+ to B- Average Needed)';
    } else if (reqGpa <= 3.40) {
      badgeClass = 'feas-moderate';
      text = 'Moderately Achievable (B to B+ Average)';
    } else if (reqGpa <= 3.85) {
      badgeClass = 'feas-demanding';
      text = 'Challenging (Mostly A\'s Required)';
    } else if (reqGpa <= maxScale) {
      badgeClass = 'feas-demanding';
      text = `Extremely Demanding (Near Perfect ${maxScale.toFixed(1)} GPA)`;
    } else {
      badgeClass = 'feas-impossible';
      text = `Mathematically Impossible (Requires > ${maxScale.toFixed(2)})`;
    }

    const badge = document.createElement('span');
    badge.className = `badge-feasibility ${badgeClass}`;
    badge.textContent = text;
    dispFeasBadgeSlot.appendChild(badge);
  }

  function updateCourseRecommendations(reqGpa, remainCr, maxScale) {
    recCoursePills.innerHTML = '';

    if (reqGpa > maxScale) {
      recHeadline.textContent = 'Target Outside Mathematical Reach';
      recHeadline.style.color = 'var(--error)';
      recBody.innerHTML = `Even if you achieve a flawless <strong>${maxScale.toFixed(2)}</strong> across all remaining credits, your maximum achievable cumulative GPA is capped at <strong>${dispMaxPossible.textContent}</strong>. Consider lowering your target GPA to <strong>${dispMaxPossible.textContent}</strong> or increasing credit volume (e.g. extra courses / retakes).`;
      return;
    }

    recHeadline.style.color = 'var(--text-primary)';
    if (reqGpa <= 0) {
      recHeadline.textContent = 'Target Already Reached';
      recBody.textContent = 'Your current academic credits already secure this cumulative GPA target upon graduation, even with basic passing grades.';
      return;
    }

    recHeadline.textContent = `Grade Distribution for ${remainCr} Remaining Credits`;

    const approxCourses = Math.max(1, Math.round(remainCr / 3));
    recBody.innerHTML = `Assuming typical 3-credit college courses (approx. <strong>${approxCourses} courses</strong>), here is the optimal letter grade mix to hit an average of <strong>${reqGpa.toFixed(2)}</strong>:`;

    if (reqGpa >= 3.0) {
      // Split between A (4.0) and B (3.0)
      let countA = Math.ceil((reqGpa - 3.0) * approxCourses);
      countA = Math.max(0, Math.min(approxCourses, countA));
      const countB = approxCourses - countA;

      const pillA = document.createElement('span');
      pillA.className = 'preset-chip';
      pillA.style.borderColor = 'var(--accent)';
      pillA.style.color = 'var(--accent)';
      pillA.innerHTML = `<strong>${countA} &times; A</strong> (4.00)`;

      const pillB = document.createElement('span');
      pillB.className = 'preset-chip';
      pillB.innerHTML = `<strong>${countB} &times; B</strong> (3.00)`;

      recCoursePills.appendChild(pillA);
      recCoursePills.appendChild(pillB);

    } else if (reqGpa >= 2.0) {
      // Split between B (3.0) and C (2.0)
      let countB = Math.ceil((reqGpa - 2.0) * approxCourses);
      countB = Math.max(0, Math.min(approxCourses, countB));
      const countC = approxCourses - countB;

      const pillB = document.createElement('span');
      pillB.className = 'preset-chip';
      pillB.innerHTML = `<strong>${countB} &times; B</strong> (3.00)`;

      const pillC = document.createElement('span');
      pillC.className = 'preset-chip';
      pillC.innerHTML = `<strong>${countC} &times; C</strong> (2.00)`;

      recCoursePills.appendChild(pillB);
      recCoursePills.appendChild(pillC);
    } else {
      const pillD = document.createElement('span');
      pillD.className = 'preset-chip';
      pillD.innerHTML = `Minimum passing grades (C / D) sufficient`;
      recCoursePills.appendChild(pillD);
    }
  }

  function updateRoadmap(currGpa, earnedCr, reqGpa, remainCr, semCount, maxScale) {
    roadmapRows.innerHTML = '';
    const crPerSem = parseFloat((remainCr / semCount).toFixed(1));
    const termTarget = Math.max(0, Math.min(maxScale, reqGpa));

    let accumCr = earnedCr;
    let accumPts = currGpa * earnedCr;

    for (let i = 1; i <= semCount; i++) {
      const termCr = (i === semCount) ? (remainCr - crPerSem * (semCount - 1)) : crPerSem;
      accumCr += termCr;
      accumPts += termTarget * termCr;
      const projCumul = accumPts / accumCr;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 600;">Semester +${i}</td>
        <td>${termCr.toFixed(1)} cr</td>
        <td><span style="color: var(--accent); font-weight: 600;">${termTarget.toFixed(2)}</span></td>
        <td style="font-weight: 700; color: var(--text-primary);">${projCumul.toFixed(2)}</td>
      `;
      roadmapRows.appendChild(tr);
    }
  }

  function updateWhatIfMatrix(currGpa, earnedCr, remainCr, totalCr, targetGpa, maxScale) {
    whatifRows.innerHTML = '';
    const scenarios = [
      { gpa: maxScale, label: `Flawless (${maxScale.toFixed(2)})` },
      { gpa: 3.70, label: '3.70 (A- Average)' },
      { gpa: 3.50, label: '3.50 (Honors Average)' },
      { gpa: 3.00, label: '3.00 (Straight B\'s)' },
      { gpa: 2.50, label: '2.50 (B/C Mix)' },
      { gpa: 2.00, label: '2.00 (Pass Only)' }
    ];

    const currentPts = currGpa * earnedCr;

    scenarios.forEach(sc => {
      if (sc.gpa > maxScale) return;
      const futurePts = sc.gpa * remainCr;
      const finalGpa = (currentPts + futurePts) / totalCr;
      const reached = finalGpa >= targetGpa;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${sc.gpa.toFixed(2)}</strong> <small style="color:var(--text-tertiary)">(${sc.label})</small></td>
        <td style="font-family: monospace;">+${futurePts.toFixed(1)} pts</td>
        <td style="font-size: 1rem; font-weight: 800; color: ${reached ? 'var(--success)' : 'var(--text-primary)'};">${finalGpa.toFixed(2)}</td>
        <td>
          <span style="font-weight: 600; color: ${reached ? 'var(--success)' : 'var(--error)'}; font-size: 0.85rem;">
            ${reached ? '&check; Reached' : '&cross; Missed by ' + (targetGpa - finalGpa).toFixed(2)}
          </span>
        </td>
      `;
      whatifRows.appendChild(tr);
    });
  }

  // --- Presets ---
  presetFreshman.addEventListener('click', () => {
    inpCurrGpa.value = '2.85';
    inpEarnedCr.value = '30';
    inpTargetGpa.value = '3.50';
    inpRemainCr.value = '90';
    inpSemCount.value = '6';
    calculateProjection();
  });

  presetJunior.addEventListener('click', () => {
    inpCurrGpa.value = '3.20';
    inpEarnedCr.value = '60';
    inpTargetGpa.value = '3.60';
    inpRemainCr.value = '60';
    inpSemCount.value = '4';
    calculateProjection();
  });

  presetSenior.addEventListener('click', () => {
    inpCurrGpa.value = '3.55';
    inpEarnedCr.value = '90';
    inpTargetGpa.value = '3.70';
    inpRemainCr.value = '30';
    inpSemCount.value = '2';
    calculateProjection();
  });

  // --- Reset ---
  btnReset.addEventListener('click', () => {
    inpCurrGpa.value = '3.00';
    inpEarnedCr.value = '45';
    inpTargetGpa.value = '3.50';
    inpRemainCr.value = '75';
    inpSemCount.value = '5';
    calculateProjection();
  });

  // --- Event Listeners ---
  [inpCurrGpa, inpEarnedCr, inpTargetGpa, inpRemainCr, selMaxScale, inpSemCount].forEach(input => {
    input.addEventListener('input', calculateProjection);
  });
  btnRecalc.addEventListener('click', calculateProjection);

  // Initial Calculation
  calculateProjection();
});