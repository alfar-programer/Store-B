import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

/**
 * Google Sign-In Button Component
 * 
 * Features:
 * - Official Google branding
 * - Popup authentication (no redirects)
 * - Automatic user creation/login
 * - Error handling with user feedback
 */

const GoogleLoginButton = ({ onSuccess, onError }) => {
    const { loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError(null);

        try {
            const result = await loginWithGoogle(credentialResponse.credential);

            if (result.success) {
                console.log('✅ Google login successful:', result.user);

                // Call custom success handler if provided
                if (onSuccess) {
                    onSuccess(result.user);
                } else {
                    // Default: redirect to home page
                    navigate('/');
                }
            } else {
                const errorMsg = result.message || 'Google login failed';
                setError(errorMsg);
                if (onError) onError(errorMsg);
            }
        } catch (err) {
            const errorMsg = 'An unexpected error occurred';
            setError(errorMsg);
            console.error('Google login error:', err);
            if (onError) onError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        const errorMsg = 'Google sign-in was cancelled or failed';
        setError(errorMsg);
        console.error('Google OAuth error');
        if (onError) onError(errorMsg);
    };

    return (
        <div className="google-login-container">
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="outline"
                size="large"
                text="continue_with"
                shape="rectangular"
                logo_alignment="left"
                width="100%"
            />

            {loading && (
                <p className="text-sm text-gray-600 mt-2 text-center">
                    Signing in with Google...
                </p>
            )}

            {error && (
                <p className="text-sm text-red-600 mt-2 text-center">
                    {error}
                </p>
            )}
        </div>
    );
};

export default GoogleLoginButton;
