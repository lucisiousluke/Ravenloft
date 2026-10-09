# Placeholder art

Scripts that draw simple stand-in art so new content is playable before the real art exists.
They are **not** part of the game and need Python with Pillow (setup: see `tools/sprite-from-concept/README.md`).

- `backgrounds.py` draws the background layers for town (Vallaki), church, abbey (Krezk), manor (Argynvostholt)
  and temple (Amber Temple) into `assets/backgrounds/<theme>/`.
- `sprites.py` draws the vampire spawn, revenant, Abbot and Bray Wyatt sheets into `assets/sprites/`, and adds
  the `holy` and `fire` projectiles to the `fx` sheet.

To use real art, overwrite the file with the same name and size. **Don't rerun these scripts after that**, or
they'll draw over your art.
