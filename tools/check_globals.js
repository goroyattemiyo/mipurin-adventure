// tools/check_globals.js - Detect duplicate global declarations across JS files
// v2: Improved scope detection - tracks brace depth to skip function-local vars
const fs = require('fs');
const path = require('path');

const jsDir = path.join(__dirname, '..', 'js');
const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js')).sort();
const mapMode = process.argv.includes('--map');

const declarations = new Map();

for (const file of files) {
  const lines = fs.readFileSync(path.join(jsDir, file), 'utf8').split('\n');
  let braceDepth = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Track brace depth (simple: count { and } on each line)
    for (const ch of line) {
      if (ch === '{') braceDepth++;
      if (ch === '}') braceDepth = Math.max(0, braceDepth - 1);
    }
    // Only consider top-level declarations (braceDepth 0 after processing)
    // Check braceDepth BEFORE the line's braces for declarations on same line as {
    const depthBefore = braceDepth;
    for (const ch of line) {
      if (ch === '{') depthBefore;
    }
    // Simpler: if line starts with let/var/const at indent 0 AND braceDepth was 0 at line start
    // Recalculate: track depth at START of each line
    // We need depth at start, so let's redo
  }
}

// Redo with proper start-of-line depth tracking
const declarations2 = new Map();
for (const file of files) {
  const lines = fs.readFileSync(path.join(jsDir, file), 'utf8').split('\n');
  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const lineDepth = depth; // depth at start of this line
    const line = lines[i];
    // Update depth for next line
    for (const ch of line) {
      if (ch === '{') depth++;
      if (ch === '}') depth = Math.max(0, depth - 1);
    }
    // Only process if top-level (depth 0 at line start)
    if (lineDepth > 0) continue;
    // Match declaration
    const m = line.match(/^\s*(?:let|var|const)\s+(.+)/);
    if (!m) continue;
    // Extract variable names from declaration
    // Handle: let a = 0, b = 0;  or  const X = { ... complex
    const declStr = m[1];
    // Split by comma but not inside braces/parens/brackets
    let parenD = 0, brackD = 0, curlyD = 0;
    let current = '';
    const parts = [];
    for (const ch of declStr) {
      if (ch === '(') parenD++;
      if (ch === ')') parenD--;
      if (ch === '[') brackD++;
      if (ch === ']') brackD--;
      if (ch === '{') curlyD++;
      if (ch === '}') curlyD--;
      if (ch === ',' && parenD === 0 && brackD === 0 && curlyD === 0) {
        parts.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    if (current.trim()) parts.push(current.trim());
    for (const part of parts) {
      const vm = part.match(/^([a-zA-Z_$][\w$]*)/);
      if (!vm) continue;
      const name = vm[1];
      // Skip common short loop vars that might appear at top level in compressed code
      if (name.length === 1 && 'ijkxywhrdgbstf'.includes(name)) continue;
      if (!declarations2.has(name)) declarations2.set(name, []);
      declarations2.get(name).push({ file, line: i + 1, text: line.trim().substring(0, 100) });
    }
  }
}

if (mapMode) {
  const byFile = new Map();
  for (const [name, locs] of declarations2) {
    for (const loc of locs) {
      if (!byFile.has(loc.file)) byFile.set(loc.file, []);
      if (!byFile.get(loc.file).includes(name)) byFile.get(loc.file).push(name);
    }
  }
  console.log('# VARIABLE_MAP_AUTO.md');
  console.log('# Auto-generated: ' + new Date().toISOString().split('T')[0]);
  console.log('');
  for (const [file, vars] of [...byFile.entries()].sort()) {
    console.log('## ' + file);
    console.log(vars.sort().join(', '));
    console.log('');
  }
  process.exit(0);
}

console.log('=== Global Declaration Check (v2 - scope-aware) ===');
console.log('Files: ' + files.join(', '));
console.log('Total unique globals: ' + declarations2.size);
console.log('');

let errors = 0;
for (const [name, locs] of declarations2) {
  if (locs.length > 1) {
    // Check if all in same file (local re-declarations like gardenUpgrades fields)
    const uniqueFiles = new Set(locs.map(l => l.file));
    if (uniqueFiles.size > 1) {
      errors++;
      console.log('[DUPLICATE] ' + name + ' (across ' + uniqueFiles.size + ' files):');
      for (const loc of locs) console.log('  ' + loc.file + ' L' + loc.line + ': ' + loc.text);
    }
  }
}

if (errors === 0) {
  console.log('[OK] No cross-file duplicate global declarations.');
} else {
  console.log('\n[FAIL] ' + errors + ' cross-file duplicate(s) found.');
}
process.exit(errors > 0 ? 1 : 0);