import React, { useRef } from 'react'
import './hero.css'
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';


const Hero = () => {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const textRef = useRef(null);
  const buttonRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    tl.from(titleRef.current, {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    })
      .from(textRef.current, {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      }, "-=0.5")
      .from(buttonRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        ease: "back.out(1.7)"
      }, "-=0.5");

  }, { scope: heroRef });

  return (
    <section className='hero' ref={heroRef}>
      {/* Animated gradient overlays */}
      <div className="gradient-overlay gradient-1"></div>
      <div className="gradient-overlay gradient-2"></div>
      <div className="gradient-overlay gradient-3"></div>

      {/* Floating shapes */}
      <div className="floating-shape shape-1"></div>
      <div className="floating-shape shape-2"></div>
      <div className="floating-shape shape-3"></div>
      <div className="floating-shape shape-4"></div>

      <div className='hero-main'>
        <div className="hero-content">
          <h1 ref={titleRef}>Curated Essentials for <span>Modern Living</span></h1>
          <p ref={textRef}>Discover thoughtfully selected products that combine timeless design with exceptional quality</p>
          <button
            ref={buttonRef}
            onMouseEnter={() => {
              gsap.to(buttonRef.current, { scale: 1.1, duration: 0.3, ease: "power1.out" });
            }}
            onMouseLeave={() => {
              gsap.to(buttonRef.current, { scale: 1, duration: 0.3, ease: "power1.out" });
            }}
          >
            Explore Collection
            <span className="arrow-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}

export default Hero