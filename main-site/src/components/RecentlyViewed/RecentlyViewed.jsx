import React from 'react';
import { createPortal } from 'react-dom';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL, PLACEHOLDER_IMAGE } from '../../config';
import styles from './RecentlyViewed.module.css';

gsap.registerPlugin(ScrollTrigger);

const parseImage = (imageField) => {
    if (!imageField) return PLACEHOLDER_IMAGE;
    
    let imageUrl = null;
    
    // 1. Try to extract raw URL from various formats
    try {
        if (typeof imageField === 'string') {
            if (imageField.startsWith('[') || imageField.startsWith('{')) {
                const parsed = JSON.parse(imageField);
                imageUrl = Array.isArray(parsed) ? parsed[0] : parsed;
            } else {
                imageUrl = imageField;
            }
        } else if (Array.isArray(imageField)) {
            imageUrl = imageField[0];
        } else {
            imageUrl = imageField;
        }

        // 2. If the result is still a JSON-like string (nested parsing), try again once
        if (typeof imageUrl === 'string' && (imageUrl.startsWith('[') || imageUrl.startsWith('{'))) {
            const nestedParsed = JSON.parse(imageUrl);
            imageUrl = Array.isArray(nestedParsed) ? nestedParsed[0] : nestedParsed;
        }
    } catch (e) {
        imageUrl = imageField; // Fallback to raw
    }

    if (!imageUrl || typeof imageUrl !== 'string') return PLACEHOLDER_IMAGE;

    // 3. Clean and format the URL
    if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) return imageUrl;
    
    const rootUrl = API_BASE_URL.replace('/api', '');
    const cleanRoot = rootUrl.endsWith('/') ? rootUrl.slice(0, -1) : rootUrl;
    // Replace backslashes (Windows paths) with forward slashes for URLs
    const sanitizedPath = imageUrl.replace(/\\/g, '/');
    const cleanPath = sanitizedPath.startsWith('/') ? sanitizedPath.slice(1) : sanitizedPath;
    
    return `${cleanRoot}/${cleanPath}`;
};

