const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'sitemap.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const imageTools = [
  { id: 'image-text-remover', name: 'Image Text Remover', desc: 'Remove text, captions, and typography from images with client-side inpainting and auto-detection.' },
  { id: 'image-logo-remover', name: 'Image Logo Remover', desc: 'Erase logos, brand icons, and badges from photos seamlessly using browser-based AI inpainting.' },
  { id: 'image-watermark-remover', name: 'Image Watermark Remover', desc: 'Remove watermarks, timestamps, stamps, and copyright markings from images offline with one-click auto detection.' },
  { id: 'image-object-remover', name: 'Image Object Remover', desc: 'Erase unwanted objects, people, stickers, and clutter from images with seamless texture blending.' }
];

const videoTools = [
  { id: 'video-logo-remover', name: 'Video Logo Remover', desc: 'Remove broadcast logos, TV channel bugs, and corner icons from video clips frame-by-frame offline.' },
  { id: 'video-text-remover', name: 'Video Text Remover', desc: 'Erase hardcoded subtitles, captions, and title overlays from video files without losing audio quality.' },
  { id: 'video-watermark-remover', name: 'Video Watermark Remover', desc: 'Remove TikTok, YouTube, and stock video watermarks easily using real-time delogo and temporal blending.' },
  { id: 'video-object-remover', name: 'Video Object Remover', desc: 'Mask and erase unwanted moving or static objects from video clips with temporal consistency.' }
];

function generateCard(tool) {
  return `
        <article class="sitemap-card">
          <a href="./tools/${tool.id}/index.html" class="sitemap-card-link">
            <div class="sitemap-card-top">
              <h3 class="sitemap-card-name">${tool.name}</h3>
              <span class="sitemap-badge-new">NEW</span>
            </div>
            <p class="sitemap-card-desc">${tool.desc}</p>
            <div class="sitemap-card-footer">
              <span class="sitemap-link-text">Launch Tool &rarr;</span>
              <span class="sitemap-privacy-tag">100% Private</span>
            </div>
          </a>
        </article>`;
}

// 1. Insert into Image section
const imgIdx = html.indexOf('id="cat-image"');
if (imgIdx !== -1) {
  const gridAnchor = '<div class="sitemap-grid">';
  const gridIdx = html.indexOf(gridAnchor, imgIdx);
  if (gridIdx !== -1) {
    const insertPos = gridIdx + gridAnchor.length;
    let cards = '';
    for (const t of imageTools) {
      if (!html.includes(t.id)) {
        cards += generateCard(t);
      }
    }
    html = html.slice(0, insertPos) + cards + html.slice(insertPos);
    console.log('Inserted image cards into sitemap.html');
  }
}

// 2. Insert into Video section
const vidIdx = html.indexOf('id="cat-video"');
if (vidIdx !== -1) {
  const gridAnchor = '<div class="sitemap-grid">';
  const gridIdx = html.indexOf(gridAnchor, vidIdx);
  if (gridIdx !== -1) {
    const insertPos = gridIdx + gridAnchor.length;
    let cards = '';
    for (const t of videoTools) {
      if (!html.includes(t.id)) {
        cards += generateCard(t);
      }
    }
    html = html.slice(0, insertPos) + cards + html.slice(insertPos);
    console.log('Inserted video cards into sitemap.html');
  }
}

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('sitemap.html updated successfully.');
