/**
 * events.js - ランダムイベントシステム v1.0
 * ノードマップのイベントノード用
 */
window.GameEvents = (() => {
  var EVENTS = [
    {id:'mysterious_merchant',name:'謎の商人',description:'見知らぬ商人が現れた',
     type:'shop',weight:15,
     choices:[
       {text:'商品を見る',result:{type:'open_shop',shopType:'rare'}},
       {text:'話を聞く',result:{type:'dialogue',text:'「この先は危険だよ…でも、いい品があるんだ」'}},
       {text:'立ち去る',result:{type:'nothing'}}
     ]},
    {id:'healing_spring',name:'癒しの泉',description:'温かい蜂蜜の泉を見つけた',
     type:'rest',weight:12,
     choices:[
       {text:'泉に浸かる (HP全回復)',result:{type:'heal',value:'full'}},
       {text:'蜂蜜を汲む (回復アイテム獲得)',result:{type:'item',itemId:'royal_jelly'}},
       {text:'飲まない',result:{type:'nothing'}}
     ]},
    {id:'old_statue',name:'古い石像',description:'苔むした石像が佇んでいる',
     type:'blessing',weight:10,
     choices:[
       {text:'祈りを捧げる (ランダム祝福)',result:{type:'blessing',count:1}},
       {text:'調べる (ロア発見)',result:{type:'lore',entryId:'env_dark_tree'}},
       {text:'壊す (花粉獲得)',result:{type:'pollen',value:20}}
     ]},
    {id:'lost_bee',name:'迷い蜂',description:'怯えた蜂が一匹、震えている',
     type:'npc',weight:10,
     choices:[
       {text:'助ける (EXPボーナス)',result:{type:'exp',value:50}},
       {text:'話を聞く',result:{type:'dialogue',text:'「ありがとう…この先に、怖い影がいるの…」'}},
       {text:'無視する',result:{type:'karma',value:-1}}
     ]},
    {id:'treasure_trap',name:'宝箱の罠',description:'光る宝箱がある…怪しい',
     type:'risk',weight:8,
     choices:[
       {text:'開ける (50%で良アイテム、50%でダメージ)',result:{type:'gamble',goodResult:{type:'item',itemId:'speed_honey'},badResult:{type:'damage',value:10},chance:0.5}},
       {text:'慎重に調べる (確実に小報酬)',result:{type:'pollen',value:10}},
       {text:'無視する',result:{type:'nothing'}}
     ]},
    {id:'flower_spirit',name:'花の精霊',description:'透き通った花の精霊が微笑んでいる',
     type:'blessing',weight:8,
     choices:[
       {text:'祝福を受ける (祝福選択)',result:{type:'blessing',count:3}},
       {text:'質問する (ヒント)',result:{type:'dialogue',text:'「女王さまは…まだ戦っているわ。闇の中で」'}},
       {text:'花粉を捧げる (-15花粉でレア祝福)',result:{type:'rare_blessing',cost:15}}
     ]},
    {id:'abandoned_camp',name:'放棄された野営地',description:'誰かが残した野営地の跡',
     type:'rest',weight:10,
     choices:[
       {text:'休憩する (HP30%回復)',result:{type:'heal',value:0.3}},
       {text:'荷物を漁る (ランダムアイテム)',result:{type:'random_item'}},
       {text:'日記を読む (ロア)',result:{type:'lore',entryId:'env_forest_north'}}
     ]},
    {id:'dark_altar',name:'闇の祭壇',description:'不気味な祭壇が脈打っている',
     type:'risk',weight:6,
     choices:[
       {text:'血を捧げる (-5HP、攻撃力+20% 3部屋)',result:{type:'sacrifice',hpCost:5,buff:{type:'atkMul',value:0.20,duration:3}}},
       {text:'浄化する (花粉15消費、祝福獲得)',result:{type:'purify',pollenCost:15,reward:{type:'blessing',count:1}}},
       {text:'立ち去る',result:{type:'nothing'}}
     ]},
    {id:'memory_fragment',name:'記憶の欠片',description:'光る蜂蜜の結晶が浮かんでいる',
     type:'story',weight:7,
     choices:[
       {text:'触れる (ストーリー断片)',result:{type:'story_fragment',fragmentId:'queen_memory_1'}},
       {text:'持ち帰る (図鑑登録)',result:{type:'lore',entryId:'item_queens_tear'}}
     ]},
    {id:'training_ground',name:'修練場',description:'古い修練用の人形が並んでいる',
     type:'upgrade',weight:8,
     choices:[
       {text:'修行する (スキルポイント+1)',result:{type:'skill_point',value:1}},
       {text:'武器を研ぐ (次の3部屋攻撃+15%)',result:{type:'temp_buff',buff:{type:'atkMul',value:0.15,duration:3}}},
       {text:'素通りする',result:{type:'nothing'}}
     ]},
    {id:'butterfly_swarm',name:'蝶の群れ',description:'美しい蝶の群れが舞っている',
     type:'blessing',weight:5,
     choices:[
       {text:'追いかける (移動速度+10% 永続)',result:{type:'permanent_buff',buff:{type:'speedMul',value:0.10}}},
       {text:'眺める (HP5回復)',result:{type:'heal',value:5}},
       {text:'捕まえる (花粉25獲得)',result:{type:'pollen',value:25}}
     ]},
    {id:'cursed_chest',name:'呪われた宝箱',description:'黒い霧をまとった宝箱',
     type:'risk',weight:5,
     choices:[
       {text:'開ける (強力アイテム+呪い)',result:{type:'cursed_item',itemId:'hard_candy',curse:{type:'dmgTaken',value:0.10}}},
       {text:'浄化してから開ける (-20花粉)',result:{type:'safe_item',pollenCost:20,itemId:'hard_candy'}},
       {text:'無視する',result:{type:'nothing'}}
     ]}
  ];

  function getRandomEvent(floor, excludeIds){
    var excluded = new Set(excludeIds || []);
    var pool = EVENTS.filter(function(e){ return !excluded.has(e.id); });
    if(pool.length === 0) pool = EVENTS.slice();
    var totalWeight = 0;
    for(var i=0;i<pool.length;i++) totalWeight += (pool[i].weight || 1);
    var roll = Math.random() * totalWeight;
    for(var i=0;i<pool.length;i++){
      roll -= (pool[i].weight || 1);
      if(roll <= 0) return JSON.parse(JSON.stringify(pool[i]));
    }
    return JSON.parse(JSON.stringify(pool[pool.length-1]));
  }

  function getEventById(id){
    for(var i=0;i<EVENTS.length;i++){
      if(EVENTS[i].id === id) return JSON.parse(JSON.stringify(EVENTS[i]));
    }
    return null;
  }

  function resolveChoice(event, choiceIndex){
    if(!event || !event.choices || !event.choices[choiceIndex]) return null;
    var choice = event.choices[choiceIndex];
    var result = choice.result;
    if(result.type === 'gamble'){
      if(Math.random() < (result.chance || 0.5)){
        return {outcome:'good', result:result.goodResult, text:'幸運！'};
      } else {
        return {outcome:'bad', result:result.badResult, text:'不運…'};
      }
    }
    return {outcome:'normal', result:result};
  }

  function getEventCount(){ return EVENTS.length; }
  function getAllEvents(){ return EVENTS; }

  return {
    EVENTS:EVENTS, getRandomEvent:getRandomEvent, getEventById:getEventById,
    resolveChoice:resolveChoice, getEventCount:getEventCount, getAllEvents:getAllEvents
  };
})();
