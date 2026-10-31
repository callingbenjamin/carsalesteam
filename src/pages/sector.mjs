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
export const LANES = ['customer', 'agent', 'team'];
export const LANE_NAME = { customer: 'Customer', agent: `${SITE.name} agent`, team: 'Your team' };
export const STAGES = ['Intake', 'Work', 'Hand-off', 'Close'];

// Simple line icons, drawn once in an SVG sprite and referenced by each step (no emoji, no images).
const ICON_PATHS = {
  inbox: 'M4 13h4l1.5 2.5h5L16 13h4M5.5 5h13L20 13v5.5a.5.5 0 0 1-.5.5h-15a.5.5 0 0 1-.5-.5V13z',
  tag: 'M3.5 11.5V4h7.5l9 9-7.5 7.5zM7.5 8h.01',
  search: 'M11 4.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM20 20l-4.4-4.4',
  rule: 'M4 7l2 2 3.5-3.5M4 15l2 2 3.5-3.5M13 8h7M13 16h7',
  pen: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  handoff: 'M4 9h14l-3.5-3.5M20 15H6l3.5 3.5',
  clock: 'M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16zM12 8v4.5l3 2',
  check: 'M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16zM8.5 12.5l2.5 2.5 4.5-5',
  send: 'M20 4L4 11l6.5 2.5L13 20zM20 4l-9.5 9.5',
  archive: 'M4 5h16v4H4zM5.5 9v10h13V9M10 13h4',
  shield: 'M12 3.5l7 3v5c0 4.3-2.9 7.6-7 9.5-4.1-1.9-7-5.2-7-9.5v-5zM9 12l2 2 4-4',
  tick: 'M5 12.5l4.5 4.5L19 7.5',
  'a-customer': 'M12 4.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zM5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5',
  'a-agent': 'M7 7h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM12 4v3M9.5 12h.01M14.5 12h.01',
  'a-team': 'M9 6a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM16.5 7.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3.5 19c.6-3 2.8-4.8 5.5-4.8s4.9 1.8 5.5 4.8M15 14.4c2.6-.2 4.6 1.4 5.2 4.1',
};
export const iconSprite = () => `<svg class="sprite" aria-hidden="true" focusable="false">${Object.entries(ICON_PATHS).map(([k, d]) => `<symbol id="i-${k}" viewBox="0 0 24 24"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>`).join('')}</svg>`;
export const icon = (k, cls = '') => `<svg class="ic${cls ? ` ${cls}` : ''}" aria-hidden="true" focusable="false"><use href="#i-${k}"/></svg>`;

// Facts counted from the flow itself; nothing else goes in the summary.
export const flowSummary = steps => `${steps.length} steps · agent handles ${steps.filter(s => s.actor === 'agent').length} · your team approves ${steps.filter(s => s.approval).length}`;
// The closing line of a run, also counted from the flow.
export const flowEnd = steps => { const a = steps.filter(s => s.approval).length; return `${steps.length} steps · ${a} approval${a === 1 ? '' : 's'} · closed and logged`; };

