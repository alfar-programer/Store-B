import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Palette, Heart, Handshake, Shield } from 'lucide-react'
import './splitsection.css'

const SplitSection = () => {
    const { t } = useTranslation()

    const features = [
        { icon: <Palette size={25} />, label: t('homePage.splitFeat1') },
        { icon: <Heart size={25} />, label: t('homePage.splitFeat2') },
        { icon: <Handshake size={25} />, label: t('homePage.splitFeat3') },
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
                    <span className="split-eyebrow">{t('homePage.splitEyebrow')}</span>
                    <h2 className="split-title">
                        {t('homePage.splitTitle1')}<br />
                        {t('homePage.splitTitle2')} <span className="split-highlight">{t('homePage.splitHighlight')}</span>
                    </h2>
                    <p className="split-desc">
                        {t('homePage.splitDesc1')}
                    </p>
                    <p className="split-desc">
                        {t('homePage.splitDesc2')}
                    </p>
                    <Link to="/allproducts" className="split-btn">
                        {t('homePage.splitBtn')}
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
