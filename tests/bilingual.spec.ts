import { test as base, expect, type Page } from '@playwright/test'
import { articles, projects, site, type Article } from '../src/content/archive'
import { naverArticles } from '../src/content/naver'
import { naverTitleTranslations } from '../src/content/naver-translations'
import { existsSync } from 'node:fs'

type Locale = 'en' | 'ko'
const preferenceKey = 'living-archive.language'
const pageSize = 16
const naver = articles.filter(article => article.platform?.toLowerCase().includes('naver'))
  .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
const publishedProject = projects.find(project => project.status === 'published')!
const sections = [
  { route: 'about', en: 'About', ko: '소개', heading: { en: 'A person, in many parts.', ko: '여러 모습으로 이어지는 한 사람.' } },
  { route: 'projects', en: 'Projects', ko: '프로젝트', heading: { en: 'Made. Making. Imagining.', ko: '만들고, 그리고, 상상하고.' } },
  { route: 'art', en: 'Art', ko: '그림', heading: { en: 'A different kind of language.', ko: '말 대신, 색으로.' } },
  { route: 'writing', en: 'Writing', ko: '글', heading: { en: 'Between the lines.', ko: '문장 사이에서.' } },
  { route: 'journal', en: 'Journal', ko: '기록', heading: { en: 'Notes from the margins.', ko: '여백에 남긴 기록.' } },
  { route: 'contact', en: 'Contact', ko: '연락', heading: { en: 'A conversation starts here.', ko: '이곳에서 이야기를 시작해요.' } },
]

const test = base.extend<{ runtimeErrors: string[] }>({
  runtimeErrors: [async ({ page }, use) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await use(errors)
    expect(errors, 'Bilingual routes must not throw browser errors').toEqual([])
  }, { auto: true }],
})

function displayedTitle(article: Article, locale: Locale) {
  return locale === 'en' ? article.translations?.en?.title || article.title : article.title
}

function thumbnailUrl(path: string) {
  return /^(https?:|data:|blob:)/.test(path) ? path : `${process.env.VITE_BASE_PATH || '/'}${path.replace(/^\//, '')}`
}

function hashUrl(page: Page) {
  return new URL(new URL(page.url()).hash.slice(1), 'https://archive.invalid')
}

async function expectPath(page: Page, path: string) {
  await expect.poll(() => hashUrl(page).pathname).toBe(path)
}

async function expectLanguage(page: Page, locale: Locale) {
  await expect(page.locator('html')).toHaveAttribute('lang', locale)
  const active = page.getByRole('link', { name: locale === 'en' ? 'View website in English' : '한국어로 보기', exact: true })
  await expect(active).toHaveAttribute('aria-current', 'true')
}

async function navigateSection(page: Page, locale: Locale, label: string) {
  const menu = page.getByRole('button', { name: locale === 'en' ? 'Open menu' : '메뉴 열기', exact: true })
  if (await menu.isVisible()) {
    await menu.click()
    const navigation = page.getByRole('navigation', { name: locale === 'en' ? 'Mobile navigation' : '모바일 메뉴', exact: true })
    const link = navigation.getByRole('link').filter({ hasText: new RegExp(`${label}$`) })
    await link.click()
    await expect(navigation).toHaveCount(0)
  } else {
    const link = page.getByRole('navigation', { name: locale === 'en' ? 'Main navigation' : '주 메뉴', exact: true })
      .getByRole('link', { name: label, exact: true })
    await link.click()
    await expect(link).toHaveAttribute('aria-current', 'page')
  }
}

function writingRows(page: Page) {
  return page.getByRole('main').locator('.collection-article-list > article')
}

function sourceFilters(page: Page, locale: Locale) {
  return page.getByRole('group', { name: locale === 'en' ? 'Filter writing by source' : '출처별 글 보기', exact: true })
}

function searchInput(page: Page, locale: Locale) {
  return page.getByRole('searchbox', { name: locale === 'en' ? 'Search titles, excerpts and tags' : '제목, 미리보기, 태그 검색', exact: true })
}

