import React from 'react'
import './LoadingScreen.css'

const LoadingScreen = () => {
    return (
        <div className="loading-screen">
            <div className="loading-content">
                <div className="loading-icon-wrapper">
                    <div className="loading-icon">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                    </div>
                    <div className="loading-pulse"></div>
                </div>

                <img
                    src="/svg/logo-no-background.svg"
                    alt="Store-B Logo"
                    className="loading-logo"
                />
                <p className="loading-text">
                    Loading your shopping experience
                    <span className="loading-dots">
                        <span>.</span>
                        <span>.</span>
                        <span>.</span>
                    </span>
                </p>

                <div className="loading-bar">
                    <div className="loading-bar-fill"></div>
                </div>
            </div>

            <div className="loading-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>
        </div>
    )
}

export default LoadingScreen
