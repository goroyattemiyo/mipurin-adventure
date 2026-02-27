/**
 * inventory.js - アイテム管理・図鑑表示
 * ミプリンの冒険 v0.5.0
 */
const Inventory = (() => {
  const S = CONFIG.SCALE;
  const PX = (v) => v * S;

  /* ============ アイテム定義（15種） ============ */
  const ITEM_DEFS = {
    piece_a:        { id:'piece_a',        name:'黄金蜂蜜のかけらA', desc:'北の森で見つけた蜂蜜の結晶。温かい光を放っている。', type:'key', stackable:false, maxStack:1, icon:'✦', color:'#F5A623' },
    piece_b:        { id:'piece_b',        name:'黄金蜂蜜のかけらB', desc:'洞窟の奥で見つけた蜂蜜の結晶。冷たいが確かに脈打っている。', type:'key', stackable:false, maxStack:1, icon:'✦', color:'#F5A623' },
    piece_c:        { id:'piece_c',        name:'黄金蜂蜜のかけらC', desc:'花畑で見つけた最後の蜂蜜の結晶。三つ揃えば…。', type:'key', stackable:false, maxStack:1, icon:'✦', color:'#F5A623' },
    pollen:         { id:'pollen',         name:'ポーレン', desc:'花粉の通貨。少し舐めるとHP1回復。', type:'consumable', stackable:true, maxStack:99, icon:'●', color:'#F1C40F' },
    royal_jelly:    { id:'royal_jelly',    name:'ロイヤルゼリー', desc:'女王蜂の特別な食事。HPを全回復する。', type:'consumable', stackable:true, maxStack:5, icon:'◆', color:'#E8D44D' },
    wax_shield:     { id:'wax_shield',     name:'蜜蝋の盾', desc:'蜜蝋で作られた盾。30秒間、被ダメージ-1。', type:'consumable', stackable:true, maxStack:3, icon:'🛡', color:'#D4A03C' },
    pollen_bomb:    { id:'pollen_bomb',    name:'花粉弾', desc:'周囲の敵に2ダメージ。花粉アレルギーには効果抜群。', type:'consumable', stackable:true, maxStack:5, icon:'💣', color:'#E67E22' },
    speed_honey:    { id:'speed_honey',    name:'速蜜ドリンク', desc:'飲むと20秒間、移動速度1.5倍。ちょっとピリピリする。', type:'consumable', stackable:true, maxStack:3, icon:'⚡', color:'#3498DB' },
    green_key:      { id:'green_key',      name:'秘密の鍵', desc:'父が遺した緑色の鍵。封印壁を開く力がある。', type:'key', stackable:false, maxStack:1, icon:'🗝', color:'#2ECC71' },
    torch:          { id:'torch',          name:'松明', desc:'暗い洞窟の視界を広げる。60秒間有効。', type:'consumable', stackable:true, maxStack:3, icon:'🔥', color:'#E74C3C' },
    antidote:       { id:'antidote',       name:'解毒草', desc:'毒状態を回復する薬草。苦い。', type:'consumable', stackable:true, maxStack:5, icon:'🌿', color:'#27AE60' },
    hard_candy:     { id:'hard_candy',     name:'堅蜜キャンディ', desc:'30秒間、攻撃力+1。噛むと歯が折れそうに硬い。', type:'consumable', stackable:true, maxStack:3, icon:'🍬', color:'#C0392B' },
    queens_tear:    { id:'queens_tear',    name:'女王の涙', desc:'レイラの涙が結晶化したもの。温かい。', type:'key', stackable:false, maxStack:1, icon:'💧', color:'#AED6F1' },
    ancient_map:    { id:'ancient_map',    name:'古い地図', desc:'巣窟のミニマップが使えるようになる。', type:'key', stackable:false, maxStack:1, icon:'🗺', color:'#BDC3C7' },
    nest_key:       { id:'nest_key',       name:'巣窟鍵', desc:'巣窟のボス部屋を開ける鍵。', type:'consumable', stackable:true, maxStack:3, icon:'🔑', color:'#95A5A6' },
    hana_pot:       { id:'hana_pot',       name:'ハナの蜂蜜ポット', desc:'母が使っていた蜂蜜ポット。マルシェが預かっていた。', type:'key', stackable:false, maxStack:1, icon:'🍯', color:'#F5A623' },
    needle_bundle:  { id:'needle_bundle',  name:'針×3', desc:'針の補給パック。', type:'consumable', stackable:true, maxStack:9, icon:'📌', color:'#F5A623' }
  };

  /* ============ インベントリ状態 ============ */
  let _items = []; // { id, count }
  const MAX_SLOTS = 16;
  let _equipmentBag = []; // 装備品
  const MAX_EQUIP_SLOTS = 24;

  function clear() { _items = []; _equipmentBag = []; }

  function addItem(itemId, count) {
    count = count || 1;
    const def = ITEM_DEFS[itemId];
    if (!def) { console.warn('Inventory: unknown item', itemId); return false; }

    const existing = _items.find(i => i.id === itemId);
    if (existing && def.stackable) {
      existing.count = Math.min(existing.count + count, def.maxStack);
      return true;
    }
    if (_items.length > maxVisible) {
      ctx.fillStyle = '#666';
      ctx.fillText('...', bx + bw - PX(30), listBottom - PX(6));
    }
    if (existing && !def.stackable) return false; // 既に所持
    if (_items.length >= MAX_SLOTS) return false; // 空きなし
    _items.push({ id: itemId, count: def.stackable ? Math.min(count, def.maxStack) : 1 });
    return true;
  }

  function removeItem(itemId, count) {
    if (itemId && typeof itemId === 'object') {
      const uid = itemId.uid;
      if (!uid) return false;
      return removeEquipment(uid);
    }
    count = count || 1;
    const idx = _items.findIndex(i => i.id === itemId);
    if (idx === -1) return false;
    _items[idx].count -= count;
    if (_items[idx].count <= 0) _items.splice(idx, 1);
    return true;
  }

  function hasItem(itemId) {
    return _items.some(i => i.id === itemId);
  }

  function getCount(itemId) {
    const item = _items.find(i => i.id === itemId);
    return item ? item.count : 0;
  }

  function getAll() { return _items.map(i => ({ ...i })); }

  function addEquipment(item) {
    if (!item) return false;
    if (_equipmentBag.length >= MAX_EQUIP_SLOTS) return false;
    _equipmentBag.push({ ...item });
    return true;
  }

  function removeEquipment(uid) {
    const idx = _equipmentBag.findIndex(i => i.uid === uid);
    if (idx === -1) return false;
    _equipmentBag.splice(idx, 1);
    return true;
  }

  function getEquipmentBag() { return _equipmentBag.map(i => ({ ...i })); }
  function getItems() { return _equipmentBag; }

  function useItem(itemId, player, flags) {
    if (!hasItem(itemId)) return false;
    const def = ITEM_DEFS[itemId];
    if (def.type === 'key') return false; // キーアイテムは使用不可
    const effect = Balance.ITEM_EFFECTS[itemId];
    if (!effect) return false;

    switch (effect.type) {
      case 'heal':
        player.hp = Math.min(player.maxHp, player.hp + effect.amount);
        break;
      case 'heal_full':
        player.hp = player.maxHp;
        break;
      case 'buff_def':
        player._buffDef = { reduction: effect.reduction, timer: effect.durationSec };
        break;
      case 'buff_speed':
        player._buffSpeed = { multiplier: effect.multiplier, timer: effect.durationSec };
        break;
      case 'buff_atk':
        player._buffAtk = { bonus: effect.bonus, timer: effect.durationSec };
        break;
      case 'aoe_damage':
        if (typeof EnemyManager !== 'undefined') {
          EnemyManager.damageAllInRadius(player.x, player.y, effect.radius * CONFIG.TILE_SIZE, effect.damage, flags);
        }
        break;
      case 'buff_vision':
        player._buffVision = { radius: effect.radiusTiles, timer: effect.durationSec };
        break;
      case 'cure_poison':
        player.poisoned = false;
        break;
      case 'minimap':
        flags.has_minimap = true;
        return true; // 消費しない
      case 'unlock_boss_room':
        // ボス部屋解放は現場で処理
        break;
    }
    removeItem(itemId, 1);
    return true;
  }

  /** バフタイマー更新（毎フレーム呼ぶ） */
  function updateBuffs(player, dt) {
    if (player._buffDef)   { player._buffDef.timer -= dt;   if (player._buffDef.timer <= 0)   player._buffDef = null; }
    if (player._buffSpeed) { player._buffSpeed.timer -= dt; if (player._buffSpeed.timer <= 0) player._buffSpeed = null; }
    if (player._buffAtk)   { player._buffAtk.timer -= dt;   if (player._buffAtk.timer <= 0)   player._buffAtk = null; }
    if (player._buffVision){ player._buffVision.timer -= dt; if (player._buffVision.timer <= 0) player._buffVision = null; }
  }

  /** 実効ステータス取得 */
  function getEffectiveSpeed(player) {
    return player.speed * (player._buffSpeed ? player._buffSpeed.multiplier : 1);
  }
  function getEffectiveAtk(player) {
    return player.atk + (player._buffAtk ? player._buffAtk.bonus : 0);
  }
  function getDefReduction(player) {
    return player._buffDef ? player._buffDef.reduction : 0;
  }

  /** セーブ用シリアライズ */
  function serialize() {
    return {
      items: _items.map(i => ({ ...i })),
      equipmentBag: _equipmentBag.map(i => ({ ...i }))
    };
  }
  function deserialize(data) {
    if (Array.isArray(data)) {
      _items = data.map(i => ({ ...i }));
      _equipmentBag = [];
      return;
    }
    _items = (data && data.items ? data.items : []).map(i => ({ ...i }));
    _equipmentBag = (data && data.equipmentBag ? data.equipmentBag : []).map(i => ({ ...i }));
  }

  /** インベントリ画面描画 */
  let _cursor = 0;
  let _isOpen = false;

  function open() { _isOpen = true; _cursor = 0; }
  function close() { _isOpen = false; }
  function isOpen() { return _isOpen; }

  function updateUI() {
    if (!_isOpen) return;
    if (Engine.consumePress('up'))    _cursor = Math.max(0, _cursor - 1);
    if (Engine.consumePress('down'))  _cursor = Math.min(_items.length - 1, _cursor + 1);
    if (Engine.consumePress('menu') || Engine.consumePress('inventory')) { close(); return; }
    if (Engine.consumePress('interact') || Engine.consumePress('attack')) {
      if (_items[_cursor]) {
        // useは外部から呼ぶ（player参照が必要）
        return { action: 'use', itemId: _items[_cursor].id };
      }
    }
    return null;
  }

  function drawUI(ctx) {
    if (!_isOpen) return;
    const bx = CONFIG.PANEL_RIGHT_X + PX(10), by = PX(10), bw = CONFIG.PANEL_RIGHT_W - PX(20), bh = PX(460);

    // 背景
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#F5A623'; ctx.lineWidth = PX(1);
    ctx.strokeRect(bx, by, bw, bh);

    // タイトル
    ctx.fillStyle = '#F5A623'; ctx.font = `bold ${CONFIG.FONT_BASE}px monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('もちもの', bx + bw / 2, by + PX(12));

    // アイテムリスト
    ctx.textAlign = 'left'; ctx.font = `${CONFIG.FONT_SM}px monospace`;
    const startY = by + PX(50);
    const lineH = PX(32);
    const listBottom = by + bh - PX(72);
    const listHeight = listBottom - startY;
    const maxVisible = Math.max(1, Math.floor(listHeight / lineH));
    const scrollOffset = Math.max(0, _cursor - maxVisible + 1);

    if (_items.length === 0) {
      ctx.fillStyle = '#888';
      ctx.fillText('なにも もっていない', bx + PX(20), startY);
    }

    for (let i = 0; i < maxVisible && i + scrollOffset < _items.length; i++) {
      const idx = i + scrollOffset;
      const item = _items[idx];
      const def = ITEM_DEFS[item.id];
      const y = startY + i * lineH;
      const selected = (idx === _cursor);

      if (selected) {
        ctx.fillStyle = 'rgba(245,166,35,0.2)';
        ctx.fillRect(bx + PX(10), y - PX(4), bw - PX(20), lineH);
        ctx.fillStyle = '#F5A623'; ctx.fillText('▶', bx + PX(14), y);
      }

      ctx.fillStyle = def.color || '#fff';
      ctx.fillText(def.icon, bx + PX(36), y);
      ctx.fillStyle = selected ? '#fff' : '#ccc';
      ctx.fillText(def.name, bx + PX(58), y);
      if (def.stackable && item.count > 1) {
        ctx.fillStyle = '#aaa';
        ctx.fillText('×' + item.count, bx + bw - PX(70), y);
      }
      if (def.type === 'key') {
        ctx.fillStyle = '#F5A623';
        ctx.fillText('[キー]', bx + bw - PX(70), y);
      }
    }

    // 選択中アイテムの説明
    if (_items[_cursor]) {
      const def = ITEM_DEFS[_items[_cursor].id];
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect(bx + PX(10), by + bh - PX(64), bw - PX(20), PX(54));
      ctx.strokeStyle = '#555'; ctx.lineWidth = PX(1);
      ctx.strokeRect(bx + PX(10), by + bh - PX(64), bw - PX(20), PX(54));
      ctx.fillStyle = '#ddd'; ctx.font = `${CONFIG.FONT_SM}px monospace`;
      ctx.textAlign = 'left';
      const descLines = def.desc.match(/.{1,26}/g) || [def.desc];
      for (let i = 0; i < descLines.length && i < 2; i++) {
        ctx.fillText(descLines[i], bx + PX(18), by + bh - PX(50) + i * PX(26));
      }
    }

    // 操作ガイド
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = `${CONFIG.FONT_SM}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('↑↓: えらぶ　Z: つかう　I/Esc: とじる', bx + bw / 2, by + bh - PX(8));
  }

  return {
    ITEM_DEFS, MAX_SLOTS, MAX_EQUIP_SLOTS,
    clear, addItem, removeItem, hasItem, getCount, getAll,
    addEquipment, removeEquipment, getEquipmentBag, getItems,
    useItem, updateBuffs,
    getEffectiveSpeed, getEffectiveAtk, getDefReduction,
    serialize, deserialize,
    open, close, isOpen, updateUI, drawUI
  };
})();
