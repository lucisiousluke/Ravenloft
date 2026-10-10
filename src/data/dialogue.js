// Scripted dialogue shown in the cinematic text box (scenes/DialogueScene.js).
// Each section is one screen; the player clicks Continue to see the next. Never shown all at once.
// Within a section, lines fade in one after another. { text, emphasis: true } is shown large, in red, and last.

// Strahd's words when he reaches 0 HP in the final act. He vanishes instead of dying (see `finale` in foes.js).
export const STRAHD_FINALE = {
  speaker: 'Strahd von Zarovich',
  sections: [
    { lines: ['You stand in my land. Beneath my roof. Upon soil that has drunk the blood of a thousand souls. Did you truly believe you could destroy me here?'] },
    { lines: ['No. Barovia does not surrender its master so easily.'] },
    { lines: ['I am bound to this throne, as I have been for ages beyond your reckoning. And so long as the damned remain imprisoned, there must be a jailer.'] },
    { lines: ['The throne shall never stand empty. The prison shall never open.'] },
    { lines: [
      'Remember this, heroes, when the celebrations fade and the silence comes…',
      'The curse does not end with me.',
      { text: 'It merely awaits its next keeper.', emphasis: true },
    ] },
  ],
};
