import React from 'react'
import { useCart } from '../../context/CartContext'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import './cart.css'

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart()
    const navigate = useNavigate() // Import useNavigate to navigate to the home page

    const handleQuantityChange = (productId, newQuantity) => {
        if (newQuantity >= 1) {
            updateQuantity(productId, newQuantity)
        }
    } // Function to handle quantity changes its check if the new quantity is greater than or equal to 1

    const calculateItemTotal = (price, quantity) => {
        return (parseFloat(price) * quantity).toFixed(2)
    } // function to calculate the total price of an item to 2 decimal places 

    if (cartItems.length === 0) {
        return (
            <div className="cart-page">
                <div className="cart-container">
                    <div className="empty-cart">
                        <ShoppingBag size={80} strokeWidth={1.5} />
                        <h2>Your Cart is Empty</h2>
                        <p>Add some products to get started!</p>
                        <button className="continue-shopping-btn" onClick={() => navigate('/allproducts')}>
                            <ArrowLeft size={20} />
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="cart-page">
            <div className="cart-container">
                <div className="cart-header">
                    <h1>Shopping Cart</h1>
                    <p>{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
                </div>

                <div className="cart-content">
                    <div className="cart-items">
                        {cartItems.map((item) => (
                            <div className="cart-item" key={item.id}>
                                <div className="cart-item-image">
                                    <img src={item.image} alt={item.title} />
                                </div>

                                <div className="cart-item-details">
                                    <h3>{item.title}</h3>
                                    <p className="cart-item-description">{item.description}</p>
                                    {item.discount > 0 && (
                                        <span className="cart-item-discount">-{item.discount}% OFF</span>
                                    )}
                                </div>

                                <div className="cart-item-quantity">
                                    <button
                                        className="quantity-btn"
                                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="quantity-value">{item.quantity}</span>
                                    <button
                                        className="quantity-btn"
                                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>

                                <div className="cart-item-price">
                                    <span className="item-total">${calculateItemTotal(item.price, item.quantity)}</span>
                                    <span className="item-unit-price">${item.price} each</span>
                                </div>

                                <button
                                    className="remove-item-btn"
                                    onClick={() => removeFromCart(item.id)}
                                    title="Remove item"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <h2>Order Summary</h2>

                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>${getCartTotal().toFixed(2)}</span>
                        </div>

                        <div className="summary-row">
                            <span>Shipping</span>
                            <span className="free-shipping">Free</span>
                        </div>

                        <div className="summary-row">
                            <span>Tax (estimated)</span>
                            <span>${(getCartTotal() * 0.1).toFixed(2)}</span>
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-row total">
                            <span>Total</span>
                            <span>${(getCartTotal() * 1.1).toFixed(2)}</span>
                        </div>

                        <button className="checkout-btn">
                            Proceed to Checkout
                        </button>

                        <button className="continue-shopping-btn" onClick={() => navigate('/allproducts')}>
                            <ArrowLeft size={20} />
                            Continue Shopping
                        </button>
                        
                        <button className="clear-cart-btn" onClick={clearCart}>
                            Clear Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Cart
