/* KAGE — Hollow Takashi's fighting style: Ittō-ryū remembered wrong (the Core's third echo, core.echo3, a sub-boss).

   The father's kata as a corrupted memory keeps them: the same deflection duel as Takashi's (66-takashi.js,
   TakashiGuard / TakashiKata; see 41-styles/takashi.js), but with broken timing. It turns a cut aside less often, its
   answers stutter (every other beat hitches before it falls), its kata are short fragments of one or two beats, and
   when one is turned back it stands open longer. It still reads a repeated strike every time.
   How to beat it: vary your cuts; when it turns one, wait for the glint (the hitch makes early guards block, not parry)
   and turn its answer back; cut it when it stands open. A little harder than a common sub-boss, well below the
   father. */

function hkKataAbility(id, beats, cd, range) {
  BOSS_ABILITIES[id] = { id, cd, range, chance: 1, run(f, w) { TakashiKata.start(f, w, beats); } };
}
hkKataAbility('echoKesa', ['kesa', 'gyaku'], 1.8, [0, 300]);
hkKataAbility('echoNidan', ['double', 'rise'], 2.6, [0, 300]);
hkKataAbility('echoKaratake', ['overhead'], 3.4, [0, 290]);
hkKataAbility('echoDraw', ['draw'], 3.6, [250, 520]);
const hkReady = id => ai => !((ai.cds[id] || 0) > 0);

FIGHT_STYLES.hollow_takashi = {
  art: 'Ittō-ryū · a broken memory',
  tune: { aggr: 0.6, block: 0.28, parry: 0.03, dodge: 0.12, react: [0.17, 0.27], combo: [1, 2], pref: 220, punish: 0.6, grab: 0.03, jump: 0.02, kunai: 0, dashIn: 0 },
  poise: 0.85,
  postureRegen: 10,
  parriedStun: 0.7,
  footwork: { away: 0.2, stepIn: 110 },
  regen: { near: 10, far: 34, at: 330 },
  duel: {
    deflect: 0.38, kataGuard: 0.8, floor: 38, kageCost: 14, selfCost: 6,
    riposte: 0.48, recoil: 0.22, open: 0.85, tempo: 1.06, hitch: 0.12, dmg: 1,
    extra: [1, 2], cont: [['kesa'], ['gyaku'], ['delay'], ['double', 'rise'], ['kesa', 'overhead']],
    tint: '#b48aff',
    words: { read: ['...again... the same...'], deflect: ['...too... straight...', '...elbows... in...'], parried: ['...good... good...', '...yes...'],
      blocked: ['...meet it...'], broken: ['...well... struck...'] }
  },
  strings: [
    { seq: ['ab:echoKesa'], range: [0, 300], w: 3, when: hkReady('echoKesa') },
    { seq: ['ab:echoNidan'], range: [0, 300], w: 2, when: hkReady('echoNidan') },
    { seq: ['ab:echoKaratake'], range: [0, 290], w: 1, when: hkReady('echoKaratake') },
    { seq: ['ab:echoDraw'], range: [250, 520], w: 2, when: hkReady('echoDraw') }
  ],
  decide(ai, p, dist) {
    const f = ai.f;
    if (f.tkx) { ai.t = 0.03; return true; }
    if (!f.canAct()) return false;
    // it half-remembers the kamae: a moment's wait at sword's distance
    if (dist < 300 && dist > 90 && p.isNeutral() && chance(0.3)) { ai.plan = 'hold'; ai.t = rand(0.25, 0.5) * ai.p.idle; return true; }
    return false;
  },
  respond(ai, p, dist, toward, m) {
    const f = ai.f, c = f.ctrl;
    if (f.tkx) return true;
    if (m.unb || m.kind === 'grab' || TakashiGuard.breaker(p, m) || f.guard < TakashiGuard.cfg(f).floor) {
      if (chance(0.4)) { ai.block = rand(0.3, 0.5); c.blockHeld = !m.unb && m.kind !== 'grab'; } else if (chance(0.4)) { c.dashP = true; c.dir = -toward; }
      return true;
    }
    return true;
  },
  crit(att, def, m) { return !!(m.tkRiposte && def.state === 'stun' && def.deflected); },
  on: {
    parry(ai, w, other) {
      const f = ai.f;
      if (!f.alive || f.broken || !other || !other.isPlayer) return;
      if (f.state === 'ability' && f.abil && !f.abil.tkBeat) return;
      TakashiKata.riposte(f, w);
    },
    parried(ai, w, other, m) { if (!TakashiKata.parried(ai.f, w, m)) TakashiKata.say(w, ai.f, 'parried'); },
    land(ai, w, other, m) { const x = ai.f.tkx; if (x && m && m.tkBeat) x.landed = true; },
    broken(ai, w) { ai.f.tkx = null; TakashiKata.say(w, ai.f, 'broken'); }
  },
  // the Iron Guard, remembered: it has no phase flag of its own (66-takashi.js sets Takashi's per phase)
  init(f) { f.ironGuard = true; },
  tick(ai, s) { FIGHT_STYLES.takashi.tick(ai, s); }
};

// a Core echo meets a fully geared Kage: it needs more weight than the frozen numbers gave it to stay a sub-boss
Object.assign(ENEMIES.hollow_takashi, {
  hp: 660, dmg: 1.55,
  tip: 'It still reads repetition: a strike you repeat is turned aside. When it turns your cut, wait for the glint (its timing stutters) and parry the answer; when its short kata is turned back it stands open: cut it then. In its second phase a broken Final Flow gathers: block the first two cuts, dodge the last.'
});
