import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import './category.css'
import { categoryData } from '../../../../data/Data'


const Category = () => {
  // Duplicate the data for infinite scroll effect
  const duplicatedData = [...categoryData, ...categoryData, ...categoryData];
  const [isPlaying, setIsPlaying] = useState(true);
  const carouselRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Mouse down handler
  const handleMouseDown = (e) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    setIsPlaying(false);
    const carousel = carouselRef.current;
    setStartX(e.pageX - carousel.offsetLeft);
    setScrollLeft(carousel.scrollLeft);
  };

  // Mouse leave handler
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setIsPlaying(true);
    }
  };

  // Mouse up handler
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsPlaying(true);
  };

  // Mouse move handler
  const handleMouseMove = (e) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const carousel = carouselRef.current;
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 1.5;
    carousel.scrollLeft = scrollLeft - walk;
  };

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    setIsPlaying(false);
    const carousel = carouselRef.current;
    setStartX(e.touches[0].pageX - carousel.offsetLeft);
    setScrollLeft(carousel.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !carouselRef.current) return;
    const carousel = carouselRef.current;
    const x = e.touches[0].pageX - carousel.offsetLeft;
    const walk = (x - startX) * 1.5;
    carousel.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setIsPlaying(true);
  };

  return (
    <section className='category'>
      <div className="category-content">
        <h2>Shop by Category</h2>

        <div className="category-carousel-wrapper">
          <div
            className={`category-carousel ${isPlaying ? 'playing' : 'paused'} ${isDragging ? 'dragging' : ''}`}
            ref={carouselRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {duplicatedData.map((item, index) => (
              <div className="category-item" key={`${item.id}-${index}`}>
                <Link
                  to={`/allproducts?category=${encodeURIComponent(item.title)}`}
                  onClick={(e) => isDragging && e.preventDefault()}
                >
                  <img src={item.image} alt={item.title} draggable="false" />
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <span className="shop-now-btn">Shop Now</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Category