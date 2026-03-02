/**
 * meta.js - メタプログレッション（永続進行システム）
 * ミプリンの冒険 v1.1.0
 */
const MetaProgression = (() => {
  const SAVE_KEY = 'mipurin_meta_v1';

  const FLOWER_BEDS = {
    hp: {
      name: '体力の花壇', icon: '❤️', maxLevel: 5, baseCost: 10, costMult: 2.0,
      effectPerLv: 5, desc: '最大HP +5 / レベル',
      descFn: (lv) => 'HP +' + (lv * 5)
    },
    atk: {
      name: '力の花壇', icon: '⚔️', maxLevel: 5, baseCost: 15, costMult: 2.0,
      effectPerLv: 1, desc: '攻撃力 +1 / レベル',
      descFn: (lv) => 'ATK +' + lv
    },
    choice: {
      name: '幸運の花壇', icon: '🍀', maxLevel: 2, baseCost: 50, costMult: 4.0,
      effectPerLv: 1, desc: '祝福の選択肢 +1 / レベル',
      descFn: (lv) => '祝福選択肢 +' + lv + '(' + (3 + lv) + '択)'
    },
    weapon: {
      name: '記憶の花壇', icon: '🗡️', maxLevel: 6, baseCost: 100, costMult: 1.0,
      effectPerLv: 1, desc: '新しい武器を解放',
      descFn: (lv) => '武器 ' + lv + '/6 解放済'
    },
    npc: {
      name: '交流の花壇', icon: '💬', maxLevel: 5, baseCost: 30, costMult: 1.5,
      effectPerLv: 1, desc: 'NPCの新しい会話を解放',
      descFn: (lv) => '会話 ' + lv + '/5 解放済'
    },
    deathPenalty: {
      name: '復活の花壇', icon: '🌱', maxLevel: 1, baseCost: 150, costMult: 1.0,
      effectPerLv: 1, desc: '死亡時に花粉を50%保持',
      descFn: (lv) => lv > 0 ? '死亡時花粉50%保持【有効】' : '未解放'
    },
    exploration: {
      name: '探索の花壇', icon: '🗺️', maxLevel: 1, baseCost: 200, costMult: 1.0,
      effectPerLv: 1, desc: '隠し部屋の出現率UP',
      descFn: (lv) => lv > 0 ? '隠し部屋率UP【有効】' : '未解放'
    }
  };

  const NECTAR_RATES = {
    normalKill: 1, eliteKill: 5, bossKill: 20,
    noDamageBonus: 3, firstClearBonus: 50, floorBonus: 2
  };

  let _nectar = 0;
  let _levels = {};
  let _totalRuns = 0;
  let _bestFloor = 0;
  let _totalKills = 0;
  let _clearedBosses = new Set();
  let _initialized = false;

  function init() {
    if (_initialized) return;
    var saved = _loadFromStorage();
    if (saved) {
      _nectar = saved.nectar || 0;
      _levels = saved.levels || {};
      _totalRuns = saved.totalRuns || 0;
      _bestFloor = saved.bestFloor || 0;
      _totalKills = saved.totalKills || 0;
      _clearedBosses = new Set(saved.clearedBosses || []);
    }
    for (var key of Object.keys(FLOWER_BEDS)) {
      if (_levels[key] === undefined) _levels[key] = 0;
    }
    _initialized = true;
  }

  function _loadFromStorage() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[MetaProgression] load failed:', e);
      return null;
    }
  }

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        nectar: _nectar, levels: _levels, totalRuns: _totalRuns,
        bestFloor: _bestFloor, totalKills: _totalKills,
        clearedBosses: Array.from(_clearedBosses)
      }));
    } catch (e) { console.warn('[MetaProgression] save failed:', e); }
  }

  function addNectar(amount) {
    if (typeof amount !== 'number' || amount <= 0) return 0;
    _nectar += Math.floor(amount);
    save();
    return Math.floor(amount);
  }

  function getNectar() { return _nectar; }

  function spendNectar(amount) {
    if (amount <= 0 || _nectar < amount) return false;
    _nectar -= amount; save(); return true;
  }

  function getUpgradeCost(bedKey) {
    var bed = FLOWER_BEDS[bedKey];
    if (!bed) return Infinity;
    var currentLv = _levels[bedKey] || 0;
    if (currentLv >= bed.maxLevel) return Infinity;
    return Math.ceil(bed.baseCost * Math.pow(bed.costMult, currentLv));
  }

  function canUpgrade(bedKey) {
    var cost = getUpgradeCost(bedKey);
    return cost !== Infinity && _nectar >= cost;
  }

  function upgrade(bedKey) {
    var cost = getUpgradeCost(bedKey);
    if (cost === Infinity || _nectar < cost) return false;
    _nectar -= cost;
    _levels[bedKey] = (_levels[bedKey] || 0) + 1;
    save(); return true;
  }

  function getBedLevel(bedKey) { return _levels[bedKey] || 0; }

  function isBedMaxed(bedKey) {
    var bed = FLOWER_BEDS[bedKey];
    if (!bed) return true;
    return (_levels[bedKey] || 0) >= bed.maxLevel;
  }

  function getBonuses() {
    return {
      maxHp: (_levels.hp || 0) * FLOWER_BEDS.hp.effectPerLv,
      atk: (_levels.atk || 0) * FLOWER_BEDS.atk.effectPerLv,
      extraChoices: (_levels.choice || 0) * FLOWER_BEDS.choice.effectPerLv,
      weaponsUnlocked: _levels.weapon || 0,
      npcConversations: _levels.npc || 0,
      deathPollenKeep: (_levels.deathPenalty || 0) > 0,
      hiddenRoomBoost: (_levels.exploration || 0) > 0
    };
  }

  function applyToPlayer(player) {
    if (!player) return;
    var bonus = getBonuses();
    player.maxHp = (player.maxHp || Balance.PLAYER.BASE_HP) + bonus.maxHp;
    player.hp = Math.min(player.hp || player.maxHp, player.maxHp);
    player.atk = (player.atk || Balance.PLAYER.BASE_ATK) + bonus.atk;
  }

  function onRunEnd(result) {
    _totalRuns++;
    var r = result || {};
    var floor = r.floor || 1;
    var kills = r.kills || 0;
    var eliteKills = r.eliteKills || 0;
    var bossKills = r.bossKills || 0;

    var breakdown = {};
    breakdown.normalKills = Math.max(0, kills - eliteKills) * NECTAR_RATES.normalKill;
    breakdown.eliteKills = eliteKills * NECTAR_RATES.eliteKill;
    breakdown.bossKills = bossKills * NECTAR_RATES.bossKill;
    breakdown.floorBonus = floor * NECTAR_RATES.floorBonus;
    breakdown.noDamage = r.noDamage ? NECTAR_RATES.noDamageBonus : 0;
    breakdown.firstClear = 0;
    if (r.bossId && !_clearedBosses.has(r.bossId)) {
      _clearedBosses.add(r.bossId);
      breakdown.firstClear = NECTAR_RATES.firstClearBonus;
    }

    var totalGain = 0;
    for (var k in breakdown) totalGain += breakdown[k];
    addNectar(totalGain);

    _totalKills += kills;
    if (floor > _bestFloor) _bestFloor = floor;

    var pollenKept = 0;
    if (getBonuses().deathPollenKeep && r.pollen) {
      pollenKept = Math.floor(r.pollen * 0.5);
    }
    save();

    return {
      nectarGain: totalGain, pollenKept: pollenKept,
      totalNectar: _nectar, breakdown: breakdown
    };
  }

  function getStats() {
    return { totalRuns: _totalRuns, bestFloor: _bestFloor,
             totalKills: _totalKills, clearedBosses: Array.from(_clearedBosses) };
  }

  function getState() {
    return { nectar: _nectar, levels: Object.assign({}, _levels),
             bonuses: getBonuses(), stats: getStats() };
  }

  function reset() {
    _nectar = 0; _levels = {}; _totalRuns = 0; _bestFloor = 0;
    _totalKills = 0; _clearedBosses = new Set();
    for (var key of Object.keys(FLOWER_BEDS)) _levels[key] = 0;
    save();
  }

  return {
    FLOWER_BEDS: FLOWER_BEDS, NECTAR_RATES: NECTAR_RATES,
    init: init, save: save, reset: reset,
    addNectar: addNectar, getNectar: getNectar, spendNectar: spendNectar,
    getUpgradeCost: getUpgradeCost, canUpgrade: canUpgrade, upgrade: upgrade,
    getBedLevel: getBedLevel, isBedMaxed: isBedMaxed,
    getBonuses: getBonuses, applyToPlayer: applyToPlayer,
    onRunEnd: onRunEnd, getStats: getStats, getState: getState
  };
})();
