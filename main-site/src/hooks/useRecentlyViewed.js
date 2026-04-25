import { useState, useEffect } from 'react';

export const useRecentlyViewed = () => {
    const [recentlyViewed, setRecentlyViewed] = useState([]);

    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem('warmtouch_recently_viewed') || '[]');
            setRecentlyViewed(stored);
        } catch (e) {
            console.error('Failed to parse recently viewed products', e);
            setRecentlyViewed([]);
        }
    }, []);

    const addToRecentlyViewed = (product) => {
        if (!product || !product.id) return;
        
        try {
            const stored = JSON.parse(localStorage.getItem('warmtouch_recently_viewed') || '[]');
            // Filter out if currently exists
            const filtered = stored.filter(p => p.id !== product.id);
            
            // Create a lightweight version of the product to store
            const lightProduct = {
                id: product.id,
                title: product.title,
                price: product.price,
                discount: product.discount,
                images: product.images, 
                rating: product.rating,
                stock: product.stock
            };
            
            // Keep maximum 8
            const updated = [lightProduct, ...filtered].slice(0, 8);
            localStorage.setItem('warmtouch_recently_viewed', JSON.stringify(updated));
            setRecentlyViewed(updated);
        } catch (e) {
            console.error('Failed to update recently viewed products', e);
        }
    };

    return { recentlyViewed, addToRecentlyViewed };
};
