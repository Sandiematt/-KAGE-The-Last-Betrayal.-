/* ---- layers called from the body (_shared/) ---- */
function raikonLayer(f, ctx, A, skin, U, layer) {
  if (!skin.raikon) return;
  if (layer === 'back') { _raiCloak(f, ctx, A); _raiSkirt(f, ctx, A, U, 'back'); }
  else if (layer === 'front') _raiSkirt(f, ctx, A, U, 'flap');
  else if (layer === 'waist') _raiSash(f, ctx, A, A.S, U);
}
