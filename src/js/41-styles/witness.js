/* KAGE — the Witness, Architect of Echoes (core.witness): Kage's own art, perfected.

   The school. The Witness was built from every duel Kage ever fought (the Echo System keeps them all), so its martial art
   is his: the cuts he throws, the guard he raises, the way he steps out of a string, only without the mistakes. It
   carries Mugen no Ha, a greatsword as long as it is tall, and uses it the way a master of the great sword (odachi,
   tachi-jutsu) does: heavy, committed cuts on a steady beat, the blade drawn back (a heave) before every one so that
   the beat can be read, and a guard that gives only to rhythm. Its mastery is also the exam of the whole game. Raikon
   taught Kage to parry a heavy cut and to respect a counter stance; Akari, not to chase and to watch his back; Takashi,
   the deflection duel. The Architect asks for all of them, in order, one phase each, and then for everything at once.

   Its game plan, phase by phase:
     I   The Observer     THE MIRROR. It plays Kage's own habits back at him: his latest string, in his own rhythm, in
                          the greatsword's cuts (WitnessBoss.mirror), a little slower than he threw it and lighter. A
                          varied player gets a varied, readable opponent. A player who leans on one move is read: the
                          Phantom Counter steps in behind him (watch your back), the spam read and the adaptation parry
                          the move, and its answer to a repeated move is a critical. Echo Combo's beats are heavy and
                          each can be parried; a parried beat ends the string and the Witness reels.
     II   The Manipulator SPACE AND CONTROL. It keeps its distance and works the room: the waves along the floor, the
                          orbs, the folds behind him, the copies of itself, and the hand that takes his controls (bind,
                          reverse, delay, rage suppression). Every modifier is warned and has its counter-play, and the
                          director never stacks one on another, nor on a string of cuts: after a modifier bites it
                          holds its blade for a moment (WitnessBoss.calm, WITNESS_PACE.ctrlGap).
     III  The Reality Editor THE DUEL. The greatsword strings must be turned aside in rhythm: a parried beat no longer
                          ends the Echo Combo, it comes back on the next beat, and each parry takes its posture, so the
                          string either breaks the Architect or breaks Kage's guard. It deflects Kage's cuts in turn
                          (Kage is deflected and the answer comes: guard again as its glint breaks and the roles
                          swap), and Mirror Guard is the counter stance: strike into it and the riposte is a critical;
                          wait it out and it is spent and open. The floor, the drain and the well are the room it
                          fights in, never more than one at a time.
     IV   The True Witness EVERYTHING. The domain opens (the three anchors, each giving back some control); the mirror,
                          the duel, the hazards and Final Judgment, with its timing varied and the tempo up. It punishes
                          hiding behind a guard. Posture decides it.

   Posture on a very long fight. It has several times a boss's health, so the posture break is how Kage earns big
   damage. Its poise is high in the first phase and falls as the phases advance (WitnessStyle.base), and falls further
   whenever it is in the recovery of its own cut or has swung at nothing. A posture break is a real event: it stays
   open for a long beat (`open` below), and every blow in it is a critical. Kage can also bring it down by deflecting a
   riposte, by turning the Final Judgment's flash back, and by waiting out Mirror Guard.

   How the player beats it: do not mash (it reads it, and punishes it with a critical); vary the strikes; parry the heavy
   beats on the glint (each parry is posture); when it deflects you, do not panic: guard again as the answer comes; do not
   attack into Mirror Guard; do not chase it when it steps out; look behind you when the copy appears; read every warning
   (each modifier, hazard and domain rule is shown before it bites and has its way out); and when its posture breaks, do
   not hold back.

   Everything here the director, AI and the phase machine call is in 69-witness.js (it loads after this file: the style
   only names abilities, it never runs them at load time). The numbers are tuned here over WITNESS_*. */

// a very long fight, but one a good player finishes in a few minutes: fewer hit points than the data's 3600, a lighter
// hand per blow (the beats are slow and heavy, so a blow that lands matters)
Object.assign(ENEMIES.witness, { hp: 3000, dmg: 1.0 });

