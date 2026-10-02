// HTML to PDF Studio - Client-side Logic

const TEMPLATES = {
  invoice: {
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice #INV-2026-089</title>
</head>
<body>
  <div class="invoice-box">
    <div class="header-row">
      <div>
        <div class="brand-title">APEX DYNAMICS CORP</div>
        <div class="brand-sub">Cloud Infrastructure &amp; AI Systems</div>
        <div class="text-muted" style="margin-top: 8px;">
          100 Montgomery Street, Suite 2400<br>
          San Francisco, CA 94104<br>
          contact@apexdynamics.io
        </div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-tag">INVOICE</div>
        <div class="meta-item"><strong>Invoice No:</strong> #INV-2026-089</div>
        <div class="meta-item"><strong>Date:</strong> October 3, 2026</div>
        <div class="meta-item"><strong>Payment Due:</strong> November 2, 2026</div>
        <div class="meta-item"><strong>PO Number:</strong> PO-99412</div>
      </div>
    </div>

    <div class="divider"></div>

    <div class="client-row">
      <div class="client-col">
        <div class="section-label">Billed To:</div>
        <div class="client-name">Vanguard Financial Technologies</div>
        <div class="text-muted">
          Attn: Accounts Payable &amp; Procurement<br>
          452 Fifth Avenue, 18th Floor<br>
          New York, NY 10018<br>
          billing@vanguardfintech.com
        </div>
      </div>
      <div class="client-col">
        <div class="section-label">Payment Terms &amp; Method:</div>
        <div class="text-muted">
          Net 30 Days<br>
          Direct Bank Wire / SWIFT<br>
          Bank: Silicon Valley Corporate Trust<br>
          Routing: 121000358 &bull; Acct: 884029188
        </div>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 50%;">Service Description</th>
          <th style="text-align: center; width: 12%;">Qty / Hours</th>
          <th style="text-align: right; width: 18%;">Unit Rate ($)</th>
          <th style="text-align: right; width: 20%;">Total ($)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>High-Performance Distributed GPU Cluster Deployment</strong>
            <div class="text-muted">Provisioning of 8x H100 SXM5 multi-node infrastructure with RoCE v2 networking.</div>
          </td>
          <td style="text-align: center;">40 hrs</td>
          <td style="text-align: right;">$220.00</td>
          <td style="text-align: right;">$8,800.00</td>
        </tr>
        <tr>
          <td>
            <strong>Autonomous Multi-Agent Orchestration Middleware</strong>
            <div class="text-muted">Custom low-latency protocol adapters, Redis vector cache, and failover sidecars.</div>
          </td>
          <td style="text-align: center;">65 hrs</td>
          <td style="text-align: right;">$195.00</td>
          <td style="text-align: right;">$12,675.00</td>
        </tr>
        <tr>
          <td>
            <strong>Security &amp; SOC2 Type II Audit Hardening</strong>
            <div class="text-muted">Client-side zero-trust certificate rotation and AES-256-GCM data encryption at rest.</div>
          </td>
          <td style="text-align: center;">18 hrs</td>
          <td style="text-align: right;">$210.00</td>
          <td style="text-align: right;">$3,780.00</td>
        </tr>
        <tr>
          <td>
            <strong>Dedicated 24/7 Production SLA &amp; Telemetry</strong>
            <div class="text-muted">Monthly maintenance commitment with sub-10ms latency guarantees.</div>
          </td>
          <td style="text-align: center;">1 mo</td>
          <td style="text-align: right;">$4,500.00</td>
          <td style="text-align: right;">$4,500.00</td>
        </tr>
      </tbody>
    </table>

    <div class="summary-wrapper">
      <table class="summary-table">
        <tr>
          <td>Subtotal:</td>
          <td style="text-align: right;">$29,755.00</td>
        </tr>
        <tr>
          <td>Applicable State Tax (0.0%):</td>
          <td style="text-align: right;">$0.00</td>
        </tr>
        <tr class="total-row">
          <td>Total Due:</td>
          <td style="text-align: right;">$29,755.00 USD</td>
        </tr>
      </table>
    </div>

    <div class="footer-note">
      <div style="font-weight: 700; color: #111827; margin-bottom: 4px;">Thank you for your partnership!</div>
      Please transfer payment within 30 calendar days. For electronic inquiries, contact billing@apexdynamics.io.
    </div>
  </div>
</body>
</html>`,
    css: `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #1f2937;
  background: #ffffff;
  margin: 0;
  padding: 24px;
}
.invoice-box {
  max-width: 100%;
}
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.brand-title {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0f172a;
}
.brand-sub {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #4f46e5;
  font-weight: 700;
  margin-top: 2px;
}
.text-muted {
  font-size: 11px;
  color: #64748b;
  line-height: 1.5;
}
.invoice-meta {
  text-align: right;
}
.invoice-tag {
  font-size: 26px;
  font-weight: 900;
  letter-spacing: 0.05em;
  color: #0f172a;
  margin-bottom: 4px;
}
.meta-item {
  font-size: 11px;
  color: #475569;
  line-height: 1.6;
}
.divider {
  height: 1px;
  background: #e2e8f0;
  margin: 20px 0;
}
.client-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 20px;
}
.client-col {
  flex: 1;
}
.section-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
  color: #94a3b8;
  margin-bottom: 4px;
}
.client-name {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}
.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  font-size: 11px;
}
.items-table th {
  background: #0f172a;
  color: #ffffff;
  text-align: left;
  padding: 8px 12px;
  font-weight: 600;
  letter-spacing: 0.03em;
}
.items-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: top;
}
.items-table tbody tr:nth-child(even) td {
  background: #f8fafc;
}
.summary-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
.summary-table {
  width: 280px;
  font-size: 12px;
  border-collapse: collapse;
}
.summary-table td {
  padding: 6px 8px;
  color: #475569;
}
.summary-table .total-row td {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
  border-top: 2px solid #0f172a;
  padding-top: 8px;
}
.footer-note {
  margin-top: 36px;
  padding-top: 14px;
  border-top: 1px solid #e2e8f0;
  font-size: 10.5px;
  color: #64748b;
  text-align: center;
}`
  },

  certificate: {
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Certificate of Excellence</title>
</head>
<body>
  <div class="cert-outer-border">
    <div class="cert-inner-border">
      
      <div class="cert-badge">&#10022; CERTIFICATE OF EXCELLENCE &#10022;</div>
      <h1 class="cert-title">Award of Exceptional Distinction</h1>
      <p class="cert-subtitle">This international credential is formally conferred upon</p>
      
      <div class="recipient-name">DR. ALEXANDER STERLING</div>
      <div class="recipient-line"></div>
      
      <p class="cert-description">
        For pioneering contributions in the mathematical modeling of high-dimensional machine intelligence,
        rigorous algorithmic optimization, and leadership in zero-knowledge verifiable AI computational architectures.
      </p>

      <div class="cert-signatures">
        <div class="sig-block">
          <div class="sig-image">Eleanor Vance, Ph.D.</div>
          <div class="sig-line"></div>
          <div class="sig-name">Prof. Eleanor Vance</div>
          <div class="sig-title">President &amp; Dean of Academic Affairs</div>
        </div>

        <div class="seal-block">
          <div class="seal-circle">
            <div class="seal-inner">
              OFFICIAL SEAL<br>
              2026<br>
              VERIFIED
            </div>
          </div>
        </div>

        <div class="sig-block">
          <div class="sig-image">Jonathan H. Croft</div>
          <div class="sig-line"></div>
          <div class="sig-name">Jonathan H. Croft</div>
          <div class="sig-title">Chairman, International Board of Sciences</div>
        </div>
      </div>

      <div class="cert-footer">
        Credential ID: CERT-2026-AGY-99814 &bull; Issued in Geneva, Switzerland &bull; Verify at veritas.org/registry
      </div>

    </div>
  </div>
</body>
</html>`,
    css: `body {
  margin: 0;
  padding: 15px;
  background: #ffffff;
  font-family: 'Times New Roman', Times, serif;
  color: #1a1a1a;
  box-sizing: border-box;
}
.cert-outer-border {
  border: 5px solid #b8860b;
  padding: 10px;
  box-sizing: border-box;
}
.cert-inner-border {
  border: 2px solid #b8860b;
  padding: 30px 40px;
  text-align: center;
  box-sizing: border-box;
  background: radial-gradient(circle at center, #ffffff 60%, #fdfbf7 100%);
}
.cert-badge {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #b8860b;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 12px;
}
.cert-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #111827;
  margin: 0 0 10px 0;
  text-transform: uppercase;
}
.cert-subtitle {
  font-style: italic;
  font-size: 14px;
  color: #4b5563;
  margin: 0 0 20px 0;
}
.recipient-name {
  font-size: 32px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: 0.05em;
  margin-top: 10px;
  font-family: Georgia, serif;
}
.recipient-line {
  width: 320px;
  height: 2px;
  background: #b8860b;
  margin: 10px auto 20px auto;
}
.cert-description {
  font-size: 13px;
  line-height: 1.7;
  max-width: 600px;
  margin: 0 auto 30px auto;
  color: #374151;
}
.cert-signatures {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 25px;
  padding: 0 20px;
}
.sig-block {
  width: 200px;
  text-align: center;
}
.sig-image {
  font-family: 'Brush Script MT', cursive, Georgia, serif;
  font-size: 22px;
  color: #1e3a8a;
  height: 30px;
  line-height: 30px;
}
.sig-line {
  height: 1px;
  background: #9ca3af;
  margin: 6px auto;
  width: 100%;
}
.sig-name {
  font-size: 12px;
  font-weight: 700;
  color: #111827;
}
.sig-title {
  font-size: 10px;
  color: #6b7280;
}
.seal-block {
  display: flex;
  justify-content: center;
  align-items: center;
}
.seal-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px dashed #b8860b;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fefce8;
}
.seal-inner {
  font-size: 9px;
  font-weight: 800;
  color: #854d0e;
  line-height: 1.3;
  letter-spacing: 0.05em;
}
.cert-footer {
  margin-top: 30px;
  font-size: 9px;
  color: #9ca3af;
  letter-spacing: 0.04em;
}`
  },

  resume: {
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Resume - Marcus Vance</title>
</head>
<body>
  <div class="resume-container">
    <header class="resume-header">
      <h1 class="candidate-name">Marcus Vance</h1>
      <div class="candidate-title">Principal Cloud &amp; AI Systems Architect</div>
      <div class="contact-bar">
        <span>San Francisco, CA</span> &bull;
        <span>marcus.vance@systems.io</span> &bull;
        <span>+1 (415) 555-0192</span> &bull;
        <span>linkedin.com/in/marcus-vance</span>
      </div>
    </header>

    <section class="section">
      <div class="section-heading">Executive Summary</div>
      <p class="summary-text">
        Accomplished Systems Architect with 12+ years spearheading scalable distributed computing, real-time streaming architectures,
        and high-throughput AI agent orchestration engines. Led zero-downtime microservice migrations handling 2.5B+ monthly API transactions
        for Fortune 100 enterprise clients.
      </p>
    </section>

    <section class="section">
      <div class="section-heading">Core Competencies &amp; Technologies</div>
      <div class="skills-grid">
        <span class="skill-chip">Distributed Systems</span>
        <span class="skill-chip">Kubernetes / EKS</span>
        <span class="skill-chip">Go &bull; Rust &bull; Python</span>
        <span class="skill-chip">Kafka &bull; Redis Vector</span>
        <span class="skill-chip">Terraform &bull; GitOps</span>
        <span class="skill-chip">LLM Fine-Tuning &bull; vLLM</span>
        <span class="skill-chip">PostgreSQL &bull; ClickHouse</span>
        <span class="skill-chip">SOC2 &bull; Zero Trust</span>
      </div>
    </section>

    <section class="section">
      <div class="section-heading">Professional Experience</div>
      
      <div class="job-entry">
        <div class="job-header">
          <div>
            <span class="job-title">Principal Systems Architect</span> &bull;
            <span class="company-name">Apex Dynamics Cloud</span>
          </div>
          <div class="job-date">2022 &ndash; Present</div>
        </div>
        <ul class="job-bullets">
          <li>Architected hybrid multi-region GPU clusters supporting autonomous agent execution across 1,200+ instances.</li>
          <li>Reduced p99 inference latency by 42% through asynchronous zero-copy shared memory pipelines.</li>
          <li>Directed team of 18 senior engineers across cloud reliability, observability, and network infrastructure.</li>
        </ul>
      </div>

      <div class="job-entry">
        <div class="job-header">
          <div>
            <span class="job-title">Staff Infrastructure Engineer</span> &bull;
            <span class="company-name">Nova Global Networks</span>
          </div>
          <div class="job-date">2018 &ndash; 2022</div>
        </div>
        <ul class="job-bullets">
          <li>Designed petabyte-scale event pipeline processing 150k events/sec with Apache Kafka and ClickHouse.</li>
          <li>Pioneered self-healing automated chaos testing that reduced SEV-1 production incidents by 68%.</li>
        </ul>
      </div>
    </section>

    <section class="section">
      <div class="section-heading">Education &amp; Credentials</div>
      <div class="job-header">
        <div>
          <strong>M.S. in Computer Science (Distributed Systems)</strong> &bull; Stanford University
        </div>
        <div class="job-date">2014 &ndash; 2016</div>
      </div>
      <div class="job-header" style="margin-top: 4px;">
        <div>
          <strong>B.S. in Software Engineering</strong> &bull; UC Berkeley (Magna Cum Laude)
        </div>
        <div class="job-date">2010 &ndash; 2014</div>
      </div>
    </section>
  </div>
</body>
</html>`,
    css: `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #1f2937;
  background: #ffffff;
  margin: 0;
  padding: 20px 24px;
  line-height: 1.45;
}
.resume-header {
  border-bottom: 2px solid #0f172a;
  padding-bottom: 12px;
  margin-bottom: 14px;
}
.candidate-name {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 2px 0;
  letter-spacing: -0.02em;
}
.candidate-title {
  font-size: 13px;
  font-weight: 600;
  color: #2563eb;
  margin-bottom: 6px;
}
.contact-bar {
  font-size: 10.5px;
  color: #64748b;
}
.section {
  margin-bottom: 14px;
}
.section-heading {
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #0f172a;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 3px;
  margin-bottom: 8px;
}
.summary-text {
  font-size: 11px;
  color: #374151;
  margin: 0;
  line-height: 1.5;
}
.skills-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.skill-chip {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  color: #334155;
  font-weight: 600;
}
.job-entry {
  margin-bottom: 10px;
}
.job-header {
  display: flex;
  justify-content: space-between;
  font-size: 11.5px;
  margin-bottom: 4px;
}
.job-title {
  font-weight: 700;
  color: #0f172a;
}
.company-name {
  color: #475569;
}
.job-date {
  font-size: 10.5px;
  color: #64748b;
  font-weight: 500;
}
.job-bullets {
  margin: 0;
  padding-left: 18px;
  font-size: 10.5px;
  color: #374151;
  line-height: 1.45;
}`
  },

  report: {
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Q3 2026 Executive Performance Briefing</title>
</head>
<body>
  <div class="report-box">
    <div class="report-top">
      <div>
        <div class="report-tag">EXECUTIVE PERFORMANCE REPORT</div>
        <h1 class="report-title">Q3 2026 Operational &amp; Financial Audit</h1>
      </div>
      <div class="report-badge">CONFIDENTIAL</div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Total Revenue</div>
        <div class="kpi-value">$180.2M</div>
        <div class="kpi-sub positive">+23.6% YoY Growth</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Operating Margin</div>
        <div class="kpi-value">41.7%</div>
        <div class="kpi-sub positive">+3.6% vs Q2</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Enterprise Clients</div>
        <div class="kpi-value">1,480</div>
        <div class="kpi-sub positive">+142 Net New</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Cloud SLA Uptime</div>
        <div class="kpi-value">99.992%</div>
        <div class="kpi-sub">Target: 99.95%</div>
      </div>
    </div>

    <div class="narrative-section">
      <h3 class="narrative-title">Executive Commentary &amp; Market Position</h3>
      <p class="narrative-p">
        Third-quarter performance exceeded street consensus across all core verticals, propelled by accelerated enterprise adoption
        of our autonomous sidecar framework. Operating leverage improved materially as data-tier caching enhancements reduced
        marginal GPU inference costs by 34% quarter-over-quarter.
      </p>
    </div>

    <table class="report-table">
      <thead>
        <tr>
          <th>Division</th>
          <th>Q3 Revenue</th>
          <th>Operating Costs</th>
          <th>EBITDA Margin</th>
          <th>Growth Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Autonomous Agent Cloud</strong></td>
          <td>$88.4M</td>
          <td>$32.1M</td>
          <td>63.7%</td>
          <td><span class="status-pill status-high">Hyper-Scale</span></td>
        </tr>
        <tr>
          <td><strong>Vector Storage Systems</strong></td>
          <td>$52.1M</td>
          <td>$21.4M</td>
          <td>58.9%</td>
          <td><span class="status-pill status-high">Strong Expansion</span></td>
        </tr>
        <tr>
          <td><strong>Enterprise Security Suite</strong></td>
          <td>$27.5M</td>
          <td>$14.2M</td>
          <td>48.4%</td>
          <td><span class="status-pill status-norm">Steady</span></td>
        </tr>
        <tr>
          <td><strong>Professional Consulting</strong></td>
          <td>$12.2M</td>
          <td>$7.3M</td>
          <td>40.1%</td>
          <td><span class="status-pill status-norm">Steady</span></td>
        </tr>
      </tbody>
    </table>

    <div class="report-footer">
      <span>Board of Directors Report &bull; Document ID: REP-2026-Q3-01</span>
      <span>Published October 2026</span>
    </div>
  </div>
</body>
</html>`,
    css: `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1e293b;
  margin: 0;
  padding: 24px;
  background: #ffffff;
}
.report-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #0f172a;
  padding-bottom: 12px;
  margin-bottom: 20px;
}
.report-tag {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #0284c7;
  text-transform: uppercase;
}
.report-title {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  margin: 2px 0 0 0;
}
.report-badge {
  background: #fecdd3;
  color: #9f1239;
  border: 1px solid #fda4af;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 9999px;
  letter-spacing: 0.05em;
}
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
.kpi-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 12px;
}
.kpi-label {
  font-size: 10px;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 600;
}
.kpi-value {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  margin: 4px 0 2px 0;
}
.kpi-sub {
  font-size: 10px;
  color: #64748b;
}
.kpi-sub.positive {
  color: #16a34a;
  font-weight: 600;
}
.narrative-section {
  background: #f1f5f9;
  border-left: 3px solid #0284c7;
  padding: 12px 16px;
  margin-bottom: 20px;
  border-radius: 0 4px 4px 0;
}
.narrative-title {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
}
.narrative-p {
  font-size: 11px;
  color: #475569;
  margin: 0;
  line-height: 1.5;
}
.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  margin-bottom: 24px;
}
.report-table th {
  background: #0f172a;
  color: #ffffff;
  padding: 8px 10px;
  text-align: left;
  font-weight: 600;
}
.report-table td {
  padding: 8px 10px;
  border-bottom: 1px solid #e2e8f0;
}
.status-pill {
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 9.5px;
  font-weight: 600;
}
.status-high {
  background: #dcfce7;
  color: #15803d;
}
.status-norm {
  background: #e0f2fe;
  color: #0369a1;
}
.report-footer {
  border-top: 1px solid #e2e8f0;
  padding-top: 10px;
  display: flex;
  justify-content: space-between;
  font-size: 9.5px;
  color: #94a3b8;
}`
  },

  blank: {
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Document Title</title>
</head>
<body>
  <div class="content-box">
    <h1>Document Title</h1>
    <p>Write your content here...</p>
  </div>
</body>
</html>`,
    css: `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 30px;
  color: #111827;
  margin: 0;
}
h1 {
  font-size: 24px;
  color: #0f172a;
}
p {
  font-size: 13px;
  line-height: 1.6;
  color: #4b5563;
}`
  }
};

let debounceTimer = null;

// Build full document HTML for preview and PDF generation
function buildFullDocument(htmlContent, cssContent) {
  // Check if html contains <html> and <head>
  if (htmlContent.includes('<html') && htmlContent.includes('</head>')) {
    return htmlContent.replace('</head>', `<style>${cssContent}</style></head>`);
  }
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    ${cssContent}
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;
}

// Update Paper Dimensions on Frame Container
function updatePaperDimensions() {
  const paperFormat = document.getElementById('paper-format').value;
  const orientation = document.getElementById('paper-orientation').value;
  const paperFrame = document.getElementById('paper-frame');

  let widthMm = 210;
  let heightMm = 297;

  if (paperFormat === 'letter') {
    widthMm = 215.9;
    heightMm = 279.4;
  } else if (paperFormat === 'legal') {
    widthMm = 215.9;
    heightMm = 355.6;
  }

  if (orientation === 'landscape') {
    const temp = widthMm;
    widthMm = heightMm;
    heightMm = temp;
  }

  paperFrame.style.width = `${widthMm}mm`;
  paperFrame.style.minHeight = `${heightMm}mm`;
}

// Render Preview into iframe
function updatePreview() {
  const htmlCode = document.getElementById('editor-html').value;
  const cssCode = document.getElementById('editor-css').value;
  const previewFrame = document.getElementById('preview-frame');

  const fullHtml = buildFullDocument(htmlCode, cssCode);
  const doc = previewFrame.contentDocument || previewFrame.contentWindow.document;
  doc.open();
  doc.write(fullHtml);
  doc.close();
}

function debouncedPreview() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(updatePreview, 250);
}

// Insert Helper Snippet at Cursor
function insertSnippet(type) {
  const activeEditor = document.getElementById('tab-html').classList.contains('active')
    ? document.getElementById('editor-html')
    : document.getElementById('editor-css');

  let textToInsert = '';
  if (type === 'pagebreak') {
    textToInsert = '\n<div class="html2pdf__page-break"></div>\n';
  } else if (type === 'avoidbreak') {
    textToInsert = '\n<div style="page-break-inside: avoid;">\n  <!-- Content protected from page splitting -->\n</div>\n';
  } else if (type === 'twocol') {
    textToInsert = '\n<div style="display: flex; gap: 20px;">\n  <div style="flex: 1;">Column 1</div>\n  <div style="flex: 1;">Column 2</div>\n</div>\n';
  } else if (type === 'badge') {
    textToInsert = '<span style="background: #e0f2fe; color: #0284c7; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600;">Badge</span>';
  }

  const start = activeEditor.selectionStart;
  const end = activeEditor.selectionEnd;
  const oldVal = activeEditor.value;

  activeEditor.value = oldVal.substring(0, start) + textToInsert + oldVal.substring(end);
  activeEditor.selectionStart = activeEditor.selectionEnd = start + textToInsert.length;
  activeEditor.focus();
  updatePreview();
}

// Compile & Download PDF via html2pdf.bundle.min.js
async function compileAndDownloadPdf() {
  const compileBtn = document.getElementById('btn-compile-pdf');
  const paperFormat = document.getElementById('paper-format').value;
  const orientation = document.getElementById('paper-orientation').value;
  const marginMode = document.getElementById('paper-margin').value;
  let filename = document.getElementById('doc-filename').value.trim() || 'document.pdf';
  if (!filename.toLowerCase().endsWith('.pdf')) filename += '.pdf';

  let marginMm = [10, 10, 10, 10];
  if (marginMode === 'none') marginMm = [0, 0, 0, 0];
  else if (marginMode === 'compact') marginMm = [5, 5, 5, 5];
  else if (marginMode === 'wide') marginMm = [20, 20, 20, 20];

  const htmlCode = document.getElementById('editor-html').value;
  const cssCode = document.getElementById('editor-css').value;
  const fullHtml = buildFullDocument(htmlCode, cssCode);

  const origBtnText = compileBtn.innerHTML;
  compileBtn.disabled = true;
  compileBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" style="animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Compiling PDF...
  `;

  // Create isolated offscreen container for html2pdf
  const printContainer = document.createElement('div');
  printContainer.style.position = 'fixed';
  printContainer.style.top = '-99999px';
  printContainer.style.left = '-99999px';
  printContainer.style.width = orientation === 'landscape' ? '297mm' : '210mm';
  printContainer.style.background = '#ffffff';
  printContainer.innerHTML = fullHtml;
  document.body.appendChild(printContainer);

  const opt = {
    margin: marginMm,
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: paperFormat, orientation: orientation },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  try {
    if (window.html2pdf) {
      await window.html2pdf().set(opt).from(printContainer).save();
    } else {
      alert('html2pdf library is unavailable. Please check internet/assets.');
    }
  } catch (err) {
    console.error('Compilation error:', err);
    alert('PDF Generation failed: ' + err.message);
  } finally {
    document.body.removeChild(printContainer);
    compileBtn.disabled = false;
    compileBtn.innerHTML = origBtnText;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const editorHtml = document.getElementById('editor-html');
  const editorCss = document.getElementById('editor-css');
  const tabHtml = document.getElementById('tab-html');
  const tabCss = document.getElementById('tab-css');
  const templateSelect = document.getElementById('template-select');
  const paperFormat = document.getElementById('paper-format');
  const paperOrientation = document.getElementById('paper-orientation');
  const btnCompile = document.getElementById('btn-compile-pdf');
  const btnRefresh = document.getElementById('btn-refresh-preview');
  const btnCopy = document.getElementById('btn-copy-code');
  const btnReset = document.getElementById('btn-reset-template');
  const zoomSlider = document.getElementById('preview-zoom');
  const zoomVal = document.getElementById('preview-zoom-val');
  const paperFrame = document.getElementById('paper-frame');

  // Load default template (invoice)
  function loadTemplate(tplKey) {
    const tpl = TEMPLATES[tplKey] || TEMPLATES.invoice;
    editorHtml.value = tpl.html;
    editorCss.value = tpl.css;
    document.getElementById('doc-filename').value = `${tplKey}-document.pdf`;
    updatePaperDimensions();
    updatePreview();
  }

  loadTemplate('invoice');

  // Tab switching
  tabHtml.addEventListener('click', () => {
    tabHtml.classList.add('active');
    tabCss.classList.remove('active');
    editorHtml.style.display = 'block';
    editorCss.style.display = 'none';
  });

  tabCss.addEventListener('click', () => {
    tabCss.classList.add('active');
    tabHtml.classList.remove('active');
    editorCss.style.display = 'block';
    editorHtml.style.display = 'none';
  });

  // Editor typing
  editorHtml.addEventListener('input', debouncedPreview);
  editorCss.addEventListener('input', debouncedPreview);

  // Template select change
  templateSelect.addEventListener('change', (e) => {
    loadTemplate(e.target.value);
  });

  // Format and orientation changes
  paperFormat.addEventListener('change', () => {
    updatePaperDimensions();
    updatePreview();
  });
  paperOrientation.addEventListener('change', () => {
    updatePaperDimensions();
    updatePreview();
  });

  // Zoom control
  const setZoom = (val) => {
    zoomVal.textContent = `${val}%`;
    paperFrame.style.transform = `scale(${val / 100})`;
  };
  setZoom(zoomSlider.value);
  zoomSlider.addEventListener('input', (e) => setZoom(e.target.value));

  // Helper pills
  document.querySelectorAll('.helper-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      insertSnippet(pill.getAttribute('data-insert'));
    });
  });

  // Action buttons
  btnRefresh.addEventListener('click', updatePreview);
  btnCompile.addEventListener('click', compileAndDownloadPdf);

  btnCopy.addEventListener('click', () => {
    const activeEditor = tabHtml.classList.contains('active') ? editorHtml : editorCss;
    navigator.clipboard.writeText(activeEditor.value).then(() => {
      const origText = btnCopy.textContent;
      btnCopy.textContent = 'Copied!';
      setTimeout(() => btnCopy.textContent = origText, 1500);
    });
  });

  btnReset.addEventListener('click', () => {
    if (confirm('Reset editor to the selected template defaults? Current modifications will be replaced.')) {
      loadTemplate(templateSelect.value);
    }
  });
});