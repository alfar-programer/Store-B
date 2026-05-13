import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import { useCart } from '../../context/CartContext';
import { API_BASE_URL, PLACEHOLDER_IMAGE } from '../../config';
import styles from './favorites.module.css';

const Favorites = () => {
    const { favorites, toggleFavorite } = useFavorites();
    const { addToCart } = useCart();

    const parseImage = (imageField) => {
        if (!imageField) return PLACEHOLDER_IMAGE;

        let imageUrl = imageField;

        try {
            if (typeof imageField === 'string' && (imageField.startsWith('[') || imageField.startsWith('{'))) {
                const parsed = JSON.parse(imageField);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    imageUrl = parsed[0];
                }
            }
        } catch (e) {
            console.warn('Image parsing error, using raw value:', e);
        }

        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
            const rootUrl = API_BASE_URL.replace('/api', '');
            const cleanRoot = rootUrl.endsWith('/') ? rootUrl.slice(0, -1) : rootUrl;
            const cleanPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
            return `${cleanRoot}/${cleanPath}`;
        }

        return imageUrl || PLACEHOLDER_IMAGE;
    };

    const handleAddToCart = (e, product) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (typeof product.stock === 'number' && product.stock <= 0) return;

        addToCart(product);

        const button = e.currentTarget;
        const originalText = button.innerHTML;

        button.innerHTML = '<span>✓ Added!</span>';
        button.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
        button.style.color = 'white';

        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '';
            button.style.color = '';
        }, 2000);
    };

    return (
        <section className={`${styles.favoritesSection}`}>
            <Helmet>
                <title>My Favorites | Warm Touch</title>
                <meta name="description" content="View your favorite handmade items and home decor at Warm Touch." />
            </Helmet>

            <div className={`${styles.favoritesContainer}`}>
                <div className={`${styles.favoritesHeader}`}>
                    <h2>My Favorites</h2>
                    <p>Your curated collection of loved items</p>
                </div>

                {favorites.length === 0 ? (
                    <div className={`${styles.emptyFavorites}`}>
                        <Heart size={64} className={`${styles.emptyIcon}`} />
                        <h3>Your wishlist is empty</h3>
                        <p>Discover our beautiful products and add your favorites here!</p>
                        <Link to="/allproducts" className={`${styles.browseBtn}`}>
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className={`${styles.favoritesGrid}`}>
                        {favorites.map((product) => (
                            <div className={`${styles.favoriteCard}`} key={product.id}>
                                <Link to={`/product/${product.id}`} className={`${styles.favoriteImageWrapper}`}>
                                    <img src={parseImage(product.image)} alt={product.title} />
                                    {product.discount > 0 && (
                                        <div className={`${styles.discountBadge}`}>-{product.discount}%</div>
                                    )}
                                </Link>
                                
                                <div className={`${styles.favoriteInfo}`}>
                                    <Link to={`/product/${product.id}`} className={`${styles.favoriteTitle}`}>
                                        <h3>{product.title}</h3>
                                    </Link>
                                    
                                    <div className={`${styles.favoritePriceWrapper}`}>
                                        {product.discount > 0 ? (
                                            <>
                                                <span className={`${styles.price}`}>{(parseFloat(product.price) * (1 - product.discount / 100)).toFixed(2)} <small>EGP</small></span>
                                                <span className={`${styles.originalPrice}`}>{parseFloat(product.price).toFixed(2)} <small>EGP</small></span>
                                            </>
                                        ) : (
                                            <span className={`${styles.price}`}>{parseFloat(product.price).toFixed(2)} <small>EGP</small></span>
                                        )}
                                    </div>
                                    
                                    {typeof product.stock === 'number' && product.stock > 0 && product.stock < 10 && (
                                        <span className={`${styles.stockWarning}`}>
                                            Only {product.stock} left!
                                        </span>
                                    )}
                                    
                                    <div className={`${styles.favoriteActions}`}>
                                        <button 
                                            className={`${styles.actionBtn} ${styles.removeBtn}`}
                                            onClick={() => toggleFavorite(product)}
                                            aria-label="Remove from favorites"
                                        >
                                            <Trash2 size={18} />
                                            <span>Remove</span>
                                        </button>
                                        
                                        <button 
                                            className={`${styles.actionBtn} ${styles.addCartBtn}`}
                                            disabled={typeof product.stock === 'number' && product.stock <= 0}
                                            onClick={(e) => handleAddToCart(e, product)}
                                        >
                                            <ShoppingCart size={18} />
                                            <span>{typeof product.stock === 'number' && product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Favorites;
