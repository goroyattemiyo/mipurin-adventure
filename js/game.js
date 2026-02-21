/**
 * game.js - ゲーム初期化・状態管理・シーン遷移
 * ミプリンの冒険 v0.3.0
 */
const Game = (() => {

  const SCENE = {
    LOADING: 'loading', TITLE: 'title', PROLOGUE: 'prologue',
    MENU: 'menu', VILLAGE: 'village', FOREST_SOUTH: 'forest_south',
    FOREST_NORTH: 'forest_north', CAVE: 'cave', FLOWER_FIELD: 'flower_field',
    BOSS: 'boss', ENDING: 'ending', DUNGEON: 'dungeon', SETTINGS: 'settings'
  };

  let _currentScene = SCENE.LOADING;
  let _prevScene = null;
  let _prologueSeen = false;

  const player = {
    x: 0, y: 0, hp: CONFIG.PLAYER.HP, maxHp: CONFIG.PLAYER.HP,
    atk: CONFIG.PLAYER.ATK, speed: CONFIG.PLAYER.SPEED,
    needleDmg: CONFIG.PLAYER.NEEDLE_DMG,
    dir: 'down', lastInputDir: 'down',
    animFrame: 0, animTimer: 0,
    attackCooldown: 0, needleCooldown: 0,
    inputBuffer: 0, inputBufferAction: null,
    knockback: { x: 0, y: 0, timer: 0 }, hitStopFrames: 0
  };

  const flags = {
    quest_started: false, stump_hint: false, has_green_key: false,
    father_truth: false, seal_hint: false, queen_truth: false,
    seal_opened: false, has_queens_tear: false, has_hana_pot: false,
    honey_rule_known: false, collapse_seen: false,
    piece_a: false, piece_b: false, piece_c: false,
    ending_a_seen: false, ending_b_seen: false, ending_c_seen: false,
    dungeon_unlocked: false, killCount: 0, needleUseCount: 0,
    pacifist_interactions: 0
  };

  const meta = {
    ending_a: false, ending_b: false, ending_c: false,
    dungeon_best: 0, golden_title: false, title_motif: false
  };

  /* ============ ダイアログ ============ */
  let _dialogText = '';
  let _dialogActive = false;
  let _dialogTimer = 0;
  let _dialogChars = 0;
  const DIALOG_SPEED = 0.04; // 1文字あたり秒

  function _showDialog(text) {
    _dialogText = text;
    _dialogActive = true;
    _dialogTimer = 0;
    _dialogChars = 0;
  }

  function _updateDialog(dt) {
    if (!_dialogActive) return;
    _dialogTimer += dt;
    _dialogChars = Math.min(_dialogText.length, Math.floor(_dialogTimer / DIALOG_SPEED));

    if (Engine.consumePress('interact') || Engine.consumePress('attack') || Engine.consumeClick()) {
      if (_dialogChars < _dialogText.length) {
        _dialogChars = _dialogText.length;
        _dialogTimer = _dialogText.length * DIALOG_SPEED;
      } else {
        _dialogActive = false;
      }
    }
  }

  function _drawDialog(ctx) {
    if (!_dialogActive) return;
    const W = CONFIG.CANVAS_WIDTH;
    const H = CONFIG.CANVAS_HEIGHT;
    const bx = 20, by = H - 140, bw = W - 40, bh = 120;

    /* 背景 */
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#F5A623';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);

    /* テキスト */
    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const visibleText = _dialogText.substring(0, _dialogChars);
    const lines = visibleText.split('\n');
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], bx + 16, by + 16 + i * 24);
    }

    /* 続きヒント */
    if (_dialogChars >= _dialogText.length) {
      const blink = Math.sin(Date.now() / 300) > 0;
      if (blink) {
        ctx.fillStyle = '#F5A623';
        ctx.fillText('▼', bx + bw - 32, by + bh - 28);
      }
    }
  }

  /* ============ プロローグ ============ */
  const PROLOGUE_TOTAL = 10;
  const _prologueImages = [];
  let _prologueImagesLoaded = false;
  let _prologueIndex = 0;
  let _prologueAlpha = 0;
  let _prologueTextAlpha = 0;
  let _prologuePhase = 'fadein';
  let _prologueTimer = 0;
  const P_FADE_IN = 1.0, P_HOLD = 3.0, P_FADE_OUT = 0.7, P_TEXT_DELAY = 0.4;

  function _loadPrologueImages() {
    let loaded = 0;
    for (let i = 1; i <= PROLOGUE_TOTAL; i++) {
      const img = new Image();
      const idx = i < 10 ? '0' + i : '' + i;
      img.src = 'assets/prologue/prologue_' + idx + '.webp';
      img.onload = () => { loaded++; if (loaded >= PROLOGUE_TOTAL) _prologueImagesLoaded = true; };
      img.onerror = () => { console.warn('missing:', img.src); loaded++; if (loaded >= PROLOGUE_TOTAL) _prologueImagesLoaded = true; };
      _prologueImages.push(img);
    }
  }

  function _resetPrologue() {
    _prologueIndex = 0; _prologueAlpha = 0; _prologueTextAlpha = 0;
    _prologuePhase = 'fadein'; _prologueTimer = 0;
  }

  function _updatePrologue(dt) {
    if (Engine.consumePress('menu')) { _prologuePhase = 'done'; return; }
    const advance = Engine.consumePress('interact') || Engine.consumePress('attack') || Engine.consumeClick();
    _prologueTimer += dt;
    switch (_prologuePhase) {
      case 'fadein':
        _prologueAlpha = Math.min(1, _prologueTimer / P_FADE_IN);
        _prologueTextAlpha = Math.max(0, Math.min(1, (_prologueTimer - P_TEXT_DELAY) / (P_FADE_IN - P_TEXT_DELAY)));
        if (_prologueTimer >= P_FADE_IN) { _prologuePhase = 'hold'; _prologueTimer = 0; _prologueAlpha = 1; _prologueTextAlpha = 1; }
        if (advance) { _prologuePhase = 'fadeout'; _prologueTimer = 0; }
        break;
      case 'hold':
        _prologueAlpha = 1; _prologueTextAlpha = 1;
        if (_prologueTimer >= P_HOLD || advance) { _prologuePhase = 'fadeout'; _prologueTimer = 0; }
        break;
      case 'fadeout':
        _prologueAlpha = Math.max(0, 1 - _prologueTimer / P_FADE_OUT);
        _prologueTextAlpha = _prologueAlpha;
        if (_prologueTimer >= P_FADE_OUT) {
          _prologueIndex++;
          if (_prologueIndex >= PROLOGUE_TOTAL) { _prologuePhase = 'done'; }
          else { _prologuePhase = 'fadein'; _prologueTimer = 0; _prologueAlpha = 0; _prologueTextAlpha = 0; }
        }
        break;
    }
    if (_prologuePhase === 'done') { _changeScene(SCENE.MENU); }
  }

  function _drawPrologue(ctx) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    if (_prologueIndex >= PROLOGUE_TOTAL) return;
    const img = _prologueImages[_prologueIndex];
    if (!img || !img.complete || !img.naturalWidth) return;
    const scale = Math.min(CONFIG.CANVAS_WIDTH / img.naturalWidth, CONFIG.CANVAS_HEIGHT / img.naturalHeight);
    const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
    const x = (CONFIG.CANVAS_WIDTH - w) / 2, y = (CONFIG.CANVAS_HEIGHT - h) / 2;
    ctx.save(); ctx.globalAlpha = _prologueAlpha; ctx.drawImage(img, x, y, w, h); ctx.restore();
    const idx2 = _prologueIndex + 1;
    const key = 'prologue_' + (idx2 < 10 ? '0' + idx2 : '' + idx2);
    const caption = Lang.t(key);
    if (caption && caption !== key && _prologueTextAlpha > 0) _drawCaptionText(ctx, caption, CONFIG.CANVAS_HEIGHT - 80, _prologueTextAlpha);
    ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = '#fff'; ctx.font = '12px monospace'; ctx.textAlign = 'center';
    ctx.fillText('Enter / タップ で次へ　　Esc でスキップ', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT - 16); ctx.restore();
  }

  function _drawCaptionText(ctx, text, baseY, alpha) {
    const lines = text.split('\n'), lh = 30, startY = baseY - (lines.length - 1) * lh / 2;
    ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '20px monospace';
    for (let i = 0; i < lines.length; i++) {
      const ly = startY + i * lh;
      ctx.globalAlpha = alpha * 0.6; ctx.fillStyle = '#000'; ctx.fillText(lines[i], CONFIG.CANVAS_WIDTH / 2 + 2, ly + 2);
      ctx.globalAlpha = alpha; ctx.fillStyle = '#FFFFFF'; ctx.fillText(lines[i], CONFIG.CANVAS_WIDTH / 2, ly);
    }
    ctx.restore();
  }

  /* ============ タイトル ============ */
  let _titleAlpha = 0, _titleReady = false, _titleTimer = 0;
  function _resetTitle() { _titleAlpha = 0; _titleReady = false; _titleTimer = 0; }

  function _updateTitle(dt) {
    _titleTimer += dt;
    if (_titleAlpha < 1) _titleAlpha = Math.min(1, _titleAlpha + dt * 0.8);
    else _titleReady = true;
    if (_titleReady && (Engine.consumePress('attack') || Engine.consumePress('interact') || Engine.consumeClick())) {
      if (!_prologueSeen) { _prologueSeen = true; _changeScene(SCENE.PROLOGUE); }
      else { _changeScene(SCENE.MENU); }
    }
  }

  function _drawTitle(ctx) {
    ctx.fillStyle = '#1a1a2a'; ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    ctx.save(); ctx.globalAlpha = _titleAlpha;
    ctx.fillStyle = '#F5A623'; ctx.font = 'bold 48px monospace'; ctx.textAlign = 'center';
    ctx.fillText(Lang.t('title'), CONFIG.CANVAS_WIDTH / 2, 280);
    if (_titleReady) {
      if (Math.sin(_titleTimer * 4) > 0) {
        ctx.fillStyle = '#fff'; ctx.font = '18px monospace';
        ctx.fillText(Lang.t('press_start'), CONFIG.CANVAS_WIDTH / 2, 400);
      }
    }
    if (meta.golden_title) { ctx.fillStyle = 'rgba(245,166,35,0.15)'; ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT); }
    ctx.restore();
  }

  /* ============ メニュー ============ */
  const _menuItems = ['menu_story', 'menu_dungeon', 'menu_settings', 'menu_credits'];
  let _menuCursor = 0, _menuAlpha = 0;
  function _resetMenu() { _menuCursor = 0; _menuAlpha = 0; }

  function _updateMenu(dt) {
    _menuAlpha = Math.min(1, _menuAlpha + dt * 2);
    if (Engine.consumePress('up')) _menuCursor = (_menuCursor - 1 + _menuItems.length) % _menuItems.length;
    if (Engine.consumePress('down')) _menuCursor = (_menuCursor + 1) % _menuItems.length;
    if (Engine.consumePress('interact') || Engine.consumePress('attack') || Engine.consumeClick()) {
      const selected = _menuItems[_menuCursor];
      switch (selected) {
        case 'menu_story': _changeScene(SCENE.VILLAGE); break;
        case 'menu_dungeon':
          if (CONFIG.DEBUG) console.log('→ 無限巣窟（未実装）');
          break;
        case 'menu_settings':
          if (CONFIG.DEBUG) console.log('→ せってい（未実装）');
          break;
        case 'menu_credits':
          if (CONFIG.DEBUG) console.log('→ クレジット（未実装）');
          break;
      }
    }
    if (Engine.consumePress('menu')) _changeScene(SCENE.TITLE);
  }

  function _drawMenu(ctx) {
    ctx.fillStyle = '#1a1a2a'; ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    ctx.save(); ctx.globalAlpha = _menuAlpha;
    ctx.fillStyle = '#F5A623'; ctx.font = 'bold 32px monospace'; ctx.textAlign = 'center';
    ctx.fillText(Lang.t('title'), CONFIG.CANVAS_WIDTH / 2, 100);
    for (let i = 0; i < _menuItems.length; i++) {
      const y = 240 + i * 60;
      const cur = (i === _menuCursor);
      if (cur) { ctx.fillStyle = '#F5A623'; ctx.font = '22px monospace'; ctx.textAlign = 'right'; ctx.fillText('▶ ', CONFIG.CANVAS_WIDTH / 2 - 100, y); }
      ctx.fillStyle = cur ? '#F5A623' : '#aaa';
      ctx.font = cur ? 'bold 22px monospace' : '20px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(Lang.t(_menuItems[i]), CONFIG.CANVAS_WIDTH / 2 - 90, y);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '12px monospace'; ctx.textAlign = 'center';
    ctx.fillText('↑↓: えらぶ　Z / Enter: けってい　Esc: もどる', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT - 20);
    ctx.restore();
  }

  /* ============ 村シーン ============ */
  function _initVillage() {
    const map = MapManager.loadMap('village');
    if (map) {
      player.x = map.playerStart.x * CONFIG.TILE_SIZE;
      player.y = map.playerStart.y * CONFIG.TILE_SIZE;
      player.dir = 'down';
    }
    _dialogActive = false;
    if (!flags.quest_started) {
      setTimeout(() => _showDialog(Lang.t('mipurin_home_1')), 500);
    }
  }

  function _updateVillage(dt) {
    /* ダイアログ中は移動停止 */
    if (_dialogActive) {
      _updateDialog(dt);
      return;
    }

    PlayerController.update(player, dt);

    /* インタラクション */
    const interact = PlayerController.checkInteract(player);
    if (interact) {
      switch (interact.type) {
        case 'npc':
          _handleNpcTalk(interact.npc);
          break;
        case 'save':
          _showDialog('セーブポイント\nここで冒険の記録ができます。\n（セーブ機能は後日実装）');
          break;
        case 'sign':
          _showDialog('「南の森には気をつけろ」\n  — 長老ハッチ');
          break;
        case 'chest':
          _showDialog('宝箱はからっぽだった...');
          break;
      }
    }

    /* 出口判定 */
    const exit = PlayerController.checkExit(player);
    if (exit) {
      if (CONFIG.DEBUG) console.log('出口:', exit.to);
      /* 後のフェーズで実装 */
      _showDialog('この先は まだ工事中です...\n（次のフェーズで実装）');
      player.y -= CONFIG.TILE_SIZE;
    }
  }

  function _handleNpcTalk(npc) {
    const key = 'npc_' + npc.id;
    let text = Lang.t(key);
    if (text === key) {
      /* lang/ja.jsonにない場合はデフォルト */
      switch (npc.id) {
        case 'hatch':
          text = '長老ハッチ:\n「ミプリンよ、南の森に黄金蜂蜜の\nかけらがあるという噂じゃ。\n気をつけて行くのじゃぞ。」';
          if (!flags.quest_started) {
            flags.quest_started = true;
            text += '\n\n【クエスト開始: 黄金蜂蜜のかけらを探せ！】';
          }
          break;
        case 'miel':
          text = '占い師ミエル:\n「あなたの瞳に...光が見えます。\nでも、気をつけて。\n針の力は、使うほどに心を蝕みます。」';
          break;
        case 'marche':
          text = '商人マルシェ:\n「いらっしゃい！\nロイヤルゼリーはいかが？\n（ショップは後日オープン！）」';
          break;
        case 'bee':
          text = 'ビー:\n「ねえねえミプリン！\n森の奥に光るキノコがあるんだって！\nぼくも見てみたいなー！」';
          break;
        case 'pore':
          text = 'ポーレ:\n「...みぷりん、気をつけてね。\nわたし、まっててあげるから。」';
          break;
        default:
          text = npc.name + ':\n「...」';
      }
    }
    _showDialog(text);
    flags.pacifist_interactions++;
  }

  function _drawVillage(ctx) {
    MapManager.draw(ctx);
    MapManager.drawNpcs(ctx);
    PlayerController.draw(ctx, player);
    _drawHud(ctx);
    _drawDialog(ctx);
  }

  /* ============ HUD ============ */
  function _drawHud(ctx) {
    const W = CONFIG.CANVAS_WIDTH;
    /* HP */
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(8, 8, 160, 28);
    ctx.fillStyle = '#F5A623';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('HP:', 14, 22);
    for (let i = 0; i < player.maxHp; i++) {
      ctx.fillStyle = i < player.hp ? '#FF6B6B' : '#333';
      ctx.fillRect(46 + i * 20, 12, 16, 16);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.strokeRect(46 + i * 20, 12, 16, 16);
    }

    /* キル数（デバッグ） */
    if (CONFIG.DEBUG) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(W - 120, 8, 112, 20);
      ctx.fillStyle = '#0f0';
      ctx.font = '12px monospace';
      ctx.textAlign = 'right';
      ctx.fillText('Kill:' + flags.killCount + ' Needle:' + flags.needleUseCount, W - 14, 18);
    }
  }

  /* ============ シーン管理 ============ */
  function _changeScene(scene) {
    _prevScene = _currentScene;
    _currentScene = scene;
    _onSceneEnter(scene);
  }

  function _onSceneEnter(scene) {
    switch (scene) {
      case SCENE.TITLE:    _resetTitle();    break;
      case SCENE.PROLOGUE: _resetPrologue(); break;
      case SCENE.MENU:     _resetMenu();     break;
      case SCENE.VILLAGE:  _initVillage();   break;
    }
  }

  /* ============ マスター ============ */
  function _update(dt) {
    switch (_currentScene) {
      case SCENE.TITLE:    _updateTitle(dt);    break;
      case SCENE.PROLOGUE: _updatePrologue(dt); break;
      case SCENE.MENU:     _updateMenu(dt);     break;
      case SCENE.VILLAGE:  _updateVillage(dt);  break;
    }
  }

  function _draw(ctx) {
    switch (_currentScene) {
      case SCENE.TITLE:    _drawTitle(ctx);    break;
      case SCENE.PROLOGUE: _drawPrologue(ctx); break;
      case SCENE.MENU:     _drawMenu(ctx);     break;
      case SCENE.VILLAGE:  _drawVillage(ctx);  break;
      default:
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        break;
    }
    if (CONFIG.DEBUG) {
      ctx.fillStyle = '#0f0'; ctx.font = '12px monospace'; ctx.textAlign = 'left';
      ctx.fillText('Scene: ' + _currentScene + ' | v' + CONFIG.VERSION, 4, CONFIG.CANVAS_HEIGHT - 6);
    }
  }

  /* ============ メタ永続化 ============ */
  function _loadMeta() { try { const s = localStorage.getItem('mipurin_meta'); if (s) Object.assign(meta, JSON.parse(s)); } catch(e){} }
  function _saveMeta() { try { localStorage.setItem('mipurin_meta', JSON.stringify(meta)); } catch(e){} }

  function _setLoadingProgress(p) { const b = document.getElementById('loading-bar-inner'); if (b) b.style.width = p + '%'; }

  /* ============ 起動 ============ */
  async function boot() {
    Engine.init();
    _setLoadingProgress(10);
    await Lang.load(CONFIG.LANG);
    _setLoadingProgress(30);
    _loadPrologueImages();
    _setLoadingProgress(40);
    if (typeof SHEET_LIST !== 'undefined' && SHEET_LIST.length > 0) {
      await TileEngine.loadSheets(SHEET_LIST, (l, t) => _setLoadingProgress(40 + (l / t) * 40));
      TileEngine.init();
    }
    _setLoadingProgress(90);
    _loadMeta();
    _setLoadingProgress(100);
    setTimeout(() => { Engine.showCanvas(); _changeScene(SCENE.TITLE); Engine.start(_update, _draw); }, 300);
  }

  return { boot, SCENE, player, flags, meta, getScene: () => _currentScene };
})();

window.addEventListener('DOMContentLoaded', () => { Game.boot(); });
