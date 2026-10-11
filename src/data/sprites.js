// Every sprite sheet the game loads from assets/sprites/<key>.png + <key>.json
// (the JSON is Aseprite's "Array" export, with one tag per animation).
// feet  -> pixel inside one frame where the character's feet touch the ground
// scale -> draw size multiplier (use 0.5 if you paint at double resolution)
export const SPRITES = {
  ulrick:          { feet: [80, 116], scale: 1 },
  rolfing:         { feet: [80, 116], scale: 1 },
  sunday:          { feet: [80, 116], scale: 1 },
  faeron:          { feet: [80, 116], scale: 1 },
  goblin:          { feet: [80, 116], scale: 1 },
  'dire-wolf':     { feet: [80, 116], scale: 1 },
  skeleton:        { feet: [80, 116], scale: 1 },
  ghoul:           { feet: [80, 116], scale: 1 },
  'blood-cultist': { feet: [80, 116], scale: 1 },
  'blood-knight':  { feet: [92, 131], scale: 1 },
  owlbear:         { feet: [140, 203], scale: 1 },
  'barrow-wight':  { feet: [120, 174], scale: 1 },
  strahd:          { feet: [96, 116], scale: 1 },   // 200x128 frames
  'vampire-spawn': { feet: [80, 116], scale: 1 },
  revenant:        { feet: [92, 131], scale: 1 },
  'the-abbot':     { feet: [108, 160], scale: 1 },
  'bray-wyatt':    { feet: [108, 160], scale: 1 },
  fx:              { feet: [48, 48], scale: 1 }, // projectiles and potion, centered
};

// Animations that repeat. Everything else plays once.
export const LOOPING = new Set(['idle', 'walk', 'bolt', 'bat', 'shade', 'holy', 'fire']);
