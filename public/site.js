'use strict';
// Shared behaviour for every CarSalesTeam page. Each block only runs when its markup is present.
const $ = id => document.getElementById(id);

// Header: compact bar once the page scrolls.
const header = document.querySelector('.top');
if (header) {
  const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 65);
  window.addEventListener('scroll', updateHeader, { passive: true });
  // No check at start-up: reading the scroll position then forces the layout that follows the web font swap into
  // one long script task. A page opened part-way down (an anchor link or a reload) fires a scroll event anyway.
}
document.querySelectorAll('.mobile nav a').forEach(a =>
  a.addEventListener('click', () => document.querySelector('.mobile').removeAttribute('open')));

const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const configEl = $('config');
const config = configEl ? JSON.parse(configEl.textContent) : null;

// Workflow flows: every step is already in the HTML. This only plays them like a live run (see .flow in
// styles.css): while at least a quarter of a flow is on screen it plays; off screen it pauses. At the end it holds,
// then plays again. Reduced motion leaves everything static.
const flows = [...document.querySelectorAll('.flow')];
const HOLD = 4000;
const players = new Map();
let userPaused = false;
const pauseBtn = $('flow-pause');
const replayBtn = $('flow-replay');
const restart = el => {
  const p = players.get(el);
  clearTimeout(p.timer);
  p.ended = false;
  el.classList.remove('is-armed');
  void el.offsetWidth; // Restart the CSS animations from the first step.
  el.classList.add('is-armed');
  sync(el);
};
const sync = el => {
  const p = players.get(el);
  const play = p.visible && !userPaused && !document.hidden && !el.closest('[hidden]');
  el.classList.toggle('is-running', play && !p.ended);
  if (play && p.ended && !p.timer) p.timer = setTimeout(() => { p.timer = null; restart(el); }, HOLD);
  if (!play && p.timer) { clearTimeout(p.timer); p.timer = null; }
};
const syncAll = () => flows.forEach(sync);
if (flows.length && 'IntersectionObserver' in window && !motion.matches) {
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    players.get(e.target).visible = e.isIntersecting;
    sync(e.target);
  }), { threshold: 0.25 });
  flows.forEach(el => {
    players.set(el, { visible: false, ended: false, timer: null });
    el.classList.add('is-armed');
    el.querySelector('.flow-fill').addEventListener('animationend', () => { players.get(el).ended = true; sync(el); });
    io.observe(el);
  });
  document.addEventListener('visibilitychange', syncAll);
  motion.addEventListener('change', () => { if (motion.matches) flows.forEach(el => { el.classList.remove('is-armed', 'is-running'); clearTimeout(players.get(el).timer); }); });
  if (pauseBtn && replayBtn) {
    pauseBtn.hidden = replayBtn.hidden = false;
    pauseBtn.addEventListener('click', () => {
      userPaused = !userPaused;
      pauseBtn.textContent = userPaused ? 'Play' : 'Pause';
      syncAll();
    });
    replayBtn.addEventListener('click', () => {
      userPaused = false;
      pauseBtn.textContent = 'Pause';
      document.querySelectorAll('.scene:not([hidden]) .flow').forEach(restart);
    });
  }
}
document.querySelectorAll('.rise-group').forEach(g => {
  if (motion.matches || !('IntersectionObserver' in window)) return;
  g.classList.add('is-armed');
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { g.classList.add('is-running'); io.disconnect(); } }, { threshold: 0.25 });
  io.observe(g);
});

// Scenario tabs: show one scenario's full run at a time and play it from the start.
const scenes = [...document.querySelectorAll('.scene')];
const tabs = [...document.querySelectorAll('.tab')];
if (scenes.length && tabs.length) {
  document.documentElement.classList.add('js-flow');
  const show = index => {
    tabs.forEach((b, i) => { b.classList.toggle('active', i === index); b.setAttribute('aria-pressed', String(i === index)); });
    scenes.forEach((s, i) => { s.hidden = i !== index; });
    const el = scenes[index].querySelector('.flow');
    if (players.has(el)) restart(el);
  };
  tabs.forEach((b, i) => b.addEventListener('click', () => show(i)));
  scenes.forEach((s, i) => { s.hidden = i !== 0; });
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
    brief = `CarSalesTeam enquiry

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
    a.download = `carsalesteam-enquiry.txt`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}

// Hero video: honours reduced motion and stays under the visitor's control.
const video = $('hero-video');
const videoToggle = $('video-toggle');
if (video && videoToggle) {
  let userPaused = false;
  const update = () => {
    // The play/pause symbol is drawn by CSS and not spoken, so the button's name is exactly its visible words.
    videoToggle.textContent = video.paused ? 'Play video' : 'Pause video';
    videoToggle.classList.toggle('is-paused', video.paused);
    video.classList.toggle('is-playing', !video.paused);
  };
  const start = async () => { try { await video.play(); } catch { update(); } };
  video.muted = true;
  video.addEventListener('play', update);
  video.addEventListener('pause', update);
  video.addEventListener('error', () => { videoToggle.hidden = true; });
  videoToggle.addEventListener('click', () => {
    if (video.paused) { userPaused = false; start(); } else { userPaused = true; video.pause(); }
  });
  motion.addEventListener('change', () => {
    if (motion.matches) { video.pause(); videoToggle.hidden = true; }
    else { videoToggle.hidden = false; if (!userPaused) start(); }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause();
    else if (!motion.matches && !userPaused) start();
  });
  if (motion.matches) videoToggle.hidden = true; else start();
}

// Home hero: slow crossfade through the industry photographs.
const slides = document.querySelectorAll('.hero-slides img');
if (slides.length > 1) {
  let i = 0, timer = null;
  const label = $('slide-label');
  // Later slides ship without image URLs (see posterPicture in src/assets.mjs); load one a slide ahead of time.
  const load = img => {
    if (!img.dataset.src) return;
    img.parentElement.querySelectorAll('source[data-srcset]').forEach(s => { s.srcset = s.dataset.srcset; s.removeAttribute('data-srcset'); });
    img.src = img.dataset.src;
    img.removeAttribute('data-src');
  };
  const step = () => {
    slides[i].classList.remove('on');
    i = (i + 1) % slides.length;
    load(slides[i]);
    slides[i].classList.add('on');
    load(slides[(i + 1) % slides.length]);
    if (label) label.textContent = slides[i].dataset.label;
  };
  const run = () => {
    if (timer || motion.matches || document.hidden) return;
    timer = setInterval(step, 5000);
    // Fetch the next photo once the page has finished loading, well before the first crossfade.
    if (document.readyState === 'complete') load(slides[(i + 1) % slides.length]);
    else window.addEventListener('load', () => load(slides[(i + 1) % slides.length]), { once: true });
  };
  const stop = () => { clearInterval(timer); timer = null; };
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : run()));
  motion.addEventListener('change', () => (motion.matches ? stop() : run()));
  run();
}
