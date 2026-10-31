import { SITE } from '../site.mjs';
import { esc, arrow, page, header, footer, promiseStrip, faqList, answerBlock, boundaryLinks, COST_FAQ } from '../layout.mjs';
import { graph, webPage, faqPage, service, serviceId, howTo } from '../seo.mjs';
import { asset, posterPicture } from '../assets.mjs';
// The hero image fills the viewport width, or more on tall screens.
export const HERO_SIZES = 'max(100vw, 178vh)';

const VOLUMES = ['Not sure yet', 'Under 25', '25–100', '101–300', 'More than 300'];

export const ENQUIRY_FAQ = {
  q: 'What happens to my enquiry details?',
  a: 'They stay in your browser until you send them. This page does not submit or store the form details on a server. Opening an email draft hands those details to your email app; you decide whether to send it. Downloading saves a text copy to your device. Hosting access logs are separate from this form.',
};

// The one task the home page supports, as numbered steps. The same list feeds the HowTo markup.
export const startSteps = d => [
  { name: 'Choose the workflow', text: `Pick one workflow in the form on this page, such as ${d.form.workflows[0].toLowerCase()}, and list the tools you use today.` },
  { name: 'Send the enquiry', text: `Review the enquiry, then send it to ${SITE.email} from your own email app.` },
  { name: 'Agree the terms', text: 'Agree the scope, approval rules, fees, limits and how results are measured. Integration feasibility is assessed first.' },
  { name: 'Test with sample data', text: 'Run the agreed rules on synthetic examples before any live data is connected.' },
  { name: 'Go live', text: 'Go live with the agreed rules, with regular reports on results and staff time.' },
];

const pad = n => String(n).padStart(2, '0');
export const ACTOR = { agent: 'Agent', team: 'Human', customer: 'Customer' };

// One end-to-end run of a scenario, as an ordered list. Every step keeps its number, actor, action and status in
// separate elements, and all of the text is in the HTML; site.js only adds the playback (see .flow in styles.css).
export const flowList = (steps, { compact = false } = {}) => `<div class="flow${compact ? ' flow-compact' : ''}" style="--n:${steps.length}"><span class="flow-line" aria-hidden="true"><span class="flow-fill"></span></span><ol>${steps.map((st, i) => `<li class="flow-step is-${st.actor}${st.approval ? ' has-approval' : ''}" style="--i:${i}"><span class="flow-num" aria-hidden="true">${pad(i + 1)}</span><span class="flow-head"><span class="flow-actor"><span class="visually-hidden">Step ${i + 1}. </span><b>${ACTOR[st.actor]}</b><span class="flow-who">${esc(st.who)}</span></span>${compact ? '' : `<span class="flow-status">${esc(st.status)}</span>`}</span><span class="flow-do">${esc(compact ? st.short : st.does)}</span>${!compact && st.approval ? `<span class="flow-approval"><b>Human approval</b> ${esc(st.approval)}</span>` : ''}</li>`).join('')}</ol></div>`;

// Each workflow phase lists the steps of the first scenario that belong to it, so the overview and the full run agree.
const phaseExample = (scene, phase) => scene.steps.map((st, i) => ({ ...st, n: i + 1 })).filter(st => st.phase === phase);

// The home page, built from the one service file in src/content/sectors. Its "In short" answer links to the
// guide whose `sector` is this service, if there is one.
export const SITE_FAQ = [
  { q: `Who is ${SITE.name} for?`, a: `Dealer groups and their dealerships whose sales and service teams handle a steady stream of enquiries. ${SITE.name} is for organisations only; there is no personal plan.` },
  { q: 'Does it send messages to customers on its own?', a: 'No. Your team reviews external messages before they go out, and approval rules are agreed before anything goes live.' },
  { q: 'Who makes the decisions?', a: 'Your team does. Drafts and handoffs are prepared for review; discounts, financing, trade-ins, exceptions and anything outside the agreed scope stay with the people responsible.' },
  { q: 'Can we use real customer data before going live?', a: 'No. Use synthetic examples for discovery. Live data is connected only after a separate review of access, privacy, security, retention and the applicable agreements.' },
];

