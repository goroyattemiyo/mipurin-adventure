/**
 * particles.js - パーティクル/ダメージ数字
 * ミプリンの冒険
 */
const Particles = (() => {
  const _pool = []; // オブジェクトプール（最大200）
  const MAX = 200;

  function emit(x, y, count, color, opts) {
    // opts: { speedMin, speedMax, lifeMin, lifeMax, sizeMin, sizeMax, gravity }
    for (let i = 0; i < count; i++) {
      let p = _pool.find(p => !p.alive);
      if (!p) {
        if (_pool.length >= MAX) continue;
        p = {};
        _pool.push(p);
      }
      const angle = Math.random() * Math.PI * 2;
      const speed = (opts.speedMin || 30) + Math.random() * ((opts.speedMax || 80) - (opts.speedMin || 30));
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.life = (opts.lifeMin || 0.3) + Math.random() * ((opts.lifeMax || 0.6) - (opts.lifeMin || 0.3));
      p.maxLife = p.life;
      p.size = (opts.sizeMin || 2) + Math.random() * ((opts.sizeMax || 5) - (opts.sizeMin || 2));
      p.color = color;
      p.gravity = opts.gravity || 0;
      p.alive = true;
    }
  }

  function update(dt) {
    for (const p of _pool) {
      if (!p.alive) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += p.gravity * dt;
      p.life -= dt;
      if (p.life <= 0) p.alive = false;
    }
  }

  function draw(ctx) {
    for (const p of _pool) {
      if (!p.alive) continue;
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  function clear() {
    for (const p of _pool) p.alive = false;
  }

  function burstSlash(x, y) {
    emit(x, y, 6 + Math.floor(Math.random() * 3), '#ffffff', {
      speedMin: 40, speedMax: 120, lifeMin: 0.2, lifeMax: 0.4, sizeMin: 2, sizeMax: 4
    });
  }

  function burstSpark(x, y, color) {
    emit(x, y, 5 + Math.floor(Math.random() * 4), color || '#ffd700', {
      speedMin: 50, speedMax: 140, lifeMin: 0.25, lifeMax: 0.5, sizeMin: 2, sizeMax: 5
    });
  }

  function burstStar(x, y) {
    emit(x, y, 10 + Math.floor(Math.random() * 6), '#ffdd55', {
      speedMin: 60, speedMax: 180, lifeMin: 0.3, lifeMax: 0.6, sizeMin: 2, sizeMax: 6
    });
  }

  function burstDebris(x, y, color) {
    emit(x, y, 15 + Math.floor(Math.random() * 6), color || '#aaa', {
      speedMin: 30, speedMax: 110, lifeMin: 0.4, lifeMax: 0.7, sizeMin: 2, sizeMax: 6, gravity: 120
    });
  }

  function burstPetals(x, y, color) {
    emit(x, y, 20 + Math.floor(Math.random() * 11), color || '#ff9bd4', {
      speedMin: 10, speedMax: 60, lifeMin: 0.6, lifeMax: 1.0, sizeMin: 2, sizeMax: 4, gravity: 40
    });
  }

  function trailDash(x, y, alpha) {
    emit(x, y, 3, `rgba(255,255,255,${alpha || 0.5})`, {
      speedMin: 0, speedMax: 20, lifeMin: 0.1, lifeMax: 0.2, sizeMin: 4, sizeMax: 8
    });
  }

  return { emit, update, draw, clear, burstSlash, burstSpark, burstStar, burstDebris, burstPetals, trailDash };
})();
