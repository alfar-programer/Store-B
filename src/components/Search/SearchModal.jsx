import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSearch } from '../../context/SearchContext'
import { useCart } from '../../context/CartContext'
import './searchModal.css'

const SearchModal = () => {
    const { isSearchOpen, closeSearch } = useSearch()
    const [searchQuery, setSearchQuery] = useState('')
    const [products, setProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])
    const navigate = useNavigate()
    const { addToCart } = useCart()
    const inputRef = useRef(null)

    useEffect(() => {
        if (isSearchOpen) {
            fetchProducts()
            if (inputRef.current) {
                inputRef.current.focus()
            }
        }
    }, [isSearchOpen])

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/products')
            setProducts(response.data)
        } catch (error) {
            console.error('Error fetching products for search:', error)
        }
    }

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredProducts([])
            return
        }

        const query = searchQuery.toLowerCase()
        const filtered = products.filter(
            (product) =>
                product.title.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query)
        )
        setFilteredProducts(filtered)
    }, [searchQuery, products])

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Close on Escape
            if (e.key === 'Escape' && isSearchOpen) {
                closeSearch()
            }
            // Open on Ctrl+K or Cmd+K
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault()
                if (isSearchOpen) {
                    closeSearch()
                } else {
                    closeSearch()
                    setTimeout(() => {
                        const searchContext = useSearch()
                        searchContext.openSearch()
                    }, 0)
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isSearchOpen, closeSearch])

    const handleAddToCart = (product) => {
        addToCart(product)
        // Show success feedback
        const button = event.target
        const originalText = button.textContent
        button.textContent = '✓ Added!'
        button.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)'

        setTimeout(() => {
            button.textContent = originalText
            button.style.background = ''
        }, 2000)
    }

    const handleProductClick = () => {
        closeSearch()
        setSearchQuery('')
    }

    if (!isSearchOpen) return null

    return (
        <div className="search-modal-overlay" onClick={closeSearch}>
            <div className="search-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="search-modal-header">
                    <div className="search-input-wrapper">
                        <Search size={20} className="search-icon" />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        {searchQuery && (
                            <button
                                className="clear-search-btn"
                                onClick={() => setSearchQuery('')}
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                    <button className="close-search-modal" onClick={closeSearch}>
                        <X size={24} />
                    </button>
                </div>

                <div className="search-results">
                    {searchQuery.trim() === '' ? (
                        <div className="search-empty-state">
                            <Search size={48} strokeWidth={1.5} />
                            <p>Start typing to search products...</p>
                            <span className="search-hint">Press <kbd>Esc</kbd> to close</span>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="search-empty-state">
                            <Search size={48} strokeWidth={1.5} />
                            <p>No products found for "{searchQuery}"</p>
                            <span className="search-hint">Try different keywords</span>
                        </div>
                    ) : (
                        <div className="search-results-list">
                            <p className="results-count">
                                Found {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                            </p>
                            {filteredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="search-result-item"
                                    onClick={handleProductClick}
                                >
                                    <div className="search-result-image">
                                        <img src={product.image} alt={product.title} />
                                    </div>
                                    <div className="search-result-details">
                                        <h4>{product.title}</h4>
                                        <p>{product.description}</p>
                                        <div className="search-result-footer">
                                            <span className="search-result-price">{parseFloat(product.price).toFixed(2)} <small>EGP</small></span>
                                            {product.discount > 0 && (
                                                <span className="search-result-discount">-{product.discount}%</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        className="search-add-to-cart"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleAddToCart(product)
                                        }}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SearchModal
