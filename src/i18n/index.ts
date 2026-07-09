import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ar from './locales/ar.json'
import en from './locales/en.json'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: 'ar',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export function applyLanguage(language: 'en' | 'ar'): void {
  i18n.changeLanguage(language)
  document.documentElement.lang = language
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
}

export default i18n
