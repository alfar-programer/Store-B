import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Phone, Mail, MapPin, Send, Clock, MessageCircle, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../context/LanguageContext'
import './contact.css'

const Contact = () => {
    const { t } = useTranslation()
    const { lang } = useLanguage()
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })
    const [status, setStatus] = useState('') // '' | 'sending' | 'success'

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setStatus('sending')

        const to = 'info@warmtouch.store'
        const subject = encodeURIComponent(formData.subject || t('contactPage.defaultSubject'))
        const body = encodeURIComponent(
            `${t('contactPage.emailBodyName')}: ${formData.name}\n` +
            `${t('contactPage.emailBodyEmail')}: ${formData.email}\n\n` +
            `${formData.message}`
        )

        // Open the user's default email client with fields pre-filled
        window.location.href = `mailto:${to}?subject=${subject}&body=${body}`

        // Show success state after a short delay
        setTimeout(() => {
            setStatus('success')
            setFormData({ name: '', email: '', subject: '', message: '' })
            setTimeout(() => setStatus(''), 5000)
        }, 800)
    }

    return (
        <div className="contact-page">
            <Helmet>
                <title>{t('contactPage.pageTitle')}</title>
                <meta name="description" content={t('contactPage.pageDesc')} />
                <link rel="canonical" href="https://www.warmtouch.store/contact" />
            </Helmet>

            {/* ── Page Hero ─────────────────────────────────────── */}
            <section className="cp-hero">
                <div className="cp-hero-bg" aria-hidden="true" />
                <div className="cp-hero-content">
                    <span className="cp-eyebrow">{t('contactPage.eyebrow')}</span>
                    <h1 className="cp-hero-title">{t('contactPage.heroTitle')}</h1>
                    <p className="cp-hero-sub">
                        {t('contactPage.heroSub1')}<br />
                        {t('contactPage.heroSub2')}
                    </p>
                </div>
            </section>

            {/* ── Contact Body ───────────────────────────────────── */}
            <section className="cp-body">
                <div className="cp-container">

                    {/* Left: Info Cards */}
                    <aside className="cp-info">
                        <div className="cp-info-card">
                            <div className="cp-info-icon">
                                <Phone size={22} />
                            </div>
                            <div>
                                <h3>{t('contactPage.phone')}</h3>
                                <p dir="ltr">+20 109 816 5967</p>
                                <span className="cp-info-note">{t('contactPage.phoneNote')}</span>
                            </div>
                        </div>

                        <div className="cp-info-card">
                            <div className="cp-info-icon">
                                <Mail size={22} />
                            </div>
                            <div>
                                <h3>{t('contactPage.email')}</h3>
                                <p>info@warmtouch.store</p>
                                <span className="cp-info-note">{t('contactPage.emailNote')}</span>
                            </div>
                        </div>

                        <div className="cp-info-card">
                            <div className="cp-info-icon">
                                <MapPin size={22} />
                            </div>
                            <div>
                                <h3>{t('contactPage.addressTitle')}</h3>
                                <p>{lang === 'ar' ? t('contactPage.addressAr') : t('contactPage.addressEn')}</p>
                                <span className="cp-info-note">{lang === 'ar' ? t('contactPage.addressEn') : t('contactPage.addressAr')}</span>
                            </div>
                        </div>

                        <div className="cp-info-card">
                            <div className="cp-info-icon">
                                <Clock size={22} />
                            </div>
                            <div>
                                <h3>{t('contactPage.hoursTitle')}</h3>
                                <p>{t('contactPage.hoursDays')}</p>
                                <span className="cp-info-note">{t('contactPage.hoursTime')}</span>
                            </div>
                        </div>
                    </aside>

                    {/* Right: Form */}
                    <div className="cp-form-wrapper">
                        {status === 'success' ? (
                            <div className="cp-success-state">
                                <CheckCircle size={64} className="cp-success-icon" />
                                <h2>{t('contactPage.successTitle')}</h2>
                                <p>{t('contactPage.successDesc')}</p>
                            </div>
                        ) : (
                            <form className="cp-form" onSubmit={handleSubmit} noValidate>
                                <div className="cp-form-header">
                                    <MessageCircle size={24} className="cp-form-icon" />
                                    <h2>{t('contactPage.formTitle')}</h2>
                                </div>

                                <div className="cp-form-row">
                                    <div className="cp-field">
                                        <label htmlFor="contact-name">{t('contactPage.labelName')}</label>
                                        <input
                                            id="contact-name"
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder={t('contactPage.placeholderName')}
                                        />
                                    </div>
                                    <div className="cp-field">
                                        <label htmlFor="contact-email">{t('contactPage.labelEmail')}</label>
                                        <input
                                            id="contact-email"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="example@email.com"
                                            dir="ltr"
                                        />
                                    </div>
                                </div>

                                <div className="cp-field">
                                    <label htmlFor="contact-subject">{t('contactPage.labelSubject')}</label>
                                    <input
                                        id="contact-subject"
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        placeholder={t('contactPage.placeholderSubject')}
                                    />
                                </div>

                                <div className="cp-field">
                                    <label htmlFor="contact-message">{t('contactPage.labelMessage')}</label>
                                    <textarea
                                        id="contact-message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={6}
                                        placeholder={t('contactPage.placeholderMessage')}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className={`cp-submit ${status === 'sending' ? 'sending' : ''}`}
                                    disabled={status === 'sending'}
                                    id="contact-submit-btn"
                                >
                                    {status === 'sending' ? (
                                        <>
                                            <span className="cp-spinner" />
                                            {t('contactPage.sending')}
                                        </>
                                    ) : (
                                        <>
                                            {t('contactPage.submit')}
                                            <Send size={18} />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>

                </div>
            </section>
        </div>
    )
}

export default Contact
