import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from '../components/ui/GoogleLoginButton';
import YetiAuth from '../components/ui/YetiAuth';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [focusedField, setFocusedField] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});

        const result = await login(email, password);

        if (result.success) {
            if (result.role === 'admin') {
                console.log('Admin logged in successfully');
                window.location.href = `https://store-b-dashboard-production.up.railway.app/login?token=${result.token}&role=${result.role}`;
            } else {
                navigate('/');
            }
        } else {
            if (result.requiresVerification) {
                const userEmail = result.email || email;
                navigate('/verify-email', { state: { email: userEmail } });
                return;
            }

            if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
                setFieldErrors(result.fieldErrors);
            } else {
                setError(result.message);
            }
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Welcome Back</h2>

                <YetiAuth
                    emailLength={email.length}
                    focusedField={focusedField}
                    showPassword={showPassword}
                />

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} autoComplete="off">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value.trim())}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField('')}
                            placeholder="Enter your email"
                            className={fieldErrors.email ? 'input-error' : ''}
                            required
                        />
                        {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField('')}
                                placeholder="Enter your password"
                                className={fieldErrors.password ? 'input-error' : ''}
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                onFocus={() => setFocusedField('password-toggle')}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
                    </div>

                    <button type="submit" className="auth-btn">Log in</button>
                </form>

                <div className="divider">
                    <span>OR</span>
                </div>

                <GoogleLoginButton />

                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/register">Sign up</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
