
import React from 'react'
import { Helmet } from 'react-helmet-async'
import { useCart } from '../../context/CartContext'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, MessageCircle, Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useFavorites } from '../../context/FavoritesContext'
import { API_BASE_URL, PLACEHOLDER_IMAGE } from '../../config'
import './cart.css'

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart()
    const { toggleFavorite, isFavorite } = useFavorites()
    const navigate = useNavigate() // Import useNavigate to navigate to the home page

    const parseImage = (imageField) => {
        if (!imageField) return PLACEHOLDER_IMAGE

        let imageUrl = imageField

        try {
            if (typeof imageField === 'string' && (imageField.startsWith('[') || imageField.startsWith('{'))) {
                const parsed = JSON.parse(imageField)
                if (Array.isArray(parsed) && parsed.length > 0) {
                    imageUrl = parsed[0]
                }
            }
        } catch (e) {
            console.warn('Image parsing error:', e)
        }

        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
            const rootUrl = API_BASE_URL.replace('/api', '')
            const cleanRoot = rootUrl.endsWith('/') ? rootUrl.slice(0, -1) : rootUrl
            const cleanPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl
            return `${cleanRoot}/${cleanPath}`
        }

        return imageUrl || PLACEHOLDER_IMAGE
    }

    const handleQuantityChange = (productId, newQuantity, maxStock) => {
        if (newQuantity >= 1) {
            // Don't exceed available stock
            const capped = typeof maxStock === 'number' && maxStock > 0
                ? Math.min(newQuantity, maxStock)
                : newQuantity
            updateQuantity(productId, capped)
        }
    } // Function to handle quantity changes its check if the new quantity is greater than or equal to 1

    const calculateItemTotal = (price, quantity) => {
        return (parseFloat(price) * quantity).toFixed(2)
    } // function to calculate the total price of an item to 2 decimal places 

    const handleWhatsAppClick = () => {
        const phoneNumber = '+201098165967' // Support number
        const message = `Hello, I need help with my cart containing ${cartItems.length} items.`
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
        window.open(whatsappUrl, '_blank')
    }

    if (cartItems.length === 0) {
        return (
            <div className="cart-page">
                <Helmet>
                    <title>سلة التسوق | Cart – warmtotuch</title>
                    <meta name="robots" content="noindex, nofollow" />
                </Helmet>
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

    const subtotal = getCartTotal()
    const shippingCost = subtotal < 500 ? 30 : 0
    const total = subtotal + shippingCost

    return (
        <div className="cart-page">
            <Helmet>
                <title>سلة التسوق | Cart – warmtotuch</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
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
                                    <img src={parseImage(item.image)} alt={item.title} />
                                </div>

                                <div className="cart-item-details">
                                    <h3>{item.title}</h3>
                                    <p className="cart-item-description">{item.description}</p>
                                    {item.discount > 0 && (
                                        <span className="cart-item-discount">-{item.discount}% OFF</span>
                                    )}
                                    {typeof item.stock === 'number' && (
                                        <p className="cart-item-stock" style={{ fontSize: '0.85rem', color: item.stock > 0 ? (item.stock < 10 ? '#d97706' : '#059669') : '#dc2626', marginTop: '4px', fontWeight: '500' }}>
                                            {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                                        </p>
                                    )}
                                </div>

                                <div className="cart-item-quantity">
                                    <button
                                        className="quantity-btn"
                                        onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.stock)}
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="quantity-value">{item.quantity}</span>
                                    <button
                                        className="quantity-btn"
                                        disabled={typeof item.stock === 'number' && item.stock > 0 && item.quantity >= item.stock}
                                        style={typeof item.stock === 'number' && item.stock > 0 && item.quantity >= item.stock ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                                        title={typeof item.stock === 'number' && item.stock > 0 && item.quantity >= item.stock ? `Max stock: ${item.stock}` : ''}
                                        onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.stock)}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>

                                <div className="cart-item-price">
                                    <div className="price-display">
                                        {item.discount > 0 ? (
                                            <>
                                                <span className="item-total">{calculateItemTotal(
                                                    (parseFloat(item.price) * (1 - item.discount / 100)).toFixed(2),
                                                    item.quantity
                                                )} <small>EGP</small></span>
                                                <span className="item-original-total">
                                                    {calculateItemTotal(item.price, item.quantity)} <small>EGP</small>
                                                </span>
                                            </>
                                        ) : (
                                            <span className="item-total">{calculateItemTotal(item.price, item.quantity)} <small>EGP</small></span>
                                        )}
                                    </div>
                                    <div className="unit-price-display">
                                        {item.discount > 0 ? (
                                            <>
                                                <span className="item-unit-price">{(parseFloat(item.price) * (1 - item.discount / 100)).toFixed(2)} <small>EGP</small> each</span>
                                                <span className="item-original-unit">
                                                    {parseFloat(item.price).toFixed(2)} <small>EGP</small>
                                                </span>
                                            </>
                                        ) : (
                                            <span className="item-unit-price">{parseFloat(item.price).toFixed(2)} <small>EGP</small> each</span>
                                        )}
                                    </div>
                                </div>

                                <div className="cart-item-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <button
                                        className="remove-item-btn"
                                        style={{ 
                                            background: isFavorite(item.id) ? '#fee2e2' : '#f3f4f6', 
                                            color: isFavorite(item.id) ? '#ef4444' : '#6b7280'
                                        }}
                                        onClick={() => toggleFavorite(item)}
                                        title={isFavorite(item.id) ? "Remove from favorites" : "Add to favorites"}
                                    >
                                        <Heart size={20} fill={isFavorite(item.id) ? '#ef4444' : 'none'} />
                                    </button>
                                    <button
                                        className="remove-item-btn"
                                        onClick={() => removeFromCart(item.id)}
                                        title="Remove item"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary">
                        <h2>Order Summary</h2>

                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>{subtotal.toFixed(2)} <small>EGP</small></span>
                        </div>

                        <div className="summary-row">
                            <span>Shipping</span>
                            <span className={shippingCost === 0 ? "free-shipping" : ""}>
                                {shippingCost === 0 ? "Free" : `${shippingCost.toFixed(2)} EGP`}
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

                        <button className="checkout-btn" onClick={() => navigate('/checkout')}>
                            Proceed to Checkout
                        </button>

                        <button className="continue-shopping-btn" onClick={() => navigate('/allproducts')}>
                            <ArrowLeft size={20} />
                            Continue Shopping
                        </button>

                        <button className="whatsapp-cart-btn" onClick={handleWhatsAppClick}>
                            <MessageCircle size={20} />
                            Contact Support
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
