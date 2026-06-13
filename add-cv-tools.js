const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'tools-db.json');
let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const newTools = [
  // Main Tools
  { name: 'Professional CV Builder Pro', desc: 'Create your CV online with live preview, ATS-friendly templates, and export to PDF/DOCX.' },
  { name: 'CV Templates Gallery', desc: 'Browse Modern, Corporate, Developer, Designer, Student, and Executive CV templates.' },
  
  // Resume Features
  { name: 'Resume Generator', desc: 'Auto-generate a professional resume from your basic details.' },
  { name: 'ATS Resume Checker', desc: 'Check your ATS score and keyword analysis instantly.' },
  { name: 'Resume Optimizer', desc: 'Get suggestions to improve and optimize your resume.' },
  
  // Job Tools
  { name: 'Cover Letter Builder', desc: 'Create professional cover letters with custom templates.' },
  { name: 'Job Application Generator', desc: 'Generate complete job applications and email templates.' },
  { name: 'Reference Letter Builder', desc: 'Create perfectly formatted recommendation letters.' },
  
  // Developer & Design
  { name: 'Developer CV Suite', desc: 'CV builder with GitHub Profile, Tech Stack, and Projects sections.' },
  { name: 'Designer CV Suite', desc: 'Creative CV builder with Portfolio and beautiful layouts.' },
  
  // Travel Agency CVs
  { name: 'Travel Consultant CV', desc: 'Specialized CV templates for Travel Consultants.' },
  { name: 'Visa Officer CV', desc: 'Professional CV formats for Visa Officers.' },
  { name: 'Ticketing Officer CV', desc: 'Ticketing Officer and Tour Manager CV templates.' },
  
  // E-commerce CVs
  { name: 'E-commerce Manager CV', desc: 'CV templates for E-commerce and Digital Marketing Managers.' },
  { name: 'Sales Executive CV', desc: 'Results-driven CV templates for Sales and Support Executives.' },
  
  // Professional Features
  { name: 'Skill Visualizer', desc: 'Generate beautiful skill bars and skill charts for your CV.' },
  { name: 'Experience Timeline', desc: 'Create a professional career timeline graphic.' },
  
  // Premium Features
  { name: 'CV Analyzer', desc: 'Analyze CV score, strengths, and weaknesses.' },
  { name: 'Resume Keyword Generator', desc: 'Generate job-based keywords for ATS compatibility.' },
  
  // Coming Soon AI
  { name: 'AI CV Builder', desc: 'Build your CV entirely using AI intelligence.' },
  { name: 'AI Resume Writer', desc: 'Let AI write your professional summary and experience bullet points.' },
  { name: 'AI Cover Letter Writer', desc: 'Generate highly tailored cover letters instantly with AI.' },
  { name: 'AI ATS Optimization', desc: 'Optimize your CV specifically for ATS algorithms using AI.' },
  { name: 'AI Interview Preparation', desc: 'AI-driven interview prep based on your generated CV.' },
  { name: 'AI Career Coach', desc: 'Get personalized career guidance and advice from AI.' },
  { name: 'AI Job Matching', desc: 'Automatically match your CV to the best job openings.' },
  { name: 'LinkedIn Resume Import', desc: 'Import your LinkedIn profile and generate a CV instantly.' },
  { name: 'LinkedIn Profile Analyzer', desc: 'Analyze and optimize your LinkedIn profile.' },
  { name: 'Portfolio Website Generator', desc: 'Generate a stunning personal portfolio website from your CV.' }
];

// Add if not exist
newTools.forEach(nt => {
  const id = nt.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (!db.find(t => t.id === id)) {
    db.push({
      id: id,
      name: nt.name,
      description: nt.desc,
      category: 'cv',
      active: false,
      tags: ['cv', 'resume', 'job', 'career', id.replace(/-/g, ' ')]
    });
  }
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('Added CV tools to database.');
