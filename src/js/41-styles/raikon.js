/* KAGE — Raikon, the Lightning Ascendant (act1.boss): Jigen-ryū dressed in red lightning.

   The school. Jigen-ryū (Satsuma) is the art of the first cut: the blade raised high and upright by the right shoulder
   (tonbo no kamae), one committed, overwhelming stroke delivered with the whole body, and the old saying of the school,
   "ni no tachi irazu": there is no need of a second sword. Raikon fights that way. He is big, slow to start and hard to
   move (heavy armour, good poise), and every cut he throws is meant to end the fight.

   His game plan, phase by phase:
     I   The Storm Gathers  Single cuts. From the tonbo he drops one guard-crushing overhead or kesa cut, then stands in
                            his follow-through: no second strike. From long range, Ichi no Tachi: the blade climbs into
                            tonbo with a long, clear tell, then he crosses half the roof in one lunging cut. A guard held
                            near him is answered by Tai-atari, a shoulder check that breaks a held guard. A jump-in is
                            met by Kiriage, the rising cut, as a critical.
     II  Redline            Tempo. A blocked cut is followed by Raikō-gaeshi, a short lightning-charged answer that
                            eats the rest of a guard; two-cut kesa / gyaku-kesa strings. Redline Counter becomes his
                            martial counter stance: a low, burning guard held for a long beat. Strike into it and it is
                            turned aside and answered with an unblockable critical; wait it out and the stance is spent,
                            his posture drained and his body open.
     III Lightning Ascendant Relentless. Raijin Daiko, the thunder drum: four great cuts on a steady beat that must be
                            parried in rhythm (each parry costs his posture; parry them all and he breaks). Between
                            engagements he steps out and zones with Thunder Swing's wave and Skyfall.

   How the player beats him: do not trade and do not mash (a whiff or a spammed blow is punished by a counter-hit
   critical that throws Kage across the roof). Wait for the committed cut, PARRY it (each parry visibly drains his
   posture; Ichi no Tachi parried leaves him reeling), punish the follow-through, and get out. Never sit in guard near
   him. Never attack into Redline; bait it out and punish the spent stance. In phase III parry the drum on the beat.

   Every technique here is reached from this style's strings and decide; the phase ability lists (the story's data)
   are unchanged. Redline Counter is replaced by a fuller counter stance; the reduced Redline variants of Act I's
   sub-bosses (RAIKON_VARIANTS) keep running the original code, which 40-ai.js captured when it registered them. */

// the first boss of the game: hard because he is skilled, not because of raw numbers (base 640 hp, 1.1 dmg)
Object.assign(ENEMIES.raikon, { hp: 640, dmg: 1.1 });

// Raikon's numbers (seconds are x the difficulty mode's windup where they are tells). `dmg` is the base blow: Combat.applyHit
// already multiplies a non-projectile blow by the attacker's dmgMul, so these techniques do not multiply by it again (the
// older abilities in 40-ai.js do, which squares the foe's multiplier; that is why the echo's numbers below are kept light).
const RAIKON_STYLE = {
  ichi: { cd: 6.5, windup: 0.8, dash: 1450, dashT: 0.22, dmg: 23, gb: 85, reel: 1.15, posture: 34, recover: 0.75 },
  taiAtari: { cd: 4.2, windup: 0.34, dash: 980, dashT: 0.16, dmg: 7, gb: 220 },
  gaeshi: { cd: 3.2, windup: 0.26, dmg: 11, gb: 48 },
  drum: { cd: 9, beat: 0.62, beats: 4, dmg: 13, gb: 42, posture: 22, gap: 0.24 },
  redline: { cd: 6.5, settle: 0.24, stance: [1.5, 1.25], punish: 0.1, dmg: 17, spent: 0.62, spentPosture: 38, hurtPosture: 24 },
  kiriage: { cd: 2.4 }
};

