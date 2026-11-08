/* KAGE — the Act I and Act II sub-bosses as anime samurai (anime redesign, ticket 05).
   Same rule as everyone: a black face with white eyes, near-black layered cloth, dark metal, a fine red rim. Each keeps
   its own accent (its ENEMIES `accent`), weapon and title, and reads apart by silhouette at gameplay zoom:
     kuroe    the Ink Censor: a tall black lacquered eboshi slashed with a pale ink stroke and hung with a redaction
              slip, a monk's robe to the ankles with huge sleeves, a gold-trimmed kesa across the chest, a ringed
              shakujō staff with an ink-brush tassel
     garan    the Stormbroken: a horned iron brow band and wild mane over a snarling red oni menpō, a half dō burnt
              ragged down the middle with a glowing lightning scar, one huge laced sode, heavy iron tekko gauntlets
     hisame   the Rain Courier: a close hood with a stiff oiled visor and a face cloth, a fringed rain capelet and a
              long fringed rain cape (mino) from the shoulders, a message tube across the back, slim bound legs,
              lacquered war fans with rain-streaked paper
     shiden   the Last Lieutenant: a star-riveted hoshi kabuto with a forked lightning maedate, a full dō laced in
              violet, stacked sode, kusazuri, and a sashimono banner on his back; a violet-tasselled yari
     tsugumi  the Memory Courier: a wide flat hakobi-gasa hung with three glowing memory vials, an ash haori to the
              knee flecked pale, a satchel of vials at the hip, ring-pommel kunai
     sayo     the Quiet Hand: a close hood with a silver brow band and a mist face cloth, a long drape from the back of
              the head, a strip vest with a strap of message slips, a small shoulder guard, a kodachi in its saya
     utsushi  the Borrowed Face (Hollow): a borrowed white mask that does not quite fit, cracked, its painted face
              slipping between expressions, the eyes glowing through its holes; torn robes and long torn hood tails,
              scraps of the operative's vest it copied
   Each helmet and armour look is also gear Kage can wear (sumi_eboshi, hisame_zukin, hoshi_kabuto, hakobi_gasa,
   kasumi_men, utsushi_men; soryo_e, ikazuchi_do, kasumi_shroud, shiden_yoroi, hai_haori, shirabe_do): the parts are
   drawn per look, so they sit on his body the same way. Drawing only: nothing here moves a joint or touches gameplay. */

// accents per look (the wearer's identity colour), and black lacquer / iron / cloth tones
const SUB_ACC = { sumi_eboshi: '#c9a45c', robe: '#c9a45c', oni: '#ff6a52', half_do: '#ff6a52', rain_hood: '#7fb8ff', mist_shroud: '#7fb8ff',
  sentinel_helm: '#b07cff', vanguard_plate: '#b07cff', courier_hat: '#a98ad8', shadow_cloak: '#a98ad8', veil: '#9b8cc9', operative_vest: '#9b8cc9', borrowed_mask: '#c9bdff' };

const SUB_LACQ = ['#060607', '#111114', '#2a2a30'];

const SUB_LACQ_FAR = ['#050506', '#0b0b0d', '#18181c'];

const SUB_IRON = ['#08090a', '#16181b', '#33373e'];

const SUB_WOOD = ['#0b0806', '#17110c', '#2e231a'];

const SUB_PAPER = ['#857d6c', '#c4bba5', '#e4dcc8'];     // the censor's slips and Sayo's message slips: dull, never white

const SUB_GLASS = ['#1a1626', '#2c2640', '#5a5078'];

/* KAGE — the Act II / III sub-bosses and the Echo placeholders as anime samurai (anime redesign, ticket 06).
   Same rule as everyone: a black face with white eyes, near-black layered cloth, dark metal, a fine red rim. Each keeps
   its own accent (its ENEMIES `accent`), weapon and title, and reads apart by silhouette at gameplay zoom:
     kasane   the Ledger Warden: swept-back hair tied short under a hachigane (an iron brow plate engraved with a struck
              ledger entry, violet band tails), a knee-length haori shingled with pasted ledger pages, some struck through
              in violet, a bound ledger at the hip, a kusarigama whose chain hangs from the butt
     gonryu   the Gate Warden: a tetsu kabuto with a ribbed iron bowl, a deep laced shikoro and great gold kuwagata over an
              iron menpō; a flat-fronted dō built like the Fortress door (iron boards, straps, gold gate studs and the
              kannuki bar across it), one huge studded sode, a rope belt with a gate-knocker ring; a studded iron kanabo
     shizune  the First Disciple: a dull cotton tenugui knotted over her bound hair (the Tachibana ring half unpicked), a
              long ponytail, a fitted leather kawa-dō laced pale gold over her training gi, a plain brown obi, a katana
              with a pale-gold wrap and the school ring on its tsuba
     moro     the Conduit Warden: a close hood under an iron brow plate with two short horns and a dark oni menpō cracked
              with violet light, a conduit tube from the hood into a canister on his back, a leather harness coiled with
              glowing glass tubes; a naginata with a conduit running up its shaft
     soma     the Silent Blademaster: a tall mokushi kabuto with a straight pale-gold blade crest laid across the brow, a wide
              swept shikoro and a closed menpō bound shut with a gold cord (the oath); a full dō and two great ō-sode laced
              gold; an odachi with a paper seal round its grip
     echo_sentinel / echo_warden (the placeholders): a violet-lit oni. The sentinel is light: a hood, a full oni mask with
              long swept horns, a long ragged cloak and violet crescents. The warden is heavy: a spiked oni kabuto with long
              horns and a fanged menpō, a heavy dō with spiked sode and a great torn cape, a violet-edged cutter blade
   Every helmet and armour look here is also gear Kage can wear (hachigane, tetsu_kabuto, oni_menpo, deshi_tenugui,
   mokushi_kabuto; kasane_haori, tetsumon_do, kudamaki_do, kawa_do, o_sode, goka_yoroi / kurokumo_yoroi): the parts are
   drawn per look, so they sit on his body the same way, over his own hair and coat. Drawing only: nothing here moves a
   joint or touches gameplay. */

// each look's own accent (on Kage, or on anyone without one of their own)
const SUBB_ACC = { storm_band: '#7fb8ff', ledger_coat: '#b48ae6', iron_kabuto: '#c9a45c', gate_plate: '#c9a45c', disciple_wrap: '#d9c08a', jerkin: '#d9c08a',
  oni_mask: '#d24a3c', conduit_harness: '#9b7cff', blademaster_kabuto: '#e8c25c', pauldrons: '#c9a45c', tyrant: '#d24a3c', cloak: '#9b8cff', oni: '#9b8cff' };

const SUBB_IDS = { kasane: 1, gonryu: 1, shizune: 1, moro: 1, soma: 1, echo_sentinel: 1, echo_warden: 1 };

const LEATHER = ['#0c0907', '#18110d', '#30241b'];

const GOLDM = ['#4a3c1e', '#8a7440', '#c9a45c'];          // dull gold fittings (gate studs, lacing knots)

const VIOLET_LACQ = ['#09070d', '#141020', '#2b2340'];    // Moro's and the echoes' violet-black lacquer

const CROWN_GOLD = ['#5c4a24', '#a8893f', '#e0c27a'];

const PALE_GOLD = ['#6e5a2a', '#c9a957', '#f0d890'];

function _subbAcc(f, key) { const sk = f ? animeSkin(f) : null; return subTone((sk && sk.sub && sk.acc) || SUBB_ACC[key] || '#b02a31'); }
