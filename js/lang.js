/**
 * lang.js - 多言語テキスト管理
 */
const Lang = (() => {
  let _data = {};

  async function load(langCode) {
    try {
      const res = await fetch(`lang/${langCode}.json`);
      _data = await res.json();
    } catch (e) {
      console.warn(`lang/${langCode}.json 読込失敗`);
      _data = {};
    }
  }

  function t(key, replacements) {
    let text = _data[key] || key;
    if (replacements) {
      for (const [k, v] of Object.entries(replacements)) {
        text = text.replace(`{${k}}`, v);
      }
    }
    return text;
  }

  return { load, t };
})();
