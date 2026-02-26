const SpriteVariant = (() => {

  // 敵IDごとにベースカラーをHSLで定義（キャッシュ用）
  const _cache = new Map();

  // 敵ID → ベース色相マッピング
  const ENEMY_HUE = {
    poison_mushroom: 120,   // 緑
    green_slime: 90,        // 黄緑
    spider: 30,             // 茶
    bomb_mushroom: 15,      // オレンジ
    dark_slime: 270,        // 紫
    bat: 280,               // 紫寄り
    ice_worm: 200,          // 水色
    dark_flower: 300,       // マゼンタ
    shadow_bee: 50,         // 黄
  };

  // エリア別の色相シフト
  const AREA_HUE_SHIFT = {
    forest_south: 0,
    forest_north: 20,
    cave: -30,
    flower_field: 40,
    abyss: -60,
    ruins: -90,
    sky_garden: 60,
  };

  /**
   * 敵の表示色を取得（HSL文字列）
   * @param {string} enemyId - 敵のID
   * @param {string} areaName - エリア名
   * @param {boolean} isElite - エリートか
   * @returns {{ body: string, outline: string, glow: string|null }}
   */
  function getEnemyColors(enemyId, areaName, isElite) {
    const key = `${enemyId}_${areaName}_${isElite}`;
    if (_cache.has(key)) return _cache.get(key);

    const baseHue = ENEMY_HUE[enemyId] || 0;
    const shift = AREA_HUE_SHIFT[areaName] || 0;
    const hue = (baseHue + shift + 360) % 360;

    let sat = 70;
    let lit = 50;

    if (isElite) {
      sat = 90;
      lit = 60;
    }

    const result = {
      body: `hsl(${hue}, ${sat}%, ${lit}%)`,
      outline: `hsl(${hue}, ${sat}%, ${Math.max(lit - 20, 10)}%)`,
      glow: isElite ? `hsla(${hue}, 100%, 70%, 0.6)` : null,
    };

    _cache.set(key, result);
    return result;
  }

  /**
   * レアリティに応じたグロウ色
   * @param {string} rarity
   * @returns {{ color: string, radius: number, alpha: number }|null}
   */
  function getRarityGlow(rarity) {
    switch (rarity) {
      case 'rare':      return { color: '100, 150, 255', radius: 8,  alpha: 0.3 };
      case 'unique':    return { color: '255, 200, 50',  radius: 12, alpha: 0.4 };
      case 'legendary': return { color: '255, 100, 255', radius: 16, alpha: 0.5 };
      default:          return null;
    }
  }

  /**
   * エリートのパルスグロウを描画
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x - 中心X
   * @param {number} y - 中心Y
   * @param {number} size - 敵サイズ
   * @param {string} glowColor - hsla文字列
   * @param {number} time - 経過時間（秒）
   */
  function drawEliteGlow(ctx, x, y, size, glowColor, time) {
    const pulse = 0.5 + 0.5 * Math.sin(time * 3);
    const radius = size * (1.2 + 0.3 * pulse);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, glowColor);
    grad.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * プレイヤーの装備レアリティグロウを描画
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x - プレイヤー中心X
   * @param {number} y - プレイヤー中心Y
   * @param {number} time - 経過時間
   */
  function drawPlayerGlow(ctx, x, y, time) {
    // 装備中の最高レアリティを取得
    if (typeof Equipment === 'undefined') return;

    const slots = ['weapon', 'shield', 'head', 'body', 'accessory1', 'accessory2'];
    const RARITY_RANK = { normal: 0, magic: 1, rare: 2, unique: 3, legendary: 4 };
    let maxRarity = null;
    let maxRank = -1;

    slots.forEach(slot => {
      const item = Equipment.getEquipped(slot);
      if (item && item.rarity) {
        const rank = RARITY_RANK[item.rarity] || 0;
        if (rank > maxRank) {
          maxRank = rank;
          maxRarity = item.rarity;
        }
      }
    });

    const glow = getRarityGlow(maxRarity);
    if (!glow) return;

    const pulse = 0.5 + 0.5 * Math.sin(time * 2);
    const radius = glow.radius + 4 * pulse;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, `rgba(${glow.color}, ${glow.alpha})`);
    grad.addColorStop(1, `rgba(${glow.color}, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * 敵のボディを色付きで描画（スプライトが無い場合のフォールバック）
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x - 中心X
   * @param {number} y - 中心Y
   * @param {number} size - 描画サイズ
   * @param {object} colors - getEnemyColors の戻り値
   * @param {string} symbol - 表示記号
   * @param {string} enemyId - 敵のID
   */
  function drawEnemyBody(ctx, x, y, size, colors, symbol, enemyId) {
    ctx.save();

    // 敵種別にシルエット形状を変える
    ctx.fillStyle = colors.body;
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 2;

    switch (enemyId) {
      case 'green_slime':
      case 'dark_slime':
        // スライム: 半円＋波打つ下部
        ctx.beginPath();
        ctx.arc(x, y - size * 0.1, size / 2, Math.PI, 0);
        ctx.quadraticCurveTo(x + size / 2, y + size * 0.3, x + size * 0.3, y + size * 0.35);
        ctx.quadraticCurveTo(x, y + size * 0.2, x - size * 0.3, y + size * 0.35);
        ctx.quadraticCurveTo(x - size / 2, y + size * 0.3, x - size / 2, y - size * 0.1);
        ctx.fill();
        ctx.stroke();
        break;

      case 'poison_mushroom':
      case 'bomb_mushroom':
        // キノコ: 傘＋軸
        ctx.beginPath();
        ctx.ellipse(x, y - size * 0.15, size / 2, size * 0.3, 0, Math.PI, 0);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = colors.outline;
        ctx.fillRect(x - size * 0.12, y - size * 0.15, size * 0.24, size * 0.4);
        break;

      case 'spider':
        // クモ: 楕円ボディ＋脚線
        ctx.beginPath();
        ctx.ellipse(x, y, size * 0.35, size * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = colors.outline;
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
          const angle = (Math.PI * 0.2) + (i * Math.PI * 0.2);
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(angle) * size * 0.3, y + Math.sin(angle) * size * 0.2);
          ctx.lineTo(x + Math.cos(angle) * size * 0.55, y + Math.sin(angle) * size * 0.5);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x - Math.cos(angle) * size * 0.3, y + Math.sin(angle) * size * 0.2);
          ctx.lineTo(x - Math.cos(angle) * size * 0.55, y + Math.sin(angle) * size * 0.5);
          ctx.stroke();
        }
        break;

      case 'bat':
        // コウモリ: 翼形状
        ctx.beginPath();
        ctx.ellipse(x, y, size * 0.15, size * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x - size * 0.1, y);
        ctx.quadraticCurveTo(x - size * 0.4, y - size * 0.4, x - size * 0.5, y - size * 0.1);
        ctx.quadraticCurveTo(x - size * 0.35, y + size * 0.1, x - size * 0.1, y);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + size * 0.1, y);
        ctx.quadraticCurveTo(x + size * 0.4, y - size * 0.4, x + size * 0.5, y - size * 0.1);
        ctx.quadraticCurveTo(x + size * 0.35, y + size * 0.1, x + size * 0.1, y);
        ctx.fill();
        break;

      case 'ice_worm':
        // ワーム: 連結円
        for (let i = 0; i < 4; i++) {
          const sx = x - size * 0.3 + i * size * 0.2;
          const sy = y + Math.sin(i * 1.2) * size * 0.08;
          ctx.beginPath();
          ctx.arc(sx, sy, size * 0.15, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.stroke();
        break;

      case 'dark_flower': {
        // 花: 花弁
        const petalCount = 5;
        for (let i = 0; i < petalCount; i++) {
          const angle = (Math.PI * 2 * i) / petalCount;
          const px = x + Math.cos(angle) * size * 0.25;
          const py = y + Math.sin(angle) * size * 0.25;
          ctx.beginPath();
          ctx.ellipse(px, py, size * 0.18, size * 0.1, angle, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = colors.outline;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.12, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'shadow_bee':
        // ハチ: 楕円＋縞＋翼
        ctx.beginPath();
        ctx.ellipse(x, y, size * 0.3, size * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#000';
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(x - size * 0.25 + i * size * 0.2, y - size * 0.05, size * 0.08, size * 0.1);
        }
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.ellipse(x - size * 0.1, y - size * 0.25, size * 0.15, size * 0.08, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + size * 0.1, y - size * 0.25, size * 0.15, size * 0.08, 0.3, 0, Math.PI * 2);
        ctx.fill();
        break;

      default:
        // デフォルト: 円
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    // 目を追加（共通）
    const eyeSize = size * 0.06;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x - size * 0.1, y - size * 0.08, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + size * 0.1, y - size * 0.08, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x - size * 0.1, y - size * 0.08, eyeSize * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + size * 0.1, y - size * 0.08, eyeSize * 0.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function clearCache() { _cache.clear(); }

  return {
    getEnemyColors,
    getRarityGlow,
    drawEliteGlow,
    drawPlayerGlow,
    drawEnemyBody,
    clearCache,
  };
})();
