/* ============================================================
   game.js – ミプリンの冒険  v0.2.0
   シーン管理 / プロローグスライドショー / タイトル
   ============================================================ */

const SCENE = Object.freeze({
  BOOT:      'boot',
  TITLE:     'title',
  PROLOGUE:  'prologue',
  MENU:      'menu',
  STORY:     'story',
  DUNGEON:   'dungeon',
  SETTINGS:  'settings',
  CREDITS:   'credits'
});

/* ---------- state ---------- */
let currentScene = SCENE.BOOT;
const player = {
  x: 0, y: 0,
  hp: CONFIG.PLAYER.HP,
  atk: CONFIG.PLAYER.ATK,
  speed: CONFIG.PLAYER.SPEED,
  needleDmg: CONFIG.PLAYER.NEEDLE_DMG,
  dir: 'down', frame: 0
};
const flags = { quest_started: false, has_green_key: false, killCount: 0, needleUseCount: 0 };
const meta  = { ending_a: false, ending_b: false, ending_c: false, titles: [] };

/* ---------- prologue images ---------- */
const PROLOGUE_TOTAL  = 10;
const prologueImages  = [];
let   prologueLoaded  = false;
let   prologueIndex   = 0;
let   prologueAlpha   = 0;     // current slide alpha
let   prologuePhase   = 'in';  // 'in' | 'hold' | 'out' | 'done'
let   prologueTimer   = 0;
let   prologueSkipped = false;

/* fade timing (frames at 30 FPS) */
const P_FADE_IN   = 30;  // 1.0 s
const P_HOLD      = 90;  // 3.0 s
const P_FADE_OUT  = 20;  // 0.67 s
const P_TEXT_DELAY = 15;  // text appears 0.5 s after image

/* ---------- helpers ---------- */
function loadPrologueImages () {
  let loaded = 0;
  for (let i = 1; i <= PROLOGUE_TOTAL; i++) {
    const img = new Image();
    const idx = i < 10 ? '0' + i : '' + i;
    img.src = 'assets/prologue/prologue_' + idx + '.webp';
    img.onload = () => { loaded++; if (loaded === PROLOGUE_TOTAL) prologueLoaded = true; };
    img.onerror = () => { console.warn('prologue image missing:', img.src); loaded++; if (loaded === PROLOGUE_TOTAL) prologueLoaded = true; };
    prologueImages.push(img);
  }
}

function drawTextCentered (ctx, text, y, font, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const lines = text.split('\n');
  const lineH = parseInt(font, 10) * 1.5;
  const startY = y - (lines.length - 1) * lineH / 2;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], CONFIG.CANVAS_W / 2, startY + i * lineH);
  }
  ctx.restore();
}

function drawTextWithShadow (ctx, text, y, font, color, alpha) {
  /* shadow */
  drawTextCentered(ctx, text, y + 2, font, 'rgba(0,0,0,0.6)', alpha);
  /* main */
  drawTextCentered(ctx, text, y, font, color, alpha);
}

/* ---------- prologue update / draw ---------- */
function updatePrologue () {
  if (prologueSkipped) return;

  /* input: advance or skip */
  if (Engine.input.enter || Engine.input.click) {
    Engine.input.enter = false;
    Engine.input.click = false;
    /* if holding, jump to next */
    if (prologuePhase === 'hold' || prologuePhase === 'in') {
      prologuePhase = 'out';
      prologueTimer = 0;
      return;
    }
  }
  if (Engine.input.escape) {
    Engine.input.escape = false;
    prologueSkipped = true;
    return;
  }

  prologueTimer++;

  switch (prologuePhase) {
    case 'in':
      prologueAlpha = Math.min(1, prologueTimer / P_FADE_IN);
      if (prologueTimer >= P_FADE_IN) { prologuePhase = 'hold'; prologueTimer = 0; }
      break;
    case 'hold':
      prologueAlpha = 1;
      if (prologueTimer >= P_HOLD) { prologuePhase = 'out'; prologueTimer = 0; }
      break;
    case 'out':
      prologueAlpha = Math.max(0, 1 - prologueTimer / P_FADE_OUT);
      if (prologueTimer >= P_FADE_OUT) {
        prologueIndex++;
        if (prologueIndex >= PROLOGUE_TOTAL) {
          prologuePhase = 'done';
        } else {
          prologuePhase = 'in';
          prologueTimer = 0;
          prologueAlpha = 0;
        }
      }
      break;
  }
}

