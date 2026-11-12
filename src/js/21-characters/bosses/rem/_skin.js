/* KAGE — Rem, Kage's younger brother, as an anime samurai (anime redesign, ticket 07), from his portrait (face_rem.webp).
   One design in three ages, the same black face and white eyes as his brother but told apart at a glance:
     hair      Kage's is a tall, wild crown of long points thrown up and back; Rem's is lower and wind-swept, shorter
               spikes laid almost flat toward the back, with one fringe lock falling forward over the band
     head      Kage wears nothing on his head and a red scarf at his throat; Rem wears a WHITE HEADBAND with a silver
               ring at the temple and two long white tails streaming back (cloth), and no scarf
     accent    Kage's is crimson; Rem's is violet (obi edges, belt tails, coat lining, collar band)
     cut       Kage's long open coat falls to mid-calf over tall boots; Rem's travel coat is knee-length and wrapped shut
               under a wide violet collar band, over wrapped travel leggings (kyahan) and straw sandals
   The three Rem fighters:
     young_rem   the Interlude spar: a training gi with the sleeves tied back by a violet tasuki cord, bound forearms, a
                 violet-edged obi with its tails, a bokken. Young Kage stands beside him in a plain gi with full sleeves
                 and a short crimson training band (20-fighter.js headbandColor), so the brothers differ already as boys.
     rem         the adult look (no fighter def uses the id today; it is the design Hollow Rem copies, and the one a
                 later scene or ticket can put on screen): the travel coat above, a katana and saya
     hollow_rem  the Core's echo: the adult design under the Hollow treatment (enemies/hollow/): the coat torn into
                 points at the hem and frayed at the cuffs, the violet gone pale and broken, the band ashen and torn,
                 a cracked shard over one cheek, a rip across the chest; the glitch, ghost and ash dissolve sit on top
   The gear keys headband, training and travel_coat are enemy-only except young Kage's headband + training (the spar),
   which draws his own hair under a crimson band. Drawing only: nothing here moves a joint or touches gameplay. */

const REM_ACC = '#8a5cd6';

const REM_BAND = ['#a59e92', '#e4ded2', '#f6f2ea'];        // the headband: off-white cloth, never pure white

const REM_BAND_H = ['#4a4460', '#8a82a4', '#b4acca'];      // Hollow Rem's: ash, with only a violet cast

const REM_RING = ['#4a4c52', ANIME.silver, ANIME.silverHi];

const REM_TASUKI = ['#2c1a4c', '#6a44b0', '#9a74e0'];

/* ---- skins ---- */
// his face (_shared/face.js): his brother's profile (Kage's is FACE_PROFILES.base). The boy's is soft, a short snub
// nose, a small round chin; the man's is Kage's sharpened, a little longer in the nose and the chin, the brow firmer.
// Lit down the profile in his violet (the echo's a colder violet)
const REM_FACE_YOUNG = { of: 'youth', nose: 0.86, up: 0.04, chin: 0.86, light: '#c8a2ff', depth: 0.1 };

const REM_FACE = { of: 'base', nose: 1.1, brow: 1.3, lip: 0.92, chin: 1.12, jaw: 0.96, light: '#b892ff', depth: 0.1 };

ANIME_SKINS.young_rem = { top: 'gi', feet: 'sandal', sleeve: 0.94, kote: 'wrap', collar: false, sash: 'obi', acc: REM_ACC, rem: 'young', face: REM_FACE_YOUNG };

ANIME_SKINS.rem = { top: 'coat', coat: { w0: 20, w1: 38, fw0: 15, fw1: 28, len: 0.74, plain: true }, feet: 'sandal', wrapShin: true, sleeve: 1, sash: 'obi',
  saya: true, collar: false, kote: true, cuff: false, acc: REM_ACC, rem: 'adult', face: REM_FACE };

ANIME_SKINS.hollow_rem = { top: 'coat', feet: 'sandal', wrapShin: true, sleeve: 1, sash: 'hollow', saya: true, collar: false, kote: 'wrap', rem: 'hollow',
  face: Object.assign({}, REM_FACE, { light: '#9c80ff' }),
  coatPlain: true, hollow: { head: 'rem', top: 'rem', fray: 0.9, robe: { back: [7, 11, 20, 44], flap: [6, 10.4, 15, 28], teeth: 6, rag: 9 } } };

// the band's two long tails, streaming back from the knot (Hollow Rem's are ashen); called from animeCloths
function remCloths(f, sk) {
  if (!sk.rem || f.helmet !== 'headband') return;
  const s = f.scale, h = sk.rem === 'hollow';
  f.cloths.push({ kind: 'scarf', c: new Cloth(11, 7.4 * s, { ph: 9, wind: 950, grav: 520, stiff: 1.8 }), at: 'head', color: h ? REM_BAND_H[1] : REM_BAND[1], rim: h ? 'rgba(10,8,16,0.75)' : 'rgba(14,10,10,0.7)', w: 5 * s, w1: 1.4 * s, dy: -7, dx: 15 });
  f.cloths.push({ kind: 'scarf', c: new Cloth(9, 6.8 * s, { ph: 12.5, wind: 820, grav: 600, stiff: 1.8 }), at: 'head', color: h ? REM_BAND_H[0] : REM_BAND[0], rim: h ? 'rgba(10,8,16,0.75)' : 'rgba(14,10,10,0.7)', w: 4 * s, w1: 1.1 * s, dy: -4, dx: 15 });
}
