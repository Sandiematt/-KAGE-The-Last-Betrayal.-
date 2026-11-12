def sub(path, pairs):
    s = open(path, encoding='utf8').read()
    for old, new in pairs:
        if s.count(old) != 1:
            raise SystemExit('PATCH MISS (%d) in %s: %s' % (s.count(old), path, old[:120]))
        s = s.replace(old, new)
    open(path, 'w', encoding='utf8', newline='').write(s)
sub('tests/difficulty.test.js', [
("const { Logic, AI_PROFILES } = loadLogic();", "const { Logic, AI_PROFILES, BUDO } = loadLogic();\n// the role scaling on top of the mode (BUDO.roles, 13-budo.js): the rank and file easier, sub-bosses and bosses harder\nconst RK = BUDO.roles;"),
("test('on Normal a campaign foe keeps its authored stats', () => {", "test('on Normal a campaign foe has its authored stats scaled by its role', () => {"),
("  assert.equal(recruit.hp, 170); close(recruit.dmgMul, 0.9, 'dmg'); assert.equal(recruit.wlvl, 1); close(recruit.defense, 0.054, 'def');",
 "  assert.equal(recruit.hp, Math.round(170 * RK.regular.hp)); close(recruit.dmgMul, 0.9 * RK.regular.dmg, 'dmg'); assert.equal(recruit.wlvl, 1); close(recruit.defense, 0.054, 'def');\n  assert.ok(RK.regular.hp < 1 && RK.regular.dmg < 1, 'the rank and file are easier than authored');\n  assert.ok(RK.sub.hp > 1 && RK.boss.hp > RK.sub.hp && RK.boss.dmg > RK.sub.dmg && RK.sub.dmg > 1, 'sub-bosses a little harder, bosses harder');"),
("  assert.equal(boss.hp, 640); close(boss.dmgMul, 1.1, 'boss dmg'); assert.equal(boss.wlvl, 3); close(boss.level, 3.56, 'boss level');",
 "  assert.equal(boss.hp, Math.round(640 * RK.boss.hp)); close(boss.dmgMul, 1.1 * RK.boss.dmg, 'boss dmg'); assert.equal(boss.wlvl, 3); close(boss.level, 3.56, 'boss level');"),
("  assert.equal(easy.hp, 119); close(easy.dmgMul, 0.54, 'easy dmg');\n  assert.equal(imp.hp, 272); close(imp.dmgMul, 1.35, 'impossible dmg');",
 "  assert.equal(easy.hp, Math.round(170 * 0.7 * RK.regular.hp)); close(easy.dmgMul, 0.54 * RK.regular.dmg, 'easy dmg');\n  assert.equal(imp.hp, Math.round(170 * 1.6 * RK.regular.hp)); close(imp.dmgMul, 1.35 * RK.regular.dmg, 'impossible dmg');"),
("  assert.equal(easyBoss.hp, 480); close(easyBoss.dmgMul, 0.715, 'easy boss dmg');\n  assert.equal(impBoss.hp, 960); close(impBoss.dmgMul, 1.54, 'impossible boss dmg');\n  assert.equal(stageFoe(saveOn('hard'), 'act1.sub1').hp, 450);   // Kuroe: 360 x 1.25",
 "  assert.equal(easyBoss.hp, Math.round(640 * 0.75 * RK.boss.hp)); close(easyBoss.dmgMul, 0.715 * RK.boss.dmg, 'easy boss dmg');\n  assert.equal(impBoss.hp, Math.round(640 * 1.5 * RK.boss.hp)); close(impBoss.dmgMul, 1.54 * RK.boss.dmg, 'impossible boss dmg');\n  assert.equal(stageFoe(saveOn('hard'), 'act1.sub1').hp, Math.round(360 * 1.25 * RK.sub.hp));   // Kuroe: 360 x 1.25 x the sub-boss role"),
("  assert.equal(normal.hp, 408); close(normal.dmgMul, 1.155, 'dmg'); assert.equal(normal.wlvl, 3); close(normal.level, 2.75, 'level');\n  assert.equal(Logic.enemyStats(saveOn('impossible'), sv, 'echo_sentinel', { wave: 5 }).hp, 612);",
 "  assert.equal(normal.hp, Math.round(340 * 1.2 * RK.sub.hp)); close(normal.dmgMul, 1.155 * RK.sub.dmg, 'dmg'); assert.equal(normal.wlvl, 3); close(normal.level, 2.75, 'level');\n  assert.equal(Logic.enemyStats(saveOn('impossible'), sv, 'echo_sentinel', { wave: 5 }).hp, Math.round(340 * 1.2 * 1.5 * RK.sub.hp));"),
("  assert.equal(recruit.hp, 230); close(recruit.dmgMul, 1.125, 'dmg'); assert.equal(recruit.wlvl, 3); assert.equal(recruit.ng, 1);",
 "  assert.equal(recruit.hp, Math.round(170 * 1.35 * RK.regular.hp)); close(recruit.dmgMul, 1.125 * RK.regular.dmg, 'dmg'); assert.equal(recruit.wlvl, 3); assert.equal(recruit.ng, 1);"),
("  close(minion('normal').dmgMul, 0.54, 'normal minion dmg');\n  close(minion('impossible').dmgMul, 0.81, 'impossible minion dmg');",
 "  close(minion('normal').dmgMul, 0.54 * RK.regular.dmg, 'normal minion dmg');   // a summoned recruit is rank and file\n  close(minion('impossible').dmgMul, 0.81 * RK.regular.dmg, 'impossible minion dmg');"),
("  close(clone('normal').dmgMul, 0.55, 'normal clone dmg');\n  close(clone('easy').dmgMul, 0.3575, 'easy clone dmg');",
 "  close(clone('normal').dmgMul, 0.55 * RK.regular.dmg, 'normal clone dmg');   // a clone is rank and file, whoever it copies\n  close(clone('easy').dmgMul, 0.3575 * RK.regular.dmg, 'easy clone dmg');"),
])
print('ok')
