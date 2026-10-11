# Dire wolf sprite sheet: prompt for ChatGPT

How to use: open a new ChatGPT chat and attach two images:
1. `art-source/ulrick-sheet.png`: the art style and size reference (the armored knight).
2. `art-source/goblin-sheet.png`: an enemy already in the game, so the wolf matches the other enemies.
Then paste everything between the two lines below. Save the result as `art-source/dire-wolf-sheet.png`, and
send it to Claude with the summary block.

---

You are making a pixel-art sprite sheet for an enemy in a side-scrolling beat 'em up called "The Curse of
Strahd", set in the cursed, misty land of Barovia.

The FIRST attached image is a hero sprite sheet. Match its art style exactly: the same pixel density, dark
outlines and shading style. The armored knight in it is the size reference. The SECOND attached image is
another enemy from the same game; the wolf should look like it belongs alongside it.

THE CHARACTER: a Barovian dire wolf, one of Strahd's hunting wolves. A huge, gaunt, shaggy wolf with dark
charcoal-grey fur, darker along the spine where the fur bristles into ragged tufts, a lighter grey muzzle and
belly, long legs with big clawed paws, a long bushy tail, torn ears, glowing pale-yellow eyes, and long bared
fangs. It looks starved and vicious, not noble. Its body (nose to rump, not counting the tail) is about as
long as the knight is tall, and its shoulder height is about half the knight's height. It moves on four legs.

LAYOUT (very important)
- Exactly SIX rows, one animation per row, frames left to right, in exactly the order and frame counts below.
  Do not add any extra rows or animations.
- Side view. The wolf faces RIGHT in every frame (toward where the player would be).
- The same size and scale in every frame and every row. Never draw one row smaller or larger than the others.
- All four paws (when on the ground) sit on the same baseline within each row.
- Real transparent background: no checkerboard, no haze, no glow fringe, no ground shadow, no text, no labels,
  no grid lines.
- Clear empty space between frames, including around the tail.
- The wolf's colors, proportions and markings are identical in every frame.

ROWS
1. IDLE (4 frames): standing on all fours, head low, hackles raised, a slow growling breath; the tail twitches.
   Loops smoothly.
2. WALK (6 frames): a prowling four-legged trot. Diagonal leg pairs move together (front-near with back-far,
   then front-far with back-near). Frames 1-3 show one diagonal pair stepping forward, frames 4-6 the OTHER
   pair, so the legs clearly alternate. Frames 4-6 must NOT be copies of frames 1-3. The head bobs slightly.
3. WIND-UP (3 frames): the warning pose before it attacks. It crouches low on its back legs, head down, ears
   pinned back, lips curled over its fangs, ready to pounce. Exaggerated and easy to read, obviously different
   from IDLE.
4. ATTACK (5 frames): a forward LUNGE. 1 springing off the back legs, 2 fully stretched out in mid-air with the
   front paws off the ground and the jaws snapping wide open (the moment of impact, the most dramatic pose),
   3 landing with the jaws closing, 4-5 skidding to a stop and returning to a standing pose.
5. HURT (2 frames): knocked back by a blow, head jerking up and away, a yelp, all four legs braced.
6. DEATH (6 frames): it rears back with a yelp, staggers, and topples onto its side (falling BACKWARD, to the
   left, away from the player), ending lying still on its side with its legs out.

## The SUMMARY to write after the image

Write it as a plain code block, exactly in this format, filled in for the sheet you made:

```
ENEMY: dire-wolf
FILE: dire-wolf-sheet.png
ROWS: idle=<n> walk=<n> windup=<n> attack=<n> hurt=<n> death=<n>
IMPACT FRAME (attack row): <the frame number where the lunge is fully stretched with jaws open, normally 2>
LYING FRAMES (death row): <the frame numbers where the body is fully on the ground, e.g. 4,5,6>
WALK CHECK: frames 1-3 forward legs = <which diagonal pair>, frames 4-6 forward legs = <which diagonal pair>
SIZE CHECK: <"all rows same size" or which row differs and how>
NOTES: <anything that differs from the instructions, or "none">
```

Be honest in the checks. If a row came out a different size, if frames 4-6 of the walk repeat frames 1-3, or if
you added any extra rows, say so in the summary and offer to redo it.

---
