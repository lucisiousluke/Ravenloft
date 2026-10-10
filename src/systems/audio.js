// Sound effects. If a file named "sfx-<name>" is loaded (see data/audio.js) it plays that;
// otherwise it falls back to a small synthesizer so the game always has sound.
import { MUSIC_VOLUME } from '../data/audio.js';

let AC = null, noiseBuf = null, game = null;
let muted = false;
try { muted = localStorage.getItem('ravenmoor-muted') === '1'; } catch (e) {}

export function attachAudio(g) { game = g; }
export const isMuted = () => muted;
export function toggleMute() {
  muted = !muted;
  try { localStorage.setItem('ravenmoor-muted', muted ? '1' : '0'); } catch (e) {}
  if (game) game.sound.mute = muted;
  return muted;
}

function unlock() {
  if (AC) return;
  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    const n = (AC.sampleRate * 0.6) | 0;
    noiseBuf = AC.createBuffer(1, n, AC.sampleRate);
    const ch = noiseBuf.getChannelData(0);
    for (let i = 0; i < n; i++) ch[i] = Math.random() * 2 - 1;
  } catch (e) { AC = null; }
}
['pointerdown', 'keydown', 'touchstart'].forEach((ev) => window.addEventListener(ev, unlock, { once: false, passive: true }));

function tone(f1, f2, dur, type, vol, delay = 0) {
  const t = AC.currentTime + delay, o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f2), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(AC.destination); o.start(t); o.stop(t + dur + 0.02);
}
function noise(dur, vol, freq) {
  const t = AC.currentTime, s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
  s.buffer = noiseBuf; f.type = 'bandpass'; f.frequency.value = freq;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(AC.destination); s.start(t); s.stop(t + dur);
}

const SYNTH = {
  swing: () => noise(0.08, 0.06, 2400),
  hit: () => { noise(0.1, 0.2, 700); tone(160, 60, 0.1, 'square', 0.05); },
  crit: () => { tone(660, 660, 0.08, 'square', 0.05); tone(990, 990, 0.15, 'square', 0.05, 0.07); },
  miss: () => tone(300, 200, 0.12, 'triangle', 0.05),
  hurt: () => tone(240, 70, 0.2, 'sawtooth', 0.08),
  jump: () => tone(280, 520, 0.12, 'triangle', 0.06),
  spell: () => tone(400, 1000, 0.35, 'sine', 0.09),
  boom: () => { noise(0.4, 0.22, 300); tone(120, 40, 0.4, 'sine', 0.15); },
  coin: () => { tone(990, 990, 0.05, 'square', 0.035); tone(1480, 1480, 0.1, 'square', 0.035, 0.05); },
  zap: () => tone(900, 200, 0.2, 'sawtooth', 0.04),
  roar: () => { noise(0.6, 0.2, 200); tone(110, 50, 0.6, 'sawtooth', 0.1); },
  heal: () => { tone(520, 520, 0.1, 'sine', 0.07); tone(780, 780, 0.18, 'sine', 0.07, 0.1); },
  go: () => { tone(440, 440, 0.08, 'triangle', 0.06); tone(660, 660, 0.12, 'triangle', 0.06, 0.09); },
  omen: () => { tone(65, 45, 2.8, 'sawtooth', 0.05); tone(98, 70, 2.8, 'sine', 0.06); noise(2.0, 0.05, 160); },  // low ominous drone
  toll: () => { tone(110, 108, 1.6, 'sine', 0.08); tone(220, 218, 1.2, 'sine', 0.03); },                       // distant bell
};

export function sfx(name) {
  if (muted) return;
  if (game && game.cache.audio.exists('sfx-' + name)) { game.sound.play('sfx-' + name, { volume: 0.6 }); return; }
  if (!AC || !SYNTH[name]) return;
  try { SYNTH[name](); } catch (e) {}
}

// Turn the music down (on = true) while something dramatic plays, and back up afterwards.
export function duckMusic(on) { if (currentMusic) currentMusic.setVolume(MUSIC_VOLUME * (on ? 0.35 : 1)); }

// Music: one track at a time. Asking for the track that's already playing does nothing,
// so music carries on smoothly between menus and levels.
let currentMusic = null, wantedKey = null;
export function playMusic(key) {
  wantedKey = key;
  if (currentMusic && currentMusic.key === key) return;
  if (currentMusic) { currentMusic.stop(); currentMusic.destroy(); currentMusic = null; }
  if (!key || !game || !game.cache.audio.exists(key)) return;
  // Browsers block sound until the player clicks, taps or presses a key.
  if (game.sound.locked) {
    game.sound.once('unlocked', () => { if (wantedKey === key) playMusic(key); });
    return;
  }
  currentMusic = game.sound.add(key, { loop: true, volume: MUSIC_VOLUME });
  currentMusic.play();
}
