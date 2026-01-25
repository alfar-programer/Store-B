import React, { useState, useEffect } from 'react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { CreditCard, MapPin, User, Mail, Phone, Lock, ArrowLeft, ShoppingBag } from 'lucide-react'
import { API_BASE_URL } from '../../config'
import { ordersAPI } from '../../services/api'
import CustomAlert from '../ui/Alert/CustomAlert'
import './checkout.css'

const Checkout = () => {
    const { cartItems, getCartTotal, clearCart } = useCart()
    const { user, loading } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login')
        }
    }, [user, loading, navigate])

    const [formData, setFormData] = useState({
        // Personal Information
        fullName: '',
        phone: '',

        // Shipping Address
        address: '',
        city: '',
        state: '',
        country: '',
    })

    const [errors, setErrors] = useState({})
    const [isProcessing, setIsProcessing] = useState(false)
    const [alert, setAlert] = useState(null)

    // Helper to parse product images
    const parseImage = (imageField) => {
        if (!imageField) return 'https://via.placeholder.com/300?text=No+Image'

        let imageUrl = imageField

        try {
            if (typeof imageField === 'string' && (imageField.startsWith('[') || imageField.startsWith('{'))) {
                const parsed = JSON.parse(imageField)
                if (Array.isArray(parsed) && parsed.length > 0) {
                    imageUrl = parsed[0]
                }
            }
        } catch (e) {
            console.warn('Image parsing error, using raw value:', e)
        }

        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
            const rootUrl = API_BASE_URL.replace('/api', '')
            const cleanRoot = rootUrl.endsWith('/') ? rootUrl.slice(0, -1) : rootUrl
            const cleanPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl
            return `${cleanRoot}/${cleanPath}`
        }

        return imageUrl || 'https://via.placeholder.com/300?text=No+Image'
    }

    const subtotal = getCartTotal()
    const shippingCost = subtotal < 500 ? 30 : 0
    const total = subtotal + shippingCost

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    // Validate form
    const validateForm = () => {
        const newErrors = {}

        // Personal Information
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required'
        } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
            newErrors.phone = 'Phone number is invalid'
        }

        // Shipping Address
        if (!formData.address.trim()) newErrors.address = 'Address is required'
        if (!formData.city.trim()) newErrors.city = 'City is required'
        if (!formData.state.trim()) newErrors.state = 'State is required'
        if (!formData.country.trim()) newErrors.country = 'Country is required'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsProcessing(true)

        try {
            const token = localStorage.getItem('token');
            const orderData = {
                customerName: formData.fullName,
                total: total,
                items: cartItems.map(item => ({
                    id: item.id,
                    title: item.title,
                    price: item.price,
                    quantity: item.quantity,
                    image: parseImage(item.image)
                })),
                userId: user ? user.id : null,
                shippingAddress: {
                    fullName: formData.fullName,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    country: formData.country,
                    phone: formData.phone
                }
            };

            const response = await ordersAPI.create(orderData, token);

            if (response.ok) {
                const result = await response.json();
                const newOrder = result.data || result;

                // Clear cart
                clearCart()

                // Navigate to My Orders page with success message
                navigate('/my-orders', { state: { orderSuccess: true } })
            } else {
                console.error('Order failed');
                setAlert({ message: 'Failed to place order. Please try again.', type: 'error' });
            }
        } catch (error) {
            console.error('Error placing order:', error);
            setAlert({ message: 'An error occurred. Please try again.', type: 'error' });
        } finally {
            setIsProcessing(false);
        }
    }

    if (cartItems.length === 0) {
        return (
            <div className="checkout-page">
                <div className="checkout-container">
                    <div className="empty-checkout">
                        <ShoppingBag size={80} strokeWidth={1.5} />
                        <h2>Your Cart is Empty</h2>
                        <p>Add some products before checking out!</p>
                        <button className="back-to-shop-btn" onClick={() => navigate('/allproducts')}>
                            <ArrowLeft size={20} />
                            Back to Shopping
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="checkout-page">
            <div className="checkout-container">
                <div className="checkout-header">
                    <h1>Checkout</h1>
                    <p>Complete your order</p>
                </div>

                <div className="checkout-content">
                    <form className="checkout-form" onSubmit={handleSubmit}>
                        {/* Personal Information Section */}
                        <div className="form-section">
                            <div className="section-header">
                                <User size={24} />
                                <h2>Personal Information</h2>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="fullName">Full Name *</label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className={errors.fullName ? 'error' : ''}
                                        placeholder="John Doe"
                                    />
                                    {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone">Phone Number *</label>
                                    <div className="input-with-icon">
                                        <Phone size={20} />
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className={errors.phone ? 'error' : ''}
                                            placeholder="+20 123 456 7890"
                                        />
                                    </div>
                                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address Section */}
                        <div className="form-section">
                            <div className="section-header">
                                <MapPin size={24} />
                                <h2>Shipping Address</h2>
                            </div>

                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label htmlFor="address">Street Address *</label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className={errors.address ? 'error' : ''}
                                        placeholder="123 Main Street, Apt 4B"
                                    />
                                    {errors.address && <span className="error-message">{errors.address}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="city">City *</label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className={errors.city ? 'error' : ''}
                                        placeholder="Cairo"
                                    />
                                    {errors.city && <span className="error-message">{errors.city}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="state">State / Province *</label>
                                    <input
                                        type="text"
                                        id="state"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className={errors.state ? 'error' : ''}
                                        placeholder="Giza"
                                    />
                                    {errors.state && <span className="error-message">{errors.state}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="country">Country *</label>
                                    <input
                                        type="text"
                                        id="country"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        className={errors.country ? 'error' : ''}
                                        placeholder="Egypt"
                                    />
                                    {errors.country && <span className="error-message">{errors.country}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="back-btn" onClick={() => navigate('/cart')}>
                                <ArrowLeft size={20} />
                                Back to Cart
                            </button>
                            <button type="submit" className="submit-btn" disabled={isProcessing}>
                                {isProcessing ? 'Processing...' : `Order Now (${total.toFixed(2)} EGP)`}
                            </button>
                        </div>
                    </form>

                    {/* Order Summary Sidebar */}
                    <div className="order-summary-sidebar">
                        <h2>Order Summary</h2>

                        <div className="summary-items">
                            {cartItems.map((item) => (
                                <div className="summary-item" key={item.id}>
                                    <img src={parseImage(item.image)} alt={item.title} />
                                    <div className="item-details">
                                        <h4>{item.title}</h4>
                                        <p>Qty: {item.quantity}</p>
                                    </div>
                                    <span className="item-price">{(item.price * item.quantity).toFixed(2)} <small>EGP</small></span>
                                </div>
                            ))}
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-totals">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>{subtotal.toFixed(2)} <small>EGP</small></span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span className={shippingCost === 0 ? 'free-shipping' : ''}>
                                    {shippingCost === 0 ? 'Free' : `${shippingCost.toFixed(2)} EGP`}
                                </span>
                            </div>
                            <div className="summary-row">
                                <span>Tax</span>
                                <span className="free-shipping">Free</span>
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>{total.toFixed(2)} <small>EGP</small></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {alert && (
                <CustomAlert
                    message={alert.message}
                    type={alert.type}
                    onClose={() => setAlert(null)}
                />
            )}
        </div>
    )
}

export default Checkout
