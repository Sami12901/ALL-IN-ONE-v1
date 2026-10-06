// Quick Local Notepad - Complete Client-Side Implementation

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const noteTitleInput = document.getElementById('noteTitleInput');
  const autosaveBadge = document.getElementById('autosaveBadge');
  const autosaveText = document.getElementById('autosaveText');

  const noteSelect = document.getElementById('noteSelect');
  const newNoteBtn = document.getElementById('newNoteBtn');
  const deleteNoteBtn = document.getElementById('deleteNoteBtn');

  const richEditor = document.getElementById('richEditor');
  const markdownEditor = document.getElementById('markdownEditor');
  const btnToggleMode = document.getElementById('btnToggleMode');

  // Format Buttons
  const btnBold = document.getElementById('btnBold');
  const btnItalic = document.getElementById('btnItalic');
  const btnUnderline = document.getElementById('btnUnderline');
  const btnStrike = document.getElementById('btnStrike');

  const btnH1 = document.getElementById('btnH1');
  const btnH2 = document.getElementById('btnH2');
  const btnH3 = document.getElementById('btnH3');
  const btnParagraph = document.getElementById('btnParagraph');

  const btnBulletList = document.getElementById('btnBulletList');
  const btnNumberList = document.getElementById('btnNumberList');
  const btnQuote = document.getElementById('btnQuote');
  const btnCodeBlock = document.getElementById('btnCodeBlock');
  const btnHr = document.getElementById('btnHr');

  const btnUndo = document.getElementById('btnUndo');
  const btnRedo = document.getElementById('btnRedo');

  // Stats Elements
  const wordCount = document.getElementById('wordCount');
  const charCount = document.getElementById('charCount');
  const lineCount = document.getElementById('lineCount');
  const readTime = document.getElementById('readTime');

  // Action Buttons
  const copyNoteBtn = document.getElementById('copyNoteBtn');
  const downloadTxtBtn = document.getElementById('downloadTxtBtn');
  const downloadMdBtn = document.getElementById('downloadMdBtn');
  const printNoteBtn = document.getElementById('printNoteBtn');

  // Storage & State
  const STORAGE_KEY = 'aio_quick_notepad_data_v1';
  let notes = [];
  let currentNoteId = null;
  let isMarkdownMode = false;
  let saveTimeout = null;

  // Starter Default Content
  function getDefaultNote() {
    return {
      id: 'note_' + Date.now(),
      title: 'Quick Scratchpad',
      content: `<h1>Welcome to Quick Notepad</h1>
<p>A distraction-free, instant scratchpad designed for thoughts, ideas, meeting notes, and quick drafts.</p>
<h2>Key Capabilities</h2>
<ul>
  <li><strong>Instant LocalStorage auto-save</strong>: Every keystroke persists securely on your device.</li>
  <li><strong>Rich formatting & Markdown</strong>: Switch seamlessly between visual editing and raw Markdown.</li>
  <li><strong>Real-time telemetry</strong>: Live word counter, character counter, line counter, and reading time estimator.</li>
  <li><strong>Export anywhere</strong>: Download as Markdown (<code>.md</code>), plain text (<code>.txt</code>), or print clean distraction-free pages.</li>
</ul>
<pre><code>// Example Code Snippet
function calculateReadingTime(words) {
  return Math.ceil(words / 200);
}</code></pre>
<p>Feel free to select all and replace this text with your notes!</p>`,
      updatedAt: new Date().toISOString()
    };
  }

  // Load Notes from LocalStorage
  function loadNotes() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        notes = JSON.parse(raw);
        if (!Array.isArray(notes) || notes.length === 0) {
          notes = [getDefaultNote()];
        }
      } catch {
        notes = [getDefaultNote()];
      }
    } else {
      notes = [getDefaultNote()];
      saveNotesToStorage();
    }
    currentNoteId = notes[0].id;
    populateNoteSelect();
    loadCurrentNote();
  }

  function saveNotesToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }

  function populateNoteSelect() {
    noteSelect.innerHTML = '';
    notes.forEach((note) => {
      const opt = document.createElement('option');
      opt.value = note.id;
      opt.textContent = note.title || 'Untitled Note';
      noteSelect.appendChild(opt);
    });
    noteSelect.value = currentNoteId;
  }

  function getCurrentNote() {
    return notes.find(n => n.id === currentNoteId) || notes[0];
  }

  function loadCurrentNote() {
    const note = getCurrentNote();
    if (!note) return;

    currentNoteId = note.id;
    noteSelect.value = note.id;
    noteTitleInput.value = note.title || 'Untitled Note';

    if (isMarkdownMode) {
      markdownEditor.value = htmlToMarkdown(note.content);
    } else {
      richEditor.innerHTML = note.content || '';
    }

    updateStats();
    showSavedStatus();
  }

  // Auto-Save Trigger
  function triggerAutoSave() {
    autosaveBadge.classList.add('saving');
    autosaveText.textContent = 'Saving...';

    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      const note = getCurrentNote();
      if (!note) return;

      note.title = noteTitleInput.value.trim() || 'Untitled Note';
      if (isMarkdownMode) {
        note.content = markdownToHtml(markdownEditor.value);
      } else {
        note.content = richEditor.innerHTML;
      }
      note.updatedAt = new Date().toISOString();

      saveNotesToStorage();
      populateNoteSelect();
      showSavedStatus();
    }, 200);

    updateStats();
  }

  function showSavedStatus() {
    autosaveBadge.classList.remove('saving');
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    autosaveText.textContent = `Saved at ${now}`;
  }

  // Real-time Text Analytics
  function updateStats() {
    const text = isMarkdownMode ? markdownEditor.value : richEditor.innerText || '';
    const trimmed = text.trim();

    const words = trimmed ? (trimmed.match(/\S+/g) || []).length : 0;
    const chars = text.length;
    const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
    const minutes = Math.max(1, Math.ceil(words / 200));

    wordCount.textContent = words.toLocaleString();
    charCount.textContent = chars.toLocaleString();
    lineCount.textContent = lines.toLocaleString();
    readTime.textContent = words === 0 ? '0' : minutes;
  }

  // Format Command Executer
  function format(command, value = null) {
    if (isMarkdownMode) return;
    richEditor.focus();
    document.execCommand(command, false, value);
    triggerAutoSave();
  }

  // Formatting Buttons
  btnBold.addEventListener('click', () => format('bold'));
  btnItalic.addEventListener('click', () => format('italic'));
  btnUnderline.addEventListener('click', () => format('underline'));
  btnStrike.addEventListener('click', () => format('strikeThrough'));

  btnH1.addEventListener('click', () => format('formatBlock', '<h1>'));
  btnH2.addEventListener('click', () => format('formatBlock', '<h2>'));
  btnH3.addEventListener('click', () => format('formatBlock', '<h3>'));
  btnParagraph.addEventListener('click', () => format('formatBlock', '<p>'));

  btnBulletList.addEventListener('click', () => format('insertUnorderedList'));
  btnNumberList.addEventListener('click', () => format('insertOrderedList'));
  btnQuote.addEventListener('click', () => format('formatBlock', '<blockquote>'));
  btnHr.addEventListener('click', () => format('insertHorizontalRule'));

  btnCodeBlock.addEventListener('click', () => {
    if (isMarkdownMode) return;
    richEditor.focus();
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const selectedText = range.toString() || 'code snippet here';
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.textContent = selectedText;
      pre.appendChild(code);
      range.deleteContents();
      range.insertNode(pre);
      triggerAutoSave();
    }
  });

  btnUndo.addEventListener('click', () => format('undo'));
  btnRedo.addEventListener('click', () => format('redo'));

  // Toggle Markdown Mode vs Rich Editor
  btnToggleMode.addEventListener('click', () => {
    isMarkdownMode = !isMarkdownMode;
    const note = getCurrentNote();

    if (isMarkdownMode) {
      markdownEditor.value = htmlToMarkdown(richEditor.innerHTML);
      richEditor.style.display = 'none';
      markdownEditor.style.display = 'block';
      markdownEditor.focus();
      btnToggleMode.textContent = 'Rich Editor View';
      btnToggleMode.classList.add('active');
    } else {
      richEditor.innerHTML = markdownToHtml(markdownEditor.value);
      markdownEditor.style.display = 'none';
      richEditor.style.display = 'block';
      richEditor.focus();
      btnToggleMode.textContent = 'Markdown View';
      btnToggleMode.classList.remove('active');
    }
    triggerAutoSave();
  });

  // Simple Clean HTML to Markdown Converter
  function htmlToMarkdown(html) {
    if (!html) return '';
    let md = html;
    // Replace headings
    md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
    md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
    md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
    // Code blocks
    md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n');
    md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
    // Blockquote
    md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n');
    // Lists
    md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
    md = md.replace(/<ul[^>]*>/gi, '');
    md = md.replace(/<\/ul>/gi, '\n');
    md = md.replace(/<ol[^>]*>/gi, '');
    md = md.replace(/<\/ol>/gi, '\n');
    // Formatting
    md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
    md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
    md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
    md = md.replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~');
    md = md.replace(/<u[^>]*>(.*?)<\/u>/gi, '$1');
    md = md.replace(/<hr[^>]*>/gi, '\n---\n\n');
    md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
    md = md.replace(/<br\s*[\/]?>/gi, '\n');
    // Strip remaining tags
    md = md.replace(/<[^>]+>/g, '');
    // Decode basic entities
    md = md.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    return md.trim();
  }

  // Markdown to HTML Converter
  function markdownToHtml(md) {
    if (!md) return '';
    const lines = md.split('\n');
    let html = '';
    let inCode = false;
    let inList = false;

    for (let line of lines) {
      if (line.startsWith('```')) {
        if (inCode) {
          html += '</code></pre>';
          inCode = false;
        } else {
          html += '<pre><code>';
          inCode = true;
        }
        continue;
      }

      if (inCode) {
        html += line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '\n';
        continue;
      }

      if (line.startsWith('# ')) {
        html += `<h1>${line.slice(2)}</h1>`;
      } else if (line.startsWith('## ')) {
        html += `<h2>${line.slice(3)}</h2>`;
      } else if (line.startsWith('### ')) {
        html += `<h3>${line.slice(4)}</h3>`;
      } else if (line.startsWith('> ')) {
        html += `<blockquote>${line.slice(2)}</blockquote>`;
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        if (!inList) {
          html += '<ul>';
          inList = true;
        }
        html += `<li>${formatInline(line.slice(2))}</li>`;
      } else if (line.trim() === '---') {
        if (inList) { html += '</ul>'; inList = false; }
        html += '<hr>';
      } else if (line.trim() === '') {
        if (inList) { html += '</ul>'; inList = false; }
      } else {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<p>${formatInline(line)}</p>`;
      }
    }

    if (inList) html += '</ul>';
    if (inCode) html += '</code></pre>';

    return html;
  }

  function formatInline(str) {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/~~(.*?)~~/g, '<s>$1</s>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
  }

  // Keystroke Listeners
  richEditor.addEventListener('input', triggerAutoSave);
  markdownEditor.addEventListener('input', triggerAutoSave);
  noteTitleInput.addEventListener('input', triggerAutoSave);

  // Note Switcher
  noteSelect.addEventListener('change', (e) => {
    currentNoteId = e.target.value;
    loadCurrentNote();
  });

  // Create New Note
  newNoteBtn.addEventListener('click', () => {
    const newNote = {
      id: 'note_' + Date.now(),
      title: `Note #${notes.length + 1}`,
      content: '<h1>New Note</h1><p>Start drafting...</p>',
      updatedAt: new Date().toISOString()
    };
    notes.unshift(newNote);
    currentNoteId = newNote.id;
    saveNotesToStorage();
    populateNoteSelect();
    loadCurrentNote();
  });

  // Delete Current Note
  deleteNoteBtn.addEventListener('click', () => {
    if (notes.length <= 1) {
      alert('You must keep at least one note. Clearing content instead.');
      richEditor.innerHTML = '';
      markdownEditor.value = '';
      noteTitleInput.value = 'Untitled Note';
      triggerAutoSave();
      return;
    }

    const currentNote = getCurrentNote();
    if (confirm(`Delete "${currentNote.title}"?`)) {
      notes = notes.filter(n => n.id !== currentNoteId);
      currentNoteId = notes[0].id;
      saveNotesToStorage();
      populateNoteSelect();
      loadCurrentNote();
    }
  });

  // Copy Plain Text
  copyNoteBtn.addEventListener('click', () => {
    const text = isMarkdownMode ? markdownEditor.value : (richEditor.innerText || '');
    navigator.clipboard.writeText(text).then(() => {
      copyNoteBtn.textContent = 'Copied!';
      setTimeout(() => { copyNoteBtn.textContent = 'Copy Text'; }, 1500);
    });
  });

  // Download File Helper
  function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // Download .txt
  downloadTxtBtn.addEventListener('click', () => {
    const note = getCurrentNote();
    const text = isMarkdownMode ? markdownEditor.value : (richEditor.innerText || '');
    const filename = `${(note.title || 'Note').replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
    downloadFile(text, filename, 'text/plain;charset=utf-8');
  });

  // Download .md
  downloadMdBtn.addEventListener('click', () => {
    const note = getCurrentNote();
    const md = isMarkdownMode ? markdownEditor.value : htmlToMarkdown(richEditor.innerHTML);
    const filename = `${(note.title || 'Note').replace(/[^a-zA-Z0-9_-]/g, '_')}.md`;
    downloadFile(md, filename, 'text/markdown;charset=utf-8');
  });

  // Print Note
  printNoteBtn.addEventListener('click', () => {
    window.print();
  });

  // Initial Boot
  loadNotes();
});