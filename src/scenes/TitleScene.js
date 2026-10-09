import { W, H, C, IS_TOUCH } from '../config.js';
import { playMusic } from '../systems/audio.js';
import { TITLE_MUSIC } from '../data/audio.js';
import { T, buttonRow, buildLayers, scrollLayers, dim } from '../ui/widgets.js';

export const CONTROLS = IS_TOUCH
  ? 'Move with the left stick.  Strike, Jump, Spell and Heal are on the right.  Pause is top right.'
  : 'Move  WASD or arrows      Strike  J or Z      Jump  K or Space      Spell  L or C      Heal  H      Pause  P';

export class TitleScene extends Phaser.Scene {
  constructor() { super('Title'); }

  create() {
    playMusic(TITLE_MUSIC);
    this.layers = buildLayers(this, 'forest', { fixed: true });
    this.cam = 0; this.tick = 0;
    dim(this, 0.55);
    const x = 72;
    const d = 9200;
    this.add.text(x, 92, 'A SIDE-SCROLLING BRAWL IN SEVEN ACTS', T.eyebrow).setDepth(d);
    // Game title: "The Curse of" small, "Strahd" large
    this.add.text(x - 2, 110, 'The Curse of', { ...T.logo, fontSize: '46px' }).setDepth(d).setShadow(0, 0, 'rgba(176,58,63,0.9)', 18, false, true);
    this.add.text(x - 4, 140, 'Strahd', T.logo).setDepth(d).setShadow(0, 0, 'rgba(176,58,63,0.9)', 28, false, true);
    this.add.text(x, 290, 'Four adventurers, one cursed land. Cross Barovia from Vallaki and Krezk to Argynvostholt and the Amber Temple, then storm Castle Ravenloft to face Strahd von Zarovich.', { ...T.body, wordWrap: { width: 560 } }).setDepth(d);
    const btns = buttonRow(this, x, 380, [{ label: 'Gather the party', primary: true, action: () => this.scene.start('Select') }]);
    btns.forEach((b) => b.setDepth(d));
    this.add.text(x, H - 64, CONTROLS, { ...T.small, wordWrap: { width: W - x * 2 } }).setDepth(d);
  }

  update(_, delta) {
    this.cam += delta * 0.04; this.tick += delta / 16.67;
    scrollLayers(this.layers, this.cam, this.tick);
  }
}
