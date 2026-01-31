import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useSearch } from '../../context/SearchContext'
import { useAuth } from '../../context/AuthContext'
import './header.css'

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { getCartCount } = useCart();
    const { openSearch } = useSearch();
    const { user, logout } = useAuth();
    const cartCount = getCartCount();

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    // Helper function to check if a nav item is active
    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <>
            <header className="main-header fixed top-0 left-0 w-full z-[1000] bg-white/98 backdrop-blur-lg shadow-md py-5 transition-all duration-300">
                <div className="mx-auto px-10 flex justify-between items-center">
                    {/* Logo */}
                    <div className="logo-container">
                        <Link to="/" className="logo-professional group">
                            <div className="logo-icon-box">
                                <img src="/svg/logo2.png" alt="Worm Touch Logo" className="logo-image" />
                            </div>
                            <div className="logo-text-group">
                                <div className="flex items-center gap-1.5">
                                    <span className="logo-main-text">WARM</span>
                                    <span className="logo-sub-text">TOUCH</span>
                                </div>
                                <span className="logo-arabic">تاتش</span>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className={isMobileMenuOpen ? 'active' : ''}>
                        <ul className="flex gap-10 list-none m-0 p-0">
                            {[
                                { name: 'Home', path: '/' },
                                { name: 'AllProducts', path: '/allproducts' },
                                { name: 'About', path: '/about' },
                                { name: 'Contact', path: '/contact' },
                                // Show My Orders primarily if logged in, but also in list generally
                                ...(user ? [{ name: 'My Orders', path: '/my-orders' }] : []),
                                // Mobile Only: Profile Links (since hidden in header)
                                ...(isMobileMenuOpen && user ? [
                                    { name: 'My Profile', path: '/profile' },
                                    ...(user.role === 'admin' ? [{ name: 'Admin Dashboard', path: `http://localhost:${import.meta.env.VITE_ADMIN_DASHBOARD_PORT || '5174'}`, external: true }] : [])
                                ] : []),
                                // Mobile Only: Login if not logged in
                                ...(isMobileMenuOpen && !user ? [
                                    { name: 'Login', path: '/login' },
                                    { name: 'Register', path: '/register' }
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
                            {/* Mobile Only: Logout */}
                            {isMobileMenuOpen && user && (
                                <li>
                                    <button
                                        onClick={() => {
                                            logout();
                                            closeMobileMenu();
                                        }}
                                        className="nav-link text-red-500 w-full text-left"
                                        style={{ color: '#e53e3e' }}
                                    >
                                        Logout
                                    </button>
                                </li>
                            )}
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

                        <div className="relative group hidden lg:block">
                            <button
                                className="icon-btn"
                                aria-label="Profile"
                                onClick={(e) => {
                                    // Don't navigate if clicking inside dropdown
                                    if (e.target.closest('.account-dropdown-menu')) return;
                                    user ? navigate('/profile') : navigate('/login');
                                }}
                            >
                                <User size={22} strokeWidth={2} />
                            </button>

                            {user && (
                                <div
                                    className="account-dropdown-menu"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="dropdown-header">
                                        <p className="user-name">{user.name}</p>
                                        <p className="user-email">{user.email}</p>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    <Link to="/profile" className="dropdown-item">
                                        My Profile
                                    </Link>
                                    <Link to="/my-orders" className="dropdown-item">
                                        My Orders
                                    </Link>
                                    {user.role === 'admin' && (
                                        <a
                                            href={`http://localhost:${import.meta.env.VITE_ADMIN_DASHBOARD_PORT || '5174'}`}
                                            className="dropdown-item"
                                        >
                                            Admin Dashboard
                                        </a>
                                    )}
                                    <div className="dropdown-divider"></div>
                                    <button onClick={logout} className="dropdown-item text-red">
                                        Logout
                                    </button>
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
            </header >

            {/* Mobile Overlay */}
            < div
                className={`mobile-overlay ${isMobileMenuOpen ? 'active' : ''}`
                }
                onClick={closeMobileMenu}
            ></div >
        </>
    )
}

export default Header
