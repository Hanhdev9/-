/* ==========================================================================
   APP.JS — logic của trang. Nội dung sửa ở config.js, màu sửa ở theme.css.
   ========================================================================== */
"use strict";

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const root = document.documentElement;
const esc = s => String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const norm = t => String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d");
const rnd = Math.random;

/* ---------- icon vẽ bằng path ---------- */
const P={eye:"M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 100 6 3 3 0 000-6",refresh:"M20 11a8 8 0 00-14-4M4 4v4h4M4 13a8 8 0 0014 4M20 20v-4h-4",phone:"M7 2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2zM11 18h2",rss:"M5 5a14 14 0 0114 14M5 11a8 8 0 018 8M6 18h.01",bell:"M6 8a6 6 0 0112 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 004 0",heart:"M12 21s-8-5-8-11a5 5 0 019-3 5 5 0 019 3c0 6-10 11-10 11z",bolt:"M13 2L4 14h7l-1 8 9-12h-7z",search:"M11 4a7 7 0 100 14 7 7 0 000-14M20 20l-4-4",sliders:"M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M14 4v4M8 10v4M16 16v4",sort:"M4 6h9M4 12h6M4 18h3M17 4v16M14 17l3 3 3-3",moon:"M21 13A9 9 0 1111 3a7 7 0 0010 10z",pad:"M6 8h12a4 4 0 014 4v2a3 3 0 01-5 2l-1-2H8l-1 2a3 3 0 01-5-2v-2a4 4 0 014-4zM8 10v4M6 12h4M16 11h.01M18 13h.01",down:"M12 4v14M6 13l6 6 6-6",right:"M5 12h14M13 6l6 6-6 6",chev:"M9 6l6 6-6 6",cloud:"M7 18a5 5 0 01-.5-10 6 6 0 0111.5 1.5A4 4 0 0117 18M12 11v8M9 16l3 3 3-3",ext:"M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5",apple:"M12 7c1-2 3-2 3-2s0 2-2 3M8 9c-3 0-4 3-3 6s2 5 4 5c1 0 1-.5 3-.5s2 .5 3 .5c2 0 3-2 4-4-3-1-3-5 0-6-1-1-2-2-4-2-1 0-2 .5-3 .5S9 9 8 9z",shield:"M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",user:"M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8",cam:"M3 7h12v10H3zM15 11l6-3v8l-6-3",menu:"M4 7h16M4 12h16M4 17h16",note:"M9 18V5l11-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zM20 16a3 3 0 11-6 0 3 3 0 016 0z",x:"M6 6l12 12M18 6L6 18",win:"M3 5l8-1v8H3zM13 4l8-1v9h-8zM3 14h8v7l-8-1zM13 14h8v7l-8-1z",pin:"M12 21s7-6 7-12a7 7 0 10-14 0c0 6 7 12 7 12zM12 11a2 2 0 100-4 2 2 0 000 4",yt:"M3 7a3 3 0 013-3h12a3 3 0 013 3v10a3 3 0 01-3 3H6a3 3 0 01-3-3zM10 9l5 3-5 3z",send:"M21 3L3 11l7 2 2 7 3-5 5 4z",chat:"M4 5h16v11H9l-5 4zM9 10h.01M15 10h.01",play:"M7 4l13 8-13 8z",pause:"M7 5h3v14H7zM14 5h3v14h-3z",
palette:"M13.5 6.5h.01M17.5 10.5h.01M8.5 7.5h.01M6.5 12.5h.01M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.83-.44-1.12-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 011.67-1.67h2c3.05 0 5.56-2.5 5.56-5.55C21.97 6.01 17.46 2 12 2z"};
const ico = (n, s) => P[n] ? `<svg viewBox="0 0 24 24"${s ? ` style="${s}"` : ""}><path d="${P[n]}"/></svg>` : "";
$$("[data-ic]").forEach(e => e.insertAdjacentHTML("afterbegin", ico(e.dataset.ic)));

