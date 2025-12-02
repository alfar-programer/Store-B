import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './components/Home page/Home'
import Cart from './components/Cart/Cart'
import Header from './components/Header/Header'
import SearchModal from './components/Search/SearchModal'
import AllProducts from './components/AllProduct/AllProducts'
import About from './components/About/About'

const App = () => {
  return (
    <Router>
      <div>
        <Header />
        <SearchModal />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/allproducts" element={<AllProducts />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App 