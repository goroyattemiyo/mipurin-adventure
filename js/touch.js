// === TOUCH INPUT MODULE (Sprint F) ===
// Mobile virtual joystick + action buttons
// Injects into existing keys[]/pressed[] system

// --- Mobile detection ---
let touchActive = false;

// --- Canvas coordinate conversion ---
function screenToCanvas(tx, ty) {
  const rect = cvs.getBoundingClientRect();
  return {
    x: (tx - rect.left) / rect.width * CW,
    y: (ty - rect.top) / rect.height * CH
  };
}

// --- Joystick ---
const joystick = {
  active: false,
  cx: 170, cy: CH - 190,
  radius: 70,
  knobRadius: 30,
  deadzone: 0.15,
  dx: 0, dy: 0,
  touchId: null
};

// --- Buttons ---
const TOUCH_BUTTONS = [
  { id: 'KeyZ',   label: 'Z',  baseX: 0.906, baseY: 0.833, r: 42, color: '#ffd700', alwaysShow: true,  pressed: false, touchId: null },
  { id: 'KeyX',   label: 'X',  baseX: 0.836, baseY: 0.875, r: 35, color: '#87ceeb', alwaysShow: true,  pressed: false, touchId: null },
  { id: 'Digit1', label: '1',  baseX: 0.781, baseY: 0.938, r: 25, color: '#2ecc71', alwaysShow: true,  pressed: false, touchId: null },
  { id: 'Digit2', label: '2',  baseX: 0.844, baseY: 0.938, r: 25, color: '#2ecc71', alwaysShow: true,  pressed: false, touchId: null },
  { id: 'Digit3', label: '3',  baseX: 0.906, baseY: 0.938, r: 25, color: '#2ecc71', alwaysShow: true,  pressed: false, touchId: null },
  { id: 'KeyQ',   label: 'Q',  baseX: 0.766, baseY: 0.833, r: 28, color: '#e056fd', alwaysShow: false, pressed: false, touchId: null },
  { id: 'Tab',    label: '\u2630', baseX: 0.961, baseY: 0.052, r: 25, color: '#aaa', alwaysShow: true, pressed: false, touchId: null },
  { id: 'Escape', label: '\u2716', baseX: 0.039, baseY: 0.052, r: 25, color: '#f66', alwaysShow: true, pressed: false, touchId: null }
];

// Compute absolute positions from ratios
function getTouchBtnPos(btn) {
  return { x: btn.baseX * CW, y: btn.baseY * CH };
}

// --- Should show button? ---
function isBtnVisible(btn) {
  if (btn.alwaysShow) return true;
  if (btn.id === 'KeyQ') return typeof player !== 'undefined' && player.weapons && player.weapons[1] !== null;
  return true;
}

// --- Joystick keys injection ---
const JOYSTICK_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD'];
let joystickKeysActive = { KeyW: false, KeyA: false, KeyS: false, KeyD: false };

function updateJoystickKeys() {
  const newState = { KeyW: false, KeyA: false, KeyS: false, KeyD: false };

  if (joystick.active) {
    const mag = Math.hypot(joystick.dx, joystick.dy);
    if (mag > joystick.deadzone) {
      if (joystick.dy < -0.3) newState.KeyW = true;
      if (joystick.dy > 0.3)  newState.KeyS = true;
      if (joystick.dx < -0.3) newState.KeyA = true;
      if (joystick.dx > 0.3)  newState.KeyD = true;
    }
  }

  // Apply changes to keys[]
  for (const k of JOYSTICK_KEYS) {
    if (newState[k] && !joystickKeysActive[k]) {
      keys[k] = true;
      pressed[k] = true;
    } else if (!newState[k] && joystickKeysActive[k]) {
      keys[k] = false;
    }
    // If joystick still active in same direction, keep key pressed
    if (newState[k]) keys[k] = true;
    joystickKeysActive[k] = newState[k];
  }
}

