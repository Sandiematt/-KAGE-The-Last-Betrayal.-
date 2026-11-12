def sub(path, pairs):
    s = open(path, encoding='utf8').read()
    for old, new in pairs:
        if s.count(old) != 1:
            raise SystemExit('PATCH MISS (%d) in %s: %s' % (s.count(old), path, old[:120]))
        s = s.replace(old, new)
    open(path, 'w', encoding='utf8', newline='').write(s)
sub('src/js/13-budo.js', [
("    foeCd: 2.2,                      // seconds before the same foe can land another critical",
 "    foeCd: 2.2,                      // seconds before the same foe can land another critical\n    kageCd: 1.4,                     // ... and before Kage's next counter-hit, back or clean critical (a riposte and a\n                                     // blow on a broken guard always are), so the freeze stays an event"),
("    chance: 0.06, ", "    chance: 0.05, "),
])
sub('src/js/14-budo-fight.js', [
("      if (m.counter && att.riposte) return { why: 'riposte', mul: C.mul };\n      if (counter) return { why: 'counter', mul: C.mul };\n      if (!front) return { why: 'back', mul: C.mul };\n      return chance(C.chance) ? { why: 'clean', mul: C.mul } : null;",
 "      if (m.counter && att.riposte) return { why: 'riposte', mul: C.mul };\n      if ((att.critCd || 0) > world.time) return null;\n      const why = counter ? 'counter' : !front ? 'back' : chance(C.chance) ? 'clean' : null;\n      if (!why) return null;\n      att.critCd = world.time + C.kageCd;\n      return { why, mul: C.mul };"),
])
