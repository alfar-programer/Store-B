
import React, { useState, useMemo, useEffect } from 'react'
import { useCart } from '../../context/CartContext'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import './allproducts.css'

const AllProducts = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const categoryParam = searchParams.get('category')
    const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'All')
    const { addToCart } = useCart()

    // Fetch products from backend API
    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const response = await api.products.getAll()
            if (response.ok) {
                const data = await response.json()
                setProducts(data)
            } else {
                console.error('Failed to fetch products')
            }
            setLoading(false)
        } catch (error) {
            console.error('Error fetching products:', error)
            setLoading(false)
        }
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
        if (selectedCategory === 'All') {
            return products
        }
        return products.filter(product => product.category === selectedCategory)
    }, [selectedCategory, products])

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
        const button = event.target // Get the button element 
        const originalText = button.textContent
        button.textContent = '✓ Added!'
        button.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)'

        setTimeout(() => {
            button.textContent = originalText
            button.style.background = ''
        }, 2000)
    }

    const handleCategoryChange = (category) => {
        setSelectedCategory(category)
        // Update URL with category parameter
        if (category === 'All') {
            navigate('/allproducts')
        } else {
            navigate(`/allproducts?category=${encodeURIComponent(category)}`)
        }
    }

    return (
        <section className="products-section">
            <div className="products-container">
                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading products...</p>
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

                        <div className="products-grid">
                            {filteredProducts.map((product) => (
                                <div className="product-card" key={product.id}>
                                    {product.discount > 0 && (
                                        <div className="discount-badge">-{product.discount}%</div>
                                    )}
                                    <div className="product-image-wrapper">
                                        <img src={product.image} alt={product.title} />
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
                            ))}
                        </div>

                        {/* Quick View Modal */}
                        {isModalOpen && selectedProduct && (
                            <div className={`modal-overlay ${isModalOpen ? 'active' : ''}`} onClick={closeModal}>
                                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                    <button className="modal-close" onClick={closeModal}>×</button>
                                    <div className="modal-image-wrapper">
                                        <img src={selectedProduct.image} alt={selectedProduct.title} />
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
                    </>
                )}
            </div>
        </section>
    )
}

export default AllProducts
