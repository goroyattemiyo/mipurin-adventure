/**
 * UIManager.js — 共通UI描画ユーティリティ
 * グローバル定数 ctx, CW, CH (game.js) に依存。
 * グローバルインスタンス: UIManager
 */

class UIManagerClass {

  // ─────────────────────────────────────────────
  // 1. テキスト自動リサイズ描画
  // ─────────────────────────────────────────────
  /**
   * maxWidth に収まるようフォントサイズを動的に下げてテキストを描画する。
   * 12px を下回る場合は省略記号（…）を付けて描画する。
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} text
   * @param {number} x
   * @param {number} y
   * @param {number} maxWidth
   * @param {number} baseFontSize
   */
  drawAutoResizingText(ctx, text, x, y, maxWidth, baseFontSize) {
    const FONT_FAMILY = "'M PLUS Rounded 1c', sans-serif";
    const MIN_SIZE = 12;
    let size = baseFontSize;

    // サイズを下げながら測定
    ctx.font = size + "px " + FONT_FAMILY;
    while (size > MIN_SIZE && ctx.measureText(text).width > maxWidth) {
      size -= 1;
      ctx.font = size + "px " + FONT_FAMILY;
    }

    // それでも収まらなければ省略記号を付ける
    if (ctx.measureText(text).width > maxWidth) {
      let truncated = text;
      while (truncated.length > 0 && ctx.measureText(truncated + '…').width > maxWidth) {
        truncated = truncated.slice(0, -1);
      }
      ctx.fillText(truncated + '…', x, y);
    } else {
      ctx.fillText(text, x, y);
    }
  }

  // ─────────────────────────────────────────────
  // 2. ヘルプボタン描画
  // ─────────────────────────────────────────────
  /**
   * 「？」アイコン（円の中に？）を描画し、ヒット判定用の矩形を返す。
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x  - 円の中心 X
   * @param {number} y  - 円の中心 Y
   * @param {number} size - 円の直径
   * @returns {{ x: number, y: number, width: number, height: number }}
   */
  drawHelpButton(ctx, x, y, size) {
    const r = size / 2;

    // 背景円
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffd700';
    ctx.stroke();

    // ？文字
    ctx.fillStyle = '#ffd700';
    ctx.font = "bold " + Math.round(size * 0.55) + "px 'M PLUS Rounded 1c', sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('？', x, y + 1);
    ctx.restore();

    // ホバー/クリック判定用矩形
    return { x: x - r, y: y - r, width: size, height: size };
  }

  // ─────────────────────────────────────────────
  // 3. ヘルプモーダル表示
  // ─────────────────────────────────────────────
  /**
   * 画面中央に半透明オーバーレイ＋操作説明を描画する。
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} title
   * @param {string[]} lines - 説明テキストの配列
   */
  showHelpModal(ctx, title, lines) {
    const W = CW;
    const H = CH;
    const FONT_FAMILY = "'M PLUS Rounded 1c', sans-serif";
    const PAD_X = 80;
    const PAD_Y = 60;
    const LINE_H = 36;
    const TITLE_SIZE = 28;
    const BODY_SIZE = 20;

    const boxW = W - PAD_X * 2;
    const boxH = PAD_Y * 2 + (TITLE_SIZE + 16) + lines.length * LINE_H + 8;
    const boxX = PAD_X;
    const boxY = (H - boxH) / 2;

    ctx.save();

    // 全画面オーバーレイ
    ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
    ctx.fillRect(0, 0, W, H);

    // モーダル背景
    ctx.fillStyle = 'rgba(20, 20, 40, 0.95)';
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 16);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.stroke();

    // タイトル
    ctx.fillStyle = '#ffd700';
    ctx.font = "bold " + TITLE_SIZE + "px " + FONT_FAMILY;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(title, W / 2, boxY + PAD_Y);

    // 区切り線
    const sepY = boxY + PAD_Y + TITLE_SIZE + 10;
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(boxX + 24, sepY);
    ctx.lineTo(boxX + boxW - 24, sepY);
    ctx.stroke();

    // 説明行
    ctx.fillStyle = '#ffffff';
    ctx.font = BODY_SIZE + "px " + FONT_FAMILY;
    ctx.textAlign = 'left';
    const textX = boxX + 32;
    let lineY = sepY + 14;
    for (const line of lines) {
      this.drawAutoResizingText(ctx, line, textX, lineY + BODY_SIZE * 0.8, boxW - 64, BODY_SIZE);
      lineY += LINE_H;
    }

    ctx.restore();
  }
}

// グローバルインスタンス（全スクリプトから UIManager.xxx() で参照可能）
const UIManager = new UIManagerClass();
