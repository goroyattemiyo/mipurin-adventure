/**
 * game.js - ゲーム初期化・状態管理・シーン遷移
 * ミプリンの冒険 v0.2.0
 */
const Game = (() => {

  // シーン定数
  const SCENE = {
    LOADING:       'loading',
    TITLE:         'title',
    PROLOGUE:      'prologue',
    MENU:          'menu',
    VILLAGE:       'village',
    FOREST_SOUTH:  'forest_south',
    FOREST_NORTH:  'forest_north',
    CAVE:          'cave',
    FLOWER_FIELD:  'flower_field',
    BOSS:          'boss',
    ENDING:        'ending',
    DUNGEON:       'dungeon',
    SETTINGS:      'settings'
  };

  let _currentScene = SCENE.LOADING;
  let _prevScene = null;
  let _prologueSeen = false;


  // プレイヤー状態
  const player = {
    x: 0, y: 0,
    hp: CONFIG.PLAYER.HP,
    maxHp: CONFIG.PLAYER.HP,
    atk: CONFIG.PLAYER.ATK,
    speed: CONFIG.PLAYER.SPEED,
    needleDmg: CONFIG.PLAYER.NEEDLE_DMG,
    dir: 'down',
    lastInputDir: 'down',
    animFrame: 0,
    animTimer: 0,
    attackCooldown: 0,
    needleCooldown: 0,
    inputBuffer: 0,
    inputBufferAction: null,
    knockback: { x: 0, y: 0, timer: 0 },
    hitStopFrames: 0
  };

  // ゲームフラグ
  const flags = {
    quest_started: false,
    stump_hint: false,
    has_green_key: false,
    father_truth: false,
    seal_hint: false,
    queen_truth: false,
    seal_opened: false,
    has_queens_tear: false,
    has_hana_pot: false,
    honey_rule_known: false,
    collapse_seen: false,
    piece_a: false,
    piece_b: false,
    piece_c: false,
    ending_a_seen: false,
    ending_b_seen: false,
    ending_c_seen: false,
    dungeon_unlocked: false,
    killCount: 0,
    needleUseCount: 0,
    pacifist_interactions: 0
  };

  // メタフラグ（セーブ横断）
  const meta = {
    ending_a: false,
    ending_b: false,
    ending_c: false,
    dungeon_best: 0,
    golden_title: false,
    title_motif: false
  };

  // ──────────────────────────────
  //  プロローグ制御
  // ──────────────────────────────
  const PROLOGUE_TOTAL = 10;
  const _prologueImages = [];
  let _prologueImagesLoaded = false;

  let _prologueIndex = 0;
  let _prologueAlpha = 0;
  let _prologueTextAlpha = 0;
  let _prologuePhase = 'fadein'; // fadein | hold | fadeout | done
  let _prologueTimer = 0;

  // タイミング（秒）
  const P_FADE_IN  = 1.0;
  const P_HOLD     = 3.0;
  const P_FADE_OUT = 0.7;
  const P_TEXT_DELAY = 0.4;  // 画像より少し遅れてテキスト表示

  function _loadPrologueImages() {
    let loaded = 0;
    for (let i = 1; i <= PROLOGUE_TOTAL; i++) {
      const img = new Image();
      const idx = i < 10 ? '0' + i : '' + i;
      img.src = 'assets/prologue/prologue_' + idx + '.webp';
      img.onload = () => {
        loaded++;
        if (loaded >= PROLOGUE_TOTAL) _prologueImagesLoaded = true;
      };
      img.onerror = () => {
        console.warn('prologue image missing:', img.src);
        loaded++;
        if (loaded >= PROLOGUE_TOTAL) _prologueImagesLoaded = true;
      };
      _prologueImages.push(img);
    }
  }

  function _resetPrologue() {
    _prologueIndex = 0;
    _prologueAlpha = 0;
    _prologueTextAlpha = 0;
    _prologuePhase = 'fadein';
    _prologueTimer = 0;
  }

  function _updatePrologue(dt) {
    // スキップ（Esc）
    if (Engine.consumePress('menu')) {
      _prologuePhase = 'done';
      return;
    }

    // 進行入力（Enter / Z / クリック）
    const advance = Engine.consumePress('interact') ||
                    Engine.consumePress('attack') ||
                    Engine.consumeClick();

    _prologueTimer += dt;

    switch (_prologuePhase) {
      case 'fadein':
        _prologueAlpha = Math.min(1, _prologueTimer / P_FADE_IN);
        // テキストは少し遅れて出る
        _prologueTextAlpha = Math.max(0, Math.min(1,
          (_prologueTimer - P_TEXT_DELAY) / (P_FADE_IN - P_TEXT_DELAY)
        ));
        if (_prologueTimer >= P_FADE_IN) {
          _prologuePhase = 'hold';
          _prologueTimer = 0;
          _prologueAlpha = 1;
          _prologueTextAlpha = 1;
        }
        // fadein中でもクリックで即hold→次へ
        if (advance) {
          _prologuePhase = 'fadeout';
          _prologueTimer = 0;
        }
        break;

      case 'hold':
        _prologueAlpha = 1;
        _prologueTextAlpha = 1;
        if (_prologueTimer >= P_HOLD || advance) {
          _prologuePhase = 'fadeout';
          _prologueTimer = 0;
        }
        break;

      case 'fadeout':
        _prologueAlpha = Math.max(0, 1 - _prologueTimer / P_FADE_OUT);
        _prologueTextAlpha = _prologueAlpha;
        if (_prologueTimer >= P_FADE_OUT) {
          _prologueIndex++;
          if (_prologueIndex >= PROLOGUE_TOTAL) {
            _prologuePhase = 'done';
          } else {
            _prologuePhase = 'fadein';
            _prologueTimer = 0;
            _prologueAlpha = 0;
            _prologueTextAlpha = 0;
          }
        }
        break;
    }

    // 完了 → メニューへ
    if (_prologuePhase === 'done') {
      _changeScene(SCENE.MENU);
    }
  }

  function _drawPrologue(ctx) {
    // 黒背景
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    if (_prologueIndex >= PROLOGUE_TOTAL) return;

    const img = _prologueImages[_prologueIndex];
    if (!img || !img.complete || !img.naturalWidth) return;

    // 画像をキャンバス中央にフィット描画
    const scale = Math.min(
      CONFIG.CANVAS_WIDTH / img.naturalWidth,
      CONFIG.CANVAS_HEIGHT / img.naturalHeight
    );
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    const x = (CONFIG.CANVAS_WIDTH - w) / 2;
    const y = (CONFIG.CANVAS_HEIGHT - h) / 2;

    ctx.save();
    ctx.globalAlpha = _prologueAlpha;
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();

    // キャプションテキスト
    const idx = _prologueIndex + 1;
    const key = 'prologue_' + (idx < 10 ? '0' + idx : '' + idx);
    const caption = Lang.t(key);
    if (caption && caption !== key && _prologueTextAlpha > 0) {
      _drawCaptionText(ctx, caption, CONFIG.CANVAS_HEIGHT - 80, _prologueTextAlpha);
    }

    // スキップヒント
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Enter / タップ で次へ　　Esc でスキップ', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT - 16);
    ctx.restore();
  }

  /**
   * テキスト描画（影付き・複数行対応）
   */
  function _drawCaptionText(ctx, text, baseY, alpha) {
    const lines = text.split('\n');
    const lineHeight = 30;
    const startY = baseY - (lines.length - 1) * lineHeight / 2;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '20px monospace';

    for (let i = 0; i < lines.length; i++) {
      const ly = startY + i * lineHeight;

      // 影
      ctx.globalAlpha = alpha * 0.6;
      ctx.fillStyle = '#000';
      ctx.fillText(lines[i], CONFIG.CANVAS_WIDTH / 2 + 2, ly + 2);

      // 本文
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(lines[i], CONFIG.CANVAS_WIDTH / 2, ly);
    }

    ctx.restore();
  }

  // ──────────────────────────────
  //  タイトル画面
  // ──────────────────────────────
  let _titleAlpha = 0;
  let _titleReady = false;
  let _titleTimer = 0;

  function _resetTitle() {
    _titleAlpha = 0;
    _titleReady = false;
    _titleTimer = 0;
  }

  function _updateTitle(dt) {
    _titleTimer += dt;

    if (_titleAlpha < 1) {
      _titleAlpha = Math.min(1, _titleAlpha + dt * 0.8);
    } else {
      _titleReady = true;
    }

    if (_titleReady) {
      if (Engine.consumePress('attack') || Engine.consumePress('interact') || Engine.consumeClick()) {
        if (!_prologueSeen) {
          _prologueSeen = true;
          _changeScene(SCENE.PROLOGUE);
        } else {
          _changeScene(SCENE.MENU);
        }
      }
    }
  }

  function _drawTitle(ctx) {
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    ctx.save();
    ctx.globalAlpha = _titleAlpha;

    // タイトル文字
    ctx.fillStyle = '#F5A623';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(Lang.t('title'), CONFIG.CANVAS_WIDTH / 2, 280);

    // 「クリック or Enterでスタート」
    if (_titleReady) {
      const blink = Math.sin(_titleTimer * 4) > 0;
      if (blink) {
        ctx.fillStyle = '#fff';
        ctx.font = '18px monospace';
        ctx.fillText(Lang.t('press_start'), CONFIG.CANVAS_WIDTH / 2, 400);
      }
    }

    // メタフラグによるタイトル変化（END C クリア後）
    if (meta.golden_title) {
      ctx.fillStyle = 'rgba(245, 166, 35, 0.15)';
      ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    }

    ctx.restore();
  }

  // ──────────────────────────────
  //  メニュー画面
  // ──────────────────────────────
  const _menuItems = ['menu_story', 'menu_dungeon', 'menu_settings', 'menu_credits'];
  let _menuCursor = 0;
  let _menuAlpha = 0;

  function _resetMenu() {
    _menuCursor = 0;
    _menuAlpha = 0;
  }

  function _updateMenu(dt) {
    _menuAlpha = Math.min(1, _menuAlpha + dt * 2);

    if (Engine.consumePress('up')) {
      _menuCursor = (_menuCursor - 1 + _menuItems.length) % _menuItems.length;
    }
    if (Engine.consumePress('down')) {
      _menuCursor = (_menuCursor + 1) % _menuItems.length;
    }

    if (Engine.consumePress('interact') || Engine.consumePress('attack') || Engine.consumeClick()) {
      const selected = _menuItems[_menuCursor];
      if (CONFIG.DEBUG) console.log('メニュー選択:', selected);

      switch (selected) {
        case 'menu_story':
          // 仮: まだ村シーン未実装なのでログだけ
          if (CONFIG.DEBUG) console.log('→ ストーリーモード（未実装）');
          break;
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

    // 戻る
    if (Engine.consumePress('menu')) {
      _changeScene(SCENE.MENU);
    }
  }

  function _drawMenu(ctx) {
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    ctx.save();
    ctx.globalAlpha = _menuAlpha;

    // タイトル小
    ctx.fillStyle = '#F5A623';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(Lang.t('title'), CONFIG.CANVAS_WIDTH / 2, 100);

    // メニュー項目
    for (let i = 0; i < _menuItems.length; i++) {
      const y = 240 + i * 60;
      const isCursor = (i === _menuCursor);

      // カーソル
      if (isCursor) {
        ctx.fillStyle = '#F5A623';
        ctx.font = '22px monospace';
        ctx.textAlign = 'right';
        ctx.fillText('▶ ', CONFIG.CANVAS_WIDTH / 2 - 100, y);
      }

      ctx.fillStyle = isCursor ? '#F5A623' : '#aaa';
      ctx.font = isCursor ? 'bold 22px monospace' : '20px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(Lang.t(_menuItems[i]), CONFIG.CANVAS_WIDTH / 2 - 90, y);
    }

    // 操作ヒント
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('↑↓: えらぶ　Z / Enter: けってい　Esc: もどる', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT - 20);

    ctx.restore();
  }

  // ──────────────────────────────
  //  シーン管理
  // ──────────────────────────────
  function _changeScene(scene) {
    _prevScene = _currentScene;
    _currentScene = scene;
    _onSceneEnter(scene);
  }

  function _onSceneEnter(scene) {
    switch (scene) {
      case SCENE.TITLE:
        _resetTitle();
        break;
      case SCENE.PROLOGUE:
        _resetPrologue();
        break;
      case SCENE.MENU:
        _resetMenu();
        break;
    }
  }

  // ──────────────────────────────
  //  マスター更新・描画
  // ──────────────────────────────
  function _update(dt) {
    switch (_currentScene) {
      case SCENE.TITLE:    _updateTitle(dt);    break;
      case SCENE.PROLOGUE: _updatePrologue(dt); break;
      case SCENE.MENU:     _updateMenu(dt);     break;
    }
  }

  function _draw(ctx) {
    switch (_currentScene) {
      case SCENE.TITLE:    _drawTitle(ctx);    break;
      case SCENE.PROLOGUE: _drawPrologue(ctx); break;
      case SCENE.MENU:     _drawMenu(ctx);     break;
      default:
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        break;
    }

    // デバッグ情報
    if (CONFIG.DEBUG) {
      ctx.fillStyle = '#0f0';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Scene: ' + _currentScene + ' | v' + CONFIG.VERSION, 4, 14);
    }
  }

  // ──────────────────────────────
  //  メタフラグ永続化
  // ──────────────────────────────
  function _loadMeta() {
    try {
      const saved = localStorage.getItem('mipurin_meta');
      if (saved) Object.assign(meta, JSON.parse(saved));
    } catch (e) {
      console.warn('メタフラグ復元失敗');
    }
  }

  function _saveMeta() {
    try {
      localStorage.setItem('mipurin_meta', JSON.stringify(meta));
    } catch (e) {
      console.warn('メタフラグ保存失敗');
    }
  }

  // ──────────────────────────────
  //  ローディング
  // ──────────────────────────────
  function _setLoadingProgress(percent) {
    const bar = document.getElementById('loading-bar-inner');
    if (bar) bar.style.width = percent + '%';
  }

  // ──────────────────────────────
  //  起動
  // ──────────────────────────────
  async function boot() {
    Engine.init();
    _setLoadingProgress(10);

    // 言語読み込み
    await Lang.load(CONFIG.LANG);
    _setLoadingProgress(30);

    // プロローグ画像読み込み開始（非同期、完了を待たない）
    _loadPrologueImages();
    _setLoadingProgress(40);

    // スプライト読み込み（画像完成後に有効化）
    if (SHEET_LIST.length > 0) {
      await TileEngine.loadSheets(SHEET_LIST, (loaded, total) => {
        _setLoadingProgress(40 + (loaded / total) * 40);
      });
      TileEngine.init();
    }
    _setLoadingProgress(90);

    // メタフラグ復元
    _loadMeta();
    _setLoadingProgress(100);

    // ロード完了 → タイトルへ
    setTimeout(() => {
      Engine.showCanvas();
      _changeScene(SCENE.TITLE);
      Engine.start(_update, _draw);
    }, 300);
  }

  // ──────────────────────────────
  //  外部公開
  // ──────────────────────────────
  return {
    boot,
    SCENE,
    player,
    flags,
    meta,
    getScene: () => _currentScene
  };
})();

// ── 起動 ──
window.addEventListener('DOMContentLoaded', () => {
  Game.boot();
});
