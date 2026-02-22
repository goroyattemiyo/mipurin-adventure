/**
 * sprites.js - スプライトシート読み込み＋アニメーション再生
 * ミプリンの冒険 v0.5.0
 */
const SpriteManager = (() => {
  const _sheets = {};   // name → { img:Image, json:Object, loaded:boolean }
  let _allLoaded = false;

  /* シート一覧 */
  const SHEET_LIST = [
    { name: 'player', src: 'assets/sprites/player_sheet.png', json: 'assets/sprites/player.json' }
  ];

  /* 全シート読み込み（Promiseベース） */
  function loadAll() {
    const promises = SHEET_LIST.map(entry => _loadSheet(entry));
    return Promise.all(promises).then(() => { _allLoaded = true; });
  }

  function _loadSheet(entry) {
    return new Promise((resolve, reject) => {
      // load JSON first
      fetch(entry.json)
        .then(r => r.json())
        .then(json => {
          const img = new Image();
          img.onload = () => {
            _sheets[entry.name] = { img, json, loaded: true };
            resolve();
          };
          img.onerror = () => {
            console.warn('Sprite sheet image failed:', entry.src);
            _sheets[entry.name] = { img: null, json, loaded: false };
            resolve(); // don't block game
          };
          img.src = entry.src;
        })
        .catch(err => {
          console.warn('Sprite JSON failed:', entry.json, err);
          resolve(); // don't block game
        });
    });
  }

  /* シート取得 */
  function getSheet(name) {
    return _sheets[name] || null;
  }

  function isLoaded(name) {
    const s = _sheets[name];
    return s && s.loaded;
  }

  function isAllLoaded() {
    return _allLoaded;
  }

  /* ============================================================
     SpriteAnimator — 個別キャラ用アニメーション状態管理
     ============================================================ */
  function createAnimator(sheetName) {
    return {
      sheetName,
      currentAnim: null,
      frameIndex: 0,
      timer: 0,
      finished: false,

      /* アニメーション切替 */
      play(animName, forceRestart) {
        if (this.currentAnim === animName && !forceRestart) return;
        this.currentAnim = animName;
        this.frameIndex = 0;
        this.timer = 0;
        this.finished = false;
      },

      /* 毎フレーム更新 */
      update(dt) {
        const sheet = _sheets[this.sheetName];
        if (!sheet || !sheet.loaded || !this.currentAnim) return;
        const anim = sheet.json.animations[this.currentAnim];
        if (!anim || anim.frames.length <= 1) return;

        this.timer += dt;
        const interval = 1 / (anim.fps || 8);
        if (this.timer >= interval) {
          this.timer -= interval;
          this.frameIndex++;
          if (this.frameIndex >= anim.frames.length) {
            if (anim.loop) {
              this.frameIndex = 0;
            } else {
              this.frameIndex = anim.frames.length - 1;
              this.finished = true;
            }
          }
        }
      },

      /* 現在フレームのスプライトデータ {sx,sy,sw,sh} を返す */
      getCurrentFrame() {
        const sheet = _sheets[this.sheetName];
        if (!sheet || !sheet.loaded || !this.currentAnim) return null;
        const anim = sheet.json.animations[this.currentAnim];
        if (!anim) return null;
        const fi = anim.frames[this.frameIndex];
        if (fi === undefined) return null;
        const frameDef = sheet.json.frames[fi];
        if (!frameDef) return null;
        return { sx: frameDef.sx, sy: frameDef.sy, sw: frameDef.sw, sh: frameDef.sh };
      },

      /* 描画（ctx, 描画先x, 描画先y, 描画幅, 描画高さ） */
      draw(ctx, dx, dy, dw, dh) {
        const sheet = _sheets[this.sheetName];
        if (!sheet || !sheet.loaded) return false;
        const frame = this.getCurrentFrame();
        if (!frame) return false;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(sheet.img, frame.sx, frame.sy, frame.sw, frame.sh, dx, dy, dw || frame.sw, dh || frame.sh);
        return true;
      }
    };
  }

  return { loadAll, getSheet, isLoaded, isAllLoaded, createAnimator, SHEET_LIST };
})();
