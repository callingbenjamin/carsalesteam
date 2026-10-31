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

// Workflow runs: every step is already in the HTML (see .run in styles.css). This only plays them like a live run:
// one step at a time is active, a token moves to whoever has the request, and finished steps keep their label and
// icon. Only classes and the token's transform change, so nothing on the page moves. A run plays while at least a
// quarter of it is on screen and pauses off screen; at the end it holds, cross-fades and starts again.
// Reduced motion leaves the whole run static. No scrolling and no focus changes happen during playback.
const runs = [...document.querySelectorAll('.run')];
const HOLD = 3500;
const FADE = 300;
const players = new Map();
let userPaused = false;
const pauseBtn = $('flow-pause');
const replayBtn = $('flow-replay');
const setToken = (el, p, jump) => {
  const step = p.steps[p.idx];
  if (!step) return;
  const ic = step.querySelector('.run-ic').getBoundingClientRect();
  const board = p.board.getBoundingClientRect();
  p.token.className = 'run-token ' + (step.className.match(/is-(customer|agent|team)/) || [''])[0] + (jump ? ' no-tr' : '');
  p.token.style.transform = `translate(${Math.round(ic.left - board.left + ic.width / 2)}px,${Math.round(ic.top - board.top + ic.height / 2)}px)`;
  if (jump) { void p.token.offsetWidth; p.token.classList.remove('no-tr'); }
};
const show = (el, idx, jump) => {
  const p = players.get(el);
  p.idx = idx;
  p.steps.forEach((s, i) => { s.classList.toggle('is-now', i === idx); s.classList.toggle('is-done', i < idx); });
  p.bar.style.transform = `scaleX(${(idx + 1) / p.steps.length})`;
  setToken(el, p, jump);
};
const schedule = el => {
  const p = players.get(el);
  clearTimeout(p.timer);
  p.timer = null;
  if (!p.playing) return;
  const last = p.idx >= p.steps.length - 1;
  p.timer = setTimeout(() => {
    p.timer = null;
    if (!last) { show(el, p.idx + 1); schedule(el); return; }
    restart(el, true);
  }, last ? HOLD : p.step);
};
const restart = (el, fade) => {
  const p = players.get(el);
  clearTimeout(p.timer);
  clearTimeout(p.fadeTimer);
  p.timer = null;
  const begin = () => { show(el, 0, true); el.classList.remove('is-fading'); schedule(el); };
  if (!fade) { begin(); return; }
  el.classList.add('is-fading');
  p.fadeTimer = setTimeout(begin, FADE);
};
const sync = el => {
  const p = players.get(el);
  const play = p.visible && !userPaused && !document.hidden && !el.closest('.scene:not(.is-active)');
  if (play === p.playing) return;
  p.playing = play;
  if (play) schedule(el); else { clearTimeout(p.timer); p.timer = null; }
};
const syncAll = () => runs.forEach(sync);
if (runs.length && 'IntersectionObserver' in window && !motion.matches) {
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    players.get(e.target).visible = e.isIntersecting;
    sync(e.target);
  }), { threshold: 0.25 });
  runs.forEach(el => {
    players.set(el, {
      steps: [...el.querySelectorAll('.run-step')], board: el.querySelector('.run-board'), token: el.querySelector('.run-token'),
      bar: el.querySelector('.run-bar span'), step: el.classList.contains('run-compact') ? 1300 : 1700,
      idx: 0, visible: false, playing: false, timer: null, fadeTimer: null,
    });
    el.classList.add('is-live');
    show(el, 0, true);
    io.observe(el);
  });
  // The token follows its step if the card is resized (for example on rotation); nothing else depends on size.
  window.addEventListener('resize', () => runs.forEach(el => setToken(el, players.get(el), true)), { passive: true });
  document.addEventListener('visibilitychange', syncAll);
  motion.addEventListener('change', () => {
    if (!motion.matches) return;
    runs.forEach(el => { const p = players.get(el); clearTimeout(p.timer); clearTimeout(p.fadeTimer); p.playing = false; el.classList.remove('is-live', 'is-fading'); });
  });
  if (pauseBtn && replayBtn) {
    document.documentElement.classList.add('flow-on'); // The controls were in the layout already, just invisible.
    pauseBtn.addEventListener('click', () => {
      userPaused = !userPaused;
      pauseBtn.textContent = userPaused ? 'Play' : 'Pause';
      syncAll();
    });
    replayBtn.addEventListener('click', () => {
      userPaused = false;
      pauseBtn.textContent = 'Pause';
      syncAll();
      document.querySelectorAll('.scene.is-active .run').forEach(el => restart(el, true));
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
  // Scenes are stacked in one grid cell (styles.css), so switching is a cross-fade at a constant height.
  const show = index => {
    tabs.forEach((b, i) => { b.classList.toggle('active', i === index); b.setAttribute('aria-pressed', String(i === index)); });
    scenes.forEach((s, i) => s.classList.toggle('is-active', i === index));
    syncAll();
    const el = scenes[index].querySelector('.run');
    if (players.has(el)) restart(el);
  };
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
