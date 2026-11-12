/* KAGE — Echo Sentinel (a sub-boss-type echo of the Core): Gekka-ryū, the crescent flurry.

   The school. The Sentinel fights with twin crescent blades the way the moon-school does: it never stands. It darts in
   from range on a dash, throws a quick flurry of cuts (the two crescents crossing), and is gone before the answer, back to
   the far side of the room (hit and away: ichigeki ridatsu). From range it throws a crescent of light along the line
   (Crescent Arc) to make Kage come to it, and it dodges rather than guards. Light and fast, it is also frail: its poise is
   low and its cuts are light.

   Its game plan. From range: the dash flurry, or the Crescent Arc (a slow, high wave that is blocked, jumped or dashed
   through). Up close: the kesa-and-rising flurry, ending in a dash back. A jump is met by the rising cut. Pressed, or
   chased, it steps out instead of trading.

   How the player beats it: do not chase it round the room (its Crescent Arc waits at the end of the chase, and its dash
   back is faster than a walk); wait for the flurry and parry or step through it; the moment it has thrown a crescent, or
   has just flurried, it stands still for a beat: that is the opening. It is frail: a counter-hit or a posture break ends
   it quickly.

   New technique: Crescent Arc (BOSS_ABILITIES.crescentArc), below. */

// a glass cannon: frail (poise below) but its flurry hits hard when it lands
Object.assign(ENEMIES.echo_sentinel, { hp: 480, dmg: 1.2 });

const SENTINEL_STYLE = { arc: { cd: 3.6, windup: 0.46, dmg: 15, speed: 0.72, recover: 0.6 } };
const snReady = (ai, id) => (ai.cds[id] || 0) <= 0;
// Kage's blows on it (struck, blocked, parried) in the last 2.5 s
function snPressure(ai) { const t = ai.world.time; ai._press = (ai._press || []).filter(x => t - x < 2.5); return ai._press.length; }
function snSeq(ai, seq, tell) {
  const f = ai.f, t = (tell || 0) * ai.p.windup;
  if (t) { f.telegraph = Math.max(f.telegraph, t); AudioManager.play('teleport'); }
  ai.startSeq(seq, t); return true;
}

/* ---- Crescent Arc: a crescent of light thrown along the line ----
   Tell: the blades cross high over its head (eyes flash). Then it throws one crescent at chest height, slower than the
   moon-school's own: block it, dash through it, or jump it, and run in, for it stands still a long beat after the throw. */
BOSS_ABILITIES.crescentArc = { id: 'crescentArc', cd: SENTINEL_STYLE.arc.cd, range: [190, 640], chance: 0,
  run(f, w, ai, p) {
    const A = SENTINEL_STYLE.arc, W = A.windup * ai.p.windup;
    f.telegraph = W;
    f.startAbility({ dur: W + 0.18 + A.recover, rate: 24,
      pose: (f, t) => (t < W ? POSES.castUp : MOVES.kunai.s),
      start(f) { f.facing = w.player.x > f.x ? 1 : -1; w.fx.popText(f, 'CRESCENT ARC', '#b9a8ff'); AudioManager.play('teleport', { pitch: 1.3 }); },
      update(f, w, t, dt) {
        f.vx = damp(f.vx, 0, 10, dt);
        if (t < W) { if (!this.g && t > W - 0.15) { this.g = 1; w.fx.glint(f.sk.wt.x, f.sk.wt.y, '#e4d6ff'); } return; }
        if (!this.done) { this.done = 1; WeaponSystem.spawn(w, 'crescent', f, { dmg: A.dmg, speedMul: A.speed, lifeMul: 1.3, tint: '#b9a8ff' }); AudioManager.play('swing', { pitch: 1.1 }); }
        if (t > W + 0.18 && !this.tell) { this.tell = 1; w.fx.popText(f, 'OPENING', C.gold); }
      } });
  } };

