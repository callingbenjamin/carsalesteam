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

// Workflow demo: a local simulation; nothing leaves the page.
if (config && $('demo-panel')) {
  let current = 0;
  const tabs = document.querySelectorAll('.tab');
  const show = index => {
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
    $('demo-status').textContent = 'Ready for a human decision. This is a local simulation.';
  };
  tabs.forEach((b, i) => b.addEventListener('click', () => show(i)));
  $('demo-act').addEventListener('click', () => {
    $('demo-status').textContent = config.scenes[current].result + ' No live action was taken.';
    $('demo-act').disabled = true;
  });
  $('demo-reset').addEventListener('click', () => show(current));
  show(0);
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
