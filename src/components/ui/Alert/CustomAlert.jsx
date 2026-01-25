import React, { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import './CustomAlert.css';

const CustomAlert = ({ message, type = 'error', onClose, duration = 5000 }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        if (duration) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation
    };

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle className="alert-icon success" />;
            case 'warning': return <AlertTriangle className="alert-icon warning" />;
            case 'info': return <Info className="alert-icon info" />;
            default: return <AlertCircle className="alert-icon error" />;
        }
    };

    return (
        <div className={`custom-alert-overlay ${isVisible ? 'visible' : ''}`}>
            <div className={`custom-alert-box ${type} ${isVisible ? 'visible' : ''}`}>
                <div className="alert-content">
                    {getIcon()}
                    <p className="alert-message">{message}</p>
                </div>
                <button className="alert-close-btn" onClick={handleClose}>
                    <X size={18} />
                </button>
                <div className="alert-progress-bar">
                    <div
                        className="alert-progress-fill"
                        style={{ animationDuration: `${duration}ms` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default CustomAlert;
