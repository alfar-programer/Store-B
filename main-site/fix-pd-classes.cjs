const fs = require('fs');
const path = require('path');

const toCamelCase = (str) => str.replace(/-([a-z0-9])/g, (g) => g[1].toUpperCase());

const mapRvClass = (cls) => {
    if (cls.startsWith('rv-')) return `styles.${toCamelCase(cls)}`;
    return null;
}

const mapPdClass = (cls) => {
    if (cls.startsWith('rv-')) return `rvStyles.${toCamelCase(cls)}`;
    if (cls === 'revCard') return `styles.revCard`;
    if (cls === 'about-col') return `styles.aboutCol`;
    if (cls === 'rec-img') return `styles.recImg`;
    if (cls === 'rec-info') return `styles.recInfo`;
    if (cls === 'reviewsCol') return `styles.reviewsCol`;
    if (cls === 'colHeader') return `styles.colHeader`;
    if (cls === 'seeAll') return `styles.seeAll`;
    if (cls === 'ratingOverviewCard') return `styles.ratingOverviewCard`;
    if (cls === 'bigScore') return `styles.bigScore`;
    if (cls === 'ratingBars') return `styles.ratingBars`;
    if (cls === 'barRow') return `styles.barRow`;
    if (cls === 'bLabel') return `styles.bLabel`;
    if (cls === 'bTrack') return `styles.bTrack`;
    if (cls === 'bFill') return `styles.bFill`;
    if (cls === 'revHeader') return `styles.revHeader`;
    if (cls === 'revUser') return `styles.revUser`;
    if (cls === 'verified') return `styles.verified`;
    if (cls === 'revTime') return `styles.revTime`;
    if (cls === 'revStars') return `styles.revStars`;
    if (cls === 'revFeedback') return `styles.revFeedback`;
    return null;
}

