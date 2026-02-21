/**
 * tileEngine.js - フルカラースプライト描画エンジン
 * スプライトシートPNG + JSONからフレーム切出し・キャッシュ・HSLバリアント
 */
const TileEngine = (() => {
  const _sheets = {};       // name -> Image
  const _defs = {};         // spriteName -> { sheet, frameSize, frames[] }
  const _cache = {};        // "name_index" -> OffscreenCanvas
  const _variantCache = {}; // "name_index__variant" -> OffscreenCanvas

  async function loadSheets(sheetList, onProgress) {
    let loaded = 0;
    const total = sheetList.length;

    for (const s of sheetList) {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = s.src;
      });
      _sheets[s.name] = img;

      if (s.json) {
        const res = await fetch(s.json);
        const json = await res.json();
        for (const [key, def] of Object.entries(json)) {
          def._sheet = s.name;
          _defs[key] = def;
        }
      }

      loaded++;
      if (onProgress) onProgress(loaded, total);
    }
  }

  function init() {
    for (const [name, def] of Object.entries(_defs)) {
      const img = _sheets[def._sheet];
      if (!img) continue;
      const [fw, fh] = def.frameSize;

      for (let i = 0; i < def.frames.length; i++) {
        const f = def.frames[i];
        const key = `${name}_${i}`;
        const oc = new OffscreenCanvas(fw, fh);
        const ctx = oc.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, f.sx, f.sy, f.sw || fw, f.sh || fh, 0, 0, fw, fh);
        _cache[key] = oc;
      }
    }
  }

  function getFrame(name, index, variant) {
    if (variant) {
      const vKey = `${name}_${index}__${variant}`;
      if (_variantCache[vKey]) return _variantCache[vKey];

      const baseKey = `${name}_${index}`;
      const base = _cache[baseKey];
      if (!base) return null;

      const vDef = CONFIG.VARIANTS[variant];
      if (!vDef) return base;

      const oc = _applyVariant(base, vDef);
      _variantCache[vKey] = oc;
      return oc;
    }

    return _cache[`${name}_${index}`] || null;
  }

  function _applyVariant(source, vDef) {
    const w = source.width;
    const h = source.height;
    const oc = new OffscreenCanvas(w, h);
    const ctx = oc.getContext('2d');
    ctx.drawImage(source, 0, 0);
    const imageData = ctx.getImageData(0, 0, w, h);
    const d = imageData.data;

    if (vDef.mode === 'silhouette') {
      const [r, g, b] = _hexToRgb(vDef.color);
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] > 0) {
          d[i] = r; d[i + 1] = g; d[i + 2] = b;
        }
      }
    } else if (vDef.mode === 'tint') {
      const [tr, tg, tb] = _hexToRgb(vDef.color);
      const a = vDef.amount;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] > 0) {
          d[i]     = d[i]     + (tr - d[i]) * a;
          d[i + 1] = d[i + 1] + (tg - d[i + 1]) * a;
          d[i + 2] = d[i + 2] + (tb - d[i + 2]) * a;
        }
      }
    } else {
      // HSL shift
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] === 0) continue;
        let [hh, ss, ll] = _rgbToHsl(d[i], d[i + 1], d[i + 2]);
        hh = (hh + (vDef.hue || 0)) % 360;
        if (hh < 0) hh += 360;
        ss = Math.max(0, Math.min(100, ss + (vDef.sat || 0)));
        ll = Math.max(0, Math.min(100, ll + (vDef.lit || 0)));
        const [nr, ng, nb] = _hslToRgb(hh, ss, ll);
        d[i] = nr; d[i + 1] = ng; d[i + 2] = nb;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    return oc;
  }

  function _hexToRgb(hex) {
    const v = parseInt(hex.replace('#', ''), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }

  function _rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return [h * 360, s * 100, l * 100];
  }

  function _hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  function getDefFrameCount(name) {
    return _defs[name] ? _defs[name].frames.length : 0;
  }

  function clearVariantCache() {
    for (const k in _variantCache) delete _variantCache[k];
  }

  return { loadSheets, init, getFrame, getDefFrameCount, clearVariantCache };
})();
