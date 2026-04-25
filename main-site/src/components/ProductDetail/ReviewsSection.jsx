import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { Star, ThumbsUp, ThumbsDown, CheckCircle, ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger as GSAPScrollTrigger } from 'gsap/ScrollTrigger';
import './ReviewsSection.css';

gsap.registerPlugin(GSAPScrollTrigger);

const ReviewsSection = ({ productId, initialRating }) => {
    const [reviews, setReviews] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [sort, setSort] = useState('recent');
    const [page, setPage] = useState(1);
    
    // Write review state
    const [showWriteForm, setShowWriteForm] = useState(false);
    const [newRating, setNewRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [newTitle, setNewTitle] = useState('');
    const [newBody, setNewBody] = useState('');
    const [submitStatus, setSubmitStatus] = useState(null); // 'loading', 'success', 'error'
    const [submitError, setSubmitError] = useState('');
    
    // Vote tracking
    const [votedReviews, setVotedReviews] = useState(() => {
        try {
            const saved = localStorage.getItem(`voted_reviews_${productId}`);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    });

    useEffect(() => {
        localStorage.setItem(`voted_reviews_${productId}`, JSON.stringify(votedReviews));
    }, [votedReviews, productId]);
    
    const barsRef = useRef([]);

    useEffect(() => {
        fetchReviews(1, filter, sort);
    }, [productId, filter, sort]);

    // Animate bars when in view
    useEffect(() => {
        if (!loading && initialRating?.distribution && barsRef.current.length > 0) {
            barsRef.current.forEach((bar, index) => {
                if (bar) {
                    const stars = 5 - index;
                    const count = initialRating.distribution[stars] || 0;
                    const total = initialRating.count || 1;
                    const percentage = (count / total) * 100;

                    gsap.fromTo(bar, 
                        { width: '0%' },
                        { 
                            width: `${percentage}%`, 
                            duration: 1, 
                            ease: 'power3.out',
                            scrollTrigger: {
                                trigger: bar,
                                start: 'top 90%',
                            }
                        }
                    );
                }
            });
        }
    }, [loading, initialRating]);

    const fetchReviews = async (pageNum, currentFilter, currentSort) => {
        try {
            if (pageNum === 1) setLoading(true);
            
            // Build URLSearchParams since api uses Fetch, not Axios
            const params = new URLSearchParams();
            params.append('page', pageNum);
            params.append('limit', 10);
            if (currentFilter !== 'all') params.append('rating', currentFilter);
            if (currentSort) params.append('sort', currentSort);

            const response = await api.get(`/products/${productId}/reviews?${params.toString()}`);
            const data = await response.json();
            
            const fetchedReviews = data?.data || [];
            if (pageNum === 1) {
                setReviews(fetchedReviews);
            } else {
                setReviews(prev => [...(prev || []), ...fetchedReviews]);
            }
            setPagination(data?.pagination || null);
        } catch (error) {
            console.error('Failed to fetch reviews', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        if (pagination && page < pagination.totalPages) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchReviews(nextPage, filter, sort);
        }
    };

    const handleVote = async (reviewId, type) => {
        if (votedReviews[reviewId]) return; // Already voted

        try {
            const endpoint = type === 'helpful' ? `/reviews/${reviewId}/helpful` : `/reviews/${reviewId}/unhelpful`;
            await api.put(endpoint);
            
            // Update local state
            setVotedReviews(prev => ({ ...prev, [reviewId]: type }));
            
            // Optimistic update of review counts
            setReviews(reviews.map(r => {
                if (r.id === reviewId) {
                    return type === 'helpful' 
                        ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 }
                        : { ...r, unhelpfulCount: (r.unhelpfulCount || 0) + 1 };
                }
                return r;
            }));
        } catch (error) {
            console.error(`Failed to mark as ${type}`, error);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setSubmitStatus('loading');
        setSubmitError('');

        try {
            const response = await api.post(`/products/${productId}/reviews`, {
                rating: newRating,
                title: newTitle,
                body: newBody
            }); // Custom fetch wrapper auto-attaches tokens from localStorage

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to submit review');
            }

            setSubmitStatus('success');
            setTimeout(() => setShowWriteForm(false), 3000); // Hide form after success
        } catch (error) {
            setSubmitStatus('error');
            setSubmitError(error.message || 'Failed to submit review');
        }
    };

    const totalReviews = initialRating?.count || 0;
    const averageRating = initialRating?.average || 0;

    return (
        <div className="reviews-col" id="reviews">
            <div className="col-header">
                <h2 className="col-title">Customer Reviews</h2>
                {/* Scroll anchor not needed since we're in the section, but kept for design match */}
            </div>

            <div className="rating-overview-card">
                <div className="big-score">
                    <h3>{averageRating > 0 ? averageRating.toFixed(1) : '0.0'}</h3>
                    <div className="stars-row">
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} size={20} fill={star <= averageRating ? "#f5b223" : "none"} color={star <= averageRating ? "#f5b223" : "#d1d5db"} />
                        ))}
                    </div>
                    <span>Based on {totalReviews} reviews</span>
                </div>
                <div className="rating-bars">
                    {[5, 4, 3, 2, 1].map((r, index) => {
                        const count = initialRating?.distribution?.[r] || 0;
                        return (
                            <div key={r} className="bar-row">
                                <span className="b-label">{r} Stars</span>
                                <div className="b-track">
                                    <div 
                                        className="b-fill" 
                                        ref={el => barsRef.current[index] = el}
                                        style={{ width: '0%' }}
                                    ></div>
                                </div>
                                <span className="b-count">{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="reviews-actions-bar">
                <div className="filters-group">
                    <div className="custom-select">
                        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}>
                            <option value="all">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
                        <ChevronDown size={16} />
                    </div>
                    <div className="custom-select">
                        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
                            <option value="recent">Most Recent</option>
                            <option value="highest">Highest Rated</option>
                            <option value="lowest">Lowest Rated</option>
                            <option value="helpful">Most Helpful</option>
                        </select>
                        <ChevronDown size={16} />
                    </div>
                </div>

                <div className="write-review-container">
                    {!showWriteForm ? (
                        <button className="write-review-btn" onClick={() => setShowWriteForm(true)}>
                            Write a Review
                        </button>
                    ) : (
                        <form className="write-review-form" onSubmit={handleSubmitReview}>
                            <h4>Share your experience</h4>
                            <div className="form-stars">
                                <label>Your Rating *</label>
                                <div className="interactive-stars">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star 
                                            key={star} 
                                            size={24} 
                                            onClick={() => setNewRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            fill={(hoverRating || newRating) >= star ? "#f5b223" : "none"} 
                                            color={(hoverRating || newRating) >= star ? "#f5b223" : "#d1d5db"} 
                                            style={{cursor: 'pointer'}}
                                        />
                                    ))}
                                </div>
                            </div>
                            
                            <div className="input-group">
                                <label>Review Title</label>
                                <input 
                                    type="text" 
                                    maxLength="120"
                                    value={newTitle} 
                                    onChange={(e) => setNewTitle(e.target.value)} 
                                    placeholder="Summarize your thoughts"
                                />
                            </div>

                            <div className="input-group">
                                <label>Your Review *</label>
                                <textarea 
                                    maxLength="1000"
                                    required
                                    value={newBody} 
                                    onChange={(e) => setNewBody(e.target.value)} 
                                    placeholder="Tell us what you liked or didn't like"
                                    rows="4"
                                ></textarea>
                                <span className="char-count">{newBody.length}/1000</span>
                            </div>

                            {submitError && <div className="error-msg">{submitError}</div>}
                            {submitStatus === 'success' && <div className="success-msg">Thank you! Your review will appear after moderation.</div>}

                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowWriteForm(false)}>Cancel</button>
                                <button type="submit" className="btn-submit" disabled={submitStatus === 'loading' || newRating === 0}>
                                    {submitStatus === 'loading' ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <div className="reviews-list">
                {loading && page === 1 ? (
                    <div className="reviews-loading">Loading reviews...</div>
                ) : (!reviews || reviews.length === 0) ? (
                    <div className="no-reviews">
                        <p>No reviews found matching your criteria.</p>
                    </div>
                ) : (
                    (reviews || []).map(review => (
                        <div key={review.id} className="rev-card">
                            <div className="rev-header">
                                <div className="rev-avatar" style={{backgroundColor: '#bca188'}}>
                                    {review.user?.name?.[0] || 'A'}
                                </div>
                                <div className="rev-user">
                                    <strong>{review.user?.name || 'Anonymous'}</strong>
                                    {review.verifiedPurchase && (
                                        <span className="verified"><CheckCircle size={12} /> Verified Purchase</span>
                                    )}
                                </div>
                                <span className="rev-time">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="rev-stars">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Star key={star} size={14} fill={star <= review.rating ? "#f5b223" : "none"} color={star <= review.rating ? "#f5b223" : "#d1d5db"} />
                                ))}
                            </div>
                            {review.title && <h5 className="rev-card-title">{review.title}</h5>}
                            <p className="rev-body">{review.body}</p>
                            <div className="rev-feedback">
                                <span>Was this helpful?</span>
                                <div className="feedback-btns">
                                    <button 
                                        className={`f-btn f-up ${votedReviews[review.id] === 'helpful' ? 'active' : ''} ${votedReviews[review.id] ? 'disabled' : ''}`} 
                                        onClick={() => handleVote(review.id, 'helpful')}
                                        disabled={!!votedReviews[review.id]}
                                    >
                                        <ThumbsUp size={14} /> Yes ({review.helpfulCount || 0})
                                    </button>
                                    <button 
                                        className={`f-btn f-down ${votedReviews[review.id] === 'unhelpful' ? 'active' : ''} ${votedReviews[review.id] ? 'disabled' : ''}`} 
                                        onClick={() => handleVote(review.id, 'unhelpful')}
                                        disabled={!!votedReviews[review.id]}
                                    >
                                        <ThumbsDown size={14} /> No ({review.unhelpfulCount || 0})
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            {pagination && page < pagination.totalPages && (
                <button className="load-more-btn" onClick={handleLoadMore}>
                    Load more reviews
                </button>
            )}
        </div>
    );
};

export default ReviewsSection;
