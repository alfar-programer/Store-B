import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './components/Home page/Home'
import Cart from './components/Cart/Cart'
import Header from './components/Header/Header'
import SearchModal from './components/Search/SearchModal'
import AllProducts from './components/AllProduct/AllProducts'
import About from './components/About/About'
import Contact from './components/Contact/Contact'
import Checkout from './components/Checkout/Checkout'
import OrderConfirmation from './components/OrderConfirmation/OrderConfirmation'
import LoadingScreen from './components/LoadingScreen/LoadingScreen'
import ProductDetail from './components/ProductDetail/ProductDetail'
import Footer from './components/Footer/Footer'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'
import PrivateRoute from './components/PrivateRoute/PrivateRoute'

import { AuthProvider } from './context/AuthContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { useLanguage } from './context/LanguageContext'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'
import Profile from './pages/Profile'
import MyOrders from './pages/MyOrders'
import Favorites from './components/Favorites/Favorites'

const App = () => {
  const [loading, setLoading] = useState(true)
  const [showLoader, setShowLoader] = useState(true)
  const { isRTL } = useLanguage()

  useEffect(() => {
    // Standard window load event covers all assets (images, styles, etc.)
    const handleLoad = () => {
      setLoading(false)
      // Wait for progress to hit 100 and exit animation (1.8s total) before unmounting
      setTimeout(() => setShowLoader(false), 2000)
    }

    if (document.readyState === 'complete') {
      const timer = setTimeout(handleLoad, 800)
      return () => clearTimeout(timer)
    } else {
      window.addEventListener('load', handleLoad)
      
      const fallbackTimer = setTimeout(handleLoad, 8000)

      return () => {
        window.removeEventListener('load', handleLoad)
        clearTimeout(fallbackTimer)
      }
    }
  }, [])

  return (
    <Router>
      <AuthProvider>
        <FavoritesProvider>
          {showLoader && <LoadingScreen isExiting={!loading} />}
          <ScrollToTop />
        {/* Layout is strictly LTR as requested by user */}
        <div className="app-container">
          <Header />
          <SearchModal />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/allproducts" element={<AllProducts />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/favorites" element={<Favorites />} />

            {/* Protected routes */}
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/my-orders" element={<PrivateRoute><MyOrders /></PrivateRoute>} />
          </Routes>
          <Footer />
        </div>
        </FavoritesProvider>
      </AuthProvider>
    </Router>
  )
}

export default App