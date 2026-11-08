/* KAGE — directional sword arcs: W / A / S / D + attack for every weapon, every foe, every boss.

   The direction held with the weapon button picks the cut (Fighter.attackDir):
     fwd       A or D + attack        horizontal slash toward the side pressed (Kage turns to face it first)
     up        W + attack             rising slash, low-front up past the head: launches, Kage follows
     down      S + attack             overhead downward slash: knocks down, breaks guard, spikes an airborne foe
     diagUp    W + A/D + attack       diagonal rising slash (gyaku-kesa) from the hip behind up to the front: pops up
     diagDown  S + A/D + attack       diagonal downward slash (kesa-giri) from the rear shoulder down to the front
     airUp / airDown                  in the air: rising cut that carries upward / overhead plunge that quakes on landing
     dash      dash, then attack      iai dash strike: the blade drawn from the hip into a passing horizontal cut

   Nothing turns the whole body. Each cut is four authored keyframes (anticipation `a`, wind-up `w`, strike `s`,
   follow-through `f`) played on Fighter.movePose's timeline; the arms reach for hand targets (hx/hy, two-bone IK in
   Fighter.computeSkeleton) along the arc's path, the blade angle (wa) sweeps with them, and the torso (lean, twist tw,
   hip turn hp, hip shift rx) and the legs carry the weight. Weapons are grouped by how they are held (ARC_GRIP); each
   grip adapts the same arcs: a second hand on the hilt (two-handed: IK grip), a trailing off-hand blade (twin), a free
   counter-balancing arm (one-handed), deeper loading (heavy), a straight thrust (polearm forward). Bare hands keep their
   punches and kicks.

   Each form takes its numbers (damage, sounds, element, timing) from a source move of the family's own string
   (DIR_FORMS) with DIR_RULES laid over them, so a new weapon on an existing family gets the full set for free.
   `sweep: [box0, box1]` is the hitbox at the start and the end of the active frames: Fighter.hitbox moves it along
   the arc, so an upward cut hits low first and high last. `box` is the union (AI reach checks). Ids: `<source>_<dir>`. */
const DIR_KEYS = ['fwd', 'up', 'down', 'diagUp', 'diagDown', 'airUp', 'airDown', 'dash'];
// the forms that turn to face the side pressed (A / D): the horizontal, both diagonals and the dash strike
const DIR_SIDED = { fwd: 1, diagUp: 1, diagDown: 1, dash: 1 };
const DIR_FORMS = {
  fists:     { fwd: 'dp',  up: 'p3',  down: 'pa2', diagUp: 'p3',  diagDown: 'slide', airUp: 'ap',  airDown: 'ak',  dash: 'dp' },
  tsubame:   { fwd: 'tw1', up: 'tw3', down: 'tw1', diagUp: 'tw4', diagDown: 'tw2',   airUp: 'twa', airDown: 'twa', dash: 'twc' },
  kagetsu:   { fwd: 'k3',  up: 'k2',  down: 'k1',  diagUp: 'k2',  diagDown: 'k1',    airUp: 'ka',  airDown: 'ka',  dash: 'kc' },
  onikiri:   { fwd: 'c1',  up: 'c2',  down: 'c3',  diagUp: 'c2',  diagDown: 'c1',    airUp: 'ca',  airDown: 'ca',  dash: 'c1' },
  mizuchi:   { fwd: 's1',  up: 's2',  down: 's3',  diagUp: 's2',  diagDown: 's3',    airUp: 'sa',  airDown: 'sa',  dash: 's1' },
  yamigama:  { fwd: 'h1',  up: 'h3',  down: 'h1',  diagUp: 'h3',  diagDown: 'h1',    airUp: 'ha',  airDown: 'ha',  dash: 'h1' },
  iwakudaki: { fwd: 'm2',  up: 'm2',  down: 'm1',  diagUp: 'm2',  diagDown: 'm1',    airUp: 'ma',  airDown: 'ma',  dash: 'm1' },
  shinsen:   { fwd: 'sh3', up: 'sh2', down: 'sh1', diagUp: 'sh2', diagDown: 'sh1',   airUp: 'sha', airDown: 'sha', dash: 'shc' },
  shizuka:   { fwd: 'sz1', up: 'sz2', down: 'sz4', diagUp: 'sz2', diagDown: 'sz1',   airUp: 'sza', airDown: 'sza', dash: 'szc' }
};

/* ---- the arcs: hand target (hx, hy: body units from the shoulder centre, x forward, y down), blade angle (wa), torso and
   legs per key. Authored for a two-handed blade facing right; ARC_GRIP adapts them. ---- */
