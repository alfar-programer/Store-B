import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import './hero.css'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const Hero = () => {
    const heroRef = useRef(null)

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

        tl.from('.hero-bg', { scale: 1.1, duration: 1.5, ease: 'power2.out' })
            .from('.hero-eyebrow', { y: 20, autoAlpha: 0, duration: 0.6 }, '-=1')
            .from('.hero-title', { y: 40, autoAlpha: 0, duration: 0.8 }, '-=0.4')
            .from('.hero-desc', { y: 30, autoAlpha: 0, duration: 0.7 }, '-=0.5')
            .from('.hero-buttons', { y: 20, autoAlpha: 0, duration: 0.6 }, '-=0.4')
            .from('.hero-social-proof', { y: 15, autoAlpha: 0, duration: 0.5 }, '-=0.3')
            .from('.hero-scroll-indicator', { autoAlpha: 0, y: 20, duration: 0.6 }, '-=0.2')

    }, { scope: heroRef })

    return (
        <section className="hero" ref={heroRef}>
            {/* Background Image */}
            <div className="hero-bg">
                <img src="images/herosection home page.png" alt="Warm Touch" className="hero-bg-img" />

            </div>

            <div className="hero-container">
                <div className="hero-content">
                    <span className="hero-eyebrow">Handmade with Love & Care</span>
                    <h1 className="hero-title">
                        Feel Comfort.<br />
                        Live <span className="hero-highlight">Better.</span>
                    </h1>
                    <p className="hero-desc">
                        Handmade décor and home accessories
                        that turn every corner of your home
                        into a place of warmth.
                    </p>
                    <div className="hero-buttons">
                        <Link to="/allproducts" className="btn-primary">
                            Shop Now
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                        <Link to="/allproducts" className="btn-secondary">
                            Explore Collection
                        </Link>
                    </div>

                    {/* Social Proof */}
                    <div className="hero-social-proof">
                        <div className="avatar-stack">
                            <div className="avatar avatar-1"><div className="image-placeholder"></div></div>
                            <div className="avatar avatar-2"><div className="image-placeholder"></div></div>
                            <div className="avatar avatar-3"><div className="image-placeholder"></div></div>
                            <div className="avatar avatar-4"><div className="image-placeholder"></div></div>
                        </div>
                        <span className="social-proof-text">
                            <strong>10,000+</strong> Happy Customers
                        </span>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="hero-scroll-indicator centered">
                <div className="mouse-icon">
                    <div className="mouse-wheel"></div>
                </div>
                <span>Scroll to explore</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="scroll-arrow">
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </div>
        </section>
    )
}

export default Hero