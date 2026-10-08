# Painted hero sheet (one animation per row, on a baked-in checkerboard) -> game sprite sheet.
#   python make_sheet.py <hero>      e.g.  python make_sheet.py rolfing
# Reads art-source/<hero>-sheet.png, writes assets/sprites/<hero>.png + .json and a preview in tools/sprite-from-concept/.
# Not part of the game: needs Python with Pillow, NumPy and SciPy (see README.md).
import json, os, sys, numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

# Per-hero settings.
# rows    -> (name, frame count) for each row of the painted sheet, top to bottom
# stand_h -> how tall the first idle frame should be in game pixels
# light   -> colour for glow that was painted white-on-white (rays, sparkles)
# glow    -> frames (or row names) that contain glow effects
# lying   -> frames where the hero lies on the ground; anchored by the feet so they fall backward
#            (lying_off = how far in from the right edge the feet are, in source pixels)
# trapped_checker -> also clear checkerboard trapped inside a figure (e.g. between staff and body)
# tags    -> game animation name -> list of (frame, milliseconds). Only the rhythm matters for attacks/spells;
#            the game stretches them to the move's length. The hit lands ~40% through an attack.
HEROES = {
  'ulrick': dict(
    rows=[('idle', 3), ('walk', 8), ('slash', 6), ('thrust', 6), ('chop', 5), ('jump', 2), ('hurt', 2), ('death', 6), ('glow', 6)],
    stand_h=68, light=(255, 226, 140), glow=['glow'], lying=['death3', 'death4', 'death5', 'death6'],
    tags={
      'idle':    [('idle1', 400), ('idle2', 300), ('idle3', 400)],
      'walk':    [(f'walk{i}', 100) for i in range(1, 9)],
      'attack1': list(zip([f'thrust{i}' for i in range(1, 7)], [60, 90, 70, 70, 70, 80])),   # quick thrust
      'attack2': list(zip([f'slash{i}' for i in range(1, 7)], [60, 60, 60, 120, 80, 140])),  # rising slash
      'attack3': list(zip([f'chop{i}' for i in range(1, 6)], [50, 50, 50, 60, 220])),        # heavy chop finisher
      'jump':    [('jump1', 120), ('jump2', 400)],
      'hurt':    [('hurt1', 100), ('hurt2', 120)],
      'death':   list(zip([f'death{i}' for i in range(1, 7)], [90, 90, 90, 100, 120, 600])),
      'cast':    [(f'glow{i}', 100) for i in range(1, 7)],                                    # Divine Smite
      'heal':    [(f'glow{i}', 100) for i in range(1, 7)],                                    # Lay on Hands
    }),
  'rolfing': dict(
    rows=[('idle', 4), ('walk', 7), ('slam', 6), ('jab', 6), ('spin', 6), ('jump', 2), ('hurt', 2), ('death', 6), ('vines', 6)],
    stand_h=58, light=(190, 255, 150), glow=['slam5', 'slam6', 'spin', 'vines'], lying=['death3', 'death4', 'death5', 'death6'], lying_off=55, trapped_checker=True,
    tags={
      'idle':    [(f'idle{i}', 250) for i in range(1, 5)],
      'walk':    [(f'walk{i}', 110) for i in range(1, 8)],
      'attack1': list(zip([f'jab{i}' for i in range(1, 7)], [70, 70, 90, 70, 70, 80])),      # staff jab
      'attack2': [(f'spin{i}', 80) for i in range(1, 7)],                                     # spinning sweep
      'attack3': list(zip([f'slam{i}' for i in range(1, 7)], [40, 40, 40, 40, 150, 130])),   # ground slam finisher
      'jump':    [('jump1', 120), ('jump2', 400)],
      'hurt':    [('hurt1', 100), ('hurt2', 120)],
      'death':   list(zip([f'death{i}' for i in range(1, 7)], [90, 90, 90, 100, 120, 600])),
      'cast':    [(f'vines{i}', 100) for i in range(1, 7)],                                   # Entangle
      'heal':    [('vines1', 120), ('vines2', 300)],                                          # Goodberry: staff glows
    }),
}

