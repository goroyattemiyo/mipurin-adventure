/**
 * blessings.js - Bloom Blessing system
 */
window.Blessings = (() => {
  const BLESSING_DATA = [
    { id:'rose_1', name:'棘の一撃', description:'攻撃力+15%', family:'rose', rarity:'common', icon:'🌹', effect:{ type:'atkMul', value:0.15 } },
    { id:'rose_2', name:'薔薇の怒り', description:'クリティカル率+10%', family:'rose', rarity:'common', icon:'🌹', effect:{ type:'critRate', value:0.10 } },
    { id:'rose_3', name:'血薔薇', description:'攻撃時HP1回復', family:'rose', rarity:'rare', icon:'🌹', effect:{ type:'lifeSteal', value:1 } },
    { id:'rose_4', name:'棘の鎧', description:'被ダメ時に反射ダメージ5', family:'rose', rarity:'rare', icon:'🌹', effect:{ type:'thorns', value:5 } },

    { id:'lily_1', name:'百合の盾', description:'防御力+15%', family:'lily', rarity:'common', icon:'🌷', effect:{ type:'defMul', value:0.15 } },
    { id:'lily_2', name:'癒しの花弁', description:'部屋クリア時HP5回復', family:'lily', rarity:'common', icon:'🌷', effect:{ type:'roomHeal', value:5 } },
    { id:'lily_3', name:'鉄の茎', description:'最大HP+20', family:'lily', rarity:'rare', icon:'🌷', effect:{ type:'maxHp', value:20 } },
    { id:'lily_4', name:'花の結界', description:'3回ダメージ無効バリア', family:'lily', rarity:'rare', icon:'🌷', effect:{ type:'barrier', value:3 } },

    { id:'sun_1', name:'陽光の恵み', description:'自然回復速度2倍', family:'sunflower', rarity:'common', icon:'🌻', effect:{ type:'regenMul', value:2.0 } },
    { id:'sun_2', name:'太陽の雫', description:'回復量+30%', family:'sunflower', rarity:'common', icon:'🌻', effect:{ type:'healMul', value:0.30 } },
    { id:'sun_3', name:'向日葵の祈り', description:'HP50%以下で攻撃力+25%', family:'sunflower', rarity:'rare', icon:'🌻', effect:{ type:'lowHpAtk', value:0.25 } },
    { id:'sun_4', name:'再生の種', description:'死亡時HP30%で復活（1回）', family:'sunflower', rarity:'rare', icon:'🌻', effect:{ type:'revive', value:0.30 } },

    { id:'wist_1', name:'藤の加速', description:'移動速度+20%', family:'wisteria', rarity:'common', icon:'💜', effect:{ type:'speedMul', value:0.20 } },
    { id:'wist_2', name:'紫電', description:'攻撃速度+15%', family:'wisteria', rarity:'common', icon:'💜', effect:{ type:'atkSpeedMul', value:0.15 } },
    { id:'wist_3', name:'残像', description:'回避率+10%', family:'wisteria', rarity:'rare', icon:'💜', effect:{ type:'dodge', value:0.10 } },
    { id:'wist_4', name:'疾風の舞', description:'ダッシュ距離+50%', family:'wisteria', rarity:'rare', icon:'💜', effect:{ type:'dashMul', value:0.50 } },

    { id:'lotus_1', name:'蓮の導き', description:'レアドロップ率+15%', family:'lotus', rarity:'common', icon:'🪷', effect:{ type:'dropRate', value:0.15 } },
    { id:'lotus_2', name:'福の花粉', description:'ネクター獲得+20%', family:'lotus', rarity:'common', icon:'🪷', effect:{ type:'nectarMul', value:0.20 } },
    { id:'lotus_3', name:'幸運の蓮華', description:'祝福選択肢+1（4択に）', family:'lotus', rarity:'rare', icon:'🪷', effect:{ type:'extraChoice', value:1 } },
    { id:'lotus_4', name:'黄金の蓮', description:'部屋クリア時ゴールド+50%', family:'lotus', rarity:'rare', icon:'🪷', effect:{ type:'goldMul', value:0.50 } },

    { id:'chr_1', name:'菊の知恵', description:'EXP獲得+25%', family:'chrysanthemum', rarity:'common', icon:'🌸', effect:{ type:'expMul', value:0.25 } },
    { id:'chr_2', name:'花火', description:'敵撃破時に周囲に爆発ダメージ10', family:'chrysanthemum', rarity:'common', icon:'🌸', effect:{ type:'explode', value:10 } },
    { id:'chr_3', name:'時の花', description:'スキルクールダウン-20%', family:'chrysanthemum', rarity:'rare', icon:'🌸', effect:{ type:'cdReduce', value:0.20 } },
    { id:'chr_4', name:'輪廻の花', description:'祝福をランダム1個追加獲得', family:'chrysanthemum', rarity:'rare', icon:'🌸', effect:{ type:'bonusBlessing', value:1 } }
  ];

  const FAMILY_COLORS = {
    rose:'#e74c3c',
    lily:'#ecf0f1',
    sunflower:'#f1c40f',
    wisteria:'#9b59b6',
    lotus:'#e91e8b',
    chrysanthemum:'#e67e22'
  };

  const RARITY_WEIGHTS = { common: 0.7, rare: 0.3 };
  let _owned = [];
  let _bonuses = {};
  let _buffs = { barrier: 0, revive: [] };

  function _addBonus(type, value) {
    if (typeof value !== 'number') return;
    _bonuses[type] = (_bonuses[type] || 0) + value;
  }

  function _ensureBuffs(playerStats) {
    if (!playerStats) return;
    if (!Array.isArray(playerStats.buffs)) playerStats.buffs = [];
  }

  function getRandomBlessings(count, ownedIds) {
    const excluded = new Set(ownedIds || []);
    const available = BLESSING_DATA.filter((b) => !excluded.has(b.id));
    const picks = [];
    let pool = available.slice();

    for (let i = 0; i < count && pool.length > 0; i++) {
      let total = 0;
      for (const b of pool) total += (RARITY_WEIGHTS[b.rarity] || 0);
      if (total <= 0) break;
      let roll = Math.random() * total;
      let pickedIndex = pool.length - 1;
      for (let j = 0; j < pool.length; j++) {
        roll -= (RARITY_WEIGHTS[pool[j].rarity] || 0);
        if (roll <= 0) { pickedIndex = j; break; }
      }
      picks.push(pool.splice(pickedIndex, 1)[0]);
    }
    return picks;
  }

  function applyBlessing(blessing, playerStats) {
    if (!blessing) return;
    if (_owned.some((b) => b.id === blessing.id)) return;
    _owned.push(blessing);

    const effect = blessing.effect || {};
    const value = effect.value;

    if (effect.type === 'barrier') {
      _buffs.barrier += value || 0;
      _ensureBuffs(playerStats);
      if (playerStats) playerStats.buffs.push({ type: 'barrier', value: value || 0 });
      return;
    }

    if (effect.type === 'revive') {
      _buffs.revive.push(value || 0);
      _ensureBuffs(playerStats);
      if (playerStats) playerStats.buffs.push({ type: 'revive', value: value || 0 });
      return;
    }

    if (effect.type === 'maxHp' && playerStats) {
      playerStats.maxHp = (playerStats.maxHp || 0) + (value || 0);
      playerStats.hp = Math.min(playerStats.maxHp, (playerStats.hp || 0) + (value || 0));
    }

    if (playerStats && typeof value === 'number') {
      playerStats[effect.type] = (playerStats[effect.type] || 0) + value;
    }

    _addBonus(effect.type, value);
  }

  function getOwnedBlessings() {
    return _owned.slice();
  }

  function resetBlessings() {
    _owned = [];
    _bonuses = {};
    _buffs = { barrier: 0, revive: [] };
  }

  function getStatBonus(type) {
    if (type === 'barrier') return _buffs.barrier;
    if (type === 'revive') return _buffs.revive.length;
    return _bonuses[type] || 0;
  }

  function consumeBarrier() {
    if (_buffs.barrier > 0) {
      _buffs.barrier -= 1;
      return true;
    }
    return false;
  }

  function consumeRevive() {
    if (_buffs.revive.length > 0) return _buffs.revive.shift();
    return 0;
  }

  return {
    BLESSING_DATA,
    FAMILY_COLORS,
    getRandomBlessings,
    applyBlessing,
    getOwnedBlessings,
    resetBlessings,
    getStatBonus,
    consumeBarrier,
    consumeRevive
  };
})();
