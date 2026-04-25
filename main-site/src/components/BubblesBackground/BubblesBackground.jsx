import React, { useEffect, useState } from 'react';
import './bubbles.css';

const BubblesBackground = ({ bubbleColor = 'rgba(255, 255, 255, 0.4)' }) => {
    const [bubbles, setBubbles] = useState([]);

    useEffect(() => {
        const createBubbles = () => {
            const newBubbles = [];
            const bubbleCount = 20; // Number of bubbles

            for (let i = 0; i < bubbleCount; i++) {
                const size = Math.random() * 60 + 20; // Random size between 20px and 80px
                const left = Math.random() * 100; // Random horizontal position
                const duration = Math.random() * 10 + 10; // Random duration between 10s and 20s
                const delay = Math.random() * 10; // Random delay

                newBubbles.push({
                    id: i,
                    style: {
                        width: `${size}px`,
                        height: `${size}px`,
                        left: `${left}%`,
                        animationDuration: `${duration}s`,
                        animationDelay: `${delay}s`,
                        background: bubbleColor
                    }
                });
            }
            setBubbles(newBubbles);
        };

        createBubbles();
    }, [bubbleColor]);

    return (
        <div className="bubbles-container">
            {bubbles.map((bubble) => (
                <div key={bubble.id} className="bubble" style={bubble.style} />
            ))}
        </div>
    );
};

export default BubblesBackground;
