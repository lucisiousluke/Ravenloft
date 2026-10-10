// Developer cheats for testing levels quickly.
// Type the Konami code  ↑ ↑ ↓ ↓ ← → ← → B A  on the title or hero select screen to open the cheat menu
// (scenes/CheatScene.js). Once unlocked it stays unlocked in this browser, and during play:
//   G = god mode on/off   B = jump to this act's boss   N = finish the act (defeats the boss if one is up)
const CODE = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
const STORE = 'ravenmoor-cheats';

export const Cheats = {
  unlocked: false,   // entered the code at least once (remembered across reloads)
  god: false,        // the hero takes no damage
  boss: false,       // acts started from the cheat menu begin at the boss
  onCode: null,      // what the current screen does when the code is entered (set by Title, Select and Game)
};
try { Object.assign(Cheats, JSON.parse(localStorage.getItem(STORE)) || {}); } catch (e) {}

export function saveCheats() {
  try { localStorage.setItem(STORE, JSON.stringify({ unlocked: Cheats.unlocked, god: Cheats.god, boss: Cheats.boss })); } catch (e) {}
}
export const godMode = () => Cheats.unlocked && Cheats.god;

// Watch every key press for the code (works on any screen; extra ↑ presses at the start are forgiven)
let pos = 0;
window.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  const k = e.key.toLowerCase();
  if (k === CODE[pos]) pos++;
  else pos = k === CODE[0] ? (pos === 2 ? 2 : 1) : 0;
  if (pos === CODE.length) { pos = 0; Cheats.unlocked = true; saveCheats(); Cheats.onCode?.(); }
});
