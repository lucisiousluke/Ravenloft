import { W, H } from '../config.js';
import { T, buttonRow, dim } from '../ui/widgets.js';
import { CONTROLS } from './TitleScene.js';
import { playMusic } from '../systems/audio.js';

export class PauseScene extends Phaser.Scene {
  constructor() { super('Pause'); }

  create() {
    dim(this, 0.7);
    const D = 9200, x = 72;
    this.add.text(x, 150, 'PAUSED', T.eyebrow).setDepth(D);
    this.add.text(x - 2, 172, 'The table takes a break', T.h2).setDepth(D);
    const resume = () => { this.scene.stop(); this.scene.resume('Game'); };
    buttonRow(this, x, 262, [
      { label: 'Resume', primary: true, action: resume },
      { label: 'Quit to title', action: () => { playMusic(null); this.scene.stop('Game'); this.scene.start('Title'); } },
    ]).forEach((b) => b.setDepth(D));
    this.input.keyboard.once('keydown-ESC', resume);
    this.input.keyboard.once('keydown-P', resume);
    this.add.text(x, H - 64, CONTROLS, { ...T.small, wordWrap: { width: W - x * 2 } }).setDepth(D);
  }
}
