import { ArrowDown, ArrowRight, ArrowUpRight, Download, FileText } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ArchiveMark } from '../components/ArchiveMark';
import { ArchiveLabel, SectionHeader } from '../components/ui';
import { education, experiences, journalEntries, site, skills } from '../content/archive';
import { assetUrl, formatDate } from '../lib/utils';
import './personal.css';

function CvLink({ className = 'button button-outline' }: { className?: string }) {
  return site.cvUrl ? (
    <a className={className} href={assetUrl(site.cvUrl)} target="_blank" rel="noreferrer">
      View CV <Download size={15} aria-hidden="true" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  ) : (
    <Link className={className} to="/cv">
      CV coming soon <FileText size={15} aria-hidden="true" />
    </Link>
  );
}

export function AboutPage() {
  const timeline = [
    ...education.map((entry) => ({
      title: entry.institution,
      subtitle: entry.degree,
      period: entry.period,
      kind: 'Education',
      description: undefined as string | undefined,
    })),
    ...experiences.map((entry) => ({
      title: entry.organisation,
      subtitle: entry.role,
      period: entry.period,
      kind: 'Experience',
      description: entry.description,
    })),
  ];

  return (
    <div className="page-shell personal-page personal-about">
      <SectionHeader eyebrow="01 / THE PERSON" title="A person, in many parts." description="A little context for the collection." />

      <section className="personal-biography" aria-labelledby="personal-bio-title">
        <div className="personal-profile-art" aria-hidden="true">
          <span className="mono personal-profile-label">THE LIVING ARCHIVE<br />PERSONAL FILE · 001</span>
          <div className="personal-profile-circle" />
          <div className="personal-profile-cross">+</div>
          <p className="serif personal-profile-type">Art.<br /><em>Ideas.</em><br />Everything<br /><span>in between.</span></p>
          <span className="mono personal-profile-bottom">AN ONGOING COLLECTION</span>
        </div>
        <div className="personal-bio-copy">
          <ArchiveLabel>HANYEE JANG</ArchiveLabel>
          <h2 id="personal-bio-title" className="serif">More than<br />a single chapter.</h2>
          <p>I’m Hanyee Jang. The Living Archive brings together my work, creative practice, and ideas — a place for the different parts to sit alongside one another.</p>
          <p>My background in International Management at King’s College London sits alongside an interest in art, communication, and digital storytelling. Here, there’s room for a website, a painting, a piece of writing, and whatever comes next.</p>
          <div className="personal-bio-actions">
            <CvLink />
            <a className="text-link" href="#personal-timeline" onClick={(event) => {
              event.preventDefault();
              const timelineSection = document.getElementById('personal-timeline');
              timelineSection?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
              timelineSection?.focus({ preventScroll: true });
            }}>The path so far <ArrowDown size={15} aria-hidden="true" /></a>
          </div>
        </div>
      </section>

      <section id="personal-timeline" className="personal-timeline-section" aria-labelledby="personal-timeline-title" tabIndex={-1}>
        <div className="personal-section-heading">
          <div><span className="mono personal-eyebrow">EDUCATION & EXPERIENCE</span><h2 id="personal-timeline-title" className="serif">The path so far.</h2></div>
          <p>Different chapters.<br />A continuous thread.</p>
        </div>
        <ol className="personal-timeline">
          {timeline.map((entry, index) => (
            <li className="personal-timeline-entry" key={`${entry.title}-${entry.subtitle}`}>
              <div className="personal-timeline-date"><span className="mono">{String(index + 1).padStart(2, '0')}</span>{entry.period && <p className="serif">{entry.period.split(/([–—])/).map((part, partIndex) => <span className={part === '–' || part === '—' ? 'personal-year-divider' : 'personal-year'} key={partIndex}>{part}</span>)}</p>}</div>
              <div className="personal-timeline-dot" aria-hidden="true"><span /></div>
              <div className="personal-timeline-copy"><span className="mono personal-eyebrow">{entry.kind}</span><h3>{entry.title}</h3><p className="personal-role">{entry.subtitle}</p>{entry.description && <p className="personal-timeline-description">{entry.description}</p>}</div>
            </li>
          ))}
        </ol>
      </section>

      {skills.some((group) => group.items.length > 0) && (
        <section className="personal-skills" aria-labelledby="personal-skills-title">
          <div><span className="mono personal-eyebrow">TOOLS & PRACTICE</span><h2 id="personal-skills-title" className="serif">A working toolkit.</h2></div>
          <div className="personal-skills-groups">{skills.filter((group) => group.items.length > 0).map((group) => <div key={group.category}><h3 className="mono">{group.category}</h3><ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul></div>)}</div>
        </section>
      )}

      <div className="personal-about-bottom"><p className="serif">The rest is in the archive.</p><Link className="text-link" to="/projects">Explore the works <ArrowUpRight size={18} aria-hidden="true" /></Link></div>
    </div>
  );
}

