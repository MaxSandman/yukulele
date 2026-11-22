// Les 4 espaces principaux : Aujourd'hui, Apprendre, Morceaux, Outils.
import { store } from './store.js';
import { LESSONS } from './lessons.js';
import { esc, chordDiagram, wireDiagrams } from './ui.js';
import { pretty } from './theory.js';
import { icon, UKE_ILLUSTRATION } from './icons.js';
import { buildSession, sessionDone, startSession, nextLesson } from './session.js';
import { catalog, KINDS, allPieces, suggestSong } from './library.js';

const greeting = () => {
  const h = new Date().getHours();
  return h < 5 ? 'Bonsoir !' : h < 12 ? 'Bonjour !' : h < 18 ? 'Bon après-midi !' : 'Bonsoir !';
};
const plural = (n, w) => `${n} ${w}${n > 1 ? 's' : ''}`;

// ------------------------------------------------------------ Aujourd'hui
export function homePage(main, params) {
  const { steps, total } = buildSession();
  const done = sessionDone();
  const streak = store.streak();
  const minutes = store.minutesToday();
  const lesson = nextLesson();
  const lessonsDone = LESSONS.filter((l) => store.state.lessons[l.id]).length;
  const lessonIdx = lesson ? LESSONS.indexOf(lesson) : LESSONS.length;
  const last = store.state.last;
  const bravo = params.get('bravo');
  const firstIdx = steps.findIndex((s) => !done.done.includes(s.id));
  const allDone = done.finished || firstIdx === -1;
  const known = store.state.known;
  const nextChord = lesson && lesson.learn ? lesson.learn[0] : null;

  main.innerHTML = `
  <div class="page home">
    <header class="page-head">
      <div>
        <h1>${greeting()}</h1>
        <p class="lead">${allDone ? `Séance terminée${minutes ? ` : ${plural(minutes, 'minute')} de musique aujourd'hui` : ''}. Bravo !` : `Une petite séance de ${total} minutes ?`}</p>
      </div>
      <div class="chip-streak ${streak ? '' : 'zero'}">${icon('flame', 20)} ${streak ? `${plural(streak, 'jour')} d'affilée` : 'Commence ta série'}</div>
    </header>

    ${bravo ? `<div class="bravo card" role="status">${icon('sparkle', 28)}<div><b>Séance terminée, bravo !</b><span>${minutes ? `${plural(minutes, 'minute')} de pratique aujourd'hui. ` : ''}À demain pour la suite.</span></div></div>` : ''}

    <div class="home-grid">
      <section class="hero" aria-labelledby="seance-titre">
        <div class="hero-txt">
          <span class="eyebrow">Ta séance du jour · ${total} min</span>
          <h2 id="seance-titre">${esc(heroTitle(steps, nextChord))}</h2>
        </div>
        <ol class="steps">
          ${steps
            .map((s, i) => {
              const ok = done.done.includes(s.id);
              return `<li class="${ok ? 'done' : ''}"><a href="${s.href}" data-step="${i}">
                <span class="num">${ok ? icon('check', 18) : i + 1}</span>
                <span class="st-title">${esc(s.title)}</span>
                <span class="st-min">${s.min} min</span></a></li>`;
            })
            .join('')}
        </ol>
        <button class="btn primary xl start-session">${icon('play', 24)} ${allDone ? 'Rejouer la séance' : firstIdx > 0 ? 'Reprendre la séance' : 'Commencer la séance'}</button>
        ${UKE_ILLUSTRATION}
      </section>

      <div class="home-side">
        <section class="card side-card" aria-labelledby="reprendre-titre">
          <span class="eyebrow muted">Reprendre</span>
          ${last
            ? `<div class="resume"><span class="resume-ico" aria-hidden="true">${icon('music', 28)}</span>
                <div><h3 id="reprendre-titre">${esc(last.title)}</h3><span class="muted">${esc(last.sub || '')}</span></div>
                <a class="play-btn sm" href="${esc(last.href)}" aria-label="Reprendre ${esc(last.title)}">${icon('play', 20)}</a></div>`
            : `<div class="resume"><span class="resume-ico" aria-hidden="true">${icon('lesson', 28)}</span>
                <div><h3 id="reprendre-titre">${esc((lesson || LESSONS[0]).title)}</h3><span class="muted">Leçon ${(lesson ? lessonIdx : 0) + 1} du parcours</span></div>
                <a class="play-btn sm" href="#/lecons/${(lesson || LESSONS[0]).id}" aria-label="Ouvrir la leçon">${icon('play', 20)}</a></div>`}
        </section>

        <section class="card side-card" aria-labelledby="parcours-titre">
          <span class="eyebrow muted">Ton parcours</span>
          <h3 id="parcours-titre">${lesson ? `Étape ${lessonIdx + 1} sur ${LESSONS.length} : ${esc(lesson.title)}` : 'Parcours terminé !'}</h3>
          <div class="path-dots" role="img" aria-label="${lessonsDone} étapes terminées sur ${LESSONS.length}">
            ${LESSONS.map((l, i) => `<i class="${store.state.lessons[l.id] ? 'done' : i === lessonIdx ? 'now' : ''}"></i>`).join('')}
          </div>
          <a class="link-more" href="#/apprendre">Voir le parcours ${icon('next', 16)}</a>
        </section>

        <section class="card side-card" aria-labelledby="accords-titre">
          <h3 id="accords-titre" class="eyebrow muted">Tes accords</h3>
          <div class="chord-chips">
            ${known.length ? known.map((c) => `<a class="cchip" href="#/accords/${encodeURIComponent(c)}">${esc(pretty(c))}</a>`).join('') : '<span class="muted">Aucun pour l’instant : ils s’ajoutent au fil des leçons.</span>'}
            ${nextChord && !known.includes(nextChord) ? `<a class="cchip next" href="#/lecons/${lesson.id}">${esc(pretty(nextChord))} · bientôt</a>` : ''}
          </div>
        </section>
      </div>
    </div>
  </div>`;

  main.querySelector('.start-session').onclick = () => startSession(allDone ? 0 : Math.max(0, firstIdx));
  main.querySelectorAll('[data-step]').forEach(
    (a) =>
      (a.onclick = (e) => {
        e.preventDefault();
        startSession(+a.dataset.step);
      })
  );
}

function heroTitle(steps, nextChord) {
  if (nextChord) return `Aujourd'hui, tu apprends l'accord de ${pretty(nextChord)}`;
  const song = steps[steps.length - 1].title.replace(/^Morceau : /, '');
  return `Échauffe-toi, puis joue « ${song} »`;
}

// ------------------------------------------------------------ Apprendre
export function learnPage(main) {
  const lesson = nextLesson();
  const idx = lesson ? LESSONS.indexOf(lesson) : LESSONS.length;
  main.innerHTML = `
  <div class="page">
    <header class="page-head"><div><h1>Apprendre</h1>
      <p class="lead">Ton parcours en ${LESSONS.length} étapes. Chacune prend 5 à 20 minutes ; tu peux les refaire quand tu veux.</p></div></header>
    <div class="learn-grid">
      <ol class="path" aria-label="Parcours">
        ${LESSONS.map((l, i) => {
          const ok = store.state.lessons[l.id];
          const now = i === idx;
          return `<li class="${ok ? 'done' : ''} ${now ? 'now' : ''}">
            <a href="#/lecons/${l.id}">
              <span class="node">${ok ? icon('check', 20) : i + 1}</span>
              <span class="p-txt"><b>${esc(l.title)}</b><span class="muted">${l.minutes} min${l.learn ? ' · accord' + (l.learn.length > 1 ? 's' : '') + ' ' + l.learn.map(pretty).join(', ') : ''}</span></span>
              ${now ? `<span class="badge-now">À faire</span>` : ''}
            </a></li>`;
        }).join('')}
      </ol>
      <div class="learn-side">
        <a class="card tool-card" href="#/entrainement">
          <span class="tool-ico">${icon('repeat', 28)}</span>
          <span><b>Enchaîner les accords</b><span class="muted">L'exercice le plus utile pour progresser</span></span></a>
        <a class="card tool-card" href="#/rythme">
          <span class="tool-ico">${icon('drum', 28)}</span>
          <span><b>Les rythmes</b><span class="muted">Gratter en rythme avec le métronome</span></span></a>
        <a class="card tool-card" href="#/entrainement?mode=quiz">
          <span class="tool-ico">${icon('target', 28)}</span>
          <span><b>Quiz du manche</b><span class="muted">Retrouver les notes sur les cordes</span></span></a>
      </div>
    </div>
  </div>`;
}

// ------------------------------------------------------------ Morceaux
const FILTERS = [
  { id: 'tous', label: 'Tous' },
  { id: 'jouables', label: 'Je peux les jouer' },
  { id: 'duo', label: 'Accords + mélodie' },
  { id: 'melodie', label: 'Mélodies' },
  { id: 'mes', label: 'Mes morceaux' },
];
const LIST_TITLES = {
  tous: 'Tous les morceaux',
  jouables: 'Avec les accords que tu connais',
  duo: 'Accords + mélodie (niveau 2)',
  melodie: 'Mélodies note par note',
  mes: 'Tes morceaux traduits et ajoutés',
};

export async function libraryPage(main, params) {
  let filter = FILTERS.some((f) => f.id === params.get('f')) ? params.get('f') : 'tous';
  let term = '';
  main.innerHTML = `
  <div class="page library">
    <header class="page-head">
      <h1>Morceaux</h1>
      <div class="head-actions">
        <label class="search">${icon('search', 20)}<span class="sr">Chercher un morceau</span><input type="search" placeholder="Chercher un morceau"></label>
        <div class="add-wrap">
          <button class="btn primary add-btn" aria-expanded="false" aria-controls="add-menu">${icon('plus', 20)} Ajouter un morceau</button>
          <div class="add-menu" id="add-menu" hidden>
            <a href="#/traduire">${icon('wave', 26)}<span><b>Depuis un fichier audio</b><span class="muted">L'outil trouve le tempo et les accords</span></span></a>
            <a href="#/importer">${icon('paste', 26)}<span><b>Coller des paroles avec accords</b><span class="muted">Copiées depuis un site d'accords</span></span></a>
            <a href="#/traduire/melodie">${icon('mic', 26)}<span><b>Jouer ou chanter une mélodie</b><span class="muted">Transcrite en tablature ukulélé</span></span></a>
          </div>
        </div>
      </div>
    </header>
    <div class="chips" role="group" aria-label="Filtrer les morceaux">
      ${FILTERS.map((f) => `<button class="fchip" data-f="${f.id}" aria-pressed="false">${f.label}</button>`).join('')}
    </div>
    <section class="featured" aria-labelledby="pour-toi"></section>
    <section aria-labelledby="liste-titre">
      <h2 id="liste-titre" class="eyebrow muted"></h2>
      <ul class="song-list"><li class="muted">Chargement…</li></ul>
    </section>
  </div>`;
  const q = (s) => main.querySelector(s);
  const items = await catalog();
  if (!main.querySelector('.library')) return; // page quittée entre-temps

  const addBtn = q('.add-btn');
  addBtn.onclick = () => {
    const m = q('.add-menu');
    m.hidden = !m.hidden;
    addBtn.setAttribute('aria-expanded', String(!m.hidden));
  };

  function featured() {
    const known = store.state.known;
    const lesson = nextLesson();
    const nc = lesson && lesson.learn ? lesson.learn[0] : null;
    const song = suggestSong(nc);
    const piece = allPieces().find((p) => p.level === 1) || allPieces()[0];
    const mine = items.find((i) => i.mine);
    const cards = [
      { href: `#/chansons/${encodeURIComponent(song.id)}`, cover: song.parsed.chords[song.parsed.chords.length - 1] || 'C', color: 'teal', title: song.parsed.title, sub: nc ? `Pour pratiquer l'accord ${pretty(nc)}` : 'Avec les accords que tu connais' },
      { href: `#/niveau2/${encodeURIComponent(piece.id)}`, cover: 'duo', color: 'violet', title: piece.title, sub: 'Accords + mélodie, comme au piano' },
      mine
        ? { href: mine.href, cover: 'wave', color: 'coral', title: mine.title, sub: mine.sub }
        : { href: '#/traduire', cover: 'wave', color: 'coral', title: 'Ta chanson préférée', sub: 'Donne un fichier audio, l’outil trouve les accords' },
    ];
    void known;
    q('.featured').innerHTML = `<h2 id="pour-toi" class="eyebrow muted">Pour toi cette semaine</h2>
      <div class="feat-grid">${cards
        .map(
          (c) => `<a class="feat card" href="${c.href}"><span class="cover ${c.color}" aria-hidden="true">${c.cover === 'duo' || c.cover === 'wave' ? icon(c.cover === 'duo' ? 'duo' : 'wave', 34) : esc(pretty(c.cover))}</span>
          <span class="feat-txt"><b>${esc(c.title)}</b><span class="muted">${esc(c.sub)}</span></span></a>`
        )
        .join('')}</div>`;
  }

  function draw() {
    main.querySelectorAll('.fchip').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.f === filter)));
    q('.featured').hidden = filter !== 'tous' || !!term;
    q('#liste-titre').textContent = term ? `Résultats pour « ${term} »` : LIST_TITLES[filter];
    const t = term.toLowerCase();
    let list = items.filter((i) => {
      if (t && !(i.title + ' ' + i.sub).toLowerCase().includes(t)) return false;
      if (filter === 'jouables') return i.playable;
      if (filter === 'duo') return i.kind === 'duo';
      if (filter === 'melodie') return i.kind === 'melodie';
      if (filter === 'mes') return i.mine;
      return true;
    });
    list = list.sort((a, b) => b.playable - a.playable || a.level - b.level);
    q('.song-list').innerHTML = list.length
      ? list
          .map(
            (i) => `<li><a class="song-row" href="${i.href}">
              <span class="kind-ico ${i.kind}" aria-hidden="true">${icon(KINDS[i.kind].icon, 22)}</span>
              <span class="sr-main"><b>${esc(i.title)}</b><span class="muted">${esc(i.sub)}</span></span>
              <span class="sr-kind">${KINDS[i.kind].label}</span>
              <span class="sr-chords">${i.chords.map((c) => `<span class="${store.isKnown(c) ? 'k' : ''}">${esc(pretty(c))}</span>`).join(' · ')}</span>
              <span class="sr-level" aria-label="Difficulté ${i.level} sur 3">${'●'.repeat(i.level)}<span class="off">${'●'.repeat(3 - i.level)}</span></span>
            </a></li>`
          )
          .join('')
      : `<li class="empty">${filter === 'mes' ? 'Tu n’as pas encore ajouté de morceau. Clique sur « Ajouter un morceau » !' : filter === 'jouables' ? 'Termine les premières leçons pour débloquer des morceaux.' : 'Aucun morceau trouvé.'}</li>`;
  }

  main.querySelectorAll('.fchip').forEach(
    (b) =>
      (b.onclick = () => {
        filter = b.dataset.f;
        history.replaceState(null, '', filter === 'tous' ? '#/morceaux' : `#/morceaux?f=${filter}`);
        draw();
      })
  );
  q('.search input').oninput = (e) => {
    term = e.target.value.trim();
    draw();
  };
  featured();
  draw();
}

