/* KAGE — Takashi, the Master's Flow, as an anime master swordsman (anime redesign, ticket 10), from his key art
   (boss_takashi.webp, face_takashi.webp). A main boss: Kage's old master, a calm elderly silhouette, broad and upright,
   the robes doing the talking:
     head      a wide straw kasa (about 5.6 head radii across) tipped forward over the brow, dark straw with gold ribs and a
               gold rim, a long red ribbon from the back of the hat (cloth 'tribbon', two strands). Under it the black face
               with WHITE eyes (the rule), white hair swept back in spiky locks behind the face, a white moustache and a
               long pointed white beard (the beard covers where a mouth would be, so there is still no mouth)
     robes     layered dark plum-black robes: a robe torso with a crossed collar of two gold-edged lapels, a capelet over
               the shoulders edged gold and closed at the chest by a round gold clasp (the Tachibana ring round a dot),
               gold cords swagged from the clasp and a gold tassel under it; a capelet flap over the near shoulder; wide
               kimono sleeves with gold cuffs; long robe skirts to the ankle (cloth 'trobe') with a gold band and gold wave
               embroidery at the hem; a long cape behind him (cloth 'tcape'), gold-edged, gold waves near its hem
     obi       a wide dark obi with gold edges and a gold cord tied in a knot at the front, two gold tassels hanging
     blade     takashi_blade: the plain katana with a gold tsuka wrapped in black diamonds, a gold tsuba, kashira and habaki
   His edge light is gold, as in the key art (skin.rimTint for the outline pass, takashiPal for the rim inside parts).
   Hollow Takashi (hollow_takashi, echoOf takashi) is the same design under the Hollow treatment: the deep near-black
   palette, gold turned to ash-violet, the hair ashen, the kasa's back brim broken off and cracked, one ribbon strand
   gone, the cape, robe skirts and sleeves torn into points, a tear and a glowing crack in the capelet, one obi tassel
   gone. Fighter.draw's glitch, ghost and ash dissolve sit on top.
   All of his cloth is drawn inside the body (silhouette), so the outline, the impact frame and the flat passes carry it.
   Kage can wear the Kasa (trophy helm: the same gold-rimmed kasa over his hair) and the Shinsei Yoroi (the capelet with
   its clasp, cords and shoulder flap over his coat); the common Sugegasa draws the same hat in plain straw.
   Drawing only: no joint, timer or gameplay field is touched, no randomness. */

const TK_GOLD = ['#6e4f1c', '#d0a443', '#f4da8e'];            // trim, ribs, cords, embroidery (TAKASHI_GOLD family)

const TK_GOLD_H = ['#2b2541', '#6a5f98', '#ada2d6'];          // the echo's: gold gone to ash-violet

const TK_ROBE = ['#070407', '#120a10', '#26151f'];            // plum-black robe

const TK_CAPE = ['#060306', '#110910', '#2e1726'];            // the capelet and the long cape, a shade deeper

const TK_INNER = ['#040303', '#0a0808', '#1a1615'];           // the inner kimono under the collar

const TK_STRAW = ['#0c0806', '#1b130d', '#3a2919'];           // the kasa: dark lacquered straw

const TK_STRAW_H = ['#07060b', '#110e18', '#272236'];

const TK_SUGE = ['#2a2216', '#5a4a30', '#8a7650'];            // the common Sugegasa: plain straw

const TK_HAIR = ['#8e887e', '#d6d0c6', '#f2eee6'];            // white hair and beard, never pure white

const TK_HAIR_H = ['#3e3a50', '#7f7996', '#b7b2cc'];          // ash

const TK_RED = ['#4a0910', '#a3172a', '#d8434c'];             // the ribbon

const TK_RED_H = ['#1e1638', '#4a3a86', '#8f80ee'];

/* ---- skins ---- */
ANIME_SKINS.takashi = { top: 'gi', feet: 'sandal', sleeve: 1.18, kote: false, collar: false, cuff: true, cuffTone: TK_GOLD, sash: 'takashi', noGiSash: true,
  takashi: 'boss', rimTint: [226, 170, 70] };

ANIME_SKINS.hollow_takashi = { top: 'gi', feet: 'sandal', sleeve: 1.18, kote: false, collar: false, sash: 'takashi', noGiSash: true, takashi: 'hollow',
  hollow: { fray: 1, robe: {} } };   // `hollow` gives the deep palette and the torn cuffs; the robes and cape are his own

const _tkH = (f) => !!f.hollow;

const _tkG = (f) => (f.hollow ? TK_GOLD_H : TK_GOLD);

// his key art is edge-lit in gold: the fine rim inside his parts follows, and the fabric is plum-black
const _tkPalC = new WeakMap();

function takashiPal(pal) {
  let p = _tkPalC.get(pal);
  if (!p) _tkPalC.set(pal, p = Object.assign({}, pal, { rim: 'rgba(214,160,62,0.5)', acc: TK_GOLD[1], accHi: TK_GOLD[2], fab: TK_ROBE, back: ['#050305', TK_ROBE[0], TK_ROBE[1]], coat: TK_CAPE, coatB: TK_CAPE }));
  return p;
}

// cloth (from animeCloths): the long cape from the shoulders, the robe skirts from the waist, the ribbon from the hat
function takashiCloths(f, sk) {
  if (!sk.takashi) return;
  const s = f.scale, hol = sk.takashi === 'hollow';
  f.cloths.push({ kind: 'tcape', c: new Cloth(10, 13.4 * s, { ph: 1.6, wind: 820, grav: 1100, stiff: 1.93, hang: 0.4 }), at: 'neck', dx: 7, dy: 3, w: 46 });
  f.cloths.push({ kind: 'tcape', far: 1, c: new Cloth(9, 12.6 * s, { ph: 4.3, wind: 1000, grav: 1050, stiff: 1.93, hang: 0.5 }), at: 'neck', dx: 11, dy: 8, w: 34 });
  f.cloths.push({ kind: 'trobe', part: 'back', c: new Cloth(8, 12.8 * s, { ph: 2.2, wind: 340, grav: 1400, stiff: 1.5, hang: 0.3 }), at: 'hip', dx: 5, dy: -4 });
  f.cloths.push({ kind: 'trobe', part: 'flap', c: new Cloth(8, 12.2 * s, { ph: 4.7, wind: 220, grav: 1300, stiff: 1.5, hang: 0.12 }), at: 'hip', dx: 0, dy: -3 });
  f.cloths.push({ kind: 'tribbon', c: new Cloth(11, 7 * s, { ph: 3.1, wind: 1150, grav: 420, stiff: 1.86, hang: 0.6 }), at: 'head', dx: 16, dy: -9, w: 4.4 });
  if (!hol) f.cloths.push({ kind: 'tribbon', c: new Cloth(9, 6.6 * s, { ph: 6.4, wind: 1300, grav: 360, stiff: 1.86, hang: 0.7 }), at: 'head', dx: 17, dy: -7, w: 3.4 });   // the echo lost one
}
