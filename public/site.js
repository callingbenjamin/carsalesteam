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

// Request runs: each one plays like a live run once it is a quarter on screen, and pauses off screen. The steps
// and the example conversation are already in the HTML; styles.css hides and reveals them (never with reduced
// motion), and this only starts, pauses and replays the CSS animations, and keeps the live status in step.
const runs = [...document.querySelectorAll('.run')];
// Every step keeps its place in the layout the whole time: only opacity and transform animate, so nothing on
// the page moves. A replay fades the finished run out, then starts again from the first step.
const reset = run => {
  run.classList.add('is-reset');
  void run.offsetWidth; // Restarts the CSS animations from the first step.
  delete run.dataset.lane;
  run.classList.remove('is-reset', 'is-done', 'is-fading');
};
const restart = (run, fade = true) => {
  clearTimeout(run.fadeTimer);
  clearTimeout(run.holdTimer);
  clearTimeout(run.loopTimer);
  if (!fade) return reset(run);
  run.classList.add('is-fading');
  run.fadeTimer = setTimeout(() => reset(run), 450); // Matches the .45s fade in styles.css.
};
const LANES = ['lane-customer', 'lane-agent', 'lane-team'];
runs.forEach(run => {
  const now = run.querySelector('.run-now');
  const steps = [...run.querySelectorAll('.run-step')];
  const last = steps[steps.length - 1];
  // As each step rises, the status line names it and the token moves to the lane that now has the request.
  // Both only change text inside a fixed, single-line box and a data attribute that styles.css turns into opacity
  // and transform, so nothing moves.
  run.addEventListener('animationstart', e => {
    if (e.animationName !== 'run-rise' || !steps.includes(e.target)) return;
    const i = steps.indexOf(e.target);
    if (now) now.textContent = `Step ${i + 1} of ${steps.length} · ${e.target.dataset.label}`;
    run.dataset.lane = String(LANES.findIndex(c => e.target.classList.contains(c)));
  });
  run.addEventListener('animationend', e => {
    if (e.target !== last || e.animationName !== 'run-rise') return;
    clearTimeout(run.holdTimer);
    clearTimeout(run.loopTimer);
    // Closing beat: holds on the closed record and its summary, offers a replay, then cross-fades into the next
    // loop. Off screen the new loop waits, paused, until the run is back in view.
    run.holdTimer = setTimeout(() => run.classList.add('is-done'), 1200);
    run.loopTimer = setTimeout(() => restart(run), 5200);
  });
  run.querySelector('.run-replay').addEventListener('click', () => restart(run));
});
// A run plays while a quarter of it is on screen, its scenario is the one shown, and the visitor has not paused.
let userPaused = false;
const seen = new Set();
const sync = run => run.classList.toggle('is-playing', seen.has(run) && !userPaused && !run.closest('.scene:not(.is-active)'));
const syncAll = () => runs.forEach(sync);
if (!('IntersectionObserver' in window)) { runs.forEach(run => seen.add(run)); syncAll(); }
else {
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) seen.add(e.target); else seen.delete(e.target);
    sync(e.target);
  }), { threshold: 0.25 });
  runs.forEach(run => io.observe(run));
}
const pauseBtn = $('flow-pause');
if (pauseBtn && runs.length && !motion.matches) {
  document.documentElement.classList.add('flow-on'); // The control was in the layout already, just invisible.
  pauseBtn.addEventListener('click', () => {
    userPaused = !userPaused;
    pauseBtn.textContent = userPaused ? 'Play' : 'Pause';
    syncAll();
  });
}
document.querySelectorAll('.rise-group').forEach(g => {
  if (motion.matches || !('IntersectionObserver' in window)) return;
  g.classList.add('is-armed');
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { g.classList.add('is-running'); io.disconnect(); } }, { threshold: 0.25 });
  io.observe(g);
});

// Scenario tabs: the scenarios share one place on the page, so switching cross-fades without moving anything,
// and the chosen one plays from its first step.
const scenes = [...document.querySelectorAll('.scene')];
const tabs = [...document.querySelectorAll('.tab')];
if (scenes.length && tabs.length) {
  const show = index => {
    tabs.forEach((b, i) => { b.classList.toggle('active', i === index); b.setAttribute('aria-pressed', String(i === index)); });
    scenes.forEach((s, i) => { s.classList.toggle('is-active', i === index); s.inert = i !== index; });
    const run = scenes[index].querySelector('.run');
    if (run) restart(run, false);
    syncAll();
  };
  scenes.forEach(s => { s.inert = !s.classList.contains('is-active'); });
  tabs.forEach((b, i) => b.addEventListener('click', () => show(i)));
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
