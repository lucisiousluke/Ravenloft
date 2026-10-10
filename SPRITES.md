# Sprite & art spec

Every character is one **sprite sheet**: a PNG of animation frames plus a JSON file that says where each
frame is and which frames belong to which animation. The game turns each animation **tag** into an
animation automatically, so you never need to touch code to change frames or timing.

The files in `assets/sprites/` right now are placeholders generated from the original drawings.
Paint over them, or replace them with your own sheets, using the same file names.

## Sending new art (read this first)

Claude can't watch an animation play: it sees still frames and measures them. So the cleaner the frames,
the better the result. In order of preference:

1. **Best: paint on the game grid.** Open `art-source/templates/walk-template.png` in Aseprite. It has
   six 160×128 cells (the game's frame size) with guides:
   - **Red line:** where the feet touch the ground (y 116). Feet sit on it in every frame.
   - **Blue line:** the body's center (x 80). Keep the hips roughly over it.
   - **Gold and green lines:** Ulrick's and Rolfing's height, to keep the size consistent.
   - **Stick legs:** the six walk poses (stride, down, passing, stride, down, passing). The light and blue
     legs swap halfway through.

   Paint each frame on a new layer, hide the guide layer, and export a **transparent PNG**
   (e.g. `art-source/ulrick-walk.png`). It goes into the game pixel for pixel, with no shrinking or guessing.
2. **Good: a full Aseprite export** following "Exporting from Aseprite" below. The game reads it directly.
3. **Works, with limits: one big painted or AI sheet** like the current ones. Claude cuts it up and shrinks it,
   which softens detail and can't add movement that isn't in the frames. If you use this route:
   - Use real transparency, not a checkerboard picture.
   - Keep every figure the same size.
   - Leave space between figures and between weapon and body.

When something looks wrong, say what you see (feet sliding, legs stiff, bouncing, jitter, too slow,
too fast) and which animation. That points straight at the cause.

## Exporting from Aseprite

1. Put each animation on the timeline and create a **tag** for it with the exact names below
   (`idle`, `walk`, `attack1`…). Set each frame's duration in the timeline. That timing is used in-game.
2. **File → Export Sprite Sheet**
   - Layout: **By Rows** (any layout works; rows keep the PNG small)
   - Output: check **JSON Data**, choose **Array** (not Hash), and check **Tags** under Meta.
   - Save the PNG and JSON as `assets/sprites/<name>.png` and `<name>.json`.
3. Save. Live Server reloads and the new art is in the game.

LibreSprite and Piskel can also export sheets. Any tool works as long as the JSON has `frames`
and `meta.frameTags` in Aseprite's format.

## Rules for every frame

- **Face right.** The game flips sprites to face left.
- **Keep the feet on the same pixel in every frame.** That pixel is the character's anchor
  (listed below and set in `src/data/sprites.js`). If your frame size or feet position changes,
  update `feet` there.
- **Leave room.** Weapon swings, capes and the death fall need empty space inside the frame.
  The death animation falls backward (to the left).
- **Painting at 2× detail?** Make frames twice as big, double the `feet` numbers, and set `scale: 0.5`
  in `src/data/sprites.js`.
- No shadows in the art. The game draws the ground shadow.

## Animation tags

**Heroes:** `idle` (loops), `walk` (loops), `attack1`, `attack2`, `attack3` (the 3-hit combo),
`jump`, `hurt`, `death`, `cast` (spell), and optionally `heal` (the once-per-act heal; heroes without it use `cast`).

**Enemies:** `idle`, `walk`, `windup` (the warning pose before a hit), `attack`, `hurt`, `death`,
plus `cast` for the Blood Cultist, Barrow Wight and Strahd (whose sprite file is still named `count-vaszlo`).

Attacks, wind-ups and spells are **stretched to fit the move's game timing** (e.g. Ulrick's swing
takes 20 ticks = ⅓ second). Your frame durations still set the rhythm *within* the move. The hit
lands about 40% of the way through a hero attack, so put the swing's contact frame there.
Idle and walk play at your exact timing.

## Current sheets

