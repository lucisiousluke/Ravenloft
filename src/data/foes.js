// Enemies and bosses.
// wind   -> ticks of wind-up before an attack lands (the player's warning)
// cd     -> ticks of cooldown between attacks
// poise  -> hits a boss shrugs off before it flinches
// ranged -> shoots a bolt instead of meleeing
// lunge  -> the attack carries the enemy forward (wolves)
//
// Boss extras (all optional):
// pack   -> fights as part of a group (vampire spawn, revenants): spawns from both sides and takes turns attacking
// moves  -> special moves, used in turn every `every` ticks:
//           'charge' = rush across the screen, 'cast' = throw three `proj` projectiles, 'vanish' = teleport behind you
// shout  -> what the boss yells when it charges
// summon -> calls helpers once, when its HP drops below `below` (0.5 = half)
// drain  -> HP the boss heals each time it hits you
// regen  -> HP the boss heals every second
// finale -> instead of dying, starts a scripted ending (Strahd: vanishes and gives his final speech)
export const FOES = {
  goblin:   { name: 'Goblin', sprite: 'goblin', height: 44, shadow: 15, hp: 22, spd: 1.9, dmg: { n: 1, s: 4, b: 1 }, reach: 46, wind: 24, cd: 55, gold: 5 },
  wolf:     { name: 'Dire Wolf', sprite: 'dire-wolf', height: 42, shadow: 24, hp: 26, spd: 2.8, dmg: { n: 1, s: 6, b: 1 }, reach: 64, wind: 20, cd: 70, gold: 6, lunge: true },
  skeleton: { name: 'Skeleton', sprite: 'skeleton', height: 59, shadow: 15, hp: 30, spd: 1.7, dmg: { n: 1, s: 6, b: 1 }, reach: 58, wind: 24, cd: 55, gold: 7 },
  ghoul:    { name: 'Ghoul', sprite: 'ghoul', height: 56, shadow: 16, hp: 42, spd: 2.3, dmg: { n: 1, s: 6, b: 2 }, reach: 46, wind: 18, cd: 45, gold: 9 },
  cultist:  { name: 'Blood Cultist', sprite: 'blood-cultist', height: 60, shadow: 16, hp: 30, spd: 1.6, dmg: { n: 1, s: 8, b: 1 }, reach: 320, wind: 34, cd: 110, gold: 10, ranged: true },
  knight:   { name: 'Blood Knight', sprite: 'blood-knight', height: 70, shadow: 19, hp: 64, spd: 1.4, dmg: { n: 1, s: 10, b: 2 }, reach: 78, wind: 30, cd: 60, gold: 15, poise: 2 },

  owlbear:  { name: 'The Owlbear', boss: true, sprite: 'owlbear', height: 108, shadow: 30, hp: 300, spd: 1.9, dmg: { n: 2, s: 6, b: 2 }, reach: 82, wind: 26, cd: 50, gold: 120, poise: 3,
              moves: ['charge'], every: [220, 320], shout: 'SCREECH!' },
  spawn:    { name: 'Vampire Spawn', boss: true, pack: true, sprite: 'vampire-spawn', height: 58, shadow: 16, hp: 70, spd: 2.6, dmg: { n: 1, s: 8, b: 1 }, reach: 50, wind: 18, cd: 50, gold: 25, poise: 1,
              drain: 4 },
  abbot:    { name: 'The Abbot', boss: true, sprite: 'the-abbot', height: 92, shadow: 22, hp: 420, spd: 2.0, dmg: { n: 2, s: 8, b: 2 }, reach: 80, wind: 22, cd: 50, gold: 220, poise: 3,
              moves: ['cast', 'charge'], every: [200, 280], proj: 'holy', shout: 'Behold!',
              summon: { below: 0.5, foes: ['ghoul', 'ghoul'], line: 'My children, attend me!', col: '#ffe08a' } },
  revenant: { name: 'Revenant', boss: true, pack: true, sprite: 'revenant', height: 66, shadow: 18, hp: 130, spd: 1.8, dmg: { n: 1, s: 10, b: 3 }, reach: 72, wind: 26, cd: 55, gold: 60, poise: 2,
              regen: 2 },
  fiend:    { name: 'Bray Wyatt', boss: true, sprite: 'bray-wyatt', height: 88, shadow: 22, hp: 520, spd: 2.2, dmg: { n: 2, s: 8, b: 4 }, reach: 76, wind: 22, cd: 45, gold: 260, poise: 4,
              moves: ['charge', 'cast'], every: [180, 260], proj: 'fire', shout: 'Let me in!',
              summon: { below: 0.5, foes: ['cultist', 'cultist'], line: 'Follow the buzzards...', col: '#ff8a4a' } },
  wight:    { name: 'The Barrow Wight', boss: true, sprite: 'barrow-wight', height: 93, shadow: 26, hp: 360, spd: 1.6, dmg: { n: 2, s: 8, b: 1 }, reach: 118, wind: 30, cd: 60, gold: 180, poise: 3,
              moves: ['cast'], every: [260, 340], proj: 'shade',
              summon: { below: 0.55, foes: ['skeleton', 'skeleton'], line: 'Rise, my children', col: '#7fe0ff' } },
  vampire:  { name: 'Strahd von Zarovich', boss: true, sprite: 'count-vaszlo', height: 86, shadow: 23, hp: 480, spd: 2.2, dmg: { n: 2, s: 8, b: 3 }, reach: 70, wind: 20, cd: 45, gold: 300, poise: 4,
              moves: ['vanish', 'cast'], every: [170, 250], proj: 'bat', drain: 10,
              finale: 'strahd',   // at 0 HP he vanishes into mist and speaks instead of dying (data/dialogue.js)
              summon: { below: 0.45, foes: ['cultist', 'cultist'], line: 'Servants, to me!', col: '#ff6a7a' } },
};
