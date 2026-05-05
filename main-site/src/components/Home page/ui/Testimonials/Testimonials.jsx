import React, { useRef } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import './testimonials.css'

const Testimonials = () => {
    const scrollRef = useRef(null)
    const { t } = useTranslation()

    const reviews = [
        {
            name: 'Nourash H.',
            verified: true,
            text: t('homePage.test1Text'),
            rating: 5,
        },
        {
            name: 'Omar K.',
            verified: true,
            text: t('homePage.test2Text'),
            rating: 5,
        },
        {
            name: 'Sarah M.',
            verified: false,
            text: t('homePage.test3Text'),
            rating: 5,
        },
        {
            name: 'Youssef T.',
            verified: false,
            text: t('homePage.test4Text'),
            rating: 5,
        },
        {
            name: 'Youssef DA.',
            verified: false,
            text: t('homePage.test5Text'),
            rating: 3,
        },
        {
            name: 'Youssef SA.',
            verified: false,
            text: t('homePage.test6Text'),
            rating: 4.5,
        },
    ]

    const scroll = (dir) => {
        if (scrollRef.current) {
            const amount = 320
            scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
        }
    }

    return (
        <section className="testimonials-section">
            <div className="testimonials-container">
                {/* Header */}
                <div className="testimonials-header">
                    <h2 className="testimonials-title">{t('homePage.testTitle')}</h2>
                    <div className="testimonials-summary">
                        <div className="summary-stars">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={16} fill="#E8A838" color="#E8A838" />
                            ))}
                        </div>
                        <span className="summary-text">{t('homePage.testSummary')}</span>
                    </div>
                </div>

                {/* Cards */}
                <div className="testimonials-wrapper">
                    <button className="testimonial-nav-btn nav-prev" onClick={() => scroll('left')} aria-label="Previous">
                        <ChevronLeft size={20} />
                    </button>

                    <div className="testimonials-scroll" ref={scrollRef}>
                        {reviews.map((review, index) => (
                            <div className="testimonial-card" key={index}>
                                <div className="testimonial-top">
                                    <div className="testimonial-avatar">
                                        <div className="image-placeholder"></div>
                                    </div>
                                    <div className="testimonial-info">
                                        <span className="testimonial-name">
                                            {review.name}
                                            {review.verified && <span className="verified-badge">✓</span>}
                                        </span>
                                        <div className="testimonial-stars">
                                            {[...Array(Math.floor(review.rating))].map((_, i) => (
                                                <Star key={i} size={13} fill="#E8A838" color="#E8A838" />
                                            ))}
                                            {review.rating % 1 !== 0 && (
                                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                                    <Star size={13} color="#E8A838" />
                                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', overflow: 'hidden' }}>
                                                        <Star size={13} fill="#E8A838" color="#E8A838" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <p className="testimonial-text">{review.text}</p>
                                {/* Review images */}
                                <div className="testimonial-images">
                                    <div className="testimonial-img"><div className=""><img src="images/about_cta.png" alt="" /></div></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="testimonial-nav-btn nav-next" onClick={() => scroll('right')} aria-label="Next">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </section>
    )
}

export default Testimonials
