/**
 * battle.js - プレイヤー操作・移動・攻撃・敵管理
 * ミプリンの冒険 v0.6.0
 */
const PlayerController = (() => {
  const ts = CONFIG.TILE_SIZE;
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

  let _dashCooldown = 0;
  const DASH_COOLDOWN = 0.8;
  const DASH_DISTANCE_TILES = 3;
  const DASH_DURATION = 0.12;
  let _dashing = false;
  let _dashTimer = 0;
  let _dashDirX = 0;
  let _dashDirY = 0;
  let _elapsedTime = 0;

  function _clampPlayerToMap(player) {
    const map = MapManager.getCurrentMap ? MapManager.getCurrentMap() : null;
    if (!map) return;
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
    _elapsedTime += dt;
    if (player.hitStopFrames > 0) { player.hitStopFrames--; return; }

    /* ノックバック処理 */
    if (player.knockback.timer > 0) {
      player.x += player.knockback.x * dt * 60;
      player.y += player.knockback.y * dt * 60;
      _clampPlayerToMap(player);
      player.knockback.timer -= dt;
      return;
    }

    if (_dashCooldown > 0) _dashCooldown -= dt;
    if (Engine.consumePress('dash') && _dashCooldown <= 0 && !_dashing) {
      _dashing = true;
      _dashTimer = DASH_DURATION;
      _dashDirX = player.dir === 'left' ? -1 : player.dir === 'right' ? 1 : 0;
      _dashDirY = player.dir === 'up' ? -1 : player.dir === 'down' ? 1 : 0;
      const skBonus = (typeof Skills !== 'undefined') ? Skills.getBonus() : {};
      _dashCooldown = Math.max(0.2, DASH_COOLDOWN + (skBonus.dashCD || 0));
      player.invincibleTimer = DASH_DURATION + 0.05;
      Audio.playSe('dash');
      if (typeof Particles !== 'undefined') {
        Particles.emit(player.x + ts / 2, player.y + ts / 2, 6, '#F5A623', {
          speedMin: 20, speedMax: 50, lifeMin: 0.2, lifeMax: 0.4, sizeMin: 2, sizeMax: 4
        });
      }
    }

    const moveWithCollision = (dx, dy, speed) => {
      if (dx === 0 && dy === 0) return;

      const margin = 4;
      const newPx = player.x + dx * speed;
      const newPy = player.y + dy * speed;

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
    };

    if (_dashing) {
      const dashSpeed = DASH_DISTANCE_TILES * CONFIG.TILE_SIZE / DASH_DURATION;
      moveWithCollision(_dashDirX, _dashDirY, dashSpeed * dt);
      _dashTimer -= dt;
      if (_dashTimer <= 0) _dashing = false;
      _clampPlayerToMap(player);
      if (player.attackCooldown > 0) player.attackCooldown -= dt;
      if (player.needleCooldown > 0) player.needleCooldown -= dt;
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

      const spd = player.speed * dt * 60;
      moveWithCollision(dx, dy, spd);
    }

    _clampPlayerToMap(player);

    /* クールダウン（秒ベース） */
    if (player.attackCooldown > 0) player.attackCooldown -= dt;
    if (player.needleCooldown > 0) player.needleCooldown -= dt;
  }

  function checkInteract(player) {

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

    const c = Math.floor((player.x + ts/2) / ts), r = Math.floor((player.y + ts/2) / ts);
    const exit = MapManager.getExitAt(c, r);
    if (exit) return exit;
    const tile = MapManager.getTile(c, r);
    if (tile === MapManager.TILE.EXIT) return { type: 'random_exit', x: c, y: r };
    return null;
  }

  /* ── 攻撃判定（範囲取得） ── */
  function getAttackBox(player) {

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

    const x = Math.round(player.x), y = Math.round(player.y);
    const px = x + ts / 2, py = y + ts / 2;

    /* 影 */
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(x + ts / 2, y + ts - 2, ts / 3, ts / 6, 0, 0, Math.PI * 2);
    ctx.fill();

    if (typeof SpriteVariant !== 'undefined') {
      SpriteVariant.drawPlayerGlow(ctx, px, py, _elapsedTime);
    }

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
  const ts = CONFIG.TILE_SIZE;
  let _enemies = [];
  const _spriteCache = new Map();
  let _elapsedTime = 0;

  const TEMPLATES = Balance.ENEMIES;

  function _allocEnemy() {
    const slot = _enemies.find(e => e.dead);
    if (slot) return slot;
    const e = { dead: true };
    _enemies.push(e);
    return e;
  }

  function spawn(templateId, col, row, isElite) {
    const t = TEMPLATES[templateId];
    if (!t) { console.warn('Unknown enemy:', templateId); return; }

    const e = _allocEnemy();
    e.id = templateId;
    e.name = t.name;
    e.x = col * ts;
    e.y = row * ts;
    e.hp = t.hp;
    e.maxHp = t.hp;
    e.atk = t.atk;
    e.speed = t.speed;
    e.color = t.color;
    e.symbol = t.symbol;
    e.xp = t.xp;
    e.pollen = t.pollen || 1;
    e.movePattern = t.pattern || t.movePattern || 'wander';
    e.moveTimer = Math.random() * 2;
    e.moveDir = { x: 0, y: 0 };
    e.hurtTimer = 0;
    e.dead = false;
    e.hidden = false;
    e.isElite = !!isElite;
    if (e.isElite) {
      e.hp = Math.ceil(e.hp * 2);
      e.maxHp = e.hp;
      e.atk = Math.ceil(e.atk * 1.5);
    }
    e.state = '';
    e.stateTimer = 0;
    e.patternTimer = Math.random() * 2;
    e.baseX = e.x;
    e.baseY = e.y;
    e.diveTimer = 1.5;
    e.emergeHitDone = false;
    e._flashTimer = 0;
    e._telegraphTimer = 0;
  }

  function spawnFromMap(mapEnemies) {
    for (const e of _enemies) e.dead = true;
    if (!mapEnemies) return;
    for (const e of mapEnemies) { spawn(e.type, e.x, e.y, e.isElite); }
  }

  function _tryMove(e, dx, dy, speed) {
    if (dx === 0 && dy === 0) return false;

    const margin = 4;
    const nx = e.x + dx * speed;
    const ny = e.y + dy * speed;
    const cL = Math.floor((nx + margin) / ts), cR = Math.floor((nx + ts - margin - 1) / ts);
    const rT = Math.floor((ny + margin) / ts), rB = Math.floor((ny + ts - margin - 1) / ts);
    if (!MapManager.isSolid(cL,rT)&&!MapManager.isSolid(cR,rT)&&!MapManager.isSolid(cL,rB)&&!MapManager.isSolid(cR,rB)) {
      e.x = nx; e.y = ny;
      return true;
    }
    return false;
  }

  function update(dt, player) {
    _elapsedTime += dt;

    for (const e of _enemies) {
      if (e.dead) continue;
      if (e._flashTimer > 0) e._flashTimer -= dt;
      if (e._telegraphTimer > 0) e._telegraphTimer -= dt;
      if (e.hurtTimer > 0) { e.hurtTimer -= dt; continue; }

      const dx = player.x - e.x, dy = player.y - e.y;
      const dist = Math.sqrt(dx*dx + dy*dy) || 1;
      const baseSpeed = e.speed * dt * 60;

      switch (e.movePattern) {
        case 'ambush': {
          if (!e.state) { e.state = 'wait'; }
          if (e.state === 'wait') {
            e.moveDir.x = 0; e.moveDir.y = 0;
            if (dist <= ts * 3) {
              e.state = 'charge';
              e.stateTimer = 0.35;
              e._telegraphTimer = 0.4;
              e.moveDir.x = dx / dist;
              e.moveDir.y = dy / dist;
            }
          } else if (e.state === 'charge') {
            _tryMove(e, e.moveDir.x, e.moveDir.y, baseSpeed * 3.2);
            e.stateTimer -= dt;
            if (e.stateTimer <= 0) { e.state = 'pause'; e.stateTimer = 1.0; }
          } else if (e.state === 'pause') {
            e.stateTimer -= dt;
            if (e.stateTimer <= 0) e.state = 'wait';
          }
          break;
        }
        case 'explode': {
          if (!e.state) e.state = 'approach';
          if (e.state === 'approach') {
            if (dist <= ts * 1.5) {
              e.state = 'explode_charge';
              e.stateTimer = 0.8;
              e._telegraphTimer = 0.6;
            } else {
              if (dist < ts * 6) { e.moveDir.x = dx / dist; e.moveDir.y = dy / dist; }
              _tryMove(e, e.moveDir.x, e.moveDir.y, baseSpeed * 1.1);
            }
          } else if (e.state === 'explode_charge') {
            e.stateTimer -= dt;
            if (e.stateTimer <= 0) {
              if (dist <= ts * 1.8) _damagePlayer(player, e);
              if (typeof Particles !== 'undefined') {
                Particles.emit(e.x + ts / 2, e.y + ts / 2, 10, '#E74C3C', {
                  speedMin: 40, speedMax: 100, lifeMin: 0.3, lifeMax: 0.7, sizeMin: 3, sizeMax: 6
                });
              }
              e.dead = true;
            }
          }
          break;
        }
        case 'swoop': {
          if (!e.state) {
            e.state = 'cruise';
            e.moveDir.x = Math.random() < 0.5 ? -1 : 1;
            e.moveDir.y = 0;
          }
          if (e.state === 'cruise') {
            const moved = _tryMove(e, e.moveDir.x, 0, baseSpeed * 1.4);
            if (!moved) e.moveDir.x *= -1;
            if (Math.abs(dx) <= ts * 0.5) {
              e.state = 'dive';
              e.stateTimer = 0.4;
              e._telegraphTimer = 0.4;
            }
          } else if (e.state === 'dive') {
            _tryMove(e, 0, 1, baseSpeed * 2.5);
            e.stateTimer -= dt;
            if (e.stateTimer <= 0) { e.state = 'pause'; e.stateTimer = 0.3; }
          } else if (e.state === 'pause') {
            e.stateTimer -= dt;
            if (e.stateTimer <= 0) { e.state = 'rise'; e.stateTimer = 0.4; }
          } else if (e.state === 'rise') {
            _tryMove(e, 0, -1, baseSpeed * 2.0);
            e.stateTimer -= dt;
            if (e.stateTimer <= 0) e.state = 'cruise';
          }
          break;
        }
        case 'burrow': {
          if (!e.state) { e.state = 'visible'; e.stateTimer = 3.0; e.hidden = false; }
          if (e.state === 'visible') {
            e.stateTimer -= dt;
            if (e.stateTimer <= 0) {
              e.state = 'hidden';
              e.stateTimer = 1.0;
              e.hidden = true;
            }
          } else if (e.state === 'hidden') {
            e.hidden = true;
            _tryMove(e, dx / dist, dy / dist, baseSpeed * 2.2);
            e.stateTimer -= dt;
            if (e.stateTimer <= 0) {
              e.state = 'emerge';
              e.stateTimer = 0.4;
              e._telegraphTimer = 0.4;
              e.hidden = false;
              e.emergeHitDone = false;
            }
          } else if (e.state === 'emerge') {
            if (!e.emergeHitDone && dist <= ts * 1.2) {
              e._telegraphTimer = 0.2;
              _damagePlayer(player, e);
              e.emergeHitDone = true;
            }
            e.stateTimer -= dt;
            if (e.stateTimer <= 0) { e.state = 'visible'; e.stateTimer = 3.0; }
          }
          break;
        }
        case 'root_attack': {
          if (!e.state) { e.state = 'root'; e.stateTimer = 2.0; }
          e.stateTimer -= dt;
          if (e.stateTimer <= 0) {
            e.stateTimer = 2.0;
            const alignedX = Math.abs(dx) <= ts * 0.5;
            const alignedY = Math.abs(dy) <= ts * 0.5;
            if ((alignedX || alignedY) && dist <= ts * 6) {
              e._telegraphTimer = 0.5;
              _damagePlayer(player, e);
            }
          }
          break;
        }
        case 'dive': {
          if (!e.state) { e.state = 'orbit'; e.diveTimer = 1.5; }
          if (e.state === 'orbit') {
            e.patternTimer += dt * 2;
            const ox = Math.sin(e.patternTimer) * ts * 1.2;
            const oy = Math.sin(e.patternTimer * 2) * ts * 0.8;
            const tx = e.baseX + ox;
            const ty = e.baseY + oy;
            const ddx = tx - e.x;
            const ddy = ty - e.y;
            const d = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
            _tryMove(e, ddx / d, ddy / d, baseSpeed * 1.2);
            e.diveTimer -= dt;
            if (e.diveTimer <= 0) {
              e.state = 'dive_dash';
              e.stateTimer = 0.35;
              e._telegraphTimer = 0.3;
              e.moveDir.x = dx / dist;
              e.moveDir.y = dy / dist;
            }
          } else if (e.state === 'dive_dash') {
            const moved = _tryMove(e, e.moveDir.x, e.moveDir.y, baseSpeed * 4.5);
            if (!moved) {
              e.state = 'dive_stun';
              e.stateTimer = 0.6;
            } else {
              e.stateTimer -= dt;
              if (e.stateTimer <= 0) { e.state = 'orbit'; e.diveTimer = 1.5; }
            }
          } else if (e.state === 'dive_stun') {
            e.stateTimer -= dt;
            if (e.stateTimer <= 0) { e.state = 'orbit'; e.diveTimer = 1.5; }
          }
          break;
        }
        case 'chase': {
          if (dist < ts * 6) { e.moveDir.x = dx / dist; e.moveDir.y = dy / dist; }
          else { e.moveDir.x = (Math.random()-0.5)*2; e.moveDir.y = (Math.random()-0.5)*2; }
          _tryMove(e, e.moveDir.x, e.moveDir.y, baseSpeed);
          break;
        }
        case 'stationary':
          e.moveDir.x = 0; e.moveDir.y = 0;
          break;
        case 'wander':
        default: {
          e.moveTimer -= dt;
          if (e.moveTimer <= 0) {
            e.moveTimer = 1 + Math.random();
            e.moveDir.x = (Math.random()-0.5) * 2;
            e.moveDir.y = (Math.random()-0.5) * 2;
          }
          _tryMove(e, e.moveDir.x, e.moveDir.y, baseSpeed);
          break;
        }
      }

      if (!e.hidden && dist < ts * 0.7) {
        e._telegraphTimer = 0.2;
        _damagePlayer(player, e);
      }
    }
  }

  function _damagePlayer(player, enemy) {
    if (player.knockback.timer > 0 || player.invincibleTimer > 0) return;
    const skBonus = (typeof Skills !== 'undefined') ? Skills.getBonus() : {};
    const def = skBonus.def || 0;
    const invReduction = (typeof Inventory !== 'undefined') ? Inventory.getDefReduction(player) : 0;
    const rawDmg = enemy.atk;
    const finalDmg = Math.max(1, rawDmg - def - invReduction);
    player.hp -= finalDmg;
    if (player.hp < 0) player.hp = 0;
    const invulnBonus = skBonus.invuln || 0;
    player.invincibleTimer = 1.0 + invulnBonus;
    if (typeof GameFeel !== 'undefined') GameFeel.onPlayerDamaged();
    if (typeof DamageNumbers !== 'undefined') {
      DamageNumbers.spawn(player.x + ts / 2, player.y - 20, finalDmg, 'normal');
    }
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
    const killed = [];
    const skBonus = (typeof Skills !== 'undefined') ? Skills.getBonus() : {};
    const critRate = skBonus.critRate || 0;
    const critDmg = 1.5 + (skBonus.critDmg || 0);
    for (const e of _enemies) {
      if (e.dead || e.hidden || e.hurtTimer > 0) continue;

      const ex = e.x, ey = e.y;
      if (box.x < ex+ts && box.x+box.w > ex && box.y < ey+ts && box.y+box.h > ey) {
        const isCrit = Math.random() < (critRate || 0);
        const finalDmg = isCrit ? Math.floor(damage * critDmg) : damage;
        e.hp -= finalDmg;
        e.hurtTimer = 0.3;
        e._flashTimer = 0.1;
        hitAny = true;
        if (isCrit) {
          if (typeof GameFeel !== 'undefined') GameFeel.onCriticalHit();
          if (typeof DamageNumbers !== 'undefined') {
            DamageNumbers.spawn(e.x + ts / 2, e.y - 20, finalDmg, 'critical');
          }
        } else {
          if (typeof GameFeel !== 'undefined') GameFeel.onNormalHit();
          if (typeof DamageNumbers !== 'undefined') {
            DamageNumbers.spawn(e.x + ts / 2, e.y - 20, finalDmg, 'normal');
          }
        }
        if (e.hp <= 0) {
          e.dead = true;
          if (typeof GameFeel !== 'undefined') GameFeel.onEnemyDefeated();
          flags.killCount++;
          if (typeof Collection !== 'undefined') Collection.onEnemyKill(e.id);
          killed.push({ id: e.id, x: e.x, y: e.y, exp: e.xp, pollen: e.pollen || 1 });
          if (typeof Loot !== 'undefined' && typeof Game !== 'undefined') {
            const aLv = Scaling.areaLevel(Game.getPlayerLevel(), MapManager.getCurrentMapName());
            const drops = Loot.rollDrop(e.id, aLv, e.isElite || false, false);
            Loot.spawnOnGround(e.x + ts / 2, e.y + ts / 2, drops);
          }
          if (typeof Particles !== 'undefined') {
            Particles.emit(e.x + ts / 2, e.y + ts / 2, 8, e.color, {
              speedMin: 40, speedMax: 100, lifeMin: 0.3, lifeMax: 0.7, sizeMin: 3, sizeMax: 6
            });
          }
        }
      }
    }
    return { hitAny, killed };
  }

  function needleBlast(originX, originY, damage, flags) {
    if (damage === undefined || damage === null) damage = Balance.PLAYER.NEEDLE_DMG;
    const skBonus = (typeof Skills !== 'undefined') ? Skills.getBonus() : {};
    const critRate = skBonus.critRate || 0;
    const critDmg = 1.5 + (skBonus.critDmg || 0);
    for (const e of _enemies) {
      if (e.dead || e.hidden) continue;
      const isCrit = Math.random() < (critRate || 0);
      const finalDmg = isCrit ? Math.floor(damage * critDmg) : damage;
      e.hp -= finalDmg;
      e.hurtTimer = 0.5;
      e._flashTimer = 0.1;
      if (typeof GameFeel !== 'undefined') GameFeel.onNeedleBlast();
      if (typeof DamageNumbers !== 'undefined') {
        DamageNumbers.spawn(e.x + ts / 2, e.y - 20, finalDmg, isCrit ? 'critical' : 'normal');
      }
      if (e.hp <= 0) {
        e.dead = true;
        if (typeof GameFeel !== 'undefined') GameFeel.onEnemyDefeated();
        flags.killCount++;
        if (typeof Collection !== 'undefined') Collection.onEnemyKill(e.id);
        if (typeof Loot !== 'undefined' && typeof Game !== 'undefined') {
          const aLv = Scaling.areaLevel(Game.getPlayerLevel(), MapManager.getCurrentMapName());
          const drops = Loot.rollDrop(e.id, aLv, e.isElite || false, false);
          Loot.spawnOnGround(e.x + ts / 2, e.y + ts / 2, drops);
        }
        if (typeof Particles !== 'undefined') {

          Particles.emit(e.x + ts / 2, e.y + ts / 2, 8, e.color, {
            speedMin: 40, speedMax: 100, lifeMin: 0.3, lifeMax: 0.7, sizeMin: 3, sizeMax: 6
          });
        }
      }
    }
  }

  function draw(ctx) {

    for (const e of _enemies) {
      if (e.dead || e.hidden) continue;
      const x = Math.round(e.x), y = Math.round(e.y);
      if (e.hurtTimer > 0 && Math.floor(Date.now()/60)%2) continue;

      if (e._telegraphTimer > 0 && Math.floor(Date.now() / 80) % 2) {
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = '#ff3333';
        ctx.beginPath();
        ctx.arc(x + ts / 2, y + ts / 2, ts * 0.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (e.state === 'explode_charge' && Math.floor(Date.now() / 80) % 2) {
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.arc(x + ts / 2, y + ts / 2, ts / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (typeof SpriteVariant !== 'undefined') {
        const colors = SpriteVariant.getEnemyColors(
          e.id,
          (typeof MapManager !== 'undefined' && MapManager.getCurrentMapName) ? MapManager.getCurrentMapName() : 'forest_south',
          e.isElite || false
        );
        const ex = x + ts / 2;
        const ey = y + ts / 2;
        if (e.isElite && colors.glow) {
          SpriteVariant.drawEliteGlow(ctx, ex, ey, e.size || ts, colors.glow, _elapsedTime);
        }
        SpriteVariant.drawEnemyBody(ctx, ex, ey, e.size || ts * 0.8, colors, e.symbol || '?', e.id);
      } else {
        const sprite = _getEnemySprite(e.id, e.color, e.symbol);
        if (sprite) ctx.drawImage(sprite, x, y);
      }

      if (e._flashTimer > 0) {
        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x + ts / 2, y + ts / 2, ts * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (e.hp < e.maxHp) {
        const bw = ts-4, bh = 3;
        ctx.fillStyle = '#333'; ctx.fillRect(x+2, y-4, bw, bh);
        ctx.fillStyle = '#e74c3c'; ctx.fillRect(x+2, y-4, bw * (e.hp/e.maxHp), bh);
      }
    }
  }

  function getAliveCount() { return _enemies.filter(e => !e.dead).length; }
  function clear() { for (const e of _enemies) e.dead = true; }

  function _getEnemySprite(id, color, symbol) {
    if (_spriteCache.has(id)) return _spriteCache.get(id);

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
