import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowDown, ArrowUpRight, MoveUpRight, CornerDownRight, MoveDownRight } from 'lucide-react'
import { projects, artworks, articles, currently, site } from '../content/archive'
import { ArchiveLabel, ProjectVisual, TextLink } from '../components/ui'
import { ArchiveMark } from '../components/ArchiveMark'
import { SurpriseMeButton } from '../components/SurpriseMeButton'
import { assetUrl } from '../lib/utils'

function DiscoveryCollection() {
  const project = projects.find(p => p.status === 'published')
  return <div className="discovery-collage" aria-label="Explore the collections">
    <div className="collage-ring" aria-hidden="true"/><span className="collage-note">Take a look around <MoveDownRight size={18} aria-hidden="true"/></span>
    <motion.div className="collage-card art-object" whileHover={{ y: -8, rotate: 2 }} transition={{ duration: 0.25 }}>
      <Link to="/art" aria-label="Explore Art — original paintings coming soon"><span className="collage-card-label mono">02 / THE GALLERY <ArrowUpRight size={14}/></span><div className="art-object-frame"><span className="frame-corner frame-corner-tl"/><span className="frame-corner frame-corner-br"/><span className="art-object-type">A space<br/>for <i>art.</i></span><span className="frame-caption mono">ORIGINAL WORKS<br/>COMING SOON</span></div><span className="art-object-foot mono">MINHWA & OTHER EXPLORATIONS</span></Link>
    </motion.div>
    {project && <motion.div className="collage-card work-object" whileHover={{ y: -8, rotate: -4 }} transition={{ duration: 0.25 }}><Link to={`/projects/${project.id}`} aria-label="Discover the Rena Seulgi Jang website project"><span className="mono collage-card-label">01 / SELECTED WORK <ArrowUpRight size={14}/></span><span className="work-object-title">Rena<br/><i>Seulgi Jang</i></span><span className="work-object-bottom mono">A MULTILINGUAL DIGITAL HOME</span><span className="paper-fold" aria-hidden="true"/></Link></motion.div>}
    <motion.div className="collage-card writing-object" whileHover={{ y: -7, rotate: 3 }} transition={{ duration: 0.25 }}><Link to="/writing" aria-label="Explore Writing — essays and notes to come"><span className="mono">03 / WORDS</span><span className="writing-object-title">Notes<br/>& <i>notions.</i></span><span className="writing-object-rule"/><ArrowUpRight size={21} aria-hidden="true"/></Link></motion.div>
    <span className="collage-footnote mono">FIG. 01 — A FEW WAYS IN</span>
    <div className="archive-stamp" aria-hidden="true"><span>PERSONAL ARCHIVE</span><strong>ALWAYS<br/>IN PROGRESS</strong><span>NO FINISH LINE</span></div>
  </div>
}

