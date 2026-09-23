// ============================================================
// 캠프·유학 두 번째 사이트 생성기 — 실행: node build.js → docs/
//   내용은 data.js, 모양은 assets/style.css, 동작은 assets/app.js
// ============================================================
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { SITE, CAMPS, CAMP_FIT, ABOUT, DESTINATIONS, FINDER, COMMON, STUDY, STUDY_PROCEDURE, STPAUL, ELC, PATHWAYS, REVIEWS } = require("./data.js");

const OUT = path.join(__dirname, "docs");
const ASSETS = path.join(__dirname, "assets");
fs.mkdirSync(path.join(OUT, "img"), { recursive: true });
const ver = (f) => crypto.createHash("md5").update(fs.readFileSync(path.join(ASSETS, f))).digest("hex").slice(0, 8);
const CSS_VER = ver("style.css");
const JS_VER = ver("app.js");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const pad = (n) => String(n).padStart(2, "0");
const BRAND = SITE.brandKo;
const hasJong = (w) => { const c = w.charCodeAt(w.length - 1); return c >= 0xac00 && c <= 0xd7a3 ? (c - 0xac00) % 28 > 0 : false; };
const josa = (w, a, b) => w + (hasJong(w) ? a : b); // josa("스쿨링트립","은","는")
const titleCase = (t) => t.toLowerCase().replace(/(^|\s)\S/g, (m) => m.toUpperCase());
// 한시 할인 — 마감일이 지난 promo 는 빌드가 아예 내보내지 않는다.
// 이미 배포된 페이지는 app.js 가 data-promo-until 을 보고 data-plain 으로 되돌린다(재빌드를 잊어도 틀린 금액이 안 남게).
const todayKst = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const promoOf = (c) => (c.promo && c.promo.until >= todayKst() ? c.promo : null);
// 할인 중이면 원래 금액에 취소선을 긋고, 아니면 평소 금액 그대로.
const priceEl = (cls, c, plain, discounted) => {
  const p = promoOf(c);
  return p
    ? `<span class="${cls} has-promo" data-promo-until="${p.until}" data-plain="${esc(plain)}">${discounted}</span>`
    : `<span class="${cls}">${plain}</span>`;
};
const campBy = (slug) => CAMPS.find((c) => c.slug === slug);

// ---------- 날짜 ----------
const WD = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const parts = (s) => s.split("-").map(Number);
const wdOf = (s) => { const [y, m, d] = parts(s); return WD[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]; };
const fmtBoard = (s) => { const [, m, d] = parts(s); return `${pad(m)}.${pad(d)}`; };
const fmtPass = (s) => { const [y, m, d] = parts(s); return `${pad(d)} ${MON[m - 1]} ${y}`; };
const fmtKo = (s) => { const [y, m, d] = parts(s); return `${y}년 ${m}월 ${d}일`; };
const fmtMd = (s) => { const [, m, d] = parts(s); return `${m}.${d}`; };

// 페이지 날짜 — 파일명 시드, 월 단위 고정(주 단위 회전 금지). 발행일은 사이트 공개일.
const LAUNCH = "2026-09-21";
function seedHash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h); }
function pageDates(seed) {
  const nowKst = new Date(Date.now() + 9 * 3600 * 1000);
  const y = nowKst.getUTCFullYear(), m = nowKst.getUTCMonth();
  const off = seedHash("m:" + seed) % 28;
  let mod = new Date(Date.UTC(y, m, 1 + off));
  if (mod.getTime() > nowKst.getTime()) mod = new Date(Date.UTC(y, m - 1, 1 + off));
  let iso = mod.toISOString().slice(0, 10);
  if (iso < LAUNCH) iso = LAUNCH;
  return { published: LAUNCH, modified: iso };
}

// ---------- 그림 ----------
const PLANE = "M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5Z";
const ICON_TEL = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1Z"/></svg>`;
/* 종이비행기 마크 — 로고·파비콘·OG 가 같은 그림을 쓴다. 도형은 무게중심을 원 중심에 맞춰 두었다(2026-09-22). */
const MARK = `<circle cx="17" cy="17" r="17" fill="#ff5b24"/><path d="M5.8 17.7 24.2 9.3l-5.6 17.2-3.9-6.8Z" fill="#fff"/><path d="m14.7 19.7 9.5-10.4-5.6 17.2Z" fill="#ffd9c9"/>`;
const LOGO_MARK = `<svg class="logo-mark" viewBox="0 0 34 34" aria-hidden="true">${MARK}</svg>`;
const FAVICON = "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34">${MARK}</svg>`);

const pine = (x, y, s, c = "#0b2a20") => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0-64 17-34H8l18 30h-52l18-30h-9Z" fill="${c}"/><rect x="-3" y="-4" width="6" height="14" fill="${c}"/></g>`;
const sheep = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-7" y="6" width="2.6" height="8" fill="#10231c"/><rect x="5" y="6" width="2.6" height="8" fill="#10231c"/><ellipse rx="13" ry="9" fill="#fffdf8"/><circle cx="-13" cy="-3" r="5" fill="#10231c"/></g>`;
const SCENES = {
  canada: `<rect width="300" height="360" fill="#0f3a2c"/><circle cx="212" cy="96" r="42" fill="#f5f0e6"/><g fill="#f5f0e6" opacity=".8"><circle cx="38" cy="52" r="2"/><circle cx="92" cy="110" r="1.6"/><circle cx="136" cy="40" r="2.4"/><circle cx="268" cy="176" r="2"/><circle cx="60" cy="176" r="2.2"/><circle cx="118" cy="196" r="1.6"/><circle cx="164" cy="150" r="2"/><circle cx="24" cy="128" r="1.6"/><circle cx="282" cy="40" r="1.8"/><circle cx="232" cy="206" r="1.6"/></g><path d="M0 246c50-34 104-30 156-8s96 26 144-14v136H0Z" fill="#1d5c46"/>${pine(52, 264, 1.1)}${pine(98, 252, 0.8)}${pine(238, 260, 1.25)}${pine(196, 270, 0.7)}<path d="M0 300c60-30 120 6 178-6s84-30 122-12v78H0Z" fill="#f5f0e6"/>${pine(140, 322, 1.5, "#0f3a2c")}`,
  newzealand: `<rect width="300" height="360" fill="#bfe3f2"/><circle cx="76" cy="96" r="38" fill="#ffd25e"/><g fill="#fff"><rect x="150" y="74" width="96" height="24" rx="12"/><rect x="178" y="56" width="56" height="24" rx="12"/></g><path d="M0 232c70-54 150-46 210-10s70 20 90 4v134H0Z" fill="#69b37d"/><path d="M0 272c50-30 120-34 170-6s90 22 130-10v104H0Z" fill="#2f8a57"/>${sheep(96, 262)}${sheep(142, 250, 0.8)}${sheep(232, 268, 1.1)}<path d="M0 318c80-28 170-20 300 10v32H0Z" fill="#14503c"/>`,
  japan: `<rect width="300" height="360" fill="#f6e4cc"/><circle cx="150" cy="158" r="94" fill="#ff5b24"/><g fill="#10231c"><path d="M38 136q112-26 224 0l-6 21q-106-22-212 0Z"/><rect x="62" y="182" width="176" height="13"/><rect x="82" y="150" width="16" height="172"/><rect x="202" y="150" width="16" height="172"/><rect x="143" y="154" width="14" height="30"/></g><rect y="318" width="300" height="42" fill="#0f4a37"/><g fill="#f6e4cc" opacity=".5"><rect x="122" y="328" width="56" height="5" rx="2.5"/><rect x="108" y="342" width="84" height="6" rx="3"/></g>`,
  malaysia: `<rect width="300" height="360" fill="#ffd25e"/><circle cx="178" cy="238" r="72" fill="#ff5b24"/><rect y="238" width="300" height="122" fill="#0f4a37"/><g stroke="#ffd25e" stroke-width="3" stroke-linecap="round" opacity=".55"><path d="M128 264h100M148 284h60M108 306h140M158 328h40"/></g><g stroke="#10231c" stroke-linecap="round" fill="none"><path d="M60 360c6-70 14-128 34-184" stroke-width="9"/><g stroke-width="8"><path d="M94 176c-30-22-58-20-80-2"/><path d="M94 176c-10-36-36-52-66-52"/><path d="M94 176c6-38 30-58 62-60"/><path d="M94 176c30-26 62-24 86-4"/><path d="M94 176c28-6 50 8 62 34"/></g></g>`,
  philippines: `<rect width="300" height="360" fill="#ff8d54"/><circle cx="208" cy="134" r="48" fill="#fff4dc"/><path d="M0 222c40-26 84-30 120-10s60 10 80 4 60-10 100 10v30H0Z" fill="#c9481a" opacity=".6"/><rect y="248" width="300" height="112" fill="#0b3327"/><g fill="#fff4dc" opacity=".5"><rect x="176" y="260" width="64" height="4" rx="2"/><rect x="188" y="276" width="40" height="4" rx="2"/><rect x="198" y="292" width="20" height="4" rx="2"/></g><g transform="translate(92 252)"><path d="M0-66v62h-40Z" fill="#fffdf8"/><path d="M6-52v48h30Z" fill="#ffd25e"/><path d="M-46 0h92l-12 16h-68Z" fill="#fffdf8"/></g>`,
  seoul: `<rect width="300" height="360" fill="#0f4a37"/><circle cx="150" cy="150" r="88" fill="#ffd25e"/><g fill="#10231c"><rect x="40" y="210" width="34" height="150"/><rect x="80" y="170" width="44" height="190"/><rect x="130" y="230" width="30" height="130"/><rect x="166" y="150" width="40" height="210"/><rect x="212" y="200" width="48" height="160"/></g><g fill="#ffd25e" opacity=".8"><rect x="90" y="186" width="6" height="8"/><rect x="104" y="186" width="6" height="8"/><rect x="90" y="206" width="6" height="8"/><rect x="176" y="170" width="6" height="8"/><rect x="190" y="190" width="6" height="8"/><rect x="224" y="218" width="6" height="8"/><rect x="240" y="238" width="6" height="8"/></g>`,
  globe: `<rect width="300" height="360" fill="#ff5b24"/><circle cx="150" cy="186" r="104" fill="#fff4dc"/><g fill="none" stroke="#10231c" stroke-width="2.4"><circle cx="150" cy="186" r="104"/><ellipse cx="150" cy="186" rx="46" ry="104"/><path d="M46 186h208M62 132h176M62 240h176"/></g><g transform="translate(224 86) rotate(38)"><path transform="scale(2.4) translate(-12 -12)" d="${PLANE}" fill="#10231c"/></g>`,
};
const DARK = new Set(["canada", "seoul"]);
const scene = (key) => `<svg viewBox="0 0 300 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${SCENES[key] || SCENES.globe}</svg>`;

