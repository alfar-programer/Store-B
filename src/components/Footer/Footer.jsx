import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import './footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section brand">
                    <h2 className="text-2xl font-bold mb-4">Worm <span className="text-primary">تاتش</span></h2>
                    <p>Curated essentials for modern living. Quality, style, and comfort in every product.</p>
                </div>

                <div className="footer-section links">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/allproducts">All Products</Link></li>
                        <li><Link to="/about">About Us</Link></li>
                    </ul>
                </div>

                <div className="footer-section contact">
                    <h3>Contact Us</h3>
                    <p><MapPin size={16} />Egypt Cairo </p>
                    <p><Phone size={16} /> +20 1098165967</p>
                    <p><Mail size={16} /> WormTouch@gmail.com</p>
                </div>

                <div className="footer-section social">
                    <h3>Follow Us</h3>
                    <div className="social-icons">
                        <a href="#" aria-label="Facebook"><Facebook size={24} /></a>
                        <a href="#" aria-label="Twitter"><Twitter size={24} /></a>
                        <a href="#" aria-label="Instagram"><Instagram size={24} /></a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Worm Touch. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
