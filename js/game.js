'use strict';
/* ============================================================
   ミプリンの冒険 v3.0 — Cute Roguelike
   js/game.js  (all-in-one)
   ============================================================ */

/* ===== CONSTANTS ===== */
const CW=960,CH=540,TILE=48,COLS=20,ROWS=11,FPS=60;
const cvs=document.getElementById('c'),ctx=cvs.getContext('2d');

/* ===== INPUT ===== */
const keys={},pressed={};
window.addEventListener('keydown',e=>{if(!keys[e.code])pressed[e.code]=true;keys[e.code]=true;e.preventDefault();});
window.addEventListener('keyup',e=>{keys[e.code]=false;});
function isDown(c){return!!keys[c]}
function wasPressed(c){const v=!!pressed[c];pressed[c]=false;return v}

/* ===== AUDIO ===== */
let actx=null;
function initAudio(){if(!actx)actx=new(window.AudioContext||window.webkitAudioContext);if(actx.state==='suspended')actx.resume()}
window.addEventListener('keydown',initAudio,{once:false});
function playSE(freq,dur,type,vol){
  if(!actx)return;const o=actx.createOscillator(),g=actx.createGain();
  o.type=type||'sine';o.frequency.value=freq*(0.95+Math.random()*0.1);
  g.gain.value=vol||0.15;g.gain.exponentialRampToValueAtTime(0.001,actx.currentTime+dur);
  o.connect(g);g.connect(actx.destination);o.start();o.stop(actx.currentTime+dur);
}
function seAttack(){playSE(880,0.08,'square',0.1);playSE(1200,0.06,'sine',0.08)}
function seHit(){playSE(600,0.1,'sine',0.12);playSE(900,0.05,'sine',0.08)}
function seKill(){playSE(1400,0.15,'sine',0.12);playSE(1800,0.1,'sine',0.08);playSE(700,0.2,'triangle',0.1)}
function seHurt(){playSE(200,0.2,'sawtooth',0.1);playSE(150,0.15,'square',0.08)}
function seDash(){playSE(500,0.1,'sine',0.08);playSE(800,0.06,'sine',0.06)}
function seClear(){for(let i=0;i<5;i++)setTimeout(()=>playSE(800+i*200,0.2,'sine',0.1),i*80)}
function seSelect(){playSE(1000,0.1,'sine',0.1);playSE(1500,0.08,'sine',0.08)}
function seBless(){playSE(600,0.15,'sine',0.12);playSE(900,0.12,'sine',0.1);playSE(1200,0.1,'sine',0.08)}
function seEquip(){playSE(700,0.12,'triangle',0.12);playSE(1100,0.08,'sine',0.1)}
function seItem(){playSE(1200,0.1,'sine',0.12);playSE(1600,0.06,'sine',0.08)}
function seCollect(){playSE(800,0.15,'sine',0.1);playSE(1000,0.12,'sine',0.1);playSE(1400,0.1,'sine',0.08)}

/* ===== BGM LOADER (placeholder — loads mp3 when available) ===== */
const BGM={current:null,el:null};
function playBGM(name){
  const path='assets/music/'+name+'.mp3';
  if(BGM.current===name)return;
  if(BGM.el){BGM.el.pause();BGM.el=null}
  const a=new Audio(path);a.loop=true;a.volume=0.3;
  a.play().catch(()=>{});BGM.el=a;BGM.current=name;
}
function stopBGM(){if(BGM.el){BGM.el.pause();BGM.el=null;BGM.current=null}}

/* ===== UTILS ===== */
function clamp(v,lo,hi){return v<lo?lo:v>hi?hi:v}
function rectOverlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function lerp(a,b,t){return a+(b-a)*t}
function rnd(a,b){return a+Math.random()*(b-a)}
function rndInt(a,b){return Math.floor(rnd(a,b+1))}
function tileAt(map,c,r){if(c<0||c>=COLS||r<0||r>=ROWS)return 1;return map[r*COLS+c]}

/* ===== SPRITE ===== */
const spriteImg=new Image();spriteImg.src='assets/mipurin.png';
let spriteLoaded=false;spriteImg.onload=()=>{spriteLoaded=true};
const SPRITE_FRAMES={down:{sx:0,sy:0,sw:250,sh:250},up:{sx:250,sy:0,sw:250,sh:250},left:{sx:0,sy:250,sw:250,sh:250},right:{sx:250,sy:250,sw:250,sh:250}};

/* ===== THEMES ===== */
const THEMES=[
  {name:'はらっぱ',bg:'#c8e6c9',wall:'#81c784',floor:'#e8f5e9',accent:'#66bb6a',deco:'🌸',bgm:'forest_south'},
  {name:'おかしの国',bg:'#f8bbd0',wall:'#f06292',floor:'#fce4ec',accent:'#ec407a',deco:'🍬',bgm:'shop'},
  {name:'ほしぞら',bg:'#c5cae9',wall:'#7986cb',floor:'#e8eaf6',accent:'#5c6bc0',deco:'⭐',bgm:'cave'},
  {name:'うみべ',bg:'#b2ebf2',wall:'#4dd0e1',floor:'#e0f7fa',accent:'#26c6da',deco:'🐚',bgm:'flower_field'},
  {name:'おしろ',bg:'#fff9c4',wall:'#ffd54f',floor:'#fffde7',accent:'#ffca28',deco:'👑',bgm:'nest'}
];
function getTheme(){return THEMES[(floor-1)%THEMES.length]}

/* ===== MAP GENERATION ===== */
function generateRoom(fl){
  const map=[];
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    if(r===0||r===ROWS-1||c===0||c===COLS-1)map.push(1);else map.push(0);
  }
  const pillars=2+Math.min(fl,6);let s=fl*7+13;
  function pRnd(){s=(s*16807+11)%2147483647;return(s&0x7fffffff)/2147483647}
  for(let i=0;i<pillars;i++){
    let tries=0,pc,pr;
    do{pc=2+Math.floor(pRnd()*(COLS-4));pr=2+Math.floor(pRnd()*(ROWS-4));tries++}
    while(tries<30&&(tileAt(map,pc,pr)===1||tileAt(map,pc-1,pr)===1||tileAt(map,pc+1,pr)===1||tileAt(map,pc,pr-1)===1||tileAt(map,pc,pr+1)===1||(Math.abs(pc-10)<3&&Math.abs(pr-5)<3)));
    if(tries<30){map[pr*COLS+pc]=1;if(pc+1<COLS-1&&pRnd()>0.4)map[pr*COLS+pc+1]=1}
  }
  return map;
}

/* ===== PARTICLES ===== */
let particles=[];
function addParticle(x,y,type,count){
  for(let i=0;i<(count||1);i++){
    const a=rnd(0,Math.PI*2),sp=rnd(30,120);
    particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,maxLife:rnd(0.3,0.7),type,size:rnd(3,8),
      color:type==='star'?['#ffeb3b','#ff9800','#e91e63','#9c27b0'][rndInt(0,3)]:type==='poof'?['#f8bbd0','#e1bee7','#fff9c4'][rndInt(0,2)]:'#fff'});
  }
}
function updateParticles(dt){
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=200*dt;p.vx*=0.97;p.life-=dt/p.maxLife;
    if(p.life<=0)particles.splice(i,1);
  }
}
function drawParticles(){
  for(const p of particles){
    ctx.globalAlpha=Math.max(0,p.life);
    if(p.type==='star'){ctx.fillStyle=p.color;drawStar(p.x,p.y,p.size,p.size*0.4,5)}
    else{ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size*p.life,0,Math.PI*2);ctx.fill()}
  }
  ctx.globalAlpha=1;
}
function drawStar(cx,cy,or,ir,n){
  ctx.beginPath();
  for(let i=0;i<n*2;i++){const a=-Math.PI/2+i*Math.PI/n,r=i%2===0?or:ir;
    if(i===0)ctx.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);else ctx.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}
  ctx.closePath();ctx.fill();
}

/* ===== DAMAGE NUMBERS ===== */
let dmgNums=[];
function addDmgNum(x,y,val,color){dmgNums.push({x,y,val,color:color||'#fff',life:0.8,vy:-60})}
function updateDmgNums(dt){for(let i=dmgNums.length-1;i>=0;i--){const d=dmgNums[i];d.y+=d.vy*dt;d.vy*=0.95;d.life-=dt;if(d.life<=0)dmgNums.splice(i,1)}}
function drawDmgNums(){for(const d of dmgNums){ctx.globalAlpha=clamp(d.life/0.3,0,1);ctx.fillStyle=d.color;ctx.font='bold 16px sans-serif';ctx.textAlign='center';ctx.fillText(d.val,d.x,d.y)}ctx.globalAlpha=1}

/* ===== SCREEN SHAKE & HITSTOP ===== */
let shakeTimer=0,shakeIntensity=0,hitstopTimer=0;
function doShake(i,d){shakeIntensity=i;shakeTimer=d}
function doHitstop(f){hitstopTimer=Math.max(hitstopTimer,f)}

