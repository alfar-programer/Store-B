const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'main-site');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('dist')) {
                results = results.concat(walk(file));
            }
        } else {
            if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.html') || file.endsWith('.json') || file.endsWith('.md')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(targetDir);
let changedCount = 0;

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Replace 'warmtotuch' with 'Warm Touch' ONLY if it's NOT part of a URL, domain, or twitter handle
    // Negative lookbehind: not preceded by dot, @, /, or -
    // Negative lookahead: not followed by dot, -, or store
    const regex = /(?<![\.@\/\-])warmtotuch(?!\.store|\.com|\.png|\.jpg|\-)/gi;
    
    const newContent = content.replace(regex, 'Warm Touch');
    
    if (newContent !== content) {
        fs.writeFileSync(file, newContent, 'utf8');
        changedCount++;
        console.log(`Updated: ${file}`);
    }
});

console.log(`Total files updated: ${changedCount}`);
