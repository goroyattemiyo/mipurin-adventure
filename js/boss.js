/**
 * boss.js - ボス戦管理
 * ミプリンの冒険 v0.5.0
 */
const BossManager = (() => {
  let _boss = null;
  let _bullets = [];
  let _voiceText = '';
  let _voiceTimer = 0;
  let _elapsedTime = 0;

  function spawn(bossId) {
    const t = Balance.BOSSES[bossId];
    if (!t) { console.warn('Unknown boss:', bossId); return null; }
    const ts = CONFIG.TILE_SIZE;
    const map = MapManager.getCurrentMap ? MapManager.getCurrentMap() : null;
    const size = t.size || 2;
    const w = ts * size;
    const h = ts * size;
    let x = (CONFIG.CANVAS_WIDTH - w) / 2;
    let y = (CONFIG.CANVAS_HEIGHT - h) / 3;
    if (map) {
      x = (map.cols / 2 - size / 2) * ts;
      y = (map.rows / 3 - size / 2) * ts;
    }

    _boss = {
      id: t.id,
      name: t.name,
      hp: t.hp,
      maxHp: t.hp,
      atk: t.atk,
      speed: t.speed,
      phases: t.phases || [],
      symbol: t.symbol,
      color: t.color,
      size,
      x, y,
      state: 'idle',
      stateTimer: 0,
      attackTimer: 0,
      phaseIndex: 0,
      hurtTimer: 0,
      dead: false
    };
    _bullets = [];
    _voiceText = '';
    _voiceTimer = 0;
    return _boss;
  }

  function _getPhaseIndex(hpRatio) {
    if (!_boss || !_boss.phases || _boss.phases.length === 0) return 0;
    let idx = 0;
    for (let i = 0; i < _boss.phases.length; i++) {
      if (hpRatio <= _boss.phases[i].hpThreshold) idx = i;
    }
    return idx;
  }

  function _fireBullet(x, y, vx, vy, damage, color) {
    _bullets.push({ x, y, vx, vy, damage, color: color || '#fff', life: 6 });
  }

  function _spawnRadial(count, speed, damage, color) {
    const cx = _boss.x + _boss.size * CONFIG.TILE_SIZE / 2;
    const cy = _boss.y + _boss.size * CONFIG.TILE_SIZE / 2;
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count;
      _fireBullet(cx, cy, Math.cos(a) * speed, Math.sin(a) * speed, damage, color);
    }
  }

  function _damagePlayer(player, sourceAtk) {
    if (player.knockback.timer > 0 || player.invincibleTimer > 0) return;
    const skBonus = (typeof Skills !== 'undefined') ? Skills.getBonus() : {};
    const def = skBonus.def || 0;
    const invReduction = (typeof Inventory !== 'undefined') ? Inventory.getDefReduction(player) : 0;
    const rawDmg = sourceAtk;
    const finalDmg = Math.max(1, rawDmg - def - invReduction);
    player.hp -= finalDmg;
    if (player.hp < 0) player.hp = 0;
    const invulnBonus = skBonus.invuln || 0;
    player.invincibleTimer = 1.0 + invulnBonus;
    const ts = CONFIG.TILE_SIZE;
    const bx = _boss ? _boss.x + ts : player.x;
    const by = _boss ? _boss.y + ts : player.y;
    const dx = player.x - bx, dy = player.y - by;
    const dist = Math.sqrt(dx*dx + dy*dy) || 1;
    player.knockback.x = (dx/dist) * 3;
    player.knockback.y = (dy/dist) * 3;
    player.knockback.timer = 0.3;
    player.hitStopFrames = 3;
    Engine.triggerShake(4, 6);
  }

  function _moveBoss(dt, dirX, dirY, speedMul) {
    if (!_boss) return;
    const ts = CONFIG.TILE_SIZE;
    const spd = _boss.speed * (speedMul || 1) * dt * 60;
    const nx = _boss.x + dirX * spd;
    const ny = _boss.y + dirY * spd;
    const margin = 4;
    const size = _boss.size;
    const cL = Math.floor((nx + margin) / ts);
    const cR = Math.floor((nx + ts * size - margin - 1) / ts);
    const rT = Math.floor((ny + margin) / ts);
    const rB = Math.floor((ny + ts * size - margin - 1) / ts);
    if (!MapManager.isSolid(cL, rT) && !MapManager.isSolid(cR, rT) && !MapManager.isSolid(cL, rB) && !MapManager.isSolid(cR, rB)) {
      _boss.x = nx;
      _boss.y = ny;
    }
  }

  function update(dt, player) {
    if (!_boss || _boss.dead) return;
    _elapsedTime += dt;

    if (_boss.hurtTimer > 0) _boss.hurtTimer -= dt;

    const hpRatio = _boss.hp / _boss.maxHp;
    const nextPhase = _getPhaseIndex(hpRatio);
    if (nextPhase !== _boss.phaseIndex) {
      _boss.phaseIndex = nextPhase;
      _boss.state = 'idle';
      _boss.stateTimer = 0;
      _boss.attackTimer = 0;
    }
    const phase = _boss.phases[_boss.phaseIndex] || { pattern: 'charge' };

    if (_boss.id === 'dark_queen') {
      if (_voiceTimer <= 0 && typeof NpcManager !== 'undefined') {
        _voiceText = NpcManager.getBossLine(_boss.phaseIndex, hpRatio);
        _voiceTimer = 3.0;
      }
    }
    if (_voiceTimer > 0) _voiceTimer -= dt;

    _boss.attackTimer -= dt;

    switch (phase.pattern) {
      case 'charge':
      case 'frenzy': {
        if (_boss.stateTimer <= 0) {
          if (_boss.state === 'charge') {
            _boss.state = 'pause';
            _boss.stateTimer = phase.pauseSec || 1.0;
          } else {
            _boss.state = 'charge';
            _boss.stateTimer = 0.6;
          }
        }
        if (_boss.state === 'charge') {
          const dx = player.x - _boss.x;
          const dy = player.y - _boss.y;
          const dist = Math.sqrt(dx*dx + dy*dy) || 1;
          const speedMul = (phase.chargeSpeed || 3) / _boss.speed;
          _moveBoss(dt, dx / dist, dy / dist, speedMul);
        }
        if (_boss.state === 'charge' && phase.pattern === 'frenzy' && _boss.attackTimer <= 0) {
          _spawnRadial(phase.sporeCount || 6, 1.5, phase.sporeDmg || 1, '#c56bff');
          _boss.attackTimer = 0.8;
        }
        _boss.stateTimer -= dt;
        break;
      }
      case 'spore': {
        if (_boss.attackTimer <= 0) {
          _spawnRadial(phase.sporeCount || 5, 1.2, phase.sporeDmg || 1, '#c56bff');
          _boss.attackTimer = phase.pauseSec || 1.3;
        }
        break;
      }
      case 'ice_shot': {
        if (_boss.attackTimer <= 0) {
          const dx = player.x - _boss.x;
          const dy = player.y - _boss.y;
          const dist = Math.sqrt(dx*dx + dy*dy) || 1;
          const baseA = Math.atan2(dy, dx);
          const count = phase.bulletCount || 3;
          const spread = 0.2;
          const speed = phase.bulletSpeed || 2;
          const cx = _boss.x + _boss.size * CONFIG.TILE_SIZE / 2;
          const cy = _boss.y + _boss.size * CONFIG.TILE_SIZE / 2;
          for (let i = 0; i < count; i++) {
            const a = baseA + (i - (count - 1) / 2) * spread;
            _fireBullet(cx, cy, Math.cos(a) * speed, Math.sin(a) * speed, _boss.atk, '#aee7ff');
          }
          _boss.attackTimer = 1.1;
        }
        break;
      }
      case 'ice_storm': {
        if (_boss.attackTimer <= 0) {
          _spawnRadial(phase.bulletCount || 8, phase.chargeSpeed || 2.2, _boss.atk, '#c8f1ff');
          _boss.attackTimer = 1.4;
        }
        break;
      }
      case 'dark_barrage': {
        if (_boss.attackTimer <= 0) {
          const dx = player.x - _boss.x;
          const dy = player.y - _boss.y;
          const dist = Math.sqrt(dx*dx + dy*dy) || 1;
          const baseA = Math.atan2(dy, dx);
          const count = phase.bulletCount || 5;
          const spread = 0.3;
          const speed = phase.bulletSpeed || 2;
          const cx = _boss.x + _boss.size * CONFIG.TILE_SIZE / 2;
          const cy = _boss.y + _boss.size * CONFIG.TILE_SIZE / 2;
          for (let i = 0; i < count; i++) {
            const a = baseA + (i - (count - 1) / 2) * spread;
            _fireBullet(cx, cy, Math.cos(a) * speed, Math.sin(a) * speed, _boss.atk, '#5d3c7a');
          }
          _boss.attackTimer = 0.8;
        }
        break;
      }
      case 'summon': {
        if (_boss.attackTimer <= 0) {
          const count = phase.summonCount || 2;
          if (typeof EnemyManager !== 'undefined') {
            const ts = CONFIG.TILE_SIZE;
            for (let i = 0; i < count; i++) {
              const ox = Math.round((_boss.x / ts) + (Math.random() * 3 - 1));
              const oy = Math.round((_boss.y / ts) + (Math.random() * 3 - 1));
              EnemyManager.spawn(phase.summonType || 'shadow_bee', ox, oy);
            }
          }
          _boss.attackTimer = 2.5;
        }
        break;
      }
      case 'weaken': {
        if (_boss.attackTimer <= 0) {
          _boss.attackTimer = phase.pauseSec || 2.5;
        }
        break;
      }
    }

    for (const b of _bullets) {
      b.x += b.vx * dt * 60;
      b.y += b.vy * dt * 60;
      b.life -= dt;
    }
    _bullets = _bullets.filter(b => b.life > 0);

    const ts = CONFIG.TILE_SIZE;
    const px = player.x, py = player.y;
    const pw = ts, ph = ts;
    for (const b of _bullets) {
      const r = 6;
      if (px < b.x + r && px + pw > b.x - r && py < b.y + r && py + ph > b.y - r) {
        b.life = 0;
        _damagePlayer(player, b.damage || 1);
      }
    }

    const bx = _boss.x, by = _boss.y;
    const bw = ts * _boss.size, bh = ts * _boss.size;
    if (px < bx + bw && px + pw > bx && py < by + bh && py + ph > by) {
      _damagePlayer(player, _boss.atk);
    }
  }

  function checkHit(box, damage) {
    if (!_boss || _boss.dead) return false;
    const ts = CONFIG.TILE_SIZE;
    const bx = _boss.x, by = _boss.y;
    const bw = ts * _boss.size, bh = ts * _boss.size;
    if (box.x < bx + bw && box.x + box.w > bx && box.y < by + bh && box.y + box.h > by) {
      _boss.hp -= damage;
      _boss.hurtTimer = 0.2;
      if (_boss.hp <= 0) _boss.dead = true;
      return true;
    }
    return false;
  }

  function draw(ctx) {
    if (!_boss || _boss.dead) return;
    const ts = CONFIG.TILE_SIZE;
    const x = Math.round(_boss.x), y = Math.round(_boss.y);
    const size = _boss.size;
    const bx = x + (ts * size) / 2;
    const by = y + (ts * size) / 2;

    if (typeof SpriteVariant !== 'undefined') {
      const bossGlowColor = 'hsla(0, 100%, 50%, 0.4)';
      SpriteVariant.drawEliteGlow(ctx, bx, by, (ts * size) * 1.5, bossGlowColor, _elapsedTime);
    }

    ctx.fillStyle = _boss.color || '#fff';
    ctx.beginPath();
    ctx.arc(bx, by, (ts * size) / 2 - 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = `${18 * size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.fillText(_boss.symbol || 'B', bx, by);

    const barW = ts * size + 20;
    const barX = x + (ts * size) / 2 - barW / 2;
    const barY = y - 12;
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barW, 6);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(barX, barY, barW * (_boss.hp / _boss.maxHp), 6);

    for (const b of _bullets) {
      ctx.fillStyle = b.color || '#fff';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    if (_voiceTimer > 0 && _voiceText) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, _voiceTimer / 1.0);
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(40, 40, CONFIG.CANVAS_WIDTH - 80, 60);
      ctx.fillStyle = '#fff';
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(_voiceText, CONFIG.CANVAS_WIDTH / 2, 70);
      ctx.restore();
    }
  }

  function isActive() { return !!(_boss && !_boss.dead); }
  function getCurrentBoss() { return _boss; }

  return { spawn, update, draw, checkHit, isActive, getCurrentBoss };
})();
