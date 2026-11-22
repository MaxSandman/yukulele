// Lecteur « scène » : l'accord en très grand, le suivant, les temps, le rythme et les paroles,
// lisibles à un mètre. Trois commandes visibles ; le reste dans le panneau Réglages.
import { Clock, click, strum, keepAwake } from './audio.js';
import { getVoicing, voicingMidis } from './chords.js';
import { parseSong, buildTimeline } from './parser.js';
import { PATTERNS, patternFor, patternHtml } from './rhythm.js';
import { esc, chordDiagram, chordLabel, Fretboard, fingerLegend } from './ui.js';
import { pretty } from './theory.js';
import { icon } from './icons.js';
import { store } from './store.js';
import { practiceTimer } from './session.js';

export const PRESETS = [
  { id: 'decouverte', label: 'Découverte', speed: 0.6, loop: false, metro: true },
  { id: 'entrainement', label: 'Entraînement', speed: 0.8, loop: true, metro: true },
  { id: 'concert', label: 'Concert', speed: 1, loop: false, metro: false },
];
const SPEEDS = [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.1];

/**
 * Monte le lecteur dans `el`.
 * source : texte ChordPro. opts : { backHref, embedded, actions: [{label, icon, href|onClick, danger}], kindLabel }
 */
export function mountPlayer(el, source, opts = {}) {
  let transpose = 0;
  let song;
  let tl;
  let pattern;
  const preset0 = PRESETS.find((p) => p.id === (opts.preset || 'decouverte'));
  const st = {
    preset: preset0.id,
    speed: preset0.speed,
    metro: preset0.metro,
    accomp: true,
    step: false,
    loop: preset0.loop,
    showBoard: false,
    showAll: false,
    patternId: null,
  };
  if (opts.speed) st.speed = opts.speed;
  if (opts.metro !== undefined) st.metro = opts.metro;
  let clock = null;
  let raf = 0;
  let playing = false;
  let pausedAt = null;
  let offset = 0;
  let curEv = -2;
  let stepIdx = 0;
  let board = null;
  const timer = practiceTimer();
  let remembered = false;

  function prepare() {
    song = parseSong(source, { transpose });
    tl = buildTimeline(song);
    if (!st.patternId) st.patternId = song.pattern || (song.beatsPerBar === 3 ? 'waltz' : 'd4');
    pattern = patternFor(st.patternId, song.beatsPerBar);
  }
  prepare();
  const bpm = () => Math.round(song.bpm * st.speed);

  el.classList.add('scene', 'player');
  if (opts.embedded) el.classList.add('embedded');
  el.innerHTML = `
    <header class="sc-head">
      ${opts.embedded ? '' : `<a class="icon-btn dark" href="${esc(opts.backHref || '#/morceaux')}" aria-label="Retour">${icon('back')}</a>`}
      <div class="sc-title">
        <h1>${esc(song.title || 'Chanson')}</h1>
        <span class="sc-sub">${esc(song.artist ? song.artist + ' · ' : '')}<span class="pl-bpm"></span></span>
      </div>
      <div class="segctl dark" role="group" aria-label="Mode">
        ${PRESETS.map((p) => `<button class="seg-btn" data-preset="${p.id}" aria-pressed="false">${p.label}</button>`).join('')}
      </div>
      <button class="icon-btn dark sc-gear" aria-label="Réglages du lecteur" aria-expanded="false">${icon('settings')}</button>
    </header>

    <div class="sc-stage">
      <section class="sc-now" aria-label="Accord à jouer maintenant">
        <div class="sc-now-dia"></div>
        <div class="sc-now-txt">
          <span class="sc-label ink">Maintenant</span>
          <span class="sc-now-name"></span>
          <span class="sc-now-fr"></span>
        </div>
      </section>
      <section class="sc-next" aria-label="Accord suivant">
        <span class="sc-label">Ensuite</span>
        <div class="sc-next-dia"></div>
        <span class="sc-next-name"></span>
        <span class="sc-next-when"></span>
      </section>
      <section class="sc-rhythm" aria-label="Temps et rythme">
        <span class="sc-label">Compte avec moi</span>
        <div class="sc-beats"></div>
        <span class="sc-label sc-pattern-name"></span>
        <div class="sc-pattern"></div>
      </section>
    </div>

    <section class="sc-lyrics" aria-label="Paroles">
      <span class="sc-sec"></span>
      <div class="sc-line cur"></div>
      <div class="sc-line nxt"></div>
    </section>

    <div class="sc-board" hidden><div class="sc-fb"></div>${fingerLegend()}</div>
    <section class="sc-all" hidden aria-label="Toute la chanson"><div class="pl-lyrics"></div></section>

    <footer class="sc-bar">
      <button class="icon-btn dark lg sc-restart" aria-label="Recommencer depuis le début">${icon('restart')}</button>
      <button class="play-btn sc-play" aria-label="Jouer">${icon('play', 32)}</button>
      <button class="pill dark sc-prev" hidden>${icon('back', 18)} Précédent</button>
      <button class="pill primary sc-nextbtn" hidden>Accord suivant ${icon('next', 18)}</button>
      <button class="pill dark sc-speed">${icon('speed', 20)} <span>Vitesse</span> <b class="sc-speed-v"></b></button>
      <button class="pill dark sc-loop" aria-pressed="false" aria-label="Boucler la ligne">${icon('loop', 20)} <span>Boucler la ligne</span></button>
    </footer>

    <aside class="sc-drawer" hidden aria-label="Réglages du lecteur">
      <div class="dr-head"><h2>Réglages</h2><button class="icon-btn sc-close" aria-label="Fermer les réglages">${icon('close', 18)}</button></div>
      ${song.notes ? `<p class="dr-tip">${icon('sparkle', 18)} <span>${esc(song.notes)}</span></p>` : ''}
      <label class="switch"><input type="checkbox" class="o-metro"> <span>Métronome</span></label>
      <label class="switch"><input type="checkbox" class="o-accomp"> <span>Le ukulélé joue avec moi</span></label>
      <label class="switch"><input type="checkbox" class="o-step"> <span>Pas-à-pas (j'avance moi-même)</span></label>
      <label class="switch"><input type="checkbox" class="o-board"> <span>Afficher le manche</span></label>
      <label class="switch"><input type="checkbox" class="o-all"> <span>Voir toute la chanson</span></label>
      <div class="dr-row"><span>Tonalité</span>
        <span class="stepper"><button class="icon-btn sc-tdown" aria-label="Descendre d'un demi-ton">−</button><b class="sc-tval">0</b><button class="icon-btn sc-tup" aria-label="Monter d'un demi-ton">+</button></span></div>
      <label class="dr-row">Rythme <select class="o-pattern"></select></label>
      <div class="dr-chords"><span class="sc-label ink">Accords de la chanson</span><div class="pl-chord-list"></div></div>
      ${(opts.actions || []).length ? `<div class="dr-actions">${opts.actions
        .map((a, i) => (a.href ? `<a class="btn ${a.danger ? 'danger' : ''}" href="${esc(a.href)}">${icon(a.icon || 'edit', 18)} ${esc(a.label)}</a>` : `<button class="btn ${a.danger ? 'danger' : ''}" data-action="${i}">${icon(a.icon || 'edit', 18)} ${esc(a.label)}</button>`))
        .join('')}</div>` : ''}
    </aside>
    <div class="pl-countin" hidden></div>`;

  const q = (s) => el.querySelector(s);
  board = new Fretboard(q('.sc-fb'), { frets: 7, compact: true });

  // ------------------------------------------------------------ affichage statique
  function renderControls() {
    el.querySelectorAll('[data-preset]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.preset === st.preset)));
    q('.pl-bpm').textContent = `${bpm()} BPM`;
    q('.sc-speed-v').textContent = `${Math.round(st.speed * 100)} %`;
    q('.sc-loop').setAttribute('aria-pressed', String(st.loop));
    q('.o-metro').checked = st.metro;
    q('.o-accomp').checked = st.accomp;
    q('.o-step').checked = st.step;
    q('.o-board').checked = st.showBoard;
    q('.o-all').checked = st.showAll;
    q('.sc-board').hidden = !st.showBoard;
    q('.sc-all').hidden = !st.showAll;
    q('.sc-tval').textContent = transpose > 0 ? `+${transpose}` : String(transpose);
    q('.sc-play').hidden = st.step;
    q('.sc-speed').hidden = st.step;
    q('.sc-prev').hidden = !st.step;
    q('.sc-nextbtn').hidden = !st.step;
  }

  function renderStatic() {
    q('.o-pattern').innerHTML = PATTERNS.filter((p) => p.beats === song.beatsPerBar || (song.beatsPerBar !== 3 && song.beatsPerBar !== 4 && p.id === 'd4'))
      .map((p) => `<option value="${p.id}" ${p.id === pattern.id ? 'selected' : ''}>${esc(p.name)}</option>`)
      .join('');
    q('.sc-pattern-name').textContent = `Rythme : ${pattern.name.toLowerCase()}`;
    q('.sc-pattern').innerHTML = patternHtml(pattern, { big: true });
    q('.pl-chord-list').innerHTML = song.chords.map((c) => chordDiagram(c, { size: 'sm', play: true })).join('');
    // toute la chanson
    let html = '';
    let lineNo = 0;
    song.sections.forEach((sec) => {
      html += `<section class="ly-sec">${sec.label ? `<h3 class="ly-label">${esc(sec.label)}</h3>` : ''}`;
      sec.lines.forEach((l) => {
        if (!l) {
          html += '<div class="ly-gap"></div>';
          return;
        }
        const line = tl.lines[lineNo];
        html += `<div class="ly-line" data-line="${lineNo}">${line.segs.map(segHtml).join('')}</div>`;
        lineNo++;
      });
      html += '</section>';
    });
    if (!tl.events.length) html += '<p>Aucun accord trouvé dans cette chanson.</p>';
    q('.pl-lyrics').innerHTML = html;
    renderControls();
    curEv = -2;
    showEvent(st.step ? stepIdx : 0, true);
  }

  function segHtml(s) {
    const txt = s.text.replace(/^ /, ' ').replace(/ $/, ' ') || ' ';
    return `<span class="seg ${s.ev >= 0 ? 'has' : ''}" ${s.ev >= 0 ? `data-ev="${s.ev}"` : ''}>
      <span class="ch">${s.chord ? esc(pretty(s.chord)) : s.bad ? `<i class="bad">${esc(s.bad)}?</i>` : ' '}</span>
      <span class="tx">${esc(txt)}</span></span>`;
  }

  function sectionOf(lineIdx) {
    const l = tl.lines[lineIdx];
    return l ? song.sections[l.sIdx].label : '';
  }

  // ------------------------------------------------------------ affichage d'un accord
  function showEvent(i, force = false) {
    if (i === curEv && !force) return;
    curEv = i;
    const ev = tl.events[i];
    const next = tl.events[i + 1];
    el.querySelectorAll('.pl-lyrics .seg.cur').forEach((s) => s.classList.remove('cur'));
    if (!ev) {
      q('.sc-now-dia').innerHTML = `<div class="sc-bravo">${icon('sparkle', 56)}</div>`;
      q('.sc-now-name').textContent = 'Bravo !';
      q('.sc-now-fr').textContent = 'Morceau terminé';
      q('.sc-next-dia').innerHTML = '';
      q('.sc-next-name').textContent = '';
      q('.sc-next-when').textContent = '';
      board.setMarkers([]);
      return;
    }
    const lab = chordLabel(ev.chord);
    q('.sc-now-dia').innerHTML = chordDiagram(ev.chord, { size: 'xl', play: true, title: false });
    q('.sc-now-name').textContent = lab.main;
    q('.sc-now-fr').textContent = lab.sub;
    if (next) {
      q('.sc-next-dia').innerHTML = chordDiagram(next.chord, { size: 'md', play: true, title: false });
      q('.sc-next-name').textContent = pretty(next.chord);
      q('.sc-next-when').textContent = next.chord === ev.chord ? 'Même accord, continue' : '';
    } else {
      q('.sc-next-dia').innerHTML = '';
      q('.sc-next-name').textContent = 'Fin';
      q('.sc-next-when').textContent = 'Dernier accord';
    }
    board.setChord(ev.chord);
    beatsDots(0);
    // paroles : ligne en cours + suivante
    const line = tl.lines[ev.line];
    q('.sc-sec').textContent = sectionOf(ev.line) || '';
    q('.sc-line.cur').innerHTML = line.segs.map(segHtml).join('');
    const cur = q(`.sc-line.cur .seg[data-ev="${i}"]`);
    if (cur) cur.classList.add('cur');
    const nl = tl.lines[ev.line + 1];
    q('.sc-line.nxt').innerHTML = nl ? nl.segs.map(segHtml).join('') : '';
    const all = el.querySelector(`.pl-lyrics .seg[data-ev="${i}"]`);
    if (all) all.classList.add('cur');
  }

  function beatsDots(active) {
    const ev = tl.events[Math.max(0, curEv)];
    const total = Math.min(8, ev ? Math.ceil(ev.beats) : song.beatsPerBar);
    let h = '';
    for (let k = 0; k < total; k++) h += `<span class="bd ${k < active - 1 ? 'done' : ''} ${k === active - 1 ? 'now' : ''}">${k + 1}</span>`;
    q('.sc-beats').innerHTML = h;
  }

  function eventAt(pos) {
    let lo = 0;
    let hi = tl.events.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const e = tl.events[mid];
      if (pos < e.start) hi = mid - 1;
      else if (pos >= e.start + e.beats) lo = mid + 1;
      else return mid;
    }
    return pos >= tl.total ? tl.events.length : 0;
  }

  // ------------------------------------------------------------ lecture
  function remember() {
    if (remembered || opts.embedded) return;
    remembered = true;
    store.setLast({ href: location.hash, title: song.title || 'Chanson', sub: opts.kindLabel || 'Chant + accords' });
  }

  function start(fromPos = 0) {
    if (!tl.events.length) return;
    playing = true;
    setPlayIcon();
    keepAwake(true);
    timer.start();
    remember();
    el.classList.add('is-playing');
    const countIn = song.beatsPerBar;
    offset = fromPos;
    let loopLine = null;
    clock = new Clock({
      bpm: bpm(),
      onSlot: (v, t) => {
        if (v < 0) {
          if (Math.abs(v - Math.round(v)) < 0.01) click(t, Math.round(v) === -countIn, 0.5);
          return;
        }
        const p = v + offset;
        if (p >= tl.total) return false;
        const i = eventAt(p);
        const ev = tl.events[i];
        const inBar = p % song.beatsPerBar;
        const slot = Math.round(inBar * 2) % (pattern.beats * 2);
        const onBeat = Math.abs(p - Math.round(p)) < 0.01;
        if (st.metro && onBeat) click(t, Math.round(inBar) === 0, 0.4);
        const c = pattern.slots[slot];
        if (st.accomp && ev && (c === 'D' || c === 'U' || Math.abs(p - ev.start) < 0.01)) {
          strum(voicingMidis(getVoicing(ev.chord)), t, c === 'U' ? 'U' : 'D', 0.26, 1.1);
        }
        const nextP = p + 0.5;
        if (st.loop && ev) {
          const line = tl.lines[ev.line];
          if (loopLine === null || loopLine.start > p || loopLine.end <= p) loopLine = line;
          if (nextP >= loopLine.end - 0.001) return loopLine.start - offset;
        } else loopLine = null;
        return nextP - offset;
      },
      onEnd: () => {
        stop(true);
        showEvent(tl.events.length, true);
      },
    });
    clock.start(-countIn);
    loop();
  }

  function loop() {
    const raw = clock ? clock.now() : null;
    const ci = q('.pl-countin');
    if (raw !== null) {
      const pos = raw + offset;
      if (raw < 0) {
        ci.hidden = false;
        ci.textContent = String(Math.ceil(-raw));
      } else {
        ci.hidden = true;
        const i = eventAt(pos);
        showEvent(i);
        const ev = tl.events[i];
        if (ev) {
          const into = pos - ev.start;
          const left = ev.beats - into;
          beatsDots(Math.floor(into) + 1);
          const next = tl.events[i + 1];
          const nc = q('.sc-next');
          if (next && next.chord !== ev.chord) {
            const n = Math.ceil(left);
            q('.sc-next-when').innerHTML = n <= 1 ? '<b>Prépare-toi !</b>' : `dans <b>${n}</b> temps`;
            nc.classList.toggle('soon', left <= 1);
          } else nc.classList.remove('soon');
          const slot = Math.floor((pos % song.beatsPerBar) * 2) % (pattern.beats * 2);
          el.querySelectorAll('.sc-pattern .slot').forEach((s, k) => s.classList.toggle('now', k === slot));
        }
        pausedAt = pos;
      }
    }
    if (playing) raf = requestAnimationFrame(loop);
  }

  function setPlayIcon() {
    const b = q('.sc-play');
    b.innerHTML = icon(playing ? 'pause' : 'play', 32);
    b.setAttribute('aria-label', playing ? 'Pause' : 'Jouer');
  }

  function stop(ended = false) {
    playing = false;
    clock && clock.stop();
    cancelAnimationFrame(raf);
    setPlayIcon();
    q('.pl-countin').hidden = true;
    q('.sc-next').classList.remove('soon');
    el.classList.remove('is-playing');
    el.querySelectorAll('.sc-pattern .slot.now').forEach((s) => s.classList.remove('now'));
    keepAwake(false);
    timer.stop();
    if (ended) pausedAt = null;
  }

  function restart() {
    stop();
    pausedAt = null;
    stepIdx = 0;
    showEvent(0, true);
  }

  function restartAt(pos) {
    const was = playing;
    stop();
    if (was) start(pos);
  }

  // ------------------------------------------------------------ pas-à-pas
  function stepTo(i) {
    stepIdx = Math.max(0, Math.min(tl.events.length, i));
    showEvent(stepIdx, true);
    const ev = tl.events[stepIdx];
    if (ev && st.accomp) strum(voicingMidis(getVoicing(ev.chord)), 0, 'D', 0.35);
    remember();
    timer.start();
  }

  function setStep(on) {
    st.step = on;
    stop();
    if (on) {
      stepIdx = Math.max(0, curEv < tl.events.length ? curEv : 0);
      showEvent(stepIdx, true);
    } else timer.stop();
    renderControls();
  }

  function setPreset(id) {
    const p = PRESETS.find((x) => x.id === id);
    st.preset = id;
    st.speed = p.speed;
    st.loop = p.loop;
    st.metro = p.metro;
    if (clock) clock.bpm = bpm();
    renderControls();
  }

  function toggleDrawer(open) {
    const d = q('.sc-drawer');
    d.hidden = open === undefined ? !d.hidden : !open;
    q('.sc-gear').setAttribute('aria-expanded', String(!d.hidden));
    if (!d.hidden) q('.sc-close').focus();
  }

  // ------------------------------------------------------------ événements
  q('.sc-play').onclick = () => {
    if (playing) stop();
    else if (pausedAt !== null && pausedAt < tl.total) start(Math.floor(pausedAt));
    else {
      pausedAt = null;
      start(0);
    }
  };
  q('.sc-restart').onclick = restart;
  q('.sc-prev').onclick = () => stepTo(stepIdx - 1);
  q('.sc-nextbtn').onclick = () => stepTo(stepIdx + 1);
  q('.sc-speed').onclick = () => {
    const k = SPEEDS.findIndex((s) => Math.abs(s - st.speed) < 0.01);
    st.speed = SPEEDS[(k + 1) % SPEEDS.length];
    if (clock) clock.bpm = bpm();
    renderControls();
  };
  q('.sc-loop').onclick = () => {
    st.loop = !st.loop;
    renderControls();
  };
  el.querySelectorAll('[data-preset]').forEach((b) => (b.onclick = () => setPreset(b.dataset.preset)));
  q('.sc-gear').onclick = () => toggleDrawer();
  q('.sc-close').onclick = () => toggleDrawer(false);
  q('.o-metro').onchange = (e) => (st.metro = e.target.checked);
  q('.o-accomp').onchange = (e) => (st.accomp = e.target.checked);
  q('.o-step').onchange = (e) => {
    setStep(e.target.checked);
    e.target.blur();
  };
  q('.o-board').onchange = (e) => {
    st.showBoard = e.target.checked;
    renderControls();
  };
  q('.o-all').onchange = (e) => {
    st.showAll = e.target.checked;
    renderControls();
  };
  q('.o-pattern').onchange = (e) => {
    st.patternId = e.target.value;
    pattern = patternFor(st.patternId, song.beatsPerBar);
    q('.sc-pattern-name').textContent = `Rythme : ${pattern.name.toLowerCase()}`;
    q('.sc-pattern').innerHTML = patternHtml(pattern, { big: true });
  };
  const retranspose = (d) => {
    transpose = Math.max(-11, Math.min(11, transpose + d));
    const pos = pausedAt;
    const was = playing;
    stop();
    prepare();
    renderStatic();
    if (was && pos !== null) start(Math.floor(pos));
  };
  q('.sc-tdown').onclick = () => retranspose(-1);
  q('.sc-tup').onclick = () => retranspose(1);
  el.querySelectorAll('[data-action]').forEach((b) => (b.onclick = () => opts.actions[+b.dataset.action].onClick()));

  // clic sur un morceau de paroles : y aller
  el.addEventListener('click', (e) => {
    const d = e.target.closest('.diagram[data-play]');
    if (d) {
      strum(voicingMidis(getVoicing(d.dataset.chord)), 0, 'D', 0.4);
      return;
    }
    const seg = e.target.closest('.seg[data-ev]');
    if (!seg) return;
    const i = +seg.dataset.ev;
    if (st.step) return stepTo(i);
    pausedAt = tl.events[i].start;
    showEvent(i, true);
    restartAt(pausedAt);
  });
  const onKey = (e) => {
    if (e.target.closest('textarea, select, input[type=text], input[type=search], input[type=number]')) return;
    if (e.code === 'Space') {
      e.preventDefault();
      if (st.step) stepTo(stepIdx + 1);
      else q('.sc-play').click();
    } else if (e.code === 'ArrowRight' && st.step) stepTo(stepIdx + 1);
    else if (e.code === 'ArrowLeft' && st.step) stepTo(stepIdx - 1);
    else if (e.code === 'Escape') toggleDrawer(false);
  };
  document.addEventListener('keydown', onKey);

  renderStatic();

  return () => {
    stop();
    timer.stop();
    document.removeEventListener('keydown', onKey);
  };
}
