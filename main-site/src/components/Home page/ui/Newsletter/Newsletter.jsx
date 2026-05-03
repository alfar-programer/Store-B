import React, { useState } from 'react'
import './newsletter.css'

const Newsletter = () => {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setStatus('error')
            return
        }
        console.log('Newsletter signup:', email)
        setStatus('success')
        setEmail('')
        setTimeout(() => setStatus(''), 3000)
    }

    return (
        <section className="newsletter-v2">
            <div className="newsletter-v2-container">
                <div className="newsletter-v2-content">
                    <h2 className="newsletter-v2-title">
                        Get <span className="newsletter-v2-highlight">10% off</span> your first order
                    </h2>
                    <p className="newsletter-v2-desc">
                        Join our community and be the first to know about new arrivals, exclusive offers, and home inspiration.
                    </p>

                    <form className="newsletter-v2-form" onSubmit={handleSubmit}>
                        <div className="newsletter-v2-input-group">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="newsletter-v2-input"
                                required
                            />
                            <button type="submit" className="newsletter-v2-btn">
                                Subscribe
                            </button>
                        </div>

                        {status === 'success' && (
                            <p className="newsletter-v2-status success">
                                ✓ Thank you for subscribing!
                            </p>
                        )}
                        {status === 'error' && (
                            <p className="newsletter-v2-status error">
                                ✗ Please enter a valid email address
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </section>
    )
}

export default Newsletter
