// AI Trend Detection - Production Client-Side Logic
// Algorithmic detection of anomalies, acceleration spikes, deceleration dips, plateaus, and Trend Health Momentum scoring.

document.addEventListener('DOMContentLoaded', () => {
  // Preset Datasets
  const PRESETS = {
    adoption: [
      // S-Curve Viral Adoption Curve (Slow Start -> Inflection Spike -> Saturation Plateau)
      { label: 'W01', value: 1200 }, { label: 'W02', value: 1350 },
      { label: 'W03', value: 1580 }, { label: 'W04', value: 1950 },
      { label: 'W05', value: 2600 }, { label: 'W06', value: 3700 },
      { label: 'W07', value: 5400 }, { label: 'W08', value: 8100 },
      { label: 'W09', value: 12200 }, { label: 'W10', value: 18500 }, // Inflection Spike
      { label: 'W11', value: 26000 }, { label: 'W12', value: 34500 },
      { label: 'W13', value: 42000 }, { label: 'W14', value: 48000 },
      { label: 'W15', value: 52500 }, { label: 'W16', value: 55800 },
      { label: 'W17', value: 58000 }, { label: 'W18', value: 59200 }, // Plateau starts
      { label: 'W19', value: 59900 }, { label: 'W20', value: 60200 },
      { label: 'W21', value: 60500 }, { label: 'W22', value: 60700 },
      { label: 'W23', value: 60900 }, { label: 'W24', value: 61000 }
    ],
    churn: [
      // Steady SaaS Growth with Sudden Outlier Dip / Churn Shock at Month 8
      { label: 'M01', value: 25000 }, { label: 'M02', value: 27500 },
      { label: 'M03', value: 30200 }, { label: 'M04', value: 33400 },
      { label: 'M05', value: 37000 }, { label: 'M06', value: 40800 },
      { label: 'M07', value: 45200 }, { label: 'M08', value: 31000 }, // Sudden Anomaly / Dip
      { label: 'M09', value: 48000 }, { label: 'M10', value: 52500 },
      { label: 'M11', value: 57400 }, { label: 'M12', value: 63000 },
      { label: 'M13', value: 69200 }, { label: 'M14', value: 75800 },
      { label: 'M15', value: 83000 }, { label: 'M16', value: 91000 }
    ],
    cycle: [
      // Multi-phase Cycle: Bull run -> Parabolic Top -> Reversal Inflection -> Deep Dip -> Base
      { label: 'P01', value: 100 }, { label: 'P02', value: 112 },
      { label: 'P03', value: 130 }, { label: 'P04', value: 158 },
      { label: 'P05', value: 205 }, { label: 'P06', value: 280 }, // Spike
      { label: 'P07', value: 395 }, { label: 'P08', value: 480 }, // Peak Inflection
      { label: 'P09', value: 450 }, { label: 'P10', value: 360 }, // Dip
      { label: 'P11', value: 260 }, { label: 'P12', value: 190 },
      { label: 'P13', value: 165 }, { label: 'P14', value: 162 }, // Plateau
      { label: 'P15', value: 164 }, { label: 'P16', value: 166 },
      { label: 'P17', value: 172 }, { label: 'P18', value: 185 }
    ],
    outage: [
      // Infrastructure Traffic: Flat Steady Baseline with Sudden Massive Anomaly Spikes
      { label: '00:00', value: 48000 }, { label: '02:00', value: 47500 },
      { label: '04:00', value: 48200 }, { label: '06:00', value: 49100 },
      { label: '08:00', value: 51200 }, { label: '10:00', value: 52000 },
      { label: '12:00', value: 145000 }, // DDoS Spike / Anomaly
      { label: '14:00', value: 51800 },
      { label: '16:00', value: 52400 }, { label: '18:00', value: 53100 },
      { label: '20:00', value: 18000 }, // Outage Drop
      { label: '22:00', value: 50800 }
    ]
  };

  // State
  let dataPoints = JSON.parse(JSON.stringify(PRESETS.adoption));
  let sensitivityThreshold = 2.0; // Standard deviations for anomaly
  let activeFilters = {
    anomalies: true,
    spikes: true,
    dips: true,
    plateaus: true,
    inflections: true
  };

  // DOM Elements
  const pointCountSpan = document.getElementById('data-point-count');
  const seriesTableBody = document.getElementById('series-tbody');
  const eventsTableBody = document.getElementById('events-tbody');
  const aiDiagnosisContent = document.getElementById('ai-diagnosis-content');

  // Gauge Elements
  const gaugeScoreText = document.getElementById('gauge-score-text');
  const gaugeCircleBar = document.getElementById('gauge-circle-bar');
  const gaugeStatusTitle = document.getElementById('gauge-status-title');
  const gaugeStatusBadge = document.getElementById('gauge-status-badge');
  const gaugeDescription = document.getElementById('gauge-description');
  const regimeBadge = document.getElementById('regime-badge');

  // KPI Elements
  const kpiAnomalies = document.getElementById('kpi-anomalies-count');
  const kpiSpikes = document.getElementById('kpi-spikes-count');
  const kpiDips = document.getElementById('kpi-dips-count');
  const kpiPlateaus = document.getElementById('kpi-plateau-count');
  const kpiInflections = document.getElementById('kpi-inflections-count');

  // Controls
  const sensitivitySlider = document.getElementById('sensitivity-slider');
  const sensitivityLbl = document.getElementById('sensitivity-lbl');
  const filterAnomalies = document.getElementById('filter-anomalies');
  const filterSpikes = document.getElementById('filter-spikes');
  const filterDips = document.getElementById('filter-dips');
  const filterPlateaus = document.getElementById('filter-plateaus');
  const filterInflections = document.getElementById('filter-inflections');

  // Tabs & Views
  const tabTableBtn = document.getElementById('tab-table-btn');
  const tabPasteBtn = document.getElementById('tab-paste-btn');
  const viewTable = document.getElementById('view-table-editor');
  const viewPaste = document.getElementById('view-paste-editor');
  const rawPasteInput = document.getElementById('raw-paste-input');
  const btnApplyPaste = document.getElementById('btn-apply-paste');

  // Action Buttons & Presets
  const btnAddRow = document.getElementById('btn-add-row');
  const btnClearData = document.getElementById('btn-clear-data');
  const btnResetPreset = document.getElementById('btn-reset-preset');
  const btnExportEvents = document.getElementById('btn-export-events');
  const btnCopyDiag = document.getElementById('btn-copy-diagnostics');

  const presetAdoptBtn = document.getElementById('preset-adoption');
  const presetChurnBtn = document.getElementById('preset-churn');
  const presetCycleBtn = document.getElementById('preset-cycle');
  const presetOutageBtn = document.getElementById('preset-outage');

  // Chart SVG & Tooltip
  const svg = document.getElementById('detection-svg');
  const chartWrap = document.getElementById('chart-wrap');
  const tooltip = document.getElementById('chart-tooltip');

  // Formatters
  function formatNumber(val, decimals = 1) {
    if (isNaN(val) || val === null) return '0.0';
    return Number(val).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  // --- Algorithmic Detection Engine ---

  function analyzeTrendEvents(data, sensitivity) {
    const n = data.length;
    if (n < 3) return { events: [], score: 50, details: {} };

    const vals = data.map(d => d.value);

    // 1. Calculate Velocity (1st difference) & Acceleration (2nd difference)
    const velocities = [];
    const accelerations = [];

    for (let i = 0; i < n; i++) {
      if (i === 0) {
        velocities.push(0);
        accelerations.push(0);
      } else {
        const vel = vals[i] - vals[i - 1];
        velocities.push(vel);

        if (i === 1) {
          accelerations.push(0);
        } else {
          const acc = vel - velocities[i - 1];
          accelerations.push(acc);
        }
      }
    }

    // 2. Rolling Statistics for Local Anomaly Detection
    const windowSize = Math.max(3, Math.min(5, Math.floor(n / 3)));
    const anomalies = [];
    const spikes = [];
    const dips = [];
    const plateaus = [];
    const inflections = [];

    // Acceleration statistics
    const nonZeroAcc = accelerations.slice(2);
    const meanAcc = nonZeroAcc.reduce((a, b) => a + b, 0) / (nonZeroAcc.length || 1);
    const stdAcc = Math.sqrt(nonZeroAcc.reduce((s, a) => s + Math.pow(a - meanAcc, 2), 0) / (nonZeroAcc.length || 1)) || 1;

    for (let i = 0; i < n; i++) {
      // Local window for mean and standard deviation
      const wStart = Math.max(0, i - windowSize);
      const wEnd = Math.min(n, i + windowSize + 1);
      const localSlice = vals.slice(wStart, wEnd);
      const localMean = localSlice.reduce((a, b) => a + b, 0) / localSlice.length;
      const localStd = Math.sqrt(localSlice.reduce((s, v) => s + Math.pow(v - localMean, 2), 0) / localSlice.length) || 1;

      const zScore = Math.abs(vals[i] - localMean) / localStd;

      // Check Anomaly
      if (zScore >= sensitivity) {
        anomalies.push({
          index: i,
          type: 'anomaly',
          title: 'Statistical Outlier / Anomaly',
          icon: '⚠️',
          classBadge: 'badge-anomaly',
          color: '#fbbf24',
          z: zScore,
          desc: `Deviates ${zScore.toFixed(1)}σ from rolling mean`
        });
      }

      // Check Acceleration Spike (2nd derivative surge)
      if (i >= 2 && accelerations[i] > 1.35 * stdAcc && velocities[i] > 0) {
        spikes.push({
          index: i,
          type: 'spike',
          title: 'Acceleration Spike',
          icon: '⚡',
          classBadge: 'badge-spike',
          color: '#34d399',
          acc: accelerations[i],
          desc: `Velocity surged by +${formatNumber(accelerations[i], 0)}`
        });
      }

      // Check Deceleration Dip (sharp pull-back)
      if (i >= 2 && (accelerations[i] < -1.35 * stdAcc || (velocities[i] < 0 && velocities[i - 1] > 0))) {
        dips.push({
          index: i,
          type: 'dip',
          title: 'Deceleration Dip',
          icon: '🔻',
          classBadge: 'badge-dip',
          color: '#f87171',
          acc: accelerations[i],
          desc: `Deceleration of ${formatNumber(accelerations[i], 0)}`
        });
      }

      // Check Inflection Point (Curvature or slope flip)
      if (i > 0 && i < n - 1) {
        const prevVel = velocities[i];
        const nextVel = vals[i + 1] - vals[i];
        if ((prevVel > 0 && nextVel < 0) || (prevVel < 0 && nextVel > 0)) {
          inflections.push({
            index: i,
            type: 'inflection',
            title: 'Trend Inflection (Turning Point)',
            icon: '🔄',
            classBadge: 'badge-inflection',
            color: '#c084fc',
            desc: prevVel > 0 ? 'Local Crest / Reversal Downward' : 'Local Trough / Reversal Upward'
          });
        }
      }

      // Check Plateau State (less than 1.5% delta for 3 consecutive intervals)
      if (i >= 2) {
        const d1 = Math.abs(vals[i] - vals[i - 1]) / Math.max(1, vals[i - 1]);
        const d2 = Math.abs(vals[i - 1] - vals[i - 2]) / Math.max(1, vals[i - 2]);
        if (d1 < 0.015 && d2 < 0.015) {
          plateaus.push({
            index: i,
            type: 'plateau',
            title: 'Plateau State (Consolidation)',
            icon: '⏸️',
            classBadge: 'badge-plateau',
            color: '#38bdf8',
            desc: 'Variance contracted within ±1.5% corridor'
          });
        }
      }
    }

    // Merge detected events per data point (deduplicating to highest priority event per node)
    const eventMap = {};
    const priority = { anomaly: 5, dip: 4, spike: 3, inflection: 2, plateau: 1 };

    [...anomalies, ...dips, ...spikes, ...inflections, ...plateaus].forEach(ev => {
      const existing = eventMap[ev.index];
      if (!existing || priority[ev.type] > priority[existing.type]) {
        eventMap[ev.index] = ev;
      }
    });

    const allEvents = Object.values(eventMap).sort((a, b) => a.index - b.index);

    // 3. Compute Composite Trend Health & Momentum Score (0-100)
    // Pillar 1: Direction & Growth Consistency (0 to 35 pts)
    const posVelocities = velocities.filter(v => v > 0).length;
    const directionRatio = n > 1 ? posVelocities / (n - 1) : 0.5;
    const netGrowth = vals[n - 1] - vals[0];
    const pillarDirection = Math.min(35, Math.max(0, directionRatio * 25 + (netGrowth > 0 ? 10 : 0)));

    // Pillar 2: Momentum Velocity (Short-term SMA vs Long-term SMA) (0 to 25 pts)
    const smaShort = vals.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, n);
    const smaLong = vals.slice(-Math.min(7, n)).reduce((a, b) => a + b, 0) / Math.min(7, n);
    const momentumRatio = smaLong > 0 ? smaShort / smaLong : 1;
    let pillarVelocity = 12.5;
    if (momentumRatio >= 1.0) {
      pillarVelocity = Math.min(25, 12.5 + (momentumRatio - 1.0) * 125);
    } else {
      pillarVelocity = Math.max(0, 12.5 - (1.0 - momentumRatio) * 100);
    }

    // Pillar 3: Stability / Noise Resistance (0 to 25 pts)
    const overallMean = vals.reduce((a, b) => a + b, 0) / n;
    const overallStd = Math.sqrt(vals.reduce((s, v) => s + Math.pow(v - overallMean, 2), 0) / n);
    const cv = overallMean > 0 ? (overallStd / overallMean) * 100 : 0;
    const pillarStability = Math.max(5, Math.min(25, 25 - (cv * 0.3)));

    // Pillar 4: Anomaly Penalty (0 to 15 pts)
    const penalty = anomalies.length * 4 + dips.length * 2;
    const pillarPenalty = Math.max(0, 15 - penalty);

    const compositeScore = Math.round(Math.min(100, Math.max(0, pillarDirection + pillarVelocity + pillarStability + pillarPenalty)));

    return {
      events: allEvents,
      anomalies,
      spikes,
      dips,
      plateaus,
      inflections,
      velocities,
      accelerations,
      score: compositeScore,
      details: {
        directionScore: pillarDirection,
        velocityScore: pillarVelocity,
        stabilityScore: pillarStability,
        penaltyScore: pillarPenalty,
        lastVelocity: velocities[n - 1],
        lastAcceleration: accelerations[n - 1]
      }
    };
  }

  // --- Main Refresh Controller ---
  function updateAll() {
    if (dataPoints.length === 0) {
      renderEmptyState();
      return;
    }

    pointCountSpan.textContent = dataPoints.length;
    const n = dataPoints.length;
    const sensitivity = sensitivityThreshold;

    const analysis = analyzeTrendEvents(dataPoints, sensitivity);

    // Update KPI Card Counters
    kpiAnomalies.textContent = analysis.anomalies.length;
    kpiSpikes.textContent = analysis.spikes.length;
    kpiDips.textContent = analysis.dips.length;
    kpiPlateaus.textContent = analysis.plateaus.length;
    kpiInflections.textContent = analysis.inflections.length;

    // Update Momentum Health Gauge
    updateHealthGauge(analysis.score, analysis.details);

    // Filter events by active toggles
    const displayedEvents = analysis.events.filter(ev => {
      if (ev.type === 'anomaly' && !activeFilters.anomalies) return false;
      if (ev.type === 'spike' && !activeFilters.spikes) return false;
      if (ev.type === 'dip' && !activeFilters.dips) return false;
      if (ev.type === 'plateau' && !activeFilters.plateaus) return false;
      if (ev.type === 'inflection' && !activeFilters.inflections) return false;
      return true;
    });

    // Render Events Table
    renderEventsTable(displayedEvents, analysis.velocities);

    // Render AI Strategic Diagnosis Text
    renderAIDiagnosis(analysis);

    // Render Multi-layer SVG Visualizer
    renderSVG(dataPoints, displayedEvents, analysis.velocities);
  }

  // --- Update Health Gauge ---
  function updateHealthGauge(score, details) {
    gaugeScoreText.textContent = score;

    // Radius = 40 => Circumference = 2 * PI * 40 = 251.3
    const maxOffset = 251.3;
    const targetOffset = maxOffset * (1 - score / 100);
    gaugeCircleBar.style.strokeDashoffset = targetOffset;

    let title = 'Strong Bullish Expansion';
    let badgeText = 'Phase: Accelerated Expansion';
    let desc = 'Statistical momentum exhibits persistent upward velocity with minimal anomalous noise. Curvature confirms stable positive trajectory.';
    let color = 'var(--success)';
    let badgeClass = 'Expansion Regime';

    if (score >= 80) {
      title = 'Strong Bullish Expansion';
      badgeText = 'Phase: Hyper-Growth';
      color = 'var(--success)';
      desc = 'Accelerating positive momentum across consecutive evaluation windows. Minimal structural resistance and high trend persistence.';
      badgeClass = 'Strong Bullish Expansion';
    } else if (score >= 60) {
      title = 'Steady Positive Trajectory';
      badgeText = 'Phase: Sustained Growth';
      color = 'var(--accent)';
      desc = 'Healthy linear trend with normal minor variances. Velocity remains net positive above intermediate moving averages.';
      badgeClass = 'Steady Trend';
    } else if (score >= 40) {
      title = 'Consolidation / Plateau';
      badgeText = 'Phase: Range-Bound';
      color = 'var(--warning)';
      desc = 'Momentum has flattened into a plateau state. Standard deviation contracted, indicating potential breakout or fatigue.';
      badgeClass = 'Plateau State';
    } else if (score >= 20) {
      title = 'Decelerating / Warning Zone';
      badgeText = 'Phase: Deceleration';
      color = '#f97316'; // Orange
      desc = 'Second derivative flipped negative. Multiple deceleration dips and velocity drag indicate impending reversal risk.';
      badgeClass = 'Cautionary State';
    } else {
      title = 'Bearish Breakdown / Critical';
      badgeText = 'Phase: Contraction';
      color = 'var(--error)';
      desc = 'Severe downside volatility or multiple acute anomalies detected. Substantial momentum breakdown requiring immediate risk mitigation.';
      badgeClass = 'Critical Downside';
    }

    gaugeCircleBar.style.stroke = color;
    gaugeScoreText.style.color = color;
    gaugeStatusTitle.textContent = title;
    gaugeStatusBadge.textContent = badgeText;
    gaugeDescription.textContent = desc;
    regimeBadge.textContent = badgeClass;
    regimeBadge.style.color = color;
  }

  // --- Render Events Table ---
  function renderEventsTable(events, velocities) {
    eventsTableBody.innerHTML = '';

    if (events.length === 0) {
      eventsTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-tertiary); padding: 1.5rem;">No significant inflection events detected with current sensitivity settings.</td></tr>';
      return;
    }

    events.forEach(ev => {
      const item = dataPoints[ev.index];
      const vel = velocities[ev.index];
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td><strong style="color: var(--text-primary);">${item.label}</strong> (t=${ev.index + 1})</td>
        <td><strong>${formatNumber(item.value, 0)}</strong></td>
        <td>
          <span class="event-badge ${ev.classBadge}">
            <span>${ev.icon}</span>
            <span>${ev.title}</span>
          </span>
        </td>
        <td style="color: ${vel >= 0 ? 'var(--success)' : 'var(--error)'}; font-weight: 600;">
          ${vel >= 0 ? '+' : ''}${formatNumber(vel, 0)}
        </td>
        <td style="color: var(--text-secondary); font-size: 0.8rem;">${ev.desc}</td>
      `;
      eventsTableBody.appendChild(tr);
    });
  }

  // --- AI Strategic Diagnosis Generation ---
  function renderAIDiagnosis(analysis) {
    const { score, anomalies, spikes, dips, plateaus, inflections, details } = analysis;
    const lastPoint = dataPoints[dataPoints.length - 1];

    let strategicSteps = '';
    if (score >= 75) {
      strategicSteps = `
        1. <strong>Capitalize on Acceleration:</strong> Positive curvature suggests high market elasticity. Scale operational resources to capture current momentum.<br>
        2. <strong>Watch for Saturation Inflection:</strong> Monitor deceleration indicators to preemptively spot the transition from expansion to plateau.<br>
        3. <strong>Confidence Bounds:</strong> Regression forecasts can safely project forward with tight error tolerances.
      `;
    } else if (score >= 45) {
      strategicSteps = `
        1. <strong>Catalyst Required for Breakout:</strong> Plateau or consolidation indicates growth saturation. Launch new marketing or product enhancements to spark the next curve.<br>
        2. <strong>Prune Inefficient Channels:</strong> Reallocate spend from stagnant segments into higher velocity initiatives.<br>
        3. <strong>Tighten Monitoring:</strong> Range-bound states typically precede sharp inflection breakouts (upward or downward).
      `;
    } else {
      strategicSteps = `
        1. <strong>Immediate Root-Cause Investigation:</strong> Deceleration dips and detected outliers point to systemic friction, churn spikes, or data recording errors.<br>
        2. <strong>Downside Hedging:</strong> Implement conservative inventory or financial buffers until trend velocity stabilizes above zero.<br>
        3. <strong>Isolate Anomaly Periods:</strong> Filter out anomalous outlier records when running standard statistical models to avoid skewed baseline forecasts.
      `;
    }

    aiDiagnosisContent.innerHTML = `
      <div style="margin-bottom: 0.85rem;">
        <strong>Algorithmic Executive Assessment:</strong> Current series registers a Trend Momentum Score of <span style="font-weight: 800; color: var(--accent);">${score}/100</span>.
        Across <strong>${dataPoints.length} observed periods</strong>, the algorithmic engine identified 
        <strong>${spikes.length} acceleration spikes</strong>, <strong>${dips.length} deceleration dips</strong>, 
        <strong>${plateaus.length} consolidation plateaus</strong>, and <strong>${anomalies.length} statistical anomalies</strong>.
      </div>
      <div>
        <strong>Prescriptive Action Strategy:</strong>
        <div style="margin-top: 0.4rem; padding-left: 0.5rem; border-left: 2px solid var(--accent);">
          ${strategicSteps}
        </div>
      </div>
    `;
  }

  // --- Interactive Multi-Layer SVG Visualizer ---
  function renderSVG(dataPoints, events, velocities) {
    const n = dataPoints.length;
    const width = 800;
    const height = 400;

    const margin = { top: 35, right: 35, bottom: 45, left: 75 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    // Top Pane: Series Curve (70%) | Bottom Pane: Velocity Oscillator (25%)
    const topHeight = plotHeight * 0.68;
    const botHeight = plotHeight * 0.24;
    const gap = plotHeight * 0.08;

    const vals = dataPoints.map(d => d.value);
    const minVal = Math.min(...vals);
    const maxVal = Math.max(...vals);
    const padVal = (maxVal - minVal) * 0.12 || 10;
    const yValMin = Math.max(0, minVal - padVal);
    const yValMax = maxVal + padVal;

    // Velocity bounds
    const maxAbsVel = Math.max(10, Math.ceil(Math.max(...velocities.map(Math.abs)) * 1.2));

    function getX(i) {
      return margin.left + (i / Math.max(1, n - 1)) * plotWidth;
    }

    function getYVal(val) {
      const pct = (val - yValMin) / (yValMax - yValMin || 1);
      return margin.top + topHeight - pct * topHeight;
    }

    function getYVel(v) {
      const botTop = margin.top + topHeight + gap;
      const zeroY = botTop + botHeight / 2;
      return zeroY - (v / maxAbsVel) * (botHeight / 2);
    }

    let svgHtml = '';

    // --- TOP PANE: VALUE CURVE & EVENTS ---
    // Gridlines
    for (let s = 0; s <= 4; s++) {
      const val = yValMin + ((yValMax - yValMin) / 4) * s;
      const yPos = getYVal(val);
      svgHtml += `
        <line x1="${margin.left}" y1="${yPos}" x2="${width - margin.right}" y2="${yPos}" stroke="var(--border)" stroke-dasharray="3,3" opacity="0.6" />
        <text x="${margin.left - 10}" y="${yPos + 4}" fill="var(--text-tertiary)" font-size="10" text-anchor="end">${formatNumber(val, 0)}</text>
      `;
    }

    // Gradient Fill Area
    let areaD = `M ${getX(0)} ${getYVal(vals[0])} `;
    let lineD = `M ${getX(0)} ${getYVal(vals[0])} `;
    for (let i = 1; i < n; i++) {
      const ptX = getX(i);
      const ptY = getYVal(vals[i]);
      areaD += `L ${ptX} ${ptY} `;
      lineD += `L ${ptX} ${ptY} `;
    }
    areaD += `L ${getX(n - 1)} ${margin.top + topHeight} L ${getX(0)} ${margin.top + topHeight} Z`;

    svgHtml += `
      <defs>
        <linearGradient id="aiAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.0" />
        </linearGradient>
      </defs>
      <path d="${areaD}" fill="url(#aiAreaGrad)" />
      <path d="${lineD}" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    `;

    // Map events by index for fast lookup
    const eventByIndex = {};
    events.forEach(e => { eventByIndex[e.index] = e; });

    // Points & Badges
    dataPoints.forEach((d, i) => {
      const ptX = getX(i);
      const ptY = getYVal(d.value);
      const ev = eventByIndex[i];

      if (ev) {
        // Highlighted event node
        svgHtml += `
          <circle cx="${ptX}" cy="${ptY}" r="7" fill="${ev.color}" opacity="0.3" />
          <circle cx="${ptX}" cy="${ptY}" r="4.5" fill="var(--bg-secondary)" stroke="${ev.color}" stroke-width="2.5" class="chart-event-node" data-idx="${i}" style="cursor: pointer;" />
        `;
      } else {
        svgHtml += `
          <circle cx="${ptX}" cy="${ptY}" r="3.5" fill="var(--bg-secondary)" stroke="#38bdf8" stroke-width="1.8" class="chart-event-node" data-idx="${i}" style="cursor: pointer;" />
        `;
      }
    });

    // --- BOTTOM PANE: MOMENTUM VELOCITY OSCILLATOR ---
    const botTop = margin.top + topHeight + gap;
    const zeroY = botTop + botHeight / 2;

    svgHtml += `
      <line x1="${margin.left}" y1="${zeroY}" x2="${width - margin.right}" y2="${zeroY}" stroke="var(--text-tertiary)" stroke-width="1.2" />
      <text x="${margin.left - 10}" y="${zeroY + 3}" fill="var(--text-tertiary)" font-size="9" text-anchor="end">Δ0</text>
      <text x="${margin.left - 10}" y="${botTop + 8}" fill="var(--text-tertiary)" font-size="9" text-anchor="end">+${formatNumber(maxAbsVel, 0)}</text>
      <text x="${margin.left - 10}" y="${botTop + botHeight - 2}" fill="var(--text-tertiary)" font-size="9" text-anchor="end">-${formatNumber(maxAbsVel, 0)}</text>
    `;

    // Velocity bars
    const barW = Math.max(3, Math.min(14, (plotWidth / n) * 0.55));
    velocities.forEach((v, i) => {
      if (i === 0) return;
      const xPos = getX(i);
      const yPos = getYVel(v);
      const isPos = v >= 0;
      const barH = Math.abs(yPos - zeroY);
      const top = isPos ? yPos : zeroY;

      svgHtml += `
        <rect x="${xPos - barW / 2}" y="${top}" width="${barW}" height="${Math.max(1, barH)}" fill="${isPos ? '#34d399' : '#f87171'}" opacity="0.8" rx="1.5" />
      `;
    });

    // X-Axis Labels
    const labelY = height - margin.bottom + 18;
    const stepLabel = n > 20 ? Math.ceil(n / 10) : 1;
    dataPoints.forEach((d, i) => {
      if (i % stepLabel === 0 || i === n - 1) {
        svgHtml += `
          <text x="${getX(i)}" y="${labelY}" fill="var(--text-tertiary)" font-size="10" text-anchor="middle" font-family="sans-serif">${d.label}</text>
        `;
      }
    });

    svg.innerHTML = svgHtml;

    // Attach Hover Tooltip
    attachChartTooltip(dataPoints, eventByIndex, velocities);
  }

  // --- Attach Chart Tooltips ---
  function attachChartTooltip(dataPoints, eventByIndex, velocities) {
    const nodes = svg.querySelectorAll('.chart-event-node');

    nodes.forEach(node => {
      node.addEventListener('mouseenter', () => {
        const idx = parseInt(node.getAttribute('data-idx'), 10);
        const item = dataPoints[idx];
        const ev = eventByIndex[idx];
        const vel = velocities[idx];

        const rect = node.getBoundingClientRect();
        const wrapRect = chartWrap.getBoundingClientRect();

        const x = rect.left - wrapRect.left + rect.width / 2;
        const y = rect.top - wrapRect.top;

        let evHtml = '';
        if (ev) {
          evHtml = `<div style="margin-top: 0.35rem; padding-top: 0.35rem; border-top: 1px solid rgba(255,255,255,0.15); color: ${ev.color}; font-weight: 700;">
            ${ev.icon} ${ev.title}: ${ev.desc}
          </div>`;
        }

        tooltip.innerHTML = `
          <div style="font-weight: 700; color: #38bdf8;">${item.label}</div>
          <div>Observed: <strong>${formatNumber(item.value, 0)}</strong></div>
          <div>Velocity (Δy): <strong style="color: ${vel >= 0 ? 'var(--success)' : 'var(--error)'};">${vel >= 0 ? '+' : ''}${formatNumber(vel, 0)}</strong></div>
          ${evHtml}
        `;

        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
        tooltip.style.opacity = '1';
      });

      node.addEventListener('mouseleave', () => {
        tooltip.style.opacity = '0';
      });
    });
  }

  // --- Render Input Table ---
  function renderSeriesTable() {
    seriesTableBody.innerHTML = '';
    dataPoints.forEach((d, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="color: var(--text-tertiary); font-size: 0.8rem;">#${idx + 1}</td>
        <td><input type="text" class="table-input cell-label" data-idx="${idx}" value="${d.label}" /></td>
        <td><input type="number" class="table-input cell-value" data-idx="${idx}" value="${d.value}" step="any" /></td>
        <td style="text-align: center;">
          <button class="btn-del-row" data-idx="${idx}" style="background:transparent; border:none; color:var(--text-tertiary); cursor:pointer; font-size:1.1rem; padding: 0.1rem 0.4rem;" title="Remove row">✕</button>
        </td>
      `;
      seriesTableBody.appendChild(tr);
    });

    seriesTableBody.querySelectorAll('.cell-label').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        dataPoints[idx].label = e.target.value.trim();
        updateAll();
      });
    });

    seriesTableBody.querySelectorAll('.cell-value').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        const val = parseFloat(e.target.value);
        dataPoints[idx].value = isNaN(val) ? 0 : val;
        updateAll();
      });
    });

    seriesTableBody.querySelectorAll('.btn-del-row').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
        dataPoints.splice(idx, 1);
        renderSeriesTable();
        updateAll();
      });
    });
  }

  function renderEmptyState() {
    eventsTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-tertiary); padding: 2rem;">Please add at least 3 data points.</td></tr>';
    svg.innerHTML = '<text x="400" y="200" fill="var(--text-tertiary)" font-size="14" text-anchor="middle">No data points available.</text>';
    kpiAnomalies.textContent = '0';
    kpiSpikes.textContent = '0';
    kpiDips.textContent = '0';
    kpiPlateaus.textContent = '0';
    kpiInflections.textContent = '0';
    gaugeScoreText.textContent = '0';
    gaugeCircleBar.style.strokeDashoffset = 251.3;
  }

  // --- Batch Raw Paste Parser ---
  function parseBatchPaste(rawText) {
    if (!rawText.trim()) return [];
    const lines = rawText.split(/\r?\n/).filter(line => line.trim().length > 0);
    const parsed = [];

    lines.forEach((line, idx) => {
      const parts = line.split(/[,\t;:]/).map(p => p.trim());
      if (parts.length >= 2) {
        const label = parts[0];
        const val = parseFloat(parts[1].replace(/[\$, ]/g, ''));
        if (!isNaN(val)) parsed.push({ label, value: val });
      } else if (parts.length === 1) {
        const val = parseFloat(parts[0].replace(/[\$, ]/g, ''));
        if (!isNaN(val)) parsed.push({ label: `T${idx + 1}`, value: val });
      }
    });

    return parsed;
  }

  // --- Export Events CSV ---
  function exportEventsCSV() {
    if (dataPoints.length === 0) return;
    const analysis = analyzeTrendEvents(dataPoints, sensitivityThreshold);
    let csv = 'Period,Value,Event_Type,Velocity_Delta,Diagnosis_Description\r\n';

    analysis.events.forEach(ev => {
      const d = dataPoints[ev.index];
      const vel = analysis.velocities[ev.index];
      csv += `"${d.label}",${d.value},"${ev.title}",${vel},"${ev.desc}"\r\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'trend_inflection_events.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // --- Copy Diagnostics Summary ---
  function copyDiagnosticsReport() {
    const score = gaugeScoreText.textContent;
    const status = gaugeStatusTitle.textContent;
    const text = `AI TREND INFLECTION DIAGNOSTICS REPORT\n------------------------------------------------\nMomentum Score: ${score}/100 (${status})\nDetected Anomalies: ${kpiAnomalies.textContent}\nAcceleration Spikes: ${kpiSpikes.textContent}\nDeceleration Dips: ${kpiDips.textContent}\nPlateau Intervals: ${kpiPlateaus.textContent}\nInflections: ${kpiInflections.textContent}\n\nGenerated via ALL-IN-ONE AI Trend Detection`;

    navigator.clipboard.writeText(text).then(() => {
      btnCopyDiag.textContent = 'Copied!';
      setTimeout(() => {
        btnCopyDiag.innerHTML = `
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          Copy Diagnostics
        `;
      }, 2000);
    });
  }

  // --- Event Listeners Setup ---
  sensitivitySlider.addEventListener('input', (e) => {
    sensitivityThreshold = parseFloat(e.target.value);
    let label = 'Normal (2.0σ)';
    if (sensitivityThreshold <= 1.4) label = 'Aggressive (1.4σ)';
    else if (sensitivityThreshold >= 2.6) label = 'Conservative (2.6σ)';
    sensitivityLbl.textContent = `${label}`;
    updateAll();
  });

  // Filter Checkbox Listeners
  filterAnomalies.addEventListener('change', (e) => { activeFilters.anomalies = e.target.checked; updateAll(); });
  filterSpikes.addEventListener('change', (e) => { activeFilters.spikes = e.target.checked; updateAll(); });
  filterDips.addEventListener('change', (e) => { activeFilters.dips = e.target.checked; updateAll(); });
  filterPlateaus.addEventListener('change', (e) => { activeFilters.plateaus = e.target.checked; updateAll(); });
  filterInflections.addEventListener('change', (e) => { activeFilters.inflections = e.target.checked; updateAll(); });

  // Presets
  function setPreset(key, btn) {
    [presetAdoptBtn, presetChurnBtn, presetCycleBtn, presetOutageBtn].forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    dataPoints = JSON.parse(JSON.stringify(PRESETS[key]));
    renderSeriesTable();
    updateAll();
  }

  presetAdoptBtn.addEventListener('click', () => setPreset('adoption', presetAdoptBtn));
  presetChurnBtn.addEventListener('click', () => setPreset('churn', presetChurnBtn));
  presetCycleBtn.addEventListener('click', () => setPreset('cycle', presetCycleBtn));
  presetOutageBtn.addEventListener('click', () => setPreset('outage', presetOutageBtn));

  btnAddRow.addEventListener('click', () => {
    const lastLabel = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].label : 'T0';
    const lastVal = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].value : 1000;
    dataPoints.push({ label: `${lastLabel}+1`, value: Math.round(lastVal * 1.05) });
    renderSeriesTable();
    updateAll();
  });

  btnClearData.addEventListener('click', () => {
    dataPoints = [];
    renderSeriesTable();
    updateAll();
  });

  btnResetPreset.addEventListener('click', () => {
    setPreset('adoption', presetAdoptBtn);
  });

  // Table vs Paste
  tabTableBtn.addEventListener('click', () => {
    tabTableBtn.classList.add('active');
    tabPasteBtn.classList.remove('active');
    viewTable.classList.remove('hidden');
    viewPaste.classList.add('hidden');
  });

  tabPasteBtn.addEventListener('click', () => {
    tabPasteBtn.classList.add('active');
    tabTableBtn.classList.remove('active');
    viewPaste.classList.remove('hidden');
    viewTable.classList.add('hidden');
    rawPasteInput.value = dataPoints.map(d => `${d.label}, ${d.value}`).join('\n');
  });

  btnApplyPaste.addEventListener('click', () => {
    const parsed = parseBatchPaste(rawPasteInput.value);
    if (parsed.length >= 3) {
      dataPoints = parsed;
      renderSeriesTable();
      updateAll();
      tabTableBtn.click();
    } else {
      alert('Please provide at least 3 valid lines in the format: Label, Value');
    }
  });

  // Actions
  btnExportEvents.addEventListener('click', exportEventsCSV);
  btnCopyDiag.addEventListener('click', copyDiagnosticsReport);

  // Initialize
  renderSeriesTable();
  updateAll();
});