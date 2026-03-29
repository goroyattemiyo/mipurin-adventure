// ===== WEAPON COLLECTION UI MODULE =====
// ===== drawWeaponCollection =====
function drawWeaponCollection() {
  var F = "'M PLUS Rounded 1c', sans-serif";
  var _M = (typeof touchActive !== 'undefined' && touchActive) ? 2 : 1;
  ctx.fillStyle = '#ffd700'; ctx.font = 'bold ' + (22*_M) + 'px ' + F;
  ctx.fillText('⚔ ぶき図鑑', 120, 190);
  var allDefs = (typeof WEAPON_DEFS !== 'undefined') ? WEAPON_DEFS : [];
  var total = allDefs.length;
  var ownedCount = allDefs.filter(function(d) {
    return (typeof weaponCollection !== 'undefined') && weaponCollection.has(d.id);
  }).length;
  ctx.fillStyle = '#333'; ctx.fillRect(120, 200, 400, 14);
  ctx.fillStyle = '#ffd700'; ctx.fillRect(120, 200, 400*(ownedCount/Math.max(1,total)), 14);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 12px ' + F; ctx.textAlign = 'center';
  ctx.fillText(ownedCount + ' / ' + total, 320, 211);
  ctx.textAlign = 'left';
  var cardH=68*_M, padY=5*_M, startY=225, startX=120, cardW=CW-250;
  var maxRows = Math.floor((CH-80-startY)/(cardH+padY));
  if (typeof window._wColSc === 'undefined') window._wColSc = 0;
  window._wColSc = Math.max(0, Math.min(window._wColSc, Math.max(0, allDefs.length-maxRows)));
  for (var wi=0; wi<Math.min(allDefs.length-window._wColSc, maxRows); wi++) {
    var def = allDefs[wi+window._wColSc];
    var isOwned = (typeof weaponCollection !== 'undefined') && weaponCollection.has(def.id);
    var wy2 = startY + wi*(cardH+padY);
    ctx.fillStyle = isOwned ? 'rgba(30,20,55,0.88)' : 'rgba(18,18,28,0.7)';
    ctx.beginPath(); ctx.roundRect(startX,wy2,cardW,cardH,12); ctx.fill();
    ctx.strokeStyle = isOwned ? (def.color||'#ffd700') : '#2a2a3a';
    ctx.lineWidth = isOwned ? 2 : 1;
    ctx.beginPath(); ctx.roundRect(startX,wy2,cardW,cardH,12); ctx.stroke();
    if (def.tier===2 && isOwned) {
      ctx.fillStyle='#e056fd'; ctx.font='bold '+(11*_M)+'px '+F;
      ctx.textAlign='right'; ctx.fillText('T2', startX+cardW-8, wy2+15*_M); ctx.textAlign='left';
    }
    var icoSize=Math.min(48*_M,cardH-8), icoX=startX+8, icoY=wy2+(cardH-icoSize)/2;
    if (isOwned) {
      var sprId='weapon_'+def.id;
      if (typeof hasSprite==='function' && hasSprite(sprId)) {
        ctx.save();
        var rf=(def.rarity&&typeof getRarityFilter==='function')?getRarityFilter(def.rarity):'none';
        if(rf!=='none') ctx.filter=rf;
        drawSpriteImg(sprId,icoX,icoY,icoSize,icoSize); ctx.restore();
      } else {
        ctx.fillStyle=def.color||'#fff'; ctx.font=Math.floor(icoSize*0.6)+'px '+F;
        ctx.textAlign='center'; ctx.fillText('⚔',icoX+icoSize/2,icoY+icoSize*0.72); ctx.textAlign='left';
      }
    } else {
      ctx.save(); ctx.globalAlpha=0.2; ctx.fillStyle='#666';
      ctx.font=Math.floor(icoSize*0.6)+'px '+F; ctx.textAlign='center';
      ctx.fillText('⚔',icoX+icoSize/2,icoY+icoSize*0.72);
      ctx.globalAlpha=1; ctx.restore(); ctx.textAlign='left';
    }
    var txX=startX+icoSize+18, textW=cardW-(icoSize+18)-14;
    var nameY=wy2+Math.round(cardH*0.40), descY=wy2+Math.round(cardH*0.74);
    if (isOwned) {
      var rCol=(def.rarity&&typeof getRarityDef==='function')?getRarityDef(def.rarity).color:(def.color||'#fff');
      ctx.fillStyle=rCol; ctx.font='bold '+(16*_M)+'px '+F;
      var dname=def.name;
      while(dname.length>1&&ctx.measureText(dname).width>textW) dname=dname.slice(0,-1);
      ctx.fillText(dname,txX,nameY);
      ctx.fillStyle='#bbb'; ctx.font=(12*_M)+'px '+F;
      var ddesc=def.desc||'';
      while(ddesc.length>1&&ctx.measureText(ddesc).width>textW) ddesc=ddesc.slice(0,-1);
      ctx.fillText(ddesc,txX,descY);
    } else {
      ctx.fillStyle='#3a3a4a'; ctx.font='bold '+(15*_M)+'px '+F;
      ctx.fillText('㿿まだ入手していない',txX,nameY);
    }
  }
  if (allDefs.length>maxRows) {
    var sbX=CW-130,sbY=startY,sbH=maxRows*(cardH+padY);
    var tH=Math.max(20,sbH*(maxRows/allDefs.length));
    var tY=sbY+(sbH-tH)*(window._wColSc/Math.max(1,allDefs.length-maxRows));
    ctx.fillStyle='rgba(255,255,255,0.1)'; ctx.fillRect(sbX,sbY,8,sbH);
    ctx.fillStyle='rgba(255,215,0,0.5)'; ctx.fillRect(sbX,tY,8,tH);
  }
}