// his storm moves are zoning between engagements, not pressure: thrown less often, Thunder Swing from mid range only
// (these objects are Raikon's alone; the reduced variants carry their own numbers)
Object.assign(BOSS_ABILITIES.thunderSwing, { cd: 7, chance: 0.6, range: [210, 520] });
Object.assign(BOSS_ABILITIES.stormBreak, { cd: 6.5, chance: 0.5 });

/* ---- helpers ---- */
// run a technique from decide: its cool-down, the storm's answer on the blade (cosmetic), the code
function raikonUse(ai, id, p, o) {
  const a = BOSS_ABILITIES[id], f = ai.f, w = ai.world;
  if (!a || !f.canAct()) return false;
  ai.seq = null; ai.cds[id] = a.cd; a.run(f, w, ai, p, o);
  if (w.storm) StormDirector.ability(w, f, a);
  return true;
}
const raikonReady = (ai, id) => (ai.cds[id] || 0) <= 0;
// how hard Kage has been pressing: his blows on Raikon (struck, blocked, parried) in the last 2.5 s
function raikonPressure(ai) { const t = ai.world.time; ai._press = (ai._press || []).filter(x => t - x < 2.5); return ai._press.length; }

/* ---- Ichi no Tachi: tonbo, then one lunging cut across the roof ----
   Tell: the blade climbs into tonbo (overhead pose), eyes white, crackle and a red glint; super armour while he
   gathers. Then he crosses the gap in a single overhead cut. Parry it (he reels long and loses a lot of posture), dash
   through it (perfect dodge), or step back out of its reach: a whiff leaves him standing open in the follow-through.
   Blocking it holds, but it eats most of a guard. `o`: a Core echo's stutter (a false start that freezes back into
   tonbo before the real cut), tint, glitch, dmg, windup. */
BOSS_ABILITIES.ichiNoTachi = { id: 'ichiNoTachi', cd: RAIKON_STYLE.ichi.cd, range: [230, 560], chance: 0,
  run(f, w, ai, p, o) {
    o = o || {};
    const R = RAIKON_STYLE.ichi, W = (o.windup || R.windup) * ai.p.windup, S = o.stutter || 0;
    const T = W + S, D = R.dashT, dmg = (o.dmg || 1) * R.dmg;
    f.telegraph = T;
    f.startAbility({ dur: T + D + R.recover * (o.recover || 1), rate: 22, trail: true, charge: true,
      pose: (f, t) => (t < T ? (S && t > W - 0.05 && t < W + 0.14 ? RAIKON_POSE.swingBack : RAIKON_POSE.overhead) : t < T + D + 0.12 ? RAIKON_POSE.slam : POSES.land),
      start(f) { f.superArmor = true; f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, o.label || 'ICHI NO TACHI', o.tint || '#ff6a52'); corruptFrames(f, o); AudioManager.play('teleport', { pitch: 0.8 }); },
      update(f, w, t, dt) {
        if (t < T) {
          f.vx = damp(f.vx, 0, 10, dt);
          // the stutter: a twitch toward the cut that freezes back into tonbo (a Core echo's broken rhythm)
          if (S && t > W - 0.05 && t < W + 0.1) { f.vx = f.facing * 260; if (!this.twitch) { this.twitch = 1; f.telegraph = T - t; w.fx.popText(f, '...', o.tint || '#ff6a52'); AudioManager.play('swing', { pitch: 0.7 }); } }
          raikonCrackle(f, w, t, o.tint);
          if (!this.glint && t > T - 0.2) { this.glint = 1; raikonGlint(f, w, o.tint); }
          return;
        }
        if (t < T + D) {
          if (!this.go) { this.go = 1; f.superArmor = false; f.facing = w.player.x > f.x ? 1 : -1; AudioManager.play('heavyswing', { pitch: 0.8 }); w.fx.dust(f.x, 0, 10); }
          f.vx = f.facing * R.dash;
          if (((t * 60) | 0) % 2 === 0) w.fx.afterimage(f, o.tint ? 'rgba(167,123,255,0.32)' : 'rgba(255,74,60,0.32)');
          if (!this.hit) {
            this.hit = Combat.area(w, f, fbox(f, 0, -250, 180, 250), { dmg: dmg , kb: 640, up: -380, hs: 0.6, kd: 1, imp: 3, hsnd: 'heavy', stamp: 'ICHI', gb: o.gb || R.gb, tech: 'ichi' });
            if (f.abil !== this) return;   // parried: Combat.parry ended it
            if (this.hit) { f.vx = f.facing * 200; this.cutAt = t; w.fx.lightning(f.sk.wt.x, f.sk.wt.y - 80, f.sk.wt.x + f.facing * 60, 0, { w: 2.4, branches: 3, dur: 0.14, color: o.tint }); w.fx.shake(0.5); }
          }
          return;
        }
        f.vx = damp(f.vx, 0, 9, dt);
        if (!this.tell) { this.tell = 1; w.fx.popText(f, this.hit ? 'NO SECOND CUT' : 'OPENING', C.gold); if (!this.hit) AudioManager.play('land'); }
      },
      end(f) { f.superArmor = false; } });
  } };

