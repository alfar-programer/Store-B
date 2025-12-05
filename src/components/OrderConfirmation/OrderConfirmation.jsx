import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, Package, MapPin, CreditCard, ArrowRight, Home } from 'lucide-react'
import './orderConfirmation.css'

const OrderConfirmation = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const order = location.state?.order

    useEffect(() => {
        // If no order data, redirect to home
        if (!order) {
            navigate('/')
        }
    }, [order, navigate])

    if (!order) {
        return null
    }

    return (
        <div className="confirmation-page">
            <div className="confirmation-container">
                <div className="success-animation">
                    <CheckCircle size={80} strokeWidth={2} />
                </div>

                <div className="confirmation-header">
                    <h1>Order Confirmed!</h1>
                    <p>Thank you for your purchase. Your order has been successfully placed.</p>
                </div>

                <div className="order-details-card">
                    <div className="order-number">
                        <span className="label">Order Number</span>
                        <span className="value">{order.orderId}</span>
                    </div>

                    <div className="order-date">
                        <span className="label">Order Date</span>
                        <span className="value">{new Date(order.orderDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</span>
                    </div>
                </div>

                <div className="order-info-grid">
                    {/* Customer Information */}
                    <div className="info-card">
                        <div className="info-header">
                            <Package size={24} />
                            <h3>Customer Information</h3>
                        </div>
                        <div className="info-content">
                            <p><strong>Name:</strong> {order.customerInfo.fullName}</p>
                            <p><strong>Email:</strong> {order.customerInfo.email}</p>
                            <p><strong>Phone:</strong> {order.customerInfo.phone}</p>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="info-card">
                        <div className="info-header">
                            <MapPin size={24} />
                            <h3>Shipping Address</h3>
                        </div>
                        <div className="info-content">
                            <p>{order.shippingAddress.address}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                            <p>{order.shippingAddress.country}</p>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="info-card">
                        <div className="info-header">
                            <CreditCard size={24} />
                            <h3>Payment Method</h3>
                        </div>
                        <div className="info-content">
                            <p>{order.paymentMethod}</p>
                            <p className="payment-status">✓ Payment Successful</p>
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="order-items-section">
                    <h2>Order Items</h2>
                    <div className="items-list">
                        {order.items.map((item) => (
                            <div className="order-item" key={item.id}>
                                <img src={item.image} alt={item.title} />
                                <div className="item-info">
                                    <h4>{item.title}</h4>
                                    <p>Quantity: {item.quantity}</p>
                                </div>
                                <div className="item-price">
                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="order-summary">
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>${order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping</span>
                            <span className="free">Free</span>
                        </div>
                        <div className="summary-row">
                            <span>Tax</span>
                            <span>${order.tax.toFixed(2)}</span>
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>${order.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="confirmation-actions">
                    <button className="secondary-btn" onClick={() => navigate('/allproducts')}>
                        Continue Shopping
                        <ArrowRight size={20} />
                    </button>
                    <button className="primary-btn" onClick={() => navigate('/')}>
                        <Home size={20} />
                        Back to Home
                    </button>
                </div>

                {/* Email Notification */}
                <div className="email-notification">
                    <p>📧 A confirmation email has been sent to <strong>{order.customerInfo.email}</strong></p>
                </div>
            </div>
        </div>
    )
}

export default OrderConfirmation
