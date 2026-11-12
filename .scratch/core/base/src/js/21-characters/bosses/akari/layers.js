/* ---- layers called from the body (_shared/) ---- */
function akariLayer(f, ctx, A, skin, U, layer) {
  if (layer === 'back') {
    if (!skin.akari) return;
    _akTail(f, ctx, A, U);
    const r = BODY.head * f.scale * f.build.head;
    for (const cl of f.cloths) if (cl.kind === 'ahair' && !cl.main) _akHairLock(f, ctx, A, cl, r, false);
    for (const cl of f.cloths) if (cl.kind === 'ahair' && cl.main) _akHairLock(f, ctx, A, cl, r, true);
    _akRibbons(f, ctx, A);
  } else if (layer === 'front') {
    if (skin.akari) _akSash(f, ctx, A, U);
  } else if (layer === 'gear') {
    if (f.armor === 'mei_en') _akSash(f, ctx, A, U);
  } else if (layer === 'waist') {
    if (skin.akari) _akBelt(f, ctx, A, A.S, U);
  }
}
