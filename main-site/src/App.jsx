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
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'
import Profile from './pages/Profile'
import MyOrders from './pages/MyOrders'
import Favorites from './components/Favorites/Favorites'

const App = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) return <LoadingScreen />

  return (
    <Router>
      <AuthProvider>
        <FavoritesProvider>
          <ScrollToTop />
        <div>
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