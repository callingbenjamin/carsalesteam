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

// Workflow runs: every step and every message is already in the HTML (see .run and .convo in styles.css). This only
// plays them like a short film of one enquiry. Opening: the run fades up and its headings arrive in a stagger.
// Then one step at a time comes into focus, a token glides to whoever has the request, and the example conversation
// follows: a typing indicator, then the message rises in, and earlier messages fade back. Hand-offs and approvals
// get a short pause. Closing: a check draws in with the closing line, holds, and the run cross-fades back to the
// start. Only classes, opacity and transforms change, so nothing on the page moves or resizes. A run plays while at
// least a quarter of it is on screen and pauses off screen. Reduced motion leaves the whole run and conversation
// static. No scrolling and no focus changes happen during playback.
const runs = [...document.querySelectorAll('.run')];
const HOLD = 3500;
const FADE = 450;
const TYPE = 750;
const INTRO = 1100;
const PAUSE = 700;
const players = new Map();
let userPaused = false;
const pauseBtn = $('flow-pause');
const replayBtn = $('flow-replay');
const actorOf = el => (el.className.match(/is-(customer|agent|team)/) || [''])[0];
// Layout position inside a box, unaffected by transforms (the step in focus is slightly scaled).
const offsetIn = (el, box) => {
  let x = 0, y = 0;
  for (let e = el; e && e !== box; e = e.offsetParent) { x += e.offsetLeft; y += e.offsetTop; }
  return [x, y];
};
const setToken = (p, jump) => {
  const step = p.steps[Math.max(p.idx, 0)];
  if (!step) return;
  const ic = step.querySelector('.run-ic');
  const [x, y] = offsetIn(ic, p.board);
  p.token.className = 'run-token ' + actorOf(step) + (jump ? ' no-tr' : '');
  p.token.style.transform = `translate(${Math.round(x + ic.offsetWidth / 2)}px,${Math.round(y + ic.offsetHeight / 2)}px)`;
  if (jump) { void p.token.offsetWidth; p.token.classList.remove('no-tr'); }
};
const showStep = (p, k, jump) => {
  p.idx = k;
  p.steps.forEach((s, i) => { s.classList.toggle('is-now', i === k); s.classList.toggle('is-done', i < k); });
  p.bar.style.transform = `scaleX(${(k + 1) / p.steps.length})`;
  p.el.classList.add('has-step');
  setToken(p, jump);
};
// Keep the newest message just above the typing indicator by moving the list inside its clipped panel.
const follow = p => {
  if (!p.list || !p.latest) return;
  const y = Math.max(0, p.latest.offsetTop + p.latest.offsetHeight - (p.view.clientHeight - 44));
  p.list.style.transform = y ? `translateY(${-y}px)` : '';
};
const typeOn = (p, m) => {
  p.typing.className = `convo-typing is-on ${actorOf(m)}${m.classList.contains('is-customer') ? '' : ' is-right'}`;
};
const reveal = (p, m) => {
  p.typing.classList.remove('is-on');
  if (p.latest) p.latest.classList.remove('is-latest');
  m.classList.add('is-in', 'is-latest');
  p.latest = m;
  follow(p);
};
// The film as a list of beats: [wait before it, what happens].
const build = p => {
  const t = [];
  let gap = 0;
  p.steps.forEach((st, k) => {
    t.push([gap, () => showStep(p, k)]);
    gap = 0;
    const ms = p.byStep[k] || [];
    if (!ms.length) gap = p.base;
    ms.forEach(m => {
      if (m.classList.contains('is-team')) t.push([gap + 450, () => reveal(p, m)]);
      else { t.push([gap + 350, () => typeOn(p, m)]); t.push([TYPE, () => reveal(p, m)]); }
      gap = Math.min(2600, 900 + m.querySelector('.msg-text').textContent.length * 16);
    });
    if (st.classList.contains('is-approval') || st.classList.contains('is-handoff')) gap += PAUSE;
  });
  t.push([gap, () => p.el.classList.add('is-end')]);
  t.push([HOLD, () => restart(p, true)]);
  return t;
};
const tick = p => {
  clearTimeout(p.timer);
  p.timer = null;
  if (!p.playing || p.busy) return;
  const [wait, beat] = p.tl[p.i];
  p.timer = setTimeout(() => { p.timer = null; p.i += 1; beat(); tick(p); }, wait);
};
// Back to the first step, with every change applied at once (the run is faded out or not yet open).
const reset = p => {
  p.el.classList.add('is-reset');
  p.el.classList.remove('is-end');
  p.msgs.forEach(m => m.classList.remove('is-in', 'is-latest'));
  p.latest = null;
  if (p.list) { p.typing.classList.remove('is-on'); p.list.style.transform = ''; }
  showStep(p, 0, true);
  void p.el.offsetWidth;
  p.el.classList.remove('is-reset');
  p.i = 0;
};
const restart = (p, fade) => {
  if (!p.opened) return; // The opening beat starts it.
  clearTimeout(p.timer);
  clearTimeout(p.fadeTimer);
  p.timer = null;
  const begin = () => { reset(p); p.busy = false; p.el.classList.remove('is-fading'); tick(p); };
  if (!fade) { begin(); return; }
  p.busy = true;
  p.el.classList.add('is-fading');
  p.fadeTimer = setTimeout(begin, FADE);
};
const sync = p => {
  const play = p.visible && !userPaused && !document.hidden && !p.el.closest('.scene:not(.is-active)');
  if (play === p.playing) return;
  p.playing = play;
  if (!play) { clearTimeout(p.timer); p.timer = null; return; }
  if (!p.opened) {
    p.opened = true;
    p.busy = true;
    p.el.classList.add('is-open');
    p.fadeTimer = setTimeout(() => { p.busy = false; tick(p); }, INTRO);
    return;
  }
  tick(p);
};
const syncAll = () => players.forEach(sync);
if (runs.length && 'IntersectionObserver' in window && !motion.matches) {
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    const p = players.get(e.target);
    p.visible = e.isIntersecting;
    sync(p);
  }), { threshold: 0.25 });
  runs.forEach(el => {
    const msgs = [...el.querySelectorAll('.msg')];
    const byStep = [];
    msgs.forEach(m => { const s = Number(m.dataset.s); (byStep[s] = byStep[s] || []).push(m); });
    const p = {
      el, steps: [...el.querySelectorAll('.run-step')], board: el.querySelector('.run-board'), token: el.querySelector('.run-token'),
      bar: el.querySelector('.run-bar span'), list: el.querySelector('.convo-list'), view: el.querySelector('.convo-view'),
      typing: el.querySelector('.convo-typing'), msgs, byStep, latest: null,
      base: el.classList.contains('run-compact') ? 1300 : 1700,
      i: 0, idx: -1, visible: false, playing: false, opened: false, busy: false, timer: null, fadeTimer: null,
    };
    p.tl = build(p);
    players.set(el, p);
    el.classList.add('is-live');
    // Nothing is in focus until the opening beat has played; the token waits on the first step.
    p.bar.style.transform = 'scaleX(0)';
    setToken(p, true);
    io.observe(el);
  });
  // The token and the conversation follow their place if a card is resized (for example on rotation).
  window.addEventListener('resize', () => players.forEach(p => { setToken(p, true); follow(p); }), { passive: true });
  document.addEventListener('visibilitychange', syncAll);
  motion.addEventListener('change', () => {
    if (!motion.matches) return;
    players.forEach(p => {
      clearTimeout(p.timer); clearTimeout(p.fadeTimer); p.playing = false;
      p.el.classList.remove('is-live', 'is-fading', 'is-end', 'is-open');
      if (p.list) p.list.style.transform = '';
    });
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
      document.querySelectorAll('.scene.is-active .run').forEach(el => restart(players.get(el), true));
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
    if (players.has(el)) restart(players.get(el));
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
