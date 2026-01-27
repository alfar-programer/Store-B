import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const VerifyEmail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { verifyEmail, resendVerification } = useAuth();

    const email = location.state?.email || '';
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const inputRefs = useRef([]);

    // Redirect if no email provided
    useEffect(() => {
        if (!email) {
            navigate('/register');
        }
    }, [email, navigate]);

    // Countdown timer for resend button
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleChange = (index, value) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        // Handle paste
        if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            navigator.clipboard.readText().then(text => {
                const digits = text.replace(/\D/g, '').slice(0, 6).split('');
                const newCode = [...code];
                digits.forEach((digit, i) => {
                    if (i < 6) newCode[i] = digit;
                });
                setCode(newCode);
                inputRefs.current[Math.min(digits.length, 5)]?.focus();
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const verificationCode = code.join('');
        if (verificationCode.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        setLoading(true);
        const result = await verifyEmail(email, verificationCode);
        setLoading(false);

        if (result.success) {
            setSuccess('Email verified successfully! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } else {
            setError(result.message);
            if (result.expired) {
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        }
    };

    const handleResend = async () => {
        setError('');
        setSuccess('');
        setResendLoading(true);

        const result = await resendVerification(email);
        setResendLoading(false);

        if (result.success) {
            setSuccess('Verification code sent! Please check your email.');
            setResendCooldown(60); // 60 second cooldown
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Verify Your Email</h2>
                <p className="auth-subtitle">
                    We've sent a 6-digit code to<br />
                    <strong>{email}</strong>
                </p>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="otp-container">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                inputMode="numeric"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="otp-input"
                                autoFocus={index === 0}
                                disabled={loading}
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        className="auth-btn"
                        disabled={loading || code.join('').length !== 6}
                    >
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Didn't receive the code?{' '}
                        <button
                            onClick={handleResend}
                            disabled={resendLoading || resendCooldown > 0}
                            className="link-button"
                        >
                            {resendLoading ? 'Sending...' :
                                resendCooldown > 0 ? `Resend in ${resendCooldown}s` :
                                    'Resend Code'}
                        </button>
                    </p>
                    <p>
                        <Link to="/register">Back to Registration</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
