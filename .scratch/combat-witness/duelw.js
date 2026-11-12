// Headless duel: a bot plays Kage against one foe in the real simulation (no drawing), over several seeded runs, and
// prints what happened. Use it to measure how hard a foe is and whether its fighting style actually shows up.
//
//   node tools/duel.js --foe raikon                    (finds the foe's story stage; else a plain campaign fight)
//   node tools/duel.js --foe garan --bot masher --runs 12
//   node tools/duel.js --foe takashi --nostyle 1       (the same fight with its FIGHT_STYLES entry removed: a baseline)
//
// Options:
//   --foe <ENEMIES id>      required
//   --stage <stage id>      a specific campaign stage (default: the first stage that features the foe)
//   --bot fighter|masher|turtle|parry   who plays Kage (default fighter)
//        fighter  a decent player: guards or backs off on a wind-up (sometimes late), parries now and then, answers a
//                 parry with the counter cut, varies his strings, steps out after them, uses the rage art
//        masher   walks in and mashes the weapon button: what the spam read and adaptation are there to stop
//        turtle   holds guard and pokes: what the throw is there to stop
//        parry    like fighter, but guards late on purpose every time: lives or dies by the parry
//   --runs n                seeded runs (default 8)       --seconds n   time limit per run in game seconds (default 180)
//   --difficulty easy|normal|hard|impossible (default normal)
//   --gear n                Kage's gear level 1..8 (default: by chapter: prologue/act1 2, interlude 2, act2 4, act3 6, core 8)
//   --nostyle 1             remove the foe's FIGHT_STYLES entry first
//   --log 1                 print the first run's event log (abilities, strings, parries, criticals, breaks)
//   --json 1                print the summary as JSON
'use strict';
const path = require('node:path');
const { loadSim } = require('E:/PROJECTS/KAGE/KAGE/tests/helpers/load-sim.js');
const { MACROS } = require('E:/PROJECTS/KAGE/KAGE/tests/helpers/gameplay-lock.js');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 && process.argv[i + 1] != null ? process.argv[i + 1] : d; };
const foe = arg('foe', '');
if (!foe) { console.error('usage: node tools/duel.js --foe <ENEMIES id> [--bot fighter|masher|turtle|parry] [--runs n] [--nostyle 1] [--log 1]'); process.exit(2); }
const BOT = arg('bot', 'fighter'), RUNS = +arg('runs', 8), LIMIT = +arg('seconds', 180), DIFF = arg('difficulty', 'normal');
const GEAR_BY_CHAPTER = { prologue: 1, act1: 2, interlude: 2, act2: 4, act3: 6, core: 8 };

// varied strings the fighter bot rotates through (never the same one twice running)
const STRINGS = ['weapon3', 'dirCombo', 'punch3', 'dirDown', 'kickTap', 'dirUp', 'dashStrike', 'dirDiagDown', 'launcher', 'dirFwd', 'kickCharge', 'dirDiagUp'];

