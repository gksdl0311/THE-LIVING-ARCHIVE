# The Living Archive

Hanyee Jang’s personal website: a growing collection of art, projects, writing and curiosities. Built with React, TypeScript, Vite, Tailwind CSS and Motion. The archive uses structured local content and can be deployed as a static website.

## Run and check

Use Node.js 22.12+ or 24 (this environment was validated with Node 24).

```sh
npm ci
npm run dev
```

Vite prints the local development URL. To check and preview a production build:

```sh
npm run lint
npm run typecheck
npm run build
npm run preview
```

The browser checks cover navigation, filters, responsive layouts and accessibility basics:

```sh
npm run test:e2e
```

They use system Chromium at `/usr/bin/chromium` when available; otherwise install the Playwright browser with `npx playwright install chromium` (on Linux, use `--with-deps` if system libraries are missing). To use another installed Chromium executable, run `CHROMIUM_PATH=/path/to/chromium npm run test:e2e`. Keep this setting local to your machine; the application itself does not require a browser installation.

## Update the archive

Archive entries, career information, current notes and social links live in [`src/content/archive.ts`](src/content/archive.ts). The exported interfaces describe the fields for every content type. Use stable, unique `id` values: they become detail-page URLs. Dates should use ISO format (`2026-10-08`) for consistent display; collection entries appear in their array order. English and Korean text are supported; optional `language` and `translations` fields leave room for future language switching.

- **Projects:** add an object to `projects`. Choose one of `projectCategories`, and explicitly set `status` to `planned`, `in-progress` or `published`. Add context, role, process, design decisions and lessons as `sections`. Only list confirmed `tools`, outcomes and `externalUrl` values. `thumbnail` and `gallery` may reference original images in `public/`.
- **Paintings:** upload the real image to `public/art/` and add an object to `artworks`, including its title, archive number, image path, category and description. Year, medium and dimensions are optional. Images retain their natural proportions. Do not substitute generated paintings for Hanyee’s artwork. Original sketches and process photographs can be added to an artwork’s optional `process` array: each item takes `image`, `caption` and descriptive `alt` text.
- **Artist statement:** set `site.artistStatement` to Hanyee’s own statement. The gallery displays it in place of its introductory practice note once supplied.
- **Writing:** add an object to `articles` with its date, category and excerpt. Use `externalUrl` for an original publication, `body` for paragraphs of an on-site article, or both. Add `platform` when known. Categories can be extended in `articleCategories`. Reading time is calculated from available on-site text.
- **Journal:** add real entries to `journalEntries` with a date, category and paragraph array in `body`; optionally include an original `image` and descriptive `imageAlt` text.
- **Career and education:** edit `experiences` and `education`. Only use supplied dates, roles and qualifications.
- **Skills and credentials:** add a group to `skills`, such as `{ category: 'Languages', items: [...] }`. The same format supports verified software skills, certifications and achievements.
- **Exhibitions:** add real events to `exhibitions`, supplying a title, year and venue. The section stays hidden while the array is empty.
- **CV:** put the real PDF in `public/cv/` and set `site.cvUrl` to its path, for example `/cv/hanyee-jang.pdf`. The interface reports that the CV is pending while the value is `null`.
- **Contact:** edit `site.links`; use a `mailto:` URL for email and full HTTPS URLs for social profiles. Only the supplied Instagram account is configured initially.
- **Homepage selections:** set `featured: true` on the projects, artworks or articles you want to highlight. Surprise Me selects real published content; planned projects are excluded.
- **Currently on my mind:** edit `currently`, using short labels, text and optional internal `href` values.

Paths beginning with `/` refer to assets inside `public/`, not to files under `src/`. Keep images reasonably compressed and write meaningful descriptions. Avoid uploading confidential information. Image and CV paths are resolved against the deployment base.

The first release contains the supplied multilingual Rena Seulgi Jang website as a published project. Other project entries are clearly marked as planned. Paintings, articles, journal entries, skills, exhibitions, a CV, additional contact accounts and fuller case-study details still need real content; their data models and page layouts are ready.

## Deploy

The site uses hash routing so static hosts can open every section without custom rewrite rules. Browser page titles and descriptions update per route; social crawlers see the homepage metadata. For separate article previews and search indexing at scale, add prerendering or migrate to a static-generation framework once the published collection grows. An example project URL is `/#/projects/rena-seulgi-jang`.

### Vercel

Import this repository, choose Vite, and use `npm run build` as the build command and `dist` as the output directory. Leave `VITE_BASE_PATH` unset for a root-domain deployment. No server-side secrets or external services are needed for the site to run.

### GitHub Pages

Build with the repository prefix, then publish the contents of `dist` using a GitHub Pages workflow or your existing deployment process:

```sh
VITE_BASE_PATH=/THE-LIVING-ARCHIVE/ npm run build
```

In GitHub repository settings, select **Pages → GitHub Actions** when deploying with a workflow. A typical workflow checks out the repository, sets up Node, runs `npm ci`, builds with the base path above, uploads `dist` as the Pages artifact and deploys that artifact. Keep the trailing slash in `VITE_BASE_PATH`. For a custom domain or a root user-site repository, use `/` instead.

The GitHub Pages workflow at `.github/workflows/deploy.yml` runs lint, desktop/mobile browser tests and a production build before deploying each push to `main`. Enable **Settings → Pages → Source → GitHub Actions** once, then push changes or run **Deploy to GitHub Pages** from the Actions tab. After a successful deployment, the site is available at `https://gksdl0311.github.io/THE-LIVING-ARCHIVE/`.

Before publishing, replace any pending content you want to feature, confirm external links and check the production preview on mobile and desktop. Planned entries may remain in the archive as long as their status remains accurate.
