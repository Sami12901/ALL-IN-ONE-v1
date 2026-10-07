// AI Voice Translation Studio - Engine

function bufferToWave(abuffer, len) {
  const numOfChan = abuffer.numberOfChannels;
  const length = (len || abuffer.length) * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  let channels = [], i, sample, offset = 0, pos = 0;

  function writeString(s) { for (let j = 0; j < s.length; j++) out.setUint8(pos++, s.charCodeAt(j)); }
  function setUint16(data) { out.setUint16(pos, data, true); pos += 2; }
  function setUint32(data) { out.setUint32(pos, data, true); pos += 4; }

  writeString('RIFF');
  setUint32(length - 8);
  writeString('WAVE');
  writeString('fmt ');
  setUint32(16);
  setUint16(1);
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);
  writeString('data');
  setUint32(length - pos - 4);

  for (i = 0; i < abuffer.numberOfChannels; i++) channels.push(abuffer.getChannelData(i));

  while (offset < (len || abuffer.length)) {
    for (i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }
  return new Blob([out.buffer], { type: 'audio/wav' });
}

// MULTILINGUAL DICTIONARY MATRIX
const TRANSLATION_DATABASE = {
  hospitality: {
    en: "Welcome to our international hotel. Your deluxe executive suite is ready on the twelfth floor.",
    es: "Bienvenido a nuestro hotel internacional. Su suite ejecutiva de lujo está lista en el duodécimo piso.",
    fr: "Bienvenue dans notre hôtel international. Votre suite exécutive de luxe est prête au douzième étage.",
    de: "Willkommen in unserem internationalen Hotel. Ihre Deluxe-Executive-Suite steht auf der zwölften Etage bereit.",
    ar: "مرحبًا بكم في فندقنا الدولي. جناحكم التنفيذي الفاخر جاهز في الطابق الثاني عشر.",
    ja: "当国際ホテルへようこそ。12階のデラックスエグゼクティブスイートをご用意しております。",
    zh: "欢迎光临我们的国际酒店。您的豪华行政套房已在十二楼准备就绪。",
    it: "Benvenuti nel nostro hotel internazionale. La vostra suite executive deluxe è pronta al dodicesimo piano.",
    pt: "Bem-vindo ao nosso hotel internacional. Sua suíte executiva de luxo está pronta no décimo segundo andar.",
    ru: "Добро пожаловать в наш международный отель. Ваш представительский люкс готов на двенадцатом этаже.",
    tr: "Uluslararası otelimize hoş geldiniz. Lüks yönetici süitiniz on ikinci katta hazırdır.",
    hi: "हमारे अंतर्राष्ट्रीय होटल में आपका स्वागत है। आपका डीलक्स कार्यकारी सुइट बारहवीं मंजिल पर तैयार है।",
    bn: "আমাদের আন্তর্জাতিক হোটেলে স্বাগতম। দ্বাদশ তলায় আপনার ডিলাক্স এক্সিকিউটিভ স্যুট প্রস্তুত রয়েছে।",
    ur: "ہمارے بین الاقوامی ہوٹل میں خوش آمدید۔ آپ کا ڈیلکس ایگزیکٹو سویٹ بارہویں منزل پر تیار ہے۔"
  },
  keynote: {
    en: "Thank you for joining today's global executive briefing. We are pleased to announce our annual quarterly results.",
    es: "Gracias por acompañarnos en la sesión ejecutiva global de hoy. Nos complace anunciar nuestros resultados anuales.",
    fr: "Merci de participer à la réunion exécutive mondiale d'aujourd'hui. Nous avons le plaisir d'annoncer nos résultats annuels.",
    de: "Vielen Dank für Ihre Teilnahme am heutigen globalen Briefing. Wir freuen uns, unsere Jahresergebnisse bekanntzugeben.",
    ar: "شكرًا لانضمامكم إلى الإيجاز التنفيذي العالمي اليوم. يسعدنا أن نعلن عن نتائجنا الفصلية والسنوية.",
    ja: "本日のグローバルエグゼクティブブリーフィングにご参加いただきありがとうございます。年間業績を発表いたします。",
    zh: "感谢您参加今天的全球高管简报会。我们很高兴宣布年度季度财务业绩。",
    it: "Grazie per aver partecipato al briefing esecutivo globale di oggi. Siamo lieti di annunciare i nostri risultati annuali.",
    pt: "Obrigado por participar do briefing executivo global de hoje. Temos o prazer de anunciar nossos resultados trimestrais.",
    ru: "Спасибо за участие в сегодняшнем брифинге для руководителей. Мы рады объявить о наших годовых результатах.",
    tr: "Bugünkü küresel brifinge katıldığınız için teşekkür ederiz. Yıllık çeyrek sonuçlarımızı duyurmaktan memnuniyet duyuyoruz.",
    hi: "आज की वैश्विक कार्यकारी ब्रीफिंग में शामिल होने के लिए धन्यवाद। हम अपने वार्षिक परिणामों की घोषणा करते हुए प्रसन्न हैं।",
    bn: "আজকের বৈশ্বিক ব্রিফিংয়ে যোগদানের জন্য ধন্যবাদ। আমরা আমাদের বার্ষিক ফলাফল ঘোষণা করতে পেরে আনন্দিত।",
    ur: "آج کی عالمی ایگزیکٹو بریفنگ میں شامل ہونے کا شکریہ۔ ہمیں سالانہ نتائج کا اعلان کرتے ہوئے خوشی ہو رہی ہے۔"
  },
  ecommerce: {
    en: "Flash sale! Enjoy forty percent off on all designer fashion collections for the next twenty-four hours only.",
    es: "¡Venta flash! Disfrute de un cuarenta por ciento de descuento en colecciones de moda durante las próximas veinticuatro horas.",
    fr: "Vente flash ! Profitez de quarante pour cent de réduction sur toutes les collections de mode pour les prochaines 24 heures.",
    de: "Flash-Sale! Erhalten Sie vierzig Prozent Rabatt auf alle Designerkollektionen für die nächsten vierundzwanzig Stunden.",
    ar: "تخفيضات خاطفة! استمتعوا بخصم أربعين بالمائة على جميع تشكيلات الأزياء الراقية خلال الأربع وعشرين ساعة القادمة.",
    ja: "フラッシュセール開催！今後24時間限定で、すべてのデザイナーファッションが40％オフになります。",
    zh: "限时特卖！未来二十四小时内，所有设计师时尚系列享六折优惠。",
    it: "Vendita lampo! Approfitta del quaranta per cento di sconto su tutte le collezioni moda per le prossime ventiquattro ore.",
    pt: "Promoção relâmpago! Aproveite quarenta por cento de desconto em coleções de moda nas próximas vinte e quatro horas.",
    ru: "Флэш-распродажа! Скидка сорок процентов на все дизайнерские коллекции в течение следующих двадцати четырех часов.",
    tr: "Flaş indirim! Önümüzdeki yirmi dört saat boyunca tüm tasarımcı koleksiyonlarında yüzde kırk indirimin tadını çıkarın.",
    hi: "फ्लैश सेल! अगले चौबीस घंटों के लिए सभी फैशन संग्रहों पर चालीस प्रतिशत छूट का आनंद लें।",
    bn: "ফ্ল্যাশ সেল! আগামী চব্বিশ ঘণ্টার জন্য সব ফ্যাশন পোশাকে চল্লিশ শতাংশ ছাড় উপভোগ করুন।",
    ur: "فلیش سیل! اگلے چوبیس گھنٹوں کے لیے تمام فیشن کلیکشن پر چالیس فیصد رعایت کا فائدہ اٹھائیں۔"
  },
  airport: {
    en: "Attention passengers, flight three hundred is now boarding at Gate twenty-four. Please have your boarding pass ready.",
    es: "Atención pasajeros, el vuelo trescientos está abordando en la Puerta veinticuatro. Tenga su tarjeta de embarque lista.",
    fr: "Attention passagers, le vol trois cents embarque actuellement à la porte vingt-quatre. Veuillez préparer votre carte d'embarquement.",
    de: "Achtung Passagiere, Flug dreihundert beginnt mit dem Einsteigen an Gate vierundzwanzig. Bitte halten Sie Ihre Bordkarte bereit.",
    ar: "انتباه السادة المسافرين، الرحلة ثلاثمائة تبدأ الصعود الآن عند البوابة أربعة وعشرين. يرجى تجهيز بطاقة الصعود.",
    ja: "ご搭乗のお客様へご案内いたします。300便は現在24番ゲートより搭乗を開始しております。搭乗券をご用意ください。",
    zh: "各位旅客请注意，300次航班现在在24号登机口开始登机。请准备好您的登机牌。",
    it: "Attenzione passeggeri, il volo trecento sta imbarcando al Gate ventiquattro. Si prega di tenere pronta la carta d'imbarco.",
    pt: "Atenção passageiros, o voo trezentos está embarcando no Portão vinte e quatro. Por favor, tenham seu cartão de embarque em mãos.",
    ru: "Внимание пассажиров, рейс триста начинает посадку у выхода номер двадцать четыре. Приготовьте посадочный талон.",
    tr: "Yolcuların dikkatine, üç yüz numaralı uçuş yirmi dört numaralı kapıda binişe açılmıştır. Lütfen biniş kartınızı hazırlayınız.",
    hi: "यात्रियों कृपया ध्यान दें, उड़ान संख्या तीन सौ गेट चौबीस पर बोर्डिंग कर रही है। कृपया अपना बोर्डिंग पास तैयार रखें।",
    bn: "যাত্রীগণ লক্ষ্য করুন, তিনশত নম্বর ফ্লাইটটি চব্বিশ নম্বর গেটে বোর্ডিং শুরু করেছে। বোর্ডিং পাস প্রস্তুত রাখুন।",
    ur: "مسافرین توجہ فرمائیں، پرواز تین سو گیٹ نمبر چوبیس پر بورڈنگ شروع کر رہی ہے۔ برائے مہربانی اپنا بورڈنگ پاس تیار رکھیں۔"
  },
  greeting: {
    en: "Good morning! How are you doing today? We are delighted to welcome you to our community.",
    es: "¡Buenos días! ¿Cómo estás hoy? Estamos encantados de darle la bienvenida a nuestra comunidad.",
    fr: "Bonjour ! Comment allez-vous aujourd'hui ? Nous sommes ravis de vous accueillir dans notre communauté.",
    de: "Guten Morgen! Wie geht es Ihnen heute? Wir freuen uns sehr, Sie in unserer Gemeinschaft begrüßen zu dürfen.",
    ar: "صباح الخير! كيف حالكم اليوم؟ يسعدنا ويشرفنا جدًا أن نرحب بكم في مجتمعنا.",
    ja: "おはようございます！ご機嫌いかがですか？私たちのコミュニティへようこそ。",
    zh: "早上好！今天过得怎么样？我们非常高兴欢迎您加入我们的大家庭。",
    it: "Buongiorno! Come state oggi? Siamo lieti di darvi il benvenuto nella nostra comunità.",
    pt: "Bom dia! Como vai você hoje? Estamos muito felizes em recebê-lo em nossa comunidade.",
    ru: "Доброе утро! Как ваши дела сегодня? Мы рады приветствовать вас в нашем сообществе.",
    tr: "Günaydın! Bugün nasılsınız? Topluluğumuza hoş geldiniz demekten mutluluk duyuyoruz.",
    hi: "शुभ प्रभात! आज आप कैसे हैं? हम अपने समुदाय में आपका स्वागत करते हुए बहुत प्रसन्न हैं।",
    bn: "সুপ্রভাত! আপনি কেমন আছেন? আমাদের কমিউনিটিতে আপনাকে স্বাগত জানাতে পেরে আমরা অত্যন্ত আনন্দিত।",
    ur: "صبح بخیر! آپ کا کیا حال ہے؟ ہم اپنی کمیونٹی میں آپ کا خیرمقدم کرتے ہوئے انتہائی خوش ہیں۔"
  }
};

