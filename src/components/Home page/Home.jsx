import React from 'react'
import Hero from './ui/HeroSection/Hero'
import Category from './ui/shopCategory/Category'
import Products from './ui/Products/Products'
import './home.css'

const Home = () => {
  return (
    <div className="home-container">
      <Hero />
      <Category />
      <Products />
    </div>
  )
}

export default Home