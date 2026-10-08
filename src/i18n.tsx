/* eslint-disable react-refresh/only-export-components -- Context and locale-aware route helpers share this module. */
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { Link as RouterLink, NavLink as RouterNavLink, useLocation, type LinkProps, type NavLinkProps, type To } from 'react-router-dom'
import type { Localizable } from './content/archive'

export type Language = 'en' | 'ko'
const preferenceKey = 'living-archive.language'
export function isLanguage(value: string | undefined | null): value is Language { return value === 'en' || value === 'ko' }
export function withoutLanguage(pathname: string) { return pathname.replace(/^\/(en|ko)(?=\/|$)/, '') || '/' }
export function localizedPath(to: string, language: Language) {
  if (!to.startsWith('/') || /^\/(en|ko)(?:\/|$)/.test(to)) return to
  return `/${language}${to === '/' ? '' : to}`
}

const categoryTranslations: Record<string, string> = {
  'All':'전체', 'Marketing & Communications':'마케팅·커뮤니케이션', 'Websites & Digital':'웹사이트·디지털', 'Research & Data':'리서치·데이터', 'Independent Projects':'독립 프로젝트',
  'Business & Brands':'비즈니스·브랜드', 'Business Analysis':'비즈니스 분석', 'Essays':'에세이', 'Personal Reflections':'생각과 일상', 'Film, Art & Culture':'영화·예술·문화', 'Other Writing':'다른 글',
  'Travel & Culture':'여행·문화', 'Language Learning':'언어 공부', 'Technology':'기술·디지털',
}
export function categoryLabel(category: string, language: Language) { return language === 'ko' ? categoryTranslations[category] || category : category }

interface LanguageContextValue {
  language: Language
  text: (en: string, ko: string) => string
  localize: <T extends Localizable>(item: T) => T
  path: (to: string) => string
  category: (name: string) => string
}
const LanguageContext = createContext<LanguageContextValue | null>(null)

function storedLanguage(): Language {
  try { const stored=localStorage.getItem(preferenceKey);return isLanguage(stored) ? stored : 'en' } catch { return 'en' }
}
export function LanguageProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const prefix=pathname.split('/')[1]
  const language=isLanguage(prefix) ? prefix : storedLanguage()
  useEffect(() => {
    document.documentElement.lang=language
    document.documentElement.classList.toggle('lang-ko',language==='ko')
    try { localStorage.setItem(preferenceKey,language) } catch { /* Preference storage is optional. */ }
  },[language])
  const value=useMemo<LanguageContextValue>(()=>({
    language,
    text:(en,ko)=>language==='ko' ? ko : en,
    localize:<T extends Localizable>(item:T):T=>({...item,...item.translations?.[language]}),
    path:(to)=>localizedPath(to,language),
    category:(name)=>categoryLabel(name,language),
  }),[language])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
export function useLanguage() {
  const value=useContext(LanguageContext)
  if (!value) throw new Error('LanguageProvider is required.')
  return value
}
function localTo(to:To,language:Language):To { return typeof to==='string' ? localizedPath(to,language) : {...to,pathname:to.pathname ? localizedPath(to.pathname,language) : to.pathname} }
export function LocaleLink(props:LinkProps) { const {language}=useLanguage();return <RouterLink {...props} to={localTo(props.to,language)}/> }
export function LocaleNavLink(props:NavLinkProps) { const {language}=useLanguage();return <RouterNavLink {...props} to={localTo(props.to,language)}/> }
