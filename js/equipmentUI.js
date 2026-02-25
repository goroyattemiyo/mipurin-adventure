const EquipmentUI = (() => {
  let _open = false;
  let _cursorSide = 'equip';
  let _equipCursor = 0;
  let _invCursor = 0;
  let _invItems = [];

  const SLOT_NAMES = ['weapon', 'shield', 'head', 'body', 'accessory1', 'accessory2'];
  const SLOT_LABELS = ['武器', '盾', '頭', '体', 'アクセ1', 'アクセ2'];

  function open() {
    _open = true;
    _cursorSide = 'equip';
    _equipCursor = 0;
    _invCursor = 0;
    _refreshInvItems();
  }

  function close() { _open = false; }
  function isOpen() { return _open; }

  function _refreshInvItems() {
    _invItems = Inventory.getItems().filter(item => item && item.slot);
    _invCursor = Math.min(_invCursor, Math.max(0, _invItems.length - 1));
  }

  function update() {
    if (!_open) return;

    if (Engine.consumePress('equipment') || Engine.consumePress('menu')) {
      close(); Audio.playSe('cancel'); return;
    }

    if (Engine.consumePress('left') || Engine.consumePress('right')) {
      _cursorSide = _cursorSide === 'equip' ? 'inventory' : 'equip';
      Audio.playSe('cursor');
    }

    if (Engine.consumePress('up')) {
      if (_cursorSide === 'equip') _equipCursor = (_equipCursor - 1 + 6) % 6;
      else _invCursor = Math.max(0, _invCursor - 1);
      Audio.playSe('cursor');
    }
    if (Engine.consumePress('down')) {
      if (_cursorSide === 'equip') _equipCursor = (_equipCursor + 1) % 6;
      else _invCursor = Math.min(_invItems.length - 1, _invCursor + 1);
      Audio.playSe('cursor');
    }

    if (Engine.consumePress('attack')) {
      if (_cursorSide === 'equip') {
        const slotName = SLOT_NAMES[_equipCursor];
        const equipped = Equipment.getEquipped(slotName);
        if (equipped) {
          Equipment.unequip(slotName);
          Inventory.addEquipment(equipped);
          Audio.playSe('equip');
          _refreshInvItems();
          applyStats();
        }
      } else {
        if (_invItems.length > 0 && _invItems[_invCursor]) {
          const item = _invItems[_invCursor];
          const slotName = item.slot;
          const current = Equipment.getEquipped(slotName);
          if (current) {
            Equipment.unequip(slotName);
            Inventory.addEquipment(current);
          }
          Inventory.removeItem(item);
          Equipment.equip(slotName, item);
          Audio.playSe('equip');
          _refreshInvItems();
          applyStats();
        }
      }
    }
  }

  function applyStats() {
    const eqBonus = Equipment.getTotalBonus();
    const skBonus = (typeof Skills !== 'undefined') ? Skills.getBonus() : {};
    const base = Balance.PLAYER;
    const p = Game.player;

    p.atk = base.BASE_ATK + (base.ATK_PER_LV * (p.level - 1)) + (eqBonus.atk || 0) + (skBonus.atk || 0);
    p.maxHp = base.BASE_HP + (base.HP_PER_LV * (p.level - 1)) + (eqBonus.hp || 0) + (skBonus.hp || 0);
    p.speed = (base.SPEED || base.BASE_SPEED || 0) + (eqBonus.speed || 0) + (skBonus.speed || 0);

    if (typeof Balance.NEEDLE !== 'undefined') {
      p.needleMax = Balance.NEEDLE.MAX + (skBonus.needleMax || 0);
      if (p.needles > p.needleMax) p.needles = p.needleMax;
    }
    if (p.hp > p.maxHp) p.hp = p.maxHp;
  }

  function draw(ctx) {
    if (!_open) return;

    const W = CONFIG.CANVAS_WIDTH;
    const H = CONFIG.CANVAS_HEIGHT;
    const PX = CONFIG.PX || (v => v);

    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#fff';
    ctx.font = `${CONFIG.FONT_BASE}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('― 装備 ―', W / 2, PX(20));

    const leftX = PX(16);
    const rightX = W / 2 + PX(8);
    const startY = PX(40);
    const lineH = PX(20);

    ctx.textAlign = 'left';
    ctx.font = `${CONFIG.FONT_SM}px monospace`;
    ctx.fillStyle = '#aaa';
    ctx.fillText('【装備中】', leftX, startY - PX(4));

    for (let i = 0; i < 6; i++) {
      const y = startY + i * lineH;
      const slotName = SLOT_NAMES[i];
      const equipped = Equipment.getEquipped(slotName);

      if (_cursorSide === 'equip' && _equipCursor === i) {
        ctx.fillStyle = 'rgba(255,255,100,0.2)';
        ctx.fillRect(leftX - PX(2), y - PX(2), W / 2 - PX(24), lineH);
      }

      ctx.fillStyle = '#888';
      ctx.fillText(`${SLOT_LABELS[i]}:`, leftX, y + PX(10));

      if (equipped) {
        ctx.fillStyle = equipped.rarity ? (ItemGen.RARITY[equipped.rarity]?.color || '#fff') : '#fff';
        ctx.fillText(equipped.name, leftX + PX(48), y + PX(10));
      } else {
        ctx.fillStyle = '#555';
        ctx.fillText('--- 空 ---', leftX + PX(48), y + PX(10));
      }
    }

    ctx.fillStyle = '#aaa';
    ctx.fillText('【所持装備】', rightX, startY - PX(4));

    if (_invItems.length === 0) {
      ctx.fillStyle = '#555';
      ctx.fillText('装備品なし', rightX, startY + PX(10));
    } else {
      const maxVisible = 8;
      const scrollOffset = Math.max(0, _invCursor - maxVisible + 1);
      for (let i = 0; i < maxVisible && i + scrollOffset < _invItems.length; i++) {
        const idx = i + scrollOffset;
        const item = _invItems[idx];
        const y = startY + i * lineH;

        if (_cursorSide === 'inventory' && _invCursor === idx) {
          ctx.fillStyle = 'rgba(100,200,255,0.2)';
          ctx.fillRect(rightX - PX(2), y - PX(2), W / 2 - PX(24), lineH);
        }

        ctx.fillStyle = item.rarity ? (ItemGen.RARITY[item.rarity]?.color || '#fff') : '#fff';
        ctx.fillText(item.name, rightX, y + PX(10));

        ctx.fillStyle = '#666';
        const slotIdx = SLOT_NAMES.indexOf(item.slot);
        if (slotIdx >= 0) ctx.fillText(`[${SLOT_LABELS[slotIdx]}]`, rightX + PX(130), y + PX(10));
      }
    }

    if (_cursorSide === 'inventory' && _invItems.length > 0 && _invItems[_invCursor]) {
      const item = _invItems[_invCursor];
      const equipped = Equipment.getEquipped(item.slot);
      const panelY = H - PX(50);

      ctx.fillStyle = 'rgba(0,0,0,0.9)';
      ctx.fillRect(PX(8), panelY, W - PX(16), PX(44));
      ctx.strokeStyle = '#555';
      ctx.strokeRect(PX(8), panelY, W - PX(16), PX(44));

      ctx.fillStyle = '#fff';
      ctx.font = `${CONFIG.FONT_SM}px monospace`;
      ctx.fillText(`選択: ${item.name}`, PX(16), panelY + PX(14));

      if (equipped) {
        const diffAtk = (item.baseAtk || 0) - (equipped.baseAtk || 0);
        const diffDef = (item.baseDef || 0) - (equipped.baseDef || 0);
        const diffHp = (item.baseHp || 0) - (equipped.baseHp || 0);
        ctx.fillStyle = '#ccc';
        ctx.fillText(`比較: ATK ${diffAtk >= 0 ? '+' : ''}${diffAtk}  DEF ${diffDef >= 0 ? '+' : ''}${diffDef}  HP ${diffHp >= 0 ? '+' : ''}${diffHp}`, PX(16), panelY + PX(32));
      } else {
        ctx.fillStyle = '#8f8';
        ctx.fillText('（空スロットに装備）', PX(16), panelY + PX(32));
      }
    }

    ctx.fillStyle = '#666';
    ctx.font = `${CONFIG.FONT_SM - 2}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('←→:切替  ↑↓:選択  Z:装備/外す  E:閉じる', W / 2, H - PX(4));
  }

  return { open, close, isOpen, update, draw, applyStats };
})();
