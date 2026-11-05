/* KAGE — game data. Weapons, gear, enemies, bosses and acts are plain data objects:
   add a new entry here and it appears in the Armory / campaign automatically. */

/* ---------------- Poses ----------------
   Angles in degrees, authored facing right.
   Limb angle: 0 = straight down, 90 = forward, 180 = up, -90 = back.
   lean: torso tilt (0 upright, + forward). rot: whole-body spin around the hip.
   f-/b- prefixed keys = front/back arm (s shoulder, e elbow bend) and leg (h hip, k knee, negative bends back).
   wa/wb = absolute angle of main / off-hand weapon (null = follows the forearm). */
const POSE_KEYS = ['lean', 'head', 'rot', 'fs', 'fe', 'bs', 'be', 'fh', 'fk', 'bh', 'bk', 'wa', 'wb', 'rx', 'tw', 'hp'];
const BASE_POSE = { lean: 6, head: 0, rot: 0, fs: 55, fe: 95, bs: 30, be: 115, fh: 22, fk: -16, bh: -22, bk: -20, wa: null, wb: null, rx: 0, tw: -0.2, hp: 0 };
function P(o, base) { return Object.assign({}, base || BASE_POSE, o); }

const STANCES = {
  // bladed fighting stance: lead hand at chin height, rear fist guarding the jaw, chin tucked, knees soft
  fists:  P({ lean: 8, head: 7, fs: 58, fe: 96, bs: 34, be: 120, fh: 30, fk: -26, bh: -32, bk: -12, tw: -0.3 }),
  // chudan-no-kamae: two-handed grip at the navel, tip aimed at the opponent's throat, rear heel lifted
  // elbows bent and tucked, hands at the navel, tip at throat height; knees soft, hips settled between the feet
  katana: P({ lean: 5, head: 4, fs: 22, fe: 72, bs: 20, be: 80, wa: 116, fh: 28, fk: -30, bh: -27, bk: -15, tw: -0.25, ik: 1 }),
  twin:   P({ lean: 10, head: 6, fs: 64, fe: 72, bs: 40, be: 90, wa: 104, wb: 128, fh: 28, fk: -24, bh: -28, bk: -12 }),
  cleaver:P({ lean: 6, head: 4, fs: 28, fe: 80, bs: 34, be: 104, wa: 160, fh: 28, fk: -22, bh: -30, bk: -14 }),
  spear:  P({ lean: 6, head: 4, fs: 56, fe: 24, bs: 24, be: 58, wa: 98, fh: 30, fk: -20, bh: -30, bk: -10, ik: 1 }),
  sickle: P({ lean: 8, head: 6, fs: 46, fe: 88, bs: 24, be: 74, wa: 170, fh: 26, fk: -22, bh: -26, bk: -12 }),
  hammer: P({ lean: 2, head: 2, fs: 14, fe: 118, bs: 10, be: 110, wa: 214, fh: 28, fk: -18, bh: -30, bk: -14, ik: 1 }),
  staff:  P({ lean: 6, head: 4, fs: 52, fe: 34, bs: 26, be: 62, wa: 112, fh: 28, fk: -20, bh: -28, bk: -12, ik: 1 }),
  orbs:   P({ lean: 4, head: 4, fs: 72, fe: 38, bs: 52, be: 52, fh: 26, fk: -20, bh: -26, bk: -12 }),
  shield: P({ lean: 4, head: 4, fs: 56, fe: 24, bs: 60, be: 60, wa: 98, wb: 180, fh: 28, fk: -20, bh: -28, bk: -10 })
};

const POSES = {
  jump:     P({ lean: 6, head: 2, fs: 128, fe: 26, bs: 64, be: 46, fh: 64, fk: -100, bh: 8, bk: -70 }),
  fall:     P({ lean: 0, head: 0, fs: 110, fe: 30, bs: -40, be: 40, fh: 40, fk: -56, bh: -6, bk: -46 }),
  flip:     P({ lean: 22, head: 8, fs: 125, fe: 50, bs: -55, be: 60, fh: 104, fk: -128, bh: 34, bk: -14 }),
  // double-jump flip: drive one knee up with the arms thrown high, then open out for the landing
  flipTakeoff: P({ lean: -6, head: -6, fs: 168, fe: 20, bs: 150, be: 30, fh: 92, fk: -112, bh: -8, bk: -14 }),
  flipFinish: P({ lean: 8, head: 4, fs: 112, fe: 40, bs: -60, be: 30, fh: 74, fk: -96, bh: -6, bk: -18 }),
  land:     P({ lean: 24, head: 10, fs: 40, fe: 80, bs: 10, be: 90, fh: 52, fk: -84, bh: -32, bk: -62 }),
  dash:     P({ lean: 36, head: 12, fs: -72, fe: 12, bs: -86, be: 12, fh: 64, fk: -70, bh: -56, bk: -30 }),
  backstep: P({ lean: -16, head: 10, fs: 62, fe: 100, bs: 32, be: 114, fh: 36, fk: -30, bh: -44, bk: -30 }),
  blockFists: P({ lean: -2, head: 14, fs: 104, fe: 64, bs: 94, be: 76, fh: 28, fk: -34, bh: -28, bk: -24 }),
  blockArmed: P({ lean: -2, head: 8, fs: 62, fe: 70, bs: 40, be: 90, wa: 176, wb: 176, fh: 28, fk: -32, bh: -28, bk: -22 }),
  hit:      P({ lean: -26, head: -26, fs: 24, fe: 34, bs: -44, be: 40, fh: 12, fk: -24, bh: -18, bk: -10, rx: -6 }),
  hitGut:   P({ lean: 38, head: 22, fs: 14, fe: 84, bs: 4, be: 94, fh: 22, fk: -44, bh: -26, bk: -22, rx: -8 }),
  launched: P({ lean: -26, head: -18, fs: 140, fe: 30, bs: -120, be: 30, fh: 58, fk: -50, bh: 22, bk: -60 }),
  launchFall: P({ lean: -18, head: -10, fs: 175, fe: 20, bs: 160, be: 30, fh: 40, fk: -40, bh: -10, bk: -50 }),
  // knockback arc: controlled tumble -> head-down fall -> brace -> three-point landing
  tumble:   P({ lean: 24, head: 10, fs: 150, fe: 50, bs: 120, be: 60, fh: 100, fk: -84, bh: 62, bk: -96 }),
  brace:    P({ lean: 26, head: -4, fs: 70, fe: 30, bs: -40, be: 30, fh: 84, fk: -112, bh: 14, bk: -96 }),
  braceLand: P({ lean: 48, head: -26, fs: 16, fe: 6, bs: -70, be: 40, fh: 84, fk: -128, bh: -36, bk: -118 }),
  // jump anticipation: knees bend and the body drops before takeoff
  jumpSquat: P({ lean: 18, head: 8, fs: 30, fe: 90, bs: 10, be: 100, fh: 56, fk: -96, bh: -28, bk: -70 }),
  // double jump: a tight tuck instead of a flip
  tuck:     P({ lean: 22, head: 8, fs: 70, fe: 110, bs: 50, be: 120, fh: 96, fk: -130, bh: 70, bk: -128 }),
  // falling close to the ground: legs reach for the floor, arms out for balance
  landPrep: P({ lean: 4, head: 4, fs: 120, fe: 20, bs: -70, be: 20, fh: 22, fk: -26, bh: -16, bk: -22 }),
  down:     P({ lean: 0, head: -6, rot: 0, fs: 150, fe: 10, bs: -160, be: 20, fh: 6, fk: -4, bh: -8, bk: -12 }),
  getup:    P({ lean: 40, fs: 10, fe: 40, bs: -20, be: 40, fh: 70, fk: -110, bh: -20, bk: -90 }),
  stun:     P({ lean: -10, head: 18, fs: 6, fe: 12, bs: -8, be: 14, fh: 10, fk: -10, bh: -12, bk: -10 }),
  dead:     P({ lean: 0, head: -20, rot: 0, fs: 170, fe: 10, bs: -170, be: 20, fh: 10, fk: -20, bh: -6, bk: -2 }),
  victory:  P({ lean: 2, head: -8, fs: 172, fe: 4, bs: -30, be: 120, wa: 180, fh: 14, fk: -2, bh: -16, bk: -2 }),
  taunt:    P({ lean: -6, head: -10, fs: 100, fe: 10, bs: -40, be: 100, fh: 20, fk: -8, bh: -18, bk: -8 }),
  // gedan-no-kamae: blade lowered toward the ground, ready to rise
  gedan:    P({ lean: 8, head: 8, fs: 22, fe: 30, bs: 14, be: 46, wa: 60, fh: 22, fk: -10, bh: -26, bk: -4, tw: -0.1, ik: 1 }),
  // hasso-no-kamae: two-handed grip beside the head, blade raised toward the sky
  hasso:    P({ lean: 2, head: 4, fs: 132, fe: 64, bs: 96, be: 70, wa: 172, fh: 30, fk: -22, bh: -34, bk: -6, ik: 1 }),
  bow:      P({ lean: 34, head: 18, fs: 10, fe: 20, bs: 4, be: 30, fh: 6, fk: -2, bh: -6, bk: -2 }),
  kneel:    P({ lean: 24, head: 24, fs: 10, fe: 20, bs: -20, be: 60, fh: 90, fk: -90, bh: -10, bk: -170 }),
  cast:     P({ lean: 10, fs: 96, fe: 0, bs: 88, be: 10, fh: 30, fk: -20, bh: -30, bk: -10 }),
  castUp:   P({ lean: -10, head: -14, fs: 175, fe: 0, bs: 160, be: 10, fh: 16, fk: -6, bh: -18, bk: -6 }),
  grabbed:  P({ lean: -30, head: -20, fs: 140, fe: 30, bs: 120, be: 40, fh: 30, fk: -60, bh: -20, bk: -50 })
};

