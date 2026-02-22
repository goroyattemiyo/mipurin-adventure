/**
 * game.js - ゲーム初期化・状態管理・シーン遷移・全モジュール統合
 * ミプリンの冒険 v1.0.0
 */
const Game = (() => {

  /* ============ シーン定数 ============ */
  const SCENE = {
    LOADING:'loading', TITLE:'title', PROLOGUE:'prologue', MENU:'menu',
    VILLAGE:'village', FOREST_SOUTH:'forest_south', FOREST_NORTH:'forest_north',
    CAVE:'cave', FLOWER_FIELD:'flower_field', BOSS:'boss',
    ENDING:'ending', DUNGEON:'dungeon', SETTINGS:'settings',
    GAMEOVER:'gameover', COLLECTION:'collection', CREDITS:'credits'
  };

  let _currentScene = SCENE.LOADING;
  let _prevScene = null;
  let _prologueSeen = false;
  let _playtime = 0; // 秒

  /* ============ プレイヤー ============ */
  const player = {
    x:0, y:0,
    hp: Balance.PLAYER.HP, maxHp: Balance.PLAYER.HP,
    atk: Balance.PLAYER.ATK, speed: Balance.PLAYER.SPEED,
    needleDmg: Balance.PLAYER.NEEDLE_DMG,
    dir:'down', lastInputDir:'down',
    animFrame:0, animTimer:0,
    attackCooldown:0, needleCooldown:0,
    inputBuffer:0, inputBufferAction:null,
    knockback:{x:0,y:0,timer:0}, hitStopFrames:0,
    invincibleTimer:0, poisoned:false,
    _buffDef:null, _buffSpeed:null, _buffAtk:null, _buffVision:null
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

  /* ============ ダイアログ ============ */
  let _dialogText = '';
  let _dialogActive = false;
  let _dialogTimer = 0;
  let _dialogChars = 0;
  let _dialogQueue = []; // 連続会話用
  const DIALOG_SPEED = 0.04;

  function _showDialog(text) {
    _dialogText = text; _dialogActive = true;
    _dialogTimer = 0; _dialogChars = 0;
    Audio.playSe('dialog_open');
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
          Shop.closeShop();
          Audio.playSe('dialog_close');
        }
      }
    }
  }

  function _drawDialog(ctx) {
    if (!_dialogActive) return;
    const W = CONFIG.CANVAS_WIDTH, H = CONFIG.CANVAS_HEIGHT;
    const vis = _dialogText.substring(0, _dialogChars);
    const rawLines = vis.split('\n');
    const lineH = 22;
    const padding = 16;
    const minH = 80;

    // 横幅に収まるよう折り返し
    ctx.font = '16px monospace';
    const maxWidth = W - 40 - padding * 2;
    const lines = [];
    for (const raw of rawLines) {
      if (!raw) { lines.push(''); continue; }
      let rest = raw;
      while (rest.length > 0) {
        let cut = Math.min(28, rest.length);
        while (cut > 1 && ctx.measureText(rest.slice(0, cut)).width > maxWidth) cut--;
        lines.push(rest.slice(0, cut));
        rest = rest.slice(cut);
      }
    }

    const neededH = padding * 2 + lines.length * lineH + 10;
    const bh = Math.max(minH, Math.min(neededH, H * 0.45));
    const bx = 20, by = H - bh - 20, bw = W - 40;

    ctx.fillStyle = 'rgba(0,0,0,0.88)';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#F5A623';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);

    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const maxLines = Math.floor((bh - padding * 2) / lineH);
    for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
      ctx.fillText(lines[i], bx + padding, by + padding + i * lineH);
    }

    if (_dialogChars >= _dialogText.length && Math.sin(Date.now() / 300) > 0) {
      ctx.fillStyle = '#F5A623';
      ctx.fillText('▼', bx + bw - 32, by + bh - 24);
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
    if(cap&&cap!==key&&_prologueTextAlpha>0) _drawCaptionText(ctx,cap,CONFIG.CANVAS_HEIGHT-80,_prologueTextAlpha);
    ctx.save();ctx.globalAlpha=0.35;ctx.fillStyle='#fff';ctx.font='12px monospace';ctx.textAlign='center';
    ctx.fillText('Enter / タップ で次へ　　Esc でスキップ',CONFIG.CANVAS_WIDTH/2,CONFIG.CANVAS_HEIGHT-16);ctx.restore();
  }

  function _drawCaptionText(ctx,text,baseY,alpha){
    const lines=text.split('\n'),lh=30,startY=baseY-(lines.length-1)*lh/2;
    ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='20px monospace';
    for(let i=0;i<lines.length;i++){const ly=startY+i*lh;
      ctx.globalAlpha=alpha*0.6;ctx.fillStyle='#000';ctx.fillText(lines[i],CONFIG.CANVAS_WIDTH/2+2,ly+2);
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
    ctx.fillStyle='#F5A623';ctx.font='bold 48px monospace';ctx.textAlign='center';
    ctx.fillText(Lang.t('title'),CONFIG.CANVAS_WIDTH/2,280);
    if(_titleReady&&Math.sin(_titleTimer*4)>0){ctx.fillStyle='#fff';ctx.font='18px monospace';ctx.fillText(Lang.t('press_start'),CONFIG.CANVAS_WIDTH/2,400);}
    if(meta.golden_title){ctx.fillStyle='rgba(245,166,35,0.15)';ctx.fillRect(0,0,CONFIG.CANVAS_WIDTH,CONFIG.CANVAS_HEIGHT);}
    ctx.restore();
  }

  /* ============ メニュー ============ */
  const _menuItems=['menu_story','menu_dungeon','menu_collection','menu_settings','menu_credits'];
  let _menuCursor=0,_menuAlpha=0;
  function _resetMenu(){_menuCursor=0;_menuAlpha=0;}
  function _updateMenu(dt){
    _menuAlpha=Math.min(1,_menuAlpha+dt*2);
    if(Engine.consumePress('up')){_menuCursor=(_menuCursor-1+_menuItems.length)%_menuItems.length;Audio.playSe('menu_move');}
    if(Engine.consumePress('down')){_menuCursor=(_menuCursor+1)%_menuItems.length;Audio.playSe('menu_move');}
    if(Engine.consumePress('interact')||Engine.consumePress('attack')||Engine.consumeClick()){
      Audio.playSe('menu_select');
      switch(_menuItems[_menuCursor]){
        case'menu_story': _changeScene(SCENE.VILLAGE); break;
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
    ctx.fillStyle='#F5A623';ctx.font='bold 32px monospace';ctx.textAlign='center';
    ctx.fillText(Lang.t('title'),CONFIG.CANVAS_WIDTH/2,100);
    for(let i=0;i<_menuItems.length;i++){const y=220+i*50;const cur=(i===_menuCursor);
      if(cur){ctx.fillStyle='#F5A623';ctx.font='22px monospace';ctx.textAlign='right';ctx.fillText('▶ ',CONFIG.CANVAS_WIDTH/2-100,y);}
      ctx.fillStyle=cur?'#F5A623':'#aaa';ctx.font=cur?'bold 22px monospace':'20px monospace';ctx.textAlign='left';
      const label=Lang.t(_menuItems[i]);
      // 巣窟ロック表示
      if(_menuItems[i]==='menu_dungeon'&&!flags.dungeon_unlocked&&!meta.ending_a&&!meta.ending_b&&!meta.ending_c){
        ctx.fillStyle=cur?'#666':'#444';ctx.fillText(label+' 🔒',CONFIG.CANVAS_WIDTH/2-90,y);
      } else { ctx.fillText(label,CONFIG.CANVAS_WIDTH/2-90,y); }
    }
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='12px monospace';ctx.textAlign='center';
    ctx.fillText('↑↓: えらぶ　Z / Enter: けってい　Esc: もどる',CONFIG.CANVAS_WIDTH/2,CONFIG.CANVAS_HEIGHT-20);
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
    ctx.fillStyle='#F5A623';ctx.font='bold 24px monospace';ctx.textAlign='center';
    ctx.fillText('せってい',CONFIG.CANVAS_WIDTH/2,60);
    const labels={bgm:'BGM おんりょう',se:'SE おんりょう',speed:'ゲームスピード',invincible:'むてきモード',shake:'がめんゆれ',flash:'フラッシュ',colorblind:'いろよわモード',back:'← もどる'};
    for(let i=0;i<_settingsItems.length;i++){
      const y=120+i*44; const cur=(i===_settingsCursor);
      ctx.fillStyle=cur?'#F5A623':'#aaa';ctx.font=cur?'bold 18px monospace':'16px monospace';ctx.textAlign='left';
      if(cur){ctx.fillText('▶',160,y);}
      ctx.fillText(labels[_settingsItems[i]],190,y);
      // 値
      ctx.textAlign='right';ctx.fillStyle=cur?'#fff':'#888';ctx.font='16px monospace';
      const item=_settingsItems[i];
      if(item==='bgm') ctx.fillText(Math.round((_settings.bgmVolume||0.5)*100)+'%',CONFIG.CANVAS_WIDTH-180,y);
      else if(item==='se') ctx.fillText(Math.round((_settings.seVolume||0.7)*100)+'%',CONFIG.CANVAS_WIDTH-180,y);
      else if(item==='speed') ctx.fillText({slow:'ゆっくり',normal:'ふつう',fast:'はやい'}[_settings.gameSpeed||'normal'],CONFIG.CANVAS_WIDTH-180,y);
      else if(item==='invincible') ctx.fillText(_settings.invincible?'ON':'OFF',CONFIG.CANVAS_WIDTH-180,y);
      else if(item==='shake') ctx.fillText(_settings.screenShake!==false?'ON':'OFF',CONFIG.CANVAS_WIDTH-180,y);
      else if(item==='flash') ctx.fillText(_settings.flash!==false?'ON':'OFF',CONFIG.CANVAS_WIDTH-180,y);
      else if(item==='colorblind') ctx.fillText(_settings.colorblind?'ON':'OFF',CONFIG.CANVAS_WIDTH-180,y);
    }
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='12px monospace';ctx.textAlign='center';
    ctx.fillText('↑↓: えらぶ　←→/Z: へんこう　Esc: もどる',CONFIG.CANVAS_WIDTH/2,CONFIG.CANVAS_HEIGHT-20);
  }

  /* ============ クレジット ============ */
  let _creditsTimer=0;
  function _updateCredits(dt){
    _creditsTimer+=dt;
    if(Engine.consumePress('menu')||Engine.consumePress('interact')||Engine.consumeClick())_changeScene(SCENE.MENU);
  }
  function _drawCredits(ctx){
    ctx.fillStyle='#1a1a2a';ctx.fillRect(0,0,CONFIG.CANVAS_WIDTH,CONFIG.CANVAS_HEIGHT);
    ctx.fillStyle='#F5A623';ctx.font='bold 24px monospace';ctx.textAlign='center';
    ctx.fillText('クレジット',CONFIG.CANVAS_WIDTH/2,80);
    ctx.fillStyle='#ccc';ctx.font='16px monospace';
    const lines=['ミプリンの冒険','','企画・プログラム: goroyattemiyo','キャラクターデザイン: （クレジット）','音楽: Suno AI','',''+Lang.t('credits_thanks')];
    for(let i=0;i<lines.length;i++) ctx.fillText(lines[i],CONFIG.CANVAS_WIDTH/2,160+i*32);
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='12px monospace';
    ctx.fillText('Esc / Enter でもどる',CONFIG.CANVAS_WIDTH/2,CONFIG.CANVAS_HEIGHT-20);
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

  function _initMapScene(mapName) {
    _currentMapName = mapName;
    const map = MapManager.loadMap(mapName);
    if (!map) return;
    player.x = map.playerStart.x * CONFIG.TILE_SIZE;
    player.y = map.playerStart.y * CONFIG.TILE_SIZE;
    player.dir = 'down';
    _dialogActive = false; _dialogQueue = [];
    Shop.closeShop();
    _attackEffectTimer = 0; _needleEffectTimer = 0;
    if (typeof EnemyManager !== 'undefined') EnemyManager.spawnFromMap(map.enemies);
    Collection.onAreaVisit(mapName);
    Analytics.logAreaVisit(mapName, true);
    Audio.playSceneBgm(mapName);
  }

  function _updateMapScene(dt) {
    _playtime += dt;

    // インベントリ
    if (Engine.consumePress('inventory') && !_dialogActive) {
      if (Inventory.isOpen()) { Inventory.close(); }
      else { Inventory.open(); return; }
    }
    if (Inventory.isOpen()) {
      const result = Inventory.updateUI();
      if (result && result.action === 'use') {
        Inventory.useItem(result.itemId, player, flags);
        Analytics.logItemUse(result.itemId, _currentMapName);
      }
      return;
    }

    // ショップ
    if (Shop.isShopOpen()) {
      const result = Shop.updateShopUI(Inventory.getCount('pollen'));
      if (result) {
        if (result.action === 'buy_item') {
          Inventory.removeItem('pollen', result.cost);
          Inventory.addItem(result.itemId);
          Analytics.logShopBuy(result.itemId, result.cost);
          Audio.playSe('item_get');
        }
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

    // プレイヤー移動
    PlayerController.update(player, dt);

    // 攻撃（Zキー）
    if (Engine.consumePress('attack') && player.attackCooldown <= 0) {
      player.attackCooldown = Balance.PLAYER.ATTACK_COOLDOWN_SEC;
      _attackEffectTimer = 0.2;
      const box = PlayerController.getAttackBox(player);
      const hit = EnemyManager.checkAttackHit(box, Inventory.getEffectiveAtk(player), flags);
      if (hit) {
        player.hitStopFrames = Balance.PLAYER.HITSTOP_FRAMES_GIVE;
        Engine.triggerShake(2, 3);
        Audio.playSe('hit');
      } else {
        Audio.playSe('attack');
      }
    }

    // 針の一撃（Xキー）
    if (Engine.consumePress('needle') && player.needleCooldown <= 0 && player.hp > Balance.PLAYER.NEEDLE_HP_COST) {
      player.hp -= Balance.PLAYER.NEEDLE_HP_COST;
      player.needleCooldown = Balance.PLAYER.NEEDLE_COOLDOWN_SEC;
      flags.needleUseCount++;
      _needleEffectTimer = 0.5;
      EnemyManager.needleBlast(player.needleDmg, flags);
      Engine.triggerShake(6, 10);
      Audio.playSe('needle');
      Analytics.logNeedleUse(_currentMapName, flags.needleUseCount);
      // killCountフィルタ更新
      Audio.updateKillCountFilter(flags.killCount);
    }

    // 敵更新
    EnemyManager.update(dt, player);

    // 設定の無敵モード
    if (_settings.invincible) player.hp = player.maxHp;

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
            player.hp = player.maxHp;
            _showDialog(Lang.t('save_point_text'));
            Audio.playSe('save');
            break;
          case 'sign':
            const signKey = 'sign_' + _currentMapName;
            const signText = Lang.t(signKey);
            _showDialog(signText !== signKey ? signText : '…なにも書かれていない');
            break;
          case 'chest':
            _showDialog(Lang.t('chest_empty'));
            Audio.playSe('item_get');
            break;
          case 'stump':
            if (!flags.has_green_key) {
              flags.has_green_key = true;
              Inventory.addItem('green_key');
              Collection.onItemGet('green_key');
              Collection.onSpecialDiscover('env_stump');
              _showDialog('切株の中から\n【秘密の鍵】を見つけた！');
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
              Audio.playSe('door_open');
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
      _changeScene(SCENE.GAMEOVER);
    }
  }

  function _drawMapScene(ctx) {
    ctx.save();

    // killCount世界演出
    const worldFx = NpcManager.getWorldEffects(flags);
    if (worldFx.saturationShift < 0) {
      // 簡易彩度低下（CSS filter相当をcanvasで近似）
      ctx.filter = `saturate(${Math.max(0, 100 + worldFx.saturationShift)}%)`;
    }

    MapManager.draw(ctx);
    EnemyManager.draw(ctx);
    MapManager.drawNpcs(ctx);
    PlayerController.draw(ctx, player);
    PlayerController.drawAttackEffect(ctx, player, _attackEffectTimer);
    PlayerController.drawNeedleEffect(ctx, player, _needleEffectTimer);

    ctx.restore(); // filterを完全にリセット

    // 針ペナルティ: ビネット
    const penalties = NpcManager.getNeedlePenalty(flags);
    const vignette = penalties.find(p => p.effect === 'vignette');
    if (vignette) _drawVignette(ctx, vignette.intensity);

    _drawHud(ctx);
    Inventory.drawUI(ctx);
    Shop.drawShopUI(ctx, Inventory.getCount('pollen'));
    _drawDialog(ctx);
    if (CONFIG.DEBUG || location.search.includes('debug=1')) {
    ctx.save();
    ctx.font = '12px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.textAlign = 'right';
    ctx.fillText('v' + CONFIG.VERSION, CONFIG.CANVAS_WIDTH - 8, CONFIG.CANVAS_HEIGHT - 8);
    ctx.restore();
    }
  }

  function _drawVignette(ctx, intensity) {
    const W=CONFIG.CANVAS_WIDTH, H=CONFIG.CANVAS_HEIGHT;
    const grd = ctx.createRadialGradient(W/2,H/2,W*0.3, W/2,H/2,W*0.7);
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(1, `rgba(0,0,0,${intensity})`);
    ctx.fillStyle = grd;
    ctx.fillRect(0,0,W,H);
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
    ctx.fillStyle='#e74c3c';ctx.font='bold 40px monospace';ctx.textAlign='center';
    ctx.fillText(Lang.t('game_over'),CONFIG.CANVAS_WIDTH/2,CONFIG.CANVAS_HEIGHT/2-30);
    if(_goTimer>1.5&&Math.sin(_goTimer*4)>0){
      ctx.fillStyle='#fff';ctx.font='18px monospace';
      ctx.fillText(Lang.t('continue_prompt'),CONFIG.CANVAS_WIDTH/2,CONFIG.CANVAS_HEIGHT/2+30);
    }
  }

  /* ============ 巣窟シーン ============ */
  function _initDungeon(){
    Dungeon.start(flags.has_green_key);
    const map = Dungeon.getMapForRenderer();
    if(map){
      // MapManager互換でロード
      player.x = map.playerStart.x * CONFIG.TILE_SIZE;
      player.y = map.playerStart.y * CONFIG.TILE_SIZE;
      player.dir='down';
      _dialogActive=false; _dialogQueue=[];
      _attackEffectTimer=0; _needleEffectTimer=0;
      if(typeof EnemyManager!=='undefined') EnemyManager.spawnFromMap(map.enemies);
    }
    Audio.playSceneBgm('dungeon');
  }

  /* ============ HUD ============ */
  function _drawHud(ctx){
    const W=CONFIG.CANVAS_WIDTH;
    // HP
    const hpDanger = player.hp === 1;
    const hpBg = hpDanger && Math.sin(Date.now() / 120) > -0.3 ? 'rgba(220,0,0,0.72)' : 'rgba(0,0,0,0.5)';
    ctx.fillStyle=hpBg; ctx.fillRect(8,8,200,28);
    if (hpDanger) {
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.strokeRect(8,8,200,28);
    }
    ctx.fillStyle='#F5A623';ctx.font='14px monospace';ctx.textAlign='left';ctx.textBaseline='middle';
    ctx.fillText('HP:',14,22);
    for(let i=0;i<player.maxHp;i++){
      ctx.fillStyle=i<player.hp?'#FF6B6B':'#333'; ctx.fillRect(46+i*20,12,16,16);
      ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.strokeRect(46+i*20,12,16,16);
    }
    // ポーレン
    const pc = Inventory.getCount('pollen');
    if(pc>0){
      ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(8,40,100,20);
      ctx.fillStyle='#F1C40F';ctx.font='12px monospace';ctx.textAlign='left';
      ctx.fillText('● '+pc+' P',14,50);
    }
    // 敵数
    const ec = typeof EnemyManager!=='undefined' ? EnemyManager.getAliveCount() : 0;
    if(ec>0){
      ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(W-140,8,132,20);
      ctx.fillStyle='#ff9';ctx.font='12px monospace';ctx.textAlign='right';
      ctx.fillText('Enemy:'+ec+' Kill:'+flags.killCount,W-14,18);
    }
    // マップ名
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(8,64,120,20);
    ctx.fillStyle='#aaa';ctx.font='11px monospace';ctx.textAlign='left';
    ctx.fillText(_currentMapName,14,74);
    // 巣窟HUD
    if(Dungeon.isActive()) Dungeon.drawHud(ctx);

    // 操作ガイド（開始60秒後からフェードアウト）
    const guide='移動:矢印キー/WASD  攻撃:Z  必殺:X  会話:C/Enter  メニュー:Esc';
    const guideAlpha = Math.max(0, Math.min(1, 1 - Math.max(0, _playtime - 60) / 8));
    if (guideAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = guideAlpha;
      ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fillRect(8, CONFIG.CANVAS_HEIGHT - 34, W - 16, 24);
      ctx.fillStyle='#ddd'; ctx.font='12px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(guide, W/2, CONFIG.CANVAS_HEIGHT - 22);
      ctx.restore();
    }
  }

  /* ============ シーン管理 ============ */
  function _changeScene(scene){
    Analytics.logSceneChange(_currentScene, scene);
    Analytics.onSceneChange();
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
        if(_pendingSpawn){player.x=_pendingSpawn.x*CONFIG.TILE_SIZE;player.y=_pendingSpawn.y*CONFIG.TILE_SIZE;_pendingSpawn=null;}
        break;
      case SCENE.FOREST_NORTH:
        _initMapScene('forest_north');
        if(_pendingSpawn){player.x=_pendingSpawn.x*CONFIG.TILE_SIZE;player.y=_pendingSpawn.y*CONFIG.TILE_SIZE;_pendingSpawn=null;}
        break;
      case SCENE.CAVE:
        _initMapScene('cave');
        if(_pendingSpawn){player.x=_pendingSpawn.x*CONFIG.TILE_SIZE;player.y=_pendingSpawn.y*CONFIG.TILE_SIZE;_pendingSpawn=null;}
        break;
      case SCENE.FLOWER_FIELD:
        _initMapScene('flower_field');
        if(_pendingSpawn){player.x=_pendingSpawn.x*CONFIG.TILE_SIZE;player.y=_pendingSpawn.y*CONFIG.TILE_SIZE;_pendingSpawn=null;}
        break;
      case SCENE.DUNGEON: _initDungeon(); break;
      case SCENE.GAMEOVER: _resetGameover(); break;
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
      case SCENE.GAMEOVER: _drawGameover(ctx);break;
      default: ctx.fillStyle='#000';ctx.fillRect(0,0,CONFIG.CANVAS_WIDTH,CONFIG.CANVAS_HEIGHT);break;
    }
    if(CONFIG.DEBUG){
      const txt = `v${CONFIG.VERSION}`;
      ctx.fillStyle='rgba(0,0,0,0.6)';
      ctx.fillRect(CONFIG.CANVAS_WIDTH - 92, 6, 86, 18);
      ctx.fillStyle='#0f0';
      ctx.font='12px monospace';
      ctx.textAlign='right';
      ctx.textBaseline='middle';
      ctx.fillText(txt, CONFIG.CANVAS_WIDTH - 10, 15);
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

  return { boot, SCENE, player, flags, meta:()=>meta, getScene:()=>_currentScene };
})();

window.addEventListener('DOMContentLoaded',()=>{ Game.boot(); });
