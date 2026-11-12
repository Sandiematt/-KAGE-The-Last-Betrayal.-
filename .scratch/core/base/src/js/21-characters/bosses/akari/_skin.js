/* KAGE — Akari, the Memory Blade, as an anime kunoichi (anime redesign, ticket 09), from her key art
   (boss_akari.webp, face_akari.webp). A main boss: tall, long-legged and powerful, taller than Kage, about 1/7 head,
   drawn with a narrow waist between a full chest and wide hips, in a fitted (never revealing) cut:
     head      a black face with WHITE eyes (the rule) above a dark cloth half-mask that covers the face from the cheeks
               down; black hair with a pink sheen: a fringe of sharp locks over the brow, a long side lock framing
               the face, and a high ponytail off the crown (cloth 'ahair', two locks) tied with a pink sakura
               ornament and short pink bead strings (cloth 'aribbon')
     garb      a fitted black top with a high collar and pink piping along a halter line, a wide black belt with a
               silver buckle over a second belt slung low on the hips, a pouch on a strap round the near thigh
     arms      fitted dark sleeves under long lacquered arm guards from above the elbow to the wrist, banded pink
     legs      fitted leggings into tall boots with a pink band at the top and a small knee guard
     sash      one long sakura-pink sash down the front from the belt, cut in a V, a pale sakura crest near its end (cloth
               'asash'), and a long dark tail of cloth streaming from the back of the belt, edged pink (cloth 'atail')
     blades    Kagehira & Yurei (drawWeaponShape 'kagehira' / 'yurei', unchanged) with their pink edge light
   Hollow Akari (hollow_akari, echoOf akari) is the same design under the Hollow treatment: the deep near-black palette,
   the pink faded toward ash, the sash and the tail torn into points, the hair ends ragged, one bead string gone, the
   sakura ornament ashen with a petal missing, a glowing crack across the mask and one arm guard, a stronger pink
   halo round the white eyes. Fighter.draw's glitch, ghost and ash dissolve sit on top.
   All of her cloth is drawn inside the body (silhouette), so the outline, the impact frame, the glitch ghost and the
   flat afterimages (her decoy echoes, Smoke Step, Blink) carry the whole silhouette: hair, sash and tail included.
   Kage can wear the Mei-En Garb (trophy armour): on him it is a lacquered chest guard edged pink over his coat and
   a shorter pink sash with the crest. Drawing only: no joint, timer or gameplay field is touched, no randomness. */

const AK_VIO = ['#5a0a32', '#e0408e', '#ff8cc6'];             // the sash, piping, bands: sakura pink (AKARI_PINK at the top)

const AK_VIO_H = ['#2e1a26', '#6e3a58', '#c48aa8'];           // the echo's: faded toward ash-pink

const AK_CLOTH = ['#060305', '#100a0d', '#241820'];           // her black fabric, a pink cast in the lit fold

const AK_GUARD = ['#090506', '#191013', '#3c2a33'];           // lacquered arm guards, boots, knee guards

const AK_HAIR = ['#060304', '#140a10', '#4e2840'];            // black hair, pink in the light

const AK_MASK = ['#150f12', '#241b20', '#3f3038'];            // the cloth half-mask, a step lighter than the face

const AK_TAIL = ['#080506', '#130c10', '#291b22'];

const AK_SILVER = ['#4a4c52', ANIME.silver, ANIME.silverHi];

const AK_SKIN = ['#140b10', '#24151c', '#4a2c3a'];            // bare shoulders and upper arms: dark skin, a warm pink-lit edge

const AK_SAKURA = ['#b8326f', '#ff7ab8', '#fff0f6'];           // petals shadow / base / heart

const AK_SAKURA_H = ['#483440', '#846676', '#c8b2bd'];         // ash

/* ---- skins ---- */
ANIME_SKINS.akari = { top: 'gi', feet: 'boot', sleeve: 1, kote: false, collar: false, sash: 'akari', noGiSash: true, akari: 'boss', rimTint: [255, 110, 180] };

ANIME_SKINS.hollow_akari = { top: 'gi', feet: 'boot', sleeve: 1, kote: false, collar: false, sash: 'akari', noGiSash: true, akari: 'hollow',
  hollow: { fray: 1, robe: {} } };   // `hollow` gives the deep palette; her cloth is her own (ahair, asash, atail)

const _akH = (f) => animeSkin(f).akari === 'hollow';

// her key art is edge-lit in sakura pink, not red: the fine rim inside her parts follows (the outline pass: skin.rimTint)
const _akPalC = new WeakMap();

// her rim light and accents follow her phase's petal colour (AKARI_PETALS): sakura pink, then hot pink, then deep pink
const AK_RIM = { violet: 'rgba(255,102,178,0.55)', crimson: 'rgba(255,61,154,0.6)', demon: 'rgba(255,20,147,0.72)' };
function akariPal(pal, petal) {
  const k = AK_RIM[petal] ? petal : 'violet';
  let m = _akPalC.get(pal); if (!m) _akPalC.set(pal, m = {});
  if (!m[k]) {
    const pt = k === 'violet' ? [AK_VIO[1], AK_VIO[2]] : [AKARI_PETALS[k][0], AKARI_PETALS[k][1]];
    m[k] = Object.assign({}, pal, { rim: AK_RIM[k], acc: pt[0], accHi: pt[1] });
  }
  return m[k];
}

const _akV = (f) => (f.hollow ? AK_VIO_H : AK_VIO);

// cloth (from animeCloths): the ponytail's two locks and the bead strings from the crown, the sash and the tail from
// the belt; Kage in the Mei-En Garb gets the sash only, shorter
function akariCloths(f, sk) {
  const s = f.scale;
  if (sk.akari) {
    f.cloths.push({ kind: 'ahair', main: 1, c: new Cloth(14, 8.8 * s, { ph: 4.5, wind: 1250, grav: 460, stiff: 1.88, hang: 0.5 }), at: 'head', dx: 13, dy: -24 });   // her key art: a long, full ponytail
    f.cloths.push({ kind: 'ahair', c: new Cloth(11, 7.8 * s, { ph: 6.6, wind: 1400, grav: 320, stiff: 1.85, hang: 0.8 }), at: 'head', dx: 15, dy: -27 });
    f.cloths.push({ kind: 'aribbon', c: new Cloth(4, 3.8 * s, { ph: 7, wind: 200, grav: 1100, stiff: 1.6 }), at: 'head', dx: 12, dy: -10 });
    if (!(f.def && f.def.echoOf)) f.cloths.push({ kind: 'aribbon', c: new Cloth(4, 3.2 * s, { ph: 8.4, wind: 180, grav: 1100, stiff: 1.6 }), at: 'head', dx: 9, dy: -9 });   // the echo lost one
    f.cloths.push({ kind: 'atail', c: new Cloth(9, 9.4 * s, { ph: 2.4, wind: 1000, grav: 980, stiff: 1.7, hang: 0.5 }), at: 'hip', dx: 8, dy: -3 });
    f.cloths.push({ kind: 'asash', c: new Cloth(8, 10.2 * s, { ph: 2, wind: 260, grav: 1250, stiff: 1.9, hang: 0.12 }), at: 'hip', dx: -6, dy: -2 });
  } else if (f.armor === 'mei_en') {
    f.cloths.push({ kind: 'asash', short: 1, c: new Cloth(6, 9.6 * s, { ph: 2, wind: 260, grav: 1250, stiff: 1.9, hang: 0.12 }), at: 'hip', dx: -7, dy: -2 });
  }
}