export function HomePage() {
  const selectedProjects = projects.filter(p => p.featured && p.status === 'published')
  const featuredArtwork = artworks.find(a => a.featured) || artworks[0]
  const featuredArticle = articles.find(a => a.featured && (a.body?.length || a.externalUrl))
  return <div className="home-page">
    <section className="home-hero page-shell" aria-labelledby="home-title">
      <div className="hero-topline mono"><span>THE PERSONAL ARCHIVE OF HANYEE JANG</span><span className="hero-open"><span className="status-dot"/>OPEN TO CURIOSITY</span></div>
      <div className="hero-composition">
        <motion.div className="hero-copy" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="hero-pretitle">A collection of</p><h1 id="home-title">everything<br/><span className="hero-ampersand">&</span> <i>nothing.</i></h1>
          <div className="hero-description"><CornerDownRight className="hero-description-mark" size={24} aria-hidden="true"/><p>Art, ideas, work, words<br/>and other curiosities.<span className="hero-fineprint">An evolving archive. A little of everything<br className="desktop-break"/> that makes a person.</span></p></div>
          <div className="hero-buttons"><a href="#collections" className="button button-dark" onClick={e => {e.preventDefault(); document.getElementById('collections')?.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'}); document.getElementById('collections')?.focus({preventScroll:true})}}>Explore the archive <ArrowDown size={15}/></a><SurpriseMeButton/></div>
        </motion.div>
        <DiscoveryCollection/>
      </div>
      <div className="hero-bottomline"><span className="mono">A DIGITAL HOME, NOT A FINISHED EXHIBITION.</span><Link to="/about">Meet the person behind it <MoveUpRight size={14}/></Link></div>
    </section>

    <section id="collections" tabIndex={-1} className="collection-entry page-shell" aria-labelledby="collections-title">
      <div className="section-minihead"><ArchiveLabel>THE COLLECTIONS</ArchiveLabel><Link to="/index" className="text-link mono">View the index <ArrowUpRight size={15}/></Link></div>
      <div className="collection-directory"><h2 id="collections-title" className="sr-only">Explore the collections</h2>{[{title:'Projects',sub:'Things made & considered',to:'/projects',number:'01'},{title:'Art',sub:'Paintings & visual stories',to:'/art',number:'02'},{title:'Writing',sub:'Thoughts finding their form',to:'/writing',number:'03'},{title:'Journal',sub:'Life & its little curiosities',to:'/journal',number:'04'}].map(c => <Link key={c.title} to={c.to} className="collection-directory-link"><span className="mono">{c.number} /</span><span><strong>{c.title}</strong><small>{c.sub}</small></span><ArrowUpRight aria-hidden="true" size={22}/></Link>)}</div>
    </section>

    <section className="home-selected page-shell" aria-labelledby="selected-title">
      <div className="home-section-title"><div><ArchiveLabel>01 / FROM THE PROJECT ARCHIVE</ArchiveLabel><h2 id="selected-title">A few things,<br/><i>carefully kept.</i></h2></div><TextLink to="/projects">All projects</TextLink></div>
      {selectedProjects.length ? selectedProjects.map(project => <Link key={project.id} to={`/projects/${project.id}`} className="featured-project"><ProjectVisual project={project}/><div className="featured-project-copy"><div className="featured-project-meta"><ArchiveLabel>{project.number}</ArchiveLabel><span className="pill">Published</span></div><h3>{project.title}</h3><p>{project.summary}</p><span className="mono featured-languages">{project.id === 'rena-seulgi-jang' ? 'ENGLISH · 한국어 · DEUTSCH' : project.category}</span><span className="text-link">Step inside the project <ArrowUpRight size={18}/></span></div></Link>) : <p>The next selected project will appear here.</p>}
    </section>

    <section className="home-art-writing page-shell" aria-label="From the gallery and library">
      <Link to={featuredArtwork ? `/art/${featuredArtwork.id}` : '/art'} className="home-art-card">
        <div className="home-art-top"><ArchiveLabel>02 / THE GALLERY</ArchiveLabel><ArrowUpRight size={22} aria-hidden="true"/></div>
        {featuredArtwork ? <><img className="home-original-art" src={assetUrl(featuredArtwork.image)} alt={featuredArtwork.title} loading="lazy"/><h2>{featuredArtwork.title}</h2><p>{featuredArtwork.medium}</p></> : <><div className="gallery-preview-frame" aria-hidden="true"><span>For the things<br/><i>words can’t say.</i></span><small className="mono">ORIGINAL PAINTINGS<br/>COMING SOON</small></div><h2>An open wall.</h2><p>Contemporary interpretations of Korean minhwa.<br/>The first original works will find their place here.</p></>}
      </Link>
      <div className="home-writing-card"><div className="home-writing-top"><ArchiveLabel>03 / THE LIBRARY</ArchiveLabel><span className="mono">WORDS, WORDS, WORDS.</span></div><span className="writing-asterisk" aria-hidden="true"><ArchiveMark/></span><h2>{featuredArticle ? featuredArticle.title : <>Some thoughts<br/>need a little<br/><i>more room.</i></>}</h2><p>{featuredArticle ? featuredArticle.excerpt : 'A home for essays, observations and ideas. The shelves are ready; the first pieces are still to come.'}</p><TextLink to={featuredArticle ? `/writing/${featuredArticle.id}` : '/writing'}>{featuredArticle ? 'Read the piece' : 'Visit the library'}</TextLink></div>
    </section>

    <section className="home-current page-shell" aria-labelledby="current-title"><div className="current-heading"><ArchiveLabel>IN THE MARGINS</ArchiveLabel><h2 id="current-title">Currently<br/><i>on my mind.</i></h2><MoveUpRight className="current-pencil" size={38} aria-hidden="true"/></div><div className="current-notes">{currently.map((note,i) => <div className="current-note" key={note.label}><span className="mono">0{i+1}</span><div><h3>{note.label}</h3><p>{note.text}</p>{note.href && <Link to={note.href} className="text-link">Take a closer look <ArrowUpRight size={14}/></Link>}</div></div>)}</div></section>
    <section className="random-discovery page-shell"><div><span className="mono">NO PARTICULAR DESTINATION?</span><h2>Let curiosity <i>choose.</i></h2><p>One click. One published piece from the collection.</p></div><SurpriseMeButton className="surprise-large"/><span className="random-flower" aria-hidden="true"><ArchiveMark/></span></section>
    <span className="sr-only">{site.tagline}</span>
  </div>
}
