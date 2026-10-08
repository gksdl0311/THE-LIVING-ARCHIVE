import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { SectionHeader, ArchiveLabel } from '../components/ui'
import { projects, artworks, articles, journalEntries } from '../content/archive'
import { SurpriseMeButton } from '../components/SurpriseMeButton'

export function IndexPage() {
  const collections = [
    {title:'About',description:'The person behind the collection',to:'/about'},
    {title:'Projects',description:`${projects.filter(p=>p.status==='published').length} published · ${projects.filter(p=>p.status!=='published').length} in preparation`,to:'/projects'},
    {title:'Art',description:artworks.length ? `${artworks.length} original works` : 'Original works coming soon',to:'/art'},
    {title:'Writing',description:articles.length ? `${articles.length} pieces` : 'The first pieces are still to come',to:'/writing'},
    {title:'Journal',description:journalEntries.length ? `${journalEntries.length} entries` : 'Notes and curiosities to come',to:'/journal'},
    {title:'Contact',description:'Connections & conversations',to:'/contact'},
  ]
  return <div className="page-shell index-page"><SectionHeader eyebrow="A CLEAR WAY THROUGH" title="The index." description="Everything has a place. Find your way through the collections, or leave it to curiosity."><SurpriseMeButton/></SectionHeader><nav className="index-directory" aria-label="Collection directory">{collections.map((c,i)=><Link to={c.to} key={c.title}><span className="mono">0{i+1}</span><h2>{c.title}</h2><p>{c.description}</p><ArrowUpRight size={25} aria-hidden="true"/></Link>)}</nav><section className="index-published"><ArchiveLabel>PUBLISHED ITEMS</ArchiveLabel>{projects.filter(p=>p.status==='published').map(p=><Link to={`/projects/${p.id}`} key={p.id}><span className="mono">{p.number}</span><span>{p.title}</span><ArrowUpRight size={17}/></Link>)}{artworks.map(a=><Link to={`/art/${a.id}`} key={a.id}><span className="mono">{a.number}</span><span>{a.title}</span><ArrowUpRight size={17}/></Link>)}{articles.filter(a=>a.body?.length||a.externalUrl).map(a=><Link to={`/writing/${a.id}`} key={a.id}><span className="mono">{a.number}</span><span>{a.title}</span><ArrowUpRight size={17}/></Link>)}{journalEntries.filter(j=>j.body.length).map(j=><Link to={`/journal/${j.id}`} key={j.id}><span className="mono">JOURNAL</span><span>{j.title}</span><ArrowUpRight size={17}/></Link>)}</section></div>
}
