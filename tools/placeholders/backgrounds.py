# Placeholder background layers for the new locations, in the same flat-silhouette style as the originals.
# Not part of the game. Needs Python with Pillow (see tools/sprite-from-concept/README.md for setup).
#   python tools/placeholders/backgrounds.py
# Writes assets/backgrounds/<theme>/<layer>.png. Replace any file with real art of the same size and name.
import math, os, random
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
W, H, FT = 1920, 540, 345          # layer size; the walkable floor starts at y 345

def layer(w=W): return Image.new('RGBA', (w, H), (0, 0, 0, 0))
def save(img, theme, name):
    d = os.path.join(ROOT, 'assets', 'backgrounds', theme); os.makedirs(d, exist_ok=True)
    img.save(os.path.join(d, name + '.png'), optimize=True)

def gradient(w, top, bottom, y0=0, y1=H):
    img = layer(w); d = ImageDraw.Draw(img)
    for y in range(y0, y1):
        k = (y - y0) / max(1, y1 - y0 - 1)
        d.line((0, y, w, y), fill=tuple(int(a + (b - a) * k) for a, b in zip(top, bottom)) + (255,))
    return img

def wrap(fn, x, *a):            # draw a shape so it tiles left-to-right seamlessly
    for dx in (-W, 0, W): fn(x + dx, *a)

def ridge(img, base, amp, col, seed, freq=(2, 3, 5, 9)):
    d = ImageDraw.Draw(img); rnd = random.Random(seed); ph = [rnd.random() * 6.28 for _ in freq]
    pts = [(x, base - sum(amp / (i + 1) * math.sin(2 * math.pi * f * x / W + ph[i]) for i, f in enumerate(freq)) - amp * 0.2) for x in range(0, W + 1, 8)]
    d.polygon(pts + [(W, H), (0, H)], fill=col)

def moon(img, x, y, r, col=(232, 226, 205, 255)):
    d = ImageDraw.Draw(img); d.ellipse((x - r, y - r, x + r, y + r), fill=col)

def stars(img, n, seed, ymax=300):
    d = ImageDraw.Draw(img); rnd = random.Random(seed)
    for _ in range(n): x, y = rnd.randrange(img.width), rnd.randrange(ymax); d.point((x, y), fill=(230, 230, 255, rnd.randrange(90, 200)))

def house(d, x, base, w, h, wall, roof, lit=(255, 196, 110, 255), seed=0):
    rnd = random.Random(seed)
    d.rectangle((x, base - h, x + w, base), fill=wall)
    d.polygon([(x - 8, base - h), (x + w / 2, base - h - w * 0.55), (x + w + 8, base - h)], fill=roof)
    for wx in range(int(x + 10), int(x + w - 14), 22):
        for wy in range(int(base - h + 12), int(base - 18), 28):
            if rnd.random() < 0.55: d.rectangle((wx, wy, wx + 9, wy + 12), fill=lit)

def ground(theme, top, bottom, line, detail):
    img = layer(); d = ImageDraw.Draw(img)
    g = gradient(W, top, bottom, FT - 6, H); img.alpha_composite(g)
    d.rectangle((0, FT - 6, W, FT - 2), fill=line)
    detail(d, random.Random(theme))
    save(img, theme, 'ground')