| File | Frame size | Feet (x, y) | Tags (frame count) |
|---|---|---|---|
| `ulrick` | 160×128 | 80, 116 | idle(3), walk(8), attack1(6), attack2(6), attack3(5), jump(2), hurt(2), death(6), cast(6), heal(6). **Final art**, made from `art-source/ulrick-sheet.png` |
| `rolfing` | 160×128 | 80, 116 | idle(4), walk(7), attack1(6), attack2(6), attack3(6), jump(2), hurt(2), death(6), cast(6), heal(2). **Final art**, made from `art-source/rolfing-sheet.png` |
| `sunday` | 160×128 | 80, 116 | idle(4), walk(7), attack1(6), attack2(7), attack3(6), jump(2), hurt(2), death(7), cast(6), heal(4). **Final art**, made from `art-source/sunday-sheet.png` |
| `faeron` | 160×128 | 80, 116 | idle(4), walk(6), attack1(6), attack2(6), attack3(5), jump(2), hurt(2), death(7), cast(6), heal(4). **Final art**, made from `art-source/faeron-sheet.png` |
| `goblin` | 160×128 | 80, 116 | idle(4), walk(8), windup(3), attack(5), hurt(2), death(6) |
| `dire-wolf` | 160×128 | 80, 116 | idle(4), walk(8), windup(3), attack(5), hurt(2), death(6) |
| `skeleton` | 160×128 | 80, 116 | idle(4), walk(8), windup(3), attack(5), hurt(2), death(6) |
| `ghoul` | 160×128 | 80, 116 | idle(4), walk(8), windup(3), attack(5), hurt(2), death(6) |
| `blood-cultist` | 160×128 | 80, 116 | idle(4), walk(8), windup(3), attack(5), hurt(2), death(6), cast(6) |
| `blood-knight` | 184×144 | 92, 131 | idle(4), walk(8), windup(3), attack(5), hurt(2), death(6) |
| `owlbear` | 280×224 | 140, 203 | idle(4), walk(8), windup(3), attack(5), hurt(2), death(6) |
| `barrow-wight` | 240×192 | 120, 174 | idle(4), walk(8), windup(3), attack(5), hurt(2), death(6), cast(6) |
| `count-vaszlo` | 216×176 | 108, 160 | idle(4), walk(8), windup(3), attack(5), hurt(2), death(6), cast(6). This is Strahd |
| `vampire-spawn` | 160×128 | 80, 116 | idle(4), walk(8), windup(3), attack(5), hurt(2), death(6), cast(6). Placeholder (Vallaki) |
| `revenant` | 184×144 | 92, 131 | same tags. Placeholder (Argynvostholt; all four revenants share it, tinted differently) |
| `the-abbot` | 216×176 | 108, 160 | same tags. Placeholder (Krezk) |
| `bray-wyatt` | 216×176 | 108, 160 | same tags. Placeholder (Amber Temple): **Luke's sheet will replace it** |
| `fx` | 96×96 | 48, 48 (center) | bolt(2), bat(2), shade(2), wave(1), potion(1), holy(2), fire(2) |

`fx` holds projectiles and the healing potion. They're drawn facing right and centered.

## Backgrounds

Each level theme has layers in `assets/backgrounds/<theme>/`, listed back to front in
`src/data/backgrounds.js` with how fast each scrolls.

- Every layer is **540px tall**, with transparency wherever the layer behind should show through.
- `sky` layers don't scroll and are **960px wide**.
- Scrolling layers must **tile seamlessly** left to right (the right edge continues into the left edge).
  The placeholders are 1920px wide, but any width works.
- The walkable floor is between **y = 345 and y = 515**. Keep the ground layer's horizon at 345.
- `foreground` layers draw in front of the characters, so keep them sparse.
- A layer with `once` in `src/data/backgrounds.js` is a single image that doesn't repeat, such as Act I's
  castle. It can be any size and can have transparency.
- Act I's layers are built from `art-source/backgrounds/forest-dark.png` and `forest-castle.png` by
  `tools/backgrounds/make_forest.py` (it lines them up, recolors the castle and makes the forest repeat seamlessly).

## Sound

Drop `.mp3` or `.ogg` files in `assets/audio/` and list them in `src/data/audio.js`. Any effect
you don't replace keeps its built-in synth sound.
