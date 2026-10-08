import { ArrowDown, ArrowRight, ArrowUpRight, Download, FileText } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { ArchiveMark } from '../components/ArchiveMark';
import { ArchiveLabel, SectionHeader } from '../components/ui';
import { education, experiences, journalEntries, site, skills } from '../content/archive';
import { LocaleLink as Link, useLanguage } from '../i18n';
import { assetUrl, formatDate } from '../lib/utils';
import './personal.css';

function CvLink({ className = 'button button-outline' }: { className?: string }) {
  const { text } = useLanguage();
  return site.cvUrl ? (
    <a className={className} href={assetUrl(site.cvUrl)} target="_blank" rel="noreferrer">
      {text('View CV', '이력서 보기')} <Download size={15} aria-hidden="true" />
      <span className="sr-only">{text(' (opens in a new tab)', ' (새 탭에서 열립니다)')}</span>
    </a>
  ) : (
    <Link className={className} to="/cv">
      {text('CV coming soon', '이력서 준비 중')} <FileText size={15} aria-hidden="true" />
    </Link>
  );
}

export function AboutPage() {
  const { text, localize, category } = useLanguage();
  const timeline = [
    ...education.map((item) => {
      const entry = localize(item);
      return {
        title: entry.institution,
        subtitle: entry.degree,
        period: entry.period,
        kind: text('Education', '학력'),
        description: undefined as string | undefined,
      };
    }),
    ...experiences.map((item) => {
      const entry = localize(item);
      return {
        title: entry.organisation,
        subtitle: entry.role,
        period: entry.period,
        kind: text('Experience', '경력'),
        description: entry.description,
      };
    }),
  ];

  return (
    <div className="page-shell personal-page personal-about">
      <SectionHeader
        eyebrow={text('01 / THE PERSON', '01 / 이곳을 만든 사람')}
        title={text('A person, in many parts.', '여러 모습으로 이어지는 한 사람.')}
        description={text('A little context for the collection.', '이 아카이브를 만든 사람에 관하여.')}
      />

      <section className="personal-biography" aria-labelledby="personal-bio-title">
        <div className="personal-profile-art" aria-hidden="true">
          <span className="mono personal-profile-label">{text('THE LIVING ARCHIVE', '살아 있는 아카이브')}<br />{text('PERSONAL FILE · 001', '개인 기록 · 001')}</span>
          <div className="personal-profile-circle" />
          <div className="personal-profile-cross">+</div>
          <p className="serif personal-profile-type">{text('Art.', '예술.')}<br /><em>{text('Ideas.', '생각.')}</em><br />{text('Everything', '그리고 그')}<br /><span>{text('in between.', '사이의 모든 것.')}</span></p>
          <span className="mono personal-profile-bottom">{text('AN ONGOING COLLECTION', '계속해서 쌓이는 기록')}</span>
        </div>
        <div className="personal-bio-copy">
          <ArchiveLabel>HANYEE JANG</ArchiveLabel>
          <h2 id="personal-bio-title" className="serif">{text('More than', '한 장면으로는')}<br />{text('a single chapter.', '다 담을 수 없는.')}</h2>
          <p>{text('I’m Hanyee Jang. The Living Archive brings together my work, creative practice, and ideas — a place for the different parts to sit alongside one another.', '안녕하세요, Hanyee Jang입니다. The Living Archive는 작업, 창작 활동, 생각을 한데 모으는 공간입니다. 서로 다른 관심사와 경험을 나란히 놓고 기록합니다.')}</p>
          <p>{text('My background in International Management at King’s College London sits alongside an interest in art, communication, and digital storytelling. Here, there’s room for a website, a painting, a piece of writing, and whatever comes next.', '킹스 칼리지 런던에서의 국제경영 공부를 바탕으로 예술, 커뮤니케이션, 디지털 스토리텔링에도 관심을 두고 있습니다. 웹사이트와 그림, 글, 그리고 앞으로 만들어 갈 것들이 이곳에 함께 놓입니다.')}</p>
          <div className="personal-bio-actions">
            <CvLink />
            <a className="text-link" href="#personal-timeline" onClick={(event) => {
              event.preventDefault();
              const timelineSection = document.getElementById('personal-timeline');
              timelineSection?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
              timelineSection?.focus({ preventScroll: true });
            }}>{text('The path so far', '지금까지 걸어온 길')} <ArrowDown size={15} aria-hidden="true" /></a>
          </div>
        </div>
      </section>

      <section id="personal-timeline" className="personal-timeline-section" aria-labelledby="personal-timeline-title" tabIndex={-1}>
        <div className="personal-section-heading">
          <div><span className="mono personal-eyebrow">{text('EDUCATION & EXPERIENCE', '학력과 경력')}</span><h2 id="personal-timeline-title" className="serif">{text('The path so far.', '지금까지 걸어온 길.')}</h2></div>
          <p>{text('Different chapters.', '서로 다른 시간들.')}<br />{text('A continuous thread.', '하나로 이어지는 이야기.')}</p>
        </div>
        <ol className="personal-timeline">
          {timeline.map((entry, index) => (
            <li className="personal-timeline-entry" key={`${entry.title}-${entry.subtitle}`}>
              <div className="personal-timeline-date">
                <span className="mono">{String(index + 1).padStart(2, '0')}</span>
                {entry.period && <p className="serif">{entry.period.split(/([–—])/).map((part, partIndex) => <span className={part === '–' || part === '—' ? 'personal-year-divider' : 'personal-year'} key={partIndex}>{part}</span>)}</p>}
              </div>
              <div className="personal-timeline-dot" aria-hidden="true"><span /></div>
              <div className="personal-timeline-copy"><span className="mono personal-eyebrow">{entry.kind}</span><h3>{entry.title}</h3><p className="personal-role">{entry.subtitle}</p>{entry.description && <p className="personal-timeline-description">{entry.description}</p>}</div>
            </li>
          ))}
        </ol>
      </section>

      {skills.some((group) => group.items.length > 0) && (
        <section className="personal-skills" aria-labelledby="personal-skills-title">
          <div><span className="mono personal-eyebrow">{text('TOOLS & PRACTICE', '도구와 작업 방식')}</span><h2 id="personal-skills-title" className="serif">{text('A working toolkit.', '작업을 위한 도구들.')}</h2></div>
          <div className="personal-skills-groups">{skills.filter((group) => group.items.length > 0).map((group) => <div key={group.category}><h3 className="mono">{category(group.category)}</h3><ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul></div>)}</div>
        </section>
      )}

      <div className="personal-about-bottom"><p className="serif">{text('The rest is in the archive.', '다른 이야기는 아카이브에서.')}</p><Link className="text-link" to="/projects">{text('Explore the works', '작업 둘러보기')} <ArrowUpRight size={18} aria-hidden="true" /></Link></div>
    </div>
  );
}