/* ---------------- Moves ----------------
   Every technique is built as anticipation (a) -> wind-up (w) -> strike (s) -> follow-through (f) -> stance.
   t: [startup, active, recovery] seconds. box: [x, y, w, h] relative to the feet, facing right.
   kb/up: knockback velocity. hs: hitstun. imp: impact tier 0-3 (drives hit-stop, shake, impact frames).
   spin: the body turns a full revolution during the wind-up (spinning techniques). */
const UNARMED = {
  // jab (kizami-zuki): lead hand snaps out, rear fist stays glued to the jaw, chin behind the shoulder
  p1: { kind: 'punch', w: P({ lean: 2, head: 7, fs: 56, fe: 104 }), s: P({ lean: 16, rx: 8, head: 10, fs: 94, fe: 0, bs: 38, be: 120, fh: 32, fk: -18, bh: -30, bk: -8 }),
        f: P({ lean: 10, head: 8, fs: 80, fe: 52 }),
        t: [0.06, 0.06, 0.14], dmg: 5, kb: 140, hs: 0.28, box: [18, -160, 88, 40], next: 'p2', limb: 'fhand', snd: 'swing', hsnd: 'punch', imp: 0 },
  // cross (gyaku-zuki): hips turn through, rear heel lifts, lead hand returns to guard
  p2: { kind: 'punch', w: P({ lean: 0, head: 7, fs: 62, fe: 100, bs: 46, be: 104 }), s: P({ lean: 28, rx: 18, head: 10, fs: 46, fe: 122, bs: 96, be: 0, fh: 42, fk: -30, bh: -42, bk: 0 }),
        f: P({ lean: 18, rx: 10, fs: 50, fe: 118, bs: 82, be: 50, bh: -36, bk: -4 }),
        t: [0.07, 0.06, 0.15], dmg: 6, kb: 170, hs: 0.3, box: [18, -160, 98, 40], next: 'p3', limb: 'bhand', snd: 'swing', hsnd: 'punch', imp: 1, lunge: 140 },
  // rising uppercut: sink the hips, drive up through the legs
  p3: { kind: 'punch', a: P({ lean: 28, head: 12, fs: 12, fe: 78, bs: 34, be: 118, fh: 62, fk: -100, bh: -36, bk: -62 }),
        w: P({ lean: 30, head: 12, fs: 8, fe: 70, bs: 34, be: 118, fh: 66, fk: -108, bh: -38, bk: -66 }),
        s: P({ lean: -10, head: -12, fs: 172, fe: 4, bs: 24, be: 104, fh: 16, fk: -4, bh: -26, bk: -10 }),
        f: P({ lean: -6, head: -8, fs: 162, fe: 22, bs: 30, be: 110, fh: 18, fk: -8, bh: -26, bk: -10 }),
        t: [0.12, 0.07, 0.25], dmg: 9, kb: 160, up: -640, hs: 0.5, box: [8, -200, 84, 96], limb: 'fhand', snd: 'swing', hsnd: 'heavy', imp: 2, stamp: 'CRACK' },
  // roundhouse (mawashi-geri) with the rear leg: knee chambers high at the target, support foot pivots, hip turns over
  rk: { kind: 'kick', a: P({ lean: -4, head: 6, bh: 26, bk: -70, fh: 14, fk: -14 }),
        w: P({ lean: -18, head: 8, fs: 70, fe: 96, bs: -10, be: 90, fh: 6, fk: -6, bh: 102, bk: -136 }),
        s: P({ lean: -34, head: 12, fs: 62, fe: 100, bs: -48, be: 34, fh: 2, fk: -2, bh: 98, bk: -4 }),
        f: P({ lean: -22, head: 8, fs: 66, fe: 98, bs: -24, be: 70, fh: 6, fk: -6, bh: 94, bk: -124 }),
        t: [0.1, 0.07, 0.2], dmg: 8, kb: 300, hs: 0.32, box: [20, -138, 118, 60], limb: 'bfoot', snd: 'swing', hsnd: 'kick', imp: 1 },
  // spinning side kick (ushiro-yoko-geri): turn the back, chamber to the chest, drive the heel
  hk: { kind: 'kick', spin: 1, w: P({ lean: -20, head: 10, fs: 64, fe: 114, bs: 10, be: 98, fh: 108, fk: -134, bh: -6, bk: -6 }),
        s: P({ lean: -50, head: 16, fs: 24, fe: 66, bs: -66, be: 36, fh: 102, fk: 2, bh: -18, bk: 0, rx: -4 }),
        f: P({ lean: -30, head: 10, fs: 40, fe: 90, bs: -30, be: 70, fh: 98, fk: -112, bh: -10, bk: -4 }),
        t: [0.15, 0.09, 0.32], dmg: 14, kb: 560, up: -280, hs: 0.6, kd: 1, gb: 45, box: [16, -168, 138, 84], limb: 'ffoot', snd: 'heavyswing', hsnd: 'heavy', imp: 2, stamp: 'SMASH', lunge: 260 },
  ap: { kind: 'air', w: P({ lean: 6, fs: 60, fe: 110, fh: 60, fk: -80, bh: 10, bk: -60 }), s: P({ lean: 18, head: 8, fs: 118, fe: 0, fh: 40, fk: -52, bh: -20, bk: -42 }),
        t: [0.06, 0.08, 0.14], dmg: 6, kb: 200, hs: 0.3, box: [14, -154, 88, 64], limb: 'fhand', snd: 'swing', hsnd: 'punch', imp: 0 },
  // flying side kick (tobi-yoko-geri): rear leg tucked, heel leads
  ak: { kind: 'air', w: P({ lean: 0, head: 8, fh: 94, fk: -116, bh: -10, bk: -70 }), s: P({ lean: -30, head: 14, fs: 40, fe: 94, bs: -62, be: 30, fh: 114, fk: 0, bh: -14, bk: -124 }),
        t: [0.08, 0.12, 0.16], dmg: 9, kb: 320, up: -120, hs: 0.36, box: [14, -124, 118, 92], limb: 'ffoot', snd: 'swing', hsnd: 'kick', imp: 1 },
  // spinning low sweep (ashi-barai): drop over the support knee, the rear leg scythes along the floor
  slide: { kind: 'kick', spin: 1, w: P({ lean: 26, head: 12, fs: 30, fe: 60, fh: 62, fk: -110, bh: -30, bk: -70 }),
        s: P({ lean: 36, head: 14, fs: 6, fe: 30, bs: -50, be: 30, fh: 74, fk: -150, bh: 90, bk: 0 }),
        f: P({ lean: 30, head: 12, fs: 10, fe: 40, bs: -40, be: 40, fh: 70, fk: -140, bh: 70, bk: -20 }),
        t: [0.07, 0.18, 0.22], dmg: 8, kb: 120, up: -380, hs: 0.5, kd: 1, low: 1, box: [-10, -58, 150, 58], limb: 'bfoot', snd: 'dash', hsnd: 'kick', imp: 1, lunge: 430 },
  // stepping lunge punch (oi-zuki)
  dp: { kind: 'punch', w: P({ lean: 30, head: 10, fs: 50, fe: 120, bs: -30, be: 40 }), s: P({ lean: 30, rx: 16, head: 10, fs: 94, fe: 0, bs: -50, be: 30, fh: 54, fk: -42, bh: -54, bk: 0 }),
        f: P({ lean: 24, rx: 10, fs: 86, fe: 30, bs: -30, be: 60, fh: 50, fk: -40, bh: -50, bk: -4 }),
        t: [0.03, 0.09, 0.22], dmg: 9, kb: 420, hs: 0.42, box: [16, -164, 104, 44], limb: 'fhand', snd: 'swing', hsnd: 'heavy', imp: 2, lunge: 520, stamp: 'WHAM' },
  // clinch for a hip throw
  grab: { kind: 'grab', w: P({ lean: 10, fs: 70, fe: 40, bs: 64, be: 50 }), s: P({ lean: 18, fs: 86, fe: 14, bs: 80, be: 26, fh: 30, fk: -14, bh: -28, bk: -14 }),
        t: [0.06, 0.08, 0.3], dmg: 0, box: [14, -170, 64, 120], limb: 'fhand' },
  // side-arm shuriken / kunai throw
  kunai: { kind: 'throw', w: P({ lean: -10, head: 8, fs: -40, fe: 130 }), s: P({ lean: 18, head: 8, fs: 92, fe: 0, bs: -30, be: 60 }),
        t: [0.1, 0.05, 0.18], proj: 'kunai', snd: 'throw' }
};

