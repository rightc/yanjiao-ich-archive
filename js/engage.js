/**
 * 互动增强：点蓝、烧蓝、工序拼图、识物、护照印章、情景题、国礼透视、路线、金句、上墙、放大镜
 */
(function () {
  "use strict";

  const STAMP_KEY = "yanjiao-ich-stamps-v1";

  function cfg() {
    return window.PROJECT_CONFIG || {};
  }

  function engage() {
    return (cfg().engage) || {};
  }

  function toast(text) {
    if (typeof window.showToast === "function") {
      window.showToast(text);
      return;
    }
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = text;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 2200);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ===== 护照印章 ===== */
  function readStamps() {
    try {
      const raw = localStorage.getItem(STAMP_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      /* ignore */
    }
    return {};
  }

  function writeStamps(map) {
    localStorage.setItem(STAMP_KEY, JSON.stringify(map));
  }

  function stampDefs() {
    return engage().stamps || [];
  }

  function renderStamps() {
    const grid = document.getElementById("stampGrid");
    const countEl = document.getElementById("stampCount");
    const hint = document.getElementById("stampHint");
    const earned = readStamps();
    const defs = stampDefs();
    const got = defs.filter((s) => earned[s.id]).length;

    if (countEl) countEl.textContent = `${got}/${defs.length || 10}`;
    if (hint) {
      hint.textContent =
        got >= defs.length && defs.length > 0
          ? "印鉴俱全！可生成景泰蓝研学护照纪念页。"
          : "完成对应行为即可盖章（本机保存）。";
    }
    if (!grid) return;

    grid.innerHTML = defs
      .map((s) => {
        const on = !!earned[s.id];
        return `<button type="button" class="stamp-seal${on ? " earned" : ""}" data-stamp="${escapeHtml(s.id)}" aria-pressed="${on}" title="${escapeHtml(s.label)}"><span class="stamp-label">${escapeHtml(s.label)}</span></button>`;
      })
      .join("");
  }

  function earnStamp(id, opts) {
    const silent = opts && opts.silent;
    const defs = stampDefs();
    if (!defs.some((s) => s.id === id)) return false;
    const earned = readStamps();
    if (earned[id]) return false;
    earned[id] = Date.now();
    writeStamps(earned);
    renderStamps();
    const label = (defs.find((s) => s.id === id) || {}).label || id;
    if (!silent) toast(`盖章：${label}`);
    document.dispatchEvent(new CustomEvent("stamp:earned", { detail: { id, label } }));
    return true;
  }

  window.earnStamp = earnStamp;
  window.getEarnedStamps = readStamps;

  function initPassport() {
    renderStamps();
    const resetBtn = document.getElementById("resetStamps");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (!window.confirm("确定清空本机全部护照印章？")) return;
        localStorage.removeItem(STAMP_KEY);
        renderStamps();
        toast("印章已重置");
      });
    }

    const makeBtn = document.getElementById("makePassport");
    const modal = document.getElementById("passportModal");
    const downloadBtn = document.getElementById("downloadPassport");
    if (makeBtn && modal) {
      makeBtn.addEventListener("click", async () => {
        modal.hidden = false;
        document.body.style.overflow = "hidden";
        toast("正在钤印 · 生成景泰蓝研学护照…");
        await drawPassportPoster();
      });
    }
    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => {
        const canvas = document.getElementById("passportCanvas");
        if (!canvas) return;
        const link = document.createElement("a");
        link.download = "jingtailan-passport.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
        toast("护照纪念页已珍藏下载");
      });
    }

    // 区块可见即盖「缘起」；进入工序区盖「工序」
    observeOnce("#intro", () => earnStamp("intro"));
    observeOnce("#cloisonne", () => earnStamp("process"));
  }

  function observeOnce(selector, fn) {
    const el = document.querySelector(selector);
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      fn();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          fn();
          io.disconnect();
        });
      },
      { threshold: 0.35 }
    );
    io.observe(el);
  }

  const FONT_SERIF = '"Songti SC","Noto Serif SC","STSong","SimSun",serif';
  const FONT_SANS = '"Microsoft YaHei","PingFang SC","Noto Sans SC","Segoe UI",sans-serif';

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function passGlow(ctx, x, y, r, color) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  /* 烧蓝釉面星点（金箔感，少量定点，避免密集循环） */
  function passGoldFoilDots(ctx, w, h) {
    const dots = [
      [120, 160, 1.4], [260, 110, 1.1], [480, 90, 1.6], [720, 140, 1.2],
      [940, 180, 1.5], [160, 420, 1.0], [380, 360, 1.3], [640, 400, 1.1],
      [860, 340, 1.4], [200, 680, 1.2], [520, 640, 1.0], [780, 700, 1.3],
      [140, 960, 1.1], [420, 920, 1.5], [680, 980, 1.2], [920, 900, 1.0],
      [240, 1180, 1.3], [560, 1220, 1.1], [820, 1160, 1.4], [980, 1280, 1.2],
      [90, 560, 0.9], [1000, 560, 0.9], [540, 180, 1.0], [300, 1320, 1.1],
      [760, 1320, 1.0], [450, 500, 0.8], [900, 780, 1.0], [180, 1100, 0.9],
      [620, 240, 1.2], [340, 800, 1.0], [860, 1080, 1.1], [100, 300, 0.8]
    ];
    for (let i = 0; i < dots.length; i++) {
      const [dx, dy, dr] = dots[i];
      if (dx > w || dy > h) continue;
      const g = ctx.createRadialGradient(dx, dy, 0, dx, dy, dr * 2.2);
      g.addColorStop(0, "rgba(253,230,138,0.55)");
      g.addColorStop(0.45, "rgba(212,175,55,0.28)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(dx, dy, dr * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function passGoldLine(ctx, x, y, width) {
    const g = ctx.createLinearGradient(x, y, x + width, y);
    g.addColorStop(0, "rgba(212,175,55,0)");
    g.addColorStop(0.12, "rgba(253,230,138,0.75)");
    g.addColorStop(0.5, "rgba(212,175,55,1)");
    g.addColorStop(0.88, "rgba(253,230,138,0.75)");
    g.addColorStop(1, "rgba(212,175,55,0)");
    ctx.strokeStyle = g;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.stroke();
    /* 中点菱花小饰 */
    const mx = x + width / 2;
    ctx.beginPath();
    ctx.moveTo(mx, y - 5);
    ctx.lineTo(mx + 5, y);
    ctx.lineTo(mx, y + 5);
    ctx.lineTo(mx - 5, y);
    ctx.closePath();
    ctx.fillStyle = "rgba(253,230,138,0.85)";
    ctx.fill();
    ctx.strokeStyle = "rgba(212,175,55,0.7)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  /* 边框中段如意头 / 小花饰 */
  function passMidMotif(ctx, x, y, kind) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = "rgba(212,175,55,0.8)";
    ctx.fillStyle = "rgba(253,230,138,0.2)";
    ctx.lineWidth = 1.6;
    if (kind === "h") {
      ctx.beginPath();
      ctx.moveTo(-18, 0);
      ctx.quadraticCurveTo(-8, -10, 0, -6);
      ctx.quadraticCurveTo(8, -10, 18, 0);
      ctx.quadraticCurveTo(8, 10, 0, 6);
      ctx.quadraticCurveTo(-8, 10, -18, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(56,189,248,0.45)";
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.quadraticCurveTo(-10, -8, -6, 0);
      ctx.quadraticCurveTo(-10, 8, 0, 18);
      ctx.quadraticCurveTo(10, 8, 6, 0);
      ctx.quadraticCurveTo(10, -8, 0, -18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(56,189,248,0.45)";
      ctx.stroke();
    }
    ctx.restore();
  }

  /* 四角对称云纹 / 卷草（掐丝感） */
  function passCornerOrnament(ctx, x, y, sx, sy, size) {
    const s = size || 42;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sx, sy);
    /* 外层如意云 */
    ctx.strokeStyle = "rgba(212,175,55,0.9)";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(0, s);
    ctx.quadraticCurveTo(0, 0, s, 0);
    ctx.stroke();
    ctx.strokeStyle = "rgba(253,230,138,0.62)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(8, s - 4);
    ctx.quadraticCurveTo(8, 8, s - 4, 8);
    ctx.stroke();
    /* 内层卷草 */
    ctx.beginPath();
    ctx.moveTo(14, s * 0.72);
    ctx.quadraticCurveTo(14, 18, s * 0.55, 16);
    ctx.quadraticCurveTo(28, 22, 22, 32);
    ctx.strokeStyle = "rgba(212,175,55,0.55)";
    ctx.lineWidth = 1.3;
    ctx.stroke();
    /* 云头圆 */
    ctx.beginPath();
    ctx.arc(18, 18, 5, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(212,175,55,0.75)";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(18, 18, 2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(56,189,248,0.35)";
    ctx.fill();
    /* 回纹短折 */
    ctx.beginPath();
    ctx.moveTo(0, s * 0.58);
    ctx.lineTo(s * 0.24, s * 0.58);
    ctx.lineTo(s * 0.24, s * 0.34);
    ctx.lineTo(s * 0.12, s * 0.34);
    ctx.strokeStyle = "rgba(147,197,253,0.4)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }

  /* 多层镀金掐丝边框：外粗金 + 内细金 + 点蓝细线 */
  function passOrnateFrame(ctx, x, y, fw, fh) {
    ctx.strokeStyle = "rgba(212,175,55,0.82)";
    ctx.lineWidth = 5;
    roundRect(ctx, x, y, fw, fh, 30);
    ctx.stroke();
    ctx.strokeStyle = "rgba(253,230,138,0.42)";
    ctx.lineWidth = 1.8;
    roundRect(ctx, x + 9, y + 9, fw - 18, fh - 18, 24);
    ctx.stroke();
    ctx.strokeStyle = "rgba(212,175,55,0.35)";
    ctx.lineWidth = 1.2;
    roundRect(ctx, x + 18, y + 18, fw - 36, fh - 36, 20);
    ctx.stroke();
    ctx.strokeStyle = "rgba(56,189,248,0.22)";
    ctx.lineWidth = 1;
    roundRect(ctx, x + 26, y + 26, fw - 52, fh - 52, 16);
    ctx.stroke();

    const cs = 48;
    passCornerOrnament(ctx, x + 34, y + 34, 1, 1, cs);
    passCornerOrnament(ctx, x + fw - 34, y + 34, -1, 1, cs);
    passCornerOrnament(ctx, x + 34, y + fh - 34, 1, -1, cs);
    passCornerOrnament(ctx, x + fw - 34, y + fh - 34, -1, -1, cs);

    passMidMotif(ctx, x + fw / 2, y + 8, "h");
    passMidMotif(ctx, x + fw / 2, y + fh - 8, "h");
    passMidMotif(ctx, x + 8, y + fh / 2, "v");
    passMidMotif(ctx, x + fw - 8, y + fh / 2, "v");
  }

  /* 细密掐丝网格（点蓝隔丝感） */
  function passFiligreeGrid(ctx, x, y, gw, gh, step) {
    ctx.save();
    ctx.beginPath();
    roundRect(ctx, x, y, gw, gh, 18);
    ctx.clip();
    ctx.strokeStyle = "rgba(212,175,55,0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let px = x; px <= x + gw; px += step) {
      ctx.moveTo(px, y);
      ctx.lineTo(px, y + gh);
    }
    for (let py = y; py <= y + gh; py += step) {
      ctx.moveTo(x, py);
      ctx.lineTo(x + gw, py);
    }
    ctx.stroke();
    ctx.strokeStyle = "rgba(56,189,248,0.045)";
    ctx.beginPath();
    for (let i = -gh; i < gw; i += step * 2) {
      ctx.moveTo(x + i, y);
      ctx.lineTo(x + i + gh, y + gh);
    }
    ctx.stroke();
    ctx.restore();
  }

  /* 标题区圆环小徽章 */
  function passTitleBadge(ctx, cx, cy, text) {
    ctx.save();
    ctx.translate(cx, cy);
    const g = ctx.createRadialGradient(-6, -8, 2, 0, 0, 28);
    g.addColorStop(0, "rgba(29,78,216,0.45)");
    g.addColorStop(0.6, "rgba(12,40,80,0.55)");
    g.addColorStop(1, "rgba(5,20,45,0.7)");
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(212,175,55,0.9)";
    ctx.lineWidth = 2.8;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(253,230,138,0.55)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(56,189,248,0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = "#fde68a";
    ctx.font = "700 18px " + FONT_SERIF;
    const tw = ctx.measureText(text).width;
    ctx.fillText(text, -tw / 2, 6);
    ctx.restore();
  }

  /* 抽象瓶缶剪影（国礼器皿） */
  function passVesselSilhouette(ctx, cx, cy, scale) {
    const s = scale || 1;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(s, s);

    /* 景泰蓝梅瓶轮廓：口沿 → 束颈 → 丰肩 → 收腹 → 圈足 */
    function vasePath() {
      ctx.beginPath();
      ctx.moveTo(-16, -78);
      ctx.lineTo(16, -78);
      ctx.quadraticCurveTo(20, -72, 14, -66);
      ctx.quadraticCurveTo(10, -58, 12, -48);
      ctx.quadraticCurveTo(28, -36, 46, -8);
      ctx.quadraticCurveTo(58, 22, 50, 48);
      ctx.quadraticCurveTo(42, 72, 22, 86);
      ctx.quadraticCurveTo(10, 94, 0, 96);
      ctx.quadraticCurveTo(-10, 94, -22, 86);
      ctx.quadraticCurveTo(-42, 72, -50, 48);
      ctx.quadraticCurveTo(-58, 22, -46, -8);
      ctx.quadraticCurveTo(-28, -36, -12, -48);
      ctx.quadraticCurveTo(-10, -58, -14, -66);
      ctx.quadraticCurveTo(-20, -72, -16, -78);
      ctx.closePath();
    }

    /* 外晕光 */
    const glow = ctx.createRadialGradient(0, 10, 20, 0, 10, 120);
    glow.addColorStop(0, "rgba(56,189,248,0.10)");
    glow.addColorStop(0.45, "rgba(29,78,216,0.08)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(0, 12, 88, 108, 0, 0, Math.PI * 2);
    ctx.fill();

    /* 瓶身釉色底 */
    vasePath();
    const body = ctx.createLinearGradient(-50, -80, 55, 100);
    body.addColorStop(0, "rgba(29,78,216,0.16)");
    body.addColorStop(0.35, "rgba(14,116,144,0.14)");
    body.addColorStop(0.7, "rgba(30,64,175,0.18)");
    body.addColorStop(1, "rgba(15,23,42,0.12)");
    ctx.fillStyle = body;
    ctx.fill();

    /* 左侧高光 */
    const shine = ctx.createLinearGradient(-40, -60, 10, 80);
    shine.addColorStop(0, "rgba(253,230,138,0.14)");
    shine.addColorStop(0.4, "rgba(186,230,253,0.08)");
    shine.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath();
    ctx.moveTo(-10, -70);
    ctx.quadraticCurveTo(-28, -20, -32, 30);
    ctx.quadraticCurveTo(-24, 70, -6, 88);
    ctx.quadraticCurveTo(-2, 40, 0, 0);
    ctx.quadraticCurveTo(-2, -40, -10, -70);
    ctx.fillStyle = shine;
    ctx.fill();

    /* 镀金掐丝外轮廓 */
    vasePath();
    ctx.strokeStyle = "rgba(212,175,55,0.55)";
    ctx.lineWidth = 2.4;
    ctx.stroke();
    vasePath();
    ctx.strokeStyle = "rgba(253,230,138,0.28)";
    ctx.lineWidth = 1;
    ctx.stroke();

    /* 口沿双金线 */
    ctx.beginPath();
    ctx.moveTo(-18, -78);
    ctx.lineTo(18, -78);
    ctx.strokeStyle = "rgba(253,230,138,0.7)";
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-14, -72);
    ctx.lineTo(14, -72);
    ctx.strokeStyle = "rgba(212,175,55,0.45)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    /* 肩部如意云掐丝 */
    ctx.strokeStyle = "rgba(212,175,55,0.38)";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-38, -6);
    ctx.quadraticCurveTo(-20, -22, 0, -10);
    ctx.quadraticCurveTo(20, -22, 38, -6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-30, 8);
    ctx.quadraticCurveTo(-12, -4, 0, 6);
    ctx.quadraticCurveTo(12, -4, 30, 8);
    ctx.stroke();

    /* 腹部开光椭圆（国礼器物感） */
    ctx.beginPath();
    ctx.ellipse(0, 28, 26, 34, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(253,230,138,0.32)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 28, 18, 24, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(56,189,248,0.22)";
    ctx.lineWidth = 1;
    ctx.stroke();

    /* 开光内简化凤纹 / 祥云一笔 */
    ctx.beginPath();
    ctx.moveTo(-8, 38);
    ctx.quadraticCurveTo(0, 12, 10, 24);
    ctx.quadraticCurveTo(4, 36, -2, 42);
    ctx.strokeStyle = "rgba(248,113,113,0.28)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    /* 圈足 */
    ctx.beginPath();
    ctx.ellipse(0, 96, 20, 5, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(212,175,55,0.5)";
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 100, 24, 6, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(253,230,138,0.35)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    /* 底座托盘淡影 */
    ctx.beginPath();
    ctx.ellipse(0, 108, 36, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(15,23,42,0.25)";
    ctx.fill();
    ctx.strokeStyle = "rgba(212,175,55,0.2)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  /* 圆形镀金 / 朱砂印章（双色印泥 · 待点蓝空格） */
  function drawCloisonneSeal(ctx, cx, cy, label, earned, angleDeg) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((angleDeg || 0) * (Math.PI / 180));

    const R = 74;
    if (earned) {
      /* 釉底光晕 */
      const glow = ctx.createRadialGradient(0, 0, 10, 0, 0, R + 10);
      glow.addColorStop(0, "rgba(185,28,28,0.4)");
      glow.addColorStop(0.5, "rgba(212,175,55,0.22)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, R + 12, 0, Math.PI * 2);
      ctx.fill();

      /* 朱砂章面 + 釉面高光 */
      const enamel = ctx.createRadialGradient(-18, -20, 4, 0, 0, R);
      enamel.addColorStop(0, "rgba(232,78,68,0.62)");
      enamel.addColorStop(0.4, "rgba(185,28,28,0.5)");
      enamel.addColorStop(0.75, "rgba(127,29,29,0.48)");
      enamel.addColorStop(1, "rgba(70,16,16,0.42)");
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.fillStyle = enamel;
      ctx.fill();

      /* 金边双环（双色印泥） */
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(212,175,55,0.98)";
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, R - 1.5, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(248,113,113,0.55)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, R - 10, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(253,230,138,0.8)";
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, R - 19, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(248,113,113,0.4)";
      ctx.lineWidth = 1.1;
      ctx.stroke();

      /* 掐丝短刻度 */
      for (let i = 0; i < 12; i++) {
        const a = (Math.PI * 2 * i) / 12;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (R - 3), Math.sin(a) * (R - 3));
        ctx.lineTo(Math.cos(a) * (R - 13), Math.sin(a) * (R - 13));
        ctx.strokeStyle = "rgba(253,230,138,0.5)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      /* 章内细字弧标 */
      ctx.fillStyle = "rgba(254,243,199,0.55)";
      ctx.font = "11px " + FONT_SANS;
      const fine = "田野印鉴";
      const fw = ctx.measureText(fine).width;
      ctx.fillText(fine, -fw / 2, -28);

      ctx.fillStyle = "#fef3c7";
      ctx.font = "700 34px " + FONT_SERIF;
      ctx.shadowColor = "rgba(127,29,29,0.55)";
      ctx.shadowBlur = 4;
      const tw = ctx.measureText(label).width;
      ctx.fillText(label, -tw / 2, 14);
      ctx.shadowBlur = 0;

      ctx.fillStyle = "rgba(253,230,138,0.5)";
      ctx.font = "10px " + FONT_SANS;
      const sub = "已点蓝";
      const sw = ctx.measureText(sub).width;
      ctx.fillText(sub, -sw / 2, 36);
    } else {
      /* 待点蓝空格：内凹釉格感 */
      const hollow = ctx.createRadialGradient(0, -8, 4, 0, 0, R);
      hollow.addColorStop(0, "rgba(20,50,90,0.28)");
      hollow.addColorStop(0.55, "rgba(10,28,55,0.4)");
      hollow.addColorStop(1, "rgba(5,16,36,0.5)");
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.fillStyle = hollow;
      ctx.fill();
      /* 内凹暗边 */
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(8,18,36,0.7)";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, R - 3, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(148,163,184,0.38)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(0, 0, R - 14, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(100,116,139,0.25)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
      /* 待点蓝提示 */
      ctx.fillStyle = "rgba(148,163,184,0.4)";
      ctx.font = "11px " + FONT_SANS;
      const wait = "待点蓝";
      const ww = ctx.measureText(wait).width;
      ctx.fillText(wait, -ww / 2, -26);

      ctx.fillStyle = "rgba(148,163,184,0.5)";
      ctx.font = "600 28px " + FONT_SANS;
      const tw2 = ctx.measureText(label).width;
      ctx.fillText(label, -tw2 / 2, 12);
    }
    ctx.restore();
  }

  async function drawPassportPoster() {
    const canvas = document.getElementById("passportCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = 1080;
    canvas.height = 1440;
    const w = canvas.width;
    const h = canvas.height;
    const conf = cfg();
    const earned = readStamps();
    const defs = stampDefs();
    const got = defs.filter((s) => earned[s.id]).length;
    const team = (conf.meta && conf.meta.teamName) || "数字化调研实践团";
    const place = (conf.meta && conf.meta.surveyPlace) || "三河市";
    const time = (conf.meta && conf.meta.surveyTime) || "2026年7月";
    const complete = got >= defs.length && defs.length > 0;

    /* —— 宝蓝 / 藏青底，赤金暖调收尾（忌紫白） —— */
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, "#040b18");
    bg.addColorStop(0.22, "#0a1f45");
    bg.addColorStop(0.48, "#12325c");
    bg.addColorStop(0.72, "#162848");
    bg.addColorStop(0.9, "#1a2a40");
    bg.addColorStop(1, "#2a1808");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    /* 多层烧蓝釉面光晕：金 / 翠绿 / 天蓝 */
    passGlow(ctx, 180, 200, 340, "rgba(29,78,216,0.28)");
    passGlow(ctx, 900, 280, 300, "rgba(56,189,248,0.16)");
    passGlow(ctx, 540, 640, 380, "rgba(5,150,105,0.12)");
    passGlow(ctx, 240, 1100, 300, "rgba(212,175,55,0.16)");
    passGlow(ctx, 860, 1240, 260, "rgba(185,28,28,0.09)");
    passGlow(ctx, 540, 180, 200, "rgba(253,230,138,0.08)");
    passGlow(ctx, 100, 720, 180, "rgba(56,189,248,0.08)");
    passGlow(ctx, 980, 800, 160, "rgba(212,175,55,0.07)");
    passGoldFoilDots(ctx, w, h);

    /* 全幅细掐丝网格 */
    passFiligreeGrid(ctx, 0, 0, w, h, 30);

    /* 多层镀金掐丝边框 + 云纹角饰 + 中段如意 */
    passOrnateFrame(ctx, 32, 32, w - 64, h - 64);

    /* 顶栏 · 国礼证书气质 */
    ctx.fillStyle = "rgba(253,230,138,0.12)";
    roundRect(ctx, 86, 68, 280, 40, 20);
    ctx.fill();
    ctx.strokeStyle = "rgba(212,175,55,0.55)";
    ctx.lineWidth = 1.5;
    roundRect(ctx, 86, 68, 280, 40, 20);
    ctx.stroke();
    ctx.fillStyle = "#fde68a";
    ctx.font = "600 21px " + FONT_SANS;
    ctx.fillText("掐丝点蓝 · 研学印鉴", 104, 94);

    /* 圆环小徽章 */
    passTitleBadge(ctx, w - 118, 168, complete ? "景泰" : "研学");

    /* 主标题：更大更有仪式感 */
    ctx.fillStyle = "#fff8e7";
    ctx.font = "700 62px " + FONT_SERIF;
    ctx.shadowColor = "rgba(212,175,55,0.25)";
    ctx.shadowBlur = 8;
    ctx.fillText("畿辅文薪 · 研学护照", 86, 178);
    ctx.shadowBlur = 0;

    /* 金线分隔条（副标题区） */
    passGoldLine(ctx, 86, 204, 520);

    ctx.fillStyle = "rgba(226,232,240,0.92)";
    ctx.font = "26px " + FONT_SANS;
    ctx.fillText("景泰蓝田野印章册 · 国礼纪念页", 86, 246);

    ctx.fillStyle = "rgba(148,163,184,0.95)";
    ctx.font = "21px " + FONT_SANS;
    ctx.fillText(`${place}  ·  ${time}`, 86, 284);

    /* 进度徽章 */
    const badgeLabel = complete ? "印鉴已集齐" : `已盖 ${got}/${defs.length} 枚`;
    ctx.font = "600 21px " + FONT_SANS;
    const badgeW = Math.max(160, ctx.measureText(badgeLabel).width + 48);
    const badgeX = w - 86 - badgeW;
    const badgeGrad = ctx.createLinearGradient(badgeX, 68, badgeX + badgeW, 108);
    if (complete) {
      badgeGrad.addColorStop(0, "rgba(185,28,28,0.4)");
      badgeGrad.addColorStop(1, "rgba(212,175,55,0.32)");
    } else {
      badgeGrad.addColorStop(0, "rgba(29,78,216,0.32)");
      badgeGrad.addColorStop(1, "rgba(15,23,42,0.42)");
    }
    ctx.fillStyle = badgeGrad;
    roundRect(ctx, badgeX, 68, badgeW, 40, 20);
    ctx.fill();
    ctx.strokeStyle = complete ? "rgba(253,230,138,0.75)" : "rgba(147,197,253,0.5)";
    ctx.lineWidth = 1.5;
    roundRect(ctx, badgeX, 68, badgeW, 40, 20);
    ctx.stroke();
    ctx.fillStyle = complete ? "#fde68a" : "#bfdbfe";
    ctx.fillText(badgeLabel, badgeX + 24, 94);

    /* 点蓝格印章区 */
    const panelX = 72;
    const panelY = 318;
    const panelW = w - 144;
    const panelH = 720;
    const panelBg = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelH);
    panelBg.addColorStop(0, "rgba(7,22,48,0.62)");
    panelBg.addColorStop(0.5, "rgba(8,28,58,0.55)");
    panelBg.addColorStop(1, "rgba(6,18,40,0.68)");
    ctx.fillStyle = panelBg;
    roundRect(ctx, panelX, panelY, panelW, panelH, 24);
    ctx.fill();
    ctx.strokeStyle = "rgba(212,175,55,0.58)";
    ctx.lineWidth = 2.8;
    roundRect(ctx, panelX, panelY, panelW, panelH, 24);
    ctx.stroke();
    ctx.strokeStyle = "rgba(253,230,138,0.22)";
    ctx.lineWidth = 1.2;
    roundRect(ctx, panelX + 8, panelY + 8, panelW - 16, panelH - 16, 18);
    ctx.stroke();
    ctx.strokeStyle = "rgba(56,189,248,0.2)";
    ctx.lineWidth = 1;
    roundRect(ctx, panelX + 16, panelY + 16, panelW - 32, panelH - 32, 14);
    ctx.stroke();

    passFiligreeGrid(ctx, panelX + 18, panelY + 18, panelW - 36, panelH - 36, 36);

    /* 区标题条 */
    ctx.fillStyle = "rgba(212,175,55,0.14)";
    roundRect(ctx, panelX + 28, panelY + 22, 236, 36, 8);
    ctx.fill();
    ctx.strokeStyle = "rgba(212,175,55,0.35)";
    ctx.lineWidth = 1;
    roundRect(ctx, panelX + 28, panelY + 22, 236, 36, 8);
    ctx.stroke();
    ctx.fillStyle = "#fde68a";
    ctx.font = "600 22px " + FONT_SANS;
    ctx.fillText("点蓝格 · 田野印鉴", panelX + 42, panelY + 46);

    passVesselSilhouette(ctx, w / 2, panelY + panelH / 2 + 28, 2.85);

    const cols = 5;
    const rows = Math.ceil(defs.length / cols) || 1;
    const cellW = (panelW - 56) / cols;
    const cellH = (panelH - 90) / rows;
    const startX = panelX + 28;
    const startY = panelY + 78;

    defs.forEach((s, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = startX + col * cellW + cellW / 2;
      const cy = startY + row * cellH + cellH / 2;
      const on = !!earned[s.id];

      /* 点蓝隔丝单元格：内凹 / 釉面高光 */
      const gx = startX + col * cellW + 8;
      const gy = startY + row * cellH + 8;
      const gw = cellW - 16;
      const gh = cellH - 16;
      const cellGrad = ctx.createRadialGradient(
        gx + gw * 0.35,
        gy + gh * 0.3,
        4,
        gx + gw / 2,
        gy + gh / 2,
        Math.max(gw, gh) * 0.65
      );
      if (on) {
        cellGrad.addColorStop(0, "rgba(56,189,248,0.14)");
        cellGrad.addColorStop(0.45, "rgba(29,78,216,0.16)");
        cellGrad.addColorStop(1, "rgba(8,20,42,0.35)");
      } else {
        cellGrad.addColorStop(0, "rgba(30,50,80,0.18)");
        cellGrad.addColorStop(0.5, "rgba(12,26,48,0.32)");
        cellGrad.addColorStop(1, "rgba(6,14,30,0.4)");
      }
      ctx.fillStyle = cellGrad;
      roundRect(ctx, gx, gy, gw, gh, 14);
      ctx.fill();
      /* 内凹暗边 */
      ctx.strokeStyle = on ? "rgba(5,16,36,0.55)" : "rgba(5,12,28,0.65)";
      ctx.lineWidth = 3;
      roundRect(ctx, gx + 1, gy + 1, gw - 2, gh - 2, 12);
      ctx.stroke();
      ctx.strokeStyle = on ? "rgba(212,175,55,0.42)" : "rgba(100,116,139,0.32)";
      ctx.lineWidth = 1.5;
      roundRect(ctx, gx, gy, gw, gh, 14);
      ctx.stroke();
      /* 釉面高光弧 */
      ctx.strokeStyle = on ? "rgba(253,230,138,0.18)" : "rgba(148,163,184,0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(gx + 14, gy + 10);
      ctx.quadraticCurveTo(gx + gw * 0.4, gy + 4, gx + gw - 18, gy + 12);
      ctx.stroke();

      /* 已盖章轻微旋转；角度随索引变化 */
      const tilt = on ? -8 + (i % 5) * 3.5 : -4 + (i % 3) * 3;
      drawCloisonneSeal(ctx, cx, cy, s.label, on, tilt);
    });

    /* 底部证书签名条 */
    const footY = 1078;
    const footH = 268;
    const footBg = ctx.createLinearGradient(72, footY, 72, footY + footH);
    footBg.addColorStop(0, "rgba(10,24,48,0.78)");
    footBg.addColorStop(1, "rgba(8,18,36,0.85)");
    ctx.fillStyle = footBg;
    roundRect(ctx, 72, footY, w - 144, footH, 22);
    ctx.fill();
    ctx.strokeStyle = "rgba(212,175,55,0.62)";
    ctx.lineWidth = 2.5;
    roundRect(ctx, 72, footY, w - 144, footH, 22);
    ctx.stroke();
    ctx.strokeStyle = "rgba(253,230,138,0.25)";
    ctx.lineWidth = 1.2;
    roundRect(ctx, 84, footY + 10, w - 168, footH - 20, 16);
    ctx.stroke();
    ctx.strokeStyle = "rgba(56,189,248,0.14)";
    ctx.lineWidth = 1;
    roundRect(ctx, 94, footY + 20, w - 188, footH - 40, 12);
    ctx.stroke();

    passCornerOrnament(ctx, 100, footY + 28, 1, 1, 28);
    passCornerOrnament(ctx, w - 100, footY + 28, -1, 1, 28);
    passCornerOrnament(ctx, 100, footY + footH - 28, 1, -1, 28);
    passCornerOrnament(ctx, w - 100, footY + footH - 28, -1, -1, 28);
    passMidMotif(ctx, w / 2, footY + 14, "h");
    passMidMotif(ctx, w / 2, footY + footH - 14, "h");

    const motto = complete
      ? "印鉴俱全，铜丝勾勒，釉色入心——此页可作国礼纪念。"
      : "从旁观到动手，铜丝与釉色才真正落在手上。";
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "25px " + FONT_SANS;
    ctx.fillText(motto, 118, footY + 72);

    passGoldLine(ctx, 118, footY + 98, w - 236);

    /* 日期 · 地点 · 证书感 */
    ctx.fillStyle = "rgba(253,230,138,0.75)";
    ctx.font = "18px " + FONT_SERIF;
    ctx.fillText(`签署于  ${place}`, 118, footY + 134);
    ctx.fillStyle = "rgba(148,163,184,0.9)";
    ctx.font = "18px " + FONT_SANS;
    const dateLabel = time;
    const dateW = ctx.measureText(dateLabel).width;
    ctx.fillText(dateLabel, w - 118 - dateW, footY + 134);

    ctx.fillStyle = "#fde68a";
    ctx.font = "600 22px " + FONT_SANS;
    const teamMax = w - 240;
    let teamLine = team;
    if (ctx.measureText(teamLine).width > teamMax) {
      while (teamLine.length > 4 && ctx.measureText(teamLine + "…").width > teamMax) {
        teamLine = teamLine.slice(0, -1);
      }
      teamLine += "…";
    }
    ctx.fillText(teamLine, 118, footY + 178);

    ctx.fillStyle = "rgba(148,163,184,0.95)";
    ctx.font = "19px " + FONT_SANS;
    ctx.fillText("燕郊非遗田野档案  ·  「畿辅文薪·匠心永续」", 118, footY + 216);

    ctx.fillStyle = "rgba(212,175,55,0.6)";
    ctx.font = "17px " + FONT_SERIF;
    ctx.fillText("CLOISONNÉ  ·  FIELD PASSPORT  ·  掐丝点蓝", 118, footY + 248);
  }

  /* ===== 点蓝填色（多纹样 · 干湿分层 · 釉面凹感）===== */
  function initEnamel() {
    const fillsRoot = document.getElementById("enamelFills");
    const glossRoot = document.getElementById("enamelGloss");
    const wiresRoot = document.getElementById("enamelWires");
    const hitsRoot = document.getElementById("enamelHits");
    const defsRoot = document.getElementById("enamelDefs");
    const palette = document.getElementById("enamelPalette");
    const patternBar = document.getElementById("enamelPatternBar");
    const progressEl = document.getElementById("enamelProgress");
    const tip = document.getElementById("enamelTip");
    const unlock = document.getElementById("enamelUnlock");
    const resetBtn = document.getElementById("enamelReset");
    const swatchTip = document.getElementById("enamelSwatchTip");
    if (!fillsRoot || !palette || !patternBar || !defsRoot) return;

    const EMPTY_FILL = "rgba(30,41,59,0.9)";
    const DRY_MS = 1100;

    const COLORS = [
      { id: "royal", name: "宝蓝", hex: "#1d4ed8" },
      { id: "sky", name: "天蓝", hex: "#38bdf8" },
      { id: "jade", name: "翠绿", hex: "#059669" },
      { id: "cinnabar", name: "朱红", hex: "#b91c1c" },
      { id: "gold", name: "金釉", hex: "#d4af37" },
      { id: "white", name: "月白", hex: "#e2e8f0" }
    ];

    /* 六种掐丝开光纹样：格子 6～8 */
    const PATTERNS = [
      {
        id: "shield",
        name: "盾形开光",
        tip: "经典六格盾形——先湿后干，再换色",
        cells: [
          { d: "M48 48 H160 V120 H48 Z", cx: 104, cy: 84 },
          { d: "M160 48 H272 V120 H160 Z", cx: 216, cy: 84 },
          { d: "M48 120 H120 V212 H48 Z", cx: 84, cy: 166 },
          { d: "M120 120 H200 V212 H120 Z", cx: 160, cy: 166 },
          { d: "M200 120 H272 V212 H200 Z", cx: 236, cy: 166 },
          { d: "M100 70 Q160 40 220 70 Q240 130 160 180 Q80 130 100 70 Z", cx: 160, cy: 100 }
        ]
      },
      {
        id: "peony",
        name: "牡丹格",
        tip: "简化牡丹掐丝格——心瓣与外瓣分格填色",
        cells: [
          { d: "M160 52 Q198 68 208 108 Q180 98 160 102 Q140 98 112 108 Q122 68 160 52 Z", cx: 160, cy: 78 },
          { d: "M208 108 Q248 96 262 136 Q236 152 208 148 Q198 128 208 108 Z", cx: 232, cy: 128 },
          { d: "M208 148 Q236 168 228 204 Q196 192 176 168 Q192 156 208 148 Z", cx: 206, cy: 178 },
          { d: "M144 168 Q124 192 92 204 Q84 168 112 148 Q128 156 144 168 Z", cx: 116, cy: 178 },
          { d: "M112 108 Q72 96 58 136 Q84 152 112 148 Q122 128 112 108 Z", cx: 88, cy: 128 },
          { d: "M148 98 Q172 98 176 122 Q172 146 148 146 Q124 146 120 122 Q124 98 148 98 Z", cx: 148, cy: 122 },
          { d: "M176 122 Q200 118 204 142 Q192 162 168 158 Q172 138 176 122 Z", cx: 184, cy: 140 }
        ]
      },
      {
        id: "lotus",
        name: "莲瓣格",
        tip: "莲瓣分层开光——自外瓣向花心点蓝",
        cells: [
          { d: "M160 46 Q178 78 176 112 Q160 104 144 112 Q142 78 160 46 Z", cx: 160, cy: 78 },
          { d: "M176 112 Q214 88 242 108 Q228 138 196 148 Q184 128 176 112 Z", cx: 208, cy: 118 },
          { d: "M196 148 Q230 158 238 190 Q204 198 176 178 Q184 162 196 148 Z", cx: 208, cy: 172 },
          { d: "M144 178 Q116 198 82 190 Q90 158 124 148 Q136 162 144 178 Z", cx: 112, cy: 172 },
          { d: "M144 112 Q106 88 78 108 Q92 138 124 148 Q136 128 144 112 Z", cx: 112, cy: 118 },
          { d: "M144 112 Q160 104 176 112 Q184 136 176 158 Q160 168 144 158 Q136 136 144 112 Z", cx: 160, cy: 136 },
          { d: "M124 158 Q160 172 196 158 Q200 186 176 208 Q160 216 144 208 Q120 186 124 158 Z", cx: 160, cy: 186 },
          { d: "M100 200 Q160 228 220 200 Q210 220 160 232 Q110 220 100 200 Z", cx: 160, cy: 216 }
        ]
      },
      {
        id: "cloud",
        name: "如意云",
        tip: "如意云头开光——卷云格内分遍填釉",
        cells: [
          { d: "M52 130 Q52 88 92 88 Q108 68 132 80 Q140 108 120 128 Q96 140 72 148 Q52 148 52 130 Z", cx: 92, cy: 112 },
          { d: "M120 88 Q140 58 172 64 Q188 52 208 68 Q216 96 196 112 Q168 120 140 116 Q124 108 120 88 Z", cx: 168, cy: 84 },
          { d: "M196 100 Q220 78 252 90 Q272 98 268 128 Q252 148 224 144 Q200 136 196 100 Z", cx: 232, cy: 112 },
          { d: "M88 148 Q112 136 140 148 Q132 176 108 180 Q84 176 88 148 Z", cx: 112, cy: 160 },
          { d: "M140 128 Q168 116 196 128 Q204 156 176 168 Q148 164 140 128 Z", cx: 168, cy: 144 },
          { d: "M196 144 Q224 132 248 148 Q240 176 212 180 Q188 172 196 144 Z", cx: 220, cy: 156 }
        ]
      },
      {
        id: "vase",
        name: "瓶形开光",
        tip: "瓶形开光分格——颈、肩、腹、足各填一色",
        cells: [
          { d: "M132 40 H188 V68 H132 Z", cx: 160, cy: 54 },
          { d: "M120 68 H160 V100 H108 Q112 80 120 68 Z", cx: 136, cy: 84 },
          { d: "M160 68 H200 V100 H212 Q208 80 200 68 Z", cx: 184, cy: 84 },
          { d: "M108 100 H160 V148 H88 Q92 118 108 100 Z", cx: 124, cy: 124 },
          { d: "M160 100 H212 V148 H232 Q228 118 212 100 Z", cx: 196, cy: 124 },
          { d: "M88 148 H232 V188 H88 Z", cx: 160, cy: 168 },
          { d: "M108 188 H212 V220 H108 Z", cx: 160, cy: 204 }
        ]
      },
      {
        id: "huiwen",
        name: "几何回纹",
        tip: "回纹几何格——规矩开光，层层点蓝",
        cells: [
          { d: "M48 48 H160 V100 H48 Z", cx: 104, cy: 74 },
          { d: "M160 48 H272 V100 H160 Z", cx: 216, cy: 74 },
          { d: "M48 100 H100 V212 H48 Z", cx: 74, cy: 156 },
          { d: "M100 100 H160 V156 H100 Z", cx: 130, cy: 128 },
          { d: "M160 100 H220 V156 H160 Z", cx: 190, cy: 128 },
          { d: "M220 100 H272 V212 H220 Z", cx: 246, cy: 156 },
          { d: "M100 156 H220 V212 H100 Z", cx: 160, cy: 184 },
          { d: "M118 118 H202 V140 H118 Z", cx: 160, cy: 129 }
        ]
      }
    ];

    let patternId = PATTERNS[0].id;
    let selected = COLORS[0];
    /** @type {{ color: string|null, stage: 'empty'|'wet'|'dry', timer: number|null }[]} */
    let cellState = [];

    function hexToRgb(hex) {
      const h = hex.replace("#", "");
      const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
      return {
        r: parseInt(full.slice(0, 2), 16),
        g: parseInt(full.slice(2, 4), 16),
        b: parseInt(full.slice(4, 6), 16)
      };
    }

    function rgbToHex(r, g, b) {
      const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
      return (
        "#" +
        [clamp(r), clamp(g), clamp(b)]
          .map((n) => n.toString(16).padStart(2, "0"))
          .join("")
      );
    }

    function mixHex(hex, other, t) {
      const a = hexToRgb(hex);
      const b = hexToRgb(other);
      return rgbToHex(
        a.r + (b.r - a.r) * t,
        a.g + (b.g - a.g) * t,
        a.b + (b.b - a.b) * t
      );
    }

    function currentPattern() {
      return PATTERNS.find((p) => p.id === patternId) || PATTERNS[0];
    }

    function clearDryTimers() {
      cellState.forEach((st) => {
        if (st && st.timer) {
          clearTimeout(st.timer);
          st.timer = null;
        }
      });
    }

    function scheduleDry(i) {
      const st = cellState[i];
      if (!st || st.stage !== "wet") return;
      if (st.timer) clearTimeout(st.timer);
      st.timer = setTimeout(() => {
        st.timer = null;
        if (st.stage === "wet") {
          st.stage = "dry";
          paintCell(i);
          if (tip) tip.textContent = "釉面渐干，色泽更沉——可继续点格或换色覆盖";
        }
      }, DRY_MS);
    }

    function ensureGradients(n) {
      for (let i = 0; i < n; i++) {
        let grad = document.getElementById(`enamelGrad${i}`);
        if (!grad) {
          grad = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
          grad.setAttribute("id", `enamelGrad${i}`);
          grad.setAttribute("gradientUnits", "userSpaceOnUse");
          grad.innerHTML =
            '<stop class="eg-hi" offset="0%" stop-color="#334155"/>' +
            '<stop class="eg-mid" offset="45%" stop-color="#1e293b"/>' +
            '<stop class="eg-lo" offset="100%" stop-color="#0f172a"/>';
          defsRoot.appendChild(grad);
        }
        let clip = document.getElementById(`enamelClip${i}`);
        if (!clip) {
          clip = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
          clip.setAttribute("id", `enamelClip${i}`);
          const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
          clip.appendChild(clipPath);
          defsRoot.appendChild(clip);
        }
      }
    }

    function paintCell(i) {
      const st = cellState[i];
      const pat = currentPattern();
      const cell = pat.cells[i];
      if (!st || !cell) return;

      const fillEl = fillsRoot.querySelector(`[data-i="${i}"]`);
      const glossEl = glossRoot.querySelector(`[data-i="${i}"]`);
      const grad = document.getElementById(`enamelGrad${i}`);
      if (!fillEl || !grad) return;

      const hi = grad.querySelector(".eg-hi");
      const mid = grad.querySelector(".eg-mid");
      const lo = grad.querySelector(".eg-lo");

      grad.setAttribute("cx", String(cell.cx));
      grad.setAttribute("cy", String(cell.cy - 6));
      grad.setAttribute("r", "42");
      grad.setAttribute("fx", String(cell.cx - 4));
      grad.setAttribute("fy", String(cell.cy - 12));

      if (st.stage === "empty" || !st.color) {
        fillEl.setAttribute("fill", EMPTY_FILL);
        fillEl.classList.remove("enamel-fill--wet", "enamel-fill--dry");
        if (glossEl) glossEl.setAttribute("opacity", "0");
        return;
      }

      const hex = st.color;
      if (st.stage === "wet") {
        const cHi = mixHex(hex, "#ffffff", 0.42);
        const cMid = mixHex(hex, "#ffffff", 0.18);
        const cLo = mixHex(hex, "#0f172a", 0.12);
        if (hi) hi.setAttribute("stop-color", cHi);
        if (mid) mid.setAttribute("stop-color", cMid);
        if (lo) lo.setAttribute("stop-color", cLo);
        if (hi) hi.setAttribute("stop-opacity", "0.78");
        if (mid) mid.setAttribute("stop-opacity", "0.72");
        if (lo) lo.setAttribute("stop-opacity", "0.68");
        fillEl.setAttribute("fill", `url(#enamelGrad${i})`);
        fillEl.classList.add("enamel-fill--wet");
        fillEl.classList.remove("enamel-fill--dry");
        if (glossEl) {
          glossEl.setAttribute("opacity", "0.55");
          glossEl.setAttribute("fill", "rgba(255,255,255,0.45)");
        }
      } else {
        const cHi = mixHex(hex, "#ffffff", 0.22);
        const cMid = hex;
        const cLo = mixHex(hex, "#0f172a", 0.38);
        if (hi) hi.setAttribute("stop-color", cHi);
        if (mid) mid.setAttribute("stop-color", cMid);
        if (lo) lo.setAttribute("stop-color", cLo);
        if (hi) hi.setAttribute("stop-opacity", "1");
        if (mid) mid.setAttribute("stop-opacity", "1");
        if (lo) lo.setAttribute("stop-opacity", "1");
        fillEl.setAttribute("fill", `url(#enamelGrad${i})`);
        fillEl.classList.add("enamel-fill--dry");
        fillEl.classList.remove("enamel-fill--wet");
        if (glossEl) {
          glossEl.setAttribute("opacity", "0.38");
          glossEl.setAttribute("fill", "rgba(255,255,255,0.55)");
        }
      }
    }

    function renderPattern() {
      clearDryTimers();
      const pat = currentPattern();
      const cells = pat.cells;
      cellState = cells.map(() => ({ color: null, stage: "empty", timer: null }));

      ensureGradients(cells.length);

      fillsRoot.innerHTML = cells
        .map(
          (c, i) =>
            `<path class="enamel-fill" data-i="${i}" d="${c.d}" fill="${EMPTY_FILL}" filter="url(#enamelInset)"/>`
        )
        .join("");

      glossRoot.innerHTML = cells
        .map((c, i) => {
          const clip = document.getElementById(`enamelClip${i}`);
          if (clip) {
            const p = clip.querySelector("path");
            if (p) p.setAttribute("d", c.d);
          }
          return `<ellipse class="enamel-gloss" data-i="${i}" cx="${c.cx - 2}" cy="${c.cy - 10}" rx="16" ry="7" fill="rgba(255,255,255,0.5)" opacity="0" clip-path="url(#enamelClip${i})" transform="rotate(-18 ${c.cx} ${c.cy})"/>`;
        })
        .join("");

      wiresRoot.innerHTML = cells
        .map((c) => `<path class="enamel-wire" d="${c.d}"/>`)
        .join("");

      hitsRoot.innerHTML = cells
        .map(
          (c, i) =>
            `<path class="enamel-hit" data-i="${i}" d="${c.d}" fill="rgba(0,0,0,0.001)" tabindex="0" role="button" aria-label="纹格 ${i + 1}"/>`
        )
        .join("");

      if (unlock) unlock.hidden = true;
      if (tip) tip.textContent = pat.tip || "先选釉色，再点纹格填色";
      updateProgress();
    }

    function updateProgress() {
      const pat = currentPattern();
      const n = cellState.filter((s) => s.stage !== "empty").length;
      const total = pat.cells.length;
      if (progressEl) progressEl.textContent = `${n}/${total}`;
      if (n >= total && total > 0) {
        if (unlock) unlock.hidden = false;
        if (tip) tip.textContent = "完成！干湿分层后，釉色才有景泰蓝的层次";
        earnStamp("enamel");
      }
    }

    function hasAnyFill() {
      return cellState.some((s) => s.stage !== "empty");
    }

    function resetFills(announce) {
      clearDryTimers();
      cellState = cellState.map(() => ({ color: null, stage: "empty", timer: null }));
      cellState.forEach((_, i) => paintCell(i));
      if (unlock) unlock.hidden = true;
      if (tip) tip.textContent = currentPattern().tip || "先选釉色，再点纹格填色";
      updateProgress();
      if (announce) toast("已清空点蓝");
    }

    function selectPattern(id, force) {
      if (id === patternId && !force) return;
      if (!force && hasAnyFill()) {
        const ok = window.confirm("切换纹样将清空当前填色，是否继续？");
        if (!ok) return;
      }
      patternId = id;
      patternBar.querySelectorAll(".pattern-chip").forEach((chip) => {
        chip.classList.toggle("active", chip.getAttribute("data-id") === id);
      });
      renderPattern();
      toast(`已切换：${currentPattern().name}`);
    }

    patternBar.innerHTML = PATTERNS.map(
      (p, i) =>
        `<button type="button" class="pattern-chip${i === 0 ? " active" : ""}" data-id="${p.id}" role="tab">${escapeHtml(p.name)}</button>`
    ).join("");

    patternBar.addEventListener("click", (e) => {
      const chip = e.target.closest(".pattern-chip");
      if (!chip) return;
      selectPattern(chip.getAttribute("data-id"));
    });

    palette.innerHTML = COLORS.map(
      (c, i) =>
        `<button type="button" class="enamel-swatch${i === 0 ? " active" : ""}" data-hex="${c.hex}" data-name="${c.name}" style="--swatch:${c.hex}" title="${c.name}" aria-label="${c.name}"></button>`
    ).join("");

    function setSelectedColor(color) {
      selected = color;
      if (swatchTip) swatchTip.textContent = `当前釉色：${color.name}`;
      palette.querySelectorAll(".enamel-swatch").forEach((el) => {
        el.classList.toggle("active", el.getAttribute("data-hex") === color.hex);
      });
    }

    palette.addEventListener("click", (e) => {
      const btn = e.target.closest(".enamel-swatch");
      if (!btn) return;
      const hex = btn.getAttribute("data-hex");
      const name = btn.getAttribute("data-name") || "釉色";
      setSelectedColor({ hex, name, id: hex });
      if (tip) tip.textContent = `已选「${name}」——点纹格上湿釉，同色再点即干透`;
    });

    function handleCell(i) {
      const st = cellState[i];
      if (!st) return;
      const hex = selected.hex;

      if (st.stage === "empty") {
        st.color = hex;
        st.stage = "wet";
        paintCell(i);
        scheduleDry(i);
        if (tip) tip.textContent = "湿釉已入槽——再点同色或稍候变干；换色需先干透";
        updateProgress();
        return;
      }

      if (st.stage === "wet") {
        if (st.color === hex) {
          if (st.timer) {
            clearTimeout(st.timer);
            st.timer = null;
          }
          st.stage = "dry";
          paintCell(i);
          if (tip) tip.textContent = "干釉落定，色更沉、更饱和——可继续填其它格";
          updateProgress();
        } else {
          if (tip) tip.textContent = "换色需先干：再点一次当前色使其干透，或稍候自动变干";
          toast("换色需先干");
        }
        return;
      }

      /* dry */
      if (st.color === hex) {
        if (tip) tip.textContent = "此格已干透，可换其它格继续点蓝";
        return;
      }
      st.color = hex;
      st.stage = "wet";
      paintCell(i);
      scheduleDry(i);
      if (tip) tip.textContent = "干釉上换色：新色先呈湿釉，稍候或再点同色干透";
      updateProgress();
    }

    hitsRoot.addEventListener("click", (e) => {
      const hit = e.target.closest(".enamel-hit");
      if (!hit) return;
      handleCell(Number(hit.getAttribute("data-i")));
    });

    hitsRoot.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const hit = e.target.closest(".enamel-hit");
      if (!hit) return;
      e.preventDefault();
      handleCell(Number(hit.getAttribute("data-i")));
    });

    if (resetBtn) {
      resetBtn.addEventListener("click", () => resetFills(true));
    }

    setSelectedColor(COLORS[0]);
    renderPattern();
  }

  /* ===== 识物 ===== */
  function initIdentify() {
    const img = document.getElementById("identifyImg");
    const clue = document.getElementById("identifyClue");
    const result = document.getElementById("identifyResult");
    const actions = document.getElementById("identifyActions");
    const nextBtn = document.getElementById("identifyNext");
    const preview = document.getElementById("identifyPreview");
    if (!img || !actions) return;

    const ITEMS = [
      {
        answer: "hand",
        src: "images/handmade-cloisonne.jpg",
        clue: "丝线粗细略有起伏，釉色深浅分层，边缘有手工呼吸感。",
        tip: "答对：这是纯手工痕迹——丝线与釉色都带着匠人的节奏。"
      },
      {
        answer: "machine",
        src: "images/machine-fake.jpg",
        clue: "纹样过于整齐均一，釉面平整如印刷，缺少分层晕染。",
        tip: "答对：机器仿品常见「太平整」——价格低，却难有工序温度。"
      },
      {
        answer: "hand",
        src: "images/gallery-filigree.jpg",
        clue: "铜丝弯折处有细微顿挫，焊点不机械重复。",
        tip: "答对：掐丝的手工感往往藏在弯折与焊点里。"
      }
    ];

    let idx = 0;
    let answered = false;

    function showItem() {
      const item = ITEMS[idx % ITEMS.length];
      answered = false;
      img.src = item.src;
      if (clue) clue.textContent = item.clue;
      if (result) result.textContent = "";
      if (preview) preview.setAttribute("data-mode", "mystery");
      actions.querySelectorAll("button").forEach((b) => {
        b.disabled = false;
        b.classList.remove("is-correct", "is-wrong");
      });
    }

    actions.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-guess]");
      if (!btn || answered) return;
      answered = true;
      const guess = btn.getAttribute("data-guess");
      const item = ITEMS[idx % ITEMS.length];
      const ok = guess === item.answer;
      btn.classList.add(ok ? "is-correct" : "is-wrong");
      actions.querySelectorAll("button").forEach((b) => {
        b.disabled = true;
      });
      if (preview) preview.setAttribute("data-mode", item.answer);
      if (result) {
        result.textContent = ok
          ? item.tip
          : `再看看：本题答案是「${item.answer === "hand" ? "纯手工" : "机器仿品"}」。${item.clue}`;
      }
      if (ok) toast("识物成功");
    });

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        idx += 1;
        showItem();
      });
    }

    showItem();
  }

  /* ===== 真假放大镜（按住对比区：左=纯手工 / 右=机器仿品）===== */
  function initMagnifier() {
    const slider = document.getElementById("vsSlider");
    const mag = document.getElementById("magnifier");
    if (!slider || !mag) return;

    const handImg = "images/handmade-cloisonne.jpg";
    const machineImg = "images/machine-fake.jpg";
    let active = false;
    let holdTimer = null;
    let startX = 0;
    let startY = 0;
    const HOLD_MS = 220;
    const CANCEL_PX = 12;

    function pickSrc(clientX) {
      const rect = slider.getBoundingClientRect();
      const range = document.getElementById("vsRange");
      const split = range ? Number(range.value) / 100 : 0.55;
      const xRatio = (clientX - rect.left) / Math.max(rect.width, 1);
      return xRatio <= split ? handImg : machineImg;
    }

    function move(clientX, clientY) {
      const rect = slider.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const size = 108;
      mag.style.left = `${x - size / 2}px`;
      mag.style.top = `${y - size / 2}px`;
      const src = pickSrc(clientX);
      const bgX = (x / rect.width) * 100;
      const bgY = (y / rect.height) * 100;
      mag.style.backgroundImage = `url("${src}")`;
      mag.style.backgroundPosition = `${bgX}% ${bgY}%`;
      mag.style.backgroundSize = "280% 280%";
    }

    function clearHold() {
      if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
      }
    }

    function onStart(e) {
      const p = e.touches ? e.touches[0] : e;
      startX = p.clientX;
      startY = p.clientY;
      clearHold();
      /* 短按拖滑块；按住片刻再开放大镜，避免与对比拖动抢手势 */
      holdTimer = setTimeout(() => {
        holdTimer = null;
        active = true;
        mag.hidden = false;
        mag.setAttribute("aria-hidden", "false");
        move(p.clientX, p.clientY);
      }, HOLD_MS);
    }

    function onMove(e) {
      const p = e.touches ? e.touches[0] : e;
      if (!active) {
        const dx = p.clientX - startX;
        const dy = p.clientY - startY;
        if (holdTimer && dx * dx + dy * dy > CANCEL_PX * CANCEL_PX) {
          clearHold();
        }
        return;
      }
      move(p.clientX, p.clientY);
      if (e.cancelable) e.preventDefault();
    }

    function onEnd() {
      clearHold();
      active = false;
      mag.hidden = true;
      mag.setAttribute("aria-hidden", "true");
    }

    slider.addEventListener("pointerdown", onStart);
    slider.addEventListener("pointermove", onMove);
    slider.addEventListener("pointerup", onEnd);
    slider.addEventListener("pointerleave", onEnd);
    slider.addEventListener("pointercancel", onEnd);
  }

  /* ===== 情景题 ===== */
  function initQuiz() {
    const list = engage().quiz || [];
    const qEl = document.getElementById("quizQ");
    const optEl = document.getElementById("quizOptions");
    const tipEl = document.getElementById("quizTip");
    const indexEl = document.getElementById("quizIndex");
    const prevBtn = document.getElementById("quizPrev");
    const nextBtn = document.getElementById("quizNext");
    if (!qEl || !optEl || !list.length) return;

    let idx = 0;
    let answeredAny = false;

    function render() {
      const item = list[idx];
      qEl.textContent = item.q;
      if (indexEl) indexEl.textContent = `${idx + 1}/${list.length}`;
      if (tipEl) {
        tipEl.hidden = true;
        tipEl.textContent = "";
      }
      optEl.innerHTML = (item.options || [])
        .map(
          (o, i) =>
            `<button type="button" class="quiz-opt" data-i="${i}">${escapeHtml(o.t)}</button>`
        )
        .join("");
    }

    optEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".quiz-opt");
      if (!btn) return;
      const item = list[idx];
      const i = Number(btn.getAttribute("data-i"));
      const opt = item.options[i];
      optEl.querySelectorAll(".quiz-opt").forEach((el) => {
        el.classList.toggle("selected", el === btn);
        el.disabled = true;
      });
      if (tipEl && opt) {
        tipEl.hidden = false;
        tipEl.textContent = opt.tip || "";
      }
      answeredAny = true;
      earnStamp("quiz");
    });

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        idx = (idx - 1 + list.length) % list.length;
        render();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        idx = (idx + 1) % list.length;
        render();
      });
    }

    render();
    void answeredAny;
  }

  /* ===== 烧蓝火候 ===== */
  function initFire() {
    const slider = document.getElementById("fireSlider");
    const kiln = document.getElementById("fireKiln");
    const vessel = document.getElementById("fireVessel");
    const tip = document.getElementById("fireTip");
    const unlock = document.getElementById("fireUnlock");
    const bakeBtn = document.getElementById("fireBake");
    const resetBtn = document.getElementById("fireReset");
    const valueEl = document.getElementById("fireValue");
    const labelEl = document.getElementById("fireTempLabel");
    const hintEl = document.getElementById("fireZoneHint");
    if (!slider || !kiln) return;

    const conf = engage().fireGame || {};
    const tempMin = conf.tempMin != null ? conf.tempMin : 550;
    const tempMax = conf.tempMax != null ? conf.tempMax : 1000;
    const defaultTemp = conf.defaultTemp != null ? conf.defaultTemp : 800;
    const underMax = conf.underMax != null ? conf.underMax : 680;
    const slightLowMin = conf.slightLowMin != null ? conf.slightLowMin : 700;
    const slightLowMax = conf.slightLowMax != null ? conf.slightLowMax : 750;
    const idealMin = conf.idealMin != null ? conf.idealMin : 750;
    const idealMax = conf.idealMax != null ? conf.idealMax : 850;
    const slightHighMin = conf.slightHighMin != null ? conf.slightHighMin : 850;
    const slightHighMax = conf.slightHighMax != null ? conf.slightHighMax : 920;
    const zoneCopy = {
      under: { label: "欠火", hint: "发乌 · 釉色灰哑未熔", vessel: "under" },
      "slight-low": { label: "瑕疵", hint: "轻微瑕疵 · 釉色略欠", vessel: "slight" },
      ideal: { label: "适火", hint: "正烧 · 宝蓝饱满透亮", vessel: "ideal" },
      "slight-high": { label: "瑕疵", hint: "轻微瑕疵 · 釉色略欠", vessel: "slight" },
      over: { label: "过火", hint: "裂釉 · 焦白开裂刺眼", vessel: "over" }
    };
    let succeeded = false;
    let baking = false;
    let revealed = false;
    let bakeTimer = 0;

    slider.min = String(tempMin);
    slider.max = String(tempMax);
    slider.step = "1";
    if (!slider.value || Number(slider.value) < tempMin || Number(slider.value) > tempMax) {
      slider.value = String(defaultTemp);
    }

    const span = Math.max(1, tempMax - tempMin);
    const pct = (a, b) => `${(((b - a) / span) * 100).toFixed(2)}%`;
    kiln.style.setProperty("--fire-col-under", pct(tempMin, underMax));
    kiln.style.setProperty("--fire-col-slight-low", pct(underMax, slightLowMax));
    kiln.style.setProperty("--fire-col-ideal", pct(slightLowMax, slightHighMin));
    kiln.style.setProperty("--fire-col-slight-high", pct(slightHighMin, slightHighMax));
    kiln.style.setProperty("--fire-col-over", pct(slightHighMax, tempMax));

    function zone(v) {
      if (v < underMax) return "under";
      if (v > slightHighMax) return "over";
      if (v >= idealMin && v <= idealMax) return "ideal";
      if (v >= slightLowMin && v < slightLowMax) return "slight-low";
      if (v > slightHighMin && v <= slightHighMax) return "slight-high";
      // 680～700℃：介于欠火与轻微瑕疵之间，按轻微瑕疵
      if (v >= underMax && v < slightLowMin) return "slight-low";
      return "slight-high";
    }

    function setTip(text, result) {
      if (!tip) return;
      tip.textContent = text;
      tip.setAttribute("data-result", result || "");
      tip.classList.toggle("is-ok", result === "ok");
      tip.classList.toggle("is-warn", result === "slight");
      tip.classList.toggle("is-bad", result === "under" || result === "over");
    }

    function setVesselZone(z) {
      if (!vessel) return;
      vessel.classList.remove("is-under", "is-over", "is-ideal", "is-slight", "is-pending");
      if (!z || z === "pending") vessel.classList.add("is-pending");
      else vessel.classList.add(`is-${z}`);
    }

    function syncUi(v, state) {
      // 温度读数始终可呈现；釉色效果仅入窑后揭晓
      if (valueEl) valueEl.textContent = String(v);
      const st = state || "preview";
      kiln.setAttribute("data-state", st);

      if (st === "preview" || st === "idle" || st === "baking") {
        kiln.setAttribute("data-zone", "pending");
        if (labelEl) labelEl.textContent = st === "baking" ? "烧制中" : "待烧";
        if (hintEl) {
          hintEl.textContent = st === "baking" ? "窑火正旺，釉色将现……" : "入窑烧制后才见釉色";
        }
        setVesselZone("pending");
        return;
      }

      const z = zone(v);
      const copy = zoneCopy[z];
      if (labelEl) labelEl.textContent = copy.label;
      if (hintEl) hintEl.textContent = copy.hint;
      kiln.setAttribute("data-zone", z);
      setVesselZone(copy.vessel);
    }

    function finishBake(v) {
      const z = zone(v);
      baking = false;
      revealed = true;
      kiln.classList.remove("is-baking");
      if (bakeBtn) bakeBtn.disabled = false;
      syncUi(v, z);
      if (z === "ideal") {
        succeeded = true;
        setTip(conf.okTip || "正烧（750～850℃）：釉料熔固，丝面齐平。", "ok");
        if (unlock) unlock.hidden = false;
        earnStamp("fire");
        toast("烧蓝成功 · 正烧");
      } else if (z === "under") {
        setTip(conf.underTip || "欠火（＜680℃）：釉色发乌、未熔固。", "under");
        toast("欠火了 · 发乌");
      } else if (z === "slight-low" || z === "slight-high") {
        setTip(conf.slightTip || "轻微瑕疵：火候擦边，釉色略欠完美。", "slight");
        toast("轻微瑕疵");
      } else {
        setTip(conf.overTip || "过火（＞920℃）：釉面裂釉、色料塌陷。", "over");
        toast("过火了 · 裂釉");
      }
    }

    function bake() {
      if (baking) return;
      const v = Number(slider.value);
      baking = true;
      revealed = false;
      if (bakeBtn) bakeBtn.disabled = true;
      kiln.classList.add("is-baking");
      syncUi(v, "baking");
      setTip("窑火正旺……", "");
      window.clearTimeout(bakeTimer);
      bakeTimer = window.setTimeout(() => finishBake(v), 780);
    }

    slider.addEventListener("input", () => {
      if (baking) return;
      const v = Number(slider.value);
      // 拖动时若已烧过一次，改温后重新隐藏结果，需再次入窑
      if (revealed) {
        revealed = false;
        succeeded = false;
        if (unlock) unlock.hidden = true;
      }
      syncUi(v, "preview");
      setTip("调节火候，点「入窑烧制」后才揭晓釉色", "");
    });

    if (bakeBtn) bakeBtn.addEventListener("click", bake);
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        window.clearTimeout(bakeTimer);
        baking = false;
        revealed = false;
        kiln.classList.remove("is-baking");
        if (bakeBtn) bakeBtn.disabled = false;
        slider.value = String(defaultTemp);
        succeeded = false;
        if (unlock) unlock.hidden = true;
        setTip("调节火候，点「入窑烧制」后才揭晓釉色", "");
        syncUi(defaultTemp, "preview");
        toast("火候已重置");
      });
    }

    syncUi(Number(slider.value), "preview");
    setTip("调节火候，点「入窑烧制」后才揭晓釉色", "");
  }

  /* ===== 工序拼图 ===== */
  function initPuzzle() {
    const listEl = document.getElementById("puzzleList");
    const tip = document.getElementById("puzzleTip");
    const unlock = document.getElementById("puzzleUnlock");
    const checkBtn = document.getElementById("puzzleCheck");
    const resetBtn = document.getElementById("puzzleReset");
    const progressEl = document.getElementById("puzzleProgress");
    if (!listEl) return;

    const puzzleExclude = new Set(["intro", "full", "zhansi"]);
    const allSteps = (cfg().processSteps || []).filter((s) => !puzzleExclude.has(s.id));
    const steps = allSteps.slice(0, 6);
    if (steps.length < 2) return;

    const orderIds = steps.map((s) => s.id);
    let current = orderIds.slice();
    let pickIndex = -1;
    let dragFrom = -1;
    let lastTouchAt = 0;

    function shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = a[i];
        a[i] = a[j];
        a[j] = t;
      }
      if (a.every((id, i) => id === orderIds[i]) && a.length > 1) {
        const t = a[0];
        a[0] = a[a.length - 1];
        a[a.length - 1] = t;
      }
      return a;
    }

    function correctCount() {
      let n = 0;
      current.forEach((id, i) => {
        if (id === orderIds[i]) n += 1;
      });
      return n;
    }

    function render() {
      const n = correctCount();
      if (progressEl) progressEl.textContent = `${n}/${orderIds.length}`;
      listEl.innerHTML = current
        .map((id, i) => {
          const step = steps.find((s) => s.id === id) || { title: id, tip: "" };
          const ok = id === orderIds[i];
          return `<li class="puzzle-item${ok ? " is-correct" : ""}${pickIndex === i ? " is-picked" : ""}" draggable="true" data-i="${i}" data-id="${escapeHtml(id)}">
            <span class="puzzle-ord">${i + 1}</span>
            <span class="puzzle-body"><strong>${escapeHtml(step.title)}</strong><em>${escapeHtml(step.tip || "")}</em></span>
            <span class="puzzle-handle" aria-hidden="true">⋮⋮</span>
          </li>`;
        })
        .join("");
    }

    function swap(i, j) {
      if (i < 0 || j < 0 || i === j) return;
      const t = current[i];
      current[i] = current[j];
      current[j] = t;
      pickIndex = -1;
      render();
    }

    function fieldHint() {
      const wrong = [];
      current.forEach((id, i) => {
        if (id !== orderIds[i]) {
          const step = steps.find((s) => s.id === id);
          if (step) wrong.push(step);
        }
      });
      if (!wrong.length) return "";
      const first = wrong[0];
      const confHint = (engage().puzzleHints && engage().puzzleHints.wrong) || "";
      return `${first.title}：${first.tip || ""}。${confHint}`.trim();
    }

    function check() {
      if (correctCount() === orderIds.length) {
        if (tip) tip.textContent = "顺序正确！工序脉络已理清。";
        if (unlock) unlock.hidden = false;
        earnStamp("puzzle");
        earnStamp("process", { silent: true });
        toast("工序拼图完成");
        render();
        return;
      }
      const hint = fieldHint();
      if (tip) tip.textContent = hint || "顺序还不对，再试试。";
      toast("顺序有误");
      render();
    }

    listEl.addEventListener("click", (e) => {
      if (Date.now() - lastTouchAt < 450) return;
      const item = e.target.closest(".puzzle-item");
      if (!item) return;
      const i = Number(item.getAttribute("data-i"));
      if (pickIndex < 0) {
        pickIndex = i;
        render();
        return;
      }
      if (pickIndex === i) {
        pickIndex = -1;
        render();
        return;
      }
      swap(pickIndex, i);
    });

    listEl.addEventListener("dragstart", (e) => {
      const item = e.target.closest(".puzzle-item");
      if (!item) return;
      dragFrom = Number(item.getAttribute("data-i"));
      item.classList.add("is-dragging");
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(dragFrom));
      }
    });

    listEl.addEventListener("dragend", (e) => {
      const item = e.target.closest(".puzzle-item");
      if (item) item.classList.remove("is-dragging");
      dragFrom = -1;
    });

    listEl.addEventListener("dragover", (e) => {
      e.preventDefault();
      const item = e.target.closest(".puzzle-item");
      if (item) item.classList.add("is-dragover");
    });

    listEl.addEventListener("dragleave", (e) => {
      const item = e.target.closest(".puzzle-item");
      if (item) item.classList.remove("is-dragover");
    });

    listEl.addEventListener("drop", (e) => {
      e.preventDefault();
      const item = e.target.closest(".puzzle-item");
      listEl.querySelectorAll(".is-dragover").forEach((el) => el.classList.remove("is-dragover"));
      if (!item) return;
      const to = Number(item.getAttribute("data-i"));
      const from = dragFrom >= 0 ? dragFrom : Number((e.dataTransfer && e.dataTransfer.getData("text/plain")) || -1);
      if (from >= 0) swap(from, to);
    });

    /* 触摸拖拽排序 */
    let touchFrom = -1;
    listEl.addEventListener(
      "touchstart",
      (e) => {
        const item = e.target.closest(".puzzle-item");
        if (!item) return;
        touchFrom = Number(item.getAttribute("data-i"));
        item.classList.add("is-dragging");
      },
      { passive: true }
    );
    listEl.addEventListener(
      "touchmove",
      (e) => {
        if (touchFrom < 0) return;
        const t = e.touches[0];
        const el = document.elementFromPoint(t.clientX, t.clientY);
        const item = el && el.closest ? el.closest(".puzzle-item") : null;
        listEl.querySelectorAll(".is-dragover").forEach((n) => n.classList.remove("is-dragover"));
        if (item) item.classList.add("is-dragover");
      },
      { passive: true }
    );
    listEl.addEventListener("touchend", (e) => {
      if (touchFrom < 0) return;
      lastTouchAt = Date.now();
      const t = e.changedTouches[0];
      const el = document.elementFromPoint(t.clientX, t.clientY);
      const item = el && el.closest ? el.closest(".puzzle-item") : null;
      listEl.querySelectorAll(".is-dragging, .is-dragover").forEach((n) => {
        n.classList.remove("is-dragging", "is-dragover");
      });
      if (item) {
        const to = Number(item.getAttribute("data-i"));
        if (to !== touchFrom) swap(touchFrom, to);
      }
      touchFrom = -1;
    });

    if (checkBtn) checkBtn.addEventListener("click", check);
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        current = shuffle(orderIds);
        pickIndex = -1;
        if (unlock) unlock.hidden = true;
        if (tip) tip.textContent = "按住条目拖动排序；或点两项交换位置";
        render();
        toast("已重新打乱");
      });
    }

    current = shuffle(orderIds);
    render();
  }

  /* ===== 国礼拆解（翻转 + 长按透视）===== */
  function initGifts() {
    const grid = document.getElementById("giftGrid");
    const gifts = engage().nationalGifts || [];
    if (!grid) return;

    const DEFAULT_LAYERS = [
      { id: "shell", name: "外观", text: "可见釉面与纹样" },
      { id: "body", name: "胎体", text: "紫铜胎型" },
      { id: "wire", name: "铜丝", text: "掐丝骨架" },
      { id: "glaze", name: "釉层", text: "珐琅剖面" }
    ];

    grid.innerHTML = gifts
      .map((g, i) => {
        const layers = g.layers && g.layers.length ? g.layers : DEFAULT_LAYERS;
        const layerHtml = layers
          .map(
            (L, li) =>
              `<span class="gift-layer" data-layer="${li}" style="--li:${li}">
                <strong>${escapeHtml(L.name)}</strong>
                <span>${escapeHtml(L.text)}</span>
              </span>`
          )
          .join("");
        const photo = g.image
          ? `<div class="gift-photo-wrap"><img class="gift-photo" src="${escapeHtml(g.image)}" alt="${escapeHtml(g.name)}" loading="lazy" /></div>`
          : "";
        return `
      <div class="gift-card" data-gift="${i}">
        ${photo}
        <button type="button" class="gift-flip" data-gift="${i}" aria-pressed="false">
          <span class="gift-face gift-front">
            <strong>${escapeHtml(g.name)}</strong>
            <em>看得见</em>
            <span>${escapeHtml(g.visible)}</span>
          </span>
          <span class="gift-face gift-back">
            <strong>${escapeHtml(g.name)}</strong>
            <em>看不见</em>
            <span>${escapeHtml(g.hidden)}</span>
          </span>
        </button>
        <div class="gift-xray" data-gift="${i}" aria-label="长按透视剖面">
          <div class="gift-xray-stack">${layerHtml}</div>
          <p class="gift-xray-hint" data-xray-hint>长按透视 · 胎体→铜丝→釉层</p>
          <div class="gift-xray-bar"><span data-xray-bar></span></div>
        </div>
      </div>`;
      })
      .join("");

    grid.querySelectorAll(".gift-xray").forEach((xray) => {
      const giftIdx = Number(xray.getAttribute("data-gift"));
      const gift = gifts[giftIdx] || {};
      const layers = gift.layers && gift.layers.length ? gift.layers : DEFAULT_LAYERS;
      /* 每层可读停留：按最长文案自适应，约 2.8～3.5s，便于读完一行 */
      const maxTextLen = Math.max(
        ...layers.map((L) => String(L.name || "").length + String(L.text || "").length),
        8
      );
      const LAYER_DWELL_MS = Math.round(Math.max(2800, Math.min(3500, 2200 + maxTextLen * 55)));
      const HOLD_MS = LAYER_DWELL_MS * Math.max(1, layers.length - 1);
      const bar = xray.querySelector("[data-xray-bar]");
      const hint = xray.querySelector("[data-xray-hint]");
      let timer = null;
      let raf = null;
      let start = 0;
      let depth = 0;
      let complete = false;
      let moved = false;

      function setDepth(d) {
        depth = Math.min(layers.length - 1, Math.max(0, d));
        xray.setAttribute("data-depth", String(depth));
        xray.querySelectorAll(".gift-layer").forEach((el, i) => {
          el.classList.toggle("active", i === depth);
          el.classList.toggle("seen", i <= depth);
        });
        if (hint) {
          const L = layers[depth];
          hint.textContent = complete
            ? "透视完成 · 可再长按回看"
            : `${L.name}：${L.text}`;
        }
      }

      function finishHold(progress) {
        if (raf) cancelAnimationFrame(raf);
        raf = null;
        clearTimeout(timer);
        timer = null;
        if (progress >= 0.98) {
          setDepth(layers.length - 1);
          complete = true;
          xray.classList.add("is-complete");
          earnStamp("gift");
          toast("国礼透视完成");
        } else if (progress > 0.15) {
          const d = Math.round(progress * (layers.length - 1));
          setDepth(d);
        }
        if (bar) bar.style.width = `${(depth / Math.max(1, layers.length - 1)) * 100}%`;
      }

      function onDown(e) {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        moved = false;
        start = performance.now();
        xray.classList.add("is-holding");
        xray.setPointerCapture && e.pointerId != null && xray.setPointerCapture(e.pointerId);

        function tick(now) {
          const p = Math.min(1, (now - start) / HOLD_MS);
          const d = Math.floor(p * (layers.length - 1) + 0.001);
          setDepth(d);
          if (bar) bar.style.width = `${p * 100}%`;
          if (p < 1) raf = requestAnimationFrame(tick);
          else finishHold(1);
        }
        raf = requestAnimationFrame(tick);
      }

      function onUp() {
        if (!xray.classList.contains("is-holding")) return;
        xray.classList.remove("is-holding");
        const p = Math.min(1, (performance.now() - start) / HOLD_MS);
        finishHold(p);
      }

      function onMove(e) {
        if (!xray.classList.contains("is-holding")) return;
        if (Math.abs(e.movementX) + Math.abs(e.movementY) > 12) moved = true;
      }

      xray.addEventListener("pointerdown", onDown);
      xray.addEventListener("pointerup", onUp);
      xray.addEventListener("pointercancel", onUp);
      xray.addEventListener("pointermove", onMove);
      xray.addEventListener("contextmenu", (e) => e.preventDefault());
      void moved;
      setDepth(0);
    });

    grid.addEventListener("click", (e) => {
      if (e.target.closest(".gift-xray")) return;
      const card = e.target.closest(".gift-flip");
      if (!card) return;
      const open = card.classList.toggle("flipped");
      card.setAttribute("aria-pressed", open ? "true" : "false");
    });
  }

  /* ===== 匠人金句轮播 ===== */
  function initQuotes() {
    const quotes = engage().artisanQuotes || [];
    const roleEl = document.getElementById("quoteRole");
    const textEl = document.getElementById("quoteText");
    const dots = document.getElementById("quoteDots");
    const stage = document.getElementById("quoteStage");
    if (!roleEl || !textEl || !quotes.length) return;

    let idx = 0;
    if (dots) {
      dots.innerHTML = quotes.map((_, i) => `<span class="quote-dot${i === 0 ? " active" : ""}"></span>`).join("");
    }

    function show(i) {
      idx = i % quotes.length;
      const q = quotes[idx];
      if (stage) {
        stage.classList.remove("fade-in");
        void stage.offsetWidth;
        stage.classList.add("fade-in");
      }
      roleEl.textContent = q.role;
      textEl.textContent = q.text;
      if (dots) {
        dots.querySelectorAll(".quote-dot").forEach((d, di) => {
          d.classList.toggle("active", di === idx);
        });
      }
    }

    show(0);
    setInterval(() => show(idx + 1), 15000);
  }

  /* ===== 精选留言上墙 ===== */
  function initWall() {
    const track = document.getElementById("wallTrack");
    const lines = engage().featuredWall || [];
    if (!track || !lines.length) return;
    const html = lines.map((t) => `<span class="wall-item">「${escapeHtml(t)}」</span>`).join("");
    track.innerHTML = html + html;
  }

  function initStampHooks() {
    document.addEventListener("place:opened", () => earnStamp("map"));
    document.addEventListener("filigree:complete", () => earnStamp("filigree"));
    document.addEventListener("process:viewed", () => earnStamp("process"));
    document.addEventListener("visit:poster", () => earnStamp("visit"));
  }

  function init() {
    initPassport();
    initEnamel();
    initFire();
    initPuzzle();
    initIdentify();
    initMagnifier();
    initQuiz();
    initGifts();
    initQuotes();
    initWall();
    initStampHooks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
