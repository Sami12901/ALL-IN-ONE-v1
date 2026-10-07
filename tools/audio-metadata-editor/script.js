// Audio Metadata & ID3 Tag Editor - ALL IN ONE
// Complete Client-side ID3v2.3 & ID3v1 Parser and Writer in Vanilla JS

let currentAudioBuffer = null;
let rawFileBuffer = null;
let currentFileName = 'track.mp3';
let currentMimeType = 'audio/mpeg';
let currentCoverBlob = null;
let currentCoverUrl = null;

// DOM Elements
const dropZone = document.getElementById('drop-zone');
const audioInput = document.getElementById('audio-input');
const btnLoadDemo = document.getElementById('btn-load-demo');
const btnReset = document.getElementById('btn-reset');
const fileMetaBadges = document.getElementById('file-meta-badges');
const badgeFileFormat = document.getElementById('badge-file-format');
const badgeFileSize = document.getElementById('badge-file-size');
const badgeDuration = document.getElementById('badge-duration');

const editorWorkspace = document.getElementById('editor-workspace');

const inputTitle = document.getElementById('input-title');
const inputArtist = document.getElementById('input-artist');
const inputAlbum = document.getElementById('input-album');
const inputYear = document.getElementById('input-year');
const inputTrack = document.getElementById('input-track');
const inputGenre = document.getElementById('input-genre');
const inputComment = document.getElementById('input-comment');

const artFileInput = document.getElementById('art-file-input');
const btnRemoveArt = document.getElementById('btn-remove-art');
const previewCoverImg = document.getElementById('preview-cover-img');
const previewCoverPlaceholder = document.getElementById('preview-cover-placeholder');

const cardTrackBadge = document.getElementById('card-track-badge');
const cardTitle = document.getElementById('card-title');
const cardArtist = document.getElementById('card-artist');
const cardAlbum = document.getElementById('card-album');
const cardGenre = document.getElementById('card-genre');

const audioPreviewPlayer = document.getElementById('audio-preview-player');
const btnSaveTags = document.getElementById('btn-save-tags');
const saveStatusMsg = document.getElementById('save-status-msg');

const ID3_GENRES = [
  'Blues', 'Classic Rock', 'Country', 'Dance', 'Disco', 'Funk', 'Grunge',
  'Hip-Hop', 'Jazz', 'Metal', 'New Age', 'Oldies', 'Other', 'Pop', 'R&B',
  'Rap', 'Reggae', 'Rock', 'Techno', 'Industrial', 'Alternative', 'Ska',
  'Death Metal', 'Pranks', 'Soundtrack', 'Euro-Techno', 'Ambient', 'Trip-Hop',
  'Vocal', 'Jazz+Funk', 'Fusion', 'Trance', 'Classical', 'Instrumental',
  'Acid', 'House', 'Game', 'Sound Clip', 'Gospel', 'Noise', 'AlternRock',
  'Bass', 'Soul', 'Punk', 'Space', 'Meditative', 'Instrumental Pop',
  'Instrumental Rock', 'Ethnic', 'Gothic', 'Darkwave', 'Techno-Industrial',
  'Electronic', 'Pop-Folk', 'Eurodance', 'Dream', 'Southern Rock', 'Comedy',
  'Cult', 'Gangsta', 'Top 40', 'Christian Rap', 'Pop/Funk', 'Jungle',
  'Native American', 'Cabaret', 'New Wave', 'Psychadelic', 'Rave',
  'Showtunes', 'Trailer', 'Lo-Fi', 'Tribal', 'Acid Punk', 'Acid Jazz',
  'Polka', 'Retro', 'Musical', 'Rock & Roll', 'Hard Rock', 'Folk',
  'Folk-Rock', 'National Folk', 'Swing', 'Fast Fusion', 'Bebob', 'Latin',
  'Revival', 'Celtic', 'Bluegrass', 'Avantgarde', 'Gothic Rock',
  'Progressive Rock', 'Psychedelic Rock', 'Symphonic Rock', 'Slow Rock',
  'Big Band', 'Chorus', 'Easy Listening', 'Acoustic', 'Humour', 'Speech',
  'Chanson', 'Opera', 'Chamber Music', 'Sonata', 'Symphony', 'Booty Bass',
  'Primus', 'Porn Groove', 'Satire', 'Slow Jam', 'Club', 'Tango', 'Samba',
  'Folklore', 'Ballad', 'Power Ballad', 'Rhythmic Soul', 'Freestyle',
  'Duet', 'Punk Rock', 'Drum Solo', 'Acapella', 'Euro-House', 'Dance Hall',
  'Synthwave', 'Podcast'
];

