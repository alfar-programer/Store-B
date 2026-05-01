import React, { useState, useMemo, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Heart, ArrowUpDown } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useFavorites } from '../../context/FavoritesContext'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'
import { API_BASE_URL, PLACEHOLDER_IMAGE } from '../../config'
import './allproducts.css'
import './allproducts-loading.css'

const ITEMS_PER_PAGE = 12

const AllProducts = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const categoryParam = searchParams.get('category')
    const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'All')
    const [sortOrder, setSortOrder] = useState('default')
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
    const { addToCart } = useCart()
    const { toggleFavorite, isFavorite } = useFavorites()

    const fetchProducts = async () => {
        try {
            setError(null)
            const response = await api.products.getAll('?limit=1000')
            if (response.ok) {
                const body = await response.json()
                // Backend returns paginated: { success, data: [...], pagination }
                // Fallback handles legacy plain-array responses
                const productsArray = Array.isArray(body) ? body : (body?.data ?? [])
                setProducts(productsArray)
            } else {
                console.error('Failed to fetch products')
                setError('Failed to load products. Please try again later.')
            }
            setLoading(false)
        } catch (error) {
            console.error('Error fetching products:', error)
            setError('Unable to connect to the server. Please check your connection.')
            setLoading(false)
        }
    }

    // Fetch products from backend API
    useEffect(() => {
        fetchProducts()
    }, [])

    const parseImage = (imageField) => {
        if (!imageField) return PLACEHOLDER_IMAGE

        let imageUrl = imageField

        try {
            // Check if it's a JSON string array
            if (typeof imageField === 'string' && (imageField.startsWith('[') || imageField.startsWith('{'))) {
                const parsed = JSON.parse(imageField)
                if (Array.isArray(parsed) && parsed.length > 0) {
                    imageUrl = parsed[0]
                }
            }
        } catch (e) {
            // If parsing fails, treat as simple string
            console.warn('Image parsing error, using raw value:', e)
        }

        // Handle relative paths
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
            // Remove /api from base URL to get root
            const rootUrl = API_BASE_URL.replace('/api', '')
            // Ensure no double slashes
            const cleanRoot = rootUrl.endsWith('/') ? rootUrl.slice(0, -1) : rootUrl
            const cleanPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl
            return `${cleanRoot}/${cleanPath}`
        }

        return imageUrl || PLACEHOLDER_IMAGE
    }

    // Update selected category when URL parameter changes
    useEffect(() => {
        if (categoryParam) {
            setSelectedCategory(categoryParam)
        }
    }, [categoryParam])

    // Extract unique categories from products
    const categories = useMemo(() => {
        const uniqueCategories = [...new Set(products.map(product => product.category))]
        return uniqueCategories.sort()
    }, [products])

    // Filter products based on selected category
    const filteredProducts = useMemo(() => {
        let result = selectedCategory === 'All'
            ? products
            : products.filter(product => product.category === selectedCategory)

        switch (sortOrder) {
            case 'price-asc':
                return [...result].sort((a, b) => parseFloat(a.price) * (1 - a.discount / 100) - parseFloat(b.price) * (1 - b.discount / 100))
            case 'price-desc':
                return [...result].sort((a, b) => parseFloat(b.price) * (1 - b.discount / 100) - parseFloat(a.price) * (1 - a.discount / 100))
            case 'newest':
                return [...result].sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0))
            case 'discount':
                return [...result].sort((a, b) => (b.discount || 0) - (a.discount || 0))
            default:
                return result
        }
    }, [selectedCategory, products, sortOrder])

    // Visible products slice for Load More
    const visibleProducts = useMemo(() => filteredProducts.slice(0, visibleCount), [filteredProducts, visibleCount])
    const hasMore = visibleCount < filteredProducts.length

    // Helper to get all images
    const getImages = (imageField) => {
        if (!imageField) return [PLACEHOLDER_IMAGE];

        try {
            if (typeof imageField === 'string' && (imageField.startsWith('[') || imageField.startsWith('{'))) {
                const parsed = JSON.parse(imageField)
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed.map(img => {
                        if (!img) return PLACEHOLDER_IMAGE;
                        if (img.startsWith('http') || img.startsWith('data:')) return img;
                        const rootUrl = API_BASE_URL.replace('/api', '')
                        const cleanRoot = rootUrl.endsWith('/') ? rootUrl.slice(0, -1) : rootUrl
                        const cleanPath = img.startsWith('/') ? img.slice(1) : img
                        return `${cleanRoot}/${cleanPath}`
                    });
                }
            }
        } catch (e) {
            console.warn('Image parsing error', e)
        }

        // Single image fallback
        let imageUrl = imageField;
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
            const rootUrl = API_BASE_URL.replace('/api', '')
            const cleanRoot = rootUrl.endsWith('/') ? rootUrl.slice(0, -1) : rootUrl
            const cleanPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl
            imageUrl = `${cleanRoot}/${cleanPath}`
        }
        return [imageUrl || PLACEHOLDER_IMAGE];
    }

    const [modalImages, setModalImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleQuickView = (e, product) => {
        if(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setSelectedProduct(product)
        const images = getImages(product.image);
        setModalImages(images);
        setCurrentImageIndex(0);
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setTimeout(() => {
            setSelectedProduct(null)
            setModalImages([])
            setCurrentImageIndex(0)
        }, 3000) // Delay to allow fade-out animation
    }

const handleAddToCart = (e, product) => {
    if (e) {
        e.preventDefault()
        e.stopPropagation()
    }

    // Guard: don't add if out of stock
    if (typeof product.stock === 'number' && product.stock <= 0) return

    addToCart(product)

    const button = e.currentTarget
    const originalText = button.textContent

    button.textContent = '✓ تمت الإضافة!'
    button.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)'

    setTimeout(() => {
        button.textContent = originalText
        button.style.background = ''
    }, 2000)
}

    const handleCategoryChange = (category) => {
        setSelectedCategory(category)
        setVisibleCount(ITEMS_PER_PAGE) // reset pagination on category change
        // Update URL with category parameter
        if (category === 'All') {
            navigate('/allproducts')
        } else {
            navigate(`/allproducts?category=${encodeURIComponent(category)}`)
        }
    }

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + ITEMS_PER_PAGE)
    }

    const getSEO = () => {
        const baseTitle = " | Warm Touch";
        switch (selectedCategory) {
            case 'Macrame':
                return {
                    title: `Handmade Macrame Wall Hangings | مكرميه يدوي${baseTitle}`,
                    description: "Discover beautiful, handcrafted macrame wall hangings and boho decor. مكرميه يدوي بجودة عالية لديكور منزلك."
                };
            case 'Ramadan':
                return {
                    title: `Ramadan 2026 Decorations & Lanterns Egypt | زينة رمضان${baseTitle}`,
                    description: "Celebrate with our exclusive Ramadan decor collection. تسوقي أحدث زينة رمضان، فوانيس ومفارش طاولة مميزة."
                };
            case 'Mugs':
                return {
                    title: `Unique Coffee Mugs & Ceramic Gifts | ماجات مميزة${baseTitle}`,
                    description: "Personalized and artistic coffee mugs for your morning brew. ماجات قهوة سيراميك مميزة بتصاميم فنية."
                };
            case 'Home Decor':
                return {
                    title: `Premium Home Decor & Accessories | ديكور منزلي${baseTitle}`,
                    description: "Shop quality home decor accessories at Warm Touch. أرقى قطع الديكور المنزلي لتجميل مساحتك الخاصة."
                };
            default:
                return {
                    title: `All Products - Handmade Decor & Gifts | كل المنتجات${baseTitle}`,
                    description: "Browse our full collection of handmade macrame, mugs, and home decor at Warm Touch. كل ما تحتاجه من ديكورات يدوية وهدايا."
                };
        }
    };

    const seo = getSEO();

    return (
        <section className="products-section">
            <Helmet>
                <title>{seo.title}</title>
                <meta name="description" content={seo.description} />
                <link rel="canonical" href={`https://www.warmtotuch.store/allproducts${selectedCategory !== 'All' ? `?category=${encodeURIComponent(selectedCategory)}` : ''}`} />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            {
                                "@type": "ListItem",
                                "position": 1,
                                "name": "Home",
                                "item": "https://www.warmtotuch.store/"
                            },
                            {
                                "@type": "ListItem",
                                "position": 2,
                                "name": "Products",
                                "item": "https://www.warmtotuch.store/allproducts"
                            },
                            ...(selectedCategory !== 'All' ? [{
                                "@type": "ListItem",
                                "position": 3,
                                "name": selectedCategory,
                                "item": `https://www.warmtotuch.store/allproducts?category=${encodeURIComponent(selectedCategory)}`
                            }] : [])
                        ]
                    })}
                </script>
                {selectedProduct && (
                    <script type="application/ld+json">
                        {JSON.stringify({
                            "@context": "https://schema.org/",
                            "@type": "Product",
                            "name": selectedProduct.title,
                            "image": getImages(selectedProduct.image),
                            "description": selectedProduct.description,
                            "brand": {
                                "@type": "Brand",
                                "name": "Warm Touch"
                            },
                            "offers": {
                                "@type": "Offer",
                                "url": `https://www.warmtotuch.store/allproducts?category=${encodeURIComponent(selectedProduct.category)}`,
                                "priceCurrency": "EGP",
                                "price": (parseFloat(selectedProduct.price) * (1 - selectedProduct.discount / 100)).toFixed(2),
                                "availability": "https://schema.org/InStock"
                            }
                        })}
                    </script>
                )}
            </Helmet>
            <div className="products-container">
                {loading ? (
                    <div className="skeleton-grid">
                        {[...Array(8)].map((_, index) => (
                            <div key={index} className="skeleton-card">
                                <div className="skeleton-image"></div>
                                <div className="skeleton-content">
                                    <div className="skeleton-title skeleton-line"></div>
                                    <div className="skeleton-desc skeleton-line"></div>
                                    <div className="skeleton-desc-short skeleton-line"></div>
                                    <div className="skeleton-rating skeleton-line"></div>
                                </div>
                                <div className="skeleton-footer">
                                    <div className="skeleton-price"></div>
                                    <div className="skeleton-btn"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="error-state" style={{ textAlign: 'center', padding: '2rem', color: '#e53e3e' }}>
                        <h3>Oops! Something went wrong.</h3>
                        <p>{error}</p>
                        <button
                            onClick={fetchProducts}
                            style={{
                                marginTop: '1rem',
                                padding: '0.5rem 1rem',
                                background: '#3182ce',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="products-header">
                            <h2>All Products</h2>
                            <p>Discover our handpicked selection of items</p>
                        </div>

                        {/* Category Navigation */}
                        <div className="category-nav">
                            <button
                                className={`category-btn ${selectedCategory === 'All' ? 'active' : ''}`}
                                onClick={() => handleCategoryChange('All')}
                            >
                                All
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                                    onClick={() => handleCategoryChange(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        {/* Sort Toolbar */}
                        <div className="sort-toolbar">
                            <span className="sort-count">{filteredProducts.length} منتج</span>
                            <div className="sort-select-wrapper">
                                <ArrowUpDown size={16} className="sort-icon" />
                                <select
                                    id="sort-order"
                                    className="sort-select"
                                    value={sortOrder}
                                    onChange={(e) => { setSortOrder(e.target.value); setVisibleCount(ITEMS_PER_PAGE) }}
                                >
                                    <option value="default">الترتيب الافتراضي</option>
                                    <option value="newest">الأحدث أولاً</option>
                                    <option value="price-asc">السعر: من الأقل للأعلى</option>
                                    <option value="price-desc">السعر: من الأعلى للأقل</option>
                                    <option value="discount">أعلى خصم</option>
                                </select>
                            </div>
                        </div>

                        <div className="products-grid">
                            {visibleProducts.map((product) => (
                                <Link to={`/product/${product.id}`} className="product-card" key={product.id} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}>
                                    {product.discount > 0 && (
                                        <div className="discount-badge">-{product.discount}%</div>
                                    )}
                                    <div className="product-image-wrapper">
                                        <img src={parseImage(product.image)} alt={product.title} />
                                        <button 
                                            className="favorite-btn"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                toggleFavorite(product);
                                            }}
                                            style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                background: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                padding: '8px',
                                                cursor: 'pointer',
                                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                zIndex: 2,
                                                transition: 'transform 0.2s ease, color 0.2s ease'
                                            }}
                                        >
                                            <Heart 
                                                size={20} 
                                                fill={isFavorite(product.id) ? '#ef4444' : 'none'} 
                                                color={isFavorite(product.id) ? '#ef4444' : '#6b7280'}
                                            />
                                        </button>
                                        <div className="product-overlay">
                                            <button
                                                className="quick-view-btn"
                                                onClick={(e) => handleQuickView(e, product)}
                                            >
                                            عرض سريع
                                            </button>
                                        </div>
                                    </div>
                                    <div className="product-info">
                                        <h3>{product.title}</h3>
                                        <p className="product-description">{product.description}</p>
                                        <div className="product-rating">
                                            <span className="stars">★★★★★</span>
                                            <span className="rating-value">{product.rating}</span>
                                        </div>
                                    </div>
                                    <div className="product-footer">
                                        <div className="price-wrapper">
                                            {product.discount > 0 ? (
                                                <>
                                                    <span className="price">{(parseFloat(product.price) * (1 - product.discount / 100)).toFixed(2)} EGP</span>
                                                    <span className="original-price">{parseFloat(product.price).toFixed(2)} EGP</span>
                                                </>
                                            ) : (
                                                <span className="price">{parseFloat(product.price).toFixed(2)} EGP</span>
                                            )}
                                        </div>
                                        {/* Stock indicator */}
                                        {typeof product.stock === 'number' && product.stock > 0 && product.stock < 10 && (
                                            <span style={{ fontSize: '0.7rem', color: '#d97706', fontWeight: '600', marginBottom: '4px', display: 'block' }}>
                                                باقي {product.stock} فقط!
                                            </span>
                                        )}
                                        <button
                                            className="add-to-cart-btn"
                                            disabled={typeof product.stock === 'number' && product.stock <= 0}
                                            style={typeof product.stock === 'number' && product.stock <= 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                            onClick={(e) => handleAddToCart(e, product)}
                                        >
                                            {typeof product.stock === 'number' && product.stock <= 0 ? 'نفذت الكمية' : 'أضف للسلة'}
                                        </button>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Load More */}
                        {hasMore && (
                            <div className="load-more-wrapper">
                                <button className="load-more-btn" onClick={handleLoadMore}>
                                    عرض المزيد
                                    <span className="load-more-count">({filteredProducts.length - visibleCount} منتج إضافي)</span>
                                </button>
                            </div>
                        )}
                        {!hasMore && filteredProducts.length > ITEMS_PER_PAGE && (
                            <p className="all-loaded-msg">✓ تم عرض جميع المنتجات</p>
                        )}

                        {/* Quick View Modal */}
                        {isModalOpen && selectedProduct && (
                            <div className={`modal-overlay ${isModalOpen ? 'active' : ''}`} onClick={closeModal}>
                                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                    <button className="modal-close" onClick={closeModal}>×</button>
                                    <div className="modal-image-wrapper" style={{ position: 'relative' }}>
                                        <button 
                                            className="favorite-btn"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                toggleFavorite(selectedProduct);
                                            }}
                                            style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                background: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                padding: '10px',
                                                cursor: 'pointer',
                                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                zIndex: 10,
                                                transition: 'transform 0.2s ease'
                                            }}
                                        >
                                            <Heart 
                                                size={24} 
                                                fill={isFavorite(selectedProduct.id) ? '#ef4444' : 'none'} 
                                                color={isFavorite(selectedProduct.id) ? '#ef4444' : '#6b7280'}
                                            />
                                        </button>
                                        <div className="modal-gallery-container">
                                            <div className="modal-main-image">
                                                <img
                                                    src={modalImages[currentImageIndex] || parseImage(selectedProduct.image)}
                                                    alt={selectedProduct.title}
                                                />
                                            </div>

                                            {/* Image Gallery Thumbnails */}
                                            {modalImages.length > 1 && (
                                                <div className="modal-thumbnails-track">
                                                    {modalImages.map((img, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`gallery-thumbnail ${currentImageIndex === idx ? 'active' : ''}`}
                                                            onClick={() => setCurrentImageIndex(idx)}
                                                        >
                                                            <img
                                                                src={img}
                                                                alt={`Thumbnail ${idx}`}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="modal-details">
                                        <h2>{selectedProduct.title}</h2>
                                        <p className="modal-description">{selectedProduct.description}</p>
                                        <div className="modal-rating">
                                            <span className="stars">★★★★★</span>
                                            <span className="rating-value">{selectedProduct.rating}</span>
                                        </div>
                                        <div className="modal-price-section">
                                            {selectedProduct.discount > 0 ? (
                                                <>
                                                    <span className="modal-price">{(parseFloat(selectedProduct.price) * (1 - selectedProduct.discount / 100)).toFixed(2)} <small>EGP</small></span>
                                                    <span className="modal-original-price">{parseFloat(selectedProduct.price).toFixed(2)} <small>EGP</small></span>
                                                    <span className="modal-discount-badge">-{selectedProduct.discount}% OFF</span>
                                                </>
                                            ) : (
                                                <span className="modal-price">{parseFloat(selectedProduct.price).toFixed(2)} <small>EGP</small></span>
                                            )}
                                        </div>
                                        <button
                                            className="modal-add-to-cart"
                                            onClick={(e) => {
                                                handleAddToCart(selectedProduct, e)
                                                closeModal()
                                            }}
                                        >
                                            أضف للسلة
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    )
}

export default AllProducts
