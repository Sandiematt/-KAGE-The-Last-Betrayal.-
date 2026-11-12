import os, re
os.chdir('E:/PROJECTS/KAGE/KAGE/src/js/21-characters/kage')
def rw(p, f):
    s = open(p, encoding='utf8').read(); t = f(s); assert t != s, p; open(p, 'w', encoding='utf8', newline='\n').write(t)

def skin(s):
    s = s.replace("new Cloth(8, 12.6 * s, { ph: 2.2, wind: 760, grav: 1150, stiff: 1.5, hang: 0.5 }), at: 'hip', dx: 7, dy: -7 }",
                  "new Cloth(7, 9.6 * s, { ph: 2.2, wind: 700, grav: 1150, stiff: 1.5, hang: 0.5 }), at: 'hip', dx: 8, dy: -7 }")
    s = s.replace("new Cloth(7, 11.2 * s, { ph: 5.9, wind: 520, grav: 1250, stiff: 1.5, hang: 0.34 }), at: 'hip', dx: 3, dy: -5 }",
                  "new Cloth(6, 9.4 * s, { ph: 5.9, wind: 460, grav: 1250, stiff: 1.5, hang: 0.34 }), at: 'hip', dx: 4, dy: -5 }")
    s = s.replace("new Cloth(7, 10.4 * s, { ph: 4.7, wind: 240, grav: 1350, stiff: 1.5, hang: 0.12 }), at: 'hip', dx: -3, dy: -5 }",
                  "new Cloth(6, 8.6 * s, { ph: 4.7, wind: 200, grav: 1400, stiff: 1.5, hang: 0.1 }), at: 'hip', dx: -4, dy: -5 }")
    return s
rw('_skin.js', skin)

def hair(s):
    i = s.index('const KG_HAIR = ['); j = s.index('function _kgHairPts')
    new = '''const KG_HAIR = [[1.12, -0.14, 1], [0.86, -0.56], [1.32, -0.74, 1], [0.66, -0.92], [0.3, -1.74, 1], [0.09, -1.08], [-0.73, -1.83, 1], [-0.48, -0.99],
  [-1.67, -1.31, 1], [-0.92, -0.6], [-2.18, -0.36, 1], [-1.05, -0.07], [-1.74, 0.6, 1], [-0.89, 0.41], [-0.94, 1.04, 1], [-0.45, 0.6],
  [-0.2, 0.06], [0.24, -0.34], [0.6, -0.4]];
const KG_HAIR_RIM = 15;   // the points that carry the outline (the rest close the shape inside the head)
// the lock in front of the ear, and the lit shards laid along the long edge of the upper spikes: [the valley before, the tip]
const KG_LOCK = [[0.3, -0.6], [0.36, -0.1], [0.14, 0.52, 1], [0.04, 0.02], [-0.2, 0.4, 1], [-0.3, -0.4]];
const KG_SHINE = [[3, 4], [5, 6], [7, 8], [9, 10]];

'''
    s = s[:i] + new + s[j:]
    s = s.replace('''    g.fillStyle = KG.hair[2];
    for (const sh of KG_SHINE) { g.beginPath(); g.moveTo(sh[0][0] * r, sh[0][1] * r); g.lineTo(sh[1][0] * r, sh[1][1] * r); g.lineTo(sh[2][0] * r, sh[2][1] * r); g.closePath(); g.fill(); }''',
'''    g.fillStyle = KG.hair[2];
    for (const [vi, ti] of KG_SHINE) {
      const v = pts[vi], tp = pts[ti], w = pts[ti + 1], a = _kgMix(v, tp, 0.2), b = _kgMix(v, tp, 0.88), c = _kgMix(_kgMix(v, w, 0.42), tp, 0.34);
      g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.closePath(); g.fill();
    }''')
    return s
rw('hair.js', hair)

def scarf(s):
    s = s.replace("const fold = [P(1.22, -10.4, 1), P(1.15, -1), P(1.21, 10.6, 1), P(1.02, 12.2), P(0.9, 3), P(0.97, -11.4, 1)];",
                  "const fold = [P(1.25, -10, 1), P(1.16, -2), P(1.22, 10, 1), P(1.06, 12.8), P(0.82, 8.4, 1), P(0.93, -1), P(0.96, -11.4, 1)];")
    s = s.replace('''    _kgLine(g, [P(1.16, -8), P(1.05, 1), P(1.08, 10)], KG.scarf[0], 1.1 * s);
    _kgLine(g, [P(1.04, -9), P(0.97, 2)], KG.scarf[0], 1 * s);
    _kgLine(g, [P(1.1, 4.5), P(1.0, 9)], KG.scarf[2], 0.9 * s);''',
'''    _kgLine(g, [P(1.17, -9), P(1.06, 0), P(1.1, 10.6)], KG.scarf[0], 1.1 * s);
    _kgLine(g, [P(1.05, -10), P(0.96, 0), P(0.9, 7)], KG.scarf[0], 1 * s);
    _kgLine(g, [P(1.1, 5), P(0.98, 9.4)], KG.scarf[2], 0.9 * s);''')
    return s
rw('scarf.js', scarf)

def arms(s):
    s = s.replace('''    // the crimson teeth along the open end, on both of its edges
    const m = Fa.at(0.37, 0.4 * s);
    _kgTeeth(g, c0, m, -Fa.ux, -Fa.uy, 1.7 * s, 2.6 * s, 3, red[1]);
    _kgTeeth(g, m, c1, -Fa.ux, -Fa.uy, 1.7 * s, 2.6 * s, 4, red[1]);''',
'''    // the crimson band along the open end, a fine line inside it
    const m = Fa.at(0.37, 0.4 * s), ox = -Fa.ux * s, oy = -Fa.uy * s;
    g.lineJoin = 'miter';
    _kgLine(g, [c0, m, c1].map(p => [p[0] + ox * 0.8, p[1] + oy * 0.8]), red[1], 3.4 * s);
    if (!far) _kgLine(g, [c0, m, c1].map(p => [p[0] + ox * 4.4, p[1] + oy * 4.4]), red[1], 0.8 * s);
    g.lineJoin = 'round';''')
    s = s.replace("with the hem's crimson\n   teeth,", "with the hem's crimson\n   band,")
    return s
rw('arms.js', arms)
def body(s):
    i = s.index('// the mountain teeth (yamagata)'); return s[:i].rstrip() + '\n'
rw('body.js', body)
rw('body.js', lambda s: s.replace("crimson (lining, obi, cords, the hem's mountain teeth)", "crimson (lining, obi, cords, the hem's band)"))
print('ok')
