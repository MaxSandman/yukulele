// Séance du jour (4 étapes enchaînées) + mesure du temps de pratique.
import { store, today } from './store.js';
import { LESSONS } from './lessons.js';
import { suggestSong } from './library.js';
import { pretty } from './theory.js';
import { esc } from './ui.js';
import { icon } from './icons.js';

const KEY = 'uku-session';

export function nextLesson() {
  return LESSONS.find((l) => !store.state.lessons[l.id]) || null;
}

/** Les 4 étapes de la séance du jour, calculées d'après la progression. */
export function buildSession() {
  const known = store.state.known;
  const lesson = nextLesson();
  const newChord = lesson && lesson.learn ? lesson.learn[0] : null;
  const steps = [{ id: 'tune', title: 'Accorder le ukulélé', min: 1, href: '#/accordeur' }];
  if (known.length >= 2) {
    const pair = known.slice(-2);
    steps.push({ id: 'warm', title: `Échauffement : ${pair.map(pretty).join(' ↔ ')}`, min: 3, href: `#/entrainement?chords=${pair.join(',')}&bpm=60` });
  } else {
    steps.push({ id: 'warm', title: 'Échauffement : gratter en rythme', min: 3, href: '#/rythme' });
  }
  if (lesson) {
    steps.push({
      id: 'lesson',
      title: newChord ? `Nouveau : l'accord de ${pretty(newChord)}` : `Leçon : ${lesson.title}`,
      min: Math.min(10, lesson.minutes),
      href: `#/lecons/${lesson.id}`,
    });
  } else {
    steps.push({ id: 'lesson', title: 'Rythme du jour : « Island »', min: 3, href: '#/rythme' });
  }
  const song = suggestSong(newChord);
  steps.push({ id: 'song', title: `Morceau : ${song.parsed.title}`, min: 5, href: `#/chansons/${encodeURIComponent(song.id)}` });
  return { steps, total: steps.reduce((a, s) => a + s.min, 0) };
}

export function sessionDone() {
  return (store.state.sessions || {})[today()] || { done: [], finished: false };
}

function markDone(stepId, finished = false) {
  store.update((st) => {
    st.sessions ||= {};
    const d = (st.sessions[today()] ||= { done: [], finished: false });
    if (stepId && !d.done.includes(stepId)) d.done.push(stepId);
    if (finished) d.finished = true;
  });
}

function getRun() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || 'null');
  } catch {
    return null;
  }
}
function setRun(r) {
  try {
    if (r) sessionStorage.setItem(KEY, JSON.stringify(r));
    else sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function startSession(fromIdx = 0) {
  const { steps } = buildSession();
  const done = sessionDone().done;
  let idx = fromIdx;
  while (idx < steps.length - 1 && done.includes(steps[idx].id)) idx++;
  setRun({ steps, idx, day: today() });
  location.hash = steps[idx].href;
}

/** Barre « Séance du jour » affichée en bas de l'écran pendant la séance. */
export function renderSessionBar() {
  let bar = document.getElementById('session-bar');
  const run = getRun();
  if (!run || run.day !== today()) {
    if (bar) bar.remove();
    document.body.classList.remove('in-session');
    return;
  }
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'session-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Séance du jour');
    document.body.appendChild(bar);
  }
  document.body.classList.add('in-session');
  const step = run.steps[run.idx];
  const last = run.idx === run.steps.length - 1;
  bar.innerHTML = `
    <div class="sb-dots" aria-hidden="true">${run.steps.map((s, i) => `<i class="${i < run.idx ? 'done' : i === run.idx ? 'now' : ''}"></i>`).join('')}</div>
    <div class="sb-txt"><small>Séance du jour · étape ${run.idx + 1} sur ${run.steps.length}</small><b>${esc(step.title)}</b></div>
    <a class="btn ghost sm sb-here" href="${step.href}">Revenir à l'étape</a>
    <button class="btn primary sb-next">${last ? 'Terminer la séance' : 'Étape suivante'} ${icon('next', 18)}</button>
    <button class="icon-btn sb-quit" aria-label="Quitter la séance">${icon('close', 18)}</button>`;
  const here = location.hash === step.href;
  bar.querySelector('.sb-here').hidden = here;
  bar.querySelector('.sb-next').onclick = () => {
    markDone(step.id, last);
    if (last) {
      setRun(null);
      location.hash = '#/?bravo=1';
    } else {
      run.idx++;
      setRun(run);
      location.hash = run.steps[run.idx].href;
    }
  };
  bar.querySelector('.sb-quit').onclick = () => {
    setRun(null);
    renderSessionBar();
  };
}

/** Chronomètre de pratique : à démarrer quand la musique joue. */
export function practiceTimer() {
  let t0 = null;
  let iv = null;
  const flush = () => {
    if (t0 === null) return;
    const now = Date.now();
    store.logPractice((now - t0) / 1000);
    t0 = now;
  };
  return {
    start() {
      if (t0 !== null) return;
      t0 = Date.now();
      iv = setInterval(flush, 15000);
    },
    stop() {
      flush();
      t0 = null;
      clearInterval(iv);
    },
  };
}
