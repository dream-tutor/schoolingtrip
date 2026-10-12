// 글 페이지 검사 — build.js 끝에서 불린다. 오류가 있으면 종료 코드 1(배포하지 말 것), 경고는 목록만.
//   규칙의 근거는 content/WRITING.md 와 묶음 CLAUDE.md '내용 규칙'.
const fs = require("fs");
const path = require("path");

const GROUPS = ["ask", "camp", "pick", "study", "stpaul", "college", "path", "grade", "term"];
const ARTS = ["canada", "newzealand", "japan", "malaysia", "philippines", "seoul", "globe"];
const SEC_KEYS = ["en", "h2", "p", "table", "pts", "duo", "list", "steps", "note", "after"];
const strip = (s) => String(s).replace(/<[^>]+>/g, "");

// 화면에 쓰면 안 되는 것
const BANNED = [
  [/0\d{1,2}[-.\s)]\d{3,4}[-.\s]\d{4}/, "전화번호 글자"],
  [/국제학교/, "'국제학교' 표기"],
  [/미국\s*(교과\s*과정|커리큘럼|교육\s*과정|과정을\s*그대로)/, "세인트폴 금지 표현(미국 교과과정·커리큘럼)"],
  [/바인그룹|유학사업팀|솔루트/, "운영사 내부 명칭"],
  [/수수료|리더\s*금액/, "내부 정보(수수료)"],
];
// 자기 해설·AI 말투·과장
const TONE = [
  [/정리했습니다|정리해\s*두었|정리해\s*드립니다|다룹니다|다루겠습니다|살펴보겠|살펴봅니다|살펴보았|알아보겠|알아봅니다|알아봅시다|소개합니다|적어\s*두었습니다|모았습니다|담았습니다|짚어\s*보겠|이\s*글에서는|이\s*페이지에서는|아래에서\s*설명/, "자기 해설"],
  [/최고의|완벽한|완벽하게|검증된|압도적|확실한\s*효과|보장합니다|보장됩니다|100%|합격률|단기간에|놀라운|특별한\s*경험|잊지\s*못할|소중한\s*경험|한\s*단계\s*성장/, "과장·보증 표현"],
  [/저절로|수밖에\s*없는|해\s*보세요!|하세요!|일까요\?\s*$|뿐만\s*아니라|그렇다면|결론부터|한마디로|무엇보다도/, "AI 말투"],
  [/선착순|마감\s*임박|서두르|놓치지\s*마|지금\s*바로/, "재촉 문구"],
  [/초개인화|솔루션|니즈|인사이트|레버리지/, "번역투"],
];
// 금액·기간은 토큰으로({{camp-x.price}}) — 숫자를 직접 적으면 시즌이 바뀔 때 어긋난다
const RAW_FACT = /(?<![\d,])(599|594|890|1,290|690|810|1,330|3,200|4,250|2,920)만원/;

