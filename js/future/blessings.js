/**
 * blessings.js - Bloom Blessing system v2.0
 * 78 blessings (6 families x 13) + 15 duo blessings
 */
window.Blessings = (() => {
  const BLESSING_DATA = [
    {id:'rose_1',name:'棘の一撃',description:'攻撃力+15%',family:'rose',rarity:'common',icon:'🌹',effect:{type:'atkMul',value:0.15}},
    {id:'rose_2',name:'薔薇の怒り',description:'クリティカル率+10%',family:'rose',rarity:'common',icon:'🌹',effect:{type:'critRate',value:0.10}},
    {id:'rose_3',name:'血薔薇',description:'攻撃時HP1回復',family:'rose',rarity:'rare',icon:'🌹',effect:{type:'lifeSteal',value:1}},
    {id:'rose_4',name:'棘の鎧',description:'被ダメ時反射5',family:'rose',rarity:'rare',icon:'🌹',effect:{type:'thorns',value:5}},
    {id:'rose_5',name:'赤い嵐',description:'攻撃力+10%',family:'rose',rarity:'common',icon:'🌹',effect:{type:'atkMul',value:0.10}},
    {id:'rose_6',name:'棘の連打',description:'攻撃速度+10%',family:'rose',rarity:'common',icon:'🌹',effect:{type:'atkSpeedMul',value:0.10}},
    {id:'rose_7',name:'出血の棘',description:'攻撃命中時出血3秒',family:'rose',rarity:'common',icon:'🌹',effect:{type:'bleed',value:3}},
    {id:'rose_8',name:'薔薇の刃',description:'クリダメ+20%',family:'rose',rarity:'common',icon:'🌹',effect:{type:'critDmg',value:0.20}},
    {id:'rose_9',name:'猛毒の棘',description:'反射ダメ+3',family:'rose',rarity:'common',icon:'🌹',effect:{type:'thorns',value:3}},
    {id:'rose_10',name:'薔薇の誓い',description:'HP50%以下で攻撃+30%',family:'rose',rarity:'common',icon:'🌹',effect:{type:'lowHpAtk',value:0.30}},
    {id:'rose_11',name:'真紅の刃',description:'クリ率+15%',family:'rose',rarity:'rare',icon:'🌹',effect:{type:'critRate',value:0.15}},
    {id:'rose_12',name:'薔薇の呪い',description:'敵HP30%以下で即死10%',family:'rose',rarity:'rare',icon:'🌹',effect:{type:'execute',value:0.10}},
    {id:'rose_13',name:'深紅の女王',description:'全攻撃+25%被ダメ+15%',family:'rose',rarity:'legendary',icon:'👑🌹',effect:{type:'glassCannonAtk',value:0.25,penalty:0.15}},
    {id:'lily_1',name:'百合の盾',description:'防御力+15%',family:'lily',rarity:'common',icon:'🌷',effect:{type:'defMul',value:0.15}},
    {id:'lily_2',name:'癒しの花弁',description:'部屋クリアHP5回復',family:'lily',rarity:'common',icon:'🌷',effect:{type:'roomHeal',value:5}},
    {id:'lily_3',name:'鉄の茎',description:'最大HP+20',family:'lily',rarity:'rare',icon:'🌷',effect:{type:'maxHp',value:20}},
    {id:'lily_4',name:'花の結界',description:'3回ダメ無効バリア',family:'lily',rarity:'rare',icon:'🌷',effect:{type:'barrier',value:3}},
    {id:'lily_5',name:'白百合の守り',description:'最大HP+10',family:'lily',rarity:'common',icon:'🌷',effect:{type:'maxHp',value:10}},
    {id:'lily_6',name:'花弁の壁',description:'防御+10%',family:'lily',rarity:'common',icon:'🌷',effect:{type:'defMul',value:0.10}},
    {id:'lily_7',name:'百合の霧',description:'被ダメ20%無効化',family:'lily',rarity:'common',icon:'🌷',effect:{type:'blockChance',value:0.20}},
    {id:'lily_8',name:'再生の花弁',description:'毎秒HP1回復',family:'lily',rarity:'common',icon:'🌷',effect:{type:'regen',value:1}},
    {id:'lily_9',name:'堅い蕾',description:'ノックバック-30%',family:'lily',rarity:'common',icon:'🌷',effect:{type:'knockbackResist',value:0.30}},
    {id:'lily_10',name:'花の甲冑',description:'被ダメ固定-2',family:'lily',rarity:'common',icon:'🌷',effect:{type:'flatDef',value:2}},
    {id:'lily_11',name:'聖百合の加護',description:'死亡時HP50%復活',family:'lily',rarity:'rare',icon:'🌷',effect:{type:'revive',value:0.50}},
    {id:'lily_12',name:'無敵の花弁',description:'無敵時間+0.5s',family:'lily',rarity:'rare',icon:'🌷',effect:{type:'invincibleExt',value:0.5}},
    {id:'lily_13',name:'永遠の白百合',description:'バリア5+被ダメ-20%',family:'lily',rarity:'legendary',icon:'👑🌷',effect:{type:'fortress',barrier:5,defMul:0.20}},
    {id:'sun_1',name:'陽光の恵み',description:'自然回復2倍',family:'sunflower',rarity:'common',icon:'🌻',effect:{type:'regenMul',value:2.0}},
    {id:'sun_2',name:'太陽の雫',description:'回復量+30%',family:'sunflower',rarity:'common',icon:'🌻',effect:{type:'healMul',value:0.30}},
    {id:'sun_3',name:'向日葵の祈り',description:'HP50%以下攻撃+25%',family:'sunflower',rarity:'rare',icon:'🌻',effect:{type:'lowHpAtk',value:0.25}},
    {id:'sun_4',name:'再生の種',description:'死亡時HP30%復活',family:'sunflower',rarity:'rare',icon:'🌻',effect:{type:'revive',value:0.30}},
    {id:'sun_5',name:'日向の光',description:'部屋クリアHP3回復',family:'sunflower',rarity:'common',icon:'🌻',effect:{type:'roomHeal',value:3}},
    {id:'sun_6',name:'花粉の癒し',description:'回復量+15%',family:'sunflower',rarity:'common',icon:'🌻',effect:{type:'healMul',value:0.15}},
    {id:'sun_7',name:'太陽の環',description:'範囲回復2',family:'sunflower',rarity:'common',icon:'🌻',effect:{type:'aoeHeal',value:2}},
    {id:'sun_8',name:'光合成',description:'部屋入室HP2回復',family:'sunflower',rarity:'common',icon:'🌻',effect:{type:'roomEnterHeal',value:2}},
    {id:'sun_9',name:'向日葵の種',description:'HP全回復5%確率',family:'sunflower',rarity:'common',icon:'🌻',effect:{type:'fullHealChance',value:0.05}},
    {id:'sun_10',name:'太陽の抱擁',description:'最大HP+15',family:'sunflower',rarity:'common',icon:'🌻',effect:{type:'maxHp',value:15}},
    {id:'sun_11',name:'生命の花弁',description:'敵撃破HP3回復',family:'sunflower',rarity:'rare',icon:'🌻',effect:{type:'killHeal',value:3}},
    {id:'sun_12',name:'向日葵の奇跡',description:'HP1時ダメ無効10sCD',family:'sunflower',rarity:'rare',icon:'🌻',effect:{type:'lastStand',value:10}},
    {id:'sun_13',name:'太陽神の祝福',description:'回復2倍+毎秒HP2',family:'sunflower',rarity:'legendary',icon:'👑🌻',effect:{type:'solarBlessing',healMul:1.0,regen:2}},
    {id:'wist_1',name:'藤の加速',description:'移動速度+20%',family:'wisteria',rarity:'common',icon:'💜',effect:{type:'speedMul',value:0.20}},
    {id:'wist_2',name:'紫電',description:'攻撃速度+15%',family:'wisteria',rarity:'common',icon:'💜',effect:{type:'atkSpeedMul',value:0.15}},
    {id:'wist_3',name:'残像',description:'回避率+10%',family:'wisteria',rarity:'rare',icon:'💜',effect:{type:'dodge',value:0.10}},
    {id:'wist_4',name:'疾風の舞',description:'ダッシュ距離+50%',family:'wisteria',rarity:'rare',icon:'💜',effect:{type:'dashMul',value:0.50}},
    {id:'wist_5',name:'風の刃',description:'移動速度+10%',family:'wisteria',rarity:'common',icon:'💜',effect:{type:'speedMul',value:0.10}},
    {id:'wist_6',name:'紫の閃き',description:'ダッシュCD-20%',family:'wisteria',rarity:'common',icon:'💜',effect:{type:'dashCdReduce',value:0.20}},
    {id:'wist_7',name:'藤の蔓',description:'攻撃範囲+15%',family:'wisteria',rarity:'common',icon:'💜',effect:{type:'atkRange',value:0.15}},
    {id:'wist_8',name:'疾走の風',description:'移動中攻撃+10%',family:'wisteria',rarity:'common',icon:'💜',effect:{type:'movingAtk',value:0.10}},
    {id:'wist_9',name:'紫煙',description:'ダッシュ後回避+20%',family:'wisteria',rarity:'common',icon:'💜',effect:{type:'postDashDodge',value:0.20}},
    {id:'wist_10',name:'藤の結び',description:'攻撃速度+10%',family:'wisteria',rarity:'common',icon:'💜',effect:{type:'atkSpeedMul',value:0.10}},
    {id:'wist_11',name:'紫電一閃',description:'回避時反撃ダメ8',family:'wisteria',rarity:'rare',icon:'💜',effect:{type:'counterAttack',value:8}},
    {id:'wist_12',name:'空蝉',description:'回避率+15%',family:'wisteria',rarity:'rare',icon:'💜',effect:{type:'dodge',value:0.15}},
    {id:'wist_13',name:'紫嵐の化身',description:'全速度+30%ダッシュ無敵延長',family:'wisteria',rarity:'legendary',icon:'👑💜',effect:{type:'stormAvatar',speedMul:0.30,dashInvincible:0.3}},
    {id:'lotus_1',name:'蓮の導き',description:'レアドロップ+15%',family:'lotus',rarity:'common',icon:'🪷',effect:{type:'dropRate',value:0.15}},
    {id:'lotus_2',name:'福の花粉',description:'ネクター+20%',family:'lotus',rarity:'common',icon:'🪷',effect:{type:'nectarMul',value:0.20}},
    {id:'lotus_3',name:'幸運の蓮華',description:'祝福選択肢+1',family:'lotus',rarity:'rare',icon:'🪷',effect:{type:'extraChoice',value:1}},
    {id:'lotus_4',name:'黄金の蓮',description:'部屋クリアゴールド+50%',family:'lotus',rarity:'rare',icon:'🪷',effect:{type:'goldMul',value:0.50}},
    {id:'lotus_5',name:'小さな幸運',description:'レアドロップ+10%',family:'lotus',rarity:'common',icon:'🪷',effect:{type:'dropRate',value:0.10}},
    {id:'lotus_6',name:'宝の香り',description:'宝箱中身+1',family:'lotus',rarity:'common',icon:'🪷',effect:{type:'chestBonus',value:1}},
    {id:'lotus_7',name:'幸運の風',description:'クリ率+5%',family:'lotus',rarity:'common',icon:'🪷',effect:{type:'critRate',value:0.05}},
    {id:'lotus_8',name:'蓮の池',description:'ショップ-10%',family:'lotus',rarity:'common',icon:'🪷',effect:{type:'shopDiscount',value:0.10}},
    {id:'lotus_9',name:'福来たる',description:'ネクター+10%',family:'lotus',rarity:'common',icon:'🪷',effect:{type:'nectarMul',value:0.10}},
    {id:'lotus_10',name:'蓮華の光',description:'レアドロップ+8%',family:'lotus',rarity:'common',icon:'🪷',effect:{type:'dropRate',value:0.08}},
    {id:'lotus_11',name:'七福の蓮',description:'祝福選択肢+1',family:'lotus',rarity:'rare',icon:'🪷',effect:{type:'extraChoice',value:1}},
    {id:'lotus_12',name:'黄金郷',description:'ゴールド2倍',family:'lotus',rarity:'rare',icon:'🪷',effect:{type:'goldMul',value:1.00}},
    {id:'lotus_13',name:'蓮華宝界',description:'全ドロップ+25%ショップ-20%',family:'lotus',rarity:'legendary',icon:'👑🪷',effect:{type:'fortuneRealm',dropRate:0.25,shopDiscount:0.20}},
    {id:'chr_1',name:'菊の知恵',description:'EXP+25%',family:'chrysanthemum',rarity:'common',icon:'🌸',effect:{type:'expMul',value:0.25}},
    {id:'chr_2',name:'花火',description:'撃破時爆発ダメ10',family:'chrysanthemum',rarity:'common',icon:'🌸',effect:{type:'explode',value:10}},
    {id:'chr_3',name:'時の花',description:'スキルCD-20%',family:'chrysanthemum',rarity:'rare',icon:'🌸',effect:{type:'cdReduce',value:0.20}},
    {id:'chr_4',name:'輪廻の花',description:'祝福ランダム1個追加',family:'chrysanthemum',rarity:'rare',icon:'🌸',effect:{type:'bonusBlessing',value:1}},
    {id:'chr_5',name:'菊の光',description:'EXP+15%',family:'chrysanthemum',rarity:'common',icon:'🌸',effect:{type:'expMul',value:0.15}},
    {id:'chr_6',name:'花弁の爆発',description:'爆発ダメ+5',family:'chrysanthemum',rarity:'common',icon:'🌸',effect:{type:'explode',value:5}},
    {id:'chr_7',name:'秋の風',description:'スキルCD-10%',family:'chrysanthemum',rarity:'common',icon:'🌸',effect:{type:'cdReduce',value:0.10}},
    {id:'chr_8',name:'菊の教え',description:'レベルアップHP全回復',family:'chrysanthemum',rarity:'common',icon:'🌸',effect:{type:'lvUpHeal',value:1}},
    {id:'chr_9',name:'散華',description:'撃破時花弁範囲3',family:'chrysanthemum',rarity:'common',icon:'🌸',effect:{type:'deathAoe',value:3}},
    {id:'chr_10',name:'知恵の花',description:'EXP+10%',family:'chrysanthemum',rarity:'common',icon:'🌸',effect:{type:'expMul',value:0.10}},
    {id:'chr_11',name:'菊水',description:'スキルダメ+30%',family:'chrysanthemum',rarity:'rare',icon:'🌸',effect:{type:'skillDmg',value:0.30}},
    {id:'chr_12',name:'輪廻転生',description:'死亡時祝福保持復活',family:'chrysanthemum',rarity:'rare',icon:'🌸',effect:{type:'blessingRevive',value:1}},
    {id:'chr_13',name:'千年菊の覚醒',description:'EXP2倍スキルCD半減',family:'chrysanthemum',rarity:'legendary',icon:'👑🌸',effect:{type:'wisdomAwaken',expMul:1.0,cdReduce:0.50}}
  ];
  const DUO_BLESSINGS = [
    {id:'duo_1',name:'炎と盾',description:'攻撃+10%防御+10%',families:['rose','lily'],icon:'🌹🌷',effect:{type:'atkMul',value:0.10,bonus:{type:'defMul',value:0.10}}},
    {id:'duo_2',name:'棘の回復',description:'反射がHP回復にも',families:['rose','sunflower'],icon:'🌹🌻',effect:{type:'thornHeal',value:1}},
    {id:'duo_3',name:'赤紫の嵐',description:'クリ時移動+30%',families:['rose','wisteria'],icon:'🌹💜',effect:{type:'critSpeed',value:0.30}},
    {id:'duo_4',name:'血の蓮',description:'命中時レアドロップ+5%',families:['rose','lotus'],icon:'🌹🪷',effect:{type:'hitDropBonus',value:0.05}},
    {id:'duo_5',name:'爆炎の薔薇',description:'爆発ダメ+50%',families:['rose','chrysanthemum'],icon:'🌹🌸',effect:{type:'explodeMul',value:0.50}},
    {id:'duo_6',name:'癒しの要塞',description:'バリア30s毎+1',families:['lily','sunflower'],icon:'🌷🌻',effect:{type:'barrierRegen',value:1}},
    {id:'duo_7',name:'花の回避壁',description:'回避時バリア+1',families:['lily','wisteria'],icon:'🌷💜',effect:{type:'dodgeBarrier',value:1}},
    {id:'duo_8',name:'守りの福',description:'バリア中ドロップ+20%',families:['lily','lotus'],icon:'🌷🪷',effect:{type:'barrierDrop',value:0.20}},
    {id:'duo_9',name:'鉄壁の知恵',description:'防御に応じEXP+',families:['lily','chrysanthemum'],icon:'🌷🌸',effect:{type:'defExp',value:1}},
    {id:'duo_10',name:'光速回復',description:'移動速度で回復UP',families:['sunflower','wisteria'],icon:'🌻💜',effect:{type:'speedHeal',value:0.5}},
    {id:'duo_11',name:'幸運の陽光',description:'回復時ネクター+1',families:['sunflower','lotus'],icon:'🌻🪷',effect:{type:'healNectar',value:1}},
    {id:'duo_12',name:'爆発回復',description:'爆発撃破HP5回復',families:['sunflower','chrysanthemum'],icon:'🌻🌸',effect:{type:'explodeHeal',value:5}},
    {id:'duo_13',name:'紫蓮の幸運',description:'ダッシュ後ドロップ2倍',families:['wisteria','lotus'],icon:'💜🪷',effect:{type:'dashDrop',value:2.0}},
    {id:'duo_14',name:'疾風花火',description:'速度で爆発範囲UP',families:['wisteria','chrysanthemum'],icon:'💜🌸',effect:{type:'speedExplode',value:1}},
    {id:'duo_15',name:'黄金の知恵',description:'EXPがゴールドにも50%',families:['lotus','chrysanthemum'],icon:'🪷🌸',effect:{type:'expToGold',value:0.50}}
  ];
  const FAMILY_COLORS = {rose:'#e74c3c',lily:'#ecf0f1',sunflower:'#f1c40f',wisteria:'#9b59b6',lotus:'#e91e8b',chrysanthemum:'#e67e22'};
  const RARITY_WEIGHTS = {common:0.65,rare:0.28,legendary:0.05,duo:0.02};
  let _owned = [];
  let _bonuses = {};
  let _buffs = {barrier:0,revive:[]};
  let _activeDuos = [];
  function _addBonus(t,v){if(typeof v!=='number')return;_bonuses[t]=(_bonuses[t]||0)+v;}
  function _ensureBuffs(p){if(!p)return;if(!Array.isArray(p.buffs))p.buffs=[];}
  function _checkDuoActivation(){
    var owned=new Set(_owned.map(function(b){return b.family}));
    var nd=[];
    for(var i=0;i<DUO_BLESSINGS.length;i++){
      var d=DUO_BLESSINGS[i];
      if(_activeDuos.some(function(a){return a.id===d.id}))continue;
      var ok=true;
      for(var j=0;j<d.families.length;j++){if(!owned.has(d.families[j])){ok=false;break;}}
      if(ok)nd.push(d);
    }
    for(var k=0;k<nd.length;k++){
      _activeDuos.push(nd[k]);
      _addBonus(nd[k].effect.type,nd[k].effect.value);
      if(nd[k].effect.bonus)_addBonus(nd[k].effect.bonus.type,nd[k].effect.bonus.value);
    }
    return nd;
  }
  function getRandomBlessings(count,ownedIds){
    var ex=new Set(ownedIds||[]);
    var av=BLESSING_DATA.filter(function(b){return!ex.has(b.id)});
    var picks=[],pool=av.slice();
    for(var i=0;i<count&&pool.length>0;i++){
      var total=0;
      for(var j=0;j<pool.length;j++)total+=(RARITY_WEIGHTS[pool[j].rarity]||0);
      if(total<=0)break;
      var roll=Math.random()*total,pi=pool.length-1;
      for(var j=0;j<pool.length;j++){roll-=(RARITY_WEIGHTS[pool[j].rarity]||0);if(roll<=0){pi=j;break;}}
      picks.push(pool.splice(pi,1)[0]);
    }
    return picks;
  }
  function applyBlessing(b,ps){
    if(!b)return;if(_owned.some(function(o){return o.id===b.id}))return;
    _owned.push(b);
    var ef=b.effect||{},v=ef.value;
    if(ef.type==='barrier'||ef.type==='fortress'){var bv=ef.barrier||v||0;_buffs.barrier+=bv;_ensureBuffs(ps);if(ps)ps.buffs.push({type:'barrier',value:bv});if(ef.defMul)_addBonus('defMul',ef.defMul);return;}
    if(ef.type==='revive'){_buffs.revive.push(v||0);_ensureBuffs(ps);if(ps)ps.buffs.push({type:'revive',value:v||0});return;}
    if(ef.type==='maxHp'&&ps){ps.maxHp=(ps.maxHp||0)+(v||0);ps.hp=Math.min(ps.maxHp,(ps.hp||0)+(v||0));}
    if(ef.type==='glassCannonAtk'){_addBonus('atkMul',v);_addBonus('dmgTaken',ef.penalty||0);}
    else if(ef.type==='solarBlessing'){_addBonus('healMul',ef.healMul||0);_addBonus('regen',ef.regen||0);}
    else if(ef.type==='stormAvatar'){_addBonus('speedMul',ef.speedMul||0);_addBonus('dashInvincible',ef.dashInvincible||0);}
    else if(ef.type==='fortuneRealm'){_addBonus('dropRate',ef.dropRate||0);_addBonus('shopDiscount',ef.shopDiscount||0);}
    else if(ef.type==='wisdomAwaken'){_addBonus('expMul',ef.expMul||0);_addBonus('cdReduce',ef.cdReduce||0);}
    else{if(ps&&typeof v==='number')ps[ef.type]=(ps[ef.type]||0)+v;_addBonus(ef.type,v);}
    _checkDuoActivation();
  }
  function getOwnedBlessings(){return _owned.slice();}
  function getActiveDuos(){return _activeDuos.slice();}
  function resetBlessings(){_owned=[];_bonuses={};_buffs={barrier:0,revive:[]};_activeDuos=[];}
  function getStatBonus(t){if(t==='barrier')return _buffs.barrier;if(t==='revive')return _buffs.revive.length;return _bonuses[t]||0;}
  function consumeBarrier(){if(_buffs.barrier>0){_buffs.barrier--;return true;}return false;}
  function consumeRevive(){if(_buffs.revive.length>0)return _buffs.revive.shift();return 0;}
  function getBlessingCount(){return BLESSING_DATA.length;}
  function getDuoCount(){return DUO_BLESSINGS.length;}
  function getFamilyBlessings(f){return BLESSING_DATA.filter(function(b){return b.family===f});}
  return {BLESSING_DATA:BLESSING_DATA,DUO_BLESSINGS:DUO_BLESSINGS,FAMILY_COLORS:FAMILY_COLORS,RARITY_WEIGHTS:RARITY_WEIGHTS,getRandomBlessings:getRandomBlessings,applyBlessing:applyBlessing,getOwnedBlessings:getOwnedBlessings,getActiveDuos:getActiveDuos,resetBlessings:resetBlessings,getStatBonus:getStatBonus,consumeBarrier:consumeBarrier,consumeRevive:consumeRevive,getBlessingCount:getBlessingCount,getDuoCount:getDuoCount,getFamilyBlessings:getFamilyBlessings};
})();
