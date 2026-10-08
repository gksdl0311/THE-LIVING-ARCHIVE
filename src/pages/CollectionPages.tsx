import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Plus, Search, X } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { LocaleLink as Link, useLanguage } from '../i18n';
import { SectionHeader, ArchiveLabel, ProjectVisual } from '../components/ui';
import { projects, artworks, articles, exhibitions, projectCategories, articleCategories, site } from '../content/archive';
import { assetUrl } from '../lib/utils';
import './collections.css';

type Project = (typeof projects)[number];
type Article = (typeof articles)[number];
type Text = (en: string, ko: string) => string;
const writingPageSize = 16;

function statusLabel(status: Project['status'], text: Text) {
  return status === 'published' ? text('Published', '공개된 작업') : status === 'in-progress' ? text('In progress', '진행 중') : text('Planned collection', '준비 중인 컬렉션');
}

function CollectionFilters({ categories, selected, onSelect, label }: { categories: string[]; selected: string; onSelect: (value: string) => void; label: string }) {
  const { category } = useLanguage();
  return <div className="collection-filters" role="group" aria-label={label}>{['All', ...categories.filter((value) => value !== 'All')].map((value) => <button key={value} type="button" className={`collection-filter ${selected === value ? 'collection-filter-active' : ''}`} aria-pressed={selected === value} onClick={() => onSelect(value)}>{category(value)}</button>)}</div>;
}

function CollectionNotFound({ collection, href }: { collection: 'Projects' | 'Art' | 'Writing'; href: string }) {
  const { text } = useLanguage();
  const name = text(collection.toLowerCase(), collection === 'Projects' ? '프로젝트' : collection === 'Art' ? '그림' : '글');
  return <div className="page-shell collection-not-found"><ArchiveLabel>{text('Uncatalogued / 404', '아직 기록되지 않은 페이지 / 404')}</ArchiveLabel><h1 className="serif">{text('This page has left the shelf.', '아직 이곳에 기록된 페이지가 없어요.')}</h1><p>{text(`There isn’t an entry at this address. The rest of the ${name} collection is waiting for you.`, `이 주소에는 아직 기록이 없어요. 다른 ${name}들을 둘러보세요.`)}</p><Link className="text-link" to={href}><ArrowLeft size={16} aria-hidden="true" />{text(`Back to ${name}`, `${name} 목록으로`)}</Link></div>;
}

function ExternalLink({ href, children, className = 'text-link' }: { href: string; children: ReactNode; className?: string }) {
  const { text, language } = useLanguage();
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only" lang={language}>{text(' (opens in a new tab)', ' (새 탭에서 열립니다)')}</span></a>;
}

