import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import { API_BASE_URL, PLACEHOLDER_IMAGE } from '../../config';
import { Share2, ArrowLeft, Plus, Minus, X } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ProductDetail.css';

gsap.registerPlugin(ScrollTrigger);

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notFound, setNotFound] = useState(false);

    // Gallery state
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');

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
                    const data = await res.json();
                    setProduct(data);
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
        if (img.startsWith('http') || img.startsWith('data:')) return img;
        const rootUrl = API_BASE_URL.replace('/api', '');
        const cleanRoot = rootUrl.endsWith('/') ? rootUrl.slice(0, -1) : rootUrl;
        const cleanPath = img.startsWith('/') ? img.slice(1) : img;
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
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLightboxOpen, currentImageIndex, images]);

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleCopyShare = () => {
        navigator.clipboard.writeText(window.location.href);
        // Optional: you can show a toast here
        alert("Copied to clipboard!");
    };

    const handleAddToCart = () => {
        if (!product || product.stock <= 0) return;
        // The CartContext typically takes a product object
        // Depending on your Cart implementation, you might need to handle quantity separately,
        // but for now we follow the existing pattern structure and maybe fire the add to cart multiple times
        // or just add it once if quantity is not supported in the context interface natively.
        for (let i = 0; i < quantity; i++) {
             addToCart(product);
        }
    };

    const renderStockIndicator = (stock) => {
        if (stock >= 10) return <span className="stock-indicator text-green">In stock</span>;
        if (stock > 0 && stock < 10) return <span className="stock-indicator text-amber">Only {stock} left!</span>;
        return <span className="stock-indicator text-red">Out of stock</span>;
    };

    if (loading) {
        return (
            <div className="product-detail-page loader-layout">
                <div className="skeleton-hero-left skeleton-block"></div>
                <div className="skeleton-hero-right">
                    <div className="skeleton-line skeleton-title"></div>
                    <div className="skeleton-line skeleton-price"></div>
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line"></div>
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
        <div className="product-detail-page">
            <Helmet>
                <title>{product.title} — WarmTouch</title>
                <meta name="description" content={product.description?.substring(0, 155)} />
                <meta property="og:title" content={product.title} />
                <meta property="og:image" content={images[0]} />
                <meta property="og:url" content={window.location.href} />
                <link rel="canonical" href={window.location.href} />
            </Helmet>

            <nav className="product-back-nav">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <ArrowLeft size={18} /> Back to Products
                </button>
            </nav>

            {/* Section A: Hero */}
            <section className="product-hero-section">
                <div className="product-gallery">
                    <div className="main-image-container" onClick={() => window.innerWidth >= 768 && setIsLightboxOpen(true)}>
                        <img 
                            src={images[currentImageIndex]} 
                            alt={product.title} 
                            className="main-image gsap-image-swap"
                        />
                    </div>
                    {images.length > 1 && (
                        <div className="thumbnail-strip">
                            {images.slice(0, 5).map((img, idx) => (
                                <button 
                                    key={idx} 
                                    className={`thumbnail-btn ${idx === currentImageIndex ? 'active' : ''}`}
                                    onClick={() => setCurrentImageIndex(idx)}
                                >
                                    <img src={img} alt={`Thumbnail ${idx}`} />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="product-core-info">
                    <div className="info-header">
                        <span className="category-badge">{product.category}</span>
                        <button className="share-btn" onClick={handleCopyShare} title="Share">
                            <Share2 size={20} />
                        </button>
                    </div>

                    <h1 className="product-title">{product.title}</h1>
                    
                    <a href="#reviews" className="product-rating-link">
                        <span className="stars">★★★★★</span>
                        <span className="rating-value">{parseFloat(ratingValue).toFixed(1)}</span>
                        <span className="rating-count">({ratingCount} reviews)</span>
                    </a>

                    <div className="price-section">
                        {product.discount > 0 ? (
                            <>
                                <span className="original-price">{price.toFixed(2)} EGP</span>
                                <div className="final-price-wrapper">
                                    <span className="final-price">{finalPrice.toFixed(2)} EGP</span>
                                    <span className="discount-tag">-{product.discount}%</span>
                                </div>
                            </>
                        ) : (
                            <span className="final-price">{price.toFixed(2)} EGP</span>
                        )}
                    </div>

                    <div className="product-stock-status">
                        {renderStockIndicator(product.stock)}
                    </div>

                    <div className="action-row">
                        <div className="quantity-selector">
                            <button 
                                disabled={quantity <= 1 || product.stock <= 0} 
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                            >
                                <Minus size={16} />
                            </button>
                            <span>{quantity}</span>
                            <button 
                                disabled={quantity >= product.stock || product.stock <= 0} 
                                onClick={() => setQuantity(q => q < product.stock ? q + 1 : q)}
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        <button 
                            className="add-to-cart-hero" 
                            disabled={product.stock <= 0}
                            onClick={handleAddToCart}
                        >
                            {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>

                    <div className="divider"></div>

                    <div className="quick-info-pills">
                        <div className="pill">Category: {product.category}</div>
                        <div className="pill">SKU/ID: {product.id}</div>
                        <div className="pill">Delivery: Cash on Delivery</div>
                    </div>
                </div>
            </section>

            {/* Section B: Description & Details */}
            <section className="product-description-section" ref={sectionBRef}>
                <div className="tabs-header">
                    <button 
                        className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                        onClick={() => setActiveTab('description')}
                    >
                        Description
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                        onClick={() => setActiveTab('details')}
                    >
                        Product Details
                    </button>
                </div>
                <div className="tabs-content">
                    {activeTab === 'description' && (
                        <div className="description-content">
                            {product.description ? (
                                product.description.split('\n').map((para, i) => (
                                    <p key={i}>{para}</p>
                                ))
                            ) : (
                                <p>No description available.</p>
                            )}
                        </div>
                    )}
                    {activeTab === 'details' && (
                        <div className="details-grid">
                            <div className="detail-row">
                                <span className="detail-label">Category</span>
                                <span className="detail-value">{product.category}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Stock</span>
                                <span className="detail-value">{product.stock} units</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Product ID</span>
                                <span className="detail-value">{product.id}</span>
                            </div>
                            {product.discount > 0 && (
                                <div className="detail-row highlight-row">
                                    <span className="detail-label">Total Savings</span>
                                    <span className="detail-value">{((price * product.discount) / 100).toFixed(2)} EGP</span>
                                </div>
                            )}
                            {product.isFeatured && (
                                <div className="detail-row featured-row">
                                    <span className="featured-badge">★ Featured Product</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* Section C: Reviews Placeholder */}
            <section id="reviews" className="product-reviews-placeholder">
                <h2>Customer Reviews</h2>
                <div className="skeleton-star-bar"></div>
                <p>Reviews coming soon. Be the first to share your experience!</p>
            </section>

            {/* Section D: Recommendations Placeholder */}
            <section className="product-recommendations-placeholder"></section>

            {/* Section E: Recently Viewed Placeholder */}
            <section className="product-recently-viewed-placeholder"></section>

            {/* Lightbox Overlay */}
            {isLightboxOpen && (
                <div className="lightbox-overlay" onClick={() => setIsLightboxOpen(false)}>
                    <button className="lightbox-close" onClick={() => setIsLightboxOpen(false)}>
                        <X size={32} />
                    </button>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        {images.length > 1 && (
                            <button className="lightbox-nav left" onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}>
                                <ArrowLeft size={32} />
                            </button>
                        )}
                        <img src={images[currentImageIndex]} alt="Zoomed Product" />
                        {images.length > 1 && (
                            <button className="lightbox-nav right" onClick={(e) => { e.stopPropagation(); handleNextImage(); }}>
                                <ArrowLeft size={32} className="rotate-180" style={{ transform: 'rotate(180deg)' }} />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
