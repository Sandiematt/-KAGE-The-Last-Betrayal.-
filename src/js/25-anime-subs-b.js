/* KAGE — the Act II / III sub-bosses and the Echo placeholders as anime samurai (anime redesign, ticket 06).
   Same rule as everyone: a black face with white eyes, near-black layered cloth, dark metal, a fine red rim. Each keeps
   its own accent (its ENEMIES `accent`), weapon and title, and reads apart by silhouette at gameplay zoom:
     kasane   the Ledger Warden: swept-back hair tied short under a hachigane (an iron brow plate engraved with a struck
              ledger entry, violet band tails), a knee-length haori shingled with pasted ledger pages, some struck through
              in violet, a bound ledger at the hip, a kusarigama whose chain hangs from the butt
     gonryu   the Gate Warden: a tetsu kabuto with a ribbed iron bowl, a deep laced shikoro and great gold kuwagata over an
              iron menpō; a flat-fronted dō built like the Fortress door (iron boards, straps, gold gate studs and the
              kannuki bar across it), one huge studded sode, a rope belt with a gate-knocker ring; a studded iron kanabo
     shizune  the First Disciple: a dull cotton tenugui knotted over her bound hair (the Tachibana ring half unpicked), a
              long ponytail, a fitted leather kawa-dō laced pale gold over her training gi, a plain brown obi, a katana
              with a pale-gold wrap and the school ring on its tsuba
     moro     the Conduit Warden: a close hood under an iron brow plate with two short horns and a dark oni menpō cracked
              with violet light, a conduit tube from the hood into a canister on his back, a leather harness coiled with
              glowing glass tubes; a naginata with a conduit running up its shaft
     soma     the Silent Blademaster: a tall mokushi kabuto with a straight pale-gold blade crest laid across the brow, a wide
              swept shikoro and a closed menpō bound shut with a gold cord (the oath); a full dō and two great ō-sode laced
              gold; an odachi with a paper seal round its grip
     echo_sentinel / echo_warden (the placeholders): a violet-lit oni. The sentinel is light: a hood, a full oni mask with
              long swept horns, a long ragged cloak and violet crescents. The warden is heavy: a spiked oni kabuto with long
              horns and a fanged menpō, a heavy dō with spiked sode and a great torn cape, a violet-edged cutter blade
   Every helmet and armour look here is also gear Kage can wear (hachigane, tetsu_kabuto, oni_menpo, deshi_tenugui,
   mokushi_kabuto; kasane_haori, tetsumon_do, kudamaki_do, kawa_do, o_sode, goka_yoroi / kurokumo_yoroi): the parts are
   drawn per look, so they sit on his body the same way, over his own hair and coat. Drawing only: nothing here moves a
   joint or touches gameplay. */

// each look's own accent (on Kage, or on anyone without one of their own)
const SUBB_ACC = { storm_band: '#7fb8ff', ledger_coat: '#b48ae6', iron_kabuto: '#c9a45c', gate_plate: '#c9a45c', disciple_wrap: '#d9c08a', jerkin: '#d9c08a',
  oni_mask: '#d24a3c', conduit_harness: '#9b7cff', blademaster_kabuto: '#e8c25c', pauldrons: '#c9a45c', tyrant: '#d24a3c', cloak: '#9b8cff', oni: '#9b8cff' };
const SUBB_IDS = { kasane: 1, gonryu: 1, shizune: 1, moro: 1, soma: 1, echo_sentinel: 1, echo_warden: 1 };
const LEATHER = ['#0c0907', '#18110d', '#30241b'];
const LEDGER = ['#2e2b25', '#4a463c', '#6b6555'];        // pasted ledger pages: aged paper in shadow, never white
const COTTON = ['#6d6656', '#9e957e', '#c2b89c'];        // Shizune's tenugui: dull cotton
const GOLDM = ['#4a3c1e', '#8a7440', '#c9a45c'];          // dull gold fittings (gate studs, lacing knots)
const VIOLET_LACQ = ['#09070d', '#141020', '#2b2340'];    // Moro's and the echoes' violet-black lacquer
const CROWN_GOLD = ['#5c4a24', '#a8893f', '#e0c27a'];
const PALE_GOLD = ['#6e5a2a', '#c9a957', '#f0d890'];
function _subbAcc(f, key) { const sk = f ? animeSkin(f) : null; return subTone((sk && sk.sub && sk.acc) || SUBB_ACC[key] || '#b02a31'); }

/* ---- skins ---- */
ANIME_SKINS.kasane = { top: 'gi', feet: 'sandal', sleeve: 1.1, kote: true, collar: false, wrapShin: true, acc: '#b48ae6', sub: 'kasane' };
ANIME_SKINS.gonryu = { top: 'gi', feet: 'sandal', sleeve: 1.12, kote: true, collar: false, suneate: true, acc: '#c9a45c', sub: 'gonryu' };
ANIME_SKINS.shizune = { top: 'gi', feet: 'sandal', sleeve: 0.94, kote: false, collar: false, saya: true, noGiSash: true, acc: '#d9c08a', sub: 'shizune' };
ANIME_SKINS.moro = { top: 'gi', feet: 'sandal', sleeve: 0.96, kote: true, collar: false, wrapShin: true, acc: '#9b7cff', sub: 'moro' };
ANIME_SKINS.soma = { top: 'gi', feet: 'sandal', sleeve: 1.06, kote: true, collar: false, suneate: true, saya: true, acc: '#e8c25c', sub: 'soma' };
ANIME_SKINS.echo_sentinel = { top: 'gi', feet: 'sandal', sleeve: 0.9, kote: true, collar: false, wrapShin: true, acc: '#9b8cff', sub: 'echo_sentinel' };
ANIME_SKINS.echo_warden = { top: 'gi', feet: 'sandal', sleeve: 1.04, kote: true, collar: false, suneate: true, acc: '#9b8cff', sub: 'echo_warden' };

// cloth for the looks (from animeCloths): haori skirts, capes, band tails, hair. By look, so Kage wearing the gear gets
// the same cloth; haori skirts only under a gi (Kage's own coat already hangs there).
function subBCloths(f, sk) {
  const s = f.scale, coat = sk.top === 'coat', add = (o) => f.cloths.push(Object.assign({ kind: 'subb' }, o));
  if (f.armor === 'ledger_coat' && !coat) {
    add({ part: 'ledgerB', c: new Cloth(7, 10.6 * s, { ph: 2.6, wind: 1050, grav: 1150, stiff: 1.5, hang: 0.55 }), at: 'hip', dx: 6, dy: -4 });
    add({ part: 'ledgerF', c: new Cloth(6, 10.2 * s, { ph: 5.1, wind: 240, grav: 1300, stiff: 1.5, hang: 0.15 }), at: 'hip', dx: 1, dy: -3 });
  }
  if (f.armor === 'cloak') add({ part: 'cloak', c: new Cloth(10, 12.6 * s, { ph: 1.4, wind: 1500, grav: 900, stiff: 1.4, hang: 0.6 }), at: 'sh', dx: 10, dy: 2 });
  if (f.armor === 'tyrant') add({ part: 'tcape', c: new Cloth(10, 13 * s, { ph: 1, wind: 1250, grav: 1000, stiff: 1.45, hang: 0.6 }), at: 'sh', dx: 10, dy: 2 });
  const acc = _subbAcc(f, f.helmet);
  if (f.helmet === 'storm_band') {
    // the hachigane's band tails, knotted at the back of the head
    f.cloths.push({ kind: 'scarf', c: new Cloth(8, 7 * s, { ph: 4, wind: 820, grav: 650, stiff: 1.8 }), at: 'head', color: acc[1], rim: 'rgba(10,8,14,0.8)', w: 3.6 * s, w1: 1.4 * s, dy: -7, dx: 16 });
    f.cloths.push({ kind: 'scarf', c: new Cloth(6, 6.4 * s, { ph: 7.5, wind: 700, grav: 760, stiff: 1.8 }), at: 'head', color: acc[0], rim: 'rgba(10,8,14,0.8)', w: 3 * s, w1: 1.2 * s, dy: -5, dx: 16 });
  }
  if (f.helmet === 'disciple_wrap') {
    if (sk.sub === 'shizune') f.cloths.push({ kind: 'scarf', c: new Cloth(9, 7.2 * s, { ph: 2.2, wind: 700, grav: 760, stiff: 1.75 }), at: 'head', color: '#0c0a0a', rim: 'rgba(120,96,60,0.45)', w: 6.4 * s, w1: 1.6 * s, dy: -2, dx: 18 });
    f.cloths.push({ kind: 'scarf', c: new Cloth(7, 6.6 * s, { ph: 9, wind: 760, grav: 700, stiff: 1.8 }), at: 'head', color: COTTON[1], rim: 'rgba(16,12,8,0.75)', w: 3.8 * s, w1: 2.4 * s, dy: -7, dx: 17 });
    f.cloths.push({ kind: 'scarf', c: new Cloth(5, 6 * s, { ph: 12, wind: 640, grav: 800, stiff: 1.8 }), at: 'head', color: COTTON[0], rim: 'rgba(16,12,8,0.75)', w: 3.2 * s, w1: 2 * s, dy: -5, dx: 17 });
  }
  if (f.helmet === 'blademaster_kabuto') {
    // the agemaki cords at the back of the kabuto, and the end of the oath cord
    f.cloths.push({ kind: 'scarf', c: new Cloth(5, 5.6 * s, { ph: 6, wind: 420, grav: 1000, stiff: 1.6 }), at: 'head', color: acc[1], w: 2.4 * s, w1: 3.4 * s, dy: 0, dx: 22 });
    f.cloths.push({ kind: 'scarf', c: new Cloth(4, 5.2 * s, { ph: 8.2, wind: 380, grav: 1050, stiff: 1.6 }), at: 'head', color: acc[0], w: 2 * s, w1: 3 * s, dy: 3, dx: 21 });
  }
  if (sk.sub === 'echo_sentinel') {
    // the hood's two long torn tails
    f.cloths.push({ kind: 'scarf', c: new Cloth(9, 7.4 * s, { ph: 3.5, wind: 1000, grav: 620, stiff: 1.8 }), at: 'head', color: '#0d0a14', rim: 'rgba(130,104,230,0.7)', w: 8 * s, w1: 2 * s, dy: 2, dx: 14 });
  }
}

