/**
 * itemGen.js - 装備生成
 * ミプリンの冒険
 */
const ItemGen = (() => {
  // レアリティ定義
  const RARITY = {
    normal:    { id:'normal',    name:'ノーマル', color:'#CCCCCC', affixCount:0 },
    magic:     { id:'magic',     name:'マジック', color:'#4488FF', affixCount:1 },
    rare:      { id:'rare',      name:'レア',     color:'#FFDD00', affixCount:[2,3] },
    unique:    { id:'unique',    name:'ユニーク', color:'#FF8800', affixCount:'fixed' },
    legendary: { id:'legendary', name:'レジェンド', color:'#FF2222', affixCount:'fixed' }
  };

  // ベース装備テーブル
  const BASE_ITEMS = {
    // 武器 8種
    wooden_needle:  { slot:'weapon', name:'木の針',     baseAtk:2 },
    iron_needle:    { slot:'weapon', name:'鉄の針',     baseAtk:4 },
    silver_needle:  { slot:'weapon', name:'銀の針',     baseAtk:7 },
    gold_needle:    { slot:'weapon', name:'黄金の針',   baseAtk:10 },
    crystal_needle: { slot:'weapon', name:'水晶の針',   baseAtk:14 },
    dark_needle:    { slot:'weapon', name:'闇の針',     baseAtk:18 },
    royal_needle:   { slot:'weapon', name:'女王の針',   baseAtk:22 },
    star_needle:    { slot:'weapon', name:'星屑の針',   baseAtk:28 },
    // 盾 6種
    wax_buckler:    { slot:'shield', name:'蜜蝋の小盾',   baseDef:1 },
    honey_shield:   { slot:'shield', name:'蜂蜜の盾',     baseDef:3 },
    crystal_guard:  { slot:'shield', name:'水晶の盾',     baseDef:5 },
    ice_barrier:    { slot:'shield', name:'氷壁の盾',     baseDef:8 },
    dark_aegis:     { slot:'shield', name:'闇の護盾',     baseDef:11 },
    royal_guard:    { slot:'shield', name:'女王の護盾',   baseDef:15 },
    // 頭 6種
    flower_crown:   { slot:'head', name:'花の冠',       baseHp:3 },
    honey_cap:      { slot:'head', name:'蜂蜜帽',       baseHp:6 },
    crystal_tiara:  { slot:'head', name:'水晶のティアラ', baseHp:10 },
    ice_helm:       { slot:'head', name:'氷のヘルム',   baseHp:15 },
    dark_hood:      { slot:'head', name:'闇のフード',   baseHp:20 },
    royal_crown:    { slot:'head', name:'女王の冠',     baseHp:28 },
    // 体 6種
    leaf_dress:     { slot:'body', name:'葉っぱの服',   baseDef:1, baseHp:2 },
    honey_robe:     { slot:'body', name:'蜂蜜のローブ', baseDef:2, baseHp:4 },
    crystal_armor:  { slot:'body', name:'水晶の鎧',     baseDef:4, baseHp:7 },
    ice_mail:       { slot:'body', name:'氷の鎧',       baseDef:6, baseHp:10 },
    dark_cloak:     { slot:'body', name:'闇のマント',   baseDef:8, baseHp:14 },
    royal_gown:     { slot:'body', name:'女王のドレス', baseDef:11, baseHp:20 },
    // アクセサリー 8種
    pollen_ring:    { slot:'accessory1', name:'花粉の指輪',   bonus:{pollenRate:10} },
    speed_anklet:   { slot:'accessory1', name:'速蜜のアンクレット', bonus:{speed:1} },
    crit_charm:     { slot:'accessory1', name:'会心のお守り',  bonus:{critRate:5} },
    exp_pendant:    { slot:'accessory1', name:'経験のペンダント', bonus:{expRate:10} },
    heal_brooch:    { slot:'accessory2', name:'回復のブローチ', bonus:{hpRegen:1} },
    tough_belt:     { slot:'accessory2', name:'頑丈なベルト',  bonus:{hp:5} },
    vamp_fang:      { slot:'accessory2', name:'吸血の牙',     bonus:{lifesteal:3} },
    needle_ring:    { slot:'accessory2', name:'針師の指輪',   bonus:{needleCostReduction:1} }
  };

  // 接辞プール
  const AFFIX_POOL = [
    { type:'hp',         name:'HP+',        min:1, max:3,   scale:0.5 },
    { type:'atk',        name:'ATK+',       min:1, max:2,   scale:0.3 },
    { type:'speed',      name:'速度+',      min:0.5, max:1, scale:0.1 },
    { type:'critRate',   name:'会心率+',    min:2, max:5,   scale:0.3 },
    { type:'critDmg',    name:'会心ダメ+',  min:5, max:15,  scale:0.5 },
    { type:'pollenRate', name:'ポーレン+',  min:3, max:10,  scale:0.3 },
    { type:'expRate',    name:'EXP+',       min:3, max:8,   scale:0.2 },
    { type:'defReduction',name:'防御+',     min:1, max:2,   scale:0.2 },
    { type:'hpRegen',    name:'HP自動回復+',min:0.5, max:1, scale:0.1 },
    { type:'lifesteal',  name:'吸血+',      min:1, max:3,   scale:0.2 },
    { type:'attackSpeed',name:'攻撃速度+',  min:3, max:8,   scale:0.3 },
    { type:'poisonRes',  name:'毒耐性+',    min:5, max:15,  scale:0.5 },
    { type:'knockbackRes',name:'KB耐性+',   min:10, max:25, scale:0.5 },
    { type:'needleCostReduction',name:'針コスト-', min:0.5, max:1, scale:0.1 },
    { type:'aoeDmg',     name:'範囲ダメ+',  min:1, max:3,   scale:0.3 }
  ];

  // アイテム生成
  function generate(iLv, forcedRarity) {
    // レアリティ抽選
    const rarity = forcedRarity || _rollRarity(iLv);

    // ベースアイテム抽選（iLvに応じて上位装備の出現率上昇）
    const baseKeys = Object.keys(BASE_ITEMS);
    const baseId = baseKeys[Math.floor(Math.random() * baseKeys.length)];
    const base = BASE_ITEMS[baseId];

    // アイテム組み立て
    const item = {
      uid: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
      baseId: baseId,
      name: base.name,
      slot: base.slot.replace(/[12]$/, ''), // accessory1→accessory 統一
      rarity: rarity,
      iLv: iLv,
      baseAtk: base.baseAtk || 0,
      baseDef: base.baseDef || 0,
      baseHp: base.baseHp || 0,
      affixes: [],
      setId: null
    };

    // accessory スロットの修正（装備時にaccessory1 or 2 のどちらか空いてる方へ）
    if (base.slot === 'accessory1' || base.slot === 'accessory2') {
      item.slot = 'accessory'; // 汎用accessory、装備時に空きスロットへ
    }

    // 接辞ロール
    const rarityDef = RARITY[rarity];
    let affixCount = 0;
    if (typeof rarityDef.affixCount === 'number') {
      affixCount = rarityDef.affixCount;
    } else if (Array.isArray(rarityDef.affixCount)) {
      affixCount = rarityDef.affixCount[0] +
        Math.floor(Math.random() * (rarityDef.affixCount[1] - rarityDef.affixCount[0] + 1));
    }

    const usedTypes = new Set();
    for (let i = 0; i < affixCount; i++) {
      const available = AFFIX_POOL.filter(a => !usedTypes.has(a.type));
      if (available.length === 0) break;
      const affix = available[Math.floor(Math.random() * available.length)];
      usedTypes.add(affix.type);
      const roll = Scaling.affixRoll(affix.min, affix.max, iLv);
      const value = roll.min + Math.random() * (roll.max - roll.min);
      item.affixes.push({
        type: affix.type,
        name: affix.name,
        value: Math.round(value * 10) / 10
      });
    }

    // レアリティに応じた名前修飾
    if (rarity === 'magic' && item.affixes.length > 0) {
      item.name = item.affixes[0].name.replace('+','') + 'の' + item.name;
    } else if (rarity === 'rare') {
      item.name = '上質な' + item.name;
    } else if (rarity === 'unique') {
      item.name = '★' + item.name;
    } else if (rarity === 'legendary') {
      item.name = '☆' + item.name;
      // レジェンドにはセットID付与
      const sets = Object.keys(Equipment.SET_DEFS);
      item.setId = sets[Math.floor(Math.random() * sets.length)];
    }

    return item;
  }

  function _rollRarity(iLv) {
    const w = Scaling.rarityWeights(iLv);
    const total = w.normal + w.magic + w.rare + w.unique + w.legendary;
    let r = Math.random() * total;
    if ((r -= w.legendary) < 0) return 'legendary';
    if ((r -= w.unique) < 0) return 'unique';
    if ((r -= w.rare) < 0) return 'rare';
    if ((r -= w.magic) < 0) return 'magic';
    return 'normal';
  }

  // ドロップ文字列生成（ログ表示用）
  function formatItem(item) {
    const rarityDef = RARITY[item.rarity];
    let text = item.name + ' (iLv' + item.iLv + ')';
    if (item.affixes.length > 0) {
      text += ' [' + item.affixes.map(a => a.name + a.value).join(', ') + ']';
    }
    return { text, color: rarityDef.color };
  }

  return { RARITY, BASE_ITEMS, AFFIX_POOL, generate, formatItem };
})();
