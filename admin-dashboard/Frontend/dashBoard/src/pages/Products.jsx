import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Package, Upload, Edit, Trash2, X, Check } from 'lucide-react'
import './Products.css'

const Products = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        discount: 0,
        rating: 4.5,
        image: null,
        isFeatured: false
    })
    const [notification, setNotification] = useState({ show: false, message: '', type: '' })

    const categories = ['Electronics', 'Fashion & Apparel', 'Home & Garden', 'Sports & Outdoors', 'Beauty & Personal Care', 'Books & Media', 'Toys & Games', 'Food & Beverages']

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/products')
            setProducts(response.data)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching products:', error)
            showNotification('Error fetching products', 'error')
            setLoading(false)
        }
    }

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type })
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' })
        }, 3000)
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file
            }))

            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.currentTarget.classList.add('drag-over')
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        e.currentTarget.classList.remove('drag-over')
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.currentTarget.classList.remove('drag-over')

        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith('image/')) {
            setFormData(prev => ({
                ...prev,
                image: file
            }))

            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            price: '',
            category: '',
            discount: 0,
            rating: 4.5,
            image: null,
            isFeatured: false
        })
        setImagePreview(null)
        setEditingProduct(null)
        setShowForm(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.image && !editingProduct) {
            showNotification('Please select an image', 'error')
            return
        }

        const data = new FormData()
        data.append('title', formData.title)
        data.append('description', formData.description)
        data.append('price', formData.price)
        data.append('category', formData.category)
        data.append('discount', formData.discount)
        data.append('rating', formData.rating)
        data.append('isFeatured', formData.isFeatured)

        if (formData.image) {
            data.append('image', formData.image)
        }

        try {
            if (editingProduct) {
                await axios.put(`http://localhost:5000/api/products/${editingProduct.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                showNotification('Product updated successfully!', 'success')
            } else {
                await axios.post('http://localhost:5000/api/products', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                showNotification('Product created successfully!', 'success')
            }

            fetchProducts()
            resetForm()
        } catch (error) {
            console.error('Error saving product:', error)
            showNotification('Error saving product', 'error')
        }
    }

    const handleEdit = (product) => {
        setEditingProduct(product)
        setFormData({
            title: product.title,
            description: product.description,
            price: product.price,
            category: product.category,
            discount: product.discount,
            rating: product.rating,
            image: null,
            isFeatured: product.isFeatured || false
        })
        setImagePreview(product.image)
        setShowForm(true)
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`http://localhost:5000/api/products/${id}`)
                showNotification('Product deleted successfully!', 'success')
                fetchProducts()
            } catch (error) {
                console.error('Error deleting product:', error)
                showNotification('Error deleting product', 'error')
            }
        }
    }

    if (loading) {
        return <div className="products-loading">Loading products...</div>
    }

    return (
        <div className="products-page">
            {/* Notification */}
            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    {notification.type === 'success' ? <Check size={20} /> : <X size={20} />}
                    {notification.message}
                </div>
            )}

            {/* Header */}
            <div className="products-header">
                <div>
                    <h1>Products Management</h1>
                    <p>Manage your product inventory</p>
                </div>
                <button
                    className="add-product-btn"
                    onClick={() => setShowForm(!showForm)}
                >
                    <Package size={20} />
                    {showForm ? 'Cancel' : 'Add Product'}
                </button>
            </div>

            {/* Product Form */}
            {showForm && (
                <div className="product-form-container">
                    <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                    <form onSubmit={handleSubmit} className="product-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Product title"
                                />
                            </div>

                            <div className="form-group">
                                <label>Category *</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select category</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Price *</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="form-group">
                                <label>Discount (%)</label>
                                <input
                                    type="number"
                                    name="discount"
                                    value={formData.discount}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="100"
                                    placeholder="0"
                                />
                            </div>

                            <div className="form-group">
                                <label>Rating</label>
                                <input
                                    type="number"
                                    name="rating"
                                    value={formData.rating}
                                    onChange={handleInputChange}
                                    step="0.1"
                                    min="0"
                                    max="5"
                                    placeholder="4.5"
                                />
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="isFeatured"
                                        checked={formData.isFeatured}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                                    />
                                    <span>⭐ Featured Product (Show on home page)</span>
                                </label>
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label>Description *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                rows="4"
                                placeholder="Product description"
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Product Image *</label>
                            <div
                                className="image-upload-area"
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                {imagePreview ? (
                                    <div className="image-preview">
                                        <img src={imagePreview} alt="Preview" />
                                        <button
                                            type="button"
                                            className="remove-image-btn"
                                            onClick={() => {
                                                setImagePreview(null)
                                                setFormData(prev => ({ ...prev, image: null }))
                                            }}
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="upload-placeholder">
                                        <Upload size={48} />
                                        <p>Drag & drop an image here or click to browse</p>
                                        <span>Supported formats: JPG, PNG, GIF, WEBP (Max 5MB)</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="file-input"
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" onClick={resetForm} className="cancel-btn">
                                Cancel
                            </button>
                            <button type="submit" className="submit-btn">
                                {editingProduct ? 'Update Product' : 'Create Product'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Products List */}
            <div className="products-list">
                <h2>All Products ({products.length})</h2>
                {products.length === 0 ? (
                    <div className="empty-state">
                        <Package size={64} />
                        <p>No products yet. Add your first product to get started!</p>
                    </div>
                ) : (
                    <div className="products-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Discount</th>
                                    <th>Rating</th>
                                    <th>Featured</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product.id}>
                                        <td>
                                            <img
                                                src={product.image}
                                                alt={product.title}
                                                className="product-thumbnail"
                                            />
                                        </td>
                                        <td className="product-title">{product.title}</td>
                                        <td>{product.category}</td>
                                        <td className="product-price">${parseFloat(product.price).toFixed(2)}</td>
                                        <td>{product.discount}%</td>
                                        <td>
                                            <span className="rating-badge">★ {product.rating}</span>
                                        </td>
                                        <td>
                                            {product.isFeatured ? (
                                                <span className="featured-badge">⭐ Featured</span>
                                            ) : (
                                                <span className="not-featured">-</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => handleEdit(product)}
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => handleDelete(product.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Products
