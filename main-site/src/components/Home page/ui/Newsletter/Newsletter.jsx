import React, { useState } from 'react'
import './newsletter.css'

const Newsletter = () => {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState('') // 'success', 'error', or ''

    const handleSubmit = (e) => {
        e.preventDefault()

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setStatus('error')
            return
        }

        // TODO: Integrate with your newsletter service (e.g., Mailchimp, SendGrid)
        console.log('Newsletter signup:', email)

        setStatus('success')
        setEmail('')

        // Reset status after 3 seconds
        setTimeout(() => {
            setStatus('')
        }, 3000)
    }

    return (
        <section className="newsletter">
            <div className="newsletter-container">
                <div className="newsletter-content">
                    <h2>Stay Connected</h2>
                    <p className="newsletter-subtitle">
                        Subscribe to get special offers, free giveaways, and updates
                    </p>
                    <p className="newsletter-subtitle-ar">
                        اشترك للحصول على عروض خاصة وتحديثات
                    </p>

                    <form className="newsletter-form" onSubmit={handleSubmit}>
                        <div className="form-wrapper">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="newsletter-input"
                                required
                            />
                            <button type="submit" className="newsletter-button">
                                Subscribe
                            </button>
                        </div>

                        {status === 'success' && (
                            <p className="status-message success">
                                ✓ Thank you for subscribing!
                            </p>
                        )}
                        {status === 'error' && (
                            <p className="status-message error">
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
