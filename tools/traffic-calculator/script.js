// Website Traffic & Lead Generation Modeling Engine

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const btnModeRev = document.getElementById('btn-mode-revenue');
  const btnModeCust = document.getElementById('btn-mode-customers');
  const groupTargetRevenue = document.getElementById('group-target-revenue');
  const groupDealSize = document.getElementById('group-deal-size');
  const groupTargetCustomers = document.getElementById('group-target-customers');

  const inputTargetRevenue = document.getElementById('input-target-revenue');
  const inputDealSize = document.getElementById('input-deal-size');
  const inputTargetCustomers = document.getElementById('input-target-customers');

  const inputLeadCvr = document.getElementById('input-lead-cvr');
  const inputCloseRate = document.getElementById('input-close-rate');
  const inputCurrentTraffic = document.getElementById('input-current-traffic');

  const inputMixOrganic = document.getElementById('input-mix-organic');
  const inputMixPaid = document.getElementById('input-mix-paid');
  const inputMixSocial = document.getElementById('input-mix-social');
  const inputMixReferral = document.getElementById('input-mix-referral');
  const inputPaidCpc = document.getElementById('input-paid-cpc');

  // Outputs
  const valReqTraffic = document.getElementById('val-req-traffic');
  const badgeDailyTraffic = document.getElementById('badge-daily-traffic');
  const valOverallCvr = document.getElementById('val-overall-cvr');

  const valReqLeads = document.getElementById('val-req-leads');
  const valLeadsDay = document.getElementById('val-leads-day');
  const valReqDeals = document.getElementById('val-req-deals');
  const valTargetRevSub = document.getElementById('val-target-rev-sub');

  const valTrafficGap = document.getElementById('val-traffic-gap');
  const valGapSub = document.getElementById('val-gap-sub');
  const valEstAdspend = document.getElementById('val-est-adspend');
  const valAdspendSub = document.getElementById('val-adspend-sub');

  // Shortfall card
  const badgeAttainment = document.getElementById('badge-attainment');
  const progressTrafficBar = document.getElementById('progress-traffic-bar');
  const lblCurrVisitors = document.getElementById('lbl-curr-visitors');
  const lblTargetVisitors = document.getElementById('lbl-target-visitors');

  // Channel Table
  const channelTableBody = document.getElementById('channel-table-body');

  // What-If
  const sliderCvrLift = document.getElementById('slider-cvr-lift');
  const lblWhatifLift = document.getElementById('lbl-whatif-lift');
  const txtWhatifResult = document.getElementById('txt-whatif-result');

  // Action Buttons & Presets
  const btnCopy = document.getElementById('btn-copy-plan');
  const btnExport = document.getElementById('btn-export-csv');
  const presetButtons = document.querySelectorAll('.preset-chip-btn');

  let activeMode = 'revenue'; // 'revenue' or 'customers'

  const presets = {
    saas: { mode: 'revenue', rev: 50000, deal: 250, cust: 200, leadCvr: 2.5, close: 8.0, curr: 35000, cpc: 1.50, mix: [40, 30, 20, 10] },
    ecommerce: { mode: 'revenue', rev: 100000, deal: 85, cust: 1176, leadCvr: 2.8, close: 100.0, curr: 20000, cpc: 0.85, mix: [35, 45, 15, 5] },
    enterprise: { mode: 'revenue', rev: 250000, deal: 10000, cust: 25, leadCvr: 1.5, close: 15.0, curr: 12000, cpc: 4.50, mix: [50, 20, 15, 15] },
    agency: { mode: 'revenue', rev: 40000, deal: 3000, cust: 14, leadCvr: 3.0, close: 20.0, curr: 5000, cpc: 2.50, mix: [45, 25, 20, 10] }
  };

  // Formatters
  const fmtMoney = (n) => {
    if (!isFinite(n) || isNaN(n)) return '$0';
    return (n < 0 ? '-$' : '$') + Math.round(Math.abs(n)).toLocaleString('en-US');
  };
  const fmtNum = (n) => {
    if (!isFinite(n) || isNaN(n)) return '0';
    return Math.round(n).toLocaleString('en-US');
  };
  const fmtPct = (n) => {
    if (!isFinite(n) || isNaN(n)) return '0.0%';
    return n.toFixed(2) + '%';
  };

  function setMode(mode) {
    activeMode = mode;
    btnModeRev.classList.toggle('active', mode === 'revenue');
    btnModeCust.classList.toggle('active', mode === 'customers');

    if (mode === 'revenue') {
      groupTargetRevenue.style.display = 'block';
      groupDealSize.style.display = 'block';
      groupTargetCustomers.style.display = 'none';
    } else {
      groupTargetRevenue.style.display = 'none';
      groupDealSize.style.display = 'none';
      groupTargetCustomers.style.display = 'block';
    }
    calculate();
  }

  function calculate() {
    let targetCustomers = 0;
    let targetRevenue = 0;

    if (activeMode === 'revenue') {
      targetRevenue = Math.max(0, parseFloat(inputTargetRevenue.value) || 0);
      const dealSize = Math.max(1, parseFloat(inputDealSize.value) || 1);
      targetCustomers = Math.ceil(targetRevenue / dealSize);
    } else {
      targetCustomers = Math.max(1, parseFloat(inputTargetCustomers.value) || 1);
      const dealSize = Math.max(1, parseFloat(inputDealSize.value) || 1);
      targetRevenue = targetCustomers * dealSize;
    }

    const leadCvr = Math.max(0.01, parseFloat(inputLeadCvr.value) || 0.01) / 100;
    const closeRate = Math.max(0.01, parseFloat(inputCloseRate.value) || 0.01) / 100;
    const currentTraffic = Math.max(0, parseFloat(inputCurrentTraffic.value) || 0);
    const paidCpc = Math.max(0, parseFloat(inputPaidCpc.value) || 0);

    // Funnel Math
    const reqLeads = Math.ceil(targetCustomers / closeRate);
    const reqVisitors = Math.ceil(reqLeads / leadCvr);
    const dailyVisitors = Math.ceil(reqVisitors / 30);
    const dailyLeads = Math.ceil(reqLeads / 30);
    const endToEndCvr = (leadCvr * closeRate) * 100;

    // Shortfall Analysis
    const trafficDiff = currentTraffic - reqVisitors;
    const attainmentPct = reqVisitors > 0 ? Math.min(100, Math.max(0, (currentTraffic / reqVisitors) * 100)) : 100;

    // Update Highlight Cards
    valReqTraffic.textContent = fmtNum(reqVisitors);
    badgeDailyTraffic.textContent = `${fmtNum(dailyVisitors)} / day`;
    valOverallCvr.textContent = `End-to-End Funnel CVR: ${fmtPct(endToEndCvr)}`;

    valReqLeads.textContent = fmtNum(reqLeads);
    valLeadsDay.textContent = `${fmtNum(dailyLeads)} leads / day`;

    valReqDeals.textContent = fmtNum(targetCustomers);
    valTargetRevSub.textContent = `To generate ${fmtMoney(targetRevenue)}/mo`;

    if (trafficDiff < 0) {
      valTrafficGap.textContent = `-${fmtNum(Math.abs(trafficDiff))}`;
      valTrafficGap.style.color = '#ef4444';
      badgeAttainment.className = 'badge-pill danger';
      badgeAttainment.textContent = `Shortfall: -${fmtNum(Math.abs(trafficDiff))}`;
      valGapSub.textContent = `${attainmentPct.toFixed(1)}% of traffic goal reached`;
    } else {
      valTrafficGap.textContent = `+${fmtNum(trafficDiff)}`;
      valTrafficGap.style.color = '#10b981';
      badgeAttainment.className = 'badge-pill success';
      badgeAttainment.textContent = `Goal Surpassed (+${fmtNum(trafficDiff)})`;
      valGapSub.textContent = `Surplus of ${fmtNum(trafficDiff)} visitors`;
    }

    progressTrafficBar.style.width = `${attainmentPct}%`;
    progressTrafficBar.style.background = attainmentPct >= 100 ? '#10b981' : 'var(--accent)';
    lblCurrVisitors.textContent = fmtNum(currentTraffic);
    lblTargetVisitors.textContent = fmtNum(reqVisitors);

    // Channel Acquisition Splits
    const mixOrganic = Math.max(0, parseFloat(inputMixOrganic.value) || 0);
    const mixPaid = Math.max(0, parseFloat(inputMixPaid.value) || 0);
    const mixSocial = Math.max(0, parseFloat(inputMixSocial.value) || 0);
    const mixReferral = Math.max(0, parseFloat(inputMixReferral.value) || 0);
    const totalMix = mixOrganic + mixPaid + mixSocial + mixReferral || 100;

    const channels = [
      { name: 'Organic Search (SEO)', color: '#10b981', pct: (mixOrganic / totalMix) * 100 },
      { name: 'Paid Advertising (PPC/Ads)', color: '#f59e0b', pct: (mixPaid / totalMix) * 100, isPaid: true },
      { name: 'Social Media', color: '#4e85bf', pct: (mixSocial / totalMix) * 100 },
      { name: 'Referral / Direct', color: '#a78bfa', pct: (mixReferral / totalMix) * 100 }
    ];

    let channelRowsHtml = '';
    let estPaidBudget = 0;
    let paidVisitors = 0;

    channels.forEach(ch => {
      const chVisitors = Math.round(reqVisitors * (ch.pct / 100));
      const chLeads = Math.round(chVisitors * leadCvr);
      const chDeals = Math.round(chLeads * closeRate);

      if (ch.isPaid) {
        paidVisitors = chVisitors;
        estPaidBudget = chVisitors * paidCpc;
      }

      channelRowsHtml += `
        <tr>
          <td><span class="channel-dot" style="background: ${ch.color};"></span> ${ch.name}</td>
          <td>${ch.pct.toFixed(0)}%</td>
          <td style="font-weight: 700;">${fmtNum(chVisitors)}</td>
          <td>${fmtNum(chLeads)}</td>
          <td>${fmtNum(chDeals)}</td>
        </tr>
      `;
    });
    channelTableBody.innerHTML = channelRowsHtml;

    valEstAdspend.textContent = fmtMoney(estPaidBudget);
    valAdspendSub.textContent = `For ${fmtNum(paidVisitors)} paid clicks @ ${fmtMoney(paidCpc)}`;

    // What-If Optimizer calculation
    const liftPct = parseFloat(sliderCvrLift.value) || 0;
    lblWhatifLift.textContent = `+${liftPct.toFixed(1)}% CVR Lift`;

    const baseCvrDisplay = (leadCvr * 100).toFixed(1);
    const liftedCvr = (leadCvr * 100) + liftPct;
    const liftedReqVisitors = Math.ceil(reqLeads / (liftedCvr / 100));
    const trafficSaved = Math.max(0, reqVisitors - liftedReqVisitors);

    txtWhatifResult.innerHTML = `
      Increasing your Visitor-to-Lead conversion rate from <strong>${baseCvrDisplay}%</strong> to <strong>${liftedCvr.toFixed(1)}%</strong> reduces required traffic to <strong>${fmtNum(liftedReqVisitors)} visitors</strong> — saving you <strong>${fmtNum(trafficSaved)} visitors/mo</strong> to hit the same goal!
    `;
  }

  // Event Listeners
  btnModeRev.addEventListener('click', () => setMode('revenue'));
  btnModeCust.addEventListener('click', () => setMode('customers'));

  [
    inputTargetRevenue, inputDealSize, inputTargetCustomers,
    inputLeadCvr, inputCloseRate, inputCurrentTraffic,
    inputMixOrganic, inputMixPaid, inputMixSocial, inputMixReferral,
    inputPaidCpc, sliderCvrLift
  ].forEach(el => {
    el.addEventListener('input', calculate);
  });

  // Presets
  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const pKey = btn.dataset.preset;
      const conf = presets[pKey];
      if (conf) {
        setMode(conf.mode);
        inputTargetRevenue.value = conf.rev;
        inputDealSize.value = conf.deal;
        inputTargetCustomers.value = conf.cust;
        inputLeadCvr.value = conf.leadCvr;
        inputCloseRate.value = conf.close;
        inputCurrentTraffic.value = conf.curr;
        inputPaidCpc.value = conf.cpc.toFixed(2);
        inputMixOrganic.value = conf.mix[0];
        inputMixPaid.value = conf.mix[1];
        inputMixSocial.value = conf.mix[2];
        inputMixReferral.value = conf.mix[3];
        calculate();
      }
    });
  });

  // Copy Plan
  btnCopy.addEventListener('click', async () => {
    const summary = [
      `--- Website Traffic & Lead Generation Model ---`,
      `Target Monthly Revenue: ${fmtMoney(parseFloat(inputTargetRevenue.value))}`,
      `Target Closed Deals: ${valReqDeals.textContent} deals`,
      `Required Monthly Unique Visitors: ${valReqTraffic.textContent} (${badgeDailyTraffic.textContent})`,
      `Required Monthly Leads: ${valReqLeads.textContent} (${valLeadsDay.textContent})`,
      `Visitor-to-Lead CVR: ${inputLeadCvr.value}% | Lead-to-Customer Close: ${inputCloseRate.value}%`,
      `Current Traffic Baseline: ${lblCurrVisitors.textContent} visitors/mo`,
      `Traffic Shortfall / Gap: ${valTrafficGap.textContent} (${valGapSub.textContent})`,
      `Estimated Paid Ad Budget Needed: ${valEstAdspend.textContent} (${valAdspendSub.textContent})`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      const orig = btnCopy.innerHTML;
      btnCopy.innerHTML = `✓ Copied!`;
      setTimeout(() => { btnCopy.innerHTML = orig; }, 2000);
    } catch {
      alert('Copied to clipboard!\n\n' + summary);
    }
  });

  // Export CSV
  btnExport.addEventListener('click', () => {
    const csvContent = [
      ['Metric', 'Value'],
      ['Target Monthly Revenue', inputTargetRevenue.value],
      ['Average Deal Size', inputDealSize.value],
      ['Required Closed Customers', valReqDeals.textContent],
      ['Visitor-to-Lead Conversion Rate (%)', inputLeadCvr.value],
      ['Lead-to-Customer Close Rate (%)', inputCloseRate.value],
      ['Required Monthly Unique Visitors', valReqTraffic.textContent.replace(/,/g, '')],
      ['Required Daily Visitors', badgeDailyTraffic.textContent.replace(' / day', '').replace(/,/g, '')],
      ['Required Monthly Leads', valReqLeads.textContent.replace(/,/g, '')],
      ['Current Monthly Traffic', inputCurrentTraffic.value],
      ['Traffic Gap (Shortfall/Surplus)', valTrafficGap.textContent.replace(/,/g, '')],
      ['Estimated Paid Ad Spend', valEstAdspend.textContent.replace('$', '').replace(/,/g, '')]
    ].map(row => row.map(c => `"${c}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `traffic-lead-plan-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  });

  // Initial Calculation
  calculate();
});