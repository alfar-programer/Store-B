# Google OAuth 2.0 Setup Guide

Complete guide to configure Google OAuth authentication for your application.

## Table of Contents
1. [Google Cloud Console Setup](#google-cloud-console-setup)
2. [Environment Variables](#environment-variables)
3. [Testing Locally](#testing-locally)
4. [Production Deployment](#production-deployment)
5. [Troubleshooting](#troubleshooting)

---

## Google Cloud Console Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Enter project name (e.g., "My Store OAuth")
4. Click **Create**

### Step 2: Enable Google+ API

1. In your project, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click **Enable**

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (for public apps) or **Internal** (for organization only)
3. Click **Create**
4. Fill in required fields:
   - **App name**: Your application name
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click **Save and Continue**
6. **Scopes**: Click **Add or Remove Scopes**
   - Select: `email`, `profile`, `openid`
   - Click **Update** → **Save and Continue**
7. **Test users** (if External): Add your email for testing
8. Click **Save and Continue** → **Back to Dashboard**

### Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Application type**: **Web application**
4. **Name**: "Web Client" (or any name)
5. **Authorized JavaScript origins**:
   - Development: `http://localhost:5173`
   - Production: `https://yourdomain.com`
6. **Authorized redirect URIs**:
   - Leave empty (we use popup, not redirects)
7. Click **Create**
8. **Copy your credentials**:
   - ✅ **Client ID** (starts with `xxxxx.apps.googleusercontent.com`)
   - ⚠️ **Client Secret** (keep this secret!)

---

## Environment Variables

### Backend (.env)

Create/update `admin-dashboard/backend/server/.env`:

```env
# Database Configuration
DB_HOST=your_database_host
DB_PORT=23199
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=defaultdb

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com

# CORS Configuration
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# Email Configuration (existing)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_VERIFICATION_ENABLED=true
```

### Frontend (.env)

Create `Project-B/.env`:

```env
# API Base URL
VITE_API_URL=http://localhost:5000

# Google OAuth Client ID (same as backend)
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

> **⚠️ SECURITY NOTE**: Never commit `.env` files to Git! The Client ID is safe to expose on frontend, but keep Client Secret backend-only.

---

## Testing Locally

### 1. Start Backend Server

```bash
cd admin-dashboard/backend/server
npm install
npm run dev
```

Expected output:
```
✅ Google OAuth is enabled
✅ Google OAuth configuration validated
✅ Connected to DB: defaultdb
Server running on port 5000
```

### 2. Start Frontend Server

```bash
cd Project-B
npm install
npm run dev
```

### 3. Test Google Login

1. Open browser: `http://localhost:5173`
2. Navigate to login page
3. Click "Continue with Google" button
4. Google popup appears
5. Select your Google account
6. Grant permissions
7. You should be logged in and redirected to home page

### 4. Verify Session Persistence

1. Refresh the page → You should remain logged in
2. Close browser tab and reopen → Still logged in (7-day cookie)
3. Click logout → Cookie cleared, logged out

---

## Production Deployment

### 1. Update Google Cloud Console

1. Go to **Credentials** → Edit your OAuth client
2. Add production URLs to **Authorized JavaScript origins**:
   - `https://yourdomain.com`
   - `https://www.yourdomain.com`
3. Save changes

### 2. Update Environment Variables

**Backend Production (.env)**:
```env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
GOOGLE_CLIENT_ID=your_production_client_id
```

**Frontend Production (.env.production)**:
```env
VITE_API_URL=https://api.yourdomain.com
VITE_GOOGLE_CLIENT_ID=your_production_client_id
```

### 3. Security Checklist

- ✅ HTTPS enabled (required for secure cookies)
- ✅ `NODE_ENV=production` set
- ✅ Strong `JWT_SECRET` (32+ random characters)
- ✅ CORS configured with specific origins (no wildcards)
- ✅ Rate limiting enabled (already configured)
- ✅ httpOnly cookies enabled (already configured)
- ✅ Client Secret never exposed to frontend

---

## Troubleshooting

### "Google OAuth is DISABLED" on backend startup

**Problem**: `GOOGLE_CLIENT_ID` not found in environment variables.

**Solution**:
1. Check `.env` file exists in `admin-dashboard/backend/server/`
2. Verify `GOOGLE_CLIENT_ID` is set correctly
3. Restart backend server

### "Invalid Google token" error

**Problem**: Token verification failed.

**Possible causes**:
1. **Wrong Client ID**: Frontend and backend must use the same Client ID
2. **Expired token**: User took too long on Google consent screen
3. **Invalid credentials**: Check Client ID is correct

**Solution**:
- Verify `VITE_GOOGLE_CLIENT_ID` (frontend) matches `GOOGLE_CLIENT_ID` (backend)
- Try logging in again

### Google popup doesn't appear

**Problem**: Popup blocked or JavaScript origins not authorized.

**Solution**:
1. Check browser console for errors
2. Verify `http://localhost:5173` is in **Authorized JavaScript origins**
3. Disable popup blockers
4. Clear browser cache and cookies

### "redirect_uri_mismatch" error

**Problem**: This shouldn't happen with popup flow, but if it does:

**Solution**:
- We're using popup authentication, not redirects
- Ensure you didn't add redirect URIs in Google Console
- Check you're using `@react-oauth/google` correctly

### Session not persisting

**Problem**: User logged out after refresh.

**Possible causes**:
1. Cookies not being set
2. `withCredentials` not enabled in axios
3. CORS not configured for credentials

**Solution**:
- Check browser DevTools → Application → Cookies
- Verify `token` cookie exists with `httpOnly` flag
- Ensure `axios.defaults.withCredentials = true` is set
- Backend CORS must have `credentials: true`

### Database errors

**Problem**: "googleId column doesn't exist"

**Solution**:
- Restart backend server to run database migrations
- Check console for "✅ Added googleId column" message
- Manually run: `ALTER TABLE Users ADD COLUMN googleId VARCHAR(255) UNIQUE`

---

## API Endpoints Reference

### POST /api/auth/google/login
Authenticate user with Google credential token.

**Request**:
```json
{
  "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

**Response** (Success):
```json
{
  "success": true,
  "message": "Successfully authenticated with Google",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://lh3.googleusercontent.com/...",
    "role": "customer",
    "authMethod": "google"
  }
}
```

### GET /api/auth/profile
Get current user profile (requires authentication).

**Response**:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://...",
    "role": "customer",
    "authMethod": "google",
    "createdAt": "2026-02-03T10:00:00.000Z"
  }
}
```

### POST /api/auth/google/logout
Logout user (clears cookie).

**Response**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Support

If you encounter issues not covered here:

1. Check browser console for errors
2. Check backend server logs
3. Verify all environment variables are set correctly
4. Ensure database migrations ran successfully
5. Test with a different Google account

---

**Last Updated**: February 2026
