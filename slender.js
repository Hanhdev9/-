/* ==========================================================================
   SLENDER.JS — "Mụ Nhện Khâu" săn đuổi hai bé  (nhân vật pixel len/nỉ tự thiết kế)
   --------------------------------------------------------------------------
   Vòng lặp:
     CHASE  mụ nhện 8 chân bò rượt 1 bé (luân phiên bé Len / bé Cúc). 15 giây đầu bé chạy thoát,
            tới giây 15 bé đuối sức, mụ tóm được.
            ► GIỮ CHUỘT / NGÓN TAY lên mụ: mụ bị chặn lại, nhăn mặt, chân cào đất mà không đi được.
              Thả ra mụ mới di chuyển tiếp.
     GRAB → SWALLOW → SHUT   hàm tách ra ngoác to (răng kim khâu), nuốt bé, đóng lại, máu len nỉ
                             văng ra rồi thấm đẫm một chỗ
     STUN → RIN → LEV → THROW → WATCH → ROUT
            "Người Nhiễu" (đầu tivi tĩnh điện) hiện ra bằng nhiễu kỹ thuật số, ném 1 bé ra thay cho
            bé bị nuốt, rồi nhiễu và biến mất. Vòng mới bắt đầu.
   Cấu hình (tuỳ chọn) trong config.js:
     slender: { chase: 15, sprites: { girl:"kid1.png", boy:"kid2.png", watcher:"nguoi.png" } }
   sprites = ảnh PNG riêng của bạn đặt trong icon/ (bé / người nhiễu). Không khai báo thì dùng hình pixel có sẵn.
   ========================================================================== */
