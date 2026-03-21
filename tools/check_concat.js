// tools/check_concat.js - Concatenate all JS files in HTML load order and syntax check
const fs = require('fs');
const path = require('path');

const loadOrder = [
  'game.js', 'data.js', 'enemies.js', 'blessings.js', 'systems.js',
  'nodemap.js', 'ui.js', 'ui_screens.js', 'update.js', 'render.js', 'touch.js'
];

const stubs = `
const document = { getElementById: () => ({ getContext: () => new Proxy({}, { get: () => () => {} }), width: 1280, height: 960, style: {}, getBoundingClientRect: () => ({left:0,top:0,width:1280,height:960}) }) };
const window = { addEventListener: () => {}, devicePixelRatio: 1, AudioContext: class {}, webkitAudioContext: class {} };
const navigator = { maxTouchPoints: 0 };
const Image = class { set src(v){} set onload(v){ if(v) setTimeout(v,0); } get naturalWidth(){return 64} get naturalHeight(){return 64} };
const localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
const fetch = () => Promise.resolve({ json: () => ({}) });
const setTimeout = (fn) => {};
const console = { log: () => {}, warn: () => {}, error: () => {} };
`;

const jsDir = path.join(__dirname, '..', 'js');
let concat = stubs + '\n';

for (const file of loadOrder) {
  const fp = path.join(jsDir, file);
  if (!fs.existsSync(fp)) { console.log('[SKIP] ' + file + ' not found'); continue; }
  concat += '\n// === ' + file + ' ===\n';
  concat += fs.readFileSync(fp, 'utf8');
  concat += '\n';
}

const tmpFile = path.join(__dirname, '_concat_check.js');
fs.writeFileSync(tmpFile, concat);

const { execSync } = require('child_process');
try {
  execSync('node -c "' + tmpFile + '"', { stdio: 'pipe' });
  console.log('[OK] Concatenated syntax check passed (' + loadOrder.length + ' files)');
  fs.unlinkSync(tmpFile);
  process.exit(0);
} catch (e) {
  console.log('[FAIL] Concatenated syntax error:');
  console.log(e.stderr ? e.stderr.toString() : e.message);
  fs.unlinkSync(tmpFile);
  process.exit(1);
}