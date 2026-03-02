/**
 * metaUI.js - 花壇画面（メタプログレッションUI）
 * ミプリンの冒険 v1.1.0
 */
const MetaUI = (() => {
  var S = CONFIG.SCALE;
  var PX = function(v) { return v * S; };

  var _open = false;
  var _cursor = 0;
  var _confirmMode = false;
  var _resultMode = false;
  var _resultData = null;
  var _animTimer = 0;

  var BED_KEYS = ['hp', 'atk', 'choice', 'weapon', 'npc', 'deathPenalty', 'exploration'];

  function open() {
    MetaProgression.init();
    _open = true; _cursor = 0; _confirmMode = false;
    _resultMode = false; _resultData = null; _animTimer = 0;
  }

  function close() { _open = false; _confirmMode = false; _resultMode = false; }
  function isOpen() { return _open; }

  function showRunResult(data) {
    MetaProgression.init();
    _open = true; _resultMode = true; _resultData = data;
    _cursor = 0; _confirmMode = false; _animTimer = 0;
  }

  function update() {
    if (!_open) return;
    _animTimer += 1 / 60;

    if (_resultMode) {
      if (Engine.consumePress('interact') || Engine.consumePress('attack') || Engine.consumeClick()) {
        _resultMode = false; _resultData = null;
      }
      return;
    }

    if (_confirmMode) {
      if (Engine.consumePress('interact') || Engine.consumePress('attack')) {
        var key = BED_KEYS[_cursor];
        if (MetaProgression.canUpgrade(key)) {
          MetaProgression.upgrade(key);
          Audio.playSe('level_up');
        }
        _confirmMode = false;
      }
      if (Engine.consumePress('menu') || Engine.consumePress('needle')) {
        _confirmMode = false;
      }
      return;
    }

    if (Engine.consumePress('up')) {
      _cursor = (_cursor - 1 + BED_KEYS.length) % BED_KEYS.length;
      Audio.playSe('menu_move');
    }
    if (Engine.consumePress('down')) {
      _cursor = (_cursor + 1) % BED_KEYS.length;
      Audio.playSe('menu_move');
    }

    if (Engine.consumePress('interact') || Engine.consumePress('attack')) {
      var key = BED_KEYS[_cursor];
      if (MetaProgression.canUpgrade(key)) {
        _confirmMode = true;
        Audio.playSe('menu_select');
      } else {
        Audio.playSe('dialog_close');
      }
    }

    if (Engine.consumePress('menu')) {
      close(); Audio.playSe('dialog_close');
    }
  }

  function draw(ctx) {
    if (!_open) return;
    var W = CONFIG.CANVAS_WIDTH;
    var H = CONFIG.CANVAS_HEIGHT;

    ctx.fillStyle = '#0d0d1a';
    ctx.fillRect(0, 0, W, H);

    if (_resultMode && _resultData) {
      _drawRunResult(ctx, W, H); return;
    }

    ctx.fillStyle = '#F5A623';
    ctx.font = 'bold ' + CONFIG.FONT_LG + 'px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🌸 花 壇 🌸', W / 2, PX(60));

    ctx.fillStyle = '#FFD700';
    ctx.font = CONFIG.FONT_BASE + 'px monospace';
    ctx.fillText('✦ ネクター: ' + MetaProgression.getNectar(), W / 2, PX(95));

    var startY = PX(140);
    var itemH = PX(60);

    for (var i = 0; i < BED_KEYS.length; i++) {
      var key = BED_KEYS[i];
      var bed = MetaProgression.FLOWER_BEDS[key];
      var lv = MetaProgression.getBedLevel(key);
      var maxed = MetaProgression.isBedMaxed(key);
      var cost = MetaProgression.getUpgradeCost(key);
      var canBuy = MetaProgression.canUpgrade(key);
      var y = startY + i * itemH;
      var isCurrent = (i === _cursor);

      if (isCurrent) {
        ctx.fillStyle = 'rgba(245, 166, 35, 0.15)';
        ctx.fillRect(PX(60), y - PX(8), W - PX(120), itemH - PX(4));
        ctx.fillStyle = '#F5A623';
        ctx.font = CONFIG.FONT_BASE + 'px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('▶', PX(70), y + PX(18));
      }

      ctx.fillStyle = isCurrent ? '#fff' : '#aaa';
      ctx.font = (isCurrent ? 'bold ' : '') + CONFIG.FONT_BASE + 'px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(bed.icon + ' ' + bed.name, PX(100), y + PX(18));

      var barX = PX(360), barY = y + PX(8), barW = PX(120), barH = PX(16);
      var fillRatio = lv / bed.maxLevel;
      ctx.fillStyle = '#333';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = maxed ? '#27ae60' : '#F5A623';
      ctx.fillRect(barX, barY, barW * fillRatio, barH);
      ctx.strokeStyle = '#555'; ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barW, barH);

      ctx.fillStyle = maxed ? '#27ae60' : '#fff';
      ctx.font = CONFIG.FONT_SM + 'px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(maxed ? 'MAX' : 'Lv.' + lv + '/' + bed.maxLevel, barX + barW / 2, barY + barH - PX(2));

      ctx.textAlign = 'right';
      if (maxed) {
        ctx.fillStyle = '#27ae60';
        ctx.fillText('完了', W - PX(80), y + PX(18));
      } else {
        ctx.fillStyle = canBuy ? '#FFD700' : '#666';
        ctx.fillText('✦ ' + cost, W - PX(80), y + PX(18));
      }

      if (isCurrent) {
        ctx.fillStyle = '#888';
        ctx.font = CONFIG.FONT_SM + 'px monospace';
        ctx.textAlign = 'left';
        var desc = bed.descFn ? bed.descFn(lv) : bed.desc;
        ctx.fillText(desc, PX(100), y + PX(38));
      }
    }

    if (_confirmMode) { _drawConfirmDialog(ctx, W, H); }

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = CONFIG.FONT_SM + 'px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('↑↓: えらぶ　Z/Enter: 強化　Esc: もどる', W / 2, H - PX(20));

    var stats = MetaProgression.getStats();
    ctx.fillStyle = '#555';
    ctx.font = CONFIG.FONT_SM + 'px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('総ラン: ' + stats.totalRuns + '  最高階層: B' + stats.bestFloor + 'F  総撃破: ' + stats.totalKills, PX(20), H - PX(50));
  }

  function _drawConfirmDialog(ctx, W, H) {
    var key = BED_KEYS[_cursor];
    var bed = MetaProgression.FLOWER_BEDS[key];
    var cost = MetaProgression.getUpgradeCost(key);
    var lv = MetaProgression.getBedLevel(key);
    var dw = PX(300), dh = PX(140);
    var dx = (W - dw) / 2, dy = (H - dh) / 2;

    ctx.fillStyle = 'rgba(0,0,0,0.9)';
    ctx.fillRect(dx, dy, dw, dh);
    ctx.strokeStyle = '#F5A623'; ctx.lineWidth = PX(2);
    ctx.strokeRect(dx, dy, dw, dh);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold ' + CONFIG.FONT_BASE + 'px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(bed.icon + ' ' + bed.name, W / 2, dy + PX(35));

    ctx.fillStyle = '#FFD700';
    ctx.font = CONFIG.FONT_BASE + 'px monospace';
    ctx.fillText('Lv.' + lv + ' → Lv.' + (lv + 1), W / 2, dy + PX(65));

    ctx.fillStyle = '#ccc';
    ctx.font = CONFIG.FONT_SM + 'px monospace';
    ctx.fillText('✦ ' + cost + ' ネクターを使いますか？', W / 2, dy + PX(90));

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('Z: 強化する　Esc: やめる', W / 2, dy + PX(115));
  }

  function _drawRunResult(ctx, W, H) {
    var d = _resultData;
    ctx.fillStyle = '#F5A623';
    ctx.font = 'bold ' + CONFIG.FONT_LG + 'px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('冒険の記録', W / 2, PX(70));

    var lines = [];
    if (d.breakdown) {
      if (d.breakdown.normalKills > 0) lines.push('通常撃破: +' + d.breakdown.normalKills + ' ✦');
      if (d.breakdown.eliteKills > 0) lines.push('エリート撃破: +' + d.breakdown.eliteKills + ' ✦');
      if (d.breakdown.bossKills > 0) lines.push('ボス撃破: +' + d.breakdown.bossKills + ' ✦');
      if (d.breakdown.floorBonus > 0) lines.push('階層ボーナス: +' + d.breakdown.floorBonus + ' ✦');
      if (d.breakdown.noDamage > 0) lines.push('無傷ボーナス: +' + d.breakdown.noDamage + ' ✦');
      if (d.breakdown.firstClear > 0) lines.push('初回クリア！: +' + d.breakdown.firstClear + ' ✦');
    }

    ctx.font = CONFIG.FONT_BASE + 'px monospace';
    ctx.fillStyle = '#ccc';
    var y = PX(130);
    for (var i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], W / 2, y);
      y += PX(32);
    }

    y += PX(10);
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold ' + CONFIG.FONT_BASE + 'px monospace';
    ctx.fillText('合計: +' + (d.nectarGain || 0) + ' ✦', W / 2, y);

    y += PX(40);
    ctx.fillStyle = '#fff';
    ctx.fillText('所持ネクター: ' + (d.totalNectar || 0) + ' ✦', W / 2, y);

    if (d.pollenKept > 0) {
      y += PX(32);
      ctx.fillStyle = '#27ae60';
      ctx.fillText('花粉 ' + d.pollenKept + ' を保持！（復活の花壇）', W / 2, y);
    }

    var alpha = Math.sin(_animTimer * 4) > 0 ? 1.0 : 0.3;
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.fillStyle = '#aaa';
    ctx.font = CONFIG.FONT_SM + 'px monospace';
    ctx.fillText('Z / Enter で花壇へ', W / 2, H - PX(40));
    ctx.restore();
  }

  return {
    open: open, close: close, isOpen: isOpen,
    showRunResult: showRunResult, update: update, draw: draw
  };
})();
