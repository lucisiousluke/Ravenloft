import { W, H, FT, FB, TICK, FONT_BODY, C } from '../config.js';
import { HEROES } from '../data/heroes.js';
import { FOES } from '../data/foes.js';
import { LEVELS } from '../data/levels.js';
import { Input } from '../systems/input.js';
import { sfx, playMusic } from '../systems/audio.js';
import { TAU, rnd, clamp, hash, roll, d20 } from '../systems/util.js';
import { buildLayers, scrollLayers } from '../ui/widgets.js';
import { toClear, toWin, toDead } from '../flow.js';

const alive = (e) => e.state !== 'dying';
const SLOT_REGEN = 480; // ticks to recover one spell slot (8 seconds)
const PROJ_SPEED = { bat: 5.5, shade: 4.5, holy: 5, fire: 5 }; // boss projectile speeds (pixels per tick)
const HEAL_T = 24;      // ticks the healing ability animation takes

// One level of play. Game rules run at a fixed 60 ticks per second in step();
// render() then moves the sprites to match.
//
// Positions: x = left/right, y = depth on the floor (FT..FB), z = height off the ground.
export class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  init(data) { this.lvl = data.lvl; this.carryHp = data.carryHp; }

  create() {
    const L = LEVELS[this.lvl];
    this.L = L; this.theme = L.theme;
    this.info = this.registry.get('spriteInfo');
    this.registry.set('levelGold', this.registry.get('gold'));
    Object.assign(this, { tick: 0, acc: 0, cam: 0, lock: null, wave: 0, queue: [], foes: [], proj: [], parts: [], pickups: [], spawnT: 0, spawnSide: false, bannerT: 200, bannerTop: null, bannerTitle: null, bossTitle: null, bossTotal: 0, packSize: 1, clearT: 0, ended: false });

    this.layers = buildLayers(this, this.theme);
    this.gGround = this.add.graphics().setDepth(1);   // shadows, rings on the floor
    this.gTop = this.add.graphics().setDepth(8000);   // sparks, vines, smoke

    const heroKey = this.registry.get('hero');
    const max = HEROES[heroKey].hp;
    const hp = this.carryHp == null ? max : Math.min(max, Math.round(this.carryHp + max * 0.5));
    this.p = this.makePlayer(heroKey, hp);

    Input.reset();
    this.scene.launch('Hud');
    this.input.keyboard.on('keydown-P', () => this.pauseGame());
    this.input.keyboard.on('keydown-ESC', () => this.pauseGame());
    this.game.events.on('blur', this.pauseGame, this);
    this.events.once('shutdown', () => { this.game.events.off('blur', this.pauseGame, this); this.scene.stop('Hud'); Input.reset(); });
    playMusic(L.music);
  }

  pauseGame() {
    if (this.ended || this.p.state === 'dead' || !this.scene.isActive()) return;
    this.scene.pause(); this.scene.launch('Pause');
  }

  update(_, delta) {
    this.acc += Math.min(100, delta);
    while (this.acc >= TICK && !this.ended) { this.step(); this.acc -= TICK; }
    if (!this.ended) this.render();
  }

  /* ---------------- entities ---------------- */

  makeSprite(key) {
    const i = this.info[key];
    return this.add.sprite(0, 0, key).setOrigin(i.ox, i.oy).setScale(i.scale);
  }

  makePlayer(key, hp) {
    const d = HEROES[key];
    return { kind: 'hero', key, def: d, sprite: this.makeSprite(d.sprite), x: 150, y: 440, z: 0, vz: 0, vx: 0, face: 1, hp, maxHp: d.hp, slots: 3, slotT: 0, heals: 1, regen: 0, regenT: 0, state: 'idle', t: 0, seq: 0, combo: 0, comboT: 0, moving: false, inv: 60, flash: 0, dashHit: null };
  }

  go(e, state, t = 0) { e.state = state; e.t = t; e.seq++; }

  spawn(q) {
    const d = FOES[q.type];
    this.spawnSide = !this.spawnSide;
    const left = (!d.boss || d.pack) && this.spawnSide;
    const hp = Math.round(d.hp * (d.boss ? 1 : 1 + this.lvl * 0.12));
    const e = { kind: 'foe', type: q.type, def: d, boss: !!d.boss, sprite: this.makeSprite(d.sprite), tint: q.tint || null,
      x: left ? this.cam - 50 : this.cam + W + 60, y: rnd(FT + 30, FB - 15), z: 0, vx: 0, face: left ? 1 : -1,
      hp, maxHp: hp, state: 'enter', t: 0, seq: 0, cd: rnd(30, 70), moving: false, flash: 0, root: 0, yoff: rnd(-40, 40),
      poise: 0, sp: 200, summoned: false, hitDone: false, alpha: 1, mode: 0 };
    this.foes.push(e);
    if (q.quips) { e.quips = q.quips; e.quipT = rnd(90, 240); }   // first line comes 1.5-4 s after arriving
    if (q.name) e.tag = this.add.text(0, 0, q.name, { fontFamily: FONT_BODY, fontStyle: '800', fontSize: '13px', color: C.parchment, stroke: C.ink, strokeThickness: 4 }).setOrigin(0.5, 1).setDepth(9400);
    if (d.boss && !q.quiet) { this.shake(10); sfx('roar'); }
  }

  /* ---------------- effects ---------------- */

  shake(px) { this.cameras.main.shake(160 + px * 14, px / 900, px >= 8); }

  text(x, y, z, txt, col, size) {
    const t = this.add.text(x, y - z, txt, { fontFamily: FONT_BODY, fontStyle: '800', fontSize: size + 'px', color: col, stroke: C.ink, strokeThickness: 4 }).setOrigin(0.5, 1).setDepth(9500);
    this.tweens.add({ targets: t, y: t.y - 44, duration: 900, ease: 'Cubic.out' });
    this.tweens.add({ targets: t, alpha: 0, delay: 620, duration: 300, onComplete: () => t.destroy() });
  }

  burst(x, y, z, col, n) {
    for (let i = 0; i < n; i++) this.parts.push({ k: 'spark', x, y, z, vx: rnd(-3, 3), vz: rnd(1, 5), life: rnd(14, 26), max: 26, col, s: rnd(2, 4) });
  }

  /* ---------------- player ---------------- */

  updPlayer(p) {
    const d = p.def;
    if (p.inv > 0) p.inv--; if (p.comboT > 0) p.comboT--; if (p.flash > 0) p.flash--;
    if (p.state === 'dead') { p.t++; return; }
    if (p.slots < 3 && ++p.slotT >= SLOT_REGEN) { p.slots++; p.slotT = 0; this.text(p.x, p.y, d.height + 14, '+1 spell slot', C.arcane, 15); }
    // heal-over-time (Goodberry): one pulse every half second
    if (p.regen > 0 && ++p.regenT >= 30) { p.regen--; p.regenT = 0; this.healPlayer(p, roll(d.heal.dice)); }
    if (p.z > 0 || p.vz > 0) { p.vz -= 0.62; p.z += p.vz; if (p.z <= 0) { p.z = 0; p.vz = 0; } }
    const inp = Input.dir();
    if (p.state === 'hurt') {
      p.t--; p.x += p.vx; p.vx *= 0.82; p.moving = false;
      if (p.t <= 0) this.go(p, 'idle');
    } else if (p.state === 'attack') {
      p.t++; p.x += inp.x * d.spd * (p.z > 0 ? 0.9 : 0.25); p.y += inp.y * d.spd * 0.15;
      if (p.t === Math.max(3, Math.round(d.atkT * 0.38))) this.meleeHit(p);
      if (p.t >= d.atkT) { this.go(p, 'idle'); p.comboT = 16; }
    } else if (p.state === 'spell') {
      p.t++; this.spellTick(p);
      if (p.t >= d.dur) this.go(p, 'idle');
    } else if (p.state === 'heal') {
      p.t++; if (p.t === 12) this.castHeal(p);
      if (p.t >= HEAL_T) this.go(p, 'idle');
    } else {
      p.x += inp.x * d.spd; p.y += inp.y * d.spd * 0.7;
      if (inp.x) p.face = inp.x > 0 ? 1 : -1;
      p.moving = !!(inp.x || inp.y) && p.z === 0;
      if (Input.take('jump') && p.z === 0) { p.vz = 10.5; sfx('jump'); p.seq++; }
      if (Input.take('atk')) {
        p.combo = p.comboT > 0 ? (p.combo + 1) % 3 : 0;
        this.go(p, 'attack'); sfx('swing');
      } else if (Input.take('spell')) {
        if (p.slots > 0) {
          p.slots--; p.slotT = 0; this.go(p, 'spell');
          p.inv = Math.max(p.inv, d.dur + 8); p.dashHit = new Set();
          sfx('spell'); this.text(p.x, p.y, d.height + 20, d.spell, C.arcane, 17);
        } else this.text(p.x, p.y, d.height + 14, 'No spell slots', C.dim, 14);
      } else if (Input.take('heal')) {
        // once per act: refuse (without using it up) when already spent or at full health
        if (!p.heals) this.text(p.x, p.y, d.height + 14, `${d.heal.name} is spent this act`, C.dim, 14);
        else if (p.hp >= p.maxHp) this.text(p.x, p.y, d.height + 14, 'Already at full health', C.dim, 14);
        else {
          p.heals = 0; this.go(p, 'heal'); p.inv = Math.max(p.inv, HEAL_T + 8);
          sfx('spell'); this.text(p.x, p.y, d.height + 20, d.heal.name, C.heal, 17);
        }
      }
    }
    p.x = clamp(p.x, this.cam + 24, this.cam + W - 24); p.y = clamp(p.y, FT + 14, FB);
  }

  meleeHit(p) {
    const d = p.def, third = p.combo === 2; let any = false;
    for (const e of this.foes) {
      if (!alive(e)) continue;
      const dx = (e.x - p.x) * p.face, r = e.def.shadow * 0.7;
      if (dx > -14 && dx < d.reach + r && Math.abs(e.y - p.y) < 26 && Math.abs(e.z - p.z) < 60) {
        any = true; this.attackRoll(p, e, d.dmg, { knock: third ? 10 : 3, bonus: third ? 2 : 0, dir: p.face });
      }
    }
    if (any) sfx('hit');
  }

  // Roll a d20: natural 1 misses, critMin+ doubles the damage dice.
  attackRoll(p, e, dice, o) {
    const r = d20();
    if (r === 1 && !o.auto) { this.text(e.x, e.y, e.def.height + 6, 'NAT 1 · miss', C.dim, 15); sfx('miss'); return; }
    const crit = r >= p.def.critMin;
    let dmg = roll(dice) + (o.bonus || 0);
    if (crit) dmg += roll({ n: dice.n, s: dice.s, b: 0 });
    this.hurtFoe(e, dmg, { knock: o.knock ?? 3, dir: o.dir ?? p.face, crit, nat20: r === 20, col: o.col });
  }

  hurtFoe(e, dmg, o) {
    if (!alive(e)) return;
    e.hp -= dmg; e.flash = 6;
    const hy = e.def.height;
    this.text(e.x + rnd(-8, 8), e.y, hy, String(dmg), o.crit ? '#ffd460' : '#f4ead2', o.crit ? 26 : 19);
    if (o.crit) { this.text(e.x, e.y, hy + 28, o.nat20 ? 'NAT 20!' : 'CRIT!', '#ffd460', 17); sfx('crit'); this.shake(5); }
    this.burst(e.x, e.y, hy * 0.6, o.col || '#fff3d0', 6);
    if (e.hp <= 0) { this.killFoe(e, o.dir); return; }
    const resist = e.def.poise || 0;
    if (resist) { e.poise++; if (e.poise <= resist) return; e.poise = 0; }
    if (['charge', 'vanish', 'appear', 'charge_wind'].includes(e.state)) return;
    this.go(e, 'hurt', o.knock > 6 ? 20 : 12);
    e.vx = (o.dir || 1) * o.knock * (e.boss ? 0.3 : 1);
  }

  killFoe(e, dir) {
    this.go(e, 'dying'); e.vx = (dir || 1) * 4; e.hp = 0; e.root = 0;
    this.registry.inc('gold', e.def.gold);
    this.text(e.x, e.y, e.def.height + 22, `+${e.def.gold} gp`, C.gold, 15); sfx('coin');
    if (!e.boss && Math.random() < 0.17) {
      const s = this.add.sprite(e.x, e.y, 'fx').play('fx:potion');
      this.pickups.push({ x: e.x, y: e.y, z: 34, vz: 3, t: 0, sprite: s });
    }
    if (e.boss) {
      this.shake(e.def.pack ? 6 : 16); sfx('roar'); this.burst(e.x, e.y, 60, '#ffd460', e.def.pack ? 14 : 30);
      const more = this.foes.some((f) => f !== e && f.boss && alive(f)) || this.queue.some((q) => FOES[q.type].boss);
      if (!more) { // the last boss is down: the act is won
        this.queue = []; for (const f of this.foes) if (f !== e && alive(f)) this.killFoe(f, 1);
        this.clearT = 1;
      }
    }
  }

  // The hero's once-per-act heal (data in heroes.js). Instant, or spread over `pulses`.
  castHeal(p) {
    const h = p.def.heal;
    if (h.pulses) { p.regen = h.pulses; p.regenT = 29; } else this.healPlayer(p, roll(h.dice));
    this.parts.push({ k: 'ring', x: p.x, y: p.y, r: 10, vr: 5, life: 22, max: 22, col: 0x9be36a });
    this.burst(p.x, p.y, p.def.height * 0.6, C.heal, 18); sfx('heal');
  }

  healPlayer(p, amt) {
    const h = Math.min(amt, p.maxHp - p.hp); p.hp += h;
    if (h) { this.text(p.x, p.y, p.def.height + 10, '+' + h + ' HP', C.heal, 18); this.burst(p.x, p.y, p.def.height * 0.6, C.heal, 5); }
  }

  hurtPlayer(p, dmg, dir, knock) {
    if (p.state === 'dead') return;
    p.hp = Math.max(0, p.hp - dmg); p.flash = 6;
    this.text(p.x, p.y, p.def.height + p.z, '-' + dmg, '#ff6a5a', 21); sfx('hurt'); this.shake(6);
    if (p.hp <= 0) { this.go(p, 'dead'); p.z = 0; p.vz = 0; return; }
    this.go(p, 'hurt', 16); p.vx = dir * knock; p.inv = 45;
  }

  /* ---------------- enemies ---------------- */

  attackers() { let n = 0; for (const e of this.foes) if (!(e.boss && !e.def.pack) && (e.state === 'windup' || e.state === 'strike')) n++; return n; }

  tryHit(e, p, reach, dice, knock) {
    if (p.state === 'dead' || p.inv > 0) return false;
    const dx = (p.x - e.x) * e.face;
    if (dx > -20 && dx < reach + 14 && Math.abs(p.y - e.y) < 24 && p.z < 45) {
      e.hitDone = true; this.hurtPlayer(p, roll(dice || e.def.dmg), e.face, knock || 6);
      if (e.def.drain) { e.hp = Math.min(e.maxHp, e.hp + e.def.drain); this.text(e.x, e.y, e.def.height + 10, `+${e.def.drain} drain`, '#ff6a7a', 14); }
      return true;
    }
    return false;
  }

  // A boss's special move, taken in turn from `moves` in foes.js. Returns true if one started.
  bossSpecial(e, p) {
    const d = e.def;
    if (!d.moves) return false;
    e.sp = rnd(d.every[0], d.every[1]);
    const s = d.summon;
    if (s && !e.summoned && e.hp < e.maxHp * s.below) {
      e.summoned = true; this.queue.push(...s.foes.map((type) => ({ type }))); this.spawnT = 10;
      this.text(e.x, e.y, d.height + 12, s.line, s.col || '#ff6a7a', 16);
    }
    const move = d.moves[e.mode++ % d.moves.length];
    if (move === 'charge') {
      this.go(e, 'charge_wind', 50); e.face = p.x > e.x ? 1 : -1;
      this.text(e.x, e.y, d.height + 12, d.shout || 'RAAAH!', '#ff9a5a', 18); this.shake(4);
    } else if (move === 'vanish') { this.go(e, 'vanish', 24); sfx('zap'); }
    else this.go(e, 'cast', 40);
    return true;
  }

  // Three projectiles aimed around the hero (the boss's `proj` from foes.js)
  bossCast(e, p) {
    const kind = e.def.proj || 'bolt';
    for (const off of [-40, 0, 40]) this.addProj({ kind, team: 'foe', x: e.x + e.face * 30, y: clamp(p.y + off, FT + 14, FB), z: 52, vx: e.face * (PROJ_SPEED[kind] || 5), life: 240, dmg: { n: 1, s: 8, b: 2 } });
    sfx('zap');
  }

  updFoe(e, p) {
    const d = e.def;
    if (e.flash > 0) e.flash--;
    if (e.bubble) e.bubble.life--;
    if (e.state === 'dying') { e.t++; e.x += e.vx; e.vx *= 0.9; return; }
    if (e.root > 0) e.root--;
    if (e.quips && --e.quipT <= 0) { this.say(e, e.quips[Math.floor(Math.random() * e.quips.length)]); e.quipT = rnd(420, 780); } // a line every 7-13 s
    if (d.regen && e.hp < e.maxHp && this.tick % 60 === 0) { e.hp = Math.min(e.maxHp, e.hp + d.regen); this.burst(e.x, e.y, d.height * 0.6, C.heal, 2); } // revenants knit back together
    const toP = p.x - e.x, dy = p.y - e.y, adx = Math.abs(toP), pDead = p.state === 'dead';
    switch (e.state) {
      case 'enter': {
        if (e.x > this.cam + 40 && e.x < this.cam + W - 40) { this.go(e, 'approach'); break; }
        const s = e.x < this.cam + W / 2 ? 1 : -1; e.x += s * d.spd * 1.3; e.face = s; e.moving = true; break;
      }
      case 'hurt':
        e.t--; e.x += e.vx; e.vx *= 0.84; e.moving = false;
        if (e.t <= 0) { this.go(e, 'approach'); e.cd = Math.max(e.cd, 18); } break;
      case 'approach': {
        if (e.cd > 0) e.cd--;
        e.moving = false;
        if (e.root > 0 || pDead) break;
        e.face = toP > 0 ? 1 : -1;
        if (e.boss && --e.sp <= 0 && this.bossSpecial(e, p)) break;
        const want = d.ranged ? 260 : d.reach * 0.7;
        const tx = p.x - (e.x < p.x ? 1 : -1) * want, ty = p.y + (adx > 150 ? e.yoff : 0);
        let mx = tx - e.x, my = ty - e.y;
        for (const o of this.foes) {
          if (o === e || !alive(o)) continue;
          const sx = e.x - o.x, sy = e.y - o.y;
          if (Math.abs(sx) < 34 && Math.abs(sy) < 20) { mx += Math.sign(sx || 1) * 14; my += Math.sign(sy || 1) * 10; }
        }
        const m = Math.hypot(mx, my);
        if (m > 4) { e.x += (mx / m) * d.spd; e.y += (my / m) * d.spd * 0.7; e.moving = true; }
        const inRange = d.ranged ? (Math.abs(dy) < 22 && adx < 480 && adx > 110) : (adx < d.reach + 10 && Math.abs(dy) < 16);
        if (inRange && e.cd <= 0 && ((e.boss && !d.pack) || this.attackers() < 2) && p.z < 70) { this.go(e, 'windup', d.wind); e.moving = false; }
        break;
      }
      case 'windup':
        e.t--; if (!d.lunge) e.face = toP > 0 ? 1 : -1;
        if (e.t <= 0) {
          this.go(e, 'strike'); e.hitDone = false;
          if (d.ranged) { this.addProj({ kind: 'bolt', team: 'foe', x: e.x + e.face * 24, y: e.y, z: 44, vx: e.face * 6, life: 130, dmg: d.dmg }); sfx('zap'); }
          else sfx('swing');
        }
        break;
      case 'strike':
        e.t++;
        if (d.lunge) { if (e.t < 14) { e.x += e.face * 7; if (!e.hitDone) this.tryHit(e, p, d.reach * 0.5); } }
        else if (!d.ranged && e.t === 3) this.tryHit(e, p, d.reach);
        if (e.t >= 14) { this.go(e, 'recover', d.cd * 0.5); e.cd = d.cd; }
        break;
      case 'recover': e.t--; e.moving = false; if (e.t <= 0) this.go(e, 'approach'); break;
      case 'charge_wind': e.t--; e.y += clamp(dy, -1, 1) * 0.8; if (e.t <= 0) { this.go(e, 'charge'); e.hitDone = false; sfx('roar'); } break;
      case 'charge':
        e.t++; e.x += e.face * 9;
        if (!e.hitDone) this.tryHit(e, p, 40, { n: 2, s: 8, b: 4 }, 12);
        if (e.t > 80 || (e.face > 0 && e.x > this.cam + W - 50) || (e.face < 0 && e.x < this.cam + 50)) { this.go(e, 'recover', 60); this.shake(8); }
        break;
      case 'cast': e.t--; if (e.t === 10) this.bossCast(e, p); if (e.t <= 0) this.go(e, 'recover', 40); break;
      case 'vanish':
        e.t--; e.alpha = e.t / 24;
        if (e.t <= 0) {
          e.x = clamp(p.x - p.face * 90, this.cam + 40, this.cam + W - 40); e.y = p.y; this.go(e, 'appear', 16);
          for (let i = 0; i < 10; i++) this.parts.push({ k: 'smoke', x: e.x + rnd(-20, 20), y: e.y, z: rnd(10, 70), r: rnd(6, 12), life: 30, max: 30, col: 0x2a1020 });
        }
        break;
      case 'appear':
        e.t--; e.alpha = 1 - e.t / 16;
        if (e.t <= 0) { e.alpha = 1; e.face = p.x > e.x ? 1 : -1; this.go(e, 'windup', 14); }
        break;
    }
    e.y = clamp(e.y, FT + 14, FB);
    if (e.state !== 'enter') e.x = clamp(e.x, this.cam - 30, this.cam + W + 30);
  }

  /* ---------------- spells ---------------- */

  spellTick(p) {
    const k = p.key, t = p.t;
    if (k === 'paladin' && t === 12) {
      this.parts.push({ k: 'ring', x: p.x, y: p.y, r: 16, vr: 10, life: 22, max: 22, col: 0xffe08a });
      this.burst(p.x, p.y, 40, '#ffe08a', 20);
      for (const e of this.foes) if (alive(e) && Math.abs(e.x - p.x) < 185 && Math.abs(e.y - p.y) < 90)
        this.attackRoll(p, e, { n: 3, s: 8, b: 2 }, { knock: 12, dir: Math.sign(e.x - p.x) || 1, col: '#ffe08a', auto: true });
      const heal = Math.min(20, p.maxHp - p.hp); p.hp += heal;
      if (heal) this.text(p.x, p.y, p.def.height + 44, '+' + heal + ' HP', C.heal, 18);
      this.shake(8); sfx('boom');
    }
    if (k === 'druid' && t === 12) {
      for (const e of this.foes) if (alive(e) && e.x > this.cam && e.x < this.cam + W) {
        this.attackRoll(p, e, { n: 2, s: 6, b: 2 }, { knock: 0, col: C.heal, auto: true });
        if (alive(e)) e.root = 200;
        for (let i = 0; i < 5; i++) this.parts.push({ k: 'vine', x: e.x + rnd(-18, 18), y: e.y + rnd(-3, 3), h: 0, mh: rnd(18, 40) * (e.def.height / 55), curl: rnd(-1, 1), life: 200, max: 200 });
      }
      this.burst(p.x, p.y, 40, C.heal, 16); sfx('boom');
    }
    if (k === 'rogue' && t < 15) {
      const nx = clamp(p.x + p.face * 18, this.cam + 24, this.cam + W - 24);
      for (const e of this.foes) {
        if (!alive(e) || p.dashHit.has(e)) continue;
        const lo = Math.min(p.x, nx) - 24, hi = Math.max(p.x, nx) + 24;
        if (e.x > lo && e.x < hi && Math.abs(e.y - p.y) < 40) { p.dashHit.add(e); this.attackRoll(p, e, { n: 3, s: 6, b: 3 }, { knock: 6, dir: p.face, col: '#c8a8ff', auto: true }); sfx('hit'); }
      }
      if (t % 2 === 0) this.afterimage(p);
      p.x = nx;
    }
    if (k === 'bard' && t === 8) {
      this.addProj({ kind: 'wave', team: 'hero', x: p.x + p.face * 30, y: p.y, z: 30, vx: p.face * 9, life: 46, dmg: { n: 2, s: 8, b: 2 }, knock: 12, hit: new Set() });
      sfx('boom');
    }
  }

  afterimage(p) {
    const s = p.sprite;
    const g = this.add.image(s.x, s.y, s.texture.key, s.frame.name).setOrigin(s.originX, s.originY).setScale(s.scaleX, s.scaleY)
      .setFlipX(s.flipX).setTint(0x7a5aaa).setTintMode(Phaser.TintModes.FILL).setAlpha(0.55).setDepth(s.depth - 0.5);
    this.tweens.add({ targets: g, alpha: 0, duration: 240, onComplete: () => g.destroy() });
  }

  /* ---------------- projectiles, pickups, particles ---------------- */

  addProj(q) {
    q.t = 0;
    q.sprite = this.add.sprite(q.x, q.y - q.z, 'fx').play('fx:' + q.kind).setFlipX(q.vx < 0);
    this.proj.push(q);
  }

  updProj() {
    const p = this.p;
    for (const q of this.proj) {
      q.t++; q.x += q.vx; q.life--;
      if (q.team === 'foe') {
        if (p.state !== 'dead' && p.inv <= 0 && Math.abs(p.x - q.x) < 20 && Math.abs(p.y - q.y) < 20 && p.z < q.z + 20) { this.hurtPlayer(p, roll(q.dmg), Math.sign(q.vx), 5); q.life = 0; }
      } else {
        for (const e of this.foes) {
          if (!alive(e) || q.hit.has(e)) continue;
          if (Math.abs(e.x - q.x) < 42 && Math.abs(e.y - q.y) < 48) { q.hit.add(e); this.attackRoll(p, e, q.dmg, { knock: q.knock, dir: Math.sign(q.vx), col: '#bfe0ff', auto: true }); }
        }
      }
      if (q.x < this.cam - 90 || q.x > this.cam + W + 90) q.life = 0;
      if (q.life <= 0) q.sprite.destroy();
    }
    this.proj = this.proj.filter((q) => q.life > 0);
  }

  updMisc() {
    for (const o of this.parts) {
      o.life--;
      if (o.k === 'spark') { o.x += o.vx; o.z += o.vz; o.vz -= 0.3; if (o.z < 0) o.z = 0; }
      else if (o.k === 'ring') o.r += o.vr;
      else if (o.k === 'vine') o.h = Math.min(o.mh, o.h + 3);
      else if (o.k === 'smoke') o.z += 0.6;
    }
    this.parts = this.parts.filter((o) => o.life > 0);
    const p = this.p;
    for (const k of this.pickups) {
      k.t++;
      if (k.z > 0 || k.vz > 0) { k.vz -= 0.4; k.z += k.vz; if (k.z < 0) { k.z = 0; k.vz = Math.abs(k.vz) > 1.5 ? -k.vz * 0.4 : 0; } }
      if (p.state !== 'dead' && Math.abs(p.x - k.x) < 28 && Math.abs(p.y - k.y) < 20 && p.z < 30) {
        const h = Math.min(roll({ n: 2, s: 4, b: 12 }), p.maxHp - p.hp); p.hp += h;
        this.text(p.x, p.y, p.def.height + 10, `Potion of Healing +${h}`, C.heal, 16); sfx('heal'); k.t = 99999;
      }
      if (k.t >= 720) k.sprite.destroy();
    }
    this.pickups = this.pickups.filter((k) => k.t < 720);
  }

  /* ---------------- waves and camera ---------------- */

  updWaves() {
    const L = this.L, p = this.p, waves = [...L.waves, { ...L.boss, boss: true }];
    if (this.lock === null && this.wave < waves.length && this.cam >= waves[this.wave].at - 1) {
      const wv = waves[this.wave];
      this.lock = wv.at;
      if (wv.boss) {
        const bosses = wv.bosses.map((b, i) => ({ ...(typeof b === 'string' ? { type: b } : b), quiet: i > 0 }));
        this.queue = [...bosses, ...wv.add.map((t) => ({ type: t }))];
        this.bossTitle = wv.title || FOES[bosses[0].type].name;
        this.bossTotal = bosses.reduce((t, b) => t + FOES[b.type].hp, 0);
        this.packSize = bosses.length;
        if (wv.theme) this.enterArea(wv.theme, wv.place);
      } else this.queue = wv.foes.map((t) => ({ type: t }));
      this.spawnT = wv.boss ? (wv.theme ? 90 : 40) : 20; this.wave++;
    }
    const maxCam = this.lock !== null ? this.lock : (this.wave < waves.length ? waves[this.wave].at : waves[waves.length - 1].at);
    const target = p.x - W * 0.42;
    if (target > this.cam) this.cam = Math.min(maxCam, this.cam + Math.min(6, target - this.cam));
    if (this.lock !== null && !this.clearT) {
      const live = this.foes.filter(alive).length, cap = this.foes.some((e) => e.boss && alive(e)) ? Math.max(5, this.packSize + 1) : 4;
      if (this.queue.length && --this.spawnT <= 0 && live < cap) { const q = this.queue.shift(); this.spawn(q); this.spawnT = FOES[q.type].pack ? 28 : 55; }
      if (!this.queue.length && !live) { this.lock = null; sfx('go'); }
    }
  }

  // Fade into a different background mid-level (Vallaki's church for the final fight)
  enterArea(theme, place) {
    const cam = this.cameras.main;
    cam.fadeOut(350, 0, 0, 0);
    cam.once('camerafadeoutcomplete', () => {
      for (const l of this.layers) l.obj.destroy();
      this.layers = buildLayers(this, theme); this.theme = theme;
      this.bannerTop = this.L.name.toUpperCase(); this.bannerTitle = place; this.bannerT = 200;
      cam.fadeIn(450, 0, 0, 0);
    });
  }

  // For the HUD: this act's bosses as one health bar (a pack shares a bar). null = no bar.
  bossInfo() {
    if (!this.bossTotal || this.clearT) return null;
    let hp = 0, any = false;
    for (const e of this.foes) if (e.boss && alive(e)) { hp += Math.max(0, e.hp); any = true; }
    for (const q of this.queue) if (FOES[q.type].boss) { hp += FOES[q.type].hp; any = true; }
    return any ? { title: this.bossTitle, k: hp / this.bossTotal } : null;
  }

  step() {
    this.tick++;
    const p = this.p;
    this.updPlayer(p);
    for (const e of this.foes) this.updFoe(e, p);
    this.foes = this.foes.filter((e) => { if (e.state === 'dying' && e.t > 70) { e.sprite.destroy(); e.tag?.destroy(); e.bubble?.box.destroy(); return false; } return true; });
    this.updProj(); this.updMisc(); this.updWaves();
    if (this.bannerT > 0) this.bannerT--;
    Input.tick();
    if (p.state === 'dead' && p.t === 110) { this.ended = true; toDead(this, this.lvl); return; }
    if (this.clearT > 0 && ++this.clearT === 170) {
      this.ended = true;
      if (this.lvl < LEVELS.length - 1) toClear(this, this.lvl, p.hp, p.maxHp); else toWin(this);
    }
  }

  /* ---------------- drawing ---------------- */

  heroAnim(p) {
    const k = p.def.sprite;
    switch (p.state) {
      case 'attack': return [`${k}:attack${p.combo + 1}`, p.def.atkT];
      case 'spell': return [`${k}:cast`, p.def.dur];
      case 'heal': return [this.anims.exists(`${k}:heal`) ? `${k}:heal` : `${k}:cast`, HEAL_T];
      case 'hurt': return [`${k}:hurt`];
      case 'dead': return [`${k}:death`];
      default: return [p.z > 0 ? `${k}:jump` : p.moving ? `${k}:walk` : `${k}:idle`];
    }
  }

  foeAnim(e) {
    const k = e.def.sprite;
    switch (e.state) {
      case 'windup': return [`${k}:windup`, e.t + 1];
      case 'charge_wind': return [`${k}:windup`, 50];
      case 'strike': return [`${k}:attack`, 14];
      case 'hurt': return [`${k}:hurt`];
      case 'dying': return [`${k}:death`];
      case 'charge': return [`${k}:walk`, 0, 2.5];
      case 'cast': return [this.anims.exists(`${k}:cast`) ? `${k}:cast` : `${k}:attack`, 40];
      default: return [e.moving ? `${k}:walk` : `${k}:idle`];
    }
  }

  // Play an animation when it changes. `ticks` stretches it to fit the move's timing.
  syncAnim(e, [key, ticks, speed]) {
    const loops = key.endsWith(':idle') || key.endsWith(':walk');
    const token = loops ? key : key + '|' + e.seq;
    if (e.tok === token) return;
    e.tok = token;
    if (!this.anims.exists(key)) return;
    e.sprite.play(key);
    const anim = this.anims.get(key);
    e.sprite.anims.timeScale = ticks ? anim.duration / (ticks * TICK) : speed || 1;
  }

  // A speech bubble over an enemy's head for about 3 seconds (used for T's lines)
  say(e, line) {
    e.bubble?.box.destroy();
    const txt = this.add.text(0, 0, line, { fontFamily: FONT_BODY, fontStyle: '800', fontSize: '13px', color: C.ink, align: 'center', wordWrap: { width: 170 } }).setOrigin(0.5, 1);
    const w = txt.width + 16, h = txt.height + 10, g = this.add.graphics();
    g.fillStyle(0xeadfc6, 0.96).fillRoundedRect(-w / 2, -h - 8, w, h, 8).lineStyle(2, 0x0f0c14, 1).strokeRoundedRect(-w / 2, -h - 8, w, h, 8);
    g.fillStyle(0xeadfc6, 0.96).fillTriangle(-6, -9, 6, -9, 0, 0);          // the little tail pointing at the speaker
    txt.setPosition(0, -13);
    e.bubble = { box: this.add.container(0, 0, [g, txt]).setDepth(9450), life: 180 };
  }

  drawEnt(e, isHero) {
    const s = e.sprite, g = this.gGround;
    const sh = e.def.shadow * (1 - Math.min(e.z, 80) / 200);
    g.fillStyle(0x000000, 0.35).fillEllipse(e.x, e.y, sh * 2, e.def.shadow * 0.6);
    this.syncAnim(e, isHero ? this.heroAnim(e) : this.foeAnim(e));
    s.setPosition(Math.round(e.x), Math.round(e.y - e.z)).setFlipX(e.face < 0).setDepth(e.y + (isHero ? 0.1 : 0));
    let a = e.alpha ?? 1;
    if (e.state === 'dying' && e.t > 40) a *= Math.max(0, 1 - (e.t - 40) / 30);
    if (isHero && e.inv > 0 && e.state !== 'spell' && e.state !== 'heal' && e.state !== 'dead' && this.tick % 8 < 4) a *= 0.45;
    s.setAlpha(a);
    if (e.flash > 0) s.setTint(0xffffff).setTintMode(Phaser.TintModes.FILL); // white hit-flash
    else if (e.tint) s.setTint(e.tint).setTintMode(Phaser.TintModes.MULTIPLY); // e.g. each revenant's own colour
    else s.clearTint();
    if (e.tag) e.tag.setPosition(Math.round(e.x), Math.round(e.y - e.z - e.def.height - 6)).setAlpha(a);
    if (e.bubble) {
      const b = e.bubble;
      if (b.life <= 0 || e.state === 'dying') { b.box.destroy(); e.bubble = null; }
      else b.box.setPosition(Math.round(e.x), Math.round(e.y - e.z - e.def.height - 24)).setAlpha(Math.min(1, b.life / 20));
    }
  }

  render() {
    const cam = this.cameras.main;
    cam.scrollX = Math.round(this.cam);
    scrollLayers(this.layers, this.cam, this.tick);
    const g = this.gGround.clear(), top = this.gTop.clear();

    for (const k of this.pickups) {
      if (k.t > 600 && k.t % 10 < 5) { k.sprite.setVisible(false); continue; }
      g.fillStyle(0x000000, 0.3).fillEllipse(k.x, k.y, 16, 6);
      k.sprite.setVisible(true).setPosition(k.x, Math.round(k.y - k.z - 12 - Math.sin(k.t * 0.08) * 2)).setDepth(k.y);
    }
    for (const e of this.foes) this.drawEnt(e, false);
    this.drawEnt(this.p, true);
    for (const q of this.proj) {
      g.fillStyle(0x000000, 0.3).fillEllipse(q.x, q.y, 20, 6);
      q.sprite.setPosition(Math.round(q.x), Math.round(q.y - q.z)).setDepth(q.y);
      if (q.kind === 'wave') q.sprite.setAlpha(q.life / 46);
    }

    for (const e of this.foes) if (e.root > 0) {
      const s = e.def.height / 55; top.lineStyle(3, 0x5f9a3a, 1);
      for (let i = 0; i < 4; i++) { const x = e.x - 14 * s + i * 9 * s; top.beginPath(); top.moveTo(x, e.y + 2); top.lineTo(x + 6, e.y - 10 * s); top.lineTo(x - 2, e.y - 20 * s); top.strokePath(); }
    }
    for (const e of this.foes) if (e.state === 'charge_wind' && this.tick % 10 < 6) {
      const y = e.y - e.def.height - 16; top.fillStyle(0xffd460, 1).fillRect(e.x - 3, y - 22, 6, 15).fillRect(e.x - 3, y - 4, 6, 5);
    }
    for (const o of this.parts) {
      const a = o.life / o.max;
      if (o.k === 'spark') top.fillStyle(Phaser.Display.Color.HexStringToColor(o.col).color, a).fillRect(o.x, o.y - o.z, o.s, o.s);
      else if (o.k === 'ring') g.lineStyle(5, o.col, a).strokeEllipse(o.x, o.y, o.r * 2, o.r * 0.7);
      else if (o.k === 'vine') {
        top.lineStyle(3, 0x5f9a3a, Math.min(1, o.life / 30));
        const c = new Phaser.Curves.QuadraticBezier(new Phaser.Math.Vector2(o.x, o.y), new Phaser.Math.Vector2(o.x + o.curl * 14, o.y - o.h * 0.6), new Phaser.Math.Vector2(o.x - o.curl * 6, o.y - o.h));
        c.draw(top, 8);
        top.fillStyle(0x8fc85a, Math.min(1, o.life / 30)).fillRect(o.x - o.curl * 6 - 2, o.y - o.h - 2, 4, 4);
      } else if (o.k === 'smoke') top.fillStyle(o.col, a * 0.7).fillCircle(o.x, o.y - o.z, o.r);
    }
    if (this.theme === 'forest') {
      for (let k = 0; k < 16; k++) {
        const fx = (((hash(k) * W * 1.6 - this.cam * 0.5) % W) + W) % W, fy = 110 + hash(k + 40) * 230 + Math.sin(this.tick * 0.02 + k) * 12;
        top.fillStyle(0xe6f08c, 0.35 + 0.4 * Math.sin(this.tick * 0.05 + k * 2)).fillRect(this.cam + fx, fy, 2, 2);
      }
    }
    if (this.theme === 'abbey' || this.theme === 'manor') { // drifting snow
      for (let k = 0; k < 24; k++) {
        const fx = (((hash(k + 11) * W * 1.3 - this.cam * 0.6 + Math.sin(this.tick * 0.01 + k) * 20) % W) + W) % W, fy = (this.tick * (0.5 + hash(k + 5) * 0.6) + hash(k + 9) * H) % H;
        top.fillStyle(0xeef2ff, 0.55).fillRect(this.cam + fx, fy, 2, 2);
      }
    }
    if (this.theme === 'temple' || this.theme === 'church') { // rising amber motes / candle sparks
      const col = this.theme === 'temple' ? 0xffb347 : 0xffd98a;
      for (let k = 0; k < 14; k++) {
        const fx = (((hash(k + 3) * W * 1.5 - this.cam * 0.7) % W) + W) % W, fy = H - ((this.tick * (0.25 + hash(k + 1) * 0.3) + hash(k + 8) * H) % H);
        top.fillStyle(col, 0.3 + 0.35 * Math.sin(this.tick * 0.06 + k)).fillRect(this.cam + fx, fy, 2, 2);
      }
    }
    if (this.theme === 'castle') {
      for (let k = 0; k < 10; k++) {
        const fx = (((hash(k + 7) * W * 1.4 - this.cam * 0.7 + this.tick * 0.2) % W) + W) % W, fy = H - ((this.tick * (0.4 + hash(k) * 0.4) + hash(k + 3) * H) % H);
        top.fillStyle(0xff9a4a, 0.5).fillRect(this.cam + fx, fy, 2, 2);
      }
    }
  }
}
