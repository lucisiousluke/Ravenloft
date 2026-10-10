import { W, H, C, FONT_DISPLAY, FONT_BODY, IS_TOUCH, ROMAN } from '../config.js';
import { LEVELS } from '../data/levels.js';
import { Input } from '../systems/input.js';
import { isMuted, toggleMute } from '../systems/audio.js';
import { Cheats } from '../systems/cheats.js';

// Draws health, spell slots, gold, boss bar and touch controls on top of the Game scene.
export class HudScene extends Phaser.Scene {
  constructor() { super('Hud'); }

  create() {
    this.game_ = this.scene.get('Game');
    this.g = this.add.graphics();
    const body = (size, color, extra = {}) => ({ fontFamily: FONT_BODY, fontStyle: '800', fontSize: size + 'px', color, ...extra });
    this.tName = this.add.text(28, 18, '', { fontFamily: FONT_DISPLAY, fontSize: '25px', color: C.parchment });
    this.tClass = this.add.text(0, 26, '', body(11, C.gold, { letterSpacing: 2 }));
    this.tHp = this.add.text(220, 49, '', body(13, C.parchment));
    this.add.text(28, 77, 'SPELL SLOTS', body(10, C.dim, { letterSpacing: 1 }));
    this.tHeal = this.add.text(190, 77, 'HEAL', body(10, C.heal, { letterSpacing: 1 }));
    this.tGold = this.add.text(300, 70, '', { fontFamily: FONT_DISPLAY, fontSize: '22px', color: C.gold }).setOrigin(1, 0);
    this.tAct = this.add.text(W / 2, 14, '', body(10, C.dim, { letterSpacing: 2 })).setOrigin(0.5, 0);
    this.tLevel = this.add.text(W / 2, 26, '', { fontFamily: FONT_DISPLAY, fontSize: '21px', color: C.parchment }).setOrigin(0.5, 0).setAlpha(0.85);
    this.tBoss = this.add.text(W / 2 - 220, H - 62, '', { fontFamily: FONT_DISPLAY, fontSize: '20px', color: C.parchment });
    this.tOnward = this.add.text(W - 64, H / 2 - 22, 'Onward', { fontFamily: FONT_DISPLAY, fontSize: '34px', color: C.gold, stroke: C.ink, strokeThickness: 5 }).setOrigin(1, 0);
    this.tBanner1 = this.add.text(W / 2, H * 0.36 - 16, '', body(14, C.gold, { letterSpacing: 3 })).setOrigin(0.5);
    this.tBanner2 = this.add.text(W / 2, H * 0.36 + 30, '', { fontFamily: FONT_DISPLAY, fontSize: '64px', color: C.parchment, stroke: C.ink, strokeThickness: 7 }).setOrigin(0.5);

    // Pause + mute buttons (top right)
    this.iconG = this.add.graphics();
    const zone = (x, cb) => this.add.zone(x, 30, 40, 40).setInteractive({ useHandCursor: true }).on('pointerdown', (p, lx, ly, e) => { e?.stopPropagation(); cb(); });
    zone(W - 30, () => this.game_.pauseGame());
    zone(W - 76, () => { toggleMute(); this.drawIcons(); });
    this.input.keyboard.on('keydown-M', () => { toggleMute(); this.drawIcons(); });
    this.drawIcons();

    if (IS_TOUCH) this.buildTouch(); else this.buildLegend();
    this.tCheat = this.add.text(W - 14, 56, '', { fontFamily: FONT_BODY, fontStyle: '800', fontSize: '11px', color: '#e0565c', align: 'right', stroke: '#0f0c14', strokeThickness: 3 }).setOrigin(1, 0);
  }

  // Desktop only: a small key legend under the hero panel. Keys light up while held.
  // `alt` lists other keys that do the same thing (they light the same keycap).
  buildLegend() {
    const rows = [
      [{ keys: ['W', 'A', 'S', 'D'], label: 'Move', alt: { W: ['arrowup'], A: ['arrowleft'], S: ['arrowdown'], D: ['arrowright'] } },
       { keys: ['J'], label: 'Strike', alt: { J: ['z'] } },
       { keys: ['K'], label: 'Jump', alt: { K: ['x', ' '] } }],
      [{ keys: ['L'], label: 'Spell', alt: { L: ['c'] } },
       { keys: ['H'], label: 'Heal' },
       { keys: ['P'], label: 'Pause', alt: { P: ['escape'] } },
       { keys: ['M'], label: 'Mute' }],
    ];
    const g = this.add.graphics(), size = 17, x0 = 24, y0 = 110;
    g.fillStyle(0x0e0b13, 0.6).fillRect(14, 102, 300, 54);
    this.legendKeys = [];
    rows.forEach((row, r) => {
      let x = x0; const y = y0 + r * 23;
      for (const item of row) {
        for (const k of item.keys) {
          this.add.text(x + size / 2, y + size / 2, k, { fontFamily: FONT_BODY, fontStyle: '800', fontSize: '11px', color: C.parchment }).setOrigin(0.5).setDepth(1);
          this.legendKeys.push({ x, y, held: [k.toLowerCase(), ...(item.alt?.[k] || [])] });
          x += size + 3;
        }
        const t = this.add.text(x + 3, y + 2, item.label, { fontFamily: FONT_BODY, fontStyle: '800', fontSize: '11px', color: C.dim, letterSpacing: 1 });
        x += t.width + 16;
      }
    });
    this.legendG = this.add.graphics();
    this.legendSize = size;
  }

