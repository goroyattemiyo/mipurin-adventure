// === TOUCH INPUT MODULE (Sprint F + Phase 3 unified) ===
// Mobile virtual joystick + action buttons + equipment touch
// Unified handler: no override chains

// --- Mobile detection ---
let touchActive = false;

// --- Canvas coordinate conversion ---
function screenToCanvas(tx, ty) {
  const rect = cvs.getBoundingClientRect();
  return { x: (tx - rect.left) / rect.width * CW, y: (ty - rect.top) / rect.height * CH };
}

// --- Joystick ---
const joystick = {
  active: false, cx: 170, cy: CH - 190,
  radius: 70, knobRadius: 42, deadzone: 0.15,
  dx: 0, dy: 0, touchId: null
};

// --- Buttons (resized for 48dp+ compliance) ---
const TOUCH_BUTTONS = [
  { id: 'KeyZ',   label: 'Z',  baseX: 0.910, baseY: 0.790, r: 60, color: '#ffd700', alwaysShow: true,  pressed: false, touchId: null },
  { id: 'KeyX',   label: 'X',  baseX: 0.800, baseY: 0.870, r: 50, color: '#87ceeb', alwaysShow: true,  pressed: false, touchId: null },
  { id: 'Digit1', label: '1',  baseX: 0.720, baseY: 0.940, r: 36, color: '#2ecc71', alwaysShow: true,  pressed: false, touchId: null },
  { id: 'Digit2', label: '2',  baseX: 0.800, baseY: 0.940, r: 36, color: '#2ecc71', alwaysShow: true,  pressed: false, touchId: null },
  { id: 'Digit3', label: '3',  baseX: 0.880, baseY: 0.940, r: 36, color: '#2ecc71', alwaysShow: true,  pressed: false, touchId: null },
  { id: 'KeyQ',   label: 'Q',  baseX: 0.700, baseY: 0.790, r: 36, color: '#e056fd', alwaysShow: false, pressed: false, touchId: null },
  { id: 'Tab',    label: '\u2630', baseX: 0.955, baseY: 0.060, r: 32, color: '#aaa', alwaysShow: true, pressed: false, touchId: null },
  { id: 'Escape', label: '\u2716', baseX: 0.045, baseY: 0.060, r: 32, color: '#f66', alwaysShow: true, pressed: false, touchId: null }
];

function getTouchBtnPos(btn) { return { x: btn.baseX * CW, y: btn.baseY * CH }; }

function isBtnVisible(btn) {
  if (btn.alwaysShow) return true;
  if (btn.id === 'KeyQ') return typeof player !== 'undefined' && player.weapons && player.weapons[1] !== null;
  return true;
}

// --- Context: which buttons to show per gameState ---
function getVisibleButtons() {
  const gs = typeof gameState !== 'undefined' ? gameState : 'title';
  const inv = typeof inventoryOpen !== 'undefined' && inventoryOpen;
  if (inv) return TOUCH_BUTTONS.filter(b => b.id === 'Tab' || b.id === 'Escape');
  if (gs === 'playing') return TOUCH_BUTTONS.filter(b => isBtnVisible(b));
  if (gs === 'title' || gs === 'garden' || gs === 'ending') return TOUCH_BUTTONS.filter(b => b.id === 'KeyZ' || b.id === 'KeyX' || b.id === 'Tab' || b.id === 'Escape');
  if (gs === 'shop' || gs === 'blessing') return TOUCH_BUTTONS.filter(b => b.id === 'KeyZ' || b.id === 'KeyX' || b.id === 'Escape');
  if (gs === 'dead') return TOUCH_BUTTONS.filter(b => b.id === 'KeyZ' || b.id === 'Escape');
  return TOUCH_BUTTONS.filter(b => b.id === 'KeyZ' || b.id === 'KeyX' || b.id === 'Escape');
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
  for (const k of JOYSTICK_KEYS) {
    if (newState[k] && !joystickKeysActive[k]) { keys[k] = true; pressed[k] = true; }
    else if (!newState[k] && joystickKeysActive[k]) { keys[k] = false; }
    if (newState[k]) keys[k] = true;
    joystickKeysActive[k] = newState[k];
  }
}

// === Equipment touch support ===
const EQUIP_TAP_THRESHOLD = 200;
let equipTouchStart = { x: 0, y: 0, time: 0, slotIdx: -1 };

function hitTestEquipSlot(cx, cy) {
  if (!equipSlotRects || equipSlotRects.length === 0) return -1;
  for (let i = 0; i < equipSlotRects.length; i++) {
    const s = equipSlotRects[i];
    if (cx >= s.x && cx <= s.x + s.w && cy >= s.y && cy <= s.y + s.h) return i;
  }
  return -1;
}

function hitTestInvTab(cx, cy) {
  for (let i = 0; i < 3; i++) {
    const tx = CW / 2 - 120 + i * 240 - 80;
    if (cx >= tx && cx <= tx + 160 && cy >= 40 && cy <= 80) return i;
  }
  return -1;
}

