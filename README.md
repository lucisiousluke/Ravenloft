# Ravenmoor

A Dungeons & Dragons side-scrolling brawler built with [Phaser 3](https://phaser.io) (v3.80.1, included in `vendor/`).
There is no build step: the folder runs exactly as it is, locally and on Netlify.

## Run it on your computer

1. Open this folder in VS Code (**File → Open Folder…**).
2. Install the **Live Server** extension (by Ritwick Dey).
3. Click **Go Live** in the bottom-right status bar. The game opens at `http://127.0.0.1:5500`.
4. Every time you save a file (code or a sprite PNG), the page reloads.

> Opening `index.html` by double-clicking won't work. Browsers block a page from loading
> the sprite files directly off your disk, so it needs a local server like Live Server.

Tip: press **F12** in the browser and open the **Console** tab. If a sprite file is missing
or misnamed, the error shows up there (and on the loading screen).

## Put it online with Netlify (one-time setup)

1. Install **GitHub Desktop**, choose **File → Add local repository**, pick this folder, and
   create a repository when it offers. Then click **Publish repository** (it can stay private).
2. In Netlify: **Add new site → Import an existing project → GitHub**, and pick the repo.
3. Netlify reads `netlify.toml` and fills in the settings: no build command, publish directory `.`.
   Click **Deploy**.

After that, your everyday loop is:

1. Edit in VS Code and check it with Live Server.
2. In GitHub Desktop, write a short summary (e.g. "New Ulrick walk cycle") and click **Commit**, then **Push**.
3. Netlify deploys automatically within about a minute. Friends just refresh the link.

To try something risky, make a new **branch** in GitHub Desktop and push it. Netlify can give
each branch its own preview link (turn on **Branch deploys** under Site configuration → Build & deploy),
so you can test with friends without touching the main game. Every deploy is kept, so you can
roll back from the Netlify **Deploys** page with one click.

For the big picture (how it's built, design decisions, changelog, to-do), see **PROJECT.md**.

## Where things live

| Folder / file | What it is |
|---|---|
| `index.html` | The page that loads Phaser and the game |
| `src/main.js` | Starts Phaser and lists the scenes |
| `src/data/` | **The fun part.** Heroes, enemies, levels, waves, backgrounds, sprite settings, sounds |
| `src/scenes/` | One file per screen: Boot (loading), Title, Select, Story (act cards), Game, Hud, Pause |
| `src/flow.js` | Which screen comes after which |
| `src/systems/` | Keyboard/touch input, sound, dice helpers |
| `src/ui/widgets.js` | Buttons, the parchment "read aloud" box, parallax layers |
| `assets/sprites/` | Character sprite sheets (PNG + JSON) — see `SPRITES.md` |
| `assets/backgrounds/` | Parallax background layers per level theme |
| `assets/audio/` | Put sound effects and music here (see `src/data/audio.js`) |

### Common tweaks

- **Rename a hero, change HP, speed or damage dice:** `src/data/heroes.js`
- **Change which enemies appear in a wave, or add a wave:** `src/data/levels.js`
- **Make an enemy tougher or faster:** `src/data/foes.js`
- **Add a new level:** add an entry to `src/data/levels.js` and a matching background set in `src/data/backgrounds.js`

## Controls

Keyboard: move with **WASD** or the arrow keys, **J/Z** strike (3-hit combo), **K/Space** jump,
**L/C** cast a spell, **H** use your once-per-act heal, **P/Esc** pause, **M** mute.
On a phone, an on-screen stick and buttons appear. Hold the phone sideways.
