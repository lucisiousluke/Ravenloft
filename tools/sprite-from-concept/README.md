# Concept sheet → game sprite sheet

These scripts turned `art-source/ulrick-concept.png` (one big painted sheet on a flat navy background)
into `assets/sprites/ulrick.png` + `ulrick.json`. They are **not** part of the game; they need Python with
Pillow, NumPy and SciPy (`python3 -m venv venv && ./venv/bin/pip install pillow numpy scipy`).

1. `cut.py` finds each figure, removes the background and painted ground shadow, keeps glows see-through.
   The `FRAMES` list (which blob is which pose) is specific to that one image.
2. `build.py` shrinks everything 3× and puts the feet at (80, 116) in 160×128 cells.
3. `make_sheet.py <out>` decides which poses make up each animation tag and writes `<out>.png/.json`.

For another hero's concept sheet, ask Claude to adapt them. The frame list and tag mapping will change.
