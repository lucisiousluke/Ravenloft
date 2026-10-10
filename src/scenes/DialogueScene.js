import { W, H, C, FONT_DISPLAY, FONT_BODY } from '../config.js';
import { button } from '../ui/widgets.js';
import { sfx } from '../systems/audio.js';

// Cinematic dialogue box shown on top of the game (Strahd's final words).
// Start it with: scene.launch('Dialogue', { script, onDone })  (scripts live in data/dialogue.js)
// One section at a time; only the Continue button (or Enter/Space while it shows) moves on. Nothing auto-advances.
const LINE_GAP = 900;       // ms between lines appearing within a section
const EMPHASIS_WAIT = 1500; // extra pause before an emphasised line
const BUTTON_WAIT = 600;    // ms after the last line before Continue appears (doubled on the final section)
const FADE = 350;           // ms for text to fade out/in between sections

export class DialogueScene extends Phaser.Scene {
  constructor() { super('Dialogue'); }

  create({ script, onDone }) {
    this.script = script; this.onDone = onDone; this.i = -1; this.busy = true; this.lines = [];
    // upper part of the screen, below the HUD panel, so the frozen hero stays visible on the floor
    const bw = 780, bh = 236; this.bx = (W - bw) / 2; this.by = 166; this.bw = bw; this.bh = bh;
    const { bx, by } = this;

    // gothic frame: near-black panel, double crimson border, small corner diamonds
    const g = this.add.graphics();
    g.fillStyle(0x0b070e, 0.94).fillRect(bx, by, bw, bh);
    g.lineStyle(2, 0x7a1822, 1).strokeRect(bx + 1, by + 1, bw - 2, bh - 2);
    g.lineStyle(1, 0x3a0c14, 1).strokeRect(bx + 7, by + 7, bw - 14, bh - 14);
    for (const [cx, cy] of [[bx, by], [bx + bw, by], [bx, by + bh], [bx + bw, by + bh]]) {
      g.fillStyle(0xb03a3f, 1).fillPoints([{ x: cx, y: cy - 7 }, { x: cx + 7, y: cy }, { x: cx, y: cy + 7 }, { x: cx - 7, y: cy }], true);
    }
    const name = this.add.text(bx + 34, by + 22, script.speaker.toUpperCase(), { fontFamily: FONT_BODY, fontStyle: '800', fontSize: '13px', color: '#c8474d', letterSpacing: 3 });
    this.frame = [g, name];

    this.btn = button(this, 0, 0, 'Continue', () => this.next(), { primary: true });
    this.btn.setPosition(bx + bw - this.btn.width - 28, by + bh - this.btn.height - 22).setVisible(false);
    const key = () => { if (this.btn.visible) this.next(); };
    this.input.keyboard.on('keydown-ENTER', key);
    this.input.keyboard.on('keydown-SPACE', key);

    // the box fades in, then the first section begins
    for (const o of [...this.frame, this.btn]) o.setAlpha(0);
    this.tweens.add({ targets: this.frame, alpha: 1, duration: 500, onComplete: () => { this.btn.setAlpha(1); this.busy = false; this.next(); } });
  }

  // Continue: fade the current section out, pause briefly, then show the next (or finish after the last).
  next() {
    if (this.busy) return;   // ignore double clicks mid-fade
    this.busy = true; this.btn.setVisible(false);
    const old = this.lines; this.lines = [];
    const go = () => {
      old.forEach((t) => t.destroy());
      this.i++;
      if (this.i >= this.script.sections.length) return this.finish();
      this.time.delayedCall(old.length ? FADE : 0, () => this.show(this.script.sections[this.i]));   // brief pause
    };
    if (old.length) this.tweens.add({ targets: old, alpha: 0, duration: FADE, onComplete: go });
    else go();
  }

  show(sec) {
    sfx('toll');
    const last = this.i === this.script.sections.length - 1;
    const items = sec.lines.map((l) => (typeof l === 'string' ? { text: l } : l));
    const x = this.bx + 34, width = this.bw - 68;
    let y = this.by + 50, delay = 0;
    items.forEach((it, j) => {
      let txt = it.text;
      if (j === 0) txt = '“' + txt;                       // the section is one quotation
      if (j === items.length - 1) txt = txt + '”';
      const style = it.emphasis
        ? { fontFamily: FONT_DISPLAY, fontSize: '34px', color: '#d23a44', stroke: '#1a0306', strokeThickness: 5, wordWrap: { width } }
        : { fontFamily: FONT_BODY, fontStyle: 'italic', fontSize: '22px', color: C.parchment, lineSpacing: 6, wordWrap: { width } };
      if (it.emphasis) { y += 8; delay += EMPHASIS_WAIT; }
      const t = this.add.text(x, y, txt, style).setAlpha(0);
      this.lines.push(t);
      this.tweens.add({ targets: t, alpha: 1, delay, duration: it.emphasis ? 1100 : 600, onStart: () => { if (it.emphasis) { sfx('omen'); this.cameras.main.shake(400, 0.003); } } });
      y += t.height + 12; delay += LINE_GAP;
    });
    // Continue appears only once every line is fully shown (and later on the final section, so it can be read)
    this.time.delayedCall(delay + BUTTON_WAIT * (last ? 2 : 1), () => { this.btn.setVisible(true); this.busy = false; });
  }

  finish() {
    this.tweens.add({ targets: this.frame, alpha: 0, duration: 600, onComplete: () => {
      const done = this.onDone; this.scene.stop(); done?.();
    } });
  }
}
