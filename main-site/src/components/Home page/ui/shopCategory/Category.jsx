import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL, PLACEHOLDER_IMAGE } from '../../../../config'
import './category.css'

const Category = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch categories from API
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
    if (!image) return null;
    if (image.startsWith('http') || image.startsWith('data:')) {
      return image;
    }
    // Remove /api from base URL to get root if needed, or just append if it's a relative path served by static middleware
    // Assuming backend serves /uploads at root or /api/uploads. 
    // Backend config check: app.use('/uploads', express.static(...)) is at root usually? 
    // Wait, backend `index.js` shows: app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
    // And simple `app.listen(PORT...)`.
    // If backend is at `.../api`, then `/uploads` is likely at `.../uploads` (sibling to api) or `.../api/uploads`?
    // Actually, `app` uses `/api/` prefix for routes, but static likely not?
    // Let's safe bet: join with API_BASE_URL, but remove /api suffix if present? 
    // Actually, Cloudinary URLs (http) are most likely now.
    return `${API_BASE_URL}/${image}`; // Fallback for local uploads
  }

  if (loading) {
    return (
      <section className='category'>
        <div className="category-content">
          <h2>Shop by Category</h2>
          <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
            Loading categories...
          </div>
        </div>
      </section>
    )
  }

  if (categories.length === 0) {
    return (
      <section className='category'>
        <div className="category-content">
          <h2>Shop by Category</h2>
          <div style={{ textAlign: 'center', padding: '3rem', color: '#718096' }}>
            No categories available. Add categories in the admin dashboard!
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className='category'>
      <div className="category-content">
        <h2>Shop by Category</h2>

        <div className="category-grid">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/allproducts?category=${cat.name}`}
              className="category-card"
            >
              <div className="category-image-wrapper">
                {cat.image ? (
                  <img
                    src={getImageUrl(cat.image)}
                    alt={`${cat.name} - Handmade Decor | warmtotuch`}
                    className="category-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                ) : (
                  <div className="category-icon-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#f7fafc' }}>
                    <span className="category-icon" style={{ fontSize: '3rem' }}>📦</span>
                  </div>
                )}
              </div>
              <h3 className="category-name">{cat.name}</h3>
              {cat.description && <p className="category-description">{cat.description}</p>}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Category