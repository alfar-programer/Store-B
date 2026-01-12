import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label="Toggle Dark Mode"
            style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '50%',
                transition: 'background-color 0.3s ease',
                color: 'var(--text-primary)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(128, 128, 128, 0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
            {theme === 'dark' ? (
                <Sun size={24} className="theme-icon sun" />
            ) : (
                <Moon size={24} className="theme-icon moon" />
            )}
        </button>
    );
};

export default ThemeToggle;
