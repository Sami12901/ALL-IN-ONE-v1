// Social Share & Direct Link Builder - Complete Client-Side Implementation

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Platform Selection
  const platformCards = document.querySelectorAll('.platform-card');
  const platformTitle = document.getElementById('platform-title');
  const platformBadge = document.getElementById('platform-badge');

  // DOM Elements - Fields
  const fieldRecipientContainer = document.getElementById('field-recipient-container');
  const labelRecipient = document.getElementById('label-recipient');
  const inputRecipient = document.getElementById('input-recipient');
  const hintRecipient = document.getElementById('hint-recipient');

  const fieldSubjectContainer = document.getElementById('field-subject-container');
  const inputSubject = document.getElementById('input-subject');

  const fieldTwitterModeContainer = document.getElementById('field-twitter-mode-container');
  const selectTwitterMode = document.getElementById('select-twitter-mode');

  const fieldMessageContainer = document.getElementById('field-message-container');
  const labelMessage = document.getElementById('label-message');
  const inputMessage = document.getElementById('input-message');

  const templatePills = document.querySelectorAll('.template-pill');

  // DOM Elements - Outputs & Actions
  const outputUrl = document.getElementById('output-url');
  const btnCopyUrl = document.getElementById('btn-copy-url');
  const btnTestUrl = document.getElementById('btn-test-url');
  const qrCanvas = document.getElementById('qr-canvas');
  const btnDownloadQr = document.getElementById('btn-download-qr');

  // Toast
  const appToast = document.getElementById('app-toast');
  let toastTimer = null;

  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    appToast.textContent = message;
    appToast.classList.add('show');
    toastTimer = setTimeout(() => {
      appToast.classList.remove('show');
    }, 2200);
  }

  // Active state
  let currentPlatform = 'whatsapp';
  let qrInstance = null;

  // Initialize QRious
  function initQR() {
    if (typeof window.QRious !== 'undefined') {
      qrInstance = new window.QRious({
        element: qrCanvas,
        size: 190,
        value: 'https://wa.me/',
        level: 'H',
        foreground: '#000000',
        background: '#ffffff'
      });
    } else {
      // Fallback if library failed to load
      const ctx = qrCanvas.getContext('2d');
      qrCanvas.width = 190;
      qrCanvas.height = 190;
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, 190, 190);
      ctx.fillStyle = '#333333';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('QR Preview Ready', 95, 95);
    }
  }

  // Platform UI configurations
  const PLATFORMS = {
    whatsapp: {
      title: 'WhatsApp Direct Chat',
      badge: 'wa.me',
      badgeColor: '#25D366',
      badgeBg: 'rgba(37, 211, 102, 0.15)',
      recipientLabel: 'Phone Number (with Country Code)',
      recipientPlaceholder: 'e.g. 14155552671 (no + or spaces)',
      recipientHint: 'Enter full international phone number without +, zeroes, or spaces.',
      showRecipient: true,
      showSubject: false,
      showTwitterMode: false,
      messageLabel: 'Pre-filled Custom Message',
      messagePlaceholder: 'Hello! I am interested in your services and would love to connect...'
    },
    telegram: {
      title: 'Telegram Direct / Share Link',
      badge: 't.me',
      badgeColor: '#2AABEE',
      badgeBg: 'rgba(42, 171, 238, 0.15)',
      recipientLabel: 'Telegram Username or Channel Handle',
      recipientPlaceholder: 'e.g. telegram_user (without @)',
      recipientHint: 'Enter public username without the @ symbol.',
      showRecipient: true,
      showSubject: false,
      showTwitterMode: false,
      messageLabel: 'Share Message Text',
      messagePlaceholder: 'Check out this amazing platform!'
    },
    messenger: {
      title: 'Facebook Messenger Click-to-Chat',
      badge: 'm.me',
      badgeColor: '#0084FF',
      badgeBg: 'rgba(0, 132, 255, 0.15)',
      recipientLabel: 'Facebook Page or Profile Username',
      recipientPlaceholder: 'e.g. mycompanypage or username',
      recipientHint: 'Enter your Facebook page username or personal vanity URL name.',
      showRecipient: true,
      showSubject: false,
      showTwitterMode: false,
      messageLabel: 'Pre-filled Note (For Reference)',
      messagePlaceholder: 'Note: Meta m.me links open direct chat directly into Messenger.'
    },
    twitter: {
      title: 'Twitter / X Share & Direct Link',
      badge: 'x.com',
      badgeColor: '#ffffff',
      badgeBg: 'rgba(255, 255, 255, 0.15)',
      recipientLabel: 'Twitter / X Username Handle',
      recipientPlaceholder: 'e.g. twitter_handle (without @)',
      recipientHint: 'Enter username without @ for profile/DM links.',
      showRecipient: true,
      showSubject: false,
      showTwitterMode: true,
      messageLabel: 'Tweet or DM Content',
      messagePlaceholder: 'Excited to announce our new update! Check it out here 🚀'
    },
    sms: {
      title: 'SMS Direct Text Message',
      badge: 'sms:',
      badgeColor: '#10b981',
      badgeBg: 'rgba(16, 185, 129, 0.15)',
      recipientLabel: 'Mobile Phone Number',
      recipientPlaceholder: 'e.g. +14155552671',
      recipientHint: 'Recipient mobile phone number.',
      showRecipient: true,
      showSubject: false,
      showTwitterMode: false,
      messageLabel: 'SMS Body Text',
      messagePlaceholder: 'Hi! Reaching out regarding your listing...'
    },
    email: {
      title: 'Email Mailto Link',
      badge: 'mailto:',
      badgeColor: '#ea4335',
      badgeBg: 'rgba(234, 67, 53, 0.15)',
      recipientLabel: 'Recipient Email Address',
      recipientPlaceholder: 'e.g. support@example.com',
      recipientHint: 'Enter target destination email address.',
      showRecipient: true,
      showSubject: true,
      showTwitterMode: false,
      messageLabel: 'Email Body Text',
      messagePlaceholder: 'Dear Team,\n\nI hope this email finds you well...'
    }
  };

  // Generate URL based on current inputs
  function generateUrl() {
    const recipient = inputRecipient.value.trim();
    const message = inputMessage.value.trim();
    const subject = inputSubject.value.trim();

    let url = '';

    switch (currentPlatform) {
      case 'whatsapp': {
        const cleanPhone = recipient.replace(/[^\d]/g, '');
        const encodedMsg = message ? encodeURIComponent(message) : '';
        if (cleanPhone) {
          url = `https://wa.me/${cleanPhone}${encodedMsg ? '?text=' + encodedMsg : ''}`;
        } else if (encodedMsg) {
          url = `https://api.whatsapp.com/send?text=${encodedMsg}`;
        } else {
          url = 'https://wa.me/';
        }
        break;
      }

      case 'telegram': {
        const cleanUser = recipient.replace(/^@/, '');
        const encodedMsg = message ? encodeURIComponent(message) : '';
        if (cleanUser && encodedMsg) {
          url = `https://t.me/share/url?url=${encodeURIComponent('https://t.me/' + cleanUser)}&text=${encodedMsg}`;
        } else if (cleanUser) {
          url = `https://t.me/${cleanUser}`;
        } else if (encodedMsg) {
          url = `https://t.me/share/url?text=${encodedMsg}`;
        } else {
          url = 'https://t.me/';
        }
        break;
      }

      case 'messenger': {
        const cleanUser = recipient.replace(/^@/, '');
        url = cleanUser ? `https://m.me/${cleanUser}` : 'https://m.me/';
        break;
      }

      case 'twitter': {
        const mode = selectTwitterMode.value;
        const cleanHandle = recipient.replace(/^@/, '');
        const encodedMsg = message ? encodeURIComponent(message) : '';

        if (mode === 'tweet') {
          url = `https://twitter.com/intent/tweet?text=${encodedMsg}`;
        } else if (mode === 'dm') {
          // Twitter DM requires recipient_id
          const recId = cleanHandle.replace(/[^\d]/g, '');
          url = `https://twitter.com/messages/compose?recipient_id=${recId}${encodedMsg ? '&text=' + encodedMsg : ''}`;
        } else {
          url = cleanHandle ? `https://x.com/${cleanHandle}` : 'https://x.com/';
        }
        break;
      }

      case 'sms': {
        const cleanPhone = recipient.replace(/[\s\-\(\)]/g, '');
        const encodedMsg = message ? encodeURIComponent(message) : '';
        url = `sms:${cleanPhone}${encodedMsg ? '?&body=' + encodedMsg : ''}`;
        break;
      }

      case 'email': {
        const cleanEmail = recipient;
        const params = [];
        if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
        if (message) params.push(`body=${encodeURIComponent(message)}`);
        const query = params.length > 0 ? `?${params.join('&')}` : '';
        url = `mailto:${cleanEmail}${query}`;
        break;
      }
    }

    outputUrl.value = url;

    // Update QR Code
    if (qrInstance) {
      qrInstance.value = url || 'https://all-in-one-v1.app';
    }
  }

  // Switch Platform UI
  function setPlatform(platformKey) {
    currentPlatform = platformKey;
    const config = PLATFORMS[platformKey];
    if (!config) return;

    // Highlight card
    platformCards.forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-platform') === platformKey);
    });

    // Update header
    platformTitle.textContent = config.title;
    platformBadge.textContent = config.badge;
    platformBadge.style.color = config.badgeColor;
    platformBadge.style.backgroundColor = config.badgeBg;
    platformBadge.style.borderColor = config.badgeColor;

    // Field visibility
    fieldRecipientContainer.style.display = config.showRecipient ? 'flex' : 'none';
    labelRecipient.textContent = config.recipientLabel;
    inputRecipient.placeholder = config.recipientPlaceholder;
    hintRecipient.textContent = config.recipientHint;

    fieldSubjectContainer.style.display = config.showSubject ? 'flex' : 'none';
    fieldTwitterModeContainer.style.display = config.showTwitterMode ? 'flex' : 'none';

    labelMessage.textContent = config.messageLabel;
    inputMessage.placeholder = config.messagePlaceholder;

    generateUrl();
  }

  // Message Presets
  const TEMPLATES = {
    support: "Hello! I am reaching out regarding customer support for my recent order. Could you please assist me?",
    booking: "Hi! I would like to schedule an appointment. What dates and times are currently available?",
    pricing: "Hello, I am interested in your pricing plans and services. Could you please share more details?",
    collab: "Hi there! I love your work and would like to explore a partnership or collaboration opportunity."
  };

  templatePills.forEach(pill => {
    pill.addEventListener('click', () => {
      const key = pill.getAttribute('data-template');
      if (TEMPLATES[key]) {
        inputMessage.value = TEMPLATES[key];
        generateUrl();
        showToast('Template message applied');
      }
    });
  });

  // Platform card click listener
  platformCards.forEach(card => {
    card.addEventListener('click', () => {
      const plat = card.getAttribute('data-platform');
      setPlatform(plat);
    });
  });

  // Form input listeners
  [inputRecipient, inputMessage, inputSubject, selectTwitterMode].forEach(el => {
    if (el) el.addEventListener('input', generateUrl);
  });
  if (selectTwitterMode) {
    selectTwitterMode.addEventListener('change', generateUrl);
  }

  // Copy URL
  btnCopyUrl.addEventListener('click', async () => {
    const url = outputUrl.value;
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard!');
    } catch {
      outputUrl.select();
      document.execCommand('copy');
      showToast('Copied to clipboard!');
    }
  });

  // Test URL
  btnTestUrl.addEventListener('click', () => {
    const url = outputUrl.value;
    if (!url) {
      showToast('No URL to test');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  // Download QR Code
  btnDownloadQr.addEventListener('click', () => {
    if (!qrCanvas) return;
    const dataUrl = qrCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${currentPlatform}-qr-code.png`;
    a.click();
    showToast('Downloaded QR Code image!');
  });

  // Initialize
  initQR();
  setPlatform('whatsapp');
});