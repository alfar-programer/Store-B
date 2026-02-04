import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './components/Home page/Home'
import Cart from './components/Cart/Cart'
import Header from './components/Header/Header'
import SearchModal from './components/Search/SearchModal'
import AllProducts from './components/AllProduct/AllProducts'
import About from './components/About/About'
import Checkout from './components/Checkout/Checkout'
import OrderConfirmation from './components/OrderConfirmation/OrderConfirmation'
import LoadingScreen from './components/LoadingScreen/LoadingScreen'

import Footer from './components/Footer/Footer'
import ScrollToTop from './components/ScrollToTop/ScrollToTop'

import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'
import Profile from './pages/Profile'
import MyOrders from './pages/MyOrders'

const App = () => {
  const [loading, setLoading] = useState(true)

  // Show loading screen for 1.5 seconds on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <div>
          <Header />
          <SearchModal />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/allproducts" element={<AllProducts />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Navigate to="/about#contact" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-orders" element={<MyOrders />} />
          </Routes>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App