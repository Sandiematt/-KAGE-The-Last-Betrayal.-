/* ---- layers called from the body (_shared/): 'back' behind everything, 'front' over the near leg, 'waist'
   at the sash ---- */
function subLayer(f, ctx, A, skin, U, layer) {
  const arm = f.armor, id = skin.sub;
  if (!id && !SUB_ACC[arm]) return;
  const S = A.S;
  if (layer === 'back') {
    if (arm === 'mist_shroud') f.subShroud(ctx, A, U);
    if (id === 'shiden') f.shidenBanner(ctx, A, S, U);
    if (id === 'hisame') f.hisameTube(ctx, A, S, U);
    if (arm === 'robe') f.subPanel(ctx, A, 'robeB', 26 * U, 58 * U, A.pal.coatB, { back: true, kind: 'robe' });
    if (arm === 'shadow_cloak') f.subPanel(ctx, A, 'haoriB', 24 * U, 36 * U, ASH, { back: true, kind: 'haori' });
  } else if (layer === 'front') {
    if (arm === 'robe') f.subPanel(ctx, A, 'robeF', 19 * U, 36 * U, A.pal.coat, { kind: 'robe' });
    if (arm === 'shadow_cloak') f.subPanel(ctx, A, 'haoriF', 17 * U, 25 * U, ASH, { kind: 'haori' });
    if (arm === 'vanguard_plate') f.subKusazuri(ctx, A, S, U, 'front', { rows: 4, len: 1.05, panels: 3, acc: subTone(SUB_ACC.vanguard_plate)[1] });
    if (arm === 'half_do') f.subKusazuri(ctx, A, S, U, 'front', { rows: 3, len: 1.2, panels: 1, acc: subTone(SUB_ACC.half_do)[1], iron: true, wide: 1.25 });
  } else if (layer === 'waist' && id) f.subBelt(ctx, A, S, U, id);
}

/* ---- layers called from the body (_shared/): 'back' behind everything, 'front' over the near leg, 'waist'
   at the sash ---- */
function subBLayer(f, ctx, A, skin, U, layer) {
  const arm = f.armor, id = skin.sub && SUBB_IDS[skin.sub] ? skin.sub : null;
  if (!id && !SUBB_ACC[arm]) return;
  const S = A.S;
  if (layer === 'back') {
    if (arm === 'tyrant') f.subBPanel(ctx, A, 'tcape', 26 * U, 54 * U, ['#060505', '#0e0c0c', '#1f1b1b'], { kind: 'tyrant' });
    if (arm === 'cloak') f.subBPanel(ctx, A, 'cloak', 22 * U, 46 * U, ['#07060b', '#100e16', '#221e2e'], { kind: 'cloak' });
    if (arm === 'ledger_coat') f.subBPanel(ctx, A, 'ledgerB', 25 * U, 40 * U, A.pal.coatB, { back: true, kind: 'ledger' });
    if (arm === 'conduit_harness') f.moroCanister(ctx, A, S, U);
  } else if (layer === 'front') {
    if (arm === 'ledger_coat') f.subBPanel(ctx, A, 'ledgerF', 18 * U, 27 * U, A.pal.coat, { kind: 'ledger' });
    if (arm === 'gate_plate') f.subKusazuri(ctx, A, S, U, 'front', { rows: 3, len: 1.15, panels: 3, acc: _subbAcc(f, arm)[0], iron: true, wide: 1.2 });
    if (arm === 'pauldrons') f.subKusazuri(ctx, A, S, U, 'front', { rows: 4, len: 1.1, panels: 3, acc: _subbAcc(f, arm)[1] });
    if (arm === 'tyrant') f.subKusazuri(ctx, A, S, U, 'front', { rows: 3, len: 1.2, panels: 3, acc: _subbAcc(f, arm)[1], iron: true, wide: 1.15 });
  } else if (layer === 'waist' && id) f.subBBelt(ctx, A, S, U, id);
}
