import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Phone, Mail, MapPin, Send, Clock, MessageCircle, CheckCircle } from 'lucide-react'
import './contact.css'

const Contact = () => {
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
        const subject = encodeURIComponent(formData.subject || 'رسالة من موقع Warm Touch')
        const body = encodeURIComponent(
            `الاسم: ${formData.name}\n` +
            `البريد الإلكتروني: ${formData.email}\n\n` +
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
                <title>تواصل معنا | Contact Us — Warm Touch</title>
                <meta name="description" content="تواصل مع فريق Warm Touch لأي استفسار أو دعم. Contact our team via email, phone, or the form below." />
                <link rel="canonical" href="https://www.warmtouch.store/contact" />
            </Helmet>

            {/* ── Page Hero ─────────────────────────────────────── */}
            <section className="cp-hero">
                <div className="cp-hero-bg" aria-hidden="true" />
                <div className="cp-hero-content">
                    <span className="cp-eyebrow">تواصل معنا</span>
                    <h1 className="cp-hero-title">نحب أن نسمع منك</h1>
                    <p className="cp-hero-sub">
                        هل لديك سؤال؟ مشكلة في طلب؟ أو فقط تريد أن تقول مرحبا؟<br />
                        فريقنا جاهز للرد خلال 24 ساعة.
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
                                <h3>الهاتف</h3>
                                <p dir="ltr">+20 109 816 5967</p>
                                <span className="cp-info-note">متاح من السبت للخميس</span>
                            </div>
                        </div>

                        <div className="cp-info-card">
                            <div className="cp-info-icon">
                                <Mail size={22} />
                            </div>
                            <div>
                                <h3>البريد الإلكتروني</h3>
                                <p>info@warmtouch.store</p>
                                <span className="cp-info-note">رد خلال 24 ساعة</span>
                            </div>
                        </div>

                        <div className="cp-info-card">
                            <div className="cp-info-icon">
                                <MapPin size={22} />
                            </div>
                            <div>
                                <h3>العنوان</h3>
                                <p>مصر، الجيزة، أكتوبر — حديقة أكتوبر 247</p>
                                <span className="cp-info-note">Egypt, Giza — October Garden 247</span>
                            </div>
                        </div>

                        <div className="cp-info-card">
                            <div className="cp-info-icon">
                                <Clock size={22} />
                            </div>
                            <div>
                                <h3>ساعات العمل</h3>
                                <p>السبت – الخميس</p>
                                <span className="cp-info-note">10:00 ص — 8:00 م</span>
                            </div>
                        </div>
                    </aside>

                    {/* Right: Form */}
                    <div className="cp-form-wrapper">
                        {status === 'success' ? (
                            <div className="cp-success-state">
                                <CheckCircle size={64} className="cp-success-icon" />
                                <h2>تم إرسال رسالتك!</h2>
                                <p>شكرًا لتواصلك معنا. سيرد فريقنا خلال 24 ساعة.</p>
                            </div>
                        ) : (
                            <form className="cp-form" onSubmit={handleSubmit} noValidate>
                                <div className="cp-form-header">
                                    <MessageCircle size={24} className="cp-form-icon" />
                                    <h2>أرسل رسالة</h2>
                                </div>

                                <div className="cp-form-row">
                                    <div className="cp-field">
                                        <label htmlFor="contact-name">الاسم</label>
                                        <input
                                            id="contact-name"
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="اسمك الكامل"
                                        />
                                    </div>
                                    <div className="cp-field">
                                        <label htmlFor="contact-email">البريد الإلكتروني</label>
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
                                    <label htmlFor="contact-subject">الموضوع</label>
                                    <input
                                        id="contact-subject"
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        placeholder="كيف يمكننا مساعدتك؟"
                                    />
                                </div>

                                <div className="cp-field">
                                    <label htmlFor="contact-message">الرسالة</label>
                                    <textarea
                                        id="contact-message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={6}
                                        placeholder="اكتب رسالتك هنا..."
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
                                            جارٍ الإرسال...
                                        </>
                                    ) : (
                                        <>
                                            إرسال الرسالة
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
