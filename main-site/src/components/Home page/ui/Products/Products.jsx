
import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag } from 'lucide-react'
import { useCart } from '../../../../context/CartContext'
import { useFavorites } from '../../../../context/FavoritesContext'
import { useLanguage } from '../../../../context/LanguageContext'
import { useTranslation } from 'react-i18next'
import { API_BASE_URL, PLACEHOLDER_IMAGE } from '../../../../config'
import styles from './products.module.css'

const Products = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { addToCart } = useCart()
    const { toggleFavorite, isFavorite } = useFavorites()
    const { getProductField, lang } = useLanguage()
    const { t } = useTranslation()

    const fetchFeaturedProducts = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/products/featured`)
            const productsArray = Array.isArray(response.data)
                ? response.data
                : (response.data?.data ?? [])
            setProducts(productsArray)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching featured products:', error)
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchFeaturedProducts()
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
            console.warn('Image parsing error, using raw value:', e)
        }

        // Handle relative paths
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
            // For featured products we might need a more robust check if we don't have API_BASE_URL imported
            // But usually we can assume the configured API URL
            const rootUrl = API_BASE_URL.replace('/api', '')
            const cleanRoot = rootUrl.endsWith('/') ? rootUrl.slice(0, -1) : rootUrl
            const cleanPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl
            return `${cleanRoot}/${cleanPath}`
        }

        return imageUrl || PLACEHOLDER_IMAGE
    }

    // ... (quick view handlers)

    const handleQuickView = (e, product) => {
        if(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setSelectedProduct(product)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setTimeout(() => setSelectedProduct(null), 300) // Delay to allow fade-out animation
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
    const originalContent = button.innerHTML

    button.textContent = t('homePage.prodAdded')
    button.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)'
    button.style.width = 'auto'
    button.style.padding = '0 15px'

    setTimeout(() => {
        button.innerHTML = originalContent
        button.style.background = ''
        button.style.width = ''
        button.style.padding = ''
    }, 2000)
}

    return (
        <section className={`${styles.productsSection}`}>
            <Helmet>
                {selectedProduct && isModalOpen && (
                    <script type="application/ld+json">
                        {JSON.stringify({
                            "@context": "https://schema.org/",
                            "@type": "Product",
                            "name": selectedProduct.title,
                            "image": [parseImage(selectedProduct.image)],
                            "description": selectedProduct.description,
                            "brand": {
                                "@type": "Brand",
                                "name": "Warm Touch"
                            },
                            "offers": {
                                "@type": "Offer",
                                "url": "https://www.warmtotuch.store/",
                                "priceCurrency": "EGP",
                                "price": (parseFloat(selectedProduct.price) * (1 - selectedProduct.discount / 100)).toFixed(2),
                                "availability": "https://schema.org/InStock"
                            }
                        })}
                    </script>
                )}
            </Helmet>
            <div className={`${styles.productsContainer}`}>
                <div className={`${styles.productsHeader}`}>
                    <h2>{t('homePage.prodFeatured')}</h2>
                    <p>{t('homePage.prodFeaturedDesc')}</p>
                </div>
                <div className={`${styles.productsGrid}`}>
                    {loading ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#718096' }}>
                            {t('homePage.prodLoading')}
                        </div>
                    ) : products.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#718096' }}>
                            {t('homePage.prodEmpty')}
                        </div>
                    ) : (
                        products.map((product) => (
                            <Link to={`/product/${product.id}`} className={`${styles.productCard}`} key={product.id} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}>
                                {product.discount > 0 && (
                                    <div className={`${styles.discountBadge}`}>-{product.discount}%</div>
                                )}
                                <div className={`${styles.productImageWrapper}`}>
                                    <img src={parseImage(product.image)} alt={getProductField(product, 'title')} />
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
                                    <div className={`${styles.productOverlay}`}>
                                        <button
                                            className={`${styles.quickViewBtn}`}
                                            onClick={(e) => handleQuickView(e, product)}
                                        >
                                            {t('homePage.prodQuickView')}
                                        </button>
                                    </div>
                                </div>
                                    <div className={`${styles.productInfo}`}>
                                        <h3>{getProductField(product, 'title')}</h3>
                                        <p className={`${styles.productDescription}`}>{getProductField(product, 'description')}</p>
                                        <div className={`${styles.productRating}`}>
                                            <span className={`${styles.stars}`}>★★★★★</span>
                                            <span className={`${styles.ratingValue}`}>{product.rating}</span>
                                        </div>
                                        {/* Stock indicator - Moved here as requested */}
                                        {typeof product.stock === 'number' && product.stock > 0 && product.stock < 10 && (
                                            <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: '600', marginTop: '8px', display: 'block' }}>
                                                {t('homePage.prodLeftOnly', { count: product.stock })}
                                            </span>
                                        )}
                                    </div>
                                    <div className={`${styles.productFooter}`}>
                                        <div className={`${styles.priceWrapper}`}>
                                            {product.discount > 0 ? (
                                                <>
                                                    <span className={`${styles.price}`}>{(parseFloat(product.price) * (1 - product.discount / 100)).toFixed(2)} <small>EGP</small></span>
                                                    <span className={`${styles.originalPrice}`}>{parseFloat(product.price).toFixed(2)} <small>EGP</small></span>
                                                </>
                                            ) : (
                                                <span className={`${styles.price}`}>{parseFloat(product.price).toFixed(2)} <small>EGP</small></span>
                                            )}
                                        </div>
                                        <button
                                            className={`${styles.addToCartBtn}`}
                                            disabled={typeof product.stock === 'number' && product.stock <= 0}
                                            style={typeof product.stock === 'number' && product.stock <= 0 ? { opacity: 0.5, cursor: 'not-allowed' } : { display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            onClick={(e) => handleAddToCart(e, product)}
                                        >
                                            {typeof product.stock === 'number' && product.stock <= 0 ? t('homePage.prodOutOfStock') : <ShoppingBag size={20} />}
                                        </button>
                                    </div>
                            </Link>
                        ))
                    )}
                </div>

            </div>

            {/* Quick View Modal */}
            {isModalOpen && selectedProduct && (
                <div className={`${styles.modalOverlay} ${isModalOpen ? 'active' : ''}`} onClick={closeModal}>
                    <div className={`${styles.modalContent}`} onClick={(e) => e.stopPropagation()}>
                        <button className={`${styles.modalClose}`} onClick={closeModal}>×</button>
                        <div className={`${styles.modalImageWrapper}`} style={{ position: 'relative' }}>
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
                            <img src={parseImage(selectedProduct.image)} alt={selectedProduct.title} />
                        </div>
                        <div className={`${styles.modalDetails}`}>
                            <h2>{getProductField(selectedProduct, 'title')}</h2>
                            <p className={`${styles.modalDescription}`}>{getProductField(selectedProduct, 'description')}</p>
                            <div className={`${styles.modalRating}`}>
                                <span className={`${styles.stars}`}>★★★★★</span>
                                <span className={`${styles.ratingValue}`}>{selectedProduct.rating}</span>
                            </div>
                            {/* Stock indicator - Moved here */}
                            {typeof selectedProduct.stock === 'number' && selectedProduct.stock > 0 && selectedProduct.stock < 10 && (
                                <div className="modal-stock-warning" style={{ fontSize: '0.9rem', color: '#d97706', fontWeight: '600', marginBottom: '8px' }}>
                                    {t('homePage.prodLeftOnly', { count: selectedProduct.stock })}
                                </div>
                            )}
                            <div className={`${styles.modalPriceSection}`}>
                                {selectedProduct.discount > 0 ? (
                                    <>
                                        <span className={`${styles.modalPrice}`}>{(parseFloat(selectedProduct.price) * (1 - selectedProduct.discount / 100)).toFixed(2)} <small>EGP</small></span>
                                        <span className={`${styles.modalOriginalPrice}`}>{parseFloat(selectedProduct.price).toFixed(2)} <small>EGP</small></span>
                                        <span className={`${styles.modalDiscountBadge}`}>-{selectedProduct.discount}% OFF</span>
                                    </>
                                ) : (
                                    <span className={`${styles.modalPrice}`}>{parseFloat(selectedProduct.price).toFixed(2)} <small>EGP</small></span>
                                )}
                            </div>
                            <button
                                className={`${styles.modalAddToCart}`}
                                style={typeof selectedProduct.stock === 'number' && selectedProduct.stock <= 0 ? { opacity: 0.5, cursor: 'not-allowed' } : { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                onClick={(e) => {
                                    handleAddToCart(e, selectedProduct)
                                    closeModal()
                                }}
                            >
                                {typeof selectedProduct.stock === 'number' && selectedProduct.stock <= 0 ? t('homePage.prodOutOfStock') : <><ShoppingBag size={20} /> {t('homePage.prodAddToCart')}</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}

export default Products
