/* KAGE — Takashi's fighting style: Ittō-ryū kenjutsu and iaijutsu, the father's school (Act III boss, act3.boss).

   Two samurai with the same katana. The fight is a deflection duel, blade on blade, decided by rhythm and posture:
     - The Iron Guard (66-takashi.js, TakashiGuard): a cut Kage has used in his last few moves is read and turned aside,
       always; any other cut is turned aside at a chance while the father stands settled in kamae (TK_DUEL.deflect),
       falling with his posture and gone once it is below the floor (the bar turns orange). Never a blow from behind,
       a guard-breaker (Kage's downward slash, a charged spinning kick) or a rage art.
     - The answer comes at a FIXED tempo (TK_DUEL.riposte: 0.42 s after the deflection, a gold glint just before the
       cut): Kage raises his guard in the parry window and turns it back, which costs the FATHER posture; then the next
       beat of his kata, and the next (TakashiKata: 2 to 4 beats, each with its own rhythm: the held kesa, the doubled
       nidan, the crushing overhead that must be parried, not blocked, the thrust that must be stepped out of).
     - Cutting into his kata is turned aside while his posture holds; the last beat parried leaves him open, a broken
       posture leaves him open longer, and that cut is the critical.
     - His own kata from sword's distance (kesa / gyaku-kesa, nidan into kiriage, kesa into the held beat into tsuki,
       karatake-wari) and the draw cut (nukitsuke) from further out. Blocking them all bleeds Kage's posture: guard
       alone loses; parrying them wins.
     - Posture: strong but finite (poise), recovering fast when Kage backs off (stay in and keep deflecting), slowly while
       the duel is on. He presses with the overhead when Kage's posture is low or his guard is held too long.
     - Mashing is punished: the read, the spam read, a riposte that catches a Kage who did not guard is a critical.
   Phase II, the Yashiro Titan: the titan's spectacle stays (its unblockable blows still floor Kage), but its sword also
   cuts in slow, huge, parriable strokes (titanKesa / titanRise): turn them back and the titan's posture breaks.
   Phase III, Tenrai: his phase I duel, Final Flow and the domain.
   How to beat him: vary your cuts, never repeat; when he turns one aside press guard on his glint (not before), and
   keep meeting his beats until his posture bar is orange or broken; then cut. Step out of the thrust; parry the
   overhead. Do not back away for long: his guard comes back. */

// a kata ability (BOSS_ABILITIES): runs TakashiKata with these beats; reached from his strings (`ab:<id>`)
function tkKataAbility(id, beats, cd, range, cond) {
  BOSS_ABILITIES[id] = { id, cd, range, chance: 1, cond,
    run(f, w, ai) { TakashiKata.start(f, w, beats); } };
}
tkKataAbility('kataKesa', ['kesa', 'gyaku'], 1.6, [0, 300]);
tkKataAbility('kataNidan', ['gyaku', 'double', 'rise'], 2.4, [0, 300]);
tkKataAbility('kataTsuki', ['kesa', 'delay', 'thrust'], 3.6, [60, 300]);
tkKataAbility('kataKaratake', ['overhead', 'kesa'], 3.2, [0, 290]);
tkKataAbility('kataDraw', ['draw', 'gyaku'], 3.4, [250, 520]);
tkKataAbility('titanKata', ['titanKesa', 'titanRise'], 3.2, [0, 520], f => f.tk && f.tk.k > 0.8);

const tkReady = id => ai => !((ai.cds[id] || 0) > 0);
// run one of his kata abilities now (from decide)
function tkRunKata(ai, id) {
  const a = BOSS_ABILITIES[id], f = ai.f;
  if (!a || (ai.cds[id] || 0) > 0 || !f.canAct()) return false;
  ai.cds[id] = a.cd; ai.seq = null;
  a.run(f, ai.world, ai, ai.world.player);
  return true;
}

