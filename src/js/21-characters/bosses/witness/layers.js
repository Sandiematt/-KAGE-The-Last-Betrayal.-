/* ---- layers called from the body (_shared/) ---- */
function witnessLayer(f, ctx, A, skin, U, layer) {
  if (!skin.witness) return;
  if (layer === 'back') { _wtCollarBack(f, ctx, A, U); _wtTails(f, ctx, A, -1); }
  else if (layer === 'front') _wtTails(f, ctx, A, 1);
  else if (layer === 'waist') _wtBelt(f, ctx, A, A.S, U);
  else if (layer === 'core') { if (!f.coreBroken) f.drawCore(ctx, A.flat ? { color: A.col } : A.opt); }   // over the near arm, under the blade
}
