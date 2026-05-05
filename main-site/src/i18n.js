import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Default language: Arabic (primary content language)
    fallbackLng: 'ar',
    lng: localStorage.getItem('lang') || 'ar',

    // Namespace
    ns: ['translation'],
    defaultNS: 'translation',

    // Load translation files from /public/locales
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },

    detection: {
      // Check localStorage first, then browser setting
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'lang',
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    react: {
      useSuspense: false, // Prevent flicker on initial load
    },
  });

export default i18n;