FIGHT_STYLES.takashi = {
  art: 'Ittō-ryū · iaijutsu',
  // patient: he waits in kamae at sword's distance (issoku-ittō no maai) for Kage's cut, reads it, answers; he does
  // not chase, he does not flinch, he punishes every opening
  tune: { aggr: 0.46, block: 0.3, parry: 0.04, dodge: 0.14, react: [0.12, 0.2], combo: [2, 3], pref: 230, punish: 0.85, grab: 0.03, jump: 0.02, kunai: 0, dashIn: 0 },
  poise: 0.8,                // a parried beat costs him BUDO.posture.parried.boss x 0.8 (about five to break him)
  postureRegen: 8,           // in the duel; far more when Kage backs off (tick)
  parriedStun: 0.55,         // one of his own cuts (not a kata beat) turned back
  footwork: { away: 0.25, stepIn: 150 },
  regen: { near: 8, far: 42, at: 330 },
  // the deflection duel's numbers over TK_DUEL (66-takashi.js lists every field; his are its defaults)
  duel: {},
  strings: [
    { seq: ['ab:kataKesa'], range: [0, 300], w: 3, phase: [0, 2], when: tkReady('kataKesa') },
    { seq: ['ab:kataNidan'], range: [0, 300], w: 2, phase: [0, 2], when: tkReady('kataNidan') },
    { seq: ['ab:kataTsuki'], range: [60, 300], w: 1.6, phase: [0, 2], when: tkReady('kataTsuki') },
    { seq: ['ab:kataKaratake'], range: [0, 290], w: 1.2, phase: [0, 2], when: tkReady('kataKaratake') },
    { seq: ['ab:kataDraw'], range: [250, 520], w: 2.5, phase: [0, 2], when: tkReady('kataDraw') },
    // the titan's sword strokes: the parry game inside the spectacle
    { seq: ['ab:titanKata'], range: [0, 520], w: 3, phase: 1, when: (ai, p) => tkReady('titanKata')(ai) && ai.f.tk && ai.f.tk.k > 0.8 }
  ],
  decide(ai, p, dist, toward) {
    const f = ai.f, ph = ai.phaseData || {};
    // a kata in progress: its next beat comes as soon as he can act (TakashiKata.tick)
    if (f.tkx) { ai.t = 0.03; return true; }
    if (!f.canAct()) return false;
    // the titan: between its great techniques, its sword strokes (parry them)
    if (ph.titan) return dist < 520 && f.tk && f.tk.k > 0.8 && chance(0.4) && tkRunKata(ai, 'titanKata');
    // Kage's posture is low, or his guard has been held too long: the overhead that must be parried
    if (dist < 290 && (p.guard < 45 || (p.state === 'block' && p.st > 0.45)) && chance(0.6) && tkRunKata(ai, 'kataKaratake')) return true;
    // kamae: at sword's distance he waits a moment for Kage's cut (the Iron Guard reads it) before taking the initiative
    if (dist < 300 && dist > 90 && p.isNeutral() && chance(0.4)) { ai.plan = 'hold'; ai.t = rand(0.25, 0.45) * ai.p.idle; return true; }
    return false;
  },
  respond(ai, p, dist, toward, m) {
    const f = ai.f, c = f.ctrl;
    if (f.tkx) return true;
    if (!f.ironGuard) return false;   // the titan: the generic answers (and its armour)
    // a guard-breaker or an unblockable: step out of it, or take it on the guard
    if (m.unb || m.kind === 'grab' || TakashiGuard.breaker(p, m)) {
      if (chance(0.6)) { c.dashP = true; c.dir = -toward; }
      else if (!m.unb && m.kind !== 'grab') { ai.block = rand(0.3, 0.5); c.blockHeld = true; }
      return true;
    }
    // his guard cracking: he can no longer turn a cut, he guards it or gives ground
    if (f.guard < TakashiGuard.cfg(f).floor) {
      if (chance(0.5)) { ai.block = rand(0.3, 0.5); c.blockHeld = true; } else if (chance(0.4)) { c.dashP = true; c.dir = -toward; }
      return true;
    }
    // kamae: the Iron Guard meets the cut
    return true;
  },
  // a riposte that finds Kage still reeling from the deflection (he did not raise his guard in time) is a critical
  crit(att, def, m) { return !!(m.tkRiposte && def.state === 'stun' && def.deflected); },
  on: {
    // he turned Kage's cut aside (the Iron Guard, or a parry): the riposte at the fixed tempo, then his kata
    parry(ai, w, other) {
      const f = ai.f;
      if (!f.alive || f.broken || !other || !other.isPlayer) return;
      if (f.state === 'ability' && f.abil && !f.abil.tkBeat) return;   // committed to a technique: no answer
      TakashiKata.riposte(f, w);
    },
    parried(ai, w, other, m) {
      const f = ai.f;
      if (!TakashiKata.parried(f, w, m)) TakashiKata.say(w, f, 'parried');
    },
    blocked(ai, w, other, m) { if (m && m.tkBeat && chance(0.35)) TakashiKata.say(w, ai.f, 'blocked'); },
    land(ai, w, other, m) { const x = ai.f.tkx; if (x && m && m.tkBeat) x.landed = true; },
    broken(ai, w) { ai.f.tkx = null; TakashiKata.say(w, ai.f, 'broken'); }
  },
  // every step (TakashiBoss.step): his posture comes back fast when Kage stands off, slowly while the duel is on
  tick(ai, s) {
    const f = ai.f, p = s.player, st = Budo.style(f), R = st && st.regen;
    if (!p || !R) return;
    const far = Math.abs(p.x - f.x) > R.at;
    f.postureRegen = far ? R.far : R.near;
    if (far && f.postureDelay > 0.4) f.postureDelay = 0.4;
  }
};

// his data, tuned for the duel (the frozen 10-data.js keeps the originals): the tip teaches the deflection duel
Object.assign(ENEMIES.takashi, {
  // his authored weight: the duel makes him skilled, the numbers stay a boss's
  dmg: 1.15,
  tip: 'He turns aside any strike you repeat, and many you do not. When he turns your cut, press guard on his gold glint (not before) and parry the answer; keep meeting each beat of his kata and his posture breaks: then cut. Blocking his kata only wears your own guard down. Parry the overhead (上), step out of the thrust (危). His posture comes back if you back away. When the Yashiro Titan rises, parry its sword strokes; jump the low sweep, leave the marked ground, dash through the grasp and the spear, jump the pulse. In his domain, strike him hard before the thunder falls.'
});
