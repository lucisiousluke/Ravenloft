// The three acts. Each wave triggers when the camera reaches `at` pixels into the level.
// theme -> which background set in data/backgrounds.js to use
// music -> key of a music track listed in data/audio.js (null = silence)
export const LEVELS = [
  {
    name: 'The Thornwood', theme: 'forest', music: 'music-lament',
    intro: 'The road to Ravenmoor runs through the Thornwood. The goblin drums went quiet an hour ago, and something large is crashing through the brambles ahead.',
    outro: 'The owlbear falls with a final screech. Past the treeline, a graveyard glows with cold light.',
    waves: [
      { at: 520, foes: ['goblin', 'goblin', 'goblin'] },
      { at: 1350, foes: ['goblin', 'wolf', 'goblin', 'wolf'] },
      { at: 2200, foes: ['wolf', 'goblin', 'goblin', 'wolf', 'goblin'] },
    ],
    boss: { at: 3050, type: 'owlbear', add: ['goblin', 'goblin'] },
  },
  {
    name: 'Gravesend Hollow', theme: 'gothic', music: 'music-lament',
    intro: 'The dead of Gravesend no longer rest. Bones claw up through the frost, and in the crypt at the far end a barrow wight hums a funeral song.',
    outro: 'The wight’s song breaks into silence. On the cliff above, Castle Ravenmoor lights its windows one by one.',
    waves: [
      { at: 520, foes: ['skeleton', 'skeleton', 'ghoul'] },
      { at: 1350, foes: ['ghoul', 'wolf', 'skeleton', 'wolf', 'skeleton'] },
      { at: 2200, foes: ['ghoul', 'skeleton', 'ghoul', 'skeleton', 'ghoul'] },
    ],
    boss: { at: 3050, type: 'wight', add: ['skeleton'] },
  },
  {
    name: 'Castle Ravenmoor', theme: 'castle', music: 'music-lament',
    intro: 'The gates stand open, as if you were expected. Count Vaszlo waits in the great hall. He has waited three hundred years. He can wait a few minutes more.',
    outro: 'Count Vaszlo crumbles to ash, and for the first time in three centuries, dawn breaks over Ravenmoor.',
    waves: [
      { at: 520, foes: ['cultist', 'skeleton', 'skeleton', 'cultist'] },
      { at: 1350, foes: ['knight', 'cultist', 'ghoul', 'cultist'] },
      { at: 2200, foes: ['knight', 'knight', 'cultist', 'skeleton', 'cultist'] },
    ],
    boss: { at: 3050, type: 'vampire', add: ['cultist'] },
  },
];