// Word fallback dictionary for custom sentences
const COMMON_DICTIONARY = {
  "hello": { es: "hola", fr: "bonjour", de: "hallo", ar: "مرحبًا", ja: "こんにちは", zh: "你好", it: "ciao", pt: "olá", ru: "привет", tr: "merhaba", hi: "नमस्ते", bn: "হ্যালো", ur: "سلام" },
  "thank you": { es: "gracias", fr: "merci", de: "danke", ar: "شكرًا", ja: "ありがとう", zh: "谢谢", it: "grazie", pt: "obrigado", ru: "спасибо", tr: "teşekkürler", hi: "धन्यवाद", bn: "ধন্যবাদ", ur: "شکریہ" },
  "goodbye": { es: "adiós", fr: "au revoir", de: "auf wiedersehen", ar: "مع السلامة", ja: "さようなら", zh: "再见", it: "arrivederci", pt: "adeus", ru: "до свидания", tr: "hoşça kal", hi: "अलविदा", bn: "বিদায়", ur: "خدا حافظ" },
  "welcome": { es: "bienvenido", fr: "bienvenue", de: "willkommen", ar: "أهلاً وسهلاً", ja: "ようこそ", zh: "欢迎", it: "benvenuto", pt: "bem-vindo", ru: "добро пожаловать", tr: "hoş geldiniz", hi: "स्वागत", bn: "স্বাগতম", ur: "خوش آمدید" }
};

