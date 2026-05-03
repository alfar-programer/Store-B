import React from 'react'
import { Award, Gem, Truck, Users } from 'lucide-react'
import './trustbadges.css'

const TrustBadges = () => {
    const badges = [
        {
            icon: <Award size={28} strokeWidth={1.6} />,
            title: 'Premium Quality',
            description: 'Hand-crafted with care using the finest materials'
        },
        {
            icon: <Gem size={28} strokeWidth={1.6} />,
            title: 'Affordable Luxury',
            description: 'Beautiful pieces at prices you\'ll love'
        },
        {
            icon: <Truck size={28} strokeWidth={1.6} />,
            title: 'Fast Delivery',
            description: 'Quick and reliable delivery across Egypt'
        },
        {
            icon: <Users size={28} strokeWidth={1.6} />,
            title: 'Trusted by Thousands',
            description: '10,000+ customers love shopping with us'
        }
    ]

    return (
        <section className="features-bar">
            <div className="features-container">
                {badges.map((badge, index) => (
                    <div className="feature-item" key={index}>
                        <div className="feature-icon">{badge.icon}</div>
                        <div className="feature-text">
                            <h3 className="feature-title">{badge.title}</h3>
                            <p className="feature-desc">{badge.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default TrustBadges