export function JournalPage() {
  const { language, text, localize, category } = useLanguage();
  return (
    <div className="page-shell personal-page personal-journal">
      <SectionHeader eyebrow={text('05 / THE JOURNAL', '05 / 일상의 기록')} title={text('Notes from the margins.', '여백에 남긴 기록.')} description={text('Life, culture, and other things worth keeping.', '일상과 문화, 그리고 오래 간직하고 싶은 것들.')}/>
      {journalEntries.length > 0 ? (
        <div className="personal-journal-list">
          {journalEntries.map((originalEntry, index) => {
            const entry = localize(originalEntry);
            return (
              <Link className="personal-journal-entry" to={`/journal/${entry.id}`} key={entry.id}>
                <span className="mono personal-journal-number">{String(index + 1).padStart(2, '0')}</span>
                {entry.image && <img src={assetUrl(entry.image)} alt="" loading="lazy" />}
                <div className="personal-journal-entry-copy">
                  <div className="mono personal-journal-meta"><time dateTime={entry.date}>{formatDate(entry.date, language)}</time><span>{category(entry.category)}</span></div>
                  <h2 className="serif" lang={originalEntry.translations?.[language]?.title ? language : originalEntry.language || language}>{entry.title}</h2>
                  {entry.body[0] && <p lang={originalEntry.translations?.[language]?.body ? language : originalEntry.language || language}>{entry.body[0]}</p>}
                </div>
                <ArrowUpRight size={26} aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      ) : (
        <section className="personal-journal-empty" aria-labelledby="personal-journal-empty-title">
          <div className="personal-notebook" aria-hidden="true"><span className="mono">{text('FIELD NOTES', '관찰 노트')}</span><div className="personal-notebook-lines" /><p className="serif">{text('To be', '다음')}<br /><em>{text('continued…', '페이지로…')}</em></p><span className="personal-notebook-tab" /></div>
          <div className="personal-journal-empty-copy">
            <ArchiveLabel>{text('A JOURNAL IN THE MAKING', '첫 기록을 준비하는 중')}</ArchiveLabel>
            <h2 id="personal-journal-empty-title" className="serif">{text('Every collection', '모든 기록에는')}<br />{text('begins somewhere.', '첫 페이지가 있습니다.')}</h2>
            <p>{text('The first notes are still to come. This will be a home for cultural discoveries, photographs, personal reflections, and small things worth remembering.', '첫 기록은 아직 준비 중입니다. 문화 속에서 발견한 것들, 사진, 개인적인 생각, 그리고 기억해 두고 싶은 작은 순간들이 이곳을 채워 갈 예정입니다.')}</p>
            <Link className="text-link" to="/projects">{text('Until then, explore the works', '그동안 작업을 둘러보세요')} <ArrowUpRight size={17} aria-hidden="true" /></Link>
          </div>
        </section>
      )}
    </div>
  );
}

export function JournalDetailPage() {
  const { id } = useParams();
  const { language, text, localize, category } = useLanguage();
  const originalEntry = journalEntries.find((item) => item.id === id);
  if (!originalEntry) return (
    <div className="page-shell personal-page personal-missing">
      <ArchiveLabel>{text('JOURNAL / NO ENTRY FOUND', '일상의 기록 / 기록을 찾을 수 없습니다')}</ArchiveLabel>
      <h1 className="serif">{text('This page isn’t in', '아카이브에서')}<br />{text('the collection.', '이 기록을 찾지 못했습니다.')}</h1>
      <p>{text('The entry may have moved, or hasn’t been published yet.', '기록이 다른 곳으로 이동했거나 아직 공개되지 않았을 수 있습니다.')}</p>
      <Link className="button button-outline" to="/journal">{text('Back to the journal', '일상의 기록으로 돌아가기')} <ArrowRight size={16} aria-hidden="true" /></Link>
    </div>
  );
  const entry = localize(originalEntry);
  return (
    <article className="page-shell personal-page personal-journal-detail">
      <Link className="text-link personal-back-link" to="/journal">← {text('Back to the journal', '일상의 기록으로 돌아가기')}</Link>
      <div className="mono personal-journal-meta"><time dateTime={entry.date}>{formatDate(entry.date, language)}</time><span>{category(entry.category)}</span></div>
      <h1 className="serif" lang={originalEntry.translations?.[language]?.title ? language : originalEntry.language || language}>{entry.title}</h1>
      {entry.image && <img className="personal-journal-cover" src={assetUrl(entry.image)} alt={entry.imageAlt || entry.title} />}
      <div className="personal-reading-body" lang={originalEntry.translations?.[language]?.body ? language : originalEntry.language || language}>{entry.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
      <div className="personal-reading-end"><span aria-hidden="true"><ArchiveMark /></span><Link className="text-link" to="/journal">{text('More from the journal', '다른 기록 읽기')} <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
    </article>
  );
}

export function ContactPage() {
  const { text } = useLanguage();
  const platformName = (name: string) => ({
    Instagram: text('Instagram', '인스타그램'),
    'Naver Blog': text('Naver Blog', '네이버 블로그'),
    Substack: 'Substack',
  })[name] || name;
  return (
    <div className="page-shell personal-page personal-contact">
      <SectionHeader eyebrow={text('06 / THE DIRECTORY', '06 / 연락처')} title={text('A conversation starts here.', '이곳에서 이야기를 시작해요.')} description={text('For opportunities, creative collaborations, and interesting conversations.', '새로운 기회, 창작 협업, 그리고 흥미로운 대화를 기다립니다.')}/>
      <div className="personal-contact-layout">
        <div className="personal-contact-invitation">
          <span className="mono personal-eyebrow">{text('OPEN A NEW CHAPTER', '새로운 이야기를 열며')}</span>
          <p className="serif">{text('A thought.', '작은 생각.')}<br />{text('An idea.', '하나의 구상.')}<br /><em>{text('A hello.', '반가운 인사.')}</em></p>
          <div className="personal-contact-flower" aria-hidden="true"><ArchiveMark /></div>
        </div>
        <div className="personal-directory">
          <span className="mono personal-directory-label">{text('FIND ME HERE', '이곳에서 만나요')}</span>
          {site.links.length > 0 ? (
            <ul>{site.links.map((link, index) => (
              <li key={link.url}>
                <a href={link.url} target={link.url.startsWith('mailto:') ? undefined : '_blank'} rel={link.url.startsWith('mailto:') ? undefined : 'noreferrer'}>
                  <span className="mono personal-directory-number">{String(index + 1).padStart(2, '0')}</span>
                  <span>{platformName(link.label.split(' · ')[0])}<small>{link.label.includes(' · ') ? link.label.split(' · ').slice(1).join(' · ') : link.url.startsWith('mailto:') ? link.url.slice(7) : text('Visit profile', '프로필 방문하기')}</small></span>
                  <ArrowUpRight aria-hidden="true" size={26} />
                  {!link.url.startsWith('mailto:') && <span className="sr-only">{text(' (opens in a new tab)', ' (새 탭에서 열립니다)')}</span>}
                </a>
              </li>
            ))}</ul>
          ) : <p className="personal-directory-empty">{text('Contact details will be added here when available.', '연락처가 준비되면 이곳에 안내할 예정입니다.')}</p>}
          <p className="personal-directory-note">{text('A small directory, with room to grow.', '천천히 넓혀 가는 작은 연결의 목록.')}</p>
        </div>
      </div>
      <div className="personal-contact-bottom"><span className="mono">{text('THANK YOU FOR VISITING', '찾아와 주셔서 감사합니다')}</span><p className="serif">{text('Leave a little curious.', '조금 더 궁금해졌기를.')}</p><Link className="text-link" to="/">{text('Return to the foyer', '처음으로 돌아가기')} <ArrowRight size={16} aria-hidden="true" /></Link></div>
    </div>
  );
}

export function CvPage() {
  const { text } = useLanguage();
  return (
    <div className="page-shell personal-page personal-cv">
      <SectionHeader eyebrow={text('PERSONAL FILE / CV', '개인 기록 / 이력서')} title={site.cvUrl ? text('The professional chapter.', '학력과 경력의 기록.') : text('A document, to come.', '한 장의 기록을 준비하며.')} description={text('The professional background, in one place.', '학력과 경력을 한곳에 담았습니다.')}/>
      <section className="personal-cv-panel" aria-labelledby="personal-cv-title">
        <div className="personal-cv-document" aria-hidden="true"><FileText size={50} strokeWidth={1} /><span className="mono">HANYEE JANG</span><span className="serif">{text('Curriculum', '학력과')}<br /><em>{text('vitae.', '경력.')}</em></span><i /><i /><i /></div>
        <div>
          <ArchiveLabel>{site.cvUrl ? text('AVAILABLE TO VIEW', '이력서 보기') : text('CV COMING SOON', '이력서 준비 중')}</ArchiveLabel>
          <h2 id="personal-cv-title" className="serif">{site.cvUrl ? text('The details, collected.', '자세한 이야기를 한곳에.') : text('One more piece of the archive.', '아카이브를 채울 또 하나의 기록.')}</h2>
          <p>{site.cvUrl ? text('View the full CV for education, experience, and professional background.', '전체 이력서에서 학력과 경력, 업무 경험을 확인하실 수 있습니다.') : text('The CV PDF hasn’t been added yet. You can find the current education and experience on the About page.', '이력서 PDF는 아직 등록되지 않았습니다. 현재 학력과 경력은 소개 페이지에서 확인하실 수 있습니다.')}</p>
          <div className="personal-cv-actions">{site.cvUrl && <CvLink className="button button-dark" />}<Link className={site.cvUrl ? 'text-link' : 'button button-dark'} to="/about">{text('View education & experience', '학력과 경력 보기')} <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
        </div>
      </section>
    </div>
  );
}
