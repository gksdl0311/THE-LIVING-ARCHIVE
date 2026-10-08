import type { ReactNode } from 'react'
import { ArchiveMark } from './ArchiveMark'
import { ArrowUpRight, MoveUpRight } from 'lucide-react'
import { LocaleLink as Link, useLanguage } from '../i18n'
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
  const { text } = useLanguage()
  return <div className="empty-collection">
    <div className="empty-symbol" aria-hidden="true"><ArchiveMark/></div>
    <ArchiveLabel>{number} / {text('A collection in the making','준비 중인 컬렉션')}</ArchiveLabel>
    <h2>{title}</h2><p>{description}</p>{children}
  </div>
}

export function ProjectVisual({ project, className = '' }: { project: Project; className?: string }) {
  const { text, category } = useLanguage()
  if (project.thumbnail) return <div className={`project-visual ${className}`}><img src={assetUrl(project.thumbnail)} alt={`${project.title} ${text('project visual','프로젝트 이미지')}`} loading="lazy" /></div>
  const isRena = project.id.includes('rena')
  return <div className={`project-visual ${isRena ? 'project-visual-rena' : 'project-visual-paper'} ${className}`} aria-hidden="true">
    <span className="project-cover-top mono">{isRena ? text('AN ARTIST’S DIGITAL HOME','예술가의 디지털 공간') : text('A WORK IN THE MAKING','준비 중인 작업')}</span>
    {isRena ? <><span className="rena-cover-name">Rena<br /><i>Seulgi Jang</i></span><span className="rena-cover-rule" /><span className="project-cover-bottom mono">English / 한국어 / Deutsch</span></> : <><span className="project-cover-number">{project.number.replace(/[^0-9]/g, '') || '0'}</span><span className="project-cover-bottom mono">{category(project.category)}</span></>}
  </div>
}

export function TextLink({ to, children, external = false }: { to: string; children: ReactNode; external?: boolean }) {
  const { text } = useLanguage()
  return external ? <a className="text-link" href={to} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only">{text(' (opens in a new tab)',' (새 탭에서 열림)')}</span></a> : <Link className="text-link" to={to}>{children}<MoveUpRight size={16} aria-hidden="true" /></Link>
}
