# Act I backgrounds: windmill exterior and interior (prompts for ChatGPT)

Two separate images, two separate chats. In both, attach `art-source/backgrounds/forest-dark.png` (the forest
used in Act I) so the style matches. Save the results as:
- `art-source/backgrounds/windmill.png` (prompt 1)
- `art-source/backgrounds/mill-interior.png` (prompt 2)

Then tell Claude. Claude cuts them into the game's layers, lines up the windmill's door with the walk-in
entrance, and makes the interior repeat seamlessly, like the forest.

---

## Prompt 1: the windmill (Old Bonegrinder, seen from outside)

```
Create a pixel-art game asset in the same style as the attached image: the same pixel density, limited
moonlit palette of deep teals, navy and near-black, soft moonlight highlights.

SUBJECT: "Old Bonegrinder", a sinister old stone windmill in the cursed forest of Barovia (Curse of Strahd),
where a coven of night hags lives and bakes terrible things.
- A tall, slightly crooked, tapered stone tower with a conical wooden cap, weathered and mossy.
- Four large wooden sails in an X shape: tattered, with broken slats, one sail snapped short.
- One small arched window high on the tower, glowing a warm, sickly orange from a fire inside: the only warm
  color in the image.
- An arched wooden door at the very bottom centre of the tower, closed, clearly visible and not hidden by
  anything. Above the door, a crooked iron lantern (unlit).
- A few dead brambles, crooked fence posts and a scattering of bones in the grass right at the base.
- Optional: two or three crows perched on the sails.

COMPOSITION AND FORMAT (very important)
- A single object on a fully transparent background: no sky, no trees, no ground beyond a thin strip of grass
  under the base, no checkerboard, no haze, no glow fringe, no text.
- Seen straight from the side at eye level, as a background prop in a side-scrolling game.
- The whole windmill fits in the image with a little empty margin, including the tips of the sails.
- Portrait proportions: about 2 wide by 3 tall overall.
- The door is about one-tenth of the total height, at the bottom centre, with its bottom edge on the base line.
```

---

## Prompt 2: inside the windmill (the boss fight arena)

```
Create a pixel-art BACKGROUND for a side-scrolling beat 'em up, in the same pixel-art style as the attached
image (same pixel density and crisp pixels), but this scene is indoors and lit by firelight.

SCENE: the inside of "Old Bonegrinder", a haunted windmill in the cursed land of Barovia (Curse of Strahd)
where three night hags bake stolen children into "dream pastries". It should feel cosy at first glance and
deeply wrong on the second.
- Back wall: dark wooden planks and heavy beams. A huge wooden millstone gear turning on the wall, with
  wooden shafts and pulleys.
- Two brick bread ovens set into the back wall, their mouths glowing orange-red with fire: the main light
  sources, casting warm light and long shadows.
- Shelves of glass jars with murky contents, and trays of small iced pastries.
- Bundles of dried herbs, garlic and a few small bones hanging from the beams on twine.
- Flour sacks slumped against the wall, a rolling pin and a cleaver on a table, a child's small shoe dropped
  in a corner (a subtle, creepy detail).
- One small window showing cold blue moonlight, contrasting with the warm fire.

COMPOSITION AND FORMAT (very important)
- Side view, like a theatre stage, as in classic side-scrolling brawlers. NOT a top-down or 3/4 view.
- Wide landscape image, about 2:1 (twice as wide as tall).
- The back wall fills the top 64% of the image. The floor fills the bottom 36%, starting at a clear,
  straight horizontal line where the wall meets the floor.
- The floor is worn wooden planks seen from the side and slightly above, with spilled flour and a large flat
  millstone. Keep the floor simple and slightly darker, with no objects standing on it, because the characters
  fight on the floor and must stay easy to see.
- The left and right edges should look alike (wall planks and floor continuing), so the image can repeat
  side by side.
- No characters, no creatures, no text, no watermark, no frame or border.
```
