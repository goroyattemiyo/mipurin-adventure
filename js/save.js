/**
 * save.js - セーブ/ロード・metaFlags・設定保存復元
 * ミプリンの冒険 v0.5.0
 */
const SaveManager = (() => {

  const SAVE_KEY_PREFIX = 'mipurin_save_';
  const META_KEY = 'mipurin_meta';
  const SETTINGS_KEY = 'mipurin_settings';
  const UUID_KEY = 'mipurin_uuid';
  const MAX_SLOTS = 3;

  /* ============ UUID ============ */
  function _generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function getUUID() {
    let uuid = _read(UUID_KEY);
    if (!uuid) { uuid = _generateUUID(); _write(UUID_KEY, uuid); }
    return uuid;
  }

  /* ============ localStorage ラッパー ============ */
  function _write(key, value) {
    try { localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value)); }
    catch (e) { console.warn('SaveManager: write failed', key, e); }
  }
  function _read(key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      try { return JSON.parse(raw); } catch (_) { return raw; }
    } catch (e) { console.warn('SaveManager: read failed', key, e); return null; }
  }
  function _remove(key) {
    try { localStorage.removeItem(key); } catch (e) {}
  }

  /* ============ ゲームセーブ（3スロット） ============ */
  function saveGame(slot, gameState) {
    if (slot < 0 || slot >= MAX_SLOTS) return false;
    const data = {
      version: CONFIG.VERSION,
      timestamp: Date.now(),
      scene: gameState.scene,
      player: {
        hp: gameState.player.hp,
        maxHp: gameState.player.maxHp,
        atk: gameState.player.atk,
        speed: gameState.player.speed,
        needleDmg: gameState.player.needleDmg,
        needles: gameState.player.needles,
        needleMax: gameState.player.needleMax,
        needleRegenTimer: gameState.player.needleRegenTimer,
        level: gameState.player.level,
        exp: gameState.player.exp,
        totalExp: gameState.player.totalExp,
        skillPoints: gameState.player.skillPoints,
        x: gameState.player.x,
        y: gameState.player.y,
        dir: gameState.player.dir
      },
      flags: { ...gameState.flags },
      inventory: gameState.inventory || [],
      equipment: gameState.equipment || null,
      skills: gameState.skills || null,
      mapName: gameState.mapName || 'village',
      playtime: gameState.playtime || 0
    };
    _write(SAVE_KEY_PREFIX + slot, data);
    return true;
  }

  function loadGame(slot) {
    if (slot < 0 || slot >= MAX_SLOTS) return null;
    return _read(SAVE_KEY_PREFIX + slot);
  }

  function deleteSave(slot) {
    if (slot < 0 || slot >= MAX_SLOTS) return;
    _remove(SAVE_KEY_PREFIX + slot);
  }

  function getSaveInfo(slot) {
    const data = loadGame(slot);
    if (!data) return null;
    return {
      exists: true,
      timestamp: data.timestamp,
      scene: data.scene,
      mapName: data.mapName,
      playtime: data.playtime,
      hp: data.player.hp,
      maxHp: data.player.maxHp
    };
  }

  function getAllSaveInfo() {
    const result = [];
    for (let i = 0; i < MAX_SLOTS; i++) {
      result.push(getSaveInfo(i));
    }
    return result;
  }

  /* ============ metaFlags（クリア実績、周回データ） ============ */
  const _defaultMeta = {
    ending_a: false, ending_b: false, ending_c: false,
    dungeon_best: 0,
    golden_title: false,
    title_motif: false,
    skins_owned: [],
    total_playtime: 0,
    first_clear_date: null
  };

  function loadMeta() {
    const saved = _read(META_KEY);
    return Object.assign({}, _defaultMeta, saved || {});
  }

  function saveMeta(meta) {
    _write(META_KEY, meta);
  }

  function updateMeta(key, value) {
    const meta = loadMeta();
    meta[key] = value;
    saveMeta(meta);
    return meta;
  }

  /* ============ 設定 ============ */
  const _defaultSettings = {
    bgmVolume: 0.5,
    seVolume: 0.7,
    textSpeed: 'normal',
    gameSpeed: 'normal',
    invincible: false,
    screenShake: true,
    flash: true,
    colorblind: false,
    fontSize: 'normal',
    keyMap: null
  };

  function loadSettings() {
    const saved = _read(SETTINGS_KEY);
    return Object.assign({}, _defaultSettings, saved || {});
  }

  function saveSettings(settings) {
    _write(SETTINGS_KEY, settings);
  }

  function updateSetting(key, value) {
    const settings = loadSettings();
    settings[key] = value;
    saveSettings(settings);
    return settings;
  }

  /* ============ 全データ削除 ============ */
  function clearAll() {
    for (let i = 0; i < MAX_SLOTS; i++) _remove(SAVE_KEY_PREFIX + i);
    _remove(META_KEY);
    _remove(SETTINGS_KEY);
    // UUIDは残す
  }

  return {
    getUUID, MAX_SLOTS,
    saveGame, loadGame, deleteSave, getSaveInfo, getAllSaveInfo,
    loadMeta, saveMeta, updateMeta,
    loadSettings, saveSettings, updateSetting,
    clearAll
  };
})();
