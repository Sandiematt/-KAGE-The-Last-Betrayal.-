import re
p = 'src/js/13-budo.js'
s = open(p, encoding='utf8').read()
a = s.index("  emit(world, f, ev, other, m) {")
b = s.index("  /* ---- AI: a style's own strings ---- */")
c = s.index("  /* ---- per tick (FightSession.simulate) ---- */")
end = s.rindex("};")
fight1 = s[a:b]            # emit, join, criticals, posture
pick = s[b:c]              # pickString (pure)
fight2 = s[c:end]          # step, drawWorld
head = s[:a]
# stale() is pure: keep it in 13
m = re.search(r"  // a repeated move wears a guard down less each time\n  stale\(att\) \{[^\n]*\n", fight1)
stale = m.group(0); fight1 = fight1.replace(stale, '')
pure = head + stale + '\n' + pick.rstrip() + '\n};\n'
pure = pure.replace("   A Hollow echo with no entry of its own uses the entry of the boss it echoes (`echoOf`). */",
 "   A Hollow echo with no entry of its own uses the entry of the boss it echoes (`echoOf`).\n\n   This file is data and pure helpers only (the logic tests load it without the engine). The fight-time half of `Budo`\n   (emit, join, crit, critFx, reel, postureHit, breakPosture, parried, deflect, step, drawWorld) is in 14-budo-fight.js. */")
open(p, 'w', encoding='utf8', newline='').write(pure)
fight = ("/* KAGE — Budo, the fight-time half (see 13-budo.js for the rules, the tuning table BUDO and FIGHT_STYLES).\n"
         "   Criticals, posture, the parry and the deflect, style events, the per-tick step and the posture bars. */\n"
         "Object.assign(Budo, {\n" + fight1.rstrip() + '\n\n' + fight2.rstrip().rstrip(',') + '\n});\n')
open('src/js/14-budo-fight.js', 'w', encoding='utf8', newline='').write(fight)
t = 'tests/helpers/load-logic.js'
x = open(t, encoding='utf8').read()
x = x.replace("const PURE_MODULES = ['10-data.js', '11-sword-arcs.js', '12-scenes.js', '15-logic.js'];", "const PURE_MODULES = ['10-data.js', '11-sword-arcs.js', '12-scenes.js', '13-budo.js', '15-logic.js'];")
x = x.replace("'AI_PROFILES', 'SCENES', 'MOVES'];", "'AI_PROFILES', 'SCENES', 'MOVES', 'BUDO', 'Budo', 'FIGHT_STYLES'];")
open(t, 'w', encoding='utf8', newline='').write(x)
b2 = '.scratch/core/COMBAT-BRIEF.md'
y = open(b2, encoding='utf8').read()
y = y.replace("`src/js/13-budo.js` (read its header first, it is the contract) plus hooks in", "`src/js/13-budo.js` (read its header first, it is the contract; the fight-time functions of `Budo` are in\n`src/js/14-budo-fight.js`, also frozen) plus hooks in")
y = y.replace("`00-core.js, 10-data.js, 11-sword-arcs.js, 12-scenes.js, 13-budo.js,", "`00-core.js, 10-data.js, 11-sword-arcs.js, 12-scenes.js, 13-budo.js, 14-budo-fight.js,")
open(b2, 'w', encoding='utf8', newline='').write(y)
print('ok')
