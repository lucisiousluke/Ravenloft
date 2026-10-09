# Placeholder sprite sheets for the new bosses, in the same simple blocky style as the original placeholders,
# plus two new projectiles (holy light, fireball) added to the fx sheet.
# Not part of the game. Needs Python with Pillow (see tools/sprite-from-concept/README.md for setup).
#   python tools/placeholders/sprites.py
# Writes assets/sprites/<name>.png + .json (Aseprite "Array" format with tags). Real art replaces these files.
import json, math, os
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))

# frame size, feet position, standing height and colours for each character
SPECS = {
  'vampire-spawn': dict(frame=(160, 128), feet=(80, 116), h=58, skin=(214, 206, 200), body=(70, 62, 74), legs=(46, 40, 50), hair=(36, 30, 38),
                        eyes=(255, 60, 70), claws=True, hunch=4),
  'revenant':      dict(frame=(184, 144), feet=(92, 131), h=66, skin=(120, 132, 128), body=(146, 152, 158), legs=(110, 116, 122), hair=None,
                        tabard=(84, 104, 138), helm=(132, 138, 146), eyes=(190, 240, 255), sword=(200, 208, 214)),
  'the-abbot':     dict(frame=(216, 176), feet=(108, 160), h=92, skin=(228, 206, 188), body=(236, 230, 214), legs=(236, 230, 214), hair=(214, 204, 180),
                        trim=(212, 170, 70), robe=True, wings=(244, 244, 252), halo=(255, 214, 110), eyes=(255, 230, 150), glow=(255, 226, 140)),
  'bray-wyatt':    dict(frame=(216, 176), feet=(108, 160), h=88, skin=(222, 188, 166), body=(40, 32, 34), legs=(30, 26, 28), hair=(52, 38, 30),
                        shirt=(150, 32, 34), beard=True, eyes=(255, 70, 40), lantern=(255, 200, 90), glow=(255, 120, 50)),
}

def limb(d, x0, y0, ang, length, width, col):
    """Draw a limb from (x0, y0). ang in degrees: 0 = straight down, 90 = forward, 180 = straight up."""
    a = math.radians(ang); x1, y1 = x0 + math.sin(a) * length, y0 + math.cos(a) * length
    d.line((x0, y0, x1, y1), fill=col + (255,), width=int(width)); return x1, y1

