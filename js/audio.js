/**
 * audio.js - BGM/SE管理・フェード・ループ・killCountフィルタ
 * ミプリンの冒険 v0.5.0
 */
const Audio = (() => {

  let _ctx = null;         // AudioContext
  let _masterGain = null;
  let _bgmGain = null;
  let _seGain = null;

  /* BGM状態 */
  let _bgmSource = null;
  let _bgmBuffer = null;
  let _bgmName = '';
  let _bgmPlaying = false;
  let _bgmFading = false;

  /* killCountローパスフィルタ */
  let _lowpassFilter = null;
  let _droneOsc = null;
  let _droneGain = null;

  /* キャッシュ */
  const _bgmCache = {};  // name → AudioBuffer
  const _seCache = {};    // name → AudioBuffer
  let _sePool = [];       // 同時再生制御

  /* 設定 */
  let _bgmVolume = 0.5;
  let _seVolume = 0.7;
  let _muted = false;

  function _audioDisabled() {
    return CONFIG && CONFIG.AUDIO_ENABLED === false;
  }

  /* BGMマッピング */
  const BGM_MAP = {
    title:         'assets/music/title.mp3',
    village:       'assets/music/village.mp3',
    forest_south:  'assets/music/forest_south.mp3',
    forest_north:  'assets/music/forest_north.mp3',
    cave:          'assets/music/cave.mp3',
    flower_field:  'assets/music/flower_field.mp3',
    boss:          'assets/music/boss.mp3',
    nest:          'assets/music/nest.mp3',
    nest_boss:     'assets/music/nest_boss.mp3',
    shop:          'assets/music/shop.mp3',
    end_b:         'assets/music/end_b.mp3',
    end_c:         'assets/music/end_c.mp3'
  };

  /* SE マッピング */
  const SE_MAP = {
    attack:        'assets/se/attack.mp3',
    needle:        'assets/se/needle.mp3',
    hit:           'assets/se/hit.mp3',
    player_hurt:   'assets/se/player_hurt.mp3',
    enemy_die:     'assets/se/enemy_die.mp3',
    item_get:      'assets/se/item_get.mp3',
    dialog_open:   'assets/se/dialog_open.mp3',
    dialog_close:  'assets/se/dialog_close.mp3',
    menu_move:     'assets/se/menu_move.mp3',
    menu_select:   'assets/se/menu_select.mp3',
    save:          'assets/se/save.mp3',
    level_up:      'assets/se/level_up.mp3',
    boss_appear:   'assets/se/boss_appear.mp3',
    game_over:     'assets/se/game_over.mp3',
    door_open:     'assets/se/door_open.mp3'
  };

  const MAX_SE_CONCURRENT = 8;

  /* ============ 初期化 ============ */
  function init() {
    if (_audioDisabled()) return;
    // AudioContextはユーザー操作後に作成
    const settings = SaveManager.loadSettings();
    _bgmVolume = settings.bgmVolume !== undefined ? settings.bgmVolume : 0.5;
    _seVolume = settings.seVolume !== undefined ? settings.seVolume : 0.7;
  }

  function _ensureContext() {
    if (_audioDisabled() || _ctx) return;
    try {
      _ctx = new (window.AudioContext || window.webkitAudioContext)();

      _masterGain = _ctx.createGain();
      _masterGain.connect(_ctx.destination);

      _bgmGain = _ctx.createGain();
      _bgmGain.gain.value = _bgmVolume;

      _seGain = _ctx.createGain();
      _seGain.gain.value = _seVolume;
      _seGain.connect(_masterGain);

      // ローパスフィルタ（BGM用）
      _lowpassFilter = _ctx.createBiquadFilter();
      _lowpassFilter.type = 'lowpass';
      _lowpassFilter.frequency.value = 20000; // 初期: フィルタなし
      _lowpassFilter.Q.value = 1;

      _bgmGain.connect(_lowpassFilter);
      _lowpassFilter.connect(_masterGain);

    } catch (e) {
      console.warn('Audio: WebAudio not supported', e);
    }
  }

  /** AudioContextをユーザー操作で解除（iOS Safari対策） */
  function resume() {
    if (_audioDisabled()) return;
    _ensureContext();
    if (_ctx && _ctx.state === 'suspended') {
      _ctx.resume();
    }
  }

  /* ============ 読込 ============ */
  async function _loadBuffer(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const arrayBuf = await res.arrayBuffer();
      return await _ctx.decodeAudioData(arrayBuf);
    } catch (e) {
      if (CONFIG.DEBUG) console.warn('Audio: load failed', url, e);
      return null;
    }
  }

  /** BGMプリロード（起動時に必要なものだけ） */
  async function preloadBgm(names) {
    if (_audioDisabled()) return;
    _ensureContext();
    if (!_ctx) return;
    for (const name of names) {
      if (_bgmCache[name]) continue;
      const url = BGM_MAP[name];
      if (!url) continue;
      const buf = await _loadBuffer(url);
      if (buf) _bgmCache[name] = buf;
    }
  }

  /** SE プリロード */
  async function preloadSe(names) {
    if (_audioDisabled()) return;
    _ensureContext();
    if (!_ctx) return;
    for (const name of names) {
      if (_seCache[name]) continue;
      const url = SE_MAP[name];
      if (!url) continue;
      const buf = await _loadBuffer(url);
      if (buf) _seCache[name] = buf;
    }
  }

  /** 全SE一括プリロード */
  async function preloadAllSe() {
    return preloadSe(Object.keys(SE_MAP));
  }

  /* ============ BGM再生 ============ */
  function playBgm(name, fadeInSec) {
    if (_audioDisabled()) return;
    _ensureContext();
    if (!_ctx) return;
    if (_bgmName === name && _bgmPlaying) return; // 同じ曲が再生中

    fadeInSec = fadeInSec || 0.5;

    // 既存BGMをフェードアウトしてから再生
    if (_bgmPlaying) {
      _fadeOutBgm(0.3, () => _startBgm(name, fadeInSec));
    } else {
      _startBgm(name, fadeInSec);
    }
  }

  function _startBgm(name, fadeInSec) {
    const buffer = _bgmCache[name];
    if (!buffer) {
      // キャッシュにない場合は非同期ロード
      const url = BGM_MAP[name];
      if (!url) return;
      _loadBuffer(url).then(buf => {
        if (buf) { _bgmCache[name] = buf; _startBgm(name, fadeInSec); }
      });
      return;
    }

    _bgmSource = _ctx.createBufferSource();
    _bgmSource.buffer = buffer;
    _bgmSource.loop = true;
    _bgmSource.connect(_bgmGain);

    // フェードイン
    _bgmGain.gain.setValueAtTime(0, _ctx.currentTime);
    _bgmGain.gain.linearRampToValueAtTime(_muted ? 0 : _bgmVolume, _ctx.currentTime + fadeInSec);

    _bgmSource.start(0);
    _bgmName = name;
    _bgmPlaying = true;
    _bgmFading = false;
  }

  function _fadeOutBgm(durationSec, callback) {
    if (!_bgmSource || !_bgmPlaying) { if (callback) callback(); return; }
    _bgmFading = true;
    _bgmGain.gain.linearRampToValueAtTime(0, _ctx.currentTime + durationSec);

    setTimeout(() => {
      stopBgm();
      if (callback) callback();
    }, durationSec * 1000 + 50);
  }

  function stopBgm() {
    if (_audioDisabled()) return;
    if (_bgmSource) {
      try { _bgmSource.stop(); } catch (e) {}
      _bgmSource.disconnect();
      _bgmSource = null;
    }
    _bgmPlaying = false;
    _bgmFading = false;
    _bgmName = '';
  }

  function fadeToBgm(name, crossFadeSec) {
    if (_audioDisabled()) return;
    crossFadeSec = crossFadeSec || 1.0;
    _fadeOutBgm(crossFadeSec * 0.5, () => _startBgm(name, crossFadeSec * 0.5));
  }

  /* ============ SE再生 ============ */
  function playSe(name) {
    if (_audioDisabled()) return;
    _ensureContext();
    if (!_ctx || _muted) return;

    // 同時再生制限
    _sePool = _sePool.filter(s => s.playing);
    if (_sePool.length >= MAX_SE_CONCURRENT) return;

    const buffer = _seCache[name];
    if (!buffer) {
      // キャッシュにない場合は非同期ロード＆再生
      const url = SE_MAP[name];
      if (!url) return;
      _loadBuffer(url).then(buf => {
        if (buf) { _seCache[name] = buf; _playSeDirect(buf); }
      });
      return;
    }
    _playSeDirect(buffer);
  }

  function _playSeDirect(buffer) {
    const source = _ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(_seGain);

    const entry = { playing: true };
    source.onended = () => { entry.playing = false; };
    _sePool.push(entry);

    source.start(0);
  }

  /* ============ killCount ローパスフィルタ ============ */
  function updateKillCountFilter(killCount) {
    if (!_lowpassFilter) return;
    const effects = typeof NpcManager !== 'undefined' ? NpcManager.getWorldEffects({ killCount }) : null;
    if (!effects) return;

    // ローパス
    const targetFreq = Math.max(500, Math.min(20000, effects.bgmLowpass));
    _lowpassFilter.frequency.setTargetAtTime(targetFreq, _ctx.currentTime, 0.3);

    // ドローン音
    _updateDrone(effects.droneVolume);
  }

  function _updateDrone(volume) {
    if (volume <= 0) {
      if (_droneOsc) {
        _droneOsc.stop();
        _droneOsc.disconnect();
        _droneOsc = null;
        _droneGain.disconnect();
        _droneGain = null;
      }
      return;
    }

    if (!_droneOsc) {
      _droneOsc = _ctx.createOscillator();
      _droneOsc.type = 'sawtooth';
      _droneOsc.frequency.value = 55; // A1, 低い不安定な音
      _droneGain = _ctx.createGain();
      _droneGain.gain.value = 0;
      _droneOsc.connect(_droneGain);
      _droneGain.connect(_masterGain);
      _droneOsc.start();
    }

    _droneGain.gain.setTargetAtTime(volume, _ctx.currentTime, 0.5);
  }

  /* ============ ボリューム制御 ============ */
  function setBgmVolume(v) {
    if (_audioDisabled()) return;
    _bgmVolume = Math.max(0, Math.min(1, v));
    if (_bgmGain && !_bgmFading) {
      _bgmGain.gain.setTargetAtTime(_muted ? 0 : _bgmVolume, _ctx ? _ctx.currentTime : 0, 0.1);
    }
    SaveManager.updateSetting('bgmVolume', _bgmVolume);
  }

  function setSeVolume(v) {
    if (_audioDisabled()) return;
    _seVolume = Math.max(0, Math.min(1, v));
    if (_seGain) {
      _seGain.gain.setTargetAtTime(_muted ? 0 : _seVolume, _ctx ? _ctx.currentTime : 0, 0.1);
    }
    SaveManager.updateSetting('seVolume', _seVolume);
  }

  function getBgmVolume() { return _bgmVolume; }
  function getSeVolume() { return _seVolume; }

  function mute() {
    _muted = true;
    if (_bgmGain) _bgmGain.gain.setTargetAtTime(0, _ctx.currentTime, 0.1);
    if (_seGain) _seGain.gain.setTargetAtTime(0, _ctx.currentTime, 0.1);
    if (_droneGain) _droneGain.gain.setTargetAtTime(0, _ctx.currentTime, 0.1);
  }

  function unmute() {
    _muted = false;
    if (_bgmGain) _bgmGain.gain.setTargetAtTime(_bgmVolume, _ctx.currentTime, 0.1);
    if (_seGain) _seGain.gain.setTargetAtTime(_seVolume, _ctx.currentTime, 0.1);
  }

  function isMuted() { return _muted; }

  function getCurrentBgm() { return _bgmName; }
  function isBgmPlaying() { return _bgmPlaying; }

  /* ============ シーン連動BGM自動再生 ============ */
  const SCENE_BGM = {
    title: 'title',
    village: 'village',
    forest_south: 'forest_south',
    forest_north: 'forest_north',
    cave: 'cave',
    flower_field: 'flower_field',
    boss: 'boss',
    dungeon: 'nest',
    ending_b: 'end_b',
    ending_c: 'end_c'
    // ending_a: 無音
  };

  function playSceneBgm(sceneName) {
    const bgm = SCENE_BGM[sceneName];
    if (bgm) {
      playBgm(bgm, 1.0);
    } else {
      // マッピングなし（ending_aなど）→ フェードアウト
      if (_bgmPlaying) _fadeOutBgm(1.0);
    }
  }

  /* ============ クリーンアップ ============ */
  function destroy() {
    stopBgm();
    if (_droneOsc) { try { _droneOsc.stop(); } catch (e) {} _droneOsc = null; }
    if (_ctx) { _ctx.close().catch(() => {}); _ctx = null; }
  }

  return {
    init, resume, destroy,
    preloadBgm, preloadSe, preloadAllSe,
    playBgm, stopBgm, fadeToBgm, playSceneBgm,
    playSe,
    updateKillCountFilter,
    setBgmVolume, setSeVolume, getBgmVolume, getSeVolume,
    mute, unmute, isMuted,
    getCurrentBgm, isBgmPlaying,
    BGM_MAP, SE_MAP, SCENE_BGM
  };
})();
