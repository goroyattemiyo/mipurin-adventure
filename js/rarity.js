// === Weapon Rarity System (Phase 1) ===
const RARITY_DEFS = {
  normal:  { name: 'ふつう',   color: '#ffffff', weight: 50 },
  fine:    { name: 'きれい',   color: '#87ceeb', weight: 30 },
  great:   { name: 'すてき',   color: '#ffd700', weight: 15 },
  miracle: { name: 'きせき',   color: '#e056fd', weight: 4 },
  legend:  { name: 'でんせつ', color: '#e67e22', weight: 1 }
};

function rollRarity(floorNum) {
  var bonus = Math.min(floorNum * 0.5, 8);
  var weights = {};
  var keys = Object.keys(RARITY_DEFS);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    weights[k] = RARITY_DEFS[k].weight;
    if (k !== 'normal') weights[k] += bonus;
  }
  var total = 0;
  for (var j = 0; j < keys.length; j++) total += weights[keys[j]];
  var roll = Math.random() * total;
  var acc = 0;
  for (var m = 0; m < keys.length; m++) {
    acc += weights[keys[m]];
    if (roll < acc) return keys[m];
  }
  return 'normal';
}

function getRarityDef(r) { return RARITY_DEFS[r] || RARITY_DEFS.normal; }
// === End Rarity System ===
