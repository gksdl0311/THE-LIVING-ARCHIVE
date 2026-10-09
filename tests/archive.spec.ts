import { test as base, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { articles, projects, artworks, journalEntries } from '../src/content/archive'
import { naverArticles } from '../src/content/naver'

const test = base.extend<{ runtimeErrors: string[] }>({
  runtimeErrors: [async ({ page }, use) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    await use(errors)
    expect(errors, 'Browser runtime and console errors').toEqual([])
  }, { auto: true }],
})

const sections = [
  { label: 'About', path: '/about', heading: 'A person, in many parts.' },
  { label: 'Projects', path: '/projects', heading: 'Made. Making. Imagining.' },
  { label: 'Art', path: '/art', heading: 'A different kind of language.' },
  { label: 'Writing', path: '/writing', heading: 'Between the lines.' },
  { label: 'Journal', path: '/journal', heading: 'Notes from the margins.' },
  { label: 'Contact', path: '/contact', heading: 'A conversation starts here.' },
]

async function goTo(page: Page, path: string, language: 'en' | 'ko' = 'en') {
  await page.goto(`/#/${language}${path === '/' ? '' : path}`)
  const headings: Record<string, string | RegExp> = {
    '/': /everything.*nothing/,
    '/index': 'The index.',
    '/cv': 'A document, to come.',
    '/projects/rena-seulgi-jang': 'Rena Seulgi Jang — Official Website',
    '/projects/hori-and-kkachi': 'Hori & Kkachi',
    ...Object.fromEntries(sections.map((section) => [section.path, section.heading])),
  }
  const collection = path.split('/')[1]
  const isMissingEntry = path.split('/').length === 3
  const heading = headings[path] || (isMissingEntry ? collection === 'journal' ? /This page isn’t in.*the collection/ : /This page has.*left the shelf/ : 'A little lost?')
  await expect(page.getByRole('main').getByRole('heading', { level: 1, ...(language === 'en' ? { name: heading } : {}) })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('lang', language)
  if (language === 'en' && isMissingEntry && !headings[path]) {
    await expect(page.getByRole('main')).toContainText(collection === 'journal' ? 'NO ENTRY FOUND' : `the ${collection} collection`)
  }
  // Wait for the page fade to finish so layout and contrast are measured as a visitor sees them.
  await expect(page.getByRole('main').locator(':scope > div')).toHaveCSS('opacity', '1')
}

async function expectRoute(page: Page, path: string, language: 'en' | 'ko' = 'en') {
  await expect.poll(() => new URL(page.url()).hash).toBe(`#/${language}${path === '/' ? '' : path}`)
}

test('all main sections can be reached through navigation and the archive index', async ({ page }) => {
  await goTo(page, '/')
  for (const section of sections) {
    const menu = page.getByRole('button', { name: 'Open menu', exact: true })
    if (await menu.isVisible()) {
      await menu.click()
      await page.getByRole('navigation', { name: 'Mobile navigation', exact: true })
        .getByRole('link').filter({ hasText: new RegExp(`${section.label}$`) }).click()
      await expect(page.getByRole('navigation', { name: 'Mobile navigation', exact: true })).toHaveCount(0)
    } else {
      const link = page.getByRole('navigation', { name: 'Main navigation', exact: true })
        .getByRole('link', { name: section.label, exact: true })
      await link.click()
      await expect(link).toHaveAttribute('aria-current', 'page')
    }
    await expectRoute(page, section.path)
    await expect(page.getByRole('heading', { level: 1, name: section.heading, exact: true })).toBeVisible()
    await expect(page).toHaveTitle(new RegExp(section.label))
    await expect(page.getByRole('main')).toBeFocused()
  }

  await page.getByRole('link', { name: 'Browse the archive index', exact: true }).click()
  await expectRoute(page, '/index')
  const directory = page.getByRole('navigation', { name: 'Collection directory', exact: true })
  await expect(directory.getByRole('link')).toHaveCount(6)
  await expect(directory).toContainText('1 published · 6 in preparation')
  await directory.getByRole('link').filter({ hasText: 'Projects' }).click()
  await expectRoute(page, '/projects')
  await page.getByRole('link', { name: 'Hanyee Jang, home', exact: true }).click()
  await expectRoute(page, '/')
})

test('project categories show the correct work and the filter can be reset', async ({ page }) => {
  await goTo(page, '/projects')
  const filters = page.getByRole('group', { name: 'Filter projects by category', exact: true })
  const cases = [
    { label: 'All', count: 7 },
    { label: 'Websites & Digital', count: 1 },
    { label: 'Marketing & Communications', count: 1 },
    { label: 'Research & Data', count: 4 },
    { label: 'Independent Projects', count: 1 },
    { label: 'All', count: 7 },
  ]
  for (const item of cases) {
    const filter = filters.getByRole('button', { name: item.label, exact: true })
    await filter.click()
    await expect(filter).toHaveAttribute('aria-pressed', 'true')
    await expect(filters.locator('[aria-pressed="true"]')).toHaveCount(1)
    await expect(page.getByRole('main').getByRole('article')).toHaveCount(item.count)
    await expect(page.getByRole('main').locator('[aria-live="polite"]'))
      .toHaveText(`${String(item.count).padStart(2, '0')} ${item.count === 1 ? 'entry' : 'entries'}`)
    if (item.label !== 'All') {
      for (const row of await page.getByRole('main').getByRole('article').all()) {
        await expect(row).toContainText(item.label)
      }
    }
  }
})

test('the published project has its real destination and planned work stays labelled', async ({ page }) => {
  await goTo(page, '/projects')
  await page.getByRole('heading', { level: 2, name: 'Rena Seulgi Jang — Official Website', exact: true })
    .getByRole('link').click()
  await expectRoute(page, '/projects/rena-seulgi-jang')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Rena Seulgi Jang — Official Website')
  await expect(page.getByRole('complementary', { name: 'Project details' })).toContainText('Published')
  const liveProject = page.getByRole('link', { name: /Visit the live project/ })
  await expect(liveProject).toHaveAttribute('href', 'https://gksdl0311.github.io/renaseulgijang/en/')
  await expect(liveProject).toHaveAttribute('target', '_blank')
  await expect(liveProject).toHaveAttribute('rel', /noopener/)
  await expect(page.getByRole('main')).toContainText('original project screenshots will be added')
  await page.getByRole('link', { name: 'All projects', exact: true }).click()
  await page.getByRole('heading', { level: 2, name: 'Hori & Kkachi', exact: true }).getByRole('link').click()
  await expectRoute(page, '/projects/hori-and-kkachi')
  await expect(page.getByRole('complementary', { name: 'Project details' })).toContainText('Planned collection')
  await expect(page.getByRole('main')).toContainText('verified outcomes will be added')
  await expect(page.getByRole('link', { name: /Visit the live project/ })).toHaveCount(0)
})

test('Surprise me opens published work from the home page and index', async ({ page }) => {
  for (const route of ['/', '/index', '/']) {
    await goTo(page, route)
    await page.getByRole('button', { name: /Surprise me/ }).first().click()
    await expect.poll(() => new URL(page.url()).hash).toMatch(/^#\/en\/(projects|art|writing|journal)\//)
    const [, collection, id] = new URL(page.url()).hash.replace('#/en', '').split('/')
    await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible()
    if (collection === 'projects') {
      const project = projects.find(item => item.id === id)
      expect(project?.status).toBe('published')
      await expect(page.getByRole('complementary', { name: 'Project details' })).toContainText('Published')
    } else if (collection === 'writing') {
      const article = articles.find(item => item.id === id)
      expect(article, 'Surprise Me should open a real article').toBeDefined()
      expect(Boolean(article?.body?.length || article?.externalUrl)).toBe(true)
      if (article?.externalUrl) await expect(page.getByRole('main').getByRole('link', { name: /Read .* on/ })).toHaveAttribute('href', article.externalUrl)
    } else if (collection === 'art') {
      expect(artworks.some(item => item.id === id && item.image)).toBe(true)
    } else {
      expect(journalEntries.some(item => item.id === id && item.body.length)).toBe(true)
    }
  }
})

test('empty collections and the missing CV tell visitors what is available', async ({ page }) => {
  await goTo(page, '/art')
  await expect(page.getByRole('main')).toContainText('No artwork has been added to the archive yet.')
  await expect(page.getByRole('main').getByRole('img')).toHaveCount(0)
  await expect(page.getByRole('link', { name: /Follow @paintwithhanyee/ }))
    .toHaveAttribute('href', 'https://www.instagram.com/paintwithhanyee/')

  await goTo(page, '/journal')
  await expect(page.getByRole('main')).toContainText('The first notes are still to come.')
  await expect(page.getByRole('main').getByRole('time')).toHaveCount(0)

  await goTo(page, '/about')
  await page.getByRole('main').getByRole('link', { name: 'CV coming soon', exact: true }).click()
  await expectRoute(page, '/cv')
  await expect(page.getByRole('main')).toContainText('The CV PDF hasn’t been added yet.')
  await expect(page.getByRole('main').locator('a[href$=".pdf"]')).toHaveCount(0)
  await page.getByRole('link', { name: 'View education & experience', exact: true }).click()
  await expectRoute(page, '/about')
  await expect(page.getByRole('main')).toContainText('King’s College London')
  await expect(page.getByRole('main')).toContainText('Client Services Administrator Intern')
})

test('writing previews can be narrowed by source, paginated, searched and reset', async ({ page }) => {
  await goTo(page, '/writing')
  const main = page.getByRole('main')
  await expect(main.getByRole('article')).toHaveCount(16)
  const sourceFilters = page.getByRole('group', { name: 'Filter writing by source', exact: true })
  const naverFilter = sourceFilters.getByRole('button', { name: /^Naver Blog/ })
  await expect(naverFilter).toContainText(String(naverArticles.length))
  await naverFilter.click()
  await expect(naverFilter).toHaveAttribute('aria-pressed', 'true')
  await expect(main.locator('[aria-live="polite"]')).toHaveText(`${naverArticles.length} pieces · showing 1–16`)
  const firstTitle = await main.getByRole('article').first().getByRole('heading', { level: 2 }).innerText()
  await page.getByRole('button', { name: 'Next page', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Go to page 2', exact: true })).toHaveAttribute('aria-current', 'page')
  await expect(main.locator('[aria-live="polite"]')).toHaveText(`${naverArticles.length} pieces · showing 17–32`)
  await expect(main.getByRole('article').first().getByRole('heading', { level: 2 })).not.toHaveText(firstTitle)
  await page.getByRole('searchbox', { name: 'Search titles, excerpts and tags', exact: true }).fill(naverArticles[0].title)
  const firstArticle = articles.find(article => article.id === naverArticles[0].id)!
  await expect(main.getByRole('heading', { level: 2 }).filter({ hasText: firstArticle.translations!.en!.title! })).toBeVisible()
  await expect(main.locator('.collection-article-original-title')).toHaveText(naverArticles[0].title)
  await expect(main.getByRole('article')).toHaveCount(1)
  await expect(main.getByRole('img')).toHaveCount(firstArticle.thumbnail ? 1 : 0)
  await page.getByRole('button', { name: 'Reset filters', exact: true }).click()
  await expect(sourceFilters.getByRole('button', { name: /^All sources/ })).toHaveAttribute('aria-pressed', 'true')
  await expect(main.locator('[aria-live="polite"]')).toHaveText(`${articles.length} pieces · showing 1–16`)
})

test('unknown collection entries and addresses have a useful way back', async ({ page }) => {
  for (const collection of ['projects', 'art', 'writing', 'journal']) {
    await goTo(page, `/${collection}/not-an-entry`)
    await expect(page.getByRole('main')).toContainText(collection === 'journal' ? 'No entry found' : '404', { ignoreCase: true })
    await expect(page).toHaveTitle('Not found — The Living Archive')
    await page.getByRole('main').getByRole('link').click()
    await expectRoute(page, `/${collection}`)
  }
  await goTo(page, '/not-a-page')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A little lost?')
  await page.getByRole('link', { name: /Back to the index/ }).click()
  await expectRoute(page, '/index')
})

test('keyboard users can skip the navigation and explore the collections with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await goTo(page, '/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content', exact: true })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('main')).toBeFocused()
  await page.getByRole('link', { name: 'Explore the archive', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Explore the collections', exact: true })).toBeFocused()
  await expect(page.getByRole('region', { name: 'Explore the collections', exact: true })).toBeInViewport()
})

test('mobile menu supports keyboard dismissal and closes after following a link', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await goTo(page, '/')
  const open = page.getByRole('button', { name: 'Open menu', exact: true })
  await open.focus()
  await page.keyboard.press('Enter')
  const mobileNavigation = page.getByRole('navigation', { name: 'Mobile navigation', exact: true })
  await expect(mobileNavigation).toBeVisible()
  await expect(mobileNavigation.getByRole('link').first()).toBeFocused()
  await expect(page.getByRole('button', { name: 'Close menu', exact: true })).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Escape')
  await expect(mobileNavigation).toHaveCount(0)
  await expect(open).toBeFocused()
  await open.click()
  await mobileNavigation.getByRole('link').filter({ hasText: /Projects$/ }).click()
  await expectRoute(page, '/projects')
  await expect(mobileNavigation).toHaveCount(0)
  await expect(open).toHaveAttribute('aria-expanded', 'false')
  await expect(page.getByRole('main')).toBeFocused()
})

test('About timeline navigation keeps its route and focuses the destination', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await goTo(page, '/about')
  await page.getByRole('link', { name: 'The path so far', exact: true }).click()
  await expectRoute(page, '/about')
  const timeline = page.getByRole('region', { name: 'The path so far.', exact: true })
  await expect(timeline).toBeFocused()
  await expect(timeline).toBeInViewport()
})

test('the footer discovery can be opened and closed', async ({ page }) => {
  await goTo(page, '/')
  await page.getByRole('button', { name: 'Find a little discovery', exact: true }).click()
  await expect(page.getByRole('status')).toHaveText('You found a little corner of the archive. Stay curious.')
  const close = page.getByRole('button', { name: 'Hide the little discovery', exact: true })
  await expect(close).toHaveAttribute('aria-expanded', 'true')
  await close.click()
  await expect(page.getByRole('status')).toHaveCount(0)
})

for (const language of ['en', 'ko'] as const) {
 for (const width of [320, 390, 768, 1440]) {
  test(`all ${language} pages fit a ${width}px viewport without horizontal scrolling`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    for (const path of ['/', ...sections.map((section) => section.path), '/index', '/cv', '/projects/rena-seulgi-jang', '/projects/hori-and-kkachi']) {
      await goTo(page, path, language)
      await page.evaluate(() => document.fonts.ready)
      const size = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, viewport: window.innerWidth }))
      expect(size.page, `/${language}${path} at ${width}px`).toBeLessThanOrEqual(size.viewport)
    }
  })
 }
}

