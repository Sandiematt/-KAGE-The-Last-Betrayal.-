/* ---- layers called from the body (_shared/) ---- */
function takashiLayer(f, ctx, A, skin, U, layer) {
  if (layer === 'over') { takashiClasp(f, ctx, A); if (skin.takashi) takashiTitanArmor(f, ctx, A, U, 'over'); return; }   // also Kage in the Shinsei Yoroi
  if (!skin.takashi) return;
  if (layer === 'back') { _tkCape(f, ctx, A, U); _tkRibbons(f, ctx, A); _tkSkirt(f, ctx, A, U, 'back'); }
  else if (layer === 'front') { _tkSkirt(f, ctx, A, U, 'flap'); takashiTitanArmor(f, ctx, A, U, 'body'); }   // the Yashiro Titan's armour (titan-armor.js)
  else if (layer === 'waist') _tkObi(f, ctx, A, A.S, U);
}
