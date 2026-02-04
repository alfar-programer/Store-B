import React, { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Heart, Award, Users, Sparkles, Phone, Mail, MapPin, Send } from 'lucide-react'
import './about.css'

gsap.registerPlugin(ScrollTrigger)

const About = () => {
    const location = useLocation()
    const heroRef = useRef(null)
    const storyRef = useRef(null)
    const valuesRef = useRef(null)
    const statsRef = useRef(null)

    // Contact form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })
    const [status, setStatus] = useState('')

    useEffect(() => {
        if (location.state?.orderId) {
            setFormData(prev => ({
                ...prev,
                subject: `Order Support: #${location.state.orderId}`
            }))
        }
    }, [location.state])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setStatus('sending')

        // Simulate form submission
        setTimeout(() => {
            setStatus('success')
            setFormData({ name: '', email: '', subject: '', message: '' })
            setTimeout(() => setStatus(''), 3000)
        }, 1500)
    }

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

            {/* Contact Section */}
            <section className="contact-section" id="contact">
                <div className="contact-container">
                    <div className="contact-header">
                        <h2>Get in Touch</h2>
                        <p>We'd love to hear from you. Send us a message and we'll respond within 24 hours.</p>
                        <p className="contact-subtitle-ar">نحب أن نسمع منك. أرسل لنا رسالة وسنرد خلال 24 ساعة</p>
                    </div>

                    <div className="contact-grid">
                        {/* Contact Info */}
                        <div className="contact-info-card">
                            <h3>Contact Information</h3>
                            <p className="info-subtitle">Reach out to us through any of these channels</p>

                            <div className="info-items">
                                <div className="info-item">
                                    <div className="icon-box">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h4>Phone</h4>
                                        <p>+20-109-816-5967</p>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <div className="icon-box">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h4>Email</h4>
                                        <p>Wormtotch@gmail.com</p>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <div className="icon-box">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h4>Address</h4>
                                        <p>Egypt, GIZA October Garden 247</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="contact-form-card">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Your Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="john@example.com"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Subject</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        placeholder="How can we help?"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Message</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="5"
                                        placeholder="Write your message here..."
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className={`submit-btn ${status === 'success' ? 'success' : ''}`}
                                    disabled={status === 'sending'}
                                >
                                    {status === 'sending' ? (
                                        'Sending...'
                                    ) : status === 'success' ? (
                                        '✓ Message Sent!'
                                    ) : (
                                        <>Send Message <Send size={18} /></>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
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