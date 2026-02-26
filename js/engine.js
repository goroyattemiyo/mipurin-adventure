/**
 * engine.js - ゲームループ・入力・描画
 * ミプリンの冒険 v0.2.0
 */
const Engine = (() => {
  let _canvas, _ctx;
  let _lastTime = 0;
  let _accumulator = 0;
  let _running = false;

  // 入力状態
  const _keys = {};
  let _clicked = false;   // クリック／タップの1フレーム検出用
  let _touchDirX = 0;
  let _touchDirY = 0;
  let _dpadCenter = null;
  let _dpadActive = false;

  const _keyMap = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right',
    z: 'attack', Z: 'attack',
    x: 'dash', X: 'dash',
    c: 'needle', C: 'needle', Enter: 'interact',
    i: 'inventory', I: 'inventory',
    e: 'equipment', E: 'equipment', KeyE: 'equipment',
    KeyS: 'skill',
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

    _resizeCanvas();
    window.addEventListener('resize', _resizeCanvas);

    // ── キーボード ──
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;  
      const action = _keyMap[e.code] || _keyMap[e.key];
      if (action) {
        e.preventDefault();
        _keys[action] = true;
      }
    });
    window.addEventListener('keyup', (e) => {
      const action = _keyMap[e.code] || _keyMap[e.key];
      if (action) _keys[action] = false;
    });

    // ── マウスクリック ──
    _canvas.addEventListener('click', () => {
      _clicked = true;
    });

    // ── モバイルタッチ ──
    _canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      _keys.up = false;
      _keys.down = false;
      _keys.left = false;
      _keys.right = false;
      _clicked = true;
      const stick = document.getElementById('dpad-stick');
      if (stick) stick.style.transform = 'translate(0, 0)';
    }, { passive: false });

    const dpadArea = document.getElementById('dpad-area');
    if (dpadArea) {
      dpadArea.addEventListener('touchstart', _handleTouch, { passive: false });
      dpadArea.addEventListener('touchmove', _handleTouch, { passive: false });
      dpadArea.addEventListener('touchend', (e) => {
        e.preventDefault();
        _keys.up = false; _keys.down = false; _keys.left = false; _keys.right = false;
        const stick = document.getElementById('dpad-stick');
        if (stick) stick.style.transform = 'translate(0, 0)';
      }, { passive: false });
    }

    const btnA = document.getElementById('btn-a');
    if (btnA) {
      btnA.addEventListener('touchstart', (e) => { e.preventDefault(); _keys.attack = true; }, { passive: false });
      btnA.addEventListener('touchend', (e) => { e.preventDefault(); _keys.attack = false; }, { passive: false });
    }

    const btnB = document.getElementById('btn-b');
    if (btnB) {
      btnB.addEventListener('touchstart', (e) => { e.preventDefault(); _keys.dash = true; }, { passive: false });
      btnB.addEventListener('touchend', (e) => { e.preventDefault(); _keys.dash = false; }, { passive: false });
    }

    const btnC = document.getElementById('btn-c');
    if (btnC) {
      const press = (e) => { e.preventDefault(); _keys.needle = true; };
      const release = (e) => { e.preventDefault(); _keys.needle = false; };
      btnC.addEventListener('touchstart', press, { passive: false });
      btnC.addEventListener('touchend', release, { passive: false });
      btnC.addEventListener('mousedown', press);
      window.addEventListener('mouseup', release);
    }

    const btnMenu = document.getElementById('btn-menu');
    if (btnMenu) {
      btnMenu.addEventListener('touchstart', (e) => { e.preventDefault(); _keys.menu = true; }, { passive: false });
      btnMenu.addEventListener('touchend', (e) => { e.preventDefault(); _keys.menu = false; }, { passive: false });
    }
  }

  function _handleTouch(e) {
    e.preventDefault();
    if (e.touches.length === 0) return;

    const dpadArea = document.getElementById('dpad-area');
    if (!dpadArea) return;
    const rect = dpadArea.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    _dpadCenter = { x: cx, y: cy };

    const touch = e.touches[0];
    if (touch.clientX < rect.left || touch.clientX > rect.right || touch.clientY < rect.top || touch.clientY > rect.bottom) {
      return;
    }

    const dx = touch.clientX - cx;
    const dy = touch.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const deadzone = rect.width * 0.15;

    _touchDirX = dx;
    _touchDirY = dy;
    _dpadActive = true;

    // リセット
    _keys.up = false;
    _keys.down = false;
    _keys.left = false;
    _keys.right = false;

    const stick = document.getElementById('dpad-stick');
    if (dist > deadzone) {
      const angle = Math.atan2(dy, dx);
      if (angle > -Math.PI * 0.625 && angle < -Math.PI * 0.375) _keys.up = true;
      else if (angle > Math.PI * 0.375 && angle < Math.PI * 0.625) _keys.down = true;
      else if (angle > Math.PI * 0.75 || angle < -Math.PI * 0.75) _keys.left = true;
      else if (angle > -Math.PI * 0.25 && angle < Math.PI * 0.25) _keys.right = true;
      else if (angle >= -Math.PI * 0.375 && angle <= -Math.PI * 0.25) { _keys.up = true; _keys.right = true; }
      else if (angle >= -Math.PI * 0.75 && angle <= -Math.PI * 0.625) { _keys.up = true; _keys.left = true; }
      else if (angle >= Math.PI * 0.25 && angle <= Math.PI * 0.375) { _keys.down = true; _keys.right = true; }
      else if (angle >= Math.PI * 0.625 && angle <= Math.PI * 0.75) { _keys.down = true; _keys.left = true; }

      if (stick) {
        const maxDist = rect.width * 0.35;
        const clampDist = Math.min(dist, maxDist);
        const sx = (dx / dist) * clampDist;
        const sy = (dy / dist) * clampDist;
        stick.style.transform = `translate(${sx}px, ${sy}px)`;
      }
    } else {
      if (stick) stick.style.transform = 'translate(0, 0)';
    }
  }

  function _resizeCanvas() {
    const wrapper = document.getElementById('game-wrapper');
    if (!wrapper || !_canvas) return;
    const ww = window.innerWidth;
    const wh = window.innerHeight;
    const aspect = CONFIG.CANVAS_WIDTH / CONFIG.CANVAS_HEIGHT;
    let w, h;
    if (ww / wh > aspect) {
      h = wh;
      w = h * aspect;
    } else {
      w = ww;
      h = w / aspect;
    }
    _canvas.style.width = Math.floor(w) + 'px';
    _canvas.style.height = Math.floor(h) + 'px';
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
        const dt = CONFIG.FRAME_DURATION / 1000;
        if (typeof GameFeel !== 'undefined') GameFeel.update(dt);
        const hitStopped = (typeof GameFeel !== 'undefined' && GameFeel.isHitStopped && GameFeel.isHitStopped());
        if (!hitStopped) {
          updateFn(dt);
        }
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

      // クリックフラグはフレーム末尾でリセット
      _clicked = false;

      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  }

  function stop() {
    _running = false;
  }

  /**
   * キーが押されているか（押しっぱなし検出）
   */
  function isPressed(action) {
    return !!_keys[action];
  }

  /**
   * キーを消費（1回だけ検出、すぐfalseにする）
   */
  function consumePress(action) {
    if (_keys[action]) {
      _keys[action] = false;
      return true;
    }
    return false;
  }

  /**
   * クリック／タップを消費（1回だけ検出）
   */
  function consumeClick() {
    if (_clicked) {
      _clicked = false;
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
    isPressed, consumePress, consumeClick,
    triggerShake, setShakeEnabled,
    getCtx, getCanvas
  };
})();
