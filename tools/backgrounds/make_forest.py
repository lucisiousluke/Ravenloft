# Builds Act I's background (theme 'forest') from two pieces of art:
#   art-source/backgrounds/forest-dark.png    the dark forest (scrolls, repeats seamlessly by mirroring)
#   art-source/backgrounds/forest-castle.png  the castle and moon (cut out once, recoloured to the forest's palette)
# Not part of the game. Needs Python with Pillow + NumPy (see tools/sprite-from-concept/README.md for setup).
#   python tools/backgrounds/make_forest.py
# Writes assets/backgrounds/forest/backdrop.png, castle.png and ground.png.
import os
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'assets', 'backgrounds', 'forest')
H = 540
K = 1.5        # the forest art is 639x360; x1.5 fills the 540px-tall screen
LIFT = 60      # raise the forest so its tree line sits at the top of the walkable floor (y 345)

def load(name): return np.array(Image.open(os.path.join(ROOT, 'art-source', 'backgrounds', name)).convert('RGB')).astype(float)
def scale(a, k): return np.array(Image.fromarray(a.astype(np.uint8)).resize((round(a.shape[1] * k), round(a.shape[0] * k)), Image.NEAREST)).astype(float)
def mirror_tile(a): return np.concatenate([a, a[:, ::-1]], 1)   # image + flipped copy: repeats with no visible seam
def save(a, name): Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(os.path.join(OUT, name + '.png'), optimize=True)

forest = load('forest-dark.png')

# 1. backdrop: the forest, its small moon removed (the castle brings its own), lifted, tiled by mirroring
f = forest.copy()
yy, xx = np.mgrid[0:f.shape[0], 0:f.shape[1]]
f[(xx - 318) ** 2 + (yy - 28) ** 2 < 26 ** 2] = (14, 94, 119)          # paint the moon and its glow out with sky colour
big = scale(f, K)[LIFT:LIFT + H]
big = np.concatenate([big, np.tile(big[-1:], (H - big.shape[0], 1, 1))], 0) if big.shape[0] < H else big
save(mirror_tile(big), 'backdrop')

# 2. ground: the forest's own grassy floor, from the first bright grass row down; the rest dark
band = forest[250:356]                                 # (the very last rows are a JPEG edge artifact)
top = np.full(band.shape[1], 50)
for x in range(band.shape[1]):
    rows = np.where(band[:, x, 1] > 120)[0]            # first bright-grass pixel in this column
    if len(rows): top[x] = min(rows[0], 50)
top = np.maximum(top, np.array([np.median(top[max(0, x - 6):x + 7]) for x in range(len(top))]) - 3).astype(int)   # no single-column spikes
alpha = (np.arange(band.shape[0])[:, None] >= top[None, :]) * 255.0
g = scale(np.dstack([band, alpha]), K)
grass_top = int(np.median(top) * K)                   # put the grass line just above the floor's top edge
y0 = 335 - grass_top
layer = np.zeros((H, g.shape[1], 4))
layer[y0:y0 + g.shape[0]] = g[:H - y0]
below = y0 + g.shape[0]
if below < H: layer[below:] = (1, 2, 32, 255)          # deep shadow under the grass
save(mirror_tile(layer), 'ground')

# 3. castle: cut from the second image, recoloured into the forest's teal palette, soft edges, shown once
castle = load('forest-castle.png')[20:330, 295:470]
lum = castle @ [0.3, 0.55, 0.15]
sky_lum = np.median(lum[:30, :20])                      # the night sky next to the castle
stops = [(0, (1, 2, 32)), (sky_lum * 0.55, (3, 40, 72)), (sky_lum, (14, 94, 119)), (150, (72, 168, 167)), (225, (249, 234, 215)), (256, (255, 250, 235))]
xs = [s[0] for s in stops]
recol = np.dstack([np.interp(lum, xs, [s[1][c] for s in stops]) for c in range(3)])
h, w = lum.shape
yy, xx = np.mgrid[0:h, 0:w]
cx, cy = w * 0.52, h * 0.42
edge = np.clip(1.6 - np.sqrt(((xx - cx) / (w * 0.5)) ** 2 + ((yy - cy) / (h * 0.62)) ** 2) * 1.6, 0, 1)   # soft oval
fade = np.clip((h * 0.97 - yy) / (h * 0.3), 0, 1)                                                          # base fades into the trees
a = (edge * fade * 255)
a = np.array(Image.fromarray(a.astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))).astype(float)
c = scale(np.dstack([recol, a]), 0.95)
save(c, 'castle')
print('backdrop', mirror_tile(big).shape[:2], '| ground', mirror_tile(layer).shape[:2], '| castle', c.shape[:2])