const ARC_LEGS = {
  coil:   { fh: 26, fk: -36, bh: -30, bk: -30 },       // weight sinking onto the back leg
  crouch: { fh: 58, fk: -98, bh: -36, bk: -72 },       // deep knees, ready to spring up
  tall:   { fh: 18, fk: -6, bh: -26, bk: -10 },        // driven up onto the toes
  lunge:  { fh: 52, fk: -30, bh: -48, bk: -4 },        // front knee over the foot, back leg long
  drop:   { fh: 58, fk: -58, bh: -46, bk: -12 },        // stepping in and sinking under the cut
  tuck:   { fh: 62, fk: -92, bh: 10, bk: -72 },         // in the air: knees drawn up
  reach:  { fh: 34, fk: -40, bh: -12, bk: -44 }         // in the air: legs opening under the cut
};
const ARC = (o, legs) => Object.assign({ gk: 1, head: 4, rx: 0, hp: 0 }, legs ? ARC_LEGS[legs] : null, o);
const SWORD_ARCS = {
  // horizontal: drawn back level with the rear shoulder, the blade swept over and through at chest height
  fwd: {
    a: ARC({ hx: -22, hy: 8, wa: 242, lean: -4, rx: -8, tw: -0.85, hp: -0.4 }, 'coil'),
    w: ARC({ hx: -30, hy: 2, wa: 254, lean: -8, rx: -12, tw: -1, hp: -0.5, head: 6, fk: -40, bk: -34 }, 'coil'),
    s: ARC({ hx: 60, hy: 20, wa: 88, lean: 20, rx: 18, head: 8, tw: 0.85, hp: 0.55 }, 'lunge'),
    f: ARC({ hx: 44, hy: 32, wa: 60, lean: 24, rx: 16, head: 8, tw: 1, hp: 0.6, fk: -34, bk: -6 }, 'lunge'),
    flat: 0.42 },
  // rising: from a deep crouch the blade climbs from the floor in front up past the head
  up: {
    a: ARC({ hx: 26, hy: 52, wa: 42, lean: 18, head: 10, rx: 4, tw: -0.5, hp: -0.2 }, 'crouch'),
    w: ARC({ hx: 20, hy: 58, wa: 26, lean: 22, head: 12, rx: 2, tw: -0.6, hp: -0.25, fh: 62, fk: -104, bk: -76 }, 'crouch'),
    s: ARC({ hx: 20, hy: -58, wa: 172, lean: -8, head: -8, rx: 6, tw: 0.6, hp: 0.4 }, 'tall'),
    f: ARC({ hx: 8, hy: -64, wa: 196, lean: -12, head: -10, rx: 4, tw: 0.7, hp: 0.3, fh: 16, fk: -8, bk: -12 }, 'tall') },
  // overhead: hands lifted over the head, the blade falling straight down the centre line as the body drops under it
  down: {
    a: ARC({ hx: 4, hy: -60, wa: 196, lean: -6, head: -6, tw: -0.3, hp: -0.1, fh: 22, fk: -14, bh: -24, bk: -14 }),
    w: ARC({ hx: -6, hy: -64, wa: 222, lean: -12, head: -8, rx: -6, tw: -0.45, hp: -0.15, fh: 24, fk: -16, bh: -26, bk: -16 }),
    s: ARC({ hx: 36, hy: 40, wa: 30, lean: 30, head: 10, rx: 14, tw: 0.6, hp: 0.45 }, 'drop'),
    f: ARC({ hx: 30, hy: 50, wa: 12, lean: 34, head: 12, rx: 12, tw: 0.7, hp: 0.4, fk: -64, bk: -16 }, 'drop') },
  // diagonal rising (gyaku-kesa): from the hip behind, under and up through the front at 45 degrees
  diagUp: {
    a: ARC({ hx: -8, hy: 50, wa: -38, lean: 14, head: 8, rx: -6, tw: -0.8, hp: -0.4, fh: 42, fk: -70, bh: -34, bk: -50 }),
    w: ARC({ hx: -14, hy: 52, wa: -50, lean: 16, head: 8, rx: -10, tw: -0.95, hp: -0.5, fh: 46, fk: -78, bh: -36, bk: -56 }),
    s: ARC({ hx: 44, hy: -38, wa: 138, lean: 6, head: -4, rx: 16, tw: 0.8, hp: 0.55, fh: 44, fk: -22, bh: -40, bk: -6 }),
    f: ARC({ hx: 30, hy: -52, wa: 160, lean: 2, head: -6, rx: 14, tw: 0.95, hp: 0.5, fh: 40, fk: -20, bh: -38, bk: -8 }) },
  // diagonal downward (kesa-giri): from above the rear shoulder down across to the front knee
  diagDown: {
    a: ARC({ hx: -16, hy: -40, wa: 228, lean: -6, head: -2, rx: -6, tw: -0.8, hp: -0.3, fh: 26, fk: -26, bh: -30, bk: -22 }),
    w: ARC({ hx: -22, hy: -44, wa: 238, lean: -10, head: -2, rx: -10, tw: -0.95, hp: -0.4, fh: 28, fk: -30, bh: -32, bk: -26 }),
    s: ARC({ hx: 48, hy: 34, wa: 52, lean: 30, head: 10, rx: 22, tw: 0.85, hp: 0.6, fh: 60, fk: -60, bh: -48, bk: -10 }),
    f: ARC({ hx: 38, hy: 46, wa: 30, lean: 34, head: 12, rx: 18, tw: 1, hp: 0.55, fh: 62, fk: -68, bh: -48, bk: -14 }) },
  // iai: crouched with the hilt at the hip, the blade drawn out under and level into a passing cut
  dash: {
    a: ARC({ hx: -4, hy: 48, wa: -64, lean: 22, head: 10, rx: -4, tw: -0.9, hp: -0.4, fh: 48, fk: -64, bh: -40, bk: -40 }),
    w: ARC({ hx: -8, hy: 50, wa: -74, lean: 26, head: 10, rx: -6, tw: -1, hp: -0.45, fh: 52, fk: -70, bh: -44, bk: -44 }),
    s: ARC({ hx: 64, hy: 10, wa: 96, lean: 26, head: 8, rx: 30, tw: 0.9, hp: 0.6, fh: 58, fk: -34, bh: -56, bk: -2 }),
    f: ARC({ hx: 56, hy: 16, wa: 92, lean: 22, head: 8, rx: 26, tw: 1, hp: 0.6, fh: 56, fk: -36, bh: -54, bk: -4 }),
    flat: 0.5 },
  airUp: {
    a: ARC({ hx: 26, hy: 46, wa: 40, lean: 14, head: 8, tw: -0.5 }, 'tuck'),
    w: ARC({ hx: 22, hy: 50, wa: 28, lean: 16, head: 8, tw: -0.6 }, 'tuck'),
    s: ARC({ hx: 20, hy: -56, wa: 174, lean: -8, head: -8, tw: 0.6, hp: 0.3 }, 'reach'),
    f: ARC({ hx: 10, hy: -62, wa: 194, lean: -10, head: -8, tw: 0.7, hp: 0.3 }, 'reach') },
  airDown: {
    a: ARC({ hx: 4, hy: -58, wa: 200, lean: -4, head: -6, tw: -0.3 }, 'tuck'),
    w: ARC({ hx: -6, hy: -62, wa: 224, lean: -10, head: -8, tw: -0.45 }, 'tuck'),
    s: ARC({ hx: 32, hy: 44, wa: 18, lean: 34, head: 12, tw: 0.6, hp: 0.4 }, 'reach'),
    f: ARC({ hx: 26, hy: 52, wa: 6, lean: 36, head: 12, tw: 0.7, hp: 0.4 }, 'reach') }
};
// a polearm's forward form and dash are straight thrusts: drawn back along the shaft, then driven through
const POLE_THRUST = {
  a: ARC({ hx: -16, hy: 24, wa: 96, lean: -4, rx: -12, tw: -0.6, hp: -0.3 }, 'coil'),
  w: ARC({ hx: -24, hy: 26, wa: 96, lean: -8, rx: -16, tw: -0.75, hp: -0.4 }, 'coil'),
  s: ARC({ hx: 64, hy: 16, wa: 92, lean: 22, rx: 28, head: 8, tw: 0.7, hp: 0.5 }, 'lunge'),
  f: ARC({ hx: 56, hy: 18, wa: 92, lean: 18, rx: 24, head: 8, tw: 0.8, hp: 0.5 }, 'lunge')
};