// the fight's pace and the new rules' numbers (WITNESS_PACE is the Witness's alone)
//   idle   the longest it stands free before the director makes it act (per phase)
//   calm   seconds after a modifier bites before the Witness may start a cut        ctrlGap  seconds between two control moves
//   mirror cooldown, the tell before it starts, its tempo (1 = Kage's own) and its damage
Object.assign(WITNESS_PACE, { idle: [1.1, 0.95, 0.8, 0.65], combo: 0.4, calm: 0.7, ctrlGap: [5, 4.4, 3.8, 3.2],
  mirrorCd: 4, mirrorTell: 0.34, mirrorSpeed: 0.85, mirrorDmg: 0.8 });

// The numbers below are written for how a blow of the Witness's lands. An ability's blow goes through Combat.area with
// `dmg * f.dmgMul` and Combat.applyHit scales it by the attacker's multiplier once more, so its damage multiplier counts
// TWICE (squared), while the blade's own strings (the style's cuts, the mirror) count it once, times the weapon's level.
// The multiplier is chosen for the strings (above); the abilities' numbers carry the other half (x WT_QUAD).
const WT_QUAD = 1;
for (const id of ['echoBreaker', 'orbPulse', 'orbitBlades', 'voidSlash', 'echoStep', 'phantomCounter', 'mirrorSelf', 'forcedEchoStep', 'gravityCollapse',
  'executionFrames', 'falseDeath', 'absoluteControl', 'echoExecution', 'finalJudgment']) WITNESS_MOVES[id].dmg = Math.round(WITNESS_MOVES[id].dmg * WT_QUAD);
WITNESS_MOVES.echoBreaker.wave.dmg = Math.round(WITNESS_MOVES.echoBreaker.wave.dmg * WT_QUAD);

// the greatsword's string: heavy, readable beats (`heave` of the beat's span is the wind-up a parry reads), a longer rhythm
// than the data's 0.4 s and a lighter cut, the floor waves and the cleave keeping their weight
Object.assign(WITNESS_MOVES.echoCombo, { cd: 3.4, every: 0.54, heave: 0.46, heaveLast: 0.62, dmg: 20, finisher: 40, gb: 1.5 });
WITNESS_MOVES.echoCombo.wave = { speed: 860, h: 96, dmg: 24 };
Object.assign(WITNESS_MOVES.echoBreaker, { cd: 8 });
// Mirror Guard (phases III and IV): the counter stance (see BOSS_ABILITIES.mirrorGuard in 69-witness.js)
//   stance the stance's length (x stance4 in phase IV)  riposte the tell of the answer  dmg / gb its cut  spent the posture
//   it loses when the stance runs out unused  spentT how long it stands open then
WITNESS_MOVES.mirrorGuard = { label: 'MIRROR GUARD', cd: 7.5, range: [60, 360], chance: 0.6, windup: 0.42, startup: 0.1, active: 1.0, recovery: 0.4,
  stance: 1.05, stance4: 0.85, spentT: 0.6, riposte: 0.38, dmg: 34, gb: 62, spent: 26 };
// a denied judgment: the longest opening of the fight, and its posture torn
Object.assign(WITNESS_MOVES.finalJudgment, { stagger: 1.8, posture: 45 });
for (const id of ['echoBind', 'reversal', 'inputDelay']) WITNESS_MOVES[id].cd += 2;

// the duel phases carry Mirror Guard
ENEMIES.witness.phases[2].abilities.push('mirrorGuard');
ENEMIES.witness.phases[3].abilities.push('mirrorGuard');

// posture: how long it stands open when its posture breaks (by phase), how much it keeps afterwards
const WITNESS_OPEN = { stun: [2.6, 2.4, 2.2, 2.0], keep: 42 };
// the duel: the chance it turns a cut of Kage's aside (when its guard can be up), by phase
const WITNESS_DUEL = { deflect: [0, 0.1, 0.34, 0.4], riposte: 0.36 };