export function sectorPage(d, guides = []) {
  const media = `/media/${d.key}`;
  const path = '/';
  const faq = [...d.faq, ...SITE_FAQ, COST_FAQ, ENQUIRY_FAQ];
  // The first scenario is in the HTML, so the example reads the same without JavaScript; site.js takes over from there.
  const first = d.demo.scenes[0];
  const title = `${SITE.name} | ${SITE.category}`;
  const steps = startSteps(d);
  const guide = guides.find(g => g.sector === d.key);
  for (const s of d.demo.scenes) {
    if (s.steps.length < 6 || s.steps.length > 9) throw new Error(`${d.key}: scene "${s.tab}" needs 6 to 9 steps`);
    for (const st of s.steps) if (!ACTOR[st.actor] || !st.status || !st.does || !st.short || !(st.phase >= 1 && st.phase <= d.workflow.steps.length)) throw new Error(`${d.key}: scene "${s.tab}" has an incomplete step`);
  }
  const main = `<section class="hero" aria-labelledby="headline">
<div class="hero-media" aria-hidden="true">${posterPicture(d.key, { sizes: HERO_SIZES, attrs: 'fetchpriority="high"' })}<video id="hero-video" muted loop playsinline preload="metadata" tabindex="-1"><source src="${asset(`${media}/hero.mp4`)}" type="video/mp4"></video></div>
<div class="hero-wash" aria-hidden="true"></div>
<div class="wrap hero-content">
<div class="hero-copy">
<div class="eyebrow">${esc(d.hero.eyebrow)}</div>
<h1 id="headline">${esc(d.hero.headline[0])}<em>${esc(d.hero.headline[1])}</em></h1>
<p class="intro">${esc(d.hero.intro)}</p>
<div class="actions"><a class="btn" href="#start">Talk to us ${arrow}</a><a class="btn outline" href="#example">See the workflow <span aria-hidden="true">↓</span></a></div>
<p class="micro">${esc(d.hero.audience)}<br>Built and run by ${SITE.name}.</p>
</div>
<figure class="hero-card">
<p class="hero-card-label">Incoming request</p>
<p class="hero-card-request">“${esc(first.request)}”</p>
<p class="hero-card-label">What happens next</p>
${flowList(first.steps, { compact: true })}
<figcaption>Illustrative example · synthetic data</figcaption>
</figure>
</div>
<div class="hero-foot"><span>${esc(d.hero.foot)}</span><button type="button" class="video-control" id="video-toggle">Pause video</button></div>
</section>
<div class="wrap">
${promiseStrip()}
${answerBlock({ ...d.summary, link: guide ? { href: `/guides/${guide.slug}`, label: guide.title } : { href: '/guides/staff-minutes-per-resolved-request', label: 'How results are measured' } }, d.scope)}
<div class="statement"><p>${esc(d.statement[0])} <strong>${esc(d.statement[1])}</strong></p></div>
<section id="workflow">
<div class="section-head"><div><div class="eyebrow">${esc(d.workflow.eyebrow)}</div><h2>${esc(d.workflow.heading)}</h2></div><p>This page covers one task: ${esc(d.task)}. ${esc(d.workflow.body)}</p></div>
<ol class="steps rise-group">${d.workflow.steps.map((s, i) => `<li class="step rise" style="--i:${i}"><span class="number">Phase ${pad(i + 1)}</span><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p><ol class="step-example" aria-label="${esc(first.tab)} example">${phaseExample(first, i + 1).map(st => `<li><span class="se-num">${pad(st.n)}</span><span class="se-actor">${ACTOR[st.actor]}</span><span class="se-status">${esc(st.status)}</span></li>`).join('')}</ol></li>`).join('')}</ol>
<p class="micro example-note">Illustrative example · synthetic data. The steps are from the “${esc(first.tab)}” scenario below; it is not a customer record.</p>
</section>
</div>
<section class="demo-section" id="example"><div class="wrap">
<div class="section-head"><div><div class="eyebrow">${esc(d.demo.eyebrow)}</div><h2>${esc(d.demo.heading)}</h2></div><p>${esc(d.demo.body)}</p></div>
<div class="demo">
<aside class="demo-side"><div class="label">Choose a scenario</div><div class="tabs" role="group" aria-label="Example scenarios">${d.demo.scenes.map((s, i) => `<button type="button" class="tab${i === 0 ? ' active' : ''}" aria-pressed="${i === 0}" aria-controls="scene-${i}">${esc(s.tab)}</button>`).join('')}</div><p class="micro">Each scenario uses synthetic data to show one enquiry end to end, from the first message to closed and logged. Agent steps are prepared by ${SITE.name}; human steps are your staff.</p></aside>
<div class="demo-body" id="demo-panel">
<div class="demo-titlebar"><span>${SITE.name} / Sales and service</span><span>Illustrative example · synthetic data</span></div>
${d.demo.scenes.map((s, i) => `<article class="scene" id="scene-${i}" aria-label="${esc(s.tab)} scenario">
<div class="demo-meta"><span>${esc(s.source)}</span><span class="pill">Owner: ${esc(s.owner)}</span></div>
<p class="request">“${esc(s.request)}”</p>
<div class="rule">${esc(s.rule)}</div>
${flowList(s.steps)}
</article>`).join('\n')}
<div class="demo-actions"><button class="reset" id="flow-pause" type="button" hidden>Pause</button><button class="reset" id="flow-replay" type="button" hidden>Replay</button><span class="demo-status">A local simulation. No live action is taken.</span></div>
</div>
</div>
<noscript><p>All three scenarios are shown in full above. You can contact <a href="mailto:${SITE.email}">${SITE.email}</a> to get started.</p></noscript>
</div></section>
<div class="wrap">
<section class="measure">
<div><div class="eyebrow">Value you can check</div><h2>See the results<br>in your numbers.</h2><p class="lede">We record how your team works today, then track the outcome, the exceptions, and the staff time needed to get there.</p></div>
<div>
<div class="measure-box"><span class="eyebrow">The measure we suggest</span><h3>${esc(d.measure.metric)}</h3><p>${esc(d.measure.metricBody)}</p></div>
<div class="boundary"><h3>${esc(d.measure.boundary)}</h3><p>${esc(d.measure.boundaryBody)}</p>${boundaryLinks(d.measure.boundaryLinks)}</div>
</div>
</section>
<section id="start"><div class="start-panel">
<div>
<div class="eyebrow">Get started</div>
<h2>Stop chasing<br>requests.</h2>
<p>Tell us where requests pile up. We agree the work, fees, limits, and how results are measured, then go live.</p>
<ul class="scope">${d.start.scope.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
<h3 class="start-head">How to start, step by step</h3>
<ol class="start-steps">${steps.map(s => `<li><strong>${esc(s.name)}.</strong> ${esc(s.text)}</li>`).join('')}</ol>
<p class="micro">Live once scope and access are agreed. Integration feasibility is assessed first.</p>
</div>
<div>
<form id="enquiry-form">
<div class="form-grid">
<div class="field full"><label for="organisation">${esc(d.form.orgLabel)}</label><input id="organisation" name="organisation" maxlength="100" required autocomplete="organization" placeholder="${esc(d.form.orgPlaceholder)}"></div>
<div class="field"><label for="name">Your name</label><input id="name" name="name" maxlength="80" required autocomplete="name" placeholder="Full name"></div>
<div class="field"><label for="email">Work email</label><input id="email" name="email" type="email" maxlength="140" required autocomplete="email" placeholder="${esc(d.form.emailPlaceholder)}"></div>
<div class="field full"><label for="workflow-choice">Workflow to explore</label><select id="workflow-choice" name="workflow">${d.form.workflows.map(w => `<option>${esc(w)}</option>`).join('')}</select></div>
<div class="field full"><label for="tools">Current tools <span class="optional">(optional)</span></label><input id="tools" name="tools" maxlength="180" placeholder="${esc(d.form.toolsPlaceholder)}"></div>
<div class="field full"><label for="volume">${esc(d.form.volumeLabel)}</label><select id="volume" name="volume">${VOLUMES.map(v => `<option>${v}</option>`).join('')}</select></div>
</div>
<button class="btn" type="submit">Review enquiry ${arrow}</button>
<p class="micro form-note">Review your enquiry, then send it to ${SITE.name} from your email app. ${esc(d.form.recordsNote)}</p>
</form>
<div id="draft-preview" class="draft-preview" tabindex="-1" hidden>
<strong>Review your enquiry</strong>
<pre id="brief-text"></pre>
<p id="send-status" class="micro" role="status">Not sent yet. Open the email draft to send it to ${SITE.email}.</p>
<a class="btn" id="email-draft" href="mailto:${SITE.email}">Open email draft ${arrow}</a> <button class="btn download" id="download-brief" type="button">Download draft</button>
<p class="micro privacy-note">An email draft or a download stays on your device until you send it. <a href="/privacy">Privacy</a>.</p>
</div>
</div>
</div></section>
<section class="faq" id="questions">
<div><div class="eyebrow">Before we begin</div><h2>A few useful<br>answers.</h2></div>
<div>
${faqList(faq)}
</div>
</section>
</div>`;

  return page({
    path,
    title,
    jsonLd: graph([
      webPage({ path, title, description: d.description, updated: SITE.updated[path], mainEntity: serviceId() }),
      service(d),
      howTo(path, `How to start ${d.task} with ${SITE.name}`, steps),
      faqPage(path, faq),
          ]),
    description: d.description,
    image: '/og/home.png',
    imageAlt: `${SITE.name}: ${d.hero.headline.join(' ')} Set over a still from the page's stock footage of a dealership showroom.`,
    bodyClass: d.key,
    header: header({
      links: [
        { href: '/guides', label: 'Guides' },
        { href: '#workflow', label: 'Workflow' },
        { href: '#questions', label: 'Questions' },
        { href: '#start', label: 'Talk to us', button: true },
      ],
    }),
    main,
    footer: footer({ current: 'home', footage: [d.footage] }),
    config: {
      key: d.key,
      name: SITE.name,
      email: SITE.email,
      briefOrgLabel: d.form.briefOrgLabel,
      briefRecordsLine: d.form.briefRecordsLine,
    },
  });
}
