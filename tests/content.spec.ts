import { test, expect } from '@playwright/test'

// Browser-only fixtures exercise missing-asset content systems without adding
// invented paintings, publications or contact details to the website.
test.beforeEach(async ({ page }) => {
  await page.route('**/src/content/archive.ts*', async route => {
    const response = await route.fetch()
    const fixture = `
      artworks.push({id:'test-work',number:'A—TEST',title:'Test artwork',year:'2026',medium:'Test medium',dimensions:'20 × 30 cm',category:'Test collection',description:'Browser-only fixture.',image:'/test-fixture.svg',featured:true,process:[{image:'/test-fixture.svg',alt:'Test process image',caption:'Process fixture'}]});
      artworks.push({id:'test-work-two',number:'A—TEST2',title:'Second test artwork',category:'Another collection',description:'Browser-only fixture.',image:'/test-fixture.svg'});
      site.artistStatement='A browser-only artist statement for functional validation.';
      articles.push({id:'test-essay',number:'W—TEST',title:'생각을 담은 글',date:'2026-10-08',category:'Essays',excerpt:'테스트 글입니다.',language:'ko',body:['한국어 본문이 올바르게 표시됩니다.','This paragraph checks the editorial reading layout.'],featured:true});
      articles.push({id:'test-external',number:'W—TEST2',title:'External test piece',date:'2026-10-08',category:'Film, Art & Culture',excerpt:'An external-publication fixture.',platform:'Test publication',externalUrl:'https://example.com/test-article'});
      articles.push({id:'test-substack',number:'S—TEST',title:'Browser-only Substack fixture',date:'2026-10-08',category:'Business & Brands',excerpt:'An image-free external-publication fixture.',platform:'Substack · The Business Behind It',language:'en',originalLanguage:'en',externalUrl:'https://example.com/test-substack'});
      articles.push({id:'test-naver-no-cover',number:'N—TEST',title:'표지 없는 네이버 테스트 글',date:'2026-10-08',category:'Personal Reflections',excerpt:'이미지가 없는 원문 미리보기입니다.',platform:'Naver Blog',language:'ko',originalLanguage:'ko',externalUrl:'https://example.com/test-naver-no-cover',translations:{en:{title:'Browser-only Naver post without a cover'}}});
      articles.push({id:'test-naver-failed-cover',number:'N—TEST2',title:'표지가 열리지 않는 네이버 테스트 글',date:'2026-10-08',category:'Personal Reflections',excerpt:'표지가 열리지 않아도 읽을 수 있는 미리보기입니다.',platform:'Naver Blog',language:'ko',originalLanguage:'ko',externalUrl:'https://example.com/test-naver-failed-cover',thumbnail:'/test-failed-cover.png',thumbnailAlt:'Broken browser-only cover',translations:{en:{title:'Browser-only Naver failed cover'}}});
      journalEntries.push({id:'test-note',title:'A test note',date:'2026-10-08',category:'Test category',body:['A browser-only journal paragraph.'],image:'/test-fixture.svg',imageAlt:'Fixture journal image'});
      site.cvUrl='/test-cv.pdf';
    `
    await route.fulfill({ response, body: `${await response.text()}\n${fixture}` })
  })
  await page.route('**/test-fixture.svg', route => route.fulfill({ contentType:'image/svg+xml', body:'<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"><rect width="200" height="300" fill="#8b9773"/></svg>' }))
  // Invalid image bytes deliberately exercise the image-error fallback, without
  // relying on the external CDN or suppressing application runtime errors.
  await page.route('**/test-failed-cover.png', route => route.fulfill({ contentType: 'image/png', body: 'not-a-decodable-image' }))
})

test('original artwork filters, metadata and process galleries work with supplied content', async ({ page }) => {
  await page.goto('/#/en/art')
  await expect(page.getByText('A browser-only artist statement')).toBeVisible()
  await page.getByRole('button', { name:'Test collection', exact:true }).click()
  await expect(page.getByRole('heading', { name:'Test artwork', exact:true })).toBeVisible()
  await expect(page.getByRole('heading', { name:'Second test artwork' })).toHaveCount(0)
  await page.getByRole('link', { name:'View Test artwork', exact:true }).click()
  await expect(page.getByRole('heading', { name:'Test artwork', exact:true })).toBeVisible()
  await expect(page.getByText('20 × 30 cm', { exact:true })).toBeVisible()
  await expect(page.getByRole('img', { name:'Test process image' })).toBeVisible()
  const image = page.getByRole('img', { name:'Test artwork', exact:true })
  const ratio = await image.evaluate(img => { const bounds=img.getBoundingClientRect();return bounds.width/bounds.height })
  expect(ratio).toBeCloseTo(2/3, 1)
})

test('Korean writing, on-site articles and external publications work', async ({ page }) => {
  await page.goto('/#/en/writing')
  await page.getByRole('button', {name:'Essays', exact:true}).click()
  await expect(page.getByRole('heading', {name:'External test piece'})).toHaveCount(0)
  await page.getByRole('link', {name:'생각을 담은 글', exact:true}).click()
  await expect(page.getByText('한국어 본문이 올바르게 표시됩니다.', {exact:true})).toBeVisible()
  await expect(page.getByText('1 min read', {exact:true})).toBeVisible()
  await expect(page.locator('.detail-article')).toHaveAttribute('lang','en')
  await expect(page.locator('.detail-article-body > p').first()).toHaveAttribute('lang','ko')
  await page.goto('/#/en/writing/test-external')
  await expect(page.getByRole('link', {name:/Read the full piece/})).toHaveAttribute('href','https://example.com/test-article')
})

