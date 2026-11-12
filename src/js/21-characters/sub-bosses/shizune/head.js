SUBB_HEADS.disciple_wrap = function (ctx, key, f, r, ink, flat, A, sv, t, acc, sub, fill, studs, shikoro) {
  // Shizune: dark hair bound at the nape (the ponytail is cloth), a side lock; Kage keeps his own hair under it
  if (f.isPlayer) drawKageHair(ctx, r, ink, flat, f);
  else {
    fill([[-0.24, -0.46], [-1.0, -0.42], [-1.08, 0.36], [-0.78, 0.92, 1], [-0.58, 0.36], [-0.3, 0.02]], A.pal.hair, { sd: r * 0.2, hd: r * 0.05, rim: true });
    // the side lock falls at the temple, in front of the ear (clear of the eye and the profile)
    fill([[0.2, -0.42], [0.34, 0.1], [0.22, 0.7, 1], [0.08, 0.14], [0.0, -0.36]], A.pal.hair, { sd: r * 0.06, rim: true });
    celFill(ctx, () => { ctx.ellipse(-r * 1.08, -r * 0.18, r * 0.3, r * 0.26, 0.3, 0, TAU); }, A.pal.hair, A, { sd: r * 0.1, rim: true });
  }
  // the cotton tenugui pulled over the crown: a folded hem, creases, the school's ring half unpicked
  fill([[0.94, -0.32, 1], [0.88, -0.74], [0.32, -1.12], [-0.5, -1.12], [-1.06, -0.62], [-1.08, -0.22, 1], [-0.4, -0.36], [0.4, -0.42]], COTTON, { sd: r * 0.2, hd: r * 0.05, rim: true, detail: (g) => {
    g.fillStyle = COTTON[0]; g.beginPath(); orderShape(g, r, [[0.94, -0.32, 1], [-1.08, -0.22, 1], [-1.08, -0.36, 1], [-0.4, -0.5], [0.4, -0.56], [0.94, -0.46, 1]]); g.fill();
    g.strokeStyle = 'rgba(60,52,38,0.8)'; g.lineWidth = r * 0.04; g.beginPath();
    g.moveTo(-r * 0.2, -r * 1.06); g.quadraticCurveTo(-r * 0.5, -r * 0.8, -r * 0.92, -r * 0.6); g.moveTo(r * 0.2, -r * 1.02); g.quadraticCurveTo(-r * 0.1, -r * 0.8, -r * 0.4, -r * 0.62); g.stroke();
    g.strokeStyle = '#4e432c'; g.lineWidth = r * 0.06; g.beginPath(); g.arc(r * 0.46, -r * 0.76, r * 0.15, Math.PI * 0.1, Math.PI * 1.5); g.stroke();
    g.fillStyle = '#4e432c'; g.beginPath(); g.arc(r * 0.46, -r * 0.76, r * 0.045, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(78,67,44,0.6)'; g.lineWidth = r * 0.025; g.beginPath(); g.moveTo(r * 0.6, -r * 0.68); g.quadraticCurveTo(r * 0.72, -r * 0.6, r * 0.66, -r * 0.5); g.stroke();
  } });
  // the knot at the back
  fill([[-0.96, -0.66], [-1.32, -0.82, 1], [-1.34, -0.38], [-1.0, -0.3]], COTTON, { sd: r * 0.08, hd: r * 0.03 });
};
