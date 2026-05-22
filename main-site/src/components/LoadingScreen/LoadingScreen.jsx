import React, { useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import './LoadingScreen.css'

const LoadingScreen = ({ isExiting }) => {
    const containerRef = useRef()
    const [progress, setProgress] = useState(0)
    const [isActuallyFinished, setIsActuallyFinished] = useState(false)

    // Handle progress simulation
    useEffect(() => {
        let interval;
        if (!isExiting) {
            // Slow progress to 95%
            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev < 95) {
                        // Increments become smaller as it approaches 95
                        const diff = 95 - prev;
                        const increment = Math.max(0.1, diff * 0.05);
                        return Math.min(95, prev + increment);
                    }
                    return prev;
                });
            }, 100);
        } else {
            // Rapidly jump to 100% when page is loaded
            setProgress(prev => {
                const tl = gsap.timeline({
                    onComplete: () => {
                        setIsActuallyFinished(true)
                    }
                });
                tl.to({ val: prev }, {
                    val: 100,
                    duration: 0.8,
                    ease: "power2.out",
                    onUpdate: function() {
                        setProgress(Math.floor(this.targets()[0].val))
                    }
                });
                return prev;
            });
        }
        return () => clearInterval(interval);
    }, [isExiting])

    useGSAP(() => {
        const tl = gsap.timeline()

        // Reveal background layers
        tl.from('.layer.depth-0', {
            opacity: 0,
            duration: 1,
            ease: 'power2.out'
        })

        // Staggered entrance for main content
        tl.from('.loading-logo', {
            y: 30,
            opacity: 0,
            duration: 1,
            ease: 'back.out(1.7)'
        }, '-=0.5')

        tl.from('.loading-brand, .loading-text, .progress-container', {
            y: 10,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power2.out'
        }, '-=0.6')

        // Floating loop for logo
        gsap.to('.loading-logo', {
            y: -10,
            repeat: -1,
            yoyo: true,
            duration: 2,
            ease: 'sine.inOut'
        })

        // Dynamic gradient movement
        gsap.to('.gradient-orb', {
            x: 'random(-50, 50)',
            y: 'random(-50, 50)',
            duration: 'random(3, 6)',
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            stagger: 0.5
        })

    }, { scope: containerRef })

    return (
        <div className={`loading-screen ${isActuallyFinished ? 'fade-out' : ''}`} ref={containerRef}>
            {/* Cinematic Layers */}
            <div className="layer depth-0" aria-hidden="true">
                <div className="noise-overlay"></div>
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
            </div>

            <div className="layer depth-1" aria-hidden="true">
                <div className="light-leak"></div>
            </div>

            <div className="loading-content layer depth-3">
                <div className="logo-wrapper">
                    <img
                        src="/svg/logo-no-background.svg"
                        alt="Store-B Logo"
                        className="loading-logo"
                    />
                </div>

                <div className="text-container">
                    <h2 className="loading-brand">STORE-B</h2>
                    <p className="loading-text">
                        Designing your premium experience
                    </p>
                    
                    <div className="progress-container">
                        <div className="loading-bar">
                            <div 
                                className="loading-bar-fill" 
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <div className="progress-percentage">{Math.floor(progress)}%</div>
                    </div>
                </div>
            </div>

            <div className="layer depth-5" aria-hidden="true">
                <div className="vignette-overlay"></div>
            </div>
        </div>
    )
}

export default LoadingScreen
