import { useState } from 'react'
import { ArchiveMark } from './ArchiveMark'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { site } from '../content/archive'

export function Footer() {
  const [found, setFound] = useState(false)
  return <footer className="site-footer">
    <div className="footer-top"><div><span className="mono">THIS IS AN ONGOING COLLECTION.</span><p>A little unfinished.<br/><i>Always becoming.</i></p></div><Link to="/contact" className="footer-contact">Let’s make a connection <ArrowUpRight size={26}/></Link></div>
    <div className="footer-bottom"><span className="mono">© {new Date().getFullYear()} {site.name}</span><div className="footer-links">{site.links.map(link => <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer">{link.label}<ArrowUpRight size={12}/><span className="sr-only"> (opens in a new tab)</span></a>)}<Link to="/index">Archive index</Link></div><button onClick={() => setFound(!found)} className="secret-flower" aria-label={found ? 'Hide the little discovery' : 'Find a little discovery'} aria-expanded={found}><ArchiveMark/></button></div>
    {found && <p className="secret-note" role="status">You found a little corner of the archive. Stay curious.</p>}
  </footer>
}