const applyRegex = (content, mapFunc) => {
    // 1. Strings: className="foo bar"
    content = content.replace(/className=(["'])(.*?)\1/g, (match, quote, str) => {
        const parts = str.split(/\s+/);
        let changed = false;
        const newParts = parts.map(p => {
            const mapped = mapFunc(p);
            if (mapped) {
                changed = true;
                return `\${${mapped}}`;
            }
            return p;
        });
        if (changed) {
            return `className={\`${newParts.join(' ')}\`}`;
        }
        return match;
    });

    // 2. Templates without inline JS wrappers
    content = content.replace(/className=\{`([^$]*?)`\}/g, (match, str) => {
        const parts = str.split(/\s+/);
        let changed = false;
        const newParts = parts.map(p => {
            const mapped = mapFunc(p);
            if (mapped) {
                changed = true;
                return `\${${mapped}}`;
            }
            return p;
        });
        if (changed) {
            return `className={\`${newParts.join(' ')}\`}`;
        }
        return match;
    });

    // 3. Complex templates
    content = content.replace(/className=\{`(.*?)`\}/g, (match, str) => {
        let newStr = str;
        const keywords = [
            'rv-card', 'rv-discount-badge', 'rv-image-wrapper', 'rv-overlay', 
            'rv-quick-view-btn', 'rv-info', 'rv-title', 'rv-description', 
            'rv-rating-row', 'rv-stars', 'rv-rating-value', 'rv-price-wrapper', 
            'rv-price', 'rv-original-price', 'rv-add-to-cart-btn', 'rv-favorite-btn', 
            'rv-modal-overlay', 'rv-modal-close', 'rv-modal-image-wrapper',
            'rv-modal-favorite-btn', 'rv-modal-details', 'rv-modal-description',
            'rv-modal-price-section', 'rv-modal-price', 'rv-modal-original-price',
            'rv-modal-discount-badge', 'rv-modal-add-to-cart',
            'revCard', 'about-col',
            'modal-overlay', 'modal-content', 'modal-close', 'modal-image-wrapper', 
            'modal-details', 'modal-description', 'modal-rating', 'modal-price-section',
            'modal-price', 'modal-original-price', 'modal-discount-badge', 'modal-add-to-cart',
            'quick-view-btn'
        ];
        
        let changed = false;
        for (let kw of keywords) {
            const regex = new RegExp(`(?<!\\.|\\/|styles\.)\\b${kw}\\b`, 'g');
            if (regex.test(newStr)) {
                const mapped = mapFunc(kw);
                if (mapped) {
                    newStr = newStr.replace(regex, `\${${mapped}}`);
                    changed = true;
                }
            }
        }
        if (changed) return `className={\`${newStr}\`}`;
        return match;
    });

    return content;
};

// 1. Process ProductDetail.jsx
const pdPath = path.join(__dirname, 'src/components/ProductDetail/ProductDetail.jsx');
let pdContent = fs.readFileSync(pdPath, 'utf8');

// Fix old .css import explicitly
if (pdContent.includes('import "./ProductDetail.css";')) {
    pdContent = pdContent.replace('import "./ProductDetail.css";', "import styles from './ProductDetail.module.css';\nimport rvStyles from '../RecentlyViewed/RecentlyViewed.module.css';");
}
if (pdContent.includes("import styles from './ProductDetail.module.css';") && !pdContent.includes("import rvStyles from")) {
    pdContent = pdContent.replace("import styles from './ProductDetail.module.css';", 
        "import styles from './ProductDetail.module.css';\nimport rvStyles from '../RecentlyViewed/RecentlyViewed.module.css';");
}
pdContent = applyRegex(pdContent, mapPdClass);
fs.writeFileSync(pdPath, pdContent);

// 2. Process RecentlyViewed.jsx
const rvPath = path.join(__dirname, 'src/components/RecentlyViewed/RecentlyViewed.jsx');
let rvContent = fs.readFileSync(rvPath, 'utf8');
if (rvContent.includes('import "./recentlyViewed.css"')) {
    rvContent = rvContent.replace('import "./recentlyViewed.css"', "import styles from './RecentlyViewed.module.css'");
}
rvContent = applyRegex(rvContent, mapRvClass);
fs.writeFileSync(rvPath, rvContent);

// 3. Process Products.jsx
const mapProdClass = (cls) => {
    // If prod uses module css, we map. But let's check if it hasn't mapped the modal yet
    const targetMap = {
        'modal-overlay': 'styles.modalOverlay',
        'modal-content': 'styles.modalContent',
        'modal-close': 'styles.modalClose',
        'modal-image-wrapper': 'styles.modalImageWrapper',
        'modal-details': 'styles.modalDetails',
        'modal-description': 'styles.modalDescription',
        'modal-rating': 'styles.modalRating',
        'modal-price-section': 'styles.modalPriceSection',
        'modal-price': 'styles.modalPrice',
        'modal-original-price': 'styles.modalOriginalPrice',
        'modal-discount-badge': 'styles.modalDiscountBadge',
        'modal-add-to-cart': 'styles.modalAddToCart',
        'quick-view-btn': 'styles.quickViewBtn'
    }
    if (targetMap[cls]) return targetMap[cls];
    // Map products- grid etc just to be safe if they use basic string
    if (cls.startsWith('product-') || cls.startsWith('products-') || cls === 'discount-badge' || cls === 'stars' || cls === 'rating-value' || cls === 'price-wrapper' || cls === 'price' || cls === 'original-price' || cls === 'add-to-cart-btn') {
        const camel = toCamelCase(cls);
        return `styles.${camel}`;
    }
    return null;
}

const prodPath = path.join(__dirname, 'src/components/Home page/ui/Products/Products.jsx');
let prodContent = fs.readFileSync(prodPath, 'utf8');

// Also safely convert Products.jsx to use CSS Modules since earlier it failed or wasn't done for quick view
if (prodContent.includes("import './products.css'")) {
    prodContent = prodContent.replace("import './products.css'", "import styles from './products.module.css'");
    
    // Auto-rename products.css to products.module.css if it exists
    const prodCss = path.join(__dirname, 'src/components/Home page/ui/Products/products.css');
    const prodModCss = path.join(__dirname, 'src/components/Home page/ui/Products/products.module.css');
    if (fs.existsSync(prodCss)) {
        // Need to camelCase the CSS file
        let cssStr = fs.readFileSync(prodCss, 'utf8');
        cssStr = cssStr.replace(/\.([a-z0-9-]+)/g, (fullMatch, cg) => {
            return '.' + toCamelCase(cg);
        });
        fs.writeFileSync(prodModCss, cssStr);
        fs.unlinkSync(prodCss);
    }
}
prodContent = applyRegex(prodContent, mapProdClass);
fs.writeFileSync(prodPath, prodContent);

console.log("Safely mapped ProductDetail, RecentlyViewed, and Products mods");
