// Icônes dessinées (traits arrondis), à la place des émojis.
const P = {
  today: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  learn: '<path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/>',
  music: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  tools: '<path d="M8 3v7a4 4 0 0 0 8 0V3"/><path d="M12 14v7"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  play: '<path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" fill="currentColor" stroke="none"/>',
  pause: '<rect x="6" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" stroke="none"/><rect x="14" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" stroke="none"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  next: '<path d="M9 5l7 7-7 7"/>',
  settings: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  restart: '<path d="M4 12a8 8 0 1 0 3-6.2"/><path d="M4 4v5h5"/>',
  speed: '<path d="M4 18a9 9 0 1 1 16 0"/><path d="M12 14l4-5"/>',
  loop: '<path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12"/><path d="M7 22l-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  flame: '<path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5 1-8.5z"/>',
  wave: '<path d="M3 12h2M7 8v8M11 5v14M15 9v6M19 7v10M22 12h-1"/>',
  paste: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  tuner: '<path d="M4 18a9 9 0 1 1 16 0"/><path d="M12 18V9"/><circle cx="12" cy="18" r="1.5"/>',
  hand: '<path d="M8 13V5a1.5 1.5 0 0 1 3 0v6M11 11V3.5a1.5 1.5 0 0 1 3 0V11M14 11V5a1.5 1.5 0 0 1 3 0v8c0 4-2.5 8-7 8-3 0-4.5-1.5-6-4l-1.5-2.8a1.5 1.5 0 0 1 2.6-1.5L8 15"/>',
  fretboard: '<rect x="2" y="7" width="20" height="10" rx="2"/><path d="M7 7v10M12 7v10M17 7v10M2 10h20M2 14h20"/>',
  drum: '<ellipse cx="12" cy="8" rx="8" ry="3"/><path d="M4 8v8c0 1.7 3.6 3 8 3s8-1.3 8-3V8"/><path d="M15 2l-3 6M9 2l3 6"/>',
  lesson: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7"/>',
  repeat: '<path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12"/><path d="M7 22l-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  volume: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"/>',
  duo: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/><path d="M9 9l11-2"/>',
  note: '<circle cx="8" cy="18" r="3"/><path d="M11 18V4l7 3"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/>',
};

/** Retourne le SVG d'une icône. */
export function icon(name, size = 22, extra = '') {
  return `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${P[name] || ''}</svg>`;
}

/** Petite illustration de ukulélé (décorative). */
export const UKE_ILLUSTRATION = `<svg class="uke-illu" viewBox="0 0 230 430" aria-hidden="true">
  <rect x="99" y="10" width="32" height="70" rx="12" fill="#8A5A30"/>
  <circle cx="94" cy="30" r="7" fill="#6E5A4A"/><circle cx="94" cy="58" r="7" fill="#6E5A4A"/>
  <circle cx="136" cy="30" r="7" fill="#6E5A4A"/><circle cx="136" cy="58" r="7" fill="#6E5A4A"/>
  <rect x="103" y="78" width="24" height="170" fill="#8A5A30"/>
  <path d="M103 110h24M103 140h24M103 168h24M103 194h24M103 218h24" stroke="#EFE3D3" stroke-width="2"/>
  <path d="M115 236c-46 0-74 26-74 60 0 20 12 30 12 44 0 44 28 76 62 76s62-32 62-76c0-14 12-24 12-44 0-34-28-60-74-60z" fill="#D9A06A"/>
  <circle cx="115" cy="318" r="24" fill="#5A3A1E"/>
  <rect x="93" y="372" width="44" height="10" rx="4" fill="#8A5A30"/>
  <path d="M109 20v358M113 20v358M117 20v358M121 20v358" stroke="#FFFFFF" stroke-width="1.4"/>
</svg>`;
