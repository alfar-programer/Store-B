import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './components/Home page/Home'
import Cart from './components/Cart/Cart'
import Header from './components/Header/Header'
import SearchModal from './components/Search/SearchModal'
import AllProducts from './components/AllProduct/AllProducts'
import About from './components/About/About'
import Checkout from './components/Checkout/Checkout'
import OrderConfirmation from './components/OrderConfirmation/OrderConfirmation'
import LoadingScreen from './components/LoadingScreen/LoadingScreen'
import Contact from './components/Contact/Contact'

const App = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2500) // 2.5 seconds loading time

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Router>
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
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App 