/* ===== WEAPON DEFINITIONS ===== */
const WEAPONS=[
  {id:'hana_needle',name:'はなのハリ',atk:2,speed:1.2,range:40,arc:Math.PI/2,dur:0.10,cd:0.22,desc:'みぷりんの最初のハリ',icon:'🌸',rarity:'normal',fx:null},
  {id:'wax_needle',name:'みつろうのハリ',atk:4,speed:1.0,range:44,arc:Math.PI/2,dur:0.12,cd:0.25,desc:'蜜蝋で固めた丈夫なハリ',icon:'🕯️',rarity:'normal',fx:null},
  {id:'silver_needle',name:'ぎんのハリ',atk:7,speed:1.0,range:44,arc:Math.PI/2,dur:0.12,cd:0.25,desc:'銀の輝き。会心+5%',icon:'🪡',rarity:'rare',fx:'crit',critBonus:5},
  {id:'crystal_needle',name:'クリスタルのハリ',atk:10,speed:0.8,range:52,arc:Math.PI/1.8,dur:0.15,cd:0.30,desc:'広い範囲を薙ぎ払う',icon:'💎',rarity:'rare',fx:'ice'},
  {id:'fire_needle',name:'ほのおのハリ',atk:12,speed:1.2,range:44,arc:Math.PI/2,dur:0.10,cd:0.22,desc:'周囲にスプラッシュ1ダメージ',icon:'🔥',rarity:'rare',fx:'splash'},
  {id:'dark_needle',name:'やみのハリ',atk:15,speed:1.0,range:44,arc:Math.PI/2,dur:0.12,cd:0.25,desc:'HP吸収3%',icon:'🌑',rarity:'rare',fx:'lifesteal'},
  {id:'queen_needle',name:'じょおうのハリ',atk:18,speed:1.0,range:50,arc:Math.PI/1.8,dur:0.12,cd:0.25,desc:'女王の力。全ステ微増',icon:'👑',rarity:'legendary',fx:'queen'},
  {id:'star_needle',name:'ほしくずのハリ',atk:22,speed:1.2,range:52,arc:Math.PI/1.6,dur:0.10,cd:0.20,desc:'会心時に星爆発',icon:'⭐',rarity:'legendary',fx:'starburst',critBonus:15}
];
const WEAPON_DROP_TABLE=[
  [[0,1]],           // Floor 1: hana or wax
  [[1,2]],           // Floor 2: wax or silver
  [[2,3,4]],         // Floor 3: silver, crystal, fire
  [[3,4,5]],         // Floor 4: crystal, fire, dark
  [[5,6],[7]]         // Floor 5: dark, queen; legendary: star
];
function rollWeaponDrop(fl){
  const table=WEAPON_DROP_TABLE[Math.min(fl-1,4)];
  // 1% legendary chance
  if(table.length>1&&Math.random()<0.01){const pool=table[1];return WEAPONS[pool[rndInt(0,pool.length-1)]]}
  const pool=table[0];return WEAPONS[pool[rndInt(0,pool.length-1)]];
}

/* ===== ACCESSORY DEFINITIONS ===== */
const ACCESSORIES=[
  {id:'pollen_ring',name:'かふんのゆびわ',desc:'ドロップ率+20%',icon:'💍',effect:{dropRate:0.2}},
  {id:'speed_anklet',name:'そくみつアンクレット',desc:'移動速度+15%',icon:'👟',effect:{speed:0.15}},
  {id:'crit_charm',name:'かいしんのおまもり',desc:'会心率+10%',icon:'✨',effect:{critRate:10}},
  {id:'bee_brooch',name:'みつばちのブローチ',desc:'10秒ごとにHP1回復',icon:'🐝',effect:{regen:1}},
  {id:'tough_belt',name:'がんじょうなベルト',desc:'最大HP+2',icon:'🎗️',effect:{maxHp:2}},
  {id:'vamp_fang',name:'きゅうけつのキバ',desc:'与ダメの5%HP回復',icon:'🦷',effect:{lifesteal:0.05}},
  {id:'needle_ring',name:'はりしのゆびわ',desc:'攻撃速度+20%',icon:'📌',effect:{atkSpeed:0.2}},
  {id:'magnet_pendant',name:'じしゃくペンダント',desc:'吸引範囲3倍',icon:'🧲',effect:{magnetRange:3}}
];

/* ===== CONSUMABLE DEFINITIONS ===== */
const CONSUMABLES=[
  {id:'pollen_heal',name:'ポーレン',desc:'HP1かいふく',icon:'🌼',effect:'heal',value:1},
  {id:'royal_jelly',name:'ロイヤルゼリー',desc:'HPぜんかいふく',icon:'🍯',effect:'healFull',value:0},
  {id:'pollen_bomb',name:'かふんだん',desc:'まわりに2ダメージ',icon:'💣',effect:'aoe',value:2},
  {id:'speed_honey',name:'そくみつドリンク',desc:'20びょうかん はやくなる',icon:'⚡',effect:'buffSpeed',value:1.5,duration:20},
  {id:'wax_shield',name:'みつろうのたて',desc:'30びょうかん かたくなる',icon:'🛡️',effect:'buffDef',value:1,duration:30},
  {id:'hard_candy',name:'かたみつキャンディ',desc:'30びょうかん つよくなる',icon:'🍬',effect:'buffAtk',value:2,duration:30}
];

/* ===== COLLECTION / ENCYCLOPEDIA ===== */
const COLLECTION_ENTRIES={};
// Enemies
const ENEMY_COLLECTION=[
  {id:'imomushi',cat:'enemy',name:'いもむし',desc:'はらっぱに住む緑のいもむし。のんびり歩いている。',icon:'🐛',color:'#8bc34a'},
  {id:'tentou',cat:'enemy',name:'てんとうむし',desc:'赤い背中に黒い水玉。怒ると追いかけてくる。',icon:'🐞',color:'#f44336'},
  {id:'kabuto',cat:'enemy',name:'かぶとむし',desc:'立派な角を持つ虫。突進してくるので注意。',icon:'🪲',color:'#795548'},
  {id:'kumo',cat:'enemy',name:'くも',desc:'巣を張って待ち伏せする。糸で動きを遅くしてくる。',icon:'🕷️',color:'#9e9e9e'},
  {id:'hachi_dark',cat:'enemy',name:'カゲバチ',desc:'闇に操られた蜂。かつては仲間だったかもしれない。',icon:'🐝',color:'#2c3e50'},
  {id:'kinoko',cat:'enemy',name:'ドクキノコ',desc:'毒の胞子をまき散らすキノコ。近づくと危険。',icon:'🍄',color:'#9b59b6'},
  {id:'slime_green',cat:'enemy',name:'ミドリスライム',desc:'好奇心が強いスライム。ぷるぷる揺れている。',icon:'🟢',color:'#2ecc71'},
  {id:'koumori',cat:'enemy',name:'コウモリ',desc:'暗い場所を好む。素早く急降下してくる。',icon:'🦇',color:'#7f8c8d'},
  {id:'ice_worm',cat:'enemy',name:'コオリムシ',desc:'冷たい体を持つ虫。触れると凍える。',icon:'🐛',color:'#3498db'},
  {id:'dark_flower',cat:'enemy',name:'ヤミバナ',desc:'闇に染まった花。根で攻撃してくる。',icon:'🌺',color:'#1a1a2a'},
  {id:'mushroom_king',cat:'enemy',name:'マッシュルーム王',desc:'キノコたちの王。巨大な体から胞子をまき散らす。',icon:'👑',color:'#e74c3c'},
  {id:'dark_queen',cat:'enemy',name:'やみのじょおうバチ',desc:'闇に蝕まれた女王。その瞳には時折優しい光が宿る。',icon:'👸',color:'#1a1a2a'}
];
// Weapons
WEAPONS.forEach(w=>{COLLECTION_ENTRIES['weapon_'+w.id]={id:'weapon_'+w.id,cat:'treasure',name:w.name,desc:w.desc,icon:w.icon,color:w.rarity==='legendary'?'#ff2222':w.rarity==='rare'?'#ffdd00':'#cccccc'}});
// Sparkle variants
WEAPONS.forEach(w=>{COLLECTION_ENTRIES['weapon_'+w.id+'_sparkle']={id:'weapon_'+w.id+'_sparkle',cat:'treasure',name:'✦'+w.name,desc:'キラキラ光る特別な'+w.name+'。ATK+2。',icon:'✦',color:'#ff88ff'}});
// Accessories
ACCESSORIES.forEach(a=>{COLLECTION_ENTRIES['acc_'+a.id]={id:'acc_'+a.id,cat:'treasure',name:a.name,desc:a.desc,icon:a.icon,color:'#64b5f6'}});
// Consumables
CONSUMABLES.forEach(c=>{COLLECTION_ENTRIES['item_'+c.id]={id:'item_'+c.id,cat:'item',name:c.name,desc:c.desc,icon:c.icon,color:'#fff9c4'}});
// Enemies
ENEMY_COLLECTION.forEach(e=>{COLLECTION_ENTRIES[e.id]={...e}});
// Places
THEMES.forEach((t,i)=>{COLLECTION_ENTRIES['place_floor'+(i+1)]={id:'place_floor'+(i+1),cat:'place',name:t.name,desc:'Floor '+(i+1)+'のテーマ。',icon:t.deco,color:t.accent}});

const COLLECTION_CATS=[
  {id:'enemy',name:'むし',icon:'🐛'},
  {id:'treasure',name:'おたから',icon:'💎'},
  {id:'item',name:'つかいもの',icon:'🌼'},
  {id:'place',name:'ばしょ',icon:'🗺️'}
];

