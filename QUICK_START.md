# 🚀 Google OAuth Quick Start

## 📋 Prerequisites Checklist

- [ ] Google Cloud project created
- [ ] OAuth 2.0 credentials obtained
- [ ] Client ID copied
- [ ] Backend `.env` configured
- [ ] Frontend `.env` configured

---

## ⚡ 5-Minute Setup

### 1. Install Dependencies

**Backend:**
```bash
cd admin-dashboard/backend/server
npm install google-auth-library
```

**Frontend:**
```bash
cd Project-B
npm install @react-oauth/google
```

### 2. Configure Environment Variables

**Backend** (`admin-dashboard/backend/server/.env`):
```env
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```

**Frontend** (`Project-B/.env`):
```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
VITE_API_URL=http://localhost:5000
```

### 3. Add Google Button to Login Page

```jsx
import GoogleLoginButton from '../components/ui/GoogleLoginButton';

// In your login component:
<GoogleLoginButton />
```

### 4. Start Servers

```bash
# Terminal 1 - Backend
cd admin-dashboard/backend/server
npm run dev

# Terminal 2 - Frontend
cd Project-B
npm run dev
```

### 5. Test

1. Open `http://localhost:5173`
2. Click "Continue with Google"
3. Sign in with Google
4. ✅ You're logged in!

---

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `googleOAuth.js` | Token verification |
| `GoogleLoginButton.jsx` | Login button component |
| `AuthContext.jsx` | Auth state management |
| `main.jsx` | GoogleOAuthProvider wrapper |

---

## 📝 Common Code Snippets

### Display User Info
```jsx
const { user } = useAuth();
{user && <p>Welcome, {user.name}!</p>}
```

### Logout
```jsx
const { logout } = useAuth();
<button onClick={logout}>Logout</button>
```

### Protected Route
```jsx
const { isAuthenticated } = useAuth();
if (!isAuthenticated) return <Navigate to="/login" />;
```

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Google OAuth is DISABLED" | Add `GOOGLE_CLIENT_ID` to backend `.env` |
| Button not showing | Check `VITE_GOOGLE_CLIENT_ID` in frontend `.env` |
| "Invalid token" | Ensure Client IDs match in both `.env` files |
| CORS error | Verify `withCredentials: true` in axios config |
| Session not persisting | Check cookie in DevTools → Application → Cookies |

---

## 📚 Full Documentation

- **Setup Guide**: [GOOGLE_OAUTH_SETUP.md](file:///e:/Work/MY%20company/project%20my%20mom/Project-B/Project-B%20%283%29/Project-B/GOOGLE_OAUTH_SETUP.md)
- **Usage Examples**: [GOOGLE_OAUTH_USAGE.md](file:///e:/Work/MY%20company/project%20my%20mom/Project-B/Project-B%20%283%29/Project-B/GOOGLE_OAUTH_USAGE.md)
- **Implementation Walkthrough**: [walkthrough.md](file:///C:/Users/mazen/.gemini/antigravity/brain/65d996f6-50ae-40c7-a5e3-5e24c6a3829c/walkthrough.md)

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Backend starts without errors
- [ ] "✅ Google OAuth is enabled" appears in console
- [ ] Frontend starts without errors
- [ ] Google button appears on login page
- [ ] Clicking button opens Google popup
- [ ] After login, user data is displayed
- [ ] Refresh page → still logged in
- [ ] Logout → user state cleared

---

**Need Help?** See [GOOGLE_OAUTH_SETUP.md](file:///e:/Work/MY%20company/project%20my%20mom/Project-B/Project-B%20%283%29/Project-B/GOOGLE_OAUTH_SETUP.md) for detailed troubleshooting.
