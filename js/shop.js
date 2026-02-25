/**
 * shop.js - スキンショップ・課金UI・Stripe連携・アイテムショップ
 * ミプリンの冒険 v0.5.0
 */
const Shop = (() => {
  const S = CONFIG.SCALE;
  const PX = (v) => v * S;

  /* ============ スキンショップ ============ */
  let _skinsOwned = []; // ['skin_sakura', ...]
  let _currentSkin = null; // 適用中スキン
  let _skinCheckDone = false;

  /** GASからスキン所持情報を取得 */
  async function fetchOwnedSkins() {
    if (!CONFIG.GAS_URL) { _skinCheckDone = true; return; }
    try {
      const uid = SaveManager.getUUID();
      const res = await fetch(CONFIG.GAS_URL + '?action=checkSkin&uid=' + encodeURIComponent(uid));
      const data = await res.json();
      if (data && data.skins) {
        _skinsOwned = data.skins;
        // localStorageにキャッシュ
        _cacheOwnedSkins();
      }
    } catch (e) {
      console.warn('Shop: skin check failed, using cache', e);
      _loadCachedSkins();
    }
    _skinCheckDone = true;
  }

  function _cacheOwnedSkins() {
    try { localStorage.setItem('mipurin_skins_cache', JSON.stringify(_skinsOwned)); } catch (e) {}
  }

  function _loadCachedSkins() {
    try {
      const raw = localStorage.getItem('mipurin_skins_cache');
      if (raw) _skinsOwned = JSON.parse(raw);
    } catch (e) { _skinsOwned = []; }
  }

  function ownsSkin(skinId) { return _skinsOwned.includes(skinId); }
  function getCurrentSkin() { return _currentSkin; }

  function applySkin(skinId) {
    if (!ownsSkin(skinId) && skinId !== null) return false;
    _currentSkin = skinId;
    try { localStorage.setItem('mipurin_current_skin', skinId || ''); } catch (e) {}
    return true;
  }

  function loadCurrentSkin() {
    try {
      const s = localStorage.getItem('mipurin_current_skin');
      if (s && ownsSkin(s)) _currentSkin = s;
    } catch (e) {}
  }

  /** Stripe購入リンクを開く */
  function openPurchase(skinId) {
    if (!CONFIG.STRIPE_ENABLED) {
      if (CONFIG.DEBUG) console.log('Stripe disabled');
      return;
    }
    const skinDef = Balance.SKINS[skinId];
    if (!skinDef) return;
    const uid = SaveManager.getUUID();
    // Payment Link URL は config.js に STRIPE_LINKS として定義する想定
    const link = (CONFIG.STRIPE_LINKS && CONFIG.STRIPE_LINKS[skinId]) || '';
    if (!link) { console.warn('Shop: no payment link for', skinId); return; }
    window.open(link + '?client_reference_id=' + encodeURIComponent(uid), '_blank');
  }

  /* ============ アイテムショップ（ゲーム内通貨） ============ */
  const SHOP_ITEMS = [
    { itemId: 'royal_jelly',  price: 8,  stock: 2 },
    { itemId: 'wax_shield',   price: 5,  stock: 3 },
    { itemId: 'pollen_bomb',  price: 4,  stock: 5 },
    { itemId: 'speed_honey',  price: 6,  stock: 3 },
    { itemId: 'torch',        price: 3,  stock: 5 },
    { itemId: 'antidote',     price: 2,  stock: 5 },
    { itemId: 'hard_candy',   price: 5,  stock: 3 }
  ];

  let _shopStock = []; // 現在の在庫（ゲーム進行中に減少）
  let _shopOpen = false;
  let _shopCursor = 0;
  let _shopTab = 0; // 0: アイテム購入, 1: スキンショップ

  function initShopStock() {
    _shopStock = SHOP_ITEMS.map(s => ({ ...s, remaining: s.stock }));
  }

  function openShop() {
    _shopOpen = true;
    _shopCursor = 0;
    _shopTab = 0;
    if (_shopStock.length === 0) initShopStock();
  }

  function closeShop() { _shopOpen = false; }
  function isShopOpen() { return _shopOpen; }

  function updateShopUI(pollenCount) {
    if (!_shopOpen) return null;

    // タブ切替
    if (Engine.consumePress('left') || Engine.consumePress('right')) {
      _shopTab = _shopTab === 0 ? 1 : 0;
      _shopCursor = 0;
    }

    if (Engine.consumePress('menu')) { closeShop(); return null; }

    if (_shopTab === 0) {
      // アイテムショップ
      if (Engine.consumePress('up'))   _shopCursor = Math.max(0, _shopCursor - 1);
      if (Engine.consumePress('down')) _shopCursor = Math.min(_shopStock.length - 1, _shopCursor + 1);

      if (Engine.consumePress('interact') || Engine.consumePress('attack')) {
        const entry = _shopStock[_shopCursor];
        if (entry && entry.remaining > 0 && pollenCount >= entry.price) {
          entry.remaining--;
          return { action: 'buy_item', itemId: entry.itemId, cost: entry.price };
        }
        return { action: 'cannot_buy' };
      }
    } else {
      // スキンショップ
      const skinKeys = Object.keys(Balance.SKINS);
      if (Engine.consumePress('up'))   _shopCursor = Math.max(0, _shopCursor - 1);
      if (Engine.consumePress('down')) _shopCursor = Math.min(skinKeys.length - 1, _shopCursor + 1);

      if (Engine.consumePress('interact') || Engine.consumePress('attack')) {
        const skinId = skinKeys[_shopCursor];
        if (ownsSkin(skinId)) {
          applySkin(skinId);
          return { action: 'equip_skin', skinId };
        } else {
          openPurchase(skinId);
          return { action: 'purchase_skin', skinId };
        }
      }
    }
    return null;
  }

  function drawShopUI(ctx, pollenCount) {
    if (!_shopOpen) return;
    const bx = CONFIG.PANEL_RIGHT_X + PX(8), by = PX(8), bw = CONFIG.PANEL_RIGHT_W - PX(16), bh = PX(464);

    // 背景
    ctx.fillStyle = 'rgba(0,0,0,0.78)';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#E67E22'; ctx.lineWidth = PX(1);
    ctx.strokeRect(bx, by, bw, bh);

    // タイトル
    ctx.fillStyle = '#E67E22'; ctx.font = `bold ${CONFIG.FONT_BASE}px monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('マルシェの おみせ', bx + bw / 2, by + PX(10));

    // 所持ポーレン
    ctx.fillStyle = '#F1C40F'; ctx.font = `${CONFIG.FONT_SM}px monospace`;
    ctx.textAlign = 'right';
    ctx.fillText('ポーレン: ' + pollenCount, bx + bw - PX(14), by + PX(12));

    // タブ
    const tabY = by + PX(38);
    const tabs = ['アイテム', 'スキン'];
    for (let i = 0; i < tabs.length; i++) {
      const tx = bx + PX(14) + i * PX(120);
      const active = (i === _shopTab);
      ctx.fillStyle = active ? 'rgba(230,126,34,0.3)' : 'transparent';
      ctx.fillRect(tx, tabY, PX(110), PX(22));
      ctx.fillStyle = active ? '#E67E22' : '#888';
      ctx.font = active ? `bold ${CONFIG.FONT_SM}px monospace` : `${CONFIG.FONT_SM}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(tabs[i], tx + PX(55), tabY + PX(4));
    }

    const listY = tabY + PX(34);
    const lineH = PX(28);
    ctx.textAlign = 'left'; ctx.font = `${CONFIG.FONT_SM}px monospace`;

    if (_shopTab === 0) {
      // アイテム一覧
      for (let i = 0; i < _shopStock.length; i++) {
        const entry = _shopStock[i];
        const def = Inventory.ITEM_DEFS[entry.itemId];
        const y = listY + i * lineH;
        const selected = (i === _shopCursor);
        const canBuy = entry.remaining > 0 && pollenCount >= entry.price;

        if (selected) {
          ctx.fillStyle = 'rgba(230,126,34,0.15)';
          ctx.fillRect(bx + PX(10), y - PX(3), bw - PX(20), lineH);
          ctx.fillStyle = '#E67E22'; ctx.fillText('▶', bx + PX(14), y);
        }

        ctx.fillStyle = def ? def.color : '#fff';
        ctx.fillText(def ? def.icon : '?', bx + PX(36), y);
        ctx.fillStyle = canBuy ? (selected ? '#fff' : '#ccc') : '#666';
        ctx.fillText(def ? def.name : entry.itemId, bx + PX(58), y);

        ctx.textAlign = 'right';
        ctx.fillStyle = pollenCount >= entry.price ? '#F1C40F' : '#C0392B';
        ctx.fillText(entry.price + 'P', bx + bw - PX(70), y);
        ctx.fillStyle = entry.remaining > 0 ? '#aaa' : '#666';
        ctx.fillText('残' + entry.remaining, bx + bw - PX(12), y);
        ctx.textAlign = 'left';
      }

      // 選択中の説明
      if (_shopStock[_shopCursor]) {
        const def = Inventory.ITEM_DEFS[_shopStock[_shopCursor].itemId];
        if (def) {
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          ctx.fillRect(bx + PX(10), by + bh - PX(60), bw - PX(20), PX(44));
          ctx.fillStyle = '#ddd'; ctx.font = `${CONFIG.FONT_SM}px monospace`; ctx.textAlign = 'left';
          ctx.fillText(def.desc.substring(0, 34), bx + PX(18), by + bh - PX(42));
        }
      }
    } else {
      // スキン一覧
      const skinKeys = Object.keys(Balance.SKINS);
      for (let i = 0; i < skinKeys.length; i++) {
        const skinId = skinKeys[i];
        const skinDef = Balance.SKINS[skinId];
        const y = listY + i * lineH;
        const selected = (i === _shopCursor);
        const owned = ownsSkin(skinId);
        const equipped = (_currentSkin === skinId);

        if (selected) {
          ctx.fillStyle = 'rgba(230,126,34,0.15)';
          ctx.fillRect(bx + PX(10), y - PX(3), bw - PX(20), lineH);
          ctx.fillStyle = '#E67E22'; ctx.fillText('▶', bx + PX(14), y);
        }

        ctx.fillStyle = selected ? '#fff' : '#ccc';
        ctx.fillText(skinDef.name, bx + PX(34), y);

        ctx.textAlign = 'right';
        if (equipped) {
          ctx.fillStyle = '#2ECC71'; ctx.fillText('そうびちゅう', bx + bw - PX(12), y);
        } else if (owned) {
          ctx.fillStyle = '#3498DB'; ctx.fillText('そうびする', bx + bw - PX(12), y);
        } else {
          ctx.fillStyle = '#F1C40F'; ctx.fillText('¥' + skinDef.price, bx + bw - PX(12), y);
        }
        ctx.textAlign = 'left';
      }

      // Pay-to-Win禁止の注意書き
      ctx.fillStyle = '#888'; ctx.font = `${CONFIG.FONT_SM}px monospace`; ctx.textAlign = 'center';
      ctx.fillText('スキンは見た目だけの変更です', bx + bw / 2, by + bh - PX(60));
    }

    // 操作ガイド
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = `${CONFIG.FONT_SM}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('←→: タブ　↑↓: えらぶ　Z: けってい　Esc: とじる', bx + bw / 2, by + bh - PX(8));
  }

  /* ============ ハイスコア送信 ============ */
  async function submitHighScore(score) {
    if (!CONFIG.GAS_URL) return;
    try {
      const uid = SaveManager.getUUID();
      await fetch(CONFIG.GAS_URL + '?action=highscore&uid=' + encodeURIComponent(uid) + '&score=' + score);
    } catch (e) {
      console.warn('Shop: highscore submit failed', e);
    }
  }

  /* ============ 初期化 ============ */
  function init() {
    _loadCachedSkins();
    loadCurrentSkin();
    initShopStock();
  }

  return {
    init, fetchOwnedSkins, ownsSkin, getCurrentSkin, applySkin, loadCurrentSkin,
    openPurchase, submitHighScore,
    SHOP_ITEMS, initShopStock,
    openShop, closeShop, isShopOpen, updateShopUI, drawShopUI
  };
})();
