/* ==========================================================================
   CONFIG.JS — mọi thứ cần chỉnh nằm ở file này. Thứ tự từ trên xuống:
     1. CONFIG   thông tin chung, avatar, nhạc, link mạng xã hội, thông báo
     2. ICONS    bảng icon: đặt tên ngắn → link ảnh (hoặc tên file trong icon/)
     3. LINKS    bảng link tải: đặt tên ngắn → link thật
     4. CATS / TYPES / TAGS / NOTES   danh mục game, loại file, nhãn, ghi chú
     5. APPS     danh sách ứng dụng — mỗi dòng là 1 mục, cột luôn theo thứ tự:
                 type → name → desc → icon → link → (tuỳ chọn) game, btn, tags, note, new
   Ở cột icon / link: ghi TÊN trong ICONS / LINKS, hoặc dán thẳng link, hoặc tên file ảnh.
   ========================================================================== */

const CONFIG = {
  brand:  "Hanh Devメ",
  owner:  "Hanh Lười Tập",
  handle: "Hanh",
  TikTok: "@hanhluoitap",
  theme:  "pink",                 // pink | garden | beldam | bobinsky | tunnel (xem theme.css)
  iconBase: "icon/",

  /* AVATAR: tối đa 4 mục, đặt trong icon/. Không ghi đuôi file = tự dò .mp4 .png .jpg .jpeg .webp
     Video (ava.mp4) được CHIẾU thẳng trong khuôn tròn avatar: tự lặp, tắt tiếng, không hiện nút hay ô xem video.
     Hết `seconds` giây thì tan thành mảnh vải rồi đổi avatar khác ngẫu nhiên.
     focus = điểm của khung hình được giữ ở GIỮA khuôn để thấy rõ chủ thể: "x% y%" (50% 0% = sát mép trên, 50% 100% = sát mép dưới).
       Mặc định "50% 30%" (lấy phần trên khung hình, nơi thường có mặt người).
     Riêng từng avatar: { name:"ava2", seconds:25, focus:"50% 15%" } */
  avatar: { dir: "icon/", list: ["ava", "ava2", "ava3", "ava4"], seconds: 15, focus: "50% 30%" },

  /* HOẠT CẢNH ĐẦU TRANG (slender.js): mụ nhện khâu rượt hai bé, giữ chuột/ngón tay lên mụ để chặn lại.
     chase = số giây rượt trước khi mụ bắt được bé.
     sprites (tuỳ chọn) = ảnh PNG riêng của bạn đặt trong icon/ thay cho hình pixel có sẵn (nền trong suốt, nhân vật đứng thẳng):
       girl = bé thứ nhất, boy = bé thứ hai, watcher = người ném bé ra. Ví dụ: sprites: { girl:"be1.png", boy:"be2.png" } */
  slender: { chase: 15, sprites: {} },

  /* NHẠC: web chọn NGẪU NHIÊN 1 bài ngay khi người dùng vào, nạp sẵn nên bấm là phát liền.
     GitHub Pages không đọc được danh sách thư mục, nên có 2 cách:
       a) ghi tên file vào files: ["a.mp3", "b.mp3"]   ← nên dùng
       b) để files rỗng [] và đặt tên 1.mp3, 2.mp3 … 20.mp3 hoặc nhac.mp3 trong music/ (tự dò) */
  music: { dir: "music/", files: ["nhac.mp4","timem.m4a","dung.m4a"] },
  volume: 1,

  background: { streaks: 3, floor: true },

  links: {
    youtube:  "https://youtube.com/channel/UCtSS9p79j4PzeTMh6L1FKRA",
    tiktok:   "https://www.tiktok.com/@hanhluoitap?_r=1&_t=ZS-9Aguqurv5pH",
    telegram: "#",
    discord:  "#",
    admin:    "https://www.tiktok.com/@hanhluoitap?_r=1&_t=ZS-9Aguqurv5pH",   // nút ADMIN trong cửa sổ chi tiết
    download: "#"   // nút "Sử Dụng Dịch Vụ Ngay" ("#" = cuộn xuống danh sách)
  },

  views: 5044,
  updates: 2026,

  /* Thông báo (chuông). go = tên ứng dụng sẽ mở khi bấm. */
  notices: [
    { ic:"bolt", t:"WebSite 20/10 Hành Tinh", d:"Vừa cập nhật bản mới", tm:"Hôm nay", go:"APP 3105 CRACK 2.1" },
    { ic:"shield", t:"DNS ANTIBAN • FF / FFM V2", d:"Đã sửa lỗi kết nối", tm:"Hôm qua", go:"DNS ANTIBAN • FF / FFM V2" },
    { ic:"note", t:"Nhạc nền đã sẵn sàng", d:"Bấm nút phát ở góc phải", tm:"2 ngày trước" },
    { ic:"heart", t:"Mẹo: thả tim để lưu file", d:"Xem lại ở mục Yêu thích", tm:"Tuần này" }
  ]
};

