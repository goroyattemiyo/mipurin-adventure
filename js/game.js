/**
 * game.js - ゲーム初期化・状態管理・シーン遷移・全モジュール統合
 * ミプリンの冒険 v1.0.0
 */
const Game = (() => {
  const S = CONFIG.SCALE;
  const PX = (v) => v * S;

  /* ============ シーン定数 ============ */
  const SCENE = {
    LOADING:'loading', TITLE:'title', PROLOGUE:'prologue', MENU:'menu',
    VILLAGE:'village', FOREST_SOUTH:'forest_south', FOREST_NORTH:'forest_north',
    CAVE:'cave', FLOWER_FIELD:'flower_field', BOSS:'boss',
    ENDING:'ending', DUNGEON:'dungeon', SETTINGS:'settings',
    GAMEOVER:'gameover', COLLECTION:'collection', CREDITS:'credits'
  };

  const PANEL = {
    MAP_W: CONFIG.MAP_PX_W, MAP_H: CONFIG.MAP_PX_H,
    RIGHT_X: CONFIG.PANEL_RIGHT_X, RIGHT_Y: 0, RIGHT_W: CONFIG.PANEL_RIGHT_W, RIGHT_H: CONFIG.MAP_PX_H,
    BOTTOM_X: 0, BOTTOM_Y: CONFIG.PANEL_BOTTOM_Y, BOTTOM_W: CONFIG.CANVAS_WIDTH, BOTTOM_H: CONFIG.PANEL_BOTTOM_H
  };

  let _currentScene = SCENE.LOADING;
  let _prevScene = null;
  let _prologueSeen = false;
  let _playtime = 0; // 秒

  /* ============ プレイヤー ============ */
  const player = {
    x:0, y:0,
    hp: Balance.PLAYER.BASE_HP, maxHp: Balance.PLAYER.BASE_HP,
    atk: Balance.PLAYER.BASE_ATK, speed: Balance.PLAYER.BASE_SPEED,
    needleDmg: Balance.PLAYER.NEEDLE_DMG,
    dir:'down', lastInputDir:'down',
    animFrame:0, animTimer:0,
    attackCooldown:0, needleCooldown:0,
    inputBuffer:0, inputBufferAction:null,
    knockback:{x:0,y:0,timer:0}, hitStopFrames:0,
    invincibleTimer:0, poisoned:false,
    _buffDef:null, _buffSpeed:null, _buffAtk:null, _buffVision:null,
    level: 1, exp: 0, totalExp: 0, skillPoints: 0,
    needles: Balance.NEEDLE.INITIAL, needleMax: Balance.NEEDLE.MAX, needleRegenTimer: 0,
    _regenTimer: 0
  };

  /* ============ フラグ ============ */
  const flags = {
    quest_started:false, stump_hint:false, has_green_key:false,
    father_truth:false, seal_hint:false, queen_truth:false, queen_truth_granpa:false,
    seal_opened:false, has_queens_tear:false, has_hana_pot:false,
    honey_rule_known:false, collapse_seen:false,
    piece_a:false, piece_b:false, piece_c:false,
    ending_a_seen:false, ending_b_seen:false, ending_c_seen:false,
    dungeon_unlocked:false,
    killCount:0, needleUseCount:0, pacifist_interactions:0,
    granpa_met:false, miel_vision:false, miel_reveal:false,
    marche_event:false, pore_honey_rule:false, navi_father_event:false,
    has_minimap:false,
    _hatch_mid_said:false
  };

  let meta = {};

  /* ============ エフェクト ============ */
  let _attackEffectTimer = 0;
  let _needleEffectTimer = 0;
  let _levelUpEffectTimer = 0;
  let _vignetteGradient = null;
  let _vignetteIntensityLast = null;
  let _rightPanelBg = null;
  let _bottomPanelBg = null;
  let _miniMapCanvas = null;
  let _miniMapCtx = null;
  let _miniMapDirty = true;
  let _miniMapKey = '';
  let _areaBannerText = '';
  let _areaBannerTimer = 0;
  const _areaBannerDuration = 2.0;
  let _pendingPlayerPosition = null;
  let _logEntries = [];
  let _dropLogs = [];
  let _autoSaveCooldown = 0;
  let _blessingShownThisRoom = false;
  let _enemiesSpawnedThisRoom = false;

  /* ============ ダイアログ ============ */
  let _dialogText = '';
  let _dialogActive = false;
  let _dialogTimer = 0;
  let _dialogChars = 0;
  let _dialogQueue = []; // 連続会話用
  let _dialogLinesCached = null;
  let _dialogLineEndsRaw = null;
  let _dialogTextLast = null;
  const DIALOG_SPEED = 0.04;

  function _showDialog(text) {
    _dialogText = text; _dialogActive = true;
    _dialogTimer = 0; _dialogChars = 0;
    _dialogLinesCached = null;
    _dialogLineEndsRaw = null;
    _dialogTextLast = null;
    Audio.playSe('dialog_open');
  }

  function _getMapDisplayName(mapName) {
    const names = {
      village: 'ミプリンの村',
      forest_south: '南の森',
      forest_north: '北の森',
      cave: '洞窟',
      flower_field: '花畑',
      dungeon: '巣窟'
    };
    return names[mapName] || mapName;
  }

  function _getAreaBannerText(mapName) {
    const name = _getMapDisplayName(mapName);
    if (mapName === 'village') return name;
    const aLv = Scaling.areaLevel(player.level, mapName);
    return `${name}  エリア Lv.${aLv}`;
  }

  function _addLog(text) {
    if (!text) return;
    _logEntries.unshift({ text, time: Date.now() });
    if (_logEntries.length > 5) _logEntries.length = 5;
  }

  function _addDropLog(text, color) {
    if (!text) return;
    _dropLogs.unshift({ text, color: color || '#fff', timer: 3.0 });
    if (_dropLogs.length > 5) _dropLogs.length = 5;
  }

  function _gainExp(amount) {
    if (!amount || amount <= 0) return;
    const skBonus = (typeof Skills !== 'undefined') ? Skills.getBonus() : {};
    const expMult = 1 + (skBonus.expMult || 0);
    amount = Math.ceil(amount * expMult);
    player.exp += amount;
    player.totalExp += amount;
    while (player.exp >= Scaling.expForLevel(player.level)) {
      player.exp -= Scaling.expForLevel(player.level);
      player.level++;
      Skills.addPoint(1);
      player.skillPoints = Skills.getPoints();
      EquipmentUI.applyStats();
      player.hp = player.maxHp;
      _addLog('レベル ' + player.level + ' に上がった！');
      Audio.playSe('level_up');
      _levelUpEffectTimer = 1.0;
    }
  }

  function _queueDialogs(lines) {
    if (!lines || lines.length === 0) return;
    _showDialog(lines[0]);
    _dialogQueue = lines.slice(1);
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
        if (_dialogQueue.length > 0) {
          _showDialog(_dialogQueue.shift());
        } else {
          _dialogActive = false;
          _dialogText = '';
          _dialogQueue = [];
          _dialogLinesCached = null;
          _dialogLineEndsRaw = null;
          _dialogTextLast = null;
          Shop.closeShop();
          Audio.playSe('dialog_close');
        }
      }
    }
  }

  function _wrapDialogLines(ctx, text, maxWidth) {
    const rawLines = text.split('\n');
    const lines = [];
    const endsRaw = [];
    for (let r = 0; r < rawLines.length; r++) {
      const raw = rawLines[r];
      if (!raw) {
        lines.push('');
        endsRaw.push(r < rawLines.length - 1);
        continue;
      }
      let rest = raw;
      while (rest.length > 0) {
        let cut = Math.min(Math.floor(28 * S), rest.length);
        while (cut > 1 && ctx.measureText(rest.slice(0, cut)).width > maxWidth) cut--;
        lines.push(rest.slice(0, cut));
        rest = rest.slice(cut);
        endsRaw.push(rest.length === 0 && r < rawLines.length - 1);
      }
    }
    return { lines, endsRaw };
  }

  function _drawDialog(ctx) {
    if (!_dialogActive) return;
    const W = PANEL.BOTTOM_W, H = PANEL.BOTTOM_H;
    const lineH = PX(22);
    const padding = PX(16);
    const minH = PX(100);

    // 横幅に収まるよう折り返し
    ctx.font = `${CONFIG.FONT_BASE}px monospace`;
    const maxWidth = W - PX(32) - padding * 2;
    if (_dialogText !== _dialogTextLast) {
      const wrapped = _wrapDialogLines(ctx, _dialogText, maxWidth);
      _dialogLinesCached = wrapped.lines;
      _dialogLineEndsRaw = wrapped.endsRaw;
      _dialogTextLast = _dialogText;
    }

    const lines = [];
    const cached = _dialogLinesCached || [];
    const endsRaw = _dialogLineEndsRaw || [];
    let remaining = _dialogChars;
    for (let i = 0; i < cached.length; i++) {
      if (remaining <= 0) break;
      const line = cached[i];
      if (remaining < line.length) {
        lines.push(line.slice(0, remaining));
        remaining = 0;
        break;
      }
      lines.push(line);
      remaining -= line.length;
      if (endsRaw[i]) {
        if (remaining <= 0) break;
        remaining -= 1;
        if (remaining === 0) { lines.push(''); break; }
      }
    }

    const neededH = padding * 2 + lines.length * lineH + PX(10);
    const bh = Math.max(minH, Math.min(neededH, H - PX(20)));
    const bx = PANEL.BOTTOM_X + PX(16), by = PANEL.BOTTOM_Y + PX(10), bw = W - PX(32);

    ctx.fillStyle = 'rgba(0,0,0,0.88)';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#F5A623';
    ctx.lineWidth = PX(2);
    ctx.strokeRect(bx, by, bw, bh);

    ctx.fillStyle = '#fff';
    ctx.font = `${CONFIG.FONT_BASE}px monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const maxLines = Math.floor((bh - padding * 2) / lineH);
    for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
      ctx.fillText(lines[i], bx + padding, by + padding + i * lineH);
    }

    if (_dialogChars >= _dialogText.length && Math.sin(Date.now() / 300) > 0) {
      ctx.fillStyle = '#F5A623';
      ctx.fillText('▼', bx + bw - PX(28), by + bh - PX(26));
    }
  }

  /* ============ プロローグ ============ */
  const PROLOGUE_TOTAL = 10;
  const _prologueImages = [];
  let _prologueImagesLoaded = false;
  let _prologueIndex=0, _prologueAlpha=0, _prologueTextAlpha=0;
  let _prologuePhase='fadein', _prologueTimer=0;
  const P_FADE_IN=1.0, P_HOLD=3.0, P_FADE_OUT=0.7, P_TEXT_DELAY=0.4;

  function _loadPrologueImages() {
    let loaded=0;
    for (let i=1; i<=PROLOGUE_TOTAL; i++) {
      const img=new Image(); const idx=i<10?'0'+i:''+i;
      img.src='assets/prologue/prologue_'+idx+'.webp';
      img.onload=()=>{loaded++;if(loaded>=PROLOGUE_TOTAL)_prologueImagesLoaded=true;};
      img.onerror=()=>{loaded++;if(loaded>=PROLOGUE_TOTAL)_prologueImagesLoaded=true;};
      _prologueImages.push(img);
    }
  }

  function _resetPrologue(){_prologueIndex=0;_prologueAlpha=0;_prologueTextAlpha=0;_prologuePhase='fadein';_prologueTimer=0;}

  function _updatePrologue(dt) {
    if(Engine.consumePress('menu')){_prologuePhase='done';return;}
    const adv=Engine.consumePress('interact')||Engine.consumePress('attack')||Engine.consumeClick();
    _prologueTimer+=dt;
    switch(_prologuePhase){
      case'fadein':
        _prologueAlpha=Math.min(1,_prologueTimer/P_FADE_IN);
        _prologueTextAlpha=Math.max(0,Math.min(1,(_prologueTimer-P_TEXT_DELAY)/(P_FADE_IN-P_TEXT_DELAY)));
        if(_prologueTimer>=P_FADE_IN){_prologuePhase='hold';_prologueTimer=0;}
        if(adv){_prologuePhase='fadeout';_prologueTimer=0;}break;
      case'hold':
        if(_prologueTimer>=P_HOLD||adv){_prologuePhase='fadeout';_prologueTimer=0;}break;
      case'fadeout':
        _prologueAlpha=Math.max(0,1-_prologueTimer/P_FADE_OUT);_prologueTextAlpha=_prologueAlpha;
        if(_prologueTimer>=P_FADE_OUT){_prologueIndex++;
          if(_prologueIndex>=PROLOGUE_TOTAL)_prologuePhase='done';
          else{_prologuePhase='fadein';_prologueTimer=0;_prologueAlpha=0;_prologueTextAlpha=0;}}break;
    }
    if(_prologuePhase==='done') _changeScene(SCENE.MENU);
  }

  function _drawPrologue(ctx) {
    ctx.fillStyle='#000';ctx.fillRect(0,0,CONFIG.CANVAS_WIDTH,CONFIG.CANVAS_HEIGHT);
    if(_prologueIndex>=PROLOGUE_TOTAL)return;
    const img=_prologueImages[_prologueIndex];
    if(!img||!img.complete||!img.naturalWidth)return;
    const sc=Math.min(CONFIG.CANVAS_WIDTH/img.naturalWidth,CONFIG.CANVAS_HEIGHT/img.naturalHeight);
    const w=img.naturalWidth*sc,h=img.naturalHeight*sc;
    const x=(CONFIG.CANVAS_WIDTH-w)/2,y=(CONFIG.CANVAS_HEIGHT-h)/2;
    ctx.save();ctx.globalAlpha=_prologueAlpha;ctx.drawImage(img,x,y,w,h);ctx.restore();
    const idx2=_prologueIndex+1;const key='prologue_'+(idx2<10?'0'+idx2:''+idx2);
    const cap=Lang.t(key);
    if(cap&&cap!==key&&_prologueTextAlpha>0) _drawCaptionText(ctx,cap,CONFIG.CANVAS_HEIGHT-PX(80),_prologueTextAlpha);
    ctx.save();ctx.globalAlpha=0.35;ctx.fillStyle='#fff';ctx.font=`${CONFIG.FONT_SM}px monospace`;ctx.textAlign='center';
    ctx.fillText('Enter / タップ で次へ　　Esc でスキップ',CONFIG.CANVAS_WIDTH/2,CONFIG.CANVAS_HEIGHT-PX(16));ctx.restore();
  }

  function _drawCaptionText(ctx,text,baseY,alpha){
    const captionFont = CONFIG.FONT_SM * S * (20 / 24);
    const lh = CONFIG.FONT_SM * S * (30 / 24);
    const lines=text.split('\n'),startY=baseY-(lines.length-1)*lh/2;
    ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${captionFont}px monospace`;
    for(let i=0;i<lines.length;i++){const ly=startY+i*lh;
      ctx.globalAlpha=alpha*0.6;ctx.fillStyle='#000';ctx.fillText(lines[i],CONFIG.CANVAS_WIDTH/2+PX(2),ly+PX(2));
      ctx.globalAlpha=alpha;ctx.fillStyle='#FFFFFF';ctx.fillText(lines[i],CONFIG.CANVAS_WIDTH/2,ly);}
    ctx.restore();
  }

  /* ============ タイトル ============ */
  let _titleAlpha=0,_titleReady=false,_titleTimer=0;
  function _resetTitle(){_titleAlpha=0;_titleReady=false;_titleTimer=0;}
  function _updateTitle(dt){
    _titleTimer+=dt;
    if(_titleAlpha<1)_titleAlpha=Math.min(1,_titleAlpha+dt*0.8);else _titleReady=true;
    if(_titleReady&&(Engine.consumePress('attack')||Engine.consumePress('interact')||Engine.consumeClick())){
      Audio.resume();
      if(!_prologueSeen){_prologueSeen=true;_changeScene(SCENE.PROLOGUE);}
      else{_changeScene(SCENE.MENU);}
    }
  }
  function _drawTitle(ctx){
    ctx.fillStyle='#1a1a2a';ctx.fillRect(0,0,CONFIG.CANVAS_WIDTH,CONFIG.CANVAS_HEIGHT);
    ctx.save();ctx.globalAlpha=_titleAlpha;
    ctx.fillStyle='#F5A623';ctx.font=`bold ${CONFIG.FONT_XL}px monospace`;ctx.textAlign='center';
    ctx.fillText(Lang.t('title'),CONFIG.CANVAS_WIDTH/2,PX(280));
    if(_titleReady&&Math.sin(_titleTimer*4)>0){ctx.fillStyle='#fff';ctx.font=`${CONFIG.FONT_BASE}px monospace`;ctx.fillText(Lang.t('press_start'),CONFIG.CANVAS_WIDTH/2,PX(400));}
    if(meta.golden_title){ctx.fillStyle='rgba(245,166,35,0.15)';ctx.fillRect(0,0,CONFIG.CANVAS_WIDTH,CONFIG.CANVAS_HEIGHT);}
    ctx.restore();
  }

  /* ============ メニュー ============ */
  const _menuItemsBase=['menu_story','menu_dungeon','menu_collection','menu_settings','menu_credits'];
  let _menuCursor=0,_menuAlpha=0;
  let _menuStorySub=false,_menuStoryCursor=0;
  let _menuFromGame=false;
  function _getMenuItems(){ return _menuFromGame ? ['menu_return_village', ..._menuItemsBase] : _menuItemsBase; }
  function _resetMenu(){_menuCursor=0;_menuAlpha=0;_menuStorySub=false;_menuStoryCursor=0;}
  function _updateMenu(dt){
    _menuAlpha=Math.min(1,_menuAlpha+dt*2);
    if(_menuStorySub){
      if(Engine.consumePress('up')||Engine.consumePress('down')){_menuStoryCursor=(_menuStoryCursor+1)%2;Audio.playSe('menu_move');}
      if(Engine.consumePress('menu')){_menuStorySub=false;return;}
      if(Engine.consumePress('interact')||Engine.consumePress('attack')||Engine.consumeClick()){
        Audio.playSe('menu_select');
        if(_menuStoryCursor===0){
          _changeScene(SCENE.VILLAGE);
        }else{
          const data = SaveManager.loadGame(0);
          if (data) {
            _restoreFromSave(data);
          } else {
            _changeScene(SCENE.VILLAGE);
          }
        }
      }
      return;
    }
    const items=_getMenuItems();
    if(Engine.consumePress('up')){_menuCursor=(_menuCursor-1+items.length)%items.length;Audio.playSe('menu_move');}
    if(Engine.consumePress('down')){_menuCursor=(_menuCursor+1)%items.length;Audio.playSe('menu_move');}
    if(Engine.consumePress('interact')||Engine.consumePress('attack')||Engine.consumeClick()){
      Audio.playSe('menu_select');
      switch(items[_menuCursor]){
        case'menu_return_village':
          _pendingSpawn = { x: 9, y: 6 };
          _changeScene(SCENE.VILLAGE);
          break;
        case'menu_story':
          if (SaveManager.getSaveInfo(0)) { _menuStorySub=true; _menuStoryCursor=0; }
          else { _changeScene(SCENE.VILLAGE); }
          break;
        case'menu_dungeon':
          if(flags.dungeon_unlocked||meta.ending_a||meta.ending_b||meta.ending_c){_changeScene(SCENE.DUNGEON);}
          else{_showDialog('ストーリーモードをクリアすると\n解放されます');}
          break;
        case'menu_collection': _changeScene(SCENE.COLLECTION); break;
        case'menu_settings': _changeScene(SCENE.SETTINGS); break;
        case'menu_credits': _changeScene(SCENE.CREDITS); break;
      }
    }
    if(Engine.consumePress('menu'))_changeScene(SCENE.TITLE);
  }
  function _drawMenu(ctx){
    ctx.fillStyle='#1a1a2a';ctx.fillRect(0,0,CONFIG.CANVAS_WIDTH,CONFIG.CANVAS_HEIGHT);
    ctx.save();ctx.globalAlpha=_menuAlpha;
    ctx.fillStyle='#F5A623';ctx.font=`bold ${CONFIG.FONT_LG}px monospace`;ctx.textAlign='center';
    ctx.fillText(Lang.t('title'),CONFIG.CANVAS_WIDTH/2,PX(100));
    const items=_getMenuItems();
    for(let i=0;i<items.length;i++){const y=PX(220)+i*PX(50);const cur=(i===_menuCursor);
      if(cur){ctx.fillStyle='#F5A623';ctx.font=`${CONFIG.FONT_BASE}px monospace`;ctx.textAlign='right';ctx.fillText('▶ ',CONFIG.CANVAS_WIDTH/2-PX(100),y);}
      ctx.fillStyle=cur?'#F5A623':'#aaa';ctx.font=cur?`bold ${CONFIG.FONT_BASE}px monospace`:`${CONFIG.FONT_BASE}px monospace`;ctx.textAlign='left';
      const key=items[i];
      let label=Lang.t(key);
      if (label === key && key === 'menu_return_village') label = 'むらに もどる';
      // 巣窟ロック表示
      if(key==='menu_dungeon'&&!flags.dungeon_unlocked&&!meta.ending_a&&!meta.ending_b&&!meta.ending_c){
        ctx.fillStyle=cur?'#666':'#444';ctx.fillText(label+' 🔒',CONFIG.CANVAS_WIDTH/2-PX(90),y);
      } else { ctx.fillText(label,CONFIG.CANVAS_WIDTH/2-PX(90),y); }
    }
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font=`${CONFIG.FONT_SM}px monospace`;ctx.textAlign='center';
    ctx.fillText('↑↓: えらぶ　Z / Enter: けってい　Esc: もどる',CONFIG.CANVAS_WIDTH/2,CONFIG.CANVAS_HEIGHT-PX(20));
    if(_menuStorySub){
      const bx=CONFIG.CANVAS_WIDTH/2-PX(140), by=PX(360), bw=PX(280), bh=PX(120);
      ctx.fillStyle='rgba(0,0,0,0.85)';ctx.fillRect(bx,by,bw,bh);
      ctx.strokeStyle='#F5A623';ctx.lineWidth=PX(2);ctx.strokeRect(bx,by,bw,bh);
      const opts=['はじめから','つづきから'];
      for(let i=0;i<opts.length;i++){
        const y=by+PX(40)+i*PX(36);
        const cur=(i===_menuStoryCursor);
        if(cur){ctx.fillStyle='#F5A623';ctx.textAlign='right';ctx.font=`${CONFIG.FONT_BASE}px monospace`;ctx.fillText('▶',bx+PX(36),y);}
        ctx.fillStyle=cur?'#fff':'#aaa';ctx.textAlign='left';ctx.font=cur?`bold ${CONFIG.FONT_BASE}px monospace`:`${CONFIG.FONT_BASE}px monospace`;
        ctx.fillText(opts[i],bx+PX(50),y);
      }
      ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font=`${CONFIG.FONT_SM}px monospace`;ctx.textAlign='center';
      ctx.fillText('Esc: もどる',bx+bw/2,by+bh-PX(12));
    }
    ctx.restore();
  }

  /* ============ 設定画面 ============ */
  let _settingsCursor=0;
  const _settingsItems=['bgm','se','speed','invincible','shake','flash','colorblind','back'];
  let _settings = {};

  function _resetSettings(){_settingsCursor=0;_settings=SaveManager.loadSettings();}
  function _updateSettings(dt){
    if(Engine.consumePress('up')){_settingsCursor=(_settingsCursor-1+_settingsItems.length)%_settingsItems.length;Audio.playSe('menu_move');}
    if(Engine.consumePress('down')){_settingsCursor=(_settingsCursor+1)%_settingsItems.length;Audio.playSe('menu_move');}
    if(Engine.consumePress('menu')){_changeScene(SCENE.MENU);return;}

    const item=_settingsItems[_settingsCursor];
    const lr=Engine.consumePress('right')?1:Engine.consumePress('left')?-1:0;
    const confirm=Engine.consumePress('interact')||Engine.consumePress('attack');

    if(lr||confirm){
      switch(item){
        case'bgm':_settings.bgmVolume=Math.max(0,Math.min(1,(_settings.bgmVolume||0.5)+lr*0.1));Audio.setBgmVolume(_settings.bgmVolume);break;
        case'se':_settings.seVolume=Math.max(0,Math.min(1,(_settings.seVolume||0.7)+lr*0.1));Audio.setSeVolume(_settings.seVolume);break;
        case'speed':
          if(lr||confirm){const sp=['slow','normal','fast'];let si=sp.indexOf(_settings.gameSpeed||'normal');si=(si+1)%3;_settings.gameSpeed=sp[si];}break;
        case'invincible':if(lr||confirm)_settings.invincible=!_settings.invincible;break;
        case'shake':if(lr||confirm){_settings.screenShake=!_settings.screenShake;Engine.setShakeEnabled(_settings.screenShake);}break;
        case'flash':if(lr||confirm)_settings.flash=!_settings.flash;break;
        case'colorblind':if(lr||confirm){_settings.colorblind=!_settings.colorblind;document.body.classList.toggle('colorblind',_settings.colorblind);}break;
        case'back':if(confirm)_changeScene(SCENE.MENU);break;
      }
      SaveManager.saveSettings(_settings);
    }
  }
  function _drawSettings(ctx){
    ctx.fillStyle='#1a1a2a';ctx.fillRect(0,0,CONFIG.CANVAS_WIDTH,CONFIG.CANVAS_HEIGHT);
    ctx.fillStyle='#F5A623';ctx.font=`bold ${CONFIG.FONT_LG}px monospace`;ctx.textAlign='center';
    ctx.fillText('せってい',CONFIG.CANVAS_WIDTH/2,PX(60));
    const labels={bgm:'BGM おんりょう',se:'SE おんりょう',speed:'ゲームスピード',invincible:'むてきモード',shake:'がめんゆれ',flash:'フラッシュ',colorblind:'いろよわモード',back:'← もどる'};
    for(let i=0;i<_settingsItems.length;i++){
      const y=PX(120)+i*PX(44); const cur=(i===_settingsCursor);
      ctx.fillStyle=cur?'#F5A623':'#aaa';ctx.font=cur?`bold ${CONFIG.FONT_BASE}px monospace`:`${CONFIG.FONT_BASE}px monospace`;ctx.textAlign='left';
      if(cur){ctx.fillText('▶',PX(160),y);}
      ctx.fillText(labels[_settingsItems[i]],PX(190),y);
      // 値
      ctx.textAlign='right';ctx.fillStyle=cur?'#fff':'#888';ctx.font=`${CONFIG.FONT_BASE}px monospace`;
      const item=_settingsItems[i];
      if(item==='bgm') ctx.fillText(Math.round((_settings.bgmVolume||0.5)*100)+'%',CONFIG.CANVAS_WIDTH-PX(180),y);
      else if(item==='se') ctx.fillText(Math.round((_settings.seVolume||0.7)*100)+'%',CONFIG.CANVAS_WIDTH-PX(180),y);
      else if(item==='speed') ctx.fillText({slow:'ゆっくり',normal:'ふつう',fast:'はやい'}[_settings.gameSpeed||'normal'],CONFIG.CANVAS_WIDTH-PX(180),y);
      else if(item==='invincible') ctx.fillText(_settings.invincible?'ON':'OFF',CONFIG.CANVAS_WIDTH-PX(180),y);
      else if(item==='shake') ctx.fillText(_settings.screenShake!==false?'ON':'OFF',CONFIG.CANVAS_WIDTH-PX(180),y);
      else if(item==='flash') ctx.fillText(_settings.flash!==false?'ON':'OFF',CONFIG.CANVAS_WIDTH-PX(180),y);
      else if(item==='colorblind') ctx.fillText(_settings.colorblind?'ON':'OFF',CONFIG.CANVAS_WIDTH-PX(180),y);
    }
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font=`${CONFIG.FONT_SM}px monospace`;ctx.textAlign='center';
    ctx.fillText('↑↓: えらぶ　←→/Z: へんこう　Esc: もどる',CONFIG.CANVAS_WIDTH/2,CONFIG.CANVAS_HEIGHT-PX(20));
  }

  /* ============ クレジット ============ */
  let _creditsTimer=0;
  function _updateCredits(dt){
    _creditsTimer+=dt;
    if(Engine.consumePress('menu')||Engine.consumePress('interact')||Engine.consumeClick())_changeScene(SCENE.MENU);
  }
  function _drawCredits(ctx){
    ctx.fillStyle='#1a1a2a';ctx.fillRect(0,0,CONFIG.CANVAS_WIDTH,CONFIG.CANVAS_HEIGHT);
    ctx.fillStyle='#F5A623';ctx.font=`bold ${CONFIG.FONT_LG}px monospace`;ctx.textAlign='center';
    ctx.fillText('クレジット',CONFIG.CANVAS_WIDTH/2,PX(80));
    ctx.fillStyle='#ccc';ctx.font=`${CONFIG.FONT_BASE}px monospace`;
    const lines=['ミプリンの冒険','','企画・プログラム: goroyattemiyo','キャラクターデザイン: （クレジット）','音楽: Suno AI','',''+Lang.t('credits_thanks')];
    for(let i=0;i<lines.length;i++) ctx.fillText(lines[i],CONFIG.CANVAS_WIDTH/2,PX(160)+i*PX(32));
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font=`${CONFIG.FONT_SM}px monospace`;
    ctx.fillText('Esc / Enter でもどる',CONFIG.CANVAS_WIDTH/2,CONFIG.CANVAS_HEIGHT-PX(20));
  }

  /* ============ 図鑑シーン ============ */
  function _updateCollection(dt){
    Collection.updateUI();
    if(!Collection.isOpen()) _changeScene(SCENE.MENU);
  }
  function _drawCollection(ctx){
    ctx.fillStyle='#1a1a2a';ctx.fillRect(0,0,CONFIG.CANVAS_WIDTH,CONFIG.CANVAS_HEIGHT);
    Collection.drawUI(ctx);
  }

  /* ============ 共通マップシーン ============ */
  let _pendingSpawn = null;
  let _currentMapName = '';
  let _pendingBossId = null;
  let _pendingBossReturnScene = null;
  let _pendingBossDialog = null;
  let _bossLastAction = null;
  let _bossStartTime = 0;
  let _endingType = null;
  let _endingTimer = 0;
  let _endingReady = false;

  function _sceneFromMapName(mapName) {
    const sceneMap = {
      'village':SCENE.VILLAGE, 'forest_south':SCENE.FOREST_SOUTH,
      'forest_north':SCENE.FOREST_NORTH, 'cave':SCENE.CAVE,
      'flower_field':SCENE.FLOWER_FIELD
    };
    return sceneMap[mapName] || SCENE.VILLAGE;
  }

  function _buildSaveState() {
    return {
      scene: _currentScene,
      player,
      flags,
      inventory: Inventory.serialize(),
      equipment: Equipment.serialize(),
      skills: Skills.serialize(),
      mapName: _currentMapName,
      playtime: _playtime
    };
  }

  function _restoreFromSave(data) {
    if (!data) { _changeScene(SCENE.VILLAGE); return; }
    const pd = data.player || {};
    player.hp = pd.hp ?? player.hp;
    player.maxHp = pd.maxHp ?? player.maxHp;
    player.atk = pd.atk ?? player.atk;
    player.speed = pd.speed ?? player.speed;
    player.needleDmg = pd.needleDmg ?? player.needleDmg;
    player.needles = pd.needles ?? player.needles;
    player.needleMax = pd.needleMax ?? player.needleMax;
    player.needleRegenTimer = pd.needleRegenTimer ?? player.needleRegenTimer;
    player.level = pd.level ?? player.level;
    player.exp = pd.exp ?? player.exp;
    player.totalExp = pd.totalExp ?? player.totalExp;
    player.skillPoints = pd.skillPoints ?? player.skillPoints;
    player.dir = pd.dir || player.dir;
    _pendingPlayerPosition = { x: pd.x ?? player.x, y: pd.y ?? player.y, dir: player.dir };
    Object.assign(flags, data.flags || {});
    Inventory.deserialize(data.inventory || []);
    Equipment.deserialize(data.equipment);
    if (data.skills) {
      Skills.deserialize(data.skills);
    } else {
      Skills.init();
      if (pd.skillPoints) Skills.addPoint(pd.skillPoints);
    }
    player.skillPoints = Skills.getPoints();
    EquipmentUI.applyStats();
    _playtime = data.playtime || 0;
    const mapName = data.mapName || 'village';
    const targetScene = _sceneFromMapName(mapName);
    _changeScene(targetScene);
  }

  function _initMapScene(mapName) {
    _currentMapName = mapName;
    _blessingShownThisRoom = false;
    _enemiesSpawnedThisRoom = false;
    const map = MapManager.loadMap(mapName);
    if (!map) return;
    player.x = map.playerStart.x * CONFIG.TILE_SIZE;
    player.y = map.playerStart.y * CONFIG.TILE_SIZE;
    player.dir = 'down';
    // _pendingPlayerPosition はセーブ復元専用、固定マップのみ適用
    if (_pendingPlayerPosition && mapName === 'village') {
      player.x = _pendingPlayerPosition.x;
      player.y = _pendingPlayerPosition.y;
      player.dir = _pendingPlayerPosition.dir || player.dir;
    }
    _pendingPlayerPosition = null;
    _dialogActive = false; _dialogQueue = [];
    Shop.closeShop();
    _attackEffectTimer = 0; _needleEffectTimer = 0;
    if (typeof EnemyManager !== 'undefined') EnemyManager.spawnFromMap(map.enemies);
    if (EnemyManager.getAliveCount() > 0) _enemiesSpawnedThisRoom = true;
    Collection.onAreaVisit(mapName);
    Analytics.logAreaVisit(mapName, true);
    Audio.playSceneBgm(mapName);
    _areaBannerText = _getAreaBannerText(mapName);
    _areaBannerTimer = _areaBannerDuration;
    _miniMapDirty = true;
    _autoSaveCooldown = 0;
    _addLog('エリア到達: ' + _getMapDisplayName(mapName));
    if (_pendingBossDialog) {
      const msg = _pendingBossDialog;
      _pendingBossDialog = null;
      setTimeout(() => { _showDialog(msg); }, 300);
    }
  }

  function _updateMapScene(dt) {
    _playtime += dt;
    if (_areaBannerTimer > 0) _areaBannerTimer = Math.max(0, _areaBannerTimer - dt);

    if (Engine.consumePress('menu')) { _changeScene(SCENE.MENU); return; }

    // 装備UI
    if (Engine.consumePress('equipment') && !Inventory.isOpen() && !SkillUI.isOpen()) {
      if (EquipmentUI.isOpen()) EquipmentUI.close();
      else EquipmentUI.open();
      return;
    }
    if (EquipmentUI.isOpen()) { EquipmentUI.update(); return; }

    // スキルUI
    if (Engine.consumePress('skill') && !Inventory.isOpen() && !EquipmentUI.isOpen()) {
      if (SkillUI.isOpen()) SkillUI.close();
      else SkillUI.open();
      return;
    }
    if (SkillUI.isOpen()) { SkillUI.update(); return; }

    // インベントリ
    if (Engine.consumePress('inventory') && !_dialogActive) {
      if (Inventory.isOpen()) {
        Inventory.close();
        _dialogActive = false;
        _dialogText = '';
        _dialogQueue = [];
        _dialogLinesCached = null;
        _dialogLineEndsRaw = null;
        _dialogTextLast = null;
      }
      else { Inventory.open(); return; }
    }
    if (Inventory.isOpen()) {
      const result = Inventory.updateUI();
      if (result && result.action === 'use') {
        Inventory.useItem(result.itemId, player, flags);
        Analytics.logItemUse(result.itemId, _currentMapName);
      }
      if (!Inventory.isOpen()) {
        _dialogActive = false;
        _dialogText = '';
        _dialogQueue = [];
        _dialogLinesCached = null;
        _dialogLineEndsRaw = null;
        _dialogTextLast = null;
      }
      return;
    }

    // ショップ
    if (Shop.isShopOpen()) {
      const result = Shop.updateShopUI(Inventory.getCount('pollen'));
      if (result) {
        if (result.action === 'buy_item') {
          Inventory.removeItem('pollen', result.cost);
          if (result.itemId === 'needle_bundle') {
            const before = player.needles;
            player.needles = Math.min(player.needleMax, player.needles + Balance.NEEDLE.SHOP_BUNDLE);
            if (player.needles > before) _addLog('針を補充した');
          } else {
            Inventory.addItem(result.itemId);
          }
          Analytics.logShopBuy(result.itemId, result.cost);
          Audio.playSe('item_get');
          const def = Inventory.ITEM_DEFS[result.itemId];
          _addLog((def ? def.name : result.itemId) + ' を購入');
        }
      }
      if (!Shop.isShopOpen()) {
        _dialogActive = false;
        _dialogText = '';
        _dialogQueue = [];
        _dialogLinesCached = null;
        _dialogLineEndsRaw = null;
        _dialogTextLast = null;
      }
      return;
    }

    // ダイアログ中
    if (_dialogActive) { _updateDialog(dt); return; }

    // バフ更新
    Inventory.updateBuffs(player, dt);

    // 無敵タイマー
    if (player.invincibleTimer > 0) player.invincibleTimer -= dt;

    // エフェクトタイマー
    if (_attackEffectTimer > 0) _attackEffectTimer -= dt;
    if (_needleEffectTimer > 0) _needleEffectTimer -= dt;
    if (_levelUpEffectTimer > 0) _levelUpEffectTimer = Math.max(0, _levelUpEffectTimer - dt);

    // プレイヤー移動
    PlayerController.update(player, dt);
    PlayerController.updateAnimation(player, dt);

    // 攻撃（Zキー）
    if (Engine.consumePress('attack') && player.attackCooldown <= 0) {
      const skBonus = (typeof Skills !== 'undefined') ? Skills.getBonus() : {};
      const atkSpeedMult = 1 + (skBonus.atkSpeed || 0);
      player.attackCooldown = (Balance.PLAYER.ATTACK_COOLDOWN_SEC || 0.5) / atkSpeedMult;
      _attackEffectTimer = 0.2;
      const box = PlayerController.getAttackBox(player);
      const hitResult = EnemyManager.checkAttackHit(box, Inventory.getEffectiveAtk(player), flags);
      if (hitResult.hitAny) {
        player.hitStopFrames = Balance.PLAYER.HITSTOP_FRAMES_GIVE;
        Engine.triggerShake(2, 3);
        Audio.playSe('hit');
      } else {
        Audio.playSe('attack');
      }
      if (hitResult.killed && hitResult.killed.length > 0) {
        const aLv = Scaling.areaLevel(player.level, _currentMapName);
        for (const k of hitResult.killed) {
          const baseEnemy = Balance.ENEMIES[k.id];
          if (!baseEnemy) continue;
          const expGain = Scaling.enemyExp(baseEnemy.xp, aLv);
          _gainExp(expGain);
        }
      }
    }

    // 針の一撃（Cキー）
    if (Engine.consumePress('needle')) {
      if (player.needles > 0) {
        player.needles--;
        flags.needleUseCount++;
        _needleEffectTimer = 0.5;
        const skBonus = (typeof Skills !== 'undefined') ? Skills.getBonus() : {};
        const needleDmg = player.needleDmg + (skBonus.needleDmg || 0);
        EnemyManager.needleBlast(player.x, player.y, needleDmg, flags);
        Engine.triggerShake(6, 10);
        Audio.playSe('needle');
        Analytics.logNeedleUse(_currentMapName, flags.needleUseCount);
      } else {
        Audio.playSe('empty');
      }
    }

    // 敵更新
    EnemyManager.update(dt, player);
    if (typeof Particles !== 'undefined') Particles.update(dt);
    if (typeof DamageNumbers !== 'undefined') DamageNumbers.update(dt);
    if (typeof Loot !== 'undefined') Loot.update(dt, player.x, player.y);

    // スキル: HP回復
    const skBonus = (typeof Skills !== 'undefined') ? Skills.getBonus() : {};
    if (skBonus.regen && skBonus.regen > 0) {
      if (!player._regenTimer) player._regenTimer = 0;
      player._regenTimer += dt;
      if (player._regenTimer >= 10) {
        player._regenTimer -= 10;
        player.hp = Math.min(player.maxHp, player.hp + Math.floor(skBonus.regen));
      }
    }

    player.needleRegenTimer += dt;
    const needleInterval = Math.max(10, Balance.NEEDLE.REGEN_INTERVAL + (skBonus.needleCD || 0));
    if (player.needleRegenTimer >= needleInterval) {
      player.needleRegenTimer -= needleInterval;
      if (player.needles < player.needleMax) player.needles++;
    }
    for (let i = _dropLogs.length - 1; i >= 0; i--) {
      _dropLogs[i].timer -= dt;
      if (_dropLogs[i].timer <= 0) _dropLogs.splice(i, 1);
    }

    // 祝福UI表示中はゲーム停止
    if (typeof BlessingUI !== 'undefined' && BlessingUI.isActive()) {
      BlessingUI.handleInput();
      return;
    }

    // ボス突入判定（該当地域で全滅時）
    if (!Dungeon.isActive() && typeof BossManager !== 'undefined') {
      const remaining = EnemyManager.getAliveCount();
      if (remaining === 0) {
        // 祝福選択（まだ表示していなければ）
        if (_enemiesSpawnedThisRoom && typeof BlessingUI !== 'undefined' && typeof Blessings !== 'undefined' && !BlessingUI.isActive() && !_blessingShownThisRoom) {
          _blessingShownThisRoom = true;
          var owned = Blessings.getOwnedBlessings();
          var count = 3;
          owned.forEach(function(b){ if(b.effect.type === 'extraChoice') count += b.effect.value; });
          var choices = Blessings.getRandomBlessings(count, owned.map(function(b){return b.id;}));
          if (choices.length > 0) {
            BlessingUI.show(choices, function(selected){
              Blessings.applyBlessing(selected, player);
            });
            return;
          }
        }
        if (_currentMapName === 'forest_north' && !flags.piece_a) {
          _pendingBossId = 'mushroom_king';
          _pendingBossReturnScene = SCENE.FOREST_NORTH;
          _changeScene(SCENE.BOSS);
          return;
        }
        if (_currentMapName === 'cave' && !flags.piece_b) {
          _pendingBossId = 'ice_beetle';
          _pendingBossReturnScene = SCENE.CAVE;
          _changeScene(SCENE.BOSS);
          return;
        }
        if (_currentMapName === 'flower_field' && !flags.piece_c) {
          _pendingBossId = 'dark_queen';
          _pendingBossReturnScene = SCENE.FLOWER_FIELD;
          _changeScene(SCENE.BOSS);
          return;
        }
      }
    }

    // 設定の無敵モード
    if (_settings.invincible) player.hp = player.maxHp;

    // Auto-save when stepping on save point
    if (_autoSaveCooldown > 0) _autoSaveCooldown -= dt;
    const ts = CONFIG.TILE_SIZE;
    const playerCol = Math.floor((player.x + ts/2) / ts);
    const playerRow = Math.floor((player.y + ts/2) / ts);
    const currentTile = MapManager.getTile(playerCol, playerRow);
    if (currentTile === MapManager.TILE.SAVE_POINT && _autoSaveCooldown <= 0) {
      _autoSaveCooldown = 3.0; // 3 second cooldown to avoid repeated saves
      player.hp = player.maxHp;
      if (typeof SaveManager !== 'undefined' && SaveManager.saveGame) {
        SaveManager.saveGame(0, _buildSaveState());
      }
      _showDialog(Lang.t('save_success'));
      _addLog('セーブしました');
      Audio.playSe('save');
    }

    // インタラクション
    if (Engine.consumePress('interact')) {
      const interact = PlayerController.checkInteract(player);
      if (interact) {
        switch (interact.type) {
          case 'npc':
            const talk = NpcManager.getTalk(interact.npc.id, flags, Inventory);
            if (talk) {
              if (talk.chain) { _queueDialogs([talk.lines, ...talk.chain]); }
              else { _showDialog(talk.lines); }
              if (talk.event) Analytics.logNpcTalk(interact.npc.id, talk.event);
              if (talk.event === 'open_shop') { setTimeout(() => Shop.openShop(), 100); }
              flags.pacifist_interactions++;
            }
            break;
          case 'save':
            if (_autoSaveCooldown <= 0) {
              _autoSaveCooldown = 3.0;
              player.hp = player.maxHp;
              if (typeof SaveManager !== 'undefined' && SaveManager.saveGame) {
                SaveManager.saveGame(0, _buildSaveState());
              }
              _showDialog(Lang.t('save_success'));
              _addLog('セーブしました');
              Audio.playSe('save');
            }
            break;
          case 'sign':
            const signKey = 'sign_' + _currentMapName;
            const signText = Lang.t(signKey);
            _showDialog(signText !== signKey ? signText : '…なにも書かれていない');
            break;
          case 'chest':
            _showDialog(Lang.t('chest_empty'));
            Audio.playSe('item_get');
            _addLog('宝箱を開けた');
            break;
          case 'stump':
            if (!flags.has_green_key) {
              flags.has_green_key = true;
              Inventory.addItem('green_key');
              Collection.onItemGet('green_key');
              Collection.onSpecialDiscover('env_stump');
              _showDialog('切株の中から\n【秘密の鍵】を見つけた！');
              _addLog('秘密の鍵を入手');
              Audio.playSe('item_get');
              Analytics.logItemGet('green_key', _currentMapName);
            } else {
              _showDialog('空っぽの切株だ。');
            }
            break;
          case 'seal_wall':
            if (flags.has_green_key && !flags.seal_opened) {
              flags.seal_opened = true;
              Collection.onSpecialDiscover('env_seal_wall');
              _showDialog('秘密の鍵が光り、封印壁が消えた！\n奥にロイヤルゼリーがある！');
              Inventory.addItem('royal_jelly');
              Collection.onItemGet('royal_jelly');
              _addLog('ロイヤルゼリーを入手');
              Audio.playSe('door_open');
              if (interact.col !== undefined && interact.row !== undefined) {
                MapManager.setTile(interact.col, interact.row, MapManager.TILE.CAVE_FLOOR);
                _miniMapDirty = true;
              }
            } else if (!flags.has_green_key) {
              _showDialog('緑の水晶で封印されている。\n何か鍵が必要みたいだ…');
            }
            break;
        }
      }
    }

    // 出口判定
    const exit = PlayerController.checkExit(player);
    if (exit) {
      if (exit.type === 'random_exit') {
        const map = MapManager.loadMap(_currentMapName);
        if (map) {
          player.x = map.playerStart.x * CONFIG.TILE_SIZE;
          player.y = map.playerStart.y * CONFIG.TILE_SIZE;
          player.dir = 'down';
          _dialogActive = false; _dialogQueue = [];
          Shop.closeShop();
          _attackEffectTimer = 0; _needleEffectTimer = 0;
          if (typeof EnemyManager !== 'undefined') EnemyManager.spawnFromMap(map.enemies);
          _areaBannerText = _getAreaBannerText(_currentMapName);
          _areaBannerTimer = _areaBannerDuration;
          _miniMapDirty = true;
          _autoSaveCooldown = 0;
        }
        return;
      }
      const sceneMap = {
        'village':SCENE.VILLAGE, 'forest_south':SCENE.FOREST_SOUTH,
        'forest_north':SCENE.FOREST_NORTH, 'cave':SCENE.CAVE,
        'flower_field':SCENE.FLOWER_FIELD
      };
      const nextScene = sceneMap[exit.to];
      if (nextScene) {
        _pendingSpawn = { x:exit.spawnX, y:exit.spawnY };
        _changeScene(nextScene);
      } else {
        _showDialog(Lang.t('area_locked'));
        player.y += (exit.spawnY > 7 ? -1 : 1) * CONFIG.TILE_SIZE;
      }
    }

    // 死亡判定
    if (player.hp <= 0) {
      Analytics.logPlayerDeath(_currentMapName, 'enemy', player.hp);
      Audio.playSe('game_over');
      if (typeof Blessings !== 'undefined') Blessings.resetBlessings();
      _changeScene(SCENE.GAMEOVER);
    }
  }

  function _drawMapScene(ctx) {
    ctx.save();
    if (typeof GameFeel !== 'undefined') GameFeel.applyShake(ctx);

    // killCount世界演出
    const worldFx = NpcManager.getWorldEffects(flags);
    const saturationShift = worldFx.saturationShift;

    MapManager.draw(ctx);
    EnemyManager.draw(ctx);
    MapManager.drawNpcs(ctx);
    PlayerController.draw(ctx, player);
    PlayerController.drawAttackEffect(ctx, player, _attackEffectTimer);
    PlayerController.drawNeedleEffect(ctx, player, _needleEffectTimer);
    if (_levelUpEffectTimer > 0) {
      const ts = CONFIG.TILE_SIZE;
      const cx = player.x + ts / 2;
      const cy = player.y + ts / 2;
      const t = Math.max(0, Math.min(1, _levelUpEffectTimer));
      const r = (1 - t) * ts * 3;
      ctx.save();
      ctx.globalAlpha = t;
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    if (typeof Particles !== 'undefined') Particles.draw(ctx);
    if (typeof Loot !== 'undefined') Loot.draw(ctx);

    ctx.restore(); // filterを完全にリセット

    // 簡易彩度低下（CSS filterを使わない）
    if (saturationShift < 0) {
      const intensity = Math.min(0.6, Math.abs(saturationShift) / 150);
      if (intensity > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, PANEL.MAP_W, PANEL.MAP_H);
        ctx.clip();
        ctx.fillStyle = `rgba(128,128,128,${intensity})`;
        ctx.globalCompositeOperation = 'saturation';
        if (ctx.globalCompositeOperation !== 'saturation') {
          ctx.globalCompositeOperation = 'source-atop';
        }
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        ctx.restore();
      }
    }

    if (typeof DamageNumbers !== 'undefined') DamageNumbers.draw(ctx);
    if (typeof GameFeel !== 'undefined') GameFeel.drawFlash(ctx, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    _drawPanelBorders(ctx);
    _drawHud(ctx);
    EquipmentUI.draw(ctx);
    SkillUI.draw(ctx);
    Inventory.drawUI(ctx);
    Shop.drawShopUI(ctx, Inventory.getCount('pollen'));
    if (typeof BlessingUI !== 'undefined') BlessingUI.draw(ctx, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    _drawBottomPanel(ctx);
    if (CONFIG.DEBUG || location.search.includes('debug=1')) {
    ctx.save();
    ctx.font = `${CONFIG.FONT_SM}px monospace`;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'right';
    ctx.fillText('v' + CONFIG.VERSION, CONFIG.CANVAS_WIDTH - PX(8), CONFIG.CANVAS_HEIGHT - PX(8));
    ctx.restore();
    }
  }

  function _drawVignette(ctx, intensity) {
    const W=CONFIG.CANVAS_WIDTH, H=CONFIG.CANVAS_HEIGHT;
    if (_vignetteGradient === null || _vignetteIntensityLast === null || Math.abs(intensity - _vignetteIntensityLast) > 0.05) {
      const grd = ctx.createRadialGradient(W/2,H/2,W*0.3, W/2,H/2,W*0.7);
      grd.addColorStop(0, 'rgba(0,0,0,0)');
      grd.addColorStop(1, `rgba(0,0,0,${intensity})`);
      _vignetteGradient = grd;
      _vignetteIntensityLast = intensity;
    }
    ctx.fillStyle = _vignetteGradient;
    ctx.fillRect(0,0,W,H);
  }

  /* ============ ボスシーン ============ */
  function _initBossScene() {
    _dialogActive = false; _dialogQueue = [];
    _attackEffectTimer = 0; _needleEffectTimer = 0;
    _bossLastAction = null;
    _bossStartTime = Date.now();
    _areaBannerTimer = 0;
    EnemyManager.clear();

    let bossId = _pendingBossId;
    if (!bossId) {
      if (_currentMapName === 'forest_north') bossId = 'mushroom_king';
      else if (_currentMapName === 'cave') bossId = 'ice_beetle';
      else if (_currentMapName === 'flower_field') bossId = 'dark_queen';
    }
    if (bossId) {
      BossManager.spawn(bossId);
    }
    _pendingBossId = null;

    Audio.playSceneBgm('boss');
    Audio.playSe('boss_appear');
  }

  function _updateBossScene(dt) {
    _playtime += dt;

    if (Engine.consumePress('inventory') && !_dialogActive) {
      if (Inventory.isOpen()) { Inventory.close(); }
      else { Inventory.open(); return; }
    }
    if (Inventory.isOpen()) {
      const result = Inventory.updateUI();
      if (result && result.action === 'use') {
        Inventory.useItem(result.itemId, player, flags);
        Analytics.logItemUse(result.itemId, 'boss');
      }
      if (!Inventory.isOpen()) {
        _dialogActive = false;
        _dialogText = '';
        _dialogQueue = [];
        _dialogLinesCached = null;
        _dialogLineEndsRaw = null;
        _dialogTextLast = null;
      }
      return;
    }

    if (_dialogActive) { _updateDialog(dt); return; }

    Inventory.updateBuffs(player, dt);
    if (player.invincibleTimer > 0) player.invincibleTimer -= dt;
    if (_attackEffectTimer > 0) _attackEffectTimer -= dt;
    if (_needleEffectTimer > 0) _needleEffectTimer -= dt;
    if (_levelUpEffectTimer > 0) _levelUpEffectTimer = Math.max(0, _levelUpEffectTimer - dt);

    PlayerController.update(player, dt);
    PlayerController.updateAnimation(player, dt);

    if (Engine.consumePress('attack') && player.attackCooldown <= 0) {
      const skBonus = (typeof Skills !== 'undefined') ? Skills.getBonus() : {};
      const atkSpeedMult = 1 + (skBonus.atkSpeed || 0);
      player.attackCooldown = (Balance.PLAYER.ATTACK_COOLDOWN_SEC || 0.5) / atkSpeedMult;
      _attackEffectTimer = 0.2;
      const box = PlayerController.getAttackBox(player);
      const hitBoss = BossManager.checkHit(box, Inventory.getEffectiveAtk(player), flags);
      const hitMinion = EnemyManager.checkAttackHit(box, Inventory.getEffectiveAtk(player), flags);
      if (hitBoss || hitMinion.hitAny) {
        player.hitStopFrames = Balance.PLAYER.HITSTOP_FRAMES_GIVE;
        Engine.triggerShake(2, 3);
        Audio.playSe('hit');
      } else {
        Audio.playSe('attack');
      }
      const boss = BossManager.getCurrentBoss();
      if (boss && boss.hp <= 0 && !_bossLastAction) _bossLastAction = 'attack_finish';
      if (hitMinion.killed && hitMinion.killed.length > 0) {
        const aLv = Scaling.areaLevel(player.level, _currentMapName);
        for (const k of hitMinion.killed) {
          const baseEnemy = Balance.ENEMIES[k.id];
          if (!baseEnemy) continue;
          const expGain = Scaling.enemyExp(baseEnemy.xp, aLv);
          _gainExp(expGain);
        }
      }
    }

    if (Engine.consumePress('needle')) {
      if (player.needles > 0) {
        player.needles--;
        flags.needleUseCount++;
        _needleEffectTimer = 0.5;
        const skBonus = (typeof Skills !== 'undefined') ? Skills.getBonus() : {};
        const needleDmg = player.needleDmg + (skBonus.needleDmg || 0);
        const ts = CONFIG.TILE_SIZE;
        const cx = player.x + ts/2, cy = player.y + ts/2;
        const r = ts * 2;
        const box = { x: cx - r, y: cy - r, w: r * 2, h: r * 2 };
        BossManager.checkHit(box, needleDmg, flags);
        EnemyManager.needleBlast(player.x, player.y, needleDmg, flags);
        Engine.triggerShake(6, 10);
        Audio.playSe('needle');
        Analytics.logNeedleUse('boss', flags.needleUseCount);
        const boss = BossManager.getCurrentBoss();
        if (boss && boss.hp <= 0) _bossLastAction = 'needle_finish';
      } else {
        Audio.playSe('empty');
      }
    }

    EnemyManager.update(dt, player);
    BossManager.update(dt, player);
    if (typeof Particles !== 'undefined') Particles.update(dt);
    if (typeof DamageNumbers !== 'undefined') DamageNumbers.update(dt);

    // スキル: HP回復
    const skBonus = (typeof Skills !== 'undefined') ? Skills.getBonus() : {};
    if (skBonus.regen && skBonus.regen > 0) {
      if (!player._regenTimer) player._regenTimer = 0;
      player._regenTimer += dt;
      if (player._regenTimer >= 10) {
        player._regenTimer -= 10;
        player.hp = Math.min(player.maxHp, player.hp + Math.floor(skBonus.regen));
      }
    }

    player.needleRegenTimer += dt;
    const needleInterval = Math.max(10, Balance.NEEDLE.REGEN_INTERVAL + (skBonus.needleCD || 0));
    if (player.needleRegenTimer >= needleInterval) {
      player.needleRegenTimer -= needleInterval;
      if (player.needles < player.needleMax) player.needles++;
    }

    if (_settings.invincible) player.hp = player.maxHp;

    const boss = BossManager.getCurrentBoss();
    if (boss && boss.dead) {
      const timeMs = Date.now() - _bossStartTime;
      Analytics.logBossKill(boss.id, timeMs, player.hp);
      Collection.onEnemyKill(boss.id);

      if (boss.id === 'mushroom_king' && !flags.piece_a) {
        flags.piece_a = true;
        Inventory.addItem('piece_a');
        Collection.onItemGet('piece_a');
        _pendingBossDialog = '黄金蜂蜜のかけらAを手に入れた！';
      }
      if (boss.id === 'ice_beetle' && !flags.piece_b) {
        flags.piece_b = true;
        Inventory.addItem('piece_b');
        Collection.onItemGet('piece_b');
        _pendingBossDialog = '黄金蜂蜜のかけらBを手に入れた！';
      }
      if (boss.id === 'dark_queen' && !flags.piece_c) {
        flags.piece_c = true;
        Inventory.addItem('piece_c');
        Collection.onItemGet('piece_c');
      }

      if (boss.endingTrigger) {
        _endingType = NpcManager.getEndingType(flags, _bossLastAction);
        _pendingBossReturnScene = null;
        _changeScene(SCENE.ENDING);
        return;
      }

      const ts = CONFIG.TILE_SIZE;
      _pendingSpawn = { x: Math.floor(player.x / ts), y: Math.floor(player.y / ts) };
      const returnScene = _pendingBossReturnScene || SCENE.VILLAGE;
      _pendingBossReturnScene = null;
      _changeScene(returnScene);
      return;
    }

    if (player.hp <= 0) {
      Analytics.logPlayerDeath('boss', 'boss', player.hp);
      Audio.playSe('game_over');
      if (typeof Blessings !== 'undefined') Blessings.resetBlessings();
      _changeScene(SCENE.GAMEOVER);
    }
  }

  function _drawBossScene(ctx) {
    ctx.save();
    MapManager.draw(ctx);
    EnemyManager.draw(ctx);
    BossManager.draw(ctx);
    PlayerController.draw(ctx, player);
    PlayerController.drawAttackEffect(ctx, player, _attackEffectTimer);
    PlayerController.drawNeedleEffect(ctx, player, _needleEffectTimer);
    if (_levelUpEffectTimer > 0) {
      const ts = CONFIG.TILE_SIZE;
      const cx = player.x + ts / 2;
      const cy = player.y + ts / 2;
      const t = Math.max(0, Math.min(1, _levelUpEffectTimer));
      const r = (1 - t) * ts * 3;
      ctx.save();
      ctx.globalAlpha = t;
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    if (typeof Particles !== 'undefined') Particles.draw(ctx);
    if (typeof DamageNumbers !== 'undefined') DamageNumbers.draw(ctx);
    ctx.restore();

    _drawPanelBorders(ctx);
    _drawHud(ctx);
    Inventory.drawUI(ctx);
    _drawBottomPanel(ctx);
  }

  /* ============ エンディング ============ */
  function _initEndingScene() {
    _endingTimer = 0;
    _endingReady = false;
    if (!_endingType) _endingType = NpcManager.getEndingType(flags, _bossLastAction);
    if (_endingType === 'ending_a') Audio.playSceneBgm('ending_a');
    if (_endingType === 'ending_b') Audio.playSceneBgm('ending_b');
    if (_endingType === 'ending_c') Audio.playSceneBgm('ending_c');
  }

  function _finalizeEnding() {
    if (_endingType === 'ending_a') flags.ending_a_seen = true;
    if (_endingType === 'ending_b') flags.ending_b_seen = true;
    if (_endingType === 'ending_c') flags.ending_c_seen = true;
    flags.dungeon_unlocked = true;

    meta = SaveManager.loadMeta();
    if (_endingType === 'ending_a') meta.ending_a = true;
    if (_endingType === 'ending_b') meta.ending_b = true;
    if (_endingType === 'ending_c') meta.ending_c = true;
    if (!meta.first_clear_date) meta.first_clear_date = new Date().toISOString();
    SaveManager.saveMeta(meta);

    Analytics.logEnding(_endingType, flags.killCount, flags.needleUseCount, _playtime);
    _endingType = null;
    _bossLastAction = null;
    _changeScene(SCENE.TITLE);
  }

  function _updateEnding(dt) {
    _endingTimer += dt;
    if (_endingTimer > 2.0) _endingReady = true;
    if (_endingReady && (Engine.consumePress('interact') || Engine.consumePress('attack') || Engine.consumeClick())) {
      _finalizeEnding();
    }
  }

  function _drawEnding(ctx) {
    const W = CONFIG.CANVAS_WIDTH, H = CONFIG.CANVAS_HEIGHT;
    const titleKey = _endingType + '_title';
    const bodyKey = _endingType;
    const title = Lang.t(titleKey);
    const body = Lang.t(bodyKey);

    if (_endingType === 'ending_a') {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
    } else if (_endingType === 'ending_b') {
      const grd = ctx.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, '#2d3d6b');
      grd.addColorStop(1, '#f2c27b');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
    } else {
      const grd = ctx.createLinearGradient(0, 0, 0, H);
      grd.addColorStop(0, '#f5e1a4');
      grd.addColorStop(1, '#f0b84a');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
    }

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${CONFIG.FONT_LG}px monospace`;
    ctx.fillText(title, W / 2, PX(140));

    ctx.font = `${CONFIG.FONT_BASE}px monospace`;
    const lines = (body || '').split('\n');
    const startY = PX(240);
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], W / 2, startY + i * PX(28));
    }

    if (_endingReady && Math.sin(_endingTimer * 3) > 0) {
      ctx.font = `${CONFIG.FONT_SM}px monospace`;
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillText('Enter / クリックでタイトルへ', W / 2, H - PX(40));
    }
  }

  /* ============ ゲームオーバー ============ */
  let _goTimer=0;
  function _resetGameover(){_goTimer=0;}
  function _updateGameover(dt){
    _goTimer+=dt;
    if(_goTimer>1.5&&(Engine.consumePress('interact')||Engine.consumePress('attack')||Engine.consumeClick())){
      player.hp=player.maxHp; player.knockback.timer=0; player.hitStopFrames=0;
      player.attackCooldown=0; player.needleCooldown=0; player.invincibleTimer=0;
      _changeScene(SCENE.VILLAGE);
    }
  }
  function _drawGameover(ctx){
    ctx.fillStyle='rgba(0,0,0,0.85)';ctx.fillRect(0,0,CONFIG.CANVAS_WIDTH,CONFIG.CANVAS_HEIGHT);
    ctx.fillStyle='#e74c3c';ctx.font=`bold ${CONFIG.FONT_XL}px monospace`;ctx.textAlign='center';
    ctx.fillText(Lang.t('game_over'),CONFIG.CANVAS_WIDTH/2,CONFIG.CANVAS_HEIGHT/2-PX(30));
    if(_goTimer>1.5&&Math.sin(_goTimer*4)>0){
      ctx.fillStyle='#fff';ctx.font=`${CONFIG.FONT_BASE}px monospace`;
      ctx.fillText(Lang.t('continue_prompt'),CONFIG.CANVAS_WIDTH/2,CONFIG.CANVAS_HEIGHT/2+PX(30));
    }
  }

  /* ============ 巣窟シーン ============ */
  function _initDungeon(){
    Dungeon.start(flags.has_green_key);
    const map = Dungeon.getMapForRenderer();
    if(map){
      _currentMapName = 'dungeon';
      // MapManager互換でロード
      player.x = map.playerStart.x * CONFIG.TILE_SIZE;
      player.y = map.playerStart.y * CONFIG.TILE_SIZE;
      player.dir='down';
      _dialogActive=false; _dialogQueue=[];
      _attackEffectTimer=0; _needleEffectTimer=0;
      if(typeof EnemyManager!=='undefined') EnemyManager.spawnFromMap(map.enemies);
    }
    Audio.playSceneBgm('dungeon');
    _areaBannerText = _getMapDisplayName('dungeon');
    _areaBannerTimer = _areaBannerDuration;
    _miniMapDirty = true;
  }

  /* ============ HUD ============ */
  function _drawPanelBorders(ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(245,166,35,0.6)';
    ctx.lineWidth = PX(2);
    ctx.beginPath();
    ctx.moveTo(PANEL.RIGHT_X - PX(2), 0);
    ctx.lineTo(PANEL.RIGHT_X - PX(2), PANEL.MAP_H);
    ctx.moveTo(0, PANEL.BOTTOM_Y - PX(2));
    ctx.lineTo(CONFIG.CANVAS_WIDTH, PANEL.BOTTOM_Y - PX(2));
    ctx.stroke();
    ctx.restore();
  }

  function _getPanelBg(type) {
    const w = type === 'right' ? PANEL.RIGHT_W : PANEL.BOTTOM_W;
    const h = type === 'right' ? PANEL.RIGHT_H : PANEL.BOTTOM_H;
    let canvas = type === 'right' ? _rightPanelBg : _bottomPanelBg;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const c = canvas.getContext('2d');
      const grd = c.createLinearGradient(0, 0, 0, h);
      grd.addColorStop(0, '#0f1428');
      grd.addColorStop(1, '#0a0f1e');
      c.fillStyle = grd;
      c.fillRect(0, 0, w, h);
      c.fillStyle = 'rgba(255,255,255,0.03)';
      for (let i = 0; i < h; i += PX(24)) {
        c.fillRect(0, i, w, 1);
      }
      if (type === 'right') _rightPanelBg = canvas;
      else _bottomPanelBg = canvas;
    }
    return canvas;
  }

  function _drawHud(ctx){
    const rightBg = _getPanelBg('right');
    ctx.drawImage(rightBg, PANEL.RIGHT_X, PANEL.RIGHT_Y);

    // Section dividers
    ctx.save();
    ctx.strokeStyle = 'rgba(245,166,35,0.25)';
    ctx.lineWidth = PX(1);
    ctx.beginPath();
    ctx.moveTo(PANEL.RIGHT_X + PX(12), PX(140));
    ctx.lineTo(PANEL.RIGHT_X + PANEL.RIGHT_W - PX(12), PX(140));
    ctx.moveTo(PANEL.RIGHT_X + PX(12), PX(320));
    ctx.lineTo(PANEL.RIGHT_X + PANEL.RIGHT_W - PX(12), PX(320));
    ctx.moveTo(PANEL.RIGHT_X + PX(12), PX(420));
    ctx.lineTo(PANEL.RIGHT_X + PANEL.RIGHT_W - PX(12), PX(420));
    ctx.stroke();
    ctx.restore();

    _drawStatusSection(ctx);
    _drawMiniMapSection(ctx);
    _drawLogSection(ctx);
    _drawControlsSection(ctx);
  }

  function _drawDropFeed(ctx) {
    if (_dropLogs.length === 0) return;
    const feedW = 640;
    const x = CONFIG.CANVAS_WIDTH - feedW + PX(12);
    const y = PANEL.BOTTOM_Y + PX(12);
    const lineH = PX(18);
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = `${CONFIG.FONT_SM}px monospace`;
    for (let i = 0; i < _dropLogs.length; i++) {
      const entry = _dropLogs[i];
      const alpha = Math.max(0, Math.min(1, entry.timer / 3));
      ctx.fillStyle = `rgba(0,0,0,${0.6 * alpha})`;
      ctx.fillText(entry.text, x + PX(1), y + i * lineH + PX(1));
      ctx.fillStyle = entry.color || '#fff';
      ctx.globalAlpha = alpha;
      ctx.fillText(entry.text, x, y + i * lineH);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  function _drawStatusSection(ctx) {
    const x = PANEL.RIGHT_X + PX(16);
    const y = PANEL.RIGHT_Y + PX(12);
    const w = PANEL.RIGHT_W - PX(32);

    ctx.fillStyle = 'rgba(15,15,30,0.95)';
    ctx.fillRect(PANEL.RIGHT_X + PX(8), PANEL.RIGHT_Y + PX(6), PANEL.RIGHT_W - PX(16), PX(128));
    ctx.strokeStyle = '#F5A623';
    ctx.lineWidth = PX(2);
    ctx.strokeRect(PANEL.RIGHT_X + PX(8), PANEL.RIGHT_Y + PX(6), PANEL.RIGHT_W - PX(16), PX(128));

    ctx.fillStyle = '#F5A623';
    ctx.font = `bold ${CONFIG.FONT_LG}px monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('Lv.' + player.level, x, y);

    // EXP bar
    const barX = x;
    const barY = y + PX(40);
    const barW = w - PX(10);
    const barH = PX(12);
    const expNeed = Scaling.expForLevel(player.level);
    const expRate = Math.max(0, Math.min(1, player.exp / expNeed));
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(barX, barY, barW * expRate, barH);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.strokeRect(barX, barY, barW, barH);

    // Stats
    ctx.fillStyle = '#fff';
    ctx.font = `${CONFIG.FONT_SM}px monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const infoY = barY + PX(18);
    const sp = Skills.getPoints();
    ctx.fillText(`HP: ${player.hp}/${player.maxHp}`, x, infoY);
    ctx.fillText('ATK: ' + Math.floor(player.atk), x, infoY + PX(18));
    ctx.fillStyle = sp > 0 ? '#ff0' : '#fff';
    ctx.fillText('SP: ' + sp, x, infoY + PX(36));
    ctx.fillStyle = '#fff';
    ctx.fillText(`針: ${player.needles}/${player.needleMax}`, x, infoY + PX(54));
  }

  function _getMiniMapData() {
    if (Dungeon.isActive()) return Dungeon.getMapForRenderer();
    return MapManager.getCurrentMap ? MapManager.getCurrentMap() : null;
  }

  function _renderMiniMapBase(map, key) {
    if (!map) return;
    const size = PX(4);
    if (!_miniMapCanvas) {
      _miniMapCanvas = document.createElement('canvas');
      _miniMapCtx = _miniMapCanvas.getContext('2d');
    }
    _miniMapCanvas.width = map.cols * size;
    _miniMapCanvas.height = map.rows * size;
    const c = _miniMapCtx;
    c.clearRect(0, 0, _miniMapCanvas.width, _miniMapCanvas.height);
    for (let r = 0; r < map.rows; r++) {
      for (let col = 0; col < map.cols; col++) {
        const tile = map.data[r * map.cols + col];
        const solid = tile === MapManager.TILE.WALL || tile === MapManager.TILE.WATER ||
          tile === MapManager.TILE.TREE || tile === MapManager.TILE.HOUSE ||
          tile === MapManager.TILE.FENCE || tile === MapManager.TILE.WELL ||
          tile === MapManager.TILE.CHEST || tile === MapManager.TILE.STUMP ||
          tile === MapManager.TILE.BUSH || tile === MapManager.TILE.ANCHOR ||
          tile === MapManager.TILE.SEAL_WALL;
        c.fillStyle = solid ? '#141a2a' : '#2b3a55';
        c.fillRect(col * size, r * size, size, size);
      }
    }
    _miniMapDirty = false;
    _miniMapKey = key;
  }

  function _drawMiniMapSection(ctx) {
    const map = _getMiniMapData();
    if (!map) return;
    const key = `${_currentMapName}:${map.cols}x${map.rows}:${map.data.length}`;
    if (_miniMapDirty || _miniMapKey !== key) {
      _renderMiniMapBase(map, key);
    }

    const sectionX = PANEL.RIGHT_X;
    const sectionY = PX(140);
    const sectionW = PANEL.RIGHT_W;
    const sectionH = PX(180);
    const title = _getMapDisplayName(_currentMapName);
    ctx.fillStyle = '#fff';
    ctx.font = `${CONFIG.FONT_SM}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(title, sectionX + sectionW / 2, sectionY + PX(6));

    const mmW = _miniMapCanvas.width;
    const mmH = _miniMapCanvas.height;
    const mmX = sectionX + (sectionW - mmW) / 2;
    const mmY = sectionY + PX(28);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(mmX - PX(4), mmY - PX(4), mmW + PX(8), mmH + PX(8));
    ctx.strokeStyle = 'rgba(245,166,35,0.6)';
    ctx.strokeRect(mmX - PX(4), mmY - PX(4), mmW + PX(8), mmH + PX(8));
    ctx.drawImage(_miniMapCanvas, mmX, mmY);

    // Dots
    const size = PX(4);
    const pCol = Math.floor((player.x + CONFIG.TILE_SIZE / 2) / CONFIG.TILE_SIZE);
    const pRow = Math.floor((player.y + CONFIG.TILE_SIZE / 2) / CONFIG.TILE_SIZE);
    if (Math.sin(Date.now() / 200) > 0) {
      ctx.fillStyle = '#F5D142';
      ctx.fillRect(mmX + pCol * size, mmY + pRow * size, size, size);
    }
    if (map.npcs) {
      ctx.fillStyle = '#4aa3ff';
      for (const npc of map.npcs) {
        ctx.fillRect(mmX + npc.x * size, mmY + npc.y * size, size, size);
      }
    }
    if (map.exits) {
      ctx.fillStyle = '#2ecc71';
      for (const ex of map.exits) {
        ctx.fillRect(mmX + ex.x * size, mmY + ex.y * size, size, size);
      }
    }
    if (map.enemies) {
      ctx.fillStyle = '#e74c3c';
      for (const e of map.enemies) {
        ctx.fillRect(mmX + e.x * size, mmY + e.y * size, size, size);
      }
    }
  }

  function _drawLogSection(ctx) {
    const x = PANEL.RIGHT_X + PX(16);
    const y = PX(320);
    ctx.fillStyle = '#F5A623';
    ctx.font = `bold ${CONFIG.FONT_SM}px monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('ログ', x, y + PX(6));
    const now = Date.now();
    ctx.font = `${CONFIG.FONT_SM}px monospace`;
    for (let i = 0; i < _logEntries.length; i++) {
      const entry = _logEntries[i];
      const age = (now - entry.time) / 1000;
      const fade = Math.max(0.2, 1 - i * 0.18 - age * 0.08);
      ctx.fillStyle = `rgba(255,255,255,${fade})`;
      ctx.fillText(entry.text, x, y + PX(26) + i * PX(16));
    }
  }

  function _drawControlsSection(ctx) {
    ctx.fillStyle = 'rgba(245,166,35,0.7)';
    ctx.font = `${CONFIG.FONT_SM}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Z=こうげき  C=はり  X=ダッシュ  I=もちもの  ←→↑↓=いどう', PANEL.RIGHT_X + PANEL.RIGHT_W / 2, PX(450));
  }

  function _getBottomHintText() {
    const map = MapManager.getCurrentMap ? MapManager.getCurrentMap() : null;
    if (map && map.npcs) {
      const ts = CONFIG.TILE_SIZE;
      const pc = Math.floor((player.x + ts / 2) / ts);
      const pr = Math.floor((player.y + ts / 2) / ts);
      let nearest = null;
      let best = 999;
      for (const npc of map.npcs) {
        const d = Math.abs(npc.x - pc) + Math.abs(npc.y - pr);
        if (d < best) { best = d; nearest = npc; }
      }
      if (nearest && best <= 2) return `${nearest.name}が近くにいる`;
    }
    if (_currentMapName) return `${_getMapDisplayName(_currentMapName)}を探索中`;
    return '';
  }

  function _drawBottomPanel(ctx) {
    const bottomBg = _getPanelBg('bottom');
    ctx.drawImage(bottomBg, PANEL.BOTTOM_X, PANEL.BOTTOM_Y);

    if (_dialogActive) {
      _drawDialog(ctx);
      return;
    }

    if (_areaBannerTimer > 0 && _areaBannerText) {
      const t = _areaBannerTimer;
      const fadeIn = 0.3;
      const fadeOut = 0.4;
      let alpha = 1;
      if (t < fadeOut) alpha = t / fadeOut;
      if (t > _areaBannerDuration - fadeIn) alpha = Math.min(alpha, (_areaBannerDuration - t) / fadeIn);
      alpha = Math.max(0, Math.min(1, alpha));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#F5A623';
      ctx.font = `bold ${CONFIG.FONT_LG}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(_areaBannerText, PANEL.BOTTOM_W / 2, PANEL.BOTTOM_Y + PANEL.BOTTOM_H / 2);
      ctx.restore();
      return;
    }

    const hint = _getBottomHintText();
    if (hint) {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = `${CONFIG.FONT_BASE}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(hint, PANEL.BOTTOM_W / 2, PANEL.BOTTOM_Y + PANEL.BOTTOM_H / 2);
    }

    _drawDropFeed(ctx);
  }

  /* ============ シーン管理 ============ */
  function _changeScene(scene){
    Analytics.logSceneChange(_currentScene, scene);
    Analytics.onSceneChange();
    if ((scene === SCENE.TITLE || scene === SCENE.GAMEOVER) && typeof Blessings !== 'undefined') Blessings.resetBlessings();
    if (scene === SCENE.MENU) {
      const from = _currentScene;
      _menuFromGame = ![SCENE.TITLE, SCENE.PROLOGUE, SCENE.CREDITS, SCENE.SETTINGS, SCENE.COLLECTION, SCENE.MENU].includes(from);
    }
    _prevScene=_currentScene; _currentScene=scene; _onSceneEnter(scene);
  }

  function _onSceneEnter(scene){
    switch(scene){
      case SCENE.TITLE: _resetTitle(); Audio.playSceneBgm('title'); break;
      case SCENE.PROLOGUE: _resetPrologue(); break;
      case SCENE.MENU: _resetMenu(); break;
      case SCENE.VILLAGE:
        _initMapScene('village');
        if(_pendingSpawn){player.x=_pendingSpawn.x*CONFIG.TILE_SIZE;player.y=_pendingSpawn.y*CONFIG.TILE_SIZE;_pendingSpawn=null;}
        Shop.closeShop();
        if(!flags.quest_started) setTimeout(()=>_showDialog(Lang.t('mipurin_home')),500);
        break;
      case SCENE.FOREST_SOUTH:
        _initMapScene('forest_south');
        _pendingSpawn=null;  // ランダムマップではplayerStartを使うため破棄
        break;
      case SCENE.FOREST_NORTH:
        _initMapScene('forest_north');
        _pendingSpawn=null;  // ランダムマップではplayerStartを使うため破棄
        break;
      case SCENE.CAVE:
        _initMapScene('cave');
        _pendingSpawn=null;  // ランダムマップではplayerStartを使うため破棄
        break;
      case SCENE.FLOWER_FIELD:
        _initMapScene('flower_field');
        _pendingSpawn=null;  // ランダムマップではplayerStartを使うため破棄
        break;
      case SCENE.BOSS: _initBossScene(); break;
      case SCENE.ENDING: _initEndingScene(); break;
      case SCENE.DUNGEON: _initDungeon(); break;
      case SCENE.GAMEOVER:
        Audio.stopBgm();
        Audio.playSe('game_over');
        _resetGameover();
        break;
      case SCENE.SETTINGS: _resetSettings(); break;
      case SCENE.COLLECTION: Collection.open(); break;
      case SCENE.CREDITS: _creditsTimer=0; break;
    }
  }

  /* ============ メインループ ============ */
  function _update(dt){
    switch(_currentScene){
      case SCENE.TITLE: _updateTitle(dt);break;
      case SCENE.PROLOGUE: _updatePrologue(dt);break;
      case SCENE.MENU: _updateMenu(dt);break;
      case SCENE.SETTINGS: _updateSettings(dt);break;
      case SCENE.CREDITS: _updateCredits(dt);break;
      case SCENE.COLLECTION: _updateCollection(dt);break;
      case SCENE.VILLAGE: case SCENE.FOREST_SOUTH: case SCENE.FOREST_NORTH:
      case SCENE.CAVE: case SCENE.FLOWER_FIELD:
        _updateMapScene(dt);break;
      case SCENE.BOSS: _updateBossScene(dt);break;
      case SCENE.ENDING: _updateEnding(dt);break;
      case SCENE.DUNGEON: _updateMapScene(dt);break;
      case SCENE.GAMEOVER: _updateGameover(dt);break;
    }
  }

  function _draw(ctx){
    switch(_currentScene){
      case SCENE.TITLE: _drawTitle(ctx);break;
      case SCENE.PROLOGUE: _drawPrologue(ctx);break;
      case SCENE.MENU: _drawMenu(ctx);break;
      case SCENE.SETTINGS: _drawSettings(ctx);break;
      case SCENE.CREDITS: _drawCredits(ctx);break;
      case SCENE.COLLECTION: _drawCollection(ctx);break;
      case SCENE.VILLAGE: case SCENE.FOREST_SOUTH: case SCENE.FOREST_NORTH:
      case SCENE.CAVE: case SCENE.FLOWER_FIELD:
      case SCENE.DUNGEON:
        _drawMapScene(ctx);break;
      case SCENE.BOSS: _drawBossScene(ctx);break;
      case SCENE.ENDING: _drawEnding(ctx);break;
      case SCENE.GAMEOVER: _drawGameover(ctx);break;
      default: ctx.fillStyle='#000';ctx.fillRect(0,0,CONFIG.CANVAS_WIDTH,CONFIG.CANVAS_HEIGHT);break;
    }
    if(CONFIG.DEBUG){
      const txt = `v${CONFIG.VERSION}`;
      ctx.fillStyle='rgba(0,0,0,0.6)';
      ctx.fillRect(CONFIG.CANVAS_WIDTH - PX(92), PX(6), PX(86), PX(18));
      ctx.fillStyle='#0f0';
      ctx.font=`${CONFIG.FONT_SM}px monospace`;
      ctx.textAlign='right';
      ctx.textBaseline='middle';
      ctx.fillText(txt, CONFIG.CANVAS_WIDTH - PX(10), PX(15));
    }
  }

  /* ============ 永続化 ============ */
  function _setLoadingProgress(p){const b=document.getElementById('loading-bar-inner');if(b)b.style.width=p+'%';}

  /* ============ 起動 ============ */
  async function boot(){
    Engine.init();
    _setLoadingProgress(5);

  /* スプライトシート読み込み */
    if (typeof SpriteManager !== 'undefined') {
      SpriteManager.loadAll().then(() => { console.log('Sprites loaded'); });
    }

    // 設定復元
    _settings = SaveManager.loadSettings();
    if(_settings.colorblind) document.body.classList.add('colorblind');
    if(_settings.screenShake===false) Engine.setShakeEnabled(false);

    _setLoadingProgress(10);
    await Lang.load(CONFIG.LANG);
    _setLoadingProgress(20);

    _loadPrologueImages();
    _setLoadingProgress(30);

    // Audio初期化
    Audio.init();
    _setLoadingProgress(40);

    // Collection初期化
    Collection.init();
    Skills.init();

    // Shop初期化
    Shop.init();
    _setLoadingProgress(50);

    // スプライトシート読込
    if(typeof SHEET_LIST!=='undefined'&&SHEET_LIST.length>0){
      await TileEngine.loadSheets(SHEET_LIST,(loaded,total)=>{
        _setLoadingProgress(50+(loaded/total)*30);
      });
      TileEngine.init();
    }
    _setLoadingProgress(85);

    // Meta復元
    meta = SaveManager.loadMeta();
    if(meta.ending_a||meta.ending_b||meta.ending_c) flags.dungeon_unlocked=true;

    // Analytics開始
    Analytics.startSession();

    _setLoadingProgress(100);

    setTimeout(()=>{
      Engine.showCanvas();
      _changeScene(SCENE.TITLE);
      Engine.start(_update,_draw);
    },300);
  }

  return {
    boot, SCENE, player, flags,
    meta:()=>meta, getScene:()=>_currentScene, getPlayerLevel:()=>player.level,
    addLog: _addLog, addDropLog: _addDropLog
  };
})();

window.addEventListener('DOMContentLoaded',()=>{ Game.boot(); });
