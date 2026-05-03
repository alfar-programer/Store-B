import React from 'react'
import { Link } from 'react-router-dom'
import { Facebook, Instagram, Phone, Mail, MapPin } from 'lucide-react'
import './footer.css'

const Footer = () => {
    return (
        <footer className="footer-v2">
            <div className="footer-v2-container">
                <div className="footer-v2-grid">
                    {/* Brand */}
                    <div className="footer-v2-brand">
                        <Link to="/" className="footer-logo">
                            <span className="footer-logo-warm">Warm</span>
                            <span className="footer-logo-touch">Touch</span>
                        </Link>
                        <p className="footer-v2-brand-desc">
                            Handmade décor and home accessories. Turning every corner of your home into a place of warmth.
                        </p>
                        <div className="footer-socials">
                            <a href="https://www.facebook.com/profile.php?id=100081186777200" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                                <Facebook size={18} />
                            </a>
                            <a href="https://www.instagram.com/warm.totuch/?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                <Instagram size={18} />
                            </a>
                            <a href="https://www.tiktok.com/@tiktok.comme47" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.94a8.16 8.16 0 0 0 4.78 1.52V7.01a4.85 4.85 0 0 1-1.01-.32z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Shop */}
                    <div className="footer-v2-col">
                        <h4>Shop</h4>
                        <ul>
                            <li><Link to="/allproducts">All Products</Link></li>
                            <li><Link to="/allproducts?sort=newest">New Arrivals</Link></li>
                            <li><Link to="/allproducts?sort=popular">Best Sellers</Link></li>
                            <li><Link to="/allproducts?sale=true">Sale</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="footer-v2-col">
                        <h4>Company</h4>
                        <ul>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/about">Our Story</Link></li>
                            <li><Link to="/about">Blog</Link></li>
                            <li><Link to="/contact">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="footer-v2-col">
                        <h4>Support</h4>
                        <ul>
                            <li><Link to="/contact">FAQs</Link></li>
                            <li><Link to="/contact">Shipping & Delivery</Link></li>
                            <li><Link to="/contact">Returns & Refunds</Link></li>
                            <li><Link to="/my-orders">Track Your Order</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="footer-v2-col footer-contact">
                        <h4>Contact</h4>
                        <ul>
                            <li>
                                <Phone size={14} />
                                <span>+20 109 816 5967</span>
                            </li>
                            <li>
                                <Mail size={14} />
                                <span>warmtouch.eg@gmail.com</span>
                            </li>
                            <li>
                                <MapPin size={14} />
                                <span>Egypt, Giza, October Garden 247</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="footer-v2-bottom">
                <div className="footer-v2-bottom-inner">
                    <p>&copy; {new Date().getFullYear()} Warm Touch. All rights reserved.</p>
                    <div className="footer-v2-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms & Conditions</a>
                    </div>
                    <div className="footer-payment-icons">
                        <span className="payment-icon">VISA</span>
                        <span className="payment-icon">MC</span>
                        <span className="payment-icon">meeza</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
