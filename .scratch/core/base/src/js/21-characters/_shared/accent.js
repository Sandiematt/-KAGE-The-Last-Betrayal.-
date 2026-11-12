const _subToneC = {};

// an accent as [deep, base, bright]
function subTone(hex) {
  let v = _subToneC[hex]; if (v) return v;
  const rgb = _hexRGB(hex) || [200, 40, 40];
  return (_subToneC[hex] = [_mix(rgb, [0, 0, 0], 0.66), _mix(rgb, [0, 0, 0], 0.36), hex]);
}

// a sub-boss's own accent replaces crimson on its body parts (kote straps, collar, obi edges)
const _subPalC = new Map();

function subAccPal(pal, acc) {
  let m = _subPalC.get(pal); if (!m) _subPalC.set(pal, m = {});
  return m[acc] || (m[acc] = Object.assign({}, pal, { acc: subTone(acc)[1], accHi: acc }));
}
