// HTML Minifier - Core Client-Side Logic
document.addEventListener('DOMContentLoaded', () => {
  // DOM References
  const htmlInput = document.getElementById('html-input');
  const htmlOutput = document.getElementById('html-output');
  const btnMinify = document.getElementById('btn-minify');
  const btnSample = document.getElementById('btn-sample');
  const btnClear = document.getElementById('btn-clear');
  const btnCopy = document.getElementById('btn-copy');
  const btnDownload = document.getElementById('btn-download');
  const btnUpload = document.getElementById('btn-upload');
  const fileInput = document.getElementById('file-input');
  const copyToast = document.getElementById('copy-toast');

  // Checkbox Options
  const optRemoveComments = document.getElementById('opt-remove-comments');
  const optCollapseWhitespace = document.getElementById('opt-collapse-whitespace');
  const optCleanBoolean = document.getElementById('opt-clean-boolean');
  const optRemoveClosingTags = document.getElementById('opt-remove-closing-tags');

  // KPI Elements
  const statOriginal = document.getElementById('stat-original');
  const statMinified = document.getElementById('stat-minified');
  const statSaved = document.getElementById('stat-saved');
  const statSavedPercent = document.getElementById('stat-saved-percent');
  const statRatio = document.getElementById('stat-ratio');
  const inputStats = document.getElementById('input-stats');
  const outputStats = document.getElementById('output-stats');

  const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
  <!-- Main Application Layout Head -->
  <head>
    <meta charset="UTF-8">
    <title>Sample Showcase &mdash; Modern Web</title>
    <link rel="stylesheet" href="/assets/style.css">
    <style>
      /* Inline custom component style */
      .hero-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    </style>
  </head>

  <body class="site-body">
    <!-- Header Navigation Section -->
    <header id="masthead">
      <nav class="navigation-bar">
        <ul>
          <li><a href="#overview">Overview</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#pricing">Pricing</a></li>
        </ul>
      </nav>
    </header>

    <main class="content-wrapper">
      <!-- Feature Content Section -->
      <section class="hero-banner">
        <h1>Deliver Lightning Fast Web Apps</h1>
        <p>
          Minifying markup reduces bandwidth overhead, accelerates time-to-first-byte,
          and improves Core Web Vitals across low-connectivity mobile networks.
        </p>
      </section>

      <!-- Interactive Form Demonstration -->
      <form action="/submit" method="post" novalidate="novalidate">
        <label for="subscriber-email">Subscribe to updates:</label>
        <input type="email" id="subscriber-email" name="email" required="required" autofocus="autofocus" placeholder="alex@domain.com">

        <label for="newsletter-optin">
          <input type="checkbox" id="newsletter-optin" checked="checked"> Receive weekly dev newsletter
        </label>

        <button type="submit" disabled="disabled">Submit Registration</button>
      </form>

      <!-- Data Table Demo -->
      <table class="data-table">
        <thead>
          <tr>
            <th>Module</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Parser Core</td>
            <td>Online</td>
          </tr>
          <tr>
            <td>Optimizer</td>
            <td>Enabled</td>
          </tr>
        </tbody>
      </table>
    </main>

    <!-- Footer Copyright -->
    <footer>
      <p>&copy; 2026 Developer Tooling Suite. All rights reserved.</p>
    </footer>

    <script>
      // Inline initialization script
      console.log("Interactive widgets ready.");
    </script>
  </body>
</html>`;

  // Byte size formatter helper
  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    if (i === 0) return bytes + ' B';
    return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
  }

  // Get UTF-8 byte count of string
  function getByteSize(str) {
    return new TextEncoder().encode(str).length;
  }

  // Count lines and characters
  function updateTextStats(str, targetEl) {
    if (!targetEl) return;
    if (!str) {
      targetEl.textContent = '0 lines • 0 chars';
      return;
    }
    const lines = str.split(/\r\n|\r|\n/).length;
    const chars = str.length;
    targetEl.textContent = `${lines.toLocaleString()} lines • ${chars.toLocaleString()} chars`;
  }

  // HTML Minification Engine
  function minifyHTML(html, options) {
    if (!html) return '';

    // Step 1: Preserve blocks that shouldn't have whitespace or comments mangled
    // (pre, code, textarea, script, style, CDATA)
    const preservedBlocks = [];
    let processed = html.replace(/<(pre|code|textarea|script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, (match) => {
      const token = `___HTML_PRESERVED_${preservedBlocks.length}___`;
      preservedBlocks.push(match);
      return token;
    });

    processed = processed.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, (match) => {
      const token = `___HTML_PRESERVED_${preservedBlocks.length}___`;
      preservedBlocks.push(match);
      return token;
    });

    // Step 2: Strip standard comments while preserving conditional comments e.g. <!--[if ...]>
    if (options.removeComments) {
      processed = processed.replace(/<!--(?!\[if)[\s\S]*?-->/g, '');
    }

    // Step 3: Clean boolean attributes
    if (options.cleanBoolean) {
      const booleanAttrs = [
        'allowfullscreen', 'async', 'autofocus', 'autoplay', 'checked', 'controls',
        'default', 'defer', 'disabled', 'formnovalidate', 'hidden', 'inert', 'ismap',
        'itemscope', 'loop', 'multiple', 'muted', 'nomodule', 'novalidate', 'open',
        'playsinline', 'readonly', 'required', 'reversed', 'selected'
      ];
      const boolPattern = new RegExp(
        `\\b(${booleanAttrs.join('|')})\\s*=\\s*(?:"\\1"|'\\1'|""|''|\\1|true|"true"|'true')(?=[\\s>])`,
        'gi'
      );
      processed = processed.replace(boolPattern, '$1');
    }

    // Step 4: Remove optional closing tags safely
    if (options.removeClosingTags) {
      // </li> before next <li>, </li>, </ul>, </ol>
      processed = processed.replace(/<\/li>\s*(?=<li\b|<\/ul>|<\/ol>)/gi, '');
      // </dt> and </dd>
      processed = processed.replace(/<\/(dt|dd)>\s*(?=<dt\b|<dd\b|<\/dl>)/gi, '');
      // </p> before block-level elements or closing container tags
      const blockTags = 'address|article|aside|blockquote|details|dialog|div|dl|fieldset|figcaption|figure|footer|form|h[1-6]|header|hgroup|hr|main|menu|nav|ol|p|pre|section|table|ul';
      processed = processed.replace(new RegExp(`<\\/p>\\s*(?=<\\/?(?:${blockTags})\\b)`, 'gi'), '');
      // </tr> before next <tr>, </tr>, </tbody>, </table>
      processed = processed.replace(/<\/tr>\s*(?=<tr\b|<\/tbody>|<\/thead>|<\/tfoot>|<\/table>)/gi, '');
      // </td> and </th> before next cell or row/table end
      processed = processed.replace(/<\/(td|th)>\s*(?=<td\b|<th\b|<\/tr>|<\/tbody>|<\/thead>|<\/tfoot>|<\/table>)/gi, '');
      // </thead>, </tbody>, </tfoot> before table elements
      processed = processed.replace(/<\/(thead|tbody|tfoot)>\s*(?=<thead\b|<tbody\b|<tfoot\b|<\/table>)/gi, '');
    }

    // Step 5: Collapse Whitespace
    if (options.collapseWhitespace) {
      // Remove spaces between tags
      processed = processed.replace(/>\s+</g, '><');
      // Collapse multiple whitespace chars outside preserved blocks
      processed = processed.replace(/\s+/g, ' ');
      // Remove spaces before closing angle brackets
      processed = processed.replace(/\s+(?=>|\/>)/g, '');
      // Normalize spaces around attribute equals sign: attr = "val" -> attr="val"
      processed = processed.replace(/\s*=\s*(["'][^"']*["'])/g, '=$1');
      // Trim edge whitespace
      processed = processed.trim();
    }

    // Step 6: Restore Preserved Blocks
    preservedBlocks.forEach((block, idx) => {
      const token = `___HTML_PRESERVED_${idx}___`;
      processed = processed.replace(token, block);
    });

    return processed;
  }

  // Main optimization controller
  function processOptimization() {
    const rawHTML = htmlInput.value;
    updateTextStats(rawHTML, inputStats);

    if (!rawHTML.trim()) {
      htmlOutput.value = '';
      statOriginal.textContent = '0 B';
      statMinified.textContent = '0 B';
      statSaved.textContent = '0 B';
      statSavedPercent.textContent = '0.0% reduction';
      statRatio.textContent = '0.0%';
      updateTextStats('', outputStats);
      return;
    }

    const options = {
      removeComments: optRemoveComments.checked,
      collapseWhitespace: optCollapseWhitespace.checked,
      cleanBoolean: optCleanBoolean.checked,
      removeClosingTags: optRemoveClosingTags.checked
    };

    const minified = minifyHTML(rawHTML, options);
    htmlOutput.value = minified;
    updateTextStats(minified, outputStats);

    // Compute metrics
    const originalBytes = getByteSize(rawHTML);
    const minifiedBytes = getByteSize(minified);
    const savedBytes = Math.max(0, originalBytes - minifiedBytes);
    const ratioPercent = originalBytes > 0 ? ((savedBytes / originalBytes) * 100).toFixed(1) : '0.0';

    statOriginal.textContent = formatBytes(originalBytes);
    statMinified.textContent = formatBytes(minifiedBytes);
    statSaved.textContent = formatBytes(savedBytes);
    statSavedPercent.textContent = `${ratioPercent}% reduction`;
    statRatio.textContent = `${ratioPercent}%`;
  }

  // Event Listeners
  htmlInput.addEventListener('input', processOptimization);
  btnMinify.addEventListener('click', processOptimization);

  [optRemoveComments, optCollapseWhitespace, optCleanBoolean, optRemoveClosingTags].forEach(checkbox => {
    checkbox.addEventListener('change', processOptimization);
  });

  // Load Sample
  btnSample.addEventListener('click', () => {
    htmlInput.value = SAMPLE_HTML;
    processOptimization();
  });

  // Clear Input
  btnClear.addEventListener('click', () => {
    htmlInput.value = '';
    htmlOutput.value = '';
    processOptimization();
    htmlInput.focus();
  });

  // Copy to Clipboard
  btnCopy.addEventListener('click', () => {
    const content = htmlOutput.value;
    if (!content) return;

    navigator.clipboard.writeText(content).then(() => {
      const originalText = btnCopy.innerHTML;
      btnCopy.classList.add('btn-success');
      copyToast.classList.add('visible');

      setTimeout(() => {
        btnCopy.innerHTML = originalText;
        btnCopy.classList.remove('btn-success');
        copyToast.classList.remove('visible');
      }, 2000);
    }).catch(err => {
      console.error('Clipboard copy failed:', err);
    });
  });

  // Download Minified File
  btnDownload.addEventListener('click', () => {
    const content = htmlOutput.value;
    if (!content) return;

    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'index.min.html';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  });

  // Upload Local File
  btnUpload.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      htmlInput.value = event.target.result;
      processOptimization();
    };
    reader.readAsText(file);
    fileInput.value = ''; // reset so same file can be reloaded
  });

  // Tab key indentation support in textarea
  htmlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = htmlInput.selectionStart;
      const end = htmlInput.selectionEnd;
      htmlInput.value = htmlInput.value.substring(0, start) + '  ' + htmlInput.value.substring(end);
      htmlInput.selectionStart = htmlInput.selectionEnd = start + 2;
      processOptimization();
    }
  });

  // Initial calculation
  processOptimization();
});