export function ProjectsPage() {
  const [selectedCategory, setCategory] = useState('All');
  const { text, localize, category } = useLanguage();
  const reducedMotion = useReducedMotion();
  const filtered = projects.filter((project) => selectedCategory === 'All' || project.category === selectedCategory).map(localize);
  return <div className="page-shell collection-projects">
    <SectionHeader eyebrow={text('Collection 01 / The works', '컬렉션 01 / 작업들')} title={text('Made. Making. Imagining.', '만들고, 그리고, 상상하고.')} description={text('Websites, communications, research and independent ideas. A collection of finished things and things still finding their shape.', '웹사이트, 커뮤니케이션, 리서치, 그리고 독립적인 아이디어들. 완성된 작업과 아직 모양을 찾아가는 것들을 함께 모았습니다.')} />
    <div className="collection-toolbar"><CollectionFilters categories={projectCategories} selected={selectedCategory} onSelect={setCategory} label={text('Filter projects by category', '카테고리별 프로젝트 보기')} /><span className="mono collection-count" aria-live="polite">{text(`${String(filtered.length).padStart(2, '0')} ${filtered.length === 1 ? 'entry' : 'entries'}`, `${String(filtered.length).padStart(2, '0')}개의 기록`)}</span></div>
    <div className="collection-project-list">{filtered.map((project, index) => <motion.article key={project.id} className={`collection-project-row collection-project-${project.status}`} initial={reducedMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.035 }}>
      <div className="collection-project-number mono">{project.number}</div><Link to={`/projects/${project.id}`} className="collection-project-visual" aria-label={text(`View ${project.title}`, `${project.title} 보기`)}><ProjectVisual project={project} /></Link>
      <div className="collection-project-copy"><div className="collection-project-topline"><span className="mono collection-category">{category(project.category)}</span><span className={`collection-status collection-status-${project.status}`}><span />{statusLabel(project.status, text)}</span></div><h2 className="serif"><Link to={`/projects/${project.id}`}>{project.title}</Link></h2><p>{project.summary}</p><div className="collection-project-bottomline"><span className="mono">{project.year || text('Date to be added', '날짜 기록 예정')}</span><Link className="text-link" to={`/projects/${project.id}`}>{project.status === 'published' ? text('Open the case study', '작업 이야기 읽기') : text('View collection notes', '컬렉션 노트 보기')}<ArrowRight size={17} aria-hidden="true" /></Link></div></div>
    </motion.article>)}{filtered.length === 0 && <div className="collection-filter-empty"><p className="serif">{text('A little space for what comes next.', '다음 작업을 위한 작은 자리.')}</p><p>{text('No projects are catalogued in this category yet.', '이 카테고리에는 아직 기록된 프로젝트가 없어요.')}</p><button className="text-link" onClick={() => setCategory('All')} type="button">{text('View all projects', '모든 프로젝트 보기')}<ArrowRight size={16} aria-hidden="true" /></button></div>}</div>
    <div className="collection-footnote mono"><Plus size={14} aria-hidden="true" />{text('This archive grows with the work. Planned collections are labelled as such.', '이 아카이브는 작업과 함께 자랍니다. 준비 중인 컬렉션은 별도로 표시되어 있어요.')}</div>
  </div>;
}

