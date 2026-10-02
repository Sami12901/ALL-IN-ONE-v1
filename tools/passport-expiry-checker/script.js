// Passport Expiry Checker Logic

// Database of reference country requirements
const COUNTRY_REQUIREMENTS = [
  { country: 'Thailand', region: 'Southeast Asia', ruleType: '6m', requirement: '6 Months from Entry Date', notes: 'Strictly enforced by all airlines; at least 1 blank visa page.' },
  { country: 'United Arab Emirates (UAE)', region: 'Middle East', ruleType: '6m', requirement: '6 Months from Entry Date', notes: 'Applies to tourists and transit visitors; normal passports only.' },
  { country: 'Saudi Arabia', region: 'Middle East', ruleType: '6m', requirement: '6 Months from Entry Date', notes: 'Mandatory for eVisa, Umrah, and Hajj visitors.' },
  { country: 'Singapore', region: 'Southeast Asia', ruleType: '6m', requirement: '6 Months from Entry Date', notes: 'Strict airline boarding requirement; SG Arrival Card required.' },
  { country: 'Malaysia', region: 'Southeast Asia', ruleType: '6m', requirement: '6 Months from Entry Date', notes: '6 months upon arrival; digital arrival card (MDAC) required.' },
  { country: 'Indonesia (Bali)', region: 'Southeast Asia', ruleType: '6m', requirement: '6 Months from Entry Date', notes: 'Strict 6-month rule; damage or tears can also cause entry denial.' },
  { country: 'Turkey', region: 'Europe / Middle East', ruleType: '6m', requirement: '150 Days (~5 Months) from Entry', notes: '60 days beyond the visa or visa-exemption duration.' },
  { country: 'Egypt', region: 'Africa / Middle East', ruleType: '6m', requirement: '6 Months from Entry Date', notes: 'Required for eVisa and visa-on-arrival applicants.' },
  { country: 'Vietnam', region: 'Southeast Asia', ruleType: '6m', requirement: '6 Months from Entry Date', notes: 'Passport must be valid at least 6 months for e-Visa issuance.' },
  { country: 'Qatar', region: 'Middle East', ruleType: '6m', requirement: '6 Months from Entry Date', notes: 'At least 6 months validity from date of arrival.' },
  { country: 'China', region: 'East Asia', ruleType: '6m', requirement: '6 Months from Entry Date', notes: 'Must have at least two blank visa pages.' },
  { country: 'Brazil', region: 'South America', ruleType: '6m', requirement: '6 Months from Entry Date', notes: '6 months validity upon arrival.' },
  { country: 'France', region: 'Schengen (Europe)', ruleType: '3m', requirement: '3 Months beyond Departure', notes: 'Must be issued within previous 10 years on entry date.' },
  { country: 'Germany', region: 'Schengen (Europe)', ruleType: '3m', requirement: '3 Months beyond Departure', notes: 'Must be issued within previous 10 years on entry date.' },
  { country: 'Italy', region: 'Schengen (Europe)', ruleType: '3m', requirement: '3 Months beyond Departure', notes: 'Must be issued within previous 10 years on entry date.' },
  { country: 'Spain', region: 'Schengen (Europe)', ruleType: '3m', requirement: '3 Months beyond Departure', notes: 'Must be issued within previous 10 years on entry date.' },
  { country: 'Switzerland', region: 'Schengen (Europe)', ruleType: '3m', requirement: '3 Months beyond Departure', notes: 'Must be issued within previous 10 years on entry date.' },
  { country: 'Netherlands', region: 'Schengen (Europe)', ruleType: '3m', requirement: '3 Months beyond Departure', notes: 'Must be issued within previous 10 years on entry date.' },
  { country: 'Greece', region: 'Schengen (Europe)', ruleType: '3m', requirement: '3 Months beyond Departure', notes: 'Must be issued within previous 10 years on entry date.' },
  { country: 'United States (USA)', region: 'North America', ruleType: 'stay', requirement: 'Duration of Stay / 6-Month Club', notes: 'Citizens of Six-Month Club exempt from 6-month rule; must be valid for stay.' },
  { country: 'United Kingdom (UK)', region: 'Europe', ruleType: 'stay', requirement: 'Duration of Stay', notes: 'Passport just needs to be valid for the entire proposed visit.' },
  { country: 'Canada', region: 'North America', ruleType: 'stay', requirement: 'Duration of Stay', notes: 'Must be valid for the duration of stay; eTA or visa tied to passport.' },
  { country: 'Australia', region: 'Oceania', ruleType: 'stay', requirement: 'Duration of Stay', notes: 'Must be valid upon departure; airlines recommend 6 months.' },
  { country: 'Japan', region: 'East Asia', ruleType: 'stay', requirement: 'Duration of Stay', notes: 'Valid for the period of stay; return or onward ticket required.' },
  { country: 'Mexico', region: 'North America', ruleType: 'stay', requirement: 'Duration of Stay', notes: 'Must be valid for duration of stay during immigration inspection.' }
];