/* ---- Tai-atari: the shoulder check that breaks a held guard ----
   Tell: he drops his shoulder and sets his feet (short, eyes white). Then a short charge: on a guard held longer than a
   parry it lands on posture for more than a full guard (the guard breaks) and he follows with a kesa cut on the open
   body; on anyone else it only shoves. Beat it: parry it as it comes (a fresh guard), step back out of it, or strike him
   hard in the tell (no armour while he sets his feet). */
BOSS_ABILITIES.taiAtari = { id: 'taiAtari', cd: RAIKON_STYLE.taiAtari.cd, range: [0, 180], chance: 0,
  run(f, w, ai, p, o) {
    o = o || {};
    const R = RAIKON_STYLE.taiAtari, W = R.windup * ai.p.windup, D = R.dashT;
    f.telegraph = W;
    f.startAbility({ dur: W + D + 0.45, rate: 24,
      pose: (f, t) => (t < W ? POSES.land : t < W + D + 0.1 ? MOVES.dp.s : MOVES.dp.f),
      start(f) { f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, o.label || 'TAI-ATARI', o.tint || '#ff6a52'); corruptFrames(f, o); AudioManager.play('block', { pitch: 0.7 }); },
      update(f, w, t, dt) {
        if (t < W) { f.vx = damp(f.vx, -f.facing * 40, 10, dt); return; }
        if (t < W + D) {
          f.vx = f.facing * R.dash;
          if (!this.hit) {
            const pl = w.player, held = pl.state === 'block';
            this.hit = Combat.area(w, f, fbox(f, 0, -200, 110, 200), { dmg: R.dmg , kb: 620, hs: 0.42, imp: 2, hsnd: 'heavy', stamp: 'TAI-ATARI', gb: R.gb, tech: 'tai' });
            if (f.abil !== this) return;
            if (this.hit) {
              f.vx = 0; w.fx.shake(0.45); w.fx.dust(f.x + f.facing * 40, 0, 8);
              // the held guard broke: the cut follows onto the open body (a blow on a broken guard is a critical)
              if (held && pl.broken) { f.endAbility(w); f.startMove('c1_diagDown', w); if (f.move) f.mdur[0] = Math.min(f.mdur[0], 0.16); return false; }
            }
          }
          return;
        }
        f.vx = damp(f.vx, 0, 12, dt);
      } });
  } };

/* ---- Raikō-gaeshi: the lightning answer to a blocked cut (phase II on) ----
   Short tell (crackle, glint), then a quick rising-diagonal cut charged with red lightning that lands on what is left
   of the guard. Parry it, or let the first cut go by instead of blocking it. */
