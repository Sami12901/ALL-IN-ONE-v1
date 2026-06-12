const fs = require('fs');
const dbFile = 'data/tools-db.json';
const db = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

const existingNames = db.map(t => t.name.toLowerCase());

const rawText = `
Typing Speed Test
WPM Calculator
CPM Calculator
Accuracy Calculator
Typing Practice
Advanced Typing Test
Random Paragraph Typing Test
Timed Typing Test
English Typing Practice
Bangla Typing Practice
Number Typing Practice
Symbol Typing Practice
Custom Text Typing Practice
Paragraph Practice
Story Typing Practice
Data Entry Practice
Invoice Typing Practice
Excel Data Typing Practice
Customer Information Typing Practice
Form Filling Practice
Typing Heatmap
Daily Challenge
Weekly Challenge
Typing Race
Achievement Badges
English Typing
Bangla Typing
Arabic Typing
Hindi Typing
Multiplayer Typing Race
Global Leaderboard
AI Typing Coach
Voice to Typing Trainer
Typing Certification Exam
Typing Certificate Generator
`;

const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

lines.forEach(line => {
  if (!existingNames.includes(line.toLowerCase())) {
    const id = line.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    db.push({
      id: id,
      name: line,
      description: `Enhance your skills with ${line}.`,
      category: 'typing',
      tags: ["typing", "keyboard", "practice"],
      active: false
    });
    existingNames.push(line.toLowerCase());
  }
});

fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
console.log('Added typing tools.');
