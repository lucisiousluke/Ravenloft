// Core numbers shared by every scene.
export const W = 960;          // game width in pixels
export const H = 540;          // game height in pixels
export const FT = 345;         // top edge of the walkable floor
export const FB = 515;         // bottom edge of the walkable floor
export const TICK = 1000 / 60; // game logic runs at a fixed 60 steps per second

export const FONT_DISPLAY = '"Pirata One", Georgia, serif';
export const FONT_BODY = '"Alegreya Sans", "Trebuchet MS", sans-serif';

export const C = {
  ink: '#0f0c14', ink2: '#1b1622', ink3: '#2a2333',
  parchment: '#eadfc6', dim: '#a49ab5',
  blood: '#b03a3f', gold: '#dcae4c', arcane: '#8fb4ff', heal: '#9be36a',
};
export const hex = (css) => parseInt(css.slice(1), 16);

export const IS_TOUCH = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
