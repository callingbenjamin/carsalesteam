'use strict';
// Shared behaviour for every CarSalesTeam page. Each block only runs when its markup is present.
const $ = id => document.getElementById(id);
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Header: solid bar once the page scrolls.
const header = document.querySelector('.top');
if (header) {
  const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', updateHeader, { passive: true });
  // No check at start-up: reading the scroll position then forces the layout that follows the web font swap into
  // one long script task. A page opened part-way down (an anchor link or a reload) fires a scroll event anyway.
}
document.querySelectorAll('.mobile nav a').forEach(a =>
  a.addEventListener('click', () => document.querySelector('.mobile').removeAttribute('open')));

// Header menus (if any): they open on hover and on keyboard focus through CSS; a click or tap toggles
// them too, and Escape or a click elsewhere closes them.
const menus = [...document.querySelectorAll('.menu')];
const closeMenus = except => menus.forEach(m => {
  if (m === except) return;
  m.classList.remove('open');
  m.querySelector('.menu-btn').setAttribute('aria-expanded', 'false');
});
menus.forEach(m => {
  const btn = m.querySelector('.menu-btn');
  const set = open => { m.classList.toggle('open', open); btn.setAttribute('aria-expanded', String(open)); };
  btn.addEventListener('click', () => { closeMenus(m); set(!m.classList.contains('open')); });
  m.addEventListener('mouseenter', () => btn.setAttribute('aria-expanded', 'true'));
  m.addEventListener('mouseleave', () => { if (!m.classList.contains('open')) btn.setAttribute('aria-expanded', 'false'); });
  m.addEventListener('keydown', e => { if (e.key === 'Escape') { set(false); btn.focus(); btn.blur(); } });
});
if (menus.length) document.addEventListener('click', e => { if (!e.target.closest('.menu')) closeMenus(); });

// Reveal on scroll: blocks below the hero rise into view once. Siblings follow each other by a beat.
// Skipped entirely with reduced motion, so nothing is ever hidden for those visitors.
const REVEAL = '.section-head, .center-head, .split > *, .answer-label, .answer-main, .lines .wrap > *, .acc, .news-head, .news-card, .steps, .step, .example-note, .measure-copy > *, .boundary, .start-panel, .faq-head, .faq-grid > .faq-list, .demo-side, .demo-body, .statement p, .cta .wrap > *, .guide-group, .doc-cta';
if (!motion.matches && 'IntersectionObserver' in window) {
  const els = new Set(document.querySelectorAll(REVEAL));
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    io.unobserve(e.target);
  }), { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
  els.forEach(el => {
    const turn = [...el.parentElement.children].filter(c => els.has(c)).indexOf(el);
    if (turn > 0) el.classList.add(`rv-delay-${Math.min(turn, 4)}`);
    el.classList.add('rv');
    io.observe(el);
  });
}

const configEl = $('config');
const config = configEl ? JSON.parse(configEl.textContent) : null;

// Scenario explorer: a local simulation; nothing leaves the page.
if (config && $('demo-panel')) {
  let current = 0;
  const panel = $('demo-panel');
  const tabs = document.querySelectorAll('.tab');
  const stage = $('demo-stage');
  const stageState = $('demo-stage-state');
  const replay = () => { panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap'); };
  const show = (index, animate) => {
    current = index;
    const s = config.scenes[index];
    tabs.forEach((b, i) => { b.classList.toggle('active', i === index); b.setAttribute('aria-pressed', String(i === index)); });
    $('demo-source').textContent = s.source;
    $('demo-owner').textContent = s.owner;
    $('demo-request').textContent = s.request;
    $('demo-rule').textContent = s.rule;
    $('demo-draft').textContent = s.draft;
    $('demo-act').textContent = s.action;
    $('demo-act').disabled = false;
    stage.classList.remove('done');
    stageState.textContent = 'Waiting';
    $('demo-status').textContent = 'Ready for a human decision. This is a local simulation.';
    if (animate && !motion.matches) replay();
  };
  tabs.forEach((b, i) => b.addEventListener('click', () => show(i, true)));
  $('demo-act').addEventListener('click', () => {
    $('demo-status').textContent = config.scenes[current].result + ' No live action was taken.';
    $('demo-act').disabled = true;
    stage.classList.add('done');
    stageState.textContent = 'Recorded';
  });
  $('demo-reset').addEventListener('click', () => show(current, true));
  show(0, false);
}

// Enquiry: prepared in the browser, then sent by the visitor's own email app or saved as a file.
const form = $('enquiry-form');
if (config && form) {
  let brief = '';
  form.addEventListener('input', () => { $('draft-preview').hidden = true; });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const f = new FormData(form);
    const v = k => String(f.get(k) || '').trim();
    brief = `CarSalesTeam — ${config.name} enquiry

${config.briefOrgLabel}: ${v('organisation')}
Contact: ${v('name')}
Work email: ${v('email')}
Workflow: ${v('workflow')}
Current tools: ${v('tools') || 'To discuss'}
Approximate weekly volume: ${v('volume')}

I would like to discuss this workflow for our team. Please help confirm scope, integration feasibility, data handling, how results are measured, setup fee and ongoing costs.

${config.briefRecordsLine}`;
    $('brief-text').textContent = brief;
    $('email-draft').href = 'mailto:' + config.email
      + '?subject=' + encodeURIComponent(`${config.name} enquiry — ${v('organisation')}`)
      + '&body=' + encodeURIComponent(brief);
    $('draft-preview').hidden = false;
    $('draft-preview').focus();
  });
  $('download-brief').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([brief], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `carsalesteam-${config.key}-enquiry.txt`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}

// Hero video: muted background loop with no controls. It plays only while some of it is on screen and the tab is
// visible; with reduced motion it stays paused and the poster shows (styles.css also hides the video then).
const video = $('hero-video');
if (video) {
  let onScreen = true;
  const sync = () => video.classList.toggle('is-playing', !video.paused);
  const want = () => onScreen && !document.hidden && !motion.matches;
  const apply = async () => {
    if (!want()) { video.pause(); return; }
    try { await video.play(); } catch { /* autoplay refused: the poster stays */ }
  };
  video.muted = true;
  video.addEventListener('play', sync);
  video.addEventListener('pause', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; apply(); }).observe(video);
  }
  motion.addEventListener('change', apply);
  document.addEventListener('visibilitychange', apply);
  apply();
}