  drawLegend() {
    const g = this.legendG.clear(), s = this.legendSize;
    for (const k of this.legendKeys) {
      const on = k.held.some((h) => Input.held[h]);
      g.fillStyle(on ? 0xdcae4c : 0x1b1622, on ? 0.55 : 1).fillRect(k.x, k.y, s, s);
      g.lineStyle(1, on ? 0xdcae4c : 0x5a5068, 1).strokeRect(k.x + 0.5, k.y + 0.5, s - 1, s - 1);
    }
  }

  drawIcons() {
    const g = this.iconG.clear();
    for (const x of [W - 30, W - 76]) { g.fillStyle(0x0f0c14, 0.7).fillRect(x - 19, 11, 38, 38); g.lineStyle(1, 0xdcae4c, 0.45).strokeRect(x - 18.5, 11.5, 37, 37); }
    g.fillStyle(0xeadfc6, 1).fillRect(W - 37, 21, 5, 18).fillRect(W - 28, 21, 5, 18);
    const mx = W - 76;
    g.fillRect(mx - 10, 25, 5, 10).fillTriangle(mx - 6, 30, mx + 1, 21, mx + 1, 39);
    g.lineStyle(2, 0xeadfc6, 1);
    if (isMuted()) { g.lineBetween(mx + 4, 25, mx + 11, 35); g.lineBetween(mx + 11, 25, mx + 4, 35); }
    else { g.beginPath(); g.arc(mx + 2, 30, 6, -0.9, 0.9); g.strokePath(); g.beginPath(); g.arc(mx + 2, 30, 10, -0.9, 0.9); g.strokePath(); }
  }

  buildTouch() {
    this.input.addPointer(3);
    const g = this.add.graphics();
    const base = { x: 112, y: H - 104, r: 62 };
    const knob = this.add.circle(base.x, base.y, 26, 0xeadfc6, 0.3).setStrokeStyle(2, 0xeadfc6, 0.45);
    g.fillStyle(0xeadfc6, 0.07).fillCircle(base.x, base.y, base.r).lineStyle(2, 0xeadfc6, 0.22).strokeCircle(base.x, base.y, base.r);
    let stickId = null;
    const move = (p) => {
      let dx = p.x - base.x, dy = p.y - base.y; const m = Math.hypot(dx, dy), R = 46;
      if (m > R) { dx *= R / m; dy *= R / m; }
      knob.setPosition(base.x + dx, base.y + dy);
      Input.touch.x = Math.abs(dx) > 10 ? dx / R : 0; Input.touch.y = Math.abs(dy) > 10 ? dy / R : 0;
    };
    this.input.on('pointerdown', (p) => { if (stickId === null && p.x < W * 0.45 && p.y > H * 0.3) { stickId = p.id; move(p); } });
    this.input.on('pointermove', (p) => { if (p.id === stickId) move(p); });
    const end = (p) => { if (p.id === stickId) { stickId = null; Input.touch.x = Input.touch.y = 0; knob.setPosition(base.x, base.y); } };
    this.input.on('pointerup', end); this.input.on('pointerupoutside', end);

    const btn = (x, y, r, label, action, color) => {
      const c = this.add.circle(x, y, r, 0x0f0c14, 0.55).setStrokeStyle(2, color, 0.8).setInteractive();
      this.add.text(x, y, label, { fontFamily: FONT_DISPLAY, fontSize: r > 36 ? '22px' : '17px', color: C.parchment }).setOrigin(0.5);
      c.on('pointerdown', () => { Input.press(action); c.setFillStyle(0xdcae4c, 0.35); });
      c.on('pointerup', () => c.setFillStyle(0x0f0c14, 0.55)); c.on('pointerout', () => c.setFillStyle(0x0f0c14, 0.55));
    };
    btn(W - 68, H - 78, 44, 'Strike', 'atk', 0xb03a3f);
    btn(W - 168, H - 56, 33, 'Jump', 'jump', 0xeadfc6);
    btn(W - 88, H - 178, 33, 'Spell', 'spell', 0x8fb4ff);
    btn(W - 184, H - 150, 28, 'Heal', 'heal', 0x9be36a);
  }