/* ---------- tiện ích: link / icon / lưu trữ ---------- */
const ic = n => (typeof ICONS !== "undefined" && ICONS[n]) || n;
const lk = n => (typeof LINKS !== "undefined" && LINKS[n]) || n;
const isAbs = u => /^(https?:)?\/\//i.test(u) || /^(data|blob):/i.test(u);
const ghRaw = u => { const m = u.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/(?:blob|raw)\/([^?#]+)/i); return m ? `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}` : u; };
const asset = (u, base = "") => { u = String(u || "").trim(); if (!u) return ""; if (isAbs(u)) return ghRaw(u); if (u.includes("/")) return u; return base + u; };
const fmt = s => String(s || "").replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|#)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
const strip = s => String(s || "").replace(/<[^>]*>/g, " ").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");

const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) {} };
const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v } catch (e) { return d } };
const toast = m => { const t = $("#toast"); t.textContent = m; t.classList.add("show"); clearTimeout(toast.i); toast.i = setTimeout(() => t.classList.remove("show"), 2200) };

document.addEventListener("click", e => {
  const a = e.target.closest("a[href='#']");
  if (a && a.target === "_blank") { e.preventDefault(); toast("Chưa Cập Nhật Thông Tin"); }
});
addEventListener("error", e => {
  const t = e.target; if (!t || t.tagName !== "IMG") return;
  if (t.dataset.fb === "thumb") { t.parentNode.classList.remove("has"); t.remove(); }
  else if (t.dataset.fb === "chip") { t.outerHTML = `<span class="tl">${esc(t.dataset.l)}</span>`; }
}, true);


/* ==========================================================================
   MÀU GIAO DIỆN
   ========================================================================== */
const themeIds = THEMES.map(t => t[0]);
let rainColor = "#7bff1c";
function setTheme(id, save) {
  if (!themeIds.includes(id)) id = themeIds[0];
  root.setAttribute("data-theme", id);
  if (save) { try { localStorage.setItem("hanh-theme", id) } catch (e) {} }
  const cs = getComputedStyle(root);
  rainColor = cs.getPropertyValue("--acc").trim() || rainColor;
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = cs.getPropertyValue("--bg").trim();
  return id;
}
let curTheme = setTheme(root.getAttribute("data-theme"), false);
$("#theme").onclick = () => {
  const next = themeIds[(themeIds.indexOf(curTheme) + 1) % themeIds.length];
  curTheme = setTheme(next, true);
  const b = $("#theme"); b.classList.remove("spin"); void b.offsetWidth; b.classList.add("spin");
  toast("Màu: " + THEMES.find(t => t[0] === curTheme)[1]);
};


/* ==========================================================================
   NỀN ĐỘNG + SAO QUANH AVATAR
   ========================================================================== */
(function buildBackground() {
  const B = CONFIG.background || {};
  const n = B.streaks == null ? 14 : B.streaks, box = $("#streaks"), cols = ["var(--acc)", "var(--acc)", "var(--acc-3)", "#ffffff"];
  box.innerHTML = Array.from({ length: n }, (_, i) => {
    const t = 2.6 + rnd() * 6.5;
    return `<i style="--y:${(rnd() * 100).toFixed(1)}%;--w:${(140 + rnd() * 380).toFixed(0)}px;--h:${rnd() > .7 ? 2 : 1}px;--t:${t.toFixed(1)}s;--dl:${(-rnd() * t).toFixed(1)}s;--o:${(.18 + rnd() * .5).toFixed(2)};--c:${cols[i % cols.length]}"></i>`;
  }).join("");
  if (B.floor === false) { const f = $("#floor"); if (f) f.remove(); }
})();


/* ==========================================================================
   NỘI DUNG TỪ CONFIG
   ========================================================================== */
const L = CONFIG.links;
document.title = CONFIG.brand + " – Kho tài nguyên";
$("#g-name").textContent = $("#logo").textContent = CONFIG.brand;
$("#g-own").textContent = CONFIG.owner.toUpperCase();
$("#g-on").textContent = $("#g-h").textContent = CONFIG.handle;
$("#g-tg").textContent = CONFIG.telegram ? "Telegram: " + CONFIG.telegram : "";
$("#owner").textContent = CONFIG.owner;
$("#g-year").textContent = "NS // " + new Date().getFullYear();
$("#avatar").textContent = CONFIG.brand;

(function () {
  if (typeof CONFIG.avatar !== "string") return;
  const n = CONFIG.avatar.trim(); if (!n) return;
  const list = /\.\w{3,4}$/.test(n) || isAbs(n) ? [asset(n, CONFIG.iconBase)] : [".png", ".jpg", ".jpeg", ".webp"].map(e => asset(n + e, CONFIG.iconBase));
  (function next(i) {
    if (i >= list.length) return;
    const im = new Image(); im.alt = "";
    im.onload = () => { const a = $("#avatar"); a.textContent = ""; a.appendChild(im); };
    im.onerror = () => next(i + 1);
    im.src = list[i];
  })(0);
})();
[["yt","youtube"],["tt","tiktok"],["tg","telegram"],["dc","discord"]].forEach(([i, k]) => $("#l-" + i).href = L[k] || "#");
$("#m-adm").href = L.admin || "#";
$("#dl").onclick = () => L.download && L.download !== "#" ? open(L.download, "_blank") : $("#list").scrollIntoView({ behavior: "smooth" });