# ---------------- Vallaki: a walled town at dusk ----------------
def town():
    sky = gradient(960, (34, 38, 66), (120, 86, 92)); stars(sky, 60, 1, 200); moon(sky, 720, 110, 34); save(sky, 'town', 'sky')
    m = layer(); ridge(m, 250, 40, (58, 56, 82, 255), 2); save(m, 'town', 'mountains')
    far = layer(); d = ImageDraw.Draw(far); rnd = random.Random(3)
    x = 0
    while x < W:
        w = rnd.randrange(60, 110); h = rnd.randrange(50, 90)
        wrap(lambda xx: house(d, xx, 330, w, h, (52, 44, 60, 255), (40, 32, 48, 255), (230, 170, 100, 255), x), x); x += w + rnd.randrange(10, 40)
    for sx in (420, 1380):   # church steeples
        wrap(lambda xx: (d.rectangle((xx, 170, xx + 40, 330), fill=(46, 38, 54, 255)), d.polygon([(xx - 6, 170), (xx + 20, 100), (xx + 46, 170)], fill=(36, 30, 46, 255)), d.rectangle((xx + 18, 82, xx + 22, 104), fill=(36, 30, 46, 255)), d.rectangle((xx + 12, 88, xx + 28, 92), fill=(36, 30, 46, 255))), sx)
    save(far, 'town', 'roofs')
    near = layer(); d = ImageDraw.Draw(near); rnd = random.Random(4); x = 0
    while x < W:
        w = rnd.randrange(130, 190); h = rnd.randrange(110, 150)
        wrap(lambda xx: house(d, xx, 352, w, h, (88, 66, 58, 255), (62, 40, 40, 255), (255, 200, 120, 255), x + 7), x)
        # timber frame
        wrap(lambda xx: [d.line((xx + i, 352 - h, xx + i, 352), fill=(54, 38, 34, 255), width=4) for i in range(0, w + 1, w // 3)], x)
        x += w + rnd.randrange(60, 140)
    save(near, 'town', 'houses')
    def cobbles(d, rnd):
        for y in range(FT + 4, H, 14):
            off = (y // 14 % 2) * 18
            for x in range(-36 + off, W, 36):
                c = 92 + rnd.randrange(-10, 10); d.rounded_rectangle((x + 2, y, x + 32, y + 10), 4, fill=(c, c - 8, c - 14, 255))
    ground('town', (96, 86, 80), (64, 56, 54), (54, 46, 44, 255), cobbles)
    fog = layer(); d = ImageDraw.Draw(fog); rnd = random.Random(5)
    for _ in range(18): x, y = rnd.randrange(W), rnd.randrange(300, 360); wrap(lambda xx: d.ellipse((xx, y, xx + 260, y + 40), fill=(200, 196, 210, 36)), x)
    save(fog, 'town', 'fog')
    fg = layer(); d = ImageDraw.Draw(fg)
    for x in (300, 1240):   # lamp posts
        wrap(lambda xx: (d.rectangle((xx, 300, xx + 8, 540), fill=(24, 20, 26, 255)), d.rectangle((xx - 10, 284, xx + 18, 304), fill=(24, 20, 26, 255)), d.rectangle((xx - 6, 288, xx + 14, 300), fill=(255, 200, 110, 255))), x)
    for x in (820, 1700):   # barrels
        wrap(lambda xx: d.rounded_rectangle((xx, 470, xx + 46, 540), 8, fill=(40, 28, 24, 255)), x)
    save(fg, 'town', 'foreground')

# ---------------- St. Andral's Church (interior, Vallaki boss) ----------------
def church():
    wall = layer(); d = ImageDraw.Draw(wall)
    d.rectangle((0, 0, W, H), fill=(46, 40, 50, 255))
    for y in range(0, 360, 30):
        off = (y // 30 % 2) * 40
        for x in range(-80 + off, W, 80): d.rectangle((x + 1, y + 1, x + 78, y + 28), outline=(38, 32, 42, 255))
    for x in range(120, W, 480):   # stained glass windows with candles
        d.rounded_rectangle((x, 60, x + 90, 250), 44, fill=(30, 24, 36, 255))
        for i, col in enumerate([(160, 40, 50), (60, 90, 170), (200, 160, 60), (70, 140, 90)]):
            d.rectangle((x + 10 + i * 18, 80, x + 26 + i * 18, 240), fill=col + (255,))
        d.ellipse((x + 15, 70, x + 75, 120), fill=(200, 160, 60, 255)); d.line((x + 45, 70, x + 45, 240), fill=(30, 24, 36, 255), width=3)
        for c in range(3): d.rectangle((x + 20 + c * 22, 300, x + 26 + c * 22, 330), fill=(230, 220, 190, 255)); d.ellipse((x + 19 + c * 22, 290, x + 27 + c * 22, 300), fill=(255, 200, 90, 255))
    d.rectangle((0, 330, W, 345), fill=(36, 30, 40, 255))
    for x in range(0, W, 60): d.rectangle((x + 4, 318, x + 52, 345), fill=(70, 46, 36, 255))   # pew backs
    save(wall, 'church', 'wall')
    floor = layer(); d = ImageDraw.Draw(floor); d.rectangle((0, FT - 4, W, H), fill=(78, 58, 46, 255))
    for y in range(FT, H, 18): d.line((0, y, W, y), fill=(62, 46, 38, 255), width=2)
    rnd = random.Random(8)
    for y in range(FT, H, 18):
        for x in range(rnd.randrange(0, 120), W, 160): d.line((x, y, x, y + 18), fill=(62, 46, 38, 255), width=2)
    d.rectangle((0, 405, W, 455), fill=(110, 30, 36, 255)); d.line((0, 405, W, 405), fill=(200, 160, 60, 255), width=2); d.line((0, 455, W, 455), fill=(200, 160, 60, 255), width=2)
    save(floor, 'church', 'floor')
    fg = layer(); d = ImageDraw.Draw(fg)
    for x in (200, 1160): d.rectangle((x, 0, x + 70, 540), fill=(26, 22, 30, 255)); d.rectangle((x - 8, 500, x + 78, 540), fill=(22, 18, 26, 255))
    save(fg, 'church', 'foreground')

# ---------------- Krezk: mountain village below the abbey ----------------
def abbey():
    sky = gradient(960, (40, 52, 80), (150, 160, 180)); stars(sky, 30, 9, 140); save(sky, 'abbey', 'sky')
    m = layer(); ridge(m, 210, 70, (92, 100, 124, 255), 10, (2, 3, 7))
    snow = layer(); ridge(snow, 210, 70, (226, 232, 244, 255), 10, (2, 3, 7))   # snow caps: the same ridge, cut off lower down
    ImageDraw.Draw(snow).rectangle((0, 190, W, H), fill=(0, 0, 0, 0)); m.alpha_composite(snow)
    save(m, 'abbey', 'mountains')
    ab = layer(); d = ImageDraw.Draw(ab)
    ridge(ab, 300, 30, (62, 66, 86, 255), 11, (1, 2))
    for x in (500, 1460):    # the abbey on its cliff
        wrap(lambda xx: (d.polygon([(xx - 60, 330), (xx - 30, 210), (xx + 170, 210), (xx + 200, 330)], fill=(58, 60, 78, 255)),
                         d.rectangle((xx, 120, xx + 140, 210), fill=(70, 70, 90, 255)), d.polygon([(xx - 8, 120), (xx + 70, 70), (xx + 148, 120)], fill=(52, 52, 70, 255)),
                         d.rectangle((xx + 100, 60, xx + 130, 120), fill=(70, 70, 90, 255)), d.polygon([(xx + 96, 60), (xx + 115, 24), (xx + 134, 60)], fill=(52, 52, 70, 255)),
                         [d.rectangle((xx + 16 + i * 30, 150, xx + 26 + i * 30, 168), fill=(255, 210, 130, 255)) for i in range(4)]), x)
    save(ab, 'abbey', 'abbey')
    wall = layer(); d = ImageDraw.Draw(wall)
    d.rectangle((0, 250, W, 352), fill=(84, 84, 96, 255))
    for y in range(250, 352, 20):
        off = (y // 20 % 2) * 30
        for x in range(-60 + off, W, 60): d.rectangle((x + 1, y + 1, x + 58, y + 18), outline=(66, 66, 78, 255))
    d.rectangle((0, 244, W, 252), fill=(220, 226, 240, 255))   # snow on top
    for x in (700, 1660): wrap(lambda xx: (d.rectangle((xx, 220, xx + 120, 352), fill=(70, 70, 82, 255)), d.rounded_rectangle((xx + 24, 260, xx + 96, 352), 34, fill=(40, 30, 28, 255)), d.rectangle((xx, 214, xx + 120, 222), fill=(220, 226, 240, 255))), x)
    save(wall, 'abbey', 'walls')
    def snowpath(d, rnd):
        for _ in range(260): x, y = rnd.randrange(W), rnd.randrange(FT + 4, H); d.ellipse((x, y, x + rnd.randrange(8, 30), y + 4), fill=(255, 255, 255, 60))
    ground('abbey', (190, 196, 212), (140, 146, 166), (120, 126, 146, 255), snowpath)
    fg = layer(); d = ImageDraw.Draw(fg)
    for x in (260, 1300): wrap(lambda xx: (d.rectangle((xx, 0, xx + 26, 540), fill=(30, 34, 40, 255)), d.ellipse((xx - 40, 500, xx + 70, 560), fill=(230, 234, 246, 255))), x)
    save(fg, 'abbey', 'foreground')

# ---------------- Argynvostholt: the dragon's ruined manor ----------------
def manor():
    sky = gradient(960, (22, 40, 48), (70, 92, 96)); stars(sky, 40, 12, 160); moon(sky, 220, 90, 26, (210, 220, 220, 255)); save(sky, 'manor', 'sky')
    mn = layer(); d = ImageDraw.Draw(mn)
    ridge(mn, 300, 24, (34, 50, 56, 255), 13, (1, 3))
    for x in (300, 1260):
        wrap(lambda xx: (d.rectangle((xx, 160, xx + 360, 310), fill=(40, 56, 62, 255)),
                         d.polygon([(xx - 10, 160), (xx + 80, 110), (xx + 140, 150), (xx + 200, 104), (xx + 260, 150), (xx + 370, 160)], fill=(32, 46, 52, 255)),
                         d.rectangle((xx + 290, 50, xx + 340, 160), fill=(40, 56, 62, 255)), d.ellipse((xx + 300, 26, xx + 330, 56), fill=(200, 230, 255, 200)),   # the beacon tower
                         [d.rectangle((xx + 20 + i * 40, 200, xx + 34 + i * 40, 230), fill=(20, 30, 34, 255)) for i in range(8)]), x)
    save(mn, 'manor', 'manor')
    tr = layer(); d = ImageDraw.Draw(tr); rnd = random.Random(14)
    for x in range(60, W, 230):
        def tree(xx, s=rnd.randrange(0, 999)):
            r = random.Random(s); d.rectangle((xx, 200, xx + 12, 350), fill=(24, 34, 36, 255))
            for _ in range(5):
                y = r.randrange(200, 290); L = r.randrange(30, 70); dirn = r.choice((-1, 1))
                d.line((xx + 6, y, xx + 6 + dirn * L, y - L * 0.6), fill=(24, 34, 36, 255), width=4)
        wrap(tree, x)
    save(tr, 'manor', 'trees')
    wl = layer(); d = ImageDraw.Draw(wl); rnd = random.Random(15); x = 0
    while x < W:
        w = rnd.randrange(80, 200); h = rnd.randrange(30, 80)
        wrap(lambda xx: d.polygon([(xx, 352), (xx, 352 - h), (xx + w * 0.4, 352 - h - 14), (xx + w * 0.7, 352 - h + 10), (xx + w, 352 - h), (xx + w, 352)], fill=(52, 64, 66, 255)), x)
        x += w + rnd.randrange(80, 200)
    save(wl, 'manor', 'wall')
    def path(d, rnd):
        for _ in range(180): x, y = rnd.randrange(W), rnd.randrange(FT + 4, H); d.rectangle((x, y, x + rnd.randrange(10, 40), y + 3), fill=(80, 96, 70, 120))
    ground('manor', (70, 82, 70), (40, 48, 44), (40, 50, 44, 255), path)
    fog = layer(); d = ImageDraw.Draw(fog); rnd = random.Random(16)
    for _ in range(22): x, y = rnd.randrange(W), rnd.randrange(290, 370); wrap(lambda xx: d.ellipse((xx, y, xx + 300, y + 46), fill=(190, 220, 220, 34)), x)
    save(fog, 'manor', 'fog')
    fg = layer(); d = ImageDraw.Draw(fg)
    for x in (500, 1500): wrap(lambda xx: (d.rectangle((xx, 380, xx + 60, 540), fill=(28, 36, 38, 255)), d.polygon([(xx - 10, 380), (xx + 30, 350), (xx + 70, 380)], fill=(28, 36, 38, 255))), x)  # broken dragon statue base
    save(fg, 'manor', 'foreground')

# ---------------- The Amber Temple: frozen halls ----------------
def temple():
    wall = layer(); d = ImageDraw.Draw(wall)
    d.rectangle((0, 0, W, H), fill=(54, 66, 84, 255))
    for y in range(0, 345, 46):
        off = (y // 46 % 2) * 60
        for x in range(-120 + off, W, 120): d.rectangle((x + 2, y + 2, x + 118, y + 44), outline=(44, 54, 70, 255), width=2)
    for x in range(140, W, 360):   # amber slabs with dark shapes sleeping inside
        d.rectangle((x - 6, 70, x + 106, 300), fill=(40, 44, 56, 255))
        d.rectangle((x, 76, x + 100, 294), fill=(214, 140, 40, 255)); d.rectangle((x + 8, 84, x + 92, 286), fill=(240, 170, 60, 255))
        d.ellipse((x + 30, 120, x + 70, 160), fill=(150, 80, 20, 255)); d.rectangle((x + 34, 156, x + 66, 250), fill=(150, 80, 20, 255))
    d.rectangle((0, 300, W, 345), fill=(70, 84, 104, 255))
    for x in range(0, W, 40): d.polygon([(x, 0), (x + 12, 0), (x + 6, 28 + (x * 7) % 30)], fill=(200, 226, 240, 255))   # icicles
    save(wall, 'temple', 'wall')
    floor = layer(); d = ImageDraw.Draw(floor); d.rectangle((0, FT - 4, W, H), fill=(120, 140, 160, 255))
    for y in range(FT, H, 34):
        off = (y // 34 % 2) * 60
        for x in range(-120 + off, W, 120): d.rectangle((x + 1, y + 1, x + 119, y + 33), outline=(98, 116, 136, 255), width=2)
    rnd = random.Random(17)
    for _ in range(120): x, y = rnd.randrange(W), rnd.randrange(FT, H); d.line((x, y, x + rnd.randrange(10, 30), y), fill=(220, 236, 248, 160))
    save(floor, 'temple', 'floor')
    fg = layer(); d = ImageDraw.Draw(fg)
    for x in (380, 1340): d.rectangle((x, 0, x + 60, 540), fill=(150, 190, 214, 210)); d.rectangle((x + 10, 0, x + 22, 540), fill=(220, 240, 250, 210))
    save(fg, 'temple', 'foreground')

# ---------------- Act I's windmill (Old Bonegrinder), seen at the end of the forest path ----------------
# A single image (a `once` layer in backgrounds.js), drawn large then shrunk by WM_SCALE so the whole mill fits
# above the path. Saved size 224x329; the door's bottom-centre is at (112, 328): levels.js places the entrance
# there (door 24x34), so keep them in sync if you redraw it.
WM_W, WM_H, WM_DOOR_X, WM_SCALE = 320, 470, 160, 0.7
def windmill():
    img = Image.new('RGBA', (WM_W, WM_H), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    stone, edge, dark, roof = (18, 42, 56, 255), (34, 74, 88, 255), (8, 16, 24, 255), (12, 30, 42, 255)
    base_y, top_y = WM_H - 2, 150
    d.polygon([(70, base_y), (250, base_y), (215, top_y), (105, top_y)], fill=stone)                      # tapered tower
    d.line([(70, base_y), (105, top_y)], fill=edge, width=3)
    for y in range(top_y + 30, base_y, 34): d.line([(80 + (base_y - y) * 0.0, y), (240, y)], fill=(14, 34, 46, 255), width=1)  # stone courses
    d.polygon([(92, top_y + 4), (160, 70), (228, top_y + 4)], fill=roof)                                   # cap
    hub = (160, 130)
    for ang, length in ((-55, 150), (35, 140), (125, 95), (215, 150)):                                     # sails, one broken short
        a = math.radians(ang); tip = (hub[0] + math.cos(a) * length, hub[1] + math.sin(a) * length)
        d.line([hub, tip], fill=(28, 56, 66, 255), width=5)
        n = (-math.sin(a), math.cos(a))
        for k in range(30, int(length), 14):                                                              # lattice
            px, py = hub[0] + math.cos(a) * k, hub[1] + math.sin(a) * k
            d.line([(px, py), (px + n[0] * 22, py + n[1] * 22)], fill=(24, 50, 60, 255), width=2)
    d.ellipse((150, 120, 170, 140), fill=dark)
    d.ellipse((140, 230, 182, 272), fill=(255, 160, 70, 60)); d.rounded_rectangle((151, 238, 171, 266), 8, fill=(240, 150, 70, 255))   # lit window
    d.line([(161, 238), (161, 266)], fill=dark, width=2)
    dx = WM_DOOR_X                                                                                         # arched door at the base
    d.rounded_rectangle((dx - 17, base_y - 50, dx + 17, base_y), 14, fill=dark)
    for x in range(dx - 11, dx + 12, 7): d.line([(x, base_y - 44), (x, base_y)], fill=(22, 30, 36, 255), width=1)
    d.rectangle((dx - 22, base_y - 2, dx + 22, base_y), fill=edge)                                        # step
    img = img.resize((round(WM_W * WM_SCALE), round(WM_H * WM_SCALE)), Image.BOX)
    os.makedirs(os.path.join(ROOT, 'assets', 'backgrounds', 'forest'), exist_ok=True)
    img.save(os.path.join(ROOT, 'assets', 'backgrounds', 'forest', 'windmill.png'), optimize=True)

# ---------------- Inside Old Bonegrinder: the hags' mill and bakery ----------------
def mill():
    wall = layer(); d = ImageDraw.Draw(wall)
    d.rectangle((0, 0, W, H), fill=(36, 24, 18, 255))
    for x in range(0, W, 26): d.line([(x, 0), (x, 345)], fill=(28, 18, 14, 255), width=2)                 # planks
    for y in (60, 200): d.rectangle((0, y, W, y + 14), fill=(52, 34, 24, 255))                             # cross beams
    rnd = random.Random(21)
    for x in range(160, W, 640):                                                                           # big wooden gear
        cx, cy, r = x, 120, 70
        for t in range(16):
            a = t / 16 * 2 * math.pi; d.rectangle((cx + math.cos(a) * r - 7, cy + math.sin(a) * r - 7, cx + math.cos(a) * r + 7, cy + math.sin(a) * r + 7), fill=(66, 44, 28, 255))
        d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(66, 44, 28, 255), width=12)
        for t in range(4): a = t * math.pi / 4; d.line([(cx - math.cos(a) * r, cy - math.sin(a) * r), (cx + math.cos(a) * r, cy + math.sin(a) * r)], fill=(60, 40, 26, 255), width=8)
    for x in range(420, W, 640):                                                                           # bread ovens, fire inside
        d.rectangle((x, 220, x + 150, 345), fill=(74, 40, 30, 255))
        for y in range(226, 345, 12):
            for bx in range(x + ((y // 12) % 2) * 12, x + 150, 24): d.rectangle((bx + 1, y + 1, bx + 22, y + 10), outline=(58, 30, 22, 255))
        d.rounded_rectangle((x + 40, 270, x + 110, 335), 30, fill=(20, 8, 6, 255))
        d.rounded_rectangle((x + 48, 290, x + 102, 335), 24, fill=(230, 110, 40, 255)); d.rounded_rectangle((x + 60, 305, x + 90, 335), 14, fill=(255, 200, 90, 255))
    for x in range(40, W, 320):                                                                            # shelves of jars and pastries
        d.rectangle((x, 150, x + 110, 156), fill=(70, 46, 30, 255))
        for k in range(5):
            jx = x + 6 + k * 21; col = rnd.choice([(120, 140, 90), (150, 90, 70), (200, 170, 120), (90, 110, 130)])
            d.rectangle((jx, 128, jx + 14, 150), fill=col + (255,)); d.rectangle((jx + 2, 124, jx + 12, 128), fill=(60, 40, 30, 255))
    for x in range(250, W, 400):                                                                           # hanging herbs and bones
        d.line([(x, 74), (x, 104)], fill=(40, 30, 22, 255), width=2); d.ellipse((x - 9, 100, x + 9, 122), fill=(70, 90, 50, 255))
        d.line([(x + 30, 74), (x + 30, 96)], fill=(40, 30, 22, 255), width=2); d.rectangle((x + 26, 96, x + 34, 116), fill=(200, 190, 160, 255))
    for x in range(560, W, 700): d.ellipse((x, 300, x + 60, 345), fill=(150, 130, 100, 255)); d.ellipse((x + 50, 312, x + 100, 345), fill=(140, 120, 92, 255))   # flour sacks
    d.rectangle((0, 330, W, 345), fill=(30, 20, 14, 255))
    save(wall, 'mill', 'wall')
    floor = layer(); d = ImageDraw.Draw(floor); d.rectangle((0, FT - 4, W, H), fill=(66, 44, 30, 255))
    for y in range(FT, H, 20): d.line((0, y, W, y), fill=(52, 34, 24, 255), width=2)
    for _ in range(140): x, y = rnd.randrange(W), rnd.randrange(FT, H); d.ellipse((x, y, x + rnd.randrange(10, 40), y + 4), fill=(210, 200, 180, 50))   # spilled flour
    for x in range(300, W, 900): d.ellipse((x, 420, x + 170, 470), fill=(90, 84, 76, 255)); d.ellipse((x + 60, 436, x + 110, 454), fill=(50, 44, 40, 255))  # millstone
    save(floor, 'mill', 'floor')
    fg = layer(); d = ImageDraw.Draw(fg)
    for x in (120, 1080):
        d.rectangle((x, 0, x + 46, 540), fill=(24, 14, 10, 255))
        for y in range(20, 200, 16): d.ellipse((x + 50, y, x + 60, y + 12), outline=(70, 70, 76, 255), width=2)   # hanging chain
    save(fg, 'mill', 'foreground')

if __name__ == '__main__':
    for fn in (town, church, abbey, manor, temple, windmill, mill): fn(); print('wrote', fn.__name__)
