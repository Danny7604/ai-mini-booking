'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { langs } from './i18n'

type Lang = 'vi' | 'en'

const LangContext = createContext<{
  lang: Lang
  setLang: (l: Lang) => void
  t: (typeof langs)['vi']
}>({
  lang: 'vi',
  setLang: () => {},
  t: langs.vi,
})

export function useLang() {
  return useContext(LangContext)
}

export default function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('vi')

  useEffect(() => {
    const saved = localStorage.getItem('dancin-lang') as Lang | null
    if (saved && (saved === 'vi' || saved === 'en')) setLangState(saved)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('dancin-lang', l)
  }

  const t = langs[lang]

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}
