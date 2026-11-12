/* ---- Kage's shadow body: the draw order (see _design.js). Back to front:
     1 the gear's capes, 2 the far arm, 3 the far leg
     4 the coat behind the body: the inner drape between the legs, the long back tail with its cloud hem
     5 the torso (and any shop armour's chest pieces)
     6 the near leg, the coat's front flap over its thigh
     7 the hanging ties, the belt and its knot
     8 the scarf's two tails and the cowl behind the nape
     9 the head: the black face in profile, hair or helmet, the white eye; then the scarf's fold under the jaw
    10 the near arm, the weapon, the fists closed on its grip
   The gear hooks are the shared body's, in the same slots, so every helmet and armour still sits on him. On the flat
   passes (flash, impact frames, afterimages) every part is the one colour: the same silhouette without its light. ---- */
function kageShadowBody(f, ctx, front, flat, opt) {
  // the Armory armour he wears (../armory/): its tones over KS for this draw, its pieces and effects at the hooks below
  const th = kageArmorTheme(f);
  _ksK.th = th;
  if (th) kageArmorTones(th);
  try { _ksBodyDraw(f, ctx, front, flat, opt); } finally { if (th) kageArmorTones(null); _ksK.th = null; }
}

function _ksBodyDraw(f, ctx, front, flat, opt) {
  const sk = f.sk, s = f.scale, b = f.build, fc = f.facing, skin = ANIME_SKINS.kage;
  const A = animeState(f, front, flat, opt), S = animeSpine(f), pal = A.pal;
  const big = b.w >= 16 ? 1.45 : b.w >= 13 ? 1.2 : 1, L = b.w * s * 0.42 * (b.w >= 13 ? 1.15 : 1), T = L * 1.25 * big;
  const U = s * clamp(b.w / 10, 0.9, 1.75) * (b.w >= 13 ? 1.08 : 1);   // the gear overlays' clothing unit
  A.S = S; A.U = U;
  const K = _ksK;
  K.f = f; K.A = A; K.S = S; K.s = s; K.fc = fc; K.t = f.time || 0; K.floor = f.y;
  K.hr = BODY.head * s * b.head * 0.92;
  // the lights: crimson on the edges facing forward and up, tan on the edges facing back
  K.rx = -fc * 0.85; K.ry = 0.52; K.tx = fc; K.ty = -0.12;
  const ov = flat ? { color: front } : opt, armInk = flat ? front : pal.metal[1];
  const wopt = flat ? Object.assign({}, opt, { color: front }) : opt;
  f.headRot = f._ghostHead != null ? f._ghostHead : (f.pose.lean + f.pose.head + f.pose.rot + f.extraRot) * DEG * fc;
  const twoHand = f.pose.ik > 0.5 && IK_OFF[f.shape()] != null;
  // the Mugen Armor's art (../armory/mugen.js): its parts replace the drawn coat panels, belt, scarf and hair
  const art = mugenArtOn(f, K);
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  // 1. the gear behind the body (and an armour's halo)
  kageArmorFx(f, ctx, K, 'back');
  subLayer(f, ctx, A, skin, U, 'back'); subBLayer(f, ctx, A, skin, U, 'back');
  // 2. the far arm (then any off-hand weapon)
  _ksArm(f, ctx, K, sk.shB, sk.bel, sk.bha, true, U);
  if (!twoHand) _ksHand(f, ctx, K, sk.bel, sk.bha, true);
  f.drawOffhand(ctx, front, wopt);
  // 3. the far leg
  _ksLeg(f, ctx, K, sk.hipB, sk.bkn, sk.bft, true);
  // 4. the coat behind the body
  if (!art) _ksDrape(f, ctx, K);
  _ksBackTail(f, ctx, K);
  kageArmorFx(f, ctx, K, 'coat');   // an armour's fire, wisps or sparks off the coat's hem
  // 5. the torso (the default Tachibana guard is not part of this design; any other armour is drawn over the jacket)
  _ksTorso(f, ctx, K);
  if (f.armor !== 'tachibana') drawArmor(ctx, f, armInk, ov, T * 1.25);
  if (art) mugenTasset(f, ctx, K, false);   // the panel over the far thigh
  // 6. the near leg, the gear's skirts, the coat's front flap
  _ksLeg(f, ctx, K, sk.hipF, sk.fkn, sk.fft, false);
  subLayer(f, ctx, A, skin, U, 'front'); subBLayer(f, ctx, A, skin, U, 'front');
  if (art) mugenTasset(f, ctx, K, true); else _ksFlap(f, ctx, K);
  akariLayer(f, ctx, A, skin, U, 'gear');   // the Mei-En Garb's sash, over his coat (bosses/akari/)
  // 7. the waist
  if (art) mugenObi(f, ctx, K); else { _ksTies(f, ctx, K); _ksBelt(f, ctx, K); }
  subLayer(f, ctx, A, skin, U, 'waist'); subBLayer(f, ctx, A, skin, U, 'waist');
  // 8. the scarf: its tails, the neck, the cowl behind the nape
  if (!art) _ksScarfTails(f, ctx, K);
  _ksNeck(f, ctx, K);
  if (!art) _ksScarfWrap(f, ctx, K, false);
  kageArmorHairStrands(f, ctx, K);   // an armour's long hair streaming back (../armory/hair.js); the head covers its roots
  // 9. the head
  ctx.save(); ctx.translate(sk.head.x, sk.head.y); ctx.rotate(f.headRot); ctx.scale(fc, 1);
  if (!art) _ksFace(f, ctx, K);   // (the art's head carries its own face and neck)
  // the Mugen Armor's art brings its own head (the crown, the violet headband and its diamond, as on the card art):
  // it is drawn whatever helmet he has on, and the helmet is not drawn over it (its stats still count)
  if (art) mugenHead(ctx, K.hr);
  else drawHelmet(ctx, f.helmet, K.hr, flat ? front : pal.metal[1], ov, f);
  if (!flat && !opt.noEyes) drawEyes(ctx, f, K.hr, opt);
  ctx.restore();
  // the scarf's fold under the jaw, or the art's high collar, over the bottom of the head's neck as on the card art
  if (art) mugenCollar(f, ctx, K); else _ksScarfWrap(f, ctx, K, true);
  // 10. the near arm, the weapon, the fists over its grip
  _ksArm(f, ctx, K, sk.shF, sk.fel, sk.fha, false, U);
  takashiLayer(f, ctx, A, skin, U, 'over');   // the Shinsei Yoroi's gold clasp and tassel at the throat (bosses/takashi/)
  f.drawMainWeapon(ctx, front, wopt);
  _ksHand(f, ctx, K, sk.fel, sk.fha, false);
  if (twoHand) _ksHand(f, ctx, K, sk.bel, sk.bha, true);
  kageArmorFx(f, ctx, K, 'over');   // an armour's light over the whole figure (the Raikō's crackle)
  ctx.restore();
}
