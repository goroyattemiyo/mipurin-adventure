const GameFeel = (() => {
  let _hitStopFrames = 0;
  let _shakeTimer = 0;
  let _shakeIntensity = 0;
  let _flashTimer = 0;
  let _flashColor = '#fff';

  function hitStop(frames) {
    _hitStopFrames = Math.max(_hitStopFrames, frames || 4);
  }

  function shake(intensity, durationMs) {
    _shakeIntensity = Math.max(_shakeIntensity, intensity || 3);
    _shakeTimer = Math.max(_shakeTimer, durationMs || 100);
  }

  function flash(color, durationMs) {
    _flashColor = color || '#fff';
    _flashTimer = durationMs || 80;
  }

  function isHitStopped() {
    return _hitStopFrames > 0;
  }

  function update(dt) {
    if (_hitStopFrames > 0) _hitStopFrames--;
    if (_shakeTimer > 0) _shakeTimer -= dt * 1000;
    if (_flashTimer > 0) _flashTimer -= dt * 1000;
  }

  function applyShake(ctx) {
    if (_shakeTimer > 0 && _shakeIntensity > 0) {
      const dx = (Math.random() - 0.5) * _shakeIntensity * 2;
      const dy = (Math.random() - 0.5) * _shakeIntensity * 2;
      ctx.translate(dx, dy);
      return true;
    }
    return false;
  }

  function drawFlash(ctx, w, h) {
    if (_flashTimer > 0) {
      const alpha = Math.min(0.3, _flashTimer / 200);
      let color = _flashColor;
      if (color.startsWith('rgb(')) {
        color = color.replace(')', `,${alpha})`).replace('rgb', 'rgba');
      } else if (color.startsWith('rgba(')) {
        color = color.replace(/rgba\(([^)]+)\)/, (m) => m.replace(/\d?\.?\d+\s*\)$/, `${alpha})`));
      }
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, w, h);
    }
  }

  function onNormalHit() { hitStop(3); shake(3, 100); }
  function onCriticalHit() { hitStop(6); shake(6, 150); flash('rgba(255,255,0)', 100); }
  function onNeedleBlast() { hitStop(4); shake(8, 200); flash('rgba(0,255,100)', 120); }
  function onPlayerDamaged() { shake(5, 150); flash('rgba(255,0,0)', 150); }
  function onBossDamaged() { shake(10, 250); flash('rgba(255,0,0)', 200); }
  function onBossDefeated() { hitStop(10); shake(15, 500); }
  function onEnemyDefeated() { shake(2, 80); }

  return {
    hitStop, shake, flash, isHitStopped, update, applyShake, drawFlash,
    onNormalHit, onCriticalHit, onNeedleBlast,
    onPlayerDamaged, onBossDamaged, onBossDefeated, onEnemyDefeated
  };
})();
