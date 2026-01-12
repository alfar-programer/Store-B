import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
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
      const response = await axios.get('http://localhost:5000/api/categories')
      setCategories(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching categories:', error)
      setLoading(false)
    }
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
              key={cat._id}
              to={`/allproducts?category=${cat.name}`}
              className="category-card"
            >
              <div className="category-image-wrapper">
                <img
                  src={cat.image.startsWith('http') ? cat.image : `http://localhost:5000/${cat.image}`}
                  alt={cat.name}
                  className="category-image"
                />
              </div>
              <h3 className="category-name">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Category