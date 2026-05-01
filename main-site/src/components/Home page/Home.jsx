import React from 'react'
import { Helmet } from 'react-helmet-async'
import Hero from './ui/HeroSection/Hero'
import Category from './ui/shopCategory/Category'
import Products from './ui/Products/Products'
import TrustBadges from './ui/TrustBadges/TrustBadges'
import Newsletter from './ui/Newsletter/Newsletter'
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed'
import RecentlyViewed from '../RecentlyViewed/RecentlyViewed'
import './home.css'

const Home = () => {
  const { recentlyViewed } = useRecentlyViewed();
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
          {JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Store",
              "name": "Warm Touch",
              "alternateName": "warmtotch",
              "url": "https://www.warmtotuch.store/",
              "logo": "https://www.warmtotuch.store/svg/logo2.png",
              "image": "https://www.warmtotuch.store/svg/og-imag.png",
              "description": "Handmade macrame, mugs and home decor products in Egypt. Quality craftsmanship since 2024.",
              "telephone": "+201098165967",
              "priceRange": "$$",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "October Garden 247",
                "addressLocality": "Giza",
                "addressRegion": "Giza",
                "postalCode": "12511",
                "addressCountry": "EG"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 29.9870,
                "longitude": 31.2118
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                "opens": "00:00",
                "closes": "23:59"
              },
              "sameAs": [
                "https://www.facebook.com/profile.php?id=100081186777200",
                "https://www.instagram.com/warm.tch"
              ]
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Warm Touch",
              "url": "https://www.warmtotuch.store/",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.warmtotuch.store/allproducts?search={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }
          ])}
        </script>
      </Helmet>
      <Hero />
      <TrustBadges />
      <Category />
      <Products />
      {recentlyViewed && recentlyViewed.length > 0 && (
        <RecentlyViewed products={recentlyViewed} />
      )}
      <Newsletter />
    </div>
  )
}

export default Home