test('home layout screenshots are available for desktop and mobile review', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await goTo(page, '/')
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: `/tmp/living-archive-${testInfo.project.name}.png`, fullPage: true, animations: 'disabled' })
})

test('the populated routes pass automated WCAG accessibility checks', async ({ page }, testInfo) => {
  test.setTimeout(180_000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const issues: { path: string; id: string; impact: string | null | undefined; nodes: { target: string[]; failureSummary: string | undefined }[] }[] = []
  const routes = [
    ...['/', ...sections.map((section) => section.path), '/index', '/cv', '/projects/rena-seulgi-jang', '/projects/hori-and-kkachi'].map(path => ({ path, language: 'en' as const })),
    ...['/', '/writing', '/about', '/projects/rena-seulgi-jang'].map(path => ({ path, language: 'ko' as const })),
  ]
  for (const { path, language } of routes) {
    await goTo(page, path, language)
    await page.evaluate(() => document.fonts.ready)
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    issues.push(...result.violations.map((violation) => ({
      path: `/${language}${path}`,
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.map((node) => ({ target: node.target as string[], failureSummary: node.failureSummary })),
    })))
  }
  await testInfo.attach('accessibility-results', { body: JSON.stringify(issues, null, 2), contentType: 'application/json' })
  expect(issues).toEqual([])
})