// ---------- 공통 조각 ----------
const NAV = [
  ["camps.html", "캠프", "Camps", "camps"],
  ["study.html", "유학", "Study abroad", "study"],
  ["stpaul.html", "세인트폴 대치", "In Seoul", "stpaul"],
  ["college.html", "대학 진학", "College", "college"],
  ["safety.html", "안전·운영", "Care", "safety"],
  ["faq.html", "FAQ", "Questions", "faq"],
];
const absUrl = (file) => `${SITE.baseUrl}/${file === "index.html" ? "" : file}`;
const eb = (en, no) => `<div class="eb"><span class="serif">${en}</span>${no ? `<span class="mono">${no}</span>` : ""}</div>`;
const faqHtml = (list) => `<div class="faq">${list.map(([q, a]) => `<details><summary>${q}</summary><div class="a"><p>${a}</p></div></details>`).join("")}</div>`;
const faqLd = (list) => ({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: list.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a.replace(/<[^>]+>/g, "") } })) });
const listItems = (s) => s.split(", ").map((x) => `<li>${x}</li>`).join("");

function crumbsHtml(trail) {
  return `<nav class="crumbs" aria-label="현재 위치"><ol>${trail.map((c, i) => (i === trail.length - 1 ? `<li aria-current="page">${esc(c.label)}</li>` : `<li><a href="${c.href}">${esc(c.label)}</a></li>`)).join("")}</ol></nav>`;
}
function ctaBlock(title, text, course) {
  return `<section class="cta bg-t sheet"><div class="wrap">
  <h2 class="rv">${title}</h2>
  <p class="rv d1">${text}</p>
  <div class="btns rv d2"><a class="btn btn-k" href="#consult"${course ? ` data-course="${esc(course)}"` : ""}>상담 신청하기 <span class="ar">→</span></a><a class="btn btn-w" href="camps.html">출발 일정 보기</a></div>
</div></section>`;
}

function consultDrawer() {
  const campOpts = CAMPS.map((c) => `<option value="${esc(c.name)}">${c.name}</option>`).join("");
  const nextOpts = [...STUDY.map((s) => s.name), STPAUL.name, ELC.name, ...PATHWAYS.map((p) => p.name)].map((n) => `<option value="${esc(n)}">${n}</option>`).join("");
  const chips = ["일정·비용", "현지 학교 수업", "홈스테이·숙소", "인솔·현지 관리", "항공·출국 준비", "유학 연계"];
  return `<div class="ov" id="consultOv" aria-hidden="true">
  <div class="dr" role="dialog" aria-modal="true" aria-labelledby="consultTitle">
    <div class="dr-h" id="consult">
      <button type="button" class="dr-x" aria-label="닫기">✕</button>
      <span class="mono">Check-in · 상담 신청</span>
      <h2 id="consultTitle">학년과 궁금한 점만<br>남겨 주세요</h2>
      <p>나머지는 비워 두셔도 됩니다. 확인하고 연락드리겠습니다.</p>
    </div>
    <div class="dr-perf" aria-hidden="true"></div>
    <form class="fm" id="consultForm" autocomplete="off" data-ep="${esc(SITE.formEndpoint)}" data-site="${esc(BRAND)}">
      <div class="fm-2">
        <label>학생 이름 <b class="req">*</b><input type="text" name="이름" required placeholder="이름"></label>
        <div><span class="lb">연락처 <b class="req">*</b></span><div class="row"><select name="연락처앞" aria-label="연락처 앞자리"><option>010</option><option>011</option><option>016</option><option>017</option><option>018</option><option>019</option></select><input type="tel" name="연락처" required inputmode="numeric" placeholder="1234-5678" aria-label="연락처 뒷자리"></div></div>
      </div>
      <div><span class="lb">학년</span><div class="row"><select name="학교급" aria-label="학교급" style="flex:1"><option value="">선택</option><option>초등</option><option>중등</option><option>고등</option><option>기타</option></select><select name="학년수" aria-label="학년" style="flex:1" disabled><option value="">학년</option></select></div></div>
      <label>관심 과정<select name="관심과정"><option value="">선택해 주세요</option><optgroup label="${SITE.season} 캠프">${campOpts}</optgroup><optgroup label="유학·진학">${nextOpts}</optgroup><option value="여름캠프 사전 상담">여름캠프 사전 상담</option><option value="추천 받고 싶어요">추천 받고 싶어요</option></select></label>
      <div class="fm-2">
        <label>영어 수준<select name="영어수준"><option value="">선택</option><option>이제 막 배우는 단계</option><option>짧은 문장으로 대화</option><option>일상 대화 가능</option><option>자유롭게 대화</option></select></label>
        <label>해외 경험<select name="해외경험"><option value="">선택</option><option>없음</option><option>가족 여행만</option><option>캠프·어학연수 경험</option><option>해외 거주·유학 경험</option></select></label>
      </div>
      <div><span class="lb">상담 받고 싶은 내용 <em class="sub">여러 개 선택 가능</em></span><div class="chips">${chips.map((v) => `<label><input type="checkbox" name="궁금한점" value="${v}"><span>${v}</span></label>`).join("")}</div></div>
      <label>문의 내용<textarea name="문의내용" rows="4" placeholder="아이 성격, 복용 중인 약, 알레르기(음식·동물), 형제·자매 동반 여부, 걱정되는 점을 편하게 적어 주세요"></textarea></label>
      <div>
        <label class="agree"><input type="checkbox" name="개인정보동의" value="동의" checked required><span>개인정보 수집·이용에 동의합니다 <em class="sub">(필수)</em></span></label>
        <details class="agree-more"><summary>수집 항목·이용 목적·보유 기간 보기</summary>
          <ul>
            <li><b>수집 항목</b>학생 이름, 연락처, 학년, 관심 과정, 영어 수준, 해외 경험, 상담 희망 내용, 문의 내용, 접수 시각과 접수한 페이지 주소</li>
            <li><b>이용 목적</b>캠프·유학 상담 안내와 연락</li>
            <li><b>보유 기간</b>상담 목적을 달성하면 지체 없이 파기</li>
            <li><b>저장·전달</b>접수 내용은 구글 스프레드시트에 저장되고 상담 담당자 메일로 전달됩니다. 전달 항목은 위 수집 항목과 같습니다.</li>
            <li><b>동의 거부</b>동의하지 않으실 수 있습니다. 다만 연락처를 받을 수 없어 상담 안내가 어렵습니다.</li>
            <li><b>문의</b>개인정보 보호책임자 ${SITE.privacyEmail}</li>
            <li>만 14세 미만 학생은 학부모(법정대리인)가 작성하고 동의해 주세요.</li>
          </ul>
        </details>
      </div>
      <button type="submit" class="btn btn-t fm-go">상담 신청하기</button>
      <p class="fm-fine">남겨 주신 정보는 상담 목적으로만 사용합니다.</p>
    </form>
    <div class="fm-done" id="consultDone" hidden tabindex="-1">
      <div class="stamp"><span>RECEIVED<b>OK</b>${SITE.brandEn}</span></div>
      <b>상담 신청이 접수되었습니다</b>
      <p>확인하는 대로 순서대로 연락드리겠습니다.</p>
    </div>
  </div>
</div>`;
}

function footer(dateLabel) {
  return `<footer class="ft sheet">
  <div class="wrap">
    <div class="ft-word" aria-hidden="true">${SITE.brandEn}</div>
    <div class="ft-g">
      <div>
        <p class="ft-b">${BRAND}</p>
        <p>${SITE.tagline}<br>캐나다 · 뉴질랜드 · 일본 · 말레이시아 · 필리핀</p>
        <p style="margin-top:18px"><a class="btn btn-t btn-s" href="#consult">상담 신청 <span class="ar">→</span></a></p>
      </div>
      <div><h3>Camps</h3><ul>${CAMPS.map((c) => `<li><a href="${c.slug}.html">${c.short}</a></li>`).join("")}<li><a href="camps.html#compare">여섯 과정 비교</a></li></ul></div>
      <div><h3>Next gate</h3><ul><li><a href="study.html">중·고등 유학 안내</a></li>${STUDY.map((s) => `<li><a href="${s.slug}.html">${s.name}</a></li>`).join("")}<li><a href="stpaul.html">${STPAUL.name}</a></li><li><a href="college.html">대학 토플면제교육원</a></li><li><a href="pathway.html">교환학생 · 기숙학교 · 컨설팅</a></li></ul></div>
      <div><h3>Info</h3><ul><li><a href="safety.html">안전·운영 원칙</a></li><li><a href="safety.html#refund">환불 규정</a></li><li><a href="faq.html">자주 묻는 질문</a></li><li><a href="about.html">${BRAND} 소개</a></li></ul></div>
    </div>
    <p class="ft-fine">${josa(BRAND, "은", "는")} 해외캠프와 유학 과정을 안내하고 상담을 연결하는 페이지입니다. 일정과 비용은 항공·현지 사정에 따라 달라질 수 있습니다. 문의는 상담 신청 양식을 이용해 주세요.<br>${SITE.source}<span class="ft-date">정보 업데이트 ${dateLabel}</span></p>
  </div>
</footer>`;
}

