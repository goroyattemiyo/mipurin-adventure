// ===== js/equip_ui.js (Final Integrated Notebook Edition) =====
let equipCursor = 0; let equipListCursor = 0; let equipMode = 'slot'; let equipSlotRects = [];
function getAllOwnedWeapons() {
  let l = []; if(player.weapons[0]) l.push({w:player.weapons[0],src:'main'});
  if(player.weapons[1]) l.push({w:player.weapons[1],src:'sub'});
  player.backpack.forEach((b,i) => {if(b) l.push({w:b,src:'bp',idx:i})}); return l;
}
function getSlotWeapon(i) { return i===0?player.weapons[0]:i===1?player.weapons[1]:player.charm; }

function drawEquipTab(px, py, pw, ph) {
  const F = "'M PLUS Rounded 1c', sans-serif"; const _M = (typeof touchActive!=='undefined'&&touchActive)?2:1;
  const leftW = Math.floor(pw * 0.45); // LEFT PANE
  const rightW = pw - leftW - 35; // RIGHT PANE
  drawNotebookBase(ctx, px, py, pw, ph, '🌸 みぷりんの冒険手帳 — そうび');
  
  // LEFT PANE 内容
  ctx.fillStyle = '#3e2723'; ctx.font = 'bold 20px '+F; ctx.fillText('【 今の装備 】', px+25, py+90);
  for(let i=0; i<3; i++) {
    let sy = py+120 + i*115; let isSel = (equipMode==='slot'&&equipCursor===i);
    ctx.fillStyle = isSel ? '#fff9c4' : '#fff'; ctx.beginPath(); ctx.roundRect(px+20, sy, leftW, 100, 10); ctx.fill();
    ctx.strokeStyle = isSel ? '#f57f17' : '#d7ccc8'; ctx.lineWidth = isSel?3:1; ctx.stroke();
    let wep = getSlotWeapon(i);
    if(wep && typeof hasSprite==='function' && hasSprite('weapon_'+wep.id)) { // hasSprite
        drawSpriteImg('weapon_'+wep.id, px+30, sy+20, 60, 60); // drawSpriteImg
    }
  }
}
