/**
 * game.js - ゲーム初期化・状態管理・シーン遷移
 */
const Game = (() => {

  // シーン定数
  const SCENE = {
    LOADING: 'loading',
    TITLE: 'title',
    PROLOGUE: 'prologue',
    VILLAGE: 'village',
    FOREST_SOUTH: 'forest_south',
    FOREST_NORTH: 'forest_north',
    CAVE: 'cave',
    FLOWER_FIELD: 'flower_field',
    BOSS: 'boss',
    ENDING: 'ending',
    DUNGEON: 'dungeon',
    MENU: 'menu'
  };

  let _currentScene = SCENE.LOADING;
  let _prevScene = null;

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

  // プロローグ制御
  let _prologueLines = [];
  let _prologueLine = 0;
  let _prologueAlpha = 0;
  let _prologuePhase = 'fadein'; // fadein, hold, fadeout, next
  let _prologueTimer = 0;
  let _titleAlpha = 0;
  let _titleReady = false;

  // ── 初期化 ──
  async function boot() {
    Engine.init();

    // ローディング表示更新
    _setLoadingProgress(10);

    // 言語読み込み
    await Lang.load(CONFIG.LANG);
    _setLoadingProgress(30);

    // スプライト読み込み（画像完成後に有効化）
    if (SHEET_LIST.length > 0) {
      await TileEngine.loadSheets(SHEET_LIST, (loaded, total) => {
        _setLoadingProgress(30 + (loaded / total) * 50);
      });
      TileEngine.init();
    }
    _setLoadingProgress(80);

    // メタフラグ復元
    _loadMeta();
    _setLoadingProgress(100);

    // ロード完了→タイトルへ
    setTimeout(() => {
      Engine.showCanvas();
      _changeScene(SCENE.TITLE);
      Engine.start(_update, _draw);
    }, 300);
  }

  // ── ローディング ──
  function _setLoadingProgress(percent) {
    const bar = document.getElementById('loading-bar-inner');
    if (bar) bar.style.width = percent + '%';
  }

  // ── シーン管理 ──
  function _changeScene(scene) {
    _prevScene = _currentScene;
    _currentScene = scene;
    _onSceneEnter(scene);
  }

  function _onSceneEnter(scene) {
    switch (scene) {
      case SCENE.TITLE:
        _titleAlpha = 0;
        _titleReady = false;
        break;
      case SCENE.PROLOGUE:
        _prologueLines = [];
        for (let i = 1; i <= 10; i++) {
          _prologueLines.push(Lang.t(`prologue_${i}`));
        }
        _prologueLine = 0;
        _prologueAlpha = 0;
        _prologuePhase = 'fadein';
        _prologueTimer = 0;
        break;
    }
  }

  // ── 更新 ──
  function _update(dt) {
    switch (_currentScene) {
      case SCENE.TITLE:
        _updateTitle(dt);
        break;
      case SCENE.PROLOGUE:
        _updatePrologue(dt);
        break;
      // 他のシーンは後のフェーズで実装
    }
  }

  function _updateTitle(dt) {
    if (_titleAlpha < 1) {
      _titleAlpha = Math.min(1, _titleAlpha + dt * 0.8);
    } else {
      _titleReady = true;
    }

    if (_titleReady) {
      if (Engine.consumePress('attack') || Engine.consumePress('interact')) {
        _changeScene(SCENE.PROLOGUE);
      }
    }
  }

  function _updatePrologue(dt) {
    const FADE_SPEED = 1.2;
    const HOLD_TIME = 2.0;

    switch (_prologuePhase) {
      case 'fadein':
        _prologueAlpha = Math.min(1, _prologueAlpha + dt * FADE_SPEED);
        if (_prologueAlpha >= 1) {
          _prologuePhase = 'hold';
          _prologueTimer = 0;
        }
        break;
      case 'hold':
        _prologueTimer += dt;
        if (_prologueTimer >= HOLD_TIME || Engine.consumePress('interact')) {
          _prologuePhase = 'fadeout';
        }
        break;
      case 'fadeout':
        _prologueAlpha = Math.max(0, _prologueAlpha - dt * FADE_SPEED);
        if (_prologueAlpha <= 0) {
          _prologueLine++;
          if (_prologueLine >= _prologueLines.length) {
            // プロローグ終了 → 村へ（後のフェーズで実装）
            _changeScene(SCENE.TITLE); // 仮: タイトルに戻す
            if (CONFIG.DEBUG) console.log('プロローグ完了 → 村へ遷移（未実装）');
          } else {
            _prologuePhase = 'fadein';
          }
        }
        break;
    }

    // スキップ
    if (Engine.consumePress('menu')) {
      _changeScene(SCENE.TITLE); // 仮
      if (CONFIG.DEBUG) console.log('プロローグスキップ');
    }
  }

  // ── 描画 ──
  function _draw(ctx) {
    // 背景クリア
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    switch (_currentScene) {
      case SCENE.TITLE:
        _drawTitle(ctx);
        break;
      case SCENE.PROLOGUE:
        _drawPrologue(ctx);
        break;
    }

    // デバッグ情報
    if (CONFIG.DEBUG) {
      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.fillText(`Scene: ${_currentScene} | v${CONFIG.VERSION}`, 4, 14);
    }
  }

  function _drawTitle(ctx) {
    ctx.save();
    ctx.globalAlpha = _titleAlpha;

    // タイトル文字
    ctx.fillStyle = '#F5A623';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(Lang.t('title'), CONFIG.CANVAS_WIDTH / 2, 280);

    // サブテキスト
    if (_titleReady) {
      const blink = Math.sin(Date.now() / 500) > 0;
      if (blink) {
        ctx.fillStyle = '#fff';
        ctx.font = '18px monospace';
        ctx.fillText(Lang.t('press_start'), CONFIG.CANVAS_WIDTH / 2, 400);
      }
    }

    // メタフラグによるタイトル変化
    if (meta.golden_title) {
      ctx.fillStyle = 'rgba(245, 166, 35, 0.15)';
      ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    }

    ctx.restore();
  }

  function _drawPrologue(ctx) {
    if (_prologueLine >= _prologueLines.length) return;

    ctx.save();
    ctx.globalAlpha = _prologueAlpha;
    ctx.fillStyle = '#F5A623';
    ctx.font = '20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      _prologueLines[_prologueLine],
      CONFIG.CANVAS_WIDTH / 2,
      CONFIG.CANVAS_HEIGHT / 2
    );
    ctx.restore();
  }

  // ── メタフラグ永続化 ──
  function _loadMeta() {
    try {
      const saved = localStorage.getItem('mipurin_meta');
      if (saved) {
        const data = JSON.parse(saved);
        Object.assign(meta, data);
      }
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

  // ── 外部公開 ──
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
