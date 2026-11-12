p='src/js/20-fighter.js'
s=open(p,encoding='utf8').read()
old="      case 'hit': this.hitstun -= dt; this.friction(dt, this.reelT > 0 ? BUDO.crit.reel.slide : 8);   // thrown back by a critical: he slides further if (this.hitstun <= 0) this.setState(this.grounded ? 'idle' : 'air'); break;"
new="      case 'hit':   // (thrown back by a critical he slides further: BUDO.crit.reel.slide)\n        this.hitstun -= dt; this.friction(dt, this.reelT > 0 ? BUDO.crit.reel.slide : 8);\n        if (this.hitstun <= 0) this.setState(this.grounded ? 'idle' : 'air');\n        break;"
assert s.count(old)==1, s.count(old)
s=s.replace(old,new)
open(p,'w',encoding='utf8',newline='').write(s)
