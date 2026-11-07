/* KAGE — game data. Weapons, gear, enemies, bosses and acts are plain data objects:
   add a new entry here and it appears in the Armory / campaign automatically. */

/* ---------------- Developer unlock ----------------
   DEVELOPER TESTING ONLY. While `unlockAll` is true, every chapter and stage is open in any order, every Boss Rush
   boss and Echo Trials boss echo is available, New Game+ is open, and the player owns every weapon, helmet and armour
   (at level 1, so upgrades still work) with `coins` coins and `gems` gems. It plays on its own save
   (Logic.DEV_SAVE_KEY), so the real save is never touched, and the title shows a DEV badge.
   SET unlockAll TO false BEFORE RELEASE: the game then returns to the untouched normal save with its normal locks. */
const DEV = { unlockAll: true, coins: 99999, gems: 999 };

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
  tsubame: { heft: 0.6, el: 'lightning', name: 'Tsubame', cls: 'Twin blades', tab: 'blades', tier: 'common', hands: 'dual', len: 64, stance: 'twin', stats: [44, 92, 38], price: 450,
    trail: '#ece5d3', desc: 'Fast attacks and extended combos. Five-cut string ending in a spinning finisher.',
    lore: 'Courier blades of the Hoshimura runners, light enough to carry past every Order checkpoint unseen.',
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
  kagetsu: { heft: 1, el: 'moon', name: 'Kagetsu', cls: 'Katana', tab: 'blades', tier: 'common', hands: 2, len: 82, stance: 'katana', stats: [60, 64, 58], price: 0,
    trail: '#ece5d3', desc: 'Balanced cuts and lightning counter-slashes. Block or parry, then strike to draw the iai counter.',
    lore: '"Shadow Moon." Takashi forged it in Hoshimura for Kage\'s first oath; it was never registered with the Order.',
    moves: ['k1', 'k2', 'k3'], air: 'ka', special: 'crescentMoon', counter: 'kc',
    defs: {
      k1: { kind: 'weapon', a: { lean: -6, head: 2, fs: 166, fe: 8, wa: 194 }, w: { lean: -8, fs: 178, fe: 26, wa: 214 }, s: { lean: 22, rx: 14, head: 8, fs: 74, fe: 0, wa: 22, fh: 38, fk: -24, bh: -32, bk: -4 }, f: { lean: 28, rx: 12, head: 10, fs: 40, fe: 0, wa: -14, fh: 40, fk: -32, bh: -34, bk: -6 }, t: [0.1, 0.07, 0.19], dmg: 10, kb: 200, hs: 0.32, box: [16, -222, 150, 176], limb: 'w', snd: 'swing', hsnd: 'slash', imp: 1, next: 'k2' },
      k2: { kind: 'weapon', w: { lean: 16, head: 10, fs: 20, fe: 8, wa: -26, fh: 32, fk: -32 }, s: { lean: -4, fs: 152, fe: 10, wa: 190 }, f: { lean: -8, head: -4, fs: 168, fe: 16, wa: 208 }, t: [0.1, 0.07, 0.19], dmg: 10, kb: 140, up: -420, hs: 0.4, box: [16, -232, 140, 186], limb: 'w', snd: 'swing', hsnd: 'slash', imp: 1, next: 'k3' },
      k3: { kind: 'weapon', a: { lean: 0, rx: -6, fs: 34, fe: 90, wa: 94, fh: 16, fk: -22, bh: -12, bk: -22 }, w: { lean: -2, rx: -12, fs: 40, fe: 114, wa: 92, fh: 18, fk: -24, bh: -14, bk: -22 }, s: { lean: 30, rx: 36, head: 8, fs: 92, fe: 0, wa: 90, fh: 46, fk: -26, bh: -44, bk: -2 }, f: { lean: 24, rx: 30, fs: 86, fe: 10, wa: 92, fh: 44, fk: -26, bh: -42, bk: -4 }, t: [0.14, 0.08, 0.27], dmg: 14, kb: 520, hs: 0.5, kd: 1, box: [26, -168, 186, 46], limb: 'w', snd: 'heavyswing', hsnd: 'slash', imp: 2, stamp: 'SLASH', lunge: 380 },
      ka: { kind: 'air', w: { lean: 0, fs: 168, fe: 10, wa: 210 }, s: { lean: 22, fs: 64, fe: 0, wa: -8 }, t: [0.07, 0.1, 0.16], dmg: 9, kb: 220, up: 200, hs: 0.36, box: [10, -200, 140, 190], limb: 'w', snd: 'swing', hsnd: 'slash', imp: 1 },
      kc: { kind: 'weapon', counter: 1, w: { lean: 14, head: 10, fs: 6, fe: 20, wa: -46, fh: 36, fk: -40, bh: -34, bk: -20 }, s: { lean: 26, rx: 32, head: 8, fs: 106, fe: 0, wa: 160, fh: 46, fk: -30, bh: -46, bk: 0 }, f: { lean: 16, fs: 168, fe: 10, wa: 178 }, t: [0.04, 0.08, 0.26], dmg: 18, kb: 480, up: -260, hs: 0.55, box: [16, -220, 170, 180], limb: 'w', snd: 'heavyswing', hsnd: 'slash', imp: 3, stamp: 'COUNTER', lunge: 420 }
    }
  },
  onikiri: { heft: 1.6, el: 'flame', name: 'Onikiri', cls: 'Cleaver', tab: 'heavy', tier: 'rare', hands: 1, len: 104, stance: 'cleaver', stats: [82, 38, 54], price: 1400,
    trail: '#d24a3c', desc: 'Heavy damage that breaks any guard. Slow to start — commit to every swing.',
    lore: 'A field cleaver salvaged from the Silent War. The soot of a burned barracks never washes out of its fuller.',
    moves: ['c1', 'c2', 'c3'], air: 'ca', special: 'mountainSplit', counter: 'c2',
    defs: {
      c1: { kind: 'weapon', a: { lean: -16, head: -4, fs: 188, fe: 4, wa: 230 }, f: { lean: 32, rx: 12, fs: 40, fe: 0, wa: -22, fh: 42, fk: -34, bh: -36, bk: -8 }, w: { lean: -12, fs: 176, fe: 14, wa: 222 }, s: { lean: 26, rx: 14, fs: 72, fe: 0, wa: 8, fh: 38, fk: -24, bh: -34, bk: -8 }, t: [0.22, 0.08, 0.3], dmg: 18, kb: 260, hs: 0.45, gb: 70, box: [16, -230, 150, 230], limb: 'w', snd: 'heavyswing', hsnd: 'heavy', imp: 2, stamp: 'BREAK', next: 'c2' },
      c2: { kind: 'weapon', w: { lean: 4, fs: -30, fe: 30, wa: -36 }, s: { lean: -6, fs: 150, fe: 6, wa: 150 }, t: [0.2, 0.08, 0.3], dmg: 15, kb: 260, up: -560, hs: 0.5, gb: 55, box: [16, -230, 150, 200], limb: 'w', snd: 'heavyswing', hsnd: 'heavy', imp: 2, next: 'c3' },
      c3: { kind: 'weapon', a: { lean: -20, fs: 196, fe: 0, wa: 200, fh: 30, fk: -50, bh: -30, bk: -40 }, f: { lean: 40, fs: 40, fe: 0, wa: -10, fh: 64, fk: -90, bh: -40, bk: -54 }, w: { lean: -16, fs: 184, fe: 0, wa: 204 }, s: { lean: 36, fs: 44, fe: 0, wa: -6, fh: 60, fk: -80, bh: -40, bk: -50 }, t: [0.28, 0.1, 0.42], dmg: 24, kb: 420, up: -300, hs: 0.6, kd: 1, gb: 110, box: [10, -200, 170, 200], limb: 'w', snd: 'heavyswing', hsnd: 'heavy', imp: 3, stamp: 'SMASH', shock: 1, hop: -420, lunge: 260 },
      ca: { kind: 'air', w: { lean: -10, fs: 176, fe: 0, wa: 210 }, s: { lean: 30, fs: 50, fe: 0, wa: -10 }, t: [0.12, 0.1, 0.22], dmg: 14, kb: 200, up: 400, hs: 0.45, gb: 60, box: [10, -200, 150, 220], limb: 'w', snd: 'heavyswing', hsnd: 'heavy', imp: 2 }
    }
  },
  mizuchi: { heft: 1.2, el: 'water', name: 'Mizuchi', cls: 'Spear', tab: 'polearms', tier: 'rare', hands: 2, len: 196, stance: 'spear', stats: [52, 60, 96], price: 1700,
    trail: '#c9a45c', desc: 'Longest reach in the Armory. Two pokes and a leg-sweeping arc.',
    lore: 'Pike of the old Hoshimura gate watch, re-hafted in secret after the Order burned the village gate.',
    moves: ['s1', 's2', 's3'], air: 'sa', special: 'dragonLance', counter: 's1',
    defs: {
      s1: { kind: 'weapon', f: { lean: 14, rx: 20, fs: 82, fe: 10, wa: 93 }, w: { lean: 0, rx: -14, fs: 36, fe: 70, wa: 95 }, s: { lean: 18, rx: 26, fs: 88, fe: 0, wa: 92 }, t: [0.09, 0.07, 0.18], dmg: 8, kb: 220, hs: 0.3, box: [30, -170, 236, 44], limb: 'w', snd: 'swing', hsnd: 'slash', imp: 0, next: 's2' },
      s2: { kind: 'weapon', w: { lean: -2, rx: -10, fs: 62, fe: 70, wa: 116 }, s: { lean: 14, rx: 22, fs: 110, fe: 0, wa: 112 }, t: [0.09, 0.07, 0.18], dmg: 8, kb: 240, hs: 0.3, box: [30, -232, 230, 60], limb: 'w', snd: 'swing', hsnd: 'slash', imp: 1, next: 's3' },
      s3: { kind: 'weapon', spin: 1, f: { lean: 26, fs: 50, fe: 0, wa: 40, fh: 56, fk: -76, bh: -40, bk: -48 }, w: { lean: -10, fs: 150, fe: 10, wa: 200 }, s: { lean: 30, fs: 62, fe: 0, wa: 72, fh: 60, fk: -80, bh: -40, bk: -50 }, t: [0.14, 0.1, 0.26], dmg: 11, kb: 200, up: -420, hs: 0.5, kd: 1, low: 1, box: [10, -70, 236, 70], limb: 'w', snd: 'heavyswing', hsnd: 'slash', imp: 2, stamp: 'SWEEP' },
      sa: { kind: 'air', w: { lean: -4, fs: 150, fe: 0, wa: 160 }, s: { lean: 30, fs: 70, fe: 0, wa: 50 }, t: [0.08, 0.1, 0.18], dmg: 9, kb: 200, up: 300, hs: 0.36, box: [10, -170, 200, 170], limb: 'w', snd: 'swing', hsnd: 'slash', imp: 1 }
    }
  },
  yamigama: { heft: 0.95, el: 'blood', name: 'Yamigama', cls: 'Chain sickle', tab: 'chains', tier: 'epic', hands: 1, len: 70, stance: 'sickle', stats: [56, 66, 74], price: 2600,
    trail: '#9b8cff', desc: 'A chained sickle. The second strike hurls the blade and drags the enemy to you.',
    lore: 'A Hollow-hunter\'s chain sickle. Its links are woven with memory ash, so they bite things that should have no body.',
    moves: ['h1', 'h2', 'h3'], air: 'ha', special: 'reapersHarvest', counter: 'h3',
    defs: {
      h1: { kind: 'weapon', w: { lean: -4, fs: 172, fe: 30, wa: 232 }, s: { lean: 18, fs: 72, fe: 0, wa: 20 }, t: [0.09, 0.07, 0.18], dmg: 9, kb: 160, hs: 0.32, box: [16, -214, 128, 160], limb: 'w', snd: 'swing', hsnd: 'slash', imp: 0, next: 'h2' },
      h2: { kind: 'weapon', a: { lean: -4, fs: 170, fe: 30, wa: 300 }, w: { lean: -8, fs: 196, fe: 40, wa: 236 }, s: { lean: 20, fs: 96, fe: 0, wa: 90 }, t: [0.13, 0.16, 0.24], dmg: 8, kb: 0, hs: 0.45, pull: 1, disarm: 0.2, box: [70, -176, 250, 56], chain: 300, limb: 'w', snd: 'chain', hsnd: 'slash', imp: 1, stamp: 'YANK', next: 'h3' },
      h3: { kind: 'weapon', w: { lean: 6, fs: 20, fe: 30, wa: -30 }, s: { lean: -2, fs: 152, fe: 0, wa: 202 }, t: [0.1, 0.09, 0.25], dmg: 13, kb: 420, up: -460, hs: 0.5, box: [12, -232, 146, 196], limb: 'w', snd: 'heavyswing', hsnd: 'slash', imp: 2, stamp: 'REAP' },
      ha: { kind: 'air', w: { lean: 0, fs: 172, fe: 10, wa: 220 }, s: { lean: 24, fs: 64, fe: 0, wa: 0 }, t: [0.07, 0.1, 0.16], dmg: 9, kb: 200, up: 220, hs: 0.36, box: [10, -200, 136, 190], limb: 'w', snd: 'swing', hsnd: 'slash', imp: 1 }
    }
  },
  iwakudaki: { heft: 2.2, el: 'earth', name: 'Iwakudaki', cls: 'Hammer', tab: 'heavy', tier: 'epic', hands: 2, len: 150, stance: 'hammer', stats: [98, 16, 66], price: 3200,
    trail: '#d24a3c', desc: 'Extremely slow but devastating. The overhead smash splits the ground.',
    lore: 'The siege maul that cracked the outer wall of the Fortress of Silence in the war. The Order buried it; someone dug it up.',
    moves: ['m1', 'm2'], air: 'ma', special: 'earthshatter', counter: 'm2',
    defs: {
      m1: { kind: 'weapon', a: { lean: -22, head: -6, fs: 196, fe: 0, wa: 196, fh: 22, fk: -30, bh: -24, bk: -22 }, f: { lean: 36, fs: 74, fe: 0, wa: -2, fh: 46, fk: -44, bh: -38, bk: -22 }, w: { lean: -18, fs: 186, fe: 0, wa: 200 }, s: { lean: 34, fs: 76, fe: 0, wa: 2, fh: 44, fk: -40, bh: -36, bk: -20 }, t: [0.42, 0.1, 0.48], dmg: 34, kb: 380, up: -360, hs: 0.7, kd: 1, gb: 160, box: [16, -246, 176, 246], limb: 'w', snd: 'heavyswing', hsnd: 'heavy', imp: 3, stamp: 'SMASH', shock: 1, armor: 1, next: 'm2' },
      m2: { kind: 'weapon', a: { lean: -12, fs: -70, fe: 20, wa: -96 }, f: { lean: 14, fs: 140, fe: 10, wa: 190 }, w: { lean: -8, fs: -60, fe: 20, wa: -82 }, s: { lean: 22, fs: 112, fe: 0, wa: 152 }, t: [0.36, 0.1, 0.46], dmg: 28, kb: 900, up: -380, hs: 0.7, kd: 1, gb: 140, box: [16, -246, 176, 230], limb: 'w', snd: 'heavyswing', hsnd: 'heavy', imp: 3, stamp: 'BREAK', armor: 1 },
      ma: { kind: 'air', w: { lean: -14, fs: 186, fe: 0, wa: 206 }, s: { lean: 34, fs: 60, fe: 0, wa: -6 }, t: [0.2, 0.12, 0.3], dmg: 22, kb: 300, up: 500, hs: 0.5, gb: 100, box: [10, -220, 170, 240], limb: 'w', snd: 'heavyswing', hsnd: 'heavy', imp: 2, shock: 1 }
    }
  },

  shizuka: { heft: 1.05, el: 'moon', name: 'Shizuka', cls: 'Katana', tab: 'blades', tier: 'rare', base: 'kagetsu', hands: 2, len: 88, stance: 'katana', stats: [64, 68, 62], price: 1100,
    trail: '#b9c4c9', desc: 'An Order katana on the Kagetsu forms: slightly longer and quicker to draw.',
    lore: 'Order-issue steel. The scabbard is lined with felt so that no draw is ever heard in the City of Echoes.' },

  /* ---- boss weapons: defined but locked; boss stages grant them through their `reward` (see CAMPAIGN).
     Never upgraded and never scaled with player level: their fixed stats are the top tier.
     `special` is a placeholder rage art until the boss tickets add each weapon's real one (noted per weapon);
     Raikō no Tachi and Kagehira & Yūrei already have their own (Thunder Swing, Smoke Step). ---- */
  // Shinsen ("True Flash"), Takashi's abandoned odachi: granted when Akari falls (act2.boss's reward). Its own move set,
  // the father-style variations of the family form (FAMILY_FORM): a heavy opening cut, a rising cut (`family.rise`) and
  // a broad horizontal flow (`family.flow`). Longer start-up and recovery than Kagetsu, broader arcs, more damage and
  // more heft, so the two blades feel clearly different. Gold trails (el 'gold'). Rage art: Final Flow (FINAL_FLOW).
  // `base: 'kagetsu'` keeps its damage measured against Kagetsu's (weaponMul) while the moves are its own.
  shinsen: { heft: 1.6, el: 'gold', name: 'Shinsen', cls: 'Odachi', tab: 'blades', tier: 'boss', base: 'kagetsu', hands: 2, len: 114, stance: 'katana', stats: [150, 120, 132],
    exclusive: true, hint: 'Defeat Akari', special: 'finalFlow',
    trail: '#e8c25c', desc: 'Takashi\'s odachi. Slow, broad father-style arcs that land like a cleaver. Rage art: Final Flow.',
    lore: 'Takashi\'s own odachi, gold along its spine. He forged it the year he built the Echo System, then left it behind.',
    moves: ['sh1', 'sh2', 'sh3'], air: 'sha', counter: 'shc', family: { rise: 'sh2', aerial: 'sha', flow: 'sh3' },
    defs: {
      sh1: { kind: 'weapon', a: { lean: -12, head: -2, fs: 184, fe: 4, wa: 214, fh: 20, fk: -26, bh: -24, bk: -12 }, w: { lean: -14, fs: 190, fe: 20, wa: 226, fh: 22, fk: -28, bh: -26, bk: -12 }, s: { lean: 28, rx: 18, head: 10, fs: 66, fe: 0, wa: 8, fh: 44, fk: -30, bh: -38, bk: -6 }, f: { lean: 32, rx: 14, head: 10, fs: 36, fe: 0, wa: -22, fh: 46, fk: -36, bh: -38, bk: -8 }, t: [0.19, 0.09, 0.32], dmg: 12, kb: 280, hs: 0.42, box: [16, -236, 176, 196], limb: 'w', snd: 'heavyswing', hsnd: 'slash', imp: 2, next: 'sh2' },
      sh2: { kind: 'weapon', w: { lean: 20, head: 12, fs: 10, fe: 6, wa: -40, fh: 38, fk: -40, bh: -30, bk: -14 }, s: { lean: -8, fs: 160, fe: 10, wa: 204 }, f: { lean: -12, head: -6, fs: 176, fe: 16, wa: 220 }, t: [0.19, 0.09, 0.32], dmg: 12, kb: 160, up: -480, hs: 0.46, box: [16, -246, 166, 206], limb: 'w', snd: 'heavyswing', hsnd: 'slash', imp: 2, next: 'sh3' },
      sh3: { kind: 'weapon', a: { lean: -4, rx: -10, fs: 30, fe: 100, wa: 100, fh: 18, fk: -24, bh: -14, bk: -24 }, w: { lean: -6, rx: -18, fs: 36, fe: 124, wa: 96, fh: 20, fk: -26, bh: -16, bk: -24 }, s: { lean: 34, rx: 42, head: 8, fs: 94, fe: 0, wa: 92, fh: 50, fk: -30, bh: -48, bk: -2 }, f: { lean: 28, rx: 36, fs: 84, fe: 10, wa: 94, fh: 48, fk: -30, bh: -46, bk: -4 }, t: [0.26, 0.1, 0.42], dmg: 17, kb: 600, hs: 0.56, kd: 1, box: [26, -176, 216, 58], limb: 'w', snd: 'heavyswing', hsnd: 'slash', imp: 3, stamp: 'FLOW', lunge: 420 },
      sha: { kind: 'air', w: { lean: -6, fs: 178, fe: 8, wa: 220 }, s: { lean: 26, fs: 58, fe: 0, wa: -14 }, t: [0.11, 0.1, 0.22], dmg: 11, kb: 260, up: 260, hs: 0.4, box: [10, -210, 160, 200], limb: 'w', snd: 'heavyswing', hsnd: 'slash', imp: 2 },
      shc: { kind: 'weapon', counter: 1, w: { lean: 16, head: 10, fs: 2, fe: 20, wa: -52, fh: 38, fk: -42, bh: -36, bk: -20 }, s: { lean: 30, rx: 36, head: 8, fs: 100, fe: 0, wa: 156, fh: 48, fk: -32, bh: -48, bk: 0 }, f: { lean: 18, fs: 166, fe: 10, wa: 182 }, t: [0.06, 0.09, 0.32], dmg: 20, kb: 520, up: -280, hs: 0.58, box: [16, -226, 190, 186], limb: 'w', snd: 'heavyswing', hsnd: 'slash', imp: 3, stamp: 'COUNTER', lunge: 440 }
    } },
  raiko_no_tachi: { heft: 1.9, el: 'redline', name: 'Raikō no Tachi', cls: 'Odachi', tab: 'heavy', tier: 'boss', base: 'onikiri', hands: 1, len: 128, stance: 'cleaver', stats: [190, 92, 120],
    exclusive: true, hint: 'Defeat Raikon', special: 'thunderSwing',
    trail: '#ff4a3c', desc: 'Raikon\'s broad odachi on the cleaver forms. Slow, guard-breaking, thunderous.',
    lore: 'Raikon\'s broad odachi. The red groove down the blade drinks lightning and spits it back at whoever defies the Order.' },
  // Akari's twin blades (Act II boss): Kagehira (square guard, straight; it opens the guard) and Yūrei (ring guard, a
  // slight curve; it punishes the opening). `twin` draws the two different blades (20-fighter.js).
  kagehira_yurei: { heft: 0.7, el: 'petal', name: 'Kagehira & Yūrei', cls: 'Twin blades', tab: 'blades', tier: 'boss', base: 'tsubame', hands: 'dual', len: 72, stance: 'twin', stats: [104, 188, 110],
    exclusive: true, hint: 'Defeat Akari', special: 'smokeStep', twin: 1,
    trail: '#9b6bd6', desc: 'Akari\'s paired short blades on the twin-blade forms. Rage art: Smoke Step.',
    lore: 'Akari\'s paired blades. Kagehira cuts the body; Yūrei cuts the memory of the wound, so it never stops hurting.' },
  mugen_no_ha: { heft: 1.1, el: 'moon', name: 'Mugen no Ha', cls: 'Katana', tab: 'blades', tier: 'boss', base: 'kagetsu', hands: 2, len: 96, stance: 'katana', stats: [162, 124, 128],
    exclusive: true, hint: 'Finish the Epilogue, The Last Choice', special: 'echoReplication',
    trail: '#9b8cff', desc: 'The Witness\'s blade on the katana forms. Rage art: Echo Replication, a phantom of Kage replays his last landed string.',
    lore: 'A blade of stolen memory shards, pressed together in the Memory Core. It remembers every fighter it has ever cut.' },

  /* ---- enemy-only arms ---- */
  shadow_daggers: { heft: 0.6, el: 'shade', enemy: 1, name: 'Shadow Daggers', base: 'tsubame', len: 52, trail: '#ece5d3' },
  hollow_crescents: { heft: 0.8, el: 'moon', enemy: 1, name: 'Hollow Crescents', base: 'tsubame', len: 74, trail: '#9b8cff', crescent: 1 },
  mist_fans: { heft: 0.6, el: 'wind', enemy: 1, name: 'Mist Fans', base: 'tsubame', len: 46, trail: '#b9c4c9', fan: 1 },
  sentinel_spear: { heft: 1.2, el: 'shade', enemy: 1, name: 'Sentinel Spear', base: 'mizuchi', hands: 1, stance: 'shield', len: 180, trail: '#c9a45c', shield: 1 },
  sage_staff: { heft: 1.1, el: 'water', enemy: 1, name: 'Sage Staff', base: 'mizuchi', len: 200, trail: '#7fd0c8', staff: 1, stance: 'staff' },
  storm_orbs: { heft: 0.6, el: 'lightning', enemy: 1, name: 'Storm Orbs', base: 'fists', hands: 0, stance: 'orbs', trail: '#7fb8ff' },
  iron_fists: { heft: 1.5, el: 'earth', enemy: 1, name: 'Iron Fists', base: 'fists', hands: 0, trail: '#d24a3c', gauntlet: 1 },
  chain_hook: { heft: 1, el: 'flame', enemy: 1, name: 'Chain Hook', base: 'yamigama', len: 64, trail: '#d24a3c', hook: 1 },
  tyrant_cleaver: { heft: 2, el: 'flame', enemy: 1, name: 'Tyrant Cleaver', base: 'onikiri', len: 130, trail: '#ff6a3c' },
  cutter_blade: { heft: 1, el: 'shade', enemy: 1, name: 'Cutter Blade', base: 'kagetsu', len: 92, trail: '#ece5d3' },
  // Akari's own Kagehira & Yūrei, at enemy strength (the player's boss-tier pair is kagehira_yurei, granted when she falls)
  akari_blades: { heft: 0.7, el: 'petal', enemy: 1, name: 'Kagehira & Yūrei', base: 'tsubame', len: 70, stats: [50, 70, 54], trail: '#9b6bd6', twin: 1 },
  // Raikon's own Raikō no Tachi: the same broad odachi and red lightning groove, at enemy strength (the player's boss-tier
  // copy is raiko_no_tachi, granted when Raikon falls)
  raikon_tachi: { heft: 1.9, el: 'redline', enemy: 1, name: 'Raikō no Tachi', base: 'onikiri', len: 128, stats: [64, 40, 60], trail: '#ff4a3c' },
  // Takashi's own blade (Act III boss): a PLAIN, unadorned long katana, never Shinsen (he abandoned it; Kage carries it
  // now), but he still cuts in the Shinsen style: Shinsen's forms (sh1-sh3, air sha, counter shc) on the katana base, so
  // his damage is measured against Kagetsu's like Shinsen's, and gold trails. `special: 'none'` keeps the player's
  // Final Flow rage art off him (no rage art; a kunai instead); his Final Flow is the boss ability (BOSS_ABILITIES).
  takashi_blade: { heft: 1.5, el: 'gold', enemy: 1, name: 'Nameless Blade', base: 'kagetsu', len: 104, stats: [60, 58, 66], trail: '#e8c25c',
    moves: ['sh1', 'sh2', 'sh3'], air: 'sha', counter: 'shc', special: 'none' },
  // The Witness's Mugen no Ha (final boss): an enemy-only copy of the boss weapon, a fragmented sword of memory shards.
  // It only starts on the katana forms: the Witness copies whatever Kage holds (ENEMIES.witness.mirrorWeapon), so its
  // move-set, stance and reach become his weapon's while the shards re-form into that weapon's shape (20-fighter.js).
  mugen_shards: { heft: 1, el: 'void', enemy: 1, name: 'Mugen no Ha', base: 'kagetsu', len: 96, trail: '#9b8cff', special: 'none' },
  // The Core's echoes (core.echo1..4): corrupted Hollow copies of the blades Kage met on the way, the same shapes in
  // violet (`void` element), at enemy strength. Never sold, owned or dropped (the echoes grant gems, never gear).
  echo_tachi: { heft: 1.8, el: 'void', enemy: 1, name: 'Hollow Tachi', base: 'onikiri', len: 124, stats: [58, 40, 58], trail: '#9b8cff' },
  echo_fangs: { heft: 0.7, el: 'void', enemy: 1, name: 'Hollow Fangs', base: 'tsubame', len: 68, stats: [46, 68, 52], trail: '#9b8cff', twin: 1 },
  echo_nameless: { heft: 1.4, el: 'void', enemy: 1, name: 'Hollow Nameless Blade', base: 'kagetsu', len: 102, stats: [56, 56, 64], trail: '#9b8cff',
    moves: ['sh1', 'sh2', 'sh3'], air: 'sha', counter: 'shc', special: 'none' },
  echo_rem_blade: { heft: 0.9, el: 'void', enemy: 1, name: 'Hollow Travel Blade', base: 'kagetsu', len: 94, stats: [54, 66, 60], trail: '#b48aff', special: 'none' },
  // Act II sub-boss arms (act2.sub1..4)
  courier_kunai: { heft: 0.6, el: 'shade', enemy: 1, name: 'Courier Kunai', base: 'tsubame', len: 44, trail: '#b9a8d8' },
  quiet_kodachi: { heft: 0.9, el: 'moon', enemy: 1, name: 'Quiet Kodachi', base: 'kagetsu', len: 66, trail: '#d6cce6' },
  echo_crescents: { heft: 0.8, el: 'moon', enemy: 1, name: 'Echo Crescents', base: 'tsubame', len: 70, trail: '#c9bdff', crescent: 1 },
  ledger_kusari: { heft: 1, el: 'shade', enemy: 1, name: 'Ledger Kusari', base: 'yamigama', len: 66, trail: '#b48ae6' },
  // Act III sub-boss arms (act3.sub1..4): Takashi's grounded forms in other hands, so their trails carry his gold
  gate_kanabo: { heft: 1.8, el: 'earth', enemy: 1, name: 'Gate Kanabo', base: 'iwakudaki', len: 120, trail: '#d9b055' },
  disciple_blade: { heft: 1.1, el: 'gold', enemy: 1, name: 'Discipl\' Blade', base: 'kagetsu', len: 96, trail: '#e6d29a' },
  conduit_naginata: { heft: 1.3, el: 'shade', enemy: 1, name: 'Conduit Naginata', base: 'mizuchi', len: 172, trail: '#b48aff' },
  silent_odachi: { heft: 1.6, el: 'gold', enemy: 1, name: 'Silent Odachi', base: 'onikiri', len: 126, trail: '#e8c25c' },
  temple_staff: { heft: 1.1, el: 'shade', enemy: 1, name: 'Temple Staff', base: 'mizuchi', len: 180, trail: '#ece5d3', staff: 1, stance: 'staff' },
  // Shiden's war spear (Act I sub-boss): a long vanguard yari on the spear forms, with Raikon's red in its trail
  vanguard_yari: { heft: 1.3, el: 'redline', enemy: 1, name: 'Vanguard Yari', base: 'mizuchi', len: 176, trail: '#ff6a52' },
  raider_cleaver: { heft: 1.4, el: 'shade', enemy: 1, name: 'Raider Cleaver', base: 'onikiri', len: 86, trail: '#d24a3c' },
  // the Interlude's wooden practice sword (bokken): both young brothers spar with it (see SPAR and FAMILY_FORM). Katana
  // forms, but its string is the family form's rising cut into the horizontal flow (k2 -> k3) and its air cut is ka;
  // damage stat 30 against Kagetsu's 60, so a wooden blow lands at half strength. Never sold or owned (`enemy`).
  bokken: { heft: 0.8, el: 'wind', enemy: 1, name: 'Bokken', base: 'kagetsu', len: 80, stats: [30, 64, 58], trail: '#c9a878',
    moves: ['k2', 'k3'], air: 'ka', special: 'shadowPalm', counter: 'kc' }
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
  sh1: [-0.85, 0.85, 1, 0.55], sh2: [0.5, -0.65, -0.8, -0.25], sh3: [-0.65, 0.7, 0.55, 0.45], sha: [-0.6, 0.7, 0.7, 0.25], shc: [-0.95, 1, 0.85, 0.65],
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
    if (wp.base && wp.defs === WEAPONS[wp.base].defs) continue;   // inherits its base's forms (a weapon with its own defs, like Shinsen, builds them)
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
  earthshatter:  { name: 'Earthshatter', desc: 'The ground itself breaks. Every grounded enemy is stunned.' },
  thunderSwing:  { name: 'Thunder Swing', desc: 'A wide arc that sends red lightning racing along the ground. Unblockable.' },
  smokeStep:     { name: 'Smoke Step', desc: 'Vanish in a puff of smoke, leave an afterimage behind, and strike from behind the enemy. Unblockable.' },
  echoReplication:{ name: 'Echo Replication', desc: 'A phantom memory-shard copy of Kage replays his most recent landed string on the enemy, harder. Unblockable.' },
  finalFlow:     { name: 'Final Flow', desc: 'Rising, overhead and diagonal cuts from both sides, then one decisive horizontal cut. Unblockable.' }
};