// ------------------------------------------------------------ Outils
export function toolsPage(main) {
  const tools = [
    ['#/accordeur', 'tuner', 'Accordeur', 'Au micro ou à l’oreille'],
    ['#/accords', 'hand', 'Accords', 'Tous les doigtés, avec le son'],
    ['#/manche', 'fretboard', 'Le manche', 'Les notes, case par case'],
    ['#/rythme', 'drum', 'Métronome et rythmes', 'Pour gratter bien en place'],
    ['#/reglages', 'settings', 'Réglages', 'Noms des notes, gaucher, sauvegarde'],
  ];
  main.innerHTML = `
  <div class="page">
    <header class="page-head"><div><h1>Outils</h1><p class="lead">Tout ce qui aide à côté du jeu.</p></div></header>
    <div class="tools-grid">${tools
      .map(([h, ic, t, d]) => `<a class="card tool-card big" href="${h}"><span class="tool-ico">${icon(ic, 30)}</span><span><b>${t}</b><span class="muted">${d}</span></span></a>`)
      .join('')}</div>
    <section class="card essentials">
      <h2 class="eyebrow muted">Les accords essentiels</h2>
      <div class="ess-row">${['C', 'Am', 'F', 'G', 'G7', 'Em', 'Dm', 'A7'].map((c) => chordDiagram(c, { size: 'sm', play: true })).join('')}</div>
    </section>
  </div>`;
  wireDiagrams(main);
}
