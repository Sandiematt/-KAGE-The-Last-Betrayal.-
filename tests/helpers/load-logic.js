// Loads the pure game modules (data tables + logic) the same way the build does:
// the files are concatenated in filename order and run as one strict-mode function body,
// so their top-level consts/functions are shared exactly as in the shipped IIFE.
// Nothing from the DOM/engine/UI modules is loaded, so the logic must not depend on them.
// Each call returns a fresh copy: tests can mutate the returned tables without leaking.
'use strict';
const fs = require('node:fs');
const path = require('node:path');

const JS_DIR = path.join(__dirname, '..', '..', 'src', 'js');
// The only modules the logic seam may depend on, in build order.
const PURE_MODULES = ['10-data.js', '11-sword-arcs.js', '12-scenes.js', '15-logic.js'];
const EXPORTS = ['DEV', 'Logic', 'CAMPAIGN', 'ENEMIES', 'ENEMY_FAMILIES', 'UNIT_TYPES', 'WEAPONS', 'HELMETS', 'ARMORS', 'GEAR_MAX', 'TRIALS', 'AI_PROFILES', 'SCENES', 'MOVES'];

function moduleSource(file) { return fs.readFileSync(path.join(JS_DIR, file), 'utf8'); }

// The developer unlock (DEV.unlockAll in 10-data.js) is switched OFF here by default, whatever the source ships with,
// so the tests hold the real locks; loadLogic({ dev: true }) loads with it on.
function loadLogic(opts) {
  const src = PURE_MODULES.map(moduleSource).join('\n;\n');
  // eslint-disable-next-line no-new-func
  const mods = new Function(`'use strict';\n${src}\nreturn { ${EXPORTS.join(', ')} };`)();
  mods.DEV.unlockAll = !!(opts && opts.dev);
  return mods;
}

module.exports = { loadLogic, moduleSource, PURE_MODULES };