/* ---------------- Helmets & armor ----------------
   Every item: name, tier (see GEAR_TIERS), def (damage reduction at level 1), hp (bonus health at level 1),
   price (coins) or gems, lore (the one line shown in the Armory), perks, and look: the drawing key used by
   drawHelmet / drawArmor in 20-fighter.js (defaults to the item id).
   Locked items: exclusive (never sold) + hint (what the Armory says unlocks it). Trophies are granted by a
   campaign stage's `reward` (see CAMPAIGN); ngOnly trophies only drop during New Game+.
   Sub-boss trophies (tier 'trophy', one per act sub-boss) are each worn by the sub-boss that drops it; Act I's four
   are in (Sumi Eboshi, Ikazuchi-dō, Hisame Zukin, Shiden Yoroi), Acts II and III add theirs. */
const HELMETS = {
  // the id is the old face-wrap's (saves store it); the look is Kage's bare spiky hair and his red scarf
  shiro_maki:   { name: 'Crimson Scarf', tier: 'starter', def: 0.01, hp: 4, price: 0, look: 'topknot', perks: {},
    lore: 'Rem tore it from his own sleeve the night Hoshimura emptied. Kage winds it twice round his throat and has never untied it.' },
  kuro_zukin:   { name: 'Kuro Zukin', tier: 'common', def: 0.04, hp: 8, price: 300, look: 'ronin_hood', perks: { dash: 0.12 },
    lore: 'An outer-district smuggler\'s hood, dyed with ash so the Order\'s lanterns slide right off it.' },
  sugegasa:     { name: 'Sugegasa', tier: 'common', def: 0.05, hp: 8, price: 450, look: 'straw_kasa', perks: { ammo: 2 },
    lore: 'Woven by Hoshimura rice farmers. A pilgrim\'s hat hides a face, and a few spare kunai.' },
  hachigane:    { name: 'Hachigane', tier: 'common', def: 0.05, hp: 10, price: 600, look: 'storm_band', perks: { speed: 0.03 },
    lore: 'A steel brow-plate on a blue cord, worn by Order couriers who outran the storms over the City of Echoes.' },
  kasumi_men:   { name: 'Kasumi Veil', tier: 'common', def: 0.05, hp: 10, price: 750, look: 'veil', perks: { dash: 0.1 },
    lore: 'Grey mourning gauze from the outer districts. Hollows lose sight of a face they cannot remember.' },
  tetsu_kabuto: { name: 'Tetsu Kabuto', tier: 'rare', def: 0.09, hp: 14, price: 1200, look: 'iron_kabuto', perks: { stunRes: 0.3 },
    lore: 'Lacquered iron of an Order Warden, the gold crest filed off by whoever took it from him.' },
  oni_menpo:    { name: 'Oni Menpō', tier: 'rare', def: 0.08, hp: 14, gems: 12, look: 'oni_mask', perks: { rage: 0.2 },
    lore: 'A snarling face-guard from the Silent War. The rage carved into it seeps into whoever wears it.' },
  hoshi_kabuto: { name: 'Hoshi Kabuto', tier: 'rare', def: 0.1, hp: 16, price: 1600, look: 'sentinel_helm', perks: { stunRes: 0.15 },
    lore: 'Gate-watch helm of old Hoshimura. Its red plume is re-dyed every year for the dead.' },
  shika_kabuto: { name: 'Shika Kabuto', tier: 'epic', def: 0.12, hp: 22, price: 2300, look: 'sage_antlers', perks: { ammo: 3 },
    lore: 'Antlered crown of a Memory Core archivist; the tips glow when old memories pass close.' },
  utsuro_kabuto:{ name: 'Utsuro Kabuto', tier: 'epic', def: 0.12, hp: 20, gems: 25, look: 'hollow_crest', perks: { rage: 0.3 },
    lore: 'Forged around a broken Echo ring cut from a Hollow. It hums as rage builds.' },
  shikko_zukin: { name: 'Shikkō Zukin', tier: 'epic', def: 0.13, hp: 24, price: 2900, look: 'executioner', perks: { dmg: 0.05 },
    lore: 'Peaked hood of the Order\'s Silencers, who erase a memory first and the man who held it after.' },
  // ---- trophies (locked) ----
  raijin_kabuto:{ name: 'Raijin Kabuto', tier: 'trophy', def: 0.18, hp: 36, exclusive: true, hint: 'Defeat Raikon', look: 'raijin_kabuto', perks: { stunRes: 0.3, dmg: 0.05 },
    lore: 'Raikon\'s thunder helm. The red slit of its visor burned brightest just before he struck.' },
  // Act I sub-boss trophies
  sumi_eboshi:  { name: 'Sumi Eboshi', tier: 'trophy', def: 0.18, hp: 34, exclusive: true, hint: 'Defeat Kuroe, the Ink Censor', look: 'sumi_eboshi', perks: { rage: 0.15 },
    lore: 'The tall lacquered cap of the Archive Bureau\'s chief censor. Ink from ten thousand blacked-out names has soaked into its silk.' },
  hisame_zukin: { name: 'Hisame Zukin', tier: 'trophy', def: 0.18, hp: 34, exclusive: true, hint: 'Defeat Hisame, the Rain Courier', look: 'rain_hood', perks: { dash: 0.15, speed: 0.04 },
    lore: 'An Order courier\'s oiled rain hood with a storm-glass visor. It has run every roof in the outer districts and never once been caught.' },
  // Act II sub-boss trophies
  hakobi_gasa:  { name: 'Hakobi-gasa', tier: 'trophy', def: 0.18, hp: 34, exclusive: true, hint: 'Defeat Tsugumi, the Memory Courier', look: 'courier_hat', perks: { dash: 0.12, ammo: 2 },
    lore: 'A memory courier\'s flat hat hung with glass vials, each one a stored memory on its way into the City of Echoes. One vial still rattles. Nobody knows whose it is.' },
  utsushi_men:  { name: 'Utsushi-men', tier: 'trophy', def: 0.18, hp: 34, exclusive: true, hint: 'Defeat Utsushi, the Borrowed Face', look: 'borrowed_mask', perks: { rage: 0.2, speed: 0.03 },
    lore: 'The blank mask a Hollow wore to pass as an intelligence operative. The face painted on it is never the same one twice.' },
  // Act III sub-boss trophies
  deshi_tenugui: { name: 'Deshi Tenugui', tier: 'trophy', def: 0.18, hp: 34, exclusive: true, hint: 'Defeat Shizune, the First Disciple', look: 'disciple_wrap', perks: { stunRes: 0.15, rage: 0.1 },
    lore: 'The plain head cloth Takashi tied on each student who learned the grounded stance. Hers still bears the small ring-and-dot of the Tachibana school, half unpicked and never quite gone.' },
  mokushi_kabuto: { name: 'Mokushi Kabuto', tier: 'trophy', def: 0.18, hp: 36, exclusive: true, hint: 'Defeat Soma, the Silent Blademaster', look: 'blademaster_kabuto', perks: { dmg: 0.05, stunRes: 0.1 },
    lore: 'The masked helm of the Orde\' first sword. Its iron mouth-guard has no opening: he swore silence the day the war ended, and has kept it for everyone but his old teacher.' },
  kasa:         { name: 'Kasa', tier: 'trophy', def: 0.2, hp: 40, exclusive: true, hint: 'Defeat Takashi', look: 'straw_kasa', perks: { ammo: 3, rage: 0.15 },
    lore: 'Takashi\'s battered straw travel hat. He wore it on the long road into exile, before he was a father or the maker of anything, and never told his sons where that road led.' }
};
const ARMORS = {
  tachibana_yoroi: { name: 'Tachibana Yoroi', tier: 'starter', def: 0.02, hp: 8, price: 0, look: 'tachibana', perks: {},
    lore: 'Compact shoulder and forearm guards of the Tachibana house, its family crest lacquered small and half-hidden.' },
  kawa_do:      { name: 'Kawa-dō', tier: 'common', def: 0.05, hp: 15, price: 350, look: 'jerkin', perks: {},
    lore: 'A boiled-leather cuirass from the Hoshimura tannery, stitched by the last family that stayed.' },
  hai_haori:    { name: 'Hai Haori', tier: 'common', def: 0.04, hp: 12, price: 650, look: 'shadow_cloak', perks: { speed: 0.06 },
    lore: 'A coat woven from the memory ash left after Hollow fights. It moves like smoke.' },
  kasumi_shroud:{ name: 'Kasumi Shroud', tier: 'common', def: 0.05, hp: 14, price: 800, look: 'mist_shroud', perks: { dash: 0.15 },
    lore: 'Travelling shroud of the outer-district ferrymen, who carry the dead past the Order\'s checkpoints.' },
  soryo_e:      { name: 'Sōryo-e', tier: 'common', def: 0.05, hp: 18, price: 950, look: 'robe', perks: { rage: 0.1 },
    lore: 'Robe of the mountain temples that hid memory scrolls from the Order through the Silent War.' },
  kozane_do:    { name: 'Kozane-dō', tier: 'rare', def: 0.1, hp: 28, price: 1300, look: 'lamellar', perks: { speed: -0.03 },
    lore: 'Laced iron scales of an Order Warden, re-laced in Hoshimura colours.' },
  raiun_mantle: { name: 'Raiun Mantle', tier: 'rare', def: 0.08, hp: 22, gems: 15, look: 'storm_mantle', perks: { kunai: 0.6, speed: 0.03 },
    lore: 'Storm-silk ribbons salvaged from a Silent War signal tower. Kunai thrown from it crackle.' },
  shikko_garb:  { name: 'Shikkō Garb', tier: 'rare', def: 0.1, hp: 30, price: 1750, look: 'executioner_garb', perks: { blockRage: 1 },
    lore: 'Chain-wrapped leathers of the Order\'s Silencers. Every blow it turns aside feeds the wearer\'s rage.' },
  o_sode:       { name: 'Ō-sode Yoroi', tier: 'epic', def: 0.14, hp: 45, price: 2400, look: 'pauldrons', perks: { speed: -0.05, stunRes: 0.15 },
    lore: 'Great shoulder plates of a Silent War general, dragged out of the moat of the Fortress of Silence.' },
  kurogane_do:  { name: 'Kurogane-dō', tier: 'epic', def: 0.16, hp: 55, price: 3100, look: 'colossus_plate', perks: { speed: -0.08, stunRes: 0.25 },
    lore: 'Black-iron plate from the Fortress foundries, made for the guards at the doors of the Memory Core.' },
  goka_yoroi:   { name: 'Gōka Yoroi', tier: 'epic', def: 0.14, hp: 40, gems: 30, look: 'tyrant', perks: { dmg: 0.06 },
    lore: 'Ember-edged plate quenched in burning memory ash. It hits back harder for every scar it carries.' },
  // ---- trophies (locked) ----
  // Act I sub-boss trophies
  ikazuchi_do:  { name: 'Ikazuchi-dō', tier: 'trophy', def: 0.21, hp: 78, exclusive: true, hint: 'Defeat Garan, the Stormbroken', look: 'half_do', perks: { stunRes: 0.2, dmg: 0.04 },
    lore: 'Half a cuirass from Raikon\'s thunder vanguard. The storm burned the other half off Garan the day he deserted, and he wore what was left like a confession.' },
  shiden_yoroi: { name: 'Shiden Yoroi', tier: 'trophy', def: 0.21, hp: 80, exclusive: true, hint: 'Defeat Shiden, the Last Lieutenant', look: 'vanguard_plate', perks: { dmg: 0.05, stunRes: 0.1 },
    lore: 'A lieutenant\'s plate of the thunder vanguard, laced in violet cord. Its echo still keeps the archive road, waiting for orders that stopped ten years ago.' },
  // Act II sub-boss trophies
  shirabe_do:   { name: 'Shirabe-dō', tier: 'trophy', def: 0.21, hp: 78, exclusive: true, hint: 'Defeat Sayo, the Quiet Hand', look: 'operative_vest', perks: { dash: 0.15, dmg: 0.03 },
    lore: 'An intelligence operative\'s vest of lacquered strips, its lining stitched with pockets for message slips. Every slip is blank now; the memory that wrote them is gone.' },
  kasane_haori: { name: 'Kasane Haori', tier: 'trophy', def: 0.21, hp: 80, exclusive: true, hint: 'Defeat Kasane, the Ledger Warden', look: 'ledger_coat', perks: { stunRes: 0.15, rage: 0.1 },
    lore: 'A coat of pasted ledger pages, layer on layer: every memory the City of Echoes was rebuilt from, entered in a careful hand. Some entries contradict the ones beneath them.' },
  // Act III sub-boss trophies
  tetsumon_do:  { name: 'Tetsumon-dō', tier: 'trophy', def: 0.21, hp: 80, exclusive: true, hint: 'Defeat Gonryu, the Gate Warden', look: 'gate_plate', perks: { stunRes: 0.25, dmg: 0.03 },
    lore: 'A gate warde\' cuirass riveted with the studs of the Fortres\' outer door. That door has stayed shut for ten years, and the man inside this plate made sure of it.' },
  kudamaki_do:  { name: 'Kudamaki-dō', tier: 'trophy', def: 0.21, hp: 78, exclusive: true, hint: 'Defeat Moro, the Conduit Warden', look: 'conduit_harness', perks: { rage: 0.2, dash: 0.1 },
    lore: 'A conduit tende\' harness, coiled with the violet tubes that carry stored memories down through the Fortress. Put an ear to them and somebody is always talking.' },
  mei_en_garb:  { name: 'Mei-En Garb', tier: 'trophy', def: 0.21, hp: 80, exclusive: true, hint: 'Defeat Akari', look: 'mei_en', perks: { dash: 0.2, speed: 0.06 },
    lore: 'Akari\'s smoke-grey fighting garb. Even the Order\'s records cannot agree on what colour it is.' },
  kysmei_robe:  { name: 'Kysmei Robe', tier: 'trophy', def: 0.22, hp: 85, exclusive: true, hint: 'Finish the Epilogue, The Last Choice', look: 'kysmei', perks: { rage: 0.3 },
    lore: 'The Witness\'s robe, stitched from the threads of every memory the Echo System ever swallowed.' },
  kurokumo_yoroi:{ name: 'Kurokumo Yoroi', tier: 'trophy', def: 0.23, hp: 85, exclusive: true, hint: 'Finish the Epilogue, The Last Choice', givenBy: 'Rem', look: 'tyrant', perks: { dmg: 0.06, speed: 0.04 },
    lore: 'Rem\'s black-cloud armour, given to Kage by Rem at the ruined entrance of the Core. Under the ash on its collar, the Tachibana crest has been scratched away.' },
  shinsei_yoroi:{ name: 'Shinsei Yoroi', tier: 'trophy', def: 0.26, hp: 100, exclusive: true, ngOnly: true, hint: 'Finish the Epilogue in New Game+', look: 'shinsei', perks: { stunRes: 0.3 },
    lore: 'The armour Takashi wore when he first opened the Echo System. It only answers to one who has walked the road twice.' }
};
for (const id in HELMETS) HELMETS[id].id = id;
for (const id in ARMORS) ARMORS[id].id = id;