function formatTime(sec) {
  if (isNaN(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Decode Synchsafe integer (7 bits per byte)
function decodeSynchsafe(b0, b1, b2, b3) {
  return ((b0 & 0x7F) << 21) | ((b1 & 0x7F) << 14) | ((b2 & 0x7F) << 7) | (b3 & 0x7F);
}

// Encode Synchsafe integer
function encodeSynchsafe(num) {
  return [
    (num >> 21) & 0x7F,
    (num >> 14) & 0x7F,
    (num >> 7) & 0x7F,
    num & 0x7F
  ];
}

// Decode ID3 string with encoding byte
function decodeID3String(bytes, encoding) {
  if (!bytes || bytes.length === 0) return '';
  if (encoding === 0) {
    // ISO-8859-1
    let str = '';
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] === 0) break;
      str += String.fromCharCode(bytes[i]);
    }
    return str.trim();
  } else if (encoding === 1 || encoding === 2) {
    // UTF-16 with BOM or UTF-16BE
    try {
      const decoder = new TextDecoder('utf-16');
      return decoder.decode(bytes).replace(/\0/g, '').trim();
    } catch (_) {
      return '';
    }
  } else if (encoding === 3) {
    // UTF-8
    try {
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(bytes).replace(/\0/g, '').trim();
    } catch (_) {
      return '';
    }
  }
  return '';
}

// Parse ID3v2 Tags from ArrayBuffer
function parseID3v2(view) {
  const tags = {
    title: '',
    artist: '',
    album: '',
    year: '',
    track: '',
    genre: '',
    comment: '',
    coverBlob: null,
    tagSizeTotal: 0
  };

  if (view.byteLength < 10) return tags;

  // Check 'ID3' magic
  const magic = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2));
  if (magic !== 'ID3') return tags;

  const major = view.getUint8(3);
  const flags = view.getUint8(5);
  const tagSize = decodeSynchsafe(view.getUint8(6), view.getUint8(7), view.getUint8(8), view.getUint8(9));
  tags.tagSizeTotal = 10 + tagSize;

  let offset = 10;
  // Extended header handling
  if ((flags & 0x40) !== 0 && offset + 4 <= view.byteLength) {
    const extHeaderSize = decodeSynchsafe(view.getUint8(offset), view.getUint8(offset + 1), view.getUint8(offset + 2), view.getUint8(offset + 3));
    offset += (major === 4 ? extHeaderSize : extHeaderSize + 4);
  }

  const endOffset = Math.min(10 + tagSize, view.byteLength);

  while (offset + 10 <= endOffset) {
    const id = String.fromCharCode(
      view.getUint8(offset),
      view.getUint8(offset + 1),
      view.getUint8(offset + 2),
      view.getUint8(offset + 3)
    );

    // Padding zeros encountered
    if (view.getUint8(offset) === 0) break;

    let frameSize = 0;
    if (major === 4) {
      frameSize = decodeSynchsafe(view.getUint8(offset + 4), view.getUint8(offset + 5), view.getUint8(offset + 6), view.getUint8(offset + 7));
    } else {
      frameSize = view.getUint32(offset + 4, false);
    }

    if (frameSize <= 0 || offset + 10 + frameSize > endOffset) break;

    const frameData = new Uint8Array(view.buffer, view.byteOffset + offset + 10, frameSize);
    offset += 10 + frameSize;

    if (frameData.length <= 1) continue;

    const encoding = frameData[0];
    const textBytes = frameData.subarray(1);

    if (id === 'TIT2') {
      tags.title = decodeID3String(textBytes, encoding);
    } else if (id === 'TPE1') {
      tags.artist = decodeID3String(textBytes, encoding);
    } else if (id === 'TALB') {
      tags.album = decodeID3String(textBytes, encoding);
    } else if (id === 'TYER' || id === 'TDRC') {
      tags.year = decodeID3String(textBytes, encoding).slice(0, 4);
    } else if (id === 'TRCK') {
      tags.track = decodeID3String(textBytes, encoding).split('/')[0];
    } else if (id === 'TCON') {
      let g = decodeID3String(textBytes, encoding);
      // Format (13) or (Synthwave)
      const match = g.match(/\((\d+)\)/);
      if (match) {
        const idx = parseInt(match[1], 10);
        g = ID3_GENRES[idx] || g;
      }
      tags.genre = g;
    } else if (id === 'COMM') {
      // COMM frame: 1 byte encoding, 3 bytes lang, null-terminated short desc, comment text
      if (frameData.length > 4) {
        let textStart = 4;
        while (textStart < frameData.length && frameData[textStart] !== 0) {
          textStart++;
        }
        textStart++; // skip null terminator
        if (textStart < frameData.length) {
          tags.comment = decodeID3String(frameData.subarray(textStart), encoding);
        }
      }
    } else if (id === 'APIC') {
      // APIC: 1 byte encoding, null-terminated mime, 1 byte pic type, null-terminated desc, binary data
      try {
        let p = 1;
        let mime = '';
        while (p < frameData.length && frameData[p] !== 0) {
          mime += String.fromCharCode(frameData[p]);
          p++;
        }
        p++; // skip null
        const picType = frameData[p];
        p++; // skip pic type
        while (p < frameData.length && frameData[p] !== 0) {
          p++;
        }
        p++; // skip description null
        if (p < frameData.length) {
          const imgBytes = frameData.subarray(p);
          const mimeType = mime || 'image/jpeg';
          tags.coverBlob = new Blob([imgBytes], { type: mimeType });
        }
      } catch (e) {
        console.warn('Could not parse APIC cover art frame', e);
      }
    }
  }

  return tags;
}