const PAGES = [];
function page({ file, title, desc, body, ld = [], crumbs = null, course = "", cur = "", index = true }) {
  if (desc.length > 80) console.warn(`⚠ 설명문 ${desc.length}자 (네이버 권고 80자): ${file}`);
  const url = absUrl(file);
  const { published, modified } = pageDates(file);
  const allLd = [...ld, { "@context": "https://schema.org", "@type": "WebPage", name: title, description: desc, url, datePublished: published, dateModified: modified, inLanguage: "ko-KR" }];
  if (crumbs && crumbs.length > 1) allLd.push({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: c.href ? absUrl(c.href) : url })) });
  const noindex = !SITE.domainReady || !index;
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${noindex ? `<meta name="robots" content="noindex">` : `<link rel="canonical" href="${url}">`}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(BRAND)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE.baseUrl}/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="ko_KR">
<meta property="article:published_time" content="${published}T00:00:00+09:00">
<meta property="article:modified_time" content="${modified}T00:00:00+09:00">
<meta name="theme-color" content="#f5f0e6">
${(SITE.verifyGoogle || "").split(",").map((c) => c.trim()).filter(Boolean).map((c) => `<meta name="google-site-verification" content="${esc(c)}">`).join("\n")}
${(SITE.verifyNaver || "").split(",").map((c) => c.trim()).filter(Boolean).map((c) => `<meta name="naver-site-verification" content="${esc(c)}">`).join("\n")}
<link rel="icon" href="${FAVICON}">
<link rel="alternate" type="application/rss+xml" title="${esc(BRAND)}" href="${SITE.baseUrl}/rss.xml">
<noscript><style>.rv{opacity:1;transform:none}</style></noscript>
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&amp;family=DM+Mono:wght@400;500&amp;family=Instrument+Serif:ital@0;1&amp;display=swap">
<link rel="stylesheet" href="style.css?v=${CSS_VER}">
${allLd.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n")}
</head>
<body${course ? ` data-course="${esc(course)}"` : ""}>
<a class="skip" href="#main">본문으로 건너뛰기</a>
<header class="hd" id="hd">
  <div class="wrap hd-in">
    <a class="logo" href="index.html" aria-label="${esc(BRAND)} 홈">${LOGO_MARK}<span class="logo-txt"><b>${SITE.brandEn}</b><small>${SITE.navSub}</small></span></a>
    <nav class="gnb" aria-label="주 메뉴">${NAV.map(([h, k, , key]) => `<a href="${h}"${cur === key ? ` aria-current="page"` : ""}>${k}</a>`).join("")}</nav>
    <a class="hd-cta" href="#consult">상담 신청</a>
    <button type="button" class="burger" id="burger" aria-label="메뉴 열기" aria-expanded="false" aria-controls="mnav"><i></i><i></i></button>
  </div>
</header>
<nav class="mnav" id="mnav" aria-label="모바일 메뉴">
  ${NAV.map(([h, k, en]) => `<a href="${h}">${k}<small>${en}</small></a>`).join("\n  ")}
  <a href="about.html">소개<small>About</small></a>
  <a class="btn btn-t" href="#consult">상담 신청 <span class="ar">→</span></a>
</nav>
<main id="main">
${body}
</main>
${footer(modified.replace(/-/g, "."))}
<div class="fab" id="fab">
  <a class="fab-tel" href="tel:${SITE.phone.tel}" aria-label="전화 상담 ${SITE.phone.display}">${ICON_TEL}전화 상담</a>
  <a class="fab-go" href="#consult">상담 신청</a>
</div>
${consultDrawer()}
${SITE.trackKey ? `<script defer src="https://xn--vb0by3y5wigqb.com/t.js" data-site="${esc(SITE.trackKey)}"></script>\n` : ""}<script defer src="app.js?v=${JS_VER}"></script>
</body>
</html>`;
  PAGES.push({ file, html, modified, index });
}

// 하위 페이지 머리
function pageHero({ trail, kicker, h1, lead, art, iso, cta = "", bgiso = "" }) {
  return `<section class="ph">
  ${bgiso ? `<div class="ph-bgiso" aria-hidden="true">${bgiso}</div>` : ""}
  <div class="wrap">
    ${crumbsHtml(trail)}
    <div class="ph-g${art ? "" : " solo"}">
      <div>
        <div class="ph-kind"><span class="serif">${kicker}</span></div>
        <h1>${h1}</h1>
        <p class="lead">${lead}</p>
        ${cta ? `<div class="ph-cta">${cta}</div>` : ""}
      </div>
      ${art ? `<div class="ph-art${DARK.has(art) ? " dk" : ""}">${scene(art)}${iso ? `<span class="poster-iso">${iso}</span>` : ""}</div>` : ""}
    </div>
  </div>
</section>`;
}
const block = (en, h2, inner, cls = "", id = "") => `<section class="blk${cls ? " " + cls : ""}"${id ? ` id="${id}"` : ""}><div class="wrap blk-h"><header class="rv"><span class="serif">${en}</span><h2>${h2}</h2></header><div class="rv d1">${inner}</div></div></section>`;
const shots = (list) => `<div class="shots" style="margin-top:60px">${list.map(([src, alt, cap]) => `<figure class="shot"><img src="img/${src}" alt="${esc(alt)}" loading="lazy" width="800" height="600"><figcaption>${cap}</figcaption></figure>`).join("")}</div>`;
const HOME = { label: "홈", href: "index.html" };

// ============================================================
// 홈
// ============================================================
function boardRow(c) {
  const extra = c.slug === "camp-newzealand" ? `<small>4주 과정은 1.29 출발</small>` : `<small>${c.kind}</small>`;
  return `<a class="board-r" href="${c.slug}.html">
  <span class="b-date">${fmtBoard(c.depart)}<small>${wdOf(c.depart)} · ${parts(c.depart)[0]}</small></span>
  <span class="b-city">${c.city}<small>${c.countryKo}</small></span>
  <span class="b-name">${c.name}${extra}</span>
  <span class="b-meta"><span class="b-c">${c.weeks}</span><span class="b-c">${c.target}</span></span>
  ${priceEl("b-price", c, `${c.price}<small>${c.air}</small>`, `${(c.promo || {}).priceAfter}<small><s>${c.price}</s> · ${c.air}</small>`)}
  <span class="b-st" data-deadline="${c.deadline}" data-closed="마감 · 문의">모집 중<br>${fmtMd(c.deadline)} 마감</span>
</a>`;
}
const BOARD = () => `<div class="board rv d1">
  <div class="board-h" aria-hidden="true"><span>출발</span><span>목적지</span><span>과정</span><span>기간</span><span>대상</span><span>참가비</span><span>모집</span></div>
  ${CAMPS.map(boardRow).join("\n")}
</div>`;

function posterCard(dst) {
  return `<article class="poster">
  <div class="poster-art${DARK.has(dst.key) ? " dk" : ""}">${scene(dst.key)}<span class="poster-iso">${dst.iso}</span></div>
  <div class="poster-b">
    <h3>${dst.ko} <em>${dst.en}</em></h3>
    <p>${dst.line}</p>
    <div class="poster-l">${dst.camps.map((s) => `<a href="${s}.html">${campBy(s).short} →</a>`).join("")}</div>
  </div>
</article>`;
}

function buildHome() {
  const passList = CAMPS.map((c) => ({ to: c.city, ko: c.short, date: fmtPass(c.depart), len: c.weeks, who: c.target.replace(/ ~ /, " – "), iso: c.iso, href: `${c.slug}.html` }));
  const p0 = passList[0];
  const mqItems = ["NIAGARA", "AUCKLAND", "KYOTO", "JOHOR BAHRU", "CLARK"].map((x) => `${x} <i>✈</i>`).join(" ") + ` <em>${SITE.seasonEn.toLowerCase()}</em> <i>✈</i> `;
  const gates = [
    ["A", "study.html", "중·고등 유학", "뉴질랜드 Waiuku College, 캐나다 나이아가라 교육청. 캠프가 열린 바로 그 학교로 이어집니다."],
    ["B", "stpaul.html", STPAUL.name, "집에서 통학하면서 8~12학년 과정을 전 과목 영어로 공부합니다. 서울 대치동."],
    ["C", "college.html", "미국·캐나다 대학 토플면제", "국내 6개월 공인 ESL 과정을 마치고 TOEFL·SAT·내신 없이 진학합니다."],
    ["D", "pathway.html", "교환학생 · 기숙학교 · 컨설팅", "미국 공립 교환학생 1년, EF Academy, 성적표에서 시작하는 대학 입학 컨설팅."],
  ];
  const body = `<section class="hero">
  <div class="wrap hero-grid">
    <div>
      <div class="hero-k"><span class="dot" aria-hidden="true"></span><span class="mono">Now boarding — ${SITE.seasonEn}</span><span class="mono" style="opacity:.55">Seoul → 5 countries · 6 departures</span></div>
      <h1><span class="l"><span>겨울방학 동안만,</span></span><span class="l"><span>다른 나라 학생으로</span></span><span class="l"><span><em>just for winter.</em></span></span></h1>
      <p class="hero-sub">캐나다와 뉴질랜드는 현지 학교에 그대로 들어갑니다. 말레이시아와 필리핀은 영어 수업을 종일 듣고, 교토는 일본어 연수입니다. 2027년 1월, 여섯 편이 출발합니다.</p>
      <div class="hero-cta"><a class="btn btn-k" href="#departures">출발 일정 보기 <span class="ar">↓</span></a><a class="btn btn-o" href="#consult">상담 신청</a></div>
    </div>
    <div class="hero-art" aria-label="출발 과정 미리 보기">
      <svg class="hero-arc" viewBox="0 0 900 500" aria-hidden="true"><path d="M40 430C240 60 620 30 870 250"/><path d="M40 430C300 210 560 190 830 410" opacity=".3"/><g class="plane"><path transform="rotate(90) scale(1.5) translate(-12 -12)" d="${PLANE}"/><animateMotion dur="16s" repeatCount="indefinite" rotate="auto" path="M40 430C240 60 620 30 870 250"/></g></svg>
      <div class="pass-2" aria-hidden="true"><small>ON BOARD WITH</small><p>인솔자 동행 · 현지 관리자 상주<br>학부모 밴드 공유</p></div>
      <a class="pass" id="pass" href="${p0.href}" data-list='${esc(JSON.stringify(passList))}'>
        <div class="pass-main">
          <div class="pass-top"><b>BOARDING PASS</b><span class="mono">${SITE.seasonEn}</span></div>
          <div class="pass-route">
            <div><small>FROM</small><strong>SEOUL</strong></div>
            <div class="pass-line" aria-hidden="true"><svg viewBox="0 0 24 24"><path transform="rotate(90 12 12)" d="${PLANE}"/></svg></div>
            <div class="pass-to"><small>TO · <span class="flap" data-f="iso">${p0.iso}</span></small><strong><span class="flap" data-f="to">${p0.to}</span></strong></div>
          </div>
          <div class="pass-meta">
            <div><small>DATE</small><span class="flap" data-f="date">${p0.date}</span></div>
            <div><small>LENGTH</small><span class="flap" data-f="len">${p0.len}</span></div>
            <div><small>PASSENGER</small><span class="flap" data-f="who">${p0.who}</span></div>
          </div>
          <div class="pass-meta" style="grid-template-columns:1fr;border-top:0;padding:10px 0 0 78px"><div><small>PROGRAM</small><span class="flap" data-f="ko">${p0.ko}</span></div></div>
        </div>
        <div class="pass-stub" aria-hidden="true"><small>GATE</small><b>2027</b><div class="barcode"></div></div>
        <div class="stamp" aria-hidden="true"><span>DEPARTURE<b>SEL</b>${SITE.seasonEn}</span></div>
      </a>
    </div>
  </div>
  <div class="mq" aria-hidden="true"><div class="mq-t"><span>${mqItems.repeat(3)}</span><span>${mqItems.repeat(3)}</span></div></div>
</section>

<section class="sec bg-ink" id="departures">
  <div class="wrap">
    <div class="sh"><div class="rv">${eb("Departures", "01 — " + SITE.seasonEn)}<h2>${SITE.season}, 여섯 편이<br>출발합니다</h2></div>
    <p class="rv d1">참가비에 항공료가 든 과정과 아닌 과정이 섞여 있습니다. 금액 아래 표기를 꼭 같이 보세요.</p></div>
    ${BOARD()}
    <div class="board-f rv d2"><span>일정과 비용은 항공·현지 사정에 따라 달라질 수 있습니다.</span><a class="more" href="camps.html#compare">여섯 과정 나란히 비교하기 <span>→</span></a></div>
  </div>
</section>

<section class="sec bg-paper sheet">
  <div class="wrap">
    <div class="sh"><div class="rv">${eb("Find yours", "02")}<h2>목적부터 정하면<br>고르기 쉽습니다</h2></div>
    <p class="rv d1">여섯 과정이 비슷해 보여도 하루 일과는 꽤 다릅니다. 아래에서 해당되는 줄을 고르면 두세 개로 좁혀집니다.</p></div>
    <div class="fd">
      ${FINDER.map((f, i) => `<div class="fd-r rv"><span class="fd-n">${pad(i + 1)}<em>${f.en}</em></span><p class="fd-q">${f.q}</p><div class="fd-c">${f.camps.map((s) => `<a class="chip" href="${s}.html">${campBy(s).short} →</a>`).join("")}</div></div>`).join("\n      ")}
    </div>
  </div>
</section>

<section class="sec bg-paper" style="padding-top:20px">
  <div class="wrap">
    <div class="sh"><div class="rv">${eb("Destinations", "03")}<h2>가는 나라는<br>다섯 곳입니다</h2></div>
    <p class="rv d1">같은 1월인데 나이아가라는 영하, 와이우쿠는 한여름입니다. 학교 일정도 나라마다 다릅니다.</p></div>
  </div>
  <div class="wrap"><p class="hs-hint hs-m">다섯 나라를 옆으로 밀어서 볼 수 있습니다.</p></div>
  <div class="posters rv d1" tabindex="0" role="region" aria-label="나라별 과정 다섯 장">${DESTINATIONS.map(posterCard).join("\n")}</div>
  <div class="wrap"><p class="posters-hint">Drag or swipe</p></div>
</section>

<section class="sec bg-forest sheet">
  <div class="wrap">
    <div class="bigstat rv"><b>16,000+</b><span>운영사가 지금까지 함께 다녀온 학생 수입니다(운영사 자료 기준).</span></div>
    <div class="sh"><div class="rv">${eb("Care", "04")}<h2>현지에서 누가<br>아이를 챙기나</h2></div>
    <p class="rv d1">한밤중에 아이가 아프면 누가 병원에 데려가는지, 홈스테이와 안 맞으면 누가 나서는지. 출국 전에 정해 두는 것들입니다.</p></div>
    <ul class="sf">${COMMON.safety.map(([t, p], i) => `<li class="rv"><span class="n">${pad(i + 1)}</span><h3>${t}</h3><p>${p}</p></li>`).join("")}</ul>
    <p class="rv" style="margin-top:44px"><a class="more" href="safety.html">신청 절차와 환불 규정까지 보기 <span>→</span></a></p>
  </div>
</section>

<section class="sec bg-paper2 sheet">
  <div class="wrap">
    <div class="sh"><div class="rv">${eb("Postcards", "05")}<h2>다녀온 학생 후기</h2></div>
    <p class="rv d1">운영사에 남은 후기를 원문 그대로 실었습니다. 이름은 일부 가렸습니다.</p></div>
    <div class="cards">${REVIEWS.map((r, i) => `<figure class="pc rv d${i + 1}"><div class="pc-top"><span class="mono">${r.program}</span><span class="pc-st" aria-hidden="true">${r.camp ? campBy(r.camp).iso : "USA"}</span></div><blockquote><q>${r.text}</q></blockquote><figcaption class="pc-who">${r.who}${r.camp ? `<a href="${r.camp}.html"><span>과정 보기 →</span></a>` : "<span></span>"}</figcaption></figure>`).join("")}</div>
  </div>
</section>

<section class="sec bg-paper sheet">
  <div class="wrap">
    <div class="sh"><div class="rv">${eb("Next gate", "06")}<h2>캠프가 끝난 다음</h2></div>
    <p class="rv d1">3주 다녀오고 나서 유학을 묻는 분이 많습니다. 그때 갈 수 있는 길이 네 갈래입니다.</p></div>
    <div class="gates">${gates.map(([k, h, t, p]) => `<a class="gate rv" href="${h}"><span class="gate-k">GATE<b>${k}</b></span><h3>${t}</h3><p>${p}</p><span class="gate-a" aria-hidden="true">→</span></a>`).join("")}</div>
  </div>
</section>

<section class="sec bg-card sheet">
  <div class="wrap-n">
    <div class="sh one"><div class="rv">${eb("FAQ", "07")}<h2>자주 묻는 질문</h2></div></div>
    <div class="rv d1">${faqHtml(COMMON.faq.slice(0, 5))}</div>
    <p class="rv" style="margin-top:36px"><a class="more" href="faq.html">질문 전체 보기 <span>→</span></a></p>
  </div>
</section>

${ctaBlock("어디로 갈지 아직 몰라도 됩니다", "학년만 알려 주시면 맞는 과정을 골라 드립니다. 상담했다고 신청해야 하는 건 아닙니다.")}`;
  page({
    file: "index.html",
    title: `${BRAND} | ${SITE.season}방학 해외캠프 · 스쿨링 · 중고등 유학`,
    desc: "캐나다·뉴질랜드 스쿨링, 교토 일본어 연수, 말레이시아·필리핀 영어캠프. 2027 겨울 여섯 과정의 일정과 비용.",
    body,
    ld: [
      { "@context": "https://schema.org", "@type": "Organization", name: BRAND, alternateName: SITE.brandEn, url: SITE.baseUrl + "/", telephone: "+82-" + SITE.phone.display.slice(1), description: SITE.tagline },
      { "@context": "https://schema.org", "@type": "WebSite", name: BRAND, url: SITE.baseUrl + "/", inLanguage: "ko-KR" },
    ],
  });
}

// ============================================================
// 캠프 목록 · 비교
// ============================================================
function buildCamps() {
  const trail = [HOME, { label: "캠프" }];
  const rows = CAMPS.map((c) => `<a class="rowc rv" href="${c.slug}.html"><span class="iso">${c.iso}<small>${fmtBoard(c.depart)} ${wdOf(c.depart)}</small></span><div><h3>${c.name}${promoOf(c) ? ` <em class="promo-tag" data-promo-until="${promoOf(c).until}">${promoOf(c).badge}</em>` : ""}</h3><p>${c.tag}</p></div><dl><dt>WHEN</dt><dd>${c.period}</dd><dt>WHO</dt><dd>${c.targetLong}</dd><dt>STAY</dt><dd>${c.kind.split(" · ").slice(-1)[0]}</dd></dl>${priceEl("pr", c, `${c.price}<small>${c.air}</small>`, `${(c.promo || {}).priceAfter}<small><s>${c.price}</s> · ${c.air}</small>`)}<span class="go" aria-hidden="true">→</span></a>`).join("\n");
  const cmp = `<p class="hs-hint hs-816">참가비와 신청 마감은 표를 옆으로 밀면 나옵니다.</p>
  <div class="tw rv d1" tabindex="0" role="region" aria-label="여섯 과정 비교표, 칸 8개"><table class="tb"><thead><tr><th>과정</th><th>기간</th><th>대상</th><th>정원</th><th>수업</th><th>숙소</th><th>참가비</th><th>신청 마감</th></tr></thead><tbody>${CAMPS.map((c) => `<tr><th><a href="${c.slug}.html">${c.short}</a></th><td>${c.period}</td><td>${c.targetLong}</td><td>${c.capacity}</td><td>${c.schoolShort}</td><td>${c.stayShort}</td><td>${promoOf(c) ? `<span class="has-promo" data-promo-until="${promoOf(c).until}" data-plain="${esc(`<b>${c.priceFull || c.price}</b><br>${c.air}`)}"><b>${promoOf(c).priceAfter}</b><br><s>${c.price}</s> · ${c.air}</span>` : `<b>${c.priceFull || c.price}</b><br>${c.air}`}</td><td>${fmtKo(c.deadline)}</td></tr>`).join("")}</tbody></table></div>`;
  const body = `${pageHero({ trail, kicker: "Departures", h1: `${SITE.season},<br>여섯 개 과정`, lead: "스쿨링이 셋, 영어캠프가 둘, 일본어 연수가 하나입니다. 아래 비교표에 기간과 금액을 나란히 놓았습니다.", art: "globe", cta: `<a class="btn btn-k" href="#compare">비교표로 가기 <span class="ar">↓</span></a><a class="btn btn-o" href="#consult">상담 신청</a>` })}
<section class="sec bg-paper" style="padding-top:40px"><div class="wrap"><div class="rows">${rows}</div></div></section>
<section class="sec bg-paper2 sheet" id="compare"><div class="wrap">
  <div class="sh"><div class="rv">${eb("Side by side", "Compare")}<h2>나란히 놓고 보기</h2></div><p class="rv d1">참가비를 볼 때는 항공료가 들어 있는지부터 확인하세요. 캐나다와 뉴질랜드는 항공 별도, 일본·말레이시아·필리핀은 왕복 항공이 들어 있는 금액입니다.</p></div>
  ${cmp}
</div></section>
<section class="blk bg-paper sheet"><div class="wrap blk-h"><header class="rv"><span class="serif">How to choose</span><h2>고르는 기준 세 가지</h2></header><div class="rv d1">
  <ul class="pts">
    <li><span class="n">01</span><h3>학교에 다닐지, 수업을 들을지</h3><p>캐나다와 뉴질랜드는 현지 학생이 다니는 학교에 들어가 같은 시간표로 지내는 스쿨링입니다. 말레이시아와 필리핀은 우리 학생들끼리 영어 수업을 집중해서 듣는 캠프입니다. 앞쪽은 환경에 적응하는 경험이 크고, 뒤쪽은 수업 시간 자체가 깁니다.</p></li>
    <li><span class="n">02</span><h3>홈스테이인지, 단체 숙소인지</h3><p>캐나다·뉴질랜드·일본은 현지 가정에서 지냅니다. 말레이시아는 호텔, 필리핀은 대학 기숙사에서 인솔교사와 함께 지냅니다. 초등 저학년이거나 해외가 처음이라면 단체 숙소 쪽이 마음 편한 경우가 많습니다.</p></li>
    <li><span class="n">03</span><h3>몇 주를 비울 수 있는지</h3><p>2주부터 7주까지 있습니다. 7주 과정은 한국 학교의 체험학습 처리 기준을 먼저 확인하셔야 합니다. 학년과 학교마다 달라 상담 때 다른 가정의 사례를 알려 드립니다.</p></li>
  </ul>
  <p style="margin-top:34px"><a class="more" href="safety.html#apply">신청 절차 보기 <span>→</span></a></p>
</div></div></section>
${ctaBlock("비교해도 고르기 어렵다면", "아이 학년과 비울 수 있는 기간을 말씀해 주세요. 두 개까지 좁혀 드리겠습니다.", "추천 받고 싶어요")}`;
  page({ file: "camps.html", title: `${SITE.season}방학 해외캠프 6개 과정 일정·비용 비교 | ${BRAND}`, desc: "캐나다 스쿨링 3주·7주, 뉴질랜드 3~7주, 교토 2주, 말레이시아·필리핀 4주. 기간·대상·참가비·마감일 비교표.", body, crumbs: trail, cur: "camps" });
}

// ============================================================
// 캠프 상세
// ============================================================
function campDesc(c) {
  const base = `${c.name}. ${c.period.replace(/\(.\)/g, "")}, ${c.target}, ${c.price}(${c.air}).`;
  const more = ` ${c.kind}.`;
  if ((base + more).length <= 80) return base + more;
  if (base.length <= 80) return base;
  return `${c.name}. ${c.target}, ${c.priceFull || c.price}(${c.air}).`;
}
function buildCamp(c) {
  const trail = [HOME, { label: "캠프", href: "camps.html" }, { label: c.short }];
  const faqs = c.faq.length ? c.faq : COMMON.faq.slice(0, 4);
  const rest = CAMPS.filter((x) => x.slug !== c.slug);
  const rank = (x) => (x.country === c.country ? 0 : x.cat === c.cat ? 1 : 2);
  const more = rest.map((x, i) => [rank(x), i, x]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).slice(0, 2).map((t) => t[2]);
  const iti = c.schedule ? block("Itinerary", "날짜별 일정", `<div class="iti"><ol>${c.schedule.map(([d, w, t]) => `<li${/토|일/.test(w) && !/~/.test(w) ? ` class="we"` : ""}><span class="d">${d}${w ? `<small>${w}</small>` : ""}</span><span>${esc(t)}</span></li>`).join("")}</ol><p class="iti-more"><button type="button" class="btn btn-o btn-s">일정 전체 펼치기 ↓</button></p></div><p class="fine">현지 학교와 날씨 사정으로 순서가 바뀔 수 있습니다.</p>`, "bg-paper sheet") : "";
  const body = `${pageHero({ trail, kicker: `${c.kindEn} · ${DESTINATIONS.find((d) => d.key === c.country).en}`, h1: c.name, lead: `${promoOf(c) ? `<span class="promo-chip" data-promo-until="${promoOf(c).until}">${promoOf(c).badge} · ${promoOf(c).cond}</span>` : ""}${c.tag}`, art: c.country, iso: c.iso, bgiso: c.iso, cta: `<a class="btn btn-t" href="#consult">이 과정 상담 신청 <span class="ar">→</span></a><a class="btn btn-o" href="camps.html#compare">다른 과정과 비교</a>` })}
<div class="wrap"><div class="tk rv">
  <div><small>When</small><b>${c.weeks}</b><span>${c.period}</span></div>
  <div><small>Who</small><b>${c.target}</b><span>${c.targetLong}</span></div>
  <div><small>Seats</small><b>${c.capacity.split(" (")[0]}</b><span>${c.capacity.includes("(") ? c.capacity.slice(c.capacity.indexOf("(") + 1, -1) : c.route}</span></div>
  ${promoOf(c)
    ? `<div class="hl has-promo" data-promo-until="${promoOf(c).until}" data-plain="${esc(`<small>Fee</small><b>${c.price}</b><span>${c.priceFull ? c.priceFull + " · " : ""}${c.air}</span>`)}"><small>Fee · ${promoOf(c).badge}</small><b>${promoOf(c).priceAfter}</b><span><s>${c.price}</s> · ${c.air}</span></div>`
    : `<div class="hl"><small>Fee</small><b>${c.price}</b><span>${c.priceFull ? c.priceFull + " · " : ""}${c.air}</span></div>`}
  <div><small>Apply by</small><b data-deadline="${c.deadline}" data-closed="마감 · 잔여석 문의">${fmtKo(c.deadline)}</b><span>신청 마감일</span></div>
</div></div>
${block("Highlights", "이 과정의 뼈대", `<ul class="pts">${c.points.map(([t, p], i) => `<li><span class="n">${pad(i + 1)}</span><h3>${t}</h3><p>${p}</p></li>`).join("")}</ul>`)}
${block("School & stay", "어디서 배우고 어디서 자나", `<div class="duo"><div class="box"><h3>School</h3><h4>${c.school}</h4><p>${c.schoolDesc}</p></div><div class="box"><h3>Stay</h3><h4>${c.kind.split(" · ").slice(-1)[0]}</h4><p>${c.stay}</p></div></div>${c.photos.length ? shots(c.photos) : ""}`)}
${block("Good fit", "이런 학생에게 맞습니다", `<ul class="pts">${(CAMP_FIT[c.slug] || []).map((t, i) => `<li style="grid-template-columns:60px 1fr"><span class="n">${pad(i + 1)}</span><p style="grid-column:2;font-size:18.5px;color:inherit">${t}</p></li>`).join("")}</ul>`, "bg-forest sheet")}
${iti}
${block("Fee", "참가비에 든 것, 안 든 것", `<div class="duo"><div class="box"><h3><i>+</i>포함</h3><ul>${listItems(c.includes)}</ul></div><div class="box minus"><h3><i>−</i>불포함</h3><ul>${listItems(c.excludes)}</ul></div></div><div class="note">${promoOf(c) ? `<b>할인</b><span data-promo-until="${promoOf(c).until}">${promoOf(c).detail}</span>` : ""}<b>참가비</b><span>${c.priceFull || c.price} — ${c.priceNote}</span><b>용돈</b><span>${c.pocket}</span><b>그다음</b><span>${c.extend}</span></div>`, iti ? "tight" : "bg-paper sheet")}
${c.safety ? block("Safety", "이 과정의 안전 관리", `<div class="box"><ul>${c.safety.map((s) => `<li>${s}</li>`).join("")}</ul></div><p style="margin-top:24px"><a class="more" href="safety.html">공통 안전 원칙과 환불 규정 <span>→</span></a></p>`, "tight") : ""}
${block("Q&A", "이 과정에서 자주 나오는 질문", `${faqHtml(faqs)}<p style="margin-top:30px"><a class="more" href="faq.html">질문 전체 보기 <span>→</span></a></p>`, "tight")}
<section class="blk tight"><div class="wrap"><div class="sh"><div class="rv">${eb("Also boarding", "")}<h2>같이 보면 좋은 과정</h2></div></div><div class="rows">${more.map((x) => `<a class="rowc rv" href="${x.slug}.html"><span class="iso">${x.iso}<small>${fmtBoard(x.depart)} ${wdOf(x.depart)}</small></span><div><h3>${x.name}</h3><p>${x.tag}</p></div><dl><dt>WHEN</dt><dd>${x.period}</dd><dt>WHO</dt><dd>${x.target}</dd></dl><span class="pr">${x.price}<small>${x.air}</small></span><span class="go" aria-hidden="true">→</span></a>`).join("")}</div></div></section>
${ctaBlock("남은 자리부터 확인해 드립니다", "정원이 학년별로 나뉘어 있는 과정이 있습니다. 연락처를 남겨 주시면 지금 상황을 확인해 드리겠습니다.", c.name)}`;
  page({
    file: `${c.slug}.html`,
    title: `${c.name} | 일정·비용·대상 | ${BRAND}`,
    desc: campDesc(c),
    body, crumbs: trail, course: c.name, cur: "camps",
    ld: [faqLd(faqs), { "@context": "https://schema.org", "@type": "Course", name: c.name, description: c.tag, provider: { "@type": "Organization", name: BRAND, url: SITE.baseUrl + "/" }, hasCourseInstance: { "@type": "CourseInstance", courseMode: "onsite", startDate: c.depart, endDate: c.back, location: c.countryKo } }],
  });
}

// ============================================================
// 유학
// ============================================================
function buildStudy() {
  const trail = [HOME, { label: "유학" }];
  const [nz, ca] = STUDY;
  const vsBox = (s) => `<div class="box rv"><h4>${s.name.replace(" 중·고등 유학", "").replace(" 관리형", "")} <em>${s.iso}</em></h4><p>${s.tag}</p><dl><dt>SCHOOL</dt><dd>${s.en}</dd><dt>START</dt><dd>${s.unit}</dd><dt>DIPLOMA</dt><dd>${s.diploma}</dd><dt>COST</dt><dd><b>${s.price}</b></dd><dt>WHO</dt><dd>${s.target}</dd></dl><a class="btn btn-k btn-s" href="${s.slug}.html">자세히 보기 <span class="ar">→</span></a></div>`;
  const body = `${pageHero({ trail, kicker: "Study abroad", h1: "캠프가 열린<br>그 학교로, 유학", lead: "뉴질랜드는 Waiuku College, 캐나다는 나이아가라 가톨릭 교육청입니다. 둘 다 겨울캠프가 진행되는 곳이라 미리 다녀 본 뒤에 결정할 수 있습니다. 캠프를 거치지 않은 학생도 상담받을 수 있습니다.", art: "newzealand", cta: `<a class="btn btn-t" href="#consult" data-course="추천 받고 싶어요">유학 상담 신청 <span class="ar">→</span></a>` })}
<section class="sec bg-paper" style="padding-top:30px"><div class="wrap"><div class="vs">${vsBox(nz)}${vsBox(ca)}</div></div></section>
<section class="sec bg-paper2 sheet"><div class="wrap">
  <div class="sh"><div class="rv">${eb("Side by side", "NZL vs CAN")}<h2>두 나라를 한 표에</h2></div><p class="rv d1">연간 비용은 1,050만원 차이가 납니다. 다만 포함된 항목과 관리 방식이 달라서 금액만 놓고 고르기는 어렵습니다.</p></div>
  <p class="hs-hint hs-816">캐나다 칸은 표를 옆으로 밀면 나옵니다.</p>
  <div class="tw rv d1" tabindex="0" role="region" aria-label="뉴질랜드·캐나다 비교표, 칸 3개"><table class="tb"><thead><tr><th></th><th>${nz.name}</th><th>${ca.name}</th></tr></thead><tbody>
    <tr><th>학교</th><td>${nz.en} (공립, Year 9~13)</td><td>${ca.en} 소속 고교 8곳 가운데 배정</td></tr>
    <tr><th>시작 단위</th><td>${nz.unit}. 한 텀만 다녀 볼 수 있습니다</td><td>${ca.unit}</td></tr>
    <tr><th>학기</th><td>${nz.terms}</td><td>${ca.terms}</td></tr>
    <tr><th>졸업장</th><td>${nz.diploma}</td><td>${ca.diploma}</td></tr>
    <tr><th>연 비용</th><td><b>${nz.price}</b></td><td><b>${ca.price}</b> (9학년 이상)</td></tr>
    <tr><th>포함</th><td>${nz.includes}</td><td>${ca.includes}</td></tr>
    <tr><th>관리</th><td>학교 국제학생 담당 선생님 + 홈스테이 관리자</td><td>법적 가디언을 맡는 현지 관리 선생님, 월 1회 리포트</td></tr>
    <tr><th>방학</th><td>현지 여름방학(12~1월)에 귀국 또는 체류 선택</td><td>여름방학(약 2개월)에 귀국, 겨울방학은 호스트 가족과</td></tr>
  </tbody></table></div>
</div></section>
${block("Which one", "어느 쪽이 맞을까", `<div class="prose"><p><strong>짧게 시작해 보고 싶다면 뉴질랜드입니다.</strong> 연 4텀 학제라 10주 한 텀만 다녀 본 뒤에 이어 갈지 정할 수 있습니다. 유학생 비율을 5% 아래로 유지하는 학교여서 교실에 들어가면 주변이 거의 현지 학생입니다.</p><p><strong>관리가 촘촘한 쪽을 원한다면 캐나다입니다.</strong> 현지 관리 선생님이 법적 가디언을 맡고 매달 리포트를 보냅니다. 과목 선택과 졸업 요건(필수 19학점, 봉사 40시간, OSSLT)까지 챙기기 때문에 졸업과 대학 진학을 목표로 하는 중·상위권 학생에게 권합니다.</p><p>두 곳 모두 겨울캠프가 열리는 학교와 교육청입니다. 결정을 못 하겠다면 <a href="camp-newzealand.html">뉴질랜드 캠프</a>나 <a href="camp-canada-3week.html">캐나다 3주 스쿨링</a>을 먼저 다녀오는 것이 가장 확실한 비교입니다.</p></div>`, "bg-paper sheet")}
${block("Steps", "진행 순서", `<ol class="steps line">${STUDY_PROCEDURE.map((s) => `<li><h3>${s}</h3></li>`).join("")}</ol>`, "tight")}
${ctaBlock("한 텀만 먼저 다녀올 수도 있습니다", "뉴질랜드는 10주 단위라 한 텀 해 보고 결정해도 됩니다. 성적과 학년을 보고 시작 시점을 같이 잡겠습니다.", "추천 받고 싶어요")}`;
  page({ file: "study.html", title: `뉴질랜드·캐나다 중고등 유학 비교 — 비용·학제·관리 | ${BRAND}`, desc: "뉴질랜드 Waiuku College 연 3,200만원, 캐나다 나이아가라 교육청 연 4,250만원. 학제·졸업장·관리 방식 비교.", body, crumbs: trail, cur: "study" });
}

function buildStudyDetail(s) {
  const trail = [HOME, { label: "유학", href: "study.html" }, { label: s.name }];
  const body = `${pageHero({ trail, kicker: `Study abroad · ${s.en}`, h1: s.name, lead: s.tag, art: s.country, iso: s.iso, bgiso: s.iso, cta: `<a class="btn btn-t" href="#consult">이 과정 상담 신청 <span class="ar">→</span></a><a class="btn btn-o" href="study.html">두 나라 비교</a>` })}
<div class="wrap"><div class="tk rv" style="grid-template-columns:repeat(4,minmax(0,1fr))">
  <div><small>Who</small><b>${s.target.split(" (")[0].split(".")[0]}</b><span>${s.target.includes("(") ? s.target.slice(s.target.indexOf("(") + 1).replace(/\).*$/, "") : ""}</span></div>
  <div><small>Start</small><b>${s.unit}</b></div>
  <div><small>Diploma</small><b>${s.diploma.split(" (")[0]}</b><span>${s.diploma.includes("(") ? s.diploma.slice(s.diploma.indexOf("(") + 1, -1) : ""}</span></div>
  <div class="hl"><small>Cost</small><b>${s.price}</b><span>항공·비자·용돈 별도</span></div>