/* Bộ màu cho nút 🎨 (khớp với tên trong theme.css) — 5 bộ màu Coraline */
const THEMES = [
  ["pink", "Pink Palace"],
  ["garden", "Other World Garden"],
  ["beldam", "The Beldam"],
  ["bobinsky", "Bobinsky"],
  ["tunnel", "The Tunnel"]
];

const favicon = d => `https://www.google.com/s2/favicons?domain=${d}&sz=128`;


/* ===== ICONS — tên ngắn → link ảnh. Đổi 1 chỗ, mọi mục dùng tên đó đều đổi theo ===== */
const ICONS = {
  "cat-all":        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxUI6Ng_NAhtPB3MyC5MP8GxuaPPUs93_uhUUMK7p3DA&s=10",
  "lienquan-garena":favicon("lienquan.garena.vn"),
  "cat-ff":         "https://cellphones.com.vn/sforum/wp-content/uploads/2021/12/11-11.jpg",
  "cat-app":        "https://anhmeme.com/wp-content/uploads/2026/05/imagesqtbnANd9GcTOJhIQeBeITfbRaoqUEW21MH0a4D4fDKPz9wamps.jpg",
  "cat-src":        "https://cdn.pico.vn/2026/01/15/176847124416252639803.jpeg",
  "cat-pubg":       "https://upload.wikimedia.org/wikipedia/commons/2/2f/Icon_PUBGM.jpg?utm_source=vi.wikipedia.org&utm_campaign=index&utm_content=original",
  "icloud":         favicon("icloud.com"),
  "premium10":      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKvXS8HHWwxDQ5cwxK0mb4Xgqg-NzNqTWLgOnxMF0zPJrWYBMBqAzssATT&s=10",
  "lq-logo":        "https://gamelandvn.com/wp-content/uploads/anh/2019/06/lien-quan-mobile-logo-moi-thumbnail.jpg",
  "ea":             favicon("ea.com"),
  "locketcamera":   favicon("locketcamera.com"),
  "king":           favicon("king.com"),
  "pubg-logo":      "https://skylinepost.org/wp-content/uploads/2025/02/lTe3c3paRnaEXpDIfhl9We7scmqZM7WDWwlDBAs7.jpg",
  "capcut":         favicon("capcut.com"),
  "deepseek":       favicon("deepseek.com"),
  "claude":         favicon("claude.ai"),
  "chatgpt":        favicon("chatgpt.com"),
  "ff-garena":      favicon("ff.garena.com"),
  "sing-box-sagernet":favicon("sing-box.sagernet.org"),
  "gemini-google":  favicon("gemini.google.com"),
  "fc-mobile":      "https://sm.ign.com/ign_cz/cover/e/ea-sports-/ea-sports-fc-mobile_965z.jpg",
  "8bp":            "https://img.utdstc.com/icon/325/c26/325c26800882a7d32dc1ce6b256a360a88de712fd71e358382b4be183db4e947:600",
  "apple":          favicon("apple.com"),
  "duolingo":       favicon("duolingo.com"),
  "messenger":      favicon("messenger.com"),
  "youtube":        favicon("youtube.com"),
  "filza":          "https://share.google/RGu1QDZnO7y0Nguyb",
  "facebook":       favicon("facebook.com"),
  "spotify":        favicon("spotify.com"),
  "discord":        favicon("discord.com")
};

