/**
 * uiHelper.js - 統一HUDレイアウトマネージャ v1.0
 * 左上:HP/針/祝福 右上:フロア/部屋/花粉 左下:ミニマップ 右下:ドロップログ
 */
window.UIHelper = (() => {
  var _cfg = (typeof CONFIG !== 'undefined') ? CONFIG : {TILE_SIZE:64,CANVAS_WIDTH:1920,CANVAS_HEIGHT:1440,FONT_BASE:32,FONT_SM:24,FONT_LG:48};
  var PADDING = 16;
  var BAR_HEIGHT = 24;
  var BAR_WIDTH = 200;
  var ICON_SIZE = 28;
  var _dropLog = [];
  var DROP_LOG_MAX = 5;
  var DROP_LOG_DURATION = 4.0;
  var COLORS = {
    hpBar:'#e74c3c',hpBarBg:'#555',needleBar:'#3498db',needleBarBg:'#555',
    textWhite:'#ffffff',textGold:'#f1c40f',textGray:'#999',
    panelBg:'rgba(0,0,0,0.6)',panelBorder:'rgba(255,255,255,0.2)',blessingSlot:'rgba(255,255,255,0.1)'
  };
  function _roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
  function drawTopLeft(ctx,player,blessings){
    var x=PADDING,y=PADDING;
    ctx.save();ctx.fillStyle=COLORS.panelBg;_roundRect(ctx,x-4,y-4,BAR_WIDTH+60,120,8);ctx.fill();
    ctx.strokeStyle=COLORS.panelBorder;ctx.lineWidth=1;ctx.stroke();ctx.restore();
    var hpR=Math.max(0,(player.hp||0)/(player.maxHp||1));
    ctx.fillStyle=COLORS.hpBarBg;_roundRect(ctx,x,y,BAR_WIDTH,BAR_HEIGHT,4);ctx.fill();
    ctx.fillStyle=COLORS.hpBar;if(hpR>0){_roundRect(ctx,x,y,BAR_WIDTH*hpR,BAR_HEIGHT,4);ctx.fill();}
    ctx.fillStyle=COLORS.textWhite;ctx.font=_cfg.FONT_SM+'px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('HP '+Math.ceil(player.hp||0)+'/'+(player.maxHp||0),x+BAR_WIDTH/2,y+BAR_HEIGHT/2);
    var ny=y+BAR_HEIGHT+8;var needles=player.needles!==undefined?player.needles:0;var maxN=player.maxNeedles||10;var nR=needles/maxN;
    ctx.fillStyle=COLORS.needleBarBg;_roundRect(ctx,x,ny,BAR_WIDTH,BAR_HEIGHT*0.7,4);ctx.fill();
    ctx.fillStyle=COLORS.needleBar;if(nR>0){_roundRect(ctx,x,ny,BAR_WIDTH*nR,BAR_HEIGHT*0.7,4);ctx.fill();}
    ctx.fillStyle=COLORS.textWhite;ctx.font=(_cfg.FONT_SM-4)+'px monospace';
    ctx.fillText('針 '+needles+'/'+maxN,x+BAR_WIDTH/2,ny+BAR_HEIGHT*0.35);
    var by=ny+BAR_HEIGHT*0.7+8;var owned=blessings||[];var maxS=8;
    for(var i=0;i<maxS;i++){var bx=x+i*(ICON_SIZE+4);ctx.fillStyle=COLORS.blessingSlot;_roundRect(ctx,bx,by,ICON_SIZE,ICON_SIZE,4);ctx.fill();if(i<owned.length){ctx.font=(ICON_SIZE-4)+'px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(owned[i].icon||'?',bx+ICON_SIZE/2,by+ICON_SIZE/2);}}
    if(owned.length>maxS){ctx.fillStyle=COLORS.textGray;ctx.font=(_cfg.FONT_SM-4)+'px monospace';ctx.textAlign='left';ctx.fillText('+'+(owned.length-maxS),x+maxS*(ICON_SIZE+4)+4,by+ICON_SIZE/2);}
  }
  function drawTopRight(ctx,data){
    var w=180,h=90,x=_cfg.CANVAS_WIDTH-w-PADDING,y=PADDING;
    ctx.save();ctx.fillStyle=COLORS.panelBg;_roundRect(ctx,x,y,w,h,8);ctx.fill();
    ctx.strokeStyle=COLORS.panelBorder;ctx.lineWidth=1;ctx.stroke();ctx.restore();
    ctx.fillStyle=COLORS.textWhite;ctx.font=_cfg.FONT_SM+'px monospace';ctx.textAlign='right';ctx.textBaseline='top';
    ctx.fillText('F'+(data.floor!==undefined?data.floor:'-'),x+w-12,y+10);
    ctx.fillStyle=COLORS.textGray;ctx.fillText('部屋 '+(data.rooms!==undefined?data.rooms:'-'),x+w-12,y+36);
    ctx.fillStyle=COLORS.textGold;ctx.fillText('花粉 '+(data.pollen!==undefined?data.pollen:'-'),x+w-12,y+62);
  }
  function drawBottomLeft(ctx,minimapData){
    var size=140,x=PADDING,y=_cfg.CANVAS_HEIGHT-size-PADDING;
    ctx.save();ctx.fillStyle=COLORS.panelBg;_roundRect(ctx,x,y,size,size,8);ctx.fill();
    ctx.strokeStyle=COLORS.panelBorder;ctx.lineWidth=1;ctx.stroke();
    if(minimapData&&typeof minimapData.draw==='function'){minimapData.draw(ctx,x+4,y+4,size-8,size-8);}
    else{ctx.fillStyle=COLORS.textGray;ctx.font=(_cfg.FONT_SM-6)+'px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('MAP',x+size/2,y+size/2);}
    ctx.restore();
  }
  function drawBottomRight(ctx){
    var w=250,lineH=24;var vis=_dropLog.filter(function(l){return l.timer>0;});if(vis.length===0)return;
    var h=vis.length*lineH+PADDING*2,x=_cfg.CANVAS_WIDTH-w-PADDING,y=_cfg.CANVAS_HEIGHT-h-PADDING;
    ctx.save();ctx.fillStyle=COLORS.panelBg;_roundRect(ctx,x,y,w,h,8);ctx.fill();
    ctx.font=(_cfg.FONT_SM-4)+'px monospace';ctx.textAlign='left';ctx.textBaseline='top';
    for(var i=0;i<vis.length;i++){var alpha=Math.min(1,vis[i].timer/1.0);ctx.fillStyle='rgba(255,255,255,'+alpha+')';ctx.fillText(vis[i].text,x+12,y+PADDING+i*lineH);}
    ctx.restore();
  }
  function addDropLog(text){_dropLog.unshift({text:text,timer:DROP_LOG_DURATION});if(_dropLog.length>DROP_LOG_MAX)_dropLog.pop();}
  function updateDropLog(dt){for(var i=_dropLog.length-1;i>=0;i--){_dropLog[i].timer-=dt;if(_dropLog[i].timer<=0)_dropLog.splice(i,1);}}
  function drawHUD(ctx,opts){
    opts=opts||{};
    if(opts.player)drawTopLeft(ctx,opts.player,opts.blessings||[]);
    if(opts.dungeonData)drawTopRight(ctx,opts.dungeonData);
    drawBottomLeft(ctx,opts.minimap||null);
    drawBottomRight(ctx);
  }
  function drawDamageFlash(ctx,x,y,text,type){
    ctx.save();ctx.font='bold '+_cfg.FONT_BASE+'px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    if(type==='critical'){ctx.fillStyle='#ffcc00';ctx.font='bold '+_cfg.FONT_LG+'px monospace';}
    else if(type==='heal'){ctx.fillStyle='#00ff88';}else{ctx.fillStyle='#ffffff';}
    ctx.fillText(text,x,y);ctx.restore();
  }
  function drawTooltip(ctx,x,y,lines){
    if(!lines||lines.length===0)return;
    var lineH=_cfg.FONT_SM+4;ctx.font=_cfg.FONT_SM+'px monospace';
    var maxW=0;for(var i=0;i<lines.length;i++){var m=ctx.measureText(lines[i]).width;if(m>maxW)maxW=m;}
    maxW+=24;var h=lines.length*lineH+16;
    ctx.save();ctx.fillStyle='rgba(0,0,0,0.85)';_roundRect(ctx,x,y,maxW,h,6);ctx.fill();
    ctx.strokeStyle=COLORS.panelBorder;ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle=COLORS.textWhite;ctx.font=_cfg.FONT_SM+'px monospace';ctx.textAlign='left';ctx.textBaseline='top';
    for(var i=0;i<lines.length;i++)ctx.fillText(lines[i],x+12,y+8+i*lineH);
    ctx.restore();
  }
  return {COLORS:COLORS,drawTopLeft:drawTopLeft,drawTopRight:drawTopRight,drawBottomLeft:drawBottomLeft,drawBottomRight:drawBottomRight,drawHUD:drawHUD,addDropLog:addDropLog,updateDropLog:updateDropLog,drawDamageFlash:drawDamageFlash,drawTooltip:drawTooltip};
})();
