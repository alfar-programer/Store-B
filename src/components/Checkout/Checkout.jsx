import React, { useState } from 'react'
import { useCart } from '../../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { CreditCard, MapPin, User, Mail, Phone, Lock, ArrowLeft, ShoppingBag } from 'lucide-react'
import './checkout.css'

const Checkout = () => {
    const { cartItems, getCartTotal, clearCart } = useCart()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        // Personal Information
        fullName: '',
        email: '',
        phone: '',

        // Shipping Address
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',

        // Payment Information
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
    })

    const [errors, setErrors] = useState({})
    const [isProcessing, setIsProcessing] = useState(false)

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

    // Format card number with spaces
    const handleCardNumberChange = (e) => {
        let value = e.target.value.replace(/\s/g, '')
        value = value.replace(/\D/g, '')
        value = value.substring(0, 16)
        value = value.match(/.{1,4}/g)?.join(' ') || value
        setFormData(prev => ({
            ...prev,
            cardNumber: value
        }))
    }

    // Format expiry date
    const handleExpiryChange = (e) => {
        let value = e.target.value.replace(/\D/g, '')
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4)
        }
        setFormData(prev => ({
            ...prev,
            expiryDate: value
        }))
    }

    // Validate form
    const validateForm = () => {
        const newErrors = {}

        // Personal Information
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid'
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required'
        } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
            newErrors.phone = 'Phone number is invalid'
        }

        // Shipping Address
        if (!formData.address.trim()) newErrors.address = 'Address is required'
        if (!formData.city.trim()) newErrors.city = 'City is required'
        if (!formData.state.trim()) newErrors.state = 'State is required'
        if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required'
        if (!formData.country.trim()) newErrors.country = 'Country is required'

        // Payment Information
        if (!formData.cardNumber.trim()) {
            newErrors.cardNumber = 'Card number is required'
        } else if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
            newErrors.cardNumber = 'Card number must be 16 digits'
        }
        if (!formData.cardName.trim()) newErrors.cardName = 'Cardholder name is required'
        if (!formData.expiryDate.trim()) {
            newErrors.expiryDate = 'Expiry date is required'
        } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
            newErrors.expiryDate = 'Invalid format (MM/YY)'
        }
        if (!formData.cvv.trim()) {
            newErrors.cvv = 'CVV is required'
        } else if (!/^\d{3,4}$/.test(formData.cvv)) {
            newErrors.cvv = 'CVV must be 3-4 digits'
        }

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

        // Simulate payment processing
        setTimeout(() => {
            // Create order object
            const order = {
                orderId: 'ORD-' + Date.now(),
                orderDate: new Date().toISOString(),
                customerInfo: {
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone
                },
                shippingAddress: {
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    postalCode: formData.postalCode,
                    country: formData.country
                },
                items: cartItems,
                subtotal: getCartTotal(),
                tax: getCartTotal() * 0.1,
                total: getCartTotal() * 1.1,
                paymentMethod: 'Card ending in ' + formData.cardNumber.slice(-4)
            }

            // Save order to localStorage
            const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]')
            existingOrders.push(order)
            localStorage.setItem('orders', JSON.stringify(existingOrders))

            // Clear cart
            clearCart()

            // Navigate to confirmation page
            navigate('/order-confirmation', { state: { order } })
        }, 2000)
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
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="email">Email Address *</label>
                                    <div className="input-with-icon">
                                        <Mail size={20} />
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={errors.email ? 'error' : ''}
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    {errors.email && <span className="error-message">{errors.email}</span>}
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
                                            placeholder="+1 (555) 123-4567"
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
                                        placeholder="New York"
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
                                        placeholder="NY"
                                    />
                                    {errors.state && <span className="error-message">{errors.state}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="postalCode">Postal Code *</label>
                                    <input
                                        type="text"
                                        id="postalCode"
                                        name="postalCode"
                                        value={formData.postalCode}
                                        onChange={handleChange}
                                        className={errors.postalCode ? 'error' : ''}
                                        placeholder="10001"
                                    />
                                    {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="country">Country *</label>
                                    <input
                                        type="text"
                                        id="country"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        className={errors.country ? 'error' : ''}
                                        placeholder="United States"
                                    />
                                    {errors.country && <span className="error-message">{errors.country}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Payment Information Section */}
                        <div className="form-section">
                            <div className="section-header">
                                <CreditCard size={24} />
                                <h2>Payment Information</h2>
                            </div>

                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label htmlFor="cardNumber">Card Number *</label>
                                    <div className="input-with-icon">
                                        <CreditCard size={20} />
                                        <input
                                            type="text"
                                            id="cardNumber"
                                            name="cardNumber"
                                            value={formData.cardNumber}
                                            onChange={handleCardNumberChange}
                                            className={errors.cardNumber ? 'error' : ''}
                                            placeholder="1234 5678 9012 3456"
                                            maxLength="19"
                                        />
                                    </div>
                                    {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label htmlFor="cardName">Cardholder Name *</label>
                                    <input
                                        type="text"
                                        id="cardName"
                                        name="cardName"
                                        value={formData.cardName}
                                        onChange={handleChange}
                                        className={errors.cardName ? 'error' : ''}
                                        placeholder="John Doe"
                                    />
                                    {errors.cardName && <span className="error-message">{errors.cardName}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="expiryDate">Expiry Date *</label>
                                    <input
                                        type="text"
                                        id="expiryDate"
                                        name="expiryDate"
                                        value={formData.expiryDate}
                                        onChange={handleExpiryChange}
                                        className={errors.expiryDate ? 'error' : ''}
                                        placeholder="MM/YY"
                                        maxLength="5"
                                    />
                                    {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="cvv">CVV *</label>
                                    <div className="input-with-icon">
                                        <Lock size={20} />
                                        <input
                                            type="text"
                                            id="cvv"
                                            name="cvv"
                                            value={formData.cvv}
                                            onChange={handleChange}
                                            className={errors.cvv ? 'error' : ''}
                                            placeholder="123"
                                            maxLength="4"
                                        />
                                    </div>
                                    {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="back-btn" onClick={() => navigate('/cart')}>
                                <ArrowLeft size={20} />
                                Back to Cart
                            </button>
                            <button type="submit" className="submit-btn" disabled={isProcessing}>
                                {isProcessing ? 'Processing...' : `Pay $${(getCartTotal() * 1.1).toFixed(2)}`}
                            </button>
                        </div>
                    </form>

                    {/* Order Summary Sidebar */}
                    <div className="order-summary-sidebar">
                        <h2>Order Summary</h2>

                        <div className="summary-items">
                            {cartItems.map((item) => (
                                <div className="summary-item" key={item.id}>
                                    <img src={item.image} alt={item.title} />
                                    <div className="item-details">
                                        <h4>{item.title}</h4>
                                        <p>Qty: {item.quantity}</p>
                                    </div>
                                    <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-totals">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>${getCartTotal().toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span className="free-shipping">Free</span>
                            </div>
                            <div className="summary-row">
                                <span>Tax (10%)</span>
                                <span>${(getCartTotal() * 0.1).toFixed(2)}</span>
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>${(getCartTotal() * 1.1).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Checkout
