// === TOUCH INPUT MODULE (Sprint F + Phase 3 unified) ===
// Mobile virtual joystick + action buttons + equipment touch
// Unified handler: no override chains

// --- Mobile detection ---
// Capability-based: true if device has touch support (doesn't require first touch event)
let touchActive = false; // 実タッチ発生時のみtrue (PCタッチパネル誤判定を防ぐ)
let _touchInited = false; // one-time init flag for fullscreen/audio unlock

// --- Canvas coordinate conversion ---
// rectキャッシュ: resize/orientationchange 時のみ更新し毎タッチのレイアウト再計算を防ぐ
let _cachedRect = null;
function _updateRect() { _cachedRect = cvs.getBoundingClientRect(); }
window.addEventListener('resize', _updateRect, { passive: true });
window.addEventListener('orientationchange', () => setTimeout(_updateRect, 200), { passive: true });
function screenToCanvas(tx, ty) {
  if (!_cachedRect) _cachedRect = cvs.getBoundingClientRect();
  return { x: (tx - _cachedRect.left) / _cachedRect.width * CW, y: (ty - _cachedRect.top) / _cachedRect.height * CH };
}

// --- Joystick ---
const joystick = {
  active: false, cx: 170, cy: CH - 190,
  radius: 70, knobRadius: 42, deadzone: 0.15,
  dx: 0, dy: 0, touchId: null
};

// --- Buttons (resized for 48dp+ compliance) ---
// Digit1/2/3: top-right item buttons with large radius; icons drawn from player.consumables
const TOUCH_BUTTONS = [
  { id: 'KeyZ',   label: 'Z',  baseX: 0.910, baseY: 0.775, r: 76, color: '#ffd700', alwaysShow: true,  pressed: false, touchId: null },
  { id: 'KeyX',   label: 'X',  baseX: 0.795, baseY: 0.865, r: 66, color: '#87ceeb', alwaysShow: true,  pressed: false, touchId: null },
  { id: 'Digit1', label: '1',  baseX: 0.820, baseY: 0.190, r: 52, color: '#2ecc71', alwaysShow: true,  pressed: false, touchId: null },
  { id: 'Digit2', label: '2',  baseX: 0.895, baseY: 0.190, r: 52, color: '#2ecc71', alwaysShow: true,  pressed: false, touchId: null },
  { id: 'Digit3', label: '3',  baseX: 0.970, baseY: 0.190, r: 52, color: '#2ecc71', alwaysShow: true,  pressed: false, touchId: null },
  { id: 'KeyQ',   label: 'Q',  baseX: 0.700, baseY: 0.790, r: 36, color: '#e056fd', alwaysShow: false, pressed: false, touchId: null },
  { id: 'Tab',    label: '\u2630', baseX: 0.955, baseY: 0.060, r: 32, color: '#aaa', alwaysShow: true, pressed: false, touchId: null },
  { id: 'Escape', label: '◀', baseX: 0.055, baseY: 0.060, r: 52, color: '#f66', alwaysShow: true, pressed: false, touchId: null }
];

function getTouchBtnPos(btn) { return { x: btn.baseX * CW, y: btn.baseY * CH }; }

function isBtnVisible(btn) {
  if (btn.alwaysShow) return true;
  if (btn.id === 'KeyQ') return typeof player !== 'undefined' && player.weapons && player.weapons[1] !== null;
  return true;
}

// --- Context: which buttons to show per gameState ---
// Z, X, Escape(◀) are always visible. Items shown in playing state only.
function getVisibleButtons() {
  const gs = typeof gameState !== 'undefined' ? gameState : 'title';
  const inv = typeof inventoryOpen !== 'undefined' && inventoryOpen;
  const base = TOUCH_BUTTONS.filter(b => b.id === 'KeyZ' || b.id === 'KeyX' || b.id === 'Escape');
  if (inv) return TOUCH_BUTTONS.filter(b => b.id === 'KeyZ' || b.id === 'KeyX' || b.id === 'Tab' || b.id === 'Escape');
  if (gs === 'playing') return TOUCH_BUTTONS.filter(b => isBtnVisible(b));
  if (gs === 'title') return base;
  if (gs === 'garden' || gs === 'ending') return TOUCH_BUTTONS.filter(b => b.id === 'KeyZ' || b.id === 'KeyX' || b.id === 'Tab' || b.id === 'Escape');
  if (gs === 'shop' || gs === 'blessing') return base;
  if (gs === 'dead') return base;
  return base;
}