/* ---- grips: how a weapon's hands adapt the arcs ---- */
function arcGrip(w) {
  const st = w.stance;
  if (st === 'fists' || st === 'orbs') return 'fists';
  if (st === 'twin') return 'twin';
  if (st === 'spear' || st === 'staff' || st === 'shield') return 'pole';
  if (st === 'hammer') return 'heavy2';
  if (st === 'cleaver') return 'heavy1';
  if (st === 'sickle') return 'one';
  return w.hands === 2 ? 'blade' : 'one';
}
const ARC_KEYS4 = ['a', 'w', 's', 'f'];
// the free arm of a one-handed cut: guarding in front while the blade loads, flung back for balance as it cuts
const ARC_BALANCE = { a: { bs: 58, be: 64 }, w: { bs: 66, be: 52 }, s: { bs: -52, be: 40 }, f: { bs: -36, be: 58 } };
function arcPoses(dir, grip, stance, over) {
  const src = grip === 'pole' && (dir === 'fwd' || dir === 'dash') ? POLE_THRUST : SWORD_ARCS[dir];
  const out = {};
  for (const k of ARC_KEYS4) {
    const q = P(Object.assign({}, src[k], over && over[k]), stance);
    q.wb = stance.wb; q.ik = 0; q.gb = 0;
    if (grip === 'blade' || grip === 'pole' || grip === 'heavy2') q.ik = 1;        // the back hand on the hilt (IK_OFF)
    if (grip === 'heavy1' || grip === 'heavy2') {
      // heavy: loads deeper and falls further into the cut
      if (k === 'a' || k === 'w') { q.lean -= 5; q.rx -= 4; q.fk -= 8; q.bk -= 8; }
      else { q.lean += 5; q.fk -= 6; }
    }
    if (grip === 'one' || grip === 'heavy1') Object.assign(q, ARC_BALANCE[k]);
    out[k] = q;
  }
  if (grip === 'twin') {
    // the off-hand blade follows the same arc a beat behind: a double cut out of one motion
    const prev = { a: 'a', w: 'a', s: 'w', f: 's' };
    for (const k of ARC_KEYS4) {
      const q = out[k], p = out[prev[k]], mid = k === 's';
      q.gb = 1;
      q.bx = (mid ? (p.hx + q.hx) / 2 : p.hx) - 8; q.by = (mid ? (p.hy + q.hy) / 2 : p.hy) + 8;
      q.wb = (mid ? (p.wa + q.wa) / 2 : p.wa) - 14;
    }
  }
  return out;
}

