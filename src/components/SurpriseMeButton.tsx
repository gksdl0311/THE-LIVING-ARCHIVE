import { useLanguage } from '../i18n'
import { useNavigate } from 'react-router-dom'
import { Shuffle, ArrowUpRight } from 'lucide-react'
import { projects, artworks, articles, journalEntries } from '../content/archive'

export function SurpriseMeButton({ className = '' }: { className?: string }) {
  const navigate = useNavigate()
  const { path, text } = useLanguage()
  const routes = [
    ...projects.filter(p => p.status === 'published').map(p => `/projects/${p.id}`),
    ...artworks.map(a => `/art/${a.id}`),
    ...articles.filter(a => a.body?.length || a.externalUrl).map(a => `/writing/${a.id}`),
    ...journalEntries.filter(j => j.body.length).map(j => `/journal/${j.id}`),
  ]
  return <button className={`surprise-button ${className}`} disabled={!routes.length} onClick={() => navigate(path(routes[Math.floor(Math.random() * routes.length)]))}><Shuffle size={16} aria-hidden="true"/>{text('Surprise me','뜻밖의 발견')}<ArrowUpRight size={13} aria-hidden="true"/></button>
}