export function ProjectDetailPage() {
  const { id } = useParams();
  const { text, localize, category, language } = useLanguage();
  const original = projects.find((entry) => entry.id === id);
  if (!original) return <CollectionNotFound collection="Projects" href="/projects" />;
  const project = localize(original);
  const related = projects.filter((entry) => entry.id !== project.id).slice(0, 2).map(localize);
  return <div className="page-shell detail-project" lang={original.translations?.[language] ? language : project.language || 'en'}>
    <Link className="text-link detail-back" to="/projects"><ArrowLeft size={16} aria-hidden="true" />{text('All projects', '모든 프로젝트')}</Link>
    <div className="detail-project-heading"><ArchiveLabel>{project.number} / {category(project.category)}</ArchiveLabel><h1 className="serif">{project.title}</h1><p className="detail-deck">{project.summary}</p></div>
    <div className="detail-project-cover"><ProjectVisual project={project} /></div>{!project.thumbnail && <p className="mono detail-cover-caption">{text('Archive cover / original project screenshots will be added as the work is documented.', '아카이브 표지 / 작업을 기록하면서 실제 프로젝트 화면을 추가할 예정입니다.')}</p>}
    <div className="detail-project-grid"><aside className="detail-metadata" aria-label={text('Project details', '프로젝트 정보')}><dl><div><dt>{text('Status', '상태')}</dt><dd><span className={`collection-status collection-status-${project.status}`}><span />{statusLabel(project.status, text)}</span></dd></div><div><dt>{text('Year', '연도')}</dt><dd>{project.year || text('To be documented', '기록 예정')}</dd></div><div><dt>{text('Collection', '컬렉션')}</dt><dd>{category(project.category)}</dd></div>{project.role && <div><dt>{text('Role', '역할')}</dt><dd>{project.role}</dd></div>}{project.tools && project.tools.length > 0 && <div><dt>{text('Tools', '사용 도구')}</dt><dd>{project.tools.join(', ')}</dd></div>}</dl>{project.externalUrl && <ExternalLink href={project.externalUrl}>{text('Visit the live project', '실제 웹사이트 방문하기')}</ExternalLink>}</aside>
      <div className="detail-project-body"><section><span className="mono detail-section-label">{text('01 / Overview', '01 / 개요')}</span><h2 className="serif">{text('The idea behind the work.', '작업을 시작하게 한 생각.')}</h2><p>{project.description}</p></section>{project.sections.map((section, index) => <section key={`${section.title}-${index}`}><span className="mono detail-section-label">{String(index + 2).padStart(2, '0')} / {text('Project notes', '작업 노트')}</span><h2 className="serif">{section.title}</h2><p>{section.body}</p></section>)}
      {project.gallery && project.gallery.length > 0 && <section className="detail-project-gallery"><span className="mono detail-section-label">{text('A closer look / Project gallery', '자세히 보기 / 프로젝트 갤러리')}</span><h2 className="serif">{text('Details from the work.', '작업의 작은 디테일들.')}</h2>{project.gallery.map((image, index) => <figure key={`${image.image}-${index}`}><img src={assetUrl(image.image)} alt={image.alt} loading="lazy" /><figcaption>{image.caption}</figcaption></figure>)}</section>}
      {project.status !== 'published' && <div className="detail-documentation-note"><span className="mono">{text('A collection in the making', '만들어가는 컬렉션')}</span><p>{text('Process notes, visuals and verified outcomes will be added as this work is documented.', '작업을 기록하면서 과정 노트, 이미지, 확인된 결과를 추가할 예정입니다.')}</p></div>}</div>
    </div>{related.length > 0 && <nav className="detail-related" aria-label={text('More projects', '다른 프로젝트')}><span className="mono">{text('Continue through the archive', '아카이브 계속 둘러보기')}</span>{related.map((entry) => <Link key={entry.id} to={`/projects/${entry.id}`}><span className="mono">{entry.number}</span><span className="serif">{entry.title}</span><ArrowUpRight size={21} aria-hidden="true" /></Link>)}</nav>}
  </div>;
}

