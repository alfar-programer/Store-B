import React, { useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
    Heart, Eye, Target, Shield, Star, Truck,
    Package, Brush, CheckCircle, Gift,
    Linkedin, Instagram, ArrowRight,
    Leaf, Users, Smile, Handshake
} from 'lucide-react'
import './about.css'

gsap.registerPlugin(ScrollTrigger)

const About = () => {
    const pageRef = useRef(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Hero entrance
            gsap.from('.about-hero-title', { opacity: 0, y: 60, duration: 1, ease: 'power3.out' })
            gsap.from('.about-hero-subtitle', { opacity: 0, y: 40, duration: 1, delay: 0.2, ease: 'power3.out' })
            gsap.from('.about-hero-desc', { opacity: 0, y: 30, duration: 1, delay: 0.4, ease: 'power3.out' })

            // Story section
            gsap.from('.about-story-content', {
                scrollTrigger: { trigger: '.about-story', start: 'top 80%', toggleActions: 'play none none reverse' },
                opacity: 0, y: 40, duration: 0.8, ease: 'power2.out'
            })

            // Mission & Vision
            gsap.from('.mv-card', {
                scrollTrigger: { trigger: '.about-mv', start: 'top 80%', toggleActions: 'play none none reverse' },
                opacity: 0, y: 40, stagger: 0.2, duration: 0.8, ease: 'power2.out'
            })

            // Process steps
            gsap.from('.process-step', {
                scrollTrigger: { trigger: '.about-process', start: 'top 80%', toggleActions: 'play none none reverse' },
                opacity: 0, y: 30, stagger: 0.15, duration: 0.6, ease: 'back.out(1.4)'
            })

            // Team cards
            gsap.from('.team-card', {
                scrollTrigger: { trigger: '.about-team', start: 'top 80%', toggleActions: 'play none none reverse' },
                opacity: 0, y: 40, stagger: 0.12, duration: 0.7, ease: 'power2.out'
            })

            // Values
            gsap.from('.value-card', {
                scrollTrigger: { trigger: '.about-values', start: 'top 80%', toggleActions: 'play none none reverse' },
                opacity: 0, y: 30, stagger: 0.1, duration: 0.6, ease: 'power2.out'
            })

            // Stats counter animation
            const stats = document.querySelectorAll('.about-stat-number')
            stats.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-target'))
                const suffix = stat.getAttribute('data-suffix') || ''
                let obj = { val: 0 }
                
                gsap.to(obj, {
                    scrollTrigger: { trigger: '.about-stats', start: 'top 80%' },
                    val: target,
                    duration: 2,
                    ease: 'power2.out',
                    onUpdate: () => {
                        stat.textContent = Math.floor(obj.val).toLocaleString() + suffix
                    }
                })
            })

            // CTA
            gsap.from('.about-cta-content', {
                scrollTrigger: { trigger: '.about-cta', start: 'top 80%', toggleActions: 'play none none reverse' },
                opacity: 0, y: 40, duration: 0.8, ease: 'power2.out'
            })
        }, pageRef)

        return () => ctx.revert()
    }, [])

    const teamMembers = [
        { name: 'Nouran Ahmed', role: 'Founder & CEO' },
        { name: 'Omar Khaled', role: 'Head of Design' },
        { name: 'Sara Mostafa', role: 'Artisan Liaison' },
        { name: 'Youssef Tarek', role: 'Operations Manager' },
    ]

    const processSteps = [
        { num: 1, img: '/images/plante.png', title: 'Sourcing Materials', desc: 'We carefully select natural, sustainable materials that are safe and long-lasting.' },
        { num: 2, img: '/images/handmade.png', title: 'Crafting Products', desc: 'Skilled artisans craft each piece with attention to detail and passion.' },
        { num: 3, img: '/images/lens.png', title: 'Quality Check', desc: 'Every item goes through rigorous quality checks to ensure perfection.' },
        { num: 4, img: '/images/box.png', title: 'Careful Delivery', desc: 'We pack with care and deliver on time — because you deserve the best.' },
    ]

    const values = [
        { icon: <Leaf size={55} />, title: 'Simplicity', desc: 'Simple designs that bring peace and balance to your space.' },
        { icon: <Heart size={55} />, title: 'Comfort', desc: 'Everything we create is made to make you feel at home.' },
        { icon: <Shield size={55} />, title: 'Quality', desc: 'We never compromise on materials or craftsmanship. Ever.' },
        { icon: <Handshake size={55} />, title: 'Trust', desc: 'Honest communication, reliable service, and lasting relationships.' },
    ]

    return (
        <div className="about-page" ref={pageRef}>
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

            {/* ─── 1. HERO ─────────────────────────────────── */}
            <section className="about-hero">
                <div className="about-hero-bg">
                    <img src="/images/about hero.png" alt="About Hero" className="about-hero-img" />
                </div>
                
                <div className="about-hero-inner">
                    <h1 className="about-hero-title">Our Story</h1>
                    <h2 className="about-hero-subtitle">Built Around <br /> Comfort & Simplicity</h2>
                    <p className="about-hero-desc">
                        At WarmTouch, we believe that the little things at home make the biggest difference.
                    </p>
                </div>
            </section>

            {/* ─── 2. OUR STORY ────────────────────────────── */}
            <section className="about-story">
                <div className="about-story-decorations">
                    <div className="about-decoration-leaf leaf-story-left"></div>
                    <div className="about-decoration-leaf leaf-story-right"></div>
                </div>
                <div className="about-story-content">
                    <h2 className="about-section-title">Our Story</h2>
                    <div className="about-divider">
                        <span className="divider-leaf">❧</span>
                    </div>
                    <div className="about-story-text">
                        <p>
                            WarmTouch was born from a simple belief: your home should be your favorite place.
                            In a world that moves too fast, we create handmade pieces that bring warmth,
                            beauty, and calm into everyday life.
                        </p>
                        <p>
                            We noticed how mass-produced home décor often feels cold and without connection.
                            Our mission is to change that — by supporting local artisans and offering
                            thoughtfully made products that stand the test of time.
                        </p>
                        <p>
                            Every item we make carries a story, a purpose, and a whole lot of heart.
                            Thank you for being part of ours.
                        </p>
                    </div>
                </div>
            </section>

            {/* ─── 3. MISSION & VISION ─────────────────────── */}
            <section className="about-mv">
                <div className="about-mv-grid">
                    <div className="mv-card">
                        <div className="icon-text">
                            <div className="mv-icon-wrap">
                                <Target size={50} />
                            </div>
                            <h3>Our Mission</h3>
                        </div>
                        <p>
                            To create handmade home essentials that combine beauty, function, and comfort
                            — while supporting talented artisans and sustainable practices.
                        </p>
                    </div>
                    <div className="mv-divider"></div>
                    <div className="mv-card">
                        <div className="icon-text">
                            <div className="mv-icon-wrap">
                                <Eye size={50} />
                            </div>
                            <h3>Our Vision</h3>
                        </div>
                        <p>
                            To be the leading brand for handmade home décor in the region — known for
                            quality, trust, and the way we make people feel at home.
                        </p>
                    </div>
                </div>
            </section>

            {/* ─── 4. HOW WE CREATE ───────────────────────── */}
            <section className="about-process">
                <div className="about-process-inner">
                    <h2 className="about-section-title">How We Create</h2>
                    <p className="about-section-subtitle">Thoughtful steps. Beautiful results.</p>
                    <div className="process-grid">
                        {processSteps.map((step, i) => (
                            <div className="process-step" key={i}>
                                <div className="process-num">{step.num}</div>
                                <div className="process-img-wrap">
                                    <img src={step.img} alt={step.title} className="process-step-img" />
                                </div>
                                <h4>{step.title}</h4>
                                <p>{step.desc}</p>
                                {i < processSteps.length - 1 && <div className="process-connector"></div>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── 5. TEAM ─────────────────────────────────── */}
            <section className="about-team">
                <div className="about-team-inner">
                    <h2 className="about-section-title">The People Behind WarmTouch</h2>
                    <p className="about-section-subtitle">Real people. Real passion. Real care.</p>
                    <div className="team-grid">
                        {teamMembers.map((member, i) => (
                            <div className="team-card" key={i}>
                                <div className="team-img">
                                    <img src="/images/people.png" alt={member.name} className="team-member-img" />
                                </div>
                                <div className="team-info">
                                    <h4>{member.name}</h4>
                                    <p>{member.role}</p>
                                    <div className="team-socials">
                                        <a href="#" aria-label={`${member.name} LinkedIn`}><Linkedin size={18} /></a>
                                        <a href="#" aria-label={`${member.name} Instagram`}><Instagram size={18} /></a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── 6. VALUES ───────────────────────────────── */}
            <section className="about-values">
                <div className="about-values-inner">
                    <h2 className="about-section-title">Our Values</h2>
                    <div className="values-grid">
                        {values.map((v, i) => (
                            <div className="value-card" key={i}>
                                <div className="value-header">
                                    <div className="value-icon">{v.icon}</div>
                                    
                                </div>
                                <div className="value-content">
                                    <h4>{v.title}</h4>
                                    <p>{v.desc}</p>
                                </div>
                                {i < values.length - 1 && <div className="value-separator"></div>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── 7. STATS ───────────────────────────────── */}
            <section className="about-stats">
                <div className="about-stats-bar">
                    <div className="about-stat">
                        <div className="stat-icon"><Smile size={55} /></div>
                        <div className="about-stat-number" data-target="10000" data-suffix="+">0+</div>
                        <div className="about-stat-label">Happy Customers</div>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="about-stat">
                        <div className="stat-icon"><Package size={55} /></div>
                        <div className="about-stat-number" data-target="500" data-suffix="+">0+</div>
                        <div className="about-stat-label">Products Delivered</div>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="about-stat">
                        <div className="stat-icon"><Users size={55} /></div>
                        <div className="about-stat-number" data-target="50" data-suffix="+">0+</div>
                        <div className="about-stat-label">Artisan Partners</div>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="about-stat">
                        <div className="stat-icon"><Star size={55} /></div>
                        <div className="about-stat-number" data-target="99" data-suffix="%">0%</div>
                        <div className="about-stat-label">Satisfaction Rate</div>
                    </div>
                </div>
            </section>

            {/* ─── 8. CTA ─────────────────────────────────── */}
            <section className="about-cta">
                <div className="about-cta-bg">
                    <img src="/images/ctaabout.png" alt="CTA background" className="about-cta-img" />
                    <div className="about-cta-overlay"></div>
                </div>
                <div className="about-cta-content">
                    <h2>Start Your Comfort Journey</h2>
                    <p>Explore our collection of handmade treasures and bring warmth to every corner of your home.</p>
                    <Link to="/allproducts" className="about-cta-btn">
                        Explore Our Products <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </div>
    )
}

export default About