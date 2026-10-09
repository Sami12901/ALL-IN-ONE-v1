// JWT Decoder & Inspector Logic
// Handles Base64Url parsing, live expiration status, claims analysis, and HMAC-SHA256 signature verification

const STANDARD_CLAIMS = {
  iss: 'Issuer: Authority or identity provider that generated and issued this token',
  sub: 'Subject: Unique identifier of the authenticated user or principal',
  aud: 'Audience: Intended recipient(s) or resource server this token is authorized for',
  exp: 'Expiration Time: Timestamp indicating when token expires and must no longer be accepted',
  nbf: 'Not Before: Timestamp indicating when token becomes valid (not accepted before this)',
  iat: 'Issued At: Timestamp indicating when token was created and signed',
  jti: 'JWT ID: Unique token identifier used to prevent replay attacks',
  name: 'Full Name: Display name of the user',
  given_name: 'Given Name: User first name',
  family_name: 'Family Name: User last / family name',
  email: 'Email: User email address',
  email_verified: 'Email Verified: Indicates whether email address is verified',
  roles: 'Roles: List of RBAC authorization role names',
  role: 'Role: Primary authorization role name',
  scope: 'Scopes: OAuth 2.0 permission scopes granted to client',
  azp: 'Authorized Party: OAuth 2.0 Client ID that requested the token',
  auth_time: 'Auth Time: Timestamp when end-user authentication occurred'
};

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const jwtInput = document.getElementById('jwt-input');
  const jwtInputError = document.getElementById('jwt-input-error');
  const tokenVisualizer = document.getElementById('token-visualizer');

  const statusRibbon = document.getElementById('status-ribbon');
  const badgeExp = document.getElementById('badge-exp');
  const badgeExpIcon = document.getElementById('badge-exp-icon');
  const badgeExpText = document.getElementById('badge-exp-text');
  const badgeAlgText = document.getElementById('badge-alg-text');
  const badgeTypText = document.getElementById('badge-typ-text');
  const badgeIssued = document.getElementById('badge-issued');
  const badgeIssuedText = document.getElementById('badge-issued-text');

  const headerCode = document.getElementById('header-code');
  const payloadCode = document.getElementById('payload-code');
  const claimsTableBody = document.getElementById('claims-table-body');

  const btnPresetActive = document.getElementById('btn-preset-active');
  const btnPresetExpired = document.getElementById('btn-preset-expired');
  const btnPresetRoles = document.getElementById('btn-preset-roles');
  const btnClearJwt = document.getElementById('btn-clear-jwt');
  const btnPasteJwt = document.getElementById('btn-paste-jwt');
  const btnCopyHeader = document.getElementById('btn-copy-header');
  const btnCopyPayload = document.getElementById('btn-copy-payload');

  const jwtSecret = document.getElementById('jwt-secret');
  const secretBase64 = document.getElementById('secret-base64');
  const btnVerifySig = document.getElementById('btn-verify-sig');
  const verifyStatus = document.getElementById('verify-status');

  let currentHeaderObj = null;
  let currentPayloadObj = null;
  let currentParts = [];

  // UTF-8 Safe Base64Url Decoder
  function decodeBase64Url(str) {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  // Base64Url Encoder
  function toBase64Url(uint8Array) {
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function stringToBase64Url(str) {
    const bytes = new TextEncoder().encode(str);
    return toBase64Url(bytes);
  }

  // Syntax highlighting for JSON display
  function highlightJSON(obj) {
    let json = JSON.stringify(obj, null, 2);
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      let cls = 'json-number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key';
        } else {
          cls = 'json-string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      return `<span class="${cls}">${match}</span>`;
    });
  }

  // Format relative time (e.g. "in 3 days" or "2 hours ago")
  function formatRelativeTime(targetSec, currentSec) {
    const diffSec = targetSec - currentSec;
    const isFuture = diffSec > 0;
    const absDiff = Math.abs(diffSec);

    const minutes = Math.floor(absDiff / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let unit = '';
    if (days > 0) {
      unit = `${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      unit = `${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      unit = `${minutes} min${minutes > 1 ? 's' : ''}`;
    } else {
      unit = `${absDiff} sec${absDiff > 1 ? 's' : ''}`;
    }

    return isFuture ? `Expires in ${unit}` : `Expired ${unit} ago`;
  }

  // Parse and update JWT
  function parseJWT() {
    const raw = (jwtInput.value || '').trim();
    jwtInputError.style.display = 'none';

    if (!raw) {
      currentHeaderObj = null;
      currentPayloadObj = null;
      currentParts = [];
      tokenVisualizer.innerHTML = '<span style="color: var(--text-tertiary);">Paste or select a token above to see the 3-part breakdown...</span>';
      statusRibbon.style.display = 'none';
      headerCode.innerHTML = '// Header JSON outputs here';
      payloadCode.innerHTML = '// Payload JSON outputs here';
      claimsTableBody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-tertiary); padding: 2rem;">No token loaded yet. Enter a JWT token above to inspect claims.</td></tr>';
      verifyStatus.style.display = 'none';
      return;
    }

    const parts = raw.split('.');
    currentParts = parts;

    // Render 3-part colored visualizer
    if (parts.length === 3) {
      tokenVisualizer.innerHTML = `
        <span class="jwt-part-header" title="Header: Algorithm & Token Type">${escapeHtml(parts[0])}</span><span class="jwt-dot">.</span>
        <span class="jwt-part-payload" title="Payload: Claims & Data">${escapeHtml(parts[1])}</span><span class="jwt-dot">.</span>
        <span class="jwt-part-signature" title="Signature: Integrity Proof">${escapeHtml(parts[2])}</span>
      `;
    } else {
      tokenVisualizer.innerHTML = `<span style="color: var(--error);">Invalid JWT structure: Expected 3 parts separated by dots, found ${parts.length}.</span>`;
      showError(`Invalid JWT structure: Token must contain exactly 3 segments separated by dots (header.payload.signature). Found ${parts.length} segment(s).`);
      return;
    }

    // Decode Header
    try {
      const headerJson = decodeBase64Url(parts[0]);
      currentHeaderObj = JSON.parse(headerJson);
      headerCode.innerHTML = highlightJSON(currentHeaderObj);
    } catch (e) {
      showError(`Failed to decode JWT Header: ${e.message}`);
      headerCode.innerHTML = `<span style="color: var(--error);">${escapeHtml(e.message)}</span>`;
      return;
    }

    // Decode Payload
    try {
      const payloadJson = decodeBase64Url(parts[1]);
      currentPayloadObj = JSON.parse(payloadJson);
      payloadCode.innerHTML = highlightJSON(currentPayloadObj);
    } catch (e) {
      showError(`Failed to decode JWT Payload: ${e.message}`);
      payloadCode.innerHTML = `<span style="color: var(--error);">${escapeHtml(e.message)}</span>`;
      return;
    }

    // Update status ribbon
    statusRibbon.style.display = 'flex';
    badgeAlgText.textContent = currentHeaderObj.alg || 'none';
    badgeTypText.textContent = currentHeaderObj.typ || 'JWT';

    // Expiration logic
    const nowSec = Math.floor(Date.now() / 1000);
    badgeExp.className = 'status-badge';

    if (typeof currentPayloadObj.exp === 'number') {
      const expSec = currentPayloadObj.exp;
      const expDate = new Date(expSec * 1000);
      const relative = formatRelativeTime(expSec, nowSec);

      if (expSec > nowSec) {
        // Active
        const remainingSec = expSec - nowSec;
        if (remainingSec < 3600) {
          badgeExp.classList.add('warning-token');
          badgeExpIcon.textContent = '▲';
          badgeExpText.textContent = `${relative} (${expDate.toLocaleTimeString()})`;
        } else {
          badgeExp.classList.add('active-token');
          badgeExpIcon.textContent = '●';
          badgeExpText.textContent = `Active • ${relative}`;
        }
      } else {
        // Expired
        badgeExp.classList.add('expired-token');
        badgeExpIcon.textContent = '✕';
        badgeExpText.textContent = `Expired • ${relative}`;
      }
    } else {
      badgeExp.textContent = 'No Expiration (exp not specified)';
    }

    // Issued At (iat)
    if (typeof currentPayloadObj.iat === 'number') {
      badgeIssued.style.display = 'inline-flex';
      const iatDate = new Date(currentPayloadObj.iat * 1000);
      badgeIssuedText.textContent = iatDate.toLocaleDateString();
    } else {
      badgeIssued.style.display = 'none';
    }

    // Render claims table
    renderClaimsTable(currentPayloadObj);

    // Auto check signature if HS256 and secret exists
    if (currentHeaderObj.alg === 'HS256' && jwtSecret.value) {
      verifySignature();
    } else if (currentHeaderObj.alg && currentHeaderObj.alg !== 'HS256') {
      verifyStatus.className = 'verify-result neutral';
      verifyStatus.innerHTML = `ℹ Token uses <strong>${escapeHtml(currentHeaderObj.alg)}</strong> algorithm (Asymmetric Public/Private Key). HMAC simulation is configured for symmetric keys (HS256).`;
    }
  }

  // Render claims inspection table
  function renderClaimsTable(payload) {
    const keys = Object.keys(payload);
    if (keys.length === 0) {
      claimsTableBody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-tertiary);">No claims found in payload.</td></tr>';
      return;
    }

    const rows = keys.map((key) => {
      const val = payload[key];
      const desc = STANDARD_CLAIMS[key] || 'Custom application claim';
      let formattedVal = '';
      let interpretation = '';

      if (key === 'exp' || key === 'iat' || key === 'nbf' || key === 'auth_time') {
        if (typeof val === 'number') {
          const d = new Date(val * 1000);
          formattedVal = `<span style="font-family: monospace;">${val}</span>`;
          interpretation = `<div style="font-size: 0.8rem; color: var(--accent); margin-top: 0.25rem;">📅 ${d.toLocaleString()} (${d.toISOString()})</div>`;
        } else {
          formattedVal = escapeHtml(String(val));
        }
      } else if (typeof val === 'object' && val !== null) {
        formattedVal = `<pre style="margin: 0; font-family: monospace; font-size: 0.8rem; max-height: 80px; overflow-y: auto;">${escapeHtml(JSON.stringify(val, null, 2))}</pre>`;
      } else {
        formattedVal = escapeHtml(String(val));
      }

      return `
        <tr>
          <td><span class="claim-tag">${escapeHtml(key)}</span></td>
          <td>${formattedVal}</td>
          <td>
            <div>${escapeHtml(desc)}</div>
            ${interpretation}
          </td>
        </tr>
      `;
    }).join('');

    claimsTableBody.innerHTML = rows;
  }

  // Verify HMAC-SHA256 signature
  async function verifySignature() {
    if (currentParts.length !== 3) {
      verifyStatus.className = 'verify-result failure';
      verifyStatus.textContent = 'Please enter a valid 3-part JWT token first.';
      return;
    }

    const alg = (currentHeaderObj && currentHeaderObj.alg) || 'HS256';
    if (alg !== 'HS256') {
      verifyStatus.className = 'verify-result neutral';
      verifyStatus.innerHTML = `Token algorithm is <strong>${escapeHtml(alg)}</strong>. Browser HMAC verification supports HS256 symmetric keys.`;
      return;
    }

    const secret = jwtSecret.value;
    if (!secret) {
      verifyStatus.className = 'verify-result failure';
      verifyStatus.textContent = 'Please provide a signing secret key to verify the signature.';
      return;
    }

    try {
      const dataToSign = `${currentParts[0]}.${currentParts[1]}`;
      const enc = new TextEncoder();
      let keyBytes;

      if (secretBase64.checked) {
        // Decode base64 secret
        const binary = atob(secret);
        keyBytes = Uint8Array.from(binary, c => c.charCodeAt(0));
      } else {
        keyBytes = enc.encode(secret);
      }

      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyBytes,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const computedSigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(dataToSign));
      const computedSigBase64Url = toBase64Url(new Uint8Array(computedSigBuffer));

      const actualSig = currentParts[2];

      if (computedSigBase64Url === actualSig) {
        verifyStatus.className = 'verify-result success';
        verifyStatus.innerHTML = `✓ <strong>Signature Verified!</strong> The HMAC-SHA256 signature matches the token header and payload with the specified secret.`;
      } else {
        verifyStatus.className = 'verify-result failure';
        verifyStatus.innerHTML = `✗ <strong>Signature Invalid:</strong> The calculated signature did not match the token signature. The secret may be incorrect, or the payload may have been modified.`;
      }
    } catch (err) {
      verifyStatus.className = 'verify-result failure';
      verifyStatus.textContent = `Verification error: ${err.message}`;
    }
  }

  function showError(msg) {
    jwtInputError.textContent = msg;
    jwtInputError.style.display = 'block';
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Pre-generate sample tokens with valid cryptographic signatures
  async function generateSampleToken(options) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    let payload = {};

    if (options.preset === 'active') {
      payload = {
        sub: 'usr_auth0_892019482',
        name: 'Alex Mercer',
        email: 'alex.mercer@example.com',
        role: 'Senior Cloud Engineer',
        iss: 'https://auth.enterprise-cloud.io/',
        aud: 'https://api.enterprise-cloud.io/v2',
        iat: now - 3600, // issued 1 hour ago
        exp: now + 86400 * 7, // expires in 7 days
        jti: 'f56c80de-824b-47e0-9ef1-4bcfc709c91a'
      };
    } else if (options.preset === 'expired') {
      payload = {
        sub: 'usr_oauth_expired_9921',
        name: 'Diana Prince',
        email: 'diana.prince@example.org',
        role: 'Guest Member',
        iss: 'https://identity.global-service.net/',
        aud: 'https://api.global-service.net',
        iat: now - 86400 * 30, // issued 30 days ago
        exp: now - 86400 * 2,  // expired 2 days ago
        jti: 'a12bc900-11ff-4e92-8012-de789234bb44'
      };
    } else if (options.preset === 'roles') {
      payload = {
        sub: 'usr_rbac_superadmin',
        name: 'Jordan Bell',
        email: 'jbell@example.com',
        roles: ['superadmin', 'billing_admin', 'devops_lead'],
        scope: 'read:all write:all audit:logs deploy:production',
        organization_id: 'org_88192a0',
        tenant: 'us-east-cluster',
        iss: 'https://auth.fintech-security.com/',
        aud: 'https://gateway.fintech-security.com/',
        iat: now - 1800,
        exp: now + 86400 * 30,
        jti: 'e28b1234-9988-410a-b333-789123456789'
      };
    }

    const secret = 'secret-key-123';
    jwtSecret.value = secret;
    secretBase64.checked = false;

    const hB64 = stringToBase64Url(JSON.stringify(header));
    const pB64 = stringToBase64Url(JSON.stringify(payload));
    const dataToSign = `${hB64}.${pB64}`;

    const enc = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const sigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(dataToSign));
    const sigB64 = toBase64Url(new Uint8Array(sigBuffer));

    return `${hB64}.${pB64}.${sigB64}`;
  }

  // Event Listeners
  jwtInput.addEventListener('input', parseJWT);

  btnClearJwt.addEventListener('click', () => {
    jwtInput.value = '';
    parseJWT();
    jwtInput.focus();
  });

  btnPasteJwt.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      jwtInput.value = text;
      parseJWT();
    } catch (e) {
      jwtInput.focus();
    }
  });

  btnCopyHeader.addEventListener('click', () => {
    if (!currentHeaderObj) return;
    navigator.clipboard.writeText(JSON.stringify(currentHeaderObj, null, 2)).then(() => {
      const orig = btnCopyHeader.textContent;
      btnCopyHeader.textContent = 'Copied!';
      setTimeout(() => btnCopyHeader.textContent = orig, 1500);
    });
  });

  btnCopyPayload.addEventListener('click', () => {
    if (!currentPayloadObj) return;
    navigator.clipboard.writeText(JSON.stringify(currentPayloadObj, null, 2)).then(() => {
      const orig = btnCopyPayload.textContent;
      btnCopyPayload.textContent = 'Copied!';
      setTimeout(() => btnCopyPayload.textContent = orig, 1500);
    });
  });

  btnVerifySig.addEventListener('click', verifySignature);
  jwtSecret.addEventListener('input', verifySignature);
  secretBase64.addEventListener('change', verifySignature);

  // Preset button actions
  btnPresetActive.addEventListener('click', async () => {
    const token = await generateSampleToken({ preset: 'active' });
    jwtInput.value = token;
    parseJWT();
  });

  btnPresetExpired.addEventListener('click', async () => {
    const token = await generateSampleToken({ preset: 'expired' });
    jwtInput.value = token;
    parseJWT();
  });

  btnPresetRoles.addEventListener('click', async () => {
    const token = await generateSampleToken({ preset: 'roles' });
    jwtInput.value = token;
    parseJWT();
  });

  // Load default preset on initialization
  generateSampleToken({ preset: 'active' }).then(token => {
    jwtInput.value = token;
    parseJWT();
  });
});