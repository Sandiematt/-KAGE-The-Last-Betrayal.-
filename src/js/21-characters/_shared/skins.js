/* ---- skins: one entry per character design. Each character folder adds its own (`ANIME_SKINS.<id> = {...}` in its
   _skin.js); only the shared fallback lives here ---- */
const ANIME_SKINS = {
  // every other fighter until its own ticket gives it an identity: dark kimono top with wide sleeves over strapped kote,
  // a dark obi, wide split hakama, tabi and sandals
  base: { top: 'gi', feet: 'sandal', sleeve: 1.08, collar: false, kote: true, sash: 'obi' }
};

function animeSkin(f) {
  if (f.kageFrame) return ANIME_SKINS.kage;   // the Witness flickering to Kage's own design (bosses/witness/)
  if (f.isPlayer) return f.armor === 'training' ? ANIME_SKINS.youngKage : ANIME_SKINS.kage;
  const d = f.def;
  return (d && (ANIME_SKINS[d.id] || (d.echoOf && ANIME_SKINS[d.echoOf]))) || ANIME_SKINS.base;
}

// cloth a skin needs (called from the Fighter constructor): the coat's back panel and near flap hang from the waist
function animeCloths(f) {
  const sk = animeSkin(f), s = f.scale;
  if (sk.coat) {
    // to mid-calf: the back panel ~84 px from the waist, the near flap a little shorter (`len` cuts a shorter coat: Rem's)
    const k = sk.coat.len || 1;
    f.cloths.push({ kind: 'coat', part: 'back', c: new Cloth(8, 12 * s * k, { ph: 2.2, wind: 1150, grav: 1000, stiff: 1.5, hang: 0.55 }), at: 'hip', dx: 6, dy: -4 });
    f.cloths.push({ kind: 'coat', part: 'flap', c: new Cloth(7, 11.4 * s * k, { ph: 4.7, wind: 260, grav: 1250, stiff: 1.5, hang: 0.15 }), at: 'hip', dx: 1, dy: -3 });
  }
  kageCloths(f, sk);   // Kage's coat tails and front flap (kage/)
  if (sk.order) orderCloths(f, sk);   // the Order's hood tails and hat cords (enemies/order/)
  if (sk.hollow) hollowCloths(f, sk);   // the Hollows' torn robes, cape and hood tails (enemies/hollow/)
  subCloths(f, sk);   // the sub-bosses' robes, capes, hood tails and cords, by look (sub-bosses/)
  subBCloths(f, sk);   // the later sub-bosses' haori skirts, capes, band tails and hair (sub-bosses/)
  remCloths(f, sk);   // Rem's headband tails (bosses/rem/)
  raikonCloths(f, sk);   // Raikon's cloak and coat skirts (bosses/raikon/)
  akariCloths(f, sk);   // Akari's ponytail, bead strings, sash and tail; the Mei-En Garb's sash on Kage (bosses/akari/)
  takashiCloths(f, sk);   // Takashi's cape, robe skirts and hat ribbon (bosses/takashi/)
  witnessCloths(f, sk);   // Kage's coat panels and scarf tails for the Witness's Kage-flicker (bosses/witness/)
  gearCloths(f, sk);   // the shop gear's hood tails and the Raiun Mantle's streamer (kage/gear/)
}
