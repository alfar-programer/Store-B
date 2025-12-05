import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import './category.css'


import CircularGallery from '../../../CircularGallery/CircularGallery'

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

  // Format items for CircularGallery
  const galleryItems = categories.map(cat => ({
    image: cat.image.startsWith('http') ? cat.image : `http://localhost:5000/${cat.image}`,
    text: cat.name
  }));

  return (
    <section className='category'>
      <div className="category-content">
        <h2>Shop by Category</h2>

        <div style={{ height: '600px', width: '100%', position: 'relative' }}>
          <CircularGallery
            items={galleryItems}
            bend={3}
            textColor="#000000"
            borderRadius={0.05}
          />
        </div>
      </div>
    </section>
  )
}

export default Category