// ===== js/tab_ui_base_v2.js =====
// Simplified shared notebook/tab UI.
// Removes duplicate I/O/P band and gives more space to page content.

function getTabUILayoutV2() {
  const isTouch = (typeof touchActive !== 'undefined' && touchActive);
  const _M = isTouch ? 2 : 1;

  const frame = {
    x: Math.round((CW - 1000) / 2),
    y: Math.round((CH - 700) / 2 + 20),
    w: 1000,
    h: 700,
  };

  const headerH = isTouch ? 86 : 74;
  const footerH = isTouch ? 34 : 28;
  const padX = isTouch ? 28 : 20;
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
      y: frame.y + padY + headerH + 8,
      w: frame.w - padX * 2,
      h: frame.h - padY * 2 - headerH - footerH - 8,
    },
    footer: {
      x: frame.x + padX,
      y: frame.y + frame.h - footerH - 6,
      w: frame.w - padX * 2,
      h: footerH,
    },
    helpButton: {
      x: frame.x + frame.w - 74,
      y: frame.y + 20,
      size: 34,
    },
  };
}

function drawTabBaseV2(selectedTab, footerText) {
  const ui = getTabUILayoutV2();
  const frame = ui.frame;
  const header = ui.header;
  const footer = ui.footer;
  const _M = ui._M;

  ctx.fillStyle = 'rgba(0,0,0,0.72)';
  ctx.fillRect(0, 0, CW, CH);

  if (typeof drawNotebookBase === 'function') {
    drawNotebookBase(ctx, frame.x, frame.y, frame.w, frame.h, '🌸 みぷりんの冒険手帳');
  }

  const tabs = ['持ち物', '図鑑', '装備'];
  const tabW = 170;
  const gap = 18;
  const startX = frame.x + frame.w / 2 - ((tabW * 3 + gap * 2) / 2);
  const tabY = header.y + 4;

  for (let i = 0; i < tabs.length; i++) {
    const x = startX + i * (tabW + gap);
    const active = selectedTab === i;

    ctx.save();
    ctx.fillStyle = active ? '#ffd700' : 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.roundRect(x, tabY, tabW, 40 * _M / (ui.isTouch ? 1.5 : 1), 12);
    ctx.fill();

    ctx.strokeStyle = active ? 'rgba(255,215,0,0.95)' : 'rgba(255,255,255,0.14)';
    ctx.lineWidth = active ? 2 : 1;
    ctx.beginPath();
    ctx.roundRect(x, tabY, tabW, 40 * _M / (ui.isTouch ? 1.5 : 1), 12);
    ctx.stroke();

    ctx.fillStyle = active ? '#000' : '#f2f2f2';
    ctx.font = `bold ${Math.max(18, 18 * _M / (ui.isTouch ? 1.5 : 1))}px 'M PLUS Rounded 1c', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tabs[i], x + tabW / 2, tabY + 20 * _M / (ui.isTouch ? 1.5 : 1));
    ctx.restore();
  }

  if (typeof touchActive === 'undefined' || !touchActive) {
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.font = "12px 'M PLUS Rounded 1c', sans-serif";
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('[ESC] とじる', header.x + header.w - 2, tabY + 20);
    ctx.restore();
  }

  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.56)';
  ctx.beginPath();
  ctx.roundRect(footer.x, footer.y, footer.w, footer.h, 10);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.70)';
  ctx.font = "13px 'M PLUS Rounded 1c', sans-serif";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(footerText || 'Tab UI Refactor Preview', footer.x + footer.w / 2, footer.y + footer.h / 2);
  ctx.restore();

  return ui;
}