/* ---------------- Weapons ---------------- */
const WEAPONS = {
  fists: { heft: 0.6, el: 'wind', name: 'Bare Hands', cls: 'Unarmed', hands: 0, len: 0, stance: 'fists', stats: [30, 70, 20], trail: '#ece5d3', moves: ['pa1', 'pa2'],
    defs: {
      pa1: { kind: 'weapon', spin: 1, w: P({ lean: -6, head: 8, fs: 40, fe: 124 }), s: P({ lean: 10, rx: 10, head: 10, fs: 98, fe: 6, bs: 32, be: 116 }), f: P({ lean: 6, fs: 90, fe: 40 }), t: [0.13, 0.07, 0.22], dmg: 9, kb: 320, hs: 0.36, box: [16, -168, 104, 50], limb: 'fhand', snd: 'swing', hsnd: 'punch', imp: 1, next: 'pa2', lunge: 180 },
      pa2: { kind: 'weapon', a: P({ lean: -8, head: 6, fs: 20, fe: 60, bs: 14, be: 64, fh: 18, fk: -30, bh: -20, bk: -26 }), w: P({ lean: -6, fs: 30, fe: 60, bs: 20, be: 60 }), s: P({ lean: 30, rx: 20, head: 10, fs: 96, fe: 0, bs: 92, be: 0, fh: 44, fk: -26, bh: -44, bk: -4 }), f: P({ lean: 24, rx: 14, fs: 90, fe: 10, bs: 86, be: 10 }), t: [0.14, 0.08, 0.3], dmg: 13, kb: 560, up: -200, hs: 0.5, kd: 1, box: [16, -174, 110, 60], limb: 'fhand', snd: 'heavyswing', hsnd: 'heavy', imp: 2, stamp: 'WHAM' }
    },
    special: 'shadowPalm'
  },
  twin_blades: { heft: 0.6, el: 'lightning', name: 'Twin Blades', cls: 'Blades', tab: 'blades', rarity: 'Swift Blades', hands: 'dual', len: 64, stance: 'twin', stats: [44, 92, 38], price: 450,
    trail: '#ece5d3', desc: 'Fast attacks and extended combos. Five-cut string ending in a spinning finisher.',
    moves: ['tw1', 'tw2', 'tw3', 'tw4', 'tw5'], air: 'twa', special: 'thousandCuts',
    defs: {
      tw1: { kind: 'weapon', w: { fs: 122, fe: 20, wa: 196 }, s: { lean: 16, fs: 72, fe: 0, wa: 28 }, t: [0.05, 0.05, 0.13], dmg: 5, kb: 90, hs: 0.26, box: [16, -200, 120, 130], limb: 'w', snd: 'swing', hsnd: 'slash', imp: 0, next: 'tw2' },
      tw2: { kind: 'weapon', w: { bs: 132, be: 20, wb: 204 }, s: { lean: 20, rx: 8, bs: 80, be: 0, wb: 40 }, t: [0.05, 0.05, 0.13], dmg: 5, kb: 90, hs: 0.26, box: [16, -200, 120, 130], limb: 'w2', snd: 'swing', hsnd: 'slash', imp: 0, next: 'tw3' },
      tw3: { kind: 'weapon', w: { fs: 10, fe: 30, wa: -12 }, s: { lean: 4, fs: 142, fe: 10, wa: 172 }, t: [0.05, 0.05, 0.13], dmg: 5, kb: 90, up: -160, hs: 0.28, box: [16, -210, 116, 150], limb: 'w', snd: 'swing', hsnd: 'slash', imp: 0, next: 'tw4' },
      tw4: { kind: 'weapon', w: { bs: 0, be: 40, wb: -20 }, s: { lean: 6, bs: 132, be: 10, wb: 182 }, t: [0.05, 0.05, 0.14], dmg: 6, kb: 120, up: -200, hs: 0.3, box: [16, -210, 116, 150], limb: 'w2', snd: 'swing', hsnd: 'slash', imp: 1, next: 'tw5' },
      tw5: { kind: 'weapon', a: { lean: 16, head: 10, fs: 120, fe: 60, bs: 110, be: 60, wa: 200, wb: 210, fh: 40, fk: -60, bh: -40, bk: -40 }, w: { lean: 10, fs: 90, fe: 0, bs: -90, be: 0, wa: 90, wb: -90 }, s: { lean: 14, fs: 90, fe: 0, bs: -90, be: 0, wa: 90, wb: -90 }, t: [0.08, 0.27, 0.24], dmg: 4, multi: [3, 0.09], kb: 360, hs: 0.36, box: [-60, -190, 190, 150], spin: 1, limb: 'w', snd: 'swing', hsnd: 'slash', imp: 2, stamp: 'SLASH', lunge: 200 },
      twa: { kind: 'air', w: { lean: 10, fs: 160, fe: 10, wa: 210, bs: 150, wb: 200 }, s: { lean: 26, fs: 60, fe: 0, wa: 0, bs: 40, wb: -10 }, t: [0.06, 0.1, 0.16], dmg: 7, kb: 200, up: 260, hs: 0.34, box: [8, -180, 120, 160], limb: 'w', snd: 'swing', hsnd: 'slash', imp: 1 },
      twc: { kind: 'weapon', counter: 1, w: { lean: 14, fs: 20, fe: 20, wa: -30, bs: 10, wb: -30 }, s: { lean: 26, rx: 26, fs: 120, fe: 0, wa: 160, bs: 110, be: 0, wb: 150 }, t: [0.04, 0.08, 0.22], dmg: 14, kb: 420, up: -300, hs: 0.5, box: [10, -200, 140, 150], limb: 'w', snd: 'swing', hsnd: 'slash', imp: 3, stamp: 'COUNTER', lunge: 380 }
    },
    counter: 'twc'
  },
  moon_katana: { heft: 1, el: 'moon', name: 'Moon Katana', cls: 'Blades', tab: 'blades', rarity: 'Balanced Blade', hands: 2, len: 82, stance: 'katana', stats: [60, 64, 58], price: 0,
    trail: '#ece5d3', desc: 'Balanced cuts and lightning counter-slashes. Block or parry, then strike to draw the iai counter.',
    moves: ['k1', 'k2', 'k3'], air: 'ka', special: 'crescentMoon', counter: 'kc',
    defs: {
      k1: { kind: 'weapon', a: { lean: -6, head: 2, fs: 166, fe: 8, wa: 194 }, w: { lean: -8, fs: 178, fe: 26, wa: 214 }, s: { lean: 22, rx: 14, head: 8, fs: 74, fe: 0, wa: 22, fh: 38, fk: -24, bh: -32, bk: -4 }, f: { lean: 28, rx: 12, head: 10, fs: 40, fe: 0, wa: -14, fh: 40, fk: -32, bh: -34, bk: -6 }, t: [0.1, 0.07, 0.19], dmg: 10, kb: 200, hs: 0.32, box: [16, -222, 150, 176], limb: 'w', snd: 'swing', hsnd: 'slash', imp: 1, next: 'k2' },
      k2: { kind: 'weapon', w: { lean: 16, head: 10, fs: 20, fe: 8, wa: -26, fh: 32, fk: -32 }, s: { lean: -4, fs: 152, fe: 10, wa: 190 }, f: { lean: -8, head: -4, fs: 168, fe: 16, wa: 208 }, t: [0.1, 0.07, 0.19], dmg: 10, kb: 140, up: -420, hs: 0.4, box: [16, -232, 140, 186], limb: 'w', snd: 'swing', hsnd: 'slash', imp: 1, next: 'k3' },
      k3: { kind: 'weapon', a: { lean: 0, rx: -6, fs: 34, fe: 90, wa: 94, fh: 16, fk: -22, bh: -12, bk: -22 }, w: { lean: -2, rx: -12, fs: 40, fe: 114, wa: 92, fh: 18, fk: -24, bh: -14, bk: -22 }, s: { lean: 30, rx: 36, head: 8, fs: 92, fe: 0, wa: 90, fh: 46, fk: -26, bh: -44, bk: -2 }, f: { lean: 24, rx: 30, fs: 86, fe: 10, wa: 92, fh: 44, fk: -26, bh: -42, bk: -4 }, t: [0.14, 0.08, 0.27], dmg: 14, kb: 520, hs: 0.5, kd: 1, box: [26, -168, 186, 46], limb: 'w', snd: 'heavyswing', hsnd: 'slash', imp: 2, stamp: 'SLASH', lunge: 380 },
      ka: { kind: 'air', w: { lean: 0, fs: 168, fe: 10, wa: 210 }, s: { lean: 22, fs: 64, fe: 0, wa: -8 }, t: [0.07, 0.1, 0.16], dmg: 9, kb: 220, up: 200, hs: 0.36, box: [10, -200, 140, 190], limb: 'w', snd: 'swing', hsnd: 'slash', imp: 1 },
      kc: { kind: 'weapon', counter: 1, w: { lean: 14, head: 10, fs: 6, fe: 20, wa: -46, fh: 36, fk: -40, bh: -34, bk: -20 }, s: { lean: 26, rx: 32, head: 8, fs: 106, fe: 0, wa: 160, fh: 46, fk: -30, bh: -46, bk: 0 }, f: { lean: 16, fs: 168, fe: 10, wa: 178 }, t: [0.04, 0.08, 0.26], dmg: 18, kb: 480, up: -260, hs: 0.55, box: [16, -220, 170, 180], limb: 'w', snd: 'heavyswing', hsnd: 'slash', imp: 3, stamp: 'COUNTER', lunge: 420 }
    }
  },
  mountain_cleaver: { heft: 1.6, el: 'flame', name: 'Mountain Cleaver', cls: 'Heavy', tab: 'heavy', rarity: 'Heavy Blade', hands: 1, len: 104, stance: 'cleaver', stats: [82, 38, 54], price: 1400,
    trail: '#d24a3c', desc: 'Heavy damage that breaks any guard. Slow to start — commit to every swing.',
    moves: ['c1', 'c2', 'c3'], air: 'ca', special: 'mountainSplit', counter: 'c2',
    defs: {
      c1: { kind: 'weapon', a: { lean: -16, head: -4, fs: 188, fe: 4, wa: 230 }, f: { lean: 32, rx: 12, fs: 40, fe: 0, wa: -22, fh: 42, fk: -34, bh: -36, bk: -8 }, w: { lean: -12, fs: 176, fe: 14, wa: 222 }, s: { lean: 26, rx: 14, fs: 72, fe: 0, wa: 8, fh: 38, fk: -24, bh: -34, bk: -8 }, t: [0.22, 0.08, 0.3], dmg: 18, kb: 260, hs: 0.45, gb: 70, box: [16, -230, 150, 230], limb: 'w', snd: 'heavyswing', hsnd: 'heavy', imp: 2, stamp: 'BREAK', next: 'c2' },
      c2: { kind: 'weapon', w: { lean: 4, fs: -30, fe: 30, wa: -36 }, s: { lean: -6, fs: 150, fe: 6, wa: 150 }, t: [0.2, 0.08, 0.3], dmg: 15, kb: 260, up: -560, hs: 0.5, gb: 55, box: [16, -230, 150, 200], limb: 'w', snd: 'heavyswing', hsnd: 'heavy', imp: 2, next: 'c3' },
      c3: { kind: 'weapon', a: { lean: -20, fs: 196, fe: 0, wa: 200, fh: 30, fk: -50, bh: -30, bk: -40 }, f: { lean: 40, fs: 40, fe: 0, wa: -10, fh: 64, fk: -90, bh: -40, bk: -54 }, w: { lean: -16, fs: 184, fe: 0, wa: 204 }, s: { lean: 36, fs: 44, fe: 0, wa: -6, fh: 60, fk: -80, bh: -40, bk: -50 }, t: [0.28, 0.1, 0.42], dmg: 24, kb: 420, up: -300, hs: 0.6, kd: 1, gb: 110, box: [10, -200, 170, 200], limb: 'w', snd: 'heavyswing', hsnd: 'heavy', imp: 3, stamp: 'SMASH', shock: 1, hop: -420, lunge: 260 },
      ca: { kind: 'air', w: { lean: -10, fs: 176, fe: 0, wa: 210 }, s: { lean: 30, fs: 50, fe: 0, wa: -10 }, t: [0.12, 0.1, 0.22], dmg: 14, kb: 200, up: 400, hs: 0.45, gb: 60, box: [10, -200, 150, 220], limb: 'w', snd: 'heavyswing', hsnd: 'heavy', imp: 2 }
    }
  },
  dragon_spear: { heft: 1.2, el: 'water', name: 'Dragon Spear', cls: 'Polearm', tab: 'polearms', rarity: 'Legendary Polearm', hands: 2, len: 196, stance: 'spear', stats: [52, 60, 96], price: 0, exclusive: true,
    trail: '#c9a45c', desc: 'Longest reach in the Armory. Two pokes and a leg-sweeping arc. A boss trophy, not yet obtainable.',
    moves: ['s1', 's2', 's3'], air: 'sa', special: 'dragonLance', counter: 's1',
    defs: {
      s1: { kind: 'weapon', f: { lean: 14, rx: 20, fs: 82, fe: 10, wa: 93 }, w: { lean: 0, rx: -14, fs: 36, fe: 70, wa: 95 }, s: { lean: 18, rx: 26, fs: 88, fe: 0, wa: 92 }, t: [0.09, 0.07, 0.18], dmg: 8, kb: 220, hs: 0.3, box: [30, -170, 236, 44], limb: 'w', snd: 'swing', hsnd: 'slash', imp: 0, next: 's2' },
      s2: { kind: 'weapon', w: { lean: -2, rx: -10, fs: 62, fe: 70, wa: 116 }, s: { lean: 14, rx: 22, fs: 110, fe: 0, wa: 112 }, t: [0.09, 0.07, 0.18], dmg: 8, kb: 240, hs: 0.3, box: [30, -232, 230, 60], limb: 'w', snd: 'swing', hsnd: 'slash', imp: 1, next: 's3' },
      s3: { kind: 'weapon', spin: 1, f: { lean: 26, fs: 50, fe: 0, wa: 40, fh: 56, fk: -76, bh: -40, bk: -48 }, w: { lean: -10, fs: 150, fe: 10, wa: 200 }, s: { lean: 30, fs: 62, fe: 0, wa: 72, fh: 60, fk: -80, bh: -40, bk: -50 }, t: [0.14, 0.1, 0.26], dmg: 11, kb: 200, up: -420, hs: 0.5, kd: 1, low: 1, box: [10, -70, 236, 70], limb: 'w', snd: 'heavyswing', hsnd: 'slash', imp: 2, stamp: 'SWEEP' },
      sa: { kind: 'air', w: { lean: -4, fs: 150, fe: 0, wa: 160 }, s: { lean: 30, fs: 70, fe: 0, wa: 50 }, t: [0.08, 0.1, 0.18], dmg: 9, kb: 200, up: 300, hs: 0.36, box: [10, -170, 200, 170], limb: 'w', snd: 'swing', hsnd: 'slash', imp: 1 }
    }
  },
  phantom_sickle: { heft: 0.95, el: 'blood', name: 'Phantom Sickle', cls: 'Chain', tab: 'chains', rarity: 'Legendary Chain', hands: 1, len: 70, stance: 'sickle', stats: [56, 66, 74], price: 0, exclusive: true,
    trail: '#9b8cff', desc: 'A chained sickle. The second strike hurls the blade and drags the enemy to you. A boss trophy, not yet obtainable.',
    moves: ['h1', 'h2', 'h3'], air: 'ha', special: 'reapersHarvest', counter: 'h3',
    defs: {
      h1: { kind: 'weapon', w: { lean: -4, fs: 172, fe: 30, wa: 232 }, s: { lean: 18, fs: 72, fe: 0, wa: 20 }, t: [0.09, 0.07, 0.18], dmg: 9, kb: 160, hs: 0.32, box: [16, -214, 128, 160], limb: 'w', snd: 'swing', hsnd: 'slash', imp: 0, next: 'h2' },
      h2: { kind: 'weapon', a: { lean: -4, fs: 170, fe: 30, wa: 300 }, w: { lean: -8, fs: 196, fe: 40, wa: 236 }, s: { lean: 20, fs: 96, fe: 0, wa: 90 }, t: [0.13, 0.16, 0.24], dmg: 8, kb: 0, hs: 0.45, pull: 1, disarm: 0.2, box: [70, -176, 250, 56], chain: 300, limb: 'w', snd: 'chain', hsnd: 'slash', imp: 1, stamp: 'YANK', next: 'h3' },
      h3: { kind: 'weapon', w: { lean: 6, fs: 20, fe: 30, wa: -30 }, s: { lean: -2, fs: 152, fe: 0, wa: 202 }, t: [0.1, 0.09, 0.25], dmg: 13, kb: 420, up: -460, hs: 0.5, box: [12, -232, 146, 196], limb: 'w', snd: 'heavyswing', hsnd: 'slash', imp: 2, stamp: 'REAP' },
      ha: { kind: 'air', w: { lean: 0, fs: 172, fe: 10, wa: 220 }, s: { lean: 24, fs: 64, fe: 0, wa: 0 }, t: [0.07, 0.1, 0.16], dmg: 9, kb: 200, up: 220, hs: 0.36, box: [10, -200, 136, 190], limb: 'w', snd: 'swing', hsnd: 'slash', imp: 1 }
    }
  },
  titan_hammer: { heft: 2.2, el: 'earth', name: 'Titan Hammer', cls: 'Heavy', tab: 'heavy', rarity: 'Mythic Hammer', hands: 2, len: 150, stance: 'hammer', stats: [98, 16, 66], price: 0, exclusive: true,
    trail: '#d24a3c', desc: 'Extremely slow but devastating. The overhead smash splits the ground. A boss trophy, not yet obtainable.',
    moves: ['m1', 'm2'], air: 'ma', special: 'earthshatter', counter: 'm2',
    defs: {
      m1: { kind: 'weapon', a: { lean: -22, head: -6, fs: 196, fe: 0, wa: 196, fh: 22, fk: -30, bh: -24, bk: -22 }, f: { lean: 36, fs: 74, fe: 0, wa: -2, fh: 46, fk: -44, bh: -38, bk: -22 }, w: { lean: -18, fs: 186, fe: 0, wa: 200 }, s: { lean: 34, fs: 76, fe: 0, wa: 2, fh: 44, fk: -40, bh: -36, bk: -20 }, t: [0.42, 0.1, 0.48], dmg: 34, kb: 380, up: -360, hs: 0.7, kd: 1, gb: 160, box: [16, -246, 176, 246], limb: 'w', snd: 'heavyswing', hsnd: 'heavy', imp: 3, stamp: 'SMASH', shock: 1, armor: 1, next: 'm2' },
      m2: { kind: 'weapon', a: { lean: -12, fs: -70, fe: 20, wa: -96 }, f: { lean: 14, fs: 140, fe: 10, wa: 190 }, w: { lean: -8, fs: -60, fe: 20, wa: -82 }, s: { lean: 22, fs: 112, fe: 0, wa: 152 }, t: [0.36, 0.1, 0.46], dmg: 28, kb: 900, up: -380, hs: 0.7, kd: 1, gb: 140, box: [16, -246, 176, 230], limb: 'w', snd: 'heavyswing', hsnd: 'heavy', imp: 3, stamp: 'BREAK', armor: 1 },
      ma: { kind: 'air', w: { lean: -14, fs: 186, fe: 0, wa: 206 }, s: { lean: 34, fs: 60, fe: 0, wa: -6 }, t: [0.2, 0.12, 0.3], dmg: 22, kb: 300, up: 500, hs: 0.5, gb: 100, box: [10, -220, 170, 240], limb: 'w', snd: 'heavyswing', hsnd: 'heavy', imp: 2, shock: 1 }
    }
  },

  /* ---- enemy-only arms ---- */
  shadow_daggers: { heft: 0.6, el: 'shade', enemy: 1, name: 'Shadow Daggers', base: 'twin_blades', len: 52, trail: '#ece5d3' },
  hollow_crescents: { heft: 0.8, el: 'moon', enemy: 1, name: 'Hollow Crescents', base: 'twin_blades', len: 74, trail: '#9b8cff', crescent: 1 },
  mist_fans: { heft: 0.6, el: 'wind', enemy: 1, name: 'Mist Fans', base: 'twin_blades', len: 46, trail: '#b9c4c9', fan: 1 },
  sentinel_spear: { heft: 1.2, el: 'shade', enemy: 1, name: 'Sentinel Spear', base: 'dragon_spear', hands: 1, stance: 'shield', len: 180, trail: '#c9a45c', shield: 1 },
  sage_staff: { heft: 1.1, el: 'water', enemy: 1, name: 'Sage Staff', base: 'dragon_spear', len: 200, trail: '#7fd0c8', staff: 1, stance: 'staff' },
  storm_orbs: { heft: 0.6, el: 'lightning', enemy: 1, name: 'Storm Orbs', base: 'fists', hands: 0, stance: 'orbs', trail: '#7fb8ff' },
  iron_fists: { heft: 1.5, el: 'earth', enemy: 1, name: 'Iron Fists', base: 'fists', hands: 0, trail: '#d24a3c', gauntlet: 1 },
  chain_hook: { heft: 1, el: 'flame', enemy: 1, name: 'Chain Hook', base: 'phantom_sickle', len: 64, trail: '#d24a3c', hook: 1 },
  tyrant_cleaver: { heft: 2, el: 'flame', enemy: 1, name: 'Tyrant Cleaver', base: 'mountain_cleaver', len: 130, trail: '#ff6a3c' },
  cutter_blade: { heft: 1, el: 'shade', enemy: 1, name: 'Cutter Blade', base: 'moon_katana', len: 92, trail: '#ece5d3' },
  temple_staff: { heft: 1.1, el: 'shade', enemy: 1, name: 'Temple Staff', base: 'dragon_spear', len: 180, trail: '#ece5d3', staff: 1, stance: 'staff' },
  raider_cleaver: { heft: 1.4, el: 'shade', enemy: 1, name: 'Raider Cleaver', base: 'mountain_cleaver', len: 86, trail: '#d24a3c' }
};
// resolve enemy weapons onto their base move-sets
for (const id in WEAPONS) {
  const w = WEAPONS[id];
  w.id = id;
  if (w.base) {
    const b = WEAPONS[w.base];
    for (const k of ['cls', 'hands', 'stance', 'stats', 'moves', 'air', 'special', 'counter', 'defs']) if (w[k] == null) w[k] = b[k];
  }
}
// torso / hip twist for each technique  [wind-up tw, strike tw, follow tw, strike hip]
const TWIST = {
  p1: [-0.45, -0.1, -0.2, 0.1], p2: [-0.5, 0.85, 0.6, 0.6], p3: [-0.3, 0.45, 0.4, 0.4], rk: [-0.2, 0.35, 0.2, 1.0], hk: [-0.7, -0.6, -0.3, -0.5],
  slide: [-0.4, 0.5, 0.3, 0.8], dp: [-0.5, 0.2, 0.1, 0.3], ap: [-0.3, 0.3, 0.2, 0.2], ak: [-0.4, -0.3, -0.2, -0.3], kunai: [-0.6, 0.7, 0.5, 0.4],
  k1: [-0.7, 0.75, 0.95, 0.45], k2: [0.4, -0.55, -0.7, -0.2], k3: [-0.5, 0.55, 0.4, 0.35], ka: [-0.5, 0.6, 0.6, 0.2], kc: [-0.9, 0.95, 0.8, 0.6],
  tw1: [-0.6, 0.6, 0.4, 0.3], tw2: [0.6, -0.5, -0.4, -0.2], tw3: [-0.5, 0.5, 0.3, 0.2], tw4: [0.5, -0.4, -0.3, -0.2], tw5: [-0.6, 0.9, 0.6, 0.6], twa: [-0.4, 0.5, 0.4, 0.2], twc: [-0.8, 0.9, 0.7, 0.5],
  c1: [-0.8, 0.8, 0.95, 0.5], c2: [0.5, -0.6, -0.7, -0.3], c3: [-0.9, 0.9, 1, 0.6], ca: [-0.6, 0.7, 0.7, 0.3],
  s1: [-0.4, 0.55, 0.4, 0.4], s2: [-0.4, 0.5, 0.35, 0.35], s3: [-0.7, 0.9, 0.8, 0.6], sa: [-0.4, 0.5, 0.4, 0.2],
  h1: [-0.6, 0.6, 0.5, 0.3], h2: [-0.7, 0.8, 0.6, 0.4], h3: [0.4, -0.6, -0.5, -0.3], ha: [-0.5, 0.5, 0.4, 0.2],
  m1: [-0.9, 0.85, 1, 0.6], m2: [0.6, -0.8, -0.9, -0.4], ma: [-0.7, 0.7, 0.8, 0.4], pa1: [-0.8, 0.5, 0.3, 0.4], pa2: [-0.4, 0.6, 0.5, 0.4]
};
function applyTwist(m) {
  const tw = TWIST[m.id]; if (!tw) return;
  if (m.a && m.a.tw === BASE_POSE.tw) m.a.tw = tw[0] * 0.6;
  if (m.w.tw === BASE_POSE.tw || m.w.tw === -0.3 || m.w.tw === -0.25) m.w.tw = tw[0];
  m.s.tw = tw[1]; m.s.hp = tw[3];
  if (m.f) { m.f.tw = tw[2]; m.f.hp = tw[3] * 0.7; }
}
// fill move poses from the weapon stance so authors only write the joints that change
const MOVES = {};
(function buildMoves() {
  const fists = STANCES.fists;
  for (const k in UNARMED) {
    const m = UNARMED[k]; m.id = k; m.w = P(m.w, fists); m.s = P(m.s, fists); m.w.ik = 0; m.s.ik = 0;
    if (m.a) { m.a = P(m.a, fists); m.a.ik = 0; } if (m.f) { m.f = P(m.f, fists); m.f.ik = 0; }
    applyTwist(m);
    MOVES[k] = m;
  }
  for (const wid in WEAPONS) {
    const wp = WEAPONS[wid];
    if (wp.base) continue;
    const st = STANCES[wp.stance];
    for (const k in wp.defs) {
      const m = wp.defs[k]; m.id = k;
      if (!m.__built) {
        m.w = P(m.w, st); m.s = P(m.s, st); if (m.a) m.a = P(m.a, st); if (m.f) m.f = P(m.f, st); m.__built = 1;
        if (wp.hands !== 2) for (const q of [m.w, m.s, m.a, m.f]) if (q) q.ik = 0;
        applyTwist(m);
      }
      if (UNARMED[k]) throw new Error('[KAGE] move id collision: ' + k);
      MOVES[k] = m;
    }
  }
})();

