/* KAGE — the Order of Silence as armoured anime samurai (anime redesign, ticket 03).
   The fox-masked swordsman of docs/art-reference/sheets/slash-single.webp is the model: a dark lacquered dō laced in
   crimson (odoshi), sode on the shoulders, a kusazuri skirt of plates over dark hakama, kote, suneate and waraji, and a
   kitsune face as the family mark. Each of the five soldiers gets its own head and armour weight so the silhouette alone
   tells them apart at gameplay zoom:
     order_footman      the cutter: a full fox mask sculpted on a face (a long muzzle of a nose, pressed lips, a small
                        chin) with tall pointed ears over a cloth hood, full dō, sode, saya
     order_runner       the dagger runner: a peaked shinobi hood with two long streaming tails open on a lean bare face,
                        light breastplate (hara-ate), no sode, short kusazuri
     order_shieldbearer the sentinel spear: kabuto with a tall silver crescent maedate and a flared shikoro over a stern
                        hook-nosed face, big sode, and a tall lacquered tate (shield) in the off hand
     order_chainthrower the chain hook: a wide flat jingasa over a hood, a fox menpō sculpted over the lower face, light
                        breastplate with a chain bandolier across the chest
     order_ironclad     the raider: horned kabuto (ox-horn wakidate) with a broad shikoro over a heavy-jawed face, a
                        throat guard, a heavy dō with a gorget, huge o-sode and long kusazuri
   Every face is the profile of _shared/face.js (the `face` of each skin below): head.js opens hoods and helmets at it.
   Everything here is drawing: parts are celFill paths on the skeleton, honour the flat passes (A.flat) and move no joint.
   The helmet and armour keys (order_hood, order_kabuto, order_garb, order_plate) are enemy-only; no gear item uses them. */

// slate-tinted lacquer (the Order's armour): near-black with a cold blue-grey lift, one tone per material step
const ORDER_LACQ = ['#08090b', '#121519', '#2a3038'];

const ORDER_LACQ_FAR = ['#060708', '#0b0d10', '#161a1f'];

const ORDER_SILVER = ['#3c3f45', '#6f737a', '#aeb2b8'];   // muted silver for the crescent crest and fittings

const ORDER_HORN = ['#070707', '#141315', '#34313a'];

// one design per soldier type: `order` holds the Order-only parts; the shared body reads sleeve / kote / feet / saya
const _orderBase = { top: 'gi', feet: 'sandal', kote: true, collar: false, sash: 'order', noGiSash: true, suneate: true };

// the faces (_shared/face.js): hard, disciplined profiles, a cold crimson light down each. The footman's and the
// chainthrower's are mostly under their fox masks; the runner, the shieldbearer and the ironclad show theirs.
const ORDER_FACE_LIGHT = '#b8574b';

ANIME_SKINS.order_footman = Object.assign({}, _orderBase, { sleeve: 1.02, saya: true,
  face: { of: 'hawk', light: ORDER_FACE_LIGHT, depth: 0.1 },
  order: { head: 'fox', do: 'full', sode: 1, kusa: { rows: 4, len: 1.1, panels: 3 } } });

// the runner: lean, a long straight nose, a narrow jaw, the forehead swept back
ANIME_SKINS.order_runner = Object.assign({}, _orderBase, { sleeve: 0.86,
  face: { of: 'base', nose: 1.18, lip: 0.85, chin: 0.94, jaw: 0.84, brow: 1.3, slope: 0.04, light: ORDER_FACE_LIGHT, depth: 0.1 },
  order: { head: 'runner', do: 'light', sode: 0, kusa: { rows: 2, len: 0.62, panels: 2 } } });

// the shieldbearer: a stern hooked nose under a heavy brow, a firm chin
ANIME_SKINS.order_shieldbearer = Object.assign({}, _orderBase, { sleeve: 1.06,
  face: { of: 'hawk', brow: 1.9, chin: 1.14, lip: 0.8, light: ORDER_FACE_LIGHT, depth: 0.1 },
  order: { head: 'crescent', do: 'full', sode: 1.15, kusa: { rows: 4, len: 1.15, panels: 3 } } });

ANIME_SKINS.order_chainthrower = Object.assign({}, _orderBase, { sleeve: 0.95,
  face: { of: 'base', nose: 1.1, brow: 1.4, chin: 1.04, light: ORDER_FACE_LIGHT, depth: 0.1 },
  order: { head: 'jingasa', do: 'light', sode: 0, chain: true, kusa: { rows: 3, len: 0.8, panels: 2 } } });

// the ironclad: a block of a jaw jutting past a short broad nose, a deep brow
ANIME_SKINS.order_ironclad = Object.assign({}, _orderBase, { sleeve: 1.1,
  face: { of: 'heavy', nose: 1.0, brow: 2.2, lip: 1.1, chin: 1.45, jaw: 1.4, light: ORDER_FACE_LIGHT, depth: 0.1 },
  order: { head: 'horns', do: 'heavy', sode: 1.3, kusa: { rows: 5, len: 1.35, panels: 3 } } });

// cloth the Order designs need (from animeCloths): the runner's two long hood tails, the chainthrower's hat cords
function orderCloths(f, sk) {
  const s = f.scale, o = sk.order; if (!o) return;
  if (o.head === 'runner') {
    f.cloths.push({ kind: 'scarf', c: new Cloth(11, 7.6 * s, { ph: 3.3, wind: 1250, grav: 520, stiff: 1.85 }), at: 'head', color: '#121519', rim: 'rgba(52,10,13,0.95)', w: 8.4 * s, w1: 2.6 * s, dy: -6, dx: 16 });
    f.cloths.push({ kind: 'scarf', c: new Cloth(9, 7.2 * s, { ph: 6.8, wind: 1100, grav: 600, stiff: 1.85 }), at: 'head', color: '#0b0d10', rim: 'rgba(52,10,13,0.95)', w: 6.4 * s, w1: 2 * s, dy: -3, dx: 15 });
  } else if (o.head === 'jingasa') {
    f.cloths.push({ kind: 'scarf', c: new Cloth(5, 5.2 * s, { ph: 2.1, wind: 420, grav: 1100, stiff: 1.6 }), at: 'head', color: ANIME.crimson, w: 1.8 * s, w1: 1.2 * s, dy: 10, dx: 12 });
  }
}
