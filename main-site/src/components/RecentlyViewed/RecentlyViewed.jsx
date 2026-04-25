import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { API_BASE_URL, PLACEHOLDER_IMAGE } from '../../config';
import './RecentlyViewed.css';

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
        button.innerHTML = '✓ Added!';
        button.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
        }, 2000);
    };

    if (!displayProducts || displayProducts.length === 0) return null;

    return (
        <section className="recently-viewed-section" ref={containerRef}>
            <div className="rv-container">
                <div className="rv-header">
                    <h2>Recently Viewed</h2>
                    <p>Continue where you left off</p>
                    <div className="rv-slider-controls">
                        <button className="rv-arrow" onClick={() => scrollRvSlider('left')}>
                            <ChevronLeft size={24} />
                        </button>
                        <button className="rv-arrow" onClick={() => scrollRvSlider('right')}>
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>
                
                <div className="rv-scroll-container" ref={scrollRef}>
                    <div className="rv-track">
                        {displayProducts.map((product, index) => (
                            <Link 
                                to={`/product/${product.id}`} 
                                className="rv-card" 
                                key={product.id}
                                ref={el => cardsRef.current[index] = el}
                            >
                                {product.discount > 0 && (
                                    <div className="rv-discount-badge">-{product.discount}%</div>
                                )}
                                <div className="rv-image-wrapper">
                                    <img src={parseImage(product.image || product.images)} alt={product.title} loading="lazy" />
                                    <button 
                                        className="rv-favorite-btn"
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
                                    <div className="rv-overlay">
                                        <button
                                            className="rv-quick-view-btn"
                                            onClick={(e) => handleQuickView(e, product)}
                                        >
                                            Quick View
                                        </button>
                                    </div>
                                </div>
                                <div className="rv-info">
                                    <h3 className="rv-title">{product.title}</h3>
                                    <p className="rv-description">{product.description || ""}</p>
                                    <div className="rv-rating-row">
                                        <span className="rv-stars">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < Math.round(product.rating?.average || product.rating || 5) ? "#fbbf24" : "none"} color={i < Math.round(product.rating?.average || product.rating || 5) ? "#fbbf24" : "#d1d5db"} />
                                            ))}
                                        </span>
                                        <span className="rv-rating-value">
                                            {(() => {
                                                const r = product.rating;
                                                if (!r) return '5.0';
                                                if (typeof r === 'object') return (r.average || 5).toFixed(1);
                                                return Number(r).toFixed(1);
                                            })()}
                                        </span>
                                    </div>
                                </div>
                                <div className="rv-footer">
                                    <div className="rv-price-wrapper">
                                        {product.discount > 0 ? (
                                            <>
                                                <span className="rv-price">{(parseFloat(product.price) * (1 - product.discount / 100)).toFixed(2)} <small>EGP</small></span>
                                                <span className="rv-original-price">{parseFloat(product.price).toFixed(2)} <small>EGP</small></span>
                                            </>
                                        ) : (
                                            <span className="rv-price">{parseFloat(product.price || 0).toFixed(2)} <small>EGP</small></span>
                                        )}
                                    </div>
                                    <button
                                        className="rv-add-to-cart-btn"
                                        disabled={typeof product.stock === 'number' && product.stock <= 0}
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
            {isModalOpen && selectedProduct && (
                <div className={`rv-modal-overlay active`} onClick={closeModal}>
                    <div className="rv-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="rv-modal-close" onClick={closeModal}>×</button>
                        <div className="rv-modal-image-wrapper">
                            <button 
                                className="rv-modal-favorite-btn"
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
                            <img src={parseImage(selectedProduct.image || selectedProduct.images)} alt={selectedProduct.title} />
                        </div>
                        <div className="rv-modal-details">
                            <h2>{selectedProduct.title}</h2>
                            <p className="rv-modal-description">{selectedProduct.description}</p>
                            <div className="rv-modal-rating">
                                <span className="rv-stars">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} fill={i < Math.round(selectedProduct.rating?.average || selectedProduct.rating || 5) ? "#fbbf24" : "none"} color={i < Math.round(selectedProduct.rating?.average || selectedProduct.rating || 5) ? "#fbbf24" : "#d1d5db"} />
                                    ))}
                                </span>
                                <span className="rv-rating-value">
                                    {(() => {
                                        const r = selectedProduct.rating;
                                        if (!r) return '5.0';
                                        if (typeof r === 'object') return (r.average || 5).toFixed(1);
                                        return Number(r).toFixed(1);
                                    })()}
                                </span>
                            </div>
                            <div className="rv-modal-price-section">
                                {selectedProduct.discount > 0 ? (
                                    <>
                                        <span className="rv-modal-price">{(parseFloat(selectedProduct.price) * (1 - selectedProduct.discount / 100)).toFixed(2)} <small>EGP</small></span>
                                        <span className="rv-modal-original-price">{parseFloat(selectedProduct.price).toFixed(2)} <small>EGP</small></span>
                                        <span className="rv-modal-discount-badge">-{selectedProduct.discount}% OFF</span>
                                    </>
                                ) : (
                                    <span className="rv-modal-price">{parseFloat(selectedProduct.price || 0).toFixed(2)} <small>EGP</small></span>
                                )}
                            </div>
                            <button
                                className="rv-modal-add-to-cart"
                                onClick={(e) => {
                                    handleAddToCart(e, selectedProduct);
                                    closeModal();
                                }}
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default RecentlyViewed;
