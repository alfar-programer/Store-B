import React, { useRef } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import './testimonials.css'

const Testimonials = () => {
    const scrollRef = useRef(null)

    const reviews = [
        {
            name: 'Nourash H.',
            verified: true,
            text: 'المنتج رائع والتغليف ممتاز! كمية جودة غالبة والتوصيل كان سريع جداً.',
            rating: 5,
        },
        {
            name: 'Omar K.',
            verified: true,
            text: 'قطع مميزة سواء ديكورات أو مكرميات. بجد أفضل متجر يدوي.',
            rating: 5,
        },
        {
            name: 'Sarah M.',
            verified: false,
            text: 'أجمل هدايا يدوية ممكن تلاقيها. اشتريت ماجات للعائلة والكل حبها!',
            rating: 5,
        },
        {
            name: 'Youssef T.',
            verified: false,
            text: 'كله مصنوع بعناية فائقة ودقة في التفاصيل. شكراً ورم تاتش!',
            rating: 5,
        },
         {
            name: 'Youssef DA.',
            verified: false,
            text: 'كله مصنوع بعناية فائقة ودقة في التفاصيل. شكراً ورم تاتش!',
            rating: 3,
        },
         {
            name: 'Youssef SA.',
            verified: false,
            text: 'كله مصنوع بعناية فائقة ودقة في التفاصيل. شكراً ورم تاتش!',
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
                    <h2 className="testimonials-title">Loved by Our Community</h2>
                    <div className="testimonials-summary">
                        <div className="summary-stars">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={16} fill="#E8A838" color="#E8A838" />
                            ))}
                        </div>
                        <span className="summary-text">4.8/5 from 1,200+ reviews</span>
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
                                    <div className="testimonial-img"><div className=""><img src="../../../../public/images/about_cta.png" alt="" /></div></div>
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
