import io
m='C:/Users/sande/.claude/projects/E--PROJECTS-KAGE/memory/'
p=m+'ashbound-game-project.md'
s=open(p,encoding='utf8').read()
s+="""
**Combat redesign (2026-11-11/12):** the user asked for a martial-arts combat overhaul. The rules live in src/js/13-budo.js (pure: BUDO tuning, FIGHT_STYLES registry) and 14-budo-fight.js (criticals with screen freeze and throw-back, posture, the deflect duel); each boss and sub-boss has its own style file in src/js/41-styles/<enemy id>.js. Balance levers: BUDO.roles (rank and file easier, sub-bosses a little harder, bosses harder) and each style's `Object.assign(ENEMIES.<id>, ...)`. Measure with `node tools/duel.js --foe <id> [--bot fighter|parry|masher|turtle]`; the bots are much weaker than a human, so compare against the old game (git archive of the pre-redesign commit plus a Budo shim), never against an absolute win rate: calibrating bosses so the bot could win made them easier than before. Every character's face is a profile (brow, nose, lips, chin) from 21-characters/_shared/face.js (`face:` in each skin); render checks with `node tools/render/sheet.mjs --ids a,b --head 1 --out <png>`. tests/gameplay-lock snapshot is re-recorded with `UPDATE_SNAPSHOT=1 node --test tests/gameplay-lock.test.js` after any intended gameplay change.
"""
open(p,'w',encoding='utf8',newline='').write(s)
p=m+'last-betrayal-spec.md'
s=open(p,encoding='utf8').read()
s=s.replace("Combat system stays unchanged.","The spec said the combat system stays unchanged; the user overrode that on 2026-11-11 with a full combat redesign (see [[ashbound-game-project]]).")
open(p,'w',encoding='utf8',newline='').write(s)
r='src/js/21-characters/README.md'
s=open(r,encoding='utf8').read()
old="    face.js  eyes.js  neck.js  torso.js  arms.js  hands.js  waist.js  legs.js  feet.js  saya.js"
new="    face.js           the profile every fighter wears (brow, nose, lips, chin, a strip of light down it); a skin picks\n                      its own with `face:` (a FACE_PROFILES name or an object of the same fields)\n    eyes.js  neck.js  torso.js  arms.js  hands.js  waist.js  legs.js  feet.js  saya.js"
if old in s:
    s=s.replace(old,new); open(r,'w',encoding='utf8',newline='').write(s); print('readme ok')
print('ok')