/* ==========================================================================
   MÀN HÌNH CHÀO + NHẠC
   ========================================================================== */
const pb = $("#pb"); let au = null, playing = false;
let musicUrl = "", musicList = [], musicBad = 0;
(async function pickMusic() {
  const M = CONFIG.music; let list = [];
  const EXT = ["mp3", "m4a", "mp4", "aac", "ogg", "oga", "opus", "wav", "flac", "webm", "mov", "m4v"], hasExt = u => /\.\w{2,5}(\?|#|$)/.test(u);
  if (typeof M === "string") list = M ? [asset(M)] : [];
  else if (M) {
    let dir = M.dir || "music/";
    list = (M.files || []).map(f => asset(f, dir));
    if (!list.length && hasExt(dir)) { list = [asset(dir)]; dir = ""; }
    if (!list.length) {
      if (dir && !/\/$/.test(dir)) dir += "/";
      const a = document.createElement("audio"), can = e => !a.canPlayType || a.canPlayType((/^(mp4|m4v|mov)$/.test(e) ? "audio/mp4" : /^(webm)$/.test(e) ? "audio/webm" : /^(m4a)$/.test(e) ? "audio/mp4" : /^(oga|ogg|opus)$/.test(e) ? "audio/ogg" : "audio/" + e)) !== "" || e === "mp3" || e === "mp4";
      const c = ["nhac", ...Array.from({ length: 20 }, (_, i) => String(i + 1))].flatMap(n => EXT.filter(can).map(e => dir + n + "." + e));
      const ok = await Promise.all(c.map(u => fetch(u, { method: "HEAD" }).then(r => r.ok, () => false)));
      list = c.filter((_, i) => ok[i]);
    }
  }
  if (list.length) { musicList = list; musicUrl = list[rnd() * list.length | 0]; getAudio(); }
})();
const paint = () => { $("#player").classList.toggle("play", playing); pb.innerHTML = ico(playing ? "pause" : "play", "fill:currentColor;stroke:none"); };
function nextTrack() {
  if (musicList.length < 2) return false;
  let u; do { u = musicList[rnd() * musicList.length | 0]; } while (u === musicUrl);
  musicUrl = u; au.src = u; au.load(); return true;
}
function getAudio() {
  if (!musicUrl) return null;
  if (!au) {
    au = new Audio(); au.loop = musicList.length < 2; au.preload = "auto";
    au.volume = Math.min(1, Math.max(0, CONFIG.volume == null ? 1 : CONFIG.volume));
    au.addEventListener("ended", () => { if (nextTrack()) { const p = au.play(); if (p && p.catch) p.catch(() => {}); } });
    au.addEventListener("playing", () => { musicBad = 0; });
    au.addEventListener("error", () => {
      if (musicList.length > 1 && ++musicBad < musicList.length && nextTrack()) { if (playing) { const p = au.play(); if (p && p.catch) p.catch(() => {}); } return; }
      playing = false; paint(); toast("Không tải được nhạc — kiểm tra file trong music/");
    });
    au.src = musicUrl;
  }
  return au;
}
function playMusic() {
  const a = getAudio(); if (!a) { toast("Chưa cài nhạc"); return; }
  playing = true; paint();
  const p = a.play(); if (p && p.catch) p.catch(err => { if (err && err.name === "NotAllowedError") { playing = false; paint(); } });
}
function pauseMusic() { if (au) au.pause(); playing = false; paint(); }
pb.onclick = () => playing ? pauseMusic() : playMusic();
paint();

const enter = () => {
  $("#gate").classList.add("off");
  if (musicUrl && !playing) playMusic();
  try { sessionStorage.setItem("hd-in", "1") } catch (e) {}
};
$("#enter").onclick = enter;
try { if (sessionStorage.getItem("hd-in")) $("#gate").classList.add("off"); } catch (e) {}

(function () {
  if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  const c = $("#rain"), g = c.getContext("2d"), ch = CONFIG.brand.replace(/\s/g, "") + "01"; let w, h, y;
  const fit = () => { w = c.width = innerWidth; h = c.height = innerHeight; y = Array.from({ length: Math.ceil(w / 18) }, () => rnd() * h / 18); };
  fit(); addEventListener("resize", fit);
  const draw = () => {
    if ($("#gate").classList.contains("off")) return;
    g.globalCompositeOperation = "destination-out"; g.fillStyle = "rgba(0,0,0,.14)"; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = "source-over"; g.fillStyle = rainColor; g.font = "14px monospace";
    y.forEach((v, i) => { g.fillText(ch[rnd() * ch.length | 0], i * 18, v * 18); y[i] = v * 18 > h && rnd() > .975 ? 0 : v + 1; });
    requestAnimationFrame(draw);
  };
  draw();
})();


/* ==========================================================================
   ĐỒNG HỒ + SỐ LIỆU (ĐÃ TÍCH HỢP API VIEW THẬT)
   ========================================================================== */
const tick = () => $("#clock").textContent = new Date().toLocaleTimeString("vi-VN", { hour12: false }); tick(); setInterval(tick, 1000);
const count = (el, to) => { const t0 = performance.now(); (function f(t) { const p = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString("vi-VN"); if (p < 1) requestAnimationFrame(f); })(t0); };

// Hàm gọi API lấy số view thật từ server chống spam IP của bạn
async function getRealViews() {
  const API_URL = "http://78.154.103.28:15046/view"; // <-- ĐÃ THAY ĐƯỜNG DẪN API CHUẨN XÁC CỦA BẠN VÀO ĐÂY

  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    if (data && typeof data.views === "number") {
      return data.views; // Trả về số view thật từ server
    }
  } catch (e) {
    console.log("Không gọi được API riêng, dùng số dự phòng từ config.");
  }
  
  return CONFIG.views || 5044; // Giá trị dự phòng nếu lỗi mạng
}

