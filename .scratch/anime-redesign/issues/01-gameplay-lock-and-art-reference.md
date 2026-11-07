# 01: Gameplay-lock test and art reference pack

**What to build:** A safety net and a style bible before any art changes. A deterministic scripted fight (Kage against an Order soldier, a Hollow, a sub-boss and each main boss, fixed RNG seed) records per-frame fighter states, skeleton joint positions, hitbox and hurtbox rectangles, damage events, i-frames and camera shake, and snapshots them, so any later ticket that changes gameplay fails it. Alongside it, an art reference pack: key frames extracted from the Gemini video, the three reference sheets (Slash, Guard, Parry, Counter, Combo, Air Launch, Follow Up, Shadow Step, Finisher, Idle, Dash, Aerial Slash, Kage Burst) and the existing boss key art and portraits, with a one-page style guide (palette tokens, line weight, rim light, eye glow, proportions) and a character replacement inventory (every fighter def, helmet, armour and weapon to redraw, and every animation state the renderer must support).

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] The scripted-fight snapshot test runs in `node --test tests/` and passes on the current build
- [ ] Changing any attack timing, damage or hitbox makes it fail (proven once, then reverted)
- [ ] The reference pack holds the video key frames, the reference sheets and the boss art, plus the style guide
- [ ] The inventory lists every player, enemy and boss look and each animation state