let collectionDiscovered={};
function collectionInit(){try{const d=localStorage.getItem('mipurin_collection');if(d)collectionDiscovered=JSON.parse(d)}catch(e){}}
function collectionSave(){try{localStorage.setItem('mipurin_collection',JSON.stringify(collectionDiscovered))}catch(e){}}
function collectionDiscover(id){if(!COLLECTION_ENTRIES[id])return false;if(collectionDiscovered[id])return false;collectionDiscovered[id]={date:Date.now()};collectionSave();collectionBanner=id;collectionBannerTimer=2.5;seCollect();return true}
function collectionIsFound(id){return!!collectionDiscovered[id]}
function collectionCount(){return Object.keys(collectionDiscovered).length}
function collectionTotal(){return Object.keys(COLLECTION_ENTRIES).length}
let collectionBanner=null,collectionBannerTimer=0;

/* ===== PROLOGUE SYSTEM ===== */
let prologueImages=[];
let prologueLoaded=false;
let prologueIndex=0,prologueAlpha=0,prologuePhase='fadein',prologueTimer=0;
const PROLOGUE_TEXTS=[
  'むかしむかし、蜂の国「ハニーヴィル」がありました。',
  'みんなが蜂蜜を集めて、平和に暮らしていました。',
  'ある日、不思議な闇の胞子が森から広がり始めました。',
  '虫たちが凶暴化していきます。',
  'みぷりんは女王蜂から「黄金蜂蜜のかけら」を集めてほしいと頼まれました。',
  '小さな冒険の、はじまりです。'
];
function loadPrologueImages(){
  let loaded=0;const total=10;
  for(let i=1;i<=total;i++){
    const img=new Image();const idx=i<10?'0'+i:''+i;
    img.src='assets/prologue/prologue_'+idx+'.webp';
    img.onload=()=>{loaded++;if(loaded>=total)prologueLoaded=true};
    img.onerror=()=>{loaded++;if(loaded>=total)prologueLoaded=true};
    prologueImages.push(img);
  }
}

/* ===== GAME STATE ===== */
let gameState='title';
let floor=1,wave=0,score=0,roomMap=[],enemies=[],items=[],projectiles=[];
let waveTimer=0;
let blessingChoices=[],selectCursor=0;
let prologueSeen=false;

/* ===== PLAYER ===== */
let player={
  x:TILE*10,y:TILE*5,w:36,h:36,speed:200,hp:5,maxHp:5,atk:1,
  dir:'down',attacking:false,atkTimer:0,atkCd:0,
  dashing:false,dashTimer:0,dashCd:0,dashSpeed:550,
  iframes:0,face:'normal',
  squashX:1,squashY:1,bobTimer:0,wingTimer:0,breathTimer:0,
  blessings:[],magnetRange:60,pollen:0,
  weapon:null,accessories:[null,null],
  consumables:[null,null,null],
  buffs:{speed:null,def:null,atk:null},
  regenTimer:0,critRate:5,
  comboKills:0,comboTimer:0
};

/* ===== WEAPON POPUP STATE ===== */
let weaponPopup={active:false,weapon:null,sparkle:false};

/* ===== COLLECTION UI STATE ===== */
let collectionUI={open:false,catIdx:0,cursor:0,scroll:0};

/* ===== ENEMY DEFINITIONS ===== */
const ENEMY_DEFS={
  imomushi:{name:'いもむし',hp:3,speed:40,dmg:1,score:10,type:'wander',color:'#8bc34a',bodyColor:'#689f38',dropChance:0.15},
  tentou:{name:'てんとう',hp:4,speed:75,dmg:1,score:15,type:'chase',color:'#f44336',bodyColor:'#d32f2f',dropChance:0.2},
  kabuto:{name:'かぶとむし',hp:6,speed:40,dmg:2,score:25,type:'charge',color:'#795548',bodyColor:'#5d4037',chargeSpeed:350,telegraphDur:0.6,chargeDur:0.3,dropChance:0.3}
};

/* ===== WAVES ===== */
function buildWaves(fl){
  return[
    [{type:'imomushi',count:3}],
    [{type:'imomushi',count:2},{type:'tentou',count:1}],
    [{type:'tentou',count:2},{type:'imomushi',count:2}],
    [{type:'tentou',count:2},{type:'kabuto',count:1}],
    [{type:'kabuto',count:1},{type:'tentou',count:2},{type:'imomushi',count:2}]
  ];
}
let WAVES=[];

/* ===== BLESSINGS ===== */
const BLESSING_POOL=[
  {id:'dashStrike',name:'ダッシュ斬り',desc:'ダッシュ直後の攻撃ダメージ2倍',icon:'💨',rarity:'common'},
  {id:'comboHeal',name:'コンボ回復',desc:'3体連続キルでHP1回復',icon:'💗',rarity:'common'},
  {id:'wallCrush',name:'壁ドン',desc:'壁際の敵にダメージ1.5倍',icon:'🧱',rarity:'common'},
  {id:'lastStand',name:'ラストスタンド',desc:'HP1の時、攻撃速度2倍',icon:'🔥',rarity:'rare'},
  {id:'sweetTooth',name:'あまいもの好き',desc:'回復アイテムの効果2倍',icon:'🍯',rarity:'common'},
  {id:'critWing',name:'羽ばたきクリティカル',desc:'移動中の攻撃が20%で会心',icon:'✨',rarity:'rare'},
  {id:'thornAura',name:'とげオーラ',desc:'被弾時、周囲の敵に1ダメージ',icon:'🌹',rarity:'rare'},
  {id:'honeyTrap',name:'ハニートラップ',desc:'キル時に蜂蜜。踏んだ敵が減速',icon:'🍯',rarity:'epic'},
  {id:'queenBee',name:'女王蜂',desc:'全ステ微増＋味方蜂を1匹召喚',icon:'👑',rarity:'epic'},
  {id:'berserker',name:'バーサーカー',desc:'HP半分以下でATK1.5倍',icon:'💢',rarity:'rare'}
];
function pickBlessings(){
  const pool=[...BLESSING_POOL].filter(b=>!player.blessings.find(pb=>pb.id===b.id));
  const picked=[];while(picked.length<3&&pool.length>0){picked.push(pool.splice(rndInt(0,pool.length-1),1)[0])}return picked;
}
function applyBlessing(b){player.blessings.push(b)}
function hasBlessing(id){return player.blessings.some(b=>b.id===id)}

/* ===== ACCESSORY HELPERS ===== */
function hasAccessory(id){return player.accessories.some(a=>a&&a.id===id)}
function getAccBonus(key){
  let v=0;player.accessories.forEach(a=>{if(a&&a.effect[key])v+=a.effect[key]});return v;
}
function getPlayerSpeed(){return player.speed*(1+getAccBonus('speed'))*(player.buffs.speed?player.buffs.speed.value:1)}
function getPlayerAtk(){
  let a=player.atk+(player.weapon?player.weapon.atk:0)+(player.buffs.atk?player.buffs.atk.value:0);
  if(hasBlessing('berserker')&&player.hp<=Math.floor(player.maxHp/2))a=Math.ceil(a*1.5);
  if(player.weapon&&player.weapon.fx==='queen')a+=2;
  return a;
}
function getPlayerCritRate(){
  let c=player.critRate+getAccBonus('critRate');
  if(player.weapon&&player.weapon.critBonus)c+=player.weapon.critBonus;
  return c;
}
function getPlayerMagnetRange(){
  const mult=getAccBonus('magnetRange');
  return player.magnetRange*(mult>0?mult:1);
}
function getPlayerMaxHp(){return player.maxHp+getAccBonus('maxHp')}

/* ===== CONSUMABLE USE ===== */
function useConsumable(slotIdx){
  const c=player.consumables[slotIdx];if(!c)return;
  switch(c.effect){
    case'heal':player.hp=Math.min(getPlayerMaxHp(),player.hp+(hasBlessing('sweetTooth')?c.value*2:c.value));addDmgNum(player.x,player.y-20,'+'+(hasBlessing('sweetTooth')?c.value*2:c.value)+'HP','#e91e63');break;
    case'healFull':player.hp=getPlayerMaxHp();addDmgNum(player.x,player.y-20,'FULL','#e91e63');break;
    case'aoe':enemies.forEach(en=>{if(dist(player,en)<100){en.hp-=c.value;en.flashTimer=0.15;addDmgNum(en.x,en.y-10,c.value,'#ff9800');addParticle(en.x,en.y,'star',3)}});doShake(4,0.1);break;
    case'buffSpeed':player.buffs.speed={value:c.value,timer:c.duration};break;
    case'buffDef':player.buffs.def={value:c.value,timer:c.duration};break;
    case'buffAtk':player.buffs.atk={value:c.value,timer:c.duration};break;
  }
  seItem();addParticle(player.x,player.y,'star',5);
  collectionDiscover('item_'+c.id);
  player.consumables[slotIdx]=null;
}