</div></div>
${block("School", "어떤 학교인가", `<div class="prose"><p>${s.schoolDesc}</p></div><ul class="pts" style="margin-top:40px">${s.points.map(([t, p], i) => `<li><span class="n">${pad(i + 1)}</span><h3>${t}</h3><p>${p}</p></li>`).join("")}</ul>${s.photos ? shots(s.photos) : ""}`)}
${block("Care", "현지에서 누가 챙기나", `<ul class="pts">${s.manage.map((m, i) => `<li style="grid-template-columns:60px 1fr"><span class="n">${pad(i + 1)}</span><p style="grid-column:2;font-size:18px;color:inherit">${m}</p></li>`).join("")}</ul>`, "bg-forest sheet")}
${block("Cost", "비용과 학기", `<div class="duo"><div class="box"><h3><i>+</i>${s.price}에 포함</h3><ul>${listItems(s.includes)}</ul></div><div class="box"><h3>Terms</h3><h4>${s.unit}</h4><p>${s.terms}</p></div></div><div class="note"><b>별도 비용</b><span>${s.priceNote}</span><b>방학과 그 뒤</b><span>${s.note}</span></div>`, "bg-paper sheet")}
${block("Steps", "진행 순서", `<ol class="steps line">${STUDY_PROCEDURE.map((x) => `<li><h3>${x}</h3></li>`).join("")}</ol><p style="margin-top:34px"><a class="more" href="${s.country === "canada" ? "camp-canada-3week.html" : "camp-newzealand.html"}">먼저 겨울캠프로 다녀와 보기 <span>→</span></a></p>`, "tight")}
${ctaBlock("성적표부터 같이 보겠습니다", "지금 성적으로 몇 학년에 들어갈 수 있는지, 서류는 무엇부터 준비해야 하는지 짚어 드리겠습니다.", s.name)}`;
  page({ file: `${s.slug}.html`, title: `${s.name} | ${s.en} · ${s.price} | ${BRAND}`, desc: `${s.tag}`.slice(0, 80), body, crumbs: trail, course: s.name, cur: "study" });
}

// ============================================================
// 세인트폴 대치 아카데미
// ============================================================
function buildStpaul() {
  const trail = [HOME, { label: STPAUL.name }];
  const faqs = [
    ["국내 학력으로 인정되나요?", STPAUL.notice],
    ["몇 학년부터 들어갈 수 있나요?", `${STPAUL.target}. ${STPAUL.intake}이며 학년당 12~22명 규모입니다.`],
    ["기숙사가 있나요?", "없습니다. 통학제 학교이고, 집이 멀어 통학이 어려우면 학교 근처 학사를 이용할 수 있습니다."],
  ];
  const body = `${pageHero({ trail, kicker: "SPASS · Seoul", h1: STPAUL.name, lead: STPAUL.tag, art: "seoul", iso: "SEL", bgiso: "SPA", cta: `<a class="btn btn-t" href="#consult">입학 상담 신청 <span class="ar">→</span></a>` })}