const SCHENGEN_COUNTRIES = [
  'France', 'Germany', 'Italy', 'Spain', 'Switzerland', 'Netherlands', 'Greece', 'Austria', 'Portugal', 'Other Schengen'
];

const SIX_MONTH_COUNTRIES = [
  'Thailand', 'UAE', 'Saudi Arabia', 'Singapore', 'Malaysia', 'Indonesia', 'Turkey', 'Egypt', 'Vietnam', 'Qatar', 'China', 'Brazil'
];

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const travelerNameInput = document.getElementById('traveler-name');
  const issueDateInput = document.getElementById('issue-date');
  const expiryDateInput = document.getElementById('expiry-date');
  const travelDestSelect = document.getElementById('travel-dest');
  const travelDateInput = document.getElementById('travel-date');
  const returnDateInput = document.getElementById('return-date');

  const statusBadge = document.getElementById('status-badge');
  const statusSummarySub = document.getElementById('status-summary-sub');
  const destRuleBadge = document.getElementById('dest-rule-badge');
  const valDaysToday = document.getElementById('val-days-today');
  const valMonthsTravel = document.getElementById('val-months-travel');
  const valDaysTravel = document.getElementById('val-days-travel');
  const meterFill = document.getElementById('meter-fill');
  const meterPercentDisp = document.getElementById('meter-percent-disp');
  const ruleAlert = document.getElementById('rule-alert');
  const ruleAlertIcon = document.getElementById('rule-alert-icon');
  const ruleAlertContent = document.getElementById('rule-alert-content');

  const btnPresetValid = document.getElementById('btn-preset-valid');
  const btnPresetWarning = document.getElementById('btn-preset-warning');
  const btnPresetExpired = document.getElementById('btn-preset-expired');
  const btnCopyStatus = document.getElementById('btn-copy-status');
  const btnPrintStatus = document.getElementById('btn-print-status');

  const tabSingle = document.getElementById('tab-single');
  const tabBatch = document.getElementById('tab-batch');
  const singleView = document.getElementById('single-view');
  const batchView = document.getElementById('batch-view');
  const batchTableBody = document.getElementById('batch-table-body');
  const btnAddBatchRow = document.getElementById('btn-add-batch-row');
  const btnPrintBatch = document.getElementById('btn-print-batch');

  const refTableBody = document.getElementById('ref-table-body');
  const filterCountrySearch = document.getElementById('filter-country-search');
  const filterRuleBtns = document.querySelectorAll('.filter-rule-btn');

  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toast-text');

  // Helpers
  function showToast(msg) {
    if (!toast) return;
    toastText.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function formatDateIso(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function addDays(date, days) {
    const res = new Date(date);
    res.setDate(res.getDate() + days);
    return res;
  }

  function diffDays(d1, d2) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round((d2 - d1) / oneDay);
  }

  function diffMonths(d1, d2) {
    let months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months += d2.getMonth() - d1.getMonth();
    if (d2.getDate() < d1.getDate()) {
      months -= 1;
    }
    const remDays = Math.max(0, diffDays(d1, d2) % 30);
    return { months, days: remDays };
  }

  // Initialize Default Dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Set default sample dates
  const defaultIssue = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());
  const defaultExpiry = new Date(today.getFullYear() + 4, today.getMonth(), today.getDate());
  const defaultTravel = addDays(today, 30);
  const defaultReturn = addDays(today, 45);

  issueDateInput.value = formatDateIso(defaultIssue);
  expiryDateInput.value = formatDateIso(defaultExpiry);
  travelDateInput.value = formatDateIso(defaultTravel);
  returnDateInput.value = formatDateIso(defaultReturn);

  // SVGs for alerts
  const ICON_SUCCESS = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--success);"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
  const ICON_WARNING = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--warning);"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
  const ICON_ERROR = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--error);"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;

  // Primary Evaluation Logic
  function evaluatePassport() {
    const dest = travelDestSelect.value;
    const isSchengen = SCHENGEN_COUNTRIES.includes(dest);
    const is6MonthRule = SIX_MONTH_COUNTRIES.includes(dest);

    // Rule badge on right panel
    if (isSchengen) {
      destRuleBadge.textContent = 'Schengen 3-Month & 10-Yr Rule';
    } else if (is6MonthRule) {
      destRuleBadge.textContent = 'Strict 6-Month Rule';
    } else {
      destRuleBadge.textContent = 'Duration of Stay';
    }

    if (!expiryDateInput.value) {
      statusBadge.className = 'status-badge-lg warning';
      statusBadge.innerHTML = `${ICON_WARNING}<span>PLEASE ENTER EXPIRY DATE</span>`;
      statusSummarySub.textContent = 'Enter your passport expiration date to evaluate travel eligibility.';
      return;
    }

    const expiry = new Date(expiryDateInput.value + 'T00:00:00');
    const travel = travelDateInput.value ? new Date(travelDateInput.value + 'T00:00:00') : today;
    const returnDate = returnDateInput.value ? new Date(returnDateInput.value + 'T00:00:00') : addDays(travel, 14);
    const issue = issueDateInput.value ? new Date(issueDateInput.value + 'T00:00:00') : null;

    // Remaining days from today
    const daysFromToday = diffDays(today, expiry);
    // Remaining days from travel date
    const daysFromTravel = diffDays(travel, expiry);
    // Remaining days after planned return
    const daysAfterReturn = diffDays(returnDate, expiry);

    // Update stats cards
    valDaysToday.textContent = daysFromToday > 0 ? `${daysFromToday}d` : '0d';
    valDaysTravel.textContent = daysFromTravel > 0 ? `${daysFromTravel}d` : '0d';

    const mObj = diffMonths(travel, expiry);
    valMonthsTravel.textContent = daysFromTravel > 0 ? `${mObj.months}m ${mObj.days}d` : '0m';

    // Validity meter percentage (based on 365 days)
    const meterPct = Math.min(100, Math.max(0, Math.round((daysFromTravel / 365) * 100)));
    meterFill.style.width = `${meterPct}%`;

    // 10-Year Schengen rule check
    let schengen10YearViolated = false;
    if (isSchengen && issue) {
      const tenYearsAfterIssue = new Date(issue);
      tenYearsAfterIssue.setFullYear(tenYearsAfterIssue.getFullYear() + 10);
      if (travel > tenYearsAfterIssue) {
        schengen10YearViolated = true;
      }
    }

    // Evaluation rules
    let status = 'valid';
    let statusTitle = 'PASSPORT VALID FOR TRAVEL';
    let summaryDesc = `Passport satisfies entry and airline boarding rules for ${dest}.`;
    let alertHtml = '';

    if (daysFromToday <= 0) {
      // Already expired today
      status = 'expired';
      statusTitle = 'PASSPORT IS EXPIRED';
      summaryDesc = `Your passport expired ${Math.abs(daysFromToday)} days ago on ${expiry.toLocaleDateString()}.`;
      alertHtml = `<strong>Action Required:</strong> This passport has already expired. You cannot board any flight or apply for visas. Please apply for a passport renewal immediately before making travel arrangements.`;
      meterFill.style.background = 'var(--error)';
      meterPercentDisp.textContent = 'Expired';
    } else if (daysFromTravel <= 0) {
      // Expires before travel departure
      status = 'expired';
      statusTitle = 'EXPIRES BEFORE TRAVEL';
      summaryDesc = `Your passport expires on ${expiry.toLocaleDateString()}, prior to your departure date of ${travel.toLocaleDateString()}.`;
      alertHtml = `<strong>Cannot Travel:</strong> Passport validity lapses before or during your intended departure. You must renew your passport prior to travel.`;
      meterFill.style.background = 'var(--error)';
      meterPercentDisp.textContent = 'Invalid';
    } else if (daysAfterReturn <= 0) {
      // Expires during trip
      status = 'expired';
      statusTitle = 'EXPIRES DURING TRIP';
      summaryDesc = `Your passport expires on ${expiry.toLocaleDateString()}, before your planned return date of ${returnDate.toLocaleDateString()}.`;
      alertHtml = `<strong>Critical Risk:</strong> Passport expires while you are overseas. You will be stranded or denied boarding on return. Renewal is mandatory.`;
      meterFill.style.background = 'var(--error)';
      meterPercentDisp.textContent = 'Invalid';
    } else if (schengen10YearViolated) {
      // Schengen 10 year rule violation
      status = 'warning';
      statusTitle = 'SCHENGEN 10-YEAR RULE VIOLATION';
      summaryDesc = `Schengen border authorities require passports to be issued within the last 10 years upon arrival.`;
      alertHtml = `<strong>Schengen 10-Year Rule Alert:</strong> Even if this passport has not reached its printed expiry date, it was issued more than 10 years before your entry date (${issue.toLocaleDateString()}). Under EU Regulation (EU) 2016/399, you will be denied entry to Schengen territory. You must renew before traveling.`;
      meterFill.style.background = 'var(--warning)';
      meterPercentDisp.textContent = 'Rule Alert';
    } else if (isSchengen && daysAfterReturn < 90) {
      // Schengen 3-month rule violation (needs 3 months AFTER return date)
      status = 'warning';
      statusTitle = 'FAILS SCHENGEN 3-MONTH RULE';
      summaryDesc = `Schengen requires at least 3 months validity beyond your departure from the Schengen zone.`;
      alertHtml = `<strong>Schengen Rule Warning:</strong> Your passport has only <strong>${daysAfterReturn} days</strong> of validity after your planned return date (${returnDate.toLocaleDateString()}). Schengen immigration requires a minimum of <strong>90 days (3 months)</strong> validity after departure. Airlines will deny boarding. Urgent passport renewal required.`;
      meterFill.style.background = 'var(--warning)';
      meterPercentDisp.textContent = 'Fails 3M Rule';
    } else if (is6MonthRule && daysFromTravel < 183) {
      // 6-month rule violation
      status = 'warning';
      statusTitle = 'FAILS 6-MONTH VALIDITY RULE';
      summaryDesc = `${dest} strictly enforces the 6-month validity requirement upon arrival.`;
      alertHtml = `<strong>6-Month Rule Warning:</strong> Your passport has only <strong>${daysFromTravel} days (~${mObj.months} months)</strong> of validity remaining on your departure date. ${dest} and international airlines require at least <strong>6 full months (180+ days)</strong>. You will be denied boarding at check-in. Expedited passport renewal is strongly advised.`;
      meterFill.style.background = 'var(--warning)';
      meterPercentDisp.textContent = 'Fails 6M Rule';
    } else if (daysFromTravel < 183) {
      // Generic warning if less than 6 months even for stay countries
      status = 'warning';
      statusTitle = 'LESS THAN 6 MONTHS REMAINING';
      summaryDesc = `Passport has ${daysFromTravel} days remaining. Meets ${dest} stay rule, but caution advised.`;
      alertHtml = `<strong>Advisory:</strong> Although ${dest} permits entry if passport is valid for length of stay, transit airline hubs or unexpected delays may pose risks. We recommend maintaining at least 6 months validity.`;
      meterFill.style.background = 'var(--warning)';
      meterPercentDisp.textContent = 'Caution';
    } else if (daysFromTravel < 240) {
      // Approaching renewal
      status = 'valid';
      statusTitle = 'VALID (RENEWAL ADVISABLE)';
      summaryDesc = `Meets requirements for ${dest}, but passport will expire in ~${mObj.months} months.`;
      alertHtml = `<strong>Good for this trip:</strong> Passport meets all entry conditions for ${dest}. However, with under 8 months left, consider scheduling a renewal after returning.`;
      meterFill.style.background = 'var(--success)';
      meterPercentDisp.textContent = 'Safe';
    } else {
      // Ample validity
      status = 'valid';
      statusTitle = 'PASSPORT VALID FOR TRAVEL';
      summaryDesc = `Passport has ample validity (${mObj.months} months) and satisfies all entry rules for ${dest}.`;
      alertHtml = `<strong>Requirement Satisfied:</strong> Your passport has full, unhindered validity for entry into ${dest}. Ensure you also hold 2 blank visa pages and necessary visas.`;
      meterFill.style.background = 'var(--success)';
      meterPercentDisp.textContent = 'Excellent';
    }

    // Render Badge & Content
    statusBadge.className = `status-badge-lg ${status}`;
    const icon = status === 'valid' ? ICON_SUCCESS : (status === 'warning' ? ICON_WARNING : ICON_ERROR);
    statusBadge.innerHTML = `${icon}<span>${statusTitle}</span>`;
    statusSummarySub.textContent = summaryDesc;

    ruleAlert.className = `rule-alert-box ${status}`;
    ruleAlertIcon.innerHTML = icon;
    ruleAlertContent.innerHTML = alertHtml;
  }

  // Presets
  btnPresetValid.addEventListener('click', () => {
    travelDestSelect.value = 'Thailand';
    issueDateInput.value = formatDateIso(new Date(today.getFullYear() - 2, today.getMonth(), today.getDate()));
    expiryDateInput.value = formatDateIso(new Date(today.getFullYear() + 4, today.getMonth(), today.getDate()));
    travelDateInput.value = formatDateIso(addDays(today, 30));
    returnDateInput.value = formatDateIso(addDays(today, 45));
    evaluatePassport();
    showToast('Loaded sample valid passport profile.');
  });

  btnPresetWarning.addEventListener('click', () => {
    travelDestSelect.value = 'Thailand';
    // Expires in 4 months from travel date (fails 6-month rule!)
    const trvDate = addDays(today, 30);
    travelDateInput.value = formatDateIso(trvDate);
    returnDateInput.value = formatDateIso(addDays(today, 45));
    issueDateInput.value = formatDateIso(new Date(today.getFullYear() - 9, today.getMonth(), today.getDate()));
    expiryDateInput.value = formatDateIso(addDays(trvDate, 110)); // ~3.5 months after travel
    evaluatePassport();
    showToast('Loaded sample 6-month rule violation.');
  });

  btnPresetExpired.addEventListener('click', () => {
    travelDestSelect.value = 'France';
    issueDateInput.value = formatDateIso(new Date(today.getFullYear() - 10, today.getMonth(), today.getDate()));
    expiryDateInput.value = formatDateIso(addDays(today, -15)); // Expired 15 days ago
    travelDateInput.value = formatDateIso(addDays(today, 20));
    returnDateInput.value = formatDateIso(addDays(today, 35));
    evaluatePassport();
    showToast('Loaded sample expired passport profile.');
  });

  // Copy Status Assessment
  btnCopyStatus.addEventListener('click', () => {
    const name = travelerNameInput.value || 'Traveler';
    const dest = travelDestSelect.value;
    const expiry = expiryDateInput.value;
    const travel = travelDateInput.value;
    const statusText = statusBadge.textContent.trim();
    const daysTravel = valDaysTravel.textContent;
    const alertText = ruleAlertContent.textContent.trim();

    const textToCopy = [
      `=== PASSPORT VALIDITY VERIFICATION ===`,
      `Traveler: ${name}`,
      `Destination: ${dest}`,
      `Passport Expiration Date: ${expiry}`,
      `Intended Departure Date: ${travel}`,
      `Remaining Validity on Departure: ${daysTravel}`,
      `Result Status: ${statusText}`,
      `Details: ${alertText}`,
      `Verified: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      `ALL IN ONE Travel Tools`
    ].join('\n');

    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast('Assessment report copied to clipboard!');
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = textToCopy;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Assessment copied!');
    });
  });

  // Print Status
  btnPrintStatus.addEventListener('click', () => {
    window.print();
  });

  // Tabs for Single vs Batch
  tabSingle.addEventListener('click', () => {
    tabSingle.classList.add('active');
    tabBatch.classList.remove('active');
    singleView.classList.remove('hidden');
    batchView.classList.add('hidden');
  });

  tabBatch.addEventListener('click', () => {
    tabBatch.classList.add('active');
    tabSingle.classList.remove('active');
    batchView.classList.remove('hidden');
    singleView.classList.add('hidden');
    renderBatchTable();
  });

  // Batch Check Data Structure
  let batchList = [
    { name: 'John Doe', dest: 'Thailand', travelDate: formatDateIso(addDays(today, 30)), expiryDate: formatDateIso(addDays(today, 600)) },
    { name: 'Jane Doe', dest: 'Thailand', travelDate: formatDateIso(addDays(today, 30)), expiryDate: formatDateIso(addDays(today, 120)) },
    { name: 'Alex Doe', dest: 'France', travelDate: formatDateIso(addDays(today, 45)), expiryDate: formatDateIso(addDays(today, -10)) }
  ];

  function evaluateBatchRow(row) {
    const travel = new Date(row.travelDate + 'T00:00:00');
    const expiry = new Date(row.expiryDate + 'T00:00:00');
    const isSchengen = SCHENGEN_COUNTRIES.includes(row.dest);
    const is6m = SIX_MONTH_COUNTRIES.includes(row.dest);

    const daysLeft = diffDays(travel, expiry);
    const daysToday = diffDays(today, expiry);

    if (daysToday <= 0) {
      return { status: 'expired', label: 'Expired', days: `${daysLeft}d` };
    }
    if (is6m && daysLeft < 183) {
      return { status: 'warning', label: 'Fails 6-Mo Rule', days: `${daysLeft}d` };
    }
    if (isSchengen && daysLeft < 120) {
      return { status: 'warning', label: 'Schengen Alert', days: `${daysLeft}d` };
    }
    if (daysLeft < 0) {
      return { status: 'expired', label: 'Expires Pre-Travel', days: `${daysLeft}d` };
    }
    return { status: 'valid', label: 'Valid', days: `${daysLeft}d` };
  }

  function renderBatchTable() {
    batchTableBody.innerHTML = '';
    batchList.forEach((item, index) => {
      const evalRes = evaluateBatchRow(item);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input type="text" class="form-input batch-inp" data-index="${index}" data-field="name" value="${item.name}" style="padding: 0.35rem 0.5rem; font-size: 0.8rem;"></td>
        <td>
          <select class="form-select batch-inp" data-index="${index}" data-field="dest" style="padding: 0.35rem 0.5rem; font-size: 0.8rem;">
            <option value="Thailand" ${item.dest === 'Thailand' ? 'selected' : ''}>Thailand (6M)</option>
            <option value="UAE" ${item.dest === 'UAE' ? 'selected' : ''}>UAE (6M)</option>
            <option value="Saudi Arabia" ${item.dest === 'Saudi Arabia' ? 'selected' : ''}>Saudi Arabia (6M)</option>
            <option value="Singapore" ${item.dest === 'Singapore' ? 'selected' : ''}>Singapore (6M)</option>
            <option value="France" ${item.dest === 'France' ? 'selected' : ''}>France (Schengen)</option>
            <option value="USA" ${item.dest === 'USA' ? 'selected' : ''}>USA (Stay)</option>
            <option value="UK" ${item.dest === 'UK' ? 'selected' : ''}>UK (Stay)</option>
          </select>
        </td>
        <td><input type="date" class="form-input batch-inp" data-index="${index}" data-field="travelDate" value="${item.travelDate}" style="padding: 0.35rem 0.5rem; font-size: 0.8rem;"></td>
        <td><input type="date" class="form-input batch-inp" data-index="${index}" data-field="expiryDate" value="${item.expiryDate}" style="padding: 0.35rem 0.5rem; font-size: 0.8rem;"></td>
        <td style="font-weight: 600;">${evalRes.days}</td>
        <td>
          <span class="badge-pill ${evalRes.status === 'valid' ? 'badge-stay' : (evalRes.status === 'warning' ? 'badge-3m' : 'badge-6m')}">
            ${evalRes.label}
          </span>
        </td>
        <td class="no-print" style="text-align: center;">
          <button type="button" class="btn btn-secondary btn-del-row" data-index="${index}" style="padding: 0.2rem 0.5rem; font-size: 0.75rem; color: var(--error);">
            &times;
          </button>
        </td>
      `;
      batchTableBody.appendChild(tr);
    });

    // Listen to changes in batch inputs
    batchTableBody.querySelectorAll('.batch-inp').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const idx = e.target.dataset.index;
        const field = e.target.dataset.field;
        batchList[idx][field] = e.target.value;
        renderBatchTable();
      });
    });

    batchTableBody.querySelectorAll('.btn-del-row').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.target.closest('button').dataset.index;
        batchList.splice(idx, 1);
        renderBatchTable();
        showToast('Traveler removed.');
      });
    });
  }

  btnAddBatchRow.addEventListener('click', () => {
    batchList.push({
      name: `Traveler ${batchList.length + 1}`,
      dest: 'Thailand',
      travelDate: formatDateIso(addDays(today, 30)),
      expiryDate: formatDateIso(addDays(today, 365))
    });
    renderBatchTable();
  });

  btnPrintBatch.addEventListener('click', () => {
    window.print();
  });

  // Reference Table Population & Filtering
  let activeRuleFilter = 'all';

  function renderRefTable() {
    const query = filterCountrySearch.value.toLowerCase().trim();
    const filtered = COUNTRY_REQUIREMENTS.filter(item => {
      const matchSearch = item.country.toLowerCase().includes(query) ||
                          item.region.toLowerCase().includes(query) ||
                          item.notes.toLowerCase().includes(query);
      const matchRule = activeRuleFilter === 'all' || item.ruleType === activeRuleFilter;
      return matchSearch && matchRule;
    });

    refTableBody.innerHTML = filtered.map(item => {
      let badgeClass = 'badge-stay';
      if (item.ruleType === '6m') badgeClass = 'badge-6m';
      if (item.ruleType === '3m') badgeClass = 'badge-3m';

      return `
        <tr>
          <td><strong>${item.country}</strong></td>
          <td><span style="color: var(--text-secondary); font-size: 0.8rem;">${item.region}</span></td>
          <td><span class="badge-pill ${badgeClass}">${item.requirement}</span></td>
          <td style="font-size: 0.8rem; color: var(--text-secondary);">${item.notes}</td>
        </tr>
      `;
    }).join('');
  }

  filterCountrySearch.addEventListener('input', renderRefTable);

  filterRuleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterRuleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeRuleFilter = btn.dataset.rule;
      renderRefTable();
    });
  });

  // Event Listeners for Single Evaluation
  [issueDateInput, expiryDateInput, travelDateInput, returnDateInput, travelDestSelect].forEach(el => {
    el.addEventListener('change', evaluatePassport);
    el.addEventListener('input', evaluatePassport);
  });

  // Initial runs
  evaluatePassport();
  renderRefTable();
});