// render harness: ?m=kage|enemies|helmets|armors|weapons|ui|ghost  &z=zoom  &cw=cell width
const Q = new URLSearchParams(location.search);
if (Q.get('seed')) { let sd = +Q.get('seed'); Math.random = () => ((sd = (sd * 16807) % 2147483647) / 2147483647); }
const mode = Q.get('m') || 'kage';
const Z = +(Q.get('z') || 0.75);
const out = document.getElementById('out');
const save = Logic.defaultSave(); SaveManager.data = save;
function kage(extra) { return makePlayerFighter(SaveManager.data || save, Object.assign({}, extra || {})); }
let tmp = 0;
function posePartial(f, partial, stanceKey) {
  const st = STANCES[stanceKey || f.weapon().stance] || STANCES.fists;
  const name = '__h' + (tmp++);
  POSES[name] = Object.assign({}, st, partial);
  if (partial.ik == null) POSES[name].ik = st.ik || 0;
  poseFighter(f, name, +(Q.get('settle') || 60));
}
function poseMove(f, id, ph) { const m = MOVES[id]; if (!m) { console.warn('no move', id); return; } posePartial(f, Object.assign({}, m.w || {}, m[ph] || m.s)); }
function poseStance(f) { posePartial(f, {}); }
function settleState(f, st, n, extra) { poseFighter(f, null, 5); f.state = st; f.alive = st !== 'dead'; if (extra) extra(f); for (let i = 0; i < (n || 90); i++) { f.updatePose(STEP); f.computeSkeleton(); f.updateCloth(STEP); f.time += STEP; } }
function cells(list, cw, ch, cols) {
  cols = cols || Math.max(1, Math.floor(1900 / cw));
  const rows = Math.ceil(list.length / cols);
  out.width = cols * cw; out.height = rows * ch;
  const g = out.getContext('2d');
  g.fillStyle = '#1c1717'; g.fillRect(0, 0, out.width, out.height);
  list.forEach((it, i) => {
    const cx = (i % cols) * cw, cy = Math.floor(i / cols) * ch;
    g.save(); g.beginPath(); g.rect(cx, cy, cw, ch); g.clip();
    g.fillStyle = (i + Math.floor(i / cols)) % 2 ? '#211b1a' : '#1d1817'; g.fillRect(cx, cy, cw, ch);
    g.strokeStyle = 'rgba(255,255,255,0.08)'; g.beginPath(); g.moveTo(cx, cy + ch - 30); g.lineTo(cx + cw, cy + ch - 30); g.stroke();
    g.translate(cx + cw / 2, cy + ch - 30); g.scale(it.z || Z, it.z || Z);
    const f = it.f; g.translate(-(it.cx != null ? it.cx : f.x), 0);
    if (it.draw) it.draw(g, f); else {
      f.drawShadow && f.drawShadow(g);
      f.draw(g, Object.assign({ rim: 'rgba(222,96,72,0.72)', light: { x: 0.55, y: -0.83 }, shadow: true }, it.opt || {}));
    }
    g.restore();
    g.fillStyle = '#cfc6b4'; g.font = '13px sans-serif'; g.fillText(it.label || '', cx + 6, cy + ch - 10);
  });
}
const L = [];
const add = (label, f, opt) => L.push({ label, f, opt });
function build() {
  if (mode === 'kage' || mode === 'kage2') {
    const w = Q.get('w') || 'kagetsu';
    const mkK = () => kage({ weapon: w, wlvl: 1 });
    const list = mode === 'kage' ? [
      ['idle', f => poseStance(f)], ['walk', f => { posePartial(f, { fh: 40, fk: -20, bh: -30, bk: -40, lean: 10 }); }],
      ['k1 wind', f => poseMove(f, 'k1', 'w')], ['k1 strike', f => poseMove(f, 'k1', 's')], ['k1 follow', f => poseMove(f, 'k1', 'f')],
      ['k2 strike', f => poseMove(f, 'k2', 's')], ['k3 strike', f => poseMove(f, 'k3', 's')], ['ka aerial', f => poseMove(f, 'ka', 's')], ['kc counter', f => poseMove(f, 'kc', 's')],
      ['dash', f => poseFighter(f, 'dash', 60)], ['jump', f => poseFighter(f, 'jump', 60)], ['fall', f => poseFighter(f, 'fall', 60)], ['land', f => poseFighter(f, 'land', 60)],
      ['guard', f => poseFighter(f, 'blockArmed', 60)], ['hit', f => poseFighter(f, 'hit', 60)], ['launched', f => settleState(f, 'juggle', 25, g => { g.vy = -300; g.grounded = false; })],
      ['down', f => settleState(f, 'down')], ['dead', f => settleState(f, 'dead')], ['victory', f => poseFighter(f, 'victory', 60)], ['kneel', f => poseFighter(f, 'kneel', 60)],
      ['taunt', f => poseFighter(f, 'taunt', 60)], ['hasso', f => poseFighter(f, 'hasso', 60)], ['flip', f => poseFighter(f, 'flip', 60)], ['tumble', f => { f.bodyRot = 120; poseFighter(f, 'tumble', 60); }]
    ] : [
      ['p1', f => poseMove(f, 'p1', 's')], ['p3', f => poseMove(f, 'p3', 's')], ['hk', f => poseMove(f, 'hk', 's')], ['ak', f => poseMove(f, 'ak', 's')],
      ['slide', f => poseMove(f, 'slide', 's')], ['grab', f => poseMove(f, 'grab', 's')], ['getup', f => poseFighter(f, 'getup', 60)], ['stun', f => poseFighter(f, 'stun', 60)],
      ['bow', f => poseFighter(f, 'bow', 60)], ['gedan', f => poseFighter(f, 'gedan', 60)], ['cast', f => poseFighter(f, 'cast', 60)], ['hitGut', f => poseFighter(f, 'hitGut', 60)],
      ['facing left', f => { f.facing = -1; poseStance(f); }], ['facing left k1', f => { f.facing = -1; poseMove(f, 'k1', 's'); }],
      ['flat white', f => poseStance(f), { color: '#ece5d3' }], ['flat red', f => poseMove(f, 'k1', 's'), { color: '#d24a3c', noEyes: true }],
      ['alpha .5', f => { poseStance(f); f.alpha = 0.5; }], ['flash', f => { poseStance(f); f.flash = 0.1; }]
    ];
    for (const [n, fn, opt] of list) { const f = mkK(); if (n.indexOf('p') === 0 || ['hk', 'ak', 'slide', 'grab'].includes(n)) { f.hasWeapon = false; f.baseWeapon = 'fists'; } fn(f); add(n, f, opt); }
    cells(L, +(Q.get('cw') || 240), +(Q.get('ch') || 280));
  } else if (mode === 'ref') {
    const w = Q.get('w') || 'kagetsu';
    const list = [['idle', f => poseStance(f)], ['slash (k1)', f => poseMove(f, 'k1', 's')], ['dash', f => poseFighter(f, 'dash', +(Q.get('settle') || 60))],
      ['aerial (ka)', f => { f.grounded = false; f.y = -90; poseMove(f, 'ka', 's'); }], ['burst wind (k1 w)', f => poseMove(f, 'k1', 'w')], ['finisher (k3)', f => poseMove(f, 'k3', 's')], ['guard', f => poseFighter(f, 'blockArmed', +(Q.get('settle') || 60))]];
    for (const [n, fn] of list) { const f = kage({ weapon: w, wlvl: 1 }); fn(f); add(n, f); }
    cells(L, +(Q.get('cw') || 300), +(Q.get('ch') || 360), +(Q.get('cols') || 7));
  } else if (mode === 'enemies') {
    const ids = (Q.get('ids') || Object.keys(ENEMIES).join(',')).split(',');
    for (const id of ids) { const f = makeFighterFromEnemy(id, { facing: 1 }); poseStance(f); add(id, f); }
    cells(L, +(Q.get('cw') || 200), +(Q.get('ch') || 300));
  } else if (mode === 'order') {
    const ids = (Q.get('ids') || 'order_footman,order_runner,order_shieldbearer,order_chainthrower,order_ironclad').split(',');
    const MV = { katana: 'k1', twin: 'tw1', shield: 's1', spear: 's1', sickle: 'h1', cleaver: 'c1' };
    const cols = Q.get('flat') ? [['idle', f => poseStance(f), { color: '#0a0909' }], ['attack', f => poseMove(f, MV[f.weapon().stance] || 'k1', 's'), { color: '#0a0909' }], ['impact white', f => poseMove(f, MV[f.weapon().stance] || 'k1', 's'), { color: '#ece5d3' }]]
      : [['idle', f => poseStance(f)], ['attack wind', f => poseMove(f, MV[f.weapon().stance] || 'k1', 'w')], ['attack strike', f => poseMove(f, MV[f.weapon().stance] || 'k1', 's')],
         ['attack 2', f => { const m = MV[f.weapon().stance] || 'k1'; poseMove(f, m.replace('1', '2'), 's'); }], ['guard', f => poseFighter(f, 'blockArmed', 60)],
         ['hurt', f => poseFighter(f, 'hit', 60)], ['hurt gut', f => poseFighter(f, 'hitGut', 60)], ['dead', f => settleState(f, 'dead')]];
    for (const id of ids) for (const [n, fn, opt] of cols) { const f = makeFighterFromEnemy(id, { facing: Q.get('left') ? -1 : 1 }); fn(f); add(id.replace('order_', '') + ' · ' + n, f, opt); }
    cells(L, +(Q.get('cw') || 240), +(Q.get('ch') || 300), cols.length);
  } else if (mode === 'perf') {
    out.width = 900; out.height = 400; const g = out.getContext('2d'); const res = [];
    for (const id of (Q.get('ids') || 'order_footman,hollow_shade,hollow_ward,hollow_husk,hollow_kage').split(',')) {
      const f = makeFighterFromEnemy(id, { facing: 1 }); poseStance(f); f.glitchAmount = () => 0;
      const t0 = performance.now(); for (let i = 0; i < 60; i++) { g.save(); g.translate(300 - f.x, 380); f.draw(g, { rim: 'rgba(222,96,72,0.72)', light: { x: 0.55, y: -0.83 } }); g.restore(); }
      res.push(id + ' ' + ((performance.now() - t0) / 60).toFixed(2) + 'ms');
    }
    g.fillStyle = '#000'; g.fillRect(0, 0, 900, 400); g.fillStyle = '#fff'; g.font = '20px monospace'; res.forEach((r, i) => g.fillText(r, 10, 30 + i * 26));
  } else if (mode === 'hclose') {
    const ids = (Q.get('ids') || 'hollow_shade,hollow_tutorial,hollow_flicker,hollow_ward,hollow_mimic,hollow_husk,hollow_kage').split(',');
    for (const id of ids) { const f = makeFighterFromEnemy(id, { facing: 1 }); f.glitchAmount = () => 0; poseStance(f); add(id, f); }
    cells(L, +(Q.get('cw') || 380), +(Q.get('ch') || 520), +(Q.get('cols') || 4));
  } else if (mode === 'hollow') {
    const ids = (Q.get('ids') || 'hollow_shade,hollow_tutorial,hollow_flicker,hollow_ward,hollow_mimic,hollow_husk,hollow_kage').split(',');
    const mv = (f, i) => { const w = f.weapon(), b = w.defs ? w : WEAPONS[w.base]; const k = b && b.defs ? Object.keys(b.defs) : ['p1', 'p2']; return k[Math.min(i, k.length - 1)]; };
    const glitch = (f) => { f.glitchAmount = () => 0.42; };
    const cols = Q.get('flat') ? [['idle flat', f => poseStance(f), { color: '#0a0909' }], ['attack flat', f => poseMove(f, mv(f, 0), 's'), { color: '#0a0909' }], ['impact white', f => poseMove(f, mv(f, 0), 's'), { color: '#ece5d3' }], ['glitch', f => { poseStance(f); glitch(f); }], ['glitch atk', f => { poseMove(f, mv(f, 0), 's'); glitch(f); }]]
      : [['idle', f => poseStance(f)], ['attack wind', f => poseMove(f, mv(f, 0), 'w')], ['attack strike', f => poseMove(f, mv(f, 0), 's')], ['attack 2', f => poseMove(f, mv(f, 1), 's')],
         ['guard', f => poseFighter(f, 'blockArmed', 60)], ['hurt', f => poseFighter(f, 'hit', 60)], ['hurt gut', f => poseFighter(f, 'hitGut', 60)], ['dead', f => settleState(f, 'dead')]];
    for (const id of ids) for (const [n, fn, opt] of cols) { const f = makeFighterFromEnemy(id, { facing: Q.get('left') ? -1 : 1 }); f.glitchAmount = () => 0; fn(f); add(id.replace('hollow_', '') + ' · ' + n, f, opt); }
    cells(L, +(Q.get('cw') || 240), +(Q.get('ch') || 300), cols.length);
  } else if (mode === 'subs' || mode === 'sclose') {
    const ids = (Q.get('ids') || 'kuroe,garan,hisame,shiden,tsugumi,sayo,utsushi').split(',');
    const mv = (f, i) => { const w = f.weapon(), b = w.defs ? w : WEAPONS[w.base]; const k = b && b.defs ? Object.keys(b.defs) : ['p1', 'p2']; return k[Math.min(i, k.length - 1)]; };
    const cols = mode === 'sclose' ? [['idle', f => poseStance(f)]] : Q.get('flat') ? [['idle flat', f => poseStance(f), { color: '#0a0909' }], ['attack flat', f => poseMove(f, mv(f, 0), 's'), { color: '#0a0909' }], ['impact white', f => poseMove(f, mv(f, 0), 's'), { color: '#ece5d3' }], ['facing left', f => { f.facing = -1; poseStance(f); }]]
      : [['idle', f => poseStance(f)], ['attack wind', f => poseMove(f, mv(f, 0), 'w')], ['attack strike', f => poseMove(f, mv(f, 0), 's')], ['attack 2', f => poseMove(f, mv(f, 1), 's')],
         ['guard', f => poseFighter(f, f.shape() === 'none' || f.shape() === 'fan' ? 'blockFists' : 'blockArmed', 60)], ['hurt', f => poseFighter(f, 'hit', 60)], ['hurt gut', f => poseFighter(f, 'hitGut', 60)], ['dead', f => settleState(f, 'dead')]];
    for (const id of ids) for (const [n, fn, opt] of cols) { const f = makeFighterFromEnemy(id, { facing: 1 }); f.glitchAmount = () => 0; fn(f); add(id + ' · ' + n, f, opt); }
    if (mode === 'sclose') cells(L, +(Q.get('cw') || 380), +(Q.get('ch') || 520), +(Q.get('cols') || 4));
    else cells(L, +(Q.get('cw') || 240), +(Q.get('ch') || 300), cols.length);
  } else if (mode === 'rem' || mode === 'remclose' || mode === 'brothers') {
    const adultRem = (extra) => { const d = Object.assign({}, ENEMIES.hollow_rem, { id: 'rem', name: 'Rem', family: undefined, echoOf: undefined }); return new Fighter(Object.assign({ def: d, name: 'Rem', weapon: 'kagetsu', helmet: d.helmet, armor: d.armor, build: d.build, eye: d.eye, accent: d.accent, hp: d.hp, facing: 1 }, extra || {})); };
    const mk = { young_rem: () => makeFighterFromEnemy('young_rem', { facing: 1 }), rem: () => adultRem(), hollow_rem: () => { const f = makeFighterFromEnemy('hollow_rem', { facing: 1 }); f.glitchAmount = () => 0; return f; },
      kage: () => kage({ weapon: 'kagetsu', wlvl: 1 }), young_kage: () => makeYoungKage({ facing: 1 }) };
    const mv = (f, i) => { const w = f.weapon(), b = w.defs ? w : WEAPONS[w.base]; const k = b && b.defs ? Object.keys(b.defs) : ['k1', 'k2']; return k[Math.min(i, k.length - 1)]; };
    if (mode === 'brothers' || mode === 'remclose') {
      const ids = (Q.get('ids') || 'kage,young_kage,young_rem,rem').split(',');
      for (const id of ids) { const f = mk[id](); if (Q.get('atk')) poseMove(f, 'k1', 's'); else poseStance(f); add(id, f, Q.get('flat') ? { color: '#0a0909' } : null); }
      cells(L, +(Q.get('cw') || 380), +(Q.get('ch') || 520), +(Q.get('cols') || 4));
    } else {
      const ids = (Q.get('ids') || 'young_rem,rem,hollow_rem').split(',');
      const cols = Q.get('flat') ? [['idle flat', f => poseStance(f), { color: '#0a0909' }], ['attack flat', f => poseMove(f, 'k1', 's'), { color: '#0a0909' }], ['impact white', f => poseMove(f, 'k1', 's'), { color: '#ece5d3' }], ['facing left', f => { f.facing = -1; poseStance(f); }], ['glitch', f => { poseStance(f); f.glitchAmount = () => 0.42; }]]
        : [['idle', f => poseStance(f)], ['attack wind', f => poseMove(f, 'k1', 'w')], ['attack strike', f => poseMove(f, 'k1', 's')], ['attack 2', f => poseMove(f, 'k3', 's')], ['aerial', f => poseMove(f, 'ka', 's')],
           ['guard', f => poseFighter(f, 'blockArmed', 60)], ['hurt', f => poseFighter(f, 'hit', 60)], ['hurt gut', f => poseFighter(f, 'hitGut', 60)], ['dead', f => settleState(f, 'dead')]];
      for (const id of ids) for (const [n, fn, opt] of cols) { const f = mk[id](); fn(f); add(id + ' · ' + n, f, opt); }
      cells(L, +(Q.get('cw') || 220), +(Q.get('ch') || 300), cols.length);
    }
  } else if (mode === 'raikon' || mode === 'rclose') {
    const ids = (Q.get('ids') || 'raikon,hollow_raikon').split(',');
    const mk = (id) => { if (id === 'kage') { const k = kage({ helmet: 'raijin_kabuto', weapon: 'raiko_no_tachi', wlvl: 1 }); return k; } const f = makeFighterFromEnemy(id, { facing: Q.get('left') ? -1 : 1 }); f.glitchAmount = () => 0; if (Q.get('nok')) f.cloths = f.cloths.filter(c => c.kind !== Q.get('nok')); return f; };
    const mv = (f, i) => { const w = f.weapon(), b = w.defs ? w : WEAPONS[w.base]; const k = b && b.defs ? Object.keys(b.defs) : ['k1', 'k2']; return k[Math.min(i, k.length - 1)]; };
    const RP = (n) => f => { POSES['__r' + n] = Object.assign({}, RAIKON_POSE[n]); if (POSES['__r' + n].ik == null) POSES['__r' + n].ik = 0; poseFighter(f, '__r' + n, 60); };
    const cols = mode === 'rclose' ? [[Q.get('st') || 'idle', RAIKON_POSE[Q.get('st')] ? RP(Q.get('st')) : f => poseStance(f)]]
      : Q.get('flat') ? [['idle flat', f => poseStance(f), { color: '#0a0909' }], ['attack flat', f => poseMove(f, mv(f, 0), 's'), { color: '#0a0909' }], ['impact white', f => poseMove(f, mv(f, 0), 's'), { color: '#ece5d3' }], ['facing left', f => { f.facing = -1; poseStance(f); }], ['glitch', f => { poseStance(f); f.glitchAmount = () => 0.42; }]]
      : [['idle', f => poseStance(f)], ['attack wind', f => poseMove(f, mv(f, 0), 'w')], ['attack strike', f => poseMove(f, mv(f, 0), 's')], ['overhead', RP('overhead')], ['slam', RP('slam')], ['swing back', RP('swingBack')], ['swing through', RP('swingThrough')],
         ['guard', RP('guard')], ['hurt', f => poseFighter(f, 'hit', 60)], ['hurt gut', f => poseFighter(f, 'hitGut', 60)], ['dead', f => settleState(f, 'dead')]];
    for (const id of ids) for (const [n, fn, opt] of cols) { const f = mk(id); fn(f); add(id + ' · ' + n, f, opt); }
    if (mode === 'rclose') cells(L, +(Q.get('cw') || 520), +(Q.get('ch') || 600), +(Q.get('cols') || 2));
    else cells(L, +(Q.get('cw') || 260), +(Q.get('ch') || 340), +(Q.get('cols') || 6));
  } else if (mode === 'akari' || mode === 'aclose') {
    const ids = (Q.get('ids') || 'akari,hollow_akari').split(',');
    const mk = (id) => { if (id === 'kage') { return kage({ armor: 'mei_en_garb', weapon: 'kagehira_yurei', wlvl: 1 }); } const f = makeFighterFromEnemy(id, { facing: Q.get('left') ? -1 : 1 }); f.glitchAmount = () => 0; return f; };
    const AP = (n) => f => { POSES['__a' + n] = Object.assign({}, AKARI_POSE[n]); if (POSES['__a' + n].ik == null) POSES['__a' + n].ik = 0; poseFighter(f, '__a' + n, 60); };
    const one = Q.get('st');
    const cols = mode === 'aclose' ? [[one || 'idle', one && AKARI_POSE[one] ? AP(one) : one && MOVES[one] ? (f => poseMove(f, one, 's')) : f => poseStance(f)]]
      : Q.get('flat') ? [['idle flat', f => poseStance(f), { color: '#0a0909' }], ['attack flat', f => poseMove(f, 'tw1', 's'), { color: '#0a0909' }], ['impact white', f => poseMove(f, 'tw2', 's'), { color: '#ece5d3' }], ['facing left', f => { f.facing = -1; poseStance(f); }], ['decoy a=0.5', f => { AP('open')(f); f.alpha = 0.5; f.eye = 'rgba(0,0,0,0)'; }], ['afterimage', f => { AP('fangBack')(f); }, { ghost: 1 }], ['glitch', f => { poseStance(f); f.glitchAmount = () => 0.42; }]]
      : [['idle', f => poseStance(f)], ['tw1 strike', f => poseMove(f, 'tw1', 's')], ['tw2 strike', f => poseMove(f, 'tw2', 's')], ['tw3 strike', f => poseMove(f, 'tw3', 's')], ['fang back', AP('fangBack')], ['smoke crouch', AP('smokeCrouch')], ['open', AP('open')], ['punish', AP('punish')],
         ['cross guard', AP('crossGuard')], ['cross through', AP('crossThrough')], ['hurt', f => poseFighter(f, 'hit', 60)], ['hurt gut', f => poseFighter(f, 'hitGut', 60)], ['dead', f => settleState(f, 'dead')]];
    for (const id of ids) for (const [n, fn, opt] of cols) {
      const f = mk(id); fn(f);
      if (opt && opt.ghost) {
        const fx = new Effects(); fx.afterimage(f, 'rgba(180,140,240,0.5)'); for (const gh of fx.ghosts) gh.t = 0.02;
        L.push({ label: id + ' · ' + n, f, draw: (g) => fx.drawWorldBack(g) });
      } else add(id + ' · ' + n, f, opt);
    }
    if (mode === 'aclose') cells(L, +(Q.get('cw') || 520), +(Q.get('ch') || 600), +(Q.get('cols') || 2));
    else cells(L, +(Q.get('cw') || 220), +(Q.get('ch') || 320), +(Q.get('cols') || 7));
  } else if (mode === 'takashi' || mode === 'tclose') {
    const ids = (Q.get('ids') || 'takashi,hollow_takashi').split(',');
    const mk = (id) => { if (id === 'kage') return kage({ helmet: 'kasa', armor: 'shinsei_yoroi', weapon: 'kagetsu', wlvl: 1 }); if (id === 'kage_suge') return kage({ helmet: 'sugegasa', wlvl: 1 }); const f = makeFighterFromEnemy(id, { facing: Q.get('left') ? -1 : 1 }); f.glitchAmount = () => 0; return f; };
    const TP = (n) => f => { POSES['__t' + n] = Object.assign({}, TAKASHI_POSE[n]); if (POSES['__t' + n].ik == null) POSES['__t' + n].ik = 0; poseFighter(f, '__t' + n, 60); };
    const one = Q.get('st');
    const cols = mode === 'tclose' ? [[one || 'idle', one && TAKASHI_POSE[one] ? TP(one) : one && MOVES[one] ? (f => poseMove(f, one, 's')) : f => poseStance(f)]]
      : Q.get('flat') ? [['idle flat', f => poseStance(f), { color: '#0a0909' }], ['attack flat', f => poseMove(f, 'sh1', 's'), { color: '#0a0909' }], ['impact white', f => poseMove(f, 'sh3', 's'), { color: '#ece5d3' }], ['facing left', f => { f.facing = -1; poseStance(f); }], ['afterimage', f => { poseMove(f, 'sh2', 's'); }, { ghost: 1 }], ['glitch', f => { poseStance(f); f.glitchAmount = () => 0.42; }]]
      : [['idle', f => poseStance(f)], ['sh1 wind', f => poseMove(f, 'sh1', 'w')], ['sh1 strike', f => poseMove(f, 'sh1', 's')], ['sh2 strike', f => poseMove(f, 'sh2', 's')], ['sh3 strike', f => poseMove(f, 'sh3', 's')], ['cleave low', TP('cleaveLow')], ['guard return', TP('guard')],
         ['hurt', f => poseFighter(f, 'hit', 60)], ['hurt gut', f => poseFighter(f, 'hitGut', 60)], ['kneel', f => poseFighter(f, 'kneel', 60)], ['dead', f => settleState(f, 'dead')]];
    for (const id of ids) for (const [n, fn, opt] of cols) {
      const f = mk(id); fn(f);
      if (opt && opt.ghost) {
        const fx = new Effects(); fx.afterimage(f, 'rgba(232,194,92,0.5)'); for (const gh of fx.ghosts) gh.t = 0.02;
        L.push({ label: id + ' · ' + n, f, draw: (g) => fx.drawWorldBack(g) });
      } else add(id + ' · ' + n, f, opt);
    }
    if (mode === 'tclose') cells(L, +(Q.get('cw') || 560), +(Q.get('ch') || 620), +(Q.get('cols') || 2));
    else cells(L, +(Q.get('cw') || 240), +(Q.get('ch') || 330), +(Q.get('cols') || 6));
  } else if (mode === 'witness' || mode === 'wclose') {
    const ids = (Q.get('ids') || 'witness').split(',');
    const mk = (id) => { if (id === 'kage') return kage({ armor: 'kysmei_robe', weapon: Q.get('kw') || 'kagetsu', wlvl: 1 }); const f = makeFighterFromEnemy(id, { facing: Q.get('left') ? -1 : 1 }); f.glitchAmount = () => 0; f.witnessFlicker = () => false; return f; };
    const XP = (src) => f => { const n = '__w' + (tmp++); POSES[n] = Object.assign({}, src); if (POSES[n].ik == null) POSES[n].ik = 0; poseFighter(f, n, 60); };
    const WP = { cleaveLow: XP(TAKASHI_POSE.cleaveLow), swing: XP(RAIKON_POSE.swingThrough), cast: f => poseFighter(f, 'castUp', 60), guard: XP(TAKASHI_POSE.guard) };
    const one = Q.get('st');
    const extra = { kage: f => { poseStance(f); f.witnessFlicker = () => true; }, glitch: f => { poseStance(f); f.glitchAmount = () => 0.42; }, glitchc: f => { poseStance(f); f.glitchAmount = () => 0.42; f.corruptUntil = 99; },
      broken: f => { poseStance(f); f.coreBroken = true; }, dissolve: f => { poseStance(f); f.coreBroken = true; f.dissolve = 0.35; f.alpha = 0.85; f.sqx = 1.03; f.sqy = 0.96; },
      dissolve2: f => { poseStance(f); f.coreBroken = true; f.dissolve = 1.6; f.alpha = 0.6; f.sqx = 1.06; f.sqy = 0.92; } };
    const pick = (n) => extra[n] || WP[n] || (MOVES[n] ? (f => poseMove(f, n, 's')) : f => poseStance(f));
    const cols = mode === 'wclose' ? [[one || 'idle', pick(one)]]
      : Q.get('flat') ? [['idle flat', f => poseStance(f), { color: '#0a0909' }], ['attack flat', f => poseMove(f, 'k1', 's'), { color: '#0a0909' }], ['impact white', f => poseMove(f, 'k3', 's'), { color: '#ece5d3' }], ['facing left', f => { f.facing = -1; poseStance(f); }], ['afterimage', f => { poseMove(f, 'k2', 's'); }, { ghost: 1 }], ['glitch', extra.glitch], ['corrupt glitch', extra.glitchc], ['kage flicker', extra.kage], ['core broken', extra.broken], ['dissolve', extra.dissolve], ['dissolve late', extra.dissolve2], ['flash', f => { poseStance(f); f.flash = 0.1; }]]
      : [['idle', f => poseStance(f)], ['k1 wind', f => poseMove(f, 'k1', 'w')], ['k1 strike', f => poseMove(f, 'k1', 's')], ['k2 strike', f => poseMove(f, 'k2', 's')], ['k3 strike', f => poseMove(f, 'k3', 's')], ['void slash tell', WP.cleaveLow], ['void slash cut', WP.swing], ['cast (memory/copies)', WP.cast],
         ['guard return', WP.guard], ['hurt', f => poseFighter(f, 'hit', 60)], ['hurt gut', f => poseFighter(f, 'hitGut', 60)], ['dead', f => settleState(f, 'dead')]];
    for (const id of ids) for (const [n, fn, opt] of cols) {
      const f = mk(id); fn(f);
      if (opt && opt.ghost) {
        const fx = new Effects(); fx.afterimage(f, 'rgba(167,123,255,0.5)'); for (const gh of fx.ghosts) gh.t = 0.02;
        L.push({ label: id + ' · ' + n, f, draw: (g) => fx.drawWorldBack(g) });
      } else add(id + ' · ' + n, f, opt);
    }
    if (mode === 'wclose') cells(L, +(Q.get('cw') || 600), +(Q.get('ch') || 700), +(Q.get('cols') || 2));
    else cells(L, +(Q.get('cw') || 300), +(Q.get('ch') || 400), +(Q.get('cols') || 6));
  } else if (mode === 'kgear') {
    const hs = (Q.get('h') || 'sumi_eboshi,hisame_zukin,hoshi_kabuto,hakobi_gasa,kasumi_men,utsushi_men').split(',');
    const as = (Q.get('a') || 'soryo_e,ikazuchi_do,kasumi_shroud,shiden_yoroi,hai_haori,shirabe_do').split(',');
    for (const h of hs) { const f = kage({ helmet: h }); poseStance(f); add(h, f); }
    for (const a of as) { const f = kage({ armor: a }); poseStance(f); add(a, f); }
    cells(L, +(Q.get('cw') || 240), +(Q.get('ch') || 300), 6);
  } else if (mode === 'helmets' || mode === 'armors' || mode === 'weapons') {
    const tbl = mode === 'helmets' ? HELMETS : mode === 'armors' ? ARMORS : WEAPONS;
    for (const id of Object.keys(tbl)) {
      const o = {}; o[mode === 'helmets' ? 'helmet' : mode === 'armors' ? 'armor' : 'weapon'] = id; o.wlvl = 1;
      const f = kage(o); if (mode === 'weapons' && Q.get('mv')) poseMove(f, Q.get('mv'), Q.get('ph') || 's'); else poseStance(f);
      add(id, f);
    }
    cells(L, +(Q.get('cw') || 200), +(Q.get('ch') || 280));
  } else if (mode === 'sheet') {
    // the contact sheet: every character in idle, attack, hurt and death (ticket 13)
    const ids = (Q.get('ids') || '').split(',').filter(Boolean);
    const mvOf = (f) => { const ms = f.weapon().moves || (WEAPONS[f.weapon().base] || {}).moves || []; return ms[Q.get('mvi') ? +Q.get('mvi') : Math.min(1, ms.length - 1)] || ms[0] || 'pa1'; };
    const make = (id) => id === 'kage' ? kage() : id === 'young_kage' ? makeYoungKage({}) : id === 'rem_adult' ? STORY_CAST.rem({ facing: 1 }) : makeFighterFromEnemy(id, { facing: 1 });
    const vars = [['idle', f => poseStance(f)], ['attack', f => poseMove(f, mvOf(f), 's')], ['hurt', f => settleState(f, 'hit', 40)], ['death', f => settleState(f, 'dead', 120)]];
    for (const id of ids) for (const [vn, fn] of vars) {
      const f = make(id); f.x = 0; fn(f);
      let cx = null; if (vn === 'death') { const xs = SK_KEYS.map(k => f.sk[k].x); cx = (Math.min(...xs) + Math.max(...xs)) / 2; }
      L.push({ label: id + ' · ' + vn, f, cx });
    }
    cells(L, +(Q.get('cw') || 236), +(Q.get('ch') || 300), +(Q.get('cols') || 8));
  } else if (mode === 'diff') {
    // every fighter def and every gear look, in idle, attack, flat and impact-white passes (for before/after pixel diffs)
    const part = Q.get('part') || 'enemies', rows = [];
    const mvOf = (f) => { const ms = f.weapon().moves || (WEAPONS[f.weapon().base] || {}).moves || []; return ms[0] || 'pa1'; };
    const vars = [['idle', f => poseStance(f)], ['attack', f => poseMove(f, mvOf(f), 's')], ['flat', f => poseStance(f), { color: '#0a0909' }], ['white', f => poseMove(f, mvOf(f), 's'), { color: '#ece5d3' }], ['left', f => { f.facing = -1; poseStance(f); }]];
    const mk = part === 'enemies' ? Object.keys(ENEMIES).map(id => [id, () => makeFighterFromEnemy(id, { facing: 1 })])
      : part === 'helmets' ? Object.keys(HELMETS).map(id => [id, () => kage({ helmet: id })])
      : part === 'armors' ? Object.keys(ARMORS).map(id => [id, () => kage({ armor: id })])
      : Object.keys(WEAPONS).map(id => [id, () => kage({ weapon: id, wlvl: 1 })]);
    for (const [id, make] of mk) for (const [vn, fn, opt] of vars) { const f = make(); fn(f); L.push({ label: id + ' ' + vn, f, opt }); }
    cells(L, +(Q.get('cw') || 190), +(Q.get('ch') || 260), vars.length * 2);
  } else if (mode === 'ghost') {
    const f = kage(); poseFighter(f, 'dash', 60);
    const fx = new Effects();
    const cw = 700, ch = 330; out.width = cw; out.height = ch; const g = out.getContext('2d');
    g.fillStyle = '#1d1817'; g.fillRect(0, 0, cw, ch);
    g.save(); g.translate(200, ch - 30); g.scale(Z, Z);
    for (let i = 0; i < 4; i++) { f.x = i * 110; f.computeSkeleton(); fx.afterimage(f, i % 2 ? 'rgba(180,140,240,0.5)' : 'rgba(236,229,211,0.42)'); }
    f.x = 520; f.computeSkeleton();
    for (const gh of fx.ghosts) gh.t = 0.05;
    fx.drawWorldBack(g);

    f.draw(g, { rim: 'rgba(222,96,72,0.72)', light: { x: 0.55, y: -0.83 } });
    g.restore();
  } else if (mode === 'ui') {
    const cw = 900, ch = 420; out.width = cw; out.height = ch; const g = out.getContext('2d'); g.fillStyle = '#1d1817'; g.fillRect(0, 0, cw, ch);
    const mkc = (w, h) => { const c = document.createElement('canvas'); c.style.width = w + 'px'; c.style.height = h + 'px'; c.width = w; c.height = h; document.body.appendChild(c); return c; };
    const f = kage(); poseStance(f);
    const p = mkc(84, 84); drawPortrait(p, f, false);
    const e = makeFighterFromEnemy(Q.get('e') || 'order_footman'); poseStance(e); const p2 = mkc(84, 84); drawPortrait(p2, e, true);
    const pr = mkc(260, 380); const f2 = kage(); poseFighter(f2, 'hasso', 40); drawFighterInto(pr, f2, { glow: 'rgba(163,48,42,0.55)', rim: 'rgba(255,190,150,0.9)', fit: 0.95, tall: 1.3 });
    const gp = mkc(160, 220); const f3 = kage({ weapon: 'fists' }); poseStance(f3); drawFighterInto(gp, f3, { fit: 1.2, tall: 1.05, rim: 'rgba(236,229,211,0.25)', ground: 1.15 });
    g.drawImage(p, 20, 20, 168, 168); g.drawImage(p2, 200, 20, 168, 168); g.drawImage(pr, 400, 20); g.drawImage(gp, 700, 20);
  }
}
try { build(); document.title = 'ready'; } catch (e) { document.body.insertAdjacentHTML('beforeend', '<pre style="color:#f88;font-size:20px">' + e.stack + '</pre>'); console.error(e); }
if (mode === 'dbg') {
  const f = kage(); poseStance(f);
  const g = out.getContext('2d'); out.width = 900; out.height = 300; g.fillStyle = '#fff'; g.fillRect(0, 0, 900, 300); g.fillStyle = '#000'; g.font = '12px monospace';
  let y = 14;
  for (const cl of f.cloths) { const c = cl.c; g.fillText(cl.kind + ' ' + (cl.part || '') + ' n=' + c.n + ' seg=' + c.seg.toFixed(1) + ' pts=' + Array.from(c.px).map((x, i) => '(' + (x - f.sk.hip.x).toFixed(0) + ',' + (c.py[i] - f.sk.hip.y).toFixed(0) + ')').join(''), 4, y); y += 16; }
  g.fillText('hip ' + f.sk.hip.x.toFixed(0) + ',' + f.sk.hip.y.toFixed(0) + ' scale ' + f.scale, 4, y);
}
