/* KAGE — Utsushi, the Borrowed Face (act2.sub3): the art of the copy.

   The school: none of its own. A Hollow that took a living operative's stance and never gave it back, so it fights
   in borrowed forms and each form is another person's: Akari's Blink (it vanishes and is there, one short step, a violet
   mark on the floor where it will be), Akari's Twin Fang (two quick cuts, a glint on each blade, a tell as long as the
   original's), and the crescent of the moon (a half-circle of light thrown the length of the street). None of them is
   done well. Each is done a little slower than it was learned, which is the whole of its weakness: every stolen
   technique has a tell, and the tell is different for each. It moves as a mirror when it is waiting: Kage steps in, it
   steps out; Kage guards, it guards. And what it has seen Kage do twice, or a flurry, it turns aside with Kage's
   own parry (the ECHO), a copy of a copy that fails more often than the original.

   New technique: Stolen Moon (BOSS_ABILITIES.utsushiMoon). It raises one blade overhead and the air behind it holds a
   pale half-circle (the tell: a rising arc of light, a long beat); then the crescent is thrown, slow, wide and tall.
   Cut it in half with any swing (it breaks on a blade), guard it (it costs posture, not life), or go over it; run into it
   and it throws you down. In its second phase it throws it and follows it in with Stolen Fang.

   What it teaches: to read a tell. Three techniques, three tells (a mark on the floor, a glint on each blade, a half-
   circle of light), and the answer to each is different: turn to the mark and strike as it lands, guard the pair of cuts
   and punish the pause, cut the crescent. A Kage who mashes is read like a book: a spam is a copied move, and Utsushi
   knows it better than its owner. Less hurtful than Sayo, harder to predict than Tsugumi. */

const UTSUSHI_MOON = { dmg: 9, speed: 560, life: 1.5 };

// Stolen Moon: the blade overhead and a half-circle of light hanging behind it, then the crescent thrown slow
BOSS_ABILITIES.utsushiMoon = { id: 'utsushiMoon', cd: 5.5, range: [240, 720], chance: 0.6,
  run(f, w, ai) {
    const M = UTSUSHI_MOON, W = 0.5 * ai.p.windup;
    f.telegraph = W;
    f.startAbility({ dur: W + 0.55, rate: 24,
      pose: (f, t) => (t < W ? MOVES.tw5.w : MOVES.tw5.s),
      start(f) { f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, 'STOLEN MOON', f.accent || '#c9bdff'); AudioManager.play('orb', { pitch: 0.7 }); },
      update(f, w, t, dt) {
        f.vx = damp(f.vx, 0, 12, dt);
        if (t < W) {
          // the half-circle of light behind the raised blade, filling in as the throw nears
          const k = t / W;
          if (((t * 60) | 0) % 3 === 0) for (let i = 0; i < 2; i++) {
            const a = -Math.PI / 2 + (k * 2 - 1) * 1.2 * (i ? 1 : -1) * (1 - k * 0.2);
            w.fx.part({ x: f.x - f.facing * 20 * f.scale + Math.cos(a) * 90 * f.scale, y: f.y - 200 * f.scale + Math.sin(a) * 90 * f.scale, vx: 0, vy: 0, life: 0.18, size: 3.5, color: 'rgba(201,189,255,0.9)', type: 'spark', grav: 0, add: true });
          }
          return;
        }
        if (!this.thrown) {
          this.thrown = 1; f.facing = w.player.x > f.x ? 1 : -1;
          const pr = WeaponSystem.spawn(w, 'crescent', f, { dmg: M.dmg });
          // a slower, lighter crescent than the rage art's, and one a blade breaks
          pr.d = Object.assign({}, pr.d, { dmg: M.dmg, kd: 0, up: 0, imp: 2, stamp: null, deflect: 1 });
          pr.vx = f.facing * M.speed; pr.life = M.life; pr.y = f.y - 100 * f.scale;
          AudioManager.play('heavyswing', { pitch: 1.3 });
        }
        if (t > W + 0.3 && !this.tell) { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); }
      } });
  } };

