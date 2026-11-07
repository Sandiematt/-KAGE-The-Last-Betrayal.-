window.forceAb = (id, n, dx) => {
  const s = K.Game.session, e = s.enemy, p = s.player, ai = e.ai;
  if (dx != null) { e.x = p.x + dx; }
  ai.cds = {}; (ai.phases || []).forEach(ph => { ph.abilities = [id]; }); if (ai.phaseData) ai.phaseData.abilities = [id]; ai.abilities = [id];
  let ok = false;
  for (let k = 0; k < 400 && !ok; k++) { const d = Math.abs(e.x - p.x); ok = e.canAct() && ai.tryAbility(p, d, Math.sign(p.x - e.x)); if (!ok) adv(1); }
  const r = adv(n);
  return Object.assign({ id, ok, ab: e.abil && e.abil.label }, r);
};
