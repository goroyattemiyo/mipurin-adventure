/**
 * npcDialogue.js - NPC会話拡張 v1.0
 * 対話段階10-15レベル、ロア深化、好感度システム
 */
window.NpcDialogue = (() => {
  var AFFINITY_MAX = 15;

  var NPC_DIALOGUE_STAGES = {
    hatch: {
      name:'長老ハッチ', stages:[
        {level:0, text:'「おお、ミプリン。\n今日も元気そうじゃな。」'},
        {level:1, text:'「森の様子がおかしい。\n気をつけるんじゃぞ。」'},
        {level:2, text:'「昔はこの村も\nもっと賑やかだったんじゃ…」'},
        {level:3, text:'「おまえの父タイガは\n村一番の戦士じゃった。」'},
        {level:4, text:'「母ハナは花の言葉を\n聞ける不思議な蜂でな…」'},
        {level:5, text:'「二人が森に行った日…\nわしは止められなかった。」'},
        {level:6, text:'「女王レイラさまは\n自ら闇に向かわれたんじゃ。」'},
        {level:7, text:'「この村の蜂蜜が\n黄金色なのは女王の加護じゃ。」'},
        {level:8, text:'「加護が弱まっている…\n蜂蜜が濁り始めておる。」'},
        {level:9, text:'「ミプリン…おまえだけが\n希望なんじゃ。すまんな。」'},
        {level:10, text:'「わしが若い頃…\n女王さまに直接お会いしたことがある。」'},
        {level:11, text:'「あの方は微笑んでおられた。\n『この村を守る』と…」'},
        {level:12, text:'「タイガはな…最後にこう言った。\n『ミプリンを頼む』と。」'},
        {level:13, text:'「全部…全部わしのせいじゃ…\nすまない…ミプリン…」'},
        {level:14, text:'「…でもおまえがいてくれて\nよかった。本当に。」'}
      ]
    },
    miel: {
      name:'占い師ミエル', stages:[
        {level:0, text:'「あら、ミプリンちゃん。\n占っていく？」'},
        {level:1, text:'「星がね…少し揺れてるの。\n何かが起きる予感。」'},
        {level:2, text:'「わたしの占いはね、\n蜂蜜の波紋で読むの。」'},
        {level:3, text:'「あなたのお母さんにも\n占ってあげたことがあるわ。」'},
        {level:4, text:'「ハナさんは笑ってた。\n『未来は自分で作る』って。」'},
        {level:5, text:'「でもね…最後の占いだけは\n当たってしまったの…」'},
        {level:6, text:'「『遠い場所で光になる』\n…そう出たの。」'},
        {level:7, text:'「ミプリンちゃんの未来は\nまだ揺れてる。まだ変えられる。」'},
        {level:8, text:'「闇の奥に…光が見える。\nでも触れると消えそうで…」'},
        {level:9, text:'「あなたには選ぶ力がある。\nわたしにはそれが見えるの。」'},
        {level:10, text:'「女王さまの声が…\n時々、蜂蜜の中から聞こえるの。」'},
        {level:11, text:'「『助けて』じゃないの。\n『ありがとう』って…」'},
        {level:12, text:'「ミプリンちゃん…\nわたし、あなたの未来が怖い。」'},
        {level:13, text:'「怖いけど…信じてる。\nあなたならきっと。」'}
      ]
    },
    marche: {
      name:'商人マルシェ', stages:[
        {level:0, text:'「いらっしゃい！\n何か買ってく？」'},
        {level:1, text:'「最近モンスターのせいで\n仕入れが大変なのよね。」'},
        {level:2, text:'「あたしも昔は\n冒険者だったんだよ。」'},
        {level:3, text:'「ハナと一緒に\n花畑まで行ったことがある。」'},
        {level:4, text:'「あの頃は花畑も\nきれいだったんだけどね…」'},
        {level:5, text:'「タイガは不器用でさ。\nプロポーズ3回失敗したんだよ。」'},
        {level:6, text:'「でも4回目にハナが\n『もう、いいわよ』って。笑」'},
        {level:7, text:'「あたしね、ずっと\nハナのポット預かってたの。」'},
        {level:8, text:'「いつか渡せる日が来るって\n信じてたからさ。」'},
        {level:9, text:'「ミプリン…あんた、\nハナにそっくりだよ。」'},
        {level:10, text:'「強いところも、\n優しいところも。」'},
        {level:11, text:'「あたしにできることは\n商品を安くするくらいだけど…」'},
        {level:12, text:'「…行っておいで。\nあんたなら大丈夫。」'}
      ]
    },
    bee: {
      name:'ビー', stages:[
        {level:0, text:'「ミプリン！\nきょうもあそぼ！」'},
        {level:1, text:'「ぼくね、おおきくなったら\nぼうけんかになるの！」'},
        {level:2, text:'「ミプリンみたいに\nつよくなりたい！」'},
        {level:3, text:'「…ねえ、もりってこわい？」'},
        {level:4, text:'「ぼく…まだこわくて\nむらのそとにでれないんだ…」'},
        {level:5, text:'「でもミプリンがかえってくると\nあんしんする！」'},
        {level:6, text:'「ミプリンのおとうさんって\nどんなひと？」'},
        {level:7, text:'「ぼくのおとうさんはね、\nはちみつづくりめいじんなの。」'},
        {level:8, text:'「いつかいっしょに\nぼうけんしようね！やくそく！」'},
        {level:9, text:'「ゆびきりげんまん！\nうそついたらはりせんぼん！」'},
        {level:10, text:'「…ミプリン、けがしてる…\nだいじょうぶ？」'}
      ]
    },
    pore: {
      name:'ポーレ', stages:[
        {level:0, text:'「あ、ミプリン。\n図書室にいたの。」'},
        {level:1, text:'「この本にね、\n古い蜂蜜の作り方が書いてあるの。」'},
        {level:2, text:'「黄金蜂蜜は\n記憶から生まれるんだって。」'},
        {level:3, text:'「記憶が傷つくと\n蜂蜜も濁るらしいわ。」'},
        {level:4, text:'「女王さまの図書室には\nもっとすごい本があったはず…」'},
        {level:5, text:'「闇胞子についての\n文献を見つけたの。」'},
        {level:6, text:'「闇胞子は恐怖を食べて\n増殖するんだって。」'},
        {level:7, text:'「でも…愛情には弱いって\n書いてあった。」'},
        {level:8, text:'「ミプリンのお母さんは\nこの図書室の常連だったのよ。」'},
        {level:9, text:'「ハナさんが最後に\n借りた本…まだここにあるの。」'},
        {level:10, text:'「…『花の言葉辞典』。\nまだ返却期限、過ぎてないわ。」'},
        {level:11, text:'「…10年前の本なのに。\nわたし、ずっと待ってた。」'}
      ]
    },
    navi: {
      name:'ナビィ', stages:[
        {level:0, text:'「おい、ガキ。\nこんなとこで何してる。」'},
        {level:1, text:'「…タイガの娘か。\n似てねえな。」'},
        {level:2, text:'「あいつはもっと\n無鉄砲だった。」'},
        {level:3, text:'「おれとタイガは\n幼馴染だったんだ。」'},
        {level:4, text:'「いつも競争してた。\n大体おれが負けたけどな。」'},
        {level:5, text:'「タイガが森に行く時\n「おれも行く」って言ったんだ。」'},
        {level:6, text:'「でもあいつ…\n「ビーを守ってくれ」って。」'},
        {level:7, text:'「…ビーじゃなくて\nおまえの事だったんだな。」'},
        {level:8, text:'「おれは…結局\n何も守れなかった。」'},
        {level:9, text:'「…おまえは行けよ。\nタイガの代わりに。」'},
        {level:10, text:'「おれはここで待ってる。\n…今度こそ。」'}
      ]
    },
    granpa: {
      name:'グランパ', stages:[
        {level:0, text:'「去れ。子供の来る場所ではない。」'},
        {level:1, text:'「…まだいるのか。」'},
        {level:2, text:'「…わしはかつて\n女王の騎士だった。」'},
        {level:3, text:'「この洞窟の奥には\n封印がある。」'},
        {level:4, text:'「女王さまが自ら\n施された封印だ。」'},
        {level:5, text:'「あの日…女王さまは\n微笑んでおられた。」'},
        {level:6, text:'「『みんなを守るから、\n心配しないで』と…」'},
        {level:7, text:'「わしは…泣いた。\n騎士のくせに。」'},
        {level:8, text:'「タイガとハナが来た時も\n止められなかった。」'},
        {level:9, text:'「二度目の後悔は\nもうしたくない。」'},
        {level:10, text:'「…だが、おまえは\nあの二人とは違う。」'},
        {level:11, text:'「あの二人の想いを\n全部背負っておる。」'},
        {level:12, text:'「…行け。わしが\n後ろは守る。」'}
      ]
    }
  };

  var _affinities = {};

  function init(){
    _affinities = {};
    for(var npcId in NPC_DIALOGUE_STAGES) _affinities[npcId] = 0;
  }

  function getAffinity(npcId){ return _affinities[npcId] || 0; }

  function addAffinity(npcId, amount){
    if(!NPC_DIALOGUE_STAGES[npcId]) return;
    var stages = NPC_DIALOGUE_STAGES[npcId].stages;
    var max = stages.length - 1;
    _affinities[npcId] = Math.min(max, Math.max(0, (_affinities[npcId]||0) + (amount||1)));
  }

  function getDialogue(npcId){
    var data = NPC_DIALOGUE_STAGES[npcId];
    if(!data) return {text:'「…」', level:0};
    var level = _affinities[npcId] || 0;
    var stage = null;
    for(var i = data.stages.length - 1; i >= 0; i--){
      if(data.stages[i].level <= level){ stage = data.stages[i]; break; }
    }
    if(!stage) stage = data.stages[0];
    return {text:stage.text, level:level, name:data.name, maxLevel:data.stages.length - 1};
  }

  function talkTo(npcId){
    var dialogue = getDialogue(npcId);
    addAffinity(npcId, 1);
    return dialogue;
  }

  function getNpcIds(){ return Object.keys(NPC_DIALOGUE_STAGES); }
  function getNpcCount(){ return Object.keys(NPC_DIALOGUE_STAGES).length; }
  function getTotalDialogueLines(){
    var count = 0;
    for(var id in NPC_DIALOGUE_STAGES) count += NPC_DIALOGUE_STAGES[id].stages.length;
    return count;
  }

  function getMaxAffinityLevel(npcId){
    var data = NPC_DIALOGUE_STAGES[npcId];
    if(!data) return 0;
    return data.stages.length - 1;
  }

  function serialize(){
    return {affinities: Object.assign({}, _affinities)};
  }
  function deserialize(data){
    if(!data || !data.affinities) return;
    for(var id in data.affinities){
      if(NPC_DIALOGUE_STAGES[id]) _affinities[id] = data.affinities[id];
    }
  }

  return {
    NPC_DIALOGUE_STAGES:NPC_DIALOGUE_STAGES,
    init:init, getAffinity:getAffinity, addAffinity:addAffinity,
    getDialogue:getDialogue, talkTo:talkTo,
    getNpcIds:getNpcIds, getNpcCount:getNpcCount,
    getTotalDialogueLines:getTotalDialogueLines,
    getMaxAffinityLevel:getMaxAffinityLevel,
    serialize:serialize, deserialize:deserialize
  };
})();
