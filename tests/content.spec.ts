import { test, expect } from '@playwright/test'

// These browser-only fixtures exercise empty-at-launch content systems without
// adding invented paintings, publications or contact details to the website.
test.beforeEach(async ({ page }) => {
  await page.route('**/src/content/archive.ts*', async route => {
    const response = await route.fetch()
    const fixture = `
      artworks.push({id:'test-work',number:'A—TEST',title:'Test artwork',year:'2026',medium:'Test medium',dimensions:'20 × 30 cm',category:'Test collection',description:'Browser-only fixture.',image:'/test-fixture.svg',featured:true,process:[{image:'/test-fixture.svg',alt:'Test process image',caption:'Process fixture'}]});
      artworks.push({id:'test-work-two',number:'A—TEST2',title:'Second test artwork',category:'Another collection',description:'Browser-only fixture.',image:'/test-fixture.svg'});
      site.artistStatement='A browser-only artist statement for functional validation.';
      articles.push({id:'test-essay',number:'W—TEST',title:'생각을 담은 글',date:'2026-10-08',category:'Essays',excerpt:'테스트 글입니다.',language:'ko',body:['한국어 본문이 올바르게 표시됩니다.','This paragraph checks the editorial reading layout.'],featured:true});
      articles.push({id:'test-external',number:'W—TEST2',title:'External test piece',date:'2026-10-08',category:'Film, Art & Culture',excerpt:'An external-publication fixture.',platform:'Test publication',externalUrl:'https://example.com/test-article'});
      journalEntries.push({id:'test-note',title:'A test note',date:'2026-10-08',category:'Test category',body:['A browser-only journal paragraph.'],image:'/test-fixture.svg',imageAlt:'Fixture journal image'});
      site.cvUrl='/test-cv.pdf';
    `
    await route.fulfill({ response, body: `${await response.text()}\n${fixture}` })
  })
  await page.route('**/test-fixture.svg', route => route.fulfill({ contentType:'image/svg+xml', body:'<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"><rect width="200" height="300" fill="#8b9773"/></svg>' }))
})

test('original artwork filters, metadata and process galleries work with supplied content', async ({ page }) => {
  await page.goto('/#/art')
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
  await page.goto('/#/writing')
  await page.getByRole('button', {name:'Essays', exact:true}).click()
  await expect(page.getByRole('heading', {name:'External test piece'})).toHaveCount(0)
  await page.getByRole('link', {name:'생각을 담은 글', exact:true}).click()
  await expect(page.getByText('한국어 본문이 올바르게 표시됩니다.', {exact:true})).toBeVisible()
  await expect(page.getByText('1 min read', {exact:true})).toBeVisible()
  await expect(page.locator('.detail-article')).toHaveAttribute('lang','ko')
  await page.goto('/#/writing/test-external')
  await expect(page.getByRole('link', {name:/Read the full piece/})).toHaveAttribute('href','https://example.com/test-article')
})

test('journal dates and CV links render correctly once supplied', async ({ page }) => {
  await page.goto('/#/journal')
  await page.getByRole('link', {name:/A test note/}).click()
  await expect(page.getByText('8 October 2026', {exact:true})).toBeVisible()
  await expect(page.getByRole('img', {name:'Fixture journal image'})).toBeVisible()
  await expect(page.getByText('A browser-only journal paragraph.',{exact:true})).toBeVisible()
  await page.goto('/#/cv')
  await expect(page.getByRole('link',{name:/View CV/})).toHaveAttribute('href','/test-cv.pdf')
})
