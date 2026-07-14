const fs = require('fs');
const path = require('path');

const replacements = {
  // Indigo -> Primary
  'bg-indigo-600': 'bg-primary',
  'bg-indigo-500': 'bg-primary',
  'hover:bg-indigo-700': 'hover:bg-primary-hover',
  'hover:bg-indigo-600': 'hover:bg-primary-hover',
  'text-indigo-900': 'text-primary',
  'text-indigo-800': 'text-primary',
  'text-indigo-700': 'text-primary',
  'text-indigo-600': 'text-primary',
  'text-indigo-500': 'text-primary',
  'text-indigo-400': 'text-primary',
  'bg-indigo-100': 'bg-primary/10',
  'bg-indigo-50': 'bg-primary/10',
  'border-indigo-600': 'border-primary',
  'border-indigo-500': 'border-primary',
  'border-indigo-400': 'border-primary',
  'border-indigo-300': 'border-primary/50',
  'border-indigo-200': 'border-primary/20',
  'border-indigo-100': 'border-primary/10',
  'shadow-indigo-300': 'shadow-primary/30',
  'shadow-indigo-200': 'shadow-primary/20',
  'accent-indigo-600': 'accent-primary',

  // Emerald -> Success
  'bg-emerald-600': 'bg-accent-success',
  'bg-emerald-500': 'bg-accent-success',
  'text-emerald-700': 'text-accent-success',
  'text-emerald-600': 'text-accent-success',
  'bg-emerald-100': 'bg-accent-success/10',
  'bg-emerald-50': 'bg-accent-success/10',

  // Slate -> Theme tokens
  'bg-slate-50': 'bg-bg-main',
  'bg-slate-100': 'bg-bg-main',
  'bg-white': 'bg-bg-card',
  'text-slate-900': 'text-text-heading',
  'text-slate-800': 'text-text-heading',
  'text-slate-700': 'text-text-heading',
  'text-slate-600': 'text-text-secondary',
  'text-slate-500': 'text-text-secondary',
  'text-slate-400': 'text-text-placeholder',
  'border-slate-300': 'border-border-default',
  'border-slate-200': 'border-border-default',
  'border-slate-100': 'border-border-default',
  
  // Shadows & Radius
  'shadow-md': 'shadow-premium',
  'shadow-lg': 'shadow-premium',
  'shadow-xl': 'shadow-premium',
  'rounded-3xl': 'rounded-card',
  'rounded-2xl': 'rounded-card',
  'rounded-xl': 'rounded-btn',
  'rounded-lg': 'rounded-btn',
};

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(filePath));
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      results.push(filePath);
    }
  });
  return results;
}

const dirsToProcess = [
  path.join(__dirname, 'components/visualization'),
  path.join(__dirname, 'components/workspace'),
  path.join(__dirname, 'src/app/(workspace)')
];

let files = [];
dirsToProcess.forEach(dir => {
  if (fs.existsSync(dir)) {
    files = files.concat(walkDir(dir));
  }
});

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  for (const [key, value] of Object.entries(replacements)) {
    // Replace using word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${key}\\b`, 'g');
    content = content.replace(regex, value);
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
console.log('Migration complete.');
