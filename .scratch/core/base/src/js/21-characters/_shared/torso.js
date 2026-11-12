// the torso: a profile table [u along the spine 0 hip .. 1 neck, w across in clothing units] for the front and back
const ANIME_TORSO = {
  coat: { front: [[-0.14, 11.8], [0.1, 11], [0.34, 10.2], [0.6, 12.2], [0.8, 13.6], [0.93, 12], [1.02, 6.6], [1.07, 3.8]],
          back: [[1.07, -5.4], [0.97, -13.4], [0.8, -14.2], [0.55, -11.6], [0.3, -11.2], [0.06, -12.6], [-0.14, -12.6]] },
  gi:   { front: [[-0.14, 11.6], [0.1, 11], [0.36, 10.4], [0.62, 11.8], [0.82, 13], [0.95, 11], [1.03, 6.2], [1.07, 3.6]],
          back: [[1.07, -5.2], [0.97, -13], [0.8, -13.8], [0.54, -11.4], [0.28, -11.4], [0.04, -12.8], [-0.14, -12.8]] }
};

const _atp = new Float32Array(40);

// spine frame shared by the torso parts: P(u, w) = hip + u * spine + w * front normal (w in px)
function animeSpine(f) {
  const sk = f.sk, hx = sk.hip.x, hy = sk.hip.y, dx = sk.neck.x - hx, dy = sk.neck.y - hy, T = Math.hypot(dx, dy) || 1;
  const S = f._spine || (f._spine = {});
  S.hx = hx; S.hy = hy; S.dx = dx; S.dy = dy; S.T = T; S.nx = -dy / T * f.facing; S.ny = dx / T * f.facing;
  S.ux = dx / T; S.uy = dy / T;
  return S;
}

function spX(S, u, w) { return S.hx + S.dx * u + S.nx * w; }

function spY(S, u, w) { return S.hy + S.dy * u + S.ny * w; }

function animeTorso(ctx, S, prof, U) {
  let k = 0;
  for (const [u, w] of prof.front) { _atp[k++] = spX(S, u, w * U); _atp[k++] = spY(S, u, w * U); }
  for (const [u, w] of prof.back) { _atp[k++] = spX(S, u, w * U); _atp[k++] = spY(S, u, w * U); }
  const n = k / 2;
  ctx.moveTo((_atp[0] + _atp[2]) / 2, (_atp[1] + _atp[3]) / 2);
  for (let i = 1; i <= n; i++) {
    const c = (i % n) * 2, nx = ((i + 1) % n) * 2;
    ctx.quadraticCurveTo(_atp[c], _atp[c + 1], (_atp[c] + _atp[nx]) / 2, (_atp[c + 1] + _atp[nx + 1]) / 2);
  }
  ctx.closePath();
}

Fighter.prototype.animeTorsoDraw = function (ctx, S, A, skin, U, tone) {
  const pal = A.pal, coat = skin.top === 'coat';
  const P = (u, w) => [spX(S, u, w * U), spY(S, u, w * U)];
  celFill(ctx, () => animeTorso(ctx, S, coat ? ANIME_TORSO.coat : ANIME_TORSO.gi, U), tone, A, { sd: 7.5 * U, hd: 1 * U, rim: true, detail: (g) => {
    const line = (pts, col, w) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); };
    const poly = (pts, col) => { g.fillStyle = col; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); };
    if (coat && (skin.rem || skin.raikon)) return;   // Rem's travel coat and Raikon's armoured coat draw their own fronts (drawArmor)
    if (coat) {
      // the open front: the black inner kimono between the coat's lapel and the chest, its own crossed collar
      poly([P(1.06, 1.2), P(1.06, 12), P(0.1, 12), P(0.12, 5.6), P(0.62, 4.2)], pal.fab[1]);
      line([P(1.0, 3.2), P(0.66, 7.4)], pal.fab[2], 1.1 * A.s);
      line([P(0.96, 5.6), P(0.72, 8.6)], pal.fab[0], 1 * A.s);
      // the coat's lapel edge catching the light, and a crimson piping inside it
      line([P(1.06, 1.2), P(0.62, 4.2), P(0.12, 5.6)], pal.coat[2], 1.5 * U);
      line([P(1.02, 2.4), P(0.62, 5.2), P(0.14, 6.6)], pal.acc, 0.8 * U);
      // folds from the armpit and an embroidered cloud crest on the back
      line([P(0.8, -2.5), P(0.5, -4), P(0.3, -3.2)], pal.coat[0], 1 * A.s);
      cloudMotif(g, P(0.66, -6.6)[0], P(0.66, -6.6)[1], 2.6 * U, 0.3, pal.acc, 1 * U);
    } else {
      // the kimono's crossed collar and a fold
      line([P(1.04, 0.5), P(0.62, 6.6), P(0.3, 8.6)], pal.fab[2], 1.4 * U);
      line([P(1.0, 4.4), P(0.74, 8.4)], pal.fab[0], 1 * A.s);
      line([P(0.8, -2.5), P(0.5, -4), P(0.3, -3.2)], pal.fab[0], 1 * A.s);
    }
  } });
};
