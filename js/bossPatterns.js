/**
 * bossPatterns.js - 新ボス4体の定義 v1.0
 * GDD v2.0 Phase2: 腐敗大樹、花畑の番人、深淵の主、氷の女王
 * 既存boss.jsのBalance.BOSSESに追加するデータ
 */
window.BossPatterns = (() => {
  var NEW_BOSSES = {
    rotting_tree: {
      id:'rotting_tree', name:'腐敗大樹グロウス',
      hp:300, atk:6, speed:1, xp:200, pollen:30,
      symbol:'🌳', color:'#4a2', size:3,
      phases:[
        {hpThreshold:1.0, pattern:'root_slam', pauseSec:2.0, rootCount:4, rootDmg:4,
         telegraph:0.8, counterWindow:1.5, description:'根の叩きつけ'},
        {hpThreshold:0.6, pattern:'spore_rain', pauseSec:1.5, sporeCount:8, sporeDmg:3,
         telegraph:0.6, summonType:'poison_mushroom', summonCount:2, description:'胞子の雨+召喚'},
        {hpThreshold:0.3, pattern:'frenzy_roots', pauseSec:1.0, rootCount:8, rootDmg:5,
         chargeSpeed:2, telegraph:0.5, counterWindow:2.0, description:'狂乱の根(弱点露出)'}
      ],
      weakness:'fire', dropWeapon:'vine_whip',
      lore:'かつて花畑の守護者だった大樹。闇胞子に蝕まれ腐敗した。幹の中に女王の記憶が眠る。'
    },
    garden_keeper: {
      id:'garden_keeper', name:'花畑の番人フローラ',
      hp:250, atk:5, speed:3, xp:180, pollen:25,
      symbol:'🌺', color:'#e91e63', size:2,
      phases:[
        {hpThreshold:1.0, pattern:'petal_dance', pauseSec:1.8, bulletCount:6, bulletSpeed:2,
         telegraph:0.7, counterWindow:1.0, description:'花弁の舞'},
        {hpThreshold:0.5, pattern:'vine_trap', pauseSec:1.5, trapCount:3, trapDmg:4,
         telegraph:0.8, healAmount:20, description:'蔓の罠+自己回復'},
        {hpThreshold:0.2, pattern:'bloom_burst', pauseSec:0.8, bulletCount:12, bulletSpeed:3,
         chargeSpeed:4, telegraph:0.4, counterWindow:2.5, description:'満開の爆発(大きな隙)'}
      ],
      weakness:'ice', dropWeapon:null,
      lore:'花畑を守り続ける精霊。闇に抗いながらも侵食が進んでいる。倒さずに済む方法があるかもしれない。'
    },
    abyss_lord: {
      id:'abyss_lord', name:'深淵の主ヴォイド',
      hp:400, atk:8, speed:2, xp:300, pollen:40,
      symbol:'🕳', color:'#0a0a1a', size:3,
      phases:[
        {hpThreshold:1.0, pattern:'dark_barrage', pauseSec:1.2, bulletCount:5, bulletSpeed:2.5,
         telegraph:0.6, counterWindow:0.8, description:'闇弾幕'},
        {hpThreshold:0.6, pattern:'void_pull', pauseSec:2.0, pullRadius:5, pullStrength:3,
         telegraph:1.0, counterWindow:1.5, description:'虚無の引力'},
        {hpThreshold:0.3, pattern:'dimension_rift', pauseSec:0.6, bulletCount:10, bulletSpeed:3,
         chargeSpeed:5, summonType:'abyss_worm', summonCount:3,
         telegraph:0.8, counterWindow:2.0, description:'次元裂け目(召喚+弾幕)'}
      ],
      weakness:null, dropWeapon:'feather_shuriken',
      lore:'巣窟の最深部に棲む闇そのもの。女王レイラを闇に引きずり込んだ元凶。'
    },
    ice_empress: {
      id:'ice_empress', name:'氷の女帝クリスタ',
      hp:350, atk:7, speed:2, xp:250, pollen:35,
      symbol:'❄', color:'#aed6f1', size:2,
      phases:[
        {hpThreshold:1.0, pattern:'ice_shot', pauseSec:1.3, bulletCount:4, bulletSpeed:2,
         telegraph:0.7, counterWindow:1.0, description:'氷弾射撃'},
        {hpThreshold:0.5, pattern:'blizzard', pauseSec:1.0, bulletCount:10, bulletSpeed:1.5,
         slowEffect:0.5, slowDuration:2, telegraph:0.8, description:'吹雪(移動速度低下)'},
        {hpThreshold:0.2, pattern:'absolute_zero', pauseSec:2.5, freezeRadius:4, freezeDuration:1.5,
         chargeSpeed:6, telegraph:1.2, counterWindow:3.0, description:'絶対零度(長テレグラフ+長い隙)'}
      ],
      weakness:'fire', dropWeapon:null,
      lore:'かつて女王レイラの親友だった氷の精霊。闇に堕ちてなお、友の記憶を守ろうとしている。'
    }
  };

  function getBoss(id){ return NEW_BOSSES[id] || null; }
  function getAllBosses(){ return NEW_BOSSES; }
  function getBossIds(){ return Object.keys(NEW_BOSSES); }
  function getBossCount(){ return Object.keys(NEW_BOSSES).length; }

  function hasTelegraph(phase){ return phase && phase.telegraph && phase.telegraph > 0; }
  function hasCounterWindow(phase){ return phase && phase.counterWindow && phase.counterWindow > 0; }

  function getPhaseDescription(bossId, phaseIndex){
    var boss = NEW_BOSSES[bossId];
    if(!boss || !boss.phases || !boss.phases[phaseIndex]) return '';
    return boss.phases[phaseIndex].description || '';
  }

  function validateBoss(bossId){
    var boss = NEW_BOSSES[bossId];
    if(!boss) return {valid:false, errors:['Boss not found: '+bossId]};
    var errors = [];
    if(!boss.name) errors.push('Missing name');
    if(!boss.hp || boss.hp <= 0) errors.push('Invalid HP');
    if(!boss.phases || boss.phases.length === 0) errors.push('No phases defined');
    if(boss.phases){
      for(var i=0;i<boss.phases.length;i++){
        var p = boss.phases[i];
        if(!p.pattern) errors.push('Phase '+i+': no pattern');
        if(!p.telegraph && p.telegraph !== 0) errors.push('Phase '+i+': no telegraph');
      }
    }
    return {valid: errors.length === 0, errors: errors};
  }

  return {
    NEW_BOSSES:NEW_BOSSES, getBoss:getBoss, getAllBosses:getAllBosses,
    getBossIds:getBossIds, getBossCount:getBossCount,
    hasTelegraph:hasTelegraph, hasCounterWindow:hasCounterWindow,
    getPhaseDescription:getPhaseDescription, validateBoss:validateBoss
  };
})();
