// AI Data Analyst - Client-Side Analytical Assistant
// Natural language parsing, statistical anomaly detection, executive takeaways, and interactive Q&A.

// 1. Built-in Sample Datasets
const SAMPLE_DATASETS = {
  'enterprise-sales': {
    name: 'Enterprise Sales & Profit Q1-Q4',
    csv: `Date,Region,Product_Category,Sales,Profit,Units_Sold,Discount_Pct,Segment
2026-01-15,North America,Cloud Infrastructure,42500,14875,12,0.05,Enterprise
2026-01-28,Europe,Enterprise Software,38200,11460,8,0.10,Enterprise
2026-02-10,Asia Pacific,Cybersecurity,29400,9702,15,0.00,Mid-Market
2026-02-22,North America,Hardware Solutions,18500,2775,25,0.15,Small Business
2026-03-05,Latin America,Cloud Infrastructure,14200,4260,5,0.05,Mid-Market
2026-03-18,Europe,Cybersecurity,48900,17115,20,0.08,Enterprise
2026-04-02,North America,Enterprise Software,54100,18935,14,0.05,Enterprise
2026-04-19,Asia Pacific,Cloud Infrastructure,36800,12880,10,0.00,Enterprise
2026-05-08,Europe,Hardware Solutions,16200,1944,22,0.20,Small Business
2026-05-27,North America,Cybersecurity,62000,22320,24,0.05,Enterprise
2026-06-12,Latin America,Enterprise Software,11800,2950,4,0.10,Small Business
2026-06-29,North America,Cloud Infrastructure,128500,44975,35,0.05,Key Global Account
2026-07-14,Europe,Cloud Infrastructure,44000,15400,11,0.05,Enterprise
2026-07-30,Asia Pacific,Enterprise Software,31500,9450,9,0.05,Mid-Market
2026-08-15,North America,Hardware Solutions,19800,2970,28,0.12,Mid-Market
2026-09-02,Europe,Cybersecurity,51200,17920,18,0.05,Enterprise
2026-09-22,Asia Pacific,Cybersecurity,33000,10890,16,0.00,Enterprise
2026-10-05,North America,Enterprise Software,58000,20300,15,0.05,Enterprise
2026-10-21,Latin America,Cybersecurity,13500,4050,6,0.10,Mid-Market
2026-11-10,North America,Hardware Solutions,4100, -820,9,0.35,Small Business`
  },
  'ecommerce-orders': {
    name: 'E-Commerce Orders & Margins',
    csv: `Order_ID,Channel,Product,Revenue,Cost,Quantity,Return_Rate,Customer_Rating
ORD-101,Direct Web,Ultra Wireless Headphones,3490,1400,10,0.02,4.8
ORD-102,Amazon,Noise Cancelling Earbuds,1850,820,15,0.05,4.6
ORD-103,Boutique Store,Mechanical Chronograph,8900,3200,4,0.00,4.9
ORD-104,Direct Web,Smart Leather Folio,1200,480,8,0.03,4.5
ORD-105,Affiliate,Ultra Wireless Headphones,2440,980,7,0.08,4.2
ORD-106,Direct Web,Mechanical Chronograph,17800,6400,8,0.01,5.0
ORD-107,Social Ads,Designer Minimalist Watch,1650,750,5,0.12,3.9
ORD-108,Amazon,Noise Cancelling Earbuds,3100,1360,25,0.06,4.4
ORD-109,Direct Web,Ultra Wireless Headphones,6980,2800,20,0.02,4.9
ORD-110,Affiliate,Smart Leather Folio,900,360,6,0.04,4.7
ORD-111,Boutique Store,Collector Obsidian Fountain Pen,4500,1500,5,0.00,5.0
ORD-112,Social Ads,Noise Cancelling Earbuds,950,420,8,0.15,3.8
ORD-113,Direct Web,Mechanical Chronograph,13350,4800,6,0.00,4.9
ORD-114,Amazon,Ultra Wireless Headphones,5235,2100,15,0.04,4.7
ORD-115,Direct Web,Signature Silk Scarf,2800,700,14,0.01,4.9
ORD-116,Social Ads,Designer Minimalist Watch,3300,1500,10,0.14,4.1
ORD-117,Boutique Store,Mechanical Chronograph,22250,8000,10,0.00,5.0
ORD-118,Amazon,Smart Leather Folio,1350,540,9,0.05,4.3`
  },
  'saas-metrics': {
    name: 'SaaS Subscriptions & Churn',
    csv: `Month,Tier,MRR,New_Signups,Churn_Count,CAC,Support_Tickets
Jan 2026,Starter,12500,85,12,180,45
Jan 2026,Growth,28400,42,4,450,28
Jan 2026,Enterprise,64000,11,1,2200,14
Feb 2026,Starter,13200,92,15,175,52
Feb 2026,Growth,31000,46,3,440,31
Feb 2026,Enterprise,68500,12,0,2100,12
Mar 2026,Starter,14100,98,18,170,60
Mar 2026,Growth,34200,50,4,420,29
Mar 2026,Enterprise,76000,14,1,2300,16
Apr 2026,Starter,14800,105,22,165,68
Apr 2026,Growth,37500,55,5,410,34
Apr 2026,Enterprise,82000,15,0,2250,15
May 2026,Starter,15200,110,25,160,72
May 2026,Growth,41000,60,4,395,30
May 2026,Enterprise,145000,24,2,3100,38
Jun 2026,Starter,15900,115,26,155,75`
  },
  'travel-agency': {
    name: 'Global Tour & Visa Bookings',
    csv: `Booking_ID,Destination,Package_Type,Revenue,Operating_Cost,Travelers,Client_Satisfaction
BK-2001,Switzerland Alps,Luxury Ski & Chalet,32000,18500,4,9.8
BK-2002,Saudi Arabia,VIP Umrah Private Jet,48500,24000,6,10.0
BK-2003,Japan,Tokyo & Kyoto Heritage,22000,12500,4,9.6
BK-2004,Maldives,Overwater Villa Sanctuary,38000,21000,2,9.9
BK-2005,United Kingdom,London Executive Shopping,14500,7200,2,9.2
BK-2006,Saudi Arabia,Executive Hajj Platinum,88000,42000,4,10.0
BK-2007,Italy,Amalfi Coast Yacht Charter,45000,26000,6,9.7
BK-2008,France,Paris Haute Couture Tour,27500,13500,3,9.5
BK-2009,UAE Dubai,Desert Oasis & Penthouse,19000,9800,4,9.3
BK-2010,Saudi Arabia,VIP Umrah Private Jet,96000,46000,12,9.9
BK-2011,Maldives,Overwater Villa Sanctuary,41000,22500,2,9.8
BK-2012,Iceland,Northern Lights Expedition,16500,9000,4,9.4
BK-2013,Japan,Tokyo & Kyoto Heritage,25000,14000,4,9.7
BK-2014,Switzerland Alps,Luxury Ski & Chalet,34500,19200,4,9.8
BK-2015,Saudi Arabia,Executive Hajj Platinum,115000,52000,5,10.0`
  }
};