/* ---------------- Rage specials (I with a full rage meter) ---------------- */
const SPECIALS = {
  shadowPalm:    { name: 'Shadow Palm', desc: 'A burst of ink that hurls the enemy away.' },
  thousandCuts:  { name: 'Thousand Cuts', desc: 'Blink through the enemy, cutting six times.' },
  crescentMoon:  { name: 'Crescent Moon', desc: 'A towering moon-shaped wave of steel.' },
  mountainSplit: { name: 'Mountain Split', desc: 'A leaping slam that erupts the ground on both sides. Unblockable.' },
  dragonLance:   { name: 'Dragon Lance', desc: 'A dragon-fire lunge across the arena that launches.' },
  reapersHarvest:{ name: "Reaper's Harvest", desc: 'The chain finds the enemy anywhere, drags and slams them.' },
  earthshatter:  { name: 'Earthshatter', desc: 'The ground itself breaks. Every grounded enemy is stunned.' }
};

/* ---------------- Helmets & armor ---------------- */
const HELMETS = {
  topknot:   { name: 'Crimson Hachimaki', rarity: 'Starting gear', def: 0, price: 0, desc: 'A red headband with long tails. Light, quick, honest.', perks: {} },
  ronin_hood:{ name: 'Ronin Hood', rarity: 'Common helm', def: 0.04, price: 300, desc: 'Cloth hood. Dash recovers faster.', perks: { dash: 0.12 } },
  straw_kasa:{ name: 'Straw Kasa', rarity: 'Common helm', def: 0.06, price: 520, desc: 'Wide straw hat. Carry two extra kunai.', perks: { ammo: 2 } },
  iron_kabuto:{ name: 'Iron Kabuto', rarity: 'Rare helm', def: 0.1, price: 1150, desc: 'Lacquered iron with a gold crest. Shrugs off stuns.', perks: { stunRes: 0.35 } },
  oni_mask:  { name: 'Oni Mask', rarity: 'Rare helm', def: 0.08, gems: 12, desc: 'Fills the rage meter faster.', perks: { rage: 0.2 } },
  reaper_cowl:{ name: 'Reaper Cowl', rarity: 'Boss trophy', def: 0.08, exclusive: true, desc: 'A fallen master’s cowl. Dash recovers much faster.', perks: { dash: 0.25 } },
  hollow_crest:{ name: 'Hollow Moon Crest', rarity: 'Boss trophy', def: 0.12, exclusive: true, desc: 'A hollow halo. Rage gain greatly increased.', perks: { rage: 0.3 } },
  sentinel_helm:{ name: 'Sentinel Helm', rarity: 'Boss trophy', def: 0.14, exclusive: true, desc: 'Plumed iron from the gate. Heavy defence.', perks: { stunRes: 0.2 } },
  sage_antlers:{ name: "Sage's Antlers", rarity: 'Boss trophy', def: 0.12, exclusive: true, desc: 'An antlered sage’s crown. +3 kunai.', perks: { ammo: 3 } },
  ashen_crown:{ name: 'Ashen Crown', rarity: 'Boss trophy', def: 0.16, exclusive: true, desc: 'A burning crown. Everything hits harder.', perks: { dmg: 0.1 } }
};
const ARMORS = {
  wraps:     { name: 'Cloth Wraps', rarity: 'Starting gear', def: 0, price: 0, desc: 'Bandaged forearms and a red scarf.', perks: {} },
  jerkin:    { name: 'Leather Jerkin', rarity: 'Common armor', def: 0.06, price: 360, desc: 'Boiled leather over the chest.', perks: { hp: 15 } },
  shadow_cloak:{ name: 'Shadow Cloak', rarity: 'Rare armor', def: 0.07, gems: 15, desc: 'A long black cloak. Move and dash faster.', perks: { speed: 0.08 } },
  lamellar:  { name: 'Lamellar Coat', rarity: 'Rare armor', def: 0.12, price: 1250, desc: 'Laced iron scales. Slightly slower.', perks: { hp: 30, speed: -0.03 } },
  pauldrons: { name: 'Iron Pauldrons', rarity: 'Epic armor', def: 0.16, price: 2300, desc: 'Massive shoulder plates. Slower, much tougher.', perks: { hp: 45, speed: -0.05, stunRes: 0.15 } },
  mist_shroud:{ name: 'Mist Shroud', rarity: 'Boss trophy', def: 0.08, exclusive: true, desc: 'A grey veil. Dash invulnerability lasts longer.', perks: { dash: 0.2, speed: 0.04 } },
  storm_mantle:{ name: 'Storm Mantle', rarity: 'Boss trophy', def: 0.1, exclusive: true, desc: 'Charged ribbons. Kunai strike harder.', perks: { kunai: 0.6, speed: 0.04 } },
  colossus_plate:{ name: 'Colossus Plate', rarity: 'Boss trophy', def: 0.2, exclusive: true, desc: 'Pit-forged plate. Very slow, nearly unbreakable.', perks: { hp: 60, speed: -0.08, stunRes: 0.3 } },
  executioner_garb:{ name: 'Executioner Garb', rarity: 'Boss trophy', def: 0.12, exclusive: true, desc: 'Chain-wrapped leather. Rage builds from blocking.', perks: { rage: 0.15, hp: 25 } }
};
for (const id in HELMETS) HELMETS[id].id = id;
for (const id in ARMORS) ARMORS[id].id = id;

