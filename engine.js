/**
 * engine.js - ゲームループ・入力・描画
 */
const Engine = (() => {
  let _canvas, _ctx;
  let _lastTime = 0;
  let _accumulator = 0;
  let _running = false;

  // 入力状態
  const _keys = {};
  const _keyMap = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right',
    z: 'attack', Z: 'attack',
    x: 'needle', X: 'needle',
    c: 'interact', C: 'interact', Enter: 'interact',
    i: 'inventory', I: 'inventory',
    Escape: 'menu'
  };

  // シェイク
  let _shakeIntensity = 0;
  let _shakeDuration = 0;
  let _shakeEnabled = true;

  function init() {
    _canvas = document.getElementById('game-canvas');
    _ctx = _canvas.getContext('2d');
    _ctx.imageSmoothingEnabled = CONFIG.IMAGE_SMOOTHING;

    // キーボード
    window.addEventListener('keydown', (e) => {
      const action = _keyMap[e.key];
      if (action) {
        e.preventDefault();
        _keys[action] = true;
      }
    });
    window.addEventListener('keyup', (e) => {
      const action = _keyMap[e.key];
      if (action) _keys[action] = false;
    });

    // モバイルタッチ（後で拡張）
    _canvas.addEventListener('touchstart', _handleTouch, { passive: false });
    _canvas.addEventListener('touchmove', _handleTouch, { passive: false });
    _canvas.addEventListener('touchend', _handleTouchEnd, { passive: false });
  }

  function _handleTouch(e) {
    e.preventDefault();
    // M9で仮想D-pad実装
  }

  function _handleTouchEnd(e) {
    e.preventDefault();
  }

  function showCanvas() {
    document.getElementById('loading').style.display = 'none';
    _canvas.style.display = 'block';
  }

  function start(updateFn, drawFn) {
    _running = true;
    _lastTime = performance.now();

    function loop(now) {
      if (!_running) return;

      let delta = now - _lastTime;
      _lastTime = now;

      // 長すぎるdeltaをクランプ（タブ復帰時対策）
      if (delta > CONFIG.FRAME_DURATION * 10) {
        delta = CONFIG.FRAME_DURATION;
      }

      _accumulator += delta;
      let skipped = 0;

      while (_accumulator >= CONFIG.FRAME_DURATION && skipped < CONFIG.MAX_FRAME_SKIP) {
        updateFn(CONFIG.FRAME_DURATION / 1000);
        _accumulator -= CONFIG.FRAME_DURATION;
        skipped++;
      }

      // シェイク更新
      if (_shakeDuration > 0) _shakeDuration--;

      // 描画
      _ctx.save();
      if (_shakeDuration > 0 && _shakeEnabled) {
        const sx = (Math.random() - 0.5) * _shakeIntensity * 2;
        const sy = (Math.random() - 0.5) * _shakeIntensity * 2;
        _ctx.translate(sx, sy);
      }
      drawFn(_ctx);
      _ctx.restore();

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  }

  function stop() {
    _running = false;
  }

  function isPressed(action) {
    return !!_keys[action];
  }

  function consumePress(action) {
    if (_keys[action]) {
      _keys[action] = false;
      return true;
    }
    return false;
  }

  function triggerShake(intensity, durationFrames) {
    _shakeIntensity = intensity;
    _shakeDuration = durationFrames;
  }

  function setShakeEnabled(enabled) {
    _shakeEnabled = enabled;
  }

  function getCtx() { return _ctx; }
  function getCanvas() { return _canvas; }

  return {
    init, showCanvas, start, stop,
    isPressed, consumePress,
    triggerShake, setShakeEnabled,
    getCtx, getCanvas
  };
})();
