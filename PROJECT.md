# The Curse of Strahd: Project Notebook

The living record of **what** we're building, **how** it's built, and **why** we made the choices we did.
Keep it open in VS Code. Update it every time something meaningful changes (see "Keeping this file up to date" at the bottom).

- **README.md**: how to run and deploy the game (setup steps).
- **SPRITES.md**: how to make and export art.
- **CLAUDE.md**: short rules for Claude when it works on the code.
- **This file**: the big picture, design decisions, history and to-do list.

---

## 1. The game in one paragraph

**The Curse of Strahd** is a D&D-flavored side-scrolling beat 'em up, based on the *Curse of Strahd* adventure, in the style of the classic arcade brawlers
(Golden Axe, Streets of Rage) that runs in a web browser. You pick one of four heroes and fight across seven acts
(The Lands of Barovia → Vallaki → Krezk → Argynvostholt → The Amber Temple → Outside of Ravenloft → Inside Ravenloft),
each ending in a boss fight; the final boss is Strahd von Zarovich. D&D shows up in the
mechanics: every hit is a d20 roll (natural 1 misses, natural 20 crits), weapons use damage dice (1d8+3),
spells use spell slots, and the story cards between acts read like a DM's read-aloud text.
It plays on desktop (keyboard) and phones (on-screen controls, held sideways).

## 2. Current status (October 2026)

| Area | State |
|---|---|
| Playable start to finish | ✅ 7 acts and their bosses, win and lose screens |
| Heroes | ✅ 4 heroes, each with a 3-hit combo, a signature spell and a once-per-act heal |
| Enemies | ✅ 6 regular foes + 7 boss fights: Owlbear, 6 Vampire Spawn (Vallaki church), the Abbot, 4 Revenants (Emily, T, Fatama, Kindra), Bray Wyatt, Barrow Wight, Strahd |
| Art | 🟡 **Ulrick, Rolfing and Fae'ron have final art.** The other heroes, the enemies and the backgrounds are still placeholders that final art will replace using the same file names |
| Sound | 🟡 Background music ("Lament of Home") on every screen. Sound effects are still the built-in synth |
| Hosting | Netlify, deploys automatically when `main` is pushed to GitHub |

## 3. How it's built

### The tools
- **Phaser 4.2.1**, a free game engine for the browser. It's included as one file (`vendor/phaser.min.js`),
  so nothing has to be installed.
- **Plain JavaScript files.** There is no "build step" and no npm packages: what's in the folder is
  exactly what runs, both on your computer and on Netlify. This keeps it simple and hard to break.
- **Live Server** in VS Code for testing locally. **GitHub Desktop** to save versions, and **Netlify** to publish.

### The big idea: data vs. code
Almost everything you'd want to tune lives in **`src/data/`** as plain lists of numbers and text.
The code in `src/scenes/` reads that data and makes it happen. **Change the data first and touch code only
when you need a new kind of behavior.**

```
src/data/        ← the "spreadsheet": heroes, enemies, levels, art settings, sounds
src/scenes/      ← the screens: each one is a Phaser "scene"
src/systems/     ← helpers shared by scenes: input, audio, dice
src/flow.js      ← which screen comes after which
assets/          ← sprites, backgrounds, audio files
```

### The screens (scenes) and how you move between them

```
Boot (loading) → Title → Select (pick a hero) → Story (Act intro card)
                                                     ↓
                                Game  (+ Hud on top, + Pause when paused)
                                                     ↓
                     Story (Act complete) → next Act ... → Story (Victory)
                     or Story (You died) → retry the Act
```

All the arrows between screens live in `src/flow.js`.

### How the gameplay works (GameScene)
- **Fixed 60 "ticks" per second.** Game rules update in exact steps (`step()`), so the game plays the same
  on fast and slow devices. All timings in data files are in ticks: **60 = 1 second**.
- **Fake 3D floor.** Every character has `x` (along the level), `y` (depth: how far "into" the screen, 345–515)
  and `z` (height off the ground when jumping). Characters lower on screen are drawn in front.
- **States.** Every character is always in one state (`idle`, `attack`, `hurt`, `spell`, `heal`, `dead`, …).
  Each tick, the code for the current state runs. Animations follow the state automatically.
- **Waves.** The camera scrolls right until it reaches a wave trigger point (`at` in `levels.js`), then locks
  until every enemy in that wave is defeated ("Onward ▶" appears). The last stop is the boss.
- **Dice.** `{ n: 2, s: 6, b: 3 }` means 2d6+3. The helpers are in `src/systems/util.js`.

### Art pipeline
Sprites are Aseprite sheets (PNG + JSON) with one **tag** per animation (`idle`, `walk`, `attack1`…).
The game turns tags into animations automatically. Full spec in **SPRITES.md**.

---

## 4. Heroes and their abilities

