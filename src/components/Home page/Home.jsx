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
        {/* Basic SEO */}
        <title>Warm Touch | مكرميات، ماجات وديكور منزلي | Handmade Macrame Egypt</title>

        <meta
          name="description"
          content="تسوّقي منتجات Warm Touch الهاند ميد: مكرميات، ماجات قهوة، وديكور منزلي مصنوع بحب وجودة عالية. شحن سريع لكل مصر."
        />

        <link rel="canonical" href="https://www.warmtotuch.store/" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Warm Touch | Handmade with our love 🧶" />
        <meta property="og:description" content="مكرميات، ماجات، وديكور منزلي هاند ميد بجودة ممتازة وشحن سريع داخل مصر." />
        <meta property="og:url" content="https://www.warmtotuch.store/" />
        <meta property="og:image" content="https://www.warmtotuch.store/svg/og-imag.png" />
        <meta property="og:site_name" content="Warm Touch" />
        <meta property="og:locale" content="ar_EG" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Warm Touch Handmade Store" />
        <meta name="twitter:description" content="ديكور منزلي وهدايا يدوية دافئة من القلب." />
        <meta name="twitter:image" content="https://www.warmtotuch.store/svg/og-imag.png" />

        {/* Schema */}
        <script type="application/ld+json">
          {`
          {
            "@context": "https://schema.org",
            "@type": "Store",
            "name": "Warm Touch",
            "url": "https://www.warmtotuch.store/",
            "logo": "https://www.warmtotuch.store/svg/logo2.png",
            "image": "https://www.warmtotuch.store/svg/og-imag.png",
            "description": "Handmade macrame, mugs and home decor products in Egypt.",
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