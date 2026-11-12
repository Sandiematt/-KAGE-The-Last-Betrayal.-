# Character art: one folder per character, one file per body part

Every fighter in KAGE is drawn by the code in this folder: cel-shaded vector parts on the fighter's skeleton
(`Fighter.sk` in `../20-fighter.js`). The look and the rules are in `docs/art-reference/STYLE.md`. Nothing here moves a
joint or touches gameplay.

```
21-characters/
  _shared/            the rig every character is dressed on
    body.js           Fighter.prototype.silhouette: the draw order of every part (start here)
    palette.js        ANIME colour tokens, animePalette, animeState (light, palette per fighter)
    cel-shading.js    celFill (base / shadow / highlight / red rim), animeFold
    skins.js          ANIME_SKINS (+ the shared fallback), animeSkin, animeCloths
    registries.js     SUB_WEAPON_ART, SUB_HEADS, SUB_ARMORS, ... the tables character folders register into
    face.js           the profile every fighter wears (brow, nose, lips, chin, a strip of light down it); a skin picks
                      its own with `face:` (a FACE_PROFILES name or an object of the same fields)
    eyes.js  neck.js  torso.js  arms.js  hands.js  waist.js  legs.js  feet.js  saya.js
    shapes.js  head-shapes.js  part-helpers.js  cloth-panels.js  wear-and-tear.js  accent.js  afterimage.js
  kage/               _skin.js  hair.js  scarf.js  coat.js  skirt.js  embroidery.js  sash.js
    armory/           the Armory's armour line on the shadow design (Shinobi Garb to Mugen Armor): _themes.js (each
                      armour's tones and pieces), hem.js (the cut hem and the art along it), pieces.js (chest, shoulder,
                      kasa, scarf strands), glow.js (the Godot-baked halo, fire, wisps and crackle; godot/armor-glow)
    gear/             the shop helmets and armour drawn on Kage (_skin.js head.js torso.js arms.js)
    shadow/           Kage's silhouette design (the default): _design.js body.js head.js torso.js limbs.js coat.js scarf.js
                      a flat ink figure read by a crimson key light and a tan back light, a cloud-hemmed coat, a
                      two-tailed scarf. `KAGE_DESIGN.shadow` (_design.js) picks it over the armoured design in kage/*.js;
                      `?kage=classic` in the URL starts on the armoured one, F8 flips between the two in a fight
  enemies/
    order/            the Order of Silence: _skin.js head.js torso.js arms.js waist.js legs.js shield.js
    hollow/           the Hollows: _skin.js head.js torso.js robe.js mantle.js arms.js hands.js waist.js
  sub-bosses/
    _shared/          the sub-boss rig: tones, cloth, layers, panels, belts, sode, and the head / armour dispatchers
    kuroe/ garan/ hisame/ shiden/ tsugumi/ sayo/ utsushi/            Act I and Act II sub-bosses
    kasane/ gonryu/ shizune/ moro/ soma/ echo_sentinel/ echo_warden/  Act II / III sub-bosses and the echo placeholders
                      each: _skin.js head.js torso.js (+ weapon.js, back.js, cloak.js, hands.js where it has one)
  bosses/
    rem/              _skin.js hair.js head.js coat.js waist.js
    raikon/           _skin.js head.js fur-mantle.js torso.js arms.js waist.js skirts.js cloak.js emblem.js layers.js
    akari/            _skin.js head.js hair.js torso.js arms.js legs.js waist.js sash.js tail.js sakura.js cloth-strips.js layers.js
                      art.js: the boss is drawn from the user's art, cut and rigged in Godot (godot/akari-rig, exported by
                      tools/akari-rig/game.py to AKARI_PARTS + akari_parts.webp): skinned parts posed on her skeleton,
                      spring-bone hair and cloth, spinning scythe flowers; the drawn files above stand in before the atlas
                      decodes, under Node, and for Hollow Akari
    takashi/          _skin.js head.js hair.js torso.js arms.js waist.js skirts.js cape.js ribbons.js embroidery.js weapon.js layers.js
    witness/          _skin.js body.js head.js torso.js arms.js legs.js waist.js coat.js core.js halo.js kysmei-shards.js veins.js weapon.js
                      (the Witness is its own mesh: body.js draws its whole figure, no _shared/ part is used)
```

## Naming

| File | Holds |
|---|---|
| `_skin.js` | the character's colour tones, its `ANIME_SKINS.<id>` entry (which top, coat cut, footwear, sash, accent) and its cloth set-up (`<name>Cloths`) |
| `head.js` | the helmet, hat or mask and the face markings drawn in the head frame |
| `hair.js`, `eyes.js`, `face.js`, `neck.js` | as named |
| `torso.js` | the chest: armour, robe or coat front (`drawArmor` looks) |
| `arms.js`, `hands.js`, `legs.js`, `feet.js`, `waist.js` | sleeves and shoulder plates, gloves and fists, hakama / leggings, boots / sandals, obi / belt / sash |
| `coat.js`, `cape.js`, `cloak.js`, `robe.js`, `skirts.js`, `tail.js`, `back.js` | cloth and pieces behind or below the body |
| `weapon.js` | the character's weapon drawing (`SUB_WEAPON_ART.<weapon id> = ...`) |
| `layers.js` | the character's hook into the body's draw order (`<name>Layer(f, ctx, A, skin, U, layer)`) |

## Load order (the one rule)

The build (`build.mjs`), the test loader (`tests/helpers/load-sim.js`) and the render harness concatenate every `.js`
under `src/js` in path order into one scope, so `21-characters/` loads after `20-fighter.js` and, inside it, `_shared/`
first, then `bosses/`, `enemies/`, `kage/`, `sub-bosses/` (and in each folder `_skin.js` first, `_` sorting before
letters). Functions are hoisted, so a file can call any function from any other file. Only **top-level** code that reads
another file's `const` needs order: keep such constants in `_shared/` or in the folder's own `_skin.js`, and declare any
table several folders register into in `_shared/registries.js`.

## Adding a character

1. Make `<group>/<name>/_skin.js` with its tones and `ANIME_SKINS.<enemy id> = { ... }`.
2. Add a file per new part. A new helmet or armour look of a sub-boss registers itself: `SUB_HEADS.<look> = function (...)`
   (see any `sub-bosses/*/head.js`); bosses get a `drawHelmet` / `drawArmor` case in `20-fighter.js` calling their function.
3. Run `node build.mjs` and `node --test tests/` (the anime-coverage test fails if any fighter, look or weapon has no art).
