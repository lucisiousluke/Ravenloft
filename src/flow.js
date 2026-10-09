// Moves between story cards and levels. Every screen change goes through here.
import { LEVELS } from './data/levels.js';
import { HEROES } from './data/heroes.js';
import { ROMAN } from './config.js';

export function newCampaign(scene, heroKey) {
  scene.registry.set('hero', heroKey);
  scene.registry.set('gold', 0);
  toIntro(scene, 0, null);
}

export function toIntro(scene, lvl, carryHp) {
  const L = LEVELS[lvl];
  scene.scene.start('Story', {
    theme: L.theme, eyebrow: `ACT ${ROMAN[lvl]}`, title: L.name, readAloud: L.intro,
    buttons: [{ label: 'Roll initiative', primary: true, action: (s) => s.scene.start('Game', { lvl, carryHp }) }],
  });
}

export function toClear(scene, lvl, hp, maxHp) {
  const L = LEVELS[lvl], N = LEVELS[lvl + 1];
  scene.scene.start('Story', {
    theme: L.theme, eyebrow: `ACT ${ROMAN[lvl]} COMPLETE`, title: `${L.name} is clear`, readAloud: L.outro,
    tally: [['GOLD', `${scene.registry.get('gold')} gp`], ['HP', `${hp} / ${maxHp}`]],
    note: 'A short rest restores half your hit points, every spell slot and your healing ability.',
    buttons: [{ label: `Onward to ${N.name}`, primary: true, action: (s) => toIntro(s, lvl + 1, hp) }],
  });
}

export function toWin(scene) {
  const h = HEROES[scene.registry.get('hero')];
  scene.scene.start('Story', {
    theme: 'castle', eyebrow: 'CAMPAIGN COMPLETE', title: 'Dawn over Barovia', readAloud: LEVELS[LEVELS.length - 1].outro,
    tally: [['HERO', h.name], ['TREASURE', `${scene.registry.get('gold')} gp`]],
    buttons: [
      { label: 'Play again', primary: true, action: (s) => s.scene.start('Select') },
      { label: 'Title screen', action: (s) => s.scene.start('Title') },
    ],
  });
}

export function toDead(scene, lvl) {
  const h = HEROES[scene.registry.get('hero')];
  scene.scene.start('Story', {
    theme: LEVELS[lvl].theme, eyebrow: 'THREE FAILED DEATH SAVES', title: `${h.name} has fallen`,
    body: `The party drags you back to the last camp. ${LEVELS[lvl].name} still waits.`,
    buttons: [
      { label: `Retry Act ${ROMAN[lvl]}`, primary: true, action: (s) => { s.registry.set('gold', s.registry.get('levelGold')); toIntro(s, lvl, null); } },
      { label: 'Choose another hero', action: (s) => s.scene.start('Select') },
    ],
  });
}
