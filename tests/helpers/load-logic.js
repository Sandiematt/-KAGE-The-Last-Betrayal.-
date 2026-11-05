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
const PURE_MODULES = ['10-data.js', '15-logic.js'];
const EXPORTS = ['Logic', 'CAMPAIGN', 'ENEMIES', 'WEAPONS', 'HELMETS', 'ARMORS', 'GEAR_MAX', 'SURVIVAL'];

function moduleSource(file) { return fs.readFileSync(path.join(JS_DIR, file), 'utf8'); }

function loadLogic() {
  const src = PURE_MODULES.map(moduleSource).join('\n;\n');
  // eslint-disable-next-line no-new-func
  return new Function(`'use strict';\n${src}\nreturn { ${EXPORTS.join(', ')} };`)();
}

module.exports = { loadLogic, moduleSource, PURE_MODULES };
