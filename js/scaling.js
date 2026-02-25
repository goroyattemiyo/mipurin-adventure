/**
 * scaling.js - レベル・エリア・敵・ドロップ等のスケーリング
 * ミプリンの冒険
 */
const Scaling = (() => {
  // プレイヤーレベル → 必要EXP
  function expForLevel(lv) { return Math.floor(100 * Math.pow(1.08, lv)); }

  // エリアレベル算出（プレイヤーLv + エリアオフセット）
  const AREA_OFFSET = {
    village: -999, // 敵なし
    forest_south: 0,
    forest_north: 2,
    cave: 5,
    flower_field: 8,
    abyss: 12,
    ruins: 16,
    sky_garden: 20
  };
  function areaLevel(playerLv, areaName) {
    return Math.max(1, playerLv + (AREA_OFFSET[areaName] || 0));
  }

  // 敵ステータス計算
  function enemyHp(baseHp, aLv)  { return Math.ceil(baseHp * (1 + 0.12 * aLv)); }
  function enemyAtk(baseAtk, aLv){ return Math.ceil(baseAtk * (1 + 0.08 * aLv)); }
  function enemyExp(baseExp, aLv){ return Math.ceil(baseExp * (1 + 0.10 * aLv)); }
  function enemyPollen(base, aLv){ return Math.ceil(base * (1 + 0.05 * aLv)); }

  // ドロップレアリティ重み（aLv依存）
  function rarityWeights(aLv) {
    const t = Math.min(aLv / 100, 1); // 0→1 over 100 levels
    return {
      normal:    lerp(60, 10, t),
      magic:     lerp(30, 25, t),
      rare:      lerp(8, 30, t),
      unique:    lerp(1.5, 20, t),
      legendary: lerp(0.5, 15, t)
    };
  }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // アイテムレベル → 接辞数値スケール
  function affixRoll(baseMin, baseMax, iLv) {
    const min = Math.floor(baseMin + iLv * 0.3);
    const max = Math.floor(baseMax + iLv * 0.5);
    return { min, max };
  }

  return { expForLevel, areaLevel, AREA_OFFSET,
           enemyHp, enemyAtk, enemyExp, enemyPollen,
           rarityWeights, affixRoll };
})();