// Gear tiers, weakest first. Shop gear is common / rare / epic; trophies (sub-boss and boss) sit above every
// fully upgraded shop item of their slot, and boss weapons above all. Shop weapons climb a tier as they are
// upgraded (see Logic.itemTier): Kagetsu starts Common and becomes Epic at full mastery.
const GEAR_TIERS = {
  starter: { rank: 0, label: 'Starting gear' },
  common:  { rank: 1, label: 'Common' },
  rare:    { rank: 2, label: 'Rare' },
  epic:    { rank: 3, label: 'Epic' },
  trophy:  { rank: 4, label: 'Trophy' },
  boss:    { rank: 5, label: 'Boss weapon' }
};

const GEAR_MAX = { weapons: 8, helmets: 5, armors: 5 };


/* ---------------- Enemies & bosses ----------------
   type: regular | sub | boss.  ai: regular | agile | defensive | ranged | heavy | boss
   build: scale (overall size), w (limb thickness), head, legs, arms (length multipliers)
   Regular foes come in two families (ENEMY_FAMILIES), each with one unit of every UNIT_TYPES type. A unit has
   `family`, `unit` (which is also its AI profile) and, for the Order, a `rank` (1-3, drawn as small pale marks).
   def: damage reduction for foes whose helmet / armour are drawings rather than gear (see Logic.enemyStats).
   Units are troops, not people: no personal names. The family's palette (body fill, trim, outline) is drawn by
   20-fighter.js; Hollows flicker and dissolve into memory ash on defeat (60-engine.js).
   echo_sentinel and echo_warden are TEMPORARY sub-boss and boss rigs, fought under each stage's story name
   (see CAMPAIGN) until the boss updates land. */
