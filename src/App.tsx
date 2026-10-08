import { useEffect, useRef, lazy, Suspense } from 'react'
import { Routes, Route, useLocation, useParams, Navigate } from 'react-router-dom'
import { LocaleLink as Link, useLanguage, isLanguage, withoutLanguage } from './i18n'
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
  const { language, text, localize } = useLanguage()
  const previous = useRef(pathname)
  useEffect(() => {
    const plainPath = withoutLanguage(pathname)
    const segments = plainPath.split('/')
    const originalItem = segments[1] === 'projects' ? projects.find(p=>p.id===segments[2]) : segments[1] === 'art' ? artworks.find(a=>a.id===segments[2]) : segments[1] === 'writing' ? articles.find(a=>a.id===segments[2]) : journalEntries.find(j=>j.id===segments[2])
    const item = originalItem ? localize(originalItem) : undefined
    const koreanMeta: Record<string, {title:string;description:string}> = {
      '/':{title:'Hanyee Jang — 살아가는 아카이브',description:'예술, 생각, 작업, 글 그리고 다양한 호기심. Hanyee Jang의 계속 자라나는 개인 아카이브.'},
      '/about':{title:'소개 — Hanyee Jang',description:'아카이브 뒤의 사람: 배움과 경험, 예술과 일, 생각을 넘나드는 삶.'},
      '/projects':{title:'프로젝트 — 살아가는 아카이브',description:'Hanyee Jang의 웹사이트, 커뮤니케이션, 리서치와 창작 프로젝트.'},
      '/art':{title:'그림 — 살아가는 아카이브',description:'직접 그린 작품과 한국 민화를 새롭게 해석하는 갤러리.'},
      '/writing':{title:'글 — 살아가는 아카이브',description:'Naver 블로그와 The Business Behind It의 글을 모은 서가.'},
      '/journal':{title:'기록 — 살아가는 아카이브',description:'삶과 문화, 작은 호기심을 담는 개인 기록.'},
      '/contact':{title:'연락 — Hanyee Jang',description:'일과 창작의 기회, 협업과 흥미로운 대화.'},
      '/index':{title:'목차 — 살아가는 아카이브',description:'Hanyee Jang의 컬렉션과 공개된 작업을 둘러보는 목차.'},
      '/cv':{title:'이력 — Hanyee Jang',description:'Hanyee Jang의 학력과 경험.'},
    }
    const meta = (language === 'ko' ? koreanMeta[plainPath] : pageMeta[plainPath]) || (item ? {title:`${item.title} — ${text('The Living Archive','살아가는 아카이브')}`,description:'description' in item ? item.description : 'excerpt' in item ? item.excerpt : item.title} : {title:text('Not found — The Living Archive','페이지를 찾을 수 없어요 — 살아가는 아카이브'),description:text('Find your way back through the archive index.','목차에서 아카이브로 돌아가는 길을 찾아보세요.')})
    document.title = meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content',meta.description)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content',meta.title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content',meta.description)
    if (previous.current !== pathname) {
      window.scrollTo({top:0,behavior:'instant'})
      document.getElementById('main-content')?.focus({preventScroll:true})
      previous.current = pathname
    }
  }, [pathname, language, text, localize])
  return null
}

function LegacyRedirect() {
  const { pathname, search } = useLocation()
  const { path } = useLanguage()
  return <Navigate replace to={`${path(pathname)}${search}`}/>
}

function SiteRoutes() {
  const { locale } = useParams()
  const { text } = useLanguage()
  if (!isLanguage(locale)) return <LegacyRedirect/>
  return <Routes>
    <Route index element={<HomePage/>}/><Route path="about" element={<AboutPage/>}/><Route path="projects" element={<ProjectsPage/>}/><Route path="projects/:id" element={<ProjectDetailPage/>}/><Route path="art" element={<ArtPage/>}/><Route path="art/:id" element={<ArtworkDetailPage/>}/><Route path="writing" element={<WritingPage/>}/><Route path="writing/:id" element={<ArticleDetailPage/>}/><Route path="journal" element={<JournalPage/>}/><Route path="journal/:id" element={<JournalDetailPage/>}/><Route path="contact" element={<ContactPage/>}/><Route path="cv" element={<CvPage/>}/><Route path="index" element={<IndexPage/>}/><Route path="*" element={<div className="page-shell not-found"><SectionHeader eyebrow={text('OUTSIDE THE COLLECTION','컬렉션 바깥에서')} title={text('A little lost?','길을 잃었나요?')} description={text('This page hasn’t found its place in the archive. The index will help you find your way.','이 페이지는 아직 아카이브에서 자리를 찾지 못했어요. 목차에서 길을 찾아보세요.')}/><Link className="button button-dark" to="/index">{text('Back to the index ↗','목차로 돌아가기 ↗')}</Link></div>}/>
  </Routes>
}

export function App() {
  const { pathname } = useLocation()
  const { text } = useLanguage()
  return <><a href="#main-content" className="skip-link" onClick={e=>{e.preventDefault();document.getElementById('main-content')?.focus()}}>{text('Skip to content','본문으로 건너뛰기')}</a><Navigation/><RouteEffects/><main id="main-content" tabIndex={-1}><motion.div key={pathname} initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.24}}><Suspense fallback={<div className="page-shell route-loading" role="status">{text('Opening the archive…','아카이브를 여는 중…')}</div>}><Routes><Route path="/:locale/*" element={<SiteRoutes/>}/><Route path="*" element={<LegacyRedirect/>}/></Routes></Suspense></motion.div></main><Footer/></>
}
