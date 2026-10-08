// Enemies and bosses.
// wind   -> ticks of wind-up before an attack lands (the player's warning)
// cd     -> ticks of cooldown between attacks
// poise  -> hits a boss shrugs off before it flinches
// ranged -> shoots a bolt instead of meleeing
// lunge  -> the attack carries the enemy forward (wolves)
export const FOES = {
  goblin:   { name: 'Goblin', sprite: 'goblin', height: 44, shadow: 15, hp: 22, spd: 1.9, dmg: { n: 1, s: 4, b: 1 }, reach: 46, wind: 24, cd: 55, gold: 5 },
  wolf:     { name: 'Dire Wolf', sprite: 'dire-wolf', height: 42, shadow: 24, hp: 26, spd: 2.8, dmg: { n: 1, s: 6, b: 1 }, reach: 64, wind: 20, cd: 70, gold: 6, lunge: true },
  skeleton: { name: 'Skeleton', sprite: 'skeleton', height: 59, shadow: 15, hp: 30, spd: 1.7, dmg: { n: 1, s: 6, b: 1 }, reach: 58, wind: 24, cd: 55, gold: 7 },
  ghoul:    { name: 'Ghoul', sprite: 'ghoul', height: 56, shadow: 16, hp: 42, spd: 2.3, dmg: { n: 1, s: 6, b: 2 }, reach: 46, wind: 18, cd: 45, gold: 9 },
  cultist:  { name: 'Blood Cultist', sprite: 'blood-cultist', height: 60, shadow: 16, hp: 30, spd: 1.6, dmg: { n: 1, s: 8, b: 1 }, reach: 320, wind: 34, cd: 110, gold: 10, ranged: true },
  knight:   { name: 'Blood Knight', sprite: 'blood-knight', height: 70, shadow: 19, hp: 64, spd: 1.4, dmg: { n: 1, s: 10, b: 2 }, reach: 78, wind: 30, cd: 60, gold: 15, poise: 2 },

  owlbear:  { name: 'The Owlbear', boss: true, sprite: 'owlbear', height: 108, shadow: 30, hp: 300, spd: 1.9, dmg: { n: 2, s: 6, b: 2 }, reach: 82, wind: 26, cd: 50, gold: 120, poise: 3 },
  wight:    { name: 'The Barrow Wight', boss: true, sprite: 'barrow-wight', height: 93, shadow: 26, hp: 360, spd: 1.6, dmg: { n: 2, s: 8, b: 1 }, reach: 118, wind: 30, cd: 60, gold: 180, poise: 3 },
  vampire:  { name: 'Count Vaszlo', boss: true, sprite: 'count-vaszlo', height: 86, shadow: 23, hp: 480, spd: 2.2, dmg: { n: 2, s: 8, b: 3 }, reach: 70, wind: 20, cd: 45, gold: 300, poise: 4 },
};
