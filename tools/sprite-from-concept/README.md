# Painted sheet → game sprite sheet

`make_sheet.py` turns a painted hero sheet in `art-source/<hero>-sheet.png` into the game files
`assets/sprites/<hero>.png` + `<hero>.json`. It is **not** part of the game. It needs Python with Pillow,
NumPy and SciPy:

```
python3 -m venv venv && ./venv/bin/pip install pillow numpy scipy
./venv/bin/python tools/sprite-from-concept/make_sheet.py rolfing
```

It also writes `<hero>-preview.png` here (frames on a dark background, a red tick where the feet go).
Previews aren't committed.

## How the painted sheet should look
- One animation per row, figures facing right, on a plain light checkerboard or white background.
- Row order used so far: idle, walk, attack A, attack B, attack C, jump, hurt, death, spell.

## What the script does
1. Removes the checkerboard. It only clears light gray that touches the outside, so shiny armor stays.
   `trapped_checker=True` also clears checkerboard caught inside a figure (between a staff and the body).
   Leave it off for heroes with shiny blades.
2. Finds each figure row by row. The `rows` list in `HEROES` must match the sheet's frame counts.
3. Turns glow painted white-on-white into see-through colored light (`glow` frames, `light` color).
4. Shrinks so the first idle frame is `stand_h` pixels tall, and puts the feet at (80, 116) in 160×128 cells.
5. `tags` decides which frames make each game animation, and their timing.

To add another hero, copy an entry in `HEROES`, adjust it, and run the script with that hero's name.
