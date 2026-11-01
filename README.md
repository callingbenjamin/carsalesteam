# CarSalesTeam

Website for **carsalesteam.com**. CarSalesTeam is a managed workflow service that puts dealership vehicle enquiries, test drives and service follow-ups in one workflow, with staff in control. It is enterprise-only. Built and run by [Actuathron](https://actuathron.com/).

| Page | URL |
| --- | --- |
| Home (the dealership service, workflow examples, enquiry form, FAQ) | `/` |
| Guides | `/guides` |
| Guide pages | `/guides/dealership-vehicle-enquiries` and the others listed in `src/site.mjs` |
| Privacy | `/privacy` |

The enquiry form opens an email to `sales@carsalesteam.com` (or downloads a text copy) instead of posting to a server.

## How it is built

Plain static HTML, CSS and JavaScript. No framework. The only npm dependency is `@vercel/functions`, used by `middleware.js`; run `npm install` once. Node 20+ is required.

```
src/content/sectors/dealerships.json  all the words on the home page (edit this to change copy)
src/content/guides/*.json    one file per guide: summary, sections, FAQ, related links
src/site.mjs                 name, domain, contact email, guide order, last-updated dates
src/seo.mjs                  JSON-LD builders (Organization, WebSite, WebPage, Service, HowTo, Article, FAQPage, BreadcrumbList)
src/llms.mjs                 writes llms.txt and llms-full.txt from the same content
src/layout.mjs               shared page shell: header, footer, logo, shared copy
src/pages/                   page templates: home (sector.mjs), guides, privacy + 404
src/crawlers.mjs             blocked and allowed crawler lists and the content signal
public/                      copied as-is: styles.css, site.js, fonts, media, share image, icons
public/brand/                logo files (SVG); the header and footer inline carsalesteam-logo.svg
build.mjs                    renders everything into dist/
middleware.js                Vercel Routing Middleware: 403 for AI training crawlers, /robots.txt always readable
scripts/check.mjs            links and anchors, one JSON-LD block per page, FAQ and HowTo schema matching the page,
                             meta description on the page, share-image alt text, robots.txt groups and Content-Signal,
                             llms.txt sections, canonicals, no emojis
scripts/test-middleware.mjs  tests middleware.js with blocked and allowed user agents
scripts/make-images.py       regenerates the share image (public/og/home.png), the touch and app icons and favicon.ico (needs google-chrome)
scripts/make-responsive.py   makes the AVIF and WebP sizes of the hero photo
```

## Commands

```
npm run build    # build into dist/
npm run check    # build, run the checks, test the middleware
npm run dev      # build and serve dist/ at http://localhost:4321
```

## AI crawlers

No AI training: robots.txt disallows AI training crawlers and carries `Content-Signal: search=yes, ai-input=yes, ai-train=no` in every group, and `middleware.js` returns 403 to training crawlers that use their own user agent. Search and AI answer crawlers are allowed.

## Hosting

Vercel project `carsalesteam`, built with `npm run build` and served from `dist/` (see `vercel.json`). `www.carsalesteam.com` redirects (308) to `carsalesteam.com`.
