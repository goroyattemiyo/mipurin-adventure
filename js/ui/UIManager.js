/**
 * UIManager.js — 共通UI描画ユーティリティ v2
 * グローバル定数 ctx, CW, CH, mouse (game.js) に依存。
 * グローバルインスタンス: UIManager
 */

class UIManagerClass {
  constructor() {
    /** 現在開いているヘルプモーダルのキー (null = 閉じている) */
    this._helpKey = null;
  }

  // ─────────────────────────────────────────────
  // 1. テキスト自動縮小描画
  // ─────────────────────────────────────────────
  /**
   * CSS フォント文字列を受け取り、maxWidth に収まるまでサイズを縮小して描画。
   * @param {CanvasRenderingContext2D} ctx
   * @param {string}  text
   * @param {number}  x
   * @param {number}  y
   * @param {number}  maxWidth
   * @param {string}  baseFont  例: "bold 20px 'M PLUS Rounded 1c', sans-serif"
   */
  drawSmartText(ctx, text, x, y, maxWidth, baseFont) {
    const MIN_SIZE = 10;
    const match = baseFont.match(/(\d+(?:\.\d+)?)px/);
    if (!match) { ctx.font = baseFont; ctx.fillText(text, x, y); return; }
    let size = parseFloat(match[1]);
    let font = baseFont;
    ctx.font = font;
    while (size > MIN_SIZE && ctx.measureText(text).width > maxWidth) {
      size--;
      font = baseFont.replace(/[\d.]+px/, size + 'px');
      ctx.font = font;
    }
    ctx.fillText(text, x, y);
  }

  // ─────────────────────────────────────────────
  // 2. ヘルプアイコン描画
  // ─────────────────────────────────────────────
  /**
   * 「？」アイコンを描画し、クリックでモーダルを開閉する。
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x    円の中心 X
   * @param {number} y    円の中心 Y
   * @param {number} size 円の直径
   * @param {string} key  モーダル識別キー
   * @returns {{ x, y, width, height }}
   */
  drawHelpIcon(ctx, x, y, size, key) {
    const r = size / 2;
    const isActive = this._helpKey === key;

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = isActive ? 'rgba(255,215,0,0.25)' : 'rgba(0,0,0,0.65)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = isActive ? '#ffe566' : '#ffd700';
    ctx.stroke();
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold ' + Math.round(size * 0.55) + "px 'M PLUS Rounded 1c', sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('？', x, y + 1);
    ctx.restore();

    // クリック判定（マウス座標はキャンバス座標系）
    if (typeof mouse !== 'undefined' && mouse.clicked &&
        mouse.x >= x - r && mouse.x <= x + r &&
        mouse.y >= y - r && mouse.y <= y + r) {
      this._helpKey = (this._helpKey === key) ? null : key;
    }

    return { x: x - r, y: y - r, width: size, height: size };
  }

  /** 指定キーのヘルプモーダルが開いているか */
  isHelpOpen(key) { return this._helpKey === key; }

  /** ヘルプモーダルを閉じる */
  closeHelp() { this._helpKey = null; }

  // ─────────────────────────────────────────────
  // 3. ヘルプモーダル表示
  // ─────────────────────────────────────────────
  /**
   * 画面中央に半透明オーバーレイ＋説明テキストをモーダル表示する。
   * モーダル外クリック or ✕ボタンで自動クローズ。
   * @param {CanvasRenderingContext2D} ctx
   * @param {string}   title
   * @param {string[]} contentLines
   */
  showModal(ctx, title, contentLines) {
    const W = CW, H = CH;
    const F = "'M PLUS Rounded 1c', sans-serif";
    const PAD_X = 80, PAD_Y = 52;
    const LINE_H = 38, TITLE_SIZE = 26, BODY_SIZE = 19;

    const boxW = W - PAD_X * 2;
    const boxH = PAD_Y * 2 + (TITLE_SIZE + 20) + contentLines.length * LINE_H;
    const boxX = PAD_X;
    const boxY = (H - boxH) / 2;

    ctx.save();

    // 全画面オーバーレイ
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(0, 0, W, H);

    // モーダル背景
    ctx.fillStyle = 'rgba(20,20,40,0.96)';
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 16);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.stroke();

    // タイトル
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold ' + TITLE_SIZE + 'px ' + F;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(title, W / 2, boxY + PAD_Y);

    // 区切り線
    const sepY = boxY + PAD_Y + TITLE_SIZE + 10;
    ctx.strokeStyle = 'rgba(255,215,0,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(boxX + 24, sepY);
    ctx.lineTo(boxX + boxW - 24, sepY);
    ctx.stroke();

    // 説明行
    let lineY = sepY + 12;
    for (const line of contentLines) {
      ctx.fillStyle = '#ffffff';
      this.drawSmartText(ctx, line, boxX + 32, lineY + BODY_SIZE, boxW - 64, BODY_SIZE + 'px ' + F);
      lineY += LINE_H;
    }

    // ✕ ボタン
    const cx = boxX + boxW - 24, cy = boxY + 20, cr = 14;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fill();
    ctx.fillStyle = '#ccc';
    ctx.font = 'bold 16px ' + F;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✕', cx, cy);

    ctx.restore();

    // モーダル外クリック or ✕ クリックで閉じる
    if (typeof mouse !== 'undefined' && mouse.clicked) {
      const outside = !(mouse.x >= boxX && mouse.x <= boxX + boxW &&
                        mouse.y >= boxY && mouse.y <= boxY + boxH);
      const onClose = Math.hypot(mouse.x - cx, mouse.y - cy) <= cr;
      if (outside || onClose) this._helpKey = null;
    }
  }

  // ─────────────────────────────────────────────
  // 後方互換エイリアス (v1 メソッド名 → v2 委譲)
  // ─────────────────────────────────────────────
  drawAutoResizingText(ctx, text, x, y, maxWidth, baseFontSize) {
    const F = "'M PLUS Rounded 1c', sans-serif";
    this.drawSmartText(ctx, text, x, y, maxWidth, baseFontSize + 'px ' + F);
  }
  drawHelpButton(ctx, x, y, size) {
    return this.drawHelpIcon(ctx, x, y, size, '_legacy');
  }
  showHelpModal(ctx, title, lines) {
    this.showModal(ctx, title, lines);
  }
}

// グローバルインスタンス（全スクリプトから UIManager.xxx() で参照可能）
const UIManager = new UIManagerClass();
