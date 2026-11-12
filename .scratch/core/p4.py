def sub(path, pairs):
    s = open(path, encoding='utf8').read()
    for old, new in pairs:
        if s.count(old) != 1:
            raise SystemExit('PATCH MISS (%d) in %s: %s' % (s.count(old), path, old[:120]))
        s = s.replace(old, new)
    open(path, 'w', encoding='utf8', newline='').write(s)
sub('src/js/13-budo.js', [("reel: { kb: 900, hs: 0.52, heavy: 0.5, air: 560, pull: 90 },", "reel: { kb: 1050, hs: 0.55, heavy: 0.6, air: 620, pull: 90, slide: 6 },")])
sub('src/js/20-fighter.js', [("case 'hit': this.hitstun -= dt; this.friction(dt, 8);", "case 'hit': this.hitstun -= dt; this.friction(dt, this.reelT > 0 ? BUDO.crit.reel.slide : 8);   // thrown back by a critical: he slides further")])
