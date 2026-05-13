import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import GoogleLoginButton from '../components/ui/GoogleLoginButton';
import YetiAuth from '../components/ui/YetiAuth';
import styles from './Auth.module.css';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [focusedField, setFocusedField] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { register, login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});

        const result = await register(name, email, password, phone);
        console.log('Register Result:', result);

        if (result.success) {
            if (result.requiresVerification) {
                navigate('/verify-email', { state: { email: result.email } });
                return;
            }

            // Auto-login after successful registration
            const loginResult = await login(email, password);
            if (loginResult.success) {
                navigate('/');
            } else {
                // If auto-login fails, show error but registration was successful
                setError('Registration successful! Please login manually.');
            }
        } else {
            // Set field-specific errors if available
            if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
                setFieldErrors(result.fieldErrors);
            } else {
                setError(result.message);
            }
        }
    };

    return (
        <div className={`${styles.authContainer}`}>
            <Helmet>
                <title>إنشاء حساب | Register – Warm Touch</title>
                <meta name="robots" content="noindex, nofollow" />
                <link rel="canonical" href="https://www.warmtotuch.store/register" />
            </Helmet>
            <div className={`${styles.authBox}`}>
                <YetiAuth
                    emailLength={email.length}
                    focusedField={focusedField}
                    showPassword={showPassword}
                />

                <h2>Create Account</h2>

                {error && <div className={`${styles.errorMessage}`}>{error}</div>}

                <form onSubmit={handleSubmit} autoComplete="off">
                    <div className={`${styles.formGroup}`}>
                        <label>Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => setFocusedField('')}
                            placeholder="Enter your full name"
                            className={fieldErrors.name ? 'input-error' : ''}
                            required
                        />
                        {fieldErrors.name && <div className={`${styles.fieldError}`}>{fieldErrors.name}</div>}
                    </div>

                    <div className={`${styles.formGroup}`}>
                        <label>Phone Number</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            onFocus={() => setFocusedField('phone')}
                            onBlur={() => setFocusedField('')}
                            placeholder="Enter your phone number"
                            className={fieldErrors.phone ? 'input-error' : ''}
                            required
                        />
                        {fieldErrors.phone && <div className={`${styles.fieldError}`}>{fieldErrors.phone}</div>}
                    </div>

                    <div className={`${styles.formGroup}`}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setFocusedField('email')}
                            onBlur={() => setFocusedField('')}
                            placeholder="Enter your email"
                            className={fieldErrors.email ? 'input-error' : ''}
                            required
                        />
                        {fieldErrors.email && <div className={`${styles.fieldError}`}>{fieldErrors.email}</div>}
                    </div>

                    <div className={`${styles.formGroup}`}>
                        <label>Password</label>
                        <div className={`${styles.passwordWrapper}`}>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField('')}
                                placeholder="Create a password"
                                className={fieldErrors.password ? 'input-error' : ''}
                                required
                            />
                            <button
                                type="button"
                                className={`${styles.togglePasswordBtn}`}
                                onClick={() => setShowPassword(!showPassword)}
                                onFocus={() => setFocusedField('password-toggle')}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {fieldErrors.password && <div className={`${styles.fieldError}`}>{fieldErrors.password}</div>}
                    </div>

                    <button type="submit" className={`${styles.authBtn}`}>Sign Up</button>
                </form>

                <div className={`${styles.divider}`}>
                    <span>OR</span>
                </div>

                <GoogleLoginButton />

                <div className={`${styles.authFooter}`}>
                    <p>Already have an account? <Link to="/login">Login</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
