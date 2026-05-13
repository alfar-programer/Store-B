import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import { API_BASE_URL, PLACEHOLDER_IMAGE } from '../../config';
import { Share2, ArrowLeft, Plus, Minus, X, Heart, ShoppingBag, Truck, ShieldCheck, RotateCcw, Hand, Leaf, Sparkles, CheckCircle, ChevronLeft, ChevronRight, Star, Eye } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ReviewsSection from './ReviewsSection';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import RecentlyViewed from '../RecentlyViewed/RecentlyViewed';
import { useTranslation } from 'react-i18next';
import styles from './ProductDetail.module.css';
import rvStyles from '../RecentlyViewed/RecentlyViewed.module.css';

gsap.registerPlugin(ScrollTrigger);

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { toggleFavorite, isFavorite } = useFavorites();
    const { addToRecentlyViewed, recentlyViewed } = useRecentlyViewed();
    const { getProductField, lang } = useLanguage();
    const { t } = useTranslation();

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
                title_ar: product.title_ar,
                description: product.description,
                description_ar: product.description_ar,
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
            <div className={`${styles.productDetailContainer}`}>
                <div className={`${styles.pdSkeleton}`}>
                    {/* Breadcrumb skeleton */}
                    <div className={`${styles.pdSkBreadcrumb}`}>
                        <div className={`${styles.pdSkLine}`} style={{width: '60px'}}></div>
                        <div className={`${styles.pdSkLine}`} style={{width: '80px'}}></div>
                        <div className={`${styles.pdSkLine}`} style={{width: '120px'}}></div>
                    </div>
                    {/* Hero skeleton */}
                    <div className={`${styles.pdSkHero}`}>
                        <div className={`${styles.pdSkImage}`}></div>
                        <div className={`${styles.pdSkInfo}`}>
                            <div className={`${styles.pdSkLine}`} style={{width: '40%', height: '14px'}}></div>
                            <div className={`${styles.pdSkLine}`} style={{width: '80%', height: '28px'}}></div>
                            <div className={`${styles.pdSkLine}`} style={{width: '50%', height: '16px'}}></div>
                            <div className={`${styles.pdSkLine}`} style={{width: '30%', height: '24px', marginTop: '16px'}}></div>
                            <div className={`${styles.pdSkLine}`} style={{width: '45%', height: '14px'}}></div>
                            <div style={{display: 'flex', gap: '12px', marginTop: '24px'}}>
                                <div className={`${styles.pdSkLine}`} style={{width: '120px', height: '44px', borderRadius: '8px'}}></div>
                                <div className={`${styles.pdSkLine}`} style={{width: '180px', height: '44px', borderRadius: '8px'}}></div>
                            </div>
                            <div style={{display: 'flex', gap: '16px', marginTop: '24px'}}>
                                <div className={`${styles.pdSkLine}`} style={{width: '80px', height: '60px', borderRadius: '10px'}}></div>
                                <div className={`${styles.pdSkLine}`} style={{width: '80px', height: '60px', borderRadius: '10px'}}></div>
                                <div className={`${styles.pdSkLine}`} style={{width: '80px', height: '60px', borderRadius: '10px'}}></div>
                                <div className={`${styles.pdSkLine}`} style={{width: '80px', height: '60px', borderRadius: '10px'}}></div>
                            </div>
                        </div>
                    </div>
                    {/* Description + Reviews skeleton */}
                    <div className={`${styles.pdSkBottom}`}>
                        <div className={`${styles.pdSkDesc}`}>
                            <div className={`${styles.pdSkLine}`} style={{width: '50%', height: '20px'}}></div>
                            <div className={`${styles.pdSkLine}`} style={{width: '100%', height: '12px'}}></div>
                            <div className={`${styles.pdSkLine}`} style={{width: '90%', height: '12px'}}></div>
                            <div className={`${styles.pdSkLine}`} style={{width: '70%', height: '12px'}}></div>
                        </div>
                        <div className={`${styles.pdSkDesc}`}>
                            <div className={`${styles.pdSkLine}`} style={{width: '40%', height: '20px'}}></div>
                            <div className={`${styles.pdSkLine}`} style={{width: '100%', height: '80px', borderRadius: '10px'}}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="product-detail-error">
                <h2>{t('productDetail.notFoundTitle')}</h2>
                <p>{t('productDetail.notFoundDesc')}</p>
                <Link to="/allproducts" className="btn-primary">{t('productDetail.browseAll')}</Link>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="product-detail-error">
                <h2>{t('productDetail.errorTitle')}</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="btn-primary">{t('productDetail.tryRefreshing')}</button>
            </div>
        );
    }

    const price = parseFloat(product.price);
    const finalPrice = product.discount > 0 ? price * (1 - product.discount / 100) : price;
    const ratingObj = product.rating || { average: 5, count: 0 };
    const ratingValue = typeof ratingObj === 'object' ? ratingObj.average : ratingObj; // Handle old vs phase 0 struct
    const ratingCount = typeof ratingObj === 'object' ? ratingObj.count : 0;

    // Bilingual display helpers
    const displayTitle = getProductField(product, 'title');
    const displayDescription = getProductField(product, 'description');

    return (
        <div className={`${styles.productDetailContainer}`}>
            <Helmet>
                <title>{`${displayTitle} — WarmTouch`}</title>
                <meta name="description" content={displayDescription ? displayDescription.substring(0, 155) : ''} />
                <html lang={lang} />
            </Helmet>

            <nav className={`${styles.breadcrumbNav}`}>
                <Link to="/">{t('productDetail.home')}</Link>
                <span className={`${styles.chevron}`}>&gt;</span>
                <Link to="/allproducts">{product.category}</Link>
                <span className={`${styles.chevron}`}>&gt;</span>
                <span className={`${styles.currentPage}`}>{displayTitle}</span>
            </nav>

            <div className={`${styles.productHeroSplit}`}>
                {/* Image Gallery */}
                <div className={`${styles.heroGallerySide}`}>
                    <div className={`${styles.mainImageViewport}`}>
                        {images.length > 1 && (
                            <div className={`${styles.galleryNavOverlay}`}>
                                <button className={`${styles.galNavBtn}`} onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}>
                                    <ChevronLeft size={20} />
                                </button>
                                <button className={`${styles.galNavBtn}`} onClick={(e) => { e.stopPropagation(); handleNextImage(); }}>
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                        
                        {product?.discount > 0 && (
                            <div className={`${styles.saleBadge}`}>{t('productDetail.sale')} -{product.discount}%</div>
                        )}
                        {product?.createdAt && (new Date() - new Date(product.createdAt)) < 14 * 24 * 60 * 60 * 1000 && (
                            <span className="badge-new">{t('productDetail.new')}</span>
                        )}
                        <div className={`${styles.mainImageContainer}`} onClick={() => setIsLightboxOpen(true)}>
                            <img 
                                key={currentImageIndex}
                                src={images[currentImageIndex]} 
                                alt={product.title} 
                                className={`${styles.mainProductImg}`}
                            />
                            
                        </div>
                    </div>
                    {images.length > 1 && (
                        <div className={`${styles.heroThumbnails}`}>
                            {images.map((img, idx) => (
                                <button 
                                    key={idx} 
                                    className={`${styles.thumbBox} ${idx === currentImageIndex ? '${rvStyles.active}' : ''}`}
                                    onClick={() => setCurrentImageIndex(idx)}
                                >
                                    <img src={img} alt={`Thumbnail ${idx + 1}`} />
                                    <div className={`${styles.thumbIndicator}`}></div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Core Info */}
                <div className={`${styles.heroContentSide}`}>
                    <div className={`${styles.contentHeader}`}>
                        <span className={`${styles.categoryLabel}`}>{product.category}</span>
                        <button className={`${styles.shareCircle}`} onClick={handleCopyShare}><Share2 size={18} /></button>
                    </div>

                    <h1 className={`${styles.displayTitle}`}>{displayTitle}</h1>
                    
                    <div className={`${styles.ratingSummaryRow}`}>
                        <div className={`${styles.starsRow}`}>
                            {[1,2,3,4,5].map(s => <span key={s} className={`${styles.starUi} ${s <= Math.round(ratingValue) ? '${styles.filled}' : ''}`}>★</span>)}
                        </div>
                        <span className={`${styles.ratingScore}`}>{ratingValue > 0 ? ratingValue.toFixed(1) : '0.0'}</span>
                        <span className={`${styles.reviewLink}`}>({ratingCount} {ratingCount === 1 ? t('productDetail.review') : t('productDetail.reviews')})</span>
                    </div>

                    <div className={`${styles.priceTagRow}`}>
                        <span className={`${styles.amountMain}`}>{price.toFixed(2)} EGP</span>
                    </div>

                    <div className={`${styles.inventoryStatus}`}>
                        {product.stock > 0 && product.stock < 10 ? (
                            <><span className={`${styles.dot} ${styles.orangeDot}`}></span><span className={`${styles.statusText}`}>{t('productDetail.onlyLeft', { count: product.stock })}</span></>
                        ) : product.stock >= 10 ? (
                            <><span className={`${styles.dot} ${styles.greenDot}`}></span><span className={`${styles.statusText}`}>{t('productDetail.inStock')}</span></>
                        ) : (
                            <><span className={`${styles.dot} ${styles.redDot}`}></span><span className={`${styles.statusText}`}>{t('productDetail.outOfStock')}</span></>
                        )}
                    </div>

                    <div className={`${styles.heroActionsRow}`}>
                        <div className={`${styles.qtyPickerUi}`}>
                            <button className={`${styles.qBtn}`} onClick={() => setQuantity(q => Math.max(1, q-1))}><Minus size={16} /></button>
                            <span className={`${styles.qVal}`}>{quantity}</span>
                            <button className={`${styles.qBtn}`} onClick={() => setQuantity(q => Math.min(product.stock || 1, q+1))}><Plus size={16} /></button>
                        </div>
                        <button className={`${styles.addCartPrimary}`} onClick={handleAddToCart}>
                            <ShoppingBag size={20} />
                            <span>{t('productDetail.addToCart')}</span>
                        </button>
                        <button 
                            className={`${styles.wishlistBtnUi}`}
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

                    <div className={`${styles.featureIconStrip}`}>
                        <div className={`${styles.fItem}`}>
                            <div className={`${styles.fIcon} ${styles.purple}`}><Hand size={18} /></div>
                            <div className={`${styles.fLabel}`}>{t('productDetail.featHandmade')}</div>
                        </div>
                        <div className={`${styles.fItem}`}>
                            <div className={`${styles.fIcon} ${styles.green}`}><Leaf size={18} /></div>
                            <div className={`${styles.fLabel}`}>{t('productDetail.featEco')}</div>
                        </div>
                        <div className={`${styles.fItem}`}>
                            <div className={`${styles.fIcon} ${styles.gray}`}><Truck size={18} /></div>
                            <div className={`${styles.fLabel}`}>{t('productDetail.featCod')}</div>
                        </div>
                        <div className={`${styles.fItem}`}>
                            <div className={`${styles.fIcon} ${styles.orange}`}><RotateCcw size={18} /></div>
                            <div className={`${styles.fLabel}`}>{t('productDetail.featReturns')}</div>
                        </div>
                    </div>

                    <div className={`${styles.infoAttributeBars}`}>
                        <div className={`${styles.attrBar}`}>
                            <span className={`${styles.attrLabel}`}>{t('productDetail.lblCategory')}</span>
                            <span className={`${styles.attrVal}`}>{product.category}</span>
                        </div>
                        <div className={`${styles.attrBar}`}>
                            <span className={`${styles.attrLabel}`}>{t('productDetail.lblSku')}</span>
                            <span className={`${styles.attrVal}`}>{product.id}</span>
                        </div>
                        <div className={`${styles.attrBar}`}>
                            <span className={`${styles.attrLabel}`}>{t('productDetail.lblDelivery')}</span>
                            <span className={`${styles.attrVal}`}>{t('productDetail.featCod')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Split Section: About vs Reviews */}
            <div className={`${styles.productSplitDetails}`}>
                <div className="about-col">
                    <h2 className={`${styles.colTitle}`}>{t('productDetail.aboutTitle')}</h2>
                    <div className={`${styles.aboutDescAr}`}>
                        <p>{displayDescription || t('productDetail.aboutFallbackDesc')}</p>
                    </div>
                    <ul className={`${styles.checkmarkList}`}>
                        <li><span className={`${styles.check}`}>✓</span> مصنوع من خيوط قطنية طبيعية</li>
                        <li><span className={`${styles.check}`}>✓</span> تصميم يدوي فريد</li>
                        <li><span className={`${styles.check}`}>✓</span> متين وسهل التنظيف</li>
                        <li><span className={`${styles.check}`}>✓</span> مثالي لهدية راقية</li>
                    </ul>
                    <div className={`${styles.uniqueBox}`}>
                        <div className={`${styles.uIcon}`}><RotateCcw size={18} /></div>
                        <p>{t('productDetail.uniqueNotice')}</p>
                    </div>
                </div>

                <ReviewsSection productId={product?.id} initialRating={product?.rating} />
            </div>

            {/* Recommendations Section */}
            {(!recLoading && recommendations.length < 2) ? null : (
                <div className={`${styles.recommendationsSection}`}>
                    <div className={`${styles.sectionHeaderRow}`}>
                        <h2>{t('productDetail.youMayLike')}</h2>
                        <div className={`${styles.sliderControls}`}>
                            <button className={`${styles.sliderArrow}`} onClick={() => scrollRecSlider('left')} disabled={recLoading}>
                                <ChevronLeft size={20} />
                            </button>
                            <button className={`${styles.sliderArrow}`} onClick={() => scrollRecSlider('right')} disabled={recLoading}>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                    <div className={`${styles.recSliderWrapper}`}>
                        <div className={`${styles.recGrid}`} ref={recSliderRef}>
                            {recLoading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className={`${styles.recCard} skeleton-block`}>
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
                                        <div key={item.id} className={`${rvStyles.rvCard} ${styles.recCardOverride}`} onClick={() => navigate(`/product/${item.id}`)}>
                                            {item.discount > 0 && (
                                                <div className={`${rvStyles.rvDiscountBadge}`}>-{item.discount}%</div>
                                            )}
                                            <div className={`${rvStyles.rvImageWrapper}`}>
                                                <img src={img} alt={getProductField(item, 'title')} loading="lazy" />
                                                <button 
                                                    className={`${rvStyles.rvFavoriteBtn}`}
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
                                                <div className={`${rvStyles.rvOverlay}`}>
                                                    <button
                                                        className={`${rvStyles.rvQuickViewBtn}`}
                                                        onClick={(e) => handleRecQuickView(e, item)}
                                                    >
                                                        {t('productDetail.quickView')}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className={`${rvStyles.rvInfo}`}>
                                                <h3 className={`${rvStyles.rvTitle}`}>{getProductField(item, 'title')}</h3>
                                                <p className={`${rvStyles.rvDescription}`}>{getProductField(item, 'description') || ""}</p>
                                                <div className={`${rvStyles.rvRatingRow}`}>
                                                    <span className={`${rvStyles.rvStars}`}>
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={14} fill={i < Math.round(ratingVal) ? "#fbbf24" : "none"} color={i < Math.round(ratingVal) ? "#fbbf24" : "#d1d5db"} />
                                                        ))}
                                                    </span>
                                                    <span className={`${rvStyles.rvRatingValue}`}>{Number(ratingVal).toFixed(1)}</span>
                                                </div>
                                                {/* Stock indicator */}
                                                {typeof item.stock === 'number' && item.stock > 0 && item.stock < 10 && (
                                                    <div className="rv-stock-warning" style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: '600', width: '100%', marginBottom: '8px' }}>
                                                        {t('homePage.prodLeftOnly', { count: item.stock }) || `Only ${item.stock} left!`}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`${rvStyles.rvFooter}`}>
                                                <div className={`${rvStyles.rvPriceWrapper}`}>
                                                    {item.discount > 0 ? (
                                                        <>
                                                            <span className={`${rvStyles.rvPrice}`}>{(parseFloat(item.price) * (1 - item.discount / 100)).toFixed(2)} <small>EGP</small></span>
                                                            <span className={`${rvStyles.rvOriginalPrice}`}>{parseFloat(item.price).toFixed(2)} <small>EGP</small></span>
                                                        </>
                                                    ) : (
                                                        <span className={`${rvStyles.rvPrice}`}>{parseFloat(item.price || 0).toFixed(2)} <small>EGP</small></span>
                                                    )}
                                                </div>
                                                <button
                                                    className={`${rvStyles.rvAddToCartBtn}`}
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
                <div className={`${rvStyles.rvModalOverlay} ${rvStyles.active}`} onClick={closeRecModal}>
                    <div className={`${rvStyles.rvModalContent}`} onClick={(e) => e.stopPropagation()}>
                        <button className={`${rvStyles.rvModalClose}`} onClick={closeRecModal}>×</button>
                        <div className={`${rvStyles.rvModalImageWrapper}`}>
                            <button 
                                className={`${rvStyles.rvModalFavoriteBtn}`}
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
                            <img src={cleanImageUrl((getImages(selectedRecProduct.image || selectedRecProduct.images))[0])} alt={getProductField(selectedRecProduct, 'title')} />
                        </div>
                        <div className={`${rvStyles.rvModalDetails}`}>
                            <h2>{getProductField(selectedRecProduct, 'title')}</h2>
                            <p className={`${rvStyles.rvModalDescription}`}>{getProductField(selectedRecProduct, 'description')}</p>
                            <div className="rv-modal-rating">
                                <span className={`${rvStyles.rvStars}`}>
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} fill={i < Math.round(selectedRecProduct.rating?.average || selectedRecProduct.rating || 5) ? "#fbbf24" : "none"} color={i < Math.round(selectedRecProduct.rating?.average || selectedRecProduct.rating || 5) ? "#fbbf24" : "#d1d5db"} />
                                    ))}
                                </span>
                                <span className={`${rvStyles.rvRatingValue}`}>
                                    {Number(selectedRecProduct.rating?.average || selectedRecProduct.rating || 5).toFixed(1)}
                                </span>
                            </div>
                            {/* Modal Stock Indicator */}
                            {typeof selectedRecProduct.stock === 'number' && selectedRecProduct.stock > 0 && selectedRecProduct.stock < 10 && (
                                <div className="rv-modal-stock-warning" style={{ color: '#d97706', fontWeight: '600', marginBottom: '12px', fontSize: '0.9rem' }}>
                                    {t('homePage.prodLeftOnly', { count: selectedRecProduct.stock }) || `Only ${selectedRecProduct.stock} left!`}
                                </div>
                            )}
                            <div className={`${rvStyles.rvModalPriceSection}`}>
                                {selectedRecProduct.discount > 0 ? (
                                    <>
                                        <span className={`${rvStyles.rvModalPrice}`}>{(parseFloat(selectedRecProduct.price) * (1 - selectedRecProduct.discount / 100)).toFixed(2)} <small>EGP</small></span>
                                        <span className={`${rvStyles.rvModalOriginalPrice}`}>{parseFloat(selectedRecProduct.price).toFixed(2)} <small>EGP</small></span>
                                        <span className={`${rvStyles.rvModalDiscountBadge}`}>-{selectedRecProduct.discount}% OFF</span>
                                    </>
                                ) : (
                                    <span className={`${rvStyles.rvModalPrice}`}>{parseFloat(selectedRecProduct.price || 0).toFixed(2)} <small>EGP</small></span>
                                )}
                            </div>
                            <button
                                className={`${rvStyles.rvModalAddToCart}`}
                                onClick={(e) => {
                                    addToCart(selectedRecProduct, 1);
                                    closeRecModal();
                                    setShowToast(true);
                                    setTimeout(() => setShowToast(false), 2000);
                                }}
                                disabled={typeof selectedRecProduct.stock === 'number' && selectedRecProduct.stock <= 0}
                                style={typeof selectedRecProduct.stock === 'number' && selectedRecProduct.stock <= 0 ? { opacity: 0.5, cursor: 'not-allowed' } : { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            >
                                {typeof selectedRecProduct.stock === 'number' && selectedRecProduct.stock <= 0 ? t('homePage.prodOutOfStock') || 'Out of Stock' : <><ShoppingBag size={20} /> {t('productDetail.addToCart')}</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Recently Viewed Strip */}
            <RecentlyViewed products={recentlyViewed} currentProductId={product?.id} />

            {/* Lightbox Overlay */}
            {isLightboxOpen && (
                <div className={`${styles.lightboxOverlay}`} onClick={() => setIsLightboxOpen(false)}>
                    <button className={`${styles.lbClose}`} onClick={() => setIsLightboxOpen(false)}>
                        <X size={32} />
                    </button>
                    
                    {images.length > 1 && (
                        <>
                            <button 
                                className={`${styles.lbNavBtn} ${styles.lbPrev}`} 
                                onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                            >
                                <ChevronLeft size={48} />
                            </button>
                            <button 
                                className={`${styles.lbNavBtn} ${styles.lbNext}`} 
                                onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                            >
                                <ChevronRight size={48} />
                            </button>
                        </>
                    )}

                    <div className={`${styles.lbContent}`} onClick={e => e.stopPropagation()}>
                        <img src={images[currentImageIndex]} alt="Product Large View" />
                        <div className={`${styles.lbCaption}`}>
                            {product.title} - {t('productDetail.imageOf', { current: currentImageIndex + 1, total: images.length })}
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {showToast && (
                <div className={`${styles.shareToast}`}>
                    <CheckCircle size={20} />
                    <span>{t('productDetail.linkCopied')}</span>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