const RecentlyViewed = ({ products, currentProductId }) => {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { addToCart } = useCart();
    const { toggleFavorite, isFavorite } = useFavorites();
    const { getProductField } = useLanguage();
    const { t } = useTranslation();
    const containerRef = useRef(null);
    const scrollRef = useRef(null);
    const cardsRef = useRef([]);

    // Filter out the current product
    const displayProducts = products.filter(p => p.id?.toString() !== currentProductId?.toString());

    useEffect(() => {
        if (displayProducts.length > 0 && containerRef.current) {
            gsap.fromTo(containerRef.current,
                { y: 50, opacity: 0 },
                { 
                    y: 0, 
                    opacity: 1, 
                    duration: 0.6, 
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 90%",
                    }
                }
            );

            gsap.fromTo(cardsRef.current,
                { y: 20, opacity: 0 },
                { 
                    y: 0, 
                    opacity: 1, 
                    duration: 0.5, 
                    stagger: 0.05, 
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 90%",
                    }
                }
            );
        }
    }, [displayProducts.length]);

    const handleQuickView = (e, product) => {
        if(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedProduct(null), 300);
    };
    
    const scrollRvSlider = (direction) => {
        if (!scrollRef.current) return;
        const scrollAmount = 350;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    const handleAddToCart = (e, product) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (typeof product.stock === 'number' && product.stock <= 0) return;
        addToCart(product);
        const button = e.currentTarget;
        const originalText = button.innerHTML;
        button.innerHTML = `✓ ${t('homePage.prodAdded') || 'Added!'}`;
        button.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
        }, 2000);
    };

    if (!displayProducts || displayProducts.length === 0) return null;

    return (
        <section className={`${styles.recentlyViewedSection}`} ref={containerRef}>
            <div className={`${styles.rvContainer}`}>
                <div className={`${styles.rvHeader}`}>
                    <h2>{t('recentlyViewed.title') || 'Recently Viewed'}</h2>
                    <p>{t('recentlyViewed.subtitle') || 'Continue where you left off'}</p>
                    <div className={`${styles.rvSliderControls}`}>
                        <button className={`${styles.rvArrow}`} onClick={() => scrollRvSlider('left')}>
                            <ChevronLeft size={24} />
                        </button>
                        <button className={`${styles.rvArrow}`} onClick={() => scrollRvSlider('right')}>
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>
                
                <div className={`${styles.rvScrollContainer}`} ref={scrollRef}>
                    <div className={`${styles.rvTrack}`}>
                        {displayProducts.map((product, index) => (
                            <Link 
                                to={`/product/${product.id}`} 
                                className={`${styles.rvCard}`} 
                                key={product.id}
                                ref={el => cardsRef.current[index] = el}
                            >
                                {product.discount > 0 && (
                                    <div className={`${styles.rvDiscountBadge}`}>-{product.discount}%</div>
                                )}
                                <div className={`${styles.rvImageWrapper}`}>
                                    <img src={parseImage(product.image || product.images)} alt={getProductField(product, 'title')} loading="lazy" />
                                    <button 
                                        className={`${styles.rvFavoriteBtn}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleFavorite(product);
                                        }}
                                    >
                                        <Heart 
                                            size={20} 
                                            fill={isFavorite(product.id) ? '#ef4444' : 'none'} 
                                            color={isFavorite(product.id) ? '#ef4444' : '#6b7280'}
                                        />
                                    </button>
                                    <div className={`${styles.rvOverlay}`}>
                                        <button
                                            className={`${styles.rvQuickViewBtn}`}
                                            onClick={(e) => handleQuickView(e, product)}
                                        >
                                            Quick View
                                        </button>
                                    </div>
                                </div>
                                <div className={`${styles.rvInfo}`}>
                                    <h3 className={`${styles.rvTitle}`}>{getProductField(product, 'title')}</h3>
                                    <p className={`${styles.rvDescription}`}>{getProductField(product, 'description') || ""}</p>
                                    <div className={`${styles.rvRatingRow}`}>
                                        <span className={`${styles.rvStars}`}>
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < Math.round(product.rating?.average || product.rating || 5) ? "#fbbf24" : "none"} color={i < Math.round(product.rating?.average || product.rating || 5) ? "#fbbf24" : "#d1d5db"} />
                                            ))}
                                        </span>
                                        <span className={`${styles.rvRatingValue}`}>
                                            {(() => {
                                                const r = product.rating;
                                                if (!r) return '5.0';
                                                if (typeof r === 'object') return (r.average || 5).toFixed(1);
                                                return Number(r).toFixed(1);
                                            })()}
                                        </span>
                                    </div>
                                    {/* Stock indicator */}
                                    {typeof product.stock === 'number' && product.stock > 0 && product.stock < 10 && (
                                        <div className={`${styles.rvStockWarning}`} style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: '600', width: '100%', marginBottom: '8px' }}>
                                            {t('homePage.prodLeftOnly', { count: product.stock }) || `Only ${product.stock} left!`}
                                        </div>
                                    )}
                                </div>
                                <div className={`${styles.rvFooter}`}>
                                    <div className={`${styles.rvPriceWrapper}`}>
                                        {product.discount > 0 ? (
                                            <>
                                                <span className={`${styles.rvPrice}`}>{(parseFloat(product.price) * (1 - product.discount / 100)).toFixed(2)} <small>EGP</small></span>
                                                <span className={`${styles.rvOriginalPrice}`}>{parseFloat(product.price).toFixed(2)} <small>EGP</small></span>
                                            </>
                                        ) : (
                                            <span className={`${styles.rvPrice}`}>{parseFloat(product.price || 0).toFixed(2)} <small>EGP</small></span>
                                        )}
                                    </div>
                                    <button
                                        className={`${styles.rvAddToCartBtn}`}
                                        disabled={typeof product.stock === 'number' && product.stock <= 0}
                                        style={typeof product.stock === 'number' && product.stock <= 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                        onClick={(e) => handleAddToCart(e, product)}
                                    >
                                        <ShoppingBag size={18} />
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick View Modal */}
            {isModalOpen && selectedProduct && createPortal(
                <div className={`${styles.rvModalOverlay} active`} onClick={closeModal}>
                    <div className={`${styles.rvModalContent}`} onClick={(e) => e.stopPropagation()}>
                        <button className={`${styles.rvModalClose}`} onClick={closeModal}>×</button>
                        <div className={`${styles.rvModalImageWrapper}`}>
                            <button 
                                className={`${styles.rvModalFavoriteBtn}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleFavorite(selectedProduct);
                                }}
                            >
                                <Heart 
                                    size={24} 
                                    fill={isFavorite(selectedProduct.id) ? '#ef4444' : 'none'} 
                                    color={isFavorite(selectedProduct.id) ? '#ef4444' : '#6b7280'}
                                />
                            </button>
                            <img src={parseImage(selectedProduct.image || selectedProduct.images)} alt={getProductField(selectedProduct, 'title')} />
                        </div>
                        <div className={`${styles.rvModalDetails}`}>
                            <h2>{getProductField(selectedProduct, 'title')}</h2>
                            <p className={`${styles.rvModalDescription}`}>{getProductField(selectedProduct, 'description')}</p>
                            <div className={`${styles.rvModalRating}`}>
                                <span className={`${styles.rvStars}`}>
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} fill={i < Math.round(selectedProduct.rating?.average || selectedProduct.rating || 5) ? "#fbbf24" : "none"} color={i < Math.round(selectedProduct.rating?.average || selectedProduct.rating || 5) ? "#fbbf24" : "#d1d5db"} />
                                    ))}
                                </span>
                                <span className={`${styles.rvRatingValue}`}>
                                    {(() => {
                                        const r = selectedProduct.rating;
                                        if (!r) return '5.0';
                                        if (typeof r === 'object') return (r.average || 5).toFixed(1);
                                        return Number(r).toFixed(1);
                                    })()}
                                </span>
                            </div>
                            {/* Modal Stock Indicator */}
                            {typeof selectedProduct.stock === 'number' && selectedProduct.stock > 0 && selectedProduct.stock < 10 && (
                                <div className={`${styles.rvModalStockWarning}`} style={{ color: '#d97706', fontWeight: '600', marginBottom: '12px', fontSize: '0.9rem' }}>
                                    {t('homePage.prodLeftOnly', { count: selectedProduct.stock }) || `Only ${selectedProduct.stock} left!`}
                                </div>
                            )}
                            <div className={`${styles.rvModalPriceSection}`}>
                                {selectedProduct.discount > 0 ? (
                                    <>
                                        <span className={`${styles.rvModalPrice}`}>{(parseFloat(selectedProduct.price) * (1 - selectedProduct.discount / 100)).toFixed(2)} <small>EGP</small></span>
                                        <span className={`${styles.rvModalOriginalPrice}`}>{parseFloat(selectedProduct.price).toFixed(2)} <small>EGP</small></span>
                                        <span className={`${styles.rvModalDiscountBadge}`}>-{selectedProduct.discount}% OFF</span>
                                    </>
                                ) : (
                                    <span className={`${styles.rvModalPrice}`}>{parseFloat(selectedProduct.price || 0).toFixed(2)} <small>EGP</small></span>
                                )}
                            </div>
                            <button
                                className={`${styles.rvModalAddToCart}`}
                                onClick={(e) => {
                                    handleAddToCart(e, selectedProduct);
                                    closeModal();
                                }}
                                disabled={typeof selectedProduct.stock === 'number' && selectedProduct.stock <= 0}
                                style={typeof selectedProduct.stock === 'number' && selectedProduct.stock <= 0 ? { opacity: 0.5, cursor: 'not-allowed' } : { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            >
                                {typeof selectedProduct.stock === 'number' && selectedProduct.stock <= 0 ? t('homePage.prodOutOfStock') || 'Out of Stock' : <><ShoppingBag size={20} /> {t('homePage.prodAddToCart') || 'Add to Cart'}</>}
                            </button>
                        </div>
                    </div>
                </div>, document.body
            )}
        </section>
    );
};

export default RecentlyViewed;