// Parse ID3v1 from tail of file (128 bytes)
function parseID3v1(view) {
  const tags = {
    title: '', artist: '', album: '', year: '', track: '', genre: '', comment: ''
  };
  const len = view.byteLength;
  if (len < 128) return tags;

  const start = len - 128;
  const magic = String.fromCharCode(view.getUint8(start), view.getUint8(start + 1), view.getUint8(start + 2));
  if (magic !== 'TAG') return tags;

  function readAscii(s, l) {
    let out = '';
    for (let i = 0; i < l; i++) {
      const b = view.getUint8(start + s + i);
      if (b === 0) break;
      out += String.fromCharCode(b);
    }
    return out.trim();
  }

  tags.title = readAscii(3, 30);
  tags.artist = readAscii(33, 30);
  tags.album = readAscii(63, 30);
  tags.year = readAscii(93, 4);

  // Check track number (ID3v1.1)
  if (view.getUint8(start + 125) === 0 && view.getUint8(start + 126) !== 0) {
    tags.comment = readAscii(97, 28);
    tags.track = String(view.getUint8(start + 126));
  } else {
    tags.comment = readAscii(97, 30);
  }

  const genreIdx = view.getUint8(start + 127);
  if (genreIdx < ID3_GENRES.length) {
    tags.genre = ID3_GENRES[genreIdx];
  }

  return tags;
}