// Khởi chạy lấy view và updates lên giao diện
(async () => {
  const realViews = await getRealViews();
  count($("#s1"), realViews);
  count($("#s2"), CONFIG.updates);
})();

$(".stat").insertAdjacentHTML("beforeend", `<div class="mini">${[30,45,35,65,100].map((h, i) => `<i style="--h:${h}%;animation-delay:${i * .1}s"></i>`).join("")}</div>`);
addEventListener("scroll", () => { $("#prog").style.width = scrollY / Math.max(1, document.body.scrollHeight - innerHeight) * 100 + "%"; }, { passive: true });


/* ==========================================================================
   THÔNG BÁO
   ========================================================================== */
let seen = load("nsread", []);
const unread = () => CONFIG.notices.filter((n, i) => !seen.includes(i)).length;
function drawNotice() {
  $("#dot").style.display = unread() ? "" : "none"; $("#bell").classList.toggle("has", !!unread());
  $("#np-l").innerHTML = CONFIG.notices.map((n, i) => `<div class="nt${seen.includes(i) ? "" : " un"}" data-n="${i}" style="--n:${i}"><span class="ni">${ico(n.ic)}</span><div><b>${esc(n.t)}</b><small>${esc(n.d)}</small></div><em>${esc(n.tm)}</em></div>`).join("");
}
const npOpen = o => { $("#np").classList.toggle("open", o); $("#npb").classList.toggle("open", o); };
$("#bell").onclick = () => npOpen(!$("#np").classList.contains("open")); $("#npb").onclick = () => npOpen(false);
$("#np-read").onclick = () => { seen = CONFIG.notices.map((_, i) => i); store("nsread", seen); drawNotice(); toast("Đã đánh dấu đã đọc"); };
$("#np-l").onclick = e => {
  const n = e.target.closest(".nt"); if (!n) return; const i = +n.dataset.n;
  if (!seen.includes(i)) { seen.push(i); store("nsread", seen); } drawNotice();
  const idx = ITEMS.findIndex(x => x.name === CONFIG.notices[i].go); npOpen(false); if (idx >= 0) setTimeout(() => openModal(idx), 250);
};
$("#menu").onclick = () => $("#chips").scrollIntoView({ behavior: "smooth", block: "center" });


/* ==========================================================================
   DANH SÁCH ỨNG DỤNG
   ========================================================================== */