const UNIT_TYPES = ['regular', 'agile', 'defensive', 'ranged', 'heavy'];
const ENEMY_FAMILIES = {
  // human troops in one slate uniform: a pale grey sash and the Order mark, a cloth mask or a helm
  order:  { name: 'Order of Silence', title: 'Order of Silence', body: '#3b4149', trim: '#c4c8cc', outline: 'rgba(214,218,222,0.8)' },
  // unstable memory echoes: flat violet silhouettes that flicker, double and glitch
  hollow: { name: 'Hollows', title: 'Memory echo', body: '#4a3b86', trim: '#b9a8ff', outline: 'rgba(196,182,255,0.85)', flicker: ['#4a3b86', '#54449c', '#41347a'], ash: ['#9b8cff', '#6f5fc8', '#c9bdff'] }
};
const ECHO_ACCENT = '#b48aff';   // the Core's echoes: one violet accent over every original colour
const ENEMIES = {
  // ---- Order of Silence ----
  order_footman: { name: 'Order Footman', title: 'Order of Silence', type: 'regular', family: 'order', unit: 'regular', rank: 1, outfit: 'gi', ai: 'regular',
            weapon: 'cutter_blade', helmet: 'order_hood', armor: 'order_garb', hp: 170, def: 0.054, dmg: 0.9, build: { scale: 1, w: 10 }, eye: '#c4c8cc', accent: '#c4c8cc',
            taunt: 'The Order of Silence holds this road. Turn back.', tip: 'Block the first cut, then answer with a three-punch string.' },
  order_runner: { name: 'Order Runner', title: 'Order of Silence', type: 'regular', family: 'order', unit: 'agile', rank: 1, outfit: 'gi', ai: 'agile',
            weapon: 'shadow_daggers', helmet: 'order_hood', armor: 'order_garb', hp: 150, def: 0.03, dmg: 0.85, speed: 1.12, build: { scale: 0.97, w: 9, legs: 1.05 }, eye: '#c4c8cc', accent: '#c4c8cc',
            taunt: 'You will not outrun a message of the Order.', tip: 'Runners dart in and out. Hold your ground and punish the landing.' },
  order_shieldbearer: { name: 'Order Shieldbearer', title: 'Order of Silence', type: 'regular', family: 'order', unit: 'defensive', rank: 2, outfit: 'gi', ai: 'defensive',
            weapon: 'sentinel_spear', helmet: 'order_kabuto', armor: 'order_garb', hp: 220, def: 0.12, dmg: 1, build: { scale: 1.06, w: 11 }, eye: '#c4c8cc', accent: '#c4c8cc',
            taunt: 'Nothing passes the wall of the Order.', tip: 'The shield turns every cut. Grab him (Block + Punch) or charge a heavy kick.' },
  order_chainthrower: { name: 'Order Chainthrower', title: 'Order of Silence', type: 'regular', family: 'order', unit: 'ranged', rank: 1, outfit: 'gi', ai: 'ranged',
            weapon: 'chain_hook', helmet: 'order_hood', armor: 'order_garb', hp: 150, def: 0.04, dmg: 0.85, build: { scale: 0.98, w: 9.5 }, eye: '#c4c8cc', accent: '#c4c8cc',
            taunt: 'Stay where you are. The chain will come to you.', tip: 'He keeps his distance and throws. Dash through the kunai and stay close.' },
  order_ironclad: { name: 'Order Ironclad', title: 'Order of Silence', type: 'regular', family: 'order', unit: 'heavy', rank: 3, outfit: 'gi', ai: 'heavy',
            weapon: 'raider_cleaver', helmet: 'order_kabuto', armor: 'order_plate', hp: 280, def: 0.14, dmg: 1.15, speed: 0.9, build: { scale: 1.14, w: 13 }, eye: '#c4c8cc', accent: '#c4c8cc',
            taunt: 'Kneel. The Order does not ask twice.', tip: 'Every swing is slow and heavy. Dodge it, then strike the long recovery.' },
  // ---- Hollows ----
  hollow_shade: { name: 'Hollow Shade', title: 'Memory echo', type: 'regular', family: 'hollow', unit: 'regular', ai: 'regular',
            weapon: 'cutter_blade', helmet: 'hollow_shard', armor: 'hollow_rags', hp: 160, def: 0.03, dmg: 0.85, build: { scale: 0.98, w: 9.5 }, eye: '#ece6ff', accent: '#b9a8ff',
            taunt: '…it copies your breathing, then your stance…', tip: 'A Shade fights like the man it remembers. Block, then counter.' },
  // the Prologue's one fight (prologue.1): a Hollow Shade in look and family, but a tutorial foe: far lower damage and
  // some lower health, so a new player learns on it on every mode. Used only there (`tutorial`: not a unit type of its own).
  hollow_tutorial: { name: 'Hollow Shade', title: 'Memory echo', type: 'regular', family: 'hollow', unit: 'regular', ai: 'regular', tutorial: true,
            weapon: 'cutter_blade', helmet: 'hollow_shard', armor: 'hollow_rags', hp: 95, def: 0, dmg: 0.3, build: { scale: 0.98, w: 9.5 }, eye: '#ece6ff', accent: '#b9a8ff',
            taunt: '…it copies your breathing, then your stance…', tip: 'It copies you, then strikes. Block, then counter.' },
  hollow_flicker: { name: 'Hollow Flicker', title: 'Memory echo', type: 'regular', family: 'hollow', unit: 'agile', ai: 'agile',
            weapon: 'shadow_daggers', helmet: 'hollow_shard', armor: 'hollow_rags', hp: 140, def: 0.02, dmg: 0.8, speed: 1.18, build: { scale: 0.94, w: 8.5, legs: 1.06 }, eye: '#ece6ff', accent: '#b9a8ff',
            taunt: '…here… no, here…', tip: 'It darts in and out. Dash in when it lands from a jump.' },
  hollow_ward: { name: 'Hollow Ward', title: 'Memory echo', type: 'regular', family: 'hollow', unit: 'defensive', ai: 'defensive',
            weapon: 'temple_staff', helmet: 'hollow_shard', armor: 'hollow_rags', hp: 210, def: 0.08, dmg: 0.95, build: { scale: 1.04, w: 11 }, eye: '#ece6ff', accent: '#b9a8ff',
            taunt: '…this door stays shut… it always stayed shut…', tip: 'It remembers how to guard. Throw it, or break the guard with a charged kick.' },
  hollow_mimic: { name: 'Hollow Mimic', title: 'Memory echo', type: 'regular', family: 'hollow', unit: 'ranged', ai: 'ranged',
            weapon: 'hollow_crescents', helmet: 'hollow_shard', armor: 'hollow_rags', hp: 140, def: 0.02, dmg: 0.85, build: { scale: 0.96, w: 9 }, eye: '#ece6ff', accent: '#b9a8ff',
            taunt: '…throw… like you threw… then…', tip: 'It throws your own kunai back at you. Close the gap fast.' },
  hollow_husk: { name: 'Hollow Husk', title: 'Memory echo', type: 'regular', family: 'hollow', unit: 'heavy', ai: 'heavy',
            weapon: 'iron_fists', helmet: 'hollow_shard', armor: 'hollow_rags', hp: 270, def: 0.1, dmg: 1.15, speed: 0.88, build: { scale: 1.16, w: 14, arms: 1.08 }, eye: '#ece6ff', accent: '#b9a8ff',
            taunt: '…heavy… everything is so heavy…', tip: 'Slow and hard to stagger. Never trade blows; dodge and strike from behind.' },
  // the Witness's Hollow copies (core.witness, phase 2): cheap Hollow-styled silhouettes of Kage himself, summoned one
  // or two at a time (WITNESS_MOVES.hollowCopies). Not a regular unit: they belong to the Witness alone.
  hollow_kage: { name: 'Hollow Kage', title: 'A copy of you', type: 'echo', family: 'hollow', ai: 'agile',
            weapon: 'kagetsu', helmet: 'topknot', armor: 'hollow_rags', hp: 70, def: 0, dmg: 0.7, build: { scale: 1, w: 9.6, legs: 0.9, head: 1.05 }, eye: '#ece6ff', accent: '#b9a8ff',
            taunt: '...is this... how you stand?...', tip: 'A copy of you, thinner. Two clean cuts end it.' },
  // ---- story bosses ----
  // A story boss is fought in the boss format (see Logic.fightFormat): one round, one health bar, three phases.
  //   phases: [{ name, at, abilities, ...flags }]  `at` is the health fraction at which the phase opens (1, 0.66, 0.33
  //            by default; see Logic.bossPhases). Flags: berserk, aggressive, unblockable, poison, and per-ability
  //            tuning such as Raikon's secondWave (the delay, in seconds, of Thunder Swing's second wave).
  //   defeat:  how the beaten boss leaves (Logic.BOSS_DEFEATS): 'finisher' (full-screen finishing slash, the defeat
  //            scene, then a violet-ash dissolve; recorded as killed), 'escape' (he kneels, the defeat scene, then he
  //            leaves in smoke; recorded as escaped) or 'reabsorb' (the Witness: its light flows back into Kage).
  raikon: { name: 'Raikon', title: 'the Lightning Ascendant', type: 'boss', ai: 'boss', weapon: 'raikon_tachi', helmet: 'raijin_kabuto', armor: 'raikon_plate',
            hp: 640, def: 0.16, dmg: 1.1, speed: 0.9, build: { scale: 1.24, w: 13.5, arms: 1.04 }, eye: '#ff3b2f', accent: '#ff4a3c',
            flashEyes: 1, heavyArmor: 1, noGrab: 1, longScarf: '#191414', defeat: 'finisher',
            taunt: 'The man who was supposed to stay buried. The archive will not have you.', win: 'Stay buried this time, shadow.',
            tip: 'Thunder Swing sends red lightning along the ground: jump or dash through it. In his last phase a second wave follows late, so wait for it before you dodge again.',
            phases: [
              { name: 'The Storm Gathers', at: 1, abilities: ['thunderSwing', 'stormBreak'] },
              { name: 'Redline', at: 0.66, abilities: ['thunderSwing', 'stormBreak', 'redlineCounter'] },
              { name: 'Lightning Ascendant', at: 0.33, abilities: ['thunderSwing', 'stormBreak', 'redlineCounter'], secondWave: 0.7, aggressive: 1 }
            ] },
  // Akari, the Memory Blade (Act II boss, act2.boss): a former intelligence operative, calm and hard to read. A slim,
  // compact build with a half-mask and tied hair (helmet `akari_mask`), layered light armour with split cloth panels
  // (her Mei-En Garb), muted violet on charcoal (`body` is her flat fill), and Kagehira & Yūrei. Her moves: AKARI_MOVES.
  akari: { name: 'Akari', title: 'the Memory Blade', type: 'boss', ai: 'boss', weapon: 'akari_blades', helmet: 'akari_mask', armor: 'mei_en_garb',
            hp: 600, def: 0.1, dmg: 1.05, speed: 1.12, build: { scale: 1.0, w: 8.8, legs: 1.04, head: 0.98 }, eye: '#c9a8ff', accent: '#9b6bd6', body: '#1d1a22',
            flashEyes: 1, noGrab: 1, defeat: 'finisher',
            taunt: 'You walk through these memories like they belong to you.', win: 'Stay lost. It is kinder.',
            tip: 'A pale copy of her standing open is a False Opening: strike it and the real Akari punishes from behind, so turn as it vanishes. When she crosses her blades before her face, Petal Cross is coming: dash through it or away.',
            phases: [
              { name: 'Quiet Blade', at: 1, abilities: ['twinFang', 'smokeStep'] },
              { name: 'False Opening', at: 0.66, abilities: ['twinFang', 'smokeStep', 'blink', 'falseOpening'] },
              { name: 'Petal Cross', at: 0.33, abilities: ['twinFang', 'smokeStep', 'blink', 'falseOpening', 'petalCross'], aggressive: 1, chainBlink: 1 }
            ] },
  // Takashi, the Master's Flow (Act III boss, act3.boss, the Fortress of Silence): the father. Long tied-back hair
  // (`hair`, a cloth tail under the hat), his Kasa, layered dark robes with a waist guard and a small gold family crest
  // (the Shinsei Yoroi, look `shinsei`; wearing it here grants nothing), and a PLAIN blade (takashi_blade), never
  // Shinsen. Measured, grounded and economical: slower than Kage, heavier cuts, disciplined counters (Guard Return reads spam), and the
  // family form at his own heavy tempo (`form: 'takashi'`). His moves: TAKASHI_MOVES. He is not killed: he kneels and
  // escapes (`defeat: 'escape'`).
  takashi: { name: 'Takashi', title: 'the Master\'s Flow', type: 'boss', ai: 'boss', weapon: 'takashi_blade', helmet: 'kasa', armor: 'shinsei_yoroi',
            hp: 680, def: 0.14, dmg: 1.15, speed: 0.92, build: { scale: 1.1, w: 11, legs: 1.02 }, eye: '#ffe6a0', accent: '#e8c25c', body: '#16140f',
            outfit: 'gi', sash: '#4a3c22', hair: '#121110', flashEyes: 1, noGrab: 1, form: 'takashi', defeat: 'escape',
            taunt: 'You carry it like I taught you. Elbows in.', defeatLine: 'Enough. You have made your point.', win: 'Sleep, son. It is kinder.',
            tip: 'He reads repetition: strike the same way again and again and Guard Return turns it aside and punishes. Vary your attacks. When gold gathers on his blade in his last phase, Final Flow is coming: block the cuts, dodge the last.',
            phases: [
              { name: 'The Grounded Stance', at: 1, abilities: ['earthCleave', 'guardReturn'] },
              { name: 'The Father\'s Weight', at: 0.66, abilities: ['earthCleave', 'groundSmash', 'guardReturn'] },
              { name: 'The Master\'s Flow', at: 0.33, abilities: ['earthCleave', 'groundSmash', 'guardReturn', 'finalFlow'], aggressive: 1 }
            ] },
  // The Witness, Mirror of the Self (final boss, core.witness): Kage's original consciousness, separated and stored in
  // the Echo System. Tall, thin, almost weightless (it hovers); a broken white mask with ONE violet eye (helmet
  // `witness_mask`), long jagged hair and memory ribbons (cloth), the Kysmei Robe (look `kysmei`: flat shards drifting
  // round the body), a bright core in its chest (`core`), and Mugen no Ha (mugen_shards), whose shards re-form into
  // whatever weapon Kage holds (`mirrorWeapon`). Its outline flickers to Kage's own silhouette now and then (`witness`,
  // 20-fighter.js). Its moves: WITNESS_MOVES. It is not killed: its core shatters and its light flows back into Kage
  // (`defeat: 'reabsorb'`).
  witness: { name: 'The Witness', title: 'Mirror of the Self', type: 'boss', ai: 'boss', weapon: 'mugen_shards', helmet: 'witness_mask', armor: 'kysmei_robe',
            hp: 760, def: 0.12, dmg: 1.12, speed: 1.08, build: { scale: 1.3, w: 7.6, legs: 1.12, arms: 1.1, torso: 1.06, head: 0.94 }, eye: '#b48aff', accent: '#9b8cff', body: '#0d0b12',
            el: 'void', witness: 1, core: 1, mirrorWeapon: 1, flashEyes: 1, noGrab: 1, defeat: 'reabsorb',
            taunt: 'You stand the way I taught you. I remember teaching you.', defeatLine: 'Then take it back. All of it.', win: 'Sleep. I will remember for both of us.',
            tip: 'It copies the last string that hurt it, so change your attacks: land the same string three times and it is waiting for it. A dark line hanging in the air is a Void Slash: it cuts a moment later, so step off the line.',
            phases: [
              { name: 'The Mirror', at: 1, abilities: ['echoReplication', 'voidSlash'], mirror: 1 },
              { name: 'Memory Break', at: 0.66, abilities: ['echoReplication', 'voidSlash', 'memoryBreak', 'hollowCopies'] },
              { name: 'Identity Collapse', at: 0.33, abilities: ['echoReplication', 'voidSlash', 'collapseCleave', 'collapseSmash', 'collapseReturn'], mirror: 1, aggressive: 1 }
            ] },
  // ---- Act I sub-bosses (act1.sub1..4) ----
  // Each is fought in the boss format (one bar, one or two phases; the stage has `format: 'boss'`) and borrows a
  // REDUCED Raikon move (RAIKON_VARIANTS below), never the full Thunder Swing wave. Each wears the trophy it drops.
  // `lore` is the sub-boss's tie to Act I.
  kuroe: { name: 'Kuroe', title: 'the Ink Censor', type: 'sub', ai: 'defensive', weapon: 'temple_staff', helmet: 'sumi_eboshi', armor: 'robe',
            hp: 360, def: 0.08, dmg: 1, build: { scale: 1.06, w: 9.6, legs: 1.06, head: 0.96 }, eye: '#ece5d3', accent: '#c9a45c', defeat: 'finisher',
            lore: 'Chief censor of the Order\'s Archive Bureau in the outer districts. He blacked out the Silent War line by line, and the name Rem in every record he touched.',
            taunt: 'Your name was struck from the registry. I struck it myself. Lie down and stay unwritten.', defeatLine: 'The ink... never dries on that name...', win: 'Struck out. Again.',
            tip: 'Kuroe hides behind his staff. When he raises it crosswise in the Censure stance, hold your blade: wait it out or throw him.',
            phases: [
              { name: 'The Black Line', at: 1, abilities: ['censure'] },
              { name: 'Redacted', at: 0.5, abilities: ['censure'], aggressive: 1 }
            ] },
  garan: { name: 'Garan', title: 'the Stormbroken', type: 'sub', ai: 'heavy', weapon: 'iron_fists', helmet: 'oni', armor: 'ikazuchi_do',
            hp: 420, def: 0.1, dmg: 1.1, speed: 0.92, build: { scale: 1.18, w: 14, arms: 1.1 }, eye: '#ff6a52', accent: '#ff6a52', heavyArmor: 1, defeat: 'finisher',
            lore: 'A deserter from Raikon\'s thunder vanguard. Lightning struck him the day he broke ranks and never fully left; now he sells his fists to whoever holds the checkpoint road.',
            taunt: 'The captain\'s storm marked me for running. Let\'s see what it does to you.', defeatLine: 'Still... faster than the storm... aren\'t you...', win: 'Stay down. The storm does.',
            tip: 'Storm Fist: his gauntlets crackle red above his head before the slam. Dash away or behind him, then hit the long recovery.',
            phases: [
              { name: 'Thunderstruck', at: 1, abilities: ['stormFist'] },
              { name: 'Stormbroken', at: 0.5, abilities: ['stormFist', 'charge'] }
            ] },
  hisame: { name: 'Hisame', title: 'the Rain Courier', type: 'sub', ai: 'agile', weapon: 'mist_fans', helmet: 'hisame_zukin', armor: 'mist_shroud',
            hp: 330, def: 0.04, dmg: 0.95, speed: 1.16, build: { scale: 0.95, w: 8.8, legs: 1.07 }, eye: '#9fd4ff', accent: '#7fb8ff', defeat: 'finisher',
            lore: 'The fastest courier the Order ever had, who outran Raikon\'s storms across the rooftops. She carries the erasure orders to the registry, and cuts down anyone who reads them first.',
            taunt: 'You read the wall, didn\'t you. Couriers don\'t let readers reach the archive.', defeatLine: 'The rain... it never stopped... on that road...', win: 'Delivered.',
            tip: 'Lightning Cut: she drops low and her fans spark red, then she dashes straight through you. Block or jump it, then strike as she skids to a stop.',
            phases: [
              { name: 'Rainfall', at: 1, abilities: ['lightningCut'] },
              { name: 'Downpour', at: 0.5, abilities: ['lightningCut', 'smokeBomb'], berserk: 1 }
            ] },
  shiden: { name: 'Shiden', title: 'the Last Lieutenant', type: 'sub', ai: 'boss', weapon: 'vanguard_yari', helmet: 'sentinel_helm', armor: 'shiden_yoroi',
            hp: 460, def: 0.12, dmg: 1.05, build: { scale: 1.12, w: 11.4 }, eye: '#d6a8ff', accent: '#b07cff', flashEyes: 1, noGrab: 1, defeat: 'finisher',
            lore: 'Raikon\'s lieutenant in the thunder vanguard, woken by the Echo System beside his captain and posted on the last road to the archive. He remembers every order Raikon gave him, and none of his own.',
            taunt: 'The captain holds the archive door. I hold the road to it. Nobody passes us both.', defeatLine: 'Tell the captain... I held as long as I could...', win: 'The road holds.',
            tip: 'Vanguard Break drives his spear into the ground: step back from the shockwave. From his second phase he raises a guard; do not strike into it.',
            phases: [
              { name: 'Vanguard', at: 1, abilities: ['vanguardBreak'] },
              { name: 'Hold the Line', at: 0.5, abilities: ['vanguardBreak', 'vanguardGuard'], aggressive: 1 }
            ] },
  // ---- Act II sub-bosses (act2.sub1..4) ----
  // Each is fought in the boss format (one bar, one or two phases; the stage has `format: 'boss'`) and borrows a
  // REDUCED Akari move (AKARI_VARIANTS below: Twin Fang, Smoke Step or Blink), never False Opening or Petal Cross.
  // Each wears the trophy it drops. `lore` is the sub-boss's tie to Act II.
  tsugumi: { name: 'Tsugumi', title: 'the Memory Courier', type: 'sub', ai: 'agile', weapon: 'courier_kunai', helmet: 'hakobi_gasa', armor: 'hai_haori',
            hp: 340, def: 0.05, dmg: 0.95, speed: 1.14, build: { scale: 0.94, w: 8.6, legs: 1.08, head: 0.98 }, eye: '#d8ccff', accent: '#a98ad8', body: '#1c1a20', defeat: 'finisher',
            lore: 'A courier who carries stored memories, sealed in glass, from the Echo System into the City of Echoes so its streets can be rebuilt. She has delivered ten thousand lives and kept none of her own.',
            taunt: 'Every memory on this street passed through my hands. Yours too. Shall I take it back?', defeatLine: 'Undelivered... after all this way...', win: 'Delivered.',
            tip: 'Courier Step: smoke curls at her feet before she vanishes and steps out close by to cut. Watch for the second puff and block toward it.',
            phases: [
              { name: 'Delivery', at: 1, abilities: ['courierStep'] },
              { name: 'Return to Sender', at: 0.5, abilities: ['courierStep', 'lunge'], berserk: 1 }
            ] },
  sayo: { name: 'Sayo', title: 'the Quiet Hand', type: 'sub', ai: 'defensive', weapon: 'quiet_kodachi', helmet: 'kasumi_men', armor: 'shirabe_do',
            hp: 380, def: 0.08, dmg: 1, build: { scale: 1.0, w: 9.2, legs: 1.04 }, eye: '#e6dcff', accent: '#9b8cc9', body: '#1b1b22', defeat: 'finisher',
            lore: 'An operative of the old intelligence corps, trained under Akari. The City rebuilt her from her teacher\'s memory of her, so she runs Akari\'s drills at half the speed and with none of her patience.',
            taunt: 'You move like someone who was taught properly once. Then you forgot the lesson.', defeatLine: 'She said... I would never be quick enough...', win: 'Quiet, now.',
            tip: 'Half Fang: she draws her kodachi low and glints before two quick cuts. Block the pair, then punish the pause after.',
            phases: [
              { name: 'Quiet Hand', at: 1, abilities: ['halfFang'] },
              { name: 'Second Hand', at: 0.5, abilities: ['halfFang', 'counterStance'], aggressive: 1 }
            ] },
  utsushi: { name: 'Utsushi', title: 'the Borrowed Face', type: 'sub', family: 'hollow', ai: 'agile', weapon: 'echo_crescents', helmet: 'utsushi_men', armor: 'hollow_rags',
            hp: 350, def: 0.05, dmg: 0.95, speed: 1.1, build: { scale: 1.02, w: 9.4, legs: 1.04 }, eye: '#ffffff', accent: '#c9bdff', defeat: 'finisher',
            lore: 'A Hollow that copied an intelligence operative out of a stored memory and never gave the shape back. It has her stance, her mask and her blink, and none of her name.',
            taunt: '...I remember you... no... she remembers you... which of us is talking...', defeatLine: '...give it back... the face... was mine...', win: '...now I am you...',
            tip: 'Stolen Blink: a violet mark flares on the floor where it will land. Turn to the mark and strike as it arrives.',
            phases: [
              { name: 'Borrowed Face', at: 1, abilities: ['stolenBlink'] },
              { name: 'Borrowed Blade', at: 0.5, abilities: ['stolenBlink', 'stolenFang'], berserk: 1 }
            ] },
  kasane: { name: 'Kasane', title: 'the Ledger Warden', type: 'sub', ai: 'boss', weapon: 'ledger_kusari', helmet: 'hachigane', armor: 'kasane_haori',
            hp: 460, def: 0.12, dmg: 1.05, build: { scale: 1.1, w: 11 }, eye: '#e0ccff', accent: '#b48ae6', body: '#1e1b24', flashEyes: 1, noGrab: 1, defeat: 'finisher',
            lore: 'Akari\'s field partner in the intelligence corps, who kept the ledger of every memory stored in the City of Echoes. His echo still balances the books, and guards the last street before the one where she waits.',
            taunt: 'Every life in this city is entered in my ledger. Yours has two entries, and they disagree.', defeatLine: 'Strike the entry... she will know what it means...', win: 'Balanced.',
            tip: 'Ledger Fang: his sickle glints twice before two quick cuts. From his second phase he Ledger Steps through smoke; turn as he reappears.',
            phases: [
              { name: 'The Ledger', at: 1, abilities: ['ledgerFang'] },
              { name: 'Balanced Accounts', at: 0.5, abilities: ['ledgerFang', 'ledgerStep'], aggressive: 1 }
            ] },
  // ---- Act III sub-bosses (act3.sub1..4, the Fortress of Silence) ----
  // Each is fought in the boss format (one bar, two phases; the stage has `format: 'boss'`) and borrows a REDUCED
  // Takashi move (TAKASHI_VARIANTS above: Earth Cleave, Ground Smash or Guard Return), never Final Flow. Each wears the
  // trophy it drops. `lore` is the sub-boss's tie to Act III.
  gonryu: { name: 'Gonryu', title: 'the Gate Warden', type: 'sub', ai: 'heavy', weapon: 'gate_kanabo', helmet: 'tetsu_kabuto', armor: 'tetsumon_do',
            hp: 420, def: 0.12, dmg: 1.08, speed: 0.88, build: { scale: 1.22, w: 14.5, arms: 1.08 }, eye: '#e8d6a0', accent: '#c9a45c', body: '#23262b', heavyArmor: 1, noGrab: 1, defeat: 'finisher',
            lore: 'Warden of the Fortress of Silenc\' outer gate. He learned the grounded stance from an Order drill manual copied, page by page, from a master the Order says died in the war.',
            taunt: 'This gate has been shut for ten years. It opens for the Founder, and for nobody else.', defeatLine: 'The gate... was never meant... to hold you...', win: 'Shut. As ordered.',
            tip: 'Gate Smash: gold gathers on his raised kanabo before it comes down with a short shockwave. Dash back or jump it, then punish the opening.',
            phases: [
              { name: 'The Iron Gate', at: 1, abilities: ['gateSmash'] },
              { name: 'The Gate Holds', at: 0.5, abilities: ['gateSmash', 'charge'], aggressive: 1 }
            ] },
  shizune: { name: 'Shizune', title: 'the First Disciple', type: 'sub', ai: 'defensive', weapon: 'disciple_blade', helmet: 'deshi_tenugui', armor: 'kawa_do', outfit: 'gi', sash: '#3c3428',
            hp: 400, def: 0.09, dmg: 1.02, build: { scale: 0.98, w: 9, legs: 1.04 }, eye: '#f0e2b8', accent: '#d9c08a', body: '#1c1b18', form: 'disciple', flashEyes: 1, defeat: 'finisher',
            lore: 'Takash\' first student, long before his sons were born. When he left Hoshimura she followed him to the Fortress, and she still runs his form exactly as he taught it, a beat slower than he does.',
            taunt: 'Elbows in. Weight low. He taught you that too, did\' he? I was first.', defeatLine: 'Still... a beat too slow... he always said...', win: 'Again. From the stance.',
            tip: 'Still Return: she settles into a low guard. Strike it and she turns the blow aside and answers with a rising cut, so vary your attacks and wait the guard out.',
            phases: [
              { name: 'The First Lesson', at: 1, abilities: ['stillReturn'] },
              { name: 'The Grounded Stance', at: 0.5, abilities: ['stillReturn', 'lunge'], berserk: 1 }
            ] },
  moro: { name: 'Moro', title: 'the Conduit Warden', type: 'sub', ai: 'regular', weapon: 'conduit_naginata', helmet: 'oni_menpo', armor: 'kudamaki_do',
            hp: 430, def: 0.08, dmg: 1.05, speed: 1.04, build: { scale: 1.06, w: 10.5, legs: 1.06 }, eye: '#c9bdff', accent: '#9b7cff', body: '#1e1b26', defeat: 'finisher',
            lore: 'He tends the memory conduits that run through the Fortress walls and down into the Echo System. Ten years of listening to them have left him half a Hollow, and sure that one of the voices is not a recording.',
            taunt: 'Hear that? In the walls. He is talking again. He never stopped.', defeatLine: 'The voices... are getting quieter...', win: 'Into the conduit with you.',
            tip: 'Conduit Cleave: he drags his naginata low and gold lifts off the floor before the rising cut. Step back out of its reach, then close in on the opening.',
            phases: [
              { name: 'The Conduits Hum', at: 1, abilities: ['conduitCleave'] },
              { name: 'Live Current', at: 0.5, abilities: ['conduitCleave', 'teleport'], berserk: 1 }
            ] },
  soma: { name: 'Soma', title: 'the Silent Blademaster', type: 'sub', ai: 'boss', weapon: 'silent_odachi', helmet: 'mokushi_kabuto', armor: 'o_sode',
            hp: 520, def: 0.12, dmg: 1.1, build: { scale: 1.12, w: 11.5 }, eye: '#ffe6a0', accent: '#e8c25c', body: '#17161a', flashEyes: 1, noGrab: 1, defeat: 'finisher',
            lore: 'The Orde\' first sword, who fought beside Takashi in the Silent War. He swore the Orde\' oath of silence the night the war ended, and keeps the last stair below the Founde\' door.',
            taunt: '...', defeatLine: 'Tell him... I held the stair...', win: '...',
            tip: 'Severing Cleave: his odachi drags low and glints gold before one rising cut. From his second phase he guards with Severing Return; never repeat the same attack into it.',
            phases: [
              { name: 'The First Sword', at: 1, abilities: ['severingCleave'] },
              { name: 'The Oath of Silence', at: 0.5, abilities: ['severingCleave', 'severingReturn'], aggressive: 1 }
            ] },
  // ---- the Interlude ----
  // Young Rem (interlude.spar): a memory, gifted, impulsive and competitive. A smaller build in plain training clothes
  // with a purple sash and headband, a bokken, and the family form (FAMILY_FORM) at his own fast, fluid tempo (`form`).
  // `sash` colours his obi and its tails. He is never beaten: Takashi calls the spar first (Logic.fightFormat 'spar').
  young_rem: { name: 'Rem', title: 'Young Rem', type: 'sub', ai: 'agile', weapon: 'bokken', helmet: 'headband', armor: 'training', outfit: 'gi',
            hp: 300, dmg: 0.9, speed: 1.12, build: { scale: 0.84, w: 8.6, legs: 0.92, head: 1.12 }, eye: '#e6dcff', accent: '#a970ff', sash: '#9b5cf0',
            form: 'rem',
            taunt: 'Ready, big brother? Try to keep up this time.', defeatLine: 'Hey! That one doesn’t count!', win: 'Again! Again!',
            tip: 'Rem runs the family form faster than you. Block the rising cut, then punish his landing.' },
  // ---- the Core's echoes (core.echo1..4) ----
  // Corrupted memories the Core pulls out of Kage's journey: each is drawn in the Hollow style (family `hollow`: a
  // flickering violet fill, glitch frames, a dissolve into memory ash) with its original's silhouette (`echoOf`: the same
  // helmet and armour drawings, a violet copy of the blade), and fights in the boss format (one bar, one or two phases)
  // with reduced or warped versions of the original's moves (CORE_ECHO_MOVES). They are memories: beaten, they come
  // apart into ash, and they drop gems, never gear.
  hollow_raikon: { name: 'Hollow Raikon', title: 'Echo of the Lightning Ascendant', type: 'sub', family: 'hollow', echoOf: 'raikon', ai: 'boss', weapon: 'echo_tachi', helmet: 'raijin_kabuto', armor: 'raikon_plate',
            hp: 480, def: 0.12, dmg: 1.0, speed: 0.92, build: { scale: 1.2, w: 13, arms: 1.04 }, eye: '#ffffff', accent: ECHO_ACCENT,
            flashEyes: 1, heavyArmor: 1, noGrab: 1, longScarf: '#2a2148', defeat: 'finisher',
            taunt: '...the man who... was supposed to... stay buried... buried... buried...', defeatLine: '...the archive... was never... mine to guard...', win: '...stay... buried...',
            tip: 'A violet wave runs along the floor after Hollow Thunder: jump it or dash through it. It never sends a second one.',
            phases: [
              { name: 'Static', at: 1, abilities: ['hollowThunder', 'hollowBreak'] },
              { name: 'Dead Storm', at: 0.5, abilities: ['hollowThunder', 'hollowBreak'], aggressive: 1 }
            ] },
  hollow_akari: { name: 'Hollow Akari', title: 'Echo of the Memory Blade', type: 'sub', family: 'hollow', echoOf: 'akari', ai: 'boss', weapon: 'echo_fangs', helmet: 'akari_mask', armor: 'mei_en_garb',
            hp: 440, def: 0.08, dmg: 0.98, speed: 1.08, build: { scale: 1.0, w: 8.8, legs: 1.04, head: 0.98 }, eye: '#ffffff', accent: ECHO_ACCENT,
            flashEyes: 1, noGrab: 1, defeat: 'finisher',
            taunt: '...you walk through... these memories... like they belong... to you...', defeatLine: '...he asked me to... take it from you... I remember why now...', win: '...stay lost...',
            tip: 'Smoke curls at her feet before Hollow Step. Once a fight a pale copy of her stands open: strike it and turn, the real echo comes from behind.',
            phases: [
              { name: 'Quiet Static', at: 1, abilities: ['hollowFang', 'hollowStep'] },
              { name: 'False Memory', at: 0.5, abilities: ['hollowFang', 'hollowStep', 'hollowOpening'], aggressive: 1 }
            ] },
  hollow_takashi: { name: 'Hollow Takashi', title: 'Echo of the Master\'s Flow', type: 'sub', family: 'hollow', echoOf: 'takashi', ai: 'boss', weapon: 'echo_nameless', helmet: 'kasa', armor: 'shinsei_yoroi',
            hp: 500, def: 0.1, dmg: 1.02, speed: 0.92, build: { scale: 1.1, w: 11, legs: 1.02 }, eye: '#ffffff', accent: ECHO_ACCENT,
            outfit: 'gi', sash: '#4a3c7a', hair: '#2a2148', flashEyes: 1, noGrab: 1, form: 'takashi', defeat: 'finisher',
            taunt: '...elbows in... elbows... in... I taught you... I taught...', defeatLine: '...not the boy... I taught... the one... I could not...', win: '...again... from the stance...',
            tip: 'It still reads repetition: vary your attacks or Hollow Return turns them aside. In its second phase a broken Final Flow gathers: block the first two cuts, dodge the last.',
            phases: [
              { name: 'Grounded Static', at: 1, abilities: ['hollowCleave', 'hollowReturn'] },
              { name: 'Broken Flow', at: 0.5, abilities: ['hollowCleave', 'hollowReturn', 'hollowFlow'], aggressive: 1 }
            ] },
  // Hollow Rem, last: a fake-out just before the real Rem appears. Grown up (an adult build, not the boy from the yard),
  // in a worn dark travel coat (`travel_coat`) with his purple accent (`sash`), violet-corrupted, running Rem's own fast,
  // flowing version of the family form (`form: 'rem'`, the style young Rem sparred with in the Interlude).
  hollow_rem: { name: 'Hollow Rem', title: 'Echo of a brother', type: 'sub', family: 'hollow', echoOf: 'rem', ai: 'agile', weapon: 'echo_rem_blade', helmet: 'headband', armor: 'travel_coat', outfit: 'gi',
            hp: 460, def: 0.06, dmg: 1.0, speed: 1.14, build: { scale: 1.02, w: 9.4, legs: 1.04 }, eye: '#ffffff', accent: '#a970ff', sash: '#9b5cf0',
            form: 'rem', defeat: 'finisher',
            taunt: '...ready, big brother?... try to... keep up... this time...', defeatLine: '...that one... doesn\'t count...', win: '...again... again...',
            tip: 'It runs Rem\'s family form, faster than yours: block the rising cut, then punish the landing after the second aerial.',
            phases: [
              { name: 'The Brother\'s Form', at: 1, abilities: [] },
              { name: 'Corrupted Echo', at: 0.5, abilities: ['lunge'], berserk: 1 }
            ] },
  // ---- placeholder sub-boss and boss rigs ----
  echo_sentinel: { name: 'Echo Sentinel', title: 'Placeholder sub-boss', type: 'sub', ai: 'agile', weapon: 'hollow_crescents', helmet: 'oni', armor: 'cloak', hp: 340, dmg: 1.05, speed: 1.15, build: { scale: 1.04, w: 10 }, eye: '#9b8cff', accent: '#9b8cff',
            taunt: 'This memory is guarded. Prove you belong in it.', defeatLine: 'The memory… lets you pass…', win: 'Forget this place.',
            tip: 'Dodge the lunge with Dash, then punish the long recovery.', abilities: ['lunge', 'teleport'] },
  echo_warden: { name: 'Echo Warden', title: 'Placeholder boss', type: 'boss', ai: 'boss', weapon: 'cutter_blade', helmet: 'oni', armor: 'tyrant', hp: 640, dmg: 1.1, speed: 1.1, build: { scale: 1.16, w: 12 }, eye: '#9b8cff', accent: '#9b8cff', flashEyes: 1,
            taunt: 'You were supposed to stay buried.', defeatLine: 'The echo… breaks…', win: 'Sleep, shadow. Remember nothing.',
            tip: 'Its eyes flash right before it strikes. Block on the flash, punish after.',
            phases: [
              { name: 'First Echo', abilities: ['lunge', 'moonDash'] },
              { name: 'Fractured Echo', abilities: ['teleport', 'clones', 'moonDash'] },
              { name: 'Last Echo', abilities: ['moonDash', 'groundSlam', 'lunge'], berserk: 1 }
            ] }
};
for (const id in ENEMIES) ENEMIES[id].id = id;