<div class="wrap"><div class="tk rv" style="grid-template-columns:repeat(4,minmax(0,1fr))">
  <div><small>Who</small><b>중2 ~ 고2 편입학</b><span>고3은 상담 후 결정</span></div>
  <div><small>Intake</small><b>2월 · 8월 학기</b><span>학년당 12~22명</span></div>
  <div><small>Size</small><b>전교 95명</b><span>전 과목 영어 수업</span></div>
  <div class="hl"><small>Tuition</small><b>2,540만원</b><span>연간 학비</span></div>
</div></div>
<section class="blk"><div class="wrap"><div class="notice rv"><b>먼저 알아 두실 것</b><p>${STPAUL.notice}</p></div></div></section>
${block("Facts", "학교 개요", `<div class="tw"><table class="tb narrow"><tbody>${STPAUL.facts.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join("")}</tbody></table></div>`, "tight")}
${block("A day", "하루와 방과 후", `<div class="duo"><div class="box"><h3>Schedule</h3><h4>9시부터 6교시</h4><p>${STPAUL.daily}</p></div><div class="box"><h3>Clubs</h3><h4>20개가 넘는 클럽</h4><p>${STPAUL.clubs}</p></div></div><div class="note"><b>진학 상담</b><span>${STPAUL.counseling}</span><b>학비</b><span>${STPAUL.price}. ${STPAUL.priceNote}</span></div>`, "bg-paper2 sheet")}
${block("Colleges", "졸업생이 간 대학", `<ul class="pts">${STPAUL.results.map((r, i) => `<li style="grid-template-columns:60px 1fr"><span class="n">${pad(i + 1)}</span><p style="grid-column:2;font-size:18px;color:inherit">${r}</p></li>`).join("")}</ul><p class="fine">학교 발표 자료 기준입니다.</p>`, "bg-forest sheet")}
${block("Q&A", "자주 나오는 질문", faqHtml(faqs), "bg-paper sheet")}
${block("Compare", "해외 유학과 견주어 보면", `<div class="prose"><p>집에서 다니기 때문에 홈스테이 적응이나 현지 생활 관리에 드는 부담이 없습니다. 대신 영어를 쓰는 환경은 학교 안으로 한정됩니다. 생활까지 영어권에서 해 보고 싶다면 <a href="study.html">뉴질랜드·캐나다 유학</a>이 맞고, 부모 곁에서 미국 대학 입시를 준비하고 싶다면 이쪽이 맞습니다.</p></div>`, "tight")}
${ctaBlock("입학 전에 상담부터 받으세요", "편입은 학기마다 자리가 정해져 있습니다. 학년과 영어 수준을 보고 가능한 시점을 알려 드리겠습니다.", STPAUL.name)}`;
  page({ file: "stpaul.html", title: `${STPAUL.name} | 대치동 8~12학년 영어 수업 과정 | ${BRAND}`, desc: "통학하며 다니는 8~12학년 과정. 전 과목 영어 수업, 중2~고2 편입학, 전교 95명, 연 학비 2,540만원.", body, crumbs: trail, course: STPAUL.name, cur: "stpaul", ld: [faqLd(faqs)] });
}

// ============================================================
// 대학 토플면제
// ============================================================
function buildCollege() {
  const trail = [HOME, { label: "대학 진학" }];
  const body = `${pageHero({ trail, kicker: "No TOEFL pathway", h1: "토플 없이 가는<br>미국·캐나다 대학", lead: ELC.tag, art: "globe", iso: "USA · CAN", bgiso: "ELC", cta: `<a class="btn btn-t" href="#consult">진학 상담 신청 <span class="ar">→</span></a>` })}
