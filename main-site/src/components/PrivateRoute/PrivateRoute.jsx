/**
 * PrivateRoute — Route Guard for Authenticated Users
 * ────────────────────────────────────────────────────
 * Wraps any route element and redirects to /login if the user
 * is not authenticated.  Preserves the originally requested URL so the
 * user can be sent back there after a successful login.
 *
 * Usage (in App.jsx):
 *   <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // While the auth context is resolving (e.g. reading localStorage),
    // render nothing to avoid a flash of the login redirect.
    if (loading) {
        return null;
    }

    if (!user) {
        // Redirect to login, preserving the current path so we can
        // return the user here after login (optional UX enhancement).
        return (
            <Navigate
                to="/login"
                state={{ from: location.pathname }}
                replace
            />
        );
    }

    return children;
};

export default PrivateRoute;
