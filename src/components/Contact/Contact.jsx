import React, { useState } from 'react'
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react'
import './Contact.css'

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })
    const [status, setStatus] = useState('')

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setStatus('sending')

        // Simulate form submission
        setTimeout(() => {
            setStatus('success')
            setFormData({ name: '', email: '', subject: '', message: '' })
            setTimeout(() => setStatus(''), 3000)
        }, 1500)
    }

    return (
        <div className="contact-page">
            {/* Creative Background */}
            <div className="creative-bg">
                <div className="gradient-blob blob-1"></div>
                <div className="gradient-blob blob-2"></div>
                <div className="gradient-blob blob-3"></div>
                <div className="gradient-blob blob-4"></div>
            </div>

            {/* Hero Section */}
            <div className="contact-hero">
                <div className="contact-hero-content">
                    <h1>Get in Touch</h1>
                    <p>We'd love to hear from you. Here's how you can reach us.</p>
                </div>
            </div>

            <div className="contact-container">
                <div className="contact-grid">
                    {/* Contact Info */}
                    <div className="contact-info-card">
                        <h2>Contact Information</h2>
                        <p className="info-subtitle">Fill up the form and our Team will get back to you within 24 hours.</p>

                        <div className="info-items">
                            <div className="info-item">
                                <div className="icon-box">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h3>Phone</h3>
                                    <p>+1 (555) 123-4567</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="icon-box">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h3>Email</h3>
                                    <p>support@project-b.com</p>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="icon-box">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3>Address</h3>
                                    <p>123 Commerce St, Tech City, TC 90210</p>
                                </div>
                            </div>
                        </div>

                        <div className="social-links">
                            {/* Add social icons if needed */}
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="contact-form-card">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Your Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div className="form-group">
                                <label>Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    placeholder="How can we help?"
                                />
                            </div>

                            <div className="form-group">
                                <label>Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="5"
                                    placeholder="Write your message here..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className={`submit-btn ${status === 'success' ? 'success' : ''}`}
                                disabled={status === 'sending'}
                            >
                                {status === 'sending' ? (
                                    'Sending...'
                                ) : status === 'success' ? (
                                    'Message Sent!'
                                ) : (
                                    <>Send Message <Send size={18} /></>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Contact
