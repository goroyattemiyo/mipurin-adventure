// ===== CHARM SYSTEM (Sprint H-1) =====
// Charms are passive accessories equipped in the charm slot
// Unlike blessings (per-run), charms persist across the run

const CHARM_DEFS = [
  // === Common (Floor 3+) ===
  { id: 'honey_amulet', name: '\uD83C\uDF6F \u306F\u3061\u307F\u3064\u306E\u304A\u307E\u3082\u308A', desc: '\u30D5\u30ED\u30A2\u958B\u59CBHP+1', icon: '\uD83C\uDF6F',
    rarity: 'common', minFloor: 3, apply: function() { player.roomHeal = (player.roomHeal || 0) + 1; } },
  { id: 'wind_feather', name: '\uD83E\uDEB6 \u304B\u305C\u306E\u306F\u306D', desc: '\u79FB\u52D5\u901F\u5EA6+12%', icon: '\uD83E\uDEB6',
    rarity: 'common', minFloor: 3, apply: function() { player.speed *= 1.12; } },
  { id: 'thorn_crown', name: '\uD83C\uDF39 \u3044\u3070\u3089\u306E\u304B\u3093\u3080\u308A', desc: '\u53CD\u5C04\u30C0\u30E1\u30FC\u30B81', icon: '\uD83C\uDF39',
    rarity: 'common', minFloor: 5, apply: function() { player.thorns = Math.max(player.thorns || 0, 1); } },
  { id: 'pollen_pouch', name: '\uD83C\uDF3C \u304B\u3075\u3093\u306E\u3053\u3076\u304F\u308D', desc: '\u82B1\u7C89\u30C9\u30ED\u30C3\u30D7+\u500D', icon: '\uD83C\uDF3C',
    rarity: 'common', minFloor: 5, apply: function() { player.pollenBonus = (player.pollenBonus || 0) + 1; } },
  // === Rare (Floor 7+) ===
  { id: 'crystal_shard', name: '\uD83D\uDC8E \u30AF\u30EA\u30B9\u30BF\u30EB\u306E\u304B\u3051\u3089', desc: 'ATK+1 & \u7BC4\u56F2+10', icon: '\uD83D\uDC8E',
    rarity: 'rare', minFloor: 7, apply: function() { player.atk += 1; player.atkRangeBonus += 10; } },
  { id: 'queens_tear', name: '\uD83D\uDC51 \u5973\u738B\u306E\u306A\u307F\u3060', desc: '\u6483\u7834\u66425%HP\u56DE\u5FA9', icon: '\uD83D\uDC51',
    rarity: 'rare', minFloor: 9, apply: function() { player.killHealChance = (player.killHealChance || 0) + 0.05; } },
  { id: 'dark_pollen', name: '\uD83D\uDC9C \u3084\u307F\u306E\u304B\u3075\u3093', desc: '\u653B\u6483\u306B\u5F31\u6BD2\u4ED8\u4E0E', icon: '\uD83D\uDC9C',
    rarity: 'rare', minFloor: 9, apply: function() { player.poisonChance = (player.poisonChance || 0) + 0.15; } },
  // === Legend (Floor 12+ / Boss) ===
  { id: 'golden_comb', name: '\u2728 \u304A\u3046\u3054\u3093\u306E\u30CF\u30C1\u306E\u5DE3', desc: '\u82B1\u7C89+\u500D & \u78C1\u529B+40', icon: '\u2728',
    rarity: 'legend', minFloor: 12, apply: function() { player.pollenBonus = (player.pollenBonus || 0) + 1; player.magnetRange = (player.magnetRange || 0) + 40; } },
  { id: 'fairy_ring', name: '\uD83E\uDDDA \u3088\u3046\u305B\u3044\u306E\u3086\u3073\u308F', desc: '\u7121\u6575+30% & \u901F\u5EA6+8%', icon: '\uD83E\uDDDA',
    rarity: 'legend', minFloor: 12, apply: function() { player.invDuration *= 1.3; player.speed *= 1.08; } },
];

// Player's charm slot (null = empty)
// Stored in player.charm (set in data.js player object)

// Apply equipped charm at run start
function applyCharm() {
  if (player.charm && player.charm.apply) {
    player.charm.apply();
  }
}

// Charm collection (persistent)
let charmCollection = new Set();
function saveCharmCollection() {
  try { localStorage.setItem('mipurin_charmcol', JSON.stringify([...charmCollection])); } catch(e) {}
}
function loadCharmCollection() {
  try { const d = localStorage.getItem('mipurin_charmcol'); if (d) charmCollection = new Set(JSON.parse(d)); } catch(e) {}
}
loadCharmCollection();

// Get charm drop for current floor (weighted by rarity)
function rollCharmDrop(fl) {
  const pool = CHARM_DEFS.filter(c => !c.minFloor || fl >= c.minFloor);
  if (pool.length === 0) return null;
  const weighted = [];
  for (const c of pool) {
    const w = c.rarity === 'legend' ? 3 : c.rarity === 'rare' ? 12 : 30;
    for (let i = 0; i < w; i++) weighted.push(c);
  }
  return weighted[Math.floor(Math.random() * weighted.length)];
}