// Build ID3v2.3 tag buffer
async function buildID3v23Buffer(tags, coverBlob) {
  const frames = [];

  function makeTextFrame(id, text) {
    if (!text || !text.trim()) return null;
    const encoder = new TextEncoder();
    const strBytes = encoder.encode(text.trim());
    const dataSize = 1 + strBytes.length; // 1 byte for encoding (3 = UTF-8)

    const frameBuf = new Uint8Array(10 + dataSize);
    // Frame ID
    for (let i = 0; i < 4; i++) frameBuf[i] = id.charCodeAt(i);
    // Frame Size (32-bit big endian)
    const view = new DataView(frameBuf.buffer);
    view.setUint32(4, dataSize, false);
    // Flags: 0
    frameBuf[8] = 0;
    frameBuf[9] = 0;
    // Encoding: 3 (UTF-8)
    frameBuf[10] = 3;
    frameBuf.set(strBytes, 11);
    return frameBuf;
  }

  function makeCommentFrame(commentText) {
    if (!commentText || !commentText.trim()) return null;
    const encoder = new TextEncoder();
    const strBytes = encoder.encode(commentText.trim());
    // 1 (encoding) + 3 (lang) + 1 (desc null) + strBytes.length
    const dataSize = 5 + strBytes.length;
    const frameBuf = new Uint8Array(10 + dataSize);
    for (let i = 0; i < 4; i++) frameBuf[i] = 'COMM'.charCodeAt(i);
    const view = new DataView(frameBuf.buffer);
    view.setUint32(4, dataSize, false);
    frameBuf[8] = 0;
    frameBuf[9] = 0;
    frameBuf[10] = 3; // UTF-8
    frameBuf[11] = 101; // 'e'
    frameBuf[12] = 110; // 'n'
    frameBuf[13] = 103; // 'g'
    frameBuf[14] = 0; // null description
    frameBuf.set(strBytes, 15);
    return frameBuf;
  }

  async function makeApicFrame(blob) {
    if (!blob) return null;
    const imgBuf = new Uint8Array(await blob.arrayBuffer());
    const mime = blob.type || 'image/jpeg';
    const mimeBytes = new TextEncoder().encode(mime);

    // 1 (enc) + mimeBytes.length + 1 (null) + 1 (pic type) + 1 (desc null) + imgBuf.length
    const dataSize = 1 + mimeBytes.length + 1 + 1 + 1 + imgBuf.length;
    const frameBuf = new Uint8Array(10 + dataSize);
    for (let i = 0; i < 4; i++) frameBuf[i] = 'APIC'.charCodeAt(i);
    const view = new DataView(frameBuf.buffer);
    view.setUint32(4, dataSize, false);
    frameBuf[8] = 0;
    frameBuf[9] = 0;

    let offset = 10;
    frameBuf[offset++] = 0; // ISO-8859-1 for mime/desc
    frameBuf.set(mimeBytes, offset);
    offset += mimeBytes.length;
    frameBuf[offset++] = 0; // null
    frameBuf[offset++] = 3; // Front Cover (type 3)
    frameBuf[offset++] = 0; // empty description null
    frameBuf.set(imgBuf, offset);
    return frameBuf;
  }

  const fTitle = makeTextFrame('TIT2', tags.title);
  if (fTitle) frames.push(fTitle);

  const fArtist = makeTextFrame('TPE1', tags.artist);
  if (fArtist) frames.push(fArtist);

  const fAlbum = makeTextFrame('TALB', tags.album);
  if (fAlbum) frames.push(fAlbum);

  const fYear = makeTextFrame('TYER', tags.year);
  if (fYear) frames.push(fYear);

  const fTrack = makeTextFrame('TRCK', tags.track);
  if (fTrack) frames.push(fTrack);

  const fGenre = makeTextFrame('TCON', tags.genre);
  if (fGenre) frames.push(fGenre);

  const fComm = makeCommentFrame(tags.comment);
  if (fComm) frames.push(fComm);

  if (coverBlob) {
    const fApic = await makeApicFrame(coverBlob);
    if (fApic) frames.push(fApic);
  }

  let totalFramesSize = 0;
  frames.forEach(f => { totalFramesSize += f.length; });

  // Add 1024 bytes of padding for clean tag writing
  const paddingSize = 1024;
  const tagPayloadSize = totalFramesSize + paddingSize;
  const headerBuf = new Uint8Array(10);

  // 'ID3'
  headerBuf[0] = 73; headerBuf[1] = 68; headerBuf[2] = 51;
  headerBuf[3] = 3; // v2.3
  headerBuf[4] = 0;
  headerBuf[5] = 0; // Flags

  const synch = encodeSynchsafe(tagPayloadSize);
  headerBuf[6] = synch[0];
  headerBuf[7] = synch[1];
  headerBuf[8] = synch[2];
  headerBuf[9] = synch[3];

  const result = new Uint8Array(10 + tagPayloadSize);
  result.set(headerBuf, 0);
  let pos = 10;
  frames.forEach(f => {
    result.set(f, pos);
    pos += f.length;
  });

  return result;
}

