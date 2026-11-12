/* KAGE — the last shop gear in the anime style (anime redesign, ticket 13).
   Four helmets and four armours only Kage can wear had kept their old primitive overlays (a plain black ball of a hood,
   a bare black triangle, line-drawn antlers, a floating crescent, a stroked torso blob with bands, a single blue string).
   They are redrawn here the way the sub-bosses' gear is (sub-bosses/): cel-shaded parts on the head frame
   and the spine frame, near-black cloth and dark metal, one accent per look, a fine red rim, and one flat colour on
   the flat passes (outline, impact frame, flash, afterimages).
     ronin_hood        Kuro Zukin: a black cloth hood wrapping the head to the jaw, an eye slit, a crimson cord round
                       the brow knotted at the back, a drape over the nape and a hood tail
     sage_antlers      Shika Kabuto: a riveted iron bowl, a jade-laced shikoro, a short visor and a pair of branched
                       lacquered antlers with jade tips
     hollow_crest      Utsuro Kabuto: a dark bowl and shikoro under a great hollow crescent swept back off the crown,
                       its inner edge lit violet
     executioner       Shikkō Zukin: a tall peaked hood of black cloth, a crimson-stitched seam up the peak, an eye slit
                       and a cord at the throat with one tail
     lamellar          Kozane-dō: a full dō of small lacquered scales in close rows laced bronze, scale sode, kusazuri
     executioner_garb  Shikkō Garb: a long black leather vest to the hips, a crimson-stitched front, a baldric with
                       iron rings, a high collar
     colossus_plate    Kurogane-dō: heavy riveted iron bands, an ember seam, a tall gorget, great studded sode and
                       iron kusazuri
     storm_mantle      Raiun Mantle: a storm-blue mantle over the shoulders with a lightning-cloud band, a glass clasp,
                       and a long blue streamer
     raijin_kabuto     the Raijin Kabuto as gear on Kage: the faceted iron bowl, peak, stepped neck guard and red crest,
                       now cel-shaded (Raikon's own jingasa is bosses/raikon/)
   Drawing only: nothing here moves a joint or touches gameplay. */

const GEAR_ACC = { ronin_hood: '#b02a31', sage_antlers: '#7fd0c8', hollow_crest: '#9b8cff', executioner: '#b02a31',
  lamellar: '#b08a4e', executioner_garb: '#b02a31', colossus_plate: '#d2603c', storm_mantle: '#7fb8ff' };

const GEAR_HOOD = ['#050404', '#0e0c0c', '#231f1e'];        // black hood cloth

const GEAR_HORN = ['#120e0a', '#251d15', '#4a3c2c'];          // lacquered antler horn

const GEAR_STORM = ['#05070b', '#0c1119', '#1d2836'];         // the Raiun Mantle's storm-blue black

function _gearAcc(key) { return subTone(GEAR_ACC[key] || '#b02a31'); }

// the looks this module draws (drawHelmet / drawArmor dispatch here)
const GEAR_HEAD_LOOKS = ['ronin_hood', 'sage_antlers', 'hollow_crest', 'executioner'];

const GEAR_ARMOR_LOOKS = ['lamellar', 'executioner_garb', 'colossus_plate', 'storm_mantle'];

// cloth for the looks (from animeCloths): the hood tails and the mantle's streamer
function gearCloths(f, sk) {
  const s = f.scale;
  if (f.helmet === 'ronin_hood') {
    f.cloths.push({ kind: 'scarf', c: new Cloth(8, 6.8 * s, { ph: 4.1, wind: 900, grav: 760, stiff: 1.8 }), at: 'head', color: GEAR_HOOD[1], rim: 'rgba(120,22,28,0.8)', w: 8 * s, w1: 2.6 * s, dy: 2, dx: 14 });
  }
  if (f.helmet === 'executioner') {
    f.cloths.push({ kind: 'scarf', c: new Cloth(6, 5.4 * s, { ph: 2.7, wind: 520, grav: 1000, stiff: 1.7 }), at: 'head', color: ANIME.crimson, w: 1.8 * s, w1: 1.2 * s, dy: 12, dx: 8 });
  }
  if (f.armor === 'storm_mantle') {
    f.cloths.push({ kind: 'ribbon', c: new Cloth(11, 8 * s, { ph: 4, wind: 1300, grav: 460, stiff: 1.85 }), at: 'neck', color: subTone(GEAR_ACC.storm_mantle)[1], rim: 'rgba(8,12,20,0.85)', w: 4.6 * s, w1: 1.4 * s, dy: 4, dx: 9 });
  }
  void sk;
}
