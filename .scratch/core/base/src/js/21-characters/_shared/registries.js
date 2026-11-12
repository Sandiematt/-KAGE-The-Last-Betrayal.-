/* Registries the character folders fill at load time. They are declared here, in _shared/, because the build loads
   _shared/ before every character folder, so any folder may register into them at its top level.
   - SUB_WEAPON_ART[weapon id](ctx, sh, L, s, f): the weapon's ink-mode drawing (20-fighter.js drawWeaponShape)
   - SUBB_WEAPON_FLAT[weapon id](ctx, L, s, ink, rim, f): its flat / outline silhouette where the shared shape differs
   - SUB_HEADS / SUBB_HEADS[look]: a sub-boss helmet look (drawSubHead / drawSubBHead in sub-bosses/_shared/head.js)
   - SUB_ARMORS / SUBB_ARMORS[look]: a sub-boss armour look (drawSubArmor / drawSubBArmor in sub-bosses/_shared/torso.js) */
const SUB_WEAPON_ART = {};
const SUBB_WEAPON_FLAT = {};
const SUB_HEADS = {}, SUBB_HEADS = {};
const SUB_ARMORS = {}, SUBB_ARMORS = {};
