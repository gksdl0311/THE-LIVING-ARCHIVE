import { useState } from 'react'
import { ArchiveMark } from './ArchiveMark'
import { LocaleLink as Link, useLanguage } from '../i18n'
import { ArrowUpRight } from 'lucide-react'
import { site } from '../content/archive'

export function Footer() {
  const [found, setFound] = useState(false)
  const { text } = useLanguage()
  return <footer className="site-footer">
    <div className="footer-top"><div><span className="mono">{text('THIS IS AN ONGOING COLLECTION.','계속 자라나는 컬렉션입니다.')}</span><p>{text('A little unfinished.','조금은 미완성인 채로.')}<br/><i>{text('Always becoming.','늘 무언가 되어가는 중.')}</i></p></div><Link to="/contact" className="footer-contact">{text('Let’s make a connection','우리, 연결되어 봐요')} <ArrowUpRight size={26}/></Link></div>
    <div className="footer-bottom"><span className="mono">© {new Date().getFullYear()} {site.name}</span><div className="footer-links">{site.links.map(link => <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer">{link.label}<ArrowUpRight size={12}/><span className="sr-only">{text(' (opens in a new tab)',' (새 탭에서 열림)')}</span></a>)}<Link to="/index">{text('Archive index','아카이브 목차')}</Link></div><button onClick={() => setFound(!found)} className="secret-flower" aria-label={found ? text('Hide the little discovery','작은 발견 숨기기') : text('Find a little discovery','작은 발견 찾기')} aria-expanded={found}><ArchiveMark/></button></div>
    {found && <p className="secret-note" role="status">{text('You found a little corner of the archive. Stay curious.','아카이브의 작은 구석을 발견했네요. 호기심을 간직해 주세요.')}</p>}
  </footer>
}