/* ===== LINKS — tên ngắn → link tải. Mục nào để "#" là chưa có link ===== */
const LINKS = {
  "scoure-web-20-10-hanh-tinh":               "https://drive.google.com/file/d/1ma1PfEU0rTIBVfDbwbIEWGFljgw4SUJz/view?usp=drivesdk",
  "scoure-hanh-dev":                          "https://truyenmataihien.blogspot.com/2026/10/in-tai-lieu-chua-co-cap-nhat-hay-oi-cap.html?m=1",
  "config-unlock-premium-10-app":             "https://raw.githubusercontent.com/Gaucuto/ver2promax/refs/heads/main/10in1",
  "fc-mobile":                                "https://drive.google.com/file/d/1oPEadV6D4Q7kZjEwk1DqSOi8jRPtZrUo/view?usp=drivesdk",
  "youtube-premium":                          "https://drive.google.com/file/d/1L3JVIXImLYQ27pQt2CgdzZ2mHKxSSdkg/view?usp=drivesdk"
};


/* ===== DANH MỤC GAME (chip bấm lọc): id, name, icon ===== */
const CATS = [
  { id:"all", name:"Tất cả", icon:"cat-all" },
  { id:"lq", name:"Liên Quân", icon:"lienquan-garena" },
  { id:"ff", name:"Free Fire", icon:"cat-ff" },
  { id:"app", name:"App", icon:"cat-app" },
  { id:"scr", name:"Source Web", icon:"cat-src" },
  { id:"pubg", name:"PUBG", icon:"cat-pubg" }
];

/* ===== LOẠI FILE (nút lọc) ===== */
const TYPES = ["MOD","PATCH","IPA","TOOL","CONFIG","RAW","SCR"];

/* ===== NHÃN NHỎ TRÊN THẺ: [chữ hiển thị, class, icon] ===== */
const TAGS = {
  ios:   ["iOS","ios","apple"],
  anti:  ["Antiban","anti","shield"],
  Hanh:  ["Hanh","Hn","user"],
  Web:   ["Github","Web"],
  win:   ["WINDOW","win","win"],
  v1:    ["v1","ios",""]
};

/* ===== GHI CHÚ NỔI BẬT (note: "video" hoặc "patch") ===== */
const NOTES = {
  video: "Nhớ Xem Video Hướng Dẫn",
  patch: "Nhớ Xem Video PATCH Bằng 3105"
};


/* ==========================================================================
   APPS — danh sách ứng dụng. Mỗi dòng 1 mục:
     { type, name, desc, icon, link,  game, btn, tags, note, new }
       type  MOD | PATCH | IPA | TOOL | CONFIG | RAW | SCR
       name  tên to ở trên cùng
       desc  mô tả — nhúng link được: "Dùng cho [APP 3105](https://…)"
       icon  tên trong ICONS | link ảnh | tên file trong icon/ | "" (tự tìm icon/<tên-ứng-dụng>.png)
       link  tên trong LINKS | link tải | "#"
       game  "lq" | "ff" | "app" | "pubg"      btn "dl" (TẢI FILE) | "ln" (MỞ LIÊN KẾT)
       tags  ["ios","anti","win","v1","Web"]   note "video" | "patch"      new true = nhãn MỚI
     `defaults` của nhóm = giá trị chung cho mọi mục trong nhóm (dòng nào ghi riêng thì ghi đè).
   ========================================================================== */
