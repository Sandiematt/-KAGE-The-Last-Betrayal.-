p = 'E:/PROJECTS/KAGE/KAGE/src/js/20-fighter.js'
L = open(p, encoding='utf8').read().split('\n')
assert L[1934].strip() == "case 'tachibana': {" and L[1952].strip() == '}', (L[1934], L[1952])
new = ["    case 'tachibana':",
       "      // Kage's starting Tachibana Yoroi: the far shoulder's three dark lames laced in crimson; the near pauldron is drawn",
       "      // over his arm by his own body (21-characters/kage/)",
       "      drawTachibana(ctx, f, ink, flat);",
       "      break;"]
L[1934:1953] = new
open(p, 'w', encoding='utf8', newline='\n').write('\n'.join(L))
print('ok')