FW, FH, FX, FY = 160, 128, 80, 116   # cell size and where the feet go (matches src/data/sprites.js)
WHITE = 248.0

def build(hero):
    cfg = HEROES[hero]
    im = np.array(Image.open(os.path.join(ROOT, 'art-source', f'{hero}-sheet.png')).convert('RGB')).astype(float)
    br = im.mean(-1); sat = im.max(-1) - im.min(-1)
    # 1. background = light grey checker pixels connected to the image border (so shiny bits inside a figure stay)
    bgl = (br > 205) & (sat < 22)
    lab, _ = ndimage.label(bgl)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    # checker trapped inside a figure (between staff and body, inside a swirl) has both tones of the
    # checkerboard; shine on armour or a light ray is almost all pure white
    # (off by default: blade shine looks the same, so only turn it on for heroes without blades)
    sizes0 = ndimage.sum(bgl, lab, range(1, lab.max() + 1))
    for i in range(1, lab.max() + 1 if cfg.get('trapped_checker') else 1):
        if i in border or sizes0[i - 1] < 30: continue
        v = br[lab == i]
        if (v > 247).mean() >= 0.15 and ((v > 226) & (v < 244)).mean() >= 0.2: border.add(i)
    bg = np.isin(lab, list(border)); fg = ~bg
    # 2. figures = big blobs, read row by row (by bottom edge), left to right
    flab, fn = ndimage.label(fg, structure=np.ones((3, 3)))
    objs = ndimage.find_objects(flab); sizes = ndimage.sum(fg, flab, range(1, fn + 1))
    big = sorted([i + 1 for i in range(fn) if sizes[i] > 2000], key=lambda i: objs[i - 1][0].stop)
    frames, k = {}, 0
    for name, cnt in cfg['rows']:
        row = sorted(big[k:k + cnt], key=lambda i: objs[i - 1][1].start); k += cnt
        for j, i in enumerate(row): frames[f'{name}{j + 1}'] = [i]
    assert k == len(big), f'found {len(big)} figures but rows add up to {k}'
    # small bits (sparkles, staff tips) join the nearest figure if close enough
    def gap(o, y, x): return max(0, o[1].start - x, x - o[1].stop) + max(0, o[0].start - y, y - o[0].stop)
    for i in range(1, fn + 1):
        if i in big or sizes[i - 1] < 4: continue
        sl = objs[i - 1]; y, x = (sl[0].start + sl[0].stop) / 2, (sl[1].start + sl[1].stop) / 2
        best = min(frames, key=lambda f: gap(objs[frames[f][0] - 1], y, x))
        if gap(objs[frames[best][0] - 1], y, x) < 40: frames[best].append(i)

    edge = fg & ndimage.binary_dilation(bg, iterations=2)
    is_glow = lambda n: any(n == g or n.rstrip('0123456789') == g for g in cfg['glow'])
    def cut(name):
        ids = frames[name]
        y0 = min(objs[i - 1][0].start for i in ids) - 2; y1 = max(objs[i - 1][0].stop for i in ids) + 2
        x0 = min(objs[i - 1][1].start for i in ids) - 2; x1 = max(objs[i - 1][1].stop for i in ids) + 2
        c = im[y0:y1, x0:x1]; mine = np.isin(flab[y0:y1, x0:x1], ids)
        a = mine.astype(float)
        # soft edges were painted over white: pull the white back out ("colour to alpha")
        ca = np.clip(((WHITE - c) / WHITE).max(-1), 0, 1)
        soft = mine & edge[y0:y1, x0:x1]
        a = np.where(soft & (ca < 0.75), ca, a)
        col = np.where((a < 1)[..., None], WHITE + (c - WHITE) / np.maximum(a, 1e-3)[..., None], c)
        if is_glow(name):
            # glow painted white-on-white: keep the hero solid, turn the bright aura into see-through coloured light
            b = br[y0:y1, x0:x1]
            body = ndimage.binary_fill_holes(ndimage.binary_closing(mine & (b < 175), iterations=3))
            light = mine & (b >= 175) & ~body
            a = np.where(light, np.clip(0.35 + ca * 1.4, 0.35, 0.8), np.where(mine, np.maximum(a, body * 1.0), 0))
            tint = np.clip(np.array(cfg['light']) * 0.7 + c * 0.3, 0, 255)
            col = np.where(light[..., None], tint, np.where(body[..., None], c, col))
        return np.dstack([np.clip(col, 0, 255), a * 255]).astype(np.uint8)
    CUT = {f: cut(f) for f in frames}
    scale = cfg['stand_h'] / CUT['idle1'].shape[0]

    def feet(name, a):
        al = a[..., 3] > 128; bot = np.where(al.any(1))[0].max()
        if name in cfg['lying']:
            return np.where(al.any(0))[0].max() - cfg.get('lying_off', 22), bot
        xs = np.where(al[bot - 8: bot + 1].any(0))[0]
        return (xs.min() + xs.max()) / 2, bot

    def cell(name):
        a = CUT[name]; fx, fy = feet(name, a)
        h, w = a.shape[:2]; nw, nh = max(1, round(w * scale)), max(1, round(h * scale))
        al = a[..., 3:] / 255.0   # shrink with premultiplied alpha so edges don't go dark or white
        p = np.array(Image.fromarray(np.dstack([a[..., :3] * al, al * 255]).astype(np.uint8)).resize((nw, nh), Image.BOX)).astype(float)
        al2 = p[..., 3:] / 255; col = np.where(al2 > 0, p[..., :3] / np.maximum(al2, 1e-3), 0)
        lo, hi = (0.12, 0.85) if is_glow(name) else (0.5, 0.5)   # crisp edges, soft glow
        al2 = np.where(al2 > hi, 1, np.where(al2 < lo, 0, al2))
        img = Image.fromarray(np.dstack([np.clip(col, 0, 255), al2 * 255]).astype(np.uint8))
        out = Image.new('RGBA', (FW, FH))
        out.paste(img, (FX - round((fx + 0.5) * scale), FY + 1 - round((fy + 1) * scale)), img)
        return out

    cells = {f: cell(f) for f in frames}
    seq = [(tag, f, ms) for tag, fs in cfg['tags'].items() for f, ms in fs]
    COLS = 8; rows = (len(seq) + COLS - 1) // COLS
    sheet = Image.new('RGBA', (FW * COLS, FH * rows)); meta, tags = [], []
    for i, (tag, f, ms) in enumerate(seq):
        if not tags or tags[-1]['name'] != tag: tags.append({'name': tag, 'from': i, 'to': i, 'direction': 'forward'})
        tags[-1]['to'] = i
        x, y = (i % COLS) * FW, (i // COLS) * FH; sheet.paste(cells[f], (x, y))
        meta.append({'filename': f'{hero} {i}', 'frame': {'x': x, 'y': y, 'w': FW, 'h': FH}, 'rotated': False, 'trimmed': False,
                     'spriteSourceSize': {'x': 0, 'y': 0, 'w': FW, 'h': FH}, 'sourceSize': {'w': FW, 'h': FH}, 'duration': ms})
    out = os.path.join(ROOT, 'assets', 'sprites', hero)
    sheet.save(out + '.png', optimize=True)
    json.dump({'frames': meta, 'meta': {'app': 'ravenmoor tools/sprite-from-concept/make_sheet.py', 'image': f'{hero}.png', 'format': 'RGBA8888',
              'size': {'w': sheet.width, 'h': sheet.height}, 'scale': '1', 'frameTags': tags}}, open(out + '.json', 'w'), indent=1)
    # preview: frames on a dark background, red tick = where the feet should be
    prev = Image.new('RGBA', sheet.size, (58, 52, 66, 255)); prev.paste(sheet, (0, 0), sheet)
    pv = np.array(prev)
    for j in range(len(seq)): pv[(j // COLS) * FH + FY + 1, (j % COLS) * FW + FX - 3:(j % COLS) * FW + FX + 4] = [255, 0, 0, 255]
    Image.fromarray(pv).resize((sheet.width * 2, sheet.height * 2), Image.NEAREST).save(os.path.join(os.path.dirname(__file__), f'{hero}-preview.png'))
    print(f'{hero}: {len(seq)} frames, sheet {sheet.size}, scale {scale:.3f}')

if __name__ == '__main__':
    build(sys.argv[1])
