const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;
            
            // Buttons
            content = content.replace(/px-6 py-2 bg-slate-200 text-text-heading font-semibold rounded-btn hover:bg-slate-300 transition-colors whitespace-nowrap/g, 'btn-secondary');
            content = content.replace(/px-6 py-2 bg-blue-100 text-blue-700 font-semibold rounded-btn hover:bg-blue-200 transition-colors whitespace-nowrap/g, 'btn-secondary');
            content = content.replace(/px-4 py-2 bg-bg-main text-text-heading font-semibold rounded-btn hover:bg-slate-200 transition-colors whitespace-nowrap/g, 'btn-secondary');
            
            // Dividers / Tracks
            content = content.replace(/bg-slate-700/g, 'bg-border-default');
            content = content.replace(/bg-slate-200 h-2/g, 'bg-bg-card h-2 border border-border-default');
            content = content.replace(/bg-slate-200/g, 'bg-border-default');
            content = content.replace(/bg-slate-400/g, 'bg-text-muted');
            
            // Tags
            content = content.replace(/bg-blue-50/g, 'bg-primary-soft');
            content = content.replace(/text-blue-600/g, 'text-primary');
            content = content.replace(/border-blue-100/g, 'border-primary-hover');

            if (content !== originalContent) {
                console.log(`Updated ${fullPath}`);
                fs.writeFileSync(fullPath, content);
            }
        }
    }
}

processDir(path.join(__dirname, 'components/visualization'));
