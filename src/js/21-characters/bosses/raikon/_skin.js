/* KAGE — Raikon, the Lightning Ascendant, as an anime samurai (anime redesign, ticket 08), from his key art
   (boss_raikon.webp, face_raikon.webp). A main boss, so drawn heavier and more layered than the sub-bosses, and
   top-heavy as STYLE.md asks:
     head      a wide black jingasa (about 4.5 head radii across) edged in a thick red band, ribbed, a tall red flame
               crest leaning back off its crown and a red tassel on a cord at each end of the brim. Under it the black
               face with WHITE eyes (the rule; his key art's red eyes become a faint red rim light round the sockets
               and along the underside of the brim)
     mantle    a big white fur mantle over the back shoulder and round the back of the neck, swept back in long tufts
     coat      a dark armoured coat: a lacquered breastplate of three lames with red lacing under a crossed collar
               piped red, two red cords crossed over the chest, a red obi with a dark belt and a large silver ring at
               the front, two red cords hanging from the ring; the coat's long skirts split front and back, a red band
               near their torn hem
     sode      a large round lacquered shoulder plate on the near arm, ringed red, with the red cloud crest (mitsudomoe)
     cloak     a long tattered cloak from the shoulders (cloth kind 'rcloak'): black, a crimson band near its torn hem,
               a fine red edge
     tachi     raikon_tachi, the crimson-lit odachi (drawWeaponShape 'odachi', unchanged)
   Hollow Raikon (hollow_raikon, echoOf raikon) is the same design under the Hollow treatment (enemies/hollow/): the
   deep near-black palette with a violet cast, violet for red, the fur gone ash, the crest burnt down to torn stubs, the
   brim broken at the back, cracks glowing violet in the hat and the sode, a cracked mask shard over one cheek, the cloak
   and coat skirts torn into more and longer points, frayed cuffs, one tassel gone; the glitch, ghost and ash dissolve of
   Fighter.draw sit on top.
   Raikon's look is keyed on bossLook (his id or echoOf), so the Raijin Kabuto Kage wins keeps its own trophy helm.
   The storm VFX (36-storm.js, 37-vfx-sheets.js) anchor on skeleton joints (wt, head, hip, fha), which nothing here
   moves. Drawing only: no joint, timer or gameplay field is touched, and no randomness is used. */

const RAI_RED = ['#4e080c', '#b3121b', '#ff4a3c'];           // the brim band, crest, cords, obi

const RAI_RED_H = ['#1e1638', '#4a3a86', '#9b8cff'];         // the echo's: violet

const RAI_LACQ = ['#050404', '#0d0a0a', '#251b1b'];          // the jingasa's black lacquer

const RAI_LACQ_H = ['#07060b', '#100d18', '#272236'];

const RAI_FUR = ['#8c8580', '#d6d0c8', '#f1ede6'];            // the mantle: warm white in shadow, never pure white

const RAI_FUR_H = ['#2e2a3a', '#585170', '#8a82a6'];          // ash

const RAI_PLATE = ['#070607', '#121012', '#2c2629'];          // lacquered plate (breastplate, sode)

const RAI_RING = ['#4a4c52', ANIME.silver, ANIME.silverHi];

const RAI_RING_H = ['#2a2732', '#55505f', '#7d778a'];

const RAI_CLOAK = ['#050303', '#0d0808', '#211313'];

/* ---- skins ---- */
ANIME_SKINS.raikon = { top: 'coat', feet: 'boot', sleeve: 1.08, kote: true, collar: false, cuff: false, sash: 'raikon', acc: '#c3161e', raikon: 'boss' };

ANIME_SKINS.hollow_raikon = { top: 'coat', feet: 'boot', sleeve: 1.08, kote: true, collar: false, cuff: false, sash: 'raikon', raikon: 'hollow',
  hollow: { fray: 1, robe: {} } };   // `hollow` gives the deep palette and frayed cuffs; the robes are his own (rcoat, rcloak)

const _raiH = (f) => animeSkin(f).raikon === 'hollow';

const _raiRed = (f) => (_raiH(f) ? RAI_RED_H : RAI_RED);

// cloth (from animeCloths): the tattered cloak from the shoulders, the coat's long skirts from the waist
function raikonCloths(f, sk) {
  if (!sk.raikon) return;
  const s = f.scale;
  [[10, 15, 1.3, 40, 4, 4], [10, 14, 3.9, 34, 8, 12], [9, 13.4, 5.2, 30, 12, 0], [9, 12.6, 2.2, 26, 2, 18]].forEach(([n, seg, ph, w, dy, dx], i) =>
    f.cloths.push({ kind: 'rcloak', c: new Cloth(n, seg * s, { ph, wind: 1100 + i * 170, grav: 1000, stiff: 1.95 }), at: 'neck', w: w * s, dy, dx }));
  f.cloths.push({ kind: 'rcoat', part: 'back', c: new Cloth(8, 11.6 * s, { ph: 2.2, wind: 1000, grav: 1050, stiff: 1.5, hang: 0.5 }), at: 'hip', dx: 6, dy: -4 });
  f.cloths.push({ kind: 'rcoat', part: 'flap', c: new Cloth(7, 11 * s, { ph: 4.7, wind: 240, grav: 1250, stiff: 1.5, hang: 0.15 }), at: 'hip', dx: 1, dy: -3 });
}
