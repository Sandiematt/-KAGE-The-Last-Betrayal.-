def sub(path, pairs):
    s = open(path, encoding='utf8').read()
    for old, new in pairs:
        if s.count(old) != 1:
            raise SystemExit('PATCH MISS (%d) in %s: %s' % (s.count(old), path, old[:120]))
        s = s.replace(old, new)
    open(path, 'w', encoding='utf8', newline='').write(s)
sub('tests/combat-dir.test.js', [
("  ['an Order soldier', { enemyId: 'order_footman' }],\n  ['a Hollow', { enemyId: 'hollow_shade' }],",
 "  // the rank and file are slower to read it (BUDO.roles): they may need a second streak\n  ['an Order soldier', { enemyId: 'order_footman' }, 240],\n  ['a Hollow', { enemyId: 'hollow_shade' }, 240],"),
("for (const [name, target] of FOES) {", "for (const [name, target, within] of FOES) {"),
("    assert.ok(r.at < 120, `${name} read it late (frame ${r.at})`);", "    assert.ok(r.at < (within || 120), `${name} read it late (frame ${r.at})`);"),
])
print('ok')
