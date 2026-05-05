import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import i18n from '../i18n';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('lang') || 'ar';
  });

  const isRTL = lang === 'ar';

    // Apply lang to document on mount and change
    // Removed document.dir mutation to keep layout identical across both languages
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = 'ltr';
    document.body.dir = 'ltr';
    localStorage.setItem('lang', lang);
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, isRTL]);

  const setLang = useCallback((newLang) => {
    setLangState(newLang);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState(prev => prev === 'ar' ? 'en' : 'ar');
  }, []);

  /**
   * getProductField(product, field)
   * Returns the appropriate language version of a bilingual field.
   * Falls back gracefully if the translation is missing.
   *
   * Usage:
   *   getProductField(product, 'title')       → title_ar or title (with fallback)
   *   getProductField(product, 'description') → description_ar or description (with fallback)
   */
  const getProductField = useCallback((product, field) => {
    if (!product) return '';

    if (lang === 'ar') {
      const arField = `${field}_ar`;
      // Use Arabic if available, otherwise fall back to English
      return product[arField] || product[field] || '';
    }

    // For English, use English field directly
    return product[field] || '';
  }, [lang]);

  /**
   * getCategoryField(category, field)
   * Same logic for categories (name / name_ar, description / description_ar)
   */
  const getCategoryField = useCallback((category, field) => {
    if (!category) return '';

    if (lang === 'ar') {
      const arField = `${field}_ar`;
      return category[arField] || category[field] || '';
    }

    return category[field] || '';
  }, [lang]);

  return (
    <LanguageContext.Provider value={{
      lang,
      setLang,
      toggleLang,
      isRTL,
      getProductField,
      getCategoryField,
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
};

export default LanguageContext;
