const Skills = (() => {
  const TREE = {
    attack: [
      { id: 'atk_up',       name: '攻撃力UP',     desc: 'ATK +1/Lv',         stat: 'atk',      perLv: 1,    maxLv: 5 },
      { id: 'crit_rate',    name: '会心率UP',     desc: '会心率 +3%/Lv',     stat: 'critRate',  perLv: 0.03, maxLv: 5 },
      { id: 'crit_dmg',     name: '会心ダメージ', desc: '会心倍率 +0.2/Lv',  stat: 'critDmg',   perLv: 0.2,  maxLv: 5 },
      { id: 'attack_speed', name: '攻撃速度UP',   desc: '攻撃速度 +5%/Lv',   stat: 'atkSpeed',  perLv: 0.05, maxLv: 5 },
      { id: 'needle_power', name: '針強化',       desc: '針ダメージ +2/Lv',  stat: 'needleDmg', perLv: 2,    maxLv: 5 },
    ],
    defense: [
      { id: 'hp_up',        name: 'HP UP',         desc: 'HP +3/Lv',          stat: 'hp',        perLv: 3,    maxLv: 5 },
      { id: 'def_up',       name: '防御力UP',     desc: 'DEF +1/Lv',         stat: 'def',       perLv: 1,    maxLv: 5 },
      { id: 'regen',        name: 'HP回復',       desc: '10秒毎HP +1/Lv',    stat: 'regen',     perLv: 1,    maxLv: 5 },
      { id: 'dash_reduce',  name: 'ダッシュ短縮', desc: 'CD -0.1s/Lv',       stat: 'dashCD',    perLv: -0.1, maxLv: 5 },
      { id: 'invuln_ext',   name: '無敵延長',     desc: '被弾無敵 +0.2s/Lv', stat: 'invuln',    perLv: 0.2,  maxLv: 5 },
    ],
    explore: [
      { id: 'speed_up',     name: '移動速度UP',   desc: '速度 +0.3/Lv',      stat: 'speed',     perLv: 0.3,  maxLv: 5 },
      { id: 'needle_cap',   name: '針所持UP',     desc: '針上限 +1/Lv',      stat: 'needleMax', perLv: 1,    maxLv: 5 },
      { id: 'needle_regen', name: '針回復UP',     desc: '回復間隔 -5s/Lv',   stat: 'needleCD',  perLv: -5,   maxLv: 5 },
      { id: 'drop_rate',    name: 'ドロップUP',   desc: 'ドロップ率 +5%/Lv', stat: 'dropRate',  perLv: 0.05, maxLv: 5 },
      { id: 'exp_up',       name: '経験値UP',     desc: 'EXP +10%/Lv',       stat: 'expMult',   perLv: 0.10, maxLv: 5 },
    ],
  };

  let _points = 0;
  let _allocated = {};

  function init() {
    _points = 0;
    _allocated = {};
    Object.values(TREE).flat().forEach(s => { _allocated[s.id] = 0; });
  }

  function getPoints() { return _points; }
  function addPoint(n) { _points += (n || 1); }
  function getLevel(skillId) { return _allocated[skillId] || 0; }

  function canAllocate(skillId) {
    if (_points <= 0) return false;
    const skill = _findSkill(skillId);
    if (!skill) return false;
    return _allocated[skillId] < skill.maxLv;
  }

  function allocate(skillId) {
    if (!canAllocate(skillId)) return false;
    _allocated[skillId]++;
    _points--;
    return true;
  }

  function getBonus() {
    const bonus = {};
    Object.values(TREE).flat().forEach(skill => {
      const lv = _allocated[skill.id] || 0;
      if (lv > 0) {
        bonus[skill.stat] = (bonus[skill.stat] || 0) + skill.perLv * lv;
      }
    });
    return bonus;
  }

  function _findSkill(id) {
    return Object.values(TREE).flat().find(s => s.id === id) || null;
  }

  function serialize() { return { points: _points, allocated: { ..._allocated } }; }

  function deserialize(data) {
    if (!data) return;
    _points = data.points || 0;
    if (data.allocated) {
      Object.keys(data.allocated).forEach(k => {
        if (Object.prototype.hasOwnProperty.call(_allocated, k)) _allocated[k] = data.allocated[k];
      });
    }
  }

  function getTree() { return TREE; }

  return { init, getPoints, addPoint, getLevel, canAllocate, allocate, getBonus, getTree, serialize, deserialize };
})();