/* ---- layers called from the body (21-anime-body.js): 'back' behind everything, 'front' over the near leg, 'waist'
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

/* ---- cloth panels: the ledger haori skirts, the cloak, the warden's cape ---- */
Fighter.prototype.subBPanel = function (ctx, A, part, w0, w1, tone, o) {
  const cl = this.cloths.find(c => c.kind === 'subb' && c.part === part);
  if (!cl || !cl.c.init) return;
  const floorY = this.y + 2 * A.s, n = coatEdges(cl, w0, w1, floorY), U = A.U, f = this.facing;
  const acc = _subbAcc(this, this.armor), torn = o.kind !== 'ledger';
  const path = torn ? () => tornPanelPath(ctx, n, o.kind === 'tyrant' ? 7 : 9, (o.kind === 'tyrant' ? 9 : 7) * U, o.kind === 'tyrant' ? 3 : 1, floorY) : () => coatPanelPath(ctx, n);
  celFill(ctx, path, tone, A, { sd: (o.back || torn ? 7 : 5) * U, hd: o.back || torn ? 0 : 0.9 * U, rim: true, detail: (g) => {
    _panelFolds(g, n, o.back || torn ? ANIME.cloth0 : tone[0], 1 * A.s, torn ? [0.25, 0.5, 0.76] : [0.4, 0.72]);
    const front = (_cpL[0] - _cpR[0]) * f > 0 ? _cpL : _cpR;
    if (o.kind === 'ledger') {
      // shingled rows of pasted ledger pages up from the hem, ruled with ink, a few struck through in violet
      for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) {
        const i = n - 1.3 - r * 0.85, t = (k + (r % 2) * 0.5 + 0.2) / 4.2;
        if (t > 0.96) continue;
        const p = _panelAt(n, i, t), q = _panelAt(n, i, t + 0.2), b = _panelAt(n, i + 0.75, t), c = _panelAt(n, i + 0.75, t + 0.2);
        g.fillStyle = (r + k) % 2 ? LEDGER[1] : LEDGER[0]; g.beginPath(); _poly(g, [p, q, c, b]); g.fill();
        g.strokeStyle = ANIME.outline; g.lineWidth = 0.9 * A.s; g.stroke();
        g.strokeStyle = 'rgba(8,7,8,0.7)'; g.lineWidth = 0.6 * A.s; g.beginPath();
        for (const v of [0.3, 0.55]) { g.moveTo(lerp(p[0], b[0], v) + (q[0] - p[0]) * 0.15, lerp(p[1], b[1], v) + (q[1] - p[1]) * 0.15); g.lineTo(lerp(q[0], c[0], v) - (q[0] - p[0]) * 0.15, lerp(q[1], c[1], v) - (q[1] - p[1]) * 0.15); }
        g.stroke();
        if ((r * 4 + k) % 3 === 1) _strokePts(g, [[p[0], lerp(p[1], b[1], 0.7)], [q[0], lerp(q[1], c[1], 0.25)]], acc[2], 1 * U);
      }
      _hemLine(g, n, 2 * U, acc[0], 3 * U);
      g.strokeStyle = acc[1]; g.lineWidth = 1.1 * U; g.beginPath(); g.moveTo(front[2], front[3]); for (let i = 2; i < n; i++) g.lineTo(front[i * 2], front[i * 2 + 1]); g.stroke();
    } else if (o.kind === 'cloak') {
      // the echo's cloak: a violet-lit band near the torn hem, faint memory script along it
      _hemLine(g, n, 9 * U, '#1a1530', 3 * U);
      _hemLine(g, n, 11 * U, acc[0], 0.9 * U);
      g.fillStyle = 'rgba(185,165,255,0.35)';
      for (let k = 0; k < 7; k++) { const p = _panelAt(n, n - 2.1, 0.1 + k * 0.13); g.fillRect(p[0] - 0.6 * A.s, p[1] - 1.6 * A.s, 1.2 * A.s, 3.2 * A.s); }
    } else {
      // the warden's cape: black, bleeding to the accent at its ragged hem, a lining edge and a crest high on its back
      _hemLine(g, n, 7 * U, f > 0 ? '#16101c' : '#16101c', 6 * U);
      _hemLine(g, n, 10.5 * U, acc[0], 1 * U);
      g.strokeStyle = acc[0]; g.lineWidth = 1.6 * U; g.beginPath(); g.moveTo(front[2], front[3]); for (let i = 2; i < n; i++) g.lineTo(front[i * 2], front[i * 2 + 1]); g.stroke();
      const c = _panelAt(n, 1.6, 0.5); g.strokeStyle = acc[1]; g.lineWidth = 1.2 * U;
      g.beginPath(); g.arc(c[0], c[1], 4 * U, 0, TAU); g.moveTo(c[0] - 2.6 * U, c[1]); g.lineTo(c[0] + 2.6 * U, c[1]); g.moveTo(c[0], c[1] - 2.6 * U); g.lineTo(c[0], c[1] + 2.6 * U); g.stroke();
    }
  } });
};
// Moro's canister on his back: a lacquered drum strapped high, a window of violet memory light, a tube to his hood
Fighter.prototype.moroCanister = function (ctx, A, S, U) {
  const P = _sP(S, U), Pt = _sPt(S, U), acc = _subbAcc(this, 'conduit_harness'), t = this.time || 0;
  const a = Pt(0.88, -14), b = Pt(0.45, -15);
  celFill(ctx, () => animeCapsule(ctx, a, b, 5.4 * U, 5.4 * U, 0, 0.5), VIOLET_LACQ, A, { sd: 2.6 * U, hd: 0.8 * U, rim: true, detail: (g) => {
    for (const k of [0.12, 0.88]) { const p = P(lerp(0.88, 0.45, k), -9), q = P(lerp(0.88, 0.45, k), -20); _strokePts(g, [p, q], SUB_IRON[2], 1.4 * U); }
    if (!A.flat) {
      const glow = 0.5 + 0.35 * Math.sin(t * 5);
      g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(155,124,255,${glow})`;
      g.beginPath(); _poly(g, [P(0.78, -12.6), P(0.78, -17.4), P(0.55, -17.4), P(0.55, -12.6)]); g.fill();
      g.globalCompositeOperation = 'source-over';
    }
  } });
  if (A.flat) return;
  // the tube from the canister's cap up into the hood
  const c0 = P(0.9, -15), c1 = P(1.18, -12), sk = this.sk, h = [lerp(sk.neck.x, sk.head.x, 0.7) - S.nx * 7 * U, lerp(sk.neck.y, sk.head.y, 0.7) - S.ny * 7 * U];
  ctx.lineCap = 'round';
  for (const [col, w] of [[ANIME.outline, 3.6], ['#2a2433', 2.4]]) { ctx.strokeStyle = col; ctx.lineWidth = w * U; ctx.beginPath(); ctx.moveTo(c0[0], c0[1]); ctx.quadraticCurveTo(c1[0], c1[1], h[0], h[1]); ctx.stroke(); }
  ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(185,150,255,${0.45 + 0.3 * Math.sin(t * 6)})`; ctx.lineWidth = 1.1 * U;
  ctx.beginPath(); ctx.moveTo(c0[0], c0[1]); ctx.quadraticCurveTo(c1[0], c1[1], h[0], h[1]); ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
  void acc;
};

/* ---- belts ---- */
Fighter.prototype.subBBelt = function (ctx, A, S, U, id) {
  const P = _sP(S, U), acc = subTone(animeSkin(this).acc);
  const band = (u0, u1, wb, wf) => () => _poly(ctx, [P(u0, -wb), P(u0, wf), P(u1, wf), P(u1, -wb)]);
  const spec = { kasane: [0.02, 0.15, 12.4, 12], gonryu: [-0.03, 0.17, 16, 15.6], shizune: [0.01, 0.16, 11.6, 11.2], moro: [0.02, 0.14, 12, 11.6], soma: [0.0, 0.16, 13.4, 13], echo_sentinel: [0.02, 0.14, 11.6, 11.2], echo_warden: [0.0, 0.16, 14.4, 14] }[id];
  if (!spec) return;
  const [u0, u1, wb, wf] = spec;
  const tone = id === 'shizune' ? ['#1d1912', '#3c3428', '#5a4f3c'] : id === 'moro' ? LEATHER : id === 'gonryu' ? ['#120f0a', '#221c13', '#3d3222'] : [ANIME.cloth0, '#121012', '#29252a'];
  celFill(ctx, band(u0, u1, wb, wf), tone, A, { sd: 2.6 * U, hd: 0.6 * U, detail: (g) => {
    if (id === 'gonryu') {
      // a thick twisted rope: diagonal twists, a dull gold cord through it
      g.strokeStyle = tone[0]; g.lineWidth = 1.2 * U; g.beginPath();
      for (let w = -wb + 2; w < wf; w += 3.4) { const a = P(u0, w), b = P(u1, w + 2.6); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
      g.stroke();
      g.strokeStyle = tone[2]; g.lineWidth = 0.6 * A.s; g.beginPath();
      for (let w = -wb + 3; w < wf; w += 3.4) { const a = P(u0 + 0.02, w), b = P(u1 - 0.02, w + 2); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
      g.stroke();
      return;
    }
    g.strokeStyle = id === 'shizune' ? '#6e6148' : acc[1]; g.lineWidth = (id === 'shizune' ? 0.8 : 1) * U; g.beginPath();
    for (const u of [u0 + 0.025, u1 - 0.025]) { const a = P(u, -wb), b = P(u, wf); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
    g.stroke();
  } });
  if (A.flat) return;
  if (id === 'kasane') {
    // the ledger at the hip: a bound book on a cord, its stitched spine violet, its page edges pale
    const top = P(0.0, 6);
    ctx.save(); ctx.translate(top[0], top[1]); ctx.rotate(0.08 * Math.sin(this.time * 1.6));
    _strokePts(ctx, [[0, 0], [0, 3 * U]], acc[1], 1 * U);
    celFill(ctx, () => ctx.rect(-4.6 * U, 3 * U, 9.2 * U, 11.6 * U), ['#0a0810', '#18121f', '#2d2438'], A, { sd: 1.6 * U, hd: 0.6 * U, detail: (g) => {
      g.fillStyle = LEDGER[2]; g.fillRect(3.2 * U, 3.6 * U, 1.2 * U, 10.4 * U);
      g.strokeStyle = acc[1]; g.lineWidth = 0.8 * U; g.beginPath(); for (let k = 0; k < 4; k++) { const y = (5 + k * 2.8) * U; g.moveTo(-4.6 * U, y); g.lineTo(-3 * U, y); } g.stroke();
      g.strokeStyle = acc[0]; g.lineWidth = 0.9 * U; g.beginPath(); g.moveTo(-1.4 * U, 6 * U); g.lineTo(1.8 * U, 6 * U); g.moveTo(-1.4 * U, 8 * U); g.lineTo(1.2 * U, 8 * U); g.stroke();
    } });
    ctx.restore();
  } else if (id === 'gonryu') {
    // the gate-knocker ring hanging at the front of the rope belt, on a gold boss
    const c = P(0.07, wf - 3.5), r = 4.4 * U;
    ctx.strokeStyle = ANIME.outline; ctx.lineWidth = 3.6 * U; ctx.beginPath(); ctx.arc(c[0], c[1] + r, r, 0, TAU); ctx.stroke();
    ctx.strokeStyle = GOLDM[1]; ctx.lineWidth = 2 * U; ctx.beginPath(); ctx.arc(c[0], c[1] + r, r, 0, TAU); ctx.stroke();
    ctx.strokeStyle = GOLDM[2]; ctx.lineWidth = 0.8 * U; ctx.beginPath(); ctx.arc(c[0], c[1] + r, r, Math.PI * 1.1, Math.PI * 1.7); ctx.stroke();
    ctx.fillStyle = ANIME.outline; ctx.beginPath(); ctx.arc(c[0], c[1], 2.8 * U, 0, TAU); ctx.fill();
    ctx.fillStyle = GOLDM[1]; ctx.beginPath(); ctx.arc(c[0], c[1], 2 * U, 0, TAU); ctx.fill();
  } else if (id === 'shizune') {
    // the obi knot at the front, plain, tied the way the school ties it
    const k = P(0.085, wf - 1);
    ctx.fillStyle = '#2b251c'; ctx.beginPath(); ctx.ellipse(k[0], k[1], 2.6 * U, 3.4 * U, Math.atan2(S.dy, S.dx), 0, TAU); ctx.fill();
    ctx.strokeStyle = '#6e6148'; ctx.lineWidth = 0.8 * U; ctx.stroke();
  } else if (id === 'moro') {
    // a pouch and a glass vial of memory light at the hip
    const a = P(0.02, -8), b = P(0.02, -2), c = P(-0.17, -2), d = P(-0.17, -8);
    celFill(ctx, () => _poly(ctx, [a, b, c, d]), LEATHER, A, { sd: 1.4 * U, hd: 0.5 * U });
    const v = P(0.02, 3);
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(160,130,255,${0.5 + 0.3 * Math.sin(this.time * 5)})`; ctx.fillRect(v[0] - 1 * U, v[1] - 1 * U, 2 * U, 5 * U); ctx.globalCompositeOperation = 'source-over';
  } else {
    const k = P((u0 + u1) / 2, wf - 2.4);
    ctx.fillStyle = acc[2]; ctx.beginPath(); ctx.arc(k[0], k[1], 1.5 * U, 0, TAU); ctx.fill();
  }
};

/* ---- shoulder plates per armour look (called from animeArm) ---- */
function subBSode(f, ctx, sh, el, A, U, far) {
  const k = f.armor;
  const spec = k === 'gate_plate' ? (far ? null : { size: 1.45, rows: 4, tone: SUB_IRON, studs: true, square: true })
    : k === 'pauldrons' ? { size: 1.32, rows: 5, tone: SUB_LACQ, square: true }
    : k === 'tyrant' ? { size: 1.1, rows: 3, tone: SUB_IRON, spikes: true, stack: true }
    : k === 'jerkin' ? (far ? null : { size: 0.66, rows: 2, tone: LEATHER }) : null;
  if (!spec) return;
  const S = A.S, acc = _subbAcc(f, k), size = spec.size;
  let ax = el.x - sh.x, ay = el.y - sh.y; const al = Math.hypot(ax, ay) || 1; ax /= al; ay /= al;
  let dx = ax * 0.45 - S.ux * 0.55, dy = ay * 0.45 - S.uy * 0.55; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
  const lace = k === 'gate_plate' ? acc[0] : acc[1];
  const plate = (off, len, wid, rows, tn, detail) => {
    const top = [sh.x - dx * off * U - S.nx * 1.5 * U, sh.y - dy * off * U - S.ny * 1.5 * U];
    const [a0, a1, b1, b0, Q] = _hang(top, dx, dy, len * U * size, wid * U * size, wid * (spec.square ? 1.08 : 1.22) * U * size);
    celFill(ctx, () => _quad(ctx, a0, a1, b1, b0, (spec.square ? 0.8 : 2) * U * size), tn, A, { sd: 3.4 * U, hd: far ? 0 : 1 * U, rim: true, detail: far ? null : (g) => {
      _lace(g, A, Q, rows, spec.studs ? 3 : 5, tn, 1.1 * U, lace);
      g.strokeStyle = tn[2]; g.lineWidth = 1.3 * U; g.beginPath(); g.moveTo(a0[0] - A.lx * 1.4 * U, a0[1] - A.ly * 1.4 * U + 1.4 * U); g.lineTo(a1[0] - A.lx * 1.4 * U, a1[1] - A.ly * 1.4 * U + 1.4 * U); g.stroke();
      if (detail) detail(g, Q);
    } });
    return Q;
  };
  const tn = far ? SUB_LACQ_FAR : spec.tone;
  if (spec.stack) {
    // the warden's / Gōka sode: stacked iron lames with spikes along the top edge, an accent vein down them
    plate(7, 12, 16, 2, tn);
    const Q = plate(-3, 17, 18, 3, tn, (g, Q) => _strokePts(g, [Q(0.3, 0.05), Q(0.45, 0.4), Q(0.36, 0.6), Q(0.55, 0.95)], acc[0], 1.2 * U));
    if (!far && !A.flat) void Q;
    const top = [sh.x - dx * 9 * U * size, sh.y - dy * 9 * U * size];
    for (const t of [-0.8, 0, 0.8]) {
      const bx = top[0] + S.nx * t * 7 * U, by = top[1] + S.ny * t * 7 * U, tx = bx - dx * 9 * U + S.nx * t * 3 * U - S.ux * 1 * U, ty = by - dy * 9 * U + S.ny * t * 3 * U - S.uy * 1 * U;
      celFill(ctx, () => _poly(ctx, [[bx - S.nx * 2.4 * U, by - S.ny * 2.4 * U], [tx, ty], [bx + S.nx * 2.4 * U, by + S.ny * 2.4 * U]]), tn, A, { sd: 1.4 * U, hd: far ? 0 : 0.5 * U, rim: !far });
    }
    return;
  }
  plate(5, spec.square ? 24 : 16, spec.square ? 19 : 15, spec.rows, tn, spec.studs ? (g, Q) => {
    // gate studs in rows over the iron
    for (const t of [0.22, 0.5, 0.78]) for (const kk of [0.2, 0.5, 0.8]) {
      const p = Q(kk, t);
      g.fillStyle = GOLDM[0]; g.beginPath(); g.arc(p[0], p[1], 1.6 * U, 0, TAU); g.fill();
      g.fillStyle = GOLDM[2]; g.beginPath(); g.arc(p[0] - 0.4 * U, p[1] - 0.5 * U, 0.7 * U, 0, TAU); g.fill();
    }
  } : null);
}

/* ---- the torso overlays (drawArmor) ---- */
function drawSubBArmor(ctx, f, key) {
  const A = f._A;
  if (!A || !A.S) { torsoShape(ctx, f.sk.hip, f.sk.neck, f.facing, f.build.w * f.scale * 0.6); return; }
  const S = A.S, U = A.U, P = _sP(S, U), acc = _subbAcc(f, key), skin = animeSkin(f), t = f.time || 0;
  const coat = skin.top === 'coat';
  switch (key) {
    case 'ledger_coat': {
      // the haori over the gi (or Kage's coat): open at the front, a violet collar band ruled like a ledger column,
      // shingled pages pasted over the chest and back, one struck through
      const prof = { front: [[-0.12, 13.6], [0.2, 12.8], [0.5, 13.8], [0.78, 15], [0.94, 13.2], [1.04, 7.6], [1.08, 4]], back: [[1.08, -5.6], [0.98, -14.6], [0.8, -15.4], [0.5, -13], [0.2, -13], [-0.12, -13.8]] };
      celFill(ctx, () => animeTorso(ctx, S, prof, U), A.pal.coat, A, { sd: 7 * U, hd: 1 * U, rim: true, detail: (g) => {
        g.fillStyle = coat ? A.pal.fab[1] : A.pal.fab[0];
        g.beginPath(); _poly(g, [P(1.06, 1.6), P(1.06, 13), P(-0.1, 14), P(0.1, 7.6), P(0.62, 5)]); g.fill();
        // pages on the back and chest
        for (const [u, w, rot] of [[0.62, -9.5, 0.08], [0.4, -10, -0.06], [0.82, -6.5, 0.1], [0.3, -4, 0.04], [0.55, -3.6, -0.05]]) {
          const c = P(u, w); g.save(); g.translate(c[0], c[1]); g.rotate(Math.atan2(S.dy, S.dx) + Math.PI / 2 + rot);
          g.fillStyle = LEDGER[(u * 10 | 0) % 2]; g.fillRect(-3.2 * U, -2.2 * U, 6.4 * U, 4.4 * U);
          g.strokeStyle = ANIME.outline; g.lineWidth = 0.8 * A.s; g.strokeRect(-3.2 * U, -2.2 * U, 6.4 * U, 4.4 * U);
          g.strokeStyle = 'rgba(8,7,8,0.75)'; g.lineWidth = 0.55 * A.s; g.beginPath(); g.moveTo(-2.4 * U, -0.6 * U); g.lineTo(2.4 * U, -0.6 * U); g.moveTo(-2.4 * U, 0.8 * U); g.lineTo(1.4 * U, 0.8 * U); g.stroke();
          if (u === 0.4) { g.strokeStyle = acc[2]; g.lineWidth = 0.9 * U; g.beginPath(); g.moveTo(-3 * U, 1.8 * U); g.lineTo(3 * U, -1.8 * U); g.stroke(); }
          g.restore();
        }
        _strokePts(g, [P(1.06, 1.6), P(0.62, 5), P(0.1, 7.6)], A.pal.coat[2], 1.3 * U);
        _strokePts(g, [P(1.04, 3.2), P(0.62, 6.6), P(0.1, 9.4)], acc[0], 2.6 * U);
        g.strokeStyle = acc[1]; g.lineWidth = 0.7 * A.s; g.beginPath();
        for (let k = 1; k < 7; k++) { const u = lerp(1.0, 0.18, k / 7), w = lerp(3.6, 8.8, k / 7); const a = P(u, w - 1.1), b = P(u - 0.015, w + 1.1); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
        g.stroke();
        _strokePts(g, [P(0.8, -2.5), P(0.5, -4), P(0.3, -3.2)], A.pal.coat[0], 1 * A.s);
      } });
      break;
    }
    case 'gate_plate': {
      // a flat-fronted dō like a piece of the Fortress door: iron boards, two straps of gold studs, the kannuki bar
      f.subKusazuri(ctx, A, S, U, 'back', { rows: 3, len: 1.15, panels: 3, acc: acc[0], iron: true, wide: 1.2 });
      const prof = { front: [[0.0, 15.6], [0.3, 15], [0.56, 16.4], [0.8, 17.4], [0.93, 15.4], [0.99, 9]], back: [[0.99, -10], [0.93, -16.4], [0.74, -17.4], [0.5, -15.6], [0.26, -15.4], [0.0, -16.2]] };
      celFill(ctx, () => animeTorso(ctx, S, prof, U), SUB_IRON, A, { sd: 7 * U, hd: 1.2 * U, rim: true, detail: (g) => {
        // the boards: vertical seams with a lit edge
        for (const w of [-9.6, -3.2, 3.2, 9.6]) { _strokePts(g, [P(-0.02, w + 0.9), P(1.0, w + 0.9)], SUB_IRON[2], 0.8 * A.s); _strokePts(g, [P(-0.02, w), P(1.0, w)], ANIME.outline, 1.2 * A.s); }
        // the straps and their studs
        for (const u of [0.24, 0.78]) {
          celFill(g, () => _poly(g, [P(u - 0.05, -18), P(u - 0.05, 18), P(u + 0.05, 18), P(u + 0.05, -18)]), ['#060708', '#101114', '#262a30'], A, { sd: 1 * U, seam: true });
          for (let w = -14; w <= 15; w += 4.4) {
            const p = P(u, w);
            g.fillStyle = GOLDM[0]; g.beginPath(); g.arc(p[0], p[1], 1.7 * U, 0, TAU); g.fill();
            g.fillStyle = GOLDM[1]; g.beginPath(); g.arc(p[0] - 0.3 * U, p[1] - 0.3 * U, 1.1 * U, 0, TAU); g.fill();
            g.fillStyle = GOLDM[2]; g.beginPath(); g.arc(p[0] - 0.6 * U, p[1] - 0.6 * U, 0.45 * U, 0, TAU); g.fill();
          }
        }
        // the kannuki: a heavy iron bar across the middle, held in two gold brackets
        celFill(g, () => _poly(g, [P(0.46, -19), P(0.46, 20), P(0.56, 20), P(0.56, -19)]), ['#08090a', '#1c1e22', '#3d424a'], A, { sd: 1.6 * U, hd: 0.6 * U });
        for (const w of [-8, 9]) { _strokePts(g, [P(0.42, w), P(0.6, w)], ANIME.outline, 3.4 * U); _strokePts(g, [P(0.42, w), P(0.6, w)], GOLDM[1], 1.8 * U); }
      } });
      // the gorget
      celFill(ctx, () => animeTorso(ctx, S, { front: [[0.9, 10], [1.0, 10.6], [1.06, 5]], back: [[1.06, -7], [1.0, -12], [0.9, -12]] }, U), SUB_IRON, A, { sd: 2.6 * U, hd: 0.8 * U, rim: true, detail: (g) => _strokePts(g, [P(0.96, -12), P(0.96, 11)], acc[0], 1.2 * U) });
      break;
    }
    case 'jerkin': {
      // the kawa-dō: a fitted leather cuirass laced in pale gold over the gi, a chest plate, stitched seams
      const prof = { front: [[0.06, 12.8], [0.34, 12.2], [0.6, 13.6], [0.8, 14.4], [0.92, 12], [0.97, 6.4]], back: [[0.97, -7], [0.92, -13.8], [0.74, -14.6], [0.5, -12.6], [0.26, -12.4], [0.06, -13]] };
      celFill(ctx, () => animeTorso(ctx, S, prof, U), LEATHER, A, { sd: 6.5 * U, hd: 1 * U, rim: true, detail: (g) => {
        const Q = (k, tt) => P(lerp(0.1, 0.72, 1 - tt), lerp(-14, 14, k));
        _lace(g, A, Q, 3, 9, LEATHER, 0.9 * U, acc[0]);
        // the chest plate (munaita) and its stitched edge
        celFill(g, () => _poly(g, [P(0.94, -10), P(0.94, 12.4), P(0.74, 14.6), P(0.72, -12.4)]), LEATHER, A, { sd: 2 * U, hd: 0.8 * U });
        g.setLineDash([1.4 * U, 1.4 * U]); _strokePts(g, [P(0.76, -11.6), P(0.78, 13.4)], acc[1], 0.7 * U); g.setLineDash([]);
        // the side lacing knot
        const k = P(0.6, -11); g.fillStyle = acc[1]; g.beginPath(); g.arc(k[0], k[1], 1.2 * U, 0, TAU); g.fill();
      } });
      break;
    }
    case 'conduit_harness': {
      // a leather harness crossed over the chest, each strap coiled with a glass tube of pulsing violet light, a ring
      // where they cross; a short leather dō under it
      celFill(ctx, () => animeTorso(ctx, S, ORDER_DO.light, U), LEATHER, A, { sd: 5 * U, hd: 0.9 * U, rim: true, detail: (g) => {
        _strokePts(g, [P(0.4, 12.6), P(0.4, -4)], LEATHER[0], 1 * A.s);
      } });
      if (!A.flat) {
        const glow = 0.45 + 0.35 * Math.sin(t * 5);
        for (const [a, b] of [[P(1.0, -10), P(0.12, 13)], [P(1.0, 11), P(0.12, -12)]]) {
          ctx.lineCap = 'round';
          _strokePts(ctx, [a, b], ANIME.outline, 5 * U); _strokePts(ctx, [a, b], LEATHER[1], 3.4 * U);
          _strokePts(ctx, [[a[0] - A.lx * U, a[1] - A.ly * U], [b[0] - A.lx * U, b[1] - A.ly * U]], LEATHER[2], 0.7 * U);
          ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(165,135,255,${glow})`; ctx.lineWidth = 1.5 * U; ctx.beginPath();
          const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
          for (let k = 0; k <= 16; k++) { const q = k / 16, w = Math.sin(q * Math.PI * 6 + t * 6) * 1.6 * U; const x = a[0] + dx * q + nx * w, y = a[1] + dy * q + ny * w; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
          ctx.stroke(); ctx.globalCompositeOperation = 'source-over';
        }
        const c = P(0.57, -0.4);
        ctx.strokeStyle = ANIME.outline; ctx.lineWidth = 3 * U; ctx.beginPath(); ctx.arc(c[0], c[1], 3.4 * U, 0, TAU); ctx.stroke();
        ctx.strokeStyle = SUB_IRON[2]; ctx.lineWidth = 1.6 * U; ctx.beginPath(); ctx.arc(c[0], c[1], 3.4 * U, 0, TAU); ctx.stroke();
        ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(201,189,255,${glow})`; ctx.beginPath(); ctx.arc(c[0], c[1], 2 * U, 0, TAU); ctx.fill(); ctx.globalCompositeOperation = 'source-over';
      } else {
        for (const [a, b] of [[P(1.0, -10), P(0.12, 13)], [P(1.0, 11), P(0.12, -12)]]) _strokePts(ctx, [a, b], A.col, 4 * U);
      }
      void acc;
      break;
    }
    case 'pauldrons': {
      // the ō-sode yoroi: a full dō laced in the accent, a mune-ita and a gorget (the great sode hang from the arms)
      f.subKusazuri(ctx, A, S, U, 'back', { rows: 4, len: 1.1, panels: 3, acc: acc[1] });
      celFill(ctx, () => animeTorso(ctx, S, ORDER_DO.heavy, U), SUB_LACQ, A, { sd: 7 * U, hd: 1.1 * U, rim: true, detail: (g) => {
        const Q = (k, tt) => P(lerp(0.08, 0.76, 1 - tt), lerp(-17, 17, k));
        _lace(g, A, Q, 5, 12, SUB_LACQ, 1.1 * U, acc[1]);
        _strokePts(g, [P(0.78, -18), P(0.78, 18)], ANIME.outline, 1.4 * U);
        _strokePts(g, [P(0.94, -6), P(0.9, 12)], SUB_LACQ[2], 1.2 * U);
        // a small gold crest on the chest
        const c = P(0.86, 7); g.strokeStyle = acc[2]; g.lineWidth = 0.9 * U; g.beginPath(); g.arc(c[0], c[1], 2.2 * U, 0, TAU); g.stroke();
        g.beginPath(); g.moveTo(c[0] - 2.2 * U * S.ux, c[1] - 2.2 * U * S.uy); g.lineTo(c[0] + 2.2 * U * S.ux, c[1] + 2.2 * U * S.uy); g.stroke();
      } });
      celFill(ctx, () => animeTorso(ctx, S, { front: [[0.9, 9.4], [1.0, 10], [1.06, 5]], back: [[1.06, -6.4], [1.0, -11.4], [0.9, -11.4]] }, U), SUB_LACQ, A, { sd: 2.6 * U, hd: 0.8 * U, rim: true, detail: (g) => _strokePts(g, [P(0.97, -12), P(0.97, 11)], acc[1], 1.2 * U) });
      break;
    }
    case 'tyrant': {
      // the Gōka dō: heavy black iron, burnt veins of the accent running up from the waist, a spiked gorget
      f.subKusazuri(ctx, A, S, U, 'back', { rows: 3, len: 1.2, panels: 3, acc: acc[1], iron: true, wide: 1.15 });
      celFill(ctx, () => animeTorso(ctx, S, ORDER_DO.heavy, U), SUB_IRON, A, { sd: 7 * U, hd: 1.2 * U, rim: true, detail: (g) => {
        const Q = (k, tt) => P(lerp(0.08, 0.72, 1 - tt), lerp(-17, 17, k));
        _lace(g, A, Q, 3, 8, SUB_IRON, 1 * U, acc[0]);
        _strokePts(g, [P(0.76, -18), P(0.76, 18)], ANIME.outline, 1.4 * U);
        _strokePts(g, [P(0.92, -6), P(0.88, 13)], SUB_IRON[2], 1.2 * U);
        if (!A.flat) for (const pts of [[[0.1, 8], [0.3, 6], [0.38, 9], [0.6, 7.4], [0.74, 10]], [[0.12, -2], [0.28, 0.6], [0.46, -1.6], [0.62, 1]]]) _bolt(g, pts.map(([u, w]) => P(u, w)), 0.7 * U, acc[1]);
      } });
      celFill(ctx, () => animeTorso(ctx, S, { front: [[0.88, 10], [1.0, 10.6], [1.08, 5]], back: [[1.08, -7], [1.0, -12.6], [0.88, -12.6]] }, U), SUB_IRON, A, { sd: 2.6 * U, hd: 0.8 * U, rim: true, detail: (g) => _strokePts(g, [P(0.96, -12), P(0.96, 11)], acc[0], 1.4 * U) });
      // the spikes of the gorget, rising behind the head
      for (const w of [-10, -6.4, -2.8]) celFill(ctx, () => _poly(ctx, [P(1.0, w - 1.6), P(1.2 + (w + 10) * -0.01, w - 2.2), P(1.0, w + 1.6)]), SUB_IRON, A, { sd: 1 * U, rim: true });
      break;
    }
    case 'cloak': {
      // the echo's cloak over the shoulders: a mantle to mid-chest, a clasp of violet glass at the throat
      const T = [[1.08, -6], [1.06, 7], [0.92, 13], [0.72, 14.6]], hem = [];
      const K = 7; for (let i = 0; i <= K; i++) { const k = i / K; hem.push([lerp(0.72, 0.66, k) - (i % 2 ? 0.07 : 0), lerp(14.6, -17.4, k)]); }
      const pts = T.concat(hem, [[0.88, -17], [1.02, -13]]).map(([u, w]) => P(u, w));
      celFill(ctx, () => _poly(ctx, pts), ['#07060b', '#100e16', '#221e2e'], A, { sd: 4 * U, hd: 0.9 * U, rim: true, detail: (g) => {
        _strokePts(g, [P(0.82, -16), P(0.82, 13)], acc[0], 1.6 * U);
        _strokePts(g, [P(0.96, -13), P(0.95, 8)], ANIME.outline, 1 * A.s);
      } });
      if (!A.flat) { const c = P(1.0, 8); ctx.fillStyle = acc[1]; ctx.beginPath(); ctx.arc(c[0], c[1], 2.2 * U, 0, TAU); ctx.fill(); ctx.fillStyle = acc[2]; ctx.beginPath(); ctx.arc(c[0] - 0.5 * U, c[1] - 0.5 * U, 0.8 * U, 0, TAU); ctx.fill(); }
      break;
    }
  }
}

/* ---- heads (head frame: +x the face side, r the head radius) ---- */
function drawSubBHead(ctx, key, f, r, ink, flat) {
  if (!f) { ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(0, -r * 0.2, r * 1.1, Math.PI, TAU); ctx.fill(); return; }
  const A = f._A && f._A.pal ? f._A : animeState(f, ink, flat, {});
  const sv = _headLight(A, f), t = f.time || 0, acc = _subbAcc(f, key === 'oni_echo' ? 'oni' : key), sub = animeSkin(f).sub;
  const fill = (pts, tone, o) => celFill(ctx, () => orderShape(ctx, r, pts), tone, A, o);
  const studs = (g, list, rad) => { for (const [x, y] of list) { g.fillStyle = GOLDM[0]; g.beginPath(); g.arc(r * x, r * y, r * rad, 0, TAU); g.fill(); g.fillStyle = GOLDM[2]; g.beginPath(); g.arc(r * (x - rad * 0.3), r * (y - rad * 0.3), r * rad * 0.45, 0, TAU); g.fill(); } };
  // a lacquered shikoro: lames flaring down and back, laced in the accent
  const shikoro = (pts, tone, k0, k1, lace) => fill(pts, tone, { sd: r * 0.26, hd: r * 0.05, rim: true, detail: (g) => {
    for (let i = 1; i <= 3; i++) {
      const k = i / 4;
      g.strokeStyle = lace; g.lineWidth = r * 0.07; g.setLineDash([r * 0.06, r * 0.07]);
      g.beginPath(); g.moveTo(r * (-0.3 - k * 0.2), r * (-0.3 + k * k0)); g.quadraticCurveTo(r * (-0.9 - k * 0.3), r * (-0.52 + k * k0), r * (-1.2 - k * k1), r * (-0.4 + k * (k0 + 0.3))); g.stroke();
      g.setLineDash([]);
      g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.06;
      g.beginPath(); g.moveTo(r * (-0.3 - k * 0.2), r * (-0.4 + k * k0)); g.quadraticCurveTo(r * (-0.9 - k * 0.3), r * (-0.62 + k * k0), r * (-1.2 - k * k1), r * (-0.5 + k * (k0 + 0.3))); g.stroke();
    }
  } });
  switch (key) {
    case 'storm_band': {
      // Kasane: hair swept back and tied short at the nape; Kage keeps his own hair under the band
      if (f.isPlayer) drawKageHair(ctx, r, ink, flat, f);
      else {
        fill([[-0.9, -0.5], [-1.5, -0.78], [-2.0, -0.42, 1], [-1.56, -0.3], [-1.86, 0.02, 1], [-1.3, -0.08], [-0.94, -0.1]], A.pal.hair, { sd: r * 0.12, rim: true });
        fill([[0.72, -0.6], [0.3, -1.04], [-0.42, -1.1], [-0.98, -0.68], [-1.06, 0.12], [-0.84, 0.66, 1], [-0.62, 0.22], [-0.34, -0.3], [0.3, -0.52]], A.pal.hair, { sd: r * 0.26, hd: r * 0.06, rim: true, detail: (g) => {
          g.strokeStyle = A.pal.hair[2]; g.lineWidth = r * 0.05; g.beginPath();
          for (const y of [-0.92, -0.78]) { g.moveTo(r * 0.5, r * (y + 0.2)); g.quadraticCurveTo(-r * 0.2, r * (y - 0.12), -r * 0.92, r * (y + 0.36)); }
          g.stroke();
        } });
      }
      // the band round the brow, its edges in the accent
      fill([[-1.02, -0.66, 1], [0.0, -0.76], [1.0, -0.6, 1], [1.0, -0.32, 1], [0.0, -0.46], [-1.02, -0.38, 1]], ['#08070b', '#141219', '#28242f'], { sd: r * 0.08, detail: (g) => {
        g.strokeStyle = acc[1]; g.lineWidth = r * 0.04; g.beginPath(); g.moveTo(-r, -r * 0.62); g.quadraticCurveTo(0, -r * 0.72, r, -r * 0.57); g.moveTo(-r, -r * 0.42); g.quadraticCurveTo(0, -r * 0.5, r, -r * 0.35); g.stroke();
      } });
      // the iron plate on the front: riveted, engraved with a ledger entry struck through
      fill([[0.06, -0.8, 1], [0.98, -0.68, 1], [1.04, -0.26, 1], [0.08, -0.32, 1]], SUB_IRON, { sd: r * 0.1, hd: r * 0.05, rim: true, detail: (g) => {
        g.fillStyle = ANIME.silver; for (const [x, y] of [[0.16, -0.72], [0.9, -0.62], [0.92, -0.33], [0.18, -0.38]]) { g.beginPath(); g.arc(r * x, r * y, r * 0.035, 0, TAU); g.fill(); }
        g.strokeStyle = acc[1]; g.lineWidth = r * 0.035; g.beginPath();
        for (const [y, w] of [[-0.62, 0.42], [-0.52, 0.3], [-0.42, 0.38]]) { g.moveTo(r * 0.36, r * y); g.lineTo(r * (0.36 + w), r * (y + 0.01)); }
        g.stroke();
        g.strokeStyle = acc[2]; g.lineWidth = r * 0.04; g.beginPath(); g.moveTo(r * 0.32, -r * 0.36); g.lineTo(r * 0.84, -r * 0.68); g.stroke();
      } });
      // the knot at the back
      fill([[-0.92, -0.62], [-1.24, -0.7, 1], [-1.2, -0.3, 1], [-0.92, -0.38]], [acc[0], acc[0], acc[1]], { sd: r * 0.06 });
      break;
    }
    case 'disciple_wrap': {
      // Shizune: dark hair bound at the nape (the ponytail is cloth), a side lock; Kage keeps his own hair under it
      if (f.isPlayer) drawKageHair(ctx, r, ink, flat, f);
      else {
        fill([[-0.24, -0.46], [-1.0, -0.42], [-1.08, 0.36], [-0.78, 0.92, 1], [-0.58, 0.36], [-0.3, 0.02]], A.pal.hair, { sd: r * 0.2, hd: r * 0.05, rim: true });
        fill([[0.62, -0.42], [0.86, 0.1], [0.76, 0.66, 1], [0.6, 0.12], [0.44, -0.36]], A.pal.hair, { sd: r * 0.06 });
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
      break;
    }
    case 'iron_kabuto': {
      // Gonryu's tetsu kabuto: a deep laced shikoro, an iron menpō, a ribbed bowl banded gold, the visor, and great
      // gold kuwagata rising off the brow round a gate stud
      if (f.isPlayer) drawKageHair(ctx, r * 0.9, ink, flat, f);
      shikoro([[0.12, -0.56], [-0.9, -0.84], [-1.62, 0.0], [-2.0, 0.82, 1], [-0.96, 1.02], [-0.42, 0.5], [-0.2, -0.2]], SUB_IRON, 1.0, 0.72, acc[0]);
      fill([[0.02, 0.22], [0.8, 0.16], [1.22, 0.34, 1], [1.04, 0.64], [0.66, 0.94], [0.3, 1.02, 1], [0.02, 0.66]], SUB_IRON, { sd: r * 0.18, hd: r * 0.06, rim: true, detail: (g) => {
        g.strokeStyle = acc[1]; g.lineWidth = r * 0.06; g.beginPath(); g.moveTo(r * 0.5, r * 0.5); g.quadraticCurveTo(r * 0.86, r * 0.4, r * 1.12, r * 0.52); g.stroke();
        g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.04; g.beginPath();
        for (const x of [0.4, 0.55, 0.7]) { g.moveTo(r * x, r * 0.7); g.lineTo(r * (x + 0.02), r * 0.88); }
        g.moveTo(r * 0.98, r * 0.3); g.lineTo(r * 0.9, r * 0.46); g.stroke();
      } });
      fill([[1.1, -0.34, 1], [0.98, -1.02], [0.2, -1.46], [-0.72, -1.26], [-1.18, -0.4, 1]], SUB_IRON, { sd: r * 0.32, hd: r * 0.08, rim: true, detail: (g) => {
        g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.045; g.beginPath();
        for (const x of [-0.7, -0.35, 0.0, 0.35, 0.7]) { g.moveTo(r * 0.1, -r * 1.4); g.quadraticCurveTo(r * (x * 1.1), -r * 1.1, r * x * 1.25, -r * 0.42); }
        g.stroke();
        g.strokeStyle = SUB_IRON[2]; g.lineWidth = r * 0.025; g.beginPath();
        for (const x of [-0.32, 0.03, 0.38]) { g.moveTo(r * 0.12, -r * 1.36); g.quadraticCurveTo(r * (x * 1.1 + 0.03), -r * 1.1, r * (x * 1.25 + 0.04), -r * 0.44); }
        g.stroke();
        g.strokeStyle = acc[0]; g.lineWidth = r * 0.16; g.beginPath(); g.moveTo(-r * 1.14, -r * 0.5); g.quadraticCurveTo(0, -r * 0.66, r * 1.08, -r * 0.46); g.stroke();
        studs(g, [[-0.8, -0.56], [-0.4, -0.6], [0.0, -0.62], [0.4, -0.6], [0.8, -0.54]], 0.05);
      } });
      fill([[0.36, -0.52], [1.46, -0.46, 1], [1.36, -0.28, 1], [0.36, -0.34]], SUB_IRON, { sd: r * 0.06 });
      fill([[0.34, -0.52], [0.18, 0.1, 1], [-0.32, 0.0], [-0.16, -0.54]], SUB_IRON, { sd: r * 0.1, hd: r * 0.04, detail: (g) => { g.strokeStyle = acc[1]; g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(r * 0.3, -r * 0.48); g.lineTo(r * 0.16, r * 0.04); g.stroke(); } });
      // the kuwagata
      fill([[0.5, -1.0, 1], [0.92, -1.6], [1.36, -2.7, 1], [0.82, -1.86], [0.4, -1.2, 1]], CROWN_GOLD, { sd: r * 0.08, hd: r * 0.03, rim: true });
      fill([[0.34, -1.04, 1], [0.14, -1.9], [-0.22, -2.84, 1], [0.3, -1.96], [0.56, -1.12, 1]], [CROWN_GOLD[0], CROWN_GOLD[0], CROWN_GOLD[1]], { sd: r * 0.06 });
      celFill(ctx, () => ctx.arc(r * 0.5, -r * 1.02, r * 0.17, 0, TAU), GOLDM, A, { sd: r * 0.05, hd: r * 0.03 });
      break;
    }
    case 'oni_mask': case 'oni_echo': {
      const echo = key === 'oni_echo', warden = sub === 'echo_warden', moro = sub === 'moro';
      if (f.isPlayer) drawKageHair(ctx, r * 0.92, ink, flat, f);
      if (echo && warden) {
        // the Echo Warden: a heavy oni kabuto, a crest of violet-edged spikes, long horns, a fanged menpō
        shikoro([[0.12, -0.56], [-0.9, -0.84], [-1.6, 0.0], [-1.96, 0.8, 1], [-0.96, 1.0], [-0.42, 0.5], [-0.2, -0.2]], VIOLET_LACQ, 1.0, 0.7, acc[1]);
        fill([[-0.4, -1.1], [-0.7, -1.9, 1], [-0.28, -1.5], [-0.1, -2.3, 1], [0.12, -1.5], [0.42, -2.0, 1], [0.48, -1.2]], VIOLET_LACQ, { sd: r * 0.1, rim: true, detail: (g) => {
          g.strokeStyle = acc[1]; g.lineWidth = r * 0.04; g.beginPath(); g.moveTo(-r * 0.7, -r * 1.9); g.lineTo(-r * 0.48, -r * 1.3); g.moveTo(-r * 0.1, -r * 2.3); g.lineTo(-r * 0.06, -r * 1.5); g.moveTo(r * 0.42, -r * 2.0); g.lineTo(r * 0.34, -r * 1.3); g.stroke();
        } });
        fill([[1.08, -0.34, 1], [0.96, -1.0], [0.2, -1.38], [-0.72, -1.2], [-1.16, -0.4, 1]], VIOLET_LACQ, { sd: r * 0.3, hd: r * 0.08, rim: true, detail: (g) => {
          g.strokeStyle = acc[1]; g.lineWidth = r * 0.1; g.beginPath(); g.moveTo(-r * 1.12, -r * 0.48); g.quadraticCurveTo(0, -r * 0.62, r * 1.06, -r * 0.44); g.stroke();
        } });
        fill([[0.6, -0.94], [1.3, -1.4], [1.9, -2.3, 1], [1.2, -1.36], [0.7, -0.72]], ORDER_HORN, { sd: r * 0.12, hd: r * 0.04, rim: true });
        fill([[-0.3, -1.0], [-0.9, -1.6], [-1.2, -2.5, 1], [-0.64, -1.5], [-0.1, -1.08]], ORDER_HORN, { sd: r * 0.1 });
      } else if (echo) {
        // the Echo Sentinel: a close hood, long horns swept back from it
        fill([[0.5, -0.9], [-0.3, -1.12], [-1.02, -0.7], [-1.12, 0.3], [-0.82, 1.2], [-0.1, 1.3], [0.3, 1.06], [0.0, 0.6], [-0.2, 0.0], [0.1, -0.6]], ['#08060d', '#110e18', '#241f31'], { sd: r * 0.3, hd: r * 0.05, rim: true });
        fill([[0.62, -0.84], [0.5, -1.5], [-0.1, -2.0], [-1.0, -2.1, 1], [-0.3, -1.7], [0.18, -1.3], [0.36, -0.84]], ORDER_HORN, { sd: r * 0.1, rim: true });
        fill([[0.3, -0.92], [0.0, -1.4], [-0.8, -1.68], [-1.95, -1.46, 1], [-0.9, -1.34], [-0.3, -1.04], [-0.05, -0.84]], ORDER_HORN, { sd: r * 0.1, hd: r * 0.04, rim: true, detail: (g) => { g.strokeStyle = acc[1]; g.lineWidth = r * 0.04; g.beginPath(); g.moveTo(r * 0.1, -r * 1.1); g.quadraticCurveTo(-r * 0.6, -r * 1.5, -r * 1.8, -r * 1.47); g.stroke(); } });
      } else if (moro) {
        // Moro: a close dark hood under the brow plate (the conduit tube runs into it from the back)
        fill([[0.5, -0.9], [-0.3, -1.12], [-1.02, -0.7], [-1.12, 0.3], [-0.82, 1.2], [-0.1, 1.3], [0.3, 1.06], [0.0, 0.6], [-0.2, 0.0], [0.1, -0.6]], A.pal.fab, { sd: r * 0.3, hd: r * 0.05, rim: true, detail: (g) => {
          g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(-r * 0.3, -r * 1.0); g.quadraticCurveTo(-r * 0.86, -r * 0.3, -r * 0.6, r * 0.9); g.stroke();
          if (!A.flat) { g.fillStyle = SUB_IRON[2]; g.beginPath(); g.arc(-r * 0.92, r * 0.2, r * 0.12, 0, TAU); g.fill(); }
        } });
      }
      if (!echo) {
        // the brow plate and its two short iron horns
        const tone = moro ? VIOLET_LACQ : SUB_IRON;
        fill([[-0.36, -0.92], [-0.52, -1.5], [-0.7, -1.96, 1], [-0.26, -1.42], [-0.06, -0.98]], ORDER_HORN, { sd: r * 0.08 });
        fill([[0.2, -0.9], [0.48, -1.5], [0.36, -2.12, 1], [0.74, -1.5], [0.68, -0.9]], ORDER_HORN, { sd: r * 0.12, hd: r * 0.04, rim: true });
        fill([[-0.92, -0.72, 1], [-0.2, -0.98], [0.6, -0.94], [1.0, -0.62], [1.04, -0.34, 1], [0.3, -0.5], [-0.5, -0.46], [-0.94, -0.4, 1]], tone, { sd: r * 0.12, hd: r * 0.06, rim: true, detail: (g) => {
          g.fillStyle = ANIME.silver; for (const x of [-0.6, 0.0, 0.62]) { g.beginPath(); g.arc(r * x, -r * 0.66, r * 0.045, 0, TAU); g.fill(); }
          g.strokeStyle = acc[1]; g.lineWidth = r * 0.04; g.beginPath(); g.moveTo(-r * 0.9, -r * 0.44); g.quadraticCurveTo(0, -r * 0.56, r * 1.0, -r * 0.38); g.stroke();
        } });
      }
      // the menpō (the sentinel's covers the whole face, the eyes glowing through its holes)
      const full = echo && !warden;
      const MASK = full ? [[0.0, -0.78], [0.78, -0.74], [1.08, -0.3], [1.22, 0.32, 1], [1.02, 0.72], [0.6, 1.12], [0.16, 1.02], [-0.12, 0.4]]
        : [[-0.12, 0.2], [0.55, 0.12], [1.04, 0.2], [1.24, 0.42, 1], [1.08, 0.64], [0.98, 0.94], [0.56, 1.12], [0.12, 1.02], [-0.16, 0.6]];
      fill(MASK, echo || moro ? VIOLET_LACQ : SUB_IRON, { sd: r * 0.18, hd: r * 0.06, rim: true, detail: (g) => {
        if (full) {
          _eyeHoles(g, r);
          g.strokeStyle = acc[1]; g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(r * 0.2, -r * 0.22); g.quadraticCurveTo(r * 0.5, -r * 0.4, r * 0.98, -r * 0.2); g.stroke();
        }
        const y0 = full ? 0.54 : 0.5;
        g.fillStyle = '#060406'; g.beginPath(); orderShape(g, r, [[0.42, y0, 1], [1.12, y0 - 0.04, 1], [1.0, y0 + 0.28], [0.5, y0 + 0.3]]); g.fill();
        g.fillStyle = SUB_PAPER[0];
        for (const x of [0.56, 0.98]) { g.beginPath(); g.moveTo(r * (x - 0.07), r * (y0 - 0.01)); g.lineTo(r * (x + 0.07), r * (y0 - 0.02)); g.lineTo(r * x, r * (y0 + 0.18)); g.closePath(); g.fill(); }
        for (const x of [0.7, 0.86]) { g.beginPath(); g.moveTo(r * (x - 0.06), r * (y0 + 0.28)); g.lineTo(r * (x + 0.06), r * (y0 + 0.28)); g.lineTo(r * x, r * (y0 + 0.14)); g.closePath(); g.fill(); }
        g.strokeStyle = acc[1]; g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(r * 0.38, r * (y0 - 0.04)); g.quadraticCurveTo(r * 0.8, r * (y0 - 0.14), r * 1.16, r * (y0 - 0.06)); g.stroke();
        g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.045; g.beginPath(); g.moveTo(r * 0.2, r * 0.36); g.quadraticCurveTo(r * 0.3, r * 0.6, r * 0.22, r * 0.84); g.stroke();
      } });
      // a crack of violet memory light through the iron (Moro is half a Hollow; the echoes are memory)
      if (!A.flat && (moro || echo)) _bolt(ctx, [[r * 0.3, r * (full ? -0.62 : 0.2)], [r * 0.38, r * (full ? -0.3 : 0.42)], [r * 0.26, r * (full ? -0.1 : 0.56)], [r * 0.36, r * (full ? 0.3 : 0.8)]], r * 0.025, acc[2]);
      break;
    }
    case 'blademaster_kabuto': {
      // Soma's mokushi kabuto: a wide swept shikoro, a closed menpō bound with the gold oath cord, a tall bowl, a
      // straight pale-gold blade crest laid across the brow
      if (f.isPlayer) drawKageHair(ctx, r * 0.9, ink, flat, f);
      shikoro([[0.1, -0.6], [-0.92, -0.92], [-1.74, -0.24], [-2.3, 0.56, 1], [-1.94, 0.92], [-0.92, 0.92], [-0.42, 0.42], [-0.2, -0.2]], SUB_LACQ, 0.92, 0.95, acc[1]);
      fill([[0.0, 0.16], [0.8, 0.12], [1.18, 0.26, 1], [1.1, 0.6], [0.7, 0.98], [0.3, 1.06, 1], [0.0, 0.66]], SUB_IRON, { sd: r * 0.18, hd: r * 0.06, rim: true, detail: (g) => {
        g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.04; g.beginPath(); g.moveTo(r * 0.36, r * 0.6); g.lineTo(r * 1.06, r * 0.56); g.stroke();
        g.strokeStyle = SUB_IRON[2]; g.lineWidth = r * 0.025; g.beginPath(); g.moveTo(r * 0.36, r * 0.64); g.lineTo(r * 1.04, r * 0.6); g.stroke();
        // the oath cord: wound across the mouth, knotted at the cheek
        g.strokeStyle = acc[0]; g.lineWidth = r * 0.09; g.beginPath(); g.moveTo(-r * 0.05, r * 0.46); g.quadraticCurveTo(r * 0.6, r * 0.4, r * 1.2, r * 0.5); g.stroke();
        g.strokeStyle = acc[2]; g.lineWidth = r * 0.04; g.beginPath(); g.moveTo(-r * 0.05, r * 0.44); g.quadraticCurveTo(r * 0.6, r * 0.38, r * 1.2, r * 0.48); g.stroke();
      } });
      if (!A.flat) {
        ctx.fillStyle = acc[1]; ctx.beginPath(); ctx.arc(r * 0.06, r * 0.5, r * 0.1, 0, TAU); ctx.fill();
        ctx.strokeStyle = acc[0]; ctx.lineWidth = Math.max(1, r * 0.06); const sw = Math.sin(t * 2.2) * r * 0.05;
        ctx.beginPath(); ctx.moveTo(r * 0.04, r * 0.56); ctx.lineTo(-r * 0.02 + sw, r * 1.0); ctx.moveTo(r * 0.1, r * 0.56); ctx.lineTo(r * 0.12 + sw, r * 0.92); ctx.stroke();
      }
      fill([[1.06, -0.36, 1], [0.98, -1.12], [0.52, -1.8], [-0.2, -2.0], [-0.82, -1.62], [-1.14, -0.4, 1]], SUB_LACQ, { sd: r * 0.34, hd: r * 0.08, rim: true, detail: (g) => {
        g.strokeStyle = ANIME.outline; g.lineWidth = r * 0.04; g.beginPath();
        for (const x of [-0.6, -0.2, 0.2, 0.6]) { g.moveTo(-r * 0.12, -r * 1.96); g.quadraticCurveTo(r * x, -r * 1.5, r * x * 1.6, -r * 0.44); }
        g.stroke();
        g.strokeStyle = acc[0]; g.lineWidth = r * 0.03; g.beginPath(); g.moveTo(-r * 0.1, -r * 1.94); g.quadraticCurveTo(r * 0.0, -r * 1.5, r * 0.04, -r * 0.44); g.stroke();
        g.strokeStyle = acc[1]; g.lineWidth = r * 0.1; g.beginPath(); g.moveTo(-r * 1.12, -r * 0.48); g.quadraticCurveTo(0, -r * 0.62, r * 1.04, -r * 0.45); g.stroke();
        g.fillStyle = acc[1]; g.beginPath(); g.arc(-r * 0.12, -r * 1.98, r * 0.08, 0, TAU); g.fill();
      } });
      fill([[0.34, -0.52], [1.4, -0.46, 1], [1.32, -0.3, 1], [0.34, -0.34]], SUB_LACQ, { sd: r * 0.06 });
      fill([[0.34, -0.52], [0.2, 0.06, 1], [-0.28, -0.04], [-0.14, -0.54]], SUB_LACQ, { sd: r * 0.1, hd: r * 0.04, detail: (g) => { g.strokeStyle = acc[1]; g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(r * 0.3, -r * 0.48); g.lineTo(r * 0.18, r * 0.02); g.stroke(); } });
      // the blade crest on its holder
      fill([[0.6, -0.56], [0.74, -1.42, 1], [0.92, -1.42, 1], [0.84, -0.56]], GOLDM, { sd: r * 0.05 });
      fill([[-0.56, -1.4, 1], [2.1, -1.62, 1], [2.04, -1.48, 1], [-0.56, -1.28, 1]], PALE_GOLD, { sd: r * 0.04, hd: r * 0.02, rim: true });
      break;
    }
  }
  A.lx = sv[0]; A.ly = sv[1];
}

/* ---- weapons (ink mode; SUBB_WEAPON_FLAT gives the flat and outline passes the same silhouette where the shape
   differs from the shared one) ---- */
function _katanaBase(ctx, L, s) { drawWeaponShape(ctx, 'katana', L, 'ink', s, '#030303', null); }
// the local direction of world-down in the weapon frame (so a chain hangs under gravity whatever the swing)
function _localDown(ctx) {
  const m = ctx.getTransform ? ctx.getTransform() : null; if (!m) return [0, 1];
  const det = m.a * m.d - m.b * m.c || 1; let x = -m.c / det, y = m.a / det; const l = Math.hypot(x, y) || 1; return [x / l, y / l];
}
Object.assign(SUB_WEAPON_ART, {
  // Kasane's kusarigama: a dark handle wrapped violet, a silver sickle with a violet edge, a chain from the butt
  ledger_kusari(ctx, sh, L, s, f) {
    const acc = subTone('#b48ae6'), t = f ? f.time : 0;
    // the chain, hanging under gravity from the butt, a weight at its end
    const [gx, gy] = _localDown(ctx), sw = Math.sin(t * 2.4) * 0.35, cx = gx * Math.cos(sw) - gy * Math.sin(sw), cy = gx * Math.sin(sw) + gy * Math.cos(sw);
    let px = -6 * s, py = 0;
    ctx.lineWidth = 1.1 * s;
    for (let i = 0; i < 9; i++) {
      const k = i / 8, bend = Math.sin(k * 2.4) * 0.25, dx = cx - cy * bend, dy = cy + cx * bend, nx = px + dx * 4.2 * s, ny = py + dy * 4.2 * s;
      ctx.save(); ctx.translate((px + nx) / 2, (py + ny) / 2); ctx.rotate(Math.atan2(dy, dx));
      ctx.strokeStyle = '#030303'; ctx.lineWidth = 2.6 * s; ctx.beginPath(); ctx.ellipse(0, 0, 2.6 * s, i % 2 ? 0.6 * s : 1.4 * s, 0, 0, TAU); ctx.stroke();
      ctx.strokeStyle = i % 2 ? '#4a4d53' : ANIME.silver; ctx.lineWidth = 1 * s; ctx.stroke();
      ctx.restore(); px = nx; py = ny;
    }
    ctx.fillStyle = '#030303'; ctx.beginPath(); ctx.arc(px + cx * 2 * s, py + cy * 2 * s, 3.4 * s, 0, TAU); ctx.fill();
    ctx.fillStyle = SUB_IRON[2]; ctx.beginPath(); ctx.arc(px + cx * 2 * s, py + cy * 2 * s, 2.3 * s, 0, TAU); ctx.fill();
    // the handle
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#030303'; ctx.lineWidth = 6.4 * s; ctx.beginPath(); ctx.moveTo(-6 * s, 0); ctx.lineTo(L * 0.55, 0); ctx.stroke();
    ctx.strokeStyle = SUB_WOOD[1]; ctx.lineWidth = 4.2 * s; ctx.beginPath(); ctx.moveTo(-6 * s, 0); ctx.lineTo(L * 0.55, 0); ctx.stroke();
    ctx.strokeStyle = acc[1]; ctx.lineWidth = 1 * s; ctx.beginPath(); for (let i = 0; i < 7; i++) { const x = -4 * s + i * L * 0.05; ctx.moveTo(x - 1.2 * s, -2 * s); ctx.lineTo(x + 1.2 * s, 2 * s); } ctx.stroke();
    ctx.fillStyle = ANIME.silver; ctx.fillRect(-7 * s, -2.6 * s, 2 * s, 5.2 * s); ctx.fillRect(L * 0.46, -2.8 * s, 2.4 * s, 5.6 * s);
    // the blade
    ctx.beginPath(); ctx.moveTo(L * 0.5, -3 * s); ctx.quadraticCurveTo(L * 0.95, -8 * s, L * 1.0, -L * 0.62); ctx.quadraticCurveTo(L * 0.8, -12 * s, L * 0.5, 4 * s); ctx.closePath();
    ctx.fillStyle = ANIME.silver; ctx.fill();
    ctx.strokeStyle = '#030303'; ctx.lineWidth = 1.2 * s; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(L * 0.52, 0); ctx.quadraticCurveTo(L * 0.86, -6 * s, L * 0.98, -L * 0.58); ctx.quadraticCurveTo(L * 0.8, -12 * s, L * 0.5, 4 * s); ctx.closePath(); ctx.fillStyle = '#6c7076'; ctx.fill();
    ctx.strokeStyle = acc[2]; ctx.lineWidth = 1.1 * s; ctx.beginPath(); ctx.moveTo(L * 0.52, 3 * s); ctx.quadraticCurveTo(L * 0.81, -11 * s, L * 0.99, -L * 0.6); ctx.stroke();
    return true;
  },
  // Gonryu's kanabo: a wrapped grip and a ring pommel, an octagonal iron club swelling to the head, gold bands, rows
  // of gate studs
  gate_kanabo(ctx, sh, L, s) {
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#030303'; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.arc(-L * 0.12, 0, 3.4 * s, 0, TAU); ctx.stroke();
    ctx.strokeStyle = GOLDM[1]; ctx.lineWidth = 1.4 * s; ctx.stroke();
    ctx.strokeStyle = '#030303'; ctx.lineWidth = 7.6 * s; ctx.beginPath(); ctx.moveTo(-L * 0.09, 0); ctx.lineTo(L * 0.3, 0); ctx.stroke();
    ctx.strokeStyle = SUB_WOOD[1]; ctx.lineWidth = 5.4 * s; ctx.beginPath(); ctx.moveTo(-L * 0.09, 0); ctx.lineTo(L * 0.3, 0); ctx.stroke();
    ctx.strokeStyle = GOLDM[0]; ctx.lineWidth = 1.1 * s; ctx.beginPath(); for (let i = 0; i < 9; i++) { const x = -L * 0.07 + i * L * 0.04; ctx.moveTo(x - 1.4 * s, -2.6 * s); ctx.lineTo(x + 1.4 * s, 2.6 * s); } ctx.stroke();
    const body = () => { ctx.beginPath(); _poly(ctx, [[L * 0.28, -4.6 * s], [L * 0.94, -11 * s], [L * 1.02, -8 * s], [L * 1.02, 8 * s], [L * 0.94, 11 * s], [L * 0.28, 4.6 * s]]); };
    body(); ctx.fillStyle = SUB_IRON[1]; ctx.fill();
    ctx.save(); body(); ctx.clip();
    ctx.fillStyle = SUB_IRON[0]; ctx.beginPath(); _poly(ctx, [[L * 0.28, 1.6 * s], [L * 1.04, 3.4 * s], [L * 1.04, 14 * s], [L * 0.28, 14 * s]]); ctx.fill();
    ctx.strokeStyle = SUB_IRON[2]; ctx.lineWidth = 1 * s; ctx.beginPath(); ctx.moveTo(L * 0.3, -2.6 * s); ctx.lineTo(L * 1.0, -6.4 * s); ctx.stroke();
    ctx.strokeStyle = '#030303'; ctx.lineWidth = 0.8 * s; ctx.beginPath(); ctx.moveTo(L * 0.3, 1.6 * s); ctx.lineTo(L * 1.02, 3.4 * s); ctx.stroke();
    for (let u = 0.4; u < 0.93; u += 0.075) for (const k of [-0.62, 0, 0.62]) {
      const hw = lerp(4.6, 11, (u - 0.28) / 0.66) * s, x = L * (u + (k === 0 ? 0.035 : 0)), y = k * hw;
      ctx.fillStyle = '#030303'; ctx.beginPath(); ctx.arc(x, y, 1.9 * s, 0, TAU); ctx.fill();
      ctx.fillStyle = GOLDM[1]; ctx.beginPath(); ctx.arc(x - 0.2 * s, y - 0.2 * s, 1.3 * s, 0, TAU); ctx.fill();
      ctx.fillStyle = GOLDM[2]; ctx.beginPath(); ctx.arc(x - 0.5 * s, y - 0.5 * s, 0.5 * s, 0, TAU); ctx.fill();
    }
    ctx.restore();
    ctx.lineCap = 'butt';
    for (const u of [0.31, 0.985]) { const hw = lerp(4.6, 11, (u - 0.28) / 0.66) * s + 1 * s; ctx.strokeStyle = '#030303'; ctx.lineWidth = 3.4 * s; ctx.beginPath(); ctx.moveTo(L * u, -hw); ctx.lineTo(L * u, hw); ctx.stroke(); ctx.strokeStyle = GOLDM[1]; ctx.lineWidth = 2 * s; ctx.stroke(); }
    ctx.lineCap = 'round';
    body(); ctx.strokeStyle = '#030303'; ctx.lineWidth = 1.4 * s; ctx.stroke();
    return true;
  },
  // Shizune's blade: a plain katana with a pale-gold wrap and the school's ring on a round iron tsuba
  disciple_blade(ctx, sh, L, s) {
    _katanaBase(ctx, L, s);
    const acc = subTone('#d9c08a'), hl = 0.31;
    ctx.fillStyle = acc[1];
    for (let i = 1; i < 6; i++) { ctx.save(); ctx.translate(-L * hl * (i + 0.1) / 6.2, 0); ctx.rotate(Math.PI / 4); ctx.fillRect(-1.05 * s, -1.05 * s, 2.1 * s, 2.1 * s); ctx.restore(); }
    ctx.fillStyle = '#030303'; ctx.beginPath(); ctx.ellipse(-0.6 * s, 0, 2.3 * s, 6.4 * s, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = SUB_IRON[1]; ctx.beginPath(); ctx.ellipse(-0.6 * s, 0, 1.6 * s, 5.6 * s, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = acc[1]; ctx.lineWidth = 0.7 * s; ctx.beginPath(); ctx.ellipse(-0.6 * s, -2.8 * s, 0.9 * s, 1.4 * s, 0, 0.3, 5.2); ctx.stroke();
    return true;
  },
  // Moro's naginata: a dark lacquered shaft with a glass conduit of violet light running up it, a curved blade
  conduit_naginata(ctx, sh, L, s, f) {
    const acc = subTone('#9b7cff'), t = f ? f.time : 0;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#030303'; ctx.lineWidth = 6.2 * s; ctx.beginPath(); ctx.moveTo(-L * 0.42, 0); ctx.lineTo(L * 0.78, 0); ctx.stroke();
    ctx.strokeStyle = VIOLET_LACQ[1]; ctx.lineWidth = 4.2 * s; ctx.beginPath(); ctx.moveTo(-L * 0.42, 0); ctx.lineTo(L * 0.78, 0); ctx.stroke();
    ctx.strokeStyle = VIOLET_LACQ[2]; ctx.lineWidth = 0.9 * s; ctx.beginPath(); ctx.moveTo(-L * 0.4, -1.2 * s); ctx.lineTo(L * 0.76, -1.2 * s); ctx.stroke();
    // the conduit along the shaft, a pulse running up it
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(155,124,255,${0.4 + 0.2 * Math.sin(t * 6)})`; ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.moveTo(-L * 0.3, 1.2 * s); ctx.lineTo(L * 0.72, 1.2 * s); ctx.stroke();
    const pu = ((t * 0.9) % 1) * 1.02 - 0.3; ctx.fillStyle = 'rgba(220,205,255,0.85)'; ctx.fillRect(L * pu, 0.4 * s, L * 0.06, 1.6 * s);
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineCap = 'butt'; ctx.strokeStyle = SUB_IRON[2]; ctx.lineWidth = 1.8 * s;
    for (const x of [-0.25, 0.1, 0.45, 0.7]) { ctx.beginPath(); ctx.moveTo(L * x, -3 * s); ctx.lineTo(L * x, 3 * s); ctx.stroke(); }
    ctx.lineCap = 'round';
    ctx.fillStyle = ANIME.silver; ctx.fillRect(-L * 0.43, -2.4 * s, 3 * s, 4.8 * s);
    // the guard and the blade
    ctx.fillStyle = '#030303'; ctx.beginPath(); ctx.ellipse(L * 0.775, 0, 1.8 * s, 5 * s, 0, 0, TAU); ctx.fill();
    _naginataBlade(ctx, L, s); ctx.fillStyle = ANIME.silver; ctx.fill(); ctx.strokeStyle = '#030303'; ctx.lineWidth = 1.1 * s; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(L * 0.79, 1.2 * s); ctx.quadraticCurveTo(L * 0.93, 1.2 * s, L, -10 * s); ctx.quadraticCurveTo(L * 0.95, 3 * s, L * 0.81, 4.6 * s); ctx.closePath(); ctx.fillStyle = '#6c7076'; ctx.fill();
    ctx.strokeStyle = acc[2]; ctx.lineWidth = 0.9 * s; ctx.beginPath(); ctx.moveTo(L * 0.81, 4 * s); ctx.quadraticCurveTo(L * 0.95, 2.6 * s, L * 0.995, -9 * s); ctx.stroke();
    ctx.fillStyle = ANIME.silver; ctx.fillRect(L * 0.785, -3.4 * s, 2.6 * s, 7 * s);
    return true;
  },
  // Soma's odachi: a black grip with gold menuki, a paper seal wound round it, a square gold-rimmed tsuba
  silent_odachi(ctx, sh, L, s) {
    _katanaBase(ctx, L, s);
    const acc = subTone('#e8c25c'), hl = 0.31;
    ctx.fillStyle = '#030303'; if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(-3.2 * s, -6.4 * s, 4.4 * s, 12.8 * s, 1.4 * s); ctx.fill(); } else ctx.fillRect(-3.2 * s, -6.4 * s, 4.4 * s, 12.8 * s);
    ctx.strokeStyle = acc[1]; ctx.lineWidth = 0.9 * s; ctx.strokeRect(-2.6 * s, -5.8 * s, 3.2 * s, 11.6 * s);
    ctx.fillStyle = SUB_PAPER[0]; ctx.fillRect(-L * hl * 0.42, -2.6 * s, L * 0.06, 5.2 * s);
    ctx.fillStyle = '#060505'; ctx.fillRect(-L * hl * 0.42 + L * 0.02, -2.6 * s, 0.9 * s, 5.2 * s);
    ctx.fillStyle = acc[1]; ctx.fillRect(-L * hl * 0.72, -1.4 * s, 3.4 * s, 1.6 * s);
    return true;
  },
  // the Echo Sentinel's crescents: a violet-wrapped grip, a silver crescent with a violet inner edge
  hollow_crescents(ctx, sh, L, s, f) {
    if (!f || !f.def || f.def.id !== 'echo_sentinel') return false;
    const acc = subTone('#9b8cff');
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#030303'; ctx.lineWidth = 6.4 * s; ctx.beginPath(); ctx.moveTo(-L * 0.18, 0); ctx.lineTo(0, 0); ctx.stroke();
    ctx.strokeStyle = acc[0]; ctx.lineWidth = 4.2 * s; ctx.stroke();
    ctx.strokeStyle = acc[1]; ctx.lineWidth = 0.9 * s; ctx.beginPath(); for (let i = 1; i < 5; i++) { const x = -L * 0.18 * i / 5; ctx.moveTo(x - 1.2 * s, -1.8 * s); ctx.lineTo(x + 1.2 * s, 1.8 * s); } ctx.stroke();
    ctx.beginPath(); ctx.arc(L * 0.45, -L * 0.05, L * 0.55, Math.PI * 0.95, Math.PI * 2.05, false); ctx.arc(L * 0.45, -L * 0.22, L * 0.42, Math.PI * 2.0, Math.PI * 0.98, true); ctx.closePath();
    ctx.fillStyle = ANIME.silver; ctx.fill(); ctx.strokeStyle = '#030303'; ctx.lineWidth = 1.2 * s; ctx.stroke();
    ctx.beginPath(); ctx.arc(L * 0.45, -L * 0.05, L * 0.47, Math.PI * 1.05, Math.PI * 1.95, false); ctx.strokeStyle = '#6c7076'; ctx.lineWidth = 2.4 * s; ctx.stroke();
    ctx.globalCompositeOperation = 'lighter'; ctx.beginPath(); ctx.arc(L * 0.45, -L * 0.22, L * 0.43, Math.PI * 1.02, Math.PI * 1.98, false); ctx.strokeStyle = 'rgba(155,140,255,0.7)'; ctx.lineWidth = 1.4 * s; ctx.stroke(); ctx.globalCompositeOperation = 'source-over';
    return true;
  },
  // the Echo Warden's cutter: a katana whose edge burns violet, a spiked dark tsuba
  cutter_blade(ctx, sh, L, s, f) {
    if (!f || !f.def || f.def.id !== 'echo_warden') return false;
    _katanaBase(ctx, L, s);
    const sori = L * 0.045, X = u => 1.4 * s + (L - 1.4 * s) * u;
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(155,140,255,0.55)'; ctx.lineWidth = 1.4 * s; ctx.beginPath();
    for (let i = 0; i <= 9; i++) { const u = 0.9 * i / 9; ctx.lineTo(X(u), -sori * u * u + lerp(1.75, 1.2, u / 0.9) * s * 0.85); } ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#030303'; ctx.beginPath(); _poly(ctx, [[-0.6 * s, -8 * s], [1.4 * s, -4 * s], [1.4 * s, 4 * s], [-0.6 * s, 8 * s], [-2.6 * s, 4 * s], [-2.6 * s, -4 * s]]); ctx.fill();
    ctx.strokeStyle = '#7c6ad6'; ctx.lineWidth = 0.8 * s; ctx.stroke();
    return true;
  }
});
function _naginataBlade(ctx, L, s) {
  ctx.beginPath(); ctx.moveTo(L * 0.78, -3.2 * s); ctx.quadraticCurveTo(L * 0.92, -3.6 * s, L, -10 * s); ctx.quadraticCurveTo(L * 0.95, 3 * s, L * 0.81, 4.6 * s); ctx.lineTo(L * 0.78, 4 * s); ctx.closePath();
}
// flat / outline passes for the weapons whose silhouette is not the shared shape's
const SUBB_WEAPON_FLAT = {
  gate_kanabo(ctx, L, s, ink) {
    ctx.strokeStyle = ink; ctx.lineCap = 'round'; ctx.lineWidth = 6 * s; ctx.beginPath(); ctx.moveTo(-L * 0.1, 0); ctx.lineTo(L * 0.3, 0); ctx.stroke();
    ctx.fillStyle = ink; ctx.beginPath(); _poly(ctx, [[L * 0.28, -4.6 * s], [L * 0.94, -11 * s], [L * 1.02, -8 * s], [L * 1.02, 8 * s], [L * 0.94, 11 * s], [L * 0.28, 4.6 * s]]); ctx.fill();
    return true;
  },
  conduit_naginata(ctx, L, s, ink, rim) {
    ctx.strokeStyle = ink; ctx.lineCap = 'round'; ctx.lineWidth = 4.6 * s; ctx.beginPath(); ctx.moveTo(-L * 0.42, 0); ctx.lineTo(L * 0.78, 0); ctx.stroke();
    if (rim) return true;
    _naginataBlade(ctx, L, s); ctx.fillStyle = ink; ctx.fill();
    return true;
  }
};
