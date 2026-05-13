const fs = require('fs');
const path = require('path');

const toCamelCase = (str) => str.replace(/-([a-z0-9])/g, (g) => g[1].toUpperCase());

function extractCssClasses(cssContent) {
    const classRegex = /\.([a-zA-Z0-9_-]+)/g;
    const classes = new Set();
    let match;
    while ((match = classRegex.exec(cssContent)) !== null) {
        if (!/^[0-9]/.test(match[1])) {
            classes.add(match[1]);
        }
    }
    return Array.from(classes);
}

function processSpecificFile(jsxPath, cssPath, newCssPath) {
    let jsxContent = fs.readFileSync(jsxPath, 'utf8');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    const localClasses = extractCssClasses(cssContent);

    // Update Import
    jsxContent = jsxContent.replace(/import\s+['"].*\.css['"]\s*;/g, `import styles from './${path.basename(newCssPath)}';`);

    const classNameRegex = /className=["']([^"']+)["']/g;
    jsxContent = jsxContent.replace(classNameRegex, (fullMatch, strClasses) => {
        if (!strClasses) return fullMatch;
        const parts = strClasses.split(/\s+/).filter(Boolean);
        let hasModuleClass = false;
        const transformedParts = parts.map(cls => {
            // Un-camelcase if reading from already migrated Auth.module.css
            const isLocal = localClasses.includes(cls) || localClasses.includes(toCamelCase(cls));
            if (isLocal) {
                hasModuleClass = true;
                return `\${styles.${toCamelCase(cls)}}`;
            }
            return cls;
        });
        return hasModuleClass ? `className={\`${transformedParts.join(' ')}\`}` : fullMatch;
    });

    fs.writeFileSync(jsxPath, jsxContent);

    // If we need to write new CSS (Orders.css)
    if (cssPath !== newCssPath) {
        let newCssContent = cssContent;
        localClasses.sort((a,b) => b.length - a.length).forEach(cls => {
            const regex = new RegExp(`\\.${cls}(?=[\\s{,:>.[])`, 'g');
            newCssContent = newCssContent.replace(regex, `.${toCamelCase(cls)}`);
        });
        fs.writeFileSync(newCssPath, newCssContent);
        if (fs.existsSync(cssPath)) fs.unlinkSync(cssPath);
    }
    console.log(`Processed ${path.basename(jsxPath)}`);
}

const pagesDir = path.join(__dirname, 'src', 'pages');

// Process Register and VerifyEmail sharing Auth.module.css
const authModulePath = path.join(pagesDir, 'Auth.module.css');
if (fs.existsSync(authModulePath)) {
    processSpecificFile(path.join(pagesDir, 'Register.jsx'), authModulePath, authModulePath);
    processSpecificFile(path.join(pagesDir, 'VerifyEmail.jsx'), authModulePath, authModulePath);
}

// Process MyOrders and Orders.css
const ordersCssPath = path.join(pagesDir, 'Orders.css');
const ordersModulePath = path.join(pagesDir, 'Orders.module.css');
if (fs.existsSync(ordersCssPath)) {
    processSpecificFile(path.join(pagesDir, 'MyOrders.jsx'), ordersCssPath, ordersModulePath);
}
