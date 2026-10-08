/**
 * The archive's single content source.
 *
 * Only add facts, images and links that have been supplied or verified. Planned
 * projects remain visible as plans; Surprise Me must only use published work.
 * Put original images and PDFs in public/, then reference them with / paths.
 */
import { naverArticles } from './naver'
import { projectTranslations, experienceTranslations, educationTranslations, currentTranslations } from './translations'

export type ProjectCategory =
  | 'Marketing & Communications'
  | 'Websites & Digital'
  | 'Research & Data'
  | 'Independent Projects'

export type PublicationStatus = 'published' | 'in-progress' | 'planned'

/** Optional translations can be added without changing an item's stable ID. */
export interface Translation {
  title?: string
  summary?: string
  description?: string
  excerpt?: string
  body?: string[]
  sections?: { title: string; body: string }[]
  organisation?: string
  role?: string
  institution?: string
  degree?: string
  label?: string
  text?: string
}

export interface Localizable {
  language?: string
  translations?: Record<string, Translation>
}

export interface GalleryImage {
  image: string
  caption: string
  alt: string
}

export interface Project extends Localizable {
  id: string
  number: string
  title: string
  year?: string
  category: ProjectCategory
  status: PublicationStatus
  summary: string
  description: string
  role?: string
  tools?: string[]
  externalUrl?: string
  thumbnail?: string
  sections: { title: string; body: string }[]
  /** Original project screenshots; never use invented project imagery. */
  gallery?: GalleryImage[]
  featured?: boolean
}

export interface Artwork extends Localizable {
  id: string
  number: string
  title: string
  year?: string
  medium?: string
  dimensions?: string
  description: string
  image: string
  category: string
  /** Original sketches, studies or photographs of the making process. */
  process?: GalleryImage[]
  featured?: boolean
}

export interface Article extends Localizable {
  sourceId?: string
  originalLanguage?: 'en' | 'ko'
  tags?: string[]
  id: string
  number: string
  title: string
  date: string
  category: string
  excerpt: string
  platform?: string
  externalUrl?: string
  body?: string[]
  featured?: boolean
}

export interface JournalEntry extends Localizable {
  id: string
  title: string
  date: string
  category: string
  body: string[]
  image?: string
  imageAlt?: string
}

export interface Experience extends Localizable {
  organisation: string
  role: string
  period: string
  description?: string
}

export interface Education extends Localizable {
  institution: string
  degree: string
  period?: string
}

export interface SkillGroup {
  category: string
  items: string[]
}

export interface Exhibition {
  title: string
  year: string
  venue: string
}

export interface CurrentNote extends Localizable {
  label: string
  text: string
  href?: string
}

export interface SiteConfig {
  name: string
  archiveTitle: string
  tagline: string
  description: string
  cvUrl: string | null
  artistStatement?: string
  links: { label: string; url: string }[]
  location?: string
}

export const site: SiteConfig = {
  name: 'Hanyee Jang',
  archiveTitle: 'The Living Archive',
  tagline: "An ongoing collection of things I've made, thought, and loved.",
  description: 'Art, ideas, work, words and other curiosities. An evolving personal archive of Hanyee Jang.',
  cvUrl: null,
  links: [
    { label: 'Instagram · @paintwithhanyee', url: 'https://www.instagram.com/paintwithhanyee/' },
    { label: 'Naver Blog · @gksdl0311', url: 'https://blog.naver.com/gksdl0311' },
    { label: 'Substack · The Business Behind It', url: 'https://thebusinessbehindit.substack.com' },
  ],
}

export const projectCategories: ProjectCategory[] = [
  'Marketing & Communications',
  'Websites & Digital',
  'Research & Data',
  'Independent Projects',
]

export const articleCategories: string[] = [
  'Business & Brands',
  'Essays',
  'Personal Reflections',
  'Film, Art & Culture',
  'Other Writing',
]

