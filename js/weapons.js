/**
 * weapons.js - 武器システム v1.0
 * GDD v2.0準拠: 6種の武器 + 切替 + 特殊攻撃
 */
window.WeaponSystem = (() => {
  var ts = (typeof CONFIG !== 'undefined') ? CONFIG.TILE_SIZE : 64;

  var WEAPONS = {
    bee_sting: {
      id:'bee_sting', name:'ビースティング', description:'基本の針。バランス型',
      icon:'🐝', type:'melee', trait:'balanced',
      baseDmg:3, speed:1.0, range:1.2, knockback:1.0,
      special:{name:'連続刺し',description:'3連続攻撃',type:'combo',hits:3,dmgMul:0.6,cooldown:5},
      unlock:'default'
    },
    honey_cannon: {
      id:'honey_cannon', name:'ハニーキャノン', description:'蜂蜜弾を発射する遠距離武器',
      icon:'🍯', type:'ranged', trait:'slow_power',
      baseDmg:5, speed:0.6, range:6.0, knockback:2.0,
      special:{name:'蜜弾バースト',description:'3方向に蜂蜜弾',type:'burst',projectiles:3,dmgMul:0.8,cooldown:8},
      unlock:'boss_mushroom_king'
    },
    pollen_shield: {
      id:'pollen_shield', name:'ポーレンシールド', description:'攻防一体の花粉盾',
      icon:'🛡', type:'melee', trait:'defensive',
      baseDmg:2, speed:0.8, range:0.8, knockback:1.5,
      special:{name:'花粉バリア',description:'3秒間ダメージ50%減',type:'barrier',duration:3,reduction:0.5,cooldown:12},
      unlock:'boss_ice_beetle'
    },
    vine_whip: {
      id:'vine_whip', name:'ヴァインウィップ', description:'広範囲の蔓鞭',
      icon:'🌿', type:'melee', trait:'wide_area',
      baseDmg:2, speed:1.2, range:2.0, knockback:0.5,
      special:{name:'蔓の嵐',description:'周囲全方向攻撃',type:'spin',radius:2.5,dmgMul:1.2,cooldown:6},
      unlock:'event_vine_discovery'
    },
    feather_shuriken: {
      id:'feather_shuriken', name:'フェザーシュリケン', description:'素早い連射型投擲武器',
      icon:'🪶', type:'ranged', trait:'fast_multi',
      baseDmg:1, speed:2.0, range:4.0, knockback:0.3,
      special:{name:'羽根散らし',description:'8方向に手裏剣',type:'radial',projectiles:8,dmgMul:0.5,cooldown:4},
      unlock:'collection_50percent'
    },
    queens_staff: {
      id:'queens_staff', name:'クイーンズスタッフ', description:'女王の杖。魔法攻撃型',
      icon:'👑', type:'magic', trait:'magic_burst',
      baseDmg:4, speed:0.7, range:3.0, knockback:1.0,
      special:{name:'女王の光',description:'画面全体に光ダメージ',type:'screen',dmgMul:2.0,cooldown:15},
      unlock:'ending_b_or_c'
    }
  };

  var _currentWeapon = 'bee_sting';
  var _unlockedWeapons = ['bee_sting'];
  var _specialCooldowns = {};
  var _specialActive = null;
  var _specialTimer = 0;

  function init(){
    _currentWeapon = 'bee_sting';
    _unlockedWeapons = ['bee_sting'];
    _specialCooldowns = {};
    _specialActive = null;
    _specialTimer = 0;
  }

  function getCurrentWeapon(){ return WEAPONS[_currentWeapon] || WEAPONS.bee_sting; }
  function getCurrentWeaponId(){ return _currentWeapon; }

  function switchWeapon(weaponId){
    if(!WEAPONS[weaponId])return false;
    if(_unlockedWeapons.indexOf(weaponId)<0)return false;
    _currentWeapon = weaponId;
    return true;
  }

  function cycleWeapon(dir){
    var idx = _unlockedWeapons.indexOf(_currentWeapon);
    if(idx<0)idx=0;
    idx = (idx + (dir||1) + _unlockedWeapons.length) % _unlockedWeapons.length;
    _currentWeapon = _unlockedWeapons[idx];
    return _currentWeapon;
  }

  function unlockWeapon(weaponId){
    if(!WEAPONS[weaponId])return false;
    if(_unlockedWeapons.indexOf(weaponId)>=0)return false;
    _unlockedWeapons.push(weaponId);
    return true;
  }

  function isUnlocked(weaponId){ return _unlockedWeapons.indexOf(weaponId)>=0; }
  function getUnlockedWeapons(){ return _unlockedWeapons.slice(); }
  function getAllWeapons(){ return WEAPONS; }

  function getAttackDamage(playerAtk){
    var w = getCurrentWeapon();
    return Math.ceil((playerAtk || 3) * (w.baseDmg / 3));
  }

  function getAttackSpeed(){
    var w = getCurrentWeapon();
    return w.speed || 1.0;
  }

  function getAttackRange(){
    var w = getCurrentWeapon();
    return (w.range || 1.2) * ts;
  }

  function getKnockback(){
    var w = getCurrentWeapon();
    return w.knockback || 1.0;
  }

  function canUseSpecial(){
    var w = getCurrentWeapon();
    if(!w.special)return false;
    var cd = _specialCooldowns[w.id] || 0;
    return cd <= 0;
  }

  function useSpecial(playerX, playerY, playerDir, playerAtk){
    var w = getCurrentWeapon();
    if(!w.special||!canUseSpecial())return null;
    _specialCooldowns[w.id] = w.special.cooldown || 5;
    var sp = w.special;
    var result = {type:sp.type, weapon:w.id, damage:Math.ceil((playerAtk||3)*(sp.dmgMul||1.0))};
    if(sp.type==='combo'){result.hits=sp.hits||3;result.dmgPerHit=Math.ceil(result.damage/result.hits);}
    if(sp.type==='burst'||sp.type==='radial'){result.projectiles=sp.projectiles||3;}
    if(sp.type==='barrier'){result.duration=sp.duration||3;result.reduction=sp.reduction||0.5;_specialActive={type:'barrier',timer:sp.duration,reduction:sp.reduction};_specialTimer=sp.duration;}
    if(sp.type==='spin'){result.radius=(sp.radius||2.5)*ts;}
    if(sp.type==='screen'){result.dmgMul=sp.dmgMul||2.0;}
    return result;
  }

  function update(dt){
    for(var wid in _specialCooldowns){
      if(_specialCooldowns[wid]>0)_specialCooldowns[wid]-=dt;
    }
    if(_specialActive){
      _specialTimer-=dt;
      if(_specialTimer<=0){_specialActive=null;_specialTimer=0;}
    }
  }

  function getSpecialCooldown(weaponId){
    var id = weaponId || _currentWeapon;
    return Math.max(0, _specialCooldowns[id]||0);
  }

  function isSpecialActive(){ return _specialActive; }

  function getWeaponCount(){ return Object.keys(WEAPONS).length; }

  function serialize(){
    return {current:_currentWeapon,unlocked:_unlockedWeapons.slice(),cooldowns:Object.assign({},_specialCooldowns)};
  }

  function deserialize(data){
    if(!data)return;
    if(data.current&&WEAPONS[data.current])_currentWeapon=data.current;
    if(Array.isArray(data.unlocked))_unlockedWeapons=data.unlocked.filter(function(id){return!!WEAPONS[id];});
    if(_unlockedWeapons.indexOf('bee_sting')<0)_unlockedWeapons.unshift('bee_sting');
    if(data.cooldowns)_specialCooldowns=data.cooldowns;
  }

  return {
    WEAPONS:WEAPONS,init:init,getCurrentWeapon:getCurrentWeapon,getCurrentWeaponId:getCurrentWeaponId,
    switchWeapon:switchWeapon,cycleWeapon:cycleWeapon,unlockWeapon:unlockWeapon,
    isUnlocked:isUnlocked,getUnlockedWeapons:getUnlockedWeapons,getAllWeapons:getAllWeapons,
    getAttackDamage:getAttackDamage,getAttackSpeed:getAttackSpeed,getAttackRange:getAttackRange,
    getKnockback:getKnockback,canUseSpecial:canUseSpecial,useSpecial:useSpecial,
    update:update,getSpecialCooldown:getSpecialCooldown,isSpecialActive:isSpecialActive,
    getWeaponCount:getWeaponCount,serialize:serialize,deserialize:deserialize
  };
})();
