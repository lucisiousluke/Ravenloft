# Cuts the Ulrick concept sheet into clean, game-sized frames (RGBA arrays), saved to frames.npz
import numpy as np
from PIL import Image
from scipy import ndimage
SRC = 'src_art/ulrick-concept.png'
im = np.array(Image.open(SRC).convert('RGB')).astype(float)
BG = np.array([20., 30., 59.])
d = np.sqrt(((im - BG) ** 2).sum(-1))
solid = d > 28
lab, n = ndimage.label(solid, structure=np.ones((3, 3)))
objs = ndimage.find_objects(lab)
sizes = ndimage.sum(solid, lab, range(1, n + 1))

# main blob id for each frame (from analyze.py), in sheet order
FRAMES = {
  'stand': [10], 'walk1': [11], 'walk2': [12], 'walk3': [13], 'walk4': [15], 'walk5': [14],
  'atk1': [54], 'atk2': [52], 'atk3': [50], 'atk4': [53],
  'heal1': [117], 'heal2': [108], 'heal3': [107], 'heal4': [118],
  'smite1': [111], 'smite2': [97], 'smite3': [120], 'smite4': [119],
}
GLOW = {'heal2', 'heal3', 'smite2', 'smite3'}
LABEL_BANDS = [(40, 76), (357, 395), (652, 689)]
def box(i):
    sl = objs[i - 1]; return sl[1].start, sl[0].start, sl[1].stop, sl[0].stop
# assign every other component to the frame whose main blob box (padded) holds its centre
owner = {}
for name, ids in FRAMES.items():
    for i in ids: owner[i] = name
for i in range(1, n + 1):
    if i in owner or sizes[i - 1] < 3: continue
    x0, y0, x1, y1 = box(i)
    if sizes[i - 1] < 700 and any(a <= y0 and y1 <= b for a, b in LABEL_BANDS): continue  # text label
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    best = None
    for name, ids in FRAMES.items():
        bx0, by0, bx1, by1 = box(ids[0]); pad = 30
        if bx0 - pad <= cx <= bx1 + pad and by0 - pad <= cy <= by1 + pad:
            dist = abs(cx - (bx0 + bx1) / 2)
            if best is None or dist < best[0]: best = (dist, name)
    if best: owner[i] = best[1]

def c2a(c):
    # "colour to alpha" against the navy background: how much non-navy colour this pixel holds
    up = (c - BG) / (255 - BG); dn = (BG - c) / BG
    return np.clip(np.maximum(up, dn).max(-1), 0, 1)

out = {}
for name, ids in FRAMES.items():
    comps = [i for i, o in owner.items() if o == name]
    x0 = min(box(i)[0] for i in comps); y0 = min(box(i)[1] for i in comps)
    x1 = max(box(i)[2] for i in comps); y1 = max(box(i)[3] for i in comps)
    x0 -= 4; y0 -= 4; x1 += 4; y1 += 4
    c = im[y0:y1, x0:x1]; L = lab[y0:y1, x0:x1]
    mine = np.isin(L, comps)
    others = (L > 0) & ~mine
    a = np.where(mine, 1.0, 0.0)
    if name in GLOW:
        # glow: light added on top of navy (blue never drops below the background) -> partly see-through
        ca = c2a(c)
        glowy = (c[..., 2] >= BG[2] - 5) & (c[..., 0] > c[..., 2] + 5) & (ca < 0.6)
        a = np.where(glowy & ~others, ca, a)
        near_other = ndimage.binary_dilation(others | (L > 0) & ~mine, iterations=3)
        yy0 = np.arange(y0, y1)[:, None]
        in_label = np.zeros_like(near_other)
        for lo, hi in LABEL_BANDS: in_label |= (yy0 >= lo - 3) & (yy0 <= hi + 3) & (np.arange(x0, x1)[None, :] < 1080)
        faint = (L == 0) & (ca > 0.08) & ~near_other & ~in_label
        a = np.where(faint, ca, a)
    # painted ground shadow: dark navy pixels near the bottom of the figure
    rows = np.where(mine.any(1))[0]; bottom = rows.max()
    yy = np.arange(c.shape[0])[:, None]
    lum = c.mean(-1)
    shadow = (yy > bottom - 16) & (lum < 48) & (c[..., 2] - c[..., 0] > 12) & (c[..., 0] < 30)
    a = np.where(shadow, 0, a)
    # un-blend colour where partly transparent
    safe = np.maximum(a, 1e-3)[..., None]
    col = np.where(a[..., None] < 1, BG + (c - BG) / safe, c)
    col = np.clip(col, 0, 255)
    out[name] = np.dstack([col, a * 255]).astype(np.uint8)
np.savez('frames_full.npz', **out)
print({k: v.shape[:2] for k, v in out.items()})
