// Parallax layers for each level theme, listed back to front.
// Files live in assets/backgrounds/<theme>/<file>.png and are 540px tall.
// factor -> how fast the layer scrolls with the camera (0 = fixed sky, 1 = moves with the floor, >1 = foreground)
// drift  -> extra pixels per tick the layer slides on its own (clouds, fog)
// front  -> drawn in front of the characters
// Scrolling layers should tile seamlessly left-to-right (the placeholders are 1920px wide).
export const BACKGROUNDS = {
  forest: [
    { file: 'sky', factor: 0 },
    { file: 'hillsFar', factor: 0.08 },
    { file: 'hillsNear', factor: 0.16 },
    { file: 'treesFar', factor: 0.3 },
    { file: 'treesNear', factor: 0.62 },
    { file: 'ground', factor: 1 },
    { file: 'foreground', factor: 1.3, front: true },
  ],
  gothic: [
    { file: 'sky', factor: 0 },
    { file: 'clouds', factor: 0.03, drift: 0.15 },
    { file: 'castles', factor: 0.12 },
    { file: 'hill', factor: 0.25 },
    { file: 'graves', factor: 0.45 },
    { file: 'fence', factor: 0.8 },
    { file: 'ground', factor: 1 },
    { file: 'fog', factor: 0.9, drift: 0.35 },
    { file: 'foreground', factor: 1.3, front: true },
  ],
  castle: [
    { file: 'wall', factor: 0.5 },
    { file: 'floor', factor: 1 },
    { file: 'foreground', factor: 1.35, front: true },
  ],
};
