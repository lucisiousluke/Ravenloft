import { W, H, C, FONT_DISPLAY, FONT_BODY } from '../config.js';
import { playMusic } from '../systems/audio.js';
import { TITLE_MUSIC } from '../data/audio.js';
import { T, buttonRow, buildLayers, dim, readAloud } from '../ui/widgets.js';

// Generic between-levels card: act intros, level clear, victory, defeat.
export class StoryScene extends Phaser.Scene {
  constructor() { super('Story'); }

  create(data) {
    playMusic(TITLE_MUSIC);
    const layers = buildLayers(this, data.theme || 'forest', { fixed: true });
    for (const l of layers) if (l.factor) l.obj.tilePositionX = 400 * l.factor;
    dim(this, 0.74);
    const D = 9200, x = 72, width = 600;
    const box = this.add.container(0, 0).setDepth(D);
    let y = 0;
    box.add(this.add.text(x, y, data.eyebrow || '', T.eyebrow)); y += 22;
    const title = this.add.text(x - 2, y, data.title, { ...T.h2, wordWrap: { width: W - x * 2 } });
    box.add(title); y += title.height + 16;
    if (data.readAloud) { const r = readAloud(this, x, y, width, data.readAloud); box.add(r.parts); y += r.height + 18; }
    if (data.body) { const b = this.add.text(x, y, data.body, { ...T.body, wordWrap: { width } }); box.add(b); y += b.height + 18; }
    if (data.tally) {
      let tx = x;
      for (const [label, value] of data.tally) {
        box.add(this.add.text(tx, y, label, { fontFamily: FONT_BODY, fontStyle: '800', fontSize: '12px', color: C.dim, letterSpacing: 2 }));
        const v = this.add.text(tx, y + 14, value, { fontFamily: FONT_DISPLAY, fontSize: '32px', color: C.gold });
        box.add(v); tx += Math.max(140, v.width + 40);
      }
      y += 62;
    }
    if (data.note) { const n = this.add.text(x, y, data.note, { ...T.small, wordWrap: { width } }); box.add(n); y += n.height + 16; }
    buttonRow(this, x, y, data.buttons.map((b) => ({ ...b, action: () => b.action(this) })), box);
    y += 50;
    box.y = Math.max(24, (H - y) / 2);
  }
}
