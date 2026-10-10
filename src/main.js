import { W, H, C } from './config.js';
import { attachAudio, isMuted } from './systems/audio.js';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { SelectScene } from './scenes/SelectScene.js';
import { StoryScene } from './scenes/StoryScene.js';
import { GameScene } from './scenes/GameScene.js';
import { HudScene } from './scenes/HudScene.js';
import { PauseScene } from './scenes/PauseScene.js';
import { DialogueScene } from './scenes/DialogueScene.js';

// Wait for the web fonts so Phaser doesn't draw text in a fallback face.
const fonts = Promise.all([
  document.fonts.load('32px "Pirata One"'),
  document.fonts.load('16px "Alegreya Sans"'),
  document.fonts.load('800 16px "Alegreya Sans"'),
  document.fonts.load('italic 16px "Alegreya Sans"'),
]).catch(() => {});
const timeout = new Promise((r) => setTimeout(r, 3000));

Promise.race([fonts, timeout]).then(() => {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: W,
    height: H,
    backgroundColor: C.ink,
    pixelArt: true,
    roundPixels: true, // Phaser 4 turns this off by default; keeps sprites on whole pixels so they stay crisp
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    input: { activePointers: 4 },
    scene: [BootScene, TitleScene, SelectScene, StoryScene, GameScene, HudScene, PauseScene, DialogueScene],
  });
  attachAudio(game);
  game.sound.mute = isMuted();
  window.ravenmoor = game; // handy for poking at the game from the browser console
});
