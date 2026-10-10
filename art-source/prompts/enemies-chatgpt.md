# Enemy sprite sheets: prompt for ChatGPT

How to use: open a new ChatGPT chat, attach `art-source/ulrick-sheet.png` (the style and size reference),
paste everything between the two lines below, and send it. ChatGPT makes one enemy per reply; type
**NEXT** to get the following one. Download each image and save it under the file name its summary gives,
in `art-source/`. Copy each summary block too, and send the images and summaries to Claude.

---

You are making pixel-art sprite sheets for the regular enemies of a side-scrolling beat 'em up called
"The Curse of Strahd". The attached image is one of the hero sprite sheets. Match its art style exactly:
the same pixel density, dark outlines, shading style and overall size scale. The armored knight in the
attachment is the size reference for a human-sized character.

There are SIX enemies, described at the end. Make them ONE AT A TIME, in the order listed: one enemy per
reply, one image per reply. After each image, write the SUMMARY described below, then stop and wait. When
I type NEXT, make the next enemy. If I type REDO plus a note, remake the same enemy with that fix.

## Rules for every sheet

LAYOUT
- One animation per ROW, frames left to right, in exactly the order and frame counts below.
- Side view. The enemy faces RIGHT in every frame (toward where the player would be).
- The same size and scale in every frame and every row. Never draw one row smaller or larger than the others.
- The soles of the feet (or paws) sit on the same baseline within each row.
- Real transparent background: no checkerboard, no haze, no glow fringe, no ground shadow, no text, no labels,
  no grid lines, no row titles inside the image.
- Clear empty space between frames, and between the weapon and the body where possible.
- The character's colors, proportions and equipment are identical in every frame.

ROWS (the same for every enemy)
1. IDLE (4 frames): standing ready, subtle breathing or swaying. Loops smoothly.
2. WALK (6 frames): 1 stride, 2 down, 3 passing (legs together), 4 stride, 5 down, 6 passing.
   The two halves must use DIFFERENT legs: in frames 1-3 the near (lighter) leg steps forward, in frames 4-6 the far
   (darker) leg steps forward. Frames 4-6 must NOT be copies of frames 1-3.
3. WIND-UP (3 frames): the warning pose before an attack. Exaggerated and easy to read: the weapon or claws pulled
   far back, the body coiled. The player uses this pose to know a hit is coming, so it must look obviously different
   from IDLE.
4. ATTACK (5 frames): 1 the release, 2 the strike fully extended (the moment of impact, the most dramatic pose),
   3 the follow-through, 4-5 returning toward the idle pose.
5. HURT (2 frames): knocked back by a hit, head snapping back, recoiling.
6. DEATH (6 frames): falls BACKWARD (to the left, away from the player), ending lying flat or collapsed on the
   ground, as described for that enemy.

## The SUMMARY to write after each image

Write it as a plain code block, exactly in this format, filled in for the sheet you just made:

```
ENEMY: <key from the list below>
FILE: <key>-sheet.png
ROWS: idle=<n> walk=<n> windup=<n> attack=<n> hurt=<n> death=<n>
IMPACT FRAME (attack row): <the frame number where the strike is fully extended, normally 2>
LYING FRAMES (death row): <the frame numbers where the body is fully on the ground, e.g. 4,5,6>
WALK CHECK: frame 1 forward leg = <near/far>, frame 4 forward leg = <near/far>
SIZE CHECK: <"all rows same size" or which row differs and how>
NOTES: <anything that differs from the instructions, or "none">
```

Be honest in the checks. If a row came out a different size, or frames 4-6 repeat frames 1-3, say so in the
summary rather than hiding it, and offer to REDO.

## The six enemies, in order

### 1. ENEMY: goblin
A goblin raider. Small and wiry, about two-thirds the height of the knight. Green-grey skin, big pointed ears,
yellow eyes, sharp teeth in a nasty grin, ragged brown leather and fur scraps, bare feet. Holds a crude notched
short sword in the front hand.
- Wind-up: raises the blade high over its head while hopping back.
- Attack: a fast downward hack.
- Death: stumbles backward and flops onto its back, arms splayed.

### 2. ENEMY: dire-wolf
A dire wolf. A huge, shaggy dark-grey wolf on four legs, side view. Its body is about as long as the knight is
tall, and its shoulder height is about half the knight's height. Glowing pale-yellow eyes, bared fangs, ragged
fur along the spine.
- Walk: a four-legged trot. Diagonal leg pairs move together, with the front and back legs clearly alternating.
  (The walk row still has 6 frames.)
- Wind-up: a low crouch with the head down and hackles up, ready to pounce.
- Attack: a forward LUNGE with jaws snapping open. The whole body springs forward, with the front paws off the
  ground on frame 2.
- Death: yelps, rears back and topples onto its side, legs out.

### 3. ENEMY: skeleton
A skeleton warrior. Human-sized, about the knight's height, slightly hunched. Yellowed bones, dark empty eye
sockets with tiny cold blue lights, a rusty dented half-helm, a few scraps of rotten cloth, a chipped rusty sword
in the front hand and a cracked round wooden shield on the far arm.
- Wind-up: pulls the sword back over its shoulder with a jerky, puppet-like motion.
- Attack: a stiff overhand chop.
- Death: falls back and collapses into a loose pile of bones, the skull rolling off on the last frame.

### 4. ENEMY: ghoul
A ghoul. Gaunt, hunched undead, about the knight's height if it stood straight, but always crouched low. Grey-green
mottled skin stretched over bones, long arms with long black claws, sunken glowing eyes, a long lolling tongue,
tattered grave clothes.
- Walk: a hunched, loping shuffle with the arms dangling.
- Wind-up: rears back with both clawed hands raised.
- Attack: a vicious double claw swipe downward and forward.
- Death: shrieks, arches backward and crumples to the ground in a heap.

### 5. ENEMY: blood-cultist
A blood cultist. Human-sized, about the knight's height. A hooded deep-crimson robe with black trim, the face in
shadow except for a pale chin and glowing red eyes, a silver sacrificial dagger on the belt, bony pale hands
painted with blood-red symbols. This enemy attacks from a distance by casting a spell.
- Wind-up: raises both hands together in front of the chest while a crackling red orb of blood magic gathers
  between them.
- Attack: thrusts both hands forward, hurling the orb. The orb leaves the hands on frame 2 and is NOT drawn after
  that, because the game draws the flying bolt separately.
- Death: drops to its knees, then falls backward with the robe spreading on the ground.

### 6. ENEMY: blood-knight
A blood knight, the toughest regular enemy. Bigger and broader than the attached knight (about 15% taller). Heavy
black plate armor with blood-red trim and spikes, a horned great-helm with a glowing red visor slit, a tattered
crimson cape, a huge two-handed blade held in both hands. Moves slowly and heavily.
- Wind-up: hauls the great blade all the way back behind the shoulder.
- Attack: a massive horizontal sweep.
- Death: staggers, drops the blade and falls backward with a heavy crash.

Start now with enemy 1, the goblin.

---