const DEF = { game: "app", type: "TOOL", btn: "dl", tags: ["ios"], note: "", new: false, link: "#", icon: "" };
const ITEMS = [];
APPS.forEach(s => s.items.forEach(it => {
  const x = { ...DEF, ...(s.defaults || {}), ...it, secRef: s };
  x.search = norm(x.name + " " + strip(x.desc) + " " + x.type);
  ITEMS.push(x);
}));

let game = "all", type = "all", sort = "def", view = "all", term = "";
let favs = load("hd-fav", []).filter(v => typeof v === "string");
const isFav = x => favs.includes(x.name);

const slug = t => norm(t).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const thumb = (x, id) => {
  const u = asset(ic(x.icon), CONFIG.iconBase) || asset(slug(x.name) + ".png", CONFIG.iconBase);
  return `<div class="thumb${u ? " has" : ""}"${id ? ` id="${id}"` : ""}>${u ? `<img src="${esc(u)}" alt="" loading="lazy" referrerpolicy="no-referrer" data-fb="thumb">` : ""}<span>${esc((x.name.trim()[0] || "?").toUpperCase())}</span></div>`;
};
const tagsHtml = x =>
  `<span class="pt ty">${esc(x.type)}</span>` + (x.new ? `<span class="pt nw">MỚI</span>` : "") +
  x.tags.map(k => TAGS[k] ? `<span class="pt ${TAGS[k][1]}">${TAGS[k][2] ? ico(TAGS[k][2]) : ""}${TAGS[k][0]}</span>` : "").join("");
const noteHtml = x => NOTES[x.note] ? `<span class="pt vid">${ico("cam")}${NOTES[x.note]}</span>` : "";

$("#chips").innerHTML = CATS.map(c => {
  if (!Array.isArray(c)) c = [c.id, c.name, c.icon];
  const u = asset(ic(c[2]));
  return `<button class="chip${c[0] === "all" ? " on" : ""}" data-c="${c[0]}">${u ? `<img src="${esc(u)}" alt="" referrerpolicy="no-referrer" data-fb="chip" data-l="${esc(c[1][0])}">` : `<span class="tl">${esc(c[1][0])}</span>`}${esc(c[1]).toUpperCase()}</button>`;
}).join("");
$("#chips").onclick = e => { const b = e.target.closest(".chip"); if (!b) return; game = b.dataset.c; $$(".chip").forEach(x => x.classList.toggle("on", x === b)); render(); };
const go = () => { term = $("#q").value.trim(); render(); }; $("#qb").onclick = go; $("#q").oninput = go;
function drawTypes() { $("#types").innerHTML = ["all", ...TYPES].map(t => `<button data-y="${t}" class="${t === type ? "on" : ""}">${t === "all" ? "TẤT CẢ" : t}</button>`).join(""); }
$("#types").onclick = e => { const b = e.target.closest("button"); if (b) { type = b.dataset.y; drawTypes(); render(); } };
$("#sort").onchange = e => { sort = e.target.value; render(); };
$("#reset").onclick = () => { type = "all"; sort = "def"; view = "all"; game = "all"; term = ""; $("#q").value = ""; $("#sort").value = "def"; $$(".chip").forEach(x => x.classList.toggle("on", x.dataset.c === "all")); $$(".qt").forEach(x => x.classList.remove("on")); drawTypes(); render(); };
[["#qf", "fav"], ["#qn", "new"]].forEach(([id, v]) => $(id).onclick = () => { view = view === v ? "all" : v; $$(".qt").forEach(x => x.classList.remove("on")); if (view !== "all") $(id).classList.add("on"); render(); $("#list").scrollIntoView({ behavior: "smooth" }); });

const io = new IntersectionObserver(es => es.forEach(e => window.pxReveal ? window.pxReveal(e) : e.target.classList.toggle("in", e.isIntersecting)), { threshold: [0, .14], rootMargin: "0px 0px -4% 0px" });

