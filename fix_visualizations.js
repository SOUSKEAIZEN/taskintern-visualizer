const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'components/visualization');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Fix control panel colors
  content = content.replace(/\bbg-slate-900\b/g, 'bg-bg-card');
  content = content.replace(/\bbg-slate-800\b/g, 'bg-bg-main');
  content = content.replace(/\bborder-slate-700\b/g, 'border-border-default');
  content = content.replace(/\btext-slate-300\b/g, 'text-text-secondary');
  content = content.replace(/\btext-slate-400\b/g, 'text-text-placeholder');

  // Fix container heights and padding to avoid clipping
  // E.g. h-[360px] -> h-[420px] shrink-0
  content = content.replace(/h-\[360px\]/g, 'h-[420px] shrink-0');
  content = content.replace(/h-\[350px\]/g, 'h-[420px] shrink-0');

  // Fix 'y: 40' -> 'y: 70' in HeapCanvas and TreeCanvas
  content = content.replace(/y:\s*40/g, 'y: 70');
  content = content.replace(/\+ 40;/g, '+ 70;');
  content = content.replace(/y:\s*50/g, 'y: 80');
  content = content.replace(/\+ 50;/g, '+ 80;');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
console.log('Fixes complete.');