// --- Touch event handlers ---
function onTouchStart(e) {
  e.preventDefault();
  if (!touchActive) {
    touchActive = true;
    // Init audio on first touch (iOS Safari requirement)
    if (typeof Audio !== 'undefined' && typeof Audio.hit === 'function') {
      try {
        const _actx = new (window.AudioContext || window.webkitAudioContext)();
        if (_actx.state === 'suspended') _actx.resume();
        _actx.close();
      } catch(ex) {}
    }
  }

  for (let i = 0; i < e.changedTouches.length; i++) {
    const t = e.changedTouches[i];
    const pos = screenToCanvas(t.clientX, t.clientY);

    // Check buttons first (right side has priority)
    let hitBtn = false;
    for (const btn of TOUCH_BUTTONS) {
      if (!isBtnVisible(btn)) continue;
      const bp = getTouchBtnPos(btn);
      const dist = Math.hypot(pos.x - bp.x, pos.y - bp.y);
      if (dist < btn.r + 12) {
        btn.pressed = true;
        btn.touchId = t.identifier;
        keys[btn.id] = true;
        pressed[btn.id] = true;
        hitBtn = true;
        break;
      }
    }

    // If no button hit, check joystick (left half of screen)
    if (!hitBtn && pos.x < CW * 0.45 && joystick.touchId === null) {
      joystick.active = true;
      joystick.touchId = t.identifier;
      const dx = pos.x - joystick.cx;
      const dy = pos.y - joystick.cy;
      const dist = Math.hypot(dx, dy);
      const clampDist = Math.min(dist, joystick.radius);
      if (dist > 0) {
        joystick.dx = (dx / dist) * (clampDist / joystick.radius);
        joystick.dy = (dy / dist) * (clampDist / joystick.radius);
      }
    }
  }
}

function onTouchMove(e) {
  e.preventDefault();
  for (let i = 0; i < e.changedTouches.length; i++) {
    const t = e.changedTouches[i];

    // Joystick move
    if (t.identifier === joystick.touchId) {
      const pos = screenToCanvas(t.clientX, t.clientY);
      const dx = pos.x - joystick.cx;
      const dy = pos.y - joystick.cy;
      const dist = Math.hypot(dx, dy);
      const clampDist = Math.min(dist, joystick.radius);
      if (dist > 0) {
        joystick.dx = (dx / dist) * (clampDist / joystick.radius);
        joystick.dy = (dy / dist) * (clampDist / joystick.radius);
      } else {
        joystick.dx = 0;
        joystick.dy = 0;
      }
    }
  }
}

function onTouchEnd(e) {
  e.preventDefault();
  for (let i = 0; i < e.changedTouches.length; i++) {
    const t = e.changedTouches[i];

    // Joystick release
    if (t.identifier === joystick.touchId) {
      joystick.active = false;
      joystick.touchId = null;
      joystick.dx = 0;
      joystick.dy = 0;
      // Clear WASD keys
      for (const k of JOYSTICK_KEYS) {
        keys[k] = false;
        joystickKeysActive[k] = false;
      }
    }

    // Button release
    for (const btn of TOUCH_BUTTONS) {
      if (btn.touchId === t.identifier) {
        btn.pressed = false;
        btn.touchId = null;
        keys[btn.id] = false;
      }
    }
  }
}

// --- Register events ---
cvs.addEventListener('touchstart', onTouchStart, { passive: false });
cvs.addEventListener('touchmove', onTouchMove, { passive: false });
cvs.addEventListener('touchend', onTouchEnd, { passive: false });
cvs.addEventListener('touchcancel', onTouchEnd, { passive: false });

// --- Drawing ---
function drawTouchUI() {
  if (!touchActive) return;
  ctx.save();

  // Joystick outer ring
  ctx.globalAlpha = 0.25;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(joystick.cx, joystick.cy, joystick.radius, 0, Math.PI * 2);
  ctx.stroke();

  // Joystick direction guides (subtle cross)
  ctx.globalAlpha = 0.1;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(joystick.cx, joystick.cy - joystick.radius + 10);
  ctx.lineTo(joystick.cx, joystick.cy + joystick.radius - 10);
  ctx.moveTo(joystick.cx - joystick.radius + 10, joystick.cy);
  ctx.lineTo(joystick.cx + joystick.radius - 10, joystick.cy);
  ctx.stroke();

  // Knob
  const knobX = joystick.cx + joystick.dx * joystick.radius * 0.7;
  const knobY = joystick.cy + joystick.dy * joystick.radius * 0.7;
  ctx.globalAlpha = joystick.active ? 0.5 : 0.2;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(knobX, knobY, joystick.knobRadius, 0, Math.PI * 2);
  ctx.fill();

  // Buttons
  for (const btn of TOUCH_BUTTONS) {
    if (!isBtnVisible(btn)) continue;
    const bp = getTouchBtnPos(btn);
    ctx.globalAlpha = btn.pressed ? 0.55 : 0.28;
    ctx.fillStyle = btn.color;
    ctx.beginPath();
    ctx.arc(bp.x, bp.y, btn.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label
    ctx.globalAlpha = btn.pressed ? 0.9 : 0.6;
    ctx.fillStyle = '#fff';
    ctx.font = "bold " + Math.floor(btn.r * 0.75) + "px 'M PLUS Rounded 1c', sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(btn.label, bp.x, bp.y + 1);
  }

  ctx.restore();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

// --- Per-frame update (called from game loop) ---
function updateTouch() {
  if (!touchActive) return;
  updateJoystickKeys();
}