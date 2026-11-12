/* KAGE — Budō: the martial rules every fight runs on, and the registry of fighting styles.

   The fight model, in the order a blow is judged (Combat.applyHit, 30-combat.js):
     parry      a guard raised just before the blow turns it aside. The parried fighter reels and loses posture.
                When a FOE parries Kage his cut is only deflected (BUDO.deflect): a short recoil he can end early by
                raising his own guard, so a duel of deflections can go back and forth blade on blade.
     block      a held guard takes the blow on posture (Fighter.guard, 100 full). Posture comes back after a pause.
     kuzushi    posture gone: the guard is broken, the fighter stands open (stun, `broken`), and the next clean blow on
                him is a critical. Repeating one move wears posture down more slowly each time (Budo.stale).
     critical   a counter-hit (struck during his own wind-up), a blow from behind, the cut that answers a parry, a
                blow on a broken guard, and for bosses and sub-bosses a whiff punished in its recovery. The screen
                holds still (BUDO.crit.freeze), then moves on in slow motion, and the struck fighter is thrown back
                on his heels (Budo.reel) so the blow reads as the one that mattered.
   and, on the AI's side (40-ai.js): the spam read (SPAM_READ), adaptation to a repeated move (BUDO.adapt), a throw for
   a guard held too long (BUDO.turtle), stepping out after a string and stepping in on a whiff (BUDO.footwork).

   Roles: 'regular' (the Order's and the Hollows' rank and file), 'sub' (sub-bosses), 'boss'. BUDO.roles makes the rank
   and file easier and the sub-bosses and bosses harder than the shared AI profiles alone (Logic.aiTuning / enemyStats).

   FIGHT_STYLES: one entry per foe that fights its own way (41-styles/<id>.js registers `FIGHT_STYLES.<enemy id>`).
   Every field is optional:
     art          the school's name, shown under the foe's name when the fight starts ('Jigen-ryū')
     tune         AI tuning over its archetype's AI_PROFILES entry (aggr, block, parry, dodge, react: [a, b],
                  combo: [a, b], pref, punish, grab, kunai, jump, dashIn); the stage curve, the difficulty mode and the
                  role still scale it afterwards
     poise        posture damage it takes, as a factor (0.7: a third harder to break)
     postureRegen posture regained per second (default BUDO.posture.regen)
     parriedStun  seconds it reels when Kage parries it (default BUDO.parryStun by role)
     footwork     { away: chance to step out of the pocket after a string, stepIn: how far (px) beyond its reach it
                  will dash in to punish a whiff }
     strings      its own attack strings, replacing the generic ones: [{ seq, range: [min, max] px, w: weight,
                  phase: n | [n...] (boss phases it belongs to), when(ai, p, dist): extra condition,
                  tell: seconds of eye-flash telegraph before the first step }]. A seq step is a button the AI presses
                  ('punch', 'kick', 'weapon', 'heavy', 'grab', 'jump', 'dash', 'special'), a directional cut
                  ('w:up', 'w:down', 'w:fwd', 'w:diagUp', 'w:diagDown'), 'fwd' (hold toward), 'back' (dash away),
                  'wait:0.25' (hold the string that long), 'move:<MOVES id>' (start that move outright, chaining from
                  the previous one's recovery) or 'ab:<BOSS_ABILITIES id>' (run that ability; ends the string)
     decide(ai, p, dist, toward)       called every AI decision before the generic logic; return true when it acted
     respond(ai, p, dist, toward, m)   called when it reacts to Kage's incoming move m; return true when it answered
     crit(att, def, m, world)          return true to make this blow of its own a critical
     on           event hooks, each (ai, world, other, m): parried (its blow was parried), parry (it parried Kage),
                  blocked (its blow was blocked), block (it blocked), land (its blow landed), hurt (it was struck),
                  broken (its posture broke), critical (it was struck by a critical)
     init(f, world)                    once, when the fighter joins a fight
   A Hollow echo with no entry of its own uses the entry of the boss it echoes (`echoOf`).

   This file is data and pure helpers only (the logic tests load it without the engine). The fight-time half of `Budo`
   (emit, join, crit, critFx, reel, postureHit, breakPosture, parried, deflect, step, drawWorld) is in 14-budo-fight.js. */

