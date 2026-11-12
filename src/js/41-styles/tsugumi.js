/* KAGE — Tsugumi, the Memory Courier (act2.sub1): shurikenjutsu and footwork.

   The school: a courier's craft, light and never where the blow lands. The kunai is her first weapon: thrown from a
   good ten feet, one, two or a fan of three, so that the man who walks at her has to deal with the steel before he can
   deal with her. The knife (the twin short blades, tw1-tw5) is her second: she darts in behind her own kunai for a
   short string of quick cuts and is out again before the answer comes (zanshin: she never stays in the pocket). A Kage
   who jumps is a Kage who cannot move: a kunai finds him, and up close the rising knife meets him (a counter-hit
   critical). A Kage who dashes at her is met the same way. Chased and cornered she vanishes: Courier Step (the reduced
   Smoke Step, 40-ai.js) is her way out of a wall.

   New technique: Courier's Fan (BOSS_ABILITIES.tsugumiFan). She sets her feet, a glint on the pouch (the tell), and
   throws three kunai a beat apart, high, middle and low. Cut them out of the air, guard them (they are light, they
   cost little posture), or dash through; jumping into the fan is the one wrong answer.

   What it teaches: to deflect and to corner. Her kunai are thrown to be cut down (any swing of the blade deflects them)
   and the cut that deflects the last one is the beat in which she darts in: be ready to guard it, or parry the first
   knife, which leaves a light fighter reeling a long time (parriedStun, poise). Spamming is read: she is simply not
   where the flurry lands, and what you left behind is a whiff she punishes. Chasing her wastes the room: pressure her
   against a wall and her footwork is gone. The lightest and quickest of Act II's four, the first test of the act. */

function tsugumiMash(w) {
  const a = w.hitLog || [], t0 = w.time - 4; let n = 0;
  for (const x of a) if (x.t > t0) n++;
  return n;
}
// no room behind her: against a wall of the stage
function tsugumiCornered(f, w) { return f.x < w.bounds.l + 110 || f.x > w.bounds.r - 110; }

// Courier's Fan: the glint on the pouch, then three kunai a beat apart at three heights
BOSS_ABILITIES.tsugumiFan = { id: 'tsugumiFan', cd: 6, range: [220, 560], chance: 0.55,
  run(f, w, ai) {
    const W = 0.4 * ai.p.windup, gap = 0.12;
    f.telegraph = W;
    f.startAbility({ dur: W + gap * 3 + 0.4, rate: 24,
      pose: (f, t) => (t < W ? MOVES.kunai.w : MOVES.kunai.s),
      start(f) { f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, "COURIER'S FAN", f.accent || '#a98ad8'); AudioManager.play('teleport', { pitch: 1.5 }); },
      update(f, w, t, dt) {
        f.vx = damp(f.vx, 0, 10, dt);
        if (t < W) { if (!this.g && t > W * 0.6) { this.g = 1; w.fx.glint(f.sk.fha.x, f.sk.fha.y, '#d8ccff'); } return; }
        const i = ((t - W) / gap) | 0;
        if (i < 3 && i !== this.i) {
          this.i = i; f.facing = w.player.x > f.x ? 1 : -1;
          const pr = WeaponSystem.spawn(w, 'kunai', f, { dmg: 5 });
          pr.vy += (i - 1) * 300;   // high, middle, low
          AudioManager.play('throw', { pitch: 1.1 + i * 0.08 });
        }
        if (i >= 3 && !this.tell) { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); }
      } });
  } };

