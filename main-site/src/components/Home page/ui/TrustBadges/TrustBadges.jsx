import React from 'react'
import { Award, Gem, Truck, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import './trustbadges.css'

const TrustBadges = () => {
    const { t } = useTranslation()

    const badges = [
        {
            icon: <Award size={28} strokeWidth={1.6} />,
            title: t('homePage.trustPremium'),
            description: t('homePage.trustPremiumDesc')
        },
        {
            icon: <Gem size={28} strokeWidth={1.6} />,
            title: t('homePage.trustAffordable'),
            description: t('homePage.trustAffordableDesc')
        },
        {
            icon: <Truck size={28} strokeWidth={1.6} />,
            title: t('homePage.trustFast'),
            description: t('homePage.trustFastDesc')
        },
        {
            icon: <Users size={28} strokeWidth={1.6} />,
            title: t('homePage.trustUsers'),
            description: t('homePage.trustUsersDesc')
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