  update() {
    const G = this.game_, p = G.p;
    if (!p) return;
    if (this.legendG) this.drawLegend();
    this.tCheat.setText(Cheats.unlocked ? `CHEATS${Cheats.god ? ' · GOD MODE' : ''}\nG god · B boss · N finish` : '');
    const d = p.def, g = this.g.clear(), tick = G.tick;
    // hero panel
    g.fillStyle(0x0e0b13, 0.78).fillRect(14, 12, 300, 86).lineStyle(1, 0xdcae4c, 0.4).strokeRect(14.5, 12.5, 299, 85);
    if (this.tName.text !== d.name) {
      this.tName.setText(d.name); this.tClass.setText(`${d.race} ${d.cls}`.toUpperCase());
      let fs = 25; this.tName.setFontSize(fs);
      while (fs > 17 && this.tName.width + this.tClass.width + 10 > 272) this.tName.setFontSize(--fs);
      this.tClass.setPosition(36 + this.tName.width, 26);
    }
    const f = p.hp / p.maxHp, bw = 184;
    g.fillStyle(0x2a1a1e, 1).fillRect(28, 50, bw, 13);
    g.fillStyle(f > 0.5 ? 0xb03a3f : f > 0.25 ? 0xd4703a : (tick % 30 < 15 ? 0xff4a4a : 0xb03a3f), 1).fillRect(28, 50, bw * f, 13);
    g.fillStyle(0xffffff, 0.18).fillRect(28, 50, bw * f, 3);
    this.tHp.setText(`${p.hp} / ${p.maxHp} HP`);
    for (let i = 0; i < 3; i++) {
      const x = 112 + i * 20, y = 82, pts = [x, y - 7, x + 6, y, x, y + 7, x - 6, y];
      if (i < p.slots) g.fillStyle(0x8fb4ff, 1).fillPoints(this.pts(pts), true);
      else {
        if (i === p.slots) { const k = p.slotT / 480; g.fillStyle(0x8fb4ff, 0.45).fillRect(x - 3, y + 7 - 14 * k, 6, 14 * k); }
        g.lineStyle(1.5, 0x5a6a8a, 1).strokePoints(this.pts(pts), true);
      }
    }
    // heal: a green cross while it's ready, an empty outline once used this act
    const hx = 180, hy = 82, ready = p.heals > 0;
    if (ready) g.fillStyle(0x9be36a, 1).fillRect(hx - 2, hy - 7, 5, 14).fillRect(hx - 7, hy - 2, 14, 5);
    else g.lineStyle(1.5, 0x5a6a8a, 1).strokeRect(hx - 2, hy - 7, 5, 14).strokeRect(hx - 7, hy - 2, 14, 5);
    this.tHeal.setColor(ready || p.regen > 0 ? C.heal : C.dim);
    this.tGold.setText(`${this.registry.get('gold')} gp`);
    this.tAct.setText(`ACT ${ROMAN[G.lvl]}`); this.tLevel.setText(LEVELS[G.lvl].name);

    // boss bar
    const b = G.bossInfo(); // all of the act's bosses as one bar
    this.tBoss.setVisible(!!b);
    if (b) {
      const x = W / 2 - 220, y = H - 34, w = 440, k = Math.max(0, Math.min(1, b.k));
      g.fillStyle(0x0e0b13, 0.78).fillRect(x - 12, y - 30, w + 24, 50).lineStyle(1, 0xdcae4c, 0.4).strokeRect(x - 11.5, y - 29.5, w + 23, 49);
      g.fillStyle(0x2a1a1e, 1).fillRect(x, y, w, 10).fillStyle(0x8a1a26, 1).fillRect(x, y, w * k, 10).fillStyle(0xffffff, 0.15).fillRect(x, y, w * k, 2);
      this.tBoss.setText(b.title);
    }
    // "Onward" arrow when the screen is clear
    const total = LEVELS[G.lvl].waves.length + 1;
    const showOnward = G.lock === null && !G.clearT && G.wave < total && p.state !== 'dead' && tick % 40 < 26;
    this.tOnward.setVisible(showOnward);
    if (showOnward) g.fillStyle(0xdcae4c, 1).fillTriangle(W - 56, H / 2 - 18, W - 28, H / 2 - 6, W - 56, H / 2 + 6);
    // act banner
    const a = G.bannerT > 0 ? Math.min(1, G.bannerT / 30, (200 - G.bannerT) / 20) : 0;
    this.tBanner1.setAlpha(a).setText(G.bannerTop || `ACT ${ROMAN[G.lvl]}`);   // or e.g. "VALLAKI" / "St. Andral's Church"
    this.tBanner2.setAlpha(a).setText(G.bannerTitle || LEVELS[G.lvl].name);
  }

  pts(a) { const out = []; for (let i = 0; i < a.length; i += 2) out.push({ x: a[i], y: a[i + 1] }); return out; }
}
