const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src/components/ProductDetail/ProductDetail.module.css');
const jsxPath = path.join(__dirname, 'src/components/ProductDetail/ProductDetail.jsx');

const cssContent = fs.readFileSync(cssPath, 'utf8');
let jsxContent = fs.readFileSync(jsxPath, 'utf8');

// 1. Extract all classes from CSS module
const classRegex = /\.([a-zA-Z0-9_-]+)\s*\{/g;
const classes = new Set();
let match;
while ((match = classRegex.exec(cssContent)) !== null) {
    classes.add(match[1]); // e.g. 'recommendationsSection', 'recCardOverride'
}

// Convert camelCase to kebab-case
const toKebabCase = (str) => str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
// Convert kebab-case to camelCase
const toCamelCase = (str) => str.replace(/-([a-z0-9])/g, (g) => g[1].toUpperCase());

const styleMap = {};
classes.forEach(cls => {
    // Both camelCase and kebab-case variants should map to styles.camelCase
    const camel = toCamelCase(cls);
    styleMap[camel] = `styles.${camel}`;
    styleMap[toKebabCase(cls)] = `styles.${camel}`;
});

// We'll also support passing over the existing ones we already mapped
// 2. Replace strings in JSX
const replaceClasses = (classString) => {
    const parts = classString.split(/\s+/);
    let changed = false;
    const newParts = parts.map(p => {
        // Skip template injections
        if (p.includes('${')) return p;
        
        if (styleMap[p]) {
            changed = true;
            return `\${${styleMap[p]}}`;
        }
        return p;
    });
    return { changed, newStr: newParts.join(' ') };
};

// Handle className="string"
jsxContent = jsxContent.replace(/className=(["'])(.*?)\1/g, (match, quote, str) => {
    const { changed, newStr } = replaceClasses(str);
    if (changed) {
        return `className={\`${newStr}\`}`;
    }
    return match;
});

// Handle className={`string`}
jsxContent = jsxContent.replace(/className=\{`(.*?)`\}/g, (match, str) => {
    // To be safe with existing templates, we only replace word boundaries outside of ${}
    let newStr = str;
    let changed = false;
    Object.keys(styleMap).forEach(key => {
        // Find exact word match not preceded by ${styles. or .
        const regex = new RegExp(`(?<!\\.|\\/|styles\\.)\\b${key}\\b`, 'g');
        if (regex.test(newStr)) {
            newStr = newStr.replace(regex, `\${${styleMap[key]}}`);
            changed = true;
        }
    });

    if (changed) return `className={\`${newStr}\`}`;
    return match;
});

fs.writeFileSync(jsxPath, jsxContent);
console.log("Dynamically mapped ProductDetail module classes to string artifacts.");
