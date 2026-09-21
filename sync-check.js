// ============================================================
// 러닝트래블(edujourney) data.js 와 일정·비용·마감일이 어긋난 곳 찾기 — 실행: node sync-check.js
//   두 사이트는 같은 운영사 과정을 안내하지만 저장소가 따로라 자동으로 맞춰지지 않는다.
//   시즌 갱신 때 한쪽만 고치는 일을 막으려고 둔 점검 스크립트다(문장은 비교하지 않는다).
//   형제 폴더 위치가 다르면 EDUJOURNEY_DATA 환경변수로 data.js 경로를 넘긴다.
// ============================================================
const path = require("path");
const fs = require("fs");
const mine = require("./data.js");
const otherPath = process.env.EDUJOURNEY_DATA || path.join(__dirname, "..", "..", "러닝트래블(edujourney)", "site", "data.js");
if (!fs.existsSync(otherPath)) { console.log("러닝트래블 data.js 를 찾지 못했습니다:", otherPath); process.exit(0); }
const other = require(otherPath);

const koDate = (s) => { const m = String(s).match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/); return m ? `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}` : null; };
const firstDot = (s) => { const m = String(s).match(/(\d{4})\.(\d{1,2})\.(\d{1,2})/); return m ? `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}` : null; };
const norm = (s) => String(s).replace(/\s+/g, "");
let diff = 0;
const say = (name, field, a, b) => { diff++; console.log(`✗ ${name} · ${field}\n    여기      : ${a}\n    러닝트래블: ${b}`); };

for (const c of mine.CAMPS) {
  const o = other.CAMPS[c.ref];
  if (!o) { say(c.name, "과정", "있음", "없음(슬러그 " + c.ref + ")"); continue; }
  if (norm(c.priceFull || c.price) !== norm(o.price)) say(c.name, "참가비", c.priceFull || c.price, o.price);
  if (koDate(o.deadline) !== c.deadline) say(c.name, "신청 마감", c.deadline, o.deadline);
  if (firstDot(o.periodShort) !== c.depart) say(c.name, "출발일", c.depart, o.periodShort);
  if (norm(c.capacity).replace(/명/g, "") !== norm(o.capacity).replace(/명/g, "")) say(c.name, "정원", c.capacity, o.capacity);
}
for (const k of Object.keys(other.CAMPS)) if (!mine.CAMPS.some((c) => c.ref === k)) say(other.CAMPS[k].name, "과정", "없음", "러닝트래블에만 있음");
for (const s of mine.STUDY) {
  const o = other.STUDY[s.slug];
  if (!o) continue;
  if (!norm(o.price).startsWith(norm(s.price))) say(s.name, "연 비용", s.price, o.price);
}
if (!norm(other.STPAUL.price).includes(norm("2,540만원"))) say(mine.STPAUL.name, "연간 학비", mine.STPAUL.price, other.STPAUL.price);
console.log(diff ? `\n어긋난 곳 ${diff}건 — 운영사 자료 기준으로 맞는 쪽을 확인해 두 사이트를 같이 고칠 것` : "✓ 일정·비용·마감일·정원이 러닝트래블과 일치합니다");
