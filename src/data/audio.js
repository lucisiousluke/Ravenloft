// Sound files. Anything not listed here falls back to the built-in synth effects.
//
// Music: add { key: 'music-<name>', url: 'assets/audio/<file>.mp3' } below,
// then use that key as `music` on a level in data/levels.js (or as TITLE_MUSIC).
// If two screens in a row use the same track, it keeps playing without restarting.
//
// Sound effects: use the key "sfx-" plus the effect name, e.g.
//   { key: 'sfx-hit', url: 'assets/audio/hit.mp3' }
// Effect names: swing, hit, crit, miss, hurt, jump, spell, boom, coin, zap, roar, heal, go, omen, toll
//
// Tip: use MP3s around 128 kbps. Full-quality WAV files are 15-20x larger and slow down loading.
export const AUDIO = [
  { key: 'music-lament', url: 'assets/audio/lament-of-home.mp3' },
  { key: 'music-settlements', url: 'assets/audio/moving-through-the-settlements.mp3' },
];

// Music for the title, hero select and story screens (null = silence)
export const TITLE_MUSIC = 'music-settlements';
export const MUSIC_VOLUME = 0.15; // 0 = silent, 1 = full volume (sound effects play at 0.6)