/* ===== COLLISION ===== */
function moveWithCollision(ent,dx,dy){
  const nx=ent.x+dx,ny=ent.y+dy,hw=ent.w/2,hh=ent.h/2;
  let bx=false;
  for(let r=Math.floor((ny-hh)/TILE);r<=Math.floor((ny+hh-1)/TILE);r++)
    for(let c=Math.floor((nx-hw)/TILE);c<=Math.floor((nx+hw-1)/TILE);c++)
      if(tileAt(roomMap,c,r)===1){bx=true;break}
  if(!bx){ent.x=nx;ent.y=ny}else{
    let xOk=true;
    for(let r=Math.floor((ent.y-hh)/TILE);r<=Math.floor((ent.y+hh-1)/TILE);r++)
      for(let c=Math.floor((nx-hw)/TILE);c<=Math.floor((nx+hw-1)/TILE);c++)
        if(tileAt(roomMap,c,r)===1){xOk=false;break}
    if(xOk)ent.x=nx;
    let yOk=true;
    for(let r=Math.floor((ny-hh)/TILE);r<=Math.floor((ny+hh-1)/TILE);r++)
      for(let c=Math.floor((ent.x-hw)/TILE);c<=Math.floor((ent.x+hw-1)/TILE);c++)
        if(tileAt(roomMap,c,r)===1){yOk=false;break}
    if(yOk)ent.y=ny;
  }
  ent.x=clamp(ent.x,ent.w/2,CW-ent.w/2);ent.y=clamp(ent.y,ent.h/2,CH-ent.h/2);
}

/* ===== SPAWN ===== */
function randEnemyPos(){
  let c,r,tries=0;
  do{c=rndInt(2,COLS-3);r=rndInt(2,ROWS-3);tries++}
  while(tries<30&&(tileAt(roomMap,c,r)===1||tileAt(roomMap,c-1,r)===1||tileAt(roomMap,c+1,r)===1||tileAt(roomMap,c,r-1)===1||tileAt(roomMap,c,r+1)===1||(Math.abs(c-10)<3&&Math.abs(r-5)<3)));
  return{x:c*TILE+TILE/2,y:r*TILE+TILE/2};
}
function spawnWave(){
  if(wave>=WAVES.length)return;
  for(const g of WAVES[wave]){
    const def=ENEMY_DEFS[g.type];const sc=1+floor*0.12;
    for(let i=0;i<g.count;i++){
      const pos=randEnemyPos();
      enemies.push({...pos,w:32,h:32,hp:Math.ceil(def.hp*sc),maxHp:Math.ceil(def.hp*sc),
        speed:def.speed,dmg:def.dmg,score:def.score,type:def.type,defKey:g.type,
        color:def.color,bodyColor:def.bodyColor,dropChance:def.dropChance||0.15,
        dir:rnd(0,Math.PI*2),wanderTimer:rnd(0.5,2),
        charging:false,telegraphing:false,telegraphTimer:0,chargeTimer:0,chargeCd:0,chargeDir:0,
        flashTimer:0,squashX:1,squashY:1,stunTimer:0,
        chargeSpeed:def.chargeSpeed||0,telegraphDur:def.telegraphDur||0,chargeDur:def.chargeDur||0,
        wobble:0,wobbleSpeed:rnd(3,6),face:'normal'});
    }
  }
}

/* ===== DROPS ===== */
function dropFromEnemy(x,y,defKey,dropChance){
  // Pollen (always)
  if(Math.random()<0.4)items.push({x:x+rnd(-10,10),y:y+rnd(-10,10),type:'pollen',life:10,w:12,h:12,bobTimer:Math.random()*10});
  // Heal
  if(Math.random()<0.1)items.push({x:x+rnd(-10,10),y:y+rnd(-10,10),type:'heal',life:10,w:14,h:14,bobTimer:Math.random()*10});
  // Weapon drop
  const dRate=dropChance*(1+getAccBonus('dropRate'));
  if(Math.random()<dRate*0.3){
    const w=rollWeaponDrop(floor);const sparkle=Math.random()<0.05;
    items.push({x,y,type:'weapon',life:30,w:16,h:16,bobTimer:0,weapon:{...w},sparkle});
  }
  // Consumable drop
  if(Math.random()<dRate*0.2){
    const c=CONSUMABLES[rndInt(0,CONSUMABLES.length-1)];
    items.push({x,y,type:'consumable',life:30,w:14,h:14,bobTimer:0,consumable:{...c}});
  }
}

/* ===== RESET ===== */
function resetGame(){
  floor=1;wave=0;score=0;
  player.x=TILE*10;player.y=TILE*5;player.maxHp=5;player.hp=5;player.atk=1;
  player.speed=200;player.blessings=[];player.magnetRange=60;player.pollen=0;
  player.attacking=false;player.atkTimer=0;player.atkCd=0;
  player.dashing=false;player.dashTimer=0;player.dashCd=0;
  player.iframes=0;player.dir='down';player.face='normal';
  player.squashX=1;player.squashY=1;player.critRate=5;
  player.weapon={...WEAPONS[0]};player.accessories=[null,null];
  player.consumables=[null,null,null];
  player.buffs={speed:null,def:null,atk:null};
  player.regenTimer=0;player.comboKills=0;player.comboTimer=0;
  weaponPopup.active=false;
  particles=[];dmgNums=[];items=[];projectiles=[];enemies=[];
  roomMap=generateRoom(floor);WAVES=buildWaves(floor);spawnWave();
  collectionDiscover('place_floor1');
  collectionDiscover('weapon_'+WEAPONS[0].id);
  gameState='playing';
}
function startFloor(){
  wave=0;player.x=TILE*10;player.y=TILE*5;
  enemies=[];items=[];projectiles=[];particles=[];
  roomMap=generateRoom(floor);WAVES=buildWaves(floor);spawnWave();
  collectionDiscover('place_floor'+floor);
  playBGM(getTheme().bgm);
  gameState='playing';
}

/* ===== DRAW TILES ===== */
function drawTiles(){
  const th=getTheme();
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    const x=c*TILE,y=r*TILE;
    if(tileAt(roomMap,c,r)===1){
      ctx.fillStyle=th.wall;ctx.fillRect(x,y,TILE,TILE);
      ctx.fillStyle='rgba(0,0,0,0.15)';ctx.fillRect(x,y+TILE-4,TILE,4);
      if((c+r)%5===0){ctx.font='12px sans-serif';ctx.fillText(th.deco,x+8,y+30)}
    }else{
      ctx.fillStyle=th.floor;ctx.fillRect(x,y,TILE,TILE);
      if((c+r)%7===0){ctx.fillStyle=th.bg;ctx.beginPath();ctx.arc(x+24,y+24,3,0,Math.PI*2);ctx.fill()}
    }
  }
}

