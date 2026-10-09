// Parallax layers for each level theme, listed back to front.
// Files live in assets/backgrounds/<theme>/<file>.png and are 540px tall.
// factor -> how fast the layer scrolls with the camera (0 = fixed sky, 1 = moves with the floor, >1 = foreground)
// drift  -> extra pixels per tick the layer slides on its own (clouds, fog)
// front  -> drawn in front of the characters
// once   -> shown a single time instead of repeating: the image's left edge sits at this x (in pixels) at the
//           start of the level, then scrolls at `factor` like the others. On title/menu screens it stays put.
// y      -> for `once` layers: how far down the image's top edge sits
// Scrolling layers should tile seamlessly left-to-right (the placeholders are 1920px wide).
export const BACKGROUNDS = {
  forest: [          // Act I, also the title and hero select screens (made by tools/backgrounds/make_forest.py)
    { file: 'backdrop', factor: 0.15 },               // the dark forest
    { file: 'castle', factor: 0.15, once: 400, y: 40 }, // Castle Ravenloft and the moon, in the forest clearing
    { file: 'ground', factor: 1 },
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
  // ---- placeholders for the new locations (made by tools/placeholders/backgrounds.py) ----
  town: [            // Vallaki
    { file: 'sky', factor: 0 },
    { file: 'mountains', factor: 0.08 },
    { file: 'roofs', factor: 0.25 },
    { file: 'houses', factor: 0.6 },
    { file: 'ground', factor: 1 },
    { file: 'fog', factor: 0.9, drift: 0.3 },
    { file: 'foreground', factor: 1.3, front: true },
  ],
  church: [          // inside St. Andral's Church (Vallaki's boss fight)
    { file: 'wall', factor: 0.5 },
    { file: 'floor', factor: 1 },
    { file: 'foreground', factor: 1.35, front: true },
  ],
  abbey: [           // Krezk
    { file: 'sky', factor: 0 },
    { file: 'mountains', factor: 0.08 },
    { file: 'abbey', factor: 0.18 },
    { file: 'walls', factor: 0.55 },
    { file: 'ground', factor: 1 },
    { file: 'foreground', factor: 1.3, front: true },
  ],
  manor: [           // Argynvostholt
    { file: 'sky', factor: 0 },
    { file: 'manor', factor: 0.12 },
    { file: 'trees', factor: 0.35 },
    { file: 'wall', factor: 0.7 },
    { file: 'ground', factor: 1 },
    { file: 'fog', factor: 0.9, drift: 0.35 },
    { file: 'foreground', factor: 1.3, front: true },
  ],
  temple: [          // the Amber Temple
    { file: 'wall', factor: 0.5 },
    { file: 'floor', factor: 1 },
    { file: 'foreground', factor: 1.35, front: true },
  ],
};
