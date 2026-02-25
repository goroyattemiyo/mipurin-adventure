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

  return { emit, update, draw, clear };
})();

// ダメージ数字ポップアップ
const DamageNumbers = (() => {
  const _nums = [];

  function spawn(x, y, value, isCritical) {
    _nums.push({
      x,
      y: y - 10,
      value: Math.floor(value),
      vy: -60,
      life: 0.8,
      maxLife: 0.8,
      critical: !!isCritical,
      alive: true
    });
  }

  function update(dt) {
    for (const n of _nums) {
      if (!n.alive) continue;
      n.y += n.vy * dt;
      n.vy += 40 * dt; // 減速して浮く→落ちる
      n.life -= dt;
      if (n.life <= 0) n.alive = false;
    }
    // cleanup every 60 frames
    if (Math.random() < 0.02) {
      const alive = _nums.filter(n => n.alive);
      _nums.length = 0;
      _nums.push(...alive);
    }
  }

  function draw(ctx) {
    for (const n of _nums) {
      if (!n.alive) continue;
      const alpha = Math.max(0, n.life / n.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      const size = n.critical ? CONFIG.FONT_LG : CONFIG.FONT_BASE;
      ctx.font = `bold ${size}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      // 影
      ctx.fillStyle = '#000';
      ctx.fillText(n.value, n.x + 2, n.y + 2);
      // 本体
      ctx.fillStyle = n.critical ? '#FFD700' : '#FFFFFF';
      ctx.fillText(n.value, n.x, n.y);
      ctx.restore();
    }
  }

  return { spawn, update, draw };
})();
