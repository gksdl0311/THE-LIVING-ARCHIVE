import { motion } from 'motion/react'
import { ArrowDown, ArrowUpRight, MoveUpRight, CornerDownRight, MoveDownRight } from 'lucide-react'
import { projects, artworks, articles, currently, site } from '../content/archive'
import { ArchiveLabel, ProjectVisual, TextLink } from '../components/ui'
import { ArchiveMark } from '../components/ArchiveMark'
import { SurpriseMeButton } from '../components/SurpriseMeButton'
import { LocaleLink as Link, useLanguage } from '../i18n'
import { assetUrl } from '../lib/utils'
import './home.css'

function DiscoveryCollection() {
  const { language, text } = useLanguage()
  const project = projects.find(p => p.status === 'published')
  const hasWriting = articles.some(article => article.body?.length || article.externalUrl)
  return <div className="discovery-collage" aria-label={text('Explore the collections', '컬렉션 둘러보기')}>
    <div className="collage-ring" aria-hidden="true" />
    <span className="collage-note">{text('Take a look around', '천천히 둘러보세요')} <MoveDownRight size={18} aria-hidden="true" /></span>
    <motion.div className="collage-card art-object" whileHover={{ y: -8, rotate: 2 }} transition={{ duration: 0.25 }}>
      <Link to="/art" aria-label={artworks.length ? text('Explore Art — paintings and visual stories', '미술 둘러보기 — 그림과 시각적 이야기') : text('Explore Art — original paintings coming soon', '미술 둘러보기 — 실제 작품이 곧 추가됩니다')}>
        <span className="collage-card-label mono">{text('02 / THE GALLERY', '02 / 갤러리')} <ArrowUpRight size={14} aria-hidden="true" /></span>
        <div className="art-object-frame"><span className="frame-corner frame-corner-tl" /><span className="frame-corner frame-corner-br" /><span className="art-object-type">{text('A space', '그림을')}<br />{text('for ', '위한 ')}<i>{text('art.', '공간.')}</i></span><span className="frame-caption mono">{text('ORIGINAL WORKS', '직접 그린 작품')}<br />{text('COMING SOON', '곧 만나보세요')}</span></div>
        <span className="art-object-foot mono">{text('MINHWA & OTHER EXPLORATIONS', '민화, 그리고 다른 탐색들')}</span>
      </Link>
    </motion.div>
    {project && <motion.div className="collage-card work-object" whileHover={{ y: -8, rotate: -4 }} transition={{ duration: 0.25 }}>
      <Link to={`/projects/${project.id}`} aria-label={text('Discover the Rena Seulgi Jang website project', 'Rena Seulgi Jang 웹사이트 프로젝트 살펴보기')}>
        <span className="mono collage-card-label">{text('01 / SELECTED WORK', '01 / 고른 작업')} <ArrowUpRight size={14} aria-hidden="true" /></span>
        <span className="work-object-title" lang="en">Rena<br /><i>Seulgi Jang</i></span><span className="work-object-bottom mono">{text('A MULTILINGUAL DIGITAL HOME', '여러 언어로 만나는 디지털 공간')}</span><span className="paper-fold" aria-hidden="true" />
      </Link>
    </motion.div>}
    <motion.div className="collage-card writing-object" whileHover={{ y: -7, rotate: 3 }} transition={{ duration: 0.25 }}>
      <Link to="/writing" aria-label={hasWriting ? text('Explore Writing — essays, observations and ideas', '글 둘러보기 — 에세이, 관찰과 생각') : text('Explore Writing — essays and notes to come', '글 둘러보기 — 에세이와 기록이 곧 추가됩니다')}>
        <span className="mono">{text('03 / WORDS', '03 / 글')}</span><span className="writing-object-title">{language === 'ko' ? <>기록과<br /><i>생각들.</i></> : <>Notes<br />& <i>notions.</i></>}</span><span className="writing-object-rule" /><ArrowUpRight size={21} aria-hidden="true" />
      </Link>
    </motion.div>
    <span className="collage-footnote mono">{text('FIG. 01 — A FEW WAYS IN', '도판 01 — 아카이브로 들어가는 길')}</span>
    <div className="archive-stamp" aria-hidden="true"><span>{text('PERSONAL ARCHIVE', '개인 아카이브')}</span><strong>{text('ALWAYS', '언제나')}<br />{text('IN PROGRESS', '계속되는 기록')}</strong><span>{text('NO FINISH LINE', '끝을 정하지 않고')}</span></div>
  </div>
}