function render() {
  const out = []; let k = 0; io.disconnect(); window.pxQuiet = performance.now();
  APPS.forEach(s => {
    const its = ITEMS.map((x, i) => ({ x, i })).filter(({ x }) =>
      x.secRef === s && (game === "all" || x.game === game) && (type === "all" || x.type === type) &&
      (view !== "fav" || isFav(x)) && (view !== "new" || x.new) && (!term || x.search.includes(norm(term))));
    if (!its.length) return;
    if (sort === "az") its.sort((a, b) => a.x.name.localeCompare(b.x.name, "vi"));
    if (sort === "new") its.sort((a, b) => Number(b.x.new) - Number(a.x.new));
    out.push(
      `<div class="sec rv"><span class="tag">${ico(s.ic || "pin")}${esc(s.section)}</span><em>// ${esc(CONFIG.brand)}</em></div>` +
      `<div class="head rv"><b>☭</b>${esc(s.title)}<span class="cnt">${its.length}</span></div>` +
      its.map(({ x, i }) => `
<article class="card rv" data-i="${i}" tabindex="0" style="--k:${k++ % 6}">
  <div class="c-top">${thumb(x)}<div class="c-name"><h3>${esc(x.name)}</h3><div class="c-tags">${tagsHtml(x)}</div></div>
    <button class="fav${isFav(x) ? " on" : ""}" data-f="${i}" aria-label="Yêu thích">${ico("heart")}</button></div>
  <p class="c-desc">${fmt(x.desc)}</p>
  <div class="c-foot"><div class="c-notes">${noteHtml(x)}</div><span class="go ${x.btn}">${ico(x.btn === "dl" ? "cloud" : "ext")}${x.btn === "dl" ? "TẢI FILE" : "MỞ LINK"}</span></div>
</article>`).join(""));
  });
  $("#list").innerHTML = out.join("") || `<div class="empty">${view === "fav" ? "Bạn chưa thả tim file nào." : "Không tìm thấy kết quả. Thử từ khóa khác."}</div>`;
  $$(".rv").forEach(el => io.observe(el));
}
$("#list").onpointermove = e => { const c = e.target.closest(".card"); if (c) { const r = c.getBoundingClientRect(); c.style.setProperty("--mx", e.clientX - r.left + "px"); c.style.setProperty("--my", e.clientY - r.top + "px"); } };
$("#list").onclick = e => {
  if (e.target.closest("a")) return;
  const f = e.target.closest(".fav");
  if (f) {
    e.stopPropagation(); const x = ITEMS[+f.dataset.f];
    favs = isFav(x) ? favs.filter(n => n !== x.name) : [...favs, x.name]; store("hd-fav", favs); f.classList.toggle("on");
    toast(isFav(x) ? "Đã thêm vào Yêu thích" : "Đã bỏ khỏi Yêu thích"); return;
  }
  const c = e.target.closest(".card"); if (c) openModal(+c.dataset.i);
};
$("#list").onkeydown = e => { if (e.key === "Enter" && !e.target.closest("a,button")) { const c = e.target.closest(".card"); if (c) openModal(+c.dataset.i); } };


/* ==========================================================================
   CỬA SỔ CHI TIẾT
   ========================================================================== */
function openModal(i) {
  const x = ITEMS[i], dl = x.btn === "dl";
  $("#m-th").outerHTML = thumb(x, "m-th");
  $("#m-t").textContent = x.name; $("#m-c").textContent = x.secRef.section;
  $("#m-d").innerHTML = fmt(x.desc).replace(/[.\s]+$/, "") + ". Nếu gặp lỗi, hãy liên hệ Admin để được hỗ trợ.";
  $("#m-s").innerHTML = (dl ? ["Nhấn nút TẢI FILE bên dưới", "Xem video hướng dẫn nếu mục có nhắc", "Làm theo từng bước"] : ["Nhấn nút MỞ LIÊN KẾT bên dưới", "Tải và cài đặt theo hướng dẫn", "Khởi động lại ứng dụng nếu cần"])
    .map((s, n) => `<div class="row"><span class="i">${n + 1}</span><div>${s}</div></div>`).join("");
  $("#m-dt").textContent = dl ? "TẢI FILE" : "MỞ LIÊN KẾT"; $("#m-dl").href = lk(x.link) || "#";
  setTab("a"); $("#modal").classList.add("open");
}
const setTab = t => { $$(".tabs button").forEach(b => b.classList.toggle("on", b.dataset.t === t)); $("#tab-a").classList.toggle("hide", t !== "a"); $("#tab-b").classList.toggle("hide", t !== "b"); };
$$(".tabs button").forEach(b => b.onclick = () => setTab(b.dataset.t));
const close = () => $("#modal").classList.remove("open");
$("#m-x").onclick = close; $("#modal").onclick = e => { if (e.target.id === "modal") close(); };
document.onkeydown = e => { if (e.key === "Escape") { close(); npOpen(false); } };

/* ---------- khởi động ---------- */
drawTypes(); drawNotice(); render();
