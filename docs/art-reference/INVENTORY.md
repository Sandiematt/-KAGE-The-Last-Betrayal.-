# KAGE anime redesign: character replacement inventory

Everything the redesign has to redraw, and the ticket that owns each item. Ticket 13 uses this list as its checklist.

Sources: `ENEMIES`, `HELMETS`, `ARMORS`, `WEAPONS`, `MOVES`, `POSES` and `STANCES` in `src/js/10-data.js`; `SHAPE`, `drawHelmet`, `drawArmor`, `drawWeaponShape` and the cloth set-up in the `Fighter` constructor in `src/js/20-fighter.js`; and the draw sites listed at the end.

**What "look" means.** A gear item's *id* is what the save stores; its *look* is the drawing key the renderer switches on (`gearLook` in `15-logic.js`). An enemy's `helmet` or `armor` that is not a gear id is used as the look key directly. Ticket 02 builds the anime body and gives **every equippable look** a baseline anime version on Kage. A boss or sub-boss ticket then owns the full design of its own look keys, and that design is also what Kage wears when he equips the dropped item.

## 1. Fighter definitions (`ENEMIES` plus the player)

| Fighter | Type / family | Weapon (shape) | Helmet look | Armour look | Owner |
|---|---|---|---|---|---|
| **Kage** (player, `makePlayerFighter`) | player | equipped (default `kagetsu`, katana) | equipped (default `shiro_maki` → `topknot`) | equipped (default `tachibana_yoroi` → `tachibana`), outfit `gi` | **02** |
| Young Kage (`makeYoungKage`, Interlude spar) | player | `bokken` | `topknot` | `training` | **02** |
| order_footman | regular / order | cutter_blade (katana) | order_hood | order_garb | **03** |
| order_runner | regular / order | shadow_daggers (short, twin) | order_hood | order_garb | **03** |
| order_shieldbearer | regular / order | sentinel_spear (spear, shield stance) | order_kabuto | order_garb | **03** |
| order_chainthrower | regular / order | chain_hook (hook) | order_hood | order_garb | **03** |
| order_ironclad | regular / order | raider_cleaver (cleaver) | order_kabuto | order_plate | **03** |
| hollow_shade | regular / hollow | cutter_blade (katana) | hollow_shard | hollow_rags | **04** |
| hollow_tutorial (training husk) | regular / hollow | cutter_blade (katana) | hollow_shard | hollow_rags | **04** |
| hollow_flicker | regular / hollow | shadow_daggers (short) | hollow_shard | hollow_rags | **04** |
| hollow_ward | regular / hollow | temple_staff (staff) | hollow_shard | hollow_rags | **04** |
| hollow_mimic | regular / hollow | hollow_crescents (crescent) | hollow_shard | hollow_rags | **04** |
| hollow_husk (fists brute) | regular / hollow | iron_fists (none, fist gear) | hollow_shard | hollow_rags | **04** |
| hollow_kage (topknot; also the Witness's Hollow copies) | echo / hollow | kagetsu, or Kage's weapon | topknot | hollow_rags | **04** (Kage's design from 02, Hollow treatment) |
| kuroe | sub | temple_staff (staff) | sumi_eboshi | robe | **05** |
| garan | sub | iron_fists (fist gear) | oni | half_do (ikazuchi_do) | **05** |
| hisame | sub | mist_fans (fan, twin) | rain_hood (hisame_zukin) | mist_shroud (cape) | **05** |
| shiden | sub | vanguard_yari (spear) | sentinel_helm | vanguard_plate (shiden_yoroi) | **05** |
| tsugumi | sub | courier_kunai (short, twin) | courier_hat (hakobi_gasa) | shadow_cloak (hai_haori, cape) | **05** |
| sayo | sub | quiet_kodachi (katana) | veil (kasumi_men) | operative_vest (shirabe_do) | **05** |
| utsushi | sub / hollow | echo_crescents (crescent) | borrowed_mask (utsushi_men) | hollow_rags | **05** |
| kasane | sub | ledger_kusari (sickle) | storm_band (hachigane) | ledger_coat (kasane_haori) | **06** |
| gonryu | sub | gate_kanabo (hammer) | iron_kabuto (tetsu_kabuto) | gate_plate (tetsumon_do) | **06** |
| shizune | sub | disciple_blade (katana) | disciple_wrap (deshi_tenugui) | jerkin (kawa_do), outfit gi | **06** |
| moro | sub | conduit_naginata (spear) | oni_mask (oni_menpo) | conduit_harness (kudamaki_do) | **06** |
| soma | sub | silent_odachi (katana) | blademaster_kabuto (mokushi_kabuto) | pauldrons (o_sode) | **06** |
| echo_sentinel (placeholder) | sub | hollow_crescents (crescent) | oni | cloak (cape) | **06** |
| echo_warden (placeholder) | boss | cutter_blade (katana) | oni | tyrant (cape) | **06** |
| young_rem | sub | bokken | headband | training, outfit gi | **07** |
| hollow_rem (Core echo of Rem; also the adult Rem look) | sub / hollow | echo_rem_blade (katana) | headband | travel_coat | **07** |
| raikon | boss | raikon_tachi (odachi) | raijin_kabuto | raikon_plate | **08** |
| hollow_raikon | sub / hollow, echoOf raikon | echo_tachi (odachi) | raijin_kabuto | raikon_plate | **08** |
| akari | boss | akari_blades (short, twin) | akari_mask | mei_en (mei_en_garb) | **09** |
| hollow_akari | sub / hollow, echoOf akari | echo_fangs (short, twin) | akari_mask | mei_en | **09** |
| takashi | boss | takashi_blade (katana) | kasa → straw_kasa | shinsei (shinsei_yoroi), outfit gi | **10** |
| hollow_takashi | sub / hollow, echoOf takashi | echo_nameless (katana) | straw_kasa | shinsei | **10** |
| witness | boss | mugen_shards (katana, shard weapon) | witness_mask | kysmei (kysmei_robe) | **11** |

Clones (`spawnClones`), Akari's False Opening decoy (`spawnDecoy`) and boss minions (`spawnMinions`, `spawnHollowCopies`) reuse a definition above. They need no separate art, but they must keep working: `alpha`, transparent `eye`, and `echoes` afterimages.

## 2. Helmet looks (`drawHelmet` cases)

| Look key | Gear id(s) | Worn by | Owner |
|---|---|---|---|
| topknot | shiro_maki (default) | Kage, young Kage, hollow_kage | **02** |
| ronin_hood | kuro_zukin | gear | **02** → **13** (anime design, `29g-anime-gear.js`) |
| straw_kasa | sugegasa, kasa | gear; Takashi | **02** baseline / **10** Takashi |
| storm_band | hachigane | gear; Kasane | **02** / **06** |
| veil | kasumi_men | gear; Sayo | **02** / **05** |
| iron_kabuto | tetsu_kabuto | gear; Gonryu | **02** / **06** |
| oni_mask | oni_menpo | gear; Moro | **02** / **06** |
| sentinel_helm | hoshi_kabuto | gear; Shiden | **02** / **05** |
| sage_antlers | shika_kabuto | gear | **02** → **13** (`29g`) |
| hollow_crest | utsuro_kabuto | gear | **02** → **13** (`29g`) |
| executioner | shikko_zukin | gear | **02** → **13** (`29g`) |
| raijin_kabuto | raijin_kabuto | gear; Raikon, Hollow Raikon | **02** / **08** |
| sumi_eboshi | sumi_eboshi | gear; Kuroe | **02** / **05** |
| rain_hood | hisame_zukin | gear; Hisame | **02** / **05** |
| courier_hat | hakobi_gasa | gear; Tsugumi | **02** / **05** |
| borrowed_mask | utsushi_men | gear; Utsushi | **02** / **05** |
| disciple_wrap | deshi_tenugui | gear; Shizune | **02** / **06** |
| blademaster_kabuto | mokushi_kabuto | gear; Soma | **02** / **06** |
| order_hood, order_kabuto | (enemy only) | Order soldiers | **03** |
| hollow_shard | (enemy only) | Hollows | **04** |
| oni | (enemy only) | Garan, echo_sentinel, echo_warden | **05** (Garan) / **06** (echoes) |
| headband | (enemy only) | young Rem, Hollow Rem | **07** |
| akari_mask | (enemy only) | Akari, Hollow Akari | **09** |
| witness_mask | (enemy only) | the Witness | **11** |
| colossus, reaper_cowl, ashen_crown | none | unreferenced legacy cases | **13**: deleted |

## 3. Armour looks (`drawArmor` cases and capes)

| Look key | Gear id(s) | Worn by | Owner |
|---|---|---|---|
| tachibana | tachibana_yoroi (default) | Kage | **02** |
| jerkin | kawa_do | gear; Shizune | **02** / **06** |
| shadow_cloak (cape) | hai_haori | gear; Tsugumi | **02** / **05** |
| mist_shroud (cape) | kasumi_shroud | gear; Hisame | **02** / **05** |
| robe (hip cloth) | soryo_e | gear; Kuroe | **02** / **05** |
| lamellar | kozane_do | gear | **02** → **13** (`29g`) |
| storm_mantle (mantle + streamer) | raiun_mantle | gear | **02** → **13** (`29g`) |
| executioner_garb | shikko_garb | gear | **02** → **13** (`29g`) |
| pauldrons | o_sode | gear; Soma | **02** / **06** |
| colossus_plate | kurogane_do | gear | **02** → **13** (`29g`) |
| tyrant (cape) | goka_yoroi, kurokumo_yoroi | gear; echo_warden | **02** / **06** |
| half_do | ikazuchi_do | gear; Garan | **02** / **05** |
| vanguard_plate | shiden_yoroi | gear; Shiden | **02** / **05** |
| operative_vest | shirabe_do | gear; Sayo | **02** / **05** |
| ledger_coat | kasane_haori | gear; Kasane | **02** / **06** |
| gate_plate | tetsumon_do | gear; Gonryu | **02** / **06** |
| conduit_harness | kudamaki_do | gear; Moro | **02** / **06** |
| mei_en (Akari's own cut: `asash`) | mei_en_garb | gear; Akari | **02** / **09** |
| kysmei (+ `wcoat` tails) | kysmei_robe | gear; the Witness | **02** / **11** |
| shinsei (robe skirts) | shinsei_yoroi | gear; Takashi | **02** / **10** |
| order_garb, order_plate | (enemy only) | Order | **03** |
| hollow_rags | (enemy only) | Hollows, Utsushi, hollow_kage | **04** (Utsushi **05**) |
| raikon_plate (+ `rcloak`, robe) | (enemy only) | Raikon, Hollow Raikon | **08** |
| training | (enemy only) | young Rem, young Kage | **07** (young Kage **02**) |
| travel_coat | (enemy only) | Hollow Rem / adult Rem | **07** |
| cloak (cape) | (enemy only) | echo_sentinel | **06** |
| outfit `gi` (two belt tails) | n/a | Kage, Order, Takashi, Shizune, Rem | **02** body; per character above |

## 4. Weapon shapes (`drawWeaponShape` / `SHAPE`)

Ticket 02 redraws every shape on the new hands in muted silver (`STYLE.md`). A boss's own weapon detail belongs to that boss's ticket.

| Shape | Weapons | Owner |
|---|---|---|
| katana | kagetsu, shizuka, takashi_blade (gold tsuka: **10**), mugen_no_ha, mugen_shards (shards: **11**, `drawShardWeapon`), cutter_blade, quiet_kodachi, disciple_blade, silent_odachi, echo_nameless, echo_rem_blade | **02** |
| short / kagehira / yurei (twin) | tsubame, kagehira_yurei, akari_blades (**09**), shadow_daggers, courier_kunai, echo_fangs | **02** |
| odachi | raiko_no_tachi, raikon_tachi (**08**), echo_tachi | **02** |
| cleaver | onikiri, raider_cleaver | **02** |
| tyrant | tyrant_cleaver | **02** |
| spear | mizuchi, sentinel_spear, vanguard_yari, conduit_naginata | **02** |
| sickle | yamigama, ledger_kusari | **02** |
| hook | chain_hook | **02** |
| hammer | iwakudaki, gate_kanabo | **02** |
| staff | sage_staff, temple_staff | **02** |
| crescent | hollow_crescents, echo_crescents | **02** |
| fan | mist_fans | **02** |
| shinsen | shinsen | **02** |
| bokken | bokken | **02** |
| none (fist gear, `drawFistGear`) | fists, iron_fists, storm_orbs | **02** |

The saya (sheath) and the off-hand blade (`drawOffhand`) belong to **02**.

## 5. Animation states the body must support

Ticket 02 makes all of these read on Kage. Tickets 03 to 11 check idle, attack, hurt and death on each character. The skeleton and poses that drive them are gameplay: the gameplay-lock test records them, so the art follows the joints and never moves them.

- **Fighter states** (`Fighter.state`): idle, walk, run, prejump, air, land, dash, block, kickcharge, move, ability, hit, stun, juggle, down, getup, grabbed, throwing, pose, dead. Also `open` and `suspended`, which some abilities use.
- **Poses** (`POSES`): jump, fall, flip, flipTakeoff, flipFinish, land, dash, backstep, blockFists, blockArmed, hit, hitGut, launched, launchFall, tumble, brace, braceLand, jumpSquat, tuck, landPrep, down, getup, stun, dead, victory, taunt, gedan, hasso, bow, kneel, cast, castUp, grabbed. Story and boss scripts also set `raikonCall` and the boss pose tables `RAIKON_POSE`, `AKARI_POSE` and `TAKASHI_POSE` in `40-ai.js`.
- **Stances** (`STANCES`): fists, katana, twin, cleaver, spear, sickle, hammer, staff, orbs, shield.
- **Moves** (`MOVES`, with a wind-up `w`, strike `s` and follow-through `f` pose each):
  - Unarmed: p1, p2, p3 (punch string), rk (tap kick), hk (charged kick), ap and ak (air punch and air kick), slide, dp (dash punch), grab, kunai, pa1 and pa2 (palms).
  - Katana: k1, k2, k3, with ka (air) and kc (counter).
  - Twin blades: tw1 to tw5, with twa (air) and twc (counter).
  - Cleaver and odachi: c1, c2, c3, with ca (air).
  - Spear and staff: s1, s2, s3, with sa (air).
  - Sickle and hook: h1, h2, h3, with ha (air).
  - Hammer: m1, m2, with ma (air).
  - Shinsen and Takashi: sh1, sh2, sh3, with sha (air) and shc (counter).
- **Reference technique names and their in-game equivalents**:

  | Reference technique | In game |
  |---|---|
  | Slash | weapon chain step 1 (k1) |
  | Guard | `block` |
  | Parry | a block inside `PARRY_WINDOW` |
  | Counter | `kc` / `twc` / `shc`, or `counterStance` |
  | Combo | the chain of k1 to k3 or p1 to p3 |
  | Air Launch | p3 or the launcher into `juggle` |
  | Follow Up / Aerial Slash | ka, ap, ak |
  | Shadow Step | `dash` |
  | Kage Burst | the rage special (`SPECIAL_IMPL`) |
  | Finisher | the KO and `finalFlow` |
  | Idle / Ready | idle |
  | Dash | dash |

- **Boss abilities** (`BOSS_ABILITIES`, about 70 entries such as thunderSwing, stormBreak, redlineCounter, falseOpening, petalCross, guardReturn, finalFlow, echoReplication, voidSlash, memoryBreak, hollowCopies and the Hollow and sub-boss variants) pose the body through their `pose` field. Each boss ticket checks its own abilities.
- **Render-only modifiers the new body must honour**: flip and tumble rotation (`flipRot`, `bodyRot`), squash and stretch (`sqx`, `sqy`), `flash`, `alpha`, `opt.color` (flat passes), `opt.noEyes`, the outline pass, `drawFlipArcs`, the shadow, Hollow glitch and ghost offset, memory filter, `dissolve` / `memoryAsh`, the Witness `kageFrame` / `kageFlicker`, and render interpolation (`beginInterp` / `packRender`).

## 6. Places characters are drawn outside the fight

| Where | Code | What it draws | Owner |
|---|---|---|---|
| The fight itself | `Renderer.drawFight` (`50-world.js` ~771) → `Fighter.draw` | every fighter | 02 to 11 |
| The impact frame | `50-world.js` ~751 | `Fighter.draw` with `opt.color` (flat ink, bone or red) | **02** (must stay flat) |
| Afterimages and dash ghosts | `Effects.afterimage` → `ghosts`, drawn at `30-combat.js` ~208 | a **stick figure** of the skeleton points | **02** (see open question 1) |
| HUD medallions | `drawPortrait` (`70-ui.js` ~53), `UIManager.hud.portraits` | the live fighter, framed on the head | **02** (Kage), each foe's ticket |
| HUD boss card | `BOSS_ART` (`70-ui.js` ~66), `src/img/boss_*.webp` | painted key art (kept as is) | none |
| Profile screen | `70-ui.js` ~382 (`makePlayerFighter` + `poseFighter`) | Kage with equipped gear | **02** |
| Gear shop and inventory previews | `70-ui.js` ~561 to 603 (`drawFighterInto`, the ghost warrior) | Kage per helmet, armour and weapon, plus a ghost | **02** |
| Pre-fight tableau | `UIManager.preparePrefight` (`70-ui.js` ~639) → `Game.setTableau` → `Renderer.drawTableau` | Kage (or young Kage) against the stage foe, posed | **02** + each foe's ticket |
| Result screens | `70-ui.js` ~844 to 855 and ~1017 to 1029 (Boss Rush) | the winner in `victory` and the loser in `kneel`, or the foe in `taunt` | **02** + each foe's ticket |
| Echo Trials and Boss Rush cards | `70-ui.js` ~984 and ~1017 (`drawFighterInto`) | the last echo or boss, in `taunt` | the foe's ticket |
| Title backdrop | `Game.buildWarrior` (`60-engine.js` ~920) builds a posed Kage; `55-title.js` draws the painted `title-hero.webp` | the posed warrior (check whether it is still drawn) and the painted hero (kept) | **02** (warrior) |
| Splash | `65-splash.js` (`kage-*.webp` letters, `splash-art.webp`) | logo art only, no fighter | none |
| Story speaker busts | `SPEAKERS[*].portrait` (`52-story-art.js` 69 to 250): kage, rem, rem_adult, takashi, raikon, akari, witness, survivor, resident, order, narrator, recording. The bosses and Rem use the `face_*.webp` image when it loads. | code-drawn busts (`storyBust`, `storyEyes`) | **12** |
| Story illustrations | `ILLUSTRATIONS` (`52-story-art.js` 302 onward): `storyKageFigure` in epilogue_core, epilogue_collapse, hoshimura_ruins and memory_ash; `storyRemFigure` in epilogue_core and epilogue_collapse | flat primitive figures | **12** |
| Story viewer | `StoryPlayer.drawPortrait` (`68-story.js` ~164) | the speaker bust or face image | **12** |

## 7. Guard rails for every ticket

- **Gameplay lock.** `node --test tests/` includes `tests/gameplay-lock.test.js`. Art must leave it green without regenerating the snapshot. It records, without drawing: states, moves, skeleton joints, hitboxes and hurtboxes, hp, rage, guard, i-frames, the camera, shake, hit-stop and slow motion, and all hit events. It is deliberately blind to cloth (`updateCloth`) and to anything inside `draw`. So:
  - **Do not change** `BODY`, `POSES`, `STANCES`, `MOVES`, `computeSkeleton`, `updatePose`, `hitbox` or `hurtbox`, physics, AI, `Combat`, `Effects` timing or shake values, or the camera.
  - **Do not call `Math.random()` in fighter update code** (`Fighter.update` and everything it calls, except `updateCloth`) or in ability and AI code. It shifts the seeded stream and fails the lock even though nothing visible changed. In drawing code, prefer `f.seed()` or `_hash()` so art stays stable from frame to frame.
  - New cloth, such as scarves, sashes and coat tails, is free to add or restyle in the constructor and `updateCloth`.
- Only `UPDATE_SNAPSHOT=1 node --test tests/gameplay-lock.test.js` rewrites the snapshot, and only an intended gameplay change justifies it. The redesign has none.

## Open questions for the lead

1. **Stick-figure afterimages.** `Effects.afterimage` (dash, Shadow Step, Akari's decoy echoes, the Witness's copies) draws the ghost as lines between skeleton joints, which is a stickman. It counts as VFX, which the redesign must not change, yet ticket 13 requires zero stickmen. Suggested resolution for ticket 02: keep the trigger, timing and colour, and change only the drawing to a flat silhouette of the new body. The `ghosts` array can carry the fighter's packed render pose (`packRender`). That is a draw-only change, and the lock stays green.
2. **The white face-wrap (`shiro_maki`).** The references give Kage a red scarf and a black face, so the white face-wrap look and its cloth strips go. Ticket 02 should decide whether `shiro_maki` keeps its name and shop text ("White Face-Wrap") or is renamed in the UI copy. Renaming it is a text change and does not affect gameplay.