| Hero | Class | HP | Signature spell (uses spell slots) | Once-per-act heal (H key) |
|---|---|---|---|---|
| Ulrick Downcloud | Human Paladin | 140 | **Divine Smite**: radiant blast, heals 20 | **Lay on Hands**: flat 50 HP, instantly |
| Rolfing Thorntax | Dwarf Druid | 120 | **Entangle**: roots every foe on screen | **Goodberry**: 10 berries, 1d4+2 each, one every ½ second (~45 total) |
| Sunday the Gurthiest | Halfling Rogue | 90 | **Shadow Step**: dash and sneak attack | **Second Breakfast**: 2d8+24 (~33) |
| Fae'ron Visuvian | Half-Elf Bard | 100 | **Thunderwave**: blasts foes across the screen | **Song of Rest**: 2d10+25 (~36) |

- **Spell slots:** 3 per hero, one regenerates every 8 seconds.
- **Heal rules:** one use per act, refills when the next act starts. It won't fire (or get used up) at full
  health. During the short heal animation the hero can't be hit. Each heal restores roughly 35–40% of that
  hero's max HP.
- **Potions:** enemies sometimes drop a Potion of Healing (2d4+12).
- **Between acts:** a short rest restores half your HP, every spell slot and your heal.

To tweak any of this: **`src/data/heroes.js`**.

## 5. Controls

| Action | Keyboard | Phone |
|---|---|---|
| Move | WASD / arrows | Left stick |
| Strike (3-hit combo) | J or Z | Strike button |
| Jump | K, X or Space | Jump button |
| Spell | L or C | Spell button |
| Heal | H | Heal button (green) |
| Pause / Mute | P or Esc / M | Top-right icons |

On desktop, an in-game key legend sits under the hero panel and lights up the keys you press.
Keys are mapped in `src/systems/input.js`. The on-screen text is in `src/scenes/TitleScene.js`
and the touch buttons are in `src/scenes/HudScene.js`.

---

## 6. Design decisions (and why)

Write down any choice we'd otherwise forget the reason for.

| Decision | Why |
|---|---|
| No build step, no npm | Easy for a designer to run and edit; nothing to install or break. Vite is on the wish list but on hold until there's a concrete need |
| Phaser 4 (Oct 2026) | Current engine with a faster, more modern renderer. When reading tutorials, make sure they're for v4: some v3 calls (like `setTintFill`) no longer exist |
| Tuning lives in `src/data/` | Balance and content changes don't require reading game code |
| Fixed 60-tick game loop | Same feel on every device; timings are easy to reason about |
| Heal is once per act, not a cooldown | Makes it a big tactical choice ("save it for the boss?") instead of a button to spam |
| Heal doesn't fire at full HP | Prevents accidentally wasting it |
| Boss moves live in foes.js (`moves`, `summon`, `drain`, `regen`) | New bosses can be made by mixing existing moves in data, without new code |
| Each class heals differently | Class flavor: the paladin's is one big instant burst, the druid's trickles in over time, the rogue and bard get a dice roll with a joke attached |
| Placeholder art uses final file names | Real art can be dropped in without code changes |
| Painted sheets are shrunk to fit the game | Art comes in bigger than game size; shrinking so the idle pose is ~68px tall keeps every hero the same scale |

---

## 7. Changelog

Newest at the top. One line per change is plenty.