/* ---------------- Raikon's moves and their reduced versions ----------------
   RAIKON_ABILITIES are Raikon's own abilities (BOSS_ABILITIES in 40-ai.js). Act I's sub-bosses fight with reduced
   versions of them: each RAIKON_VARIANTS entry runs its `base` ability's code with these parameters (40-ai.js registers
   them as BOSS_ABILITIES next to Raikon's), so no move is written twice. Logic.raikonMove(id) answers what a move is.
     cd, range, chance   the ability's cooldown (s), distance band and pick chance (default: the base's)
     label               the call-out shown as it winds up
     windup              wind-up as a fraction of the difficulty mode's windup (Raikon: Thunder Swing 0.66, Storm Break
                         0.58); the reduced moves wind up longer, so they telegraph more
     dmg                 damage multiplier on the base's strike
     thunderSwing:   wave (false = no travelling ground wave, only the cut), reach (arc width), dash (forward speed of the cut)
     stormBreak:     shock (shockwave damage multiplier, Raikon 0.9; 0 = none), shockLife (its reach), reach (strike width)
     redlineCounter: stance (how long the guard is held, Raikon 1 s), punish (delay before the punish cut), unb (1 = the
                     punish breaks guards, as Raikon's does) */
const RAIKON_ABILITIES = ['thunderSwing', 'stormBreak', 'redlineCounter'];
const RAIKON_VARIANTS = {
  // Kuroe: a brief, weaker Redline Counter whose punish can be blocked
  censure:        { base: 'redlineCounter', label: 'CENSURE', cd: 7, range: [60, 260], chance: 0.5, stance: 0.7, punish: 0.14, dmg: 0.6, unb: 0 },
  // Garan: a short Storm Break with the gauntlets: a slow wind-up and a stubby shockwave
  stormFist:      { base: 'stormBreak', label: 'STORM FIST', cd: 5.6, range: [0, 240], chance: 0.6, windup: 0.78, dmg: 0.65, shock: 0.5, shockLife: 0.4, reach: 170 },
  // Hisame: Thunder Swing cut down to its first stroke, a short dashing lightning cut with no ground wave
  lightningCut:   { base: 'thunderSwing', label: 'LIGHTNING CUT', cd: 5, range: [120, 420], chance: 0.65, wave: false, windup: 0.56, dmg: 0.6, reach: 160, dash: 900 },
  // Shiden: a lighter Storm Break, and in his second phase a short guard whose punish can be blocked
  vanguardBreak:  { base: 'stormBreak', label: 'VANGUARD BREAK', cd: 5, range: [0, 300], chance: 0.6, windup: 0.68, dmg: 0.8, shock: 0.7, shockLife: 0.5 },
  vanguardGuard:  { base: 'redlineCounter', label: 'HOLD THE LINE', cd: 7.5, range: [60, 280], chance: 0.5, stance: 0.8, dmg: 0.75, unb: 0 }
};

/* ---------------- Akari's moves ----------------
   Akari's abilities. BOSS_ABILITIES in 40-ai.js read their numbers from here (and take an optional override object), so
   Act II's sub-bosses can later run reduced versions, the way Act I's reuse Raikon's. Logic.akariMove(id) answers them.
     label              the call-out as it winds up        cd, range, chance   cooldown (s), distance band, pick chance
     windup             the tell, as a fraction of the difficulty mode's windup (Logic.aiTuning); every move has one
     dmg                damage of the cut (twinFang: [Kagehira's opener, Yūrei's punisher])
     smoke              smokeStep's puff { life (s), radius }: compact, gone before it can hide anyone
     dist               how far she repositions (smokeStep, blink; phase flag chainBlink blinks twice)
     afterimages, opacity, hold   falseOpening: the decoy's offset silhouettes, its opacity, how long it stands
     dash, reach        forward speed of twinFang / petalCross; petalCross's cut width */
const AKARI_ABILITIES = ['twinFang', 'smokeStep', 'blink', 'falseOpening', 'petalCross'];
const AKARI_MOVES = {
  twinFang:     { label: 'TWIN FANG', cd: 3.2, range: [0, 300], chance: 0.7, windup: 0.42, dmg: [7, 12], dash: 520 },
  smokeStep:    { label: 'SMOKE STEP', cd: 5.5, range: [120, 700], chance: 0.55, windup: 0.36, dmg: 10, dist: 150, smoke: { life: 0.5, radius: 46 } },
  blink:        { label: 'BLINK', cd: 4.2, range: [80, 800], chance: 0.55, windup: 0.32, dist: 230 },
  falseOpening: { label: 'FALSE OPENING', cd: 9, range: [100, 520], chance: 0.6, windup: 0.4, dmg: 15, afterimages: 2, opacity: 0.5, hold: 1.8 },
  petalCross:   { label: 'PETAL CROSS', cd: 7, range: [120, 520], chance: 0.7, windup: 0.72, dmg: 24, dash: 1100, reach: 190 }
};