document.addEventListener('DOMContentLoaded', () => {
  let audioCtx = null;
  let voices = [];
  let isPlayingDual = false;

  // DOM
  const sourceLang = document.getElementById('sourceLang');
  const targetLang = document.getElementById('targetLang');
  const sourceText = document.getElementById('sourceText');
  const targetText = document.getElementById('targetText');
  const sourceCharCount = document.getElementById('sourceCharCount');

  const btnPlaySource = document.getElementById('btnPlaySource');
  const btnPlayTarget = document.getElementById('btnPlayTarget');
  const btnPlayDual = document.getElementById('btnPlayDual');
  const btnStop = document.getElementById('btnStop');
  const btnCopyTranslation = document.getElementById('btnCopyTranslation');
  const btnDownloadSrt = document.getElementById('btnDownloadSrt');
  const btnDownloadAudioWav = document.getElementById('btnDownloadAudioWav');

  // Populate Voices
  function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    voices = window.speechSynthesis.getVoices();
  }
  loadVoices();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  // Find Native Voice for Lang Code
  function getBestVoiceForLang(langCode) {
    if (!voices.length) return null;
    return voices.find(v => v.lang.toLowerCase().startsWith(langCode.toLowerCase())) || null;
  }

  // Translation Engine
  function translateContent() {
    const text = sourceText.value.trim();
    sourceCharCount.textContent = `${text.length} chars`;
    if (!text) {
      targetText.value = '';
      return;
    }

    const tLang = targetLang.value;

    // Check if matching preset scenario
    for (const key of Object.keys(TRANSLATION_DATABASE)) {
      const dbEntry = TRANSLATION_DATABASE[key];
      for (const sLang of Object.keys(dbEntry)) {
        if (dbEntry[sLang].toLowerCase().trim() === text.toLowerCase().trim()) {
          targetText.value = dbEntry[tLang] || dbEntry['en'] || text;
          return;
        }
      }
    }

    // Word replacement / smart dictionary lookup
    const lower = text.toLowerCase();
    for (const [phrase, dict] of Object.entries(COMMON_DICTIONARY)) {
      if (lower.includes(phrase)) {
        if (dict[tLang]) {
          targetText.value = text.replace(new RegExp(phrase, 'gi'), dict[tLang]);
          return;
        }
      }
    }

    // Default translation mirror fallback
    targetText.value = `[${tLang.toUpperCase()} Translation]: ` + text;
  }

  sourceText.addEventListener('input', translateContent);
  targetLang.addEventListener('change', translateContent);
  sourceLang.addEventListener('change', translateContent);

  // Scenario buttons
  document.querySelectorAll('.phrase-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      sourceText.value = btn.dataset.text;
      sourceLang.value = 'en';
      translateContent();
    });
  });

  // Audio Context
  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtxClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Synthesize Chime
  function playTransitionChime(ctx, dest, callback) {
    const now = ctx.currentTime + 0.05;
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      g.gain.setValueAtTime(0.2, now + idx * 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.5);
      osc.connect(g);
      g.connect(dest);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.55);
    });
    if (callback) setTimeout(callback, 500);
  }

  // Speech Players
  function speak(text, langCode, onEnd = null) {
    if (!('speechSynthesis' in window) || !text) {
      if (onEnd) onEnd();
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    const nativeVoice = getBestVoiceForLang(langCode);
    if (nativeVoice) utter.voice = nativeVoice;
    utter.rate = 0.95;
    utter.onend = () => { if (onEnd) onEnd(); };
    utter.onerror = () => { if (onEnd) onEnd(); };
    window.speechSynthesis.speak(utter);
  }

  function stopAllSpeech() {
    isPlayingDual = false;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  btnPlaySource.addEventListener('click', () => {
    stopAllSpeech();
    speak(sourceText.value.trim(), sourceLang.value);
  });

  btnPlayTarget.addEventListener('click', () => {
    stopAllSpeech();
    speak(targetText.value.trim(), targetLang.value);
  });

  btnPlayDual.addEventListener('click', () => {
    stopAllSpeech();
    isPlayingDual = true;
    const ctx = getAudioContext();

    speak(sourceText.value.trim(), sourceLang.value, () => {
      if (!isPlayingDual) return;
      playTransitionChime(ctx, ctx.destination, () => {
        if (!isPlayingDual) return;
        speak(targetText.value.trim(), targetLang.value, () => {
          isPlayingDual = false;
        });
      });
    });
  });

  btnStop.addEventListener('click', stopAllSpeech);

  // Copy Translation
  btnCopyTranslation.addEventListener('click', () => {
    navigator.clipboard.writeText(targetText.value.trim()).then(() => {
      const orig = btnCopyTranslation.textContent;
      btnCopyTranslation.textContent = '✓ Copied';
      setTimeout(() => btnCopyTranslation.textContent = orig, 1500);
    });
  });

  // Download SRT Subtitles
  btnDownloadSrt.addEventListener('click', () => {
    const src = sourceText.value.trim();
    const trg = targetText.value.trim();
    if (!src && !trg) {
      alert('Please enter or translate text first.');
      return;
    }

    const srtContent = `1\n00:00:00,500 --> 00:00:04,500\n${src}\n\n2\n00:00:05,000 --> 00:00:09,500\n${trg}\n`;
    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bilingual_translation_${sourceLang.value}_to_${targetLang.value}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Download Audio Cue WAV
  btnDownloadAudioWav.addEventListener('click', async () => {
    btnDownloadAudioWav.disabled = true;
    btnDownloadAudioWav.innerHTML = '<span>Rendering Audio...</span>';

    try {
      const sampleRate = 44100;
      const duration = 2.5;
      const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, sampleRate * duration, sampleRate);

      playTransitionChime(offlineCtx, offlineCtx.destination);

      const buffer = await offlineCtx.startRendering();
      const blob = bufferToWave(buffer);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `translation_chime_cue.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Error rendering audio: ' + e.message);
    } finally {
      btnDownloadAudioWav.disabled = false;
      btnDownloadAudioWav.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/></svg>
        <span>Download Audio Cue (WAV)</span>
      `;
    }
  });

  // Init
  sourceText.value = TRANSLATION_DATABASE.hospitality.en;
  translateContent();
});