import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
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
        <div className="auth-container">
            <div className="auth-box">
                <h2>Create Account</h2>
                <p className="auth-subtitle">Join us today</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your full name"
                            className={fieldErrors.name ? 'input-error' : ''}
                            required
                        />
                        {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
                    </div>

                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter your phone number"
                            className={fieldErrors.phone ? 'input-error' : ''}
                            required
                        />
                        {fieldErrors.phone && <div className="field-error">{fieldErrors.phone}</div>}
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className={fieldErrors.email ? 'input-error' : ''}
                            required
                        />
                        {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a password"
                            className={fieldErrors.password ? 'input-error' : ''}
                            required
                        />
                        {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
                    </div>

                    <button type="submit" className="auth-btn">Sign Up</button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Login</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