FIGHT_STYLES.utsushi = {
  art: 'Utsushi · the borrowed forms',
  // it keeps its distance and throws what it has stolen, closing in only behind a stolen step
  tune: { pref: 215, aggr: 0.62, block: 0.22, parry: 0.15, dodge: 0.3, react: [0.1, 0.19], combo: [2, 3], punish: 0.8, grab: 0.06, jump: 0.08, dashIn: 0.15 },
  poise: 1,
  parriedStun: 0.75,
  footwork: { away: 0.5, stepIn: 140 },
  strings: [
    // the three stolen forms, each with its own tell (the techniques', on top of the string's)
    { seq: ['ab:stolenBlink'], range: [190, 700], w: 3 },
    { seq: ['ab:utsushiMoon'], range: [260, 720], w: 3 },
    // the copied Twin Fang, in its second phase
    { seq: ['ab:stolenFang'], range: [0, 250], w: 3, phase: 1 },
    // the borrowed string: short twin cuts and out, with its own fault: it always ends the same way
    { seq: ['weapon', 'weapon', 'weapon', 'back'], range: [0, 160], w: 2.5 },
    { seq: ['w:diagDown', 'w:diagUp', 'back'], range: [0, 175], w: 1.6 },
    // from range: the stolen dash (telegraphed)
    { seq: ['dash', 'weapon'], range: [250, 440], w: 1.4, tell: 0.26 },
    // a guard held in front of it: the grab, the cut onto the guard
    { seq: ['grab'], range: [0, 100], w: 4, when: (ai, p) => p.state === 'block' },
    { seq: ['w:down'], range: [0, 190], w: 3, tell: 0.2, when: (ai, p) => p.state === 'block' },
    // an airborne Kage: the rising cut
    { seq: ['w:up'], range: [0, 200], w: 6, when: (ai, p) => !p.grounded }
  ],
  init(f, world) {
    const ai = f.ai, update = ai.update.bind(ai);
    ai.update = function (dt) {
      update(dt);
      const w = this.world, p = w.player;
      if (!f.alive || !p || !p.alive || w.phase !== 'fight') return;
      const dist = Math.abs(p.x - f.x);
      // Kage's own parry, borrowed: a cut it has seen twice, or a flurry, is turned aside on the beat (the copy is
      // weaker than the original: it fails a third of the time)
      if (p.state === 'move' && p.move) {
        if (p.move !== this.utsSeen) {
          this.utsSeen = p.move;
          const id = p.move.id, seen = (this.utsLast || []).filter(x => x === id).length;
          const read = act2Mash(w) >= 6 || w.predictability(id) > 0.45 || seen >= 2;
          this.utsParry = chance(read ? 0.85 : 0.22) && !p.move.proj && p.move.kind !== 'grab' && !p.move.unb;
          this.utsLast = (this.utsLast || []).concat(id).slice(-4);
        }
        if (this.utsParry && act2Guard(this, p, dist, 0.075)) { this.utsParry = false; w.fx.popText(f, 'ECHO', '#c9bdff'); }
      } else this.utsSeen = null;
    };
  },
  decide(ai, p, dist, toward) {
    const f = ai.f, w = ai.world;
    if (!f.canAct()) return false;
    const mash = act2Mash(w);
    // a flurry: a copied move is a book it has read; it steps away and the whiff is its
    if (mash >= 6 && dist < 220 && chance(0.55)) { ai.plan = chance(0.5) ? 'retreat' : 'hold'; ai.t = rand(0.12, 0.22); return true; }
    // Kage's posture is failing: the full borrowed string into it
    if (p.guard < 40 && dist < 220 && chance(0.55)) { ai.startSeq(['dash', 'weapon', 'weapon', 'weapon']); return true; }
    // the mirror: while it waits it moves as Kage's mirror image would (he steps in, it steps out; he guards, it guards)
    if (dist > 140 && dist < 340 && p.grounded && chance(0.35)) { ai.plan = 'mirror'; ai.t = rand(0.35, 0.6); return true; }
    return false;
  },
  // the cut that answers its echo-parry, on a Kage still reeling from the deflection, is a critical
  crit(att, def, m) { return !!m.counter && def.deflected; },
  on: {
    // the echo-parry: the answer, a beat late, in Kage's own style
    parry(ai) { if (chance(0.8)) { ai.block = 0; ai.startSeq(['weapon'], rand(0.18, 0.26)); } },
    blocked(ai) { if (chance(0.45)) { ai.seq = null; ai.startSeq(['back'], 0.05); } },
    parried(ai) { ai.seq = null; ai.plan = 'retreat'; ai.t = 0.45; },
    hurt(ai) { if (ai.f.canAct() && chance(0.25)) { ai.plan = 'retreat'; ai.t = 0.3; } }
  }
};

// a sub-boss a step above Act I's: a little more stamina
Object.assign(ENEMIES.utsushi, { hp: 400, dmg: 1.3 });
