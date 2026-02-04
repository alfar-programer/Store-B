# Google OAuth Usage Examples

Quick reference for implementing Google OAuth in your components.

## Basic Usage

### 1. Add Google Login Button to Your Login Page

```jsx
import GoogleLoginButton from '../components/ui/GoogleLoginButton';

const LoginPage = () => {
  return (
    <div className="login-container">
      <h2>Sign In</h2>
      
      {/* Your existing email/password form */}
      <form>
        {/* ... existing login form ... */}
      </form>

      {/* OR Divider */}
      <div className="divider">
        <span>OR</span>
      </div>

      {/* Google OAuth Button */}
      <GoogleLoginButton 
        onSuccess={(user) => {
          console.log('Logged in:', user);
          // Redirect handled automatically
        }}
        onError={(error) => {
          console.error('Login failed:', error);
          alert(error);
        }}
      />
    </div>
  );
};
```

### 2. Display User Info (Any Component)

```jsx
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <a href="/login">Sign In</a>;
  }

  return (
    <div className="user-menu">
      <img src={user.avatar} alt={user.name} className="avatar" />
      <span>{user.name}</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

### 3. Protected Route Example

```jsx
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedPage = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <div>Protected Content</div>;
};
```

### 4. Check Auth Method

```jsx
const MyComponent = () => {
  const { user } = useAuth();

  return (
    <div>
      {user?.authMethod === 'google' && (
        <p>Signed in with Google</p>
      )}
      {user?.authMethod === 'email' && (
        <p>Signed in with Email</p>
      )}
    </div>
  );
};
```

## Advanced Usage

### Custom Success Handler

```jsx
<GoogleLoginButton 
  onSuccess={(user) => {
    // Custom logic after successful login
    if (user.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/user/dashboard');
    }
  }}
/>
```

### Inline Google Button with Custom Styling

```jsx
<div className="custom-container">
  <GoogleLoginButton />
  <style>{`
    .google-login-container {
      width: 100%;
      max-width: 400px;
    }
  `}</style>
</div>
```

### Manual Login (Without Button Component)

```jsx
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const CustomLogin = () => {
  const { loginWithGoogle } = useAuth();

  return (
    <GoogleLogin
      onSuccess={async (response) => {
        const result = await loginWithGoogle(response.credential);
        if (result.success) {
          console.log('Logged in!', result.user);
        }
      }}
      onError={() => console.log('Login Failed')}
    />
  );
};
```

## API Usage (Direct axios calls)

### Login

```javascript
import axiosInstance from '../api/axios';

const loginWithGoogle = async (credential) => {
  const response = await axiosInstance.post('/api/auth/google/login', {
    credential
  });
  return response.data;
};
```

### Get Profile

```javascript
const getProfile = async () => {
  const response = await axiosInstance.get('/api/auth/profile');
  return response.data.user;
};
```

### Logout

```javascript
const logout = async () => {
  await axiosInstance.post('/api/auth/google/logout');
};
```

## Common Patterns

### Loading State

```jsx
const { user, loading } = useAuth();

if (loading) {
  return <LoadingSpinner />;
}

return user ? <Dashboard /> : <Login />;
```

### Conditional Rendering

```jsx
const { isAuthenticated } = useAuth();

return (
  <div>
    {isAuthenticated ? (
      <button>My Account</button>
    ) : (
      <GoogleLoginButton />
    )}
  </div>
);
```

### Role-Based Access

```jsx
const { user } = useAuth();

if (user?.role === 'admin') {
  return <AdminPanel />;
}

return <CustomerDashboard />;
```

## Styling Examples

### Tailwind CSS

```jsx
<div className="flex flex-col items-center space-y-4">
  <h2 className="text-2xl font-bold">Sign In</h2>
  <GoogleLoginButton />
</div>
```

### Custom CSS

```css
.google-login-container {
  margin: 20px auto;
  max-width: 400px;
}

.google-login-container button {
  width: 100%;
  border-radius: 8px;
}
```

## Error Handling

```jsx
<GoogleLoginButton 
  onError={(error) => {
    // Log to analytics
    console.error('Google login failed:', error);
    
    // Show user-friendly message
    toast.error('Unable to sign in with Google. Please try again.');
    
    // Fallback to email login
    setShowEmailLogin(true);
  }}
/>
```

## Testing

### Check if Google OAuth is Enabled

```javascript
const isGoogleOAuthEnabled = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!isGoogleOAuthEnabled) {
  console.warn('Google OAuth is not configured');
}
```

### Mock User for Development

```javascript
// For testing without Google OAuth
const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  avatar: 'https://via.placeholder.com/150',
  role: 'customer',
  authMethod: 'google'
};
```

## Troubleshooting

### Button Not Showing

```jsx
// Check if GoogleOAuthProvider is wrapping your app
// In main.jsx:
<GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
  <App />
</GoogleOAuthProvider>
```

### Session Not Persisting

```javascript
// Ensure axios has credentials enabled
axios.defaults.withCredentials = true;
```

### CORS Errors

```javascript
// Backend must have:
cors({
  origin: 'http://localhost:5173',
  credentials: true
})
```

---

**See GOOGLE_OAUTH_SETUP.md for complete setup instructions.**
