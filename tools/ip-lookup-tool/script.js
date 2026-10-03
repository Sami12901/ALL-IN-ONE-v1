// IP Lookup Tool & CIDR Subnet Calculator - Client-Side Logic
document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const ipInput = document.getElementById('ip-input');
  const cidrSelect = document.getElementById('cidr-select');
  const btnCalc = document.getElementById('btn-calc');
  const btnCopySummary = document.getElementById('btn-copy-summary');
  const btnDownloadReport = document.getElementById('btn-download-report');
  const btnClear = document.getElementById('btn-clear');
  const ipError = document.getElementById('ip-error');

  // Quick Stat Badges
  const badgeNetwork = document.getElementById('badge-network');
  const badgeHosts = document.getElementById('badge-hosts');
  const badgeMask = document.getElementById('badge-mask');
  const badgeCategory = document.getElementById('badge-category');

  // Result Table Cells
  const resVersion = document.getElementById('res-version');
  const resIpStandard = document.getElementById('res-ip-standard');
  const resIpBinary = document.getElementById('res-ip-binary');
  const resMaskDecimal = document.getElementById('res-mask-decimal');
  const resMaskBinary = document.getElementById('res-mask-binary');
  const resWildcard = document.getElementById('res-wildcard');
  const resCidr = document.getElementById('res-cidr');
  const resNetwork = document.getElementById('res-network');
  const resBroadcast = document.getElementById('res-broadcast');
  const resUsableRange = document.getElementById('res-usable-range');
  const resUsableHosts = document.getElementById('res-usable-hosts');
  const resTotalAddresses = document.getElementById('res-total-addresses');
  const resClass = document.getElementById('res-class');
  const resCategory = document.getElementById('res-category');
  const resInteger = document.getElementById('res-integer');
  const resHex = document.getElementById('res-hex');

  let currentReportText = '';

  // ==========================================
  // Populate CIDR Dropdown (/0 to /32)
  // ==========================================
  function populateCidrDropdown() {
    cidrSelect.innerHTML = '';
    for (let i = 32; i >= 0; i--) {
      const opt = document.createElement('option');
      opt.value = i.toString();
      const maskStr = getIpv4MaskString(i);
      const hosts = i === 32 ? 1 : (i === 31 ? 2 : Math.pow(2, 32 - i) - 2);
      const totalAddrs = Math.pow(2, 32 - i);
      const formattedAddrs = totalAddrs.toLocaleString();
      opt.textContent = `/${i} (${maskStr}) — ${formattedAddrs} addrs`;
      if (i === 24) opt.selected = true;
      cidrSelect.appendChild(opt);
    }
  }

  // ==========================================
  // Math & Conversion Utilities
  // ==========================================
  function getIpv4MaskInt(prefix) {
    if (prefix === 0) return 0;
    return ((0xFFFFFFFF << (32 - prefix)) >>> 0);
  }

  function intToIp(intVal) {
    return [
      (intVal >>> 24) & 255,
      (intVal >>> 16) & 255,
      (intVal >>> 8) & 255,
      intVal & 255
    ].join('.');
  }

  function getIpv4MaskString(prefix) {
    return intToIp(getIpv4MaskInt(prefix));
  }

  function toBinary8(num) {
    return (num >>> 0).toString(2).padStart(8, '0');
  }

  function ipToBinaryString(ipStr) {
    return ipStr.split('.').map(o => toBinary8(parseInt(o, 10))).join('.');
  }

  function parseIpv4Octets(str) {
    const parts = str.split('.');
    if (parts.length !== 4) return null;
    const octets = [];
    for (const p of parts) {
      if (!/^\d+$/.test(p)) return null;
      const n = parseInt(p, 10);
      if (n < 0 || n > 255) return null;
      octets.push(n);
    }
    return octets;
  }

  function getIpv4Category(octets, ipInt) {
    const [o1, o2] = octets;
    if (o1 === 10) {
      return { name: 'Private Network', rfc: 'RFC 1918 (Class A Private)', type: 'private' };
    }
    if (o1 === 172 && (o2 >= 16 && o2 <= 31)) {
      return { name: 'Private Network', rfc: 'RFC 1918 (Class B Private)', type: 'private' };
    }
    if (o1 === 192 && o2 === 168) {
      return { name: 'Private Network', rfc: 'RFC 1918 (Class C Private)', type: 'private' };
    }
    if (o1 === 127) {
      return { name: 'Loopback', rfc: 'RFC 1122 (Host Loopback)', type: 'loopback' };
    }
    if (o1 === 169 && o2 === 254) {
      return { name: 'Link-Local', rfc: 'RFC 3927 (APIPA Auto-Config)', type: 'special' };
    }
    if (o1 === 100 && (o2 >= 64 && o2 <= 127)) {
      return { name: 'Carrier-Grade NAT', rfc: 'RFC 6598 (Shared Address Space)', type: 'special' };
    }
    if (o1 === 192 && o2 === 0 && octets[2] === 2) {
      return { name: 'Documentation (TEST-NET-1)', rfc: 'RFC 5737', type: 'special' };
    }
    if (o1 === 198 && o2 === 51 && octets[2] === 100) {
      return { name: 'Documentation (TEST-NET-2)', rfc: 'RFC 5737', type: 'special' };
    }
    if (o1 === 203 && o2 === 0 && octets[2] === 113) {
      return { name: 'Documentation (TEST-NET-3)', rfc: 'RFC 5737', type: 'special' };
    }
    if (o1 >= 224 && o1 <= 239) {
      return { name: 'Multicast', rfc: 'RFC 5771 (Class D Multicast)', type: 'special' };
    }
    if (o1 >= 240 && o1 <= 254) {
      return { name: 'Reserved (Experimental)', rfc: 'RFC 1112 (Class E)', type: 'special' };
    }
    if (ipInt === 0xFFFFFFFF) {
      return { name: 'Limited Broadcast', rfc: 'RFC 919', type: 'special' };
    }
    if (ipInt === 0) {
      return { name: 'This Host / Default Route', rfc: 'RFC 1122', type: 'special' };
    }
    return { name: 'Public Internet', rfc: 'Globally Routable Unicast', type: 'public' };
  }

  function getIpv4Class(firstOctet) {
    if (firstOctet >= 1 && firstOctet <= 126) return 'Class A (Large Networks)';
    if (firstOctet === 127) return 'Class A (Loopback reserved)';
    if (firstOctet >= 128 && firstOctet <= 191) return 'Class B (Medium Networks)';
    if (firstOctet >= 192 && firstOctet <= 223) return 'Class C (Small Networks)';
    if (firstOctet >= 224 && firstOctet <= 239) return 'Class D (Multicast Group)';
    if (firstOctet >= 240 && firstOctet <= 255) return 'Class E (Experimental/Research)';
    return 'N/A';
  }

  // ==========================================
  // Calculate IPv4 Subnet
  // ==========================================
  function calculateIpv4(ipStr, prefix) {
    const octets = parseIpv4Octets(ipStr);
    if (!octets) {
      throw new Error(`Invalid IPv4 address format: "${ipStr}". Must be 4 numbers between 0 and 255 separated by dots.`);
    }

    const ipInt = (octets[0] * 16777216) + (octets[1] * 65536) + (octets[2] * 256) + octets[3];
    const maskInt = getIpv4MaskInt(prefix);
    const wildcardInt = (~maskInt) >>> 0;
    const networkInt = (ipInt & maskInt) >>> 0;
    const broadcastInt = (networkInt | wildcardInt) >>> 0;

    const totalAddresses = Math.pow(2, 32 - prefix);
    let usableHosts;
    let usableRange;

    if (prefix === 32) {
      usableHosts = 1;
      usableRange = `${intToIp(ipInt)} (Single Host Route)`;
    } else if (prefix === 31) {
      usableHosts = 2;
      usableRange = `${intToIp(networkInt)} - ${intToIp(broadcastInt)} (RFC 3021 Point-to-Point)`;
    } else {
      usableHosts = totalAddresses - 2;
      usableRange = `${intToIp(networkInt + 1)} - ${intToIp(broadcastInt - 1)}`;
    }

    const maskStr = intToIp(maskInt);
    const wildcardStr = intToIp(wildcardInt);
    const networkStr = intToIp(networkInt);
    const broadcastStr = prefix >= 31 ? 'N/A (Host / P2P Subnet)' : intToIp(broadcastInt);
    const ipClass = getIpv4Class(octets[0]);
    const categoryInfo = getIpv4Category(octets, ipInt);
    const hexStr = '0x' + (ipInt >>> 0).toString(16).toUpperCase().padStart(8, '0');

    // Render Quick Stats
    badgeNetwork.textContent = `${networkStr}/${prefix}`;
    badgeHosts.textContent = usableHosts.toLocaleString();
    badgeMask.textContent = maskStr;
    badgeCategory.textContent = categoryInfo.name;

    // Render Table
    resVersion.textContent = 'IPv4 (Internet Protocol v4)';
    resIpStandard.textContent = ipStr;
    resIpBinary.textContent = ipToBinaryString(ipStr);
    resMaskDecimal.textContent = maskStr;
    resMaskBinary.textContent = ipToBinaryString(maskStr);
    resWildcard.textContent = wildcardStr;
    resCidr.textContent = `/${prefix}`;
    resNetwork.textContent = `${networkStr}/${prefix}`;
    resBroadcast.textContent = broadcastStr;
    resUsableRange.textContent = usableRange;
    resUsableHosts.textContent = usableHosts.toLocaleString();
    resTotalAddresses.textContent = totalAddresses.toLocaleString();
    resClass.textContent = ipClass;
    resCategory.innerHTML = `<span class="tag-category tag-${categoryInfo.type}">${categoryInfo.name}</span> <span style="color: var(--text-secondary); font-size: 0.85rem; margin-left: 0.5rem;">(${categoryInfo.rfc})</span>`;
    resInteger.textContent = (ipInt >>> 0).toString(10);
    resHex.textContent = hexStr;

    // Generate Text Report
    currentReportText = [
      '================================================================',
      '                   ALL IN ONE - IP & CIDR SUBNET REPORT        ',
      '================================================================',
      `Target IP Address:      ${ipStr}`,
      `CIDR Prefix:            /${prefix}`,
      `IP Protocol Version:    IPv4`,
      `Binary Representation:  ${ipToBinaryString(ipStr)}`,
      `Subnet Mask:            ${maskStr} (${ipToBinaryString(maskStr)})`,
      `Wildcard Mask:          ${wildcardStr}`,
      `Network Address:        ${networkStr}/${prefix}`,
      `Broadcast Address:      ${broadcastStr}`,
      `Usable Host Range:      ${usableRange}`,
      `Total Usable Hosts:     ${usableHosts.toLocaleString()}`,
      `Total Block Addresses:  ${totalAddresses.toLocaleString()}`,
      `Address Class:          ${ipClass}`,
      `RFC Category:           ${categoryInfo.name} [${categoryInfo.rfc}]`,
      `Hex Representation:     ${hexStr}`,
      `32-Bit Decimal Integer: ${(ipInt >>> 0).toString(10)}`,
      '================================================================',
      `Generated on: ${new Date().toISOString()}`
    ].join('\n');
  }

  // ==========================================
  // Calculate IPv6 Address
  // ==========================================
  function calculateIpv6(ipStr, prefixRaw) {
    const cleanIp = ipStr.toLowerCase().trim();
    const prefix = prefixRaw ? parseInt(prefixRaw, 10) : 64;

    let category = 'Global Unicast';
    let rfc = 'RFC 4291';
    let tagType = 'public';

    if (cleanIp === '::1' || cleanIp === '0:0:0:0:0:0:0:1') {
      category = 'Loopback Address';
      rfc = 'RFC 4291 (::1/128)';
      tagType = 'loopback';
    } else if (cleanIp === '::') {
      category = 'Unspecified Address';
      rfc = 'RFC 4291 (::/128)';
      tagType = 'special';
    } else if (cleanIp.startsWith('fe80:') || cleanIp.startsWith('fe80::')) {
      category = 'Link-Local Unicast';
      rfc = 'RFC 4291 (fe80::/10)';
      tagType = 'special';
    } else if (cleanIp.startsWith('fc00:') || cleanIp.startsWith('fd')) {
      category = 'Unique Local (ULA)';
      rfc = 'RFC 4193 (fc00::/7)';
      tagType = 'private';
    } else if (cleanIp.startsWith('ff')) {
      category = 'Multicast Address';
      rfc = 'RFC 4291 (ff00::/8)';
      tagType = 'special';
    } else if (cleanIp.startsWith('2001:db8')) {
      category = 'Documentation Prefix';
      rfc = 'RFC 3849 (2001:db8::/32)';
      tagType = 'special';
    }

    badgeNetwork.textContent = `${cleanIp}/${prefix}`;
    badgeHosts.textContent = `2^${128 - prefix}`;
    badgeMask.textContent = `/${prefix} Prefix`;
    badgeCategory.textContent = category;

    resVersion.textContent = 'IPv6 (Internet Protocol v6 - 128-bit)';
    resIpStandard.textContent = cleanIp;
    resIpBinary.textContent = '128-bit Hexadecimal Notation';
    resMaskDecimal.textContent = `Prefix Length: /${prefix} bits`;
    resMaskBinary.textContent = `128 - ${prefix} = ${128 - prefix} host bits`;
    resWildcard.textContent = 'N/A (IPv6 uses prefix length exclusively)';
    resCidr.textContent = `/${prefix}`;
    resNetwork.textContent = `${cleanIp}/${prefix}`;
    resBroadcast.textContent = 'None (IPv6 does not use broadcast, uses multicast)';
    resUsableRange.textContent = `${cleanIp} (Subnet /${prefix})`;
    resUsableHosts.textContent = `2^${128 - prefix} (Approx. ${Math.pow(2, Math.min(64, 128 - prefix)).toExponential(2)} hosts)`;
    resTotalAddresses.textContent = `2^${128 - prefix}`;
    resClass.textContent = 'Classless (CIDR / IPv6 Global Addressing)';
    resCategory.innerHTML = `<span class="tag-category tag-${tagType}">${category}</span> <span style="color: var(--text-secondary); font-size: 0.85rem; margin-left: 0.5rem;">(${rfc})</span>`;
    resInteger.textContent = '128-bit large integer';
    resHex.textContent = cleanIp;

    currentReportText = [
      '================================================================',
      '                   ALL IN ONE - IPv6 SUBNET REPORT              ',
      '================================================================',
      `Target IPv6 Address:    ${cleanIp}`,
      `CIDR Prefix:            /${prefix}`,
      `IP Protocol Version:    IPv6 (128-bit)`,
      `Subnet Prefix Length:   /${prefix}`,
      `Broadcast Model:        Multicast Architecture (No broadcast)`,
      `RFC Category:           ${category} [${rfc}]`,
      `Available Space:        2^${128 - prefix} address allocations`,
      '================================================================',
      `Generated on: ${new Date().toISOString()}`
    ].join('\n');
  }

  // ==========================================
  // Execute Calculation Controller
  // ==========================================
  function runCalculation() {
    ipError.style.display = 'none';

    let raw = ipInput.value.trim();
    if (!raw) {
      ipError.textContent = 'Please enter an IP address.';
      ipError.style.display = 'block';
      return;
    }

    let prefix = parseInt(cidrSelect.value, 10);

    // Check if user entered IP/CIDR directly like 192.168.1.1/24 or ::1/128
    if (raw.includes('/')) {
      const parts = raw.split('/');
      raw = parts[0].trim();
      const slashPrefix = parseInt(parts[1].trim(), 10);
      if (!isNaN(slashPrefix)) {
        prefix = slashPrefix;
        if (prefix >= 0 && prefix <= 32) {
          cidrSelect.value = prefix.toString();
        }
      }
    }

    try {
      if (raw.includes(':')) {
        // IPv6
        calculateIpv6(raw, prefix || 64);
      } else {
        // IPv4
        calculateIpv4(raw, isNaN(prefix) ? 24 : prefix);
      }
    } catch (e) {
      ipError.textContent = e.message;
      ipError.style.display = 'block';
    }
  }

  // Event Listeners
  btnCalc.addEventListener('click', runCalculation);
  cidrSelect.addEventListener('change', runCalculation);
  ipInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') runCalculation();
  });

  btnClear.addEventListener('click', () => {
    ipInput.value = '';
    ipError.style.display = 'none';
    badgeNetwork.textContent = '--';
    badgeHosts.textContent = '--';
    badgeMask.textContent = '--';
    badgeCategory.textContent = '--';
    resVersion.textContent = '--';
    resIpStandard.textContent = '--';
    resIpBinary.textContent = '--';
    resMaskDecimal.textContent = '--';
    resMaskBinary.textContent = '--';
    resWildcard.textContent = '--';
    resCidr.textContent = '--';
    resNetwork.textContent = '--';
    resBroadcast.textContent = '--';
    resUsableRange.textContent = '--';
    resUsableHosts.textContent = '--';
    resTotalAddresses.textContent = '--';
    resClass.textContent = '--';
    resCategory.textContent = '--';
    resInteger.textContent = '--';
    resHex.textContent = '--';
    ipInput.focus();
  });

  // Presets pills
  document.querySelectorAll('.preset-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const ip = btn.getAttribute('data-ip');
      const cidr = btn.getAttribute('data-cidr');
      ipInput.value = ip;
      if (cidr && !ip.includes(':')) {
        cidrSelect.value = cidr;
      }
      runCalculation();
    });
  });

  // Copy Summary
  btnCopySummary.addEventListener('click', () => {
    if (!currentReportText) runCalculation();
    if (!currentReportText) return;

    navigator.clipboard.writeText(currentReportText).then(() => {
      const orig = btnCopySummary.textContent;
      btnCopySummary.textContent = 'Copied Summary!';
      btnCopySummary.classList.add('copied');
      setTimeout(() => {
        btnCopySummary.textContent = orig;
        btnCopySummary.classList.remove('copied');
      }, 1800);
    });
  });

  // Download Report
  btnDownloadReport.addEventListener('click', () => {
    if (!currentReportText) runCalculation();
    if (!currentReportText) return;

    const ipClean = ipInput.value.replace(/[^a-zA-Z0-9._\-]/g, '_') || 'subnet';
    const blob = new Blob([currentReportText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `subnet-report-${ipClean}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  });

  // Initialize
  populateCidrDropdown();
  runCalculation();
});