// User Agent Parser - Client-Side Logic
document.addEventListener('DOMContentLoaded', () => {
  const uaInput = document.getElementById('ua-input');
  const uaPreset = document.getElementById('ua-preset');
  const btnParse = document.getElementById('btn-parse-ua');
  const btnCurrent = document.getElementById('btn-current-ua');
  const btnCopyJson = document.getElementById('btn-copy-json');
  const btnClear = document.getElementById('btn-clear-ua');

  // Diag Card Elements
  const diagBrowserName = document.getElementById('diag-browser-name');
  const diagBrowserVer = document.getElementById('diag-browser-ver');
  const diagBrowserMajor = document.getElementById('diag-browser-major');

  const diagEngineName = document.getElementById('diag-engine-name');
  const diagEngineVer = document.getElementById('diag-engine-ver');
  const diagEngineBadge = document.getElementById('diag-engine-badge');

  const diagOsName = document.getElementById('diag-os-name');
  const diagOsVer = document.getElementById('diag-os-ver');
  const diagOsBadge = document.getElementById('diag-os-badge');

  const diagDeviceType = document.getElementById('diag-device-type');
  const diagDeviceModel = document.getElementById('diag-device-model');
  const diagDeviceBadge = document.getElementById('diag-device-badge');

  const diagCpuArch = document.getElementById('diag-cpu-arch');
  const diagCpuBits = document.getElementById('diag-cpu-bits');
  const diagCpuBadge = document.getElementById('diag-cpu-badge');

  // Table Elements
  const tblBrowser = document.getElementById('tbl-browser');
  const tblBrowserVer = document.getElementById('tbl-browser-ver');
  const tblEngine = document.getElementById('tbl-engine');
  const tblEngineVer = document.getElementById('tbl-engine-ver');
  const tblOs = document.getElementById('tbl-os');
  const tblDevice = document.getElementById('tbl-device');
  const tblCpu = document.getElementById('tbl-cpu');
  const tblBot = document.getElementById('tbl-bot');
  const tokenChips = document.getElementById('token-chips');
  const uaJsonOutput = document.getElementById('ua-json-output');

  let currentAnalysis = null;

  // Preset User Agents
  const PRESETS = {
    'chrome-win': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    'safari-mac': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
    'iphone-ios': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    'ipad-ios': 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    'android-chrome': 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/UD1A.231105.004) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.6613.88 Mobile Safari/537.36',
    'firefox-linux': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:129.0) Gecko/20100101 Firefox/129.0',
    'edge-win': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.2739.67',
    'googlebot': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'bingbot': 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
    'duckduckbot': 'DuckDuckBot/1.1; (+https://duckduckgo.com/duckduckbot.html)',
    'curl': 'curl/8.4.0',
    'postman': 'PostmanRuntime/7.39.0'
  };

  // ==========================================
  // Core UA Parser Engine
  // ==========================================
  function parseUserAgent(ua) {
    const raw = (ua || '').trim();
    if (!raw) {
      return {
        raw: '',
        browser: { name: 'Empty', version: 'N/A', major: 'N/A' },
        engine: { name: 'N/A', version: 'N/A' },
        os: { name: 'N/A', version: 'N/A' },
        device: { type: 'Unknown', model: 'N/A', isBot: false },
        cpu: { architecture: 'N/A', bitDepth: 'N/A' },
        tokens: []
      };
    }

    // 1. Bot Check
    let isBot = false;
    let botName = null;
    const botRegex = /(Googlebot|bingbot|Baiduspider|YandexBot|DuckDuckBot|Slurp|Sogou|Exabot|facebot|facebookexternalhit|Twitterbot|LinkedInBot|Applebot|crawle?r|spider|bot|curl|Wget|PostmanRuntime)/i;
    const botMatch = raw.match(botRegex);
    if (botMatch) {
      isBot = true;
      botName = botMatch[1];
    }

    // 2. Browser Detection
    let browserName = 'Unknown Browser';
    let browserVer = 'N/A';

    if (/Edg(?:e|A|iOS)?\/([0-9.]+)/i.test(raw)) {
      browserName = 'Microsoft Edge';
      browserVer = RegExp.$1;
    } else if (/OPR\/([0-9.]+)/i.test(raw) || /Opera\/([0-9.]+)/i.test(raw)) {
      browserName = 'Opera';
      browserVer = RegExp.$1;
    } else if (/SamsungBrowser\/([0-9.]+)/i.test(raw)) {
      browserName = 'Samsung Internet';
      browserVer = RegExp.$1;
    } else if (/UCBrowser\/([0-9.]+)/i.test(raw)) {
      browserName = 'UC Browser';
      browserVer = RegExp.$1;
    } else if (/YaBrowser\/([0-9.]+)/i.test(raw)) {
      browserName = 'Yandex Browser';
      browserVer = RegExp.$1;
    } else if (/DuckDuckGo\/([0-9.]+)/i.test(raw)) {
      browserName = 'DuckDuckGo Browser';
      browserVer = RegExp.$1;
    } else if (/Vivaldi\/([0-9.]+)/i.test(raw)) {
      browserName = 'Vivaldi';
      browserVer = RegExp.$1;
    } else if (/Brave\/([0-9.]+)/i.test(raw)) {
      browserName = 'Brave';
      browserVer = RegExp.$1;
    } else if (/HeadlessChrome\/([0-9.]+)/i.test(raw)) {
      browserName = 'Headless Chrome';
      browserVer = RegExp.$1;
    } else if (/Chrome\/([0-9.]+)/i.test(raw) || /CriOS\/([0-9.]+)/i.test(raw)) {
      browserName = 'Google Chrome';
      browserVer = RegExp.$1;
    } else if (/Firefox\/([0-9.]+)/i.test(raw) || /FxiOS\/([0-9.]+)/i.test(raw)) {
      browserName = 'Mozilla Firefox';
      browserVer = RegExp.$1;
    } else if (/Version\/([0-9.]+).*Safari/i.test(raw)) {
      browserName = 'Apple Safari';
      browserVer = RegExp.$1;
    } else if (/Trident\/.*rv:([0-9.]+)/i.test(raw) || /MSIE\s([0-9.]+)/i.test(raw)) {
      browserName = 'Internet Explorer';
      browserVer = RegExp.$1;
    } else if (/curl\/([0-9.]+)/i.test(raw)) {
      browserName = 'cURL CLI';
      browserVer = RegExp.$1;
    } else if (/PostmanRuntime\/([0-9.]+)/i.test(raw)) {
      browserName = 'Postman Runtime';
      browserVer = RegExp.$1;
    } else if (isBot) {
      browserName = botName;
      const verMatch = raw.match(new RegExp(`${botName}\\/([0-9.]+)`, 'i'));
      browserVer = verMatch ? verMatch[1] : '1.0';
    }

    const browserMajor = browserVer !== 'N/A' ? browserVer.split('.')[0] : 'N/A';

    // 3. Engine Detection
    let engineName = 'Unknown Engine';
    let engineVer = 'N/A';

    if (/AppleWebKit\/([0-9.]+)/i.test(raw)) {
      const wkVer = RegExp.$1;
      if (/Chrome|Chromium|Edg|OPR|SamsungBrowser/i.test(raw) && !/Version\/.*Safari/i.test(raw)) {
        engineName = 'Blink';
        engineVer = browserVer !== 'N/A' ? browserVer : wkVer;
      } else {
        engineName = 'WebKit';
        engineVer = wkVer;
      }
    } else if (/Gecko\/([0-9.]+)/i.test(raw)) {
      engineName = 'Gecko';
      if (/rv:([0-9.]+)/i.test(raw)) {
        engineVer = RegExp.$1;
      } else {
        engineVer = RegExp.$1;
      }
    } else if (/Trident\/([0-9.]+)/i.test(raw)) {
      engineName = 'Trident';
      engineVer = RegExp.$1;
    } else if (/Presto\/([0-9.]+)/i.test(raw)) {
      engineName = 'Presto';
      engineVer = RegExp.$1;
    } else if (isBot || /curl|postman/i.test(raw)) {
      engineName = 'CLI / HTTP Protocol';
      engineVer = 'N/A';
    }

    // 4. Operating System Detection
    let osName = 'Unknown OS';
    let osVer = 'N/A';

    if (/Windows NT ([0-9.]+)/i.test(raw)) {
      const nt = RegExp.$1;
      osName = 'Windows';
      if (nt === '10.0') {
        // Distinguish Windows 11 vs 10 if build numbers hint, but general standard is 10/11
        osVer = '10 / 11';
      } else if (nt === '6.3') osVer = '8.1';
      else if (nt === '6.2') osVer = '8';
      else if (nt === '6.1') osVer = '7';
      else if (nt === '6.0') osVer = 'Vista';
      else if (nt === '5.1' || nt === '5.2') osVer = 'XP';
      else osVer = `NT ${nt}`;
    } else if (/iPhone OS ([0-9_]+)/i.test(raw)) {
      osName = 'iOS (iPhone)';
      osVer = RegExp.$1.replace(/_/g, '.');
    } else if (/CPU OS ([0-9_]+)/i.test(raw)) {
      osName = 'iPadOS';
      osVer = RegExp.$1.replace(/_/g, '.');
    } else if (/Mac OS X ([0-9_.]+)/i.test(raw)) {
      osName = 'macOS';
      osVer = RegExp.$1.replace(/_/g, '.');
      const majorMac = parseFloat(osVer);
      if (majorMac >= 14) osVer += ' (Sonoma+)';
      else if (majorMac >= 13) osVer += ' (Ventura)';
      else if (majorMac >= 12) osVer += ' (Monterey)';
      else if (majorMac >= 11) osVer += ' (Big Sur)';
      else if (osVer.startsWith('10.15')) osVer += ' (Catalina)';
    } else if (/Android ([0-9.]+)/i.test(raw)) {
      osName = 'Android';
      osVer = RegExp.$1;
    } else if (/CrOS ([a-zA-Z0-9_]+) ([0-9.]+)/i.test(raw)) {
      osName = 'Chrome OS';
      osVer = RegExp.$2;
    } else if (/Ubuntu/i.test(raw)) {
      osName = 'Ubuntu Linux';
      osVer = 'Linux';
    } else if (/Fedora/i.test(raw)) {
      osName = 'Fedora Linux';
      osVer = 'Linux';
    } else if (/Linux/i.test(raw)) {
      osName = 'Linux';
      osVer = 'Kernel';
    } else if (/FreeBSD/i.test(raw)) {
      osName = 'FreeBSD';
      osVer = 'BSD';
    }

    // 5. Device Type Detection
    let deviceType = 'Desktop';
    let deviceModel = 'Generic PC / Workstation';

    if (isBot) {
      deviceType = 'Bot / Crawler';
      deviceModel = botName || 'Web Spider';
    } else if (/iPad/i.test(raw) || (/Android/i.test(raw) && !/Mobile/i.test(raw)) || /Tablet|PlayBook|Silk/i.test(raw)) {
      deviceType = 'Tablet';
      deviceModel = /iPad/i.test(raw) ? 'Apple iPad' : 'Tablet Device';
    } else if (/iPhone/i.test(raw)) {
      deviceType = 'Mobile';
      deviceModel = 'Apple iPhone';
    } else if (/iPod/i.test(raw)) {
      deviceType = 'Mobile';
      deviceModel = 'Apple iPod';
    } else if (/Android.*Mobile/i.test(raw) || /Mobile.*Android/i.test(raw)) {
      deviceType = 'Mobile';
      const m = raw.match(/Android[^;]+;\s*([^;)]+)\s*Build/i);
      deviceModel = m ? m[1].trim() : 'Android Smartphone';
    } else if (/Mobile/i.test(raw)) {
      deviceType = 'Mobile';
      deviceModel = 'Mobile Handset';
    } else if (/Macintosh/i.test(raw)) {
      deviceType = 'Desktop';
      deviceModel = 'Apple Mac';
    } else if (/Windows/i.test(raw)) {
      deviceType = 'Desktop';
      deviceModel = 'Windows PC';
    } else if (/Linux/i.test(raw)) {
      deviceType = 'Desktop';
      deviceModel = 'Linux Workstation';
    }

    // 6. CPU Architecture
    let cpuArch = 'x86_64';
    let cpuBits = '64-bit';

    if (/x86_64|x64|Win64|WOW64|amd64/i.test(raw)) {
      cpuArch = 'x86-64 (AMD64)';
      cpuBits = '64-bit';
    } else if (/aarch64|arm64/i.test(raw)) {
      cpuArch = 'ARM64 (AArch64)';
      cpuBits = '64-bit';
    } else if (/armv[0-9]+l?/i.test(raw)) {
      cpuArch = 'ARM';
      cpuBits = '32-bit';
    } else if (/i[3-6]86|x86/i.test(raw)) {
      cpuArch = 'x86 (Intel/AMD)';
      cpuBits = '32-bit';
    } else if (/Macintosh/i.test(raw) && !/Intel/i.test(raw)) {
      cpuArch = 'Apple Silicon (ARM64)';
      cpuBits = '64-bit';
    } else if (/Macintosh.*Intel/i.test(raw)) {
      cpuArch = 'Intel x86-64';
      cpuBits = '64-bit';
    } else if (/iPhone|iPad/i.test(raw)) {
      cpuArch = 'Apple ARM64';
      cpuBits = '64-bit';
    } else if (/Android/i.test(raw)) {
      cpuArch = 'ARM64 / ARM';
      cpuBits = '64-bit';
    }

    // 7. Extract Tokens
    const tokens = [];
    const parensMatch = raw.match(/\(([^)]+)\)/g);
    if (parensMatch) {
      parensMatch.forEach(p => {
        const inner = p.slice(1, -1);
        inner.split(';').forEach(tok => {
          const t = tok.trim();
          if (t && !tokens.includes(t)) tokens.push(t);
        });
      });
    }

    const slashMatch = raw.match(/[a-zA-Z0-9_\-]+(?:\/[a-zA-Z0-9._\-]+)?/g);
    if (slashMatch) {
      slashMatch.forEach(tok => {
        if (!tok.includes('(') && !tok.includes(')') && !tokens.includes(tok)) {
          if (tokens.length < 16) tokens.push(tok);
        }
      });
    }

    return {
      raw,
      browser: {
        name: browserName,
        version: browserVer,
        major: browserMajor
      },
      engine: {
        name: engineName,
        version: engineVer
      },
      os: {
        name: osName,
        version: osVer
      },
      device: {
        type: deviceType,
        model: deviceModel,
        isBot
      },
      cpu: {
        architecture: cpuArch,
        bitDepth: cpuBits
      },
      tokens
    };
  }

  // ==========================================
  // Render Diagnostics to DOM
  // ==========================================
  function renderAnalysis(data) {
    currentAnalysis = data;

    // 1. Browser Card
    diagBrowserName.textContent = data.browser.name;
    diagBrowserVer.textContent = `Version: ${data.browser.version}`;
    diagBrowserMajor.textContent = `Major: ${data.browser.major}`;

    // 2. Engine Card
    diagEngineName.textContent = data.engine.name;
    diagEngineVer.textContent = `Version: ${data.engine.version}`;
    diagEngineBadge.textContent = data.engine.name !== 'Unknown Engine' ? data.engine.name : 'Engine';

    // 3. OS Card
    diagOsName.textContent = data.os.name;
    diagOsVer.textContent = `Version: ${data.os.version}`;
    diagOsBadge.textContent = data.os.name !== 'Unknown OS' ? data.os.name.split(' ')[0] : 'Platform';

    // 4. Device Card
    diagDeviceType.textContent = data.device.type;
    diagDeviceModel.textContent = `Model: ${data.device.model}`;
    diagDeviceBadge.textContent = data.device.type;
    diagDeviceBadge.className = 'diag-badge';
    if (data.device.isBot) {
      diagDeviceBadge.classList.add('bot');
    } else if (data.device.type === 'Mobile') {
      diagDeviceBadge.classList.add('mobile');
    } else if (data.device.type === 'Tablet') {
      diagDeviceBadge.classList.add('tablet');
    } else {
      diagDeviceBadge.classList.add('desktop');
    }

    // 5. CPU Card
    diagCpuArch.textContent = data.cpu.architecture;
    diagCpuBits.textContent = `Depth: ${data.cpu.bitDepth}`;
    diagCpuBadge.textContent = data.cpu.bitDepth;

    // Table view
    tblBrowser.textContent = data.browser.name;
    tblBrowserVer.textContent = data.browser.version;
    tblEngine.textContent = data.engine.name;
    tblEngineVer.textContent = data.engine.version;
    tblOs.textContent = `${data.os.name} (${data.os.version})`;
    tblDevice.textContent = `${data.device.type} - ${data.device.model}`;
    tblCpu.textContent = `${data.cpu.architecture} (${data.cpu.bitDepth})`;
    tblBot.textContent = data.device.isBot ? `Yes (Identified Crawler)` : 'No (Standard Client)';
    tblBot.style.color = data.device.isBot ? 'var(--warning)' : 'var(--success)';

    // Token Chips
    tokenChips.innerHTML = '';
    if (data.tokens && data.tokens.length > 0) {
      data.tokens.forEach(tok => {
        const chip = document.createElement('span');
        chip.className = 'token-chip';
        chip.textContent = tok;
        tokenChips.appendChild(chip);
      });
    } else {
      tokenChips.innerHTML = '<span style="font-size: 0.8rem; color: var(--text-tertiary);">No structured tokens extracted</span>';
    }

    // JSON Output
    const jsonReport = {
      userAgent: data.raw,
      timestamp: new Date().toISOString(),
      browser: data.browser,
      engine: data.engine,
      operatingSystem: data.os,
      device: data.device,
      cpu: data.cpu
    };
    uaJsonOutput.textContent = JSON.stringify(jsonReport, null, 2);
  }

  function executeParse() {
    const val = uaInput.value;
    const res = parseUserAgent(val);
    renderAnalysis(res);
  }

  // Preset Selector change
  uaPreset.addEventListener('change', () => {
    const key = uaPreset.value;
    if (key && PRESETS[key]) {
      uaInput.value = PRESETS[key];
      executeParse();
    }
  });

  btnParse.addEventListener('click', executeParse);

  btnCurrent.addEventListener('click', () => {
    uaInput.value = navigator.userAgent;
    uaPreset.value = '';
    executeParse();
  });

  btnClear.addEventListener('click', () => {
    uaInput.value = '';
    uaPreset.value = '';
    executeParse();
    uaInput.focus();
  });

  btnCopyJson.addEventListener('click', () => {
    if (!uaJsonOutput.textContent) return;
    navigator.clipboard.writeText(uaJsonOutput.textContent).then(() => {
      const orig = btnCopyJson.textContent;
      btnCopyJson.textContent = 'Copied!';
      btnCopyJson.classList.add('copied');
      setTimeout(() => {
        btnCopyJson.textContent = orig;
        btnCopyJson.classList.remove('copied');
      }, 1800);
    });
  });

  // Initialize with Current Browser on launch
  uaInput.value = navigator.userAgent;
  executeParse();
});