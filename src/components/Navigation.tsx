import { useEffect, useRef, useState } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { LocaleNavLink as NavLink, LocaleLink as Link, useLanguage, localizedPath, withoutLanguage } from '../i18n'
import { ArrowUpRight, Menu, X, List } from 'lucide-react'
import { site } from '../content/archive'
import { ArchiveMark } from './ArchiveMark'
import { assetUrl } from '../lib/utils'

const sections = [{route:'about',en:'About',ko:'소개'},{route:'projects',en:'Projects',ko:'프로젝트'},{route:'art',en:'Art',ko:'그림'},{route:'writing',en:'Writing',ko:'글'},{route:'journal',en:'Journal',ko:'기록'},{route:'contact',en:'Contact',ko:'연락'}]

export function Navigation() {
  const [open, setOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const { pathname, search } = useLocation()
  const { language, text } = useLanguage()
  const plainPath=withoutLanguage(pathname)
  useEffect(() => {
    if (!open) return
    panel.current?.querySelector<HTMLAnchorElement>('a')?.focus()
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') { setOpen(false); menuButton.current?.focus() }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])
  return <header className="site-header">
    <Link to="/" className="brand" aria-label={text('Hanyee Jang, home','Hanyee Jang, 홈')} onClick={() => setOpen(false)}><span className="brand-symbol" aria-hidden="true"><ArchiveMark/></span><span>Hanyee Jang<span className="brand-subtitle mono">THE LIVING ARCHIVE</span></span></Link>
    <nav className="desktop-nav" aria-label={text('Main navigation','주 메뉴')}>
      <NavLink to="/" end>{text('Home','홈')}</NavLink>
      {sections.map(section => <NavLink key={section.route} to={`/${section.route}`}>{text(section.en,section.ko)}</NavLink>)}
    </nav>
    <div className="header-actions">
      <nav className="language-switch mono" aria-label={text('Website language','웹사이트 언어')}>
        {(['en','ko'] as const).map(locale=><RouterLink key={locale} to={`${localizedPath(plainPath,locale)}${search}`} lang={locale} aria-label={locale==='en' ? 'View website in English' : '한국어로 보기'} aria-current={language===locale ? 'true' : undefined} onClick={()=>setOpen(false)}>{locale==='en' ? 'EN' : '한국어'}</RouterLink>)}
      </nav>
      <NavLink to="/index" className="index-link mono" aria-label={text('Browse the archive index','아카이브 목차 보기')}><List size={14} aria-hidden="true"/><span>{text('Index','목차')}</span></NavLink>
      {site.cvUrl ? <a href={assetUrl(site.cvUrl)} className="cv-link mono" target="_blank" rel="noopener noreferrer">CV <ArrowUpRight size={13}/><span className="sr-only">{text(' (opens in a new tab)',' (새 탭에서 열림)')}</span></a> : <Link to="/cv" className="cv-link mono" aria-label={text('CV — coming soon','이력서 — 준비 중')}>CV <ArrowUpRight size={13} aria-hidden="true"/></Link>}
      <button className="mobile-menu-button" ref={menuButton} aria-label={open ? text('Close menu','메뉴 닫기') : text('Open menu','메뉴 열기')} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
    </div>
    {open && <div className="mobile-menu" ref={panel} id="mobile-navigation">
      <span className="mono mobile-menu-title">{text('FIND YOUR WAY AROUND','아카이브 둘러보기')}</span>
      <nav aria-label={text('Mobile navigation','모바일 메뉴')}>
        {[{route:'',en:'Home',ko:'홈'}, ...sections].map((section, i) => <Link key={section.route} to={section.route ? `/${section.route}` : '/'} aria-current={plainPath === (section.route ? `/${section.route}` : '/') ? 'page' : undefined} onClick={() => setOpen(false)}><span className="mono">0{i}</span>{text(section.en,section.ko)}<ArrowUpRight size={22}/></Link>)}
      </nav>
    </div>}
  </header>
}
