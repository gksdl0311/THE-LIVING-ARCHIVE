import type { ReactNode } from 'react'
import { ArchiveMark } from './ArchiveMark'
import { ArrowUpRight, MoveUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Project } from '../content/archive'
import { assetUrl } from '../lib/utils'

export function ArchiveLabel({ children }: { children: ReactNode }) {
  return <span className="archive-label mono">{children}</span>
}

export function SectionHeader({ eyebrow, title, description, children }: { eyebrow?: string; title: string; description?: string; children?: ReactNode }) {
  return <header className="section-header">
    {eyebrow && <ArchiveLabel>{eyebrow}</ArchiveLabel>}
    <div className="section-heading-row"><h1>{title}</h1>{children}</div>
    {description && <p className="section-description">{description}</p>}
  </header>
}

export function EmptyCollection({ number, title, description, children }: { number: string; title: string; description: string; children?: ReactNode }) {
  return <div className="empty-collection">
    <div className="empty-symbol" aria-hidden="true"><ArchiveMark/></div>
    <ArchiveLabel>{number} / A collection in the making</ArchiveLabel>
    <h2>{title}</h2><p>{description}</p>{children}
  </div>
}

export function ProjectVisual({ project, className = '' }: { project: Project; className?: string }) {
  if (project.thumbnail) return <div className={`project-visual ${className}`}><img src={assetUrl(project.thumbnail)} alt={`${project.title} project visual`} loading="lazy" /></div>
  const isRena = project.id.includes('rena')
  return <div className={`project-visual ${isRena ? 'project-visual-rena' : 'project-visual-paper'} ${className}`} aria-hidden="true">
    <span className="project-cover-top mono">{isRena ? 'AN ARTIST’S DIGITAL HOME' : 'A WORK IN THE MAKING'}</span>
    {isRena ? <><span className="rena-cover-name">Rena<br /><i>Seulgi Jang</i></span><span className="rena-cover-rule" /><span className="project-cover-bottom mono">English / 한국어 / Deutsch</span></> : <><span className="project-cover-number">{project.number.replace(/[^0-9]/g, '') || '0'}</span><span className="project-cover-bottom mono">{project.category}</span></>}
  </div>
}

export function TextLink({ to, children, external = false }: { to: string; children: ReactNode; external?: boolean }) {
  return external ? <a className="text-link" href={to} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a> : <Link className="text-link" to={to}>{children}<MoveUpRight size={16} aria-hidden="true" /></Link>
}