BOSS_ABILITIES.raikoGaeshi = { id: 'raikoGaeshi', cd: RAIKON_STYLE.gaeshi.cd, range: [0, 240], chance: 0,
  run(f, w, ai, p, o) {
    o = o || {};
    const R = RAIKON_STYLE.gaeshi, W = R.windup * ai.p.windup;
    f.telegraph = W;
    f.startAbility({ dur: W + 0.5, rate: 26, trail: true, charge: true,
      pose: (f, t) => (t < W ? RAIKON_POSE.swingBack : RAIKON_POSE.diagonal),
      start(f) { f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, 'RAIKŌ-GAESHI', '#ff6a52'); AudioManager.play('orb', { pitch: 1.5 }); },
      update(f, w, t, dt) {
        if (t < W) { f.vx = damp(f.vx, 0, 12, dt); raikonCrackle(f, w, t); if (!this.glint && t > W - 0.14) { this.glint = 1; raikonGlint(f, w); } return; }
        if (!this.cut) { this.cut = 1; f.vx = f.facing * 520; AudioManager.play('heavyswing', { pitch: 1.1 }); w.fx.lightning(f.sk.wt.x, f.sk.wt.y, f.sk.wt.x + f.facing * 140, f.sk.wt.y - 90, { w: 2, branches: 3, dur: 0.12 }); }
        f.vx = damp(f.vx, 0, 10, dt);
        if (!this.hit && t < W + 0.14) this.hit = Combat.area(w, f, fbox(f, 0, -240, 175, 240), { dmg: R.dmg , kb: 380, up: -260, hs: 0.45, imp: 2, hsnd: 'slash', stamp: 'RAIKŌ', gb: R.gb, tech: 'gaeshi' });
      } });
  } };

/* ---- Raijin Daiko, the thunder drum (phase III) ----
   Four great cuts on a steady beat (RAIKON_STYLE.drum.beat): each one glints and crackles on the off-beat, steps in and
   falls on the beat. Every cut can be parried, and a parried cut does not end the drum: he reels a moment and the next
   beat comes. Each parry drains his posture; parry the whole rhythm and he breaks. Blocking each cut instead will break
   Kage's guard before the end. `from`: the beat to resume on (after a parry). */
BOSS_ABILITIES.raijinDaiko = { id: 'raijinDaiko', cd: RAIKON_STYLE.drum.cd, range: [0, 320], chance: 0,
  run(f, w, ai, p, from) {
    const R = RAIKON_STYLE.drum, B = R.beat * Math.max(0.85, ai.p.windup), k0 = typeof from === 'number' ? from : 0, n = R.beats - k0;
    const aims = [RAIKON_POSE.slam, RAIKON_POSE.diagonal, RAIKON_POSE.swingThrough, RAIKON_POSE.slam];
    const ups = [RAIKON_POSE.overhead, RAIKON_POSE.swingBack, RAIKON_POSE.swingBack, RAIKON_POSE.overhead];
    f.telegraph = B;
    f.startAbility({ dur: n * B + 0.55, rate: 22, trail: true, charge: true,
      pose: (f, t) => { const i = Math.min(n - 1, Math.floor(t / B)), u = t - i * B; return (u > B - 0.1 || (i > 0 && u < 0.14) ? aims : ups)[(k0 + i + (u < 0.14 && i > 0 ? -1 : 0)) % 4]; },
      start(f) { f.facing = w.player.x > f.x ? 1 : -1; if (!k0) { w.fx.popText(f, 'RAIJIN DAIKO', '#ff3b2f'); AudioManager.play('boss'); } },
      update(f, w, t, dt) {
        const i = Math.floor(t / B), u = t - i * B;
        if (i >= n) { f.vx = damp(f.vx, 0, 10, dt); if (!this.tell) { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); } return; }
        const beat = k0 + i;
        if (this.beat !== beat) { this.beat = beat; this.hit = false; this.cut = false; this.glint = false; f.facing = w.player.x > f.x ? 1 : -1; f.telegraph = B - u; }
        if (u < B - 0.1) { f.vx = damp(f.vx, f.facing * 120, 6, dt); raikonCrackle(f, w, t); if (!this.glint && u > B - 0.3) { this.glint = true; raikonGlint(f, w); } return; }
        if (!this.cut) { this.cut = true; f.vx = f.facing * 460; AudioManager.play('heavyswing', { pitch: 0.85 + beat * 0.05 }); w.fx.shake(0.25); }
        if (!this.hit) {
          this.hit = Combat.area(w, f, fbox(f, -10, -250, 190, 250), { dmg: R.dmg , kb: beat === R.beats - 1 ? 560 : 260, up: beat === R.beats - 1 ? -420 : -120, hs: 0.42, imp: 2, kd: beat === R.beats - 1 ? 1 : 0, hsnd: 'heavy', stamp: beat === R.beats - 1 ? 'DAIKO' : null, gb: R.gb, tech: 'drum', beat });
          if (f.abil !== this) return;
        }
        f.vx = damp(f.vx, 0, 8, dt);
      } });
  } };

