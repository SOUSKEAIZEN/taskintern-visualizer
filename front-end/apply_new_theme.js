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
            
            // Remove colored shadows and glows entirely from anywhere
            content = content.replace(/shadow-primary\/\d+/g, 'shadow-sm');
            content = content.replace(/shadow-primary/g, 'shadow-sm');
            
            // Replace gradients
            content = content.replace(/gradient-primary/g, 'bg-primary');
            content = content.replace(/gradient-secondary/g, 'bg-primary');
            
            // Remove text-primary from heading elements
            content = content.replace(/<h([1-6])([^>]*)text-primary([^>]*)>/g, '<h$1$2$3>');
            content = content.replace(/<h([1-6])([^>]*)text-accent-([a-z]+)([^>]*)>/g, '<h$1$2$4>');

            if (content !== originalContent) {
                console.log(`Updated ${fullPath}`);
                fs.writeFileSync(fullPath, content);
            }
        }
    }
}

console.log("Running mass theme migration...");
processDir(path.join(__dirname, 'components'));
processDir(path.join(__dirname, 'src'));
console.log("Migration complete.");
