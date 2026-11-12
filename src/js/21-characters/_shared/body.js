/* KAGE — the anime samurai body (anime redesign, ticket 02).
   Every fighter is drawn here on its skeleton (`Fighter.sk`) as cel-shaded vector parts: a black face with glowing
   white eyes, a clothed torso, sleeves, hakama legs, boots or sandals, mitten hands on the grip, and (Kage) a long
   charcoal coat with a crimson-embroidered hem. Nothing here moves a joint: the skeleton is gameplay, the art follows it.

   How it is built (so tickets 03 to 12 add a character by adding data, not by rewriting the body):
   - ANIME            the palette tokens of docs/art-reference/STYLE.md.
   - celFill          one part = one closed path, filled base / shadow / highlight with a red rim strip on the far side,
                      or one flat fill on the flat passes (outline, impact frame, flash, glitch ghost, afterimages).
   - part library     animeCapsule (sleeves, hakama, boots), animeTorso (profile tables), animeHand (mitten grip),
                      animeFoot (boot / sandal), animeHeadPath (the face), drawKageHair, coat panels on cloth chains,
                      embroidery motifs (cloudMotif, hemBand).
   - ANIME_SKINS      a skin per character: which top (coat / gi), coat cut, footwear, sleeve width, sash, saya, accent.
                      animeSkin(f) picks one: a fighter def id or echoOf entry, else the player's, else the shared base.
                      A later ticket adds `ANIME_SKINS.<enemy id> = { ... }` and, where a part is new, a part function.
   - animePalette     the fabric tones for a fighter: black fabric for ink bodies, three tones derived from any other
                      body colour (the Order slate, the flickering Hollow violet) so families still read apart. */

