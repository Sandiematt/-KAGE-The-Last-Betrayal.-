/* ---- weapons (ink mode; the flat and outline passes keep the shared shape from drawWeaponShape) ---- */

/* ---- weapons (ink mode; SUBB_WEAPON_FLAT gives the flat and outline passes the same silhouette where the shape
   differs from the shared one) ---- */
function _katanaBase(ctx, L, s) { drawWeaponShape(ctx, 'katana', L, 'ink', s, '#030303', null); }

// the local direction of world-down in the weapon frame (so a chain hangs under gravity whatever the swing)
function _localDown(ctx) {
  const m = ctx.getTransform ? ctx.getTransform() : null; if (!m) return [0, 1];
  const det = m.a * m.d - m.b * m.c || 1; let x = -m.c / det, y = m.a / det; const l = Math.hypot(x, y) || 1; return [x / l, y / l];
}

// flat / outline passes for the weapons whose silhouette is not the shared shape's
