import React, { useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Heart, Award, Users, Sparkles, Phone, Mail, MapPin, ArrowLeft } from 'lucide-react'
import './about.css'

gsap.registerPlugin(ScrollTrigger)

const About = () => {
    const heroRef = useRef(null)
    const storyRef = useRef(null)
    const valuesRef = useRef(null)
    const statsRef = useRef(null)

    useEffect(() => {
        // Hero section animations
        const ctx = gsap.context(() => {
            gsap.from('.hero-title', {
                opacity: 0,
                y: 100,
                duration: 1.2,
                ease: 'power4.out'
            })

            gsap.set('.hero-subtitle', { opacity: 1, y: 0 })
            gsap.set('.hero-subtitle-ar', { opacity: 1, y: 0 })

            gsap.from('.hero-subtitle', {
                opacity: 0,
                y: 50,
                duration: 1,
                delay: 0.3,
                ease: 'power3.out'
            })

            gsap.from('.hero-subtitle-ar', {
                opacity: 0,
                y: 50,
                duration: 1,
                delay: 0.5,
                ease: 'power3.out'
            })

            gsap.from('.hero-decoration', {
                opacity: 0,
                scale: 0,
                duration: 1.5,
                delay: 0.5,
                ease: 'elastic.out(1, 0.5)'
            })

            // Floating animation for decorations
            gsap.to('.hero-decoration', {
                y: -20,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            })

            // Story section scroll animation
            gsap.from('.story-content', {
                scrollTrigger: {
                    trigger: '.story-section',
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse'
                },
                opacity: 0,
                x: -100,
                duration: 1,
                ease: 'power3.out'
            })

            gsap.from('.story-image', {
                scrollTrigger: {
                    trigger: '.story-section',
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse'
                },
                opacity: 0,
                x: 100,
                duration: 1,
                ease: 'power3.out'
            })

            // Values cards stagger animation
            gsap.set('.value-card', { opacity: 1, y: 0 })

            gsap.from('.value-card', {
                scrollTrigger: {
                    trigger: '.values-section',
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                },
                opacity: 0,
                y: 50,
                stagger: 0.2,
                duration: 1,
                ease: 'back.out(1.7)'
            })

            // Stats counter animation
            const stats = document.querySelectorAll('.stat-number')
            stats.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-target'))
                gsap.to(stat, {
                    scrollTrigger: {
                        trigger: '.stats-section',
                        start: 'top 80%',
                    },
                    textContent: target,
                    duration: 2,
                    ease: 'power1.out',
                    snap: { textContent: 1 },
                    onUpdate: function () {
                        stat.textContent = Math.ceil(stat.textContent) + (stat.getAttribute('data-suffix') || '')
                    }
                })
            })

        }, heroRef)

        return () => ctx.revert()
    }, [])

    return (
        <div className="about-page" ref={heroRef}>
            <Helmet>
                <title>About Warm Touch | Handmade Macrame & Home Decor | من نحن</title>
                <meta name="description" content="Discover Warm Touch's story - handcrafted macrame, artisan mugs, and unique home decor made with love. اكتشف قصة وارم تاتش - منتجات يدوية بحب." />
                <link rel="canonical" href="https://www.warmtotuch.store/about" />
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [{
                            "@type": "ListItem",
                            "position": 1,
                            "name": "Home",
                            "item": "https://www.warmtotuch.store/"
                        }, {
                            "@type": "ListItem",
                            "position": 2,
                            "name": "About Us",
                            "item": "https://www.warmtotuch.store/about"
                        }]
                    })}
                </script>
            </Helmet>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-decoration hero-decoration-1">
                    <Sparkles size={60} />
                </div>
                <div className="hero-decoration hero-decoration-2">
                    <Heart size={50} />
                </div>
                <div className="hero-decoration hero-decoration-3">
                    <Sparkles size={55} />
                </div>

                <div className="hero-content">
                    <h1 className="hero-title">
                        Handmade with <span className="gradient-text">Love & Care</span>
                    </h1>
                    <p className="hero-subtitle">
                        Every piece tells a story of craftsmanship, passion, and warmth
                    </p>
                    <p className="hero-subtitle-ar">
                        كل قطعة تحكي قصة من الحرفية والشغف والدفء
                    </p>
                </div>
            </section>

            {/* Story Section */}
            <section className="story-section" ref={storyRef}>
                <div className="story-container">
                    <div className="story-content">
                        <h2>Our Story</h2>
                        <p>
                            Founded in 2024, Warm Touch began with a passion for bringing handmade beauty into every home.
                            We specialize in artisan macrame wall hangings, hand-painted mugs, and unique home decor pieces
                            that add warmth and personality to your space.
                        </p>
                        <p>
                            Each product is carefully crafted by skilled artisans who pour their heart into every knot,
                            every brushstroke, and every detail. We believe that handmade items carry a special energy
                            that mass-produced products simply cannot replicate.
                        </p>
                        <p>
                            From our workshop to your home, we're committed to creating pieces that you'll treasure for years to come.
                        </p>
                    </div>
                    <div className="story-image">
                        <div className="image-placeholder">
                            <img src="\svg\logo.jpg" width={600} height={600} alt="Warm Touch handmade products" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="values-section" ref={valuesRef}>
                <h2 className="section-title">What We Stand For</h2>
                <div className="values-grid">
                    <div className="value-card">
                        <div className="value-icon">
                            <Heart size={40} />
                        </div>
                        <h3>Handmade with Love</h3>
                        <p>Every piece is crafted by hand with care and attention to detail</p>
                    </div>
                    <div className="value-card">
                        <div className="value-icon">
                            <Award size={40} />
                        </div>
                        <h3>Premium Quality</h3>
                        <p>We use only the finest materials for lasting beauty</p>
                    </div>
                    <div className="value-card">
                        <div className="value-icon">
                            <Users size={40} />
                        </div>
                        <h3>Community</h3>
                        <p>Supporting local artisans and building connections</p>
                    </div>
                    <div className="value-card">
                        <div className="value-icon">
                            <Sparkles size={40} />
                        </div>
                        <h3>Unique Designs</h3>
                        <p>One-of-a-kind pieces that reflect your personal style</p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section" ref={statsRef}>
                <div className="stats-grid">
                    <div className="stat-item">
                        <div className="stat-number" data-target="1000" data-suffix="+">0+</div>
                        <div className="stat-label">Happy Customers</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number" data-target="500" data-suffix="+">0+</div>
                        <div className="stat-label">Handmade Products</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number" data-target="50" data-suffix="+">0+</div>
                        <div className="stat-label">Artisan Partners</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number" data-target="99" data-suffix="%">0%</div>
                        <div className="stat-label">Satisfaction Rate</div>
                    </div>
                </div>
            </section>

            {/* Contact CTA Section */}
            <section className="about-contact-cta" id="contact">
                <div className="about-cta-inner">
                    <div className="about-cta-info">
                        <div className="about-cta-icons">
                            <div className="about-cta-icon-box"><Phone size={20} /></div>
                            <div className="about-cta-icon-box"><Mail size={20} /></div>
                            <div className="about-cta-icon-box"><MapPin size={20} /></div>
                        </div>
                        <h2>هل لديك سؤال؟</h2>
                        <p>فريقنا جاهز للمساعدة. تواصل معنا عبر البريد الإلكتروني أو الهاتف أو نموذج التواصل المخصص.</p>
                        <div className="about-contact-details">
                            <span><Mail size={15} /> info@warmtouch.store</span>
                            <span><Phone size={15} /> +20 109 816 5967</span>
                        </div>
                    </div>
                    <Link to="/contact" className="about-contact-link" id="about-contact-us-btn">
                        تواصل معنا
                        <ArrowLeft size={20} />
                    </Link>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <h2>Ready to Add Warmth to Your Home?</h2>
                <p>Explore our collection of handmade treasures</p>
                <button className="cta-button" onClick={() => window.location.href = '/allproducts'}>
                    Shop Now
                </button>
            </section>
        </div>
    )
}

export default About