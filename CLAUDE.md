# The Curse of Strahd (project folder: ravenmoor) — notes for Claude

"The Curse of Strahd", a D&D-themed (Curse of Strahd / Barovia) side-scrolling beat 'em up built with Phaser 4.2.1 (`vendor/phaser.min.js`, loaded as a global `Phaser`).
Phaser 4 changed some APIs from v3 (e.g. `setTintFill` is gone: use `setTint(c).setTintMode(Phaser.TintModes.FILL)`);
check the v4 docs, not v3 examples, when writing engine code.
Plain ES modules, **no build step and no npm dependencies**. Keep it that way unless asked.

## Project notebook
`PROJECT.md` is the living record of the project (status, how it's built, hero abilities, design decisions,
changelog, to-do). After any meaningful change, add a dated line to its Changelog and update any section
that's now out of date. Read it at the start of a session for context.

## Running it
- Local preview: VS Code Live Server ("Go Live") or `python3 -m http.server 5500` from the project root, then open http://localhost:5500.
- Deploys: pushing to `main` on GitHub deploys to Netlify automatically (`netlify.toml`, publish dir `.`).

## Layout
- `src/data/` holds all tuning and content (heroes, foes, levels/waves, backgrounds, sprite anchors, audio). Prefer changing data over code.
- `src/scenes/`: Boot (loads assets, builds animations), Title, Select, Story (between-act cards), Game (all gameplay), Hud (UI + touch controls, runs on top of Game), Pause.
- `src/flow.js` decides which scene follows which.
- `src/systems/`: `input.js` (keyboard + touch, buffered actions), `audio.js` (synth fallback, real files override), `util.js` (dice).
- Art lives in `assets/`. The format is documented in `SPRITES.md`.

## Conventions
- Game logic runs at a fixed 60 ticks/sec in `GameScene.step()`. Timings in data files are in ticks (60 = 1 second).
- World coordinates: `x` along the level, `y` = depth on the floor (345–515), `z` = height off the ground. Sprites sit at (x, y − z) with depth = y.
- Change an entity's state with `this.go(entity, state, t)`, which bumps `seq` so animations restart correctly.
- Animations are named `<sprite>:<tag>` from Aseprite tags (e.g. `ulrick:attack1`). Attack/cast animations are time-stretched to the move's tick length.
- Sprite sheets face right; the game flips them.
- Game resolution is 960×540, `pixelArt: true`, scaled with `Phaser.Scale.FIT`.
- Fonts: Pirata One (display) and Alegreya Sans (body) from Google Fonts.

## The owner
Luke is a designer (UX/marketing background), newer to code. Explain changes in plain language,
keep code readable with short comments, and say which file to edit for future tweaks.
After changing anything, test in the browser and check the console for errors.