function drawPrologue (ctx) {
  /* black background always */
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);

  if (prologueSkipped || prologuePhase === 'done') {
    currentScene = SCENE.TITLE;
    resetTitle();
    return;
  }

  const img = prologueImages[prologueIndex];
  if (!img || !img.complete) return;

  /* draw image centered, scaled to fit */
  const scale = Math.min(CONFIG.CANVAS_W / img.width, CONFIG.CANVAS_H / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  const x = (CONFIG.CANVAS_W - w) / 2;
  const y = (CONFIG.CANVAS_H - h) / 2;

  ctx.save();
  ctx.globalAlpha = prologueAlpha;
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();

  /* caption text (appears slightly after image) */
  const textAlpha = (prologuePhase === 'in')
    ? Math.max(0, (prologueTimer - P_TEXT_DELAY) / (P_FADE_IN - P_TEXT_DELAY))
    : prologueAlpha;

  const key = 'prologue_' + (prologueIndex + 1 < 10 ? '0' : '') + (prologueIndex + 1);
  const caption = Lang.t(key);
  if (caption && textAlpha > 0) {
    drawTextWithShadow(ctx, caption, CONFIG.CANVAS_H - 80, '20px sans-serif', '#FFFFFF', Math.min(1, textAlpha));
  }

  /* skip hint */
  drawTextCentered(ctx, Lang.t('prologue_skip'), CONFIG.CANVAS_H - 20, '12px sans-serif', 'rgba(255,255,255,0.4)', 1);
}

/* ---------- title ---------- */
let titleAlpha = 0;
let titleTimer = 0;
let titleReady = false;

function resetTitle () {
  titleAlpha = 0;
  titleTimer = 0;
  titleReady = false;
}

function updateTitle () {
  titleTimer++;
  if (titleTimer < 30) {
    titleAlpha = titleTimer / 30;
  } else {
    titleAlpha = 1;
    titleReady = true;
  }
  if (titleReady && (Engine.input.enter || Engine.input.click)) {
    Engine.input.enter = false;
    Engine.input.click = false;
    currentScene = SCENE.MENU;
  }
}

function drawTitle (ctx) {
  ctx.fillStyle = '#1a0a2e';
  ctx.fillRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);

  drawTextCentered(ctx, Lang.t('title'), CONFIG.CANVAS_H / 2 - 40, 'bold 48px sans-serif', '#F5A623', titleAlpha);

  if (titleReady) {
    const blink = Math.sin(titleTimer * 0.1) * 0.3 + 0.7;
    drawTextCentered(ctx, Lang.t('press_start'), CONFIG.CANVAS_H / 2 + 40, '18px sans-serif', '#FFFFFF', blink);
  }
}

/* ---------- menu (placeholder) ---------- */
function updateMenu () {
  /* TODO: menu selection */
}
function drawMenu (ctx) {
  ctx.fillStyle = '#1a0a2e';
  ctx.fillRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);
  drawTextCentered(ctx, Lang.t('title'), 80, 'bold 36px sans-serif', '#F5A623', 1);

  const items = ['menu_story', 'menu_dungeon', 'menu_collection', 'menu_settings', 'menu_credits'];
  for (let i = 0; i < items.length; i++) {
    drawTextCentered(ctx, Lang.t(items[i]), 200 + i * 50, '22px sans-serif', '#FFFFFF', 0.8);
  }
}

/* ---------- master update / draw ---------- */
function gameUpdate () {
  switch (currentScene) {
    case SCENE.PROLOGUE: updatePrologue(); break;
    case SCENE.TITLE:    updateTitle();    break;
    case SCENE.MENU:     updateMenu();     break;
  }
}

function gameDraw (ctx) {
  switch (currentScene) {
    case SCENE.PROLOGUE: drawPrologue(ctx); break;
    case SCENE.TITLE:    drawTitle(ctx);    break;
    case SCENE.MENU:     drawMenu(ctx);     break;
    default:
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, CONFIG.CANVAS_W, CONFIG.CANVAS_H);
      break;
  }
}

/* ---------- boot ---------- */
async function boot () {
  /* 1. init engine */
  Engine.init('gameCanvas', gameUpdate, gameDraw);

  /* 2. load language */
  await Lang.load(CONFIG.LANG);

  /* 3. load prologue images */
  loadPrologueImages();

  /* 4. restore meta */
  try {
    const raw = localStorage.getItem('mipurin_meta');
    if (raw) Object.assign(meta, JSON.parse(raw));
  } catch (e) { /* ignore */ }

  /* 5. hide loading, show canvas */
  const loadEl = document.getElementById('loading');
  const canvas = document.getElementById('gameCanvas');
  if (loadEl) loadEl.style.display = 'none';
  if (canvas) canvas.style.display = 'block';

  /* 6. start – go to prologue */
  currentScene = SCENE.PROLOGUE;
  Engine.start();
}

window.addEventListener('DOMContentLoaded', boot);