const APPS = [

  /* ───────── Scoure Share ───────── */
  {
    section: "Scoure Share",
    title:   "Scoure WebSite",
    defaults: { game:"app", btn:"dl", tags:["Web"] },
    items: [
      { type:"SCR", name:"Scoure Web 20/10 Hành Tinh", desc:"Chỉnh Lại Tên Lời Nhắn Rồi Push Lên", icon:"phunu.jpeg", link:"scoure-web-20-10-hanh-tinh" },
      { type:"SCR", name:"Scoure Hanh Dev", desc:"Sắp Ra Mắt", icon:"hanh.jpeg", link:"scoure-hanh-dev" }
    ]
  },

  /* ───────── FAKE GPS + CONFIG ───────── */
  {
    section: "FAKE GPS + CONFIG",
    title:   "TÀI NGUYÊN TẢI XUỐNG",
    defaults: { game:"app", btn:"dl", tags:["ios"] },
    items: [
      { type:"CONFIG", name:"HƯỚNG DẪN FAKE GPS VỊ TRÍ FULL IOS", desc:"BẰNG SHADOW ROCKET", icon:"", link:"#" },
      { type:"TOOL", name:"MỞ KHÓA ICLOUD VIP", desc:"DÀNH CHO CON VỢ BỊ KHÓA", icon:"icloud", link:"#" },
      { type:"CONFIG", name:"CONFIG UNLOCK PREMIUM 10 APP", desc:"YOUTUBE, SPOTIFY, PICARTS,...", icon:"premium10", link:"config-unlock-premium-10-app" }
    ]
  },

  /* ───────── HÌNH NỀN + PASSCODE THEMES ───────── */
  {
    section: "HÌNH NỀN + PASSCODE THEMES",
    title:   "PASSCODE THEMES",
    defaults: { game:"app", btn:"dl", tags:["ios"], note:"patch" },
    items: [
      { type:"IPA", name:"IPA AIRCARD", desc:"CÀI PASSCODE", icon:"", link:"#" },
      { type:"CONFIG", name:"FILE TỔNG HỢP PASSCODE THEMES", desc:"DÙNG CHO APP AIRCARD", icon:"", link:"#" },
      { type:"IPA", name:"APP ILOADER", desc:"CÀI FILE PLIST...", icon:"", link:"#" }
    ]
  },

  /* ───────── PATCH LIÊN QUÂN ───────── */
  {
    section: "PATCH LIÊN QUÂN",
    title:   "PATCH & NGUỒN RAW",
    defaults: { game:"app", btn:"dl", tags:["ios"], note:"patch" },
    items: [
      { type:"PATCH", name:"PATCH LQ AIM + FULL SKIN", desc:"DÙNG CHO APP 3105", icon:"lq-logo", link:"#", game:"lq" },
      { type:"PATCH", name:"PATCH FULL SKIN, ESP, CAM XA, HUD", desc:"DÙNG CHO APP 3105", icon:"lq-logo", link:"#", game:"lq" },
      { type:"PATCH", name:"RESET TRẬN LQ", desc:"DÙNG CHO APP 3105", icon:"lq-logo", link:"#", game:"lq" },
      { type:"PATCH", name:"PATCH LQ ESP + FULL SKIN + CAM XA", desc:"DÙNG CHO APP 3105", icon:"lq-logo", link:"#", game:"lq" },
      { type:"PATCH", name:"PATCH HACK PVZ2", desc:"DÙNG CHO APP 3105", icon:"ea", link:"#" },
      { type:"PATCH", name:"PATCH LOCKET GOLD 30s", desc:"UP LOCKET GOLD , QUAY 30s,...", icon:"locketcamera", link:"#" },
      { type:"PATCH", name:"PATCH CADY CRUSH", desc:"DÙNG CHO APP 3105", icon:"king", link:"#" },
      { type:"RAW", name:"NGUỒN RAW FULL LQ", desc:"DÁN VÀO APP 3105", icon:"lq-logo", link:"#", game:"lq", note:"video" },
      { type:"RAW", name:"NGUỒN RAW PUBG", desc:"DÁN VÀO APP 3105", icon:"pubg-logo", link:"#", game:"pubg", note:"video" },
      { type:"RAW", name:"NGUỒN HÌNH NỀN + APP", desc:"CAPCUT, DAZZCAM, ISCREEN PREMIUM", icon:"capcut", link:"#", note:"video" }
    ]
  },

  /* ───────── BYPASS + ANTIBAN ───────── */
  {
    section: "BYPASS + ANTIBAN",
    title:   "BYPASS & ANTIBAN",
    defaults: { game:"app", btn:"dl", tags:["ios"] },
    items: [
      { type:"TOOL", name:"FILE BYPASS AI DEEPSEEK", desc:"DÁN VÀO CHAT", icon:"deepseek", link:"#" },
      { type:"TOOL", name:"FILE BYPASS AI CLAUDE", desc:"DÁN INSTRUCTION", icon:"claude", link:"#" },
      { type:"TOOL", name:"FILE BYPASS AI CHATGPT", desc:"DÁN VÀO CHAT", icon:"chatgpt", link:"#" },
      { type:"IPA", name:"IPA + TOOL ĐỔI PASS CHỨNG CHỈ", desc:"CHO CẢ IOS + PC", icon:"", link:"#", tags:["win","ios","ns"] }
    ]
  },

  /* ───────── ANTIBAN ───────── */
  {
    section: "ANTIBAN",
    title:   "FILE MOD & ANTIBAN",
    defaults: { game:"ff", btn:"dl", tags:["ios","anti"] },
    items: [
      { type:"MOD", name:"DNS ANTIBAN • FF / FFM V2", desc:"Dùng cho 3105 & Filza", icon:"ff-garena", link:"#", new:true },
      { type:"MOD", name:"SING BOX ANTIBAN FF V2", desc:"FIX BAN ID", icon:"sing-box-sagernet", link:"#" }
    ]
  },

  /* ───────── APP CRACK + MODS GAME ───────── */
  {
    section: "APP CRACK + MODS GAME",
    title:   "TẢI IPA",
    defaults: { game:"app", btn:"ln", tags:[] },
    items: [
      { type:"IPA", name:"UNLOCK GEMINI PRO", desc:"PRO VIPP", icon:"gemini-google", link:"#", tags:["v1","ns"] },
      { type:"IPA", name:"APP 3105", desc:"CẬP NHẬT 28/9", icon:"", link:"#" },
      { type:"IPA", name:"APP 3105 CRACK 2.1", desc:"CẬP NHẬT 3/10", icon:"", link:"#", new:true },
      { type:"IPA", name:"Fc Mobile", desc:"CẬP NHẬT 3/10", icon:"fc-mobile", link:"fc-mobile", new:true },
      { type:"IPA", name:"UNLOCK 3105", desc:"CẬP NHẬT 10/10", icon:"", link:"#", new:true },
      { type:"IPA", name:"APP 3105 CRACK BETA 3", desc:"CẬP NHẬT 8/10", icon:"", link:"#" },
      { type:"IPA", name:"APP 3105 CŨ", desc:"v1.1.1", icon:"", link:"#" },
      { type:"MOD", name:"IPA MENU NO KEY 8BP", desc:"Đã cập nhật 29/8", icon:"8bp", link:"#", tags:["ios","anti"] },
      { type:"TOOL", name:"UNLOCK 120HZ IOS", desc:"GIÚP MÀN HÌNH MƯỢT HƠN", icon:"apple", link:"#" },
      { type:"IPA", name:"UNLOCK DUOLINGO MAX", desc:"CÓ CHẾ ĐỘ GỌI", icon:"duolingo", link:"#" },
      { type:"IPA", name:"MESSENGER VIPP", desc:"XEM ĐƯỢC TIN NHẮN THU HỒI ,...", icon:"messenger", link:"#" },
      { type:"IPA", name:"YOUTUBE PREMIUM", desc:"ĐÃ CẬP NHẬT 9/9", icon:"youtube", link:"youtube-premium" },
      { type:"IPA", name:"CAPCUT PRO", desc:"ĐÃ CẬP NHẬT 9/9", icon:"capcut", link:"#" },
      { type:"TOOL", name:"Filza Mod", desc:"Tích Hợp APP 3105, Mond", icon:"filza", link:"#" },
      { type:"MOD", name:"PUBG IOS ZERO", desc:"MENU VIP • NO KEY", icon:"pubg-logo", link:"#", game:"pubg" },
      { type:"MOD", name:"FACEBOOK MENU IQ+PLUS", desc:"UPDATE 26/9", icon:"facebook", link:"#" },
      { type:"IPA", name:"IPA SPOTIFY PREMIUM", desc:"UNLOCK PREMIUM • MOD APPLE MUSIC", icon:"spotify", link:"#" },
      { type:"MOD", name:"DISCORD FAKE GIỌNG", desc:"VÀO CUỘC GỌI RỒI CHỌN GIỌNG", icon:"discord", link:"#" }
    ]
  }
];
