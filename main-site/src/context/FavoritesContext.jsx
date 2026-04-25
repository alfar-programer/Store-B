import React, { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export const useFavorites = () => {
    return useContext(FavoritesContext);
};

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState(() => {
        try {
            const item = localStorage.getItem('warmtouch_favorites');
            return item ? JSON.parse(item) : [];
        } catch (error) {
            console.error('Failed to parse favorites from localStorage', error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('warmtouch_favorites', JSON.stringify(favorites));
        } catch (error) {
            console.error('Failed to save favorites to localStorage', error);
        }
    }, [favorites]);

    const toggleFavorite = (product) => {
        setFavorites((prevFavorites) => {
            const isFavorite = prevFavorites.some((item) => item.id === product.id);
            if (isFavorite) {
                return prevFavorites.filter((item) => item.id !== product.id);
            } else {
                return [...prevFavorites, product];
            }
        });
    };

    const isFavorite = (productId) => {
        return favorites.some((item) => item.id === productId);
    };

    const getFavoritesCount = () => {
        return favorites.length;
    };

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, getFavoritesCount }}>
            {children}
        </FavoritesContext.Provider>
    );
};
