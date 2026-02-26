/**
 * loot.js - ドロップ/地面アイテム
 * ミプリンの冒険
 */
const Loot = (() => {
  const _groundItems = []; // { item, x, y, timer, label }
  const GROUND_LIFETIME = 30; // 秒

  // 敵撃破時のドロップ判定
  function rollDrop(enemyId, areaLv, isElite, isBoss) {
    const drops = [];

    // ポーレン（100%ドロップ）
    const basePollen = (Balance.ENEMIES[enemyId] || {}).pollen || 1;
    drops.push({ type: 'pollen', amount: Scaling.enemyPollen(basePollen, areaLv) });

    // 装備ドロップ判定
    const skBonus = (typeof Skills !== 'undefined') ? Skills.getBonus() : {};
    let dropChance = 0.25 + (skBonus.dropRate || 0); // 通常敵 25%
    let minRarity = null;
    if (isElite) { dropChance = 1.0; minRarity = 'rare'; }
    if (isBoss)  { dropChance = 1.0; minRarity = 'unique'; }

    if (Math.random() < dropChance) {
      const item = ItemGen.generate(areaLv, minRarity);
      drops.push({ type: 'equipment', item: item });
    }

    const needleRate = isElite ? Balance.NEEDLE.DROP_RATE_ELITE : Balance.NEEDLE.DROP_RATE_NORMAL;
    if (Math.random() < needleRate) {
      if (typeof Game !== 'undefined' && Game.player) {
        if (Game.player.needles < Game.player.needleMax) {
          Game.player.needles++;
          if (Game.addDropLog) Game.addDropLog('針 +1', '#F5A623');
        }
      }
    }

    // ボスは3個確定ドロップ
    if (isBoss) {
      for (let i = 0; i < 2; i++) {
        drops.push({ type: 'equipment', item: ItemGen.generate(areaLv) });
      }
    }

    return drops;
  }

  // 地面にアイテムを配置
  function spawnOnGround(x, y, drops) {
    for (const drop of drops) {
      if (drop.type === 'pollen') {
        // ポーレンは即時獲得
        Inventory.addItem('pollen', drop.amount);
        continue;
      }
      if (drop.type === 'equipment') {
        const formatted = ItemGen.formatItem(drop.item);
        _groundItems.push({
          item: drop.item,
          x: x + (Math.random() - 0.5) * CONFIG.TILE_SIZE,
          y: y + (Math.random() - 0.5) * CONFIG.TILE_SIZE,
          timer: GROUND_LIFETIME,
          label: formatted.text,
          color: formatted.color
        });
      }
    }
  }

  // 毎フレーム更新（プレイヤーとの拾得判定含む）
  function update(dt, playerX, playerY) {
    const ts = CONFIG.TILE_SIZE;
    const pickupRange = ts * 0.8;

    for (let i = _groundItems.length - 1; i >= 0; i--) {
      const g = _groundItems[i];
      g.timer -= dt;
      if (g.timer <= 0) {
        _groundItems.splice(i, 1);
        continue;
      }

      // 拾得判定
      const dx = playerX + ts/2 - g.x;
      const dy = playerY + ts/2 - g.y;
      if (Math.sqrt(dx*dx + dy*dy) < pickupRange) {
        // インベントリに装備品を追加
        const added = Inventory.addEquipment(g.item);
        if (added) {
          _groundItems.splice(i, 1);
          Audio.playSe('item_get');
          // 拾得ログに追加
          if (typeof Game !== 'undefined' && Game.addDropLog) Game.addDropLog(g.label, g.color);
        }
        // 追加失敗（インベントリ満杯）→ 点滅警告は draw で処理
      }
    }
  }

  // 地面アイテム描画
  function draw(ctx) {
    const ts = CONFIG.TILE_SIZE;
    for (const g of _groundItems) {
      const blink = g.timer < 5 && Math.floor(g.timer * 4) % 2 === 0;
      if (blink) continue;

      // アイテムアイコン（小さい四角 + レアリティ色のグロー）
      ctx.save();
      ctx.shadowColor = g.color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = g.color;
      const size = 10;
      ctx.fillRect(g.x - size/2, g.y - size/2, size, size);
      ctx.restore();

      // ラベル（ディアブロ風の地面テキスト）
      ctx.save();
      ctx.font = `${CONFIG.FONT_SM}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#000';
      ctx.fillText(g.label, g.x + 1, g.y - 12 + 1);
      ctx.fillStyle = g.color;
      ctx.fillText(g.label, g.x, g.y - 12);
      ctx.restore();
    }
  }

  function clear() { _groundItems.length = 0; }

  return { rollDrop, spawnOnGround, update, draw, clear };
})();
