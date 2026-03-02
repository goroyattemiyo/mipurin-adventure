/**
 * enemyAI.js - 統一AIフレームワーク v1.0
 * テレグラフ→攻撃→隙 のサイクルを保証
 */
window.EnemyAI = (() => {
  var ts = (typeof CONFIG !== 'undefined') ? CONFIG.TILE_SIZE : 64;
  function _randomDir(){var a=Math.random()*Math.PI*2;return {x:Math.cos(a),y:Math.sin(a)};}
  function _dirToPlayer(e,p){if(!p)return{x:0,y:0};var dx=p.x-e.x,dy=p.y-e.y,d=Math.sqrt(dx*dx+dy*dy)||1;return{x:dx/d,y:dy/d};}
  function _distToPlayer(e,p){if(!p)return 9999;var dx=p.x-e.x,dy=p.y-e.y;return Math.sqrt(dx*dx+dy*dy);}
  function _tryMoveEnemy(e,dx,dy,speed,ctx){
    if(dx===0&&dy===0)return false;
    var margin=4,nx=e.x+dx*speed,ny=e.y+dy*speed;
    if(typeof MapManager==='undefined'){e.x=nx;e.y=ny;return true;}
    var cL=Math.floor((nx+margin)/ts),cR=Math.floor((nx+ts-margin-1)/ts);
    var rT=Math.floor((ny+margin)/ts),rB=Math.floor((ny+ts-margin-1)/ts);
    if(!MapManager.isSolid(cL,rT)&&!MapManager.isSolid(cR,rT)&&!MapManager.isSolid(cL,rB)&&!MapManager.isSolid(cR,rB)){e.x=nx;e.y=ny;return true;}
    return false;
  }
  var PATTERNS = {
    wander: {
      states:['idle','walk'],
      transitions:{idle:{duration:[1.0,2.0],next:'walk'},walk:{duration:[1.5,3.0],next:'idle'}},
      behavior:{idle:function(){},walk:function(e,dt,ctx){if(!e._wanderDir)e._wanderDir=_randomDir();_tryMoveEnemy(e,e._wanderDir.x,e._wanderDir.y,e.speed*dt*60,ctx);}}
    },
    chase: {
      states:['pursue','pause'],
      transitions:{pursue:{duration:[2.0,4.0],next:'pause',condition:'playerInRange',range:6},pause:{duration:[0.5,1.0],next:'pursue'}},
      behavior:{pursue:function(e,dt,ctx){var d=_dirToPlayer(e,ctx.player);_tryMoveEnemy(e,d.x,d.y,e.speed*dt*60,ctx);},pause:function(){}}
    },
    ambush: {
      states:['wait','telegraph','charge','recover'],
      transitions:{wait:{duration:[999,999],next:'telegraph',condition:'playerInRange',range:3},telegraph:{duration:[0.4,0.4],next:'charge'},charge:{duration:[0.35,0.35],next:'recover'},recover:{duration:[1.0,1.5],next:'wait'}},
      behavior:{wait:function(){},telegraph:function(e,dt,ctx){e._telegraphTimer=0.4;var d=_dirToPlayer(e,ctx.player);e._chargeDir={x:d.x,y:d.y};},charge:function(e,dt,ctx){if(e._chargeDir)_tryMoveEnemy(e,e._chargeDir.x,e._chargeDir.y,e.speed*3.2*dt*60,ctx);},recover:function(){}}
    },
    explode: {
      states:['approach','telegraph','detonate'],
      transitions:{approach:{duration:[999,999],next:'telegraph',condition:'playerInRange',range:1.5},telegraph:{duration:[0.6,0.6],next:'detonate'},detonate:{duration:[0.1,0.1],next:'approach'}},
      behavior:{approach:function(e,dt,ctx){var d=_dirToPlayer(e,ctx.player);_tryMoveEnemy(e,d.x,d.y,e.speed*1.1*dt*60,ctx);},telegraph:function(e){e._telegraphTimer=0.6;},detonate:function(e,dt,ctx){var dist=_distToPlayer(e,ctx.player);if(dist<=ts*1.8&&ctx.damagePlayer)ctx.damagePlayer(ctx.player,e);if(typeof Particles!=='undefined')Particles.emit(e.x+ts/2,e.y+ts/2,10,'#E74C3C',{speedMin:40,speedMax:100,lifeMin:0.3,lifeMax:0.7,sizeMin:3,sizeMax:6});e.dead=true;}}
    },
    swoop: {
      states:['cruise','telegraph','dive','pause','rise'],
      transitions:{cruise:{duration:[999,999],next:'telegraph',condition:'playerAlignedX',tolerance:0.5},telegraph:{duration:[0.3,0.3],next:'dive'},dive:{duration:[0.4,0.4],next:'pause'},pause:{duration:[0.3,0.3],next:'rise'},rise:{duration:[0.4,0.4],next:'cruise'}},
      behavior:{cruise:function(e,dt,ctx){if(!e._swoopDir)e._swoopDir=Math.random()<0.5?-1:1;var m=_tryMoveEnemy(e,e._swoopDir,0,e.speed*1.4*dt*60,ctx);if(!m)e._swoopDir*=-1;},telegraph:function(e){e._telegraphTimer=0.3;},dive:function(e,dt,ctx){_tryMoveEnemy(e,0,1,e.speed*2.5*dt*60,ctx);},pause:function(){},rise:function(e,dt,ctx){_tryMoveEnemy(e,0,-1,e.speed*2.0*dt*60,ctx);}}
    },
    burrow: {
      states:['visible','submerge','underground','telegraph','emerge'],
      transitions:{visible:{duration:[3.0,3.0],next:'submerge'},submerge:{duration:[0.3,0.3],next:'underground'},underground:{duration:[1.0,1.5],next:'telegraph'},telegraph:{duration:[0.4,0.4],next:'emerge'},emerge:{duration:[0.4,0.4],next:'visible'}},
      behavior:{visible:function(e){e.hidden=false;},submerge:function(e){e.hidden=true;},underground:function(e,dt,ctx){e.hidden=true;var d=_dirToPlayer(e,ctx.player);_tryMoveEnemy(e,d.x,d.y,e.speed*2.2*dt*60,ctx);},telegraph:function(e){e.hidden=false;e._telegraphTimer=0.4;},emerge:function(e,dt,ctx){e.hidden=false;var dist=_distToPlayer(e,ctx.player);if(!e._emergeHitDone&&dist<=ts*1.2&&ctx.damagePlayer){ctx.damagePlayer(ctx.player,e);e._emergeHitDone=true;}}}
    },
    root_attack: {
      states:['idle','telegraph','attack','recover'],
      transitions:{idle:{duration:[1.5,2.0],next:'telegraph',condition:'playerInLineOfSight',range:6},telegraph:{duration:[0.5,0.5],next:'attack'},attack:{duration:[0.2,0.2],next:'recover'},recover:{duration:[1.5,2.0],next:'idle'}},
      behavior:{idle:function(){},telegraph:function(e){e._telegraphTimer=0.5;},attack:function(e,dt,ctx){var dist=_distToPlayer(e,ctx.player);if(dist<=ts*6&&ctx.damagePlayer)ctx.damagePlayer(ctx.player,e);},recover:function(){}}
    },
    dive: {
      states:['orbit','telegraph','dash','stun'],
      transitions:{orbit:{duration:[1.5,2.0],next:'telegraph'},telegraph:{duration:[0.3,0.3],next:'dash'},dash:{duration:[0.35,0.35],next:'stun'},stun:{duration:[0.6,0.8],next:'orbit'}},
      behavior:{orbit:function(e,dt,ctx){if(!e._orbitTimer)e._orbitTimer=0;e._orbitTimer+=dt*2;var ox=Math.sin(e._orbitTimer)*ts*1.2,oy=Math.sin(e._orbitTimer*2)*ts*0.8;var tx=(e.baseX||e.x)+ox,ty=(e.baseY||e.y)+oy;var ddx=tx-e.x,ddy=ty-e.y,d=Math.sqrt(ddx*ddx+ddy*ddy)||1;_tryMoveEnemy(e,ddx/d,ddy/d,e.speed*1.2*dt*60,ctx);},telegraph:function(e,dt,ctx){e._telegraphTimer=0.3;var d=_dirToPlayer(e,ctx.player);e._diveDir={x:d.x,y:d.y};},dash:function(e,dt,ctx){if(e._diveDir)_tryMoveEnemy(e,e._diveDir.x,e._diveDir.y,e.speed*4.5*dt*60,ctx);},stun:function(){}}
    },
    patrol: {
      states:['walk_left','pause_left','walk_right','pause_right'],
      transitions:{walk_left:{duration:[2.0,3.0],next:'pause_left'},pause_left:{duration:[0.5,1.0],next:'walk_right'},walk_right:{duration:[2.0,3.0],next:'pause_right'},pause_right:{duration:[0.5,1.0],next:'walk_left'}},
      behavior:{walk_left:function(e,dt,ctx){_tryMoveEnemy(e,-1,0,e.speed*dt*60,ctx);},pause_left:function(){},walk_right:function(e,dt,ctx){_tryMoveEnemy(e,1,0,e.speed*dt*60,ctx);},pause_right:function(){}}
    },
    sniper: {
      states:['aim','telegraph','shoot','relocate'],
      transitions:{aim:{duration:[1.5,2.5],next:'telegraph',condition:'playerInRange',range:8},telegraph:{duration:[0.8,0.8],next:'shoot'},shoot:{duration:[0.2,0.2],next:'relocate'},relocate:{duration:[1.0,1.5],next:'aim'}},
      behavior:{aim:function(){},telegraph:function(e){e._telegraphTimer=0.8;},shoot:function(e,dt,ctx){var dist=_distToPlayer(e,ctx.player);if(dist<=ts*8&&ctx.damagePlayer)ctx.damagePlayer(ctx.player,e);},relocate:function(e,dt,ctx){var d=_randomDir();_tryMoveEnemy(e,d.x,d.y,e.speed*1.5*dt*60,ctx);}}
    },
    shield: {
      states:['guard','telegraph','slam','recover'],
      transitions:{guard:{duration:[2.0,3.0],next:'telegraph',condition:'playerInRange',range:2},telegraph:{duration:[0.5,0.5],next:'slam'},slam:{duration:[0.3,0.3],next:'recover'},recover:{duration:[1.0,1.5],next:'guard'}},
      behavior:{guard:function(e,dt,ctx){e._shielded=true;var d=_dirToPlayer(e,ctx.player);_tryMoveEnemy(e,d.x,d.y,e.speed*0.5*dt*60,ctx);},telegraph:function(e){e._shielded=false;e._telegraphTimer=0.5;},slam:function(e,dt,ctx){var dist=_distToPlayer(e,ctx.player);if(dist<=ts*2&&ctx.damagePlayer)ctx.damagePlayer(ctx.player,e);},recover:function(e){e._shielded=false;}}
    },
    summoner: {
      states:['idle','telegraph','summon','flee'],
      transitions:{idle:{duration:[3.0,5.0],next:'telegraph'},telegraph:{duration:[0.6,0.6],next:'summon'},summon:{duration:[0.3,0.3],next:'flee'},flee:{duration:[2.0,3.0],next:'idle'}},
      behavior:{idle:function(){},telegraph:function(e){e._telegraphTimer=0.6;},summon:function(e){e._summonRequest=true;},flee:function(e,dt,ctx){var d=_dirToPlayer(e,ctx.player);_tryMoveEnemy(e,-d.x,-d.y,e.speed*1.5*dt*60,ctx);}}
    }
  };
  function _checkCondition(name,e,ctx,trans){
    var p=ctx.player;if(!p)return false;
    if(name==='playerInRange')return _distToPlayer(e,p)<=(trans.range||3)*ts;
    if(name==='playerAlignedX')return Math.abs(p.x-e.x)<=(trans.tolerance||0.5)*ts;
    if(name==='playerInLineOfSight'){var dx=Math.abs(p.x-e.x),dy=Math.abs(p.y-e.y);return(dx<=ts*0.5||dy<=ts*0.5)&&_distToPlayer(e,p)<=(trans.range||6)*ts;}
    return true;
  }
  function _randomDuration(trans){if(!trans||!trans.duration)return 1;return trans.duration[0]+Math.random()*(trans.duration[1]-trans.duration[0]);}
  function initEnemy(e){
    var pat=PATTERNS[e.movePattern||'wander'];if(!pat)return;
    e._aiState=pat.states[0];e._aiTimer=_randomDuration(pat.transitions[e._aiState]);e._emergeHitDone=false;
  }
  function updateEnemy(e,dt,ctx){
    if(e.dead||e.hurtTimer>0)return;
    var pn=e.movePattern||'wander',pat=PATTERNS[pn];if(!pat)return;
    if(!e._aiState)initEnemy(e);
    if(e._telegraphTimer>0)e._telegraphTimer-=dt;
    if(e._flashTimer>0)e._flashTimer-=dt;
    var beh=pat.behavior[e._aiState];if(beh)beh(e,dt,ctx);
    e._aiTimer-=dt;
    if(e._aiTimer<=0){
      var trans=pat.transitions[e._aiState];
      if(trans){
        if(trans.condition&&!_checkCondition(trans.condition,e,ctx,trans)){e._aiTimer=0.1;return;}
        e._aiState=trans.next;
        var nt=pat.transitions[e._aiState];e._aiTimer=_randomDuration(nt);
        if(e._aiState==='visible'||e._aiState==='emerge')e._emergeHitDone=false;
      }
    }
  }
  function drawTelegraph(ctx,e){
    if(!e._telegraphTimer||e._telegraphTimer<=0)return;
    var x=Math.round(e.x),y=Math.round(e.y);
    ctx.save();ctx.globalAlpha=0.5+Math.sin(Date.now()*0.01)*0.3;
    ctx.strokeStyle='#ff3333';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(x+ts/2,y+ts/2,ts*0.7,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='rgba(255,51,51,0.15)';ctx.beginPath();ctx.arc(x+ts/2,y+ts/2,ts*0.5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ff3333';ctx.font='bold 20px monospace';ctx.textAlign='center';ctx.textBaseline='bottom';
    ctx.fillText('!',x+ts/2,y-5);ctx.restore();
  }
  function isVulnerable(e){
    var s=e._aiState||'';return['recover','pause','stun','rise','pause_left','pause_right','relocate'].indexOf(s)>=0;
  }
  function drawVulnerableIndicator(ctx,e){
    if(!isVulnerable(e))return;
    var x=Math.round(e.x),y=Math.round(e.y);
    ctx.save();ctx.globalAlpha=0.5+Math.sin(Date.now()*0.008)*0.3;
    ctx.strokeStyle='#00ff88';ctx.lineWidth=2;ctx.setLineDash([4,4]);
    ctx.beginPath();ctx.arc(x+ts/2,y+ts/2,ts*0.55,0,Math.PI*2);ctx.stroke();
    ctx.setLineDash([]);ctx.restore();
  }
  function getPatternNames(){return Object.keys(PATTERNS);}
  function getPattern(name){return PATTERNS[name]||null;}
  return {PATTERNS:PATTERNS,initEnemy:initEnemy,updateEnemy:updateEnemy,drawTelegraph:drawTelegraph,drawVulnerableIndicator:drawVulnerableIndicator,isVulnerable:isVulnerable,getPatternNames:getPatternNames,getPattern:getPattern};
})();