// Build ID3v1 128-byte chunk
function buildID3v1Buffer(tags) {
  const buf = new Uint8Array(128);
  buf[0] = 84; buf[1] = 65; buf[2] = 71; // 'TAG'

  function writeAscii(str, start, maxLen) {
    const s = (str || '').slice(0, maxLen);
    for (let i = 0; i < s.length; i++) {
      buf[start + i] = s.charCodeAt(i) & 0xFF;
    }
  }

  writeAscii(tags.title, 3, 30);
  writeAscii(tags.artist, 33, 30);
  writeAscii(tags.album, 63, 30);
  writeAscii(tags.year, 93, 4);
  writeAscii(tags.comment, 97, 28);

  buf[125] = 0;
  buf[126] = parseInt(tags.track, 10) || 1;

  const genreIdx = ID3_GENRES.indexOf(tags.genre);
  buf[127] = genreIdx >= 0 ? genreIdx : 255;

  return buf;
}

// Generate built-in Demo synth audio with album art
async function generateDemoTrack() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioContextClass();
  const sampleRate = ctx.sampleRate || 44100;
  const dur = 4.0;
  const numSamples = Math.floor(sampleRate * dur);
  const audioBuffer = ctx.createBuffer(2, numSamples, sampleRate);
  const left = audioBuffer.getChannelData(0);
  const right = audioBuffer.getChannelData(1);

  // Synthesize rich 80s synth chords
  const freqs = [261.63, 329.63, 392.00, 493.88]; // Cmaj7
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let s = 0;
    freqs.forEach(f => {
      s += Math.sin(2 * Math.PI * f * t) * 0.15;
    });
    const bass = Math.sin(2 * Math.PI * 130.81 * t) * 0.25;
    left[i] = (s + bass) * Math.sin(t * Math.PI / dur);
    right[i] = (s * 0.9 + bass) * Math.sin(t * Math.PI / dur);
  }

  // Convert to 16-bit PCM WAV
  const wavBlob = audioBufferToWavBlob(audioBuffer);
  rawFileBuffer = await wavBlob.arrayBuffer();
  currentFileName = 'Neon_Horizon_Solaris.wav';
  currentMimeType = 'audio/wav';

  // Generate stylized Album Cover Art via Offscreen Canvas
  const artCanvas = document.createElement('canvas');
  artCanvas.width = 300;
  artCanvas.height = 300;
  const actx = artCanvas.getContext('2d');

  // Gradient
  const grad = actx.createLinearGradient(0, 0, 300, 300);
  grad.addColorStop(0, '#1e1b4b');
  grad.addColorStop(0.5, '#4338ca');
  grad.addColorStop(1, '#ec4899');
  actx.fillStyle = grad;
  actx.fillRect(0, 0, 300, 300);

  // Sun circle
  actx.fillStyle = '#fde047';
  actx.beginPath();
  actx.arc(150, 150, 60, 0, Math.PI * 2);
  actx.fill();

  // Retro Grid Lines
  actx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  actx.lineWidth = 2;
  for (let y = 180; y <= 300; y += 20) {
    actx.beginPath();
    actx.moveTo(0, y);
    actx.lineTo(300, y);
    actx.stroke();
  }

  actx.fillStyle = '#ffffff';
  actx.font = 'bold 22px sans-serif';
  actx.textAlign = 'center';
  actx.fillText('SOLARIS', 150, 80);
  actx.font = '14px sans-serif';
  actx.fillText('NEON HORIZON', 150, 270);

  const coverBlob = await new Promise(resolve => artCanvas.toBlob(resolve, 'image/jpeg', 0.92));

  loadMetadataIntoUI({
    title: 'Neon Horizon',
    artist: 'Solaris',
    album: 'Retro Dreams EP',
    year: '2026',
    track: '1',
    genre: 'Synthwave',
    comment: 'Mastered for high-fidelity client-side playback',
    coverBlob
  }, dur);
}