function hitTestUpgradeBtn(cx, cy) {
  const panelX = 80, panelY = 110, panelH = CH - 160;
  const detX = panelX + 15, detY = panelY + panelH - 195, detW = 175;
  const btnY = detY + 132;
  return cx >= detX + 8 && cx <= detX + detW - 8 && cy >= btnY && cy <= btnY + 28;
}

// === Unified touch handlers ===
function onTouchStart(e) {
  e.preventDefault();
  if (!touchActive) {
    touchActive = true;
    try {
      const el = document.documentElement;
      const rfs = el.requestFullscreen || el.webkitRequestFullscreen;
      if (rfs && !document.fullscreenElement && !document.webkitFullscreenElement) {
        rfs.call(el).then(function() {
          try { screen.orientation.lock('landscape').catch(function(){}); } catch(e2){}
        }).catch(function(){});
      }
    } catch(e2){}
    try {
      if (typeof ChipBGM !== 'undefined') ChipBGM.resume();
      var _actx = new (window.AudioContext || window.webkitAudioContext)();
      if (_actx.state === 'suspended') _actx.resume();
      _actx.close();
    } catch(ex) {}
  }

  for (var ti = 0; ti < e.changedTouches.length; ti++) {
    var t = e.changedTouches[ti];
    var pos = screenToCanvas(t.clientX, t.clientY);

    // --- Inventory mode ---
    if (typeof inventoryOpen !== 'undefined' && inventoryOpen) {
      var tabHit = hitTestInvTab(pos.x, pos.y);
      if (tabHit >= 0) {
        inventoryTab = tabHit;
        if (typeof Audio !== 'undefined' && Audio.menu_move) Audio.menu_move();
        return;
      }
      if (pos.x < 80 && pos.y < 80) { inventoryOpen = false; return; }
      if (inventoryTab === 2) {
        if (hitTestUpgradeBtn(pos.x, pos.y)) {
          var selW = equipCursor < 2 ? player.weapons[equipCursor] : player.backpack[equipCursor - 2];
          if (selW && typeof upgradeWeapon === 'function') {
            if (upgradeWeapon(selW)) {
              if (typeof Audio !== 'undefined' && Audio.level_up) Audio.level_up();
              if (typeof equipBounce !== 'undefined') equipBounce = 1;
              if (typeof showFloat === 'function') showFloat('\u26A1 \u5F37\u5316\u6210\u529F\uFF01', 1.5, '#2ecc71');
            }
          }
          return;
        }
        var slotHit = hitTestEquipSlot(pos.x, pos.y);
        if (slotHit >= 0) {
          equipTouchStart = { x: pos.x, y: pos.y, time: Date.now(), slotIdx: slotHit };
          equipCursor = slotHit;
          if (typeof Audio !== 'undefined' && Audio.menu_move) Audio.menu_move();
          return;
        }
      }
      // In inventory, also check Tab/Esc buttons
      for (var bi = 0; bi < TOUCH_BUTTONS.length; bi++) {
        var btn = TOUCH_BUTTONS[bi];
        if (btn.id !== 'Tab' && btn.id !== 'Escape') continue;
        var bp = getTouchBtnPos(btn);
        if (Math.hypot(pos.x - bp.x, pos.y - bp.y) < btn.r + 18) {
          btn.pressed = true; btn.touchId = t.identifier;
          keys[btn.id] = true; pressed[btn.id] = true;
          return;
        }
      }
      return;
    }

    // --- Normal mode: check context-visible buttons ---
    var visible = getVisibleButtons();
    var hitBtn = false;
    for (var bi = 0; bi < visible.length; bi++) {
      var btn = visible[bi];
      var bp = getTouchBtnPos(btn);
      if (Math.hypot(pos.x - bp.x, pos.y - bp.y) < btn.r + 18) {
        btn.pressed = true; btn.touchId = t.identifier;
        keys[btn.id] = true; pressed[btn.id] = true;
        hitBtn = true; break;
      }
    }
    if (!hitBtn && pos.x < CW * 0.45 && joystick.touchId === null) {
      joystick.active = true; joystick.touchId = t.identifier;
      var dx = pos.x - joystick.cx, dy = pos.y - joystick.cy;
      var dist = Math.hypot(dx, dy);
      var clampDist = Math.min(dist, joystick.radius);
      if (dist > 0) { joystick.dx = (dx / dist) * (clampDist / joystick.radius); joystick.dy = (dy / dist) * (clampDist / joystick.radius); }
    }
  }
}