<div class="wrap"><div class="tk rv">${ELC.schedule.map(([k, v], i) => `<div${i === 0 ? ` class="hl"` : ""}><small>${["Open", "Course", "Depart", "Apply", "Seats"][i]}</small><b>${v.replace(/ \(6개월\)/, "")}</b><span>${k}</span></div>`).join("")}</div></div>
${block("About", ELC.name, `<div class="prose"><p>${ELC.intro}</p><p><strong>대상</strong> — ${ELC.target}</p><p><strong>위치</strong> — ${ELC.location}</p></div>`)}
${block("How it works", "이 길이 가능한 이유", `<ul class="pts">${ELC.points.map(([t, p], i) => `<li><span class="n">${pad(i + 1)}</span><h3>${t}</h3><p>${p}</p></li>`).join("")}</ul>`, "bg-forest sheet")}
${block("Intakes", "연 4회 전형", `<p class="hs-hint hs-1096">대학 출발 시기는 표를 옆으로 밀면 나옵니다.</p><div class="tw" tabindex="0" role="region" aria-label="연 4회 전형표, 칸 4개"><table class="tb"><thead><tr><th>전형</th><th>입학·개강</th><th>수강 기간</th><th>대학 출발</th></tr></thead><tbody>${ELC.intakes.map((r) => `<tr><th>${r[0]}</th><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join("")}</tbody></table></div>`, "bg-paper sheet")}
${block("Admission", "선발 과정과 서류", `<div class="duo"><div class="box"><h3>Process</h3><ul>${ELC.admission.map((x) => `<li>${x}</li>`).join("")}</ul></div><div class="box"><h3>Documents</h3><ul>${ELC.docs.map((x) => `<li>${x}</li>`).join("")}</ul></div></div><div class="note"><b>비용</b><span>${ELC.price}</span></div>`, "tight")}
${ctaBlock("지금 성적으로 갈 수 있는 대학부터", "고3이냐 재수냐 검정고시냐에 따라 길이 다릅니다. 해당되는 쪽으로 대학과 전형을 추려 드리겠습니다.", ELC.name)}`;
  page({ file: "college.html", title: `토플 없이 미국·캐나다 대학 진학 — 국내 6개월 ESL 과정 | ${BRAND}`, desc: "고3·재수생·검정고시생 대상. 국내 6개월 공인 ESL 뒤 TOEFL·SAT·내신 없이 파트너 대학 진학. 2027년 1월 개강.", body, crumbs: trail, course: ELC.name, cur: "college" });
}

