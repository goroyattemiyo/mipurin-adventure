/**
 * npc.js - NPC対話・フラグ管理・エンディング分岐・イベント制御
 * ミプリンの冒険 v0.5.0
 */
const NpcManager = (() => {

  /* ============ NPC定義 ============ */
  const NPC_DEFS = {
    hatch: {
      id:'hatch', name:'長老ハッチ', area:'village',
      symbol:'👴', color:'#D4A03C',
      role:'quest_giver'
    },
    miel: {
      id:'miel', name:'占い師ミエル', area:'village',
      symbol:'🔮', color:'#9B59B6',
      role:'hint'
    },
    marche: {
      id:'marche', name:'商人マルシェ', area:'village',
      symbol:'🎒', color:'#E67E22',
      role:'shop'
    },
    bee: {
      id:'bee', name:'ビー', area:'village',
      symbol:'🐝', color:'#F1C40F',
      role:'flavor'
    },
    pore: {
      id:'pore', name:'ポーレ', area:'village',
      symbol:'📖', color:'#AED6F1',
      role:'flavor'
    },
    navi: {
      id:'navi', name:'ナビィ', area:'forest_south',
      symbol:'🧭', color:'#27AE60',
      role:'guide'
    },
    granpa: {
      id:'granpa', name:'グランパ', area:'cave',
      symbol:'⚔', color:'#7F8C8D',
      role:'gatekeeper'
    }
  };

  /* ============ killCount 帯域判定 ============ */
  function _killBand(flags) {
    const k = flags.killCount || 0;
    if (k === 0) return 'zero';
    if (k <= 5) return 'low';
    if (k <= 15) return 'mid';
    return 'high';
  }

  /* ============ 針の一撃 帯域判定 ============ */
  function _needleBand(flags) {
    const n = flags.needleUseCount || 0;
    if (n === 0) return 'zero';
    if (n < 3) return 'low';
    return 'high';
  }

  /* ============ メイン会話取得 ============ */
  function getTalk(npcId, flags, inventory) {
    const band = _killBand(flags);
    const needleBand = _needleBand(flags);

    switch (npcId) {

      /* -------- 長老ハッチ -------- */
      case 'hatch':
        // 終盤帰還: 全かけら所持時
        if (flags.piece_a && flags.piece_b && flags.piece_c && !flags.queen_truth) {
          flags.queen_truth = true;
          return { lines: _hatchConfession(band), event: 'hatch_confession' };
        }
        // 初回: クエスト開始
        if (!flags.quest_started) {
          flags.quest_started = true;
          return { lines: Lang.t('npc_hatch_first'), event: 'quest_start' };
        }
        // killCount 依存
        switch (band) {
          case 'zero': return { lines: Lang.t('npc_hatch_pacifist') };
          case 'low':  return { lines: Lang.t('npc_hatch_normal') };
          case 'mid':  return { lines: _hatchMid(flags) };
          case 'high': return { lines: Lang.t('npc_hatch_violent') };
        }
        break;

      /* -------- 占い師ミエル -------- */
      case 'miel':
        // 終盤帰還イベント（エンディングB/C後）
        if (flags.ending_b_seen || flags.ending_c_seen) {
          if (!flags.miel_reveal) {
            flags.miel_reveal = true;
            return { lines: _mielReveal(), event: 'miel_reveal' };
          }
        }
        // 中盤イベント: かけらA所持
        if (flags.piece_a && !flags.miel_vision) {
          flags.miel_vision = true;
          return { lines: _mielVision(), event: 'miel_vision' };
        }
        // 針の一撃依存
        switch (needleBand) {
          case 'zero': return { lines: Lang.t('npc_miel_normal') };
          case 'low':  return { lines: Lang.t('npc_miel_hint') };
          case 'high': return { lines: Lang.t('npc_miel_worried') };
        }
        break;

      /* -------- 商人マルシェ -------- */
      case 'marche':
        // 特殊イベント: かけらB所持後帰還
        if (flags.piece_b && !flags.marche_event) {
          flags.marche_event = true;
          if (typeof Inventory !== 'undefined') Inventory.addItem('hana_pot');
          return { lines: _marcheEvent(), event: 'marche_hana_pot' };
        }
        // killCount 依存
        if (band === 'high') return { lines: Lang.t('npc_marche_closed') || '「...ごめん。今日は店閉めるわ」' };
        return { lines: Lang.t('npc_marche'), event: 'open_shop' };

      /* -------- ビー -------- */
      case 'bee':
        // killCount高: 非表示（花壇の裏に隠れる）
        if (band === 'high') {
          return { lines: '（ビーのマフラーが地面に落ちている…）', event: 'bee_hidden' };
        }
        if (band === 'mid') return { lines: _beeMid() };
        // 帰還イベント
        if (flags.ending_b_seen || flags.ending_c_seen) {
          return { lines: _beeEndBC() };
        }
        if (flags.ending_a_seen) {
          return { lines: _beeEndA() };
        }
        // 出発前
        if (!flags.quest_started) {
          return { lines: Lang.t('npc_bee') };
        }
        // 通常
        switch (band) {
          case 'zero': return { lines: '「ミプリンかっこいい！\nぼくもがんばる！」' };
          case 'low':  return { lines: '「ミプリン…怪我してない？」' };
          default:     return { lines: Lang.t('npc_bee') };
        }

      /* -------- ポーレ -------- */
      case 'pore':
        // 中盤イベント: かけらA所持後帰還
        if (flags.piece_a && !flags.pore_honey_rule) {
          flags.pore_honey_rule = true;
          flags.honey_rule_known = true;
          return { lines: _poreHoneyRule(), event: 'honey_rule_reveal' };
        }
        // killCount 依存
        switch (band) {
          case 'zero': return { lines: Lang.t('npc_pore_normal') };
          case 'low':  return { lines: '「戦闘データが増えてる。\n…気をつけてね」' };
          case 'mid':  return { lines: '「…ミプリン、文献にね…」\n「"蜜が濁る時、最初に忘れるのは\n笑い方"って…」' };
          case 'high': return { lines: '（ポーレは無言で本を閉じた。\n目を合わせてくれない。）' };
        }
        break;

      /* -------- ナビィ（南の森） -------- */
      case 'navi':
        // green_key取得後イベント
        if (flags.has_green_key && !flags.navi_father_event) {
          flags.navi_father_event = true;
          flags.father_truth = true;
          return { lines: _naviGreenKey(), event: 'navi_father_reveal' };
        }
        // 初回
        if (!flags.stump_hint) {
          flags.stump_hint = true;
          return { lines: Lang.t('npc_navi_first') };
        }
        // 帰還（END B/C）
        if (flags.ending_b_seen || flags.ending_c_seen) {
          return { lines: '「タイガ…おまえの娘、やったぞ」\n（ナビィは空を見上げた）' };
        }
        return { lines: Lang.t('npc_navi_repeat') };

      /* -------- グランパ（洞窟） -------- */
      case 'granpa':
        // 初回会話（長い会話チェーン）
        if (!flags.granpa_met) {
          flags.granpa_met = true;
          return { lines: _granpaFirstMeet(), event: 'granpa_first', chain: _granpaChain() };
        }
        // 封印壁ヒント
        if (!flags.seal_hint) {
          flags.seal_hint = true;
          return { lines: _granpaSealHint() };
        }
        // 女王の真相
        if (!flags.queen_truth_granpa) {
          flags.queen_truth_granpa = true;
          return { lines: _granpaQueenTruth(), event: 'queen_truth_reveal' };
        }
        return { lines: '「…気をつけて行け」' };

      /* -------- デフォルト -------- */
      default:
        return { lines: '「…」' };
    }
  }

  /* ============ NPC表示可否 ============ */
  function isVisible(npcId, flags) {
    const band = _killBand(flags);
    // killCount高でビーは非表示
    if (npcId === 'bee' && band === 'high') return false;
    // killCount高でマルシェは店を閉める（表示はするが台詞変化）
    return true;
  }

  /* ============ 長文イベントテキスト生成 ============ */

  function _hatchMid(flags) {
    if (!flags._hatch_mid_said) {
      flags._hatch_mid_said = true;
      return '「…おまえさんの両親も…\nこうだったのかもしれん」';
    }
    return Lang.t('npc_hatch_normal');
  }

  function _hatchConfession(band) {
    if (band === 'zero' || band === 'low') {
      return '「…ミプリン。すまなかった。\n全部話す。」\n\n「10年前…女王さまは自分から\n闇胞子を吸い込んだんじゃ。」\n\n「王国を守るために…たったひとりで。」\n\n「わしは…止められなかった。\nそれがわしの最大の後悔じゃ。」\n\n「おまえの父と母を森に送り出したのも\nわしの判断じゃった…」\n\n「すまない…本当にすまない…」';
    }
    return '「…………」\n（ハッチは何かを言おうとしたが、\n言葉が出てこないようだ。）';
  }

  function _mielVision() {
    return '「ミプリンちゃん…少し見えたわ。」\n\n「女王さまが最後に見せてくれた景色…」\n\n「花畑の奥に、光が…」\n\n「でもその光の中に、\nとても深い闇も見えるの。」\n\n「気をつけてね。」';
  }

  function _mielReveal() {
    return '「ミプリンちゃん…\nわたし、やっと言えるわ。」\n\n「あなたのお母さんはね、\nとても勇敢な蜂だった。」\n\n「お父さんと一緒に、\n女王さまを追って森に入ったの。」\n\n「…見つけられなかったけど」\n\n「あなたが見つけたのね。」';
  }

  function _marcheEvent() {
    return '「…ミプリン、ちょっとこっち来な。」\n\n「あたしね、昔お母さんと\n一緒に冒険してたの。」\n\n「信じらんないでしょ。\nあたしもう走れないけどさ。」\n\n「はい、これ。」\n\n【ハナの蜂蜜ポット を手に入れた！】\n\n「お母さんが使ってたやつ。\nずっと預かってた。」\n\n「…あんたの蜂蜜ポットと\n並べて持ってきな。」\n\n「二つ一緒なら、きっと強いから。」\n\n「はいはい、泣くんじゃないの！\nほら飴あげる！」';
  }

  function _beeMid() {
    return '「ミプリン…なんか怖い…」\n（ビーはマフラーを握りしめて\n後ずさった）';
  }

  function _beeEndBC() {
    return '「ミプリン！！」\n（ビーが泣きながら抱きついてきた）\n\n「ぼくもいつか…\nぼくも冒険する！」';
  }

  function _beeEndA() {
    return '「ミプリン…泣いてるの？」\n\n「ぼく…ぼくが泣いちゃダメだよね」\n（ミプリンの代わりに泣いている）';
  }

  function _poreHoneyRule() {
    return '「ミプリン、ひとつ聞いていい？」\n\n「黄金蜂蜜が記憶から生まれるって、\n知ってた？」\n\n「古い文献に書いてあったの。」\n\n「もし記憶が傷ついたら、\n蜂蜜も…」\n\n「気をつけて。\nあなたの記憶、濁らせないで。」';
  }

  function _naviGreenKey() {
    return '「…その鍵、どこで見つけた。」\n\n「…あの切株はな」\n\n「おまえの親父が、\n最後に座ってた場所だ。」\n\n「あいつ、そこに鍵を隠して、\nおれに言ったんだ。」\n\n「"いつかミプリンが来たら、\n渡してやってくれ"って。」\n\n「……10年かかっちまったな。」';
  }

  function _granpaFirstMeet() {
    return '「去れ。子供の来る場所ではない。」';
  }

  function _granpaChain() {
    return [
      '「でも、かけらが…！」',
      '「知らん。去れ。」',
      '「…お願いします。\nわたし、女王さまを探してるの。」',
      '「！…」\n\n「…名前は。」',
      '「ミプリン！\nハニーヴィル村のミプリン！」',
      '「…タイガとハナの娘か。」',
      '「お父さんとお母さんを知ってるの！？」',
      '「…ふたりとも、ここに来た。」\n「10年前に。」\n「女王さまを探して、\nこの先に進んで行った。」\n\n「…戻っては来なかった。」',
      '「……」',
      '「…おまえも行くのか。」',
      '「…行く。行かなきゃ。」',
      '「…そうか。」\n\n「なら教えてやる。\nこの先に封印された壁がある。」'
    ];
  }

  function _granpaSealHint() {
    return '「封印壁は緑の鍵で開く。」\n「その奥にロイヤルゼリーがある。\n回復に使え。」';
  }

  function _granpaQueenTruth() {
    return '「…聞いてやる。」\n\n「女王さまは…\n自分から闇に飛び込んだ。」\n\n「王国を守るために。」\n\n「わしは…止められなかった。」\n\n「止めるべきだった。\nあの方ひとりに\n背負わせるべきでは…」';
  }

  /* ============ エンディング分岐判定 ============ */
  function getEndingType(flags, lastAction) {
    // END C: killCount 0 でボス到達
    if (flags.killCount === 0) return 'ending_c';
    // END A: 針の一撃でトドメ
    if (lastAction === 'needle_finish') return 'ending_a';
    // END B: それ以外（待つ選択）
    return 'ending_b';
  }

  /* ============ ボス戦台詞 ============ */
  function getBossLine(phase, hpRatio) {
    const lines = {
      dark_voice: [
        '「近ヅクナ…全テ、飲ミ込ム…」',
        '「コノ闇ハ…誰ニモ渡サナイ…」',
        '「モウ…遅イ…」'
      ],
      leila_voice: [
        '「…ミプリン…逃げて…」',
        '「…わたしが…わたしが止めなきゃ…」',
        '「…あの子が来てくれた…\nタイガとハナの…」'
      ]
    };
    if (hpRatio > 0.7)  return lines.dark_voice[0];
    if (hpRatio > 0.4)  return lines.leila_voice[0];
    if (hpRatio > 0.2)  return lines.dark_voice[1];
    if (hpRatio > 0.1)  return lines.leila_voice[1];
    return lines.leila_voice[2];
  }

  /* ============ killCount 世界演出パラメータ ============ */
  function getWorldEffects(flags) {
    const k = flags.killCount || 0;
    const t = Balance.KILL_THRESHOLDS;
    return {
      saturationShift: k >= t.SATURATION_START ? -Math.min(50, k * 2) : 0,
      bgmLowpass: k >= t.BGM_LOWPASS_START
        ? Math.max(500, 2000 - ((k - t.BGM_LOWPASS_START) / (t.BGM_LOWPASS_MAX - t.BGM_LOWPASS_START)) * 1500)
        : 2000,
      droneVolume: k >= t.DRONE_START ? Math.min(0.3, (k - t.DRONE_START) * 0.02) : 0,
      worldGrey: k >= t.WORLD_GREY
    };
  }

  /* ============ 針の一撃 ペナルティ取得 ============ */
  function getNeedlePenalty(flags) {
    return [];
  }

  return {
    NPC_DEFS, getTalk, isVisible,
    getEndingType, getBossLine,
    getWorldEffects, getNeedlePenalty,
    _killBand // テスト用
  };
})();
