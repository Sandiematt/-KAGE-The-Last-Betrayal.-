/* ---- the torso overlays (drawArmor) ---- */
function drawSubArmor(ctx, f, key) {
  const A = f._A;
  const S = A.S, U = A.U, P = _sP(S, U), acc = subTone(SUB_ACC[key]), skin = animeSkin(f);
  const part = SUB_ARMORS[key];   // each look is drawn in its wearer's folder (sub-bosses/<name>/torso.js)
  if (part) part(ctx, f, key, A, S, U, P, acc, skin);
}

/* ---- the torso overlays (drawArmor) ---- */
function drawSubBArmor(ctx, f, key) {
  const A = f._A;
  const S = A.S, U = A.U, P = _sP(S, U), acc = _subbAcc(f, key), skin = animeSkin(f), t = f.time || 0;
  const coat = skin.top === 'coat';
  const part = SUBB_ARMORS[key];   // each look is drawn in its wearer's folder (sub-bosses/<name>/torso.js)
  if (part) part(ctx, f, key, A, S, U, P, acc, skin, t, coat);
}
