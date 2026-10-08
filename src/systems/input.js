// Gameplay input shared by keyboard and touch controls.
// Actions are "buffered" for 12 ticks so a press slightly before you can act still counts.
const KEYMAP = { j: 'atk', z: 'atk', k: 'jump', x: 'jump', ' ': 'jump', l: 'spell', c: 'spell', h: 'heal' };
const NO_SCROLL = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '];

export const Input = {
  held: {},
  buf: { atk: 0, jump: 0, spell: 0, heal: 0 },
  touch: { x: 0, y: 0 },

  press(action) { this.buf[action] = 12; },
  take(action) { if (this.buf[action] > 0) { this.buf[action] = 0; return true; } return false; },
  tick() { for (const k in this.buf) if (this.buf[k] > 0) this.buf[k]--; },
  reset() { this.held = {}; for (const k in this.buf) this.buf[k] = 0; this.touch.x = this.touch.y = 0; },

  dir() {
    const h = this.held;
    let x = 0, y = 0;
    if (h.arrowleft || h.a) x -= 1;
    if (h.arrowright || h.d) x += 1;
    if (h.arrowup || h.w) y -= 1;
    if (h.arrowdown || h.s) y += 1;
    x += this.touch.x; y += this.touch.y;
    return { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) };
  },
};

window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (NO_SCROLL.includes(k)) e.preventDefault();
  if (!e.repeat && KEYMAP[k]) Input.press(KEYMAP[k]);
  Input.held[k] = true;
});
window.addEventListener('keyup', (e) => { Input.held[e.key.toLowerCase()] = false; });
window.addEventListener('blur', () => { Input.held = {}; });
