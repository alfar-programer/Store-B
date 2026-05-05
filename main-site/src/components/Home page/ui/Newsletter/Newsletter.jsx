import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './newsletter.css'

const Newsletter = () => {
    const { t } = useTranslation()
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
                        {t('homePage.newsTitle1')} <span className="newsletter-v2-highlight">{t('homePage.newsHighlight')}</span> {t('homePage.newsTitle2')}
                    </h2>
                    <p className="newsletter-v2-desc">
                        {t('homePage.newsDesc')}
                    </p>

                    <form className="newsletter-v2-form" onSubmit={handleSubmit}>
                        <div className="newsletter-v2-input-group">
                            <input
                                type="email"
                                placeholder={t('homePage.newsPlaceholder')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="newsletter-v2-input"
                                required
                            />
                            <button type="submit" className="newsletter-v2-btn">
                                {t('homePage.newsBtn')}
                            </button>
                        </div>

                        {status === 'success' && (
                            <p className="newsletter-v2-status success">
                                {t('homePage.newsSuccess')}
                            </p>
                        )}
                        {status === 'error' && (
                            <p className="newsletter-v2-status error">
                                {t('homePage.newsError')}
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </section>
    )
}

export default Newsletter