// What it chooses to do, phase by phase: the weights of its plays (wtPlan). A play is one of: `mirror` Kage's string played
// back (needs a string to play), `combo` Echo Combo, `string` one of the style's strings, `breaker` Echo Breaker, `guard`
// Mirror Guard (x2.5 when Kage presses it or its posture is low), `range` one of the ranged moves of the phase's pool,
// `control` one of the phase's control moves (the modifiers, the floor, the tether, ...: the director's CONTROL gap applies).
const WITNESS_PLAYS = [
  { mirror: 6, combo: 1.4, string: 1.6, range: 1.0, breaker: 0.3 },
  { combo: 1.0, string: 1.0, range: 2.0, breaker: 0.6, control: 2.4 },
  { combo: 2.2, string: 1.6, guard: 1.2, range: 0.7, breaker: 0.4, control: 1.5 },
  { combo: 1.6, string: 1.4, mirror: 0.5, guard: 1.0, range: 0.7, breaker: 0.5, control: 1.8 }
];
const WITNESS_POOLS = {
  range: [['voidSlash', 'echoStep', 'orbitBlades'], ['voidSlash', 'orbPulse', 'echoStep'], ['voidSlash', 'orbPulse'], ['voidSlash', 'orbPulse', 'echoStep']],
  control: [[], ['echoBind', 'reversal', 'inputDelay', 'mirrorSelf', 'rageSuppression', 'forcedEchoStep'],
    ['realityRewrite', 'healthDrain', 'gravityCollapse', 'executionFrames', 'falseDeath'], ['absoluteControl', 'nullProtocol', 'echoExecution', 'timelineBreak', 'finalJudgment']]
};
function wtPlan(ai, p, dist) {
  const f = ai.f, w = ai.world, W = w.wit, ph = ai.phase, T = WITNESS_PLAYS[ph], list = (ai.phaseData && ai.phaseData.abilities) || [], opts = [];
  const tempo = (ai.phaseData && ai.phaseData.tempo && ai.phaseData.tempo.cd) || 1;
  const ready = id => { const a = BOSS_ABILITIES[id]; return !!a && list.includes(id) && (ai.cds[id] || 0) <= 0 && dist >= a.range[0] && dist <= a.range[1] && (!a.cond || a.cond(f, w, ai, p, dist)); };
  const run = id => { const a = BOSS_ABILITIES[id]; ai.seq = null; ai.cds[id] = a.cd * tempo; a.run(f, w, ai, p); return true; };
  const add = (kind, wt, fn) => { if (wt > 0 && fn) opts.push({ kind, wt: wt * (kind === W.lastPlay ? 0.5 : 1), fn }); };
  const of = ids => { const r = ids.filter(ready); return r.length ? () => run(pick(r)) : null; };
  const pressed = wtPressure(ai) >= 2 || f.guard < 55;
  add('mirror', T.mirror, W.mirrorT <= w.time && dist < 340 && w.hitLog.length ? () => WitnessBoss.mirror(ai, p) : null);
  add('combo', T.combo, ready('echoCombo') ? () => run('echoCombo') : null);
  add('string', T.string, () => ai.tryString(p, dist));
  add('breaker', T.breaker, ready('echoBreaker') ? () => run('echoBreaker') : null);
  add('guard', (T.guard || 0) * (pressed ? 2.5 : 1), ready('mirrorGuard') && dist > 70 && dist < 300 && p.state !== 'move' ? () => run('mirrorGuard') : null);
  add('range', T.range, of(WITNESS_POOLS.range[ph]));
  add('control', T.control, of(WITNESS_POOLS.control[ph]));
  // weighted order without replacement: the first play that can start does
  while (opts.length) {
    let total = 0; for (const o of opts) total += o.wt;
    let r = Math.random() * total, i = 0;
    for (; i < opts.length - 1; i++) { r -= opts[i].wt; if (r <= 0) break; }
    const o = opts.splice(i, 1)[0];
    if (o.fn()) { W.lastPlay = o.kind; return true; }
  }
  return false;
}

function wtString(ai, seq, tell) {
  const f = ai.f, t = (tell || 0) * ai.p.windup;
  if (t) { f.telegraph = Math.max(f.telegraph, t); AudioManager.play('teleport'); }
  ai.startSeq(seq, t);
  return true;
}
const wtReady = (ai, id) => (ai.cds[id] || 0) <= 0;
// how hard Kage has been pressing: his blows on the Witness (struck, blocked, parried) in the last 2.5 s
function wtPressure(ai) { const t = ai.world.time; ai._press = (ai._press || []).filter(x => t - x < 2.5); return ai._press.length; }