/* Act II's sub-bosses fight with reduced versions of Akari's moves: each AKARI_VARIANTS entry runs its `base` ability's
   code (40-ai.js registers them as BOSS_ABILITIES next to hers) with these numbers merged over AKARI_MOVES[base]. A
   reduced move winds up at least as long as Akari's, hits no harder and repositions no further; only Twin Fang, Smoke
   Step and Blink are borrowed, never False Opening or Petal Cross. Logic.akariDerived(id) answers what a move is. */
const AKARI_VARIANTS = {
  // Tsugumi: a slower Smoke Step with a smaller puff and a shorter step
  courierStep: { base: 'smokeStep', label: 'COURIER STEP', cd: 6.5, range: [140, 600], chance: 0.5, windup: 0.5, dmg: 7, dist: 120, smoke: { life: 0.4, radius: 38 } },
  // Sayo: Twin Fang with one kodachi, a long tell and light cuts
  halfFang:    { base: 'twinFang', label: 'HALF FANG', cd: 4, range: [0, 260], chance: 0.6, windup: 0.58, dmg: [5, 8], dash: 400 },
  // Utsushi: one short Blink (never chained), and in its second phase a copied Twin Fang
  stolenBlink: { base: 'blink', label: 'STOLEN BLINK', cd: 5.5, range: [120, 700], chance: 0.5, windup: 0.46, dist: 170 },
  stolenFang:  { base: 'twinFang', label: 'STOLEN FANG', cd: 4.6, range: [0, 260], chance: 0.55, windup: 0.52, dmg: [5, 9], dash: 440 },
  // Kasane: a sickle Twin Fang, then from his second phase a short Smoke Step
  ledgerFang:  { base: 'twinFang', label: 'LEDGER FANG', cd: 3.8, range: [0, 280], chance: 0.6, windup: 0.5, dmg: [6, 10], dash: 460 },
  ledgerStep:  { base: 'smokeStep', label: 'LEDGER STEP', cd: 6, range: [140, 640], chance: 0.5, windup: 0.44, dmg: 8, dist: 140, smoke: { life: 0.45, radius: 42 } }
};

/* ---------------- Final Flow ----------------
   Shinsen's rage art and, later, one of Takashi's boss abilities (SAN-40): one table, one runner (finalFlow() in
   30-combat.js, called by SPECIAL_IMPL.finalFlow for the player and BOSS_ABILITIES.finalFlow for a boss).
   A short gathering stance (`windup` seconds; a boss scales it by its difficulty windup), then the `cuts` in order:
     dir     rising | overhead | diagonal | horizontal (only the last, decisive cut is horizontal)
     at      seconds after the wind-up ends that the cut lands     pose  the MOVES id whose wind (w) and strike (s) it swings
     dmg     base damage (x weaponMul for the player, x dmgMul for a boss, x the table's `dmg`)   kb / up  knockback, lift
     cross   the fighter steps through to the target's other side before this cut (the sequence changes direction)
     finisher  the one horizontal finishing cut: knockdown, an impact frame, a gold finisher slash and a `freeze`
               (hit-stop seconds) followed by `slow` seconds of slow motion
   `el` is the trail element (gold), `reach` the hit box length, `stick` how close the fighter keeps to the target
   between cuts, and `unb` makes every cut unblockable (the player's rage art; a boss passes unb: 0 and keeps only the
   finisher unblockable with `unbFinisher`). Logic.finalFlow(o) returns a copy with `o` merged over the top level. */
const FINAL_FLOW = {
  name: 'Final Flow', label: 'FINAL FLOW', el: 'gold', windup: 0.24, dmg: 1, reach: 190, stick: 105, unb: 1, unbFinisher: 1,
  cuts: [
    { dir: 'rising',     at: 0.06, pose: 'sh2', dmg: 3,  kb: 40,  up: -240 },
    { dir: 'overhead',   at: 0.24, pose: 'sh1', dmg: 3,  kb: 40,  up: 80 },
    { dir: 'diagonal',   at: 0.42, pose: 'shc', dmg: 3,  kb: 40,  up: -120, cross: 1 },
    { dir: 'diagonal',   at: 0.60, pose: 'k1',  dmg: 4,  kb: 60,  up: -160 },
    { dir: 'horizontal', at: 0.98, pose: 'sh3', dmg: 12, kb: 780, up: -360, finisher: true, freeze: 0.22, slow: 0.7 }
  ]
};

/* ---------------- Takashi's moves ----------------
   Takashi's abilities (BOSS_ABILITIES in 40-ai.js read their numbers here; each takes an optional override object so
   Act III's sub-bosses can run lighter versions). Logic.takashiMove(id) answers them.
     label, cd, range, chance   call-out, cooldown (s), distance band, pick chance
     windup     the tell, a fraction of the difficulty mode's windup (Logic.aiTuning); guardReturn: the beat between the
                turned-aside blow and the rising cut; finalFlow: the gathering stance in seconds (before the mode's windup)
     dmg        damage of the cut (finalFlow: the multiplier on FINAL_FLOW's cuts; the old boss default was 0.8)
     earthCleave: dash (forward speed of the rising cut), reach    groundSmash: shock / shockLife (the short shockwave), reach
     guardReturn: stance (how long the guard is held), unb (1 = the rising cut breaks guards)
   Guard Return reads predictability: Logic.readsPattern(history, moveId) with PATTERN_READ (the same move `streak`
   times running, or at least `share` of the `last` moves once `min` of them are known). */
const TAKASHI_ABILITIES = ['earthCleave', 'groundSmash', 'guardReturn', 'finalFlow'];
const TAKASHI_MOVES = {
  earthCleave: { label: 'EARTH CLEAVE', cd: 4.6, range: [0, 320], chance: 0.65, windup: 0.62, dmg: 18, dash: 620, reach: 200 },
  groundSmash: { label: 'GROUND SMASH', cd: 5.4, range: [0, 300], chance: 0.6, windup: 0.66, dmg: 20, shock: 0.8, shockLife: 0.45, reach: 190 },
  guardReturn: { label: 'GUARD RETURN', cd: 2.6, range: [0, 300], chance: 0.8, windup: 0.14, stance: 0.9, dmg: 18, unb: 1 },
  finalFlow:   { label: 'FINAL FLOW', cd: 10, range: [0, 340], chance: 0.65, windup: 0.62, dmg: 1.5, unb: 0, unbFinisher: 1 }
};
const PATTERN_READ = { last: 8, min: 4, share: 0.5, streak: 3 };

/* Act III's sub-bosses fight with reduced versions of Takashi's moves: each TAKASHI_VARIANTS entry runs its `base`
   ability's code (40-ai.js registers them as BOSS_ABILITIES next to his) with these numbers merged over
   TAKASHI_MOVES[base]. A reduced move winds up longer than his, hits lighter, steps in no further and its shockwave
   is smaller; a reduced Guard Return holds a shorter guard and its rising cut can be blocked (unb 0). Only Earth Cleave,
   Ground Smash and Guard Return are borrowed, never Final Flow. Logic.takashiDerived(id) answers what a move is. */
const TAKASHI_VARIANTS = {
  // Gonryu: the gate warden's kanabo brought down in a slow, two-handed Ground Smash with a stubby shockwave
  gateSmash:      { base: 'groundSmash', label: 'GATE SMASH', cd: 6, range: [0, 260], chance: 0.6, windup: 0.84, dmg: 13, shock: 0.45, shockLife: 0.32, reach: 170 },
  // Shizune: Guard Return as his first disciple learned it: a shorter guard, a longer beat before the cut, blockable
  stillReturn:    { base: 'guardReturn', label: 'STILL RETURN', cd: 3.4, range: [0, 280], chance: 0.7, windup: 0.26, stance: 0.75, dmg: 11, unb: 0 },
  // Moro: Earth Cleave dragged along the floor with a naginata, slow to gather and short in its step
  conduitCleave:  { base: 'earthCleave', label: 'CONDUIT CLEAVE', cd: 5.4, range: [0, 300], chance: 0.6, windup: 0.8, dmg: 11, dash: 460, reach: 180 },
  // Soma: the Order's first sword, Earth Cleave, then from his second phase a Guard Return of his own
  severingCleave: { base: 'earthCleave', label: 'SEVERING CLEAVE', cd: 5, range: [0, 320], chance: 0.62, windup: 0.72, dmg: 13, dash: 540, reach: 190 },
  severingReturn: { base: 'guardReturn', label: 'SEVERING RETURN', cd: 3.2, range: [0, 290], chance: 0.7, windup: 0.22, stance: 0.8, dmg: 13, unb: 0 }
};

/* ---------------- The Witness's moves ----------------
   BOSS_ABILITIES in 40-ai.js read these; Logic.witnessMove(id) answers them. Every tell is `windup x
   Logic.aiTuning(...).windup` seconds (scaled by the difficulty mode), with the violet eye flaring white.
     echoReplication  plays back the player's last SUCCESSFUL string (Logic.echoReplication over the fight's hit log);
                      `speed` the playback tempo, `punishMul` its damage once the player has spammed it (ECHO_REPLICATION)
     voidSlash        a cut from far away: a dark afterimage line hangs across the floor for `delay` seconds, then cuts
                      (`len` long, `dmg`); jump it, dash through it or step off it
     memoryBreak      the arena becomes a remembered place (MEMORY_BREAK.envs, in turn) for `dur` seconds, with a flat
                      glitch in and out (`glitch` seconds)
     hollowCopies     summons `count` Hollow copies of Kage (`enemy`), never more than `max` alive
   WITNESS_CORRUPT are Takashi's moves turned corrupt in Identity Collapse: each runs his ability's code with its numbers
   merged over TAKASHI_MOVES[base], a violet `tint` instead of his gold, and glitch frames (`glitch`). */
const WITNESS_ABILITIES = ['echoReplication', 'voidSlash', 'memoryBreak', 'hollowCopies'];
const WITNESS_MOVES = {
  echoReplication: { label: 'ECHO REPLICATION', cd: 6.5, range: [0, 420], chance: 0.7, windup: 0.42, speed: 1.08, punishMul: 1.35 },
  voidSlash:       { label: 'VOID SLASH', cd: 5.2, range: [140, 900], chance: 0.6, windup: 0.5, delay: 0.62, len: 620, dmg: 16 },
  memoryBreak:     { label: 'MEMORY BREAK', cd: 11, range: [0, 1200], chance: 0.8, windup: 0.5, dur: 4.2, glitch: 0.35 },
  hollowCopies:    { label: 'HOLLOW COPIES', cd: 12, range: [0, 1200], chance: 0.7, windup: 0.6, count: 2, max: 2, enemy: 'hollow_kage' }
};
const WITNESS_TINT = '#a77bff';
const WITNESS_CORRUPT = {
  collapseCleave: { base: 'earthCleave', label: 'COLLAPSE CLEAVE', tint: WITNESS_TINT, glitch: 1, cd: 4.8, windup: 0.56, dmg: 17 },
  collapseSmash:  { base: 'groundSmash', label: 'COLLAPSE SMASH', tint: WITNESS_TINT, glitch: 1, cd: 5.6, windup: 0.6, dmg: 18 },
  collapseReturn: { base: 'guardReturn', label: 'COLLAPSE RETURN', tint: WITNESS_TINT, glitch: 1, cd: 2.8, windup: 0.16, dmg: 16 }
};
/* ---------------- The Core's echoes ----------------
   The four echo fights (core.echo1..4) are corrupted Hollow copies of foes from Kage's journey. Each CORE_ECHO_MOVES
   entry runs its original's own ability code (`base`, from `of`'s kit; 40-ai.js registers them as BOSS_ABILITIES next
   to the originals') with these numbers merged over the original's (AKARI_MOVES / TAKASHI_MOVES; Raikon's numbers live
   in his ability code, so his echo's are written out here in full), a violet `tint` for the original's red / violet /
   gold accents and glitch frames (`glitch`). They are REDUCED (longer tells, lighter hits) or WARPED (Hollow Takashi's
   Final Flow is a broken three-cut fragment). Logic.echoMove(id) answers them.
     cd 600   once a fight (Hollow Akari's single False Opening)
     cuts, el finalFlow only: the cut list and trail element handed to the shared Final Flow runner (30-combat.js) */
const ECHO_TINT = '#b48aff';
const CORE_ECHO_MOVES = {
  // Hollow Raikon: Thunder Swing with its wave still running along the floor, slower and lighter, never a second wave;
  // and a lighter Storm Break with a short shockwave. No Redline Counter.
  hollowThunder: { of: 'raikon', base: 'thunderSwing', label: 'HOLLOW THUNDER', tint: ECHO_TINT, glitch: 1, cd: 6, range: [140, 700], chance: 0.7, windup: 0.8, dmg: 0.75, reach: 190 },
  hollowBreak:   { of: 'raikon', base: 'stormBreak', label: 'HOLLOW BREAK', tint: ECHO_TINT, glitch: 1, cd: 5.2, range: [0, 300], chance: 0.6, windup: 0.72, dmg: 0.75, shock: 0.6, shockLife: 0.45, reach: 190 },
  // Hollow Akari: Smoke Step and Twin Fang at reduced strength, and one False Opening a fight, with a single afterimage
  hollowStep:    { of: 'akari', base: 'smokeStep', label: 'HOLLOW STEP', tint: ECHO_TINT, glitch: 1, cd: 6, range: [140, 640], chance: 0.55, windup: 0.46, dmg: 8, dist: 140, smoke: { life: 0.45, radius: 42 } },
  hollowFang:    { of: 'akari', base: 'twinFang', label: 'HOLLOW FANG', tint: ECHO_TINT, glitch: 1, cd: 3.8, range: [0, 280], chance: 0.65, windup: 0.5, dmg: [6, 10], dash: 460 },
  hollowOpening: { of: 'akari', base: 'falseOpening', label: 'HOLLOW OPENING', tint: ECHO_TINT, glitch: 1, cd: 600, range: [100, 480], chance: 0.7, windup: 0.5, dmg: 11, afterimages: 1, opacity: 0.4, hold: 1.5 },
  // Hollow Takashi: Earth Cleave and a blockable Guard Return, and in his second phase a broken Final Flow: three cuts
  // (rising, overhead, the horizontal finisher) instead of five, violet, lighter and slower to gather
  hollowCleave:  { of: 'takashi', base: 'earthCleave', label: 'HOLLOW CLEAVE', tint: ECHO_TINT, glitch: 1, cd: 5, range: [0, 320], chance: 0.62, windup: 0.74, dmg: 14, dash: 540, reach: 190 },
  hollowReturn:  { of: 'takashi', base: 'guardReturn', label: 'HOLLOW RETURN', tint: ECHO_TINT, glitch: 1, cd: 3.2, range: [0, 290], chance: 0.7, windup: 0.22, stance: 0.8, dmg: 13, unb: 0 },
  hollowFlow:    { of: 'takashi', base: 'finalFlow', label: 'BROKEN FLOW', tint: ECHO_TINT, glitch: 1, cd: 14, range: [0, 320], chance: 0.6, windup: 0.86, dmg: 1, unb: 0, unbFinisher: 1, el: 'void',
    cuts: [
      { dir: 'rising',     at: 0.08, pose: 'sh2', dmg: 3,  kb: 40,  up: -240 },
      { dir: 'overhead',   at: 0.30, pose: 'sh1', dmg: 3,  kb: 40,  up: 80 },
      { dir: 'horizontal', at: 0.72, pose: 'sh3', dmg: 10, kb: 700, up: -320, finisher: true, freeze: 0.16, slow: 0.45 }
    ] }
};
/* Echo Replication's rule (Logic.echoReplication): the player's moves `gap` seconds apart or less are one string; the
   Witness copies the LATEST string that landed on it, its last `max` copyable moves (never throws or grabs). The same
   landed string `spam` times running is spam: it is read and punished. */
const ECHO_REPLICATION = { gap: 0.7, max: 5, spam: 3 };
/* Echo Replication as the PLAYER's rage art (Mugen no Ha, Logic.echoArt): a phantom memory-shard copy of Kage appears
   beside the foe after `windup` seconds and replays his latest landed string (grounded strikes only) at `dmgMul`, its
   last blow the finisher at `finisherMul`; with nothing landed yet it replays the blade's own string. `life` caps how
   long the phantom stays. */
const ECHO_ART = { windup: 0.4, dmgMul: 1.3, finisherMul: 2, life: 4.5, kinds: ['weapon', 'punch', 'kick'] };
// Memory Break's remembered places, in the order the arena shifts through them
const MEMORY_BREAK = { envs: ['hoshimura', 'echoes', 'fortress', 'yard'],
  names: { hoshimura: 'Hoshimura, before the fire', echoes: 'The City of Echoes', fortress: 'The Fortress of Silence', yard: 'The training yard' } };

/* ---------------- The family form ----------------
   Takashi's sword grammar, shared by Kage, Rem and Takashi (the spec's "shared attack language"): a grounded opening
   stance, a short dash, a rising cut, an aerial follow-up, a controlled landing, then a finishing horizontal flow.
   `pattern` is the form once, in order; `act` says how a step is performed:
     stance  stand in guard for the style's `hold` seconds        dash   a short forward dash
     move    a grounded weapon move (`move` = a MOVES id)          air    jump (a double jump for later aerials) and the air cut
     land    wait for the controlled landing
   `styles` say how each fighter runs it: `gap` seconds between steps, `hold` for the opening stance, `aerials` (how many
   aerial follow-ups), `flow` (the finishing moves, in order) and `tempo` (a multiplier on each cut's start-up and recovery).
   Logic.familyForm(style) expands a style into its step list; the AI (AIController.startForm, 40-ai.js) performs it. The
   player's bokken string (k2 -> k3, air ka) is the same grammar under the player's own hands. Later fights reuse it:
   Hollow Rem (SAN-43) runs 'rem'; Takashi (SAN-40) adds his own heavier style here. */
