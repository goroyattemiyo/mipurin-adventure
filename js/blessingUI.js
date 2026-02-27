/**
 * blessingUI.js - Blessing selection UI
 */
window.BlessingUI = (() => {
  let _active = false;
  let _choices = [];
  let _selectedIndex = 0;
  let _onSelect = null;

  const FAMILY_LABELS = {
    rose: 'Rose',
    lily: 'Lily',
    sunflower: 'Sunflower',
    wisteria: 'Wisteria',
    lotus: 'Lotus',
    chrysanthemum: 'Chrysanthemum'
  };

  function isActive() { return _active; }

  function show(choices, callback) {
    _active = true;
    _choices = Array.isArray(choices) ? choices : [];
    _selectedIndex = 0;
    _onSelect = callback || null;
  }

  function hide() {
    _active = false;
    _choices = [];
    _selectedIndex = 0;
    _onSelect = null;
  }

  function handleInput() {
    if (!_active) return;
    if (typeof Engine === 'undefined') return;
    if (Engine.consumePress('left')) {
      _selectedIndex = (_selectedIndex - 1 + _choices.length) % _choices.length;
      if (typeof Audio !== 'undefined') Audio.playSe('menu_move');
    }
    if (Engine.consumePress('right')) {
      _selectedIndex = (_selectedIndex + 1) % _choices.length;
      if (typeof Audio !== 'undefined') Audio.playSe('menu_move');
    }
    if (Engine.consumePress('interact') || Engine.consumePress('attack')) {
      if (_onSelect && _choices[_selectedIndex]) {
        _onSelect(_choices[_selectedIndex]);
        if (typeof Audio !== 'undefined') Audio.playSe('menu_select');
      }
      hide();
    }
  }

  function _drawRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function _wrapText(ctx, text, maxWidth) {
    const lines = [];
    let current = '';
    const chars = (text || '').split('');
    for (const ch of chars) {
      const next = current + ch;
      if (ctx.measureText(next).width > maxWidth && current) {
        lines.push(current);
        current = ch;
      } else {
        current = next;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  function draw(ctx, canvasWidth, canvasHeight) {
    if (!_active) return;

    const colors = (typeof Blessings !== 'undefined') ? Blessings.FAMILY_COLORS : {};
    const W = canvasWidth;
    const H = canvasHeight;

    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = `bold ${CONFIG.FONT_LG}px monospace`;
    ctx.fillText('祝福を選んでください', W / 2, 60);

    const cardW = 200;
    const cardH = 280;
    const gap = 30;
    const totalW = _choices.length * cardW + Math.max(0, _choices.length - 1) * gap;
    const startX = Math.floor((W - totalW) / 2);
    const startY = Math.floor(H / 2 - cardH / 2);

    for (let i = 0; i < _choices.length; i++) {
      const blessing = _choices[i];
      const isSelected = i === _selectedIndex;
      const x = startX + i * (cardW + gap);
      const y = startY + (isSelected ? -10 : 0);

      ctx.save();
      if (isSelected) {
        ctx.shadowColor = 'rgba(255,255,255,0.6)';
        ctx.shadowBlur = 20;
      }
      ctx.fillStyle = 'rgba(20,20,30,0.95)';
      _drawRoundRect(ctx, x, y, cardW, cardH, 12);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = colors[blessing.family] || '#fff';
      ctx.stroke();
      ctx.restore();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#fff';
      ctx.font = '64px monospace';
      ctx.fillText(blessing.icon || '❖', x + cardW / 2, y + 18);

      ctx.font = `${CONFIG.FONT_BASE}px monospace`;
      ctx.fillText(blessing.name || '', x + cardW / 2, y + 100);

      ctx.font = `${CONFIG.FONT_SM}px monospace`;
      ctx.fillStyle = '#ddd';
      ctx.fillText(FAMILY_LABELS[blessing.family] || blessing.family || '', x + cardW / 2, y + 140);

      const descX = x + 16;
      const descY = y + 170;
      const descW = cardW - 32;
      ctx.font = `${CONFIG.FONT_SM}px monospace`;
      ctx.fillStyle = '#f0f0f0';
      const lines = _wrapText(ctx, blessing.description || '', descW);
      for (let l = 0; l < Math.min(lines.length, 4); l++) {
        ctx.fillText(lines[l], x + cardW / 2, descY + l * 22);
      }

      if (blessing.rarity === 'rare') {
        ctx.fillStyle = '#f5d142';
        ctx.font = `${CONFIG.FONT_SM}px monospace`;
        ctx.textAlign = 'right';
        ctx.fillText('レア', x + cardW - 10, y + 8);
      }
    }

    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.font = `${CONFIG.FONT_SM}px monospace`;
    ctx.fillText('←→で選択、Eで決定', W / 2, H - 40);
  }

  return { isActive, show, hide, handleInput, draw };
})();
