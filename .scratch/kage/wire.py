import os
os.chdir('E:/PROJECTS/KAGE/KAGE/src/js/21-characters')
def rw(p, f):
    s = open(p, encoding='utf8').read(); t = f(s); assert t != s, p; open(p, 'w', encoding='utf8', newline='\n').write(t)

rw('kage/embroidery.js', lambda s: s + '''
// the 4-pointed Kage diamond: a silver star outline round a crimson core (the pauldron, the back tail)
function kageEmblem(g, cx, cy, rad, rot, line, core, U) {
  g.save(); g.translate(cx, cy); g.rotate(rot);
  g.strokeStyle = line; g.lineWidth = 0.85 * U; g.lineJoin = 'miter';
  g.beginPath();
  for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 2, ma = a + Math.PI / 4, ro = (k % 2 ? 0.95 : 1.15) * rad, ri = 0.28 * rad;
    k ? g.lineTo(Math.cos(a) * ro, Math.sin(a) * ro) : g.moveTo(Math.cos(a) * ro, Math.sin(a) * ro);
    g.lineTo(Math.cos(ma) * ri, Math.sin(ma) * ri);
  }
  g.closePath(); g.stroke();
  g.fillStyle = core; g.beginPath(); g.arc(0, 0, 0.2 * rad, 0, TAU); g.fill();
  g.restore();
}
''')
rw('kage/coat.js', lambda s: s.replace("  // Kage's embroidered coat is one full skirt (skirt.js), drawn in the flap's slot over both legs\n  if (co.embroider) { if (!back) this.drawKageSkirt(ctx, A, skin, U); return; }\n", ""))

def body(s):
    s = s.replace("  if (skin.witness) { witnessBody(this, ctx, front, flat, opt); return; }   // the Witness is its own mesh (bosses/witness/body.js)",
                  "  if (skin.witness) { witnessBody(this, ctx, front, flat, opt); return; }   // the Witness is its own mesh (bosses/witness/body.js)\n  if (skin.kage) { kageBody(this, ctx, front, flat, opt); return; }   // so is Kage (kage/body.js)")
    s = s.replace("  // (Kage's embroidered coat is one full skirt over both legs: drawn in the flap's slot, kage/skirt.js)\n  if (skin.coat && !skin.coat.embroider) this.drawCoatPanel(ctx, 'back', A, skin, U);", "  if (skin.coat) this.drawCoatPanel(ctx, 'back', A, skin, U);")
    s = s.replace("  if (skin.sash === 'kage') this.animeSash(ctx, S, A, U);\n  else if (skin.sash === 'obi'", "  if (skin.sash === 'obi'")
    s = s.replace("skin.sash !== 'kage' && ", "")
    return s
rw('_shared/body.js', body)
rw('_shared/neck.js', lambda s: s.replace("  if (skin.wrap) animeScarfWrap(ctx, S, A, U, n0, n1);   // Kage's scarf (kage/scarf.js)\n", ""))
rw('_shared/skins.js', lambda s: s.replace("  if (sk.order) orderCloths", "  kageCloths(f, sk);   // Kage's coat tails and front flap (kage/)\n  if (sk.order) orderCloths"))
rw('bosses/witness/_skin.js', lambda s: s.replace(
    "  f.cloths.push({ kind: 'coat', part: 'back', kageOnly: 1, c: new Cloth(8, 12 * s, { ph: 2.2, wind: 1150, grav: 1000, stiff: 1.5, hang: 0.55 }), at: 'hip', dx: 6, dy: -4 });\n  f.cloths.push({ kind: 'coat', part: 'flap', kageOnly: 1, c: new Cloth(7, 11.4 * s, { ph: 4.7, wind: 260, grav: 1250, stiff: 1.5, hang: 0.15 }), at: 'hip', dx: 1, dy: -3 });\n",
    "  kageCloths(f, sk, true);   // his coat tails and front flap (kage/_skin.js)\n"))
print('ok')