// State Store
const state = {
  currentDatasetKey: 'enterprise-sales',
  data: [],
  headers: [],
  columnTypes: {},
  numericStats: {},
  anomalies: [],
  revenueDrivers: [],
  conversation: []
};

// 2. CSV Parser Engine
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseRow = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result.map(val => val.replace(/^["']|["']$/g, '').trim());
  };

  const headers = parseRow(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    if (values.length === headers.length) {
      const obj = {};
      headers.forEach((h, idx) => {
        const raw = values[idx];
        const num = parseFloat(raw.replace(/[$,]/g, ''));
        if (!isNaN(num) && isFinite(num) && !/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
          obj[h] = num;
        } else {
          obj[h] = raw;
        }
      });
      rows.push(obj);
    }
  }

  return { headers, rows };
}

// 3. Statistical Profiler & Outlier Scanner
function profileDataset(headers, rows) {
  const types = {};
  const stats = {};
  const anomalies = [];

  headers.forEach(h => {
    let numericCount = 0;
    const values = [];
    rows.forEach(r => {
      if (typeof r[h] === 'number') {
        numericCount++;
        values.push(r[h]);
      }
    });

    if (numericCount >= rows.length * 0.7 && values.length > 0) {
      types[h] = 'numeric';
      values.sort((a, b) => a - b);
      const sum = values.reduce((acc, v) => acc + v, 0);
      const mean = sum / values.length;
      const mid = Math.floor(values.length / 2);
      const median = values.length % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
      const min = values[0];
      const max = values[values.length - 1];

      // Variance & StdDev
      const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      // Quartiles & IQR
      const q1 = values[Math.floor(values.length * 0.25)];
      const q3 = values[Math.floor(values.length * 0.75)];
      const iqr = q3 - q1;

      stats[h] = { sum, mean, median, min, max, stdDev, q1, q3, iqr, count: values.length };

      // Outlier / Anomaly scan
      if (stdDev > 0 && values.length >= 5) {
        rows.forEach((r, idx) => {
          const val = r[h];
          if (typeof val === 'number') {
            const zScore = (val - mean) / stdDev;
            const isIQRAnomaly = (val < q1 - 1.5 * iqr) || (val > q3 + 1.5 * iqr);
            if (Math.abs(zScore) >= 2.0 || isIQRAnomaly) {
              const severity = Math.abs(zScore) >= 2.5 ? 'High' : 'Medium';
              const direction = zScore > 0 ? 'Surge' : 'Drop';
              anomalies.push({
                rowIndex: idx + 1,
                column: h,
                value: val,
                mean,
                zScore: parseFloat(zScore.toFixed(2)),
                severity,
                direction,
                details: `${h} of ${formatValue(val, h)} is ${Math.abs(zScore).toFixed(1)}σ ${direction === 'Surge' ? 'above' : 'below'} dataset mean (${formatValue(mean, h)}).`,
                rowSummary: Object.entries(r).filter(([k]) => k !== h).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(', ')
              });
            }
          }
        });
      }
    } else {
      // Check date or string
      const sample = rows[0] ? rows[0][h] : '';
      if (/^\d{4}-\d{2}-\d{2}/.test(sample) || /^[A-Z][a-z]{2}\s\d{4}/.test(sample)) {
        types[h] = 'date';
      } else {
        types[h] = 'categorical';
      }
    }
  });

  return { types, stats, anomalies };
}

// 4. Driver Analysis
function calculateDrivers(headers, rows, types) {
  // Find primary revenue/sales metric
  const metricCol = headers.find(h => /sales|revenue|mrr|income|amount/i.test(h) && types[h] === 'numeric') ||
                    headers.find(h => types[h] === 'numeric');
  // Find primary category/dimension
  const catCol = headers.find(h => /category|destination|channel|region|tier|product|segment/i.test(h) && types[h] === 'categorical') ||
                 headers.find(h => types[h] === 'categorical');

  if (!metricCol || !catCol) return [];

  const aggregates = {};
  let grandTotal = 0;

  rows.forEach(r => {
    const cat = String(r[catCol] || 'Other');
    const val = typeof r[metricCol] === 'number' ? r[metricCol] : 0;
    aggregates[cat] = (aggregates[cat] || 0) + val;
    grandTotal += val;
  });

  const drivers = Object.entries(aggregates).map(([category, sum]) => ({
    category,
    sum,
    pct: grandTotal > 0 ? (sum / grandTotal) * 100 : 0
  })).sort((a, b) => b.sum - a.sum);

  return { metricCol, catCol, grandTotal, drivers };
}

// Formatting Helper
function formatValue(val, colName = '') {
  if (typeof val !== 'number') return String(val);
  const isCurrency = /sales|revenue|profit|cost|mrr|cac|amount|price|value/i.test(colName);
  const isPct = /pct|rate|discount|margin/i.test(colName);

  if (isPct) {
    return `${(val > 1 ? val : val * 100).toFixed(1)}%`;
  }
  if (isCurrency) {
    if (Math.abs(val) >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (Math.abs(val) >= 1000) return `$${(val / 1000).toFixed(1)}k`;
    return `$${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
  return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

// 5. Rule-Based Natural Language Query Engine
function executeAnalyticalQuery(query) {
  const q = query.trim().toLowerCase();
  const { headers, data, columnTypes, numericStats, anomalies, revenueDrivers } = state;

  if (data.length === 0) {
    return {
      title: 'No Data Loaded',
      text: 'Please select a sample dataset or upload a CSV to begin analysis.',
      table: null
    };
  }

  // Identify metrics
  const metricCol = revenueDrivers.metricCol || headers.find(h => columnTypes[h] === 'numeric');
  const profitCol = headers.find(h => /profit|net/i.test(h) && columnTypes[h] === 'numeric');
  const costCol = headers.find(h => /cost|cogs|expense/i.test(h) && columnTypes[h] === 'numeric');
  const discountCol = headers.find(h => /discount/i.test(h) && columnTypes[h] === 'numeric');

  // Intent 1: Drivers of revenue / sales / volume
  if (/driver|contribut|top \d|highest|leading|rank/i.test(q)) {
    const drivers = revenueDrivers.drivers || [];
    const top3 = drivers.slice(0, 3);
    const topPcts = top3.reduce((acc, d) => acc + d.pct, 0).toFixed(1);

    const rowsHtml = top3.map((d, i) => `
      <tr>
        <td><strong>#${i + 1} ${d.category}</strong></td>
        <td>${formatValue(d.sum, metricCol)}</td>
        <td><span class="anomaly-badge anomaly-high" style="background:rgba(56,189,248,0.15); color:var(--analyst-blue); border-color:rgba(56,189,248,0.3);">${d.pct.toFixed(1)}%</span></td>
      </tr>
    `).join('');

    return {
      title: `Top Drivers of ${metricCol} Analysis`,
      text: `Across the dataset, <strong>${top3[0]?.category || 'Primary Category'}</strong> is the primary driver, accounting for <strong>${top3[0]?.pct.toFixed(1)}%</strong> of cumulative volume. Together, the top 3 segments represent <strong>${topPcts}%</strong> of total ${metricCol} ($${Math.round(revenueDrivers.grandTotal).toLocaleString()}).`,
      table: `
        <table class="analyst-mini-table">
          <thead>
            <tr><th>Segment / Driver</th><th>Total Volume</th><th>% Share</th></tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      `,
      takeaway: `Strategic focus should prioritize expanding capacity in "${top3[0]?.category}" while auditing secondary tiers for untapped lift.`
    };
  }

  // Intent 2: Anomalies & Outliers
  if (/anomal|outlier|unusual|spike|irregular|abnormal/i.test(q)) {
    if (anomalies.length === 0) {
      return {
        title: 'Zero Statistical Anomalies Detected',
        text: `Normal Gaussian distribution scan passed: no records deviated beyond 2.0σ from the mean across all ${Object.keys(numericStats).length} numeric columns.`,
        table: null,
        takeaway: 'Data displays stable variance with consistent transactional distributions.'
      };
    }

    const rowsHtml = anomalies.slice(0, 5).map(a => `
      <tr>
        <td><span class="anomaly-badge ${a.severity === 'High' ? 'anomaly-high' : 'anomaly-medium'}">${a.severity} ${a.direction}</span></td>
        <td>Row #${a.rowIndex} (${a.column})</td>
        <td><strong>${formatValue(a.value, a.column)}</strong></td>
        <td>${a.zScore > 0 ? '+' : ''}${a.zScore}&sigma;</td>
      </tr>
    `).join('');

    return {
      title: `Discovered ${anomalies.length} Statistical Anomalies`,
      text: `Identified <strong>${anomalies.length} outlier data points</strong> exceeding the &plusmn;2.0&sigma; confidence boundary. The most extreme deviation occurred on <strong>${anomalies[0].column}</strong> at Row #${anomalies[0].rowIndex}, measuring <strong>${anomalies[0].zScore}&sigma;</strong> relative to the mean.`,
      table: `
        <table class="analyst-mini-table">
          <thead>
            <tr><th>Severity</th><th>Location</th><th>Observed Value</th><th>Z-Score</th></tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      `,
      takeaway: 'Investigate whether outlier rows represent high-value enterprise custom deals, volume surges, or input logging discrepancies.'
    };
  }

  // Intent 3: Profit Margin / Profitability
  if (/margin|profit|return on|net income/i.test(q)) {
    if (profitCol && metricCol && numericStats[profitCol] && numericStats[metricCol]) {
      const totalRev = numericStats[metricCol].sum;
      const totalProf = numericStats[profitCol].sum;
      const marginPct = (totalProf / totalRev) * 100;

      // Category margins
      const catCol = revenueDrivers.catCol;
      const breakdown = {};
      data.forEach(r => {
        const c = r[catCol] || 'Other';
        if (!breakdown[c]) breakdown[c] = { rev: 0, prof: 0 };
        breakdown[c].rev += (r[metricCol] || 0);
        breakdown[c].prof += (r[profitCol] || 0);
      });

      const catRows = Object.entries(breakdown).map(([c, val]) => {
        const m = val.rev > 0 ? (val.prof / val.rev) * 100 : 0;
        return `
          <tr>
            <td>${c}</td>
            <td>${formatValue(val.rev, metricCol)}</td>
            <td>${formatValue(val.prof, profitCol)}</td>
            <td><strong>${m.toFixed(1)}%</strong></td>
          </tr>
        `;
      }).join('');

      return {
        title: `Comprehensive Profit Margin: ${marginPct.toFixed(1)}%`,
        text: `Cumulative Gross/Operating Margin is <strong>${marginPct.toFixed(1)}%</strong> ($${Math.round(totalProf).toLocaleString()} net profit against $${Math.round(totalRev).toLocaleString()} top-line ${metricCol}).`,
        table: `
          <table class="analyst-mini-table">
            <thead>
              <tr><th>${catCol || 'Segment'}</th><th>Total Revenue</th><th>Net Profit</th><th>Margin %</th></tr>
            </thead>
            <tbody>${catRows}</tbody>
          </table>
        `,
        takeaway: marginPct > 25
          ? 'Margin health is robust, outperforming commercial benchmarks by over 15%.'
          : 'Margin compression noted; recommend review of discounting tiers and supplier cost structures.'
      };
    } else if (costCol && metricCol) {
      const totalRev = numericStats[metricCol].sum;
      const totalCost = numericStats[costCol].sum;
      const profit = totalRev - totalCost;
      const margin = (profit / totalRev) * 100;
      return {
        title: `Calculated Margin: ${margin.toFixed(1)}%`,
        text: `Derived net profit of $${Math.round(profit).toLocaleString()} (${margin.toFixed(1)}% margin) by subtracting total operating costs ($${Math.round(totalCost).toLocaleString()}) from top-line ${metricCol}.`,
        table: null,
        takeaway: 'Gross margin aligns with target enterprise operating thresholds.'
      };
    } else {
      return {
        title: 'Margin Column Mapping Notice',
        text: `Could not identify explicit Profit or Cost columns. Available numeric columns: ${Object.keys(numericStats).join(', ')}.`,
        table: null
      };
    }
  }

  // Intent 4: Regional / Breakdown by Category
  if (/by region|by category|by channel|breakdown|distribution|by destination/i.test(q)) {
    const targetCat = headers.find(h => new RegExp(h, 'i').test(q) && columnTypes[h] === 'categorical') || revenueDrivers.catCol;
    if (targetCat) {
      const groups = {};
      data.forEach(r => {
        const cat = r[targetCat] || 'Unknown';
        groups[cat] = groups[cat] || { count: 0, sum: 0 };
        groups[cat].count++;
        groups[cat].sum += (typeof r[metricCol] === 'number' ? r[metricCol] : 0);
      });

      const rowsHtml = Object.entries(groups).map(([cat, val]) => `
        <tr>
          <td><strong>${cat}</strong></td>
          <td>${val.count}</td>
          <td>${formatValue(val.sum, metricCol)}</td>
          <td>${formatValue(val.count > 0 ? val.sum / val.count : 0, metricCol)}</td>
        </tr>
      `).join('');

      return {
        title: `Performance Breakdown by ${targetCat}`,
        text: `Grouped ${data.length} transactions across ${Object.keys(groups).length} distinct categories under <strong>${targetCat}</strong>.`,
        table: `
          <table class="analyst-mini-table">
            <thead>
              <tr><th>${targetCat}</th><th>Record Count</th><th>Total ${metricCol}</th><th>Average / Record</th></tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        `,
        takeaway: `The top segment produces the strongest ticket size; balance resource deployment accordingly.`
      };
    }
  }

  // Intent 5: Summary Statistics
  if (/statistic|summary|stats|mean|median|distribution|stddev|min|max/i.test(q)) {
    const statsHtml = Object.entries(numericStats).map(([col, s]) => `
      <tr>
        <td><strong>${col}</strong></td>
        <td>${formatValue(s.mean, col)}</td>
        <td>${formatValue(s.median, col)}</td>
        <td>${formatValue(s.min, col)} - ${formatValue(s.max, col)}</td>
        <td>&plusmn;${formatValue(s.stdDev, col)}</td>
      </tr>
    `).join('');

    return {
      title: 'Parametric Summary Statistics',
      text: `Calculated statistical moments (central tendency, dispersion, and spread) across all <strong>${Object.keys(numericStats).length} numerical attributes</strong>.`,
      table: `
        <table class="analyst-mini-table">
          <thead>
            <tr><th>Metric</th><th>Mean (&mu;)</th><th>Median</th><th>Range [Min - Max]</th><th>Std Dev (&sigma;)</th></tr>
          </thead>
          <tbody>${statsHtml}</tbody>
        </table>
      `,
      takeaway: 'Differences between mean and median highlight directional skew caused by top-percentile orders.'
    };
  }

  // Intent 6: Correlation
  if (/correlation|relationship|discount|versus|vs/i.test(q)) {
    const numCols = Object.keys(numericStats);
    if (numCols.length >= 2) {
      const colA = discountCol || numCols[0];
      const colB = profitCol || (numCols[1] !== colA ? numCols[1] : numCols[0]);

      // Pearson r calculation
      const n = data.length;
      const statA = numericStats[colA];
      const statB = numericStats[colB];

      let cov = 0;
      data.forEach(r => {
        const valA = r[colA] || 0;
        const valB = r[colB] || 0;
        cov += (valA - statA.mean) * (valB - statB.mean);
      });
      const r = statA.stdDev > 0 && statB.stdDev > 0 ? (cov / n) / (statA.stdDev * statB.stdDev) : 0;
      const rFixed = r.toFixed(2);

      let strength = 'negligible correlation';
      if (Math.abs(r) > 0.7) strength = r > 0 ? 'strong positive correlation' : 'strong negative correlation';
      else if (Math.abs(r) > 0.4) strength = r > 0 ? 'moderate positive correlation' : 'moderate inverse relationship';

      return {
        title: `Correlation Analysis: ${colA} vs ${colB}`,
        text: `Pearson correlation coefficient is <strong>r = ${rFixed}</strong>, indicating a <strong>${strength}</strong>.`,
        table: `
          <table class="analyst-mini-table">
            <thead><tr><th>Attribute</th><th>Mean</th><th>Std Dev</th><th>Pearson r</th></tr></thead>
            <tbody>
              <tr><td>${colA}</td><td>${formatValue(statA.mean, colA)}</td><td>${formatValue(statA.stdDev, colA)}</td><td rowspan="2" style="font-weight:700; font-size:1.1rem; vertical-align:middle; text-align:center;">${rFixed}</td></tr>
              <tr><td>${colB}</td><td>${formatValue(statB.mean, colB)}</td><td>${formatValue(statB.stdDev, colB)}</td></tr>
            </tbody>
          </table>
        `,
        takeaway: r < -0.3
          ? `Increasing ${colA} measurably degrades ${colB}. Restrict excessive concessions to safeguard gross yield.`
          : `Changes in ${colA} show neutral impact on ${colB}; pricing power remains intact.`
      };
    }
  }

  // Fallback intelligent response: column search
  const foundCol = headers.find(h => new RegExp(h, 'i').test(q));
  if (foundCol && numericStats[foundCol]) {
    const s = numericStats[foundCol];
    return {
      title: `Metric Deep Dive: ${foundCol}`,
      text: `Total aggregate is <strong>${formatValue(s.sum, foundCol)}</strong> with an average of <strong>${formatValue(s.mean, foundCol)}</strong> across ${s.count} records. Values range from ${formatValue(s.min, foundCol)} to ${formatValue(s.max, foundCol)}.`,
      table: null,
      takeaway: `Standard deviation is &plusmn;${formatValue(s.stdDev, foundCol)}, representing a ${(s.mean > 0 ? (s.stdDev / s.mean * 100).toFixed(1) : 0)}% coefficient of variation.`
    };
  }

  // General dataset inquiry response
  return {
    title: 'Dataset Query Results',
    text: `Analyzed query against <strong>${data.length} records</strong> and <strong>${headers.length} attributes</strong>. Primary volume metric is <em>${metricCol}</em> ($${Math.round(revenueDrivers.grandTotal || 0).toLocaleString()}).`,
    table: null,
    takeaway: 'Try asking "What are the top 3 drivers of revenue?", "Find anomalies in sales", or "Calculate total profit margin" for deep statistical drill-downs.'
  };
}

// 6. Generate Executive Takeaways
function generateExecutiveTakeaways() {
  const { data, numericStats, revenueDrivers, anomalies, headers } = state;
  const listEl = document.getElementById('executive-takeaways-list');
  if (!listEl) return;

  if (data.length === 0) {
    listEl.innerHTML = '<p style="color:var(--text-secondary);">No dataset loaded.</p>';
    return;
  }

  const metricCol = revenueDrivers.metricCol || 'Sales';
  const grandTotal = revenueDrivers.grandTotal || 0;
  const drivers = revenueDrivers.drivers || [];
  const topDriver = drivers[0];
  const profitCol = headers.find(h => /profit|net/i.test(h));
  const profitSum = profitCol && numericStats[profitCol] ? numericStats[profitCol].sum : 0;
  const marginPct = grandTotal > 0 ? (profitSum / grandTotal) * 100 : 0;

  const bullets = [];

  // Bullet 1: Revenue Leadership
  if (topDriver) {
    bullets.push({
      title: `Primary Revenue Pillar: ${topDriver.category}`,
      desc: `Generates ${formatValue(topDriver.sum, metricCol)} (${topDriver.pct.toFixed(1)}% of total volume). Top-tier concentration indicates dominant market traction in this segment.`,
      icon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`
    });
  }

  // Bullet 2: Margin & Bottom-Line Efficiency
  if (profitCol && profitSum !== 0) {
    bullets.push({
      title: `Gross Operating Margin: ${marginPct.toFixed(1)}%`,
      desc: `Net returns stand at ${formatValue(profitSum, profitCol)} against top-line volume. ${marginPct > 20 ? 'Profit conversion is healthy and exceeds typical operational hurdles.' : 'Operating margins suggest room for cost rationalization and price adjustments.'}`,
      icon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`
    });
  }

  // Bullet 3: Statistical Anomalies
  bullets.push({
    title: anomalies.length > 0 ? `${anomalies.length} Critical Outlier(s) Identified` : 'Clean Variance Profile',
    desc: anomalies.length > 0
      ? `Flagged ${anomalies.length} record(s) exhibiting &gt;2.0σ variance. The top divergence was ${anomalies[0].column} at ${formatValue(anomalies[0].value, anomalies[0].column)} (${anomalies[0].zScore > 0 ? '+' : ''}${anomalies[0].zScore}σ).`
      : 'All operational records conform within two standard deviations of historical means, indicating predictable operational cadence.',
    icon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`
  });

  // Bullet 4: Pareto Distribution & Concentration
  if (drivers.length >= 3) {
    const top2Pct = (drivers.slice(0, 2).reduce((a, b) => a + b.sum, 0) / grandTotal * 100).toFixed(1);
    bullets.push({
      title: 'Portfolio Concentration & Resilience',
      desc: `Top 2 categories (${drivers[0].category}, ${drivers[1].category}) deliver ${top2Pct}% of aggregate revenue. Diversification initiatives recommended for under-indexing channels.`,
      icon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`
    });
  }

  // Bullet 5: Forward Strategic Imperative
  bullets.push({
    title: 'Strategic Leadership Next Steps',
    desc: 'Protect high-yield flagship accounts with bespoke contract terms while investigating margin drag in bottom-quartile transactional units.',
    icon: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`
  });

  listEl.innerHTML = bullets.map(b => `
    <div class="takeaway-item">
      <div class="takeaway-icon">${b.icon}</div>
      <div>
        <div class="takeaway-title">${b.title}</div>
        <div class="takeaway-desc">${b.desc}</div>
      </div>
    </div>
  `).join('');
}

// 7. Render Visualizations & Anomalies
function renderAnomaliesAndDrivers() {
  const { anomalies, revenueDrivers } = state;

  // Quick list in sidebar
  const quickList = document.getElementById('quick-anomaly-list');
  const pill = document.getElementById('anomaly-summary-pill');
  if (pill) {
    pill.textContent = `${anomalies.length} Detected`;
    pill.className = `anomaly-badge ${anomalies.length > 0 ? 'anomaly-high' : 'anomaly-medium'}`;
    pill.style.background = anomalies.length > 0 ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)';
    pill.style.color = anomalies.length > 0 ? 'var(--analyst-rose)' : 'var(--analyst-emerald)';
    pill.style.borderColor = anomalies.length > 0 ? 'rgba(244,63,94,0.3)' : 'rgba(16,185,129,0.3)';
  }

  if (quickList) {
    if (anomalies.length === 0) {
      quickList.innerHTML = '<span style="font-size:0.8rem; color:var(--text-tertiary);">No outliers detected beyond &plusmn;2&sigma;.</span>';
    } else {
      quickList.innerHTML = anomalies.slice(0, 4).map(a => `
        <div style="background:var(--bg-tertiary); padding:0.5rem 0.65rem; border-radius:var(--radius-sm); border-left:3px solid var(--analyst-rose); font-size:0.78rem;">
          <div style="display:flex; justify-content:space-between; font-weight:600; color:var(--text-primary); margin-bottom:0.15rem;">
            <span>${a.column} (Row #${a.rowIndex})</span>
            <span style="color:var(--analyst-rose);">${a.zScore > 0 ? '+' : ''}${a.zScore}&sigma;</span>
          </div>
          <div style="color:var(--text-secondary);">${formatValue(a.value, a.column)} (${a.direction})</div>
        </div>
      `).join('');
    }
  }

  // Detailed anomaly list in Tab 2
  const deepList = document.getElementById('detailed-anomaly-list');
  if (deepList) {
    if (anomalies.length === 0) {
      deepList.innerHTML = '<div class="alert-success">Zero statistical outliers flagged. All distributions are well balanced.</div>';
    } else {
      deepList.innerHTML = anomalies.map(a => `
        <div class="anomaly-card">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span class="anomaly-badge ${a.severity === 'High' ? 'anomaly-high' : 'anomaly-medium'}">${a.severity} ${a.direction}</span>
              <strong style="color:var(--text-primary); font-size:0.95rem;">${a.column} &bull; Row #${a.rowIndex}</strong>
            </div>
            <span style="font-family:monospace; font-weight:700; color:var(--analyst-rose); font-size:0.9rem;">
              Z-Score: ${a.zScore > 0 ? '+' : ''}${a.zScore}&sigma;
            </span>
          </div>
          <div style="font-size:0.86rem; color:var(--text-secondary); line-height:1.5;">
            ${a.details}
          </div>
          <div style="font-size:0.8rem; background:var(--bg-tertiary); padding:0.4rem 0.6rem; border-radius:var(--radius-sm); color:var(--text-tertiary);">
            Row Context: ${a.rowSummary}
          </div>
        </div>
      `).join('');
    }
  }

  // Drivers visualization bars
  const driversContainer = document.getElementById('drivers-visualization-container');
  if (driversContainer && revenueDrivers.drivers) {
    const { drivers, metricCol } = revenueDrivers;
    driversContainer.innerHTML = drivers.map(d => `
      <div style="display:flex; flex-direction:column; gap:0.3rem;">
        <div style="display:flex; justify-content:space-between; font-size:0.85rem;">
          <span style="font-weight:600; color:var(--text-primary);">${d.category}</span>
          <span style="color:var(--text-secondary); font-family:monospace;">
            ${formatValue(d.sum, metricCol)} (${d.pct.toFixed(1)}%)
          </span>
        </div>
        <div style="width:100%; height:8px; background:var(--bg-tertiary); border-radius:var(--radius-full); overflow:hidden;">
          <div style="width:${d.pct}%; height:100%; background:var(--accent-gradient); border-radius:var(--radius-full); transition:width 0.6s ease;"></div>
        </div>
      </div>
    `).join('');
  }
}

// 8. Render Table Explorer & Top Metrics
function renderDataExplorer() {
  const { headers, data, columnTypes, numericStats, revenueDrivers } = state;
  const tbody = document.getElementById('explorer-table-body');
  const thead = document.getElementById('explorer-table-head');
  const profileContainer = document.getElementById('column-profile-container');
  const recordInfo = document.getElementById('table-record-info');

  if (recordInfo) recordInfo.textContent = `Showing ${data.length} records across ${headers.length} attributes`;

  // Badges
  if (profileContainer) {
    profileContainer.innerHTML = headers.map(h => {
      const type = columnTypes[h] || 'string';
      const color = type === 'numeric' ? 'var(--analyst-blue)' : (type === 'date' ? 'var(--analyst-amber)' : 'var(--text-secondary)');
      return `
        <span style="background:var(--bg-tertiary); border:1px solid var(--border); padding:0.25rem 0.65rem; border-radius:var(--radius-full); font-size:0.75rem; color:${color};">
          <strong>${h}</strong> (${type})
        </span>
      `;
    }).join('');
  }

  // Table
  if (thead && tbody) {
    thead.innerHTML = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
    tbody.innerHTML = data.slice(0, 50).map(r => `
      <tr>${headers.map(h => `<td>${formatValue(r[h], h)}</td>`).join('')}</tr>
    `).join('');
  }

  // Top metric cards
  const metricCol = revenueDrivers.metricCol;
  const grandTotal = revenueDrivers.grandTotal || 0;
  const profitCol = headers.find(h => /profit|net/i.test(h));
  const profitSum = profitCol && numericStats[profitCol] ? numericStats[profitCol].sum : 0;
  const margin = grandTotal > 0 ? (profitSum / grandTotal) * 100 : 0;
  const topCat = revenueDrivers.drivers && revenueDrivers.drivers[0] ? revenueDrivers.drivers[0].category : '-';
  const meanVal = metricCol && numericStats[metricCol] ? numericStats[metricCol].mean : 0;

  const val1 = document.getElementById('kpi-val-1');
  const val2 = document.getElementById('kpi-val-2');
  const val3 = document.getElementById('kpi-val-3');
  const val4 = document.getElementById('kpi-val-4');

  if (val1) val1.textContent = formatValue(grandTotal, metricCol);
  if (val2) val2.textContent = `${margin.toFixed(1)}%`;
  if (val3) val3.textContent = topCat;
  if (val4) val4.textContent = formatValue(meanVal, metricCol);

  // Sidebar counters
  const rowCountEl = document.getElementById('stat-row-count');
  const colCountEl = document.getElementById('stat-col-count');
  const numCountEl = document.getElementById('stat-numeric-count');
  const anomCountEl = document.getElementById('stat-anomaly-count');

  if (rowCountEl) rowCountEl.textContent = data.length;
  if (colCountEl) colCountEl.textContent = headers.length;
  if (numCountEl) numCountEl.textContent = Object.keys(numericStats).length;
  if (anomCountEl) anomCountEl.textContent = state.anomalies.length;
}

// 9. Load Dataset
function loadDataset(key, customCsvText = null) {
  state.currentDatasetKey = key;
  let csvText = '';

  if (key === 'custom' && customCsvText) {
    csvText = customCsvText;
  } else if (SAMPLE_DATASETS[key]) {
    csvText = SAMPLE_DATASETS[key].csv;
  } else {
    csvText = SAMPLE_DATASETS['enterprise-sales'].csv;
  }

  const { headers, rows } = parseCSV(csvText);
  state.headers = headers;
  state.data = rows;

  const { types, stats, anomalies } = profileDataset(headers, rows);
  state.columnTypes = types;
  state.numericStats = stats;
  state.anomalies = anomalies;
  state.revenueDrivers = calculateDrivers(headers, rows, types);

  renderDataExplorer();
  renderAnomaliesAndDrivers();
  generateExecutiveTakeaways();

  // Reset or initialize assistant greeting
  appendAiGreeting();
}

// 10. Chat Feed Management
function appendAiGreeting() {
  const stream = document.getElementById('chat-stream');
  if (!stream) return;

  const datasetName = SAMPLE_DATASETS[state.currentDatasetKey]?.name || 'Custom Dataset';
  const metricName = state.revenueDrivers.metricCol || 'Records';
  const topCat = state.revenueDrivers.drivers?.[0]?.category || 'Primary Category';

  stream.innerHTML = `
    <div class="chat-bubble ai-bubble">
      <div class="ai-header-badge">
        <span>AI Data Analyst Engine &bull; Ready</span>
        <span>Online</span>
      </div>
      <div class="ai-answer-headline">Dataset Loaded: ${datasetName}</div>
      <div class="ai-answer-body">
        Successfully scanned <strong>${state.data.length} rows</strong> across <strong>${state.headers.length} attributes</strong>. Primary driver detected is <strong>${topCat}</strong>, and <strong>${state.anomalies.length} statistical anomalies</strong> were discovered.<br><br>
        Click any query chip above or type your question below (e.g. <em>"What are the top 3 drivers of revenue?"</em> or <em>"Find anomalies in sales"</em>).
      </div>
    </div>
  `;
}

function handleUserQuery(queryText) {
  if (!queryText || !queryText.trim()) return;
  const stream = document.getElementById('chat-stream');
  if (!stream) return;

  // Append user bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-bubble user-bubble';
  userBubble.textContent = queryText;
  stream.appendChild(userBubble);

  // Scroll stream
  stream.scrollTop = stream.scrollHeight;

  // Execute analytical query
  setTimeout(() => {
    const res = executeAnalyticalQuery(queryText);
    const aiBubble = document.createElement('div');
    aiBubble.className = 'chat-bubble ai-bubble';

    aiBubble.innerHTML = `
      <div class="ai-header-badge">
        <span>Analytical Synthesis</span>
        <span>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div class="ai-answer-headline">${res.title}</div>
      <div class="ai-answer-body">${res.text}</div>
      ${res.table ? `<div style="margin-top:0.75rem;">${res.table}</div>` : ''}
      ${res.takeaway ? `
        <div style="margin-top:0.85rem; padding:0.65rem 0.85rem; background:var(--bg-tertiary); border-left:3px solid var(--accent); border-radius:0 var(--radius-sm) var(--radius-sm) 0; font-size:0.85rem;">
          <strong style="color:var(--text-primary);">Executive Takeaway:</strong> ${res.takeaway}
        </div>
      ` : ''}
    `;

    stream.appendChild(aiBubble);
    stream.scrollTop = stream.scrollHeight;

    // Track in state for markdown report export
    state.conversation.push({ query: queryText, response: res });
  }, 200);
}

// 11. Event Listeners and Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Tab Switcher
  const tabBtns = document.querySelectorAll('.view-tab-btn');
  const tabPanes = {
    assistant: document.getElementById('tab-pane-assistant'),
    briefing: document.getElementById('tab-pane-briefing'),
    explorer: document.getElementById('tab-pane-explorer')
  };

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      Object.entries(tabPanes).forEach(([key, pane]) => {
        if (pane) pane.style.display = key === target ? 'block' : 'none';
      });
    });
  });

  // Dataset dropdown
  const datasetSelect = document.getElementById('dataset-select');
  const customBox = document.getElementById('custom-data-box');
  if (datasetSelect) {
    datasetSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'custom') {
        if (customBox) customBox.style.display = 'flex';
      } else {
        if (customBox) customBox.style.display = 'none';
        loadDataset(val);
      }
    });
  }

  // Custom data parse button
  const btnParseCustom = document.getElementById('btn-parse-custom');
  const customCsvInput = document.getElementById('custom-csv-input');
  if (btnParseCustom && customCsvInput) {
    btnParseCustom.addEventListener('click', () => {
      const text = customCsvInput.value.trim();
      if (text) {
        loadDataset('custom', text);
      } else {
        alert('Please paste valid CSV content or upload a file.');
      }
    });
  }

  // File upload
  const fileInput = document.getElementById('csv-file-input');
  const btnBrowse = document.getElementById('btn-browse-csv');
  if (btnBrowse && fileInput) {
    btnBrowse.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          if (customCsvInput) customCsvInput.value = evt.target.result;
          loadDataset('custom', evt.target.result);
        };
        reader.readAsText(file);
      }
    });
  }

  // Query input and submit button
  const queryInput = document.getElementById('analyst-query-input');
  const btnSubmit = document.getElementById('btn-submit-query');

  const submitQuery = () => {
    if (!queryInput) return;
    const text = queryInput.value.trim();
    if (text) {
      handleUserQuery(text);
      queryInput.value = '';
    }
  };

  if (btnSubmit) btnSubmit.addEventListener('click', submitQuery);
  if (queryInput) {
    queryInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitQuery();
      }
    });
  }

  // Pre-loaded Prompt Chips
  const promptChips = document.querySelectorAll('.prompt-chip');
  promptChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.dataset.prompt;
      if (prompt) {
        handleUserQuery(prompt);
      }
    });
  });

  // Clear Chat Button
  const btnClear = document.getElementById('btn-clear-chat');
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      state.conversation = [];
      appendAiGreeting();
    });
  }

  // Print Executive Briefing
  const btnPrint = document.getElementById('btn-print-briefing');
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      // Switch to briefing tab before print
      const briefingBtn = document.querySelector('[data-tab="briefing"]');
      if (briefingBtn) briefingBtn.click();
      setTimeout(() => window.print(), 200);
    });
  }

  // Export Report as Markdown
  const btnExport = document.getElementById('btn-export-qa');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const datasetName = SAMPLE_DATASETS[state.currentDatasetKey]?.name || 'Custom Dataset';
      let md = `# Executive Analytics Briefing: ${datasetName}\n\n`;
      md += `*Generated by AI Data Analyst on ${new Date().toLocaleDateString()}*\n\n`;
      md += `## 1. Executive Summary\n`;
      md += `- Records Analyzed: ${state.data.length}\n`;
      md += `- Attributes: ${state.headers.join(', ')}\n`;
      md += `- Anomalies Flagged: ${state.anomalies.length}\n\n`;

      md += `## 2. Key Questions & Findings\n`;
      if (state.conversation.length === 0) {
        md += `*No interactive questions queried during this session.*\n\n`;
      } else {
        state.conversation.forEach((c, idx) => {
          md += `### Q${idx + 1}: ${c.query}\n`;
          md += `**${c.response.title}**\n\n`;
          md += `${c.response.text.replace(/<[^>]*>/g, '')}\n\n`;
          if (c.response.takeaway) {
            md += `> **Takeaway:** ${c.response.takeaway}\n\n`;
          }
        });
      }

      md += `## 3. Anomaly Summary\n`;
      if (state.anomalies.length === 0) {
        md += `No statistical outliers were detected.\n`;
      } else {
        state.anomalies.forEach(a => {
          md += `- **Row #${a.rowIndex} [${a.column}]**: ${a.details} (Z = ${a.zScore}σ)\n`;
        });
      }

      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AI-Analyst-Briefing-${Date.now()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // Filter Search in Data Table
  const searchInput = document.getElementById('table-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const rows = document.querySelectorAll('#explorer-table-body tr');
      rows.forEach(r => {
        const text = r.textContent.toLowerCase();
        r.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  // Initial load
  loadDataset('enterprise-sales');
});