import { readFileSync } from 'node:fs';
import { SITE } from './site.mjs';
import { asset } from './assets.mjs';

export const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// JSON inside <script type="application/json">: keep "</script>" from closing the tag early.
export const jsonBlock = value => JSON.stringify(value).replace(/</g, '\\u003c');

// The logo: the amber mark (a car in a chat bubble) and the wordmark (public/brand/carsalesteam-logo.svg).
// Inline, the wordmark takes the text colour, so it reads ivory on the graphite header and footer.
const LOGO_FILE = readFileSync(new URL('../public/brand/carsalesteam-logo.svg', import.meta.url), 'utf8').trim();
export const LOGO = LOGO_FILE
  .replace('<svg xmlns="http://www.w3.org/2000/svg" ', '<svg class="brand-logo" aria-hidden="true" focusable="false" ')
  .replace(/(<text\b[^>]*?)fill="#20292C"/, '$1fill="currentColor"');
if (!LOGO.includes('brand-logo') || !LOGO.includes('currentColor')) throw new Error('public/brand/carsalesteam-logo.svg: expected one <svg> with a #20292C <text> wordmark');

const ARROW = '<span class="arr" aria-hidden="true">↗</span>';
export const arrow = ARROW;
export const arrowDown = '<span class="arr down" aria-hidden="true">↓</span>';

const pad2 = n => String(n).padStart(2, '0');

// A section label: spaced capitals. `tone` "accent" sets it in the signal colour. (A section index is no longer shown;
// a number passed here is ignored, so older callers keep working.)
export const eyebrow = (text, tone) =>
  `<div class="eyebrow${tone === 'accent' ? ' accent' : ''}"><span>${esc(text)}</span></div>`;

// jsonLd: a schema.org object from graph() in seo.mjs. noindex: keep the page out of search (404).
// imageAlt: one sentence naming the brand and what the share image shows.
// scripts: extra versioned module scripts from public/ (asset() URLs), loaded after site.js.
// styles: extra versioned stylesheets from public/, after styles.css. headScripts: plain versioned scripts that run
// before the page paints (no defer), for example to set a class on <html>; the CSP forbids inline scripts.
export const mdPath = path => (path === '/' ? '/index' : path) + '.md';

// Meta, og and twitter descriptions stay within 160 characters: a longer definition is cut at its last comma, or
// else its last space, inside the limit. The cut text is the start of the visible definition, word for word.
export const metaDescription = text => {
  if (text.length <= 160) return text;
  const cut = text.slice(0, 160);
  const comma = cut.lastIndexOf(',');
  return (comma >= 100 ? cut.slice(0, comma) : cut.slice(0, cut.lastIndexOf(' '))).replace(/[\s,;:.\-]+$/, '');
};

