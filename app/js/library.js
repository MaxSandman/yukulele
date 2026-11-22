// Catalogue unique de tous les morceaux : chansons, mélodies, niveau 2, morceaux traduits.
import { store } from './store.js';
import { BUILTIN_SONGS } from './songs.js';
import { parseSong, songDifficulty } from './parser.js';
import { PIECES } from './arrange.js';
import { MELODIES } from './melodies.js';
import { tracks } from './analysis.js';
import { parseChord, transposeChord } from './theory.js';
import { chordStars } from './ui.js';

export function allSongs() {
  const custom = store.state.songs.map((s) => ({ ...s, custom: true }));
  return [...BUILTIN_SONGS, ...custom].map((s) => {
    const p = parseSong(s.source);
    return { ...s, parsed: p, difficulty: songDifficulty(p.chords) };
  });
}
export const findSong = (id) => allSongs().find((s) => s.id === id);

export function knowsAll(chords) {
  const known = new Set(store.state.known);
  return chords.length > 0 && chords.every((c) => known.has(c));
}
export const canPlay = (song) => knowsAll(song.parsed.chords);

export function songLevel(song) {
  const max = Math.max(0, ...song.parsed.chords.map((c) => chordStars(c)));
  return Math.max(1, Math.min(4, max + (song.parsed.chords.length > 4 ? 1 : 0)));
}

export const allPieces = () => [...PIECES, ...(store.state.arrangements || []).map((p) => ({ ...p, custom: true }))];

const pieceChords = (p) => [...new Set((p.chords || '').replace(/[|,]/g, ' ').split(/\s+/).filter((c) => parseChord(c)).map((c) => parseChord(c).name))];

export const KINDS = {
  chant: { label: 'Chant + accords', icon: 'mic' },
  duo: { label: 'Accords + mélodie', icon: 'duo' },
  melodie: { label: 'Mélodie', icon: 'note' },
  audio: { label: 'Mon morceau', icon: 'wave' },
};

/** Tous les morceaux, sous une forme commune. Les morceaux traduits sont lus dans IndexedDB. */
export async function catalog() {
  const items = [];
  for (const s of allSongs()) {
    const p = s.parsed;
    items.push({
      id: 's:' + s.id,
      kind: 'chant',
      title: p.title || 'Sans titre',
      sub: p.artist || '',
      chords: p.chords,
      level: Math.min(3, songLevel(s)),
      href: `#/chansons/${encodeURIComponent(s.id)}`,
      mine: !!s.custom,
      playable: canPlay(s),
    });
  }
  for (const p of allPieces()) {
    const ch = pieceChords(p);
    items.push({
      id: 'p:' + p.id,
      kind: 'duo',
      title: p.title,
      sub: p.composer || '',
      chords: ch,
      level: Math.min(3, p.level || 2),
      href: `#/niveau2/${encodeURIComponent(p.id)}`,
      mine: !!p.custom,
      playable: ch.length ? knowsAll(ch) : false,
    });
  }
  for (const m of MELODIES) {
    items.push({
      id: 'm:' + m.id,
      kind: 'melodie',
      title: m.title,
      sub: 'Note par note, en tablature',
      chords: [],
      level: Math.min(3, m.level || 1),
      href: `#/melodies/${m.id}`,
      mine: false,
      playable: (m.level || 1) === 1,
    });
  }
  try {
    for (const t of await tracks.list()) {
      const capo = t.capo || 0;
      const ch = [...new Set(t.result.segments.map((s) => s.chord).filter((c) => c !== 'N'))].map((c) => transposeChord(c, -capo));
      items.push({
        id: 't:' + t.id,
        kind: 'audio',
        title: t.name,
        sub: `Traduit de ton fichier${capo ? ` · capodastre case ${capo}` : ''}`,
        chords: ch.slice(0, 6),
        level: Math.min(3, Math.max(1, ...ch.map((c) => chordStars(c)))),
        href: `#/traduire/${t.id}`,
        mine: true,
        playable: knowsAll(ch),
      });
    }
  } catch {
    /* stockage indisponible */
  }
  return items;
}

/** Chanson conseillée : faisable avec les accords connus (+ éventuellement un accord en cours d'apprentissage). */
export function suggestSong(extraChord = null) {
  const known = new Set([...store.state.known, ...(extraChord ? [extraChord] : [])]);
  const songs = allSongs().filter((s) => s.parsed.chords.length && s.parsed.chords.every((c) => known.has(c)));
  const withExtra = extraChord ? songs.filter((s) => s.parsed.chords.includes(extraChord)) : [];
  const pool = withExtra.length ? withExtra : songs;
  if (!pool.length) return allSongs()[0];
  // la plus « riche » (le plus d'accords connus) d'abord, en évitant les comptines quand c'est possible
  const kids = new Set(['frere-jacques', 'au-clair-de-la-lune', 'ah-vous-dirai-je', 'sur-le-pont', 'alouette']);
  return [...pool].sort((a, b) => (kids.has(a.id) - kids.has(b.id)) || b.parsed.chords.length - a.parsed.chords.length)[0];
}
