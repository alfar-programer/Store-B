import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Sparkles, Heart, Zap, Users, TrendingUp, Award } from 'lucide-react'
import './about.css'

gsap.registerPlugin(ScrollTrigger)

const About = () => {
    const heroRef = useRef(null)
    const storyRef = useRef(null)
    const valuesRef = useRef(null)
    const statsRef = useRef(null)
    const teamRef = useRef(null)

    useEffect(() => {
        // Hero section animations
        const ctx = gsap.context(() => {
            gsap.from('.hero-title', {
                opacity: 0,
                y: 100,
                duration: 1.2,
                ease: 'power4.out'
            })

            gsap.from('.hero-subtitle', {
                opacity: 0,
                y: 50,
                duration: 1,
                delay: 0.3,
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
            gsap.to('.value-card', {
                scrollTrigger: {
                    trigger: '.values-section',
                    start: 'top 70%',
                },
                opacity: 1,
                y: 50,
                stagger: 0.2,
                duration: 4,
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

            // Team cards hover effect
            const teamCards = document.querySelectorAll('.team-card')
            teamCards.forEach(card => {
                card.addEventListener('mouseenter', () => {
                    gsap.to(card, {
                        y: -10,
                        scale: 1.05,
                        duration: 0.3,
                        ease: 'power2.out'
                    })
                })
                card.addEventListener('mouseleave', () => {
                    gsap.to(card, {
                        y: 0,
                        scale: 1,
                        duration: 0.3,
                        ease: 'power2.out'
                    })
                })
            })

        }, heroRef)

        return () => ctx.revert()
    }, [])

    return (
        <div className="about-page" ref={heroRef}>
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-decoration hero-decoration-1">
                    <Sparkles size={60} />
                </div>
                <div className="hero-decoration hero-decoration-2">
                    <Heart size={50} />
                </div>
                <div className="hero-decoration hero-decoration-3">
                    <Zap size={55} />
                </div>

                <div className="hero-content">
                    <h1 className="hero-title">
                        We're <span className="gradient-text">AouraLiving</span>
                    </h1>
                    <p className="hero-subtitle">
                        Crafting beautiful moments for your home, one product at a time
                    </p>
                </div>
            </section>

            {/* Story Section */}
            <section className="story-section" ref={storyRef}>
                <div className="story-container">
                    <div className="story-content">
                        <h2>Our Story</h2>
                        <p>
                            Founded in 2024, AouraLiving began with a simple vision: to bring joy and elegance
                            into every home. We believe that your living space should reflect your personality
                            and inspire you every single day.
                        </p>
                        <p>
                            From carefully curated home essentials to stunning garden accessories, every product
                            we offer is chosen with love and attention to detail. We're not just selling products;
                            we're helping you create a lifestyle.
                        </p>
                    </div>
                    <div className="story-image">
                        <div className="image-placeholder">
                            <img src="\svg\logo.jpg" width={600} height={600} alt="loading image" />

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
                        <h3>Passion</h3>
                        <p>We're passionate about helping you create spaces you love</p>
                    </div>
                    <div className="value-card">
                        <div className="value-icon">
                            <Award size={40} />
                        </div>
                        <h3>Quality</h3>
                        <p>Only the finest products make it to our collection</p>
                    </div>
                    <div className="value-card">
                        <div className="value-icon">
                            <Users size={40} />
                        </div>
                        <h3>Community</h3>
                        <p>Building a community of home enthusiasts together</p>
                    </div>
                    <div className="value-card">
                        <div className="value-icon">
                            <TrendingUp size={40} />
                        </div>
                        <h3>Innovation</h3>
                        <p>Always discovering new trends and timeless classics</p>
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
                        <div className="stat-label">Products</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number" data-target="50" data-suffix="+">0+</div>
                        <div className="stat-label">Countries</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number" data-target="99" data-suffix="%">0%</div>
                        <div className="stat-label">Satisfaction Rate</div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="team-section" ref={teamRef}>
                <h2 className="section-title">Meet Our Team</h2>
                <div className="team-grid">
                    <div className="team-card">
                        <div className="team-image">
                            <Users size={60} />
                        </div>
                        <h3>Sarah Johnson</h3>
                        <p className="team-role">Founder & CEO</p>
                        <p className="team-bio">Visionary leader with 15 years in home design</p>
                    </div>
                    <div className="team-card">
                        <div className="team-image">
                            <Users size={60} />
                        </div>
                        <h3>Michael Chen</h3>
                        <p className="team-role">Creative Director</p>
                        <p className="team-bio">Award-winning designer passionate about aesthetics</p>
                    </div>
                    <div className="team-card">
                        <div className="team-image">
                            <Users size={60} />
                        </div>
                        <h3>Emma Davis</h3>
                        <p className="team-role">Head of Curation</p>
                        <p className="team-bio">Expert in finding unique and beautiful pieces</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <h2>Ready to Transform Your Space?</h2>
                <p>Explore our collection and find your perfect pieces today</p>
                <button className="cta-button" onClick={() => window.location.href = '/allproducts'}>
                    Shop Now
                </button>
            </section>
        </div>
    )
}

export default About