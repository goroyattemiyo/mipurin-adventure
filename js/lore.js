// ===== LORE MODULE (Sprint H-C) =====
// WORLD_LORE と図鑑コンプリート判定
// data.js のサイズ超過を防ぐため分離

// 各エントリは minClears でアンロック。図鑑「せかい」タブに表示される。
const WORLD_LORE = [
  { id: 'wl_01', title: '花の国とクリスタル',
    icon: '💎', minClears: 0,
    text: '花の国は、かつて巨大なクリスタルの光で満たされていた。その光は花を育て、ミツバチに力を与え、すべての命をつないでいた。だが、ある嵐の夜、クリスタルは砕け散った。' },
  { id: 'wl_02', title: 'ミプリンの使命',
    icon: '🐝', minClears: 0,
    text: 'ミプリンは花の国に生まれた小さなミツバチ。クリスタルの欠片を集めれば、光を取り戻せると信じている。小さな体で、大きな夢を持って冒険に飛び出した。' },
  { id: 'wl_03', title: 'フローラのひみつ',
    icon: '🌸', minClears: 1,
    text: 'フローラは花の妖精。花壇を守りながらミプリンを支える。実は彼女自身もクリスタルの欠片を探していた過去がある。その瞳が時折遠くを見つめるのは、なくした誰かのためかもしれない。' },
  { id: 'wl_04', title: 'ダークビーの真実',
    icon: '🖤', minClears: 1,
    text: '闇の胞子に染まったミツバチたちは、かつてミプリンの仲間だった。クリスタルが砕けた夜に行方不明になり、やがて闇に飲まれた。でも、ミプリンが光を取り戻せば——もしかしたら。' },
  { id: 'wl_05', title: '女王さまのいた場所',
    icon: '👑', minClears: 2,
    text: '花の国の深奥に「女王の間」があった。女王はクリスタルの守護者であり、すべての花と虫の母だった。彼女が最後に残した言葉は「光を信じる者に、光は宿る」という古い詩の一節だという。' },
  { id: 'wl_06', title: '封印された記憶',
    icon: '🗝️', minClears: 2,
    text: '宝箱の中には、時々古い記憶の欠片が入っている。それはクリスタルが光っていた頃の情景。花が歌い、蝶が踊り、すべての命が同じ光のもとに集まっていた——そんな世界の断片。' },
  { id: 'wl_07', title: '胞子の森の起源',
    icon: '🍄', minClears: 3,
    text: 'キノコの王が支配する地底の森は、元は花の国の苗床だった。クリスタルが砕けた時、光の届かなくなった地下に異変が起き、菌糸が花の根を喰い始めた。王はその変化を止められなかった最後の守り手だ。' },
  { id: 'wl_08', title: 'クリスタルの欠片と祝福',
    icon: '✨', minClears: 3,
    text: '冒険中に授かる「祝福」は、クリスタルの光の残滓が形を変えたもの。ミプリンが欠片を集めるたびに、その力は少しずつ本来の輝きを取り戻していく。祝福を重ねるほど、クリスタルは近くなる。' },
  { id: 'wl_09', title: '蛾と星',
    icon: '🦋', minClears: 4,
    text: '闇の蛾は夜空の星の言葉を話せるという伝説がある。彼女が翼を広げると、古代語の紋様が光る。その意味は「希望」——クリスタルが砕ける前から持ち続けた、たったひとつの言葉だ。' },
  { id: 'wl_10', title: '解放の予言',
    icon: '🌟', minClears: 5,
    text: '古い詩の断片にこんな一節がある。「すべての影を見た者が、光の名を呼ぶとき、砕けたものは再び一つになる」——図鑑をすべて埋めたあなたは、もうその言葉の意味を知っているはずだ。' },
];

// H-C: 図鑑コンプリート判定
// 全12種の通常敵（ENEMY_DEFS）を loopCount==0 で少なくとも1回撃破している場合 true
// 隠しエンディング条件: isEncyclopediaComplete() && loopCount >= 1
function isEncyclopediaComplete() {
  if (typeof collection === 'undefined' || typeof ENEMY_DEFS === 'undefined') return false;
  const allKeys = Object.keys(ENEMY_DEFS);
  for (const k of allKeys) {
    const def = ENEMY_DEFS[k];
    const name = def.name;
    // ループ0周目（_L0）のレコードで判定
    const rec = collection[name + '_L0'] || collection[name];
    if (!rec || rec.defeated < 1) return false;
  }
  return true;
}
