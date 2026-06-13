const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'tools-db.json');
let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const newTools = [
  { name: 'Video Converter', desc: 'Convert MP4, WEBM, MOV, MKV, AVI files natively in your browser.' },
  { name: 'Video Compressor', desc: 'Reduce video file size with Low, Medium, High, or Custom Quality.' },
  { name: 'Video Trimmer', desc: 'Cut and trim videos easily by specifying Start and End times.' },
  { name: 'Video Merger', desc: 'Merge multiple video clips, arrange order, and export as one.' },
  { name: 'Video Cropper', desc: 'Crop video dimensions for Custom Size or Social Media formats.' },
  { name: 'Video Rotator', desc: 'Rotate video 90°, 180°, 270°, or Flip Horizontal/Vertical.' },
  { name: 'Video Speed Controller', desc: 'Speed up or slow down video playback (0.5x, 1x, 1.5x, 2x, 4x).' },
  { name: 'Video to GIF', desc: 'Convert videos to GIF with adjustable FPS and quality.' },
  { name: 'GIF to Video', desc: 'Convert animated GIFs into MP4 or WEBM video formats.' },
  { name: 'Video Thumbnail Generator', desc: 'Extract high-quality thumbnails from videos at custom timestamps.' },
  { name: 'YouTube Thumbnail Downloader', desc: 'Download HD and 4K thumbnails from any YouTube video.' },
  { name: 'Video Resizer', desc: 'Resize videos for YouTube, TikTok, Instagram Reels/Stories, and Facebook.' },
  { name: 'Video Caption Generator', desc: 'Generate manual captions and export as SRT subtitle files.' },
  { name: 'Extract Audio', desc: 'Extract audio tracks from video as MP3, WAV, or AAC.' },
  { name: 'Mute Video', desc: 'Remove audio tracks from any video file instantly.' },
  { name: 'Add Audio to Video', desc: 'Add background music or voiceovers to your video.' },
  { name: 'Video Watermark', desc: 'Protect your videos with Logo or Text watermarks.' },
  { name: 'Intro Maker', desc: 'Create impressive intros for Business, Travel Agency, or Brand channels.' },
  { name: 'Outro Maker', desc: 'Create custom engaging outros for your videos.' },
  { name: 'Travel Promo Video Maker', desc: 'Create beautiful travel and tour promotional videos.' },
  { name: 'Tour Package Slideshow', desc: 'Generate stunning slideshows for tour packages.' },
  { name: 'Visa Service Promo Creator', desc: 'Create engaging promotional videos for Visa Services.' },
  { name: 'Umrah Promo Creator', desc: 'Generate professional Hajj & Umrah promotional videos.' },
  { name: 'Hotel Showcase Video', desc: 'Create elegant video showcases for Hotels and Resorts.' },
  { name: 'Product Video Maker', desc: 'Create high-converting e-commerce product videos.' },
  { name: 'Product Slideshow', desc: 'Generate fast product catalog slideshow videos.' },
  { name: 'Product Showcase Creator', desc: 'Create dynamic video showcases for your top products.' },
  { name: 'Luxury Promo Creator', desc: 'Design high-end luxury promotional videos.' },
  { name: 'Brand Story Video', desc: 'Tell your brand story with beautiful video templates.' },
  { name: 'Logo Reveal Creator', desc: 'Create stunning animated logo reveals for your brand.' },
  { name: 'AI Video Editor', desc: 'Edit videos automatically using AI intelligence.' },
  { name: 'AI Background Removal', desc: 'Remove video backgrounds without a green screen.' },
  { name: 'AI Subtitle Generator', desc: 'Auto-generate highly accurate subtitles using AI speech recognition.' },
  { name: 'AI Voiceover', desc: 'Generate realistic AI voiceovers for your videos.' },
  { name: 'AI Video Summary', desc: 'Automatically summarize long videos into short clips.' },
  { name: 'AI Video Translation', desc: 'Translate video audio to different languages instantly.' },
  { name: 'AI Video Upscaler', desc: 'Upscale low-resolution videos to 4K using AI.' },
  { name: 'AI Video Enhancement', desc: 'Enhance colors, lighting, and sharpness using AI.' },
  { name: 'AI Video Generator', desc: 'Generate complete videos from text prompts.' },
  { name: 'AI Avatar Creator', desc: 'Create talking AI avatars for presentations.' }
];

// Add if not exist
newTools.forEach(nt => {
  const id = nt.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (!db.find(t => t.id === id)) {
    db.push({
      id: id,
      name: nt.name,
      description: nt.desc,
      category: 'video',
      active: false,
      tags: ['video', 'media', id.replace(/-/g, ' ')]
    });
  }
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('Added Video tools to database.');