// ============================================================
// 그 밖의 길
// ============================================================
function buildPathway() {
  const trail = [HOME, { label: "그 밖의 길" }];
  const body = `${pageHero({ trail, kicker: "More gates", h1: "교환학생 · 기숙학교<br>· 입학 컨설팅", lead: "캠프와 관리형 유학 말고도 길이 있습니다. 비용도 기간도 생활 방식도 서로 많이 달라 하나씩 따로 봐야 합니다.", art: "globe" })}
${PATHWAYS.map((p, i) => block(p.en, p.name, `<p class="mono" style="margin-bottom:18px;opacity:.7">${p.kicker}</p><div class="prose">${p.body.map((t) => `<p>${t}</p>`).join("")}</div>${p.facts.length ? `<div class="box" style="margin-top:30px"><dl style="display:grid;grid-template-columns:minmax(110px,auto) 1fr;gap:14px 24px">${p.facts.map(([k, v]) => `<dt style="font-weight:800;letter-spacing:-.02em">${k}</dt><dd style="color:var(--ink-2)">${v}</dd>`).join("")}</dl></div>` : ""}<p style="margin-top:28px"><a class="btn btn-o btn-s" href="#consult" data-course="${esc(p.name)}">${p.name} 상담 <span class="ar">→</span></a></p>`, i % 2 ? "bg-paper2 sheet" : i ? "bg-paper sheet" : "", p.id)).join("\n")}
${ctaBlock("어느 길인지부터 같이 정합니다", "교환학생이 맞는지 유학이 맞는지, 그것부터 말씀드리겠습니다.", "추천 받고 싶어요")}`;
  page({ file: "pathway.html", title: `미국 교환학생 · EF Academy · 해외 대학 입학 컨설팅 | ${BRAND}`, desc: "미국 공립 교환학생 1년, EF Academy 기숙학교, 성적표에서 시작하는 대학 컨설팅, 세인트폴 클락.", body, crumbs: trail });
}

// ============================================================
// 안전·운영
// ============================================================
function buildSafety() {
  const trail = [HOME, { label: "안전·운영" }];
  const local = CAMPS.filter((c) => c.safety);
  const body = `${pageHero({ trail, kicker: "Care & rules", h1: "안전과<br>운영 원칙", lead: "홈스테이를 어떻게 고르는지, 사고가 났을 때 누가 어떤 순서로 움직이는지, 취소하면 얼마가 돌아오는지.", art: "canada" })}
${block("Care", "여섯 가지 원칙", `<ul class="pts">${COMMON.safety.map(([t, p], i) => `<li><span class="n">${pad(i + 1)}</span><h3>${t}</h3><p>${p}</p></li>`).join("")}</ul>`)}
${block("On campus", "단체 숙소 과정의 안전 관리", `<div class="duo">${local.map((c) => `<div class="box"><h3>${c.iso}</h3><h4>${c.short}</h4><ul>${c.safety.map((s) => `<li>${s}</li>`).join("")}</ul></div>`).join("")}</div>`, "bg-paper2 sheet")}
<section class="blk bg-paper sheet" id="apply"><div class="wrap blk-h"><header class="rv"><span class="serif">Apply</span><h2>신청 절차</h2></header><div class="rv d1"><ol class="steps">${COMMON.steps.map(([t, p]) => `<li><h3>${t}</h3><p>${p}</p></li>`).join("")}</ol><p class="fine">말레이시아·필리핀 과정은 절차가 조금 다릅니다. 각 과정 페이지와 상담에서 안내합니다.</p></div></div></section>
<section class="blk tight" id="refund"><div class="wrap blk-h"><header class="rv"><span class="serif">Refund</span><h2>환불 규정</h2></header><div class="rv d1"><div class="tw"><table class="tb narrow"><tbody>${COMMON.refund.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join("")}</tbody></table></div><div class="prose" style="margin-top:22px"><p style="font-size:15.5px">천재지변이나 항공 지연처럼 주관사가 통제할 수 없는 사유에는 별도 기준이 적용됩니다. 말레이시아·필리핀 과정은 운영 규정이 일부 다를 수 있습니다. 계약 전 상담에서 규정 전문을 안내해 드립니다.</p></div></div></div></section>
${ctaBlock("걱정되는 점부터 물어보세요", "알레르기나 복용 중인 약, 아이 성격은 미리 알수록 홈스테이 배정이 정확해집니다.")}`;
  page({ file: "safety.html", title: `해외캠프 안전 관리 · 신청 절차 · 환불 규정 | ${BRAND}`, desc: "홈스테이 검증, 인솔자와 현지 관리자, 네이버 밴드 공유, 1억원 여행자보험, 3단계 규정, 환불 기준.", body, crumbs: trail, cur: "safety" });
}

// ============================================================
// FAQ · 소개 · 404
// ============================================================
function buildFaq() {
  const trail = [HOME, { label: "FAQ" }];
  const groups = CAMPS.filter((c) => c.faq.length);
  const all = [...COMMON.faq, ...groups.flatMap((c) => c.faq.map(([q, a]) => [`[${c.short}] ${q}`, a]))];
  const body = `${pageHero({ trail, kicker: "Questions", h1: "자주 묻는 질문", lead: "어느 과정이든 같은 답이 나오는 질문이 앞쪽, 과정마다 답이 갈리는 질문이 뒤쪽입니다.", art: "japan" })}
<section class="blk"><div class="wrap-n"><div class="sh one"><div class="rv">${eb("Common", "")}<h2>공통 질문</h2></div></div><div class="rv d1">${faqHtml(COMMON.faq)}</div></div></section>
${groups.map((c, i) => `<section class="blk${i === 0 ? " bg-paper2 sheet" : " bg-paper2 tight"}"><div class="wrap-n"><div class="sh one"><div class="rv">${eb(c.iso, c.city)}<h2><a href="${c.slug}.html">${c.short}</a></h2></div></div><div class="rv d1">${faqHtml(c.faq)}</div></div></section>`).join("\n")}
${ctaBlock("여기 없는 질문은 상담으로 물어보세요", "문의 내용 칸에 적어 주시면 그 부분부터 답하겠습니다.")}`;
  page({ file: "faq.html", title: `해외캠프·스쿨링 자주 묻는 질문 | ${BRAND}`, desc: "영어를 못해도 되는지, 홈스테이 배정, 휴대폰, 용돈, 유학 연장까지. 과정별로 답이 다른 질문도 따로 정리.", body, crumbs: trail, cur: "faq", ld: [faqLd(all)] });
}

