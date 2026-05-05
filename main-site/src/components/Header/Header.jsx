import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, ShoppingCart, User, Menu, X, Heart } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useSearch } from '../../context/SearchContext'
import { useAuth } from '../../context/AuthContext'
import { useFavorites } from '../../context/FavoritesContext'
import { useLanguage } from '../../context/LanguageContext'
import { useTranslation } from 'react-i18next'
import './header.css'

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { getCartCount } = useCart();
    const { openSearch } = useSearch();
    const { user, logout } = useAuth();
    const { getFavoritesCount } = useFavorites();
    const { lang, toggleLang, isRTL } = useLanguage();
    const { t } = useTranslation();
    const cartCount = getCartCount();
    const favoritesCount = getFavoritesCount();

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <>
            {/* Announcement Bar */}
            <div className="announcement-bar">
                <p>{t('header.announcement')}</p>
            </div>

            <header className="main-header">
                <div className="header-inner">
                    {/* Logo */}
                    <div className="header-logo">
                        <Link to="/" className="logo-link">
                            <div className="logo-icon-box">
                                <img src="/svg/logo2.png" alt="Warm Touch Logo" className="logo-image" />
                            </div>
                            <span className="logo-text">
                                <span className="logo-warm">Warm</span>
                                <span className="logo-touch">Touch</span>
                            </span>
                        </Link>
                    </div>

                    {/* Center Navigation */}
                    <nav className={`header-nav ${isMobileMenuOpen ? 'active' : ''}`}>
                        <ul>
                            {[
                                { name: t('nav.home'), path: '/' },
                                { name: t('nav.allProducts'), path: '/allproducts' },
                                { name: t('nav.about'), path: '/about' },
                                ...(user ? [{ name: t('nav.myOrders'), path: '/my-orders' }] : []),
                                ...(isMobileMenuOpen && user ? [
                                    { name: t('nav.myProfile'), path: '/profile' },
                                    ...(user.role === 'admin' ? [{ name: t('nav.adminDashboard'), path: `http://localhost:${import.meta.env.VITE_ADMIN_DASHBOARD_PORT || '5174'}`, external: true }] : [])
                                ] : []),
                                ...(isMobileMenuOpen && !user ? [
                                    { name: t('nav.login'), path: '/login' },
                                    { name: t('nav.register'), path: '/register' }
                                ] : [])
                            ].map((item) => (
                                <li key={item.name}>
                                    {item.external ? (
                                        <a href={item.path} className="nav-link" onClick={closeMobileMenu}>
                                            {item.name}
                                        </a>
                                    ) : (
                                        <Link
                                            to={item.path}
                                            className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                                            onClick={closeMobileMenu}
                                        >
                                            {item.name}
                                        </Link>
                                    )}
                                </li>
                            ))}
                            {isMobileMenuOpen && user && (
                                <li>
                                    <button
                                        onClick={() => {
                                            logout();
                                            closeMobileMenu();
                                        }}
                                        className="nav-link mobile-logout"
                                    >
                                        {t('nav.logout')}
                                    </button>
                                </li>
                            )}
                        </ul>
                    </nav>

                    {/* Right Actions */}
                    <div className="header-actions">
                        {/* Premium Language Switcher */}
                        <div 
                            className={`lang-switcher-container ${lang === 'ar' ? 'is-ar' : ''}`}
                            onClick={toggleLang}
                            title={lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
                            role="button"
                            tabIndex={0}
                        >
                            <div className="lang-switcher-pill"></div>
                            <span className={`lang-option ${lang === 'en' ? 'active' : ''}`}>EN</span>
                            <span className={`lang-option ${lang === 'ar' ? 'active' : ''}`}>ع</span>
                        </div>

                        <button
                            className="icon-btn"
                            aria-label="Search"
                            onClick={openSearch}
                        >
                            <Search size={20} strokeWidth={1.8} />
                        </button>

                        <button
                            className="icon-btn"
                            aria-label="Favorites"
                            onClick={() => navigate('/favorites')}
                        >
                            <Heart size={20} strokeWidth={1.8} />
                            {favoritesCount > 0 && (
                                <span className="action-badge">{favoritesCount}</span>
                            )}
                        </button>

                        <button
                            className="icon-btn"
                            aria-label="Cart"
                            onClick={() => navigate('/cart')}
                        >
                            <ShoppingCart size={20} strokeWidth={1.8} />
                            {cartCount > 0 && (
                                <span className="action-badge">{cartCount}</span>
                            )}
                        </button>

                        <div className="profile-dropdown-wrapper">
                            <button
                                className="icon-btn"
                                aria-label="Profile"
                                onClick={(e) => {
                                    if (e.target.closest('.account-dropdown-menu')) return;
                                    user ? navigate('/profile') : navigate('/login');
                                }}
                            >
                                <User size={20} strokeWidth={1.8} />
                            </button>

                            {user && (
                                <div className="account-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                                    <div className="dropdown-header">
                                        <p className="user-name">{user.name}</p>
                                        <p className="user-email">{user.email}</p>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    <Link to="/profile" className="dropdown-item">My Profile</Link>
                                    <Link to="/my-orders" className="dropdown-item">My Orders</Link>
                                    {user.role === 'admin' && (
                                        <a href={`http://localhost:${import.meta.env.VITE_ADMIN_DASHBOARD_PORT || '5174'}`} className="dropdown-item">
                                            Admin Dashboard
                                        </a>
                                    )}
                                    <div className="dropdown-divider"></div>
                                    <button onClick={logout} className="dropdown-item text-red">Logout</button>
                                </div>
                            )}
                        </div>

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
