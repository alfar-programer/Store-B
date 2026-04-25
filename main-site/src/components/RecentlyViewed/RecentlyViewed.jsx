import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { API_BASE_URL, PLACEHOLDER_IMAGE } from '../../config';
import './RecentlyViewed.css';

gsap.registerPlugin(ScrollTrigger);

const parseImage = (imageField) => {
    if (!imageField) return PLACEHOLDER_IMAGE;
    
    let imageUrl = null;
    
    // 1. Try to extract raw URL from various formats
    try {
        if (typeof imageField === 'string') {
            if (imageField.startsWith('[') || imageField.startsWith('{')) {
                const parsed = JSON.parse(imageField);
                imageUrl = Array.isArray(parsed) ? parsed[0] : parsed;
            } else {
                imageUrl = imageField;
            }
        } else if (Array.isArray(imageField)) {
            imageUrl = imageField[0];
        } else {
            imageUrl = imageField;
        }

        // 2. If the result is still a JSON-like string (nested parsing), try again once
        if (typeof imageUrl === 'string' && (imageUrl.startsWith('[') || imageUrl.startsWith('{'))) {
            const nestedParsed = JSON.parse(imageUrl);
            imageUrl = Array.isArray(nestedParsed) ? nestedParsed[0] : nestedParsed;
        }
    } catch (e) {
        imageUrl = imageField; // Fallback to raw
    }

    if (!imageUrl || typeof imageUrl !== 'string') return PLACEHOLDER_IMAGE;

    // 3. Clean and format the URL
    if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) return imageUrl;
    
    const rootUrl = API_BASE_URL.replace('/api', '');
    const cleanRoot = rootUrl.endsWith('/') ? rootUrl.slice(0, -1) : rootUrl;
    // Replace backslashes (Windows paths) with forward slashes for URLs
    const sanitizedPath = imageUrl.replace(/\\/g, '/');
    const cleanPath = sanitizedPath.startsWith('/') ? sanitizedPath.slice(1) : sanitizedPath;
    
    return `${cleanRoot}/${cleanPath}`;
};

const RecentlyViewed = ({ products, currentProductId }) => {
    const containerRef = useRef(null);
    const cardsRef = useRef([]);

    // Filter out the current product
    const displayProducts = products.filter(p => p.id?.toString() !== currentProductId?.toString());

    useEffect(() => {
        if (displayProducts.length > 0 && containerRef.current) {
            gsap.fromTo(containerRef.current,
                { y: 50, opacity: 0 },
                { 
                    y: 0, 
                    opacity: 1, 
                    duration: 0.6, 
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 90%",
                    }
                }
            );

            gsap.fromTo(cardsRef.current,
                { y: 20, opacity: 0 },
                { 
                    y: 0, 
                    opacity: 1, 
                    duration: 0.5, 
                    stagger: 0.05, 
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 90%",
                    }
                }
            );
        }
    }, [displayProducts.length]);

    if (!displayProducts || displayProducts.length === 0) return null;

    return (
        <section className="recently-viewed-section" ref={containerRef}>
            <div className="rv-header">
                <h3>Recently Viewed</h3>
                <div className="rv-divider"></div>
            </div>
            
            <div className="rv-scroll-container">
                <div className="rv-track">
                    {displayProducts.map((product, index) => (
                        <Link 
                            to={`/product/${product.id}`} 
                            className="rv-card" 
                            key={product.id}
                            ref={el => cardsRef.current[index] = el}
                        >
                            <div className="rv-image-wrapper">
                                <img src={parseImage(product.images)} alt={product.title} loading="lazy" />
                            </div>
                            <div className="rv-info">
                                <h4 className="rv-title">{product.title}</h4>
                                <div className="rv-rating-row">
                                    <Star size={12} fill="#f5b223" color="#f5b223" />
                                    <span>
                                        {(() => {
                                            const r = product.rating;
                                            if (!r) return '5.0';
                                            if (typeof r === 'object') return (r.average || 5).toFixed(1);
                                            return Number(r).toFixed(1);
                                        })()}
                                    </span>
                                </div>
                                <div className="rv-price-row">
                                    {product.discount > 0 ? (
                                        <>
                                            <span className="rv-price">{(parseFloat(product.price) * (1 - product.discount / 100)).toFixed(2)} <small>EGP</small></span>
                                        </>
                                    ) : (
                                        <span className="rv-price">{parseFloat(product.price || 0).toFixed(2)} <small>EGP</small></span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RecentlyViewed;
