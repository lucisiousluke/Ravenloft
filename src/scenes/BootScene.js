import { W, H, C, FONT_BODY } from '../config.js';
import { SPRITES, LOOPING } from '../data/sprites.js';
import { BACKGROUNDS } from '../data/backgrounds.js';
import { AUDIO } from '../data/audio.js';

// Loads every asset, then turns each sprite sheet's Aseprite tags into animations
// named "<sprite>:<tag>", e.g. "ulrick:walk".
export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    const label = this.add.text(W / 2, H / 2 - 20, 'Loading', { fontFamily: FONT_BODY, fontSize: '18px', color: C.dim }).setOrigin(0.5);
    const bar = this.add.rectangle(W / 2 - 150, H / 2 + 10, 0, 6, 0xdcae4c).setOrigin(0, 0.5);
    this.load.on('progress', (v) => { bar.width = 300 * v; });
    this.load.on('loaderror', (f) => { label.setText(`Missing file: ${f.src}`).setColor('#ff6a5a'); console.error('Could not load', f.src); });

    for (const key of Object.keys(SPRITES)) {
      this.load.aseprite(key, `assets/sprites/${key}.png`, `assets/sprites/${key}.json`);
    }
    for (const [theme, layers] of Object.entries(BACKGROUNDS)) {
      for (const l of layers) this.load.image(`bg-${theme}-${l.file}`, `assets/backgrounds/${theme}/${l.file}.png`);
    }
    for (const a of AUDIO) this.load.audio(a.key, a.url);
  }

  create() {
    const info = {};
    for (const [key, def] of Object.entries(SPRITES)) {
      const json = this.cache.json.get(key);
      if (!json) continue;
      const frames = Array.isArray(json.frames) ? json.frames : Object.entries(json.frames).map(([filename, f]) => ({ filename, ...f }));
      const size = frames[0].sourceSize || frames[0].frame;
      info[key] = { ox: def.feet[0] / size.w, oy: def.feet[1] / size.h, scale: def.scale || 1 };
      for (const tag of json.meta.frameTags || []) {
        const slice = frames.slice(tag.from, tag.to + 1);
        const total = slice.reduce((t, f) => t + (f.duration || 100), 0);
        const avg = total / slice.length;
        let list = slice.map((f) => ({ key, frame: f.filename, duration: (f.duration || 100) - avg }));
        if (tag.direction === 'reverse') list = list.reverse();
        this.anims.create({
          key: `${key}:${tag.name}`, frames: list, duration: total,
          repeat: LOOPING.has(tag.name) ? -1 : 0, yoyo: tag.direction === 'pingpong',
        });
      }
    }
    this.registry.set('spriteInfo', info);
    this.scene.start('Title');
  }
}