FIGHT_STYLES.tsugumi = {
  art: 'Shurikenjutsu',
  // keeps ten feet between them, throws, and comes in only behind her own steel
  tune: { pref: 235, aggr: 0.66, block: 0.1, parry: 0.06, dodge: 0.36, react: [0.08, 0.17], combo: [2, 3], punish: 0.85, grab: 0.04, jump: 0.04, dashIn: 0.12 },
  poise: 1.2,                     // light: her guard does not hold a heavy blow...
  parriedStun: 0.85,              // ...and a parried light fighter is off her line for a long beat
  footwork: { away: 0.78, stepIn: 150 },
  strings: [
    // two kunai from range, the second as he commits to the first
    { seq: ['move:kunai', 'wait:0.26', 'move:kunai'], range: [220, 620], w: 3, tell: 0.1 },
    // a kunai, then in behind it: two cuts and out
    { seq: ['move:kunai', 'dash', 'weapon', 'weapon', 'back'], range: [190, 440], w: 2.6, tell: 0.12 },
    // the fan (the tell is the technique's own)
    { seq: ['ab:tsugumiFan'], range: [240, 560], w: 2 },
    // the sudden dash cut from range: telegraphed (the one blow to parry)
    { seq: ['dash', 'weapon'], range: [260, 480], w: 1.6, tell: 0.26 },
    // up close: the short knife string, then out of the pocket
    { seq: ['weapon', 'weapon', 'weapon', 'back'], range: [0, 160], w: 3 },
    { seq: ['weapon', 'weapon', 'back', 'move:kunai'], range: [0, 160], w: 2 },
    { seq: ['w:diagDown', 'w:diagUp', 'back'], range: [0, 175], w: 1.5 },
    // a guard held in front of her: the cuts, then the grab under it
    { seq: ['weapon', 'weapon', 'grab'], range: [0, 105], w: 4, when: (ai, p) => p.state === 'block' },
    { seq: ['w:down'], range: [0, 190], w: 2, tell: 0.18, when: (ai, p) => p.state === 'block' },
    // an airborne Kage: steel at range, the rising knife up close
    { seq: ['move:kunai'], range: [170, 600], w: 7, when: (ai, p) => !p.grounded },
    { seq: ['w:up'], range: [0, 190], w: 7, when: (ai, p) => !p.grounded }
  ],
  init(f, world) {
    f.ammo = f.maxAmmo = 99;       // a courier's pouch is never empty; the strings and cool-downs pace the steel
    const ai = f.ai, update = ai.update.bind(ai);
    ai.update = function (dt) {
      update(dt);
      const w = this.world, p = w.player;
      if (!f.alive || !p || !p.alive || w.phase !== 'fight') return;
      const dist = Math.abs(p.x - f.x), toward = Math.sign(p.x - f.x) || 1;
      // taisabaki: on the beat the blow would land she is not there (a dash: its frames are invulnerable), or, when his
      // habits are read (a flurry, a move repeated), the crossed knives turn it aside (a parry). Either way the blow cuts
      // air or is deflected, and what follows is hers.
      if (p.state === 'move' && p.move) {
        if (p.move !== this.tsuSeen) {
          this.tsuSeen = p.move;
          const read = tsugumiMash(w) >= 6 || w.predictability(p.move.id) > 0.45;
          this.tsuPlan = read ? (chance(0.8) ? 'parry' : null) : chance(0.35) ? 'dash' : null;
        }
        const ready = this.tsuPlan && p.mphase === 0 && p.mdur[0] - p.mt < (this.tsuPlan === 'parry' ? 0.075 : 0.1) && this.threatened(p, dist);
        if (ready && f.grounded && (f.canAct() || (f.state === 'move' && f.mphase === 2 && this.tsuPlan === 'dash'))) {
          if (this.tsuPlan === 'parry' && f.canAct()) {
            this.tsuPlan = null; this.seq = null; this.block = 0.3; f.ctrl.blockHeld = true; f.setState('block'); f.blockT = 0; f.facing = toward;
            return;
          }
          if (this.tsuPlan === 'dash' && f.dashCd <= 0 && !f.ctrl.dashP) {
            this.tsuPlan = null; this.seq = null; this.block = 0;
            f.ctrl.dashP = true; f.ctrl.dir = tsugumiCornered(f, w) ? toward : -toward;
            return;
          }
        }
      } else this.tsuSeen = null;
      // she punishes a jump or a dash the moment she sees it (her own eyes, not the decision clock)
      if (this.seq || !f.canAct() || (this.cds.tsugumiPunish || 0) > 0) return;
      const committed = (!p.grounded && p.state !== 'hit' && p.state !== 'juggle') || p.state === 'dash';
      if (!committed || dist < 90 || dist > 520) return;
      this.cds.tsugumiPunish = rand(1.5, 2.1);
      this.t = Math.max(this.t, 0.3);
      if (dist < 200 && !p.grounded) this.startSeq(['w:up'], 0.06);
      else this.startSeq(['move:kunai'], 0.04);
    };
  },
  decide(ai, p, dist, toward) {
    const f = ai.f, w = ai.world;
    if (!f.canAct()) return false;
    ai.t = Math.min(ai.t, rand(0.14, 0.3) * ai.p.idle);   // quick-thinking: she is never standing still for long
    // against a wall with Kage on her: the smoke (Courier Step), else she fights out of it
    if (tsugumiCornered(f, w) && dist < 200 && chance(0.65) && (ai.cds.courierStep || 0) <= 0 && BOSS_ABILITIES.courierStep) {
      ai.cds.courierStep = BOSS_ABILITIES.courierStep.cd; BOSS_ABILITIES.courierStep.run(f, w, ai, p); return true;
    }
    // a flurry: she does not trade into it (a blow thrown into his wind-up is a counter-hit on her). She stays beside it
    // and lets it cut air (the dash on the beat, above), steel at range, and the whiff is hers.
    if (tsugumiMash(w) >= 6) {
      if (dist > 230 && chance(0.7)) { ai.startSeq(['move:kunai']); return true; }
      ai.plan = chance(0.4) ? 'retreat' : 'hold'; ai.t = rand(0.1, 0.2); return true;
    }
    // Kage's posture is failing: in with the full string
    if (p.guard < 40 && dist < 280 && chance(0.55)) { ai.startSeq(['dash', 'weapon', 'weapon', 'weapon', 'back']); return true; }
    // too close for a thrower: out, and a kunai from the new distance
    if (dist < 105 && !tsugumiCornered(f, w) && chance(0.4)) { ai.startSeq(['back', 'move:kunai']); return true; }
    return false;
  },
  // a flurry is read: she is out of its way at once (a dash back) and the whiff is hers
  respond(ai, p, dist, toward, m) {
    const f = ai.f, w = ai.world;
    if (!f.canAct() || !f.grounded || m.kind === 'throw' || m.proj || f.dashCd > 0 || tsugumiCornered(f, w)) return false;
    if (dist < 230 && (tsugumiMash(w) >= 7 || w.predictability(m.id) > 0.45) && chance(0.75)) { f.ctrl.dashP = true; f.ctrl.dir = -toward; return true; }
    return false;
  },
  // her rising knife into a Kage in the air, and her cut at a Kage who dashes at her, are counter-hits
  crit(att, def) { return !def.grounded || def.state === 'dash'; },
  on: {
    // the string over: out of the pocket, steel as she goes
    land(ai, w, other) { if (chance(0.35) && !ai.seq && Math.abs(other.x - ai.f.x) < 150) ai.startSeq(['back', 'move:kunai'], 0.12); },
    // blocked: she does not trade; she is gone
    blocked(ai) { if (chance(0.55)) { ai.seq = null; ai.startSeq(['back', 'move:kunai'], 0.04); } },
    // her knives turned a cut aside: the answer from inside the cross, a beat later than a reflex
    parry(ai) { if (chance(0.85)) { ai.block = 0; ai.startSeq(['weapon', 'back'], rand(0.16, 0.24)); } },
    // parried: the long, light recoil, then she circles out
    parried(ai) { ai.seq = null; ai.plan = 'retreat'; ai.t = 0.5; },
    // struck: slip out rather than stand in a combo
    hurt(ai, w, other) { if (ai.f.canAct() && chance(0.35)) { ai.plan = 'retreat'; ai.t = 0.35; } }
  }
};

// a sub-boss a little harder than before: a touch more stamina and a sharper knife
Object.assign(ENEMIES.tsugumi, { hp: 380, dmg: 1.06 });
