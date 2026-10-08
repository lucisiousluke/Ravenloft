# Builds assets/sprites/ulrick.png + ulrick.json (Aseprite "Array" format with tags) from the cut frames.
import json, sys, numpy as np
from PIL import Image
sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__))); import build
build.OVERRIDE_X.update({'smite2': 62, 'smite3': 60})
FW, FH, FX, FY = build.FW, build.FH, build.FX, build.FY

def rotated(name, deg):
    c = build.cell(name, rot=deg)
    a = np.array(c); rows = np.where(a[..., 3].any(1))[0]
    dy = FY + 1 - (rows.max() + 1)          # sit the lowest pixel back on the ground
    out = Image.new('RGBA', (FW, FH)); out.paste(c, (0, dy), c); return out

def breathe(name):
    c = np.array(build.cell(name)); top = FY - 34   # shift chest and head down 1px
    c2 = c.copy(); c2[1:top + 1] = c[0:top]; c2[0] = 0
    return Image.fromarray(c2)

C = build.cell
TAGS = [  # (tag, [(image, ms), ...])
  ('idle',    [(C('stand'), 600), (breathe('stand'), 600)]),
  ('walk',    [(C(n), 110) for n in ['walk1', 'walk2', 'walk3', 'walk4', 'walk5']]),
  ('attack1', [(C('atk1'), 100), (C('atk2'), 160), (C('atk4'), 120)]),
  ('attack2', [(C('atk1'), 80), (C('atk3'), 170), (C('atk4'), 120)]),
  ('attack3', [(C('atk1'), 110), (C('atk2'), 90), (C('atk3'), 150), (C('atk4'), 120)]),
  ('jump',    [(C('atk1'), 80), (C('smite1'), 400)]),
  ('hurt',    [(rotated('stand', 9), 90), (rotated('stand', 5), 110)]),
  ('death',   [(rotated('stand', a), ms) for a, ms in [(8, 90), (25, 80), (50, 80), (75, 80), (90, 120), (90, 600)]]),
  ('cast',    [(C('smite1'), 140), (C('smite2'), 180), (C('smite3'), 140), (C('smite4'), 120)]),
  ('heal',    [(C('heal1'), 100), (C('heal2'), 120), (C('heal3'), 220), (C('heal4'), 120)]),
]
frames = [f for _, fs in TAGS for f in fs]
COLS = 8; rows = (len(frames) + COLS - 1) // COLS
sheet = Image.new('RGBA', (FW * COLS, FH * rows))
meta_frames, tags, i = [], [], 0
for tag, fs in TAGS:
    tags.append({'name': tag, 'from': i, 'to': i + len(fs) - 1, 'direction': 'forward'})
    for img, ms in fs:
        x, y = (i % COLS) * FW, (i // COLS) * FH
        sheet.paste(img, (x, y))
        meta_frames.append({'filename': f'ulrick {i}', 'frame': {'x': x, 'y': y, 'w': FW, 'h': FH}, 'rotated': False, 'trimmed': False,
                            'spriteSourceSize': {'x': 0, 'y': 0, 'w': FW, 'h': FH}, 'sourceSize': {'w': FW, 'h': FH}, 'duration': ms})
        i += 1
out = sys.argv[1]
sheet.save(out + '.png', optimize=True)
json.dump({'frames': meta_frames, 'meta': {'app': 'ravenmoor tools/ulrick_sheet', 'image': 'ulrick.png', 'format': 'RGBA8888',
          'size': {'w': sheet.width, 'h': sheet.height}, 'scale': '1', 'frameTags': tags}}, open(out + '.json', 'w'), indent=1)
prev = Image.new('RGBA', sheet.size, (60, 60, 70, 255)); prev.paste(sheet, (0, 0), sheet)
prev.resize((sheet.width * 2, sheet.height * 2), Image.NEAREST).save('sheet_preview.png')
print(len(frames), 'frames', sheet.size)
