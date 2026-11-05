// Entry point so `node --test tests/` works on every Node version: newer Node treats the
// argument as a file path, which resolves to this index, and it loads every *.test.js here.
// (`node --test` with no argument also finds the *.test.js files directly.)
'use strict';
const fs = require('node:fs');
const path = require('node:path');

for (const f of fs.readdirSync(__dirname).filter(n => n.endsWith('.test.js')).sort()) require(path.join(__dirname, f));