// Convert AudioBuffer to WAV
function audioBufferToWavBlob(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const dataSize = buffer.length * numChannels * 2;
  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);

  function writeStr(offset, str) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  const left = buffer.getChannelData(0);
  const right = numChannels > 1 ? buffer.getChannelData(1) : left;

  for (let i = 0; i < buffer.length; i++) {
    let sL = Math.max(-1, Math.min(1, left[i]));
    let sR = Math.max(-1, Math.min(1, right[i]));
    view.setInt16(offset, sL < 0 ? sL * 0x8000 : sL * 0x7FFF, true);
    offset += 2;
    if (numChannels > 1) {
      view.setInt16(offset, sR < 0 ? sR * 0x8000 : sR * 0x7FFF, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function loadMetadataIntoUI(tags, durationSec = 0) {
  inputTitle.value = tags.title || '';
  inputArtist.value = tags.artist || '';
  inputAlbum.value = tags.album || '';
  inputYear.value = tags.year || '';
  inputTrack.value = tags.track || '';
  inputGenre.value = tags.genre || '';
  inputComment.value = tags.comment || '';

  if (tags.coverBlob) {
    setCoverArt(tags.coverBlob);
  } else {
    clearCoverArt();
  }

  badgeFileFormat.textContent = currentFileName.split('.').pop().toUpperCase();
  badgeFileSize.textContent = formatBytes(rawFileBuffer ? rawFileBuffer.byteLength : 0);
  badgeDuration.textContent = formatTime(durationSec);

  fileMetaBadges.style.display = 'flex';
  btnReset.style.display = 'inline-flex';
  editorWorkspace.style.display = 'flex';

  syncCardPreview();

  // Create preview audio player URL
  if (rawFileBuffer) {
    const blob = new Blob([rawFileBuffer], { type: currentMimeType });
    audioPreviewPlayer.src = URL.createObjectURL(blob);
  }
}

function setCoverArt(blob) {
  currentCoverBlob = blob;
  if (currentCoverUrl) URL.revokeObjectURL(currentCoverUrl);
  currentCoverUrl = URL.createObjectURL(blob);
  previewCoverImg.src = currentCoverUrl;
  previewCoverImg.style.display = 'block';
  previewCoverPlaceholder.style.display = 'none';
  btnRemoveArt.style.display = 'inline-flex';
}

function clearCoverArt() {
  currentCoverBlob = null;
  if (currentCoverUrl) URL.revokeObjectURL(currentCoverUrl);
  currentCoverUrl = null;
  previewCoverImg.src = '';
  previewCoverImg.style.display = 'none';
  previewCoverPlaceholder.style.display = 'flex';
  btnRemoveArt.style.display = 'none';
}

function syncCardPreview() {
  cardTitle.textContent = inputTitle.value.trim() || 'Untitled Song';
  cardArtist.textContent = inputArtist.value.trim() || 'Unknown Artist';
  const albumStr = inputAlbum.value.trim() || 'Unknown Album';
  const yearStr = inputYear.value.trim() ? ` (${inputYear.value.trim()})` : '';
  cardAlbum.textContent = `${albumStr}${yearStr}`;
  cardTrackBadge.textContent = `TRACK #${inputTrack.value.trim() || '1'}`;
  cardGenre.textContent = inputGenre.value.trim() || 'Audio Track';
}

// Handle uploaded file
async function handleAudioFile(file) {
  try {
    currentFileName = file.name;
    currentMimeType = file.type || 'audio/mpeg';
    rawFileBuffer = await file.arrayBuffer();

    const view = new DataView(rawFileBuffer);
    let tags = parseID3v2(view);

    // Fallback to ID3v1 if ID3v2 has empty fields
    const tagsV1 = parseID3v1(view);
    if (!tags.title && tagsV1.title) tags.title = tagsV1.title;
    if (!tags.artist && tagsV1.artist) tags.artist = tagsV1.artist;
    if (!tags.album && tagsV1.album) tags.album = tagsV1.album;
    if (!tags.year && tagsV1.year) tags.year = tagsV1.year;
    if (!tags.track && tagsV1.track) tags.track = tagsV1.track;
    if (!tags.genre && tagsV1.genre) tags.genre = tagsV1.genre;
    if (!tags.comment && tagsV1.comment) tags.comment = tagsV1.comment;

    // Decode duration using AudioContext
    let duration = 0;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      const decoded = await ctx.decodeAudioData(rawFileBuffer.slice(0));
      duration = decoded.duration;
    } catch (_) {}

    loadMetadataIntoUI(tags, duration);
  } catch (err) {
    console.error('Failed to parse audio file:', err);
    alert('Could not inspect audio tags: ' + err.message);
  }
}

// Live card inputs synchronization
[inputTitle, inputArtist, inputAlbum, inputYear, inputTrack, inputGenre, inputComment].forEach(inp => {
  inp.addEventListener('input', syncCardPreview);
});

// Art file upload
artFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    setCoverArt(file);
  }
});