/* ---- Redline Counter: the martial counter stance (replaces the original for Raikon) ----
   A low guard, the blade across his body, the red crescent burning round him for a long, readable beat (the stance
   pose never moves). Any melee blow from the front is turned aside and answered at once by an unblockable kesa cut
   that lands as a critical. Left alone the stance is SPENT: the crescent gutters, he loses a large share of posture
   and stands open for a moment, and every blow in that moment drains his posture further. `o`: stance length. */
BOSS_ABILITIES.redlineCounter = { id: 'redlineCounter', cd: RAIKON_STYLE.redline.cd, range: [60, 300], chance: 0.3,
  run(f, w, ai, p, o) {
    o = o || {};
    const R = RAIKON_STYLE.redline, P2 = R.punish * ai.p.windup;
    const S = o.stance || R.stance[ai.phase >= 2 ? 1 : 0];
    f.startAbility({ dur: S + R.spent, rate: 18, charge: true,
      pose: f => (f.abil && f.abil.cut ? RAIKON_POSE.diagonal : f.abil && f.abil.spentT != null ? POSES.land : RAIKON_POSE.guard),
      start(f) { f.redline = true; f.telegraph = R.settle; f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, 'REDLINE', '#ff6a52'); AudioManager.play('block'); },
      update(f, w, t, dt) {
        f.vx = damp(f.vx, 0, 12, dt);
        if (this.punish == null) {
          // the stance settles before it counters: a blow already on its way lands as a plain hit
          if (t < S) { if (t >= R.settle && !this.set) { this.set = 1; f.counterStance = true; } raikonCrackle(f, w, t); return; }
          // the stance is spent: the guard drops, posture drained, the body open
          if (this.spentT == null) {
            this.spentT = t; f.counterStance = false; f.redline = false; this.charge = false;
            if (f._redlineFx) { f._redlineFx.stop = true; f._redlineFx = null; }
            f.guard = Math.max(8, f.guard - R.spentPosture); f.postureDelay = 1.2; f.redlineSpent = true;
            w.fx.popText(f, 'SPENT', C.gold); AudioManager.play('land');
          }
          return;
        }
        const k = t - this.punish;
        if (k < P2) return;
        if (!this.cut) {
          this.cut = 1; f.vx = f.facing * 1100; AudioManager.play('heavyswing');
          w.fx.lightning(f.sk.wt.x, f.sk.wt.y - 60, f.sk.wt.x + f.facing * 160, f.sk.wt.y + 120, { w: 2.4, branches: 3, dur: 0.14 });
        }
        if (((t * 60) | 0) % 2 === 0) w.fx.afterimage(f, 'rgba(255,74,60,0.35)');
        if (!this.hit && k < P2 + 0.2) this.hit = Combat.area(w, f, fbox(f, -10, -230, 190, 230), { dmg: R.dmg , kb: 520, up: -380, hs: 0.55, kd: 1, imp: 3, hsnd: 'slash', stamp: 'REDLINE', unb: 1, tech: 'redline' });
        if (k > P2 + 0.2) f.vx = damp(f.vx, 0, 14, dt);
      },
      onCounter(f) { f.counterStance = false; this.charge = false; this.punish = this.t; this.dur = this.t + P2 + 0.55; f.telegraph = P2; if (f._redlineFx) { f._redlineFx.stop = true; f._redlineFx = null; } },
      end(f) { f.counterStance = false; f.redline = false; f.redlineSpent = false; if (f._redlineFx) { f._redlineFx.stop = true; f._redlineFx = null; } } });
  } };