const FAMILY_FORM = {
  name: 'Tachibana form',
  pattern: [
    { step: 'stance', act: 'stance' },
    { step: 'dash', act: 'dash' },
    { step: 'rise', act: 'move', move: 'k2' },
    { step: 'aerial', act: 'air', move: 'ka' },
    { step: 'landing', act: 'land' },
    { step: 'flow', act: 'move', move: 'k3' }
  ],
  styles: {
    // Kage: tight and defensive, one aerial, one clean finishing cut, a measured pause between steps
    kage: { gap: 0.2, hold: 0.45, aerials: 1, flow: ['k3'], tempo: 1 },
    // Rem: fast and fluid, barely a pause, a second aerial off the double jump, and a longer finishing flow
    rem:  { gap: 0.04, hold: 0.12, aerials: 2, flow: ['k1', 'k3'], tempo: 0.72 },
    // Takashi: the root of both: a long grounded stance, a measured pause, one aerial, one heavy finishing flow and
    // slower, heavier cuts; `moves` swaps his Shinsen-style cuts into the steps (Shinsen's `family` map)
    takashi: { gap: 0.3, hold: 0.75, aerials: 1, flow: ['sh3'], tempo: 1.12, moves: { rise: 'sh2', aerial: 'sha' } },
    // Shizune, his first disciple (act3.sub2): his form exactly as he taught it, a beat slower and with no aerial
    disciple: { gap: 0.36, hold: 0.6, aerials: 0, flow: ['k3'], tempo: 1.18 }
  }
};

/* ---------------- The spar (Interlude) ----------------
   interlude.spar is fought in the spar format (Logic.fightFormat): one round on a `timer`, and no KO. When either
   brother's health drops to `interruptAt` (a fraction) or the clock runs out, Takashi calls them in and the stage
   completes with no winner (outcome 'interrupted'). `kage` is young Kage: fixed stats and look, none of the player's
   gear (Logic.youngKage). The arena is Takashi's training yard (env 'yard') under a memory filter. */
const SPAR = {
  timer: 45, interruptAt: 0.3,
  kage: { hp: 260, weapon: 'bokken', helmet: 'headband', armor: 'training', build: { scale: 0.86, w: 8.8, legs: 0.9, head: 1.12 } }
};

/* ---------------- Campaign map ----------------
   Chapters in story order, each with its stages in play order. Stage ids are stable strings
   ("act1.sub2", "core.witness") and saves record clears by id, so stages can be added, renamed or
   reordered later without breaking saves. Every stage has:
     id, kind (stretch | subboss | boss | spar | echo | scene), name (what the map shows),
     enemy            the temporary arena foe (ENEMIES id) for combat stages; scene stages have none,
     foe / foeTitle   the story opponent shown instead of the placeholder's name (bosses, sub-bosses, echoes, the spar),
     chapter / pos    filled in below (owning chapter id, index inside it).
     reward           optional gear granted when the stage is cleared: { weapons: [ids], helmets: [ids], armors: [ids] }.
                      Each item is given once (see Logic.grantStageReward); items flagged ngOnly only drop in New Game+.
                      `gems: n` pays n gems on the stage's first clear (Logic.stageRewardGems; the Core echoes).
                      Raikon's stage gives Raikō no Tachi and the Raijin Kabuto; the other boss updates fill theirs in.
     stretch          stretch stages only: the side-scrolling level (see Logic.stretch and StretchSession in 60-engine.js):
                      { length,                     level width in world units (x runs 0 .. length; the screen is 1280 wide),
                        env?,                       environment override (defaults to the stage / chapter env),
                        start?,                     Kage's starting x (default 160),
                        encounters: [{ x, gate, waves }],  crossing x starts the encounter; an invisible gate at `gate`
                                                    blocks the way on until every wave is beaten; waves are 1-3 lists of
                                                    ENEMIES ids, all active at once, each wave starting when the last falls,
                        clues: [{ id, x, label, scene? }],  pickups that record a clue flag (Logic.collectClue) and
                                                    may play a scene (Logic.clueScene),
                        tutorial?: [{ step, at }],  in-world prompts taught in order (TUTORIAL_STEPS; Logic.tutorialPrompt),
                        props?: [{ type, x }],      set dressing drawn in the world: 'house' (a burnt-out house frame),
                                                    'shrine' (a small roadside shrine), 'collapsed' (a fallen house),
                        ashTrail?: { from, to } }   violet memory ash drifting along the ground between two x.
                      An encounter may add `mimicIntro: seconds`: its first wave's foes stand mirroring Kage's idle
                      stance and facing for that long before they attack (AIController.mimic, 40-ai.js).
                      The stretch is complete when Kage reaches `length` with every encounter cleared.
                      Until the story updates author them, every stretch gets placeholder content (stretchDefaults).
   scenes?          story scenes by hook: { before, after, defeat } (scene ids from SCENES, 12-scenes.js; see Logic.stageScene).
   Later updates add per-stage fields here (env override);
   the logic module reads them, so the rest of the game picks them up. */
/* Tutorial prompts (a stretch's `tutorial`; see Logic.tutorialPrompt / tutorialLabel). keys: what to press on each
   input device, matching InputManager's bindings and the touch buttons' captions. */
const TUTORIAL_STEPS = {
  move:  { verb: 'Move',  hint: 'Walk down the road',      keys: { keyboard: ['A', 'D'],     touch: ['Stick'],  pad: ['Left stick'] } },
  jump:  { verb: 'Jump',  hint: 'Leap the fallen beam',    keys: { keyboard: ['W', 'Space'], touch: ['Jump'],   pad: ['A'] } },
  slash: { verb: 'Slash', hint: 'Your hands remember the sword', keys: { keyboard: ['U'],    touch: ['Strike'], pad: ['RB'] } },
  block: { verb: 'Block', hint: 'Guard — press just before a hit to parry', keys: { keyboard: ['S'], touch: ['Guard'], pad: ['LT'] } },
  dodge: { verb: 'Dodge', hint: 'Dash through danger',     keys: { keyboard: ['L', 'Shift'], touch: ['Dash'],   pad: ['B'] } }
};
const STAGE_KINDS = ['stretch', 'subboss', 'boss', 'spar', 'echo', 'scene'];
const CAMPAIGN = (function buildCampaign() {
  const R = ['I', 'II', 'III', 'IV'];
  // Placeholder stretch content: two encounters drawn from a squad of four units [a, b, c, d] (a fights most, d once;
  // the last wave is four foes at once) and one sample clue. The Prologue, Act and Core updates replace these with
  // authored levels.
  const stretchDefaults = ([a, b, c, d]) => {
    return {
      length: 4600, start: 160,
      encounters: [
        { x: 1250, gate: 1950, waves: [[a, a], [a, b]] },
        { x: 3050, gate: 3750, waves: [[b, c], [a, c, b, d]] }
      ],
      clues: [{ id: 'clue1', x: 2450, label: 'A torn page' }]
    };
  };
  // An act: four stretches, each followed by its sub-boss arena, then the main boss arena.
  const act = (id, name, title, place, env, diff, squads, foe, foeTitle) => {
    const stages = [];
    for (let i = 1; i <= 4; i++) {
      stages.push({ id: `${id}.stretch${i}`, kind: 'stretch', name: `Stretch ${R[i - 1]}`, enemy: squads[i - 1][0], stretch: stretchDefaults(squads[i - 1]) });
      stages.push({ id: `${id}.sub${i}`, kind: 'subboss', name: `Sub-boss ${R[i - 1]}`, foe: `${name} · Sub-boss ${i}`, enemy: 'echo_sentinel' });
    }
    stages.push({ id: `${id}.boss`, kind: 'boss', name: foe, foe, foeTitle, enemy: 'echo_warden' });
    return { id, name, title, place, env, diff, stages };
  };
  // Each act's four stretch squads. The Order holds Act I; the Hollows gather in Act II; in Act III the Order's elite
  // guard the Fortress while Hollows rise from below, and the Core is Hollows only.
  const SQUADS = {
    act1: [['order_footman', 'order_runner', 'order_footman', 'hollow_shade'],
           ['order_footman', 'order_chainthrower', 'order_runner', 'order_footman'],
           ['order_runner', 'order_shieldbearer', 'order_footman', 'hollow_flicker'],
           ['order_footman', 'order_shieldbearer', 'order_chainthrower', 'order_ironclad']],
    act2: [['hollow_shade', 'hollow_flicker', 'hollow_shade', 'order_footman'],
           ['hollow_shade', 'hollow_mimic', 'hollow_flicker', 'hollow_ward'],
           ['hollow_flicker', 'hollow_ward', 'hollow_mimic', 'order_runner'],
           ['hollow_shade', 'hollow_mimic', 'hollow_ward', 'hollow_husk']],
    act3: [['order_footman', 'order_shieldbearer', 'order_chainthrower', 'order_ironclad'],
           ['order_shieldbearer', 'order_runner', 'order_ironclad', 'hollow_shade'],
           ['hollow_shade', 'order_footman', 'hollow_ward', 'order_ironclad'],
           ['hollow_flicker', 'order_shieldbearer', 'hollow_husk', 'hollow_mimic']]
  };
  const chapters = [
    { id: 'prologue', name: 'Prologue', title: 'Hoshimura', place: 'The abandoned village', env: 'highlands', diff: 1,
      stages: [{ id: 'prologue.1', kind: 'stretch', name: 'The Empty Village', enemy: 'hollow_shade', scenes: { before: 'prologue.open', after: 'prologue.close' },
        // Hoshimura: a short, gentle walk that teaches the basics, three clues Rem left behind, one Hollow, then the ash.
        stretch: {
          length: 4200, start: 160, env: 'hoshimura',
          tutorial: [{ step: 'move', at: 0 }, { step: 'jump', at: 520 }, { step: 'slash', at: 1000 }, { step: 'block', at: 1420 }, { step: 'dodge', at: 1780 }],
          encounters: [{ x: 2600, gate: 3200, waves: [['hollow_tutorial']], mimicIntro: 2.2 }],
          clues: [
            { id: 'recording', x: 820, label: 'A broken recording', scene: 'prologue.clue.recording' },
            { id: 'photograph', x: 2160, label: 'A scratched photograph', scene: 'prologue.clue.photograph' },
            { id: 'message', x: 3640, label: 'A second message', scene: 'prologue.clue.message' }
          ],
          props: [{ type: 'collapsed', x: 660 }, { type: 'shrine', x: 860 }, { type: 'collapsed', x: 1320 }, { type: 'house', x: 2160 }, { type: 'collapsed', x: 2950 }, { type: 'house', x: 3700 }],
          ashTrail: { from: 3250, to: 4160 }
        } }] },
    act('act1', 'Act I', 'The Outer Districts', 'Order territory', 'rooftops', 1, SQUADS.act1, 'Raikon', 'the Lightning Ascendant'),
    { id: 'interlude', name: 'Interlude', title: 'Brothers', place: 'A memory of the training yard', env: 'highlands', diff: 1,
      stages: [{ id: 'interlude.spar', kind: 'spar', name: 'The Spar', foe: 'Rem', foeTitle: 'Young Rem', enemy: 'young_rem', env: 'yard',
        scenes: { before: 'interlude.spar.before', after: 'interlude.spar.after' } }] },
    act('act2', 'Act II', 'The City of Echoes', 'Where the Hollows gather', 'rooftops', 2, SQUADS.act2, 'Akari', 'the Memory Blade'),
    act('act3', 'Act III', 'The Fortress of Silence', 'Seat of the Order', 'fortress', 3, SQUADS.act3, 'Takashi', 'the Father'),
    { id: 'core', name: 'The Core', title: 'The Echo System', place: 'Corrupted memory', env: 'wasteland', diff: 3,
      stages: [
        { id: 'core.stretch1', kind: 'stretch', name: 'Into the Core', enemy: 'hollow_flicker' },
        { id: 'core.echo1', kind: 'echo', name: 'Echo I', foe: 'Hollow Raikon', foeTitle: 'Corrupted echo', enemy: 'echo_sentinel' },
        { id: 'core.echo2', kind: 'echo', name: 'Echo II', foe: 'Hollow Akari', foeTitle: 'Corrupted echo', enemy: 'echo_sentinel' },
        { id: 'core.echo3', kind: 'echo', name: 'Echo III', foe: 'Hollow Takashi', foeTitle: 'Corrupted echo', enemy: 'echo_sentinel' },
        { id: 'core.echo4', kind: 'echo', name: 'Echo IV', foe: 'Hollow Rem', foeTitle: 'Corrupted echo', enemy: 'echo_sentinel' },
        { id: 'core.witness', kind: 'boss', name: 'The Witness', foe: 'The Witness', foeTitle: 'Mirror of the Self', enemy: 'witness',
          scenes: { before: 'core.witness.before', defeat: 'core.witness.defeat' } }
      ] },
    { id: 'epilogue', name: 'Epilogue', title: 'The Last Choice', place: 'Dawn', env: 'highlands', diff: 1,
      // The Last Choice: no combat. Finishing it grants the post-story gear once (Logic.grantStageReward); the Shinsei
      // Yoroi is ngOnly, so it only drops when the Epilogue is finished again during New Game+ (its one source).
      stages: [{ id: 'epilogue', kind: 'scene', name: 'The Last Choice', scenes: { before: 'epilogue.last_choice' },
        reward: { weapons: ['mugen_no_ha'], armors: ['kysmei_robe', 'kurokumo_yoroi', 'shinsei_yoroi'] } }] }
  ];
  // Act I's boss: Raikon, at the route to the old military archive
  Object.assign(chapters[1].stages.find(st => st.id === 'act1.boss'), {
    enemy: 'raikon', reward: { weapons: ['raiko_no_tachi'], helmets: ['raijin_kabuto'] },
    scenes: { before: 'act1.raikon.before', defeat: 'act1.raikon.defeat' } });
  // Act II's boss: Akari, in the City of Echoes. She drops her Mei-En Garb and Kagehira & Yūrei, and her dying words
  // hand Kage Shinsen (story flag act2.shinsen_received). This reward is Shinsen's one source: Logic.grantStageReward
  // gives it once, the first time the stage is won.
  Object.assign(chapters[3].stages.find(st => st.id === 'act2.boss'), {
    enemy: 'akari', reward: { weapons: ['kagehira_yurei', 'shinsen'], armors: ['mei_en_garb'] },
    scenes: { before: 'act2.akari.before', defeat: 'act2.akari.defeat' } });
  // Act III's boss: Takashi, in the Fortress of Silence. He kneels and escapes; his defeat scene gives the route to the
  // Core (story flag act3.core_route) and he leaves his Kasa behind. The Shinsei Yoroi is NOT here: New Game+ only (SAN-44).
  Object.assign(chapters[4].stages.find(st => st.id === 'act3.boss'), {
    enemy: 'takashi', reward: { helmets: ['kasa'] },
    scenes: { before: 'act3.takashi.before', defeat: 'act3.takashi.defeat' } });
  // Act I, The Missing Brother: four stretches through Yomi's outer districts, where the Order of Silence has erased
  // the records of the Silent War. Mostly Order soldiers with a few Hollows, more of them each stretch; survivors'
  // story beats; the act's three clues (the torn report, the two sword marks, Takashi's evacuation recording); and a
  // sub-boss at the end of each stretch, fought in the boss format, who drops a trophy.
  const F = 'order_footman', RU = 'order_runner', SH = 'order_shieldbearer', CH = 'order_chainthrower', IR = 'order_ironclad';
  const ACT1 = {
    'act1.stretch1': { name: 'The Silent Ward', enemy: F, scenes: { before: 'act1.stretch1.before' },
      stretch: { length: 4400, start: 160, env: 'rooftops',
        encounters: [
          { x: 1100, gate: 1750, waves: [[F, F], [F, RU]] },
          { x: 2900, gate: 3600, waves: [[RU, F], [F, F, 'hollow_shade']] }],
        clues: [{ id: 'report', x: 2300, label: 'A torn mission report', scene: 'act1.clue.report' }],
        props: [{ type: 'edict', x: 620 }, { type: 'collapsed', x: 2300 }, { type: 'barricade', x: 3900 }] } },
    'act1.sub1': { foe: 'Kuroe', foeTitle: 'the Ink Censor', enemy: 'kuroe', format: 'boss', env: 'rooftops', reward: { helmets: ['sumi_eboshi'] } },
    'act1.stretch2': { name: 'Checkpoint Row', enemy: CH, scenes: { before: 'act1.stretch2.before' },
      stretch: { length: 4900, start: 160, env: 'districts',
        encounters: [
          { x: 1000, gate: 1650, waves: [[F, CH], [F, F]] },
          { x: 2300, gate: 2950, waves: [[RU, RU], [CH, F, RU]] },
          { x: 3600, gate: 4300, waves: [[F, CH, F]] }],
        clues: [{ id: 'marks', x: 3200, label: 'Two sword marks', scene: 'act1.clue.marks' }],
        props: [{ type: 'barricade', x: 700 }, { type: 'edict', x: 1900 }, { type: 'edict', x: 3250 }, { type: 'barricade', x: 4550 }] } },
    'act1.sub2': { foe: 'Garan', foeTitle: 'the Stormbroken', enemy: 'garan', format: 'boss', env: 'districts', reward: { armors: ['ikazuchi_do'] } },
    'act1.stretch3': { name: 'The Burned Registry', enemy: SH, scenes: { before: 'act1.stretch3.before' },
      stretch: { length: 5200, start: 160, env: 'wasteland',
        encounters: [
          { x: 1100, gate: 1750, waves: [[SH, F], [RU, 'hollow_flicker']] },
          { x: 2500, gate: 3150, waves: [[F, SH, CH], ['hollow_shade', 'hollow_flicker']] },
          { x: 3900, gate: 4600, waves: [[SH, RU], [F, CH, RU, 'hollow_shade']] }],
        clues: [{ id: 'recording', x: 3450, label: 'A sealed recording', scene: 'act1.clue.recording' }],
        props: [{ type: 'house', x: 800 }, { type: 'collapsed', x: 2000 }, { type: 'shrine', x: 3450 }, { type: 'house', x: 4850 }] } },
    'act1.sub3': { foe: 'Hisame', foeTitle: 'the Rain Courier', enemy: 'hisame', format: 'boss', env: 'districts', reward: { helmets: ['hisame_zukin'] } },
    'act1.stretch4': { name: 'The Archive Road', enemy: SH, scenes: { before: 'act1.stretch4.before' },
      stretch: { length: 5600, start: 160, env: 'districts',
        encounters: [
          { x: 1000, gate: 1650, waves: [[F, SH, F], [CH, RU]] },
          { x: 2400, gate: 3050, waves: [[IR], [SH, CH, F]] },
          { x: 3800, gate: 4600, waves: [[IR, RU, F], [SH, F, CH, 'hollow_husk']] }],
        clues: [],
        props: [{ type: 'barricade', x: 600 }, { type: 'edict', x: 2000 }, { type: 'barricade', x: 3400 }, { type: 'edict', x: 5000 }] } },
    'act1.sub4': { foe: 'Shiden', foeTitle: 'the Last Lieutenant', enemy: 'shiden', format: 'boss', env: 'districts', reward: { armors: ['shiden_yoroi'] } }
  };
  for (const st of chapters[1].stages) if (ACT1[st.id]) Object.assign(st, ACT1[st.id]);
  // Act II, the City of Echoes: four stretches through a district rebuilt from stored memories. Mostly Hollows, more of
  // them each stretch. The reconstruction shows: each stretch's street block repeats (`loop`, expanded by
  // Logic.streetProps, with a glitching `seam` where it starts over), its sign reads differently every time it comes
  // back into view (Logic.signStep / signText), and in each `before` scene two residents remember the same event two
  // different ways. One clue (two teacups). Each stretch ends in a sub-boss with a reduced Akari move and a trophy.
  const S = 'hollow_shade', FL = 'hollow_flicker', WD = 'hollow_ward', MI = 'hollow_mimic', HU = 'hollow_husk';
  const ACT2 = {
    'act2.stretch1': { name: 'The Repeating Street', enemy: S, scenes: { before: 'act2.stretch1.before' },
      stretch: { length: 5200, start: 160, env: 'echoes',
        encounters: [
          { x: 1100, gate: 1750, waves: [[S, S], [S, FL]] },
          { x: 3000, gate: 3700, waves: [[FL, S], [S, FL, S, RU]] }],
        clues: [],
        loop: { from: 400, period: 1600, count: 3, block: [
          { type: 'echo_house', dx: 0 },
          { type: 'sign', dx: 300, id: 'teahouse', texts: ['TACHIBANA TEA HOUSE', 'TACHIBANA TEA HOUSE · CLOSED', 'NO TACHIBANAS HERE', 'WELCOME HOME'] },
          { type: 'lantern_post', dx: 620 },
          { type: 'echo_house', dx: 1000, alt: 1 },
          { type: 'lantern_post', dx: 1300 }] } } },
    'act2.sub1': { foe: 'Tsugumi', foeTitle: 'the Memory Courier', enemy: 'tsugumi', format: 'boss', env: 'echoes', reward: { helmets: ['hakobi_gasa'] } },
    'act2.stretch2': { name: 'Lantern Row', enemy: MI, scenes: { before: 'act2.stretch2.before' },
      stretch: { length: 5400, start: 160, env: 'echoes',
        encounters: [
          { x: 1000, gate: 1650, waves: [[S, MI], [FL, S]] },
          { x: 2400, gate: 3050, waves: [[WD, S], [MI, FL]] },
          { x: 3800, gate: 4500, waves: [[S, WD, FL, MI]] }],
        clues: [{ id: 'cups', x: 3350, label: 'Two teacups, still warm', scene: 'act2.clue.cups' }],
        loop: { from: 350, period: 1600, count: 3, block: [
          { type: 'lantern_post', dx: 0 },
          { type: 'echo_house', dx: 260, alt: 1 },
          { type: 'sign', dx: 560, id: 'lanterns', texts: ['LANTERNS · REPAIRED', 'LANTERNS · REMEMBERED', 'LANTERNS · FORGOTTEN'] },
          { type: 'lantern_post', dx: 800 },
          { type: 'echo_house', dx: 1150 }] } } },
    'act2.sub2': { foe: 'Sayo', foeTitle: 'the Quiet Hand', enemy: 'sayo', format: 'boss', env: 'echoes', reward: { armors: ['shirabe_do'] } },
    'act2.stretch3': { name: 'The Two-Ended Bridge', enemy: FL, scenes: { before: 'act2.stretch3.before' },
      stretch: { length: 5700, start: 160, env: 'echoes',
        encounters: [
          { x: 1100, gate: 1750, waves: [[FL, FL], [S, MI, S]] },
          { x: 2600, gate: 3250, waves: [[WD, MI], [S, FL, RU]] },
          { x: 4100, gate: 4800, waves: [[HU], [S, WD, MI, FL]] }],
        clues: [],
        loop: { from: 400, period: 1700, count: 3, block: [
          { type: 'echo_house', dx: 0, alt: 1 },
          { type: 'lantern_post', dx: 330 },
          { type: 'sign', dx: 640, id: 'bridge', texts: ['HASHI BRIDGE → HOSHIMURA', 'HASHI BRIDGE → YOMI', 'HASHI BRIDGE → NOWHERE'] },
          { type: 'shrine', dx: 980 },
          { type: 'echo_house', dx: 1300 }] } } },
    'act2.sub3': { foe: 'Utsushi', foeTitle: 'the Borrowed Face', enemy: 'utsushi', format: 'boss', env: 'echoes', reward: { helmets: ['utsushi_men'] } },
    'act2.stretch4': { name: 'The Unfinished Ward', enemy: WD, scenes: { before: 'act2.stretch4.before' },
      stretch: { length: 6000, start: 160, env: 'echoes',
        encounters: [
          { x: 1000, gate: 1650, waves: [[S, MI, FL], [WD, S]] },
          { x: 2600, gate: 3300, waves: [[HU, S], [MI, FL, WD]] },
          { x: 4200, gate: 5000, waves: [[HU, WD, S], [MI, FL, S, HU]] }],
        clues: [],
        loop: { from: 300, period: 1800, count: 3, block: [
          { type: 'echo_house', dx: 0 },
          { type: 'lantern_post', dx: 380 },
          { type: 'echo_house', dx: 700, alt: 1, unfinished: 1 },
          { type: 'sign', dx: 1050, id: 'ward', texts: ['WARD 9 · RESIDENTS ONLY', 'WARD 9 · NO RESIDENTS', 'WARD 9 · DO NOT REMEMBER'] },
          { type: 'lantern_post', dx: 1400 }] } } },
    'act2.sub4': { foe: 'Kasane', foeTitle: 'the Ledger Warden', enemy: 'kasane', format: 'boss', env: 'echoes', reward: { armors: ['kasane_haori'] } }
  };
  for (const st of chapters[3].stages) if (ACT2[st.id]) Object.assign(st, ACT2[st.id]);
  // Act III, The Father's Sin: four stretches through the Fortress of Silence, the Order's seat (env `fortress`: stone
  // walls, Order banners, memory conduits glowing violet). The hardest regular encounters in the game: mostly the
  // Order's elite (shieldbearers, ironclads, chainthrowers), with Hollows rising wherever the Echo System's conduits run
  // through the walls, more of them each stretch. The `before` scenes build toward Takashi being alive (the Order's
  // records, a guard, a conduit speaking in his voice); one clue (the duty roster). Each stretch ends in a sub-boss with
  // a reduced Takashi move and a trophy.
  const HS = 'hollow_shade';
  const ACT3 = {
    'act3.stretch1': { name: 'The Outer Gate', enemy: SH, scenes: { before: 'act3.stretch1.before' },
      stretch: { length: 5400, start: 160, env: 'fortress',
        encounters: [
          { x: 1000, gate: 1700, waves: [[F, F, SH], [CH, F, RU]] },
          { x: 2400, gate: 3100, waves: [[SH, CH], [F, IR, HS]] },
          { x: 3900, gate: 4700, waves: [[IR, F, CH], [SH, F, F, CH]] }],
        clues: [],
        props: [{ type: 'banner', x: 520 }, { type: 'barricade', x: 820 }, { type: 'banner', x: 1500 }, { type: 'conduit', x: 2050 },
          { type: 'edict', x: 2700 }, { type: 'banner', x: 3400 }, { type: 'banner', x: 4300 }, { type: 'barricade', x: 5050 }] } },
    'act3.sub1': { foe: 'Gonryu', foeTitle: 'the Gate Warden', enemy: 'gonryu', format: 'boss', env: 'fortress', reward: { armors: ['tetsumon_do'] } },
    'act3.stretch2': { name: 'The Hall of Records', enemy: CH, scenes: { before: 'act3.stretch2.before' },
      stretch: { length: 5800, start: 160, env: 'fortress',
        encounters: [
          { x: 1000, gate: 1700, waves: [[F, SH, CH], [RU, RU, F]] },
          { x: 2500, gate: 3200, waves: [[IR, HS], [SH, CH, F, HS]] },
          { x: 4000, gate: 4800, waves: [[IR, SH, F], [CH, HS, F, RU]] }],
        clues: [{ id: 'roster', x: 3560, label: 'An Order duty roster', scene: 'act3.clue.roster' }],
        props: [{ type: 'banner', x: 480 }, { type: 'record_shelf', x: 860 }, { type: 'conduit', x: 1500 }, { type: 'record_shelf', x: 2150 },
          { type: 'banner', x: 2900 }, { type: 'record_shelf', x: 3560 }, { type: 'conduit', x: 4400 }, { type: 'banner', x: 5250 }] } },
    'act3.sub2': { foe: 'Shizune', foeTitle: 'the First Disciple', enemy: 'shizune', format: 'boss', env: 'fortress', reward: { helmets: ['deshi_tenugui'] } },
    'act3.stretch3': { name: 'The Conduit Galleries', enemy: IR, scenes: { before: 'act3.stretch3.before' },
      stretch: { length: 6100, start: 160, env: 'fortress',
        encounters: [
          { x: 1000, gate: 1700, waves: [[F, SH, HS], ['hollow_ward', CH, F]] },
          { x: 2500, gate: 3200, waves: [[IR, HS, 'hollow_mimic'], [SH, F, 'hollow_flicker', CH]] },
          { x: 4100, gate: 4900, waves: [[IR, SH, 'hollow_ward'], ['hollow_husk', F, CH, HS]] }],
        clues: [],
        props: [{ type: 'conduit', x: 500 }, { type: 'banner', x: 900 }, { type: 'conduit', x: 1400 }, { type: 'conduit', x: 2150 },
          { type: 'banner', x: 2850 }, { type: 'conduit', x: 3600 }, { type: 'conduit', x: 4500 }, { type: 'banner', x: 5300 }, { type: 'conduit', x: 5700 }] } },
    'act3.sub3': { foe: 'Moro', foeTitle: 'the Conduit Warden', enemy: 'moro', format: 'boss', env: 'fortress', reward: { armors: ['kudamaki_do'] } },
    'act3.stretch4': { name: 'The Last Stair', enemy: IR, scenes: { before: 'act3.stretch4.before' },
      stretch: { length: 6300, start: 160, env: 'fortress',
        encounters: [
          { x: 900, gate: 1600, waves: [[SH, CH, HS], [IR, 'hollow_flicker', F]] },
          { x: 2200, gate: 2900, waves: [[IR, SH, 'hollow_mimic'], ['hollow_husk', F, CH, 'hollow_flicker']] },
          { x: 3500, gate: 4200, waves: [['hollow_ward', SH, IR], [HS, 'hollow_mimic', CH, F]] },
          { x: 4800, gate: 5600, waves: [[IR, IR, SH], ['hollow_husk', 'hollow_ward', F, CH, HS]] }],
        clues: [],
        props: [{ type: 'banner', x: 420 }, { type: 'conduit', x: 1250 }, { type: 'banner', x: 1900 }, { type: 'conduit', x: 2550 },
          { type: 'banner', x: 3200 }, { type: 'conduit', x: 3850 }, { type: 'banner', x: 4500 }, { type: 'conduit', x: 5200 }, { type: 'banner', x: 5900 }] } },
    'act3.sub4': { foe: 'Soma', foeTitle: 'the Silent Blademaster', enemy: 'soma', format: 'boss', env: 'fortress', reward: { helmets: ['mokushi_kabuto'] } }
  };
  for (const st of chapters[4].stages) if (ACT3[st.id]) Object.assign(st, ACT3[st.id]);
  // The Core: one stretch inside the Memory Core (env `core`: a violet void, floating memory fragments, flat shards and
  // conduit light), Hollows only and the hardest Hollow mix in the game; then four echo fights the Core pulls out of
  // Kage's journey, each a corrupted Hollow copy of a foe he beat, fighting with reduced or warped versions of the
  // original's moves (CORE_ECHO_MOVES), Hollow Rem last; then the Witness. The echoes drop gems, never gear (`reward.gems`,
  // paid once on the first clear by Logic.completeStage).
  const CORE = {
    'core.stretch1': { name: 'Into the Core', enemy: HU, scenes: { before: 'core.stretch1.before' },
      stretch: { length: 6200, start: 160, env: 'core',
        encounters: [
          { x: 1000, gate: 1700, waves: [[S, FL, MI], [WD, HU, S]] },
          { x: 2500, gate: 3200, waves: [[HU, FL, FL], [MI, WD, S, HU]] },
          { x: 4000, gate: 4800, waves: [[HU, HU, WD], [FL, MI, S, WD, HU]] }],
        clues: [],
        props: [{ type: 'fragment', x: 520 }, { type: 'conduit', x: 900 }, { type: 'fragment', x: 1450, alt: 1 }, { type: 'shard', x: 2050 },
          { type: 'fragment', x: 2700 }, { type: 'conduit', x: 3350 }, { type: 'shard', x: 3700, alt: 1 }, { type: 'fragment', x: 4400, alt: 1 },
          { type: 'conduit', x: 5050 }, { type: 'shard', x: 5500 }, { type: 'fragment', x: 5900 }],
        ashTrail: { from: 4900, to: 6150 } } },
    'core.echo1': { enemy: 'hollow_raikon', format: 'boss', env: 'core', reward: { gems: 3 }, scenes: { before: 'core.echo1.before' } },
    'core.echo2': { enemy: 'hollow_akari', format: 'boss', env: 'core', reward: { gems: 3 }, scenes: { before: 'core.echo2.before' } },
    'core.echo3': { enemy: 'hollow_takashi', format: 'boss', env: 'core', reward: { gems: 3 }, scenes: { before: 'core.echo3.before' } },
    'core.echo4': { enemy: 'hollow_rem', format: 'boss', env: 'core', reward: { gems: 3 }, scenes: { before: 'core.echo4.before', defeat: 'core.echo4.defeat' } }
  };
  for (const st of chapters[5].stages) if (CORE[st.id]) Object.assign(st, CORE[st.id]);
  for (const ch of chapters) ch.stages.forEach((st, i) => { st.chapter = ch.id; st.pos = i; });
  return { chapters };
})();
// Threat of a stage on the authored curve (chapter tier + NG+), shown on stage cards. Not the difficulty mode
// (Easy / Normal / Hard / Impossible, see Logic.difficulty), hence different words.
const DIFF_LABEL = ['Calm', 'Tense', 'Fierce', 'Brutal', 'Mythic'];