const GEAR_MAX = { weapons: 8, helmets: 5, armors: 5 };


/* ---------------- Enemies & bosses ----------------
   type: regular | sub | boss.  ai: regular | agile | defensive | ranged | heavy | boss
   build: scale (overall size), w (limb thickness), head, legs, arms (length multipliers)
   These are TEMPORARY stand-ins: every campaign stage fights one of them in a single arena until the real
   Order soldiers, Hollows, sub-bosses and bosses land. Stages show their own story names (see CAMPAIGN). */
const ENEMIES = {
  order_recruit: { name: 'Order Recruit', title: 'Order of Silence', type: 'regular', outfit: 'gi', ai: 'regular', weapon: 'cutter_blade', helmet: 'ronin_hood', armor: 'jerkin', hp: 170, dmg: 0.9, build: { scale: 1, w: 10 }, eye: '#ece5d3',
            taunt: 'The Order of Silence holds this road. Turn back.', tip: 'Block the first cut, then answer with a three-punch string.' },
  order_warden: { name: 'Order Warden', title: 'Order of Silence', type: 'regular', outfit: 'gi', ai: 'defensive', weapon: 'temple_staff', helmet: 'iron_kabuto', armor: 'lamellar', hp: 220, dmg: 1, build: { scale: 1.08, w: 12 }, eye: '#c9a45c',
            taunt: 'Nothing leaves the fortress without the Order’s word.', tip: 'He blocks everything. Grab him (Block + Punch) or charge a heavy kick.' },
  hollow: { name: 'Hollow', title: 'Memory ash', type: 'regular', ai: 'agile', weapon: 'shadow_daggers', helmet: 'veil', armor: 'cloak', hp: 160, dmg: 0.85, speed: 1.15, build: { scale: 0.96, w: 9, legs: 1.06 }, eye: '#9b8cff', accent: '#9b8cff',
            taunt: '…it copies your breathing, then your stance…', tip: 'It darts in and out. Dash in when it lands from a jump.' },
  echo_sentinel: { name: 'Echo Sentinel', title: 'Placeholder sub-boss', type: 'sub', ai: 'agile', weapon: 'hollow_crescents', helmet: 'oni', armor: 'cloak', hp: 340, dmg: 1.05, speed: 1.15, build: { scale: 1.04, w: 10 }, eye: '#9b8cff', accent: '#9b8cff',
            taunt: 'This memory is guarded. Prove you belong in it.', defeat: 'The memory… lets you pass…', win: 'Forget this place.',
            tip: 'Dodge the lunge with Dash, then punish the long recovery.', abilities: ['lunge', 'teleport'] },
  echo_warden: { name: 'Echo Warden', title: 'Placeholder boss', type: 'boss', ai: 'boss', weapon: 'cutter_blade', helmet: 'oni', armor: 'tyrant', hp: 640, dmg: 1.1, speed: 1.1, build: { scale: 1.16, w: 12 }, eye: '#9b8cff', accent: '#9b8cff', flashEyes: 1,
            taunt: 'You were supposed to stay buried.', defeat: 'The echo… breaks…', win: 'Sleep, shadow. Remember nothing.',
            tip: 'Its eyes flash right before it strikes. Block on the flash, punish after.',
            phases: [
              { name: 'First Echo', abilities: ['lunge', 'moonDash'] },
              { name: 'Fractured Echo', abilities: ['teleport', 'clones', 'moonDash'] },
              { name: 'Last Echo', abilities: ['moonDash', 'groundSlam', 'lunge'], berserk: 1 }
            ] }
};
for (const id in ENEMIES) ENEMIES[id].id = id;