/* ---- Kiriage: the rising cut that meets a jump-in ---- */
function raikonKiriage(ai, p, toward) {
  const f = ai.f, w = ai.world;
  if (!f.canAct() || !raikonReady(ai, 'kiriage') || !f.grounded) return false;
  ai.seq = null; ai.cds.kiriage = RAIKON_STYLE.kiriage.cd;
  f.facing = toward; f.startMove('c2_up', w);
  if (f.move) { f.mdur[0] = Math.min(f.mdur[0], 0.17); w.fx.popText(f, 'KIRIAGE', '#ff6a52'); }
  return !!f.move;
}

FIGHT_STYLES.raikon = {
  art: 'Jigen-ryū',
  // heavy and patient: he waits for the one cut, guards well, rarely dodges, and punishes everything
  tune: { pref: 175, aggr: 0.46, block: 0.4, parry: 0.14, dodge: 0.04, react: [0.17, 0.3], combo: [1, 2], punish: 0.8, grab: 0.05, jump: 0, kunai: 0, dashIn: 0 },
  poise: 0.75,           // a quarter harder to stagger
  postureRegen: 5,       // but what a parry takes stays taken: his posture comes back slowly
  parriedStun: 0.55,
  footwork: { away: 0.3, stepIn: 150 },
  strings: [
    // phase I on: the single cut from tonbo. One stroke, then he stands in it.
    { seq: ['w:down'], range: [0, 205], w: 2.2, tell: 0.24 },
    { seq: ['w:diagDown'], range: [0, 205], w: 1.6, tell: 0.2 },
    // stepping in with the horizontal cut from the edge of his reach
    { seq: ['fwd', 'w:fwd'], range: [150, 300], w: 1.2, tell: 0.18 },
    // a guard held in front of him: the shoulder
    { seq: ['ab:taiAtari'], range: [0, 175], w: 3, when: (ai, p) => p.state === 'block' && raikonReady(ai, 'taiAtari') },
    // from long range: Ichi no Tachi
    { seq: ['ab:ichiNoTachi'], range: [230, 560], w: 3, when: ai => raikonReady(ai, 'ichiNoTachi') },
    // phase II on: tempo, a kesa cut flowing into the rising return
    { seq: ['w:diagDown', 'w:diagUp'], range: [0, 200], w: 1.4, phase: [1, 2], tell: 0.2 },
    // phase III: the thunder drum
    { seq: ['ab:raijinDaiko'], range: [0, 300], w: 3, phase: 2, when: ai => raikonReady(ai, 'raijinDaiko') }
  ],
  init(f) { f.redlineSpent = false; },
  decide(ai, p, dist, toward) {
    const f = ai.f, w = ai.world;
    if (!f.canAct()) return false;
    // the drum resumes on the next beat after a parried cut
    if (ai.drumFrom != null) { const k = ai.drumFrom; ai.drumFrom = null; if (dist < 360) { const a = BOSS_ABILITIES.raijinDaiko; ai.seq = null; a.run(f, w, ai, p, k); return true; } }
    // a jump-in is met by the rising cut
    if (!p.grounded && dist < 250 && raikonKiriage(ai, p, toward)) return true;
    // a guard held near him is never safe: the shoulder, or the guard-crushing overhead
    if (p.state === 'block' && p.st > 0.35 && dist < 190 && chance(0.7)) {
      if (raikonReady(ai, 'taiAtari') && chance(0.65)) return raikonUse(ai, 'taiAtari', p);
      ai.startSeq(['w:down'], 0.2 * ai.p.windup); f.telegraph = Math.max(f.telegraph, 0.2 * ai.p.windup); return true;
    }
    // Redline (phase II on): when Kage presses him, or his posture is low, he settles into the counter stance
    if (ai.phase >= 1 && raikonReady(ai, 'redlineCounter') && p.state !== 'move' && dist > 70 && dist < 270 && (raikonPressure(ai) >= 2 || f.guard < 50) && chance(0.45)) return raikonUse(ai, 'redlineCounter', p);
    // phase III zanshin: after an exchange he steps out to zone with the wave and the sky
    if (ai.phase >= 2 && dist < 200 && raikonPressure(ai) >= 1 && chance(0.22)) { ai.plan = 'retreat'; ai.t = rand(0.35, 0.55); return true; }
    return false;
  },
  respond(ai, p, dist, toward, m) {
    // an air attack coming down on him: the rising cut
    if (!p.grounded && m && m.kind === 'air' && dist < 260) return raikonKiriage(ai, p, toward);
    return false;
  },
  // his own criticals: the Redline punish, and the rising cut on a body in the air
  // and the cut that answers his own parry (Kage's deflected blade)
  crit(att, def, m) { return m.tech === 'redline' || (m.aim === 'up' && !def.grounded) || (def.deflected && def.state === 'stun'); },
  on: {
    hurt(ai, w) {
      (ai._press = ai._press || []).push(w.time);
      // struck while the Redline stance is spent: every blow drains his posture further
      const f = ai.f;
      if (f.redlineSpent && f.state === 'ability') Budo.postureHit(w, f, RAIKON_STYLE.redline.hurtPosture / FIGHT_STYLES.raikon.poise, f.x, f.y - 120 * f.scale, -f.facing, w.player);
    },
    // a clean critical (a counter-hit in his wind-up, the riposte to a parry) rocks him: kuzushi
    critical(ai, w, by) { const f = ai.f; if (f.alive) Budo.postureHit(w, f, 12 / FIGHT_STYLES.raikon.poise, f.x, f.y - 120 * f.scale, -f.facing, by); },
    block(ai, w) { (ai._press = ai._press || []).push(w.time); },
    parry(ai, w) { (ai._press = ai._press || []).push(w.time); },
    // his cut was parried: the big committed cuts cost far more than a plain one
    parried(ai, w, by, m) {
      const f = ai.f, tech = m && m.tech;
      if (tech === 'ichi') {
        if (f.state === 'stun') f.stunT = Math.max(f.stunT, RAIKON_STYLE.ichi.reel);
        Budo.postureHit(w, f, RAIKON_STYLE.ichi.posture / FIGHT_STYLES.raikon.poise, f.x, f.y - 120 * f.scale, -f.facing, by);
        w.fx.popText(f, 'REELING', C.gold);
      } else if (tech === 'drum') {
        Budo.postureHit(w, f, RAIKON_STYLE.drum.posture / FIGHT_STYLES.raikon.poise, f.x, f.y - 120 * f.scale, -f.facing, by);
        // the drum goes on: a short reel, then the next beat
        if (f.state === 'stun' && !f.broken && m.beat < RAIKON_STYLE.drum.beats - 1) { f.stunT = RAIKON_STYLE.drum.gap; ai.drumFrom = m.beat + 1; ai.t = 0; }
      } else if (f.state === 'stun' && (tech === 'gaeshi' || (m && m.aim === 'down'))) f.stunT = Math.max(f.stunT, 0.7);
    },
    // a cut of his was blocked: phase I may shoulder into the guard; from phase II the lightning answer follows
    blocked(ai, w, by, m) {
      const f = ai.f;
      if (f.state !== 'move' || ai.seq) return;
      if (ai.phase >= 1 && raikonReady(ai, 'raikoGaeshi') && chance(ai.phase >= 2 ? 0.75 : 0.6)) { ai.cds.raikoGaeshi = BOSS_ABILITIES.raikoGaeshi.cd; ai.startSeq(['ab:raikoGaeshi']); }
      else if (raikonReady(ai, 'taiAtari') && chance(0.35)) ai.startSeq(['ab:taiAtari']);
    }
  }
};
