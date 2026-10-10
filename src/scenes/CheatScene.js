import { W, H, C, FONT_DISPLAY, FONT_BODY, ROMAN } from '../config.js';
import { HEROES } from '../data/heroes.js';
import { LEVELS } from '../data/levels.js';
import { T, button } from '../ui/widgets.js';
import { Cheats, saveCheats } from '../systems/cheats.js';
import { sfx } from '../systems/audio.js';

// The cheat menu (opened with the Konami code on the title or hero select screen; see systems/cheats.js).
// Pick a hero, toggle god mode / start-at-boss, and jump straight into any act.
export class CheatScene extends Phaser.Scene {
  constructor() { super('Cheats'); }

  create({ from }) {
    this.from = from;
    this.scene.pause(from);   // the screen underneath ignores keys while the menu is open
    this.scene.bringToTop();  // draw above every other screen
    sfx('go');
    this.add.graphics().fillStyle(0x0f0c14, 0.95).fillRect(0, 0, W, H);   // near-solid backdrop
    const x = 72, D = 9300;
    const add = (o) => o.setDepth(D);
    add(this.add.text(x, 36, 'DEVELOPER CHEATS', { ...T.eyebrow, color: '#e0565c' }));
    add(this.add.text(x - 2, 54, 'Test any act', { ...T.h2, fontSize: '40px' }));

    // hero picker
    this.keys = Object.keys(HEROES);
    if (!this.keys.includes(this.registry.get('hero'))) this.registry.set('hero', this.keys[0]);
    add(this.add.text(x, 110, 'HERO', { ...T.eyebrow, color: C.dim }));
    this.heroText = add(this.add.text(x + 52, 136, '', { fontFamily: FONT_DISPLAY, fontSize: '26px', color: C.parchment }));
    const pickHero = (d) => { const i = this.keys.indexOf(this.registry.get('hero')); this.registry.set('hero', this.keys[(i + d + this.keys.length) % this.keys.length]); this.refresh(); };
    add(button(this, x, 132, '◀', () => pickHero(-1)).setPadding(10, 4));
    this.nextHero = add(button(this, 0, 132, '▶', () => pickHero(1)).setPadding(10, 4));

    // toggles
    this.godBtn = add(button(this, x, 184, '', () => { Cheats.god = !Cheats.god; saveCheats(); this.refresh(); }));
    this.bossBtn = add(button(this, x + 250, 184, '', () => { Cheats.boss = !Cheats.boss; saveCheats(); this.refresh(); }));

    // one button per act
    add(this.add.text(x, 250, 'START AN ACT', { ...T.eyebrow, color: C.dim }));
    LEVELS.forEach((L, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      add(button(this, x + col * 410, 272 + row * 50, `${ROMAN[i]}  ·  ${L.name}`, () => this.startAct(i), { primary: true }));
    });

    add(button(this, W - x - 150, 36, 'Close', () => this.close()));
    add(button(this, W - x - 270, H - 62, 'Turn cheats off', () => {
      Object.assign(Cheats, { unlocked: false, god: false, boss: false }); saveCheats(); this.close();
    }));
    add(this.add.text(x, H - 52, 'In game:  G god mode   ·   B jump to the boss   ·   N finish the act', { fontFamily: FONT_BODY, fontSize: '15px', color: C.dim }));
    this.input.keyboard.on('keydown-ESC', () => this.close());
    this.refresh();
  }

  refresh() {
    const h = HEROES[this.registry.get('hero')];
    this.heroText.setText(`${h.name}  (${h.cls})`);
    this.nextHero.setX(this.heroText.x + this.heroText.width + 14);
    this.godBtn.setText(`God mode: ${Cheats.god ? 'ON' : 'off'}`);
    this.bossBtn.setText(`Start at the boss: ${Cheats.boss ? 'ON' : 'off'}`);
  }

  startAct(lvl) {
    this.registry.set('gold', 0);
    this.scene.stop(this.from);
    this.scene.start('Game', { lvl, carryHp: null });
  }

  close() { this.scene.resume(this.from); this.scene.stop(); }
}