export function ArtPage() {
  const [selectedCategory, setCategory] = useState('All');
  const { text, localize } = useLanguage();
  const categories = useMemo(() => [...new Set(artworks.map((artwork) => artwork.category))], []);
  const filtered = artworks.filter((artwork) => selectedCategory === 'All' || artwork.category === selectedCategory).map(localize);
  const artAccount = site.links.find((link) => link.url.includes('instagram.com/paintwithhanyee'));
  return <div className="page-shell collection-art"><SectionHeader eyebrow={text('Collection 02 / The gallery', '컬렉션 02 / 갤러리')} title={text('A different kind of language.', '말 대신, 색으로.')} description={text('Paintings, sketches and contemporary interpretations of Korean minhwa. A space for the things that are better said in colour.', '그림과 스케치, 그리고 한국 민화를 오늘의 감각으로 해석하는 작업. 말보다 색으로 더 잘 전할 수 있는 것들을 위한 공간입니다.')} />
    <div className="collection-art-intro"><span className="mono">{text('Painting & visual stories', '그림과 시각적인 이야기')}</span>{artAccount && artworks.length > 0 && <ExternalLink href={artAccount.url}>@paintwithhanyee</ExternalLink>}<span className="collection-art-annotation serif">{text('Look a little longer.', '조금 더 오래 바라보기.')}</span><ArrowDown size={20} aria-hidden="true" /></div>
    {artworks.length > 0 ? <>{categories.length > 1 && <CollectionFilters categories={categories} selected={selectedCategory} onSelect={setCategory} label={text('Filter artworks by collection', '컬렉션별 작품 보기')} />}<div className="collection-art-grid">{filtered.map((artwork, index) => <article key={artwork.id} className={`collection-artwork collection-artwork-${index % 3}`}><Link to={`/art/${artwork.id}`} className="collection-art-image" aria-label={text(`View ${artwork.title}`, `${artwork.title} 보기`)}><img src={assetUrl(artwork.image)} alt={artwork.title} loading="lazy" /></Link><div className="collection-art-caption"><span className="mono">{artwork.number}</span><div><h2 className="serif"><Link to={`/art/${artwork.id}`}>{artwork.title}</Link></h2><p>{[artwork.year, artwork.medium].filter(Boolean).join(' · ')}</p></div><Link to={`/art/${artwork.id}`} aria-label={text(`View details for ${artwork.title}`, `${artwork.title} 자세히 보기`)}><ArrowUpRight size={20} aria-hidden="true" /></Link></div></article>)}</div></> : <section className="collection-gallery-empty" aria-labelledby="gallery-empty-heading"><div className="collection-gallery-wall" aria-hidden="true"><div className="collection-frame"><span className="mono">{text('Reserved for an original', '실제 작품을 위한 자리')}</span><Plus strokeWidth={1} size={35} /><span className="serif">{text('In time.', '천천히, 곧.')}</span></div><span className="mono collection-gallery-wall-note">{text('Gallery installation / ongoing', '갤러리 준비 / 진행 중')}</span></div><div className="collection-gallery-note"><ArchiveLabel>{text('An exhibition in the making', '준비 중인 갤러리')}</ArchiveLabel><h2 className="serif" id="gallery-empty-heading">{text('Good things take their time.', '좋은 것들은 제 시간이 필요해요.')}</h2><p>{text('The gallery is ready for its first original works. Paintings, their stories and a closer look at the process will be collected here.', '첫 작품을 맞이할 공간을 마련했어요. 그림과 그 안의 이야기, 만들어가는 과정을 이곳에 모을 예정입니다.')}</p><p className="collection-honest-note">{text('No artwork has been added to the archive yet.', '아직 아카이브에 등록된 작품은 없어요.')}</p>{artAccount && <ExternalLink href={artAccount.url}>{text('Follow @paintwithhanyee', '@paintwithhanyee 둘러보기')}</ExternalLink>}</div></section>}
    <div className="collection-artist-note"><span className="mono">{site.artistStatement ? text('Artist statement', '작가 노트') : text('The practice', '작업에 대하여')}</span><h2 className="serif">{text('Rooted in tradition.', '전통에 뿌리를 두고.')}<br /><em>{text('Open to interpretation.', '새로운 해석을 향해.')}</em></h2><div><p>{site.artistStatement || text('This collection focuses on paintings and contemporary interpretations of Korean minhwa. An artist statement, sketches and process documentation can grow alongside the works.', '한국 민화를 현대적으로 해석하는 그림 작업을 중심으로 모아가는 컬렉션입니다. 작품과 함께 작가 노트, 스케치, 과정 기록도 더해갈 수 있어요.')}</p><Link className="text-link" to="/about">{text('Meet the person behind the work', '작업 뒤의 사람 만나기')}<ArrowRight size={17} aria-hidden="true" /></Link></div></div>
    {exhibitions.length > 0 && <section className="collection-exhibitions"><span className="mono">{text('Exhibition history', '전시 기록')}</span>{exhibitions.map((exhibition) => <div key={`${exhibition.title}-${exhibition.year}`}><span className="mono">{exhibition.year}</span><h3 className="serif">{exhibition.title}</h3><p>{exhibition.venue}</p></div>)}</section>}
  </div>;
}