- **2026-10-09**: Fae'ron gets final art (`art-source/faeron-sheet.png`, from ChatGPT): thrust, slash and lunge combo, Thunderwave with sound rings, Song of Rest with music notes. His walk properly alternates legs. The converter learned to read sheets with real transparency (`transparent`, `solid`), keep faint spell glow, and resize rows drawn at the wrong size (`resize`).
- **2026-10-09**: New 6-frame walk cycle for Rolfing (`art-source/rolfing-walk.png`, from ChatGPT). Its export left a faint checkerboard haze, so the converter's new `solid` option keeps only the near-solid dwarf.
- **2026-10-09**: New 6-frame walk cycle for Ulrick (`art-source/ulrick-walk.png`, made with ChatGPT from the walk prompt). The legs now clearly pass each other. Added a `strips` option to the sheet converter for separate transparent rows like this.
- **2026-10-08**: The revenant **T** now says a line every 7–13 seconds in a speech bubble: the user-supplied "Karma" lyric plus Taylor Swift song titles as taunts. Any boss can get lines with `quips: [...]` in `src/data/levels.js`. Avoid adding more song lyrics, since the game is public; titles and original lines are fine.
- **2026-10-08**: The game restarting "at random" during local testing came from Live Server reloading the page whenever a project file changed, here while Claude was editing files. Don't test while Claude is making changes, and refresh once it's done. `.vscode/settings.json` now also stops changes to the docs, `art-source` and `tools` from reloading the page.
- **2026-10-08**: Four new acts from Curse of Strahd, for **seven** in total: **Vallaki** (six vampire spawn inside St. Andral's Church, with a fade from the town into the church), **Krezk** (the Abbot: holy light, charges, calls helpers), **Argynvostholt** (four revenants named Emily, T, Fatama and Kindra, who regenerate) and **the Amber Temple** (Bray Wyatt, a pit fiend in human form: fireballs, charges, summons). Boss moves are now settings in `src/data/foes.js` instead of code, and acts can have several bosses sharing one health bar. Placeholder art for the new backgrounds and bosses comes from `tools/placeholders/`.
- **2026-10-08**: Music volume lowered from 0.45 to 0.15 (`MUSIC_VOLUME` in `src/data/audio.js`).
- **2026-10-08**: Renamed the game **The Curse of Strahd**. The acts are now The Lands of Barovia, Outside of Ravenloft and Inside Ravenloft, the final boss is Strahd von Zarovich, and the title screen, story text, victory screen and browser tab are updated to match. Internal names (sprite file `count-vaszlo`, the folder and repo names) are unchanged.
- **2026-10-08**: Background music: `assets/audio/lament-of-home.mp3` plays on the title, select and story screens and in all three acts, and carries on between screens without restarting. It starts on the first click or key press, because browsers block sound until then. Track and volume settings live in `src/data/audio.js`; per-act music in `src/data/levels.js`.
- **2026-10-08**: Art hand-off guide ("Sending new art" in SPRITES.md), a walk-cycle template on the game grid (`art-source/templates/walk-template.png`), and the converter can now drop in ready-made rows pixel for pixel.
- **2026-10-08**: Faster walk cycles for Ulrick and Rolfing (70 ms per frame, was 100–110) so their feet don't look like they slide. Their painted walk frames still have too little leg movement and need a redo (see to-do).
- **2026-10-08**: Upgraded the engine from Phaser 3.80.1 to **Phaser 4.2.1**. Code changes: the white hit-flash and rogue afterimage use Phaser 4's new tint API, and `roundPixels` is switched back on (v4 defaults it off). Tested every screen, all three acts, every hero's spell and a boss.
- **2026-10-08**: New Rolfing sprite (`art-source/rolfing-sheet.png`): staff jab, spinning sweep and ground-slam combo, Entangle vines, and a glowing staff for Goodberry. The sheet converter now handles any hero (`tools/sprite-from-concept/make_sheet.py`).
- **2026-10-08**: Ulrick redesigned as a plumed knight with a shield (`art-source/ulrick-sheet.png`). Real art for every animation now, including jump, hurt, death and three different combo swings. The glowing-sword row is used for both Divine Smite and Lay on Hands.
- **2026-10-08**: Desktop key legend under the hero panel (Move, Strike, Jump, Spell, Heal, Pause, Mute). Keys light up while pressed. Lives in `src/scenes/HudScene.js` (`buildLegend`).
- **2026-10-08**: New Ulrick sprite made from the painted concept sheet (`art-source/ulrick-concept.png`), with new
  Divine Smite and Lay on Hands animations. Jump, hurt and death are stand-ins built from other poses until they get real art.
  The conversion scripts are in `tools/sprite-from-concept/`.
- **2026-10-08**: Added a once-per-act class heal for every hero (Lay on Hands, Goodberry, Second Breakfast,
  Song of Rest). New H key, green Heal touch button, HUD heal icon, and the heal shows on the hero select cards.
- **2026-10-08**: Created this project notebook.
- *(earlier)*: Initial game: 4 heroes, 3 acts, 3 bosses, touch controls, Netlify deploy.

## 8. Ideas and to-do

- [ ] Replace placeholder sprites with final art (see SPRITES.md). Ulrick, Rolfing and Fae'ron are done; Sunday and the enemies are left
- [ ] Ulrick and Rolfing walks: frames 4–6 repeat 1–3 (same leg leads). Needs a redo or an Aseprite shading fix
- [ ] Optional: redo Fae'ron's Thunderwave row (drawn in a squat pose, so he seems to duck while casting)
- [ ] Bray Wyatt sprite sheet (Luke is making it). It replaces `assets/sprites/bray-wyatt.png/json`
- [ ] Real names for the four Argynvostholt revenants (placeholders: Emily, T, Fatama, Kindra in `src/data/levels.js`)
- [ ] Final art for the new backgrounds (town, church, abbey, manor, temple) and bosses (vampire-spawn, the-abbot, revenant)
- [ ] Ulrick: optional separate Lay on Hands animation (it currently shares the Divine Smite glow row)
- [ ] Add real sound effects, and optionally a different music track per act (`src/data/audio.js`, `src/data/levels.js`)
- [ ] Delete the old `Ravenloft/` folder inside the project. It's a leftover local copy, ignored by git
- [ ] *Add new ideas here*

---

## Keeping this file up to date

After any meaningful change, update:
1. **Changelog** (section 7): date plus one line.
2. **Status** (section 2) and **Heroes** (section 4) if they changed.
3. **Design decisions** (section 6) if we chose something for a non-obvious reason.

Claude is told to do this automatically (see CLAUDE.md). You can also just say "update the notebook".
