import { W, H, C, FONT_DISPLAY, FONT_BODY } from '../config.js';
import { HEROES } from '../data/heroes.js';
import { playMusic } from '../systems/audio.js';
import { TITLE_MUSIC } from '../data/audio.js';
import { T, buttonRow, buildLayers, scrollLayers, dim } from '../ui/widgets.js';
import { diceLabel } from '../systems/util.js';
import { newCampaign } from '../flow.js';

const speedLabel = (s) => (s < 2.6 ? 'Steady' : s < 3.2 ? 'Quick' : 'Swift');

export class SelectScene extends Phaser.Scene {
  constructor() { super('Select'); }

  create() {
    playMusic(TITLE_MUSIC);
    this.layers = buildLayers(this, 'forest', { fixed: true });
    this.cam = 0; this.tick = 0;
    dim(this, 0.78);
    const D = 9200;
    this.keys = Object.keys(HEROES);
    if (!this.keys.includes(this.registry.get('hero'))) this.registry.set('hero', this.keys[0]);
    this.add.text(36, 30, 'SESSION ZERO', T.eyebrow).setDepth(D);
    this.add.text(34, 46, 'Choose your adventurer', { ...T.h2, fontSize: '44px' }).setDepth(D);

    const cw = 210, gap = 16, top = 108, ch = 340;
    const info = this.registry.get('spriteInfo');
    this.cards = this.keys.map((k, i) => {
      const h = HEROES[k], x = 36 + i * (cw + gap);
      const bg = this.add.graphics().setDepth(D);
      const zone = this.add.zone(x, top, cw, ch).setOrigin(0).setInteractive({ useHandCursor: true }).setDepth(D);
      zone.on('pointerup', () => { if (this.registry.get('hero') === k) this.begin(); else this.pick(k); });
      const si = info[h.sprite];
      const spr = this.add.sprite(x + cw / 2, top + 116, h.sprite).setOrigin(si.ox, si.oy).setScale(1.25 * si.scale).setDepth(D + 1);
      spr.play(`${h.sprite}:idle`);
      const t = (yy, txt, style) => this.add.text(x + 14, top + yy, txt, style).setDepth(D + 1);
      const name = t(130, h.name, { fontFamily: FONT_DISPLAY, fontSize: '25px', color: C.parchment, wordWrap: { width: cw - 24 }, lineSpacing: -4 });
      const ny = 130 + name.height + 2;
      t(ny, `${h.race} ${h.cls}`.toUpperCase(), { fontFamily: FONT_BODY, fontStyle: '800', fontSize: '12px', color: C.gold, letterSpacing: 2 });
      const stats = [['HP', h.hp], ['SPEED', speedLabel(h.spd)], ['WEAPON', diceLabel(h.dmg)], ['CRIT', h.critMin === 20 ? '20' : `${h.critMin}–20`]];
      stats.forEach(([l, v], j) => {
        const sx = 14 + (j % 2) * 96, sy = ny + 24 + Math.floor(j / 2) * 34;
        this.add.text(x + sx, top + sy, l, { fontFamily: FONT_BODY, fontStyle: '800', fontSize: '10px', color: C.dim, letterSpacing: 1 }).setDepth(D + 1);
        this.add.text(x + sx, top + sy + 12, String(v), { fontFamily: FONT_BODY, fontStyle: '800', fontSize: '15px', color: C.parchment }).setDepth(D + 1);
      });
      const sy = ny + 24 + 72;
      t(sy, h.spell, { fontFamily: FONT_BODY, fontStyle: '800', fontSize: '15px', color: C.arcane });
      const st = t(sy + 20, h.spellTxt, { fontFamily: FONT_BODY, fontSize: '14px', color: C.dim, wordWrap: { width: cw - 24 }, lineSpacing: 2 });
      t(sy + 26 + st.height, `${h.heal.name}  ·  once per act`, { fontFamily: FONT_BODY, fontStyle: '800', fontSize: '13px', color: C.heal });
      return { k, x, y: top, w: cw, h: ch, bg, spr, sprite: h.sprite };
    });

    const btns = buttonRow(this, 36, H - 70, [
      { label: 'Begin the adventure', primary: true, action: () => this.begin() },
      { label: 'Back', action: () => this.scene.start('Title') },
    ]);
    btns.forEach((b) => b.setDepth(D));
    this.add.text(W - 36, H - 56, 'Tap a hero to pick, tap again to begin', T.small).setOrigin(1, 0).setDepth(D);

    this.input.keyboard.on('keydown-LEFT', () => this.step(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this.step(1));
    this.input.keyboard.on('keydown-A', () => this.step(-1));
    this.input.keyboard.on('keydown-D', () => this.step(1));
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('Title'));
    this.pick(this.registry.get('hero'));
    this.flourish = this.time.addEvent({ delay: 1600, loop: true, callback: () => this.showOff() });
  }

  step(d) { const i = this.keys.indexOf(this.registry.get('hero')); this.pick(this.keys[(i + d + this.keys.length) % this.keys.length]); }

  pick(k) {
    this.registry.set('hero', k);
    for (const c of this.cards) {
      const on = c.k === k;
      c.bg.clear();
      c.bg.fillStyle(on ? 0x2a2333 : 0x1b1622, on ? 0.97 : 0.85).fillRect(c.x, c.y, c.w, c.h);
      c.bg.lineStyle(2, on ? 0xdcae4c : 0x2a2333, 1).strokeRect(c.x + 1, c.y + 1, c.w - 2, c.h - 2);
    }
    this.showOff();
  }

  showOff() {
    const c = this.cards.find((c) => c.k === this.registry.get('hero'));
    if (!c) return;
    c.spr.play(`${c.sprite}:attack1`);
    c.spr.once('animationcomplete', () => c.spr.play(`${c.sprite}:idle`));
  }

  begin() { newCampaign(this, this.registry.get('hero')); }

  update(_, delta) {
    this.cam += delta * 0.04; this.tick += delta / 16.67;
    scrollLayers(this.layers, this.cam, this.tick);
  }
}
