p='src/js/21-characters/_shared/face.js'
s=open(p,encoding='utf8').read()
old="  if (prof.light != null) return prof.light;\n"
new="  if (typeof prof.light === 'function') return prof.light(f);   // a colour that follows the fighter (a boss phase's)\n  if (prof.light != null) return prof.light;\n"
assert s.count(old)==1
s=s.replace(old,new)
s=s.replace("     light  the colour of the strip of light down the profile (false: none);  depth  its width in head units","     light  the colour of the strip of light down the profile (false: none; or a function of the fighter);\n     depth  its width in head units")
open(p,'w',encoding='utf8',newline='').write(s)
