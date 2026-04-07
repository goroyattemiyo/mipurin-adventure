// ===== js/tab_ui_base.js =====
// Shared layout foundation for notebook/tab UI.
// Goal: unify header/content/footer safe areas so each page only draws inside content.

function getTabUIFrame() {
  const isTouch = (typeof touchActive !== 'undefined' && touchActive);
  const _M = isTouch ? 2 : 1;

  const frame = {
    x: Math.round((CW - 1000) / 2),
    y: Math.round((CH - 700) / 2 + 20),
    w: 1000,
    h: 700,
  };

  return { frame, isTouch, _M };
}

function getTabUILayout() {
  const base = getTabUIFrame();
  const frame = base.frame;
  const isTouch = base.isTouch;
  const _M = base._M;

  const headerH = isTouch ? 126 : 112;
  const footerH = isTouch ? 42 : 32;
  const padX = isTouch ? 26 : 20;
  const padY = isTouch ? 18 : 14;

  return {
    frame,
    isTouch,
    _M,
    header: {
      x: frame.x + padX,
      y: frame.y + padY,
      w: frame.w - padX * 2,
      h: headerH,
    },
    content: {
      x: frame.x + padX,
      y: frame.y + padY + headerH + 6,
      w: frame.w - padX * 2,
      h: frame.h - padY * 2 - headerH - footerH - 6,
    },
    footer: {
      x: frame.x + padX,
      y: frame.y + frame.h - footerH - 8,
      w: frame.w - padX * 2,
      h: footerH,
    },
    helpButton: {
      x: frame.x + frame.w - 74,
      y: frame.y + 22,
      size: 34,
    },
  };
}

function tabInsetRect(r, pad) {
  return {
    x: r.x + pad,
    y: r.y + pad,
    w: r.w - pad * 2,
    h: r.h - pad * 2,
  };
}

function tabSplitColumns(r, leftRatio, gap) {
  const leftW = Math.floor((r.w - gap) * leftRatio);
  const rightW = r.w - gap - leftW;
  return {
    left: { x: r.x, y: r.y, w: leftW, h: r.h },
    right: { x: r.x + leftW + gap, y: r.y, w: rightW, h: r.h },
  };
}

function tabStackRows(r, heights, gap) {
  const out = [];
  let cy = r.y;
  for (let i = 0; i < heights.length; i++) {
    out.push({ x: r.x, y: cy, w: r.w, h: heights[i] });
    cy += heights[i] + gap;
  }
  return out;
}

function drawTabPanel(rect, title, opts) {
  opts = opts || {};
  const bg = opts.bg || 'rgba(239,228,210,0.97)';
  const stroke = opts.stroke || '#4e342e';
  const titleColor = opts.titleColor || '#2b211b';
  const radius = opts.radius || 12;
  const titleSize = opts.titleSize || 18;

  ctx.save();
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.w, rect.h, radius);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.beginPath();
  ctx.roundRect(rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4, Math.max(4, radius - 2));
  ctx.fill();

  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.w, rect.h, radius);
  ctx.stroke();

  if (title) {
    ctx.fillStyle = titleColor;
    ctx.font = `bold ${titleSize}px 'M PLUS Rounded 1c', sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(title, rect.x + 14, rect.y + 10);

    ctx.strokeStyle = 'rgba(78,52,46,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rect.x + 14, rect.y + 34);
    ctx.lineTo(rect.x + rect.w - 14, rect.y + 34);
    ctx.stroke();
  }
  ctx.restore();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

function drawTabBase(selectedTab) {
  const ui = getTabUILayout();
  const frame = ui.frame;
  const header = ui.header;
  const footer = ui.footer;
  const _M = ui._M;

  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, CW, CH);

  if (typeof drawNotebookBase === 'function') {
    drawNotebookBase(ctx, frame.x, frame.y, frame.w, frame.h, '🌸 みぷりんの冒険手帳');
  }

  const tabs = ['持ち物', '図鑑', '装備'];
  for (let i = 0; i < tabs.length; i++) {
    const tx = frame.x + frame.w / 2 - 240 + i * 240;
    const ty = header.y + 28;
    ctx.fillStyle = selectedTab === i ? '#ffd700' : 'rgba(255,255,255,0.3)';
    ctx.fillRect(tx - 80, ty - 20 * _M, 160, 40 * _M);
    ctx.fillStyle = selectedTab === i ? '#000' : '#fff';
    ctx.font = `bold ${20 * _M}px 'M PLUS Rounded 1c', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(tabs[i], tx, ty + 7 * _M);
  }

  if (typeof touchActive === 'undefined' || !touchActive) {
    const labels = [['I', '持ち物'], ['O', '図鑑'], ['P', '装備']];
    const y = header.y + 62;
    const w = 176;
    const gap = 6;
    const sx = frame.x + frame.w / 2 - (w * 3 + gap * 2) / 2;
    for (let i = 0; i < labels.length; i++) {
      const active = selectedTab === i;
      const x = sx + i * (w + gap);
      ctx.fillStyle = active ? 'rgba(255,215,0,0.18)' : 'rgba(255,255,255,0.05)';
      ctx.beginPath();
      ctx.roundRect(x, y - 13, w, 24, 5);
      ctx.fill();
      ctx.strokeStyle = active ? '#ffd700' : 'rgba(255,255,255,0.12)';
      ctx.lineWidth = active ? 1.5 : 1;
      ctx.beginPath();
      ctx.roundRect(x, y - 13, w, 24, 5);
      ctx.stroke();

      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.beginPath();
      ctx.roundRect(x + 6, y - 9, 22, 16, 3);
      ctx.fill();
      ctx.strokeStyle = active ? 'rgba(255,215,0,0.6)' : 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = active ? '#ffd700' : '#aaa';
      ctx.font = "bold 11px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText(labels[i][0], x + 17, y + 2);

      ctx.fillStyle = active ? '#fff' : '#888';
      ctx.font = `${active ? 'bold ' : ''}13px 'M PLUS Rounded 1c', sans-serif`;
      ctx.fillText(labels[i][1], x + w / 2 + 6, y + 2);
    }

    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.font = "12px 'M PLUS Rounded 1c', sans-serif";
    ctx.textAlign = 'right';
    ctx.fillText('[ESC] とじる', frame.x + frame.w - 38, y + 2);
  }

  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(footer.x, footer.y, footer.w, footer.h);
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.62)';
  ctx.font = "13px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('Tab UI base active: page content should render inside content rect only', footer.x + footer.w / 2, footer.y + 18);
  ctx.textAlign = 'left';

  return ui;
}
