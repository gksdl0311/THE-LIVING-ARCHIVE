import { ArrowUpRight } from 'lucide-react'
import { SectionHeader, ArchiveLabel } from '../components/ui'
import { projects, artworks, articles, journalEntries } from '../content/archive'
import type { Article, Localizable } from '../content/archive'
import { SurpriseMeButton } from '../components/SurpriseMeButton'
import { LocaleLink as Link, useLanguage } from '../i18n'
import './index.css'

function publicationSource(article: Article) {
  if (article.platform === 'Naver Blog' || article.id.startsWith('naver-')) return 'naver'
  if (article.platform === 'Substack' || article.id.startsWith('substack-')) return 'substack'
  return undefined
}

export function IndexPage() {
  const { language, text, localize } = useLanguage()
  const publishedProjects = projects.filter(project => project.status === 'published')
  const preparedProjects = projects.length - publishedProjects.length
  const readableArticles = articles.filter(article => article.body?.length || article.externalUrl)
  const naverCount = readableArticles.filter(article => publicationSource(article) === 'naver').length
  const substackCount = readableArticles.filter(article => publicationSource(article) === 'substack').length
  const otherArticles = readableArticles.filter(article => !publicationSource(article)).slice(0, 12)
  const readableJournal = journalEntries.filter(entry => entry.body.length)
  const titleLanguage = (item: Localizable) => item.translations?.[language]?.title ? language : item.language || 'en'
  const collections = [
    { title: text('About', '소개'), description: text('The person behind the collection', '이 아카이브를 만든 사람'), to: '/about' },
    { title: text('Projects', '프로젝트'), description: text(`${publishedProjects.length} published · ${preparedProjects} in preparation`, `공개된 프로젝트 ${publishedProjects.length}개 · 준비 중 ${preparedProjects}개`), to: '/projects' },
    { title: text('Art', '작품'), description: artworks.length ? text(`${artworks.length} original ${artworks.length === 1 ? 'work' : 'works'}`, `작품 ${artworks.length}점`) : text('Original works coming soon', '작품을 준비하고 있어요'), to: '/art' },
    { title: text('Writing', '글'), description: readableArticles.length ? text(`${readableArticles.length} ${readableArticles.length === 1 ? 'piece' : 'pieces'}`, `글 ${readableArticles.length}편`) : text('The first pieces are still to come', '첫 번째 글을 기다리고 있어요'), to: '/writing' },
    { title: text('Journal', '기록'), description: readableJournal.length ? text(`${readableJournal.length} ${readableJournal.length === 1 ? 'entry' : 'entries'}`, `기록 ${readableJournal.length}편`) : text('Notes and curiosities to come', '일상의 기록을 준비하고 있어요'), to: '/journal' },
    { title: text('Contact', '연락'), description: text('Connections & conversations', '연결과 대화의 시작'), to: '/contact' },
  ]
  const writingCollections = [
    { source: 'naver', filterValue: 'Naver Blog', title: text('Naver Blog', '네이버 블로그'), titleLang: language, count: naverCount, description: text('Life, travels and thoughts · English titles, Korean originals', '일상과 여행, 생각의 기록 · 한국어 원문') },
    { source: 'substack', filterValue: 'Substack', title: 'The Business Behind It', titleLang: 'en', count: substackCount, description: text('Business stories on Substack · English originals', '서브스택에 쓴 비즈니스 이야기 · 영어 원문') },
  ]
  return <div className="page-shell index-page">
    <SectionHeader
      eyebrow={text('A CLEAR WAY THROUGH', '아카이브를 둘러보는 길')}
      title={text('The index.', '전체 목록.')}
      description={text('Everything has a place. Find your way through the collections, or leave it to curiosity.', '모든 것에는 자리가 있어요. 컬렉션을 따라 둘러보거나, 호기심이 이끄는 대로 찾아보세요.')}
    ><SurpriseMeButton/></SectionHeader>
    <nav className="index-directory" aria-label={text('Collection directory', '컬렉션 목록')}>
      {collections.map((collection, index) => <Link to={collection.to} key={collection.to}>
        <span className="mono" aria-hidden="true">0{index + 1}</span>
        <h2>{collection.title}</h2><p>{collection.description}</p><ArrowUpRight size={25} aria-hidden="true"/>
      </Link>)}
    </nav>
    <section className="index-published" aria-label={text('Published archive items', '공개된 아카이브 콘텐츠')}>
      <ArchiveLabel>{text('PUBLISHED ITEMS', '공개된 콘텐츠')}</ArchiveLabel>
      {publishedProjects.map(project => <Link to={`/projects/${project.id}`} key={project.id}>
        <span className="mono" aria-hidden="true">{project.number}</span><span lang={titleLanguage(project)}>{localize(project).title}</span><ArrowUpRight size={17} aria-hidden="true"/>
      </Link>)}
      {artworks.map(artwork => <Link to={`/art/${artwork.id}`} key={artwork.id}>
        <span className="mono" aria-hidden="true">{artwork.number}</span><span lang={titleLanguage(artwork)}>{localize(artwork).title}</span><ArrowUpRight size={17} aria-hidden="true"/>
      </Link>)}
      {writingCollections.filter(collection => collection.count > 0).map(collection => <Link to={`/writing?source=${encodeURIComponent(collection.filterValue)}`} key={collection.source} className="index-source-collection">
        <span className="mono index-source-label" lang="en" aria-hidden="true">{collection.source === 'naver' ? 'NAVER' : 'SUBSTACK'}</span>
        <span className="index-source-copy"><strong lang={collection.titleLang}>{collection.title}</strong><span>{collection.description}</span><span className="mono index-source-count">{text(`${collection.count} ${collection.count === 1 ? 'published post' : 'published posts'}`, `공개된 글 ${collection.count}편`)}</span></span>
        <ArrowUpRight size={23} aria-hidden="true"/>
      </Link>)}
      {otherArticles.map(article => <Link to={`/writing/${article.id}`} key={article.id}>
        <span className="mono" aria-hidden="true">{article.number}</span><span lang={article.originalLanguage || article.language || 'en'}>{article.title}</span><ArrowUpRight size={17} aria-hidden="true"/>
      </Link>)}
      {readableJournal.map(entry => <Link to={`/journal/${entry.id}`} key={entry.id}>
        <span className="mono" aria-hidden="true">{text('JOURNAL', '기록')}</span><span lang={titleLanguage(entry)}>{localize(entry).title}</span><ArrowUpRight size={17} aria-hidden="true"/>
      </Link>)}
    </section>
  </div>
}
