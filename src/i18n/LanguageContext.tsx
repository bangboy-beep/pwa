// SmartQR Language Context & i18n Hook
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import type { Language, TranslationDictionary } from './types'
import { id } from './locales/id'
import { en } from './locales/en'

const STORAGE_KEY = 'smartqr_language'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  t: <S extends keyof TranslationDictionary, K extends keyof TranslationDictionary[S]>(
    section: S,
    key: K,
    params?: Record<string, string | number>
  ) => string
  formatPrice: (amount: number) => string
  dict: TranslationDictionary
}

const dictionaries: Record<Language, TranslationDictionary> = { id, en }

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'id' || saved === 'en') return saved
      // Auto-detect browser language
      if (typeof navigator !== 'undefined' && navigator.language) {
        return navigator.language.toLowerCase().startsWith('id') ? 'id' : 'en'
      }
    } catch {
      // fallback
    }
    return 'id'
  })

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem(STORAGE_KEY, lang)
      document.documentElement.lang = lang
    } catch {
      // ignore storage error
    }
  }, [])

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'id' ? 'en' : 'id')
  }, [language, setLanguage])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const dict = useMemo(() => dictionaries[language] || id, [language])

  const t = useCallback(
    <S extends keyof TranslationDictionary, K extends keyof TranslationDictionary[S]>(
      section: S,
      key: K,
      params?: Record<string, string | number>
    ): string => {
      const sectionObj = dict[section]
      if (!sectionObj) return String(key)
      let text = (sectionObj[key] as unknown as string) || (dictionaries.id[section]?.[key] as unknown as string) || String(key)

      if (params) {
        Object.entries(params).forEach(([paramKey, paramVal]) => {
          text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal))
        })
      }
      return text
    },
    [dict]
  )

  const formatPrice = useCallback(
    (amount: number): string => {
      if (language === 'en') {
        return `Rp ${amount.toLocaleString('en-US')}`
      }
      return `Rp ${amount.toLocaleString('id-ID')}`
    },
    [language]
  )

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      formatPrice,
      dict,
    }),
    [language, setLanguage, toggleLanguage, t, formatPrice, dict]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
