import React from 'react'
import { Helmet } from 'react-helmet-async'
import Hero from './ui/HeroSection/Hero'
import Category from './ui/shopCategory/Category'
import Products from './ui/Products/Products'
import './home.css'

const Home = () => {
  return (
    <div className="home-container">
      <Helmet>
        <title>warmtotuch | مكرميات، ماجات وديكور منزلي | Handmade Macrame, Mugs & Home Decor Egypt</title>
        <meta name="description" content="Shop premium handmade macrame, unique coffee mugs, and Ramadan decorations at warmtotuch. تسوقي أرقى المكرميه اليدوي، ماجات القهوة المميزة، وزينة رمضان." />
        <link rel="canonical" href="https://www.warmtotuch.store/" />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Store",
              "name": "warmtotuch",
              "url": "https://www.warmtotuch.store/",
              "logo": "https://www.warmtotuch.store/svg/logo2.png",
              "description": "Premium handmade macrame, mugs, and home decor products in Egypt.",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "EG"
              },
              "sameAs": [
                "https://www.facebook.com/warmtotuch",
                "https://www.instagram.com/warmtotuch"
              ]
            }
          `}
        </script>
      </Helmet>
      <Hero />
      <Category />
      <Products />
    </div>
  )
}

export default Home