function onTouchMove(e) {
  e.preventDefault();
  for (var ti = 0; ti < e.changedTouches.length; ti++) {
    var t = e.changedTouches[ti];
    var pos = screenToCanvas(t.clientX, t.clientY);

    // Equipment drag
    if (typeof inventoryOpen !== 'undefined' && inventoryOpen && inventoryTab === 2) {
      if (equipTouchStart.slotIdx >= 0 && !mouse.dragItem) {
        var dist = Math.hypot(pos.x - equipTouchStart.x, pos.y - equipTouchStart.y);
        var elapsed = Date.now() - equipTouchStart.time;
        if (dist > 10 || elapsed > EQUIP_TAP_THRESHOLD) {
          var si = equipTouchStart.slotIdx;
          var item = si < 2 ? player.weapons[si] : player.backpack[si - 2];
          if (item) { mouse.dragItem = item; mouse.dragFrom = si; }
        }
      }
      if (mouse.dragItem) { mouse.x = pos.x; mouse.y = pos.y; }
      continue;
    }

    // Joystick move
    if (t.identifier === joystick.touchId) {
      var dx = pos.x - joystick.cx, dy = pos.y - joystick.cy;
      var dist = Math.hypot(dx, dy);
      var clampDist = Math.min(dist, joystick.radius);
      if (dist > 0) { joystick.dx = (dx / dist) * (clampDist / joystick.radius); joystick.dy = (dy / dist) * (clampDist / joystick.radius); }
      else { joystick.dx = 0; joystick.dy = 0; }
    }
  }
}

function onTouchEnd(e) {
  e.preventDefault();
  for (var ti = 0; ti < e.changedTouches.length; ti++) {
    var t = e.changedTouches[ti];
    var pos = screenToCanvas(t.clientX, t.clientY);

    // Equipment drop
    if (typeof inventoryOpen !== 'undefined' && inventoryOpen && inventoryTab === 2) {
      if (mouse.dragItem && mouse.dragFrom !== null) {
        var dropSlot = hitTestEquipSlot(pos.x, pos.y);
        if (dropSlot >= 0 && dropSlot !== mouse.dragFrom) {
          var fromIdx = mouse.dragFrom;
          var getItem = function(idx) { return idx < 2 ? player.weapons[idx] : player.backpack[idx - 2]; };
          var setItem = function(idx, item) { if (idx < 2) player.weapons[idx] = item; else player.backpack[idx - 2] = item; };
          var a = getItem(fromIdx), b = getItem(dropSlot);
          setItem(fromIdx, b); setItem(dropSlot, a);
          player.weapon = player.weapons[player.weaponIdx] || player.weapons[0];
          if (typeof Audio !== 'undefined' && Audio.item_get) Audio.item_get();
          if (typeof showFloat === 'function') showFloat('\uD83D\uDD04 \u5165\u308C\u66FF\u3048\u5B8C\u4E86', 1.2, '#87ceeb');
          if (typeof equipBounce !== 'undefined') equipBounce = 1;
        }
        mouse.dragItem = null; mouse.dragFrom = null;
      }
      equipTouchStart = { x: 0, y: 0, time: 0, slotIdx: -1 };
    }

    // Joystick release
    if (t.identifier === joystick.touchId) {
      joystick.active = false; joystick.touchId = null;
      joystick.dx = 0; joystick.dy = 0;
      for (var ki = 0; ki < JOYSTICK_KEYS.length; ki++) { keys[JOYSTICK_KEYS[ki]] = false; joystickKeysActive[JOYSTICK_KEYS[ki]] = false; }
    }

    // Button release
    for (var bi = 0; bi < TOUCH_BUTTONS.length; bi++) {
      if (TOUCH_BUTTONS[bi].touchId === t.identifier) {
        TOUCH_BUTTONS[bi].pressed = false; TOUCH_BUTTONS[bi].touchId = null;
        keys[TOUCH_BUTTONS[bi].id] = false;
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

  // Joystick
  ctx.globalAlpha = 0.25; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(joystick.cx, joystick.cy, joystick.radius, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = 0.1; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(joystick.cx, joystick.cy - joystick.radius + 10);
  ctx.lineTo(joystick.cx, joystick.cy + joystick.radius - 10);
  ctx.moveTo(joystick.cx - joystick.radius + 10, joystick.cy);
  ctx.lineTo(joystick.cx + joystick.radius - 10, joystick.cy);
  ctx.stroke();
  var knobX = joystick.cx + joystick.dx * joystick.radius * 0.7;
  var knobY = joystick.cy + joystick.dy * joystick.radius * 0.7;
  ctx.globalAlpha = joystick.active ? 0.5 : 0.2;
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(knobX, knobY, joystick.knobRadius, 0, Math.PI * 2); ctx.fill();

  // Context-aware buttons
  var visible = getVisibleButtons();
  for (var i = 0; i < visible.length; i++) {
    var btn = visible[i];
    var bp = getTouchBtnPos(btn);
    ctx.globalAlpha = btn.pressed ? 0.55 : 0.28;
    ctx.fillStyle = btn.color;
    ctx.beginPath(); ctx.arc(bp.x, bp.y, btn.r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.globalAlpha = btn.pressed ? 0.9 : 0.6;
    ctx.fillStyle = '#fff';
    ctx.font = "bold " + Math.floor(btn.r * 0.75) + "px 'M PLUS Rounded 1c', sans-serif";
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(btn.label, bp.x, bp.y + 1);
  }

  ctx.restore();
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
}

// --- Per-frame update ---
function updateTouch() {
  if (!touchActive) return;
  updateJoystickKeys();
}
