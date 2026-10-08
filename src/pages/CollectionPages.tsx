import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Plus } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { SectionHeader, ArchiveLabel, ProjectVisual } from '../components/ui';
import { projects, artworks, articles, exhibitions, projectCategories, articleCategories, site } from '../content/archive';
import { assetUrl } from '../lib/utils';
import './collections.css';

type Project = (typeof projects)[number];
type Article = (typeof articles)[number];

const statusLabels: Record<Project['status'], string> = {
  published: 'Published',
  'in-progress': 'In progress',
  planned: 'Planned collection',
};

function CollectionFilters({ categories, selected, onSelect, label }: {
  categories: string[];
  selected: string;
  onSelect: (value: string) => void;
  label: string;
}) {
  return (
    <div className="collection-filters" role="group" aria-label={label}>
      {['All', ...categories.filter((category) => category !== 'All')].map((category) => (
        <button
          key={category}
          type="button"
          className={`collection-filter ${selected === category ? 'collection-filter-active' : ''}`}
          aria-pressed={selected === category}
          onClick={() => onSelect(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

function CollectionNotFound({ collection, href }: { collection: string; href: string }) {
  return (
    <div className="page-shell collection-not-found">
      <ArchiveLabel>Uncatalogued / 404</ArchiveLabel>
      <h1 className="serif">This page has<br />left the shelf.</h1>
      <p>There isn’t an entry at this address. The rest of the {collection.toLowerCase()} collection is waiting for you.</p>
      <Link className="text-link" to={href}><ArrowLeft size={16} /> Back to {collection.toLowerCase()}</Link>
    </div>
  );
}

function ExternalLink({ href, children, className = 'text-link' }: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={17} /><span className="sr-only"> (opens in a new tab)</span></a>;
}

export function ProjectsPage() {
  const [category, setCategory] = useState('All');
  const reducedMotion = useReducedMotion();
  const filtered = projects.filter((project) => category === 'All' || project.category === category);

  return (
    <div className="page-shell collection-projects">
      <SectionHeader eyebrow="Collection 01 / The works" title="Made. Making. Imagining." description="Websites, communications, research and independent ideas. A collection of finished things and things still finding their shape." />
      <div className="collection-toolbar">
        <CollectionFilters categories={projectCategories} selected={category} onSelect={setCategory} label="Filter projects by category" />
        <span className="mono collection-count" aria-live="polite">{String(filtered.length).padStart(2, '0')} {filtered.length === 1 ? 'entry' : 'entries'}</span>
      </div>
      <div className="collection-project-list">
        {filtered.map((project, index) => (
          <motion.article
            key={project.id}
            className={`collection-project-row collection-project-${project.status}`}
            initial={reducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.035 }}
          >
            <div className="collection-project-number mono">{project.number}</div>
            <Link to={`/projects/${project.id}`} className="collection-project-visual" aria-label={`View ${project.title}`}>
              <ProjectVisual project={project} />
            </Link>
            <div className="collection-project-copy">
              <div className="collection-project-topline">
                <span className="mono collection-category">{project.category}</span>
                <span className={`collection-status collection-status-${project.status}`}><span />{statusLabels[project.status]}</span>
              </div>
              <h2 className="serif"><Link to={`/projects/${project.id}`}>{project.title}</Link></h2>
              <p>{project.summary}</p>
              <div className="collection-project-bottomline">
                <span className="mono">{project.year || 'Date to be added'}</span>
                <Link className="text-link" to={`/projects/${project.id}`}>{project.status === 'published' ? 'Open the case study' : 'View collection notes'} <ArrowRight size={17} /></Link>
              </div>
            </div>
          </motion.article>
        ))}
        {filtered.length === 0 && (
          <div className="collection-filter-empty">
            <p className="serif">A little space for what comes next.</p>
            <p>No projects are catalogued in this category yet.</p>
            <button className="text-link" onClick={() => setCategory('All')} type="button">View all projects <ArrowRight size={16} /></button>
          </div>
        )}
      </div>
      <div className="collection-footnote mono"><Plus size={14} /> This archive grows with the work. Planned collections are labelled as such.</div>
    </div>
  );
}

export function ProjectDetailPage() {
  const { id } = useParams();
  const project = projects.find((entry) => entry.id === id);
  if (!project) return <CollectionNotFound collection="Projects" href="/projects" />;
  const related = projects.filter((entry) => entry.id !== project.id).slice(0, 2);

  return (
    <div className="page-shell detail-project" lang={project.language}>
      <Link className="text-link detail-back" to="/projects"><ArrowLeft size={16} /> All projects</Link>
      <div className="detail-project-heading">
        <ArchiveLabel>{project.number} / {project.category}</ArchiveLabel>
        <h1 className="serif">{project.title}</h1>
        <p className="detail-deck">{project.summary}</p>
      </div>
      <div className="detail-project-cover"><ProjectVisual project={project} /></div>
      {!project.thumbnail && <p className="mono detail-cover-caption">Archive cover / original project screenshots will be added as the work is documented.</p>}
      <div className="detail-project-grid">
        <aside className="detail-metadata" aria-label="Project details">
          <dl>
            <div><dt>Status</dt><dd><span className={`collection-status collection-status-${project.status}`}><span />{statusLabels[project.status]}</span></dd></div>
            <div><dt>Year</dt><dd>{project.year || 'To be documented'}</dd></div>
            <div><dt>Collection</dt><dd>{project.category}</dd></div>
            {project.role && <div><dt>Role</dt><dd>{project.role}</dd></div>}
            {project.tools && project.tools.length > 0 && <div><dt>Tools</dt><dd>{Array.isArray(project.tools) ? project.tools.join(', ') : project.tools}</dd></div>}
          </dl>
          {project.externalUrl && <ExternalLink href={project.externalUrl}>Visit the live project</ExternalLink>}
        </aside>
        <div className="detail-project-body">
          <section>
            <span className="mono detail-section-label">01 / Overview</span>
            <h2 className="serif">The idea behind the work.</h2>
            <p>{project.description}</p>
          </section>
          {project.sections.map((section, index) => (
            <section key={`${section.title}-${index}`}>
              <span className="mono detail-section-label">{String(index + 2).padStart(2, '0')} / Project notes</span>
              <h2 className="serif">{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
          {project.gallery && project.gallery.length > 0 && <section className="detail-project-gallery"><span className="mono detail-section-label">A closer look / Project gallery</span><h2 className="serif">Details from the work.</h2>{project.gallery.map((image, index) => <figure key={`${image.image}-${index}`}><img src={assetUrl(image.image)} alt={image.alt} loading="lazy" /><figcaption>{image.caption}</figcaption></figure>)}</section>}
          {project.status !== 'published' && (
            <div className="detail-documentation-note">
              <span className="mono">A collection in the making</span>
              <p>Process notes, visuals and verified outcomes will be added as this work is documented.</p>
            </div>
          )}
        </div>
      </div>
      {related.length > 0 && <nav className="detail-related" aria-label="More projects"><span className="mono">Continue through the archive</span>{related.map((entry) => <Link key={entry.id} to={`/projects/${entry.id}`}><span className="mono">{entry.number}</span><span className="serif">{entry.title}</span><ArrowUpRight size={21} /></Link>)}</nav>}
    </div>
  );
}

export function ArtPage() {
  const [category, setCategory] = useState('All');
  const categories = useMemo(() => [...new Set(artworks.map((artwork) => artwork.category))], []);
  const filtered = artworks.filter((artwork) => category === 'All' || artwork.category === category);
  const artAccount = site.links.find((link) => link.url.includes('instagram.com/paintwithhanyee'));

  return (
    <div className="page-shell collection-art">
      <SectionHeader eyebrow="Collection 02 / The gallery" title="A different kind of language." description="Paintings, sketches and contemporary interpretations of Korean minhwa. A space for the things that are better said in colour." />
      <div className="collection-art-intro"><span className="mono">Painting & visual stories</span>{artAccount && artworks.length > 0 && <ExternalLink href={artAccount.url}>@paintwithhanyee</ExternalLink>}<span className="collection-art-annotation serif">Look a little longer.</span><ArrowDown size={20} aria-hidden="true" /></div>
      {artworks.length > 0 ? (
        <>
          {categories.length > 1 && <CollectionFilters categories={categories} selected={category} onSelect={setCategory} label="Filter artworks by collection" />}
          <div className="collection-art-grid">
            {filtered.map((artwork, index) => (
              <article key={artwork.id} className={`collection-artwork collection-artwork-${index % 3}`}>
                <Link to={`/art/${artwork.id}`} className="collection-art-image" aria-label={`View ${artwork.title}`}><img src={assetUrl(artwork.image)} alt={artwork.title} loading="lazy" /></Link>
                <div className="collection-art-caption"><span className="mono">{artwork.number}</span><div><h2 className="serif"><Link to={`/art/${artwork.id}`}>{artwork.title}</Link></h2><p>{[artwork.year, artwork.medium].filter(Boolean).join(' · ')}</p></div><Link to={`/art/${artwork.id}`} aria-label={`View details for ${artwork.title}`}><ArrowUpRight size={20} /></Link></div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <section className="collection-gallery-empty" aria-labelledby="gallery-empty-heading">
          <div className="collection-gallery-wall" aria-hidden="true"><div className="collection-frame"><span className="mono">Reserved for an original</span><Plus strokeWidth={1} size={35} /><span className="serif">In time.</span></div><span className="mono collection-gallery-wall-note">Gallery installation / ongoing</span></div>
          <div className="collection-gallery-note"><ArchiveLabel>An exhibition in the making</ArchiveLabel><h2 className="serif" id="gallery-empty-heading">Good things<br />take their time.</h2><p>The gallery is ready for its first original works. Paintings, their stories and a closer look at the process will be collected here.</p><p className="collection-honest-note">No artwork has been added to the archive yet.</p>{artAccount && <ExternalLink href={artAccount.url}>Follow @paintwithhanyee</ExternalLink>}</div>
        </section>
      )}
      <div className="collection-artist-note"><span className="mono">{site.artistStatement ? 'Artist statement' : 'The practice'}</span><h2 className="serif">Rooted in tradition.<br /><em>Open to interpretation.</em></h2><div><p>{site.artistStatement || 'This collection focuses on paintings and contemporary interpretations of Korean minhwa. An artist statement, sketches and process documentation can grow alongside the works.'}</p><Link className="text-link" to="/about">Meet the person behind the work <ArrowRight size={17} /></Link></div></div>
      {exhibitions.length > 0 && <section className="collection-exhibitions"><span className="mono">Exhibition history</span>{exhibitions.map((exhibition) => <div key={`${exhibition.title}-${exhibition.year}`}><span className="mono">{exhibition.year}</span><h3 className="serif">{exhibition.title}</h3><p>{exhibition.venue}</p></div>)}</section>}
    </div>
  );
}

export function ArtworkDetailPage() {
  const { id } = useParams();
  const artwork = artworks.find((entry) => entry.id === id);
  if (!artwork) return <CollectionNotFound collection="Art" href="/art" />;
  return (
    <div className="page-shell detail-artwork" lang={artwork.language}>
      <Link className="text-link detail-back" to="/art"><ArrowLeft size={16} /> Back to the gallery</Link>
      <div className="detail-artwork-grid">
        <figure><img src={assetUrl(artwork.image)} alt={artwork.title} /><figcaption className="mono">{artwork.number} / {artwork.title}</figcaption></figure>
        <div className="detail-artwork-copy"><ArchiveLabel>{artwork.number} / {artwork.category}</ArchiveLabel><h1 className="serif">{artwork.title}</h1><dl className="detail-artwork-metadata">{artwork.year && <div><dt>Year</dt><dd>{artwork.year}</dd></div>}{artwork.medium && <div><dt>Medium</dt><dd>{artwork.medium}</dd></div>}{artwork.dimensions && <div><dt>Dimensions</dt><dd>{artwork.dimensions}</dd></div>}</dl><p>{artwork.description}</p><Link className="text-link" to="/art">Continue looking <ArrowRight size={17} /></Link></div>
      </div>
      {artwork.process && artwork.process.length > 0 && <section className="detail-artwork-process"><ArchiveLabel>From the studio / Process notes</ArchiveLabel><h2 className="serif">Along the way.</h2><div className="detail-artwork-process-grid">{artwork.process.map((image, index) => <figure key={`${image.image}-${index}`}><img src={assetUrl(image.image)} alt={image.alt} loading="lazy" /><figcaption>{image.caption}</figcaption></figure>)}</div></section>}
    </div>
  );
}

function readableDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date);
}

function readingTime(article: Article) {
  if (!article.body?.length) return null;
  const text = article.body.join(' ');
  const koreanCharacters = (text.match(/[가-힣]/g) || []).length;
  const words = text.replace(/[가-힣]/g, '').split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 220 + koreanCharacters / 500))} min read`;
}

export function WritingPage() {
  const [category, setCategory] = useState('All');
  const filtered = articles.filter((article) => category === 'All' || article.category === category);
  return (
    <div className="page-shell collection-writing">
      <SectionHeader eyebrow="Collection 03 / The library" title="Between the lines." description="Essays, observations and ideas worth returning to. Business, culture and the bits of life that stay on the mind." />
      <div className="collection-reading-room"><span className="mono">The reading room</span><span className="serif">Words have a way of making room.</span><span className="mono" lang="ko">한국어 & English</span></div>
      <div className="collection-toolbar"><CollectionFilters categories={articleCategories} selected={category} onSelect={setCategory} label="Filter writing by category" /><span className="mono collection-count" aria-live="polite">{String(filtered.length).padStart(2, '0')} {filtered.length === 1 ? 'piece' : 'pieces'}</span></div>
      {filtered.length > 0 ? (
        <div className="collection-article-list">{filtered.map((article) => <article key={article.id}><span className="mono collection-article-number">{article.number}</span><div><div className="collection-article-metadata mono"><span>{article.category}</span><time dateTime={article.date}>{readableDate(article.date)}</time>{readingTime(article) && <span>{readingTime(article)}</span>}</div><h2 className="serif">{article.body?.length ? <Link to={`/writing/${article.id}`}>{article.title}</Link> : article.externalUrl ? <ExternalLink href={article.externalUrl} className="collection-article-title-link">{article.title}</ExternalLink> : <Link to={`/writing/${article.id}`}>{article.title}</Link>}</h2><p>{article.excerpt}</p></div><div className="collection-article-source mono">{article.platform || 'The Living Archive'}</div></article>)}</div>
      ) : (
        <section className="collection-library-empty" aria-labelledby="library-empty-heading"><span className="collection-library-mark serif" aria-hidden="true">“</span><div><ArchiveLabel>{category === 'All' ? 'An open page' : category}</ArchiveLabel><h2 className="serif" id="library-empty-heading">A thought begins.<br /><em>The archive follows.</em></h2><p>{articles.length === 0 ? 'The shelves are ready. Published essays, blog posts and reflections will find their place here as they are added.' : 'There are no pieces in this category yet. The rest of the library is a click away.'}</p><span className="mono collection-library-status">{articles.length === 0 ? 'Awaiting the first published entry' : `${filtered.length} entries in this category`}</span>{articles.length > 0 && <button type="button" className="text-link" onClick={() => setCategory('All')}>Browse all writing <ArrowRight size={17} /></button>}</div><div className="collection-library-spines" aria-hidden="true"><span>IDEAS</span><span>OBSERVATIONS</span><span>OTHER THINGS</span></div></section>
      )}
      <p className="collection-writing-note">For the fragments between finished pieces, visit <Link to="/journal" className="text-link">the journal <ArrowUpRight size={15} /></Link>.</p>
    </div>
  );
}

export function ArticleDetailPage() {
  const { id } = useParams();
  const article = articles.find((entry) => entry.id === id);
  if (!article) return <CollectionNotFound collection="Writing" href="/writing" />;
  const time = readingTime(article);
  return (
    <div className="page-shell detail-article" lang={article.language}>
      <Link className="text-link detail-back" to="/writing"><ArrowLeft size={16} /> Back to the library</Link>
      <header className="detail-article-heading"><ArchiveLabel>{article.number} / {article.category}</ArchiveLabel><h1 className="serif">{article.title}</h1><p className="detail-deck">{article.excerpt}</p><div className="detail-article-byline"><span>Hanyee Jang</span><time className="mono" dateTime={article.date}>{readableDate(article.date)}</time>{time && <span className="mono">{time}</span>}{article.platform && <span className="mono">{article.platform}</span>}</div></header>
      <article className="detail-article-body">{article.body?.length ? article.body.map((paragraph, index) => <p key={index}>{paragraph}</p>) : <p>{article.externalUrl ? 'This piece is available on its original publication.' : 'The full text will join the archive when it is available.'}</p>}{article.externalUrl && <div className="detail-article-original"><ExternalLink href={article.externalUrl}>Read {article.body?.length ? 'the original publication' : 'the full piece'}{article.platform ? ` on ${article.platform}` : ''}</ExternalLink></div>}</article>
      <div className="detail-article-end"><span className="serif" aria-hidden="true">❧</span><Link className="text-link" to="/writing">Return to the shelves <ArrowRight size={17} /></Link></div>
    </div>
  );
}
