import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import api from '../../services/api';
import { API_BASE_URL, PLACEHOLDER_IMAGE } from '../../config';
import { Share2, ArrowLeft, Plus, Minus, X, Heart, ShoppingBag, Truck, ShieldCheck, RotateCcw, Hand, Leaf, Sparkles, CheckCircle, ChevronLeft, ChevronRight, Star, Eye } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ReviewsSection from './ReviewsSection';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import RecentlyViewed from '../RecentlyViewed/RecentlyViewed';
import './ProductDetail.css';

gsap.registerPlugin(ScrollTrigger);

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { toggleFavorite, isFavorite } = useFavorites();
    const { addToRecentlyViewed, recentlyViewed } = useRecentlyViewed();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notFound, setNotFound] = useState(false);

    // Gallery state
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [showToast, setShowToast] = useState(false);
    const [recommendations, setRecommendations] = useState([]);
    const [recLoading, setRecLoading] = useState(true);
    const [selectedRecProduct, setSelectedRecProduct] = useState(null);
    const [isRecModalOpen, setIsRecModalOpen] = useState(false);
    const recSliderRef = useRef(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!id) return;
            try {
                setRecLoading(true);
                const res = await api.get(`/products/${id}/recommendations`);
                const data = await res.json();
                if (data.success && data.data) {
                    setRecommendations(data.data);
                } else {
                    setRecommendations([]);
                }
            } catch (err) {
                console.error("Failed to fetch recommendations:", err);
                setRecommendations([]);
            } finally {
                setRecLoading(false);
            }
        };

        if (id) {
            fetchRecommendations();
        }
    }, [id]);

    // Refs for GSAP
    const sectionBRef = useRef(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null);
                setNotFound(false);
                const res = await api.products.getById(id);
                if (res.ok) {
                    const payload = await res.json();
                    setProduct(payload.success ? payload.data : payload);
                } else if (res.status === 404) {
                    setNotFound(true);
                } else {
                    setError('Failed to load product. Please try again.');
                }
            } catch (err) {
                console.error(err);
                setError('Network error. Check your connection.');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        if (product && !loading && !error && !notFound) {
            addToRecentlyViewed({
                id: product.id,
                title: product.title,
                price: product.price,
                discount: product.discount,
                images: product.image || product.images,
                rating: product.rating,
                stock: product.stock
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product, loading, error, notFound]);

    useEffect(() => {
        // Section B entrance animation
        if (!loading && !error && !notFound && product && sectionBRef.current) {
            gsap.fromTo(
                sectionBRef.current,
                { y: 40, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.5,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: sectionBRef.current,
                        start: "top 85%",
                    }
                }
            );
        }
    }, [loading, error, notFound, product]);

    const getImages = (imageField) => {
        if (!imageField) return [PLACEHOLDER_IMAGE];
        try {
            if (typeof imageField === 'string' && (imageField.startsWith('[') || imageField.startsWith('{'))) {
                const parsed = JSON.parse(imageField);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed.map(img => cleanImageUrl(img));
                }
            }
        } catch (e) {
            console.warn('Image parsing error', e);
        }
        return [cleanImageUrl(imageField)];
    };

    const cleanImageUrl = (img) => {
        if (!img) return PLACEHOLDER_IMAGE;
        if (typeof img !== 'string') return img;
        const normalizedImg = img.replace(/\\/g, '/');
        if (normalizedImg.startsWith('http') || normalizedImg.startsWith('data:')) return normalizedImg;
        const rootUrl = API_BASE_URL.replace('/api', '');
        const cleanRoot = rootUrl.endsWith('/') ? rootUrl.slice(0, -1) : rootUrl;
        const cleanPath = normalizedImg.startsWith('/') ? normalizedImg.slice(1) : normalizedImg;
        return `${cleanRoot}/${cleanPath}`;
    };

    const images = useMemo(() => {
        if (product) return getImages(product.image || product.images);
        return [];
    }, [product]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isLightboxOpen) {
                if (e.key === 'Escape') setIsLightboxOpen(false);
                if (e.key === 'ArrowRight') handleNextImage();
                if (e.key === 'ArrowLeft') handlePrevImage();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        
        if (isLightboxOpen || isRecModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isLightboxOpen, isRecModalOpen, currentImageIndex, images]);

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleCopyShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    };

    const scrollRecSlider = (direction) => {
        const container = recSliderRef.current;
        const scrollAmount = 350;
        container.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    const handleRecQuickView = (e, product) => {
        if(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setSelectedRecProduct(product);
        setIsRecModalOpen(true);
    };

    const closeRecModal = () => {
        setIsRecModalOpen(false);
        setTimeout(() => setSelectedRecProduct(null), 300);
    };

    const handleAddToCart = () => {
        if (!product || product.stock <= 0) return;
        addToCart(product, quantity);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    const renderStockIndicator = (stock) => {
        if (stock >= 10) return <span className="stock-indicator text-green">In stock</span>;
        if (stock > 0 && stock < 10) return <span className="stock-indicator text-amber">Only {stock} left!</span>;
        return <span className="stock-indicator text-red">Out of stock</span>;
    };

    if (loading) {
        return (
            <div className="product-detail-container">
                <div className="pd-skeleton">
                    {/* Breadcrumb skeleton */}
                    <div className="pd-sk-breadcrumb">
                        <div className="pd-sk-line" style={{width: '60px'}}></div>
                        <div className="pd-sk-line" style={{width: '80px'}}></div>
                        <div className="pd-sk-line" style={{width: '120px'}}></div>
                    </div>
                    {/* Hero skeleton */}
                    <div className="pd-sk-hero">
                        <div className="pd-sk-image"></div>
                        <div className="pd-sk-info">
                            <div className="pd-sk-line" style={{width: '40%', height: '14px'}}></div>
                            <div className="pd-sk-line" style={{width: '80%', height: '28px'}}></div>
                            <div className="pd-sk-line" style={{width: '50%', height: '16px'}}></div>
                            <div className="pd-sk-line" style={{width: '30%', height: '24px', marginTop: '16px'}}></div>
                            <div className="pd-sk-line" style={{width: '45%', height: '14px'}}></div>
                            <div style={{display: 'flex', gap: '12px', marginTop: '24px'}}>
                                <div className="pd-sk-line" style={{width: '120px', height: '44px', borderRadius: '8px'}}></div>
                                <div className="pd-sk-line" style={{width: '180px', height: '44px', borderRadius: '8px'}}></div>
                            </div>
                            <div style={{display: 'flex', gap: '16px', marginTop: '24px'}}>
                                <div className="pd-sk-line" style={{width: '80px', height: '60px', borderRadius: '10px'}}></div>
                                <div className="pd-sk-line" style={{width: '80px', height: '60px', borderRadius: '10px'}}></div>
                                <div className="pd-sk-line" style={{width: '80px', height: '60px', borderRadius: '10px'}}></div>
                                <div className="pd-sk-line" style={{width: '80px', height: '60px', borderRadius: '10px'}}></div>
                            </div>
                        </div>
                    </div>
                    {/* Description + Reviews skeleton */}
                    <div className="pd-sk-bottom">
                        <div className="pd-sk-desc">
                            <div className="pd-sk-line" style={{width: '50%', height: '20px'}}></div>
                            <div className="pd-sk-line" style={{width: '100%', height: '12px'}}></div>
                            <div className="pd-sk-line" style={{width: '90%', height: '12px'}}></div>
                            <div className="pd-sk-line" style={{width: '70%', height: '12px'}}></div>
                        </div>
                        <div className="pd-sk-desc">
                            <div className="pd-sk-line" style={{width: '40%', height: '20px'}}></div>
                            <div className="pd-sk-line" style={{width: '100%', height: '80px', borderRadius: '10px'}}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="product-detail-error">
                <h2>Product Not Found</h2>
                <p>This product doesn't exist or has been removed.</p>
                <Link to="/allproducts" className="btn-primary">Browse all products</Link>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="product-detail-error">
                <h2>Something went wrong</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="btn-primary">Try refreshing</button>
            </div>
        );
    }

    const price = parseFloat(product.price);
    const finalPrice = product.discount > 0 ? price * (1 - product.discount / 100) : price;
    const ratingObj = product.rating || { average: 5, count: 0 };
    const ratingValue = typeof ratingObj === 'object' ? ratingObj.average : ratingObj; // Handle old vs phase 0 struct
    const ratingCount = typeof ratingObj === 'object' ? ratingObj.count : 0;

    return (
        <div className="product-detail-container">
            <Helmet>
                <title>{`${product.title} — WarmTouch`}</title>
                <meta name="description" content={product.description ? product.description.substring(0, 155) : ''} />
            </Helmet>

            <nav className="breadcrumb-nav">
                <Link to="/">Home</Link>
                <span className="chevron">&gt;</span>
                <Link to="/allproducts">{product.category}</Link>
                <span className="chevron">&gt;</span>
                <span className="current-page">{product.title}</span>
            </nav>

            <div className="product-hero-split">
                {/* Image Gallery */}
                <div className="hero-gallery-side">
                    <div className="main-image-viewport">
                        {images.length > 1 && (
                            <div className="gallery-nav-overlay">
                                <button className="gal-nav-btn" onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}>
                                    <ChevronLeft size={20} />
                                </button>
                                <button className="gal-nav-btn" onClick={(e) => { e.stopPropagation(); handleNextImage(); }}>
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                        
                        {product?.discount > 0 && (
                            <div className="sale-badge">SALE -{product.discount}%</div>
                        )}
                        {product?.createdAt && (new Date() - new Date(product.createdAt)) < 14 * 24 * 60 * 60 * 1000 && (
                            <span className="badge-new">New</span>
                        )}
                        <div className="main-image-container" onClick={() => setIsLightboxOpen(true)}>
                            <img 
                                key={currentImageIndex}
                                src={images[currentImageIndex]} 
                                alt={product.title} 
                                className="main-product-img"
                            />
                            <button className="zoom-indicator">
                                <Eye size={20} />
                            </button>
                        </div>
                    </div>
                    {images.length > 1 && (
                        <div className="hero-thumbnails">
                            {images.map((img, idx) => (
                                <button 
                                    key={idx} 
                                    className={`thumb-box ${idx === currentImageIndex ? 'active' : ''}`}
                                    onClick={() => setCurrentImageIndex(idx)}
                                >
                                    <img src={img} alt={`Thumbnail ${idx + 1}`} />
                                    <div className="thumb-indicator"></div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Core Info */}
                <div className="hero-content-side">
                    <div className="content-header">
                        <span className="category-label">{product.category}</span>
                        <button className="share-circle" onClick={handleCopyShare}><Share2 size={18} /></button>
                    </div>

                    <h1 className="display-title">{product.title}</h1>
                    
                    <div className="rating-summary-row">
                        <div className="stars-row">
                            {[1,2,3,4,5].map(s => <span key={s} className={`star-ui ${s <= Math.round(ratingValue) ? 'filled' : ''}`}>★</span>)}
                        </div>
                        <span className="rating-score">{ratingValue > 0 ? ratingValue.toFixed(1) : '0.0'}</span>
                        <span className="review-link">({ratingCount} {ratingCount === 1 ? 'review' : 'reviews'})</span>
                    </div>

                    <div className="price-tag-row">
                        <span className="amount-main">{price.toFixed(2)} EGP</span>
                    </div>

                    <div className="inventory-status">
                        {product.stock > 0 && product.stock < 10 ? (
                            <><span className="dot orange-dot"></span><span className="status-text">Only {product.stock} left in stock!</span></>
                        ) : product.stock >= 10 ? (
                            <><span className="dot green-dot"></span><span className="status-text">In stock</span></>
                        ) : (
                            <><span className="dot red-dot"></span><span className="status-text">Out of stock</span></>
                        )}
                    </div>

                    <div className="hero-actions-row">
                        <div className="qty-picker-ui">
                            <button className="q-btn" onClick={() => setQuantity(q => Math.max(1, q-1))}><Minus size={16} /></button>
                            <span className="q-val">{quantity}</span>
                            <button className="q-btn" onClick={() => setQuantity(q => Math.min(product.stock || 1, q+1))}><Plus size={16} /></button>
                        </div>
                        <button className="add-cart-primary" onClick={handleAddToCart}>
                            <ShoppingBag size={20} />
                            <span>Add to Cart</span>
                        </button>
                        <button 
                            className="wishlist-btn-ui"
                            onClick={() => toggleFavorite(product)}
                            style={{ transition: 'color 0.2s ease, transform 0.2s ease' }}
                        >
                            <Heart 
                                size={20} 
                                fill={product && isFavorite(product.id) ? '#ef4444' : 'none'} 
                                color={product && isFavorite(product.id) ? '#ef4444' : 'currentColor'}
                            />
                        </button>
                    </div>

                    <div className="feature-icon-strip">
                        <div className="f-item">
                            <div className="f-icon purple"><Hand size={18} /></div>
                            <div className="f-label">Handmade With Love</div>
                        </div>
                        <div className="f-item">
                            <div className="f-icon green"><Leaf size={18} /></div>
                            <div className="f-label">Eco-friendly Materials</div>
                        </div>
                        <div className="f-item">
                            <div className="f-icon gray"><Truck size={18} /></div>
                            <div className="f-label">Cash on Delivery</div>
                        </div>
                        <div className="f-item">
                            <div className="f-icon orange"><RotateCcw size={18} /></div>
                            <div className="f-label">Easy Returns</div>
                        </div>
                    </div>

                    <div className="info-attribute-bars">
                        <div className="attr-bar">
                            <span className="attr-label">Category:</span>
                            <span className="attr-val">{product.category}</span>
                        </div>
                        <div className="attr-bar">
                            <span className="attr-label">SKU/ID:</span>
                            <span className="attr-val">{product.id}</span>
                        </div>
                        <div className="attr-bar">
                            <span className="attr-label">Delivery:</span>
                            <span className="attr-val">Cash on Delivery</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Split Section: About vs Reviews */}
            <div className="product-split-details">
                <div className="about-col">
                    <h2 className="col-title">About this product</h2>
                    <div className="about-desc-ar">
                        <p>{product.description || 'طقم كوسترات مكون من 5 قطع مصنوعه يدوياً بخيوط قطنية طبيعية. تصميم أنيق يضفي لمسة دافئة وجمالية على طاولتك ويحمي الأسطح من الحرارة والرطوبة.'}</p>
                    </div>
                    <ul className="checkmark-list">
                        <li><span className="check">✓</span> مصنوع من خيوط قطنية طبيعية</li>
                        <li><span className="check">✓</span> تصميم يدوي فريد</li>
                        <li><span className="check">✓</span> متين وسهل التنظيف</li>
                        <li><span className="check">✓</span> مثالي لهدية راقية</li>
                    </ul>
                    <div className="unique-box">
                        <div className="u-icon"><RotateCcw size={18} /></div>
                        <p>Each piece is uniquely handmade, small variations are part of the charm.</p>
                    </div>
                </div>

                <ReviewsSection productId={product?.id} initialRating={product?.rating} />
            </div>

            {/* Recommendations Section */}
            {(!recLoading && recommendations.length < 2) ? null : (
                <div className="recommendations-section">
                    <div className="section-header-row">
                        <h2>You may also like</h2>
                        <div className="slider-controls">
                            <button className="slider-arrow" onClick={() => scrollRecSlider('left')} disabled={recLoading}>
                                <ChevronLeft size={20} />
                            </button>
                            <button className="slider-arrow" onClick={() => scrollRecSlider('right')} disabled={recLoading}>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="rec-slider-wrapper">
                        <div className="rec-grid" ref={recSliderRef}>
                            {recLoading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="rec-card skeleton-block">
                                        <div className="rec-img" style={{height: '200px'}}></div>
                                        <div className="rec-info">
                                            <div className="skeleton-line" style={{width: '80%'}}></div>
                                            <div className="skeleton-line" style={{width: '60%'}}></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                recommendations.map(item => {
                                    const itemImages = getImages(item.image || item.images);
                                    const img = itemImages[0] || PLACEHOLDER_IMAGE;
                                    const ratingObj = item.rating || { average: 5 };
                                    const ratingVal = typeof ratingObj === 'object' ? ratingObj.average : ratingObj;

                                    return (
                                        <div key={item.id} className="rv-card rec-card-override" onClick={() => navigate(`/product/${item.id}`)}>
                                            {item.discount > 0 && (
                                                <div className="rv-discount-badge">-{item.discount}%</div>
                                            )}
                                            <div className="rv-image-wrapper">
                                                <img src={img} alt={item.title} loading="lazy" />
                                                <button 
                                                    className="rv-favorite-btn"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        toggleFavorite(item);
                                                    }}
                                                >
                                                    <Heart 
                                                        size={20} 
                                                        fill={isFavorite(item.id) ? '#ef4444' : 'none'} 
                                                        color={isFavorite(item.id) ? '#ef4444' : '#6b7280'}
                                                    />
                                                </button>
                                                <div className="rv-overlay">
                                                    <button
                                                        className="rv-quick-view-btn"
                                                        onClick={(e) => handleRecQuickView(e, item)}
                                                    >
                                                        Quick View
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="rv-info">
                                                <h3 className="rv-title">{item.title}</h3>
                                                <p className="rv-description">{item.description || ""}</p>
                                                <div className="rv-rating-row">
                                                    <span className="rv-stars">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={14} fill={i < Math.round(ratingVal) ? "#fbbf24" : "none"} color={i < Math.round(ratingVal) ? "#fbbf24" : "#d1d5db"} />
                                                        ))}
                                                    </span>
                                                    <span className="rv-rating-value">{Number(ratingVal).toFixed(1)}</span>
                                                </div>
                                            </div>
                                            <div className="rv-footer">
                                                <div className="rv-price-wrapper">
                                                    {item.discount > 0 ? (
                                                        <>
                                                            <span className="rv-price">{(parseFloat(item.price) * (1 - item.discount / 100)).toFixed(2)} <small>EGP</small></span>
                                                            <span className="rv-original-price">{parseFloat(item.price).toFixed(2)} <small>EGP</small></span>
                                                        </>
                                                    ) : (
                                                        <span className="rv-price">{parseFloat(item.price || 0).toFixed(2)} <small>EGP</small></span>
                                                    )}
                                                </div>
                                                <button
                                                    className="rv-add-to-cart-btn"
                                                    disabled={typeof item.stock === 'number' && item.stock <= 0}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        addToCart(item, 1);
                                                        setShowToast(true);
                                                        setTimeout(() => setShowToast(false), 2000);
                                                    }}
                                                >
                                                    <ShoppingBag size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendation Quick View Modal */}
            {isRecModalOpen && selectedRecProduct && (
                <div className={`rv-modal-overlay active`} onClick={closeRecModal}>
                    <div className="rv-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="rv-modal-close" onClick={closeRecModal}>×</button>
                        <div className="rv-modal-image-wrapper">
                            <button 
                                className="rv-modal-favorite-btn"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleFavorite(selectedRecProduct);
                                }}
                            >
                                <Heart 
                                    size={24} 
                                    fill={isFavorite(selectedRecProduct.id) ? '#ef4444' : 'none'} 
                                    color={isFavorite(selectedRecProduct.id) ? '#ef4444' : '#6b7280'}
                                />
                            </button>
                            <img src={cleanImageUrl((getImages(selectedRecProduct.image || selectedRecProduct.images))[0])} alt={selectedRecProduct.title} />
                        </div>
                        <div className="rv-modal-details">
                            <h2>{selectedRecProduct.title}</h2>
                            <p className="rv-modal-description">{selectedRecProduct.description}</p>
                            <div className="rv-modal-rating">
                                <span className="rv-stars">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} fill={i < Math.round(selectedRecProduct.rating?.average || selectedRecProduct.rating || 5) ? "#fbbf24" : "none"} color={i < Math.round(selectedRecProduct.rating?.average || selectedRecProduct.rating || 5) ? "#fbbf24" : "#d1d5db"} />
                                    ))}
                                </span>
                                <span className="rv-rating-value">
                                    {Number(selectedRecProduct.rating?.average || selectedRecProduct.rating || 5).toFixed(1)}
                                </span>
                            </div>
                            <div className="rv-modal-price-section">
                                {selectedRecProduct.discount > 0 ? (
                                    <>
                                        <span className="rv-modal-price">{(parseFloat(selectedRecProduct.price) * (1 - selectedRecProduct.discount / 100)).toFixed(2)} <small>EGP</small></span>
                                        <span className="rv-modal-original-price">{parseFloat(selectedRecProduct.price).toFixed(2)} <small>EGP</small></span>
                                        <span className="rv-modal-discount-badge">-{selectedRecProduct.discount}% OFF</span>
                                    </>
                                ) : (
                                    <span className="rv-modal-price">{parseFloat(selectedRecProduct.price || 0).toFixed(2)} <small>EGP</small></span>
                                )}
                            </div>
                            <button
                                className="rv-modal-add-to-cart"
                                onClick={(e) => {
                                    addToCart(selectedRecProduct, 1);
                                    closeRecModal();
                                    setShowToast(true);
                                    setTimeout(() => setShowToast(false), 2000);
                                }}
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Recently Viewed Strip */}
            <RecentlyViewed products={recentlyViewed} currentProductId={product?.id} />

            {/* Lightbox Overlay */}
            {isLightboxOpen && (
                <div className="lightbox-overlay" onClick={() => setIsLightboxOpen(false)}>
                    <button className="lb-close" onClick={() => setIsLightboxOpen(false)}>
                        <X size={32} />
                    </button>
                    
                    {images.length > 1 && (
                        <>
                            <button 
                                className="lb-nav-btn lb-prev" 
                                onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                            >
                                <ChevronLeft size={48} />
                            </button>
                            <button 
                                className="lb-nav-btn lb-next" 
                                onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                            >
                                <ChevronRight size={48} />
                            </button>
                        </>
                    )}

                    <div className="lb-content" onClick={e => e.stopPropagation()}>
                        <img src={images[currentImageIndex]} alt="Product Large View" />
                        <div className="lb-caption">
                            {product.title} - Image {currentImageIndex + 1} of {images.length}
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {showToast && (
                <div className="share-toast">
                    <CheckCircle size={20} />
                    <span>Link copied to clipboard!</span>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