def figure(spec, pose):
    fw, fh = spec['frame']; fx, fy = spec['feet']; h = spec['h']
    img = Image.new('RGBA', (fw, fh)); d = ImageDraw.Draw(img)
    bob, lean = pose.get('bob', 0), pose.get('lean', 0)
    hip = (fx + lean * 0.3, fy - h * 0.45 + bob)
    sh = (fx + lean + spec.get('hunch', 0), fy - h * 0.77 + bob)
    tw, lw, aw, al = h * 0.26, max(3, h * 0.1), max(3, h * 0.07), h * 0.36
    head = h * 0.2
    glow = pose.get('glow', 0)
    if glow and spec.get('glow'):      # aura while casting
        r = h * (0.35 + 0.25 * glow); gc = spec['glow']
        d.ellipse((sh[0] - r, sh[1] - r * 0.6, sh[0] + r, sh[1] + r * 1.1), fill=gc + (int(70 * glow),))
    if spec.get('wings'):              # wings behind everything, flapping with `wing`
        wa = pose.get('wing', 0); wc = spec['wings'] + (255,)
        for k, dark in ((1.0, 0), (0.8, 30)):
            tip = (sh[0] - h * 0.55 * k, sh[1] - h * (0.42 + 0.2 * wa) * k)
            col = tuple(max(0, c - dark) for c in spec['wings']) + (255,)
            d.polygon([(sh[0] - 4, sh[1] + 4), tip, (sh[0] - h * 0.45 * k, sh[1] + h * 0.1), (sh[0] - h * 0.2, sh[1] + h * 0.3)], fill=col)
    # back arm and back leg (darker)
    dk = lambda c: tuple(int(v * 0.72) for v in c)
    limb(d, sh[0] - tw * 0.2, sh[1] + 3, pose.get('armB', -12), al, aw, dk(spec['body']))
    limb(d, hip[0] - lw * 0.3, hip[1], 0, 0, 0, spec['legs'])
    for side, foot in ((-1, pose.get('legB', 0)), (1, pose.get('legA', 0))):
        col = dk(spec['legs']) if side < 0 else spec['legs']
        lift = pose.get('liftB' if side < 0 else 'liftA', 0)
        d.line((hip[0] + side * lw * 0.3, hip[1], fx + foot, fy - lift), fill=col + (255,), width=int(lw))
        d.rectangle((fx + foot - lw * 0.5, fy - lift - 3, fx + foot + lw * 0.9, fy - lift), fill=(28, 24, 28, 255))   # boot
        if side < 0 and spec.get('robe'): pass
    # torso (a robe hangs to the ankles)
    if spec.get('robe'):
        d.polygon([(sh[0] - tw / 2, sh[1]), (sh[0] + tw / 2, sh[1]), (fx + tw * 0.75 + lean * 0.2, fy - 4), (fx - tw * 0.75 + lean * 0.2, fy - 4)], fill=spec['body'] + (255,))
        d.line((sh[0], sh[1] + 4, fx + lean * 0.2, fy - 6), fill=spec['trim'] + (255,), width=3)
    else:
        d.rectangle((sh[0] - tw / 2, sh[1], sh[0] + tw / 2, hip[1] + 2), fill=spec['body'] + (255,))
    if spec.get('shirt'): d.rectangle((sh[0] - tw * 0.12, sh[1] + 2, sh[0] + tw * 0.2, hip[1] - 4), fill=spec['shirt'] + (255,))
    if spec.get('tabard'): d.rectangle((sh[0] - tw * 0.25, sh[1] + 4, sh[0] + tw * 0.3, hip[1] + h * 0.12), fill=spec['tabard'] + (255,))
    # head
    hx, hy = sh[0] + 1, sh[1] - head - 2
    if spec.get('helm'):
        d.rectangle((hx - head * 0.5, hy - 2, hx + head * 0.55, hy + head), fill=spec['helm'] + (255,))
        d.rectangle((hx + head * 0.05, hy + head * 0.35, hx + head * 0.55, hy + head * 0.48), fill=(30, 34, 40, 255))   # visor slit
    else:
        d.rectangle((hx - head * 0.45, hy, hx + head * 0.5, hy + head), fill=spec['skin'] + (255,))
        if spec.get('hair'): d.rectangle((hx - head * 0.55, hy - 2, hx + head * 0.2, hy + head * (0.9 if spec.get('robe') or spec.get('beard') else 0.45)), fill=spec['hair'] + (255,))
        if spec.get('beard'): d.rectangle((hx - head * 0.1, hy + head * 0.6, hx + head * 0.5, hy + head * 1.15), fill=spec['hair'] + (255,))
    ex = hx + head * 0.3; ey = hy + head * 0.4
    d.rectangle((ex, ey, ex + 2, ey + 1), fill=spec['eyes'] + (255,))
    if spec.get('halo'): d.ellipse((hx - head * 0.6, hy - head * 0.5, hx + head * 0.6, hy - head * 0.1), outline=spec['halo'] + (255,), width=2)
    # front arm, then whatever it holds
    hand = limb(d, sh[0] + tw * 0.2, sh[1] + 3, pose.get('armA', 12), al, aw, spec['body'] if not spec.get('robe') else spec['body'])
    d.rectangle((hand[0] - aw * 0.6, hand[1] - aw * 0.6, hand[0] + aw * 0.6, hand[1] + aw * 0.6), fill=spec['skin'] + (255,))
    ang = math.radians(pose.get('armA', 12))
    if spec.get('sword'):
        tip = (hand[0] + math.sin(ang) * h * 0.55, hand[1] + math.cos(ang) * h * 0.55)
        d.line((hand[0], hand[1], tip[0], tip[1]), fill=spec['sword'] + (255,), width=3)
        d.line((hand[0] - math.cos(ang) * 5, hand[1] + math.sin(ang) * 5, hand[0] + math.cos(ang) * 5, hand[1] - math.sin(ang) * 5), fill=(90, 80, 60, 255), width=3)
    if spec.get('claws'):
        for k in (-1, 0, 1): d.line((hand[0], hand[1], hand[0] + math.sin(ang + k * 0.35) * 7, hand[1] + math.cos(ang + k * 0.35) * 7), fill=(235, 230, 220, 255), width=1)
    if spec.get('lantern'):
        lx, ly = hand[0], hand[1] + 4
        d.line((lx, hand[1], lx, ly), fill=(60, 50, 40, 255), width=1)
        d.ellipse((lx - 9, ly - 2, lx + 9, ly + 16), fill=spec['lantern'] + (90,))
        d.rectangle((lx - 4, ly, lx + 4, ly + 12), fill=(60, 48, 36, 255)); d.rectangle((lx - 2, ly + 2, lx + 2, ly + 10), fill=spec['lantern'] + (255,))
    if spec.get('robe') and glow: d.ellipse((hand[0] - 5, hand[1] - 5, hand[0] + 5, hand[1] + 5), fill=spec['glow'] + (220,))
    return img