function buildAbout() {
  const trail = [HOME, { label: "소개" }];
  const body = `${pageHero({ trail, kicker: `About ${SITE.brandEn.toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase())}`, h1: `방학 한 번으로<br>시작하는 길`, lead: `${josa(BRAND, "은", "는")} 방학 동안 다녀오는 해외캠프에서 중·고등 유학, 대학 진학까지 이어지는 과정을 안내하고 상담을 연결합니다.`, art: "philippines" })}
${block("What we do", "안내하는 방식", `<ul class="pts">${ABOUT.map(([t, p], i) => `<li><span class="n">${pad(i + 1)}</span><h3>${t}</h3><p>${p}</p></li>`).join("")}</ul>`)}
${block("Programs", "안내하는 과정", `<ul class="tags">${[...CAMPS.map((c) => [c.short, c.slug + ".html"]), ...STUDY.map((s) => [s.name, s.slug + ".html"]), [STPAUL.name, "stpaul.html"], ["대학 토플면제교육원", "college.html"], ...PATHWAYS.map((p) => [p.name, "pathway.html#" + p.id])].map(([n, h]) => `<li><a href="${h}">${n}</a></li>`).join("")}</ul>`, "bg-forest sheet")}
${block("Source", "자료에 대하여", `<div class="prose"><p>이 사이트에 적힌 일정, 비용, 학교 정보는 운영사 자료를 기준으로 합니다. 항공과 현지 사정에 따라 달라질 수 있어 신청 전에 상담에서 최신 내용을 다시 확인해 드립니다. ${SITE.source}.</p><p>문의는 상담 신청 양식이나 화면 아래의 전화 상담 버튼을 이용해 주세요. 개인정보 관련 문의는 ${SITE.privacyEmail} 으로 받습니다.</p></div>`, "bg-paper sheet")}
${ctaBlock("상담은 부담 없이 신청하세요", "학년과 궁금한 점만 남겨 주시면 됩니다.")}`;
  page({ file: "about.html", title: `${BRAND} 소개 | ${SITE.tagline}`, desc: "방학 해외캠프에서 중·고등 유학, 대학 진학까지. 학교·교육청과 직접 제휴한 과정만 안내합니다.", body, crumbs: trail });
}

function build404() {
  const body = `<section class="nf"><div class="wrap"><b aria-hidden="true">404</b><h1 style="font-size:clamp(26px,4vw,44px);letter-spacing:-.045em;margin:20px 0 10px">이 편은 운항하지 않습니다</h1><p style="color:var(--ink-2)">주소가 바뀌었거나 없는 페이지입니다.</p><p style="margin-top:30px"><a class="btn btn-k" href="index.html">홈으로 <span class="ar">→</span></a></p></div></section>`;
  page({ file: "404.html", title: `페이지를 찾을 수 없습니다 | ${BRAND}`, desc: "주소가 바뀌었거나 없는 페이지입니다.", body, index: false });
}

// ============================================================
// 실행
// ============================================================
buildHome();
buildCamps();
CAMPS.forEach(buildCamp);
buildStudy();
STUDY.forEach(buildStudyDetail);
buildStpaul();
buildCollege();
buildPathway();
buildSafety();
buildFaq();
buildAbout();
build404();

for (const f of fs.readdirSync(OUT)) if (f.endsWith(".html")) fs.unlinkSync(path.join(OUT, f));
PAGES.forEach((p) => fs.writeFileSync(path.join(OUT, p.file), p.html));
fs.copyFileSync(path.join(ASSETS, "style.css"), path.join(OUT, "style.css"));
fs.copyFileSync(path.join(ASSETS, "app.js"), path.join(OUT, "app.js"));
for (const f of fs.readdirSync(path.join(ASSETS, "img"))) fs.copyFileSync(path.join(ASSETS, "img", f), path.join(OUT, "img", f));
if (fs.existsSync(path.join(ASSETS, "og-image.png"))) fs.copyFileSync(path.join(ASSETS, "og-image.png"), path.join(OUT, "og-image.png"));

fs.mkdirSync(path.join(__dirname, "tools"), { recursive: true });
fs.writeFileSync(path.join(__dirname, "tools", "og.html"), `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><title>og</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&amp;family=DM+Mono:wght@400;500&amp;family=Instrument+Serif:ital@1&amp;display=swap">
<style>*{box-sizing:border-box;margin:0}body{width:1200px;height:630px;overflow:hidden;font-family:"Pretendard Variable",Pretendard,sans-serif;color:#10231c;background:radial-gradient(700px 480px at 88% 10%,rgba(255,210,94,.7),transparent 62%),radial-gradient(560px 400px at 0 100%,rgba(191,227,242,.85),transparent 62%),#f5f0e6;padding:64px 72px;position:relative}
.top{display:flex;align-items:center;gap:14px;font-weight:800;font-size:30px;letter-spacing:-.03em}.top svg{width:46px;height:46px}.top span{font-family:"DM Mono",monospace;font-weight:500;font-size:15px;letter-spacing:.16em;color:#3c4f47;padding-left:14px;border-left:1px solid rgba(16,35,28,.2)}
h1{font-size:92px;line-height:1.07;letter-spacing:-.055em;font-weight:800;margin-top:66px}h1 em{display:block;font-family:"Instrument Serif",serif;font-style:italic;font-weight:400;color:#ff5b24;letter-spacing:-.02em;font-size:100px;line-height:1}
.strip{position:absolute;left:72px;right:72px;bottom:58px;display:flex;align-items:center;justify-content:space-between;background:#10231c;color:#f5f0e6;border-radius:22px;padding:22px 30px;font-family:"Bricolage Grotesque",sans-serif;font-weight:800;font-size:30px;letter-spacing:.04em}.strip i{font-style:normal;color:#ff5b24;font-size:22px}.strip b{font-family:"DM Mono",monospace;font-weight:500;font-size:16px;letter-spacing:.14em;color:#ffd25e}</style></head>
<body><div class="top">${LOGO_MARK.replace(' class="logo-mark"', "")}${BRAND}<span>${SITE.brandEn}</span></div>
<h1>겨울방학 동안만,<br>다른 나라 학생으로<em>just for winter.</em></h1>
<div class="strip"><b>${SITE.seasonEn}</b>${DESTINATIONS.map((d) => d.iso).join(" <i>✈</i> ")}</div></body></html>`);

const indexable = PAGES.filter((p) => p.index);
fs.writeFileSync(path.join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.map((p) => `<url><loc>${absUrl(p.file)}</loc><lastmod>${p.modified}</lastmod><priority>${p.file === "index.html" ? "1.0" : /^camp|^study|^stpaul|^college/.test(p.file) ? "0.8" : "0.6"}</priority></url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync(path.join(OUT, "robots.txt"), SITE.domainReady ? `User-agent: *\nAllow: /\nSitemap: ${SITE.baseUrl}/sitemap.xml\nSitemap: ${SITE.baseUrl}/rss.xml\n` : `User-agent: *\nDisallow: /\n`);
/* RSS — 네이버 서치어드바이저가 사이트맵과 따로 받는 수집 경로다.
   제목·설명은 구운 HTML 에서 꺼내 쓰므로 페이지를 고치면 RSS 도 같이 맞는다. */
const rssDate = (ymd) => {
  const D = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const d = new Date(ymd + "T09:00:00+09:00");
  return `${D[d.getUTCDay()]}, ${String(d.getUTCDate()).padStart(2, "0")} ${M[d.getUTCMonth()]} ${d.getUTCFullYear()} 09:00:00 +0900`;
};
const pick = (html, re) => { const m = html.match(re); return m ? m[1].trim() : ""; };
const rssItems = indexable
  .map((p) => ({
    url: absUrl(p.file),
    /* 꼬리의 브랜드만 떼어 낸다 — 홈처럼 브랜드가 앞에 오는 제목도 있어서
       마지막 칸을 무조건 자르면 제목이 통째로 날아간다(실측). */
    title: pick(p.html, /<title>([\s\S]*?)<\/title>/).replace(new RegExp("\\s*\\|\\s*" + BRAND + "\\s*$"), ""),
    desc: pick(p.html, /<meta name="description" content="([^"]*)"/),
    date: p.modified,
  }))
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
fs.writeFileSync(path.join(OUT, "rss.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${esc(BRAND)} — ${esc(SITE.tagline)}</title>
  <link>${SITE.baseUrl}/</link>
  <atom:link href="${SITE.baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
  <description>${esc(SITE.season)} 해외캠프·유학 과정 안내. 캐나다 · 뉴질랜드 · 일본 · 말레이시아 · 필리핀.</description>
  <language>ko</language>
  <lastBuildDate>${rssDate(rssItems[0] ? rssItems[0].date : todayKst())}</lastBuildDate>
${rssItems.map((it) => `  <item>
    <title>${esc(it.title)}</title>
    <link>${it.url}</link>
    <guid isPermaLink="true">${it.url}</guid>
    <pubDate>${rssDate(it.date)}</pubDate>
    <description>${esc(it.desc)}</description>
  </item>`).join("\n")}
</channel>
</rss>
`);
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
// CNAME 은 쓰지 않는다 — 2026-09-22 부터 Cloudflare Pages 로 배포한다(커스텀 도메인은 CF 쪽 설정).
// GitHub Pages 로 되돌릴 일이 생기면 아래 한 줄을 살리고 저장소 Pages 를 다시 켤 것.
//   if (SITE.domainReady) fs.writeFileSync(path.join(OUT, "CNAME"), SITE.baseUrl.replace(/^https?:\/\//, "") + "\n");
fs.rmSync(path.join(OUT, "CNAME"), { force: true });
// IndexNow 공용 키 (전문과외 워커의 중앙 크론이 이 파일을 확인한다)
fs.writeFileSync(path.join(OUT, "5e5ad86af25533efae3948773b676a6c.txt"), "5e5ad86af25533efae3948773b676a6c");

console.log(`✓ ${PAGES.length}페이지 → docs/  (css ${CSS_VER} · js ${JS_VER})`);
if (!SITE.domainReady) console.warn("⚠ domainReady=false — 전 페이지 noindex, robots Disallow. 도메인 확정 후 data.js SITE 를 고칠 것");
if (!SITE.formEndpoint) console.warn("⚠ formEndpoint 미설정 — 상담 양식 데모 모드(전송 안 함)");
if (!SITE.trackKey) console.warn("⚠ trackKey 미설정 — t.js 미삽입");