export function HomePage() {
  const { language, text, localize, category } = useLanguage()
  const selectedProjects = projects.filter(project => project.featured && project.status === 'published').map(localize)
  const originalArtwork = artworks.find(artwork => artwork.featured) || artworks[0]
  const featuredArtwork = originalArtwork ? localize(originalArtwork) : undefined
  // Translate display titles while keeping the authored preview in its original language.
  const featuredArticle = articles.find(article => article.featured && (article.body?.length || article.externalUrl))
    || articles.find(article => article.platform?.toLowerCase().includes('substack'))
    || articles[0]
  const articleLanguage = featuredArticle?.originalLanguage || featuredArticle?.language || 'en'
  const featuredTitle = featuredArticle ? localize(featuredArticle).title : undefined
  const titleLanguage = featuredArticle?.translations?.[language]?.title ? language : articleLanguage
  const collectionLinks = [
    { title: text('Projects', '프로젝트'), sub: text('Things made & considered', '만들고 생각한 것들'), to: '/projects', number: '01' },
    { title: text('Art', '미술'), sub: text('Paintings & visual stories', '그림과 시각적 이야기'), to: '/art', number: '02' },
    { title: text('Writing', '글'), sub: text('Thoughts finding their form', '형태를 찾아가는 생각'), to: '/writing', number: '03' },
    { title: text('Journal', '일지'), sub: text('Life & its little curiosities', '일상과 작은 호기심들'), to: '/journal', number: '04' },
  ]

  return <div className={`home-page${language === 'ko' ? ' home-page-ko' : ''}`} lang={language}>
    <section className="home-hero page-shell" aria-labelledby="home-title">
      <div className="hero-topline mono"><span>{text('THE PERSONAL ARCHIVE OF HANYEE JANG', 'Hanyee Jang의 개인 아카이브')}</span><span className="hero-open"><span className="status-dot" />{text('OPEN TO CURIOSITY', '호기심을 환영합니다')}</span></div>
      <div className="hero-composition">
        <motion.div className="hero-copy" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="hero-pretitle">{text('A collection of', '한데 모은')}</p>
          <h1 id="home-title">{language === 'ko' ? <>모든 것과<br /><i>사소한 것들.</i></> : <>everything<br /><span className="hero-ampersand">&</span> <i>nothing.</i></>}</h1>
          <div className="hero-description"><CornerDownRight className="hero-description-mark" size={24} aria-hidden="true" /><p>{text('Art, ideas, work, words', '예술, 생각, 작업, 글과')}<br />{text('and other curiosities.', '그 밖의 호기심들.')}<span className="hero-fineprint">{text('An evolving archive. A little of everything', '계속 자라나는 아카이브. 한 사람을 이루는')}<br className="desktop-break" />{text(' that makes a person.', ' 여러 조각을 조금씩 모읍니다.')}</span></p></div>
          <div className="hero-buttons"><a href="#collections" className="button button-dark" onClick={event => { event.preventDefault(); document.getElementById('collections')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); document.getElementById('collections')?.focus({ preventScroll: true }) }}>{text('Explore the archive', '아카이브 둘러보기')} <ArrowDown size={15} aria-hidden="true" /></a><SurpriseMeButton /></div>
        </motion.div>
        <DiscoveryCollection />
      </div>
      <div className="hero-bottomline"><span className="mono">{text('A DIGITAL HOME, NOT A FINISHED EXHIBITION.', '완성보다, 계속 자라나는 디지털 공간.')}</span><Link to="/about">{text('Meet the person behind it', '아카이브를 만든 사람')} <MoveUpRight size={14} aria-hidden="true" /></Link></div>
    </section>

    <section id="collections" tabIndex={-1} className="collection-entry page-shell" aria-labelledby="collections-title">
      <div className="section-minihead"><ArchiveLabel>{text('THE COLLECTIONS', '컬렉션')}</ArchiveLabel><Link to="/index" className="text-link mono">{text('View the index', '목록 보기')} <ArrowUpRight size={15} aria-hidden="true" /></Link></div>
      <div className="collection-directory"><h2 id="collections-title" className="sr-only">{text('Explore the collections', '컬렉션 둘러보기')}</h2>{collectionLinks.map(collection => <Link key={collection.to} to={collection.to} className="collection-directory-link"><span className="mono">{collection.number} /</span><span><strong>{collection.title}</strong><small>{collection.sub}</small></span><ArrowUpRight aria-hidden="true" size={22} /></Link>)}</div>
    </section>

    <section className="home-selected page-shell" aria-labelledby="selected-title">
      <div className="home-section-title"><div><ArchiveLabel>{text('01 / FROM THE PROJECT ARCHIVE', '01 / 프로젝트 아카이브에서')}</ArchiveLabel><h2 id="selected-title">{text('A few things,', '몇 가지 작업,')}<br /><i>{text('carefully kept.', '소중히 모아 둔.')}</i></h2></div><TextLink to="/projects">{text('All projects', '모든 프로젝트')}</TextLink></div>
      {selectedProjects.length ? selectedProjects.map(project => <Link key={project.id} to={`/projects/${project.id}`} className="featured-project"><ProjectVisual project={project} /><div className="featured-project-copy"><div className="featured-project-meta"><ArchiveLabel>{project.number}</ArchiveLabel><span className="pill">{text('Published', '공개됨')}</span></div><h3>{project.title}</h3><p>{project.summary}</p><span className="mono featured-languages">{project.id === 'rena-seulgi-jang' ? text('ENGLISH · 한국어 · DEUTSCH', '영어 · 한국어 · 독일어') : category(project.category)}</span><span className="text-link">{text('Step inside the project', '프로젝트 살펴보기')} <ArrowUpRight size={18} aria-hidden="true" /></span></div></Link>) : <p>{text('The next selected project will appear here.', '다음에 고른 프로젝트가 이곳에 추가됩니다.')}</p>}
    </section>

    <section className="home-art-writing page-shell" aria-label={text('From the gallery and library', '갤러리와 서재에서')}>
      <Link to={featuredArtwork ? `/art/${featuredArtwork.id}` : '/art'} className="home-art-card">
        <div className="home-art-top"><ArchiveLabel>{text('02 / THE GALLERY', '02 / 갤러리')}</ArchiveLabel><ArrowUpRight size={22} aria-hidden="true" /></div>
        {featuredArtwork ? <><img className="home-original-art" src={assetUrl(featuredArtwork.image)} alt={featuredArtwork.title} loading="lazy" /><h2>{featuredArtwork.title}</h2><p>{featuredArtwork.medium}</p></> : <><div className="gallery-preview-frame" aria-hidden="true"><span>{text('For the things', '말로 다 담지')}<br /><i>{text('words can’t say.', '못하는 것들.')}</i></span><small className="mono">{text('ORIGINAL PAINTINGS', '직접 그린 그림들')}<br />{text('COMING SOON', '곧 만나보세요')}</small></div><h2>{text('An open wall.', '그림을 기다리는 벽.')}</h2><p>{text('Contemporary interpretations of Korean minhwa.', '한국 민화를 오늘의 시선으로 해석합니다.')}<br />{text('The first original works will find their place here.', '첫 작품들이 이곳에 자리 잡을 예정입니다.')}</p></>}
      </Link>
      <div className={`home-writing-card${featuredArticle ? ' has-article' : ''}`}><div className="home-writing-top"><ArchiveLabel>{text('03 / THE LIBRARY', '03 / 서재')}</ArchiveLabel><span className="mono">{text('WORDS, WORDS, WORDS.', '글, 그리고 또 글.')}</span></div><span className="writing-asterisk" aria-hidden="true"><ArchiveMark /></span><h2 lang={featuredArticle ? titleLanguage : language}>{featuredArticle ? featuredTitle : <>{text('Some thoughts', '어떤 생각은')}<br />{text('need a little', '조금 더 넓은')}<br /><i>{text('more room.', '공간이 필요해요.')}</i></>}</h2><p lang={featuredArticle ? articleLanguage : language}>{featuredArticle ? featuredArticle.excerpt : text('A home for essays, observations and ideas. The shelves are ready; the first pieces are still to come.', '에세이, 관찰과 생각을 위한 공간. 서가는 준비되어 있고, 첫 글들은 아직 기다리는 중입니다.')}</p><TextLink to={featuredArticle ? `/writing/${featuredArticle.id}` : '/writing'}>{featuredArticle ? text('Read the piece', '글 읽기') : text('Visit the library', '서재 둘러보기')}</TextLink></div>
    </section>

    <section className="home-current page-shell" aria-labelledby="current-title"><div className="current-heading"><ArchiveLabel>{text('IN THE MARGINS', '여백의 기록')}</ArchiveLabel><h2 id="current-title">{text('Currently', '요즘')}<br /><i>{text('on my mind.', '마음에 두는 것들.')}</i></h2><MoveUpRight className="current-pencil" size={38} aria-hidden="true" /></div><div className="current-notes">{currently.map(localize).map((note, index) => <div className="current-note" key={note.label}><span className="mono">0{index + 1}</span><div><h3>{note.label}</h3><p>{note.text}</p>{note.href && <Link to={note.href} className="text-link">{text('Take a closer look', '조금 더 살펴보기')} <ArrowUpRight size={14} aria-hidden="true" /></Link>}</div></div>)}</div></section>
    <section className="random-discovery page-shell"><div><span className="mono">{text('NO PARTICULAR DESTINATION?', '어디부터 볼지 모르겠다면?')}</span><h2>{text('Let curiosity ', '호기심을 따라 ')}<i>{text('choose.', '가볼까요.')}</i></h2><p>{text('One click. One published piece from the collection.', '한 번의 클릭으로, 컬렉션에 공개된 작업 하나를 만나보세요.')}</p></div><SurpriseMeButton className="surprise-large" /><span className="random-flower" aria-hidden="true"><ArchiveMark /></span></section>
    <span className="sr-only">{text(site.tagline, '내가 만들고, 생각하고, 좋아한 것들을 계속 모아가는 기록.')}</span>
  </div>
}