export function ArtworkDetailPage() {
  const { id } = useParams();
  const { text, localize, category, language } = useLanguage();
  const original = artworks.find((entry) => entry.id === id);
  if (!original) return <CollectionNotFound collection="Art" href="/art" />;
  const artwork = localize(original);
  return <div className="page-shell detail-artwork" lang={original.translations?.[language] ? language : artwork.language || 'en'}><Link className="text-link detail-back" to="/art"><ArrowLeft size={16} aria-hidden="true" />{text('Back to the gallery', '갤러리로 돌아가기')}</Link><div className="detail-artwork-grid"><figure><img src={assetUrl(artwork.image)} alt={artwork.title} /><figcaption className="mono">{artwork.number} / {artwork.title}</figcaption></figure><div className="detail-artwork-copy"><ArchiveLabel>{artwork.number} / {category(artwork.category)}</ArchiveLabel><h1 className="serif">{artwork.title}</h1><dl className="detail-artwork-metadata">{artwork.year && <div><dt>{text('Year', '연도')}</dt><dd>{artwork.year}</dd></div>}{artwork.medium && <div><dt>{text('Medium', '재료')}</dt><dd>{artwork.medium}</dd></div>}{artwork.dimensions && <div><dt>{text('Dimensions', '크기')}</dt><dd>{artwork.dimensions}</dd></div>}</dl><p>{artwork.description}</p><Link className="text-link" to="/art">{text('Continue looking', '다른 작품 둘러보기')}<ArrowRight size={17} aria-hidden="true" /></Link></div></div>{artwork.process && artwork.process.length > 0 && <section className="detail-artwork-process"><ArchiveLabel>{text('From the studio / Process notes', '작업실에서 / 과정 기록')}</ArchiveLabel><h2 className="serif">{text('Along the way.', '만들어가는 동안.')}</h2><div className="detail-artwork-process-grid">{artwork.process.map((image, index) => <figure key={`${image.image}-${index}`}><img src={assetUrl(image.image)} alt={image.alt} loading="lazy" /><figcaption>{image.caption}</figcaption></figure>)}</div></section>}</div>;
}

function readableDate(value: string, language: 'en' | 'ko') {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date);
}

function readingTime(article: Article, text: Text) {
  if (!article.body?.length) return null;
  const body = article.body.join(' ');
  const koreanCharacters = (body.match(/[가-힣]/g) || []).length;
  const words = body.replace(/[가-힣]/g, '').split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220 + koreanCharacters / 500));
  return text(`${minutes} min read`, `읽는 데 약 ${minutes}분`);
}

function publication(article: Article) {
  if (article.platform?.toLowerCase().includes('naver')) return 'Naver Blog';
  if (article.platform?.toLowerCase().includes('substack')) return 'Substack';
  return article.platform || 'The Living Archive';
}

function sourceLabel(source: string, text: Text) {
  return source === 'All' ? text('All sources', '전체 출처') : source === 'Naver Blog' ? text('Naver Blog', '네이버 블로그') : source === 'The Living Archive' ? text('The Living Archive', '리빙 아카이브') : source;
}

function articleLanguage(article: Article, language: 'en' | 'ko') {
  return article.originalLanguage || (article.translations?.[language] ? language : article.language || 'en');
}

function languageLabel(article: Article, text: Text) {
  const language = article.originalLanguage || article.language;
  return language === 'ko' ? text('Korean original', '한국어 원문') : language === 'en' ? text('English original', '영어 원문') : null;
}

/** Titles, excerpts and full text from external publications retain their source language. */
function localizedArticle(article: Article, localize: (item: Article) => Article) {
  const localized = localize(article);
  return article.originalLanguage && article.externalUrl ? { ...localized, title: article.title, excerpt: article.excerpt, body: article.body } : localized;
}

function paginationPages(current: number, total: number): Array<number | 'ellipsis'> {
  const pages = total <= 7 ? Array.from({ length: total }, (_, index) => index + 1) : [...new Set([1, current - 1, current, current + 1, total])].filter((page) => page > 0 && page <= total).sort((a, b) => a - b);
  const result: Array<number | 'ellipsis'> = [];
  pages.forEach((page, index) => { if (index > 0 && page - pages[index - 1] > 1) result.push('ellipsis'); result.push(page); });
  return result;
}

