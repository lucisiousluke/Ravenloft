import { W, H, C, FONT_DISPLAY, FONT_BODY } from '../config.js';
import { BACKGROUNDS } from '../data/backgrounds.js';

// Text style shortcuts
export const T = {
  eyebrow: { fontFamily: FONT_BODY, fontStyle: '800', fontSize: '13px', color: C.gold, letterSpacing: 2 },
  logo: { fontFamily: FONT_DISPLAY, fontSize: '128px', color: C.parchment },
  h2: { fontFamily: FONT_DISPLAY, fontSize: '52px', color: C.parchment },
  body: { fontFamily: FONT_BODY, fontSize: '19px', color: C.parchment, lineSpacing: 6 },
  small: { fontFamily: FONT_BODY, fontSize: '15px', color: C.dim, lineSpacing: 4 },
};

// A clickable text button. Returns the text object (left/top anchored at x,y).
export function button(scene, x, y, label, onClick, { primary = false } = {}) {
  const base = primary ? C.gold : '#2a2333';
  const hover = primary ? '#efc66e' : '#3a3046';
  const t = scene.add.text(x, y, label, {
    fontFamily: FONT_DISPLAY, fontSize: '24px', color: primary ? C.ink : C.parchment,
    backgroundColor: base, padding: { x: 22, y: 9 },
  }).setInteractive({ useHandCursor: true });
  t.on('pointerover', () => t.setBackgroundColor(hover));
  t.on('pointerout', () => t.setBackgroundColor(base));
  t.on('pointerup', () => onClick());
  t.primary = primary;
  t.fire = onClick;
  return t;
}

// Lay buttons out left to right; Enter/Space presses the primary one.
export function buttonRow(scene, x, y, defs, container) {
  let cx = x;
  const made = defs.map((d) => {
    const b = button(scene, cx, y, d.label, d.action, { primary: d.primary });
    cx += b.width + 14;
    if (container) container.add(b);
    return b;
  });
  const primary = made.find((b) => b.primary);
  if (primary) {
    const fire = () => primary.fire();
    scene.input.keyboard.once('keydown-ENTER', fire);
    scene.input.keyboard.once('keydown-SPACE', fire);
  }
  return made;
}

// Builds the parallax layers for a level theme. Returns layer records to scroll later.
export function buildLayers(scene, theme, { fixed = false } = {}) {
  return BACKGROUNDS[theme].map((def, i) => {
    const key = `bg-${theme}-${def.file}`;
    const tex = scene.textures.get(key).getSourceImage();
    const obj = def.factor === 0
      ? scene.add.image(0, 0, key).setOrigin(0)
      : scene.add.tileSprite(0, 0, W, tex.height || H, key).setOrigin(0);
    obj.setScrollFactor(0).setDepth(def.front ? 9000 : -1000 + i);
    if (fixed && def.front) obj.setVisible(false);
    return { obj, factor: def.factor, drift: def.drift || 0 };
  });
}
export function scrollLayers(layers, cam, tick) {
  for (const l of layers) if (l.factor) l.obj.tilePositionX = cam * l.factor + tick * l.drift;
}

// Dark wash used behind menus
export function dim(scene, alpha = 0.72) {
  return scene.add.rectangle(0, 0, W, H, 0x0f0c14, alpha).setOrigin(0).setScrollFactor(0).setDepth(9100);
}

// A parchment "read aloud" box like a DM's adventure module
export function readAloud(scene, x, y, width, text) {
  const pad = 18;
  const label = scene.add.text(x + pad, y + pad, 'READ ALOUD', { fontFamily: FONT_BODY, fontStyle: '800', fontSize: '11px', color: '#7a2a2a', letterSpacing: 2 });
  const body = scene.add.text(x + pad, y + pad + 20, text, { fontFamily: FONT_BODY, fontStyle: 'italic', fontSize: '18px', color: '#2a1e14', lineSpacing: 5, wordWrap: { width: width - pad * 2 } });
  const h = body.height + pad * 2 + 20;
  const g = scene.add.graphics();
  g.fillStyle(0xeadfc6, 1).fillRect(x, y, width, h);
  g.lineStyle(2, 0x8a6a2a, 1).strokeRect(x + 3, y + 3, width - 6, h - 6);
  g.lineStyle(1, 0x8a6a2a, 1).strokeRect(x + 7, y + 7, width - 14, h - 14);
  return { parts: [g, label, body], height: h };
}