export function JournalPage() {
  return (
    <div className="page-shell personal-page personal-journal">
      <SectionHeader eyebrow="05 / THE JOURNAL" title="Notes from the margins." description="Life, culture, and other things worth keeping." />
      {journalEntries.length > 0 ? (
        <div className="personal-journal-list">
          {journalEntries.map((entry, index) => (
            <Link className="personal-journal-entry" to={`/journal/${entry.id}`} key={entry.id}>
              <span className="mono personal-journal-number">{String(index + 1).padStart(2, '0')}</span>
              {entry.image && <img src={assetUrl(entry.image)} alt="" loading="lazy" />}
              <div className="personal-journal-entry-copy"><div className="mono personal-journal-meta"><time dateTime={entry.date}>{formatDate(entry.date)}</time><span>{entry.category}</span></div><h2 className="serif">{entry.title}</h2>{entry.body[0] && <p>{entry.body[0]}</p>}</div>
              <ArrowUpRight size={26} aria-hidden="true" />
            </Link>
          ))}
        </div>
      ) : (
        <section className="personal-journal-empty" aria-labelledby="personal-journal-empty-title">
          <div className="personal-notebook" aria-hidden="true"><span className="mono">FIELD NOTES</span><div className="personal-notebook-lines" /><p className="serif">To be<br /><em>continued…</em></p><span className="personal-notebook-tab" /></div>
          <div className="personal-journal-empty-copy"><ArchiveLabel>A JOURNAL IN THE MAKING</ArchiveLabel><h2 id="personal-journal-empty-title" className="serif">Every collection<br />begins somewhere.</h2><p>The first notes are still to come. This will be a home for cultural discoveries, photographs, personal reflections, and small things worth remembering.</p><Link className="text-link" to="/projects">Until then, explore the works <ArrowUpRight size={17} aria-hidden="true" /></Link></div>
        </section>
      )}
    </div>
  );
}

export function JournalDetailPage() {
  const { id } = useParams();
  const entry = journalEntries.find((item) => item.id === id);
  if (!entry) return <div className="page-shell personal-page personal-missing"><ArchiveLabel>JOURNAL / NO ENTRY FOUND</ArchiveLabel><h1 className="serif">This page isn’t in<br />the collection.</h1><p>The entry may have moved, or hasn’t been published yet.</p><Link className="button button-outline" to="/journal">Back to the journal <ArrowRight size={16} aria-hidden="true" /></Link></div>;
  return (
    <article className="page-shell personal-page personal-journal-detail">
      <Link className="text-link personal-back-link" to="/journal">← Back to the journal</Link>
      <div className="mono personal-journal-meta"><time dateTime={entry.date}>{formatDate(entry.date)}</time><span>{entry.category}</span></div>
      <h1 className="serif">{entry.title}</h1>
      {entry.image && <img className="personal-journal-cover" src={assetUrl(entry.image)} alt={entry.imageAlt || entry.title} />}
      <div className="personal-reading-body">{entry.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
      <div className="personal-reading-end"><span aria-hidden="true"><ArchiveMark /></span><Link className="text-link" to="/journal">More from the journal <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
    </article>
  );
}

export function ContactPage() {
  return (
    <div className="page-shell personal-page personal-contact">
      <SectionHeader eyebrow="06 / THE DIRECTORY" title="A conversation starts here." description="For opportunities, creative collaborations, and interesting conversations." />
      <div className="personal-contact-layout">
        <div className="personal-contact-invitation"><span className="mono personal-eyebrow">OPEN A NEW CHAPTER</span><p className="serif">A thought.<br />An idea.<br /><em>A hello.</em></p><div className="personal-contact-flower" aria-hidden="true"><ArchiveMark /></div></div>
        <div className="personal-directory"><span className="mono personal-directory-label">FIND ME HERE</span>{site.links.length > 0 ? <ul>{site.links.map((link, index) => <li key={link.url}><a href={link.url} target={link.url.startsWith('mailto:') ? undefined : '_blank'} rel={link.url.startsWith('mailto:') ? undefined : 'noreferrer'}><span className="mono personal-directory-number">{String(index + 1).padStart(2, '0')}</span><span>{link.label.split(' · ')[0]}<small>{link.label.includes(' · ') ? link.label.split(' · ').slice(1).join(' · ') : link.url.startsWith('mailto:') ? link.url.slice(7) : 'Visit profile'}</small></span><ArrowUpRight aria-hidden="true" size={26} />{!link.url.startsWith('mailto:') && <span className="sr-only"> (opens in a new tab)</span>}</a></li>)}</ul> : <p className="personal-directory-empty">Contact details will be added here when available.</p>}<p className="personal-directory-note">A small directory, with room to grow.</p></div>
      </div>
      <div className="personal-contact-bottom"><span className="mono">THANK YOU FOR VISITING</span><p className="serif">Leave a little curious.</p><Link className="text-link" to="/">Return to the foyer <ArrowRight size={16} aria-hidden="true" /></Link></div>
    </div>
  );
}

export function CvPage() {
  return (
    <div className="page-shell personal-page personal-cv">
      <SectionHeader eyebrow="PERSONAL FILE / CV" title={site.cvUrl ? 'The professional chapter.' : 'A document, to come.'} description="The professional background, in one place." />
      <section className="personal-cv-panel" aria-labelledby="personal-cv-title"><div className="personal-cv-document" aria-hidden="true"><FileText size={50} strokeWidth={1} /><span className="mono">HANYEE JANG</span><span className="serif">Curriculum<br /><em>vitae.</em></span><i /><i /><i /></div><div><ArchiveLabel>{site.cvUrl ? 'AVAILABLE TO VIEW' : 'CV COMING SOON'}</ArchiveLabel><h2 id="personal-cv-title" className="serif">{site.cvUrl ? 'The details, collected.' : 'One more piece of the archive.'}</h2><p>{site.cvUrl ? 'View the full CV for education, experience, and professional background.' : 'The CV PDF hasn’t been added yet. You can find the current education and experience on the About page.'}</p><div className="personal-cv-actions">{site.cvUrl && <CvLink className="button button-dark" />}<Link className={site.cvUrl ? 'text-link' : 'button button-dark'} to="/about">View education & experience <ArrowUpRight size={16} aria-hidden="true" /></Link></div></div></section>
    </div>
  );
}
