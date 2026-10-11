# Strahd sprite sheet: prompt for ChatGPT

How to use: open a new ChatGPT chat and attach two images:
1. `art-source/references/strahd-reference.png`: Strahd's look (the full-body pose from the parts sheet).
2. `art-source/ulrick-sheet.png`: the art style and size reference.
Then paste everything between the two lines below. Save the result as `art-source/strahd-sheet.png`, and send
it to Claude with the summary block.

---

You are making a pixel-art sprite sheet for the final boss of a side-scrolling beat 'em up called
"The Curse of Strahd".

The FIRST attached image shows the character: Strahd von Zarovich, the vampire lord. Keep his look exactly:
slicked-back black hair, pale face, red eyes, a tall stiff collar lined in crimson, a fitted black doublet with
crimson trim and a silver clasp, black trousers, tall polished black boots, long pale clawed fingers, and a
long black cape lined in blood red.

The SECOND attached image is a hero sprite sheet. Match its art style exactly: the same pixel density, dark
outlines and shading style. The armored knight in it is the size reference: Strahd is about 10% taller than
the knight, lean, regal and menacing.

## Rules

LAYOUT
- One animation per ROW, frames left to right, in exactly the order and frame counts below.
- Side view. Strahd faces RIGHT in every frame (toward where the player would be).
- The same size and scale in every frame and every row. Never draw one row smaller or larger than the others.
- The soles of the boots sit on the same baseline within each row.
- Real transparent background: no checkerboard, no magenta, no haze, no glow fringe, no ground shadow, no text,
  no labels, no grid lines.
- Clear empty space between frames, and between the cape and the next frame.
- His colors, proportions and costume are identical in every frame. The cape always hangs from his shoulders
  behind him, seen from the side.

ROWS
1. IDLE (4 frames): standing tall and still, hands relaxed, a slow menacing calm. The cape stirs slightly as
   if in a cold draft. Loops smoothly.
2. WALK (6 frames): an unhurried, gliding stride, the cape trailing. 1 stride, 2 down, 3 passing (legs
   together), 4 stride, 5 down, 6 passing. The two halves must use DIFFERENT legs: in frames 1-3 the near
   (lighter) leg steps forward, in frames 4-6 the far (darker) leg steps forward. Frames 4-6 must NOT be
   copies of frames 1-3.
3. WIND-UP (3 frames): the warning pose before a melee attack. He draws back his clawed front hand, fingers
   spread, the cape flaring out behind him, fangs bared. Exaggerated and easy to read.
4. ATTACK (5 frames): 1 lunging forward, 2 a vicious claw slash fully extended (the moment of impact, the most
   dramatic pose), 3 follow-through, 4-5 recovering to an upright stance.
5. HURT (2 frames): recoiling from a blow, head snapping back, a snarl, the cape whipping forward.
6. CAST (6 frames): summoning a swarm of bats. 1-2 he raises both arms and the cape spreads wide like wings,
   3-4 he thrusts his hands forward as a few small black bats burst from the cape toward the right, 5-6 he
   lowers his arms. (Keep the bats small and close to him: the game draws the flying bats separately.)

## The SUMMARY to write after the image

Write it as a plain code block, exactly in this format, filled in for the sheet you made:

```
ENEMY: strahd
FILE: strahd-sheet.png
ROWS: idle=<n> walk=<n> windup=<n> attack=<n> hurt=<n> cast=<n>
IMPACT FRAME (attack row): <the frame number where the claw strike is fully extended, normally 2>
WALK CHECK: frame 1 forward leg = <near/far>, frame 4 forward leg = <near/far>
SIZE CHECK: <"all rows same size" or which row differs and how>
NOTES: <anything that differs from the instructions, or "none">
```

Be honest in the checks. If a row came out a different size, or frames 4-6 of the walk repeat frames 1-3, say
so in the summary and offer to redo it.

---