export function page({ path, title, shareTitle = title, description: fullDescription, image, imageAlt, bodyClass = '', header, main, footer, config, jsonLd, ogType = 'website', noindex = false }) {
  if (!imageAlt) throw new Error(`${path}: page() needs imageAlt for its share image`);
  const url = SITE.url + path;
  const description = metaDescription(fullDescription);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">\n<link rel="alternate" type="text/markdown" href="${mdPath(path)}">`}
<meta name="theme-color" content="#0B0F11">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="${esc(SITE.titleBrand)}">
<meta property="og:title" content="${esc(shareTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE.url}${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(imageAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${SITE.url}${image}">
<meta name="twitter:image:alt" content="${esc(imageAlt)}">
<meta name="twitter:title" content="${esc(shareTitle)}">
<meta name="twitter:description" content="${esc(description)}">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/fonts/instrument-serif-latin-v5.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/geist-latin-v5.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${asset('/styles.css')}">
<script src="${asset('/site.js')}" defer></script>${jsonLd ? `\n<script type="application/ld+json">${jsonBlock(jsonLd)}</script>` : ''}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}><a class="skip" href="#main">Skip to content</a>
${header}
<main id="main">
${main}
</main>
${footer}${config ? `\n<script id="config" type="application/json">${jsonBlock(config)}</script>` : ''}
</body>
</html>
`;
}

export const lineOf = key => SITE.lines[key];
export function header({ links = [] } = {}) {
  const cta = links.find(l => l.button) ?? { href: '/#start', label: 'Talk to us' };
  const items = '<a href="/#workflow">Workflow</a><a href="/guides">Guides</a><a href="/#questions">Questions</a>';
  const button = `<a class="btn" href="${cta.href}">${esc(cta.label)}</a>`;
  return `<header class="top"><div class="wrap nav"><div class="brand-lockup"><a class="brand" href="/" aria-label="${SITE.name} home">${LOGO}</a><span class="brand-by">by Actuathron</span></div><nav class="desktop" aria-label="Main navigation">${items}${button}</nav><details class="mobile"><summary>Menu</summary><nav aria-label="Mobile navigation">${items}${button}</nav></details></div></header>`;
}
export function footer({ current } = {}) {
  const link = (href, label) => `<li><a href="${href}">${esc(label)}</a></li>`;
  return `<footer class="footer"><div class="wrap"><div class="foot-grid"><div class="foot-brand"><a class="brand" href="/" aria-label="${SITE.name} home">${LOGO}</a><p>AI workforces, built and run around your team.</p></div><nav class="foot-nav" aria-label="Footer"><div class="foot-col"><p class="foot-h">Resources</p><ul>${link('/guides','Guides')}${link('/privacy','Privacy')}</ul></div><div class="foot-col"><p class="foot-h">Contact</p><ul>${link('mailto:'+SITE.email,SITE.email)}</ul></div></nav></div><div class="foot-bottom"><span class="governance">Built and run by <a href="${SITE.parent.url}" rel="noopener">${SITE.parent.name}</a>.</span><span class="copyright">© ${new Date().getFullYear()} ${SITE.name}</span></div></div></footer>`;
}

// The four principles, listed in the Markdown version of the home page (src/markdown.mjs).
export const PROMISES = ['Every request followed up', 'Agreed approval rules', 'Results you can measure', 'A person in control'];

export const COST_FAQ = {
  q: 'What does it cost?',
  a: 'The fees are agreed with you before work begins. We agree a fixed scope, setup fee, monthly service fee and usage limit first; there is no charge to prepare an enquiry.',
};

// Share image for the home page, guides and plain pages.
export const HOME_IMAGE_ALT = `${SITE.name}: Every lead deserves a next step. A still of a dealership.`;

// Scope stated as plain facts. scope: { covers, excludes, instead?, insteadLabel? } (insteadLabel defaults to "Handled by").
export const scopeBlock = scope => `<dl class="scope-facts">
<div><dt>Covers</dt><dd>${esc(scope.covers)}</dd></div>
<div><dt>Does not cover</dt><dd>${esc(scope.excludes)}</dd></div>${scope.instead ? `
<div><dt>${esc(scope.insteadLabel ?? 'Handled by')}</dt><dd>${esc(scope.instead)}</dd></div>` : ''}
</dl>`;

// The questions are plain text inside <summary>: scripts/check.mjs matches them against the FAQPage markup,
// and styles.css numbers them with a counter.
export const faqList = items => `<div class="faq-list">\n${items.map(f => `<details><summary>${esc(f.q)}</summary><p>${f.html ?? esc(f.a)}</p></details>`).join('\n')}\n</div>`;

// The FAQ section shared by the home and industry pages, on a pale scene.
export const faqSection = items => `<section class="faq sec light paper-2" id="questions"><div class="wrap faq-grid">
<div class="faq-head">${eyebrow('Before we begin')}<h2>A few useful<br>answers.</h2></div>
${faqList(items)}
</div></section>`;

// Links under a "decisions stay with people" block. links: [{ href, label }]
export const boundaryLinks = (links = []) => links.length ? `<ul class="boundary-links">${links.map(l => `<li><a href="${l.href}">${esc(l.label)}</a></li>`).join('')}</ul>` : '';

// Answer-first block: a direct one- or two-sentence answer to "what is this and who is it for", then the scope and
// the key takeaways. summary: { question, answer, takeaways: [string], link?: { href, label } }
// scope (optional) is rendered under the answer as Covers / Does not cover / Handled by.
export const answerBlock = (summary, scope) => `<section class="answer" id="in-short" aria-labelledby="in-short-q">
<div class="answer-label">${eyebrow('In short')}</div><div class="answer-main"><h2 id="in-short-q">${esc(summary.question)}</h2><p class="lead">${esc(summary.answer)}</p>${scope ? scopeBlock(scope) : ''}${summary.link ? `<p class="answer-link"><a href="${summary.link.href}">${esc(summary.link.label)}</a></p>` : ''}
<div class="takeaways"><h3>Key takeaways <span aria-hidden="true">${pad2(summary.takeaways.length)}</span></h3><ul>${summary.takeaways.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div></div>
</section>`;
