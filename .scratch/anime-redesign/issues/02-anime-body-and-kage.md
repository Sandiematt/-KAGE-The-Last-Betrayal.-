# 02: Anime body replaces the stickman for every fighter; Kage fully designed

**What to build:** The tracer bullet. The stickman body (round-capped limbs, circle head, line-drawn parts) is deleted and every fighter, player and enemy alike, is drawn with a new anime samurai body on the existing skeleton: anatomical torso, shaped arms and legs with sleeves and hakama, hands that grip the weapon, footwear, a layered robe with fabric folds. Kage is fully designed to match the references: spiky dark hair, black face, softly glowing white eyes, red scarf, long charcoal coat with a crimson embroidered hem, sash, boots, katana with tsuba and sheath. He reads correctly in every state (idle, walk and run, jump, fall, land, every combo stage, dash, Shadow Step, guard, parry, counter, air launch, aerial slash, follow up, Kage Burst, finisher, hurt, knockdown, death, victory, kneel, taunt) and with every equippable weapon, helmet and armour. The rim-outline pass, flat flash and silhouette passes, flip arcs and squash and stretch work with the new body. The HUD medallion, profile and gear previews and result screens show the new Kage with no layout change.

**Art rule for every character:** BLACK FACE + WHITE EYES (soft glow, no nose or mouth) + DETAILED DARK SAMURAI CLOTHING (charcoal and black layered fabric, dark metallic armour, crimson embroidery, muted-silver weapon detail, fine red rim light). Style reference: the three reference sheets and the video frames in the art reference pack (ticket 01). Drawn as cel-shaded vector parts on the existing skeleton (rigged), never on the old stickman primitives. Combat, AI, attack patterns, VFX, screen shake, camera, HUD, menus and backgrounds stay unchanged, and the gameplay-lock test stays green.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] No stickman limb, head or torso primitive is drawn for any fighter; the old stickman code is deleted
- [ ] Kage matches the reference sheets in idle, slash, dash, aerial slash, Kage Burst and finisher poses (screenshots attached)
- [ ] Faces are black with white eyes; clothing shows visible layers, folds and crimson detail, not one flat black shape
- [ ] Facing, ground contact and weapon-in-hand alignment are correct in every state; nothing is cropped in the HUD portraits
- [ ] Gameplay-lock test green; full test suite green