/* ---------------- Campaign map ----------------
   Chapters in story order, each with its stages in play order. Stage ids are stable strings
   ("act1.sub2", "core.witness") and saves record clears by id, so stages can be added, renamed or
   reordered later without breaking saves. Every stage has:
     id, kind (stretch | subboss | boss | spar | echo | scene), name (what the map shows),
     enemy            the temporary arena foe (ENEMIES id) for combat stages; scene stages have none,
     foe / foeTitle   the story opponent shown instead of the placeholder's name (bosses, sub-bosses, echoes, the spar),
     chapter / pos    filled in below (owning chapter id, index inside it).
   Later updates add per-stage fields here (env override, encounters, scene hooks, rewards and unlocks);
   the logic module reads them, so the rest of the game picks them up. */
const STAGE_KINDS = ['stretch', 'subboss', 'boss', 'spar', 'echo', 'scene'];
const CAMPAIGN = (function buildCampaign() {
  const R = ['I', 'II', 'III', 'IV'];
  // An act: four stretches, each followed by its sub-boss arena, then the main boss arena.
  const act = (id, name, title, place, env, diff, grunt, foe, foeTitle) => {
    const stages = [];
    for (let i = 1; i <= 4; i++) {
      stages.push({ id: `${id}.stretch${i}`, kind: 'stretch', name: `Stretch ${R[i - 1]}`, enemy: grunt });
      stages.push({ id: `${id}.sub${i}`, kind: 'subboss', name: `Sub-boss ${R[i - 1]}`, foe: `${name} · Sub-boss ${i}`, enemy: 'echo_sentinel' });
    }
    stages.push({ id: `${id}.boss`, kind: 'boss', name: foe, foe, foeTitle, enemy: 'echo_warden' });
    return { id, name, title, place, env, diff, stages };
  };
  const chapters = [
    { id: 'prologue', name: 'Prologue', title: 'Hoshimura', place: 'The abandoned village', env: 'highlands', diff: 1,
      stages: [{ id: 'prologue.1', kind: 'stretch', name: 'The Empty Village', enemy: 'hollow' }] },
    act('act1', 'Act I', 'The Outer Districts', 'Order territory', 'rooftops', 1, 'order_recruit', 'Raikon', 'the Lightning Ascendant'),
    { id: 'interlude', name: 'Interlude', title: 'Brothers', place: 'A memory of the training yard', env: 'highlands', diff: 1,
      stages: [{ id: 'interlude.spar', kind: 'spar', name: 'The Spar', foe: 'Rem', foeTitle: 'Young Rem', enemy: 'echo_sentinel' }] },
    act('act2', 'Act II', 'The City of Echoes', 'Where the Hollows gather', 'rooftops', 2, 'hollow', 'Akari', 'the Memory Blade'),
    act('act3', 'Act III', 'The Fortress of Silence', 'Seat of the Order', 'wasteland', 3, 'order_warden', 'Takashi', 'the Father'),
    { id: 'core', name: 'The Core', title: 'The Echo System', place: 'Corrupted memory', env: 'wasteland', diff: 3,
      stages: [
        { id: 'core.stretch1', kind: 'stretch', name: 'Into the Core', enemy: 'hollow' },
        { id: 'core.echo1', kind: 'echo', name: 'Echo I', foe: 'Hollow Raikon', foeTitle: 'Corrupted echo', enemy: 'echo_sentinel' },
        { id: 'core.echo2', kind: 'echo', name: 'Echo II', foe: 'Hollow Akari', foeTitle: 'Corrupted echo', enemy: 'echo_sentinel' },
        { id: 'core.echo3', kind: 'echo', name: 'Echo III', foe: 'Hollow Takashi', foeTitle: 'Corrupted echo', enemy: 'echo_sentinel' },
        { id: 'core.echo4', kind: 'echo', name: 'Echo IV', foe: 'Hollow Rem', foeTitle: 'Corrupted echo', enemy: 'echo_sentinel' },
        { id: 'core.witness', kind: 'boss', name: 'The Witness', foe: 'The Witness', foeTitle: 'Heart of the Echo System', enemy: 'echo_warden' }
      ] },
    { id: 'epilogue', name: 'Epilogue', title: 'The Last Choice', place: 'Dawn', env: 'highlands', diff: 1,
      stages: [{ id: 'epilogue', kind: 'scene', name: 'The Last Choice' }] }
  ];
  for (const ch of chapters) ch.stages.forEach((st, i) => { st.chapter = ch.id; st.pos = i; });
  return { chapters };
})();
const DIFF_LABEL = ['Easy', 'Normal', 'Hard', 'Brutal', 'Mythic'];

/* ---------------- Survival ---------------- */
const SURVIVAL = {
  pool: ['order_recruit', 'hollow', 'order_warden'],
  bosses: ['echo_sentinel'],
  envs: ['rooftops', 'highlands', 'wasteland'],
  heal: 0.35,
  coins: w => 25 + w * 12,
  gemsEvery: 5
};