FIGHT_STYLES.witness = {
  art: 'Mugen-ryū · Kage-no-kagami',
  // patient and exact: it keeps the greatsword's distance, guards well, rarely dodges, and punishes everything
  tune: { pref: 175, aggr: 0.5, block: 0.34, parry: 0.1, dodge: 0.1, react: [0.15, 0.27], combo: [1, 3], punish: 0.8, grab: 0, kunai: 0, jump: 0.02, dashIn: 0.2 },
  // poise reads WitnessStyle.k each blow: 0.72 in the first phase, rising to 1, and worse in its own recovery
  get poise() { return WitnessStyle.k; },
  postureRegen: 7,     // what a parry takes stays taken for a while
  parriedStun: 0.55,
  footwork: { away: 0.35, stepIn: 160 },
  strings: [
    // the lunging cut from the edge of its reach: it closes the gap and it is the first thing Kage learns to read
    { seq: ['w:fwd'], range: [130, 320], w: 1.6, tell: 0.3 },
    // kesa and the rising return: a guard raised against the first is the wrong one for the second
    { seq: ['w:diagDown', 'w:diagUp'], range: [0, 215], w: 1.4, phase: [0, 1], tell: 0.28 },
    // three directions, each flowing out of the last (Kage's own directional combo, DIR_COMBO)
    { seq: ['w:diagDown', 'w:fwd', 'w:down'], range: [0, 215], w: 1.3, phase: [1, 2, 3], tell: 0.3 },
    { seq: ['w:up', 'w:down'], range: [0, 200], w: 1, phase: [2, 3], tell: 0.28 }
  ],
  init(f) { f.wOpen = 0; f.wOver = 0; f.wRipUntil = 0; },
  decide(ai, p, dist, toward) {
    const f = ai.f, w = ai.world, W = w.wit;
    if (!W || W.state !== 'fight') return false;
    // reeling (hit, stunned, thrown): nothing is chosen yet; it chooses the moment it stands free again
    if (!f.canAct()) { if (['hit', 'stun', 'juggle', 'down', 'getup'].includes(f.state)) { ai.t = 0.1; return true; } return false; }
    const ph = ai.phase;
    // a modifier has just bitten: the fair window, the Architect holds its blade
    if (WitnessBoss.calm(w)) { ai.plan = 'hold'; ai.t = 0.2; return true; }
    // Kage in the air: the rising cut
    if (!p.grounded && dist < 250 && wtReady(ai, 'airCut')) { ai.cds.airCut = 1.6; return wtString(ai, ['w:up'], 0.22); }
    // a guard held near it is never safe (Raikon's lesson): the guard-crushing overhead, slow and readable
    if (p.state === 'block' && p.st > 0.5 && dist < 195 && chance(0.65)) return wtString(ai, ['w:down'], 0.3);
    // Kage's posture is low: it presses
    if (p.guard < 40 && dist < 200 && chance(0.5)) return wtString(ai, ['w:diagDown'], 0.24);
    // space and control (phase II): it steps out of the pocket and works the room from range
    if (ph === 1 && dist < 210 && chance(0.3)) { ai.plan = 'retreat'; ai.t = rand(0.35, 0.6); return true; }
    // zanshin in the duel: after an exchange it steps out and sets again
    if (ph >= 2 && dist < 200 && wtPressure(ai) >= 1 && chance(0.15)) { ai.plan = 'retreat'; ai.t = rand(0.3, 0.5); return true; }
    // otherwise it chooses its next play for the phase (the mirror, the blade, the strings, the room, the stance)
    return wtPlan(ai, p, dist);
  },
  respond(ai, p, dist, toward, m) {
    const f = ai.f, w = ai.world;
    if (!m || !f.grounded || f.abil) return false;
    // the duel: WitnessBoss.onThreat chose to read this cut as it started. The guard goes up now, so the blow falls inside the
    // parry window: Kage is deflected, and it answers (on.parry)
    if (ai.wDeflect != null && w.time - ai.wDeflect < 0.3) {
      ai.wDeflect = null;
      if (p.mdur && (p.mdur[0] - p.mt) < 0.2) { f.ctrl.blockHeld = true; f.setState('block'); f.blockT = 0; ai.block = 0.3; return true; }
    }
    return false;
  },
  // its own criticals: the phantom's cut (the mirror's watch-your-back), the riposte that answers a deflection or a
  // spent guard, the punish of a repeated move (the spam read's cut), and the cut that answers its own parry
  crit(att, def, m, world) {
    return m.tech === 'phantom' || m.tech === 'riposte' || (att.punishMove && att.punishMove === att.move) || (att.wRipUntil > world.time && m.id === att.wRipId)
      || (def.deflected && def.state === 'stun');
  },
  on: {
    hurt(ai, w, by, m) {
      (ai._press = ai._press || []).push(w.time);
      // struck while Mirror Guard is spent: every blow tears more posture
      const f = ai.f;
      if (f.alive && f.state === 'ability' && f.abil && f.abil.spentAt != null && !f.broken) Budo.postureHit(w, f, 12 / WitnessStyle.k, f.x, f.y - 120 * f.scale, -f.facing, by);
    },
    block(ai, w) { (ai._press = ai._press || []).push(w.time); },
    parry(ai, w, by, m) {
      (ai._press = ai._press || []).push(w.time);
      const f = ai.f;
      // it turned Kage's cut aside by its own guard (Mirror Guard answers through its own riposte): the answer comes on
      // the next tick, once Combat.parry has settled it (WitnessStyle.step)
      if (!f.alive || (f.abil && f.abil.onCounter) || f.broken || !w.wit) return;
      ai.seq = null; ai.block = 0; w.wit.rip = w.time + 0.5;
    },
    // its cut was parried: each beat costs posture; in the duel phases the string comes back, and the last beat, the riposte
    // and the phantom cost it more
    parried(ai, w, by, m) {
      const f = ai.f, W = w.wit, tech = m && m.tech, k = WitnessStyle.k;
      f.superArmor = false; f.wAtk = null; if (W) W.orbit = null;
      if (tech === 'echoCut') {
        if (m.last) Budo.postureHit(w, f, 12 / k, f.x, f.y - 120 * f.scale, -f.facing, by);
        if (f.state === 'stun' && !f.broken) {
          if (m.last) f.stunT = Math.max(f.stunT, 0.9);
          else if (ai.phase >= 2 && W) { f.stunT = 0.3; W.comboFrom = m.beat + 1; W.comboT = w.time + 1.6; }
        }
        w.fx.popText(f, m.last ? 'REELING' : 'DEFLECTED', C.gold);
      } else if (tech === 'riposte') {
        // the duel's winner: its own riposte turned back
        Budo.postureHit(w, f, 26 / k, f.x, f.y - 120 * f.scale, -f.facing, by);
        if (f.state === 'stun' && !f.broken) f.stunT = Math.max(f.stunT, 0.95);
        w.fx.popText(f, 'REVERSED', C.gold);
      } else if (tech === 'phantom') {
        if (m.phantom) { m.phantom.life = Math.min(m.phantom.life, 0.05); }
        Budo.postureHit(w, f, 14 / k, f.x, f.y - 120 * f.scale, -f.facing, by);
        w.fx.popText(f, 'MIRROR SHATTERED', C.gold);
      }
    },
    // its posture broke: it stays open for a long beat, and what is left of its guard comes back low
    broken(ai, w, by) {
      const f = ai.f, W = w.wit, ph = W ? W.phase : 0;
      if (!f.alive) return;
      f.stunT = Math.max(f.stunT, WITNESS_OPEN.stun[ph]); f.wOpen = w.time + f.stunT; f.guard = WITNESS_OPEN.keep;
      if (W) W.comboFrom = null;
      w.fx.stamp('THE ARCHITECT BREAKS', f.x, f.y - 200 * f.scale, 3, WitnessFX.look(f).hot, 'POSTURE BROKEN');
      if (WitnessFX.shatter) WitnessFX.shatter(w, f, 0.7);
    },
    // a clean critical rocks it: kuzushi
    critical(ai, w, by) { const f = ai.f; if (f.alive && !f.broken && !(f.wOpen > w.time)) Budo.postureHit(w, f, 10 / WitnessStyle.k, f.x, f.y - 120 * f.scale, -f.facing, by); }
  }
};