def fallen(spec, deg):
    """Death: the idle pose tipping over backward around the feet, then lying on the ground."""
    fw, fh = spec['frame']; fx, fy = spec['feet']
    img = figure(spec, {}).rotate(deg, resample=Image.NEAREST, center=(fx, fy))
    box = img.getbbox(); out = Image.new('RGBA', (fw, fh))
    out.paste(img, (0, fy + 1 - box[3]), img) if box else None
    return out

def animations(spec):
    walk = []
    for i in range(8):
        p = i / 8 * 2 * math.pi; s = spec['h'] * 0.16
        walk.append(({'legA': math.sin(p) * s, 'legB': -math.sin(p) * s, 'liftA': max(0, math.cos(p)) * 3, 'liftB': max(0, -math.cos(p)) * 3,
                      'armA': 12 - math.sin(p) * 22, 'armB': -12 + math.sin(p) * 22, 'bob': -abs(math.sin(p)) * 1.5, 'wing': 0.3 + 0.3 * math.sin(p)}, 100))
    return [
      ('idle',   [({'bob': b, 'wing': w}, 180) for b, w in ((0, 0), (1, 0.15), (1, 0.3), (0, 0.15))]),
      ('walk',   walk),
      ('windup', [({'armA': a, 'lean': l, 'wing': 0.5}, 100) for a, l in ((60, -1), (120, -2), (165, -3))]),
      ('attack', [({'armA': a, 'lean': l, 'legA': 6, 'wing': 0.2}, 70) for a, l in ((140, 2), (110, 4), (88, 5), (70, 4), (40, 2))]),
      ('hurt',   [({'lean': -6, 'armA': 40, 'armB': -50, 'bob': 1}, 120), ({'lean': -4, 'armA': 30, 'armB': -40}, 120)]),
      ('death',  [(('fall', deg), 110) for deg in (12, 35, 60, 80, 90, 90)]),
      ('cast',   [({'armA': a, 'armB': -a + 20, 'glow': g, 'wing': w}, 110) for a, g, w in ((100, 0.2, 0.4), (130, 0.5, 0.7), (150, 0.8, 1), (155, 1, 1), (150, 0.8, 0.7), (130, 0.4, 0.4))]),
    ]