class Bot {
  constructor(S, s, kind, rnd) { this.S = S; this.s = s; this.kind = kind; this.rnd = rnd; this.held = new Set(); this.taps = []; this.macro = null; this.t = 0; this.si = (rnd() * STRINGS.length) | 0; this.wait = 0; this.react = null; this.seen = null; this.n = 0; }
  down(a) { if (!this.held.has(a)) { this.held.add(a); this.S.InputManager.virtualDown(a); } }
  up(a) { if (this.held.has(a)) { this.held.delete(a); this.S.InputManager.virtualUp(a); } }
  tap(a) { this.up(a); this.down(a); this.taps.push({ a, n: 2 }); }
  releaseAll() { for (const a of [...this.held]) this.up(a); this.taps.length = 0; }
  keys(p, e) { const toward = e.x >= p.x ? 'right' : 'left'; return { toward, away: toward === 'right' ? 'left' : 'right' }; }
  start(name, p, e) { this.macro = MACROS[name]; this.name = name; this.t = 0; this.dir = this.keys(p, e); }
  // is the foe about to hit Kage? returns { left: seconds until the blow, low } or null
  threat(p, e, dist) {
    if (!e.alive) return null;
    const facingMe = Math.sign(p.x - e.x) === e.facing || dist < 40;
    if (e.state === 'move' && e.move && e.mphase <= 1 && facingMe) {
      const m = e.move, reach = (m.box ? (m.box[0] + m.box[2]) * e.scale : 120) + (m.lunge ? m.lunge * 0.2 : 0);
      if (dist < reach + 70) return { left: e.mphase === 0 ? Math.max(0, e.mdur[0] - e.mt) : 0, low: !!m.low, unb: !!m.unb || m.kind === 'grab', id: m.id };
    }
    if (e.state === 'ability' && e.abil && dist < 380 && (e.telegraph > 0 || e.abil.t < 0.45)) return { left: Math.max(0, e.telegraph), low: false, unb: !!e.unblockable, id: 'ability' };
    for (const pr of this.s.projectiles) if (pr.team !== p.team && Math.sign(p.x - pr.x) === Math.sign(pr.vx) && Math.abs(pr.x - p.x) < 240) return { left: Math.abs(pr.x - p.x) / Math.max(1, Math.abs(pr.vx)), low: !!pr.d.ground, unb: !!pr.d.unb, id: 'proj' };
    return null;
  }
  frame() {
    const s = this.s, p = s.player, S = this.S;
    for (let i = this.taps.length - 1; i >= 0; i--) if (--this.taps[i].n <= 0) { this.up(this.taps[i].a); this.taps.splice(i, 1); }
    if (s.phase !== 'fight' || !p.alive) { this.releaseAll(); this.macro = null; this.react = null; return; }
    const e = s.opponentOf(p); if (!e) return;
    const dist = Math.abs(e.x - p.x), k = this.keys(p, e), kind = this.kind;
    this.n++;
    if (kind === 'masher') {
      if (dist > 135) { this.down(k.toward); this.up(k.away); } else { this.up(k.toward); this.up(k.away); }
      if (this.n % 13 === 0) this.tap('weapon');
      return;
    }
    if (kind === 'turtle') {
      if (dist > 150) { this.up('block'); this.down(k.toward); this.up(k.away); return; }
      this.up(k.toward);
      if (this.n % 110 < 12) { this.up('block'); if (this.n % 110 === 6) this.tap('weapon'); } else this.down('block');
      return;
    }
    // ---- fighter / parry ----
    const th = this.threat(p, e, dist);
    // a deflected cut: a fresh guard press as the answer comes
    if (p.state === 'stun' && p.deflected) { this.macro = null; this.up(k.toward); if (th && th.left < 0.12 && !this.held.has('block')) this.down('block'); return; }
    if (th && this.seen !== th.id + ':' + e.st.toFixed(1) && !this.react) {
      this.seen = th.id + ':' + e.st.toFixed(1);
      const r = this.rnd(), late = kind === 'parry' || this.rnd() < 0.35;
      let how = th.unb ? (r < 0.75 ? 'back' : 'none') : th.low && r < 0.5 ? 'jump' : r < (kind === 'parry' ? 0.95 : 0.6) ? 'guard' : r < 0.82 ? 'back' : 'none';
      this.react = { how, late, delay: 8 + ((this.rnd() * 6) | 0), hold: 0 };
    }
    if (this.react) {
      const R = this.react;
      if (R.delay > 0) R.delay--;
      if (R.how === 'none') { if (!th) this.react = null; }
      else if (R.how === 'guard') {
        const can = p.grounded && (p.canAct() || p.state === 'move' && p.mphase === 2);
        if (R.delay <= 0 && can && (!R.late || !th || th.left < 0.09)) { this.macro = null; this.up(k.toward); this.up(k.away); this.down('block'); }
        if (this.held.has('block')) { R.hold++; if (!th && R.hold > 6) { this.up('block'); this.react = null; if (p.counterT > 0) this.tap('weapon'); } else if (R.hold > 70) { this.up('block'); this.react = null; } }
        else if (!th && R.delay <= 0) this.react = null;
      } else if (R.how === 'back') {
        if (R.delay <= 0) { if (p.canAct() && p.dashCd <= 0) { this.macro = null; this.releaseAll(); this.start('backstep', p, e); } this.react = null; }
      } else if (R.how === 'jump') {
        if (R.delay <= 0) { if (p.canAct()) { this.macro = null; this.releaseAll(); this.tap('jump'); } this.react = null; }
      }
      if (this.react && this.held.has('block')) return;
    }
    if (!this.macro) {
      if (this.wait > 0) { this.wait--; return; }
      if (!p.canAct() && p.state !== 'air') return;
      if (p.rage >= 100 && dist < 210 && p.grounded && e.invuln <= 0) { this.releaseAll(); this.start('special', p, e); return; }
      if (dist > 150 && p.grounded) { this.up(k.away); this.down(k.toward); if (dist > 360 && p.dashCd <= 0 && this.n % 40 === 0) this.tap('dash'); return; }
      this.up('left'); this.up('right');
      // attack when the foe is not mid-swing at us
      if (th) return;
      this.si = (this.si + 1 + ((this.rnd() * 3) | 0)) % STRINGS.length;
      this.start(STRINGS[this.si], p, e);
      this.after = this.rnd() < 0.4 ? 'walkBack' : null;
    }
    for (const [at, act, how] of this.macro) {
      if (at !== this.t) continue;
      const a = act === 'toward' ? this.dir.toward : act === 'away' ? this.dir.away : act;
      if (how === 'set' || how === 'clear') continue;
      if (how === 'down') this.down(a); else if (how === 'up') this.up(a); else { this.down(a); this.taps.push({ a, n: 2 }); }
    }
    this.t++;
    if (this.t > this.macro[this.macro.length - 1][0] + 3) {
      this.macro = null; this.wait = 5 + ((this.rnd() * 10) | 0);
      if (this.after) { const a = this.after; this.after = null; this.start(a, p, e); }
    }
  }
}

