/**
 * game.js - ゲーム初期化・状態管理・シーン遷移
 * ミプリンの冒険 v0.4.0
 */
const Game = (() => {

  const SCENE = {
    LOADING:'loading', TITLE:'title', PROLOGUE:'prologue', MENU:'menu',
    VILLAGE:'village', FOREST_SOUTH:'forest_south', FOREST_NORTH:'forest_north',
    CAVE:'cave', FLOWER_FIELD:'flower_field', BOSS:'boss',
    ENDING:'ending', DUNGEON:'dungeon', SETTINGS:'settings', GAMEOVER:'gameover'
  };

  let _currentScene = SCENE.LOADING;
  let _prevScene = null;
  let _prologueSeen = false;

  const player = {
    x:0, y:0, hp:CONFIG.PLAYER.HP, maxHp:CONFIG.PLAYER.HP,
    atk:CONFIG.PLAYER.ATK, speed:CONFIG.PLAYER.SPEED,
    needleDmg:CONFIG.PLAYER.NEEDLE_DMG,
    dir:'down', lastInputDir:'down', animFrame:0, animTimer:0,
    attackCooldown:0, needleCooldown:0,
    inputBuffer:0, inputBufferAction:null,
    knockback:{x:0,y:0,timer:0}, hitStopFrames:0
  };

  const flags = {
    quest_started:false, stump_hint:false, has_green_key:false,
    father_truth:false, seal_hint:false, queen_truth:false,
    seal_opened:false, has_queens_tear:false, has_hana_pot:false,
    honey_rule_known:false, collapse_seen:false,
    piece_a:false, piece_b:false, piece_c:false,
    ending_a_seen:false, ending_b_seen:false, ending_c_seen:false,
    dungeon_unlocked:false, killCount:0, needleUseCount:0,
    pacifist_interactions:0
  };

  const meta = {
    ending_a:false, ending_b:false, ending_c:false,
    dungeon_best:0, golden_title:false, title_motif:false
  };

  /* ============ 攻撃エフェクト ============ */
  let _attackEffectTimer = 0;
  let _needleEffectTimer = 0;

  /* ============ ダイアログ ============ */
  let _dialogText = '';
  let _dialogActive = false;
  let _dialogTimer = 0;
  let _dialogChars = 0;
  const DIALOG_SPEED = 0.04;

  function _showDialog(text) { _dialogText = text; _dialogActive = true; _dialogTimer = 0; _dialogChars = 0; }

  function _updateDialog(dt) {
    if (!_dialogActive) return;
    _dialogTimer += dt;
    _dialogChars = Math.min(_dialogText.length, Math.floor(_dialogTimer / DIALOG_SPEED));
    if (Engine.consumePress('interact') || Engine.consumePress('attack') || Engine.consumeClick()) {
      if (_dialogChars < _dialogText.length) { _dialogChars = _dialogText.length; _dialogTimer = _dialogText.length * DIALOG_SPEED; }
      else { _dialogActive = false; }
    }
  }

  function _drawDialog(ctx) {
    if (!_dialogActive) return;
    const W = CONFIG.CANVAS_WIDTH, H = CONFIG.CANVAS_HEIGHT;
    const bx=20, by=H-140, bw=W-40, bh=120;
    ctx.fillStyle='rgba(0,0,0,0.85)'; ctx.fillRect(bx,by,bw,bh);
    ctx.strokeStyle='#F5A623'; ctx.lineWidth=2; ctx.strokeRect(bx,by,bw,bh);
    ctx.fillStyle='#fff'; ctx.font='16px monospace'; ctx.textAlign='left'; ctx.textBaseline='top';
    const vis = _dialogText.substring(0, _dialogChars);
    const lines = vis.split('\n');
    for (let i=0; i<lines.length; i++) ctx.fillText(lines[i], bx+16, by+16+i*24);
    if (_dialogChars >= _dialogText.length && Math.sin(Date.now()/300)>0) {
      ctx.fillStyle='#F5A623'; ctx.fillText('▼', bx+bw-32, by+bh-28);
    }
  }

  /* ============ プロローグ ============ */
  const PROLOGUE_TOTAL = 10;
  const _prologueImages = [];
  let _prologueImagesLoaded = false;
  let _prologueIndex=0, _prologueAlpha=0, _prologueTextAlpha=0, _prologuePhase='fadein', _prologueTimer=0;
  const P_FADE_IN=1.0, P_HOLD=3.0, P_FADE_OUT=0.7, P_TEXT_DELAY=0.4;

  function _loadPrologueImages() {
    let loaded=0;
    for (let i=1; i<=PROLOGUE_TOTAL; i++) {
      const img=new Image(); const idx=i<10?'0'+i:''+i;
      img.src='assets/prologue/prologue_'+idx+'.webp';
      img.onload=()=>{loaded++;if(loaded>=PROLOGUE_TOTAL)_prologueImagesLoaded=true;};
      img.onerror=()=>{console.warn('missing:',img.src);loaded++;if(loaded>=PROLOGUE_TOTAL)_prologueImagesLoaded=true;};
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
        if(_prologueTimer>=P_FADE_IN){_prologuePhase='hold';_prologueTimer=0;_prologueAlpha=1;_prologueTextAlpha=1;}
        if(adv){_prologuePhase='fadeout';_prologueTimer=0;}break;
      case'hold':
        _prologueAlpha=1;_prologueTextAlpha=1;
        if(_prologueTimer>=P_HOLD||adv){_prologuePhase='fadeout';_prologueTimer=0;}break;
      case'fadeout':
        _prologueAlpha=Math.max(0,1-_prologueTimer/P_FADE_OUT);_prologueTextAlpha=_prologueAlpha;
        if(_prologueTimer>=P_FADE_OUT){_prologueIndex++;
          if(_prologueIndex>=PROLOGUE_TOTAL)_prologuePhase='done';
          else{_prologuePhase='fadein';_prologueTimer=0;_prologueAlpha=0;_prologueTextAlpha=0;}}break;
    }
    if(_prologuePhase==='done')_changeScene(SCENE.MENU);
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
    if(cap&&cap!==key&&_prologueTextAlpha>0)_drawCaptionText(ctx,cap,CONFIG.CANVAS_HEIGHT-80,_prologueTextAlpha);
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
      if(!_prologueSeen){_prologueSeen=true;_changeScene(SCENE.PROLOGUE);}else{_changeScene(SCENE.MENU);}
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
  const _menuItems=['menu_story','menu_dungeon','menu_settings','menu_credits'];
  let _menuCursor=0,_menuAlpha=0;
  function _resetMenu(){_menuCursor=0;_menuAlpha=0;}
  function _updateMenu(dt){
    _menuAlpha=Math.min(1,_menuAlpha+dt*2);
    if(Engine.consumePress('up'))_menuCursor=(_menuCursor-1+_menuItems.length)%_menuItems.length;
    if(Engine.consumePress('down'))_menuCursor=(_menuCursor+1)%_menuItems.length;
    if(Engine.consumePress('interact')||Engine.consumePress('attack')||Engine.consumeClick()){
      switch(_menuItems[_menuCursor]){
        case'menu_story':_changeScene(SCENE.VILLAGE);break;
        case'menu_dungeon':if(CONFIG.DEBUG)console.log('→無限巣窟（未実装）');break;
        case'menu_settings':if(CONFIG.DEBUG)console.log('→せってい（未実装）');break;
        case'menu_credits':if(CONFIG.DEBUG)console.log('→クレジット（未実装）');break;
      }
    }
    if(Engine.consumePress('menu'))_changeScene(SCENE.TITLE);
  }
  function _drawMenu(ctx){
    ctx.fillStyle='#1a1a2a';ctx.fillRect(0,0,CONFIG.CANVAS_WIDTH,CONFIG.CANVAS_HEIGHT);
    ctx.save();ctx.globalAlpha=_menuAlpha;
    ctx.fillStyle='#F5A623';ctx.font='bold 32px monospace';ctx.textAlign='center';
    ctx.fillText(Lang.t('title'),CONFIG.CANVAS_WIDTH/2,100);
    for(let i=0;i<_menuItems.length;i++){const y=240+i*60;const cur=(i===_menuCursor);
      if(cur){ctx.fillStyle='#F5A623';ctx.font='22px monospace';ctx.textAlign='right';ctx.fillText('▶ ',CONFIG.CANVAS_WIDTH/2-100,y);}
      ctx.fillStyle=cur?'#F5A623':'#aaa';ctx.font=cur?'bold 22px monospace':'20px monospace';ctx.textAlign='left';
      ctx.fillText(Lang.t(_menuItems[i]),CONFIG.CANVAS_WIDTH/2-90,y);}
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='12px monospace';ctx.textAlign='center';
    ctx.fillText('↑↓: えらぶ　Z / Enter: けってい　Esc: もどる',CONFIG.CANVAS_WIDTH/2,CONFIG.CANVAS_HEIGHT-20);
    ctx.restore();
  }

  /* ============ 共通マップシーン ============ */
  function _initMapScene(mapName) {
    const map = MapManager.loadMap(mapName);
    if (!map) return;
    player.x = map.playerStart.x * CONFIG.TILE_SIZE;
    player.y = map.playerStart.y * CONFIG.TILE_SIZE;
    player.dir = 'down';
    _dialogActive = false;
    _attackEffectTimer = 0;
    _needleEffectTimer = 0;
    EnemyManager.spawnFromMap(map.enemies);
  }

  function _updateMapScene(dt) {
    /* ダイアログ中 */
    if (_dialogActive) { _updateDialog(dt); return; }

    /* エフェクトタイマー */
    if (_attackEffectTimer > 0) _attackEffectTimer -= dt;
    if (_needleEffectTimer > 0) _needleEffectTimer -= dt;

    /* プレイヤー移動 */
    PlayerController.update(player, dt);

    /* 攻撃（Zキー） */
    if (Engine.consumePress('attack') && player.attackCooldown <= 0) {
      player.attackCooldown = CONFIG.PLAYER.ATTACK_COOLDOWN / CONFIG.FPS;
      _attackEffectTimer = 0.2;
      const box = PlayerController.getAttackBox(player);
      const hit = EnemyManager.checkAttackHit(box, player.atk, flags);
      if (hit) { player.hitStopFrames = 2; Engine.triggerShake(2, 3); }
    }

    /* 針の一撃（Xキー） */
    if (Engine.consumePress('needle') && player.needleCooldown <= 0 && player.hp > CONFIG.PLAYER.NEEDLE_HP_COST) {
      player.hp -= CONFIG.PLAYER.NEEDLE_HP_COST;
      player.needleCooldown = CONFIG.PLAYER.NEEDLE_COOLDOWN / CONFIG.FPS;
      _needleEffectTimer = 0.5;
      EnemyManager.needleBlast(player.needleDmg, flags);
      Engine.triggerShake(6, 10);
    }

    /* 敵更新 */
    EnemyManager.update(dt, player);

    /* インタラクション */
    const interact = PlayerController.checkInteract(player);
    if (interact) {
      switch (interact.type) {
        case 'npc': _handleNpcTalk(interact.npc); break;
        case 'save': _showDialog(Lang.t('save_point_text')); break;
        case 'sign': _handleSign(); break;
        case 'chest': _showDialog(Lang.t('chest_empty')); break;
      }
    }

    /* 出口判定 */
    const exit = PlayerController.checkExit(player);
    if (exit) {
      const sceneMap = {
        'village': SCENE.VILLAGE, 'forest_south': SCENE.FOREST_SOUTH,
        'forest_north': SCENE.FOREST_NORTH, 'cave': SCENE.CAVE,
        'flower_field': SCENE.FLOWER_FIELD
      };
      const nextScene = sceneMap[exit.to];
      if (nextScene) {
        _pendingSpawn = { x: exit.spawnX, y: exit.spawnY };
        _changeScene(nextScene);
      } else {
        _showDialog(Lang.t('area_locked'));
        player.y += (exit.spawnY > 7 ? -1 : 1) * CONFIG.TILE_SIZE;
      }
    }

    /* 死亡判定 */
    if (player.hp <= 0) { _changeScene(SCENE.GAMEOVER); }
  }

  let _pendingSpawn = null;

  function _drawMapScene(ctx) {
    MapManager.draw(ctx);
    EnemyManager.draw(ctx);
    MapManager.drawNpcs(ctx);
    PlayerController.draw(ctx, player);
    PlayerController.drawAttackEffect(ctx, player, _attackEffectTimer);
    PlayerController.drawNeedleEffect(ctx, player, _needleEffectTimer);
    _drawHud(ctx);
    _drawDialog(ctx);
  }

  function _handleSign() {
    const mapName = MapManager.getCurrentMapName();
    const key = 'sign_' + mapName;
    const text = Lang.t(key);
    _showDialog(text !== key ? text : '...なにも書かれていない');
  }

  /* ============ NPC会話 ============ */
  function _handleNpcTalk(npc) {
    let text = '';
    switch (npc.id) {
      case 'hatch':
        if (!flags.quest_started) {
          flags.quest_started = true;
          text = Lang.t('npc_hatch_first');
        } else if (flags.killCount === 0) {
          text = Lang.t('npc_hatch_pacifist');
        } else if (flags.killCount > 10) {
          text = Lang.t('npc_hatch_violent');
        } else {
          text = Lang.t('npc_hatch_normal');
        }
        break;
      case 'miel':
        if (flags.needleUseCount === 0) { text = Lang.t('npc_miel_normal'); }
        else if (flags.needleUseCount >= 3) { text = Lang.t('npc_miel_worried'); }
        else { text = Lang.t('npc_miel_hint'); }
        break;
      case 'marche': text = Lang.t('npc_marche'); break;
      case 'bee': text = Lang.t('npc_bee'); break;
      case 'pore':
        if (flags.killCount > 5) { text = Lang.t('npc_pore_sad'); }
        else { text = Lang.t('npc_pore_normal'); }
        break;
      case 'navi':
        if (!flags.stump_hint) { flags.stump_hint = true; text = Lang.t('npc_navi_first'); }
        else { text = Lang.t('npc_navi_repeat'); }
        break;
      default: text = npc.name + ':\n「...」';
    }
    _showDialog(text);
    flags.pacifist_interactions++;
  }

  /* ============ ゲームオーバー ============ */
  let _goTimer = 0;
  function _resetGameover() { _goTimer = 0; }
  function _updateGameover(dt) {
    _goTimer += dt;
    if (_goTimer > 1.5 && (Engine.consumePress('interact') || Engine.consumePress('attack') || Engine.consumeClick())) {
      /* HPを回復して村に戻す */
      player.hp = player.maxHp;
      player.knockback.timer = 0;
      player.hitStopFrames = 0;
      player.attackCooldown = 0;
      player.needleCooldown = 0;
      _changeScene(SCENE.VILLAGE);
    }
  }
  function _drawGameover(ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0,0,CONFIG.CANVAS_WIDTH,CONFIG.CANVAS_HEIGHT);
    ctx.fillStyle = '#e74c3c'; ctx.font = 'bold 40px monospace'; ctx.textAlign = 'center';
    ctx.fillText(Lang.t('game_over'), CONFIG.CANVAS_WIDTH/2, CONFIG.CANVAS_HEIGHT/2-30);
    if (_goTimer > 1.5) {
      if (Math.sin(_goTimer*4) > 0) {
        ctx.fillStyle = '#fff'; ctx.font = '18px monospace';
        ctx.fillText(Lang.t('continue_prompt'), CONFIG.CANVAS_WIDTH/2, CONFIG.CANVAS_HEIGHT/2+30);
      }
    }
  }

  /* ============ HUD ============ */
  function _drawHud(ctx) {
    const W = CONFIG.CANVAS_WIDTH;
    ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(8,8,200,28);
    ctx.fillStyle='#F5A623'; ctx.font='14px monospace'; ctx.textAlign='left'; ctx.textBaseline='middle';
    ctx.fillText('HP:',14,22);
    for(let i=0;i<player.maxHp;i++){
      ctx.fillStyle=i<player.hp?'#FF6B6B':'#333'; ctx.fillRect(46+i*20,12,16,16);
      ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.strokeRect(46+i*20,12,16,16);
    }

    /* 敵数 */
    const ec = EnemyManager.getAliveCount();
    if (ec > 0) {
      ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(W-140,8,132,20);
      ctx.fillStyle='#ff9'; ctx.font='12px monospace'; ctx.textAlign='right';
      ctx.fillText('Enemy: '+ec+' | Kill: '+flags.killCount, W-14, 18);
    }

    /* マップ名 */
    ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(8,40,120,20);
    ctx.fillStyle='#aaa'; ctx.font='11px monospace'; ctx.textAlign='left';
    ctx.fillText(MapManager.getCurrentMapName(), 14, 50);
  }

  /* ============ シーン管理 ============ */
  function _changeScene(scene) { _prevScene=_currentScene; _currentScene=scene; _onSceneEnter(scene); }

  function _onSceneEnter(scene) {
    switch (scene) {
      case SCENE.TITLE: _resetTitle(); break;
      case SCENE.PROLOGUE: _resetPrologue(); break;
      case SCENE.MENU: _resetMenu(); break;
      case SCENE.VILLAGE:
        _initMapScene('village');
        if (_pendingSpawn) { player.x=_pendingSpawn.x*CONFIG.TILE_SIZE; player.y=_pendingSpawn.y*CONFIG.TILE_SIZE; _pendingSpawn=null; }
        if (!flags.quest_started) setTimeout(()=>_showDialog(Lang.t('mipurin_home')),500);
        break;
      case SCENE.FOREST_SOUTH:
        _initMapScene('forest_south');
        if (_pendingSpawn) { player.x=_pendingSpawn.x*CONFIG.TILE_SIZE; player.y=_pendingSpawn.y*CONFIG.TILE_SIZE; _pendingSpawn=null; }
        break;
      case SCENE.FOREST_NORTH:
        _initMapScene('forest_north');
        if (_pendingSpawn) { player.x=_pendingSpawn.x*CONFIG.TILE_SIZE; player.y=_pendingSpawn.y*CONFIG.TILE_SIZE; _pendingSpawn=null; }
        break;
      case SCENE.GAMEOVER: _resetGameover(); break;
    }
  }

  /* ============ マスター ============ */
  function _update(dt) {
    switch (_currentScene) {
      case SCENE.TITLE: _updateTitle(dt); break;
      case SCENE.PROLOGUE: _updatePrologue(dt); break;
      case SCENE.MENU: _updateMenu(dt); break;
      case SCENE.VILLAGE: case SCENE.FOREST_SOUTH: case SCENE.FOREST_NORTH:
      case SCENE.CAVE: case SCENE.FLOWER_FIELD:
        _updateMapScene(dt); break;
      case SCENE.GAMEOVER: _updateGameover(dt); break;
    }
  }

  function _draw(ctx) {
    switch (_currentScene) {
      case SCENE.TITLE: _drawTitle(ctx); break;
      case SCENE.PROLOGUE: _drawPrologue(ctx); break;
      case SCENE.MENU: _drawMenu(ctx); break;
      case SCENE.VILLAGE: case SCENE.FOREST_SOUTH: case SCENE.FOREST_NORTH:
      case SCENE.CAVE: case SCENE.FLOWER_FIELD:
        _drawMapScene(ctx); break;
      case SCENE.GAMEOVER: _drawGameover(ctx); break;
      default: ctx.fillStyle='#000'; ctx.fillRect(0,0,CONFIG.CANVAS_WIDTH,CONFIG.CANVAS_HEIGHT); break;
    }
    if (CONFIG.DEBUG) {
      ctx.fillStyle='#0f0';ctx.font='12px monospace';ctx.textAlign='left';
      ctx.fillText('Scene:'+_currentScene+' | v'+CONFIG.VERSION,4,CONFIG.CANVAS_HEIGHT-6);
    }
  }

  /* ============ メタ永続化 ============ */
  function _loadMeta(){try{const s=localStorage.getItem('mipurin_meta');if(s)Object.assign(meta,JSON.parse(s));}catch(e){}}
  function _saveMeta(){try{localStorage.setItem('mipurin_meta',JSON.stringify(meta));}catch(e){}}
  function _setLoadingProgress(p){const b=document.getElementById('loading-bar-inner');if(b)b.style.width=p+'%';}

  /* ============ 起動 ============ */
  async function boot(){
    Engine.init(); _setLoadingProgress(10);
    await Lang.load(CONFIG.LANG); _setLoadingProgress(30);
    _loadPrologueImages(); _setLoadingProgress(40);
    if(typeof SHEET_LIST!=='undefined'&&SHEET_LIST.length>0){
      await TileEngine.loadSheets(SHEET_LIST,(l,t)=>_setLoadingProgress(40+(l/t)*40));TileEngine.init();}
    _setLoadingProgress(90); _loadMeta(); _setLoadingProgress(100);
    setTimeout(()=>{Engine.showCanvas();_changeScene(SCENE.TITLE);Engine.start(_update,_draw);},300);
  }

  return {boot,SCENE,player,flags,meta,getScene:()=>_currentScene};
})();

window.addEventListener('DOMContentLoaded',()=>{Game.boot();});
