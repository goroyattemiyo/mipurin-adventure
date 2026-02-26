const DamageNumbers = (() => {
  const _numbers = [];
  const POOL_MAX = 50;
  const LIFETIME = 0.8; // 秒

  function spawn(x, y, value, type) {
    if (_numbers.length >= POOL_MAX) _numbers.shift();
    _numbers.push({
      x, y, value,
      type: type || 'normal',
      age: 0,
      vy: -120,
      vx: (Math.random() - 0.5) * 40
    });
  }

  function update(dt) {
    for (let i = _numbers.length - 1; i >= 0; i--) {
      const n = _numbers[i];
      n.age += dt;
      n.x += n.vx * dt;
      n.y += n.vy * dt;
      n.vy += 200 * dt;
      if (n.age >= LIFETIME) _numbers.splice(i, 1);
    }
  }

  function draw(ctx) {
    for (const n of _numbers) {
      const alpha = Math.max(0, 1 - n.age / LIFETIME);
      const isCrit = n.type === 'critical';
      const isHeal = n.type === 'heal';
      const isPoison = n.type === 'poison';

      const size = isCrit ? CONFIG.FONT_LG : CONFIG.FONT_BASE;
      let color;
      if (isCrit) color = `rgba(255,255,0,${alpha})`;
      else if (isHeal) color = `rgba(0,255,100,${alpha})`;
      else if (isPoison) color = `rgba(180,0,255,${alpha})`;
      else color = `rgba(255,255,255,${alpha})`;

      let drawY = n.y;
      if (isCrit && n.age < 0.15) {
        drawY -= Math.sin(n.age / 0.15 * Math.PI) * 10;
      }

      ctx.save();
      ctx.font = `bold ${size}px monospace`;
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.strokeStyle = `rgba(0,0,0,${alpha})`;
      ctx.lineWidth = 3;
      const text = isHeal ? `+${n.value}` : `${n.value}`;
      ctx.strokeText(text, n.x, drawY);
      ctx.fillText(text, n.x, drawY);
      ctx.restore();
    }
  }

  function clear() { _numbers.length = 0; }

  return { spawn, update, draw, clear };
})();
