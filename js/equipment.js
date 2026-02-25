/**
 * equipment.js - 装備スロット/装備効果
 * ミプリンの冒険
 */
const Equipment = (() => {
  // 装備スロット
  const SLOTS = ['weapon','shield','head','body','accessory1','accessory2'];

  // 装備中アイテム { slotName: itemObject | null }
  let _equipped = {};
  for (const s of SLOTS) _equipped[s] = null;

  function equip(slot, item) {
    if (!SLOTS.includes(slot)) return false;
    const prev = _equipped[slot];
    _equipped[slot] = item;
    return prev; // 前の装備を返す（インベントリに戻す用）
  }

  function unequip(slot) {
    const prev = _equipped[slot];
    _equipped[slot] = null;
    return prev;
  }

  function getEquipped(slot) { return _equipped[slot]; }
  function getAllEquipped() { return { ..._equipped }; }

  // 装備から総ステータスボーナスを計算
  function calcBonuses() {
    const bonuses = {
      hp: 0, atk: 0, speed: 0, critRate: 0, critDmg: 0,
      pollenRate: 0, expRate: 0, defReduction: 0, hpRegen: 0,
      lifesteal: 0, attackSpeed: 0, poisonRes: 0, knockbackRes: 0,
      needleCostReduction: 0, aoeDmg: 0
    };
    for (const slot of SLOTS) {
      const item = _equipped[slot];
      if (!item || !item.affixes) continue;
      for (const affix of item.affixes) {
        if (bonuses[affix.type] !== undefined) {
          bonuses[affix.type] += affix.value;
        }
      }
    }
    // セットボーナス判定
    _applySetBonuses(bonuses);
    return bonuses;
  }

  // セットボーナス
  const SET_DEFS = {
    bee_king:   { name:'蜂王セット', 2:{atk:3}, 4:{critRate:10}, 6:{lifesteal:5} },
    ice_moth:   { name:'氷蝶セット', 2:{defReduction:2}, 4:{speed:1}, 6:{hp:20} },
    dark_bloom: { name:'闇花セット', 2:{poisonRes:30}, 4:{hpRegen:2}, 6:{aoeDmg:10} }
  };

  function _applySetBonuses(bonuses) {
    const setCounts = {};
    for (const slot of SLOTS) {
      const item = _equipped[slot];
      if (item && item.setId) {
        setCounts[item.setId] = (setCounts[item.setId] || 0) + 1;
      }
    }
    for (const [setId, count] of Object.entries(setCounts)) {
      const def = SET_DEFS[setId];
      if (!def) continue;
      for (const threshold of [2, 4, 6]) {
        if (count >= threshold && def[threshold]) {
          for (const [stat, val] of Object.entries(def[threshold])) {
            if (bonuses[stat] !== undefined) bonuses[stat] += val;
          }
        }
      }
    }
  }

  // セーブ/ロード
  function serialize() {
    const data = {};
    for (const s of SLOTS) data[s] = _equipped[s] ? { ..._equipped[s] } : null;
    return data;
  }
  function deserialize(data) {
    if (!data) return;
    for (const s of SLOTS) _equipped[s] = data[s] || null;
  }

  return { SLOTS, SET_DEFS, equip, unequip, getEquipped, getAllEquipped,
           calcBonuses, serialize, deserialize };
})();