const BUDO = {
  crit: {
    mul: 1.5, foeMul: 1.3,           // damage: Kage's criticals, a foe's
    chance: 0.05,                    // a plain clean hit of Kage's is a critical this often
    freeze: 0.26,                    // seconds the screen holds still
    slow: 0.3, slowT: 0.36,          // then slow motion (scale, seconds after the freeze)
    punch: 0.11, shake: 0.75,        // camera punch-in and shake
    reel: { kb: 1050, hs: 0.55, heavy: 0.6, air: 620, pull: 90, slide: 6 },   // the struck fighter is thrown back (px/s, hitstun s)
    foeCd: 2.2,                      // seconds before the same foe can land another critical
    kageCd: 1.4,                     // ... and before Kage's next counter-hit, back or clean critical (a riposte and a
                                     // blow on a broken guard always are), so the freeze stays an event
    who: { boss: true, sub: true, regular: false }   // which foes land criticals at all
  },
  posture: {
    regen: 20, delay: 1.0,                           // per second, after this long without posture damage
    parried: { regular: 55, sub: 34, boss: 26 },     // posture a foe loses when Kage parries it
    playerParried: 30,                               // posture Kage loses when his cut is deflected
    breakStun: { regular: 1.3, sub: 1.1, boss: 0.95, player: 1.0 },
    refill: 60                                       // posture after a break
  },
  parryStun: { regular: 0.95, sub: 0.62, boss: 0.5 },   // how long a parried foe reels
  deflect: { stun: 0.46, guardAfter: 0.14 },            // Kage's cut deflected: the recoil, and when a fresh guard may end it
  turtle: { hold: 0.9, range: 105, chance: { boss: 0.7, sub: 0.5, regular: 0.12 } },   // a guard held too long is thrown
  footwork: { regular: { away: 0, stepIn: 0 }, sub: { away: 0.3, stepIn: 130 }, boss: { away: 0.42, stepIn: 170 } },
  adapt: { regular: false, sub: true, boss: true },     // the same move three times running is read and parried
  // role scaling over the shared archetypes: the rank and file are easier, sub-bosses a little harder, bosses harder
  // (spam: a factor on the spam read's chance, so even the rank and file still answer spam; punish1: the rank and
  // file's spam punish multiplier in place of SPAM_READ.punishMul, 0 keeps the table's)
  roles: {
    regular: { hp: 0.82, dmg: 0.82, aggr: 0.78, guard: 0.72, parry: 0.4, react: 1.32, punish: 0.62, idle: 1.3, windup: 1.2, recovery: 1.22, combo: -1, spam: 1.4, punish1: 1.1 },
    sub:     { hp: 1.05, dmg: 1.02, aggr: 1.05, guard: 1.08, parry: 1.12, react: 0.93, punish: 1.08, idle: 0.94, windup: 0.98, recovery: 0.95, combo: 0, spam: 1, punish1: 0 },
    boss:    { hp: 1.22, dmg: 1.12, aggr: 1.15, guard: 1.2, parry: 1.3, react: 0.82, punish: 1.2, idle: 0.8, windup: 0.93, recovery: 0.85, combo: 1, spam: 1, punish1: 0 }
  }
};

const FIGHT_STYLES = {};

const Budo = {
  // 'boss' | 'sub' | 'regular' from an ENEMIES entry (or a fighter's def). Summoned minions and clones are rank and file.
  roleOf(def, minor) { const t = def && def.type; return minor ? 'regular' : t === 'boss' ? 'boss' : t === 'sub' ? 'sub' : 'regular'; },
  role(f) { return f.isPlayer ? 'player' : this.roleOf(f.def, f.minion || f.clone || f.role === 'minion' || f.role === 'clone'); },
  styleFor(def) { return def ? FIGHT_STYLES[def.id] || (def.echoOf && FIGHT_STYLES[def.echoOf]) || null : null; },
  style(f) { return f.isPlayer || f.clone ? null : this.styleFor(f.def); },
  // the role's footwork with the style's own on top
  footwork(f) { const st = this.style(f), base = BUDO.footwork[this.role(f)] || BUDO.footwork.regular; return st && st.footwork ? Object.assign({}, base, st.footwork) : base; },
  // a repeated move wears a guard down less each time
  stale(att) { return Math.max(0.5, Math.pow(0.85, att.repeat || 0)); },

  /* ---- AI: a style's own strings ---- */
  // the string a style would throw from here: null when it has none for this distance and phase. Weighted; the last
  // string thrown counts for half, so a foe does not loop one pattern.
  pickString(ai, p, dist) {
    const st = ai.style, list = st && st.strings;
    if (!list) return null;
    let total = 0; const ok = [];
    for (const s of list) {
      if (s.range && (dist < s.range[0] || dist > s.range[1])) continue;
      if (s.phase != null && !(Array.isArray(s.phase) ? s.phase.includes(ai.phase) : s.phase === ai.phase)) continue;
      if (s.when && !s.when(ai, p, dist)) continue;
      const w = (s.w || 1) * (s === ai.lastString ? 0.5 : 1);
      ok.push([s, w]); total += w;
    }
    if (!ok.length) return null;
    let r = Math.random() * total;
    for (const [s, w] of ok) { r -= w; if (r <= 0) return s; }
    return ok[ok.length - 1][0];
  },
};