/* ===== DRAW PLAYER ===== */
function drawPlayer(){
  const p=player;
  if(p.iframes>0&&Math.floor(p.iframes*15)%2===0)return;
  ctx.save();ctx.translate(p.x,p.y);ctx.scale(p.squashX,p.squashY);
  const bob=Math.sin(p.bobTimer*10)*2;ctx.translate(0,bob);
  if(spriteLoaded){
    const frame=SPRITE_FRAMES[p.dir]||SPRITE_FRAMES.down;const ds=44;
    ctx.drawImage(spriteImg,frame.sx,frame.sy,frame.sw,frame.sh,-ds/2,-ds/2,ds,ds);
    // Wing flutter
    ctx.globalAlpha=0.3;ctx.fillStyle='#bbdefb';
    const ws=10*(0.5+Math.sin(p.wingTimer*20)*0.3);
    ctx.beginPath();ctx.ellipse(-16,0,ws,6,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(16,0,ws,6,0,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;
    if(p.iframes>0){ctx.globalAlpha=0.4;ctx.fillStyle=`hsla(${Date.now()%360},80%,70%,0.3)`;ctx.fillRect(-ds/2,-ds/2,ds,ds);ctx.globalAlpha=1}
  }else{
    ctx.fillStyle='#ffd54f';ctx.beginPath();ctx.arc(0,0,18,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#5d4037';ctx.beginPath();ctx.arc(-5,-3,3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(5,-3,3,0,Math.PI*2);ctx.fill();
  }
  if(p.dashing){ctx.globalAlpha=0.2;ctx.fillStyle='#bbdefb';ctx.beginPath();ctx.arc(0,0,24,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
  ctx.restore();
  if(p.attacking){
    const dirs={down:{x:0,y:1},up:{x:0,y:-1},left:{x:-1,y:0},right:{x:1,y:0}};
    const d=dirs[p.dir];const ax=p.x+d.x*30,ay=p.y+d.y*30;
    ctx.fillStyle='#ffeb3b';ctx.globalAlpha=0.7;drawStar(ax,ay,14,6,4);ctx.globalAlpha=1;
    ctx.fillStyle='#fff';drawStar(ax+rnd(-8,8),ay+rnd(-8,8),4,2,4);
  }
}

/* ===== DRAW ENEMY ===== */
function drawEnemy(en){
  ctx.save();ctx.translate(en.x,en.y);ctx.scale(en.squashX,en.squashY);
  if(en.flashTimer>0)ctx.globalAlpha=0.5+Math.sin(en.flashTimer*30)*0.5;
  const wb=Math.sin(en.wobble)*3;
  if(en.defKey==='imomushi'){
    ctx.fillStyle=en.color;
    for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(-10+i*7,wb*(i%2===0?1:-1),8-i*0.5,0,Math.PI*2);ctx.fill()}
    ctx.fillStyle=en.bodyColor;for(let i=1;i<4;i++){ctx.beginPath();ctx.arc(-10+i*7,wb*(i%2===0?1:-1)+2,5,0,Math.PI);ctx.fill()}
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-13,-3,4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(-7,-3,4,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#333';ctx.beginPath();ctx.arc(-12,-3,2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(-6,-3,2,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(255,138,128,0.4)';ctx.beginPath();ctx.arc(-15,2,3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(-3,2,3,0,Math.PI*2);ctx.fill();
  }else if(en.defKey==='tentou'){
    ctx.fillStyle=en.color;ctx.beginPath();ctx.ellipse(0,2,14,12,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#333';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(0,14);ctx.stroke();
    ctx.fillStyle='#333';[{x:-6,y:-1,r:3},{x:6,y:-1,r:3},{x:-4,y:7,r:2.5},{x:4,y:7,r:2.5}].forEach(s=>{ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill()});
    ctx.fillStyle='#333';ctx.beginPath();ctx.arc(0,-8,7,Math.PI,0);ctx.fill();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-3,-10,3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(3,-10,3,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=en.face==='angry'?'#f44336':'#333';ctx.beginPath();ctx.arc(-3,-10,1.5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(3,-10,1.5,0,Math.PI*2);ctx.fill();
  }else if(en.defKey==='kabuto'){
    ctx.fillStyle=en.color;ctx.beginPath();ctx.ellipse(0,4,16,14,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=en.bodyColor;ctx.beginPath();ctx.ellipse(0,8,14,8,0,0,Math.PI);ctx.fill();
    ctx.fillStyle='#5d4037';ctx.beginPath();ctx.moveTo(-3,-10);ctx.lineTo(0,-24);ctx.lineTo(3,-10);ctx.closePath();ctx.fill();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-5,-4,4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(5,-4,4,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=en.telegraphing?'#f44336':'#333';ctx.beginPath();ctx.arc(-5,-4,2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(5,-4,2,0,Math.PI*2);ctx.fill();
    if(en.telegraphing){ctx.fillStyle='#f44336';ctx.font='bold 18px sans-serif';ctx.textAlign='center';ctx.fillText('!',0,-30)}
    if(en.stunTimer>0){for(let i=0;i<3;i++){const a=Date.now()/200+i*Math.PI*2/3;ctx.fillStyle='#ffeb3b';drawStar(Math.cos(a)*12,-14+Math.sin(a)*4,4,2,5)}}
  }
  ctx.globalAlpha=1;ctx.restore();
  if(en.hp<en.maxHp){const bw=28,bh=4,bx=en.x-bw/2,by=en.y-22;ctx.fillStyle='rgba(0,0,0,0.3)';ctx.fillRect(bx,by,bw,bh);ctx.fillStyle='#ef5350';ctx.fillRect(bx,by,bw*(en.hp/en.maxHp),bh);ctx.fillStyle='#fff';ctx.fillRect(bx,by,bw*(en.hp/en.maxHp),1)}
}

/* ===== DRAW ITEMS ===== */
function drawItems(){
  for(const it of items){
    const bob=Math.sin(it.bobTimer*4)*3;
    if(it.type==='pollen'){ctx.fillStyle='#ffeb3b';drawStar(it.x,it.y+bob,6,3,6);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(it.x,it.y+bob,2,0,Math.PI*2);ctx.fill()}
    else if(it.type==='heal'){ctx.fillStyle='#e91e63';const hx=it.x,hy=it.y+bob;ctx.beginPath();ctx.moveTo(hx,hy+4);ctx.bezierCurveTo(hx-7,hy-3,hx-7,hy-8,hx,hy-5);ctx.bezierCurveTo(hx+7,hy-8,hx+7,hy-3,hx,hy+4);ctx.fill()}
    else if(it.type==='weapon'){
      ctx.fillStyle=it.sparkle?'#ff88ff':'#ffeb3b';ctx.globalAlpha=0.6+Math.sin(it.bobTimer*6)*0.3;
      drawStar(it.x,it.y+bob,10,5,4);ctx.globalAlpha=1;
      ctx.font='14px sans-serif';ctx.textAlign='center';ctx.fillText(it.weapon.icon,it.x,it.y+bob-2);
    }else if(it.type==='consumable'){
      ctx.font='14px sans-serif';ctx.textAlign='center';ctx.fillText(it.consumable.icon,it.x,it.y+bob);
    }
  }
}

/* ===== HUD ===== */
function drawHUD(){
  const mhp=getPlayerMaxHp();
  // Hearts
  for(let i=0;i<mhp;i++){const hx=12+i*22,hy=12;ctx.fillStyle=i<player.hp?'#e91e63':'#424242';ctx.beginPath();ctx.moveTo(hx,hy+5);ctx.bezierCurveTo(hx-8,hy-4,hx-8,hy-10,hx,hy-6);ctx.bezierCurveTo(hx+8,hy-10,hx+8,hy-4,hx,hy+5);ctx.fill();if(i<player.hp){ctx.fillStyle='rgba(255,255,255,0.3)';ctx.beginPath();ctx.arc(hx-2,hy-5,2,0,Math.PI*2);ctx.fill()}}
  // Floor/Wave
  ctx.fillStyle='#fff';ctx.font='bold 13px sans-serif';ctx.textAlign='left';
  ctx.fillText(`Floor ${floor}  Wave ${wave+1}/${WAVES.length}`,12,32);
  // Score/Pollen
  ctx.textAlign='right';ctx.fillText(`⭐${score}  🌼${player.pollen}`,CW-12,20);
  // Weapon
  if(player.weapon){ctx.textAlign='left';ctx.fillText(`${player.weapon.icon}${player.weapon.name} ATK:${getPlayerAtk()}`,12,50)}
  // Accessories
  ctx.textAlign='left';
  player.accessories.forEach((a,i)=>{if(a)ctx.fillText(a.icon,12+i*22,66);else{ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillText('○',12+i*22,66);ctx.fillStyle='#fff'}});
  // Consumables (right top)
  for(let i=0;i<3;i++){
    const cx=CW-120+i*36,cy=32;
    ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(cx,cy,14,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.1)';ctx.fill();
    if(player.consumables[i]){ctx.font='14px sans-serif';ctx.textAlign='center';ctx.fillText(player.consumables[i].icon,cx,cy+5)}
    ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='9px sans-serif';ctx.textAlign='center';ctx.fillText(''+(i+1),cx,cy+22);
  }
  // Blessings
  ctx.textAlign='left';player.blessings.forEach((b,i)=>{ctx.font='14px sans-serif';ctx.fillText(b.icon,12+i*20,84)});
  // Buffs
  let bx=CW-200;
  if(player.buffs.speed){ctx.fillStyle='#64b5f6';ctx.font='11px sans-serif';ctx.textAlign='left';ctx.fillText('⚡'+Math.ceil(player.buffs.speed.timer)+'s',bx,CH-20);bx+=50}
  if(player.buffs.def){ctx.fillStyle='#81c784';ctx.fillText('🛡️'+Math.ceil(player.buffs.def.timer)+'s',bx,CH-20);bx+=50}
  if(player.buffs.atk){ctx.fillStyle='#ef5350';ctx.fillText('🍬'+Math.ceil(player.buffs.atk.timer)+'s',bx,CH-20);bx+=50}
  // Hints
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px sans-serif';ctx.textAlign='center';
  ctx.fillText('WASD:移動 Z:攻撃 X:ダッシュ 1/2/3:アイテム Tab:図鑑',CW/2,CH-4);
  // Collection banner
  if(collectionBannerTimer>0){
    const e=COLLECTION_ENTRIES[collectionBanner];if(e){
      ctx.globalAlpha=Math.min(1,collectionBannerTimer);
      ctx.fillStyle='rgba(0,0,0,0.7)';const tw=240,th=30;ctx.fillRect(CW/2-tw/2,80,tw,th);
      ctx.fillStyle='#ffeb3b';ctx.font='bold 12px sans-serif';ctx.textAlign='center';
      ctx.fillText('📖 '+e.name+' をずかんにきろく！',CW/2,100);
      ctx.globalAlpha=1;
    }
  }
}

/* ===== WEAPON POPUP ===== */
function drawWeaponPopup(){
  if(!weaponPopup.active)return;
  ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,CW,CH);
  const w=weaponPopup.weapon;const cur=player.weapon;
  // Left: current
  const lx=CW/2-140,ly=CH/2-80,bw=120,bh=160;
  ctx.fillStyle='rgba(255,255,255,0.9)';
  roundRect(ctx,lx,ly,bw,bh,10);ctx.fill();
  ctx.fillStyle='#555';ctx.font='bold 12px sans-serif';ctx.textAlign='center';
  ctx.fillText('いまの',lx+bw/2,ly+20);
  ctx.font='24px sans-serif';ctx.fillText(cur?cur.icon:'❓',lx+bw/2,ly+55);
  ctx.fillStyle='#333';ctx.font='bold 13px sans-serif';ctx.fillText(cur?cur.name:'なし',lx+bw/2,ly+80);
  ctx.font='12px sans-serif';ctx.fillText('ATK '+(cur?cur.atk:0),lx+bw/2,ly+100);
  // Right: new
  const rx=CW/2+20;
  const borderColor=weaponPopup.sparkle?'#ff88ff':w.rarity==='legendary'?'#ff2222':w.rarity==='rare'?'#ffdd00':'#ccc';
  ctx.fillStyle='rgba(255,255,255,0.95)';roundRect(ctx,rx,ly,bw,bh,10);ctx.fill();
  ctx.strokeStyle=borderColor;ctx.lineWidth=3;roundRect(ctx,rx,ly,bw,bh,10);ctx.stroke();
  ctx.fillStyle='#555';ctx.font='bold 12px sans-serif';ctx.textAlign='center';
  ctx.fillText(weaponPopup.sparkle?'✦ キラキラ！':'あたらしい',rx+bw/2,ly+20);
  ctx.font='24px sans-serif';ctx.fillText(w.icon,rx+bw/2,ly+55);
  ctx.fillStyle='#333';ctx.font='bold 13px sans-serif';ctx.fillText(w.name,rx+bw/2,ly+80);
  const diff=w.atk-(cur?cur.atk:0);
  ctx.fillStyle=diff>0?'#4caf50':diff<0?'#f44336':'#333';
  ctx.font='12px sans-serif';ctx.fillText('ATK '+w.atk+(diff>0?' (+'+diff+')':diff<0?' ('+diff+')':''),rx+bw/2,ly+100);
  ctx.fillStyle='#888';ctx.font='11px sans-serif';ctx.fillText(w.desc,rx+bw/2,ly+120);
  // Buttons
  ctx.fillStyle='#4caf50';ctx.font='bold 14px sans-serif';
  ctx.fillText('Z: そうび',CW/2-80,CH/2+110);
  ctx.fillStyle='#f44336';
  ctx.fillText('X: すてる',CW/2+80,CH/2+110);
}

function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);
  ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
}

/* ===== COLLECTION UI ===== */
function drawCollectionUI(){
  if(!collectionUI.open)return;
  ctx.fillStyle='rgba(0,0,0,0.85)';ctx.fillRect(0,0,CW,CH);
  // Title
  ctx.fillStyle='#ffeb3b';ctx.font='bold 22px sans-serif';ctx.textAlign='center';
  ctx.fillText('📖 ずかん ('+collectionCount()+'/'+collectionTotal()+')',CW/2,36);
  // Category tabs
  const tabW=CW/COLLECTION_CATS.length;
  COLLECTION_CATS.forEach((cat,i)=>{
    const tx=i*tabW,active=i===collectionUI.catIdx;
    ctx.fillStyle=active?'rgba(255,235,59,0.2)':'transparent';ctx.fillRect(tx,50,tabW,28);
    ctx.fillStyle=active?'#ffeb3b':'#888';ctx.font=active?'bold 14px sans-serif':'14px sans-serif';ctx.textAlign='center';
    ctx.fillText(cat.icon+' '+cat.name,tx+tabW/2,68);
  });
  // Entries
  const cat=COLLECTION_CATS[collectionUI.catIdx];
  const entries=Object.values(COLLECTION_ENTRIES).filter(e=>e.cat===cat.id);
  const listY=90,lineH=26,maxVisible=Math.floor((CH-140)/lineH);
  const scrollOffset=Math.max(0,collectionUI.cursor-maxVisible+1);
  ctx.textAlign='left';ctx.font='14px sans-serif';
  for(let i=0;i<maxVisible&&i+scrollOffset<entries.length;i++){
    const idx=i+scrollOffset,e=entries[idx],y=listY+i*lineH;
    const found=collectionIsFound(e.id),selected=idx===collectionUI.cursor;
    if(selected){ctx.fillStyle='rgba(255,235,59,0.1)';ctx.fillRect(20,y-2,CW-40,lineH)}
    if(found){
      if(selected){ctx.fillStyle='#ffeb3b';ctx.fillText('▶',24,y+14)}
      ctx.fillStyle=e.color||'#fff';ctx.fillText(e.icon||'?',48,y+14);
      ctx.fillStyle=selected?'#fff':'#ccc';ctx.fillText(e.name,72,y+14);
    }else{ctx.fillStyle='#555';ctx.fillText('？',48,y+14);ctx.fillText('？？？？？',72,y+14)}
  }
  // Description
  if(entries[collectionUI.cursor]&&collectionIsFound(entries[collectionUI.cursor].id)){
    const e=entries[collectionUI.cursor];
    ctx.fillStyle='rgba(0,0,0,0.8)';ctx.fillRect(20,CH-60,CW-40,50);
    ctx.strokeStyle='#555';ctx.lineWidth=1;ctx.strokeRect(20,CH-60,CW-40,50);
    ctx.fillStyle='#ddd';ctx.font='12px sans-serif';ctx.textAlign='left';
    ctx.fillText(e.desc,30,CH-38);
  }
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='11px sans-serif';ctx.textAlign='center';
  ctx.fillText('←→:カテゴリ  ↑↓:えらぶ  Tab/Esc:とじる',CW/2,CH-4);
}

/* ===== TITLE/PROLOGUE/BLESSING/CLEAR/DEAD SCREENS ===== */
function drawTitleScreen(){
  const grd=ctx.createLinearGradient(0,0,0,CH);grd.addColorStop(0,'#fce4ec');grd.addColorStop(1,'#fff9c4');
  ctx.fillStyle=grd;ctx.fillRect(0,0,CW,CH);
  const t=Date.now()/1000;
  for(let i=0;i<8;i++){const x=CW/2+Math.sin(t+i*0.8)*200,y=100+Math.cos(t*0.7+i)*80+i*40;ctx.fillStyle='rgba(255,235,59,0.3)';drawStar(x,y,8,4,5)}
  if(spriteLoaded)ctx.drawImage(spriteImg,0,0,250,250,CW/2-48,CH/2-100,96,96);
  ctx.fillStyle='#5d4037';ctx.font='bold 36px sans-serif';ctx.textAlign='center';ctx.fillText('ミプリンの冒険',CW/2,CH/2+30);
  ctx.fillStyle='#e91e63';ctx.font='18px sans-serif';ctx.fillText('~ Cute Roguelike ~',CW/2,CH/2+55);
  ctx.fillStyle=Math.sin(t*3)>0?'#5d4037':'#e91e63';ctx.font='bold 16px sans-serif';ctx.fillText('Zキーでスタート',CW/2,CH/2+100);
}
function drawPrologueScreen(){
  ctx.fillStyle='#000';ctx.fillRect(0,0,CW,CH);
  if(prologueIndex>=PROLOGUE_TEXTS.length){gameState='playing';resetGame();return}
  // If prologue images available, draw them
  if(prologueImages[prologueIndex]&&prologueImages[prologueIndex].complete&&prologueImages[prologueIndex].naturalWidth){
    const img=prologueImages[prologueIndex];
    const sc=Math.min(CW/img.naturalWidth,CH/img.naturalHeight);
    const w=img.naturalWidth*sc,h=img.naturalHeight*sc;
    ctx.globalAlpha=prologueAlpha;ctx.drawImage(img,(CW-w)/2,(CH-h)/2,w,h);ctx.globalAlpha=1;
  }
  // Text
  ctx.globalAlpha=prologueAlpha;
  ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(0,CH-80,CW,80);
  ctx.fillStyle='#fff';ctx.font='16px sans-serif';ctx.textAlign='center';
  ctx.fillText(PROLOGUE_TEXTS[prologueIndex],CW/2,CH-40);
  ctx.globalAlpha=0.4;ctx.fillStyle='#fff';ctx.font='11px sans-serif';
  ctx.fillText('Enter/Z: つぎへ　Esc: スキップ',CW/2,CH-10);
  ctx.globalAlpha=1;
}
function drawBlessingScreen(){
  ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(0,0,CW,CH);
  ctx.fillStyle='#fff';ctx.font='bold 22px sans-serif';ctx.textAlign='center';ctx.fillText('🌸 祝福を選んでね 🌸',CW/2,80);
  const rarityColors={common:'#e0e0e0',rare:'#64b5f6',epic:'#ffd54f'};
  blessingChoices.forEach((b,i)=>{
    const bx=CW/2-200+i*180,by=130,bw=160,bh=200,selected=i===selectCursor;
    ctx.fillStyle=selected?'rgba(255,255,255,0.95)':'rgba(255,255,255,0.7)';
    roundRect(ctx,bx,by,bw,bh,12);ctx.fill();
    ctx.strokeStyle=selected?'#e91e63':rarityColors[b.rarity];ctx.lineWidth=selected?3:2;roundRect(ctx,bx,by,bw,bh,12);ctx.stroke();
    ctx.font='36px sans-serif';ctx.textAlign='center';ctx.fillText(b.icon,bx+bw/2,by+55);
    ctx.fillStyle='#333';ctx.font='bold 14px sans-serif';ctx.fillText(b.name,bx+bw/2,by+85);
    ctx.fillStyle=rarityColors[b.rarity];ctx.font='11px sans-serif';ctx.fillText(b.rarity.toUpperCase(),bx+bw/2,by+105);
    ctx.fillStyle='#555';ctx.font='12px sans-serif';
    const words=b.desc;let line='',ly=by+125;
    for(const ch of words){if(ctx.measureText(line+ch).width>bw-20){ctx.fillText(line,bx+bw/2,ly);ly+=16;line=ch}else line+=ch}
    if(line)ctx.fillText(line,bx+bw/2,ly);
    if(selected){ctx.fillStyle='#e91e63';ctx.font='12px sans-serif';ctx.fillText('▶ Z ◀',bx+bw/2,by+bh+20)}
  });
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='12px sans-serif';ctx.textAlign='center';ctx.fillText('← A / D → で選択',CW/2,CH-20);
}

/* ===== UPDATE ===== */
let lastTime=0;
function update(dt){
  if(hitstopTimer>0){hitstopTimer-=dt*60;return}
  if(collectionBannerTimer>0)collectionBannerTimer-=dt;

  // Collection UI
  if(collectionUI.open){
    const cats=COLLECTION_CATS;
    const entries=Object.values(COLLECTION_ENTRIES).filter(e=>e.cat===cats[collectionUI.catIdx].id);
    if(wasPressed('ArrowLeft')||wasPressed('KeyA')){collectionUI.catIdx=(collectionUI.catIdx-1+cats.length)%cats.length;collectionUI.cursor=0}
    if(wasPressed('ArrowRight')||wasPressed('KeyD')){collectionUI.catIdx=(collectionUI.catIdx+1)%cats.length;collectionUI.cursor=0}
    if(wasPressed('ArrowUp')||wasPressed('KeyW'))collectionUI.cursor=Math.max(0,collectionUI.cursor-1);
    if(wasPressed('ArrowDown')||wasPressed('KeyS'))collectionUI.cursor=Math.min(entries.length-1,collectionUI.cursor+1);
    if(wasPressed('Tab')||wasPressed('Escape'))collectionUI.open=false;
    return;
  }

  // Weapon popup
  if(weaponPopup.active){
    if(wasPressed('KeyZ')){
      const w=weaponPopup.weapon;
      player.weapon={...w};if(weaponPopup.sparkle){player.weapon.atk+=2;player.weapon.name='✦'+player.weapon.name}
      collectionDiscover('weapon_'+w.id+(weaponPopup.sparkle?'_sparkle':''));
      seEquip();weaponPopup.active=false;
    }
    if(wasPressed('KeyX')){weaponPopup.active=false}
    return;
  }

  if(gameState==='title'){
    if(wasPressed('KeyZ')){seSelect();
      if(!prologueSeen){prologueSeen=true;loadPrologueImages();prologueIndex=0;prologueAlpha=0;prologuePhase='fadein';prologueTimer=0;gameState='prologue'}
      else resetGame();
    }
    return;
  }
  if(gameState==='prologue'){
    prologueTimer+=dt;
    if(prologuePhase==='fadein'){prologueAlpha=Math.min(1,prologueTimer/0.8);if(prologueTimer>=0.8){prologuePhase='hold';prologueTimer=0}}
    else if(prologuePhase==='hold'){if(prologueTimer>=2.5||wasPressed('KeyZ')||wasPressed('Enter')){prologuePhase='fadeout';prologueTimer=0}}
    else if(prologuePhase==='fadeout'){prologueAlpha=Math.max(0,1-prologueTimer/0.5);if(prologueTimer>=0.5){prologueIndex++;if(prologueIndex>=PROLOGUE_TEXTS.length){resetGame();return}prologuePhase='fadein';prologueTimer=0;prologueAlpha=0}}
    if(wasPressed('Escape')){resetGame();return}
    return;
  }
  if(gameState==='dead'){if(wasPressed('KeyZ')){resetGame();seSelect()}return}
  if(gameState==='clear'){if(wasPressed('KeyZ')){gameState='title';seSelect()}return}
  if(gameState==='blessing'){
    if(wasPressed('ArrowLeft')||wasPressed('KeyA'))selectCursor=(selectCursor+2)%3;
    if(wasPressed('ArrowRight')||wasPressed('KeyD'))selectCursor=(selectCursor+1)%3;
    if(wasPressed('KeyZ')&&blessingChoices[selectCursor]){applyBlessing(blessingChoices[selectCursor]);seBless();floor++;startFloor()}
    return;
  }
  if(gameState==='waveWait'){waveTimer-=dt;if(waveTimer<=0){spawnWave();gameState='playing'}return}
  if(gameState==='floorClear'){waveTimer-=dt;if(waveTimer<=0){if(floor>=5){gameState='clear';seClear();return}blessingChoices=pickBlessings();selectCursor=0;gameState='blessing'}return}

  // === PLAYING ===
  if(wasPressed('Tab')){collectionUI.open=true;collectionUI.cursor=0;return}

  const p=player;
  // Timers
  if(p.atkCd>0)p.atkCd-=dt;if(p.dashCd>0)p.dashCd-=dt;if(p.iframes>0)p.iframes-=dt;
  if(p.comboTimer>0){p.comboTimer-=dt;if(p.comboTimer<=0)p.comboKills=0}
  p.bobTimer+=dt;p.wingTimer+=dt;p.breathTimer+=dt;
  p.squashX=lerp(p.squashX,1,dt*12);p.squashY=lerp(p.squashY,1,dt*12);
  // Buffs
  if(p.buffs.speed){p.buffs.speed.timer-=dt;if(p.buffs.speed.timer<=0)p.buffs.speed=null}
  if(p.buffs.def){p.buffs.def.timer-=dt;if(p.buffs.def.timer<=0)p.buffs.def=null}
  if(p.buffs.atk){p.buffs.atk.timer-=dt;if(p.buffs.atk.timer<=0)p.buffs.atk=null}
  // Accessory regen
  if(hasAccessory('bee_brooch')){p.regenTimer+=dt;if(p.regenTimer>=10){p.regenTimer-=10;p.hp=Math.min(getPlayerMaxHp(),p.hp+1);addDmgNum(p.x,p.y-20,'+1HP','#e91e63')}}
  // Consumables
  if(wasPressed('Digit1'))useConsumable(0);
  if(wasPressed('Digit2'))useConsumable(1);
  if(wasPressed('Digit3'))useConsumable(2);

  // Movement
  let mx=0,my=0;
  if(isDown('KeyA')||isDown('ArrowLeft'))mx=-1;if(isDown('KeyD')||isDown('ArrowRight'))mx=1;
  if(isDown('KeyW')||isDown('ArrowUp'))my=-1;if(isDown('KeyS')||isDown('ArrowDown'))my=1;
  if(mx||my){
    const len=Math.hypot(mx,my);mx/=len;my/=len;
    if(Math.abs(mx)>Math.abs(my))p.dir=mx>0?'right':'left';else p.dir=my>0?'down':'up';
    moveWithCollision(p,mx*getPlayerSpeed()*dt,my*getPlayerSpeed()*dt);
    if(!p.dashing){p.squashX=1+Math.sin(p.bobTimer*15)*0.04;p.squashY=1-Math.sin(p.bobTimer*15)*0.04}
  }
  // Dash
  if(wasPressed('KeyX')&&p.dashCd<=0&&!p.dashing){p.dashing=true;p.dashTimer=0.15;p.dashCd=0.4;p.iframes=0.2;p.squashX=1.3;p.squashY=0.7;seDash()}
  if(p.dashing){p.dashTimer-=dt;if(p.dashTimer<=0){p.dashing=false;p.squashX=0.85;p.squashY=1.15}}
  // Attack
  const wep=p.weapon||WEAPONS[0];
  const atkSpdMult=1+getAccBonus('atkSpeed');
  if(wasPressed('KeyZ')&&p.atkCd<=0&&!p.attacking){
    p.attacking=true;p.atkTimer=wep.dur/atkSpdMult;
    const cdMult=(hasBlessing('lastStand')&&p.hp===1)?0.5:1;
    p.atkCd=wep.cd*cdMult/atkSpdMult;p.squashX=0.8;p.squashY=1.2;seAttack();
    const dirs={down:{x:0,y:1},up:{x:0,y:-1},left:{x:-1,y:0},right:{x:1,y:0}};
    const d=dirs[p.dir];const ax=p.x+d.x*24,ay=p.y+d.y*24;
    for(const en of enemies){
      if(dist({x:ax,y:ay},en)<wep.range){
        let dmg=getPlayerAtk();
        if(hasBlessing('dashStrike')&&p.dashCd>0.2)dmg*=2;
        if(hasBlessing('wallCrush')){const ec=Math.floor(en.x/TILE),er=Math.floor(en.y/TILE);if(tileAt(roomMap,ec-1,er)===1||tileAt(roomMap,ec+1,er)===1||tileAt(roomMap,ec,er-1)===1||tileAt(roomMap,ec,er+1)===1)dmg=Math.ceil(dmg*1.5)}
        // Crit
        let isCrit=Math.random()*100<getPlayerCritRate();
        if(hasBlessing('critWing')&&(mx||my)&&Math.random()<0.2)isCrit=true;
        if(isCrit){dmg=Math.ceil(dmg*1.8);addParticle(en.x,en.y,'star',5)}
        en.hp-=dmg;en.flashTimer=0.15;en.squashX=1.3;en.squashY=0.7;
        seHit();doHitstop(3);doShake(3,0.08);
        addDmgNum(en.x,en.y-10,isCrit?dmg+'!':dmg,isCrit?'#ffeb3b':'#fff');addParticle(en.x,en.y,'star',3);
        const angle=Math.atan2(en.y-p.y,en.x-p.x);moveWithCollision(en,Math.cos(angle)*20,Math.sin(angle)*20);
        // Weapon FX
        if(wep.fx==='splash'){enemies.forEach(e2=>{if(e2!==en&&dist(en,e2)<60){e2.hp-=1;e2.flashTimer=0.1;addDmgNum(e2.x,e2.y-10,1,'#ff9800')}})}
        if(wep.fx==='lifesteal'||hasAccessory('vamp_fang')){const heal=Math.max(1,Math.floor(dmg*(0.03+(hasAccessory('vamp_fang')?0.05:0))));p.hp=Math.min(getPlayerMaxHp(),p.hp+heal)}
        if(wep.fx==='starburst'&&isCrit){addParticle(en.x,en.y,'star',10);doShake(5,0.12)}
      }
    }
  }
  if(p.attacking){p.atkTimer-=dt;if(p.atkTimer<=0)p.attacking=false}
  // Enemies
  for(let i=enemies.length-1;i>=0;i--){
    const en=enemies[i];en.wobble+=dt*en.wobbleSpeed;en.squashX=lerp(en.squashX,1,dt*10);en.squashY=lerp(en.squashY,1,dt*10);
    if(en.flashTimer>0)en.flashTimer-=dt;if(en.stunTimer>0){en.stunTimer-=dt;continue}
    if(en.type==='wander'){en.wanderTimer-=dt;if(en.wanderTimer<=0){en.dir=rnd(0,Math.PI*2);en.wanderTimer=rnd(1,3)}moveWithCollision(en,Math.cos(en.dir)*en.speed*dt,Math.sin(en.dir)*en.speed*dt)}
    else if(en.type==='chase'){const a=Math.atan2(p.y-en.y,p.x-en.x);en.face=dist(en,p)<150?'angry':'normal';const spd=en.face==='angry'?en.speed*1.3:en.speed;moveWithCollision(en,Math.cos(a)*spd*dt,Math.sin(a)*spd*dt)}
    else if(en.type==='charge'){
      if(en.chargeCd>0){en.chargeCd-=dt;continue}
      if(!en.telegraphing&&!en.charging){if(dist(en,p)<200){en.telegraphing=true;en.telegraphTimer=en.telegraphDur;en.face='angry'}else{en.wanderTimer-=dt;if(en.wanderTimer<=0){en.dir=rnd(0,Math.PI*2);en.wanderTimer=rnd(1,3)}moveWithCollision(en,Math.cos(en.dir)*en.speed*dt,Math.sin(en.dir)*en.speed*dt)}}
      if(en.telegraphing){en.telegraphTimer-=dt;en.squashX=1+Math.sin(en.telegraphTimer*20)*0.1;if(en.telegraphTimer<=0){en.telegraphing=false;en.charging=true;en.chargeTimer=en.chargeDur;en.chargeDir=Math.atan2(p.y-en.y,p.x-en.x)}}
      if(en.charging){en.chargeTimer-=dt;moveWithCollision(en,Math.cos(en.chargeDir)*en.chargeSpeed*dt,Math.sin(en.chargeDir)*en.chargeSpeed*dt);if(en.chargeTimer<=0){en.charging=false;en.chargeCd=2;en.stunTimer=0.8;en.face='normal'}}
    }
    // Enemy→Player collision
    if(p.iframes<=0&&rectOverlap({x:p.x-p.w/2,y:p.y-p.h/2,w:p.w,h:p.h},{x:en.x-en.w/2,y:en.y-en.h/2,w:en.w,h:en.h})){
      let dmg=en.dmg;if(p.buffs.def)dmg=Math.max(0,dmg-p.buffs.def.value);
      p.hp-=Math.max(1,dmg);p.iframes=1;seHurt();doShake(5,0.15);p.squashX=0.6;p.squashY=1.4;addDmgNum(p.x,p.y-20,dmg,'#e91e63');
      const angle=Math.atan2(p.y-en.y,p.x-en.x);moveWithCollision(p,Math.cos(angle)*30,Math.sin(angle)*30);
      if(hasBlessing('thornAura')){enemies.forEach(e2=>{if(dist(p,e2)<80){e2.hp-=1;e2.flashTimer=0.1;addParticle(e2.x,e2.y,'star',2)}})}
      if(p.hp<=0){gameState='dead';p.face='hurt'}
    }
    // Enemy death
    if(en.hp<=0){
      score+=en.score;seKill();addParticle(en.x,en.y,'poof',8);addParticle(en.x,en.y,'star',5);doShake(2,0.05);
      dropFromEnemy(en.x,en.y,en.defKey,en.dropChance);
      collectionDiscover(en.defKey);
      p.comboKills++;p.comboTimer=2;
      if(hasBlessing('comboHeal')&&p.comboKills>=3){p.hp=Math.min(getPlayerMaxHp(),p.hp+1);p.comboKills=0;addDmgNum(p.x,p.y-30,'+1HP','#e91e63')}
      enemies.splice(i,1);
    }
  }
  // Items
  for(let i=items.length-1;i>=0;i--){
    const it=items[i];it.bobTimer+=dt;it.life-=dt;
    if((it.type==='pollen'||it.type==='heal')&&dist(p,it)<getPlayerMagnetRange()){const a=Math.atan2(p.y-it.y,p.x-it.x);it.x+=Math.cos(a)*300*dt;it.y+=Math.sin(a)*300*dt}
    if(dist(p,it)<20){
      if(it.type==='pollen'){p.pollen++;score+=5;seItem()}
      else if(it.type==='heal'){const h=hasBlessing('sweetTooth')?2:1;p.hp=Math.min(getPlayerMaxHp(),p.hp+h);seItem()}
      else if(it.type==='weapon'){weaponPopup={active:true,weapon:it.weapon,sparkle:it.sparkle||false};seItem()}
      else if(it.type==='consumable'){
        const empty=p.consumables.findIndex(c=>c===null);
        if(empty>=0){p.consumables[empty]={...it.consumable};seItem();collectionDiscover('item_'+it.consumable.id)}
        // If full, ignore (could add swap UI later)
      }
      items.splice(i,1);continue;
    }
    if(it.life<=0)items.splice(i,1);
  }
  // Wave check
  if(enemies.length===0&&gameState==='playing'){wave++;if(wave>=WAVES.length){gameState='floorClear';waveTimer=1.5;seClear()}else{gameState='waveWait';waveTimer=1}}
  updateParticles(dt);updateDmgNums(dt);if(shakeTimer>0)shakeTimer-=dt;
}

/* ===== DRAW ===== */
function draw(){
  ctx.save();
  if(shakeTimer>0)ctx.translate(rnd(-shakeIntensity,shakeIntensity),rnd(-shakeIntensity,shakeIntensity));
  const th=getTheme();ctx.fillStyle=th.bg;ctx.fillRect(0,0,CW,CH);
  if(gameState==='title'){drawTitleScreen();ctx.restore();return}
  if(gameState==='prologue'){drawPrologueScreen();ctx.restore();return}
  drawTiles();drawItems();enemies.forEach(en=>drawEnemy(en));drawPlayer();drawParticles();drawDmgNums();drawHUD();
  if(gameState==='waveWait'){ctx.fillStyle='rgba(0,0,0,0.3)';ctx.fillRect(0,0,CW,CH);ctx.fillStyle='#fff';ctx.font='bold 28px sans-serif';ctx.textAlign='center';ctx.fillText('Wave '+(wave+1),CW/2,CH/2)}
  if(gameState==='floorClear'){ctx.fillStyle='rgba(0,0,0,0.3)';ctx.fillRect(0,0,CW,CH);ctx.fillStyle='#ffeb3b';ctx.font='bold 32px sans-serif';ctx.textAlign='center';ctx.fillText('Floor '+floor+' クリア!',CW/2,CH/2);ctx.fillStyle='#fff';ctx.font='16px sans-serif';ctx.fillText('✨ おめでとう! ✨',CW/2,CH/2+30)}
  if(gameState==='blessing')drawBlessingScreen();
  if(gameState==='dead'){ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,0,CW,CH);ctx.fillStyle='#e91e63';ctx.font='bold 36px sans-serif';ctx.textAlign='center';ctx.fillText('ゲームオーバー',CW/2,CH/2-20);ctx.fillStyle='#fff';ctx.font='16px sans-serif';ctx.fillText('スコア:'+score+'  Floor:'+floor,CW/2,CH/2+15);ctx.fillText('Zキーでリトライ',CW/2,CH/2+40)}
  if(gameState==='clear'){ctx.fillStyle='rgba(0,0,0,0.4)';ctx.fillRect(0,0,CW,CH);ctx.fillStyle='#ffeb3b';ctx.font='bold 36px sans-serif';ctx.textAlign='center';ctx.fillText('🎉 クリア! 🎉',CW/2,CH/2-20);ctx.fillStyle='#fff';ctx.font='18px sans-serif';ctx.fillText('スコア:'+score,CW/2,CH/2+15);ctx.fillText('Zキーでタイトルへ',CW/2,CH/2+40)}
  drawWeaponPopup();drawCollectionUI();
  ctx.restore();
}

/* ===== LOOP ===== */
collectionInit();
function loop(ts){
  const dt=Math.min((ts-(lastTime||ts))/1000,1/30);lastTime=ts;
  update(dt);draw();
  for(const k in pressed)pressed[k]=false;
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
