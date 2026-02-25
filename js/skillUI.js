const SkillUI = (() => {
  let _open = false;
  let _treeCursor = 0;
  let _skillCursor = 0;
  const TREE_KEYS = ['attack', 'defense', 'explore'];
  const TREE_LABELS = ['攻撃', '防御', '探索'];
  const TREE_COLORS = ['#f88', '#8bf', '#8f8'];

  function open() { _open = true; _treeCursor = 0; _skillCursor = 0; }
  function close() { _open = false; }
  function isOpen() { return _open; }

  function update() {
    if (!_open) return;

    if (Engine.consumePress('skill') || Engine.consumePress('menu')) {
      close(); Audio.playSe('cancel'); return;
    }

    if (Engine.consumePress('left')) {
      _treeCursor = (_treeCursor - 1 + 3) % 3;
      _skillCursor = 0;
      Audio.playSe('cursor');
    }
    if (Engine.consumePress('right')) {
      _treeCursor = (_treeCursor + 1) % 3;
      _skillCursor = 0;
      Audio.playSe('cursor');
    }
    if (Engine.consumePress('up')) {
      _skillCursor = Math.max(0, _skillCursor - 1);
      Audio.playSe('cursor');
    }
    if (Engine.consumePress('down')) {
      _skillCursor = Math.min(4, _skillCursor + 1);
      Audio.playSe('cursor');
    }

    if (Engine.consumePress('attack')) {
      const tree = Skills.getTree()[TREE_KEYS[_treeCursor]];
      const skill = tree[_skillCursor];
      if (Skills.allocate(skill.id)) {
        Game.player.skillPoints = Skills.getPoints();
        Audio.playSe('level_up');
        EquipmentUI.applyStats();
      } else {
        Audio.playSe('empty');
      }
    }
  }

  function draw(ctx) {
    if (!_open) return;

    const W = CONFIG.CANVAS_WIDTH;
    const H = CONFIG.CANVAS_HEIGHT;
    const PX = CONFIG.PX || (v => v);

    ctx.fillStyle = 'rgba(0,0,0,0.9)';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#fff';
    ctx.font = `${CONFIG.FONT_BASE}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('― スキルツリー ―', W / 2, PX(18));

    ctx.fillStyle = '#ff0';
    ctx.font = `${CONFIG.FONT_SM}px monospace`;
    ctx.fillText(`SP: ${Skills.getPoints()}`, W / 2, PX(32));

    const tabW = Math.floor(W / 3);
    for (let i = 0; i < 3; i++) {
      const tx = tabW * i;
      ctx.fillStyle = _treeCursor === i ? TREE_COLORS[i] : '#444';
      ctx.fillRect(tx + PX(2), PX(38), tabW - PX(4), PX(16));
      ctx.fillStyle = _treeCursor === i ? '#000' : '#888';
      ctx.font = `${CONFIG.FONT_SM}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(TREE_LABELS[i], tx + tabW / 2, PX(49));
    }

    const tree = Skills.getTree()[TREE_KEYS[_treeCursor]];
    const startY = PX(62);
    const lineH = PX(26);

    for (let i = 0; i < tree.length; i++) {
      const skill = tree[i];
      const y = startY + i * lineH;
      const lv = Skills.getLevel(skill.id);

      if (_skillCursor === i) {
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(PX(8), y - PX(2), W - PX(16), lineH - PX(2));
      }

      ctx.textAlign = 'left';
      ctx.fillStyle = lv >= skill.maxLv ? '#ff0' : '#fff';
      ctx.font = `${CONFIG.FONT_SM}px monospace`;
      ctx.fillText(skill.name, PX(16), y + PX(10));

      const barX = PX(110);
      const barW = PX(60);
      const barH = PX(8);
      const barY = y + PX(5);
      ctx.fillStyle = '#333';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = TREE_COLORS[_treeCursor];
      ctx.fillRect(barX, barY, barW * (lv / skill.maxLv), barH);
      ctx.strokeStyle = '#666';
      ctx.strokeRect(barX, barY, barW, barH);

      ctx.fillStyle = '#ccc';
      ctx.fillText(`${lv}/${skill.maxLv}`, barX + barW + PX(6), y + PX(10));

      ctx.fillStyle = '#888';
      ctx.textAlign = 'right';
      ctx.fillText(skill.desc, W - PX(16), y + PX(10));
    }

    const selected = tree[_skillCursor];
    const selLv = Skills.getLevel(selected.id);
    const detY = H - PX(30);
    ctx.fillStyle = 'rgba(0,0,0,0.9)';
    ctx.fillRect(PX(8), detY - PX(4), W - PX(16), PX(28));
    ctx.strokeStyle = TREE_COLORS[_treeCursor];
    ctx.strokeRect(PX(8), detY - PX(4), W - PX(16), PX(28));

    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff';
    ctx.font = `${CONFIG.FONT_SM}px monospace`;
    if (selLv < selected.maxLv) {
      const currentVal = (selected.perLv * selLv).toFixed(1);
      const nextVal = (selected.perLv * (selLv + 1)).toFixed(1);
      ctx.fillText(`現在: ${currentVal}  →  次: ${nextVal}`, PX(16), detY + PX(10));
    } else {
      ctx.fillStyle = '#ff0';
      ctx.fillText('MAX', PX(16), detY + PX(10));
    }

    ctx.fillStyle = '#555';
    ctx.font = `${CONFIG.FONT_SM - 2}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('←→:系統  ↑↓:選択  Z:振る  S:閉じる', W / 2, H - PX(2));
  }

  return { open, close, isOpen, update, draw };
})();
