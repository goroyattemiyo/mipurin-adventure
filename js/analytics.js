/**
 * analytics.js - イベントログ送信（バッチ処理）・GAS連携
 * ミプリンの冒険 v0.5.0
 */
const Analytics = (() => {

  const BATCH_SIZE = 5;
  let _buffer = [];
  let _sending = false;
  let _enabled = true;
  let _sessionId = null;
  let _sessionStart = 0;

  /* ============ セッション ============ */
  function startSession() {
    _sessionId = _generateSessionId();
    _sessionStart = Date.now();
    _log('session_start', { version: CONFIG.VERSION });
  }

  function _generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  }

  /* ============ イベント記録 ============ */
  function _log(eventName, data) {
    if (!_enabled) return;
    _buffer.push({
      event: eventName,
      uid: typeof SaveManager !== 'undefined' ? SaveManager.getUUID() : 'unknown',
      session: _sessionId,
      timestamp: Date.now(),
      elapsed: Date.now() - _sessionStart,
      data: data || {}
    });

    if (_buffer.length >= BATCH_SIZE) {
      flush();
    }
  }

  /* ============ 公開ログ関数 ============ */

  /** シーン遷移 */
  function logSceneChange(from, to) {
    _log('scene_change', { from, to });
  }

  /** エリア到達 */
  function logAreaVisit(areaName, firstVisit) {
    _log('area_visit', { area: areaName, first: firstVisit });
  }

  /** 敵撃破 */
  function logEnemyKill(enemyId, weapon, area) {
    _log('enemy_kill', { enemy: enemyId, weapon, area });
  }

  /** ボス撃破 */
  function logBossKill(bossId, timeMs, hpRemain) {
    _log('boss_kill', { boss: bossId, time: timeMs, hp_remain: hpRemain });
  }

  /** プレイヤー死亡 */
  function logPlayerDeath(area, killedBy, hp) {
    _log('player_death', { area, killed_by: killedBy, hp });
  }

  /** 針の一撃使用 */
  function logNeedleUse(area, totalCount) {
    _log('needle_use', { area, total: totalCount });
  }

  /** アイテム取得 */
  function logItemGet(itemId, area) {
    _log('item_get', { item: itemId, area });
  }

  /** アイテム使用 */
  function logItemUse(itemId, area) {
    _log('item_use', { item: itemId, area });
  }

  /** NPC会話 */
  function logNpcTalk(npcId, eventType) {
    _log('npc_talk', { npc: npcId, event: eventType || 'normal' });
  }

  /** ショップ購入 */
  function logShopBuy(itemId, price, currency) {
    _log('shop_buy', { item: itemId, price, currency: currency || 'pollen' });
  }

  /** スキン購入開始 */
  function logSkinPurchase(skinId) {
    _log('skin_purchase', { skin: skinId });
  }

  /** エンディング到達 */
  function logEnding(endingId, killCount, needleCount, playtime) {
    _log('ending', { ending: endingId, kills: killCount, needles: needleCount, playtime });
  }

  /** 巣窟結果 */
  function logDungeonResult(floor, kills, score) {
    _log('dungeon_result', { floor, kills, score });
  }

  /** セーブ実行 */
  function logSave(slot) {
    _log('save', { slot });
  }

  /** 図鑑新発見 */
  function logCollectionDiscover(entryId) {
    _log('collection_discover', { entry: entryId });
  }

  /** シェア実行 */
  function logShare(platform) {
    _log('share', { platform });
  }

  /** カスタムイベント */
  function logCustom(name, data) {
    _log(name, data);
  }

  /* ============ バッチ送信 ============ */
  async function flush() {
    if (!_enabled || !CONFIG.GAS_URL || _buffer.length === 0 || _sending) return;

    _sending = true;
    const batch = _buffer.splice(0); // バッファを空にして取得

    try {
      await fetch(CONFIG.GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'log', events: batch }),
        mode: 'no-cors' // GAS CORS制限回避
      });
    } catch (e) {
      // 送信失敗: バッファに戻す（最大50件まで）
      if (_buffer.length + batch.length <= 50) {
        _buffer = batch.concat(_buffer);
      }
      if (CONFIG.DEBUG) console.warn('Analytics: flush failed', e);
    }

    _sending = false;
  }

  /** エリア遷移時にフラッシュ（game.jsのシーン遷移から呼ぶ） */
  function onSceneChange() {
    flush();
  }

  /* ============ 設定 ============ */
  function setEnabled(flag) { _enabled = !!flag; }
  function isEnabled() { return _enabled; }
  function getBufferSize() { return _buffer.length; }

  return {
    startSession, flush, onSceneChange,
    setEnabled, isEnabled, getBufferSize,
    logSceneChange, logAreaVisit, logEnemyKill, logBossKill,
    logPlayerDeath, logNeedleUse, logItemGet, logItemUse,
    logNpcTalk, logShopBuy, logSkinPurchase,
    logEnding, logDungeonResult, logSave,
    logCollectionDiscover, logShare, logCustom
  };
})();
