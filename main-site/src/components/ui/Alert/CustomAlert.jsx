import React, { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import styles from './CustomAlert.module.css';

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
            case 'success': return <CheckCircle className={`${styles.alertIcon} ${styles.success}`} />;
            case 'warning': return <AlertTriangle className={`${styles.alertIcon} ${styles.warning}`} />;
            case 'info': return <Info className={`${styles.alertIcon} ${styles.info}`} />;
            default: return <AlertCircle className={`${styles.alertIcon} ${styles.error}`} />;
        }
    };

    return (
        <div className={`custom-alert-overlay ${isVisible ? 'visible' : ''}`}>
            <div className={`custom-alert-box ${type} ${isVisible ? 'visible' : ''}`}>
                <div className={`${styles.alertContent}`}>
                    {getIcon()}
                    <p className={`${styles.alertMessage}`}>{message}</p>
                </div>
                <button className={`${styles.alertCloseBtn}`} onClick={handleClose}>
                    <X size={18} />
                </button>
                <div className={`${styles.alertProgressBar}`}>
                    <div
                        className={`${styles.alertProgressFill}`}
                        style={{ animationDuration: `${duration}ms` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default CustomAlert;
