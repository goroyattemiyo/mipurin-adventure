/**
 * collection.js - 図鑑・コレクション管理
 * ミプリンの冒険 v0.5.0
 */
const Collection = (() => {

  /* ============ カテゴリ定義 ============ */
  const CATEGORY = {
    ENEMY: 'enemy',
    ITEM: 'item',
    ENVIRONMENT: 'environment',
    SECRET: 'secret'
  };

  /* ============ 図鑑エントリ定義（46種） ============ */
  const ENTRIES = {

    /* --- 敵 20種 --- */
    poison_mushroom:  { id:'poison_mushroom',  cat:CATEGORY.ENEMY, name:'ドクキノコ',       desc:'南の森に住む毒キノコ。闇胞子に感染して凶暴化した。元はただのキノコだった。', icon:'🍄', color:'#9B59B6' },
    green_slime:      { id:'green_slime',      cat:CATEGORY.ENEMY, name:'ミドリスライム',   desc:'南の森に生息するスライム。好奇心が強く、近づいてくる。', icon:'🟢', color:'#2ECC71' },
    spider:           { id:'spider',           cat:CATEGORY.ENEMY, name:'クモ',             desc:'南の森の暗がりに潜む。待ち伏せが得意。', icon:'🕷', color:'#555' },
    bomb_mushroom:    { id:'bomb_mushroom',    cat:CATEGORY.ENEMY, name:'バクダンキノコ',   desc:'北の森に住む危険なキノコ。近づくと爆発する。', icon:'💥', color:'#E74C3C' },
    dark_slime:       { id:'dark_slime',       cat:CATEGORY.ENEMY, name:'ヤミスライム',     desc:'闇胞子に深く侵された紫のスライム。動きが速い。', icon:'🟣', color:'#8E44AD' },
    bat:              { id:'bat',              cat:CATEGORY.ENEMY, name:'コウモリ',         desc:'洞窟に住む飛行生物。素早く急降下してくる。', icon:'🦇', color:'#7F8C8D' },
    ice_worm:         { id:'ice_worm',         cat:CATEGORY.ENEMY, name:'コオリムシ',       desc:'洞窟の氷壁に棲む虫。地中に潜って奇襲する。', icon:'🐛', color:'#3498DB' },
    dark_flower:      { id:'dark_flower',      cat:CATEGORY.ENEMY, name:'ヤミバナ',         desc:'花畑を侵食する闇の花。根で攻撃してくる。', icon:'🌸', color:'#1A1A2A' },
    shadow_bee:       { id:'shadow_bee',       cat:CATEGORY.ENEMY, name:'カゲバチ',         desc:'闇蜂女王に操られた蜂。かつては仲間だったかもしれない。', icon:'🐝', color:'#2C3E50' },
    // HSLシフトで展開されるバリアント（図鑑上は別エントリ）
    red_slime:        { id:'red_slime',        cat:CATEGORY.ENEMY, name:'アカスライム',     desc:'炎の洞窟に生息するスライムの亜種。', icon:'🔴', color:'#E74C3C' },
    blue_mushroom:    { id:'blue_mushroom',    cat:CATEGORY.ENEMY, name:'コオリキノコ',     desc:'極寒の洞窟に適応した青いキノコ。', icon:'🍄', color:'#3498DB' },
    gold_spider:      { id:'gold_spider',      cat:CATEGORY.ENEMY, name:'キンクモ',         desc:'黄金の糸を張る珍しいクモ。巣窟の深部に出現。', icon:'🕷', color:'#F5A623' },
    mega_bat:         { id:'mega_bat',         cat:CATEGORY.ENEMY, name:'オオコウモリ',     desc:'通常の3倍の大きさ。巣窟深部の主。', icon:'🦇', color:'#2C3E50' },
    abyss_worm:       { id:'abyss_worm',       cat:CATEGORY.ENEMY, name:'シンエンムシ',     desc:'深淵から這い出る巨大な虫。', icon:'🐛', color:'#1A1A2A' },
    fire_flower:      { id:'fire_flower',      cat:CATEGORY.ENEMY, name:'ヒバナ',           desc:'炎をまとった花。触れると火傷する。', icon:'🌺', color:'#E74C3C' },
    ice_bee:          { id:'ice_bee',          cat:CATEGORY.ENEMY, name:'コオリバチ',       desc:'氷の力を持つ蜂。巣窟の寒冷層に出現。', icon:'🐝', color:'#AED6F1' },
    crystal_slime:    { id:'crystal_slime',    cat:CATEGORY.ENEMY, name:'クリスタルスライム', desc:'水晶のように透き通ったスライム。硬い。', icon:'💎', color:'#BDC3C7' },
    mushroom_king:    { id:'mushroom_king',    cat:CATEGORY.ENEMY, name:'マッシュルーム王', desc:'北の森の王。巨大な体から胞子をまき散らす。', icon:'👑', color:'#E74C3C' },
    ice_beetle:       { id:'ice_beetle',       cat:CATEGORY.ENEMY, name:'氷カブトムシ',     desc:'洞窟の深部に棲む巨大カブトムシ。氷弾を放つ。', icon:'🪲', color:'#3498DB' },
    dark_queen:       { id:'dark_queen',       cat:CATEGORY.ENEMY, name:'闇蜂女王レイラ',   desc:'闇に蝕まれた女王。その瞳には時折優しい光が宿る。', icon:'👸', color:'#1A1A2A' },

    /* --- アイテム 15種 --- */
    item_piece_a:     { id:'item_piece_a',     cat:CATEGORY.ITEM, name:'黄金蜂蜜のかけらA', desc:'温かい光を放つ蜂蜜の結晶。', icon:'✦', color:'#F5A623' },
    item_piece_b:     { id:'item_piece_b',     cat:CATEGORY.ITEM, name:'黄金蜂蜜のかけらB', desc:'冷たいが脈打つ蜂蜜の結晶。', icon:'✦', color:'#F5A623' },
    item_piece_c:     { id:'item_piece_c',     cat:CATEGORY.ITEM, name:'黄金蜂蜜のかけらC', desc:'最後の蜂蜜の結晶。', icon:'✦', color:'#F5A623' },
    item_pollen:      { id:'item_pollen',      cat:CATEGORY.ITEM, name:'ポーレン', desc:'花粉の通貨。少し甘い。', icon:'●', color:'#F1C40F' },
    item_royal_jelly: { id:'item_royal_jelly', cat:CATEGORY.ITEM, name:'ロイヤルゼリー', desc:'HP全回復の貴重品。', icon:'◆', color:'#E8D44D' },
    item_wax_shield:  { id:'item_wax_shield',  cat:CATEGORY.ITEM, name:'蜜蝋の盾', desc:'一時的に防御力アップ。', icon:'🛡', color:'#D4A03C' },
    item_pollen_bomb: { id:'item_pollen_bomb', cat:CATEGORY.ITEM, name:'花粉弾', desc:'範囲ダメージを与える。', icon:'💣', color:'#E67E22' },
    item_speed_honey: { id:'item_speed_honey', cat:CATEGORY.ITEM, name:'速蜜ドリンク', desc:'移動速度アップ。', icon:'⚡', color:'#3498DB' },
    item_green_key:   { id:'item_green_key',   cat:CATEGORY.ITEM, name:'秘密の鍵', desc:'父が遺した鍵。', icon:'🗝', color:'#2ECC71' },
    item_torch:       { id:'item_torch',       cat:CATEGORY.ITEM, name:'松明', desc:'洞窟の視界を広げる。', icon:'🔥', color:'#E74C3C' },
    item_antidote:    { id:'item_antidote',    cat:CATEGORY.ITEM, name:'解毒草', desc:'毒を治す薬草。', icon:'🌿', color:'#27AE60' },
    item_hard_candy:  { id:'item_hard_candy',  cat:CATEGORY.ITEM, name:'堅蜜キャンディ', desc:'攻撃力アップ。硬い。', icon:'🍬', color:'#C0392B' },
    item_queens_tear: { id:'item_queens_tear', cat:CATEGORY.ITEM, name:'女王の涙', desc:'レイラの涙の結晶。', icon:'💧', color:'#AED6F1' },
    item_ancient_map: { id:'item_ancient_map', cat:CATEGORY.ITEM, name:'古い地図', desc:'巣窟ミニマップ解放。', icon:'🗺', color:'#BDC3C7' },
    item_hana_pot:    { id:'item_hana_pot',    cat:CATEGORY.ITEM, name:'ハナの蜂蜜ポット', desc:'母の形見。マルシェが預かっていた。', icon:'🍯', color:'#F5A623' },

    /* --- 環境 10種 --- */
    env_village:      { id:'env_village',      cat:CATEGORY.ENVIRONMENT, name:'ハニーヴィル村', desc:'ミプリンが暮らす小さな村。温かい蜂蜜の香りがする。', icon:'🏠', color:'#F5A623' },
    env_forest_south: { id:'env_forest_south', cat:CATEGORY.ENVIRONMENT, name:'南の森', desc:'村の南に広がる森。最近モンスターが出るように。', icon:'🌲', color:'#27AE60' },
    env_forest_north: { id:'env_forest_north', cat:CATEGORY.ENVIRONMENT, name:'北の森', desc:'深い森。マッシュルーム王が棲む。', icon:'🌳', color:'#1E8449' },
    env_cave:         { id:'env_cave',         cat:CATEGORY.ENVIRONMENT, name:'水晶洞窟', desc:'水晶が輝く洞窟。グランパが番をしている。', icon:'💎', color:'#3498DB' },
    env_flower:       { id:'env_flower',       cat:CATEGORY.ENVIRONMENT, name:'花畑', desc:'かつて美しかった花畑。今は闇に染まりつつある。', icon:'🌸', color:'#E91E63' },
    env_save:         { id:'env_save',         cat:CATEGORY.ENVIRONMENT, name:'セーブポイント', desc:'冒険を記録できる蜂蜜の泉。', icon:'💾', color:'#F5A623' },
    env_stump:        { id:'env_stump',        cat:CATEGORY.ENVIRONMENT, name:'隠し切株', desc:'タイガが最後に座った切株。中に秘密の鍵が。', icon:'🪵', color:'#8B4513' },
    env_seal_wall:    { id:'env_seal_wall',    cat:CATEGORY.ENVIRONMENT, name:'封印壁', desc:'緑の水晶で封印された壁。秘密の鍵で開く。', icon:'🧱', color:'#2ECC71' },
    env_crystal_pool: { id:'env_crystal_pool', cat:CATEGORY.ENVIRONMENT, name:'水晶の泉', desc:'グランパの腕の闇を抑えている泉。', icon:'🔮', color:'#AED6F1' },
    env_dark_tree:    { id:'env_dark_tree',    cat:CATEGORY.ENVIRONMENT, name:'闇の大樹', desc:'花畑の中心に立つ黒い大樹。闇胞子の源。', icon:'🌑', color:'#1A1A2A' },

    /* --- 秘密 1種 --- */
    secret_twin_pots: { id:'secret_twin_pots', cat:CATEGORY.SECRET, name:'二つの蜂蜜ポット', desc:'花畑の奥に並んでいた、古い二つのポット。', icon:'🍯', color:'#F5A623' }
  };

  const TOTAL_ENTRIES = Object.keys(ENTRIES).length; // 46

  /* ============ 発見状態 ============ */
  const STORAGE_KEY = 'mipurin_collection';
  let _discovered = {}; // { entryId: { date: timestamp } }

  function _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) _discovered = JSON.parse(raw);
    } catch (e) { _discovered = {}; }
  }

  function _save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(_discovered)); }
    catch (e) {}
  }

  function init() { _load(); }

  /** エントリを発見済みにする */
  function discover(entryId) {
    if (!ENTRIES[entryId]) return false;
    if (_discovered[entryId]) return false; // 既に発見済み
    _discovered[entryId] = { date: Date.now() };
    _save();
    return true; // 新発見
  }

  function isDiscovered(entryId) {
    return !!_discovered[entryId];
  }

  function getDiscoveredCount() {
    return Object.keys(_discovered).length;
  }

  function getProgress() {
    return { discovered: getDiscoveredCount(), total: TOTAL_ENTRIES };
  }

  function getByCategory(cat) {
    return Object.values(ENTRIES).filter(e => e.cat === cat);
  }

  function getAllEntries() {
    return Object.values(ENTRIES);
  }

  /* ============ 図鑑画面 ============ */
  let _isOpen = false;
  let _cursor = 0;
  let _categoryIdx = 0;
  const _categories = [CATEGORY.ENEMY, CATEGORY.ITEM, CATEGORY.ENVIRONMENT, CATEGORY.SECRET];
  const _categoryNames = { enemy:'てき', item:'アイテム', environment:'ばしょ', secret:'ひみつ' };

  function open() { _isOpen = true; _cursor = 0; _categoryIdx = 0; }
  function close() { _isOpen = false; }
  function isOpen() { return _isOpen; }

  function updateUI() {
    if (!_isOpen) return;
    if (Engine.consumePress('menu') || Engine.consumePress('inventory')) { close(); return; }
    if (Engine.consumePress('left'))  _categoryIdx = (_categoryIdx - 1 + _categories.length) % _categories.length;
    if (Engine.consumePress('right')) _categoryIdx = (_categoryIdx + 1) % _categories.length;

    const entries = getByCategory(_categories[_categoryIdx]);
    if (Engine.consumePress('up'))   _cursor = Math.max(0, _cursor - 1);
    if (Engine.consumePress('down')) _cursor = Math.min(entries.length - 1, _cursor + 1);
    // カテゴリ変更時にカーソルリセット
    _cursor = Math.min(_cursor, entries.length - 1);
    if (_cursor < 0) _cursor = 0;
  }

  function drawUI(ctx) {
    if (!_isOpen) return;
    const W = CONFIG.CANVAS_WIDTH, H = CONFIG.CANVAS_HEIGHT;
    const bx = 60, by = 30, bw = W - 120, bh = H - 60;

    // 背景
    ctx.fillStyle = 'rgba(0,0,0,0.92)';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#F5A623'; ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);

    // タイトル
    const prog = getProgress();
    ctx.fillStyle = '#F5A623'; ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('ずかん (' + prog.discovered + '/' + prog.total + ')', W / 2, by + 10);

    // カテゴリタブ
    const tabY = by + 42;
    const tabW = bw / _categories.length;
    for (let i = 0; i < _categories.length; i++) {
      const tx = bx + i * tabW;
      const active = (i === _categoryIdx);
      ctx.fillStyle = active ? 'rgba(245,166,35,0.3)' : 'transparent';
      ctx.fillRect(tx, tabY, tabW, 24);
      ctx.fillStyle = active ? '#F5A623' : '#888';
      ctx.font = active ? 'bold 14px monospace' : '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(_categoryNames[_categories[i]], tx + tabW / 2, tabY + 5);
    }

    // エントリ一覧
    const entries = getByCategory(_categories[_categoryIdx]);
    const listY = tabY + 34;
    const lineH = 24;
    const maxVisible = Math.floor((bh - (listY - by) - 80) / lineH);
    const scrollOffset = Math.max(0, _cursor - maxVisible + 1);

    ctx.textAlign = 'left'; ctx.font = '15px monospace';
    for (let i = scrollOffset; i < entries.length && (i - scrollOffset) < maxVisible; i++) {
      const entry = entries[i];
      const y = listY + (i - scrollOffset) * lineH;
      const found = isDiscovered(entry.id);
      const selected = (i === _cursor);

      if (selected) {
        ctx.fillStyle = 'rgba(245,166,35,0.15)';
        ctx.fillRect(bx + 8, y - 2, bw - 16, lineH);
      }

      if (found) {
        if (selected) { ctx.fillStyle = '#F5A623'; ctx.fillText('▶', bx + 12, y); }
        ctx.fillStyle = entry.color;
        ctx.fillText(entry.icon, bx + 32, y);
        ctx.fillStyle = selected ? '#fff' : '#ccc';
        ctx.fillText(entry.name, bx + 56, y);
      } else {
        ctx.fillStyle = '#555';
        ctx.fillText('？', bx + 32, y);
        ctx.fillText('？？？？？', bx + 56, y);
      }
    }

    // 選択中の説明文
    if (entries[_cursor] && isDiscovered(entries[_cursor].id)) {
      const entry = entries[_cursor];
      const descY = by + bh - 68;
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect(bx + 8, descY, bw - 16, 56);
      ctx.strokeStyle = '#555'; ctx.lineWidth = 1;
      ctx.strokeRect(bx + 8, descY, bw - 16, 56);
      ctx.fillStyle = '#ddd'; ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      const descLines = entry.desc.match(/.{1,44}/g) || [entry.desc];
      for (let i = 0; i < descLines.length && i < 3; i++) {
        ctx.fillText(descLines[i], bx + 16, descY + 10 + i * 16);
      }
    }

    // 操作ガイド
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('←→: カテゴリ　↑↓: えらぶ　Esc: とじる', W / 2, by + bh - 8);
  }

  /** 敵撃破時に自動登録 */
  function onEnemyKill(enemyId) {
    discover(enemyId);
  }

  /** アイテム取得時に自動登録 */
  function onItemGet(itemId) {
    const entryId = 'item_' + itemId;
    if (ENTRIES[entryId]) discover(entryId);
  }

  /** エリア初訪問時に自動登録 */
  function onAreaVisit(areaName) {
    const entryId = 'env_' + areaName;
    if (ENTRIES[entryId]) discover(entryId);
  }

  /** 特殊発見（切株、封印壁、泉、etc） */
  function onSpecialDiscover(entryId) {
    discover(entryId);
  }

  return {
    CATEGORY, ENTRIES, TOTAL_ENTRIES,
    init, discover, isDiscovered, getDiscoveredCount, getProgress,
    getByCategory, getAllEntries,
    open, close, isOpen, updateUI, drawUI,
    onEnemyKill, onItemGet, onAreaVisit, onSpecialDiscover
  };
})();
