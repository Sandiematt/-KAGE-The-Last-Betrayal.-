p='src/js/21-characters/bosses/witness/_skin.js'
s=open(p,encoding='utf-8').read()
old="     glow     the look's glow as rgb                      outline the additive outline glow (phase II's neon), or null */"
new="""     glow     the look's glow as rgb                      outline the additive outline glow (phase II's neon), or null
   and for the rebuilt body (body.js and the part files):
     line     the pale line round every part              dim     the same on the far side
     panel    the coloured coat panels and sleeve bands   pat     the wave pattern on them (stars on the True Witness)
     pale     the pale crown spikes (shade, base, light)  back    the crown's swept-back spikes
     flame    the flame curls behind the shoulders        gold, goldHi   trim, belt, chains, the hilt's fittings
     bodyInk  the near-black of the body (shade, base, light) */"""
assert old in s
s=s.replace(old,new)
open(p,'w',encoding='utf-8').write(s)
