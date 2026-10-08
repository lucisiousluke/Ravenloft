// The four playable heroes.
// sprite  -> file name in assets/sprites (see SPRITES.md for the animation list)
// height  -> roughly how tall the character is in pixels (used to place damage numbers)
// dmg     -> weapon dice, e.g. {n:1, s:8, b:3} is 1d8+3
// atkT    -> ticks per swing (60 ticks = 1 second). Lower is faster.
// critMin -> lowest d20 roll that crits
// dur     -> ticks the spell takes to cast
// heal    -> the hero's once-per-act healing ability (H key).
//            dice   = how much it heals, e.g. {n:0, s:0, b:50} is a flat 50
//            pulses = optional: heal over time, rolling `dice` this many times, once every half second
export const HEROES = {
  paladin: {
    name: 'Ulrick Downcloud', race: 'Human', cls: 'Paladin', sprite: 'ulrick', height: 68, shadow: 17,
    hp: 140, spd: 2.5, dmg: { n: 1, s: 8, b: 3 }, reach: 74, atkT: 20, critMin: 20, dur: 34,
    spell: 'Divine Smite', spellTxt: 'Radiant blast around you. Heals 20 HP.',
    heal: { name: 'Lay on Hands', txt: 'Heal 50 HP.', dice: { n: 0, s: 0, b: 50 } },
  },
  druid: {
    name: 'Rolfing Thorntax', race: 'Dwarf', cls: 'Druid', sprite: 'rolfing', height: 50, shadow: 18,
    hp: 120, spd: 2.4, dmg: { n: 1, s: 6, b: 3 }, reach: 86, atkT: 22, critMin: 20, dur: 30,
    spell: 'Entangle', spellTxt: 'Vines root every foe on screen and tear at them.',
    heal: { name: 'Goodberry', txt: 'Ten berries, 1d4+2 HP each.', dice: { n: 1, s: 4, b: 2 }, pulses: 10 },
  },
  rogue: {
    name: 'Sunday the Gurthiest', race: 'Halfling', cls: 'Rogue', sprite: 'sunday', height: 46, shadow: 15,
    hp: 90, spd: 3.5, dmg: { n: 1, s: 4, b: 3 }, reach: 56, atkT: 12, critMin: 18, dur: 18,
    spell: 'Shadow Step', spellTxt: 'Dash through the line, sneak attacking everyone you pass.',
    heal: { name: 'Second Breakfast', txt: 'Heal 2d8+24.', dice: { n: 2, s: 8, b: 24 } },
  },
  bard: {
    name: 'Fae’ron Visuvian', race: 'Half-Elf', cls: 'Bard', sprite: 'faeron', height: 60, shadow: 16,
    hp: 100, spd: 3.0, dmg: { n: 1, s: 8, b: 1 }, reach: 70, atkT: 15, critMin: 19, dur: 24,
    spell: 'Thunderwave', spellTxt: 'A booming chord that blasts foes across the screen.',
    heal: { name: 'Song of Rest', txt: 'Heal 2d10+25.', dice: { n: 2, s: 10, b: 25 } },
  },
};