module.exports = function check({ PAGES, ARTICLES, tokErrors, relErrors, BRAND }) {
  const err = [], warn = [];
  const files = new Set(PAGES.map((p) => p.file));
  // 한 파일만 검사할 때는 아직 안 쓰인 글(plan.json)로 가는 링크를 허용한다
  //   (용어 허브 terms.html 은 용어 글이 있어야 생기므로 같이 허용)
  if (process.env.CHECK_FILE) for (const s of [...require("./content/plan.json"), "terms", "guide"]) files.add(s + ".html");
  const seen = new Set();
  const builtin = new Set(PAGES.map((p) => p.file.replace(/\.html$/, "")).filter((s) => !ARTICLES.some((a) => a.slug === s)));

  for (const a of ARTICLES) {
    const at = `${a._file} · ${a.slug}`;
    if (!/^[a-z0-9-]+$/.test(a.slug || "")) err.push(`${at}: slug 형식`);
    if (seen.has(a.slug) || builtin.has(a.slug)) err.push(`${at}: slug 중복`);
    seen.add(a.slug);
    if (!GROUPS.includes(a.group)) err.push(`${at}: group '${a.group}'`);
    if (a.group === "camp" && !/^camp-/.test(a.parent || "")) err.push(`${at}: camp 글은 parent 가 과정 slug`);
    if (a.group === "ask" && !a.topic) err.push(`${at}: ask 글은 topic 필요`);
    if (!ARTS.includes(a.art)) err.push(`${at}: art '${a.art}'`);
    for (const k of ["title", "desc", "h1", "kicker", "lead"]) if (!a[k] || typeof a[k] !== "string") err.push(`${at}: ${k} 없음`);
    if (a.kicker && /[^\x20-\x7E·]/.test(a.kicker)) err.push(`${at}: kicker 는 영문만 (${a.kicker})`);
    if (!Array.isArray(a.sections) || a.sections.length < 3) err.push(`${at}: sections 3개 이상`);
    for (const s of a.sections || []) {
      if (!s.en || /[^\x20-\x7E]/.test(s.en)) err.push(`${at}: 섹션 en 은 영문만 (${s.en})`);
      if (!s.h2) err.push(`${at}: 섹션 h2 없음`);
      for (const k of Object.keys(s)) if (!SEC_KEYS.includes(k)) err.push(`${at}: 섹션에 모르는 키 '${k}'`);
      if (s.table && (!Array.isArray(s.table.head) || !Array.isArray(s.table.rows) || s.table.rows.some((r) => r.length !== s.table.head.length))) err.push(`${at}: 표 칸 수 불일치 (${s.h2})`);
    }
    const full = JSON.stringify({ ...a, _file: 0, slug: 0, related: 0, camps: 0, parent: 0, kicker: 0, art: 0 });
    const text = strip(full.replace(/\\"/g, '"'));
    const strs = (v) => (typeof v === "string" ? [v] : Array.isArray(v) ? v.flatMap(strs) : v && typeof v === "object" ? Object.entries(v).filter(([k]) => k !== "en" && k !== "label").flatMap(([, x]) => strs(x)) : []);
    const bodyLen = strip(strs(a.sections || []).join("")).replace(/\s/g, "").length;
    const min = a.group === "term" ? 450 : 900;
    if (bodyLen < min) err.push(`${at}: 본문 ${bodyLen}자 — ${min}자 이상`);
    for (const [re, why] of BANNED) { const m = text.match(re); if (m) err.push(`${at}: ${why} — "${m[0]}"`); }
    for (const [re, why] of TONE) { const m = text.match(re); if (m) err.push(`${at}: ${why} — "${m[0]}"`); }
    const raw = full.match(RAW_FACT);
    if (raw) err.push(`${at}: 금액 "${raw[0]}" 을 직접 적음 — 토큰을 쓸 것`);
    if ((a.group === "stpaul" || /stpaul/.test(a.slug)) && /졸업장을\s*받|교재비|입학금|관리비/.test(text)) err.push(`${at}: 세인트폴 — 졸업장·교재비·입학금·관리비 언급 금지`);
    if ((text.match(/!/g) || []).length > 0) err.push(`${at}: 느낌표`);
    if (/—|–/.test(text)) err.push(`${at}: 줄표(—) — 쉼표나 마침표로 끊을 것`);
    if (/<(?!\/?(a|strong|br)\b)[a-z]/i.test(full.replace(/\\"/g, '"'))) err.push(`${at}: a·strong·br 외 태그`);
    // 제목·설명문
    const t = `${a.title} | ${BRAND}`;
    if (t.length > 40) err.push(`${at}: 제목 ${t.length}자 (브랜드 포함 40자) — "${a.title}"`);
    const d = a.desc || "";
    if (d.length > 80) err.push(`${at}: 설명문 ${d.length}자 (80자)`);
    if (d.length < 40) warn.push(`${at}: 설명문 ${d.length}자 — 짧음`);
    if (/(니다|세요|어요)\.?$/.test(d.trim()) || /…|\.\.\./.test(d) || /찾으신다면|부터\s.*까지/.test(d)) err.push(`${at}: 설명문 말투 (명사로 끊을 것) — "${d}"`);
    if (/:/.test(a.title)) warn.push(`${at}: 제목에 ':'`);
  }
  tokErrors.forEach((e) => err.push(e));
  relErrors.forEach((e) => err.push(e));

  // 중복 제목·설명문 (전 페이지)
  const T = {}, D = {};
  for (const p of PAGES) {
    const t = (p.html.match(/<title>([^<]*)/) || [])[1], d = (p.html.match(/<meta name="description" content="([^"]*)/) || [])[1];
    (T[t] = T[t] || []).push(p.file); (D[d] = D[d] || []).push(p.file);
  }
  for (const [k, v] of Object.entries(T)) if (v.length > 1) err.push(`제목 중복: ${v.join(", ")}`);
  for (const [k, v] of Object.entries(D)) if (v.length > 1) err.push(`설명문 중복: ${v.join(", ")}`);

  // 내부 링크 (전 페이지) — 없는 파일로 가는 링크, 쿼리로 같은 페이지를 여는 링크
  for (const p of PAGES) {
    const hrefs = [...p.html.matchAll(/href="([^"#:]+?\.html)(\?[^"#]*)?(#[^"]*)?"/g)];
    for (const m of hrefs) {
      if (/^https?:/.test(m[1])) continue;
      if (!files.has(m[1])) err.push(`${p.file}: 없는 페이지로 가는 링크 ${m[1]}`);
      if (m[2]) err.push(`${p.file}: 쿼리 붙은 내부 링크 ${m[0]}`);
    }
    if ((p.html.match(/<h1[\s>]/g) || []).length !== 1) err.push(`${p.file}: h1 ${(p.html.match(/<h1[\s>]/g) || []).length}개`);
    if (/alt=""/.test(p.html)) warn.push(`${p.file}: 빈 alt`);
  }

  if (warn.length) console.warn(`\n⚠ 경고 ${warn.length}건\n` + warn.slice(0, 40).map((x) => "  " + x).join("\n"));
  if (err.length) {
    console.error(`\n✗ 원고 오류 ${err.length}건 — 배포하지 말 것\n` + err.map((x) => "  " + x).join("\n"));
    fs.writeFileSync(path.join(__dirname, "check-report.txt"), err.join("\n") + "\n");
    process.exitCode = 1;
  } else {
    fs.rmSync(path.join(__dirname, "check-report.txt"), { force: true });
    console.log(`✓ 원고 검사 통과 (글 ${ARTICLES.length}편)`);
  }
};
