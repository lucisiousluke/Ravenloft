export const TAU = Math.PI * 2;
export const rnd = (a, b) => a + Math.random() * (b - a);
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// Dice: {n:2, s:6, b:3} means 2d6+3
export const roll = (d) => { let t = d.b || 0; for (let i = 0; i < d.n; i++) t += 1 + Math.floor(Math.random() * d.s); return t; };
export const d20 = () => 1 + Math.floor(Math.random() * 20);
export const diceLabel = (d) => `${d.n}d${d.s}${d.b ? '+' + d.b : ''}`;