/* ---- the numbers each direction lays over its source move (m: the source, second: the family string's 2nd hit,
   R: the source's reach in front of the feet). `t` scales the source timing [start-up, active, recovery]. ---- */
const DIR_RULES = {
  fwd:      (m, second, R) => ({ t: [1, 1, 1], lunge: Math.max(m.lunge || 0, 420), kb: 320, up: 0, dmg: m.dmg * 1.05, kd: 0, hop: 0, next: second, stamp: null, label: 'HORIZONTAL SLASH',
    sweep: [[0, -206, R * 0.7, 100], [14, -182, R + 6, 76]] }),
  up:       (m, second, R) => ({ t: [1.05, 1, 1.05], up: -760, kb: 110, hop: -620, lunge: 100, dmg: m.dmg * 1.1, imp: Math.max(2, m.imp || 0), kd: 0, stamp: 'LAUNCH', label: 'RISING SLASH',
    sweep: [[10, -124, R * 0.85, 124], [-6, -322, R * 0.8, 160]] }),
  down:     (m, second, R) => ({ t: [1.2, 1, 1.1], kd: 1, up: -160, spike: 1150, kb: 240, gb: Math.max(m.gb || 0, 55), lunge: 160, dmg: m.dmg * 1.2, imp: 2, stamp: 'SLAM', label: 'DOWNWARD SLASH',
    sweep: [[-6, -322, R * 0.85, 150], [10, -172, R * 0.95, 172]] }),
  diagUp:   (m, second, R) => ({ t: [0.95, 1, 1], lunge: 360, up: -520, kb: 200, hop: 0, dmg: m.dmg * 1.1, imp: 2, kd: 0, stamp: 'RISE', label: 'RISING DIAGONAL',
    sweep: [[6, -112, R * 0.9, 112], [6, -300, R * 0.85, 170]] }),
  diagDown: (m, second, R) => ({ t: [1.05, 1, 1.05], lunge: 340, kd: 1, up: -220, kb: 300, gb: Math.max(m.gb || 0, 40), dmg: m.dmg * 1.15, imp: 2, stamp: 'CUT', label: 'DIAGONAL SLASH',
    sweep: [[6, -300, R * 0.85, 160], [12, -132, R + 8, 132]] }),
  airUp:    (m, second, R) => ({ t: [1, 1, 1], kind: 'air', up: -560, hop: -420, kb: 120, imp: Math.max(1, m.imp || 0), label: 'AIR RISING CUT',
    sweep: [[6, -150, R * 0.85, 130], [-6, -310, R * 0.8, 180]] }),
  airDown:  (m, second, R) => ({ t: [1, 1, 1], kind: 'air', dive: 1500, kd: 1, up: -200, spike: 1150, kb: 220, dmg: m.dmg * 1.3, imp: 2, stamp: 'PLUNGE', label: 'PLUNGE',
    sweep: [[0, -270, R * 0.85, 160], [6, -150, R * 0.9, 210]] }),
  dash:     (m, second, R) => ({ t: [0.8, 1, 1.1], lunge: 760, dmg: m.dmg * 1.2, kb: 420, kd: 0, hop: 0, up: 0, imp: 2, next: second, stamp: 'DASH', label: 'IAI DASH STRIKE',
    sweep: [[-10, -152, R * 0.7, 82], [14, -188, R + 20, 88]] })
};
// what a form never inherits from its source: those mechanics belong to that one string move
const DIR_STRIP = ['spin', 'rot', 'chain', 'pull', 'disarm', 'counter', 'shock', 'multi', 'low', 'crouch', 'flip', 'next', 'echo', 'a', 'w', 's', 'f', '__built'];
function boxUnion(a, b) {
  const x0 = Math.min(a[0], b[0]), y0 = Math.min(a[1], b[1]), x1 = Math.max(a[0] + a[2], b[0] + b[2]), y1 = Math.max(a[1] + a[3], b[1] + b[3]);
  return [Math.round(x0), Math.round(y0), Math.round(x1 - x0), Math.round(y1 - y0)];
}
/* ---- signature forms: each of Kage's shop weapons cuts its own way ----
   Kagetsu keeps the katana arcs above (they were authored on it). Every other shop weapon lays its own keys over them:
   `pose` (arc keys before the grip adapts them: hand path hx/hy, blade angle wa, body), `hands` (after: the off hand,
   the grip), `mech` (its own mechanics on top of the direction's rule: `hits` cuts out of one motion, `reach` extra
   sweep, `chain` reach thrown on the chain, `shock`, `pull`, `armor`, `low`, `echo` a delayed silent cut, any number),
   `t` (timing scale) and a `label`; `all` applies to every direction (its `t`, `dmg`, `kb`, `gb` and `mech`).
   The direction rules still hold (combat-dir.test.js): a rising cut launches, an overhead knocks down and breaks guard,
   the dash strike reaches furthest. `move` is the weapon's footwork (Fighter.weaponStyle): walk / run / dash speed,
   dash cool-down, and the trail its dash leaves (`dashFx`). Only the weapon itself carries these: the foes whose arms
   share its family keep the family's forms. Ids: `<weapon>_<dir>`. */
