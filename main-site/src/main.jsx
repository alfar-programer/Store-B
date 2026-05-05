// i18n MUST be imported before anything else to initialize translations
import './i18n'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'
import { CartProvider } from './context/CartContext'
import { SearchProvider } from './context/SearchContext'
import { LanguageProvider } from './context/LanguageContext'

// Get Google Client ID from environment variable
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <HelmetProvider>
        <LanguageProvider>
          <CartProvider>
            <SearchProvider>
              <App />
            </SearchProvider>
          </CartProvider>
        </LanguageProvider>
      </HelmetProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
