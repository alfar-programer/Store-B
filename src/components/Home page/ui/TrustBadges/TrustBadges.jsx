import React from 'react'
import './trustbadges.css'

const TrustBadges = () => {
    const badges = [
        {
            icon: '🧶',
            title: 'Handmade with Love',
            titleAr: 'صُنع بحب',
            description: 'Every piece crafted with care and attention to detail'
        },
        {
            icon: '🚚',
            title: 'Fast Shipping',
            titleAr: 'شحن سريع',
            description: 'Quick delivery across Egypt'
        },
        {
            icon: '🔒',
            title: 'Secure Payment',
            titleAr: 'دفع آمن',
            description: 'Safe and encrypted transactions'
        },
        {
            icon: '⭐',
            title: 'Quality Guaranteed',
            titleAr: 'جودة مضمونة',
            description: 'Premium materials and craftsmanship'
        }
    ]

    return (
        <section className="trust-badges">
            <div className="trust-badges-container">
                <div className="badges-grid">
                    {badges.map((badge, index) => (
                        <div className="badge-card" key={index}>
                            <div className="badge-icon">{badge.icon}</div>
                            <h3 className="badge-title">
                                {badge.title}
                                <span className="badge-title-ar">{badge.titleAr}</span>
                            </h3>
                            <p className="badge-description">{badge.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default TrustBadges
