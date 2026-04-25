import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        // Load cart from localStorage on initialization
        const savedCart = localStorage.getItem('shoppingCart')
        return savedCart ? JSON.parse(savedCart) : []
    })

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('shoppingCart', JSON.stringify(cartItems))
    }, [cartItems])

    const addToCart = (product, quantity = 1) => {
        const maxStock = typeof product.stock === 'number' ? product.stock : Infinity
        if (maxStock <= 0) return // Out of stock – do nothing

        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id)

            if (existingItem) {
                // Respect stock ceiling
                const newQty = Math.min(existingItem.quantity + quantity, maxStock)
                return prevItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: newQty }
                        : item
                )
            } else {
                // If item doesn't exist, add it with quantity capped to stock
                return [...prevItems, { ...product, quantity: Math.min(quantity, maxStock) }]
            }
        })
    }

    const removeFromCart = (productId) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId))
    }

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId)
            return
        }

        setCartItems((prevItems) =>
            prevItems.map((item) => {
                if (item.id !== productId) return item
                const maxStock = typeof item.stock === 'number' && item.stock > 0
                    ? item.stock
                    : Infinity
                return { ...item, quantity: Math.min(quantity, maxStock) }
            })
        )
    }

    const clearCart = () => {
        setCartItems([])
    }

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => {
            const price = parseFloat(item.price)
            const discount = item.discount ? parseFloat(item.discount) : 0
            const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price
            return total + discountedPrice * item.quantity
        }, 0)
    }

    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0)
    }

    const value = React.useMemo(() => ({
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
    }), [cartItems])

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
