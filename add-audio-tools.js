const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'tools-db.json');
let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const newTools = [
  { name: 'Audio Converter', desc: 'Convert MP3, WAV, AAC, OGG, FLAC, M4A natively in your browser.' },
  { name: 'Audio Compressor', desc: 'Reduce audio file size, adjust quality and bitrate.' },
  { name: 'Audio Cutter', desc: 'Trim and cut specific parts of an audio file.' },
  { name: 'Audio Merger', desc: 'Merge multiple audio files and arrange their order.' },
  { name: 'Audio Volume Booster', desc: 'Increase volume and normalize audio levels.' },
  { name: 'Audio Speed Changer', desc: 'Change audio playback speed (0.5x to 2x).' },
  { name: 'Audio Pitch Changer', desc: 'Adjust voice pitch up or down without changing speed.' },
  { name: 'Audio Reverser', desc: 'Reverse audio playback direction.' },
  { name: 'Audio Recorder', desc: 'Record high-quality audio directly from your microphone.' },
  { name: 'Audio Metadata Editor', desc: 'Edit ID3 tags like Title, Artist, Album, Genre, and Cover Art.' },
  { name: 'Podcast Editor', desc: 'Cut, trim, merge, and normalize podcast audio files.' },
  { name: 'Podcast Intro Creator', desc: 'Create engaging intros and outros for podcasts.' },
  { name: 'BPM Detector', desc: 'Automatically detect the BPM (beats per minute) of music tracks.' },
  { name: 'Audio Loop Creator', desc: 'Create seamless loops from any audio clip.' },
  { name: 'Karaoke Maker', desc: 'Reduce or isolate vocals to create karaoke tracks.' },
  { name: 'Extract Audio from Video', desc: 'Extract MP3 from MP4, MOV, and MKV video files.' },
  { name: 'Add Audio to Video', desc: 'Add background music or voiceovers to video clips.' },
  { name: 'Voice Announcement Creator', desc: 'Create professional business and travel announcements.' },
  { name: 'Audio Watermark', desc: 'Add brand watermarks or audio branding to your tracks.' },
  { name: 'Travel Promo Voice', desc: 'Generate engaging voices for travel promotions.' },
  { name: 'Tour Announcement', desc: 'Create voice announcements for tour packages.' },
  { name: 'Airport Announcement', desc: 'Generate realistic airport-style announcements.' },
  { name: 'Umrah Guide Audio', desc: 'Create professional audio guides for Hajj & Umrah.' },
  { name: 'Product Voiceover', desc: 'Generate voiceovers for e-commerce products.' },
  { name: 'Advertisement Audio', desc: 'Create engaging audio for digital advertisements.' },
  { name: 'Promo Audio Creator', desc: 'Generate promotional audio for any business.' },
  { name: 'Brand Jingle Creator', desc: 'Create catchy audio jingles for your luxury brand.' },
  { name: 'Luxury Promo Voice', desc: 'Generate high-end, elegant voiceovers for luxury promos.' },
  { name: 'Audio Branding', desc: 'Create unique audio identities and sonic branding.' },
  { name: 'AI Voice Generator', desc: 'Generate highly realistic AI voices for your scripts.' },
  { name: 'AI Text to Speech', desc: 'Convert text to natural-sounding speech using AI.' },
  { name: 'AI Speech to Text', desc: 'Transcribe audio to text with AI precision.' },
  { name: 'AI Voice Cloning', desc: 'Clone voices securely and accurately using AI.' },
  { name: 'AI Noise Removal', desc: 'Remove background noise and clean up audio tracks.' },
  { name: 'AI Audio Enhancement', desc: 'Enhance audio quality to studio-grade levels using AI.' },
  { name: 'AI Translation', desc: 'Translate spoken audio to multiple languages instantly.' },
  { name: 'AI Dubbing', desc: 'Automatically dub audio into different languages.' },
  { name: 'AI Podcast Generator', desc: 'Generate entire podcast episodes using AI.' },
  { name: 'AI Music Generator', desc: 'Create royalty-free background music using AI.' }
];

// Add if not exist
newTools.forEach(nt => {
  const id = nt.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (!db.find(t => t.id === id)) {
    db.push({
      id: id,
      name: nt.name,
      description: nt.desc,
      category: 'audio',
      active: false,
      tags: ['audio', 'music', 'sound', id.replace(/-/g, ' ')]
    });
  }
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('Added Audio tools to database.');