export const projects: Project[] = ([
  {
    id: 'rena-seulgi-jang',
    number: 'P—001',
    title: 'Rena Seulgi Jang — Official Website',
    category: 'Websites & Digital',
    status: 'published',
    summary: 'An official website for opera singer Rena Seulgi Jang, in English, Korean and German.',
    description: 'A multilingual website project for opera singer Rena Seulgi Jang. The live website is available in English, Korean and German; a fuller account of the project will be added here.',
    externalUrl: 'https://gksdl0311.github.io/renaseulgijang/en/',
    sections: [
      {
        title: 'Project overview',
        body: 'An official multilingual website for opera singer Rena Seulgi Jang. Visit the live site to explore the published project.',
      },
      {
        title: 'Three languages, one website',
        body: 'The website includes English, Korean and German versions. A closer look at the multilingual structure and language navigation is coming to the archive.',
      },
      {
        title: 'Inside the case study',
        body: 'Original screenshots and notes on the creative process are coming soon. This case study will grow to include the role, design decisions, tools and lessons behind the website.',
      },
    ],
    featured: true,
  },
  {
    id: '180-degrees-communications',
    number: 'P—002',
    title: '180 Degrees Consulting',
    category: 'Marketing & Communications',
    status: 'planned',
    summary: 'A planned collection of communications and content work.',
    description: 'A space prepared for social media carousels, Instagram reels, promotional graphics and marketing communications associated with 180 Degrees Consulting at King’s College London.',
    sections: [
      {
        title: 'Collection in preparation',
        body: 'The archive is ready for real communications work. Assets, publication dates, responsibilities and context will be added when available.',
      },
    ],
  },
  {
    id: 'brand-analysis-series',
    number: 'P—003',
    title: 'Brand Analysis Series',
    category: 'Research & Data',
    status: 'planned',
    summary: 'A planned series examining brands, consumers and commercial decisions.',
    description: 'A future collection of independent brand and business analyses across marketing strategy, consumer behaviour and commercial decision-making.',
    sections: [
      {
        title: 'Research to come',
        body: 'This planned collection will bring together individual analyses, their sources and the questions behind them. Completed pieces will appear here as they become available.',
      },
    ],
  },
  {
    id: 'premier-league-analysis',
    number: 'P—004',
    title: 'Premier League Analysis',
    category: 'Research & Data',
    status: 'planned',
    summary: 'A planned data project exploring the Premier League.',
    description: 'A prepared entry in the Data & Analytics collection. The dataset, research question, methods and findings have not yet been supplied.',
    sections: [
      {
        title: 'Data & Analytics',
        body: 'The wider collection is planned to explore Excel, SQL and Power BI. The research question, dataset and visualisations for this project will join the archive as the work develops.',
      },
      {
        title: 'Project in preparation',
        body: 'The dataset, process and original visuals are still to come. The finished analysis will appear here when it is ready.',
      },
    ],
  },
  {
    id: 'netflix-analysis',
    number: 'P—005',
    title: 'Netflix Analysis',
    category: 'Research & Data',
    status: 'planned',
    summary: 'A planned data project exploring Netflix.',
    description: 'A prepared entry in the Data & Analytics collection. The dataset, research question, methods and findings have not yet been supplied.',
    sections: [
      {
        title: 'Project in preparation',
        body: 'A Netflix analysis is planned for this collection. The research question, source data and findings are still to come.',
      },
    ],
  },
  {
    id: 'london-transport-analysis',
    number: 'P—006',
    title: 'London Transport Analysis',
    category: 'Research & Data',
    status: 'planned',
    summary: 'A planned data project exploring London transport.',
    description: 'A prepared entry in the Data & Analytics collection. The dataset, research question, methods and findings have not yet been supplied.',
    sections: [
      {
        title: 'Project in preparation',
        body: 'A London transport analysis is planned for this collection. The research question, source data and findings are still to come.',
      },
    ],
  },
  {
    id: 'hori-and-kkachi',
    number: 'P—007',
    title: 'Hori & Kkachi',
    category: 'Independent Projects',
    status: 'planned',
    summary: 'A storytelling project inspired by Korean traditional folk painting.',
    description: 'A planned creative project bringing together illustration, character design and animation, inspired by Korean traditional folk painting.',
    sections: [
      {
        title: 'A story taking shape',
        body: 'The archive is prepared for original illustrations, character studies and animation. Process notes and finished work will be added as the project develops.',
      },
    ],
  },
 ] satisfies Project[]).map(project => ({ ...project, translations: { ko: projectTranslations[project.id] } }))

// Keep these collections empty until real content and original assets exist.
export const artworks: Artwork[] = []
export const articles: Article[] = [...naverArticles].sort((a,b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id))
export const journalEntries: JournalEntry[] = []
export const skills: SkillGroup[] = []
export const exhibitions: Exhibition[] = []

export const experiences: Experience[] = ([
  {
    organisation: 'Vistex',
    role: 'Client Services Administrator Intern',
    period: '2025–2026',
  },
  {
    organisation: '180 Degrees Consulting at King’s College London',
    role: 'Marketing Associate',
    period: '2026–2027',
  },
 ] satisfies Experience[]).map(item => ({ ...item, translations: { ko: experienceTranslations[item.organisation] } }))

export const education: Education[] = ([
  {
    institution: 'King’s College London',
    degree: 'BSc International Management',
  },
 ] satisfies Education[]).map(item => ({ ...item, translations: { ko: educationTranslations[item.institution] } }))

export const currently: CurrentNote[] = ([
  {
    label: 'An open collection',
    text: 'This archive is growing. New work, paintings and words will find a home here.',
  },
  {
    label: 'On the drawing board',
    text: 'Hori & Kkachi: a planned storytelling project inspired by Korean folk painting.',
    href: '/projects/hori-and-kkachi',
  },
  {
    label: 'A multilingual thread',
    text: 'The Rena Seulgi Jang website brings together English, Korean and German.',
    href: '/projects/rena-seulgi-jang',
  },
 ] satisfies CurrentNote[]).map(item => ({ ...item, translations: { ko: currentTranslations[item.label] } }))