const IAI = { a: { hx: -4, hy: 44, wa: 262, lean: 10, head: 6, rx: -6 }, w: { hx: -8, hy: 46, wa: 268, lean: 14, head: 8, rx: -8 }, s: { hx: 66, hy: 12, wa: 92, lean: 26, rx: 26 }, f: { hx: 70, hy: 4, wa: 100, lean: 22, rx: 22 } };
const IAI_HANDS = { a: { ik: 0, bs: 26, be: 66 }, w: { ik: 0, bs: 30, be: 64 }, s: { ik: 0, bs: -40, be: 30 }, f: { ik: 0, bs: -46, be: 40 } };
const ARC_STYLES = {
  // Tsubame, the swallow: the quickest hands in the Armory. Scissor cuts out of a reverse grip, three cuts in every
  // motion (both fangs and a flick back), a dash that passes clean through the foe, a steep diving swoop.
  tsubame: { name: 'Swallow', move: { walk: 1.1, run: 1.12, dash: 1.18, cd: 0.85, dashFx: 'lightning' },
    all: { t: [0.82, 0.9, 0.8], dmg: 0.7, mech: { hits: 3 } },
    dirs: {
      fwd: { label: 'CROSS FANG',
        pose: { a: { hx: 12, hy: -40, wa: 206, lean: -2, tw: -0.6 }, w: { hx: 6, hy: -46, wa: 220, lean: -6, tw: -0.8 }, s: { hx: 62, hy: 30, wa: 64, lean: 22 }, f: { hx: 48, hy: 42, wa: 46, lean: 26 } },
        hands: { a: { bx: -4, by: -38, wb: 214, gb: 1 }, w: { bx: -10, by: -44, wb: 228, gb: 1 }, s: { bx: 56, by: -30, wb: 118, gb: 1 }, f: { bx: 44, by: -42, wb: 138, gb: 1 } } },
      dash: { label: 'SWALLOW PASS', t: [0.8, 1, 1], mech: { lunge: 1000 },
        pose: { a: { hx: -14, hy: 30, wa: 250 }, w: { hx: -20, hy: 32, wa: 258 }, s: { hx: 62, hy: 10, wa: 100 }, f: { hx: 58, hy: 4, wa: 104 } },
        hands: { a: { bx: -22, by: 36, wb: 246, gb: 1 }, w: { bx: -28, by: 38, wb: 252, gb: 1 }, s: { bx: 52, by: 24, wb: 80, gb: 1 }, f: { bx: 50, by: 20, wb: 76, gb: 1 } } },
      up: { label: 'RISING SWALLOWS' }, down: { label: 'TALON DROP' }, diagUp: { label: 'WING RISE' }, diagDown: { label: 'WING CUT' },
      airUp: { label: 'UPDRAFT' }, airDown: { label: 'SWALLOW DIVE', mech: { dive: 1900 } } } },
  // Shizuka, silence: iai. The level cut and the dash strike are drawn one-handed from the scabbard at the hip, the
  // free hand holding it back; the dash strike's silent cut lands a beat after the blade has passed.
  shizuka: { name: 'Silence', move: { walk: 1.04, run: 1.08, dash: 1.1, cd: 0.95, dashFx: 'violet' },
    all: { t: [0.86, 1, 0.9], dmg: 0.95 },
    dirs: {
      fwd: { label: 'NUKITSUKE', pose: IAI, hands: IAI_HANDS },
      dash: { label: 'SENKO', pose: { a: Object.assign({}, IAI.a, { hy: 50, lean: 18 }), w: Object.assign({}, IAI.w, { hy: 52, lean: 22 }), s: Object.assign({}, IAI.s, { hy: 18 }), f: IAI.f }, hands: IAI_HANDS,
        mech: { lunge: 900, echo: { delay: 0.26, dmg: 7, kb: 360, up: -200, hs: 0.4, imp: 2, stamp: 'SILENCE' } } },
      up: { label: 'TSUKIAGE' }, down: { label: 'SHIZUKU' }, diagUp: { label: 'GYAKU-KESA' }, diagDown: { label: 'KESA' },
      airUp: { label: 'MOONRISE' }, airDown: { label: 'FALLING HUSH' } } },
  // Onikiri, the demon cutter: slow, heavy, guard-breaking. Every cut loads further back and lands harder; the overhead
  // and the kesa diagonal split the floor, the dash is a shoulder-first rush under super armour.
  onikiri: { name: 'Demon', move: { walk: 0.9, run: 0.92, dash: 0.9, cd: 1.1, dashFx: 'flame', stomp: 1 },
    all: { t: [1.12, 1.1, 1.08], dmg: 1.1, kb: 1.15, gb: 25 },
    dirs: {
      fwd: { label: 'DEMON SWEEP', mech: { lunge: 470 },
        pose: { a: { hx: -34, hy: 12, wa: 258, tw: -1 }, w: { hx: -42, hy: 6, wa: 268, lean: -12, tw: -1.1 }, s: { hx: 62, hy: 24, wa: 84, lean: 24 }, f: { hx: 34, hy: 42, wa: 40, lean: 28 } } },
      down: { label: 'ONI DROP', mech: { shock: 1, armor: 1 },
        pose: { a: { hx: -10, hy: -66, wa: 216 }, w: { hx: -18, hy: -70, wa: 238, lean: -14 }, s: { hx: 40, hy: 52, wa: 24, lean: 38 }, f: { hx: 34, hy: 60, wa: 10, lean: 40 } } },
      up: { label: 'HELL RISER', mech: { up: -820 } },
      dash: { label: 'HORN RUSH', mech: { armor: 1, lunge: 840 },
        pose: { a: { hx: -22, hy: 42, wa: -40 }, w: { hx: -26, hy: 44, wa: -50 }, s: { hx: 56, hy: -10, wa: 120 }, f: { hx: 46, hy: -22, wa: 140 } } },
      diagUp: { label: 'FANG RISE' }, diagDown: { label: 'KESA CLEAVE', mech: { shock: 1 } },
      airUp: { label: 'FLAME VAULT' }, airDown: { label: 'ONI FALL', mech: { dive: 1700 } } } },
  // Mizuchi, the water dragon: the longest reach. Double thrusts, a vaulting thrust straight up, a slam of the shaft that
  // throws a wave along the floor, a low sweep that takes the legs, a spear-first dive.
  mizuchi: { name: 'Dragon', move: { walk: 1, run: 1.05, dash: 1.06, cd: 1, dashFx: 'water' },
    all: { t: [0.95, 1.05, 1] },
    dirs: {
      fwd: { label: 'TWIN FANG THRUST', mech: { hits: 2 } },
      dash: { label: 'DRAGON LUNGE', mech: { hits: 2, lunge: 980 } },
      up: { label: 'DRAGON ASCENT', mech: { hop: -700 },
        pose: { a: { hx: 30, hy: 48, wa: 54 }, w: { hx: 22, hy: 54, wa: 40 }, s: { hx: 26, hy: -58, wa: 176, lean: -10 }, f: { hx: 18, hy: -64, wa: 184 } } },
      down: { label: 'TIDE BREAKER', mech: { shock: 1 },
        pose: { a: { hx: 2, hy: -62, wa: 204 }, w: { hx: -8, hy: -66, wa: 226 }, s: { hx: 44, hy: 34, wa: 48, lean: 32 }, f: { hx: 40, hy: 42, wa: 40 } } },
      diagDown: { label: 'UNDERTOW', mech: { low: 1 }, pose: { s: { hx: 50, hy: 48, wa: 38, lean: 34 }, f: { hx: 44, hy: 54, wa: 26 } } },
      diagUp: { label: 'RISING CURRENT' }, airUp: { label: 'WAVE CREST' },
      airDown: { label: 'FALLING DRAGON', mech: { dive: 1800 }, pose: { s: { hx: 20, hy: 56, wa: 4 }, f: { hx: 18, hy: 58, wa: 0 } } } } },
  // Yamigama, the reaper: the sickle goes out on its chain. The level cut lashes far across the floor, the dash strike
  // hooks the foe and drags them in, the diagonals sweep the chain; the overhead hooks down from above.
  yamigama: { name: 'Reaper', move: { walk: 1.02, run: 1.06, dash: 1.04, cd: 0.95, dashFx: 'shadow' },
    all: { t: [1, 1, 1] },
    dirs: {
      fwd: { label: 'CHAIN LASH', mech: { chain: 200, reach: 190, kb: 160 },
        pose: { a: { hx: -26, hy: -10, wa: 250 }, w: { hx: -34, hy: -16, wa: 262, lean: -10 }, s: { hx: 66, hy: 6, wa: 94, lean: 22 }, f: { hx: 56, hy: 16, wa: 100 } } },
      dash: { label: 'REAPER\'S PULL', mech: { chain: 260, reach: 240, pull: 1, kb: 0 } },
      down: { label: 'GRAVE HOOK', pose: { a: { hx: 6, hy: -66, wa: 190 }, w: { hx: -4, hy: -70, wa: 208 }, s: { hx: 40, hy: 44, wa: 20 }, f: { hx: 34, hy: 52, wa: 6 } } },
      up: { label: 'CRESCENT LIFT' }, diagUp: { label: 'BLOOD RISE', mech: { chain: 120, reach: 100 } }, diagDown: { label: 'BLOOD REAP', mech: { chain: 120, reach: 100 } },
      airUp: { label: 'MOON HOOK' }, airDown: { label: 'SHADOW FALL' } } },
  // Iwakudaki, the rock crusher: the slowest weapon, every grounded swing under super armour. A wide boulder swing, an
  // overhead and a landslide diagonal that split the floor, a ram, a meteor dive.
  iwakudaki: { name: 'Mountain', move: { walk: 0.86, run: 0.88, dash: 0.84, cd: 1.15, dashFx: 'earth', stomp: 1 },
    all: { t: [1.12, 1.1, 1.1], dmg: 1.12, kb: 1.2, gb: 30, mech: { armor: 1 } },
    dirs: {
      fwd: { label: 'BOULDER SWING', mech: { lunge: 440 },
        pose: { a: { hx: -30, hy: 30, wa: 238 }, w: { hx: -38, hy: 26, wa: 250, lean: -14 }, s: { hx: 60, hy: 10, wa: 100, lean: 22 }, f: { hx: 40, hy: -18, wa: 148, lean: 10 } } },
      down: { label: 'EARTH BELL', mech: { shock: 1 },
        pose: { a: { hx: -6, hy: -70, wa: 196 }, w: { hx: -16, hy: -74, wa: 216, lean: -14 }, s: { hx: 40, hy: 50, wa: 20, lean: 40 }, f: { hx: 38, hy: 56, wa: 8, lean: 42 } } },
      up: { label: 'MOUNTAIN LIFT', mech: { up: -860 } },
      dash: { label: 'RAM', mech: { lunge: 720 } },
      diagUp: { label: 'ROCK RISE' }, diagDown: { label: 'LANDSLIDE', mech: { shock: 1 } },
      airUp: { label: 'UPHEAVAL', mech: { armor: 0 } }, airDown: { label: 'METEOR', mech: { dive: 2000, armor: 0 } } } }
};