export function WritingPage() {
  const { text, language, localize, category } = useLanguage();
  const [params, setParams] = useSearchParams();
  const sources = useMemo(() => [...new Set(['Substack', 'Naver Blog', ...articles.map(publication)])], []);
  const categories = useMemo(() => [...new Set([...articleCategories, ...articles.map((article) => article.category)])], []);
  const selectedSource = params.get('source') || 'All';
  const selectedCategory = params.get('category') || 'All';
  const query = params.get('q') || '';
  const normalizedQuery = query.trim().normalize('NFKC').toLocaleLowerCase();
  const results = useMemo(() => articles.filter((article) => {
    if (selectedSource !== 'All' && publication(article) !== selectedSource) return false;
    if (selectedCategory !== 'All' && article.category !== selectedCategory) return false;
    const searchable = [article.title, article.excerpt, ...(article.tags || []), ...Object.values(article.translations || {}).flatMap((translation) => [translation.title || '', translation.excerpt || ''])].join(' ').normalize('NFKC').toLocaleLowerCase();
    return !normalizedQuery || searchable.includes(normalizedQuery);
  }).sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0)), [selectedSource, selectedCategory, normalizedQuery]);
  const pageCount = Math.max(1, Math.ceil(results.length / writingPageSize));
  const requestedPage = Number(params.get('page'));
  const page = Math.min(pageCount, Math.max(1, Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1));
  const start = (page - 1) * writingPageSize;
  const visible = results.slice(start, start + writingPageSize);
  const hasFilters = selectedSource !== 'All' || selectedCategory !== 'All' || !!query;
  function updateFilter(key: 'source' | 'category' | 'q', value: string) {
    setParams((previous) => { const next = new URLSearchParams(previous); if (value && value !== 'All') next.set(key, value); else next.delete(key); next.delete('page'); return next; }, { replace: key === 'q' });
  }
  function goToPage(value: number) {
    setParams((previous) => { const next = new URLSearchParams(previous); if (value > 1) next.set('page', String(value)); else next.delete('page'); return next; });
    document.getElementById('writing-results')?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
  const resultLabel = results.length === 0 ? text('No pieces found', '찾은 글이 없어요') : text(`${results.length} ${results.length === 1 ? 'piece' : 'pieces'} · showing ${start + 1}–${Math.min(start + writingPageSize, results.length)}`, `${results.length}개의 글 · ${start + 1}–${Math.min(start + writingPageSize, results.length)}번째 기록`);
  return <div className="page-shell collection-writing"><SectionHeader eyebrow={text('Collection 03 / The library', '컬렉션 03 / 서재')} title={text('Between the lines.', '문장 사이에서.')} description={text('Essays, observations and ideas worth returning to. An index of writing across Substack, Naver Blog and this archive; follow each piece to its original home.', '다시 읽고 싶은 에세이, 관찰과 생각들. Substack과 네이버 블로그, 이 아카이브의 글을 한곳에 모았습니다. 각 글은 원래의 공간으로 이어집니다.')} />
    <div className="collection-reading-room"><span className="mono">{text('The reading room', '읽는 공간')}</span><span className="serif">{text('Words have a way of making room.', '문장은 자기만의 자리를 만듭니다.')}</span><span className="mono">{text('English & Korean originals', '영어와 한국어 원문')}</span></div>
    <div className="collection-writing-controls"><div className="collection-source-toolbar"><div className="collection-source-filters" role="group" aria-label={text('Filter writing by source', '출처별 글 보기')}>{['All', ...sources].map((source) => <button className={`collection-source-filter ${selectedSource === source ? 'collection-source-active' : ''}`} type="button" key={source} aria-pressed={selectedSource === source} onClick={() => updateFilter('source', source)}>{sourceLabel(source, text)}<span className="mono">{source === 'All' ? articles.length : articles.filter((article) => publication(article) === source).length}</span></button>)}</div><div className="collection-writing-search"><Search size={17} aria-hidden="true" /><label className="sr-only" htmlFor="writing-search">{text('Search titles, excerpts and tags', '제목, 미리보기, 태그 검색')}</label><input id="writing-search" type="search" value={query} onChange={(event) => updateFilter('q', event.target.value)} placeholder={text('Find a thought…', '어떤 생각을 찾고 있나요?')} autoComplete="off" />{query && <button type="button" aria-label={text('Clear search', '검색어 지우기')} onClick={() => updateFilter('q', '')}><X size={16} aria-hidden="true" /></button>}</div></div><CollectionFilters categories={categories} selected={selectedCategory} onSelect={(value) => updateFilter('category', value)} label={text('Filter writing by category', '카테고리별 글 보기')} /></div>
    <div className="collection-writing-results-head" id="writing-results"><span className="mono" aria-live="polite" aria-atomic="true">{resultLabel}</span><span className="mono">{text('Newest first', '최신 글부터')}</span>{hasFilters && <button className="text-link" type="button" onClick={() => setParams(new URLSearchParams())}>{text('Reset filters', '필터 초기화')}<X size={13} aria-hidden="true" /></button>}</div>
    {visible.length > 0 ? <div className="collection-article-list">{visible.map((original) => {
      const article = localizedArticle(original, localize);
      const time = readingTime(article, text);
      const originalLanguage = languageLabel(original, text);
      return <article key={article.id}><span className="mono collection-article-number">{article.number}</span><div><div className="collection-article-metadata mono"><span>{category(article.category)}</span><time dateTime={article.date}>{readableDate(article.date, language)}</time><span>{sourceLabel(publication(article), text)}</span>{originalLanguage && <span className="collection-original-language">{originalLanguage}</span>}{time && <span>{time}</span>}</div><h2 className="serif" lang={articleLanguage(original, language)}>{article.externalUrl ? <ExternalLink href={article.externalUrl} className="collection-article-title-link">{article.title}</ExternalLink> : <Link to={`/writing/${article.id}`}>{article.title}</Link>}</h2><p lang={articleLanguage(original, language)}>{article.excerpt}</p><div className="collection-article-row-footer">{article.tags && article.tags.length > 0 && <ul className="collection-article-tags" aria-label={text('Article tags', '글 태그')}>{article.tags.slice(0, 3).map((tag) => <li key={tag}>#{tag}</li>)}</ul>}<Link className="text-link" to={`/writing/${article.id}`}>{article.externalUrl ? text('Archive note', '아카이브 노트') : text('Read the piece', '글 읽기')}<ArrowRight size={14} aria-hidden="true" /><span className="sr-only"> — {article.title}</span></Link></div></div></article>;
    })}</div> : <section className="collection-writing-empty" aria-labelledby="writing-empty-heading"><ArchiveLabel>{text('A little room between the words', '문장들 사이의 작은 여백')}</ArchiveLabel><h2 className="serif" id="writing-empty-heading">{articles.length === 0 ? text('The shelves are ready.', '첫 문장을 기다리고 있어요.') : text('No matching thoughts, yet.', '찾고 있는 생각이 아직 보이지 않네요.')}</h2><p>{articles.length === 0 ? text('Published essays, blog posts and reflections will find their place here as they are added.', '공개된 에세이와 블로그 글, 일상의 생각들을 하나씩 모아갈 예정입니다.') : text('Try another word, a different source, or give the whole collection a look.', '다른 단어나 출처를 선택해 보세요. 전체 글을 함께 둘러볼 수도 있어요.')}</p>{hasFilters && <button className="text-link" type="button" onClick={() => setParams(new URLSearchParams())}>{text('Browse all writing', '모든 글 둘러보기')}<ArrowRight size={17} aria-hidden="true" /></button>}</section>}
    {pageCount > 1 && <nav className="collection-pagination" aria-label={text('Writing archive pages', '글 아카이브 페이지')}><button className="collection-pagination-direction" type="button" disabled={page === 1} onClick={() => goToPage(page - 1)} aria-label={text('Previous page', '이전 페이지')}><ArrowLeft size={16} aria-hidden="true" /><span>{text('Previous', '이전')}</span></button><div className="collection-pagination-numbers">{paginationPages(page, pageCount).map((value, index) => value === 'ellipsis' ? <span key={`ellipsis-${index}`} aria-hidden="true">…</span> : <button type="button" key={value} className={page === value ? 'collection-pagination-current' : ''} aria-current={page === value ? 'page' : undefined} aria-label={text(`Go to page ${value}`, `${value}페이지로 이동`)} onClick={() => goToPage(value)}>{value}</button>)}</div><button className="collection-pagination-direction" type="button" disabled={page === pageCount} onClick={() => goToPage(page + 1)} aria-label={text('Next page', '다음 페이지')}><span>{text('Next', '다음')}</span><ArrowRight size={16} aria-hidden="true" /></button></nav>}
    <p className="collection-writing-note">{text('Titles and previews stay in the language they were written in. Full pieces live with their original publications.', '제목과 미리보기는 쓰인 언어 그대로 담았습니다. 전체 글은 원래의 발행 공간에서 읽을 수 있어요.')}<br />{text('For the fragments between finished pieces, visit ', '완성된 글 사이의 조각들은 ')}<Link to="/journal" className="text-link">{text('the journal', '저널에서')}<ArrowUpRight size={15} aria-hidden="true" /></Link>{text('.', ' 만나보세요.')}</p>
  </div>;
}

export function ArticleDetailPage() {
  const { id } = useParams();
  const { text, language, localize, category } = useLanguage();
  const original = articles.find((entry) => entry.id === id);
  if (!original) return <CollectionNotFound collection="Writing" href="/writing" />;
  const article = localizedArticle(original, localize);
  const time = readingTime(article, text);
  const originalLanguage = languageLabel(original, text);
  return <div className="page-shell detail-article" lang={language}><Link className="text-link detail-back" to="/writing"><ArrowLeft size={16} aria-hidden="true" />{text('Back to the library', '서재로 돌아가기')}</Link><header className="detail-article-heading"><ArchiveLabel>{article.number} / {category(article.category)}</ArchiveLabel><h1 className="serif" lang={articleLanguage(original, language)}>{article.title}</h1><p className="detail-deck" lang={articleLanguage(original, language)}>{article.excerpt}</p><div className="detail-article-byline"><span>{site.name}</span><time className="mono" dateTime={article.date}>{readableDate(article.date, language)}</time>{time && <span className="mono">{time}</span>}<span className="mono">{sourceLabel(publication(article), text)}</span>{originalLanguage && <span className="mono collection-original-language">{originalLanguage}</span>}</div></header>
    <article className="detail-article-body">{article.body?.length ? article.body.map((paragraph, index) => <p key={index} lang={articleLanguage(original, language)}>{paragraph}</p>) : <div className="detail-publication-note"><ArchiveLabel>{text('A note from the archive', '아카이브에서 전하는 노트')}</ArchiveLabel><p>{article.externalUrl ? text(`This entry collects a title and a short preview. Read the complete piece in its original language on ${sourceLabel(publication(article), text)}.`, `제목과 짧은 미리보기를 모은 기록입니다. 전체 글은 ${sourceLabel(publication(article), text)}에서 원문으로 읽을 수 있어요.`) : text('The full text will join the archive when it is available.', '전체 글은 준비되면 아카이브에 추가할 예정입니다.')}</p></div>}{article.externalUrl && <div className="detail-article-original"><ExternalLink href={article.externalUrl} className="button button-dark">{text(`Read ${article.body?.length ? 'the original publication' : 'the full piece'} on ${sourceLabel(publication(article), text)}`, `${sourceLabel(publication(article), text)}에서 원문 읽기`)}</ExternalLink></div>}</article><div className="detail-article-end"><span className="serif" aria-hidden="true">❧</span><Link className="text-link" to="/writing">{text('Return to the shelves', '다른 글 둘러보기')}<ArrowRight size={17} aria-hidden="true" /></Link></div>
  </div>;
}
