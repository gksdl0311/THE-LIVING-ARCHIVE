import { useEffect, useRef, useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { ArrowUpRight, Menu, X, List } from 'lucide-react'
import { site } from '../content/archive'
import { ArchiveMark } from './ArchiveMark'
import { assetUrl } from '../lib/utils'

const sections = ['About', 'Projects', 'Art', 'Writing', 'Journal', 'Contact']

export function Navigation() {
  const [open, setOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
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
    <Link to="/" className="brand" aria-label="Hanyee Jang, home" onClick={() => setOpen(false)}><span className="brand-symbol" aria-hidden="true"><ArchiveMark/></span><span>Hanyee Jang<span className="brand-subtitle mono">THE LIVING ARCHIVE</span></span></Link>
    <nav className="desktop-nav" aria-label="Main navigation">
      <NavLink to="/" end>Home</NavLink>
      {sections.map(label => <NavLink key={label} to={`/${label.toLowerCase()}`}>{label}</NavLink>)}
    </nav>
    <div className="header-actions">
      <NavLink to="/index" className="index-link mono" aria-label="Browse the archive index"><List size={14} aria-hidden="true"/><span>Index</span></NavLink>
      {site.cvUrl ? <a href={assetUrl(site.cvUrl)} className="cv-link mono" target="_blank" rel="noopener noreferrer">CV <ArrowUpRight size={13}/><span className="sr-only"> (opens in a new tab)</span></a> : <Link to="/cv" className="cv-link mono" aria-label="CV — coming soon">CV <ArrowUpRight size={13} aria-hidden="true"/></Link>}
      <button className="mobile-menu-button" ref={menuButton} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
    </div>
    {open && <div className="mobile-menu" ref={panel} id="mobile-navigation">
      <span className="mono mobile-menu-title">FIND YOUR WAY AROUND</span>
      <nav aria-label="Mobile navigation">
        {['Home', ...sections].map((label, i) => <Link key={label} to={i === 0 ? '/' : `/${label.toLowerCase()}`} aria-current={pathname === (i === 0 ? '/' : `/${label.toLowerCase()}`) ? 'page' : undefined} onClick={() => setOpen(false)}><span className="mono">0{i}</span>{label}<ArrowUpRight size={22}/></Link>)}
      </nav>
    </div>}
  </header>
}
