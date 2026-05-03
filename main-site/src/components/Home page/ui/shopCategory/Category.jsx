import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import axios from 'axios'
import { API_BASE_URL, PLACEHOLDER_IMAGE } from '../../../../config'
import './category.css'

const Category = () => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const scrollRef = useRef(null)

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/categories`)
            setCategories(response.data)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching categories:', error)
            setLoading(false)
        }
    }

    const getImageUrl = (image) => {
        if (!image) return null
        if (image.startsWith('http') || image.startsWith('data:')) return image
        return `${API_BASE_URL}/${image}`
    }

    const scroll = (dir) => {
        if (scrollRef.current) {
            const amount = 240
            scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
        }
    }

    if (loading) {
        return (
            <section className="categories-section">
                <div className="categories-container">
                    <div className="categories-header">
                        <span className="categories-eyebrow">SHOP BY CATEGORY</span>
                        <h2 className="categories-title">Find what speaks to your home</h2>
                    </div>
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        Loading categories...
                    </div>
                </div>
            </section>
        )
    }

    if (categories.length === 0) {
        return (
            <section className="categories-section">
                <div className="categories-container">
                    <div className="categories-header">
                        <span className="categories-eyebrow">SHOP BY CATEGORY</span>
                        <h2 className="categories-title">Find what speaks to your home</h2>
                    </div>
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No categories available.
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="categories-section">
            <div className="categories-container">
                {/* Header */}
                <div className="categories-header">
                    <span className="categories-eyebrow">SHOP BY CATEGORY</span>
                    <h2 className="categories-title">Find what speaks to your home</h2>
                </div>

                {/* Scroll Wrapper */}
                <div className="categories-wrapper">
                    <button className="cat-nav-btn cat-prev" onClick={() => scroll('left')} aria-label="Previous">
                        <ChevronLeft size={18} />
                    </button>

                    <div className="categories-scroll" ref={scrollRef}>
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                to={`/allproducts?category=${cat.name}`}
                                className="category-card-new"
                            >
                                <div className="cat-image-wrapper">
                                    {cat.image ? (
                                        <img
                                            src={getImageUrl(cat.image)}
                                            alt={`${cat.name} - Warm Touch`}
                                            className="cat-image"
                                            onError={(e) => {
                                                e.target.onerror = null
                                                e.target.src = PLACEHOLDER_IMAGE
                                            }}
                                        />
                                    ) : (
                                        <div className="image-placeholder"></div>
                                    )}
                                </div>
                                <div className="cat-info">
                                    <h3 className="cat-name">{cat.name}</h3>
                                    {cat.description && <p className="cat-count">{cat.description}</p>}
                                </div>
                            </Link>
                        ))}
                    </div>

                    <button className="cat-nav-btn cat-next" onClick={() => scroll('right')} aria-label="Next">
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </section>
    )
}

export default Category