def sheet(name, spec):
    fw, fh = spec['frame']; frames, tags = [], []
    for tag, fs in animations(spec):
        tags.append({'name': tag, 'from': len(frames), 'to': len(frames) + len(fs) - 1, 'direction': 'forward'})
        for pose, ms in fs:
            img = fallen(spec, pose[1]) if isinstance(pose, tuple) else figure(spec, pose)
            frames.append((img, ms))
    cols = 8; rows = (len(frames) + cols - 1) // cols
    out = Image.new('RGBA', (fw * cols, fh * rows)); meta = []
    for i, (img, ms) in enumerate(frames):
        x, y = (i % cols) * fw, (i // cols) * fh; out.paste(img, (x, y))
        meta.append({'filename': f'{name} {i}', 'frame': {'x': x, 'y': y, 'w': fw, 'h': fh}, 'rotated': False, 'trimmed': False,
                     'spriteSourceSize': {'x': 0, 'y': 0, 'w': fw, 'h': fh}, 'sourceSize': {'w': fw, 'h': fh}, 'duration': ms})
    base = os.path.join(ROOT, 'assets', 'sprites', name)
    out.save(base + '.png', optimize=True)
    json.dump({'frames': meta, 'meta': {'app': 'ravenmoor tools/placeholders/sprites.py', 'image': name + '.png', 'format': 'RGBA8888',
              'size': {'w': out.width, 'h': out.height}, 'scale': '1', 'frameTags': tags}}, open(base + '.json', 'w'), indent=1)
    print('wrote', name, len(frames), 'frames')

def fx_projectiles():
    """Adds 'holy' and 'fire' (2 frames each, 96x96, centred, facing right) to the fx sheet, keeping existing frames."""
    base = os.path.join(ROOT, 'assets', 'sprites', 'fx'); data = json.load(open(base + '.json')); old = Image.open(base + '.png').convert('RGBA')
    tags = [t for t in data['meta']['frameTags'] if t['name'] not in ('holy', 'fire')]
    keep = max(t['to'] for t in tags) + 1
    frames = data['frames'][:keep]
    new = []
    for k in range(2):   # holy light: a gold orb with turning rays
        img = Image.new('RGBA', (96, 96)); d = ImageDraw.Draw(img)
        for i in range(8):
            a = math.radians(i * 45 + k * 22); d.line((48, 48, 48 + math.cos(a) * 20, 48 + math.sin(a) * 20), fill=(255, 230, 150, 200), width=2)
        d.ellipse((36, 36, 60, 60), fill=(255, 214, 110, 255)); d.ellipse((42, 42, 54, 54), fill=(255, 250, 230, 255)); new.append(('holy', img))
    for k in range(2):   # fireball with a flickering tail (faces right, so the tail is on the left)
        img = Image.new('RGBA', (96, 96)); d = ImageDraw.Draw(img)
        d.polygon([(30, 48), (8 + k * 4, 38), (16, 48), (6 + k * 4, 58)], fill=(255, 120, 40, 200))
        d.ellipse((30, 34, 62, 62), fill=(240, 80, 30, 255)); d.ellipse((40, 40, 58, 56), fill=(255, 190, 80, 255)); d.ellipse((46, 44, 56, 52), fill=(255, 245, 200, 255))
        new.append(('fire', img))
    total = keep + len(new); out = Image.new('RGBA', (96 * total, 96))
    out.paste(old.crop((0, 0, 96 * keep, 96)), (0, 0))
    for j, (tag, img) in enumerate(new):
        i = keep + j; out.paste(img, (96 * i, 0))
        frames.append({'filename': f'fx {i}', 'frame': {'x': 96 * i, 'y': 0, 'w': 96, 'h': 96}, 'rotated': False, 'trimmed': False,
                       'spriteSourceSize': {'x': 0, 'y': 0, 'w': 96, 'h': 96}, 'sourceSize': {'w': 96, 'h': 96}, 'duration': 120})
    tags += [{'name': 'holy', 'from': keep, 'to': keep + 1, 'direction': 'forward'}, {'name': 'fire', 'from': keep + 2, 'to': keep + 3, 'direction': 'forward'}]
    data['frames'] = frames; data['meta']['frameTags'] = tags; data['meta']['size'] = {'w': out.width, 'h': 96}
    out.save(base + '.png', optimize=True); json.dump(data, open(base + '.json', 'w'), indent=1)
    print('fx: added holy + fire')

if __name__ == '__main__':
    for name, spec in SPECS.items(): sheet(name, spec)
    fx_projectiles()
