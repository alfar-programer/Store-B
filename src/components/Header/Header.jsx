import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useSearch } from '../../context/SearchContext'
import './header.css'

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { getCartCount } = useCart();
    const { openSearch } = useSearch();
    const cartCount = getCartCount();

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <header className="main-header fixed top-0 left-0 w-full z-[1000] bg-white/98 backdrop-blur-lg shadow-md py-5 transition-all duration-300">
                <div className="max-w-[1400px] mx-auto px-10 flex justify-between items-center">
                    {/* Logo */}
                    <div className="logo-container">
                        <Link to="/" className="flex items-center">
                            <img src="/svg/logo_black.png" alt="Wafa Living" className="h-12 w-auto" />
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className={isMobileMenuOpen ? 'active' : ''}>
                        <ul className="flex gap-10 list-none m-0 p-0">
                            {['Home', 'AllProducts', 'About', 'Contact'].map((item) => (
                                <li key={item}>
                                    <Link
                                        to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                                        className={`nav-link ${item === 'Home' ? 'active' : ''}`}
                                        onClick={closeMobileMenu}
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Actions */}
                    <div className="flex gap-4 items-center">
                        <button
                            className="icon-btn"
                            aria-label="Search"
                            onClick={openSearch}
                        >
                            <Search size={22} strokeWidth={2} />
                        </button>
                        <button
                            className="icon-btn cart-btn"
                            aria-label="Cart"
                            onClick={() => navigate('/cart')}
                        >
                            <ShoppingCart size={22} strokeWidth={2} />
                            {cartCount > 0 && (
                                <span className="cart-badge">{cartCount}</span>
                            )}
                        </button>
                        <button className="icon-btn" aria-label="Profile">
                            <User size={22} strokeWidth={2} />
                        </button>

                        {/* Mobile Menu Button */}
                        <button
                            className="mobile-menu-btn"
                            aria-label="Toggle Menu"
                            onClick={toggleMobileMenu}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Overlay */}
            <div
                className={`mobile-overlay ${isMobileMenuOpen ? 'active' : ''}`}
                onClick={closeMobileMenu}
            ></div>
        </>
    )
}

export default Header