test('journal dates and CV links render correctly once supplied', async ({ page }) => {
  await page.goto('/#/en/journal')
  await page.getByRole('link', {name:/A test note/}).click()
  await expect(page.getByText('8 October 2026', {exact:true})).toBeVisible()
  await expect(page.getByRole('img', {name:'Fixture journal image'})).toBeVisible()
  await expect(page.getByText('A browser-only journal paragraph.',{exact:true})).toBeVisible()
  await page.goto('/#/en/cv')
  await expect(page.getByRole('link',{name:/View CV/})).toHaveAttribute('href','/test-cv.pdf')
})

test('image-free Substack entries keep their English text in both website languages', async ({ page }) => {
  for (const locale of ['en', 'ko']) {
    await page.goto(`/#/${locale}/writing?source=Substack`)
    const row = page.locator('.collection-article-list > article')
    await expect(row).toHaveCount(1)
    const heading = row.getByRole('heading', { name: /Browser-only Substack fixture/ })
    await expect(heading).toHaveAttribute('lang', 'en')
    await expect(row.locator('.collection-article-excerpt')).toHaveText('An image-free external-publication fixture.')
    await expect(row.locator('.collection-article-excerpt')).toHaveAttribute('lang', 'en')
    await expect(heading.getByRole('link')).toHaveAttribute('href', 'https://example.com/test-substack')
    await expect(heading.getByRole('link')).toHaveAttribute('target', '_blank')
    await expect(page.getByRole('main').locator('img')).toHaveCount(0)
    await expect(row).toContainText(locale === 'ko' ? '영어 원문' : 'English original')
  }
})

test('Naver posts without original covers keep a readable text layout in both languages', async ({ page }) => {
  for (const locale of ['en', 'ko']) {
    await page.goto(`/#/${locale}/writing?source=Naver+Blog&q=Browser-only+Naver+post+without+a+cover`)
    const row = page.locator('.collection-article-list > article')
    await expect(row).toHaveCount(1)
    await expect(row.getByRole('heading', { level: 2 })).toContainText(locale === 'en' ? 'Browser-only Naver post without a cover' : '표지 없는 네이버 테스트 글')
    await expect(row.getByRole('heading', { level: 2 })).toHaveAttribute('lang', locale)
    await expect(row.locator('.collection-article-excerpt')).toHaveText('이미지가 없는 원문 미리보기입니다.')
    await expect(row.locator('.collection-article-excerpt')).toHaveAttribute('lang', 'ko')
    await expect(row.locator('img')).toHaveCount(0)
    await expect(row.locator('.collection-article-thumbnail')).toHaveCount(0)
    await expect(row).not.toHaveClass(/collection-article-with-thumbnail/)
    await row.getByRole('link', { name: locale === 'en' ? /^Archive note/ : /^아카이브 노트/ }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(locale === 'en' ? 'Browser-only Naver post without a cover' : '표지 없는 네이버 테스트 글')
    await expect(page.locator('.detail-deck')).toHaveText('이미지가 없는 원문 미리보기입니다.')
    await expect(page.getByRole('main').locator('img')).toHaveCount(0)
  }
})

test('failed Naver covers disappear while the translated title, preview and original link remain usable', async ({ page }) => {
  await page.goto('/#/en/writing?source=Naver+Blog&q=Browser-only+Naver+failed+cover')
  const row = page.locator('.collection-article-list > article')
  await expect(row).toHaveCount(1)
  const heading = row.getByRole('heading', { level: 2 })
  await expect(heading).toContainText('Browser-only Naver failed cover')
  await expect(row.locator('.collection-article-original-title')).toHaveText('표지가 열리지 않는 네이버 테스트 글')
  await expect(row.locator('.collection-article-excerpt')).toHaveText('표지가 열리지 않아도 읽을 수 있는 미리보기입니다.')
  // Scroll lazy images into view before expecting their error fallback.
  await heading.scrollIntoViewIfNeeded()
  await expect(row.locator('img')).toHaveCount(0)
  await expect(row.locator('.collection-article-thumbnail')).toHaveCount(0)
  await expect(row).not.toHaveClass(/collection-article-with-thumbnail/)
  await expect(heading.getByRole('link')).toHaveAttribute('href', 'https://example.com/test-naver-failed-cover')
  await row.getByRole('link', { name: /^Archive note/ }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Browser-only Naver failed cover')
  const original = page.getByRole('link', { name: /Read the full piece on Naver Blog/ })
  await original.scrollIntoViewIfNeeded()
  await expect(page.locator('.detail-article-thumbnail')).toHaveCount(0)
  await expect(page.getByRole('main').locator('img')).toHaveCount(0)
  await expect(page.locator('.detail-deck')).toHaveText('표지가 열리지 않아도 읽을 수 있는 미리보기입니다.')
  await expect(original).toHaveAttribute('href', 'https://example.com/test-naver-failed-cover')
})