// --- Joystick keys injection ---
// 8方向対応: 両軸を独立して判定し斜め移動を許可
const JOYSTICK_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD'];
let joystickKeysActive = { KeyW: false, KeyA: false, KeyS: false, KeyD: false };

function updateJoystickKeys() {
  const newState = { KeyW: false, KeyA: false, KeyS: false, KeyD: false };
  if (joystick.active) {
    const mag = Math.hypot(joystick.dx, joystick.dy);
    if (mag > joystick.deadzone) {
      if (joystick.dx < -0.28) newState.KeyA = true;
      if (joystick.dx >  0.28) newState.KeyD = true;
      if (joystick.dy < -0.28) newState.KeyW = true;
      if (joystick.dy >  0.28) newState.KeyS = true;
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
let equipTouchStart = { x:0, y:0, time:0, slotIdx:-1 };

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
    if (!inventoryOpen || inventoryTab !== 2) return false;
    // Match bottom-center detail panel from equip_ui.js
    const panelW = 500, panelH = 440;
    const panelX = (CW - panelW) / 2, panelY = (CH - panelH) / 2;
    const pcx = panelX + panelW / 2;
    const detH = 140, detY = panelY + panelH - detH - 30;
    const btnW = 180, btnH = 30;
    const btnX = pcx - btnW / 2, btnY = detY + detH - 38;
    return cx >= btnX && cx <= btnX + btnW && cy >= btnY && cy <= btnY + btnH;
  }

// === Unified touch handlers ===
function onTouchStart(e) {
  e.preventDefault();
  touchActive = true;
  if (!_touchInited) {
    _touchInited = true;
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

  if (e.changedTouches.length > 0) {
    var _st = e.changedTouches[0];
    var _sp = screenToCanvas(_st.clientX, _st.clientY);
    window._swipeStartX = _sp.x; window._swipeTouchId = _st.identifier;
  }
  for (var ti = 0; ti < e.changedTouches.length; ti++) {
    var t = e.changedTouches[ti];
    var pos = screenToCanvas(t.clientX, t.clientY);

    // --- Inventory mode ---
    if (typeof inventoryOpen !== 'undefined' && inventoryOpen) {
      if (typeof collectionDetailOpen !== 'undefined' && collectionDetailOpen && inventoryTab === 1) {
        collectionDetailOpen = false;
        if (typeof Audio !== 'undefined' && Audio.menu_move) Audio.menu_move();
        return;
      }
      // --- ヘルプアイコン判定（全タブ共通）---
      {
        var _hx = CW - 160, _hy = 55 + 10 * (touchActive ? 2 : 1), _hr = 34;
        if (Math.hypot(pos.x - _hx, pos.y - _hy) < _hr + 10) {
          if (typeof UIManager !== 'undefined') {
            UIManager._helpKey = (UIManager._helpKey === 'inventory') ? null : 'inventory';
            if (typeof mouse !== 'undefined') { mouse.clicked = false; }
          }
          if (typeof Audio !== 'undefined' && Audio.menu_move) Audio.menu_move();
          return;
        }
      }
      // --- サブタブ判定（図鑑タブのみ）---
      if (inventoryTab === 1) {
        var _stM = touchActive ? 2 : 1;
        for (var sti = 0; sti < 3; sti++) {
          var _stx = 180 + sti * 160;
          if (pos.x >= _stx - 56 && pos.x <= _stx + 56
              && pos.y >= 104 && pos.y <= 104 + 32 * _stM) {
            collectionSubTab = sti;
            if (typeof Audio !== 'undefined' && Audio.menu_move) Audio.menu_move();
            return;
          }
        }
      }
      if (inventoryTab === 1 && typeof collectionSubTab !== 'undefined' && collectionSubTab !== 2) {
        if (pos.y >= 141 && pos.y <= 169) {
          var fk2 = collectionSubTab === 0 ? ['all','forest','cave','flower','boss'] : ['all','tier1','tier2'];
          var fW2 = 70, fSX2 = 120;
          for (var ffi = 0; ffi < fk2.length; ffi++) {
            var ffX = fSX2 + ffi * (fW2 + 8);
            if (pos.x >= ffX && pos.x <= ffX + fW2) {
              var fkey = collectionSubTab === 0 ? 'enemy' : 'weapon';
              collectionFilter[fkey] = fk2[ffi];
              collectionCursor[fkey] = 0; collectionAnimX[fkey] = 0;
              if (typeof Audio !== 'undefined' && Audio.menu_move) Audio.menu_move();
              return;
            }
          }
        }
        var ck2 = collectionSubTab === 0 ? 'enemy' : 'weapon';
        var ci2 = collectionCursor[ck2];
        var citems2 = (typeof getFilteredItems === 'function') ? getFilteredItems(collectionSubTab, collectionFilter[ck2]) : [];
        var cit2 = citems2[ci2];
        var cknown2 = cit2 && (cit2.type === 'enemy' ? (cit2.rec && cit2.rec.defeated > 0) : cit2.known);
        if (pos.x >= CW/2-117 && pos.x <= CW/2+117 && pos.y >= CH/2+20-150 && pos.y <= CH/2+20+150) {
          if (cknown2) { collectionDetailOpen = true; if (typeof Audio !== 'undefined' && Audio.dialog_open) Audio.dialog_open(); return; }
        }
      }
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
          
          equipCursor = slotHit; if (typeof equipMode !== 'undefined') equipMode = 'slot';
          if (typeof Audio !== 'undefined' && Audio.menu_move) Audio.menu_move();
          return;
        }
        // List item tap (right pane)
        if (typeof getAllOwnedWeapons === 'function' && typeof equipMode !== 'undefined') {
          var allW = getAllOwnedWeapons();
          if (allW.length > 0) {
            var pW2 = CW - 160, pX2 = 80, pY2 = 110;
            var lW2 = Math.floor(pW2 * 0.45);
            var rX2 = pX2 + lW2 + 20, rY2 = pY2 + 95;
            var rW2 = pW2 - lW2 - 35, rH2 = 52;
            for (var li = 0; li < allW.length; li++) {
              var ry2 = rY2 + li * rH2;
              if (pos.x >= rX2 && pos.x <= rX2 + rW2 && pos.y >= ry2 && pos.y <= ry2 + rH2) {
                equipMode = 'list'; equipListCursor = li;
                if (typeof Audio !== 'undefined' && Audio.menu_move) Audio.menu_move();
                return;
              }
            }
          }
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

    // --- blessing: カード直タップで選択（2段階: 選択→確認タップで決定） ---
    var gs = typeof gameState !== 'undefined' ? gameState : '';
    if (gs === 'blessing' && typeof blessingChoices !== 'undefined') {
      var _bM = touchActive ? 2 : 1;
      var _cbw = 180 * _bM, _cbh = 220 * _bM;
      var _bTotal = blessingChoices.length * _cbw + (blessingChoices.length - 1) * 20 * _bM;
      var _bSX = CW / 2 - _bTotal / 2;
      var _cby = 50 + 70 * _bM;
      for (var ci = 0; ci < blessingChoices.length; ci++) {
        var cbx = _bSX + ci * (_cbw + 20 * _bM), cbw = _cbw, cbh = _cbh, cby = _cby;
        if (pos.x >= cbx - 10 && pos.x <= cbx + cbw + 10 && pos.y >= cby - 10 && pos.y <= cby + cbh + 10) {
          if (typeof selectCursor !== 'undefined') {
            if (selectCursor === ci) {
              // 既に選択中 → 決定
              keys['KeyZ'] = true; pressed['KeyZ'] = true;
              if (typeof Audio !== 'undefined' && Audio.menu_move) Audio.menu_move();
              setTimeout(function() { keys['KeyZ'] = false; }, 80);
            } else {
              // 未選択 → カーソル移動のみ
              selectCursor = ci;
              if (typeof Audio !== 'undefined' && Audio.menu_move) Audio.menu_move();
            }
          }
          return;
        }
      }
    }

    // --- shop: アイテムカード直タップ ---
    if (gs === 'shop' && typeof shopItems !== 'undefined' && shopItems.length > 0) {
      var _sM = touchActive ? 2 : 1;
      var sCardW2 = 160 * _sM, sPadX2 = 14 * _sM, sCardH2 = 200 * _sM;
      var sTotalW = shopItems.length * sCardW2 + (shopItems.length - 1) * sPadX2;
      if (sTotalW > CW - 60) { sCardW2 = Math.floor((CW - 60 - (shopItems.length - 1) * sPadX2) / shopItems.length); sTotalW = shopItems.length * sCardW2 + (shopItems.length - 1) * sPadX2; }
      var sStartX2 = CW / 2 - sTotalW / 2;
      var sStartY2 = CH * 0.48 + 14;
      for (var si2 = 0; si2 < shopItems.length; si2++) {
        var scx = sStartX2 + si2 * (sCardW2 + sPadX2);
        var scy = sStartY2;
        if (pos.x >= scx - 8 && pos.x <= scx + sCardW2 + 8 && pos.y >= scy - 8 && pos.y <= scy + sCardH2 + 8) {
          if (typeof selectCursor !== 'undefined') selectCursor = si2;
          keys['KeyZ'] = true; pressed['KeyZ'] = true;
          if (typeof Audio !== 'undefined' && Audio.menu_move) Audio.menu_move();
          setTimeout(function() { keys['KeyZ'] = false; }, 80);
          return;
        }
      }
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
    if (gs === 'title' && (typeof titleVolSel === 'undefined' || titleVolSel < 0) && (typeof titleGuard === 'undefined' || titleGuard <= 0)) {
      // 花壇ボタン判定（drawTitle と同じ座標）
      var _bwS=330, _bwG=220, _gap=24, _btnY=470, _btnH=72;
      var _bxS=CW/2-(_bwS+_gap+_bwG)/2, _bxG=_bxS+_bwS+_gap;
      if (pos.x>=_bxG && pos.x<=_bxG+_bwG && pos.y>=_btnY && pos.y<=_btnY+_btnH) {
        keys['KeyX'] = true; pressed['KeyX'] = true;
        setTimeout(function() { keys['KeyX'] = false; }, 80);
      } else {
        keys['KeyZ'] = true; pressed['KeyZ'] = true;
        setTimeout(function() { keys['KeyZ'] = false; }, 80);
      }
    }
    if (gs === 'dead' && (typeof deadTimer === 'undefined' || deadTimer > 2.0)) {
      keys['KeyZ'] = true; pressed['KeyZ'] = true;
      setTimeout(function() { keys['KeyZ'] = false; }, 80);
    }
    if (!hitBtn && gs !== 'title' && gs !== 'dead' && pos.x < CW * 0.45 && joystick.touchId === null) {
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

    // Equipment touch (no D&D)

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

    // Equipment touch end (no D&D)

    if (typeof inventoryOpen !== 'undefined' && inventoryOpen && inventoryTab === 1
        && typeof collectionSubTab !== 'undefined' && collectionSubTab !== 2
        && t.identifier === window._swipeTouchId) {
      var ex = screenToCanvas(t.clientX, t.clientY).x;
      var swDx = ex - (window._swipeStartX || ex);
      if (Math.abs(swDx) > 30) {
        var swKey = collectionSubTab === 0 ? 'enemy' : 'weapon';
        var swItems = (typeof getFilteredItems === 'function') ? getFilteredItems(collectionSubTab, collectionFilter[swKey]) : [];
        if (swDx < 0) collectionCursor[swKey] = Math.min(swItems.length-1, collectionCursor[swKey]+1);
        else           collectionCursor[swKey] = Math.max(0, collectionCursor[swKey]-1);
        if (typeof Audio !== 'undefined' && Audio.menu_move) Audio.menu_move();
      }
      window._swipeStartX = null;
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

// --- Mouse click support for PC (title screen) ---
cvs.addEventListener('mousedown', function(e) {
  var gs = typeof gameState !== 'undefined' ? gameState : 'title';
  if (gs === 'title' && (typeof titleVolSel === 'undefined' || titleVolSel < 0) && (typeof titleGuard === 'undefined' || titleGuard <= 0)) {
    var pos = screenToCanvas(e.clientX, e.clientY);
    var _bwS=330, _bwG=220, _gap=24, _btnY=470, _btnH=72;
    var _bxS=CW/2-(_bwS+_gap+_bwG)/2, _bxG=_bxS+_bwS+_gap;
    if (pos.x>=_bxG && pos.x<=_bxG+_bwG && pos.y>=_btnY && pos.y<=_btnY+_btnH) {
      keys['KeyX'] = true; pressed['KeyX'] = true;
      setTimeout(function() { keys['KeyX'] = false; }, 80);
    } else {
      keys['KeyZ'] = true; pressed['KeyZ'] = true;
      setTimeout(function() { keys['KeyZ'] = false; }, 80);
    }
  }
});

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
  var knobX = joystick.cx + joystick.dx * joystick.radius * 0.65;
  var knobY = joystick.cy + joystick.dy * joystick.radius * 0.65;
  ctx.globalAlpha = joystick.active ? 0.5 : 0.2;
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(knobX, knobY, joystick.knobRadius, 0, Math.PI * 2); ctx.fill();

  // Context-aware buttons
  var visible = getVisibleButtons();
  var gs2 = typeof gameState !== 'undefined' ? gameState : '';
  for (var i = 0; i < visible.length; i++) {
    var btn = visible[i];
    var bp = getTouchBtnPos(btn);
    // Item buttons: look up consumable
    var itemIcon = null;
    var hasItem = false;
    if (btn.id === 'Digit1' || btn.id === 'Digit2' || btn.id === 'Digit3') {
      var itemIdx = btn.id === 'Digit1' ? 0 : btn.id === 'Digit2' ? 1 : 2;
      if (typeof player !== 'undefined' && player.consumables && player.consumables[itemIdx]) {
        itemIcon = player.consumables[itemIdx].icon;
        hasItem = true;
      }
    }
    // Draw only item buttons in playing state; skip in other states
    if ((btn.id === 'Digit1' || btn.id === 'Digit2' || btn.id === 'Digit3') && gs2 !== 'playing') continue;
    ctx.globalAlpha = btn.pressed ? 0.75 : (hasItem ? 0.55 : 0.25);
    ctx.fillStyle = hasItem ? btn.color : 'rgba(100,100,100,0.5)';
    ctx.beginPath(); ctx.arc(bp.x, bp.y, btn.r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = hasItem ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.globalAlpha = btn.pressed ? 1.0 : 0.85;
    if (itemIcon) {
      // Draw item icon large inside button
      ctx.fillStyle = '#fff';
      ctx.font = Math.floor(btn.r * 1.0) + "px 'M PLUS Rounded 1c', sans-serif";
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(itemIcon, bp.x, bp.y - 4);
      // Slot number badge (small, bottom)
      ctx.font = "bold " + Math.floor(btn.r * 0.4) + "px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillStyle = '#111';
      ctx.globalAlpha = 0.8;
      ctx.fillText(btn.label, bp.x, bp.y + btn.r * 0.58);
    } else {
      ctx.fillStyle = '#fff';
      ctx.font = "bold " + Math.floor(btn.r * 0.75) + "px 'M PLUS Rounded 1c', sans-serif";
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(btn.label, bp.x, bp.y + 1);
    }
  }

  ctx.restore();
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
}

// --- Per-frame update ---
function updateTouch() {
  if (!touchActive) return;
  updateJoystickKeys();
}