FIGHT_STYLES.echo_sentinel = {
  art: 'Gekka-ryū · the crescent flurry',
  // quick and evasive: it dodges more than it guards, keeps its distance, dashes in to punish
  tune: { pref: 175, aggr: 0.75, block: 0.1, parry: 0.4, dodge: 0.15, react: [0.14, 0.25], combo: [2, 3], punish: 0.75, grab: 0.02, jump: 0.1, kunai: 0, dashIn: 0.4 },
  poise: 1.15,           // frail: its posture goes sooner
  postureRegen: 20,
  parriedStun: 0.68,
  footwork: { away: 0.5, stepIn: 190 },
  strings: [
    // from range: fly in, the two crescents cross, gone
    { seq: ['dash', 'weapon', 'weapon', 'back'], range: [130, 400], w: 2, tell: 0.32 },
    // the thrown crescent, to make Kage come to it
    { seq: ['ab:crescentArc'], range: [200, 600], w: 2.4, when: ai => snReady(ai, 'crescentArc') },
    // up close: kesa, the rising return, and out
    { seq: ['w:diagDown', 'w:diagUp', 'back'], range: [0, 200], w: 1.8, tell: 0.3 },
    // a jump is met by the rising cut, and it steps away
    { seq: ['w:up', 'back'], range: [0, 230], w: 3, when: (ai, p) => !p.grounded, tell: 0.16 }
  ],
  decide(ai, p, dist, toward) {
    const f = ai.f, w = ai.world;
    if (!f.canAct()) return false;
    // pressed (two of Kage's blows on it in a couple of seconds): the crescents cross in a counter (Moon Return: the echo of
    // Takashi's Guard Return, which it keeps): strike into it and it is turned aside and answered
    if (snPressure(ai) >= 2 && snReady(ai, 'hollowReturn') && dist > 50 && dist < 230 && p.state !== 'move' && chance(0.45)) {
      const a = BOSS_ABILITIES.hollowReturn; ai.seq = null; ai.cds.hollowReturn = Math.max(a.cd, 4.6); a.run(f, w, ai, p); return true;
    }
    // pressed (three of Kage's blows on it in a couple of seconds): it is gone, and cuts from behind (Teleport, its own)
    if (snPressure(ai) >= 3 && snReady(ai, 'teleport') && dist < 260) { const a = BOSS_ABILITIES.teleport; ai.seq = null; ai.cds.teleport = a.cd; a.run(f, w, ai, p); return true; }
    // Kage comes at it across the room: the crescent meets him on the way (it kites; the chase is what it wants)
    if (dist > 250 && dist < 560 && (p.state === 'walk' || p.state === 'run') && snReady(ai, 'crescentArc') && chance(0.55)) { ai.seq = null; ai.cds.crescentArc = BOSS_ABILITIES.crescentArc.cd; BOSS_ABILITIES.crescentArc.run(f, w, ai, p); return true; }
    // Kage walks into its reach: the lunging poke meets him as he enters (ma-ai: the first cut belongs to whoever holds the distance)
    if (dist > 150 && dist < 250 && (p.state === 'walk' || p.state === 'run') && snReady(ai, 'poke') && chance(0.45)) { ai.cds.poke = 1.8; return snSeq(ai, ['w:fwd', 'back'], 0.14); }
    // chased: it does not trade, it steps out and throws the crescent
    if (dist < 170 && (p.state === 'walk' || p.state === 'run') && chance(0.35)) {
      if (snReady(ai, 'crescentArc') && dist > 100 && chance(0.4)) { ai.seq = null; ai.cds.crescentArc = BOSS_ABILITIES.crescentArc.cd; BOSS_ABILITIES.crescentArc.run(f, w, ai, p); return true; }
      ai.plan = 'retreat'; ai.t = rand(0.3, 0.5); return true;
    }
    return false;
  },
  respond(ai, p, dist, toward, m) {
    const f = ai.f;
    if (!m || m.kind === 'grab') return false;
    // a move it has read (the same blow again and again) is parried or guarded by the common answer
    if (ai.adapted === m.id || ai.world.predictability(m.id) > 0.4) return false;
    // a blow thrown at close range: the crescents cross (Moon Return), the next blow of a streak meets the counter
    if (f.grounded && f.canAct() && dist < 170 && snReady(ai, 'hollowReturn') && chance(0.25)) {
      const a = BOSS_ABILITIES.hollowReturn; ai.seq = null; ai.cds.hollowReturn = Math.max(a.cd, 4.2); a.run(f, ai.world, ai, p); return true;
    }
    // otherwise the common answer: the crossed blades parry or guard it, or it slips away
    return false;
  },
  crit(att, def, m) { return (def.deflected && def.state === 'stun') || (att.punishMove && att.punishMove === att.move); },
  on: {
    hurt(ai, w) { (ai._press = ai._press || []).push(w.time); },
    block(ai, w) { (ai._press = ai._press || []).push(w.time); },
    // blocked: out, at once, before the answer
    blocked(ai) { if (ai.f.state === 'move' && chance(0.7)) ai.startSeq(['back'], 0.05); },
    parried(ai, w) { ai.cds.crescentArc = Math.max(ai.cds.crescentArc || 0, 1.2); }
  }
};