async function expectNaverRows(page: Page, expected: Article[], locale: Locale) {
  const rows = writingRows(page)
  await expect(rows).toHaveCount(expected.length)
  for (const [index, article] of expected.entries()) {
    const row = rows.nth(index)
    const heading = row.getByRole('heading', { level: 2 })
    await expect(heading).toHaveAttribute('lang', locale)
    await expect(heading).toContainText(displayedTitle(article, locale))
    const originalTitle = row.locator('.collection-article-original-title')
    if (locale === 'en') {
      await expect(originalTitle).toHaveText(article.title)
      await expect(originalTitle).toHaveAttribute('lang', 'ko')
    } else {
      await expect(originalTitle).toHaveCount(0)
    }
    await expect(row.locator('.collection-article-excerpt')).toHaveText(article.excerpt)
    await expect(row.locator('.collection-article-excerpt')).toHaveAttribute('lang', 'ko')
    await expect(row.locator('time')).toHaveAttribute('datetime', article.date)
    await expect(row).toContainText(locale === 'en' ? 'Korean original' : '한국어 원문')
    const original = heading.getByRole('link')
    await expect(original).toHaveAttribute('href', article.externalUrl!)
    await expect(original).toHaveAttribute('target', '_blank')
    await expect(original).toHaveAttribute('rel', /noopener/)
    await expect(original).toHaveAttribute('rel', /noreferrer/)
    const thumbnail = row.locator('.collection-article-thumbnail img')
    if (article.thumbnail) {
      await expect(thumbnail).toHaveAttribute('src', thumbnailUrl(article.thumbnail))
      await expect(thumbnail).toHaveAttribute('alt', article.thumbnailAlt || '')
      await expect(thumbnail).toHaveAttribute('loading', 'lazy')
      await expect(thumbnail).toHaveAttribute('decoding', 'async')
      await expect(row.locator('.collection-article-thumbnail')).toHaveAttribute('href', article.externalUrl!)
    } else {
      await expect(thumbnail).toHaveCount(0)
      await expect(row).not.toHaveClass(/collection-article-with-thumbnail/)
    }
  }
  await expect(page.getByRole('main').locator('.collection-article-thumbnail img')).toHaveCount(expected.filter(article => article.thumbnail).length)
}

test('every imported Naver post has an English title and retains its original publication metadata', async () => {
  expect(naverArticles).toHaveLength(463)
  expect(naverArticles.filter(article => article.thumbnail)).toHaveLength(461)
  expect(naverArticles.filter(article => !article.thumbnail).map(article => article.sourceId).sort())
    .toEqual(['222872509258', '223162695085'])
  expect(Object.keys(naverTitleTranslations).sort()).toEqual(naverArticles.map(article => article.id).sort())
  expect(new Set(naverArticles.map(article => article.sourceId)).size).toBe(naverArticles.length)
  for (const original of naverArticles) {
    const article = naver.find(entry => entry.id === original.id)!
    expect(article.title).toBe(original.title)
    expect(article.excerpt).toBe(original.excerpt)
    expect(article.originalLanguage).toBe('ko')
    expect(article.externalUrl).toBe(`https://blog.naver.com/gksdl0311/${original.sourceId}`)
    const translation = article.translations?.en?.title
    expect(translation).toBe(naverTitleTranslations[article.id])
    expect(translation?.trim()).toBeTruthy()
    expect(translation).not.toMatch(/[가-힣]/)
    expect(translation).not.toBe(original.title)
    if (article.thumbnailSourceUrl) {
      expect(new URL(article.thumbnailSourceUrl).hostname).toMatch(/(^|\.)pstatic\.net$/)
      expect(article.thumbnail).toMatch(/^\/naver\/\d+\.(jpg|png|gif|webp)$/)
      expect(existsSync(`public${article.thumbnail}`), 'Original cover must be included in the static build').toBe(true)
    }
  }
})