/* ---- the body ---- */
Fighter.prototype.silhouette = function (ctx, front, back, flat, opt) {
  const sk = this.sk, s = this.scale, b = this.build, f = this.facing;
  const skin = animeSkin(this);
  if (skin.witness) { witnessBody(this, ctx, front, flat, opt); return; }   // the Witness is its own mesh (bosses/witness/body.js)
  if (skin.kage) { kageBody(this, ctx, front, flat, opt); return; }   // so is Kage (kage/body.js)
  if (skin.akari === 'boss' && AkariArt.on(this) && akariArtBody(this, ctx, front, flat, opt)) return;   // Akari from the user's art (bosses/akari/art.js)
  const A = animeState(this, front, flat, opt), pal = A.pal, ord = skin.order, hol = skin.hollow;
  const big = b.w >= 16 ? 1.45 : b.w >= 13 ? 1.2 : 1;
  const L = b.w * s * 0.42 * (b.w >= 13 ? 1.15 : 1), T = L * 1.25 * big;   // the old limb units: armour overlays are sized by them
  const U = s * clamp(b.w / 10, 0.9, 1.75) * (b.w >= 13 ? 1.08 : 1);       // clothing unit (px per design unit)
  const hr = BODY.head * s * b.head, S = animeSpine(this);
  A.S = S; A.U = U;   // armour parts drawn from drawArmor / drawHelmet (enemies/order/) share the spine frame
  const akari = !!skin.akari, slv = skin.sleeve || 1, boot = skin.feet === 'boot';
  const ov = flat ? { color: front } : opt;
  const fabB = pal.back, fab = pal.fab, coatT = skin.top === 'coat' ? pal.coat : pal.fab;
  const armInk = flat ? front : this.isPlayer ? pal.metal[1] : (pal.armor || front);
  this.headRot = this._ghostHead != null ? this._ghostHead : (this.pose.lean + this.pose.head + this.pose.rot + this.extraRot) * DEG * f;

  // --- 1. the coat's back panel, behind everything
  if (skin.coat) this.drawCoatPanel(ctx, 'back', A, skin, U);
  if (hol) { this.hollowRobe(ctx, A, skin, U, 'cape'); this.hollowRobe(ctx, A, skin, U, 'back'); }   // enemies/hollow/
  subLayer(this, ctx, A, skin, U, 'back');   // capes, banners, robes behind the body (sub-bosses/)
  subBLayer(this, ctx, A, skin, U, 'back');   // sub-bosses/
  raikonLayer(this, ctx, A, skin, U, 'back');   // Raikon's cloak and coat skirt (bosses/raikon/)
  akariLayer(this, ctx, A, skin, U, 'back');   // Akari's ponytail, bead strings and back tail (bosses/akari/)
  takashiLayer(this, ctx, A, skin, U, 'back');   // Takashi's long cape, hat ribbon and back robe skirt (bosses/takashi/)
  // --- 2. the far arm: sleeve, cuff, hand (then any off-hand weapon)
  this.animeArm(ctx, sk.shB, sk.bel, sk.bha, A, skin, U * slv, true);
  this.drawOffhand(ctx, front, flat ? Object.assign({}, opt, { color: front }) : opt);
  // --- 3. the far leg
  this.animeLeg(ctx, sk.hipB, sk.bkn, sk.bft, A, skin, U, true);
  // --- 4. the torso (Akari's fitted top is her garb's own cut, drawArmor 'mei_en': bosses/akari/)
  if (!akari) this.animeTorsoDraw(ctx, S, A, skin, U, coatT);
  if (ord) this.orderKusazuri(ctx, S, A, U, 'back');
  drawArmor(ctx, this, armInk, ov, T * 1.25);
  // --- 5. the near leg, then the coat's near flap over its thigh (the Order: the front kusazuri plates)
  this.animeLeg(ctx, sk.hipF, sk.fkn, sk.fft, A, skin, U, false);
  if (ord) this.orderKusazuri(ctx, S, A, U, 'front');
  subLayer(this, ctx, A, skin, U, 'front');
  subBLayer(this, ctx, A, skin, U, 'front');
  raikonLayer(this, ctx, A, skin, U, 'front');
  akariLayer(this, ctx, A, skin, U, 'front');   // her pink sash (and the Mei-En Garb's on Kage)
  takashiLayer(this, ctx, A, skin, U, 'front');   // Takashi's front robe skirt
  if (skin.coat) this.drawCoatPanel(ctx, 'flap', A, skin, U);
  if (hol) this.hollowRobe(ctx, A, skin, U, 'flap');
  if (!akari) akariLayer(this, ctx, A, skin, U, 'gear');   // the Mei-En Garb's pink sash, over Kage's coat (bosses/akari/)
  // --- 6. sash / obi and the saya at the hip
  if (skin.sash === 'obi' && !akari) this.animeObi(ctx, S, A, U);
  else if (skin.sash === 'order') this.orderBelt(ctx, S, A, U);
  else if (skin.sash === 'raikon') raikonLayer(this, ctx, A, skin, U, 'waist');   // his red obi and ring (bosses/raikon/)
  else if (skin.sash === 'akari') akariLayer(this, ctx, A, skin, U, 'waist');   // her belts, buckle and pouch (bosses/akari/)
  else if (skin.sash === 'takashi') takashiLayer(this, ctx, A, skin, U, 'waist');   // his gold-corded obi and tassels (bosses/takashi/)
  else if (hol) this.hollowSash(ctx, S, A, U, skin.sash);
  if (hol && hol.mantle) this.hollowMantle(ctx, S, A, U, hol.mantle);
  subLayer(this, ctx, A, skin, U, 'waist');
  subBLayer(this, ctx, A, skin, U, 'waist');
  remLayer(this, ctx, A, skin, U, 'waist');   // young Rem's tasuki (bosses/rem/)
  if (this.outfit === 'gi' && !flat && !skin.noGiSash) this.drawSash(ctx, T);
  if (skin.saya && this.hasWeapon) this.animeSaya(ctx, S, A, U);
  // --- 7. neck, collar and scarf wrap
  this.animeNeck(ctx, S, A, skin, U, hr);
  // --- 8. the head: black face, hair or helmet, white eyes
  ctx.save(); ctx.translate(sk.head.x, sk.head.y); ctx.rotate(this.headRot); ctx.scale(f, 1);
  // the profile: brow, nose, lips, chin (face.js); hair, beards and masks are each character's own head.js
  animeFace(this, ctx, A, hr * (akari ? 0.86 : 0.9), skin);
  drawHelmet(ctx, this.helmet, hr, flat ? front : this.isPlayer ? pal.metal[1] : (pal.armor || front), ov, this);
  if (!flat && !opt.noEyes) drawEyes(ctx, this, hr, opt);
  ctx.restore();
  // --- 9. the near arm, the weapon in its hand, and the hands closed over the grip
  this.animeArm(ctx, sk.shF, sk.fel, sk.fha, A, skin, U * slv, false, true);
  takashiLayer(this, ctx, A, skin, U, 'over');   // the Shinsei Yoroi's gold clasp and tassel at the throat (bosses/takashi/)
  if (this.weaponId() === 'iron_fists') this.drawFistGear(ctx);
  this.drawMainWeapon(ctx, front, flat ? Object.assign({}, opt, { color: front }) : opt);
  const grip = this.shape() !== 'none' && this.weaponId() !== 'iron_fists';
  if (grip) {
    this.animeHand(ctx, sk.fel, sk.fha, A, U, false);
    if (this.pose.ik > 0.5 && IK_OFF[this.shape()] != null) this.animeHand(ctx, sk.bel, sk.bha, A, U, true);
  }
};
