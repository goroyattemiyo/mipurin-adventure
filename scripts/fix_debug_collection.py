# fix_debug_collection.py
with open('js/game.js', 'r', encoding='utf-8') as f:
    code = f.read()

snippet = '''
// === Debug: fill all collections ===
window.debugFillCollection = function() {
  // Enemy collection
  if (typeof ENEMY_DEFS !== 'undefined' && typeof collection !== 'undefined') {
    var keys = Object.keys(ENEMY_DEFS);
    for (var i = 0; i < keys.length; i++) {
      var def = ENEMY_DEFS[keys[i]];
      if (!collection[def.name]) collection[def.name] = { seen: 0, defeated: 0 };
      collection[def.name].seen = Math.max(collection[def.name].seen, 30);
      collection[def.name].defeated = Math.max(collection[def.name].defeated, 20);
    }
  }
  // Weapon collection
  if (typeof WEAPON_DEFS !== 'undefined' && typeof weaponCollection !== 'undefined') {
    for (var j = 0; j < WEAPON_DEFS.length; j++) {
      weaponCollection.add(WEAPON_DEFS[j].id);
    }
    if (typeof saveCollection === 'function') saveCollection();
  }
  // Charm collection
  if (typeof CHARM_DEFS !== 'undefined' && typeof charmCollection !== 'undefined') {
    for (var k = 0; k < CHARM_DEFS.length; k++) {
      charmCollection.add(CHARM_DEFS[k].id);
    }
    if (typeof saveCharmCollection === 'function') saveCharmCollection();
  }
  console.log('[DEBUG] All collections filled! Open TAB > 図鑑 to check.');
};
'''

if 'debugFillCollection' not in code:
    code += snippet
    print("[OK] debugFillCollection added")
else:
    print("[SKIP] debugFillCollection already exists")

with open('js/game.js', 'w', encoding='utf-8') as f:
    f.write(code)
print("[OK] game.js saved (" + str(len(code)) + " bytes)")