// one directional form of family `fam` for direction `dir`. `st` (a weapon's ARC_STYLES entry, or null for the family's
// shared forms) lays its own arc keys over the shared arcs (`pose`, before the grip adapts them; `hands`, after) and its
// own numbers over the direction's rule (`mech`, plus `all` for every direction).
function buildDirForm(fam, dir, st) {
  // (the shared forms flow into the family's own string, `baseMoves` where Kage's weapon has its own; a weapon's
  // signature forms flow into that weapon's string)
  const fw = WEAPONS[fam], forms = DIR_FORMS[fam], second = ((st ? WEAPONS[st.id].moves : fw.baseMoves || fw.moves) || [])[1] || null;
  const grip = arcGrip(fw), stance = STANCES[fw.stance] || STANCES.fists;
  const src = MOVES[forms[dir]];
  const air = dir === 'airUp' || dir === 'airDown';
  const R = src.box[0] + src.box[2];
  const rule = DIR_RULES[dir](src, second, R);
  const m = Object.assign({}, src);
  for (const k of DIR_STRIP) delete m[k];
  Object.assign(m, rule, { kind: air ? 'air' : 'weapon' });
  m.t = src.t.map((v, i) => Math.round(v * rule.t[i] * 1000) / 1000);
  const sd = st && (st.dirs[dir] || {}), all = st && st.all || {};
  if (st) {
    // the weapon's own pace, then this cut's
    const tk = [0, 1, 2].map(i => (all.t ? all.t[i] : 1) * (sd.t ? sd.t[i] : 1));
    m.t = m.t.map((v, i) => Math.round(v * tk[i] * 1000) / 1000);
  }
  m.t[1] = Math.max(m.t[1], 0.07);                     // long enough for the swept hitbox to cross the arc
  if (grip !== 'fists') m.t[0] = Math.max(m.t[0], 0.06);   // and enough start-up to read the anticipation
  m.id = st ? `${st.id}_${dir}` : `${src.id}_${dir}`; m.aim = dir; m.family = fam; m.grip = grip; m.dmg = Math.round(m.dmg * 10) / 10;
  if (src.armor) m.armor = 1;                          // the hammer keeps its super armour
  if (grip === 'fists') {
    // bare hands keep their own punch and kick poses (no blade arc): the uppercut, the lunge punch, the low sweep
    m.w = src.w; m.s = src.s; if (src.a) m.a = src.a; if (src.f) m.f = src.f;
    if (air && dir === 'airUp') { m.w = src.s; m.s = src.w; m.f = src.w; }
    delete m.flat;
  } else {
    const q = arcPoses(dir, grip, stance, sd && sd.pose);
    if (sd && sd.hands) for (const k of ARC_KEYS4) if (sd.hands[k]) Object.assign(q[k], sd.hands[k]);
    m.a = q.a; m.w = q.w; m.s = q.s; m.f = q.f;
    m.limb = 'w';
    const arc = SWORD_ARCS[dir];
    if (arc.flat && !(grip === 'pole' && (dir === 'fwd' || dir === 'dash'))) m.flat = arc.flat;
  }
  if (grip === 'twin') m.multi = [2, Math.max(0.04, m.t[1] * 0.5)];   // both blades cut
  m.sweep = grip === 'fists' ? null : rule.sweep.map(b => b.map(v => Math.round(v)));
  if (grip === 'pole' && (dir === 'fwd' || dir === 'dash')) m.sweep = [[30, -196, Math.round(R * 0.6), 60], [30, -186, Math.round(R + 10), 52]];
  if (st) {
    // the weapon's numbers: damage and knockback scale, its mechanics (multi-hit count, chain reach, shock, pull, armour)
    const mech = Object.assign({}, all.mech || {}, sd.mech || {});
    if (all.dmg || sd.dmg) m.dmg = Math.round(m.dmg * (all.dmg || 1) * (sd.dmg || 1) * 10) / 10;
    if (all.kb) m.kb = Math.round((m.kb || 0) * all.kb);
    if (all.gb) m.gb = Math.round((m.gb || 0) + all.gb);
    for (const k in mech) {
      if (k === 'hits') m.multi = [mech.hits, Math.max(0.03, Math.round(m.t[1] / mech.hits * 1000) / 1000)];
      else if (k === 'reach' && m.sweep) m.sweep = m.sweep.map(b => [b[0], b[1], b[2] + mech.reach, b[3]]);
      else m[k] = mech[k];
    }
    if (sd.sweep) m.sweep = sd.sweep.map(b => b.slice());
    m.label = sd.label || m.label; m.style = st.id;
    if (sd.fx) m.fx = sd.fx;
  }
  if (m.sweep) m.box = boxUnion(m.sweep[0], m.sweep[1]); else { m.box = src.box.slice(); delete m.sweep; }   // fists: the punch's own box
  for (const k of Object.keys(m)) if ((m[k] === 0 || m[k] == null) && !(k in src) && k !== 'up') delete m[k];
  if (MOVES[m.id]) throw new Error('[KAGE] move id collision: ' + m.id);
  MOVES[m.id] = m;
  return m.id;
}
(function buildDirMoves() {
  // the family that owns a weapon's forms: the weapon (with its own defs) whose defs hold its first move
  const own = {};
  for (const id in DIR_FORMS) for (const k in WEAPONS[id].defs) own[k] = id;
  for (const fam in DIR_FORMS) {
    const dirs = {};
    for (const dir of DIR_KEYS) dirs[dir] = buildDirForm(fam, dir, null);
    DIR_FORMS[fam].ids = dirs;
  }
  // every weapon carries the ids of its family's directional forms (`dirs`); Kage's shop weapons with a style carry
  // their own signature forms instead (the foes that share a family keep the shared ones)
  for (const id in WEAPONS) {
    const w = WEAPONS[id], fam = own[(w.moves || [])[0]];
    if (!fam) continue;
    const st = ARC_STYLES[id];
    if (st) {
      st.id = id; const dirs = {};
      for (const dir of DIR_KEYS) dirs[dir] = buildDirForm(fam, dir, st);
      w.dirs = dirs;
    } else w.dirs = DIR_FORMS[fam].ids;
  }
})();

/* ---- the directional combo (Fighter.startMove, Combat.applyHit) ----
   A cut can flow into a cut in a DIFFERENT direction from its follow-through (on a hit, or late in the recovery of a
   whiff): the blade is already moving, so the chained cut skips its anticipation and starts `flow` faster. Each change
   of direction in a row raises `step` (to `max`): +`dmg` damage per step, and from `finisher` on the cut lands one
   impact tier harder with a beat of slow motion. Repeating a direction never chains: it has to start from stance. */
const DIR_COMBO = { flow: 0.72, dmg: 0.06, max: 4, finisher: 3, whiff: 0.4 };
