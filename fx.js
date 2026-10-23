/* ==========================================================================
   FX.JS
   1) Avatar (avatar.js gọi FX.burst): giữ hiệu ứng cũ — tan thành mảnh vải nỉ rồi ghép lại.
   2) Cuộn trang: khối nội dung trượt vào từ GÓC DƯỚI-TRÁI như "kính lỏng" (liquid glass): mờ nhoè → nét dần,
      giọt kính loang ra từ bên trái, nảy nhẹ rồi lắng. Cuộn lên: khối trượt ngược về bên trái và biến mất
      — chỉ xảy ra ở mép dưới màn hình nên không che tầm nhìn; cuộn tới đâu hiện tới đó.
      Dùng Web Animations (transform / filter / clip-path), xong là gỡ hẳn → không đổi bố cục, nút bấm, hover.
   Tôn trọng prefers-reduced-motion (tắt hiệu ứng, chỉ hiện / ẩn thường).
   ========================================================================== */
"use strict";
(function () {
  const RM = matchMedia("(prefers-reduced-motion:reduce)").matches, rnd = Math.random;
  const css = (n, d) => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || d || "#ff7ab8";
  const palette = () => [css("--acc"), css("--acc-3"), "#ffffff", css("--tint")];
  const felt = () => [css("--card-1"), css("--card-1"), css("--card-1"), css("--card-2"), css("--acc"), css("--acc-3"), css("--thread", "#ffd36b")];
  const pick = a => a[rnd() * a.length | 0];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const MAX = 520;                                    // tối đa số mảnh cùng lúc

  if (RM) {                                           // giảm chuyển động: chỉ hiện/ẩn thường
    window.FX = { burst(o) { if (o && o.cb) o.cb(); }, palette, RM };
    window.pxReveal = e => e.target.classList.toggle("in", e.intersectionRatio >= .14);
    return;
  }

  const cv = document.createElement("canvas"); cv.id = "pix"; document.body.appendChild(cv);
  const g = cv.getContext("2d"), P = []; let run = false, last = 0, W = 0, H = 0;
  const fit = () => { const d = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; g.setTransform(d, 0, 0, d, 0, 0); };
  fit(); addEventListener("resize", fit);
  const easeOut = t => 1 - Math.pow(1 - t, 3), easeIn = t => t * t;

  /* ---------- hình mảnh ghép: ô vuông đơn vị (-.5..+.5) có khớp lồi/lõm ở 4 cạnh ----------
     tabs = [trên, phải, dưới, trái]; +1 lồi ra, -1 lõm vào, 0 phẳng. Cache theo tổ hợp. */
  const PATHS = new Map();
  function pathFor(tabs) {
    const key = tabs.join(); let p = PATHS.get(key); if (p) return p;
    p = new Path2D(); const R = .17;
    const rot = (x, y, k) => k === 0 ? [x, y] : k === 1 ? [-y, x] : k === 2 ? [-x, -y] : [y, -x];
    for (let k = 0; k < 4; k++) {
      const th = k * Math.PI / 2, tb = tabs[k], s = rot(-.5, -.5, k), e = rot(.5, -.5, k);
      if (k === 0) p.moveTo(s[0], s[1]); else p.lineTo(s[0], s[1]);
      if (tb) { const a = rot(-R, -.5, k), c = rot(0, -.5, k); p.lineTo(a[0], a[1]); p.arc(c[0], c[1], R, Math.PI + th, th, tb < 0); }
      p.lineTo(e[0], e[1]);
    }
    p.closePath(); PATHS.set(key, p); return p;
  }
  const hash = (i, j, k, s) => { let h = (Math.imul(i + 11, 374761393) + Math.imul(j + 17, 668265263) + Math.imul(k + 3, 69069) + s) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) & 1) ? 1 : -1; };

  const mkP = o => Object.assign({ el: null, u: 0, v: 0, tx: 0, ty: 0, sx: 20, sy: 20, path: null, c: "#fff", th: "#ffd36b", st: false, btn: false, out: false,
    t: 0, dur: 1, dx: 0, dy: 0, r0: 0, a: 1, ph: rnd() * 6.28, grp: null }, o);

  /* hướng bay: ghép = bay từ mọi hướng vào;  tan = dạt về lề trái / phải gần nhất */
  function fling(p) {
    if (p.out) {
      const side = p.tx < W / 2 ? -1 : 1, dist = (side < 0 ? p.tx : W - p.tx) + 40;
      p.dx = side * dist * (.35 + rnd() * .65); p.dy = (rnd() - .5) * 80 + 30; p.r0 = side * (1 + rnd() * 3);
    } else {
      const a = rnd() * 6.283, d = 160 + rnd() * Math.max(W, H) * .5;
      p.dx = Math.cos(a) * d; p.dy = Math.sin(a) * d; p.r0 = (rnd() - .5) * 6;
    }
  }
  const start = () => { if (!run) { run = true; last = performance.now(); requestAnimationFrame(tick); } };

  /* o = { el, follow, rect:{l,t,w,h}, out, disc, sample(u,v), cols, cell, alpha, dur, cb } */
  function burst(o) {
    if (!o || !o.disc || !o.el) { if (o && o.cb) o.cb(); return; }                 // chỉ khung avatar dùng hiệu ứng mảnh vải
    const r = o.rect || (() => { const b = o.el.getBoundingClientRect(); return { l: b.left, t: b.top, w: b.width, h: b.height }; })();
    if (r.w < 4 || r.h < 4) { if (o.cb) o.cb(); return; }
    let cell = o.cell || (o.disc ? r.w / 7 : Math.sqrt(r.w * r.h / 64));
    cell = Math.max(o.cell ? 8 : o.disc ? 12 : 28, cell);
    let cols, rows; const grid = () => { cols = Math.max(1, Math.round(r.w / cell)); rows = Math.max(1, Math.round(r.h / cell)); };
    grid(); while (cols * rows > 130) { cell *= 1.15; grid(); }
    const cw = r.w / cols, ch = r.h / rows, seed = rnd() * 1e6 | 0, ccols = o.cols || felt(), th = css("--thread", "#ffd36b");
    const eb = o.follow && o.el ? o.el.getBoundingClientRect() : null;
    const has = (i, j) => { if (i < 0 || j < 0 || i >= cols || j >= rows) return false; if (!o.disc) return true; const dx = (i + .5) / cols - .5, dy = (j + .5) / rows - .5; return dx * dx + dy * dy <= .22; };
    const list = [], grp = { n: 0, cb: o.cb };
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      if (!has(i, j)) continue;
      const cx = r.l + (i + .5) * cw, cy = r.t + (j + .5) * ch;
      const tabs = [has(i, j - 1) ? -hash(i, j - 1, 1, seed) : 0, has(i + 1, j) ? hash(i, j, 0, seed) : 0, has(i, j + 1) ? hash(i, j, 1, seed) : 0, has(i - 1, j) ? -hash(i - 1, j, 0, seed) : 0];
      const c = o.sample ? o.sample(clamp((i + .5) / cols, 0, .999), clamp((j + .5) / rows, 0, .999)) : pick(ccols);
      const p = mkP({ el: eb ? o.el : null, u: eb ? (cx - eb.left) / eb.width : 0, v: eb ? (cy - eb.top) / eb.height : 0, tx: cx, ty: cy, sx: cw * 1.03, sy: ch * 1.03,
        path: pathFor(tabs), c, th, st: Math.min(cw, ch) >= 17, out: !!o.out, grp,
        t: o.out ? -(rnd() * .3 + j / rows * .1) : -(rnd() * .3 + j / rows * .22), dur: (o.dur || 1) * (.6 + rnd() * .25), a: o.alpha || 1 });
      fling(p); list.push(p);
    }
    if (P.length + list.length > MAX) list.length = Math.max(0, MAX - P.length);
    if (!list.length) { if (o.cb) o.cb(); return; }
    grp.n = list.length; list.forEach(p => P.push(p));
    /* avatar tan ra: ẩn ảnh cũ để các mảnh được "bóc" khỏi vòng tròn (avatar.js tự thay ảnh mới sau đó) */
    if (o.out && o.disc && o.el) [...o.el.children].forEach(c => c.style.visibility = "hidden");
    start();
  }

  function drawPiece(p, x, y, rot, sc, a, stitch) {
    const sx = p.sx * sc, sy = p.sy * sc;
    g.globalAlpha = a * .35; g.save(); g.translate(x + 2.5, y + 3.5); g.rotate(rot); g.scale(sx, sy); g.fillStyle = "#000"; g.fill(p.path); g.restore();   // bóng đổ gắt
    g.globalAlpha = a; g.save(); g.translate(x, y); g.rotate(rot); g.scale(sx, sy);
    g.fillStyle = p.c; g.fill(p.path);
    g.lineWidth = 1 / Math.min(sx, sy); g.strokeStyle = "rgba(0,0,0,.4)"; g.stroke(p.path);                                                          // vết cắt
    if (p.st && stitch > .02) {                                                                                                                       // đường chỉ khâu hiện dần
      const k = Math.min(sx, sy) * .8; g.globalAlpha = a * stitch; g.scale(.8, .8); g.setLineDash([4 / k, 3 / k]); g.lineWidth = 1.6 / k; g.strokeStyle = p.th; g.stroke(p.path);
    }
    g.restore();
  }
  function drawBtn(p, x, y, rot, sc, a) {
    const s = p.sx * sc;
    g.globalAlpha = a * .35; g.fillStyle = "#000"; g.beginPath(); g.arc(x + 2, y + 3, s / 2, 0, 6.283); g.fill();
    g.globalAlpha = a; g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
    g.fillStyle = p.c; g.beginPath(); g.arc(0, 0, .5, 0, 6.283); g.fill();
    g.lineWidth = .05; g.strokeStyle = "rgba(0,0,0,.35)"; g.beginPath(); g.arc(0, 0, .36, 0, 6.283); g.stroke();
    g.strokeStyle = p.th; g.lineWidth = .045; g.beginPath(); g.moveTo(-.12, -.12); g.lineTo(.12, .12); g.moveTo(.12, -.12); g.lineTo(-.12, .12); g.stroke();   // chỉ xỏ chéo
    g.fillStyle = "rgba(0,0,0,.65)"; for (const [hx, hy] of [[-.12, -.12], [.12, -.12], [-.12, .12], [.12, .12]]) { g.beginPath(); g.arc(hx, hy, .055, 0, 6.283); g.fill(); }
    g.restore();
  }

  function tick(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now; g.clearRect(0, 0, W, H);
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i]; p.t += dt;
      let k;
      if (p.t < 0) { if (!p.out) continue; k = 0; } else k = p.t / p.dur;       // khối đang tan thì mảnh chờ vẫn nằm yên tại chỗ
      if (k >= 1 || (p.el && !p.el.isConnected)) { P[i] = P[P.length - 1]; P.pop(); if (--p.grp.n === 0 && p.grp.cb) p.grp.cb(); continue; }
      let x = p.tx, y = p.ty;
      if (p.el) { const b = p.el.getBoundingClientRect(); x = b.left + p.u * b.width; y = b.top + p.v * b.height; }   // bám theo khi trang đang cuộn
      let rot, sc, a = p.a, stitch;
      if (p.out) {
        const e = easeIn(k); x += p.dx * e; y += p.dy * e + Math.sin(k * 9 + p.ph) * 5 * k;
        rot = p.r0 * e; sc = 1 - .15 * e; a *= 1 - k * k; stitch = 1 - Math.min(1, k * 4);                         // tháo chỉ rồi rã ra
      } else {
        const e = easeOut(k); x += p.dx * (1 - e); y += p.dy * (1 - e);
        rot = p.r0 * (1 - e); sc = .55 + .45 * e; if (k > .7) sc *= 1 + .08 * Math.sin(Math.PI * (k - .7) / .3);   // khớp vào lưới có nảy nhẹ
        a *= k < .15 ? k / .15 : k > .85 ? (1 - k) / .15 : 1; stitch = clamp((k - .5) / .3, 0, 1);                 // khớp xong mới khâu chỉ
      }
      if (p.btn) drawBtn(p, x, y, rot, sc, a); else drawPiece(p, x, y, rot, sc, a, stitch);
    }
    g.globalAlpha = 1;
    if (P.length) requestAnimationFrame(tick); else { run = false; g.clearRect(0, 0, W, H); }
  }

  /* ---------- cuộn trang: kính lỏng trượt vào từ dưới-trái / trượt về trái khi cuộn lên ---------- */
  const GLASS = [
    { opacity: 0, transform: "translate3d(-24%,44px,0) scale(.84,.9)", filter: "blur(14px) saturate(1.9) brightness(1.3)", clipPath: "inset(-40px 64% -40px -40px round 56px)",
      boxShadow: "inset 0 1.5px 0 rgba(255,255,255,.9), inset 0 -12px 26px rgba(255,255,255,.2), 0 22px 44px rgba(0,0,0,.3)", offset: 0, easing: "cubic-bezier(.2,.85,.25,1)" },
    { opacity: 1, transform: "translate3d(1.4%,-5px,0) scale(1.018,1.01)", filter: "blur(1.5px) saturate(1.3) brightness(1.08)", clipPath: "inset(-40px -40px -40px -40px round 30px)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,.55), inset 0 -6px 16px rgba(255,255,255,.1), 0 14px 30px rgba(0,0,0,.3)", offset: .58, easing: "cubic-bezier(.3,.7,.3,1)" },
    { opacity: 1, transform: "translate3d(0,0,0) scale(1,1)", filter: "blur(0px) saturate(1) brightness(1)", clipPath: "inset(-40px -40px -40px -40px round 0px)", offset: 1 }
  ];
  const DUR = 950; let bT = 0, bN = 0;
  function glass(el, show, delay) {
    let a = el._gl;
    if (a && a.playState !== "finished") {                      // đang chạy dở → đảo chiều ngay tại chỗ, không giật
      a.playbackRate = show ? Math.abs(a.playbackRate) : -Math.abs(a.playbackRate); a.play(); return;
    }
    if (a) { a.cancel(); el._gl = null; }
    a = el.animate(GLASS, { duration: DUR, fill: "both", delay: show ? delay : 0, easing: "linear" }); el._gl = a;
    if (!show) { a.pause(); a.currentTime = DUR; a.playbackRate = -1; a.play(); }
    const done = () => { if (el._gl === a) { a.cancel(); el._gl = null; } };
    a.onfinish = done;
  }
  window.pxReveal = e => {
    const el = e.target, c = el.classList, quiet = performance.now() - (window.pxQuiet || 0) < 450, can = !!el.animate;
    if (e.intersectionRatio >= .14 && !c.contains("in")) {
      c.remove("out"); c.add("in"); c.toggle("q", quiet || !can);
      if (!quiet && can) { const n = performance.now(); if (n - bT > 60) bN = 0; bT = n; glass(el, true, Math.min(bN++, 4) * 70); }
    } else if (e.intersectionRatio < .14 && c.contains("in") && e.boundingClientRect.top > H * .4) {
      c.remove("in"); c.add("out"); if (can) glass(el, false, 0);
    }
  };

  window.FX = { burst, palette, RM };
})();