btnRemoveArt.addEventListener('click', () => {
  clearCoverArt();
});

// Drop zone
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) handleAudioFile(file);
});

audioInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) handleAudioFile(file);
});

btnLoadDemo.addEventListener('click', () => {
  generateDemoTrack();
});

btnReset.addEventListener('click', () => {
  if (confirm('Reset editor fields?')) {
    rawFileBuffer = null;
    clearCoverArt();
    editorWorkspace.style.display = 'none';
    fileMetaBadges.style.display = 'none';
    btnReset.style.display = 'none';
    audioInput.value = '';
    audioPreviewPlayer.pause();
    audioPreviewPlayer.src = '';
  }
});

// Save Tags & Download File
btnSaveTags.addEventListener('click', async () => {
  if (!rawFileBuffer) {
    alert('Please upload an audio file first.');
    return;
  }

  btnSaveTags.disabled = true;
  btnSaveTags.innerHTML = 'Applying ID3 Tags...';

  try {
    const tags = {
      title: inputTitle.value.trim(),
      artist: inputArtist.value.trim(),
      album: inputAlbum.value.trim(),
      year: inputYear.value.trim(),
      track: inputTrack.value.trim(),
      genre: inputGenre.value.trim(),
      comment: inputComment.value.trim()
    };

    const id3v2Buf = await buildID3v23Buffer(tags, currentCoverBlob);
    const id3v1Buf = buildID3v1Buffer(tags);

    // Identify raw audio stream by stripping old ID3v2 and ID3v1
    const view = new DataView(rawFileBuffer);
    let audioStart = 0;
    let audioEnd = rawFileBuffer.byteLength;

    // Check existing ID3v2 at start
    const magic = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2));
    if (magic === 'ID3') {
      const tagSize = decodeSynchsafe(view.getUint8(6), view.getUint8(7), view.getUint8(8), view.getUint8(9));
      audioStart = 10 + tagSize;
    }

    // Check existing ID3v1 at end
    if (audioEnd - audioStart >= 128) {
      const tailMagic = String.fromCharCode(
        view.getUint8(audioEnd - 128),
        view.getUint8(audioEnd - 127),
        view.getUint8(audioEnd - 126)
      );
      if (tailMagic === 'TAG') {
        audioEnd -= 128;
      }
    }

    const audioStream = new Uint8Array(rawFileBuffer, audioStart, Math.max(0, audioEnd - audioStart));

    // Combine: [ID3v2.3] + [Audio Stream] + [ID3v1]
    const finalSize = id3v2Buf.length + audioStream.length + id3v1Buf.length;
    const finalBuffer = new Uint8Array(finalSize);
    finalBuffer.set(id3v2Buf, 0);
    finalBuffer.set(audioStream, id3v2Buf.length);
    finalBuffer.set(id3v1Buf, id3v2Buf.length + audioStream.length);

    const updatedBlob = new Blob([finalBuffer], { type: currentMimeType || 'audio/mpeg' });
    const downloadUrl = URL.createObjectURL(updatedBlob);

    // Update player
    audioPreviewPlayer.src = downloadUrl;

    // Download trigger
    const a = document.createElement('a');
    a.href = downloadUrl;
    const ext = currentFileName.split('.').pop() || 'mp3';
    const base = currentFileName.replace(/\.[^/.]+$/, '');
    a.download = `${base}_tagged.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    saveStatusMsg.style.display = 'block';
    setTimeout(() => {
      saveStatusMsg.style.display = 'none';
    }, 4000);
  } catch (err) {
    console.error('Failed to save ID3 tags:', err);
    alert('Failed to save metadata tags: ' + err.message);
  } finally {
    btnSaveTags.disabled = false;
    btnSaveTags.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
      <span>Save ID3 Tags & Download File</span>
    `;
  }
});