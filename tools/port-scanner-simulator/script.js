// Port Scanner Simulator - Client-Side Logic
document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const targetInput = document.getElementById('target-input');
  const scanModeSelect = document.getElementById('scan-mode');
  const scanSpeedSelect = document.getElementById('scan-speed');
  const btnStartScan = document.getElementById('btn-start-scan');
  const btnStopScan = document.getElementById('btn-stop-scan');
  const btnExportJson = document.getElementById('btn-export-json');
  const btnExportTxt = document.getElementById('btn-export-txt');
  const btnClear = document.getElementById('btn-clear-results');

  const radarCanvas = document.getElementById('radarCanvas');
  const radarStatusText = document.getElementById('radar-status-text');
  const radarSubtext = document.getElementById('radar-subtext');
  const progressBarFill = document.getElementById('scan-progress-fill');

  const countTotalEl = document.getElementById('count-total');
  const countOpenEl = document.getElementById('count-open');
  const countFilteredEl = document.getElementById('count-filtered');
  const countClosedEl = document.getElementById('count-closed');
  const countRisksEl = document.getElementById('count-risks');

  const pillAllCount = document.getElementById('pill-all-count');
  const pillOpenCount = document.getElementById('pill-open-count');
  const pillFilteredCount = document.getElementById('pill-filtered-count');
  const pillClosedCount = document.getElementById('pill-closed-count');
  const pillRiskCount = document.getElementById('pill-risk-count');

  const tableBody = document.getElementById('ports-table-body');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const presetPills = document.querySelectorAll('.preset-pill');

  // Scanner State
  let isScanning = false;
  let shouldAbort = false;
  let scannedResults = [];
  let currentFilter = 'all';
  let radarAngle = 0;
  let radarAnimId = null;
  let openBlips = []; // [{x, y, alpha, port}]

  // ==========================================
  // Port Database & Knowledge Base
  // ==========================================
  const PORT_DATABASE = {
    20: { name: 'FTP Data', proto: 'TCP', desc: 'File Transfer Protocol (Data)', risk: 'WARNING', note: 'Unencrypted file data transfer. Recommend SFTP.' },
    21: { name: 'FTP Control', proto: 'TCP', desc: 'File Transfer Protocol (Control)', risk: 'CRITICAL', note: 'Transmits credentials in plaintext. Migrate to SFTP or FTPS.' },
    22: { name: 'SSH', proto: 'TCP', desc: 'Secure Shell Remote Login', risk: 'INFO', note: 'Encrypted management channel. Enforce SSH keys, disable root password login.' },
    23: { name: 'Telnet', proto: 'TCP', desc: 'Telnet Unencrypted Terminal', risk: 'CRITICAL', note: 'Completely unencrypted. Passwords sent in cleartext. Disable immediately.' },
    25: { name: 'SMTP', proto: 'TCP', desc: 'Simple Mail Transfer Protocol', risk: 'WARNING', note: 'Mail gateway. Audit for open-relay vulnerabilities.' },
    53: { name: 'DNS', proto: 'TCP/UDP', desc: 'Domain Name System', risk: 'INFO', note: 'Name resolution. Restrict open recursion to avoid DNS amplification DDoS.' },
    67: { name: 'DHCP Server', proto: 'UDP', desc: 'Dynamic Host Configuration Protocol', risk: 'INFO', note: 'Network IP leasing service.' },
    68: { name: 'DHCP Client', proto: 'UDP', desc: 'DHCP Client Broadcast', risk: 'INFO', note: 'Client network configuration.' },
    69: { name: 'TFTP', proto: 'UDP', desc: 'Trivial File Transfer Protocol', risk: 'WARNING', note: 'Lacks authentication. Common in PXE boot environments.' },
    80: { name: 'HTTP', proto: 'TCP', desc: 'Hypertext Transfer Protocol', risk: 'WARNING', note: 'Unencrypted web traffic. Enforce HTTPS redirect (HSTS) on port 443.' },
    110: { name: 'POP3', proto: 'TCP', desc: 'Post Office Protocol v3', risk: 'WARNING', note: 'Plaintext mail retrieval. Migrate to encrypted POP3S (Port 995).' },
    111: { name: 'RPCBind', proto: 'TCP', desc: 'SUN Remote Procedure Call', risk: 'WARNING', note: 'Legacy RPC port mapper. Frequently probed for network reconnaissance.' },
    123: { name: 'NTP', proto: 'UDP', desc: 'Network Time Protocol', risk: 'INFO', note: 'Clock synchronization. Disable monlist feature to avoid DDoS reflection.' },
    135: { name: 'MS-RPC', proto: 'TCP', desc: 'Microsoft Windows RPC Endpoint', risk: 'WARNING', note: 'Windows Endpoint Mapper. Block external perimeter access.' },
    137: { name: 'NetBIOS-NS', proto: 'UDP', desc: 'NetBIOS Name Service', risk: 'WARNING', note: 'Legacy Windows broadcast protocol. Block on WAN.' },
    138: { name: 'NetBIOS-DGM', proto: 'UDP', desc: 'NetBIOS Datagram Service', risk: 'WARNING', note: 'NetBIOS UDP messaging.' },
    139: { name: 'NetBIOS-SSN', proto: 'TCP', desc: 'NetBIOS Session Service', risk: 'WARNING', note: 'Legacy file and printer sharing over NetBIOS.' },
    143: { name: 'IMAP', proto: 'TCP', desc: 'Internet Message Access Protocol', risk: 'WARNING', note: 'Plaintext IMAP email access. Migrate to IMAPS (Port 993).' },
    161: { name: 'SNMP', proto: 'UDP', desc: 'Simple Network Management Protocol', risk: 'WARNING', note: 'Ensure default community strings ("public"/"private") are changed.' },
    389: { name: 'LDAP', proto: 'TCP', desc: 'Lightweight Directory Access Protocol', risk: 'WARNING', note: 'Plaintext directory queries. Upgrade to LDAPS (Port 636).' },
    443: { name: 'HTTPS', proto: 'TCP', desc: 'HTTP over TLS/SSL', risk: 'SAFE', note: 'Encrypted web transport. Verify modern TLS 1.3 and valid certificate chain.' },
    445: { name: 'SMB', proto: 'TCP', desc: 'Microsoft-DS File Sharing', risk: 'CRITICAL', note: 'SMB file sharing. Primary vector for WannaCry/EternalBlue. Block WAN ingress!' },
    465: { name: 'SMTPS', proto: 'TCP', desc: 'SMTP over SSL', risk: 'SAFE', note: 'Encrypted email transmission.' },
    514: { name: 'Syslog', proto: 'UDP', desc: 'System Logging Protocol', risk: 'INFO', note: 'Centralized server audit logging.' },
    587: { name: 'SMTP Submission', proto: 'TCP', desc: 'Mail Client Submission (STARTTLS)', risk: 'INFO', note: 'Authenticated mail delivery.' },
    636: { name: 'LDAPS', proto: 'TCP', desc: 'LDAP over SSL', risk: 'SAFE', note: 'Encrypted directory service authentication.' },
    993: { name: 'IMAPS', proto: 'TCP', desc: 'IMAP over TLS', risk: 'SAFE', note: 'Secure encrypted email retrieval.' },
    995: { name: 'POP3S', proto: 'TCP', desc: 'POP3 over TLS', risk: 'SAFE', note: 'Secure encrypted POP3 mailbox download.' },
    1080: { name: 'SOCKS Proxy', proto: 'TCP', desc: 'SOCKS5 Proxy Protocol', risk: 'WARNING', note: 'Proxy gateway. Restrict to authorized internal peers.' },
    1433: { name: 'MSSQL', proto: 'TCP', desc: 'Microsoft SQL Server', risk: 'WARNING', note: 'Relational database. Isolate behind private VPC subnets and firewall.' },
    1521: { name: 'Oracle DB', proto: 'TCP', desc: 'Oracle Database Listener', risk: 'WARNING', note: 'Enterprise database. Block public internet access.' },
    2049: { name: 'NFS', proto: 'TCP', desc: 'Network File System', risk: 'WARNING', note: 'Unix network share. Ensure IP export restrictions and Kerberos auth.' },
    3000: { name: 'Node / Dev App', proto: 'TCP', desc: 'Modern Development Server (React/Node)', risk: 'INFO', note: 'Web application frontend or microservice.' },
    3306: { name: 'MySQL', proto: 'TCP', desc: 'MySQL / MariaDB Database', risk: 'WARNING', note: 'Exposed database server. Bind to 127.0.0.1 and enforce strong credentials.' },
    3389: { name: 'RDP', proto: 'TCP', desc: 'Remote Desktop Protocol', risk: 'CRITICAL', note: 'Windows GUI remote access. Highly targeted by ransomware. Require VPN.' },
    5000: { name: 'Flask / Python', proto: 'TCP', desc: 'Python Development Server', risk: 'INFO', note: 'Development WSGI server. Do not deploy debug mode in production.' },
    5432: { name: 'PostgreSQL', proto: 'TCP', desc: 'PostgreSQL Database Server', risk: 'WARNING', note: 'Relational database. Audit pg_hba.conf client authentication.' },
    5900: { name: 'VNC', proto: 'TCP', desc: 'Virtual Network Computing', risk: 'CRITICAL', note: 'Remote screen sharing. Often unencrypted or weak passwords. Enforce SSH tunnel.' },
    6379: { name: 'Redis', proto: 'TCP', desc: 'Redis In-Memory Data Store', risk: 'CRITICAL', note: 'Often runs unauthenticated by default. Potential for Remote Code Execution.' },
    8000: { name: 'HTTP Alt Dev', proto: 'TCP', desc: 'Django / HTTP Web Service', risk: 'INFO', note: 'Alternative HTTP port.' },
    8080: { name: 'HTTP Proxy/Alt', proto: 'TCP', desc: 'HTTP Alternate Web Proxy / Tomcat', risk: 'INFO', note: 'Common web container port. Ensure authentication & TLS.' },
    8443: { name: 'HTTPS Alt', proto: 'TCP', desc: 'HTTPS Alternate Web Management', risk: 'SAFE', note: 'Encrypted management UI.' },
    8888: { name: 'Jupyter / Web Alt', proto: 'TCP', desc: 'Jupyter Notebook / Web GUI', risk: 'WARNING', note: 'Data science interactive shell. Enforce token authentication.' },
    9000: { name: 'SonarQube / PHP-FPM', proto: 'TCP', desc: 'Code Quality / FastCGI Service', risk: 'INFO', note: 'Internal application service.' },
    9200: { name: 'Elasticsearch', proto: 'TCP', desc: 'Elasticsearch REST API', risk: 'WARNING', note: 'Search database. Ensure X-Pack security and cluster auth are active.' },
    11211: { name: 'Memcached', proto: 'TCP/UDP', desc: 'Memcached Distributed Cache', risk: 'WARNING', note: 'Vulnerable to UDP amplification DDoS if internet exposed.' },
    27017: { name: 'MongoDB', proto: 'TCP', desc: 'MongoDB NoSQL Database', risk: 'CRITICAL', note: 'Document database. Prevent public WAN exposure without authentication.' }
  };

  // Port lists for modes
  const PORT_SUITES = {
    top20: [21, 22, 23, 25, 53, 80, 110, 123, 143, 443, 445, 993, 995, 1433, 1521, 3306, 3389, 5432, 8080, 8443],
    webdb: [80, 443, 3306, 5432, 6379, 8080, 27017],
    full: [
      20, 21, 22, 23, 25, 53, 67, 68, 69, 80, 110, 111, 123, 135, 137, 138, 139,
      143, 161, 389, 443, 445, 465, 514, 587, 636, 993, 995, 1080, 1433, 1521,
      2049, 3000, 3306, 3389, 5000, 5432, 5900, 6379, 8000, 8080, 8443, 8888, 9000, 9200, 11211, 27017
    ]
  };

  // Target-specific simulated open ports
  function getSimulatedState(target, port) {
    const t = target.toLowerCase().trim();

    // 1. localhost simulation (development workstation)
    if (t === 'localhost' || t === '127.0.0.1') {
      const open = [22, 80, 3000, 5432, 8080];
      const filtered = [445, 1433];
      if (open.includes(port)) return { state: 'Open', latency: Math.floor(Math.random() * 8) + 2 };
      if (filtered.includes(port)) return { state: 'Filtered', latency: Math.floor(Math.random() * 400) + 900 };
      return { state: 'Closed', latency: Math.floor(Math.random() * 12) + 5 };
    }

    // 2. router gateway simulation (192.168.1.1)
    if (t === '192.168.1.1' || t.endsWith('.1')) {
      const open = [53, 80, 443];
      const filtered = [22, 23, 445, 3389];
      if (open.includes(port)) return { state: 'Open', latency: Math.floor(Math.random() * 15) + 6 };
      if (filtered.includes(port)) return { state: 'Filtered', latency: Math.floor(Math.random() * 500) + 1000 };
      return { state: 'Closed', latency: Math.floor(Math.random() * 20) + 12 };
    }

    // 3. scanme.nmap.org (educational nmap target)
    if (t.includes('nmap')) {
      const open = [22, 80, 9929, 31337];
      const filtered = [23, 445];
      if (open.includes(port)) return { state: 'Open', latency: Math.floor(Math.random() * 35) + 25 };
      if (filtered.includes(port)) return { state: 'Filtered', latency: Math.floor(Math.random() * 400) + 850 };
      return { state: 'Closed', latency: Math.floor(Math.random() * 30) + 28 };
    }

    // 4. database host simulation (10.0.0.15)
    if (t.includes('10.0.0.15') || t.includes('db')) {
      const open = [22, 3306, 5432, 6379, 27017];
      if (open.includes(port)) return { state: 'Open', latency: Math.floor(Math.random() * 20) + 10 };
      if ([445, 3389].includes(port)) return { state: 'Filtered', latency: 1200 };
      return { state: 'Closed', latency: Math.floor(Math.random() * 25) + 15 };
    }

    // Deterministic pseudo-random based on string hash for other targets
    let hash = 0;
    for (let i = 0; i < t.length; i++) hash = (hash * 31 + t.charCodeAt(i)) & 0xffffffff;
    const seed = Math.abs((hash ^ (port * 2654435761)) % 100);

    if (seed < 22) {
      return { state: 'Open', latency: Math.floor(Math.random() * 40) + 15 };
    } else if (seed < 42) {
      return { state: 'Filtered', latency: Math.floor(Math.random() * 600) + 800 };
    } else {
      return { state: 'Closed', latency: Math.floor(Math.random() * 30) + 18 };
    }
  }

  // ==========================================
  // Radar Animation Canvas
  // ==========================================
  const ctx = radarCanvas.getContext('2d');
  const radarRadius = 90;
  const centerX = 100;
  const centerY = 100;

  function drawRadar() {
    ctx.clearRect(0, 0, 200, 200);

    // Background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radarRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10, 20, 35, 0.7)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(78, 133, 191, 0.4)';
    ctx.stroke();

    // Concentric grid rings
    [30, 60, 90].forEach(r => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(78, 133, 191, 0.25)';
      ctx.stroke();
    });

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(centerX - radarRadius, centerY);
    ctx.lineTo(centerX + radarRadius, centerY);
    ctx.moveTo(centerX, centerY - radarRadius);
    ctx.lineTo(centerX, centerY + radarRadius);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(78, 133, 191, 0.2)';
    ctx.stroke();

    // Active Sweeping Beam
    if (isScanning) {
      radarAngle = (radarAngle + 0.05) % (Math.PI * 2);

      const sweepGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radarRadius);
      sweepGradient.addColorStop(0, 'rgba(14, 165, 233, 0.4)');
      sweepGradient.addColorStop(1, 'rgba(14, 165, 233, 0.02)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radarRadius, radarAngle - 0.4, radarAngle);
      ctx.closePath();
      ctx.fillStyle = sweepGradient;
      ctx.fill();

      // Lead line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(radarAngle) * radarRadius, centerY + Math.sin(radarAngle) * radarRadius);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.restore();
    }

    // Draw Open Port Blips
    for (let i = openBlips.length - 1; i >= 0; i--) {
      const blip = openBlips[i];
      ctx.save();
      ctx.beginPath();
      ctx.arc(blip.x, blip.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(52, 211, 153, ${blip.alpha})`;
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();

      if (isScanning) {
        blip.alpha = Math.max(0.2, blip.alpha - 0.005);
      }
    }

    radarAnimId = requestAnimationFrame(drawRadar);
  }

  drawRadar();

  function addRadarBlip(port) {
    const angle = ((port * 137.5) % 360) * (Math.PI / 180);
    const dist = 25 + ((port * 73) % 55);
    const x = centerX + Math.cos(angle) * dist;
    const y = centerY + Math.sin(angle) * dist;
    openBlips.push({ x, y, alpha: 1.0, port });
  }

  // ==========================================
  // Render Scan Results & Filter
  // ==========================================
  function renderTable() {
    let filtered = scannedResults;

    if (currentFilter === 'open') {
      filtered = scannedResults.filter(r => r.state === 'Open');
    } else if (currentFilter === 'filtered') {
      filtered = scannedResults.filter(r => r.state === 'Filtered');
    } else if (currentFilter === 'closed') {
      filtered = scannedResults.filter(r => r.state === 'Closed');
    } else if (currentFilter === 'risk') {
      filtered = scannedResults.filter(r => r.risk === 'CRITICAL' || r.risk === 'WARNING');
    }

    if (filtered.length === 0) {
      if (scannedResults.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; color: var(--text-tertiary); padding: 2rem;">
              No scan initiated. Configure target parameters above and click "Start Port Scan".
            </td>
          </tr>
        `;
      } else {
        tableBody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; color: var(--text-tertiary); padding: 2rem;">
              No ports match filter "${currentFilter}".
            </td>
          </tr>
        `;
      }
      return;
    }

    tableBody.innerHTML = filtered.map(item => {
      let stateBadge = `<span class="status-badge status-closed">Closed</span>`;
      if (item.state === 'Open') {
        stateBadge = `<span class="status-badge status-open">Open</span>`;
      } else if (item.state === 'Filtered') {
        stateBadge = `<span class="status-badge status-filtered">Filtered</span>`;
      }

      let riskBadge = `<span class="risk-badge risk-info">INFO</span>`;
      if (item.risk === 'CRITICAL') {
        riskBadge = `<span class="risk-badge risk-critical">CRITICAL</span>`;
      } else if (item.risk === 'WARNING') {
        riskBadge = `<span class="risk-badge risk-warning">WARNING</span>`;
      } else if (item.risk === 'SAFE') {
        riskBadge = `<span class="risk-badge risk-safe">SAFE</span>`;
      }

      const latencyStr = item.state === 'Filtered' ? `Timeout (${item.latency}ms)` : `${item.latency} ms`;

      return `
        <tr>
          <td style="font-family: monospace; font-weight: 700; color: var(--text-primary);">
            ${item.port} / ${item.proto}
          </td>
          <td>
            <div style="font-weight: 600; color: var(--text-primary);">${item.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-tertiary);">${item.desc}</div>
          </td>
          <td>${stateBadge}</td>
          <td style="font-family: monospace; font-size: 0.85rem; color: var(--text-secondary);">${latencyStr}</td>
          <td>
            <div>${riskBadge}<span style="font-size: 0.825rem; color: var(--text-primary);">${item.note}</span></div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function updateCounters() {
    const total = scannedResults.length;
    const openCount = scannedResults.filter(r => r.state === 'Open').length;
    const filteredCount = scannedResults.filter(r => r.state === 'Filtered').length;
    const closedCount = scannedResults.filter(r => r.state === 'Closed').length;
    const riskCount = scannedResults.filter(r => r.risk === 'CRITICAL' || r.risk === 'WARNING').length;

    countTotalEl.textContent = total;
    countOpenEl.textContent = openCount;
    countFilteredEl.textContent = filteredCount;
    countClosedEl.textContent = closedCount;
    countRisksEl.textContent = riskCount;

    pillAllCount.textContent = total;
    pillOpenCount.textContent = openCount;
    pillFilteredCount.textContent = filteredCount;
    pillClosedCount.textContent = closedCount;
    pillRiskCount.textContent = riskCount;
  }

  // ==========================================
  // Scanner Execution Controller
  // ==========================================
  async function startPortScan() {
    const target = targetInput.value.trim();
    if (!target) {
      alert('Please enter a target hostname or IP address.');
      targetInput.focus();
      return;
    }

    const suiteKey = scanModeSelect.value;
    const portList = PORT_SUITES[suiteKey] || PORT_SUITES.top20;

    let delayMs = 100;
    if (scanSpeedSelect.value === 'fast') delayMs = 35;
    else if (scanSpeedSelect.value === 'realistic') delayMs = 220;

    isScanning = true;
    shouldAbort = false;
    scannedResults = [];
    openBlips = [];
    updateCounters();
    renderTable();

    btnStartScan.disabled = true;
    btnStopScan.disabled = false;
    targetInput.disabled = true;
    scanModeSelect.disabled = true;

    radarStatusText.textContent = `Scanning ${target}...`;
    radarSubtext.textContent = `Active Suite: ${scanModeSelect.selectedOptions[0].text}`;
    progressBarFill.style.width = '0%';

    for (let i = 0; i < portList.length; i++) {
      if (shouldAbort) break;

      const port = portList[i];
      const dbEntry = PORT_DATABASE[port] || {
        name: `Service ${port}`,
        proto: 'TCP',
        desc: `TCP Port ${port}`,
        risk: 'INFO',
        note: 'Standard dynamic application service port.'
      };

      const outcome = getSimulatedState(target, port);
      const resultObj = {
        port,
        name: dbEntry.name,
        proto: dbEntry.proto,
        desc: dbEntry.desc,
        risk: outcome.state === 'Open' ? dbEntry.risk : 'INFO',
        note: outcome.state === 'Open' ? dbEntry.note : `Port reported ${outcome.state.toLowerCase()} on target host.`,
        state: outcome.state,
        latency: outcome.latency
      };

      if (outcome.state === 'Open') {
        addRadarBlip(port);
      }

      scannedResults.push(resultObj);
      updateCounters();
      renderTable();

      const percent = Math.round(((i + 1) / portList.length) * 100);
      progressBarFill.style.width = `${percent}%`;
      radarStatusText.textContent = `Scanning Port ${port} (${dbEntry.name}) [${i + 1}/${portList.length}]`;

      await new Promise(r => setTimeout(r, delayMs));
    }

    isScanning = false;
    btnStartScan.disabled = false;
    btnStopScan.disabled = true;
    targetInput.disabled = false;
    scanModeSelect.disabled = false;

    if (shouldAbort) {
      radarStatusText.textContent = 'Scan Aborted by User';
      radarSubtext.textContent = `Completed ${scannedResults.length} of ${portList.length} ports.`;
    } else {
      radarStatusText.textContent = 'Scan Completed';
      radarSubtext.textContent = `Audited ${scannedResults.length} ports for host: ${target}`;
      progressBarFill.style.width = '100%';
    }
  }

  btnStartScan.addEventListener('click', startPortScan);

  btnStopScan.addEventListener('click', () => {
    if (isScanning) {
      shouldAbort = true;
      btnStopScan.disabled = true;
    }
  });

  btnClear.addEventListener('click', () => {
    if (isScanning) return;
    scannedResults = [];
    openBlips = [];
    updateCounters();
    renderTable();
    progressBarFill.style.width = '0%';
    radarStatusText.textContent = 'Ready to Scan';
    radarSubtext.textContent = `Target: ${targetInput.value.trim() || 'localhost'}`;
  });

  // Filter Pills Click
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      renderTable();
    });
  });

  // Target Presets
  presetPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const tgt = pill.getAttribute('data-target');
      if (tgt) {
        targetInput.value = tgt;
        radarSubtext.textContent = `Target: ${tgt}`;
        if (!isScanning) startPortScan();
      }
    });
  });

  // ==========================================
  // Report Exports (JSON & TXT)
  // ==========================================
  btnExportJson.addEventListener('click', () => {
    if (scannedResults.length === 0) {
      alert('No scan data available to export. Run a scan first.');
      return;
    }

    const report = {
      target: targetInput.value.trim(),
      scanProfile: scanModeSelect.value,
      timestamp: new Date().toISOString(),
      summary: {
        totalPorts: scannedResults.length,
        open: scannedResults.filter(r => r.state === 'Open').length,
        filtered: scannedResults.filter(r => r.state === 'Filtered').length,
        closed: scannedResults.filter(r => r.state === 'Closed').length,
        securityRisks: scannedResults.filter(r => r.risk === 'CRITICAL' || r.risk === 'WARNING').length
      },
      ports: scannedResults
    };

    const jsonStr = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `port-scan-${targetInput.value.trim().replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  });

  btnExportTxt.addEventListener('click', () => {
    if (scannedResults.length === 0) {
      alert('No scan data available to export. Run a scan first.');
      return;
    }

    const target = targetInput.value.trim();
    const openList = scannedResults.filter(r => r.state === 'Open');
    const riskList = scannedResults.filter(r => r.risk === 'CRITICAL' || r.risk === 'WARNING');

    const lines = [
      '========================================================================',
      '               EDUCATIONAL PORT SCAN SIMULATOR REPORT                  ',
      '========================================================================',
      `Target Hostname / IP:   ${target}`,
      `Scan Profile:           ${scanModeSelect.selectedOptions[0].text}`,
      `Timestamp:              ${new Date().toISOString()}`,
      `Total Ports Audited:    ${scannedResults.length}`,
      `Open Ports Discovered:  ${openList.length}`,
      `Filtered (Firewalled):  ${scannedResults.filter(r => r.state === 'Filtered').length}`,
      `Closed Ports:           ${scannedResults.filter(r => r.state === 'Closed').length}`,
      `Security Advisories:    ${riskList.length}`,
      '------------------------------------------------------------------------',
      '                         PORT DISCOVERY BREAKDOWN                       ',
      '------------------------------------------------------------------------',
      'PORT/PROTO   STATUS     LATENCY   SERVICE               RISK'
    ];

    scannedResults.forEach(r => {
      const p = `${r.port}/${r.proto}`.padEnd(12);
      const s = r.state.padEnd(10);
      const lat = `${r.latency}ms`.padEnd(9);
      const svc = r.name.padEnd(21);
      const rk = `[${r.risk}]`;
      lines.push(`${p} ${s} ${lat} ${svc} ${rk}`);
    });

    if (riskList.length > 0) {
      lines.push('------------------------------------------------------------------------');
      lines.push('                     SECURITY MITIGATION RECOMMENDATIONS               ');
      lines.push('------------------------------------------------------------------------');
      riskList.forEach(r => {
        lines.push(`* PORT ${r.port} (${r.name}) - [${r.risk}]:`);
        lines.push(`  ${r.note}`);
        lines.push('');
      });
    }

    lines.push('========================================================================');
    lines.push('Generated via ALL IN ONE Network Tools Suite');

    const txtContent = lines.join('\n');
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `port-scan-${target.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  });

  // Pre-run a sample scan on launch so the user gets instant visual results
  startPortScan();
});