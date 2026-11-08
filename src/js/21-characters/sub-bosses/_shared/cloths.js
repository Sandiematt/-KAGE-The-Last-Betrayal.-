// cloth for the looks (from animeCloths): robes, haori skirts, the rain cape, hood tails and cords. By look, so Kage
// wearing the gear gets the same cloth; robe and haori skirts only under a gi (Kage's own coat already hangs there).
function subCloths(f, sk) {
  const s = f.scale, coat = sk.top === 'coat', add = (o) => f.cloths.push(Object.assign({ kind: 'sub' }, o));
  if (f.armor === 'robe' && !coat) {
    add({ part: 'robeB', c: new Cloth(9, 11.2 * s, { ph: 2.4, wind: 520, grav: 1150, stiff: 1.5, hang: 0.55 }), at: 'hip', dx: 6, dy: -4 });
    add({ part: 'robeF', c: new Cloth(8, 10.8 * s, { ph: 4.9, wind: 220, grav: 1300, stiff: 1.5, hang: 0.15 }), at: 'hip', dx: 1, dy: -3 });
  }
  if (f.armor === 'shadow_cloak' && !coat) {
    add({ part: 'haoriB', c: new Cloth(6, 10.4 * s, { ph: 2.9, wind: 900, grav: 1050, stiff: 1.5, hang: 0.55 }), at: 'hip', dx: 6, dy: -6 });
    add({ part: 'haoriF', c: new Cloth(5, 10 * s, { ph: 5.3, wind: 300, grav: 1250, stiff: 1.5, hang: 0.15 }), at: 'hip', dx: 1, dy: -5 });
  }
  if (f.armor === 'mist_shroud') add({ part: 'shroud', c: new Cloth(7, 10 * s, { ph: 5.2, wind: 1000, grav: 850, stiff: 1.4, hang: 0.4 }), at: 'sh', dx: 6, dy: 0 });
  if (f.helmet === 'rain_hood') {
    f.cloths.push({ kind: 'scarf', c: new Cloth(9, 7.4 * s, { ph: 3.5, wind: 1100, grav: 600, stiff: 1.8 }), at: 'head', color: RAIN[1], rim: 'rgba(60,96,150,0.85)', w: 7 * s, w1: 1.8 * s, dy: 4, dx: 14 });
    f.cloths.push({ kind: 'scarf', c: new Cloth(8, 6.8 * s, { ph: 6.4, wind: 900, grav: 700, stiff: 1.8 }), at: 'head', color: subTone(SUB_ACC.rain_hood)[1], w: 1.6 * s, w1: 1 * s, dy: -4, dx: 15 });
  }
  if (f.helmet === 'sentinel_helm') {
    // the agemaki cords at the back of the kabuto: two violet tassels
    f.cloths.push({ kind: 'scarf', c: new Cloth(5, 5.6 * s, { ph: 6, wind: 420, grav: 1000, stiff: 1.6 }), at: 'head', color: subTone(SUB_ACC.sentinel_helm)[1], w: 2.6 * s, w1: 3.4 * s, dy: -2, dx: 20 });
    f.cloths.push({ kind: 'scarf', c: new Cloth(4, 5.2 * s, { ph: 8.2, wind: 380, grav: 1050, stiff: 1.6 }), at: 'head', color: subTone(SUB_ACC.sentinel_helm)[0], w: 2.2 * s, w1: 3 * s, dy: 1, dx: 19 });
  }
  if (f.helmet === 'veil') {
    // the long drape from the back of the hood
    f.cloths.push({ kind: 'scarf', c: new Cloth(9, 7.6 * s, { ph: 5, wind: 760, grav: 760, stiff: 1.7 }), at: 'head', color: '#121118', rim: 'rgba(110,98,150,0.7)', w: 13 * s, w1: 5 * s, dy: -6, dx: 13 });
  }
  if (f.helmet === 'sumi_eboshi') {
    // the eboshi's chin cords, loose ends hanging behind the jaw
    f.cloths.push({ kind: 'scarf', c: new Cloth(5, 5 * s, { ph: 4, wind: 300, grav: 1100, stiff: 1.6 }), at: 'head', color: subTone(SUB_ACC.sumi_eboshi)[1], w: 1.4 * s, w1: 1 * s, dy: 8, dx: 10 });
  }
}

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
