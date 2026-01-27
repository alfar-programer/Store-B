
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useCart } from '../../../../context/CartContext'
import { API_BASE_URL, PLACEHOLDER_IMAGE } from '../../../../config'
import './products.css'

const Products = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { addToCart } = useCart()

    useEffect(() => {
        fetchFeaturedProducts()
    }, [])

    const fetchFeaturedProducts = async () => {
        try {
            const response = await axios.get('https://store-b-backend-production.up.railway.app/api/products/featured')
            setProducts(response.data)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching featured products:', error)
            setLoading(false)
        }
    }

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

    const handleQuickView = (product) => {
        setSelectedProduct(product)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setTimeout(() => setSelectedProduct(null), 300) // Delay to allow fade-out animation
    }

    const handleAddToCart = (product) => {
        addToCart(product)
        // Optional: Show a success message or animation
        const button = event.target
        const originalText = button.textContent
        button.textContent = '✓ Added!'
        button.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)'

        setTimeout(() => {
            button.textContent = originalText
            button.style.background = ''
        }, 2000)
    }

    return (
        <section className="products-section">
            <div className="products-container">
                <div className="products-header">
                    <h2>Featured Products</h2>
                    <p>Discover our handpicked selection of premium items</p>
                </div>
                <div className="products-grid">
                    {loading ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#718096' }}>
                            Loading featured products...
                        </div>
                    ) : products.length === 0 ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#718096' }}>
                            No featured products available. Add products in the dashboard and mark them as featured!
                        </div>
                    ) : (
                        products.map((product) => (
                            <div className="product-card" key={product.id}>
                                {product.discount > 0 && (
                                    <div className="discount-badge">-{product.discount}%</div>
                                )}
                                <div className="product-image-wrapper">
                                    <img src={parseImage(product.image)} alt={product.title} />
                                    <div className="product-overlay">
                                        <button
                                            className="quick-view-btn"
                                            onClick={() => handleQuickView(product)}
                                        >
                                            Quick View
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
                                                <span className="price">{(parseFloat(product.price) * (1 - product.discount / 100)).toFixed(2)} <small>EGP</small></span>
                                                <span className="original-price">{parseFloat(product.price).toFixed(2)} <small>EGP</small></span>
                                            </>
                                        ) : (
                                            <span className="price">{parseFloat(product.price).toFixed(2)} <small>EGP</small></span>
                                        )}
                                    </div>
                                    <button
                                        className="add-to-cart-btn"
                                        onClick={() => handleAddToCart(product)}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>

            {/* Quick View Modal */}
            {isModalOpen && selectedProduct && (
                <div className={`modal-overlay ${isModalOpen ? 'active' : ''}`} onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeModal}>×</button>
                        <div className="modal-image-wrapper">
                            <img src={parseImage(selectedProduct.image)} alt={selectedProduct.title} />
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
                                onClick={() => {
                                    handleAddToCart(selectedProduct)
                                    closeModal()
                                }}
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}

export default Products