for (const locale of ['en', 'ko'] as const) {
  test(`${locale} navigation reaches localized sections, index and CV`, async ({ page }) => {
    await page.goto(`/#/${locale}`)
    await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible()
    await expectLanguage(page, locale)
    for (const section of sections) {
      await navigateSection(page, locale, section[locale])
      await expectPath(page, `/${locale}/${section.route}`)
      await expectLanguage(page, locale)
      await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toHaveText(section.heading[locale])
    }
    await page.getByRole('link', { name: locale === 'en' ? 'Browse the archive index' : '아카이브 목차 보기', exact: true }).click()
    await expectPath(page, `/${locale}/index`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(locale === 'en' ? 'The index.' : '전체 목록.')
    const directory = page.getByRole('navigation', { name: locale === 'en' ? 'Collection directory' : '컬렉션 목록', exact: true })
    await expect(directory.getByRole('link')).toHaveCount(sections.length)
    for (const section of sections) {
      await expect(directory.locator(`a[href="#/${locale}/${section.route}"]`)).toHaveCount(1)
    }
    await page.goto(`/#/${locale}/cv`)
    await expectLanguage(page, locale)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(site.cvUrl
      ? locale === 'en' ? 'The professional chapter.' : '학력과 경력의 기록.'
      : locale === 'en' ? 'A document, to come.' : '한 장의 기록을 준비하며.')
  })

  test(`${locale} writing displays Naver covers, localized titles and source counts`, async ({ page }) => {
    await page.goto(`/#/${locale}/writing`)
    await expectLanguage(page, locale)
    const sources = sourceFilters(page, locale)
    await expect(sources.getByRole('button').filter({ hasText: locale === 'en' ? 'All sources' : '전체 출처' }).locator('span')).toHaveText(String(articles.length))
    const naverFilter = sources.getByRole('button').filter({ hasText: locale === 'en' ? 'Naver Blog' : '네이버 블로그' })
    await expect(naverFilter.locator('span')).toHaveText(String(naver.length))
    await naverFilter.click()
    await expect(naverFilter).toHaveAttribute('aria-pressed', 'true')
    await expect.poll(() => hashUrl(page).searchParams.get('source')).toBe('Naver Blog')
    await expectNaverRows(page, naver.slice(0, pageSize), locale)
    await expect(page.locator('#writing-results [aria-live="polite"]')).toHaveText(locale === 'en'
      ? `${naver.length} pieces · showing 1–${pageSize}`
      : `${naver.length}개의 글 · 1–${pageSize}번째 기록`)
  })

  test(`${locale} Naver search, empty results, pagination and reset work`, async ({ page }) => {
    await page.goto(`/#/${locale}/writing?source=Naver+Blog`)
    await expectNaverRows(page, naver.slice(0, pageSize), locale)
    const pagination = page.getByRole('navigation', { name: locale === 'en' ? 'Writing archive pages' : '글 아카이브 페이지', exact: true })
    const previous = pagination.getByRole('button', { name: locale === 'en' ? 'Previous page' : '이전 페이지', exact: true })
    await expect(previous).toBeDisabled()
    await pagination.getByRole('button', { name: locale === 'en' ? 'Next page' : '다음 페이지', exact: true }).click()
    await expect.poll(() => hashUrl(page).searchParams.get('page')).toBe('2')
    await expectNaverRows(page, naver.slice(pageSize, pageSize * 2), locale)
    await expect(previous).toBeEnabled()
    await expect(pagination.locator('[aria-current="page"]')).toHaveText('2')

    const query = naver[0].title
    await searchInput(page, locale).fill(query)
    await expect.poll(() => hashUrl(page).searchParams.get('page')).toBeNull()
    await expect.poll(() => hashUrl(page).searchParams.get('q')).toBe(query)
    await expect(writingRows(page).getByRole('heading').filter({ hasText: displayedTitle(naver[0], locale) })).toBeVisible()
    await expect(writingRows(page).first().locator('.collection-article-excerpt')).toHaveAttribute('lang', 'ko')
    // Either language of the title must locate the same original publication.
    const englishQuery = naver[0].translations!.en!.title!
    await searchInput(page, locale).fill(englishQuery)
    await expect.poll(() => hashUrl(page).searchParams.get('q')).toBe(englishQuery)
    await expect(writingRows(page)).toHaveCount(1)
    await expect(writingRows(page).getByRole('heading').filter({ hasText: displayedTitle(naver[0], locale) })).toBeVisible()

    await searchInput(page, locale).fill('no-such-archive-entry-7e1d48')
    await expect(writingRows(page)).toHaveCount(0)
    await expect(page.locator('#writing-results [aria-live="polite"]')).toHaveText(locale === 'en' ? 'No pieces found' : '찾은 글이 없어요')
    await expect(page.getByRole('heading', { name: locale === 'en' ? 'No matching thoughts, yet.' : '찾고 있는 생각이 아직 보이지 않네요.', exact: true })).toBeVisible()
    await page.getByRole('button', { name: locale === 'en' ? 'Clear search' : '검색어 지우기', exact: true }).click()
    await expect(searchInput(page, locale)).toHaveValue('')
    await expectNaverRows(page, naver.slice(0, pageSize), locale)

    const lastPage = Math.ceil(naver.length / pageSize)
    await pagination.getByRole('button', { name: locale === 'en' ? `Go to page ${lastPage}` : `${lastPage}페이지로 이동`, exact: true }).click()
    await expectNaverRows(page, naver.slice((lastPage - 1) * pageSize), locale)
    await expect(pagination.getByRole('button', { name: locale === 'en' ? 'Next page' : '다음 페이지', exact: true })).toBeDisabled()
    await page.reload()
    await expect.poll(() => hashUrl(page).searchParams.get('page')).toBe(String(lastPage))
    await expectNaverRows(page, naver.slice((lastPage - 1) * pageSize), locale)
    await page.getByRole('button', { name: locale === 'en' ? 'Reset filters' : '필터 초기화', exact: true }).click()
    await expect.poll(() => hashUrl(page).search).toBe('')
    await expect(writingRows(page)).toHaveCount(Math.min(pageSize, articles.length))
  })
}

test('switching language keeps project and Korean publication detail addresses', async ({ page }) => {
  await page.goto(`/#/en/projects/${publishedProject.id}`)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(publishedProject.title)
  await page.getByRole('link', { name: '한국어로 보기', exact: true }).click()
  await expectPath(page, `/ko/projects/${publishedProject.id}`)
  await expectLanguage(page, 'ko')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(publishedProject.translations?.ko?.title || publishedProject.title)
  await page.getByRole('link', { name: '모든 프로젝트', exact: true }).click()
  await expectPath(page, '/ko/projects')

  await page.goto('/#/en/writing?source=Naver+Blog')
  await writingRows(page).first().getByRole('link', { name: /^Archive note/ }).click()
  await expectPath(page, `/en/writing/${naver[0].id}`)
  for (const locale of ['en', 'ko'] as const) {
    if (locale === 'ko') await page.getByRole('link', { name: '한국어로 보기', exact: true }).click()
    await expectPath(page, `/${locale}/writing/${naver[0].id}`)
    await expectLanguage(page, locale)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(displayedTitle(naver[0], locale))
    await expect(page.getByRole('heading', { level: 1 })).toHaveAttribute('lang', locale)
    const originalTitle = page.locator('.detail-article-original-title')
    if (locale === 'en') {
      await expect(originalTitle).toHaveText(naver[0].title)
      await expect(originalTitle).toHaveAttribute('lang', 'ko')
    } else {
      await expect(originalTitle).toHaveCount(0)
    }
    await expect(page.locator('.detail-deck')).toHaveText(naver[0].excerpt)
    await expect(page.locator('.detail-deck')).toHaveAttribute('lang', 'ko')
    const original = page.getByRole('link', { name: locale === 'en' ? /Read the full piece on Naver Blog/ : /네이버 블로그에서 원문 읽기/ })
    await expect(original).toHaveAttribute('href', naver[0].externalUrl!)
    await expect(original).toHaveAttribute('target', '_blank')
    const thumbnail = page.locator('.detail-article-thumbnail img')
    if (naver[0].thumbnail) {
      await expect(thumbnail).toHaveAttribute('src', thumbnailUrl(naver[0].thumbnail))
      await expect(thumbnail).toHaveAttribute('loading', 'lazy')
    } else {
      await expect(thumbnail).toHaveCount(0)
    }
  }
})

test('language switching preserves writing source, category, search and current page', async ({ page }) => {
  // Choose a real, populous tag/category so page two contains genuine results.
  const combinations = new Map<string, { category: string; query: string; count: number }>()
  for (const article of naver) {
    for (const tag of article.tags || []) {
      const key = `${article.category}\0${tag}`
      const existing = combinations.get(key)
      combinations.set(key, { category: article.category, query: tag, count: (existing?.count || 0) + 1 })
    }
  }
  const selection = [...combinations.values()].sort((a, b) => b.count - a.count)[0]
  expect(selection.count).toBeGreaterThan(pageSize)
  const params = new URLSearchParams({ source: 'Naver Blog', category: selection.category, q: selection.query, page: '2' })
  await page.goto(`/#/en/writing?${params}`)
  await expect(writingRows(page)).toHaveCount(pageSize)
  const selectedArticles = naver.filter(article => article.category === selection.category && article.tags?.includes(selection.query)).slice(pageSize, pageSize * 2)
  await expectNaverRows(page, selectedArticles, 'en')
  await page.getByRole('link', { name: '한국어로 보기', exact: true }).click()
  await expectPath(page, '/ko/writing')
  await expectLanguage(page, 'ko')
  for (const [key, value] of params) {
    await expect.poll(() => hashUrl(page).searchParams.get(key)).toBe(value)
  }
  await expect(searchInput(page, 'ko')).toHaveValue(selection.query)
  await expect(sourceFilters(page, 'ko').getByRole('button').filter({ hasText: '네이버 블로그' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('navigation', { name: '글 아카이브 페이지', exact: true }).locator('[aria-current="page"]')).toHaveText('2')
  await expectNaverRows(page, selectedArticles, 'ko')
  await page.getByRole('link', { name: 'View website in English', exact: true }).click()
  await expectPath(page, '/en/writing')
  for (const [key, value] of params) {
    await expect.poll(() => hashUrl(page).searchParams.get(key)).toBe(value)
  }
  await expectNaverRows(page, selectedArticles, 'en')
})

test('Naver covers fit the archive at narrow mobile widths', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 })
  await page.goto('/#/en/writing?source=Naver+Blog')
  const article = writingRows(page).first()
  const thumbnail = article.locator('.collection-article-thumbnail')
  await expect(thumbnail).toBeVisible()
  const image = thumbnail.locator('img')
  await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  const imageBounds = await thumbnail.boundingBox()
  const copyBounds = await article.locator('.collection-article-copy').boundingBox()
  expect(imageBounds).not.toBeNull()
  expect(copyBounds).not.toBeNull()
  expect(imageBounds!.width / imageBounds!.height).toBeCloseTo(4 / 3, 1)
  expect(copyBounds!.y).toBeGreaterThanOrEqual(imageBounds!.y + imageBounds!.height)
  const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, viewport: window.innerWidth }))
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.viewport + 1)
})

