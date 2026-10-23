/* ==========================================================================
   AVATAR.JS — avatar ảnh / video (tối đa 4) + vòng đếm giờ + tan thành mảnh vải khi đổi
   Cấu hình trong config.js:  avatar: { dir:"icon/", list:["ava","ava2",{name:"ava3", focus:"50% 20%"}], seconds:15, focus:"50% 30%" }
   (file nằm trong thư mục icon/ — CONFIG.iconBase).
   • Video được CHIẾU thẳng trong khuôn tròn avatar: video chạy ẩn, từng khung hình vẽ vào khuôn (tự lặp, tắt tiếng) nên không bao giờ hiện
     ô xem video / nút toàn màn hình, kể cả trong trình duyệt điện thoại không cho phát inline.
   • focus = điểm của khung hình được giữ ở giữa khuôn: "x% y%". Mặc định "50% 30%" (lấy phần trên khung hình
     nơi thường có mặt người). Nếu không khai báo focus và trình duyệt hỗ trợ dò mặt (FaceDetector) thì tự canh theo mặt.
   ========================================================================== */
"use strict";
(function () {
  const av = document.getElementById("avatar"), ring = av && av.parentNode; if (!av) return;
  /* hỗ trợ: avatar:{ dir, list:["ava",{name:"ava2",seconds:25,focus:"50% 20%"}], seconds, focus } | avatars:[...] + avatarSeconds | avatar:"ten" */
  const A = CONFIG.avatar, cfg = A && typeof A === "object" ? A : { list: CONFIG.avatars || [A], seconds: CONFIG.avatarSeconds };
  const list = (cfg.list || []).filter(Boolean).slice(0, 4).map(x => typeof x === "string" ? { name: x } : x);
  if (!list.length) return;
  const DIR = cfg.dir || CONFIG.iconBase, SEC = cfg.seconds || 12, rnd = Math.random, FOCUS = cfg.focus || "50% 30%";
  let SEEK = false; try { SEEK = localStorage.getItem("hd-av-seek") === "1"; } catch (e) {}
  const isVid = u => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(u);
  /* không ghi đuôi file → tự dò .mp4 .png .jpg .jpeg .webp */
  const urls = n => (/\.\w{3,4}$/.test(n) || isAbs(n) ? [n] : [".mp4", ".png", ".jpg", ".jpeg", ".webp"].map(e => n + e)).map(f => asset(f, DIR));

  /* "x% y%" → [0..1, 0..1] */
  const parseFocus = s => { const m = String(s || "").match(/(-?[\d.]+)%?\s+(-?[\d.]+)%?/); return m ? [Math.min(1, Math.max(0, m[1] / 100)), Math.min(1, Math.max(0, m[2] / 100))] : [.5, .3]; };
  const setFocus = (m, f) => { m._f = f; m.style.objectPosition = f[0] * 100 + "% " + f[1] * 100 + "%"; };

  async function load(item) {
    for (const u of urls(item.name)) { const m = await loadOne(u); if (m) { m._item = item; return m; } }
    return null;
  }
  function loadOne(u) {
    return new Promise(res => {
      if (isVid(u)) {
        /* video chạy ẨN (ngoài màn hình), từng khung hình được vẽ vào <canvas> trong khuôn avatar → không bao giờ hiện ô xem video / nút toàn màn hình */
        const v = document.createElement("video");
        v.muted = v.loop = v.playsInline = true; v.controls = false; v.disablePictureInPicture = true; v.preload = "auto";
        ["muted", "playsinline", "webkit-playsinline", "disablepictureinpicture", "disableremoteplayback"].forEach(a => v.setAttribute(a, ""));
        v.setAttribute("x-webkit-airplay", "deny"); v.tabIndex = -1;
        v.style.cssText = "position:fixed;left:-8px;top:-8px;width:2px;height:2px;opacity:0;pointer-events:none";
        document.body.appendChild(v);
        const c = document.createElement("canvas"); c.width = c.height = 340; c._v = v; c._ctx = c.getContext("2d"); c._seek = SEEK;
        let done = false;
        const ok = () => { if (!done) { done = true; res(c); } }, bad = () => { if (!done) { done = true; v.remove(); res(null); } };
        /* trình duyệt không cho phát inline (bật toàn màn hình) → thoát ngay, chuyển sang chế độ tua từng khung, nhớ cho lần sau */
        const toSeek = () => { SEEK = true; c._seek = true; try { localStorage.setItem("hd-av-seek", "1"); } catch (e) {} try { v.pause(); if (v.webkitExitFullscreen) v.webkitExitFullscreen(); } catch (e) {} };
        v.addEventListener("webkitbeginfullscreen", () => { try { v.webkitExitFullscreen(); } catch (e) {} toSeek(); });
        v.addEventListener("webkitendfullscreen", () => { if (c._seek) try { v.pause(); } catch (e) {} });
        v.addEventListener("loadeddata", ok); v.addEventListener("canplay", ok); v.addEventListener("loadedmetadata", () => setTimeout(ok, 800)); v.onerror = bad;
        v.src = u;
        if (!SEEK) {
          const p = v.play(); if (p && p.catch) p.catch(() => {});
          setTimeout(() => { if (v.webkitDisplayingFullscreen) toSeek(); }, 350);
          setTimeout(() => { if (!c._seek && v.paused) c._seek = true; }, 1600);          // bị chặn tự phát → tua từng khung
        }
      } else { const i = new Image(); i.alt = ""; i.draggable = false; i.onload = () => res(i); i.onerror = () => res(null); i.src = u; }
    });
  }
  const sizeOf = m => { const e = m._v || m; return e.videoWidth ? [e.videoWidth, e.videoHeight] : [e.naturalWidth, e.naturalHeight]; };

  /* tự canh theo khuôn mặt (nếu trình duyệt hỗ trợ và chưa khai báo focus) */
  async function autoFocus(m) {
    if (!("FaceDetector" in window) || (m._item && m._item.focus) || cfg.focus) return;
    try {
      const [w, h] = sizeOf(m); if (!w || !h) return;
      const f = (await new FaceDetector({ fastMode: true, maxDetectedFaces: 1 }).detect(m._v || m))[0]; if (!f) return;
      const b = f.boundingBox, s = Math.min(w, h), pos = (c, len) => len > s ? Math.min(1, Math.max(0, ((c / s) - .5) / (len / s - 1))) : .5;
      setFocus(m, [pos(b.x + b.width / 2, w), pos(b.y + b.height / 2, h)]);
    } catch (e) { /* không hỗ trợ → giữ focus mặc định */ }
  }

  /* lấy màu thật của avatar (lưới 48×48, đúng vùng đang hiển thị trong khuôn) để mảnh vải mang đúng màu ảnh */
  function sampler(m) {
    try {
      const N = 48, c = document.createElement("canvas"); c.width = c.height = N; const x = c.getContext("2d"), [w, h] = sizeOf(m), s = Math.min(w, h), f = m._f || [.5, .5];
      x.drawImage(m._v || m, (w - s) * f[0], (h - s) * f[1], s, s, 0, 0, N, N); const d = x.getImageData(0, 0, N, N).data;
      return (u, v) => { const i = ((v * N | 0) * N + (u * N | 0)) * 4; return `rgb(${d[i] & 240 | 8},${d[i + 1] & 240 | 8},${d[i + 2] & 240 | 8})`; };
    } catch (e) { return null; }
  }
  const onScreen = () => { const b = av.getBoundingClientRect(); return b.bottom > 0 && b.top < innerHeight && window.FX && !FX.RM; };
  const wave = (out, m) => new Promise(res => {
    if (!onScreen()) return res();
    FX.burst({ el: av, follow: true, disc: true, out, n: 1500, size: 3, sample: sampler(m) || null, cols: FX.palette(), dur: 1.1, alpha: 1, cb: res });
  });

  /* vòng đếm giờ quanh avatar */
  ring.insertAdjacentHTML("beforeend", '<svg class="tmr" viewBox="0 0 220 220" aria-hidden="true"><circle class="t0" cx="110" cy="110" r="84"/><circle class="t1" cx="110" cy="110" r="84" pathLength="1"/></svg>');
  const fg = ring.querySelector(".t1"); let anim, cur = null, idx = -1, busy = false;
  function timer() { if (anim) anim.cancel(); if (list.length < 2) { ring.querySelector(".tmr").style.display = "none"; return; }
    anim = fg.animate([{ strokeDashoffset: 0 }, { strokeDashoffset: 1 }], { duration: (list[idx] && list[idx].seconds || SEC) * 1000, easing: "linear", fill: "forwards" }); anim.onfinish = rotate; }

  function put(m) {
    setFocus(m, parseFocus(m._item && m._item.focus || FOCUS));
    m.style.opacity = 0; av.textContent = "";
    if (cur && cur._v && cur !== m) { try { cur._v.pause(); cur._v.remove(); } catch (e) {} }
    av.appendChild(m); cur = m; autoFocus(m);
  }
  async function rotate() {
    if (busy) return; busy = true;
    let n; do { n = rnd() * list.length | 0; } while (n === idx && list.length > 1);
    const m = await load(list[n]);                           // tải trước, tải xong mới tan
    if (!m) { idx = n; timer(); busy = false; return; }
    if (cur) { const old = cur; await wave(true, old).then(() => {}); }   // mảnh vải tan ra 2 bên
    if (cur) cur.style.opacity = 0;
    put(m); idx = n; m.style.transition = "opacity .5s"; requestAnimationFrame(() => { setTimeout(() => m.style.opacity = 1, 700); });
    await wave(false, m); timer(); busy = false;             // mảnh vải ghép lại thành avatar mới
  }

  /* vẽ từng khung hình của video ẩn vào canvas trong khuôn avatar (cắt vuông theo focus) */
  const pump = () => {
    const c = cur;
    if (c && c._v && !document.hidden) { const v = c._v, w = v.videoWidth, h = v.videoHeight;
      if (w && v.readyState >= 2) { const s = Math.min(w, h), f = c._f || [.5, .3]; try { c._ctx.drawImage(v, (w - s) * f[0], (h - s) * f[1], s, s, 0, 0, c.width, c.height); } catch (e) {} } }
    requestAnimationFrame(pump);
  };
  requestAnimationFrame(pump);
  /* chế độ tua: không gọi play() (nên không bao giờ bật toàn màn hình), cứ ~0.1s tua tới 1 khung */
  setInterval(() => { const c = cur; if (c && c._seek && c._v && c._v.duration > 0 && !c._v.seeking && !document.hidden) { const v = c._v; try { v.pause(); v.currentTime = (v.currentTime + .1) % v.duration; } catch (e) {} } }, 100);
  /* trình duyệt chặn tự phát: chạm lần đầu / quay lại tab thì thử phát tiếp (chỉ khi KHÔNG ở chế độ tua) */
  const kick = () => { const c = cur; if (c && c._v && !c._seek && c._v.paused) { const p = c._v.play(); if (p && p.catch) p.catch(() => {}); } };
  addEventListener("pointerdown", kick, { passive: true }); document.addEventListener("visibilitychange", kick);

  (async function init() {
    for (let i = 0; i < list.length; i++) { const m = await load(list[i]); if (m) { idx = i; put(m); m.style.opacity = 1; break; } }
    timer();
  })();
})();
