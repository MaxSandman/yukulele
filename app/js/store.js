// Sauvegarde locale (dans le navigateur) : réglages, progression, chansons perso.
const KEY = 'ukulele.v1';

const DEFAULTS = {
  settings: {
    names: 'both', // 'fr' | 'en' | 'both'
    view: 'player', // 'player' = corde de Sol en haut (comme quand tu regardes ton ukulélé), 'tab' = La en haut
    lefty: false,
    volume: 0.8,
    theme: 'auto',
  },
  lessons: {}, // id -> true
  known: [], // accords maîtrisés
  songs: [], // chansons perso {id, source, created}
  arrangements: [], // morceaux niveau 2 perso (mélodies transcrites)
  favorites: [],
  practice: {}, // 'AAAA-MM-JJ' -> secondes jouées
  last: null, // dernier morceau joué {href, title, sub, kind}
  sessions: {}, // 'AAAA-MM-JJ' -> étapes de la séance du jour terminées
};

export const today = (d = new Date()) => {
  const z = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULTS);
    const s = JSON.parse(raw);
    return {
      ...structuredClone(DEFAULTS),
      ...s,
      settings: { ...DEFAULTS.settings, ...(s.settings || {}) },
    };
  } catch {
    return structuredClone(DEFAULTS);
  }
}

let state = load();
const listeners = new Set();

export const store = {
  get state() {
    return state;
  },
  get settings() {
    return state.settings;
  },
  update(fn) {
    fn(state);
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* stockage indisponible (navigation privée) */
    }
    listeners.forEach((l) => l(state));
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  export() {
    return JSON.stringify(state, null, 2);
  },
  import(json) {
    const s = JSON.parse(json);
    if (!s || typeof s !== 'object' || !s.settings) throw new Error('Fichier non reconnu');
    store.update((st) => {
      Object.assign(st, structuredClone(DEFAULTS), s);
      st.settings = { ...DEFAULTS.settings, ...s.settings };
    });
  },
  reset() {
    store.update((st) => Object.assign(st, structuredClone(DEFAULTS)));
  },
  isKnown(chord) {
    return state.known.includes(chord);
  },
  /** Ajoute du temps de pratique pour aujourd'hui. */
  logPractice(seconds) {
    if (!seconds || seconds < 1) return;
    store.update((st) => {
      st.practice ||= {};
      const d = today();
      st.practice[d] = Math.round((st.practice[d] || 0) + seconds);
    });
  },
  /** Nombre de jours d'affilée avec de la pratique (aujourd'hui compris, ou jusqu'à hier). */
  streak() {
    const p = state.practice || {};
    let n = 0;
    const d = new Date();
    if (!p[today(d)]) d.setDate(d.getDate() - 1);
    while (p[today(d)]) {
      n++;
      d.setDate(d.getDate() - 1);
    }
    return n;
  },
  minutesToday() {
    return Math.round(((state.practice || {})[today()] || 0) / 60);
  },
  setLast(item) {
    store.update((st) => (st.last = { ...item, at: Date.now() }));
  },
  setKnown(chord, on) {
    store.update((st) => {
      const set = new Set(st.known);
      on ? set.add(chord) : set.delete(chord);
      st.known = [...set];
    });
  },
};
