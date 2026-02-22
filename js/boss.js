/**
 * boss.js - ボス戦管理
 */
const BossManager = (() => {
  let _boss = null;
  let _phase = 0;
  let _phaseTimer = 0;
  let _dialogQueue = [];
  let _waitOption = false;
  let _bullets = [];
  let _summons = [];
  let _lastHitType = 'attack';

  function _makeBoss(id) {
    const def = (Balance && Balance.BOSSES && Balance.BOSSES[id]) || null;
    if (!def) return null;
    const ts = CONFIG.TILE_SIZE;
    return {
      id,
      name: def.name,
      x: 9 * ts,
      y: 4 * ts,
      w: ts * 2,
      h: ts * 2,
      hp: def.hp,
      maxHp: def.hp,
      atk: def.atk,
      speed: def.speed
    };
  }

  function start(bossId) {
    _boss = _makeBoss(bossId);
    _phase = 0;
    _phaseTimer = 0;
    _dialogQueue = [];
    _waitOption = false;
    _bullets = [];
    _summons = [];
    _lastHitType = 'attack';
  }

  function update(dt, player, flags) {
    if (!_boss) return;
    _phaseTimer += dt;
    const ts = CONFIG.TILE_SIZE;
    const dx = player.x - _boss.x;
    const dy = player.y - _boss.y;
    const dist = Math.sqrt(dx*dx + dy*dy) || 1;
    const hpRatio = _boss.hp / _boss.maxHp;

    if (_boss.id === 'mushroom_king') {
      if (hpRatio <= 0.2) _phase = 2;
      else if (hpRatio <= 0.5) _phase = 1;
      else _phase = 0;

      const chargeSpeed = _phase === 2 ? 5 : 3;
      const pause = _phase === 2 ? 0.5 : 1.5;
      if (!_boss._state) _boss._state = 'pause';
      if (_boss._state === 'pause') {
        if (_phaseTimer >= pause) {
          _boss._state = 'charge';
          _boss._chargeTimer = 2.0;
          _boss._vx = (dx / dist) * chargeSpeed;
          _boss._vy = (dy / dist) * chargeSpeed;
          _phaseTimer = 0;
        }
      } else {
        _boss.x += _boss._vx * dt * 60;
        _boss.y += _boss._vy * dt * 60;
        _boss._chargeTimer -= dt;
        if (_boss._chargeTimer <= 0) {
          _boss._state = 'pause';
          _phaseTimer = 0;
          if (_phase >= 1) {
            const spores = _phase === 2 ? 8 : 5;
            for (let i=0;i<spores;i++) {
              const a = (Math.PI*2/spores) * i;
              _bullets.push({ x:_boss.x+ts, y:_boss.y+ts, vx:Math.cos(a)*2, vy:Math.sin(a)*2, life:2, dmg:1 });
            }
          }
        }
      }
    } else if (_boss.id === 'dark_queen') {
      if (hpRatio <= 0.15) _phase = 3;
      else if (hpRatio <= 0.4) _phase = 2;
      else if (hpRatio <= 0.7) _phase = 1;
      else _phase = 0;

      if (_phase === 3) {
        _waitOption = (flags.killCount === 0);
        if (!_boss._waitDone) {
          _dialogQueue = [NpcManager.getBossLine(3, hpRatio) || '……'];
          _boss._waitDone = true;
        }
      } else {
        _waitOption = false;
      }

      if (_phase <= 1) {
        if (!_boss._shotTimer) _boss._shotTimer = 0;
        _boss._shotTimer -= dt;
        if (_boss._shotTimer <= 0) {
          for (let i=-2;i<=2;i++) {
            const a = Math.atan2(dy, dx) + i * 0.2;
            _bullets.push({ x:_boss.x+ts, y:_boss.y+ts, vx:Math.cos(a)*2, vy:Math.sin(a)*2, life:2, dmg:1 });
          }
          _boss._shotTimer = 2.0;
        }
        if (_phase === 1 && !_boss._summoned) {
          _summons = [{type:'shadow_bee',x:7,y:6},{type:'shadow_bee',x:9,y:6},{type:'shadow_bee',x:11,y:6}];
          _summons.forEach(s => EnemyManager.spawn(s.type, s.x, s.y));
          _boss._summoned = true;
        }
      } else if (_phase === 2) {
        if (!_boss._dashTimer) _boss._dashTimer = 0;
        _boss._dashTimer -= dt;
        if (_boss._dashTimer <= 0) {
          _boss._vx = (dx / dist) * 6;
          _boss._vy = (dy / dist) * 6;
          _boss._dashTimer = 1.5;
          Engine.triggerShake(6, 8);
        }
        _boss.x += (_boss._vx || 0) * dt * 60;
        _boss.y += (_boss._vy || 0) * dt * 60;
      }
    }

    _bullets = _bullets.filter(b => {
      b.x += b.vx * dt * 60;
      b.y += b.vy * dt * 60;
      b.life -= dt;
      const pdx = player.x + ts/2 - b.x, pdy = player.y + ts/2 - b.y;
      if (Math.sqrt(pdx*pdx + pdy*pdy) < ts*0.6) {
        player.hp = Math.max(0, player.hp - b.dmg);
        return false;
      }
      return b.life > 0;
    });
  }

  function draw(ctx) {
    if (!_boss) return;
    const ts = CONFIG.TILE_SIZE;
    ctx.fillStyle = '#552222';
    ctx.beginPath();
    ctx.arc(_boss.x + ts, _boss.y + ts, ts, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(_boss.id === 'dark_queen' ? '👸' : '👑', _boss.x + ts, _boss.y + ts + 8);

    // hp bar
    const W = CONFIG.CANVAS_WIDTH;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(100, 20, W-200, 20);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(100, 20, (W-200) * (_boss.hp / _boss.maxHp), 20);
    ctx.fillStyle = '#fff';
    ctx.font = '14px monospace';
    ctx.fillText(_boss.id === 'dark_queen' ? '闇蜂女王レイラ' : 'マッシュルーム王', W/2, 35);

    for (const b of _bullets) {
      ctx.fillStyle = '#9b59b6';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 4, 0, Math.PI*2);
      ctx.fill();
    }

    if (_waitOption) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(W/2-100, CONFIG.CANVAS_HEIGHT-80, 200, 34);
      ctx.fillStyle = '#fff';
      ctx.font = '16px monospace';
      ctx.fillText('Enter: 待つ', W/2, CONFIG.CANVAS_HEIGHT-58);
    }
  }

  function checkHit(box, damage, flags) {
    if (!_boss) return false;
    if (box.x < _boss.x + _boss.w && box.x + box.w > _boss.x && box.y < _boss.y + _boss.h && box.y + box.h > _boss.y) {
      _boss.hp -= damage;
      _lastHitType = 'attack';
      return true;
    }
    return false;
  }

  function needleHit(damage, flags) {
    if (!_boss) return false;
    _boss.hp -= damage;
    _lastHitType = 'needle';
    return true;
  }

  function isActive() { return !!_boss; }
  function isBossDead() { return !!_boss && _boss.hp <= 0; }
  function getEndingTrigger() {
    if (_lastHitType === 'needle') return 'needle_finish';
    if (_lastHitType === 'wait') return 'wait';
    return 'normal';
  }
  function chooseWait() { _lastHitType = 'wait'; _boss.hp = 0; }
  function clear() { _boss = null; _bullets = []; _summons = []; _waitOption = false; }

  return { start, update, draw, checkHit, needleHit, isActive, isBossDead, getEndingTrigger, clear, chooseWait };
})();
