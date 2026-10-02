// AI PDF Translator - Pure Client-Side Bilingual Alignment & Heuristic Translation Engine

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const dropZone = document.getElementById('drop-zone');
  const pdfInput = document.getElementById('pdf-input');
  const loadSampleBtn = document.getElementById('load-sample-btn');
  const uploadPanel = document.getElementById('upload-panel');
  const processingState = document.getElementById('processing-state');
  const statusTitle = document.getElementById('status-title');
  const statusDesc = document.getElementById('status-desc');
  const translatorWorkspace = document.getElementById('translator-workspace');

  // Controls & Badges
  const detectedLangBadge = document.getElementById('detected-lang-badge');
  const targetLanguageSelect = document.getElementById('target-language-select');
  const retranslateBtn = document.getElementById('retranslate-btn');
  const syncScrollToggle = document.getElementById('sync-scroll-toggle');
  const transFilename = document.getElementById('trans-filename');
  const transStats = document.getElementById('trans-stats');
  const targetLangLabel = document.getElementById('target-lang-label');
  const sourcePane = document.getElementById('source-pane');
  const targetPane = document.getElementById('target-pane');

  // Actions
  const exportTxtBtn = document.getElementById('export-txt-btn');
  const exportSinglePdfBtn = document.getElementById('export-single-pdf-btn');
  const exportDualPdfBtn = document.getElementById('export-dual-pdf-btn');
  const resetDocBtn = document.getElementById('reset-doc-btn');

  // State
  let currentDoc = {
    filename: '',
    sourceLang: 'en',
    targetLang: 'es',
    paragraphs: [] // Array of { id, sourceText, translatedText }
  };

  // Initialize PDF.js worker
  if (window.pdfjsLib && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = '../../assets/lib/pdf.worker.min.js';
  }

  // Drag & Drop
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('dropzone-active');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('dropzone-active');
    }, false);
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    if (dt.files.length > 0) {
      handlePdfFile(dt.files[0]);
    }
  });

  pdfInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handlePdfFile(e.target.files[0]);
    }
  });

  loadSampleBtn.addEventListener('click', () => {
    loadSampleDoc();
  });

  resetDocBtn.addEventListener('click', () => {
    translatorWorkspace.classList.add('hidden');
    dropZone.classList.remove('hidden');
    processingState.classList.add('hidden');
    pdfInput.value = '';
    currentDoc.paragraphs = [];
  });

  retranslateBtn.addEventListener('click', () => {
    if (currentDoc.paragraphs.length === 0) return;
    const newTarget = targetLanguageSelect.value;
    currentDoc.targetLang = newTarget;
    targetLangLabel.textContent = targetLanguageSelect.options[targetLanguageSelect.selectedIndex].text.split(' ')[0];
    
    // Rerun translation on paragraphs
    currentDoc.paragraphs.forEach(p => {
      p.translatedText = translateSentence(p.sourceText, currentDoc.sourceLang, newTarget);
    });

    renderPanes();
  });

  // Synchronized scrolling
  let isScrolling = false;
  sourcePane.addEventListener('scroll', () => {
    if (!syncScrollToggle.checked || isScrolling) return;
    isScrolling = true;
    const ratio = sourcePane.scrollTop / (sourcePane.scrollHeight - sourcePane.clientHeight || 1);
    targetPane.scrollTop = ratio * (targetPane.scrollHeight - targetPane.clientHeight);
    setTimeout(() => { isScrolling = false; }, 50);
  });

  targetPane.addEventListener('scroll', () => {
    if (!syncScrollToggle.checked || isScrolling) return;
    isScrolling = true;
    const ratio = targetPane.scrollTop / (targetPane.scrollHeight - targetPane.clientHeight || 1);
    sourcePane.scrollTop = ratio * (sourcePane.scrollHeight - sourcePane.clientHeight);
    setTimeout(() => { isScrolling = false; }, 50);
  });

  // File Handling
  function handlePdfFile(file) {
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a valid PDF document (.pdf).');
      return;
    }

    dropZone.classList.add('hidden');
    processingState.classList.remove('hidden');
    statusTitle.textContent = 'Parsing PDF Document...';
    statusDesc.textContent = `Reading ${file.name} in memory`;

    const reader = new FileReader();
    reader.onload = async function() {
      try {
        const typedArray = new Uint8Array(this.result);
        const pdf = await window.pdfjsLib.getDocument({ data: typedArray }).promise;
        const paragraphs = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          let lineBuffer = '';
          textContent.items.forEach(item => {
            const str = item.str.trim();
            if (str) {
              lineBuffer += ' ' + str;
            }
          });

          // Break page text into paragraphs / distinct clauses
          const chunks = lineBuffer.split(/\n\n+|(?<=[.!?])\s+(?=[A-Z0-9])/).filter(c => c.trim().length > 20);
          chunks.forEach(chunk => {
            paragraphs.push(chunk.trim());
          });
        }

        if (paragraphs.length === 0) {
          throw new Error('No readable text layer found in PDF.');
        }

        initializeTranslationWorkspace(file.name, paragraphs);

      } catch (err) {
        console.error('Translation PDF extraction error:', err);
        alert('Could not parse PDF text layer. It may be scanned or empty.');
        dropZone.classList.remove('hidden');
        processingState.classList.add('hidden');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function loadSampleDoc() {
    dropZone.classList.add('hidden');
    processingState.classList.remove('hidden');
    statusTitle.textContent = 'Loading International Commercial Agreement...';
    statusDesc.textContent = 'Preparing bilingual legal alignment...';

    setTimeout(() => {
      const sampleParagraphs = [
        "INTERNATIONAL SOFTWARE LICENSING AND MASTER CLOUD SERVICES AGREEMENT",
        "This Master Services Agreement ('Agreement') is entered into as of October 15, 2026, by and between Nexus Core Technologies Inc., a corporation organized under the laws of Delaware ('Provider'), and Global Logistics Enterprise S.A., a multinational corporation ('Client').",
        "1. SCOPE OF SERVICES. Provider agrees to deliver enterprise cloud infrastructure, machine learning inference APIs, and data replication capabilities in accordance with the Service Level Specification attached hereto as Exhibit A.",
        "2. SERVICE AVAILABILITY AND GUARANTEES. Provider warrants that the Production Cloud Environment shall achieve a monthly Service Availability Commitment of at least 99.95%, excluding scheduled maintenance windows notified forty-eight (48) hours in advance.",
        "3. FEES AND PAYMENT TERMS. Client shall pay all undisputed invoice amounts within thirty (30) days from the date of electronic invoice transmission. Any overdue balance shall accrue interest at a rate of 1.0% per month.",
        "4. CONFIDENTIALITY AND DATA PROTECTION. Each receiving party agrees to safeguard and hold in strict confidence all proprietary technical and commercial information of the disclosing party. Both parties shall fully comply with applicable data protection regulations including GDPR and ISO 27001.",
        "5. INTELLECTUAL PROPERTY RIGHTS. Provider retains all exclusive title, ownership, copyright, and patent rights in the underlying cloud algorithms, model architectures, and core software platform.",
        "6. GOVERNING LAW AND JURISDICTION. This Agreement shall be governed by, and construed in accordance with, the commercial laws of the State of New York, without regard to conflict of laws principles."
      ];
      initializeTranslationWorkspace('International_Cloud_Agreement.pdf', sampleParagraphs);
    }, 600);
  }

  function initializeTranslationWorkspace(filename, rawParagraphs) {
    const combinedText = rawParagraphs.join(' ');
    const detectedLang = detectLanguage(combinedText);
    const targetLang = targetLanguageSelect.value;

    currentDoc.filename = filename;
    currentDoc.sourceLang = detectedLang;
    currentDoc.targetLang = targetLang;
    currentDoc.paragraphs = rawParagraphs.map((text, idx) => {
      return {
        id: idx + 1,
        sourceText: text,
        translatedText: translateSentence(text, detectedLang, targetLang)
      };
    });

    // Update UI elements
    transFilename.textContent = filename;
    transStats.textContent = `${currentDoc.paragraphs.length} paragraphs`;
    detectedLangBadge.textContent = `Auto-detected (${getLangName(detectedLang)})`;
    targetLangLabel.textContent = targetLanguageSelect.options[targetLanguageSelect.selectedIndex].text.split(' ')[0];

    renderPanes();

    processingState.classList.add('hidden');
    translatorWorkspace.classList.remove('hidden');
  }

  function renderPanes() {
    sourcePane.innerHTML = '';
    targetPane.innerHTML = '';

    currentDoc.paragraphs.forEach(p => {
      // Source block
      const srcDiv = document.createElement('div');
      srcDiv.className = 'para-block';
      srcDiv.dataset.id = p.id;
      srcDiv.innerHTML = `
        <span class="para-num">#${p.id}</span>
        <div>${escapeHtml(p.sourceText)}</div>
      `;

      // Target block (editable)
      const tgtDiv = document.createElement('div');
      tgtDiv.className = 'para-block';
      tgtDiv.dataset.id = p.id;
      tgtDiv.innerHTML = `
        <span class="para-num">#${p.id}</span>
        <div class="para-editable" contenteditable="true" spellcheck="false">${escapeHtml(p.translatedText)}</div>
      `;

      // Sync editable changes back to currentDoc
      const editableEl = tgtDiv.querySelector('.para-editable');
      editableEl.addEventListener('input', () => {
        p.translatedText = editableEl.innerText;
      });

      // Highlight corresponding pairs on hover / click
      [srcDiv, tgtDiv].forEach(el => {
        el.addEventListener('mouseenter', () => highlightPair(p.id, true));
        el.addEventListener('mouseleave', () => highlightPair(p.id, false));
        el.addEventListener('click', () => {
          highlightPair(p.id, true);
        });
      });

      sourcePane.appendChild(srcDiv);
      targetPane.appendChild(tgtDiv);
    });
  }

  function highlightPair(id, add) {
    const sEl = sourcePane.querySelector(`[data-id="${id}"]`);
    const tEl = targetPane.querySelector(`[data-id="${id}"]`);
    if (add) {
      if (sEl) sEl.classList.add('active-para');
      if (tEl) tEl.classList.add('active-para');
    } else {
      if (sEl) sEl.classList.remove('active-para');
      if (tEl) tEl.classList.remove('active-para');
    }
  }

  // Exports
  exportTxtBtn.addEventListener('click', () => {
    if (currentDoc.paragraphs.length === 0) return;
    let out = `========================================================\nBILINGUAL TRANSLATION: ${currentDoc.filename}\nSource: ${getLangName(currentDoc.sourceLang)} | Target: ${getLangName(currentDoc.targetLang)}\n========================================================\n\n`;
    currentDoc.paragraphs.forEach(p => {
      out += `[#${p.id}] ORIGINAL:\n${p.sourceText}\n\n[#${p.id}] TRANSLATION:\n${p.translatedText}\n\n--------------------------------------------------------\n\n`;
    });
    downloadFile(out, `${currentDoc.filename.replace(/\.[^/.]+$/, "")}-Bilingual.txt`, 'text/plain');
  });

  exportSinglePdfBtn.addEventListener('click', () => {
    if (currentDoc.paragraphs.length === 0) return;
    const printContainer = document.createElement('div');
    printContainer.style.padding = '25px';
    printContainer.style.fontFamily = 'sans-serif';
    printContainer.style.color = '#111';
    printContainer.innerHTML = `
      <h2 style="text-align: center; border-bottom: 2px solid #4e85bf; padding-bottom: 8px; margin-bottom: 12px;">Translated Document (${getLangName(currentDoc.targetLang)})</h2>
      <p style="font-size: 11px; color: #666; text-align: center; margin-bottom: 20px;">Source File: ${currentDoc.filename}</p>
      ${currentDoc.paragraphs.map(p => `<p style="margin-bottom: 12px; line-height: 1.6; font-size: 12px;">${escapeHtml(p.translatedText)}</p>`).join('')}
    `;

    const opt = {
      margin: 12,
      filename: `${currentDoc.filename.replace(/\.[^/.]+$/, "")}-Translated.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    if (window.html2pdf) {
      window.html2pdf().set(opt).from(printContainer).save();
    } else {
      window.print();
    }
  });

  exportDualPdfBtn.addEventListener('click', () => {
    if (currentDoc.paragraphs.length === 0) return;
    const printDossier = document.getElementById('print-bilingual-dossier');
    const printMeta = document.getElementById('print-meta');
    const printTableBody = document.getElementById('print-table-body');
    const printThSource = document.getElementById('print-th-source');
    const printThTarget = document.getElementById('print-th-target');

    printMeta.textContent = `File: ${currentDoc.filename} | Original: ${getLangName(currentDoc.sourceLang)} | Translated: ${getLangName(currentDoc.targetLang)}`;
    printThSource.textContent = `Original (${getLangName(currentDoc.sourceLang)})`;
    printThTarget.textContent = `Translation (${getLangName(currentDoc.targetLang)})`;

    printTableBody.innerHTML = '';
    currentDoc.paragraphs.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="padding: 8px; border: 1px solid #ddd; vertical-align: top; line-height: 1.5;">${escapeHtml(p.sourceText)}</td>
        <td style="padding: 8px; border: 1px solid #ddd; vertical-align: top; line-height: 1.5; color: #1e3a8a;">${escapeHtml(p.translatedText)}</td>
      `;
      printTableBody.appendChild(tr);
    });

    printDossier.classList.remove('hidden');

    const opt = {
      margin: 10,
      filename: `${currentDoc.filename.replace(/\.[^/.]+$/, "")}-SideBySide-Bilingual.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    if (window.html2pdf) {
      window.html2pdf().set(opt).from(printDossier).save().then(() => {
        printDossier.classList.add('hidden');
      });
    } else {
      window.print();
      printDossier.classList.add('hidden');
    }
  });

  // Language Detection
  function detectLanguage(text) {
    if (/[\u0600-\u06FF]/.test(text)) return 'ar'; // Arabic
    if (/[\u4E00-\u9FFF]/.test(text)) return 'zh'; // Chinese
    if (/[\u3040-\u30FF]/.test(text)) return 'ja'; // Japanese
    if (/[\u0980-\u09FF]/.test(text)) return 'bn'; // Bengali
    if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Hindi
    if (/[\u0400-\u04FF]/.test(text)) return 'ru'; // Russian

    const lower = text.toLowerCase();
    const esWords = (lower.match(/\b(el|la|los|las|de|que|en|un|por|para|con|este|esta|contrato|servicio)\b/g) || []).length;
    const frWords = (lower.match(/\b(le|la|les|de|que|en|un|une|pour|avec|ce|cette|contrat|service)\b/g) || []).length;
    const deWords = (lower.match(/\b(der|die|das|und|in|den|von|zu|mit|sich|des|auf|für|vertrag)\b/g) || []).length;
    const itWords = (lower.match(/\b(il|la|lo|i|gli|le|di|che|in|per|con|questo|contratto)\b/g) || []).length;
    const ptWords = (lower.match(/\b(o|a|os|as|de|que|em|um|uma|para|com|este|contrato)\b/g) || []).length;

    const scores = [
      { lang: 'es', count: esWords },
      { lang: 'fr', count: frWords },
      { lang: 'de', count: deWords },
      { lang: 'it', count: itWords },
      { lang: 'pt', count: ptWords }
    ].sort((a, b) => b.count - a.count);

    if (scores[0].count > 5) {
      return scores[0].lang;
    }

    return 'en';
  }

  function getLangName(code) {
    const names = {
      en: 'English', es: 'Spanish', fr: 'French', de: 'German',
      ar: 'Arabic', zh: 'Chinese', ja: 'Japanese', bn: 'Bengali',
      hi: 'Hindi', pt: 'Portuguese', ru: 'Russian', it: 'Italian'
    };
    return names[code] || code.toUpperCase();
  }

  // Pure Client-Side Heuristic Translation Engine
  function translateSentence(text, srcLang, targetLang) {
    if (srcLang === targetLang) return text;

    // Multilingual Glossary & Lexicon
    const DICTIONARY = {
      es: { // Spanish
        "agreement": "acuerdo", "contract": "contrato", "master services agreement": "acuerdo marco de servicios",
        "provider": "proveedor", "client": "cliente", "customer": "cliente", "parties": "partes",
        "entered into": "celebrado", "laws": "leyes", "delaware": "Delaware", "new york": "Nueva York",
        "scope of services": "alcance de los servicios", "service level": "nivel de servicio",
        "availability": "disponibilidad", "commitment": "compromiso", "fees and payment terms": "tarifas y condiciones de pago",
        "invoice": "factura", "undisputed": "no disputado", "due date": "fecha de vencimiento",
        "confidentiality": "confidencialidad", "data protection": "protección de datos",
        "intellectual property": "propiedad intelectual", "rights": "derechos", "governing law": "ley aplicable",
        "jurisdiction": "jurisdicción", "terms and conditions": "términos y condiciones",
        "shall": "deberá", "will": "podrá", "agrees to": "acuerda", "warrants that": "garantiza que",
        "including": "incluyendo", "excluding": "excluyendo", "in accordance with": "de conformidad con",
        "without regard to": "sin consideración a", "maintenance": "mantenimiento", "overdue": "vencido",
        "interest": "interés", "rate": "tasa", "written notice": "notificación por escrito",
        "per month": "por mes", "thirty": "treinta", "days": "días", "hours": "horas",
        "report": "informe", "summary": "resumen", "results": "resultados", "performance": "rendimiento",
        "efficiency": "eficiencia", "growth": "crecimiento", "quarter": "trimestre", "total": "total",
        "investment": "inversión", "adoption": "adopción", "infrastructure": "infraestructura",
        "security": "seguridad", "analysis": "análisis", "overview": "visión general",
        "technology": "tecnología", "system": "sistema", "management": "gestión"
      },
      fr: { // French
        "agreement": "accord", "contract": "contrat", "master services agreement": "accord-cadre de services",
        "provider": "fournisseur", "client": "client", "customer": "client", "parties": "parties",
        "entered into": "conclu", "laws": "lois", "scope of services": "étendue des services",
        "service level": "niveau de service", "availability": "disponibilité", "commitment": "engagement",
        "fees and payment terms": "frais et modalités de paiement", "invoice": "facture",
        "confidentiality": "confidentialité", "data protection": "protection des données",
        "intellectual property": "propriété intellectuelle", "rights": "droits", "governing law": "loi applicable",
        "jurisdiction": "juridiction", "shall": "doit", "agrees to": "accepte de",
        "in accordance with": "conformément à", "overdue": "en souffrance", "interest": "intérêt",
        "written notice": "notification écrite", "days": "jours", "report": "rapport",
        "summary": "résumé", "performance": "performance", "investment": "investissement"
      },
      de: { // German
        "agreement": "Vereinbarung", "contract": "Vertrag", "master services agreement": "Rahmendienstleistungsvertrag",
        "provider": "Dienstleister", "client": "Kunde", "parties": "Parteien",
        "scope of services": "Leistungsumfang", "service level": "Service-Level",
        "availability": "Verfügbarkeit", "fees and payment terms": "Gebühren und Zahlungsbedingungen",
        "invoice": "Rechnung", "confidentiality": "Vertraulichkeit", "data protection": "Datenschutz",
        "intellectual property": "Geistiges Eigentum", "governing law": "Geltendes Recht",
        "jurisdiction": "Gerichtsstand", "shall": "wird", "days": "Tage", "hours": "Stunden",
        "report": "Bericht", "summary": "Zusammenfassung", "performance": "Leistung"
      },
      ar: { // Arabic
        "agreement": "اتفاقية", "contract": "عقد", "provider": "المزود", "client": "العميل",
        "parties": "الأطراف", "scope of services": "نطاق الخدمات", "service level": "مستوى الخدمة",
        "availability": "التوافر", "fees and payment terms": "الرسوم وشروط الدفع",
        "invoice": "فاتورة", "confidentiality": "السرية", "data protection": "حماية البيانات",
        "intellectual property": "الملكية الفكرية", "governing law": "القانون الحاكم",
        "jurisdiction": "الاختصاص القضائي", "shall": "يجب", "days": "أيام", "report": "تقرير",
        "summary": "ملخص", "performance": "الأداء", "investment": "الاستثمار"
      },
      zh: { // Chinese
        "agreement": "协议", "contract": "合同", "master services agreement": "主服务协议",
        "provider": "服务提供方", "client": "客户", "parties": "各方",
        "scope of services": "服务范围", "service level": "服务等级",
        "availability": "可用性", "commitment": "承诺", "fees and payment terms": "费用与付款条款",
        "invoice": "发票", "confidentiality": "保密条款", "data protection": "数据保护",
        "intellectual property": "知识产权", "rights": "权利", "governing law": "准据法",
        "jurisdiction": "司法管辖区", "shall": "应", "days": "天", "hours": "小时",
        "report": "报告", "summary": "摘要", "performance": "性能与表现", "investment": "投资"
      },
      ja: { // Japanese
        "agreement": "合意書", "contract": "契約書", "master services agreement": "基本サービス契約",
        "provider": "提供者", "client": "顧客", "parties": "当事者",
        "scope of services": "サービス範囲", "service level": "サービスレベル",
        "availability": "可用性", "fees and payment terms": "料金および支払条件",
        "invoice": "請求書", "confidentiality": "秘密保持", "data protection": "データ保護",
        "intellectual property": "知的財産権", "governing law": "準拠法",
        "jurisdiction": "管轄裁判所", "days": "日", "report": "報告書", "summary": "概要"
      },
      bn: { // Bengali
        "agreement": "চুক্তি", "contract": "চুক্তিপত্র", "provider": "সেবা প্রদানকারী",
        "client": "গ্রাহক", "parties": "পক্ষসমূহ", "scope of services": "সেবার পরিধি",
        "service level": "সেবার মান", "availability": "প্রাপ্যতা",
        "fees and payment terms": "ফি এবং পরিশোধের শর্তাবলী", "invoice": "চালান / ইনভয়েস",
        "confidentiality": "গোপনীয়তা", "data protection": "তথ্য সুরক্ষা",
        "intellectual property": "মেধা সম্পত্তি", "governing law": "প্রযোজ্য আইন",
        "jurisdiction": "বিচারিক এখতিয়ার", "days": "দিন", "report": "প্রতিবেদন", "summary": "সারসংক্ষেপ"
      },
      hi: { // Hindi
        "agreement": "समझौता", "contract": "अनुबंध", "provider": "प्रदाता", "client": "ग्राहक",
        "parties": "पक्ष", "scope of services": "सेवाओं का दायरा", "service level": "सेवा स्तर",
        "availability": "उपलब्धता", "fees and payment terms": "शुल्क और भुगतान की शर्तें",
        "invoice": "चालान", "confidentiality": "गोपनीयता", "data protection": "डेटा सुरक्षा",
        "intellectual property": "बौद्धिक संपदा", "governing law": "लागू कानून",
        "jurisdiction": "न्यायाधिकार", "days": "दिन", "report": "रिपोर्ट", "summary": "सारांश"
      },
      pt: { // Portuguese
        "agreement": "acordo", "contract": "contrato", "master services agreement": "contrato principal de serviços",
        "provider": "fornecedor", "client": "cliente", "parties": "partes",
        "scope of services": "escopo dos serviços", "service level": "nível de serviço",
        "availability": "disponibilidade", "fees and payment terms": "taxas e termos de pagamento",
        "invoice": "fatura", "confidentiality": "confidencialidade", "data protection": "proteção de dados",
        "intellectual property": "propriedade intelectual", "governing law": "lei aplicável",
        "jurisdiction": "jurisdição", "shall": "deverá", "days": "dias", "report": "relatório", "summary": "resumo"
      },
      ru: { // Russian
        "agreement": "соглашение", "contract": "договор", "provider": "поставщик", "client": "клиент",
        "parties": "стороны", "scope of services": "объем услуг", "service level": "уровень обслуживания",
        "availability": "доступность", "fees and payment terms": "сборы и условия оплаты",
        "invoice": "счет", "confidentiality": "конфиденциальность", "data protection": "защита данных",
        "intellectual property": "интеллектуальная собственность", "governing law": "применимое право",
        "jurisdiction": "юрисдикция", "shall": "должен", "days": "дней", "report": "отчет", "summary": "резюме"
      },
      it: { // Italian
        "agreement": "accordo", "contract": "contratto", "provider": "fornitore", "client": "cliente",
        "parties": "parti", "scope of services": "ambito dei servizi", "service level": "livello di servizio",
        "availability": "disponibilità", "fees and payment terms": "tariffe e condizioni di pagamento",
        "invoice": "fattura", "confidentiality": "riservatezza", "data protection": "protezione dei dati",
        "intellectual property": "proprietà intellettuale", "governing law": "legge applicabile",
        "jurisdiction": "giurisdizione", "shall": "dovrà", "days": "giorni", "report": "rapporto", "summary": "sommario"
      }
    };

    const dict = DICTIONARY[targetLang];
    if (!dict) return text;

    // Apply phrase-level substitution sorted by longest key first
    let translated = text;
    const sortedKeys = Object.keys(dict).sort((a, b) => b.length - a.length);

    sortedKeys.forEach(term => {
      const regex = new RegExp(`\\b${escapeRegExp(term)}\\b`, 'gi');
      translated = translated.replace(regex, (match) => {
        const replacement = dict[term];
        // Match casing
        if (match === match.toUpperCase() && match.length > 1) {
          return replacement.toUpperCase();
        }
        if (match[0] === match[0].toUpperCase()) {
          return replacement.charAt(0).toUpperCase() + replacement.slice(1);
        }
        return replacement;
      });
    });

    return translated;
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function downloadFile(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  }
});