/* Who answers a boss's summon (BOSS_ABILITIES.summon): the chapter's foot soldiers, else the default.
   See Logic.minionId. Clones copy their owner. */
const BOSS_MINIONS = { default: 'order_footman', act2: 'hollow_shade', core: 'hollow_shade' };

/* ---------------- Echo Trials ----------------
   Endless Hollow waves in a shifting memory arena (replaces Survival). Logic.echoTrialWave reads all of this.
     pool        the Hollows a wave draws from, each joining from wave `from`
     count       how many Hollows a wave sends, by the wave it starts at
     bossEvery   every n-th wave is a boss echo: one of the bosses the player has beaten (stage kinds `bossKinds`)
     eliteWave   ... or, with none beaten, an elite pack led by `lead` (role 'elite': `elite` health / damage)
     envs        the remembered places the arena shifts through, one every `shiftEvery` waves (`envNames` for banners),
                 with `glitch` seconds of flat glitch at each shift
     heal        health restored between waves; coins(w) and gemsEvery are the per-wave rewards */
const TRIALS = {
  pool: [{ id: 'hollow_shade', from: 1 }, { id: 'hollow_flicker', from: 1 }, { id: 'hollow_ward', from: 3 },
         { id: 'hollow_mimic', from: 3 }, { id: 'hollow_husk', from: 6 }],
  count: [{ from: 1, n: 1 }, { from: 4, n: 2 }, { from: 8, n: 3 }],
  bossEvery: 5,
  bossKinds: ['subboss', 'boss', 'echo'],
  eliteWave: { lead: 'hollow_husk', count: 2 },
  elite: { hp: 1.6, dmg: 1.2 },
  envs: ['hoshimura', 'districts', 'echoes', 'fortress', 'yard', 'core'],
  envNames: { hoshimura: 'Hoshimura, before the fire', districts: 'The Outer Districts', echoes: 'The City of Echoes',
              fortress: 'The Fortress of Silence', yard: 'The training yard', core: 'The Memory Core', rooftops: 'The rooftops',
              wasteland: 'The edge of memory', highlands: 'The highlands' },
  shiftEvery: 3,
  glitch: 0.4,          // seconds of flat glitch as the arena shifts
  heal: 0.35,
  coins: w => 25 + w * 12,
  gemsEvery: 5
};

/* ---------------- Boss Rush ----------------
   Every boss of the story (stage kinds `TRIALS.bossKinds`) back to back, each one only once beaten in the story.
   Logic.bossRushRoster / bossRushRun / bossRushAdvance / applyBossRushResult read this.
     heal    share of max health restored between fights (the rest carries over)
     coins   coins paid per boss beaten in a run (no gems, no XP, no gear, no story progress) */
const BOSS_RUSH = { heal: 0.3, coins: 30 };

/* Enemy AI archetypes (ENEMIES[id].ai). Logic.aiTuning sharpens them by stage level, New Game+ and difficulty mode;
   40-ai.js reads the tuned copy. react = reaction delay range (s), combo = string length range. */
const AI_PROFILES = {
  regular:   { pref: 125, aggr: 0.55, block: 0.38, parry: 0.06, dodge: 0.12, react: [0.24, 0.4], combo: [1, 3], jump: 0.05, punish: 0.55, grab: 0.05, kunai: 0.05 },
  agile:     { pref: 160, aggr: 0.62, block: 0.18, parry: 0.05, dodge: 0.38, react: [0.15, 0.27], combo: [2, 4], jump: 0.2, punish: 0.7, grab: 0.03, kunai: 0.06, dashIn: 0.35 },
  defensive: { pref: 115, aggr: 0.34, block: 0.62, parry: 0.16, dodge: 0.08, react: [0.17, 0.3], combo: [1, 2], jump: 0.02, punish: 0.85, grab: 0.2, kunai: 0.02 },
  ranged:    { pref: 430, aggr: 0.42, block: 0.32, parry: 0.04, dodge: 0.28, react: [0.2, 0.34], combo: [1, 2], jump: 0.1, punish: 0.45, grab: 0.02, kunai: 0.55, ranged: 1 },
  heavy:     { pref: 140, aggr: 0.5, block: 0.12, parry: 0, dodge: 0.03, react: [0.32, 0.52], combo: [1, 2], jump: 0, punish: 0.45, grab: 0, kunai: 0, heavy: 1 },
  boss:      { pref: 150, aggr: 0.62, block: 0.42, parry: 0.12, dodge: 0.18, react: [0.16, 0.28], combo: [2, 4], jump: 0.06, punish: 0.78, grab: 0.06, kunai: 0.05 }
};
