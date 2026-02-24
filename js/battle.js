/**
 * battle.js - プレイヤー操作・移動・攻撃・敵管理
 * ミプリンの冒険 v0.6.0
 */
const PlayerController = (() => {
  const P_COLOR = '#F5A623';
  const P_OUTLINE = '#2B1B0E';

  /* スプライトアニメーター */
  let _animator = null;
  function _ensureAnimator() {
    if (!_animator && typeof SpriteManager !== 'undefined' && SpriteManager.isLoaded('player')) {
      _animator = SpriteManager.createAnimator('player');
      _animator.play('idle_down');
    }
    return _animator;
  }

  function _clampPlayerToMap(player) {
    const map = MapManager.getCurrentMap ? MapManager.getCurrentMap() : null;
    if (!map) return;
    const ts = CONFIG.TILE_SIZE;
    const maxX = map.cols * ts - ts;
    const maxY = map.rows * ts - ts;
    player.x = Math.max(0, Math.min(player.x, maxX));
    player.y = Math.max(0, Math.min(player.y, maxY));
  }

  /* ---- アニメーション状態を更新（updateとは独立して毎フレーム呼ぶ） ---- */
  function updateAnimation(player, dt) {
    const anim = _ensureAnimator();
    if (!anim) return;

    // ノックバック中・被ダメ中
    if (player.knockback.timer > 0) {
      anim.play('hurt');
      anim.update(dt);
      return;
    }

    // 死亡中
    if (player.hp <= 0) {
      anim.play('dead');
      anim.update(dt);
      return;
    }

    // 攻撃中
    if (player.attackCooldown > 0.15) {
      anim.play('attack_down');
      anim.update(dt);
      return;
    }

    // 移動中 or idle
    const moving = Engine.isPressed('up') || Engine.isPressed('down') || Engine.isPressed('left') || Engine.isPressed('right');
    if (moving) {
      anim.play('walk_' + player.dir);
    } else {
      anim.play('idle_' + player.dir);
    }
    anim.update(dt);
  }

  function update(player, dt) {
    if (player.hitStopFrames > 0) { player.hitStopFrames--; return; }

    /* ノックバック処理 */
    if (player.knockback.timer > 0) {
      player.x += player.knockback.x * dt * 60;
      player.y += player.knockback.y * dt * 60;
      _clampPlayerToMap(player);
      player.knockback.timer -= dt;
      return;
    }

    /* 方向入力 */
    let dx = 0, dy = 0;
    if (Engine.isPressed('up'))    { dy = -1; player.dir = 'up'; }
    if (Engine.isPressed('down'))  { dy =  1; player.dir = 'down'; }
    if (Engine.isPressed('left'))  { dx = -1; player.dir = 'left'; }
    if (Engine.isPressed('right')) { dx =  1; player.dir = 'right'; }

    if (dx !== 0 || dy !== 0) {
      player.lastInputDir = player.dir;
      player.animTimer += dt;
      if (player.animTimer >= 0.15) { player.animTimer = 0; player.animFrame = (player.animFrame + 1) % 4; }

      const ts = CONFIG.TILE_SIZE;
      const spd = player.speed * dt * 60;
      const newPx = player.x + dx * spd;
      const newPy = player.y + dy * spd;
      const margin = 4;

      /* X軸 */
      const tL = Math.floor((newPx + margin) / ts), tR = Math.floor((newPx + ts - margin - 1) / ts);
      const cR1 = Math.floor((player.y + margin) / ts), cR2 = Math.floor((player.y + ts - margin - 1) / ts);
      if (!MapManager.isSolid(tL,cR1)&&!MapManager.isSolid(tR,cR1)&&!MapManager.isSolid(tL,cR2)&&!MapManager.isSolid(tR,cR2)
        &&!MapManager.getNpcAt(tL,cR1)&&!MapManager.getNpcAt(tR,cR1)&&!MapManager.getNpcAt(tL,cR2)&&!MapManager.getNpcAt(tR,cR2)) {
        player.x = newPx;
      }

      /* Y軸 */
      const cC1 = Math.floor((player.x + margin) / ts), cC2 = Math.floor((player.x + ts - margin - 1) / ts);
      const tT = Math.floor((newPy + margin) / ts), tB = Math.floor((newPy + ts - margin - 1) / ts);
      if (!MapManager.isSolid(cC1,tT)&&!MapManager.isSolid(cC2,tT)&&!MapManager.isSolid(cC1,tB)&&!MapManager.isSolid(cC2,tB)
        &&!MapManager.getNpcAt(cC1,tT)&&!MapManager.getNpcAt(cC2,tT)&&!MapManager.getNpcAt(cC1,tB)&&!MapManager.getNpcAt(cC2,tB)) {
        player.y = newPy;
      }
    }

    _clampPlayerToMap(player);

    /* クールダウン（秒ベース） */
    if (player.attackCooldown > 0) player.attackCooldown -= dt;
    if (player.needleCooldown > 0) player.needleCooldown -= dt;
  }

  function checkInteract(player) {
    const ts = CONFIG.TILE_SIZE;
    const cc = Math.floor((player.x + ts/2) / ts), cr = Math.floor((player.y + ts/2) / ts);
    let tc = cc, tr = cr;
    switch (player.dir) { case 'up': tr--; break; case 'down': tr++; break; case 'left': tc--; break; case 'right': tc++; break; }
    const npc = MapManager.getNpcAt(tc, tr);
    if (npc) return { type: 'npc', npc: npc };
    const tile = MapManager.getTile(tc, tr);
    if (tile === MapManager.TILE.SAVE_POINT) return { type: 'save' };
    if (tile === MapManager.TILE.SIGN) return { type: 'sign' };
    if (tile === MapManager.TILE.CHEST) return { type: 'chest' };
    if (tile === MapManager.TILE.STUMP) return { type: 'stump' };
    if (tile === MapManager.TILE.SEAL_WALL) return { type: 'seal_wall', col: tc, row: tr };
    return null;
  }

  function checkExit(player) {
    const ts = CONFIG.TILE_SIZE;
    const c = Math.floor((player.x + ts/2) / ts), r = Math.floor((player.y + ts/2) / ts);
    return MapManager.getExitAt(c, r);
  }

  /* ── 攻撃判定（範囲取得） ── */
  function getAttackBox(player) {
    const ts = CONFIG.TILE_SIZE;
    const cx = player.x + ts / 2, cy = player.y + ts / 2;
    const range = ts * 1.2;
    const size = ts * 0.8;
    let ax = cx, ay = cy;
    switch (player.dir) {
      case 'up':    ay -= range; break;
      case 'down':  ay += range; break;
      case 'left':  ax -= range; break;
      case 'right': ax += range; break;
    }
    return { x: ax - size/2, y: ay - size/2, w: size, h: size };
  }

  function draw(ctx, player) {
    const ts = CONFIG.TILE_SIZE;
    const x = Math.round(player.x), y = Math.round(player.y);

    /* 影 */
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(x + ts / 2, y + ts - 2, ts / 3, ts / 6, 0, 0, Math.PI * 2);
    ctx.fill();

    /* 被ダメ点滅 */
    const hurt = player.knockback.timer > 0 && Math.floor(Date.now() / 80) % 2;
    if (hurt) return;

    /* スプライト描画を試行 */
    const anim = _ensureAnimator();
    if (anim) {
      ctx.save();
      /* 無敵中は点滅 */
      if (player.invincibleTimer > 0 && Math.floor(Date.now() / 100) % 3 === 0) {
        ctx.globalAlpha = 0.4;
      }
      const drawn = anim.draw(ctx, x, y, ts, ts);
      ctx.restore();
      if (drawn) return;
    }

    /* フォールバック: 図形描画（スプライト未読込時） */
    ctx.fillStyle = P_COLOR;
    ctx.strokeStyle = P_OUTLINE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + ts / 2, y + ts / 2 - 2, ts / 2 - 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = P_OUTLINE;
    ctx.beginPath();
    const cx2 = x + ts / 2, cy2 = y + ts / 2 - 2, s = 5;
    switch (player.dir) {
      case 'up':    ctx.moveTo(cx2, cy2 - s * 2); ctx.lineTo(cx2 - s, cy2 - s); ctx.lineTo(cx2 + s, cy2 - s); break;
      case 'down':  ctx.moveTo(cx2, cy2 + s * 2); ctx.lineTo(cx2 - s, cy2 + s); ctx.lineTo(cx2 + s, cy2 + s); break;
      case 'left':  ctx.moveTo(cx2 - s * 2, cy2); ctx.lineTo(cx2 - s, cy2 - s); ctx.lineTo(cx2 - s, cy2 + s); break;
      case 'right': ctx.moveTo(cx2 + s * 2, cy2); ctx.lineTo(cx2 + s, cy2 - s); ctx.lineTo(cx2 + s, cy2 + s); break;
    }
    ctx.fill();
  }

  /* ── 攻撃エフェクト描画 ── */
  function drawAttackEffect(ctx, player, timer) {
    if (timer <= 0) return;
    const box = getAttackBox(player);
    ctx.save();
    ctx.globalAlpha = timer * 2;
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    const cx = box.x + box.w/2, cy = box.y + box.h/2, r = box.w/2;
    ctx.arc(cx, cy, r * (1 - timer), 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();
  }

  function drawNeedleEffect(ctx, player, timer) {
    if (timer <= 0) return;
    ctx.save();
    ctx.globalAlpha = timer;
    const ts = CONFIG.TILE_SIZE;
    const cx = player.x + ts/2, cy = player.y + ts/2;
    const r = ts * 2 * (1 - timer);
    ctx.strokeStyle = '#FF4444';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,68,68,0.15)';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }

  return { update, updateAnimation, checkInteract, checkExit, getAttackBox, draw, drawAttackEffect, drawNeedleEffect, clampToMap: _clampPlayerToMap };
})();

/* ============================================================
   EnemyManager - 敵の生成・更新・描画・当たり判定
   ============================================================ */
const EnemyManager = (() => {
  let _enemies = [];
  let _cleanupCounter = 0;
  const _spriteCache = new Map();

  const TEMPLATES = Balance.ENEMIES;

  function _normalizePattern(pattern) {
    switch (pattern) {
      case 'ambush': return 'chase';
      case 'explode': return 'wander_fast';
      case 'swoop': return 'wander_fast';
      case 'burrow': return 'wander';
      case 'root_attack': return 'stationary';
      case 'dive': return 'chase';
      default: return pattern || 'wander';
    }
  }

  function spawn(templateId, col, row) {
    const t = TEMPLATES[templateId];
    if (!t) { console.warn('Unknown enemy:', templateId); return; }
    const ts = CONFIG.TILE_SIZE;
    _enemies.push({
      id: templateId, name: t.name,
      x: col * ts, y: row * ts,
      hp: t.hp, maxHp: t.hp, atk: t.atk, speed: t.speed,
      color: t.color, symbol: t.symbol, xp: t.xp, pollen: t.pollen || 1,
      movePattern: _normalizePattern(t.pattern || t.movePattern),
      moveTimer: Math.random() * 2,
      moveDir: { x: 0, y: 0 },
      hurtTimer: 0, dead: false
    });
  }

  function spawnFromMap(mapEnemies) {
    _enemies = [];
    _cleanupCounter = 0;
    if (!mapEnemies) return;
    for (const e of mapEnemies) { spawn(e.type, e.x, e.y); }
  }

  function update(dt, player) {
    const ts = CONFIG.TILE_SIZE;
    for (const e of _enemies) {
      if (e.dead) continue;
      if (e.hurtTimer > 0) { e.hurtTimer -= dt; continue; }

      const dx = player.x - e.x, dy = player.y - e.y;
      const dist = Math.sqrt(dx*dx + dy*dy);

      e.moveTimer -= dt;
      if (e.moveTimer <= 0) {
        e.moveTimer = 1 + Math.random();
        switch (e.movePattern) {
          case 'wander':
          case 'wander_fast':
            e.moveDir.x = (Math.random()-0.5) * 2;
            e.moveDir.y = (Math.random()-0.5) * 2;
            break;
          case 'chase':
            if (dist < ts * 6 && dist > 0) { e.moveDir.x = dx/dist; e.moveDir.y = dy/dist; }
            else { e.moveDir.x = (Math.random()-0.5)*2; e.moveDir.y = (Math.random()-0.5)*2; }
            break;
          case 'stationary':
            e.moveDir.x = 0; e.moveDir.y = 0;
            break;
        }
      }

      if (e.speed > 0) {
        const nx = e.x + e.moveDir.x * e.speed * dt * 60;
        const ny = e.y + e.moveDir.y * e.speed * dt * 60;
        const margin = 4;
        const cL = Math.floor((nx+margin)/ts), cR = Math.floor((nx+ts-margin-1)/ts);
        const rT = Math.floor((ny+margin)/ts), rB = Math.floor((ny+ts-margin-1)/ts);
        if (!MapManager.isSolid(cL,rT)&&!MapManager.isSolid(cR,rT)&&!MapManager.isSolid(cL,rB)&&!MapManager.isSolid(cR,rB)) {
          e.x = nx; e.y = ny;
        } else {
          e.moveDir.x *= -1; e.moveDir.y *= -1;
        }
      }

      if (dist < ts * 0.7) {
        _damagePlayer(player, e);
      }
    }
    _cleanupCounter++;
    if (_cleanupCounter >= 30) {
      _enemies = _enemies.filter(e => !e.dead);
      _cleanupCounter = 0;
    }
  }

  function _damagePlayer(player, enemy) {
    if (player.knockback.timer > 0 || player.invincibleTimer > 0) return;
    player.hp -= enemy.atk;
    if (player.hp < 0) player.hp = 0;
    player.invincibleTimer = 1.0;
    const dx = player.x - enemy.x, dy = player.y - enemy.y;
    const dist = Math.sqrt(dx*dx + dy*dy) || 1;
    player.knockback.x = (dx/dist) * 3;
    player.knockback.y = (dy/dist) * 3;
    player.knockback.timer = 0.3;
    player.hitStopFrames = 3;
    Engine.triggerShake(4, 6);
  }

  function checkAttackHit(box, damage, flags) {
    let hitAny = false;
    for (const e of _enemies) {
      if (e.dead || e.hurtTimer > 0) continue;
      const ts = CONFIG.TILE_SIZE;
      const ex = e.x, ey = e.y;
      if (box.x < ex+ts && box.x+box.w > ex && box.y < ey+ts && box.y+box.h > ey) {
        e.hp -= damage;
        e.hurtTimer = 0.3;
        hitAny = true;
        if (e.hp <= 0) {
          e.dead = true;
          flags.killCount++;
          if (typeof Inventory !== 'undefined') Inventory.addItem('pollen', e.pollen || 1);
          if (typeof Collection !== 'undefined') Collection.onEnemyKill(e.id);
        }
      }
    }
    return hitAny;
  }

  function needleBlast(damage, flags) {
    for (const e of _enemies) {
      if (e.dead) continue;
      e.hp -= damage;
      e.hurtTimer = 0.5;
      if (e.hp <= 0) {
        e.dead = true;
        flags.killCount++;
        if (typeof Inventory !== 'undefined') Inventory.addItem('pollen', e.pollen || 1);
        if (typeof Collection !== 'undefined') Collection.onEnemyKill(e.id);
      }
    }
    flags.needleUseCount++;
  }

  function draw(ctx) {
    const ts = CONFIG.TILE_SIZE;
    for (const e of _enemies) {
      if (e.dead) continue;
      const x = Math.round(e.x), y = Math.round(e.y);
      if (e.hurtTimer > 0 && Math.floor(Date.now()/60)%2) continue;
      const sprite = _getEnemySprite(e.id, e.color, e.symbol);
      if (sprite) ctx.drawImage(sprite, x, y);
      if (e.hp < e.maxHp) {
        const bw = ts-4, bh = 3;
        ctx.fillStyle = '#333'; ctx.fillRect(x+2, y-4, bw, bh);
        ctx.fillStyle = '#e74c3c'; ctx.fillRect(x+2, y-4, bw * (e.hp/e.maxHp), bh);
      }
    }
  }

  function getAliveCount() { return _enemies.filter(e => !e.dead).length; }
  function clear() { _enemies = []; }

  function _getEnemySprite(id, color, symbol) {
    if (_spriteCache.has(id)) return _spriteCache.get(id);
    const ts = CONFIG.TILE_SIZE;
    const canvas = document.createElement('canvas');
    canvas.width = ts;
    canvas.height = ts;
    const c = canvas.getContext('2d');
    c.fillStyle = color;
    c.beginPath(); c.arc(ts/2, ts/2, ts/2-3, 0, Math.PI*2); c.fill();
    c.strokeStyle = '#000'; c.lineWidth = 1;
    c.beginPath(); c.arc(ts/2, ts/2, ts/2-3, 0, Math.PI*2); c.stroke();
    c.font = '16px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(symbol, ts/2, ts/2);
    _spriteCache.set(id, canvas);
    return canvas;
  }

  return { spawn, spawnFromMap, update, checkAttackHit, needleBlast, draw, getAliveCount, clear };
})();
