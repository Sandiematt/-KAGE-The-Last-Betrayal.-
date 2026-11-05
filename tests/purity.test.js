'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadLogic, moduleSource, PURE_MODULES } = require('./helpers/load-logic');

// The logic seam must run anywhere: no browser, rendering, storage, audio or input APIs.
const FORBIDDEN = ['document', 'window', 'localStorage', 'sessionStorage', 'navigator', 'canvas', 'CanvasRenderingContext2D',
  'requestAnimationFrame', 'AudioContext', 'AudioManager', 'InputManager', 'SaveManager', 'Renderer', 'UIManager', 'Game', 'console'];

for (const file of PURE_MODULES) {
  test(`${file} uses no DOM, canvas, storage, audio or input APIs`, () => {
    const code = moduleSource(file).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '').replace(/(['"`])(?:\\.|(?!\1).)*\1/g, '""');
    for (const name of FORBIDDEN) assert.ok(!new RegExp(`\\b${name}\\b`).test(code), `${file} references ${name}`);
  });
}

test('the logic module loads under plain Node from the data tables alone', () => {
  const { Logic } = loadLogic();
  assert.equal(typeof Logic.applyFightResult, 'function');
});
