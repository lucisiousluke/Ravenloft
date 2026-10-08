# Shrinks the cut frames to game size and lays them out on 160x128 cells with the feet at (80, 116).
import numpy as np, json, sys
from PIL import Image
F = dict(np.load('frames_full.npz'))
K = 3            # shrink factor (source art is ~3x game size)
FW, FH, FX, FY = 160, 128, 80, 116
OVERRIDE_X = {}  # name -> feet x in source pixels, if the automatic guess is off

def feet(a, name):
    al = a[..., 3] > 128
    rows = np.where(al.any(1))[0]; bot = rows.max()
    if name in OVERRIDE_X: return OVERRIDE_X[name], bot
    xs = np.where(al[bot - 10: bot + 1].any(0))[0]
    return (xs.min() + xs.max()) / 2, bot

def shrink(a):
    h, w = a.shape[:2]; h2, w2 = h // K * K, w // K * K
    a = a[:h2, :w2].astype(float); al = a[..., 3:] / 255
    pre = a[..., :3] * al
    pre = pre.reshape(h2 // K, K, w2 // K, K, 3).mean((1, 3)); al = al.reshape(h2 // K, K, w2 // K, K, 1).mean((1, 3))
    col = np.where(al > 0, pre / np.maximum(al, 1e-6), 0)
    al = np.where(al > 0.8, 1, np.where(al < 0.2, 0, al))  # keep edges crisp, glow soft
    return np.dstack([col, al * 255]).clip(0, 255).astype(np.uint8)

def cell(name, rot=0):
    a = F[name]; fx, fy = feet(a, name)
    # pad so the feet sit at a multiple of K, then shrink
    ox = int(round(fx)) % K; oy = (int(fy) + 1) % K
    a = np.pad(a, ((K - oy if oy else 0, 0), (K - ox if ox else 0, 0), (0, 0)))
    fx += (K - ox if ox else 0); fy += (K - oy if oy else 0)
    s = shrink(a); sfx, sfy = int(round(fx / K)), int((fy + 1) / K)
    img = Image.fromarray(s, 'RGBA')
    if rot:  # rotate around the feet (used to fake hurt/death poses)
        big = Image.new('RGBA', (FW * 2, FH * 2)); big.paste(img, (FW - sfx, FH - sfy))
        big = big.rotate(rot, resample=Image.NEAREST, center=(FW, FH))
        out = Image.new('RGBA', (FW, FH)); out.paste(big.crop((FW - FX, FH - FY, FW - FX + FW, FH - FY + FH)), (0, 0))
        return out
    out = Image.new('RGBA', (FW, FH)); out.paste(img, (FX - sfx, FY - sfy), img)
    return out

if __name__ == '__main__':
    names = list(F)
    cells = [cell(n) for n in names]
    sheet = Image.new('RGBA', (FW * 6, FH * 3), (60, 60, 70, 255))
    for i, c in enumerate(cells):
        x, y = (i % 6) * FW, (i // 6) * FH
        sheet.paste(c, (x, y), c)
        for dx in range(-3, 4): sheet.putpixel((x + FX + dx, y + FY + 1), (255, 0, 0, 255))
    sheet.resize((sheet.width * 2, sheet.height * 2), Image.NEAREST).save('preview.png')
    for n in names: print(n, feet(F[n], n))
