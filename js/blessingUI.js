/**
 * blessingUI.js - Blessing selection UI v2.0
 * レジェンダリ・デュオ祝福の表示対応
 */
window.BlessingUI = (() => {
  let _active = false;
  let _choices = [];
  let _selectedIndex = 0;
  let _onSelect = null;
  let _duoNotification = null;
  let _duoNotifTimer = 0;
  const FAMILY_LABELS = {rose:'Rose',lily:'Lily',sunflower:'Sunflower',wisteria:'Wisteria',lotus:'Lotus',chrysanthemum:'Chrysanthemum'};
  const RARITY_LABELS = {common:'コモン',rare:'レア',legendary:'レジェンダリ',duo:'デュオ'};
  const RARITY_COLORS = {common:'#aaaaaa',rare:'#f5d142',legendary:'#ff6600',duo:'#00ccff'};
  const ENGINE_ACTIONS = {left:'left',right:'right',confirm:'interact',confirmAlt:'attack'};
  function isActive(){return _active;}
  function show(choices,cb){_active=true;_choices=Array.isArray(choices)?choices:[];_selectedIndex=0;_onSelect=cb||null;}
  function hide(){_active=false;_choices=[];_selectedIndex=0;_onSelect=null;}
  function showDuoNotification(duo){_duoNotification=duo;_duoNotifTimer=3.0;}
  function handleInput(){
    if(!_active)return;if(typeof Engine==='undefined')return;
    if(Engine.consumePress(ENGINE_ACTIONS.left)){_selectedIndex=(_selectedIndex-1+_choices.length)%_choices.length;if(typeof Audio!=='undefined')Audio.playSe('menu_move');}
    if(Engine.consumePress(ENGINE_ACTIONS.right)){_selectedIndex=(_selectedIndex+1)%_choices.length;if(typeof Audio!=='undefined')Audio.playSe('menu_move');}
    if(Engine.consumePress(ENGINE_ACTIONS.confirm)||Engine.consumePress(ENGINE_ACTIONS.confirmAlt)){if(_onSelect&&_choices[_selectedIndex]){_onSelect(_choices[_selectedIndex]);if(typeof Audio!=='undefined')Audio.playSe('menu_select');}hide();}
  }
  function _drawRoundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
  function _wrapText(ctx,text,maxW){var lines=[],cur='',chars=(text||'').split('');for(var i=0;i<chars.length;i++){var n=cur+chars[i];if(ctx.measureText(n).width>maxW&&cur){lines.push(cur);cur=chars[i];}else{cur=n;}}if(cur)lines.push(cur);return lines;}
  function draw(ctx,W,H){
    if(!_active&&!(_duoNotifTimer>0))return;
    var colors=(typeof Blessings!=='undefined')?Blessings.FAMILY_COLORS:{};
    if(_duoNotifTimer>0&&_duoNotification&&!_active){
      var alpha=Math.min(1,_duoNotifTimer);ctx.save();ctx.globalAlpha=alpha;
      ctx.fillStyle='rgba(0,0,0,0.7)';var nw=400,nh=100,nx=(W-nw)/2,ny=80;
      _drawRoundRect(ctx,nx,ny,nw,nh,12);ctx.fill();
      ctx.strokeStyle=RARITY_COLORS.duo;ctx.lineWidth=3;ctx.stroke();
      ctx.fillStyle=RARITY_COLORS.duo;ctx.font='bold '+CONFIG.FONT_BASE+'px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText('デュオ祝福 発動！',W/2,ny+35);
      ctx.fillStyle='#fff';ctx.font=CONFIG.FONT_SM+'px monospace';
      ctx.fillText((_duoNotification.icon||'')+' '+(_duoNotification.name||''),W/2,ny+70);
      ctx.restore();return;
    }
    if(!_active)return;
    ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='top';ctx.font='bold '+CONFIG.FONT_LG+'px monospace';
    ctx.fillText('祝福を選んでください',W/2,60);
    var cardW=200,cardH=300,gap=30;
    var totalW=_choices.length*cardW+Math.max(0,_choices.length-1)*gap;
    var startX=Math.floor((W-totalW)/2),startY=Math.floor(H/2-cardH/2);
    for(var i=0;i<_choices.length;i++){
      var b=_choices[i],sel=i===_selectedIndex;
      var x=startX+i*(cardW+gap),y=startY+(sel?-10:0);
      var rar=b.rarity||'common',rc=RARITY_COLORS[rar]||'#aaa';
      ctx.save();if(sel){ctx.shadowColor=rc;ctx.shadowBlur=rar==='legendary'?30:20;}
      ctx.fillStyle=rar==='legendary'?'rgba(40,20,0,0.95)':'rgba(20,20,30,0.95)';
      _drawRoundRect(ctx,x,y,cardW,cardH,12);ctx.fill();
      ctx.lineWidth=rar==='legendary'?4:3;ctx.strokeStyle=colors[b.family]||rc;ctx.stroke();ctx.restore();
      ctx.fillStyle=rc;ctx.font=(CONFIG.FONT_SM-4)+'px monospace';ctx.textAlign='right';ctx.textBaseline='top';
      ctx.fillText(RARITY_LABELS[rar]||rar,x+cardW-10,y+8);
      ctx.textAlign='center';ctx.textBaseline='top';ctx.fillStyle='#fff';
      ctx.font=rar==='legendary'?'72px monospace':'64px monospace';
      ctx.fillText(b.icon||'❖',x+cardW/2,y+22);
      ctx.font=CONFIG.FONT_BASE+'px monospace';ctx.fillStyle=rar==='legendary'?'#ffcc00':'#fff';
      ctx.fillText(b.name||'',x+cardW/2,y+105);
      ctx.font=CONFIG.FONT_SM+'px monospace';ctx.fillStyle='#ddd';
      ctx.fillText(FAMILY_LABELS[b.family]||b.family||'',x+cardW/2,y+145);
      ctx.font=CONFIG.FONT_SM+'px monospace';ctx.fillStyle='#f0f0f0';
      var lines=_wrapText(ctx,b.description||'',cardW-32);
      for(var l=0;l<Math.min(lines.length,4);l++)ctx.fillText(lines[l],x+cardW/2,y+180+l*22);
    }
    ctx.fillStyle='rgba(255,255,255,0.8)';ctx.textAlign='center';ctx.textBaseline='bottom';
    ctx.font=CONFIG.FONT_SM+'px monospace';ctx.fillText('←→で選択、Eで決定',W/2,H-40);
  }
  function updateNotification(dt){if(_duoNotifTimer>0)_duoNotifTimer-=dt;}
  return {isActive:isActive,show:show,hide:hide,showDuoNotification:showDuoNotification,handleInput:handleInput,draw:draw,updateNotification:updateNotification};
})();
