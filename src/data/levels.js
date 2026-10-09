// The seven acts, in order. Each wave triggers when the camera reaches `at` pixels into the level.
// theme -> which background set in data/backgrounds.js to use
// music -> key of a music track listed in data/audio.js (null = silence)
// boss  -> the final fight of the act:
//          bosses = one or more bosses (a type from foes.js, or { type, name } to give one its own name)
//          title  = name on the boss health bar (defaults to the boss's name)
//          add    = regular enemies that join the fight
//          theme + place = optional: fade into a different background for the fight (e.g. inside a church)
export const LEVELS = [
  {
    name: 'The Lands of Barovia', theme: 'forest', music: 'music-lament',
    intro: 'The mists closed behind you on the road into Barovia, and they will not let you leave. The goblin drums went quiet an hour ago, and something large is crashing through the brambles ahead.',
    outro: 'The owlbear falls with a final screech. Down the Old Svalich Road, the walled town of Vallaki waits behind its palisade.',
    waves: [
      { at: 520, foes: ['goblin', 'goblin', 'goblin'] },
      { at: 1350, foes: ['goblin', 'wolf', 'goblin', 'wolf'] },
      { at: 2200, foes: ['wolf', 'goblin', 'goblin', 'wolf', 'goblin'] },
    ],
    boss: { at: 3050, bosses: ['owlbear'], add: ['goblin', 'goblin'] },
  },
  {
    name: 'Vallaki', theme: 'town', music: 'music-lament',
    intro: 'The Baron of Vallaki insists that all will be well, and the festivals will continue until spirits improve. But the bones of St. Andral have gone missing, and something has crept into his church.',
    outro: 'The last of the vampire spawn turns to dust before the altar. To the west, high in the mountains, the village of Krezk keeps its gates shut against the night.',
    waves: [
      { at: 520, foes: ['cultist', 'ghoul', 'ghoul'] },
      { at: 1350, foes: ['wolf', 'cultist', 'ghoul', 'wolf'] },
      { at: 2200, foes: ['ghoul', 'knight', 'cultist', 'ghoul'] },
    ],
    boss: { at: 3050, title: 'Vampire Spawn', theme: 'church', place: 'St. Andral’s Church',
            bosses: ['spawn', 'spawn', 'spawn', 'spawn', 'spawn', 'spawn'], add: [] },
  },
  {
    name: 'Krezk', theme: 'abbey', music: 'music-lament',
    intro: 'The gates of Krezk open only for those with business at the abbey above the village. Its master, the Abbot, has been expecting visitors who might help with his great work.',
    outro: 'The Abbot’s light gutters out. Below, in the mist, the ruined manor of Argynvostholt keeps its endless vigil.',
    waves: [
      { at: 520, foes: ['wolf', 'wolf', 'skeleton'] },
      { at: 1350, foes: ['ghoul', 'wolf', 'ghoul', 'skeleton'] },
      { at: 2200, foes: ['ghoul', 'ghoul', 'wolf', 'skeleton', 'ghoul'] },
    ],
    boss: { at: 3050, bosses: ['abbot'], add: ['ghoul'] },
  },
  {
    name: 'Argynvostholt', theme: 'manor', music: 'music-lament',
    intro: 'Argynvostholt was once home to the silver dragon Argynvost and his knights. The knights still stand guard, long dead and full of hate, and four of them will not let you pass.',
    outro: 'The revenants fall, and for a moment the dragon’s beacon flickers. Far to the north, beyond the snows of Mount Ghakis, the Amber Temple calls.',
    waves: [
      { at: 520, foes: ['skeleton', 'skeleton', 'knight'] },
      { at: 1350, foes: ['knight', 'skeleton', 'ghoul', 'skeleton'] },
      { at: 2200, foes: ['knight', 'knight', 'skeleton', 'ghoul', 'skeleton'] },
    ],
    boss: { at: 3050, title: 'The Revenants', add: [],
                        // tint = a colour wash so the four are easy to tell apart (placeholder names for now)
            // quips = lines a boss says now and then in a chat bubble
            bosses: [{ type: 'revenant', name: 'Emily', tint: 0xc8d8ff },
                     { type: 'revenant', name: 'T', tint: 0xffd0c0, quips: [
                       'Karma is a cat, purring in my lap',
                       'Look what you made me do.',
                       'Bad Blood, adventurer.',
                       'Shake it off? I’m already dead.',
                       'Death by a Thousand Cuts!',
                       'Is it over now? Not for me.',
                       'Haunted.',
                       'This is me trying.',
                     ] },
                     { type: 'revenant', name: 'Fatama', tint: 0xd0ffd0 }, { type: 'revenant', name: 'Kindra', tint: 0xf0d0ff }] },
  },
  {
    name: 'The Amber Temple', theme: 'temple', music: 'music-lament',
    intro: 'In the frozen halls of the Amber Temple, dark gifts sleep inside walls of amber. One of them has woken. It wears the face of a smiling man, and it calls itself Bray Wyatt.',
    outro: 'Bray Wyatt’s smile burns away and the amber goes dark. Only Castle Ravenloft remains, and below its walls the dead are stirring.',
    waves: [
      { at: 520, foes: ['cultist', 'skeleton', 'cultist'] },
      { at: 1350, foes: ['knight', 'cultist', 'ghoul', 'cultist'] },
      { at: 2200, foes: ['knight', 'ghoul', 'cultist', 'knight', 'cultist'] },
    ],
    boss: { at: 3050, bosses: ['fiend'], add: ['cultist'] },
  },
  {
    name: 'Outside of Ravenloft', theme: 'gothic', music: 'music-lament',
    intro: 'Below the walls of Ravenloft, the dead no longer rest. Bones claw up through the frost, and in the crypt at the far end a barrow wight hums a funeral song.',
    outro: 'The wight’s song breaks into silence. On the cliff above, Castle Ravenloft lights its windows one by one.',
    waves: [
      { at: 520, foes: ['skeleton', 'skeleton', 'ghoul'] },
      { at: 1350, foes: ['ghoul', 'wolf', 'skeleton', 'wolf', 'skeleton'] },
      { at: 2200, foes: ['ghoul', 'skeleton', 'ghoul', 'skeleton', 'ghoul'] },
    ],
    boss: { at: 3050, bosses: ['wight'], add: ['skeleton'] },
  },
  {
    name: 'Inside Ravenloft', theme: 'castle', music: 'music-lament',
    intro: 'The gates stand open, as if you were expected. Strahd von Zarovich waits in the great hall. He has waited for centuries. He can wait a few minutes more.',
    outro: 'Strahd von Zarovich crumbles to ash, and for the first time in centuries, dawn breaks over Barovia.',
    waves: [
      { at: 520, foes: ['cultist', 'skeleton', 'skeleton', 'cultist'] },
      { at: 1350, foes: ['knight', 'cultist', 'ghoul', 'cultist'] },
      { at: 2200, foes: ['knight', 'knight', 'cultist', 'skeleton', 'cultist'] },
    ],
    boss: { at: 3050, bosses: ['vampire'], add: ['cultist'] },
  },
];
