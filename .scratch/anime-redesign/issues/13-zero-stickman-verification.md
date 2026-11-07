# 13: Zero-stickman verification and cleanup

**What to build:** Proof that the redesign is complete and nothing else changed. A test asserts every fighter def and every equippable helmet, armour and weapon resolves to anime art, with no primitive fallback path. A screenshot sweep captures every character in every animation state in-game, plus the HUD, main menu, profile, gear, results, Echo Trials and Boss Rush screens, compared against pre-redesign captures to confirm the UI and backgrounds are unchanged. Leftover primitive helmet and armour overlay code that no longer draws anything is deleted, and the README is updated.

**Blocked by:** 03, 04, 05, 06, 07, 08, 09, 10, 11, 12

**Status:** ready-for-agent

- [ ] Automated check: no fighter, gear item or story figure can render with the old stickman or primitive art
- [ ] Screenshot sweep reviewed: black faces, white eyes, detailed clothing, correct facing, no cropping, weapons in hand
- [ ] HUD, main menu and backgrounds are identical to the pre-redesign captures outside the character areas
- [ ] Gameplay-lock test and full suite green; the build produces index.html