function stageFor(S, id) {
  for (const ch of S.CAMPAIGN.chapters) for (const st of ch.stages) if (st.enemy === id || st.enemyId === id || st.foe === id) return { stage: st.id, chapter: ch.id };
  return null;
}

function run(seed, first) {
  const S = loadSim({ seed, exports: ['CAMPAIGN', 'FIGHT_STYLES', 'BUDO', 'Budo', 'AIController', 'WitnessBoss', 'WitnessStyle'] });
  if (!S.ENEMIES[foe]) { console.error('no such foe: ' + foe); process.exit(2); }
  if (arg('nostyle', '')) { delete S.FIGHT_STYLES[foe]; const eo = S.ENEMIES[foe].echoOf; if (eo) delete S.FIGHT_STYLES[eo]; }
  const save = S.SaveManager.data = S.Logic.defaultSave();
  save.difficulty = DIFF;
  const found = arg('stage', '') ? { stage: arg('stage', ''), chapter: arg('stage', '').split('.')[0] } : stageFor(S, foe);
  let cfg = found ? S.Logic.stageConfig(save, found.stage) : { mode: 'campaign', enemyId: foe, env: 'highlands', diff: 1, ng: 0 };
  if (cfg.kind === 'stretch' || cfg.stretch) cfg = { mode: 'campaign', enemyId: foe, env: cfg.env || 'highlands', diff: cfg.diff || 1, pos: cfg.pos || 0, ng: 0 };   // a rank-and-file foe: a plain duel at its stage's tier
  if (arg('boss', '')) { cfg = Object.assign({}, cfg, { format: Object.assign({}, S.Logic.stageConfig(save, arg('boss', '') === 'sub' ? 'act1.sub1' : 'act1.boss').format) }); if (arg('cfgdiff', '')) cfg.diff = +arg('cfgdiff', ''); }
  const gear = +arg('gear', found ? GEAR_BY_CHAPTER[found.chapter] || 2 : 2);
  save.owned.weapons[save.equipped.weapon] = Math.min(8, gear); save.owned.helmets[save.equipped.helmet] = Math.min(5, Math.ceil(gear * 0.6)); save.owned.armors[save.equipped.armor] = Math.min(5, Math.ceil(gear * 0.6));
  save.level = 1 + gear * 2;
  const ev = [], c = { foeParries: 0, kageParries: 0, kageCrits: 0, foeCrits: 0, kageBroken: 0, foeBroken: 0, spamPunish: 0, deflects: 0, abilities: {}, extra: {}, src: {}, strings: 0, throws: 0, dmgToFoe: 0, dmgToKage: 0 };
  let s = null, frame = 0;
  const lab = f => (f.isPlayer ? 'kage' : f.def ? f.def.id : '?');
  const log = (t, o) => { if (first) ev.push(`${(frame / 60).toFixed(1)}s ${t}${o ? ' ' + o : ''}`); };
  const wrap = (obj, name, fn) => { const orig = obj[name]; if (typeof orig !== 'function') return; obj[name] = function (...a) { const out = orig.apply(this, a); fn.call(this, a, out); return out; }; };
  wrap(S.Combat, 'parry', ([w, att, def]) => { if (def.isPlayer) c.kageParries++; else c.foeParries++; log('parry', `${lab(def)} parries ${lab(att)}`); });
  wrap(S.Combat, 'damage', ([w, att, def, dmg, m]) => { if (def.isPlayer) { c.dmgToKage += Math.max(1, dmg); const k = (m && (m.tech || m.stamp || m.id)) || '?'; c.src[k] = (c.src[k] || 0) + Math.max(1, dmg); } else c.dmgToFoe += Math.max(1, dmg); });
  const cnt = k => { c.extra[k] = (c.extra[k] || 0) + 1; };
  wrap(S.WitnessBoss, 'mirror', ([ai], out) => { if (out) { cnt('mirror'); log('mirror'); } });
  wrap(S.Budo, 'postureHit', ([w, f, amt]) => { if (!f.isPlayer) cnt('foePostureHits'); });
  wrap(S.Budo, 'reel', () => cnt('reel'));
  wrap(S.Combat, 'grab', ([w, att, def]) => { if (def.isPlayer && def.state === 'grabbed') { c.throws++; log('throw', lab(att)); } });
  wrap(S.Budo, 'critFx', ([w, att, def, crit]) => { if (att.isPlayer) c.kageCrits++; else c.foeCrits++; log('CRIT', `${lab(att)} -> ${lab(def)} (${crit.why})`); });
  wrap(S.Budo, 'breakPosture', ([w, f]) => { if (f.isPlayer) c.kageBroken++; else c.foeBroken++; log('BREAK', lab(f)); });
  wrap(S.Budo, 'deflect', () => { c.deflects++; });
  wrap(S.AIController.prototype, 'tryString', function (a, out) { if (out) { c.strings++; log('string', this.lastString && this.lastString.seq.join(' ')); } });
  for (const [id, a] of Object.entries(S.BOSS_ABILITIES)) if (a && typeof a.run === 'function') wrap(a, 'run', () => { c.abilities[id] = (c.abilities[id] || 0) + 1; log('ability', id); });
  S.Game.playStory = (id, done) => { if (done) done(); return false; };
  let result = null;
  S.Game.finishFight = r => { result = r; };
  s = new S.FightSession(cfg);
  wrap(s, 'onSpamPunish', () => { c.spamPunish++; log('SPAM PUNISH'); });
  wrap(s, 'onBossPhase', ([f, idx]) => log('PHASE', String(idx + 1)));
  let rs = seed * 2654435761 >>> 0; const rnd = () => { rs = (rs + 0x6D2B79F5) >>> 0; let t = rs; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const bot = new Bot(S, s, BOT, rnd);
  const STEP = S.STEP, real = 1 / 60, e0 = s.enemy, p = s.player, hp0 = e0.maxHp, php0 = p.maxHp;
  let acc = 0, err = null;
  try {
    for (frame = 0; frame < LIMIT * 60 && s.phase !== 'done' && !result; frame++) {
      bot.frame();
      if (s.fx.hitStop > 0) s.fx.update(real, 0);
      else {
        acc += real * s.fx.slowScale; let n = 0;
        while (acc >= STEP && n < 5) { s.step(STEP); S.InputManager.endTick(); acc -= STEP; n++; if (s.phase === 'done') break; }
        if (acc > STEP) acc = STEP;
        s.fx.update(real, real * s.fx.slowScale);
      }
    }
  } catch (x) { err = x; }
  const win = result ? !!(result.win || result.won || result.victory) : !e0.alive && p.alive;
  const lost = result ? !win : !p.alive;
  return { win, lost, timeout: !win && !lost, time: s.fightTime || frame / 60, kageHp: Math.max(0, p.hp) / php0, foeHp: Math.max(0, e0.hp) / hp0, c, ev, err, stage: found && found.stage, gear, foeMaxHp: hp0, kageMaxHp: php0, style: !!S.Budo.style(e0), art: (S.Budo.style(e0) || {}).art || null };
}

const runs = [];
for (let i = 0; i < RUNS; i++) runs.push(run(1000 + i * 7919, i === 0 && !!arg('log', '')));
const avg = f => runs.reduce((a, r) => a + f(r), 0) / runs.length;
const errs = runs.filter(r => r.err);
const abil = {}; for (const r of runs) for (const [k, v] of Object.entries(r.c.abilities)) abil[k] = (abil[k] || 0) + v;
const sum = {
  foe, bot: BOT, difficulty: DIFF, stage: runs[0].stage || '(plain duel)', gear: runs[0].gear, style: runs[0].style ? runs[0].art || 'yes' : 'none', runs: RUNS,
  kageWins: runs.filter(r => r.win).length, kageLosses: runs.filter(r => r.lost).length, timeouts: runs.filter(r => r.timeout).length,
  avgSeconds: +avg(r => r.time).toFixed(1), kageHpLeft: +avg(r => r.kageHp).toFixed(2), foeHpLeft: +avg(r => r.foeHp).toFixed(2),
  foeMaxHp: runs[0].foeMaxHp, kageMaxHp: runs[0].kageMaxHp,
  perRun: {
    kageParries: +avg(r => r.c.kageParries).toFixed(1), foeParries: +avg(r => r.c.foeParries).toFixed(1), kageCrits: +avg(r => r.c.kageCrits).toFixed(1), foeCrits: +avg(r => r.c.foeCrits).toFixed(1),
    foeBroken: +avg(r => r.c.foeBroken).toFixed(1), kageBroken: +avg(r => r.c.kageBroken).toFixed(1), spamPunish: +avg(r => r.c.spamPunish).toFixed(1), throws: +avg(r => r.c.throws).toFixed(1),
    styleStrings: +avg(r => r.c.strings).toFixed(1), dmgToFoe: Math.round(avg(r => r.c.dmgToFoe)), dmgToKage: Math.round(avg(r => r.c.dmgToKage))
  },
  abilitiesUsed: abil, extra: runs.reduce((a, r) => { for (const [k, v] of Object.entries(r.c.extra)) a[k] = +((a[k] || 0) + v / runs.length).toFixed(1); return a; }, {}), src: runs.reduce((a, r) => { for (const [k, v] of Object.entries(r.c.src)) a[k] = Math.round((a[k] || 0) + v / runs.length); return a; }, {}), errors: errs.length
};
if (arg('json', '')) console.log(JSON.stringify(sum));
else {
  console.log(`${foe} vs ${BOT} bot · ${sum.stage} · ${DIFF} · gear ${sum.gear} · style: ${sum.style}`);
  console.log(`  Kage wins ${sum.kageWins}/${RUNS}, loses ${sum.kageLosses}, timeouts ${sum.timeouts} · avg ${sum.avgSeconds}s · Kage hp left ${Math.round(sum.kageHpLeft * 100)}% · foe hp left ${Math.round(sum.foeHpLeft * 100)}% (foe ${sum.foeMaxHp} hp, Kage ${sum.kageMaxHp} hp)`);
  console.log('  per run: ' + Object.entries(sum.perRun).map(([k, v]) => `${k} ${v}`).join(' · '));
  console.log('  extra: ' + JSON.stringify(sum.extra) + ' · damage to Kage by source: ' + JSON.stringify(sum.src));
  console.log('  abilities: ' + (Object.entries(abil).map(([k, v]) => `${k}×${v}`).join(' ') || 'none'));
}
if (runs[0].ev.length) console.log('\n--- run 1 log ---\n' + runs[0].ev.join('\n'));
if (errs.length) { console.error(`\n${errs.length} run(s) threw:\n` + (errs[0].err.stack || errs[0].err)); process.exit(1); }