// A request run, built the same way on every Actuathron site: three lanes (customer, CarSalesTeam, your team), a
// bold one-to-three-word label and an icon per step, phase headers, a checkpoint marker wherever your team
// approves, and an example conversation. Every word is in the HTML, so it reads the same without JavaScript, to
// screen readers and to crawlers; styles.css plays it in order and site.js only starts, pauses and replays it.
// The layout is fixed from first paint: playing only changes opacity, transform and a slight blur. No style
// attributes (CSP style-src 'self'): timing comes from the sN/pK classes below.
const LANE_KEYS = [['customer', 'Customer'], ['agent', SITE.name], ['team', 'Your team']];
export const checkpoint = `<span class="run-check">${icon('shield', 'run-ic')}Your team approves</span>`;
export const actorIcon = lane => icon(`a-${lane}`, 'run-ic run-actor-ic');
// Steps that end in a hand-off or an approval hold for a short pause, so the run breathes where people decide.
const pauses = st => Boolean(st.approval) || st.icon === 'handoff';
// Timing classes for step i: sN is its place, pK the pauses before it, pz a pause after it (see .run in styles.css).
const timing = steps => steps.map((st, i) => `s${i} p${steps.slice(0, i).filter(pauses).length}${pauses(st) && i < steps.length - 1 ? ' pz' : ''}`);
// One step of the example conversation: one or two short lines. Customers sit on the left; CarSalesTeam and your
// team on the right. Customer messages and CarSalesTeam's replies get a typing indicator first. The people are
// fictional examples.
const convoStep = (st, cls, people) => {
  const lines = st.chat.map(m => (m.from === 'agent' && m.note ? { ...m, from: 'note' } : m));
  const typed = m => m.from === 'customer' || m.from === 'agent';
  const speaker = m => ({ customer: ['customer', `${people.customer} (example customer)`], agent: ['agent', `${SITE.name}, draft reply`], note: ['agent', `${SITE.name}, internal note`], team: ['team', people.team] })[m.from];
  return `<li class="cv-g ${cls}${typed(lines[0]) ? ' t0' : ''}">${lines.map((m, j) => {
    const [lane, name] = speaker(m);
    const shown = m.from === 'team' ? `<b class="cv-who">${esc(name)}:</b> ` : m.from === 'note' ? '<b class="cv-who">Note:</b> ' : `<span class="run-sr">${esc(name)}: </span>`;
    return `<div class="cv-row cv-${m.from} lane-${lane} m${j}${typed(m) ? ' ty' : ''}">${typed(m) ? '<span class="cv-typing" aria-hidden="true"><i></i><i></i><i></i></span>' : ''}<p class="cv-msg">${actorIcon(lane)}<span class="cv-text">${shown}${esc(m.text)}</span></p></div>`;
  }).join('')}</li>`;
};
export function runSteps(scene, { compact = false } = {}) {
  const { steps, people } = scene;
  const tc = timing(steps);
  let k = 0;
  const groups = STAGES.map((name, g) => ({ name, steps: steps.map((st, i) => ({ ...st, i })).filter(st => st.stage === g + 1) })).filter(g => g.steps.length);
  const item = st => `<li class="run-step lane-${st.actor}${st.approval ? ' has-approval' : ''} ${tc[st.i]}" data-label="${esc(st.label)}"><div class="run-chip"><span class="run-icons">${actorIcon(st.actor)}${icon(st.icon, 'run-ic')}</span> <span class="run-text"><strong class="run-label">${esc(st.label)}</strong> <span class="run-who">${esc(st.who)}</span>${st.approval ? ` ${checkpoint}` : ''}</span></div> <p class="run-does"><span class="run-sr">Step ${st.i + 1}, ${ACTOR[st.actor].toLowerCase()}: </span>${esc(st.does)}</p>${st.approval ? ` <p class="run-approval"><span>Human approval:</span> ${esc(st.approval)}</p>` : ''}</li>`;
  const last = steps[steps.length - 1];
  const pt = steps.slice(0, -1).filter(pauses).length;
  return `<div class="run${compact ? ' run-compact' : ''} n${steps.length} pt${pt}">
<div class="run-head"><span class="run-live" aria-hidden="true"><span class="run-dot"></span><span class="run-now">Step ${steps.length} of ${steps.length} · ${esc(last.label)}</span></span><button type="button" class="run-replay">Replay</button></div>
<p class="run-summary">${esc(flowSummary(steps))}</p>
<div class="run-lanes" aria-hidden="true">${LANE_KEYS.map(([key, name]) => `<span class="lane-h lane-${key}">${actorIcon(key)}${esc(name)}</span>`).join('')}<span class="run-token"></span></div>
<div class="run-bar" aria-hidden="true"><span></span></div>
<div class="run-phases">${groups.map(g => `<div class="run-phase"><p class="run-phase-name">${g.name}</p><ol class="run-steps" start="${(k += g.steps.length) - g.steps.length + 1}">${g.steps.map(item).join('\n')}</ol></div>`).join('\n')}</div>
<div class="cv" role="group" aria-label="Example conversation"><p class="cv-title">Example conversation</p><ol class="cv-list"${compact ? ' tabindex="0"' : ''}>${steps.map((st, i) => convoStep(st, tc[i], people)).join('')}</ol><p class="run-end"><span class="run-end-w" aria-hidden="true"><span class="run-end-i">${icon('tick', 'run-ic run-end-ic')}</span></span>${esc(flowEnd(steps))}</p></div>
${compact ? '' : `<div class="run-detail" aria-hidden="true">${steps.map((st, i) => `<p class="run-detail-item ${tc[i]}"><strong>${pad(i + 1)} ${esc(st.label)}</strong> ${esc(st.does)}${st.approval ? ` <span class="run-detail-approval">${esc(st.approval)}</span>` : ''}</p>`).join('')}</div>`}
</div>`;
}
export const legend = `<p class="run-legend">${LANE_KEYS.map(([key, name]) => `<span class="lane-key lane-${key}">${actorIcon(key)}${esc(name)}</span>`).join(' ')} ${checkpoint}</p>`;

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
    if (!s.people?.customer || !s.people?.team) throw new Error(`${d.key}: scene "${s.tab}" needs people`);
    for (const st of s.steps) if (!Array.isArray(st.chat) || st.chat.length < 1 || st.chat.length > 2 || st.chat.some(m => !ACTOR[m.from] || !m.text || m.text.length > 100)) throw new Error(`${d.key}: scene "${s.tab}" needs 1 or 2 short messages per step`);
    for (const st of s.steps) if (!ACTOR[st.actor] || !st.status || !st.does || !st.short || !st.label || st.label.split(' ').length > 3 || !ICON_PATHS[st.icon] || !(st.stage >= 1 && st.stage <= STAGES.length) || !(st.phase >= 1 && st.phase <= d.workflow.steps.length)) throw new Error(`${d.key}: scene "${s.tab}" has an incomplete step`);
  }
  const main = `${iconSprite()}<section class="hero" aria-labelledby="headline">
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
${runSteps(first, { compact: true })}
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
<ol class="steps rise-group">${d.workflow.steps.map((s, i) => `<li class="step rise"><span class="number">Phase ${pad(i + 1)}</span><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p><ol class="step-example" aria-label="${esc(first.tab)} example">${phaseExample(first, i + 1).map(st => `<li class="is-${st.actor}"><span class="se-num">${pad(st.n)}</span>${icon(st.icon, 'se-ic')}<b class="se-lbl">${esc(st.label)}</b><span class="se-actor">${st.actor === 'agent' ? 'Agent' : esc(LANE_NAME[st.actor])}</span></li>`).join('')}</ol></li>`).join('')}</ol>
<p class="micro example-note">Illustrative example · synthetic data. The steps are from the “${esc(first.tab)}” scenario below; it is not a customer record.</p>
</section>
</div>
<section class="demo-section" id="example"><div class="wrap">
<div class="section-head"><div><div class="eyebrow">${esc(d.demo.eyebrow)}</div><h2>${esc(d.demo.heading)}</h2></div><p>${esc(d.demo.body)}</p></div>
<div class="demo">
<aside class="demo-side"><div class="label">Choose a scenario</div><div class="tabs" role="group" aria-label="Example scenarios">${d.demo.scenes.map((s, i) => `<button type="button" class="tab${i === 0 ? ' active' : ''}" aria-pressed="${i === 0}" aria-controls="scene-${i}">${esc(s.tab)}</button>`).join('')}</div>${legend}<p class="micro">Each scenario uses synthetic data to show one enquiry end to end, from the first message to closed and logged. Agent steps are prepared by ${SITE.name}; human steps are your staff.</p></aside>
<div class="demo-body" id="demo-panel">
<div class="demo-titlebar"><span>${SITE.name} / Sales and service</span><span>Illustrative example · synthetic data</span></div>
<div class="scenes">
${d.demo.scenes.map((s, i) => `<article class="scene${i === 0 ? ' is-active' : ''}" id="scene-${i}" aria-label="${esc(s.tab)} scenario">
<div class="demo-meta"><span>${esc(s.source)}</span><span class="pill">Owner: ${esc(s.owner)}</span></div>
<p class="request">“${esc(s.request)}”</p>
<div class="rule">${esc(s.rule)}</div>
${runSteps(s)}
</article>`).join('\n')}
</div>
<div class="demo-actions"><button class="reset flow-ctl" id="flow-pause" type="button">Pause</button><span class="demo-status">A local simulation. No live action is taken.</span></div>
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