"use strict";
(function () {
  const cv = document.getElementById("sl"); if (!cv) return;
  const hero = cv.parentNode, g = cv.getContext("2d"), root = document.documentElement, rnd = Math.random, U = 3;
  const RM = matchMedia("(prefers-reduced-motion:reduce)").matches;
  const CF = (typeof CONFIG !== "undefined" && CONFIG.slender) || {};
  const CHASE = window.SL_CHASE || CF.chase || 15;                    // số giây rượt trước khi mụ bắt được
  const TAU = Math.PI * 2, hyp = Math.hypot;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, snap = v => Math.round(v / U) * U;
  const pick = a => a[rnd() * a.length | 0], cssv = (n, d) => getComputedStyle(root).getPropertyValue(n).trim() || d;
  const ease = t => t * t * (3 - 2 * t);

  /* ---------- màu theo bộ màu đang chọn ---------- */
  let rim = "#5fe0d0", thread = "#ffd36b", accC = "#ff7ab8";
  const readTheme = () => { rim = cssv("--acc-3", rim); thread = cssv("--thread", thread); accC = cssv("--acc", accC); };
  readTheme(); new MutationObserver(readTheme).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  /* ==========================================================================
     SPRITE (pixel 1 ô = U px).  Toàn bộ nhân vật do mình tự thiết kế.
     ========================================================================== */
  const mk = (rows, pal) => { const c = document.createElement("canvas"); c.width = rows[0].length; c.height = rows.length; const x = c.getContext("2d");
    rows.forEach((r, y) => [...r].forEach((ch, i) => { if (pal[ch]) { x.fillStyle = pal[ch]; x.fillRect(i, y, 1, 1); } })); return c; };
  const tint = (c, col) => { const t = document.createElement("canvas"); t.width = c.width; t.height = c.height; const x = t.getContext("2d"); x.drawImage(c, 0, 0); x.globalCompositeOperation = "source-in"; x.fillStyle = col; x.fillRect(0, 0, t.width, t.height); return t; };
  const rep = (s, n) => Array(n).fill(s);

  /* Bé Len: tóc cam, hai búp bông hồng, áo len xanh ngọc, váy tím */
  const GIRL = mk([".pp...pp.", ".pp.h.pp.", "..hhhhh..", ".hhhhhhh.", ".hsssssh.", ".hsesesh.", "..sssss..", "..ttttt..", ".sttttts.", "..kkkkk..", "..l...l..", "..b...b.."],
    { h: "#d9702b", p: "#ff7ab8", s: "#ffd0ad", e: "#1a1a2a", t: "#2fb5a5", k: "#5a3d8a", l: "#ffd0ad", b: "#3a2a2a" });
  /* Bé Cúc: mũ bucket xanh lá, áo sọc đỏ trắng, ba lô, quần nâu */
  const BOY = mk(["...ggg...", "..ggggg..", ".GGGGGGG.", "..sssss..", "..seses..", "..sssss..", "..rwrwr..", ".srwrwrs.", ".brwrwrb.", "..nnnnn..", "..l...l..", "..k...k.."],
    { g: "#3c9a4e", G: "#2a7a3a", s: "#ffd0ad", e: "#1a1a2a", r: "#d9433a", w: "#f4f0e6", b: "#8a5a2a", n: "#6a4a2a", l: "#ffd0ad", k: "#2a2a3a" });
  const KID = { girl: GIRL, boy: BOY }, KW = 9 * U, KH = 12 * U;

  /* Người Nhiễu: cao gầy, áo choàng dài, đầu là chiếc tivi cũ có anten, màn hình toàn nhiễu hạt */
  const WR = [".a.....a.", "..a...a..", "...a.a...", "ccccccccc", "cSSSSSSSc", "cSSSSSSSc", "cSSSSSSSc", "cSSSSSSSc", "cSSSSSSSc", "ccccccccc", "....c....",
    "..kkkkk..", ".kkkwkkk.", ...rep(".k.kkk.k.", 12), ".h.kkk.h.", "..kkkkk..", "..kkkkk..", ...rep("...k.k...", 7), "..kk.kk.."];
  const WSPR = mk(WR, { a: "#5a5a70", c: "#3b3b4c", k: "#101014", w: "#d9d9e6", h: "#9aa0b4" });
  const WRED = tint(WSPR, "#ff3b57"), WCY = tint(WSPR, "#18f0e8");
  const WW = 9 * U, WH = WR.length * U;

  /* ảnh riêng của người dùng (tuỳ chọn): CONFIG.slender.sprites */
  const custom = {};
  Object.entries(CF.sprites || {}).forEach(([k, u]) => {
    const im = new Image(); im.onload = () => { custom[k] = im; };
    im.src = typeof asset === "function" ? asset(u, (typeof CONFIG !== "undefined" && CONFIG.iconBase) || "") : u;
  });

  /* ==========================================================================
     TRẠNG THÁI
     ========================================================================== */
  let W = 0, Hh = 0, av = { x: 0, y: 0, r: 98 }, A = { x0: 0, x1: 0, y0: 0, y1: 0 };
  let T = 0, ph = "chase", pt = 0, ct = 0, targetType = rnd() < .5 ? "girl" : "boy", held = false;
  const HAG = { x: 0, y: 0, face: 1, vx: 0, vy: 0, ph: 0, mv: 0, jaw: 0, belly: 0, frown: 0, scr: 0, lunge: 0 };
  const WAT = { x: 0, y: 0, face: 1, gl: 0, a: 1, lean: 0, on: false };
  let kids = [], parts = [], stain = [], stainA = 1, fadeStain = false, poolT = -1, grabK = null, flyK = null, land = null;
  const scr = Array.from({ length: 5 }, () => Array(7).fill(128)); let scrT = 0;

  const mkKid = t => ({ t, x: 0, y: 0, vx: 0, vy: 0, face: 1, ph: rnd() * 6, mv: 0, wa: rnd() * TAU, state: "run", z: 0, hop: 0, hopT: 0, rot: 0, sc: 1, sq: 0, cool: 0, a: 1, x0: 0, y0: 0 });

  /* ---------- sân chơi ---------- */
  function layout() {
    const dpr = Math.min(2, devicePixelRatio || 1), logo = hero.querySelector(".logo"), ring = hero.querySelector(".ring"), nm = hero.querySelector(".name");
    if (!logo || !ring) return;
    /* thứ tự lớp: tên + chữ lớn (0) < nhân vật (canvas, 1) < avatar (2) → nhân vật chạy TRƯỚC chữ nhưng đi SAU avatar để không che chủ thể */
    [[ring, "2"], [nm, "0"], [logo, "0"]].forEach(([el, z]) => { if (!el) return; if (getComputedStyle(el).position === "static") el.style.position = "relative"; el.style.zIndex = z; });
    cv.style.zIndex = "1";
    W = hero.clientWidth; Hh = logo.offsetTop + logo.offsetHeight + 4;
    cv.style.width = W + "px"; cv.style.height = Hh + "px"; cv.width = W * dpr; cv.height = Hh * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.imageSmoothingEnabled = false;
    av = { x: ring.offsetLeft + ring.offsetWidth / 2, y: ring.offsetTop + ring.offsetHeight / 2, r: 98 };       // 98 = avatar + viền vải khâu
    A = { x0: 34, x1: Math.max(100, W - 34), y0: ring.offsetTop + KH + 14, y1: Math.max(ring.offsetTop + KH + 60, Hh - 10) };
    [WAT, ...kids].forEach(bound); boundH(HAG);
  }
  const avoid = (o, rad, cy) => { const dx = o.x - av.x, dy = o.y - cy - av.y, d = hyp(dx, dy), R = av.r + rad; if (d < R) { const k = (R - d) / (d || 1); o.x += dx * k; o.y += dy * k; } };
  const bound = o => { o.x = clamp(o.x, A.x0, A.x1); o.y = clamp(o.y, A.y0, A.y1); };
  const boundH = o => { o.x = clamp(o.x, A.x0 + 24, Math.max(A.x0 + 60, A.x1 - 24)); o.y = clamp(o.y, A.y0, A.y1); };    // mụ to hơn nên chừa lề rộng hơn
  function freePoint(minFrom, from) {
    for (let i = 0; i < 80; i++) {
      const x = lerp(A.x0, A.x1, rnd()), y = lerp(A.y0, A.y1, rnd());
      if (hyp(x - av.x, y - 18 - av.y) < av.r + 26) continue;
      if (from && hyp(x - from.x, y - from.y) < minFrom) continue;
      return { x, y };
    }
    return { x: A.x0 + 10, y: A.y1 };
  }
  function reset() {
    ph = "chase"; pt = 0; ct = 0; stain = []; parts = []; stainA = 1; fadeStain = false; poolT = -1; WAT.on = false;
    const hp = { x: rnd() < .5 ? A.x0 + 40 : A.x1 - 40, y: A.y1 - 4 };
    Object.assign(HAG, { x: hp.x, y: hp.y, vx: 0, vy: 0, jaw: 0, belly: 0, frown: 0, scr: 0, face: hp.x < W / 2 ? 1 : -1 });
    kids = ["girl", "boy"].map(mkKid);
    kids.forEach(k => { const p = freePoint(130, HAG); k.x = p.x; k.y = p.y; });
  }

  /* ==========================================================================
     VẼ NHỮNG HÌNH CƠ BẢN (đơn vị local = ô pixel)
     ========================================================================== */
  let UU = U;                                                 // kích thước 1 ô khi vẽ mụ nhện (to hơn bé: HU)
  const HU = 4;
  const P = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x) * UU, Math.round(y) * UU, w * UU, h * UU); };
  function ell(cx, cy, rx, ry, col) {                         // hình elip ghép từ các dải ngang 1 ô
    g.fillStyle = col;
    for (let y = Math.ceil(cy - ry); y <= Math.floor(cy + ry); y++) {
      const dy = (y + .5 - cy) / ry, w = Math.sqrt(Math.max(0, 1 - dy * dy)) * rx, x0 = Math.round(cx - w), x1 = Math.round(cx + w);
      if (x1 > x0) g.fillRect(x0 * UU, y * UU, (x1 - x0) * UU, UU);
    }
  }
  function limb(pts, col, pad) {                              // đường pixel qua các điểm
    g.fillStyle = col;
    for (let s = 0; s < pts.length - 1; s++) {
      const [x0, y0] = pts[s], [x1, y1] = pts[s + 1], n = Math.max(1, Math.ceil(hyp(x1 - x0, y1 - y0) * 1.4));
      for (let i = 0; i <= n; i++) g.fillRect(Math.round(lerp(x0, x1, i / n)) * UU - pad, Math.round(lerp(y0, y1, i / n)) * UU - pad, UU + pad * 2, UU + pad * 2);
    }
  }
  const shadow = (x, y, rx, a) => { g.fillStyle = "rgba(0,0,0," + (.3 * a) + ")"; g.fillRect(x - rx, y - U / 2, rx * 2, U); g.fillRect(x - rx * .7, y - U * 1.5, rx * 1.4, U); g.fillRect(x - rx * .7, y + U / 2, rx * 1.4, U); };

  /* ---------- Mụ Nhện Khâu ---------- */
  const LEGS = [0, 1, 2, 3, 4, 5, 6, 7].map(i => ({ ax: [-7, -3.5, 0, 3.5][i % 4] + (i < 4 ? 0 : 1.2), far: i >= 4, dx: [-14, -8, 8, 14][i % 4] * (i < 4 ? 1 : .86), off: i * Math.PI / 2 + (i >= 4 ? Math.PI / 2 : 0) }));
  function legPts(h, L, bob) {                                // chân 2 đốt: hông → đầu gối (nhô cao) → mũi chân nhọn
    const str = 4.6 * h.mv + 2.4 * h.scr + .6, lift = 3.4 * Math.max(h.mv, h.scr) + .3, a = h.ph + L.off;
    const ax = L.ax, ay = -7.5 + bob; let fx = ax + L.dx + Math.sin(a) * str, fy = -Math.max(0, Math.cos(a)) * lift;
    const Lg = 10.5; let dx = fx - ax, dy = fy - ay, d = hyp(dx, dy);
    if (d > 2 * Lg - .05) { const s = (2 * Lg - .05) / d; dx *= s; dy *= s; fx = ax + dx; fy = ay + dy; d = 2 * Lg - .05; }
    const hh = Math.sqrt(Math.max(0, Lg * Lg - (d / 2) * (d / 2)));
    let nx = -dy / d, ny = dx / d; if (ny > 0) { nx = -nx; ny = -ny; }
    return [[ax, ay], [(ax + fx) / 2 + nx * hh, (ay + fy) / 2 + ny * hh], [fx, fy]];
  }
  function drawLegs(arr, a) { g.globalAlpha = a * .5; arr.forEach(p => limb(p, rim, 1)); g.globalAlpha = a; arr.forEach(p => limb(p, "#15101b", 0)); g.globalAlpha = 1; }

  function drawHag(h) {
    const jaw = h.jaw, bob = h.mv > .1 ? Math.abs(Math.sin(h.ph * 2)) * .6 : Math.sin(T * 2.4) * .4, sx = h.frown > .5 ? (rnd() - .5) * 4 : 0;
    g.save(); g.translate(snap(h.x + sx + h.face * h.lunge * 12), snap(h.y)); g.scale(h.face, 1); UU = HU;
    const legs = LEGS.map(L => legPts(h, L, bob));
    drawLegs(legs.filter((_, i) => LEGS[i].far), .72);
    /* thân sau: vá nhiều mảnh nỉ đen + chỉ khâu */
    const ab = 5 + h.belly * 1.8, by = bob;
    g.globalAlpha = .85; ell(-6.5, -10 + by, 7.8, ab + 1, rim); g.globalAlpha = 1;
    ell(-6.5, -10 + by, 6.8, ab, "#17121e"); ell(-9, -11.5 + by, 2.8, 2, "#2c2236"); ell(-4.5, -8.4 + by, 2.4, 1.6, "#251c2e");
    g.globalAlpha = .55; ell(-6, -12.6 + by, 1.8, 1.2, accC); g.globalAlpha = 1;
    for (let i = 0; i < 5; i++) P(-6.5, -14 + by + i * 2, 1, 1, thread);
    /* đầu: hai nửa trên/dưới tách theo đường hàm */
    const jawY = -10 + by, gapT = jaw * 5.5, gapB = jaw * 3.5;
    const head = top => {
      g.globalAlpha = .85; ell(3.5, -10 + by, 6.2, 5.6, rim); g.globalAlpha = 1;
      ell(3.5, -10 + by, 5.2, 4.6, "#1d1625"); ell(6, top ? -11.8 + by : -8, 2, 1.4, "#2c2236");
      if (top) {                                                       // mắt = 2 chiếc cúc áo đen bóng
        P(5, -14 + by, 3, 3, "#07050a"); P(5, -14 + by, 1, 1, "rgba(255,255,255,.85)"); P(6, -13 + by, 1, 1, "#3a3340"); P(7, -12 + by, 1, 1, thread);
        P(1, -13 + by, 2, 2, "#07050a"); P(1, -13 + by, 1, 1, "rgba(255,255,255,.8)");
        if (h.frown > .4) {                                            // nhăn mặt: lông mày chỉ khâu xếch xuống
          limb([[9, -16 + by], [7, -15 + by], [5, -14.4 + by]], thread, 0); limb([[0, -15.6 + by], [2, -14.8 + by], [3.5, -14.2 + by]], thread, 0);
        }
      }
    };
    if (jaw > .03) {                                                   // khoang miệng đỏ sẫm
      P(1, jawY - gapT, 9, gapT + gapB, "#3a0a16"); P(2, jawY - gapT + 1, 7, Math.max(1, gapT + gapB - 2), "#1c0509");
    }
    g.save(); g.beginPath(); g.rect(-30 * UU, -40 * UU, 70 * UU, (jawY + 40) * UU); g.clip(); g.translate(0, -gapT * UU); head(true); g.restore();
    g.save(); g.beginPath(); g.rect(-30 * UU, jawY * UU, 70 * UU, 40 * UU); g.clip(); g.translate(0, gapB * UU); head(false); g.restore();
    if (jaw > .03) {                                                   // răng = kim khâu nhọn 2 hàng + chỉ khâu hai mép
      for (let i = 0; i < 5; i++) { const hgt = 2 + (i % 2); P(1.5 + i * 1.7, jawY - gapT, 1, hgt, "#f1ecdc"); P(2.3 + i * 1.7, jawY + gapB - 1 - ((i + 1) % 2) - 1, 1, 2 + ((i + 1) % 2), "#f1ecdc"); }
      P(8, jawY - gapT, 1, 1, thread); P(8, jawY + gapB - 1, 1, 1, thread); P(9, jawY - gapT + 1, 1, 1, thread); P(9, jawY + gapB - 2, 1, 1, thread);
    } else if (h.frown > .4) {                                         // miệng chỉ khâu cong xuống
      for (let x = 1; x <= 8; x += 2) P(x, -9.5 + by + Math.round(Math.pow(x - 4.5, 2) * .12), 1, 1, thread);
    } else {                                                           // miệng khâu kín
      for (let x = 0; x <= 8; x += 2) P(x, jawY, 1, 1, thread);
    }
    P(9, -8.5 + by - 0, 2, 1, "#cfd3e6"); P(9, -11.5 + by, 2, 1, "#cfd3e6");   // 2 chiếc kim nhỏ ở mép
    drawLegs(legs.filter((_, i) => !LEGS[i].far), 1);
    UU = U; g.restore();
  }

  /* ---------- bé ---------- */
  function drawKid(k) {
    const im = custom[k.t], spr = KID[k.t], w = im ? KH * im.naturalWidth / im.naturalHeight : KW, bob = k.state === "run" && k.mv > .2 ? Math.abs(Math.sin(k.ph)) * 3 : 0;
    g.save(); g.globalAlpha = k.a; g.translate(snap(k.x), snap(k.y - k.z - bob - k.hop)); g.scale(k.face, 1); g.translate(0, -KH / 2); if (k.rot) g.rotate(k.rot);
    g.scale(k.sc * (1 + k.sq), k.sc * (1 - k.sq)); g.drawImage(im || spr, -w / 2, -KH / 2, w, KH); g.restore();
  }

  /* ---------- Người Nhiễu ---------- */
  function drawWatcher(w) {
    const im = custom.watcher, spr = im || WSPR, sw = im ? WH * im.naturalWidth / im.naturalHeight : WW, gl = w.gl;
    g.save(); g.translate(snap(w.x), snap(w.y)); g.rotate(w.lean); if (w.face < 0) g.scale(-1, 1);
    const x0 = -sw / 2, y0 = -WH;
    if (gl > .02) {                                                     // nhiễu: cắt lát ngang, lệch, bóng đỏ/lục lam, khối nhiễu
      const n = 18, rh = spr.height / n;
      for (let i = 0; i < n; i++) {
        const dx = (rnd() - .5) * gl * 24, yy = y0 + i * WH / n;
        g.globalAlpha = w.a * (rnd() > gl * .5 ? 1 : .22); g.drawImage(spr, 0, i * rh, spr.width, rh, x0 + dx, yy, sw, WH / n + .6);
        if (!im && rnd() < gl) { g.globalAlpha = w.a * .5 * gl; g.drawImage(rnd() > .5 ? WRED : WCY, 0, i * rh, spr.width, rh, x0 - dx * 1.6, yy, sw, WH / n + .6); }
      }
      g.globalAlpha = .75; for (let i = 0, m = gl * 26; i < m; i++) { g.fillStyle = pick(["#ffffff", "#0b0b10", "#18f0e8", "#ff3b57", accC]); g.fillRect(x0 + (rnd() * 1.8 - .4) * sw, y0 + rnd() * WH, U * (1 + (rnd() * 4 | 0)), U * (1 + (rnd() * 2 | 0))); }
    } else g.drawImage(spr, x0, y0, sw, WH);
    if (!im) {                                                          // màn hình tivi toàn nhiễu hạt + vệt quét
      g.globalAlpha = w.a; const roll = (T * 7 | 0) % 6;
      for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) { const v = scr[r][c] | 0, b = r === roll ? 60 : 0; g.fillStyle = "rgb(" + Math.min(255, v + b) + "," + Math.min(255, v + b) + "," + Math.min(255, v + b + 20) + ")"; g.fillRect(x0 + (c + 1) * U, y0 + (r + 4) * U, U, U); }
    }
    g.restore(); g.globalAlpha = 1;
  }

  /* ---------- máu len nỉ + bụi vải ---------- */
  const REDS = ["#b3122a", "#8f0d22", "#d1263d", "#a01028"];
  function addStain(x, y, s, c) { if (stain.length > 340) return; stain.push({ x: snap(x), y: snap(y), s, c: c || pick(REDS), t: 0 }); }
  function drawStain() {
    if (!stain.length || stainA <= .02) return; g.save(); g.globalAlpha = stainA;
    for (const c of stain) {
      g.fillStyle = c.c; g.fillRect(c.x, c.y, c.s, c.s); g.fillStyle = "rgba(0,0,0,.38)"; g.fillRect(c.x, c.y + c.s - 1, c.s, 1);
      const wet = Math.max(0, 1 - c.t / 6); if (wet > 0) { g.fillStyle = "rgba(255,205,215," + (.6 * wet) + ")"; g.fillRect(c.x + 1, c.y + 1, Math.max(1, c.s / 3 | 0), 1); }
    }
    g.restore();
  }
  function spray() {
    const m = mouthPt();
    for (let i = 0; i < 70; i++) parts.push({ k: "blood", x: m.x, y: m.y, vx: HAG.face * (30 + rnd() * 150) * (rnd() < .85 ? 1 : -.35), vy: -(70 + rnd() * 230), s: rnd() < .55 ? U : U * 2, c: pick(REDS), gy: HAG.y + rnd() * 12 - 2 });
    poolT = 0;
  }
  function dust(x, y, n, cols) { for (let i = 0; i < n; i++) parts.push({ k: "dust", x, y, vx: (rnd() - .5) * 120, vy: -(40 + rnd() * 100), s: rnd() < .5 ? U : U * 2, c: pick(cols), l: .5 + rnd() * .4, t: 0 }); }
  function stepParts(dt) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.vy += 620 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.k === "blood" && p.vy > 0 && p.y >= p.gy) { addStain(p.x, p.gy, p.s, p.c); parts.splice(i, 1); }
      else if (p.k === "dust") { p.t += dt; if (p.t > p.l) parts.splice(i, 1); }
      else if (p.y > Hh + 40) parts.splice(i, 1);
    }
    for (const c of stain) c.t += dt;
    if (poolT >= 0) {                                                   // vũng máu thấm dần quanh chân mụ
      poolT += dt; const R = 8 + 26 * Math.min(1, poolT / 1.2), px = HAG.x + HAG.face * 20, py = HAG.y + 4;
      for (let i = 0; i < 2; i++) { const a = rnd() * TAU, r = Math.sqrt(rnd()) * R; addStain(px + Math.cos(a) * r, py + Math.sin(a) * r * .45, rnd() < .5 ? U : U * 2); }
      if (poolT > 1.3) poolT = -1;
    }
    if (fadeStain) { stainA = Math.max(0, stainA - dt / 10); if (stainA <= 0) { stain = []; fadeStain = false; } }
    ph !== "x" && (scrT -= dt) < 0 && (scrT = .07, scr.forEach(r => r.forEach((_, c) => r[c] = 20 + rnd() * 215)));
  }
  const drawParts = () => { for (const p of parts) { g.globalAlpha = p.k === "dust" ? 1 - p.t / p.l : 1; g.fillStyle = p.c; g.fillRect(Math.round(p.x / U) * U, Math.round(p.y / U) * U, p.s, p.s); } g.globalAlpha = 1; };

  /* ==========================================================================
     LOGIC
     ========================================================================== */
  const mouthPt = () => ({ x: HAG.x + HAG.face * 7 * HU, y: HAG.y - 10 * HU });
  const target = () => kids.find(k => k.t === targetType && k.state === "run") || kids.find(k => k.state === "run");
  const go = p => { ph = p; pt = 0; };
  const onScreen = () => { const b = cv.getBoundingClientRect(); return b.bottom > 0 && b.top < innerHeight ? b : null; };
  function fxBurst(out) {                                               // mảnh vải đen/trắng khi Người Nhiễu hiện / tan
    const b = onScreen(); if (!b || !window.FX || !FX.burst) return;
    FX.burst({ rect: { l: b.left + WAT.x - WW / 2, t: b.top + WAT.y - WH, w: WW, h: WH }, out, cell: 14, cols: ["#0b0b10", "#0b0b10", "#ececf4", "#18f0e8", "#ff3b57"], dur: .7 });
  }

  function placeWatcher() {                                             // chọn chỗ đứng: cả đầu, thân, chân đều nằm ngoài khuôn avatar và cách mụ xa
    const vis = (x, y) => [0, .5, 1].every(f => hyp(x - av.x, (y - WH * f) - av.y) > av.r + 12);
    let best = null;
    for (let i = 0; i < 160 && !best; i++) {
      const x = lerp(A.x0, A.x1, rnd()), y = lerp(Math.max(A.y0, WH + 6), A.y1, rnd());
      if (vis(x, y) && hyp(x - HAG.x, y - HAG.y) > 130) best = { x, y };
    }
    if (!best) best = { x: HAG.x < W / 2 ? A.x1 : A.x0, y: A.y1 };
    WAT.x = best.x; WAT.y = best.y; WAT.face = WAT.x > HAG.x ? -1 : 1;
  }

  function chaseStep(dt) {
    ct += dt; const tg = target(), H = HAG, hold = held, late = ct >= CHASE;
    H.frown = lerp(H.frown, hold ? 1 : 0, Math.min(1, dt * 12)); H.scr = lerp(H.scr, hold ? 1 : 0, Math.min(1, dt * 10)); H.lunge = Math.max(0, H.lunge - dt * 4);
    let tvx = 0, tvy = 0;
    if (tg && !hold) { const dx = tg.x - H.x, dy = tg.y - H.y, d = hyp(dx, dy) || 1, sp = late ? 118 : 52; tvx = dx / d * sp; tvy = dy / d * sp * .8; if (d < 30) { tvx *= .2; tvy *= .2; } }
    H.vx = lerp(H.vx, tvx, Math.min(1, dt * 5)); H.vy = lerp(H.vy, tvy, Math.min(1, dt * 5));
    if (hold) { H.vx = H.vy = 0; if (rnd() < dt * 9) dust(H.x + (rnd() - .5) * 50, H.y, 1, ["#7a6a88", thread]); }   // bị chặn: bụi tung dưới chân
    H.x += H.vx * dt; H.y += H.vy * dt; avoid(H, 42, 34); boundH(H);
    const sp = hyp(H.vx, H.vy); H.mv = lerp(H.mv, Math.min(1, sp / 60), Math.min(1, dt * 8)); H.ph += dt * (hold ? 17 : 2 + sp * .09);
    if (hold && tg) H.face = tg.x > H.x ? 1 : -1; else if (Math.abs(H.vx) > 6) H.face = H.vx > 0 ? 1 : -1;

    for (const k of kids) {
      if (k.state !== "run") continue;
      const dx = k.x - H.x, dy = k.y - H.y, d = hyp(dx, dy) || 1; let ax = 0, ay = 0;
      if (d < 170) { ax += dx / d * 1.2; ay += dy / d * 1.2; }
      k.wa += (rnd() - .5) * dt * 5; ax += Math.cos(k.wa) * .55; ay += Math.sin(k.wa) * .55;
      if (k.x < A.x0 + 40) ax += 1.4; if (k.x > A.x1 - 40) ax -= 1.4; if (k.y < A.y0 + 30) ay += 1.4; if (k.y > A.y1 - 20) ay -= 1.4;
      const isT = k === tg, n = hyp(ax, ay) || 1; let sp2 = isT ? (late ? 30 : 64) : 44; if (hold) sp2 *= .35;
      k.vx = lerp(k.vx, ax / n * sp2, Math.min(1, dt * 5)); k.vy = lerp(k.vy, ay / n * sp2 * .8, Math.min(1, dt * 5));
      k.x += k.vx * dt; k.y += k.vy * dt; avoid(k, 54, 18); bound(k);
      const v = hyp(k.vx, k.vy); k.mv = lerp(k.mv, Math.min(1, v / 30), Math.min(1, dt * 8)); k.ph += dt * (4 + v * .16); if (Math.abs(k.vx) > 5) k.face = k.vx > 0 ? 1 : -1;
      k.cool = Math.max(0, k.cool - dt); if (hold && rnd() < dt * 1.3 && k.hopT <= 0) k.hopT = .35;       // bé nhảy tưng tưng chọc mụ
      if (k.hopT > 0) { k.hopT -= dt; k.hop = Math.sin(clamp(1 - k.hopT / .35, 0, 1) * Math.PI) * 11; } else k.hop = 0;
    }
    if (tg) {                                                                                                    // chạm bé
      const dx = (tg.x - H.x) / 48, dy = (tg.y - H.y) / 18;
      if (dx * dx + dy * dy < 1 && !hold) {
        if (late) { grabK = tg; tg.state = "grab"; tg.x0 = tg.x; tg.y0 = tg.y; H.face = tg.x >= H.x ? 1 : -1; H.vx = H.vy = 0; go("grab"); }
        else if (tg.cool <= 0) { tg.cool = 1.2; tg.hopT = .35; const d = hyp(tg.x - H.x, tg.y - H.y) || 1; tg.vx += (tg.x - H.x) / d * 170; tg.vy += (tg.y - H.y) / d * 120; H.lunge = 1; }   // suýt bắt: bé nhảy tránh
      }
    }
  }

  function step(dt) {
    T += dt; pt += dt; stepParts(dt);
    if (ph === "chase") { chaseStep(dt); return; }
    const H = HAG, k = grabK;
    H.mv = lerp(H.mv, 0, Math.min(1, dt * 8)); H.ph += dt * 1.4; H.frown = lerp(H.frown, 0, Math.min(1, dt * 12)); H.scr = lerp(H.scr, 0, Math.min(1, dt * 12));
    kids.forEach(o => { if (o.state === "run") { o.mv = lerp(o.mv, 0, Math.min(1, dt * 6)); o.ph += dt * 3; o.vx = o.vy = 0; o.hop = 0; } });         // bé đứng sững khi cảnh nuốt diễn ra
    if (ph === "grab") {                                                                                         // nhấc bé tới miệng, hàm bắt đầu mở
      const e = ease(Math.min(1, pt / .6)), m = mouthPt(); H.jaw = e;
      k.x = lerp(k.x0, m.x, e); k.y = lerp(k.y0, m.y + KH * .5, e); k.rot = Math.sin(pt * 26) * .12 * e; k.mv = 1;
      if (pt >= .6) go("swallow");
    } else if (ph === "swallow") {                                                                               // bé bị hút vào khoang miệng
      const e = ease(Math.min(1, pt / .55)), m = mouthPt(); H.jaw = 1; k.x = lerp(m.x, m.x - H.face * 5 * HU, e); k.y = lerp(m.y + KH * .5, m.y + KH * .12, e); k.sc = 1 - .85 * e; k.rot = Math.sin(pt * 30) * .2; k.a = 1 - .6 * e;
      if (pt >= .55) { kids = kids.filter(o => o !== k); grabK = null; H.belly = 1; spray(); go("shut"); }
    } else if (ph === "shut") {                                                                                  // ngậm hàm, bụng phình, máu văng
      H.jaw = Math.max(0, 1 - pt / .22); H.belly = Math.max(0, 1 - pt / .7); if (pt >= .5) go("stun");
    } else if (ph === "stun") {                                                                                  // mụ đứng no nê, nhỏ máu
      H.jaw = 0; if (rnd() < dt * 5) { const m = mouthPt(); parts.push({ k: "blood", x: m.x, y: m.y + 8, vx: H.face * 8, vy: 20, s: U, c: pick(REDS), gy: H.y + 4 }); }
      if (pt >= 1.4) { WAT.on = true; WAT.gl = 1; WAT.a = 1; WAT.lean = 0; WAT.face = H.x < W / 2 ? -1 : 1;
        placeWatcher(); fxBurst(false); go("rin"); }
    } else if (ph === "rin") {                                                                                   // Người Nhiễu hiện ra trong nhiễu kỹ thuật số
      WAT.gl = Math.max(0, 1 - pt / .9); WAT.a = 1;
      if (pt >= .9) { WAT.gl = 0; flyK = mkKid(rnd() < .5 ? "girl" : "boy"); flyK.state = "lev"; flyK.a = 0; flyK.face = -WAT.face; flyK.x = WAT.x + WAT.face * -14; flyK.y = WAT.y; flyK.z = WH * .55; kids.push(flyK); go("lev"); }
    } else if (ph === "lev") {                                                                                   // bé lơ lửng trong nhiễu, Người Nhiễu ngả người ra sau
      const e = Math.min(1, pt / .8); WAT.lean = -.14 * ease(e) * -WAT.face * -1; flyK.a = Math.min(1, pt * 3); flyK.z = WH * .55 + Math.sin(pt * 9) * 3 + e * 8; flyK.rot = Math.sin(pt * 6) * .15;
      if (pt >= .8) { land = freePoint(120, H); flyK.x0 = flyK.x; flyK.y0 = flyK.y; flyK.z0 = flyK.z; flyK.state = "fly"; go("throw"); }
    } else if (ph === "throw") {                                                                                 // vung tay ném, bé bay theo vòng cung rồi tiếp đất
      const u = Math.min(1, pt / .95), e = u; WAT.lean = lerp(WAT.lean, .16 * -WAT.face * -1, Math.min(1, dt * 14));
      flyK.x = lerp(flyK.x0, land.x, e); flyK.y = lerp(flyK.y0, land.y, e); flyK.z = lerp(flyK.z0, 0, e) + Math.sin(Math.PI * e) * 95; flyK.rot = e * TAU * 2 * (flyK.x0 < land.x ? 1 : -1); flyK.face = land.x > flyK.x0 ? 1 : -1;
      if (u >= 1) { flyK.state = "run"; flyK.rot = 0; flyK.z = 0; flyK.sq = .35; flyK.face = 1; dust(flyK.x, flyK.y, 12, ["#d9d2e0", "#7a6a88", thread]); go("watch"); }
    } else if (ph === "watch") {
      WAT.lean = lerp(WAT.lean, 0, Math.min(1, dt * 6)); if (flyK) flyK.sq = Math.max(0, flyK.sq - dt * 1.4);
      if (pt >= .7) { fxBurst(true); go("rout"); }
    } else if (ph === "rout") {                                                                                  // nhiễu và biến mất
      WAT.gl = Math.min(1, pt / .5); WAT.a = Math.max(0, 1 - Math.max(0, pt - .35) / .5);
      if (pt >= .85) { WAT.on = false; fadeStain = true; ct = 0; targetType = targetType === "girl" ? "boy" : "girl"; flyK = null; kids.forEach(o => { o.state = "run"; o.a = 1; o.sc = 1; o.rot = 0; o.z = 0; }); go("chase"); }
    }
    kids.forEach(o => { if (o.sq > 0 && o !== flyK) o.sq = Math.max(0, o.sq - dt * 1.4); });
  }

  /* ==========================================================================
     VẼ KHUNG HÌNH
     ========================================================================== */
  function draw() {
    g.clearRect(0, 0, W, Hh); drawStain();
    const list = [];
    list.push({ y: HAG.y, f: () => { shadow(snap(HAG.x), snap(HAG.y), 54, 1); drawHag(HAG); } });
    kids.forEach(k => { if (k.state === "grab" || k.state === "swallow") return; list.push({ y: k.y, f: () => { shadow(snap(k.x), snap(k.y), 13 * k.sc, k.z > 4 ? .5 : 1); drawKid(k); if (k.state === "lev") noiseAround(k); } }); });
    if (WAT.on) list.push({ y: WAT.y, f: () => { shadow(snap(WAT.x), snap(WAT.y), 16, WAT.a); drawWatcher(WAT); } });
    list.sort((a, b) => a.y - b.y).forEach(o => o.f());
    if (grabK) drawKid(grabK);                                                                                    // bé đang bị nhấc: vẽ đè lên mặt mụ
    drawParts();
    if ((ph === "rin" || ph === "rout") && WAT.gl > .05) for (let i = 0; i < 4; i++) if (rnd() < .6) { g.fillStyle = rnd() < .5 ? "rgba(24,240,232,.2)" : "rgba(255,59,87,.18)"; g.fillRect(0, rnd() * Hh, W, U * (1 + (rnd() * 2 | 0))); }
  }
  function noiseAround(k) { for (let i = 0; i < 8; i++) { g.fillStyle = pick(["#ffffff", "#18f0e8", "#ff3b57", accC]); g.globalAlpha = .8; g.fillRect(k.x + (rnd() - .5) * 46, k.y - k.z - rnd() * KH, U * (1 + (rnd() * 3 | 0)), U); } g.globalAlpha = 1; }

  /* ==========================================================================
     GIỮ CHUỘT / NGÓN TAY ĐỂ CHẶN MỤ NHỆN
     ========================================================================== */
  const overHag = e => {
    const b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    if (x < 0 || y < 0 || x > b.width || y > b.height) return false;
    if (hyp(x - av.x, y - av.y) < av.r - 6) return false;                          // bấm vào avatar thì không tính
    return Math.abs(x - HAG.x) < 74 && y > HAG.y - 62 && y < HAG.y + 14;
  };
  const SKIP = "button,a,input,select,textarea,#np,#modal,#player,.top";
  addEventListener("pointerdown", e => {
    if (ph !== "chase" || (e.target.closest && e.target.closest(SKIP)) || !overHag(e)) return;
    held = true; hero.style.cursor = "grabbing"; if (e.cancelable) e.preventDefault();
  });
  const release = () => { held = false; hero.style.cursor = ""; };
  addEventListener("pointerup", release); addEventListener("pointercancel", release); addEventListener("blur", release);
  addEventListener("contextmenu", e => { if (held) e.preventDefault(); });
  addEventListener("pointermove", e => { if (!held && e.pointerType === "mouse") hero.style.cursor = ph === "chase" && overHag(e) ? "grab" : ""; }, { passive: true });
  hero.style.userSelect = "none"; hero.style.webkitUserSelect = "none"; hero.style.webkitTouchCallout = "none";

  /* ==========================================================================
     KHỞI ĐỘNG
     ========================================================================== */
  layout(); reset();
  addEventListener("load", layout); new ResizeObserver(layout).observe(hero);
  window.SLENDER = { phase: () => ph, hag: () => ({ x: HAG.x, y: HAG.y, held }) };      // dùng khi kiểm thử
  if (RM) { draw(); return; }
  let last = 0, on = true;
  const loop = t => { if (!on) return; const dt = Math.min(.05, (t - last) / 1000 || .016); last = t; step(dt); draw(); requestAnimationFrame(loop); };
  new IntersectionObserver(es => { const v = es[0].isIntersecting; if (v && !on) { on = true; last = performance.now(); requestAnimationFrame(loop); } on = v; }).observe(cv);
  requestAnimationFrame(loop);
})();
