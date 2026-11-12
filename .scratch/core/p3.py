p='src/js/30-combat.js'
s=open(p,encoding='utf8').read()
old="(def.def && def.def.heavyArmor && (m.imp || 0) <= 1 && !m.kd && def.grounded) || (def.titanArmor && !m.kd);"
new="(def.def && def.def.heavyArmor && (m.imp || 0) <= 1 && !m.kd && def.grounded && !crit) || (def.titanArmor && !m.kd);   // a critical staggers even heavy armour"
assert s.count(old)==1
s=s.replace(old,new)
open(p,'w',encoding='utf8',newline='').write(s)