test('saved preference supplies the default locale while explicit URLs take precedence', async ({ page }) => {
  await page.goto('/#/ko/about')
  await expectLanguage(page, 'ko')
  await expect.poll(() => page.evaluate(key => localStorage.getItem(key), preferenceKey)).toBe('ko')
  await page.goto('/#/')
  await expectPath(page, '/ko')
  await expectLanguage(page, 'ko')
  await page.reload()
  await expectPath(page, '/ko')
  await expectLanguage(page, 'ko')
  await page.goto('/#/en/about')
  await expectLanguage(page, 'en')
  await expect.poll(() => page.evaluate(key => localStorage.getItem(key), preferenceKey)).toBe('en')
  await page.goto('/#/')
  await expectPath(page, '/en')
  await expectLanguage(page, 'en')
})

test('legacy addresses retain their destination and writing parameters during locale redirects', async ({ page }) => {
  await page.goto('/#/about')
  await expectPath(page, '/en/about')
  await expectLanguage(page, 'en')
  await page.getByRole('link', { name: '한국어로 보기', exact: true }).click()
  await expectPath(page, '/ko/about')
  await expectLanguage(page, 'ko')
  await expect.poll(() => page.evaluate(key => localStorage.getItem(key), preferenceKey)).toBe('ko')
  const query = new URLSearchParams({ source: 'Naver Blog', q: '런던', page: '2' })
  for (const route of ['/about', `/projects/${publishedProject.id}`, `/writing?${query}`]) {
    await page.goto(`/#${route}`)
    await expectPath(page, `/ko${route.split('?')[0]}`)
    await expectLanguage(page, 'ko')
    if (route.startsWith('/writing')) {
      for (const [key, value] of query) {
        await expect.poll(() => hashUrl(page).searchParams.get(key)).toBe(value)
      }
      await expect(searchInput(page, 'ko')).toHaveValue('런던')
    }
  }
  await page.goto('/#/not-a-page')
  await expectPath(page, '/ko/not-a-page')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('길을 잃었나요?')
  await page.getByRole('link', { name: /목차로 돌아가기/ }).click()
  await expectPath(page, '/ko/index')
})
