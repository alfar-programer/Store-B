import React from 'react'
import { Link } from 'react-router-dom'
import { Palette, Heart, Handshake, Shield } from 'lucide-react'
import './splitsection.css'

const SplitSection = () => {
    const features = [
        { icon: <Palette size={25} />, label: 'Timeless Designs' },
        { icon: <Heart size={25} />, label: 'Handmade with Love' },
        { icon: <Handshake size={25} />, label: 'Made to Last' },
    ]

    return (
        <section className="split-section">
            <div className="split-container">
                {/* LEFT: Image */}
                <div className="split-image">
                    <div className="split-image-card">
                        <img src="images/splitsection.jpeg" alt="" />
                    </div>
                </div>

                {/* RIGHT: Content */}
                <div className="split-content">
                    <span className="split-eyebrow">MADE FOR REAL LIFE</span>
                    <h2 className="split-title">
                        Designed for Your<br />
                        Everyday <span className="split-highlight">Comfort</span>
                    </h2>
                    <p className="split-desc">
                        Every piece we create is inspired by the beauty of
                        simple living and the joy of coming home.
                    </p>
                    <p className="split-desc">
                        From cozy mornings to peaceful nights, WarmTouch
                        is here to be part of your everyday moments.
                    </p>
                    <Link to="/allproducts" className="split-btn">
                        Learn More
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </Link>

                    <div className="split-features">
                        {features.map((f, i) => (
                            <div className="split-feature-item" key={i}>
                                <span className="split-feature-icon">{f.icon}</span>
                                <span className="split-feature-label">{f.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SplitSection
