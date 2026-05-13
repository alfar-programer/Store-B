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

function processComponentDirectory(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    files.forEach(dirent => {
        const fullPath = path.join(dir, dirent.name);
        
        if (dirent.isDirectory()) {
            processComponentDirectory(fullPath);
        } else if (dirent.name.endsWith('.jsx')) {
            let jsxContent = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            const importRegex = /import\s+['"](?:\.\/|\.\.\/)([\w/.-]+)\.css['"]\s*;/g;
            let match;
            const cssFilesToProcess = [];

            while ((match = importRegex.exec(jsxContent)) !== null) {
                const importPath = match[1] + '.css';
                if (!importPath.includes('index.css') && !importPath.includes('tailwind.css')) {
                    cssFilesToProcess.push({
                        importStr: match[0],
                        basename: path.basename(match[1]),
                        dirpath: path.dirname(path.join(dir, match[1]))
                    });
                }
            }

            if (cssFilesToProcess.length > 0) {
                const cssInfo = cssFilesToProcess[0];
                const cssFilePath = path.join(cssInfo.dirpath || dir, cssInfo.basename + '.css');
                
                if (fs.existsSync(cssFilePath)) {
                    const cssContent = fs.readFileSync(cssFilePath, 'utf8');
                    const localClasses = extractCssClasses(cssContent);
                    
                    if (localClasses.length > 0) {
                        jsxContent = jsxContent.replace(
                            cssInfo.importStr,
                            `import styles from './${cssInfo.basename}.module.css';`
                        );
                        
                        // Safely replace string classNames, ignoring template literals for now to prevent breaking React logic
                        const classNameRegex = /className=["']([^"']+)["']/g;
                        jsxContent = jsxContent.replace(classNameRegex, (fullMatch, strClasses) => {
                            if (!strClasses) return fullMatch;
                            
                            const parts = strClasses.split(/\s+/).filter(Boolean);
                            let hasModuleClass = false;
                            
                            const transformedParts = parts.map(cls => {
                                if (localClasses.includes(cls)) {
                                    hasModuleClass = true;
                                    return `\${styles.${toCamelCase(cls)}}`;
                                }
                                return cls;
                            });

                            if (hasModuleClass) {
                                return `className={\`${transformedParts.join(' ')}\`}`;
                            }
                            return fullMatch;
                        });

                        const newCssPath = path.join(cssInfo.dirpath || dir, cssInfo.basename + '.module.css');
                        let newCssContent = cssContent;
                        
                        localClasses.sort((a,b) => b.length - a.length).forEach(cls => {
                            const regex = new RegExp(`\\.${cls}(?=[\\s{,:>.[])`, 'g');
                            newCssContent = newCssContent.replace(regex, `.${toCamelCase(cls)}`);
                        });
                        
                        fs.writeFileSync(newCssPath, newCssContent);
                        fs.unlinkSync(cssFilePath);
                        
                        modified = true;
                        console.log(`Migrated: ${dirent.name} & ${cssInfo.basename}.css`);
                    }
                }
            }
            if (modified) {
                fs.writeFileSync(fullPath, jsxContent);
            }
        }
    });
}

const pagesDir = path.join(__dirname, 'src', 'pages');
const compDir = path.join(__dirname, 'src', 'components');

console.log('Processing pages...');
processComponentDirectory(pagesDir);
console.log('Processing components...');
processComponentDirectory(compDir);
