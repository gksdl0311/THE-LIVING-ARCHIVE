import { useEffect, useRef, lazy, Suspense } from 'react'
import { Routes, Route, useLocation, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Navigation } from './components/Navigation'
import { Footer } from './components/Footer'
import { HomePage } from './pages/Home'
import { IndexPage } from './pages/IndexPage'
const ProjectsPage = lazy(() => import('./pages/CollectionPages').then(m => ({default:m.ProjectsPage})))
const ProjectDetailPage = lazy(() => import('./pages/CollectionPages').then(m => ({default:m.ProjectDetailPage})))
const ArtPage = lazy(() => import('./pages/CollectionPages').then(m => ({default:m.ArtPage})))
const ArtworkDetailPage = lazy(() => import('./pages/CollectionPages').then(m => ({default:m.ArtworkDetailPage})))
const WritingPage = lazy(() => import('./pages/CollectionPages').then(m => ({default:m.WritingPage})))
const ArticleDetailPage = lazy(() => import('./pages/CollectionPages').then(m => ({default:m.ArticleDetailPage})))
const AboutPage = lazy(() => import('./pages/PersonalPages').then(m => ({default:m.AboutPage})))
const JournalPage = lazy(() => import('./pages/PersonalPages').then(m => ({default:m.JournalPage})))
const JournalDetailPage = lazy(() => import('./pages/PersonalPages').then(m => ({default:m.JournalDetailPage})))
const ContactPage = lazy(() => import('./pages/PersonalPages').then(m => ({default:m.ContactPage})))
const CvPage = lazy(() => import('./pages/PersonalPages').then(m => ({default:m.CvPage})))
import { projects, artworks, articles, journalEntries, site } from './content/archive'
import { SectionHeader } from './components/ui'

const pageMeta: Record<string, {title:string;description:string}> = {
  '/': { title:'Hanyee Jang — The Living Archive',description:site.description },
  '/about': {title:'About — Hanyee Jang',description:'The person behind the archive: education, experience and a life across art, work and ideas.'},
  '/projects': {title:'Projects — The Living Archive',description:'Websites, communications, research and creative projects by Hanyee Jang.'},
  '/art': {title:'Art — The Living Archive',description:'A growing gallery of original paintings and contemporary Korean minhwa.'},
  '/writing': {title:'Writing — The Living Archive',description:'A library for essays, brand analysis, reflections and cultural writing.'},
  '/journal': {title:'Journal — The Living Archive',description:'Life, culture and little curiosities: a personal journal in the making.'},
  '/contact': {title:'Contact — Hanyee Jang',description:'Professional opportunities, creative collaboration and interesting conversations.'},
  '/index': {title:'Index — The Living Archive',description:'A clear directory of the collections and published items in Hanyee Jang’s archive.'},
  '/cv': {title:'CV — Hanyee Jang',description:'Curriculum vitae and experience of Hanyee Jang.'},
}

function RouteEffects() {
  const { pathname } = useLocation()
  const previous = useRef(pathname)
  useEffect(() => {
    const segments = pathname.split('/')
    const item = segments[1] === 'projects' ? projects.find(p=>p.id===segments[2]) : segments[1] === 'art' ? artworks.find(a=>a.id===segments[2]) : segments[1] === 'writing' ? articles.find(a=>a.id===segments[2]) : journalEntries.find(j=>j.id===segments[2])
    const meta = pageMeta[pathname] || (item ? {title:`${item.title} — The Living Archive`,description:'description' in item ? item.description : 'excerpt' in item ? item.excerpt : item.title} : {title:'Not found — The Living Archive',description:'Find your way back through the archive index.'})
    document.title = meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content',meta.description)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content',meta.title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content',meta.description)
    if (previous.current !== pathname) {
      window.scrollTo({top:0,behavior:'instant'})
      document.getElementById('main-content')?.focus({preventScroll:true})
      previous.current = pathname
    }
  }, [pathname])
  return null
}

export function App() {
  const { pathname } = useLocation()
  return <><a href="#main-content" className="skip-link" onClick={e=>{e.preventDefault();document.getElementById('main-content')?.focus()}}>Skip to content</a><Navigation/><RouteEffects/><main id="main-content" tabIndex={-1}><motion.div key={pathname} initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.24}}><Suspense fallback={<div className="page-shell route-loading" role="status">Opening the archive…</div>}><Routes>
    <Route path="/" element={<HomePage/>}/><Route path="/about" element={<AboutPage/>}/><Route path="/projects" element={<ProjectsPage/>}/><Route path="/projects/:id" element={<ProjectDetailPage/>}/><Route path="/art" element={<ArtPage/>}/><Route path="/art/:id" element={<ArtworkDetailPage/>}/><Route path="/writing" element={<WritingPage/>}/><Route path="/writing/:id" element={<ArticleDetailPage/>}/><Route path="/journal" element={<JournalPage/>}/><Route path="/journal/:id" element={<JournalDetailPage/>}/><Route path="/contact" element={<ContactPage/>}/><Route path="/cv" element={<CvPage/>}/><Route path="/index" element={<IndexPage/>}/><Route path="*" element={<div className="page-shell not-found"><SectionHeader eyebrow="OUTSIDE THE COLLECTION" title="A little lost?" description="This page hasn’t found its place in the archive. The index will help you find your way."/><Link className="button button-dark" to="/index">Back to the index ↗</Link></div>}/>
  </Routes></Suspense></motion.div></main><Footer/></>
}
