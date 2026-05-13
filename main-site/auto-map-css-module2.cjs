const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src/components/ProductDetail/ProductDetail.module.css');
const rvCssPath = path.join(__dirname, 'src/components/RecentlyViewed/RecentlyViewed.module.css');
const jsxPath = path.join(__dirname, 'src/components/ProductDetail/ProductDetail.jsx');

const cssContent = fs.readFileSync(cssPath, 'utf8');
const rvCssContent = fs.readFileSync(rvCssPath, 'utf8');
let jsxContent = fs.readFileSync(jsxPath, 'utf8');

// 1. Fix imports manually so it replaces properly EXACTLY what is there
jsxContent = jsxContent.replace(
    "import './ProductDetail.css';",
    "import styles from './ProductDetail.module.css';\nimport rvStyles from '../RecentlyViewed/RecentlyViewed.module.css';"
);

// 2. Extract classes
const classRegex = /\.([a-zA-Z0-9_-]+)\s*\{/g;
const classes = new Set();
let match;
while ((match = classRegex.exec(cssContent)) !== null) {
    classes.add(match[1]);
}

const rvClasses = new Set();
while ((match = classRegex.exec(rvCssContent)) !== null) {
    rvClasses.add(match[1]);
}

const toKebabCase = (str) => str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const toCamelCase = (str) => str.replace(/-([a-z0-9])/g, (g) => g[1].toUpperCase());

const styleMap = {};
classes.forEach(cls => {
    const camel = toCamelCase(cls);
    styleMap[camel] = `styles.${camel}`;
    styleMap[toKebabCase(cls)] = `styles.${camel}`;
});

const rvStyleMap = {};
rvClasses.forEach(cls => {
    const camel = toCamelCase(cls);
    // Explicit override for standard ProductDetail vs rvMap clashes if any, but they are namespaced
    rvStyleMap[camel] = `rvStyles.${camel}`;
    rvStyleMap[toKebabCase(cls)] = `rvStyles.${camel}`;
});

Object.assign(styleMap, rvStyleMap); // rvStyles take precedence if there are duplicates like .rvCard

// 3. Replace strings in JSX
const replaceClasses = (classString) => {
    const parts = classString.split(/\s+/);
    let changed = false;
    const newParts = parts.map(p => {
        if (p.includes('${')) return p; // skip existing logic strings
        if (styleMap[p]) {
            changed = true;
            return `\${${styleMap[p]}}`;
        }
        return p;
    });
    return { changed, newStr: newParts.join(' ') };
};

// Handle className="string" and className='string'
jsxContent = jsxContent.replace(/className=(["'])(.*?)\1/g, (match, quote, str) => {
    const { changed, newStr } = replaceClasses(str);
    if (changed) {
        return `className={\`${newStr}\`}`;
    }
    return match;
});

// Handle className={`string`} specifically inside template literals that don't have JS vars yet
jsxContent = jsxContent.replace(/className=\{`([^$]*?)`\}/g, (match, str) => {
    const { changed, newStr } = replaceClasses(str);
    if (changed) {
        return `className={\`${newStr}\`}`;
    }
    return match;
});

// Handle complex className={`some-string ${var}`}
jsxContent = jsxContent.replace(/className=\{`(.*?)`\}/g, (match, str) => {
    let newStr = str;
    let changed = false;
    Object.keys(styleMap).forEach(key => {
        const regex = new RegExp(`(?<!\\.|\\/|styles\\.|rvStyles\\.)\\b${key}\\b`, 'g');
        if (regex.test(newStr)) {
            newStr = newStr.replace(regex, `\${${styleMap[key]}}`);
            changed = true;
        }
    });

    if (changed) return `className={\`${newStr}\`}`;
    return match;
});

fs.writeFileSync(jsxPath, jsxContent);
console.log("Dynamically mapped ProductDetail module classes to string artifacts and fixed imports!");
